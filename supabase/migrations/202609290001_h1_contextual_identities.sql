-- H1-001: local identity records and contextual designations. Forward only.
-- H0 F1/F2 remain the admission authority; no real personal data is migrated.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H1_IDENTITY_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;
grant usage, create on schema crm_private to crm_h0_f2_owner;
grant usage, create on schema crm_api to crm_h0_f2_executor;

create table crm_private.identity_contexts (
  context_id uuid primary key,
  context_kind text not null check (context_kind in ('opportunity','booking')),
  admin_scope text not null check (admin_scope <> ''),
  source_ref text not null check (source_ref <> ''),
  evidence_ref text,
  verified boolean not null,
  version bigint not null default 0 check (version >= 0),
  created_at timestamptz not null default clock_timestamp(),
  check (not verified or evidence_ref is not null)
);
create table crm_private.identity_entities (
  identity_id uuid primary key,
  identity_kind text not null check (identity_kind in ('contact','organization','group')),
  admin_scope text not null check (admin_scope <> ''),
  context_id uuid references crm_private.identity_contexts(context_id),
  display_name text,
  given_name text,
  family_name text,
  email text,
  phone text,
  group_type text,
  estimated_size integer check (estimated_size >= 0),
  confirmed_size integer check (confirmed_size >= 0),
  size_source text,
  source_ref text not null check (source_ref <> ''),
  evidence_ref text,
  identity_verified boolean not null default false,
  version bigint not null default 0 check (version >= 0),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  unique (identity_id, identity_kind),
  check ((identity_kind = 'group') = (context_id is not null)),
  check (not identity_verified or evidence_ref is not null),
  check (identity_kind = 'contact' or
    (given_name is null and family_name is null and email is null and phone is null)),
  check (identity_kind = 'group' or
    (group_type is null and estimated_size is null and confirmed_size is null and size_source is null)),
  check ((estimated_size is null and confirmed_size is null) or size_source is not null)
);
create table crm_private.identity_organization_contacts (
  link_id uuid primary key,
  organization_id uuid not null,
  organization_kind text not null default 'organization' check (organization_kind = 'organization'),
  contact_id uuid not null,
  contact_kind text not null default 'contact' check (contact_kind = 'contact'),
  admin_scope text not null check (admin_scope <> ''),
  source_ref text not null check (source_ref <> ''),
  evidence_ref text not null check (evidence_ref <> ''),
  recorded_at timestamptz not null default clock_timestamp(),
  foreign key (organization_id, organization_kind)
    references crm_private.identity_entities(identity_id, identity_kind),
  foreign key (contact_id, contact_kind)
    references crm_private.identity_entities(identity_id, identity_kind)
);
create table crm_private.identity_designations (
  designation_id uuid primary key,
  context_id uuid not null references crm_private.identity_contexts(context_id),
  party_id uuid not null,
  party_kind text not null,
  role_kind text not null check (role_kind in ('primary_contact','client','payer','participant')),
  admin_scope text not null check (admin_scope <> ''),
  source_ref text not null check (source_ref <> ''),
  evidence_ref text,
  verified boolean not null,
  recorded_by uuid not null references crm_private.crm_actors(actor_id),
  effective_at timestamptz,
  recorded_at timestamptz not null default clock_timestamp(),
  ended_at timestamptz,
  foreign key (party_id, party_kind)
    references crm_private.identity_entities(identity_id, identity_kind),
  check ((role_kind = 'primary_contact' and party_kind = 'contact')
    or (role_kind in ('client','payer') and party_kind in ('contact','organization'))
    or (role_kind = 'participant' and party_kind in ('contact','group'))),
  check (ended_at is null or ended_at >= recorded_at),
  check (not verified or evidence_ref is not null),
  check (role_kind <> 'primary_contact' or verified)
);
create unique index identity_one_current_primary
  on crm_private.identity_designations(context_id)
  where role_kind = 'primary_contact' and ended_at is null;
