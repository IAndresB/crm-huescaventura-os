-- H2-009: immutable initial Booking baseline; T03 only, no operation/economy modules.
begin;
do $$ begin if current_user<>'crm_h0_migration' then raise exception 'BOOKING_MIGRATION_AUTHORITY_REQUIRED';end if;end $$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b04_bookings(
 booking_id uuid primary key references crm_private.identity_contexts(context_id),
 opportunity_id uuid not null unique references crm_private.b03_opportunities(opportunity_id),
 acceptance_id uuid not null references crm_private.b03_acceptances(acceptance_id),
 verification_id uuid not null references crm_private.b03_acceptance_verifications(verification_id),
 proposal_id uuid not null references crm_private.b03_proposals(proposal_id),
 version_id uuid not null references crm_private.b03_proposal_versions(version_id),
 admin_scope text not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 responsible_actor uuid not null references crm_private.crm_actors(actor_id),
 state text not null check(state='Pendiente de preparación'),revision bigint not null check(revision=1),
 coverage text not null,terms jsonb not null,chain_snapshot jsonb not null,detail jsonb not null,
 effect_fingerprint text not null,evidence_id uuid not null references crm_private.b07_records(record_id),
 source_ref text not null,recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b04_services(
 service_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),
 admin_scope text not null,state text not null check(state='Pendiente'),revision bigint not null check(revision=1),
 service_revision_id uuid not null references crm_private.catalog_revisions(revision_id),
 nature text not null check(nature in ('internal','external')),applied jsonb not null,
 unique(booking_id,service_id)
);
create table crm_private.b04_modalities(
 booking_id uuid not null references crm_private.b04_bookings(booking_id),modality_id uuid not null,
 version_id uuid not null,admin_scope text not null,snapshot jsonb not null,
 primary key(booking_id,modality_id),foreign key(version_id,modality_id) references crm_private.b03_proposal_modalities(version_id,modality_id)
);
create table crm_private.b04_contributions(
 contribution_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),
 service_id uuid not null,modality_id uuid not null,version_id uuid not null,line_id uuid not null,
 admin_scope text not null,quantity numeric not null check(quantity>0),attendees bigint not null check(attendees>0),
 certainty text not null check(certainty in ('estimated','confirmed')),unit_revision_id uuid not null references crm_private.catalog_revisions(revision_id),
 source_snapshot jsonb not null,unique(booking_id,line_id),
 foreign key(booking_id,service_id) references crm_private.b04_services(booking_id,service_id),
 foreign key(booking_id,modality_id) references crm_private.b04_modalities(booking_id,modality_id),
 foreign key(version_id,line_id) references crm_private.b03_proposal_lines(version_id,line_id)
);
create table crm_private.b04_nights(
 night_id uuid primary key,service_id uuid not null references crm_private.b04_services(service_id),
 admin_scope text not null,night_date date not null,unique(service_id,night_date)
);
-- Occupancy has one source of truth: contribution relation, never a competing total.
create table crm_private.b04_night_occupancies(
 night_id uuid not null references crm_private.b04_nights(night_id),
 contribution_id uuid not null references crm_private.b04_contributions(contribution_id),
 admin_scope text not null,primary key(night_id,contribution_id)
);
create table crm_private.b04_participants(
 participant_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),
 admin_scope text not null,name text not null,contact_id uuid references crm_private.identity_entities(identity_id),
 evidence_id uuid not null references crm_private.b07_records(record_id),source_ref text not null
);
create table crm_private.b04_assignments(
 participant_id uuid not null references crm_private.b04_participants(participant_id),
 service_id uuid not null references crm_private.b04_services(service_id),night_id uuid references crm_private.b04_nights(night_id),
 admin_scope text not null,necessity text not null,evidence_id uuid not null references crm_private.b07_records(record_id),
 unique nulls not distinct(participant_id,service_id,night_id)
);
create table crm_private.b04_operations(
 operation_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),
 admin_scope text not null,actor_id uuid not null references crm_private.crm_actors(actor_id),
 fingerprint text not null,event jsonb not null,result jsonb not null,recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b04_history(
 history_id uuid primary key references crm_private.b04_operations(operation_id),
 booking_id uuid not null references crm_private.b04_bookings(booking_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),source_ref text not null,reason text not null,
 before_data jsonb,after_data jsonb not null,normative_ids jsonb not null,recorded_at timestamptz not null default clock_timestamp()
);
do $$ declare t text;r text;begin foreach t in array array['b04_bookings','b04_services','b04_modalities','b04_contributions','b04_nights','b04_night_occupancies','b04_participants','b04_assignments','b04_operations','b04_history'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);
 execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy booking_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy booking_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r) then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end $$;
