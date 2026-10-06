-- H4-015/016. Manual accredited Refund facts; no bank dispatch, no alternate fund ledger.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'REFUND_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b05_refunds(refund_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings,admin_scope text not null,initial_operation_id uuid not null);
create table crm_private.b05_refund_operations(operation_id uuid primary key,refund_id uuid not null references crm_private.b05_refunds,admin_scope text not null,actor_id uuid not null references crm_private.crm_actors,fingerprint text not null,result jsonb not null,result_revision bigint not null,recorded_at timestamptz not null default clock_timestamp());
create table crm_private.b05_refund_revisions(refund_id uuid not null references crm_private.b05_refunds,revision bigint not null,admin_scope text not null,operation_id uuid not null unique references crm_private.b05_refund_operations deferrable initially deferred,action text not null,event jsonb not null,before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors,evidence_id uuid not null references crm_private.b07_records,source_ref text not null,reason text not null,occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(refund_id,revision));
alter table crm_private.b05_refunds add foreign key(initial_operation_id) references crm_private.b05_refund_operations deferrable initially deferred;
alter table crm_private.b05_refund_operations add foreign key(refund_id,result_revision) references crm_private.b05_refund_revisions deferrable initially deferred;
-- Identity is scoped by admitted source AND source account AND medium. Reference alone is not universal.
create table crm_private.b05_refund_movements(movement_id uuid primary key,refund_id uuid not null references crm_private.b05_refunds,admin_scope text not null,identity_source text not null,identity_account text not null,identity_method text not null,external_id text not null,material jsonb not null,authorized boolean not null,authorization_ref text,operation_id uuid not null references crm_private.b05_refund_operations deferrable initially deferred,unique(admin_scope,identity_source,identity_account,identity_method,external_id));
create index b05_refund_scope on crm_private.b05_refunds(admin_scope,booking_id);
create index b05_refund_movement_root on crm_private.b05_refund_movements(refund_id);
do $$declare t text;r text;begin foreach t in array array['b05_refunds','b05_refund_operations','b05_refund_revisions','b05_refund_movements'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy refund_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);execute format('create policy refund_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);execute format('revoke all on crm_private.%I from public,crm_h0_runtime,crm_h0_ha_tx',t);
 execute format('create trigger refund_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
create function crm_private.refund_latest(s text) returns setof jsonb language sql stable set search_path=pg_catalog,pg_temp as $$
 select x.after_data from (select distinct on(refund_id) refund_id,after_data from crm_private.b05_refund_revisions where admin_scope=s order by refund_id,revision desc)x
$$;
-- Existing money intervals, inferred from immutable facts and current incident result, not a second ledger.
create function crm_private.refund_blocks(pid uuid,s text,exclude_attempt uuid default null) returns nummultirange language sql stable set search_path=pg_catalog,pg_temp as $$
 select coalesce(range_agg(numrange((x->>'start')::numeric,(x->>'start')::numeric+(x->>'amount')::numeric,'[)')),'{}'::nummultirange) from (
 select v x from crm_private.b05_refund_movements m cross join lateral jsonb_array_elements(m.material->'portions') v where m.admin_scope=s and v->>'paymentId'=pid::text
 union all select a->'portion' from crm_private.refund_latest(s) r cross join lateral jsonb_array_elements(r->'attempts') a where a->>'resolved'='false' and a->'portion'->>'paymentId'=pid::text and (exclude_attempt is null or a->>'id'<>exclude_attempt::text)
 ) parts
$$;
create function crm_private.refund_sum(pid uuid,s text) returns numeric language sql stable set search_path=pg_catalog,pg_temp as $$
 select coalesce(sum((v->>'amount')::numeric),0) from crm_private.b05_refund_movements m cross join lateral jsonb_array_elements(m.material->'portions')v where m.admin_scope=s and v->>'paymentId'=pid::text
$$;
create function crm_private.refund_right(did uuid,bid uuid,s text,expected bigint) returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare d jsonb;rev bigint;
begin
 select cr.revision,cr.after_data into rev,d from crm_private.b06_cancellation_revisions cr join crm_private.b06_cancellation_determinations root using(determination_id) where cr.determination_id=did and cr.admin_scope=s and root.admin_scope=s and root.booking_id=bid order by cr.revision desc limit 1;
 if d is null then raise exception 'REFUND_DENIED';end if;
 if expected is null or rev<>expected or d->>'scopeToken' is distinct from crm_private.cancellation_token(d->'scope',bid,s) then raise exception 'REFUND_RIGHT_REVISION_CONFLICT:E2';end if;
 if d->'computed'->>'status'<>'determined' then raise exception 'REFUND_RIGHT_PENDING:E3';end if;return d;
end$$;
-- All callers own stable payment-root locks first. Version check optional only for immutable historical authorization.
create function crm_private.refund_portions(parts jsonb,bid uuid,s text,check_revision boolean,exclude_attempt uuid default null) returns boolean language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare v jsonb;p jsonb;rc jsonb;al jsonb;pid uuid;lo numeric;amt numeric;pr bigint;fr bigint;occupied nummultirange;
begin
 if jsonb_typeof(parts) is distinct from 'array' or jsonb_array_length(parts)=0 then return false;end if;
 for v in select value from jsonb_array_elements(parts) loop
  if v-array['paymentId','reconciliationId','start','amount','paymentRevision','fundRevision','allocationId']<>'{}'::jsonb or not(v?&array['paymentId','reconciliationId','start','amount','paymentRevision','fundRevision']) or crm_private.payment_amount(v->'start') is distinct from true or crm_private.payment_amount(v->'amount',true) is distinct from true then return false;end if;
  pid:=(v->>'paymentId')::uuid;lo:=(v->>'start')::numeric;amt:=(v->>'amount')::numeric;
  select revision,snapshot into pr,p from crm_private.b05_payment_revisions where payment_id=pid and admin_scope=s order by revision desc limit 1;
  select max(revision) into fr from crm_private.b05_fund_revisions where payment_id=pid and admin_scope=s;
  if p is null or p->'receipt'='null'::jsonb or p->>'duplicateOf' is not null then return false;end if;
  if check_revision and (pr is distinct from (v->>'paymentRevision')::bigint or fr is distinct from (v->>'fundRevision')::bigint) then raise exception 'REFUND_FUNDS_REVISION_CONFLICT:E2';end if;
  select value into rc from jsonb_array_elements(p->'correspondences')where value->>'id'=v->>'reconciliationId';
  if rc is null or rc->>'bookingId' is distinct from bid::text or rc->>'status'<>'verified' or lo<(rc->>'start')::numeric or lo+amt>(rc->>'start')::numeric+(rc->>'amount')::numeric then return false;end if;
  occupied:=crm_private.refund_blocks(pid,s,exclude_attempt);
  select occupied+coalesce(range_agg(numrange((x->>'start')::numeric,(x->>'start')::numeric+(x->>'amount')::numeric,'[)')),'{}'::nummultirange) into occupied from jsonb_array_elements(p->'incidents')x where x->>'resolved'='false';
  if occupied && numrange(lo,lo+amt,'[)') then return false;end if;
  for al in select value from jsonb_array_elements(crm_private.fund_allocations(pid,s)) where value->>'status'='verified' loop
   if numrange((al->>'start')::numeric,(al->>'start')::numeric+(al->>'amount')::numeric,'[)') && numrange(lo,lo+amt,'[)') then
    if al->>'id' is distinct from v->>'allocationId' or al->'destination'->>'bookingId' is distinct from bid::text or lo<(al->>'start')::numeric or lo+amt>(al->>'start')::numeric+(al->>'amount')::numeric then return false;end if;
    if exists(select 1 from crm_private.b05_allocation_acts z where z.allocation_id=(al->>'id')::uuid and z.kind='consume' and numrange(z.start_amount,z.start_amount-z.signed_amount,'[)')&&numrange(lo,lo+amt,'[)') and not exists(select 1 from crm_private.b05_allocation_acts r where r.original_act_id=z.act_id)) then return false;end if;
   end if;
  end loop;
  if v?'allocationId' and not exists(select 1 from crm_private.b05_allocations where allocation_id=(v->>'allocationId')::uuid and payment_id=pid and booking_id=bid and admin_scope=s) then return false;end if;
  if (select count(*)from jsonb_array_elements(parts)o where o->>'paymentId'=pid::text and numrange((o->>'start')::numeric,(o->>'start')::numeric+(o->>'amount')::numeric,'[)')&&numrange(lo,lo+amt,'[)'))<>1 then return false;end if;
 end loop;return true;
end$$;
create function crm_private.refund_core(a jsonb,s text,actor uuid,reservation text default null) returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare id uuid;bid uuid;op uuid;root crm_private.b05_refunds;prev crm_private.b05_refund_operations;old jsonb;state jsonb;rev bigint;fp text;hash text;at_time timestamptz;action text;d jsonb;v jsonb;p jsonb;m jsonb;au jsonb;pid uuid;attempt jsonb;stored crm_private.b05_refund_movements;mid uuid;authorized boolean;paid numeric;right_amount numeric;amount numeric;auth_amount numeric;receipt jsonb;blocks nummultirange;incident uuid;
begin
 if jsonb_typeof(a) is distinct from 'object' or a-array['action','operationId','refundId','bookingId','expectedRevision','sourceRef','reason','evidenceId','at','origin','requesterId','paymentIds','cause','affectedScope','determinationId','determinationRevision','authorization','movement','incidentId','attempt','attemptId','resolution','originalMovementId']<>'{}'::jsonb
 or not(a?&array['action','operationId','refundId','bookingId','expectedRevision','sourceRef','reason','evidenceId','at'])
 or exists(select 1 from unnest(array['action','operationId','refundId','bookingId','sourceRef','reason','evidenceId','at']) k where crm_private.invoice_text(a->k) is distinct from true)
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision'!~'^[0-9]+$' or coalesce(a->>'origin','manual') not in ('manual','ai') or a->>'at'!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'REFUND_INPUT_INVALID';end if;
 action:=a->>'action';if action not in ('request','determine','authorize','record','uncertain','resolve','withdraw','not_due','correct','revoke')then raise exception 'REFUND_INPUT_INVALID';end if;
 if a->>'origin'='ai' and reservation is null then raise exception 'REFUND_APPROVAL_REQUIRED';end if;
 id:=(a->>'refundId')::uuid;bid:=(a->>'bookingId')::uuid;op:=(a->>'operationId')::uuid;at_time:=(a->>'at')::timestamptz;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s) then raise exception 'REFUND_DENIED';end if;
 -- Operational/contractual parent first, then H3 book/fund root, then payment roots in stable order.
 perform pg_advisory_xact_lock(hashtextextended((select opportunity_id::text from crm_private.b04_bookings where booking_id=bid),31));
 perform pg_advisory_xact_lock(hashtextextended('cancellation-booking:'||bid,0));
 perform pg_advisory_xact_lock(hashtextextended('refund-root:'||id,0));
 select * into root from crm_private.b05_refunds where refund_id=id and booking_id=bid and admin_scope=s;
 if action not in ('request','determine') and root.refund_id is null then raise exception 'REFUND_DENIED';end if;
 if exists(select 1 from crm_private.b05_refunds where refund_id=id and (booking_id<>bid or admin_scope<>s))then raise exception 'REFUND_DENIED';end if;
 select revision,after_data into rev,old from crm_private.b05_refund_revisions where refund_id=id and admin_scope=s order by revision desc limit 1;rev:=coalesce(rev,0);
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('refund-op:'||op,0));
 select * into prev from crm_private.b05_refund_operations where operation_id=op;
 if found then if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'REFUND_REPLAY_CONFLICT:E2';end if;return prev.result||jsonb_build_object('replayed',true);end if;
 for pid in select distinct value::uuid from (
 select value#>>'{}' value from jsonb_array_elements(coalesce(a->'paymentIds','[]'))
 union select x->>'paymentId' from jsonb_array_elements(coalesce(a->'authorization'->'portions','[]'))x
 union select x->>'paymentId' from jsonb_array_elements(coalesce(a->'movement'->'portions','[]'))x
 union select a->'attempt'->'portion'->>'paymentId' where a?'attempt'
 union select x->>'paymentId' from jsonb_array_elements(coalesce(old->'authorization'->'portions','[]'))x
 union select x->'portion'->>'paymentId' from jsonb_array_elements(coalesce(old->'attempts','[]'))x
 )sources where value is not null order by value::uuid loop
  perform pg_advisory_xact_lock(hashtextextended('payment-root:'||pid,0));
  if not exists(select 1 from crm_private.b05_customer_payments where payment_id=pid and admin_scope=s) then raise exception 'REFUND_DENIED';end if;
 end loop;
 perform pg_advisory_xact_lock(hashtextextended(bid::text,52));
 hash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
 if not crm_private.payment_evidence((a->>'evidenceId')::uuid,id,s,'refund:'||action||':'||hash,at_time,true) then raise exception 'REFUND_EVIDENCE_REQUIRED';end if;
 -- Fact identity dedup precedes stale state checks, but never authorization/admission.
 if action='record' or action='resolve' and a->>'resolution'='occurred' then
  m:=a->'movement';
  if jsonb_typeof(m) is distinct from 'object' or m-array['identity','amount','recipientId','occurredAt','method','reference','portions']<>'{}'::jsonb or not(m?&array['identity','amount','recipientId','occurredAt','method','reference','portions'])
  or jsonb_typeof(m->'identity') is distinct from 'object' or (m->'identity')-array['source','account','externalId']<>'{}'::jsonb or not(m->'identity'?&array['source','account','externalId'])
  or exists(select 1 from unnest(array['source','account','externalId'])k where crm_private.invoice_text(m->'identity'->k) is distinct from true)
  or crm_private.payment_amount(m->'amount',true) is distinct from true or exists(select 1 from unnest(array['recipientId','occurredAt','method','reference'])k where crm_private.invoice_text(m->k) is distinct from true)
  or m->>'occurredAt'!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}T.*(Z|[+-][0-9]{2}:[0-9]{2})$' or (m->>'occurredAt')::timestamptz>at_time then raise exception 'REFUND_MOVEMENT_REQUIRED';end if;
  perform pg_advisory_xact_lock(hashtextextended('refund-fact:'||s||':'||(m->'identity')::text||':'||(m->>'method'),0));
  select * into stored from crm_private.b05_refund_movements where admin_scope=s and identity_source=m->'identity'->>'source' and identity_account=m->'identity'->>'account' and identity_method=m->>'method' and external_id=m->'identity'->>'externalId';
  if found then
   if stored.refund_id<>id or jsonb_set(stored.material,'{portions}',(select jsonb_agg(x-array['paymentRevision','fundRevision'])from jsonb_array_elements(stored.material->'portions')x)) is distinct from jsonb_set(m,'{portions}',(select jsonb_agg(x-array['paymentRevision','fundRevision'])from jsonb_array_elements(m->'portions')x)) then raise exception 'REFUND_MOVEMENT_CONFLICT:E2';end if;
   receipt:=jsonb_build_object('id',id,'replayed',true,'result',old);insert into crm_private.b05_refund_operations values(op,id,s,actor,fp,receipt,rev,clock_timestamp());return receipt;
  end if;
 end if;
 if rev<>(a->>'expectedRevision')::bigint then raise exception 'REFUND_REVISION_CONFLICT:E2';end if;
 if root.refund_id is null then
  insert into crm_private.b05_refunds values(id,bid,s,op);
  state:=jsonb_build_object('id',id,'bookingId',bid,'revision',0,'request',null,'determination',null,'authorization',null,'movements','[]'::jsonb,'attempts','[]'::jsonb,'corrections','[]'::jsonb,'incidents','[]'::jsonb,'right',null,'authorized','0.00','executed','0.00','pendingRight',null,'pendingAuthorized','0.00','status','Pendiente');
 else state:=old;end if;
 if action='request' then
  if rev<>0 or crm_private.invoice_text(a->'requesterId') is distinct from true or crm_private.invoice_text(a->'cause') is distinct from true or crm_private.invoice_text(a->'affectedScope') is distinct from true or jsonb_typeof(a->'paymentIds') is distinct from 'array' or jsonb_array_length(a->'paymentIds')=0 then raise exception 'REFUND_REQUEST_REQUIRED';end if;
  if not exists(select 1 from crm_private.b04_bookings b join crm_private.b03_acceptances ac on ac.acceptance_id=b.acceptance_id where b.booking_id=bid and ac.accepter_id=(a->>'requesterId')::uuid and ac.admin_scope=s) then raise exception 'REFUND_REQUESTER_REQUIRED';end if;
  for pid in select (value#>>'{}')::uuid from jsonb_array_elements(a->'paymentIds')loop
   if not exists(select 1 from crm_private.b05_payment_revisions pr cross join lateral jsonb_array_elements(pr.snapshot->'correspondences')rc where pr.payment_id=pid and pr.admin_scope=s and rc->>'bookingId'=bid::text)then raise exception 'REFUND_DENIED';end if;
  end loop;
  state:=jsonb_set(state,'{request}',jsonb_build_object('status','Solicitada','requesterId',a->'requesterId','payments',a->'paymentIds','cause',a->'cause','affectedScope',a->'affectedScope'));
 elsif action='determine' then
  d:=crm_private.refund_right((a->>'determinationId')::uuid,bid,s,(a->>'determinationRevision')::bigint);
  if exists(select 1 from crm_private.refund_latest(s) r where r->>'id'<>id::text and r->'determination'->>'id'=d->>'id') then raise exception 'REFUND_RIGHT_ALREADY_LINKED:E2';end if;
  if state->'determination'<>'null'::jsonb and state->'determination'->>'id'<>d->>'id' then raise exception 'REFUND_RIGHT_CHANGED:E2';end if;
  state:=state||jsonb_build_object('determination',jsonb_build_object('id',d->'id','revision',d->'revision','scopeToken',d->'scopeToken','scope',d->'scope','cause',d->'facts'->'cause','computed',d->'computed'),'right',d->'computed'->'right');
  if state->'authorization'<>'null'::jsonb then state:=jsonb_set(state,'{authorization,invalidated}','true'::jsonb);end if;
 elsif action='authorize' then
  if reservation is null or session_user<>'crm_h0_ha_tx' then raise exception 'REFUND_TTE_REQUIRED';end if;
  d:=crm_private.refund_right((state->'determination'->>'id')::uuid,bid,s,(state->'determination'->>'revision')::bigint);
  au:=a->'authorization';
  if jsonb_typeof(au) is distinct from 'object' or au-array['amount','recipientId','method','cause','effect','conditions','portions','methodException']<>'{}'::jsonb or not(au?&array['amount','recipientId','method','cause','effect','conditions','portions']) or crm_private.payment_amount(au->'amount',true) is distinct from true or exists(select 1 from unnest(array['recipientId','method','cause','effect','conditions'])k where crm_private.invoice_text(au->k) is distinct from true) then raise exception 'REFUND_AUTHORIZATION_REQUIRED';end if;
  paid:=(state->>'executed')::numeric;if (au->>'amount')::numeric>(d->'computed'->>'right')::numeric or (au->>'amount')::numeric<paid or not crm_private.refund_portions(au->'portions',bid,s,true) or (select sum((av->>'amount')::numeric)from jsonb_array_elements(au->'portions')av)<>(au->>'amount')::numeric-paid then raise exception 'REFUND_AUTHORIZATION_REQUIRED';end if;
  if au->>'cause' is distinct from d->'facts'->>'cause' or au->>'effect'<>'refund-contractual-right' then raise exception 'REFUND_AUTHORIZATION_REQUIRED';end if;
  if not exists(select 1 from crm_private.b04_bookings b join crm_private.b03_acceptances ac on ac.acceptance_id=b.acceptance_id where b.booking_id=bid and ac.accepter_id=(au->>'recipientId')::uuid and ac.admin_scope=s)then raise exception 'REFUND_RECIPIENT_REQUIRED';end if;
  for v in select value from jsonb_array_elements(au->'portions')loop
   select snapshot into p from crm_private.b05_payment_revisions where payment_id=(v->>'paymentId')::uuid and admin_scope=s order by revision desc limit 1;
   if au->>'method' is distinct from p->'detection'->>'method' and crm_private.invoice_text(au->'methodException') is distinct from true then raise exception 'REFUND_METHOD_EXCEPTION_REQUIRED';end if;
  end loop;
  state:=state||jsonb_build_object('authorization',au||jsonb_build_object('reservation',reservation,'operationId',op,'at',a->'at','invalidated',false,'determination',state->'determination'),'authorized',au->'amount');
 elsif action in ('record','resolve') then
  if action='resolve' then
   select value into attempt from jsonb_array_elements(state->'attempts') where value->>'id'=a->>'attemptId' and value->>'resolved'='false';
   if attempt is null or a->>'resolution' not in ('not_occurred','occurred') then raise exception 'REFUND_NEW_RESULT_REQUIRED';end if;
   if exists(select 1 from crm_private.b05_refund_revisions where refund_id=id and evidence_id=(a->>'evidenceId')::uuid)then raise exception 'REFUND_NEW_RESULT_REQUIRED';end if;
   if a->>'resolution'='occurred' and (jsonb_array_length(m->'portions')<>1 or (m->>'amount')::numeric<>(attempt->'portion'->>'amount')::numeric or ((m->'portions'->0)-array['paymentRevision','fundRevision']) is distinct from ((attempt->'portion')-array['paymentRevision','fundRevision'])) then raise exception 'REFUND_UNCERTAIN_PORTION_MISMATCH';end if;
   state:=jsonb_set(state,'{attempts}',(select jsonb_agg(case when x->>'id'=a->>'attemptId' then x||jsonb_build_object('resolved',true,'result',a->>'resolution','evidenceId',a->'evidenceId')else x end)from jsonb_array_elements(state->'attempts')x));
  end if;
  if action='record' or a->>'resolution'='occurred' then
   amount:=(m->>'amount')::numeric;
   if not crm_private.refund_portions(m->'portions',bid,s,true,(a->>'attemptId')::uuid) or (select sum((mv->>'amount')::numeric) from jsonb_array_elements(m->'portions')mv)<>amount then raise exception 'REFUND_PORTIONS_REQUIRED';end if;
   au:=state->'authorization';authorized:=au<>'null'::jsonb and au->>'invalidated'='false' and (au->>'at')::timestamptz<=(m->>'occurredAt')::timestamptz and au->>'recipientId'=m->>'recipientId' and au->>'method'=m->>'method' and (state->>'executed')::numeric+amount<=(state->>'authorized')::numeric;
   if authorized then
    begin d:=crm_private.refund_right((au->'determination'->>'id')::uuid,bid,s,(au->'determination'->>'revision')::bigint);exception when raise_exception then if a->>'incidentId' is null then raise;end if;authorized:=false;end;
    for v in select value from jsonb_array_elements(m->'portions')loop
     if not exists(select 1 from jsonb_array_elements(au->'portions')x where x->>'paymentId'=v->>'paymentId' and x->>'reconciliationId'=v->>'reconciliationId' and x->>'allocationId' is not distinct from v->>'allocationId' and (x->>'start')::numeric<=(v->>'start')::numeric and (x->>'start')::numeric+(x->>'amount')::numeric>=(v->>'start')::numeric+(v->>'amount')::numeric)then authorized:=false;end if;
    end loop;
   end if;
   if not authorized then
    incident:=(a->>'incidentId')::uuid;if incident is null or not exists(select 1 from crm_private.b07_incidents where incident_id=incident and booking_id=bid and admin_scope=s)then raise exception 'REFUND_UNAPPROVED_REAL_INCIDENT_REQUIRED';end if;
    state:=jsonb_set(state,'{incidents}',state->'incidents'||jsonb_build_array(jsonb_build_object('id',incident,'kind','unapproved_real','authorizationRetroactive',false,'resolved',false)));
   end if;
   mid:=gen_random_uuid();insert into crm_private.b05_refund_movements values(mid,id,s,m->'identity'->>'source',m->'identity'->>'account',m->>'method',m->'identity'->>'externalId',m,authorized,case when authorized then au->>'reservation' else null end,op);
   state:=jsonb_set(state,'{movements}',state->'movements'||jsonb_build_array(jsonb_build_object('id',mid,'material',m,'authorized',authorized,'authorizationRef',case when authorized then au->>'reservation' else null end,'externalExecutionByCRM',false)));
  end if;
 elsif action='uncertain' then
  attempt:=a->'attempt';incident:=(a->>'incidentId')::uuid;
  if jsonb_typeof(attempt) is distinct from 'object' or attempt-array['id','sourceRef','portion']<>'{}'::jsonb or not(attempt?&array['id','sourceRef','portion']) or crm_private.invoice_text(attempt->'sourceRef') is distinct from true or crm_private.invoice_text(attempt->'id') is distinct from true or not crm_private.refund_portions(jsonb_build_array(attempt->'portion'),bid,s,true) then raise exception 'REFUND_ATTEMPT_REQUIRED';end if;
  if incident is null or not exists(select 1 from crm_private.b07_incidents where incident_id=incident and booking_id=bid and admin_scope=s)then raise exception 'REFUND_INCIDENT_REQUIRED';end if;
  if state->'authorization'='null'::jsonb or state->'authorization'->>'invalidated'='true' then raise exception 'REFUND_APPROVAL_REQUIRED';end if;
  perform crm_private.refund_right((state->'determination'->>'id')::uuid,bid,s,(state->'determination'->>'revision')::bigint);
  if exists(select 1 from crm_private.refund_latest(s)r cross join lateral jsonb_array_elements(r->'attempts')x where x->>'id'=attempt->>'id')then raise exception 'REFUND_ATTEMPT_CONFLICT:E2';end if;
  if not exists(select 1 from jsonb_array_elements(state->'authorization'->'portions')x where x->>'paymentId'=attempt->'portion'->>'paymentId' and x->>'reconciliationId'=attempt->'portion'->>'reconciliationId' and (x->>'start')::numeric<=(attempt->'portion'->>'start')::numeric and (x->>'start')::numeric+(x->>'amount')::numeric>=(attempt->'portion'->>'start')::numeric+(attempt->'portion'->>'amount')::numeric) then raise exception 'REFUND_ATTEMPT_REQUIRED';end if;
  state:=jsonb_set(state,'{attempts}',state->'attempts'||jsonb_build_array(attempt||jsonb_build_object('incidentId',incident,'resolved',false,'result','uncertain','evidenceId',a->'evidenceId')));
 elsif action='withdraw' then
  if state->'request'='null'::jsonb then raise exception 'REFUND_REQUEST_REQUIRED';end if;state:=jsonb_set(state,'{request,status}',to_jsonb('Retirada'::text));
 elsif action='not_due' then
  d:=crm_private.refund_right((state->'determination'->>'id')::uuid,bid,s,(state->'determination'->>'revision')::bigint);
  if (d->'computed'->>'right')::numeric<>0 or (state->>'executed')::numeric<>0 then raise exception 'REFUND_DUE_CANNOT_BE_HIDDEN';end if;state:=state||jsonb_build_object('notDue',jsonb_build_object('reason',a->'reason','evidenceId',a->'evidenceId','determination',state->'determination'));
 elsif action='revoke' then
  if state->'authorization'='null'::jsonb then raise exception 'REFUND_APPROVAL_REQUIRED';end if;state:=jsonb_set(state,'{authorization,invalidated}','true'::jsonb);
 elsif action='correct' then
  select * into stored from crm_private.b05_refund_movements where movement_id=(a->>'originalMovementId')::uuid and refund_id=id and admin_scope=s;
  if not found or exists(select 1 from jsonb_array_elements(state->'corrections')x where x->>'originalMovementId'=a->>'originalMovementId')then raise exception 'REFUND_ORIGINAL_REQUIRED';end if;
  incident:=(a->>'incidentId')::uuid;if incident is null or not exists(select 1 from crm_private.b07_incidents where incident_id=incident and booking_id=bid and admin_scope=s)then raise exception 'REFUND_INCIDENT_REQUIRED';end if;
  state:=jsonb_set(state,'{corrections}',state->'corrections'||jsonb_build_array(jsonb_build_object('originalMovementId',stored.movement_id,'signedOriginal',trunc(-(stored.material->>'amount')::numeric,2)::text,'signedAdjustment',stored.material->>'amount','reason',a->'reason','evidenceId',a->'evidenceId','incidentId',incident,'externalReversalInferred',false,'fundsReleased',false)));
 end if;
 select coalesce(sum((x->'material'->>'amount')::numeric),0)into paid from jsonb_array_elements(state->'movements')x;
 right_amount:=(state->>'right')::numeric;auth_amount:=(state->>'authorized')::numeric;
 state:=state||jsonb_build_object('revision',rev+1,'executed',trunc(paid,2)::text,'pendingRight',case when right_amount is null then null else trunc(greatest(0,right_amount-paid),2)::text end,'excess',case when right_amount is null then null else trunc(greatest(0,paid-right_amount),2)::text end,'pendingAuthorized',trunc(greatest(0,auth_amount-paid),2)::text,
 'uncertain',(select trunc(coalesce(sum((x->'portion'->>'amount')::numeric),0),2)::text from jsonb_array_elements(state->'attempts')x where x->>'resolved'='false'),
 'status',case when exists(select 1 from jsonb_array_elements(state->'attempts')x where x->>'resolved'='false') or exists(select 1 from jsonb_array_elements(state->'incidents')x where x->>'resolved'='false') then 'Incidencia' when paid>0 and auth_amount>0 and paid>=auth_amount then 'Ejecutada' when paid>0 then 'Parcial' when state?'notDue' then 'No procede' when state->'authorization'<>'null'::jsonb and state->'authorization'->>'invalidated'='false' then 'Autorizada' when state->'determination'<>'null'::jsonb then 'Determinada' when state->'request'->>'status'='Solicitada' then 'Solicitada' else 'Pendiente' end);
 insert into crm_private.b05_refund_revisions values(id,rev+1,s,op,action,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());
 receipt:=jsonb_build_object('id',id,'replayed',false,'result',state);insert into crm_private.b05_refund_operations values(op,id,s,actor,fp,receipt,rev+1,clock_timestamp());
 for pid in select distinct (x->>'paymentId')::uuid from (
 select value x from jsonb_array_elements(coalesce(a->'movement'->'portions','[]'))
 union all select a->'attempt'->'portion' where a?'attempt'
 union all select value->'portion' from jsonb_array_elements(state->'attempts')where value->>'id'=a->>'attemptId'
 )parts where x is not null order by (x->>'paymentId')::uuid loop perform crm_private.fund_refresh(pid,s,actor,'refund',id,rev+1);end loop;
 return receipt;
end$$;
create function crm_api.refund_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];r jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'REFUND_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-REFUND1' then raise exception 'REFUND_INPUT_INVALID';end if;
 r:=crm_private.refund_core(fs[2]::jsonb,hf[17],hf[12]::uuid);perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.refund_sensitive_authorize(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,a jsonb)returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];part text[];res crm_ha.reservations;r jsonb;
