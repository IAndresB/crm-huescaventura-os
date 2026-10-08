-- H5-009: normalize event receipt/correlation on top of canonical B07 records.
-- Manual/test doubles only; this migration installs no transport or provider connector.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'BOUNDARY_MIGRATION_AUTHORITY_REQUIRED';end if;end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;

-- Add a bounded envelope field for the preserved normalized source payload.
-- Other B07 record kinds retain their original strict field allowlists.
create or replace function crm_private.b07_material_valid(k text,m jsonb,o uuid,t timestamptz)
returns boolean language plpgsql stable set search_path=pg_catalog,pg_temp as $$
begin
 if jsonb_typeof(m)<>'object' or m='{}'::jsonb then return false; end if;
 if k='document' then
  if m - 'relation' - 'content_ref' - 'content_kind' - 'author_ref' - 'review_ref' - 'storage_state' <> '{}'::jsonb
   or coalesce(m->>'relation','') not in ('original','derived') or nullif(m->>'content_ref','') is null
   or nullif(m->>'content_kind','') is null or coalesce(m->>'storage_state','')<>'reference_only'
   or (m->>'relation'='derived')<>(o is not null) then return false; end if;return true;
 elsif k='evidence' then
  if m - 'claim' - 'coverage' - 'certainty' - 'source_kind' - 'document_id' - 'channel' <> '{}'::jsonb
   or nullif(m->>'claim','') is null or nullif(m->>'coverage','') is null
   or coalesce(m->>'certainty','') not in ('candidate','reviewed')
   or coalesce(m->>'source_kind','') not in ('manual','document','communication','external')
   or ((m->>'source_kind'='document')<>(m ? 'document_id')) or o is not null or t is null then return false;end if;return true;
 elsif k='communication' then
  return m - 'direction' - 'channel' - 'sender_ref' - 'recipient_ref' - 'coverage' - 'initial_fact'
   - 'authorization_ref' - 'proposal_version_ref' = '{}'::jsonb and m->>'direction' in ('incoming','outgoing')
   and m->>'initial_fact'=case when m->>'direction'='incoming' then 'received' else 'none' end
   and nullif(m->>'channel','') is not null and nullif(m->>'coverage','') is not null
   and (m->>'direction'='incoming' or nullif(m->>'recipient_ref','') is not null) and o is null and t is not null;
 elsif k='communication_fact' then
  return m - 'fact_kind' - 'evidence_id' - 'party_ref' - 'coverage' = '{}'::jsonb
   and m->>'fact_kind' in ('sent','received','response') and nullif(m->>'evidence_id','') is not null
   and nullif(m->>'party_ref','') is not null and nullif(m->>'coverage','') is not null and o is not null and t is not null;
 elsif k='integration_source' then
  return m - 'source_kind' - 'label' = '{}'::jsonb and nullif(m->>'source_kind','') is not null
   and nullif(m->>'label','') is not null and o is null;
 elsif k='external_reference' then
  return m - 'source_id' - 'external_key' - 'coverage' = '{}'::jsonb and nullif(m->>'source_id','') is not null
   and nullif(m->>'external_key','') is not null and nullif(m->>'coverage','') is not null and o is null;
 elsif k='external_event' then
  return m - 'source_id' - 'external_key' - 'coverage' - 'review_state' - 'payload' = '{}'::jsonb
   and nullif(m->>'source_id','') is not null and nullif(m->>'coverage','') is not null
   and m->>'review_state'='pending' and jsonb_typeof(m->'payload')='object' and o is null and t is not null;
 end if;return false;
end $$;
alter function crm_private.b07_material_valid(text,jsonb,uuid,timestamptz) owner to crm_h0_f2_owner;
revoke execute on function crm_private.b07_material_valid(text,jsonb,uuid,timestamptz) from public;
grant execute on function crm_private.b07_material_valid(text,jsonb,uuid,timestamptz) to crm_h0_f2_executor;

create table crm_private.b09_external_event_keys(
 admin_scope text not null,
 source_id uuid not null references crm_private.b07_records(record_id),
 context_kind text not null,
 context_id uuid not null,
 coverage text not null,
 external_key text not null,
 event_id uuid not null references crm_private.b07_records(record_id),
 content_fingerprint text not null,
 occurred_at timestamptz,
 primary key(admin_scope,source_id,context_kind,context_id,coverage,external_key)
);
create table crm_private.b09_event_receipts(
 operation_id uuid primary key,
 admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),
 request_fingerprint text not null,
 source_id uuid not null references crm_private.b07_records(record_id),
 external_key text,
 received_event_id uuid not null,
 event_id uuid not null references crm_private.b07_records(record_id),
 receipt_state text not null check(receipt_state in ('applied','duplicate','conflict','review')),
 raw_material jsonb not null,
 raw_event jsonb not null,
 source_ref text not null,
 purpose text not null,
 received_at timestamptz not null default clock_timestamp()
);
do $$ declare t text;begin foreach t in array array['b09_external_event_keys','b09_event_receipts'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);
 execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy boundary_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy boundary_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime,crm_h0_ha_tx',t);
 end loop;end $$;

