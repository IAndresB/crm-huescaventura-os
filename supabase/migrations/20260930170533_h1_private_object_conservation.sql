-- H1-015: Core metadata and recoverable conservation; no hosted/Storage DDL.
begin;
do $$ begin if current_user<>'crm_h0_migration' then
 raise exception 'OBJECT_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501'; end if; end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b07_object_versions (
 version_id uuid primary key,
 root_id uuid not null,
 version_number integer not null check(version_number>0),
 predecessor_id uuid references crm_private.b07_object_versions(version_id),
 document_id uuid not null references crm_private.b07_records(record_id),
 admin_scope text not null,
 purpose text not null check(purpose<>''),
 source_ref text not null check(source_ref<>''),
 private_ref text not null unique check(private_ref ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}$'),
 expected_digest text not null check(expected_digest ~ '^[0-9a-f]{64}$'),
 expected_size bigint not null check(expected_size>=0),
 expected_media text not null check(expected_media<>''),
 observed_digest text,
 observed_size bigint,
 observed_media text,
 state text not null check(state in ('prepared','present_unverified','verified_unlinked','stored','missing','inconsistent')),
 revision bigint not null default 0 check(revision>=0),
 prepared_at timestamptz not null default clock_timestamp(),
 observed_at timestamptz,
 linked_at timestamptz,
 recorded_by uuid not null references crm_private.crm_actors(actor_id),
 unique(root_id,version_number),
 check((version_number=1)=(predecessor_id is null)),
 check(state not in ('verified_unlinked','stored') or
   (observed_digest=expected_digest and observed_size=expected_size and observed_media=expected_media))
);
create index b07_objects_document on crm_private.b07_object_versions(admin_scope,document_id);
create table crm_private.b07_evidence_object_bindings (
 evidence_id uuid primary key references crm_private.b07_records(record_id),
 version_id uuid not null references crm_private.b07_object_versions(version_id),
 admin_scope text not null,
 linked_by uuid not null references crm_private.crm_actors(actor_id),
 linked_at timestamptz not null default clock_timestamp()
);
create table crm_private.b07_object_orphans (
 private_ref text primary key,
 admin_scope text not null,
 state text not null check(state='needs_review'),
 source_ref text not null,
 recorded_by uuid not null references crm_private.crm_actors(actor_id),
 recorded_at timestamptz not null default clock_timestamp()
);
do $$ declare t text; begin
 foreach t in array array['b07_object_versions','b07_object_orphans','b07_evidence_object_bindings'] loop
  execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
  execute format('alter table crm_private.%I enable row level security',t);
  execute format('alter table crm_private.%I force row level security',t);
  execute format('create policy object_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
  execute format('create policy object_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
  execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor',t);
  if t='b07_object_versions' then execute format('grant update on crm_private.%I to crm_h0_f2_executor',t); end if;
  execute format('grant select,insert on crm_private.%I to crm_h0_migration',t);
  execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
  if exists(select 1 from pg_roles where rolname='anon') then execute format('revoke all on crm_private.%I from anon',t); end if;
  if exists(select 1 from pg_roles where rolname='authenticated') then execute format('revoke all on crm_private.%I from authenticated',t); end if;
 end loop;
end $$;

create function crm_api.b07_object_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(result_ref uuid,replayed boolean)
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];m jsonb;actor uuid;scope text;opid uuid;target uuid;
 fingerprint text;op crm_private.b07_operations%rowtype;
 old crm_private.b07_object_versions%rowtype;previous crm_private.b07_object_versions%rowtype;
 before_data jsonb;after_data jsonb;next_state text;root uuid;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');
 tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'OBJECT_DENIED' using errcode='42501'; end if;
 v:=crm_f1.fields(q);
 if cardinality(v)<>2 or v[1]<>'CRM-H1-OBJECT-1' then raise exception 'OBJECT_INPUT_INVALID'; end if;
 m:=v[2]::jsonb;actor:=hf[12]::uuid;scope:=hf[17];opid:=(m->>'operationId')::uuid;
 target:=(m->>'versionId')::uuid;
 -- expectedRevision is sampled by the server on each retry, not client material.
 fingerprint:=encode(crm_crypto.digest(convert_to((m-'expectedRevision')::text,'UTF8'),'sha256'),'hex');
 if nullif(m->>'reason','') is null or nullif(m->>'sourceRef','') is null or nullif(m->>'purpose','') is null then
  raise exception 'OBJECT_INPUT_INVALID'; end if;
 perform pg_advisory_xact_lock(hashtextextended(opid::text,0));
 select * into op from crm_private.b07_operations where operation_id=opid;
 if found then
  if op.admin_scope<>scope or op.actor_id<>actor or op.fingerprint<>fingerprint then raise exception 'OBJECT_REPLAY_CONFLICT'; end if;
  result_ref:=op.result_ref;replayed:=true;
 else
  if m->>'action'='orphan' then
   perform pg_advisory_xact_lock(hashtextextended(m->>'privateRef',1));
   if exists(select 1 from crm_private.b07_object_versions where private_ref=m->>'privateRef') then raise exception 'OBJECT_NOT_ORPHAN'; end if;
   insert into crm_private.b07_object_orphans(private_ref,admin_scope,state,source_ref,recorded_by)
    values(m->>'privateRef',scope,'needs_review',m->>'sourceRef',actor) on conflict do nothing;
   select to_jsonb(o) into after_data from crm_private.b07_object_orphans o where private_ref=m->>'privateRef' and admin_scope=scope;
   if after_data is null then raise exception 'OBJECT_DENIED'; end if;
  elsif m->>'action'='prepare' then
   root:=(m->>'rootId')::uuid;perform pg_advisory_xact_lock(hashtextextended(root::text,2));
   if not exists(select 1 from crm_private.b07_records r join crm_private.b07_links l on l.record_id=r.record_id
    where r.record_id=(m->>'documentId')::uuid and r.record_kind='document' and r.admin_scope=scope
     and l.admin_scope=scope and l.context_kind=m->>'contextKind' and l.context_id=(m->>'contextId')::uuid) then raise exception 'OBJECT_DENIED'; end if;
   if (m->>'expectedVersion')::integer=0 then
    if exists(select 1 from crm_private.b07_object_versions where root_id=root) then raise exception 'OBJECT_VERSION_CONFLICT'; end if;
   else
    select * into previous from crm_private.b07_object_versions where root_id=root and version_number=(m->>'expectedVersion')::integer;
    if not found or previous.admin_scope<>scope or previous.document_id<>(m->>'documentId')::uuid or
     previous.purpose<>m->>'purpose' or exists(select 1 from crm_private.b07_object_versions where root_id=root and version_number>previous.version_number) then raise exception 'OBJECT_VERSION_CONFLICT'; end if;
    before_data:=to_jsonb(previous);
   end if;
   insert into crm_private.b07_object_versions(version_id,root_id,version_number,predecessor_id,document_id,
    admin_scope,purpose,source_ref,private_ref,expected_digest,expected_size,expected_media,state,recorded_by)
   values(target,root,(m->>'expectedVersion')::integer+1,previous.version_id,(m->>'documentId')::uuid,
    scope,m->>'purpose',m->>'sourceRef',root::text||'/'||target::text,m->>'digest',(m->>'size')::bigint,m->>'media','prepared',actor);
   select to_jsonb(o) into after_data from crm_private.b07_object_versions o where version_id=target;
  else
   select * into old from crm_private.b07_object_versions where version_id=target for update;
   if not found or old.admin_scope<>scope or old.purpose<>m->>'purpose' or not exists(
    select 1 from crm_private.b07_links l where l.record_id=old.document_id and l.admin_scope=scope
     and l.context_kind=m->>'contextKind' and l.context_id=(m->>'contextId')::uuid) then raise exception 'OBJECT_DENIED'; end if;
   if old.revision<>(m->>'expectedRevision')::bigint then raise exception 'OBJECT_VERSION_CONFLICT'; end if;
   before_data:=to_jsonb(old);
   if m->>'action'='uploaded' then
    if old.state<>'prepared' and old.state<>'missing' then raise exception 'OBJECT_STATE_INVALID'; end if;
    update crm_private.b07_object_versions set state='present_unverified',revision=revision+1 where version_id=target;
   elsif m->>'action'='observe' then
    next_state:=case when m->>'presence'='missing' then 'missing'
     when m->>'presence'='present' and m->>'digest'=old.expected_digest and (m->>'size')::bigint=old.expected_size
      and m->>'media'=old.expected_media then case when old.linked_at is null then 'verified_unlinked' else 'stored' end
     when m->>'presence'='present' then 'inconsistent' else null end;
    if next_state is null then raise exception 'OBJECT_INPUT_INVALID'; end if;
    update crm_private.b07_object_versions set state=next_state,observed_digest=m->>'digest',
     observed_size=(m->>'size')::bigint,observed_media=m->>'media',observed_at=clock_timestamp(),revision=revision+1 where version_id=target;
   elsif m->>'action'='link' then
    if old.state not in ('verified_unlinked','stored') then raise exception 'OBJECT_STATE_INVALID'; end if;
    if m ? 'evidenceId' then
     if not exists(select 1 from crm_private.b07_records r join crm_private.b07_links l on l.record_id=r.record_id
      where r.record_id=(m->>'evidenceId')::uuid and r.record_kind='evidence' and r.admin_scope=scope
       and r.material->>'document_id'=old.document_id::text and l.admin_scope=scope
       and l.context_kind=m->>'contextKind' and l.context_id=(m->>'contextId')::uuid) then raise exception 'OBJECT_DENIED'; end if;
     if exists(select 1 from crm_private.b07_evidence_object_bindings b where b.evidence_id=(m->>'evidenceId')::uuid
      and b.version_id<>target) then raise exception 'OBJECT_HISTORICAL_BINDING_CONFLICT'; end if;
     insert into crm_private.b07_evidence_object_bindings(evidence_id,version_id,admin_scope,linked_by)
      values((m->>'evidenceId')::uuid,target,scope,actor) on conflict do nothing;
    end if;
    update crm_private.b07_object_versions set state='stored',linked_at=coalesce(linked_at,clock_timestamp()),revision=revision+1 where version_id=target;
   else raise exception 'OBJECT_INPUT_INVALID'; end if;
   select to_jsonb(o) into after_data from crm_private.b07_object_versions o where version_id=target;
  end if;
  if m->>'action'='link' and m ? 'evidenceId' then
   after_data:=after_data||jsonb_build_object('evidence_binding',
    (select to_jsonb(b) from crm_private.b07_evidence_object_bindings b where b.evidence_id=(m->>'evidenceId')::uuid));
  end if;
  insert into crm_private.b07_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref) values(opid,scope,actor,fingerprint,target);
  insert into crm_private.b07_history(history_id,operation_id,subject_id,admin_scope,action_kind,before_state,after_state,reason,source_ref,actor_id)
   values(opid,opid,target,scope,'object_'||(m->>'action'),before_data,after_data,m->>'reason',m->>'sourceRef',actor);
  result_ref:=target;replayed:=false;
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');
 perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 return next;
