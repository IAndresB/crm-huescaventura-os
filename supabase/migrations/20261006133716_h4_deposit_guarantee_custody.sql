-- H4-017/018 guarantee facts and custody. No bank execution and no new fund ledger.
begin;
do $$begin if current_user<>'crm_h0_migration' then raise exception 'DEPOSIT_MIGRATION_AUTHORITY_REQUIRED';end if;end$$;
grant create on schema crm_private to crm_h0_f2_owner;grant create on schema crm_api to crm_h0_f2_executor;
create table crm_private.b05_deposits(deposit_id uuid primary key,booking_id uuid not null references crm_private.b04_bookings,service_id uuid not null references crm_private.b04_services,night_id uuid references crm_private.b04_nights,admin_scope text not null,initial_operation_id uuid not null,refund_id uuid not null unique);
create table crm_private.b05_deposit_operations(operation_id uuid primary key,deposit_id uuid not null references crm_private.b05_deposits,admin_scope text not null,actor_id uuid not null references crm_private.crm_actors,fingerprint text not null,result jsonb not null,result_revision bigint not null,recorded_at timestamptz not null default clock_timestamp());
create table crm_private.b05_deposit_revisions(deposit_id uuid not null references crm_private.b05_deposits,revision bigint not null,admin_scope text not null,operation_id uuid not null unique references crm_private.b05_deposit_operations deferrable initially deferred,action text not null,event jsonb not null,before_data jsonb,after_data jsonb not null,actor_id uuid not null references crm_private.crm_actors,evidence_id uuid not null references crm_private.b07_records,source_ref text not null,reason text not null,occurred_at timestamptz not null,recorded_at timestamptz not null default clock_timestamp(),primary key(deposit_id,revision));
create table crm_private.b05_deposit_facts(fact_id uuid primary key,deposit_id uuid not null references crm_private.b05_deposits,admin_scope text not null,kind text not null check(kind in ('delivery','retention')),identity_source text not null,identity_account text not null,identity_method text not null,external_id text not null,material jsonb not null,operation_id uuid not null references crm_private.b05_deposit_operations deferrable initially deferred,unique(admin_scope,identity_source,identity_account,identity_method,external_id));
alter table crm_private.b05_deposits add foreign key(initial_operation_id) references crm_private.b05_deposit_operations deferrable initially deferred;
alter table crm_private.b05_deposit_operations add foreign key(deposit_id,result_revision) references crm_private.b05_deposit_revisions deferrable initially deferred;
do $$declare t text;r text;begin foreach t in array array['b05_deposits','b05_deposit_operations','b05_deposit_revisions','b05_deposit_facts'] loop
 execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);execute format('alter table crm_private.%I enable row level security',t);execute format('alter table crm_private.%I force row level security',t);
 execute format('create policy deposit_executor on crm_private.%I to crm_h0_f2_executor using(true) with check(true)',t);execute format('create policy deposit_migration on crm_private.%I to crm_h0_migration using(true) with check(true)',t);
 execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor,crm_h0_migration',t);execute format('revoke all on crm_private.%I from public,crm_h0_runtime,crm_h0_ha_tx',t);
 execute format('create trigger deposit_immutable before update or delete on crm_private.%I for each row execute function crm_private.payment_immutable()',t);
 foreach r in array array['anon','authenticated'] loop if exists(select 1 from pg_roles where rolname=r)then execute format('revoke all on crm_private.%I from %I',t,r);end if;end loop;
end loop;end$$;
create function crm_private.deposit_amounts(p jsonb) returns jsonb language sql stable set search_path=pg_catalog,pg_temp as $$
 with amounts as(select coalesce((select sum((x->>'amount')::numeric)from jsonb_array_elements(p->'deliveries')x),0) delivered,coalesce((select sum((x->>'amount')::numeric)from jsonb_array_elements(p->'retentions')x),0) retained,coalesce((select sum((m.material->>'amount')::numeric)from jsonb_array_elements(p->'returns')x join crm_private.b05_refund_movements m on m.movement_id=(x->>'movementId')::uuid),0) returned)
 select jsonb_build_object('delivered',trunc(delivered,2)::text,'retained',trunc(retained,2)::text,'returned',trunc(returned,2)::text,'remainingDelivery',case when p->'requirement'->>'amount' is null then null else trunc((p->'requirement'->>'amount')::numeric-delivered,2)::text end,'pendingExplanation',trunc(delivered-retained-returned,2)::text,'pendingReturn',case when p->'resolution'->>'returnAmount' is null then null else trunc((p->'resolution'->>'returnAmount')::numeric-returned,2)::text end,'resolved',p->'requirement'->>'amount' is not null and delivered=(p->'requirement'->>'amount')::numeric and delivered>0 and delivered=retained+returned and not exists(select 1 from jsonb_array_elements(p->'discrepancies')x where x->>'resolved'='false'))from amounts
