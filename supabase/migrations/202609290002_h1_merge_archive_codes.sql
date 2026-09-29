-- H1-003: human identity resolution and append-only annual code ledger.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H1_RESOLUTION_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;
grant usage, create on schema crm_private to crm_h0_f2_owner;
grant usage, create on schema crm_api to crm_h0_f2_executor;

alter table crm_private.identity_entities
  add column archived_at timestamptz,
  add column merged_into_id uuid references crm_private.identity_entities(identity_id);
alter table crm_private.identity_entities
  add constraint identity_no_self_merge check (merged_into_id is null or merged_into_id <> identity_id),
  add constraint identity_merge_archived check (merged_into_id is null or archived_at is not null);
grant update(archived_at,merged_into_id,version,updated_at)
  on crm_private.identity_entities to crm_h0_f2_executor;

-- Existing links remain historical; new links cannot point at archived parties.
create function crm_private.reject_archived_identity_link()
returns trigger language plpgsql volatile security invoker
set search_path = pg_catalog, pg_temp as $$
begin
  if TG_TABLE_NAME='identity_designations' then
    perform 1 from crm_private.identity_entities e
      where e.identity_id=new.party_id for share;
    if exists(select 1 from crm_private.identity_entities e
      where e.identity_id=new.party_id and e.archived_at is not null) then
      raise exception 'IDENTITY_ARCHIVED_PARTY' using errcode='22023'; end if;
  else
    perform 1 from crm_private.identity_entities e
      where e.identity_id in (new.organization_id,new.contact_id)
      order by e.identity_id for share;
    if exists(select 1 from crm_private.identity_entities e
      where e.identity_id in (new.organization_id,new.contact_id)
        and e.archived_at is not null) then
      raise exception 'IDENTITY_ARCHIVED_PARTY' using errcode='22023'; end if;
  end if;
  return new;
end $$;
revoke execute on function crm_private.reject_archived_identity_link() from public;
create trigger identity_designation_active_party before insert
  on crm_private.identity_designations for each row
  execute function crm_private.reject_archived_identity_link();
create trigger identity_organization_contact_active_party before insert
  on crm_private.identity_organization_contacts for each row
  execute function crm_private.reject_archived_identity_link();

create table crm_private.identity_code_counters (
  code_kind text not null check (code_kind in ('OP','PR','RES','INC')),
  code_year integer not null check (code_year between 2000 and 9999),
  last_serial bigint not null check (last_serial > 0),
  primary key (code_kind,code_year)
);
create table crm_private.identity_codes (
  code_id uuid primary key,
  operation_id uuid not null unique references crm_private.identity_operations(operation_id),
  code_kind text not null check (code_kind in ('OP','PR','RES','INC')),
  target_id uuid not null,
  admin_scope text not null check (admin_scope <> ''),
  code_year integer not null check (code_year between 2000 and 9999),
  serial_number bigint not null check (serial_number > 0),
  human_code text not null unique,
  assigned_at timestamptz not null,
  source_ref text not null check (source_ref <> ''),
  evidence_ref text not null check (evidence_ref <> ''),
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  unique(code_kind,code_year,serial_number),
  unique(code_kind,target_id),
  check (human_code = code_kind || '-' || code_year::text || '-' ||
    lpad(serial_number::text,greatest(4,length(serial_number::text)),'0'))
);
do $$ declare t text; begin
  foreach t in array array['identity_code_counters','identity_codes'] loop
    execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
    execute format('alter table crm_private.%I enable row level security',t);
    execute format('alter table crm_private.%I force row level security',t);
    execute format('create policy h1_executor on crm_private.%I for all to crm_h0_f2_executor using (true) with check (true)',t);
    execute format('create policy h1_migration on crm_private.%I for all to crm_h0_migration using (true) with check (true)',t);
    execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor',t);
    execute format('grant select,insert,update on crm_private.%I to crm_h0_migration',t);
    execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
  end loop;
end $$;
grant update(last_serial) on crm_private.identity_code_counters to crm_h0_f2_executor;

