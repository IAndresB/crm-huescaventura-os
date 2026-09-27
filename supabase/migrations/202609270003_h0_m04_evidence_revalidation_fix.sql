-- F03: authenticated current evidence, not caller assertions. Forward only.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M04_F03_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;
grant create on schema crm_ha to crm_h0_table_owner,crm_h0_f2_executor;
grant create on schema crm_api to crm_h0_f2_executor;

create table crm_ha.evidence_revalidations (
  command_id text primary key,
  proposal_id text not null,
  part_id text not null,
  command_fingerprint text not null check(command_fingerprint ~ '^[0-9a-f]{64}$'),
  reference text not null check(octet_length(reference) between 1 and 16384),
  fingerprint text not null check(fingerprint ~ '^[0-9a-f]{64}$'),
  checked_us bigint not null,
  source_valid_until_us bigint not null,
  approved_until_us bigint not null,
  effective_until_us bigint not null,
  verifier_identity text not null check(verifier_identity ~ '^[a-z][a-z0-9-]{0,127}$'),
  verifier_kind text not null check(verifier_kind ~ '^[a-z][a-z0-9-]{0,127}$'),
  context_scope text not null,
  created_xid xid8 not null,
  recorded_at timestamptz not null,
  outcome text not null check(outcome='verified'),
  check(checked_us < effective_until_us),
  check(effective_until_us=least(source_valid_until_us,approved_until_us)),
  foreign key(proposal_id,part_id) references crm_ha.parts(proposal_id,part_id),
  -- A proof alone cannot survive: reservation, receipt and durable ledger
  -- must all exist in the same committed unit.
  foreign key(command_id) references crm_ha.reservations(reservation_id) deferrable initially deferred,
  foreign key(command_id) references crm_ha.command_receipts(command_id) deferrable initially deferred,
  foreign key(command_id) references crm_private.unit_operations(operation_id) deferrable initially deferred
);
alter table crm_ha.evidence_revalidations owner to crm_h0_table_owner;
alter table crm_ha.evidence_revalidations enable row level security;
alter table crm_ha.evidence_revalidations force row level security;
create policy h0_m04_evidence_executor on crm_ha.evidence_revalidations
  for all to crm_h0_f2_executor using(true) with check(true);
revoke all on crm_ha.evidence_revalidations from public,crm_h0_runtime;
grant select,insert on crm_ha.evidence_revalidations to crm_h0_f2_executor;

set local role crm_h0_f2_executor;
-- Private check: rows from a previously COMMITTED transaction are history.
-- A new effect must still be live; replay never renews or rewrites this row.
create function crm_ha.check_evidence_at_end(command_key text) returns void
language plpgsql volatile parallel unsafe security definer set search_path=pg_catalog,pg_temp as $$
declare e crm_ha.evidence_revalidations%rowtype; now_us bigint;
begin
  select * into e from crm_ha.evidence_revalidations where command_id=command_key;
  if found and e.created_xid=pg_current_xact_id() then
    now_us:=floor(extract(epoch from clock_timestamp())*1000000)::bigint;
    if now_us<e.checked_us or now_us>=e.effective_until_us then
      raise exception 'H0_M04_EVIDENCE_DENIED' using errcode='42501';
    end if;
  end if;
end $$;
revoke all on function crm_ha.check_evidence_at_end(text) from public,crm_h0_runtime;

create function crm_ha.evidence_commit_guard() returns trigger
language plpgsql volatile parallel unsafe security definer set search_path=pg_catalog,pg_temp as $$
begin perform crm_ha.check_evidence_at_end(new.command_id); return new; end $$;
revoke all on function crm_ha.evidence_commit_guard() from public,crm_h0_runtime;
reset role;
create constraint trigger h0_m04_evidence_commit_guard after insert on crm_ha.evidence_revalidations
  deferrable initially deferred for each row execute function crm_ha.evidence_commit_guard();