$$;
-- Half-open delivery portions are guarantee scope, not a second fund ledger.
create function crm_private.deposit_parts(parts jsonb,p jsonb,allowed jsonb default null)returns numeric language plpgsql stable set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare x jsonb;y jsonb;d jsonb;total numeric:=0;seen jsonb:='[]';begin
 if jsonb_typeof(parts) is distinct from 'array' or jsonb_array_length(parts)=0 then raise exception 'DEPOSIT_PORTION_REQUIRED';end if;
 for x in select value from jsonb_array_elements(parts)loop
  if x-array['deliveryId','start','amount']<>'{}'::jsonb or not(x?&array['deliveryId','start','amount']) or crm_private.payment_amount(x->'start') is distinct from true or crm_private.payment_amount(x->'amount',true) is distinct from true then raise exception 'DEPOSIT_PORTION_REQUIRED';end if;
  select value into d from jsonb_array_elements(p->'deliveries')where value->>'id'=x->>'deliveryId';
  if d is null or (x->>'start')::numeric<(d->>'start')::numeric or (x->>'start')::numeric+(x->>'amount')::numeric>(d->>'start')::numeric+(d->>'amount')::numeric then raise exception 'DEPOSIT_PORTION_REQUIRED';end if;
  if allowed is not null and not exists(select 1 from jsonb_array_elements(allowed)y where y->>'deliveryId'=x->>'deliveryId'and (x->>'start')::numeric>=(y->>'start')::numeric and (x->>'start')::numeric+(x->>'amount')::numeric<=(y->>'start')::numeric+(y->>'amount')::numeric)then raise exception 'DEPOSIT_RESOLUTION_COVERAGE_REQUIRED';end if;
  for y in select value from jsonb_array_elements(seen)loop
   if y->>'deliveryId'=x->>'deliveryId' and numrange((y->>'start')::numeric,(y->>'start')::numeric+(y->>'amount')::numeric,'[)')&&numrange((x->>'start')::numeric,(x->>'start')::numeric+(x->>'amount')::numeric,'[)')then raise exception 'DEPOSIT_PORTION_OVERLAP';end if;
  end loop;seen:=seen||jsonb_build_array(x);total:=total+(x->>'amount')::numeric;
 end loop;return total;
end$$;
create function crm_private.deposit_fact_material(v jsonb)returns jsonb language sql immutable set search_path=pg_catalog,pg_temp as $$
 select (case when v?'fund'then jsonb_set(v,'{fund}',(v->'fund')-array['paymentRevision','fundRevision'])else v end)-'fundPortions'||case when v?'fundPortions'then jsonb_build_object('fundPortions',coalesce((select jsonb_agg(x-array['paymentRevision','fundRevision'])from jsonb_array_elements(v->'fundPortions')x),'[]'))else '{}'::jsonb end
