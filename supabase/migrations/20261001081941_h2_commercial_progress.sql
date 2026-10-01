-- H2-001 only. No Proposal/Version, Acceptance, Booking or external effects.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'COMMERCIAL_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501'; end if; end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b03_leads (
 lead_id uuid primary key, admin_scope text not null, source_ref text not null,
 responsible_actor uuid not null references crm_private.crm_actors(actor_id),
 material jsonb not null, created_at timestamptz not null default clock_timestamp()
);
create table crm_private.b03_opportunities (
 opportunity_id uuid primary key references crm_private.identity_contexts(context_id),
 lead_id uuid unique references crm_private.b03_leads(lead_id),
 admin_scope text not null, source_ref text not null,
 responsible_actor uuid not null references crm_private.crm_actors(actor_id),
 material jsonb not null, creation_material jsonb not null,
 state text not null check(state in ('Nueva','En contacto','Necesidad definida','Propuesta en preparación',
 'Propuesta enviada','Negociación / cambios','Aceptada / Ganada','Perdida','En pausa')),
 -- Positive Ganada is exclusively a future verified Acceptance contract.
 check(state<>'Aceptada / Ganada'),
 previous_state text, loss_reason text check(loss_reason in ('precio','fechas','falta de disponibilidad',
 'cliente no responde','eligió otra empresa','canceló/cambió viaje','no encaja','otro','desconocido')),
 revision bigint not null check(revision>0),
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
 check(state<>'Perdida' or loss_reason is not null),check(state<>'En pausa' or previous_state is not null)
);
create index b03_opportunity_scope on crm_private.b03_opportunities(admin_scope,opportunity_id);
create index b03_lead_scope on crm_private.b03_leads(admin_scope,lead_id);
create table crm_private.b03_operations (
 operation_id uuid primary key, admin_scope text not null, actor_id uuid not null references crm_private.crm_actors(actor_id),
 fingerprint text not null, result_ref uuid not null, recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b03_history (
 history_id uuid primary key references crm_private.b03_operations(operation_id), subject_id uuid not null,
 admin_scope text not null, before_state jsonb, after_state jsonb not null,
 event jsonb not null, normative_ids jsonb not null, reason text not null, source_ref text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id), occurred_at timestamptz,
 recorded_at timestamptz not null default clock_timestamp()
);
create index b03_history_subject on crm_private.b03_history(admin_scope,subject_id,recorded_at);
do $$ declare t text; begin foreach t in array array['b03_leads','b03_opportunities','b03_operations','b03_history'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);
 execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy commercial_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy commercial_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
end loop; end $$;
grant update(material,state,previous_state,loss_reason,revision,updated_at) on crm_private.b03_opportunities to crm_h0_f2_executor;

