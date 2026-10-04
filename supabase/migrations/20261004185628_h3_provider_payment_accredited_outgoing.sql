-- H3-011/012. Local record of an already occurred outgoing movement. No bank execution.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'PROVIDER_PAYMENT_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b05_provider_payments(
 provider_payment_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),
 service_id uuid not null references crm_private.b04_services(service_id),provider_id uuid not null,admin_scope text not null,
 suplido_id uuid references crm_private.b05_suplidos(suplido_id),basis jsonb not null,initial_operation_id uuid not null,
 unique(admin_scope,booking_id,service_id,provider_id)
);
create table crm_private.b05_provider_payment_operations(
 operation_id uuid primary key,provider_payment_id uuid not null references crm_private.b05_provider_payments(provider_payment_id),
 admin_scope text not null,actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,
 result jsonb not null,result_revision bigint not null,recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b05_provider_payment_revisions(
 provider_payment_id uuid not null references crm_private.b05_provider_payments(provider_payment_id),revision bigint not null check(revision>0),
 admin_scope text not null,operation_id uuid not null unique references crm_private.b05_provider_payment_operations(operation_id) deferrable initially deferred,
 action_kind text not null check(action_kind in ('open','confirm','schedule','record','incident','resolve','correct','withdraw')),
 event jsonb not null,before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 evidence_id uuid not null references crm_private.b07_records(record_id),source_ref text not null,reason text not null,occurred_at timestamptz not null,
 recorded_at timestamptz not null default clock_timestamp(),primary key(provider_payment_id,revision)
);
alter table crm_private.b05_provider_payments add foreign key(initial_operation_id) references crm_private.b05_provider_payment_operations(operation_id) deferrable initially deferred;
alter table crm_private.b05_provider_payment_operations add foreign key(provider_payment_id,result_revision) references crm_private.b05_provider_payment_revisions(provider_payment_id,revision) deferrable initially deferred;
create table crm_private.b05_provider_outgoing_movements(
 movement_id uuid primary key,provider_payment_id uuid not null references crm_private.b05_provider_payments(provider_payment_id),admin_scope text not null,
 identity_source text not null,external_id text not null,material jsonb not null,
 operation_id uuid not null references crm_private.b05_provider_payment_operations(operation_id) deferrable initially deferred,
 unique(identity_source,external_id)
);
create table crm_private.b05_provider_outgoing_correspondences(
 movement_id uuid primary key references crm_private.b05_provider_outgoing_movements(movement_id),admin_scope text not null,
 portions jsonb not null,consumption_act_ids jsonb not null,amount numeric not null check(amount>0),
 source_ref text not null,evidence_id uuid not null references crm_private.b07_records(record_id),actor_id uuid not null,
 occurred_at timestamptz not null
);
create table crm_private.b05_provider_payment_corrections(
 correction_id uuid primary key,original_movement_id uuid not null unique references crm_private.b05_provider_outgoing_movements(movement_id),
 admin_scope text not null,operation_id uuid not null references crm_private.b05_provider_payment_operations(operation_id) deferrable initially deferred,
 signed_original numeric not null check(signed_original<0),signed_adjustment numeric not null check(signed_adjustment=-signed_original),
 source_ref text not null,reason text not null,evidence_id uuid not null references crm_private.b07_records(record_id),actor_id uuid not null,occurred_at timestamptz not null
);
create index b05_provider_payment_scope on crm_private.b05_provider_payments(admin_scope,booking_id);
create index b05_provider_payment_suplido on crm_private.b05_provider_payments(suplido_id);
do $$declare t text;r text;begin foreach t in array array['b05_provider_payments','b05_provider_payment_operations','b05_provider_payment_revisions','b05_provider_outgoing_movements','b05_provider_outgoing_correspondences','b05_provider_payment_corrections'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy provider_payment_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy provider_payment_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime,crm_h0_ha_tx',t);
 execute format('create trigger provider_payment_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
-- Source-root locks are acquired by the caller in stable order, before any material read.
create function crm_private.provider_payment_funds(parts jsonb,root jsonb,s text,check_revision boolean) returns boolean language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare v jsonb;a jsonb;p jsonb;rev bigint;pr bigint;start_at numeric;amt numeric;
begin
 if jsonb_typeof(parts) is distinct from 'array' or jsonb_array_length(parts)=0 then return false;end if;
 for v in select value from jsonb_array_elements(parts) loop
  if jsonb_typeof(v)<>'object' or v-array['allocationId','paymentId','start','amount','fundRevision','paymentRevision']<>'{}'::jsonb
   or not(v?&array['allocationId','paymentId','start','amount','fundRevision','paymentRevision'])
   or not coalesce(crm_private.payment_amount(v->'start'),false) or not coalesce(crm_private.payment_amount(v->'amount',true),false)
   or v->>'fundRevision'!~'^[0-9]+$' or v->>'paymentRevision'!~'^[0-9]+$' then return false;end if;
  select snapshot into a from crm_private.b05_allocation_revisions where allocation_id=(v->>'allocationId')::uuid and admin_scope=s order by revision desc limit 1;
  if a is null or a->>'paymentId' is distinct from v->>'paymentId' or a->>'status'<>'verified' or a->'destination'->>'purpose'<>'managed_client_funds'
   or a->'destination'->>'bookingId' is distinct from root->>'bookingId' or a->'destination'->>'serviceId' is distinct from root->'basis'->>'serviceId' then return false;end if;
  select revision,snapshot into pr,p from crm_private.b05_payment_revisions where payment_id=(v->>'paymentId')::uuid and admin_scope=s order by revision desc limit 1;
  select max(revision) into rev from crm_private.b05_fund_revisions where payment_id=(v->>'paymentId')::uuid and admin_scope=s;
  if check_revision and (rev<>(v->>'fundRevision')::bigint or pr<>(v->>'paymentRevision')::bigint) then raise exception 'PROVIDER_PAYMENT_FUNDS_REVISION_CONFLICT:E2';end if;
  start_at:=(v->>'start')::numeric;amt:=(v->>'amount')::numeric;
  if start_at<(a->>'start')::numeric or start_at+amt>(a->>'start')::numeric+(a->>'amount')::numeric or crm_private.fund_usable(a||jsonb_build_object('start',v->>'start','amount',v->>'amount'),p)<>amt
   or exists(select 1 from crm_private.b05_allocation_acts z where z.allocation_id=(v->>'allocationId')::uuid and z.kind='consume' and z.start_amount<start_at+amt and z.start_amount-z.signed_amount>start_at and not exists(select 1 from crm_private.b05_allocation_acts r where r.original_act_id=z.act_id))
   or exists(select 1 from jsonb_array_elements(parts) other where other<>v and other->>'allocationId'=v->>'allocationId' and (other->>'start')::numeric<start_at+amt and (other->>'start')::numeric+(other->>'amount')::numeric>start_at)
   or (select count(*) from jsonb_array_elements(parts) other where other=v)>1 then return false;end if;
 end loop;return true;
end$$;
-- Outgoing correspondence is specific to the outgoing movement; incoming RC never substitutes it.
create function crm_private.provider_payment_documentary(state jsonb,s text) returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare p jsonb;comp jsonb;pending jsonb:='[]';due numeric;paid numeric;matched numeric:=0;v jsonb;mv jsonb;a jsonb;receipt jsonb;funds_ids jsonb:='[]';x jsonb;
begin
 select r.after_data into p from crm_private.b05_provider_payment_revisions r join crm_private.b05_provider_payments root using(provider_payment_id)
 where root.suplido_id=(state->>'id')::uuid and root.admin_scope=s and r.admin_scope=s order by r.revision desc limit 1;
 comp:=state->'components';due:=coalesce((comp->'amount'->>'confirmed')::numeric,(comp->'amount'->>'expected')::numeric);
 if p is not null then
  comp:=jsonb_set(comp,'{payment}',jsonb_build_object('providerPaymentId',p->>'id','revision',p->'revision','paid',p->>'paid','remaining',p->>'remaining','status',p->>'status','movements',p->'movements','source','H3-011/012'));
  for mv in select value from jsonb_array_elements(p->'movements') where (value->>'correspondenceVerified')::boolean and not exists(select 1 from jsonb_array_elements(p->'corrections') c where c->>'originalMovementId'=value->>'id') loop
   for v in select value from jsonb_array_elements(mv->'material'->'portions') loop
    select snapshot into a from crm_private.b05_allocation_revisions where allocation_id=(v->>'allocationId')::uuid and admin_scope=s order by revision desc limit 1;
    select snapshot into receipt from crm_private.b05_payment_revisions where payment_id=(v->>'paymentId')::uuid and admin_scope=s order by revision desc limit 1;
    matched:=matched+crm_private.fund_usable(a||jsonb_build_object('start',v->>'start','amount',v->>'amount'),receipt);
    if not(funds_ids @> jsonb_build_array(v->>'allocationId')) then funds_ids:=funds_ids||jsonb_build_array(v->>'allocationId');end if;
   end loop;
  end loop;
  comp:=jsonb_set(comp,'{outgoingReconciliation}',jsonb_build_object('direction','outgoing','providerPaymentId',p->>'id','amount',trunc(matched,2)::text,'verified',matched=due,'movements',p->'movements'));
 end if;
 if comp->'funds'<>'null'::jsonb then comp:=jsonb_set(comp,'{funds}',crm_private.suplido_funds(comp->'funds'->'allocationIds',(state->>'bookingId')::uuid,(state->'basis'->>'serviceId')::uuid,s));end if;
 if comp->'invoice'<>'null'::jsonb then comp:=jsonb_set(comp,'{invoice}',crm_private.suplido_invoice((comp->'invoice'->>'invoiceId')::uuid,(state->>'bookingId')::uuid,(state->'basis'->>'serviceId')::uuid,(state->'basis'->>'clientId')::uuid,(state->'basisApplied'->'provider'->>'item_id')::uuid,s));end if;
 paid:=coalesce((p->>'paid')::numeric,0);
 if p is null or paid is distinct from due then pending:=pending||'"payment"'::jsonb;end if;
 if matched is distinct from due or p->>'status'='Incidencia' then pending:=pending||'"outgoing_reconciliation"'::jsonb;end if;
 if comp->'invoice'='null'::jsonb or not coalesce((comp->'invoice'->>'linked')::boolean,false) or (comp->'invoice'->'portion'->>'amount')::numeric is distinct from due then pending:=pending||'"invoice"'::jsonb;end if;
 for x in select value from jsonb_array_elements(state->'differences') where not(value->>'resolved')::boolean loop pending:=pending||jsonb_build_array('difference:'||(x->>'component'));end loop;
 return state||jsonb_build_object('components',comp,'pending',pending,'status',case when pending='[]'::jsonb then 'Documentalmente resuelto' when p->>'status'='Incidencia' or exists(select 1 from jsonb_array_elements(state->'differences') z where not(z->>'resolved')::boolean) then 'Revisión' else 'Gestión abierta' end);
end$$;
create function crm_private.provider_payment_core(a jsonb,s text,actor uuid,reservation text default null) returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare id uuid;op uuid;bid uuid;sid uuid;root crm_private.b05_provider_payments;previous crm_private.b05_provider_payment_operations;old jsonb;state jsonb;applied_basis jsonb;provider jsonb;rev bigint;fp text;proofhash text;action text;at_time timestamptz;source_root text;v jsonb;m jsonb;stored crm_private.b05_provider_outgoing_movements;movement_id uuid;matched boolean;paid numeric;due numeric;acts jsonb:='[]';act uuid;fund_op uuid;allocation jsonb;fund_before jsonb;fund_result jsonb;fr bigint;incident jsonb;r jsonb;su jsonb;sr bigint;so uuid;refs jsonb;part text[];
begin
 if jsonb_typeof(a) is distinct from 'object' or a-array['action','operationId','providerPaymentId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','origin','suplidoId','basis','confirmedAmount','schedule','movement','incident','incidentId','previousEffectCheck','originalMovementId','noExecution','noPendingExecution','noUnknownResult']<>'{}'::jsonb
 or not(a?&array['action','operationId','providerPaymentId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId'])
 or exists(select 1 from unnest(array['action','operationId','providerPaymentId','bookingId','sourceRef','reason','at','evidenceId']) k where not coalesce(crm_private.invoice_text(a->k),false))
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision'!~'^[0-9]+$'
 or coalesce(a->>'origin','manual')<>'manual' or a->>'action' not in ('open','confirm','schedule','record','incident','resolve','correct','withdraw')
 or a->>'at'!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'PROVIDER_PAYMENT_INPUT_INVALID';end if;
 action:=a->>'action';id:=(a->>'providerPaymentId')::uuid;op:=(a->>'operationId')::uuid;bid:=(a->>'bookingId')::uuid;at_time:=(a->>'at')::timestamptz;
 if action='schedule' and reservation is null then raise exception 'PROVIDER_PAYMENT_TTE_REQUIRED';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('provider-payment-op:'||op,0));
 select * into previous from crm_private.b05_provider_payment_operations where operation_id=op;
 if found then if previous.admin_scope<>s or previous.actor_id<>actor or previous.fingerprint<>fp then raise exception 'PROVIDER_PAYMENT_REPLAY_CONFLICT:E2';end if;return previous.result||jsonb_build_object('replayed',true);end if;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s) then raise exception 'PROVIDER_PAYMENT_DENIED';end if;
 proofhash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
 if not crm_private.payment_evidence((a->>'evidenceId')::uuid,id,s,'provider-payment:'||action||':'||proofhash,at_time,true)
  or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'PROVIDER_PAYMENT_EVIDENCE_REQUIRED';end if;
 select * into root from crm_private.b05_provider_payments where provider_payment_id=id and admin_scope=s and booking_id=bid;
 sid:=coalesce(root.suplido_id,(a->>'suplidoId')::uuid);
 if sid is not null then perform pg_advisory_xact_lock(hashtextextended('suplido-root:'||sid,0));end if;
 perform pg_advisory_xact_lock(hashtextextended('provider-payment-root:'||id,0));
 if action='open' then
  applied_basis:=a->'basis';
  if jsonb_typeof(applied_basis) is distinct from 'object' or applied_basis-array['providerRevisionId','serviceId','expectedAmount','confirmedAmount','obligationRef','sourceRef','version']<>'{}'::jsonb
   or not(applied_basis?&array['providerRevisionId','serviceId','expectedAmount','confirmedAmount','obligationRef','sourceRef','version'])
   or exists(select 1 from unnest(array['providerRevisionId','serviceId','obligationRef','sourceRef','version']) k where not coalesce(crm_private.invoice_text(applied_basis->k),false))
   or (applied_basis->'expectedAmount'='null'::jsonb and applied_basis->'confirmedAmount'='null'::jsonb)
   or (applied_basis->'expectedAmount'<>'null'::jsonb and not coalesce(crm_private.payment_amount(applied_basis->'expectedAmount',true),false))
   or (applied_basis->'confirmedAmount'<>'null'::jsonb and not coalesce(crm_private.payment_amount(applied_basis->'confirmedAmount',true),false)) or (a->>'expectedRevision')::bigint<>0 then raise exception 'PROVIDER_PAYMENT_BASIS_REQUIRED';end if;
  if not exists(select 1 from crm_private.b04_services where service_id=(applied_basis->>'serviceId')::uuid and booking_id=bid and admin_scope=s and nature='external') then raise exception 'PROVIDER_PAYMENT_BASIS_REQUIRED';end if;
  select to_jsonb(cr) into provider from crm_private.catalog_revisions cr join crm_private.catalog_items ci using(item_id) where cr.revision_id=(applied_basis->>'providerRevisionId')::uuid and cr.admin_scope=s and ci.item_kind='provider';
  if provider is null then raise exception 'PROVIDER_PAYMENT_BASIS_REQUIRED';end if;
  if sid is not null and not exists(select 1 from crm_private.b05_suplidos su where su.suplido_id=sid and su.admin_scope=s and su.booking_id=bid and su.service_id=(applied_basis->>'serviceId')::uuid and su.basis->>'providerRevisionId'=applied_basis->>'providerRevisionId') then raise exception 'PROVIDER_PAYMENT_CONTEXT_REQUIRED';end if;
  perform pg_advisory_xact_lock(hashtextextended('provider-payment-service:'||bid||':'||(applied_basis->>'serviceId')||':'||(provider->>'item_id'),0));
  select * into root from crm_private.b05_provider_payments where admin_scope=s and booking_id=bid and service_id=(applied_basis->>'serviceId')::uuid and provider_id=(provider->>'item_id')::uuid;
  if found then
   if root.basis is distinct from applied_basis or root.suplido_id is distinct from sid then raise exception 'PROVIDER_PAYMENT_IDENTITY_CONFLICT:E2';end if;
   select revision,after_data into rev,state from crm_private.b05_provider_payment_revisions where provider_payment_id=root.provider_payment_id order by revision desc limit 1;
   r:=jsonb_build_object('id',root.provider_payment_id,'replayed',true,'result',state);insert into crm_private.b05_provider_payment_operations values(op,root.provider_payment_id,s,actor,fp,r,rev,clock_timestamp());return r;
  end if;
  insert into crm_private.b05_provider_payments values(id,bid,(applied_basis->>'serviceId')::uuid,(provider->>'item_id')::uuid,s,sid,applied_basis,op);
  state:=jsonb_build_object('id',id,'bookingId',bid,'suplidoId',sid,'revision',1,'basis',applied_basis,'providerApplied',provider,'status','Pendiente','schedule',null,'movements','[]'::jsonb,'incidents','[]'::jsonb,'corrections','[]'::jsonb,'paid','0.00','remaining',coalesce(applied_basis->>'confirmedAmount',applied_basis->>'expectedAmount'),'complete',false,'externalExecutionByCRM',false);rev:=0;
 else
  select * into root from crm_private.b05_provider_payments where provider_payment_id=id and booking_id=bid and admin_scope=s;if not found or (a?'suplidoId' and (a->>'suplidoId')::uuid is distinct from root.suplido_id) then raise exception 'PROVIDER_PAYMENT_DENIED';end if;
  select revision,after_data into rev,old from crm_private.b05_provider_payment_revisions where provider_payment_id=id order by revision desc limit 1;state:=old;applied_basis:=state->'basis';
  -- Move identity first, while root is held; duplicate equivalence precedes optimistic revisions.
  if action='record' then
   m:=a->'movement';
   if jsonb_typeof(m) is distinct from 'object' or m-array['identity','providerId','serviceId','amount','occurredAt','method','reference','sourceRef','correspondenceSourceRef','portions']<>'{}'::jsonb or not(m?&array['identity','providerId','serviceId','amount','occurredAt','method','reference','sourceRef','correspondenceSourceRef','portions'])
    or exists(select 1 from unnest(array['providerId','serviceId','occurredAt','method','reference','sourceRef','correspondenceSourceRef']) k where not coalesce(crm_private.invoice_text(m->k),false))
    or not coalesce(crm_private.payment_amount(m->'amount',true),false) or jsonb_typeof(m->'portions') is distinct from 'array'
    or (m->'identity')-array['source','externalId']<>'{}'::jsonb or not coalesce(crm_private.invoice_text(m->'identity'->'source'),false) or not coalesce(crm_private.invoice_text(m->'identity'->'externalId'),false)
    or m->>'providerId'<>root.provider_id::text or m->>'serviceId'<>root.service_id::text or m->>'occurredAt'!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' or (m->>'occurredAt')::timestamptz>at_time then raise exception 'PROVIDER_PAYMENT_MOVEMENT_REQUIRED';end if;
   perform pg_advisory_xact_lock(hashtextextended('provider-movement:'||(m->'identity'->>'source')||':'||(m->'identity'->>'externalId'),0));
   select * into stored from crm_private.b05_provider_outgoing_movements where identity_source=m->'identity'->>'source' and external_id=m->'identity'->>'externalId';
   if found then
    if stored.admin_scope<>s or stored.provider_payment_id<>id or stored.material is distinct from m then raise exception 'PROVIDER_PAYMENT_MOVEMENT_CONFLICT:E2';end if;
    r:=jsonb_build_object('id',id,'replayed',true,'result',state);insert into crm_private.b05_provider_payment_operations values(op,id,s,actor,fp,r,rev,clock_timestamp());return r;
   end if;
  end if;
  if rev<>(a->>'expectedRevision')::bigint then raise exception 'PROVIDER_PAYMENT_REVISION_CONFLICT:E2';end if;
  for source_root in select distinct k from (
   select 'payment-root:'||(value->>'paymentId') k from jsonb_array_elements(coalesce(m->'portions',a->'schedule'->'portions','[]'))
   union select 'payment-root:'||(value->>'paymentId') from jsonb_array_elements(coalesce(state->'schedule'->'portions','[]'))
   union select 'invoice-root:'||(after_data->'components'->'invoice'->>'invoiceId') from crm_private.b05_suplido_revisions where suplido_id=sid and after_data->'components'->'invoice'<>'null'::jsonb
  ) locks where k is not null order by k loop perform pg_advisory_xact_lock(hashtextextended(source_root,0));end loop;
  if action='confirm' then
   if not coalesce(crm_private.payment_amount(a->'confirmedAmount',true),false) then raise exception 'PROVIDER_PAYMENT_AMOUNT_REQUIRED';end if;applied_basis:=applied_basis||jsonb_build_object('confirmedAmount',a->'confirmedAmount','confirmationSource',a->>'sourceRef');state:=state||jsonb_build_object('basis',applied_basis);
  elsif action='schedule' then
   v:=a->'schedule';
   if jsonb_typeof(v) is distinct from 'object' or v-array['amount','recipientId','method','scheduledDate','conditions','fundsKind','portions']<>'{}'::jsonb or not(v?&array['amount','recipientId','method','scheduledDate','conditions','fundsKind','portions'])
    or not coalesce(crm_private.payment_amount(v->'amount',true),false) or v->>'recipientId'<>root.provider_id::text
    or exists(select 1 from unnest(array['recipientId','method','scheduledDate','conditions','fundsKind']) k where not coalesce(crm_private.invoice_text(v->k),false))
    or v->>'scheduledDate'!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or (v->>'scheduledDate')::date is null or v->>'fundsKind' not in ('planned','verified')
    or jsonb_typeof(v->'portions') is distinct from 'array' or state->>'status' not in ('Pendiente','Incidencia')
    or exists(select 1 from jsonb_array_elements(state->'incidents') z where not(z->>'resolved')::boolean and z->>'result'='uncertain')
    or (v->>'amount')::numeric>coalesce((applied_basis->>'confirmedAmount')::numeric,(applied_basis->>'expectedAmount')::numeric)-(state->>'paid')::numeric then raise exception 'PROVIDER_PAYMENT_SCHEDULE_REQUIRED';end if;
   if v->>'fundsKind'='verified' and (not crm_private.provider_payment_funds(v->'portions',state,s,true) or (select sum((value->>'amount')::numeric) from jsonb_array_elements(v->'portions'))<>(v->>'amount')::numeric) then raise exception 'PROVIDER_PAYMENT_FUNDS_REQUIRED';end if;
   if v->>'fundsKind'='planned' and v->'portions'<>'[]'::jsonb then raise exception 'PROVIDER_PAYMENT_FUNDS_REQUIRED';end if;
   state:=state||jsonb_build_object('schedule',v||jsonb_build_object('approvalReservation',reservation,'operationId',op,'at',a->>'at','withdrawn',false),'status','Programado');
  elsif action='record' then
   matched:=coalesce(crm_private.provider_payment_funds(m->'portions',state,s,true) and (select sum((value->>'amount')::numeric) from jsonb_array_elements(m->'portions'))=(m->>'amount')::numeric,false);
   movement_id:=gen_random_uuid();insert into crm_private.b05_provider_outgoing_movements values(movement_id,id,s,m->'identity'->>'source',m->'identity'->>'externalId',m,op);
   if matched then
    for v in select value from jsonb_array_elements(m->'portions') loop
     select snapshot into allocation from crm_private.b05_allocation_revisions where allocation_id=(v->>'allocationId')::uuid order by revision desc limit 1;
     fund_op:=gen_random_uuid();act:=gen_random_uuid();fund_before:=crm_private.fund_summary((v->>'paymentId')::uuid,s);
     insert into crm_private.b05_allocation_acts values(act,fund_op,(v->>'allocationId')::uuid,(v->>'paymentId')::uuid,s,'consume',(v->>'start')::numeric,-(v->>'amount')::numeric,null,allocation,allocation,actor,a->>'reason',m->>'sourceRef',(a->>'evidenceId')::uuid,(m->>'occurredAt')::timestamptz,clock_timestamp());acts:=acts||jsonb_build_array(act);
     fr:=crm_private.fund_refresh((v->>'paymentId')::uuid,s,actor,'provider_payment',id,rev+1);
     fund_result:=jsonb_build_object('id',v->>'paymentId','replayed',false,'result',jsonb_build_object('revision',fr,'providerMovementId',movement_id,'summary',crm_private.fund_summary((v->>'paymentId')::uuid,s)));
     insert into crm_private.b05_fund_operations values(fund_op,(v->>'paymentId')::uuid,s,actor,fp,jsonb_build_object('providerMovementId',movement_id,'portion',v),fund_result,clock_timestamp());
     insert into crm_private.b05_fund_history values(fund_op,(v->>'paymentId')::uuid,s,fund_before,fund_result,actor,a->>'reason',m->>'sourceRef',(a->>'evidenceId')::uuid,(m->>'occurredAt')::timestamptz,clock_timestamp());
    end loop;
    insert into crm_private.b05_provider_outgoing_correspondences values(movement_id,s,m->'portions',acts,(m->>'amount')::numeric,m->>'correspondenceSourceRef',(a->>'evidenceId')::uuid,actor,at_time);
   else state:=jsonb_set(state,'{incidents}',state->'incidents'||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'result','discrepancy','kind','funding_unresolved','movementId',movement_id,'amount',m->>'amount','resolved',false,'sourceRef',a->>'sourceRef','evidenceId',a->>'evidenceId')));end if;
   -- Approval is historical and must predate the actual effect; partials may share one schedule.
   reservation:=state->'schedule'->>'approvalReservation';
   if reservation is null or coalesce((state->'schedule'->>'withdrawn')::boolean,true) or not exists(select 1 from crm_ha.reservations where reservation_id=reservation and created_at<=(m->>'occurredAt')::timestamptz)
    or state->'schedule'->>'recipientId'<>m->>'providerId' or state->'schedule'->>'method'<>m->>'method' then
    reservation:=null;state:=jsonb_set(state,'{incidents}',state->'incidents'||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'result','discrepancy','kind','unapproved_real','movementId',movement_id,'resolved',false,'sourceRef',a->>'sourceRef','evidenceId',a->>'evidenceId')));
   end if;
   state:=jsonb_set(state,'{movements}',state->'movements'||jsonb_build_array(jsonb_build_object('id',movement_id,'material',m,'correspondenceVerified',matched,'consumptionActIds',acts,'approvalReservation',reservation,'actualEffectPrecedesRegistration',true)));
  elsif action='incident' then
   incident:=a->'incident';if jsonb_typeof(incident) is distinct from 'object' or incident-array['id','sourceRef','attemptRef','result','scope']<>'{}'::jsonb or not(incident?&array['id','sourceRef','attemptRef','result','scope'])
    or exists(select 1 from unnest(array['id','sourceRef','attemptRef','result','scope']) k where not coalesce(crm_private.invoice_text(incident->k),false)) or incident->>'result' not in ('uncertain','failed_verified','discrepancy')
    or exists(select 1 from jsonb_array_elements(state->'incidents') z where z->>'id'=incident->>'id') then raise exception 'PROVIDER_PAYMENT_INCIDENT_REQUIRED';end if;perform (incident->>'id')::uuid;
   state:=jsonb_set(state,'{incidents}',state->'incidents'||jsonb_build_array(incident||jsonb_build_object('resolved',false,'stateBefore',state->>'status','evidenceId',a->>'evidenceId','actorId',actor,'at',a->>'at')));
  elsif action='resolve' then
   if coalesce(a->>'previousEffectCheck','') not in ('not_occurred','occurred_verified') or not exists(select 1 from jsonb_array_elements(state->'incidents') z where z->>'id'=a->>'incidentId' and not(z->>'resolved')::boolean and z->>'kind' is distinct from 'funding_unresolved')
    or (a->>'previousEffectCheck'='occurred_verified' and state->'movements'='[]'::jsonb) or (a->>'previousEffectCheck'='not_occurred' and exists(select 1 from jsonb_array_elements(state->'incidents') z where z->>'id'=a->>'incidentId' and z?'movementId')) then raise exception 'PROVIDER_PAYMENT_EFFECT_CHECK_REQUIRED';end if;
   select jsonb_agg(case when z->>'id'=a->>'incidentId' then z||jsonb_build_object('resolved',true,'resolution',a,'resolutionActor',actor) else z end) into incident from jsonb_array_elements(state->'incidents') z;state:=jsonb_set(state,'{incidents}',incident);
  elsif action='correct' then
   if a->>'previousEffectCheck' is distinct from 'occurred_verified' then raise exception 'PROVIDER_PAYMENT_EFFECT_CHECK_REQUIRED';end if;
   select * into stored from crm_private.b05_provider_outgoing_movements where b05_provider_outgoing_movements.movement_id=(a->>'originalMovementId')::uuid and provider_payment_id=id and admin_scope=s;if not found then raise exception 'PROVIDER_PAYMENT_ORIGINAL_REQUIRED';end if;
   insert into crm_private.b05_provider_payment_corrections values(op,stored.movement_id,s,op,-(stored.material->>'amount')::numeric,(stored.material->>'amount')::numeric,a->>'sourceRef',a->>'reason',(a->>'evidenceId')::uuid,actor,at_time);
   state:=jsonb_set(state,'{corrections}',state->'corrections'||jsonb_build_array(jsonb_build_object('id',op,'originalMovementId',stored.movement_id,'signedOriginal',trunc(-(stored.material->>'amount')::numeric,2)::text,'signedAdjustment',stored.material->>'amount','reason',a->>'reason','sourceRef',a->>'sourceRef','evidenceId',a->>'evidenceId','bankReversalInferred',false,'fundsReleased',false)));
  elsif action='withdraw' then
   if state->>'status'<>'Programado' or state->'movements'<>'[]'::jsonb or a->'noExecution' is distinct from 'true'::jsonb or a->'noPendingExecution' is distinct from 'true'::jsonb or a->'noUnknownResult' is distinct from 'true'::jsonb or exists(select 1 from jsonb_array_elements(state->'incidents') z where not(z->>'resolved')::boolean) then raise exception 'PROVIDER_PAYMENT_NO_EXECUTION_REQUIRED';end if;
   state:=jsonb_set(state,'{schedule}',state->'schedule'||jsonb_build_object('withdrawn',true,'withdrawal',a));
  end if;
 end if;
 select coalesce(sum((entries.item->'material'->>'amount')::numeric),0) into paid from jsonb_array_elements(state->'movements') entries(item) where not exists(select 1 from jsonb_array_elements(state->'corrections') c where c->>'originalMovementId'=entries.item->>'id');
 due:=coalesce((state->'basis'->>'confirmedAmount')::numeric,(state->'basis'->>'expectedAmount')::numeric);
 state:=state||jsonb_build_object('revision',rev+1,'paid',trunc(paid,2)::text,'remaining',trunc(greatest(0,due-paid),2)::text,'excess',trunc(greatest(0,paid-due),2)::text,'complete',paid=due,
 'status',case when exists(select 1 from jsonb_array_elements(state->'incidents') z where not(z->>'resolved')::boolean) or state->'corrections'<>'[]'::jsonb then 'Incidencia' when paid>0 then 'Pagado' when state->'schedule'<>'null'::jsonb and not(state->'schedule'->>'withdrawn')::boolean then 'Programado' else 'Pendiente' end);
 insert into crm_private.b05_provider_payment_revisions values(id,rev+1,s,op,action,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());
 r:=jsonb_build_object('id',id,'replayed',false,'result',state);insert into crm_private.b05_provider_payment_operations values(op,id,s,actor,fp,r,rev+1,clock_timestamp());
 -- T07: material documentary reevaluation is part of this same unit, not a second runtime call.
 if sid is not null then
  select revision,after_data into sr,su from crm_private.b05_suplido_revisions where suplido_id=sid and admin_scope=s order by revision desc limit 1;
  so:=gen_random_uuid();su:=crm_private.provider_payment_documentary(su,s)||jsonb_build_object('revision',sr+1);
  refs:='[]';for v in select value from jsonb_array_elements(su->'pending') where value in ('"invoice"'::jsonb,'"payment"'::jsonb) loop refs:=refs||jsonb_build_array(crm_private.suplido_followup(su,v#>>'{}',s,actor,a->>'sourceRef'));end loop;
  su:=su||jsonb_build_object('followUpIds',refs,'evaluation',jsonb_build_object('operationId',so,'providerPaymentOperationId',op,'actorId',actor,'at',a->>'at','sourceRef',a->>'sourceRef','evidenceId',a->>'evidenceId','components',su->'components','pending',su->'pending','state',su->>'status','productivePaymentBoundary','LOCAL_H3_011_012','bookingClosureInferred',false,'fiscalValidation',false));
  insert into crm_private.b05_suplido_revisions values(sid,sr+1,s,so,'evaluate',jsonb_build_object('providerPaymentOperationId',op),(select after_data from crm_private.b05_suplido_revisions where suplido_id=sid and revision=sr),su,actor,(a->>'evidenceId')::uuid,a->>'reason',a->>'sourceRef',at_time,clock_timestamp());
  insert into crm_private.b05_suplido_operations values(so,sid,s,actor,fp,jsonb_build_object('id',sid,'replayed',false,'result',su),sr+1,clock_timestamp());
 end if;
 return r;
end$$;
create function crm_api.provider_payment_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];r jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'PROVIDER_PAYMENT_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-PROVIDER-PAYMENT1' then raise exception 'PROVIDER_PAYMENT_INPUT_INVALID';end if;
 r:=crm_private.provider_payment_core(fs[2]::jsonb,hf[17],hf[12]::uuid);
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.provider_payment_sensitive_schedule(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,a jsonb) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];part text[];res crm_ha.reservations;r jsonb;
begin
 if session_user<>'crm_h0_ha_tx' then raise exception 'PROVIDER_PAYMENT_TTE_REQUIRED';end if;
 hf:=crm_f2.verify(f2p,f2s,q,'C03','human_core_probe','apply_probe_batch');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','human_approval','manage_effect');fs:=crm_f1.fields(q);
 if hf[17] collate "C" is distinct from tf[14] collate "C" or fs[1]<>'CRM-H0-M04' or fs[2]<>'reserve' or a->>'action'<>'schedule' then raise exception 'PROVIDER_PAYMENT_TTE_REQUIRED';end if;
 select * into strict res from crm_ha.reservations where reservation_id=fs[3];
 select crm_f1.fields(material_payload) into part from crm_ha.parts where proposal_id=res.proposal_id and part_id=res.part_id;
 if part[3]<>'provider-payment-schedule' or part[5]::jsonb is distinct from a or part[6]<>'value' or part[7]<>a->'schedule'->>'recipientId' or part[8]<>'value' or part[9]<>a->'schedule'->>'amount'
  or part[10]<>'value' or part[11]<>a->'schedule'->>'conditions' or part[12]<>hf[17] or part[13]<>'record-payment-intention' then raise exception 'PROVIDER_PAYMENT_APPROVAL_MATERIAL_CHANGED';end if;
 r:=crm_private.provider_payment_core(a,hf[17],hf[12]::uuid,res.reservation_id);
 perform crm_f2.verify(f2p,f2s,q,'C03','human_core_probe','apply_probe_batch');return r;
