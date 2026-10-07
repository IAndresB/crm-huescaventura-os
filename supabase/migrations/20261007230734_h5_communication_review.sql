-- H5-005/006. Additive composition/provenance; existing B07 records, HA and Task stay authoritative.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'COMM_MIGRATION_AUTHORITY_REQUIRED';end if;end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b07_communication_work (
 work_id uuid primary key, record_id uuid not null references crm_private.b07_records(record_id),
 admin_scope text not null, kind text not null check(kind in ('draft','prepare','summary','note','candidate','sent','received','read','response')),
 identity_key text not null, material jsonb not null, original_id uuid references crm_private.b07_records(record_id),
 previous_id uuid references crm_private.b07_communication_work(work_id),
 task_id uuid references crm_private.b07_pending_tasks(task_id),
 recorded_by uuid not null references crm_private.crm_actors(actor_id),recorded_at timestamptz not null default clock_timestamp(),
 unique(admin_scope,identity_key)
);
create index b07_communication_work_record on crm_private.b07_communication_work(record_id,recorded_at,work_id);
alter table crm_private.b07_communication_work owner to crm_h0_f2_owner;
alter table crm_private.b07_communication_work enable row level security;
alter table crm_private.b07_communication_work force row level security;
create policy communication_executor on crm_private.b07_communication_work to crm_h0_f2_executor using(true) with check(true);
create policy communication_migration on crm_private.b07_communication_work to crm_h0_migration using(true) with check(true);
grant select,insert on crm_private.b07_communication_work to crm_h0_f2_executor,crm_h0_migration;
revoke all on crm_private.b07_communication_work from public,crm_h0_runtime;
do $$ declare r text;begin foreach r in array array['anon','authenticated'] loop
 if exists(select 1 from pg_roles where rolname=r)then execute format('revoke all on crm_private.b07_communication_work from %I',r);end if;
end loop;end $$;

-- Exact existing Human Approval fact: no new decisions, reservations or TTE authority.
create function crm_private.communication_approval(w crm_private.b07_communication_work)
returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare p record;f text[];expected jsonb;
begin
 if w.kind<>'draft' or not exists(select 1 from crm_private.b07_communication_work where kind='prepare' and previous_id=w.work_id)then return null;end if;
 expected:=jsonb_build_object('communicationId',w.record_id,'versionId',w.work_id,'material',w.material->'material');
 for p in select x.*,d.decision_id,d.actor_id,d.decided_at from crm_ha.proposals x join crm_ha.decisions d using(proposal_id)
 where x.scope=w.admin_scope and d.decision='approved' and d.material_fingerprint=x.material_fingerprint
 and exists(select 1 from crm_private.b07_communication_work prep where prep.kind='prepare' and prep.previous_id=w.work_id and prep.recorded_at<=d.decided_at) loop
 f:=crm_f1.fields(p.material_payload);
 if f[3]='communication-content' and f[4]=w.work_id::text and f[5]::jsonb=expected
 and f[6]='value' and f[7]=w.material->'material'->>'recipient' and f[8]='not-applicable'
 and f[10]='not-applicable' and f[12]=w.admin_scope and f[13]='authorize-content'
 and f[14]='not-applicable' and f[16]='none'
 and exists(select 1 from crm_ha.parts hp where hp.proposal_id=p.proposal_id
 and hp.material_payload=crm_f1.pack_fields(array['CRM-H0-HA-PART1',hp.part_id,f[3],f[4],f[5],f[6],f[7],f[8],f[9],f[10],f[11],f[12],f[13]])) then
 return jsonb_build_object('proposalId',p.proposal_id,'decisionId',p.decision_id,'actor',p.actor_id,'at',p.decided_at,'versionId',w.work_id);
 end if;
 end loop;
 return null;
end $$;
alter function crm_private.communication_approval(crm_private.b07_communication_work) owner to crm_h0_f2_owner;
revoke all on function crm_private.communication_approval(crm_private.b07_communication_work) from public;
grant execute on function crm_private.communication_approval(crm_private.b07_communication_work) to crm_h0_f2_executor;

