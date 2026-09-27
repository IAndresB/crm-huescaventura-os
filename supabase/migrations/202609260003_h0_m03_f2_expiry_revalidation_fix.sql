-- H0-006-F02: an initially valid F2 must still be valid after lock waits and
-- before a protected unit can commit. Historical H0-M03/F01 migrations remain intact.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M03_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;

-- Existing functions belong to this NOLOGIN owner. CREATE is temporary and
-- revoked before COMMIT; no new function signature or runtime grant is added.
grant create on schema crm_api, crm_f2 to crm_h0_f2_executor;

create or replace function crm_api.establish_session(p bytea,s bytea,q bytea) returns uuid
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
  -- Re-read PostgreSQL's real clock after the actor lock, before either INSERT.
  perform crm_f2.verify(p,s,q,'establish','human_session','establish');
  at_time:=clock_timestamp();
  insert into crm_private.crm_sessions(session_id,actor_id,auth_subject,access_generation,created_at)
    values(f[13]::uuid,a.actor_id,a.auth_subject,a.access_generation,at_time);
  insert into crm_private.identification_epochs(epoch_id,session_id,identified_at,
    last_human_activity_at,full_password,full_mfa,access_state,current_epoch)
    values(f[14]::uuid,f[13]::uuid,at_time,at_time,true,true,'ready',true);
  -- Any lock wait inside the INSERTs still aborts the entire unit on expiry.
  perform crm_f2.verify(p,s,q,'establish','human_session','establish');
  return f[14]::uuid;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;

create or replace function crm_api.reidentify_session(p bytea,s bytea,q bytea) returns uuid
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
  perform crm_f2.verify(p,s,q,'reidentify','human_session','reidentify');
  at_time:=clock_timestamp();
  update crm_private.identification_epochs set current_epoch=false,closed_at=at_time
    where epoch_id=old_epoch.epoch_id;
  update crm_private.crm_sessions set access_generation=a.access_generation
    where session_id=ss.session_id;
  insert into crm_private.identification_epochs(epoch_id,session_id,identified_at,
    last_human_activity_at,full_password,full_mfa,access_state,current_epoch)
    values(qf[5]::uuid,ss.session_id,at_time,at_time,true,true,'ready',true);
  perform crm_f2.verify(p,s,q,'reidentify','human_session','reidentify');
  return qf[5]::uuid;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;

create or replace function crm_f2.admit(p bytea,s bytea,q bytea,expected_op text,expected_action text)
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
  perform crm_f2.verify(p,s,q,expected_op,'human_core_probe',expected_action);
  update crm_private.identification_epochs set last_human_activity_at=at_time
    where epoch_id=ep.epoch_id;
  perform crm_f2.verify(p,s,q,expected_op,'human_core_probe',expected_action);
  return f;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;

create or replace function crm_api.revoke_session(p bytea,s bytea,q bytea) returns void
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
  perform crm_f2.verify(p,s,q,'revoke_one','human_session','revoke_one');
  update crm_private.crm_sessions set revoked_at=clock_timestamp() where session_id=ss.session_id;
  perform crm_f2.verify(p,s,q,'revoke_one','human_session','revoke_one');
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;

-- Preserve F01's actor -> initiating session -> current epoch authority checks.
create or replace function crm_api.revoke_all_sessions(p bytea,s bytea,q bytea)
returns bigint language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[]; a crm_private.crm_actors%rowtype;
  ss crm_private.crm_sessions%rowtype; ep crm_private.identification_epochs%rowtype;
  at_time timestamptz; new_generation bigint;
begin
  f:=crm_f2.verify(p,s,q,'revoke_all','human_actor','revoke_all');
  qf:=crm_f1.fields(q);
  if f[16]<>'session-revocation' or f[21]<>'administrative_action'
    or cardinality(qf)<>3 or qf[1]<>'CRM-F2-INP1' or qf[2]<>'revoke_all'
    or qf[3]<>f[12]
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  select * into strict a from crm_private.crm_actors
    where actor_id=f[12]::uuid for update;
  select * into strict ss from crm_private.crm_sessions
    where session_id=f[13]::uuid for update;
  select * into strict ep from crm_private.identification_epochs
    where epoch_id=f[14]::uuid for update;
  at_time:=clock_timestamp();
  if a.auth_subject<>f[11]::uuid or not a.enabled or a.access_state<>'ready'
    or a.admin_scope<>f[17] or a.access_generation<>f[15]::bigint
    or ss.actor_id<>a.actor_id or ss.auth_subject<>a.auth_subject
    or ss.access_generation<>a.access_generation or ss.revoked_at is not null
    or ep.session_id<>ss.session_id or not ep.current_epoch
    or not ep.full_password or not ep.full_mfa or ep.access_state<>'ready'
    or not crm_f2.within_limit(at_time,ep.identified_at,30)
    or not crm_f2.within_limit(at_time,ep.last_human_activity_at,7)
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  perform crm_f2.verify(p,s,q,'revoke_all','human_actor','revoke_all');
  if a.access_generation=9223372036854775807
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  update crm_private.crm_actors set access_generation=access_generation+1,
    updated_at=clock_timestamp() where actor_id=a.actor_id
    returning access_generation into new_generation;
  perform crm_f2.verify(p,s,q,'revoke_all','human_actor','revoke_all');
  return new_generation;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;

-- F2 is checked after admission locks, after F1 work, and before this call can
-- return/commit. A wait inside the delegated F1 call rolls back both F2
-- activity and Core effects if the F2 window closes meanwhile.
create or replace function crm_api.human_read_probe(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(probe_id text,public_value text)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare hf text[]; tf text[];
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C01','read_probe');
  tf:=crm_f1.verify(f1p,f1s,q,'C01');
  if tf[14] collate "C"<>hf[17] collate "C" then
    raise exception 'F2_DENIED' using errcode='42501'; end if;
  perform crm_f2.verify(f2p,f2s,q,'C01','human_core_probe','read_probe');
  return query select r.probe_id,r.public_value from crm_api.read_probe(f1p,f1s,q) r;
  perform crm_f2.verify(f2p,f2s,q,'C01','human_core_probe','read_probe');
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;

create or replace function crm_api.human_apply_probe_batch(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns text[] language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare hf text[]; tf text[]; result text[];
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');
  tf:=crm_f1.verify(f1p,f1s,q,'C03');
  if tf[14] collate "C"<>hf[17] collate "C" then
    raise exception 'F2_DENIED' using errcode='42501'; end if;
  perform crm_f2.verify(f2p,f2s,q,'C03','human_core_probe','apply_probe_batch');
  result:=crm_api.apply_probe_batch(f1p,f1s,q);
  perform crm_f2.verify(f2p,f2s,q,'C03','human_core_probe','apply_probe_batch');
  return result;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;

revoke create on schema crm_api, crm_f2 from crm_h0_f2_executor;
commit;
