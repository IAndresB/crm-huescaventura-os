-- Hosted platform authority preserves managed-service connectivity before removing PUBLIC.
do $$ declare r record; begin
 if current_user <> 'postgres' then raise exception 'HOSTED_PLATFORM_AUTHORITY_REQUIRED'; end if;
 for r in select rolname, has_database_privilege(oid,current_database(),'CONNECT') as c, has_database_privilege(oid,current_database(),'TEMP') as t from pg_roles where rolcanlogin and rolname not like 'crm_%' loop
   if r.c then execute format('grant connect on database %I to %I',current_database(),r.rolname); end if;
   if r.t then execute format('grant temporary on database %I to %I',current_database(),r.rolname); end if;
 end loop;
 execute format('revoke all on database %I from public',current_database());
 execute format('grant connect, create on database %I to crm_h0_migration',current_database());
 execute format('grant connect on database %I to crm_h0_runtime',current_database());
end $$;
revoke all on schema public from public;
revoke all on schema public from crm_h0_runtime;
grant crm_h0_migration to postgres with inherit false, set true;
set local role crm_h0_migration;
do $$ begin if current_user <> 'crm_h0_migration' then raise exception 'H0-M01 requires crm_h0_migration'; end if; end $$;
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

reset role;
