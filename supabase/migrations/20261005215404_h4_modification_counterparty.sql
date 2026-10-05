-- H4-012-F16: current requester relationship and effect-specific source coverage.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'MODIFICATION_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create or replace function crm_private.modification_source(src jsonb,bid uuid,sid uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare v record;r crm_private.catalog_revisions;begin
 if jsonb_typeof(src) is distinct from 'object' or not(src?&array['kind','id','offeringRevisionId','counterpart','channel']) or src-array['kind','id','offeringRevisionId','counterpart','channel']<>'{}'::jsonb or not crm_private.invoice_text(src->'counterpart') then return false;end if;
 select * into v from crm_private.b04_current_services where booking_id=bid and service_id=sid and admin_scope=s;if not found then return false;end if;
 if v.nature='internal' then return src->>'kind'='internal' and src->'offeringRevisionId'='null'::jsonb and src->>'channel'='internal-record' and exists(select 1 from crm_private.crm_actors where actor_id=(src->>'id')::uuid and enabled and admin_scope=s);end if;
 select x.* into r from crm_private.catalog_revisions x join crm_private.catalog_items i using(item_id) where x.revision_id=(src->>'offeringRevisionId')::uuid and x.admin_scope=s and i.item_kind='offering';
 return src->>'kind'='provider' and src->>'channel' in('phone','whatsapp','email','provider-platform') and r.revision_id is not null and r.parent_revision_id=(src->>'id')::uuid and (r.related_revision_id=v.service_revision_id or r.related_revision_id=(v.applied->>'variant')::uuid) and (v.applied->'provider'='null'::jsonb or v.applied->'provider'=src->'id');
end$$;
create function crm_private.modification_source_material(src jsonb,bid uuid,sid uuid,s text,material jsonb) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare v record;r crm_private.catalog_revisions;begin
 if jsonb_typeof(src) is distinct from 'object' or not(src?&array['kind','id','offeringRevisionId','counterpart','channel']) or src-array['kind','id','offeringRevisionId','counterpart','channel']<>'{}'::jsonb or not crm_private.invoice_text(src->'counterpart') then return false;end if;
 select * into v from crm_private.b04_current_services where booking_id=bid and service_id=sid and admin_scope=s;if not found then return false;end if;
 if material->>'id' is distinct from sid::text or material->>'serviceRevisionId' is distinct from v.service_revision_id::text or material->>'nature' is distinct from v.nature then return false;end if;
 if v.nature='internal' then return src->>'kind'='internal' and src->'offeringRevisionId'='null'::jsonb and src->>'channel'='internal-record' and exists(select 1 from crm_private.crm_actors where actor_id=(src->>'id')::uuid and enabled and admin_scope=s);end if;
 select x.* into r from crm_private.catalog_revisions x join crm_private.catalog_items i using(item_id) where x.revision_id=(src->>'offeringRevisionId')::uuid and x.admin_scope=s and i.item_kind='offering';
 return src->>'kind'='provider' and src->>'channel' in('phone','whatsapp','email','provider-platform') and r.revision_id is not null and r.parent_revision_id=(src->>'id')::uuid and (r.related_revision_id=v.service_revision_id or r.related_revision_id=(material->>'variant')::uuid) and (material->'provider'='null'::jsonb or material->'provider'=src->'id');
end$$;
create function crm_private.modification_counterparty(p jsonb,mid uuid,bid uuid,s text) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare sid uuid:=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid;t timestamptz;v jsonb;begin
 if p->'scope'->>'kind'='booking' then return '{}'::jsonb;end if;
 if p?'counterpartyBefore' then return p->'counterpartyBefore';end if;
 if p->'scope'->>'kind'='service' then v:=p->'before';else
  -- Recover a pre-fix child relationship at its actual request/change revision, without rewriting that history.
  select r.recorded_at into t from crm_private.b06_modification_revisions r cross join lateral jsonb_array_elements(r.after_data->'parts') x where r.modification_id=mid and r.admin_scope=s and r.action_kind in('request','change') and x->'id'=p->'id' and x->'before'=p->'before' order by r.revision desc limit 1;
  if t is null then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;
  select ov.material into v from crm_private.b04_operational_versions ov join crm_private.b06_modification_operations o using(operation_id) where ov.booking_id=bid and ov.scope_kind='service' and ov.scope_id=sid and ov.admin_scope=s and o.recorded_at<=t order by ov.revision desc limit 1;
  if not found then select jsonb_build_object('id',service_id,'serviceRevisionId',service_revision_id,'nature',nature,'provider',applied->'provider','variant',applied->'variant') into v from crm_private.b04_services where booking_id=bid and service_id=sid and admin_scope=s;end if;
 end if;
 return (select jsonb_object_agg(key,value) from jsonb_each(v) where key in('id','serviceRevisionId','nature','provider','variant'));