create table crm_private.identity_operations (
  operation_id uuid primary key,
  admin_scope text not null,
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  material_fingerprint text not null check (material_fingerprint ~ '^[0-9a-f]{64}$'),
  action_kind text not null,
  result_ref uuid not null,
  resulting_version bigint not null check (resulting_version >= 0),
  recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.identity_history (
  history_id uuid primary key,
  operation_id uuid not null references crm_private.identity_operations(operation_id),
  subject_id uuid not null,
  context_id uuid,
  related_id uuid,
  subject_kind text not null,
  before_state jsonb,
  after_state jsonb not null,
  source_ref text not null,
  evidence_ref text,
  reason text not null,
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  happened_at timestamptz,
  recorded_at timestamptz not null default clock_timestamp(),
  unique (operation_id)
);

do $$ declare t text; begin
  foreach t in array array['identity_contexts','identity_entities',
    'identity_organization_contacts','identity_designations',
    'identity_operations','identity_history'] loop
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
grant update(version) on crm_private.identity_contexts to crm_h0_f2_executor;
grant update(display_name,given_name,family_name,email,phone,group_type,estimated_size,
  confirmed_size,size_source,source_ref,evidence_ref,identity_verified,version,updated_at)
  on crm_private.identity_entities to crm_h0_f2_executor;
grant update(ended_at) on crm_private.identity_designations to crm_h0_f2_executor;

create or replace function crm_f1.verify_envelope(
  p bytea, s bytea, q bytea, op text, resource_name text, action_name text
) returns text[]
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; k crm_f1.keys%rowtype; e bytea; b bytea; l bytea; r bytea;
  acc integer := 0; i integer; now_us bigint;
begin
  if s is null or octet_length(s) <> 32 then raise exception 'F1_DENIED' using errcode='42501'; end if;
  f := crm_f1.fields(p);
  if cardinality(f) <> 21 or array_position(f,'') is not null
    or f[1] <> 'CRM-H0F1' or f[2] <> '1' or f[12] <> 'technical'
    or f[15] <> op or op not in ('C01','C03')
    or f[16] <> resource_name or f[17] <> action_name
    or f[10] <> session_user or not (
      (session_user='crm_h0_runtime'
        and f[13] not in ('h0-011-human-unit','h0-011-human-approval','h0-011-evidence-revalidation')
        and (
          (f[16]='access_probe' and ((f[15]='C01' and f[17]='read_probe')
            or (f[15]='C03' and f[17]='apply_probe_batch')))
          or (f[15]='C03' and f[16]='internal_unit' and f[17]='commit_internal_unit')
          or (f[13]='h0-013-auth-revocation' and f[15]='C03'
            and f[16]='global_access_revocation' and f[17]='record_auth_outcome')
          or (f[13]='h1-identities' and f[16]='identities'
            and ((f[15]='C01' and f[17]='read_identity')
              or (f[15]='C03' and f[17]='write_identity')))
          or (f[13]='h0-016-recovery' and f[15]='C03'
            and f[16]='access_recovery'
            and f[17] in ('begin','record_auth_outcome','complete'))
        ))
      or (session_user='crm_h0_ha_tx' and (
        (f[13]='h0-011-human-unit' and f[15]='C03'
          and ((f[16]='human_approval' and f[17]='manage_effect')
            or (f[16]='internal_unit' and f[17]='commit_internal_unit')))
        or (f[13]='h0-011-human-approval' and (
          (f[15]='C01' and f[16]='human_approval' and f[17]='read_proposal')
          or (f[15]='C03' and ((f[16]='human_approval' and f[17]='manage_effect')
            or (f[16]='internal_unit' and f[17]='commit_internal_unit')))))
        or (f[13]='h0-011-evidence-revalidation'
          and f[16]='human_approval_evidence'
          and ((f[15]='C01' and f[17]='check_replay')
            or (f[15]='C03' and f[17]='revalidate_evidence')))
      ))
    ) or current_setting('transaction_isolation') <> 'read committed'
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  select * into strict k from crm_f1.keys where key_id = f[3] collate "C";
  if not k.enabled or clock_timestamp() < k.valid_from or clock_timestamp() >= k.valid_until
    or f[4] collate "C" <> k.audience collate "C" or f[5] collate "C" <> k.generation collate "C"
    or not (f[13] = any(k.purposes))
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  e := crm_crypto.hmac(p,k.secret,'sha256');
  b := crm_crypto.gen_random_bytes(32);
  l := crm_crypto.hmac(convert_to('CRM-H0F1-CMP-v1','UTF8') || e,b,'sha256');
  r := crm_crypto.hmac(convert_to('CRM-H0F1-CMP-v1','UTF8') || s,b,'sha256');
  if e is null or b is null or l is null or r is null
    or octet_length(e) <> 32 or octet_length(b) <> 32
    or octet_length(l) <> 32 or octet_length(r) <> 32
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  for i in 0..31 loop acc := acc | (get_byte(l,i) # get_byte(r,i)); end loop;
  if acc <> 0 then raise exception 'F1_DENIED' using errcode='42501'; end if;
  now_us := floor(extract(epoch from clock_timestamp()) * 1000000)::bigint;
  if f[6] <> (select oid::text from pg_database where datname = current_database())
    or f[7] <> (extract(epoch from pg_postmaster_start_time()) * 1000000)::bigint::text
    or f[8] <> pg_current_xact_id()::text or f[9] <> pg_backend_pid()::text
    or f[18] <> encode(crm_crypto.digest(q,'sha256'),'hex')
    or f[19] !~ '^(0|[1-9][0-9]{0,18})$' or f[20] !~ '^(0|[1-9][0-9]{0,18})$'
    or f[20]::bigint - f[19]::bigint <> 30000000
    or now_us < f[19]::bigint or now_us >= f[20]::bigint
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  return f;
exception when others then raise exception 'F1_DENIED' using errcode='42501';
end $$;

-- Extend the existing D039 F2 target partition for one H1 resource.
-- Keep the H0 probe and TTE branches byte-for-byte unchanged.
do $patch$
declare definition text; old_text text; new_text text;
begin
  definition:=pg_get_functiondef('crm_f2.verify(bytea,bytea,bytea,text,text,text)'::regprocedure);
  old_text:=$old$and f[19]='human_core_probe' and ((f[18]='C01' and f[20]='read_probe') or (f[18]='C03' and f[20]='apply_probe_batch'))$old$;
  new_text:=$new$and ((f[19]='human_core_probe' and ((f[18]='C01' and f[20]='read_probe') or (f[18]='C03' and f[20]='apply_probe_batch')))
        or (session_user='crm_h0_runtime' and f[19]='human_identities'
          and ((f[18]='C01' and f[20]='read_identity') or (f[18]='C03' and f[20]='write_identity'))))$new$;
  if length(definition)-length(replace(definition,old_text,''))<>length(old_text) then
    raise exception 'H1_F2_PREDECESSOR_MISMATCH'; end if;
  execute replace(definition,old_text,new_text);
end $patch$;

create or replace function crm_f2.admit(p bytea,s bytea,q bytea,expected_op text,expected_action text)
returns text[] language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; a crm_private.crm_actors%rowtype; ss crm_private.crm_sessions%rowtype;
  ep crm_private.identification_epochs%rowtype; at_time timestamptz;
begin
  f:=crm_f2.verify(p,s,q,expected_op,
    case when expected_action in ('read_identity','write_identity')
      then 'human_identities' else 'human_core_probe' end, expected_action);
  if f[16]<>'core-human-access'
    or not ((expected_op='C01' and f[21]='interactive_read')
      or (expected_op='C03' and f[21]='interactive_action'))
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  select * into strict a from crm_private.crm_actors where actor_id=f[12]::uuid for update;
  select * into strict ss from crm_private.crm_sessions where session_id=f[13]::uuid for update;
  select * into strict ep from crm_private.identification_epochs
    where epoch_id=f[14]::uuid for update;
  at_time:=clock_timestamp();
  if a.auth_subject<>f[11]::uuid or not a.enabled or a.access_state<>'ready'
    or a.admin_scope<>f[17] or a.access_generation<>f[15]::bigint
    or ss.actor_id<>a.actor_id or ss.auth_subject<>a.auth_subject
    or ss.access_generation<>a.access_generation or ss.revoked_at is not null
    or ep.session_id<>ss.session_id or not ep.current_epoch or not ep.full_password
    or not ep.full_mfa or ep.access_state<>'ready'
    or not crm_f2.within_limit(at_time,ep.identified_at,30)
    or not crm_f2.within_limit(at_time,ep.last_human_activity_at,7)
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  perform crm_f2.verify(p,s,q,expected_op,
    case when expected_action in ('read_identity','write_identity')
      then 'human_identities' else 'human_core_probe' end, expected_action);
  update crm_private.identification_epochs set last_human_activity_at=at_time
    where epoch_id=ep.epoch_id;
  perform crm_f2.verify(p,s,q,expected_op,
    case when expected_action in ('read_identity','write_identity')
      then 'human_identities' else 'human_core_probe' end, expected_action);
  return f;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;

-- Fixed, signed field vector: magic, action, operation, target, related,
-- context, kind/role, label, source, evidence, reason, expected version, verified,
-- group type/estimated/confirmed/source, contact names/email/phone, fact time.
create function crm_api.identity_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(result_ref uuid,result_version bigint,replayed boolean)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare hf text[]; tf text[]; v text[]; op crm_private.identity_operations%rowtype;
  ent crm_private.identity_entities%rowtype; ctx crm_private.identity_contexts%rowtype;
  old_state jsonb; new_state jsonb; fingerprint text; target uuid; related uuid;
  context_ref uuid; history_context uuid; expected bigint; actor uuid; scope text; new_version bigint;
  candidate boolean; party_kind text; old_primary jsonb;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C03','write_identity');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','identities','write_identity');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'IDENTITY_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>22 or v[1]<>'CRM-H1-ID1' or v[2] not in
    ('create_context','create_entity','update_entity','link_organization_contact','designate')
    or v[3] is null or v[4] is null or v[9] is null or v[9]=''
    or v[11] is null or v[11]='' or v[12] !~ '^(0|[1-9][0-9]{0,18})$'
    or v[13] not in ('true','false')
  then raise exception 'IDENTITY_INPUT_INVALID' using errcode='22023'; end if;
  target:=v[4]::uuid; related:=nullif(v[5],'')::uuid;
  context_ref:=nullif(v[6],'')::uuid; expected:=v[12]::bigint;
  candidate:=v[13]='true'; actor:=hf[12]::uuid; scope:=hf[17];
  fingerprint:=encode(crm_crypto.digest(q,'sha256'),'hex');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v[3],0));
  select * into op from crm_private.identity_operations where operation_id=v[3]::uuid;
  if found then
    if op.actor_id<>actor or op.admin_scope<>scope or op.material_fingerprint<>fingerprint then
      raise exception 'IDENTITY_REPLAY_CONFLICT' using errcode='23505'; end if;
    perform crm_f2.verify(f2p,f2s,q,'C03','human_identities','write_identity');
    result_ref:=op.result_ref; result_version:=op.resulting_version;
    replayed:=true; return next; return;
  end if;
  old_state:=null;
  if v[2]='create_context' then
    if v[7] not in ('opportunity','booking') or related is not null or context_ref is not null
      or expected<>0 or not candidate or v[10]='' then
      raise exception 'IDENTITY_EVIDENCE_REQUIRED' using errcode='22023'; end if;
    insert into crm_private.identity_contexts(context_id,context_kind,admin_scope,source_ref,evidence_ref,verified)
      values(target,v[7],scope,v[9],v[10],true) returning version into new_version;
    history_context:=target;
    select to_jsonb(c) into new_state from crm_private.identity_contexts c where c.context_id=target;
  elsif v[2]='create_entity' then
    if v[7] not in ('contact','organization','group') or related is not null or expected<>0
      or (v[7]='group')<>(context_ref is not null) or (candidate and v[10]='') then
      raise exception 'IDENTITY_INPUT_INVALID' using errcode='22023'; end if;
    if context_ref is not null then
      select * into ctx from crm_private.identity_contexts where context_id=context_ref;
      if not found or ctx.admin_scope<>scope or not ctx.verified then
        raise exception 'IDENTITY_CONTEXT_UNVERIFIED' using errcode='22023'; end if;
    end if;
    insert into crm_private.identity_entities(identity_id,identity_kind,admin_scope,context_id,
      display_name,given_name,family_name,email,phone,group_type,estimated_size,
      confirmed_size,size_source,source_ref,evidence_ref,identity_verified)
      values(target,v[7],scope,context_ref,nullif(v[8],''),nullif(v[18],''),nullif(v[19],''),
        nullif(v[20],''),nullif(v[21],''),nullif(v[14],''),nullif(v[15],'')::integer,
        nullif(v[16],'')::integer,nullif(v[17],''),v[9],nullif(v[10],''),candidate)
      returning version into new_version;
    select to_jsonb(e) into new_state from crm_private.identity_entities e where e.identity_id=target;
  elsif v[2]='update_entity' then
    if related is not null or context_ref is not null then
      raise exception 'IDENTITY_INPUT_INVALID' using errcode='22023'; end if;
    select * into ent from crm_private.identity_entities where identity_id=target for update;
    if not found or ent.admin_scope<>scope or ent.identity_kind<>v[7] then
      raise exception 'IDENTITY_DENIED' using errcode='42501'; end if;
    if ent.version<>expected then raise exception 'IDENTITY_VERSION_CONFLICT' using errcode='40001'; end if;
    if candidate and (v[10]=chr(31) or (v[10]='' and ent.evidence_ref is null)) then
      raise exception 'IDENTITY_EVIDENCE_REQUIRED' using errcode='22023'; end if;
    if not candidate and exists(select 1 from crm_private.identity_designations d
      where d.party_id=target and d.role_kind='primary_contact' and d.ended_at is null) then
      raise exception 'IDENTITY_ACTIVE_DESIGNATION' using errcode='22023'; end if;
    old_state:=to_jsonb(ent);
    history_context:=ent.context_id;
    update crm_private.identity_entities set
      display_name=case when v[8]='' then ent.display_name when v[8]=chr(31) then null else v[8] end,
      given_name=case when v[18]='' then ent.given_name when v[18]=chr(31) then null else v[18] end,
      family_name=case when v[19]='' then ent.family_name when v[19]=chr(31) then null else v[19] end,
      email=case when v[20]='' then ent.email when v[20]=chr(31) then null else v[20] end,
      phone=case when v[21]='' then ent.phone when v[21]=chr(31) then null else v[21] end,
      group_type=case when v[14]='' then ent.group_type when v[14]=chr(31) then null else v[14] end,
      estimated_size=case when v[15]='' then ent.estimated_size when v[15]=chr(31) then null else v[15]::integer end,
      confirmed_size=case when v[16]='' then ent.confirmed_size when v[16]=chr(31) then null else v[16]::integer end,
      size_source=case when v[17]='' then ent.size_source when v[17]=chr(31) then null else v[17] end,
      source_ref=v[9],
      evidence_ref=case when v[10]='' then ent.evidence_ref when v[10]=chr(31) then null else v[10] end,
      identity_verified=candidate,version=version+1,
      updated_at=clock_timestamp() where identity_id=target returning version into new_version;
    select to_jsonb(e) into new_state from crm_private.identity_entities e where e.identity_id=target;
  elsif v[2]='link_organization_contact' then
    if related is null or context_ref is null or v[10]='' or not candidate or expected<>0 then
      raise exception 'IDENTITY_EVIDENCE_REQUIRED' using errcode='22023'; end if;
    if not exists(select 1 from crm_private.identity_entities e where e.identity_id=related
      and e.identity_kind='contact' and e.admin_scope=scope and e.identity_verified)
      or not exists(select 1 from crm_private.identity_entities e where e.identity_id=context_ref
      and e.identity_kind='organization' and e.admin_scope=scope and e.identity_verified)
    then raise exception 'IDENTITY_RELATION_UNVERIFIED' using errcode='22023'; end if;
    insert into crm_private.identity_organization_contacts
      (link_id,organization_id,contact_id,admin_scope,source_ref,evidence_ref)
      values(target,context_ref,related,scope,v[9],v[10]);
    new_version:=0;
    select to_jsonb(l) into new_state from crm_private.identity_organization_contacts l where l.link_id=target;
  else
    if related is null or context_ref is null or v[7] not in
      ('primary_contact','client','payer','participant') or (candidate and v[10]='') then
      raise exception 'IDENTITY_INPUT_INVALID' using errcode='22023'; end if;
    select * into ctx from crm_private.identity_contexts where context_id=context_ref for update;
    if not found or ctx.admin_scope<>scope or not ctx.verified then
      raise exception 'IDENTITY_CONTEXT_UNVERIFIED' using errcode='22023'; end if;
    if ctx.version<>expected then raise exception 'IDENTITY_VERSION_CONFLICT' using errcode='40001'; end if;
    select * into ent from crm_private.identity_entities where identity_id=related;
    if not found or ent.admin_scope<>scope or (candidate and not ent.identity_verified)
      or (ent.identity_kind='group' and ent.context_id<>context_ref)
      or (v[7]='primary_contact' and (not candidate or ent.identity_kind<>'contact')) then
      raise exception 'IDENTITY_RELATION_UNVERIFIED' using errcode='22023'; end if;
    party_kind:=ent.identity_kind;
    if v[7]='primary_contact' then
      select to_jsonb(d) into old_primary from crm_private.identity_designations d
        where d.context_id=context_ref and d.role_kind='primary_contact' and d.ended_at is null;
      update crm_private.identity_designations set ended_at=clock_timestamp()
        where context_id=context_ref and role_kind='primary_contact' and ended_at is null;
    end if;
    insert into crm_private.identity_designations
      (designation_id,context_id,party_id,party_kind,role_kind,admin_scope,source_ref,
       evidence_ref,verified,recorded_by,effective_at)
      values(target,context_ref,related,party_kind,v[7],scope,v[9],nullif(v[10],''),candidate,
        actor,nullif(v[22],'')::timestamptz);
    update crm_private.identity_contexts set version=version+1 where context_id=context_ref
      returning version into new_version;
    old_state:=old_primary;
    select to_jsonb(d) into new_state from crm_private.identity_designations d where d.designation_id=target;
    if old_primary is not null then
      new_state:=jsonb_build_object('current',new_state,'replaced',
        (select to_jsonb(d) from crm_private.identity_designations d
          where d.designation_id=(old_primary->>'designation_id')::uuid));
    end if;
  end if;
  insert into crm_private.identity_operations
    (operation_id,admin_scope,actor_id,material_fingerprint,action_kind,result_ref,resulting_version)
    values(v[3]::uuid,scope,actor,fingerprint,v[2],target,new_version);
  insert into crm_private.identity_history
    (history_id,operation_id,subject_id,context_id,related_id,subject_kind,before_state,after_state,
     source_ref,evidence_ref,reason,actor_id,happened_at)
    values(v[3]::uuid,v[3]::uuid,target,coalesce(history_context,context_ref),related,v[2],old_state,new_state,
      v[9],nullif(v[10],''),v[11],actor,nullif(v[22],'')::timestamptz);
  perform crm_f2.verify(f2p,f2s,q,'C03','human_identities','write_identity');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C03','identities','write_identity');
  result_ref:=target; result_version:=new_version; replayed:=false;
  return next;
