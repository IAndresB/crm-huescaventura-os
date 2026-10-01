-- H2-003 only: preparation, immutable versions, manual commercial price. No send/Acceptance.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'PROPOSAL_MIGRATION_AUTHORITY_REQUIRED';end if;end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b03_proposals (
 proposal_id uuid primary key, opportunity_id uuid not null references crm_private.b03_opportunities(opportunity_id),
 admin_scope text not null,revision bigint not null check(revision>0),last_version_number bigint not null default 0,
 source_ref text not null,actor_id uuid not null references crm_private.crm_actors(actor_id),created_at timestamptz not null default clock_timestamp()
);
create index proposal_opportunity on crm_private.b03_proposals(admin_scope,opportunity_id);
-- Editable working content uses optimistic revision; retained edits are append-only preparations, never fixed versions.
create table crm_private.b03_preparations (
 preparation_id uuid primary key,proposal_id uuid not null references crm_private.b03_proposals(proposal_id),
 admin_scope text not null,revision bigint not null,content jsonb not null,economics jsonb not null,sources jsonb not null,
 base_version_id uuid,reviewed boolean not null,source_ref text not null,reason text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),recorded_at timestamptz not null default clock_timestamp(),unique(proposal_id,revision)
);
create table crm_private.b03_proposal_versions (
 version_id uuid primary key,proposal_id uuid not null references crm_private.b03_proposals(proposal_id),
 preparation_id uuid not null unique references crm_private.b03_preparations(preparation_id),version_number bigint not null check(version_number>0),
 admin_scope text not null,scope text not null,terms_version text not null,terms_text text not null,terms_source text not null,
 pending jsonb not null,content jsonb not null,economics jsonb not null,sources jsonb not null,
 replaces_version_id uuid references crm_private.b03_proposal_versions(version_id),reason text not null,source_ref text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),recorded_at timestamptz not null default clock_timestamp(),unique(proposal_id,version_number)
);
alter table crm_private.b03_preparations add foreign key(base_version_id) references crm_private.b03_proposal_versions(version_id);
create table crm_private.b03_proposal_modalities (
 version_id uuid not null references crm_private.b03_proposal_versions(version_id),modality_id uuid not null,
 name text not null,participants bigint not null check(participants>0),independent boolean not null,selectable boolean not null,
 pack_revision_id uuid references crm_private.commercial_revisions(revision_id),conditions text not null,
 final_person_price numeric,definitive boolean not null,admin_scope text not null,
 primary key(version_id,modality_id),check(not selectable or independent),check(final_person_price>=0)
);
create table crm_private.b03_proposal_lines (
 version_id uuid not null,modality_id uuid not null,line_id uuid not null,
 service_revision_id uuid not null references crm_private.catalog_revisions(revision_id),
 unit_revision_id uuid not null references crm_private.catalog_revisions(revision_id),
 tariff_revision_id uuid references crm_private.commercial_revisions(revision_id),
 quantity numeric,included boolean not null,independent boolean not null,selectable boolean not null,
 service_date date,date_pending boolean not null,price_basis text not null check(price_basis in ('fixed','quantity')),
 cost_material boolean not null,source_ref text not null,estimate_rule_evidence_id uuid references crm_private.b07_records(record_id),admin_scope text not null,
 primary key(version_id,line_id),foreign key(version_id,modality_id) references crm_private.b03_proposal_modalities(version_id,modality_id),
 check(not selectable or independent),check(not included or quantity>0),check(service_date is not null or date_pending)
);
create table crm_private.b03_proposal_operations (
 operation_id uuid primary key,proposal_id uuid not null references crm_private.b03_proposals(proposal_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,result_ref uuid not null,
 action text not null,source_ref text not null,reason text not null,recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b03_proposal_history (
 history_id uuid primary key references crm_private.b03_proposal_operations(operation_id),proposal_id uuid not null references crm_private.b03_proposals(proposal_id),
 admin_scope text not null,before_data jsonb,after_data jsonb not null,event jsonb not null,normative_ids jsonb not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),source_ref text not null,reason text not null,recorded_at timestamptz not null default clock_timestamp()
);
create index proposal_history_root on crm_private.b03_proposal_history(admin_scope,proposal_id,recorded_at);
do $$ declare t text;begin foreach t in array array['b03_proposals','b03_preparations','b03_proposal_versions','b03_proposal_modalities','b03_proposal_lines','b03_proposal_operations','b03_proposal_history'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);
 execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy proposal_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy proposal_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
end loop;end $$;
grant update(revision,last_version_number) on crm_private.b03_proposals to crm_h0_f2_executor;

create function crm_api.proposal_sources(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];m jsonb;r text;data jsonb:='[]';s jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'PROPOSAL_DENIED';end if;
 v:=crm_f1.fields(q);if cardinality(v)<>2 or v[1]<>'CRM-H2-PROP-SOURCES1' then raise exception 'PROPOSAL_INPUT_INVALID';end if;m:=v[2]::jsonb;
 if not exists(select 1 from crm_private.b03_opportunities where opportunity_id=(m->>'opportunityId')::uuid and admin_scope=hf[17]) then raise exception 'PROPOSAL_OPPORTUNITY_REQUIRED';end if;
 for r in select jsonb_array_elements_text(m->'references') loop
  s:=null;
  select jsonb_build_object('id',c.revision_id,'kind',i.item_kind,'definition',c.definition,'sourceRef',c.source_ref,'version',c.revision_number::text) into s
   from crm_private.catalog_revisions c join crm_private.catalog_items i using(item_id) where c.revision_id=r::uuid and c.admin_scope=hf[17];
  if s is null then select jsonb_build_object('id',c.revision_id,'kind',i.item_kind,'definition',c.definition,'sourceRef',c.source_ref,'version',c.revision_number::text) into s
   from crm_private.commercial_revisions c join crm_private.commercial_items i using(item_id) where c.revision_id=r::uuid and c.admin_scope=hf[17];end if;
  if s is null then select jsonb_build_object('id',c.record_id,'kind',c.record_kind,'definition',c.material,'sourceRef',c.source_ref,'version','1') into s
   from crm_private.b07_records c join crm_private.b07_links l using(record_id) where c.record_id=r::uuid and c.admin_scope=hf[17] and l.context_id=(m->>'opportunityId')::uuid and l.context_kind='opportunity' limit 1;end if;
  if s is null then raise exception 'PROPOSAL_SOURCE_INVALID';end if;data:=data||jsonb_build_array(s);
 end loop;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return data;
end $$;

create function crm_private.proposal_content_guard(c jsonb,fix boolean) returns boolean language plpgsql immutable set search_path=pg_catalog,pg_temp as $$
declare m jsonb;l jsonb;
begin
 if jsonb_typeof(c) is distinct from 'object' or c-array['scope','terms','pending','modalities']<>'{}'::jsonb
  or jsonb_typeof(c->'scope') is distinct from 'string' or nullif(btrim(c->>'scope'),'') is null
  or jsonb_typeof(c->'pending') is distinct from 'array' or jsonb_typeof(c->'modalities') is distinct from 'array' or jsonb_array_length(c->'modalities')=0
  or jsonb_typeof(c->'terms') is distinct from 'object' or not((c->'terms') ?& array['version','text','sourceRef'])
  or exists(select 1 from jsonb_each(c->'terms') x where jsonb_typeof(x.value)<>'string' or btrim(x.value#>>'{}')='')
  or exists(select 1 from jsonb_array_elements(c->'pending') x where jsonb_typeof(x)<>'string' or btrim(x#>>'{}')='') then return false;end if;
 for m in select jsonb_array_elements(c->'modalities') loop
  if not(m ?& array['id','name','participants','independent','selectable','conditions','finalPersonPrice','manualReason','definitive','lines'])
   or jsonb_typeof(m->'name')<>'string' or nullif(btrim(m->>'name'),'') is null or nullif(btrim(m->>'conditions'),'') is null or nullif(btrim(m->>'manualReason'),'') is null
   or jsonb_typeof(m->'lines')<>'array' or jsonb_array_length(m->'lines')=0
   or m->'independent' not in ('true','false') or m->'selectable' not in ('true','false') or m->'definitive' not in ('true','false')
   or m->'selectable'='true' and m->'independent'<>'true'
   or (fix and (m->>'participants' is null or m->>'participants' !~ '^[1-9][0-9]*$')) then return false;end if;
  for l in select jsonb_array_elements(m->'lines') loop
   if not(l ?& array['id','serviceRevisionId','unitRevisionId','quantity','included','independent','selectable','date','datePending','priceBasis','costMaterial','sourceRef'])
    or nullif(btrim(l->>'sourceRef'),'') is null or l->'selectable'='true' and l->'independent'<>'true'
    or l->'included' not in ('true','false') or l->'datePending' not in ('true','false')
    or l->>'priceBasis' not in ('fixed','quantity') or (l->>'date' is null and l->'datePending'<>'true')
    or (fix and l->'included'='true' and (l->>'quantity' is null or l->>'quantity' !~ '^[0-9]+(\.[0-9]+)?$' or (l->>'quantity')::numeric<=0)) then return false;end if;
  end loop;
 end loop;return true;
end $$;
revoke all on function crm_private.proposal_content_guard(jsonb,boolean) from public;
grant execute on function crm_private.proposal_content_guard(jsonb,boolean) to crm_h0_f2_executor;

create function crm_api.proposal_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,cf2p bytea,cf2s bytea,cf1p bytea,cf1s bytea,cq bytea)
returns table(result_ref uuid,replayed boolean) language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];a jsonb;c jsonb;econ jsonb;sources jsonb;m jsonb;l jsonb;prior jsonb;after_data jsonb;norm jsonb;
 actor uuid;scope text;opid uuid;root uuid;opp uuid;fp text;action text;versionid uuid;base uuid;prep crm_private.b03_preparations%rowtype;
 p crm_private.b03_proposals%rowtype;pv crm_private.b03_proposal_versions%rowtype;o crm_private.b03_opportunities%rowtype;operation crm_private.b03_proposal_operations%rowtype;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'PROPOSAL_DENIED';end if;
 v:=crm_f1.fields(q);if cardinality(v)<>2 or v[1]<>'CRM-H2-PROP-1' then raise exception 'PROPOSAL_INPUT_INVALID';end if;
 a:=v[2]::jsonb;actor:=hf[12]::uuid;scope:=hf[17];root:=(a->>'proposalId')::uuid;opp:=(a->>'opportunityId')::uuid;opid:=(a->>'operationId')::uuid;
 action:=a->>'action';base:=nullif(a->>'baseVersionId','')::uuid;versionid:=nullif(a->>'versionId','')::uuid;
 if a-array['action','operationId','proposalId','opportunityId','expectedRevision','expectedOpportunityRevision','sourceRef','reason','content','baseVersionId','reviewed','versionId','partId','requestEvidenceId','economics','sources']<>'{}'::jsonb
  or action is null or action not in ('prepare','fix','partial_request') or jsonb_typeof(a->'sourceRef') is distinct from 'string' or jsonb_typeof(a->'reason') is distinct from 'string'
  or nullif(btrim(a->>'sourceRef'),'') is null or nullif(btrim(a->>'reason'),'') is null then raise exception 'PROPOSAL_INPUT_INVALID';end if;
 fp:=encode(crm_crypto.digest(convert_to((a-array['economics','sources'])::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(opid::text,0));
 select * into operation from crm_private.b03_proposal_operations where operation_id=opid;
 if found then
  if operation.admin_scope<>scope or operation.actor_id<>actor or operation.fingerprint<>fp then raise exception 'PROPOSAL_REPLAY_CONFLICT';end if;
  result_ref:=operation.result_ref;replayed:=true;
 else
  -- Same existing Opportunity lock order as H2-001, followed by Proposal root.
  perform pg_advisory_xact_lock(hashtextextended(opp::text,31));
  select * into o from crm_private.b03_opportunities where opportunity_id=opp and admin_scope=scope for update;
  if not found then raise exception 'PROPOSAL_OPPORTUNITY_REQUIRED';end if;
  perform pg_advisory_xact_lock(hashtextextended(root::text,33));
  select * into p from crm_private.b03_proposals where proposal_id=root and admin_scope=scope for update;
  if p.proposal_id is not null and p.opportunity_id<>opp then raise exception 'PROPOSAL_RELATION_INVALID';end if;
  if coalesce(p.revision,0)<>(a->>'expectedRevision')::bigint then raise exception 'PROPOSAL_REVISION_CONFLICT';end if;
  if action='prepare' then
   c:=a->'content';econ:=a->'economics';sources:=a->'sources';
   if versionid is not null or not crm_private.proposal_content_guard(c,false) or jsonb_typeof(econ) is distinct from 'array' or jsonb_typeof(sources) is distinct from 'array' or jsonb_array_length(sources)=0 then raise exception 'PROPOSAL_BLOCKED:SM-PV-01';end if;
   if o.revision<>(a->>'expectedOpportunityRevision')::bigint then raise exception 'PROPOSAL_OPPORTUNITY_REVISION_CONFLICT';end if;
   if o.state not in ('Nueva','En contacto','Necesidad definida','Propuesta en preparación','Propuesta enviada','Negociación / cambios') then raise exception 'PROPOSAL_BLOCKED:SM-OP-04';end if;
   if base is not null then
    select * into pv from crm_private.b03_proposal_versions where version_id=base and proposal_id=root;
    if not found or a->'reviewed' is distinct from 'true'::jsonb or pv.content=c then raise exception 'PROPOSAL_BLOCKED:SM-PV-06';end if;prior:=to_jsonb(pv);
   elsif p.last_version_number>0 then raise exception 'PROPOSAL_BASE_VERSION_REQUIRED';end if;
   -- Enforce real, scoped and matching sources at the persistence boundary too.
   for m in select jsonb_array_elements(c->'modalities') loop
    if m ? 'packRevisionId' and not exists(select 1 from crm_private.commercial_revisions r join crm_private.commercial_items i using(item_id) where r.revision_id=(m->>'packRevisionId')::uuid and r.admin_scope=scope and i.item_kind in ('pack','custom_pack')) then raise exception 'PROPOSAL_SOURCE_INVALID';end if;
    for l in select jsonb_array_elements(m->'lines') loop
     if not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(l->>'serviceRevisionId')::uuid and r.admin_scope=scope and i.item_kind='service')
      or not exists(select 1 from crm_private.catalog_revisions r join crm_private.catalog_items i using(item_id) where r.revision_id=(l->>'unitRevisionId')::uuid and r.admin_scope=scope and i.item_kind='unit') then raise exception 'PROPOSAL_SOURCE_INVALID';end if;
     if l ? 'tariffRevisionId' and not exists(select 1 from crm_private.commercial_revisions r join crm_private.commercial_items i using(item_id) join crm_private.catalog_revisions sr on sr.revision_id=(l->>'serviceRevisionId')::uuid where r.revision_id=(l->>'tariffRevisionId')::uuid and r.admin_scope=scope and i.item_kind='tariff' and i.catalog_item_id=sr.item_id and r.definition->>'unit_revision_id'=l->>'unitRevisionId') then raise exception 'PROPOSAL_SOURCE_INVALID';end if;
    end loop;
   end loop;
   if p.proposal_id is null then
    insert into crm_private.b03_proposals(proposal_id,opportunity_id,admin_scope,revision,source_ref,actor_id) values(root,opp,scope,1,a->>'sourceRef',actor);
    if crm_f1.fields(cq) is distinct from array['CRM-H1-RESOLVE1','assign_code',root::text,root::text,'','PR',a->>'sourceRef',a->>'sourceRef',a->>'reason','0'] then raise exception 'PROPOSAL_CODE_CONTRACT_INVALID';end if;
    perform crm_api.identity_resolve(cf2p,cf2s,cf1p,cf1s,cq);
   else update crm_private.b03_proposals set revision=revision+1 where proposal_id=root;end if;
   insert into crm_private.b03_preparations(preparation_id,proposal_id,admin_scope,revision,content,economics,sources,base_version_id,reviewed,source_ref,reason,actor_id)
    values(opid,root,scope,coalesce(p.revision,0)+1,c,econ,sources,base,coalesce((a->>'reviewed')::boolean,false),a->>'sourceRef',a->>'reason',actor);
   select to_jsonb(t) into after_data from crm_private.b03_preparations t where preparation_id=opid;
   -- Actual preparation and commercial progress are one T01 unit; no invented stages.
   insert into crm_private.b03_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref) values(opid,scope,actor,fp,opp);
   insert into crm_private.b03_history(history_id,subject_id,admin_scope,before_state,after_state,event,normative_ids,reason,source_ref,actor_id)
    values(opid,opp,scope,to_jsonb(o),jsonb_set(jsonb_set(to_jsonb(o),'{state}','"Propuesta en preparación"'),'{revision}',to_jsonb(o.revision+1)),jsonb_build_object('type','prepare','alternativeRef',root,'pending',c->'pending'),jsonb_build_array('SM-OP-04'),a->>'reason',a->>'sourceRef',actor);
   update crm_private.b03_opportunities set state='Propuesta en preparación',revision=revision+1,updated_at=clock_timestamp() where opportunity_id=opp;
   result_ref:=opid;norm:=jsonb_build_array('SM-PV-01','SM-OP-04',case when base is not null then 'SM-PV-06' else 'PLAN-T01' end);
  elsif action='fix' then
   if p.proposal_id is null or versionid is null or a ? 'content' then raise exception 'PROPOSAL_BLOCKED:SM-PV-02';end if;
   select * into prep from crm_private.b03_preparations where proposal_id=root order by revision desc limit 1;
   if prep.preparation_id is null or exists(select 1 from crm_private.b03_proposal_versions where preparation_id=prep.preparation_id) or not crm_private.proposal_content_guard(prep.content,true) then raise exception 'PROPOSAL_BLOCKED:SM-PV-02';end if;
   for m in select jsonb_array_elements(prep.content->'modalities') loop
    if m->'definitive'='true'::jsonb and (m->>'finalPersonPrice' is null or exists(select 1 from jsonb_array_elements(prep.economics) e where e->>'modalityId'=m->>'id' and (e->'calculated'='null'::jsonb or jsonb_array_length(e->'blockers')>0))) then raise exception 'PROPOSAL_DEPENDENT_PRICE_BLOCKED:AC-010';end if;
   end loop;
   c:=prep.content;prior:=to_jsonb(prep);
   insert into crm_private.b03_proposal_versions(version_id,proposal_id,preparation_id,version_number,admin_scope,scope,terms_version,terms_text,terms_source,pending,content,economics,sources,replaces_version_id,reason,source_ref,actor_id)
    values(versionid,root,prep.preparation_id,p.last_version_number+1,scope,c->>'scope',c->'terms'->>'version',c->'terms'->>'text',c->'terms'->>'sourceRef',c->'pending',c,prep.economics,prep.sources,prep.base_version_id,a->>'reason',a->>'sourceRef',actor);
   for m in select jsonb_array_elements(c->'modalities') loop
    insert into crm_private.b03_proposal_modalities values(versionid,(m->>'id')::uuid,m->>'name',(m->>'participants')::bigint,(m->>'independent')::boolean,(m->>'selectable')::boolean,nullif(m->>'packRevisionId','')::uuid,m->>'conditions',(m->>'finalPersonPrice')::numeric,(m->>'definitive')::boolean,scope);
    for l in select jsonb_array_elements(m->'lines') loop
     insert into crm_private.b03_proposal_lines values(versionid,(m->>'id')::uuid,(l->>'id')::uuid,(l->>'serviceRevisionId')::uuid,(l->>'unitRevisionId')::uuid,nullif(l->>'tariffRevisionId','')::uuid,(l->>'quantity')::numeric,(l->>'included')::boolean,(l->>'independent')::boolean,(l->>'selectable')::boolean,(l->>'date')::date,(l->>'datePending')::boolean,l->>'priceBasis',(l->>'costMaterial')::boolean,l->>'sourceRef',nullif(l->>'estimateRuleEvidenceId','')::uuid,scope);
    end loop;
   end loop;
   update crm_private.b03_proposals set revision=revision+1,last_version_number=last_version_number+1 where proposal_id=root;
   select to_jsonb(t) into after_data from crm_private.b03_proposal_versions t where version_id=versionid;result_ref:=versionid;norm:=jsonb_build_array('SM-PV-02','PLAN-T01');
  else
   if p.proposal_id is null or versionid is null or a ? 'content' or not exists(select 1 from crm_private.b03_proposal_versions where version_id=versionid and proposal_id=root) then raise exception 'PROPOSAL_RELATION_INVALID';end if;
   if not exists(select 1 from crm_private.b07_records r join crm_private.b07_links l using(record_id) where r.record_id=(a->>'requestEvidenceId')::uuid and r.admin_scope=scope and l.context_id=opp and (r.record_kind='communication' and r.material->>'direction'='incoming' or r.record_kind='evidence' and r.material->>'certainty'='reviewed')) then raise exception 'PROPOSAL_REQUEST_EVIDENCE_REQUIRED';end if;
   if not exists(select 1 from crm_private.b03_proposal_lines where version_id=versionid and line_id=(a->>'partId')::uuid and not selectable) then raise exception 'PROPOSAL_NONSELECTION_REQUIRED';end if;
   after_data:=jsonb_build_object('versionId',versionid,'partId',a->>'partId','requestEvidenceId',a->>'requestEvidenceId','requiresNewVersion',true,'acceptanceCreated',false);
   result_ref:=opid;norm:=jsonb_build_array('AC-013','SPEC-FR-ACC-003');
  end if;
  insert into crm_private.b03_proposal_operations values(opid,root,scope,actor,fp,result_ref,action,a->>'sourceRef',a->>'reason',clock_timestamp());
  insert into crm_private.b03_proposal_history values(opid,root,scope,prior,after_data,a-array['economics','sources'],norm,actor,a->>'sourceRef',a->>'reason',clock_timestamp());replayed:=false;
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return next;
end $$;

create function crm_api.proposal_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];a jsonb;root uuid;vid uuid;data jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'PROPOSAL_DENIED';end if;
 v:=crm_f1.fields(q);if cardinality(v)<>2 or v[1]<>'CRM-H2-PROP-READ1' then raise exception 'PROPOSAL_INPUT_INVALID';end if;a:=v[2]::jsonb;root:=(a->>'proposalId')::uuid;
 if not exists(select 1 from crm_private.b03_proposals where proposal_id=root and admin_scope=hf[17]) then raise exception 'PROPOSAL_DENIED';end if;
 vid:=nullif(a->>'versionId','')::uuid;
 if a->>'kind'='preparation' then select to_jsonb(t) into data from crm_private.b03_preparations t where proposal_id=root order by revision desc limit 1;
 elsif a->>'kind'='history' then select jsonb_agg(to_jsonb(t) order by recorded_at,history_id) into data from crm_private.b03_proposal_history t where proposal_id=root;
 elsif a->>'kind'='internal' then select to_jsonb(t)||jsonb_build_object('human_code',ic.human_code) into data from crm_private.b03_proposal_versions t join crm_private.identity_codes ic on ic.target_id=root and ic.code_kind='PR' where t.proposal_id=root and (vid is null or version_id=vid) order by version_number desc limit 1;
 elsif a->>'kind'='commercial' then
  if vid is null then select version_id into vid from crm_private.b03_proposal_versions where proposal_id=root order by version_number desc limit 1;end if;
  if not exists(select 1 from crm_private.b03_proposal_versions where version_id=vid and proposal_id=root) then raise exception 'PROPOSAL_DENIED';end if;
  select coalesce(jsonb_agg(jsonb_build_object('finalPersonPrice',case when final_person_price is null then null when m.definitive then to_jsonb(to_char(final_person_price,'FM9999999999999999999999999999990.00')) else jsonb_build_object('amount',to_char(final_person_price,'FM9999999999999999999999999999990.00'),'certainty',case when exists(select 1 from crm_private.b03_proposal_versions pv,jsonb_array_elements(pv.economics) e,jsonb_array_elements(e->'components') ec where pv.version_id=vid and e->>'modalityId'=m.modality_id::text and ec->>'priceState'='estimated') then 'estimated' else 'pending' end) end,'participants',participants,'included',
   (select coalesce(jsonb_agg(jsonb_build_object('service',r.definition->>'name','quantity',l.quantity,'date',l.service_date) order by l.line_id),'[]') from crm_private.b03_proposal_lines l join crm_private.catalog_revisions r on r.revision_id=l.service_revision_id where l.version_id=vid and l.modality_id=m.modality_id and l.included)) order by modality_id),'[]') into data from crm_private.b03_proposal_modalities m where version_id=vid;
 else raise exception 'PROPOSAL_INPUT_INVALID';end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return data;
end $$;
do $$ declare f text;begin foreach f in array array['proposal_sources(bytea,bytea,bytea,bytea,bytea)','proposal_apply(bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea)','proposal_read(bytea,bytea,bytea,bytea,bytea)'] loop
 execute 'alter function crm_api.'||f||' owner to crm_h0_f2_executor';execute 'revoke all on function crm_api.'||f||' from public';execute 'grant execute on function crm_api.'||f||' to crm_h0_runtime';end loop;end $$;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
