-- H0-M05: durable Core-wide revocation and explicit Auth coordination state.
-- No Auth provider, token, user or secret is provisioned by this migration.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M05_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;

grant usage, create on schema crm_private to crm_h0_f2_owner;
grant usage, create on schema crm_api to crm_h0_f2_executor;

create table crm_private.global_access_revocations (
  revocation_id uuid primary key,
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  auth_subject uuid not null,
  initiating_session_id uuid not null references crm_private.crm_sessions(session_id),
  previous_access_generation bigint not null check (previous_access_generation > 0),
  access_generation bigint not null check (access_generation = previous_access_generation + 1),
  admin_scope text not null check (admin_scope <> ''),
  core_revoked_at timestamptz not null,
  auth_state text not null default 'pending'
    check (auth_state in ('pending','revoked','failed','uncertain')),
  auth_attempt_count integer not null default 0 check (auth_attempt_count >= 0),
  last_auth_attempt_at timestamptz,
  auth_revoked_at timestamptz,
  unique (actor_id, access_generation),
  check (
    (auth_state = 'pending' and auth_attempt_count = 0
      and last_auth_attempt_at is null and auth_revoked_at is null)
    or (auth_state in ('failed','uncertain') and auth_attempt_count > 0
      and last_auth_attempt_at is not null and auth_revoked_at is null)
    or (auth_state = 'revoked' and auth_attempt_count > 0
      and last_auth_attempt_at is not null and auth_revoked_at is not null)
  )
);

create table crm_private.global_access_revocation_attempts (
  attempt_id uuid primary key,
  revocation_id uuid not null references crm_private.global_access_revocations(revocation_id),
  attempt_number integer not null check (attempt_number > 0),
  outcome text not null check (outcome in ('revoked','failed','uncertain')),
  recorded_at timestamptz not null,
  unique (revocation_id, attempt_number)
);

alter table crm_private.global_access_revocations owner to crm_h0_f2_owner;
alter table crm_private.global_access_revocation_attempts owner to crm_h0_f2_owner;
alter table crm_private.global_access_revocations enable row level security;
alter table crm_private.global_access_revocations force row level security;
alter table crm_private.global_access_revocation_attempts enable row level security;
alter table crm_private.global_access_revocation_attempts force row level security;
create policy h0_m05_revocation_executor on crm_private.global_access_revocations
  for all to crm_h0_f2_executor using (true) with check (true);
create policy h0_m05_attempt_executor on crm_private.global_access_revocation_attempts
  for all to crm_h0_f2_executor using (true) with check (true);
create policy h0_m05_revocation_migration on crm_private.global_access_revocations
  for all to crm_h0_migration using (true) with check (true);
create policy h0_m05_attempt_migration on crm_private.global_access_revocation_attempts
  for all to crm_h0_migration using (true) with check (true);
grant select,insert,update on crm_private.global_access_revocations to crm_h0_f2_executor;
grant select,insert on crm_private.global_access_revocation_attempts to crm_h0_f2_executor;
grant select,insert,update on crm_private.global_access_revocations to crm_h0_migration;
grant select,insert on crm_private.global_access_revocation_attempts to crm_h0_migration;
revoke all on crm_private.global_access_revocations,
  crm_private.global_access_revocation_attempts from public,crm_h0_runtime;

-- Preserve D039's login/target partition while adding one exact technical
-- target for recording the bounded Auth outcome after Core is already closed.
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

create function crm_api.start_global_access_revocation(p bytea,s bytea,q bytea)
returns table(revocation_id uuid,access_generation bigint,admin_scope text)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
#variable_conflict use_column
declare f text[]; qf text[]; a crm_private.crm_actors%rowtype;
  ss crm_private.crm_sessions%rowtype; ep crm_private.identification_epochs%rowtype;
  at_time timestamptz; new_generation bigint; requested_revocation uuid;
