-- H5-018-2-F01: keep authorized historical request provenance after work revision.
-- Forward66. No data rewrite, new object, privilege, policy or business transition.
begin;
do $$begin if current_user<>'crm_h0_migration'then raise exception 'DIAGNOSTIC_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
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
   and d.context->>'contextKind'=k and d.context->>'contextId'=root::text
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
commit;
