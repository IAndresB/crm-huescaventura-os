-- H0-M03 forward from H0-M02. F2 is independent of F1; no Auth provider is installed.
-- All human rows and keys start empty. Apply only as crm_h0_migration.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M03_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;
grant usage, create on schema crm_private to crm_h0_f2_owner;
grant usage, create on schema crm_api to crm_h0_f2_executor;
create schema crm_f2 authorization crm_h0_migration;
grant usage, create on schema crm_f2 to crm_h0_f2_owner, crm_h0_f2_verifier, crm_h0_f2_executor;
grant usage on schema crm_private to crm_h0_f2_executor;
grant usage on schema crm_crypto, crm_f1 to crm_h0_f2_verifier;
grant usage on schema crm_f1, crm_api to crm_h0_f2_executor;
revoke all on schema crm_f2 from public, crm_h0_runtime;

create table crm_private.crm_actors (
  actor_id uuid primary key,
  singleton boolean not null default true check (singleton),
  auth_subject uuid not null unique,
  admin_scope text not null check (admin_scope <> ''),
  enabled boolean not null default false,
  access_generation bigint not null default 1 check (access_generation > 0),
  access_state text not null default 'ready'
    check (access_state in ('ready','enrollment_required','recovery_in_progress','reidentification_required')),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  unique (singleton)
);
create table crm_private.crm_sessions (
  session_id uuid primary key,
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  auth_subject uuid not null,
  access_generation bigint not null check (access_generation > 0),
  created_at timestamptz not null default clock_timestamp(),
  revoked_at timestamptz
);
create table crm_private.identification_epochs (
  epoch_id uuid primary key,
  session_id uuid not null references crm_private.crm_sessions(session_id),
  identified_at timestamptz not null,
  last_human_activity_at timestamptz not null,
  full_password boolean not null,
  full_mfa boolean not null,
  access_state text not null
    check (access_state in ('ready','enrollment_required','recovery_in_progress','reidentification_required')),
  current_epoch boolean not null,
  closed_at timestamptz,
  check (last_human_activity_at >= identified_at),
  check ((current_epoch and closed_at is null) or (not current_epoch and closed_at is not null))
);
create unique index identification_epoch_current_per_session
  on crm_private.identification_epochs(session_id) where current_epoch;
create table crm_f2.keys (
  key_id text primary key,
  secret bytea not null check (octet_length(secret)=32),
  audience text not null check (audience <> ''),
  generation text not null check (generation <> ''),
  purposes text[] not null check (cardinality(purposes)>0),
  enabled boolean not null default false,
  valid_from timestamptz not null,
  valid_until timestamptz not null check (valid_until > valid_from)
);
alter table crm_private.crm_actors owner to crm_h0_f2_owner;
alter table crm_private.crm_sessions owner to crm_h0_f2_owner;
alter table crm_private.identification_epochs owner to crm_h0_f2_owner;
alter table crm_f2.keys owner to crm_h0_f2_owner;
alter table crm_private.crm_actors enable row level security;
alter table crm_private.crm_actors force row level security;
alter table crm_private.crm_sessions enable row level security;
alter table crm_private.crm_sessions force row level security;
alter table crm_private.identification_epochs enable row level security;
alter table crm_private.identification_epochs force row level security;
alter table crm_f2.keys enable row level security;
alter table crm_f2.keys force row level security;
create policy f2_actor_executor on crm_private.crm_actors for all to crm_h0_f2_executor
  using (true) with check (true);
create policy f2_actor_admin on crm_private.crm_actors for all to crm_h0_migration
  using (true) with check (true);
create policy f2_session_executor on crm_private.crm_sessions for all to crm_h0_f2_executor
  using (true) with check (true);
create policy f2_epoch_executor on crm_private.identification_epochs for all to crm_h0_f2_executor
  using (true) with check (true);
create policy f2_key_verifier on crm_f2.keys for select to crm_h0_f2_verifier using (true);
create policy f2_key_admin on crm_f2.keys for all to crm_h0_migration
  using (true) with check (true);
