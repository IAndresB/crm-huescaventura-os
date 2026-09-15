-- H0-M01 bootstrap: run only with local cluster authority, never as runtime.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'crm_h0_migration') then
    create role crm_h0_migration login nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'crm_h0_runtime') then
    create role crm_h0_runtime login nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'crm_h0_untrusted') then
    create role crm_h0_untrusted login nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  end if;
end
$$;

alter role crm_h0_migration nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
alter role crm_h0_runtime nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
alter role crm_h0_untrusted nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