$$;
create function crm_private.deposit_core(a jsonb,s text,actor uuid,reservation text default null)returns jsonb language plpgsql volatile set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare id uuid;bid uuid;sid uuid;nid uuid;op uuid;root crm_private.b05_deposits;prev crm_private.b05_deposit_operations;old jsonb;p jsonb;v jsonb;d jsonb;x jsonb;y jsonb;parts jsonb;used jsonb;funds jsonb;facts jsonb;fop uuid;fsnapshot jsonb;stored crm_private.b05_deposit_facts;movement crm_private.b05_refund_movements;fp text;hash text;action text;rev bigint;at_time timestamptz;receipt jsonb;amount numeric;ret numeric;returned numeric;total numeric;mid uuid;pid uuid;rf jsonb;token jsonb;
begin
 if jsonb_typeof(a) is distinct from 'object' or a-array['action','operationId','depositId','bookingId','serviceId','nightId','expectedRevision','sourceRef','reason','evidenceId','at','origin','applicability','conditions','requirement','delivery','evaluation','resolution','fact','incidentId','solution']<>'{}'::jsonb or not(a?&array['action','operationId','depositId','bookingId','serviceId','expectedRevision','sourceRef','reason','evidenceId','at']) or a->>'expectedRevision'!~'^[0-9]+$' or exists(select 1 from unnest(array['sourceRef','reason','at'])k where crm_private.invoice_text(a->k) is distinct from true) or a->>'at'!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}T.*(Z|[+-][0-9]{2}:[0-9]{2})$' then raise exception 'DEPOSIT_INPUT_INVALID';end if;
 id:=(a->>'depositId')::uuid;bid:=(a->>'bookingId')::uuid;sid:=(a->>'serviceId')::uuid;nid:=(a->>'nightId')::uuid;op:=(a->>'operationId')::uuid;action:=a->>'action';at_time:=(a->>'at')::timestamptz;
 if action not in ('open','applicability','require','deliver','evaluate','determine','retain','return','discrepancy','resolve_discrepancy')then raise exception 'DEPOSIT_INPUT_INVALID';end if;
 if not exists(select 1 from crm_private.b04_services where service_id=sid and booking_id=bid and admin_scope=s)or nid is not null and not exists(select 1 from crm_private.b04_nights where night_id=nid and service_id=sid and admin_scope=s)then raise exception 'DEPOSIT_DENIED';end if;
 perform pg_advisory_xact_lock(hashtextextended((select opportunity_id::text from crm_private.b04_bookings where booking_id=bid),31));
 perform pg_advisory_xact_lock(hashtextextended('deposit-scope:'||sid||':'||coalesce(nid::text,''),0));
 perform pg_advisory_xact_lock(hashtextextended('deposit-root:'||id,0));
 select * into root from crm_private.b05_deposits where deposit_id=id and booking_id=bid and service_id=sid and night_id is not distinct from nid and admin_scope=s;
 if exists(select 1 from crm_private.b05_deposits where deposit_id=id)and root.deposit_id is null then raise exception 'DEPOSIT_DENIED';end if;
 select revision,after_data into rev,old from crm_private.b05_deposit_revisions where deposit_id=id and admin_scope=s order by revision desc limit 1;rev:=coalesce(rev,0);
 perform pg_advisory_xact_lock(hashtextextended('deposit-op:'||op,0));fp:=encode(crm_crypto.digest(convert_to(a::text,'UTF8'),'sha256'),'hex');
 select * into prev from crm_private.b05_deposit_operations where operation_id=op;
 if found then if prev.actor_id<>actor or prev.admin_scope<>s or prev.fingerprint<>fp then raise exception 'DEPOSIT_REPLAY_CONFLICT:E2';end if;return prev.result||jsonb_build_object('replayed',true);end if;
 hash:=encode(crm_crypto.digest(convert_to((a-array['operationId','evidenceId'])::text,'UTF8'),'sha256'),'hex');
 if not crm_private.payment_evidence((a->>'evidenceId')::uuid,id,s,'deposit:'||action||':'||hash,at_time,true)then raise exception 'DEPOSIT_EVIDENCE_REQUIRED';end if;
 if coalesce(a->>'origin','manual')not in ('manual','ai')or a->>'origin'='ai'and reservation is null then raise exception 'DEPOSIT_APPROVAL_REQUIRED';end if;
 -- Reliable identity dedup is independent of technical revision, but after current admission/proof.
 if action in ('deliver','retain','return')then
  v:=case when action='deliver'then a->'delivery'else a->'fact'end;
  if jsonb_typeof(v->'identity')is distinct from 'object'or (v->'identity')-array['source','account','externalId']<>'{}'::jsonb or exists(select 1 from unnest(array['source','account','externalId'])k where crm_private.invoice_text(v->'identity'->k)is distinct from true)or crm_private.payment_amount(v->'amount',true)is distinct from true or exists(select 1 from unnest(array['recipientId','method','reference','occurredAt'])k where crm_private.invoice_text(v->k)is distinct from true)or v->>'occurredAt'!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}T.*(Z|[+-][0-9]{2}:[0-9]{2})$'or (v->>'occurredAt')::timestamptz>at_time then raise exception 'DEPOSIT_FACT_REQUIRED';end if;
  perform pg_advisory_xact_lock(hashtextextended('refund-fact:'||s||':'||(v->'identity')::text||':'||(v->>'method'),0));
  if action='return'then
   select * into movement from crm_private.b05_refund_movements where admin_scope=s and identity_source=v->'identity'->>'source'and identity_account=v->'identity'->>'account'and identity_method=v->>'method'and external_id=v->'identity'->>'externalId';
   if found then if movement.refund_id<>root.refund_id or crm_private.deposit_fact_material(movement.material->'guaranteeFact')is distinct from crm_private.deposit_fact_material(v) then raise exception 'DEPOSIT_FACT_CONFLICT:E2';end if;receipt:=jsonb_build_object('id',id,'result',old,'replayed',true);insert into crm_private.b05_deposit_operations values(op,id,s,actor,fp,receipt,rev,clock_timestamp());return receipt;end if;
  else
   select * into stored from crm_private.b05_deposit_facts where admin_scope=s and identity_source=v->'identity'->>'source'and identity_account=v->'identity'->>'account'and identity_method=v->>'method'and external_id=v->'identity'->>'externalId';
   if found then if stored.deposit_id<>id or stored.kind<>(case when action='deliver'then 'delivery'else 'retention'end) or crm_private.deposit_fact_material(stored.material)is distinct from crm_private.deposit_fact_material(v) then raise exception 'DEPOSIT_FACT_CONFLICT:E2';end if;receipt:=jsonb_build_object('id',id,'result',old,'replayed',true);insert into crm_private.b05_deposit_operations values(op,id,s,actor,fp,receipt,rev,clock_timestamp());return receipt;end if;
  end if;
 end if;
 if rev<>(a->>'expectedRevision')::bigint then raise exception 'DEPOSIT_STALE_REVISION:E2';end if;
 if old is null then
  if action<>'open'then raise exception 'DEPOSIT_DENIED';end if;
  if action<>'open'or exists(select 1 from crm_private.b05_deposits where service_id=sid and night_id is not distinct from nid and admin_scope=s)then raise exception 'DEPOSIT_SCOPE_CONFLICT:E2';end if;
  insert into crm_private.b05_deposits values(id,bid,sid,nid,s,op,gen_random_uuid());select * into root from crm_private.b05_deposits where deposit_id=id;
  p:=jsonb_build_object('id',id,'bookingId',bid,'serviceId',sid,'nightId',nid,'refundId',root.refund_id,'revision',0,'applicability','unknown','conditions',null,'requirement',null,'evaluation',null,'resolution',null,'deliveries','[]'::jsonb,'retentions','[]'::jsonb,'returns','[]'::jsonb,'discrepancies','[]'::jsonb);
 else p:=old;end if;
 token:=crm_private.modification_scope(jsonb_build_object('kind',case when nid is null then 'service'else 'night'end,'id',coalesce(nid,sid)),bid,s);
 if action='applicability'then
  v:=a->'conditions';
  if coalesce(a->>'applicability','')not in ('required','not_applicable')or v-array['catalogRevisionId','terms','condition']<>'{}'::jsonb or not(v?&array['catalogRevisionId','terms','condition'])or crm_private.invoice_text(v->'condition')is distinct from true or v->'terms'is distinct from(select terms from crm_private.b04_bookings where booking_id=bid and admin_scope=s)or v->>'catalogRevisionId'is distinct from(select service_revision_id::text from crm_private.b04_services where service_id=sid and admin_scope=s)then raise exception 'DEPOSIT_CONDITIONS_REQUIRED';end if;
  p:=p||jsonb_build_object('applicability',a->'applicability','conditions',v,'evaluation',null,'resolution',null,'scopeToken',token);
 elsif action='require'then
  v:=a->'requirement';if p->>'applicability'<>'required'or v-array['amount','recipientId','due','condition']<>'{}'::jsonb or not(v?&array['amount','recipientId','due','condition'])or crm_private.payment_amount(v->'amount',true)is distinct from true or exists(select 1 from unnest(array['recipientId','due','condition'])k where crm_private.invoice_text(v->k)is distinct from true)or (v->>'amount')::numeric<(crm_private.deposit_amounts(p)->>'delivered')::numeric then raise exception 'DEPOSIT_REQUIREMENT_REQUIRED';end if;
  if not exists(select 1 from crm_private.catalog_items where item_id=(v->>'recipientId')::uuid and item_kind='provider'and admin_scope=s)and not exists(select 1 from crm_private.crm_actors where actor_id=(v->>'recipientId')::uuid and admin_scope=s)then raise exception 'DEPOSIT_DENIED';end if;
  p:=p||jsonb_build_object('requirement',v,'evaluation',null,'resolution',null);
 elsif action='deliver'then
  v:=a->'delivery';if p->>'applicability'<>'required'or p->'requirement'='null'::jsonb or not(v?&array['id','identity','start','amount','recipientId','custody','method','occurredAt','reference'])or v-array['id','identity','start','amount','recipientId','custody','method','occurredAt','reference','fund']<>'{}'::jsonb or crm_private.payment_amount(v->'start')is distinct from true or coalesce(v->>'custody','')not in ('external','internal')or v->>'recipientId'is distinct from p->'requirement'->>'recipientId'or (v->>'start')::numeric+(v->>'amount')::numeric>(p->'requirement'->>'amount')::numeric or exists(select 1 from jsonb_array_elements(p->'deliveries')x where numrange((x->>'start')::numeric,(x->>'start')::numeric+(x->>'amount')::numeric,'[)')&&numrange((v->>'start')::numeric,(v->>'start')::numeric+(v->>'amount')::numeric,'[)'))then raise exception 'DEPOSIT_DELIVERY_REQUIRED';end if;
  if v->>'custody'='external'then
   if v?'fund'or not exists(select 1 from crm_private.catalog_items where item_id=(v->>'recipientId')::uuid and item_kind='provider'and admin_scope=s)then raise exception 'DEPOSIT_CUSTODY_REQUIRED';end if;
  else
   if not exists(select 1 from crm_private.crm_actors where actor_id=(v->>'recipientId')::uuid and admin_scope=s)or v->'fund'->>'amount'is distinct from v->>'amount'then raise exception 'DEPOSIT_CUSTODY_REQUIRED';end if;
   pid:=(v->'fund'->>'paymentId')::uuid;perform pg_advisory_xact_lock(hashtextextended('payment-root:'||pid,0));
   if not exists(select 1 from jsonb_array_elements(crm_private.fund_allocations(pid,s))z where z->>'id'=v->'fund'->>'allocationId' and z->>'status'='verified' and z->'destination'->>'purpose'='deposit'and z->'destination'->>'bookingId'=bid::text)or not crm_private.refund_portions(jsonb_build_array(v->'fund'),bid,s,true)then raise exception 'DEPOSIT_FUNDS_REQUIRED';end if;
   if exists(select 1 from crm_private.b05_deposit_facts f where f.admin_scope=s and f.kind='delivery'and f.material->'fund'->>'paymentId'=pid::text and numrange((f.material->'fund'->>'start')::numeric,(f.material->'fund'->>'start')::numeric+(f.material->>'amount')::numeric,'[)')&&numrange((v->'fund'->>'start')::numeric,(v->'fund'->>'start')::numeric+(v->>'amount')::numeric,'[)'))then raise exception 'DEPOSIT_FUNDS_OVERLAP';end if;
  end if;
  insert into crm_private.b05_deposit_facts values((v->>'id')::uuid,id,s,'delivery',v->'identity'->>'source',v->'identity'->>'account',v->>'method',v->'identity'->>'externalId',v,op);
  p:=p||jsonb_build_object('deliveries',p->'deliveries'||jsonb_build_array(v),'evaluation',null,'resolution',null);
 elsif action='evaluate'then
  v:=a->'evaluation';if p->>'applicability'<>'required'or (crm_private.deposit_amounts(p)->>'remainingDelivery')::numeric is distinct from 0::numeric or v-array['condition','facts']<>'{}'::jsonb or not(v?&array['condition','facts'])or exists(select 1 from unnest(array['condition','facts'])k where crm_private.invoice_text(v->k)is distinct from true)then raise exception 'DEPOSIT_EVALUATION_REQUIRED';end if;
  p:=p||jsonb_build_object('evaluation',v,'scopeToken',token,'resolution',null);
 elsif action='determine'then
  v:=a->'resolution';if reservation is null or session_user<>'crm_h0_ha_tx'then raise exception 'DEPOSIT_TTE_REQUIRED';end if;
  if p->'evaluation'='null'::jsonb or p->'scopeToken'is distinct from token or v-array['recipientId','conditions','retentionPortions','returnPortions','method']<>'{}'::jsonb or not(v?&array['recipientId','conditions','retentionPortions','returnPortions','method'])or crm_private.invoice_text(v->'conditions')is distinct from true or crm_private.invoice_text(v->'method')is distinct from true or v->>'recipientId'is distinct from(select chain_snapshot->'acceptance'->>'accepter_id' from crm_private.b04_bookings where booking_id=bid)then raise exception 'DEPOSIT_RESOLUTION_REQUIRED';end if;
  parts:=(v->'retentionPortions')||(v->'returnPortions');total:=crm_private.deposit_parts(parts,p);if total<>(crm_private.deposit_amounts(p)->>'delivered')::numeric then raise exception 'DEPOSIT_RESOLUTION_INCOMPLETE';end if;
  ret:=coalesce((select sum((x->>'amount')::numeric)from jsonb_array_elements(v->'retentionPortions')x),0);returned:=total-ret;
  -- Applied portions must still be supported by any new resolution; never disappear.
  used:=coalesce((select jsonb_agg(x)from jsonb_array_elements(p->'retentions')f cross join lateral jsonb_array_elements(f->'portions')x),'[]');
  if jsonb_array_length(used)>0 then perform crm_private.deposit_parts(used,p,v->'retentionPortions');end if;
  used:=coalesce((select jsonb_agg(x)from jsonb_array_elements(p->'returns')r join crm_private.b05_refund_movements m on m.movement_id=(r->>'movementId')::uuid cross join lateral jsonb_array_elements(m.material->'guaranteeFact'->'portions')x),'[]');if jsonb_array_length(used)>0 then perform crm_private.deposit_parts(used,p,v->'returnPortions');end if;
  p:=p||jsonb_build_object('resolution',v||jsonb_build_object('retentionAmount',trunc(ret,2)::text,'returnAmount',trunc(returned,2)::text,'reservation',reservation,'operationId',op,'scopeToken',token));
 elsif action in ('retain','return')then
  v:=a->'fact';if p->'resolution'='null'::jsonb or p->'scopeToken'is distinct from token or v-array['identity','method','occurredAt','reference','amount','recipientId','portions','fundPortions']<>'{}'::jsonb then raise exception 'DEPOSIT_RESOLUTION_REQUIRED';end if;
  if not exists(select 1 from crm_ha.reservations where reservation_id=p->'resolution'->>'reservation'and state='reserved'and created_at<=(v->>'occurredAt')::timestamptz)then raise exception 'DEPOSIT_APPROVAL_REQUIRED';end if;
  parts:=v->'portions';amount:=crm_private.deposit_parts(parts,p,p->'resolution'->(case when action='retain'then 'retentionPortions'else 'returnPortions'end));if amount<>(v->>'amount')::numeric then raise exception 'DEPOSIT_AMOUNT_MISMATCH';end if;
  used:=coalesce((select jsonb_agg(x)from jsonb_array_elements(p->'retentions')f cross join lateral jsonb_array_elements(f->'portions')x),'[]')||coalesce((select jsonb_agg(x)from jsonb_array_elements(p->'returns')r join crm_private.b05_refund_movements m on m.movement_id=(r->>'movementId')::uuid cross join lateral jsonb_array_elements(m.material->'guaranteeFact'->'portions')x),'[]');
  perform crm_private.deposit_parts(used||parts,p);
  if action='retain'then
   funds:='[]';
   for x in select value from jsonb_array_elements(parts)loop select value into d from jsonb_array_elements(p->'deliveries')where value->>'id'=x->>'deliveryId';if v->>'recipientId'is distinct from d->>'recipientId'then raise exception 'DEPOSIT_RECIPIENT_REQUIRED';end if;end loop;
   for x in select value from jsonb_array_elements(parts)loop
    select value into d from jsonb_array_elements(p->'deliveries')where value->>'id'=x->>'deliveryId';
    if d->>'custody'='internal'then
     pid:=(d->'fund'->>'paymentId')::uuid;perform pg_advisory_xact_lock(hashtextextended('payment-root:'||pid,0));
     select value into y from jsonb_array_elements(coalesce(v->'fundPortions','[]'))where value->>'paymentId'=pid::text and value->>'allocationId'=d->'fund'->>'allocationId'and (value->>'start')::numeric=(d->'fund'->>'start')::numeric+(x->>'start')::numeric-(d->>'start')::numeric and value->>'amount'=x->>'amount';
     funds:=funds||jsonb_build_array(y);
     if y is null or not crm_private.refund_portions(jsonb_build_array(y),bid,s,true)then raise exception 'DEPOSIT_FUNDS_REQUIRED';end if;
     select snapshot into fsnapshot from crm_private.b05_allocation_revisions where allocation_id=(y->>'allocationId')::uuid and admin_scope=s order by revision desc limit 1;
     fop:=gen_random_uuid();facts:=crm_private.fund_summary(pid,s);
     insert into crm_private.b05_fund_operations values(fop,pid,s,actor,fp,a,jsonb_build_object('guaranteeRetention',id,'amount',x->'amount'),clock_timestamp());
     insert into crm_private.b05_allocation_acts values(gen_random_uuid(),fop,(y->>'allocationId')::uuid,pid,s,'consume',(y->>'start')::numeric,-(y->>'amount')::numeric,null,fsnapshot,fsnapshot,actor,a->>'reason',a->>'sourceRef',(a->>'evidenceId')::uuid,at_time,clock_timestamp());
     perform crm_private.fund_refresh(pid,s,actor,'deposit-retention',fop,rev+1);
     insert into crm_private.b05_fund_history values(fop,pid,s,facts,crm_private.fund_summary(pid,s),actor,a->>'reason',a->>'sourceRef',(a->>'evidenceId')::uuid,at_time,clock_timestamp());
    end if;
   end loop;
   if jsonb_array_length(funds)<>jsonb_array_length(coalesce(v->'fundPortions','[]'))then raise exception 'DEPOSIT_FUNDS_REQUIRED';end if;
   mid:=gen_random_uuid();insert into crm_private.b05_deposit_facts values(mid,id,s,'retention',v->'identity'->>'source',v->'identity'->>'account',v->>'method',v->'identity'->>'externalId',v,op);p:=p||jsonb_build_object('retentions',p->'retentions'||jsonb_build_array(v||jsonb_build_object('id',mid)));
  else
   if v->>'recipientId'is distinct from p->'resolution'->>'recipientId'or v->>'method'is distinct from p->'resolution'->>'method'then raise exception 'DEPOSIT_RECIPIENT_REQUIRED';end if;
   funds:='[]';for x in select value from jsonb_array_elements(parts)loop
    select value into d from jsonb_array_elements(p->'deliveries')where value->>'id'=x->>'deliveryId';
    if d->>'custody'='internal'then
     select value into y from jsonb_array_elements(coalesce(v->'fundPortions','[]'))where value->>'paymentId'=d->'fund'->>'paymentId'and value->>'allocationId'=d->'fund'->>'allocationId'and (value->>'start')::numeric=(d->'fund'->>'start')::numeric+(x->>'start')::numeric-(d->>'start')::numeric and value->>'amount'=x->>'amount';
     if y is null then raise exception 'DEPOSIT_FUNDS_REQUIRED';end if;funds:=funds||jsonb_build_array(y);
    end if;
   end loop;
   if jsonb_array_length(funds)<>jsonb_array_length(coalesce(v->'fundPortions','[]'))then raise exception 'DEPOSIT_FUNDS_REQUIRED';end if;
   for pid in select distinct (x->>'paymentId')::uuid from jsonb_array_elements(funds)x order by 1 loop perform pg_advisory_xact_lock(hashtextextended('payment-root:'||pid,0));end loop;
   if jsonb_array_length(funds)>0 and not crm_private.refund_portions(funds,bid,s,true)then raise exception 'DEPOSIT_FUNDS_REQUIRED';end if;
   mid:=gen_random_uuid();insert into crm_private.b05_refund_movements values(mid,root.refund_id,s,v->'identity'->>'source',v->'identity'->>'account',v->>'method',v->'identity'->>'externalId',jsonb_build_object('identity',v->'identity','amount',v->'amount','recipientId',v->'recipientId','method',v->'method','occurredAt',v->'occurredAt','reference',v->'reference','portions',funds,'baseType','guarantee','depositId',id,'guaranteeFact',v),true,p->'resolution'->>'reservation',op);
   p:=p||jsonb_build_object('returns',p->'returns'||jsonb_build_array(jsonb_build_object('movementId',mid)));
   for pid in select distinct (x->>'paymentId')::uuid from jsonb_array_elements(funds)x order by 1 loop perform crm_private.fund_refresh(pid,s,actor,'refund',mid,rev+1);end loop;
  end if;
 elsif action in ('discrepancy','resolve_discrepancy')then
  if not exists(select 1 from crm_private.b07_incidents where incident_id=(a->>'incidentId')::uuid and booking_id=bid and admin_scope=s)then raise exception 'DEPOSIT_DENIED';end if;
  if action='discrepancy'then p:=p||jsonb_build_object('discrepancies',p->'discrepancies'||jsonb_build_array(jsonb_build_object('id',a->'incidentId','resolved',false,'evidenceId',a->'evidenceId')));
  else if crm_private.invoice_text(a->'solution')is distinct from true or not exists(select 1 from jsonb_array_elements(p->'discrepancies')x where x->>'id'=a->>'incidentId'and x->>'resolved'='false')then raise exception 'DEPOSIT_SOLUTION_REQUIRED';end if;
   p:=p||jsonb_build_object('discrepancies',(select jsonb_agg(case when x->>'id'=a->>'incidentId'then x||jsonb_build_object('resolved',true,'solution',a->'solution','solutionEvidence',a->'evidenceId')else x end)from jsonb_array_elements(p->'discrepancies')x));end if;
 end if;
 rev:=rev+1;p:=p||jsonb_build_object('revision',rev,'amounts',crm_private.deposit_amounts(p));receipt:=jsonb_build_object('id',id,'result',p);
 insert into crm_private.b05_deposit_operations values(op,id,s,actor,fp,receipt,rev,clock_timestamp());insert into crm_private.b05_deposit_revisions values(id,rev,s,op,action,a,old,p,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());
 if (p->'resolution'->>'returnAmount')::numeric>0 or exists(select 1 from crm_private.b05_refunds where refund_id=root.refund_id)then
  if not exists(select 1 from crm_private.b05_refunds where refund_id=root.refund_id)then insert into crm_private.b05_refunds values(root.refund_id,bid,s,op);end if;
  rf:=jsonb_build_object('id',root.refund_id,'bookingId',bid,'revision',rev,'baseType','guarantee','depositId',id,'determination',p->'resolution','right',p->'resolution'->'returnAmount','authorized',p->'resolution'->'returnAmount','executed',p->'amounts'->'returned','pendingRight',p->'amounts'->'pendingReturn','pendingAuthorized',p->'amounts'->'pendingReturn','movements',p->'returns','attempts','[]'::jsonb,'uncertain','0.00','status',case when p->'resolution'='null'::jsonb then 'Pendiente de revalidación'when p->'amounts'->>'pendingReturn'='0.00'then 'Ejecutada'else 'Autorizada'end);
  insert into crm_private.b05_refund_operations values(op,root.refund_id,s,actor,fp,jsonb_build_object('id',root.refund_id,'result',rf),rev,clock_timestamp());insert into crm_private.b05_refund_revisions values(root.refund_id,rev,s,op,'guarantee-'||action,a,null,rf,actor,(a->>'evidenceId')::uuid,a->>'sourceRef',a->>'reason',at_time,clock_timestamp());
 end if;return receipt;
