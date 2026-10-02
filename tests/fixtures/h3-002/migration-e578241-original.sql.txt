-- H3-001/002 only. Obligation is not a movement. Existing F1/F2 narrow API pattern.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'OBLIGATION_MIGRATION_AUTHORITY_REQUIRED';end if;end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b05_payment_policies(
 policy_id uuid not null,version bigint not null check(version>0),admin_scope text not null,
 rule text not null check(rule='ordinary_50_50'),selectors jsonb not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),source_ref text not null,reason text not null,
 evidence_id uuid not null references crm_private.b07_records(record_id),recorded_at timestamptz not null default clock_timestamp(),
 primary key(policy_id,version)
);
create table crm_private.b05_payment_schedules(
 schedule_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),admin_scope text not null,
 scope_kind text not null check(scope_kind in ('global','modality','service','night')),scope_id uuid not null,
 policy_id uuid not null,policy_version bigint not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 effect_fingerprint text not null,recorded_at timestamptz not null default clock_timestamp(),
 foreign key(policy_id,policy_version) references crm_private.b05_payment_policies(policy_id,version),unique(booking_id,scope_kind,scope_id)
);
create table crm_private.b05_schedule_revisions(
 schedule_id uuid not null references crm_private.b05_payment_schedules(schedule_id),revision bigint not null check(revision>0),
 admin_scope text not null,snapshot jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 recorded_at timestamptz not null default clock_timestamp(),primary key(schedule_id,revision)
);
create table crm_private.b05_expected_payments(
 schedule_id uuid not null references crm_private.b05_payment_schedules(schedule_id),slot text not null check(slot in ('initial','balance')),
 admin_scope text not null,amount numeric not null check(amount>=0 and amount=trunc(amount,2)),due jsonb not null,
 primary key(schedule_id,slot)
);
create table crm_private.b05_obligation_adjustments(
 adjustment_id uuid primary key,schedule_id uuid not null,slot text not null,revision bigint not null,
 admin_scope text not null,before_data jsonb not null,after_data jsonb not null,difference numeric not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),cause text not null,source_ref text not null,
 evidence_id uuid not null references crm_private.b07_records(record_id),recorded_at timestamptz not null default clock_timestamp(),
 foreign key(schedule_id,slot) references crm_private.b05_expected_payments(schedule_id,slot),
 foreign key(schedule_id,revision) references crm_private.b05_schedule_revisions(schedule_id,revision)
);
create table crm_private.b05_obligation_operations(
 operation_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,event jsonb not null,result jsonb not null,
 recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b05_obligation_history(
 history_id uuid primary key references crm_private.b05_obligation_operations(operation_id),booking_id uuid not null references crm_private.b04_bookings(booking_id),
 admin_scope text not null,actor_id uuid not null references crm_private.crm_actors(actor_id),before_data jsonb,after_data jsonb not null,
 source_ref text not null,reason text not null,evidence_id uuid not null references crm_private.b07_records(record_id),
 occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp()
);
do $$ declare t text;r text;begin foreach t in array array['b05_payment_policies','b05_payment_schedules','b05_schedule_revisions','b05_expected_payments','b05_obligation_adjustments','b05_obligation_operations','b05_obligation_history'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);
 execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy obligation_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy obligation_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end $$;
create function crm_private.obligation_part_valid(p jsonb) returns boolean language plpgsql immutable set search_path=pg_catalog,pg_temp as $$
begin
 if jsonb_typeof(p) is distinct from 'object' or p-array['slot','amount','due']<>'{}'::jsonb or not(p ?& array['slot','amount','due'])
 or p->>'slot' not in ('initial','balance') or jsonb_typeof(p->'amount') is distinct from 'string' or p->>'amount' !~ '^(0|[1-9][0-9]*)\.[0-9]{2}$'
 or jsonb_typeof(p->'due') is distinct from 'object' then return false;end if;
 if (p->'due')->>'kind' in ('at_confirmation','before_confirmation') then return (p->'due')-'kind'='{}'::jsonb;end if;
 if (p->'due')->>'kind'='civil' and (p->'due')-array['kind','date']='{}'::jsonb and (p->'due')->>'date' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
 return ((p->'due')->>'date')::date::text=(p->'due')->>'date';end if;return false;
end $$;
alter function crm_private.obligation_part_valid(jsonb) owner to crm_h0_f2_owner;
revoke all on function crm_private.obligation_part_valid(jsonb) from public;
grant execute on function crm_private.obligation_part_valid(jsonb) to crm_h0_f2_executor;
create function crm_api.obligation_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;d jsonb;c jsonb;r jsonb;before_state jsonb;part jsonb;parts jsonb;policy jsonb;
 op uuid;bid uuid;sid uuid;pid uuid;actor uuid;s text;fp text;efp text;proofhash text;rev bigint;pv bigint;amt numeric;accepted numeric;
 firstdate date;actdate date;days integer;due date;initial numeric;balance numeric;action text;
 b crm_private.b04_bookings;pr crm_private.b05_obligation_operations;ps crm_private.b05_payment_schedules;pol crm_private.b05_payment_policies;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'OBLIGATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-OBLIGATION1' then raise exception 'OBLIGATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a ?& array['action','operationId','bookingId','policyId','expectedRevision','sourceRef','reason','at','evidenceId'])
 or a-array['action','operationId','bookingId','policyId','expectedRevision','sourceRef','reason','at','evidenceId','origin','scheduleId','scope','scopeId','policy','definition','computed','policyVersion','selectors','slot','amount','due']<>'{}'::jsonb
 or a->>'action' not in ('publish_policy','determine','adjust') or coalesce(a->>'origin','manual')<>'manual'
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision' !~ '^[0-9]+$'
 or exists(select 1 from jsonb_each(a) x where x.key in ('sourceRef','reason','at') and (jsonb_typeof(x.value)<>'string' or btrim(x.value#>>'{}')=''))
 or a->>'at' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'OBLIGATION_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;bid:=(a->>'bookingId')::uuid;pid:=(a->>'policyId')::uuid;actor:=hf[12]::uuid;s:=hf[17];action:=a->>'action';
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(op::text,0));
 select * into pr from crm_private.b05_obligation_operations where operation_id=op;
 if found then
  if pr.admin_scope<>s or pr.actor_id<>actor or pr.fingerprint<>fp then raise exception 'OBLIGATION_REPLAY_CONFLICT:E2';end if;
  r:=jsonb_build_object('id',pr.result->>'id','replayed',true,'result',pr.result);
 else
  select * into b from crm_private.b04_bookings where booking_id=bid and admin_scope=s;
  if not found then raise exception 'OBLIGATION_BOOKING_REQUIRED';end if;
  -- Reviewed evidence binds the complete human decision including amount/time/reference;
  -- no authority derives from customer/integration/AI payloads.
  proofhash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId','computed'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.offer_evidence((a->>'evidenceId')::uuid,b.opportunity_id,s,'obligation:'||action||':'||proofhash,b.coverage,(a->>'at')::timestamptz,(a->>'at')::timestamptz)
  then raise exception 'OBLIGATION_AUTHORIZED_EVIDENCE_REQUIRED';end if;
  if action='publish_policy' then
   if a ?| array['definition','computed','scheduleId','slot','amount','due','scope','scopeId','policy'] then raise exception 'OBLIGATION_INPUT_INVALID';end if;
   perform pg_advisory_xact_lock(hashtextextended(pid::text,51));
   select coalesce(max(version),0) into rev from crm_private.b05_payment_policies where policy_id=pid;
   if rev<>(a->>'expectedRevision')::bigint or exists(select 1 from crm_private.b05_payment_policies where policy_id=pid and admin_scope<>s)
   then raise exception 'OBLIGATION_REVISION_CONFLICT';end if;
   if jsonb_typeof(a->'policyVersion') is distinct from 'number' or (a->>'policyVersion')::bigint<>rev+1
    or jsonb_typeof(a->'selectors') is distinct from 'object' or (a->'selectors')-array['service','provider','type','case']<>'{}'::jsonb
    or exists(select 1 from jsonb_each(a->'selectors') x where jsonb_typeof(x.value) not in ('string','null')) then raise exception 'OBLIGATION_POLICY_REQUIRED';end if;
   insert into crm_private.b05_payment_policies values(pid,rev+1,s,'ordinary_50_50',a->'selectors',actor,a->>'sourceRef',a->>'reason',(a->>'evidenceId')::uuid,clock_timestamp());
   r:=jsonb_build_object('id',pid,'revision',rev+1,'rule','ordinary_50_50');
  else
   if not(a ?& array['scheduleId','scope','scopeId']) or a->>'scope' not in ('global','modality','service','night') then raise exception 'OBLIGATION_SCOPE_REQUIRED';end if;
   sid:=(a->>'scheduleId')::uuid;
   -- Root lock protects absent children and functional identity, including different keys.
   perform pg_advisory_xact_lock(hashtextextended(bid::text,52));
   if a->>'scope'='global' and a->>'scopeId'<>bid::text
    or a->>'scope'='modality' and not exists(select 1 from crm_private.b04_modalities where booking_id=bid and modality_id=(a->>'scopeId')::uuid)
    or a->>'scope'='service' and not exists(select 1 from crm_private.b04_services where booking_id=bid and service_id=(a->>'scopeId')::uuid)
    or a->>'scope'='night' and not exists(select 1 from crm_private.b04_nights n join crm_private.b04_services bs using(service_id) where bs.booking_id=bid and n.night_id=(a->>'scopeId')::uuid)
   then raise exception 'OBLIGATION_SCOPE_REQUIRED';end if;
   select * into ps from crm_private.b05_payment_schedules where booking_id=bid and scope_kind=a->>'scope' and scope_id=(a->>'scopeId')::uuid;
   if action='determine' then
    if a ?| array['slot','amount','due','policyVersion','selectors'] then raise exception 'OBLIGATION_INPUT_INVALID';end if;
    d:=a->'definition';c:=a->'computed';policy:=a->'policy';
    if jsonb_typeof(d) is distinct from 'object' or not(d ?& array['base','reference','at']) or d-array['base','reference','at','exception']<>'{}'::jsonb
     or jsonb_typeof(d->'base') is distinct from 'object' or (d->'base')-array['amount','sourceRef','version']<>'{}'::jsonb
     or not(d->'base' ?& array['amount','sourceRef','version']) or (d->'base')->>'amount' !~ '^(0|[1-9][0-9]*)\.[0-9]{2}$'
     or coalesce((d->'base')->>'sourceRef','')='' or coalesce((d->'base')->>'version','')='' or d->>'at' is distinct from a->>'at'
     or policy-array['id','version','rule']<>'{}'::jsonb or policy->>'id' is distinct from pid::text or policy->>'rule' is distinct from 'ordinary_50_50'
    then raise exception 'OBLIGATION_MATERIAL_REQUIRED';end if;
    pv:=(policy->>'version')::bigint;
    select * into pol from crm_private.b05_payment_policies where policy_id=pid and version=pv and admin_scope=s;
    if not found then raise exception 'OBLIGATION_POLICY_REQUIRED';end if;
    -- Selectors are retained explicit application criteria, never an implicit new commercial rule.
    if pol.selectors->>'case' is not null and pol.selectors->>'case'<>bid::text
     or pol.selectors->>'service' is not null and (a->>'scope'<>'service' or pol.selectors->>'service'<>a->>'scopeId')
     or pol.selectors->>'provider' is not null and not exists(select 1 from crm_private.b04_services bs where bs.booking_id=bid and bs.service_id=(a->>'scopeId')::uuid and bs.applied->>'provider'=pol.selectors->>'provider')
     or pol.selectors->>'type' is not null and not exists(select 1 from crm_private.b04_services bs where bs.booking_id=bid and bs.service_id=(a->>'scopeId')::uuid and bs.nature=pol.selectors->>'type') then raise exception 'OBLIGATION_POLICY_SCOPE_REQUIRED';end if;
    if (d->'reference')->>'scope' is distinct from a->>'scope' or (d->'reference')->>'scopeId' is distinct from a->>'scopeId'
     or (d->'reference')->>'basis' not in ('default','express_contract') or coalesce((d->'reference')->>'sourceRef','')='' or coalesce((d->'reference')->>'version','')=''
     or coalesce((d->'reference'->'zone')->>'sourceRef','')='' or coalesce((d->'reference'->'zone')->>'version','')=''
     or not exists(select 1 from pg_timezone_names where name=(d->'reference'->'zone')->>'zone') or (d->'reference')->>'date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    then raise exception 'OBLIGATION_REFERENCE_REQUIRED';end if;
    -- No default can be guessed if any date in its scope remains pending.
    select case when bool_or(l.service_date is null) then null else min(l.service_date) end into firstdate
    from crm_private.b04_contributions bc join crm_private.b03_proposal_lines l using(version_id,line_id)
    where bc.booking_id=bid and (a->>'scope'='global' or a->>'scope'='modality' and bc.modality_id=(a->>'scopeId')::uuid or a->>'scope'='service' and bc.service_id=(a->>'scopeId')::uuid
     or a->>'scope'='night' and exists(select 1 from crm_private.b04_night_occupancies n where n.night_id=(a->>'scopeId')::uuid and n.contribution_id=bc.contribution_id));
    if (d->'reference')->>'basis'='default' and (firstdate is null or firstdate is distinct from ((d->'reference')->>'date')::date) then raise exception 'OBLIGATION_REFERENCE_REQUIRED';end if;
    amt:=((d->'base')->>'amount')::numeric;
    -- Reproducible whole selected modalities use accepted H2 prices. Other scopes require
    -- explicit evidence-bound determination, never proration or silent alteration of H2.
    if a->>'scope' in ('global','modality') and not exists(select 1 from crm_private.b04_modalities bm join crm_private.b03_proposal_lines l on l.version_id=b.version_id and l.modality_id=bm.modality_id and l.included
     where bm.booking_id=bid and (a->>'scope'='global' or bm.modality_id=(a->>'scopeId')::uuid)
     and not exists(select 1 from crm_private.b04_contributions bc where bc.booking_id=bid and bc.line_id=l.line_id)) then
     select sum(m.final_person_price*m.participants) into accepted from crm_private.b04_modalities bm join crm_private.b03_proposal_modalities m on m.version_id=b.version_id and m.modality_id=bm.modality_id
     where bm.booking_id=bid and (a->>'scope'='global' or bm.modality_id=(a->>'scopeId')::uuid);
     if accepted is not null and accepted<>amt then raise exception 'OBLIGATION_BASE_CONFLICT';end if;
    end if;
    actdate:=((a->>'at')::timestamptz at time zone ((d->'reference'->'zone')->>'zone'))::date;days:=((d->'reference')->>'date')::date-actdate;due:=((d->'reference')->>'date')::date-7;
    -- Exact numeric invariant checks on H1 output; not a second money/calc engine.
    initial:=case when days<7 then amt else round(amt/2,2) end;balance:=amt-initial;
    parts:=c->'parts';
    if jsonb_typeof(c) is distinct from 'object' or c->'policy' is distinct from policy or c->'base' is distinct from d->'base' or c->'reference' is distinct from d->'reference' or c->>'at' is distinct from a->>'at'
     or c->>'moneyVersion' is distinct from 'h1-money-d023-d028-d029-v1' or c->>'civilVersion' is distinct from 'h1-civil-d020-v1'
     or (c->'calculation')->>'algorithmVersion' is distinct from 'h1-money-d023-d028-d029-v1'
     or (c->'calculation')->'input' is distinct from jsonb_build_object('kind','percentage','base',(d->'base')->>'amount','percent',case when days<7 then '100' else '50' end)
     or (c->'calculation'->'output'->'applied')->>'amount' is distinct from to_char(initial,'FM999999999999999999999999999999990.00')
     or (c->'calculation'->'output')->>'remainder' is distinct from to_char(balance,'FM999999999999999999999999999999990.00')
     or (c->'evaluation')->>'actDate' is distinct from actdate::text or ((c->'evaluation')->>'daysBefore')::integer is distinct from days
     or c->'ordinary' is distinct from (case when days<7 then jsonb_build_array(jsonb_build_object('slot','initial','amount',(d->'base')->>'amount','due',jsonb_build_object('kind','before_confirmation')))
      else jsonb_build_array(jsonb_build_object('slot','initial','amount',to_char(initial,'FM999999999999999999999999999999990.00'),'due',jsonb_build_object('kind','at_confirmation')),jsonb_build_object('slot','balance','amount',to_char(balance,'FM999999999999999999999999999999990.00'),'due',jsonb_build_object('kind','civil','date',due::text))) end)
    then raise exception 'OBLIGATION_CALCULATION_INVALID';end if;
    if jsonb_typeof(parts) is distinct from 'array' or jsonb_array_length(parts) not between 1 and 2
     or exists(select 1 from jsonb_array_elements(parts) x where not crm_private.obligation_part_valid(x))
     or (select count(distinct x->>'slot') from jsonb_array_elements(parts) x)<>jsonb_array_length(parts)
     or (select sum((x->>'amount')::numeric) from jsonb_array_elements(parts) x)<>amt then raise exception 'OBLIGATION_PART_INVALID';end if;
    if d ? 'exception' then
     if (d->'exception')-array['reason','parts']<>'{}'::jsonb or coalesce(btrim((d->'exception')->>'reason'),'')='' or c->'exception' is distinct from d->'exception' or parts is distinct from (d->'exception')->'parts'
     then raise exception 'OBLIGATION_EXCEPTION_REQUIRED';end if;
    elsif parts is distinct from c->'ordinary' or c ? 'exception' then raise exception 'OBLIGATION_EXCEPTION_REQUIRED';end if;
    efp:=encode(crm_crypto.digest(convert_to((a-array['operationId','scheduleId','expectedRevision','evidenceId','computed'])::text,'UTF8'),'sha256'),'hex');
    if ps.schedule_id is not null then
     if ps.effect_fingerprint<>efp then raise exception 'OBLIGATION_EXISTS_CONFLICT';end if;
     sid:=ps.schedule_id;r:=jsonb_build_object('id',sid,'revision',1,'existing',true);
    else
     if (a->>'expectedRevision')::bigint<>0 then raise exception 'OBLIGATION_REVISION_CONFLICT';end if;
     insert into crm_private.b05_payment_schedules values(sid,bid,s,a->>'scope',(a->>'scopeId')::uuid,pid,pv,actor,efp,clock_timestamp());
     c:=c||jsonb_build_object('policyApplied',to_jsonb(pol),'bookingChain',b.chain_snapshot,'bookingVersion',b.version_id,'evidenceId',a->>'evidenceId','actorId',actor,'reason',a->>'reason');
     insert into crm_private.b05_schedule_revisions values(sid,1,s,c,actor,clock_timestamp());
     for part in select value from jsonb_array_elements(parts) loop insert into crm_private.b05_expected_payments values(sid,part->>'slot',s,(part->>'amount')::numeric,part->'due');end loop;
     r:=jsonb_build_object('id',sid,'revision',1,'existing',false);
    end if;
   else
    if a ?| array['definition','computed','policy','policyVersion','selectors'] or ps.schedule_id is null or ps.schedule_id<>sid or ps.policy_id<>pid then raise exception 'OBLIGATION_ADJUSTMENT_REQUIRED';end if;
    select revision,snapshot into rev,before_state from crm_private.b05_schedule_revisions where schedule_id=sid order by revision desc limit 1;
    if rev<>(a->>'expectedRevision')::bigint then raise exception 'OBLIGATION_REVISION_CONFLICT';end if;
    part:=jsonb_build_object('slot',a->>'slot','amount',a->>'amount','due',a->'due');
    if not crm_private.obligation_part_valid(part) or not exists(select 1 from crm_private.b05_expected_payments where schedule_id=sid and slot=a->>'slot') then raise exception 'OBLIGATION_ADJUSTMENT_REQUIRED';end if;
    select value into d from jsonb_array_elements(before_state->'parts') where value->>'slot'=a->>'slot';
    select jsonb_agg(case when x->>'slot'=a->>'slot' then part else x end order by ord) into parts from jsonb_array_elements(before_state->'parts') with ordinality z(x,ord);
    c:=jsonb_set(before_state,'{parts}',parts);
    insert into crm_private.b05_schedule_revisions values(sid,rev+1,s,c,actor,clock_timestamp());
    insert into crm_private.b05_obligation_adjustments values(op,sid,a->>'slot',rev+1,s,d,part,(a->>'amount')::numeric-(d->>'amount')::numeric,actor,a->>'reason',a->>'sourceRef',(a->>'evidenceId')::uuid,clock_timestamp());
    r:=jsonb_build_object('id',sid,'revision',rev+1,'originalRetained',true);
   end if;
  end if;
  insert into crm_private.b05_obligation_operations values(op,bid,s,actor,fp,a,r,clock_timestamp());
  insert into crm_private.b05_obligation_history values(op,bid,s,actor,before_state,r,a->>'sourceRef',a->>'reason',(a->>'evidenceId')::uuid,(a->>'at')::timestamptz,clock_timestamp());
  r:=jsonb_build_object('id',r->>'id','replayed',false,'result',r);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end $$;
alter function crm_api.obligation_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.obligation_apply(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.obligation_apply(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
create function crm_api.obligation_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;r jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'OBLIGATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-OBLIGATION-READ1' then raise exception 'OBLIGATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or a-array['bookingId','scheduleId']<>'{}'::jsonb or not(a ?& array['bookingId','scheduleId']) then raise exception 'OBLIGATION_INPUT_INVALID';end if;
 select jsonb_build_object('current',(select to_jsonb(x) from crm_private.b05_schedule_revisions x where x.schedule_id=ps.schedule_id order by revision desc limit 1),
 'original',(select jsonb_agg(jsonb_build_object('slot',x.slot,'amount',to_char(x.amount,'FM999999999999999999999999999999990.00'),'due',x.due) order by x.slot) from crm_private.b05_expected_payments x where x.schedule_id=ps.schedule_id),
 'history',coalesce((select jsonb_agg(to_jsonb(x) order by x.revision) from crm_private.b05_obligation_adjustments x where x.schedule_id=ps.schedule_id),'[]')) into r
 from crm_private.b05_payment_schedules ps where ps.schedule_id=(a->>'scheduleId')::uuid and ps.booking_id=(a->>'bookingId')::uuid and ps.admin_scope=hf[17];
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end $$;
alter function crm_api.obligation_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.obligation_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.obligation_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
