-- H1-005: local, structural catalog revisions and exact applied references.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H1_CATALOG_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;
grant usage, create on schema crm_private to crm_h0_f2_owner;
grant usage, create on schema crm_api to crm_h0_f2_executor;

create table crm_private.catalog_items (
  item_id uuid primary key,
  item_kind text not null check (item_kind in
    ('service','variant','category','attribute','audience','unit','pricing_form','provider',
     'offering','category_assignment','attribute_assignment','audience_recommendation',
     'unit_assignment','pricing_form_assignment')),
  admin_scope text not null check (admin_scope <> ''),
  parent_id uuid references crm_private.catalog_items(item_id),
  related_id uuid references crm_private.catalog_items(item_id),
  party_id uuid,
  party_kind text check (party_kind in ('contact','organization')),
  source_ref text not null check (source_ref <> ''),
  evidence_ref text not null check (evidence_ref <> ''),
  created_by uuid not null references crm_private.crm_actors(actor_id),
  created_at timestamptz not null default clock_timestamp(),
  foreign key (party_id,party_kind)
    references crm_private.identity_entities(identity_id,identity_kind),
  check ((party_id is null)=(party_kind is null)),
  check (parent_id is null or parent_id<>item_id),
  check (related_id is null or related_id<>item_id)
);
create table crm_private.catalog_revisions (
  revision_id uuid primary key,
  item_id uuid not null references crm_private.catalog_items(item_id),
  admin_scope text not null check (admin_scope <> ''),
  revision_number bigint not null check (revision_number>0),
  definition jsonb not null check (jsonb_typeof(definition)='object'),
  parent_revision_id uuid references crm_private.catalog_revisions(revision_id),
  related_revision_id uuid references crm_private.catalog_revisions(revision_id),
  source_ref text not null check (source_ref <> ''),
  evidence_ref text not null check (evidence_ref <> ''),
  reason text not null check (reason <> ''),
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  recorded_at timestamptz not null default clock_timestamp(),
  unique(item_id,revision_number)
);
create table crm_private.catalog_applications (
  application_id uuid primary key,
  subject_ref uuid not null,
  admin_scope text not null check (admin_scope <> ''),
  applied_revisions jsonb not null check (jsonb_typeof(applied_revisions)='array'
    and jsonb_array_length(applied_revisions)>0),
  source_ref text not null check (source_ref <> ''),
  evidence_ref text not null check (evidence_ref <> ''),
  reason text not null check (reason <> ''),
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.catalog_operations (
  operation_id uuid primary key,
  admin_scope text not null,
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  material_fingerprint text not null check (material_fingerprint ~ '^[0-9a-f]{64}$'),
  action_kind text not null,
  result_ref uuid not null,
  result_version bigint not null check (result_version>=0),
  recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.catalog_history (
  history_id uuid primary key,
  operation_id uuid not null unique references crm_private.catalog_operations(operation_id),
  subject_id uuid not null,
  admin_scope text not null,
  before_state jsonb,
  after_state jsonb not null,
  source_ref text not null,
  evidence_ref text not null,
  reason text not null,
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  recorded_at timestamptz not null default clock_timestamp()
);
do $$ declare t text; begin
  foreach t in array array['catalog_items','catalog_revisions','catalog_applications',
    'catalog_operations','catalog_history'] loop
    execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
    execute format('alter table crm_private.%I enable row level security',t);
    execute format('alter table crm_private.%I force row level security',t);
    execute format('create policy h1_catalog_executor on crm_private.%I for all to crm_h0_f2_executor using (true) with check (true)',t);
    execute format('create policy h1_catalog_migration on crm_private.%I for all to crm_h0_migration using (true) with check (true)',t);
    execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor',t);
    execute format('grant select,insert,update on crm_private.%I to crm_h0_migration',t);
    execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
  end loop;
end $$;
-- UPDATE privilege is needed for SELECT FOR UPDATE on the stable item row.
grant update on crm_private.catalog_items to crm_h0_f2_executor;

-- Extend only the named H1 partition of F1/F2. H0 and D039 branches stay intact.
do $patch$
declare definition text; old_text text; new_text text;
begin
  definition:=pg_get_functiondef('crm_f1.verify_envelope(bytea,bytea,bytea,text,text,text)'::regprocedure);
  old_text:=$old$(f[13]='h1-identities' and f[16]='identities'
            and ((f[15]='C01' and f[17]='read_identity')
              or (f[15]='C03' and f[17]='write_identity')))$old$;
  new_text:=$new$((f[13]='h1-identities' and f[16]='identities'
            and ((f[15]='C01' and f[17]='read_identity')
              or (f[15]='C03' and f[17]='write_identity')))
          or (f[13]='h1-catalog' and f[16]='catalog'
            and ((f[15]='C01' and f[17]='read_catalog')
              or (f[15]='C03' and f[17]='write_catalog'))))$new$;
  if length(definition)-length(replace(definition,old_text,''))<>length(old_text) then
    raise exception 'H1_CATALOG_F1_PREDECESSOR_MISMATCH'; end if;
  execute replace(definition,old_text,new_text);
  definition:=pg_get_functiondef('crm_f2.verify(bytea,bytea,bytea,text,text,text)'::regprocedure);
  old_text:=$old$or (session_user='crm_h0_runtime' and f[19]='human_identities'
          and ((f[18]='C01' and f[20]='read_identity') or (f[18]='C03' and f[20]='write_identity')))$old$;
  new_text:=$new$or (session_user='crm_h0_runtime' and f[19]='human_identities'
          and ((f[18]='C01' and f[20]='read_identity') or (f[18]='C03' and f[20]='write_identity')))
        or (session_user='crm_h0_runtime' and f[19]='human_catalog'
          and ((f[18]='C01' and f[20]='read_catalog') or (f[18]='C03' and f[20]='write_catalog')))$new$;
  if length(definition)-length(replace(definition,old_text,''))<>length(old_text) then
    raise exception 'H1_CATALOG_F2_PREDECESSOR_MISMATCH'; end if;
  execute replace(definition,old_text,new_text);
  definition:=pg_get_functiondef('crm_f2.admit(bytea,bytea,bytea,text,text)'::regprocedure);
  old_text:=$old$case when expected_action in ('read_identity','write_identity')
      then 'human_identities' else 'human_core_probe' end$old$;
  new_text:=$new$case when expected_action in ('read_catalog','write_catalog')
      then 'human_catalog' when expected_action in ('read_identity','write_identity')
      then 'human_identities' else 'human_core_probe' end$new$;
  if length(definition)-length(replace(definition,old_text,''))<>3*length(old_text) then
    raise exception 'H1_CATALOG_ADMIT_PREDECESSOR_MISMATCH'; end if;
  execute replace(definition,old_text,new_text);
end $patch$;

-- Closed structural fields. No tariff, capacity, availability or eligibility column.
create function crm_private.catalog_definition_valid(k text,d jsonb)
returns boolean language sql immutable parallel safe
set search_path=pg_catalog,pg_temp as $$
  select coalesce(jsonb_typeof(d)='object' and case
    when k='service' then
      nullif(d->>'name','') is not null and d->>'nature' in ('internal','external')
      and (d - 'name' - 'nature' - 'description')='{}'::jsonb
    when k in ('variant','category','attribute','audience','provider') then
      nullif(d->>'name','') is not null and
      (d - 'name' - 'description')='{}'::jsonb
    when k in ('unit','pricing_form') then
      nullif(d->>'name','') is not null and nullif(d->>'definition','') is not null
      and (d - 'name' - 'definition')='{}'::jsonb
    when k='audience_recommendation' then
      d->>'priority' in ('Alta','Media','Baja')
      and (d - 'priority' - 'description')='{}'::jsonb
    when k='offering' then
      (d - 'conditions' - 'location' - 'valid_from' - 'valid_until')='{}'::jsonb
    else (d - 'description')='{}'::jsonb
  end,false)
$$;
alter function crm_private.catalog_definition_valid(text,jsonb) owner to crm_h0_f2_owner;
revoke execute on function crm_private.catalog_definition_valid(text,jsonb) from public;
grant execute on function crm_private.catalog_definition_valid(text,jsonb) to crm_h0_f2_executor;

-- Signed vector: magic, action, operation, target, kind, parent, related,
-- party, party-kind, definition, source, evidence, reason, expected, revision-list.
create function crm_api.catalog_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(result_ref uuid,result_version bigint,replayed boolean)
language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
declare hf text[]; tf text[]; v text[]; op crm_private.catalog_operations%rowtype;
  item crm_private.catalog_items%rowtype; endpoint crm_private.catalog_items%rowtype;
  rev crm_private.catalog_revisions%rowtype; parent_rev crm_private.catalog_revisions%rowtype;
  related_rev crm_private.catalog_revisions%rowtype;
  actor uuid; scope text; target uuid; parent uuid; related uuid; party uuid;
  expected bigint; next_version bigint; fingerprint text; before_state jsonb;
  after_state jsonb; result_id uuid; refs text[]; seen text[]:=array[]::text[];
  ref text; snapshot jsonb:='[]'::jsonb; definition jsonb;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C03','write_catalog');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','catalog','write_catalog');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'CATALOG_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>15 or v[1]<>'CRM-H1-CAT1'
    or v[2] not in ('create_item','publish_version','fix_application')
    or v[3] is null or v[4] is null or v[11] is null
    or v[12] is null or v[12]='' or v[13] is null or v[13]=''
    or v[14] !~ '^(0|[1-9][0-9]{0,18})$'
  then raise exception 'CATALOG_INPUT_INVALID' using errcode='22023'; end if;
  target:=v[4]::uuid; parent:=nullif(v[6],'')::uuid;
  related:=nullif(v[7],'')::uuid; party:=nullif(v[8],'')::uuid;
  actor:=hf[12]::uuid; scope:=hf[17]; expected:=v[14]::bigint;
  fingerprint:=encode(crm_crypto.digest(q,'sha256'),'hex');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v[3],0));
  select * into op from crm_private.catalog_operations where operation_id=v[3]::uuid;
  if found then
    if op.actor_id<>actor or op.admin_scope<>scope or op.material_fingerprint<>fingerprint then
      raise exception 'CATALOG_REPLAY_CONFLICT' using errcode='23505'; end if;
    perform crm_f2.verify(f2p,f2s,q,'C03','human_catalog','write_catalog');
    result_ref:=op.result_ref; result_version:=op.result_version;
    replayed:=true; return next; return;
  end if;
  if v[2]='create_item' then
    if expected<>0 or v[10]<>'{}' or v[15]<>'' or v[5] not in
      ('service','variant','category','attribute','audience','unit','pricing_form','provider',
       'offering','category_assignment','attribute_assignment','audience_recommendation',
       'unit_assignment','pricing_form_assignment')
    then raise exception 'CATALOG_INPUT_INVALID' using errcode='22023'; end if;
    if v[5] in ('service','category','attribute','audience','unit','pricing_form','provider') then
      if parent is not null or related is not null then
        raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    elsif v[5]='variant' then
      if parent is null or related is not null then
        raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    else
      if parent is null or related is null then
        raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    end if;
    if v[5]<>'provider' and (party is not null or v[9]<>'') then
      raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    if v[5]='provider' and (party is null)<>(v[9]='') then
      raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    if party is not null and not exists(select 1 from crm_private.identity_entities e
      where e.identity_id=party and e.identity_kind=v[9] and e.admin_scope=scope
        and e.identity_verified and e.archived_at is null) then
      raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    if parent is not null then
      select * into endpoint from crm_private.catalog_items where item_id=parent for share;
      if not found or endpoint.admin_scope<>scope or not (
        (v[5]='variant' and endpoint.item_kind='service') or
        (v[5]='offering' and endpoint.item_kind='provider') or
        (v[5] in ('category_assignment','attribute_assignment','audience_recommendation',
          'unit_assignment','pricing_form_assignment')
          and endpoint.item_kind in ('service','variant'))) then
        raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    end if;
    if related is not null then
      select * into endpoint from crm_private.catalog_items where item_id=related for share;
      if not found or endpoint.admin_scope<>scope or not (
        (v[5]='offering' and endpoint.item_kind in ('service','variant')) or
        (v[5]='category_assignment' and endpoint.item_kind='category') or
        (v[5]='attribute_assignment' and endpoint.item_kind='attribute') or
        (v[5]='audience_recommendation' and endpoint.item_kind='audience') or
        (v[5]='unit_assignment' and endpoint.item_kind='unit') or
        (v[5]='pricing_form_assignment' and endpoint.item_kind='pricing_form')) then
        raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    end if;
    insert into crm_private.catalog_items(item_id,item_kind,admin_scope,parent_id,related_id,
      party_id,party_kind,source_ref,evidence_ref,created_by)
      values(target,v[5],scope,parent,related,party,nullif(v[9],''),v[11],v[12],actor);
    select to_jsonb(i) into after_state from crm_private.catalog_items i where i.item_id=target;
    result_id:=target; next_version:=0;
  elsif v[2]='publish_version' then
    if party is not null or v[9]<>'' or v[15]<>'' then
      raise exception 'CATALOG_INPUT_INVALID' using errcode='22023'; end if;
    select * into item from crm_private.catalog_items i where i.item_id=target for update;
    if not found or item.admin_scope<>scope or item.item_kind<>v[5] then
      raise exception 'CATALOG_DENIED' using errcode='42501'; end if;
    select coalesce(max(revision_number),0) into next_version
      from crm_private.catalog_revisions where item_id=target;
    if next_version<>expected then
      raise exception 'CATALOG_VERSION_CONFLICT' using errcode='40001'; end if;
    definition:=v[10]::jsonb;
    if not crm_private.catalog_definition_valid(item.item_kind,definition) then
      raise exception 'CATALOG_DEFINITION_INVALID' using errcode='22023'; end if;
    if item.parent_id is null and parent is not null
      or item.parent_id is not null and parent is null
      or item.related_id is null and related is not null
      or item.related_id is not null and related is null then
      raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    if parent is not null then
      select * into parent_rev from crm_private.catalog_revisions r where r.revision_id=parent;
      if not found or parent_rev.item_id<>item.parent_id or parent_rev.admin_scope<>scope then
        raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    end if;
    if related is not null then
      select * into related_rev from crm_private.catalog_revisions r where r.revision_id=related;
      if not found or related_rev.item_id<>item.related_id or related_rev.admin_scope<>scope then
        raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
    end if;
    select to_jsonb(r) into before_state from crm_private.catalog_revisions r
      where r.item_id=target order by r.revision_number desc limit 1;
    insert into crm_private.catalog_revisions(revision_id,item_id,admin_scope,revision_number,
      definition,parent_revision_id,related_revision_id,source_ref,evidence_ref,reason,actor_id)
      values(v[3]::uuid,target,scope,next_version+1,definition,parent,related,
        v[11],v[12],v[13],actor);
    next_version:=next_version+1; result_id:=v[3]::uuid;
    select jsonb_build_object('revision',to_jsonb(r),'item',to_jsonb(i))
      into after_state from crm_private.catalog_revisions r
      join crm_private.catalog_items i on i.item_id=r.item_id
      where r.revision_id=result_id;
  else
    if v[5]<>'application' or parent is null or related is not null
      or party is not null or v[9]<>'' or v[10]<>'{}' or expected<>0
    then raise exception 'CATALOG_INPUT_INVALID' using errcode='22023'; end if;
    refs:=string_to_array(v[15],',');
    if refs is null or cardinality(refs)<1 or cardinality(refs)>50 then
      raise exception 'CATALOG_INPUT_INVALID' using errcode='22023'; end if;
    foreach ref in array refs loop
      if ref !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        or ref=any(seen) then
        raise exception 'CATALOG_INPUT_INVALID' using errcode='22023'; end if;
      seen:=array_append(seen,ref);
      select * into rev from crm_private.catalog_revisions r where r.revision_id=ref::uuid;
      if not found or rev.admin_scope<>scope then
        raise exception 'CATALOG_RELATION_INVALID' using errcode='22023'; end if;
      select * into item from crm_private.catalog_items i where i.item_id=rev.item_id;
      snapshot:=snapshot || jsonb_build_array(jsonb_build_object(
        'revision',to_jsonb(rev),'item',to_jsonb(item)));
    end loop;
    insert into crm_private.catalog_applications(application_id,subject_ref,admin_scope,
      applied_revisions,source_ref,evidence_ref,reason,actor_id)
      values(target,parent,scope,snapshot,v[11],v[12],v[13],actor);
    select to_jsonb(a) into after_state from crm_private.catalog_applications a
      where a.application_id=target;
    result_id:=target; next_version:=0;
  end if;
  insert into crm_private.catalog_operations(operation_id,admin_scope,actor_id,
    material_fingerprint,action_kind,result_ref,result_version)
    values(v[3]::uuid,scope,actor,fingerprint,v[2],result_id,next_version);
  insert into crm_private.catalog_history(history_id,operation_id,subject_id,admin_scope,
    before_state,after_state,source_ref,evidence_ref,reason,actor_id)
    values(v[3]::uuid,v[3]::uuid,target,scope,before_state,after_state,
      v[11],v[12],v[13],actor);
  perform crm_f2.verify(f2p,f2s,q,'C03','human_catalog','write_catalog');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C03','catalog','write_catalog');
  result_ref:=result_id; result_version:=next_version; replayed:=false; return next;
