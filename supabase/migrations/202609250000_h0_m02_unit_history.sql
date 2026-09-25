-- H0-M02: durable internal-unit state, history, result and external intent.
-- Forward only from H0-M01 + F1. No commercial schema and no provider effect.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M02_MIGRATION_AUTHORITY_REQUIRED' using errcode = '42501';
  end if;
end $$;
-- Ownership transfers require transient CREATE on the containing schema.
-- The grants are revoked again before COMMIT.
grant usage, create on schema crm_private to crm_h0_table_owner;
grant usage, create on schema crm_f1 to crm_h0_verifier;
grant usage, create on schema crm_api to crm_h0_executor;

create table crm_private.unit_roots (
  root_id text primary key check (root_id ~ '^[a-z][a-z0-9-]{0,127}$'),
  context_scope text not null,
  version bigint not null check (version >= 0),
  current_value text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table crm_private.unit_operations (
  operation_id text primary key check (operation_id ~ '^[a-z][a-z0-9-]{0,127}$'),
  operation_class text not null check (operation_class = 'technical-state-change'),
  root_id text not null references crm_private.unit_roots(root_id),
  context_scope text not null,
  material_fingerprint text not null check (material_fingerprint ~ '^[0-9a-f]{64}$'),
  actor_id text not null,
  actor_kind text not null check (actor_kind = 'technical'),
  purpose text not null,
  cause text not null,
  source text not null,
  happened_at timestamptz,
  recorded_at timestamptz not null,
  expected_version bigint not null check (expected_version >= 0),
  resulting_version bigint not null check (resulting_version = expected_version + 1),
  initial_attempt_id text not null,
  effect_id text,
  intent_id text
);

create table crm_private.unit_attempts (
  attempt_id text primary key,
  operation_id text not null references crm_private.unit_operations(operation_id),
  root_id text not null,
  context_scope text not null,
  attempt_kind text not null check (attempt_kind in ('initial','replay')),
  recorded_at timestamptz not null
);

create table crm_private.unit_history (
  operation_id text primary key references crm_private.unit_operations(operation_id),
  root_id text not null,
  context_scope text not null,
  fact_kind text not null check (fact_kind = 'technical-state-change'),
  before_value text,
  after_value text not null,
  reason text not null,
  source text not null,
  happened_at timestamptz,
  recorded_at timestamptz not null,
  actor_id text not null,
  actor_kind text not null check (actor_kind = 'technical'),
  evidence_state text not null check (evidence_state in ('none','candidate'))
);

create table crm_private.unit_results (
  operation_id text primary key references crm_private.unit_operations(operation_id),
  root_id text not null,
  context_scope text not null,
  result_state text not null check (result_state = 'applied'),
  resulting_version bigint not null,
  after_value text not null,
  material_fingerprint text not null check (material_fingerprint ~ '^[0-9a-f]{64}$'),
  effect_id text,
  intent_id text,
  fixed_at timestamptz not null
);

create table crm_private.external_effect_records (
  record_id text primary key,
  operation_id text not null references crm_private.unit_operations(operation_id),
  root_id text not null,
  context_scope text not null,
  effect_id text not null,
  stage text not null check (stage in ('intent','attempt','result','uncertain')),
  intent_id text,
  attempt_id text,
  destination_reference text,
  content_version text,
  content_fingerprint text check (content_fingerprint is null or content_fingerprint ~ '^[0-9a-f]{64}$'),
  outcome text check (outcome is null or outcome in ('succeeded','failed')),
  result_reference text,
  recorded_at timestamptz not null,
  check (
    (stage = 'intent' and intent_id is not null and attempt_id is null
      and destination_reference is not null and content_version is not null
      and content_fingerprint is not null and outcome is null and result_reference is null)
    or (stage = 'attempt' and intent_id is not null and attempt_id is not null
      and outcome is null and result_reference is null)
    or (stage = 'result' and intent_id is not null and attempt_id is not null
      and outcome is not null and result_reference is not null)
    or (stage = 'uncertain' and intent_id is not null and attempt_id is not null
      and outcome is null and result_reference is null)
  )
);
create unique index external_effect_intent_id on crm_private.external_effect_records(intent_id)
  where stage = 'intent';
create unique index external_effect_identity on crm_private.external_effect_records(effect_id)
  where stage = 'intent';

alter table crm_private.unit_roots owner to crm_h0_table_owner;
alter table crm_private.unit_operations owner to crm_h0_table_owner;
alter table crm_private.unit_attempts owner to crm_h0_table_owner;
alter table crm_private.unit_history owner to crm_h0_table_owner;
alter table crm_private.unit_results owner to crm_h0_table_owner;
alter table crm_private.external_effect_records owner to crm_h0_table_owner;

alter table crm_private.unit_roots enable row level security;
alter table crm_private.unit_roots force row level security;
alter table crm_private.unit_operations enable row level security;
alter table crm_private.unit_operations force row level security;
alter table crm_private.unit_attempts enable row level security;
alter table crm_private.unit_attempts force row level security;
alter table crm_private.unit_history enable row level security;
alter table crm_private.unit_history force row level security;
alter table crm_private.unit_results enable row level security;
alter table crm_private.unit_results force row level security;
alter table crm_private.external_effect_records enable row level security;
alter table crm_private.external_effect_records force row level security;

grant select, insert, update on crm_private.unit_roots to crm_h0_executor;
grant select, insert on crm_private.unit_operations to crm_h0_executor;
grant insert on crm_private.unit_attempts to crm_h0_executor;
grant insert on crm_private.unit_history to crm_h0_executor;
grant select, insert on crm_private.unit_results to crm_h0_executor;
grant insert on crm_private.external_effect_records to crm_h0_executor;
revoke all on crm_private.unit_roots, crm_private.unit_operations,
  crm_private.unit_attempts, crm_private.unit_history, crm_private.unit_results,
  crm_private.external_effect_records from public, crm_h0_runtime;

-- Exact inverse of the server's uint32-length-prefixed UTF-8 field codec.
create function crm_f1.pack_fields(field_values text[]) returns bytea
language plpgsql immutable parallel safe security invoker
set search_path = pg_catalog, pg_temp as $$
declare result bytea := ''::bytea; value text; bytes bytea; size integer := 0;
begin
  if field_values is null or cardinality(field_values) = 0 then
    raise exception 'F1_DENIED' using errcode = '42501';
  end if;
  foreach value in array field_values loop
    if value is null then
      raise exception 'F1_DENIED' using errcode = '42501';
    end if;
    bytes := convert_to(value, 'UTF8');
    size := size + 4 + octet_length(bytes);
    if octet_length(bytes) > 16384 or size > 65536 then
      raise exception 'F1_DENIED' using errcode = '42501';
    end if;
    result := result || decode(lpad(to_hex(octet_length(bytes)),8,'0'),'hex') || bytes;
  end loop;
  return result;
exception when others then raise exception 'F1_DENIED' using errcode = '42501';
end $$;
alter function crm_f1.pack_fields(text[]) owner to crm_h0_verifier;

-- Shared F1 cryptographic/binding verification. It authenticates the exact
-- resource/action supplied by a narrow verifier; it does not interpret input.
create function crm_f1.verify_envelope(
  p bytea, s bytea, q bytea, op text, resource_name text, action_name text
) returns text[]
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; k crm_f1.keys%rowtype; e bytea; b bytea; l bytea; r bytea;
  acc integer := 0; i integer; now_us bigint;
begin
  if s is null or octet_length(s) <> 32 then raise exception 'F1_DENIED' using errcode='42501'; end if;
  f := crm_f1.fields(p);
  if cardinality(f) <> 21 or array_position(f,'') is not null
    or f[1] <> 'CRM-H0F1' or f[2] <> '1' or f[12] <> 'technical'
    or f[15] <> op or op not in ('C01','C03')
    or f[16] <> resource_name or f[17] <> action_name
    or f[10] <> 'crm_h0_runtime' or session_user <> 'crm_h0_runtime'
    or current_setting('transaction_isolation') <> 'read committed'
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  select * into strict k from crm_f1.keys where key_id = f[3] collate "C";
  if not k.enabled or clock_timestamp() < k.valid_from or clock_timestamp() >= k.valid_until
    or f[4] collate "C" <> k.audience collate "C" or f[5] collate "C" <> k.generation collate "C"
    or not (f[13] = any(k.purposes))
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  e := crm_crypto.hmac(p,k.secret,'sha256');
  b := crm_crypto.gen_random_bytes(32);
  l := crm_crypto.hmac(convert_to('CRM-H0F1-CMP-v1','UTF8') || e,b,'sha256');
  r := crm_crypto.hmac(convert_to('CRM-H0F1-CMP-v1','UTF8') || s,b,'sha256');
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
    or f[18] <> encode(crm_crypto.digest(q,'sha256'),'hex')
    or f[19] !~ '^(0|[1-9][0-9]{0,18})$' or f[20] !~ '^(0|[1-9][0-9]{0,18})$'
    or f[20]::bigint - f[19]::bigint <> 30000000
    or now_us < f[19]::bigint or now_us >= f[20]::bigint
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  return f;
exception when others then raise exception 'F1_DENIED' using errcode='42501';
end $$;
alter function crm_f1.verify_envelope(bytea,bytea,bytea,text,text,text) owner to crm_h0_verifier;

-- Preserve the original access-probe verifier while routing common checks
-- through the single hardened primitive above.
create or replace function crm_f1.verify(p bytea, s bytea, q bytea, op text) returns text[]
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[]; i integer;
begin
  f := crm_f1.verify_envelope(p,s,q,op,'access_probe',
    case op when 'C01' then 'read_probe' else 'apply_probe_batch' end);
  qf := crm_f1.fields(q);
  if cardinality(qf) < 3 or qf[1] <> 'CRM-INP1' or qf[2] <> op then
    raise exception 'F1_DENIED' using errcode='42501';
  end if;
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

create function crm_f1.verify_unit(p bytea, s bytea, q bytea) returns text[]
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[]; expected_material text; expected_content text;
begin
  f := crm_f1.verify_envelope(p,s,q,'C03','internal_unit','commit_internal_unit');
  qf := crm_f1.fields(q);
  if cardinality(qf) <> 18 or qf[1] <> 'CRM-UNIT1'
    or qf[2] !~ '^[a-z][a-z0-9-]{0,127}$'
    or qf[3] <> 'technical-state-change'
    or qf[4] !~ '^[a-z][a-z0-9-]{0,127}$'
    or qf[5] !~ '^(0|[1-9][0-9]{0,18})$'
    or qf[6] !~ '^[0-9a-f]{64}$'
    or qf[7] = '' or qf[8] = '' or qf[9] !~ '^[a-z][a-z0-9-]{0,127}$'
    or qf[11] = '' or qf[12] not in ('none','candidate')
    or qf[13] not in ('true','false')
  then raise exception 'F1_DENIED' using errcode='42501'; end if;
  if qf[10] <> '' then perform qf[10]::timestamptz; end if;
  if qf[13] = 'false' then
    if qf[14] <> '' or qf[15] <> '' or qf[16] <> '' or qf[17] <> '' or qf[18] <> '' then
      raise exception 'F1_DENIED' using errcode='42501'; end if;
  else
    if qf[14] !~ '^[a-z][a-z0-9-]{0,127}$' or qf[15] !~ '^[a-z][a-z0-9-]{0,127}$'
      or qf[16] = '' or qf[17] = '' or qf[18] !~ '^[0-9a-f]{64}$' then
      raise exception 'F1_DENIED' using errcode='42501'; end if;
    expected_content := encode(crm_crypto.digest(crm_f1.pack_fields(array[
      'CRM-INTENT-MATERIAL1',qf[14],qf[16],qf[17]
    ]),'sha256'),'hex');
    if qf[18] <> expected_content then raise exception 'F1_DENIED' using errcode='42501'; end if;
  end if;
  expected_material := encode(crm_crypto.digest(crm_f1.pack_fields(array[
    'CRM-UNIT-MATERIAL1',qf[3],qf[4],qf[5],qf[11],qf[8],qf[9],qf[10],qf[12],
    f[11],f[12],f[13],f[14],qf[13],qf[14],qf[15],qf[16],qf[17],qf[18]
  ]),'sha256'),'hex');
  if qf[6] <> expected_material then raise exception 'F1_DENIED' using errcode='42501'; end if;
  return f;
exception when others then raise exception 'F1_DENIED' using errcode='42501';
end $$;
alter function crm_f1.verify_unit(bytea,bytea,bytea) owner to crm_h0_verifier;

create function crm_f1.unit_row_allows(scope_value text, root_value text) returns boolean
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[]; q bytea;
begin
  q := decode(current_setting('crm.f1_input',true),'hex');
  f := crm_f1.verify_unit(decode(current_setting('crm.f1_payload',true),'hex'),
    decode(current_setting('crm.f1_mac',true),'hex'),q);
  qf := crm_f1.fields(q);
  return scope_value collate "C" = f[14] collate "C"
    and root_value collate "C" = qf[4] collate "C";
exception when others then return false;
end $$;
alter function crm_f1.unit_row_allows(text,text) owner to crm_h0_verifier;

create policy unit_roots_f1 on crm_private.unit_roots for all to crm_h0_executor
  using (crm_f1.unit_row_allows(context_scope,root_id))
  with check (crm_f1.unit_row_allows(context_scope,root_id));
create policy unit_operations_f1 on crm_private.unit_operations for all to crm_h0_executor
  using (crm_f1.unit_row_allows(context_scope,root_id))
  with check (crm_f1.unit_row_allows(context_scope,root_id));
create policy unit_attempts_f1 on crm_private.unit_attempts for all to crm_h0_executor
  using (crm_f1.unit_row_allows(context_scope,root_id))
  with check (crm_f1.unit_row_allows(context_scope,root_id));
create policy unit_history_f1 on crm_private.unit_history for all to crm_h0_executor
  using (crm_f1.unit_row_allows(context_scope,root_id))
  with check (crm_f1.unit_row_allows(context_scope,root_id));
create policy unit_results_f1 on crm_private.unit_results for all to crm_h0_executor
  using (crm_f1.unit_row_allows(context_scope,root_id))
  with check (crm_f1.unit_row_allows(context_scope,root_id));
create policy external_effect_records_f1 on crm_private.external_effect_records for all to crm_h0_executor
  using (crm_f1.unit_row_allows(context_scope,root_id))
  with check (crm_f1.unit_row_allows(context_scope,root_id));

create function crm_api.commit_internal_unit(p bytea, s bytea, q bytea)
returns table(
  replayed boolean,
  operation_id text,
  root_id text,
  resulting_version bigint,
  after_value text,
  material_fingerprint text,
  effect_id text,
  intent_id text
)
language plpgsql volatile parallel unsafe security definer
set search_path = pg_catalog, pg_temp as $$
declare f text[]; qf text[]; previous crm_private.unit_operations%rowtype;
  root crm_private.unit_roots%rowtype; fixed crm_private.unit_results%rowtype;
  recorded timestamptz := clock_timestamp();
begin
  f := crm_f1.verify_unit(p,s,q); qf := crm_f1.fields(q);
  insert into crm_f1.consumption values (f[5],f[6]::oid,f[8]::xid8,f[21],f[20]::bigint);
  perform set_config('crm.f1_payload',encode(p,'hex'),true),
    set_config('crm.f1_mac',encode(s,'hex'),true),set_config('crm.f1_input',encode(q,'hex'),true);
  perform pg_advisory_xact_lock(hashtextextended(qf[2],0));

  select o.* into previous from crm_private.unit_operations o where o.operation_id = qf[2];
  if found then
    if previous.material_fingerprint collate "C" <> qf[6] collate "C"
      or previous.root_id collate "C" <> qf[4] collate "C"
      or previous.context_scope collate "C" <> f[14] collate "C" then
      raise exception 'H0_009_CONFLICT' using errcode='H0002';
    end if;
    insert into crm_private.unit_attempts values (qf[7],qf[2],qf[4],f[14],'replay',recorded);
    select r.* into strict fixed from crm_private.unit_results r where r.operation_id = qf[2];
    perform set_config('crm.f1_payload','',true),set_config('crm.f1_mac','',true),set_config('crm.f1_input','',true);
    return query select true,fixed.operation_id,fixed.root_id,fixed.resulting_version,
      fixed.after_value,fixed.material_fingerprint,fixed.effect_id,fixed.intent_id;
    return;
  end if;

  insert into crm_private.unit_roots values (qf[4],f[14],0,null,recorded,recorded)
    on conflict on constraint unit_roots_pkey do nothing;
  select * into root from crm_private.unit_roots where unit_roots.root_id = qf[4] for update;
  if not found or root.context_scope collate "C" <> f[14] collate "C"
    or root.version <> qf[5]::bigint then
    raise exception 'H0_009_CONFLICT' using errcode='H0002';
  end if;

  insert into crm_private.unit_operations values (
    qf[2],qf[3],qf[4],f[14],qf[6],f[11],f[12],f[13],qf[8],qf[9],
    nullif(qf[10],'')::timestamptz,recorded,qf[5]::bigint,qf[5]::bigint+1,qf[7],
    nullif(qf[14],''),nullif(qf[15],'')
  );
  insert into crm_private.unit_attempts values (qf[7],qf[2],qf[4],f[14],'initial',recorded);
  update crm_private.unit_roots set version = qf[5]::bigint+1,current_value=qf[11],updated_at=recorded
    where unit_roots.root_id = qf[4];
  insert into crm_private.unit_history values (
    qf[2],qf[4],f[14],qf[3],root.current_value,qf[11],qf[8],qf[9],
    nullif(qf[10],'')::timestamptz,recorded,f[11],f[12],qf[12]
  );
  insert into crm_private.unit_results values (
    qf[2],qf[4],f[14],'applied',qf[5]::bigint+1,qf[11],qf[6],
    nullif(qf[14],''),nullif(qf[15],''),recorded
  );
  if qf[13] = 'true' then
    insert into crm_private.external_effect_records (
      record_id,operation_id,root_id,context_scope,effect_id,stage,intent_id,
      destination_reference,content_version,content_fingerprint,recorded_at
    ) values (qf[15],qf[2],qf[4],f[14],qf[14],'intent',qf[15],qf[16],qf[17],qf[18],recorded);
  end if;
  perform crm_f1.verify_unit(p,s,q);
  perform set_config('crm.f1_payload','',true),set_config('crm.f1_mac','',true),set_config('crm.f1_input','',true);
  return query select false,qf[2],qf[4],qf[5]::bigint+1,qf[11],qf[6],nullif(qf[14],''),nullif(qf[15],'');
exception
  when serialization_failure or deadlock_detected then
    raise;
  when sqlstate 'H0002' or unique_violation then
    raise exception 'H0_009_CONFLICT' using errcode='H0002';
  when others then
    raise exception 'H0_009_DENIED' using errcode='42501';
end $$;
alter function crm_api.commit_internal_unit(bytea,bytea,bytea) owner to crm_h0_executor;

revoke all on all functions in schema crm_f1, crm_api from public, crm_h0_runtime;
grant execute on function crm_f1.fields(bytea),crm_f1.verify(bytea,bytea,bytea,text),
  crm_f1.row_allows(text,text,text,text),crm_f1.verify_unit(bytea,bytea,bytea),
  crm_f1.unit_row_allows(text,text) to crm_h0_executor;
grant execute on function crm_api.read_probe(bytea,bytea,bytea),
  crm_api.apply_probe_batch(bytea,bytea,bytea),
  crm_api.commit_internal_unit(bytea,bytea,bytea) to crm_h0_runtime;
revoke all on function crm_f1.pack_fields(text[]),
  crm_f1.verify_envelope(bytea,bytea,bytea,text,text,text) from public, crm_h0_runtime, crm_h0_executor;
alter default privileges for role crm_h0_migration in schema crm_private revoke all on tables from public;
alter default privileges for role crm_h0_migration in schema crm_api revoke execute on functions from public;
revoke create on schema crm_private from crm_h0_table_owner;
revoke create on schema crm_f1 from crm_h0_verifier;
revoke create on schema crm_api from crm_h0_executor;
commit;
