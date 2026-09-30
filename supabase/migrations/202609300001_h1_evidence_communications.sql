-- H1-013: immutable local B07 records and context links. No Storage objects or connectors.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'B07_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;
grant usage, create on schema crm_private to crm_h0_f2_owner;
grant usage, create on schema crm_api to crm_h0_f2_executor;

create table crm_private.b07_records (
  record_id uuid primary key,
  record_kind text not null check (record_kind in
    ('document','evidence','communication','communication_fact',
     'integration_source','external_reference','external_event')),
  admin_scope text not null check (admin_scope<>''),
  material jsonb not null check (jsonb_typeof(material)='object'),
  source_ref text not null check (source_ref<>''),
  purpose text not null check (purpose<>''),
  occurred_at timestamptz,
  recorded_at timestamptz not null default clock_timestamp(),
  recorded_by uuid not null references crm_private.crm_actors(actor_id),
  original_id uuid references crm_private.b07_records(record_id),
  corrects_id uuid references crm_private.b07_records(record_id),
  check (original_id is null or original_id<>record_id),
  check (corrects_id is null or corrects_id<>record_id)
);
create table crm_private.b07_links (
  link_id uuid primary key,
  record_id uuid not null references crm_private.b07_records(record_id),
  admin_scope text not null check (admin_scope<>''),
  context_kind text not null check (context_kind in
    ('contact','organization','opportunity','booking','booking_service','provider','proposal','other')),
  context_id uuid not null,
  coverage text not null check (coverage<>''),
  source_ref text not null check (source_ref<>''),
  linked_by uuid not null references crm_private.crm_actors(actor_id),
  linked_at timestamptz not null default clock_timestamp(),
  unique(record_id,context_kind,context_id)
);
create index b07_links_context on crm_private.b07_links(admin_scope,context_kind,context_id);
create unique index b07_fact_proof_per_communication on crm_private.b07_records
  (original_id,(material->>'evidence_id')) where record_kind='communication_fact';
