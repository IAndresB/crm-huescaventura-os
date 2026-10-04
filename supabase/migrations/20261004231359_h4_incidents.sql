-- H4-003/004: Incident, explicit reviews and localized impact. No closure/refund engine.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'INCIDENT_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b07_incidents(
 incident_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),admin_scope text not null,
 initial_operation_id uuid not null,code_id uuid not null references crm_private.identity_codes(code_id) deferrable initially deferred
);
create table crm_private.b07_incident_operations(
 operation_id uuid primary key,incident_id uuid not null references crm_private.b07_incidents(incident_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,result jsonb not null,result_revision bigint not null,
 recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b07_incident_revisions(
 incident_id uuid not null references crm_private.b07_incidents(incident_id),revision bigint not null check(revision>0),admin_scope text not null,
 operation_id uuid not null unique references crm_private.b07_incident_operations(operation_id) deferrable initially deferred,
 action_kind text not null check(action_kind in ('detect','manage','resolve','close','reopen','severity','justify')),
 event jsonb not null,before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 evidence_id uuid not null references crm_private.b07_records(record_id),source_ref text not null,reason text not null,
 occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(incident_id,revision)
);
alter table crm_private.b07_incidents add foreign key(initial_operation_id) references crm_private.b07_incident_operations(operation_id) deferrable initially deferred;
alter table crm_private.b07_incident_operations add foreign key(incident_id,result_revision) references crm_private.b07_incident_revisions(incident_id,revision) deferrable initially deferred;
create index incident_booking on crm_private.b07_incidents(admin_scope,booking_id);
do $$declare t text;r text;begin foreach t in array array['b07_incidents','b07_incident_operations','b07_incident_revisions'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy incident_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy incident_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger incident_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
-- Actor references confer no access. V1 responsible is an actual enabled Administrator.
create function crm_private.incident_actor(x jsonb,s text) returns boolean language sql stable set search_path=pg_catalog,pg_temp as $$
 select coalesce(crm_private.invoice_text(x),false) and exists(select 1 from crm_private.crm_actors where actor_id=(x#>>'{}')::uuid and admin_scope=s and enabled)
$$;
create function crm_private.incident_impact(x jsonb,bid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$begin
 if jsonb_typeof(x) is distinct from 'object' or x-array['scope','effect','material','coverageReviewed','basis']<>'{}'::jsonb or not(x ?& array['scope','effect','material','coverageReviewed','basis'])
 or not coalesce(crm_private.requirement_scope(x->'scope',bid,s),false) or not coalesce(crm_private.invoice_text(x->'effect'),false)
 or x->>'effect' not in ('preparation','operation','complete-close','economic-review') or jsonb_typeof(x->'material') is distinct from 'boolean'
 or x->'coverageReviewed' is distinct from 'true'::jsonb or not coalesce(crm_private.invoice_text(x->'basis'),false) then return false;end if;return true;end$$;
create function crm_private.incident_links(x jsonb,bid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$declare e jsonb;begin
 if jsonb_typeof(x) is distinct from 'array' then return false;end if;
 for e in select value from jsonb_array_elements(x) loop
  if jsonb_typeof(e) is distinct from 'object' or e-array['kind','id']<>'{}'::jsonb or not(e ?& array['kind','id']) or not coalesce(crm_private.invoice_text(e->'id'),false) then return false;end if;
  if e->>'kind'='requirement' then if not exists(select 1 from crm_private.b07_requirements where requirement_id=(e->>'id')::uuid and booking_id=bid and admin_scope=s) then return false;end if;
  elsif e->>'kind'='invoice' then if not exists(select 1 from crm_private.b05_provider_invoices where invoice_id=(e->>'id')::uuid and booking_id=bid and admin_scope=s) then return false;end if;
  elsif e->>'kind'='provider-payment' then if not exists(select 1 from crm_private.b05_provider_payments where payment_id=(e->>'id')::uuid and booking_id=bid and admin_scope=s) then return false;end if;
  else return false;end if;
 end loop;return true;end$$;
create function crm_api.incident_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,cf2p bytea,cf2s bytea,cf1p bytea,cf1s bytea,cq bytea) returns jsonb
 language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];cs text[];a jsonb;op uuid;iid uuid;bid uuid;actor uuid;s text;action text;fp text;proofhash text;rev bigint;at_time timestamptz;
 prev crm_private.b07_incident_operations;root crm_private.b07_incidents;old jsonb;state jsonb;r jsonb;data jsonb;st text;code text;assigned timestamptz;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'INCIDENT_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-INCIDENT1' then raise exception 'INCIDENT_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a ?& array['action','operationId','incidentId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','data'])
 or a-array['action','operationId','incidentId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','data','origin']<>'{}'::jsonb
 or exists(select 1 from unnest(array['action','operationId','incidentId','bookingId','sourceRef','reason','at','evidenceId']) k where not coalesce(crm_private.invoice_text(a->k),false))
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision' !~ '^(0|[1-9][0-9]*)$'
 or (a?'origin' and jsonb_typeof(a->'origin') is distinct from 'string') or coalesce(a->>'origin','manual')<>'manual'
 or a->>'action' not in ('detect','manage','resolve','close','reopen','severity','justify') or jsonb_typeof(a->'data') is distinct from 'object'
 or a->>'at' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'INCIDENT_INPUT_INVALID';end if;
 action:=a->>'action';data:=a->'data';op:=(a->>'operationId')::uuid;iid:=(a->>'incidentId')::uuid;bid:=(a->>'bookingId')::uuid;actor:=hf[12]::uuid;s:=hf[17];at_time:=(a->>'at')::timestamptz;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s) then raise exception 'INCIDENT_DENIED';end if;
 perform pg_advisory_xact_lock(hashtextextended('incident-booking:'||bid,0));
 select * into root from crm_private.b07_incidents where incident_id=iid and booking_id=bid and admin_scope=s;
 if action<>'detect' and root.incident_id is null then raise exception 'INCIDENT_DENIED';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('incident-op:'||op,0));
 select * into prev from crm_private.b07_incident_operations where operation_id=op;
 if found then
  if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'INCIDENT_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  proofhash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.payment_evidence((a->>'evidenceId')::uuid,iid,s,'incident:'||action||':'||proofhash,at_time,true)
  or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'INCIDENT_EVIDENCE_REQUIRED:E3';end if;
  if root.incident_id is not null then select revision,after_data into rev,old from crm_private.b07_incident_revisions where incident_id=iid order by revision desc limit 1;end if;
  if action='detect' then
   if (a->>'expectedRevision')::bigint<>0 or data-array['detectorId','happenedAt','description','facts','hypothesis','severity','impact','knownEvidence','effectLinks','context']<>'{}'::jsonb
   or not(data ?& array['detectorId','happenedAt','description','facts','hypothesis','severity','impact','knownEvidence','effectLinks','context'])
   or exists(select 1 from unnest(array['happenedAt','description','facts','severity']) k where not coalesce(crm_private.invoice_text(data->k),false))
   or not coalesce(crm_private.incident_actor(data->'detectorId',s),false) or coalesce(data->>'severity' not in ('Leve','Importante','Crítica'),true)
   or (data->'hypothesis'<>'null'::jsonb and not coalesce(crm_private.invoice_text(data->'hypothesis'),false))
   or data->>'happenedAt' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$'
   or not coalesce(crm_private.incident_impact(data->'impact',bid,s),false) or jsonb_typeof(data->'knownEvidence') is distinct from 'array' or not coalesce(crm_private.incident_links(data->'effectLinks',bid,s),false) or jsonb_typeof(data->'context') is distinct from 'object' or (data->'context')-array['providerId','clientId']<>'{}'::jsonb
   then raise exception 'INCIDENT_DETECTION_REQUIRED:E3';end if;
   perform (data->>'happenedAt')::timestamptz;
   if data->'context'?'providerId' and not exists(select 1 from crm_private.catalog_items where item_id=(data->'context'->>'providerId')::uuid and item_kind='provider' and admin_scope=s) then raise exception 'INCIDENT_DENIED';end if;
   if data->'context'?'clientId' and not exists(select 1 from crm_private.identity_entities where identity_id=(data->'context'->>'clientId')::uuid and admin_scope=s and identity_verified) then raise exception 'INCIDENT_DENIED';end if;
   if exists(select 1 from jsonb_array_elements_text(data->'knownEvidence') e where not exists(select 1 from crm_private.b07_records b join crm_private.b07_links l on l.record_id=b.record_id where b.record_id=e::uuid and b.admin_scope=s and l.admin_scope=s and l.context_kind='booking' and l.context_id=bid)) then raise exception 'INCIDENT_DENIED';end if;
   if root.incident_id is not null then
    if not exists(select 1 from crm_private.b07_incident_revisions where incident_id=iid and revision=1 and event->'data'=data) then raise exception 'INCIDENT_REPLAY_CONFLICT:E2';end if;
    state:=old;
   else
    if exists(select 1 from crm_private.b07_incidents where incident_id=iid) then raise exception 'INCIDENT_DENIED';end if;
    cs:=crm_f1.fields(cq);if cardinality(cs)<>10 or cs[1]<>'CRM-H1-RESOLVE1' or cs[2]<>'assign_code' or cs[3]<>iid::text or cs[4]<>iid::text or cs[5]<>'' or cs[6]<>'INC' or cs[7]<>a->>'sourceRef' or cs[8]<>a->>'evidenceId' or cs[9]<>a->>'reason' or cs[10]<>'0' then raise exception 'INCIDENT_DENIED';end if;
    perform crm_api.identity_resolve(cf2p,cf2s,cf1p,cf1s,cq);
    select human_code,assigned_at into code,assigned from crm_private.identity_codes where code_id=iid and target_id=iid and code_kind='INC' and admin_scope=s;
    if code is null then raise exception 'INCIDENT_DENIED';end if;
    state:=data||jsonb_build_object('id',iid,'bookingId',bid,'code',code,'assignedAt',assigned,'revision',1,'status','Abierta','responsibleId',null,'solution',null,'closure',null,'justification',null);
    rev:=1;insert into crm_private.b07_incidents values(iid,bid,s,op,iid);
   end if;
  else
   if rev<>(a->>'expectedRevision')::bigint then raise exception 'INCIDENT_REVISION_CONFLICT:E2';end if;
   st:=old->>'status';state:=old;
   if action='manage' then
    if st<>'Abierta' or data-array['responsibleId','action']<>'{}'::jsonb or not(data ?& array['responsibleId','action']) or not coalesce(crm_private.incident_actor(data->'responsibleId',s),false) or not coalesce(crm_private.invoice_text(data->'action'),false) then raise exception 'INCIDENT_MANAGEMENT_REQUIRED:E3';end if;
    state:=state||jsonb_build_object('status','En gestión','responsibleId',data->'responsibleId');
   elsif action='resolve' then
    if st not in ('Abierta','En gestión') or data-array['result','resultVerified','actions','scopeResolved','cause','causeVerified','uncertainty','uncertaintyCompatible','effectsIdentified']<>'{}'::jsonb
    or not(data ?& array['result','resultVerified','actions','scopeResolved','cause','causeVerified','uncertainty','uncertaintyCompatible','effectsIdentified'])
    or not coalesce(crm_private.invoice_text(data->'result'),false) or not coalesce(crm_private.invoice_text(data->'actions'),false)
    or data->'resultVerified' is distinct from 'true'::jsonb or data->'scopeResolved' is distinct from 'true'::jsonb or data->'effectsIdentified' is distinct from 'true'::jsonb
    or not ((coalesce(crm_private.invoice_text(data->'cause'),false) and data->'causeVerified'='true'::jsonb and data->'uncertainty'='null'::jsonb and data->'uncertaintyCompatible'='false'::jsonb)
     or (data->'cause'='null'::jsonb and data->'causeVerified'='false'::jsonb and coalesce(crm_private.invoice_text(data->'uncertainty'),false) and data->'uncertaintyCompatible'='true'::jsonb)) then raise exception 'INCIDENT_SOLUTION_REQUIRED:E3';end if;
    state:=state||jsonb_build_object('status','Resuelta','solution',data,'justification',null);
   elsif action='close' then
    if st<>'Resuelta' or data-array['solutionVerified','recordSufficient','effectsIdentified']<>'{}'::jsonb or not(data ?& array['solutionVerified','recordSufficient','effectsIdentified'])
    or data->'solutionVerified' is distinct from 'true'::jsonb or data->'recordSufficient' is distinct from 'true'::jsonb or data->'effectsIdentified' is distinct from 'true'::jsonb then raise exception 'INCIDENT_CLOSURE_REQUIRED:E3';end if;
    state:=state||jsonb_build_object('status','Cerrada','closure',data);
   elsif action='reopen' then
    if st not in ('Resuelta','Cerrada') or data-array['sameProblem','basis','action','responsibleId']<>'{}'::jsonb or not(data ?& array['sameProblem','basis','action','responsibleId']) or data->'sameProblem' is distinct from 'true'::jsonb or coalesce(data->>'basis' not in ('recurrence','incorrect-solution'),true)
    or (data->'action'<>'null'::jsonb and (not coalesce(crm_private.invoice_text(data->'action'),false) or not coalesce(crm_private.incident_actor(data->'responsibleId',s),false)))
    or (data->'action'='null'::jsonb and data->'responsibleId'<>'null'::jsonb) then raise exception 'INCIDENT_REOPEN_REQUIRED:E3';end if;
    state:=state||jsonb_build_object('status',case when data->'action'='null'::jsonb then 'Abierta' else 'En gestión' end,'responsibleId',data->'responsibleId','justification',null);
   elsif action='severity' then
    if data-array['severity','basis','evasion']<>'{}'::jsonb or not(data ?& array['severity','basis','evasion']) or coalesce(data->>'severity' not in ('Leve','Importante','Crítica'),true) or not coalesce(crm_private.invoice_text(data->'basis'),false) or data->'evasion' is distinct from 'false'::jsonb then raise exception 'INCIDENT_SEVERITY_REQUIRED:E3';end if;
    state:=state||jsonb_build_object('severity',data->'severity','justification',null);
   else
    if st not in ('Abierta','En gestión') or old->>'severity'<>'Crítica' or data-array['scope','responsibleId','purpose','basis']<>'{}'::jsonb or not(data ?& array['scope','responsibleId','purpose','basis'])
    or data->'scope' is distinct from old->'impact'->'scope' or data->>'purpose' is distinct from 'complete-close' or not coalesce(crm_private.incident_actor(data->'responsibleId',s),false) or not coalesce(crm_private.invoice_text(data->'basis'),false) then raise exception 'INCIDENT_JUSTIFICATION_REQUIRED:E3';end if;
    state:=state||jsonb_build_object('justification',data||jsonb_build_object('actorId',actor,'at',at_time,'evidenceId',a->'evidenceId','reason',a->'reason'));
   end if;
   rev:=rev+1;state:=state||jsonb_build_object('revision',rev);
  end if;
  r:=jsonb_build_object('id',iid,'replayed',false,'result',state);
  if old is distinct from state then insert into crm_private.b07_incident_revisions values(iid,rev,s,op,action,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());end if;
  insert into crm_private.b07_incident_operations values(op,iid,s,actor,fp,r,rev,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.incident_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;s text;bid uuid;iid uuid;r jsonb;items jsonb;pending jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'INCIDENT_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-INCIDENT-READ1' then raise exception 'INCIDENT_INPUT_INVALID';end if;a:=fs[2]::jsonb;s:=hf[17];bid:=(a->>'bookingId')::uuid;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s) then r:=null;
 elsif a?'incidentId' or a?'code' then
  if a-array['incidentId','bookingId','code']<>'{}'::jsonb or (a?'incidentId' and a?'code') then raise exception 'INCIDENT_INPUT_INVALID';end if;
  select i.incident_id into iid from crm_private.b07_incidents i join crm_private.identity_codes c on c.code_id=i.code_id where i.booking_id=bid and i.admin_scope=s and c.admin_scope=s and ((a?'incidentId' and i.incident_id=(a->>'incidentId')::uuid) or (a?'code' and c.human_code=a->>'code'));
  select after_data into r from crm_private.b07_incident_revisions where incident_id=iid and admin_scope=s order by revision desc limit 1;
  if r is not null then r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action_kind,'before',before_data,'after',after_data,'actorId',actor_id,'reason',reason,'sourceRef',source_ref,'evidenceId',evidence_id,'at',occurred_at,'recordedAt',recorded_at) order by revision) from crm_private.b07_incident_revisions where incident_id=iid and admin_scope=s));end if;
 else
  if a-array['bookingId','scope','purpose']<>'{}'::jsonb or not coalesce(crm_private.requirement_scope(a->'scope',bid,s),false) or coalesce(a->>'purpose' not in ('preparation','operation','complete-close','economic-review'),true) then raise exception 'INCIDENT_INPUT_INVALID';end if;
  select coalesce(jsonb_agg(jsonb_build_object('incidentId',i.incident_id,'revision',v.after_data->'revision','status',v.after_data->'status','severity',v.after_data->'severity','scope',v.after_data->'impact'->'scope','effect',v.after_data->'impact'->'effect','justified',v.after_data->'justification'<>'null'::jsonb)),'[]') into items
   from crm_private.b07_incidents i cross join lateral (select after_data from crm_private.b07_incident_revisions where incident_id=i.incident_id order by revision desc limit 1) v
   where i.booking_id=bid and i.admin_scope=s and v.after_data->>'status' in ('Abierta','En gestión') and
    (a->>'purpose'='complete-close' and v.after_data->>'severity'='Crítica' or
     a->>'purpose'<>'complete-close' and v.after_data->'impact'->'material'='true'::jsonb and v.after_data->'impact'->>'effect'=a->>'purpose'
      and (v.after_data->'impact'->'scope'=a->'scope' or (not(v.after_data->'impact'->'scope'?'serviceId') and v.after_data->'impact'->'scope'->'action'=a->'scope'->'action')));
  select coalesce(jsonb_agg(e),'[]') into pending from jsonb_array_elements(items) e where not(a->>'purpose'='complete-close' and e->'justified'='true'::jsonb);
  r:=jsonb_build_object('incidentGuardAllowed',pending='[]'::jsonb,'active',items,'pending',pending,'completeClosureImplemented',false);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
do $$declare x record;begin for x in select p.oid,p.proname,n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('crm_api','crm_private') and p.proname like 'incident_%' loop
 execute format('alter function %s owner to %I',x.oid::regprocedure,case when x.nspname='crm_api' then 'crm_h0_f2_executor' else 'crm_h0_f2_owner' end);
 execute format('revoke execute on function %s from public',x.oid::regprocedure);
 execute format('grant execute on function %s to %I',x.oid::regprocedure,case when x.nspname='crm_api' then 'crm_h0_runtime' else 'crm_h0_f2_executor' end);
end loop;end$$;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
