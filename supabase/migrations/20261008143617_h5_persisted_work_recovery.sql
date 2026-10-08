-- H5-007/008: durable work state; HA/M02, B07 operations/history and Task stay authoritative.
-- No scheduler, provider, retry count, backoff or operating lease default.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'WORK_MIGRATION_AUTHORITY_REQUIRED';end if;end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b08_definitions(
 definition_id uuid not null,version bigint not null check(version>0),admin_scope text not null,
 context jsonb not null,metadata jsonb not null,material jsonb not null,material_fingerprint text not null,
 proposal_id text not null references crm_ha.proposals(proposal_id),decision_id text not null references crm_ha.decisions(decision_id),
 responsible_actor uuid not null references crm_private.crm_actors(actor_id),created_at timestamptz not null default clock_timestamp(),
 primary key(definition_id,version),unique(admin_scope,proposal_id,decision_id)
);
create table crm_private.b08_executions(
 execution_id uuid primary key,definition_id uuid not null,version bigint not null,admin_scope text not null,
 control_state text not null check(control_state in ('active','paused','stopped','review')),
 approval_withdrawn_at timestamptz,
 generation bigint not null default 0 check(generation>=0),created_at timestamptz not null default clock_timestamp(),
 task_id uuid references crm_private.b07_pending_tasks(task_id),
 foreign key(definition_id,version) references crm_private.b08_definitions(definition_id,version),unique(definition_id,version)
);
create table crm_private.b08_parts(
 execution_id uuid not null references crm_private.b08_executions(execution_id),part_id text not null,admin_scope text not null,
 state text not null check(state in ('pending','claimed','contacted','uncertain','succeeded')),
 attempt_id uuid,reservation_id text references crm_ha.reservations(reservation_id),result_ref text,
 primary key(execution_id,part_id),unique(reservation_id)
);
create table crm_private.b08_attempts(
 attempt_id uuid primary key,execution_id uuid not null references crm_private.b08_executions(execution_id),part_id text not null,
 admin_scope text not null,generation bigint not null,definition_version bigint not null,executor_id text not null,
 lease_until timestamptz not null,state text not null check(state in ('claimed','expired','contacted','uncertain','succeeded','failed')),
 reservation_id text references crm_ha.reservations(reservation_id),result_ref text,
 claimed_at timestamptz not null default clock_timestamp(),contacted_at timestamptz,result_at timestamptz,
 unique(execution_id,generation),foreign key(execution_id,part_id) references crm_private.b08_parts(execution_id,part_id)
);
create table crm_private.b08_command_results(
 operation_id uuid primary key references crm_private.b07_operations(operation_id),admin_scope text not null,result jsonb not null
);
do $$ declare t text;begin foreach t in array array['b08_definitions','b08_executions','b08_parts','b08_attempts','b08_command_results']loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);
 execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy work_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy work_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime,crm_h0_ha_tx',t);
 end loop;end $$;
grant update on crm_private.b08_executions,crm_private.b08_parts,crm_private.b08_attempts to crm_h0_f2_executor,crm_h0_migration;

-- This is applicability of the existing HA, never a new approval or reservation.
create function crm_private.b08_approval(d crm_private.b08_definitions) returns boolean
language sql stable set search_path=pg_catalog,pg_temp as $$
 select exists(select 1 from crm_ha.proposals p join crm_ha.decisions x using(proposal_id)
 where p.proposal_id=d.proposal_id and x.decision_id=d.decision_id and x.decision='approved'
 and p.scope=d.admin_scope and p.material_fingerprint=d.material_fingerprint and x.material_fingerprint=d.material_fingerprint)
$$;
create function crm_private.b08_context(d crm_private.b08_definitions,scope text) returns boolean
language sql stable set search_path=pg_catalog,pg_temp as $$
 select d.admin_scope=scope and exists(select 1 from crm_private.b07_records r join crm_private.b07_links l using(record_id)
 where r.record_id=(d.context->>'recordId')::uuid and r.admin_scope=scope and l.admin_scope=scope
 and r.purpose=d.context->>'purpose' and l.context_kind=d.context->>'contextKind' and l.context_id=(d.context->>'contextId')::uuid)
