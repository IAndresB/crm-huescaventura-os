-- D039 / H0-012-F05. Authorized local cluster bootstrap; no password or membership.
begin;
create role crm_h0_ha_tx login nosuperuser nocreatedb nocreaterole noinherit nobypassrls noreplication;
commit;
