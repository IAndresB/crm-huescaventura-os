-- H4-001/002 only: configured rules, applied requirements, B07 links and explicit reviews.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'REQUIREMENT_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b07_document_rules(
 rule_id text not null,version text not null,admin_scope text not null,definition jsonb not null,
 evidence_id uuid not null references crm_private.b07_records(record_id),primary key(admin_scope,rule_id,version)
);
create table crm_private.b07_requirements(
 requirement_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),admin_scope text not null,
 initial_basis jsonb not null,initial_operation_id uuid not null
);
create table crm_private.b07_requirement_operations(
 operation_id uuid primary key,requirement_id uuid not null references crm_private.b07_requirements(requirement_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,result jsonb not null,result_revision bigint not null,
 recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b07_requirement_revisions(
 requirement_id uuid not null references crm_private.b07_requirements(requirement_id),revision bigint not null check(revision>0),admin_scope text not null,
 operation_id uuid not null unique references crm_private.b07_requirement_operations(operation_id) deferrable initially deferred,
 action_kind text not null check(action_kind in ('need','receive','review','no_apply','change')),event jsonb not null,before_data jsonb,after_data jsonb not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),evidence_id uuid not null references crm_private.b07_records(record_id),
 source_ref text not null,reason text not null,occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(requirement_id,revision)
);
create table crm_private.b07_requirement_documents(
 requirement_id uuid not null references crm_private.b07_requirements(requirement_id),document_id uuid not null references crm_private.b07_records(record_id),
 object_version_id uuid references crm_private.b07_object_versions(version_id),admin_scope text not null,material jsonb not null,
 operation_id uuid not null references crm_private.b07_requirement_operations(operation_id) deferrable initially deferred,
 primary key(requirement_id,document_id)
);
alter table crm_private.b07_requirements add foreign key(initial_operation_id) references crm_private.b07_requirement_operations(operation_id) deferrable initially deferred;
alter table crm_private.b07_requirement_operations add foreign key(requirement_id,result_revision) references crm_private.b07_requirement_revisions(requirement_id,revision) deferrable initially deferred;
create index requirement_booking on crm_private.b07_requirements(admin_scope,booking_id);
do $$declare t text;r text;begin foreach t in array array['b07_document_rules','b07_requirements','b07_requirement_operations','b07_requirement_revisions','b07_requirement_documents'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy requirement_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy requirement_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger requirement_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
create function crm_private.requirement_scope(x jsonb,bid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
begin
 if jsonb_typeof(x) is distinct from 'object' or x-array['action','serviceId','nightId','participantId']<>'{}'::jsonb or not coalesce(crm_private.invoice_text(x->'action'),false) then return false;end if;
 if x?'serviceId' and (not coalesce(crm_private.invoice_text(x->'serviceId'),false) or not exists(select 1 from crm_private.b04_services where service_id=(x->>'serviceId')::uuid and booking_id=bid and admin_scope=s)) then return false;end if;
 if x?'nightId' and (not(x?'serviceId') or not exists(select 1 from crm_private.b04_nights where night_id=(x->>'nightId')::uuid and service_id=(x->>'serviceId')::uuid and admin_scope=s)) then return false;end if;
 if x?'participantId' and (not(x?'serviceId') or not exists(select 1 from crm_private.b04_assignments a join crm_private.b04_participants p using(participant_id) where a.participant_id=(x->>'participantId')::uuid and a.service_id=(x->>'serviceId')::uuid and a.night_id is not distinct from nullif(x->>'nightId','')::uuid and p.booking_id=bid and a.admin_scope=s and p.admin_scope=s)) then return false;end if;
 return true;
end$$;
create function crm_private.requirement_basis(x jsonb,bid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare r jsonb;c jsonb;k text;begin
 if jsonb_typeof(x) is distinct from 'object' or x-array['rule','scope','context']<>'{}'::jsonb or not(x ?& array['rule','scope','context']) or not crm_private.requirement_scope(x->'scope',bid,s) then return false;end if;
 r:=x->'rule';c:=x->'context';
 if jsonb_typeof(r) is distinct from 'object' or r-array['id','version','sourceRef','purpose','documentType','scopeKind','indispensable','conditionKey','equals','requiredFields']<>'{}'::jsonb
 or not(r ?& array['id','version','sourceRef','purpose','documentType','scopeKind','indispensable','conditionKey','equals','requiredFields'])
 or exists(select 1 from unnest(array['id','version','sourceRef','purpose','documentType','scopeKind','conditionKey','equals']) f where not coalesce(crm_private.invoice_text(r->f),false))
 or jsonb_typeof(r->'indispensable') is distinct from 'boolean' or jsonb_typeof(r->'requiredFields') is distinct from 'array'
 or exists(select 1 from jsonb_array_elements(r->'requiredFields') f where not coalesce(crm_private.invoice_text(f),false))
 or (select count(distinct value) from jsonb_array_elements(r->'requiredFields'))<>jsonb_array_length(r->'requiredFields') then return false;end if;
 k:=case when x->'scope'?'participantId' then 'participant' when x->'scope'?'nightId' then 'night' when x->'scope'?'serviceId' then 'service' else 'booking' end;
 if r->>'scopeKind'<>k or jsonb_typeof(c) is distinct from 'object' or c-array['conditionKey','value','sourceRef','version']<>'{}'::jsonb
 or not(c ?& array['conditionKey','value','sourceRef','version']) or exists(select 1 from unnest(array['conditionKey','value','sourceRef','version']) f where not coalesce(crm_private.invoice_text(c->f),false)) or c->>'conditionKey'<>r->>'conditionKey' then return false;end if;
 return true;
end$$;
create function crm_private.requirement_original(x jsonb,bid uuid,s text,previous uuid) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare d crm_private.b07_records;o crm_private.b07_object_versions;c jsonb;begin
 if jsonb_typeof(x) is distinct from 'object' or x-array['documentId','objectVersionId','ruleVersion','purpose','coverage']<>'{}'::jsonb or not(x ?& array['documentId','objectVersionId','ruleVersion','purpose','coverage'])
 or exists(select 1 from unnest(array['documentId','ruleVersion','purpose']) f where not coalesce(crm_private.invoice_text(x->f),false))
 or jsonb_typeof(x->'coverage') is distinct from 'array' or jsonb_array_length(x->'coverage')=0 then raise exception 'REQUIREMENT_DOCUMENT_REQUIRED:E3';end if;
 for c in select value from jsonb_array_elements(x->'coverage') loop if not crm_private.requirement_scope(c,bid,s) then raise exception 'REQUIREMENT_DENIED';end if;end loop;
 select * into d from crm_private.b07_records where record_id=(x->>'documentId')::uuid and admin_scope=s and record_kind='document';
 if not found or d.material->>'relation'<>'original' or d.corrects_id is distinct from previous or not exists(select 1 from crm_private.b07_links where record_id=d.record_id and context_kind='booking' and context_id=bid and admin_scope=s) then raise exception 'REQUIREMENT_ORIGINAL_REQUIRED:E3';end if;
 if x->'objectVersionId'<>'null'::jsonb then
  select * into o from crm_private.b07_object_versions where version_id=(x->>'objectVersionId')::uuid and document_id=d.record_id and admin_scope=s and state='stored';
  if not found then raise exception 'REQUIREMENT_ORIGINAL_REQUIRED:E3';end if;
 elsif d.material->>'content_kind'<>'manual_record' then raise exception 'REQUIREMENT_ORIGINAL_REQUIRED:E3';end if;
 return x||jsonb_build_object('provenance',jsonb_build_object('sourceRef',d.source_ref,'actorId',d.recorded_by,'recordedAt',d.recorded_at,'digest',o.expected_digest,'version',o.version_number));
end$$;
create function crm_api.requirement_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;op uuid;iid uuid;bid uuid;actor uuid;s text;action text;fp text;proofhash text;rev bigint;at_time timestamptz;
 prev crm_private.b07_requirement_operations;root crm_private.b07_requirements;basis jsonb;old jsonb;state jsonb;r jsonb;d jsonb;rule jsonb;stored jsonb;diffs jsonb;previous uuid;equivalent uuid;event_material jsonb;last_event jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'REQUIREMENT_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-REQUIREMENT1' then raise exception 'REQUIREMENT_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a ?& array['action','operationId','requirementId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId'])
 or exists(select 1 from unnest(array['action','operationId','requirementId','bookingId','sourceRef','reason','at','evidenceId']) k where not coalesce(crm_private.invoice_text(a->k),false))
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision' !~ '^(0|[1-9][0-9]*)$'
 or coalesce(a->>'origin','manual')<>'manual' or a->>'action' not in ('need','receive','review','no_apply','change')
 or a->>'at' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'REQUIREMENT_INPUT_INVALID';end if;
 action:=a->>'action';
 if a-array['action','operationId','requirementId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','origin']-
 (case action when 'need' then array['basis'] when 'receive' then array['document'] when 'review' then array['checks'] when 'no_apply' then array['context'] else array['basis','document','discrepancy'] end)<>'{}'::jsonb then raise exception 'REQUIREMENT_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;iid:=(a->>'requirementId')::uuid;bid:=(a->>'bookingId')::uuid;actor:=hf[12]::uuid;s:=hf[17];at_time:=(a->>'at')::timestamptz;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s) then raise exception 'REQUIREMENT_DENIED';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('requirement-op:'||op,0));
 select * into prev from crm_private.b07_requirement_operations where operation_id=op;
 if found then
  if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'REQUIREMENT_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  proofhash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.payment_evidence((a->>'evidenceId')::uuid,iid,s,'requirement:'||action||':'||proofhash,at_time,true)
  or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'REQUIREMENT_EVIDENCE_REQUIRED:E3';end if;
  -- Serialize equivalent needs, scope moves and reviews together even before children exist.
  perform pg_advisory_xact_lock(hashtextextended('requirement-booking:'||bid,0));
  select * into root from crm_private.b07_requirements where requirement_id=iid and booking_id=bid and admin_scope=s;
  if found then select revision,after_data,event into rev,old,last_event from crm_private.b07_requirement_revisions where requirement_id=iid order by revision desc limit 1;end if;
  if action='need' then
   basis:=a->'basis';if not crm_private.requirement_basis(basis,bid,s) or (a->>'expectedRevision')::bigint<>0 then raise exception 'REQUIREMENT_BASIS_REQUIRED:E3';end if;
   select i.requirement_id into equivalent from crm_private.b07_requirements i cross join lateral (select after_data from crm_private.b07_requirement_revisions v where v.requirement_id=i.requirement_id order by revision desc limit 1) v where i.booking_id=bid and i.admin_scope=s and v.after_data->'basis'->'rule'->>'id'=basis->'rule'->>'id' and v.after_data->'basis'->'scope'=basis->'scope' and v.after_data->'basis'->'rule'->>'purpose'=basis->'rule'->>'purpose';
   if equivalent is not null then
    select revision,after_data into rev,state from crm_private.b07_requirement_revisions where requirement_id=equivalent order by revision desc limit 1;
    if state->'basis' is distinct from basis then raise exception 'REQUIREMENT_NEED_CONFLICT:E2';end if;iid:=equivalent;
   else
    if root.requirement_id is not null or exists(select 1 from crm_private.b07_requirements where requirement_id=iid) then raise exception 'REQUIREMENT_DENIED';end if;
    state:=jsonb_build_object('id',iid,'bookingId',bid,'revision',1,'basis',basis,'document',null,'review',null,'incident',null,'status',case when basis->'context'->>'value'=basis->'rule'->>'equals' then 'Pendiente' else 'No aplica' end);rev:=1;
    insert into crm_private.b07_requirements values(iid,bid,s,basis,op);
   end if;
  else
   if root.requirement_id is null then raise exception 'REQUIREMENT_DENIED';end if;
   if rev<>(a->>'expectedRevision')::bigint then raise exception 'REQUIREMENT_REVISION_CONFLICT:E2';end if;
   basis:=old->'basis';state:=old;
   if action='receive' then
    d:=crm_private.requirement_original(a->'document',bid,s,null);
    if old->'document'=d then state:=old;
    elsif old->>'status'<>'Pendiente' then raise exception 'REQUIREMENT_TRANSITION_INVALID';
    else state:=state||jsonb_build_object('document',d,'status','Recibido','review',null);end if;
   elsif action='review' then
    if old->>'status' not in ('Recibido','Incidencia','Revisado') or old->'document'='null'::jsonb or jsonb_typeof(a->'checks') is distinct from 'object' or (a->'checks')-array['content','version','scope','purpose']<>'{}'::jsonb or not(a->'checks' ?& array['content','version','scope','purpose']) or exists(select 1 from jsonb_each(a->'checks') c where jsonb_typeof(c.value)<>'boolean') then raise exception 'REQUIREMENT_REVIEW_REQUIRED:E3';end if;
    if old->>'status'='Revisado' then
     if a->'checks' is distinct from last_event->'checks' then raise exception 'REQUIREMENT_TRANSITION_INVALID';end if;
    else
     diffs:='[]';if a->'checks'->'content'<>'true' then diffs:=diffs||'"content"'::jsonb;end if;
     if a->'checks'->'version'<>'true' or old->'document'->>'ruleVersion'<>basis->'rule'->>'version' then diffs:=diffs||'"version"'::jsonb;end if;
     if a->'checks'->'scope'<>'true' or not(old->'document'->'coverage' @> jsonb_build_array(basis->'scope')) then diffs:=diffs||'"scope"'::jsonb;end if;
     if a->'checks'->'purpose'<>'true' or old->'document'->>'purpose'<>basis->'rule'->>'purpose' then diffs:=diffs||'"purpose"'::jsonb;end if;
     state:=state||jsonb_build_object('status',case when diffs='[]'::jsonb then 'Revisado' else 'Incidencia' end,'review',jsonb_build_object('actorId',actor,'at',a->>'at','evidenceId',a->>'evidenceId','basis',basis,'document',old->'document','checks',a->'checks','differences',diffs),'incident',case when diffs='[]'::jsonb then null else jsonb_build_object('differences',diffs,'reason',a->>'reason','sourceRef',a->>'sourceRef') end);
     if old->>'status'='Incidencia' and old->'review'->'checks'=a->'checks' and old->'review'->'differences'=diffs then state:=old;end if;
    end if;
   elsif action='no_apply' then
    basis:=basis||jsonb_build_object('context',a->'context');
    if not crm_private.requirement_basis(basis,bid,s) or basis->'context'->>'value'=basis->'rule'->>'equals' then raise exception 'REQUIREMENT_NOT_APPLICABLE_REQUIRED';end if;
    state:=state||jsonb_build_object('basis',basis,'status','No aplica');
   else
    if old->>'status' not in ('Revisado','No aplica') then raise exception 'REQUIREMENT_TRANSITION_INVALID';end if;
    basis:=a->'basis';if not crm_private.requirement_basis(basis,bid,s) or basis->'rule'->>'id'<>old->'basis'->'rule'->>'id' or basis->'rule'->>'purpose'<>old->'basis'->'rule'->>'purpose' or (basis=old->'basis' and not(a?'document') and not(a?'discrepancy')) then raise exception 'REQUIREMENT_MATERIAL_CHANGE_REQUIRED';end if;
    if basis->'context'->>'value'<>basis->'rule'->>'equals' then raise exception 'REQUIREMENT_NOT_APPLICABLE_REQUIRED';end if;
    if a?'document' and a->'document'<>'null'::jsonb then
     previous:=case when a->'document'->>'documentId' is distinct from old->'document'->>'documentId' then (old->'document'->>'documentId')::uuid else null end;
     d:=crm_private.requirement_original(a->'document',bid,s,previous);
    else d:='null';end if;
    if a?'discrepancy' and not coalesce(crm_private.invoice_text(a->'discrepancy'),false) then raise exception 'REQUIREMENT_MATERIAL_CHANGE_REQUIRED';end if;
    if exists(select 1 from crm_private.b07_requirements i cross join lateral (select after_data from crm_private.b07_requirement_revisions v where v.requirement_id=i.requirement_id order by revision desc limit 1) v where i.booking_id=bid and i.admin_scope=s and i.requirement_id<>iid and v.after_data->'basis'->'rule'->>'id'=basis->'rule'->>'id' and v.after_data->'basis'->'scope'=basis->'scope' and v.after_data->'basis'->'rule'->>'purpose'=basis->'rule'->>'purpose') then raise exception 'REQUIREMENT_NEED_CONFLICT:E2';end if;
    state:=state||jsonb_build_object('basis',basis,'document',d,'review',null,'status',case when a?'discrepancy' then 'Incidencia' when d='null'::jsonb then 'Pendiente' else 'Recibido' end,'incident',case when a?'discrepancy' then jsonb_build_object('differences',jsonb_build_array(a->>'discrepancy'),'reason',a->>'reason','sourceRef',a->>'sourceRef') else null end);
   end if;
  end if;
  rule:=basis->'rule';select definition into stored from crm_private.b07_document_rules where admin_scope=s and rule_id=rule->>'id' and version=rule->>'version';
  if stored is not null and stored<>rule then raise exception 'REQUIREMENT_RULE_VERSION_CONFLICT:E2';end if;
  if stored is null then insert into crm_private.b07_document_rules values(rule->>'id',rule->>'version',s,rule,(a->>'evidenceId')::uuid);end if;
  if (action='need' and equivalent is null) or (action<>'need' and state is distinct from old) then
   if action<>'need' then rev:=rev+1;state:=state||jsonb_build_object('revision',rev);end if;
   if state->'document'<>'null'::jsonb then
    d:=state->'document';select material into stored from crm_private.b07_requirement_documents where requirement_id=iid and document_id=(d->>'documentId')::uuid;
    if stored is not null and stored<>d then raise exception 'REQUIREMENT_DOCUMENT_CONFLICT:E2';end if;
    if stored is null then insert into crm_private.b07_requirement_documents values(iid,(d->>'documentId')::uuid,(d->>'objectVersionId')::uuid,s,d,op);end if;
   end if;
   insert into crm_private.b07_requirement_revisions values(iid,rev,s,op,action,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());
  end if;
  r:=jsonb_build_object('id',iid,'replayed',state=old or equivalent is not null,'result',state);
  insert into crm_private.b07_requirement_operations values(op,iid,s,actor,fp,r,rev,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.requirement_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;s text;bid uuid;iid uuid;r jsonb;pending jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'REQUIREMENT_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-REQUIREMENT-READ1' then raise exception 'REQUIREMENT_INPUT_INVALID';end if;a:=fs[2]::jsonb;s:=hf[17];bid:=(a->>'bookingId')::uuid;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s) then r:=null;
 elsif a?'requirementId' then
  if a-array['requirementId','bookingId']<>'{}'::jsonb then raise exception 'REQUIREMENT_INPUT_INVALID';end if;iid:=(a->>'requirementId')::uuid;
  select after_data into r from crm_private.b07_requirement_revisions v join crm_private.b07_requirements i using(requirement_id) where i.requirement_id=iid and i.booking_id=bid and i.admin_scope=s and v.admin_scope=s order by v.revision desc limit 1;
  if r is not null then r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action_kind,'before',before_data,'after',after_data,'actorId',actor_id,'reason',reason,'sourceRef',source_ref,'evidenceId',evidence_id,'at',occurred_at,'recordedAt',recorded_at) order by revision) from crm_private.b07_requirement_revisions where requirement_id=iid and admin_scope=s));end if;
 else
  if a-array['bookingId','scope','purpose']<>'{}'::jsonb or not crm_private.requirement_scope(a->'scope',bid,s) or not coalesce(crm_private.invoice_text(a->'purpose'),false) then raise exception 'REQUIREMENT_INPUT_INVALID';end if;
  select coalesce(jsonb_agg(jsonb_build_object('requirementId',i.requirement_id,'scope',v.after_data->'basis'->'scope','missing',case v.after_data->>'status' when 'Pendiente' then 'document' when 'Recibido' then 'review' else 'compliance' end)),'[]') into pending from crm_private.b07_requirements i cross join lateral (select after_data from crm_private.b07_requirement_revisions v where v.requirement_id=i.requirement_id order by revision desc limit 1) v where i.booking_id=bid and i.admin_scope=s and v.after_data->'basis'->'rule'->>'purpose'=a->>'purpose' and v.after_data->'basis'->'scope'=a->'scope' and v.after_data->'basis'->'rule'->'indispensable'='true'::jsonb and v.after_data->>'status' not in ('Revisado','No aplica');
  r:=jsonb_build_object('allowed',pending='[]'::jsonb,'pending',pending);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
do $$declare f record;begin for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='crm_private' and p.proname in ('requirement_scope','requirement_basis','requirement_original') loop
 execute 'alter function '||f.signature||' owner to crm_h0_f2_owner';execute 'revoke all on function '||f.signature||' from public';execute 'grant execute on function '||f.signature||' to crm_h0_f2_executor,crm_h0_migration';end loop;end$$;
do $$declare f text;begin foreach f in array array['requirement_apply','requirement_read'] loop
 execute 'alter function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor';execute 'revoke all on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) from public';execute 'grant execute on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime';end loop;end$$;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