create table crm_private.b07_operations (
  operation_id uuid primary key,
  admin_scope text not null,
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  fingerprint text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
  result_ref uuid not null,
  recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b07_history (
  history_id uuid primary key,
  operation_id uuid not null unique references crm_private.b07_operations(operation_id),
  subject_id uuid not null,
  admin_scope text not null,
  action_kind text not null,
  before_state jsonb,
  after_state jsonb not null,
  reason text not null,
  source_ref text not null,
  occurred_at timestamptz,
  recorded_at timestamptz not null default clock_timestamp(),
  actor_id uuid not null references crm_private.crm_actors(actor_id)
);
do $$ declare t text; begin
  foreach t in array array['b07_records','b07_links','b07_operations','b07_history'] loop
    execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
    execute format('alter table crm_private.%I enable row level security',t);
    execute format('alter table crm_private.%I force row level security',t);
    execute format('create policy b07_executor on crm_private.%I for all to crm_h0_f2_executor using (true) with check (true)',t);
    execute format('create policy b07_migration on crm_private.%I for all to crm_h0_migration using (true) with check (true)',t);
    execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor',t);
    execute format('grant select,insert on crm_private.%I to crm_h0_migration',t);
    execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
    if exists(select 1 from pg_roles where rolname='anon') then
      execute format('revoke all on crm_private.%I from anon',t);
    end if;
    if exists(select 1 from pg_roles where rolname='authenticated') then
      execute format('revoke all on crm_private.%I from authenticated',t);
    end if;
  end loop;
end $$;

-- Add a narrow evidence resource to the existing F1/F2 partitions.
do $patch$
declare definition text; old_text text; new_text text;
begin
  definition:=pg_get_functiondef('crm_f1.verify_envelope(bytea,bytea,bytea,text,text,text)'::regprocedure);
  old_text:=$old$(f[13]='h1-catalog' and f[16]='catalog'
            and ((f[15]='C01' and f[17]='read_catalog')
              or (f[15]='C03' and f[17]='write_catalog')))$old$;
  new_text:=$new$((f[13]='h1-catalog' and f[16]='catalog'
            and ((f[15]='C01' and f[17]='read_catalog')
              or (f[15]='C03' and f[17]='write_catalog')))
          or (f[13]='h1-evidence' and f[16]='evidence'
            and ((f[15]='C01' and f[17]='read_evidence')
              or (f[15]='C03' and f[17]='write_evidence'))))$new$;
  if length(definition)-length(replace(definition,old_text,''))<>length(old_text) then
    raise exception 'B07_F1_PREDECESSOR_MISMATCH'; end if;
  execute replace(definition,old_text,new_text);
  definition:=pg_get_functiondef('crm_f2.verify(bytea,bytea,bytea,text,text,text)'::regprocedure);
  old_text:=$old$or (session_user='crm_h0_runtime' and f[19]='human_catalog'
          and ((f[18]='C01' and f[20]='read_catalog') or (f[18]='C03' and f[20]='write_catalog')))$old$;
  new_text:=$new$or (session_user='crm_h0_runtime' and f[19]='human_catalog'
          and ((f[18]='C01' and f[20]='read_catalog') or (f[18]='C03' and f[20]='write_catalog')))
        or (session_user='crm_h0_runtime' and f[19]='human_evidence'
          and ((f[18]='C01' and f[20]='read_evidence') or (f[18]='C03' and f[20]='write_evidence')))$new$;
  if length(definition)-length(replace(definition,old_text,''))<>length(old_text) then
    raise exception 'B07_F2_PREDECESSOR_MISMATCH'; end if;
  execute replace(definition,old_text,new_text);
  definition:=pg_get_functiondef('crm_f2.admit(bytea,bytea,bytea,text,text)'::regprocedure);
  old_text:=$old$case when expected_action in ('read_catalog','write_catalog')
      then 'human_catalog' when expected_action in ('read_identity','write_identity')$old$;
  new_text:=$new$case when expected_action in ('read_evidence','write_evidence')
      then 'human_evidence' when expected_action in ('read_catalog','write_catalog')
      then 'human_catalog' when expected_action in ('read_identity','write_identity')$new$;
  if length(definition)-length(replace(definition,old_text,''))<>3*length(old_text) then
    raise exception 'B07_ADMIT_PREDECESSOR_MISMATCH'; end if;
  execute replace(definition,old_text,new_text);
end $patch$;

create function crm_private.b07_material_valid(k text,m jsonb,o uuid,t timestamptz)
returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
begin
  if jsonb_typeof(m)<>'object' or m='{}'::jsonb then return false; end if;
  if k='document' then
    if m - 'relation' - 'content_ref' - 'content_kind' - 'author_ref' - 'review_ref'
      - 'storage_state' <> '{}'::jsonb
      or coalesce(m->>'relation','') not in ('original','derived')
      or nullif(m->>'content_ref','') is null or nullif(m->>'content_kind','') is null
      or coalesce(m->>'storage_state','')<>'reference_only'
      or (m->>'relation'='derived')<>(o is not null) then return false; end if;
    return true;
  elsif k='evidence' then
    if m - 'claim' - 'coverage' - 'certainty' - 'source_kind' - 'document_id' - 'channel' <> '{}'::jsonb
      or nullif(m->>'claim','') is null or nullif(m->>'coverage','') is null
      or coalesce(m->>'certainty','') not in ('candidate','reviewed')
      or coalesce(m->>'source_kind','') not in ('manual','document','communication','external')
      or ((m->>'source_kind'='document')<>(m ? 'document_id'))
      or o is not null or t is null then return false; end if;
    return true;
  elsif k='communication' then
    return m - 'direction' - 'channel' - 'sender_ref' - 'recipient_ref' - 'coverage'
      - 'initial_fact'
      - 'authorization_ref' - 'proposal_version_ref' = '{}'::jsonb
      and m->>'direction' in ('incoming','outgoing')
      and m->>'initial_fact'=case when m->>'direction'='incoming' then 'received' else 'none' end
      and nullif(m->>'channel','') is not null and nullif(m->>'coverage','') is not null
      and (m->>'direction'='incoming' or nullif(m->>'recipient_ref','') is not null)
      and o is null and t is not null;
  elsif k='communication_fact' then
    return m - 'fact_kind' - 'evidence_id' - 'party_ref' - 'coverage' = '{}'::jsonb
      and m->>'fact_kind' in ('sent','received','response')
      and nullif(m->>'evidence_id','') is not null
      and nullif(m->>'party_ref','') is not null
      and nullif(m->>'coverage','') is not null and o is not null and t is not null;
  elsif k='integration_source' then
    return m - 'source_kind' - 'label' = '{}'::jsonb
      and nullif(m->>'source_kind','') is not null and nullif(m->>'label','') is not null
      and o is null;
  elsif k='external_reference' then
    return m - 'source_id' - 'external_key' - 'coverage' = '{}'::jsonb
      and nullif(m->>'source_id','') is not null and nullif(m->>'external_key','') is not null
      and nullif(m->>'coverage','') is not null and o is null;
  elsif k='external_event' then
    return m - 'source_id' - 'external_key' - 'coverage' - 'review_state' = '{}'::jsonb
      and nullif(m->>'source_id','') is not null and nullif(m->>'coverage','') is not null
      and m->>'review_state'='pending' and o is null and t is not null;
  end if;
  return false;
end $$;
alter function crm_private.b07_material_valid(text,jsonb,uuid,timestamptz) owner to crm_h0_f2_owner;
revoke execute on function crm_private.b07_material_valid(text,jsonb,uuid,timestamptz) from public;
grant execute on function crm_private.b07_material_valid(text,jsonb,uuid,timestamptz) to crm_h0_f2_executor;

-- Vector: magic, action, operation, target, kind, material JSON, source, purpose,
-- occurred_at, original_id, corrects_id, context_kind, context_id, reason, link coverage.
create function crm_api.b07_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(result_ref uuid,replayed boolean)
language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];op crm_private.b07_operations%rowtype;
  parent crm_private.b07_records%rowtype; related crm_private.b07_records%rowtype;
  actor uuid;scope text;target uuid;original uuid;corrects uuid;target_context uuid;
  payload_data jsonb;prior_state jsonb;after_state jsonb;fingerprint text;occurred timestamptz;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'B07_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>15 or v[1]<>'CRM-H1-B07-1' or v[2] not in ('create','link')
    or v[7]='' or v[8]='' or v[14]='' or v[15]='' or v[12] not in
      ('contact','organization','opportunity','booking','booking_service','provider','proposal','other')
  then raise exception 'B07_INPUT_INVALID' using errcode='22023'; end if;
  target:=v[4]::uuid;target_context:=v[13]::uuid;
  original:=nullif(v[10],'')::uuid;corrects:=nullif(v[11],'')::uuid;
  occurred:=nullif(v[9],'')::timestamptz;payload_data:=v[6]::jsonb;
  actor:=hf[12]::uuid;scope:=hf[17];
  fingerprint:=encode(crm_crypto.digest(q,'sha256'),'hex');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v[3],0));
  select * into op from crm_private.b07_operations where operation_id=v[3]::uuid;
  if found then
    if op.admin_scope<>scope or op.actor_id<>actor or op.fingerprint<>fingerprint then
      raise exception 'B07_REPLAY_CONFLICT' using errcode='23505'; end if;
    perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');
    result_ref:=op.result_ref;replayed:=true;return next;return;
  end if;
  if v[2]='create' then
    if v[5] not in ('document','evidence','communication','communication_fact',
       'integration_source','external_reference','external_event')
      or not coalesce(crm_private.b07_material_valid(v[5],payload_data,original,occurred),false) then
      raise exception 'B07_INPUT_INVALID' using errcode='22023'; end if;
    if original is not null then
      select * into parent from crm_private.b07_records where record_id=original;
      if not found or parent.admin_scope<>scope or not (
        (v[5]='document' and parent.record_kind='document') or
        (v[5]='communication_fact' and parent.record_kind='communication')) then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
      if v[5]='document' and parent.material->>'relation'<>'original' then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
      if not exists(select 1 from crm_private.b07_links l where l.record_id=original
        and l.admin_scope=scope and l.context_kind=v[12] and l.context_id=target_context) then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
      if v[5]='communication_fact' and (
        (payload_data->>'fact_kind'='sent' and parent.material->>'direction'<>'outgoing') or
        (payload_data->>'fact_kind'='received' and parent.material->>'direction'<>'outgoing') or
        (payload_data->>'fact_kind'='sent' and parent.material->>'recipient_ref' is distinct from payload_data->>'party_ref') or
        (payload_data->>'fact_kind'='sent' and v[12]='proposal' and
          (nullif(parent.material->>'proposal_version_ref','') is null or
           nullif(parent.material->>'authorization_ref','') is null))
      ) then raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
    end if;
    if corrects is not null then
      select * into related from crm_private.b07_records where record_id=corrects;
      if not found or related.admin_scope<>scope or related.record_kind<>v[5] then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
      if not exists(select 1 from crm_private.b07_links l where l.record_id=corrects
        and l.admin_scope=scope and l.context_kind=v[12] and l.context_id=target_context) then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
      prior_state:=to_jsonb(related);
    end if;
    if v[5]='evidence' and payload_data ? 'document_id' then
      select * into related from crm_private.b07_records
        where record_id=(payload_data->>'document_id')::uuid;
      if not found or related.admin_scope<>scope or related.record_kind<>'document' then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
      if not exists(select 1 from crm_private.b07_links l where l.record_id=related.record_id
        and l.admin_scope=scope and l.context_kind=v[12] and l.context_id=target_context) then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
    end if;
    if v[5]='communication_fact' then
      select * into related from crm_private.b07_records
        where record_id=(payload_data->>'evidence_id')::uuid;
      if not found or related.admin_scope<>scope or related.record_kind<>'evidence' then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
      if not exists(select 1 from crm_private.b07_links l where l.record_id=related.record_id
        and l.admin_scope=scope and l.context_kind=v[12] and l.context_id=target_context) then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
      if exists(select 1 from crm_private.b07_records r where r.record_kind='communication_fact'
        and r.original_id=original and r.material->>'evidence_id'=payload_data->>'evidence_id') then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
      if payload_data->>'fact_kind'='sent' and payload_data->>'coverage' is distinct from parent.material->>'coverage' then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
    end if;
    if v[5] in ('external_reference','external_event') then
      select * into related from crm_private.b07_records
        where record_id=(payload_data->>'source_id')::uuid;
      if not found or related.admin_scope<>scope or related.record_kind<>'integration_source' then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
      if not exists(select 1 from crm_private.b07_links l where l.record_id=related.record_id
        and l.admin_scope=scope and l.context_kind=v[12] and l.context_id=target_context) then
        raise exception 'B07_RELATION_INVALID' using errcode='22023'; end if;
    end if;
    insert into crm_private.b07_records(record_id,record_kind,admin_scope,material,source_ref,
      purpose,occurred_at,recorded_by,original_id,corrects_id)
      values(target,v[5],scope,payload_data,v[7],v[8],occurred,actor,original,corrects);
    insert into crm_private.b07_links(link_id,record_id,admin_scope,context_kind,context_id,
      coverage,source_ref,linked_by) values(v[3]::uuid,target,scope,v[12],target_context,v[15],v[7],actor);
    select jsonb_build_object('record',to_jsonb(r),'link',to_jsonb(l)) into after_state
      from crm_private.b07_records r join crm_private.b07_links l on l.record_id=r.record_id
      where r.record_id=target and l.link_id=v[3]::uuid;
  else
    if v[5]<>'' or payload_data<>'{}'::jsonb or v[9]<>'' or corrects is not null
      or original is null then raise exception 'B07_INPUT_INVALID' using errcode='22023'; end if;
    select * into parent from crm_private.b07_records where record_id=original;
    if not found or parent.admin_scope<>scope then
      raise exception 'B07_DENIED' using errcode='42501'; end if;
    insert into crm_private.b07_links(link_id,record_id,admin_scope,context_kind,context_id,
      coverage,source_ref,linked_by) values(target,original,scope,v[12],target_context,v[15],v[7],actor);
    select to_jsonb(l) into after_state from crm_private.b07_links l where link_id=target;
  end if;
  insert into crm_private.b07_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref)
    values(v[3]::uuid,scope,actor,fingerprint,target);
  insert into crm_private.b07_history(history_id,operation_id,subject_id,admin_scope,action_kind,
    before_state,after_state,reason,source_ref,occurred_at,actor_id)
    values(v[3]::uuid,v[3]::uuid,target,scope,v[2],prior_state,after_state,v[14],v[7],occurred,actor);
  perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
  result_ref:=target;replayed:=false;return next;
end $$;
alter function crm_api.b07_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.b07_apply(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.b07_apply(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

create function crm_api.b07_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];wanted_record uuid;wanted_context uuid;result jsonb;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'B07_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>4 or v[1]<>'CRM-H1-B07-READ1'
    or v[3] not in ('contact','organization','opportunity','booking','booking_service','provider','proposal','other')
  then raise exception 'B07_INPUT_INVALID' using errcode='22023'; end if;
  wanted_record:=v[2]::uuid;wanted_context:=v[4]::uuid;
  select jsonb_build_object('record',to_jsonb(r),
    'links',(select jsonb_agg(to_jsonb(l2) order by l2.linked_at,l2.link_id)
      from crm_private.b07_links l2 where l2.record_id=r.record_id
        and l2.admin_scope=hf[17] and l2.context_kind=v[3] and l2.context_id=wanted_context))
    into result from crm_private.b07_records r
    join crm_private.b07_links l on l.record_id=r.record_id
    where r.record_id=wanted_record and r.admin_scope=hf[17]
      and l.admin_scope=hf[17] and l.context_kind=v[3] and l.context_id=wanted_context;
  perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
  return result;
end $$;
alter function crm_api.b07_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.b07_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.b07_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
