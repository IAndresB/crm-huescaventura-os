-- H2-007 / T02. Exact immutable Acceptance, explicit verification and error rectification.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'ACCEPTANCE_MIGRATION_AUTHORITY_REQUIRED';end if;end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b03_acceptances (
 acceptance_id uuid primary key,proposal_id uuid not null references crm_private.b03_proposals(proposal_id),
 opportunity_id uuid not null references crm_private.b03_opportunities(opportunity_id),
 version_id uuid not null references crm_private.b03_proposal_versions(version_id),admin_scope text not null,
 accepter_id uuid not null references crm_private.identity_entities(identity_id),
 designation_id uuid not null references crm_private.identity_designations(designation_id),
 channel text not null,coverage text not null,terms jsonb not null,content_snapshot jsonb not null,
 evidence_id uuid not null references crm_private.b07_records(record_id),
 authority_evidence_id uuid not null references crm_private.b07_records(record_id),
 communication_id uuid references crm_private.b07_records(record_id),occurred_at timestamptz not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),source_ref text not null,
 recorded_at timestamptz not null default clock_timestamp(),check(occurred_at<=recorded_at)
);
create unique index acceptance_real_fact_once on crm_private.b03_acceptances(version_id,coverage,evidence_id);
create table crm_private.b03_acceptance_operations (
 operation_id uuid primary key,acceptance_id uuid,proposal_id uuid not null references crm_private.b03_proposals(proposal_id),
 version_id uuid not null references crm_private.b03_proposal_versions(version_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,
 action text not null check(action in ('candidate','register','verify','rectify')),event jsonb not null,result jsonb not null,
 source_ref text not null,reason text not null,recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b03_acceptance_verifications (
 verification_id uuid primary key references crm_private.b03_acceptance_operations(operation_id) deferrable initially deferred,
 acceptance_id uuid not null unique references crm_private.b03_acceptances(acceptance_id),
 admin_scope text not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 material jsonb not null,won boolean not null,commercial_before jsonb not null,recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b03_acceptance_rectifications (
 rectification_id uuid primary key references crm_private.b03_acceptance_operations(operation_id) deferrable initially deferred,
 acceptance_id uuid not null unique references crm_private.b03_acceptances(acceptance_id),
 admin_scope text not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 evidence_id uuid not null references crm_private.b07_records(record_id),reason text not null,
 reevaluation jsonb not null,recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b03_acceptance_history (
 history_id uuid primary key references crm_private.b03_acceptance_operations(operation_id),admin_scope text not null,
 before_data jsonb,after_data jsonb not null,normative_ids jsonb not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),recorded_at timestamptz not null default clock_timestamp()
);
do $$ declare t text;r text;begin foreach t in array array['b03_acceptances','b03_acceptance_operations','b03_acceptance_verifications','b03_acceptance_rectifications','b03_acceptance_history'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);
 execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy acceptance_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy acceptance_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end $$;
-- Replace only the H2-001 temporary blanket prohibition, keeping ordinary write privileges denied.
do $$ declare n text;begin
 select conname into n from pg_constraint where conrelid='crm_private.b03_opportunities'::regclass and contype='c' and pg_get_constraintdef(oid)='CHECK ((state <> ''Aceptada / Ganada''::text))';
 if n is null then raise exception 'ACCEPTANCE_PREDECESSOR_CONSTRAINT_REQUIRED';end if;
 execute format('alter table crm_private.b03_opportunities drop constraint %I',n);
end $$;
create function crm_private.acceptance_won_guard() returns trigger language plpgsql set search_path=pg_catalog,pg_temp as $$
begin
 if new.state='Aceptada / Ganada' and not exists(select 1 from crm_private.b03_acceptance_verifications z join crm_private.b03_acceptances a using(acceptance_id)
 where a.opportunity_id=new.opportunity_id and a.admin_scope=new.admin_scope and z.won
 and not exists(select 1 from crm_private.b03_acceptance_rectifications r where r.acceptance_id=a.acceptance_id)) then raise exception 'ACCEPTANCE_VERIFIED_REQUIRED:SM-OP-07';end if;
 return new;
end $$;
alter function crm_private.acceptance_won_guard() owner to crm_h0_f2_owner;
revoke all on function crm_private.acceptance_won_guard() from public;
grant execute on function crm_private.acceptance_won_guard() to crm_h0_f2_executor,crm_h0_migration;
create trigger acceptance_won_guard before insert or update of state on crm_private.b03_opportunities for each row execute function crm_private.acceptance_won_guard();
create function crm_api.acceptance_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fields text[];a jsonb;p crm_private.b03_proposals;o crm_private.b03_opportunities;
 v crm_private.b03_proposal_versions;i crm_private.b03_offer_issuances;prior crm_private.b03_acceptance_operations;
 acc crm_private.b03_acceptances;com crm_private.b07_records;des crm_private.identity_designations;
 op uuid;aid uuid;root uuid;vid uuid;opp uuid;actor uuid;s text;action text;cov text;at_time timestamptz;
 fp text;res jsonb;norm jsonb;original jsonb;identified boolean;selectable boolean;valid boolean;proof_ok boolean;aspect text;
 stale_at timestamptz;reviewed boolean;destination text;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'ACCEPTANCE_DENIED';end if;
 fields:=crm_f1.fields(q);if cardinality(fields)<>2 or fields[1]<>'CRM-H2-ACCEPTANCE1' then raise exception 'ACCEPTANCE_INPUT_INVALID';end if;a:=fields[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or a-array['action','operationId','acceptanceId','proposalId','opportunityId','versionId','expectedRevision','expectedOpportunityRevision','sourceRef','reason','coverage','at','accepterId','designationId','channel','terms','evidenceId','communicationId','authorityEvidenceId','reviewEvidence','won','humanReviewed','reevaluation','origin']<>'{}'::jsonb
 or not(a ?& array['action','operationId','acceptanceId','proposalId','opportunityId','versionId','expectedRevision','expectedOpportunityRevision','sourceRef','reason','coverage','at'])
 or a->>'action' not in ('candidate','register','verify','rectify')
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or jsonb_typeof(a->'expectedOpportunityRevision') is distinct from 'number'
 or a->>'expectedRevision' !~ '^[0-9]+$' or a->>'expectedOpportunityRevision' !~ '^[0-9]+$'
 or exists(select 1 from jsonb_each(a) x where x.key in ('sourceRef','reason','coverage','at') and (jsonb_typeof(x.value)<>'string' or btrim(x.value#>>'{}')=''))
 or (a ? 'won' and jsonb_typeof(a->'won') is distinct from 'boolean')
 or (a ? 'humanReviewed' and jsonb_typeof(a->'humanReviewed') is distinct from 'boolean')
 or a->>'at' !~ '^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(Z|[+-]\d\d:\d\d)$' then raise exception 'ACCEPTANCE_INPUT_INVALID';end if;
 op:=(a->>'operationId')::uuid;aid:=(a->>'acceptanceId')::uuid;root:=(a->>'proposalId')::uuid;vid:=(a->>'versionId')::uuid;opp:=(a->>'opportunityId')::uuid;
 actor:=hf[12]::uuid;s:=hf[17];action:=a->>'action';cov:=a->>'coverage';at_time:=(a->>'at')::timestamptz;
 if at_time>clock_timestamp() then raise exception 'ACCEPTANCE_FUTURE_FACT';end if;
 if coalesce(a->>'origin','manual')<>'manual' then raise exception 'ACCEPTANCE_HUMAN_REVIEW_REQUIRED:G3';end if;
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(op::text,0));
 select * into prior from crm_private.b03_acceptance_operations where operation_id=op;
 if found then
  if prior.admin_scope<>s or prior.actor_id<>actor or prior.fingerprint<>fp then raise exception 'ACCEPTANCE_REPLAY_CONFLICT';end if;
  res:=jsonb_build_object('id',op,'replayed',true,'result',prior.result);
 else
  perform pg_advisory_xact_lock(hashtextextended(opp::text,31));
  select * into o from crm_private.b03_opportunities where opportunity_id=opp and admin_scope=s for update;
  if not found then raise exception 'ACCEPTANCE_RELATION_INVALID';end if;
  perform pg_advisory_xact_lock(hashtextextended(root::text,33));
  select * into p from crm_private.b03_proposals where proposal_id=root and opportunity_id=opp and admin_scope=s for update;
  if not found then raise exception 'ACCEPTANCE_RELATION_INVALID';end if;
  select * into v from crm_private.b03_proposal_versions where version_id=vid and proposal_id=root and admin_scope=s;
  if not found then raise exception 'ACCEPTANCE_RELATION_INVALID';end if;
  if p.revision<>(a->>'expectedRevision')::bigint or o.revision<>(a->>'expectedOpportunityRevision')::bigint then raise exception 'ACCEPTANCE_REVISION_CONFLICT:G6';end if;
  original:=jsonb_build_object('proposalRevision',p.revision,'opportunity',to_jsonb(o));
  select * into acc from crm_private.b03_acceptances where acceptance_id=aid and admin_scope=s;
  if acc.acceptance_id is not null and (acc.proposal_id<>root or acc.version_id<>vid or acc.opportunity_id<>opp or acc.coverage<>cov) then raise exception 'ACCEPTANCE_EXACT_RELATION_REQUIRED';end if;
  if action in ('candidate','register') then
   if acc.acceptance_id is not null then raise exception 'ACCEPTANCE_IMMUTABLE:SM-FORB-02';end if;
   select * into des from crm_private.identity_designations where designation_id=nullif(a->>'designationId','')::uuid and admin_scope=s;
   identified:=a ?& array['accepterId','designationId','channel','terms','evidenceId','authorityEvidenceId']
    and a->'terms'=v.content->'terms' and nullif(btrim(a->>'channel'),'') is not null
    and des.party_id=nullif(a->>'accepterId','')::uuid and des.context_id=opp and des.role_kind='primary_contact' and des.verified
    and coalesce(des.effective_at,des.recorded_at)<=at_time and (des.ended_at is null or des.ended_at>at_time)
    and exists(select 1 from crm_private.identity_entities e where e.identity_id=des.party_id and e.admin_scope=s and e.identity_kind='contact' and e.identity_verified)
    and crm_private.offer_evidence(nullif(a->>'authorityEvidenceId','')::uuid,opp,s,'acceptance:authority:'||vid||':'||(a->>'accepterId')||':'||(a->>'designationId'),cov,'-infinity',at_time);
   selectable:=cov=v.scope or exists(select 1 from crm_private.b03_proposal_modalities m where m.version_id=vid and m.modality_id::text=cov and m.independent and m.selectable)
    or exists(select 1 from crm_private.b03_proposal_lines l where l.version_id=vid and l.line_id::text=cov and l.independent and l.selectable);
   if action='register' and coalesce(identified,false) and selectable then
    if not exists(select 1 from crm_private.b07_records e join crm_private.b07_links l using(record_id) where e.record_id=(a->>'evidenceId')::uuid and e.admin_scope=s and l.admin_scope=s and l.context_id=opp and l.context_kind='opportunity' and l.coverage=cov and e.record_kind='evidence') then raise exception 'ACCEPTANCE_EVIDENCE_REQUIRED';end if;
    insert into crm_private.b03_acceptances(acceptance_id,proposal_id,opportunity_id,version_id,admin_scope,accepter_id,designation_id,channel,coverage,terms,content_snapshot,evidence_id,authority_evidence_id,communication_id,occurred_at,actor_id,source_ref)
     values(aid,root,opp,vid,s,(a->>'accepterId')::uuid,des.designation_id,a->>'channel',cov,v.content->'terms',v.content,(a->>'evidenceId')::uuid,(a->>'authorityEvidenceId')::uuid,nullif(a->>'communicationId','')::uuid,at_time,actor,a->>'sourceRef');
    res:=jsonb_build_object('registered',true,'verified',false,'won',false,'acceptanceId',aid);norm:=jsonb_build_array('SM-AC-01','DM-INV-009','DM-INV-010');
   else
    if not exists(select 1 from crm_private.b07_records e join crm_private.b07_links l using(record_id) where e.record_id=nullif(a->>'evidenceId','')::uuid and e.admin_scope=s and l.admin_scope=s and l.context_id=opp and l.context_kind='opportunity' and l.coverage=cov) then raise exception 'ACCEPTANCE_CANDIDATE_SOURCE_REQUIRED';end if;
    res:=jsonb_build_object('registered',false,'verified',false,'won',false,'pendingReview',true,'requiresNewVersion',not selectable);norm:=jsonb_build_array('SM-AC-01','SPEC-FR-ACC-003','E7');
   end if;
  elsif action='verify' then
   if acc.acceptance_id is null then raise exception 'ACCEPTANCE_REGISTERED_REQUIRED:SM-AC-02';end if;
   if exists(select 1 from crm_private.b03_acceptance_verifications where acceptance_id=aid) or exists(select 1 from crm_private.b03_acceptance_rectifications where acceptance_id=aid) then raise exception 'ACCEPTANCE_ALREADY_DECIDED';end if;
   if at_time<>acc.occurred_at then raise exception 'ACCEPTANCE_ACT_IMMUTABLE';end if;
   -- All verification facts refer to the immutable registration, not replacement request fields.
   if a ?| array['terms','accepterId','designationId','channel','evidenceId','authorityEvidenceId','communicationId'] then raise exception 'ACCEPTANCE_REGISTRATION_IMMUTABLE';end if;
   select * into i from crm_private.b03_offer_issuances where version_id=vid and admin_scope=s;
   select max(t) into stale_at from (
    select e.occurred_at t from crm_private.b03_offer_operations e where e.version_id=vid and e.action in ('reject','evaluate') and (e.action='reject' or e.result->'pending'='true') and e.occurred_at<=at_time and crm_private.offer_overlap(vid,e.coverage,cov)
    union all select z.recorded_at from crm_private.b03_proposal_versions z where z.replaces_version_id=vid and z.recorded_at<=at_time
   ) x;
   reviewed:=exists(select 1 from crm_private.b03_offer_operations e where e.version_id=vid and e.action='revalidate' and e.coverage=cov and e.event->>'actId'=aid::text and e.event->>'actKind'='accept' and e.occurred_at=at_time and e.occurred_at>=coalesce(stale_at,'-infinity') and not exists(select 1 from jsonb_each_text(e.event->'reviewEvidence') z left join crm_private.b07_records b on b.record_id=z.value::uuid where b.occurred_at>=at_time or b.record_id is null));
   valid:=i.version_id is not null and at_time>=i.issued_at and ((at_time<=i.effective_until and stale_at is null) or reviewed);
   proof_ok:=crm_private.offer_evidence(acc.evidence_id,opp,s,'acceptance:agree:'||vid||':'||aid||':'||acc.accepter_id||':'||acc.channel,cov,at_time,at_time);
   if acc.communication_id is not null then
    select * into com from crm_private.b07_records where record_id=acc.communication_id and admin_scope=s;
    proof_ok:=proof_ok and com.record_kind='communication' and com.material->>'direction'='incoming' and com.material->>'sender_ref'=acc.accepter_id::text and com.material->>'proposal_version_ref'=vid::text and com.material->>'coverage'=cov and com.material->>'channel'=acc.channel and com.occurred_at=at_time
     and exists(select 1 from crm_private.b07_links l where l.record_id=com.record_id and l.admin_scope=s and l.context_id=opp and l.context_kind='opportunity' and l.coverage=cov);
   elsif acc.channel not in ('phone','advance') then proof_ok:=false;
   end if;
   foreach aspect in array array['prices','availability','conditions','capacity'] loop
    proof_ok:=proof_ok and crm_private.offer_evidence((a->'reviewEvidence'->>aspect)::uuid,opp,s,'offer:review:'||vid||':'||aid||':accept:'||aspect,cov,coalesce(stale_at,i.issued_at),at_time);
   end loop;
   if not coalesce(valid,false) or not coalesce(proof_ok,false) then raise exception 'ACCEPTANCE_VERIFICATION_REQUIRED:SM-AC-02,SM-FORB-01';end if;
   if exists(select 1 from jsonb_array_elements(v.economics) e where (cov=v.scope or cov=e->>'modalityId' or exists(select 1 from crm_private.b03_proposal_lines l where l.version_id=vid and l.modality_id::text=e->>'modalityId' and l.line_id::text=cov)) and (e->'calculated'='null' or jsonb_array_length(e->'blockers')>0)) then raise exception 'ACCEPTANCE_MATERIAL_DATA_REQUIRED:G2';end if;
   if coalesce((a->>'won')::boolean,false) and o.state not in ('Nueva','En contacto','Necesidad definida','Propuesta en preparación','Propuesta enviada','Negociación / cambios') then raise exception 'ACCEPTANCE_ACTIVE_ORIGIN_REQUIRED:SM-OP-07';end if;
   insert into crm_private.b03_acceptance_verifications(verification_id,acceptance_id,admin_scope,actor_id,material,won,commercial_before) values(op,aid,s,actor,a,coalesce((a->>'won')::boolean,false),to_jsonb(o));
   if coalesce((a->>'won')::boolean,false) then
    insert into crm_private.b03_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref) values(op,s,actor,fp,opp);
    insert into crm_private.b03_history(history_id,subject_id,admin_scope,before_state,after_state,event,normative_ids,reason,source_ref,actor_id,occurred_at)
     values(op,opp,s,to_jsonb(o),jsonb_set(jsonb_set(to_jsonb(o),'{state}','"Aceptada / Ganada"'),'{revision}',to_jsonb(o.revision+1)),a,'["SM-OP-07"]',a->>'reason',a->>'sourceRef',actor,at_time);
    update crm_private.b03_opportunities set state='Aceptada / Ganada',revision=revision+1,updated_at=clock_timestamp() where opportunity_id=opp;
   end if;
   res:=jsonb_build_object('registered',true,'verified',true,'won',coalesce((a->>'won')::boolean,false),'acceptanceId',aid,'coverage',cov,'terms',acc.terms);
   norm:=jsonb_build_array('SM-AC-02','SM-PV-07','SM-OP-07','PLAN-T02');
  else
   if acc.acceptance_id is null or a->'humanReviewed' is distinct from 'true'::jsonb or exists(select 1 from crm_private.b03_acceptance_rectifications where acceptance_id=aid)
    or not crm_private.offer_evidence((a->>'evidenceId')::uuid,opp,s,'acceptance:error:'||aid,cov,'-infinity',at_time)
    or jsonb_typeof(a->'reevaluation') is distinct from 'object' or (a->'reevaluation')-array['destination','evidenceId','dependentEffects']<>'{}'::jsonb
    or a->'reevaluation'->'dependentEffects' is distinct from '["verification","commercial"]'::jsonb then raise exception 'ACCEPTANCE_ERROR_REVIEW_REQUIRED:SM-AC-03';end if;
   destination:=a->'reevaluation'->>'destination';
   if destination not in ('Nueva','En contacto','Necesidad definida','Propuesta en preparación','Propuesta enviada','Negociación / cambios')
    or not crm_private.offer_evidence((a->'reevaluation'->>'evidenceId')::uuid,opp,s,'acceptance:reevaluate:'||aid||':'||destination,cov,'-infinity',at_time) then raise exception 'ACCEPTANCE_CURRENT_COMMERCIAL_REVIEW_REQUIRED';end if;
   insert into crm_private.b03_acceptance_rectifications(rectification_id,acceptance_id,admin_scope,actor_id,evidence_id,reason,reevaluation) values(op,aid,s,actor,(a->>'evidenceId')::uuid,a->>'reason',a->'reevaluation');
   if o.state='Aceptada / Ganada' and not exists(select 1 from crm_private.b03_acceptance_verifications z join crm_private.b03_acceptances b using(acceptance_id) where b.opportunity_id=opp and z.won and not exists(select 1 from crm_private.b03_acceptance_rectifications r where r.acceptance_id=b.acceptance_id)) then
    insert into crm_private.b03_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref) values(op,s,actor,fp,opp);
    insert into crm_private.b03_history(history_id,subject_id,admin_scope,before_state,after_state,event,normative_ids,reason,source_ref,actor_id,occurred_at) values(op,opp,s,to_jsonb(o),jsonb_set(jsonb_set(to_jsonb(o),'{state}',to_jsonb(destination)),'{revision}',to_jsonb(o.revision+1)),a,'["SM-AC-03"]',a->>'reason',a->>'sourceRef',actor,at_time);
    update crm_private.b03_opportunities set state=destination,revision=revision+1,updated_at=clock_timestamp() where opportunity_id=opp;
   end if;
   res:=jsonb_build_object('rectified',true,'originalPreserved',true,'verificationUsable',false,'reevaluation',a->'reevaluation');norm:=jsonb_build_array('SM-AC-03','SM-FORB-02','SM-FORB-32','AC-075');
  end if;
  insert into crm_private.b03_acceptance_operations(operation_id,acceptance_id,proposal_id,version_id,admin_scope,actor_id,fingerprint,action,event,result,source_ref,reason) values(op,aid,root,vid,s,actor,fp,action,a,res,a->>'sourceRef',a->>'reason');
  insert into crm_private.b03_acceptance_history(history_id,admin_scope,before_data,after_data,normative_ids,actor_id) values(op,s,original,res,norm,actor);
  update crm_private.b03_proposals set revision=revision+1 where proposal_id=root;
  res:=jsonb_build_object('id',op,'replayed',false,'result',res);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return res;
end $$;
alter function crm_api.acceptance_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.acceptance_apply(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.acceptance_apply(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
create function crm_api.acceptance_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fields text[];a jsonb;res jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'ACCEPTANCE_DENIED';end if;
 fields:=crm_f1.fields(q);if cardinality(fields)<>2 or fields[1]<>'CRM-H2-ACCEPTANCE-READ1' then raise exception 'ACCEPTANCE_INPUT_INVALID';end if;a:=fields[2]::jsonb;
 if a-array['proposalId','versionId']<>'{}'::jsonb or not exists(select 1 from crm_private.b03_proposal_versions where version_id=(a->>'versionId')::uuid and proposal_id=(a->>'proposalId')::uuid and admin_scope=hf[17]) then raise exception 'ACCEPTANCE_DENIED';end if;
 select jsonb_build_object('facts',coalesce((select jsonb_agg(to_jsonb(z) order by z.recorded_at) from crm_private.b03_acceptances z where z.version_id=(a->>'versionId')::uuid and z.admin_scope=hf[17]),'[]'),
 'operations',coalesce((select jsonb_agg(to_jsonb(z) order by z.recorded_at) from crm_private.b03_acceptance_operations z where z.version_id=(a->>'versionId')::uuid and z.admin_scope=hf[17]),'[]')) into res;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return res;
end $$;
alter function crm_api.acceptance_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.acceptance_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.acceptance_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
