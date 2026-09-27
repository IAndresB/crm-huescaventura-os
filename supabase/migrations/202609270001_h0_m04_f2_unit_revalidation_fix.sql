-- H0-012-F01: keep the ORIGINAL human authority live through the M04/M02 unit.
-- The three-argument M02 executor remains the technical interface. Human M04
-- composition uses this narrow overload, including on an idempotent replay.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M04_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;

create function crm_api.commit_internal_unit(p bytea,s bytea,q bytea,
  f2p bytea,f2s bytea,hq bytea)
returns table(replayed boolean,operation_id text,root_id text,resulting_version bigint,
  after_value text,material_fingerprint text,effect_id text,intent_id text)
language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
declare hf text[]; tf text[]; h text[]; u text[];
begin
  -- Authenticate both inputs before any ledger work; do not accept free claims
  -- or treat a newer F1 as renewal of the F2 that authorized the M04 command.
  hf:=crm_f2.admit(f2p,f2s,hq,'C03','apply_probe_batch');
  tf:=crm_f1.verify_envelope(p,s,q,'C03','internal_unit','commit_internal_unit');
  h:=crm_f1.fields(hq); u:=crm_f1.fields(q);
  if cardinality(h)<4 or h[1]<>'CRM-H0-M04' or h[2] not in ('propose','decide','reserve')
    or u[2] is distinct from h[3] or u[4] is distinct from 'ha-'||h[3]
    or tf[14] collate "C" is distinct from hf[17] collate "C"
    or not exists(select 1 from crm_ha.command_receipts r
      join crm_ha.proposals a on a.proposal_id=r.proposal_id
      where r.command_id=h[3] and r.command_fingerprint=encode(crm_crypto.digest(hq,'sha256'),'hex')
        and a.scope=hf[17])
  then raise exception 'F2_DENIED' using errcode='42501'; end if;

  -- RETURN QUERY buffers the row; the function does not return it yet.
  -- All M02 locks/writes/replay work complete before the final admission.
  return query select * from crm_api.commit_internal_unit(p,s,q);
  -- Reuse the existing full authority check (including real clock_timestamp,
  -- 30s, actor/session/epoch, generation and 7/30-day limits). Locks already
  -- held by M04 remain held until transaction end. Activity remains atomic.
  perform crm_f2.admit(f2p,f2s,hq,'C03','apply_probe_batch');
exception
  when serialization_failure or deadlock_detected then raise;
  when sqlstate 'H0002' then raise exception 'H0_M04_CONFLICT' using errcode='H0002';
  when others then raise exception 'F2_DENIED' using errcode='42501';
end $$;

grant create on schema crm_api to crm_h0_f2_executor;
alter function crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)
  owner to crm_h0_f2_executor;
revoke all on function crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)
  from public,crm_h0_runtime;
grant execute on function crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)
  to crm_h0_runtime;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