end$$;
create function crm_api.deposit_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare hf text[];tf text[];fs text[];r jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C03','write_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');if hf[17]collate "C" is distinct from tf[14]collate "C" then raise exception 'DEPOSIT_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-DEPOSIT1'then raise exception 'DEPOSIT_INPUT_INVALID';end if;r:=crm_private.deposit_core(fs[2]::jsonb,hf[17],hf[12]::uuid);perform crm_f2.verify(f2p,f2s,q,'C03','human_evidence','write_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C03','evidence','write_evidence');return r;
end$$;
create function crm_api.deposit_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)returns jsonb language plpgsql stable security definer set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare hf text[];tf text[];fs text[];a jsonb;r jsonb;begin
 hf:=crm_f2.admit(f2p,f2s,q,'C01','read_evidence');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');if hf[17]collate "C" is distinct from tf[14]collate "C"then raise exception 'DEPOSIT_DENIED';end if;
 fs:=crm_f1.fields(q);if cardinality(fs)<>2 or fs[1]<>'CRM-H4-DEPOSIT-READ1'then raise exception 'DEPOSIT_INPUT_INVALID';end if;a:=fs[2]::jsonb;
 if a-array['bookingId','depositId','purpose']<>'{}'::jsonb or not(a?&array['bookingId','depositId','purpose'])or a->>'purpose'not in ('history','summary')then raise exception 'DEPOSIT_INPUT_INVALID';end if;
 select v.after_data into r from crm_private.b05_deposit_revisions v join crm_private.b05_deposits d using(deposit_id)where d.deposit_id=(a->>'depositId')::uuid and d.booking_id=(a->>'bookingId')::uuid and d.admin_scope=hf[17]and v.admin_scope=hf[17]order by revision desc limit 1;
 if r is not null then if a->>'purpose'='summary'then r:=jsonb_build_object('id',r->'id','revision',r->'revision','applicability',r->'applicability','refundId',r->'refundId','amounts',r->'amounts');else r:=r||jsonb_build_object('history',(select jsonb_agg(jsonb_build_object('revision',revision,'action',action,'before',before_data,'after',after_data,'actorId',actor_id,'evidenceId',evidence_id,'sourceRef',source_ref,'reason',reason,'at',occurred_at,'recordedAt',recorded_at)order by revision)from crm_private.b05_deposit_revisions where deposit_id=(a->>'depositId')::uuid and admin_scope=hf[17]));end if;end if;
 perform crm_f2.verify(f2p,f2s,q,'C01','human_evidence','read_evidence');perform crm_f1.verify_envelope(f1p,f1s,q,'C01','evidence','read_evidence');return r;
