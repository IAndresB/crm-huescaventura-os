-- H4-009/010 only: immutable supplier/internal facts and localized service coverage.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'CONFIRMATION_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b04_confirmations(
 confirmation_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),admin_scope text not null,
 initial_operation_id uuid not null
);
create table crm_private.b04_confirmation_facts(
 fact_id uuid primary key,confirmation_id uuid not null references crm_private.b04_confirmations(confirmation_id),admin_scope text not null,
 corrects_id uuid references crm_private.b04_confirmation_facts(fact_id),material jsonb not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),evidence_id uuid not null references crm_private.b07_records(record_id),
 happened_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),operation_id uuid not null
);
create table crm_private.b04_confirmation_operations(
 operation_id uuid primary key,confirmation_id uuid not null references crm_private.b04_confirmations(confirmation_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,result jsonb not null,result_revision bigint not null,
 recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b04_confirmation_revisions(
 confirmation_id uuid not null references crm_private.b04_confirmations(confirmation_id),revision bigint not null check(revision>0),admin_scope text not null,
 operation_id uuid not null unique references crm_private.b04_confirmation_operations(operation_id) deferrable initially deferred,
 action_kind text not null check(action_kind in ('register','evaluate','review','rectify')),event jsonb not null,before_data jsonb,after_data jsonb not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),evidence_id uuid not null references crm_private.b07_records(record_id),
 source_ref text not null,reason text not null,occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(confirmation_id,revision)
);
create table crm_private.b04_confirmation_evaluations(
 booking_id uuid not null references crm_private.b04_bookings(booking_id),service_id uuid not null references crm_private.b04_services(service_id),
 revision bigint not null check(revision>0),confirmation_id uuid not null references crm_private.b04_confirmations(confirmation_id),
 admin_scope text not null,operation_id uuid not null unique references crm_private.b04_confirmation_operations(operation_id) deferrable initially deferred,
 material jsonb not null,primary key(service_id,revision)
);
alter table crm_private.b04_confirmations add foreign key(initial_operation_id) references crm_private.b04_confirmation_operations(operation_id) deferrable initially deferred;
alter table crm_private.b04_confirmation_operations add foreign key(confirmation_id,result_revision) references crm_private.b04_confirmation_revisions(confirmation_id,revision) deferrable initially deferred;
alter table crm_private.b04_confirmation_facts add foreign key(operation_id) references crm_private.b04_confirmation_operations(operation_id) deferrable initially deferred;
create index confirmation_booking on crm_private.b04_confirmations(admin_scope,booking_id);
do $$declare t text;r text;begin foreach t in array array['b04_confirmations','b04_confirmation_facts','b04_confirmation_operations','b04_confirmation_revisions','b04_confirmation_evaluations'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy confirmation_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy confirmation_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger confirmation_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
-- Retained accepted commercial scope: never equate customer prices to external cost.
create function crm_private.confirmation_commercial(bid uuid,sid uuid,cid uuid,nid uuid,s text) returns jsonb language sql stable set search_path=pg_catalog,pg_temp as $$
 select jsonb_build_object('terms',b.terms,'contributions',coalesce((select jsonb_agg(jsonb_build_object('id',c.contribution_id,'source',c.source_snapshot,'modality',m.snapshot) order by c.contribution_id)
 from crm_private.b04_contributions c join crm_private.b04_modalities m on m.booking_id=c.booking_id and m.modality_id=c.modality_id
 where c.booking_id=bid and c.service_id=sid and c.admin_scope=s and m.admin_scope=s and (cid is null or c.contribution_id=cid)
 and (nid is null or exists(select 1 from crm_private.b04_night_occupancies o where o.night_id=nid and o.contribution_id=c.contribution_id and o.admin_scope=s))),'[]'))
 from crm_private.b04_bookings b where b.booking_id=bid and b.admin_scope=s
$$;
create function crm_private.confirmation_coverage(x jsonb,bid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare sv crm_private.b04_services;begin
 if jsonb_typeof(x) is distinct from 'object' or not(x ?& array['serviceId','nightId','contributionId','serviceRevisionId','serviceRevision','bookingRevision','variant','date','time','quantity','unitRevisionId','commercialBasis','conditions'])
 or x-array['serviceId','nightId','contributionId','serviceRevisionId','serviceRevision','bookingRevision','variant','date','time','quantity','unitRevisionId','commercialBasis','conditions']<>'{}'::jsonb
 or coalesce(x->>'quantity','')!~'^[0-9]+(\.[0-9]+)?$' or (x->>'quantity')::numeric<=0
 or coalesce(x->>'date','')!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or coalesce(x->>'time','')!~'^[0-9]{2}:[0-9]{2}(:[0-9]{2})?[+-][0-9]{2}:[0-9]{2}$'
 or not coalesce(crm_private.invoice_text(x->'conditions'),false) then return false;end if;perform (x->>'time')::timetz;perform (x->>'date')::date;
 select * into sv from crm_private.b04_services where service_id=(x->>'serviceId')::uuid and booking_id=bid and admin_scope=s;
 if not found or sv.revision::text is distinct from x->>'serviceRevision' or sv.service_revision_id::text is distinct from x->>'serviceRevisionId'
 or sv.applied->'variant' is distinct from x->'variant' or not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s and revision::text=x->>'bookingRevision') then return false;end if;
 if x->'contributionId'<>'null'::jsonb and not exists(select 1 from crm_private.b04_contributions where contribution_id=(x->>'contributionId')::uuid and service_id=sv.service_id and booking_id=bid and admin_scope=s) then return false;end if;
 if x->'nightId'<>'null'::jsonb then
  if not exists(select 1 from crm_private.b04_nights where night_id=(x->>'nightId')::uuid and service_id=sv.service_id and admin_scope=s and night_date=(x->>'date')::date) then return false;end if;
 else
  if not exists(select 1 from crm_private.b04_contributions c join crm_private.b03_proposal_lines l on l.line_id=c.line_id and l.version_id=c.version_id where c.service_id=sv.service_id and c.admin_scope=s and l.admin_scope=s and (x->'contributionId'='null'::jsonb or c.contribution_id=(x->>'contributionId')::uuid) and l.service_date=(x->>'date')::date) then return false;end if;
 end if;
 if x->'commercialBasis' is distinct from crm_private.confirmation_commercial(bid,sv.service_id,(x->>'contributionId')::uuid,(x->>'nightId')::uuid,s) then return false;end if;
 return exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(x->>'unitRevisionId')::uuid and r.admin_scope=s and i.admin_scope=s and i.item_kind='unit');
end$$;
create function crm_private.confirmation_record(id uuid,bid uuid,s text) returns boolean language sql stable set search_path=pg_catalog,pg_temp as $$
 select exists(select 1 from crm_private.b07_records r join crm_private.b07_links l using(record_id) where r.record_id=id and r.admin_scope=s and l.admin_scope=s and l.context_kind='booking' and l.context_id=bid and r.record_kind in ('document','communication'))
$$;
create function crm_private.confirmation_fact(x jsonb,bid uuid,s text,actor uuid,at_time timestamptz) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare sv crm_private.b04_services;src jsonb;ofr crm_private.catalog_revisions;begin
 if jsonb_typeof(x) is distinct from 'object' or not(x ?& array['factId','recordId','source','happenedAt','content','certainty','coverage'])
 or x-array['factId','recordId','source','happenedAt','content','certainty','coverage']<>'{}'::jsonb or x->>'certainty' is distinct from 'confirmed'
 or not coalesce(crm_private.invoice_text(x->'content'),false) or not coalesce(crm_private.availability_time(x->'happenedAt'),false)
 or (x->>'happenedAt')::timestamptz>at_time or not coalesce(crm_private.confirmation_coverage(x->'coverage',bid,s),false)
 or not coalesce(crm_private.confirmation_record((x->>'recordId')::uuid,bid,s),false) then return false;end if;perform (x->>'factId')::uuid;
 src:=x->'source';if jsonb_typeof(src) is distinct from 'object' or not(src ?& array['kind','id','offeringRevisionId','counterpart','channel']) or src-array['kind','id','offeringRevisionId','counterpart','channel']<>'{}'::jsonb or not coalesce(crm_private.invoice_text(src->'counterpart'),false) then return false;end if;
 select * into sv from crm_private.b04_services where service_id=(x->'coverage'->>'serviceId')::uuid and admin_scope=s;
 if sv.nature='internal' then
  return src->>'kind'='internal' and src->'offeringRevisionId'='null'::jsonb and src->>'channel'='internal-record' and exists(select 1 from crm_private.crm_actors where actor_id=(src->>'id')::uuid and admin_scope=s and enabled);
 end if;
 if src->>'kind' is distinct from 'provider' or src->>'channel' not in ('phone','whatsapp','email','provider-platform') then return false;end if;
 select r.* into ofr from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(src->>'offeringRevisionId')::uuid and r.admin_scope=s and i.admin_scope=s and i.item_kind='offering';
 return ofr.revision_id is not null and ofr.parent_revision_id=(src->>'id')::uuid and (ofr.related_revision_id=sv.service_revision_id or ofr.related_revision_id=(x->'coverage'->>'variant')::uuid)
 and exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(src->>'id')::uuid and r.admin_scope=s and i.item_kind='provider')
 and (sv.applied->'provider'='null'::jsonb or sv.applied->'provider'=src->'id');
