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
import { assessDependentAction, assessApprovedPromotion } from "../../src/domain/commercial-rules.ts";
import type { F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";

const bin=process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h1_008_formal";
const port=Number(process.env.POSTGRES_H1008_PORT??55438);
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
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-008-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1008_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1008_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1008_bootstrap");migration=connect("crm_h0_migration");
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
    {definition:{name:"Formal predecessor catalog",nature:"internal"}}));
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

// The normative matrix was fixed in evidence-TSK-H1-008.md before these assertions.
async function baseCatalog(kind:CatalogCommand["kind"],definition:Record<string,string>) {
  const id=randomUUID();
  await catalog.apply(await auth(),write,cat("create_item",kind,id));
  const published=await catalog.apply(await auth(),write,
    cat("publish_version",kind,id,{definition}));
  return {id,revision:published.id};
}
async function versioned(kind:CommercialCommand["kind"],definition:Record<string,unknown>,
  linked?:{id:string;revision:string}) {
  const id=randomUUID();
  await commercial.apply(await auth(),write,com("create",kind,id,
    {catalogItemId:linked?.id}));
  const published=await commercial.apply(await auth(),write,com("publish",kind,id,
    {catalogItemId:linked?.id,catalogRevisionId:linked?.revision,definition,
      validFrom:"2026-10-01",validUntil:"2026-12-31"}));
  return {id,revision:published.id};
}

