-- H4-011/012: operational versions on retained H2 identities, not a second Booking.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'MODIFICATION_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b06_modifications(modification_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),admin_scope text not null,initial_operation_id uuid not null);
create table crm_private.b06_modification_operations(operation_id uuid primary key,modification_id uuid not null references crm_private.b06_modifications(modification_id),admin_scope text not null,actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,result jsonb not null,result_revision bigint not null,recorded_at timestamptz not null default clock_timestamp());
create table crm_private.b06_modification_revisions(modification_id uuid not null references crm_private.b06_modifications(modification_id),revision bigint not null check(revision>0),admin_scope text not null,operation_id uuid not null unique references crm_private.b06_modification_operations(operation_id) deferrable initially deferred,action_kind text not null,event jsonb not null,before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),evidence_id uuid not null references crm_private.b07_records(record_id),source_ref text not null,reason text not null,occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(modification_id,revision));
create table crm_private.b04_operational_versions(booking_id uuid not null references crm_private.b04_bookings(booking_id),scope_kind text not null check(scope_kind in('booking','service','night','contribution')),scope_id uuid not null,service_id uuid references crm_private.b04_services(service_id),revision bigint not null check(revision>1),admin_scope text not null,modification_id uuid not null references crm_private.b06_modifications(modification_id),part_id uuid not null,material jsonb not null,before_data jsonb not null,operation_id uuid not null references crm_private.b06_modification_operations(operation_id) deferrable initially deferred,primary key(scope_kind,scope_id,revision));
alter table crm_private.b06_modifications add foreign key(initial_operation_id) references crm_private.b06_modification_operations(operation_id) deferrable initially deferred;
alter table crm_private.b06_modification_operations add foreign key(modification_id,result_revision) references crm_private.b06_modification_revisions(modification_id,revision) deferrable initially deferred;
create index modification_booking on crm_private.b06_modifications(admin_scope,booking_id);
do $$declare t text;r text;begin foreach t in array array['b06_modifications','b06_modification_operations','b06_modification_revisions','b04_operational_versions'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy modification_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);execute format('create policy modification_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger modification_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
create function crm_private.modification_scope(x jsonb,bid uuid,s text) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare r jsonb;k text:=x->>'kind';id uuid:=(x->>'id')::uuid;sid uuid:=(x->>'serviceId')::uuid;begin
 if x-array['kind','id','serviceId']<>'{}'::jsonb or not(x?&array['kind','id']) then raise exception 'MODIFICATION_SCOPE_REQUIRED:E3';end if;
 if k='booking' then select jsonb_build_object('id',booking_id,'revision',1,'estimated',null,'confirmed',null,'cancelled',false) into r from crm_private.b04_bookings where booking_id=id and booking_id=bid and admin_scope=s;
 elsif k='service' then select jsonb_build_object('id',service_id,'revision',revision,'serviceRevisionId',service_revision_id,'nature',nature,'variant',applied->'variant','provider',applied->'provider','schedule',applied->'schedule','place',applied->'place','date',(select case when bool_or(crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',c.service_id),bid,s)->'date'='null'::jsonb) then null else min((crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',c.service_id),bid,s)->>'date')::date) end from crm_private.b04_contributions c where c.service_id=id),'capacity',null,'conditions',null,'cancelled',false) into r from crm_private.b04_services where service_id=id and booking_id=bid and admin_scope=s;sid:=id;
 elsif k='night' then select jsonb_build_object('id',n.night_id,'revision',1,'date',n.night_date,'cancelled',false) into r from crm_private.b04_nights n join crm_private.b04_services v using(service_id) where n.night_id=id and v.booking_id=bid and n.service_id=sid and n.admin_scope=s;
 elsif k='contribution' then select jsonb_build_object('id',c.contribution_id,'revision',1,'quantity',c.quantity::text,'attendees',c.attendees,'certainty',c.certainty,'unitRevisionId',c.unit_revision_id,'date',l.service_date,'cancelled',false) into r from crm_private.b04_contributions c join crm_private.b03_proposal_lines l on l.line_id=c.line_id and l.version_id=c.version_id where c.contribution_id=id and c.booking_id=bid and c.service_id=sid and c.admin_scope=s;
 else raise exception 'MODIFICATION_SCOPE_REQUIRED:E3';end if;
 if r is null then raise exception 'MODIFICATION_DENIED';end if;
 select material into r from crm_private.b04_operational_versions where scope_kind=k and scope_id=id and booking_id=bid and admin_scope=s order by revision desc limit 1;
 if not found then
  -- Recursion is avoided: baseline is recovered only when there is no operational version.
  if k='booking' then r:=jsonb_build_object('id',bid,'revision',1,'estimated',null,'confirmed',null,'cancelled',false);
  elsif k='service' then select jsonb_build_object('id',service_id,'revision',revision,'serviceRevisionId',service_revision_id,'nature',nature,'variant',applied->'variant','provider',applied->'provider','schedule',applied->'schedule','place',applied->'place','date',(select case when bool_or(crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',c.service_id),bid,s)->'date'='null'::jsonb) then null else min((crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',c.service_id),bid,s)->>'date')::date) end from crm_private.b04_contributions c where c.service_id=id),'capacity',null,'conditions',null,'cancelled',false) into r from crm_private.b04_services where service_id=id;
  elsif k='night' then select jsonb_build_object('id',night_id,'revision',1,'date',night_date,'cancelled',false) into r from crm_private.b04_nights where night_id=id;
  else select jsonb_build_object('id',c.contribution_id,'revision',1,'quantity',c.quantity::text,'attendees',c.attendees,'certainty',c.certainty,'unitRevisionId',c.unit_revision_id,'date',l.service_date,'cancelled',false) into r from crm_private.b04_contributions c join crm_private.b03_proposal_lines l on l.line_id=c.line_id and l.version_id=c.version_id where c.contribution_id=id;end if;
 end if;return r;
end$$;
create function crm_private.modification_patch(x jsonb,current jsonb,k text,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare allowed text[];begin
 allowed:=case k when 'booking' then array['estimated','confirmed','cancelled'] when 'service' then array['date','schedule','place','variant','provider','capacity','conditions','cancelled'] when 'night' then array['date','cancelled'] else array['quantity','attendees','certainty','unitRevisionId','date','cancelled'] end;
 if jsonb_typeof(x) is distinct from 'object' or x='{}'::jsonb or x-allowed<>'{}'::jsonb then return false;end if;
 if x?'date' then if coalesce(x->>'date','')!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then return false;end if;perform (x->>'date')::date;end if;
 if x?'cancelled' and jsonb_typeof(x->'cancelled')<>'boolean' then return false;end if;
 if x?'attendees' and (coalesce(x->>'attendees','')!~'^[0-9]+$' or (x->>'attendees')::bigint<0) then return false;end if;
 if x?'quantity' and (coalesce(x->>'quantity','')!~'^[0-9]+(\.[0-9]+)?$' or (x->>'quantity')::numeric<0) then return false;end if;
 if x?'certainty' and x->>'certainty' not in('estimated','confirmed') then return false;end if;
 if x?'unitRevisionId' and not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(x->>'unitRevisionId')::uuid and r.admin_scope=s and i.item_kind='unit') then return false;end if;
 if x?'schedule' then
  if jsonb_typeof(x->'schedule') is distinct from 'object' or (x->'schedule')-array['requested','window','preference','alternatives','final','duration','recommendedArrival','sourceRef']<>'{}'::jsonb or not crm_private.invoice_text(x->'schedule'->'sourceRef') then return false;end if;
  if x->'schedule'?'final' and coalesce(x->'schedule'->>'final','')!~'^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](Z|[+-][0-9]{2}:[0-9]{2})$' then return false;end if;
  if x->'schedule'?'duration' and ((x->'schedule'->'duration')-array['minutes','sourceRef']<>'{}'::jsonb or coalesce(x->'schedule'->'duration'->>'minutes','')!~'^[0-9]+$' or not crm_private.invoice_text(x->'schedule'->'duration'->'sourceRef')) then return false;end if;
 end if;
 if x?'place' and jsonb_typeof(x->'place') not in('object','string','null') then return false;end if;
 if x?'provider' and x->'provider'<>'null'::jsonb and not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(x->>'provider')::uuid and r.admin_scope=s and i.item_kind='provider') then return false;end if;
 if x?'estimated' and coalesce(x->>'estimated','')!~'^[0-9]+$' then return false;end if;if x?'confirmed' and coalesce(x->>'confirmed','')!~'^[0-9]+$' then return false;end if;
 if x?'capacity' and ((x->'capacity')-array['quantity','unitRevisionId','sourceRef']<>'{}'::jsonb or not(x->'capacity'?&array['quantity','unitRevisionId','sourceRef']) or coalesce(x->'capacity'->>'quantity','')!~'^[0-9]+(\.[0-9]+)?$' or not crm_private.invoice_text(x->'capacity'->'sourceRef') or not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(x->'capacity'->>'unitRevisionId')::uuid and r.admin_scope=s and i.item_kind='unit')) then return false;end if;
 if x?'variant' and x->'variant' is distinct from current->'variant' and not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(x->>'variant')::uuid and r.admin_scope=s and i.item_kind='variant') then return false;end if;
 if x?'conditions' and not crm_private.invoice_text(x->'conditions') then return false;end if;
 return true;
