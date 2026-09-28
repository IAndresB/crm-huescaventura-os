-- H0-M06: isolated recovery gate. No provider, address, factor or secret is stored.
-- Forward only; previous actor, session, epoch and historical rows remain intact.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M06_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;
grant usage, create on schema crm_private to crm_h0_f2_owner;
grant usage, create on schema crm_api to crm_h0_f2_executor;
create table crm_private.access_recoveries (
  recovery_id uuid primary key,
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  auth_subject uuid not null,
  recovery_kind text not null check (recovery_kind in ('password','break_glass')),
  admin_scope text not null check (admin_scope <> ''),
  previous_generation bigint not null check (previous_generation > 0),
  access_generation bigint not null check (access_generation = previous_generation + 1),
  started_at timestamptz not null,
  auth_state text not null default 'pending' check (auth_state in ('pending','revoked','failed','uncertain')),
  auth_recorded_at timestamptz,
  completed_at timestamptz,
  password_ready boolean not null default false,
  totp_verified boolean not null default false,
  new_factor_enrolled boolean not null default false,
  old_factor_revoked boolean not null default false,
  new_paper_copy_verified boolean not null default false,
  check ((auth_state='pending' and auth_recorded_at is null)
    or (auth_state<>'pending' and auth_recorded_at is not null)),
  check (completed_at is null or auth_state='revoked')
);
create unique index access_recovery_one_open_per_actor
  on crm_private.access_recoveries(actor_id) where completed_at is null;
alter table crm_private.access_recoveries owner to crm_h0_f2_owner;
alter table crm_private.access_recoveries enable row level security;
alter table crm_private.access_recoveries force row level security;
create policy h0_m06_recovery_executor on crm_private.access_recoveries
  for all to crm_h0_f2_executor using (true) with check (true);
create policy h0_m06_recovery_migration on crm_private.access_recoveries
  for all to crm_h0_migration using (true) with check (true);
grant select,insert,update on crm_private.access_recoveries to crm_h0_f2_executor,crm_h0_migration;
revoke all on crm_private.access_recoveries from public,crm_h0_runtime;
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

create function crm_api.recovery_lookup(v_subject uuid)
returns table(actor_id uuid,admin_scope text,access_state text)
language sql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
  select a.actor_id,a.admin_scope,a.access_state from crm_private.crm_actors a
  where a.auth_subject=v_subject and a.enabled
$$;
alter function crm_api.recovery_lookup(uuid) owner to crm_h0_f2_executor;
revoke execute on function crm_api.recovery_lookup(uuid) from public;
grant execute on function crm_api.recovery_lookup(uuid) to crm_h0_runtime;

create function crm_api.recovery_status(v_id uuid)
returns table(actor_id uuid,auth_subject uuid,admin_scope text,recovery_kind text,
  auth_state text,completed boolean)
language sql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
  select r.actor_id,r.auth_subject,r.admin_scope,r.recovery_kind,r.auth_state,
    r.completed_at is not null from crm_private.access_recoveries r where r.recovery_id=v_id
$$;
alter function crm_api.recovery_status(uuid) owner to crm_h0_f2_executor;
revoke execute on function crm_api.recovery_status(uuid) from public;
grant execute on function crm_api.recovery_status(uuid) to crm_h0_runtime;

create function crm_api.begin_access_recovery(p bytea,s bytea,q bytea)
returns table(recovery_id uuid,access_generation bigint,admin_scope text,fresh boolean)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
#variable_conflict use_column
declare f text[]; v text[]; a crm_private.crm_actors%rowtype;
  prior crm_private.access_recoveries%rowtype; rid uuid; aid uuid; subj uuid;
  new_generation bigint; at_time timestamptz;
begin
  f:=crm_f1.verify_envelope(p,s,q,'C03','access_recovery','begin');
  v:=crm_f1.fields(q);
  if cardinality(v)<>6 or v[1]<>'CRM-H0-M06-REC1' or v[2]<>'begin'
    or v[4] not in ('password','break_glass')
  then raise exception 'H0_M06_DENIED' using errcode='42501'; end if;
  rid:=v[3]::uuid; aid:=v[5]::uuid; subj:=v[6]::uuid;
  select * into strict a from crm_private.crm_actors where actor_id=aid for update;
  if not a.enabled or a.auth_subject<>subj or a.admin_scope collate "C"<>f[14] collate "C"
  then raise exception 'H0_M06_DENIED' using errcode='42501'; end if;
  select * into prior from crm_private.access_recoveries where access_recoveries.recovery_id=rid;
  if found then
    if prior.actor_id<>aid or prior.auth_subject<>subj or prior.recovery_kind<>v[4]
      or prior.completed_at is not null or a.access_state<>'recovery_in_progress'
      or prior.access_generation<>a.access_generation
    then raise exception 'H0_M06_DENIED' using errcode='42501'; end if;
    perform crm_f1.verify_envelope(p,s,q,'C03','access_recovery','begin');
    return query select rid,prior.access_generation,a.admin_scope,false;
    return;
  end if;
  if a.access_state not in ('ready','enrollment_required','reidentification_required')
    or a.access_generation=9223372036854775807
    or exists(select 1 from crm_private.access_recoveries r
      where r.actor_id=aid and r.completed_at is null)
  then raise exception 'H0_M06_DENIED' using errcode='42501'; end if;
  at_time:=clock_timestamp();
  update crm_private.crm_actors set access_generation=crm_actors.access_generation+1,
    access_state='recovery_in_progress',updated_at=at_time
    where actor_id=aid returning crm_actors.access_generation into new_generation;
  insert into crm_private.access_recoveries(recovery_id,actor_id,auth_subject,recovery_kind,
    admin_scope,previous_generation,access_generation,started_at)
    values(rid,aid,subj,v[4],a.admin_scope,a.access_generation,new_generation,at_time);
  perform crm_f1.verify_envelope(p,s,q,'C03','access_recovery','begin');
  return query select rid,new_generation,a.admin_scope,true;