create function crm_api.booking_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,cf2p bytea,cf2s bytea,cf1p bytea,cf1s bytea,cq bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;d jsonb;sv jsonb;c jsonb;part jsonb;ass jsonb;
 op uuid;bid uuid;opp uuid;aid uuid;actor uuid;s text;fp text;efp text;res jsonb;
 o crm_private.b03_opportunities;v crm_private.b03_proposal_versions;acc crm_private.b03_acceptances;
 z crm_private.b03_acceptance_verifications;p crm_private.b03_proposals;prior crm_private.b04_operations;
 existing crm_private.b04_bookings;line crm_private.b03_proposal_lines;m crm_private.b03_proposal_modalities;
 expected_lines uuid[];actual_lines uuid[];sr jsonb;nid uuid;pid uuid;sid uuid;ref uuid;total bigint;
begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'BOOKING_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H2-BOOKING1' then raise exception 'BOOKING_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or a-array['operationId','bookingId','opportunityId','acceptanceId','proposalId','versionId','coverage','terms','expectedRevision','expectedOpportunityRevision','sourceRef','reason','evidenceId','detail','origin','route']<>'{}'::jsonb
 or not(a ?& array['operationId','bookingId','opportunityId','acceptanceId','proposalId','versionId','coverage','terms','expectedRevision','expectedOpportunityRevision','sourceRef','reason','evidenceId','detail','route'])
 or a->>'route' not in ('normal','direct') or coalesce(a->>'origin','manual')<>'manual'
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision' !~ '^[0-9]+$'
 or jsonb_typeof(a->'expectedOpportunityRevision') is distinct from 'number' or a->>'expectedOpportunityRevision' !~ '^[0-9]+$'
 or exists(select 1 from jsonb_each(a) x where x.key in ('sourceRef','reason','coverage') and (jsonb_typeof(x.value)<>'string' or btrim(x.value#>>'{}')='')) then raise exception 'BOOKING_INPUT_INVALID:G3';end if;
 op:=(a->>'operationId')::uuid;bid:=(a->>'bookingId')::uuid;opp:=(a->>'opportunityId')::uuid;aid:=(a->>'acceptanceId')::uuid;actor:=hf[12]::uuid;s:=hf[17];d:=a->'detail';
 fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');
 -- Equivalent functional identity excludes technical key, requested root ID and optimistic versions.
 efp:=encode(crm_crypto.digest(convert_to((a-array['operationId','bookingId','expectedRevision','expectedOpportunityRevision','route'])::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(op::text,0));
 select * into prior from crm_private.b04_operations where operation_id=op;
 if found then
  if prior.admin_scope<>s or prior.actor_id<>actor or prior.fingerprint<>fp then raise exception 'BOOKING_REPLAY_CONFLICT:E2';end if;
  res:=jsonb_build_object('id',prior.booking_id,'replayed',true,'result',prior.result);
 else
  perform pg_advisory_xact_lock(hashtextextended(opp::text,31));
  select * into o from crm_private.b03_opportunities where opportunity_id=opp and admin_scope=s for update;
  if not found then raise exception 'BOOKING_CHAIN_REQUIRED';end if;
  perform pg_advisory_xact_lock(hashtextextended(a->>'proposalId',33));
  select * into p from crm_private.b03_proposals where proposal_id=(a->>'proposalId')::uuid and opportunity_id=opp and admin_scope=s for update;
  select * into acc from crm_private.b03_acceptances where acceptance_id=aid and opportunity_id=opp and proposal_id=p.proposal_id and version_id=(a->>'versionId')::uuid and admin_scope=s;
  select * into v from crm_private.b03_proposal_versions where version_id=acc.version_id and proposal_id=p.proposal_id and admin_scope=s;
  select * into z from crm_private.b03_acceptance_verifications where acceptance_id=aid and admin_scope=s order by won desc,recorded_at desc limit 1;
  if acc.acceptance_id is null or z.verification_id is null or v.version_id is null or a->'terms' is distinct from acc.terms or a->>'coverage'<>acc.coverage
   or exists(select 1 from crm_private.b03_acceptance_rectifications where acceptance_id=aid) then raise exception 'BOOKING_VERIFIED_CHAIN_REQUIRED:SM-BK-01';end if;
  select * into existing from crm_private.b04_bookings where opportunity_id=opp;
  if found then
   if existing.admin_scope<>s or existing.effect_fingerprint<>efp then raise exception 'BOOKING_EXISTING_CONFLICT:E2';end if;
   bid:=existing.booking_id;res:=jsonb_build_object('bookingId',bid,'state',existing.state,'coverage',existing.coverage,'existing',true);
  else
   if o.state<>'Aceptada / Ganada' or o.revision<>(a->>'expectedOpportunityRevision')::bigint or p.revision<>(a->>'expectedRevision')::bigint then raise exception 'BOOKING_REVISION_OR_STATE_CONFLICT:G6';end if;
   if jsonb_typeof(d) is distinct from 'object' or d-array['services','participants','assignments']<>'{}'::jsonb or jsonb_typeof(d->'services') is distinct from 'array' or jsonb_array_length(d->'services')=0
    or jsonb_typeof(d->'participants') is distinct from 'array' or jsonb_typeof(d->'assignments') is distinct from 'array' then raise exception 'BOOKING_DETAIL_REQUIRED:SM-BS-01';end if;
   if not crm_private.offer_evidence((a->>'evidenceId')::uuid,opp,s,'booking:detail:'||aid||':'||encode(crm_crypto.digest(convert_to(d::text,'UTF8'),'sha256'),'hex'),acc.coverage,'-infinity',clock_timestamp()) then raise exception 'BOOKING_DETAIL_EVIDENCE_REQUIRED';end if;
   select array_agg(l.line_id order by l.line_id) into expected_lines from crm_private.b03_proposal_lines l join crm_private.b03_proposal_modalities mm using(version_id,modality_id)
    where l.version_id=v.version_id and l.included and (acc.coverage=v.scope or (mm.modality_id::text=acc.coverage and mm.independent and mm.selectable) or (l.line_id::text=acc.coverage and l.independent and l.selectable));
   select array_agg((x->>'lineId')::uuid order by (x->>'lineId')::uuid) into actual_lines from jsonb_array_elements(d->'services') bs cross join lateral jsonb_array_elements(bs->'contributions') x;
   if expected_lines is null or actual_lines is distinct from expected_lines then raise exception 'BOOKING_EXACT_SELECTION_REQUIRED:SM-FORB-31';end if;
   insert into crm_private.identity_contexts(context_id,context_kind,admin_scope,source_ref,evidence_ref,verified) values(bid,'booking',s,a->>'sourceRef',a->>'evidenceId',true);
   insert into crm_private.b04_bookings(booking_id,opportunity_id,acceptance_id,verification_id,proposal_id,version_id,admin_scope,actor_id,responsible_actor,state,revision,coverage,terms,chain_snapshot,detail,effect_fingerprint,evidence_id,source_ref)
    values(bid,opp,aid,z.verification_id,p.proposal_id,v.version_id,s,actor,o.responsible_actor,'Pendiente de preparación',1,acc.coverage,acc.terms,jsonb_build_object('opportunity',to_jsonb(o),'acceptance',to_jsonb(acc),'verification',to_jsonb(z),'version',to_jsonb(v)),d,efp,(a->>'evidenceId')::uuid,a->>'sourceRef');
   for sv in select * from jsonb_array_elements(d->'services') loop
    if sv-array['id','serviceRevisionId','nature','variant','provider','place','schedule','contributions','nights']<>'{}'::jsonb or not(sv ?& array['id','serviceRevisionId','nature','variant','provider','place','schedule','contributions','nights'])
     or sv->>'nature' not in ('internal','external') or sv->>'nature'='internal' and sv->'provider'<>'null'::jsonb then raise exception 'BOOKING_SERVICE_INVALID';end if;
    sid:=(sv->>'id')::uuid;
    select x into sr from jsonb_array_elements(v.sources) x where x->>'id'=sv->>'serviceRevisionId' and x->>'kind'='service';
    if sr is null or sr->'definition'->>'nature'<>sv->>'nature' then raise exception 'BOOKING_SERVICE_SOURCE_INVALID';end if;
    insert into crm_private.b04_services values(sid,bid,s,'Pendiente',1,(sv->>'serviceRevisionId')::uuid,sv->>'nature',sv);
    for c in select * from jsonb_array_elements(sv->'contributions') loop
     if c-array['id','lineId','modalityId','quantity','attendees','certainty']<>'{}'::jsonb or not(c ?& array['id','lineId','modalityId','quantity','attendees','certainty']) then raise exception 'BOOKING_CONTRIBUTION_INVALID';end if;
     select * into line from crm_private.b03_proposal_lines where version_id=v.version_id and line_id=(c->>'lineId')::uuid;
     select * into m from crm_private.b03_proposal_modalities where version_id=v.version_id and modality_id=line.modality_id;
     if line.service_revision_id<>(sv->>'serviceRevisionId')::uuid or line.modality_id<>(c->>'modalityId')::uuid or line.quantity is distinct from (c->>'quantity')::numeric
      or m.participants is distinct from (c->>'attendees')::bigint or c->>'certainty' not in ('estimated','confirmed') then raise exception 'BOOKING_SOURCE_QUANTITY_REQUIRED:SM-FORB-10';end if;
     insert into crm_private.b04_modalities values(bid,m.modality_id,v.version_id,s,to_jsonb(m)) on conflict do nothing;
     insert into crm_private.b04_contributions values((c->>'id')::uuid,bid,sid,m.modality_id,v.version_id,line.line_id,s,line.quantity,m.participants,c->>'certainty',line.unit_revision_id,to_jsonb(line));
    end loop;
    for c in select * from jsonb_array_elements(sv->'nights') loop
     if c-array['id','date','contributionIds']<>'{}'::jsonb or not(c ?& array['id','date','contributionIds']) or jsonb_array_length(c->'contributionIds')=0 then raise exception 'BOOKING_NIGHT_INVALID';end if;
     nid:=(c->>'id')::uuid;insert into crm_private.b04_nights values(nid,sid,s,(c->>'date')::date);
     for ref in select value::uuid from jsonb_array_elements_text(c->'contributionIds') loop
      if not exists(select 1 from crm_private.b04_contributions bc join crm_private.b03_proposal_lines l using(version_id,line_id) where bc.contribution_id=ref and bc.service_id=sid and l.service_date=(c->>'date')::date) then raise exception 'BOOKING_NIGHT_SOURCE_INVALID';end if;
      insert into crm_private.b04_night_occupancies values(nid,ref,s);
     end loop;
    end loop;
   end loop;
   for part in select * from jsonb_array_elements(d->'participants') loop
    pid:=(part->>'id')::uuid;
    if part-array['id','name','contactId','evidenceId','sourceRef']<>'{}'::jsonb or btrim(coalesce(part->>'name',''))='' or btrim(coalesce(part->>'sourceRef',''))=''
     or not crm_private.offer_evidence((part->>'evidenceId')::uuid,opp,s,'booking:participant:'||aid||':'||pid,acc.coverage,'-infinity',clock_timestamp()) then raise exception 'BOOKING_NOMINAL_EVIDENCE_REQUIRED';end if;
    if part->>'contactId' is not null and not exists(select 1 from crm_private.identity_entities where identity_id=(part->>'contactId')::uuid and identity_kind='contact' and identity_verified and admin_scope=s) then raise exception 'BOOKING_CONTACT_VERIFICATION_REQUIRED';end if;
    insert into crm_private.b04_participants values(pid,bid,s,part->>'name',nullif(part->>'contactId','')::uuid,(part->>'evidenceId')::uuid,part->>'sourceRef');
   end loop;
   for ass in select * from jsonb_array_elements(d->'assignments') loop
    sid:=(ass->>'serviceId')::uuid;nid:=nullif(ass->>'nightId','')::uuid;pid:=(ass->>'participantId')::uuid;
    if ass-array['participantId','serviceId','nightId','necessity','evidenceId']<>'{}'::jsonb or btrim(coalesce(ass->>'necessity',''))='' or not exists(select 1 from crm_private.b04_participants where participant_id=pid and booking_id=bid)
     or not exists(select 1 from crm_private.b04_services where service_id=sid and booking_id=bid)
     or (nid is not null and not exists(select 1 from crm_private.b04_nights where night_id=nid and service_id=sid))
     or not crm_private.offer_evidence((ass->>'evidenceId')::uuid,opp,s,'booking:nominal:'||aid||':'||sid||':'||coalesce(nid::text,'service'),acc.coverage,'-infinity',clock_timestamp()) then raise exception 'BOOKING_NOMINAL_NECESSITY_REQUIRED';end if;
    insert into crm_private.b04_assignments values(pid,sid,nid,s,ass->>'necessity',(ass->>'evidenceId')::uuid);
    select coalesce(sum(bc.attendees),0) into total from crm_private.b04_contributions bc where bc.service_id=sid and (nid is null or exists(select 1 from crm_private.b04_night_occupancies no where no.contribution_id=bc.contribution_id and no.night_id=nid));
    if (select count(*) from crm_private.b04_assignments x where x.service_id=sid and x.night_id is not distinct from nid)>total then raise exception 'BOOKING_NOMINAL_DISCREPANCY_REVIEW_REQUIRED';end if;
   end loop;
   if exists(select 1 from crm_private.b04_participants x where x.booking_id=bid and not exists(select 1 from crm_private.b04_assignments y where y.participant_id=x.participant_id)) then raise exception 'BOOKING_NOMINAL_NECESSITY_REQUIRED';end if;
   fs:=crm_f1.fields(cq);
   if fs is distinct from array['CRM-H1-RESOLVE1','assign_code',bid::text,bid::text,'','RES',a->>'sourceRef',a->>'evidenceId',a->>'reason','0'] then raise exception 'BOOKING_CODE_CONTRACT_INVALID';end if;
   perform crm_api.identity_resolve(cf2p,cf2s,cf1p,cf1s,cq);
   res:=jsonb_build_object('bookingId',bid,'state','Pendiente de preparación','coverage',acc.coverage,'existing',false);
  end if;
  insert into crm_private.b04_operations values(op,bid,s,actor,fp,a,res,clock_timestamp());
  insert into crm_private.b04_history values(op,bid,s,actor,a->>'sourceRef',a->>'reason',to_jsonb(o),res,'["SM-BK-01","SM-BS-01","PLAN-T03","D018"]',clock_timestamp());
  res:=jsonb_build_object('id',bid,'replayed',false,'result',res);
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return res;
end $$;
alter function crm_api.booking_apply(bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.booking_apply(bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.booking_apply(bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
create function crm_api.booking_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare hf text[];tf text[];fs text[];a jsonb;r jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');
 if hf[17] collate "C"<>tf[14] collate "C" then raise exception 'BOOKING_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H2-BOOKING-READ1' then raise exception 'BOOKING_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if a-array['bookingId']<>'{}'::jsonb then raise exception 'BOOKING_INPUT_INVALID';end if;
 select jsonb_build_object('booking',to_jsonb(b),'code',ic.human_code,'history',coalesce((select jsonb_agg(to_jsonb(x) order by x.recorded_at) from crm_private.b04_history x where x.booking_id=b.booking_id),'[]')) into r
 from crm_private.b04_bookings b join crm_private.identity_codes ic on ic.target_id=b.booking_id and ic.code_kind='RES' where b.booking_id=(a->>'bookingId')::uuid and b.admin_scope=hf[17];
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');return r;
end $$;
alter function crm_api.booking_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke all on function crm_api.booking_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.booking_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
