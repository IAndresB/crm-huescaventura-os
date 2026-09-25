do $$ begin
 if not exists(select 1 from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='pgcrypto' and e.extversion='1.3' and n.nspname='extensions') then raise exception 'HOSTED_PGCRYPTO_MISMATCH'; end if;
end $$;
grant usage on schema extensions to crm_h0_verifier;
set local role crm_h0_migration;
-- Forward hardening. Apply as crm_h0_migration after the authority bootstrap.
-- No key, audience or generation is provisioned by this migration.
do $$ begin
  if current_user <> 'crm_h0_migration' then raise exception 'F1_MIGRATION_AUTHORITY_REQUIRED' using errcode = '42501'; end if;
end $$;
create schema crm_f1 authorization crm_h0_migration;
create schema crm_crypto authorization crm_h0_migration;
grant usage, create on schema crm_f1 to crm_h0_table_owner, crm_h0_verifier;
grant usage, create on schema crm_private to crm_h0_table_owner;
grant usage, create on schema crm_api to crm_h0_executor;
revoke all on schema crm_f1, crm_crypto from public;
-- Hosted: existing pgcrypto in extensions is asserted by platform preflight, not relocated.
-- Trusted extension objects are owned by PostgreSQL's bootstrap owner. Their
-- algorithms accept an explicit key and expose no F1 secret. Schema USAGE is
-- the access boundary; a non-superuser extension installer cannot rewrite ACLs
-- of the extension's C functions. F1 helpers below have explicit EXECUTE ACLs.
grant usage on schema crm_crypto to crm_h0_verifier;

revoke all on crm_private.access_probe from crm_h0_runtime;
-- Column ACLs survive a table-level REVOKE and must be revoked separately.
revoke select (probe_id, context_scope, public_value) on crm_private.access_probe from crm_h0_runtime;
revoke all on schema crm_private from crm_h0_runtime;
drop function crm_api.record_probe(text,text);
drop policy access_probe_scoped_read on crm_private.access_probe;
drop policy access_probe_scoped_insert on crm_private.access_probe;
alter table crm_private.access_probe owner to crm_h0_table_owner;
alter table crm_private.access_probe force row level security;
grant usage on schema crm_private, crm_f1 to crm_h0_executor;
grant usage on schema crm_f1 to crm_h0_verifier;
grant select (probe_id, context_scope, public_value), insert (probe_id, context_scope, public_value)
  on crm_private.access_probe to crm_h0_executor;

create table crm_f1.keys (
  key_id text primary key,
  secret bytea not null check (octet_length(secret) = 32),
  audience text not null check (audience <> ''),
  generation text not null check (generation <> ''),
  purposes text[] not null check (cardinality(purposes) > 0),
  enabled boolean not null default false,
  valid_from timestamptz not null,
  valid_until timestamptz not null check (valid_until > valid_from)
);
alter table crm_f1.keys owner to crm_h0_table_owner;
grant select on crm_f1.keys to crm_h0_verifier;
-- Protected technical consumption; never a durable business result/idempotency store.
create table crm_f1.consumption (
  generation text not null,
  database_oid oid not null,
  xid xid8 not null,
  capability_id text not null,
  expires_us bigint not null,
  primary key (generation, database_oid, xid, capability_id)
);
alter table crm_f1.consumption owner to crm_h0_table_owner;
grant insert on crm_f1.consumption to crm_h0_executor;
revoke all on all tables in schema crm_f1 from public, crm_h0_runtime;

create function crm_f1.fields(raw bytea) returns text[]
language plpgsql immutable security invoker set search_path = pg_catalog, pg_temp as $$
declare pos integer := 0; size integer; part bigint; result text[] := '{}'; value text;
begin
  if raw is null or octet_length(raw) = 0 or octet_length(raw) > 65536 then
    raise exception 'F1_DENIED' using errcode = '42501';
  end if;
  size := octet_length(raw);
  while pos < size loop
    if pos + 4 > size then raise exception 'F1_DENIED' using errcode = '42501'; end if;
    part := get_byte(raw,pos)::bigint * 16777216 + get_byte(raw,pos+1) * 65536
      + get_byte(raw,pos+2) * 256 + get_byte(raw,pos+3);
    pos := pos + 4;
    if part > 16384 or pos + part > size then raise exception 'F1_DENIED' using errcode = '42501'; end if;
    value := convert_from(substring(raw from pos+1 for part::integer), 'UTF8');
    result := array_append(result,value);
    pos := pos + part::integer;
  end loop;
  return result;
