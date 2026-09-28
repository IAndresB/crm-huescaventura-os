-- D039 / H0-012-F05. Closed login/capability mapping and exclusive HA entrypoints.
begin;
do $$ begin
 if current_user <> 'crm_h0_migration' then raise exception 'D039_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501'; end if;
end $$;
do $$ begin execute format('grant connect on database %I to crm_h0_ha_tx',current_database()); end $$;
grant usage on schema crm_api to crm_h0_ha_tx;
revoke all on function crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea),
 crm_api.h0_m04_read_proposal(bytea,bytea,bytea,bytea,bytea,text),
 crm_api.h0_m04_revalidate_evidence(bytea,bytea,bytea,bytea,bytea,bytea),
 crm_api.h0_m04_evidence_replay(bytea,bytea,bytea),
 crm_api.h0_m04_finalize_evidence(text),
 crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea) from public,crm_h0_runtime;
grant execute on function crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea),
 crm_api.h0_m04_read_proposal(bytea,bytea,bytea,bytea,bytea,text),
 crm_api.h0_m04_revalidate_evidence(bytea,bytea,bytea,bytea,bytea,bytea),
 crm_api.h0_m04_evidence_replay(bytea,bytea,bytea),
 crm_api.h0_m04_finalize_evidence(text),
 crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea),
 crm_api.commit_internal_unit(bytea,bytea,bytea),crm_api.f2_lookup(uuid,uuid) to crm_h0_ha_tx;
do $patch$
declare definition text; old_text text; new_text text;
begin
 definition:=pg_get_functiondef('crm_f1.verify_envelope(bytea,bytea,bytea,text,text,text)'::regprocedure);
 old_text:=$old$or f[10] <> 'crm_h0_runtime' or session_user <> 'crm_h0_runtime'$old$;
 new_text:=$new$or f[10] <> session_user or not (
   (session_user='crm_h0_runtime'
    and f[13] not in ('h0-011-human-unit','h0-011-human-approval','h0-011-evidence-revalidation')
    and ((f[16]='access_probe' and ((f[15]='C01' and f[17]='read_probe') or (f[15]='C03' and f[17]='apply_probe_batch')))
      or (f[15]='C03' and f[16]='internal_unit' and f[17]='commit_internal_unit')))
   or (session_user='crm_h0_ha_tx' and (
    (f[13]='h0-011-human-unit' and f[15]='C03' and
      ((f[16]='human_approval' and f[17]='manage_effect') or (f[16]='internal_unit' and f[17]='commit_internal_unit')))
    or (f[13]='h0-011-human-approval' and
      ((f[15]='C01' and f[16]='human_approval' and f[17]='read_proposal')
       or (f[15]='C03' and ((f[16]='human_approval' and f[17]='manage_effect') or (f[16]='internal_unit' and f[17]='commit_internal_unit')))))
    or (f[13]='h0-011-evidence-revalidation' and f[16]='human_approval_evidence'
      and ((f[15]='C01' and f[17]='check_replay') or (f[15]='C03' and f[17]='revalidate_evidence'))))))$new$;
 if (length(definition)-length(replace(definition,old_text,'')))<>length(old_text) then raise exception 'D039_F1_PREDECESSOR_MISMATCH'; end if;
 execute replace(definition,old_text,new_text);
 definition:=pg_get_functiondef('crm_f2.verify(bytea,bytea,bytea,text,text,text)'::regprocedure);
 old_text:=$old$or f[10]<>'crm_h0_runtime'
    or session_user<>'crm_h0_runtime'$old$;
 new_text:=$new$or f[10]<>session_user or not (
    (session_user='crm_h0_runtime' and (
      (f[16]='full-identification' and f[19]='human_session' and f[18]=f[20] and f[18] in ('establish','reidentify'))
      or (f[16]='session-revocation' and f[18]=f[20] and ((f[18]='revoke_one' and f[19]='human_session') or (f[18]='revoke_all' and f[19]='human_actor')))))
    or (session_user in ('crm_h0_runtime','crm_h0_ha_tx') and f[16]='core-human-access'
      and f[19]='human_core_probe' and ((f[18]='C01' and f[20]='read_probe') or (f[18]='C03' and f[20]='apply_probe_batch'))))$new$;
 if (length(definition)-length(replace(definition,old_text,'')))<>length(old_text) then raise exception 'D039_F2_PREDECESSOR_MISMATCH'; end if;
 execute replace(definition,old_text,new_text);
end $patch$;
commit;