end$$;
create function crm_api.deposit_sensitive_determine(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea,a jsonb)returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare hf text[];tf text[];fs text[];part text[];res crm_ha.reservations;r jsonb;begin
 if session_user<>'crm_h0_ha_tx'then raise exception 'DEPOSIT_TTE_REQUIRED';end if;
 hf:=crm_f2.verify(f2p,f2s,q,'C03','human_core_probe','apply_probe_batch');tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','human_approval','manage_effect');fs:=crm_f1.fields(q);
 if hf[17]collate "C" is distinct from tf[14]collate "C"or fs[1]<>'CRM-H0-M04'or fs[2]<>'reserve'or a->>'action'<>'determine'then raise exception 'DEPOSIT_TTE_REQUIRED';end if;
 select * into strict res from crm_ha.reservations where reservation_id=fs[3];select crm_f1.fields(material_payload)into part from crm_ha.parts where proposal_id=res.proposal_id and part_id=res.part_id;
 if part[3]<>'deposit-determine'or part[5]::jsonb is distinct from a or part[6]<>'value'or part[7]is distinct from a->'resolution'->>'recipientId'or part[8]<>'value'or part[9]is distinct from (select trunc(sum((x->>'amount')::numeric),2)::text from jsonb_array_elements((a->'resolution'->'retentionPortions')||(a->'resolution'->'returnPortions'))x)or part[10]<>'value'or part[11]is distinct from a->'resolution'->>'conditions'or part[12]<>hf[17]or part[13]<>'determine-guarantee-resolution'then raise exception 'DEPOSIT_APPROVAL_MATERIAL_CHANGED';end if;
 r:=crm_private.deposit_core(a,hf[17],hf[12]::uuid,res.reservation_id);perform crm_f2.verify(f2p,f2s,q,'C03','human_core_probe','apply_probe_batch');return r;
