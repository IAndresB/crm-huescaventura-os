-- H0-M04: exact internal approval and part reservation. Forward-only.
-- H0-M02 remains the durable operation/history/result/intent ledger.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H0_M04_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;

create schema crm_ha authorization crm_h0_migration;
grant usage, create on schema crm_ha to crm_h0_table_owner;
grant usage on schema crm_private, crm_f1, crm_f2, crm_api, crm_ha to crm_h0_f2_executor;
grant usage on schema crm_crypto to crm_h0_f2_executor;
grant execute on function crm_f1.fields(bytea),
  crm_f1.verify_envelope(bytea,bytea,bytea,text,text,text),
  crm_f1.verify_unit(bytea,bytea,bytea), crm_f1.pack_fields(text[])
  to crm_h0_f2_executor;
grant execute on function crm_f2.admit(bytea,bytea,bytea,text,text)
  to crm_h0_f2_executor;
grant execute on function crm_api.commit_internal_unit(bytea,bytea,bytea)
  to crm_h0_f2_executor;
grant insert on crm_f1.consumption to crm_h0_f2_executor;

create table crm_ha.proposals (
  proposal_id text primary key check (proposal_id ~ '^[a-z][a-z0-9-]{0,127}$'),
  material_fingerprint text not null check (material_fingerprint ~ '^[0-9a-f]{64}$'),
  material_payload bytea not null check (octet_length(material_payload) <= 16384),
  proposer_kind text not null check (proposer_kind in ('human','ai')),
  proposer_actor uuid not null,
  scope text not null check (scope <> ''),
  created_at timestamptz not null
);
create table crm_ha.parts (
  proposal_id text not null references crm_ha.proposals(proposal_id),
  part_id text not null check (part_id ~ '^[a-z][a-z0-9-]{0,127}$'),
  material_fingerprint text not null check (material_fingerprint ~ '^[0-9a-f]{64}$'),
  material_payload bytea not null check (octet_length(material_payload) <= 16384),
  primary key (proposal_id,part_id)
);
create table crm_ha.decisions (
  decision_id text primary key check (decision_id ~ '^[a-z][a-z0-9-]{0,127}$'),
  proposal_id text not null unique references crm_ha.proposals(proposal_id),
  material_fingerprint text not null check (material_fingerprint ~ '^[0-9a-f]{64}$'),
  decision text not null check (decision in ('approved','rejected')),
  reason text not null,
  actor_id uuid not null,
  session_id uuid not null,
  decided_at timestamptz not null
);
create table crm_ha.reservations (
  reservation_id text primary key check (reservation_id ~ '^[a-z][a-z0-9-]{0,127}$'),
  proposal_id text not null,
  decision_id text not null references crm_ha.decisions(decision_id),
  part_id text not null,
  material_fingerprint text not null check (material_fingerprint ~ '^[0-9a-f]{64}$'),
  effect_id text not null unique,
  intent_id text not null unique,
  state text not null check (state in ('reserved','attempting','uncertain','consumed')),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (decision_id,part_id),
  foreign key (proposal_id,part_id) references crm_ha.parts(proposal_id,part_id)
);
create table crm_ha.events (
  event_id text primary key check (event_id ~ '^[a-z][a-z0-9-]{0,127}$'),
  proposal_id text not null references crm_ha.proposals(proposal_id),
  reservation_id text,
  attempt_id text,
  event_kind text not null check (event_kind in
    ('proposed','approved','rejected','reserved','attempted','succeeded','failed-known','uncertain','reconciled-succeeded','reconciled-failed')),
  actor_kind text not null check (actor_kind in ('human','technical')),
  actor_identity text not null,
  recorded_at timestamptz not null,
  details_fingerprint text not null check (details_fingerprint ~ '^[0-9a-f]{64}$')
);
create table crm_ha.command_receipts (
  command_id text primary key check (command_id ~ '^[a-z][a-z0-9-]{0,127}$'),
  command_fingerprint text not null check (command_fingerprint ~ '^[0-9a-f]{64}$'),
  command_name text not null,
  proposal_id text not null,
  decision_id text,
  reservation_id text,
  attempt_id text,
  state text not null,
  recorded_at timestamptz not null
);