end$$;
create function crm_api.provider_payment_finalize(command_id text) returns void language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare a jsonb;s text;p jsonb;
begin
 if session_user<>'crm_h0_ha_tx' then raise exception 'PROVIDER_PAYMENT_TTE_REQUIRED';end if;
 select v.after_data,v.admin_scope into p,s from crm_private.b05_provider_payment_revisions v where v.action_kind='schedule' and v.after_data->'schedule'->>'approvalReservation'=command_id;
 if p is null then raise exception 'PROVIDER_PAYMENT_FINAL_CHECK_REQUIRED';end if;
 if not exists(select 1 from crm_private.b05_provider_payment_operations where operation_id=(p->'schedule'->>'operationId')::uuid and xmin::text=pg_current_xact_id()::text) then return;end if;
 a:=p->'schedule';if a->>'fundsKind'='verified' and not crm_private.provider_payment_funds(a->'portions',p,s,true) then raise exception 'PROVIDER_PAYMENT_FINAL_CHECK_FAILED';end if;
end$$;
create function crm_api.provider_payment_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;r jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'PROVIDER_PAYMENT_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-PROVIDER-PAYMENT-READ1' then raise exception 'PROVIDER_PAYMENT_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if a-array['providerPaymentId','bookingId']<>'{}'::jsonb or not(a?&array['providerPaymentId','bookingId']) then raise exception 'PROVIDER_PAYMENT_INPUT_INVALID';end if;
 select v.after_data into r from crm_private.b05_provider_payment_revisions v join crm_private.b05_provider_payments root using(provider_payment_id) where root.provider_payment_id=(a->>'providerPaymentId')::uuid and root.booking_id=(a->>'bookingId')::uuid and root.admin_scope=hf[17] and v.admin_scope=hf[17] order by v.revision desc limit 1;
 if r is not null then r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action_kind,'event',event,'before',before_data,'after',after_data,'actorId',actor_id,'evidenceId',evidence_id,'sourceRef',source_ref,'reason',reason,'at',occurred_at,'recordedAt',recorded_at) order by revision) from crm_private.b05_provider_payment_revisions where provider_payment_id=(a->>'providerPaymentId')::uuid and admin_scope=hf[17]));end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
