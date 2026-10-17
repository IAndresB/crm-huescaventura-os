-- H5-018-3-F01/F02. Forward67: canonical execution ownership and typed parent history.
-- Only three existing function bodies change. No row rewrite, object or privilege added.
begin;
do $$begin if current_user<>'crm_h0_migration'then raise exception 'DIAGNOSTIC_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
-- Current B08 projection requires its own evidence authorization. B07 work
-- operations/history use the typed execution set, not UUIDs of records/tasks.
create or replace function crm_private.diagnostic_canonical_nodes(s text,k text,root uuid)returns jsonb
language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare ctx jsonb;bids uuid[];opps uuid[];records uuid[];execs uuid[];tasks uuid[];alerts uuid[];nodes jsonb:='[]';rows jsonb;item record;
begin
 if not crm_private.diagnostic_root(s,k,root)then raise exception 'DIAGNOSTIC_DENIED';end if;
 select coalesce(array_agg(booking_id),'{}'::uuid[]),coalesce(array_agg(opportunity_id),'{}'::uuid[])into bids,opps from crm_private.b04_bookings where admin_scope=s and(k='booking'and booking_id=root or k='opportunity'and opportunity_id=root);
 if k='opportunity'then opps:=opps||root;end if;
 select coalesce(jsonb_agg(jsonb_build_object('kind',c.context_kind,'id',c.context_id::text)),'[]')into ctx from crm_private.diagnostic_contexts(s,k,root)c;
 select coalesce(array_agg(distinct l.record_id),'{}'::uuid[])into records from crm_private.b07_links l where l.admin_scope=s and exists(select 1 from jsonb_array_elements(ctx)c where c->>'kind'=l.context_kind and c->>'id'=l.context_id::text);
 select coalesce(array_agg(e.execution_id),'{}'::uuid[])into execs from crm_private.b08_executions e join crm_private.b08_definitions d using(definition_id,version)where e.admin_scope=s and d.admin_scope=s and crm_private.b08_context(d,s) and exists(select 1 from jsonb_array_elements(ctx)c where c->>'kind'=d.context->>'contextKind' and c->>'id'=d.context->>'contextId');
 select coalesce(array_agg(task_id),'{}'::uuid[])into tasks from crm_private.b07_pending_tasks where admin_scope=s and exists(select 1 from jsonb_array_elements(ctx)c where c->>'kind'=identity->>'contextKind' and c->>'id'=identity->>'contextId');
 select coalesce(array_agg(alert_id),'{}'::uuid[])into alerts from crm_private.b07_alerts where admin_scope=s and exists(select 1 from jsonb_array_elements(ctx)c where c->>'kind'=identity->>'contextKind' and c->>'id'=identity->>'contextId');
 select coalesce(jsonb_agg(jsonb_build_object('key','execution/'||e.execution_id,'source','b08_executions','id',e.execution_id,
  'references',jsonb_build_array(e.execution_id,e.definition_id,e.task_id,d.context->>'recordId',crm_private.diagnostic_ref(d.proposal_id),crm_private.diagnostic_ref(d.decision_id)),
  'state',e.control_state,'generation',e.generation,'version',e.version,'recordedAt',e.created_at,'ageSeconds',extract(epoch from(statement_timestamp()-e.created_at)),'responsibleActor',d.responsible_actor,
  'approvalRef',crm_private.diagnostic_ref(d.decision_id),'approvalWithdrawn',e.approval_withdrawn_at is not null,
  'incomplete',exists(select 1 from crm_private.b08_parts p where p.execution_id=e.execution_id and p.state<>'succeeded'))),'[]')into rows
 from crm_private.b08_executions e join crm_private.b08_definitions d using(definition_id,version)where e.admin_scope=s and d.admin_scope=s and e.execution_id=any(execs);nodes:=nodes||rows;
 select coalesce(jsonb_agg(jsonb_build_object('key','definition/'||d.definition_id||':'||d.version,'source','b08_definitions','id',d.definition_id,
  'references',jsonb_build_array(d.definition_id,e.execution_id,crm_private.diagnostic_ref(d.proposal_id),crm_private.diagnostic_ref(d.decision_id),d.context->>'recordId'),
  'version',d.version,'responsibleActor',d.responsible_actor,'recordedAt',d.created_at)),'[]')into rows
 from crm_private.b08_definitions d join crm_private.b08_executions e on e.definition_id=d.definition_id where d.admin_scope=s and e.admin_scope=s and e.execution_id=any(execs);nodes:=nodes||rows;
 select coalesce(jsonb_agg(jsonb_build_object('key','attempt/'||a.attempt_id,'source','b08_attempts','id',a.attempt_id,
  'references',jsonb_build_array(a.execution_id,a.attempt_id,crm_private.diagnostic_ref(a.reservation_id)),'state',a.state,'generation',a.generation,
  'executorRef',crm_private.diagnostic_ref(a.executor_id),'partRef',crm_private.diagnostic_ref(a.part_id),'resultRef',crm_private.diagnostic_ref(a.result_ref),
  'recordedAt',a.claimed_at,'contactedAt',a.contacted_at,'resultAt',a.result_at,'leaseUntil',a.lease_until,'leaseExpired',a.lease_until<=statement_timestamp(),
  'issues',case when a.state='uncertain'then jsonb_build_array(jsonb_build_object('code','E4','affectedScope','execution'))else '[]'::jsonb end)),'[]')into rows
 from crm_private.b08_attempts a where a.admin_scope=s and a.execution_id=any(execs);nodes:=nodes||rows;
 select coalesce(jsonb_agg(jsonb_build_object('key','part/'||p.execution_id||':'||crm_private.diagnostic_ref(p.part_id),'source','b08_parts','id',crm_private.diagnostic_ref(p.part_id),
  'references',jsonb_build_array(p.execution_id,p.attempt_id,crm_private.diagnostic_ref(p.reservation_id)),'state',p.state,'resultRef',crm_private.diagnostic_ref(p.result_ref))), '[]')into rows
 from crm_private.b08_parts p where p.admin_scope=s and p.execution_id=any(execs);nodes:=nodes||rows;
 select coalesce(jsonb_agg(jsonb_build_object('key','approval/'||crm_private.diagnostic_ref(d.decision_id),'source','crm_ha.decisions','id',crm_private.diagnostic_ref(d.decision_id),
  'references',jsonb_build_array(crm_private.diagnostic_ref(d.decision_id),crm_private.diagnostic_ref(d.proposal_id)),'state',d.decision,'actorId',d.actor_id,'recordedAt',d.decided_at)),'[]')into rows
 from crm_ha.decisions d join crm_ha.proposals p using(proposal_id)where p.scope=s and exists(select 1 from crm_private.b08_definitions b join crm_private.b08_executions e on e.definition_id=b.definition_id where b.decision_id=d.decision_id and b.admin_scope=s and e.execution_id=any(execs));nodes:=nodes||rows;
 select coalesce(jsonb_agg(jsonb_build_object('key','event/'||r.operation_id,'source','b09_event_receipts','id',r.operation_id,
  'references',jsonb_build_array(r.operation_id,r.event_id,r.received_event_id,r.source_id),'state',r.receipt_state,'actorId',r.actor_id,'recordedAt',r.received_at,
  'issues',case when r.receipt_state='conflict'then jsonb_build_array(jsonb_build_object('code','E2','affectedScope','event'))else '[]'::jsonb end)),'[]')into rows
 from crm_private.b09_event_receipts r where r.admin_scope=s and exists(select 1 from jsonb_array_elements(ctx)c where c->>'kind'=r.raw_event->>'context_kind' and c->>'id'=r.raw_event->>'context_id');nodes:=nodes||rows;
 select coalesce(jsonb_agg(jsonb_build_object('key','record/'||r.record_id,'source','b07_records','id',r.record_id,'references',jsonb_build_array(r.record_id,r.original_id,r.corrects_id),
  'kind',r.record_kind,'actorId',r.recorded_by,'occurredAt',r.occurred_at,'recordedAt',r.recorded_at,'authorizedEvidenceRef',r.record_id)),'[]')into rows
 from crm_private.b07_records r where r.admin_scope=s and r.record_id=any(records);nodes:=nodes||rows;
 select coalesce(jsonb_agg(jsonb_build_object('key','object/'||v.version_id,'source','b07_object_versions','id',v.version_id,'references',jsonb_build_array(v.version_id,v.document_id,v.predecessor_id),
  'state',v.state,'incomplete',v.state<>'stored','recordedAt',v.prepared_at,'observedAt',v.observed_at,'linkedAt',v.linked_at)),'[]')into rows
 from crm_private.b07_object_versions v where v.admin_scope=s and v.document_id=any(records);nodes:=nodes||rows;
 -- Context/identity operation ownership is established by its original history,
 -- including the actual kind stored in that version, not by UUID coincidence.
 select coalesce(jsonb_agg(jsonb_build_object('key','identity_operation/'||o.operation_id,'source','identity_operations','id',o.operation_id,
 'references',jsonb_build_array(o.operation_id,o.result_ref),'actorId',o.actor_id,'recordedAt',o.recorded_at)),'[]')into rows
 from crm_private.identity_operations o join crm_private.identity_history h using(operation_id)
 where o.admin_scope=s and exists(select 1 from jsonb_array_elements(ctx)c where
 (c->>'id'=h.subject_id::text and c->>'kind'=coalesce(h.after_state->>'identity_kind',h.after_state->>'context_kind'))
 or(c->>'id'=h.context_id::text and c->>'kind'=coalesce(h.after_state->'current'->>'context_kind',h.after_state->>'context_kind')));nodes:=nodes||rows;
 -- Fixed catalog: generic projection contains only UUIDs and recorded timestamps.
 -- Original history, before/after, reasons and evidence are fetched through their
 -- existing authorized contracts; no raw result/event/material is copied here.
 for item in select * from(values
 ('b07_requirement_operations','operation_id','requirement_id',array(select requirement_id from crm_private.b07_requirements where admin_scope=s and booking_id=any(bids))),
 ('b07_incident_operations','operation_id','incident_id',array(select incident_id from crm_private.b07_incidents where admin_scope=s and booking_id=any(bids))),
 ('b03_operations','operation_id','result_ref',opps),
 ('b03_history','history_id','subject_id',opps),
 ('b03_proposal_operations','operation_id','proposal_id',array(select proposal_id from crm_private.b03_proposals where admin_scope=s and opportunity_id=any(opps))),
 ('b03_proposal_history','history_id','proposal_id',array(select proposal_id from crm_private.b03_proposals where admin_scope=s and opportunity_id=any(opps))),
 ('b03_offer_operations','operation_id','proposal_id',array(select proposal_id from crm_private.b03_proposals where admin_scope=s and opportunity_id=any(opps))),
 ('b03_acceptance_operations','operation_id','proposal_id',array(select proposal_id from crm_private.b03_proposals where admin_scope=s and opportunity_id=any(opps))),
 ('b05_obligation_operations','operation_id','booking_id',bids),
 ('b05_obligation_history','history_id','booking_id',bids),
 ('b04_preparation_operations','operation_id','booking_id',bids),
 ('b04_reality_operations','operation_id','booking_id',bids),
 ('b05_invoice_operations','operation_id','invoice_id',array(select invoice_id from crm_private.b05_provider_invoices where admin_scope=s and booking_id=any(bids))),
 ('b05_invoice_revisions','operation_id','invoice_id',array(select invoice_id from crm_private.b05_provider_invoices where admin_scope=s and booking_id=any(bids))),
 ('b05_suplido_operations','operation_id','suplido_id',array(select suplido_id from crm_private.b05_suplidos where admin_scope=s and booking_id=any(bids))),
 ('b05_suplido_revisions','operation_id','suplido_id',array(select suplido_id from crm_private.b05_suplidos where admin_scope=s and booking_id=any(bids))),
 ('b05_provider_payment_operations','operation_id','provider_payment_id',array(select provider_payment_id from crm_private.b05_provider_payments where admin_scope=s and booking_id=any(bids))),
 ('b05_provider_payment_revisions','operation_id','provider_payment_id',array(select provider_payment_id from crm_private.b05_provider_payments where admin_scope=s and booking_id=any(bids))),
 ('b05_own_economic_operations','operation_id','economy_id',array(select economy_id from crm_private.b05_own_economies where admin_scope=s and booking_id=any(bids))),
 ('b05_own_economic_revisions','operation_id','economy_id',array(select economy_id from crm_private.b05_own_economies where admin_scope=s and booking_id=any(bids))),
 ('b04_availability_operations','operation_id','availability_id',array(select availability_id from crm_private.b04_availability where admin_scope=s and booking_id=any(bids))),
 ('b04_availability_revisions','operation_id','availability_id',array(select availability_id from crm_private.b04_availability where admin_scope=s and booking_id=any(bids))),
 ('b04_confirmation_operations','operation_id','confirmation_id',array(select confirmation_id from crm_private.b04_confirmations where admin_scope=s and booking_id=any(bids))),
 ('b04_confirmation_revisions','operation_id','confirmation_id',array(select confirmation_id from crm_private.b04_confirmations where admin_scope=s and booking_id=any(bids))),
 ('b06_modification_operations','operation_id','modification_id',array(select modification_id from crm_private.b06_modifications where admin_scope=s and booking_id=any(bids))),
 ('b06_modification_revisions','operation_id','modification_id',array(select modification_id from crm_private.b06_modifications where admin_scope=s and booking_id=any(bids))),
 ('b06_cancellation_operations','operation_id','determination_id',array(select determination_id from crm_private.b06_cancellation_determinations where admin_scope=s and booking_id=any(bids))),
 ('b06_cancellation_revisions','operation_id','determination_id',array(select determination_id from crm_private.b06_cancellation_determinations where admin_scope=s and booking_id=any(bids))),
 ('b05_refund_operations','operation_id','refund_id',array(select refund_id from crm_private.b05_refunds where admin_scope=s and booking_id=any(bids))),
 ('b05_refund_revisions','operation_id','refund_id',array(select refund_id from crm_private.b05_refunds where admin_scope=s and booking_id=any(bids))),
 ('b05_deposit_operations','operation_id','deposit_id',array(select deposit_id from crm_private.b05_deposits where admin_scope=s and booking_id=any(bids))),
 ('b05_deposit_revisions','operation_id','deposit_id',array(select deposit_id from crm_private.b05_deposits where admin_scope=s and booking_id=any(bids))),
 ('b04_hold_operations','operation_id','hold_id',array(select hold_id from crm_private.b04_holds where admin_scope=s and opportunity_id=any(opps))),
 ('b04_hold_revisions','operation_id','hold_id',array(select hold_id from crm_private.b04_holds where admin_scope=s and opportunity_id=any(opps))),
 ('b05_payment_operations','operation_id','payment_id',array(select payment_id from crm_private.b05_customer_payments where admin_scope=s and evidence_id=any(records))),
 ('b05_payment_history','history_id','payment_id',array(select payment_id from crm_private.b05_customer_payments where admin_scope=s and evidence_id=any(records))),
 ('b05_fund_operations','operation_id','payment_id',array(select payment_id from crm_private.b05_customer_payments where admin_scope=s and evidence_id=any(records))),
 ('b05_fund_history','history_id','payment_id',array(select payment_id from crm_private.b05_customer_payments where admin_scope=s and evidence_id=any(records))),
 ('b03_offer_history','history_id','history_id',array(select operation_id from crm_private.b03_offer_operations where admin_scope=s and proposal_id in(select proposal_id from crm_private.b03_proposals where admin_scope=s and opportunity_id=any(opps)))),
 ('b03_acceptance_history','history_id','history_id',array(select operation_id from crm_private.b03_acceptance_operations where admin_scope=s and proposal_id in(select proposal_id from crm_private.b03_proposals where admin_scope=s and opportunity_id=any(opps)))),
 ('b07_operations','operation_id','result_ref',records||tasks||execs||alerts),
 ('b07_history','history_id','subject_id',records||tasks||execs||alerts),
 ('b04_operations','operation_id','booking_id',bids),('b04_history','history_id','booking_id',bids),
 ('b06_closure_operations','operation_id','booking_id',bids),
 ('b06_closure_assessments','operation_id','booking_id',bids),
 ('b06_joint_closures','operation_id','booking_id',bids)
 )as c(tab,idcol,rootcol,ids)loop
  execute format('select coalesce(jsonb_agg(jsonb_build_object(''key'',%L||''/''||(to_jsonb(x)->>%L),''source'',%L,''id'',to_jsonb(x)->>%L,''references'',jsonb_build_array(to_jsonb(x)->>%L,to_jsonb(x)->>%L,to_jsonb(x)->>''operation_id'',to_jsonb(x)->>''evidence_id''),''actorId'',to_jsonb(x)->>''actor_id'',''recordedAt'',to_jsonb(x)->>''recorded_at'')),''[]'')from crm_private.%I x where x.admin_scope=$1 and (to_jsonb(x)->>%L)=any($2::text[]) and (%L not in(''b07_operations'',''b07_history'') or not exists(select 1 from crm_private.b08_command_results w where w.operation_id=(to_jsonb(x)->>''operation_id'')::uuid) or (to_jsonb(x)->>%L)=any($3::text[]))',item.tab,item.idcol,item.tab,item.idcol,item.idcol,item.rootcol,item.tab,item.rootcol,item.tab,item.rootcol)into rows using s,item.ids,execs;nodes:=nodes||rows;
 end loop;
 select coalesce(jsonb_agg(jsonb_build_object('key','task/'||task_id,'source','b07_pending_tasks','id',task_id,'references',jsonb_build_array(task_id),'state',state,'recordedAt',created_at)),'[]')into rows
 from crm_private.b07_pending_tasks where admin_scope=s and task_id=any(tasks);nodes:=nodes||rows;
 select coalesce(jsonb_agg(jsonb_build_object('key','alert/'||a.alert_id,'source','b07_alerts','id',a.alert_id,'references',jsonb_build_array(a.alert_id,case when a.identity->>'sourceRef'~'^[a-f0-9-]{36}$'then a.identity->>'sourceRef'else null end),'state',a.control_state,'recordedAt',a.created_at)),'[]')into rows
 from crm_private.b07_alerts a where a.admin_scope=s and a.alert_id=any(alerts);nodes:=nodes||rows;
 select coalesce(jsonb_agg(jsonb_build_object('key','notification/'||n.notification_id,'source','b07_notifications','id',n.notification_id,'references',jsonb_build_array(n.alert_id,n.notification_id),'state',n.delivery_state,'attempts',n.attempt_count)),'[]')into rows
 from crm_private.b07_notifications n where n.admin_scope=s and n.alert_id=any(alerts);nodes:=nodes||rows;
 select coalesce(jsonb_agg(jsonb_build_object('key','notification_attempt/'||a.attempt_id,'source','b07_notification_attempts','id',a.attempt_id,'references',jsonb_build_array(a.attempt_id,a.notification_id),'state',a.outcome,'attemptNumber',a.attempt_number,'recordedAt',a.recorded_at,'simulated',a.simulated)),'[]')into rows
 from crm_private.b07_notification_attempts a join crm_private.b07_notifications n using(notification_id)where a.admin_scope=s and n.admin_scope=s and n.alert_id=any(alerts);nodes:=nodes||rows;
 return nodes;
