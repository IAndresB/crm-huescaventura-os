-- H1-007: local structural commercial configuration. No monetary engine or real catalog values.
begin;
do $$ begin
  if current_user <> 'crm_h0_migration' then
    raise exception 'H1_COMMERCIAL_MIGRATION_AUTHORITY_REQUIRED' using errcode='42501';
  end if;
end $$;
grant usage, create on schema crm_private to crm_h0_f2_owner;
grant usage, create on schema crm_api to crm_h0_f2_executor;

create table crm_private.commercial_items (
  item_id uuid primary key,
  item_kind text not null check (item_kind in
    ('tariff','pack','custom_pack','promotion','capacity_rule','eligibility_rule','document_requirement')),
  admin_scope text not null check (admin_scope<>''),
  catalog_item_id uuid references crm_private.catalog_items(item_id),
  origin_custom_revision_id uuid,
  source_ref text not null check (source_ref<>''),
  evidence_ref text not null check (evidence_ref<>''),
  created_by uuid not null references crm_private.crm_actors(actor_id),
  created_at timestamptz not null default clock_timestamp(),
  check (origin_custom_revision_id is null or item_kind='pack')
);
create table crm_private.commercial_revisions (
  revision_id uuid primary key,
  item_id uuid not null references crm_private.commercial_items(item_id),
  admin_scope text not null check (admin_scope<>''),
  revision_number bigint not null check (revision_number>0),
  definition jsonb not null check (jsonb_typeof(definition)='object'),
  base_currency text not null default 'EUR' check (base_currency='EUR'),
  catalog_snapshot jsonb not null check (jsonb_typeof(catalog_snapshot)='array'),
  validity_kind text not null check (validity_kind in ('unknown','civil_date','instant')),
  valid_from text,
  valid_until text,
  source_ref text not null check (source_ref<>''),
  evidence_ref text not null check (evidence_ref<>''),
  reason text not null check (reason<>''),
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  recorded_at timestamptz not null default clock_timestamp(),
  unique(item_id,revision_number),
  check ((validity_kind='unknown')=(valid_from is null and valid_until is null))
);
alter table crm_private.commercial_items add constraint commercial_origin_fk
  foreign key(origin_custom_revision_id) references crm_private.commercial_revisions(revision_id);