-- Existing H1 fact storage remains canonical. Only roots extended by H5 receive the new exact-content guard.
create function crm_private.communication_fact_guard() returns trigger
language plpgsql set search_path=pg_catalog,pg_temp as $$
declare w crm_private.b07_communication_work%rowtype;e crm_private.b07_records%rowtype;version_ref text;
begin
 if new.record_kind<>'communication_fact' then return new;end if;
 if not exists(select 1 from crm_private.b07_communication_work where record_id=new.original_id and kind='draft')then return new;end if;
 select * into e from crm_private.b07_records where record_id=(new.material->>'evidence_id')::uuid and admin_scope=new.admin_scope;
 if e.record_id is null or e.record_kind<>'evidence' or e.purpose<>new.purpose or e.material->>'certainty'<>'reviewed'
 or e.material->>'source_kind'<>'manual' or e.occurred_at is distinct from new.occurred_at or e.material->>'coverage' is distinct from new.material->>'coverage'
 then raise exception 'COMM_PROOF_REQUIRED';end if;
 if new.material->>'fact_kind'='sent'then
 select * into w from crm_private.b07_communication_work x where x.record_id=new.original_id and x.kind='draft'
 and not exists(select 1 from crm_private.b07_communication_work y where y.kind='draft' and y.previous_id=x.work_id);
 if w.work_id is null or w.material->'material'->>'recipient' is distinct from new.material->>'party_ref'
 or w.material->'material'->>'coverage' is distinct from new.material->>'coverage' or not exists(select 1 from crm_private.b07_communication_work where kind='prepare' and previous_id=w.work_id)
 or (w.material->'material'->>'nature'='sensitive' and w.material->'material'->>'origin'='synthetic_automatic' and crm_private.communication_approval(w)is null) then raise exception 'COMM_APPROVAL_REQUIRED';end if;
 version_ref:=w.work_id::text;
 else version_ref:=split_part(e.material->>'claim',':',4);
 if version_ref<>'' and not exists(select 1 from crm_private.b07_communication_work where work_id::text=version_ref and record_id=new.original_id and kind='draft')then raise exception 'COMM_VERSION_CONFLICT';end if;end if;
 if e.material->>'claim' is distinct from concat('synthetic:',new.material->>'fact_kind',':',new.original_id,':',version_ref,':',new.material->>'party_ref')then raise exception 'COMM_PROOF_REQUIRED';end if;
 return new;
end $$;
alter function crm_private.communication_fact_guard() owner to crm_h0_f2_owner;
revoke all on function crm_private.communication_fact_guard() from public;
create trigger h5_communication_fact_guard before insert on crm_private.b07_records
 for each row execute function crm_private.communication_fact_guard();