test("H1-008 R01-R08: independent version, unknown and cross-connection history matrix",async()=>{
  const service=await baseCatalog("service",{name:"Formal synthetic service",nature:"external"});
  const audience=await baseCatalog("audience",{name:"Formal synthetic audience"});
  const recommendationId=randomUUID();
  await catalog.apply(await auth(),write,cat("create_item","audience_recommendation",
    recommendationId,{parentId:service.id,relatedId:audience.id}));
  const high=await catalog.apply(await auth(),write,cat("publish_version",
    "audience_recommendation",recommendationId,
    {parentId:service.revision,relatedId:audience.revision,definition:{priority:"Alta"}}));
  assert.equal(((await catalog.read(await auth(),read,"version",high.id)).data as any)
    .revision.definition.priority,"Alta");
  const unit=await baseCatalog("unit",{name:"Person",definition:"A participant"});
  const basis=await baseCatalog("pricing_form",{name:"Per person",definition:"Person basis"});
  const tariff=await versioned("tariff",{label:"Formal synthetic tariff",price_state:"unknown",
    cost_state:"unknown",vat_treatment:"unknown",unit_revision_id:unit.revision,
    pricing_form_revision_id:basis.revision},service);
  const custom=await versioned("custom_pack",{name:"Formal custom pack",
    components:[{service_revision_id:service.revision,quantity:"15",
      unit_revision_id:unit.revision,included:true}]});
  const promoDefinition={...approvedPromotionDefinition,label:"Formal approved policy"};
  const promotion=await versioned("promotion",promoDefinition);
  const capacity=await versioned("capacity_rule",{knowledge:"unknown"},service);
  const eligibility=await versioned("eligibility_rule",{knowledge:"unknown"},service);
  const requirement=await versioned("document_requirement",
    {knowledge:"known",purpose:"Formal service",document_kind:"Formal permit",essential:true},service);
  const masterId=randomUUID();
  await commercial.apply(await auth(),write,com("promote_custom","pack",masterId,
    {originRevisionId:custom.revision}));
  const master=(await commercial.read(await auth(),read,"item",masterId)).data as any;
  assert.equal(master.item.origin_custom_revision_id,custom.revision);
  const originalCustom=(await commercial.read(await auth(),read,"version",custom.revision)).data as any;
  assert.deepEqual(master.latest_revision.definition,originalCustom.revision.definition);
  const originalMasterRevision=master.latest_revision.revision_id;
  const application=randomUUID();
  const applied=[tariff.revision,custom.revision,promotion.revision,capacity.revision,
    eligibility.revision,requirement.revision,originalMasterRevision];
  await commercial.apply(await auth(),write,com("fix_application","application",application,
    {originRevisionId:randomUUID(),revisionIds:applied}));
  const independent=connect("h1008_bootstrap");
  try {
    const before=(await independent`select applied_revisions from crm_private.commercial_applications
      where application_id=${application}::uuid`)[0]?.applied_revisions;
    assert.equal(before.length,7);
    assert.equal(before[0].revision.definition.price_state,"unknown");
    assert.equal(before[0].revision.definition.amount,undefined);
    assert.equal(before[0].revision.valid_from,"2026-10-01");
    assert.equal(before[0].revision.catalog_snapshot[0].revision.revision_id,service.revision);
    assert.equal(before[5].revision.definition.essential,true);
    for(const [kind,item,definition,link] of [
      ["tariff",tariff,{label:"Later verified synthetic tariff",price_state:"confirmed",
        amount:"75.00",cost_state:"unknown",vat_treatment:"unknown"},service],
      ["custom_pack",custom,{name:"Later custom composition",
        components:[{service_revision_id:service.revision}]},null],
      ["promotion",promotion,{...promoDefinition,label:"Later policy label"},null],
      ["capacity_rule",capacity,{knowledge:"known",unit_revision_id:unit.revision,maximum:"15"},service],
      ["eligibility_rule",eligibility,{knowledge:"known",criterion:"Formal verified rule",
        purpose:"Formal activity"},service],
      ["document_requirement",requirement,{knowledge:"known",purpose:"Formal service",
        document_kind:"Later permit",essential:true},service]
    ] as const) {
      await commercial.apply(await auth(),write,com("publish",kind,item.id,
        {catalogItemId:link?.id,catalogRevisionId:link?.revision,expectedVersion:1,
          definition,validFrom:"2027-01-01",validUntil:"2027-12-31"}));
    }
    await commercial.apply(await auth(),write,com("publish","pack",masterId,
      {expectedVersion:1,definition:{name:"Later master",
        components:[{service_revision_id:service.revision}]}}));
    const after=(await independent`select applied_revisions from crm_private.commercial_applications
      where application_id=${application}::uuid`)[0]?.applied_revisions;
    assert.deepEqual(after,before);
    const real=await commercial.apply(await auth(),write,com("publish","tariff",tariff.id,
      {catalogItemId:service.id,catalogRevisionId:service.revision,expectedVersion:2,
        definition:{label:"Synthetic realized observation",price_state:"real",amount:"75.00",
          cost_state:"real",cost_amount:"60.00",vat_treatment:"unknown"}}));
    assert.equal(((await commercial.read(await auth(),read,"version",real.id)).data as any)
      .revision.definition.cost_state,"real");
    assert.deepEqual((await independent`select applied_revisions from crm_private.commercial_applications
      where application_id=${application}::uuid`)[0]?.applied_revisions,before);
    assert.equal((await independent`select count(*)::int n from crm_private.commercial_revisions
      where item_id=${tariff.id}::uuid`)[0]?.n,3);
    assert.equal((await independent`select count(*)::int n from crm_private.commercial_revisions
      where item_id=${masterId}::uuid`)[0]?.n,2);
  } finally { await independent.end({timeout:1}); }
  const blocked=assessDependentAction({definitivePriceNeeded:true,tariffAmount:"unknown",
    materialHotelCost:"unknown",fiscalTreatment:"unknown",validity:"unknown",
    perPersonBasis:true,unitRevisionId:null,capacity:"unknown",eligibility:"unknown",
    availabilityNeeded:true,availability:"unknown",
    documentRequirement:"essential_missing"});
  assert.equal(blocked.allowed,false);
  assert.ok(blocked.blockers.includes("MATERIAL_COST_UNVERIFIED"));
  assert.ok(blocked.blockers.includes("UNIT_MISSING"));
  assert.ok(blocked.blockers.includes("CAPACITY_UNVERIFIED_OR_INSUFFICIENT"));
  assert.ok(blocked.blockers.includes("AVAILABILITY_UNVERIFIED_OR_UNAVAILABLE"));
  assert.ok(blocked.blockers.includes("ELIGIBILITY_UNVERIFIED_OR_FAILED"));
  assert.ok(blocked.blockers.includes("DOCUMENT_REQUIREMENT_UNRESOLVED"));
  const estimated=assessDependentAction({definitivePriceNeeded:true,tariffAmount:"estimated",
    materialHotelCost:"estimated",fiscalTreatment:"verified",validity:"current",
    perPersonBasis:false,unitRevisionId:null,capacity:"verified_sufficient",
    availabilityNeeded:false,availability:"unknown",
    eligibility:"verified_eligible",documentRequirement:"not_essential"});
  assert.deepEqual(estimated.blockers,["TARIFF_AMOUNT_UNVERIFIED","MATERIAL_COST_UNVERIFIED"]);
  const promotionBlocked=assessApprovedPromotion({audience:"despedida",objectiveEligibility:"unknown",
    totalAttendees:15,
    packComplete:true,lodgingIncluded:true,activityIncluded:true,restaurantIncluded:true,
    tarariDrinksIncluded:2,honoreeModalityId:null,
    honoreeModalityFinalPersonPriceVerified:false});
  assert.equal(promotionBlocked.applicable,false);
  assert.deepEqual(promotionBlocked.blockers,["OBJECTIVE_ELIGIBILITY_UNVERIFIED_OR_FAILED",
    "HONOREE_MODALITY_PRICE_UNVERIFIED"]);
  await assert.rejects(commercial.apply(await auth(),write,com("publish","promotion",promotion.id,
    {expectedVersion:2,definition:{policy:"unapproved"}})),/COMMERCIAL_DEFINITION_INVALID/);
  await assert.rejects(commercial.apply(await auth(),write,com("publish","capacity_rule",capacity.id,
    {catalogItemId:service.id,catalogRevisionId:service.revision,expectedVersion:2,
      definition:{knowledge:"known",unit_revision_id:unit.revision,maximum:"-1"}})),
    /COMMERCIAL_DEFINITION_INVALID/);
});

