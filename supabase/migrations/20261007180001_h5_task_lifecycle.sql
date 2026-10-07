-- H5-001: extend the existing B07 Task, retaining its H1 identity and history.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'TASK_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501'; end if; end $$;
grant create on schema crm_private to crm_h0_f2_owner,crm_h0_f2_executor;
grant create on schema crm_api to crm_h0_f2_executor;
alter table crm_private.b07_pending_tasks drop constraint b07_pending_tasks_state_check;
alter table crm_private.b07_pending_tasks add column last_closure jsonb;
alter table crm_private.b07_pending_tasks add constraint b07_task_lifecycle_state check (
 state in ('pending','completed','cancelled') and
 (state='pending' or (last_closure is not null and last_closure->>'kind'=state))
);

-- The old H1/H4 reception path cannot silently edit a closed Task.
create function crm_private.h5_task_guard() returns trigger
language plpgsql set search_path=pg_catalog,pg_temp as $$
begin
 if old.state<>'pending' and new.state=old.state and new.material is distinct from old.material then
  raise exception 'TASK_CLOSED_REOPEN_REQUIRED';
 end if;
 if new.identity is distinct from old.identity or new.identity_key<>old.identity_key
  or new.admin_scope<>old.admin_scope or new.responsible_actor<>old.responsible_actor then
  raise exception 'TASK_IDENTITY_IMMUTABLE';
 end if;
 return new;
end $$;
alter function crm_private.h5_task_guard() owner to crm_h0_f2_owner;
create trigger h5_task_guard before update on crm_private.b07_pending_tasks
 for each row execute function crm_private.h5_task_guard();

create function crm_private.h5_task_lifecycle_core(m jsonb, actor uuid, scope text)
returns table(result_ref uuid,replayed boolean)
language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare action text:=m->>'action'; opid uuid; target uuid; expected bigint;
 fingerprint text; old crm_private.b07_pending_tasks%rowtype;
 prior crm_private.b07_operations%rowtype; before_data jsonb; after_data jsonb;
 closing jsonb; refs jsonb; at_time timestamptz:=clock_timestamp();
begin
 if jsonb_typeof(m) is distinct from 'object'
  or action not in ('complete','cancel','reopen')
  or m->>'purpose' is distinct from 'pending-followup'
  or m-array['action','operationId','taskId','expectedRevision','purpose','reason','result','references','reviewEvidenceRef']<>'{}'::jsonb
  or nullif(btrim(m->>'reason'),'') is null then raise exception 'TASK_INPUT_INVALID'; end if;
 opid:=(m->>'operationId')::uuid;target:=(m->>'taskId')::uuid;
 expected:=(m->>'expectedRevision')::bigint;
 if expected<1 then raise exception 'TASK_REVISION_CONFLICT'; end if;
 if action='complete' then
  refs:=m->'references';
  if nullif(btrim(m->>'result'),'') is null or jsonb_typeof(refs) is distinct from 'array'
   or jsonb_array_length(refs)=0 or exists(select 1 from jsonb_array_elements(refs) x
    where jsonb_typeof(x)<>'string' or nullif(btrim(x #>> '{}'),'') is null)
   or m?'reviewEvidenceRef' then raise exception 'TASK_COMPLETION_EVIDENCE_REQUIRED'; end if;
 elsif action='cancel' then
  if m?'result' or m?'references' or m?'reviewEvidenceRef' then raise exception 'TASK_INPUT_INVALID'; end if;
 else
  if nullif(btrim(m->>'reviewEvidenceRef'),'') is null or m?'result' or m?'references' then raise exception 'TASK_REVIEW_EVIDENCE_REQUIRED'; end if;
 end if;
 fingerprint:=encode(crm_crypto.digest(convert_to(m::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(opid::text,0));
 select * into prior from crm_private.b07_operations where operation_id=opid;
 if found then
  if prior.admin_scope<>scope or prior.actor_id<>actor or prior.fingerprint<>fingerprint then raise exception 'TASK_REPLAY_CONFLICT'; end if;
  result_ref:=prior.result_ref;replayed:=true;return next;return;
 end if;
 select * into old from crm_private.b07_pending_tasks
  where task_id=target and admin_scope=scope for update;
 if not found then raise exception 'TASK_DENIED' using errcode='42501'; end if;
 if old.revision<>expected then raise exception 'TASK_REVISION_CONFLICT'; end if;
 if action in ('complete','cancel') and old.state<>'pending' then raise exception 'TASK_TRANSITION_INVALID'; end if;
 if action='reopen' and old.state='pending' then raise exception 'TASK_TRANSITION_INVALID'; end if;
 if action='reopen' and old.last_closure is null then raise exception 'TASK_CLOSURE_MISSING'; end if;
 before_data:=to_jsonb(old);
 if action='complete' then
  closing:=jsonb_build_object('kind','completed','result',m->>'result','references',refs,'actorId',actor,'at',at_time);
  update crm_private.b07_pending_tasks set state='completed',last_closure=closing,
   revision=revision+1,updated_at=at_time where task_id=target;
 elsif action='cancel' then
  closing:=jsonb_build_object('kind','cancelled','reason',m->>'reason','actorId',actor,'at',at_time);
  update crm_private.b07_pending_tasks set state='cancelled',last_closure=closing,
   revision=revision+1,updated_at=at_time where task_id=target;
 else
  update crm_private.b07_pending_tasks set state='pending',revision=revision+1,
   updated_at=at_time where task_id=target;
 end if;
 select to_jsonb(t) into after_data from crm_private.b07_pending_tasks t where task_id=target;
 insert into crm_private.b07_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref)
  values(opid,scope,actor,fingerprint,target);
 insert into crm_private.b07_history(history_id,operation_id,subject_id,admin_scope,action_kind,
  before_state,after_state,reason,source_ref,occurred_at,actor_id)
  values(opid,opid,target,scope,'task_'||action,before_data,after_data,m->>'reason',
   case when action='reopen' then m->>'reviewEvidenceRef' else old.material->>'sourceRef' end,
   at_time,actor);
 result_ref:=target;replayed:=false;return next;
end $$;
alter function crm_private.h5_task_lifecycle_core(jsonb,uuid,text) owner to crm_h0_f2_owner;
revoke all on function crm_private.h5_task_lifecycle_core(jsonb,uuid,text) from public;
grant execute on function crm_private.h5_task_lifecycle_core(jsonb,uuid,text) to crm_h0_f2_executor;

create or replace function crm_api.b07_task_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(result_ref uuid,replayed boolean)
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];m jsonb;actor uuid;scope text;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');
 tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'TASK_DENIED' using errcode='42501'; end if;
 v:=crm_f1.fields(q);
 if cardinality(v)<>2 or v[1]<>'CRM-H1-TASK-1' then raise exception 'TASK_INPUT_INVALID'; end if;
 m:=v[2]::jsonb;actor:=hf[12]::uuid;scope:=hf[17];
 if m->>'action' in ('complete','cancel','reopen') then
  select x.result_ref,x.replayed into result_ref,replayed
   from crm_private.h5_task_lifecycle_core(m,actor,scope)x;
 else
  select x.result_ref,x.replayed into result_ref,replayed
   from crm_private.booking_preparation_task_core(m,actor,scope)x;
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');
 perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 return next;
end $$;
revoke create on schema crm_private from crm_h0_f2_owner,crm_h0_f2_executor;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
