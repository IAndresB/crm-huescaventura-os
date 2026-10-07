-- H5-003/004: internal D016 intent only. No external executor, scheduler or email.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'ALERT_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501'; end if; end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b07_alerts (
 alert_id uuid primary key,admin_scope text not null,identity_key text not null,
 identity jsonb not null,material jsonb not null,
 responsible_actor uuid not null references crm_private.crm_actors(actor_id),
 control_state text not null check(control_state in ('review_required','stopped')),
 missing_parameters jsonb not null,revision bigint not null default 1 check(revision>0),
 created_at timestamptz not null default clock_timestamp(),
 unique(admin_scope,identity_key)
);
create table crm_private.b07_notifications (
 notification_id uuid primary key,alert_id uuid not null references crm_private.b07_alerts(alert_id),
 admin_scope text not null,channel text not null check(channel in ('crm','whatsapp')),
 recipient_actor uuid not null references crm_private.crm_actors(actor_id),
 intent text not null check(intent='internal-alert'),
 delivery_state text not null,
 last_synthetic_outcome text check(last_synthetic_outcome in ('failed','uncertain','simulated_delivered')),
 attempt_count integer not null default 0 check(attempt_count>=0),
 unique(alert_id,channel),
 check((channel='crm' and delivery_state='visible' and attempt_count=0 and last_synthetic_outcome is null)
  or (channel='whatsapp' and delivery_state='unavailable'))
);
create table crm_private.b07_notification_attempts (
 attempt_id uuid primary key,notification_id uuid not null references crm_private.b07_notifications(notification_id),
 admin_scope text not null,attempt_number integer not null check(attempt_number>0),
 fingerprint text not null,outcome text not null check(outcome in ('failed','uncertain','simulated_delivered')),
 result_ref text not null,source_version text not null,review_ref text,
 simulated boolean not null check(simulated),
 recorded_by uuid not null references crm_private.crm_actors(actor_id),
 recorded_at timestamptz not null default clock_timestamp(),
 unique(notification_id,attempt_number)
);
create index b07_alert_responsible on crm_private.b07_alerts(responsible_actor);
create index b07_notification_recipient on crm_private.b07_notifications(recipient_actor);
create index b07_attempt_actor on crm_private.b07_notification_attempts(recorded_by);
do $$ declare t text; r text; begin
 foreach t in array array['b07_alerts','b07_notifications','b07_notification_attempts'] loop
  execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
  execute format('alter table crm_private.%I enable row level security',t);
  execute format('alter table crm_private.%I force row level security',t);
  execute format('create policy alert_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
  execute format('create policy alert_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
  execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
  foreach r in array array['public','crm_h0_runtime','anon','authenticated'] loop
   if r='public' or exists(select 1 from pg_roles where rolname=r) then
    execute format('revoke all on crm_private.%I from %I',t,r);
   end if;
  end loop;
 end loop;
end $$;
grant update(control_state,revision) on crm_private.b07_alerts to crm_h0_f2_executor;
grant update(last_synthetic_outcome,attempt_count) on crm_private.b07_notifications to crm_h0_f2_executor;

create function crm_api.b07_alert_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(result_ref uuid,replayed boolean)
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];m jsonb;i jsonb;a jsonb;au jsonb;missing jsonb;
 actor uuid;scope text;opid uuid;target uuid;action text;fingerprint text;causekey text;
 prior crm_private.b07_operations%rowtype;old crm_private.b07_alerts%rowtype;
 n crm_private.b07_notifications%rowtype;pa crm_private.b07_notification_attempts%rowtype;
 before_data jsonb;after_data jsonb;k text;attempt_fingerprint text;changed boolean:=true;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');
 tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'ALERT_DENIED' using errcode='42501'; end if;
 v:=crm_f1.fields(q);
 if cardinality(v)<>2 or v[1]<>'CRM-H5-ALERT-1' then raise exception 'ALERT_INPUT_INVALID'; end if;
 m:=v[2]::jsonb;actor:=hf[12]::uuid;scope:=hf[17];action:=m->>'action';
 if jsonb_typeof(m) is distinct from 'object' or m->>'purpose' is distinct from 'internal-alert'
  or action is null or action not in ('receive','stop','review','record_synthetic_result')
  or nullif(btrim(m->>'reason'),'') is null or m->>'operationId' is null or m->>'alertId' is null then
  raise exception 'ALERT_INPUT_INVALID'; end if;
 opid:=(m->>'operationId')::uuid;target:=(m->>'alertId')::uuid;
 fingerprint:=encode(crm_crypto.digest(convert_to(m::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(opid::text,0));
 select * into prior from crm_private.b07_operations where operation_id=opid;
 if found then
  if prior.admin_scope<>scope or prior.actor_id<>actor or prior.fingerprint<>fingerprint then raise exception 'ALERT_REPLAY_CONFLICT'; end if;
  result_ref:=prior.result_ref;replayed:=true;
 else
  if action='receive' then
   if m-array['action','operationId','alertId','identity','material','reason','purpose']<>'{}'::jsonb then raise exception 'ALERT_INPUT_INVALID'; end if;
   i:=m->'identity';a:=m->'material';au:=a->'automation';
   if jsonb_typeof(i) is distinct from 'object' or jsonb_typeof(a) is distinct from 'object'
    or i-array['sourceRef','causeId','contextKind','contextId','scopeRef','effect']<>'{}'::jsonb
    or a-array['cause','risk','requiredAction','urgency','sourceVersion','automation']<>'{}'::jsonb then raise exception 'ALERT_INPUT_INVALID'; end if;
   foreach k in array array['sourceRef','causeId','contextKind','contextId','scopeRef','effect'] loop
    if jsonb_typeof(i->k) is distinct from 'string' or nullif(btrim(i->>k),'') is null then raise exception 'ALERT_INPUT_INVALID'; end if;
   end loop;
   foreach k in array array['cause','risk','requiredAction','urgency','sourceVersion'] loop
    if jsonb_typeof(a->k) is distinct from 'string' or nullif(btrim(a->>k),'') is null then raise exception 'ALERT_INPUT_INVALID'; end if;
   end loop;
   if i->>'contextKind' not in ('contact','organization','opportunity','booking','booking_service','provider','proposal','other')
    or a->>'urgency' not in ('informative','important','critical') then raise exception 'ALERT_INPUT_INVALID'; end if;
   perform (i->>'contextId')::uuid;
   missing:='[]'::jsonb;
   if au is null then raise exception 'ALERT_INPUT_INVALID'; end if;
   if au<>'null'::jsonb then
    if jsonb_typeof(au) is distinct from 'object' or au-array['definitionRef','executionRef','version','triggerRef','inputsRef','permissionsRef','effectsRef','recordsRef','retryLimit','pauseSeconds','missingParameters']<>'{}'::jsonb
     or a->>'urgency'='informative' then raise exception 'ALERT_AUTOMATION_INVALID'; end if;
    foreach k in array array['definitionRef','executionRef','version','triggerRef','inputsRef','permissionsRef','effectsRef','recordsRef'] loop
     if jsonb_typeof(au->k) is distinct from 'string' or nullif(btrim(au->>k),'') is null then raise exception 'ALERT_AUTOMATION_INVALID'; end if;
    end loop;
    foreach k in array array['retryLimit','pauseSeconds'] loop
     if au->k is null then raise exception 'ALERT_AUTOMATION_INVALID'; end if;
     if au->k='null'::jsonb then missing:=missing||jsonb_build_array(k);
     elsif jsonb_typeof(au->k)<>'number' or (au->>k)::numeric<0 or (au->>k)::numeric<>trunc((au->>k)::numeric)
      or (au->>k)::numeric>2147483647 then raise exception 'ALERT_AUTOMATION_INVALID'; end if;
    end loop;
    if jsonb_typeof(au->'missingParameters') is distinct from 'array' then raise exception 'ALERT_AUTOMATION_INVALID'; end if;
    if exists(select 1 from jsonb_array_elements(au->'missingParameters') x where jsonb_typeof(x)<>'string' or nullif(btrim(x#>>'{}'),'') is null) then raise exception 'ALERT_AUTOMATION_INVALID'; end if;
    missing:=missing||(au->'missingParameters');
   end if;
   causekey:=encode(crm_crypto.digest(convert_to(i::text,'UTF8'),'sha256'),'hex');
   perform pg_advisory_xact_lock(hashtextextended(scope||causekey,503));
   select * into old from crm_private.b07_alerts where admin_scope=scope and identity_key=causekey for update;
   if found then
    if old.identity<>i or old.material<>a then raise exception 'ALERT_IDENTITY_CONFLICT'; end if;
    target:=old.alert_id;changed:=false;
   else
    insert into crm_private.b07_alerts(alert_id,admin_scope,identity_key,identity,material,responsible_actor,control_state,missing_parameters)
     values(target,scope,causekey,i,a,actor,'review_required',missing);
    insert into crm_private.b07_notifications(notification_id,alert_id,admin_scope,channel,recipient_actor,intent,delivery_state)
     values(gen_random_uuid(),target,scope,'crm',actor,'internal-alert','visible');
    if a->>'urgency' in ('critical','important') then
     insert into crm_private.b07_notifications(notification_id,alert_id,admin_scope,channel,recipient_actor,intent,delivery_state)
      values(gen_random_uuid(),target,scope,'whatsapp',actor,'internal-alert','unavailable');
    end if;
   end if;
  else
   select * into old from crm_private.b07_alerts where alert_id=target and admin_scope=scope for update;
   if not found then raise exception 'ALERT_DENIED' using errcode='42501'; end if;
   before_data:=to_jsonb(old);
   if m->>'expectedRevision' is null or (m->>'expectedRevision')::bigint<1 then raise exception 'ALERT_REVISION_CONFLICT'; end if;
   if action='record_synthetic_result' then
    if m-array['action','operationId','alertId','expectedRevision','attemptId','outcome','resultRef','version','reason','reviewRef','purpose']<>'{}'::jsonb
     or m->>'attemptId' is null or m->>'outcome' is null or m->>'outcome' not in ('failed','uncertain','simulated_delivered')
     or nullif(btrim(m->>'resultRef'),'') is null or nullif(btrim(m->>'version'),'') is null then raise exception 'ALERT_ATTEMPT_INVALID'; end if;
    select * into n from crm_private.b07_notifications where alert_id=target and channel='whatsapp' for update;
    if not found then raise exception 'ALERT_NO_WHATSAPP_INTENT'; end if;
    attempt_fingerprint:=encode(crm_crypto.digest(convert_to((m-array['operationId','expectedRevision','purpose'])::text,'UTF8'),'sha256'),'hex');
    select * into pa from crm_private.b07_notification_attempts where attempt_id=(m->>'attemptId')::uuid;
    if found then
     if pa.notification_id<>n.notification_id or pa.fingerprint<>attempt_fingerprint then raise exception 'ALERT_ATTEMPT_CONFLICT'; end if;
     changed:=false;
    else
     if old.revision<>(m->>'expectedRevision')::bigint then raise exception 'ALERT_REVISION_CONFLICT'; end if;
     if old.control_state='stopped' then raise exception 'ALERT_STOPPED'; end if;
     if n.attempt_count>0 then
      if nullif(btrim(m->>'reviewRef'),'') is null then raise exception 'ALERT_REVIEW_REQUIRED'; end if;
      au:=old.material->'automation';
      if au='null'::jsonb or jsonb_array_length(old.missing_parameters)>0 then raise exception 'ALERT_PARAMETERS_MISSING'; end if;
      if n.attempt_count>(au->>'retryLimit')::int then raise exception 'ALERT_RETRY_LIMIT'; end if;
      if exists(select 1 from crm_private.b07_notification_attempts where notification_id=n.notification_id
       and recorded_at+make_interval(secs=>(au->>'pauseSeconds')::int)>clock_timestamp()) then raise exception 'ALERT_PAUSE_PENDING'; end if;
     end if;
     insert into crm_private.b07_notification_attempts(attempt_id,notification_id,admin_scope,attempt_number,fingerprint,outcome,result_ref,source_version,review_ref,simulated,recorded_by)
      values((m->>'attemptId')::uuid,n.notification_id,scope,n.attempt_count+1,attempt_fingerprint,m->>'outcome',m->>'resultRef',m->>'version',m->>'reviewRef',true,actor);
     update crm_private.b07_notifications set last_synthetic_outcome=m->>'outcome',attempt_count=attempt_count+1 where notification_id=n.notification_id;
     update crm_private.b07_alerts set revision=revision+1 where alert_id=target;
    end if;
   else
    if m-array['action','operationId','alertId','expectedRevision','reason','reviewRef','purpose']<>'{}'::jsonb or nullif(btrim(m->>'reviewRef'),'') is null then raise exception 'ALERT_REVIEW_REQUIRED'; end if;
    if old.revision<>(m->>'expectedRevision')::bigint then raise exception 'ALERT_REVISION_CONFLICT'; end if;
    update crm_private.b07_alerts set control_state=case when action='stop' then 'stopped' else 'review_required' end,revision=revision+1 where alert_id=target;
   end if;
  end if;
  insert into crm_private.b07_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref) values(opid,scope,actor,fingerprint,target);
  if changed then
   select to_jsonb(t)||jsonb_build_object('notifications',(select jsonb_agg(to_jsonb(notice) order by notice.channel) from crm_private.b07_notifications notice where notice.alert_id=target)) into after_data from crm_private.b07_alerts t where t.alert_id=target;
   insert into crm_private.b07_history(history_id,operation_id,subject_id,admin_scope,action_kind,before_state,after_state,reason,source_ref,actor_id)
    values(opid,opid,target,scope,'alert_'||action,before_data,after_data,m->>'reason',coalesce(m->>'resultRef',m->>'reviewRef',i->>'sourceRef'),actor);
  end if;
  result_ref:=target;replayed:=not changed;
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');
 perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 return next;
end $$;
create function crm_api.b07_alert_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];m jsonb;result jsonb;target uuid;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');
 tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'ALERT_DENIED'; end if;
 v:=crm_f1.fields(q);if cardinality(v)<>2 or v[1]<>'CRM-H5-ALERT-READ1' then raise exception 'ALERT_INPUT_INVALID'; end if;
 m:=v[2]::jsonb;
 if m->>'purpose' is distinct from 'internal-alert' or m-array['alertId','purpose']<>'{}'::jsonb then raise exception 'ALERT_DENIED'; end if;
 target:=(m->>'alertId')::uuid;
 select to_jsonb(t)||jsonb_build_object(
  'notifications',coalesce((select jsonb_agg(to_jsonb(notice) order by notice.channel) from crm_private.b07_notifications notice where notice.alert_id=target),'[]'::jsonb),
  'attempts',coalesce((select jsonb_agg(to_jsonb(a) order by a.attempt_number) from crm_private.b07_notification_attempts a join crm_private.b07_notifications n using(notification_id) where n.alert_id=target),'[]'::jsonb),
  'history',coalesce((select jsonb_agg(to_jsonb(h) order by h.recorded_at,h.history_id) from crm_private.b07_history h where h.subject_id=target and h.admin_scope=hf[17]),'[]'::jsonb)) into result
 from crm_private.b07_alerts t where t.alert_id=target and t.admin_scope=hf[17];
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');
 perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return result;
end $$;
alter function crm_api.b07_alert_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
alter function crm_api.b07_alert_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.b07_alert_apply(bytea,bytea,bytea,bytea,bytea),crm_api.b07_alert_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.b07_alert_apply(bytea,bytea,bytea,bytea,bytea),crm_api.b07_alert_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
