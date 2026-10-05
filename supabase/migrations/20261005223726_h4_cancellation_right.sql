-- H4-013/014. Contractual determination before obligations/funds. No Refund execution.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'CANCELLATION_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b06_cancellation_determinations(determination_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings,modification_id uuid not null references crm_private.b06_modifications,part_id uuid not null,scope jsonb not null,admin_scope text not null,start_quantity bigint not null check(start_quantity>=0),quantity bigint not null check(quantity>0),initial_operation_id uuid not null,unique(modification_id,part_id,start_quantity,quantity));
create table crm_private.b06_cancellation_operations(operation_id uuid primary key,determination_id uuid not null references crm_private.b06_cancellation_determinations,admin_scope text not null,actor_id uuid not null references crm_private.crm_actors,fingerprint text not null,result jsonb not null,result_revision bigint not null,recorded_at timestamptz not null default clock_timestamp());
create table crm_private.b06_cancellation_revisions(determination_id uuid not null references crm_private.b06_cancellation_determinations,revision bigint not null check(revision>0),admin_scope text not null,operation_id uuid not null unique references crm_private.b06_cancellation_operations deferrable initially deferred,action text not null,event jsonb not null,before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors,evidence_id uuid not null references crm_private.b07_records,source_ref text not null,reason text not null,occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(determination_id,revision));
create table crm_private.b06_cancellation_applications(application_id uuid primary key references crm_private.b06_cancellation_operations deferrable initially deferred,determination_id uuid not null references crm_private.b06_cancellation_determinations,determination_revision bigint not null,booking_id uuid not null references crm_private.b04_bookings,admin_scope text not null,scope jsonb not null,start_quantity bigint not null,quantity bigint not null,schedule_id uuid not null references crm_private.b05_payment_schedules,revision bigint not null,right_amount numeric not null check(right_amount>=0),retention_amount numeric not null check(retention_amount>=0),actor_id uuid not null references crm_private.crm_actors,evidence_id uuid not null references crm_private.b07_records,recorded_at timestamptz not null default clock_timestamp(),unique(determination_id),foreign key(determination_id,determination_revision) references crm_private.b06_cancellation_revisions);
alter table crm_private.b06_cancellation_determinations add foreign key(initial_operation_id) references crm_private.b06_cancellation_operations deferrable initially deferred;
alter table crm_private.b06_cancellation_operations add foreign key(determination_id,result_revision) references crm_private.b06_cancellation_revisions deferrable initially deferred;
do $$declare t text;r text;begin foreach t in array array['b06_cancellation_determinations','b06_cancellation_operations','b06_cancellation_revisions','b06_cancellation_applications'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy cancellation_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);execute format('create policy cancellation_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger cancellation_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
-- Specific contribution dates retain their meaning; an explicit service date change
-- affects its contributions only where no more specific contribution date was changed.
create function crm_private.cancellation_reference(x jsonb,bid uuid,s text) returns date language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare d date;begin
 if x->>'kind' in('service','night') then return (crm_private.modification_scope(x,bid,s)->>'date')::date;end if;
 if x->>'kind' not in('booking','modality') then raise exception 'CANCELLATION_SCOPE_REQUIRED:E3';end if;
 select case when bool_or(v.d is null) then null else min(v.d) end into d from crm_private.b04_contributions c cross join lateral(
 select case when exists(select 1 from crm_private.b04_operational_versions ov where ov.scope_kind='contribution' and ov.scope_id=c.contribution_id and ov.material->'date' is distinct from ov.before_data->'date') then (crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',c.service_id),bid,s)->>'date')::date
 when exists(select 1 from crm_private.b04_operational_versions ov where ov.scope_kind='service' and ov.scope_id=c.service_id and ov.material->'date' is distinct from ov.before_data->'date') then (crm_private.modification_scope(jsonb_build_object('kind','service','id',c.service_id),bid,s)->>'date')::date
 else (crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',c.service_id),bid,s)->>'date')::date end d) v where c.booking_id=bid and c.admin_scope=s and (x->>'kind'='booking' or c.modality_id=(x->>'id')::uuid);
 return d;
end$$;
-- Reconstruct the pertinent material from H2 identities and operational versions.
create function crm_private.cancellation_scope(x jsonb,bid uuid,s text) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare material jsonb;begin
 if x->>'kind'='modality' then
  select jsonb_build_object('modality',m.snapshot,'contributions',(select jsonb_agg(crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',c.service_id),bid,s) order by c.contribution_id) from crm_private.b04_contributions c where c.booking_id=bid and c.modality_id=m.modality_id and c.admin_scope=s),'date',crm_private.cancellation_reference(x,bid,s),'services',(select jsonb_agg(crm_private.modification_scope(jsonb_build_object('kind','service','id',z.service_id),bid,s) order by z.service_id) from (select distinct service_id from crm_private.b04_contributions where booking_id=bid and admin_scope=s and (x->>'kind'='booking' or modality_id=(x->>'id')::uuid)) z)) into material from crm_private.b04_modalities m where m.booking_id=bid and m.modality_id=(x->>'id')::uuid and m.admin_scope=s;
 elsif x->>'kind'='booking' then
  if x->>'id'<>bid::text then raise exception 'CANCELLATION_DENIED';end if;
  select jsonb_build_object('booking',crm_private.modification_scope(x,bid,s),'contributions',jsonb_agg(crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',c.service_id),bid,s) order by c.contribution_id),'date',crm_private.cancellation_reference(x,bid,s),'services',(select jsonb_agg(crm_private.modification_scope(jsonb_build_object('kind','service','id',z.service_id),bid,s) order by z.service_id) from (select distinct service_id from crm_private.b04_contributions where booking_id=bid and admin_scope=s and (x->>'kind'='booking' or modality_id=(x->>'id')::uuid)) z)) into material from crm_private.b04_contributions c where c.booking_id=bid and c.admin_scope=s;
 else material:=crm_private.modification_scope(x,bid,s);end if;
 if material is null then raise exception 'CANCELLATION_DENIED';end if;return material;
end$$;
-- Economic parent/child coverage, without conflating independent services or nights.
create function crm_private.cancellation_scopes_overlap(x jsonb,y jsonb,bid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare z jsonb;begin
 if x=y or x->>'kind'='booking' or y->>'kind'='booking' then return true;end if;
 if y->>'kind'='modality' then z:=x;x:=y;y:=z;end if;
 if x->>'kind'='modality' then
  if y->>'kind'='modality' then return x->>'id'=y->>'id';end if;
  return exists(select 1 from crm_private.b04_contributions c where c.booking_id=bid and c.admin_scope=s and c.modality_id=(x->>'id')::uuid and c.service_id=(case when y->>'kind'='night' then y->>'serviceId' else y->>'id' end)::uuid);
 end if;
 return x->>'kind'='service' and y->>'kind'='night' and x->>'id'=y->>'serviceId' or y->>'kind'='service' and x->>'kind'='night' and y->>'id'=x->>'serviceId';
end$$;
create function crm_private.cancellation_material(x jsonb) returns jsonb language sql immutable set search_path=pg_catalog,pg_temp as $$select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from jsonb_each(x) where key in('id','date','cancelled','quantity','attendees','certainty','unitRevisionId','conditions')$$;
create function crm_private.cancellation_token(x jsonb,bid uuid,s text) returns text language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare m jsonb:=crm_private.cancellation_scope(x,bid,s);d jsonb;begin
 if x->>'kind' in('booking','modality') then d:=jsonb_build_object('date',m->'date','modality',m->'modality','contributions',(select jsonb_agg(crm_private.cancellation_material(value) order by value->>'id') from jsonb_array_elements(m->'contributions')),'services',(select jsonb_agg(crm_private.cancellation_material(value) order by value->>'id') from jsonb_array_elements(m->'services')),'booking',case when m?'booking' then crm_private.cancellation_material(m->'booking') else null end);
 else d:=crm_private.cancellation_material(m);end if;
 return encode(crm_crypto.digest(convert_to(d::text,'UTF8'),'sha256'),'hex');end$$;
-- H3 cancellation/refund-related allocation admission now resolves the durable D019
-- determination. Ordinary/correction and independent modification bases stay historical.
create function crm_private.cancellation_fund_basis(basis jsonb,pid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare state jsonb;bid uuid;payment jsonb;begin
 select d.booking_id,v.after_data into bid,state from crm_private.b06_cancellation_determinations d join crm_private.b06_cancellation_revisions v using(determination_id) where d.determination_id=(basis->>'originalRef')::uuid and d.admin_scope=s order by v.revision desc limit 1;
 select snapshot into payment from crm_private.b05_payment_revisions where payment_id=pid and admin_scope=s order by revision desc limit 1;
 return coalesce(state->'computed'->>'status'='determined' and basis->>'version'=state->'computed'->>'version' and (basis->>'amount')::numeric=(state->'computed'->>'right')::numeric and state->>'scopeToken'=crm_private.cancellation_token(state->'scope',bid,s) and (payment->'detection'->>'bookingId'=bid::text or exists(select 1 from crm_private.b05_reconciliations where payment_id=pid and booking_id=bid and admin_scope=s)),false);
exception when others then return false;end$$;
-- Validate the capture by exact equalities against the contractual policy. This is a
-- persistence guard, not a second monetary calculator exposed to callers.
create function crm_private.cancellation_computed(f jsonb,c jsonb) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare pct integer;days integer;amt numeric;cnt bigint;v numeric;ref jsonb:=f->'reference';out jsonb;act date;begin
 if c->>'version'<>'h4-d011-d019-d020-d023-v1' or c->>'moneyVersion'<>'h1-money-d023-d028-d029-v1' or c->>'civilVersion'<>'h1-civil-d020-v1' then return false;end if;
 if ref<>'null'::jsonb and ref->'zone'<>'null'::jsonb then
  if not(ref?&array['scope','scopeId','date','zone','sourceRef','version','basis']) or (ref->'zone')-array['zone','sourceRef','version']<>'{}'::jsonb or not(ref->'zone'?&array['zone','sourceRef','version']) or not exists(select 1 from pg_timezone_names where name=ref->'zone'->>'zone') or not crm_private.invoice_text(ref->'zone'->'sourceRef') or not crm_private.invoice_text(ref->'zone'->'version') then return false;end if;
  act:=((f->>'at')::timestamptz at time zone (ref->'zone'->>'zone'))::date;days:=(ref->>'date')::date-act;
  if c->'temporal'->>'actDate'<>act::text or (c->'temporal'->>'daysBefore')::integer<>days or c->'temporal'->'reference' is distinct from ref then return false;end if;
 end if;
 if f->'cause'='null'::jsonb or f->'base'->'amount'='null'::jsonb or ref='null'::jsonb or ref->'zone'='null'::jsonb then
  return c->>'status'='pending' and c->'right'='null'::jsonb and c->'retention'='null'::jsonb and c->'calculation'='null'::jsonb and (ref<>'null'::jsonb and ref->'zone'<>'null'::jsonb or c->'temporal'='null'::jsonb);
 end if;
 pct:=case when f->>'cause' in('provider','huescaventura') then 100 when f->>'cause'<>'voluntary' or f->'nonRefundable'<>'null'::jsonb then 0 when days>=7 then 100 when days>=3 then 50 else 0 end;
 amt:=(f->'base'->>'amount')::numeric;cnt:=case when f->'base'->>'kind'='participation' then (f->'base'->>'count')::bigint else 1 end;v:=round(amt*pct/100,2);
 out:=c->'calculation'->'output';
 if c->>'status'<>'determined' or (c->>'percent')::integer<>pct or (c->>'right')::numeric<>v*cnt or (c->>'retention')::numeric<>(amt-v)*cnt or (c->>'baseTotal')::numeric<>amt*cnt or c->'calculation'->>'algorithmVersion'<>'h1-money-d023-d028-d029-v1' then return false;end if;
 if f->'base'->>'kind'='participation' then out:=out->'each';end if;
 return (out->>'base')::numeric=amt and (out->>'percent')::integer=pct and (out->'internal'->>'numerator')::numeric/(out->'internal'->>'denominator')::numeric=amt*pct/100 and (out->'applied'->>'amount')::numeric=v and (out->>'remainder')::numeric=amt-v;
exception when others then return false;
end$$;
create function crm_api.cancellation_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;f jsonb;c jsonb;old jsonb;state jsonb;r jsonb;p jsonb;material jsonb;ref jsonb;terms jsonb;part jsonb;parts jsonb;before_schedule jsonb;after_schedule jsonb;approval jsonb;
 b crm_private.b04_bookings;root crm_private.b06_cancellation_determinations;prior crm_private.b06_cancellation_operations;ps crm_private.b05_payment_schedules;
 op uuid;did uuid;mid uuid;bid uuid;actor uuid;s text;fp text;hash text;rev bigint;mr bigint;sr bigint;action text;startq bigint;countq bigint;total numeric;newtotal numeric;price numeric;token text;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'CANCELLATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-CANCELLATION1' then raise exception 'CANCELLATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a?&array['action','operationId','determinationId','bookingId','modificationId','partId','expectedRevision','expectedModificationRevision','scope','expectedScopeToken','at','sourceRef','reason','evidenceId']) or a-array['action','operationId','determinationId','bookingId','modificationId','partId','expectedRevision','expectedModificationRevision','scope','expectedScopeToken','at','sourceRef','reason','evidenceId','facts','computed','adjustment','origin']<>'{}'::jsonb or coalesce(a->>'origin','manual')<>'manual' or a->>'action' not in('determine','apply_obligation') or not crm_private.invoice_text(a->'reason') or not crm_private.invoice_text(a->'sourceRef') or coalesce(a->>'at','')!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}T.*(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'CANCELLATION_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;did:=(a->>'determinationId')::uuid;mid:=(a->>'modificationId')::uuid;bid:=(a->>'bookingId')::uuid;actor:=hf[12]::uuid;s:=hf[17];action:=a->>'action';
 select * into b from crm_private.b04_bookings where booking_id=bid and admin_scope=s;if not found then raise exception 'CANCELLATION_DENIED';end if;
 -- Same ordering as operational modification; locks precede version/source admission.
 perform pg_advisory_xact_lock(hashtextextended(b.opportunity_id::text,31));perform pg_advisory_xact_lock(hashtextextended('cancellation-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended(bid::text,52));perform pg_advisory_xact_lock(hashtextextended(op::text,0));
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');
 select * into prior from crm_private.b06_cancellation_operations where operation_id=op;
 if found then if prior.admin_scope<>s or prior.actor_id<>actor or prior.fingerprint<>fp or not exists(select 1 from crm_private.b06_cancellation_determinations where determination_id=prior.determination_id and booking_id=bid and admin_scope=s) then raise exception 'CANCELLATION_REPLAY_CONFLICT:E2';end if;r:=jsonb_build_object('id',prior.determination_id,'replayed',true,'result',prior.result);
 else
  hash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId','computed'])::text,'UTF8'),'sha256'),'hex');
  if crm_private.modification_proof((a->>'evidenceId')::uuid,did,s,'cancellation:'||action||':'||hash,(a->>'at')::timestamptz) is distinct from true or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'CANCELLATION_EVIDENCE_REQUIRED:E3';end if;
  select revision,after_data into mr,p from crm_private.b06_modification_revisions v join crm_private.b06_modifications m using(modification_id) where m.modification_id=mid and m.booking_id=bid and m.admin_scope=s order by revision desc limit 1;
  if mr is null then raise exception 'CANCELLATION_DENIED';end if;if mr<>(a->>'expectedModificationRevision')::bigint then raise exception 'CANCELLATION_REVISION_CONFLICT:E2';end if;
  select value into part from jsonb_array_elements(p->'parts') where value->>'id'=a->>'partId';
  if part is null or p->'request'->>'type' is distinct from 'cancellation' or part->'scope' is distinct from a->'scope' and not(a->'scope'->>'kind'='modality' and exists(select 1 from crm_private.b04_contributions where booking_id=bid and modality_id=(a->'scope'->>'id')::uuid and service_id=(part->'scope'->>'id')::uuid)) then raise exception 'CANCELLATION_SCOPE_REQUIRED:E3';end if;
  if (a->'scope')-array['kind','id','serviceId']<>'{}'::jsonb or not(a->'scope'?&array['kind','id']) then raise exception 'CANCELLATION_SCOPE_REQUIRED:E3';end if;
  material:=crm_private.cancellation_scope(a->'scope',bid,s);token:=crm_private.cancellation_token(a->'scope',bid,s);
  if token is distinct from a->>'expectedScopeToken' then raise exception 'CANCELLATION_REVISION_CONFLICT:E2';end if;
  select * into root from crm_private.b06_cancellation_determinations where determination_id=did;
  if root.determination_id is not null and (root.booking_id<>bid or root.admin_scope<>s or root.modification_id<>mid or root.part_id<>(a->>'partId')::uuid or root.scope is distinct from a->'scope') then raise exception 'CANCELLATION_DENIED';end if;
  select revision,after_data into rev,old from crm_private.b06_cancellation_revisions where determination_id=did order by revision desc limit 1;rev:=coalesce(rev,0);
  select o.* into prior from crm_private.b06_cancellation_operations o join crm_private.b06_cancellation_revisions v on v.determination_id=o.determination_id and v.revision=o.result_revision where o.determination_id=did and o.admin_scope=s and o.actor_id=actor and (v.event-array['operationId','evidenceId'])=(a-array['operationId','evidenceId']) order by o.recorded_at limit 1;
  if found then r:=jsonb_build_object('id',did,'replayed',true,'result',prior.result);insert into crm_private.b06_cancellation_operations values(op,did,s,actor,fp,prior.result,prior.result_revision,clock_timestamp());perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;end if;
  if rev<>(a->>'expectedRevision')::bigint then raise exception 'CANCELLATION_REVISION_CONFLICT:E2';end if;
  if action='determine' then
   f:=a->'facts';c:=a->'computed';ref:=f->'reference';
   if a?'adjustment' or jsonb_typeof(f) is distinct from 'object' or f-array['cause','policy','base','reference','nonRefundable','at']<>'{}'::jsonb or not(f?&array['cause','policy','base','reference','nonRefundable','at']) or f->>'at' is distinct from a->>'at' or f->'policy'->>'rule'<>'D011' or not crm_private.invoice_text(f->'policy'->'id') or not crm_private.invoice_text(f->'policy'->'version') or f->'policy'->'terms' is distinct from b.terms or jsonb_typeof(f->'base'->'components') is distinct from 'array' or f->'base'->>'kind' not in('participation','fixed','component') or (f->'cause'<>'null'::jsonb and f->>'cause' not in('provider','huescaventura','voluntary','no_show','late','alcohol_drugs','safety')) then raise exception 'CANCELLATION_MATERIAL_REQUIRED:E3';end if;
   if (f->'policy')-array['id','version','rule','terms']<>'{}'::jsonb or not(f->'policy'?&array['id','version','rule','terms']) or (f->'base')-array['kind','amount','count','start','modalityId','components','administratorDecision']<>'{}'::jsonb or not(f->'base'?&array['kind','amount','count','start','components']) or (f->'base'->'amount'<>'null'::jsonb and crm_private.payment_amount(f->'base'->'amount') is distinct from true) or coalesce(f->'base'->>'start','')!~'^[0-9]+$' or coalesce(f->'base'->>'count','')!~'^[1-9][0-9]*$' then raise exception 'CANCELLATION_MATERIAL_REQUIRED:E3';end if;
   if exists(select 1 from jsonb_array_elements(f->'base'->'components') v where jsonb_typeof(v) is distinct from 'object' or v-array['id','modalityId','acceptedVersion','source','unit','reason']<>'{}'::jsonb or exists(select 1 from jsonb_each(v) z where crm_private.invoice_text(z.value) is distinct from true)) then raise exception 'CANCELLATION_COMPONENTS_REQUIRED:E3';end if;
   startq:=(f->'base'->>'start')::bigint;countq:=(f->'base'->>'count')::bigint;if startq<0 or countq<1 then raise exception 'CANCELLATION_SCOPE_REQUIRED:E3';end if;
   if f->'base'->>'kind'='participation' then
    if a->'scope'->>'kind'<>'modality' or f->'base'->>'modalityId'<>a->'scope'->>'id' or (f->'base'->>'amount')::numeric is distinct from (material->'modality'->>'final_person_price')::numeric or startq+countq>(material->'modality'->>'participants')::bigint then raise exception 'CANCELLATION_BASE_REQUIRED:E3';end if;
   elsif f->'base'->'amount'<>'null'::jsonb then
    -- A component/fixed attribution is an explicit reviewed Administrator act on this case,
    -- never a distribution manufactured by the caller or from a tariff/cost/available balance.
    approval:=f->'base'->'administratorDecision';
    if jsonb_typeof(approval) is distinct from 'object' or not(approval?&array['recordId','evidenceId','reason']) or approval-array['recordId','evidenceId','reason']<>'{}'::jsonb or startq<>0 or countq<>1 or crm_private.invoice_text(approval->'reason') is distinct from true or jsonb_array_length(f->'base'->'components')=0 or not crm_private.confirmation_record((approval->>'recordId')::uuid,bid,s)
     or not crm_private.modification_proof((approval->>'evidenceId')::uuid,bid,s,'cancellation:base:'||encode(crm_crypto.digest(convert_to(jsonb_build_object('scope',a->'scope','base',(f->'base')-'administratorDecision','terms',b.terms)::text,'UTF8'),'sha256'),'hex'),(a->>'at')::timestamptz) then raise exception 'CANCELLATION_ADMIN_BASE_REQUIRED:E3';end if;
   end if;
   if ref<>'null'::jsonb then
    if not(ref?&array['scope','scopeId','date','zone','sourceRef','version','basis']) or ref-array['scope','scopeId','date','zone','sourceRef','version','basis']<>'{}'::jsonb then raise exception 'CANCELLATION_REFERENCE_REQUIRED:E3';end if;
    if ref->>'scope'<>(case a->'scope'->>'kind' when 'booking' then 'global' else a->'scope'->>'kind' end) or ref->>'scopeId'<>a->'scope'->>'id' or not crm_private.invoice_text(ref->'sourceRef') or not crm_private.invoice_text(ref->'version') or ref->>'basis' not in('default','express_contract') then raise exception 'CANCELLATION_REFERENCE_REQUIRED:E3';end if;
    if ref->>'basis'='default' and ref->>'date' is distinct from material->>'date' or ref->>'basis'='express_contract' and position(ref->>'date' in b.terms->>'text')=0 then raise exception 'CANCELLATION_REFERENCE_REQUIRED:E3';end if;
   end if;
   if f->'nonRefundable'<>'null'::jsonb and (not crm_private.invoice_text(f->'nonRefundable'->'clause') or position(f->'nonRefundable'->>'clause' in b.terms->>'text')=0 or not crm_private.modification_proof((f->'nonRefundable'->>'evidenceId')::uuid,bid,s,'cancellation:nonrefundable:'||encode(crm_crypto.digest(convert_to(jsonb_build_object('acceptanceId',b.acceptance_id,'terms',b.terms,'clause',f->'nonRefundable'->>'clause')::text,'UTF8'),'sha256'),'hex'),(a->>'at')::timestamptz)) then raise exception 'CANCELLATION_ACCEPTANCE_REQUIRED:E3';end if;
   if crm_private.cancellation_computed(f,c) is distinct from true then raise exception 'CANCELLATION_CALCULATION_REQUIRED:E3';end if;
   if root.determination_id is null then
    if exists(select 1 from crm_private.b06_cancellation_determinations x where x.booking_id=bid and x.admin_scope=s and crm_private.cancellation_scopes_overlap(x.scope,a->'scope',bid,s) and (x.scope is distinct from a->'scope' or int8range(x.start_quantity,x.start_quantity+x.quantity,'[)')&&int8range(startq,startq+countq,'[)'))) then raise exception 'CANCELLATION_PORTION_CONFLICT:E2';end if;
    insert into crm_private.b06_cancellation_determinations values(did,bid,mid,(a->>'partId')::uuid,a->'scope',s,startq,countq,op);
   elsif root.start_quantity<>startq or root.quantity<>countq then raise exception 'CANCELLATION_PORTION_CONFLICT:E2';end if;
   state:=jsonb_build_object('id',did,'revision',rev+1,'facts',f,'computed',c,'scope',a->'scope','scopeMaterial',material,'scopeToken',token,'modificationRevision',mr,'applied',false,'application',null,'previousApplication',coalesce(old->'application',old->'previousApplication','null'::jsonb));
  else
   if a?'facts' or root.determination_id is null or old->'computed'->>'status'<>'determined' or old->>'scopeToken'<>token or (old->>'modificationRevision')::bigint<>mr or old->>'applied'='true' then raise exception 'CANCELLATION_DETERMINATION_REQUIRED:E3';end if;
   if part->'applied' is null or part->'applied'='null'::jsonb then raise exception 'CANCELLATION_OPERATIONAL_APPLICATION_REQUIRED:E3';end if;
   if exists(select 1 from crm_private.b06_cancellation_applications x where x.booking_id=bid and crm_private.cancellation_scopes_overlap(x.scope,a->'scope',bid,s) and (x.scope is distinct from a->'scope' or int8range(x.start_quantity,x.start_quantity+x.quantity,'[)')&&int8range(root.start_quantity,root.start_quantity+root.quantity,'[)'))) then raise exception 'CANCELLATION_PORTION_CONFLICT:E2';end if;
   approval:=a->'adjustment';select * into ps from crm_private.b05_payment_schedules where schedule_id=(approval->>'scheduleId')::uuid and booking_id=bid and admin_scope=s;
   if not found or not(ps.scope_kind='global' and ps.scope_id=bid or ps.scope_kind=(case a->'scope'->>'kind' when 'booking' then 'global' else a->'scope'->>'kind' end) and ps.scope_id=(a->'scope'->>'id')::uuid) then raise exception 'CANCELLATION_OBLIGATION_REQUIRED:E3';end if;
   if not crm_private.modification_proof((approval->>'approvalEvidenceId')::uuid,did,s,'cancellation:approve:'||encode(crm_crypto.digest(convert_to(jsonb_build_object('determination',old,'adjustment',approval-'approvalEvidenceId')::text,'UTF8'),'sha256'),'hex'),(a->>'at')::timestamptz) then raise exception 'CANCELLATION_APPROVAL_REQUIRED:E3';end if;
   select revision,snapshot into sr,before_schedule from crm_private.b05_schedule_revisions where schedule_id=ps.schedule_id order by revision desc limit 1;
   if sr<>(approval->>'expectedRevision')::bigint then raise exception 'CANCELLATION_REVISION_CONFLICT:E2';end if;
   if jsonb_typeof(approval->'parts') is distinct from 'array' or jsonb_array_length(approval->'parts')<>jsonb_array_length(before_schedule->'parts') then raise exception 'CANCELLATION_OBLIGATION_REQUIRED:E3';end if;
   select sum((value->>'amount')::numeric) into total from jsonb_array_elements(before_schedule->'parts');
   newtotal:=0;parts:='[]'::jsonb;
   for p in select value from jsonb_array_elements(approval->'parts') loop
    select value into part from jsonb_array_elements(before_schedule->'parts') where value->>'slot'=p->>'slot';
    if part is null or not crm_private.obligation_part_valid(p) or p->'due' is distinct from part->'due' or exists(select 1 from jsonb_array_elements(parts) z where z->>'slot'=p->>'slot') then raise exception 'CANCELLATION_OBLIGATION_REQUIRED:E3';end if;
    parts:=parts||jsonb_build_array(p);newtotal:=newtotal+(p->>'amount')::numeric;
   end loop;
   if total<(old->'computed'->>'baseTotal')::numeric or newtotal<>total-(old->'computed'->>'right')::numeric then raise exception 'CANCELLATION_AMOUNT_REQUIRED:E3';end if;
   after_schedule:=jsonb_set(before_schedule,'{parts}',parts);
   insert into crm_private.b05_schedule_revisions values(ps.schedule_id,sr+1,s,after_schedule,actor,clock_timestamp());
   for p in select value from jsonb_array_elements(parts) loop
    select value into part from jsonb_array_elements(before_schedule->'parts') where value->>'slot'=p->>'slot';
    insert into crm_private.b05_obligation_adjustments values(gen_random_uuid(),ps.schedule_id,p->>'slot',sr+1,s,part,p,(p->>'amount')::numeric-(part->>'amount')::numeric,actor,a->>'reason',a->>'sourceRef',(a->>'evidenceId')::uuid,clock_timestamp());
   end loop;
   insert into crm_private.b05_obligation_operations values(op,bid,s,actor,fp,a,jsonb_build_object('id',ps.schedule_id,'revision',sr+1,'determinationId',did),clock_timestamp());
   insert into crm_private.b05_obligation_history values(op,bid,s,actor,before_schedule,after_schedule,a->>'sourceRef',a->>'reason',(a->>'evidenceId')::uuid,(a->>'at')::timestamptz,clock_timestamp());
   insert into crm_private.b06_cancellation_applications values(op,did,rev,bid,s,a->'scope',root.start_quantity,root.quantity,ps.schedule_id,sr+1,(old->'computed'->>'right')::numeric,(old->'computed'->>'retention')::numeric,actor,(a->>'evidenceId')::uuid,clock_timestamp());
   state:=old||jsonb_build_object('revision',rev+1,'applied',true,'application',jsonb_build_object('scheduleId',ps.schedule_id,'scheduleRevision',sr+1,'before',before_schedule->'parts','after',parts,'movementExecuted',false));
  end if;
  insert into crm_private.b06_cancellation_operations values(op,did,s,actor,fp,state,rev+1,clock_timestamp());
  insert into crm_private.b06_cancellation_revisions values(did,rev+1,s,op,action,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',(a->>'at')::timestamptz,clock_timestamp());
  r:=jsonb_build_object('id',did,'replayed',false,'result',state);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create or replace function crm_api.allocation_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare cancel_bid uuid;cancel_opp uuid;hf text[];tf text[];fs text[];a jsonb;p jsonb;prev crm_private.b05_fund_operations;pid uuid;op uuid;actor uuid;s text;fp text;hash text;rev bigint;pr bigint;action text;r jsonb;old jsonb;state jsonb;item jsonb;calcp jsonb;partq jsonb;start_at numeric;amt numeric;at_time timestamptz;basis jsonb;basis_hash text;original crm_private.b05_fund_distributions;act record;results jsonb:='[]';
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'ALLOCATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-ALLOCATION1' then raise exception 'ALLOCATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;action:=a->>'action';
 if jsonb_typeof(a) is distinct from 'object' or a-array['action','operationId','paymentId','expectedRevision','expectedPaymentRevision','sourceRef','reason','at','evidenceId','origin','cause','economicBasis','allocationId','originalAllocationId','originalActId','reconciliationId','expectedReconciliationRevision','destination','start','amount','expectedScheduleRevision','distributionId','total','parts','calculation']<>'{}'::jsonb
 or not(a ?& array['action','operationId','paymentId','expectedRevision','expectedPaymentRevision','sourceRef','reason','at','evidenceId']) or action not in ('plan','assign','verify','consume','reverse','rectify','distribute','reverse_distribution')
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision'!~'^[0-9]+$' or jsonb_typeof(a->'expectedPaymentRevision') is distinct from 'number' or a->>'expectedPaymentRevision'!~'^[0-9]+$'
 or coalesce(a->>'origin','manual') not in ('manual','ai') or (coalesce(a->>'origin','manual')='ai' and action<>'plan')
 or coalesce(a->>'cause','ordinary') not in ('ordinary','correction','cancellation','refund','new_obligation','modification')
 or exists(select 1 from jsonb_each(a) x where x.key in ('sourceRef','reason','at') and (jsonb_typeof(x.value)<>'string' or btrim(x.value#>>'{}')=''))
 or a->>'at'!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'ALLOCATION_INPUT_INVALID';end if;
 pid:=(a->>'paymentId')::uuid;op:=(a->>'operationId')::uuid;actor:=hf[12]::uuid;s:=hf[17];at_time:=(a->>'at')::timestamptz;
 if a->>'cause' in('cancellation','refund') then
  select d.booking_id,b.opportunity_id into cancel_bid,cancel_opp from crm_private.b06_cancellation_determinations d join crm_private.b04_bookings b using(booking_id) where d.determination_id=(a->'economicBasis'->>'originalRef')::uuid and d.admin_scope=s;
  if not found then raise exception 'ALLOCATION_D019_REQUIRED:E3';end if;
  perform pg_advisory_xact_lock(hashtextextended(cancel_opp::text,31));perform pg_advisory_xact_lock(hashtextextended(cancel_bid::text,52));
 end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('allocation-op:'||op,0));
 select * into prev from crm_private.b05_fund_operations where operation_id=op;
 if found then if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'ALLOCATION_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  perform pg_advisory_xact_lock(hashtextextended('payment-root:'||pid,0));
  select revision,snapshot into pr,p from crm_private.b05_payment_revisions where payment_id=pid and admin_scope=s order by revision desc limit 1;if not found then raise exception 'ALLOCATION_CONTEXT_REQUIRED';end if;
  select coalesce(max(revision),0) into rev from crm_private.b05_fund_revisions where payment_id=pid and admin_scope=s;
  if rev<>(a->>'expectedRevision')::bigint or pr<>(a->>'expectedPaymentRevision')::bigint then raise exception 'ALLOCATION_REVISION_CONFLICT:E2';end if;
  hash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId','calculation'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.payment_evidence((a->>'evidenceId')::uuid,pid,s,'allocation:'||action||':'||hash,at_time,action<>'plan') then raise exception 'ALLOCATION_EVIDENCE_REQUIRED';end if;
  if a->>'cause' in ('cancellation','refund','new_obligation','modification') then
   basis:=a->'economicBasis';basis_hash:=encode(crm_crypto.digest(convert_to((basis-'evidenceId')::text,'UTF8'),'sha256'),'hex');
   if jsonb_typeof(basis) is distinct from 'object' or basis-array['kind','amount','originalRef','sourceRef','version','evidenceId']<>'{}'::jsonb or not(basis ?& array['kind','amount','originalRef','sourceRef','version','evidenceId'])
   or exists(select 1 from unnest(array['kind','originalRef','sourceRef','version','evidenceId']) field where jsonb_typeof(basis->field) is distinct from 'string' or coalesce(btrim(basis->>field),'')='')
   or basis->>'kind' is distinct from a->>'cause' or not coalesce(crm_private.payment_amount(basis->'amount'),false) or btrim(basis->>'originalRef')='' or btrim(basis->>'sourceRef')='' or btrim(basis->>'version')=''
   or not crm_private.payment_evidence((basis->>'evidenceId')::uuid,pid,s,'fund-right:'||basis_hash,at_time,true) then raise exception 'ALLOCATION_D019_REQUIRED:E3';end if;
   if a?'amount' and abs((a->>'amount')::numeric)<>(basis->>'amount')::numeric or a?'total' and abs((a->>'total')::numeric)<>(basis->>'amount')::numeric then raise exception 'ALLOCATION_D019_REQUIRED:E3';end if;
   if a->>'cause' in('cancellation','refund') and crm_private.cancellation_fund_basis(basis,pid,s) is distinct from true then raise exception 'ALLOCATION_D019_REQUIRED:E3';end if;
  elsif a?'economicBasis' then raise exception 'ALLOCATION_INPUT_INVALID';end if;
  old:=crm_private.fund_summary(pid,s);
  if action in ('plan','assign','verify','rectify') then
   if action='rectify' then
    select act_id into op from crm_private.b05_allocation_acts where allocation_id=(a->>'originalAllocationId')::uuid and kind in ('assign','verify','distribute') order by recorded_at limit 1;
    if op is null then raise exception 'ALLOCATION_ORIGINAL_REQUIRED';end if;
    results:=jsonb_build_array(crm_private.fund_reverse(a||jsonb_build_object('originalActId',op),s,actor,(a->>'operationId')::uuid));op:=(a->>'operationId')::uuid;
   end if;
   state:=crm_private.fund_assign(a,p,s,actor,op,case when action='rectify' then 'assign' else action end,(a->>'originalAllocationId')::uuid);results:=results||jsonb_build_array(state);
  elsif action='consume' then
   select snapshot into state from crm_private.b05_allocation_revisions where allocation_id=(a->>'allocationId')::uuid and admin_scope=s order by revision desc limit 1;
   if state is null or state->>'paymentId'<>pid::text or state->>'status'<>'verified' or not coalesce(crm_private.payment_amount(a->'start'),false) or not coalesce(crm_private.payment_amount(a->'amount',true),false) or a->'destination' is distinct from state->'destination' then raise exception 'ALLOCATION_CONSUMPTION_REQUIRED';end if;
   start_at:=(a->>'start')::numeric;amt:=(a->>'amount')::numeric;
   if start_at<(state->>'start')::numeric or start_at+amt>(state->>'start')::numeric+(state->>'amount')::numeric or crm_private.fund_usable(state||jsonb_build_object('start',a->>'start','amount',a->>'amount'),p)<>amt
   or exists(select 1 from crm_private.b05_allocation_acts z where z.allocation_id=(state->>'id')::uuid and z.kind='consume' and z.start_amount<start_at+amt and z.start_amount-z.signed_amount>start_at and not exists(select 1 from crm_private.b05_allocation_acts correction where correction.original_act_id=z.act_id)) then raise exception 'ALLOCATION_CONSUMPTION_USED_OR_SUSPENDED';end if;
   insert into crm_private.b05_allocation_acts values(gen_random_uuid(),op,(state->>'id')::uuid,pid,s,action,start_at,-amt,null,state,state,actor,a->>'reason',a->>'sourceRef',(a->>'evidenceId')::uuid,at_time,clock_timestamp());results:=jsonb_build_array(jsonb_build_object('consumed',a->>'amount','purpose',state->'destination'->>'purpose','externalExecution',false));
  elsif action='reverse' then results:=jsonb_build_array(crm_private.fund_reverse(a,s,actor,op));
  elsif action in ('distribute','reverse_distribution') then
   if not coalesce(crm_private.fund_calculation_valid(a->'calculation'),false) or (a->'calculation'->'input'->>'total') is distinct from a->>'total' then raise exception 'ALLOCATION_CALCULATION_INVALID';end if;
   if action='distribute' then
    if not coalesce(crm_private.payment_amount(a->'total',true),false) or not coalesce(crm_private.payment_amount(a->'start'),false) or a->>'distributionId' is null or jsonb_array_length(a->'parts')<>jsonb_array_length(a->'calculation'->'output'->'parts') then raise exception 'ALLOCATION_DISTRIBUTION_REQUIRED';end if;
    insert into crm_private.b05_fund_distributions values((a->>'distributionId')::uuid,pid,s,op,null,a->'calculation',actor,clock_timestamp());start_at:=(a->>'start')::numeric;
    for calcp in select value from jsonb_array_elements(a->'calculation'->'output'->'parts') order by (value->>'order')::bigint loop
     select value into item from jsonb_array_elements(a->'parts') where value->>'id'=calcp->>'id';if item is null or item->>'weight'<>calcp->>'weight' or item->>'order'<>calcp->>'order' then raise exception 'ALLOCATION_DISTRIBUTION_REQUIRED';end if;
     if (calcp->>'amount')::numeric>0 then partq:=a||jsonb_build_object('allocationId',item->>'id','reconciliationId',item->>'reconciliationId','expectedReconciliationRevision',item->'expectedReconciliationRevision','destination',item->'destination','start',trunc(start_at,2)::text,'amount',calcp->>'amount');
      state:=crm_private.fund_assign(partq,p,s,actor,op,'distribute');results:=results||jsonb_build_array(state);end if;
     start_at:=start_at+(calcp->>'amount')::numeric;
    end loop;
   else
    select * into original from crm_private.b05_fund_distributions where distribution_id=(a->>'distributionId')::uuid and payment_id=pid and admin_scope=s;
    if not found or original.original_distribution_id is not null or (a->>'total')::numeric<>-(original.calculation->'output'->>'total')::numeric or a->'calculation'->'input'->'parts' is distinct from original.calculation->'input'->'parts' then raise exception 'ALLOCATION_ORIGINAL_REQUIRED';end if;
    for act in select z.act_id from crm_private.b05_allocation_acts z where z.operation_id=original.operation_id and z.kind='distribute' order by z.start_amount loop results:=results||jsonb_build_array(crm_private.fund_reverse(a||jsonb_build_object('originalActId',act.act_id),s,actor,op));end loop;
    insert into crm_private.b05_fund_distributions values(op,pid,s,op,original.distribution_id,a->'calculation',actor,clock_timestamp());
   end if;
  end if;
  rev:=crm_private.fund_refresh(pid,s,actor,'allocation_operation',op,null);
  r:=jsonb_build_object('id',pid,'replayed',false,'result',jsonb_build_object('revision',rev,'effects',results,'summary',crm_private.fund_summary(pid,s)));
  insert into crm_private.b05_fund_operations values(op,pid,s,actor,fp,a,r,clock_timestamp());
  insert into crm_private.b05_fund_history values(op,pid,s,old,r,actor,a->>'reason',a->>'sourceRef',(a->>'evidenceId')::uuid,at_time,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.cancellation_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;r jsonb;b crm_private.b04_bookings;m jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'CANCELLATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-CANCELLATION-READ1' then raise exception 'CANCELLATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if a->>'purpose'='basis' then
  if a-array['bookingId','scope','purpose']<>'{}'::jsonb or not(a?&array['bookingId','scope','purpose']) or (a->'scope')-array['kind','id','serviceId']<>'{}'::jsonb or not(a->'scope'?&array['kind','id']) or a->'scope'->>'kind' not in('booking','modality','service','night') then raise exception 'CANCELLATION_INPUT_INVALID';end if;
  select * into b from crm_private.b04_bookings where booking_id=(a->>'bookingId')::uuid and admin_scope=hf[17];
  if found then m:=crm_private.cancellation_scope(a->'scope',b.booking_id,hf[17]);r:=jsonb_build_object('bookingId',b.booking_id,'scope',a->'scope','scopeToken',crm_private.cancellation_token(a->'scope',b.booking_id,hf[17]),'referenceDate',m->'date','acceptedVersion',b.version_id,'terms',b.terms,'participation',case when a->'scope'->>'kind'='modality' then jsonb_build_object('modalityId',a->'scope'->'id','amount',m->'modality'->>'final_person_price','quantity',m->'modality'->'participants','unit','participation') else null end);end if;
  perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');return r;
 end if;
 if a-array['bookingId','determinationId','purpose']<>'{}'::jsonb or not(a?&array['bookingId','determinationId','purpose']) or a->>'purpose' not in('history','right') then raise exception 'CANCELLATION_INPUT_INVALID';end if;
 select x.after_data into r from crm_private.b06_cancellation_determinations d join crm_private.b06_cancellation_revisions x using(determination_id) where d.booking_id=(a->>'bookingId')::uuid and d.determination_id=(a->>'determinationId')::uuid and d.admin_scope=hf[17] order by x.revision desc limit 1;
 if r is not null then
  if a->>'purpose'='right' then r:=jsonb_build_object('id',r->'id','revision',r->'revision','status',r->'computed'->'status','right',r->'computed'->'right','retention',r->'computed'->'retention','missing',r->'computed'->'missing','applied',r->'applied','currentlyApplicable',r->>'scopeToken'=crm_private.cancellation_token(r->'scope',(a->>'bookingId')::uuid,hf[17]));
  else r:=r||jsonb_build_object('history',(select jsonb_agg(to_jsonb(x) order by x.revision) from crm_private.b06_cancellation_revisions x where x.determination_id=(a->>'determinationId')::uuid));end if;
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');return r;
end$$;
do $$declare f record;begin for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='crm_private' and p.proname like 'cancellation_%' loop execute format('alter function %s owner to crm_h0_f2_owner',f.signature);execute format('revoke all on function %s from public',f.signature);execute format('grant execute on function %s to crm_h0_f2_executor',f.signature);end loop;end$$;
alter function crm_api.cancellation_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
alter function crm_api.cancellation_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.cancellation_apply(bytea,bytea,bytea,bytea,bytea),crm_api.cancellation_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.cancellation_apply(bytea,bytea,bytea,bytea,bytea),crm_api.cancellation_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
