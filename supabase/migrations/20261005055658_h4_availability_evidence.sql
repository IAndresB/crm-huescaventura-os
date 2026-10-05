-- H4-005/006: historical availability and scoped usable coverage; no firm confirmation.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'AVAILABILITY_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b04_availability(
 availability_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),admin_scope text not null,
 initial_operation_id uuid not null
);
create table crm_private.b04_availability_operations(
 operation_id uuid primary key,availability_id uuid not null references crm_private.b04_availability(availability_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,result jsonb not null,result_revision bigint not null,
 recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b04_availability_revisions(
 availability_id uuid not null references crm_private.b04_availability(availability_id),revision bigint not null check(revision>0),admin_scope text not null,
 operation_id uuid not null unique references crm_private.b04_availability_operations(operation_id) deferrable initially deferred,
 action_kind text not null check(action_kind in ('query','receive','verify','review')),
 event jsonb not null,before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 evidence_id uuid not null references crm_private.b07_records(record_id),source_ref text not null,reason text not null,
 occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(availability_id,revision)
);
alter table crm_private.b04_availability add foreign key(initial_operation_id) references crm_private.b04_availability_operations(operation_id) deferrable initially deferred;
alter table crm_private.b04_availability_operations add foreign key(availability_id,result_revision) references crm_private.b04_availability_revisions(availability_id,revision) deferrable initially deferred;
create index availability_booking on crm_private.b04_availability(admin_scope,booking_id);
create unique index availability_response_fact on crm_private.b04_availability_revisions(admin_scope,(event->'data'->>'factId')) where action_kind='receive';
do $$declare t text;r text;begin foreach t in array array['b04_availability','b04_availability_operations','b04_availability_revisions'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy availability_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy availability_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger availability_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
-- Source authority and actual scope references are checked independently of candidate content.
create function crm_private.availability_source(x jsonb,bid uuid,sid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$begin
 if jsonb_typeof(x) is distinct from 'object' or x-array['kind','id']<>'{}'::jsonb or not(x ?& array['kind','id']) then return false;end if;
 if x->>'kind'='internal' then return exists(select 1 from crm_private.crm_actors a join crm_private.b04_services v on v.service_id=sid where a.actor_id=(x->>'id')::uuid and a.enabled and a.admin_scope=s and v.admin_scope=s and v.booking_id=bid and v.nature='internal');
 elsif x->>'kind'='provider' then return exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items e on e.item_id=r.item_id join crm_private.b04_services v on v.service_id=sid where r.revision_id=(x->>'id')::uuid and r.admin_scope=s and e.item_kind='provider' and v.admin_scope=s and v.booking_id=bid and v.nature='external');end if;return false;end$$;
create function crm_private.availability_coverage(x jsonb,bid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$declare v crm_private.b04_services;b crm_private.b04_bookings;d text;begin
 if jsonb_typeof(x) is distinct from 'object' or x-array['serviceId','nightId','serviceRevisionId','serviceRevision','bookingRevision','variant','dates','quantity','unitRevisionId','purpose']<>'{}'::jsonb
 or not(x ?& array['serviceId','nightId','serviceRevisionId','serviceRevision','bookingRevision','variant','dates','quantity','unitRevisionId','purpose'])
 or not coalesce(crm_private.invoice_text(x->'purpose'),false) or jsonb_typeof(x->'dates') is distinct from 'array' or jsonb_array_length(x->'dates')=0
 or coalesce(x->>'quantity','') !~ '^[0-9]+(\.[0-9]+)?$' or (x->>'quantity')::numeric<=0 then return false;end if;
 select * into v from crm_private.b04_services where service_id=(x->>'serviceId')::uuid and booking_id=bid and admin_scope=s;
 select * into b from crm_private.b04_bookings where booking_id=bid and admin_scope=s;
 if v.service_id is null or b.booking_id is null or v.revision::text is distinct from x->>'serviceRevision' or b.revision::text is distinct from x->>'bookingRevision'
 or v.service_revision_id::text is distinct from x->>'serviceRevisionId' or coalesce(v.applied->'variant','null') is distinct from x->'variant'
 or not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i on i.item_id=r.item_id where r.admin_scope=s and i.admin_scope=s and i.item_kind='unit' and r.revision_id=(x->>'unitRevisionId')::uuid) then return false;end if;
 for d in select jsonb_array_elements_text(x->'dates') loop if d !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then return false;end if;perform d::date;end loop;
 if x->'nightId'<>'null'::jsonb and not exists(select 1 from crm_private.b04_nights where night_id=(x->>'nightId')::uuid and service_id=v.service_id and admin_scope=s and x->'dates'=jsonb_build_array(night_date::text)) then return false;end if;return true;end$$;
create function crm_private.availability_time(x jsonb) returns boolean language plpgsql immutable set search_path=pg_catalog,pg_temp as $$begin
 if not coalesce(crm_private.invoice_text(x),false) or (x#>>'{}') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then return false;end if;perform (x#>>'{}')::timestamptz;return true;end$$;
create function crm_api.availability_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,tf2p bytea,tf2s bytea,tf1p bytea,tf1s bytea,tq bytea) returns jsonb
 language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;op uuid;iid uuid;bid uuid;actor uuid;s text;action text;fp text;proofhash text;rev bigint;at_time timestamptz;
 prev crm_private.b04_availability_operations;root crm_private.b04_availability;old jsonb;state jsonb;r jsonb;data jsonb;response jsonb;record crm_private.b07_records;task jsonb;follow boolean:=false;task_id uuid;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'AVAILABILITY_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-AVAILABILITY1' then raise exception 'AVAILABILITY_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a ?& array['action','operationId','availabilityId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','data'])
 or a-array['action','operationId','availabilityId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','data','origin']<>'{}'::jsonb
 or exists(select 1 from unnest(array['action','operationId','availabilityId','bookingId','sourceRef','reason','evidenceId']) k where not coalesce(crm_private.invoice_text(a->k),false))
 or not coalesce(crm_private.availability_time(a->'at'),false) or jsonb_typeof(a->'data') is distinct from 'object'
 or coalesce(a->>'expectedRevision','') !~ '^(0|[1-9][0-9]*)$' or coalesce(a->>'origin','manual')<>'manual' then raise exception 'AVAILABILITY_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;iid:=(a->>'availabilityId')::uuid;bid:=(a->>'bookingId')::uuid;actor:=hf[12]::uuid;s:=hf[17];action:=a->>'action';data:=a->'data';at_time:=(a->>'at')::timestamptz;
 if action not in ('query','receive','verify','review') then raise exception 'AVAILABILITY_INPUT_INVALID';end if;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s) then raise exception 'AVAILABILITY_DENIED';end if;
 perform pg_advisory_xact_lock(hashtextextended('availability-booking:'||bid,0));
 -- H2 parent is an immutable revision-1 baseline; advisory unit and version check protect its use.
 select * into root from crm_private.b04_availability where availability_id=iid;
 if root.availability_id is not null and (root.booking_id<>bid or root.admin_scope<>s) then raise exception 'AVAILABILITY_DENIED';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('availability-op:'||op,0));
 select * into prev from crm_private.b04_availability_operations where operation_id=op;
 if found then
  if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'AVAILABILITY_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  proofhash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.payment_evidence((a->>'evidenceId')::uuid,iid,s,'availability:'||action||':'||proofhash,at_time,true)
  or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'AVAILABILITY_EVIDENCE_REQUIRED:E3';end if;
  if root.availability_id is not null then select revision,after_data into rev,old from crm_private.b04_availability_revisions where availability_id=iid order by revision desc limit 1;end if;
  -- Identity of the fact is the stable root/query or explicit response factId, never similar text.
  if action='receive' and exists(select 1 from crm_private.b04_availability_revisions where admin_scope=s and event->'data'->>'factId'=data->>'factId' and (availability_id<>iid or event->'data' is distinct from data)) then raise exception 'AVAILABILITY_FACT_CONFLICT:E2';end if;
  if (action='query' and old->'query'=data) or (action='receive' and exists(select 1 from crm_private.b04_availability_revisions where availability_id=iid and admin_scope=s and action_kind='receive' and event->'data'=data)) then state:=old;
  else
   if coalesce(rev,0)<>(a->>'expectedRevision')::bigint then raise exception 'AVAILABILITY_REVISION_CONFLICT:E2';end if;
   state:=coalesce(old,jsonb_build_object('id',iid,'bookingId',bid,'query',null,'response',null,'confirmed',null,'review',null));
   if action in ('query','receive') then
    if not coalesce(crm_private.availability_coverage(data->'coverage',bid,s),false) or not coalesce(crm_private.availability_source(data->'source',bid,(data->'coverage'->>'serviceId')::uuid,s),false)
    or not coalesce(crm_private.availability_time(data->'happenedAt'),false) or not coalesce(crm_private.invoice_text(data->'content'),false) then raise exception 'AVAILABILITY_FACT_REQUIRED:E3';end if;
    -- Service baseline is immutable; no UPDATE grant is introduced to lock it.
    if old is not null and (data->'coverage'->'serviceId' is distinct from coalesce(old->'query'->'coverage'->'serviceId',old->'response'->'coverage'->'serviceId')
    or data->'coverage'->'nightId' is distinct from coalesce(old->'query'->'coverage'->'nightId',old->'response'->'coverage'->'nightId')
    or data->'coverage'->'purpose' is distinct from coalesce(old->'query'->'coverage'->'purpose',old->'response'->'coverage'->'purpose')
    or data->'source' is distinct from coalesce(old->'query'->'source',old->'response'->'source')) then raise exception 'AVAILABILITY_SCOPE_CONFLICT:E2';end if;
    if action='query' then
     if old is not null or data-array['coverage','source','happenedAt','content']<>'{}'::jsonb then raise exception 'AVAILABILITY_QUERY_REQUIRED:E3';end if;
     state:=state||jsonb_build_object('query',data,'status','Consulta registrada','serviceAvailabilityState','Disponibilidad consultada');follow:=true;
    else
     if data-array['coverage','source','happenedAt','content','factId','recordId','certainty','conditions','validUntil']<>'{}'::jsonb
     or not(data ?& array['factId','recordId','certainty','conditions','validUntil']) or coalesce(data->>'certainty' not in ('communicated','negative','uncertain'),true)
     or not coalesce(crm_private.invoice_text(data->'conditions'),false) or not coalesce(crm_private.invoice_text(data->'factId'),false)
     or (data->'validUntil'<>'null'::jsonb and not coalesce(crm_private.availability_time(data->'validUntil'),false)) then raise exception 'AVAILABILITY_RESPONSE_REQUIRED:E3';end if;
     perform (data->>'factId')::uuid;
     select * into record from crm_private.b07_records where record_id=(data->>'recordId')::uuid and admin_scope=s;
     if record.record_id is null or not exists(select 1 from crm_private.b07_links where record_id=record.record_id and admin_scope=s and context_kind='booking' and context_id=bid) then raise exception 'AVAILABILITY_DENIED';end if;
     if exists(select 1 from crm_private.b04_availability_revisions where admin_scope=s and event->'data'->>'factId'=data->>'factId' and event->'data' is distinct from data) then raise exception 'AVAILABILITY_FACT_CONFLICT:E2';end if;
     state:=state||jsonb_build_object('response',data,'status',case data->>'certainty' when 'communicated' then 'Disponibilidad comunicada' when 'negative' then 'Negativa' else 'Incierta' end);
     if old->'confirmed'<>'null'::jsonb then state:=state||jsonb_build_object('review',jsonb_build_object('cause','Nueva comunicación pendiente de contraste','before',old->'confirmed','after',data,'dependencies',jsonb_build_array(data->'coverage'),'evidenceId',a->'evidenceId','result','pending'),'status','Pendiente de revalidación');follow:=true;end if;
     if data->>'certainty'<>'communicated' then follow:=true;state:=state||jsonb_build_object('review',jsonb_build_object('cause',data->>'content','before',old->'confirmed','after',data,'dependencies',jsonb_build_array(data->'coverage'),'evidenceId',a->'evidenceId','result','pending'));end if;
    end if;
   elsif action='verify' then
    response:=old->'response';
    if response is null or response='null'::jsonb or response->>'certainty'<>'communicated' or data-array['coverage','source','actionAt','actionUntil','authority','unequivocal','checks','precedence','basis','resolvedAspects']<>'{}'::jsonb
    or not(data ?& array['coverage','source','actionAt','actionUntil','authority','unequivocal','checks','precedence','basis','resolvedAspects'])
    or data->'coverage' is distinct from response->'coverage' or data->'source' is distinct from response->'source'
    or not coalesce(crm_private.availability_coverage(data->'coverage',bid,s),false) or not coalesce(crm_private.availability_source(data->'source',bid,(data->'coverage'->>'serviceId')::uuid,s),false)
    or data->'authority' is distinct from 'true'::jsonb or data->'unequivocal' is distinct from 'true'::jsonb
    or data->'checks' is distinct from '{"dates":true,"quantity":true,"unit":true,"variant":true,"conditions":true,"capacity":true,"validity":true}'::jsonb
    or not coalesce(crm_private.availability_time(data->'actionAt'),false) or not coalesce(crm_private.availability_time(data->'actionUntil'),false)
    or not coalesce(crm_private.invoice_text(data->'basis'),false) or jsonb_typeof(data->'resolvedAspects') is distinct from 'array'
    then raise exception 'AVAILABILITY_VERIFICATION_REQUIRED:E3';end if;
    if (response->>'happenedAt')::timestamptz>at_time or (response->>'happenedAt')::timestamptz>(data->>'actionAt')::timestamptz or at_time>(data->>'actionAt')::timestamptz then raise exception 'AVAILABILITY_CHRONOLOGY_REQUIRED:E3';end if;
    if (data->>'actionUntil')::timestamptz<(data->>'actionAt')::timestamptz or (response->'validUntil'<>'null'::jsonb and (data->>'actionUntil')::timestamptz>=(response->>'validUntil')::timestamptz) then raise exception 'AVAILABILITY_EXPIRED:E3';end if;
    if old->'confirmed'<>'null'::jsonb and not (
      data->>'precedence'='verified-newer' and (response->>'happenedAt')::timestamptz>(old->'confirmed'->'response'->>'happenedAt')::timestamptz
      or data->>'precedence'='ratified' and response=old->'confirmed'->'response' and a->'evidenceId' is distinct from old->'confirmed'->'evidenceId' and at_time>=(old->'confirmed'->>'at')::timestamptz
    ) then raise exception 'AVAILABILITY_DISCREPANCY:E8';end if;
    if old->'review'<>'null'::jsonb and not(data->'resolvedAspects' @> coalesce(old->'review'->'aspects','["dates","quantity","unit","variant","conditions","capacity","validity"]')) then raise exception 'AVAILABILITY_REVIEW_INCOMPLETE:E3';end if;
    state:=state||jsonb_build_object('status','Disponibilidad confirmada','confirmed',jsonb_build_object('response',response,'verification',data,'evidenceId',a->'evidenceId','actorId',actor,'at',at_time),'review',null);
   else
    if old is null or data-array['cause','before','after','dependencies','aspects','result']<>'{}'::jsonb or not(data ?& array['cause','before','after','dependencies','aspects','result'])
    or not coalesce(crm_private.invoice_text(data->'cause'),false) or jsonb_typeof(data->'dependencies') is distinct from 'array' or jsonb_array_length(data->'dependencies')=0
    or data->'before' is distinct from old->'confirmed' or jsonb_typeof(data->'aspects') is distinct from 'array' or jsonb_array_length(data->'aspects')=0
    or coalesce(data->>'result' not in ('pending','rejected','uncertain'),true) then raise exception 'AVAILABILITY_REVIEW_REQUIRED:E3';end if;
    if exists(select 1 from jsonb_array_elements(data->'dependencies') d where d is distinct from coalesce(old->'response'->'coverage',old->'query'->'coverage'))
    or exists(select 1 from jsonb_array_elements_text(data->'aspects') k where k not in ('dates','quantity','unit','variant','conditions','capacity','validity'))
    or jsonb_typeof(data->'after') is distinct from 'object' or (data->'after')-array['dates','quantity','unitRevisionId','variant','conditions','capacity','source','validUntil','schedule']<>'{}'::jsonb then raise exception 'AVAILABILITY_REVIEW_SCOPE_REQUIRED:E3';end if;
    state:=state||jsonb_build_object('status','Pendiente de revalidación','review',data||jsonb_build_object('evidenceId',a->'evidenceId','actorId',actor,'at',at_time));follow:=true;
   end if;
   rev:=coalesce(rev,0)+1;state:=state||jsonb_build_object('revision',rev);
  end if;
  r:=jsonb_build_object('id',iid,'replayed',false,'result',state);
  if root.availability_id is null then insert into crm_private.b04_availability values(iid,bid,s,op);end if;
  if old is distinct from state then insert into crm_private.b04_availability_revisions values(iid,rev,s,op,action,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());end if;
  if follow then
   fs:=crm_f1.fields(tq);task:=fs[2]::jsonb;
   if fs[1]<>'CRM-H1-TASK-1' or task->>'taskId'<>iid::text or task->>'operationId'<>op::text or task->'identity' is distinct from jsonb_build_object('causeKind','availability','causeId',iid,'contextKind','booking','contextId',bid,'scopeRef',iid,'effect','availability-review')
   or task->'material' is distinct from '{"title":"Revisar disponibilidad del alcance","deadline":{"kind":"unknown","reason":"No consta plazo informado para el seguimiento"},"priority":{"kind":"pending","reason":"Prioridad no configurada"},"sourceRef":"SM-AV-04","sourceVersion":"1","triggerRef":"BR-TASK-005","triggerVersion":"1"}'::jsonb then raise exception 'AVAILABILITY_TASK_REQUIRED';end if;
   select result_ref into task_id from crm_api.b07_task_apply(tf2p,tf2s,tf1p,tf1s,tq);
  end if;
  insert into crm_private.b04_availability_operations values(op,iid,s,actor,fp,r,rev,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.availability_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;s text;bid uuid;iid uuid;r jsonb;items jsonb;usable boolean;v jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'AVAILABILITY_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-AVAILABILITY-READ1' then raise exception 'AVAILABILITY_INPUT_INVALID';end if;a:=fs[2]::jsonb;s:=hf[17];bid:=(a->>'bookingId')::uuid;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s) then r:=null;
 elsif a?'availabilityId' then
  if a-array['availabilityId','bookingId']<>'{}'::jsonb then raise exception 'AVAILABILITY_INPUT_INVALID';end if;
  select availability_id into iid from crm_private.b04_availability where availability_id=(a->>'availabilityId')::uuid and booking_id=bid and admin_scope=s;
  select after_data into r from crm_private.b04_availability_revisions where availability_id=iid and admin_scope=s order by revision desc limit 1;
  if r is not null then r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action_kind,'before',before_data,'after',after_data,'actorId',actor_id,'sourceRef',source_ref,'reason',reason,'evidenceId',evidence_id,'at',occurred_at,'recordedAt',recorded_at) order by revision) from crm_private.b04_availability_revisions where availability_id=iid and admin_scope=s));end if;
 else
  if a-array['bookingId','coverage','source','actionAt','actionUntil']<>'{}'::jsonb or not coalesce(crm_private.availability_coverage(a->'coverage',bid,s),false)
  or not coalesce(crm_private.availability_time(a->'actionAt'),false) or not coalesce(crm_private.availability_time(a->'actionUntil'),false) then raise exception 'AVAILABILITY_INPUT_INVALID';end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',i.availability_id,'revision',v.after_data->'revision','status',v.after_data->'status','confirmed',case when v.after_data->'confirmed'='null'::jsonb then 'null'::jsonb else jsonb_build_object('response',(v.after_data->'confirmed'->'response')-array['content','factId','recordId','certainty'],'verification',jsonb_build_object('actionAt',v.after_data->'confirmed'->'verification'->'actionAt','actionUntil',v.after_data->'confirmed'->'verification'->'actionUntil')) end,'pending',v.after_data->'review'<>'null'::jsonb)),'[]') into items
  from crm_private.b04_availability i cross join lateral (select after_data from crm_private.b04_availability_revisions where availability_id=i.availability_id order by revision desc limit 1) v
  where i.booking_id=bid and i.admin_scope=s and coalesce(v.after_data->'response'->'coverage',v.after_data->'query'->'coverage')->>'serviceId'=a->'coverage'->>'serviceId'
  and coalesce(v.after_data->'response'->'coverage',v.after_data->'query'->'coverage')->'nightId'=a->'coverage'->'nightId'
  and coalesce(v.after_data->'response'->'coverage',v.after_data->'query'->'coverage')->'purpose'=a->'coverage'->'purpose'
  and coalesce(v.after_data->'response'->'source',v.after_data->'query'->'source')=a->'source'
  and (v.after_data->'response'->'coverage'=a->'coverage' or v.after_data->'confirmed'->'response'->'coverage'=a->'coverage' or v.after_data->'query'->'coverage'=a->'coverage');
  usable:=false;
  for v in select value from jsonb_array_elements(items) loop
   if v->>'status'='Disponibilidad confirmada' and v->'confirmed'->'response'->'coverage'=a->'coverage' and v->'confirmed'->'response'->'source'=a->'source'
   and v->'confirmed'->'verification'->'actionAt'=a->'actionAt' and v->'confirmed'->'verification'->'actionUntil'=a->'actionUntil'
   and (v->'confirmed'->'response'->'validUntil'='null'::jsonb or (a->>'actionUntil')::timestamptz<(v->'confirmed'->'response'->>'validUntil')::timestamptz) then usable:=true;end if;
  end loop;
  if exists(select 1 from jsonb_array_elements(items) e where e->'pending'='true'::jsonb) then usable:=false;end if;
  -- Multiple independent roots with differing verified external facts cannot choose precedence by arrival.
  if (select count(distinct (e->'confirmed'->'response')-'happenedAt') from jsonb_array_elements(items) e where e->'confirmed'<>'null'::jsonb and e->'confirmed'->'response'->'coverage'=a->'coverage')>1 then usable:=false;end if;
  r:=jsonb_build_object('usable',usable,'certainty',case when usable then 'verified-for-action' else 'pending' end,'missing',case when usable then '[]'::jsonb else case when (select count(distinct (e->'confirmed'->'response')-'happenedAt') from jsonb_array_elements(items) e where e->'confirmed'<>'null'::jsonb and e->'confirmed'->'response'->'coverage'=a->'coverage')>1 then '["E8","coverage-or-review"]'::jsonb else '["coverage-or-review"]'::jsonb end end,'evidence',items,'serviceConfirmed',false,'firmReservation',false,'executed',false);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
do $$declare x record;begin for x in select p.oid,p.proname,n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('crm_api','crm_private') and p.proname like 'availability_%' loop
 execute format('alter function %s owner to %I',x.oid::regprocedure,case when x.nspname='crm_api' then 'crm_h0_f2_executor' else 'crm_h0_f2_owner' end);
 execute format('revoke execute on function %s from public',x.oid::regprocedure);
 execute format('grant execute on function %s to %I',x.oid::regprocedure,case when x.nspname='crm_api' then 'crm_h0_runtime' else 'crm_h0_f2_executor' end);
end loop;end$$;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