exception when others then raise exception 'H0_M06_DENIED' using errcode='42501';
end $$;
alter function crm_api.begin_access_recovery(bytea,bytea,bytea) owner to crm_h0_f2_executor;

create function crm_api.record_recovery_auth_outcome(p bytea,s bytea,q bytea)
returns text language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; v text[]; r crm_private.access_recoveries%rowtype;
  a crm_private.crm_actors%rowtype; rid uuid; outcome text;
begin
  f:=crm_f1.verify_envelope(p,s,q,'C03','access_recovery','record_auth_outcome');
  v:=crm_f1.fields(q);
  if cardinality(v)<>4 or v[1]<>'CRM-H0-M06-REC1' or v[2]<>'auth'
    or v[4] not in ('revoked','failed','uncertain')
  then raise exception 'H0_M06_DENIED' using errcode='42501'; end if;
  rid:=v[3]::uuid; outcome:=v[4];
  select * into strict r from crm_private.access_recoveries where recovery_id=rid;
  select * into strict a from crm_private.crm_actors where actor_id=r.actor_id for update;
  select * into strict r from crm_private.access_recoveries where recovery_id=rid for update;
  if r.admin_scope collate "C"<>f[14] collate "C"
    or a.access_generation<>r.access_generation or a.access_state<>'recovery_in_progress'
    or r.completed_at is not null or (r.auth_state<>'pending' and r.auth_state<>outcome)
  then raise exception 'H0_M06_DENIED' using errcode='42501'; end if;
  if r.auth_state='pending' then
    update crm_private.access_recoveries set auth_state=outcome,
      auth_recorded_at=clock_timestamp() where recovery_id=rid;
  end if;
  perform crm_f1.verify_envelope(p,s,q,'C03','access_recovery','record_auth_outcome');
  return outcome;
exception when others then raise exception 'H0_M06_DENIED' using errcode='42501';
end $$;
alter function crm_api.record_recovery_auth_outcome(bytea,bytea,bytea) owner to crm_h0_f2_executor;

create function crm_api.complete_access_recovery(p bytea,s bytea,q bytea)
returns bigint language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; v text[]; r crm_private.access_recoveries%rowtype;
  a crm_private.crm_actors%rowtype; rid uuid; aid uuid; subj uuid;
begin
  f:=crm_f1.verify_envelope(p,s,q,'C03','access_recovery','complete');
  v:=crm_f1.fields(q);
  if cardinality(v)<>10 or v[1]<>'CRM-H0-M06-REC1' or v[2]<>'complete'
    or v[6]<>'true' or v[7]<>'true'
  then raise exception 'H0_M06_DENIED' using errcode='42501'; end if;
  rid:=v[3]::uuid; aid:=v[4]::uuid; subj:=v[5]::uuid;
  select * into strict a from crm_private.crm_actors where actor_id=aid for update;
  select * into strict r from crm_private.access_recoveries where recovery_id=rid for update;
  if not a.enabled or a.auth_subject<>subj or r.actor_id<>aid or r.auth_subject<>subj
    or a.admin_scope collate "C"<>f[14] collate "C"
    or r.admin_scope collate "C"<>f[14] collate "C"
    or a.access_generation<>r.access_generation or r.auth_state<>'revoked'
    or (r.recovery_kind='break_glass' and (v[8]<>'true' or v[9]<>'true' or v[10]<>'true'))
    or a.access_state not in ('recovery_in_progress','ready')
    or (r.completed_at is null and a.access_state<>'recovery_in_progress')
    or (r.completed_at is not null and a.access_state<>'ready')
  then raise exception 'H0_M06_DENIED' using errcode='42501'; end if;
  if r.completed_at is null then
    update crm_private.access_recoveries set completed_at=clock_timestamp(),
      password_ready=true,totp_verified=true,new_factor_enrolled=(v[8]='true'),
      old_factor_revoked=(v[9]='true'),new_paper_copy_verified=(v[10]='true')
      where recovery_id=rid;
    update crm_private.crm_actors set access_state='ready',updated_at=clock_timestamp()
      where actor_id=aid;
  end if;
  perform crm_f1.verify_envelope(p,s,q,'C03','access_recovery','complete');
  return r.access_generation;
exception when others then raise exception 'H0_M06_DENIED' using errcode='42501';
end $$;
alter function crm_api.complete_access_recovery(bytea,bytea,bytea) owner to crm_h0_f2_executor;

revoke execute on function crm_api.begin_access_recovery(bytea,bytea,bytea),
  crm_api.record_recovery_auth_outcome(bytea,bytea,bytea),
  crm_api.complete_access_recovery(bytea,bytea,bytea) from public;
grant execute on function crm_api.begin_access_recovery(bytea,bytea,bytea),
  crm_api.record_recovery_auth_outcome(bytea,bytea,bytea),
  crm_api.complete_access_recovery(bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
alter default privileges for role crm_h0_migration in schema crm_private revoke all on tables from public;
alter default privileges for role crm_h0_migration in schema crm_api revoke execute on functions from public;
commit;
