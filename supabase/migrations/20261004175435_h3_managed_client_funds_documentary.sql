-- H3-009/010: D013 coordination only. No productive Provider Payment or fiscal capability.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'SUPLIDO_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b05_suplidos(
 suplido_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),
 service_id uuid not null references crm_private.b04_services(service_id),admin_scope text not null,basis jsonb not null,
 initial_operation_id uuid not null,unique(admin_scope,booking_id,service_id)
);
create table crm_private.b05_suplido_operations(
 operation_id uuid primary key,suplido_id uuid not null references crm_private.b05_suplidos(suplido_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,result jsonb not null,result_revision bigint not null,
 recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b05_suplido_revisions(
 suplido_id uuid not null references crm_private.b05_suplidos(suplido_id),revision bigint not null check(revision>0),admin_scope text not null,
 operation_id uuid not null unique references crm_private.b05_suplido_operations(operation_id) deferrable initially deferred,
 action_kind text not null check(action_kind in ('open','component','evaluate','discrepancy','resolve')),event jsonb not null,before_data jsonb,after_data jsonb not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),evidence_id uuid not null references crm_private.b07_records(record_id),
 reason text not null,source_ref text not null,occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(suplido_id,revision)
);
alter table crm_private.b05_suplidos add foreign key(initial_operation_id) references crm_private.b05_suplido_operations(operation_id) deferrable initially deferred;
alter table crm_private.b05_suplido_operations add foreign key(suplido_id,result_revision) references crm_private.b05_suplido_revisions(suplido_id,revision) deferrable initially deferred;
create index b05_suplido_scope on crm_private.b05_suplidos(admin_scope,booking_id);
create index b05_suplido_operations_root on crm_private.b05_suplido_operations(suplido_id);
do $$declare t text;r text;begin foreach t in array array['b05_suplidos','b05_suplido_operations','b05_suplido_revisions'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy suplido_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy suplido_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger suplido_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
-- Projection of existing allocations. No new fund ledger or money mutation.
create function crm_private.suplido_funds(ids jsonb,bid uuid,service uuid,s text) returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare id jsonb;a jsonb;p jsonb;entries jsonb:='[]';assigned numeric:=0;usable numeric:=0;consumed numeric:=0;usable_consumed numeric:=0;u numeric;act record;
begin
 if jsonb_typeof(ids) is distinct from 'array' or (select count(distinct value) from jsonb_array_elements(ids))<>jsonb_array_length(ids) then raise exception 'SUPLIDO_FUNDS_REQUIRED';end if;
 -- Caller locks shared payment roots before any source reads.
 for id in select value from jsonb_array_elements(ids) order by value loop
  select ar.snapshot into a from crm_private.b05_allocation_revisions ar join crm_private.b05_allocations al using(allocation_id)
   where al.allocation_id=(id#>>'{}')::uuid and al.admin_scope=s and al.booking_id=bid and al.service_id=service and al.purpose='managed_client_funds' and ar.admin_scope=s order by ar.revision desc limit 1;
  if a is null then raise exception 'SUPLIDO_FUNDS_REQUIRED';end if;
  select snapshot into p from crm_private.b05_payment_revisions where payment_id=(a->>'paymentId')::uuid and admin_scope=s order by revision desc limit 1;
  u:=crm_private.fund_usable(a,p);if a->>'status'='verified' then assigned:=assigned+(a->>'amount')::numeric;end if;usable:=usable+u;
  for act in select z.* from crm_private.b05_allocation_acts z where z.allocation_id=(a->>'id')::uuid and z.kind='consume' and not exists(select 1 from crm_private.b05_allocation_acts r where r.original_act_id=z.act_id) loop
   consumed:=consumed-act.signed_amount;
   usable_consumed:=usable_consumed+crm_private.fund_usable(a||jsonb_build_object('start',trunc(act.start_amount,2)::text,'amount',trunc(-act.signed_amount,2)::text),p);
  end loop;
  entries:=entries||jsonb_build_array(jsonb_build_object('allocation',a,'paymentRevision',p->'revision','usable',trunc(u,2)::text));
 end loop;
 return jsonb_build_object('allocationIds',ids,'assigned',trunc(assigned,2)::text,'usable',trunc(usable,2)::text,'consumed',trunc(consumed,2)::text,'availableForPurpose',trunc(usable-usable_consumed,2)::text,'suspended',trunc(assigned-usable,2)::text,'entries',entries,'source','H3-005/006');
end$$;
create function crm_private.suplido_invoice(iid uuid,bid uuid,service uuid,client uuid,provider uuid,s text) returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare x jsonb;part jsonb;
begin
 select v.after_data into x from crm_private.b05_invoice_revisions v join crm_private.b05_provider_invoices i using(invoice_id)
 where i.invoice_id=iid and i.booking_id=bid and i.admin_scope=s and v.admin_scope=s order by v.revision desc limit 1;
 if x is null or x->'basis'->>'recipientId' is distinct from client::text or x->'basisApplied'->'provider'->>'item_id' is distinct from provider::text or not(x->'basis'->'serviceIds' @> jsonb_build_array(service::text)) then raise exception 'SUPLIDO_INVOICE_REQUIRED';end if;
 select value into part from jsonb_array_elements(coalesce(nullif(x->'link'->'portions','null'::jsonb),'[]')) where value->>'serviceId'=service::text;
 return jsonb_build_object('invoiceId',iid,'revision',x->'revision','status',x->'status','document',x->'document','review',x->'review','portion',part,'linked',x->>'status'='Vinculada' and part is not null,'source','H3-007/008');
end$$;
-- Incoming correspondence only; it cannot certify a supplier payment or outgoing reconciliation.
create function crm_private.suplido_correspondence(rid uuid,bid uuid,s text) returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare rc crm_private.b05_reconciliations;p jsonb;x jsonb;
begin
 select * into rc from crm_private.b05_reconciliations where reconciliation_id=rid and booking_id=bid and admin_scope=s;if not found then raise exception 'SUPLIDO_RECONCILIATION_REQUIRED';end if;
 select snapshot into p from crm_private.b05_payment_revisions where payment_id=rc.payment_id and admin_scope=s order by revision desc limit 1;
 select value into x from jsonb_array_elements(p->'correspondences') where value->>'id'=rid::text;
 if x->>'status' is distinct from 'verified' or p->'receipt'='null'::jsonb or exists(select 1 from jsonb_array_elements(p->'incidents') z where not(z->>'resolved')::boolean and (z->>'start')::numeric<(x->>'start')::numeric+(x->>'amount')::numeric and (z->>'start')::numeric+(z->>'amount')::numeric>(x->>'start')::numeric) then raise exception 'SUPLIDO_RECONCILIATION_REQUIRED';end if;
 return jsonb_build_object('reconciliationId',rid,'paymentId',rc.payment_id,'paymentRevision',p->'revision','correspondence',x,'direction','incoming','supplierPaymentVerified',false);
end$$;
-- Reuse H1 pending business tasks and cause deduplication. No scheduler/alert delivery or invented deadline.
create function crm_private.suplido_followup(root jsonb,kind text,s text,actor uuid,source text) returns uuid language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare identity jsonb;material jsonb;key text;target uuid;op uuid;after_data jsonb;
begin
 identity:=jsonb_build_object('causeKind','suplido','causeId',root->>'id','contextKind','booking','contextId',root->>'bookingId','scopeRef',root->'basis'->>'serviceId','relatedKind','suplido','relatedId',root->>'id','effect','obtain_'||kind);
 key:=encode(crm_crypto.digest(convert_to(jsonb_build_object('version','h1-pending-cause-v1','identity',identity)::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(s||key,17));
 select task_id into target from crm_private.b07_pending_tasks where admin_scope=s and identity_key=key;if found then return target;end if;
 target:=gen_random_uuid();op:=gen_random_uuid();material:=jsonb_build_object('title','Suplido: pendiente '||kind,'deadline',jsonb_build_object('kind','unknown','reason','Plazo no acreditado'),'priority',jsonb_build_object('kind','pending','reason','Prioridad real no acreditada'),'sourceRef',source,'sourceVersion','h3-suplido-v1','triggerRef','manual','triggerVersion','h3-suplido-v1');
 insert into crm_private.b07_pending_tasks(task_id,admin_scope,identity_version,identity_key,identity,material,state,responsible_actor,revision) values(target,s,'h1-pending-cause-v1',key,identity,material,'pending',actor,1);
 select to_jsonb(t) into after_data from crm_private.b07_pending_tasks t where task_id=target;
 insert into crm_private.b07_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref) values(op,s,actor,key,target);
 insert into crm_private.b07_history(history_id,operation_id,subject_id,admin_scope,action_kind,before_state,after_state,reason,source_ref,actor_id) values(op,op,target,s,'task_receive',null,after_data,'Componente documental pendiente',source,actor);
 return target;
end$$;
create function crm_api.suplido_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;s text;actor uuid;op uuid;sid uuid;bid uuid;service uuid;root crm_private.b05_suplidos;prev crm_private.b05_suplido_operations;
 state jsonb;old jsonb;basis jsonb;provider jsonb;client jsonb;fp text;proofhash text;action text;comp text;rev bigint;at_time timestamptz;
 components jsonb;ids jsonb;invoice_id uuid;source_root text;x jsonb;due numeric;usable numeric;pending jsonb;refs jsonb;differences jsonb;r jsonb;mandate jsonb;mh text;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'SUPLIDO_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-SUPLIDO1' then raise exception 'SUPLIDO_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a ?& array['action','operationId','suplidoId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId'])
 or exists(select 1 from unnest(array['action','operationId','suplidoId','bookingId','sourceRef','reason','at','evidenceId']) k where not coalesce(crm_private.invoice_text(a->k),false))
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision' !~ '^(0|[1-9][0-9]*)$'
 or coalesce(a->>'origin','manual')<>'manual' or (a?'origin' and jsonb_typeof(a->'origin') is distinct from 'string')
 or a->>'action' not in ('open','component','evaluate','discrepancy','resolve')
 or a->>'at' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'SUPLIDO_INPUT_INVALID';end if;
 action:=a->>'action';comp:=a->>'component';
 if a-array['action','operationId','suplidoId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','origin']-
 (case action when 'open' then array['basis'] when 'component' then array['component','confirmedAmount','allocationIds','invoiceId','reconciliationId','mandate'] when 'discrepancy' then array['component','incidentId','affectedAllocationIds'] when 'resolve' then array['component','incidentId'] else array[]::text[] end)<>'{}'::jsonb then raise exception 'SUPLIDO_INPUT_INVALID';end if;
 sid:=(a->>'suplidoId')::uuid;bid:=(a->>'bookingId')::uuid;op:=(a->>'operationId')::uuid;actor:=hf[12]::uuid;s:=hf[17];at_time:=(a->>'at')::timestamptz;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s) then raise exception 'SUPLIDO_DENIED';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('suplido-op:'||op,0));
 select * into prev from crm_private.b05_suplido_operations where operation_id=op;
 if found then
  if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'SUPLIDO_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  proofhash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.payment_evidence((a->>'evidenceId')::uuid,sid,s,'suplido:'||action||':'||proofhash,at_time,true)
   or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'SUPLIDO_EVIDENCE_REQUIRED';end if;
  if action='open' then
   basis:=a->'basis';
   if jsonb_typeof(basis) is distinct from 'object' or basis-array['clientId','providerRevisionId','serviceId','expectedAmount','confirmedAmount','sourceRef','version']<>'{}'::jsonb or not(basis ?& array['clientId','providerRevisionId','serviceId','expectedAmount','confirmedAmount','sourceRef','version'])
   or exists(select 1 from unnest(array['clientId','providerRevisionId','serviceId','sourceRef','version']) k where not coalesce(crm_private.invoice_text(basis->k),false))
   or (basis->'expectedAmount'='null'::jsonb and basis->'confirmedAmount'='null'::jsonb)
   or (basis->'expectedAmount'<>'null'::jsonb and not coalesce(crm_private.payment_amount(basis->'expectedAmount'),false))
   or (basis->'confirmedAmount'<>'null'::jsonb and not coalesce(crm_private.payment_amount(basis->'confirmedAmount'),false))
   or (a->>'expectedRevision')::bigint<>0 then raise exception 'SUPLIDO_BASIS_REQUIRED';end if;
   service:=(basis->>'serviceId')::uuid;
   if not exists(select 1 from crm_private.b04_services where service_id=service and booking_id=bid and admin_scope=s and nature='external') then raise exception 'SUPLIDO_BASIS_REQUIRED';end if;
   select to_jsonb(cr) into provider from crm_private.catalog_revisions cr join crm_private.catalog_items ci using(item_id) where cr.revision_id=(basis->>'providerRevisionId')::uuid and cr.admin_scope=s and ci.item_kind='provider';
   select to_jsonb(e) into client from crm_private.identity_entities e where e.identity_id=(basis->>'clientId')::uuid and e.admin_scope=s and e.identity_verified;
   if provider is null or client is null then raise exception 'SUPLIDO_BASIS_REQUIRED';end if;
   perform pg_advisory_xact_lock(hashtextextended('suplido-service:'||bid||':'||service,0));
   select * into root from crm_private.b05_suplidos where booking_id=bid and service_id=service and admin_scope=s;
   if found then
    if root.basis is distinct from basis then raise exception 'SUPLIDO_IDENTITY_CONFLICT:E2';end if;sid:=root.suplido_id;
    select revision,after_data into rev,state from crm_private.b05_suplido_revisions where suplido_id=sid order by revision desc limit 1;
    r:=jsonb_build_object('id',sid,'replayed',true,'result',state);
    insert into crm_private.b05_suplido_operations values(op,sid,s,actor,fp,r,rev,clock_timestamp());
    perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
   end if;
   perform pg_advisory_xact_lock(hashtextextended('suplido-root:'||sid,0));
   insert into crm_private.b05_suplidos values(sid,bid,service,s,basis,op);
   rev:=0;components:=jsonb_build_object('amount',jsonb_build_object('expected',basis->'expectedAmount','confirmed',basis->'confirmedAmount','sourceRef',basis->>'sourceRef','version',basis->>'version'),'funds',null,'invoice',null,'payment',null,'reconciliation',null,'mandate',null);
   state:=jsonb_build_object('id',sid,'bookingId',bid,'revision',1,'basis',basis,'basisApplied',jsonb_build_object('provider',provider,'client',client),'components',components,'differences','[]'::jsonb,'evaluation',null,'status','Gestión abierta');
  else
   perform pg_advisory_xact_lock(hashtextextended('suplido-root:'||sid,0));
   select * into root from crm_private.b05_suplidos where suplido_id=sid and booking_id=bid and admin_scope=s;if not found then raise exception 'SUPLIDO_DENIED';end if;
   select revision,after_data into rev,old from crm_private.b05_suplido_revisions where suplido_id=sid order by revision desc limit 1;
   if rev<>(a->>'expectedRevision')::bigint then raise exception 'SUPLIDO_REVISION_CONFLICT:E2';end if;
   basis:=root.basis;service:=root.service_id;state:=old;components:=old->'components';
   -- Lock all retained and requested sources in stable order; source mutations use the same roots.
   ids:=coalesce(nullif(a->'allocationIds','null'::jsonb),nullif(components->'funds'->'allocationIds','null'::jsonb),'[]');
   if jsonb_typeof(ids) is distinct from 'array' then raise exception 'SUPLIDO_FUNDS_REQUIRED';end if;
   invoice_id:=coalesce((a->>'invoiceId')::uuid,(components->'invoice'->>'invoiceId')::uuid);
   for source_root in select distinct k from (
    select 'payment-root:'||al.payment_id k from crm_private.b05_allocations al where al.admin_scope=s and ids @> jsonb_build_array(al.allocation_id::text)
    union select 'invoice-root:'||invoice_id where invoice_id is not null
    union select 'payment-root:'||rc.payment_id from crm_private.b05_reconciliations rc where rc.admin_scope=s and rc.reconciliation_id=coalesce((a->>'reconciliationId')::uuid,(components->'reconciliation'->>'reconciliationId')::uuid)
   ) locks order by k loop perform pg_advisory_xact_lock(hashtextextended(source_root,0));end loop;
   if action='component' then
    if comp is null or comp not in ('amount','funds','invoice','reconciliation','mandate') then raise exception 'SUPLIDO_COMPONENT_REQUIRED';end if;
    if a-array['action','operationId','suplidoId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','origin','component']-
    (case comp when 'amount' then array['confirmedAmount'] when 'funds' then array['allocationIds'] when 'invoice' then array['invoiceId'] when 'reconciliation' then array['reconciliationId'] else array['mandate'] end)<>'{}'::jsonb then raise exception 'SUPLIDO_INPUT_INVALID';end if;
    if comp='amount' then
     if not coalesce(crm_private.payment_amount(a->'confirmedAmount'),false) then raise exception 'SUPLIDO_AMOUNT_REQUIRED';end if;
     x:=components->'amount'||jsonb_build_object('confirmed',a->'confirmedAmount','sourceRef',a->>'sourceRef','version',op);
    elsif comp='funds' then
     if not(a?'allocationIds') then raise exception 'SUPLIDO_FUNDS_REQUIRED';end if;x:=crm_private.suplido_funds(ids,bid,service,s);
    elsif comp='invoice' then
     if not coalesce(crm_private.invoice_text(a->'invoiceId'),false) then raise exception 'SUPLIDO_INVOICE_REQUIRED';end if;
     x:=crm_private.suplido_invoice(invoice_id,bid,service,(basis->>'clientId')::uuid,(state->'basisApplied'->'provider'->>'item_id')::uuid,s);
    elsif comp='reconciliation' then
     if not coalesce(crm_private.invoice_text(a->'reconciliationId'),false) then raise exception 'SUPLIDO_RECONCILIATION_REQUIRED';end if;
     x:=crm_private.suplido_correspondence((a->>'reconciliationId')::uuid,bid,s);
    else
     mandate:=a->'mandate';
     if jsonb_typeof(mandate) is distinct from 'object' or mandate-array['id','version','content','acceptanceRef','acceptedBy','acceptedAt','evidenceId']<>'{}'::jsonb or not(mandate ?& array['id','version','content','acceptanceRef','acceptedBy','acceptedAt','evidenceId'])
     or exists(select 1 from unnest(array['id','version','content','acceptanceRef','acceptedBy','acceptedAt','evidenceId']) k where not coalesce(crm_private.invoice_text(mandate->k),false)) or mandate->>'acceptedBy' is distinct from basis->>'clientId'
     or mandate->>'acceptedAt' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'SUPLIDO_MANDATE_REQUIRED';end if;
     mh:=encode(crm_crypto.digest(convert_to((mandate-'evidenceId')::text,'UTF8'),'sha256'),'hex');
     if not crm_private.payment_evidence((mandate->>'evidenceId')::uuid,sid,s,'mandate:accepted:'||mh,(mandate->>'acceptedAt')::timestamptz,true) then raise exception 'SUPLIDO_MANDATE_REQUIRED';end if;x:=mandate;
    end if;
    components:=jsonb_set(components,array[comp],x);
   elsif action in ('discrepancy','resolve') then
    if comp is null or comp not in ('amount','funds','invoice','payment','reconciliation','obligation','mandate') or not coalesce(crm_private.invoice_text(a->'incidentId'),false) then raise exception 'SUPLIDO_DIFFERENCE_REQUIRED';end if;perform (a->>'incidentId')::uuid;
    if action='discrepancy' and comp='funds' then
     if jsonb_typeof(a->'affectedAllocationIds') is distinct from 'array' or jsonb_array_length(a->'affectedAllocationIds')=0 or not coalesce((components->'funds'->'allocationIds') @> (a->'affectedAllocationIds'),false) then raise exception 'SUPLIDO_DIFFERENCE_REQUIRED';end if;
    elsif a?'affectedAllocationIds' then raise exception 'SUPLIDO_DIFFERENCE_REQUIRED';end if;
    differences:=state->'differences';
    if action='discrepancy' then
     if exists(select 1 from jsonb_array_elements(differences) z where z->>'id'=a->>'incidentId') then raise exception 'SUPLIDO_DIFFERENCE_CONFLICT:E2';end if;
     differences:=differences||jsonb_build_array(jsonb_build_object('id',a->>'incidentId','component',comp,'affectedAllocationIds',a->'affectedAllocationIds','sourceRef',a->>'sourceRef','reason',a->>'reason','evidenceId',a->>'evidenceId','actorId',actor,'at',a->>'at','resolved',false));
    else
     if not exists(select 1 from jsonb_array_elements(differences) z where z->>'id'=a->>'incidentId' and z->>'component'=comp and not(z->>'resolved')::boolean) then raise exception 'SUPLIDO_DIFFERENCE_REQUIRED';end if;
     select jsonb_agg(case when z->>'id'=a->>'incidentId' then z||jsonb_build_object('resolved',true,'resolutionEvidenceId',a->>'evidenceId','resolutionSource',a->>'sourceRef','resolutionReason',a->>'reason','resolutionActor',actor,'resolutionAt',a->>'at') else z end) into differences from jsonb_array_elements(differences) z;
    end if;state:=state||jsonb_build_object('differences',differences);
   end if;
  end if;
  if action='evaluate' then
   -- Revalidate attached components under source roots. Payment/outgoing reconciliation stay absent.
   if components->'funds'<>'null'::jsonb then components:=jsonb_set(components,'{funds}',crm_private.suplido_funds(components->'funds'->'allocationIds',bid,service,s));end if;
   if components->'invoice'<>'null'::jsonb then components:=jsonb_set(components,'{invoice}',crm_private.suplido_invoice((components->'invoice'->>'invoiceId')::uuid,bid,service,(basis->>'clientId')::uuid,(state->'basisApplied'->'provider'->>'item_id')::uuid,s));end if;
   if components->'reconciliation'<>'null'::jsonb then
    begin components:=jsonb_set(components,'{reconciliation}',crm_private.suplido_correspondence((components->'reconciliation'->>'reconciliationId')::uuid,bid,s));
    exception when raise_exception then components:=jsonb_set(components,'{reconciliation}',components->'reconciliation'||jsonb_build_object('requiresReview',true));end;
   end if;
  end if;
  state:=state||jsonb_build_object('components',components,'revision',rev+1);
  due:=coalesce((components->'amount'->>'confirmed')::numeric,(components->'amount'->>'expected')::numeric);usable:=coalesce((components->'funds'->>'usable')::numeric,0);
  if exists(select 1 from jsonb_array_elements(state->'differences') z where z->>'component'='funds' and not(z->>'resolved')::boolean) then
   select coalesce(sum((entry->>'usable')::numeric),0) into usable from jsonb_array_elements(components->'funds'->'entries') entry where not exists(select 1 from jsonb_array_elements(state->'differences') z where z->>'component'='funds' and not(z->>'resolved')::boolean and z->'affectedAllocationIds' @> jsonb_build_array(entry->'allocation'->>'id'));
  end if;
  state:=state||jsonb_build_object('funding',jsonb_build_object('due',trunc(due,2)::text,'identified',trunc(usable,2)::text,'remaining',trunc(greatest(0,due-usable),2)::text,'excess',trunc(greatest(0,usable-due),2)::text,'ownFinancingInferred',false));
  pending:=jsonb_build_array('payment','outgoing_reconciliation');
  if components->'invoice'='null'::jsonb or not coalesce((components->'invoice'->>'linked')::boolean,false) or (components->'invoice'->'portion'->>'amount')::numeric is distinct from due then pending:=pending||'"invoice"'::jsonb;end if;
  for x in select value from jsonb_array_elements(state->'differences') where not(value->>'resolved')::boolean loop pending:=pending||jsonb_build_array('difference:'||(x->>'component'));end loop;
  refs:='[]';for comp in select value#>>'{}' from jsonb_array_elements(pending) where value in ('"invoice"'::jsonb,'"payment"'::jsonb) loop refs:=refs||jsonb_build_array(crm_private.suplido_followup(state,comp,s,actor,a->>'sourceRef'));end loop;
  state:=state||jsonb_build_object('pending',pending,'followUpIds',refs,'status',case when exists(select 1 from jsonb_array_elements(state->'differences') z where not(z->>'resolved')::boolean) then 'Revisión' else 'Gestión abierta' end);
  if action='evaluate' then state:=state||jsonb_build_object('evaluation',jsonb_build_object('operationId',op,'actorId',actor,'at',a->>'at','sourceRef',a->>'sourceRef','evidenceId',a->>'evidenceId','components',components,'differences',state->'differences','state','Gestión abierta','pending',pending,'productivePaymentBoundary','NOT_IMPLEMENTED_H3_011_012','bookingClosureInferred',false,'fiscalValidation',false));
  elsif action<>'open' then state:=state||jsonb_build_object('evaluation',null);end if;
  rev:=rev+1;
  insert into crm_private.b05_suplido_revisions values(sid,rev,s,op,action,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'reason',a->>'sourceRef',at_time,clock_timestamp());
  r:=jsonb_build_object('id',sid,'replayed',false,'result',state);
  insert into crm_private.b05_suplido_operations values(op,sid,s,actor,fp,r,rev,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.suplido_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;r jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'SUPLIDO_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-SUPLIDO-READ1' then raise exception 'SUPLIDO_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or a-array['suplidoId','bookingId']<>'{}'::jsonb or not coalesce(crm_private.invoice_text(a->'suplidoId'),false) or not coalesce(crm_private.invoice_text(a->'bookingId'),false) then raise exception 'SUPLIDO_INPUT_INVALID';end if;
 select v.after_data into r from crm_private.b05_suplido_revisions v join crm_private.b05_suplidos i using(suplido_id) where i.suplido_id=(a->>'suplidoId')::uuid and i.booking_id=(a->>'bookingId')::uuid and i.admin_scope=hf[17] and v.admin_scope=hf[17] order by v.revision desc limit 1;
 if r is not null then r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action_kind,'before',before_data,'after',after_data,'actorId',actor_id,'reason',reason,'sourceRef',source_ref,'evidenceId',evidence_id,'at',occurred_at,'recordedAt',recorded_at) order by revision) from crm_private.b05_suplido_revisions where suplido_id=(a->>'suplidoId')::uuid and admin_scope=hf[17]));end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
do $$declare f record;begin for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='crm_private' and p.proname in ('suplido_funds','suplido_invoice','suplido_correspondence','suplido_followup') loop
 execute 'alter function '||f.signature||' owner to crm_h0_f2_owner';execute 'revoke all on function '||f.signature||' from public';execute 'grant execute on function '||f.signature||' to crm_h0_f2_executor,crm_h0_migration';end loop;end$$;
do $$declare f text;begin foreach f in array array['suplido_apply','suplido_read'] loop execute 'alter function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor';execute 'revoke all on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) from public';execute 'grant execute on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime';end loop;end$$;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