create function crm_private.code_year_at(assigned_at timestamptz)
returns integer language sql immutable strict parallel safe
set search_path = pg_catalog, pg_temp
as $$ select extract(year from assigned_at at time zone 'Europe/Madrid')::integer $$;
alter function crm_private.code_year_at(timestamptz) owner to crm_h0_f2_owner;
revoke execute on function crm_private.code_year_at(timestamptz) from public;
grant execute on function crm_private.code_year_at(timestamptz) to crm_h0_f2_executor;

-- Signed vector: magic, action, operation, subject, related, kind,
-- source, evidence, reason, expected source version.
create function crm_api.identity_resolve(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(result_ref uuid,result_version bigint,human_code text,replayed boolean)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare hf text[]; tf text[]; v text[]; op crm_private.identity_operations%rowtype;
  source_entity crm_private.identity_entities%rowtype;
  destination crm_private.identity_entities%rowtype;
  before_state jsonb; after_state jsonb; fingerprint text;
  subject uuid; related uuid; actor uuid; scope text; expected bigint;
  next_version bigint; assigned timestamptz; annual_year integer; serial bigint;
  issued_code text;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C03','write_identity');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','identities','write_identity');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'IDENTITY_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>10 or v[1]<>'CRM-H1-RESOLVE1'
    or v[2] not in ('merge','archive','restore','assign_code')
    or v[3] is null or v[4] is null or v[7] is null or v[7]=''
    or v[8] is null or v[8]='' or v[9] is null or v[9]=''
    or v[10] !~ '^(0|[1-9][0-9]{0,18})$'
  then raise exception 'IDENTITY_RESOLUTION_INPUT_INVALID' using errcode='22023'; end if;
  subject:=v[4]::uuid; related:=nullif(v[5],'')::uuid;
  expected:=v[10]::bigint; actor:=hf[12]::uuid; scope:=hf[17];
  fingerprint:=encode(crm_crypto.digest(q,'sha256'),'hex');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v[3],0));
  select * into op from crm_private.identity_operations where operation_id=v[3]::uuid;
  if found then
    if op.actor_id<>actor or op.admin_scope<>scope or op.material_fingerprint<>fingerprint then
      raise exception 'IDENTITY_REPLAY_CONFLICT' using errcode='23505'; end if;
    select c.human_code into issued_code from crm_private.identity_codes c
      where c.operation_id=op.operation_id and c.admin_scope=scope;
    perform crm_f2.verify(f2p,f2s,q,'C03','human_identities','write_identity');
    result_ref:=op.result_ref; result_version:=op.resulting_version;
    human_code:=issued_code; replayed:=true; return next; return;
  end if;
  if v[2]='assign_code' then
    if related is not null or expected<>0 or v[6] not in ('OP','PR','RES','INC') then
      raise exception 'IDENTITY_RESOLUTION_INPUT_INVALID' using errcode='22023'; end if;
    if v[6] in ('OP','RES') and not exists(select 1 from crm_private.identity_contexts c
      where c.context_id=subject and c.context_kind=
        case v[6] when 'OP' then 'opportunity' else 'booking' end
        and c.admin_scope=scope and c.verified) then
      raise exception 'IDENTITY_RESOLUTION_TARGET_INVALID' using errcode='22023'; end if;
    -- PR/INC targets are stable IDs supplied by their later lifecycle.
    -- The H1 context is only a local reference, not a Booking or Opportunity.
    if exists(select 1 from crm_private.identity_codes c
      where c.code_kind=v[6] and c.target_id=subject) then
      raise exception 'IDENTITY_CODE_ALREADY_ASSIGNED' using errcode='23505'; end if;
    -- The assignment instant follows serialization, including a wait across midnight.
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('H1-CODE-' || v[6],0));
    assigned:=clock_timestamp();
    annual_year:=crm_private.code_year_at(assigned);
    insert into crm_private.identity_code_counters(code_kind,code_year,last_serial)
      values(v[6],annual_year,1)
      on conflict(code_kind,code_year)
      do update set last_serial=crm_private.identity_code_counters.last_serial+1
      returning last_serial into serial;
    issued_code:=v[6] || '-' || annual_year::text || '-' ||
      lpad(serial::text,greatest(4,length(serial::text)),'0');
    next_version:=0;
    after_state:=jsonb_build_object('code_kind',v[6],'target_id',subject,
      'human_code',issued_code,'assigned_at',assigned,'code_year',annual_year);
  else
    if v[6] not in ('contact','organization') or
      (v[2]='merge' and (related is null or related=subject)) or
      (v[2]<>'merge' and related is not null) then
      raise exception 'IDENTITY_RESOLUTION_INPUT_INVALID' using errcode='22023'; end if;
    -- Lock both identities in stable UUID order, including the target of merge.
    perform 1 from crm_private.identity_entities e
      where e.identity_id in (subject,related) order by e.identity_id for update;
    select * into source_entity from crm_private.identity_entities e where e.identity_id=subject;
    if not found or source_entity.admin_scope<>scope or source_entity.identity_kind<>v[6] then
      raise exception 'IDENTITY_RESOLUTION_TARGET_INVALID' using errcode='22023'; end if;
    if source_entity.version<>expected then
      raise exception 'IDENTITY_VERSION_CONFLICT' using errcode='40001'; end if;
    before_state:=to_jsonb(source_entity);
    if v[2]='merge' then
      select * into destination from crm_private.identity_entities e where e.identity_id=related;
      if not found or destination.admin_scope<>scope
        or destination.identity_kind<>source_entity.identity_kind
        or not source_entity.identity_verified or not destination.identity_verified
        or source_entity.archived_at is not null or destination.archived_at is not null
        or source_entity.merged_into_id is not null or destination.merged_into_id is not null
      then raise exception 'IDENTITY_RESOLUTION_TARGET_INVALID' using errcode='22023'; end if;
      update crm_private.identity_entities set merged_into_id=related,
        archived_at=clock_timestamp(),version=version+1,updated_at=clock_timestamp()
        where identity_id=subject returning version into next_version;
      select jsonb_build_object('source',to_jsonb(e),'destination',to_jsonb(destination))
        into after_state from crm_private.identity_entities e where e.identity_id=subject;
    elsif v[2]='archive' then
      if source_entity.archived_at is not null then
        raise exception 'IDENTITY_RESOLUTION_TARGET_INVALID' using errcode='22023'; end if;
      update crm_private.identity_entities set archived_at=clock_timestamp(),
        version=version+1,updated_at=clock_timestamp()
        where identity_id=subject returning version into next_version;
      select to_jsonb(e) into after_state from crm_private.identity_entities e
        where e.identity_id=subject;
    else
      if source_entity.archived_at is null or source_entity.merged_into_id is not null then
        raise exception 'IDENTITY_RESOLUTION_TARGET_INVALID' using errcode='22023'; end if;
      update crm_private.identity_entities set archived_at=null,
        version=version+1,updated_at=clock_timestamp()
        where identity_id=subject returning version into next_version;
      select to_jsonb(e) into after_state from crm_private.identity_entities e
        where e.identity_id=subject;
    end if;
  end if;
  insert into crm_private.identity_operations
    (operation_id,admin_scope,actor_id,material_fingerprint,action_kind,result_ref,resulting_version)
    values(v[3]::uuid,scope,actor,fingerprint,v[2],subject,next_version);
  if v[2]='assign_code' then
    insert into crm_private.identity_codes
      (code_id,operation_id,code_kind,target_id,admin_scope,code_year,serial_number,
       human_code,assigned_at,source_ref,evidence_ref,actor_id)
      values(v[3]::uuid,v[3]::uuid,v[6],subject,scope,annual_year,serial,
        issued_code,assigned,v[7],v[8],actor);
  end if;
  insert into crm_private.identity_history
    (history_id,operation_id,subject_id,related_id,subject_kind,before_state,after_state,
     source_ref,evidence_ref,reason,actor_id)
    values(v[3]::uuid,v[3]::uuid,subject,related,v[2],before_state,after_state,
      v[7],v[8],v[9],actor);
  perform crm_f2.verify(f2p,f2s,q,'C03','human_identities','write_identity');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C03','identities','write_identity');
  result_ref:=subject; result_version:=next_version;
  human_code:=issued_code; replayed:=false; return next;
