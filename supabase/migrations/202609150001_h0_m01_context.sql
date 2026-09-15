-- H0-M01 database migration: execute as crm_h0_migration, never as runtime.
do $$
begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0-M01 requires crm_h0_migration';
  end if;
  execute format('revoke all on database %I from public', current_database());
  execute format('grant connect on database %I to crm_h0_migration', current_database());
  execute format('grant connect on database %I to crm_h0_runtime', current_database());
end
$$;

revoke all on schema public from public;
revoke all on schema public from crm_h0_runtime;

create schema crm_private authorization crm_h0_migration;
create schema crm_api authorization crm_h0_migration;

revoke all on schema crm_private from public;
revoke all on schema crm_api from public;
grant usage on schema crm_private to crm_h0_runtime;
grant usage on schema crm_api to crm_h0_runtime;

create table crm_private.access_probe (
  probe_id text primary key,
  context_scope text not null,
  public_value text not null,
  private_value text not null default 'restricted'
);

alter table crm_private.access_probe enable row level security;
alter table crm_private.access_probe force row level security;

create policy access_probe_scoped_read
  on crm_private.access_probe
  for select
  to crm_h0_runtime
  using (
    nullif(current_setting('crm.identity_id', true), '') is not null
    and current_setting('crm.identity_kind', true) = 'technical'
    and context_scope = current_setting('crm.scope', true)
  );

create policy access_probe_scoped_insert
  on crm_private.access_probe
  for insert
  to public
  with check (
    nullif(current_setting('crm.identity_id', true), '') is not null
    and current_setting('crm.identity_kind', true) = 'technical'
    and context_scope = current_setting('crm.scope', true)
  );

grant select (probe_id, context_scope, public_value)
  on crm_private.access_probe
  to crm_h0_runtime;

create function crm_api.record_probe(
  requested_probe_id text,
  requested_public_value text
)
returns text
language sql
security definer
set search_path = pg_catalog, crm_private
as $$
  insert into crm_private.access_probe (
    probe_id,
    context_scope,
    public_value
  ) values (
    requested_probe_id,
    current_setting('crm.scope', true),
    requested_public_value
  );
  select requested_probe_id
$$;

revoke all on function crm_api.record_probe(text, text) from public;
grant execute on function crm_api.record_probe(text, text) to crm_h0_runtime;

revoke all on all tables in schema crm_private from public;
revoke all on all sequences in schema crm_private from public;
revoke all on all functions in schema crm_api from public;
grant execute on function crm_api.record_probe(text, text) to crm_h0_runtime;

alter default privileges for role crm_h0_migration in schema crm_private
  revoke all on tables from public;
alter default privileges for role crm_h0_migration in schema crm_private
  revoke all on sequences from public;
alter default privileges for role crm_h0_migration in schema crm_api
  revoke execute on functions from public;