begin
 if session_user<>'crm_h0_ha_tx' then raise exception 'REFUND_TTE_REQUIRED';end if;
 hf:=crm_f2.verify(f2p,f2s,q,'C03','human_core_probe','apply_probe_batch');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','human_approval','manage_effect');fs:=crm_f1.fields(q);
 if hf[17] collate "C" is distinct from tf[14] collate "C" or fs[1]<>'CRM-H0-M04' or fs[2]<>'reserve' or a->>'action'<>'authorize' then raise exception 'REFUND_TTE_REQUIRED';end if;
 select * into strict res from crm_ha.reservations where reservation_id=fs[3];select crm_f1.fields(material_payload)into part from crm_ha.parts where proposal_id=res.proposal_id and part_id=res.part_id;
 if part[3]<>'refund-authorize' or part[5]::jsonb is distinct from a or part[6]<>'value' or part[7] is distinct from a->'authorization'->>'recipientId' or part[8]<>'value' or part[9] is distinct from a->'authorization'->>'amount' or part[10]<>'value' or part[11] is distinct from a->'authorization'->>'conditions' or part[12]<>hf[17] or part[13]<>'authorize-refund-fact' then raise exception 'REFUND_APPROVAL_MATERIAL_CHANGED';end if;
 r:=crm_private.refund_core(a,hf[17],hf[12]::uuid,res.reservation_id);perform crm_f2.verify(f2p,f2s,q,'C03','human_core_probe','apply_probe_batch');return r;