end$$;
-- Evaluate actual documentary inputs; no client supplied satisfied/eligibility booleans.
create function crm_private.confirmation_requirements(bid uuid,c jsonb,s text) returns jsonb language sql stable set search_path=pg_catalog,pg_temp as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',r.requirement_id,'revision',v.revision,'status',v.after_data->'status','basis',v.after_data->'basis') order by r.requirement_id),'[]')
 from crm_private.b07_requirements r cross join lateral(select * from crm_private.b07_requirement_revisions where requirement_id=r.requirement_id order by revision desc limit 1) v
 where r.booking_id=bid and r.admin_scope=s and v.admin_scope=s and v.after_data->'basis'->'rule'->'indispensable'='true'::jsonb
 and v.after_data->'basis'->'scope'->>'action'='confirm' and
 (not(v.after_data->'basis'->'scope'?'serviceId') or v.after_data->'basis'->'scope'->'serviceId'=c->'serviceId')
 and (not(v.after_data->'basis'->'scope'?'nightId') or v.after_data->'basis'->'scope'->'nightId'=c->'nightId')
$$;
-- Current dependency token is reconstructed, keeping its historical snapshot separately.
create function crm_private.confirmation_dependencies(d jsonb,bid uuid,c jsonb,s text,action_at timestamptz) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare x jsonb;v jsonb;cov jsonb;token jsonb;usable boolean;r jsonb:='[]';opp uuid;begin
 if jsonb_typeof(d) is distinct from 'array' then raise exception 'CONFIRMATION_DEPENDENCY_REQUIRED:E3';end if;
 select opportunity_id into opp from crm_private.b04_bookings where booking_id=bid and admin_scope=s;
 for x in select value from jsonb_array_elements(d) loop
  if x-array['kind','id','partId','reason']<>'{}'::jsonb or not(x ?& array['kind','id','reason']) or not coalesce(crm_private.invoice_text(x->'reason'),false) then raise exception 'CONFIRMATION_DEPENDENCY_REQUIRED:E3';end if;
  if x->>'kind'='availability' then
   select v.after_data into v from crm_private.b04_availability a cross join lateral(select after_data from crm_private.b04_availability_revisions where availability_id=a.availability_id order by revision desc limit 1) v where a.availability_id=(x->>'id')::uuid and a.booking_id=bid and a.admin_scope=s;
   cov:=coalesce(v->'confirmed'->'response'->'coverage',v->'response'->'coverage',v->'query'->'coverage');
   if v is null or cov->'serviceId' is distinct from c->'serviceId' or cov->'nightId' is distinct from c->'nightId' then raise exception 'CONFIRMATION_DENIED';end if;
   usable:=coalesce(v->'confirmed'<>'null'::jsonb and v->'review'='null'::jsonb and cov->'unitRevisionId'=c->'unitRevisionId' and cov->'variant'=c->'variant' and cov->'dates' ? (c->>'date') and (v->'confirmed'->'verification'->>'actionAt')::timestamptz=action_at and (v->'confirmed'->'verification'->>'actionUntil')::timestamptz>=action_at and (cov->>'quantity')::numeric>=(c->>'quantity')::numeric and (v->'confirmed'->'response'->'validUntil'='null'::jsonb or (v->'confirmed'->'response'->>'validUntil')::timestamptz>action_at),false);
   token:=jsonb_build_object('confirmed',v->'confirmed','review',v->'review','usable',usable);
  elsif x->>'kind'='hold' then
   select v.after_data into v from crm_private.b04_holds a cross join lateral(select after_data from crm_private.b04_hold_revisions where hold_id=a.hold_id order by revision desc limit 1) v where a.hold_id=(x->>'id')::uuid and a.opportunity_id=opp and a.admin_scope=s;
   select value into v from jsonb_array_elements(v->'parts') where value->'terms'->'id'=x->'partId' and value->'link'->'serviceId'=c->'serviceId' and value->'link'->'bookingId'=to_jsonb(bid);
   if v is null then raise exception 'CONFIRMATION_DENIED';end if;
   usable:=coalesce(v->>'validity'='Vigente' and v->'review'='null'::jsonb and (v->'verified'->>'actionAt')::timestamptz=action_at and (v->'verified'->>'actionUntil')::timestamptz>=action_at and (v->>'remaining')::numeric>=(c->>'quantity')::numeric and v->'terms'->'unitRevisionId'=c->'unitRevisionId' and v->'terms'->'date'=c->'date' and (v->'terms'->'expiresAt'='null'::jsonb or (v->'terms'->>'expiresAt')::timestamptz>action_at),false);
   token:=jsonb_build_object('terms',v->'terms','remaining',v->'remaining','validity',v->'validity','review',v->'review','verified',v->'verified','usable',usable);
  else raise exception 'CONFIRMATION_DEPENDENCY_REQUIRED:E3';end if;
  r:=r||jsonb_build_array(jsonb_build_object('dependency',x,'current',token));
 end loop;return r;
