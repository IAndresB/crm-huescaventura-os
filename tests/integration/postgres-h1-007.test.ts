import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import postgres from "postgres";
import { verifyAuth } from "../../src/application/verified-auth.ts";
import { classifyServerEvent } from "../../src/application/verified-interaction.ts";
import { H0005PostgresAdapter } from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import { H1001IdentityAdapter, type IdentityCommand } from "../../src/infrastructure/postgres/h1-identity-adapter.ts";
import type { F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";
import { H1003ResolutionAdapter, type ResolutionCommand } from "../../src/infrastructure/postgres/h1-resolution-adapter.ts";
import { H1005CatalogAdapter, type CatalogCommand } from "../../src/infrastructure/postgres/h1-catalog-adapter.ts";
import { H1007CommercialAdapter, type CommercialCommand } from "../../src/infrastructure/postgres/h1-commercial-adapter.ts";
import { assessDependentAction } from "../../src/domain/commercial-rules.ts";
import type { F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";

const bin=process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h1_007_focal";
const port=Number(process.env.POSTGRES_H1007_PORT??55437);
const subject=randomUUID(),actorId=randomUUID(),scope="h1-fixture-scope";
let temporaryRoot="",socket="",started=false;
let admin:postgres.Sql,migration:postgres.Sql,runtime:postgres.Sql;
let f1:F1SigningConfiguration,f2:F2SigningConfiguration;
let identity:H1001IdentityAdapter,resolution:H1003ResolutionAdapter,access:H0005PostgresAdapter,catalog:H1005CatalogAdapter,commercial:H1007CommercialAdapter;
let sessionId="";
const predecessorIdentity=randomUUID();
const predecessorCatalogId=randomUUID();
function command(name:string,args:readonly string[]){
  const result=spawnSync(join(bin!,name),args,{encoding:"utf8",env:{...process.env,LC_ALL:"C"}});
  assert.equal(result.status,0,`${name}: ${result.stderr}`);
}
function connect(user:string,db=database){
  return postgres({host:socket,port,database:db,user,max:user==="crm_h0_runtime"?3:1,
    prepare:false,connect_timeout:3,onnotice:()=>{}});
}
async function applyChain(target:postgres.Sql,bootstrap:postgres.Sql,until?:string){
  const files=(await readdir(migrations)).filter((name)=>name.endsWith(".sql")
    && name!=="202609150000_h0_m01_roles.sql" && (until===undefined||name<=until)).sort();
  for(const file of files){
    if(file.endsWith("_authorities.sql")){
      const exists=(await bootstrap`select exists(select 1 from pg_roles where rolname='crm_h0_ha_tx') present`)[0]?.present;
      if(!exists) await bootstrap.unsafe(await readFile(join(migrations,file),"utf8"));
    }else await target.unsafe(await readFile(join(migrations,file),"utf8"));
  }
}
async function auth(){
  return verifyAuth({verify:async()=>({subject,sessionId,passwordVerified:true,mfaVerified:true})},randomUUID());
}
function input(action:IdentityCommand["action"],targetId=randomUUID(),overrides:Partial<IdentityCommand>={}):IdentityCommand{
  return {action,operationId:randomUUID(),targetId,kind:"contact",sourceRef:"fixture-manual-record",
    evidenceRef:"fixture-verification",reason:"fixture-operation",expectedVersion:0,verified:true,...overrides};
}
const read=classifyServerEvent("core-read"),write=classifyServerEvent("core-action");
async function identityData(kind: "entity" | "context" | "designations" | "history" | "organization_contacts",
  targetId: string): Promise<unknown> {
  return (await identity.read(await auth(),read,kind,targetId)).data;
}

before(async()=>{
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-007-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1007_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1007_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1007_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin,"20260929000000_h0_m06_access_recovery.sql");
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h1-formal",generation:randomUUID(),
    allowedPurposes:["h1-identities","h1-catalog"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h1-formal",generation:randomUUID(),
    allowedPurposes:["full-identification","core-human-access"]};
  await migration`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f1.keyId},${Buffer.from(f1.key)},${f1.audience},${f1.generation},${f1.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},${f2.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`select crm_api.provision_actor_mapping(${actorId}::uuid,${subject}::uuid,${scope})`;
  runtime=connect("crm_h0_runtime");access=new H0005PostgresAdapter(runtime,f1,f2);
  const first=await verifyAuth({verify:async()=>({subject,passwordVerified:true,mfaVerified:true})},randomUUID());
  sessionId=(await access.establish(first)).sessionId;
  await migration.unsafe(await readFile(join(migrations,"202609290001_h1_contextual_identities.sql"),"utf8"));
  identity=new H1001IdentityAdapter(runtime,f1,f2);
  await identity.apply(await auth(),write,input("create_entity",predecessorIdentity,
    {displayName:"Predecessor synthetic identity"}));
  await migration.unsafe(await readFile(join(migrations,"202609290002_h1_merge_archive_codes.sql"),"utf8"));
  resolution=new H1003ResolutionAdapter(runtime,f1,f2);
  await migration.unsafe(await readFile(join(migrations,"202609290003_h1_catalog_versions.sql"),"utf8"));
  catalog=new H1005CatalogAdapter(runtime,f1,f2);
  await catalog.apply(await auth(),write,cat("create_item","service",predecessorCatalogId));
  await catalog.apply(await auth(),write,cat("publish_version","service",predecessorCatalogId,
    {definition:{name:"Predecessor synthetic catalog service",nature:"internal"}}));
  await migration.unsafe(await readFile(join(migrations,"202609290004_h1_commercial_rules.sql"),"utf8"));
  commercial=new H1007CommercialAdapter(runtime,f1,f2);
});
after(async()=>{
  await Promise.allSettled([runtime?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started) command("pg_ctl",["-D",join(temporaryRoot,"data"),"-m","fast","-w","stop"]);
  if(temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});

function request(action:ResolutionCommand["action"],targetId:string,
  change:Partial<ResolutionCommand>={}):ResolutionCommand {
  return {action,operationId:randomUUID(),targetId,kind:"contact",
    sourceRef:"formal-synthetic-source",evidenceRef:"formal-human-verification",
    reason:"formal-reviewed-reason",expectedVersion:0,...change};
}


function cat(action:CatalogCommand["action"],kind:CatalogCommand["kind"],targetId=randomUUID(),change:Partial<CatalogCommand>={}):CatalogCommand {
  return {action,kind,targetId,operationId:randomUUID(),sourceRef:"synthetic-source",evidenceRef:"synthetic-proof",reason:"synthetic-reason",expectedVersion:0,...change};
}


function com(action:CommercialCommand["action"],kind:CommercialCommand["kind"],targetId=randomUUID(),change:Partial<CommercialCommand>={}):CommercialCommand {
  return {action,kind,targetId,operationId:randomUUID(),sourceRef:"synthetic-source",evidenceRef:"synthetic-proof",reason:"synthetic-reason",expectedVersion:0,...change};
}
const approvedPromotionDefinition={policy:"novio_gratis",minimum_attendees:"15",
  required_lodging:"1",required_activity:"1",required_restaurant:"1",
  required_tarari_drinks:"2",effect_basis:"honoree_modality_final_person_price"};
async function make(kind:CatalogCommand["kind"],definition:Record<string,string>) {
  const id=randomUUID();
  await catalog.apply(await auth(),write,cat("create_item",kind,id));
  const version=await catalog.apply(await auth(),write,cat("publish_version",kind,id,{definition}));
  return {id,revision:version.id};
}
test("H1-007 smoke: tariff version and exact catalog reference",async()=>{
  const service=await make("service",{name:"Synthetic service",nature:"external"});
  const id=randomUUID();
  const made=await commercial.apply(await auth(),write,com("create","tariff",id,{catalogItemId:service.id}));
  assert.equal(made.id,id);
  const version=await commercial.apply(await auth(),write,com("publish","tariff",id,{catalogItemId:service.id,catalogRevisionId:service.revision,
    definition:{label:"Synthetic tariff",price_state:"unknown",cost_state:"unknown",vat_treatment:"unknown"}}));
  assert.equal(version.version,1);
  const data=await commercial.read(await auth(),read,"version",version.id);
  assert.equal((data.data as any).revision.catalog_snapshot[0].revision.revision_id,service.revision);
});

async function makeCommercial(kind:CommercialCommand["kind"],definition:Record<string,unknown>,
  link?:{id:string;revision:string},change:Partial<CommercialCommand>={}) {
  const id=randomUUID();
  await commercial.apply(await auth(),write,com("create",kind,id,
    {catalogItemId:link?.id}));
  const result=await commercial.apply(await auth(),write,com("publish",kind,id,
    {catalogItemId:link?.id,catalogRevisionId:link?.revision,definition,...change}));
  return {id,revision:result.id};
}

test("H1-007 I01/I07: tariff unknown, known decimal, source, validity and frozen application",async()=>{
  const service=await make("service",{name:"Synthetic hotel",nature:"external"});
  const unit=await make("unit",{name:"Night",definition:"One night"});
  const basis=await make("pricing_form",{name:"Per night",definition:"Night basis"});
  const tariff=await makeCommercial("tariff",{label:"Synthetic hotel tariff",price_state:"unknown",
    cost_state:"unknown",vat_treatment:"unknown"},service,
    {validFrom:"2026-10-01",validUntil:"2026-12-31"});
  const old=(await commercial.read(await auth(),read,"version",tariff.revision)).data as any;
  assert.equal(old.revision.definition.amount,undefined);
  assert.equal(old.revision.base_currency,"EUR");
  assert.equal(old.revision.valid_from,"2026-10-01");
  assert.equal(old.revision.valid_until,"2026-12-31");
  assert.equal(old.revision.catalog_snapshot[0].revision.revision_id,service.revision);
  const app=randomUUID();
  await commercial.apply(await auth(),write,com("fix_application","application",app,
    {originRevisionId:randomUUID(),revisionIds:[tariff.revision]}));
  const applied=(await admin`select applied_revisions from crm_private.commercial_applications
    where application_id=${app}::uuid`)[0]?.applied_revisions;
  const newer=await commercial.apply(await auth(),write,com("publish","tariff",tariff.id,
    {catalogItemId:service.id,catalogRevisionId:service.revision,expectedVersion:1,
      validFrom:"2027-01-01",validUntil:"2027-12-31",
      definition:{label:"Synthetic confirmed tariff",price_state:"confirmed",amount:"123.450000123456",
        cost_state:"unknown",vat_treatment:"unknown",unit_revision_id:unit.revision,
        pricing_form_revision_id:basis.revision}}));
  assert.equal(newer.version,2);
  const revised=await commercial.read(await auth(),read,"version",newer.id);
  assert.equal(revised.certainty,"verified");
  assert.equal((revised.data as any).revision.definition.amount,"123.450000123456");
  assert.deepEqual((await admin`select applied_revisions from crm_private.commercial_applications
    where application_id=${app}::uuid`)[0]?.applied_revisions,applied);
  assert.equal((await commercial.read(await auth(),read,"version",tariff.revision)).certainty,"verified");
  await assert.rejects(commercial.apply(await auth(),write,com("publish","tariff",tariff.id,
    {catalogItemId:service.id,catalogRevisionId:service.revision,expectedVersion:2,
      definition:{label:"No state",cost_state:"unknown",vat_treatment:"unknown"}})),
    /COMMERCIAL_DEFINITION_INVALID/);
});

test("H1-007 I02/I03/I04/I05: custom pack, manual promotion, promotion rule and unknown guards",async()=>{
  const service=await make("service",{name:"Synthetic activity",nature:"internal"});
  const unit=await make("unit",{name:"Participant",definition:"One participant"});
  const custom=await makeCommercial("custom_pack",{name:"Synthetic custom modality",
    components:[{service_revision_id:service.revision,unit_revision_id:unit.revision,
      quantity:"15",included:true}],conditions:"Synthetic only"});
  const similar=await makeCommercial("custom_pack",{name:"Synthetic custom modality",
    components:[{service_revision_id:service.revision,unit_revision_id:unit.revision,
      quantity:"15",included:true}],conditions:"Synthetic only"});
  assert.notEqual(similar.id,custom.id);
  assert.equal((await admin`select count(*)::int n from crm_private.commercial_items
    where item_kind='pack' and admin_scope=${scope}`)[0]?.n,0);
  const masterId=randomUUID();
  const promoted=await commercial.apply(await auth(),write,com("promote_custom","pack",masterId,
    {originRevisionId:custom.revision}));
  assert.equal(promoted.version,1);
  const master=(await commercial.read(await auth(),read,"item",masterId)).data as any;
  assert.equal(master.item.origin_custom_revision_id,custom.revision);
  assert.deepEqual(master.latest_revision.definition,
    ((await commercial.read(await auth(),read,"version",custom.revision)).data as any).revision.definition);
  const oldMasterRevision=master.latest_revision.revision_id;
  await commercial.apply(await auth(),write,com("publish","pack",masterId,{expectedVersion:1,
    definition:{name:"Changed synthetic master",components:[{service_revision_id:service.revision}]}}));
  assert.equal(((await commercial.read(await auth(),read,"version",oldMasterRevision)).data as any)
    .revision.definition.name,"Synthetic custom modality");
  const promotion=await makeCommercial("promotion",approvedPromotionDefinition);
  assert.equal(((await commercial.read(await auth(),read,"version",promotion.revision)).data as any)
    .revision.definition.policy,"novio_gratis");
  await assert.rejects(commercial.apply(await auth(),write,com("publish","promotion",promotion.id,
    {expectedVersion:1,definition:{policy:"automatic_other"}})),/COMMERCIAL_DEFINITION_INVALID/);
  const capacity=await makeCommercial("capacity_rule",{knowledge:"unknown"},service);
  const eligibility=await makeCommercial("eligibility_rule",{knowledge:"unknown"},service);
  const document=await makeCommercial("document_requirement",{knowledge:"unknown",purpose:"Synthetic service"},service);
  for(const x of [capacity,eligibility,document])
    assert.equal(((await commercial.read(await auth(),read,"version",x.revision)).data as any)
      .revision.definition.knowledge,"unknown");
  assert.equal(assessDependentAction({definitivePriceNeeded:true,tariffAmount:"unknown",
    materialHotelCost:"unknown",fiscalTreatment:"unknown",validity:"unknown",
    perPersonBasis:true,unitRevisionId:null,capacity:"unknown",eligibility:"unknown",
    availabilityNeeded:true,availability:"unknown",
    documentRequirement:"unknown"}).allowed,false);
});

test("H1-007 I01/I04/I05: tiers, scoped requirements and exact rule versions",async()=>{
  const service=await make("service",{name:"Synthetic rafting",nature:"external"});
  const variantId=randomUUID();
  await catalog.apply(await auth(),write,cat("create_item","variant",variantId,{parentId:service.id}));
  const variantVersion=await catalog.apply(await auth(),write,cat("publish_version","variant",variantId,
    {parentId:service.revision,definition:{name:"Synthetic short rafting"}}));
  const variant={id:variantId,revision:variantVersion.id};
  const unit=await make("unit",{name:"Seat",definition:"One seat"});
  const basis=await make("pricing_form",{name:"Per seat",definition:"Seat basis"});
  const tariff=await makeCommercial("tariff",{label:"Synthetic tiered tariff",
    price_state:"confirmed",amount:"150.00",cost_state:"unknown",vat_treatment:"unknown",
    unit_revision_id:unit.revision,pricing_form_revision_id:basis.revision,
    tiers:[{label:"Synthetic tier",amount_state:"unknown",minimum:"1",maximum:"20",
      unit_revision_id:unit.revision,variant_revision_id:variant.revision}]},service);
  const data=(await commercial.read(await auth(),read,"version",tariff.revision)).data as any;
  assert.deepEqual(data.revision.catalog_snapshot.map((x:any)=>x.role),
    ["scope","unit","pricing_form","tier_unit","tier_variant"]);
  const capacity=await makeCommercial("capacity_rule",{knowledge:"known",
    unit_revision_id:unit.revision,minimum:"1",maximum:"20"},service);
  assert.equal(((await commercial.read(await auth(),read,"version",capacity.revision)).data as any)
    .revision.catalog_snapshot[1].role,"capacity_unit");
  const eligibility=await makeCommercial("eligibility_rule",{knowledge:"known",
    criterion:"Synthetic restriction",purpose:"Synthetic activity"},service);
  const doc=await makeCommercial("document_requirement",{knowledge:"known",
    purpose:"Synthetic service",document_kind:"Synthetic permit",essential:true},service);
  assert.equal(((await commercial.read(await auth(),read,"version",eligibility.revision)).data as any)
    .revision.definition.knowledge,"known");
  assert.equal(((await commercial.read(await auth(),read,"version",doc.revision)).data as any)
    .revision.definition.essential,true);
  await assert.rejects(commercial.apply(await auth(),write,com("publish","tariff",tariff.id,
    {catalogItemId:service.id,catalogRevisionId:service.revision,expectedVersion:1,
      definition:{label:"Wrong unit",price_state:"confirmed",amount:"100.00",
        cost_state:"unknown",vat_treatment:"unknown",unit_revision_id:basis.revision}})),
    /COMMERCIAL_RELATION_INVALID/);
  await assert.rejects(commercial.apply(await auth(),write,com("publish","tariff",tariff.id,
    {catalogItemId:service.id,catalogRevisionId:service.revision,expectedVersion:1,
      definition:{label:"Numeric JS amount",price_state:"confirmed",amount:100.00,
        cost_state:"unknown",vat_treatment:"unknown"}})),/COMMERCIAL_DEFINITION_INVALID/);
  assert.equal((await admin`select count(*)::int n from crm_private.commercial_revisions
    where item_id=${tariff.id}::uuid`)[0]?.n,1);
});

test("H1-007 I08/I09: replay, concurrency, rollback, scope and SQL authority",async()=>{
  const service=await make("service",{name:"Synthetic service for race",nature:"internal"});
  const id=randomUUID();
  const create=com("create","tariff",id,{catalogItemId:service.id});
  assert.equal((await commercial.apply(await auth(),write,create)).replayed,false);
  assert.equal((await commercial.apply(await auth(),write,create)).replayed,true);
  await assert.rejects(commercial.apply(await auth(),write,{...create,reason:"changed"}),
    /COMMERCIAL_REPLAY_CONFLICT/);
  const [a,b]=await Promise.allSettled([
    commercial.apply(await auth(),write,com("publish","tariff",id,
      {catalogItemId:service.id,catalogRevisionId:service.revision,
        definition:{label:"A",price_state:"unknown",cost_state:"unknown",vat_treatment:"unknown"}})),
    commercial.apply(await auth(),write,com("publish","tariff",id,
      {catalogItemId:service.id,catalogRevisionId:service.revision,
        definition:{label:"B",price_state:"unknown",cost_state:"unknown",vat_treatment:"unknown"}}))]);
  assert.equal([a,b].filter(x=>x.status==="fulfilled").length,1);
  assert.equal((await admin`select count(*)::int n from crm_private.commercial_revisions
    where item_id=${id}::uuid`)[0]?.n,1);
  const other=randomUUID();
  await admin`insert into crm_private.commercial_items(item_id,item_kind,admin_scope,
    catalog_item_id,source_ref,evidence_ref,created_by) values(${other}::uuid,'tariff',
    'other-scope',${service.id}::uuid,'synthetic','synthetic',${actorId}::uuid)`;
  assert.equal((await commercial.read(await auth(),read,"item",other)).data,null);
  await assert.rejects(commercial.apply(await auth(),write,com("publish","tariff",other,
    {catalogItemId:service.id,catalogRevisionId:service.revision,
      definition:{label:"Cross scope",price_state:"unknown",cost_state:"unknown",vat_treatment:"unknown"}})),
    /COMMERCIAL_DENIED/);
  const target=randomUUID(),operation=randomUUID();
  await admin.unsafe(`create function public.h1007_fail_history() returns trigger language plpgsql as $$
    begin raise exception 'SYNTHETIC_HISTORY_FAILURE'; end $$;
    create trigger h1007_fail_history before insert on crm_private.commercial_history
    for each row execute function public.h1007_fail_history()`);
  try {
    await assert.rejects(commercial.apply(await auth(),write,com("create","pack",target,
      {operationId:operation})),/COMMERCIAL_DENIED/);
  } finally {
    await admin.unsafe("drop trigger h1007_fail_history on crm_private.commercial_history; drop function public.h1007_fail_history()");
  }
  assert.equal((await admin`select count(*)::int n from crm_private.commercial_items
    where item_id=${target}::uuid`)[0]?.n,0);
  assert.equal((await admin`select count(*)::int n from crm_private.commercial_operations
    where operation_id=${operation}::uuid`)[0]?.n,0);
  await assert.rejects(runtime.unsafe("select * from crm_private.commercial_items"));
  await assert.rejects(runtime.unsafe("set role crm_h0_f2_executor"));
  for (const role of ["anon","authenticated"]) {
    const client=connect(role);
    try { await assert.rejects(client.unsafe("select * from crm_private.commercial_items"));
      await assert.rejects(client.unsafe("select crm_api.commercial_read(null,null,null,null,null)")); }
    finally { await client.end({timeout:1}); }
  }
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_items
    where item_id=${service.id}::uuid`)[0]?.n,1);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_entities
    where identity_id=${predecessorIdentity}::uuid`)[0]?.n,1);
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_revisions
    where item_id=${predecessorCatalogId}::uuid`)[0]?.n,1);
});

