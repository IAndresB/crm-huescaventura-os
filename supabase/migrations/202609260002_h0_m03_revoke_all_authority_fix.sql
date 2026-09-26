-- H0-006-F01: only a live initiating human session can invalidate all sessions.
-- Forward migration; H0-M03 published definitions remain historical and intact.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M03_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;
-- CREATE is needed only while assigning the new function to its NOLOGIN owner.
grant create on schema crm_api to crm_h0_f2_executor;

-- Server-side preparation is deliberately read-only and narrow. It is not
-- authority by itself; the signed F2 and locked mutation below recheck state.
create function crm_api.f2_lookup_revoke_all_authority(v_subject uuid, v_session uuid)
returns table(actor_id uuid, access_generation bigint, admin_scope text, epoch_id uuid)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare at_time timestamptz;
begin
  at_time := clock_timestamp();
  return query select a.actor_id,a.access_generation,a.admin_scope,e.epoch_id
    from crm_private.crm_actors a
    join crm_private.crm_sessions s on s.actor_id=a.actor_id
      and s.auth_subject=a.auth_subject and s.session_id=v_session
    join crm_private.identification_epochs e on e.session_id=s.session_id
      and e.current_epoch
    where a.auth_subject=v_subject and a.enabled and a.access_state='ready'
      and s.revoked_at is null and s.access_generation=a.access_generation
      and e.full_password and e.full_mfa and e.access_state='ready'
      and crm_f2.within_limit(at_time,e.identified_at,30)
      and crm_f2.within_limit(at_time,e.last_human_activity_at,7);
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.f2_lookup_revoke_all_authority(uuid,uuid) owner to crm_h0_f2_executor;
revoke execute on function crm_api.f2_lookup_revoke_all_authority(uuid,uuid) from public;
grant execute on function crm_api.f2_lookup_revoke_all_authority(uuid,uuid)
  to crm_h0_runtime;

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
  -- Shared lock order: actor, initiating session, current identification epoch.
  select * into strict a from crm_private.crm_actors
    where actor_id=f[12]::uuid for update;
  select * into strict ss from crm_private.crm_sessions
    where session_id=f[13]::uuid for update;
  select * into strict ep from crm_private.identification_epochs
    where epoch_id=f[14]::uuid for update;
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
    or floor(extract(epoch from at_time)*1000000)::bigint>=f[24]::bigint
  then raise exception 'F2_DENIED' using errcode='42501'; end if;
  update crm_private.crm_actors set access_generation=access_generation+1,
    updated_at=clock_timestamp() where actor_id=a.actor_id
    returning access_generation into new_generation;
  return new_generation;
exception when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;
alter function crm_api.revoke_all_sessions(bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.revoke_all_sessions(bytea,bytea,bytea) from public;
grant execute on function crm_api.revoke_all_sessions(bytea,bytea,bytea)
  to crm_h0_runtime;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