create function crm_api.b07_communication_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare hf text[];tf text[];v text[];m jsonb;a text;scope text;actor uuid;opid uuid;id uuid;rid uuid;
 rec crm_private.b07_records%rowtype;orig crm_private.b07_records%rowtype;confirmed crm_private.b07_records%rowtype;
 old crm_private.b07_operations%rowtype;prior crm_private.b07_communication_work%rowtype;existing crm_private.b07_communication_work%rowtype;
 fingerprint text;identitykey text;kind text;original uuid;previous uuid;taskid uuid;body jsonb;allowed text[];
 proof crm_private.b07_records%rowtype;taskrow crm_private.b07_pending_tasks%rowtype;taskop uuid;taskmaterial jsonb;result jsonb;replayed boolean:=false;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'COMM_DENIED';end if;
 scope:=hf[17];actor:=hf[12]::uuid;v:=crm_f1.fields(q);
 if cardinality(v)<>2 or v[1]<>'CRM-H5-COMM-1'then raise exception 'COMM_INPUT_INVALID';end if;
 m:=v[2]::jsonb;a:=m->>'action';
 allowed:=array['contextKind','contextId','purpose','operationId','workId','recordId','reason','sourceRef','at','action'];
 if a='draft'then allowed:=allowed||array['previousId','material'];
 elsif a='prepare'then allowed:=allowed||array['versionId'];
 elsif a='derive'then allowed:=allowed||array['originalId','kind','content','origin','review','permissionRef','authorRef','confirmedId','confidence','field'];
 elsif a='fact'then allowed:=allowed||array['versionId','fact','evidenceId','party','coverage','ambiguous','synthetic'];
 else raise exception 'COMM_INPUT_INVALID';end if;
 if jsonb_typeof(m) is distinct from 'object' or m-allowed<>'{}'::jsonb or not(m ?& allowed)
 or exists(select 1 from unnest(array['contextKind','contextId','purpose','reason','sourceRef','at']) k where nullif(btrim(m->>k),'') is null)
 then raise exception 'COMM_INPUT_INVALID';end if;
 opid:=(m->>'operationId')::uuid;id:=(m->>'workId')::uuid;rid:=(m->>'recordId')::uuid;perform (m->>'at')::timestamptz;
 select * into rec from crm_private.b07_records r where r.record_id=rid and r.admin_scope=scope
 and r.purpose=m->>'purpose' and exists(select 1 from crm_private.b07_links l where l.record_id=r.record_id and l.admin_scope=scope and l.context_kind=m->>'contextKind' and l.context_id=(m->>'contextId')::uuid);
 if not found then raise exception 'COMM_DENIED';end if;
 fingerprint:=encode(crm_crypto.digest(convert_to(m::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(opid::text,0));
 select * into old from crm_private.b07_operations where operation_id=opid;
 if found then
 if old.admin_scope<>scope or old.actor_id<>actor or old.fingerprint<>fingerprint then raise exception 'COMM_REPLAY_CONFLICT';end if;
 id:=old.result_ref;replayed:=true;
 else
 -- Root lock protects absent revisions/derivatives too; no session singleton assumed.
 perform pg_advisory_xact_lock(hashtextextended(scope||rid::text,55));
 body:=m-array['operationId','workId','reason'];
 identitykey:=encode(crm_crypto.digest(convert_to(body::text,'UTF8'),'sha256'),'hex');
 select * into existing from crm_private.b07_communication_work where admin_scope=scope and identity_key=identitykey;
 if found then id:=existing.work_id;replayed:=true;
 else
 kind:=a;
 if a='draft'then
 if rec.record_kind<>'communication' or rec.material->>'direction'<>'outgoing' then raise exception 'COMM_DIRECTION_INVALID';end if;
 if jsonb_typeof(m->'material') is distinct from 'object' or (m->'material')-array['content','coverage','recipient','nature','origin','pending','sourceRef']<>'{}'::jsonb
 or not((m->'material') ?& array['content','coverage','recipient','nature','origin','pending','sourceRef'])
 or exists(select 1 from unnest(array['content','coverage','recipient','sourceRef']) k where nullif(btrim(m->'material'->>k),'') is null)
 or coalesce(m->'material'->>'nature','') not in ('informative','sensitive') or coalesce(m->'material'->>'origin','') not in ('human','synthetic_automatic')
 or jsonb_typeof(m->'material'->'pending') is distinct from 'array'
 or exists(select 1 from jsonb_array_elements(m->'material'->'pending') x where jsonb_typeof(x)<>'string' or nullif(btrim(x#>>'{}'),'')is null)
 then raise exception 'COMM_INPUT_INVALID';end if;
 select * into prior from crm_private.b07_communication_work where record_id=rid and kind='draft' order by recorded_at desc,work_id desc limit 1;
 previous:=(m->>'previousId')::uuid;
 if prior.work_id is distinct from previous then raise exception 'COMM_VERSION_CONFLICT';end if;
 elsif a='prepare'then
 previous:=(m->>'versionId')::uuid;
 select * into prior from crm_private.b07_communication_work where work_id=previous and record_id=rid and admin_scope=scope and kind='draft';
 if not found or exists(select 1 from crm_private.b07_communication_work where record_id=rid and kind='draft' and previous_id=previous) then raise exception 'COMM_VERSION_CONFLICT';end if;
 if exists(select 1 from crm_private.b07_communication_work where kind='prepare' and previous_id=previous)then raise exception 'COMM_ALREADY_PREPARED';end if;
 elsif a='derive'then
 original:=(m->>'originalId')::uuid;kind:=m->>'kind';
 select * into orig from crm_private.b07_records r where r.record_id=original and r.admin_scope=scope and r.purpose=m->>'purpose' and r.record_kind='document' and r.material->>'relation'='original'
 and exists(select 1 from crm_private.b07_links l where l.record_id=r.record_id and l.admin_scope=scope and l.context_kind=m->>'contextKind' and l.context_id=(m->>'contextId')::uuid);
 if not found then raise exception 'COMM_ORIGINAL_DENIED';end if;
 if kind not in ('summary','note','candidate')or coalesce(m->>'origin','') not in ('human','synthetic_automatic')
 or exists(select 1 from unnest(array['content','review','permissionRef','authorRef'])k where nullif(btrim(m->>k),'')is null)
 or (m->>'confidence'is not null and ((m->>'confidence')::numeric not between 0 and 1))then raise exception 'COMM_INPUT_INVALID';end if;
 if kind='candidate'then
 if m->>'origin'<>'synthetic_automatic' or nullif(m->>'field','')is null then raise exception 'COMM_INPUT_INVALID';end if;
 if m->>'confirmedId'is not null then
 select * into confirmed from crm_private.b07_records r where r.record_id=(m->>'confirmedId')::uuid and r.admin_scope=scope and r.purpose=m->>'purpose'
 and r.record_kind='evidence' and r.material->>'source_kind'='manual' and r.material->>'certainty'='reviewed'
 and exists(select 1 from crm_private.b07_links l where l.record_id=r.record_id and l.admin_scope=scope and l.context_kind=m->>'contextKind' and l.context_id=(m->>'contextId')::uuid);
 if not found then raise exception 'COMM_CONFIRMATION_DENIED';end if;
 end if;
 -- Every synthetic candidate has visible pending review. A manual confirmed reference requires follow-up.
 body:=body||jsonb_build_object('reviewState','pending','confirmedSnapshot',case when confirmed.record_id is null then null else confirmed.material end);
 if confirmed.record_id is not null then
 taskid:=gen_random_uuid();taskop:=gen_random_uuid();
 taskmaterial:=jsonb_build_object('action','receive','operationId',taskop,'taskId',taskid,'expectedRevision',0,'purpose','pending-followup',
 'identity',jsonb_build_object('causeKind','review','causeId',confirmed.record_id,'contextKind',m->>'contextKind','contextId',m->>'contextId','scopeRef',m->>'field','relatedKind',null,'relatedId',null,'effect','review-extraction'),
 'material',jsonb_build_object('title','Revisar extracción frente a dato confirmado','deadline',jsonb_build_object('kind','unknown','reason','Sin plazo aprobado'),'priority',jsonb_build_object('kind','pending','reason','Sin prioridad configurada'),'sourceRef',confirmed.record_id::text,'sourceVersion','1','triggerRef','manual','triggerVersion','1'),
 'reason','BR-AI-005: revisión de candidato sintético; no altera dato confirmado');
 select x.result_ref into taskid from crm_private.booking_preparation_task_core(taskmaterial,actor,scope)x;
 select * into taskrow from crm_private.b07_pending_tasks where task_id=taskid for update;
 if taskrow.state<>'pending' then
 perform crm_private.h5_task_lifecycle_core(jsonb_build_object('action','reopen','operationId',gen_random_uuid(),'taskId',taskid,
 'expectedRevision',taskrow.revision,'purpose','pending-followup','reason','Nuevo candidato material exige revisión explícita',
 'reviewEvidenceRef',id::text),actor,scope);
 end if;
 end if;
 end if;
 -- Reuse H1 Document/Evidence. The derived record is distinct from its source; no binary is fabricated.
 if kind='candidate'then
 insert into crm_private.b07_records(record_id,record_kind,admin_scope,material,source_ref,purpose,occurred_at,recorded_by)
 values(id,'evidence',scope,jsonb_build_object('claim',m->>'content','coverage',m->>'field','certainty','candidate','source_kind','document','document_id',original),m->>'sourceRef',m->>'purpose',(m->>'at')::timestamptz,actor);
 else
 insert into crm_private.b07_records(record_id,record_kind,admin_scope,material,source_ref,purpose,occurred_at,recorded_by,original_id)
 values(id,'document',scope,jsonb_build_object('relation','derived','content_ref',id::text,'content_kind',kind,'author_ref',m->>'authorRef','review_ref',m->>'review','storage_state','reference_only'),m->>'sourceRef',m->>'purpose',(m->>'at')::timestamptz,actor,original);
 end if;
 insert into crm_private.b07_links(link_id,record_id,admin_scope,context_kind,context_id,coverage,source_ref,linked_by)
 values(id,id,scope,m->>'contextKind',(m->>'contextId')::uuid,coalesce(m->>'field',kind),m->>'sourceRef',actor);
 elsif a='fact'then
 kind:=m->>'fact';previous:=(m->>'versionId')::uuid;
 if rec.record_kind<>'communication' or kind not in ('sent','received','read','response') or m->'synthetic' is distinct from 'true'::jsonb
 or jsonb_typeof(m->'ambiguous') is distinct from 'boolean' or nullif(btrim(m->>'party'),'')is null or nullif(btrim(m->>'coverage'),'')is null then raise exception 'COMM_INPUT_INVALID';end if;
 select * into proof from crm_private.b07_records r where r.record_id=(m->>'evidenceId')::uuid and r.admin_scope=scope and r.purpose=m->>'purpose' and r.record_kind='evidence'
 and r.material->>'certainty'='reviewed' and r.material->>'source_kind'='manual'
 and r.material->>'claim'=concat('synthetic:',kind,':',rid,':',coalesce(previous::text,''),':',m->>'party')
 and r.material->>'coverage'=m->>'coverage' and r.occurred_at=(m->>'at')::timestamptz
 and exists(select 1 from crm_private.b07_links l where l.record_id=r.record_id and l.admin_scope=scope and l.context_kind=m->>'contextKind' and l.context_id=(m->>'contextId')::uuid);
 if not found then raise exception 'COMM_PROOF_REQUIRED';end if;
 original:=proof.record_id;
 if kind='sent'then
 if m->>'contextKind'='proposal' and (nullif(rec.material->>'proposal_version_ref','')is null or nullif(rec.material->>'authorization_ref','')is null)then raise exception 'COMM_PROPOSAL_VERSION_REQUIRED';end if;
 select * into prior from crm_private.b07_communication_work where work_id=previous and record_id=rid and kind='draft' and admin_scope=scope;
 if not found or rec.material->>'direction'<>'outgoing' or prior.material->'material'->>'recipient'<>m->>'party' or prior.material->'material'->>'coverage'<>m->>'coverage'
 or exists(select 1 from crm_private.b07_communication_work where kind='draft' and previous_id=previous)
 or not exists(select 1 from crm_private.b07_communication_work where kind='prepare' and previous_id=prior.work_id)
 or (prior.material->'material'->>'nature'='sensitive' and prior.material->'material'->>'origin'='synthetic_automatic' and crm_private.communication_approval(prior)is null) then raise exception 'COMM_APPROVAL_REQUIRED';end if;
 end if;
 body:=body||jsonb_build_object('reviewState',case when kind='response'then 'pending'else null end,'businessConfirmation',false);
 if kind in ('sent','received','response')then
 insert into crm_private.b07_records(record_id,record_kind,admin_scope,material,source_ref,purpose,occurred_at,recorded_by,original_id)
 values(id,'communication_fact',scope,jsonb_build_object('fact_kind',kind,'evidence_id',proof.record_id,'party_ref',m->>'party','coverage',m->>'coverage'),m->>'sourceRef',m->>'purpose',(m->>'at')::timestamptz,actor,rid);
 insert into crm_private.b07_links(link_id,record_id,admin_scope,context_kind,context_id,coverage,source_ref,linked_by)
 values(id,id,scope,m->>'contextKind',(m->>'contextId')::uuid,m->>'coverage',m->>'sourceRef',actor);
 end if;
 end if;
 insert into crm_private.b07_communication_work(work_id,record_id,admin_scope,kind,identity_key,material,original_id,previous_id,task_id,recorded_by)
 values(id,rid,scope,kind,identitykey,body,original,previous,taskid,actor);
 end if;
 insert into crm_private.b07_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref)values(opid,scope,actor,fingerprint,id);
 insert into crm_private.b07_history(history_id,operation_id,subject_id,admin_scope,action_kind,before_state,after_state,reason,source_ref,occurred_at,actor_id)
 values(opid,opid,rid,scope,'communication_'||a,case when prior.work_id is null then null else to_jsonb(prior)end,jsonb_build_object('workId',id,'reused',replayed,'material',body),m->>'reason',m->>'sourceRef',(m->>'at')::timestamptz,actor);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 return jsonb_build_object('id',id,'replayed',replayed);
end $$;

create function crm_api.b07_communication_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare hf text[];tf text[];v text[];m jsonb;rec crm_private.b07_records%rowtype;result jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C"then raise exception 'COMM_DENIED';end if;
 v:=crm_f1.fields(q);if cardinality(v)<>2 or v[1]<>'CRM-H5-COMM-READ1'then raise exception 'COMM_INPUT_INVALID';end if;
 m:=v[2]::jsonb;if m-array['recordId','contextKind','contextId','purpose']<>'{}'::jsonb then raise exception 'COMM_INPUT_INVALID';end if;
 select * into rec from crm_private.b07_records r where r.record_id=(m->>'recordId')::uuid and r.admin_scope=hf[17] and r.purpose=m->>'purpose'
 and exists(select 1 from crm_private.b07_links l where l.record_id=r.record_id and l.admin_scope=hf[17] and l.context_kind=m->>'contextKind' and l.context_id=(m->>'contextId')::uuid);
 if found then
 select jsonb_build_object('record',to_jsonb(rec),'work',coalesce(jsonb_agg(to_jsonb(w)||jsonb_build_object(
 'approval',case when w.kind='draft'then crm_private.communication_approval(w)else null end,
 'prepared',exists(select 1 from crm_private.b07_communication_work p where p.kind='prepare'and p.previous_id=w.work_id),
 'objectConservation',case when w.original_id is null then null else coalesce((select jsonb_agg(jsonb_build_object('versionId',o.version_id,'state',o.state))from crm_private.b07_object_versions o where o.document_id=w.original_id and o.admin_scope=hf[17]),'[]'::jsonb)end
 )order by w.recorded_at,w.work_id)filter(where w.work_id is not null),'[]'::jsonb),'externalSendEnabled',false,
 'registeredFacts',coalesce((select jsonb_agg(to_jsonb(r) order by r.recorded_at,r.record_id)from crm_private.b07_records r where r.original_id=rec.record_id and r.record_kind='communication_fact'and r.admin_scope=hf[17] and r.purpose=m->>'purpose' and exists(select 1 from crm_private.b07_links l where l.record_id=r.record_id and l.admin_scope=hf[17] and l.context_kind=m->>'contextKind' and l.context_id=(m->>'contextId')::uuid)),'[]'::jsonb))
 into result from crm_private.b07_communication_work w where w.record_id=rec.record_id and w.admin_scope=hf[17]
 and w.material->>'purpose'=m->>'purpose' and w.material->>'contextKind'=m->>'contextKind' and w.material->>'contextId'=m->>'contextId';
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return result;
end $$;
alter function crm_api.b07_communication_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
alter function crm_api.b07_communication_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.b07_communication_apply(bytea,bytea,bytea,bytea,bytea),crm_api.b07_communication_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.b07_communication_apply(bytea,bytea,bytea,bytea,bytea),crm_api.b07_communication_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
