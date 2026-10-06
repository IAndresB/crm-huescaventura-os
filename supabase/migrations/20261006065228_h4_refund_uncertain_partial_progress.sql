-- F23: preserve original attempt portion; only independently verified fragments leave uncertainty.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'REFUND_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
create function crm_private.refund_attempt_remaining(a jsonb) returns setof jsonb language sql immutable set search_path=pg_catalog,pg_temp as $$
 select value from jsonb_array_elements(case when a->>'resolved'='false' then coalesce(a->'remainingPortions',jsonb_build_array(a->'portion'))else '[]'::jsonb end)
$$;
alter function crm_private.refund_attempt_remaining(jsonb) owner to crm_h0_f2_owner;
revoke all on function crm_private.refund_attempt_remaining(jsonb) from public,crm_h0_runtime,crm_h0_ha_tx;
grant execute on function crm_private.refund_attempt_remaining(jsonb) to crm_h0_f2_executor,crm_h0_migration;
create or replace function crm_private.refund_blocks(pid uuid,s text,exclude_attempt uuid default null) returns nummultirange language sql stable set search_path=pg_catalog,pg_temp as $$
 select coalesce(range_agg(numrange((x->>'start')::numeric,(x->>'start')::numeric+(x->>'amount')::numeric,'[)')),'{}'::nummultirange) from (
 select v x from crm_private.b05_refund_movements m cross join lateral jsonb_array_elements(m.material->'portions') v where m.admin_scope=s and v->>'paymentId'=pid::text
 union all select rp from crm_private.refund_latest(s) r cross join lateral jsonb_array_elements(r->'attempts') a cross join lateral crm_private.refund_attempt_remaining(a)rp where rp->>'paymentId'=pid::text and (exclude_attempt is null or a->>'id'<>exclude_attempt::text)
 ) parts