end$$;
create function crm_api.deposit_finalize(command_id text)returns void language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare p jsonb;s text;begin
 if session_user<>'crm_h0_ha_tx'then raise exception 'DEPOSIT_TTE_REQUIRED';end if;
 select after_data,admin_scope into p,s from crm_private.b05_deposit_revisions where action='determine'and after_data->'resolution'->>'reservation'=command_id;
 if p is null then raise exception 'DEPOSIT_FINAL_CHECK_REQUIRED';end if;
 if p->'scopeToken'is distinct from crm_private.modification_scope(jsonb_build_object('kind',case when p->>'nightId'is null then 'service'else 'night'end,'id',coalesce(p->>'nightId',p->>'serviceId')),(p->>'bookingId')::uuid,s)then raise exception 'DEPOSIT_FINAL_CHECK_FAILED';end if;
end$$;
-- Preserve the contractual kernel, adding only a guard against guarantee-root bypass.
do $$declare body text;begin
 select pg_get_functiondef('crm_private.refund_core(jsonb,text,uuid,text)'::regprocedure)into body;
 if position('id:=(a->>''refundId'')::uuid;'in body)=0 then raise exception 'DEPOSIT_REFUND_ANCHOR_MISSING';end if;
 body:=replace(body,'id:=(a->>''refundId'')::uuid;','if exists(select 1 from crm_private.b05_deposits where refund_id=(a->>''refundId'')::uuid and booking_id=(a->>''bookingId'')::uuid and admin_scope=s)then raise exception ''REFUND_GUARANTEE_CONTRACT_REQUIRED'';end if; id:=(a->>''refundId'')::uuid;');execute body;
 select pg_get_functiondef('crm_api.refund_apply(bytea,bytea,bytea,bytea,bytea)'::regprocedure)into body;
 if position('r:=crm_private.refund_core(fs[2]::jsonb,hf[17],hf[12]::uuid);'in body)=0 then raise exception 'DEPOSIT_REFUND_API_ANCHOR_MISSING';end if;
 body:=replace(body,'r:=crm_private.refund_core(fs[2]::jsonb,hf[17],hf[12]::uuid);','if fs[2]::jsonb->>''action''=''guarantee''then if fs[2]::jsonb-array[''action'',''deposit'']<>''{}''::jsonb then raise exception ''REFUND_INPUT_INVALID'';end if;r:=crm_private.deposit_core(fs[2]::jsonb->''deposit'',hf[17],hf[12]::uuid);else r:=crm_private.refund_core(fs[2]::jsonb,hf[17],hf[12]::uuid);end if;');execute body;