-- Provider consumption cannot be released by the general allocation reversal command.
create function crm_private.provider_consumption_guard() returns trigger language plpgsql set search_path=pg_catalog,pg_temp as $$
begin if new.original_act_id is not null and exists(select 1 from crm_private.b05_provider_outgoing_correspondences where consumption_act_ids @> jsonb_build_array(new.original_act_id::text)) then raise exception 'PROVIDER_PAYMENT_BANK_EFFECT_REVIEW_REQUIRED';end if;return new;end$$;
create trigger provider_consumption_guard before insert on crm_private.b05_allocation_acts for each row execute function crm_private.provider_consumption_guard();

do $upgrade$
declare def text;needle text;replacement text;
begin
 def:=pg_get_functiondef('crm_api.suplido_apply(bytea,bytea,bytea,bytea,bytea)'::regprocedure);
 needle:=$old$  rev:=rev+1;
  insert into crm_private.b05_suplido_revisions$old$;
 replacement:=$new$  state:=crm_private.provider_payment_documentary(state,s);
  if action='evaluate' then
   state:=jsonb_set(state,'{evaluation}',state->'evaluation'||jsonb_build_object('components',state->'components','state',state->>'status','pending',state->'pending','productivePaymentBoundary','LOCAL_H3_011_012'));
  elsif state->>'status'='Documentalmente resuelto' then state:=jsonb_set(state,'{status}','"Gestión abierta"'::jsonb);end if;
  rev:=rev+1;
  insert into crm_private.b05_suplido_revisions$new$;
 if position(needle in def)=0 then raise exception 'PROVIDER_PAYMENT_SUPLIDO_PREDECESSOR_MISMATCH';end if;execute replace(def,needle,replacement);
 def:=pg_get_functiondef('crm_api.suplido_read(bytea,bytea,bytea,bytea,bytea)'::regprocedure);
 needle:=$old$  r:=r||jsonb_build_object('currentComponents',current_components$old$;
 replacement:=$new$  x:=crm_private.provider_payment_documentary(r,hf[17]);
  if x->'components'->'payment' is distinct from r->'components'->'payment' or x->'pending' is distinct from r->'pending' then changed:=changed||'"provider_payment"'::jsonb;end if;
  current_components:=x->'components';
  r:=r||jsonb_build_object('currentComponents',current_components$new$;
 if position(needle in def)=0 then raise exception 'PROVIDER_PAYMENT_SUPLIDO_READ_PREDECESSOR_MISMATCH';end if;execute replace(def,needle,replacement);
end $upgrade$;
do $$declare f record;begin for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='crm_private' and p.proname in ('provider_payment_funds','provider_payment_documentary','provider_payment_core','provider_consumption_guard') loop
 execute 'alter function '||f.signature||' owner to crm_h0_f2_owner';execute 'revoke all on function '||f.signature||' from public';execute 'grant execute on function '||f.signature||' to crm_h0_f2_executor,crm_h0_migration';end loop;end$$;
do $$declare f text;begin foreach f in array array['provider_payment_apply','provider_payment_read'] loop execute 'alter function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor';execute 'revoke all on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) from public';execute 'grant execute on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime';end loop;end$$;
alter function crm_api.provider_payment_sensitive_schedule(bytea,bytea,bytea,bytea,bytea,jsonb) owner to crm_h0_f2_executor;
revoke all on function crm_api.provider_payment_sensitive_schedule(bytea,bytea,bytea,bytea,bytea,jsonb) from public,crm_h0_runtime;
grant execute on function crm_api.provider_payment_sensitive_schedule(bytea,bytea,bytea,bytea,bytea,jsonb) to crm_h0_ha_tx;
alter function crm_api.provider_payment_finalize(text) owner to crm_h0_f2_executor;
revoke all on function crm_api.provider_payment_finalize(text) from public,crm_h0_runtime;
grant execute on function crm_api.provider_payment_finalize(text) to crm_h0_ha_tx;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
