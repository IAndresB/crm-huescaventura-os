-- H3-013/014: own economy only; no fund/payment/fiscal effect. H1 exact engine owns calculation in trusted C02.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'OWN_ECONOMICS_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;
grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b05_own_economies(
 economy_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings(booking_id),scope_ref text not null,
 admin_scope text not null,initial_operation_id uuid not null,unique(admin_scope,booking_id,scope_ref)
);
create table crm_private.b05_own_economic_operations(
 operation_id uuid primary key,economy_id uuid not null references crm_private.b05_own_economies(economy_id),admin_scope text not null,
 actor_id uuid not null references crm_private.crm_actors(actor_id),fingerprint text not null,input_material jsonb not null,result jsonb not null,result_revision bigint not null,
 recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.b05_own_economic_revisions(
 economy_id uuid not null references crm_private.b05_own_economies(economy_id),revision bigint not null check(revision>0),admin_scope text not null,
 operation_id uuid not null unique references crm_private.b05_own_economic_operations(operation_id) deferrable initially deferred,
 before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors(actor_id),evidence_id uuid not null references crm_private.b07_records(record_id),
 reason text not null,source_ref text not null,occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(economy_id,revision)
);
create table crm_private.b05_own_economic_components(
 economy_id uuid not null,revision bigint not null,component_id text not null,kind text not null check(kind in('fee','cost','tarari','promotion')),
 admin_scope text not null,material jsonb not null,primary key(economy_id,revision,component_id),
 foreign key(economy_id,revision) references crm_private.b05_own_economic_revisions(economy_id,revision) deferrable initially deferred
);
alter table crm_private.b05_own_economies add foreign key(initial_operation_id) references crm_private.b05_own_economic_operations(operation_id) deferrable initially deferred;
alter table crm_private.b05_own_economic_operations add foreign key(economy_id,result_revision) references crm_private.b05_own_economic_revisions(economy_id,revision) deferrable initially deferred;
create index b05_own_economy_scope on crm_private.b05_own_economies(admin_scope,booking_id);
create index b05_own_ops_root on crm_private.b05_own_economic_operations(economy_id);
do $$declare t text;role text;begin foreach t in array array['b05_own_economies','b05_own_economic_operations','b05_own_economic_revisions','b05_own_economic_components'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
 execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy own_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);
 execute format('create policy own_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);
 execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
 execute format('create trigger own_economy_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach role in array array['anon','authenticated','crm_h0_ha_tx'] loop if exists(select 1 from pg_roles where rolname=role) then execute format('revoke all on crm_private.%I from %I',t,role);end if;end loop;
end loop;end$$;
create function crm_private.own_economic_sources(bid uuid,refs jsonb,s text) returns jsonb language plpgsql stable set search_path=pg_catalog,pg_temp as $$
declare b jsonb;mods jsonb;services jsonb;versions jsonb;ref jsonb;v jsonb;
begin
 select to_jsonb(x) into b from crm_private.b04_bookings x where booking_id=bid and admin_scope=s;if b is null then raise exception 'OWN_ECONOMICS_DENIED';end if;
 if jsonb_typeof(refs) is distinct from 'array' or jsonb_array_length(refs)>100 or (select count(distinct value) from jsonb_array_elements(refs))<>jsonb_array_length(refs) then raise exception 'OWN_ECONOMICS_INPUT_INVALID';end if;
 select coalesce(jsonb_agg(to_jsonb(x)||jsonb_build_object('snapshot',x.snapshot||jsonb_build_object('id',x.modality_id,'finalPersonPrice',case when (x.snapshot->>'definitive')::boolean then to_char((x.snapshot->>'final_person_price')::numeric,'FM9999999999999999999999999999990.00') else null end)) order by modality_id),'[]') into mods from crm_private.b04_modalities x where booking_id=bid and admin_scope=s;
 select coalesce(jsonb_agg(to_jsonb(x) order by service_id),'[]') into services from crm_private.b04_services x where booking_id=bid and admin_scope=s;
 versions:='[]';for ref in select value from jsonb_array_elements(refs) order by value loop
  select jsonb_build_object('id',cr.revision_id,'kind',ci.item_kind,'definition',cr.definition,'version',cr.revision_number::text) into v from crm_private.catalog_revisions cr join crm_private.catalog_items ci using(item_id) where cr.revision_id=(ref#>>'{}')::uuid and cr.admin_scope=s;
  if v is null then select jsonb_build_object('id',cr.revision_id,'kind',ci.item_kind,'definition',cr.definition,'version',cr.revision_number::text) into v from crm_private.commercial_revisions cr join crm_private.commercial_items ci using(item_id) where cr.revision_id=(ref#>>'{}')::uuid and cr.admin_scope=s;end if;
  if v is null then raise exception 'OWN_ECONOMICS_SOURCE_REQUIRED';end if;versions:=versions||jsonb_build_array(v);
 end loop;
 return jsonb_build_object('booking',b,'modalities',mods,'services',services,'versions',versions);
end$$;
create function crm_api.own_economics_sources(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare h text[];t text[];f text[];a jsonb;r jsonb;
begin
 h:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');t:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');f:=crm_f1.fields(q);
 if h[17] collate "C" is distinct from t[14] collate "C" or cardinality(f)<2 or f[1]<>'CRM-H3-OWN-SOURCES1' then raise exception 'OWN_ECONOMICS_DENIED';end if;
 a:=array_to_string(f[2:cardinality(f)],'')::jsonb;if a-array['bookingId','references']<>'{}'::jsonb then raise exception 'OWN_ECONOMICS_INPUT_INVALID';end if;
 r:=crm_private.own_economic_sources((a->>'bookingId')::uuid,a->'references',h[17]);
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');return r;
end$$;
create function crm_api.own_economics_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare h text[];t text[];f text[];a jsonb;material jsonb;fp text;proofhash text;s text;actor uuid;bid uuid;eid uuid;op uuid;at_time timestamptz;
 root crm_private.b05_own_economies;prev crm_private.b05_own_economic_operations;old jsonb;state jsonb;r jsonb;rev bigint;comp jsonb;kind text;rulehash text;refs jsonb;sources jsonb;existing jsonb;
begin
 h:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');t:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');f:=crm_f1.fields(q);
 if h[17] collate "C" is distinct from t[14] collate "C" or cardinality(f)<2 or f[1]<>'CRM-H3-OWN1' then raise exception 'OWN_ECONOMICS_DENIED';end if;a:=array_to_string(f[2:cardinality(f)],'')::jsonb;
 if jsonb_typeof(a) is distinct from 'object' or a-array['operationId','economyId','bookingId','scope','expectedRevision','expectedBookingRevision','at','sourceRef','reason','evidenceId','input','sources','computed']<>'{}'::jsonb or not(a ?& array['operationId','economyId','bookingId','scope','expectedRevision','expectedBookingRevision','at','sourceRef','reason','evidenceId','input','sources','computed'])
 or exists(select 1 from unnest(array['operationId','economyId','bookingId','scope','at','sourceRef','reason','evidenceId']) k where not coalesce(crm_private.invoice_text(a->k),false))
 or jsonb_typeof(a->'expectedRevision') is distinct from 'number' or a->>'expectedRevision' !~ '^(0|[1-9][0-9]*)$' or jsonb_typeof(a->'expectedBookingRevision') is distinct from 'number' or a->>'expectedBookingRevision'<>'1'
 or a->'computed'->>'algorithmVersion' is distinct from 'h1-money-d023-d028-d029-v1' or a->'computed'->>'currency' is distinct from 'EUR' then raise exception 'OWN_ECONOMICS_INPUT_INVALID';end if;
 bid:=(a->>'bookingId')::uuid;eid:=(a->>'economyId')::uuid;op:=(a->>'operationId')::uuid;s:=h[17];actor:=h[12]::uuid;at_time:=(a->>'at')::timestamptz;
 if not exists(select 1 from crm_private.b04_bookings where booking_id=bid and admin_scope=s) then raise exception 'OWN_ECONOMICS_DENIED';end if;
 material:=a-array['computed','sources'];fp:=encode(crm_crypto.digest(convert_to(material::text,'UTF8'),'sha256'),'hex');perform pg_advisory_xact_lock(hashtextextended('own-economic-op:'||op,0));
 select * into prev from crm_private.b05_own_economic_operations where operation_id=op;
 if found then if prev.admin_scope<>s or prev.actor_id<>actor or prev.fingerprint<>fp then raise exception 'OWN_ECONOMICS_REPLAY_CONFLICT:E2';end if;r:=prev.result||jsonb_build_object('replayed',true);
 else
  proofhash:=encode(crm_crypto.digest(convert_to((material-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
  if not crm_private.payment_evidence((a->>'evidenceId')::uuid,eid,s,'own-economics:'||proofhash,at_time,true) or not exists(select 1 from crm_private.b07_records where record_id=(a->>'evidenceId')::uuid and recorded_by=actor) then raise exception 'OWN_ECONOMICS_EVIDENCE_REQUIRED';end if;
  for comp in select value from jsonb_array_elements(a->'input'->'fees') union all select value from jsonb_array_elements(a->'input'->'costs') loop
   rulehash:=encode(crm_crypto.digest(convert_to(((comp->'rule')-'approvalEvidenceId')::text,'UTF8'),'sha256'),'hex');
   if not crm_private.payment_evidence((comp->'rule'->>'approvalEvidenceId')::uuid,eid,s,'own-rule:'||rulehash,at_time,true) then raise exception 'OWN_ECONOMICS_APPROVED_RULE_REQUIRED';end if;
  end loop;
  perform pg_advisory_xact_lock(hashtextextended('own-economic-booking:'||s||':'||bid,0));
  if a->'computed'->'promotion'->>'status'='applied' and exists(select 1 from crm_private.b05_own_economies e join lateral(select after_data from crm_private.b05_own_economic_revisions v where v.economy_id=e.economy_id order by revision desc limit 1) v on true where e.booking_id=bid and e.admin_scope=s and e.economy_id<>eid and v.after_data->'computed'->'promotion'->>'status'='applied') then raise exception 'OWN_ECONOMICS_PROMOTION_ALREADY_APPLIED';end if;
  perform pg_advisory_xact_lock(hashtextextended('own-economic-scope:'||s||':'||bid||':'||(a->>'scope'),0));
  select * into root from crm_private.b05_own_economies where booking_id=bid and scope_ref=a->>'scope' and admin_scope=s;
  if not found then
   if (a->>'expectedRevision')::bigint<>0 then raise exception 'OWN_ECONOMICS_REVISION_CONFLICT:E2';end if;
   insert into crm_private.b05_own_economies values(eid,bid,a->>'scope',s,op);rev:=0;
  else
   if root.economy_id<>eid then raise exception 'OWN_ECONOMICS_IDENTITY_CONFLICT:E2';end if;
   select revision,after_data into rev,old from crm_private.b05_own_economic_revisions where economy_id=eid order by revision desc limit 1;
   if rev<>(a->>'expectedRevision')::bigint then raise exception 'OWN_ECONOMICS_REVISION_CONFLICT:E2';end if;
  end if;
  select coalesce(jsonb_agg(to_jsonb(x) order by x),'[]') into refs from(select distinct value x from (select value->>'unitRevisionId' value from jsonb_array_elements(a->'input'->'fees') union all select value->>'pricingFormRevisionId' from jsonb_array_elements(a->'input'->'fees') union all select value->>'unitRevisionId' from jsonb_array_elements(a->'input'->'costs') union all select value->>'pricingFormRevisionId' from jsonb_array_elements(a->'input'->'costs') union all select value->>'unitRevisionId' from jsonb_array_elements(a->'input'->'tarari') union all select value->>'pricingFormRevisionId' from jsonb_array_elements(a->'input'->'tarari') union all select a->'input'->'promotion'->>'revisionId' where a->'input'->'promotion'<>'null'::jsonb) allrefs where value is not null) distinctrefs;
  sources:=crm_private.own_economic_sources(bid,refs,s);if sources is distinct from a->'sources' then raise exception 'OWN_ECONOMICS_SOURCE_CHANGED:E2';end if;
  a:=jsonb_set(a,'{computed}',(a->'computed')||jsonb_build_object('bookingSource',sources->'booking','modalities',sources->'modalities'));
  if old is not null and old->'input'=a->'input' and old->'computed'=a->'computed' and old->>'reason'=a->>'reason' and old->>'sourceRef'=a->>'sourceRef' and old->>'actorId'=actor::text and (old->>'at')::timestamptz=at_time then
   r:=jsonb_build_object('id',eid,'replayed',true,'result',old);insert into crm_private.b05_own_economic_operations values(op,eid,s,actor,fp,material,r,rev,clock_timestamp());
  else
  rev:=rev+1;state:=jsonb_build_object('id',eid,'bookingId',bid,'scope',a->>'scope','revision',rev,'input',a->'input','computed',a->'computed','sources',sources,'actorId',actor,'at',at_time,'reason',a->>'reason','sourceRef',a->>'sourceRef','previousRevision',rev-1);
  insert into crm_private.b05_own_economic_operations values(op,eid,s,actor,fp,material,jsonb_build_object('id',eid,'replayed',false,'result',state),rev,clock_timestamp());
  foreach kind in array array['fee','cost','tarari','promotion'] loop
   if kind='promotion' then if a->'computed'->'promotion'<>'null'::jsonb then insert into crm_private.b05_own_economic_components values(eid,rev,'promotion',kind,s,a->'computed'->'promotion');end if;
   else for comp in select value from jsonb_array_elements(a->'computed'->(case kind when 'fee' then 'fees' when 'cost' then 'costs' else 'tarari' end)) loop
    insert into crm_private.b05_own_economic_components values(eid,rev,coalesce(comp->'component'->>'id',comp->>'id'),kind,s,comp);
   end loop;end if;
  end loop;
  insert into crm_private.b05_own_economic_revisions values(eid,rev,s,op,old,state,actor,(a->>'evidenceId')::uuid,a->>'reason',a->>'sourceRef',at_time,clock_timestamp());r:=jsonb_build_object('id',eid,'replayed',false,'result',state);
  end if;
 end if;
 perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.own_economics_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea) returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
declare h text[];t text[];f text[];a jsonb;r jsonb;
begin
 h:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');t:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');f:=crm_f1.fields(q);
 if h[17] collate "C" is distinct from t[14] collate "C" or cardinality(f)<2 or f[1]<>'CRM-H3-OWN-READ1' then raise exception 'OWN_ECONOMICS_DENIED';end if;a:=array_to_string(f[2:cardinality(f)],'')::jsonb;
 if a-array['economyId','bookingId']<>'{}'::jsonb or not(a ?& array['economyId','bookingId']) then raise exception 'OWN_ECONOMICS_INPUT_INVALID';end if;
 select v.after_data into r from crm_private.b05_own_economic_revisions v join crm_private.b05_own_economies e using(economy_id) where e.economy_id=(a->>'economyId')::uuid and e.booking_id=(a->>'bookingId')::uuid and e.admin_scope=h[17] order by revision desc limit 1;
 if r is not null then r:=r||jsonb_build_object('history',(select jsonb_agg(to_jsonb(z) order by revision) from crm_private.b05_own_economic_revisions z where economy_id=(a->>'economyId')::uuid and admin_scope=h[17]));end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');return r;
end$$;
alter function crm_private.own_economic_sources(uuid,jsonb,text) owner to crm_h0_f2_owner;
revoke all on function crm_private.own_economic_sources(uuid,jsonb,text) from public;
grant execute on function crm_private.own_economic_sources(uuid,jsonb,text) to crm_h0_f2_executor,crm_h0_migration;
do $$declare f text;begin foreach f in array array['own_economics_sources','own_economics_apply','own_economics_read'] loop
 execute 'alter function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor';execute 'revoke all on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) from public';execute 'grant execute on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime';end loop;end$$;
revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
