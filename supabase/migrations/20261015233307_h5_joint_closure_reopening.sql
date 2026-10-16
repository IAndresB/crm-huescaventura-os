-- TSK-H5-015: explicit joint closure and durable material invalidation.
-- Reuses H5-013 evaluators. Historical migrations and assessments are immutable.
begin;
do $$begin if current_user <> 'crm_h0_migration' then raise exception 'CLOSURE_MIGRATION_AUTHORITY_REQUIRED'; end if; end$$;
grant create on schema crm_private to crm_h0_f2_owner,crm_h0_f2_executor;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b06_joint_closures(
 booking_id uuid not null references crm_private.b04_bookings, revision bigint not null check(revision>0),
 admin_scope text not null, operation_id uuid not null unique references crm_private.b06_closure_operations deferrable initially deferred,
 state jsonb not null, actor_id uuid not null references crm_private.crm_actors,
 evidence_id uuid not null references crm_private.b07_records, recorded_at timestamptz not null default clock_timestamp(),
 primary key(booking_id,revision)
);
create table crm_private.b06_closure_invalidations(
 booking_id uuid not null, assessment_revision bigint not null, admin_scope text not null,
 previous_basis jsonb not null, current_basis jsonb not null, cause jsonb not null,
 recorded_at timestamptz not null default clock_timestamp(),
 primary key(booking_id,assessment_revision),
 foreign key(booking_id,assessment_revision) references crm_private.b06_closure_assessments(booking_id,revision),
 check(previous_basis is distinct from current_basis), check(jsonb_typeof(cause)='object')
);
do $$declare t text;begin
 foreach t in array array['b06_joint_closures','b06_closure_invalidations'] loop
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
-- End-of-unit invalidation observes the complete writer result, never intermediate
-- rows. BEFORE writer triggers already hold the Booking root until transaction end.
create function crm_private.closure_invalidate(bid uuid,cause jsonb) returns void language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
declare v record; i jsonb; basis jsonb; s text;begin
 if bid is null then return;end if;
 if not exists(select 1 from crm_private.b06_closure_assessments where booking_id=bid and state->>'status'='Resuelto')then return;end if;
 perform crm_private.booking_preparation_lock(bid);
 select admin_scope into s from crm_private.b04_bookings where booking_id=bid;
 i:=crm_private.closure_inputs(bid,s);
 for v in select distinct on(dimension)* from crm_private.b06_closure_assessments where booking_id=bid and admin_scope=s order by dimension,revision desc loop
  if v.state->>'status'<>'Resuelto' then continue;end if;
  basis:=crm_private.closure_basis(i,v.dimension,v.command);
  -- SM-CL-04 global guard also covers critical incidents whose localized
  -- impact does not participate in H5-013's dimension-specific basis.
  if v.dimension='operational' and exists(select 1 from jsonb_array_elements(i->'incidents')x where x->>'severity'='Crítica' and x->>'status'in('Abierta','En gestión') and
   (x->'justification'->>'purpose'is distinct from'complete-close' or not coalesce(crm_private.invoice_text(x->'justification'->'basis'),false) or x->'justification'->>'actorId'is null or x->'justification'->>'evidenceId'is null))then
   basis:=basis||jsonb_build_object('jointCriticalGuard',i->'incidents');
  end if;
  if basis is distinct from v.state->'basis' then
   insert into crm_private.b06_closure_invalidations values(bid,v.revision,s,v.state->'basis',basis,cause,clock_timestamp()) on conflict do nothing;
  end if;
 end loop;
end$$;
-- Clone only the established root resolvers; deferred triggers share exactly the
-- same dependency mapping as the existing BEFORE locks (including shared funds).
do $$declare body text; name text; t record;begin
 foreach name in array array['booking_preparation_writer','closure_writer']loop
  body:=pg_get_functiondef(('crm_private.'||name||'()')::regprocedure);
  body:=replace(body,'crm_private.'||name||'()','crm_private.closure_invalidation_'||name||'()');
  body:=replace(body,'perform crm_private.booking_preparation_lock(bid);',
   'perform crm_private.closure_invalidate(bid,jsonb_build_object(''sourceTable'',TG_TABLE_NAME,''sourceRecord'',x,''recordedBy'',''T10 material invalidation''));');
  if position('perform crm_private.closure_invalidate' in body)=0 then raise exception 'CLOSURE_ROOT_RESOLVER_ANCHOR_MISSING';end if;
  execute body;
  for t in select distinct tgrelid::regclass rel from pg_trigger where tgfoid=('crm_private.'||name||'()')::regprocedure and not tgisinternal loop
   execute format('create constraint trigger closure_material_invalidation after insert or update on %s deferrable initially deferred for each row execute function crm_private.closure_invalidation_%I()',t.rel,name);
  end loop;
 end loop;
