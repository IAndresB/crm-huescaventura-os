-- H4-007/008. Manual credited temporal commitments; no external executor/firm reservation.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'HOLD_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b04_holds(
 hold_id uuid primary key,opportunity_id uuid not null references crm_private.b03_opportunities(opportunity_id),admin_scope text not null,
 provider_revision_id uuid not null references crm_private.catalog_revisions(revision_id),external_ref text not null,initial_operation_id uuid not null,
 unique(admin_scope,provider_revision_id,external_ref)
);
create table crm_private.b04_hold_operations(
 operation_id uuid primary key,hold_id uuid not null references crm_private.b04_holds(hold_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,result jsonb not null,result_revision bigint not null,
 recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b04_hold_revisions(
 hold_id uuid not null references crm_private.b04_holds(hold_id),revision bigint not null check(revision>0),admin_scope text not null,
 operation_id uuid not null unique references crm_private.b04_hold_operations(operation_id) deferrable initially deferred,
 action_kind text not null check(action_kind in ('grant','check','near','invalidate','request','release','extend','link')),
 event jsonb not null,before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 evidence_id uuid not null references crm_private.b07_records(record_id),source_ref text not null,reason text not null,
 occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(hold_id,revision)
);
alter table crm_private.b04_holds add foreign key(initial_operation_id) references crm_private.b04_hold_operations(operation_id) deferrable initially deferred;
alter table crm_private.b04_hold_operations add foreign key(hold_id,result_revision) references crm_private.b04_hold_revisions(hold_id,revision) deferrable initially deferred;
create unique index hold_fact_identity on crm_private.b04_hold_revisions(admin_scope,(event->'data'->>'factId')) where event->'data' ? 'factId';
create index hold_opportunity on crm_private.b04_holds(admin_scope,opportunity_id);
do $$declare t text;r text;begin foreach t in array array['b04_holds','b04_hold_operations','b04_hold_revisions'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy hold_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy hold_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger hold_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
-- A retained proposal line is the pre-Booking authority; capacity unit is independent of charging.
create function crm_private.hold_part(x jsonb,opp uuid,s text) returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$begin
 if jsonb_typeof(x) is distinct from 'object' or not(x ?& array['id','versionId','lineId','serviceRevisionId','variantRevisionId','date','quantity','unitRevisionId','conditions','expiresAt'])
 or x-array['id','versionId','lineId','serviceRevisionId','variantRevisionId','date','quantity','unitRevisionId','conditions','expiresAt']<>'{}'::jsonb
 or not coalesce(crm_private.invoice_text(x->'conditions'),false) or coalesce(x->>'quantity','')!~'^[0-9]+(\.[0-9]+)?$' or (x->>'quantity')::numeric<=0
 or coalesce(x->>'date','')!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or not(x->'expiresAt'='null'::jsonb or coalesce(crm_private.availability_time(x->'expiresAt'),false)) then return false;end if;
 perform (x->>'id')::uuid;perform (x->>'date')::date;
 if not exists(select 1 from crm_private.b03_proposal_lines l join crm_private.b03_proposal_versions v using(version_id) join crm_private.b03_proposals p using(proposal_id)
 where p.opportunity_id=opp and p.admin_scope=s and l.admin_scope=s and v.admin_scope=s and l.version_id=(x->>'versionId')::uuid and l.line_id=(x->>'lineId')::uuid
 and l.service_revision_id=(x->>'serviceRevisionId')::uuid and (l.service_date is null or l.service_date=(x->>'date')::date)) then return false;end if;
 if not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(x->>'unitRevisionId')::uuid and r.admin_scope=s and i.admin_scope=s and i.item_kind='unit') then return false;end if;
 if x->'variantRevisionId'<>'null'::jsonb and not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(x->>'variantRevisionId')::uuid and r.admin_scope=s and i.item_kind='variant' and i.parent_id=(select item_id from crm_private.catalog_revisions where revision_id=(x->>'serviceRevisionId')::uuid)) then return false;end if;return true;end$$;
create function crm_private.hold_record(id uuid,opp uuid,s text) returns boolean language sql stable set search_path=pg_catalog,pg_temp as $$
 select exists(select 1 from crm_private.b07_records r join crm_private.b07_links l using(record_id) where r.record_id=id and r.admin_scope=s and l.admin_scope=s and l.context_kind='opportunity' and l.context_id=opp)
$$;
create function crm_api.hold_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,tf2p bytea,tf2s bytea,tf1p bytea,tf1s bytea,tq bytea) returns jsonb
 language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;op uuid;iid uuid;opp uuid;actor uuid;s text;action text;fp text;proofhash text;rev bigint;at_time timestamptz;
 prev crm_private.b04_hold_operations;root crm_private.b04_holds;old jsonb;state jsonb;r jsonb;data jsonb;p jsonb;v jsonb;parts jsonb;selection jsonb;amount numeric;remaining numeric;
 fact crm_private.b04_hold_revisions;known boolean:=false;follow boolean:=false;task jsonb;task_id uuid;entry jsonb;record crm_private.b07_records;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'HOLD_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-HOLD1' then raise exception 'HOLD_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or not(a ?& array['action','operationId','holdId','opportunityId','expectedRevision','expectedOpportunityRevision','sourceRef','reason','at','evidenceId','data'])
 or a-array['action','operationId','holdId','opportunityId','expectedRevision','expectedOpportunityRevision','sourceRef','reason','at','evidenceId','data','origin']<>'{}'::jsonb
 or exists(select 1 from unnest(array['action','operationId','holdId','opportunityId','sourceRef','reason','evidenceId']) k where not coalesce(crm_private.invoice_text(a->k),false))
 or not coalesce(crm_private.availability_time(a->'at'),false) or jsonb_typeof(a->'data') is distinct from 'object'
 or coalesce(a->>'expectedRevision','')!~'^(0|[1-9][0-9]*)$' or coalesce(a->>'expectedOpportunityRevision','')!~'^[1-9][0-9]*$' or coalesce(a->>'origin','manual')<>'manual' then raise exception 'HOLD_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;iid:=(a->>'holdId')::uuid;opp:=(a->>'opportunityId')::uuid;actor:=hf[12]::uuid;s:=hf[17];action:=a->>'action';data:=a->'data';at_time:=(a->>'at')::timestamptz;
 if action not in ('grant','check','near','invalidate','request','release','extend','link') then raise exception 'HOLD_INPUT_INVALID';end if;
 if not exists(select 1 from crm_private.b03_opportunities where opportunity_id=opp and admin_scope=s) then raise exception 'HOLD_DENIED';end if;
 -- Same parent lock/order as real H2 conversion; protects first roots and link/conversion race.
 perform pg_advisory_xact_lock(hashtextextended(opp::text,31));
 perform pg_advisory_xact_lock(hashtextextended('hold:'||iid,0));
 select * into root from crm_private.b04_holds where hold_id=iid;
 if (action<>'grant' and root.hold_id is null) or (root.hold_id is not null and (root.opportunity_id<>opp or root.admin_scope<>s)) then raise exception 'HOLD_DENIED';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('hold-op:'||op,0));
 select * into prev from crm_private.b04_hold_operations where operation_id=op;
 if found then
  if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'HOLD_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  proofhash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.payment_evidence((a->>'evidenceId')::uuid,iid,s,'hold:'||action||':'||proofhash,at_time,true)
  or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'HOLD_EVIDENCE_REQUIRED:E3';end if;
  if data?'factId' then
   perform (data->>'factId')::uuid;
   perform pg_advisory_xact_lock(hashtextextended('hold-fact:'||(data->>'factId'),0));
   select * into fact from crm_private.b04_hold_revisions where admin_scope=s and event->'data'->>'factId'=data->>'factId';
   if found then
    if fact.action_kind<>action or fact.event->'data' is distinct from data or not exists(select 1 from crm_private.b04_holds where hold_id=fact.hold_id and opportunity_id=opp and admin_scope=s) then raise exception 'HOLD_FACT_CONFLICT:E2';end if;
    if action<>'grant' and fact.hold_id<>iid then raise exception 'HOLD_FACT_CONFLICT:E2';end if;
    iid:=fact.hold_id;select * into root from crm_private.b04_holds where hold_id=iid;known:=true;
   end if;
  end if;
  if root.hold_id is not null then select revision,after_data into rev,old from crm_private.b04_hold_revisions where hold_id=iid order by revision desc limit 1;end if;
  if not known and action in ('check','near','invalidate','request','link') and exists(select 1 from crm_private.b04_hold_revisions where hold_id=iid and admin_scope=s and action_kind=action and event->'data'=data) then known:=true;end if;
  if known then state:=old;
  else
   if coalesce(rev,0)<>(a->>'expectedRevision')::bigint or not exists(select 1 from crm_private.b03_opportunities where opportunity_id=opp and admin_scope=s and revision=(a->>'expectedOpportunityRevision')::bigint) then raise exception 'HOLD_REVISION_CONFLICT:E2';end if;
   state:=old;
   if action='grant' then
    if root.hold_id is not null or data-array['providerRevisionId','externalRef','factId','recordId','happenedAt','certainty','parts','replacesHoldId']<>'{}'::jsonb
    or not(data ?& array['providerRevisionId','externalRef','factId','recordId','happenedAt','certainty','parts','replacesHoldId']) or data->>'certainty' is distinct from 'granted'
    or not coalesce(crm_private.invoice_text(data->'externalRef'),false) or not coalesce(crm_private.availability_time(data->'happenedAt'),false) or (data->>'happenedAt')::timestamptz>at_time
    or jsonb_typeof(data->'parts') is distinct from 'array' or jsonb_array_length(data->'parts')=0
    or exists(select 1 from jsonb_array_elements(data->'parts') x where not coalesce(crm_private.hold_part(x,opp,s),false))
    or (select count(*)<>count(distinct x->>'id') from jsonb_array_elements(data->'parts') x)
    or not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(data->>'providerRevisionId')::uuid and r.admin_scope=s and i.admin_scope=s and i.item_kind='provider')
    or not coalesce(crm_private.hold_record((data->>'recordId')::uuid,opp,s),false) then raise exception 'HOLD_GRANT_REQUIRED:E3';end if;
    perform pg_advisory_xact_lock(hashtextextended('hold-resource:'||(data->>'providerRevisionId')||':'||(data->>'externalRef'),0));
    if exists(select 1 from crm_private.b04_holds where admin_scope=s and provider_revision_id=(data->>'providerRevisionId')::uuid and external_ref=data->>'externalRef') then raise exception 'HOLD_IDENTITY_CONFLICT:E2';end if;
    if data->'replacesHoldId'<>'null'::jsonb and not exists(select 1 from crm_private.b04_holds where hold_id=(data->>'replacesHoldId')::uuid and opportunity_id=opp and admin_scope=s and provider_revision_id=(data->>'providerRevisionId')::uuid) then raise exception 'HOLD_SUBSTITUTION_REQUIRED:E3';end if;
    parts:='[]';for p in select value from jsonb_array_elements(data->'parts') loop
     if p->'expiresAt'<>'null'::jsonb and (p->>'expiresAt')::timestamptz<=(data->>'happenedAt')::timestamptz then raise exception 'HOLD_EXPIRY_REQUIRED:E3';end if;
     parts:=parts||jsonb_build_array(jsonb_build_object('terms',p,'remaining',p->>'quantity','validity','Creado','verified',null,'request',null,'review',null,'near',null,'link',null,'lastFactAt',data->'happenedAt'));
     if p->'expiresAt'='null'::jsonb then follow:=true;end if;
    end loop;
    state:=jsonb_build_object('id',iid,'opportunityId',opp,'providerRevisionId',data->'providerRevisionId','externalRef',data->'externalRef','grant',data,'parts',parts,'replacesHoldId',data->'replacesHoldId');
   else
    if old is null then raise exception 'HOLD_DENIED';end if;
    if action in ('release','extend') then
     if data-array['selections','factId','recordId','happenedAt','providerRevisionId','authority','unequivocal','certainty','basis']<>'{}'::jsonb
     or not(data ?& array['selections','factId','recordId','happenedAt','providerRevisionId','authority','unequivocal','certainty','basis'])
     or data->'providerRevisionId' is distinct from old->'providerRevisionId' or data->'authority' is distinct from 'true'::jsonb or data->'unequivocal' is distinct from 'true'::jsonb
     or data->>'certainty' is distinct from (case action when 'release' then 'released' else 'extended' end)
     or not coalesce(crm_private.invoice_text(data->'basis'),false) or not coalesce(crm_private.availability_time(data->'happenedAt'),false) or (data->>'happenedAt')::timestamptz>at_time
     or not coalesce(crm_private.hold_record((data->>'recordId')::uuid,opp,s),false) or jsonb_typeof(data->'selections') is distinct from 'array' or jsonb_array_length(data->'selections')=0
     or (select count(*)<>count(distinct x->>'partId') from jsonb_array_elements(data->'selections') x) then raise exception 'HOLD_RESPONSE_REQUIRED:E3';end if;
    else
     if jsonb_typeof(data->'partIds') is distinct from 'array' or jsonb_array_length(data->'partIds')=0 or (select count(*)<>count(distinct x) from jsonb_array_elements_text(data->'partIds') x) then raise exception 'HOLD_SCOPE_REQUIRED:E3';end if;
    end if;
    if exists(select 1 from jsonb_array_elements(case when action in ('release','extend') then data->'selections' else (select jsonb_agg(jsonb_build_object('partId',x)) from jsonb_array_elements_text(data->'partIds') x) end) x where not exists(select 1 from jsonb_array_elements(old->'parts') y where y->'terms'->>'id'=x->>'partId')) then raise exception 'HOLD_SCOPE_REQUIRED:E3';end if;
    parts:='[]';
    for p in select value from jsonb_array_elements(old->'parts') loop
     selection:=null;
     if action in ('release','extend') then select value into selection from jsonb_array_elements(data->'selections') where value->>'partId'=p->'terms'->>'id';end if;
     if selection is not null or data->'partIds' ? (p->'terms'->>'id') then
      remaining:=(p->>'remaining')::numeric;
      if remaining<=0 then raise exception 'HOLD_RELEASED:E3';end if;
      if action in ('release','extend') then
       if selection-array['partId','quantity','unitRevisionId','date','expiresAt','conditions','newPartId','newDate']<>'{}'::jsonb or not(selection ?& array['partId','quantity','unitRevisionId','date'])
       or coalesce(selection->>'quantity','')!~'^[0-9]+(\.[0-9]+)?$' or (selection->>'quantity')::numeric<=0 or (selection->>'quantity')::numeric>remaining
       or selection->'unitRevisionId' is distinct from p->'terms'->'unitRevisionId' or selection->'date' is distinct from p->'terms'->'date' then raise exception 'HOLD_PORTION_REQUIRED:E3';end if;
       if (data->>'happenedAt')::timestamptz<=(p->>'lastFactAt')::timestamptz then raise exception 'HOLD_PRECEDENCE_REQUIRED:E8';end if;
       amount:=(selection->>'quantity')::numeric;
       if action='release' then
        if selection-array['partId','quantity','unitRevisionId','date']<>'{}'::jsonb then raise exception 'HOLD_PORTION_REQUIRED:E3';end if;
        p:=p||jsonb_build_object('remaining',(remaining-amount)::text,'lastFactAt',data->'happenedAt','release',jsonb_build_object('fact',data,'selection',selection,'evidenceId',a->'evidenceId','actorId',actor,'at',at_time));
        if remaining=amount then p:=p||jsonb_build_object('validity','Liberado','verified',null,'near',null);else p:=p||jsonb_build_object('validity','No verificado','verified',null);follow:=true;end if;
       else
        if not(selection ?& array['expiresAt','conditions']) or not coalesce(crm_private.invoice_text(selection->'conditions'),false)
        or not coalesce(crm_private.availability_time(selection->'expiresAt'),false) or (selection->>'expiresAt')::timestamptz<=at_time then raise exception 'HOLD_EXTENSION_REQUIRED:E3';end if;
        if selection?'newDate' then
         if coalesce(selection->>'newDate','')!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'HOLD_EXTENSION_REQUIRED:E3';end if;perform (selection->>'newDate')::date;
        end if;
        if amount<remaining then
         if not coalesce(crm_private.invoice_text(selection->'newPartId'),false) then raise exception 'HOLD_SPLIT_REQUIRED:E3';end if;perform (selection->>'newPartId')::uuid;
         if exists(select 1 from jsonb_array_elements(old->'parts') x where x->'terms'->>'id'=selection->>'newPartId') then raise exception 'HOLD_SPLIT_REQUIRED:E3';end if;
         v:=p||jsonb_build_object('terms',(p->'terms')||jsonb_build_object('id',selection->'newPartId','quantity',amount::text,'expiresAt',selection->'expiresAt','conditions',selection->'conditions','date',coalesce(selection->'newDate',p->'terms'->'date')),'remaining',amount::text,'parentPartId',p->'terms'->'id','validity','No verificado','verified',null,'near',null,'review',jsonb_build_object('cause','Prórroga parcial acreditada','before',p,'after',selection,'result','new-scope','evidenceId',a->'evidenceId'),'lastFactAt',data->'happenedAt');
         if selection?'newDate' and selection->'newDate' is distinct from p->'terms'->'date' then v:=v||jsonb_build_object('link',null);end if;
         parts:=parts||jsonb_build_array(v);p:=p||jsonb_build_object('remaining',(remaining-amount)::text);
        else
         if selection?'newPartId' then raise exception 'HOLD_SPLIT_REQUIRED:E3';end if;
         p:=p||jsonb_build_object('terms',(p->'terms')||jsonb_build_object('expiresAt',selection->'expiresAt','conditions',selection->'conditions','date',coalesce(selection->'newDate',p->'terms'->'date')),'validity','No verificado','verified',null,'near',null,'review',jsonb_build_object('cause','Términos nuevos acreditados','before',p,'after',selection,'result','new-scope','evidenceId',a->'evidenceId'),'lastFactAt',data->'happenedAt');
         if selection?'newDate' then p:=p||jsonb_build_object('link',null);end if;
        end if;follow:=true;
       end if;
      elsif action='check' then
       if data-array['partIds','actionAt','actionUntil','happenedAt','recordId','providerRevisionId','authority','conditionsMet','basis']<>'{}'::jsonb or not(data ?& array['actionAt','actionUntil','happenedAt','recordId','providerRevisionId','authority','conditionsMet','basis'])
       or data->'providerRevisionId' is distinct from old->'providerRevisionId' or data->'authority' is distinct from 'true'::jsonb or data->'conditionsMet' is distinct from 'true'::jsonb or not coalesce(crm_private.invoice_text(data->'basis'),false)
       or not coalesce(crm_private.availability_time(data->'happenedAt'),false) or not coalesce(crm_private.availability_time(data->'actionAt'),false) or not coalesce(crm_private.availability_time(data->'actionUntil'),false)
       or (data->>'happenedAt')::timestamptz<(p->>'lastFactAt')::timestamptz or (data->>'happenedAt')::timestamptz>at_time or at_time>(data->>'actionAt')::timestamptz or (data->>'actionUntil')::timestamptz<(data->>'actionAt')::timestamptz
       or not coalesce(crm_private.hold_record((data->>'recordId')::uuid,opp,s),false) then raise exception 'HOLD_CHECK_REQUIRED:E3';end if;
       if p->'terms'->'expiresAt'<>'null'::jsonb and (data->>'actionUntil')::timestamptz>=(p->'terms'->>'expiresAt')::timestamptz then raise exception 'HOLD_EXPIRED:E3';end if;
       p:=p||jsonb_build_object('validity','Vigente','verified',data||jsonb_build_object('evidenceId',a->'evidenceId','actorId',actor,'at',at_time),'review',null);
       if p->'terms'->'expiresAt'='null'::jsonb then follow:=true;end if;
      elsif action='near' then
       if data-array['partIds','evaluatedAt','advance']<>'{}'::jsonb or p->>'validity'<>'Vigente' or not coalesce(crm_private.availability_time(data->'evaluatedAt'),false)
       or (data->>'evaluatedAt')::timestamptz<>at_time or p->'terms'->'expiresAt'='null'::jsonb or jsonb_typeof(data->'advance') is distinct from 'object' or (data->'advance')-array['seconds','sourceRef','version']<>'{}'::jsonb
       or coalesce(data->'advance'->>'seconds','')!~'^[1-9][0-9]*$' or not coalesce(crm_private.invoice_text(data->'advance'->'sourceRef'),false) or not coalesce(crm_private.invoice_text(data->'advance'->'version'),false)
       or (data->>'evaluatedAt')::timestamptz>=(p->'terms'->>'expiresAt')::timestamptz or (data->>'evaluatedAt')::timestamptz<(p->'terms'->>'expiresAt')::timestamptz-make_interval(secs=>(data->'advance'->>'seconds')::double precision) then raise exception 'HOLD_ADVANCE_REQUIRED:E3';end if;
       p:=p||jsonb_build_object('near',data||jsonb_build_object('evidenceId',a->'evidenceId'));follow:=true;
      elsif action='invalidate' then
       if data-array['partIds','cause','result','before','after','dependencies']<>'{}'::jsonb or not(data ?& array['cause','result','before','after','dependencies'])
       or not coalesce(crm_private.invoice_text(data->'cause'),false) or data->'before' is distinct from old->'parts' or data->'dependencies' is distinct from data->'partIds'
       or jsonb_typeof(data->'after') is distinct from 'object' or coalesce(data->>'result' not in ('expired','uncertain'),true) then raise exception 'HOLD_REVIEW_REQUIRED:E3';end if;
       if data->>'result'='expired' and (p->'terms'->'expiresAt'='null'::jsonb or at_time<(p->'terms'->>'expiresAt')::timestamptz) then raise exception 'HOLD_EXPIRY_REQUIRED:E3';end if;
       p:=p||jsonb_build_object('validity',case data->>'result' when 'expired' then 'Vencido' else 'No verificado' end,'review',data||jsonb_build_object('evidenceId',a->'evidenceId','actorId',actor,'at',at_time),'near',null);follow:=true;
      elsif action='request' then
       if data-array['partIds','decision','communicationFactId','sentAt','providerRevisionId','basis']<>'{}'::jsonb or not(data ?& array['decision','communicationFactId','sentAt','providerRevisionId','basis'])
       or not coalesce(crm_private.invoice_text(data->'decision'),false) or not coalesce(crm_private.invoice_text(data->'basis'),false) or data->'providerRevisionId' is distinct from old->'providerRevisionId'
       or not coalesce(crm_private.availability_time(data->'sentAt'),false) or (data->>'sentAt')::timestamptz>at_time then raise exception 'HOLD_REQUEST_REQUIRED:E3';end if;
       select * into record from crm_private.b07_records where record_id=(data->>'communicationFactId')::uuid and admin_scope=s and record_kind='communication_fact' and material->>'fact_kind'='sent'
       and material->>'party_ref'=old->>'providerRevisionId' and material->>'coverage'=iid::text and occurred_at=(data->>'sentAt')::timestamptz;
       if record.record_id is null or not coalesce(crm_private.hold_record(record.record_id,opp,s),false)
       or not exists(select 1 from crm_private.b07_records where record_id=record.original_id and admin_scope=s and record_kind='communication' and material->>'direction'='outgoing' and material->>'recipient_ref'=old->>'providerRevisionId') then raise exception 'HOLD_SENT_REQUIRED:E3';end if;
       p:=p||jsonb_build_object('request',data||jsonb_build_object('status','Liberación solicitada','evidenceId',a->'evidenceId','actorId',actor,'at',at_time));
      else
       if data-array['partIds','bookingId','serviceId','nightId','bookingRevision','serviceRevision','conditionsChecked']<>'{}'::jsonb or not(data ?& array['bookingId','serviceId','nightId','bookingRevision','serviceRevision','conditionsChecked']) or data->'conditionsChecked' is distinct from 'true'::jsonb
       or p->>'validity'<>'Vigente' or p->'review'<>'null'::jsonb or (p->'verified'->>'actionAt')::timestamptz is distinct from at_time or (p->'terms'->'expiresAt'<>'null'::jsonb and at_time>=(p->'terms'->>'expiresAt')::timestamptz)
       or not exists(select 1 from crm_private.b04_bookings b join crm_private.b04_services bs using(booking_id) join crm_private.b04_contributions c on c.service_id=bs.service_id join crm_private.b03_proposal_lines pl on pl.version_id=c.version_id and pl.line_id=c.line_id
       where b.opportunity_id=opp and b.admin_scope=s and bs.admin_scope=s and b.booking_id=(data->>'bookingId')::uuid and bs.service_id=(data->>'serviceId')::uuid
       and b.revision::text=data->>'bookingRevision' and bs.revision::text=data->>'serviceRevision' and c.version_id=(p->'terms'->>'versionId')::uuid and c.line_id=(p->'terms'->>'lineId')::uuid and bs.service_revision_id=(p->'terms'->>'serviceRevisionId')::uuid and coalesce(bs.applied->'variant','null'::jsonb)=p->'terms'->'variantRevisionId' and (pl.service_date is null or pl.service_date=(p->'terms'->>'date')::date))
       or (data->'nightId'<>'null'::jsonb and not exists(select 1 from crm_private.b04_nights where night_id=(data->>'nightId')::uuid and service_id=(data->>'serviceId')::uuid and admin_scope=s and night_date=(p->'terms'->>'date')::date))
       then raise exception 'HOLD_LINK_REQUIRED:E3';end if;
       if p->'link'<>'null'::jsonb and p->'link' is distinct from data then raise exception 'HOLD_LINK_CONFLICT:E2';end if;
       p:=p||jsonb_build_object('link',data);
      end if;
     end if;
     parts:=parts||jsonb_build_array(p);
    end loop;
    if (select count(*)<>count(distinct x->'terms'->>'id') from jsonb_array_elements(parts) x) then raise exception 'HOLD_SPLIT_REQUIRED:E3';end if;
    state:=state||jsonb_build_object('parts',parts);
   end if;
   rev:=coalesce(rev,0)+1;state:=state||jsonb_build_object('revision',rev);
  end if;
  r:=jsonb_build_object('id',iid,'replayed',known,'result',state);
  if root.hold_id is null then insert into crm_private.b04_holds values(iid,opp,s,(data->>'providerRevisionId')::uuid,data->>'externalRef',op);end if;
  if old is distinct from state then insert into crm_private.b04_hold_revisions values(iid,rev,s,op,action,a,old,state,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());end if;
  if follow then
   fs:=crm_f1.fields(tq);task:=fs[2]::jsonb;
   if fs[1]<>'CRM-H1-TASK-1' or task->>'taskId'<>iid::text or task->>'operationId'<>op::text or task->'identity' is distinct from jsonb_build_object('causeKind','block','causeId',iid,'contextKind','opportunity','contextId',opp,'scopeRef',iid,'effect','hold-review')
   or task->'material' is distinct from '{"title":"Revisar opción y cobertura del alcance","deadline":{"kind":"unknown","reason":"No consta fecha fijada para el seguimiento"},"priority":{"kind":"pending","reason":"Prioridad no configurada"},"sourceRef":"SM-HO","sourceVersion":"1","triggerRef":"BR-TASK-005","triggerVersion":"1"}'::jsonb then raise exception 'HOLD_TASK_REQUIRED';end if;
   select result_ref into task_id from crm_api.b07_task_apply(tf2p,tf2s,tf1p,tf1s,tq);
  end if;
  insert into crm_private.b04_hold_operations values(op,iid,s,actor,fp,r,rev,clock_timestamp());
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.hold_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;s text;opp uuid;iid uuid;r jsonb;p jsonb;usable boolean;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C" is distinct from tf[14] collate "C" then raise exception 'HOLD_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-HOLD-READ1' then raise exception 'HOLD_INPUT_INVALID';end if;a:=fs[2]::jsonb;s:=hf[17];opp:=(a->>'opportunityId')::uuid;
 if a-array['holdId','opportunityId','projection']<>'{}'::jsonb or not(a ?& array['holdId','opportunityId']) then raise exception 'HOLD_INPUT_INVALID';end if;
 if not exists(select 1 from crm_private.b03_opportunities where opportunity_id=opp and admin_scope=s) then r:=null;
 else
  select hold_id into iid from crm_private.b04_holds where hold_id=(a->>'holdId')::uuid and opportunity_id=opp and admin_scope=s;
  select after_data into r from crm_private.b04_hold_revisions where hold_id=iid and admin_scope=s order by revision desc limit 1;
  if r is not null then
   if a?'projection' then
    if (a->'projection')-array['partId','actionAt','actionUntil','quantity','unitRevisionId','date']<>'{}'::jsonb or not(a->'projection' ?& array['partId','actionAt','actionUntil','quantity','unitRevisionId','date']) or not coalesce(crm_private.availability_time(a->'projection'->'actionAt'),false) or not coalesce(crm_private.availability_time(a->'projection'->'actionUntil'),false) or coalesce(a->'projection'->>'quantity','')!~'^[0-9]+(\.[0-9]+)?$' then raise exception 'HOLD_INPUT_INVALID';end if;
    select value into p from jsonb_array_elements(r->'parts') where value->'terms'->>'id'=a->'projection'->>'partId';
    usable:=coalesce(p->>'validity'='Vigente' and (p->>'remaining')::numeric>=(a->'projection'->>'quantity')::numeric and (a->'projection'->>'quantity')::numeric>0 and p->'terms'->'unitRevisionId'=a->'projection'->'unitRevisionId' and p->'terms'->'date'=a->'projection'->'date'
    and p->'review'='null'::jsonb and p->'verified'->'actionAt'=a->'projection'->'actionAt' and p->'verified'->'actionUntil'=a->'projection'->'actionUntil'
    and (p->'terms'->'expiresAt'='null'::jsonb or (a->'projection'->>'actionUntil')::timestamptz<(p->'terms'->>'expiresAt')::timestamptz),false);
    r:=jsonb_build_object('id',iid,'revision',r->'revision','usable',usable,'remaining',p->'remaining','unitRevisionId',p->'terms'->'unitRevisionId','date',p->'terms'->'date','validity',p->'validity','expiresAt',p->'terms'->'expiresAt','releaseRequested',p->'request'<>'null'::jsonb,'revalidationNeeded',p->'terms'->'expiresAt'='null'::jsonb or p->'review'<>'null'::jsonb,'serviceState',case when p->'link'<>'null'::jsonb and usable then 'Opcionado / bloqueado' else null end,'serviceConfirmed',false,'firmReservation',false,'executed',false);
   else
    r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action_kind,'before',before_data,'after',after_data,'actorId',actor_id,'sourceRef',source_ref,'reason',reason,'evidenceId',evidence_id,'at',occurred_at,'recordedAt',recorded_at) order by revision) from crm_private.b04_hold_revisions where hold_id=iid and admin_scope=s));
   end if;
  end if;
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
do $$declare x record;begin for x in select p.oid,p.proname,n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('crm_api','crm_private') and p.proname like 'hold_%' loop
 execute format('alter function %s owner to %I',x.oid::regprocedure,case when x.nspname='crm_api' then 'crm_h0_f2_executor' else 'crm_h0_f2_owner' end);
 execute format('revoke execute on function %s from public',x.oid::regprocedure);
 execute format('grant execute on function %s to %I',x.oid::regprocedure,case when x.nspname='crm_api' then 'crm_h0_runtime' else 'crm_h0_f2_executor' end);
end loop;end$$;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
