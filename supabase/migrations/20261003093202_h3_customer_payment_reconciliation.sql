-- H3-003/004: movements, receipt facts and correspondence acts, not allocation/Refund.
-- Existing F1/F2 narrow API pattern. No runtime CRUD or new human roles.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'PAYMENT_MIGRATION_AUTHORITY_REQUIRED';end if;end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b05_customer_payments(
 payment_id uuid primary key,admin_scope text not null,detected_data jsonb not null,
 detection_fingerprint text not null,evidence_id uuid not null unique references crm_private.b07_records(record_id),
 actor_id uuid not null references crm_private.crm_actors(actor_id),recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b05_movement_keys(
 source_ref text not null,external_id text not null,payment_id uuid not null references crm_private.b05_customer_payments(payment_id),
 admin_scope text not null,primary key(source_ref,external_id)
);
create table crm_private.b05_payment_revisions(
 payment_id uuid not null references crm_private.b05_customer_payments(payment_id),revision bigint not null check(revision>0),
 admin_scope text not null,snapshot jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 recorded_at timestamptz not null default clock_timestamp(),primary key(payment_id,revision)
);
create table crm_private.b05_payment_receipts(
 payment_id uuid primary key references crm_private.b05_customer_payments(payment_id),admin_scope text not null,
 fact jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 evidence_id uuid not null references crm_private.b07_records(record_id),source_evidence_id uuid not null references crm_private.b07_records(record_id),
 occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b05_reconciliations(
 reconciliation_id uuid primary key,payment_id uuid not null references crm_private.b05_customer_payments(payment_id),admin_scope text not null,
 booking_id uuid not null references crm_private.b04_bookings(booking_id),schedule_id uuid not null,slot text not null,
 foreign key(schedule_id,slot) references crm_private.b05_expected_payments(schedule_id,slot)
);
create table crm_private.b05_reconciliation_acts(
 act_id uuid primary key,reconciliation_id uuid not null references crm_private.b05_reconciliations(reconciliation_id),
 payment_id uuid not null references crm_private.b05_customer_payments(payment_id),admin_scope text not null,action text not null,
 before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 reason text not null,source_ref text not null,evidence_id uuid not null references crm_private.b07_records(record_id),
 occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b05_payment_operations(
 operation_id uuid primary key,payment_id uuid not null references crm_private.b05_customer_payments(payment_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,event jsonb not null,result jsonb not null,
 recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b05_payment_history(
 history_id uuid primary key references crm_private.b05_payment_operations(operation_id),payment_id uuid not null references crm_private.b05_customer_payments(payment_id),
 admin_scope text not null,actor_id uuid not null references crm_private.crm_actors(actor_id),before_data jsonb,after_data jsonb not null,
 reason text not null,source_ref text not null,evidence_id uuid not null references crm_private.b07_records(record_id),
 occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp()
);
create index b05_payment_history_root on crm_private.b05_payment_history(payment_id);
create index b05_reconciliation_acts_root on crm_private.b05_reconciliation_acts(payment_id);
create index b05_reconciliations_root on crm_private.b05_reconciliations(payment_id);
create function crm_private.payment_immutable() returns trigger language plpgsql set search_path=pg_catalog,pg_temp as $$
begin raise exception 'PAYMENT_IMMUTABLE';end $$;
alter function crm_private.payment_immutable() owner to crm_h0_f2_owner;
revoke all on function crm_private.payment_immutable() from public;
do $$ declare t text;r text;begin foreach t in array array['b05_customer_payments','b05_movement_keys','b05_payment_revisions','b05_payment_receipts','b05_reconciliations','b05_reconciliation_acts','b05_payment_operations','b05_payment_history'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);
 execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy payment_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy payment_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger payment_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end $$;
-- Validation of already materialized H1 decimal money; no alternate rounding system.
create function crm_private.payment_amount(p jsonb,positive boolean default false) returns boolean
language sql immutable set search_path=pg_catalog,pg_temp as $$
 select jsonb_typeof(p)='string' and length(p#>>'{}')<=260 and (p#>>'{}') ~ '^(0|[1-9][0-9]*)\.[0-9]{2}$' and (not positive or p#>>'{}'<>'0.00')
$$;
create function crm_private.payment_evidence(ref uuid,pid uuid,s text,claim text,at_time timestamptz,reviewed boolean) returns boolean
language sql stable set search_path=pg_catalog,pg_temp as $$
 select exists(select 1 from crm_private.b07_records r join crm_private.b07_links l using(record_id)
 where r.record_id=ref and r.admin_scope=s and l.admin_scope=s and l.context_kind='other' and l.context_id=pid
 and r.record_kind='evidence' and r.material->>'claim'=claim and r.material->>'coverage'=pid::text and l.coverage=pid::text
 and r.occurred_at<=at_time and (not reviewed or (r.material->>'certainty'='reviewed' and r.material->>'source_kind' in ('manual','external'))))
$$;
-- Only an Admin's separately recorded, reviewed authorized-source assertion can admit
-- a source locally. No boolean from a payment payload grants authority. Real sources pending.
create function crm_private.payment_summary(p jsonb) returns jsonb language plpgsql immutable set search_path=pg_catalog,pg_temp as $$
declare gross numeric;v numeric:=0;historical numeric:=0;susp numeric:=0;c jsonb;i jsonb;lo numeric;hi numeric;cur numeric;lastlo numeric;lasthi numeric;unions jsonb:='[]';
begin
 if p->'receipt'='null'::jsonb then return jsonb_build_object('grossReceived',null,'verifiedCorrespondence','0.00','unreconciled',null,'suspended',null,
 'base',case when jsonb_array_length(p->'correspondences')>0 then 'pending_reconciliation' else 'detected' end,
 'incidence',exists(select 1 from jsonb_array_elements(p->'incidents') x where not (x->>'resolved')::boolean),'algorithmVersion','h1-money-d023-d028-d029-v1');end if;
 gross:=(p->'receipt'->>'amount')::numeric;
 for i in select value from jsonb_array_elements(p->'incidents') where not(value->>'resolved')::boolean order by (value->>'start')::numeric loop
  lo:=(i->>'start')::numeric;hi:=lo+(i->>'amount')::numeric;
  if lastlo is null then lastlo:=lo;lasthi:=hi;
  elsif lo<=lasthi then lasthi:=greatest(lasthi,hi);
  else unions:=unions||jsonb_build_array(jsonb_build_object('lo',lastlo::text,'hi',lasthi::text));lastlo:=lo;lasthi:=hi;end if;
 end loop;
 if lastlo is not null then unions:=unions||jsonb_build_array(jsonb_build_object('lo',lastlo::text,'hi',lasthi::text));end if;
 for i in select value from jsonb_array_elements(unions) loop susp:=susp+(i->>'hi')::numeric-(i->>'lo')::numeric;end loop;
 for c in select value from jsonb_array_elements(p->'correspondences') where value->>'status'='verified' loop
  lo:=(c->>'start')::numeric;hi:=lo+(c->>'amount')::numeric;cur:=(c->>'amount')::numeric;historical:=historical+cur;
  for i in select value from jsonb_array_elements(unions) loop cur:=cur-greatest(0,least(hi,(i->>'hi')::numeric)-greatest(lo,(i->>'lo')::numeric));end loop;
  v:=v+cur;
 end loop;
 return jsonb_build_object('grossReceived',trunc(gross,2)::text,'verifiedCorrespondence',trunc(v,2)::text,'unreconciled',trunc(gross-v,2)::text,'suspended',trunc(susp,2)::text,
 'base',case when historical=gross then 'reconciled' when jsonb_array_length(p->'correspondences')>0 then 'pending_reconciliation' else 'detected' end,'incidence',susp>0,'algorithmVersion','h1-money-d023-d028-d029-v1');
end $$;
do $$ declare f text;begin foreach f in array array['payment_amount(jsonb,boolean)','payment_evidence(uuid,uuid,text,text,timestamp with time zone,boolean)','payment_summary(jsonb)'] loop
 execute 'alter function crm_private.'||f||' owner to crm_h0_f2_owner';execute 'revoke all on function crm_private.'||f||' from public';execute 'grant execute on function crm_private.'||f||' to crm_h0_f2_executor';end loop;end $$;
create function crm_api.payment_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;d jsonb;current_state jsonb;before_state jsonb;r jsonb;rc jsonb;oldrc jsonb;inc jsonb;keydata jsonb;newreceipt jsonb;
 op uuid;pid uuid;requested uuid;actor uuid;s text;fp text;proofhash text;effecthash text;action text;rev bigint;at_time timestamptz;canonical uuid;rid uuid;iid uuid;
 p crm_private.b05_customer_payments;prev crm_private.b05_payment_operations;b crm_private.b04_bookings;oldreceipt crm_private.b05_payment_receipts;
 start_at numeric;amt numeric;gross numeric;end_at numeric;changed boolean:=true;allowed text[];
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'PAYMENT_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-PAYMENT1' then raise exception 'PAYMENT_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 action:=a->>'action';allowed:=array['action','operationId','paymentId','expectedRevision','sourceRef','reason','at','evidenceId','origin'];
 if action='detect' then allowed:=allowed||array['detection','sourceEvidenceId','presentedEvidenceId'];
 elsif action='receive' then allowed:=allowed||array['amount','identity','sourceEvidenceId','discrepancy'];
 elsif action='propose' then allowed:=allowed||array['reconciliationId','start','amount','bookingId','scheduleId','slot'];
 elsif action='verify' then allowed:=allowed||array['reconciliationId','sourceEvidenceId'];
 elsif action='discrepancy' then allowed:=allowed||array['reconciliationId','incidentId','start','amount'];
 elsif action='rectify' then allowed:=allowed||array['reconciliationId','incidentId','start','amount','bookingId','scheduleId','slot','sourceEvidenceId'];
 elsif action='resolve' then allowed:=allowed||array['incidentId','sourceEvidenceId'];
 else raise exception 'PAYMENT_INPUT_INVALID';end if;
 if jsonb_typeof(a) is distinct from 'object' or a-allowed<>'{}'::jsonb or not(a ?& array['action','operationId','paymentId','expectedRevision','sourceRef','reason','at','evidenceId'])
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision' !~ '^[0-9]+$'
 or coalesce(a->>'origin','manual') not in ('manual','ai') or (coalesce(a->>'origin','manual')='ai' and action<>'propose')
 or exists(select 1 from jsonb_each(a) x where x.key in ('sourceRef','reason','at') and (jsonb_typeof(x.value)<>'string' or btrim(x.value#>>'{}')='' or length(x.value#>>'{}')>16384))
 or a->>'at' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'PAYMENT_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;requested:=(a->>'paymentId')::uuid;pid:=requested;actor:=hf[12]::uuid;s:=hf[17];at_time:=(a->>'at')::timestamptz;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('payment-op:'||op,0));
 select * into prev from crm_private.b05_payment_operations where operation_id=op;
 if found then
  if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'PAYMENT_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  if action='detect' then
   d:=a->'detection';
   if jsonb_typeof(d) is distinct from 'object' or d-array['amount','payerRef','date','method','reference','bookingId','identity']<>'{}'::jsonb
   or not(d ?& array['amount','payerRef','date','method','reference','bookingId','identity'])
   or (d->'amount'<>'null'::jsonb and not coalesce(crm_private.payment_amount(d->'amount',true),false))
   or (d->'method'<>'null'::jsonb and d->>'method'<>'bank_transfer')
   or exists(select 1 from jsonb_each(d) x where x.key in ('payerRef','reference','date','bookingId') and x.value<>'null'::jsonb and (jsonb_typeof(x.value)<>'string' or btrim(x.value#>>'{}')=''))
   then raise exception 'PAYMENT_INPUT_INVALID';end if;
   if d->'date'<>'null'::jsonb and (d->>'date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or (d->>'date')::date::text<>d->>'date') then raise exception 'PAYMENT_INPUT_INVALID';end if;
   keydata:=d->'identity';perform pg_advisory_xact_lock(hashtextextended('payment-signal:'||(a->>'evidenceId'),0));
   select payment_id into canonical from crm_private.b05_customer_payments where evidence_id=(a->>'evidenceId')::uuid;
   if canonical is not null then pid:=canonical;end if;
   effecthash:=encode(crm_crypto.digest(convert_to(d::text,'UTF8'),'sha256'),'hex');
  elsif action='receive' then keydata:=a->'identity';end if;
  if keydata is not null and keydata<>'null'::jsonb then
   if jsonb_typeof(keydata) is distinct from 'object' or keydata-array['sourceRef','externalId']<>'{}'::jsonb or not(keydata ?& array['sourceRef','externalId'])
   or exists(select 1 from jsonb_each(keydata) x where jsonb_typeof(x.value)<>'string' or btrim(x.value#>>'{}')='' or length(x.value#>>'{}')>4096) then raise exception 'PAYMENT_IDENTITY_REQUIRED';end if;
   perform pg_advisory_xact_lock(hashtextextended('payment-key:'||keydata::text,0));
   select payment_id into canonical from crm_private.b05_movement_keys where source_ref=keydata->>'sourceRef' and external_id=keydata->>'externalId';
   if action='detect' and canonical is not null then pid:=canonical;end if;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('payment-root:'||pid,0));
  select * into p from crm_private.b05_customer_payments where payment_id=pid;
  if found then
   if p.admin_scope<>s then raise exception 'PAYMENT_DENIED';end if;
   select snapshot,revision into current_state,rev from crm_private.b05_payment_revisions where payment_id=pid order by revision desc limit 1;before_state:=current_state;
  elsif action<>'detect' then raise exception 'PAYMENT_DENIED';end if;
  proofhash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId','sourceEvidenceId','paymentId'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.payment_evidence((a->>'evidenceId')::uuid,pid,s,'payment:'||action||':'||proofhash,at_time,action<>'detect' and action<>'propose') then raise exception 'PAYMENT_EVIDENCE_REQUIRED';end if;
  if (action='detect' and keydata<>'null'::jsonb) or action in ('receive','verify','rectify','resolve') then
   if action='detect' or action='receive' then
    if keydata is null or keydata='null'::jsonb then raise exception 'PAYMENT_IDENTITY_REQUIRED';end if;
   else keydata:=current_state->'receipt'->'identity';end if;
   if keydata is null or keydata='null'::jsonb or not crm_private.payment_evidence((a->>'sourceEvidenceId')::uuid,pid,s,'payment-source:'||(keydata->>'sourceRef'),at_time,true)
   then raise exception 'PAYMENT_AUTHORIZED_SOURCE_REQUIRED';end if;
  end if;
  if action='detect' then
   if a?'presentedEvidenceId' and not exists(select 1 from crm_private.b07_records er join crm_private.b07_links el using(record_id)
    where er.record_id=(a->>'presentedEvidenceId')::uuid and er.admin_scope=s and el.admin_scope=s and el.context_kind='other' and el.context_id=pid and el.coverage=pid::text)
    then raise exception 'PAYMENT_PRESENTED_EVIDENCE_REQUIRED';end if;
   if p.payment_id is not null then
    if p.detection_fingerprint<>effecthash then raise exception 'PAYMENT_MOVEMENT_CONFLICT:E2';end if;changed:=false;
   else
    if (a->>'expectedRevision')::bigint<>0 then raise exception 'PAYMENT_REVISION_CONFLICT:E2';end if;
    if d->'bookingId'<>'null'::jsonb then select * into b from crm_private.b04_bookings where booking_id=(d->>'bookingId')::uuid and admin_scope=s;if not found then raise exception 'PAYMENT_CONTEXT_REQUIRED';end if;end if;
    insert into crm_private.b05_customer_payments values(pid,s,d,effecthash,(a->>'evidenceId')::uuid,actor,clock_timestamp());
    current_state:=jsonb_build_object('detection',d,'receipt',null,'correspondences','[]'::jsonb,'incidents','[]'::jsonb,'duplicateOf',null,'presentedEvidenceId',a->'presentedEvidenceId','revision',1);rev:=0;
    if keydata<>'null'::jsonb then insert into crm_private.b05_movement_keys values(keydata->>'sourceRef',keydata->>'externalId',pid,s);end if;
   end if;
  else
   if current_state->'duplicateOf'<>'null'::jsonb then raise exception 'PAYMENT_DUPLICATE_SIGNAL';end if;
   if action='receive' then
    if not coalesce(crm_private.payment_amount(a->'amount',true),false) then raise exception 'PAYMENT_AMOUNT_INVALID';end if;
    if a->'discrepancy' is not null and a->'discrepancy'<>'null'::jsonb and (jsonb_typeof(a->'discrepancy')<>'string' or btrim(a->>'discrepancy')='') then raise exception 'PAYMENT_DISCREPANCY_REQUIRED';end if;
    if current_state->'detection'->'identity'<>'null'::jsonb and current_state->'detection'->'identity'<>keydata then raise exception 'PAYMENT_MOVEMENT_CONFLICT:E2';end if;
    newreceipt:=jsonb_build_object('amount',a->>'amount','sourceRef',a->>'sourceRef','evidenceId',a->>'evidenceId','identity',keydata,'discrepancy',a->'discrepancy');
    if current_state->'receipt'<>'null'::jsonb then
     if ((current_state->'receipt')-'evidenceId')<>(newreceipt-'evidenceId') then raise exception 'PAYMENT_RECEIPT_CONFLICT:E2';end if;changed:=false;
    else
     if (a->>'expectedRevision')::bigint<>rev then raise exception 'PAYMENT_REVISION_CONFLICT:E2';end if;
     if canonical is not null and canonical<>pid then
      select * into oldreceipt from crm_private.b05_payment_receipts where payment_id=canonical and admin_scope=s;
      if not found or (oldreceipt.fact->>'amount')<>(a->>'amount') then raise exception 'PAYMENT_MOVEMENT_CONFLICT:E2';end if;
      current_state:=jsonb_set(current_state,'{duplicateOf}',to_jsonb(canonical::text));
     else
      if current_state->'detection'->'amount'<>'null'::jsonb and current_state->'detection'->>'amount'<>a->>'amount' and nullif(a->>'discrepancy','') is null then raise exception 'PAYMENT_DISCREPANCY_REQUIRED';end if;
      insert into crm_private.b05_payment_receipts values(pid,s,newreceipt,actor,(a->>'evidenceId')::uuid,(a->>'sourceEvidenceId')::uuid,at_time,clock_timestamp());
      if canonical is null then insert into crm_private.b05_movement_keys values(keydata->>'sourceRef',keydata->>'externalId',pid,s);end if;
      current_state:=jsonb_set(current_state,'{receipt}',newreceipt);
      if nullif(a->>'discrepancy','') is not null then current_state:=jsonb_set(current_state,'{incidents}',current_state->'incidents'||jsonb_build_array(jsonb_build_object('id',op,'reconciliationId',null,'start','0.00','amount',a->>'amount','resolved',false,'reason',a->>'discrepancy')));end if;
     end if;
    end if;
   else
    if (a->>'expectedRevision')::bigint<>rev then raise exception 'PAYMENT_REVISION_CONFLICT:E2';end if;
    rid:=(a->>'reconciliationId')::uuid;iid:=(a->>'incidentId')::uuid;
    if action in ('verify','rectify') then
     select value into oldrc from jsonb_array_elements(current_state->'correspondences') where value->>'id'=rid::text;
     if oldrc is null or current_state->'receipt'='null'::jsonb then raise exception 'PAYMENT_CORRESPONDENCE_REQUIRED';end if;
    end if;
    if action in ('propose','rectify') then
     if rid is null or not coalesce(crm_private.payment_amount(a->'start'),false) or not coalesce(crm_private.payment_amount(a->'amount',true),false) then raise exception 'PAYMENT_PORTION_REQUIRED';end if;
     select * into b from crm_private.b04_bookings where booking_id=(a->>'bookingId')::uuid and admin_scope=s;
     if not found or a->>'slot' not in ('initial','balance') or not exists(select 1 from crm_private.b05_payment_schedules ps join crm_private.b05_expected_payments ep using(schedule_id) where ps.schedule_id=(a->>'scheduleId')::uuid and ps.booking_id=b.booking_id and ps.admin_scope=s and ep.slot=a->>'slot') then raise exception 'PAYMENT_CONTEXT_REQUIRED';end if;
     if current_state->'detection'->'bookingId'<>'null'::jsonb and current_state->'detection'->>'bookingId'<>b.booking_id::text
     or exists(select 1 from jsonb_array_elements(current_state->'correspondences') x where x->>'bookingId'<>b.booking_id::text)
     then raise exception 'PAYMENT_CONTEXT_REQUIRED';end if;
     rc:=jsonb_build_object('id',rid,'start',a->>'start','amount',a->>'amount','bookingId',b.booking_id,'scheduleId',a->>'scheduleId','slot',a->>'slot','status',case when action='propose' then 'proposed' else 'verified' end,'revision',case when action='propose' then 1 else (oldrc->>'revision')::bigint+1 end,'sourceRef',a->>'sourceRef','evidenceId',a->>'evidenceId');
    elsif action='verify' then
     if oldrc->>'status'<>'proposed' then raise exception 'PAYMENT_REVISION_CONFLICT:E2';end if;
     rc:=oldrc||jsonb_build_object('status','verified','revision',(oldrc->>'revision')::bigint+1,'sourceRef',a->>'sourceRef','evidenceId',a->>'evidenceId');
    end if;
    if action in ('rectify','resolve') then
     select value into inc from jsonb_array_elements(current_state->'incidents') where value->>'id'=iid::text and not(value->>'resolved')::boolean;
     if inc is null or (action='rectify' and inc->>'reconciliationId' is distinct from rid::text) or (action='resolve' and inc->'reconciliationId'<>'null'::jsonb) then raise exception 'PAYMENT_REVIEW_REQUIRED';end if;
     current_state:=jsonb_set(current_state,'{incidents}',(select jsonb_agg(case when x->>'id'=iid::text then x||jsonb_build_object('resolved',true,'resolutionEvidenceId',a->>'evidenceId','resolutionReason',a->>'reason','resolutionSource',a->>'sourceRef') else x end) from jsonb_array_elements(current_state->'incidents') x));
    end if;
    if action in ('propose','verify','rectify','discrepancy') then
     if action='discrepancy' then
      if iid is null or not coalesce(crm_private.payment_amount(a->'start'),false) or not coalesce(crm_private.payment_amount(a->'amount',true),false) then raise exception 'PAYMENT_PORTION_REQUIRED';end if;
      if exists(select 1 from jsonb_array_elements(current_state->'incidents') x where x->>'id'=iid::text) then raise exception 'PAYMENT_REVISION_CONFLICT:E2';end if;
      start_at:=(a->>'start')::numeric;amt:=(a->>'amount')::numeric;
      if rid is not null then select value into oldrc from jsonb_array_elements(current_state->'correspondences') where value->>'id'=rid::text;
       if oldrc is null or start_at<(oldrc->>'start')::numeric or start_at+amt>(oldrc->>'start')::numeric+(oldrc->>'amount')::numeric then raise exception 'PAYMENT_PORTION_REQUIRED';end if;end if;
     else start_at:=(rc->>'start')::numeric;amt:=(rc->>'amount')::numeric;end if;
     gross:=coalesce((current_state->'receipt'->>'amount')::numeric,(current_state->'detection'->>'amount')::numeric);end_at:=start_at+amt;
     if gross is not null and end_at>gross or (gross is null and action<>'propose') then raise exception 'PAYMENT_PORTION_REQUIRED';end if;
     if action in ('verify','rectify') then
      if exists(select 1 from jsonb_array_elements(current_state->'correspondences') x where x->>'id'<>rid::text and x->>'status'='verified' and (x->>'start')::numeric<end_at and (x->>'start')::numeric+(x->>'amount')::numeric>start_at)
      or exists(select 1 from jsonb_array_elements(current_state->'incidents') x where not(x->>'resolved')::boolean and (x->>'start')::numeric<end_at and (x->>'start')::numeric+(x->>'amount')::numeric>start_at) then raise exception 'PAYMENT_PORTION_SUSPENDED_OR_USED';end if;
     end if;
     if action='discrepancy' then
      inc:=jsonb_build_object('id',iid,'reconciliationId',rid,'start',a->>'start','amount',a->>'amount','resolved',false,'reason',a->>'reason');
      current_state:=jsonb_set(current_state,'{incidents}',current_state->'incidents'||jsonb_build_array(inc));
     elsif action='propose' then
      insert into crm_private.b05_reconciliations values(rid,pid,s,b.booking_id,(a->>'scheduleId')::uuid,a->>'slot');
      current_state:=jsonb_set(current_state,'{correspondences}',current_state->'correspondences'||jsonb_build_array(rc));
     else current_state:=jsonb_set(current_state,'{correspondences}',(select jsonb_agg(case when x->>'id'=rid::text then rc else x end) from jsonb_array_elements(current_state->'correspondences') x));end if;
     if rid is not null then insert into crm_private.b05_reconciliation_acts values(op,rid,pid,s,action,oldrc,case when action='discrepancy' then inc else rc end,actor,a->>'reason',a->>'sourceRef',(a->>'evidenceId')::uuid,at_time,clock_timestamp());end if;
    end if;
   end if;
  end if;
  if changed then current_state:=jsonb_set(current_state,'{revision}',to_jsonb(rev+1));insert into crm_private.b05_payment_revisions values(pid,rev+1,s,current_state,actor,clock_timestamp());end if;
  r:=jsonb_build_object('id',pid,'replayed',false,'result',jsonb_build_object('revision',current_state->'revision','duplicateOf',current_state->'duplicateOf','summary',crm_private.payment_summary(current_state)));
  insert into crm_private.b05_payment_operations values(op,pid,s,actor,fp,a,r,clock_timestamp());
  insert into crm_private.b05_payment_history values(op,pid,s,actor,before_state,current_state,a->>'reason',a->>'sourceRef',(a->>'evidenceId')::uuid,at_time,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end $$;
alter function crm_api.payment_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.payment_apply(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.payment_apply(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
create function crm_api.payment_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;r jsonb;pid uuid;s text;p jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'PAYMENT_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-PAYMENT-READ1' then raise exception 'PAYMENT_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or a-'paymentId'<>'{}'::jsonb or not(a?'paymentId') then raise exception 'PAYMENT_INPUT_INVALID';end if;
 pid:=(a->>'paymentId')::uuid;s:=hf[17];
 select snapshot into p from crm_private.b05_payment_revisions where payment_id=pid and admin_scope=s order by revision desc limit 1;
 if found then r:=jsonb_build_object('current',p,'summary',crm_private.payment_summary(p),
 'history',(select jsonb_agg(to_jsonb(x) order by x.recorded_at,x.history_id) from crm_private.b05_payment_history x where x.payment_id=pid and x.admin_scope=s),
 'receipts',coalesce((select jsonb_agg(to_jsonb(x)) from crm_private.b05_payment_receipts x where x.payment_id=pid and x.admin_scope=s),'[]'),
 'acts',coalesce((select jsonb_agg(to_jsonb(x) order by x.recorded_at,x.act_id) from crm_private.b05_reconciliation_acts x where x.payment_id=pid and x.admin_scope=s),'[]'));end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end $$;
alter function crm_api.payment_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.payment_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.payment_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