end $$;
alter function crm_api.identity_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.identity_apply(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.identity_apply(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

create function crm_api.identity_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare hf text[]; tf text[]; v text[]; output jsonb; target uuid;
  page_limit integer; page_offset integer; total integer; next_page text;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C01','read_identity');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','identities','read_identity');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'IDENTITY_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>5 or v[1]<>'CRM-H1-ID-READ1'
    or v[2] not in ('entity','context','designations','history','organization_contacts')
    or v[4] !~ '^[1-9][0-9]{0,2}$' or v[5] !~ '^(0|[1-9][0-9]{0,8})$'
  then raise exception 'IDENTITY_INPUT_INVALID' using errcode='22023'; end if;
  target:=v[3]::uuid; page_limit:=v[4]::integer; page_offset:=v[5]::integer;
  if page_limit>100 then raise exception 'IDENTITY_INPUT_INVALID' using errcode='22023'; end if;
  if v[2]='entity' then
    select to_jsonb(e) into output from crm_private.identity_entities e
      where e.identity_id=target and e.admin_scope=hf[17];
  elsif v[2]='context' then
    select to_jsonb(c) into output from crm_private.identity_contexts c
      where c.context_id=target and c.admin_scope=hf[17];
  elsif v[2]='designations' then
    select coalesce(jsonb_agg(to_jsonb(d) order by d.recorded_at,d.designation_id),'[]'::jsonb)
      into output from crm_private.identity_designations d
      where d.context_id=target and d.admin_scope=hf[17];
  elsif v[2]='organization_contacts' then
    select coalesce(jsonb_agg(to_jsonb(l) order by l.recorded_at,l.link_id),'[]'::jsonb)
      into output from crm_private.identity_organization_contacts l
      where l.organization_id=target and l.admin_scope=hf[17];
  else
    select coalesce(jsonb_agg(to_jsonb(h) order by h.recorded_at,h.history_id),'[]'::jsonb)
      into output from crm_private.identity_history h
      join crm_private.identity_operations o on o.operation_id=h.operation_id
      where (h.subject_id=target or h.context_id=target or h.related_id=target)
        and o.admin_scope=hf[17];
  end if;
  if v[2] in ('designations','history','organization_contacts') then
    total:=jsonb_array_length(output);
    select coalesce(jsonb_agg(item.value order by item.ordinality),'[]'::jsonb) into output
      from jsonb_array_elements(output) with ordinality as item(value,ordinality)
      where item.ordinality>page_offset and item.ordinality<=page_offset+page_limit;
    next_page:=case when page_offset+page_limit<total then (page_offset+page_limit)::text else null end;
  else
    if page_offset<>0 then raise exception 'IDENTITY_INPUT_INVALID' using errcode='22023'; end if;
    next_page:=null;
  end if;
  perform crm_f2.verify(f2p,f2s,q,'C01','human_identities','read_identity');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C01','identities','read_identity');
  return jsonb_build_object('data',output,'nextPage',next_page);
end $$;
alter function crm_api.identity_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.identity_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.identity_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