test("H1-008 R09-R11: independent race, replay, fault, scope and prior-data matrix",async()=>{
  const service=await baseCatalog("service",{name:"Formal security service",nature:"internal"});
  const id=randomUUID();
  const creation=com("create","tariff",id,{catalogItemId:service.id});
  await commercial.apply(await auth(),write,creation);
  assert.equal((await commercial.apply(await auth(),write,creation)).replayed,true);
  await assert.rejects(commercial.apply(await auth(),write,{...creation,sourceRef:"changed"}),
    /COMMERCIAL_REPLAY_CONFLICT/);
  const versions=await Promise.allSettled([
    commercial.apply(await auth(),write,com("publish","tariff",id,
      {catalogItemId:service.id,catalogRevisionId:service.revision,
        definition:{label:"Race A",price_state:"unknown",cost_state:"unknown",vat_treatment:"unknown"}})),
    commercial.apply(await auth(),write,com("publish","tariff",id,
      {catalogItemId:service.id,catalogRevisionId:service.revision,
        definition:{label:"Race B",price_state:"unknown",cost_state:"unknown",vat_treatment:"unknown"}}))]);
  assert.equal(versions.filter(x=>x.status==="fulfilled").length,1);
  assert.equal((await admin`select count(*)::int n from crm_private.commercial_revisions
    where item_id=${id}::uuid`)[0]?.n,1);
  const otherScope=randomUUID();
  await admin`insert into crm_private.commercial_items(item_id,item_kind,admin_scope,
    catalog_item_id,source_ref,evidence_ref,created_by)
    values(${otherScope}::uuid,'tariff','other-scope',${service.id}::uuid,
    'formal-synthetic','formal-synthetic',${actorId}::uuid)`;
  assert.equal((await commercial.read(await auth(),read,"item",otherScope)).data,null);
  await assert.rejects(commercial.apply(await auth(),write,com("publish","tariff",otherScope,
    {catalogItemId:service.id,catalogRevisionId:service.revision,
      definition:{label:"Cross",price_state:"unknown",cost_state:"unknown",vat_treatment:"unknown"}})),
    /COMMERCIAL_DENIED/);
  const target=randomUUID(),operation=randomUUID();
  await admin.unsafe(`create function public.h1008_fail() returns trigger language plpgsql as $$
    begin raise exception 'FORMAL_FAULT'; end $$;
    create trigger h1008_fail before insert on crm_private.commercial_history
    for each row execute function public.h1008_fail()`);
  try {
    await assert.rejects(commercial.apply(await auth(),write,com("create","pack",target,
      {operationId:operation})),/COMMERCIAL_DENIED/);
  } finally { await admin.unsafe("drop trigger h1008_fail on crm_private.commercial_history; drop function public.h1008_fail()"); }
  assert.equal((await admin`select count(*)::int n from crm_private.commercial_items
    where item_id=${target}::uuid`)[0]?.n,0);
  assert.equal((await admin`select count(*)::int n from crm_private.commercial_operations
    where operation_id=${operation}::uuid`)[0]?.n,0);
  await assert.rejects(runtime.unsafe("select * from crm_private.commercial_revisions"));
  for(const role of ["anon","authenticated"]){
    const client=connect(role);
    try { await assert.rejects(client.unsafe("select crm_api.commercial_read(null,null,null,null,null)")); }
    finally { await client.end({timeout:1}); }
  }
  assert.equal((await admin`select count(*)::int n from crm_private.identity_entities
    where identity_id=${predecessorIdentity}::uuid`)[0]?.n,1);
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_items
    where item_id=${service.id}::uuid`)[0]?.n,1);
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_revisions
    where item_id=${predecessorCatalogId}::uuid`)[0]?.n,1);
  await admin`update crm_private.crm_sessions set revoked_at=clock_timestamp()
    where session_id=${sessionId}::uuid`;
  await assert.rejects(commercial.read(await auth(),read,"item",id),/COMMERCIAL_DENIED/);
  await admin`update crm_private.crm_actors set access_generation=access_generation+1
    where actor_id=${actorId}::uuid`;
  await assert.rejects(commercial.apply(await auth(),write,com("create","pack",randomUUID())),
    /COMMERCIAL_DENIED/);
});