exception when others then raise exception 'F1_DENIED' using errcode = '42501';
end $$;
alter function crm_f1.fields(bytea) owner to crm_h0_verifier;

create function crm_f1.verify(p bytea, s bytea, q bytea, op text) returns text[]
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; k crm_f1.keys%rowtype; e bytea; b bytea; l bytea; r bytea;
  acc integer := 0; i integer; now_us bigint; qf text[];
begin
  if s is null or octet_length(s) <> 32 then raise exception 'F1_DENIED' using errcode='42501'; end if;
  f := crm_f1.fields(p); qf := crm_f1.fields(q);
  if cardinality(f) <> 21 or cardinality(qf) < 3 or array_position(f,'') is not null
    or f[1] <> 'CRM-H0F1' or f[2] <> '1' or qf[1] <> 'CRM-INP1'
    or f[12] <> 'technical' or f[15] <> op or qf[2] <> op
    or op not in ('C01','C03') or f[16] <> 'access_probe'
    or f[17] <> (case op when 'C01' then 'read_probe' else 'apply_probe_batch' end)
    or f[10] <> 'crm_h0_runtime' or session_user <> 'crm_h0_runtime'
    or current_setting('transaction_isolation') <> 'read committed'
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  select * into strict k from crm_f1.keys where key_id = f[3] collate "C";
  if not k.enabled or clock_timestamp() < k.valid_from or clock_timestamp() >= k.valid_until
    or f[4] collate "C" <> k.audience collate "C" or f[5] collate "C" <> k.generation collate "C"
    or not (f[13] = any(k.purposes))
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  e := extensions.hmac(p,k.secret,'sha256');
  b := extensions.gen_random_bytes(32);
  l := extensions.hmac(convert_to('CRM-H0F1-CMP-v1','UTF8') || e,b,'sha256');
  r := extensions.hmac(convert_to('CRM-H0F1-CMP-v1','UTF8') || s,b,'sha256');
  if e is null or b is null or l is null or r is null
    or octet_length(e) <> 32 or octet_length(b) <> 32
    or octet_length(l) <> 32 or octet_length(r) <> 32
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  for i in 0..31 loop acc := acc | (get_byte(l,i) # get_byte(r,i)); end loop;
  if acc <> 0 then raise exception 'F1_DENIED' using errcode='42501'; end if;
  now_us := floor(extract(epoch from clock_timestamp()) * 1000000)::bigint;
  if f[6] <> (select oid::text from pg_database where datname = current_database())
    or f[7] <> (extract(epoch from pg_postmaster_start_time()) * 1000000)::bigint::text
    or f[8] <> pg_current_xact_id()::text or f[9] <> pg_backend_pid()::text
    or f[18] <> encode(extensions.digest(q,'sha256'),'hex')
    or f[19] !~ '^(0|[1-9][0-9]{0,18})$' or f[20] !~ '^(0|[1-9][0-9]{0,18})$'
    or f[20]::bigint - f[19]::bigint <> 30000000
    or now_us < f[19]::bigint or now_us >= f[20]::bigint
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  if op = 'C01' then
    if cardinality(qf) <> 3 or qf[3] = '' then raise exception 'F1_DENIED' using errcode='42501'; end if;
  else
    if cardinality(qf) < 6 or qf[3] = '' or qf[4] <> 'true' or qf[5] <> 'true'
      or (cardinality(qf)-5) % 3 <> 0 then raise exception 'F1_DENIED' using errcode='42501'; end if;
    i := 6;
    while i <= cardinality(qf) loop
      if qf[i] <> 'record-technical-probe' or qf[i+1] = '' then
        raise exception 'F1_DENIED' using errcode='42501'; end if;
      i := i+3;
    end loop;
  end if;
  return f;
exception when others then raise exception 'F1_DENIED' using errcode='42501';
end $$;
alter function crm_f1.verify(bytea,bytea,bytea,text) owner to crm_h0_verifier;

create function crm_f1.row_allows(scope_value text, id_value text, public_value text, op text)
returns boolean language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[]; q bytea; i integer;
begin
  q := decode(current_setting('crm.f1_input',true),'hex');
  f := crm_f1.verify(decode(current_setting('crm.f1_payload',true),'hex'),
    decode(current_setting('crm.f1_mac',true),'hex'), q, op);
  if scope_value collate "C" <> f[14] collate "C" then return false; end if;
  qf := crm_f1.fields(q);
  if op = 'C01' then return id_value collate "C" = qf[3] collate "C"; end if;
  i := 6;
  while i <= cardinality(qf) loop
    if id_value collate "C" = qf[i+1] collate "C" and public_value collate "C" = qf[i+2] collate "C"
      then return true; end if;
    i := i+3;
  end loop;
  return false;
exception when others then return false;
end $$;
alter function crm_f1.row_allows(text,text,text,text) owner to crm_h0_verifier;
create policy access_probe_f1_read on crm_private.access_probe for select to crm_h0_executor
  using (crm_f1.row_allows(context_scope,probe_id,public_value,'C01'));
create policy access_probe_f1_insert on crm_private.access_probe for insert to crm_h0_executor
  with check (crm_f1.row_allows(context_scope,probe_id,public_value,'C03'));

create function crm_api.read_probe(p bytea, s bytea, q bytea)
returns table(probe_id text, public_value text)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[];
begin
  f := crm_f1.verify(p,s,q,'C01'); qf := crm_f1.fields(q);
  perform set_config('crm.f1_payload',encode(p,'hex'),true),
    set_config('crm.f1_mac',encode(s,'hex'),true),set_config('crm.f1_input',encode(q,'hex'),true);
  return query select a.probe_id,a.public_value from crm_private.access_probe a
    where a.probe_id collate "C" = qf[3] collate "C";
  perform crm_f1.verify(p,s,q,'C01');
  perform set_config('crm.f1_payload','',true),set_config('crm.f1_mac','',true),set_config('crm.f1_input','',true);
exception when others then raise exception 'F1_DENIED' using errcode='42501';
end $$;
alter function crm_api.read_probe(bytea,bytea,bytea) owner to crm_h0_executor;

create function crm_api.apply_probe_batch(p bytea, s bytea, q bytea) returns text[]
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[]; i integer; result text[] := '{}';
begin
  f := crm_f1.verify(p,s,q,'C03'); qf := crm_f1.fields(q);
  insert into crm_f1.consumption values (f[5],f[6]::oid,f[8]::xid8,f[21],f[20]::bigint);
  perform set_config('crm.f1_payload',encode(p,'hex'),true),
    set_config('crm.f1_mac',encode(s,'hex'),true),set_config('crm.f1_input',encode(q,'hex'),true);
  i := 6;
  while i <= cardinality(qf) loop
    insert into crm_private.access_probe (probe_id,context_scope,public_value)
      values (qf[i+1],f[14],qf[i+2]);
    result := array_append(result,qf[i+1]); i := i+3;
  end loop;
  perform crm_f1.verify(p,s,q,'C03');
  perform set_config('crm.f1_payload','',true),set_config('crm.f1_mac','',true),set_config('crm.f1_input','',true);
  return result;
exception when others then raise exception 'F1_DENIED' using errcode='42501';
end $$;
alter function crm_api.apply_probe_batch(bytea,bytea,bytea) owner to crm_h0_executor;

revoke all on all functions in schema crm_f1, crm_api from public, crm_h0_runtime;
grant execute on function crm_f1.fields(bytea),crm_f1.verify(bytea,bytea,bytea,text),
  crm_f1.row_allows(text,text,text,text) to crm_h0_executor;
grant execute on function crm_api.read_probe(bytea,bytea,bytea),
  crm_api.apply_probe_batch(bytea,bytea,bytea) to crm_h0_runtime;
alter default privileges for role crm_h0_migration in schema crm_f1 revoke execute on functions from public;
alter default privileges for role crm_h0_migration in schema crm_f1 revoke all on tables from public;
revoke create on schema crm_f1 from crm_h0_table_owner, crm_h0_verifier;
revoke create on schema crm_private from crm_h0_table_owner;
revoke create on schema crm_api from crm_h0_executor;

reset role;