end$$;
do $$declare f record;begin for f in select p.oid::regprocedure sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='crm_private'and p.proname in ('deposit_amounts','deposit_parts','deposit_core','deposit_fact_material')loop execute 'alter function '||f.sig||' owner to crm_h0_f2_owner';execute 'revoke all on function '||f.sig||' from public,crm_h0_runtime,crm_h0_ha_tx';execute 'grant execute on function '||f.sig||' to crm_h0_f2_executor';end loop;end$$;
do $$declare f text;begin foreach f in array array['deposit_apply','deposit_read']loop execute 'alter function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor';execute 'revoke all on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea)from public';execute 'grant execute on function crm_api.'||f||'(bytea,bytea,bytea,bytea,bytea)to crm_h0_runtime';end loop;end$$;
alter function crm_api.deposit_sensitive_determine(bytea,bytea,bytea,bytea,bytea,jsonb)owner to crm_h0_f2_executor;revoke all on function crm_api.deposit_sensitive_determine(bytea,bytea,bytea,bytea,bytea,jsonb)from public,crm_h0_runtime;grant execute on function crm_api.deposit_sensitive_determine(bytea,bytea,bytea,bytea,bytea,jsonb)to crm_h0_ha_tx;
alter function crm_api.deposit_finalize(text)owner to crm_h0_f2_executor;revoke all on function crm_api.deposit_finalize(text)from public,crm_h0_runtime;grant execute on function crm_api.deposit_finalize(text)to crm_h0_ha_tx;
revoke create on schema crm_private from crm_h0_f2_owner;revoke create on schema crm_api from crm_h0_f2_executor;
commit;
