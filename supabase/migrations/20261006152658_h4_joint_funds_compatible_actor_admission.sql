-- H4-019 F06. Preserve the fully evolved current admission body, including
-- operation/purpose expansions applied by H1/H2/H3/H4 forward migrations.
-- D038 §§13–16: compatible actor admission, exclusive session/epoch.
begin;
do $migration$
declare
  definition text;
  old_lock constant text := 'select * into strict a from crm_private.crm_actors where actor_id=f[12]::uuid for update;';
  new_lock constant text := 'select * into strict a from crm_private.crm_actors where actor_id=f[12]::uuid for share;';
begin
  if session_user <> 'crm_h0_migration' then
    raise exception 'MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
  definition := pg_get_functiondef('crm_f2.admit(bytea,bytea,bytea,text,text)'::regprocedure);
  if (length(definition)-length(replace(definition,old_lock,''))) / length(old_lock) <> 1 then
    raise exception 'F06_EXPECTED_ACTOR_LOCK_NOT_FOUND';
  end if;
  -- CREATE OR REPLACE retains OID/owner/ACL; the emitted definition retains
  -- all signature/configuration/attributes and all other bytes of the body.
  execute replace(definition,old_lock,new_lock);
end $migration$;
commit;