end$$;
-- Read-only composition: history is preserved; invalidation cannot disappear when
-- a later correction happens to restore the former material hash.
do $$declare body text;anchor text;begin
 body:=pg_get_functiondef('crm_private.closure_read_core(uuid,text)'::regprocedure);
 anchor:='basis:=crm_private.closure_basis(i,v.dimension,v.command);';
 if position(anchor in body)=0 then raise exception 'CLOSURE_READ_ANCHOR_MISSING';end if;
 -- Keep the H5-013 API and its original history. New joint state is composed below.
 body:=replace(body,'v.state->>''basisHash''=crm_private.booking_preparation_hash(basis)',
  '(v.state->>''basisHash''=crm_private.booking_preparation_hash(basis) and not exists(select 1 from crm_private.b06_closure_invalidations z where z.booking_id=bid and z.assessment_revision=(v.state->>''revision'')::bigint))');
 body:=replace(body,$a$'history',(select$a$, $a$'jointClosure',crm_private.closure_joint_view(bid,s),'invalidations',(select coalesce(jsonb_agg(to_jsonb(z)order by assessment_revision),'[]')from crm_private.b06_closure_invalidations z where booking_id=bid and admin_scope=s),'history',(select$a$);
 -- Function dependency is resolved when called, after the following definition.
 execute body;
end$$;
create function crm_private.closure_joint_view(bid uuid,s text) returns jsonb language sql stable set search_path=pg_catalog,pg_temp as $$
 with latest as(select * from crm_private.b06_joint_closures where booking_id=bid and admin_scope=s order by revision desc limit 1)
 select jsonb_build_object('revision',coalesce((select revision from latest),0),
  'current',exists(select 1 from latest l where not exists(select 1 from jsonb_each(l.state->'assessments')a join crm_private.b06_closure_invalidations z on z.booking_id=bid and z.assessment_revision=(a.value->>'revision')::bigint)),
  'latestClose',(select state from latest),
  'history',(select coalesce(jsonb_agg(jsonb_build_object('revision',revision,'state',state,'recordedAt',recorded_at)order by revision),'[]')from crm_private.b06_joint_closures where booking_id=bid and admin_scope=s))
$$;
-- Admission, exact evidence binding, replay and final F1/F2 checks are the same
-- boundary as H5-013. The joint action has its own strict command shape.
create function crm_api.closure_joint_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;bid uuid;op uuid;s text;actor uuid;fp text;prior crm_private.b06_closure_operations;i jsonb;v jsonb;r jsonb;rev bigint;basis jsonb;view jsonb;d text;assessment record;results jsonb:='{}';conflict_constraint text;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17]collate "C" is distinct from tf[14]collate "C" then raise exception 'CLOSURE_DENIED';end if;
 s:=hf[17];actor:=hf[12]::uuid;fs:=crm_f1.fields(q);
 if cardinality(fs)<>2 or fs[1]<>'CRM-H5-CLOSURE1'then raise exception 'CLOSURE_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a)is distinct from'object' or not(a?&array['action','operationId','bookingId','expectedRevision','expectedMaterial','expectedJointRevision','sourceRef','reason','at','evidenceId']) or a-array['action','operationId','bookingId','expectedRevision','expectedMaterial','expectedJointRevision','sourceRef','reason','at','evidenceId']<>'{}'::jsonb or a->>'action'is distinct from'close' or not coalesce(crm_private.invoice_text(a->'sourceRef'),false)or not coalesce(crm_private.invoice_text(a->'reason'),false)or not coalesce(crm_private.availability_time(a->'at'),false)or coalesce(a->>'expectedRevision','')!~'^[0-9]+$'or coalesce(a->>'expectedJointRevision','')!~'^[0-9]+$'then raise exception 'CLOSURE_INPUT_INVALID';end if;
 bid:=(a->>'bookingId')::uuid;op:=(a->>'operationId')::uuid;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s)then raise exception 'CLOSURE_DENIED';end if;
 perform crm_private.booking_preparation_lock(bid);fp:=crm_private.booking_preparation_hash(a);
 select *into prior from crm_private.b06_closure_operations where operation_id=op;
 if found then
  if prior.booking_id<>bid or prior.admin_scope<>s or prior.actor_id<>actor or prior.fingerprint<>fp then raise exception 'CLOSURE_REPLAY_CONFLICT:E2';end if;
  r:=prior.result||jsonb_build_object('replayed',true);
 else
  if not coalesce(crm_private.payment_evidence((a->>'evidenceId')::uuid,bid,s,'closure:'||crm_private.booking_preparation_hash(a-array['operationId','evidenceId']),(a->>'at')::timestamptz,true),false)or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor)then raise exception 'CLOSURE_EVIDENCE_REQUIRED:E3';end if;
  view:=crm_private.closure_read_core(bid,s);i:=view->'inputs';rev:=(view->'jointClosure'->>'revision')::bigint;
  if (view->>'revision')::bigint<>(a->>'expectedRevision')::bigint or a->>'expectedMaterial'is distinct from view->>'material' or rev<>(a->>'expectedJointRevision')::bigint then raise exception 'CLOSURE_MATERIAL_CONFLICT:E2';end if;
  if view->'jointClosure'->'current'='true'::jsonb then raise exception 'CLOSURE_ALREADY_CLOSED:E2';end if;
  foreach d in array array['commercial','operational','economic']loop
   if view->'assessments'->d->>'currentStatus'is distinct from'Resuelto' then raise exception 'CLOSURE_DIMENSION_PENDING:E3:%',d;end if;
   select *into assessment from crm_private.b06_closure_assessments where booking_id=bid and admin_scope=s and dimension=d order by revision desc limit 1;
   v:=crm_private.closure_assess(i,assessment.command);
   if v->>'status'is distinct from'Resuelto' then raise exception 'CLOSURE_DIMENSION_PENDING:E3:%',d;end if;
   results:=results||jsonb_build_object(d,assessment.state);
  end loop;
  -- BR-INC-002/SM-CL-04 applies to every open critical incident, beyond the
  -- dimension-specific materiality filters of the H5-013 evaluator.
  if exists(select 1 from jsonb_array_elements(i->'incidents')x where x->>'severity'='Crítica'and x->>'status'in('Abierta','En gestión')and
   (x->'justification'->>'purpose'is distinct from'complete-close' or not coalesce(crm_private.invoice_text(x->'justification'->'basis'),false)or x->'justification'->>'actorId'is null or x->'justification'->>'evidenceId'is null))then raise exception 'CLOSURE_CRITICAL_INCIDENT:E3';end if;
  v:=jsonb_build_object('status','Cerrada / Histórico','bookingId',bid,'revision',rev+1,'assessments',results,'basis',i,'basisHash',view->'material','actorId',actor,'at',a->'at','evidenceId',a->'evidenceId','sourceRef',a->'sourceRef','reason',a->'reason');
  insert into crm_private.b06_joint_closures values(bid,rev+1,s,op,v,actor,(a->>'evidenceId')::uuid,clock_timestamp());
  r:=jsonb_build_object('id',bid,'replayed',false,'result',v);
  insert into crm_private.b06_closure_operations values(op,bid,s,actor,fp,r,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
exception when unique_violation then
 get stacked diagnostics conflict_constraint=CONSTRAINT_NAME;
 if conflict_constraint in('b06_joint_closures_operation_id_key','b06_closure_operations_pkey')then raise exception 'CLOSURE_REPLAY_CONFLICT:E2';end if;
 raise;
end$$;
-- Extend only the existing command's transition boundary; its evaluator,
-- authorization, temporal/evidence checks and immutable writes remain shared.
do $$declare body text;anchor text;begin
 body:=pg_get_functiondef('crm_api.closure_apply(bytea,bytea,bytea,bytea,bytea)'::regprocedure);
 body:=replace(body,$a$not in('open','evaluate')$a$,$a$not in('open','evaluate','reopen')$a$);
 anchor:=$a$if old->>'status'='Resuelto'then raise exception 'CLOSURE_REOPEN_RESERVED:E3';end if;$a$;
 if position(anchor in body)=0 then raise exception 'CLOSURE_REOPEN_ANCHOR_MISSING';end if;
 body:=replace(body,anchor,$patch$
  if a->>'action'='reopen' then
   perform crm_private.closure_invalidate(bid,jsonb_build_object('sourceTable','explicit-reopening','sourceRecord',a,'actorId',actor));
   if old->>'status'is distinct from'Resuelto' then raise exception 'CLOSURE_NOT_RESOLVED:E3';end if;
   if not exists(select 1 from crm_private.b06_closure_invalidations where booking_id=bid and assessment_revision=(old->>'revision')::bigint)then raise exception 'CLOSURE_REOPEN_UNFOUNDED:E3';end if;
  elsif old->>'status'='Resuelto'then raise exception 'CLOSURE_REOPEN_RESERVED:E3';end if;
 $patch$);
 body:=replace(body,'v:=crm_private.closure_assess(i,a);','v:=crm_private.closure_assess(i,case when a->>''action''=''reopen''then a||jsonb_build_object(''action'',''open'')else a end);');
 body:=replace(body,'old jsonb;begin','old jsonb;conflict_constraint text;begin');
 body:=replace(body,E'return r;\nend',$patch$return r;
exception when unique_violation then
 get stacked diagnostics conflict_constraint=CONSTRAINT_NAME;
 if conflict_constraint in('b06_closure_assessments_operation_id_key','b06_closure_operations_pkey')then raise exception 'CLOSURE_REPLAY_CONFLICT:E2';end if;
 raise;
end$patch$);

 execute body;
end$$;
-- H5-016 F01: the same H5-013 evaluator must reject incomplete material.
-- Preserve migration62 and the evaluator signature; no parallel decision path.
do $$declare body text; old text; replacement text;begin
 body:=pg_get_functiondef('crm_private.closure_assess(jsonb,jsonb)'::regprocedure);
 old:=$a$i->'agreement'->'terms' is not null$a$;
 replacement:=$a$jsonb_typeof(i->'agreement'->'terms')='object' and coalesce(crm_private.invoice_text(i->'agreement'->'terms'->'version'),false) and coalesce(crm_private.invoice_text(i->'agreement'->'terms'->'text'),false) and coalesce(crm_private.invoice_text(i->'agreement'->'terms'->'sourceRef'),false)$a$;
 if position(old in body)=0 then raise exception 'CLOSURE_TERMS_GUARD_ANCHOR_MISSING';end if;body:=replace(body,old,replacement);
 old:=$a$not exists(select 1 from jsonb_array_elements(i->'modifications')v cross join lateral$a$;
 replacement:=$a$not exists(select 1 from jsonb_array_elements(i->'modifications')v where case when jsonb_typeof(v->'parts')='array' then jsonb_array_length(v->'parts')=0 else true end) and not exists(select 1 from jsonb_array_elements(i->'modifications')v cross join lateral$a$;
 if position(old in body)=0 then raise exception 'CLOSURE_PARTS_GUARD_ANCHOR_MISSING';end if;body:=replace(body,old,replacement);
 old:=$a$v->>'applicability'<>'not_applicable'and(v->>'applicability'<>'required'or v->'amounts'->'resolved'is distinct from'true'::jsonb or v->'resolution'='null'::jsonb)$a$;
 replacement:=$a$not coalesce(v->>'applicability'='not_applicable' or(v->>'applicability'='required' and v->'amounts'->'resolved'='true'::jsonb and jsonb_typeof(v->'resolution')='object'),false)$a$;
 if position(old in body)=0 then raise exception 'CLOSURE_DEPOSIT_GUARD_ANCHOR_MISSING';end if;body:=replace(body,old,replacement);
 execute body;
end$$;
do $$declare f record;begin
 for f in select p.oid,n.nspname,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in('crm_private','crm_api')and p.proname like'closure_%'loop
  execute format('alter function %s owner to %I',f.oid::regprocedure,case when f.nspname='crm_api' or f.proname like 'closure_invalidation_%' or f.proname='closure_writer'then 'crm_h0_f2_executor'else 'crm_h0_f2_owner'end);
  execute format('revoke all on function %s from public,crm_h0_runtime,crm_h0_ha_tx',f.oid::regprocedure);
  execute format('grant execute on function %s to %I',f.oid::regprocedure,case when f.nspname='crm_api'then 'crm_h0_runtime'else 'crm_h0_f2_executor'end);
  if f.nspname='crm_private'then execute format('grant execute on function %s to crm_h0_migration',f.oid::regprocedure);end if;
 end loop;
end$$;
revoke create on schema crm_private from crm_h0_f2_owner,crm_h0_f2_executor;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