begin
  f:=crm_f2.verify(p,s,q,'revoke_all','human_actor','revoke_all');
  qf:=crm_f1.fields(q);
  if f[16]<>'session-revocation' or f[21]<>'administrative_action'
    or cardinality(qf)<>4 or qf[1]<>'CRM-F2-INP1' or qf[2]<>'revoke_all'
    or qf[3]<>f[12]
  then raise exception 'H0_M05_DENIED' using errcode='42501'; end if;
  requested_revocation:=qf[4]::uuid;
  select * into strict a from crm_private.crm_actors where actor_id=f[12]::uuid for update;
  select * into strict ss from crm_private.crm_sessions where session_id=f[13]::uuid for update;
  select * into strict ep from crm_private.identification_epochs where epoch_id=f[14]::uuid for update;
  at_time:=clock_timestamp();
  if a.auth_subject<>f[11]::uuid or not a.enabled or a.access_state<>'ready'
    or a.admin_scope<>f[17] or a.access_generation<>f[15]::bigint
    or a.access_generation=9223372036854775807
    or ss.actor_id<>a.actor_id or ss.auth_subject<>a.auth_subject
    or ss.access_generation<>a.access_generation or ss.revoked_at is not null
    or ep.session_id<>ss.session_id or not ep.current_epoch
    or not ep.full_password or not ep.full_mfa or ep.access_state<>'ready'
    or not crm_f2.within_limit(at_time,ep.identified_at,30)
    or not crm_f2.within_limit(at_time,ep.last_human_activity_at,7)
  then raise exception 'H0_M05_DENIED' using errcode='42501'; end if;
  perform crm_f2.verify(p,s,q,'revoke_all','human_actor','revoke_all');
  update crm_private.crm_actors set access_generation=crm_actors.access_generation+1,
    updated_at=at_time where actor_id=a.actor_id returning crm_actors.access_generation into new_generation;
  insert into crm_private.global_access_revocations(
    revocation_id,actor_id,auth_subject,initiating_session_id,
    previous_access_generation,access_generation,admin_scope,core_revoked_at
  ) values (
    requested_revocation,a.actor_id,a.auth_subject,ss.session_id,
    a.access_generation,new_generation,a.admin_scope,at_time
  );
  perform crm_f2.verify(p,s,q,'revoke_all','human_actor','revoke_all');
  return query select requested_revocation,new_generation,a.admin_scope;
exception when others then raise exception 'H0_M05_DENIED' using errcode='42501';
end $$;
alter function crm_api.start_global_access_revocation(bytea,bytea,bytea)
  owner to crm_h0_f2_executor;

create function crm_api.record_global_auth_revocation_outcome(p bytea,s bytea,q bytea)
returns table(auth_state text)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
#variable_conflict use_column
declare f text[]; qf text[]; current_record crm_private.global_access_revocations%rowtype;
  requested_revocation uuid; requested_attempt uuid; requested_outcome text;
  at_time timestamptz; next_attempt integer;
begin
  f:=crm_f1.verify_envelope(p,s,q,'C03','global_access_revocation','record_auth_outcome');
  qf:=crm_f1.fields(q);
  if cardinality(qf)<>5 or qf[1]<>'CRM-H0-M05-AUTH1' or qf[2]<>'C03'
    or qf[5] not in ('revoked','failed','uncertain')
  then raise exception 'H0_M05_DENIED' using errcode='42501'; end if;
  requested_revocation:=qf[3]::uuid;
  requested_attempt:=qf[4]::uuid;
  requested_outcome:=qf[5];
  select * into strict current_record from crm_private.global_access_revocations
    where revocation_id=requested_revocation for update;
  if current_record.admin_scope collate "C"<>f[14] collate "C"
    or current_record.auth_state='revoked'
  then raise exception 'H0_M05_DENIED' using errcode='42501'; end if;
  at_time:=clock_timestamp();
  next_attempt:=current_record.auth_attempt_count+1;
  insert into crm_private.global_access_revocation_attempts(
    attempt_id,revocation_id,attempt_number,outcome,recorded_at
  ) values (requested_attempt,requested_revocation,next_attempt,requested_outcome,at_time);
  update crm_private.global_access_revocations set
    auth_state=requested_outcome,
    auth_attempt_count=next_attempt,
    last_auth_attempt_at=at_time,
    auth_revoked_at=case when requested_outcome='revoked' then at_time else null end
    where revocation_id=requested_revocation;
  perform crm_f1.verify_envelope(p,s,q,'C03','global_access_revocation','record_auth_outcome');
  return query select requested_outcome;
exception when others then raise exception 'H0_M05_DENIED' using errcode='42501';
end $$;
alter function crm_api.record_global_auth_revocation_outcome(bytea,bytea,bytea)
  owner to crm_h0_f2_executor;

revoke execute on function crm_api.start_global_access_revocation(bytea,bytea,bytea),
  crm_api.record_global_auth_revocation_outcome(bytea,bytea,bytea)
  from public;
grant execute on function crm_api.start_global_access_revocation(bytea,bytea,bytea),
  crm_api.record_global_auth_revocation_outcome(bytea,bytea,bytea)
  to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
alter default privileges for role crm_h0_migration in schema crm_private
  revoke all on tables from public;
alter default privileges for role crm_h0_migration in schema crm_api
  revoke execute on functions from public;
commit;