do $$ declare t text; begin
  foreach t in array array['proposals','parts','decisions','reservations','events','command_receipts'] loop
    execute format('alter table crm_ha.%I owner to crm_h0_table_owner',t);
    execute format('alter table crm_ha.%I enable row level security',t);
    execute format('alter table crm_ha.%I force row level security',t);
    execute format('create policy h0_m04_executor on crm_ha.%I for all to crm_h0_f2_executor using (true) with check (true)',t);
  end loop;
end $$;
grant select,insert on crm_ha.proposals to crm_h0_f2_executor;
grant select,insert,update on crm_ha.reservations to crm_h0_f2_executor;
grant select,insert on crm_ha.parts,crm_ha.decisions,crm_ha.events,crm_ha.command_receipts to crm_h0_f2_executor;
revoke all on all tables in schema crm_ha from public,crm_h0_runtime;
revoke all on schema crm_ha from public,crm_h0_runtime;
do $$ begin
  if exists(select 1 from pg_roles where rolname='anon') then
    execute 'revoke all on all tables in schema crm_ha from anon';
    execute 'revoke all on schema crm_ha from anon';
  end if;
  if exists(select 1 from pg_roles where rolname='authenticated') then
    execute 'revoke all on all tables in schema crm_ha from authenticated';
    execute 'revoke all on schema crm_ha from authenticated';
  end if;
end $$;
grant usage on schema crm_ha to crm_h0_f2_executor;

-- M04 effect stages reuse the M02 ledger. The policy accepts rows only when
-- the current transaction has a valid, exact M04 capability for its reservation.
grant select,insert on crm_private.external_effect_records to crm_h0_f2_executor;
grant create on schema crm_ha to crm_h0_f2_executor;
create function crm_ha.effect_record_allows(operation_value text,root_value text,scope_value text,
  effect_value text,intent_value text,attempt_value text,stage_value text) returns boolean
language plpgsql volatile parallel unsafe security definer set search_path=pg_catalog,pg_temp as $$
declare f text[]; qf text[]; d text[]; r crm_ha.reservations%rowtype; p crm_ha.proposals%rowtype;
begin
  f:=crm_f1.verify_envelope(decode(current_setting('crm.ha_payload',true),'hex'),
    decode(current_setting('crm.ha_mac',true),'hex'),decode(current_setting('crm.ha_input',true),'hex'),
    'C03','human_approval','manage_effect');
  qf:=crm_f1.fields(decode(current_setting('crm.ha_input',true),'hex'));
  if cardinality(qf)<>4 or qf[1]<>'CRM-H0-M04' or qf[2] not in ('attempt','outcome','reconcile') then return false; end if;
  d:=crm_f1.fields(decode(qf[4],'hex'));
  if cardinality(d) not in (2,4) then return false; end if;
  select * into strict r from crm_ha.reservations where reservation_id=d[1];
  select * into strict p from crm_ha.proposals where proposal_id=r.proposal_id;
  if operation_value<>r.reservation_id or root_value<>'ha-'||r.reservation_id
    or effect_value<>r.effect_id or intent_value<>r.intent_id or scope_value<>p.scope
    or f[14]<>p.scope then return false; end if;
  if qf[2]='attempt' then return stage_value='attempt' and attempt_value=d[2] and r.state='attempting'; end if;
  if d[2]<>attempt_value then return false; end if;
  if d[3]='uncertain' then return stage_value='uncertain' and r.state='uncertain'; end if;
  return stage_value='result' and d[3] in ('succeeded','failed') and r.state in ('consumed','reserved');
exception when others then return false;
end $$;
alter function crm_ha.effect_record_allows(text,text,text,text,text,text,text) owner to crm_h0_f2_executor;
revoke all on function crm_ha.effect_record_allows(text,text,text,text,text,text,text) from public,crm_h0_runtime;
create policy h0_m04_effect_records on crm_private.external_effect_records for insert to crm_h0_f2_executor
  with check (crm_ha.effect_record_allows(operation_id,root_id,context_scope,effect_id,intent_id,attempt_id,stage));