-- Pure guard evaluator; no I/O. Future dependent capabilities remain blocked.
create function crm_private.b03_decide(s text,e jsonb) returns jsonb
language plpgsql immutable set search_path=pg_catalog,pg_temp as $$
declare k text:=e->>'type';allowed boolean:=false;dest text;id text;keys text[];why text;
begin
 keys:=case k when 'contact' then array['communicationId','outcome','evidenceId'] when 'define_need' then array['need','scope','pending']
 when 'prepare' then array['scope','sufficient','alternativeRef','pending'] when 'send' then array['versionRef','sendEvidenceRef','communicationId']
 when 'negotiate' then array['exchangeRef','scope'] when 'lose' then array['lossReason','context']
 when 'pause' then array['decision','context','followup'] when 'reactivate' then array['interest','review','destination','support']
 when 'revise' then array['change','humanEvaluation','destination','support'] when 'win' then array[]::text[]
 when 'reject_alternative' then array['alternativeRef','context'] end;
 if keys is null or e-(keys||array['type','sourceRef','occurredAt'])<>'{}'::jsonb then
  return jsonb_build_object('allowed',false,'id','SM-FORB-30','blocker','unsupported-effect'); end if;
 if exists(select 1 from jsonb_each(e) x where x.key not in ('pending','support','sufficient','occurredAt') and jsonb_typeof(x.value)<>'string')
  or (e ? 'pending' and (jsonb_typeof(e->'pending')<>'array' or exists(select 1 from jsonb_array_elements(case when jsonb_typeof(e->'pending')='array' then e->'pending' else '[]'::jsonb end) x where jsonb_typeof(x)<>'string' or btrim(x#>>'{}')=''))) then
  return jsonb_build_object('allowed',false,'id','G2','blocker','material-type-invalid');end if;
 if e ? 'support' and (jsonb_typeof(e->'support') is distinct from 'object'
  or exists(select 1 from jsonb_each(case when jsonb_typeof(e->'support')='object' then e->'support' else '{}'::jsonb end) x where x.key<>'pending' and jsonb_typeof(x.value)<>'string')
  or ((e->'support') ? 'pending' and (jsonb_typeof(e->'support'->'pending') is distinct from 'array'
   or exists(select 1 from jsonb_array_elements(case when jsonb_typeof(e->'support'->'pending')='array' then e->'support'->'pending' else '[]'::jsonb end) x where jsonb_typeof(x)<>'string' or btrim(x#>>'{}')='')))) then
  return jsonb_build_object('allowed',false,'id','G2','blocker','current-support-invalid');end if;
 if nullif(btrim(e->>'sourceRef'),'') is null then return jsonb_build_object('allowed',false,'id','G2','blocker','source-required'); end if;
 if k='win' then id:='SPEC-FR-COM-003';why:='verified-acceptance-required-H2-007';
 elsif k='contact' then id:='SM-OP-02';dest:='En contacto';allowed:=s='Nueva' and nullif(btrim(e->>'communicationId'),'') is not null and nullif(btrim(e->>'outcome'),'') is not null and nullif(btrim(e->>'evidenceId'),'') is not null;
 elsif k='define_need' then id:='SM-OP-03';dest:='Necesidad definida';allowed:=s in ('Nueva','En contacto') and nullif(btrim(e->>'need'),'') is not null and nullif(btrim(e->>'scope'),'') is not null and jsonb_typeof(e->'pending')='array';
 elsif k='prepare' then id:='SM-OP-04';why:='preparation-guards-required';
  if s in ('Nueva','En contacto','Necesidad definida','Propuesta enviada','Negociación / cambios') and e->'sufficient'='true'::jsonb
   and nullif(btrim(e->>'scope'),'') is not null and nullif(btrim(e->>'alternativeRef'),'') is not null and jsonb_typeof(e->'pending')='array' then why:='proposal-capability-pending-H2-003';end if;
 elsif k='send' then id:='SM-OP-05';why:='exact-version-send-guards-required';
  if s not in ('Aceptada / Ganada','Perdida','En pausa') and nullif(btrim(e->>'versionRef'),'') is not null
   and nullif(btrim(e->>'sendEvidenceRef'),'') is not null and nullif(btrim(e->>'communicationId'),'') is not null then why:='exact-version-send-capability-pending-H2-005';end if;
 elsif k='negotiate' then id:='SM-OP-06';dest:='Negociación / cambios';allowed:=s in ('Necesidad definida','Propuesta en preparación','Propuesta enviada') and nullif(btrim(e->>'exchangeRef'),'') is not null and nullif(btrim(e->>'scope'),'') is not null;
 elsif k='lose' then id:='SM-OP-08';dest:='Perdida';allowed:=s not in ('Aceptada / Ganada','Perdida') and e->>'lossReason' in
  ('precio','fechas','falta de disponibilidad','cliente no responde','eligió otra empresa','canceló/cambió viaje','no encaja','otro','desconocido') and nullif(btrim(e->>'context'),'') is not null;
 elsif k='pause' then id:='SM-OP-09';dest:='En pausa';allowed:=s not in ('Aceptada / Ganada','Perdida','En pausa') and nullif(btrim(e->>'decision'),'') is not null and nullif(btrim(e->>'context'),'') is not null and nullif(btrim(e->>'followup'),'') is not null;
 elsif k in ('reactivate','revise') then
  id:=case k when 'reactivate' then 'SM-OP-10' else 'SM-OP-11' end;
  if (k='reactivate' and s in ('Perdida','En pausa') and nullif(btrim(e->>'interest'),'') is not null and nullif(btrim(e->>'review'),'') is not null)
   or (k='revise' and s not in ('Aceptada / Ganada','Perdida','En pausa') and nullif(btrim(e->>'change'),'') is not null and nullif(btrim(e->>'humanEvaluation'),'') is not null) then
   if e->>'destination'='Propuesta en preparación' and k='reactivate' then why:='proposal-capability-pending-H2-003';
   elsif jsonb_typeof(e->'support')='object' and (e->'support')-array['contact','need','scope','pending']='{}'::jsonb then
    dest:=e->>'destination';allowed:=(dest='En contacto' and nullif(btrim(e->'support'->>'contact'),'') is not null)
     or (dest='Necesidad definida' and nullif(btrim(e->'support'->>'need'),'') is not null and nullif(btrim(e->'support'->>'scope'),'') is not null and jsonb_typeof(e->'support'->'pending')='array');
   end if;
  end if;
 elsif k='reject_alternative' then id:='AC-005';dest:=s;allowed:=s not in ('Aceptada / Ganada','Perdida','En pausa') and nullif(btrim(e->>'alternativeRef'),'') is not null and nullif(btrim(e->>'context'),'') is not null;
 end if;
 return jsonb_build_object('allowed',coalesce(allowed,false),'destination',case when allowed then dest end,'id',id,'blocker',coalesce(why,'commercial-guards-required'));
end $$;
revoke all on function crm_private.b03_decide(text,jsonb) from public;
grant execute on function crm_private.b03_decide(text,jsonb) to crm_h0_f2_executor;

create function crm_api.b03_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,
 cf2p bytea,cf2s bytea,cf1p bytea,cf1s bytea,cq bytea)
returns table(result_ref uuid,replayed boolean) language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];cv text[];m jsonb;a jsonb;e jsonb;d jsonb;
 actor uuid;scope text;target uuid;opid uuid;lead uuid;action text;fingerprint text;prior jsonb;after_data jsonb;
 old crm_private.b03_opportunities%rowtype;op crm_private.b03_operations%rowtype;l crm_private.b03_leads%rowtype;ref text;ik text;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'COMMERCIAL_DENIED' using errcode='42501';end if;
 v:=crm_f1.fields(q);if cardinality(v)<>2 or v[1]<>'CRM-H2-COM-1' then raise exception 'COMMERCIAL_INPUT_INVALID';end if;
 m:=v[2]::jsonb;a:=m->'material';e:=m->'event';actor:=hf[12]::uuid;scope:=hf[17];
 action:=m->>'action';target:=(m->>'targetId')::uuid;opid:=(m->>'operationId')::uuid;lead:=nullif(m->>'leadId','')::uuid;
 if m-array['action','targetId','operationId','leadId','expectedRevision','sourceRef','reason','material','event']<>'{}'::jsonb
  or jsonb_typeof(m->'sourceRef') is distinct from 'string' or jsonb_typeof(m->'reason') is distinct from 'string'
  or nullif(btrim(m->>'sourceRef'),'') is null or nullif(btrim(m->>'reason'),'') is null or coalesce(m->>'expectedRevision','') !~ '^(0|[1-9][0-9]*)$'
  or action is null or action not in ('lead','direct','convert','progress') then raise exception 'COMMERCIAL_INPUT_INVALID';end if;
 fingerprint:=encode(crm_crypto.digest(convert_to(m::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(opid::text,0));
 select * into op from crm_private.b03_operations where operation_id=opid;
 if found then
  if op.admin_scope<>scope or op.actor_id<>actor or op.fingerprint<>fingerprint then raise exception 'COMMERCIAL_REPLAY_CONFLICT';end if;
  result_ref:=op.result_ref;replayed:=true;
 else
  perform pg_advisory_xact_lock(hashtextextended(coalesce(lead,target)::text,31));
  if action in ('lead','direct','convert') then
   if e is not null then raise exception 'COMMERCIAL_INPUT_INVALID';end if;
   if jsonb_typeof(a) is distinct from 'object' or a-array['contact','need','commercialPossible','pending','dates','participants','services','budget','contactId','organizationId','groupId']<>'{}'::jsonb
    or not(a ?& array['contact','need','commercialPossible','pending']) or jsonb_typeof(a->'pending') is distinct from 'array'
    or (a->'need'<>'null'::jsonb and (jsonb_typeof(a->'need')<>'string' or nullif(btrim(a->>'need'),'') is null))
    or a->'commercialPossible' not in ('null'::jsonb,'true'::jsonb,'false'::jsonb) then raise exception 'COMMERCIAL_INPUT_INVALID';end if;
   if a->'contact'<>'null'::jsonb and (jsonb_typeof(a->'contact')<>'object' or (a->'contact')-array['channel','address','sourceRef','valid']<>'{}'::jsonb
    or jsonb_typeof(a->'contact'->'channel') is distinct from 'string' or jsonb_typeof(a->'contact'->'address') is distinct from 'string'
    or jsonb_typeof(a->'contact'->'sourceRef') is distinct from 'string'
    or not((a->'contact') ?& array['channel','address','sourceRef','valid']) or a->'contact'->'valid' not in ('true'::jsonb,'false'::jsonb)
    or nullif(btrim(a->'contact'->>'channel'),'') is null or nullif(btrim(a->'contact'->>'address'),'') is null
    or nullif(btrim(a->'contact'->>'sourceRef'),'') is null) then raise exception 'COMMERCIAL_INPUT_INVALID';end if;
   if exists(select 1 from jsonb_array_elements(a->'pending') x where jsonb_typeof(x)<>'string' or btrim(x#>>'{}')='') then raise exception 'COMMERCIAL_INPUT_INVALID';end if;
   foreach ik in array array['contact','organization','group'] loop
    ref:=a->>(ik||'Id');if ref is not null and not exists(select 1 from crm_private.identity_entities i
     where i.identity_id=ref::uuid and i.identity_kind=ik and i.admin_scope=scope and i.archived_at is null and i.merged_into_id is null
      and (ik<>'group' or i.context_id=target)) then raise exception 'COMMERCIAL_IDENTITY_INVALID';end if;
   end loop;
   if action='lead' then
    if lead is not null or (m->>'expectedRevision')::bigint<>0 then raise exception 'COMMERCIAL_INPUT_INVALID';end if;
    insert into crm_private.b03_leads(lead_id,admin_scope,source_ref,responsible_actor,material) values(target,scope,m->>'sourceRef',actor,a);
    select to_jsonb(t) into after_data from crm_private.b03_leads t where lead_id=target;d:=jsonb_build_object('id','BR-LEAD-001');
   else
    if a->'contact'->'valid' is distinct from 'true'::jsonb or nullif(btrim(a->>'need'),'') is null or a->'commercialPossible' is distinct from 'true'::jsonb then raise exception 'COMMERCIAL_MINIMUM_REQUIRED:SM-OP-01';end if;
    if (m->>'expectedRevision')::bigint<>0 then raise exception 'COMMERCIAL_REVISION_CONFLICT';end if;
    if action='convert' then
     select * into l from crm_private.b03_leads where lead_id=lead and admin_scope=scope;
     if not found then raise exception 'COMMERCIAL_LEAD_REQUIRED';end if;
     select * into old from crm_private.b03_opportunities where lead_id=lead;
     if found then
      if old.admin_scope<>scope or old.creation_material<>a or old.source_ref<>l.source_ref then raise exception 'COMMERCIAL_CONVERSION_CONFLICT';end if;
      target:=old.opportunity_id;result_ref:=target;replayed:=true;
     end if;
    elsif lead is not null then raise exception 'COMMERCIAL_INPUT_INVALID';end if;
    if old.opportunity_id is null then
     if exists(select 1 from crm_private.identity_contexts where context_id=target) then
      if not exists(select 1 from crm_private.identity_contexts where context_id=target and context_kind='opportunity' and admin_scope=scope and verified) then raise exception 'COMMERCIAL_CONTEXT_INVALID';end if;
     else
      insert into crm_private.identity_contexts(context_id,context_kind,admin_scope,source_ref,evidence_ref,verified)
       values(target,'opportunity',scope,coalesce(l.source_ref,m->>'sourceRef'),m->>'sourceRef',true);
     end if;
     insert into crm_private.b03_opportunities(opportunity_id,lead_id,admin_scope,source_ref,responsible_actor,material,creation_material,state,revision)
      values(target,lead,scope,coalesce(l.source_ref,m->>'sourceRef'),coalesce(l.responsible_actor,actor),a,a,'Nueva',1);
     -- Reuse the actual H1 API, allocator, counter, D040 and immutable registry.
     cv:=crm_f1.fields(cq);
     if cv is distinct from array['CRM-H1-RESOLVE1','assign_code',target::text,target::text,'','OP',m->>'sourceRef',m->>'sourceRef',m->>'reason','0'] then raise exception 'COMMERCIAL_CODE_CONTRACT_INVALID';end if;
     if not exists(select 1 from crm_private.identity_codes c where c.code_kind='OP' and c.target_id=target and c.admin_scope=scope) then
      perform crm_api.identity_resolve(cf2p,cf2s,cf1p,cf1s,cq);end if;
     select to_jsonb(t) into after_data from crm_private.b03_opportunities t where opportunity_id=target;
     d:=jsonb_build_object('id','SM-OP-01');
    end if;
   end if;
  else
   select * into old from crm_private.b03_opportunities where opportunity_id=target and admin_scope=scope for update;
   if not found then raise exception 'COMMERCIAL_DENIED';end if;
   if old.revision<>(m->>'expectedRevision')::bigint then raise exception 'COMMERCIAL_REVISION_CONFLICT';end if;
   if a is not null or lead is not null or jsonb_typeof(e) is distinct from 'object' then raise exception 'COMMERCIAL_INPUT_INVALID';end if;
   d:=crm_private.b03_decide(old.state,e);
   if d->>'allowed' is distinct from 'true' then raise exception 'COMMERCIAL_BLOCKED:%:%',d->>'id',d->>'blocker';end if;
   if e->>'type'='contact' then
    if not exists(select 1 from crm_private.b07_records r join crm_private.b07_links b using(record_id)
     where r.record_id=(e->>'communicationId')::uuid and r.admin_scope=scope and b.admin_scope=scope
     and b.context_kind='opportunity' and b.context_id=target and r.record_kind='communication'
     and nullif(r.material->>'channel','') is not null and nullif(r.material->>'recipient_ref','') is not null
     and r.material->>'direction' in ('incoming','outgoing')) then raise exception 'COMMERCIAL_CONTACT_EVIDENCE_REQUIRED';end if;
   end if;
   if e->>'type' in ('contact','negotiate') then
    ref:=case when e->>'type'='contact' then e->>'evidenceId' else e->>'exchangeRef' end;
    if not exists(select 1 from crm_private.b07_records r join crm_private.b07_links b using(record_id)
     where r.record_id=ref::uuid and r.admin_scope=scope and b.admin_scope=scope and b.context_kind='opportunity' and b.context_id=target
     and ((r.record_kind='evidence' and r.material->>'certainty'='reviewed') or (r.record_kind='communication' and r.material->>'direction'='incoming'))) then
     raise exception 'COMMERCIAL_ACTUAL_EVIDENCE_REQUIRED';end if;
   end if;
   prior:=to_jsonb(old);
   if e->>'type'='define_need' or e->>'destination'='Necesidad definida' then
    a:=case when e->>'type'='define_need' then e else e->'support' end;
    update crm_private.b03_opportunities set material=jsonb_set(jsonb_set(material,'{need}',a->'need'),'{pending}',a->'pending') where opportunity_id=target;
   end if;
   update crm_private.b03_opportunities set state=d->>'destination',revision=revision+1,updated_at=clock_timestamp(),
    previous_state=case when e->>'type'='pause' then old.state else previous_state end,
    loss_reason=case when e->>'type'='lose' then e->>'lossReason' else loss_reason end where opportunity_id=target;
   select to_jsonb(t) into after_data from crm_private.b03_opportunities t where opportunity_id=target;
  end if;
  insert into crm_private.b03_operations(operation_id,admin_scope,actor_id,fingerprint,result_ref) values(opid,scope,actor,fingerprint,target);
  if after_data is not null then
   insert into crm_private.b03_history(history_id,subject_id,admin_scope,before_state,after_state,event,normative_ids,reason,source_ref,actor_id,occurred_at)
    values(opid,target,scope,prior,after_data,coalesce(e,jsonb_build_object('type',action,'leadId',lead)),jsonb_build_array(d->>'id'),m->>'reason',m->>'sourceRef',actor,(e->>'occurredAt')::timestamptz);
  end if;
  result_ref:=target;replayed:=coalesce(replayed,false);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');
 perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return next;
end $$;

create function crm_api.b03_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];v text[];m jsonb;data jsonb;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'COMMERCIAL_DENIED';end if;
 v:=crm_f1.fields(q);if cardinality(v)<>2 or v[1]<>'CRM-H2-COM-READ1' then raise exception 'COMMERCIAL_INPUT_INVALID';end if;m:=v[2]::jsonb;
 if m->>'kind'='lead' then select to_jsonb(t) into data from crm_private.b03_leads t where lead_id=(m->>'targetId')::uuid and admin_scope=hf[17];
 elsif m->>'kind'='opportunity' then select to_jsonb(t)||jsonb_build_object('human_code',c.human_code) into data
  from crm_private.b03_opportunities t join crm_private.identity_codes c on c.target_id=t.opportunity_id and c.code_kind='OP' and c.admin_scope=t.admin_scope where opportunity_id=(m->>'targetId')::uuid and t.admin_scope=hf[17];
 elsif m->>'kind'='history' then select coalesce(jsonb_agg(to_jsonb(t) order by recorded_at,history_id),'[]'::jsonb) into data from crm_private.b03_history t where subject_id=(m->>'targetId')::uuid and admin_scope=hf[17];
 else raise exception 'COMMERCIAL_INPUT_INVALID';end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return data;
end $$;
alter function crm_api.b03_apply(bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
alter function crm_api.b03_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.b03_apply(bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea),crm_api.b03_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.b03_apply(bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea),crm_api.b03_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
