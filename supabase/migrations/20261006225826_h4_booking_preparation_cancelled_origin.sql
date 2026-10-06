-- Corrective H4-020/021-F23. Existing Modification cancellation wins current phase.
-- Only two declared function bodies adapted; original50 migrations, OID/signatures/owners/ACL/config retained.
begin;
create or replace function crm_private.booking_preparation_core(a jsonb,s text,actor uuid,sensitive boolean default false)returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare bid uuid:=(a->>'bookingId')::uuid;op uuid:=(a->>'operationId')::uuid;rev bigint;prev crm_private.b04_preparation_operations;inputs jsonb;current_material text;fp text;proof text;assessed jsonb;state jsonb;prior jsonb;phase text;cl jsonb;task_id uuid;at_time timestamptz:=clock_timestamp();begin
 if jsonb_typeof(a)is distinct from'object'or not(a?&array['action','operationId','bookingId','expectedRevision','expectedMaterial','sourceRef','reason','at','evidenceId','criticalScopes','preparationEvidenceIds'])or a-array['action','operationId','bookingId','expectedRevision','expectedMaterial','sourceRef','reason','at','evidenceId','criticalScopes','preparationEvidenceIds','origin','economicException']<>'{}'::jsonb
 or a->>'action'not in('start','evaluate')or coalesce(a->>'origin','manual')not in('manual','ai')or (coalesce(a->>'origin','manual')='ai'or a?'economicException')and not sensitive
 or jsonb_typeof(a->'expectedRevision')is distinct from'number'or a->>'expectedRevision'!~'^[0-9]+$'or jsonb_typeof(a->'criticalScopes')is distinct from'array'or jsonb_typeof(a->'preparationEvidenceIds')is distinct from'array'
 or not coalesce(crm_private.invoice_text(a->'sourceRef'),false)or not coalesce(crm_private.invoice_text(a->'reason'),false)then raise exception 'BOOKING_PREPARATION_INPUT_INVALID';end if;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s)then raise exception 'BOOKING_PREPARATION_DENIED';end if;
 perform crm_private.booking_preparation_lock(bid);fp:=crm_private.booking_preparation_hash(a);
 select * into prev from crm_private.b04_preparation_operations where operation_id=op;
 if found then if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'BOOKING_PREPARATION_REPLAY_CONFLICT:E2';end if;return prev.result||jsonb_build_object('replayed',true);end if;
 select e.revision,e.state into rev,prior from crm_private.b04_preparation_evaluations e where e.booking_id=bid and e.admin_scope=s order by e.revision desc limit 1;rev:=coalesce(rev,0);
 if rev<>(a->>'expectedRevision')::bigint then raise exception 'BOOKING_PREPARATION_REVISION_CONFLICT:E2';end if;
 at_time:=clock_timestamp();inputs:=crm_private.booking_preparation_inputs(bid,s);
 -- SM6: Cancelada is existing operational reality, outside the four preparation origins.
 -- Durable reauthorized replay above returns history without a new transition.
 if coalesce((inputs#>>'{booking,cancelled}')::boolean,false)then raise exception 'BOOKING_PREPARATION_ORIGIN_REQUIRED:E3';end if;
 current_material:=crm_private.booking_preparation_material(inputs,bid,s);
 if current_material is distinct from a->>'expectedMaterial'then raise exception 'BOOKING_PREPARATION_MATERIAL_CONFLICT:E2';end if;
 proof:=crm_private.booking_preparation_hash(a-array['operationId','evidenceId']);
 if not crm_private.payment_evidence((a->>'evidenceId')::uuid,bid,s,'booking-preparation:'||(a->>'action')||':'||proof,(a->>'at')::timestamptz,true)or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor)then raise exception 'BOOKING_PREPARATION_EVIDENCE_REQUIRED:E3';end if;
 if a->>'action'='start'and rev>0 then raise exception 'BOOKING_PREPARATION_ORIGIN_REQUIRED:E3';end if;
 if jsonb_array_length(a->'preparationEvidenceIds')=0 then raise exception 'BOOKING_PREPARATION_ACTUATION_REQUIRED:E3';end if;
 for cl in select value from jsonb_array_elements(a->'preparationEvidenceIds')loop if not crm_private.payment_evidence((cl#>>'{}')::uuid,bid,s,'booking-preparation:coordination', (a->>'at')::timestamptz,true)then raise exception 'BOOKING_PREPARATION_ACTUATION_REQUIRED:E3';end if;end loop;
 for cl in select value from jsonb_array_elements(a->'criticalScopes')loop
  if not exists(select 1 from jsonb_array_elements(inputs->'scopes')sc(value)where sc.value->'serviceId'=cl->'serviceId'and sc.value->'nightId'=cl->'nightId'and sc.value->'contributionId'=cl->'contributionId')then raise exception 'BOOKING_PREPARATION_DENIED';end if;
  if cl-array['serviceId','nightId','contributionId','necessary','basis','evidenceId']<>'{}'::jsonb or not(cl?&array['serviceId','nightId','contributionId','necessary','basis','evidenceId'])or not crm_private.payment_evidence((cl->>'evidenceId')::uuid,bid,s,'booking-preparation:critical:'||crm_private.booking_preparation_hash(cl-'evidenceId'),(a->>'at')::timestamptz,true)then raise exception 'BOOKING_PREPARATION_CRITICAL_EVIDENCE_REQUIRED:E3';end if;
 end loop;
 if (select count(distinct(value-array['necessary','basis','evidenceId'])::text)from jsonb_array_elements(a->'criticalScopes'))<>jsonb_array_length(a->'criticalScopes')then raise exception 'BOOKING_PREPARATION_CRITICAL_SCOPE_REQUIRED:E3';end if;
 if a?'economicException'then
  cl:=a->'economicException';if cl-array['reason','scopeIds','evidenceId']<>'{}'::jsonb or not(cl?&array['reason','scopeIds','evidenceId'])or not coalesce(crm_private.invoice_text(cl->'reason'),false)or jsonb_typeof(cl->'scopeIds')is distinct from'array'or jsonb_array_length(cl->'scopeIds')=0 or exists(select 1 from jsonb_array_elements_text(cl->'scopeIds')x(value)where not exists(select 1 from crm_private.b05_payment_schedules where schedule_id=x.value::uuid and booking_id=bid and admin_scope=s))or not crm_private.payment_evidence((cl->>'evidenceId')::uuid,bid,s,'booking-preparation:exception:'||crm_private.booking_preparation_hash(cl-'evidenceId'),(a->>'at')::timestamptz,true)then raise exception 'BOOKING_PREPARATION_EXCEPTION_REQUIRED:E3';end if;
 end if;
 assessed:=crm_private.booking_preparation_assess(inputs,a,bid,s,at_time,sensitive and a?'economicException');
 if a->>'action'='start'and assessed->'missing'?'critical-manifest'then raise exception 'BOOKING_PREPARATION_CRITICAL_SCOPE_REQUIRED:E3';end if;
 select result_ref into task_id from crm_private.booking_preparation_task_core(jsonb_build_object('action','receive','operationId',op,'taskId',bid,'expectedRevision',0,'purpose','pending-followup','identity',jsonb_build_object('causeKind','block','causeId',bid,'contextKind','booking','contextId',bid,'scopeRef',bid,'effect','booking-preparation-review'),'material',jsonb_build_object('title','Revisar preparación y cobertura de Booking','deadline',jsonb_build_object('kind','unknown','reason','No consta fecha fijada para el seguimiento'),'priority',jsonb_build_object('kind','pending','reason','Prioridad no configurada'),'sourceRef','SM-BK-02-05','sourceVersion','1','triggerRef','BR-TASK-005','triggerVersion','1'),'reason','Seguimiento local de preparación y faltas'),actor,s);
 phase:=case when a->>'action'='start'then 'En confirmación con proveedores'when(assessed->>'complete')::boolean then 'Confirmada operativamente'when(assessed->>'anyCoverage')::boolean then 'Parcialmente confirmada'else 'En confirmación con proveedores'end;
 state:=assessed||jsonb_build_object('bookingId',bid,'revision',rev+1,'historicalPhase',phase,'phase',phase,'applicable',true,'material',current_material,'evaluatedAt',at_time,'command',a,'before',prior);
 insert into crm_private.b04_preparation_evaluations values(bid,rev+1,s,op,actor,(a->>'evidenceId')::uuid,inputs,state,clock_timestamp());
 state:=state-'before'-'command'-'anyCoverage'-'complete';state:=state||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'phase',e.state->'historicalPhase','material',crm_private.booking_preparation_hash(e.material),'actorId',actor_id,'evidenceId',evidence_id,'at',recorded_at)order by revision)from crm_private.b04_preparation_evaluations e where booking_id=bid and admin_scope=s));
 state:=jsonb_build_object('id',bid,'replayed',false,'result',state);insert into crm_private.b04_preparation_operations values(op,bid,s,actor,fp,state,clock_timestamp());
 if crm_private.booking_preparation_material(crm_private.booking_preparation_inputs(bid,s),bid,s)<>current_material then raise exception 'BOOKING_PREPARATION_MATERIAL_CONFLICT:E2';end if;return state;