end$$;
create function crm_api.refund_finalize(command_id text)returns void language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare p jsonb;s text;
begin
 if session_user<>'crm_h0_ha_tx' then raise exception 'REFUND_TTE_REQUIRED';end if;
 select after_data,admin_scope into p,s from crm_private.b05_refund_revisions where action='authorize' and after_data->'authorization'->>'reservation'=command_id;
 if p is null then raise exception 'REFUND_FINAL_CHECK_REQUIRED';end if;
 if not exists(select 1 from crm_private.b05_refund_operations where operation_id=(p->'authorization'->>'operationId')::uuid and xmin::text=pg_current_xact_id()::text)then return;end if;
 perform crm_private.refund_right((p->'determination'->>'id')::uuid,(p->>'bookingId')::uuid,s,(p->'determination'->>'revision')::bigint);
 if not crm_private.refund_portions(p->'authorization'->'portions',(p->>'bookingId')::uuid,s,true)then raise exception 'REFUND_FINAL_CHECK_FAILED';end if;
end$$;
create function crm_api.refund_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)returns jsonb language plpgsql stable security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;r jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'REFUND_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-REFUND-READ1' then raise exception 'REFUND_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if a-array['bookingId','refundId','purpose']<>'{}'::jsonb or not(a?&array['bookingId','refundId','purpose'])or a->>'purpose' not in ('history','summary')then raise exception 'REFUND_INPUT_INVALID';end if;
 select v.after_data into r from crm_private.b05_refund_revisions v join crm_private.b05_refunds root using(refund_id)where root.refund_id=(a->>'refundId')::uuid and root.booking_id=(a->>'bookingId')::uuid and root.admin_scope=hf[17] and v.admin_scope=hf[17] order by revision desc limit 1;
 if r is not null then
  if a->>'purpose'='summary' then r:=jsonb_build_object('id',r->'id','revision',r->'revision','right',r->'right','authorized',r->'authorized','executed',r->'executed','pendingRight',r->'pendingRight','pendingAuthorized',r->'pendingAuthorized','uncertain',r->'uncertain','status',r->'status');
  else r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action,'event',event,'before',before_data,'after',after_data,'actorId',actor_id,'evidenceId',evidence_id,'sourceRef',source_ref,'reason',reason,'at',occurred_at,'recordedAt',recorded_at)order by revision)from crm_private.b05_refund_revisions where refund_id=(a->>'refundId')::uuid and admin_scope=hf[17]));end if;
 end if;perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