create table crm_private.commercial_applications (
  application_id uuid primary key,
  subject_ref uuid not null,
  admin_scope text not null check (admin_scope<>''),
  applied_revisions jsonb not null check (jsonb_typeof(applied_revisions)='array'
    and jsonb_array_length(applied_revisions)>0),
  source_ref text not null check (source_ref<>''),
  evidence_ref text not null check (evidence_ref<>''),
  reason text not null check (reason<>''),
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.commercial_operations (
  operation_id uuid primary key,
  admin_scope text not null,
  actor_id uuid not null references crm_private.crm_actors(actor_id),
  fingerprint text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
  result_ref uuid not null,
  result_version bigint not null check (result_version>=0),
  recorded_at timestamptz not null default clock_timestamp()
);
create table crm_private.commercial_history (
  history_id uuid primary key,
  operation_id uuid not null unique references crm_private.commercial_operations(operation_id),
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
  foreach t in array array['commercial_items','commercial_revisions','commercial_applications',
    'commercial_operations','commercial_history'] loop
    execute format('alter table crm_private.%I owner to crm_h0_f2_owner',t);
    execute format('alter table crm_private.%I enable row level security',t);
    execute format('alter table crm_private.%I force row level security',t);
    execute format('create policy h1_commercial_executor on crm_private.%I for all to crm_h0_f2_executor using (true) with check (true)',t);
    execute format('create policy h1_commercial_migration on crm_private.%I for all to crm_h0_migration using (true) with check (true)',t);
    execute format('grant select,insert on crm_private.%I to crm_h0_f2_executor',t);
    execute format('grant select,insert,update on crm_private.%I to crm_h0_migration',t);
    execute format('revoke all on crm_private.%I from public,crm_h0_runtime',t);
    if exists(select 1 from pg_catalog.pg_roles where rolname='anon') then
      execute format('revoke all on crm_private.%I from anon',t);
    end if;
    if exists(select 1 from pg_catalog.pg_roles where rolname='authenticated') then
      execute format('revoke all on crm_private.%I from authenticated',t);
    end if;
  end loop;
end $$;
grant update on crm_private.commercial_items to crm_h0_f2_executor;

-- A deliberately closed shape. Unknown values are explicit, never NULL-as-zero.
create function crm_private.commercial_definition_valid(k text,d jsonb)
returns boolean language plpgsql immutable parallel safe
set search_path=pg_catalog,pg_temp as $$
declare c jsonb; amount_pattern constant text:='^-?[0-9]+(\.[0-9]+)?$';
begin
  if jsonb_typeof(d)<>'object' then return false; end if;
  if k='tariff' then
    if d - 'label' - 'price_state' - 'amount' - 'cost_state' - 'cost_amount'
      - 'vat_treatment' - 'unit_revision_id' - 'pricing_form_revision_id'
      - 'conditions' - 'tiers' <> '{}'::jsonb
      or nullif(d->>'label','') is null
      or d->>'price_state' is null or d->>'price_state' not in ('unknown','estimated','confirmed','real')
      or d->>'cost_state' is null or d->>'cost_state' not in ('unknown','estimated','confirmed','real')
      or d->>'vat_treatment' is null or d->>'vat_treatment' not in ('unknown','included','excluded')
    then return false; end if;
    if (d->>'price_state'='unknown') <> (not d ? 'amount')
      or (d->>'cost_state'='unknown') <> (not d ? 'cost_amount') then return false; end if;
    if d ? 'amount' and (jsonb_typeof(d->'amount')<>'string'
      or d->>'amount' !~ amount_pattern) then return false; end if;
    if d ? 'cost_amount' and (jsonb_typeof(d->'cost_amount')<>'string'
      or d->>'cost_amount' !~ amount_pattern) then return false; end if;
    if d ? 'tiers' and jsonb_typeof(d->'tiers')<>'array' then return false; end if;
    if d ? 'tiers' then
      for c in select value from jsonb_array_elements(d->'tiers') loop
        if jsonb_typeof(c)<>'object' or c - 'label' - 'amount_state' - 'amount'
          - 'minimum' - 'maximum' - 'unit_revision_id' - 'variant_revision_id'
          - 'condition' <> '{}'::jsonb
          or nullif(c->>'label','') is null
          or c->>'amount_state' is null
          or c->>'amount_state' not in ('unknown','estimated','confirmed','real')
          or (c->>'amount_state'='unknown')<>(not c ? 'amount')
          or (c ? 'amount' and (jsonb_typeof(c->'amount')<>'string'
            or c->>'amount' !~ amount_pattern))
          or (c ? 'minimum' and (jsonb_typeof(c->'minimum')<>'string'
            or c->>'minimum' !~ amount_pattern))
          or (c ? 'maximum' and (jsonb_typeof(c->'maximum')<>'string'
            or c->>'maximum' !~ amount_pattern))
          or (c ? 'unit_revision_id' and jsonb_typeof(c->'unit_revision_id')<>'string')
          or (c ? 'variant_revision_id' and jsonb_typeof(c->'variant_revision_id')<>'string')
        then return false; end if;
        if c ? 'minimum' and c ? 'maximum'
          and (c->>'minimum')::numeric>(c->>'maximum')::numeric then return false; end if;
      end loop;
    end if;
    return true;
  elsif k in ('pack','custom_pack') then
    if d - 'name' - 'components' - 'conditions' <> '{}'::jsonb
      or nullif(d->>'name','') is null or jsonb_typeof(d->'components')<>'array'
      or jsonb_array_length(d->'components')<1 or jsonb_array_length(d->'components')>50
    then return false; end if;
    for c in select value from jsonb_array_elements(d->'components') loop
      if jsonb_typeof(c)<>'object' or c - 'service_revision_id' - 'unit_revision_id'
        - 'quantity' - 'included' <> '{}'::jsonb
        or nullif(c->>'service_revision_id','') is null
        or jsonb_typeof(c->'service_revision_id')<>'string'
        or (c ? 'quantity')<>(c ? 'unit_revision_id')
        or (c ? 'quantity' and (jsonb_typeof(c->'quantity')<>'string'
          or c->>'quantity' !~ amount_pattern))
        or (c ? 'unit_revision_id' and jsonb_typeof(c->'unit_revision_id')<>'string')
        or (c ? 'included' and jsonb_typeof(c->'included')<>'boolean')
      then return false; end if;
    end loop;
    return true;
  elsif k='promotion' then
    return d - 'label'=jsonb_build_object('policy','novio_gratis',
      'minimum_attendees','15','required_lodging','1','required_activity','1',
      'required_restaurant','1','required_tarari_drinks','2',
      'effect_basis','honoree_modality_final_person_price')
      and (not d ? 'label' or nullif(d->>'label','') is not null);
  elsif k='capacity_rule' then
    if d - 'knowledge' - 'unit_revision_id' - 'minimum' - 'maximum' - 'condition' <> '{}'::jsonb
      or d->>'knowledge' is null or d->>'knowledge' not in ('unknown','known') then return false; end if;
    if d->>'knowledge'='unknown' then return not (d ? 'minimum' or d ? 'maximum'); end if;
    if not (d ? 'unit_revision_id' and d ? 'maximum'
      and jsonb_typeof(d->'unit_revision_id')='string'
      and jsonb_typeof(d->'maximum')='string' and d->>'maximum' ~ amount_pattern
      and (not d ? 'minimum' or (jsonb_typeof(d->'minimum')='string'
        and d->>'minimum' ~ amount_pattern))) then return false; end if;
    return (d->>'maximum')::numeric>=0
      and (not d ? 'minimum' or ((d->>'minimum')::numeric>=0
        and (d->>'minimum')::numeric<=(d->>'maximum')::numeric));
  elsif k='eligibility_rule' then
    if d - 'knowledge' - 'criterion' - 'purpose' <> '{}'::jsonb
      or d->>'knowledge' is null or d->>'knowledge' not in ('unknown','known') then return false; end if;
    return case when d->>'knowledge'='unknown' then not d ? 'criterion'
      else nullif(d->>'criterion','') is not null and nullif(d->>'purpose','') is not null end;
  elsif k='document_requirement' then
    if d - 'knowledge' - 'purpose' - 'document_kind' - 'essential' <> '{}'::jsonb
      or d->>'knowledge' is null or d->>'knowledge' not in ('unknown','known')
      or nullif(d->>'purpose','') is null then return false; end if;
    return case when d->>'knowledge'='unknown'
      then not (d ? 'document_kind' or d ? 'essential')
      else nullif(d->>'document_kind','') is not null
        and jsonb_typeof(d->'essential')='boolean' end;
  end if;
  return false;
end $$;
alter function crm_private.commercial_definition_valid(text,jsonb) owner to crm_h0_f2_owner;
revoke execute on function crm_private.commercial_definition_valid(text,jsonb) from public;
grant execute on function crm_private.commercial_definition_valid(text,jsonb) to crm_h0_f2_executor;

-- Signed vector: magic, action, operation, target, kind, catalog item, catalog revision,
-- origin custom revision / application subject, definition, validity, source, evidence,
-- reason, expected version, applied revision IDs.
create function crm_api.commercial_apply(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns table(result_ref uuid,result_version bigint,replayed boolean)
language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
declare hf text[]; tf text[]; v text[]; op crm_private.commercial_operations%rowtype;
  item crm_private.commercial_items%rowtype; catalog_item crm_private.catalog_items%rowtype;
  catalog_rev crm_private.catalog_revisions%rowtype; prior crm_private.commercial_revisions%rowtype;
  rev crm_private.commercial_revisions%rowtype; source_item crm_private.commercial_items%rowtype;
  actor uuid; scope text; target uuid; linked_item uuid; linked_rev uuid; origin uuid;
  expected bigint; next_version bigint; fingerprint text; before_state jsonb;
  after_state jsonb; result_id uuid; definition jsonb; snapshot jsonb:='[]'::jsonb;
  component jsonb; unit_id uuid; refs text[]; seen text[]:=array[]::text[];
  ref text; ref_kind text;
  start_value text; end_value text; validity_kind_value text;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C03','write_catalog');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C03','catalog','write_catalog');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'COMMERCIAL_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>16 or v[1]<>'CRM-H1-COM1'
    or v[2] not in ('create','publish','fix_application','promote_custom')
    or v[3] is null or v[4] is null or v[13] is null or v[13]=''
    or v[14] is null or v[14]='' or v[15] is null or v[15]=''
    or v[16] !~ '^(0|[1-9][0-9]{0,18})$'
  then raise exception 'COMMERCIAL_INPUT_INVALID' using errcode='22023'; end if;
  target:=v[4]::uuid; linked_item:=nullif(v[6],'')::uuid;
  linked_rev:=nullif(v[7],'')::uuid; origin:=nullif(v[8],'')::uuid;
  actor:=hf[12]::uuid; scope:=hf[17]; expected:=v[16]::bigint;
  fingerprint:=encode(crm_crypto.digest(q,'sha256'),'hex');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v[3],0));
  select * into op from crm_private.commercial_operations where operation_id=v[3]::uuid;
  if found then
    if op.actor_id<>actor or op.admin_scope<>scope or op.fingerprint<>fingerprint then
      raise exception 'COMMERCIAL_REPLAY_CONFLICT' using errcode='23505'; end if;
    perform crm_f2.verify(f2p,f2s,q,'C03','human_catalog','write_catalog');
    result_ref:=op.result_ref; result_version:=op.result_version;
    replayed:=true; return next; return;
  end if;
  if v[2]='create' then
    if expected<>0 or v[9]<>'{}' or v[7]<>'' or v[8]<>'' or v[10]<>'' or v[11]<>'' or v[12]<>''
      or v[5] not in ('tariff','pack','custom_pack','promotion','capacity_rule','eligibility_rule','document_requirement')
    then raise exception 'COMMERCIAL_INPUT_INVALID' using errcode='22023'; end if;
    if (v[5] in ('pack','custom_pack','promotion'))<>(linked_item is null) then
      raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
    if linked_item is not null then
      select * into catalog_item from crm_private.catalog_items where item_id=linked_item for share;
      if not found or catalog_item.admin_scope<>scope or catalog_item.item_kind not in
        ('service','variant','offering','provider')
        or (v[5] in ('tariff','capacity_rule','eligibility_rule') and catalog_item.item_kind='provider')
      then raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
    end if;
    insert into crm_private.commercial_items(item_id,item_kind,admin_scope,catalog_item_id,
      source_ref,evidence_ref,created_by)
      values(target,v[5],scope,linked_item,v[13],v[14],actor);
    select to_jsonb(i) into after_state from crm_private.commercial_items i where i.item_id=target;
    result_id:=target; next_version:=0;
  elsif v[2]='publish' then
    if v[8]<>'' or v[5]='application' or v[12]<>'' then
      raise exception 'COMMERCIAL_INPUT_INVALID' using errcode='22023'; end if;
    select * into item from crm_private.commercial_items i where i.item_id=target for update;
    if not found or item.admin_scope<>scope or item.item_kind<>v[5]
      or item.catalog_item_id is distinct from linked_item then
      raise exception 'COMMERCIAL_DENIED' using errcode='42501'; end if;
    select coalesce(max(revision_number),0) into next_version
      from crm_private.commercial_revisions where item_id=target;
    if next_version<>expected then
      raise exception 'COMMERCIAL_VERSION_CONFLICT' using errcode='40001'; end if;
    definition:=v[9]::jsonb;
    if not crm_private.commercial_definition_valid(item.item_kind,definition) then
      raise exception 'COMMERCIAL_DEFINITION_INVALID' using errcode='22023'; end if;
    start_value:=nullif(v[10],''); end_value:=nullif(v[11],'');
    validity_kind_value:=case when start_value is null and end_value is null then 'unknown'
      when coalesce(start_value,end_value) ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then 'civil_date'
      else 'instant' end;
    if validity_kind_value='civil_date' then
      if (start_value is not null and start_value !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
        or (end_value is not null and end_value !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
        or (start_value is not null and end_value is not null
          and start_value::date>end_value::date) then
        raise exception 'COMMERCIAL_VALIDITY_INVALID' using errcode='22023'; end if;
    elsif validity_kind_value='instant' then
      if (start_value is not null and start_value !~
          '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$')
        or (end_value is not null and end_value !~
          '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$')
        or (start_value is not null and end_value is not null
          and start_value::timestamptz>end_value::timestamptz) then
        raise exception 'COMMERCIAL_VALIDITY_INVALID' using errcode='22023'; end if;
    end if;
    if linked_item is null and linked_rev is not null
      or linked_item is not null and linked_rev is null then
      raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
    if linked_rev is not null then
      select * into catalog_rev from crm_private.catalog_revisions where revision_id=linked_rev;
      if not found or catalog_rev.item_id<>linked_item or catalog_rev.admin_scope<>scope then
        raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
      select * into catalog_item from crm_private.catalog_items where item_id=linked_item;
      snapshot:=snapshot || jsonb_build_array(jsonb_build_object(
        'role','scope','revision',to_jsonb(catalog_rev),'item',to_jsonb(catalog_item)));
    end if;
    if item.item_kind='tariff' then
      for ref,ref_kind in select value,case ordinality when 1 then 'unit'
        else 'pricing_form' end from jsonb_array_elements_text(jsonb_build_array(
        definition->>'unit_revision_id',definition->>'pricing_form_revision_id'))
        with ordinality loop
        if ref is null then continue; end if;
        select * into catalog_rev from crm_private.catalog_revisions where revision_id=ref::uuid;
        if not found or catalog_rev.admin_scope<>scope then
          raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
        select * into catalog_item from crm_private.catalog_items where item_id=catalog_rev.item_id;
        if catalog_item.item_kind<>ref_kind then
          raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
        snapshot:=snapshot || jsonb_build_array(jsonb_build_object(
          'role',catalog_item.item_kind,'revision',to_jsonb(catalog_rev),'item',to_jsonb(catalog_item)));
      end loop;
      if definition ? 'tiers' then
        for component in select value from jsonb_array_elements(definition->'tiers') loop
          for ref,ref_kind in select value,case ordinality when 1 then 'unit'
            else 'variant' end from jsonb_array_elements_text(jsonb_build_array(
            component->>'unit_revision_id',component->>'variant_revision_id'))
            with ordinality loop
            if ref is null then continue; end if;
            select * into catalog_rev from crm_private.catalog_revisions where revision_id=ref::uuid;
            if not found or catalog_rev.admin_scope<>scope then
              raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
            select * into catalog_item from crm_private.catalog_items where item_id=catalog_rev.item_id;
            if catalog_item.item_kind<>ref_kind then
              raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
            snapshot:=snapshot || jsonb_build_array(jsonb_build_object(
              'role','tier_'||catalog_item.item_kind,'revision',to_jsonb(catalog_rev),
              'item',to_jsonb(catalog_item)));
          end loop;
        end loop;
      end if;
    elsif item.item_kind in ('pack','custom_pack') then
      for component in select value from jsonb_array_elements(definition->'components') loop
        select * into catalog_rev from crm_private.catalog_revisions
          where revision_id=(component->>'service_revision_id')::uuid;
        if not found or catalog_rev.admin_scope<>scope then
          raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
        select * into catalog_item from crm_private.catalog_items where item_id=catalog_rev.item_id;
        if catalog_item.item_kind not in ('service','variant') then
          raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
        snapshot:=snapshot || jsonb_build_array(jsonb_build_object(
          'role','component','revision',to_jsonb(catalog_rev),'item',to_jsonb(catalog_item),
          'quantity',component->>'quantity','included',component->'included'));
        if component ? 'unit_revision_id' then
          unit_id:=(component->>'unit_revision_id')::uuid;
          select * into catalog_rev from crm_private.catalog_revisions where revision_id=unit_id;
          if not found or catalog_rev.admin_scope<>scope then
            raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
          select * into catalog_item from crm_private.catalog_items where item_id=catalog_rev.item_id;
          if catalog_item.item_kind<>'unit' then
            raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
          snapshot:=snapshot || jsonb_build_array(jsonb_build_object(
            'role','component_unit','revision',to_jsonb(catalog_rev),'item',to_jsonb(catalog_item)));
        end if;
      end loop;
    elsif item.item_kind='capacity_rule' and definition ? 'unit_revision_id' then
      unit_id:=(definition->>'unit_revision_id')::uuid;
      select * into catalog_rev from crm_private.catalog_revisions
        where revision_id=unit_id;
      if not found or catalog_rev.admin_scope<>scope then
        raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
      select * into catalog_item from crm_private.catalog_items where item_id=catalog_rev.item_id;
      if catalog_item.item_kind<>'unit' then
        raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
      snapshot:=snapshot || jsonb_build_array(jsonb_build_object(
        'role','capacity_unit','revision',to_jsonb(catalog_rev),'item',to_jsonb(catalog_item)));
    end if;
    select to_jsonb(r) into before_state from crm_private.commercial_revisions r
      where r.item_id=target order by r.revision_number desc limit 1;
    insert into crm_private.commercial_revisions(revision_id,item_id,admin_scope,revision_number,
      definition,catalog_snapshot,validity_kind,valid_from,valid_until,source_ref,evidence_ref,reason,actor_id)
      values(v[3]::uuid,target,scope,next_version+1,definition,snapshot,validity_kind_value,start_value,end_value,
        v[13],v[14],v[15],actor);
    next_version:=next_version+1; result_id:=v[3]::uuid;
    select jsonb_build_object('revision',to_jsonb(r),'item',to_jsonb(i)) into after_state
      from crm_private.commercial_revisions r join crm_private.commercial_items i using(item_id)
      where r.revision_id=result_id;
  elsif v[2]='promote_custom' then
    if v[5]<>'pack' or linked_item is not null or linked_rev is not null or origin is null
      or v[9]<>'{}' or v[10]<>'' or v[11]<>'' or v[12]<>'' or expected<>0 then
      raise exception 'COMMERCIAL_INPUT_INVALID' using errcode='22023'; end if;
    select * into prior from crm_private.commercial_revisions where revision_id=origin;
    if not found or prior.admin_scope<>scope then
      raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
    select * into source_item from crm_private.commercial_items where item_id=prior.item_id;
    if source_item.item_kind<>'custom_pack' then
      raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
    insert into crm_private.commercial_items(item_id,item_kind,admin_scope,origin_custom_revision_id,
      source_ref,evidence_ref,created_by)
      values(target,'pack',scope,origin,v[13],v[14],actor);
    insert into crm_private.commercial_revisions(revision_id,item_id,admin_scope,revision_number,
      definition,catalog_snapshot,validity_kind,valid_from,valid_until,source_ref,evidence_ref,reason,actor_id)
      values(v[3]::uuid,target,scope,1,prior.definition,prior.catalog_snapshot,
        prior.validity_kind,prior.valid_from,prior.valid_until,v[13],v[14],v[15],actor);
    result_id:=target; next_version:=1;
    select jsonb_build_object('item',to_jsonb(i),'revision',to_jsonb(r),
      'origin_revision',to_jsonb(prior)) into after_state
      from crm_private.commercial_items i join crm_private.commercial_revisions r using(item_id)
      where i.item_id=target and r.revision_number=1;
  else
    if v[5]<>'application' or linked_item is not null or linked_rev is not null
      or origin is null or v[9]<>'{}' or v[10]<>'' or v[11]<>'' or expected<>0 then
      raise exception 'COMMERCIAL_INPUT_INVALID' using errcode='22023'; end if;
    refs:=string_to_array(v[12],',');
    if refs is null or cardinality(refs)<1 or cardinality(refs)>50 then
      raise exception 'COMMERCIAL_INPUT_INVALID' using errcode='22023'; end if;
    foreach ref in array refs loop
      if ref !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        or ref=any(seen) then
        raise exception 'COMMERCIAL_INPUT_INVALID' using errcode='22023'; end if;
      seen:=array_append(seen,ref);
      select * into rev from crm_private.commercial_revisions where revision_id=ref::uuid;
      if not found or rev.admin_scope<>scope then
        raise exception 'COMMERCIAL_RELATION_INVALID' using errcode='22023'; end if;
      select * into item from crm_private.commercial_items where item_id=rev.item_id;
      snapshot:=snapshot || jsonb_build_array(jsonb_build_object(
        'revision',to_jsonb(rev),'item',to_jsonb(item)));
    end loop;
    insert into crm_private.commercial_applications(application_id,subject_ref,admin_scope,
      applied_revisions,source_ref,evidence_ref,reason,actor_id)
      values(target,origin,scope,snapshot,v[13],v[14],v[15],actor);
    select to_jsonb(a) into after_state from crm_private.commercial_applications a
      where a.application_id=target;
    result_id:=target; next_version:=0;
  end if;
  insert into crm_private.commercial_operations(operation_id,admin_scope,actor_id,
    fingerprint,result_ref,result_version)
    values(v[3]::uuid,scope,actor,fingerprint,result_id,next_version);
  insert into crm_private.commercial_history(history_id,operation_id,subject_id,admin_scope,
    before_state,after_state,source_ref,evidence_ref,reason,actor_id)
    values(v[3]::uuid,v[3]::uuid,target,scope,before_state,after_state,v[13],v[14],v[15],actor);
  perform crm_f2.verify(f2p,f2s,q,'C03','human_catalog','write_catalog');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C03','catalog','write_catalog');
  result_ref:=result_id; result_version:=next_version; replayed:=false; return next;
end $$;
alter function crm_api.commercial_apply(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.commercial_apply(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.commercial_apply(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

create function crm_api.commercial_read(f2p bytea,f2s bytea,f1p bytea,f1s bytea,q bytea)
returns jsonb language plpgsql volatile parallel unsafe security definer
set search_path=pg_catalog,pg_temp as $$
declare hf text[]; tf text[]; v text[]; target uuid; output jsonb;
  page_limit integer; page_offset integer; total integer; next_page text;
begin
  hf:=crm_f2.admit(f2p,f2s,q,'C01','read_catalog');
  tf:=crm_f1.verify_envelope(f1p,f1s,q,'C01','catalog','read_catalog');
  if hf[17] collate "C" <> tf[14] collate "C" then
    raise exception 'COMMERCIAL_DENIED' using errcode='42501'; end if;
  v:=crm_f1.fields(q);
  if cardinality(v)<>5 or v[1]<>'CRM-H1-COM-READ1'
    or v[2] not in ('item','version','application','history')
    or v[4] !~ '^[1-9][0-9]{0,2}$' or v[5] !~ '^(0|[1-9][0-9]{0,8})$'
  then raise exception 'COMMERCIAL_INPUT_INVALID' using errcode='22023'; end if;
  target:=v[3]::uuid; page_limit:=v[4]::integer; page_offset:=v[5]::integer;
  if page_limit>100 then raise exception 'COMMERCIAL_INPUT_INVALID' using errcode='22023'; end if;
  if v[2]='item' then
    select jsonb_build_object('item',to_jsonb(i),'latest_revision',to_jsonb(r))
      into output from crm_private.commercial_items i
      left join lateral (select * from crm_private.commercial_revisions r
        where r.item_id=i.item_id order by r.revision_number desc limit 1) r on true
      where i.item_id=target and i.admin_scope=hf[17];
  elsif v[2]='version' then
    select jsonb_build_object('revision',to_jsonb(r),'item',to_jsonb(i))
      into output from crm_private.commercial_revisions r
      join crm_private.commercial_items i using(item_id)
      where r.revision_id=target and r.admin_scope=hf[17];
  elsif v[2]='application' then
    select to_jsonb(a) into output from crm_private.commercial_applications a
      where a.application_id=target and a.admin_scope=hf[17];
  else
    select coalesce(jsonb_agg(to_jsonb(h) order by h.recorded_at,h.history_id),'[]'::jsonb)
      into output from crm_private.commercial_history h
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
    if page_offset<>0 then raise exception 'COMMERCIAL_INPUT_INVALID' using errcode='22023'; end if;
    next_page:=null;
  end if;
  perform crm_f2.verify(f2p,f2s,q,'C01','human_catalog','read_catalog');
  perform crm_f1.verify_envelope(f1p,f1s,q,'C01','catalog','read_catalog');
  return jsonb_build_object('data',output,'nextPage',next_page);
end $$;
alter function crm_api.commercial_read(bytea,bytea,bytea,bytea,bytea) owner to crm_h0_f2_executor;
revoke execute on function crm_api.commercial_read(bytea,bytea,bytea,bytea,bytea) from public;
grant execute on function crm_api.commercial_read(bytea,bytea,bytea,bytea,bytea) to crm_h0_runtime;

revoke create on schema crm_private from crm_h0_f2_owner;
revoke create on schema crm_api from crm_h0_f2_executor;
commit;