end $$;

create function crm_api.b07_object_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];m jsonb;result jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');
 tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'OBJECT_DENIED'; end if;
 v:=crm_f1.fields(q);if cardinality(v)<>2 or v[1]<>'CRM-H1-OBJECT-READ1' then raise exception 'OBJECT_INPUT_INVALID'; end if;
 m:=v[2]::jsonb;
 select to_jsonb(o)||jsonb_build_object('evidence_bindings',
  (select jsonb_agg(to_jsonb(b)) from crm_private.b07_evidence_object_bindings b where b.version_id=o.version_id
   and b.admin_scope=hf[17] and exists(select 1 from crm_private.b07_links el where el.record_id=b.evidence_id
    and el.admin_scope=hf[17] and el.context_kind=m->>'contextKind' and el.context_id=(m->>'contextId')::uuid)))
 into result from crm_private.b07_object_versions o
  where o.version_id=(m->>'versionId')::uuid and o.admin_scope=hf[17] and o.purpose=m->>'purpose'
   and exists(select 1 from crm_private.b07_links l where l.record_id=o.document_id and l.admin_scope=hf[17]
    and l.context_kind=m->>'contextKind' and l.context_id=(m->>'contextId')::uuid);
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');
 perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return result;
end $$;
alter function crm_api.b07_object_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
alter function crm_api.b07_object_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.b07_object_apply(bytea,bytea,bytea,bytea,bytea) from public;
revoke all on function crm_api.b07_object_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.b07_object_apply(bytea,bytea,bytea,bytea,bytea),
 crm_api.b07_object_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