set local role crm_h0_f2_executor;
-- Narrow existence-only probe. It does not return a receipt or authorize an
-- effect. Actual replay still calls M04 and the human M02 wrapper with F2.
create function crm_api.h0_m04_evidence_replay(p bytea,s bytea,q bytea) returns boolean
language plpgsql volatile parallel unsafe security definer set search_path=pg_catalog,pg_temp as $$
declare f text[]; h text[]; d text[]; r crm_ha.command_receipts%rowtype;
begin
  f:=crm_f1.verify_envelope(p,s,q,'C01','human_approval_evidence','check_replay');
  if f[13] is distinct from 'h0-011-evidence-revalidation' then raise exception 'denied'; end if;
  h:=crm_f1.fields(q);
  if cardinality(h)<>4 or h[1]<>'CRM-H0-M04' or h[2]<>'reserve' then raise exception 'denied'; end if;
  d:=crm_f1.fields(decode(h[4],'hex'));
  if cardinality(d)<>7 then raise exception 'denied'; end if;
  select * into r from crm_ha.command_receipts where command_id=h[3];
  if not found then return false; end if;
  if r.command_fingerprint is distinct from encode(crm_crypto.digest(q,'sha256'),'hex') then
    raise exception 'H0_M04_CONFLICT' using errcode='H0002'; end if;
  if not exists(select 1 from crm_ha.proposals where proposal_id=r.proposal_id and scope=f[14])
    then raise exception 'denied'; end if;
  return true;
exception when sqlstate 'H0002' then raise;
  when others then raise exception 'H0_M04_EVIDENCE_DENIED' using errcode='42501';
end $$;

create function crm_api.h0_m04_revalidate_evidence(p bytea,s bytea,q bytea,
  f2p bytea,f2s bytea,hq bytea) returns void
language plpgsql volatile parallel unsafe security definer set search_path=pg_catalog,pg_temp as $$
declare f text[]; h text[]; d text[]; e text[]; m text[]; hf text[];
  prop crm_ha.proposals%rowtype; old crm_ha.command_receipts%rowtype;
  now_us bigint; approved_us bigint;
begin
  -- Same actor/session/epoch -> command lock order as M04.
  hf:=crm_f2.admit(f2p,f2s,hq,'C03','apply_probe_batch');
  f:=crm_f1.verify_envelope(p,s,q,'C03','human_approval_evidence','revalidate_evidence');
  if f[13] is distinct from 'h0-011-evidence-revalidation' or f[14] is distinct from hf[17]
    then raise exception 'denied'; end if;
  h:=crm_f1.fields(hq); e:=crm_f1.fields(q);
  if cardinality(h)<>4 or h[1]<>'CRM-H0-M04' or h[2]<>'reserve'
    or cardinality(e)<>12 or e[1]<>'CRM-HA-EVIDENCE1'
    or e[2] is distinct from h[3]
    or e[5] is distinct from encode(crm_crypto.digest(hq,'sha256'),'hex') then raise exception 'denied'; end if;
  d:=crm_f1.fields(decode(h[4],'hex'));
  if cardinality(d)<>7 or e[3] is distinct from d[1] or e[4] is distinct from d[3]
    then raise exception 'denied'; end if;
  perform pg_advisory_xact_lock(hashtextextended(h[3],0));
  select * into old from crm_ha.command_receipts where command_id=h[3];
  if found then
    if old.command_fingerprint is distinct from e[5] then
      raise exception 'H0_M04_CONFLICT' using errcode='H0002'; end if;
    return; -- Concurrent winner already committed; no new evidence/effect.
  end if;
  select * into strict prop from crm_ha.proposals where proposal_id=d[1] and scope=f[14];
  m:=crm_f1.fields(prop.material_payload);
  if m[16] is distinct from 'required' or m[17] is distinct from e[6] or m[18] is distinct from e[7]
    or prop.material_fingerprint is distinct from d[4]
    or not exists(select 1 from crm_ha.parts where proposal_id=d[1] and part_id=d[3] and material_fingerprint=d[5])
    or not exists(select 1 from crm_ha.decisions where proposal_id=d[1] and decision_id=d[2]
      and decision='approved' and material_fingerprint=d[4]) then raise exception 'denied'; end if;
  if e[8] !~ '^[0-9]{1,18}$' or e[9] !~ '^[0-9]{1,18}$' or e[10] !~ '^[0-9]{1,18}$'
    then raise exception 'denied'; end if;
  approved_us:=floor(extract(epoch from m[19]::timestamptz)*1000000)::bigint;
  now_us:=floor(extract(epoch from clock_timestamp())*1000000)::bigint;
  if e[8]::bigint>now_us or e[8]::bigint>=e[10]::bigint or now_us>=e[10]::bigint
    or e[10]::bigint<>least(approved_us,e[9]::bigint) then raise exception 'denied'; end if;
  perform crm_f1.verify_envelope(p,s,q,'C03','human_approval_evidence','revalidate_evidence');
  perform crm_f2.verify(f2p,f2s,hq,'C03','human_core_probe','apply_probe_batch');
  insert into crm_ha.evidence_revalidations values(h[3],d[1],d[3],e[5],e[6],e[7],e[8]::bigint,
    e[9]::bigint,approved_us,e[10]::bigint,e[11],e[12],f[14],pg_current_xact_id(),clock_timestamp(),'verified');