end$$;
create or replace function crm_api.booking_preparation_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;bid uuid;state jsonb;inputs jsonb;assessment jsonb;r jsonb;hist text;phase text;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');if hf[17]is distinct from tf[14]then raise exception 'BOOKING_PREPARATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-BOOKING-READ1'then raise exception 'BOOKING_PREPARATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if a-'bookingId'<>'{}'::jsonb then raise exception 'BOOKING_PREPARATION_INPUT_INVALID';end if;bid:=(a->>'bookingId')::uuid;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=hf[17])then return null;end if;
 perform crm_private.booking_preparation_lock(bid);inputs:=crm_private.booking_preparation_inputs(bid,hf[17]);
 select e.state into state from crm_private.b04_preparation_evaluations e where booking_id=bid and admin_scope=hf[17]order by revision desc limit 1;
 hist:=coalesce(state->>'historicalPhase','Pendiente de preparación');
 assessment:=crm_private.booking_preparation_assess(inputs,coalesce(state->'command',jsonb_build_object('criticalScopes','[]'::jsonb)),bid,hf[17],clock_timestamp(),exists(select 1 from crm_private.b04_preparation_approvals p where p.booking_id=bid and p.admin_scope=hf[17]and p.operation_id=(state->'command'->>'operationId')::uuid and p.material=crm_private.booking_preparation_material(inputs,bid,hf[17])));
 phase:=case when coalesce((inputs#>>'{booking,cancelled}')::boolean,false)then 'Cancelada'when state is null then 'Pendiente de preparación'when hist='En confirmación con proveedores'and state->'command'->>'action'='start'then hist when(assessment->>'complete')::boolean then hist when(assessment->>'anyCoverage')::boolean then 'Parcialmente confirmada'else 'En confirmación con proveedores'end;
 r:=assessment-'complete'-'anyCoverage'||jsonb_build_object('bookingId',bid,'revision',coalesce((state->>'revision')::bigint,0),'historicalPhase',hist,'phase',phase,'applicable',state is not null and state->>'material'=crm_private.booking_preparation_material(inputs,bid,hf[17])and phase=hist,'material',crm_private.booking_preparation_material(inputs,bid,hf[17]),'history',coalesce((select jsonb_agg(jsonb_build_object('revision',revision,'phase',e.state->'historicalPhase','actorId',actor_id,'evidenceId',evidence_id,'at',recorded_at)order by revision)from crm_private.b04_preparation_evaluations e where booking_id=bid and admin_scope=hf[17]),'[]'::jsonb));
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
commit;
