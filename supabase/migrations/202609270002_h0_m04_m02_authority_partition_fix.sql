-- H0-012-F02: make the final human guard mandatory at the SQL boundary.
-- The published M02 body is moved, not rewritten; public interfaces partition
-- signed technical purpose from the reserved human-unit purpose.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M04_F02_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;

create schema crm_internal authorization crm_h0_migration;
grant usage,create on schema crm_internal to crm_h0_executor;
grant usage on schema crm_internal to crm_h0_f2_executor;
grant create on schema crm_api to crm_h0_executor,crm_h0_f2_executor;

set local role crm_h0_executor;
alter function crm_api.commit_internal_unit(bytea,bytea,bytea)
  rename to commit_internal_unit_core;
alter function crm_api.commit_internal_unit_core(bytea,bytea,bytea)
  set schema crm_internal;
revoke all on function crm_internal.commit_internal_unit_core(bytea,bytea,bytea)
  from public,crm_h0_runtime;
grant execute on function crm_internal.commit_internal_unit_core(bytea,bytea,bytea)
  to crm_h0_f2_executor;
reset role;

-- Public technical M02 entry. The purpose is inside the verified F1 envelope;
-- a caller cannot turn a human-unit capability into a technical one by choosing
-- this overload or by supplying an unsigned selector.
create function crm_api.commit_internal_unit(p bytea,s bytea,q bytea)
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
set search_path=pg_catalog,pg_temp as $$
declare f text[];
begin
  f:=crm_f1.verify_unit(p,s,q);
  if f[13] collate "C"='h0-011-human-unit' collate "C" then
    raise exception 'H0_009_DENIED' using errcode='42501';
  end if;
  return query select * from crm_internal.commit_internal_unit_core(p,s,q);
exception
  when serialization_failure or deadlock_detected then raise;
  when sqlstate 'H0002' then raise;
  when others then raise exception 'H0_009_DENIED' using errcode='42501';
end $$;
alter function crm_api.commit_internal_unit(bytea,bytea,bytea)
  owner to crm_h0_executor;
revoke all on function crm_api.commit_internal_unit(bytea,bytea,bytea)
  from public,crm_h0_runtime;
grant execute on function crm_api.commit_internal_unit(bytea,bytea,bytea)
  to crm_h0_runtime;

-- Public human M04 entry. It alone accepts the reserved signed purpose, and it
-- delegates to the non-runtime core while keeping both F2 checks in the unit.
set local role crm_h0_f2_executor;
create or replace function crm_api.commit_internal_unit(p bytea,s bytea,q bytea,
  f2p bytea,f2s bytea,hq bytea)
returns table(replayed boolean,operation_id text,root_id text,resulting_version bigint,
  after_value text,material_fingerprint text,effect_id text,intent_id text)
language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare tf text[]; tq text[]; hqf text[]; receipt crm_ha.command_receipts%rowtype;
begin
  perform crm_f2.admit(f2p,f2s,hq,'C03','apply_probe_batch');
  tf:=crm_f1.verify_envelope(p,s,q,'C03','internal_unit','commit_internal_unit');
  if tf[13] collate "C"<>'h0-011-human-unit' collate "C" then
    raise exception 'H0_M04_UNIT_DENIED' using errcode='42501';
  end if;
  tq:=crm_f1.fields(q); hqf:=crm_f1.fields(hq);
  if cardinality(tq)<>18 or tq[1]<>'CRM-UNIT1' or cardinality(hqf)<3
    or hqf[1]<>'CRM-H0-M04' or hqf[2] not in ('propose','decide','reserve')
    or tq[2] collate "C"<>hqf[3] collate "C"
    or tq[4] collate "C"<>('ha-'||hqf[3]) collate "C"
    or tf[14] collate "C"<>(crm_f2.verify(f2p,f2s,hq,'C03','human_core_probe','apply_probe_batch'))[17] collate "C"
  then raise exception 'H0_M04_UNIT_DENIED' using errcode='42501'; end if;
  select * into receipt from crm_ha.command_receipts where command_id=tq[2];
  if not found or receipt.command_name collate "C"<>hqf[2] collate "C"
    or receipt.command_fingerprint collate "C"<>encode(crm_crypto.digest(hq,'sha256'),'hex') collate "C"
    or receipt.proposal_id is null
  then raise exception 'H0_M04_UNIT_DENIED' using errcode='42501'; end if;
  return query select * from crm_internal.commit_internal_unit_core(p,s,q);
  perform crm_f2.admit(f2p,f2s,hq,'C03','apply_probe_batch');
exception
  when serialization_failure or deadlock_detected then raise;
  when sqlstate 'H0002' then raise;
  when others then raise exception 'H0_M04_UNIT_DENIED' using errcode='42501';
end $$;
revoke all on function crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)
  from public,crm_h0_runtime;
grant execute on function crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)
  to crm_h0_runtime;
reset role;

revoke create on schema crm_api from crm_h0_executor,crm_h0_f2_executor;
revoke create on schema crm_internal from crm_h0_executor;
commit;