end$$;
create or replace function crm_api.modification_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,tf2p bytea,tf2s bytea,tf1p bytea,tf1s bytea,tq bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;d jsonb;op uuid;mid uuid;bid uuid;actor uuid;s text;act text;at_time timestamptz;fp text;hash text;opp uuid;rev bigint:=0;root crm_private.b06_modifications;prev crm_private.b06_modification_operations;old jsonb;state jsonb;r jsonb;p jsonb;parts jsonb;cur jsonb;x jsonb;k text;pid uuid;partHash text;follow boolean:=false;task jsonb;task_id uuid;all_done boolean;ids jsonb;approval jsonb;proofs jsonb;sid uuid;req jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'MODIFICATION_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-MODIFICATION1' then raise exception 'MODIFICATION_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a?&array['action','operationId','modificationId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','data']) or a-array['action','operationId','modificationId','bookingId','expectedRevision','sourceRef','reason','at','evidenceId','data','origin']<>'{}'::jsonb
 or not crm_private.invoice_text(a->'sourceRef') or not crm_private.invoice_text(a->'reason') or not crm_private.availability_time(a->'at') or jsonb_typeof(a->'data')<>'object' or coalesce(a->>'expectedRevision','')!~'^[0-9]+$' or coalesce(a->>'origin','manual')<>'manual' then raise exception 'MODIFICATION_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;mid:=(a->>'modificationId')::uuid;bid:=(a->>'bookingId')::uuid;actor:=hf[12]::uuid;s:=hf[17];act:=a->>'action';d:=a->'data';at_time:=(a->>'at')::timestamptz;
 select opportunity_id into opp from crm_private.b04_bookings where booking_id=bid and admin_scope=s;if not found then raise exception 'MODIFICATION_DENIED';end if;
 perform pg_advisory_xact_lock(hashtextextended(opp::text,31));perform pg_advisory_xact_lock(hashtextextended('requirement-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended('availability-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended('confirmation-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended('modification-booking:'||bid,0));perform pg_advisory_xact_lock(hashtextextended('modification-op:'||op,0));
 select * into root from crm_private.b06_modifications where modification_id=mid;
 if (root.modification_id is not null and (root.booking_id<>bid or root.admin_scope<>s)) or (act<>'request' and root.modification_id is null) then raise exception 'MODIFICATION_DENIED';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');select * into prev from crm_private.b06_modification_operations where operation_id=op;
 if found then if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'MODIFICATION_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  hash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');if not crm_private.modification_proof((a->>'evidenceId')::uuid,mid,s,'modification:'||act||':'||hash,at_time) or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'MODIFICATION_EVIDENCE_REQUIRED:E3';end if;
  if root.modification_id is not null then select revision,after_data into rev,old from crm_private.b06_modification_revisions where modification_id=mid order by revision desc limit 1;end if;
  select o.* into prev from crm_private.b06_modification_operations o join crm_private.b06_modification_revisions v on v.modification_id=o.modification_id and v.revision=o.result_revision where o.modification_id=mid and o.admin_scope=s and o.actor_id=actor and v.event-array['operationId','evidenceId'] = a-array['operationId','evidenceId'] order by o.recorded_at limit 1;
  if found then r:=prev.result||jsonb_build_object('replayed',true);insert into crm_private.b06_modification_operations values(op,mid,s,actor,fp,r,prev.result_revision,clock_timestamp());perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;end if;
  if rev<>(a->>'expectedRevision')::bigint then raise exception 'MODIFICATION_REVISION_CONFLICT:E2';end if;state:=old;
  if act in('request','change') then
   if d-array['requester','cause','type','parts','recordId','correctsModificationId']<>'{}'::jsonb or not(d?&array['requester','cause','type','parts','recordId']) or not crm_private.invoice_text(d->'cause') or d->>'type' not in('change','cancellation') or jsonb_typeof(d->'parts')<>'array' or jsonb_array_length(d->'parts')=0 or not crm_private.confirmation_record((d->>'recordId')::uuid,bid,s) then raise exception 'MODIFICATION_REQUEST_REQUIRED:E3';end if;
   x:=d->'requester';if x-array['kind','id','designationId']<>'{}'::jsonb or not(x?&array['kind','id']) then raise exception 'MODIFICATION_REQUESTER_REQUIRED:E3';end if;
   if x->>'kind'='internal' then if not exists(select 1 from crm_private.crm_actors where actor_id=(x->>'id')::uuid and enabled and admin_scope=s) then raise exception 'MODIFICATION_DENIED';end if;
   elsif x->>'kind'='provider' then if not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(x->>'id')::uuid and r.admin_scope=s and i.item_kind='provider') then raise exception 'MODIFICATION_REQUESTER_REQUIRED:E3';end if;
   elsif x->>'kind'='client' then if not exists(select 1 from crm_private.identity_designations z where z.designation_id=(x->>'designationId')::uuid and z.party_id=(x->>'id')::uuid and z.admin_scope=s and z.ended_at is null and z.verified and z.role_kind in('primary_contact','client') and z.context_id in(bid,opp)) then raise exception 'MODIFICATION_REQUESTER_REQUIRED:E3';end if;
   else raise exception 'MODIFICATION_REQUESTER_REQUIRED:E3';end if;
   if act='request' and root.modification_id is not null then raise exception 'MODIFICATION_TRANSITION_INVALID';end if;
   if act='change' and (old->>'progress'<>'Aprobada' or not exists(select 1 from jsonb_array_elements(old->'parts') z where z->'applied'='null'::jsonb)) then raise exception 'MODIFICATION_TRANSITION_INVALID';end if;
   parts:='[]';for p in select value from jsonb_array_elements(d->'parts') loop
    if p-array['id','scope','expectedScopeRevision','desired','aspects','dependencies']<>'{}'::jsonb or not(p?&array['id','scope','expectedScopeRevision','desired','aspects','dependencies']) or jsonb_typeof(p->'aspects')<>'array' or jsonb_array_length(p->'aspects')=0 or jsonb_typeof(p->'dependencies')<>'array' then raise exception 'MODIFICATION_PART_REQUIRED:E3';end if;pid:=(p->>'id')::uuid;
    if exists(select 1 from jsonb_array_elements(parts) z where z->'id'=p->'id' or z->'scope'=p->'scope') then raise exception 'MODIFICATION_PART_CONFLICT:E2';end if;
    if exists(select 1 from jsonb_array_elements(p->'aspects') z where not crm_private.invoice_text(z)) or not crm_private.modification_dependencies(p->'dependencies',p,bid,opp,s) then raise exception 'MODIFICATION_DEPENDENCY_REQUIRED:E3';end if;
    cur:=crm_private.modification_scope(p->'scope',bid,s);if cur->'revision' is distinct from p->'expectedScopeRevision' then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;
    if cur->'cancelled'='true'::jsonb and p->'desired'->'cancelled'='false'::jsonb and not exists(select 1 from crm_private.b06_modifications z where z.modification_id=(d->>'correctsModificationId')::uuid and z.booking_id=bid and z.admin_scope=s) then raise exception 'MODIFICATION_CORRECTION_REQUIRED:E3';end if;
    if not crm_private.modification_patch(p->'desired',cur,p->'scope'->>'kind',s) then raise exception 'MODIFICATION_PART_REQUIRED:E3';end if;
    if d->'requester'->>'kind'='provider' and not exists(select 1 from crm_private.b04_current_services sv join crm_private.catalog_revisions ofr on ofr.related_revision_id=sv.service_revision_id or ofr.related_revision_id=(sv.applied->>'variant')::uuid join crm_private.catalog_items oi on oi.item_id=ofr.item_id and oi.item_kind='offering' where sv.service_id=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid and sv.booking_id=bid and sv.admin_scope=s and ofr.admin_scope=s and ofr.parent_revision_id=(d->'requester'->>'id')::uuid and (sv.applied->'provider'='null'::jsonb or sv.applied->>'provider'=d->'requester'->>'id')) then raise exception 'MODIFICATION_REQUESTER_REQUIRED:E3';end if;
    if act='change' and exists(select 1 from jsonb_array_elements(old->'parts') z where z->'id'=p->'id' and z->'applied'<>'null'::jsonb) then raise exception 'MODIFICATION_APPLIED_PART_IMMUTABLE';end if;
    parts:=parts||jsonb_build_array(p||jsonb_build_object('before',cur,'applied',null,'review',null,'counterpartyBefore',case when p->'scope'->>'kind'='booking' then null else (select jsonb_object_agg(key,value) from jsonb_each(crm_private.modification_scope(jsonb_build_object('kind','service','id',coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')),bid,s)) where key in('id','serviceRevisionId','nature','provider','variant')) end));
   end loop;
   if act='change' then parts:=coalesce((select jsonb_agg(value) from jsonb_array_elements(old->'parts') where value->'applied'<>'null'::jsonb),'[]')||parts;end if;
   if act='request' then insert into crm_private.b06_modifications values(mid,bid,s,op);end if;
   state:=coalesce(old,'{}'::jsonb)||jsonb_build_object('id',mid,'bookingId',bid,'progress',case when act='request' then 'Solicitada' else 'En evaluación' end,'request',d,'parts',parts,'approval',null,'evaluation',null,'review',null,'incident',null,'economic',jsonb_build_object('status','pending','reason','D019 determination and later economic application required'));
  elsif act='evaluate' then
   if old->>'progress' not in('Solicitada','En evaluación') or d-array['policy','impacts','knownPerformance','temporal','agendaJustification']<>'{}'::jsonb or not(d?&array['policy','impacts']) or not(d->'policy'?&array['id','version','terms']) or not crm_private.invoice_text(d->'policy'->'id') or not crm_private.invoice_text(d->'policy'->'version') or d->'policy'->'terms' is distinct from (select terms from crm_private.b04_bookings where booking_id=bid) or not(d->'impacts'?&array['commercial','operational','economic']) or d->'impacts'->>'economic' is distinct from 'pending' then raise exception 'MODIFICATION_EVALUATION_REQUIRED:E3';end if;
   if not crm_private.invoice_text(d->'impacts'->'commercial') or not crm_private.invoice_text(d->'impacts'->'operational') then raise exception 'MODIFICATION_EVALUATION_REQUIRED:E3';end if;
   for x in select value from jsonb_array_elements(coalesce(d->'knownPerformance','[]')) loop
    cur:=crm_private.modification_scope(x->'scope',bid,s);
    if x-array['scope','proofId','recordId','occurredAt','description']<>'{}'::jsonb or not(x?&array['scope','proofId','recordId','occurredAt','description']) or not crm_private.invoice_text(x->'description') or not crm_private.availability_time(x->'occurredAt') or (x->>'occurredAt')::timestamptz>at_time or not crm_private.confirmation_record((x->>'recordId')::uuid,bid,s) or not crm_private.modification_proof((x->>'proofId')::uuid,bid,s,'modification:performance:'||encode(crm_crypto.digest(convert_to((x-'proofId')::text,'UTF8'),'sha256'),'hex'),at_time) then raise exception 'MODIFICATION_PERFORMANCE_EVIDENCE_REQUIRED:E3';end if;
   end loop;
   for x in select value from jsonb_array_elements(coalesce(d->'temporal','[]')) loop
    if not(x?&array['scope','zone','sourceRef','version','basis','referenceDate']) or not exists(select 1 from pg_timezone_names where name=x->>'zone') or not crm_private.invoice_text(x->'sourceRef') or not crm_private.invoice_text(x->'version') or x->>'basis' not in('default','express_contract') then raise exception 'MODIFICATION_TEMPORAL_REQUIRED:E3';end if;
    cur:=to_jsonb(crm_private.modification_reference(x->'scope',bid,s));
    if x->>'basis'='default' and x->>'referenceDate' is distinct from (cur#>>'{}') then raise exception 'MODIFICATION_TEMPORAL_REQUIRED:E3';end if;
    if x->>'basis'='express_contract' and not crm_private.modification_proof((x->>'proofId')::uuid,bid,s,'modification:contract-reference:'||encode(crm_crypto.digest(convert_to((x-'proofId')::text,'UTF8'),'sha256'),'hex'),at_time) then raise exception 'MODIFICATION_TEMPORAL_REQUIRED:E3';end if;
   end loop;
   parts:='[]';for p in select value from jsonb_array_elements(old->'parts') loop
    if p->'applied'='null'::jsonb then cur:=crm_private.modification_scope(p->'scope',bid,s);if cur is distinct from p->'before' then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if; if p->'scope'->>'kind'<>'booking' and not(crm_private.modification_scope(jsonb_build_object('kind','service','id',coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')),bid,s) @> crm_private.modification_counterparty(p,mid,bid,s)) then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;p:=p||jsonb_build_object('review',jsonb_build_object('pending',true,'aspects',p->'aspects','sourceRef',a->>'sourceRef','cause',a->>'reason','before',cur,'after',p->'desired','evidenceId',a->>'evidenceId','actorId',actor,'at',at_time));follow:=true;end if;parts:=parts||jsonb_build_array(p);
   end loop;
   x:=crm_private.modification_agenda(parts,bid,s);if d?'agendaJustification' then if not crm_private.invoice_text(d->'agendaJustification'->'reason') or not crm_private.modification_proof((d->'agendaJustification'->>'proofId')::uuid,bid,s,'modification:agenda:'||encode(crm_crypto.digest(convert_to(jsonb_build_object('warnings',x,'reason',d->'agendaJustification'->'reason')::text,'UTF8'),'sha256'),'hex'),at_time) then raise exception 'MODIFICATION_AGENDA_JUSTIFICATION_REQUIRED:E3';end if;end if;
   state:=state||jsonb_build_object('agendaWarnings',x,'progress','En evaluación','evaluation',d||jsonb_build_object('civilEvaluations',(select coalesce(jsonb_agg(z||jsonb_build_object('actDate',(at_time at time zone(z->>'zone'))::date,'daysBefore',(z->>'referenceDate')::date-(at_time at time zone(z->>'zone'))::date,'algorithmVersion','h1-civil-d020-v1')),'[]') from jsonb_array_elements(coalesce(d->'temporal','[]')) z)),'parts',parts);
  elsif act='provider' then
   if old->>'progress'<>'En evaluación' or d-array['partIds','commitment','recordId']<>'{}'::jsonb or not(d?&array['partIds','commitment','recordId']) or not crm_private.invoice_text(d->'commitment') then raise exception 'MODIFICATION_PROVIDER_REQUIRED:E3';end if;
   if jsonb_typeof(d->'partIds') is distinct from 'array' or jsonb_array_length(d->'partIds')=0 or exists(select 1 from jsonb_array_elements(d->'partIds') z where not exists(select 1 from jsonb_array_elements(old->'parts') p0 where p0->'id'=z)) then raise exception 'MODIFICATION_PROVIDER_REQUIRED:E3';end if;
   if d->'recordId'<>'null'::jsonb and not exists(select 1 from crm_private.b07_records r0 join crm_private.b07_links l on l.record_id=r0.record_id where r0.record_id=(d->>'recordId')::uuid and r0.admin_scope=s and l.context_id=bid and r0.record_kind='communication_fact' and r0.material->>'fact_kind'='sent') then raise exception 'MODIFICATION_SEND_EVIDENCE_REQUIRED:E3';end if;
   state:=state||jsonb_build_object('progress','Pendiente de proveedor','providerRequest',d);follow:=true;
  elsif act='response' then
   if old->>'progress'<>'Pendiente de proveedor' or d-array['partIds','source','recordId','happenedAt','result','coverage','alternatives','sourceBasis']<>'{}'::jsonb or not(d?&array['partIds','source','recordId','happenedAt','result','coverage','alternatives']) or not crm_private.confirmation_record((d->>'recordId')::uuid,bid,s) or not crm_private.availability_time(d->'happenedAt') or (d->>'happenedAt')::timestamptz>at_time or d->>'result' not in('accepted','rejected','offered','ambiguous') then raise exception 'MODIFICATION_RESPONSE_REQUIRED:E3';end if;
   if jsonb_typeof(d->'partIds') is distinct from 'array' or jsonb_array_length(d->'partIds')=0 or not((old->'providerRequest'->'partIds') @> (d->'partIds')) then raise exception 'MODIFICATION_RESPONSE_SCOPE_REQUIRED:E3';end if;
   for x in select value from jsonb_array_elements(d->'partIds') loop
    select value into p from jsonb_array_elements(old->'parts') where value->'id'=x;sid:=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid;
    cur:=crm_private.modification_scope(p->'scope',bid,s);if cur is distinct from p->'before' then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if; if p->'scope'->>'kind'<>'booking' and not(crm_private.modification_scope(jsonb_build_object('kind','service','id',coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')),bid,s) @> crm_private.modification_counterparty(p,mid,bid,s)) then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;
    if d?'sourceBasis' and not coalesce(d->>'sourceBasis' in('before','desired'),false) then raise exception 'MODIFICATION_SOURCE_REQUIRED:E3';end if;
    cur:=crm_private.modification_scope(jsonb_build_object('kind','service','id',sid),bid,s);
    if p->'scope'->>'kind'='service' then cur:=p->'before';end if;
    if coalesce(d->>'sourceBasis',case when d->>'result'='accepted' then 'desired' else 'before' end)='desired' then cur:=cur||coalesce((select jsonb_object_agg(key,value) from jsonb_each(p->'desired') where key in('provider','variant')),'{}'::jsonb);end if;
    if not coalesce(crm_private.modification_source_material(d->'source',bid,sid,s,cur),false) then raise exception 'MODIFICATION_SOURCE_REQUIRED:E3';end if;
    if d->>'result'='accepted' and d->'coverage'->(p->>'id') is distinct from (case when d->>'sourceBasis'='before' then p->'before' else p->'desired' end) then raise exception 'MODIFICATION_RESPONSE_SCOPE_REQUIRED:E3';end if;
   end loop;
   if old?'response' and (d->>'happenedAt')::timestamptz<=(old->'response'->>'happenedAt')::timestamptz then raise exception 'MODIFICATION_RESPONSE_UNCERTAIN:E8';end if;
   state:=state||jsonb_build_object('response',d,'progress',case when d->>'result'='ambiguous' then 'Pendiente de proveedor' else 'En evaluación' end);follow:=true;
  elsif act='approve' then
   if old->>'progress'<>'En evaluación' or jsonb_typeof(old->'evaluation') is distinct from 'object' or d-array['partIds','proofs']<>'{}'::jsonb or not(d?&array['partIds','proofs']) or jsonb_typeof(d->'partIds')<>'array' or jsonb_array_length(d->'partIds')=0 then raise exception 'MODIFICATION_APPROVAL_REQUIRED:E3';end if;
   for x in select value from jsonb_array_elements(d->'partIds') loop
    select value into p from jsonb_array_elements(old->'parts') where value->'id'=x and value->'applied'='null'::jsonb;if p is null then raise exception 'MODIFICATION_APPROVAL_SCOPE_REQUIRED:E3';end if;
    cur:=crm_private.modification_scope(p->'scope',bid,s);if cur is distinct from p->'before' then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if; if p->'scope'->>'kind'<>'booking' and not(crm_private.modification_scope(jsonb_build_object('kind','service','id',coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')),bid,s) @> crm_private.modification_counterparty(p,mid,bid,s)) then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;
    partHash:=encode(crm_crypto.digest(convert_to((p-array['review','applied'])::text,'UTF8'),'sha256'),'hex');proofs:=d->'proofs'->(p->>'id');if proofs-array['client','provider','constraints']<>'{}'::jsonb then raise exception 'MODIFICATION_APPROVAL_GUARD_REQUIRED:E3';end if;
    if p->'scope'->>'kind'<>'booking' then
     if not crm_private.modification_proof((proofs->>'client')::uuid,bid,s,'modification:client:'||partHash,at_time) or not crm_private.modification_proof((proofs->>'constraints')::uuid,bid,s,'modification:constraints:'||partHash,at_time) then raise exception 'MODIFICATION_APPROVAL_GUARD_REQUIRED:E3';end if;
     sid:=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid;
     if (select nature from crm_private.b04_services where service_id=sid)='external' and not crm_private.modification_proof((proofs->>'provider')::uuid,bid,s,'modification:provider:'||partHash,at_time) then raise exception 'MODIFICATION_PROVIDER_GUARD_REQUIRED:E3';end if;
    end if;
   end loop;
   state:=state||jsonb_build_object('progress','Aprobada','approval',jsonb_build_object('partIds',d->'partIds','proofs',d->'proofs','actorId',actor,'at',at_time,'revision',rev+1,'parts',old->'parts','evidenceId',a->>'evidenceId'));
  elsif act='apply' then
   approval:=old->'approval';if old->>'progress'<>'Aprobada' or approval='null'::jsonb or d-array['partIds','approvalRevision']<>'{}'::jsonb or not(d?&array['partIds','approvalRevision']) or d->'approvalRevision' is distinct from approval->'revision' or jsonb_typeof(d->'partIds')<>'array' or jsonb_array_length(d->'partIds')=0 then raise exception 'MODIFICATION_APPLICATION_REQUIRED:E3';end if;
   if jsonb_typeof(d->'partIds') is distinct from 'array' or jsonb_array_length(d->'partIds')=0 or exists(select 1 from jsonb_array_elements(d->'partIds') z where not exists(select 1 from jsonb_array_elements(old->'parts') p0 where p0->'id'=z)) then raise exception 'MODIFICATION_PART_REQUIRED:E3';end if;
   parts:='[]';for p in select value from jsonb_array_elements(old->'parts') loop
    if d->'partIds' @> jsonb_build_array(p->'id') then
     if not(approval->'partIds' @> jsonb_build_array(p->'id')) then raise exception 'MODIFICATION_APPROVAL_SCOPE_REQUIRED:E3';end if;
     if p->'applied'='null'::jsonb then
      cur:=crm_private.modification_scope(p->'scope',bid,s);if cur is distinct from p->'before' then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if; if p->'scope'->>'kind'<>'booking' and not(crm_private.modification_scope(jsonb_build_object('kind','service','id',coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')),bid,s) @> crm_private.modification_counterparty(p,mid,bid,s)) then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;
      if old->'incident'<>'null'::jsonb then raise exception 'MODIFICATION_UNCERTAIN_EFFECT:E8';end if;
      partHash:=encode(crm_crypto.digest(convert_to((p-array['review','applied'])::text,'UTF8'),'sha256'),'hex');proofs:=approval->'proofs'->(p->>'id');
      if p->'scope'->>'kind'<>'booking' and (not crm_private.modification_proof((proofs->>'client')::uuid,bid,s,'modification:client:'||partHash,at_time) or not crm_private.modification_proof((proofs->>'constraints')::uuid,bid,s,'modification:constraints:'||partHash,at_time)) then raise exception 'MODIFICATION_APPROVAL_GUARD_REQUIRED:E3';end if;
      sid:=coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid;if p->'scope'->>'kind'<>'booking' and (select nature from crm_private.b04_services where service_id=sid)='external' and not crm_private.modification_proof((proofs->>'provider')::uuid,bid,s,'modification:provider:'||partHash,at_time) then raise exception 'MODIFICATION_PROVIDER_GUARD_REQUIRED:E3';end if;
      if p->'desired'->'cancelled'='true'::jsonb and exists(select 1 from jsonb_array_elements(coalesce(old->'evaluation'->'knownPerformance','[]')) kp where kp->'scope'=p->'scope') then raise exception 'MODIFICATION_PRIOR_PERFORMANCE_REQUIRED:E3';end if;
      x:=cur||(p->'desired')||jsonb_build_object('revision',(cur->>'revision')::bigint+1);if p->'desired'?'schedule' then x:=jsonb_set(x,'{schedule}',coalesce(nullif(cur->'schedule','null'::jsonb),'{}')||(p->'desired'->'schedule'));end if;
      if p->'scope'->>'kind'='booking' and p->'desired'->'cancelled'='true'::jsonb and not crm_private.modification_cancelled(bid,s) then raise exception 'MODIFICATION_BOOKING_CANCELLATION_REQUIRED:E3';end if;
      insert into crm_private.b04_operational_versions values(bid,p->'scope'->>'kind',(p->'scope'->>'id')::uuid,case when p->'scope'->>'kind'='booking' then null else coalesce(p->'scope'->>'serviceId',p->'scope'->>'id')::uuid end,(x->>'revision')::bigint,s,mid,(p->>'id')::uuid,x,cur,op);
      p:=p||jsonb_build_object('applied',jsonb_build_object('before',cur,'after',x,'actorId',actor,'at',at_time,'evidenceId',a->>'evidenceId'),'review',jsonb_build_object('pending',p->'scope'->>'kind'<>'booking','aspects',p->'aspects','cause','New scope requires its own coverage; application is not confirmation'));
      perform crm_private.modification_requirements(p,bid,s,actor,(a->>'evidenceId')::uuid,at_time,a->>'sourceRef',a->>'reason');
     end if;
    end if;parts:=parts||jsonb_build_array(p);
   end loop;
   if exists(select 1 from jsonb_array_elements(d->'partIds') z where not exists(select 1 from jsonb_array_elements(parts) y where y->'id'=z)) then raise exception 'MODIFICATION_APPROVAL_SCOPE_REQUIRED:E3';end if;
   all_done:=not exists(select 1 from jsonb_array_elements(parts) z where approval->'partIds' @> jsonb_build_array(z->'id') and z->'applied'='null'::jsonb);
   state:=state||jsonb_build_object('currentCivilEvaluations',(select coalesce(jsonb_agg(z||jsonb_build_object('referenceDate',case when z->>'basis'='default' then crm_private.modification_reference(z->'scope',bid,s) else (z->>'referenceDate')::date end,'daysBefore',(case when z->>'basis'='default' then crm_private.modification_reference(z->'scope',bid,s) else (z->>'referenceDate')::date end)-(at_time at time zone(z->>'zone'))::date,'algorithmVersion','h1-civil-d020-v1','actorId',actor,'at',at_time)),'[]') from jsonb_array_elements(coalesce(old->'evaluation'->'temporal','[]')) z),'parts',parts,'progress',case when all_done then 'Aplicada' else 'Aprobada' end);follow:=true;
  elsif act in('reject','withdraw') then
   if d-array['decision','proofId']<>'{}'::jsonb or not(d?&array['decision','proofId']) or not crm_private.invoice_text(d->'decision') then raise exception 'MODIFICATION_DECISION_REQUIRED:E3';end if;
   if act='reject' and old->>'progress' not in('Solicitada','En evaluación','Pendiente de proveedor') then raise exception 'MODIFICATION_TRANSITION_INVALID';end if;
   if act='withdraw' then
    if old->>'progress' not in('Solicitada','En evaluación','Pendiente de proveedor','Aprobada') or exists(select 1 from jsonb_array_elements(old->'parts') z where z->'applied'<>'null'::jsonb) or old->'incident'<>'null'::jsonb or not crm_private.modification_proof((d->>'proofId')::uuid,bid,s,'modification:no-pending-effects:'||mid,at_time) then raise exception 'MODIFICATION_WITHDRAWAL_REQUIRED:E3';end if;
   end if;
   state:=state||jsonb_build_object('progress',case when act='reject' then 'Rechazada' else 'Cancelada/sin efecto' end,'decision',d);follow:=true;
  elsif act in('review','ratify','review_negative') then
   if d-array['partIds','aspects','proofId','result','validUntil']<>'{}'::jsonb or not(d?&array['partIds','aspects','proofId','result','validUntil']) or jsonb_typeof(d->'aspects')<>'array' or jsonb_array_length(d->'aspects')=0 or not crm_private.invoice_text(d->'result') or exists(select 1 from jsonb_array_elements(d->'aspects') z where not crm_private.invoice_text(z)) then raise exception 'MODIFICATION_REVIEW_REQUIRED:E3';end if;
   if jsonb_typeof(d->'partIds') is distinct from 'array' or jsonb_array_length(d->'partIds')=0 or exists(select 1 from jsonb_array_elements(d->'partIds') z where not exists(select 1 from jsonb_array_elements(old->'parts') p0 where p0->'id'=z)) then raise exception 'MODIFICATION_PART_REQUIRED:E3';end if;
   parts:='[]';for p in select value from jsonb_array_elements(old->'parts') loop
    if d->'partIds' @> jsonb_build_array(p->'id') then
     if act='ratify' then
      if (p->'review') is null or p->'review'='null'::jsonb or not(coalesce(p->'review'->'aspects',p->'aspects') @> (d->'aspects')) then raise exception 'MODIFICATION_RATIFICATION_REQUIRED:E3';end if;
      cur:=crm_private.modification_scope(p->'scope',bid,s);if cur is distinct from coalesce(p->'applied'->'after',p->'before') then raise exception 'MODIFICATION_SCOPE_CONFLICT:E2';end if;
      hash:=encode(crm_crypto.digest(convert_to(jsonb_build_object('part',p-array['review'],'aspects',d->'aspects','validUntil',d->'validUntil')::text,'UTF8'),'sha256'),'hex');
      if not crm_private.modification_proof((d->>'proofId')::uuid,bid,s,'modification:ratify:'||hash,at_time) or not crm_private.availability_time(d->'validUntil') or (d->>'validUntil')::timestamptz<at_time then raise exception 'MODIFICATION_RATIFICATION_REQUIRED:E3';end if;
      p:=p||jsonb_build_object('review',jsonb_build_object('pending',not(d->'aspects' @> coalesce(p->'review'->'aspects',p->'aspects')),'aspects',(select coalesce(jsonb_agg(z),'[]') from jsonb_array_elements(coalesce(p->'review'->'aspects',p->'aspects')) z where not(d->'aspects' @> jsonb_build_array(z))),'result',d,'at',at_time,'actorId',actor,'evidenceId',a->>'evidenceId'));
     else p:=p||jsonb_build_object('review',jsonb_build_object('pending',true,'aspects',d->'aspects','result',d,'cause',a->>'reason','actorId',actor,'at',at_time,'evidenceId',a->>'evidenceId'));end if;follow:=true;
    end if;parts:=parts||jsonb_build_array(p);
   end loop;state:=state||jsonb_build_object('parts',parts);
  elsif act='incident' then
   if d-array['incidentId','attempt','knownEffects','uncertainParts','proofId','result']<>'{}'::jsonb or not(d?&array['incidentId','attempt','knownEffects','uncertainParts']) or not exists(select 1 from crm_private.b07_incidents where incident_id=(d->>'incidentId')::uuid and booking_id=bid and admin_scope=s) then raise exception 'MODIFICATION_INCIDENT_REQUIRED:E3';end if;if d->>'result'='verified' then
    if old->'incident'='null'::jsonb or d->'uncertainParts'<>'[]'::jsonb or not exists(select 1 from crm_private.b07_incident_revisions r0 where r0.incident_id=(d->>'incidentId')::uuid and r0.revision=(select max(revision) from crm_private.b07_incident_revisions where incident_id=r0.incident_id) and r0.after_data->>'status' in('Resuelta','Cerrada')) or not crm_private.modification_proof((d->>'proofId')::uuid,bid,s,'modification:recover:'||encode(crm_crypto.digest(convert_to((d-'proofId')::text,'UTF8'),'sha256'),'hex'),at_time) then raise exception 'MODIFICATION_RECOVERY_REQUIRED:E3';end if;
    state:=state||jsonb_build_object('resolvedIncident',old->'incident','incident',null,'recovery',d);
   else state:=state||jsonb_build_object('incident',d);end if;follow:=true;
  else raise exception 'MODIFICATION_INPUT_INVALID';end if;
  if follow then
   fs:=crm_f1.fields(tq);if cardinality(fs)<>2 or fs[1]<>'CRM-H1-TASK-1' then raise exception 'MODIFICATION_TASK_AUTH_REQUIRED';end if;task:=fs[2]::jsonb;if task->>'taskId'<>mid::text or task->'identity'->>'contextId'<>bid::text then raise exception 'MODIFICATION_TASK_AUTH_REQUIRED';end if;perform crm_api.b07_task_apply(tf2p,tf2s,tf1p,tf1s,tq);
  end if;
  rev:=rev+1;state:=state||jsonb_build_object('revision',rev);insert into crm_private.b06_modification_revisions values(mid,rev,s,op,act,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());r:=jsonb_build_object('id',mid,'replayed',false,'result',state);insert into crm_private.b06_modification_operations values(op,mid,s,actor,fp,r,rev,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
alter function crm_private.modification_source_material(jsonb,uuid,uuid,text,jsonb) owner to crm_h0_f2_owner;
revoke all on function crm_private.modification_source_material(jsonb,uuid,uuid,text,jsonb) from public;
grant execute on function crm_private.modification_source_material(jsonb,uuid,uuid,text,jsonb) to crm_h0_f2_executor,crm_h0_migration;
alter function crm_private.modification_counterparty(jsonb,uuid,uuid,text) owner to crm_h0_f2_owner;
revoke all on function crm_private.modification_counterparty(jsonb,uuid,uuid,text) from public;
grant execute on function crm_private.modification_counterparty(jsonb,uuid,uuid,text) to crm_h0_f2_executor,crm_h0_migration;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
