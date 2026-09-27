-- H0-012-F04: close an evidence-backed unit in the same server message as
-- its final evidence check. A deferred constraint may be fired early with
-- SET CONSTRAINTS; the explicit final function remains the last check and
-- COMMIT follows it without a client/driver gap.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M04_F04_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;

grant create on schema crm_api to crm_h0_f2_executor;
set local role crm_h0_f2_executor;
create function crm_api.h0_m04_finalize_evidence(command_key text) returns void
language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
begin
  if command_key is null or command_key !~ '^[a-z][a-z0-9-]{0,127}$' then
    raise exception 'H0_M04_EVIDENCE_DENIED' using errcode='42501';
  end if;
  perform crm_ha.check_evidence_at_end(command_key);
end $$;
alter function crm_api.h0_m04_finalize_evidence(text) owner to crm_h0_f2_executor;
revoke all on function crm_api.h0_m04_finalize_evidence(text) from public,crm_h0_runtime;
grant execute on function crm_api.h0_m04_finalize_evidence(text) to crm_h0_runtime;
reset role;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