exception when serialization_failure or deadlock_detected then raise;
  when sqlstate 'H0002' then raise;
  when others then raise exception 'H0_M04_EVIDENCE_DENIED' using errcode='42501';
end $$;
revoke all on function crm_api.h0_m04_evidence_replay(bytea,bytea,bytea),
  crm_api.h0_m04_revalidate_evidence(bytea,bytea,bytea,bytea,bytea,bytea) from public,crm_h0_runtime;
grant execute on function crm_api.h0_m04_evidence_replay(bytea,bytea,bytea),
  crm_api.h0_m04_revalidate_evidence(bytea,bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

-- Auditable, exact replacements avoid duplicating the unrelated M04/M02 bodies.
-- The definitions are catalog-owned, not caller input; mismatch aborts migration.
do $patch$
declare definition text; before_text text; after_text text;
begin
  definition:=pg_get_functiondef('crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)'::regprocedure);
  before_text:=$old$    if (crm_f1.fields(proposal_row.material_payload))[16]<>'none' then
      raise exception 'H0_M04_EVIDENCE_UNVERIFIED' using errcode='42501'; end if;$old$;
  after_text:=$new$    if (crm_f1.fields(proposal_row.material_payload))[16]<>'none' then
      if not exists(select 1 from crm_ha.evidence_revalidations e where e.command_id=qf[3]
        and e.proposal_id=d[1] and e.part_id=d[3] and e.command_fingerprint=digest_value
        and e.context_scope=hf[17] and e.created_xid=pg_current_xact_id()) then
        raise exception 'H0_M04_EVIDENCE_UNVERIFIED' using errcode='42501'; end if;
      perform crm_ha.check_evidence_at_end(qf[3]);
    end if;$new$;
  if (length(definition)-length(replace(definition,before_text,'')))<>length(before_text) then
    raise exception 'H0_M04_F03_PREDECESSOR_MISMATCH'; end if;
  execute replace(definition,before_text,after_text);
  definition:=pg_get_functiondef('crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)'::regprocedure);
  before_text:=$old$  return query select * from crm_internal.commit_internal_unit_core(p,s,q);
  perform crm_f2.admit(f2p,f2s,hq,'C03','apply_probe_batch');$old$;
  after_text:=before_text||E'\n  perform crm_ha.check_evidence_at_end(hqf[3]);';
  if (length(definition)-length(replace(definition,before_text,'')))<>length(before_text) then
    raise exception 'H0_M04_F03_PREDECESSOR_MISMATCH'; end if;
  execute replace(definition,before_text,after_text);
end $patch$;
reset role;
revoke create on schema crm_api from crm_h0_f2_executor;
revoke create on schema crm_ha from crm_h0_f2_executor,crm_h0_table_owner;
commit;