-- Forward integration of existing consumers. Guarded exact anchors preserve signatures/OID/ACL/config.
do $$declare body text;anchor text;replacement text;begin
 body:=pg_get_functiondef('crm_private.fund_assign(jsonb,jsonb,text,uuid,uuid,text,uuid)'::regprocedure);
 anchor:=$old$  if exists(select 1 from jsonb_array_elements(crm_private.fund_allocations(pid,s)) x$old$;
 replacement:=$new$  if crm_private.refund_blocks(pid,s) && numrange(start_at,start_at+amt,'[)') then raise exception 'ALLOCATION_REFUND_PORTION_USED';end if;
  if exists(select 1 from jsonb_array_elements(crm_private.fund_allocations(pid,s)) x$new$;
 if strpos(body,anchor)=0 then raise exception 'REFUND_ASSIGN_INTEGRATION_ANCHOR';end if;execute replace(body,anchor,replacement);
 body:=pg_get_functiondef('crm_private.fund_usable(jsonb,jsonb)'::regprocedure);
 anchor:=$old$ return hi-lo-lost;$old$;
 replacement:=$new$ select lost+coalesce(sum(upper(r)-lower(r)),0)into lost from unnest((nummultirange(part)-doubts)*crm_private.refund_blocks((a->>'paymentId')::uuid,(select admin_scope from crm_private.b05_customer_payments where payment_id=(a->>'paymentId')::uuid))) r;
 return hi-lo-lost;$new$;
 if strpos(body,anchor)=0 then raise exception 'REFUND_USABLE_INTEGRATION_ANCHOR';end if;execute replace(body,anchor,replacement);
 body:=pg_get_functiondef('crm_private.fund_summary(uuid,text)'::regprocedure);
 anchor:=$old$ 'representedReturned','0.00','externalReturned',null,$old$;
 replacement:=$new$ 'representedReturned',trunc(crm_private.refund_sum(pid,s),2)::text,'externalReturned',trunc(crm_private.refund_sum(pid,s),2)::text,'netAfterReturned',case when total is null then null else trunc(total-crm_private.refund_sum(pid,s),2)::text end,'refundReserved',(select trunc(coalesce(sum((fx->'portion'->>'amount')::numeric),0),2)::text from crm_private.refund_latest(s) rr cross join lateral jsonb_array_elements(rr->'attempts')fx where fx->>'resolved'='false' and fx->'portion'->>'paymentId'=pid::text),$new$;
 if strpos(body,anchor)=0 then raise exception 'REFUND_SUMMARY_INTEGRATION_ANCHOR';end if;body:=replace(body,anchor,replacement);
 body:=replace(body,$old$trunc((ps->>'verifiedCorrespondence')::numeric-usable,2)::text$old$,$new$trunc((ps->>'verifiedCorrespondence')::numeric-usable-(select coalesce(sum(upper(r)-lower(r)),0)from unnest(crm_private.refund_blocks(pid,s))r),2)::text$new$);
 execute body;
end$$;
do $$declare f record;begin for f in select p.oid::regprocedure sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='crm_private'and p.proname in ('refund_latest','refund_blocks','refund_sum','refund_right','refund_portions','refund_core')loop execute 'alter function '||f.sig||' owner to crm_h0_f2_owner';execute 'revoke all on function '||f.sig||' from public,crm_h0_runtime,crm_h0_ha_tx';execute 'grant execute on function '||f.sig||' to crm_h0_f2_executor';end loop;end$$;
do $$declare f text;begin foreach f in array array['refund_apply','refund_read']loop execute 'alter function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor';execute 'revoke all on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) from public';execute 'grant execute on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime';end loop;end$$;
alter function crm_api.refund_sensitive_authorize(bytea,bytea,bytea,bytea,bytea,jsonb)owner to crm_h0_f2_executor;revoke all on function crm_api.refund_sensitive_authorize(bytea,bytea,bytea,bytea,bytea,jsonb)from public,crm_h0_runtime;grant execute on function crm_api.refund_sensitive_authorize(bytea,bytea,bytea,bytea,bytea,jsonb)to crm_h0_ha_tx;
alter function crm_api.refund_finalize(text)owner to crm_h0_f2_executor;revoke all on function crm_api.refund_finalize(text)from public,crm_h0_runtime;grant execute on function crm_api.refund_finalize(text)to crm_h0_ha_tx;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
-- Preserve immutable Customer Payment facts; expose actual returned amounts alongside gross.
do $$declare d text;needle text;replacement text;begin
 d:=pg_get_functiondef('crm_api.payment_read(bytea,bytea,bytea,bytea,bytea)'::regprocedure);
 needle:=$old$'summary',crm_private.payment_summary(p),$old$;
 replacement:=$new$'summary',crm_private.payment_summary(p)||jsonb_build_object('representedReturned',trunc(crm_private.refund_sum(pid,s),2)::text,'externalReturned',trunc(crm_private.refund_sum(pid,s),2)::text),$new$;
 if position(needle in d)=0 then raise exception 'REFUND_PAYMENT_READ_ANCHOR';end if;execute replace(d,needle,replacement);
end$$;
commit;