test("H1-007 I01: exact civil-date and instant validity stay distinct",async()=>{
  const service=await make("service",{name:"Synthetic validity service",nature:"external"});
  const id=randomUUID();
  await commercial.apply(await auth(),write,com("create","tariff",id,{catalogItemId:service.id}));
  const base={catalogItemId:service.id,catalogRevisionId:service.revision,
    definition:{label:"Synthetic validity tariff",price_state:"unknown",
      cost_state:"unknown",vat_treatment:"unknown"}};
  const first=await commercial.apply(await auth(),write,com("publish","tariff",id,
    {...base,validFrom:"2026-10-01",validUntil:"2026-10-31"}));
  const second=await commercial.apply(await auth(),write,com("publish","tariff",id,
    {...base,expectedVersion:1,validFrom:"2026-10-01T00:00:00Z",
      validUntil:"2026-10-31T23:59:59+02:00"}));
  assert.equal(((await commercial.read(await auth(),read,"version",first.id)).data as any)
    .revision.validity_kind,"civil_date");
  const instant=((await commercial.read(await auth(),read,"version",second.id)).data as any).revision;
  assert.equal(instant.validity_kind,"instant");
  assert.equal(instant.valid_until,"2026-10-31T23:59:59+02:00");
  await assert.rejects(commercial.apply(await auth(),write,com("publish","tariff",id,
    {...base,expectedVersion:2,validFrom:"2026-10-01",validUntil:"2026-10-31T00:00:00Z"})),
    /COMMERCIAL_VALIDITY_INVALID/);
  await assert.rejects(commercial.apply(await auth(),write,com("publish","tariff",id,
    {...base,expectedVersion:2,validFrom:"2026-11-01",validUntil:"2026-10-01"})),
    /COMMERCIAL_VALIDITY_INVALID/);
});