grant select, insert, update on crm_private.crm_actors to crm_h0_f2_executor;
grant select, insert, update on crm_private.crm_sessions to crm_h0_f2_executor;
grant select, insert, update on crm_private.identification_epochs to crm_h0_f2_executor;
grant select, insert, update on crm_private.crm_actors to crm_h0_migration;
grant select, insert, update on crm_f2.keys to crm_h0_migration;
grant select on crm_f2.keys to crm_h0_f2_verifier;
revoke all on crm_private.crm_actors, crm_private.crm_sessions,
  crm_private.identification_epochs, crm_f2.keys from public, crm_h0_runtime;

-- The F1 field decoder is a wire primitive, not an F1 authority. The F2
-- protocol/domain/key remain separate. Only the private verifier may decode.
grant execute on function crm_f1.fields(bytea) to crm_h0_f2_verifier;
create function crm_f2.verify(p bytea, s bytea, q bytea, expected_operation text,
  expected_resource text, expected_action text) returns text[]
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; k crm_f2.keys%rowtype; e bytea; b bytea; l bytea; r bytea;
  acc integer := 0; i integer; now_us bigint;
begin
  if p is null or q is null or octet_length(q)>65536 or s is null or octet_length(s)<>32
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  f := crm_f1.fields(p);
  if cardinality(f)<>25 or array_position(f,'') is not null
    or f[1]<>'CRM-H0F2' or f[2]<>'1' or f[10]<>'crm_h0_runtime'
    or session_user<>'crm_h0_runtime'
    or current_setting('transaction_isolation')<>'read committed'
    or f[18]<>expected_operation or f[19]<>expected_resource or f[20]<>expected_action
    or f[15] !~ '^[1-9][0-9]{0,18}$'
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  select * into strict k from crm_f2.keys where key_id=f[3] collate "C";
  if not k.enabled or clock_timestamp()<k.valid_from or clock_timestamp()>=k.valid_until
    or f[4] collate "C"<>k.audience collate "C"
    or f[5] collate "C"<>k.generation collate "C"
    or not (f[16]=any(k.purposes))
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  e := crm_crypto.hmac(p,k.secret,'sha256');
  b := crm_crypto.gen_random_bytes(32);
  l := crm_crypto.hmac(convert_to('CRM-H0F2-CMP-v1','UTF8') || e,b,'sha256');
  r := crm_crypto.hmac(convert_to('CRM-H0F2-CMP-v1','UTF8') || s,b,'sha256');
  if e is null or b is null or l is null or r is null
    or octet_length(e)<>32 or octet_length(b)<>32
    or octet_length(l)<>32 or octet_length(r)<>32
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  for i in 0..31 loop acc := acc | (get_byte(l,i) # get_byte(r,i)); end loop;
  if acc<>0 then raise exception 'F2_DENIED' using errcode='42501'; end if;
  now_us := floor(extract(epoch from clock_timestamp())*1000000)::bigint;
  if f[6]<>(select oid::text from pg_database where datname=current_database())
    or f[7]<>(extract(epoch from pg_postmaster_start_time())*1000000)::bigint::text
    or f[8]<>pg_current_xact_id()::text or f[9]<>pg_backend_pid()::text
    or f[22]<>encode(crm_crypto.digest(q,'sha256'),'hex')
    or f[23] !~ '^(0|[1-9][0-9]{0,18})$'
    or f[24] !~ '^(0|[1-9][0-9]{0,18})$'
    or f[24]::bigint-f[23]::bigint<>30000000
    or now_us<f[23]::bigint or now_us>=f[24]::bigint
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  return f;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_f2.verify(bytea,bytea,bytea,text,text,text) owner to crm_h0_f2_verifier;
-- pgcrypto's extension functions are provided with PostgreSQL's extension ACL;
-- crm_crypto schema USAGE confines their reach. No F2 signing key is in it.

-- Deterministic boundary predicate. The live gate supplies only DB clock time.
create function crm_f2.within_limit(at_time timestamptz, origin timestamptz, days_count integer)
returns boolean language sql immutable parallel safe security invoker
set search_path = pg_catalog, pg_temp as $$
  select at_time is not null and origin is not null
    and days_count in (7,30)
    and extract(epoch from at_time) < extract(epoch from origin) + days_count::numeric * 86400
$$;
alter function crm_f2.within_limit(timestamptz,timestamptz,integer) owner to crm_h0_f2_executor;

-- Read-only bootstrap metadata is not authority: M2 may learn IDs but cannot
-- sign the matching transaction capability.
create function crm_api.f2_lookup(v_subject uuid, v_session uuid)
returns table(actor_id uuid, access_generation bigint, admin_scope text, epoch_id uuid)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
begin
  return query select a.actor_id,a.access_generation,a.admin_scope,e.epoch_id
    from crm_private.crm_actors a
    left join crm_private.crm_sessions s on s.actor_id=a.actor_id
      and s.auth_subject=a.auth_subject and s.session_id=v_session
    left join crm_private.identification_epochs e on e.session_id=s.session_id and e.current_epoch
    where a.auth_subject=v_subject and a.enabled and a.access_state='ready';
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.f2_lookup(uuid,uuid) owner to crm_h0_f2_executor;

create function crm_api.provision_actor_mapping(v_actor uuid, v_subject uuid, v_scope text)
returns void language plpgsql volatile security definer
set search_path = pg_catalog, pg_temp as $$
begin
  if session_user<>'crm_h0_migration' or v_actor is null or v_subject is null
    or v_scope is null or v_scope='' then
    raise exception 'F2_DENIED' using errcode='42501';
  end if;
  insert into crm_private.crm_actors(actor_id,auth_subject,admin_scope,enabled)
    values(v_actor,v_subject,v_scope,true);
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.provision_actor_mapping(uuid,uuid,text) owner to crm_h0_f2_executor;

create function crm_api.set_actor_enabled(v_actor uuid, v_enabled boolean, v_state text)
returns void language plpgsql volatile security definer
set search_path = pg_catalog, pg_temp as $$
begin
  if session_user<>'crm_h0_migration' or v_enabled is null
    or v_state not in ('ready','enrollment_required','recovery_in_progress','reidentification_required')
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  -- Actor is the first lock in every access/revocation path.
  perform 1 from crm_private.crm_actors where actor_id=v_actor for update;
  if not v_enabled and exists (
    select 1 from crm_private.crm_actors
      where actor_id=v_actor and access_generation=9223372036854775807
  ) then raise exception 'F2_DENIED' using errcode='42501'; end if;
  update crm_private.crm_actors set enabled=v_enabled,access_state=v_state,
    access_generation=access_generation+case when not v_enabled then 1 else 0 end,
    updated_at=clock_timestamp() where actor_id=v_actor;
  if not found then raise exception 'F2_DENIED' using errcode='42501'; end if;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.set_actor_enabled(uuid,boolean,text) owner to crm_h0_f2_executor;

-- Full identification is asserted only by the server-issued signed purpose;
-- neither the SQL caller nor request input can set password/MFA flags.
create function crm_api.establish_session(p bytea,s bytea,q bytea) returns uuid
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; a crm_private.crm_actors%rowtype; qf text[]; at_time timestamptz;
begin
  f:=crm_f2.verify(p,s,q,'establish','human_session','establish');
  qf:=crm_f1.fields(q);
  if f[16]<>'full-identification' or f[21]<>'identification'
    or cardinality(qf)<>5 or qf[1]<>'CRM-F2-INP1' or qf[2]<>'establish'
    or qf[3]<>f[11] or qf[4]<>f[13] or qf[5]<>f[14]
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  select * into strict a from crm_private.crm_actors
    where actor_id=f[12]::uuid for update;
  if a.auth_subject<>f[11]::uuid or not a.enabled or a.access_state<>'ready'
    or a.access_generation<>f[15]::bigint or a.admin_scope<>f[17]
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  at_time:=clock_timestamp();
  insert into crm_private.crm_sessions(session_id,actor_id,auth_subject,access_generation,created_at)
    values(f[13]::uuid,a.actor_id,a.auth_subject,a.access_generation,at_time);
  insert into crm_private.identification_epochs(epoch_id,session_id,identified_at,
    last_human_activity_at,full_password,full_mfa,access_state,current_epoch)
    values(f[14]::uuid,f[13]::uuid,at_time,at_time,true,true,'ready',true);
  return f[14]::uuid;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.establish_session(bytea,bytea,bytea) owner to crm_h0_f2_executor;

create function crm_api.reidentify_session(p bytea,s bytea,q bytea) returns uuid
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[]; a crm_private.crm_actors%rowtype;
  ss crm_private.crm_sessions%rowtype; old_epoch crm_private.identification_epochs%rowtype;
  at_time timestamptz;
begin
  f:=crm_f2.verify(p,s,q,'reidentify','human_session','reidentify');
  qf:=crm_f1.fields(q);
  if f[16]<>'full-identification' or f[21]<>'identification'
    or cardinality(qf)<>5 or qf[1]<>'CRM-F2-INP1' or qf[2]<>'reidentify'
    or qf[3]<>f[13] or qf[4]<>f[14] or qf[5]=''
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  select * into strict a from crm_private.crm_actors where actor_id=f[12]::uuid for update;
  select * into strict ss from crm_private.crm_sessions where session_id=f[13]::uuid for update;
  select * into strict old_epoch from crm_private.identification_epochs
    where session_id=ss.session_id and current_epoch for update;
  if not a.enabled or a.access_state<>'ready' or a.auth_subject<>f[11]::uuid
    or a.admin_scope<>f[17] or a.access_generation<>f[15]::bigint
    or ss.actor_id<>a.actor_id or ss.auth_subject<>a.auth_subject or ss.revoked_at is not null
    or ss.access_generation<>a.access_generation
    or old_epoch.epoch_id<>f[14]::uuid
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  at_time:=clock_timestamp();
  update crm_private.identification_epochs set current_epoch=false,closed_at=at_time
    where epoch_id=old_epoch.epoch_id;
  update crm_private.crm_sessions set access_generation=a.access_generation
    where session_id=ss.session_id;
  insert into crm_private.identification_epochs(epoch_id,session_id,identified_at,
    last_human_activity_at,full_password,full_mfa,access_state,current_epoch)
    values(qf[5]::uuid,ss.session_id,at_time,at_time,true,true,'ready',true);
  return qf[5]::uuid;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.reidentify_session(bytea,bytea,bytea) owner to crm_h0_f2_executor;

-- Internal admission only. Runtime cannot call this guard standalone to
-- manufacture activity; the public human Core probes call it in their unit.
create function crm_f2.admit(p bytea,s bytea,q bytea,expected_op text,expected_action text)
returns text[] language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; a crm_private.crm_actors%rowtype; ss crm_private.crm_sessions%rowtype;
  ep crm_private.identification_epochs%rowtype; at_time timestamptz;
begin
  f:=crm_f2.verify(p,s,q,expected_op,'human_core_probe',expected_action);
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
  update crm_private.identification_epochs set last_human_activity_at=at_time
    where epoch_id=ep.epoch_id;
  return f;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_f2.admit(bytea,bytea,bytea,text,text) owner to crm_h0_f2_executor;

create function crm_api.revoke_session(p bytea,s bytea,q bytea) returns void
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[]; a crm_private.crm_actors%rowtype;
  ss crm_private.crm_sessions%rowtype; ep crm_private.identification_epochs%rowtype;
begin
  f:=crm_f2.verify(p,s,q,'revoke_one','human_session','revoke_one');
  qf:=crm_f1.fields(q);
  if f[16]<>'session-revocation' or f[21]<>'administrative_action'
    or cardinality(qf)<>3 or qf[1]<>'CRM-F2-INP1' or qf[2]<>'revoke_one'
    or qf[3]<>f[13]
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  select * into strict a from crm_private.crm_actors where actor_id=f[12]::uuid for update;
  select * into strict ss from crm_private.crm_sessions where session_id=f[13]::uuid for update;
  select * into strict ep from crm_private.identification_epochs
    where epoch_id=f[14]::uuid for update;
  if a.auth_subject<>f[11]::uuid or a.access_generation<>f[15]::bigint
    or ss.actor_id<>a.actor_id or ss.auth_subject<>a.auth_subject
    or ss.revoked_at is not null or ep.session_id<>ss.session_id or not ep.current_epoch
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  update crm_private.crm_sessions set revoked_at=clock_timestamp() where session_id=ss.session_id;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.revoke_session(bytea,bytea,bytea) owner to crm_h0_f2_executor;

create function crm_api.revoke_all_sessions(p bytea,s bytea,q bytea) returns bigint
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[]; a crm_private.crm_actors%rowtype; new_generation bigint;
begin
  f:=crm_f2.verify(p,s,q,'revoke_all','human_actor','revoke_all');
  qf:=crm_f1.fields(q);
  if f[16]<>'session-revocation' or f[21]<>'administrative_action'
    or cardinality(qf)<>3 or qf[1]<>'CRM-F2-INP1' or qf[2]<>'revoke_all'
    or qf[3]<>f[12]
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  select * into strict a from crm_private.crm_actors where actor_id=f[12]::uuid for update;
  if a.auth_subject<>f[11]::uuid or a.access_generation<>f[15]::bigint
    or a.access_generation=9223372036854775807
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  update crm_private.crm_actors set access_generation=access_generation+1,
    updated_at=clock_timestamp() where actor_id=a.actor_id returning access_generation into new_generation;
  return new_generation;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.revoke_all_sessions(bytea,bytea,bytea) owner to crm_h0_f2_executor;

-- F2 admission and F1 material access occur in this one SQL call/transaction.
-- F1 alone remains useful only for the pre-existing technical probe surface.
create function crm_api.human_read_probe(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(probe_id text,public_value text)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare hf text[]; tf text[];
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C01','read_probe');
  tf:=crm_f1.verify(f1p,f1s,q,'C01');
  if tf[14] collate "C"<>hf[17] collate "C" then
    raise exception 'F2_DENIED' using errcode='42501'; end if;
  return query select r.probe_id,r.public_value from crm_api.read_probe(f1p,f1s,q) r;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.human_read_probe(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;

create function crm_api.human_apply_probe_batch(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns text[] language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare hf text[]; tf text[];
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');
  tf:=crm_f1.verify(f1p,f1s,q,'C03');
  if tf[14] collate "C"<>hf[17] collate "C" then
    raise exception 'F2_DENIED' using errcode='42501'; end if;
  return crm_api.apply_probe_batch(f1p,f1s,q);
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.human_apply_probe_batch(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;

grant execute on function crm_f2.verify(bytea,bytea,bytea,text,text,text) to crm_h0_f2_executor;
grant execute on function crm_f2.within_limit(timestamptz,timestamptz,integer) to crm_h0_f2_executor;
grant execute on function crm_f1.fields(bytea), crm_f1.verify(bytea,bytea,bytea,text),
  crm_api.read_probe(bytea,bytea,bytea), crm_api.apply_probe_batch(bytea,bytea,bytea)
  to crm_h0_f2_executor;
revoke execute on all functions in schema crm_f2 from public, crm_h0_runtime;
revoke execute on function crm_api.f2_lookup(uuid,uuid),
  crm_api.provision_actor_mapping(uuid,uuid,text),crm_api.set_actor_enabled(uuid,boolean,text),
  crm_api.establish_session(bytea,bytea,bytea),crm_api.reidentify_session(bytea,bytea,bytea),
  crm_api.revoke_session(bytea,bytea,bytea),crm_api.revoke_all_sessions(bytea,bytea,bytea),
  crm_api.human_read_probe(bytea,bytea,bytea,bytea,bytea),
  crm_api.human_apply_probe_batch(bytea,bytea,bytea,bytea,bytea)
  from public;
grant execute on function crm_api.f2_lookup(uuid,uuid),
  crm_api.establish_session(bytea,bytea,bytea),crm_api.reidentify_session(bytea,bytea,bytea),
  crm_api.revoke_session(bytea,bytea,bytea),crm_api.revoke_all_sessions(bytea,bytea,bytea),
  crm_api.human_read_probe(bytea,bytea,bytea,bytea,bytea),
  crm_api.human_apply_probe_batch(bytea,bytea,bytea,bytea,bytea)
  to crm_h0_runtime;
grant execute on function crm_api.provision_actor_mapping(uuid,uuid,text),
  crm_api.set_actor_enabled(uuid,boolean,text) to crm_h0_migration;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
revoke create on schema crm_f2 from crm_h0_f2_owner,crm_h0_f2_verifier,crm_h0_f2_executor;
alter default privileges for role crm_h0_migration in schema crm_f2
  revoke execute on functions from public;
alter default privileges for role crm_h0_migration in schema crm_f2
  revoke all on tables from public;
commit;