end$$;

create or replace function crm_private.diagnostic_nodes(s text,k text,root uuid)returns jsonb
language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare canonical jsonb;historical jsonb;authorized jsonb;observations jsonb;nodes jsonb;
begin
 canonical:=crm_private.diagnostic_canonical_nodes(s,k,root);
 -- Work owns immutable versioned context and command history. Its operation's
 -- original context is not replaced by the execution's current definition.
 -- Verify that original version AND its evidence link still authorize this
 -- typed root. An observation itself never establishes historical ownership.
 with work_history as(
  select h.history_id,h.operation_id,h.subject_id,h.actor_id,h.recorded_at,
   o.actor_id operation_actor,o.recorded_at operation_time,d.version
  from crm_private.b07_history h
  join crm_private.b07_operations o on o.operation_id=h.operation_id and o.result_ref=h.subject_id
  join crm_private.b08_command_results r on r.operation_id=o.operation_id
  join crm_private.b08_executions e on e.execution_id=h.subject_id
  join crm_private.b08_definitions d on d.definition_id=e.definition_id
   and d.definition_id::text=h.after_state#>>'{definition,definition_id}'
   and d.version::text=h.after_state#>>'{definition,version}'
   and d.context=h.after_state#>'{definition,context}'
  where h.admin_scope=s and o.admin_scope=s and r.admin_scope=s and e.admin_scope=s and d.admin_scope=s
   and left(h.action_kind,5)='work_' and h.subject_id::text=h.after_state#>>'{execution,execution_id}'
   and exists(select 1 from crm_private.diagnostic_contexts(s,k,root)c
    where c.context_kind=d.context->>'contextKind' and c.context_id::text=d.context->>'contextId')
   and crm_private.b08_context(d,s)
 ), projected as(
  select jsonb_build_object('key','b07_operations/'||operation_id,'source','b07_operations','id',operation_id,
   'references',jsonb_build_array(operation_id,subject_id,operation_id,null),
   'actorId',operation_actor,'recordedAt',operation_time,'historical',true,'definitionVersion',version)node from work_history
  union all
  select jsonb_build_object('key','b07_history/'||history_id,'source','b07_history','id',history_id,
   'references',jsonb_build_array(history_id,subject_id,operation_id,null),
   'actorId',actor_id,'recordedAt',recorded_at,'historical',true,'definitionVersion',version)node from work_history
 )select coalesce(jsonb_agg(distinct node),'[]')into historical from projected;
 -- Keep existing node identity and projection when it is currently authorized.
 select canonical||coalesce(jsonb_agg(n),'[]')into authorized from jsonb_array_elements(historical)n
 where not exists(select 1 from jsonb_array_elements(canonical)c where c->>'key'=n->>'key');
 select coalesce(jsonb_agg(jsonb_build_object('key','observation/'||o.observation_id,'source','b10_diagnostic_observations','id',o.observation_id,
  'references',jsonb_build_array(o.observation_id,o.request_ref,o.operation_id,o.execution_id,o.event_id),
  'actorId',o.actor_id,'recordedAt',o.recorded_at,'outcome',o.outcome,'issues',o.issues,
  'operationReferenceState',crm_private.diagnostic_operation_reference(o.operation_id,authorized))
  ||case when crm_private.diagnostic_operation_reference(o.operation_id,canonical)='incompatible'
    then jsonb_build_object('historicalOperationReference',true)else '{}'::jsonb end),'[]')into observations
 from crm_private.b10_diagnostic_observations o
 where o.admin_scope=s and o.context_kind=k and o.context_id=root
 -- Optional references are still protected when the operation is unknown/absent.
 and(o.execution_id is null
  or exists(select 1 from jsonb_array_elements(canonical)n where n->>'source'='b08_executions' and n->>'id'=o.execution_id::text)
  or exists(select 1 from jsonb_array_elements(historical)n where n->>'source'='b07_operations' and n->'references'->>1=o.execution_id::text))
 and(o.event_id is null or exists(select 1 from crm_private.b07_records e join crm_private.b07_links l using(record_id)
  where e.record_id=o.event_id and e.record_kind='external_event' and e.admin_scope=s and l.admin_scope=s and l.context_kind=k and l.context_id=root))
 -- A visible operation and a visible execution are not necessarily related.
 -- Revalidate legacy observations and late confirmations against the B08 owner;
 -- an unknown operation remains only an unverified attempt.
 and(o.execution_id is null or o.operation_id is null
  or crm_private.diagnostic_operation_reference(o.operation_id,authorized)='unverified_attempt'
  or exists(select 1 from crm_private.b07_operations op
   join crm_private.b08_command_results result using(operation_id)
   where op.operation_id=o.operation_id and op.result_ref=o.execution_id
    and op.admin_scope=s and result.admin_scope=s))
 and(
  crm_private.diagnostic_operation_reference(o.operation_id,canonical)<>'incompatible'
  or(
   crm_private.diagnostic_operation_reference(o.operation_id,authorized)<>'incompatible'
   and exists(select 1 from jsonb_array_elements(historical)n where n->>'source'='b07_operations'and n->>'id'=o.operation_id::text
    and(o.execution_id is null or (n->'references'->>1)=o.execution_id::text))
   and(o.event_id is null or exists(select 1 from crm_private.b07_records e join crm_private.b07_links l using(record_id)
    where e.record_id=o.event_id and e.record_kind='external_event'and e.admin_scope=s and l.admin_scope=s and l.context_kind=k and l.context_id=root))
  )
 );
 -- No current execution/definition/approval of another context is projected.
 -- C01's existing final F1/F2 checks still run after materializing this result.
 nodes:=authorized||observations;return nodes;