$$;
create or replace function crm_private.refund_core(a jsonb,s text,actor uuid,reservation text default null) returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare id uuid;bid uuid;op uuid;root crm_private.b05_refunds;prev crm_private.b05_refund_operations;old jsonb;state jsonb;rev bigint;fp text;hash text;at_time timestamptz;action text;d jsonb;v jsonb;p jsonb;m jsonb;au jsonb;pid uuid;attempt jsonb;stored crm_private.b05_refund_movements;mid uuid;authorized boolean;paid numeric;right_amount numeric;amount numeric;auth_amount numeric;receipt jsonb;blocks nummultirange;incident uuid;remaining jsonb;attempt_authority jsonb;unresolved nummultirange;credited numrange;
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
 if action='record' and a?'attemptId' then raise exception 'REFUND_LINKED_RESOLUTION_REQUIRED';end if;
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
   if stored.refund_id<>id or jsonb_set(stored.material-'sourceAttemptId','{portions}',(select jsonb_agg(x-array['paymentRevision','fundRevision'])from jsonb_array_elements(stored.material->'portions')x)) is distinct from jsonb_set(m,'{portions}',(select jsonb_agg(x-array['paymentRevision','fundRevision'])from jsonb_array_elements(m->'portions')x)) then raise exception 'REFUND_MOVEMENT_CONFLICT:E2';end if;
   if action='resolve' and a->>'attemptId' is distinct from coalesce(stored.material->>'sourceAttemptId',(select rr.event->>'attemptId' from crm_private.b05_refund_revisions rr where rr.operation_id=stored.operation_id and rr.action='resolve')) then raise exception 'REFUND_MOVEMENT_CONFLICT:E2';end if;
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
   remaining:='[]'::jsonb;
   if a->>'resolution'='occurred' then
    -- Historical authority belongs to the attempt, not to a later approval. Legacy attempts
    -- recover it from their immutable registration revision, without rewriting that history.
    attempt_authority:=attempt->'authority';
    if attempt_authority is null then select rr.before_data->'authorization' into attempt_authority from crm_private.b05_refund_revisions rr where rr.refund_id=id and rr.action='uncertain' and rr.event->'attempt'->>'id'=a->>'attemptId';end if;
    if attempt_authority is null or attempt_authority->>'recipientId' is distinct from m->>'recipientId' or attempt_authority->>'method' is distinct from m->>'method' or (attempt_authority->>'at')::timestamptz>(m->>'occurredAt')::timestamptz
     or jsonb_array_length(m->'portions')<>1 or (m->>'amount')::numeric is distinct from (m->'portions'->0->>'amount')::numeric
     or ((m->'portions'->0)-array['paymentRevision','fundRevision','start','amount']) is distinct from ((attempt->'portion')-array['paymentRevision','fundRevision','start','amount'])
    then raise exception 'REFUND_UNCERTAIN_PORTION_MISMATCH';end if;
    select coalesce(range_agg(numrange((x->>'start')::numeric,(x->>'start')::numeric+(x->>'amount')::numeric,'[)')),'{}'::nummultirange) into unresolved from crm_private.refund_attempt_remaining(attempt)x;
    credited:=numrange((m->'portions'->0->>'start')::numeric,(m->'portions'->0->>'start')::numeric+(m->>'amount')::numeric,'[)');
    if not(unresolved @> credited) then raise exception 'REFUND_UNCERTAIN_PORTION_MISMATCH';end if;
    select coalesce(jsonb_agg((attempt->'portion')||jsonb_build_object('start',trunc(lower(x),2)::text,'amount',trunc(upper(x)-lower(x),2)::text) order by lower(x)),'[]'::jsonb) into remaining from unnest(unresolved-nummultirange(credited))x;
   end if;
   state:=jsonb_set(state,'{attempts}',(select jsonb_agg(case when x->>'id'=a->>'attemptId' then x||jsonb_build_object('remainingPortions',remaining,'resolved',remaining='[]'::jsonb,'result',case when remaining='[]'::jsonb then a->>'resolution' else 'uncertain' end,'lastEvidenceId',a->'evidenceId','progress',coalesce(x->'progress','[]'::jsonb)||jsonb_build_array(jsonb_build_object('resolution',a->'resolution','evidenceId',a->'evidenceId','operationId',op,'movement',a->'movement')))else x end)from jsonb_array_elements(state->'attempts')x));
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
   if action='resolve' then m:=m||jsonb_build_object('sourceAttemptId',a->'attemptId');end if;
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
  state:=jsonb_set(state,'{attempts}',state->'attempts'||jsonb_build_array(attempt||jsonb_build_object('incidentId',incident,'resolved',false,'result','uncertain','evidenceId',a->'evidenceId','authority',state->'authorization')));
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
 'uncertain',(select trunc(coalesce(sum((rp->>'amount')::numeric),0),2)::text from jsonb_array_elements(state->'attempts')x cross join lateral crm_private.refund_attempt_remaining(x)rp),
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

-- Shared H3 funds projection uses exactly the remaining protected portions.
do $fix$declare body text;needle text;replacement text;begin
 body:=pg_get_functiondef('crm_private.fund_summary(uuid,text)'::regprocedure);
 needle:=$old$(select trunc(coalesce(sum((fx->'portion'->>'amount')::numeric),0),2)::text from crm_private.refund_latest(s) rr cross join lateral jsonb_array_elements(rr->'attempts')fx where fx->>'resolved'='false' and fx->'portion'->>'paymentId'=pid::text)$old$;
 replacement:=$new$(select trunc(coalesce(sum((rp->>'amount')::numeric),0),2)::text from crm_private.refund_latest(s) rr cross join lateral jsonb_array_elements(rr->'attempts')fx cross join lateral crm_private.refund_attempt_remaining(fx)rp where rp->>'paymentId'=pid::text)$new$;
 if position(needle in body)=0 then raise exception 'REFUND_F23_MIGRATION_ANCHOR';end if;
 execute replace(body,needle,replacement);
end$fix$;
revoke create on schema crm_private from crm_h0_f2_owner;
commit;
