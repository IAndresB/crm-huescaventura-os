-- H1-017: pending business work, not scheduler/Execution Record/Notification.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'TASK_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501'; end if; end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b07_pending_tasks (
 task_id uuid primary key,
 admin_scope text not null,
 identity_version text not null check(identity_version='h1-pending-cause-v1'),
 identity_key text not null check(identity_key ~ '^[0-9a-f]{64}$'),
 identity jsonb not null check(jsonb_typeof(identity)='object'),
 material jsonb not null check(jsonb_typeof(material)='object'),
 state text not null check(state='pending'),
 responsible_actor uuid not null references crm_private.crm_actors(actor_id),
 revision bigint not null check(revision>0),
 created_at timestamptz not null default clock_timestamp(),
 updated_at timestamptz not null default clock_timestamp(),
 unique(admin_scope,identity_key),
 check(coalesce(material->'priority'->>'kind'='pending' and nullif(material->'priority'->>'reason','') is not null,false)),
 check(coalesce(material->'deadline'->>'kind' in ('unknown','civil','instant','d020'),false))
);
create index b07_pending_task_context on crm_private.b07_pending_tasks
 (admin_scope,(identity->>'contextKind'),(identity->>'contextId'));
alter table crm_private.b07_pending_tasks owner to crm_h0_f2_owner;
alter table crm_private.b07_pending_tasks enable row level security;
alter table crm_private.b07_pending_tasks force row level security;
create policy task_executor on crm_private.b07_pending_tasks to crm_h0_f2_executor using(true) with check(true);
create policy task_migration on crm_private.b07_pending_tasks to crm_h0_migration using(true) with check(true);
grant select,insert,update on crm_private.b07_pending_tasks to crm_h0_f2_executor;
grant select,insert on crm_private.b07_pending_tasks to crm_h0_migration;
revoke all on crm_private.b07_pending_tasks from public,crm_h0_runtime;
do $$ declare r text; begin foreach r in array array['anon','authenticated'] loop
 if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.b07_pending_tasks from %I',r); end if;
end loop; end $$;