$$;
create function crm_private.b08_snapshot(id uuid) returns jsonb language sql stable set search_path=pg_catalog,pg_temp as $$
 select jsonb_build_object('execution',to_jsonb(e),'definition',to_jsonb(d),
 'parts',coalesce((select jsonb_agg(to_jsonb(p) order by p.part_id) from crm_private.b08_parts p where p.execution_id=id),'[]'::jsonb),
 'attempts',coalesce((select jsonb_agg(to_jsonb(a) order by a.generation) from crm_private.b08_attempts a where a.execution_id=id),'[]'::jsonb),
 'history',coalesce((select jsonb_agg(to_jsonb(h) order by h.recorded_at,h.history_id) from crm_private.b07_history h where h.subject_id=id and h.admin_scope=e.admin_scope),'[]'::jsonb))
 from crm_private.b08_executions e join crm_private.b08_definitions d using(definition_id,version) where e.execution_id=id
$$;

-- Probe admits only an actual authorized command; it does not poll on behalf of a human.
create function crm_api.b08_work_probe(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns boolean
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare h text[];t text[];v text[];m jsonb;old crm_private.b07_operations%rowtype;d crm_private.b08_definitions%rowtype;
begin
 h:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');t:=crm_f1.verify_envelope(f1p,f1s,q,'C03','human_approval','manage_effect');
 v:=crm_f1.fields(q);if h[17]<>t[14] or cardinality(v)<>2 or v[1]<>'CRM-H5-WORK-1'then raise exception 'WORK_DENIED';end if;m:=v[2]::jsonb;
 select x.* into d from crm_private.b08_definitions x join crm_private.b08_executions e using(definition_id,version) where e.execution_id=(m->>'executionId')::uuid;
 if found and not crm_private.b08_context(d,h[17])then raise exception 'WORK_DENIED';end if;
 select * into old from crm_private.b07_operations where operation_id=(m->>'operationId')::uuid;
 if found then
 if old.admin_scope<>h[17] or old.actor_id<>h[12]::uuid or old.fingerprint<>encode(crm_crypto.digest(q,'sha256'),'hex')then raise exception 'WORK_REPLAY_CONFLICT';end if;
 return true;end if;return false;
end $$;
create function crm_api.b08_work_probe_material(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare m jsonb;d crm_private.b08_definitions%rowtype;a crm_private.b08_attempts%rowtype;
begin perform crm_api.b08_work_probe(f2p,f2s,f1p,f1s,q);m:=(crm_f1.fields(q))[2]::jsonb;
 select x.* into strict d from crm_private.b08_definitions x join crm_private.b08_executions e using(definition_id,version) where e.execution_id=(m->>'executionId')::uuid;
 select * into strict a from crm_private.b08_attempts where attempt_id=(m->>'attemptId')::uuid and execution_id=(m->>'executionId')::uuid;
 return jsonb_build_object('proposal_id',d.proposal_id,'part_id',a.part_id);
end $$;

-- One execution lock precedes HA locks in every work transaction.
create function crm_api.b08_work_lock(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare h text[];t text[];m jsonb;e crm_private.b08_executions%rowtype;d crm_private.b08_definitions%rowtype;a crm_private.b08_attempts%rowtype;replayed boolean;
begin
 replayed:=crm_api.b08_work_probe(f2p,f2s,f1p,f1s,q);h:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');t:=crm_f1.verify_envelope(f1p,f1s,q,'C03','human_approval','manage_effect');m:=(crm_f1.fields(q))[2]::jsonb;
 perform pg_advisory_xact_lock(hashtextextended(m->>'operationId',0));
 perform pg_advisory_xact_lock(hashtextextended(m->>'executionId',508));
 select * into e from crm_private.b08_executions where execution_id=(m->>'executionId')::uuid for update;
 if found then
 select * into strict d from crm_private.b08_definitions where definition_id=e.definition_id and version=e.version;
 if not crm_private.b08_context(d,h[17])then raise exception 'WORK_DENIED';end if;
 elsif m->>'action'<>'define'then raise exception 'WORK_DENIED';end if;
 replayed:=crm_api.b08_work_probe(f2p,f2s,f1p,f1s,q);
 if replayed then return jsonb_build_object('replayed',true);end if;
 if m->>'executorId' is distinct from t[11] or t[12]<>'technical'then raise exception 'WORK_DENIED';end if;
 if m->>'action'='start'then
 select * into strict a from crm_private.b08_attempts where attempt_id=(m->>'attemptId')::uuid and execution_id=e.execution_id for update;
 if e.control_state<>'active' or e.approval_withdrawn_at is not null or a.state<>'claimed' or a.generation<>e.generation or a.generation<>(m->>'generation')::bigint
 or a.definition_version<>e.version or a.executor_id<>t[11] or a.lease_until<=clock_timestamp()
 or d.material_fingerprint is distinct from m->>'materialFingerprint' or d.material is distinct from m->'material'
 or not crm_private.b08_approval(d)then raise exception 'WORK_FENCED_OR_INAPPLICABLE';end if;
 return jsonb_build_object('replayed',false,'proposal_id',d.proposal_id,'decision_id',d.decision_id,'part_id',a.part_id);
 end if;
 return jsonb_build_object('replayed',false);
end $$;

create function crm_api.b08_work_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,aux jsonb) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare h text[];t text[];m jsonb;action text;op uuid;id uuid;old crm_private.b07_operations%rowtype;
 e crm_private.b08_executions%rowtype;d crm_private.b08_definitions%rowtype;a crm_private.b08_attempts%rowtype;p crm_private.b08_parts%rowtype;
 r crm_ha.reservations%rowtype;result jsonb;transition jsonb;before_data jsonb;part jsonb;taskid uuid;taskmaterial jsonb;allowed text[];
begin
 perform crm_api.b08_work_lock(f2p,f2s,f1p,f1s,q);h:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');t:=crm_f1.verify_envelope(f1p,f1s,q,'C03','human_approval','manage_effect');m:=(crm_f1.fields(q))[2]::jsonb;
 op:=(m->>'operationId')::uuid;id:=(m->>'executionId')::uuid;action:=m->>'action';
 select * into old from crm_private.b07_operations where operation_id=op;
 if found then select result into result from crm_private.b08_command_results where operation_id=op;return result||jsonb_build_object('replayed',true);end if;
 allowed:=array['action','operationId','executionId','reason','executorId'];
 if action in ('define','revise')then allowed:=allowed||array['definitionId','version','context','proposalId','decisionId','material','materialFingerprint','partFingerprints','triggerRef','inputsRef','permissionsRef','affectedRefs'];
 elsif action='claim'then allowed:=allowed||array['attemptId','leaseUntil'];
 elsif action='renew'then allowed:=allowed||array['attemptId','generation','leaseUntil'];
 elsif action='start'then allowed:=allowed||array['attemptId','generation','material','materialFingerprint','partFingerprints'];
 elsif action='result'then allowed:=allowed||array['attemptId','outcome','resultRef'];
 elsif action='withdraw_approval'then allowed:=allowed||array['proposalId','decisionId'];
 elsif action='persistent_failure'then allowed:=allowed||array['alertId','urgency'];
 elsif action not in ('recover','pause','stop','review','resume')then raise exception 'WORK_INPUT_INVALID';end if;
 if m-allowed<>'{}'::jsonb or not(m ?& allowed) or nullif(btrim(m->>'reason'),'') is null then raise exception 'WORK_INPUT_INVALID';end if;
 insert into crm_f1.consumption values(t[5],t[6]::oid,t[8]::xid8,t[21],t[20]::bigint);
 select * into e from crm_private.b08_executions where execution_id=id for update;before_data:=crm_private.b08_snapshot(id);
 if action in ('define','revise')then
 if action='define' and e.execution_id is not null then raise exception 'WORK_IDENTITY_CONFLICT';end if;
 if action='revise' and (e.definition_id<>(m->>'definitionId')::uuid or (m->>'version')::bigint<>e.version+1
 or exists(select 1 from crm_private.b08_parts where execution_id=id and state in ('contacted','uncertain','succeeded')))then raise exception 'WORK_REVISION_CONFLICT';end if;
 insert into crm_private.b08_definitions(definition_id,version,admin_scope,context,metadata,material,material_fingerprint,proposal_id,decision_id,responsible_actor)
 values((m->>'definitionId')::uuid,(m->>'version')::bigint,h[17],m->'context',m-array['action','operationId','executionId','reason','executorId','context','material','materialFingerprint','partFingerprints','proposalId','decisionId'],m->'material',m->>'materialFingerprint',m->>'proposalId',m->>'decisionId',h[12]::uuid) returning * into d;
 if not crm_private.b08_context(d,h[17]) or not crm_private.b08_approval(d) or d.material->>'scope'<>h[17]
 or jsonb_array_length(d.material->'parts')<1 or jsonb_array_length(d.material->'parts')>20
 or exists(select 1 from jsonb_array_elements(d.material->'parts') x where not exists(select 1 from crm_ha.parts hp where hp.proposal_id=d.proposal_id and hp.part_id=x->>'partId' and hp.material_fingerprint=m->'partFingerprints'->>(x->>'partId')))
 then raise exception 'WORK_APPROVAL_REQUIRED';end if;
 if action='define'then
 insert into crm_private.b08_executions(execution_id,definition_id,version,admin_scope,control_state)values(id,d.definition_id,d.version,h[17],'active');
 taskmaterial:=jsonb_build_object('action','receive','operationId',gen_random_uuid(),'taskId',gen_random_uuid(),'expectedRevision',0,'purpose','pending-followup',
 'identity',jsonb_build_object('causeKind','review','causeId',id::text,'contextKind',d.context->>'contextKind','contextId',d.context->>'contextId','scopeRef',id::text,'relatedKind',null,'relatedId',null,'effect','review-persisted-work'),
 'material',jsonb_build_object('title','Revisar trabajo persistido','deadline',jsonb_build_object('kind','unknown','reason','Sin plazo aprobado'),'priority',jsonb_build_object('kind','pending','reason','Sin prioridad configurada'),'sourceRef',id::text,'sourceVersion',d.version::text,'triggerRef','manual','triggerVersion','1'),'reason',m->>'reason');
 select x.result_ref into taskid from crm_private.booking_preparation_task_core(taskmaterial,h[12]::uuid,h[17])x;
 update crm_private.b08_executions set task_id=taskid where execution_id=id;
 else
 update crm_private.b08_executions set version=d.version,control_state='active',approval_withdrawn_at=null,generation=generation+1 where execution_id=id;
 update crm_private.b08_attempts set state='expired' where execution_id=id and state='claimed';
 update crm_private.b08_parts set state='pending',attempt_id=null where execution_id=id;
 end if;
 for part in select x from jsonb_array_elements(d.material->'parts') x loop
 insert into crm_private.b08_parts(execution_id,part_id,admin_scope,state)values(id,part->>'partId',h[17],'pending')on conflict(execution_id,part_id)do nothing;
 end loop;
 result:=jsonb_build_object('state','pending');
 else
 select * into strict d from crm_private.b08_definitions where definition_id=e.definition_id and version=e.version;
 if action in ('claim','recover')then
 select * into a from crm_private.b08_attempts where execution_id=id and generation=e.generation for update;
 if a.attempt_id is not null and a.state in ('claimed','contacted')then
 if a.lease_until>clock_timestamp()then raise exception 'WORK_LEASE_HELD';end if;
 if a.state='contacted'then
 update crm_private.b08_attempts set state='uncertain' where attempt_id=a.attempt_id;
 update crm_private.b08_parts set state='uncertain' where execution_id=id and part_id=a.part_id;
 transition:=jsonb_build_object('action','outcome','reservationId',a.reservation_id,'attemptId',a.attempt_id,'outcome','uncertain','resultRef','Recovery: contact outcome unknown');
 result:=jsonb_build_object('state','uncertain');
 else
 update crm_private.b08_attempts set state='expired' where attempt_id=a.attempt_id;
 update crm_private.b08_parts set state='pending',attempt_id=null where execution_id=id and part_id=a.part_id;
 end if;
 end if;
 if result is null then
 if action='recover'then result:=jsonb_build_object('state','pending');
 else
 if e.control_state<>'active' or e.approval_withdrawn_at is not null or not crm_private.b08_approval(d)then raise exception 'WORK_CONTROL_BLOCKED';end if;
 select * into p from crm_private.b08_parts where execution_id=id and state='pending' and part_id in(select x->>'partId' from jsonb_array_elements(d.material->'parts')x) order by part_id limit 1 for update;
 if not found then raise exception 'WORK_NO_SAFE_PENDING_PART';end if;
 if (m->>'leaseUntil')::timestamptz<=clock_timestamp()then raise exception 'WORK_LEASE_INVALID';end if;
 update crm_private.b08_executions set generation=generation+1 where execution_id=id returning * into e;
 insert into crm_private.b08_attempts(attempt_id,execution_id,part_id,admin_scope,generation,definition_version,executor_id,lease_until,state)
 values((m->>'attemptId')::uuid,id,p.part_id,h[17],e.generation,e.version,t[11],(m->>'leaseUntil')::timestamptz,'claimed');
 update crm_private.b08_parts set state='claimed',attempt_id=(m->>'attemptId')::uuid where execution_id=id and part_id=p.part_id;
 result:=jsonb_build_object('state','claimed','attemptId',m->>'attemptId','generation',e.generation,'partId',p.part_id);
 end if;end if;
 elsif action='renew'then
 select * into strict a from crm_private.b08_attempts where attempt_id=(m->>'attemptId')::uuid and execution_id=id for update;
 if e.control_state<>'active' or e.approval_withdrawn_at is not null or a.state<>'claimed' or a.generation<>e.generation or a.generation<>(m->>'generation')::bigint or a.executor_id<>t[11] or a.lease_until<=clock_timestamp() or (m->>'leaseUntil')::timestamptz<=a.lease_until then raise exception 'WORK_FENCED';end if;
 update crm_private.b08_attempts set lease_until=(m->>'leaseUntil')::timestamptz where attempt_id=a.attempt_id;result:=jsonb_build_object('state','claimed');
 elsif action='start'then
 select * into strict a from crm_private.b08_attempts where attempt_id=(m->>'attemptId')::uuid and execution_id=id;
 select * into strict r from crm_ha.reservations where reservation_id=aux->>'reservationId';
 if r.proposal_id<>d.proposal_id or r.decision_id<>d.decision_id or r.part_id<>a.part_id or r.state<>'attempting'
 or not exists(select 1 from crm_ha.events where reservation_id=r.reservation_id and attempt_id='a-'||a.attempt_id and event_kind='attempted')then raise exception 'WORK_RESERVATION_DENIED';end if;
 update crm_private.b08_attempts set state='contacted',contacted_at=clock_timestamp(),reservation_id=r.reservation_id where attempt_id=a.attempt_id;
 update crm_private.b08_parts set state='contacted',reservation_id=r.reservation_id where execution_id=id and part_id=a.part_id;
 result:=jsonb_build_object('state','contacted','attemptId',a.attempt_id,'generation',a.generation,'reservationId',r.reservation_id,'simulated',true);
 elsif action='result'then
 select * into strict a from crm_private.b08_attempts where attempt_id=(m->>'attemptId')::uuid and execution_id=id for update;
 select * into strict p from crm_private.b08_parts where execution_id=id and part_id=a.part_id for update;
 if a.state not in ('contacted','uncertain','succeeded','failed') or a.reservation_id is null then raise exception 'WORK_NO_CONTACT_ATTEMPT';end if;
 if m->>'outcome'<>'uncertain' and (aux->'proof'->>'attemptId' is distinct from a.attempt_id::text or aux->'proof'->>'executionId' is distinct from id::text or aux->'proof'->>'outcome' is distinct from m->>'outcome' or aux->'proof'->>'resultRef' is distinct from m->>'resultRef' or aux->'proof'->>'sourceKind' is distinct from 'simulated')then raise exception 'WORK_RESULT_EVIDENCE_REQUIRED';end if;
 if a.state in ('succeeded','failed')then
 if a.state=m->>'outcome' and a.result_ref=m->>'resultRef'then result:=jsonb_build_object('state',a.state,'recognized',true);
 else update crm_private.b08_executions set control_state='review' where execution_id=id;result:=jsonb_build_object('state','conflict','review',true);end if;
 elsif p.attempt_id<>a.attempt_id then
 update crm_private.b08_executions set control_state='review' where execution_id=id;result:=jsonb_build_object('state','conflict','review',true);
 elsif a.state='uncertain' and m->>'outcome'='uncertain'then result:=jsonb_build_object('state','uncertain','recognized',true);
 else
 transition:=jsonb_build_object('action',case when a.state='uncertain'then 'reconcile'else 'outcome'end,'reservationId',a.reservation_id,'attemptId',a.attempt_id,'outcome',m->>'outcome','resultRef',m->>'resultRef');
 update crm_private.b08_attempts set state=m->>'outcome',result_ref=m->>'resultRef',result_at=clock_timestamp() where attempt_id=a.attempt_id;
 update crm_private.b08_parts set state=case when m->>'outcome'='failed'then 'pending'else m->>'outcome'end,result_ref=m->>'resultRef' where execution_id=id and part_id=a.part_id;
 result:=jsonb_build_object('state',m->>'outcome','attemptId',a.attempt_id);
 end if;
 elsif action in ('pause','stop','review','resume')then
 if action='resume' and (e.control_state='stopped' or e.approval_withdrawn_at is not null or not crm_private.b08_approval(d))then raise exception 'WORK_RESUME_DENIED';end if;
 update crm_private.b08_executions set control_state=case action when 'pause'then 'paused'when 'stop'then 'stopped'when 'review'then 'review'else 'active'end where execution_id=id;
 result:=jsonb_build_object('state',case action when 'pause'then 'paused'when 'stop'then 'stopped'when 'review'then 'review'else 'active'end);
 elsif action='withdraw_approval'then
 if d.proposal_id is distinct from m->>'proposalId' or d.decision_id is distinct from m->>'decisionId'then raise exception 'WORK_APPROVAL_IDENTITY_CONFLICT';end if;
 update crm_private.b08_executions set control_state='review',approval_withdrawn_at=clock_timestamp() where execution_id=id;
 result:=jsonb_build_object('state','review','approvalWithdrawn',true);
 elsif action='persistent_failure'then
 -- Existing D016 Alert/Notification domain, private narrow insertion. No second queue.
 if m->>'urgency' not in ('important','critical')then raise exception 'WORK_INPUT_INVALID';end if;
 insert into crm_private.b07_alerts(alert_id,admin_scope,identity_key,identity,material,responsible_actor,control_state,missing_parameters)
 values((m->>'alertId')::uuid,h[17],encode(crm_crypto.digest(convert_to('work-failure:'||id,'UTF8'),'sha256'),'hex'),
 jsonb_build_object('sourceRef',id,'causeId',id,'contextKind',d.context->>'contextKind','contextId',d.context->>'contextId','scopeRef',id,'effect','review-work-failure'),
 jsonb_build_object('cause',m->>'reason','risk','Resultado pendiente de revisión','requiredAction','Conciliar intento antes de repetir','urgency',m->>'urgency','sourceVersion',d.version::text,'automation',jsonb_build_object('definitionRef',d.definition_id,'executionRef',id,'version',d.version::text,'triggerRef',d.metadata->>'triggerRef','inputsRef',d.metadata->>'inputsRef','permissionsRef',d.metadata->>'permissionsRef','effectsRef',d.material->>'effect','recordsRef',id::text,'retryLimit',null,'pauseSeconds',null,'missingParameters',jsonb_build_array('schedulerCapacity','resumePolicy'))),
 d.responsible_actor,'review_required',jsonb_build_array('retryLimit','pauseSeconds','schedulerCapacity','resumePolicy'));
 insert into crm_private.b07_notifications(notification_id,alert_id,admin_scope,channel,recipient_actor,intent,delivery_state)
 values(gen_random_uuid(),(m->>'alertId')::uuid,h[17],'crm',d.responsible_actor,'internal-alert','visible'),(gen_random_uuid(),(m->>'alertId')::uuid,h[17],'whatsapp',d.responsible_actor,'internal-alert','unavailable');
 result:=jsonb_build_object('state','review','alertId',m->>'alertId');
 end if;
 end if;
 result:=result||jsonb_build_object('replayed',false,'executionId',id,'simulated',true,'haTransition',transition);
 insert into crm_private.b07_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref)values(op,h[17],h[12]::uuid,encode(crm_crypto.digest(q,'sha256'),'hex'),id);
 insert into crm_private.b08_command_results values(op,h[17],result);
 insert into crm_private.b07_history(history_id,operation_id,subject_id,admin_scope,action_kind,before_state,after_state,reason,source_ref,actor_id)
 values(op,op,id,h[17],'work_'||action,before_data,crm_private.b08_snapshot(id)||jsonb_build_object('receipt',result,'executorId',t[11]),m->>'reason',id::text,h[12]::uuid);
 return result;
end $$;

create function crm_api.b08_work_finalize(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns void
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare h text[];t text[];m jsonb;e crm_private.b08_executions%rowtype;d crm_private.b08_definitions%rowtype;a crm_private.b08_attempts%rowtype;
begin
 h:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');t:=crm_f1.verify_envelope(f1p,f1s,q,'C03','human_approval','manage_effect');m:=(crm_f1.fields(q))[2]::jsonb;
 select * into strict e from crm_private.b08_executions where execution_id=(m->>'executionId')::uuid;
 select * into strict d from crm_private.b08_definitions where definition_id=e.definition_id and version=e.version;
 if h[17]<>t[14] or not crm_private.b08_context(d,h[17])then raise exception 'WORK_DENIED';end if;
 -- A committed replay needs current access, never the old lease or provider.
 if exists(select 1 from crm_private.b07_operations where operation_id=(m->>'operationId')::uuid and recorded_at<transaction_timestamp())then return;end if;
 if m->>'action'='start'then
 select * into strict a from crm_private.b08_attempts where attempt_id=(m->>'attemptId')::uuid;
 if e.control_state<>'active' or e.approval_withdrawn_at is not null or a.state<>'contacted' or a.generation<>e.generation or a.executor_id<>t[11] or a.lease_until<=clock_timestamp()
 or d.material_fingerprint<>m->>'materialFingerprint' or not crm_private.b08_approval(d)then raise exception 'WORK_FINAL_CHECK_DENIED';end if;
 end if;
end $$;
create function crm_api.b08_work_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare h text[];t text[];v text[];m jsonb;d crm_private.b08_definitions%rowtype;
begin
 h:=crm_f2.admit(f2p,f2s,q,'C01','read_probe');t:=crm_f1.verify_envelope(f1p,f1s,q,'C01','human_approval','read_proposal');v:=crm_f1.fields(q);
 if h[17]<>t[14] or cardinality(v)<>2 or v[1]<>'CRM-H5-WORK-READ1'then raise exception 'WORK_DENIED';end if;m:=v[2]::jsonb;
 select x.* into d from crm_private.b08_definitions x join crm_private.b08_executions e using(definition_id,version) where e.execution_id=(m->>'executionId')::uuid;
 if not found then return null;end if;
 if d.context is distinct from m->'context' or not crm_private.b08_context(d,h[17])then raise exception 'WORK_DENIED';end if;
 return crm_private.b08_snapshot((m->>'executionId')::uuid);
end $$;

-- Revalidate the ORIGINAL reserve F2 after every delegated work write/wait.
create function crm_api.b08_ha_finalize(f2p bytea,f2s bytea,q bytea) returns void
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare v text[];h text[];
begin
 v:=crm_f1.fields(q);h:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');
 if cardinality(v)<>4 or v[1]<>'CRM-H0-M04' or v[2]<>'reserve' or not exists(select 1 from crm_ha.command_receipts r join crm_ha.proposals p using(proposal_id)where r.command_id=v[3] and r.command_fingerprint=encode(crm_crypto.digest(q,'sha256'),'hex') and p.scope=h[17])then raise exception 'WORK_DENIED';end if;
 perform crm_api.h0_m04_finalize_evidence(v[3]);
end $$;

-- All helpers are private, owners cannot bypass FORCE RLS. Only the dedicated
-- TTE login receives the narrow APIs; general runtime gets no new privilege.
do $$ declare r record;begin for r in select oid::regprocedure f from pg_proc where proname like 'b08_%' and pronamespace in('crm_api'::regnamespace,'crm_private'::regnamespace)loop
 execute format('alter function %s owner to %I',r.f,case when r.f::text like 'crm_api.%'then 'crm_h0_f2_executor'else 'crm_h0_f2_owner'end);
 execute format('revoke all on function %s from public,crm_h0_runtime,crm_h0_ha_tx',r.f);
 if r.f::text like 'crm_api.%'then execute format('grant execute on function %s to crm_h0_ha_tx',r.f);else execute format('grant execute on function %s to crm_h0_f2_executor',r.f);end if;
 end loop;end $$;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