end$$;
create function crm_private.confirmation_discrepancy(fact jsonb,bid uuid,s text,iid uuid) returns boolean language sql stable set search_path=pg_catalog,pg_temp as $$
 select exists(select 1 from crm_private.b04_confirmation_facts f join crm_private.b04_confirmations context_root using(confirmation_id)
 where context_root.booking_id=bid and context_root.admin_scope=s and f.admin_scope=s and f.confirmation_id<>iid
 and f.material->'coverage'->'serviceId'=fact->'coverage'->'serviceId' and f.material->'coverage'->'nightId'=fact->'coverage'->'nightId'
 and f.material->'coverage'->'contributionId'=fact->'coverage'->'contributionId' and f.happened_at>=(fact->>'happenedAt')::timestamptz
 and f.material->'coverage' is distinct from fact->'coverage')
$$;
create function crm_private.confirmation_current(state jsonb,bid uuid,s text) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare missing jsonb:='[]';e jsonb:=state->'evaluation';current jsonb;app crm_private.catalog_applications;begin
 if e is null or e='null'::jsonb then return jsonb_build_object('usable',false,'missing',jsonb_build_array('evaluation'));end if;
 if state->'review'<>'null'::jsonb then missing:=missing||'"review"'::jsonb;end if;
 if crm_private.confirmation_discrepancy(state->'fact',bid,s,(state->>'id')::uuid) then missing:=missing||'"external-discrepancy:E8"'::jsonb;end if;
 if not coalesce(crm_private.confirmation_coverage(e->'coverage',bid,s),false) then missing:=missing||'"scope"'::jsonb;end if;
 current:=crm_private.confirmation_requirements(bid,e->'coverage',s);
 if current is distinct from e->'requirements' or exists(select 1 from jsonb_array_elements(current) x where x->>'status' not in ('Revisado','No aplica')) then missing:=missing||'"requirement"'::jsonb;end if;
 if crm_private.confirmation_dependencies(e->'dependencies',bid,e->'coverage',s,(e->>'at')::timestamptz) is distinct from e->'dependencySnapshot' then missing:=missing||'"dependency-review"'::jsonb;end if;
 select * into app from crm_private.catalog_applications where subject_ref=(e->'coverage'->>'serviceId')::uuid and admin_scope=s order by recorded_at desc,application_id desc limit 1;
 if app.application_id::text is distinct from e->>'catalogApplicationId' then missing:=missing||'"catalog-version"'::jsonb;end if;
 if e->'missing'<>'[]'::jsonb then missing:=missing||(e->'missing');end if;
 return jsonb_build_object('usable',missing='[]'::jsonb,'missing',missing);