create unique index h0_m04_effect_attempt_once on crm_private.external_effect_records(attempt_id) where stage='attempt';
create unique index h0_m04_effect_result_once on crm_private.external_effect_records(attempt_id) where stage='result';

-- q is a length-prefixed CRM-H0-M04 command. Data is a hex-encoded canonical
-- H0-HA-MATERIAL1 or command-specific field vector. F2 is used for human
-- proposals/decisions/reservations; technical attempt/results use F1 only.
create function crm_api.h0_m04_command(f2p bytea,f2s bytea,p bytea,s bytea,q bytea)
returns table(command_state text,proposal_id text,decision_id text,reservation_id text,
  attempt_id text,state text,material_fingerprint text)
language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare f text[]; qf text[]; d text[]; hf text[]; material bytea; part_material bytea;
  proposal_row crm_ha.proposals%rowtype; part_row crm_ha.parts%rowtype;
  decision_row crm_ha.decisions%rowtype; reservation_row crm_ha.reservations%rowtype;
  old crm_ha.command_receipts%rowtype; digest_value text; now_at timestamptz:=clock_timestamp();
  decision_value text; decision_key text; reservation_key text; attempt_key text;
  effect_key text; intent_key text; part_count integer; i integer; part_fields text[];
begin
  qf:=crm_f1.fields(q);
  if qf is null or cardinality(qf)<4 or qf[1]<>'CRM-H0-M04'
    or qf[3] !~ '^[a-z][a-z0-9-]{0,127}$' then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
  f:=crm_f1.verify_envelope(p,s,q,
    case when qf[2]='read' then 'C01' else 'C03' end,
    'human_approval',case when qf[2]='read' then 'read_proposal' else 'manage_effect' end);
  if qf[2] in ('propose','decide','reserve') then
    hf:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');
    if hf[17] collate "C"<>f[14] collate "C" then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
  end if;
  digest_value:=encode(crm_crypto.digest(q,'sha256'),'hex');
  insert into crm_f1.consumption values(f[5],f[6]::oid,f[8]::xid8,f[21],f[20]::bigint);
  perform pg_advisory_xact_lock(hashtextextended(qf[3],0));
  select * into old from crm_ha.command_receipts where command_id=qf[3];
  if found then
    if old.command_fingerprint collate "C"<>digest_value collate "C" then raise exception 'H0_M04_CONFLICT' using errcode='H0002'; end if;
    perform crm_f1.verify_envelope(p,s,q,'C03','human_approval','manage_effect');
    return query select 'previous',old.proposal_id,old.decision_id,old.reservation_id,old.attempt_id,old.state,old.command_fingerprint;
    return;
  end if;
  if qf[2]='propose' then
    if cardinality(qf)<>5 or qf[4] not in ('human','ai') then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    material:=decode(qf[5],'hex'); d:=crm_f1.fields(material);
    if encode(crm_f1.pack_fields(d),'hex')<>qf[5] or cardinality(d)<21
      or d[1]<>'CRM-H0-HA-MATERIAL1' or d[2]<>'1' or d[3]='' or d[4]=''
      or d[6] not in ('not-applicable','unknown','value') or d[8] not in ('not-applicable','unknown','value')
      or d[10] not in ('not-applicable','unknown','value') or d[14] not in ('not-applicable','unknown','value')
      or d[16] not in ('none','required') or d[20] !~ '^[1-9][0-9]?$'
      or cardinality(d)<>20+d[20]::integer*3
      or (d[6]<>'value' and d[7]<>'') or (d[8]<>'value' and d[9]<>'')
      or (d[10]<>'value' and d[11]<>'') or (d[14]<>'value' and d[15]<>'')
      or (d[16]='none' and (d[17]<>'' or d[18]<>'' or d[19]<>''))
      or (d[16]='required' and (d[17]='' or d[18] !~ '^[0-9a-f]{64}$' or d[19]=''))
    then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    perform 1 from crm_private.crm_actors a where a.actor_id=hf[12]::uuid and a.enabled
      and a.access_state='ready' and a.admin_scope=d[12] for update;
    if not found then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    hf:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');
    now_at:=clock_timestamp();
    insert into crm_ha.proposals values(qf[3],encode(crm_crypto.digest(material,'sha256'),'hex'),material,
      qf[4],hf[12]::uuid,d[12],now_at);
    part_count:=d[20]::integer;
    for i in 0..part_count-1 loop
      part_material:=decode(d[22+i*3],'hex'); part_fields:=crm_f1.fields(part_material);
      if encode(crm_f1.pack_fields(part_fields),'hex')<>d[22+i*3]
        or encode(crm_crypto.digest(part_material,'sha256'),'hex')<>d[23+i*3]
        or cardinality(part_fields)<>13 or part_fields[1]<>'CRM-H0-HA-PART1'
        or part_fields[2]<>d[21+i*3] or part_fields[12]<>d[12]
      then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
      insert into crm_ha.parts values(qf[3],d[21+i*3],d[23+i*3],part_material);
    end loop;
    insert into crm_ha.events values(qf[3],qf[3],null,null,'proposed',
      case when qf[4]='human' then 'human' else 'technical' end,
      hf[12],now_at,digest_value);
    insert into crm_ha.command_receipts values(qf[3],digest_value,'propose',qf[3],null,null,null,'proposed',now_at);
    return query select 'applied',qf[3],null::text,null::text,null::text,'proposed',encode(crm_crypto.digest(material,'sha256'),'hex'); return;
  elsif qf[2]='decide' then
    d:=crm_f1.fields(decode(qf[4],'hex'));
    if cardinality(qf)<>4 or cardinality(d)<>5 or d[1] !~ '^[a-z][a-z0-9-]{0,127}$'
      or d[2] !~ '^[a-z][a-z0-9-]{0,127}$' or d[3] not in ('approved','rejected') or d[4]='' or d[5] !~ '^[0-9a-f]{64}$'
    then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    perform pg_advisory_xact_lock(hashtextextended(d[1]||':decision',0));
    select * into strict proposal_row from crm_ha.proposals where proposal_id=d[1];
    if proposal_row.material_fingerprint collate "C"<>d[5] collate "C" or proposal_row.scope collate "C"<>hf[17] collate "C"
    then raise exception 'H0_M04_CONFLICT' using errcode='H0002'; end if;
    hf:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');
    now_at:=clock_timestamp();
    decision_key:=d[2]; decision_value:=d[3];
    insert into crm_ha.decisions values(decision_key,d[1],d[5],decision_value,d[4],hf[12]::uuid,hf[13]::uuid,now_at);
    insert into crm_ha.events values(qf[3],d[1],null,null,decision_value,'human',hf[12],now_at,digest_value);
    insert into crm_ha.command_receipts values(qf[3],digest_value,'decide',d[1],decision_key,null,null,decision_value,now_at);
    return query select 'applied',d[1],decision_key,null::text,null::text,decision_value,d[5]; return;
  elsif qf[2]='reserve' then
    d:=crm_f1.fields(decode(qf[4],'hex'));
    if cardinality(qf)<>4 or cardinality(d)<>7 or d[1] !~ '^[a-z][a-z0-9-]{0,127}$' or d[2] !~ '^[a-z][a-z0-9-]{0,127}$'
      or d[3] !~ '^[a-z][a-z0-9-]{0,127}$' or d[4] !~ '^[0-9a-f]{64}$'
      or d[5] !~ '^[0-9a-f]{64}$' or d[6] !~ '^[a-z][a-z0-9-]{0,127}$'
      or d[7] !~ '^[a-z][a-z0-9-]{0,127}$'
    then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    select * into strict proposal_row from crm_ha.proposals where proposal_id=d[1];
    select * into strict decision_row from crm_ha.decisions where decision_id=d[2] and proposal_id=d[1];
    perform pg_advisory_xact_lock(hashtextextended(d[1]||':'||d[3],0));
    select * into strict part_row from crm_ha.parts where proposal_id=d[1] and part_id=d[3];
    if decision_row.decision<>'approved' or proposal_row.material_fingerprint collate "C"<>d[4] collate "C"
      or part_row.material_fingerprint collate "C"<>d[5] collate "C" or proposal_row.scope collate "C"<>hf[17] collate "C"
      or proposal_row.material_payload is null
    then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    if (crm_f1.fields(proposal_row.material_payload))[16]<>'none' then
      raise exception 'H0_M04_EVIDENCE_UNVERIFIED' using errcode='42501'; end if;
    effect_key:='effect-'||substr(encode(crm_crypto.digest(convert_to(d[1]||':'||d[3],'UTF8'),'sha256'),'hex'),1,32);
    intent_key:='intent-'||substr(encode(crm_crypto.digest(convert_to(d[1]||':'||d[3],'UTF8'),'sha256'),'hex'),1,32);
    if d[6]<>effect_key or d[7]<>intent_key then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    hf:=crm_f2.admit(f2p,f2s,q,'C03','apply_probe_batch');
    now_at:=clock_timestamp();
    insert into crm_ha.reservations values(qf[3],d[1],d[2],d[3],d[5],effect_key,intent_key,'reserved',now_at,now_at);
    insert into crm_ha.events values(qf[3],d[1],qf[3],null,'reserved','human',hf[12],now_at,digest_value);
    insert into crm_ha.command_receipts values(qf[3],digest_value,'reserve',d[1],d[2],qf[3],null,'reserved',now_at);
    return query select 'applied',d[1],d[2],qf[3],null::text,'reserved',d[4]; return;
  elsif qf[2]='attempt' then
    d:=crm_f1.fields(decode(qf[4],'hex'));
    if cardinality(d)<>2 then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    select * into strict reservation_row from crm_ha.reservations where reservation_id=d[1] for update;
    if reservation_row.state<>'reserved' then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    now_at:=clock_timestamp();
    update crm_ha.reservations set state='attempting',updated_at=now_at where reservation_id=d[1];
    select * into strict proposal_row from crm_ha.proposals where proposal_id=reservation_row.proposal_id;
    insert into crm_ha.events values(qf[3],reservation_row.proposal_id,d[1],d[2],'attempted','technical',f[11],now_at,digest_value);
    perform set_config('crm.ha_payload',encode(p,'hex'),true),set_config('crm.ha_mac',encode(s,'hex'),true),
      set_config('crm.ha_input',encode(q,'hex'),true);
    insert into crm_private.external_effect_records(record_id,operation_id,root_id,context_scope,effect_id,
      stage,intent_id,attempt_id,recorded_at)
      values(d[2],d[1],'ha-'||d[1],proposal_row.scope,reservation_row.effect_id,'attempt',reservation_row.intent_id,d[2],now_at);
    perform set_config('crm.ha_payload','',true),set_config('crm.ha_mac','',true),set_config('crm.ha_input','',true);
    insert into crm_ha.command_receipts values(qf[3],digest_value,'attempt',reservation_row.proposal_id,reservation_row.decision_id,d[1],d[2],'attempting',now_at);
    return query select 'applied',reservation_row.proposal_id,reservation_row.decision_id,d[1],d[2],'attempting',reservation_row.material_fingerprint; return;
  elsif qf[2] in ('outcome','reconcile') then
    d:=crm_f1.fields(decode(qf[4],'hex'));
    if cardinality(d)<>4 or d[3] not in ('succeeded','failed','uncertain') or d[4]=''
    then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    select * into strict reservation_row from crm_ha.reservations where reservation_id=d[1] for update;
    perform 1 from crm_ha.events where attempt_id=d[2] and reservation_id=d[1] and event_kind='attempted';
    if not found or (qf[2]='outcome' and reservation_row.state<>'attempting')
      or (qf[2]='reconcile' and reservation_row.state<>'uncertain')
      or (qf[2]='reconcile' and d[3]='uncertain')
    then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
    now_at:=clock_timestamp();
    decision_value:=case when d[3]='uncertain' then 'uncertain' when d[3]='succeeded' then 'consumed' else 'reserved' end;
    update crm_ha.reservations set state=decision_value,updated_at=now_at where reservation_id=d[1];
    select * into strict proposal_row from crm_ha.proposals where proposal_id=reservation_row.proposal_id;
    insert into crm_ha.events values(qf[3],reservation_row.proposal_id,d[1],d[2],
      case when d[3]='uncertain' then 'uncertain' when qf[2]='reconcile' and d[3]='succeeded'
        then 'reconciled-succeeded' when qf[2]='reconcile' then 'reconciled-failed'
        when d[3]='succeeded' then 'succeeded' else 'failed-known' end,
      'technical',f[11],now_at,digest_value);
    perform set_config('crm.ha_payload',encode(p,'hex'),true),set_config('crm.ha_mac',encode(s,'hex'),true),
      set_config('crm.ha_input',encode(q,'hex'),true);
    if d[3]='uncertain' then
      insert into crm_private.external_effect_records(record_id,operation_id,root_id,context_scope,effect_id,
        stage,intent_id,attempt_id,recorded_at)
        values('uncertain-'||qf[3],d[1],'ha-'||d[1],proposal_row.scope,reservation_row.effect_id,
          'uncertain',reservation_row.intent_id,d[2],now_at);
    else
      insert into crm_private.external_effect_records(record_id,operation_id,root_id,context_scope,effect_id,
        stage,intent_id,attempt_id,outcome,result_reference,recorded_at)
        values('result-'||qf[3],d[1],'ha-'||d[1],proposal_row.scope,reservation_row.effect_id,
          'result',reservation_row.intent_id,d[2],d[3],d[4],now_at);
    end if;
    perform set_config('crm.ha_payload','',true),set_config('crm.ha_mac','',true),set_config('crm.ha_input','',true);
    insert into crm_ha.command_receipts values(qf[3],digest_value,qf[2],reservation_row.proposal_id,
      reservation_row.decision_id,d[1],d[2],decision_value,now_at);
    return query select 'applied',reservation_row.proposal_id,reservation_row.decision_id,d[1],d[2],decision_value,reservation_row.material_fingerprint; return;
  else raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