end $$;
alter function crm_api.identity_resolve(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.identity_resolve(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.identity_resolve(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

-- Exact signals only. A candidate has no merge effect.
create function crm_api.identity_candidates(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare hf text[]; tf text[]; v text[]; source_entity crm_private.identity_entities%rowtype;
  result jsonb;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C01','read_identity');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','identities','read_identity');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'IDENTITY_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>2 or v[1]<>'CRM-H1-CANDIDATES1' then
    raise exception 'IDENTITY_RESOLUTION_INPUT_INVALID' using errcode='22023'; end if;
  select * into source_entity from crm_private.identity_entities e
    where e.identity_id=v[2]::uuid and e.admin_scope=hf[17]
      and e.identity_kind in ('contact','organization') and e.archived_at is null;
  if not found then raise exception 'IDENTITY_RESOLUTION_TARGET_INVALID' using errcode='22023'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('identity_id',e.identity_id,
      'identity_kind',e.identity_kind,'signals',jsonb_build_array(
        case when source_entity.email is not null and lower(trim(e.email))=lower(trim(source_entity.email))
          then 'email' end,
        case when source_entity.phone is not null and trim(e.phone)=trim(source_entity.phone)
          then 'phone' end,
        case when source_entity.display_name is not null and
          lower(trim(e.display_name))=lower(trim(source_entity.display_name))
          then 'name' end)) order by e.identity_id),'[]'::jsonb) into result
    from crm_private.identity_entities e
    where e.identity_id<>source_entity.identity_id and e.admin_scope=hf[17]
      and e.identity_kind=source_entity.identity_kind and e.archived_at is null
      and ((source_entity.email is not null and e.email is not null
            and lower(trim(e.email))=lower(trim(source_entity.email)))
        or (source_entity.phone is not null and e.phone is not null
            and trim(e.phone)=trim(source_entity.phone))
        or (source_entity.display_name is not null and e.display_name is not null
            and lower(trim(e.display_name))=lower(trim(source_entity.display_name))));
  perform crm_f2.verify(f2p,f2s,q,'C01','human_identities','read_identity');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C01','identities','read_identity');
  return result;
end $$;
alter function crm_api.identity_candidates(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.identity_candidates(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.identity_candidates(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

-- Authorized, scoped lookup by human code or stable technical ID.
create function crm_api.identity_code_lookup(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare hf text[]; tf text[]; v text[]; result jsonb;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C01','read_identity');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','identities','read_identity');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'IDENTITY_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>4 or v[1]<>'CRM-H1-CODE-LOOKUP1'
    or v[2] not in ('code','target') or v[3] not in ('OP','PR','RES','INC')
    or (v[2]='code' and v[4] !~ '^(OP|PR|RES|INC)-[0-9]{4}-[0-9]{4,}$')
    or (v[2]='target' and v[4] !~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
  then raise exception 'IDENTITY_RESOLUTION_INPUT_INVALID' using errcode='22023'; end if;
  if v[2]='code' then
    select jsonb_build_object('target_id',c.target_id,'code_kind',c.code_kind,
      'human_code',c.human_code,'assigned_at',c.assigned_at,'source_ref',c.source_ref)
      into result from crm_private.identity_codes c
      where c.human_code=v[4] and c.code_kind=v[3] and c.admin_scope=hf[17];
  else
    select jsonb_build_object('target_id',c.target_id,'code_kind',c.code_kind,
      'human_code',c.human_code,'assigned_at',c.assigned_at,'source_ref',c.source_ref)
      into result from crm_private.identity_codes c
      where c.target_id=v[4]::uuid and c.code_kind=v[3] and c.admin_scope=hf[17];
  end if;
  perform crm_f2.verify(f2p,f2s,q,'C01','human_identities','read_identity');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C01','identities','read_identity');
  return result;
end $$;
alter function crm_api.identity_code_lookup(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.identity_code_lookup(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.identity_code_lookup(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