end$$;
create function crm_api.confirmation_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,tf2p bytea,tf2s bytea,tf1p bytea,tf1s bytea,tq bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;op uuid;iid uuid;bid uuid;actor uuid;s text;action text;fp text;hash text;at_time timestamptz;rev bigint;evalrev bigint;
 root crm_private.b04_confirmations;prev crm_private.b04_confirmation_operations;existing crm_private.b04_confirmation_facts;
 old jsonb;state jsonb;d jsonb;r jsonb;fact jsonb;c jsonb;reqs jsonb;deps jsonb;missing jsonb;app crm_private.catalog_applications;sv uuid;
 known boolean:=false;follow boolean:=false;task jsonb;task_id uuid;opp uuid;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'CONFIRMATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-CONFIRMATION1' then raise exception 'CONFIRMATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a ?& array['action','operationId','confirmationId','bookingId','expectedRevision','expectedEvaluationRevision','sourceRef','reason','at','evidenceId','data'])
 or a-array['action','operationId','confirmationId','bookingId','expectedRevision','expectedEvaluationRevision','sourceRef','reason','at','evidenceId','data','origin']<>'{}'::jsonb
 or exists(select 1 from unnest(array['action','operationId','confirmationId','bookingId','sourceRef','reason','evidenceId']) k where not coalesce(crm_private.invoice_text(a->k),false))
 or not coalesce(crm_private.availability_time(a->'at'),false) or jsonb_typeof(a->'data') is distinct from 'object'
 or coalesce(a->>'expectedRevision','')!~'^(0|[1-9][0-9]*)$' or coalesce(a->>'expectedEvaluationRevision','')!~'^(0|[1-9][0-9]*)$' or coalesce(a->>'origin','manual')<>'manual' then raise exception 'CONFIRMATION_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;iid:=(a->>'confirmationId')::uuid;bid:=(a->>'bookingId')::uuid;actor:=hf[12]::uuid;s:=hf[17];action:=a->>'action';d:=a->'data';at_time:=(a->>'at')::timestamptz;
 if action not in ('register','evaluate','review','rectify') then raise exception 'CONFIRMATION_INPUT_INVALID';end if;
 select opportunity_id into opp from crm_private.b04_bookings where booking_id=bid and admin_scope=s;if not found then raise exception 'CONFIRMATION_DENIED';end if;
 -- Shared accepted parent, documentary and availability roots, in the existing lock order.
 perform pg_advisory_xact_lock(hashtextextended(opp::text,31));perform pg_advisory_xact_lock(hashtextextended('requirement-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended('availability-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended('confirmation-booking:'||bid,0));
 select * into root from crm_private.b04_confirmations where confirmation_id=iid;
 if (action<>'register' and root.confirmation_id is null) or (root.confirmation_id is not null and (root.booking_id<>bid or root.admin_scope<>s)) then raise exception 'CONFIRMATION_DENIED';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('confirmation-op:'||op,0));select * into prev from crm_private.b04_confirmation_operations where operation_id=op;
 if found then
  if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'CONFIRMATION_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  hash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.payment_evidence((a->>'evidenceId')::uuid,iid,s,'confirmation:'||action||':'||hash,at_time,true) or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'CONFIRMATION_EVIDENCE_REQUIRED:E3';end if;
  if action in ('register','rectify') then
   perform pg_advisory_xact_lock(hashtextextended('confirmation-fact:'||(d->>'factId'),0));select * into existing from crm_private.b04_confirmation_facts where fact_id=(d->>'factId')::uuid;
   if found then
    if existing.admin_scope<>s or existing.material is distinct from d or not exists(select 1 from crm_private.b04_confirmations where confirmation_id=existing.confirmation_id and booking_id=bid and admin_scope=s) then raise exception 'CONFIRMATION_FACT_CONFLICT:E2';end if;
    if action='rectify' and existing.confirmation_id<>iid then raise exception 'CONFIRMATION_FACT_CONFLICT:E2';end if;iid:=existing.confirmation_id;select * into root from crm_private.b04_confirmations where confirmation_id=iid;known:=true;
   end if;
  end if;
  if root.confirmation_id is not null then select revision,after_data into rev,old from crm_private.b04_confirmation_revisions where confirmation_id=iid order by revision desc limit 1;end if;
  if not known and action in ('review','evaluate') and exists(select 1 from crm_private.b04_confirmation_revisions where confirmation_id=iid and action_kind=action and event->'data'=d) then
   if action='review' and old->'review'<>'null'::jsonb or action='evaluate' and (crm_private.confirmation_current(old,bid,s)->>'usable')::boolean then known:=true;end if;
  end if;
  state:=old;
  if not known then
   if coalesce(rev,0)<>(a->>'expectedRevision')::bigint then raise exception 'CONFIRMATION_REVISION_CONFLICT:E2';end if;
   if action in ('register','rectify') then
    if not coalesce(crm_private.confirmation_fact(d,bid,s,actor,at_time),false) then raise exception 'CONFIRMATION_FACT_REQUIRED:E3';end if;
    if action='register' then
     if root.confirmation_id is not null or (a->>'expectedRevision')::bigint<>0 then raise exception 'CONFIRMATION_REVISION_CONFLICT:E2';end if;
     insert into crm_private.b04_confirmations values(iid,bid,s,op);state:=jsonb_build_object('id',iid,'bookingId',bid,'fact',d,'review',null,'evaluation',null);rev:=0;
    else
     if old->'review'='null'::jsonb or d->'recordId'=old->'fact'->'recordId' then raise exception 'CONFIRMATION_NEW_PROOF_REQUIRED:E3';end if;
     if (d->>'happenedAt')::timestamptz<=(old->'fact'->>'happenedAt')::timestamptz then raise exception 'CONFIRMATION_PRECEDENCE_REQUIRED:E8';end if;
     if d->'coverage'->'serviceId'<>old->'fact'->'coverage'->'serviceId' then raise exception 'CONFIRMATION_SCOPE_REQUIRED:E3';end if;
     state:=old||jsonb_build_object('fact',d,'review',null,'evaluation',null);
    end if;
    insert into crm_private.b04_confirmation_facts values((d->>'factId')::uuid,iid,s,case when action='rectify' then (old->'fact'->>'factId')::uuid else null end,d,actor,(a->>'evidenceId')::uuid,(d->>'happenedAt')::timestamptz,clock_timestamp(),op);
   elsif action='review' then
    if d-array['recordId','cause','before','after','aspects','dependencies','result']<>'{}'::jsonb or not(d ?& array['recordId','cause','before','after','aspects','dependencies','result'])
    or not coalesce(crm_private.confirmation_record((d->>'recordId')::uuid,bid,s),false) or not coalesce(crm_private.invoice_text(d->'cause'),false)
    or d->'before' is distinct from old->'fact' or jsonb_typeof(d->'after') is distinct from 'object' or jsonb_typeof(d->'aspects') is distinct from 'array' or jsonb_array_length(d->'aspects')=0
    or exists(select 1 from jsonb_array_elements_text(d->'aspects') x where x not in ('time','date','quantity','unit','price','conditions','capacity','source','variant','scope'))
    or d->'dependencies' is distinct from jsonb_build_array(old->'fact'->'coverage') or d->>'result' is distinct from 'pending' then raise exception 'CONFIRMATION_REVIEW_REQUIRED:E3';end if;
    state:=old||jsonb_build_object('review',d||jsonb_build_object('evidenceId',a->'evidenceId','actorId',actor,'at',at_time));follow:=true;
   else
    if d-array['coverage','catalogApplicationId','eligibilityProofId','scopeProofId','agreementProofId','dependencies']<>'{}'::jsonb or not(d ?& array['coverage','catalogApplicationId','eligibilityProofId','scopeProofId','agreementProofId','dependencies']) then raise exception 'CONFIRMATION_EVALUATION_REQUIRED:E3';end if;
    c:=d->'coverage';if not coalesce(crm_private.confirmation_coverage(c,bid,s),false) then raise exception 'CONFIRMATION_SCOPE_REQUIRED:E3';end if;sv:=(c->>'serviceId')::uuid;
    if (c-array['quantity']) is distinct from ((old->'fact'->'coverage')-array['quantity']) or (c->>'quantity')::numeric>(old->'fact'->'coverage'->>'quantity')::numeric then raise exception 'CONFIRMATION_COVERAGE_REQUIRED:E3';end if;
    select coalesce(max(revision),0) into evalrev from crm_private.b04_confirmation_evaluations where service_id=sv and admin_scope=s;
    if evalrev<>(a->>'expectedEvaluationRevision')::bigint then raise exception 'CONFIRMATION_EVALUATION_CONFLICT:E2';end if;
    missing:='[]';if old->'review'<>'null'::jsonb then missing:=missing||'"review"'::jsonb;end if;
    -- A reviewed applied catalogue manifest is real versioned input, never a recommendation boolean.
    select * into app from crm_private.catalog_applications where application_id=(d->>'catalogApplicationId')::uuid and subject_ref=sv and admin_scope=s;
    if not found or not exists(select 1 from jsonb_array_elements(app.applied_revisions) x where x->'revision'->>'revision_id'=c->>'serviceRevisionId')
    or app.application_id is distinct from (select application_id from crm_private.catalog_applications where subject_ref=sv and admin_scope=s order by recorded_at desc,application_id desc limit 1) then raise exception 'CONFIRMATION_CATALOG_REQUIRED:E3';end if;
    hash:=encode(crm_crypto.digest(convert_to(jsonb_build_object('coverage',c,'application',to_jsonb(app))::text,'UTF8'),'sha256'),'hex');
    if not crm_private.payment_evidence((d->>'eligibilityProofId')::uuid,sv,s,'confirmation:eligibility:'||hash,at_time,true) then missing:=missing||'"objective-eligibility"'::jsonb;end if;
    hash:=encode(crm_crypto.digest(convert_to(c::text,'UTF8'),'sha256'),'hex');
    if not crm_private.payment_evidence((d->>'scopeProofId')::uuid,sv,s,'confirmation:scope:'||hash,at_time,true) then missing:=missing||'"scope-capacity-price-conditions"'::jsonb;end if;
    if not crm_private.payment_evidence((d->>'agreementProofId')::uuid,sv,s,'confirmation:time:'||hash,at_time,true) then missing:=missing||'"time-agreement"'::jsonb;end if;
    reqs:=crm_private.confirmation_requirements(bid,c,s);
    if exists(select 1 from jsonb_array_elements(reqs) x where x->>'status' not in ('Revisado','No aplica')) then missing:=missing||'"requirement"'::jsonb;end if;
    deps:=crm_private.confirmation_dependencies(d->'dependencies',bid,c,s,at_time);
    if exists(select 1 from jsonb_array_elements(deps) x where x->'current'->'usable' is distinct from 'true'::jsonb) then missing:=missing||'"dependency-review"'::jsonb;end if;
    -- Two distinct contemporaneous contradictory facts remain E8, not receipt-order precedence.
    if crm_private.confirmation_discrepancy(old->'fact',bid,s,iid) then missing:=missing||'"external-discrepancy:E8"'::jsonb;end if;
    state:=old||jsonb_build_object('evaluation',d||jsonb_build_object('requirements',reqs,'dependencySnapshot',deps,'missing',missing,'evaluationRevision',evalrev+1,'actorId',actor,'at',at_time,'evidenceId',a->'evidenceId','factId',old->'fact'->'factId'));
    insert into crm_private.b04_confirmation_evaluations values(bid,sv,evalrev+1,iid,s,op,state->'evaluation');follow:=missing<>'[]'::jsonb;
   end if;
   rev:=rev+1;state:=state||jsonb_build_object('revision',rev);
  end if;
  if old is distinct from state then insert into crm_private.b04_confirmation_revisions values(iid,rev,s,op,action,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());end if;
  r:=jsonb_build_object('id',iid,'replayed',known,'result',state);
  if follow then
   fs:=crm_f1.fields(tq);task:=fs[2]::jsonb;
   if fs[1]<>'CRM-H1-TASK-1' or task->>'taskId'<>iid::text or task->>'operationId'<>op::text or task->'identity' is distinct from jsonb_build_object('causeKind','block','causeId',iid,'contextKind','booking','contextId',bid,'scopeRef',iid,'effect','confirmation-review')
   or task->'material' is distinct from '{"title":"Revisar confirmación y cobertura del alcance","deadline":{"kind":"unknown","reason":"No consta fecha fijada para el seguimiento"},"priority":{"kind":"pending","reason":"Prioridad no configurada"},"sourceRef":"SM-PC","sourceVersion":"1","triggerRef":"BR-TASK-005","triggerVersion":"1"}'::jsonb then raise exception 'CONFIRMATION_TASK_REQUIRED';end if;
   select result_ref into task_id from crm_api.b07_task_apply(tf2p,tf2s,tf1p,tf1s,tq);
  end if;
  insert into crm_private.b04_confirmation_operations values(op,iid,s,actor,fp,r,rev,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.confirmation_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;s text;bid uuid;iid uuid;r jsonb;current jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'CONFIRMATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-CONFIRMATION-READ1' then raise exception 'CONFIRMATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;s:=hf[17];bid:=(a->>'bookingId')::uuid;iid:=(a->>'confirmationId')::uuid;
 if a-array['confirmationId','bookingId','purpose']<>'{}'::jsonb or not(a ?& array['confirmationId','bookingId']) or a?'purpose' and a->>'purpose' is distinct from 'service-coverage' then raise exception 'CONFIRMATION_INPUT_INVALID';end if;
 select v.after_data into r from crm_private.b04_confirmations i cross join lateral(select after_data from crm_private.b04_confirmation_revisions where confirmation_id=i.confirmation_id and admin_scope=s order by revision desc limit 1) v where i.confirmation_id=iid and i.booking_id=bid and i.admin_scope=s;
 if r is not null then
  if a?'purpose' then
   current:=crm_private.confirmation_current(r,bid,s);
   r:=jsonb_build_object('id',iid,'revision',r->'revision','serviceState',case when (current->>'usable')::boolean then 'Confirmado' else 'Pendiente' end,'usable',current->'usable','missing',current->'missing','factId',r->'fact'->'factId','bookingConfirmed',false,'prepared',false,'executed',false,'holdReleased',false,'refundExecuted',false);
  else r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action_kind,'before',before_data,'after',after_data,'actorId',actor_id,'reason',reason,'sourceRef',source_ref,'evidenceId',evidence_id,'at',occurred_at,'recordedAt',recorded_at) order by revision) from crm_private.b04_confirmation_revisions where confirmation_id=iid and admin_scope=s));end if;
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
do $$declare x record;begin for x in select p.oid,p.proname,n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('crm_api','crm_private') and p.proname like 'confirmation_%' loop
 execute format('alter function %s owner to %I',x.oid::regprocedure,case when x.nspname='crm_api' then 'crm_h0_f2_executor' else 'crm_h0_f2_owner' end);execute format('revoke execute on function %s from public',x.oid::regprocedure);execute format('grant execute on function %s to %I',x.oid::regprocedure,case when x.nspname='crm_api' then 'crm_h0_runtime' else 'crm_h0_f2_executor' end);
end loop;end$$;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