end $$;
alter function crm_api.catalog_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.catalog_apply(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.catalog_apply(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

create function crm_api.catalog_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
declare hf text[]; tf text[]; v text[]; target uuid; output jsonb;
  page_limit integer; page_offset integer; total integer; next_page text;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C01','read_catalog');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','catalog','read_catalog');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'CATALOG_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>5 or v[1]<>'CRM-H1-CAT-READ1'
    or v[2] not in ('item','version','application','history')
    or v[4] !~ '^[1-9][0-9]{0,2}$' or v[5] !~ '^(0|[1-9][0-9]{0,8})$'
  then raise exception 'CATALOG_INPUT_INVALID' using errcode='22023'; end if;
  target:=v[3]::uuid; page_limit:=v[4]::integer; page_offset:=v[5]::integer;
  if page_limit>100 then raise exception 'CATALOG_INPUT_INVALID' using errcode='22023'; end if;
  if v[2]='item' then
    select jsonb_build_object('item',to_jsonb(i),'latest_revision',to_jsonb(r))
      into output from crm_private.catalog_items i
      left join lateral (select * from crm_private.catalog_revisions r
        where r.item_id=i.item_id order by r.revision_number desc limit 1) r on true
      where i.item_id=target and i.admin_scope=hf[17];
  elsif v[2]='version' then
    select jsonb_build_object('revision',to_jsonb(r),'item',to_jsonb(i))
      into output from crm_private.catalog_revisions r
      join crm_private.catalog_items i on i.item_id=r.item_id
      where r.revision_id=target and r.admin_scope=hf[17];
  elsif v[2]='application' then
    select to_jsonb(a) into output from crm_private.catalog_applications a
      where a.application_id=target and a.admin_scope=hf[17];
  else
    select coalesce(jsonb_agg(to_jsonb(h) order by h.recorded_at,h.history_id),'[]'::jsonb)
      into output from crm_private.catalog_history h
      where h.subject_id=target and h.admin_scope=hf[17];
  end if;
  if v[2]='history' then
    total:=jsonb_array_length(output);
    select coalesce(jsonb_agg(x.value order by x.ordinality),'[]'::jsonb) into output
      from jsonb_array_elements(output) with ordinality x(value,ordinality)
      where x.ordinality>page_offset and x.ordinality<=page_offset+page_limit;
    next_page:=case when page_offset+page_limit<total
      then (page_offset+page_limit)::text else null end;
  else
    if page_offset<>0 then raise exception 'CATALOG_INPUT_INVALID' using errcode='22023'; end if;
    next_page:=null;
  end if;
  perform crm_f2.verify(f2p,f2s,q,'C01','human_catalog','read_catalog');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C01','catalog','read_catalog');
  return jsonb_build_object('data',output,'nextPage',next_page);
end $$;
alter function crm_api.catalog_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.catalog_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.catalog_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