exception when sqlstate 'H0002' or unique_violation then raise exception 'H0_M04_CONFLICT' using errcode='H0002';
  when others then raise exception 'H0_M04_DENIED' using errcode='42501';
end $$;

create function crm_api.h0_m04_read_proposal(f2p bytea,f2s bytea,p bytea,s bytea,q bytea,proposal_key text)
returns table(proposal_id text,material_fingerprint text,material_payload bytea,decision text,decision_id text)
language plpgsql volatile parallel unsafe security definer set search_path=pg_catalog,pg_temp as $$
#variable_conflict use_column
declare f text[]; hf text[]; qf text[]; prop crm_ha.proposals%rowtype;
begin
  f:=crm_f1.verify_envelope(p,s,q,'C01','human_approval','read_proposal');
  qf:=crm_f1.fields(q);
  if cardinality(qf)<>3 or qf[1]<>'CRM-INP1' or qf[2]<>'C01'
    or qf[3]<>proposal_key then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
  hf:=crm_f2.admit(f2p,f2s,q,'C01','read_probe');
  if hf[17] collate "C"<>f[14] collate "C" then raise exception 'H0_M04_DENIED' using errcode='42501'; end if;
  select * into strict prop from crm_ha.proposals where proposal_id=proposal_key and scope=f[14];
  return query select prop.proposal_id,prop.material_fingerprint,prop.material_payload,d.decision,d.decision_id
    from crm_ha.decisions d where d.proposal_id=prop.proposal_id
    union all select prop.proposal_id,prop.material_fingerprint,prop.material_payload,null::text,null::text
    where not exists(select 1 from crm_ha.decisions where proposal_id=prop.proposal_id);
exception when others then raise exception 'H0_M04_DENIED' using errcode='42501'; end $$;

grant create on schema crm_api to crm_h0_f2_executor;
alter function crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
alter function crm_api.h0_m04_read_proposal(bytea,bytea,bytea,bytea,bytea,text) owner to crm_h0_f2_executor;
revoke all on function crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea),
  crm_api.h0_m04_read_proposal(bytea,bytea,bytea,bytea,bytea,text) from public,crm_h0_runtime;
grant execute on function crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea),
  crm_api.h0_m04_read_proposal(bytea,bytea,bytea,bytea,bytea,text) to crm_h0_runtime;
revoke create on schema crm_ha,crm_api from crm_h0_f2_executor,crm_h0_table_owner;
revoke create on schema crm_ha from crm_h0_table_owner;
commit;