end$$;

create or replace function crm_api.h5_diagnostic_record(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare h text[];t text[];f text[];a jsonb;i jsonb;s text;k text;root uuid;old crm_private.b10_diagnostic_observations%rowtype;r jsonb;opstate text;
begin
 h:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');t:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');f:=crm_f1.fields(q);
 if h[17]<>t[14] or cardinality(f)<>2 or f[1]<>'CRM-H5-DIAGNOSTIC1' then raise exception 'DIAGNOSTIC_DENIED';end if;
 a:=f[2]::jsonb;s:=h[17];k:=a->>'contextKind';root:=(a->>'contextId')::uuid;
 if a-array['contextKind','contextId','observationId','requestRef','operationId','executionId','eventId','outcome','issues']<>'{}'
 or not(a?&array['contextKind','contextId','observationId','requestRef','outcome','issues'])
 or not crm_private.diagnostic_root(s,k,root) or coalesce(a->>'requestRef','')!~'^ref-[a-f0-9]{16}$'
 or coalesce(a->>'outcome','')not in('accepted','previous','pending','rejected')
 or jsonb_typeof(a->'issues')is distinct from 'array' then raise exception 'DIAGNOSTIC_DENIED';end if;
 if jsonb_array_length(a->'issues')>8 or (a->>'outcome' in('accepted','previous'))<>(jsonb_array_length(a->'issues')=0) then raise exception 'DIAGNOSTIC_DENIED';end if;
 for i in select value from jsonb_array_elements(a->'issues')loop
  if jsonb_typeof(i)<>'object' or i-array['code','affectedScope']<>'{}' or not(i?&array['code','affectedScope'])
   or coalesce(i->>'code','')not in('E1','E2','E3','E4','E5','E6','E7','E8')
   or coalesce(i->>'affectedScope','')not in('request','access','operation','execution','event','evidence','dependency','identity','document','work')
   or (i->>'code'='E4' and a->>'outcome'='rejected')then raise exception 'DIAGNOSTIC_DENIED';end if;
 end loop;
 if a?'executionId' and not exists(select 1 from crm_private.b08_executions e join crm_private.b08_definitions d using(definition_id,version)
 where e.execution_id=(a->>'executionId')::uuid and e.admin_scope=s and d.admin_scope=s and crm_private.b08_context(d,s) and exists(select 1 from crm_private.diagnostic_contexts(s,k,root)c
  where c.context_kind=d.context->>'contextKind' and c.context_id::text=d.context->>'contextId'))then raise exception 'DIAGNOSTIC_DENIED';end if;
 if a?'eventId' and not exists(select 1 from crm_private.b07_records e join crm_private.b07_links l using(record_id)
 where e.record_id=(a->>'eventId')::uuid and e.record_kind='external_event' and e.admin_scope=s and l.admin_scope=s and l.context_kind=k and l.context_id=root)then raise exception 'DIAGNOSTIC_DENIED';end if;
 if a?'operationId' then
  opstate:=crm_private.diagnostic_operation_reference((a->>'operationId')::uuid,crm_private.diagnostic_canonical_nodes(s,k,root));
  if opstate='incompatible' or(opstate='canonical' and a?'executionId' and not exists(
   select 1 from crm_private.b07_operations op join crm_private.b08_command_results result using(operation_id)
   where op.operation_id=(a->>'operationId')::uuid and op.result_ref=(a->>'executionId')::uuid
    and op.admin_scope=s and result.admin_scope=s))then raise exception 'DIAGNOSTIC_DENIED';end if;
 end if;
 -- Serialize only technical observation identity; conflicting content is not a replay.
 perform pg_advisory_xact_lock(hashtextextended(a->>'observationId',17017));
 select * into old from crm_private.b10_diagnostic_observations where observation_id=(a->>'observationId')::uuid;
 if found then
  if old.admin_scope<>s or old.actor_id<>h[12]::uuid or old.context_kind<>k or old.context_id<>root or old.request_ref<>a->>'requestRef'
   or old.operation_id is distinct from (a->>'operationId')::uuid or old.execution_id is distinct from (a->>'executionId')::uuid
   or old.event_id is distinct from(a->>'eventId')::uuid or old.outcome<>a->>'outcome' or old.issues<>a->'issues'then raise exception 'DIAGNOSTIC_DENIED';end if;
  r:=jsonb_build_object('id',old.observation_id,'replayed',true);
 else
  insert into crm_private.b10_diagnostic_observations(observation_id,admin_scope,actor_id,context_kind,context_id,request_ref,operation_id,execution_id,event_id,outcome,issues)
   values((a->>'observationId')::uuid,s,h[12]::uuid,k,root,a->>'requestRef',(a->>'operationId')::uuid,(a->>'executionId')::uuid,(a->>'eventId')::uuid,a->>'outcome',a->'issues');
  r:=jsonb_build_object('id',a->>'observationId','replayed',false);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
commit;
