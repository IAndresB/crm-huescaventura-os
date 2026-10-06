-- TSK-H4-020/021 only. Append-only evaluations; ordinary facts remain authoritative.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'BOOKING_PREPARATION_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner,crm_h0_f2_executor;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b04_preparation_operations(operation_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings,admin_scope text not null,actor_id uuid not null references crm_private.crm_actors,fingerprint text not null,result jsonb not null,recorded_at timestamptz not null default clock_timestamp());
create table crm_private.b04_preparation_evaluations(booking_id uuid not null references crm_private.b04_bookings,revision bigint not null check(revision>0),admin_scope text not null,operation_id uuid not null unique references crm_private.b04_preparation_operations deferrable initially deferred,actor_id uuid not null references crm_private.crm_actors,evidence_id uuid not null references crm_private.b07_records,material jsonb not null,state jsonb not null,recorded_at timestamptz not null default clock_timestamp(),primary key(booking_id,revision));
do $$declare t text;begin foreach t in array array['b04_preparation_operations','b04_preparation_evaluations']loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy preparation_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);execute format('create policy preparation_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);execute format('revoke all on crm_private.%I from public,crm_h0_runtime,crm_h0_ha_tx',t);
 execute format('create trigger preparation_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
end loop;end$$;
create table crm_private.b04_preparation_approvals(reservation_id text primary key,booking_id uuid not null references crm_private.b04_bookings,operation_id uuid not null unique references crm_private.b04_preparation_operations deferrable initially deferred,admin_scope text not null,material text not null,recorded_at timestamptz not null default clock_timestamp());
alter table crm_private.b04_preparation_approvals owner to crm_h0_f2_owner;alter table crm_private.b04_preparation_approvals enable row level security;alter table crm_private.b04_preparation_approvals force row level security;create policy preparation_approval_executor on crm_private.b04_preparation_approvals to crm_h0_f2_executor using(true)with check(true);create policy preparation_approval_migration on crm_private.b04_preparation_approvals to crm_h0_migration using(true)with check(true);grant select,insert on crm_private.b04_preparation_approvals to crm_h0_f2_executor,crm_h0_migration;revoke all on crm_private.b04_preparation_approvals from public,crm_h0_runtime,crm_h0_ha_tx;create trigger preparation_approval_immutable before update or delete on crm_private.b04_preparation_approvals for each row execute function crm_private.payment_immutable();
-- Evaluation owns only this root. Existing writers retain their original roots.
create function crm_private.booking_preparation_lock(bid uuid)returns void language sql volatile set search_path=pg_catalog,pg_temp as $$select pg_advisory_xact_lock(hashtextextended('booking-preparation:'||bid,0))$$;
-- Dependency writers acquire the evaluation root before their new material is visible.
-- No evaluator takes writer-private locks after this root. Multi-Booking roots sort.
create function crm_private.booking_preparation_writer()returns trigger language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare x jsonb:=to_jsonb(new);bid uuid;ids uuid[];sid uuid;pid uuid;opp uuid;rid uuid;begin
 if x?'booking_id' then ids:=array[(x->>'booking_id')::uuid];
 elsif x?'payment_id' then pid:=(x->>'payment_id')::uuid;select array_agg(distinct b order by b)into ids from(select booking_id b from crm_private.b05_reconciliations where payment_id=pid union select booking_id from crm_private.b05_allocations where payment_id=pid union select (snapshot->'detection'->>'bookingId')::uuid from crm_private.b05_payment_revisions where payment_id=pid)t;
 elsif x?'modification_id' then select array[booking_id]into ids from crm_private.b06_modifications where modification_id=(x->>'modification_id')::uuid;
 elsif x?'allocation_id' then select array[booking_id]into ids from crm_private.b05_allocations where allocation_id=(x->>'allocation_id')::uuid;
 elsif x?'refund_id' then select array[booking_id]into ids from crm_private.b05_refunds where refund_id=(x->>'refund_id')::uuid;
 elsif x?'deposit_id' then select array[booking_id]into ids from crm_private.b05_deposits where deposit_id=(x->>'deposit_id')::uuid;
 elsif x?'provider_payment_id' then select array[booking_id]into ids from crm_private.b05_provider_payments where provider_payment_id=(x->>'provider_payment_id')::uuid;
 elsif x?'schedule_id' then select array[booking_id]into ids from crm_private.b05_payment_schedules where schedule_id=(x->>'schedule_id')::uuid;
 elsif x?'requirement_id' then select array[booking_id]into ids from crm_private.b07_requirements where requirement_id=(x->>'requirement_id')::uuid;
 elsif x?'confirmation_id' then select array[booking_id]into ids from crm_private.b04_confirmations where confirmation_id=(x->>'confirmation_id')::uuid;
 elsif x?'subject_ref' then sid:=(x->>'subject_ref')::uuid;select array_agg(booking_id order by booking_id)into ids from crm_private.b04_services where service_id=sid;
 elsif x?'opportunity_id' then opp:=(x->>'opportunity_id')::uuid;select array_agg(booking_id order by booking_id)into ids from crm_private.b04_bookings where opportunity_id=opp;
 elsif x?'hold_id' then select array_agg(b.booking_id order by b.booking_id)into ids from crm_private.b04_holds h join crm_private.b04_bookings b using(opportunity_id)where h.hold_id=(x->>'hold_id')::uuid;
 elsif x?'availability_id' then select array_agg(a.booking_id order by a.booking_id)into ids from crm_private.b04_availability a where a.availability_id=(x->>'availability_id')::uuid;
 end if;
 if x?'payment_id'then pid:=(x->>'payment_id')::uuid;select array_agg(distinct b order by b)into ids from(select unnest(ids)b union select booking_id from crm_private.b05_reconciliations where payment_id=pid union select booking_id from crm_private.b05_allocations where payment_id=pid union select (v->>'bookingId')::uuid from jsonb_array_elements(coalesce(x->'snapshot'->'correspondences','[]'))v)t;end if;
 foreach bid in array coalesce(ids,array[]::uuid[])loop if bid is not null then perform crm_private.booking_preparation_lock(bid);end if;end loop;return new;
end$$;
-- All dependency sources are immutable records or versioned material. No CRUD grant.
-- Original bodies/OID/owners/ACL/config are deliberately unchanged.
do $$declare t text;begin foreach t in array array['b04_services','b04_operational_versions','b06_modifications','b06_modification_revisions','b04_confirmation_facts','b04_confirmation_revisions','b04_confirmation_evaluations','b07_requirements','b07_requirement_revisions','catalog_applications','b04_availability','b04_availability_revisions','b04_hold_revisions','b05_payment_schedules','b05_allocations','b05_schedule_revisions','b05_obligation_adjustments','b05_payment_revisions','b05_allocation_revisions','b05_allocation_acts','b05_fund_revisions','b05_reconciliations','b05_refund_revisions','b05_deposit_revisions','b05_provider_payment_revisions']loop
 if to_regclass('crm_private.'||t)is null then raise exception 'BOOKING_PREPARATION_DEPENDENCY_TABLE_MISSING:%',t;end if;
 execute format('create trigger preparation_material_lock before insert or update on crm_private.%I for each row execute function crm_private.booking_preparation_writer()',t);
end loop;end$$;
create function crm_private.booking_preparation_inputs(bid uuid,s text)returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare sv record;c record;v jsonb;facts jsonb;reqs jsonb;scopes jsonb:='[]';services jsonb:='[]';schedules jsonb;begin
 for sv in select * from crm_private.b04_services where booking_id=bid and admin_scope=s order by service_id loop
 v:=crm_private.modification_scope(jsonb_build_object('kind','service','id',sv.service_id),bid,s);
 if not coalesce((v->>'cancelled')::boolean,false)then
  if exists(select 1 from crm_private.b04_nights where service_id=sv.service_id)then
   for c in select * from crm_private.b04_nights where service_id=sv.service_id and admin_scope=s order by night_id loop
    scopes:=scopes||jsonb_build_array(jsonb_build_object('serviceId',sv.service_id,'nightId',c.night_id,'contributionId',null,'material',crm_private.modification_scope(jsonb_build_object('kind','night','id',c.night_id,'serviceId',sv.service_id),bid,s),'quantity',(select sum((crm_private.modification_scope(jsonb_build_object('kind','contribution','id',bc.contribution_id,'serviceId',sv.service_id),bid,s)->>'attendees')::numeric)from crm_private.b04_night_occupancies o join crm_private.b04_contributions bc using(contribution_id)where o.night_id=c.night_id and not(crm_private.modification_scope(jsonb_build_object('kind','contribution','id',bc.contribution_id,'serviceId',sv.service_id),bid,s)->>'cancelled')::boolean)));
    if (scopes->-1->'material'->>'cancelled')::boolean then scopes:=scopes- (jsonb_array_length(scopes)-1);end if;
   end loop;
  elsif (select count(distinct crm_private.modification_scope(jsonb_build_object('kind','contribution','id',bc.contribution_id,'serviceId',sv.service_id),bid,s)->>'date')from crm_private.b04_contributions bc where bc.service_id=sv.service_id)>1 then
   for c in select * from crm_private.b04_contributions where service_id=sv.service_id order by contribution_id loop
    facts:=crm_private.modification_scope(jsonb_build_object('kind','contribution','id',c.contribution_id,'serviceId',sv.service_id),bid,s);
    if not(facts->>'cancelled')::boolean then scopes:=scopes||jsonb_build_array(jsonb_build_object('serviceId',sv.service_id,'nightId',null,'contributionId',c.contribution_id,'material',facts,'quantity',facts->'quantity'));end if;
   end loop;
  else
   scopes:=scopes||jsonb_build_array(jsonb_build_object('serviceId',sv.service_id,'nightId',null,'contributionId',null,'material',v,'quantity',(select sum((crm_private.modification_scope(jsonb_build_object('kind','contribution','id',bc.contribution_id,'serviceId',sv.service_id),bid,s)->>'quantity')::numeric)from crm_private.b04_contributions bc where bc.service_id=sv.service_id and not(crm_private.modification_scope(jsonb_build_object('kind','contribution','id',bc.contribution_id,'serviceId',sv.service_id),bid,s)->>'cancelled')::boolean)));
  end if;
 end if;
 services:=services||jsonb_build_array(jsonb_build_object('id',sv.service_id,'scope',v,'pending',crm_private.modification_pending(bid,sv.service_id,null,s),'catalog',(select to_jsonb(a)from crm_private.catalog_applications a where subject_ref=sv.service_id and admin_scope=s order by recorded_at desc,application_id desc limit 1)));
 end loop;
 select coalesce(jsonb_agg(jsonb_build_object('id',i.confirmation_id,'state',v.after_data,'current',crm_private.confirmation_current(v.after_data,bid,s))order by i.confirmation_id),'[]')into facts from crm_private.b04_confirmations i cross join lateral(select after_data from crm_private.b04_confirmation_revisions where confirmation_id=i.confirmation_id order by revision desc limit 1)v where i.booking_id=bid and i.admin_scope=s;
 select coalesce(jsonb_agg(jsonb_build_object('id',i.requirement_id,'revision',v.revision,'state',v.after_data)order by i.requirement_id),'[]')into reqs from crm_private.b07_requirements i cross join lateral(select revision,after_data from crm_private.b07_requirement_revisions where requirement_id=i.requirement_id order by revision desc limit 1)v where i.booking_id=bid and i.admin_scope=s;
 select coalesce(jsonb_agg(jsonb_build_object('id',i.schedule_id,'scopeKind',i.scope_kind,'scopeId',i.scope_id,'revision',v.revision,'snapshot',v.snapshot,'coverage',crm_private.fund_coverage(i.schedule_id,s))order by i.schedule_id),'[]')into schedules from crm_private.b05_payment_schedules i cross join lateral(select revision,snapshot from crm_private.b05_schedule_revisions where schedule_id=i.schedule_id order by revision desc limit 1)v where i.booking_id=bid and i.admin_scope=s;
 return jsonb_build_object('booking',crm_private.modification_scope(jsonb_build_object('kind','booking','id',bid),bid,s),'scopes',scopes,'services',services,'confirmations',facts,'requirements',reqs,'schedules',schedules);
end$$;
create function crm_private.booking_preparation_hash(x jsonb)returns text language sql immutable set search_path=pg_catalog,pg_temp as $$select encode(crm_crypto.digest(convert_to(x::text,'UTF8'),'sha256'),'hex')$$;
-- No second ledger/calculator: use current H3 parts and accredited fund_coverage.
create function crm_private.booking_preparation_economics(inputs jsonb,bid uuid,s text,at_time timestamptz)returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare sch jsonb;sn jsonb;part jsonb;cov jsonb;r jsonb:='[]';missing jsonb;ref date;act date;required boolean;valid boolean;demand jsonb;begin
 for sch in select value from jsonb_array_elements(inputs->'schedules')loop
  sn:=sch->'snapshot';missing:='[]';demand:='[]';valid:=true;
  if sn->'reference'->>'basis'='default'then
   ref:=crm_private.modification_reference(jsonb_build_object('kind',case sch->>'scopeKind' when 'global'then 'booking'else sch->>'scopeKind'end,'id',sch->>'scopeId','serviceId',case when sch->>'scopeKind'='night'then(select service_id::text from crm_private.b04_nights where night_id=(sch->>'scopeId')::uuid)else null end),bid,s);
   if sch->>'scopeKind'='global' then select case when bool_or(value->'material'->'date'='null'::jsonb)then null else min((value->'material'->>'date')::date)end into ref from jsonb_array_elements(inputs->'scopes');end if;
   if ref is null or ref is distinct from(sn->'reference'->>'date')::date then valid:=false;missing:=missing||'"reference-review"';end if;
  else ref:=(sn->'reference'->>'date')::date;end if;
  if not exists(select 1 from pg_timezone_names where name=sn->'reference'->'zone'->>'zone')then valid:=false;missing:=missing||'"zone"';else act:=(at_time at time zone(sn->'reference'->'zone'->>'zone'))::date;end if;
  for part in select value from jsonb_array_elements(sn->'parts')loop
   required:=part->'due'->>'kind'in('at_confirmation','before_confirmation')or part->'due'->>'kind'='civil'and act>(part->'due'->>'date')::date;
   -- Within <7 days the ordinary policy requires both existing H3 portions before confirmation.
   if sn->'policy'->>'rule'='ordinary_50_50'and not(sn?'exception')and ref-act<7 then required:=true;end if;
   demand:=demand||jsonb_build_array(jsonb_build_object('slot',part->'slot','required',required));
   select value into cov from jsonb_array_elements(sch->'coverage')where value->>'slot'=part->>'slot';
   if required and(cov is null or (cov->>'remaining')::numeric>0)then valid:=false;missing:=missing||jsonb_build_array('coverage:'||(part->>'slot'));end if;
  end loop;
  r:=r||jsonb_build_array(jsonb_build_object('scheduleId',sch->'id','revision',sch->'revision','policy',sn->'policy','base',sn->'base','reference',sn->'reference','actDate',act,'daysBefore',ref-act,'parts',sn->'parts','demand',demand,'coverage',sch->'coverage','satisfied',valid,'missing',missing));
 end loop;return r;
end$$;
create function crm_private.booking_preparation_material(inputs jsonb,bid uuid,s text)returns text language sql stable set search_path=pg_catalog,pg_temp as $$select crm_private.booking_preparation_hash(inputs||jsonb_build_object('economicDemand',(select coalesce(jsonb_agg(value-array['actDate','daysBefore']),'[]')from jsonb_array_elements(crm_private.booking_preparation_economics(inputs,bid,s,clock_timestamp())))))$$;
create function crm_private.booking_preparation_assess(inputs jsonb,a jsonb,bid uuid,s text,at_time timestamptz,exception_allowed boolean default false)returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare target jsonb;cl jsonb;fact jsonb;coverage jsonb:='[]';missing jsonb:='[]';economic jsonb;valid boolean;any_valid boolean:=false;req jsonb;sc jsonb;begin
 if jsonb_array_length(inputs->'scopes')=0 or jsonb_typeof(a->'criticalScopes')is distinct from'array'or jsonb_array_length(a->'criticalScopes')<>jsonb_array_length(inputs->'scopes')then missing:=missing||'"critical-manifest"';end if;
 for target in select value from jsonb_array_elements(inputs->'scopes')loop
  select value into cl from jsonb_array_elements(coalesce(a->'criticalScopes','[]'))where value->'serviceId'=target->'serviceId'and value->'nightId'=target->'nightId'and value->'contributionId'=target->'contributionId';
  valid:=false;
  for fact in select value from jsonb_array_elements(inputs->'confirmations')where(value->'current'->>'usable')::boolean loop
   sc:=fact->'state'->'evaluation'->'coverage';
   if sc->'serviceId'=target->'serviceId'and sc->'nightId'=target->'nightId'and sc->'contributionId'=target->'contributionId'and(sc->>'quantity')::numeric>=(target->>'quantity')::numeric and not exists(select 1 from jsonb_array_elements(coalesce(fact->'state'->'evaluation'->'dependencySnapshot','[]'))dep where coalesce((dep->'current'->'verified'->>'actionUntil')::timestamptz,(dep->'current'->'confirmed'->>'actionUntil')::timestamptz,'infinity'::timestamptz)<at_time or (dep->'current'->'terms'->>'expiresAt')::timestamptz<=at_time)then valid:=true;exit;end if;
  end loop;
  if cl is null or jsonb_typeof(cl->'necessary')is distinct from'boolean'or not coalesce(crm_private.invoice_text(cl->'basis'),false)then missing:=missing||'"critical-basis"';
  elsif(cl->>'necessary')::boolean and not valid then missing:=missing||jsonb_build_array('critical:'||(target->>'serviceId')||':'||coalesce(target->>'nightId',''));end if;
  any_valid:=any_valid or valid;coverage:=coverage||jsonb_build_array(jsonb_build_object('scope',target-'material','necessary',cl->'necessary','basis',cl->'basis','confirmed',valid));
 end loop;
 for sc in select value from jsonb_array_elements(inputs->'services')loop if(sc->>'pending')::boolean and exists(select 1 from jsonb_array_elements(a->'criticalScopes')cs(value)where cs.value->'serviceId'=sc->'id'and(cs.value->>'necessary')::boolean)then missing:=missing||jsonb_build_array('review:'||(sc->>'id'));end if;end loop;
 for req in select value from jsonb_array_elements(inputs->'requirements')loop
  if coalesce((req->'state'->'basis'->'rule'->>'indispensable')::boolean,false)and req->'state'->>'status'not in('Revisado','No aplica')then missing:=missing||jsonb_build_array('requirement:'||(req->>'id'));end if;
 end loop;
 economic:=crm_private.booking_preparation_economics(inputs,bid,s,at_time);
 if jsonb_array_length(economic)=0 then missing:=missing||'"economy-definition"';end if;
 for sc in select value from jsonb_array_elements(economic)loop
  if not(sc->>'satisfied')::boolean and not(exception_allowed and a->'economicException'->'scopeIds'? (sc->>'scheduleId'))then missing:=missing||jsonb_build_array('economy:'||(sc->>'scheduleId'));end if;
 end loop;
 return jsonb_build_object('coverage',coverage,'economics',economic,'missing',missing,'anyCoverage',any_valid,'complete',missing='[]'::jsonb);
end$$;
-- Minimal integration: factor the unchanged ordinary B07 Task core; the public API keeps both authorities.
create function crm_private.booking_preparation_task_core(m jsonb,actor uuid,scope text)returns table(result_ref uuid,replayed boolean)language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare i jsonb:=m->'identity';a jsonb:=m->'material';opid uuid;target uuid;fingerprint text;causekey text;before_data jsonb;after_data jsonb;action text;op crm_private.b07_operations%rowtype;old crm_private.b07_pending_tasks%rowtype;
begin
 opid:=(m->>'operationId')::uuid;target:=(m->>'taskId')::uuid;action:=m->>'action';
 if action is null or action not in ('receive','update') or m->>'expectedRevision' is null or (m->>'expectedRevision')::bigint<0
  or m->>'purpose' is distinct from 'pending-followup' then raise exception 'TASK_INPUT_INVALID'; end if;
 if i is null or a is null or jsonb_typeof(i)<>'object' or jsonb_typeof(a)<>'object'
  or (i-array['causeKind','causeId','contextKind','contextId','scopeRef','relatedKind','relatedId','effect'])<>'{}'::jsonb
  or (a-array['title','deadline','priority','sourceRef','sourceVersion','triggerRef','triggerVersion'])<>'{}'::jsonb
  or i->>'causeKind' is null or i->>'causeKind' not in ('review','document','amount','data','block','advance','balance',
  'provider','invoice','suplido','participants_list','availability','modification','cancellation','proposal','final_participants')
  or nullif(i->>'causeId','') is null or nullif(i->>'scopeRef','') is null or nullif(i->>'effect','') is null
  or i->>'contextKind' is null or i->>'contextKind' not in ('contact','organization','opportunity','booking','booking_service','provider','proposal','other')
  or nullif(i->>'contextId','') is null or (i->>'relatedId' is null)<>(i->>'relatedKind' is null)
  or nullif(a->>'title','') is null or nullif(a->>'sourceRef','') is null or nullif(a->>'sourceVersion','') is null
  or nullif(a->>'triggerVersion','') is null or a->>'triggerRef' is null or a->>'triggerRef' not in ('manual','BR-TASK-005')
  or (a->>'triggerRef'='BR-TASK-005' and i->>'causeKind' in ('review','amount','data'))
  or nullif(m->>'reason','') is null then raise exception 'TASK_INPUT_INVALID'; end if;
 perform (i->>'contextId')::uuid;
 if ((a->'priority')-'kind'-'reason')<>'{}'::jsonb or a->'priority'->>'kind' is distinct from 'pending' or nullif(a->'priority'->>'reason','') is null then raise exception 'TASK_PRIORITY_UNVERIFIED'; end if;
 if a->'deadline'->>'kind'='unknown' then
  if nullif(a->'deadline'->>'reason','') is null or ((a->'deadline')-'kind'-'reason')<>'{}'::jsonb then raise exception 'TASK_DEADLINE_INVALID'; end if;
 elsif a->'deadline'->>'kind' in ('civil','instant','d020') then
  if nullif(a->'deadline'->>'sourceRef','') is null or nullif(a->'deadline'->>'version','') is null then raise exception 'TASK_DEADLINE_INVALID'; end if;
  if a->'deadline'->>'kind'='civil' then
   if ((a->'deadline')-array['kind','date','sourceRef','version'])<>'{}'::jsonb then raise exception 'TASK_DEADLINE_INVALID'; end if;
   if coalesce(a->'deadline'->>'date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'TASK_DEADLINE_INVALID'; end if; perform (a->'deadline'->>'date')::date;
  elsif a->'deadline'->>'kind'='instant' then
   if ((a->'deadline')-array['kind','at','sourceRef','version'])<>'{}'::jsonb then raise exception 'TASK_DEADLINE_INVALID'; end if;
   if coalesce(a->'deadline'->>'at','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' or nullif(a->'deadline'->>'at','') is null then raise exception 'TASK_DEADLINE_INVALID'; end if;
   perform (a->'deadline'->>'at')::timestamptz;
  else
   if ((a->'deadline')-array['kind','reference','daysBefore','sourceRef','version'])<>'{}'::jsonb
    or ((a->'deadline'->'reference')-array['scope','scopeId','date','zone','sourceRef','version','basis'])<>'{}'::jsonb
    or ((a->'deadline'->'reference'->'zone')-array['zone','sourceRef','version'])<>'{}'::jsonb then raise exception 'TASK_DEADLINE_INVALID'; end if;
   if a->'deadline'->>'daysBefore' is null or (a->'deadline'->>'daysBefore')::integer<0 or nullif(a->'deadline'->'reference'->>'sourceRef','') is null
    or nullif(a->'deadline'->'reference'->>'version','') is null
    or nullif(a->'deadline'->'reference'->'zone'->>'sourceRef','') is null
    or nullif(a->'deadline'->'reference'->'zone'->>'version','') is null then raise exception 'TASK_DEADLINE_INVALID'; end if;
   perform (a->'deadline'->'reference'->>'date')::date;
  end if;
 else raise exception 'TASK_DEADLINE_INVALID'; end if;
 fingerprint:=encode(crm_crypto.digest(convert_to(m::text,'UTF8'),'sha256'),'hex');
 causekey:=encode(crm_crypto.digest(convert_to(jsonb_build_object('version','h1-pending-cause-v1','identity',i)::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(opid::text,0));
 select * into op from crm_private.b07_operations where operation_id=opid;
 if found then
  if op.admin_scope<>scope or op.actor_id<>actor or op.fingerprint<>fingerprint then raise exception 'TASK_REPLAY_CONFLICT'; end if;
  result_ref:=op.result_ref;replayed:=true;
 else
  -- Protect absence too: unique cause index is the persisted backstop.
  perform pg_advisory_xact_lock(hashtextextended(scope||causekey,17));
  select * into old from crm_private.b07_pending_tasks where admin_scope=scope and identity_key=causekey for update;
  if action='update' and (old.task_id is null or old.task_id<>target) then raise exception 'TASK_IDENTITY_CONFLICT'; end if;
  if old.task_id is null then
   if action<>'receive' or (m->>'expectedRevision')::bigint<>0 then raise exception 'TASK_REVISION_CONFLICT'; end if;
   insert into crm_private.b07_pending_tasks(task_id,admin_scope,identity_version,identity_key,identity,material,state,responsible_actor,revision)
    values(target,scope,'h1-pending-cause-v1',causekey,i,a,'pending',actor,1);
  else
   if old.identity<>i then raise exception 'TASK_IDENTITY_CONFLICT'; end if;
   target:=old.task_id;before_data:=to_jsonb(old);
   if old.material<>a then
    if action<>'update' or old.revision<>(m->>'expectedRevision')::bigint then raise exception 'TASK_REVISION_CONFLICT'; end if;
    update crm_private.b07_pending_tasks set material=a,revision=revision+1,updated_at=clock_timestamp() where task_id=target;
   elsif action='update' and old.revision<>(m->>'expectedRevision')::bigint then raise exception 'TASK_REVISION_CONFLICT'; end if;
  end if;
  select to_jsonb(t) into after_data from crm_private.b07_pending_tasks t where task_id=target;
  insert into crm_private.b07_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref) values(opid,scope,actor,fingerprint,target);
  insert into crm_private.b07_history(history_id,operation_id,subject_id,admin_scope,action_kind,before_state,after_state,reason,source_ref,actor_id)
   values(opid,opid,target,scope,'task_'||action,before_data,after_data,m->>'reason',a->>'sourceRef',actor);
  result_ref:=target;replayed:=false;
 end if;
 return next;end$$;
do $$declare old_body text;first_anchor text:=' opid:=(m->>';last_anchor text:=' perform crm_f2.verify(f2p';lo integer;hi integer;replacement text;begin
 old_body:=pg_get_functiondef('crm_api.b07_task_apply(bytea,bytea,bytea,bytea,bytea)'::regprocedure);lo:=strpos(old_body,first_anchor);hi:=strpos(old_body,last_anchor);
 if lo=0 or hi<=lo then raise exception 'BOOKING_PREPARATION_TASK_INTEGRATION_ANCHOR';end if;
 replacement:=' select x.result_ref,x.replayed into result_ref,replayed from crm_private.booking_preparation_task_core(m,actor,scope)x;'||chr(10);
 execute substr(old_body,1,lo-1)||replacement||substr(old_body,hi);
end$$;
create function crm_private.booking_preparation_core(a jsonb,s text,actor uuid,sensitive boolean default false)returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare bid uuid:=(a->>'bookingId')::uuid;op uuid:=(a->>'operationId')::uuid;rev bigint;prev crm_private.b04_preparation_operations;inputs jsonb;current_material text;fp text;proof text;assessed jsonb;state jsonb;prior jsonb;phase text;cl jsonb;task_id uuid;at_time timestamptz:=clock_timestamp();begin
 if jsonb_typeof(a)is distinct from'object'or not(a?&array['action','operationId','bookingId','expectedRevision','expectedMaterial','sourceRef','reason','at','evidenceId','criticalScopes','preparationEvidenceIds'])or a-array['action','operationId','bookingId','expectedRevision','expectedMaterial','sourceRef','reason','at','evidenceId','criticalScopes','preparationEvidenceIds','origin','economicException']<>'{}'::jsonb
 or a->>'action'not in('start','evaluate')or coalesce(a->>'origin','manual')not in('manual','ai')or (coalesce(a->>'origin','manual')='ai'or a?'economicException')and not sensitive
 or jsonb_typeof(a->'expectedRevision')is distinct from'number'or a->>'expectedRevision'!~'^[0-9]+$'or jsonb_typeof(a->'criticalScopes')is distinct from'array'or jsonb_typeof(a->'preparationEvidenceIds')is distinct from'array'
 or not coalesce(crm_private.invoice_text(a->'sourceRef'),false)or not coalesce(crm_private.invoice_text(a->'reason'),false)then raise exception 'BOOKING_PREPARATION_INPUT_INVALID';end if;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s)then raise exception 'BOOKING_PREPARATION_DENIED';end if;
 perform crm_private.booking_preparation_lock(bid);fp:=crm_private.booking_preparation_hash(a);
 select * into prev from crm_private.b04_preparation_operations where operation_id=op;
 if found then if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'BOOKING_PREPARATION_REPLAY_CONFLICT:E2';end if;return prev.result||jsonb_build_object('replayed',true);end if;
 select e.revision,e.state into rev,prior from crm_private.b04_preparation_evaluations e where e.booking_id=bid and e.admin_scope=s order by e.revision desc limit 1;rev:=coalesce(rev,0);
 if rev<>(a->>'expectedRevision')::bigint then raise exception 'BOOKING_PREPARATION_REVISION_CONFLICT:E2';end if;
 at_time:=clock_timestamp();inputs:=crm_private.booking_preparation_inputs(bid,s);current_material:=crm_private.booking_preparation_material(inputs,bid,s);
 if current_material is distinct from a->>'expectedMaterial'then raise exception 'BOOKING_PREPARATION_MATERIAL_CONFLICT:E2';end if;
 proof:=crm_private.booking_preparation_hash(a-array['operationId','evidenceId']);
 if not crm_private.payment_evidence((a->>'evidenceId')::uuid,bid,s,'booking-preparation:'||(a->>'action')||':'||proof,(a->>'at')::timestamptz,true)or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor)then raise exception 'BOOKING_PREPARATION_EVIDENCE_REQUIRED:E3';end if;
 if a->>'action'='start'and rev>0 then raise exception 'BOOKING_PREPARATION_ORIGIN_REQUIRED:E3';end if;
 if jsonb_array_length(a->'preparationEvidenceIds')=0 then raise exception 'BOOKING_PREPARATION_ACTUATION_REQUIRED:E3';end if;
 for cl in select value from jsonb_array_elements(a->'preparationEvidenceIds')loop if not crm_private.payment_evidence((cl#>>'{}')::uuid,bid,s,'booking-preparation:coordination', (a->>'at')::timestamptz,true)then raise exception 'BOOKING_PREPARATION_ACTUATION_REQUIRED:E3';end if;end loop;
 for cl in select value from jsonb_array_elements(a->'criticalScopes')loop
  if not exists(select 1 from jsonb_array_elements(inputs->'scopes')sc(value)where sc.value->'serviceId'=cl->'serviceId'and sc.value->'nightId'=cl->'nightId'and sc.value->'contributionId'=cl->'contributionId')then raise exception 'BOOKING_PREPARATION_DENIED';end if;
  if cl-array['serviceId','nightId','contributionId','necessary','basis','evidenceId']<>'{}'::jsonb or not(cl?&array['serviceId','nightId','contributionId','necessary','basis','evidenceId'])or not crm_private.payment_evidence((cl->>'evidenceId')::uuid,bid,s,'booking-preparation:critical:'||crm_private.booking_preparation_hash(cl-'evidenceId'),(a->>'at')::timestamptz,true)then raise exception 'BOOKING_PREPARATION_CRITICAL_EVIDENCE_REQUIRED:E3';end if;
 end loop;
 if (select count(distinct(value-array['necessary','basis','evidenceId'])::text)from jsonb_array_elements(a->'criticalScopes'))<>jsonb_array_length(a->'criticalScopes')then raise exception 'BOOKING_PREPARATION_CRITICAL_SCOPE_REQUIRED:E3';end if;
 if a?'economicException'then
  cl:=a->'economicException';if cl-array['reason','scopeIds','evidenceId']<>'{}'::jsonb or not(cl?&array['reason','scopeIds','evidenceId'])or not coalesce(crm_private.invoice_text(cl->'reason'),false)or jsonb_typeof(cl->'scopeIds')is distinct from'array'or jsonb_array_length(cl->'scopeIds')=0 or exists(select 1 from jsonb_array_elements_text(cl->'scopeIds')x(value)where not exists(select 1 from crm_private.b05_payment_schedules where schedule_id=x.value::uuid and booking_id=bid and admin_scope=s))or not crm_private.payment_evidence((cl->>'evidenceId')::uuid,bid,s,'booking-preparation:exception:'||crm_private.booking_preparation_hash(cl-'evidenceId'),(a->>'at')::timestamptz,true)then raise exception 'BOOKING_PREPARATION_EXCEPTION_REQUIRED:E3';end if;
 end if;
 assessed:=crm_private.booking_preparation_assess(inputs,a,bid,s,at_time,sensitive and a?'economicException');
 if a->>'action'='start'and assessed->'missing'?'critical-manifest'then raise exception 'BOOKING_PREPARATION_CRITICAL_SCOPE_REQUIRED:E3';end if;
 select result_ref into task_id from crm_private.booking_preparation_task_core(jsonb_build_object('action','receive','operationId',op,'taskId',bid,'expectedRevision',0,'purpose','pending-followup','identity',jsonb_build_object('causeKind','block','causeId',bid,'contextKind','booking','contextId',bid,'scopeRef',bid,'effect','booking-preparation-review'),'material',jsonb_build_object('title','Revisar preparación y cobertura de Booking','deadline',jsonb_build_object('kind','unknown','reason','No consta fecha fijada para el seguimiento'),'priority',jsonb_build_object('kind','pending','reason','Prioridad no configurada'),'sourceRef','SM-BK-02-05','sourceVersion','1','triggerRef','BR-TASK-005','triggerVersion','1'),'reason','Seguimiento local de preparación y faltas'),actor,s);
 phase:=case when a->>'action'='start'then 'En confirmación con proveedores'when(assessed->>'complete')::boolean then 'Confirmada operativamente'when(assessed->>'anyCoverage')::boolean then 'Parcialmente confirmada'else 'En confirmación con proveedores'end;
 state:=assessed||jsonb_build_object('bookingId',bid,'revision',rev+1,'historicalPhase',phase,'phase',phase,'applicable',true,'material',current_material,'evaluatedAt',at_time,'command',a,'before',prior);
 insert into crm_private.b04_preparation_evaluations values(bid,rev+1,s,op,actor,(a->>'evidenceId')::uuid,inputs,state,clock_timestamp());
 state:=state-'before'-'command'-'anyCoverage'-'complete';state:=state||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'phase',e.state->'historicalPhase','material',crm_private.booking_preparation_hash(e.material),'actorId',actor_id,'evidenceId',evidence_id,'at',recorded_at)order by revision)from crm_private.b04_preparation_evaluations e where booking_id=bid and admin_scope=s));
 state:=jsonb_build_object('id',bid,'replayed',false,'result',state);insert into crm_private.b04_preparation_operations values(op,bid,s,actor,fp,state,clock_timestamp());
 if crm_private.booking_preparation_material(crm_private.booking_preparation_inputs(bid,s),bid,s)<>current_material then raise exception 'BOOKING_PREPARATION_MATERIAL_CONFLICT:E2';end if;return state;
end$$;
create function crm_api.booking_preparation_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];r jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');if hf[17]is distinct from tf[14]then raise exception 'BOOKING_PREPARATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-BOOKING1'then raise exception 'BOOKING_PREPARATION_INPUT_INVALID';end if;
 r:=crm_private.booking_preparation_core(fs[2]::jsonb,hf[17],hf[12]::uuid);
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.booking_preparation_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;bid uuid;state jsonb;inputs jsonb;assessment jsonb;r jsonb;hist text;phase text;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');if hf[17]is distinct from tf[14]then raise exception 'BOOKING_PREPARATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-BOOKING-READ1'then raise exception 'BOOKING_PREPARATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if a-'bookingId'<>'{}'::jsonb then raise exception 'BOOKING_PREPARATION_INPUT_INVALID';end if;bid:=(a->>'bookingId')::uuid;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=hf[17])then return null;end if;
 perform crm_private.booking_preparation_lock(bid);inputs:=crm_private.booking_preparation_inputs(bid,hf[17]);
 select e.state into state from crm_private.b04_preparation_evaluations e where booking_id=bid and admin_scope=hf[17]order by revision desc limit 1;
 hist:=coalesce(state->>'historicalPhase','Pendiente de preparación');
 assessment:=crm_private.booking_preparation_assess(inputs,coalesce(state->'command',jsonb_build_object('criticalScopes','[]'::jsonb)),bid,hf[17],clock_timestamp(),exists(select 1 from crm_private.b04_preparation_approvals p where p.booking_id=bid and p.admin_scope=hf[17]and p.operation_id=(state->'command'->>'operationId')::uuid and p.material=crm_private.booking_preparation_material(inputs,bid,hf[17])));
 phase:=case when state is null then 'Pendiente de preparación'when hist='En confirmación con proveedores'and state->'command'->>'action'='start'then hist when(assessment->>'complete')::boolean then hist when(assessment->>'anyCoverage')::boolean then 'Parcialmente confirmada'else 'En confirmación con proveedores'end;
 r:=assessment-'complete'-'anyCoverage'||jsonb_build_object('bookingId',bid,'revision',coalesce((state->>'revision')::bigint,0),'historicalPhase',hist,'phase',phase,'applicable',state is not null and state->>'material'=crm_private.booking_preparation_material(inputs,bid,hf[17])and phase=hist,'material',crm_private.booking_preparation_material(inputs,bid,hf[17]),'history',coalesce((select jsonb_agg(jsonb_build_object('revision',revision,'phase',e.state->'historicalPhase','actorId',actor_id,'evidenceId',evidence_id,'at',recorded_at)order by revision)from crm_private.b04_preparation_evaluations e where booking_id=bid and admin_scope=hf[17]),'[]'::jsonb));
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
create function crm_api.booking_preparation_sensitive(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,a jsonb)returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];part text[];res crm_ha.reservations;r jsonb;begin
 if session_user<>'crm_h0_ha_tx'then raise exception 'BOOKING_PREPARATION_TTE_REQUIRED';end if;
 hf:=crm_f2.verify(f2p,f2s,q,'C03','human_core_probe','apply_probe_batch');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','human_approval','manage_effect');fs:=crm_f1.fields(q);
 if hf[17]is distinct from tf[14]or fs[1]<>'CRM-H0-M04'or fs[2]<>'reserve'or a->>'action'<>'evaluate'then raise exception 'BOOKING_PREPARATION_TTE_REQUIRED';end if;
 select * into strict res from crm_ha.reservations where reservation_id=fs[3];select crm_f1.fields(material_payload)into part from crm_ha.parts where proposal_id=res.proposal_id and part_id=res.part_id;
 if part[3]<>'booking-confirmation'or part[5]::jsonb is distinct from a or part[6]<>'value'or part[7]is distinct from a->>'bookingId'or part[12]<>hf[17]or part[13]<>'evaluate-booking-preparation'then raise exception 'BOOKING_PREPARATION_APPROVAL_MATERIAL_CHANGED';end if;
 r:=crm_private.booking_preparation_core(a,hf[17],hf[12]::uuid,true);
 if not exists(select 1 from crm_private.b04_preparation_approvals where reservation_id=res.reservation_id)then insert into crm_private.b04_preparation_approvals values(res.reservation_id,(a->>'bookingId')::uuid,(a->>'operationId')::uuid,hf[17],a->>'expectedMaterial',clock_timestamp());end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_core_probe','apply_probe_batch');return r;