-- q is the ordinary signed H1 B07 request. This boundary serializes the external
-- identity and calls B07 in the same transaction, so event, operation, history,
-- idempotency receipt and correlation either commit together or roll back.
create function crm_api.b09_external_event_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
declare h text[];t text[];v text[];m jsonb;op uuid;source uuid;target uuid;ctx uuid;
 scope text;actor uuid;ext text;fp text;request_fp text;source_kind text;old crm_private.b09_event_receipts%rowtype;
 keyed crm_private.b09_external_event_keys%rowtype;result record;state text;eventid uuid;echoed boolean:=false;
begin
 h:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');
 t:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if h[17] collate "C"<>t[14] collate "C" then raise exception 'BOUNDARY_DENIED' using errcode='42501';end if;
 v:=crm_f1.fields(q);
 if cardinality(v)<>15 or v[1]<>'CRM-H1-B07-1' or v[2]<>'create' or v[5]<>'external_event'
   or v[7]='' or v[8]<>'external-boundary' or v[14]='' or v[15]='' then raise exception 'BOUNDARY_INPUT_INVALID' using errcode='22023';end if;
 op:=v[3]::uuid;target:=v[4]::uuid;m:=v[6]::jsonb;source:=(m->>'source_id')::uuid;ext:=nullif(btrim(m->>'external_key'),'');ctx:=v[13]::uuid;
 scope:=h[17];actor:=h[12]::uuid;
 if not coalesce(crm_private.b07_material_valid('external_event',m,nullif(v[10],'')::uuid,nullif(v[9],'')::timestamptz),false)
   or (m ? 'external_key' and ext is null) then raise exception 'BOUNDARY_INPUT_INVALID' using errcode='22023';end if;
 select s.material->>'source_kind' into source_kind from crm_private.b07_records s join crm_private.b07_links l on l.record_id=s.record_id
   where s.record_id=source and s.admin_scope=scope and s.record_kind='integration_source'
    and l.admin_scope=scope and l.context_kind=v[12] and l.context_id=ctx;
 if not found then raise exception 'BOUNDARY_DENIED' using errcode='42501';end if;
 request_fp:=encode(crm_crypto.digest(q,'sha256'),'hex');
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('b09-op:'||op::text,0));
 select * into old from crm_private.b09_event_receipts where operation_id=op;
 if found then
   if old.admin_scope<>scope or old.actor_id<>actor or old.request_fingerprint<>request_fp then raise exception 'B07_REPLAY_CONFLICT' using errcode='23505';end if;
   perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');
   perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
   return jsonb_build_object('id',old.event_id,'state',old.receipt_state,'replayed',true);
 end if;
 if ext is not null then
   perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('b09-key:'||scope||':'||source::text||':'||v[12]||':'||ctx::text||':'||v[15]||':'||ext,0));
   select * into keyed from crm_private.b09_external_event_keys
    where admin_scope=scope and source_id=source and context_kind=v[12] and context_id=ctx and coverage=v[15] and external_key=ext;
 end if;
 if ext is not null and found then
   fp:=encode(crm_crypto.digest(convert_to(jsonb_build_object('material',m,'occurred_at',nullif(v[9],''))::text,'UTF8'),'sha256'),'hex');
   if keyed.content_fingerprint=fp and keyed.occurred_at is not distinct from nullif(v[9],'')::timestamptz then state:='duplicate';else state:='conflict';end if;
   eventid:=keyed.event_id;
 else
   select * into result from crm_api.b07_apply(f2p,f2s,f1p,f1s,q);
   eventid:=result.result_ref;
   if ext is null then state:='review';else state:='applied';end if;
   if nullif(m->'payload'->>'echo_of_operation_id','') is not null then
     select exists(select 1 from crm_private.b08_attempts a join crm_private.b08_executions e using(execution_id)
       join crm_private.b08_definitions d on d.definition_id=e.definition_id and d.version=e.version
       where a.attempt_id=(m->'payload'->>'echo_of_operation_id')::uuid and a.admin_scope=scope and e.admin_scope=scope
        and d.context->>'contextId'=ctx::text and a.state in ('contacted','uncertain','succeeded')) into echoed;
     if echoed then state:='duplicate';else state:='review';end if;
   end if;
   if source_kind in ('avaibook','calendar','web') then state:='review';end if;
   if ext is not null then
     fp:=encode(crm_crypto.digest(convert_to(jsonb_build_object('material',m,'occurred_at',nullif(v[9],''))::text,'UTF8'),'sha256'),'hex');
     if state<>'review' then
       insert into crm_private.b09_external_event_keys(admin_scope,source_id,context_kind,context_id,coverage,external_key,event_id,content_fingerprint,occurred_at)
         values(scope,source,v[12],ctx,v[15],ext,eventid,fp,nullif(v[9],'')::timestamptz);
     end if;
   end if;
 end if;
 insert into crm_private.b09_event_receipts(operation_id,admin_scope,actor_id,request_fingerprint,source_id,external_key,received_event_id,event_id,receipt_state,raw_material,raw_event,source_ref,purpose)
   values(op,scope,actor,request_fp,source,ext,target,eventid,state,m,
    jsonb_build_object('target_id',target,'source_ref',v[7],'purpose',v[8],'occurred_at',nullif(v[9],''),
      'context_kind',v[12],'context_id',ctx,'coverage',v[15],'reason',v[14],'material',m),v[7],v[8]);
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');
 perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 return jsonb_build_object('id',eventid,'state',state,'replayed',false)||case when state='conflict' then jsonb_build_object('code','E2') else '{}'::jsonb end;
end $$;
alter function crm_api.b09_external_event_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.b09_external_event_apply(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.b09_external_event_apply(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
commit;
