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
import type { F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";

const bin=process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h1_006_formal";
const port=Number(process.env.POSTGRES_H1006_PORT??55436);
const subject=randomUUID(),actorId=randomUUID(),scope="h1-fixture-scope";
let temporaryRoot="",socket="",started=false;
let admin:postgres.Sql,migration:postgres.Sql,runtime:postgres.Sql;
let f1:F1SigningConfiguration,f2:F2SigningConfiguration;
let identity:H1001IdentityAdapter,resolution:H1003ResolutionAdapter,access:H0005PostgresAdapter,catalog:H1005CatalogAdapter;
let sessionId="";
const predecessorIdentity=randomUUID();
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
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-006-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1006_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1006_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1006_bootstrap");migration=connect("crm_h0_migration");
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

// Formal matrix was fixed in evidence-TSK-H1-006.md before these assertions.
async function make(kind:CatalogCommand["kind"],definition:Record<string,string>, parent?:{id:string;revision:string}, related?:{id:string;revision:string}) {
  const id=randomUUID();
  await catalog.apply(await auth(),write,cat("create_item",kind,id,
    {parentId:parent?.id,relatedId:related?.id}));
  const version=await catalog.apply(await auth(),write,cat("publish_version",kind,id,
    {parentId:parent?.revision,relatedId:related?.revision,definition}));
  return {id,revision:version.id};
}

test("H1-006 R01-R06: independent domain and persistence matrix",async()=>{
  const service=await make("service",{name:"Formal service",nature:"internal"});
  const variant=await make("variant",{name:"Formal variant"},service);
  const category=await make("category",{name:"Formal category"});
  const attribute=await make("attribute",{name:"Formal attribute"});
  const audience=await make("audience",{name:"Formal audience"});
  const unit=await make("unit",{name:"Item",definition:"Quantity of items"});
  const pricing=await make("pricing_form",{name:"Flat",definition:"Flat basis"});
  const provider=await make("provider",{name:"Formal provider"});
  const categoryAssignment=await make("category_assignment",{},service,category);
  const attributeAssignment=await make("attribute_assignment",{},variant,attribute);
  const recommendation=await make("audience_recommendation",{priority:"Alta"},service,audience);
  const unitAssignment=await make("unit_assignment",{},service,unit);
  const pricingAssignment=await make("pricing_form_assignment",{},service,pricing);
  const offering=await make("offering",{conditions:"Synthetic",location:"Synthetic place"},provider,variant);
  assert.notEqual(service.id,variant.id);
  const fromOtherConnection=connect("h1006_bootstrap");
  try {
    const relation=await fromOtherConnection`select parent_id::text,parent_revision_id::text
      from crm_private.catalog_items i join crm_private.catalog_revisions r using(item_id)
      where i.item_id=${variant.id}::uuid`;
    assert.equal(relation[0]?.parent_id,service.id);
    assert.equal(relation[0]?.parent_revision_id,service.revision);
    const appId=randomUUID();
    const versions=[service,variant,category,attribute,audience,unit,pricing,provider,
      categoryAssignment,attributeAssignment,recommendation,unitAssignment,pricingAssignment,offering];
    await catalog.apply(await auth(),write,cat("fix_application","application",appId,
      {parentId:randomUUID(),revisionIds:versions.map(x=>x.revision)}));
    const before=(await fromOtherConnection`select applied_revisions from crm_private.catalog_applications
      where application_id=${appId}::uuid`)[0]?.applied_revisions;
    assert.equal(before.length,14);
    assert.equal(before.find((x:any)=>x.revision.revision_id===recommendation.revision)?.revision.definition.priority,"Alta");
    assert.equal(before.find((x:any)=>x.revision.revision_id===offering.revision)?.item.parent_id,provider.id);
    for(const [kind,item,definition] of [
      ["service",service,{name:"Later service",nature:"external"}],
      ["category",category,{name:"Later category"}],
      ["attribute",attribute,{name:"Later attribute"}],
      ["audience",audience,{name:"Later audience"}],
      ["unit",unit,{name:"Later unit",definition:"Different unit"}],
      ["pricing_form",pricing,{name:"Later pricing",definition:"Different basis"}],
      ["provider",provider,{name:"Later provider"}]
    ] as const) {
      await catalog.apply(await auth(),write,cat("publish_version",kind,item.id,
        {expectedVersion:1,definition}));
    }
    for(const [kind,item,parent,related,definition] of [
      ["category_assignment",categoryAssignment,service,category,{description:"Changed assignment"}],
      ["attribute_assignment",attributeAssignment,variant,attribute,{description:"Changed assignment"}],
      ["audience_recommendation",recommendation,service,audience,{priority:"Media"}],
      ["unit_assignment",unitAssignment,service,unit,{description:"Changed unit assignment"}],
      ["pricing_form_assignment",pricingAssignment,service,pricing,{description:"Changed pricing assignment"}],
      ["offering",offering,provider,variant,{conditions:"Changed conditions"}]
    ] as const) {
      await catalog.apply(await auth(),write,cat("publish_version",kind,item.id,
        {parentId:parent.revision,relatedId:related.revision,expectedVersion:1,definition}));
    }
    const after=(await fromOtherConnection`select applied_revisions from crm_private.catalog_applications
      where application_id=${appId}::uuid`)[0]?.applied_revisions;
    assert.deepEqual(after,before);
    assert.equal((await catalog.read(await auth(),read,"version",category.revision)).certainty,"verified");
    await assert.rejects(catalog.apply(await auth(),write,cat("publish_version","audience_recommendation",recommendation.id,
      {parentId:service.revision,relatedId:audience.revision,expectedVersion:1,
        definition:{priority:"Alta",eligible:"true"}})),/CATALOG_INPUT_DENIED/);
    await assert.rejects(catalog.apply(await auth(),write,cat("publish_version","offering",offering.id,
      {parentId:provider.revision,relatedId:variant.revision,expectedVersion:1,
        definition:{availability:"confirmed"}})),/CATALOG_INPUT_DENIED/);
    assert.equal((await fromOtherConnection`select count(*)::int n from crm_private.catalog_revisions
      where item_id=${offering.id}::uuid`)[0]?.n,2);
  } finally { await fromOtherConnection.end({timeout:1}); }
});

test("H1-006 R07-R10: independent rejection, atomicity, security and predecessor",async()=>{
  const id=randomUUID();
  const create=cat("create_item","service",id);
  await catalog.apply(await auth(),write,create);
  assert.equal((await catalog.apply(await auth(),write,create)).replayed,true);
  await assert.rejects(catalog.apply(await auth(),write,{...create,sourceRef:"altered"}),/CATALOG_REPLAY_CONFLICT/);
  const result=await Promise.allSettled([
    catalog.apply(await auth(),write,cat("publish_version","service",id,
      {definition:{name:"Competing A",nature:"internal"}})),
    catalog.apply(await auth(),write,cat("publish_version","service",id,
      {definition:{name:"Competing B",nature:"external"}}))]);
  assert.equal(result.filter(x=>x.status==="fulfilled").length,1);
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_revisions
    where item_id=${id}::uuid`)[0]?.n,1);
  const unrelated=await make("category",{name:"Not service"});
  await assert.rejects(catalog.apply(await auth(),write,cat("create_item","variant",randomUUID(),
    {parentId:unrelated.id})),/CATALOG_RELATION_INVALID/);
  const otherScope=randomUUID();
  await admin`insert into crm_private.catalog_items(item_id,item_kind,admin_scope,
    source_ref,evidence_ref,created_by) values(${otherScope}::uuid,'service','other-scope',
    'formal-synthetic','formal-synthetic',${actorId}::uuid)`;
  assert.equal((await catalog.read(await auth(),read,"item",otherScope)).data,null);
  await assert.rejects(catalog.apply(await auth(),write,cat("publish_version","service",otherScope,
    {definition:{name:"Cross-scope",nature:"internal"}})),/CATALOG_DENIED/);
  const target=randomUUID(),operation=randomUUID();
  await admin.unsafe(`create function public.h1006_failure() returns trigger language plpgsql as $$
    begin raise exception 'FORMAL_INJECTED_FAILURE'; end $$;
    create trigger h1006_failure before insert on crm_private.catalog_history
    for each row execute function public.h1006_failure()`);
  try {
    await assert.rejects(catalog.apply(await auth(),write,cat("create_item","service",target,
      {operationId:operation})),/CATALOG_DENIED/);
  } finally {
    await admin.unsafe("drop trigger h1006_failure on crm_private.catalog_history; drop function public.h1006_failure()");
  }
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_items where item_id=${target}::uuid`)[0]?.n,0);
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_operations where operation_id=${operation}::uuid`)[0]?.n,0);
  await assert.rejects(runtime.unsafe("select * from crm_private.catalog_items"));
  const other=connect("authenticated");
  try { await assert.rejects(other.unsafe("select crm_api.catalog_read(null,null,null,null,null)")); }
  finally { await other.end({timeout:1}); }
  assert.equal((await admin`select count(*)::int n from crm_private.identity_entities
    where identity_id=${predecessorIdentity}::uuid`)[0]?.n,1);
  await admin`update crm_private.crm_sessions set revoked_at=clock_timestamp()
    where session_id=${sessionId}::uuid`;
  await assert.rejects(catalog.read(await auth(),read,"item",id),/CATALOG_DENIED/);
  await assert.rejects(catalog.apply(await auth(),write,cat("create_item","service",randomUUID())),/CATALOG_DENIED/);
  await admin`update crm_private.crm_actors set access_generation=access_generation+1
    where actor_id=${actorId}::uuid`;
  await assert.rejects(catalog.read(await auth(),read,"item",id),/CATALOG_DENIED/);
});
