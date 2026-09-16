-- Forward from H0-M01. Administrative role bootstrap; never runtime traffic.
-- Requires CREATEROLE and authority to grant the newly created roles, not SUPERUSER.
begin;
create role crm_h0_table_owner nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls noreplication;
create role crm_h0_verifier nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls noreplication;
create role crm_h0_executor nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls noreplication;
grant crm_h0_table_owner, crm_h0_verifier, crm_h0_executor to crm_h0_migration
  with admin true, inherit true, set true;
do $$
begin
  if not exists (select 1 from pg_catalog.pg_roles where rolname='crm_h0_runtime'
    and rolcanlogin and not rolsuper and not rolcreatedb and not rolcreaterole
    and not rolinherit and not rolbypassrls and not rolreplication) then
    raise exception 'F1_RUNTIME_ATTRIBUTES_DENIED';
  end if;
  if exists (select 1 from pg_catalog.pg_auth_members
    where member = 'crm_h0_runtime'::regrole) then
    raise exception 'F1_RUNTIME_MEMBERSHIP_DENIED';
  end if;
end
$$;
commit;