end$$;
create function crm_api.booking_preparation_finalize(command_id text)returns void language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare approval crm_private.b04_preparation_approvals;inputs jsonb;begin
 if session_user<>'crm_h0_ha_tx'then raise exception 'BOOKING_PREPARATION_TTE_REQUIRED';end if;
 select * into approval from crm_private.b04_preparation_approvals where reservation_id=command_id;if not found then raise exception 'BOOKING_PREPARATION_FINAL_CHECK_REQUIRED';end if;
 if not exists(select 1 from crm_private.b04_preparation_operations where operation_id=approval.operation_id and xmin::text=pg_current_xact_id()::text)then return;end if;
 inputs:=crm_private.booking_preparation_inputs(approval.booking_id,approval.admin_scope);if crm_private.booking_preparation_material(inputs,approval.booking_id,approval.admin_scope)<>approval.material then raise exception 'BOOKING_PREPARATION_FINAL_CHECK_FAILED';end if;
end$$;
do $$declare f record;begin for f in select p.oid,n.nspname,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in('crm_api','crm_private')and p.proname like 'booking_preparation_%'loop
 execute format('alter function %s owner to %I',f.oid::regprocedure,case when f.nspname='crm_api'or f.proname='booking_preparation_writer'then 'crm_h0_f2_executor'else 'crm_h0_f2_owner'end);execute format('revoke all on function %s from public,crm_h0_runtime,crm_h0_ha_tx',f.oid::regprocedure);
 if f.proname in('booking_preparation_sensitive','booking_preparation_finalize')then execute format('grant execute on function %s to crm_h0_ha_tx',f.oid::regprocedure);elsif f.nspname='crm_api'then execute format('grant execute on function %s to crm_h0_runtime',f.oid::regprocedure);else execute format('grant execute on function %s to crm_h0_f2_executor,crm_h0_migration',f.oid::regprocedure);end if;
end loop;end$$;
revoke create on schema crm_private from crm_h0_f2_owner,crm_h0_f2_executor;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