end$$;
create function crm_private.modification_pending(bid uuid,sid uuid,nid uuid,s text) returns boolean language sql stable set search_path=pg_catalog,pg_temp as $$
 select exists(select 1 from crm_private.b06_modifications m cross join lateral(select after_data from crm_private.b06_modification_revisions where modification_id=m.modification_id order by revision desc limit 1) v cross join lateral jsonb_array_elements(v.after_data->'parts') p
 where m.booking_id=bid and m.admin_scope=s and p->'scope'->>'kind'<>'booking' and coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')=sid::text and (p->'scope'->>'kind'<>'night' or nid is null or p->'scope'->>'id'=nid::text) and (p->'scope'->>'kind'<>'contribution' or nid is null or exists(select 1 from crm_private.b04_night_occupancies o where o.night_id=nid and o.contribution_id=(p->'scope'->>'id')::uuid)) and p->'review'->'pending'='true'::jsonb)
$$;
create function crm_private.modification_source(src jsonb,bid uuid,sid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare v crm_private.b04_services;r crm_private.catalog_revisions;begin
 if jsonb_typeof(src) is distinct from 'object' or not(src?&array['kind','id','offeringRevisionId','counterpart','channel']) or src-array['kind','id','offeringRevisionId','counterpart','channel']<>'{}'::jsonb or not crm_private.invoice_text(src->'counterpart') then return false;end if;
 select * into v from crm_private.b04_services where booking_id=bid and service_id=sid and admin_scope=s;if not found then return false;end if;
 if v.nature='internal' then return src->>'kind'='internal' and src->'offeringRevisionId'='null'::jsonb and src->>'channel'='internal-record' and exists(select 1 from crm_private.crm_actors where actor_id=(src->>'id')::uuid and enabled and admin_scope=s);end if;
 select x.* into r from crm_private.catalog_revisions x join crm_private.catalog_items i using(item_id) where x.revision_id=(src->>'offeringRevisionId')::uuid and x.admin_scope=s and i.item_kind='offering';
 return src->>'kind'='provider' and src->>'channel' in('phone','whatsapp','email','provider-platform') and r.revision_id is not null and r.parent_revision_id=(src->>'id')::uuid and (r.related_revision_id=v.service_revision_id or r.related_revision_id=(v.applied->>'variant')::uuid) and (v.applied->'provider'='null'::jsonb or v.applied->'provider'=src->'id');
end$$;
create function crm_private.modification_dependencies(ds jsonb,p jsonb,bid uuid,opp uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare d jsonb;sid uuid:=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid;ok boolean;begin
 for d in select value from jsonb_array_elements(ds) loop
  if not(d?&array['kind','id','aspects','reason']) or d-array['kind','id','partId','aspects','reason']<>'{}'::jsonb or not crm_private.invoice_text(d->'reason') or jsonb_typeof(d->'aspects') is distinct from 'array' or jsonb_array_length(d->'aspects')=0 or not((p->'aspects') @> (d->'aspects')) then return false;end if;
  if d->>'kind'='requirement' then select exists(select 1 from crm_private.b07_requirements where requirement_id=(d->>'id')::uuid and booking_id=bid and admin_scope=s) into ok;
  elsif d->>'kind'='availability' then select exists(select 1 from crm_private.b04_availability av join crm_private.b04_availability_revisions r using(availability_id) where av.availability_id=(d->>'id')::uuid and av.booking_id=bid and av.admin_scope=s and coalesce(r.after_data->'response'->'coverage',r.after_data->'query'->'coverage')->>'serviceId'=sid::text) into ok;
  elsif d->>'kind'='confirmation' then select exists(select 1 from crm_private.b04_confirmations c join crm_private.b04_confirmation_facts f using(confirmation_id) where c.confirmation_id=(d->>'id')::uuid and c.booking_id=bid and c.admin_scope=s and f.material->'coverage'->>'serviceId'=sid::text) into ok;
  elsif d->>'kind'='hold' then select exists(select 1 from crm_private.b04_holds where hold_id=(d->>'id')::uuid and opportunity_id=opp and admin_scope=s) into ok;
  elsif d->>'kind'='incident' then select exists(select 1 from crm_private.b07_incidents where incident_id=(d->>'id')::uuid and booking_id=bid and admin_scope=s) into ok;
  elsif d->>'kind'='task' then select exists(select 1 from crm_private.b07_pending_tasks where task_id=(d->>'id')::uuid and admin_scope=s and identity->>'contextId'=bid::text) into ok;
  else return false;end if;if not ok then return false;end if;
 end loop;return true;
end$$;
create function crm_private.modification_proof(id uuid,target uuid,s text,claim text,at_time timestamptz) returns boolean language sql stable set search_path=pg_catalog,pg_temp as $$select coalesce(crm_private.payment_evidence(id,target,s,claim,at_time,true),false)$$;

-- Reopen only a documented material documentary dependency through the existing requirement history.
create function crm_private.modification_requirements(p jsonb,bid uuid,s text,actor uuid,eid uuid,at_time timestamptz,source text,reason text) returns void language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare dep jsonb;iid uuid;v crm_private.b07_requirement_revisions;state jsonb;basis jsonb;op uuid;res jsonb;begin
 for dep in select value from jsonb_array_elements(p->'dependencies') where value->>'kind'='requirement'
 union all select jsonb_build_object('kind','requirement','id',r.requirement_id,'aspects',jsonb_build_array(rv.after_data->'basis'->'context'->>'conditionKey'),'reason','Applied field changes the explicitly versioned documentary context') from crm_private.b07_requirements r cross join lateral(select after_data from crm_private.b07_requirement_revisions where requirement_id=r.requirement_id order by revision desc limit 1) rv where r.booking_id=bid and r.admin_scope=s and rv.after_data->'basis'->'scope'->>'serviceId'=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id') and (p->'scope'->>'kind'<>'night' or not(rv.after_data->'basis'->'scope'?'nightId') or rv.after_data->'basis'->'scope'->>'nightId'=p->'scope'->>'id') and (p->'desired')?(rv.after_data->'basis'->'context'->>'conditionKey') and p->'desired'->(rv.after_data->'basis'->'context'->>'conditionKey') is distinct from p->'before'->(rv.after_data->'basis'->'context'->>'conditionKey') and not exists(select 1 from jsonb_array_elements(p->'dependencies') d0 where d0->>'kind'='requirement' and d0->>'id'=r.requirement_id::text) loop
  if dep-array['kind','id','aspects','reason']<>'{}'::jsonb or not(dep?&array['kind','id','aspects','reason']) or not crm_private.invoice_text(dep->'reason') or not((p->'aspects') @> (dep->'aspects')) then raise exception 'MODIFICATION_DEPENDENCY_REQUIRED:E3';end if;
  iid:=(dep->>'id')::uuid;select x.* into v from crm_private.b07_requirements r join crm_private.b07_requirement_revisions x using(requirement_id) where r.requirement_id=iid and r.booking_id=bid and r.admin_scope=s order by x.revision desc limit 1;
  if v.requirement_id is null or (v.after_data->'basis'->'scope'?'serviceId' and v.after_data->'basis'->'scope'->>'serviceId'<>coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')) or (v.after_data->'basis'->'scope'?'nightId' and p->'scope'->>'kind'='night' and v.after_data->'basis'->'scope'->>'nightId'<>p->'scope'->>'id') then raise exception 'MODIFICATION_DENIED';end if;
  basis:=jsonb_set(v.after_data->'basis','{context,version}',to_jsonb((v.after_data->'basis'->'context'->>'version')||'/operational:'||(p->'applied'->'after'->>'revision')));
  if p->'desired'?(basis->'context'->>'conditionKey') then basis:=jsonb_set(basis,'{context,value}',to_jsonb(p->'desired'->>(basis->'context'->>'conditionKey')));end if;
  state:=v.after_data||jsonb_build_object('revision',v.revision+1,'basis',basis,'review',null,'incident',null,'status',case when v.after_data->'document'='null'::jsonb then 'Pendiente' else 'Recibido' end);op:=gen_random_uuid();
  res:=jsonb_build_object('id',iid,'replayed',false,'result',state);insert into crm_private.b07_requirement_operations values(op,iid,s,actor,encode(crm_crypto.digest(convert_to(state::text,'UTF8'),'sha256'),'hex'),res,v.revision+1,clock_timestamp());
  insert into crm_private.b07_requirement_revisions values(iid,v.revision+1,s,op,'change',jsonb_build_object('source','Booking Modification','dependency',dep,'scopeBefore',p->'before','scopeAfter',p->'applied'->'after'),v.after_data,state,actor,eid,source,reason,at_time,clock_timestamp());
 end loop;
end$$;
create function crm_private.modification_hold_link(link jsonb,terms jsonb,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare bid uuid:=(link->>'bookingId')::uuid;sid uuid:=(link->>'serviceId')::uuid;nid uuid:=(link->>'nightId')::uuid;token text;d date;begin
 token:=crm_private.modification_token(bid,sid,nid,null,s);if token=encode(crm_crypto.digest(convert_to('[]','UTF8'),'sha256'),'hex') then return true;end if;
 if link->>'scopeRevision' is distinct from token then return false;end if;
 d:=crm_private.modification_reference(case when nid is null then jsonb_build_object('kind','service','id',sid) else jsonb_build_object('kind','night','id',nid,'serviceId',sid) end,bid,s);return (terms->>'date')::date=d;
end$$;
create function crm_private.modification_reference(x jsonb,bid uuid,s text) returns date language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare result date;k text:=x->>'kind';begin
 if k in('service','night','contribution') then return (crm_private.modification_scope(x,bid,s)->>'date')::date;end if;
 if k not in('booking','modality') or (k='booking' and x->>'id'<>bid::text) then raise exception 'MODIFICATION_TEMPORAL_REQUIRED:E3';end if;
 select case when bool_or(v->'date'='null'::jsonb) then null else min((v->>'date')::date) end into result from crm_private.b04_contributions c cross join lateral(select crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',c.service_id),bid,s) v) z where c.booking_id=bid and c.admin_scope=s and (k='booking' or c.modality_id=(x->>'id')::uuid);return result;
end$$;
create function crm_private.modification_agenda(parts jsonb,bid uuid,s text) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare p jsonb;c jsonb;other jsonb;v record;r jsonb:='[]';start1 time;start2 time;dur1 integer;dur2 integer;begin
 for p in select value from jsonb_array_elements(parts) where value->'scope'->>'kind'='service' and value->'desired'?'schedule' loop
  c:=(p->'before')||(p->'desired');
  if c->'schedule'?'final' and c->'schedule'->'duration'?'minutes' and c->'date'<>'null'::jsonb then
   start1:=(c->'schedule'->>'final')::timetz::time;dur1:=(c->'schedule'->'duration'->>'minutes')::integer;
   for v in select service_id from crm_private.b04_services where booking_id=bid and admin_scope=s and service_id<>(p->'scope'->>'id')::uuid loop
    other:=crm_private.modification_scope(jsonb_build_object('kind','service','id',v.service_id),bid,s);
    if other->'date'=c->'date' and other->'schedule'?'final' and other->'schedule'->'duration'?'minutes' then
     start2:=(other->'schedule'->>'final')::timetz::time;dur2:=(other->'schedule'->'duration'->>'minutes')::integer;
     if start1<start2+make_interval(mins=>dur2) and start2<start1+make_interval(mins=>dur1) then r:=r||jsonb_build_array(jsonb_build_object('scope',p->'scope','otherScope',jsonb_build_object('kind','service','id',v.service_id),'cause','obvious-known-overlap','blocking',false,'before',p->'before','desired',p->'desired','other',other));end if;
    else r:=r||jsonb_build_array(jsonb_build_object('scope',p->'scope','otherScope',jsonb_build_object('kind','service','id',v.service_id),'cause','unknown-time-duration-or-date','blocking',false));end if;
   end loop;
  else r:=r||jsonb_build_array(jsonb_build_object('scope',p->'scope','cause','unknown-time-duration-or-date','blocking',false));end if;
 end loop;return r;
end$$;
create function crm_private.modification_cancelled(bid uuid,s text) returns boolean language sql stable set search_path=pg_catalog,pg_temp as $$
 select exists(select 1 from crm_private.b04_services where booking_id=bid and admin_scope=s) and not exists(select 1 from crm_private.b04_services v where v.booking_id=bid and v.admin_scope=s and not coalesce((crm_private.modification_scope(jsonb_build_object('kind','service','id',v.service_id),bid,s)->>'cancelled')::boolean,false) and exists(select 1 from crm_private.b04_contributions c where c.service_id=v.service_id and not coalesce((crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',v.service_id),bid,s)->>'cancelled')::boolean,false)))
 and not exists(select 1 from crm_private.b06_modification_revisions r join crm_private.b06_modifications m using(modification_id) where m.booking_id=bid and m.admin_scope=s and jsonb_array_length(coalesce(r.after_data->'evaluation'->'knownPerformance','[]'))>0)
$$;

create function crm_api.modification_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,tf2p bytea,tf2s bytea,tf1p bytea,tf1s bytea,tq bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;d jsonb;op uuid;mid uuid;bid uuid;actor uuid;s text;act text;at_time timestamptz;fp text;hash text;opp uuid;rev bigint:=0;root crm_private.b06_modifications;prev crm_private.b06_modification_operations;old jsonb;state jsonb;r jsonb;p jsonb;parts jsonb;cur jsonb;x jsonb;k text;pid uuid;partHash text;follow boolean:=false;task jsonb;task_id uuid;all_done boolean;ids jsonb;approval jsonb;proofs jsonb;sid uuid;req jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'MODIFICATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-MODIFICATION1' then raise exception 'MODIFICATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a?&array['action','operationId','modificationId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','data']) or a-array['action','operationId','modificationId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','data','origin']<>'{}'::jsonb
 or not crm_private.invoice_text(a->'sourceRef') or not crm_private.invoice_text(a->'reason') or not crm_private.availability_time(a->'at') or jsonb_typeof(a->'data')<>'object' or coalesce(a->>'expectedRevision','')!~'^[0-9]+$' or coalesce(a->>'origin','manual')<>'manual' then raise exception 'MODIFICATION_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;mid:=(a->>'modificationId')::uuid;bid:=(a->>'bookingId')::uuid;actor:=hf[12]::uuid;s:=hf[17];act:=a->>'action';d:=a->'data';at_time:=(a->>'at')::timestamptz;
 select opportunity_id into opp from crm_private.b04_bookings where booking_id=bid and admin_scope=s;if not found then raise exception 'MODIFICATION_DENIED';end if;
 perform pg_advisory_xact_lock(hashtextextended(opp::text,31));perform pg_advisory_xact_lock(hashtextextended('requirement-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended('availability-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended('confirmation-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended('modification-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended('modification-op:'||op,0));
 select * into root from crm_private.b06_modifications where modification_id=mid;
 if (root.modification_id is not null and (root.booking_id<>bid or root.admin_scope<>s)) or (act<>'request' and root.modification_id is null) then raise exception 'MODIFICATION_DENIED';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');select * into prev from crm_private.b06_modification_operations where operation_id=op;
 if found then if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'MODIFICATION_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  hash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');if not crm_private.modification_proof((a->>'evidenceId')::uuid,mid,s,'modification:'||act||':'||hash,at_time) or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'MODIFICATION_EVIDENCE_REQUIRED:E3';end if;
  if root.modification_id is not null then select revision,after_data into rev,old from crm_private.b06_modification_revisions where modification_id=mid order by revision desc limit 1;end if;
  select o.* into prev from crm_private.b06_modification_operations o join crm_private.b06_modification_revisions v on v.modification_id=o.modification_id and v.revision=o.result_revision where o.modification_id=mid and o.admin_scope=s and o.actor_id=actor and v.event-array['operationId','evidenceId'] = a-array['operationId','evidenceId'] order by o.recorded_at limit 1;
  if found then r:=prev.result||jsonb_build_object('replayed',true);insert into crm_private.b06_modification_operations values(op,mid,s,actor,fp,r,prev.result_revision,clock_timestamp());perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;end if;
  if rev<>(a->>'expectedRevision')::bigint then raise exception 'MODIFICATION_REVISION_CONFLICT:E2';end if;state:=old;
  if act in('request','change') then
   if d-array['requester','cause','type','parts','recordId','correctsModificationId']<>'{}'::jsonb or not(d?&array['requester','cause','type','parts','recordId']) or not crm_private.invoice_text(d->'cause') or d->>'type' not in('change','cancellation') or jsonb_typeof(d->'parts')<>'array' or jsonb_array_length(d->'parts')=0 or not crm_private.confirmation_record((d->>'recordId')::uuid,bid,s) then raise exception 'MODIFICATION_REQUEST_REQUIRED:E3';end if;
   x:=d->'requester';if x-array['kind','id','designationId']<>'{}'::jsonb or not(x?&array['kind','id']) then raise exception 'MODIFICATION_REQUESTER_REQUIRED:E3';end if;
   if x->>'kind'='internal' then if not exists(select 1 from crm_private.crm_actors where actor_id=(x->>'id')::uuid and enabled and admin_scope=s) then raise exception 'MODIFICATION_DENIED';end if;
   elsif x->>'kind'='provider' then if not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(x->>'id')::uuid and r.admin_scope=s and i.item_kind='provider') then raise exception 'MODIFICATION_REQUESTER_REQUIRED:E3';end if;
   elsif x->>'kind'='client' then if not exists(select 1 from crm_private.identity_designations z where z.designation_id=(x->>'designationId')::uuid and z.party_id=(x->>'id')::uuid and z.admin_scope=s and z.ended_at is null and z.verified and z.role_kind in('primary_contact','client') and z.context_id in(bid,opp)) then raise exception 'MODIFICATION_REQUESTER_REQUIRED:E3';end if;
   else raise exception 'MODIFICATION_REQUESTER_REQUIRED:E3';end if;
   if act='request' and root.modification_id is not null then raise exception 'MODIFICATION_TRANSITION_INVALID';end if;
   if act='change' and (old->>'progress'<>'Aprobada' or not exists(select 1 from jsonb_array_elements(old->'parts') z where z->'applied'='null'::jsonb)) then raise exception 'MODIFICATION_TRANSITION_INVALID';end if;
   parts:='[]';for p in select value from jsonb_array_elements(d->'parts') loop
    if p-array['id','scope','expectedScopeRevision','desired','aspects','dependencies']<>'{}'::jsonb or not(p?&array['id','scope','expectedScopeRevision','desired','aspects','dependencies']) or jsonb_typeof(p->'aspects')<>'array' or jsonb_array_length(p->'aspects')=0 or jsonb_typeof(p->'dependencies')<>'array' then raise exception 'MODIFICATION_PART_REQUIRED:E3';end if;pid:=(p->>'id')::uuid;
    if exists(select 1 from jsonb_array_elements(parts) z where z->'id'=p->'id' or z->'scope'=p->'scope') then raise exception 'MODIFICATION_PART_CONFLICT:E2';end if;
    if exists(select 1 from jsonb_array_elements(p->'aspects') z where not crm_private.invoice_text(z)) or not crm_private.modification_dependencies(p->'dependencies',p,bid,opp,s) then raise exception 'MODIFICATION_DEPENDENCY_REQUIRED:E3';end if;
    cur:=crm_private.modification_scope(p->'scope',bid,s);if cur->'revision' is distinct from p->'expectedScopeRevision' then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;
    if cur->'cancelled'='true'::jsonb and p->'desired'->'cancelled'='false'::jsonb and not exists(select 1 from crm_private.b06_modifications z where z.modification_id=(d->>'correctsModificationId')::uuid and z.booking_id=bid and z.admin_scope=s) then raise exception 'MODIFICATION_CORRECTION_REQUIRED:E3';end if;
    if not crm_private.modification_patch(p->'desired',cur,p->'scope'->>'kind',s) then raise exception 'MODIFICATION_PART_REQUIRED:E3';end if;
    if d->'requester'->>'kind'='provider' and not exists(select 1 from crm_private.b04_services sv join crm_private.catalog_revisions ofr on ofr.related_revision_id=sv.service_revision_id or ofr.related_revision_id=(sv.applied->>'variant')::uuid join crm_private.catalog_items oi on oi.item_id=ofr.item_id and oi.item_kind='offering' where sv.service_id=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid and sv.booking_id=bid and sv.admin_scope=s and ofr.admin_scope=s and ofr.parent_revision_id=(d->'requester'->>'id')::uuid and (sv.applied->'provider'='null'::jsonb or sv.applied->>'provider'=d->'requester'->>'id')) then raise exception 'MODIFICATION_REQUESTER_REQUIRED:E3';end if;
    if act='change' and exists(select 1 from jsonb_array_elements(old->'parts') z where z->'id'=p->'id' and z->'applied'<>'null'::jsonb) then raise exception 'MODIFICATION_APPLIED_PART_IMMUTABLE';end if;
    parts:=parts||jsonb_build_array(p||jsonb_build_object('before',cur,'applied',null,'review',null));
   end loop;
   if act='change' then parts:=coalesce((select jsonb_agg(value) from jsonb_array_elements(old->'parts') where value->'applied'<>'null'::jsonb),'[]')||parts;end if;
   if act='request' then insert into crm_private.b06_modifications values(mid,bid,s,op);end if;
   state:=coalesce(old,'{}'::jsonb)||jsonb_build_object('id',mid,'bookingId',bid,'progress',case when act='request' then 'Solicitada' else 'En evaluación' end,'request',d,'parts',parts,'approval',null,'evaluation',null,'review',null,'incident',null,'economic',jsonb_build_object('status','pending','reason','D019 determination and later economic application required'));
  elsif act='evaluate' then
   if old->>'progress' not in('Solicitada','En evaluación') or d-array['policy','impacts','knownPerformance','temporal','agendaJustification']<>'{}'::jsonb or not(d?&array['policy','impacts']) or not(d->'policy'?&array['id','version','terms']) or not crm_private.invoice_text(d->'policy'->'id') or not crm_private.invoice_text(d->'policy'->'version') or d->'policy'->'terms' is distinct from (select terms from crm_private.b04_bookings where booking_id=bid) or not(d->'impacts'?&array['commercial','operational','economic']) or d->'impacts'->>'economic' is distinct from 'pending' then raise exception 'MODIFICATION_EVALUATION_REQUIRED:E3';end if;
   if not crm_private.invoice_text(d->'impacts'->'commercial') or not crm_private.invoice_text(d->'impacts'->'operational') then raise exception 'MODIFICATION_EVALUATION_REQUIRED:E3';end if;
   for x in select value from jsonb_array_elements(coalesce(d->'knownPerformance','[]')) loop
    cur:=crm_private.modification_scope(x->'scope',bid,s);
    if x-array['scope','proofId','recordId','occurredAt','description']<>'{}'::jsonb or not(x?&array['scope','proofId','recordId','occurredAt','description']) or not crm_private.invoice_text(x->'description') or not crm_private.availability_time(x->'occurredAt') or (x->>'occurredAt')::timestamptz>at_time or not crm_private.confirmation_record((x->>'recordId')::uuid,bid,s) or not crm_private.modification_proof((x->>'proofId')::uuid,bid,s,'modification:performance:'||encode(crm_crypto.digest(convert_to((x-'proofId')::text,'UTF8'),'sha256'),'hex'),at_time) then raise exception 'MODIFICATION_PERFORMANCE_EVIDENCE_REQUIRED:E3';end if;
   end loop;
   for x in select value from jsonb_array_elements(coalesce(d->'temporal','[]')) loop
    if not(x?&array['scope','zone','sourceRef','version','basis','referenceDate']) or not exists(select 1 from pg_timezone_names where name=x->>'zone') or not crm_private.invoice_text(x->'sourceRef') or not crm_private.invoice_text(x->'version') or x->>'basis' not in('default','express_contract') then raise exception 'MODIFICATION_TEMPORAL_REQUIRED:E3';end if;
    cur:=to_jsonb(crm_private.modification_reference(x->'scope',bid,s));
    if x->>'basis'='default' and x->>'referenceDate' is distinct from (cur#>>'{}') then raise exception 'MODIFICATION_TEMPORAL_REQUIRED:E3';end if;
    if x->>'basis'='express_contract' and not crm_private.modification_proof((x->>'proofId')::uuid,bid,s,'modification:contract-reference:'||encode(crm_crypto.digest(convert_to((x-'proofId')::text,'UTF8'),'sha256'),'hex'),at_time) then raise exception 'MODIFICATION_TEMPORAL_REQUIRED:E3';end if;
   end loop;
   parts:='[]';for p in select value from jsonb_array_elements(old->'parts') loop
    if p->'applied'='null'::jsonb then cur:=crm_private.modification_scope(p->'scope',bid,s);if cur is distinct from p->'before' then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;p:=p||jsonb_build_object('review',jsonb_build_object('pending',true,'aspects',p->'aspects','sourceRef',a->>'sourceRef','cause',a->>'reason','before',cur,'after',p->'desired','evidenceId',a->>'evidenceId','actorId',actor,'at',at_time));follow:=true;end if;parts:=parts||jsonb_build_array(p);
   end loop;
   x:=crm_private.modification_agenda(parts,bid,s);if d?'agendaJustification' then if not crm_private.invoice_text(d->'agendaJustification'->'reason') or not crm_private.modification_proof((d->'agendaJustification'->>'proofId')::uuid,bid,s,'modification:agenda:'||encode(crm_crypto.digest(convert_to(jsonb_build_object('warnings',x,'reason',d->'agendaJustification'->'reason')::text,'UTF8'),'sha256'),'hex'),at_time) then raise exception 'MODIFICATION_AGENDA_JUSTIFICATION_REQUIRED:E3';end if;end if;
   state:=state||jsonb_build_object('agendaWarnings',x,'progress','En evaluación','evaluation',d||jsonb_build_object('civilEvaluations',(select coalesce(jsonb_agg(z||jsonb_build_object('actDate',(at_time at time zone(z->>'zone'))::date,'daysBefore',(z->>'referenceDate')::date-(at_time at time zone(z->>'zone'))::date,'algorithmVersion','h1-civil-d020-v1')),'[]') from jsonb_array_elements(coalesce(d->'temporal','[]')) z)),'parts',parts);
  elsif act='provider' then
   if old->>'progress'<>'En evaluación' or d-array['partIds','commitment','recordId']<>'{}'::jsonb or not(d?&array['partIds','commitment','recordId']) or not crm_private.invoice_text(d->'commitment') then raise exception 'MODIFICATION_PROVIDER_REQUIRED:E3';end if;
   if jsonb_typeof(d->'partIds') is distinct from 'array' or jsonb_array_length(d->'partIds')=0 or exists(select 1 from jsonb_array_elements(d->'partIds') z where not exists(select 1 from jsonb_array_elements(old->'parts') p0 where p0->'id'=z)) then raise exception 'MODIFICATION_PROVIDER_REQUIRED:E3';end if;
   if d->'recordId'<>'null'::jsonb and not exists(select 1 from crm_private.b07_records r0 join crm_private.b07_links l on l.record_id=r0.record_id where r0.record_id=(d->>'recordId')::uuid and r0.admin_scope=s and l.context_id=bid and r0.record_kind='communication_fact' and r0.material->>'fact_kind'='sent') then raise exception 'MODIFICATION_SEND_EVIDENCE_REQUIRED:E3';end if;
   state:=state||jsonb_build_object('progress','Pendiente de proveedor','providerRequest',d);follow:=true;
  elsif act='response' then
   if old->>'progress'<>'Pendiente de proveedor' or d-array['partIds','source','recordId','happenedAt','result','coverage','alternatives']<>'{}'::jsonb or not(d?&array['partIds','source','recordId','happenedAt','result','coverage','alternatives']) or not crm_private.confirmation_record((d->>'recordId')::uuid,bid,s) or not crm_private.availability_time(d->'happenedAt') or (d->>'happenedAt')::timestamptz>at_time or d->>'result' not in('accepted','rejected','offered','ambiguous') then raise exception 'MODIFICATION_RESPONSE_REQUIRED:E3';end if;
   if jsonb_typeof(d->'partIds') is distinct from 'array' or jsonb_array_length(d->'partIds')=0 or not((old->'providerRequest'->'partIds') @> (d->'partIds')) then raise exception 'MODIFICATION_RESPONSE_SCOPE_REQUIRED:E3';end if;
   for x in select value from jsonb_array_elements(d->'partIds') loop
    select value into p from jsonb_array_elements(old->'parts') where value->'id'=x;sid:=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid;
    if not coalesce(crm_private.modification_source(d->'source',bid,sid,s),false) then raise exception 'MODIFICATION_SOURCE_REQUIRED:E3';end if;
    if d->>'result'='accepted' and d->'coverage'->(p->>'id') is distinct from p->'desired' then raise exception 'MODIFICATION_RESPONSE_SCOPE_REQUIRED:E3';end if;
   end loop;
   if old?'response' and (d->>'happenedAt')::timestamptz<=(old->'response'->>'happenedAt')::timestamptz then raise exception 'MODIFICATION_RESPONSE_UNCERTAIN:E8';end if;
   state:=state||jsonb_build_object('response',d,'progress',case when d->>'result'='ambiguous' then 'Pendiente de proveedor' else 'En evaluación' end);follow:=true;
  elsif act='approve' then
   if old->>'progress'<>'En evaluación' or jsonb_typeof(old->'evaluation') is distinct from 'object' or d-array['partIds','proofs']<>'{}'::jsonb or not(d?&array['partIds','proofs']) or jsonb_typeof(d->'partIds')<>'array' or jsonb_array_length(d->'partIds')=0 then raise exception 'MODIFICATION_APPROVAL_REQUIRED:E3';end if;
   for x in select value from jsonb_array_elements(d->'partIds') loop
    select value into p from jsonb_array_elements(old->'parts') where value->'id'=x and value->'applied'='null'::jsonb;if p is null then raise exception 'MODIFICATION_APPROVAL_SCOPE_REQUIRED:E3';end if;
    cur:=crm_private.modification_scope(p->'scope',bid,s);if cur is distinct from p->'before' then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;
    partHash:=encode(crm_crypto.digest(convert_to((p-array['review','applied'])::text,'UTF8'),'sha256'),'hex');proofs:=d->'proofs'->(p->>'id');if proofs-array['client','provider','constraints']<>'{}'::jsonb then raise exception 'MODIFICATION_APPROVAL_GUARD_REQUIRED:E3';end if;
    if p->'scope'->>'kind'<>'booking' then
     if not crm_private.modification_proof((proofs->>'client')::uuid,bid,s,'modification:client:'||partHash,at_time) or not crm_private.modification_proof((proofs->>'constraints')::uuid,bid,s,'modification:constraints:'||partHash,at_time) then raise exception 'MODIFICATION_APPROVAL_GUARD_REQUIRED:E3';end if;
     sid:=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid;
     if (select nature from crm_private.b04_services where service_id=sid)='external' and not crm_private.modification_proof((proofs->>'provider')::uuid,bid,s,'modification:provider:'||partHash,at_time) then raise exception 'MODIFICATION_PROVIDER_GUARD_REQUIRED:E3';end if;
    end if;
   end loop;
   state:=state||jsonb_build_object('progress','Aprobada','approval',jsonb_build_object('partIds',d->'partIds','proofs',d->'proofs','actorId',actor,'at',at_time,'revision',rev+1,'parts',old->'parts','evidenceId',a->>'evidenceId'));
  elsif act='apply' then
   approval:=old->'approval';if old->>'progress'<>'Aprobada' or approval='null'::jsonb or d-array['partIds','approvalRevision']<>'{}'::jsonb or not(d?&array['partIds','approvalRevision']) or d->'approvalRevision' is distinct from approval->'revision' or jsonb_typeof(d->'partIds')<>'array' or jsonb_array_length(d->'partIds')=0 then raise exception 'MODIFICATION_APPLICATION_REQUIRED:E3';end if;
   if jsonb_typeof(d->'partIds') is distinct from 'array' or jsonb_array_length(d->'partIds')=0 or exists(select 1 from jsonb_array_elements(d->'partIds') z where not exists(select 1 from jsonb_array_elements(old->'parts') p0 where p0->'id'=z)) then raise exception 'MODIFICATION_PART_REQUIRED:E3';end if;
   parts:='[]';for p in select value from jsonb_array_elements(old->'parts') loop
    if d->'partIds' @> jsonb_build_array(p->'id') then
     if not(approval->'partIds' @> jsonb_build_array(p->'id')) then raise exception 'MODIFICATION_APPROVAL_SCOPE_REQUIRED:E3';end if;
     if p->'applied'='null'::jsonb then
      cur:=crm_private.modification_scope(p->'scope',bid,s);if cur is distinct from p->'before' then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;
      if old->'incident'<>'null'::jsonb then raise exception 'MODIFICATION_UNCERTAIN_EFFECT:E8';end if;
      partHash:=encode(crm_crypto.digest(convert_to((p-array['review','applied'])::text,'UTF8'),'sha256'),'hex');proofs:=approval->'proofs'->(p->>'id');
      if p->'scope'->>'kind'<>'booking' and (not crm_private.modification_proof((proofs->>'client')::uuid,bid,s,'modification:client:'||partHash,at_time) or not crm_private.modification_proof((proofs->>'constraints')::uuid,bid,s,'modification:constraints:'||partHash,at_time)) then raise exception 'MODIFICATION_APPROVAL_GUARD_REQUIRED:E3';end if;
      sid:=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid;if p->'scope'->>'kind'<>'booking' and (select nature from crm_private.b04_services where service_id=sid)='external' and not crm_private.modification_proof((proofs->>'provider')::uuid,bid,s,'modification:provider:'||partHash,at_time) then raise exception 'MODIFICATION_PROVIDER_GUARD_REQUIRED:E3';end if;
      if p->'desired'->'cancelled'='true'::jsonb and exists(select 1 from jsonb_array_elements(coalesce(old->'evaluation'->'knownPerformance','[]')) kp where kp->'scope'=p->'scope') then raise exception 'MODIFICATION_PRIOR_PERFORMANCE_REQUIRED:E3';end if;
      x:=cur||(p->'desired')||jsonb_build_object('revision',(cur->>'revision')::bigint+1);if p->'desired'?'schedule' then x:=jsonb_set(x,'{schedule}',coalesce(nullif(cur->'schedule','null'::jsonb),'{}')||(p->'desired'->'schedule'));end if;
      if p->'scope'->>'kind'='booking' and p->'desired'->'cancelled'='true'::jsonb and not crm_private.modification_cancelled(bid,s) then raise exception 'MODIFICATION_BOOKING_CANCELLATION_REQUIRED:E3';end if;
      insert into crm_private.b04_operational_versions values(bid,p->'scope'->>'kind',(p->'scope'->>'id')::uuid,case when p->'scope'->>'kind'='booking' then null else coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid end,(x->>'revision')::bigint,s,mid,(p->>'id')::uuid,x,cur,op);
      p:=p||jsonb_build_object('applied',jsonb_build_object('before',cur,'after',x,'actorId',actor,'at',at_time,'evidenceId',a->>'evidenceId'),'review',jsonb_build_object('pending',p->'scope'->>'kind'<>'booking','aspects',p->'aspects','cause','New scope requires its own coverage; application is not confirmation'));
      perform crm_private.modification_requirements(p,bid,s,actor,(a->>'evidenceId')::uuid,at_time,a->>'sourceRef',a->>'reason');
     end if;
    end if;parts:=parts||jsonb_build_array(p);
   end loop;
   if exists(select 1 from jsonb_array_elements(d->'partIds') z where not exists(select 1 from jsonb_array_elements(parts) y where y->'id'=z)) then raise exception 'MODIFICATION_APPROVAL_SCOPE_REQUIRED:E3';end if;
   all_done:=not exists(select 1 from jsonb_array_elements(parts) z where approval->'partIds' @> jsonb_build_array(z->'id') and z->'applied'='null'::jsonb);
   state:=state||jsonb_build_object('currentCivilEvaluations',(select coalesce(jsonb_agg(z||jsonb_build_object('referenceDate',case when z->>'basis'='default' then crm_private.modification_reference(z->'scope',bid,s) else (z->>'referenceDate')::date end,'daysBefore',(case when z->>'basis'='default' then crm_private.modification_reference(z->'scope',bid,s) else (z->>'referenceDate')::date end)-(at_time at time zone(z->>'zone'))::date,'algorithmVersion','h1-civil-d020-v1','actorId',actor,'at',at_time)),'[]') from jsonb_array_elements(coalesce(old->'evaluation'->'temporal','[]')) z),'parts',parts,'progress',case when all_done then 'Aplicada' else 'Aprobada' end);follow:=true;
  elsif act in('reject','withdraw') then
   if d-array['decision','proofId']<>'{}'::jsonb or not(d?&array['decision','proofId']) or not crm_private.invoice_text(d->'decision') then raise exception 'MODIFICATION_DECISION_REQUIRED:E3';end if;
   if act='reject' and old->>'progress' not in('Solicitada','En evaluación','Pendiente de proveedor') then raise exception 'MODIFICATION_TRANSITION_INVALID';end if;
   if act='withdraw' then
    if old->>'progress' not in('Solicitada','En evaluación','Pendiente de proveedor','Aprobada') or exists(select 1 from jsonb_array_elements(old->'parts') z where z->'applied'<>'null'::jsonb) or old->'incident'<>'null'::jsonb or not crm_private.modification_proof((d->>'proofId')::uuid,bid,s,'modification:no-pending-effects:'||mid,at_time) then raise exception 'MODIFICATION_WITHDRAWAL_REQUIRED:E3';end if;
   end if;
   state:=state||jsonb_build_object('progress',case when act='reject' then 'Rechazada' else 'Cancelada/sin efecto' end,'decision',d);follow:=true;
  elsif act in('review','ratify','review_negative') then
   if d-array['partIds','aspects','proofId','result','validUntil']<>'{}'::jsonb or not(d?&array['partIds','aspects','proofId','result','validUntil']) or jsonb_typeof(d->'aspects')<>'array' or jsonb_array_length(d->'aspects')=0 or not crm_private.invoice_text(d->'result') or exists(select 1 from jsonb_array_elements(d->'aspects') z where not crm_private.invoice_text(z)) then raise exception 'MODIFICATION_REVIEW_REQUIRED:E3';end if;
   if jsonb_typeof(d->'partIds') is distinct from 'array' or jsonb_array_length(d->'partIds')=0 or exists(select 1 from jsonb_array_elements(d->'partIds') z where not exists(select 1 from jsonb_array_elements(old->'parts') p0 where p0->'id'=z)) then raise exception 'MODIFICATION_PART_REQUIRED:E3';end if;
   parts:='[]';for p in select value from jsonb_array_elements(old->'parts') loop
    if d->'partIds' @> jsonb_build_array(p->'id') then
     if act='ratify' then
      if (p->'review') is null or p->'review'='null'::jsonb or not(coalesce(p->'review'->'aspects',p->'aspects') @> (d->'aspects')) then raise exception 'MODIFICATION_RATIFICATION_REQUIRED:E3';end if;
      cur:=crm_private.modification_scope(p->'scope',bid,s);if cur is distinct from coalesce(p->'applied'->'after',p->'before') then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;
      hash:=encode(crm_crypto.digest(convert_to(jsonb_build_object('part',p-array['review'],'aspects',d->'aspects','validUntil',d->'validUntil')::text,'UTF8'),'sha256'),'hex');
      if not crm_private.modification_proof((d->>'proofId')::uuid,bid,s,'modification:ratify:'||hash,at_time) or not crm_private.availability_time(d->'validUntil') or (d->>'validUntil')::timestamptz<at_time then raise exception 'MODIFICATION_RATIFICATION_REQUIRED:E3';end if;
      p:=p||jsonb_build_object('review',jsonb_build_object('pending',not(d->'aspects' @> coalesce(p->'review'->'aspects',p->'aspects')),'aspects',(select coalesce(jsonb_agg(z),'[]') from jsonb_array_elements(coalesce(p->'review'->'aspects',p->'aspects')) z where not(d->'aspects' @> jsonb_build_array(z))),'result',d,'at',at_time,'actorId',actor,'evidenceId',a->>'evidenceId'));
     else p:=p||jsonb_build_object('review',jsonb_build_object('pending',true,'aspects',d->'aspects','result',d,'cause',a->>'reason','actorId',actor,'at',at_time,'evidenceId',a->>'evidenceId'));end if;follow:=true;
    end if;parts:=parts||jsonb_build_array(p);
   end loop;state:=state||jsonb_build_object('parts',parts);
  elsif act='incident' then
   if d-array['incidentId','attempt','knownEffects','uncertainParts','proofId','result']<>'{}'::jsonb or not(d?&array['incidentId','attempt','knownEffects','uncertainParts']) or not exists(select 1 from crm_private.b07_incidents where incident_id=(d->>'incidentId')::uuid and booking_id=bid and admin_scope=s) then raise exception 'MODIFICATION_INCIDENT_REQUIRED:E3';end if;if d->>'result'='verified' then
    if old->'incident'='null'::jsonb or d->'uncertainParts'<>'[]'::jsonb or not exists(select 1 from crm_private.b07_incident_revisions r0 where r0.incident_id=(d->>'incidentId')::uuid and r0.revision=(select max(revision) from crm_private.b07_incident_revisions where incident_id=r0.incident_id) and r0.after_data->>'status' in('Resuelta','Cerrada')) or not crm_private.modification_proof((d->>'proofId')::uuid,bid,s,'modification:recover:'||encode(crm_crypto.digest(convert_to((d-'proofId')::text,'UTF8'),'sha256'),'hex'),at_time) then raise exception 'MODIFICATION_RECOVERY_REQUIRED:E3';end if;
    state:=state||jsonb_build_object('resolvedIncident',old->'incident','incident',null,'recovery',d);
   else state:=state||jsonb_build_object('incident',d);end if;follow:=true;
  else raise exception 'MODIFICATION_INPUT_INVALID';end if;
  if follow then
   fs:=crm_f1.fields(tq);if cardinality(fs)<>2 or fs[1]<>'CRM-H1-TASK-1' then raise exception 'MODIFICATION_TASK_AUTH_REQUIRED';end if;task:=fs[2]::jsonb;if task->>'taskId'<>mid::text or task->'identity'->>'contextId'<>bid::text then raise exception 'MODIFICATION_TASK_AUTH_REQUIRED';end if;perform crm_api.b07_task_apply(tf2p,tf2s,tf1p,tf1s,tq);
  end if;
  rev:=rev+1;state:=state||jsonb_build_object('revision',rev);insert into crm_private.b06_modification_revisions values(mid,rev,s,op,act,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());r:=jsonb_build_object('id',mid,'replayed',false,'result',state);insert into crm_private.b06_modification_operations values(op,mid,s,actor,fp,r,rev,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_private.modification_token(bid uuid,sid uuid,nid uuid,cid uuid,s text) returns text language sql stable set search_path=pg_catalog,pg_temp as $$
 select encode(crm_crypto.digest(convert_to(coalesce(jsonb_agg(jsonb_build_object('kind',x.scope_kind,'id',x.scope_id,'revision',x.revision,'material',x.material) order by x.scope_kind,x.scope_id),'[]')::text,'UTF8'),'sha256'),'hex') from (
 select distinct on(scope_kind,scope_id) * from crm_private.b04_operational_versions where booking_id=bid and admin_scope=s and scope_kind<>'booking' and service_id=sid and (scope_kind='service' or scope_kind='night' and (nid is null or scope_id=nid) or scope_kind='contribution' and (cid is null or scope_id=cid) and (nid is null or exists(select 1 from crm_private.b04_night_occupancies o where o.night_id=nid and o.contribution_id=scope_id))) order by scope_kind,scope_id,revision desc
 ) x
$$;
create view crm_private.b04_current_services with(security_invoker=true) as select (jsonb_populate_record(null::crm_private.b04_services,to_jsonb(v)||jsonb_build_object('revision',c->'revision','state',case when c->'cancelled'='true'::jsonb then 'Cancelado' when (c->>'revision')::bigint>1 or exists(select 1 from crm_private.b04_operational_versions ov where ov.service_id=v.service_id) then 'Modificado' else v.state end,'applied',v.applied||jsonb_build_object('variant',c->'variant','provider',c->'provider','schedule',c->'schedule','place',c->'place')))).* from crm_private.b04_services v cross join lateral(select crm_private.modification_scope(jsonb_build_object('kind','service','id',v.service_id),v.booking_id,v.admin_scope) c) scope;
create view crm_private.b04_current_contributions with(security_invoker=true) as select (jsonb_populate_record(null::crm_private.b04_contributions,to_jsonb(v)||jsonb_build_object('quantity',c->'quantity','attendees',c->'attendees','certainty',c->'certainty','unit_revision_id',c->'unitRevisionId'))).*  from crm_private.b04_contributions v cross join lateral(select crm_private.modification_scope(jsonb_build_object('kind','contribution','id',v.contribution_id,'serviceId',v.service_id),v.booking_id,v.admin_scope) c) scope;
create view crm_private.b04_current_nights with(security_invoker=true) as select (jsonb_populate_record(null::crm_private.b04_nights,to_jsonb(n)||jsonb_build_object('night_date',c->'date'))).* from crm_private.b04_nights n join crm_private.b04_services v using(service_id) cross join lateral(select crm_private.modification_scope(jsonb_build_object('kind','night','id',n.night_id,'serviceId',n.service_id),v.booking_id,n.admin_scope) c) scope;
create function crm_private.modification_projection(r jsonb,s text) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare bid uuid:=(r->'booking'->>'booking_id')::uuid;sv jsonb;c jsonb;n jsonb;services jsonb:='[]';contributions jsonb;nights jsonb;current jsonb;detail jsonb;begin
 if r is null then return null;end if;detail:=r->'booking'->'detail';for sv in select value from jsonb_array_elements(detail->'services') loop
  current:=crm_private.modification_scope(jsonb_build_object('kind','service','id',sv->>'id'),bid,s);contributions:='[]';nights:='[]';
  for c in select value from jsonb_array_elements(sv->'contributions') loop contributions:=contributions||jsonb_build_array(c||(crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c->>'id','serviceId',sv->>'id'),bid,s)-'id'));end loop;
  for n in select value from jsonb_array_elements(sv->'nights') loop nights:=nights||jsonb_build_array(n||(crm_private.modification_scope(jsonb_build_object('kind','night','id',n->>'id','serviceId',sv->>'id'),bid,s)-'id'));end loop;
  services:=services||jsonb_build_array(sv||(current-'id')||jsonb_build_object('contributions',contributions,'nights',nights,'scopeRevision',crm_private.modification_token(bid,(sv->>'id')::uuid,null,null,s),'state',(select state from crm_private.b04_current_services where service_id=(sv->>'id')::uuid),'pendingRevalidation',crm_private.modification_pending(bid,(sv->>'id')::uuid,null,s)));
 end loop;
 if exists(select 1 from crm_private.b04_operational_versions where booking_id=bid and admin_scope=s) then r:=jsonb_set(r,'{booking,accepted_detail}',detail);r:=jsonb_set(r,'{booking,detail}',detail||jsonb_build_object('services',services,'aggregate',crm_private.modification_scope(jsonb_build_object('kind','booking','id',bid),bid,s)));r:=jsonb_set(r,'{booking,state}',to_jsonb(case when coalesce((crm_private.modification_scope(jsonb_build_object('kind','booking','id',bid),bid,s)->>'cancelled')::boolean,false) then 'Cancelada' else 'Pendiente de preparación' end));end if;return r;
end$$;
create function crm_api.modification_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;r jsonb;s text;bid uuid;mid uuid;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'MODIFICATION_DENIED';end if;fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-MODIFICATION-READ1' then raise exception 'MODIFICATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;s:=hf[17];bid:=(a->>'bookingId')::uuid;mid:=(a->>'modificationId')::uuid;if a-array['bookingId','modificationId','purpose']<>'{}'::jsonb then raise exception 'MODIFICATION_INPUT_INVALID';end if;
 select v.after_data into r from crm_private.b06_modifications m cross join lateral(select after_data from crm_private.b06_modification_revisions where modification_id=m.modification_id order by revision desc limit 1) v where m.modification_id=mid and m.booking_id=bid and m.admin_scope=s;
 if r is not null then
  if a?'purpose' then if a->>'purpose'<>'service-coverage' then raise exception 'MODIFICATION_INPUT_INVALID';end if;r:=jsonb_build_object('id',mid,'progress',r->'progress','parts',(select jsonb_agg(jsonb_build_object('id',p->'id','scope',p->'scope','applied',p->'applied'<>'null'::jsonb,'pending',p->'review'->'pending')) from jsonb_array_elements(r->'parts') p),'bookingCancelled',coalesce((crm_private.modification_scope(jsonb_build_object('kind','booking','id',bid),bid,s)->>'cancelled')::boolean,false),'economicPending',true,'refundExecuted',false,'fundsChanged',false);
  else r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action_kind,'before',before_data,'after',after_data,'sourceRef',source_ref,'reason',reason,'actorId',actor_id,'at',occurred_at,'recordedAt',recorded_at,'evidenceId',evidence_id) order by revision) from crm_private.b06_modification_revisions where modification_id=mid and admin_scope=s));end if;
 end if;perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
-- Deliberate forward changes: same signatures, owners and ACL, retained accepted sources.
do $$declare x record;body text;begin
 for x in select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where (n.nspname='crm_private' and p.proname in('confirmation_coverage','availability_coverage','confirmation_fact')) or (n.nspname='crm_api' and p.proname='booking_read') loop
  body:=pg_get_functiondef(x.oid);
  if x.proname='booking_read' then body:=replace(body,'perform crm_f2.verify(f2p,f2s,q,''C01''','r:=crm_private.modification_projection(r,hf[17]);perform crm_f2.verify(f2p,f2s,q,''C01''');
  else
   body:=replace(body,'from crm_private.b04_services','from crm_private.b04_current_services');body:=replace(body,'from crm_private.b04_nights','from crm_private.b04_current_nights');
   if x.proname in('confirmation_coverage','availability_coverage') then
    body:=replace(body,'''unitRevisionId'',','''scopeRevision'',''unitRevisionId'',');
    body:=replace(body,'and l.service_date=(x->>''date'')::date','and (case when exists(select 1 from crm_private.b04_operational_versions ov where ov.scope_kind=''service'' and ov.scope_id=sv.service_id) then (crm_private.modification_scope(jsonb_build_object(''kind'',''service'',''id'',sv.service_id),bid,s)->>''date'')::date else (crm_private.modification_scope(jsonb_build_object(''kind'',''contribution'',''id'',c.contribution_id,''serviceId'',sv.service_id),bid,s)->>''date'')::date end)=(x->>''date'')::date');
    -- scopeRevision is optional on a pristine H2 scope, mandatory only after material operational version.
    body:=replace(body,'not(x ?& array[','not((x||''{"scopeRevision":null}''::jsonb) ?& array[');
    if x.proname='confirmation_coverage' then
     body:=replace(body,'else\n  if not exists(select 1 from crm_private.b04_contributions c join crm_private.b03_proposal_lines l on l.line_id=c.line_id and l.version_id=c.version_id where c.service_id=sv.service_id and c.admin_scope=s and l.admin_scope=s and (x->''contributionId''=''null''::jsonb or c.contribution_id=(x->>''contributionId'')::uuid) and l.service_date=(x->>''date'')::date) then return false;end if;','else\n  if (crm_private.modification_scope(jsonb_build_object(''kind'',''service'',''id'',sv.service_id),bid,s)->>''date'')::date<>(x->>''date'')::date then return false;end if;');
    end if;
    body:=replace(body,'return true;','if crm_private.modification_token(bid,(x->>''serviceId'')::uuid,(x->>''nightId'')::uuid,null,s)<>encode(crm_crypto.digest(convert_to(''[]'',''UTF8''),''sha256''),''hex'') and x->>''scopeRevision'' is distinct from crm_private.modification_token(bid,(x->>''serviceId'')::uuid,(x->>''nightId'')::uuid,(x->>''contributionId'')::uuid,s) then return false;end if;return true;');
    if x.proname='confirmation_coverage' then body:=replace(body,'return exists(select 1 from crm_private.catalog_revisions','if crm_private.modification_token(bid,sv.service_id,(x->>''nightId'')::uuid,(x->>''contributionId'')::uuid,s)<>encode(crm_crypto.digest(convert_to(''[]'',''UTF8''),''sha256''),''hex'') and x->>''scopeRevision'' is distinct from crm_private.modification_token(bid,sv.service_id,(x->>''nightId'')::uuid,(x->>''contributionId'')::uuid,s) then return false;end if;return exists(select 1 from crm_private.catalog_revisions');end if;
   end if;
  end if;execute body;
 end loop;
end$$;
-- Current confirmation loses only materially dependent operational coverage, retaining facts.
do $$declare body text;begin body:=pg_get_functiondef('crm_private.confirmation_current(jsonb,uuid,text)'::regprocedure);body:=replace(body,'if state->''review''','if crm_private.modification_pending(bid,(e->''coverage''->>''serviceId'')::uuid,(e->''coverage''->>''nightId'')::uuid,s) then missing:=missing||''"modification-review"''::jsonb;end if;if state->''review''');execute body;end$$;

do $$declare body text;begin
 body:=pg_get_functiondef('crm_api.hold_read(bytea,bytea,bytea,bytea,bytea)'::regprocedure);
 body:=replace(body,'r:=jsonb_build_object(''id'',iid,''revision'',r->''revision'',''usable'',usable',
 'if p->''link''<>''null''::jsonb and (not crm_private.modification_hold_link(p->''link'',p->''terms'',s) or crm_private.modification_pending((p->''link''->>''bookingId'')::uuid,(p->''link''->>''serviceId'')::uuid,(select n.night_id from crm_private.b04_nights n where n.service_id=(p->''link''->>''serviceId'')::uuid and n.night_date=(p->''terms''->>''date'')::date limit 1),s)) then usable:=false;end if;r:=jsonb_build_object(''id'',iid,''revision'',r->''revision'',''usable'',usable');execute body;
 body:=pg_get_functiondef('crm_api.hold_apply(bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea)'::regprocedure);
 body:=replace(body,'data-array[''partIds'',''bookingId'',''serviceId'',''nightId'',''bookingRevision'',''serviceRevision'',''conditionsChecked'']','data-array[''partIds'',''bookingId'',''serviceId'',''nightId'',''bookingRevision'',''serviceRevision'',''conditionsChecked'',''scopeRevision'']');
 body:=replace(body,'join crm_private.b04_services bs','join crm_private.b04_current_services bs');body:=replace(body,'from crm_private.b04_nights','from crm_private.b04_current_nights');
 body:=replace(body,'(pl.service_date is null or pl.service_date=(p->''terms''->>''date'')::date)','(crm_private.modification_reference(jsonb_build_object(''kind'',''service'',''id'',bs.service_id),b.booking_id,s) is null or crm_private.modification_reference(jsonb_build_object(''kind'',''service'',''id'',bs.service_id),b.booking_id,s)=(p->''terms''->>''date'')::date)');
 body:=replace(body,'then raise exception ''HOLD_LINK_REQUIRED:E3'';end if;','or not crm_private.modification_hold_link(data,p->''terms'',s) then raise exception ''HOLD_LINK_REQUIRED:E3'';end if;');
 body:=replace(body,'if p->''link''<>''null''::jsonb and p->''link'' is distinct from data then','if p->''link''<>''null''::jsonb and p->''link'' is distinct from data and ((p->''link'')-array[''scopeRevision'',''serviceRevision''] is distinct from data-array[''scopeRevision'',''serviceRevision''] or not crm_private.modification_hold_link(data,p->''terms'',s)) then');execute body;
 body:=pg_get_functiondef('crm_api.availability_read(bytea,bytea,bytea,bytea,bytea)'::regprocedure);
 body:=replace(body,'not coalesce(crm_private.availability_coverage(a->''coverage'',bid,s),false)','(not coalesce(crm_private.availability_coverage(a->''coverage'',bid,s),false) and not exists(select 1 from crm_private.b04_availability av join crm_private.b04_availability_revisions rv using(availability_id) where av.booking_id=bid and av.admin_scope=s and (rv.after_data->''confirmed''->''response''->''coverage''=a->''coverage'' or rv.after_data->''response''->''coverage''=a->''coverage'')))');
 body:=replace(body,'r:=jsonb_build_object(''usable'',usable','if not coalesce(crm_private.availability_coverage(a->''coverage'',bid,s),false) then usable:=false;end if;r:=jsonb_build_object(''usable'',usable');
 body:=replace(body,'r:=jsonb_build_object(''usable'',usable', 'if crm_private.modification_pending(bid,(a->''coverage''->>''serviceId'')::uuid,(a->''coverage''->>''nightId'')::uuid,s) then usable:=false;end if;r:=jsonb_build_object(''usable'',usable');execute body;
end$$;

do $$declare x record;begin
 for x in select p.oid,p.proname,n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in('crm_api','crm_private') and p.proname like 'modification_%' loop execute format('alter function %s owner to %I',x.oid::regprocedure,case when x.nspname='crm_api' then 'crm_h0_f2_executor' else 'crm_h0_f2_owner' end);execute format('revoke execute on function %s from public',x.oid::regprocedure);execute format('grant execute on function %s to %I',x.oid::regprocedure,case when x.nspname='crm_api' then 'crm_h0_runtime' else 'crm_h0_f2_executor' end);end loop;
end$$;
alter view crm_private.b04_current_services owner to crm_h0_f2_owner;alter view crm_private.b04_current_contributions owner to crm_h0_f2_owner;alter view crm_private.b04_current_nights owner to crm_h0_f2_owner;
revoke all on crm_private.b04_current_services,crm_private.b04_current_contributions,crm_private.b04_current_nights from public,crm_h0_runtime;
grant select on crm_private.b04_current_services,crm_private.b04_current_contributions,crm_private.b04_current_nights to crm_h0_f2_executor,crm_h0_migration;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
