-- H3-007/008: external client-addressed documentary lifecycle. No fiscal or payment effect.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'INVOICE_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b05_provider_invoices(
 invoice_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),admin_scope text not null,
 need_key text not null,basis jsonb not null,initial_operation_id uuid not null,unique(admin_scope,booking_id,need_key)
);
create table crm_private.b05_invoice_operations(
 operation_id uuid primary key,invoice_id uuid not null references crm_private.b05_provider_invoices(invoice_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,result jsonb not null,
 result_revision bigint not null,recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b05_invoice_revisions(
 invoice_id uuid not null references crm_private.b05_provider_invoices(invoice_id),revision bigint not null check(revision>0),admin_scope text not null,
 operation_id uuid not null unique references crm_private.b05_invoice_operations(operation_id) deferrable initially deferred,
 action_kind text not null check(action_kind in ('need','receive','review','link','correct')),event jsonb not null,
 before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 evidence_id uuid not null references crm_private.b07_records(record_id),reason text not null,source_ref text not null,
 occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(invoice_id,revision)
);
create table crm_private.b05_invoice_documents(
 document_id uuid primary key references crm_private.b07_records(record_id),object_version_id uuid not null unique references crm_private.b07_object_versions(version_id),
 invoice_id uuid not null references crm_private.b05_provider_invoices(invoice_id),admin_scope text not null,material jsonb not null,
 original_document_id uuid references crm_private.b05_invoice_documents(document_id),operation_id uuid not null references crm_private.b05_invoice_operations(operation_id) deferrable initially deferred
);
alter table crm_private.b05_provider_invoices add foreign key(initial_operation_id) references crm_private.b05_invoice_operations(operation_id) deferrable initially deferred;
alter table crm_private.b05_invoice_operations add foreign key(invoice_id,result_revision) references crm_private.b05_invoice_revisions(invoice_id,revision) deferrable initially deferred;
create index b05_invoice_scope on crm_private.b05_provider_invoices(admin_scope,booking_id);
create index b05_invoice_documents_invoice on crm_private.b05_invoice_documents(invoice_id);
create index b05_invoice_operations_invoice on crm_private.b05_invoice_operations(invoice_id);
do $$declare t text;r text;begin foreach t in array array['b05_provider_invoices','b05_invoice_operations','b05_invoice_revisions','b05_invoice_documents'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy invoice_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy invoice_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger invoice_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
-- Explicit null/type checks: UNKNOWN must never admit material economic/documentary input.
create function crm_private.invoice_text(v jsonb) returns boolean language sql immutable set search_path=pg_catalog,pg_temp as $$
 select jsonb_typeof(v)='string' and length(v#>>'{}') between 1 and 16384 and btrim(v#>>'{}')<>''
$$;
-- Signed documentary amounts are identified facts, not incoming funds or fiscal validation.
create function crm_private.invoice_amount(v jsonb) returns boolean language sql immutable set search_path=pg_catalog,pg_temp as $$
 select jsonb_typeof(v)='string' and v#>>'{}'<>'-0.00' and crm_private.payment_amount(to_jsonb(case when left(v#>>'{}',1)='-' then substring(v#>>'{}' from 2) else v#>>'{}' end))
$$;
create function crm_private.invoice_services(ids jsonb,bid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare id jsonb;
begin
 if jsonb_typeof(ids) is distinct from 'array' or jsonb_array_length(ids)=0 or (select count(distinct value) from jsonb_array_elements(ids))<>jsonb_array_length(ids) then return false;end if;
 for id in select value from jsonb_array_elements(ids) loop
  if jsonb_typeof(id) is distinct from 'string' or not exists(select 1 from crm_private.b04_services bs where bs.service_id=(id#>>'{}')::uuid and bs.booking_id=bid and bs.admin_scope=s and bs.nature='external') then return false;end if;
 end loop;return true;
end$$;
create function crm_private.invoice_original(d jsonb,bid uuid,s text,previous uuid) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare r crm_private.b07_records;o crm_private.b07_object_versions;issuer jsonb;
begin
 if jsonb_typeof(d) is distinct from 'object' or d-array['documentId','objectVersionId','issuerRevisionId','recipientId','amount','serviceIds']<>'{}'::jsonb or not(d ?& array['documentId','objectVersionId','issuerRevisionId','recipientId','amount','serviceIds'])
 or exists(select 1 from unnest(array['documentId','objectVersionId','issuerRevisionId','recipientId']) k where not coalesce(crm_private.invoice_text(d->k),false))
 or not coalesce(crm_private.invoice_amount(d->'amount'),false) or not crm_private.invoice_services(d->'serviceIds',bid,s) then raise exception 'INVOICE_DOCUMENT_REQUIRED';end if;
 select * into r from crm_private.b07_records where record_id=(d->>'documentId')::uuid and admin_scope=s and record_kind='document';
 if not found or r.material->>'relation'<>'original' or r.corrects_id is distinct from previous or not exists(select 1 from crm_private.b07_links where record_id=r.record_id and admin_scope=s and context_kind='booking' and context_id=bid) then raise exception 'INVOICE_ORIGINAL_REQUIRED';end if;
 select * into o from crm_private.b07_object_versions where version_id=(d->>'objectVersionId')::uuid and document_id=r.record_id and admin_scope=s and state='stored';
 if not found then raise exception 'INVOICE_ORIGINAL_REQUIRED';end if;
 select to_jsonb(cr) into issuer from crm_private.catalog_revisions cr join crm_private.catalog_items ci using(item_id) where cr.revision_id=(d->>'issuerRevisionId')::uuid and cr.admin_scope=s and ci.item_kind='provider';
 if issuer is null or not exists(select 1 from crm_private.identity_entities where identity_id=(d->>'recipientId')::uuid and admin_scope=s) then raise exception 'INVOICE_DOCUMENT_REQUIRED';end if;
 -- Keep reproducible object metadata, without exposing private references in invoice projections.
 return d||jsonb_build_object('issuerApplied',issuer,'conservation',jsonb_build_object('version',o.version_number,'digest',o.expected_digest,'size',o.expected_size::text,'media',o.expected_media,'sourceRef',r.source_ref,'recordedAt',r.recorded_at));
end$$;
create function crm_api.invoice_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;op uuid;iid uuid;bid uuid;actor uuid;s text;action text;fp text;proofhash text;rev bigint;at_time timestamptz;
 prev crm_private.b05_invoice_operations;root crm_private.b05_provider_invoices;b crm_private.b04_bookings;d jsonb;basis jsonb;old jsonb;state jsonb;r jsonb;diffs jsonb;item jsonb;sum_amount numeric;key text;prior_doc uuid;provider jsonb;client jsonb;comparison jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'INVOICE_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-INVOICE1' then raise exception 'INVOICE_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a ?& array['action','operationId','invoiceId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId'])
 or exists(select 1 from unnest(array['action','operationId','invoiceId','bookingId','sourceRef','reason','at','evidenceId']) k where not coalesce(crm_private.invoice_text(a->k),false))
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision' !~ '^(0|[1-9][0-9]*)$'
 or coalesce(a->>'origin','manual')<>'manual' or (a?'origin' and jsonb_typeof(a->'origin') is distinct from 'string')
 or a->>'action' not in ('need','receive','review','link','correct') or a->>'at' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'INVOICE_INPUT_INVALID';end if;
 action:=a->>'action';
 if a-array['action','operationId','invoiceId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','origin']-
 (case action when 'need' then array['basis'] when 'receive' then array['document'] when 'review' then array['checks','comparisonBasis'] when 'link' then array['portions'] else array['document','affectedServiceIds','affectedRecipientId','affectedAmount'] end)<>'{}'::jsonb then raise exception 'INVOICE_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;iid:=(a->>'invoiceId')::uuid;bid:=(a->>'bookingId')::uuid;actor:=hf[12]::uuid;s:=hf[17];at_time:=(a->>'at')::timestamptz;
 select * into b from crm_private.b04_bookings where booking_id=bid and admin_scope=s;if not found then raise exception 'INVOICE_DENIED';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('invoice-op:'||op,0));
 select * into prev from crm_private.b05_invoice_operations where operation_id=op;
 if found then
  if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'INVOICE_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  proofhash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.payment_evidence((a->>'evidenceId')::uuid,iid,s,'invoice:'||action||':'||proofhash,at_time,true)
  or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'INVOICE_EVIDENCE_REQUIRED';end if;
  if action='need' then
   basis:=a->'basis';
   if jsonb_typeof(basis) is distinct from 'object' or basis-array['providerRevisionId','recipientId','amount','serviceIds','sourceRef','version']<>'{}'::jsonb or not(basis ?& array['providerRevisionId','recipientId','amount','serviceIds','sourceRef','version'])
   or exists(select 1 from unnest(array['providerRevisionId','recipientId','sourceRef','version']) k where not coalesce(crm_private.invoice_text(basis->k),false))
   or (basis->'amount'<>'null'::jsonb and not coalesce(crm_private.invoice_amount(basis->'amount'),false)) or not crm_private.invoice_services(basis->'serviceIds',bid,s) or (a->>'expectedRevision')::bigint<>0 then raise exception 'INVOICE_BASIS_REQUIRED';end if;
   select to_jsonb(cr) into provider from crm_private.catalog_revisions cr join crm_private.catalog_items ci using(item_id) where cr.revision_id=(basis->>'providerRevisionId')::uuid and cr.admin_scope=s and ci.item_kind='provider';
   select to_jsonb(e) into client from crm_private.identity_entities e where e.identity_id=(basis->>'recipientId')::uuid and e.admin_scope=s and e.identity_verified;
   if provider is null or client is null then raise exception 'INVOICE_BASIS_REQUIRED';end if;
   -- The reviewed C04 assertion binds the pertinent client/provider/base to these services.
   key:=encode(crm_crypto.digest(convert_to(basis::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('invoice-need:'||bid||':'||key,0));
   select * into root from crm_private.b05_provider_invoices where booking_id=bid and admin_scope=s and need_key=key;
   if found then
    select revision,after_data into rev,state from crm_private.b05_invoice_revisions where invoice_id=root.invoice_id order by revision desc limit 1;iid:=root.invoice_id;
   else
    perform pg_advisory_xact_lock(hashtextextended('invoice-root:'||iid,0));
    insert into crm_private.b05_provider_invoices values(iid,bid,s,key,basis,op);
    rev:=1;state:=jsonb_build_object('id',iid,'bookingId',bid,'revision',rev,'status','Pendiente','basis',basis,'basisApplied',jsonb_build_object('provider',provider,'client',client,'bookingRevision',b.revision),'document',null,'review',null,'link',null,'incident',null);
    insert into crm_private.b05_invoice_revisions values(iid,rev,s,op,action,a,null,state,actor,(a->>'evidenceId')::uuid,a->>'reason',a->>'sourceRef',at_time,clock_timestamp());
   end if;
  else
   perform pg_advisory_xact_lock(hashtextextended('invoice-root:'||iid,0));
   select * into root from crm_private.b05_provider_invoices where invoice_id=iid and booking_id=bid and admin_scope=s;
   if not found then raise exception 'INVOICE_DENIED';end if;
   select revision,after_data into rev,old from crm_private.b05_invoice_revisions where invoice_id=iid order by revision desc limit 1;
   if rev<>(a->>'expectedRevision')::bigint then raise exception 'INVOICE_REVISION_CONFLICT:E2';end if;
   basis:=root.basis;state:=old;
   if action='receive' or (action='correct' and a?'document') then
    prior_doc:=case when action='correct' then (old->'document'->>'documentId')::uuid else null end;
    d:=crm_private.invoice_original(a->'document',bid,s,prior_doc);
    perform pg_advisory_xact_lock(hashtextextended('invoice-document:'||(d->>'documentId'),0));
    if action='receive' and old->>'status'<>'Pendiente' then
     if old->'document' is distinct from d then raise exception 'INVOICE_DOCUMENT_CONFLICT:E2';end if;
     r:=jsonb_build_object('id',iid,'replayed',true,'result',old);
     insert into crm_private.b05_invoice_operations values(op,iid,s,actor,fp,r,rev,clock_timestamp());
     perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
    end if;
    insert into crm_private.b05_invoice_documents values((d->>'documentId')::uuid,(d->>'objectVersionId')::uuid,iid,s,d,prior_doc,op);
    state:=state||jsonb_build_object('document',d);
   end if;
   if action='receive' then state:=state||jsonb_build_object('status','Recibida');
   elsif action='review' then
    if old->>'status' not in ('Recibida','Incidencia') or old->'document'='null'::jsonb or a->'checks' is distinct from '{"provider":true,"recipient":true,"amount":true,"scope":true}'::jsonb then raise exception 'INVOICE_REVIEW_REQUIRED';end if;
    -- Identifying a need does not require knowing its comparison amount.
    -- A subsequently verified base is a new review fact; the initial basis stays immutable.
    if a?'comparisonBasis' then
     comparison:=a->'comparisonBasis';
     if jsonb_typeof(comparison) is distinct from 'object' or comparison-array['providerRevisionId','recipientId','amount','serviceIds','sourceRef','version']<>'{}'::jsonb
     or not(comparison ?& array['providerRevisionId','recipientId','amount','serviceIds','sourceRef','version'])
     or not coalesce(crm_private.invoice_amount(comparison->'amount'),false)
     or not coalesce(crm_private.invoice_text(comparison->'sourceRef'),false) or not coalesce(crm_private.invoice_text(comparison->'version'),false)
     or comparison->'providerRevisionId' is distinct from basis->'providerRevisionId' or comparison->'recipientId' is distinct from basis->'recipientId' or comparison->'serviceIds' is distinct from basis->'serviceIds'
     or (basis->'amount'<>'null'::jsonb and comparison->'amount' is distinct from basis->'amount') then raise exception 'INVOICE_REVIEW_REQUIRED:E3';end if;
     basis:=comparison;
    end if;
    if basis->'amount'='null'::jsonb then raise exception 'INVOICE_REVIEW_REQUIRED:E3';end if;
    d:=old->'document';diffs:='[]';
    if old->'basisApplied'->'provider'->>'item_id' is distinct from d->'issuerApplied'->>'item_id' then diffs:=diffs||'"provider"'::jsonb;end if;
    if basis->>'recipientId'<>d->>'recipientId' then diffs:=diffs||'"recipient"'::jsonb;end if;
    if basis->>'amount'<>d->>'amount' then diffs:=diffs||'"amount"'::jsonb;end if;
    if (select jsonb_agg(value order by value) from jsonb_array_elements(basis->'serviceIds')) is distinct from (select jsonb_agg(value order by value) from jsonb_array_elements(d->'serviceIds')) then diffs:=diffs||'"scope"'::jsonb;end if;
    state:=state||jsonb_build_object('status',case when diffs='[]'::jsonb then 'Revisada' else 'Incidencia' end,'review',jsonb_build_object('operationId',op,'evidenceId',a->>'evidenceId','actorId',actor,'at',a->>'at','basis',basis,'document',d,'differences',diffs,'operationalOnly',true),'link',null,'incident',case when diffs='[]'::jsonb then null else jsonb_build_object('sourceRef',a->>'sourceRef','reason',a->>'reason','differences',diffs) end);
   elsif action='link' then
    if old->>'status'<>'Revisada' or old->'review'='null'::jsonb or jsonb_typeof(a->'portions') is distinct from 'array' or jsonb_array_length(a->'portions')<>jsonb_array_length(basis->'serviceIds') or jsonb_array_length(a->'portions')=0 then raise exception 'INVOICE_LINK_REQUIRED';end if;
    if (select count(distinct value->>'serviceId') from jsonb_array_elements(a->'portions'))<>jsonb_array_length(a->'portions') then raise exception 'INVOICE_PORTIONS_REQUIRED';end if;
    sum_amount:=0;
    for item in select value from jsonb_array_elements(a->'portions') loop
     if jsonb_typeof(item) is distinct from 'object' or item-array['serviceId','amount','sourceRef']<>'{}'::jsonb or not coalesce(crm_private.invoice_text(item->'serviceId'),false) or not coalesce(crm_private.invoice_text(item->'sourceRef'),false)
     or not coalesce(crm_private.invoice_amount(item->'amount'),false) or not (basis->'serviceIds' @> jsonb_build_array(item->'serviceId')) then raise exception 'INVOICE_PORTIONS_REQUIRED';end if;
     sum_amount:=sum_amount+(item->>'amount')::numeric;
    end loop;
    if sum_amount<>(old->'document'->>'amount')::numeric then raise exception 'INVOICE_PORTIONS_REQUIRED';end if;
    state:=state||jsonb_build_object('status','Vinculada','link',jsonb_build_object('operationId',op,'reviewOperationId',old->'review'->>'operationId','documentId',old->'document'->>'documentId','portions',a->'portions','sourceRef',a->>'sourceRef','actorId',actor,'at',a->>'at','externalContext',old->'review'->'basis','documentaryOnly',true));
   elsif action='correct' then
    if old->>'status' not in ('Recibida','Revisada','Vinculada','Incidencia') or old->'document'='null'::jsonb
    or not coalesce(crm_private.invoice_text(a->'affectedRecipientId'),false) or not coalesce(crm_private.invoice_amount(a->'affectedAmount'),false)
    or not crm_private.invoice_services(a->'affectedServiceIds',bid,s) or not ((basis->'serviceIds') @> (a->'affectedServiceIds'))
    or not exists(select 1 from crm_private.identity_entities where identity_id=(a->>'affectedRecipientId')::uuid and admin_scope=s) then raise exception 'INVOICE_CORRECTION_REQUIRED';end if;
    state:=state||jsonb_build_object('status','Incidencia','review',null,'link',null,'incident',jsonb_build_object('operationId',op,'sourceRef',a->>'sourceRef','reason',a->>'reason','previousDocumentId',old->'document'->>'documentId','affectedServiceIds',a->'affectedServiceIds','affectedRecipientId',a->>'affectedRecipientId','affectedAmount',a->>'affectedAmount','requiresReview',true,'requiresLink',true));
   end if;
   rev:=rev+1;state:=state||jsonb_build_object('revision',rev);
   insert into crm_private.b05_invoice_revisions values(iid,rev,s,op,action,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'reason',a->>'sourceRef',at_time,clock_timestamp());
  end if;
  r:=jsonb_build_object('id',iid,'replayed',false,'result',state);
  insert into crm_private.b05_invoice_operations values(op,iid,s,actor,fp,r,rev,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.invoice_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;s text;r jsonb;iid uuid;bid uuid;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'INVOICE_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H3-INVOICE-READ1' then raise exception 'INVOICE_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or a-array['invoiceId','bookingId']<>'{}'::jsonb or not coalesce(crm_private.invoice_text(a->'invoiceId'),false) or not coalesce(crm_private.invoice_text(a->'bookingId'),false) then raise exception 'INVOICE_INPUT_INVALID';end if;
 iid:=(a->>'invoiceId')::uuid;bid:=(a->>'bookingId')::uuid;s:=hf[17];
 select after_data into r from crm_private.b05_invoice_revisions v join crm_private.b05_provider_invoices i using(invoice_id) where i.invoice_id=iid and i.booking_id=bid and i.admin_scope=s and v.admin_scope=s order by v.revision desc limit 1;
 if r is not null then r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action_kind,'before',before_data,'after',after_data,'actorId',actor_id,'reason',reason,'sourceRef',source_ref,'evidenceId',evidence_id,'at',occurred_at,'recordedAt',recorded_at) order by revision) from crm_private.b05_invoice_revisions where invoice_id=iid and admin_scope=s));end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
do $$declare f record;begin for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='crm_private' and p.proname in ('invoice_text','invoice_amount','invoice_services','invoice_original') loop
 execute 'alter function '||f.signature||' owner to crm_h0_f2_owner';execute 'revoke all on function '||f.signature||' from public';execute 'grant execute on function '||f.signature||' to crm_h0_f2_executor,crm_h0_migration';end loop;end$$;
do $$declare f text;begin foreach f in array array['invoice_apply','invoice_read'] loop
 execute 'alter function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor';execute 'revoke all on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) from public';execute 'grant execute on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime';end loop;end$$;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