create function crm_api.b07_task_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(result_ref uuid,replayed boolean)
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];m jsonb;i jsonb;a jsonb;actor uuid;scope text;opid uuid;target uuid;
 fingerprint text;causekey text;before_data jsonb;after_data jsonb;action text;
 op crm_private.b07_operations%rowtype;old crm_private.b07_pending_tasks%rowtype;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');
 tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'TASK_DENIED' using errcode='42501'; end if;
 v:=crm_f1.fields(q);if cardinality(v)<>2 or v[1]<>'CRM-H1-TASK-1' then raise exception 'TASK_INPUT_INVALID'; end if;
 m:=v[2]::jsonb;i:=m->'identity';a:=m->'material';actor:=hf[12]::uuid;scope:=hf[17];
 opid:=(m->>'operationId')::uuid;target:=(m->>'taskId')::uuid;action:=m->>'action';
 if action is null or action not in ('receive','update') or m->>'expectedRevision' is null or (m->>'expectedRevision')::bigint<0
  or m->>'purpose' is distinct from 'pending-followup' then raise exception 'TASK_INPUT_INVALID'; end if;
 if i is null or a is null or jsonb_typeof(i)<>'object' or jsonb_typeof(a)<>'object'
  or (i-array['causeKind','causeId','contextKind','contextId','scopeRef','relatedKind','relatedId','effect'])<>'{}'::jsonb
  or (a-array['title','deadline','priority','sourceRef','sourceVersion','triggerRef','triggerVersion'])<>'{}'::jsonb
  or i->>'causeKind' is null or i->>'causeKind' not in ('review','document','amount','data','block','advance','balance',
  'provider','invoice','suplido','participants_list','availability','modification','cancellation','proposal','final_participants')
  or nullif(i->>'causeId','') is null or nullif(i->>'scopeRef','') is null or nullif(i->>'effect','') is null
  or i->>'contextKind' is null or i->>'contextKind' not in ('contact','organization','opportunity','booking','booking_service','provider','proposal','other')
  or nullif(i->>'contextId','') is null or (i->>'relatedId' is null)<>(i->>'relatedKind' is null)
  or nullif(a->>'title','') is null or nullif(a->>'sourceRef','') is null or nullif(a->>'sourceVersion','') is null
  or nullif(a->>'triggerVersion','') is null or a->>'triggerRef' is null or a->>'triggerRef' not in ('manual','BR-TASK-005')
  or (a->>'triggerRef'='BR-TASK-005' and i->>'causeKind' in ('review','amount','data'))
  or nullif(m->>'reason','') is null then raise exception 'TASK_INPUT_INVALID'; end if;
 perform (i->>'contextId')::uuid;
 if ((a->'priority')-'kind'-'reason')<>'{}'::jsonb or a->'priority'->>'kind' is distinct from 'pending' or nullif(a->'priority'->>'reason','') is null then raise exception 'TASK_PRIORITY_UNVERIFIED'; end if;
 if a->'deadline'->>'kind'='unknown' then
  if nullif(a->'deadline'->>'reason','') is null or ((a->'deadline')-'kind'-'reason')<>'{}'::jsonb then raise exception 'TASK_DEADLINE_INVALID'; end if;
 elsif a->'deadline'->>'kind' in ('civil','instant','d020') then
  if nullif(a->'deadline'->>'sourceRef','') is null or nullif(a->'deadline'->>'version','') is null then raise exception 'TASK_DEADLINE_INVALID'; end if;
  if a->'deadline'->>'kind'='civil' then
   if ((a->'deadline')-array['kind','date','sourceRef','version'])<>'{}'::jsonb then raise exception 'TASK_DEADLINE_INVALID'; end if;
   if coalesce(a->'deadline'->>'date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'TASK_DEADLINE_INVALID'; end if; perform (a->'deadline'->>'date')::date;
  elsif a->'deadline'->>'kind'='instant' then
   if ((a->'deadline')-array['kind','at','sourceRef','version'])<>'{}'::jsonb then raise exception 'TASK_DEADLINE_INVALID'; end if;
   if coalesce(a->'deadline'->>'at','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' or nullif(a->'deadline'->>'at','') is null then raise exception 'TASK_DEADLINE_INVALID'; end if;
   perform (a->'deadline'->>'at')::timestamptz;
  else
   if ((a->'deadline')-array['kind','reference','daysBefore','sourceRef','version'])<>'{}'::jsonb
    or ((a->'deadline'->'reference')-array['scope','scopeId','date','zone','sourceRef','version','basis'])<>'{}'::jsonb
    or ((a->'deadline'->'reference'->'zone')-array['zone','sourceRef','version'])<>'{}'::jsonb then raise exception 'TASK_DEADLINE_INVALID'; end if;
   if a->'deadline'->>'daysBefore' is null or (a->'deadline'->>'daysBefore')::integer<0 or nullif(a->'deadline'->'reference'->>'sourceRef','') is null
    or nullif(a->'deadline'->'reference'->>'version','') is null
    or nullif(a->'deadline'->'reference'->'zone'->>'sourceRef','') is null
    or nullif(a->'deadline'->'reference'->'zone'->>'version','') is null then raise exception 'TASK_DEADLINE_INVALID'; end if;
   perform (a->'deadline'->'reference'->>'date')::date;
  end if;
 else raise exception 'TASK_DEADLINE_INVALID'; end if;
 fingerprint:=encode(crm_crypto.digest(convert_to(m::text,'UTF8'),'sha256'),'hex');
 causekey:=encode(crm_crypto.digest(convert_to(jsonb_build_object('version','h1-pending-cause-v1','identity',i)::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(opid::text,0));
 select * into op from crm_private.b07_operations where operation_id=opid;
 if found then
  if op.admin_scope<>scope or op.actor_id<>actor or op.fingerprint<>fingerprint then raise exception 'TASK_REPLAY_CONFLICT'; end if;
  result_ref:=op.result_ref;replayed:=true;
 else
  -- Protect absence too: unique cause index is the persisted backstop.
  perform pg_advisory_xact_lock(hashtextextended(scope||causekey,17));
  select * into old from crm_private.b07_pending_tasks where admin_scope=scope and identity_key=causekey for update;
  if action='update' and (old.task_id is null or old.task_id<>target) then raise exception 'TASK_IDENTITY_CONFLICT'; end if;
  if old.task_id is null then
   if action<>'receive' or (m->>'expectedRevision')::bigint<>0 then raise exception 'TASK_REVISION_CONFLICT'; end if;
   insert into crm_private.b07_pending_tasks(task_id,admin_scope,identity_version,identity_key,identity,material,state,responsible_actor,revision)
    values(target,scope,'h1-pending-cause-v1',causekey,i,a,'pending',actor,1);
  else
   if old.identity<>i then raise exception 'TASK_IDENTITY_CONFLICT'; end if;
   target:=old.task_id;before_data:=to_jsonb(old);
   if old.material<>a then
    if action<>'update' or old.revision<>(m->>'expectedRevision')::bigint then raise exception 'TASK_REVISION_CONFLICT'; end if;
    update crm_private.b07_pending_tasks set material=a,revision=revision+1,updated_at=clock_timestamp() where task_id=target;
   elsif action='update' and old.revision<>(m->>'expectedRevision')::bigint then raise exception 'TASK_REVISION_CONFLICT'; end if;
  end if;
  select to_jsonb(t) into after_data from crm_private.b07_pending_tasks t where task_id=target;
  insert into crm_private.b07_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref) values(opid,scope,actor,fingerprint,target);
  insert into crm_private.b07_history(history_id,operation_id,subject_id,admin_scope,action_kind,before_state,after_state,reason,source_ref,actor_id)
   values(opid,opid,target,scope,'task_'||action,before_data,after_data,m->>'reason',a->>'sourceRef',actor);
  result_ref:=target;replayed:=false;
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');
 perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return next;
end $$;

create function crm_api.b07_task_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];m jsonb;result jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');
 tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'TASK_DENIED'; end if;
 v:=crm_f1.fields(q);if cardinality(v)<>2 or v[1]<>'CRM-H1-TASK-READ1' then raise exception 'TASK_INPUT_INVALID'; end if;
 m:=v[2]::jsonb;
 if m->>'purpose' is distinct from 'pending-followup' then raise exception 'TASK_DENIED'; end if;
 select to_jsonb(t) into result from crm_private.b07_pending_tasks t where t.task_id=(m->>'taskId')::uuid
  and t.admin_scope=hf[17] and t.identity->>'contextKind'=m->>'contextKind' and t.identity->>'contextId'=m->>'contextId';
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');
 perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return result;
end $$;
alter function crm_api.b07_task_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
alter function crm_api.b07_task_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.b07_task_apply(bytea,bytea,bytea,bytea,bytea),crm_api.b07_task_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.b07_task_apply(bytea,bytea,bytea,bytea,bytea),crm_api.b07_task_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
