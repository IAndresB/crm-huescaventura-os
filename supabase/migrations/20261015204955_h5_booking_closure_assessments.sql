-- TSK-H5-013: independent assessments inside Booking; no joint close/reopen.
begin;
do $$begin if current_user <> 'crm_h0_migration' then raise exception 'CLOSURE_MIGRATION_AUTHORITY_REQUIRED'; end if; end$$;
grant create on schema crm_private to crm_h0_f2_owner,crm_h0_f2_executor;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b06_closure_operations(
 operation_id uuid primary key, booking_id uuid not null references crm_private.b04_bookings,
 admin_scope text not null, actor_id uuid not null references crm_private.crm_actors,
 fingerprint text not null, result jsonb not null, recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b06_closure_assessments(
 booking_id uuid not null references crm_private.b04_bookings, revision bigint not null check(revision>0),
 dimension text not null check(dimension in('commercial','operational','economic')), admin_scope text not null,
 operation_id uuid not null unique references crm_private.b06_closure_operations deferrable initially deferred,
 command jsonb not null, state jsonb not null, actor_id uuid not null references crm_private.crm_actors,
 evidence_id uuid not null references crm_private.b07_records, recorded_at timestamptz not null default clock_timestamp(),
 primary key(booking_id,revision)
);
do $$declare t text;begin
 foreach t in array array['b06_closure_operations','b06_closure_assessments'] loop
  execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
  execute format('alter table crm_private.%I enable row level security',t);
  execute format('alter table crm_private.%I force row level security',t);
  execute format('create policy closure_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
  execute format('create policy closure_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
  execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
  execute format('revoke all on crm_private.%I from public,crm_h0_runtime,crm_h0_ha_tx',t);
  execute format('create trigger closure_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 end loop;
end$$;
-- Use the existing evaluation root, without taking writer-private locks after it.
-- Existing preparation/reality writers already use this root. Fill only uncovered sources.
create function crm_private.closure_writer() returns trigger language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare x jsonb:=to_jsonb(new); bid uuid; begin
 if x?'booking_id' then bid:=(x->>'booking_id')::uuid;
 elsif x?'invoice_id' then select booking_id into bid from crm_private.b05_provider_invoices where invoice_id=(x->>'invoice_id')::uuid;
 elsif x?'economy_id' then select booking_id into bid from crm_private.b05_own_economies where economy_id=(x->>'economy_id')::uuid;
 elsif x?'suplido_id' then select booking_id into bid from crm_private.b05_suplidos where suplido_id=(x->>'suplido_id')::uuid;
 elsif x?'determination_id' then select booking_id into bid from crm_private.b06_cancellation_determinations where determination_id=(x->>'determination_id')::uuid;
 end if;
 if bid is null then raise exception 'CLOSURE_DEPENDENCY_ROOT_REQUIRED'; end if;
 perform crm_private.booking_preparation_lock(bid); return new;
end$$;
do $$declare t text;begin
 foreach t in array array['b05_provider_invoices','b05_invoice_revisions','b05_suplidos','b05_suplido_revisions','b05_own_economies','b05_own_economic_revisions','b06_cancellation_determinations','b06_cancellation_revisions','b06_cancellation_applications'] loop
  execute format('create trigger closure_material_lock before insert or update on crm_private.%I for each row execute function crm_private.closure_writer()',t);
 end loop;
end$$;
create function crm_private.closure_inputs(bid uuid,s text) returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare b jsonb; p jsonb; r jsonb; su jsonb:='[]'; x record; state jsonb; begin
 select to_jsonb(v) into b from crm_private.b04_bookings v where booking_id=bid and admin_scope=s;
 if b is null then raise exception 'CLOSURE_DENIED'; end if;
 p:=crm_private.booking_preparation_inputs(bid,s);
 for x in select z.suplido_id,v.after_data from crm_private.b05_suplidos z cross join lateral(select after_data from crm_private.b05_suplido_revisions where suplido_id=z.suplido_id order by revision desc limit 1)v where z.booking_id=bid and z.admin_scope=s order by z.suplido_id loop
  -- Recompute against current invoice, actual outgoing correspondence and usable funds.
  begin state:=crm_private.provider_payment_documentary(x.after_data,s);
  exception when raise_exception then state:=x.after_data||jsonb_build_object('status','Revisión','pending',jsonb_build_array('current-source-review')); end;
  su:=su||jsonb_build_array(state);
 end loop;
 r:=jsonb_build_object('bookingId',bid,'agreement',jsonb_build_object('acceptanceId',b->'acceptance_id','verificationId',b->'verification_id','versionId',b->'version_id','terms',b->'terms','chain',b->'chain_snapshot'),
  'services',(select coalesce(jsonb_agg(to_jsonb(v) order by service_id),'[]')from crm_private.b04_current_services v where booking_id=bid and admin_scope=s),
  'requirements',p->'requirements','schedules',p->'schedules','scopes',crm_private.reality_scopes(bid,s),
  'realityPending',crm_private.reality_read_core(bid,s)->'pending',
  'modifications',(select coalesce(jsonb_agg(v.after_data order by z.modification_id),'[]')from crm_private.b06_modifications z cross join lateral(select after_data from crm_private.b06_modification_revisions where modification_id=z.modification_id order by revision desc limit 1)v where z.booking_id=bid and z.admin_scope=s),
  'cancellations',(select coalesce(jsonb_agg(v.after_data||jsonb_build_object('sourceCurrent',v.after_data->>'scopeToken'=crm_private.cancellation_token(v.after_data->'scope',bid,s)) order by z.determination_id),'[]')from crm_private.b06_cancellation_determinations z cross join lateral(select after_data from crm_private.b06_cancellation_revisions where determination_id=z.determination_id order by revision desc limit 1)v where z.booking_id=bid and z.admin_scope=s),
  'suplidos',su,
  'invoices',(select coalesce(jsonb_agg(v.after_data order by z.invoice_id),'[]')from crm_private.b05_provider_invoices z cross join lateral(select after_data from crm_private.b05_invoice_revisions where invoice_id=z.invoice_id order by revision desc limit 1)v where z.booking_id=bid and z.admin_scope=s),
  'ownEconomics',(select coalesce(jsonb_agg(v.after_data||jsonb_build_object('sourceCurrent',not exists(select 1 from crm_private.b04_operational_versions ov where ov.booking_id=bid and exists(select 1 from crm_private.b06_modification_revisions mr where mr.modification_id=ov.modification_id and mr.recorded_at>v.recorded_at))) order by z.economy_id),'[]')from crm_private.b05_own_economies z cross join lateral(select after_data,recorded_at from crm_private.b05_own_economic_revisions where economy_id=z.economy_id order by revision desc limit 1)v where z.booking_id=bid and z.admin_scope=s),
  'refunds',(select coalesce(jsonb_agg(v||jsonb_build_object('sourceCurrent',case when v->>'baseType'='guarantee' then true else exists(select 1 from crm_private.b06_cancellation_determinations cd cross join lateral(select revision,after_data from crm_private.b06_cancellation_revisions where determination_id=cd.determination_id order by revision desc limit 1)cv where cd.booking_id=bid and cd.admin_scope=s and cd.determination_id=(v->'determination'->>'id')::uuid and cv.revision=(v->'determination'->>'revision')::bigint and cv.after_data->>'scopeToken'=crm_private.cancellation_token(cv.after_data->'scope',bid,s))end) order by v->>'id'),'[]')from crm_private.refund_latest(s)v where v->>'bookingId'=bid::text),
  'deposits',(select coalesce(jsonb_agg(v.after_data||jsonb_build_object('sourceCurrent',v.after_data->'scopeToken'=crm_private.modification_scope(jsonb_build_object('kind',case when z.night_id is null then 'service'else 'night'end,'id',coalesce(z.night_id,z.service_id),'serviceId',z.service_id),bid,s),'amounts',crm_private.deposit_amounts(v.after_data)) order by z.deposit_id),'[]')from crm_private.b05_deposits z cross join lateral(select after_data from crm_private.b05_deposit_revisions where deposit_id=z.deposit_id order by revision desc limit 1)v where z.booking_id=bid and z.admin_scope=s),
  'incidents',(select coalesce(jsonb_agg(v.after_data order by z.incident_id),'[]')from crm_private.b07_incidents z cross join lateral(select after_data from crm_private.b07_incident_revisions where incident_id=z.incident_id order by revision desc limit 1)v where z.booking_id=bid and z.admin_scope=s));
 return r;
end$$;
-- Materiality is explicit by dimension. History remains immutable; no reopening write.
create function crm_private.closure_basis(i jsonb,d text,a jsonb) returns jsonb language sql immutable set search_path=pg_catalog,pg_temp as $$
 select jsonb_build_object('unclassifiedRequirements',(select coalesce(jsonb_agg(v->'id' order by v->>'id'),'[]')from jsonb_array_elements(i->'requirements')v where not exists(select 1 from jsonb_array_elements(coalesce(a->'documentDependencies','[]'))m where m->'requirementId'=v->'id')),'requirements',(select coalesce(jsonb_agg(v order by v->>'id'),'[]')from jsonb_array_elements(i->'requirements')v where exists(select 1 from jsonb_array_elements(coalesce(a->'documentDependencies','[]'))m where m->'requirementId'=v->'id' and m->'dimensions'?d)),
 'facts',case d when 'commercial' then jsonb_build_object('agreement',i->'agreement','modifications',i->'modifications','cancellations',i->'cancellations')
 when 'operational' then jsonb_build_object('services',i->'services','scopes',i->'scopes','pending',i->'realityPending','incidents',(select coalesce(jsonb_agg(v order by v->>'id'),'[]')from jsonb_array_elements(i->'incidents')v where v->>'severity'='Crítica' and v->'impact'->'material'='true'::jsonb and v->'impact'->>'effect' in('operation','preparation','complete-close')))
 else i-array['bookingId','agreement','requirements','modifications','realityPending','scopes','incidents','services']||jsonb_build_object('services',(select coalesce(jsonb_agg(v-'state'order by v->>'service_id'),'[]')from jsonb_array_elements(i->'services')v),'incidents',(select coalesce(jsonb_agg(v order by v->>'id'),'[]')from jsonb_array_elements(i->'incidents')v where v->'impact'->>'effect'='economic-review')) end)
$$;
create function crm_private.closure_criterion(id text,applicable boolean,ok boolean,facts jsonb) returns jsonb language sql immutable set search_path=pg_catalog,pg_temp as $$
 select jsonb_build_object('id',id,'result',case when not applicable then 'not_applicable' when coalesce(ok,false) then 'satisfied' else 'pending' end,'facts',facts)
$$;
create function crm_private.closure_assess(i jsonb,a jsonb) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare d text:=a->>'dimension'; c jsonb:='[]'; x jsonb; checks jsonb; svc jsonb; ok boolean; applicable boolean; needed boolean; ids jsonb; begin
 -- Every current requirement is classified with an explicit reason. No text heuristics.
 if jsonb_typeof(a->'documentDependencies')is distinct from'array' or jsonb_array_length(a->'documentDependencies')<>jsonb_array_length(i->'requirements') or (select count(distinct v->>'requirementId')from jsonb_array_elements(a->'documentDependencies')v)<>jsonb_array_length(i->'requirements') then raise exception 'CLOSURE_DOCUMENT_DEPENDENCIES_REQUIRED:E3'; end if;
 for x in select value from jsonb_array_elements(a->'documentDependencies') loop
  if x-array['requirementId','dimensions','reason']<>'{}'::jsonb or not(x?&array['requirementId','dimensions','reason'])or not exists(select 1 from jsonb_array_elements(i->'requirements')v where v->'id'=x->'requirementId')or jsonb_typeof(x->'dimensions')is distinct from'array' or jsonb_array_length(x->'dimensions')=0 or not(x->'dimensions'<@'["commercial","operational","economic"]'::jsonb)or not coalesce(crm_private.invoice_text(x->'reason'),false)then raise exception 'CLOSURE_DOCUMENT_DEPENDENCIES_REQUIRED:E3'; end if;
 end loop;
 select coalesce(jsonb_agg(v order by v->>'id'),'[]')into ids from jsonb_array_elements(i->'requirements')v where exists(select 1 from jsonb_array_elements(a->'documentDependencies')m where m->'requirementId'=v->'id' and m->'dimensions'?d);
 c:=c||jsonb_build_array(crm_private.closure_criterion('documents',ids<>'[]'::jsonb,not exists(select 1 from jsonb_array_elements(ids)v where not coalesce(v->'state'->>'status'in('Revisado','No aplica'),false)),ids));
 if d='commercial' then
  c:=c||jsonb_build_array(crm_private.closure_criterion('final-terms',true,i->'agreement'->'terms' is not null,i->'agreement'));
  c:=c||jsonb_build_array(crm_private.closure_criterion('modifications',i->'modifications'<>'[]'::jsonb,not exists(select 1 from jsonb_array_elements(i->'modifications')v cross join lateral jsonb_array_elements(v->'parts')p where not coalesce(v->>'progress'in('Rechazada','Cancelada/sin efecto'),false)and coalesce(p->'applied','null'::jsonb)='null'::jsonb),i->'modifications'));
 elsif d='operational' then
  c:=c||jsonb_build_array(crm_private.closure_criterion('performance',true,jsonb_array_length(i->'scopes')>0 and not exists(select 1 from jsonb_array_elements(i->'scopes')v where (v->>'resolved')::boolean is distinct from true)and i->'realityPending'='[]'::jsonb,i->'scopes'));
  select coalesce(jsonb_agg(v),'[]')into ids from jsonb_array_elements(i->'incidents')v where v->>'status'in('Abierta','En gestión')and v->>'severity'='Crítica' and v->'impact'->'material'='true'::jsonb and v->'impact'->>'effect'in('operation','preparation','complete-close');
  c:=c||jsonb_build_array(crm_private.closure_criterion('critical-incidents',ids<>'[]'::jsonb,not exists(select 1 from jsonb_array_elements(ids)v where v->'justification'='null'::jsonb),ids));
 else
  -- Applicability is evidenced per service; an existing obligation cannot be waived.
  if jsonb_typeof(a->'serviceApplicability')is distinct from'array' or jsonb_array_length(a->'serviceApplicability')<>jsonb_array_length(i->'services')or(select count(distinct v->>'serviceId')from jsonb_array_elements(a->'serviceApplicability')v)<>jsonb_array_length(i->'services') then raise exception 'CLOSURE_SERVICE_APPLICABILITY_REQUIRED:E3';end if;
  for x in select value from jsonb_array_elements(a->'serviceApplicability')loop
   select v into svc from jsonb_array_elements(i->'services')v where v->'service_id'=x->'serviceId';
   if svc is null or x-array['serviceId','suplido','deposit','ownEconomics','reason']<>'{}'::jsonb or not(x?&array['serviceId','suplido','deposit','ownEconomics','reason'])or jsonb_typeof(x->'suplido')is distinct from'boolean'or jsonb_typeof(x->'deposit')is distinct from'boolean'or jsonb_typeof(x->'ownEconomics')is distinct from'boolean'or not coalesce(crm_private.invoice_text(x->'reason'),false)or svc->>'nature'='internal'and x->'suplido'='true'::jsonb then raise exception 'CLOSURE_SERVICE_APPLICABILITY_REQUIRED:E3';end if;
  end loop;
  c:=c||jsonb_build_array(crm_private.closure_criterion('customer-obligations',true,jsonb_array_length(i->'schedules')>0 and not exists(select 1 from jsonb_array_elements(i->'schedules')v where jsonb_array_length(v->'coverage')=0 or exists(select 1 from jsonb_array_elements(v->'coverage')p where(p->>'remaining')::numeric is distinct from 0::numeric)),i->'schedules'));
  needed:=exists(select 1 from jsonb_array_elements(i->'services')v where v->>'nature'='external');
  ok:=not exists(select 1 from jsonb_array_elements(i->'suplidos')v where v->>'status'is distinct from'Documentalmente resuelto')and not exists(select 1 from jsonb_array_elements(i->'invoices')v where v->>'status'is distinct from'Vinculada')and not exists(select 1 from jsonb_array_elements(i->'services')v where v->>'nature'='external' and not exists(select 1 from jsonb_array_elements(i->'suplidos')su where su->'basis'->'serviceId'=v->'service_id'));
  c:=c||jsonb_build_array(crm_private.closure_criterion('supplier-documents',needed or i->'suplidos'<>'[]'::jsonb or i->'invoices'<>'[]'::jsonb,ok,jsonb_build_object('suplidos',i->'suplidos','invoices',i->'invoices')));
  needed:=true;
  ok:=jsonb_array_length(i->'ownEconomics')>0 and not exists(select 1 from jsonb_array_elements(i->'ownEconomics')v where (v->'computed'->'totals'->'real'->>'definitive'is distinct from'true' or v->'sourceCurrent'is distinct from'true'::jsonb)) and not exists(select 1 from jsonb_array_elements(a->'serviceApplicability')v where v->'ownEconomics'='true'::jsonb and not exists(select 1 from jsonb_array_elements(i->'ownEconomics')e cross join lateral jsonb_array_elements(e->'input'->'fees')f where f->'serviceId'=v->'serviceId'));
  ok:=ok and not exists(select 1 from jsonb_array_elements(i->'services')svrow where svrow->>'nature'='internal' and not exists(select 1 from jsonb_array_elements(i->'ownEconomics')oe cross join lateral jsonb_array_elements(oe->'input'->'costs')cost where cost->'serviceId'=svrow->'service_id'));
  c:=c||jsonb_build_array(crm_private.closure_criterion('own-economics',needed or i->'ownEconomics'<>'[]'::jsonb,ok,i->'ownEconomics'));
  c:=c||jsonb_build_array(crm_private.closure_criterion('refunds',i->'refunds'<>'[]'::jsonb,not exists(select 1 from jsonb_array_elements(i->'refunds')v where v->'sourceCurrent'is distinct from'true'::jsonb or(v->>'pendingRight')::numeric is distinct from 0::numeric or(v->>'pendingAuthorized')::numeric is distinct from 0::numeric or coalesce((v->>'uncertain')::numeric,0)>0 or v->>'status'in('Pendiente de revalidación','Incidencia')),i->'refunds'));
  needed:=exists(select 1 from jsonb_array_elements(a->'serviceApplicability')v where v->'deposit'='true'::jsonb);
  ok:=not exists(select 1 from jsonb_array_elements(i->'deposits')v where v->'sourceCurrent'is distinct from'true'::jsonb or v->>'applicability'<>'not_applicable'and(v->>'applicability'<>'required'or v->'amounts'->'resolved'is distinct from'true'::jsonb or v->'resolution'='null'::jsonb))and not exists(select 1 from jsonb_array_elements(a->'serviceApplicability')v where v->'deposit'='true'::jsonb and not exists(select 1 from jsonb_array_elements(i->'deposits')e where e->'serviceId'=v->'serviceId'));
  c:=c||jsonb_build_array(crm_private.closure_criterion('deposits',needed or i->'deposits'<>'[]'::jsonb,ok,i->'deposits'));
  select coalesce(jsonb_agg(v),'[]')into ids from jsonb_array_elements(i->'incidents')v where v->>'status'in('Abierta','En gestión')and v->'impact'->>'effect'='economic-review';
  c:=c||jsonb_build_array(crm_private.closure_criterion('economic-incidents',ids<>'[]'::jsonb,ids='[]'::jsonb,ids));
  ok:=not exists(select 1 from jsonb_array_elements(i->'cancellations')v where v->'sourceCurrent'is distinct from'true'::jsonb or v->'computed'->>'status'is distinct from'determined' or coalesce((v->'computed'->>'right')::numeric,0)>0 and not exists(select 1 from jsonb_array_elements(i->'refunds')f where f->'determination'->'id'=v->'id'));
  c:=c||jsonb_build_array(crm_private.closure_criterion('cancellation-obligations',i->'cancellations'<>'[]'::jsonb,ok,i->'cancellations'));
 end if;
 -- Full manifest, exact IDs, no implicit resolution or implicit No aplica.
 checks:=a->'criteria';if jsonb_typeof(checks)is distinct from'array'or jsonb_array_length(checks)<>jsonb_array_length(c)or(select count(distinct v->>'id')from jsonb_array_elements(checks)v)<>jsonb_array_length(c)then raise exception 'CLOSURE_CRITERIA_REQUIRED:E3';end if;
 ids:='[]';for x in select value from jsonb_array_elements(c)loop
  select v into checks from jsonb_array_elements(a->'criteria')v where v->'id'=x->'id';
  if checks is null or checks-array['id','conclusion','reason']<>'{}'::jsonb or not(checks?&array['id','conclusion','reason'])or coalesce(checks->>'conclusion','')not in('satisfied','pending','not_applicable')or not coalesce(crm_private.invoice_text(checks->'reason'),false)or checks->>'conclusion'='not_applicable'and x->>'result'<>'not_applicable'or checks->>'conclusion'='satisfied'and x->>'result'<>'satisfied' then raise exception 'CLOSURE_CRITERION_UNSUPPORTED:E3';end if;
  ids:=ids||jsonb_build_array(x||jsonb_build_object('review',checks));
 end loop;
 return jsonb_build_object('criteria',ids,'status',case when a->>'action'='open'or exists(select 1 from jsonb_array_elements(ids)v where v->>'result'='pending'or v->'review'->>'conclusion'='pending')then 'Pendiente'else 'Resuelto'end);
end$$;
create function crm_private.closure_read_core(bid uuid,s text) returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare i jsonb; views jsonb:='{}'; v record; basis jsonb; begin
 perform crm_private.booking_preparation_lock(bid); i:=crm_private.closure_inputs(bid,s);
 for v in select distinct on(dimension)dimension,state,command from crm_private.b06_closure_assessments where booking_id=bid and admin_scope=s order by dimension,revision desc loop
  basis:=crm_private.closure_basis(i,v.dimension,v.command);
  views:=views||jsonb_build_object(v.dimension,v.state||jsonb_build_object('applicable',v.state->>'basisHash'=crm_private.booking_preparation_hash(basis),'currentStatus',case when v.state->>'basisHash'=crm_private.booking_preparation_hash(basis)then v.state->>'status'else 'Pendiente'end,'currentBasis',basis,'currentBasisHash',crm_private.booking_preparation_hash(basis)));
 end loop;
 return jsonb_build_object('bookingId',bid,'revision',(select count(*)from crm_private.b06_closure_assessments where booking_id=bid and admin_scope=s),
  'material',crm_private.booking_preparation_hash(i),'inputs',i,'assessments',views,
  'history',(select coalesce(jsonb_agg(jsonb_build_object('revision',revision,'dimension',dimension,'state',state,'command',command,'actorId',actor_id,'evidenceId',evidence_id,'recordedAt',recorded_at)order by revision),'[]')from crm_private.b06_closure_assessments where booking_id=bid and admin_scope=s));
end$$;
create function crm_api.closure_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;bid uuid;op uuid;s text;actor uuid;fp text;prior crm_private.b06_closure_operations;i jsonb;v jsonb;r jsonb;rev bigint;basis jsonb;old jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17]collate "C" is distinct from tf[14]collate "C" then raise exception 'CLOSURE_DENIED';end if;
 s:=hf[17];actor:=hf[12]::uuid;fs:=crm_f1.fields(q);
 if cardinality(fs)<>2 or fs[1]<>'CRM-H5-CLOSURE1'then raise exception 'CLOSURE_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a)is distinct from'object'or not(a?&array['action','operationId','bookingId','dimension','expectedRevision','expectedMaterial','sourceRef','reason','at','evidenceId','criteria','documentDependencies','serviceApplicability'])or a-array['action','operationId','bookingId','dimension','expectedRevision','expectedMaterial','sourceRef','reason','at','evidenceId','criteria','documentDependencies','serviceApplicability']<>'{}'::jsonb or coalesce(a->>'action','')not in('open','evaluate')or coalesce(a->>'dimension','')not in('commercial','operational','economic')or not coalesce(crm_private.invoice_text(a->'sourceRef'),false)or not coalesce(crm_private.invoice_text(a->'reason'),false)or not coalesce(crm_private.availability_time(a->'at'),false)or coalesce(a->>'expectedRevision','')!~'^[0-9]+$'or jsonb_typeof(a->'serviceApplicability')is distinct from'array'then raise exception 'CLOSURE_INPUT_INVALID';end if;
 bid:=(a->>'bookingId')::uuid;op:=(a->>'operationId')::uuid;
 -- Authorize the Booking even on replay, then serialize before any material reads.
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s)then raise exception 'CLOSURE_DENIED';end if;
 perform crm_private.booking_preparation_lock(bid);fp:=crm_private.booking_preparation_hash(a);
 select *into prior from crm_private.b06_closure_operations where operation_id=op;
 if found then
  if prior.booking_id<>bid or prior.admin_scope<>s or prior.actor_id<>actor or prior.fingerprint<>fp then raise exception 'CLOSURE_REPLAY_CONFLICT:E2';end if;
  r:=prior.result||jsonb_build_object('replayed',true);
 else
  if not coalesce(crm_private.payment_evidence((a->>'evidenceId')::uuid,bid,s,'closure:'||crm_private.booking_preparation_hash(a-array['operationId','evidenceId']),(a->>'at')::timestamptz,true),false)or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor)then raise exception 'CLOSURE_EVIDENCE_REQUIRED:E3';end if;
  i:=crm_private.closure_inputs(bid,s);select count(*)into rev from crm_private.b06_closure_assessments where booking_id=bid and admin_scope=s;
  if rev<>(a->>'expectedRevision')::bigint or a->>'expectedMaterial'is distinct from crm_private.booking_preparation_hash(i)then raise exception 'CLOSURE_MATERIAL_CONFLICT:E2';end if;
  select state into old from crm_private.b06_closure_assessments where booking_id=bid and admin_scope=s and dimension=a->>'dimension'order by revision desc limit 1;
  if a->>'action'='evaluate'and old is null then raise exception 'CLOSURE_OPEN_REQUIRED:E3';end if;
  if old->>'status'='Resuelto'then raise exception 'CLOSURE_REOPEN_RESERVED:E3';end if;
  v:=crm_private.closure_assess(i,a);basis:=crm_private.closure_basis(i,a->>'dimension',a);
  v:=v||jsonb_build_object('dimension',a->'dimension','revision',rev+1,'basis',basis,'basisHash',crm_private.booking_preparation_hash(basis),'actorId',actor,'at',a->'at','evidenceId',a->'evidenceId','reason',a->'reason','sourceRef',a->'sourceRef');
  insert into crm_private.b06_closure_assessments values(bid,rev+1,a->>'dimension',s,op,a,v,actor,(a->>'evidenceId')::uuid,clock_timestamp());
  r:=jsonb_build_object('id',bid,'replayed',false,'result',v);
  insert into crm_private.b06_closure_operations values(op,bid,s,actor,fp,r,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.closure_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;r jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17]collate "C" is distinct from tf[14]collate "C"then raise exception 'CLOSURE_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H5-CLOSURE-READ1'then raise exception 'CLOSURE_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if not(a?'bookingId')or a-'bookingId'<>'{}'::jsonb then raise exception 'CLOSURE_INPUT_INVALID';end if;
 r:=crm_private.closure_read_core((a->>'bookingId')::uuid,hf[17]);
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
-- The canonical Booking read composes the assessments; no independent root/entity.
do $$declare body text;anchor text:='r:=crm_private.reality_projection(crm_private.modification_projection(r,hf[17]),hf[17]);';begin
 body:=pg_get_functiondef('crm_api.booking_read(bytea,bytea,bytea,bytea,bytea)'::regprocedure);
 if position(anchor in body)=0 then raise exception 'CLOSURE_BOOKING_READ_ANCHOR_MISSING';end if;
 execute replace(body,anchor,anchor||' if r is not null then r:=r||jsonb_build_object(''closureAssessments'',crm_private.closure_read_core((a->>''bookingId'')::uuid,hf[17]));end if;');
end$$;
do $$declare f record;begin
 for f in select p.oid,n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in('crm_private','crm_api')and p.proname like'closure_%'loop
  execute format('alter function %s owner to %I',f.oid::regprocedure,case when f.nspname='crm_api' or f.oid='crm_private.closure_writer()'::regprocedure then 'crm_h0_f2_executor'else 'crm_h0_f2_owner'end);
  execute format('revoke all on function %s from public,crm_h0_runtime,crm_h0_ha_tx',f.oid::regprocedure);
  execute format('grant execute on function %s to %I',f.oid::regprocedure,case when f.nspname='crm_api'then 'crm_h0_runtime'else 'crm_h0_f2_executor'end);
  if f.nspname='crm_private'then execute format('grant execute on function %s to crm_h0_migration',f.oid::regprocedure);end if;
 end loop;
end$$;
revoke create on schema crm_private from crm_h0_f2_owner,crm_h0_f2_executor;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
