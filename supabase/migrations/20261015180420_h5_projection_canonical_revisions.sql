-- H5-012-F02: project existing hold/documentary revisions, retaining current state and history.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'PROJECTION_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';end if;end$$;

create or replace function crm_api.h5_projection_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;s text;root uuid;k text;
 ctx uuid[];party_ids uuid[]:='{}';record_ids uuid[];task_ids uuid[];bids uuid[];opps uuid[];props uuid[];sids uuid[];schedules uuid[];determinations uuid[];
 item record;rows jsonb;facts jsonb:='[]';originals jsonb;commercial jsonb:='[]';calendar jsonb:='[]';r jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');
 tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'PROJECTION_DENIED' using errcode='42501';end if;
 fs:=crm_f1.fields(q);
 if cardinality(fs)<>2 or fs[1]<>'CRM-H5-PROJECTION-READ1' then raise exception 'PROJECTION_INPUT_INVALID';end if;
 a:=fs[2]::jsonb;s:=hf[17];root:=(a->>'contextId')::uuid;k:=a->>'contextKind';
 if a-array['contextId','contextKind','surface','destination','includeArchived','search','pageSize','after']<>'{}'::jsonb
  or not(a?&array['contextId','contextKind','surface','destination'])
  or k not in('booking','opportunity','contact','organization')
  or a->>'surface' not in('timeline','calendar','query','search','export','document','ai_context')
  or a->>'destination' not in('administrator','customer','provider','ai')
  or (a?'includeArchived' and jsonb_typeof(a->'includeArchived')<>'boolean')
 then raise exception 'PROJECTION_INPUT_INVALID';end if;
 -- A reference or party relationship is never an authority. F2 admits the sole
 -- current administrator; the requested root and every join remain in its scope.
 if k in('booking','opportunity') then
  if not exists(select 1 from crm_private.identity_contexts c where c.context_id=root and c.context_kind=k and c.admin_scope=s)
   then raise exception 'PROJECTION_DENIED' using errcode='42501';end if;
  ctx:=array[root];
 else
  if not exists(select 1 from crm_private.identity_entities e where e.identity_id=root and e.identity_kind=k and e.admin_scope=s)
   then raise exception 'PROJECTION_DENIED' using errcode='42501';end if;
  if not coalesce((a->>'includeArchived')::boolean,false) and exists(select 1 from crm_private.identity_entities e where e.identity_id=root and e.archived_at is not null)
   then return null;end if;
  -- A human merge retains its original identities and histories. It does not
  -- merge Opportunities/Bookings or grant authority through a shared party.
  with recursive lineage(id) as (
   select root union select e.identity_id from crm_private.identity_entities e
    join lineage l on e.merged_into_id=l.id where e.admin_scope=s and e.identity_kind=k
  ) select array_agg(id) into party_ids from lineage;
  select coalesce(array_agg(distinct d.context_id),'{}'::uuid[]) into ctx from crm_private.identity_designations d where d.party_id=any(party_ids) and d.admin_scope=s;
  ctx:=ctx||party_ids;
 end if;
 select coalesce(array_agg(b.booking_id),'{}'::uuid[]),coalesce(array_agg(b.opportunity_id),'{}'::uuid[]) into bids,opps
 from crm_private.b04_bookings b where b.admin_scope=s and
  (k='booking' and b.booking_id=root or k<>'booking' and b.opportunity_id=any(ctx));
 if k='opportunity' then opps:=opps||root;end if;
 ctx:=ctx||bids||opps;
 select coalesce(array_agg(p.proposal_id),'{}'::uuid[]) into props from crm_private.b03_proposals p where p.admin_scope=s and p.opportunity_id=any(opps);
 select coalesce(array_agg(v.service_id),'{}'::uuid[]) into sids from crm_private.b04_services v where v.admin_scope=s and v.booking_id=any(bids);
 ctx:=ctx||props||sids;
 select coalesce(array_agg(x.schedule_id),'{}'::uuid[]) into schedules from crm_private.b05_payment_schedules x where x.admin_scope=s and x.booking_id=any(bids);
 select coalesce(array_agg(x.determination_id),'{}'::uuid[]) into determinations from crm_private.b06_cancellation_determinations x where x.admin_scope=s and x.booking_id=any(bids);
 select coalesce(array_agg(r.record_id),'{}'::uuid[]) into record_ids from crm_private.b07_records r where r.admin_scope=s
  and exists(select 1 from crm_private.b07_links l where l.record_id=r.record_id and l.admin_scope=s and l.context_id=any(ctx));
 select coalesce(array_agg(t.task_id),'{}'::uuid[]) into task_ids from crm_private.b07_pending_tasks t where t.admin_scope=s and t.identity->>'contextId'=any(ctx::text[]);

 -- External outputs use the existing commercial semantics, with an explicit
 -- permitted list. No terms/free text, original bodies, economic histories,
 -- personal identities, provider costs or technical receipts leave this branch.
 select coalesce(jsonb_agg(jsonb_build_object('reference',pv.version_id,'finalPersonPrice',
  case when m.final_person_price is null then null else to_char(m.final_person_price,'FM9999999999999999999999999999990.00') end,
  'participants',m.participants,'included',(select coalesce(jsonb_agg(jsonb_build_object('service',cr.definition->>'name','quantity',l.quantity,'date',l.service_date) order by l.line_id),'[]')
   from crm_private.b03_proposal_lines l join crm_private.catalog_revisions cr on cr.revision_id=l.service_revision_id
   where l.version_id=pv.version_id and l.modality_id=m.modality_id and l.included))order by pv.version_id,m.modality_id),'[]') into commercial
 from crm_private.b03_proposal_versions pv join crm_private.b03_proposal_modalities m using(version_id)
 where pv.admin_scope=s and pv.proposal_id=any(props) and
 (k<>'booking' or pv.version_id in(select version_id from crm_private.b04_bookings where booking_id=any(bids)))
 and m.definitive;
 if a->>'destination'<>'administrator' then
  r:=jsonb_build_object('contextKind',k,'contextId',root,'commercial',commercial,'facts','[]'::jsonb,'calendar','[]'::jsonb);
 else
  -- This fixed catalogue is reviewed against the prior migrations. It does not
  -- discover new tables or expose private schemas automatically.
  for item in select * from (values
   ('identity_entities','identity_id',party_ids),('identity_contexts','context_id',ctx),('identity_designations','context_id',ctx),
   ('identity_operations','result_ref',ctx),('b07_operations','result_ref',record_ids||task_ids),
   ('b07_communication_work','record_id',record_ids),('b09_external_event_keys','context_id',ctx),
   ('b04_bookings','booking_id',bids),('b04_services','booking_id',bids),
   (case when a->>'surface'='calendar' then 'b04_current_nights' else 'b04_nights' end,'service_id',sids),
   ('b04_modalities','booking_id',bids),('b04_contributions','booking_id',bids),('b04_history','booking_id',bids),
   ('b03_opportunities','opportunity_id',opps),('b03_history','subject_id',opps),
   ('b03_proposals','proposal_id',props),('b03_proposal_versions','proposal_id',props),('b03_proposal_history','proposal_id',props),
   ('b03_acceptances','opportunity_id',opps),('b03_acceptance_verifications','acceptance_id',
    array(select acceptance_id from crm_private.b03_acceptances where admin_scope=s and opportunity_id=any(opps))),
   ('b03_acceptance_rectifications','acceptance_id',array(select acceptance_id from crm_private.b03_acceptances where admin_scope=s and opportunity_id=any(opps))),
   ('b05_payment_schedules','booking_id',bids),('b05_schedule_revisions','schedule_id',schedules),('b05_expected_payments','schedule_id',schedules),
   ('b05_obligation_history','booking_id',bids),('b05_allocations','booking_id',bids),('b05_reconciliations','booking_id',bids),
   ('b05_provider_invoices','booking_id',bids),('b05_suplidos','booking_id',bids),('b05_provider_payments','booking_id',bids),
   ('b05_own_economies','booking_id',bids),('b05_refunds','booking_id',bids),('b05_deposits','booking_id',bids),
   ('b04_availability','booking_id',bids),('b04_confirmations','booking_id',bids),
   ('b04_operational_versions','booking_id',bids),('b06_modifications','booking_id',bids),
   ('b06_cancellation_determinations','booking_id',bids),('b06_cancellation_revisions','determination_id',determinations),
   ('b06_cancellation_applications','booking_id',bids),('b04_preparation_evaluations','booking_id',bids),('b04_reality_events','booking_id',bids),
   ('b07_requirements','booking_id',bids),('b07_incidents','booking_id',bids),
   ('b04_holds','opportunity_id',opps),('identity_codes','target_id',ctx),
   ('b05_own_economic_revisions','economy_id',array(select economy_id from crm_private.b05_own_economies where admin_scope=s and booking_id=any(bids)))
  ) as catalogue(tab,key,ids) loop
   execute format('select coalesce(jsonb_agg(jsonb_build_object(''kind'',%L,''data'',to_jsonb(x)) order by to_jsonb(x)::text),''[]'') from crm_private.%I x where x.admin_scope=$1 and (to_jsonb(x)->>%L)=any($2::text[])',item.tab,item.tab,item.key)
    into rows using s,item.ids;
   facts:=facts||rows;
  end loop;
  select coalesce(jsonb_agg(jsonb_build_object('kind','identity_history','data',to_jsonb(x)) order by x.recorded_at,x.history_id),'[]') into rows
   from crm_private.identity_history x join crm_private.identity_operations o using(operation_id)
   where o.admin_scope=s and (x.subject_id=any(ctx) or x.related_id=any(ctx));facts:=facts||rows;
  select coalesce(jsonb_agg(jsonb_build_object('kind','b03_acceptance_history','data',to_jsonb(x)) order by x.recorded_at,x.history_id),'[]') into rows
   from crm_private.b03_acceptance_history x join crm_private.b03_acceptance_operations o on o.operation_id=x.history_id
   where x.admin_scope=s and o.admin_scope=s and o.proposal_id=any(props);facts:=facts||rows;
  -- F02: identity rows do not contain the operational state. Read the existing
  -- canonical revisions within the same authorized roots; calendar uses only
  -- the latest revision, while timeline retains every historical revision.
  select coalesce(jsonb_agg(jsonb_build_object('kind','b04_hold_revisions','data',to_jsonb(x)) order by x.hold_id,x.revision),'[]') into rows
   from crm_private.b04_hold_revisions x join crm_private.b04_holds h on h.hold_id=x.hold_id
   where x.admin_scope=s and h.admin_scope=s and h.opportunity_id=any(opps)
    and (a->>'surface'<>'calendar' or x.revision=(select max(y.revision) from crm_private.b04_hold_revisions y where y.hold_id=x.hold_id and y.admin_scope=s));
  facts:=facts||rows;
  select coalesce(jsonb_agg(jsonb_build_object('kind','b07_requirement_revisions','data',to_jsonb(x)) order by x.requirement_id,x.revision),'[]') into rows
   from crm_private.b07_requirement_revisions x join crm_private.b07_requirements h on h.requirement_id=x.requirement_id
   where x.admin_scope=s and h.admin_scope=s and h.booking_id=any(bids)
    and (a->>'surface'<>'calendar' or x.revision=(select max(y.revision) from crm_private.b07_requirement_revisions y where y.requirement_id=x.requirement_id and y.admin_scope=s));
  facts:=facts||rows;
  -- Links returned only for the explicit scope, never all contexts of a shared original.
  select coalesce(jsonb_agg(jsonb_build_object('kind','b07_records','data',to_jsonb(x),'links',
   (select jsonb_agg(to_jsonb(l)) from crm_private.b07_links l where l.record_id=x.record_id and l.admin_scope=s and l.context_id=any(ctx)))order by x.recorded_at,x.record_id),'[]') into originals
   from crm_private.b07_records x where x.admin_scope=s and exists(select 1 from crm_private.b07_links l where l.record_id=x.record_id and l.admin_scope=s and l.context_id=any(ctx));
  facts:=facts||originals;
  select coalesce(jsonb_agg(jsonb_build_object('kind','b07_history','data',to_jsonb(x))order by x.recorded_at,x.history_id),'[]') into rows
   from crm_private.b07_history x where x.admin_scope=s and x.subject_id=any(record_ids||task_ids);facts:=facts||rows;
  select coalesce(jsonb_agg(jsonb_build_object('kind','b09_event_receipts','data',to_jsonb(x))order by x.received_at,x.operation_id),'[]') into rows
   from crm_private.b09_event_receipts x where x.admin_scope=s and x.raw_event->>'context_id'=any(ctx::text[]);facts:=facts||rows;
  select coalesce(jsonb_agg(jsonb_build_object('kind','b07_pending_tasks','data',to_jsonb(x))order by task_id),'[]') into rows
   from crm_private.b07_pending_tasks x where x.admin_scope=s and x.identity->>'contextId'=any(ctx::text[]);facts:=facts||rows;
  select coalesce(jsonb_agg(jsonb_build_object('reference',v.service_id,'bookingId',v.booking_id,
   'source','crm_private.modification_scope','scope',crm_private.modification_scope(jsonb_build_object('kind','service','id',v.service_id),v.booking_id,s),
   'phase',crm_private.reality_phase(v.booking_id,s),
   'certainty',case when crm_private.modification_scope(jsonb_build_object('kind','service','id',v.service_id),v.booking_id,s)->>'date' is null
    or crm_private.modification_scope(jsonb_build_object('kind','service','id',v.service_id),v.booking_id,s)->'schedule'='null'::jsonb
    or crm_private.reality_phase(v.booking_id,s) is null then 'pending' else 'verified' end)order by v.service_id),'[]') into calendar
   from crm_private.b04_services v where v.booking_id=any(bids) and v.admin_scope=s;
  r:=jsonb_build_object('contextKind',k,'contextId',root,'commercial',commercial,'facts',facts,'calendar',calendar);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');
 perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 return r;
end $$;
alter function crm_api.h5_projection_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.h5_projection_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.h5_projection_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
commit;
