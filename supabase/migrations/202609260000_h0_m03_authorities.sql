-- H0-M03 forward role bootstrap. Run as the authorized local cluster role,
-- never as crm_h0_runtime. No credential or human identity is provisioned here.
begin;
create role crm_h0_f2_owner nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls noreplication;
create role crm_h0_f2_verifier nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls noreplication;
create role crm_h0_f2_executor nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls noreplication;
grant crm_h0_f2_owner, crm_h0_f2_verifier, crm_h0_f2_executor to crm_h0_migration
  with admin true, inherit true, set true;
do $$ begin
  if exists (select 1 from pg_catalog.pg_auth_members where member='crm_h0_runtime'::regrole)
    or not exists (select 1 from pg_catalog.pg_roles where rolname='crm_h0_runtime'
      and rolcanlogin and not rolsuper and not rolcreatedb and not rolcreaterole
      and not rolinherit and not rolbypassrls)
  then raise exception 'H0_M03_RUNTIME_DENIED' using errcode='42501'; end if;
end $$;
commit;
