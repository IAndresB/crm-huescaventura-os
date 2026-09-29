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
const database="crm_h1_005_focal";
const port=Number(process.env.POSTGRES_H1005_PORT??55435);
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
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-005-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1005_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1005_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1005_bootstrap");migration=connect("crm_h0_migration");
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
test("H1-005 smoke: create and read",async()=>{
  const id=randomUUID();
  const a=await catalog.apply(await auth(),write,cat("create_item","service",id));
  assert.equal(a.id,id);
  const v=await catalog.apply(await auth(),write,cat("publish_version","service",id,{definition:{name:"Synthetic service",nature:"internal"}}));
  assert.equal(v.version,1);
  const data=await catalog.read(await auth(),read,"item",id);
  assert.equal((data.data as any).latest_revision.definition.name,"Synthetic service");
});

async function createVersion(kind:CatalogCommand["kind"],definition:Record<string,string>,options:Partial<CatalogCommand>={}) {
  const id=randomUUID();
  await catalog.apply(await auth(),write,cat("create_item",kind,id,options));
  const parentRevision=options.parentId
    ? (await catalog.read(await auth(),read,"item",options.parentId)).data as any:null;
  const relatedRevision=options.relatedId
    ? (await catalog.read(await auth(),read,"item",options.relatedId)).data as any:null;
  const version=await catalog.apply(await auth(),write,cat("publish_version",kind,id,
    {...options,partyId:undefined,partyKind:undefined,
      parentId:parentRevision?.latest_revision?.revision_id,
      relatedId:relatedRevision?.latest_revision?.revision_id,definition}));
  return {id,revisionId:version.id};
}

test("H1-005 I01-I06: typed relations, exact versions, immutable applied snapshot",async()=>{
  const service=await createVersion("service",{name:"Synthetic trek",nature:"external"});
  const variant=await createVersion("variant",{name:"Short trek"},{parentId:service.id});
  const category=await createVersion("category",{name:"Synthetic category"});
  const attribute=await createVersion("attribute",{name:"Synthetic attribute"});
  const audience=await createVersion("audience",{name:"Synthetic audience"});
  const unit=await createVersion("unit",{name:"Person",definition:"Count of participants"});
  const pricing=await createVersion("pricing_form",{name:"Per group",definition:"One group basis"});
  const provider=await createVersion("provider",{name:"Synthetic provider"});
  const relations=[
    await createVersion("category_assignment",{description:"Category assignment"},{parentId:service.id,relatedId:category.id}),
    await createVersion("attribute_assignment",{description:"Attribute assignment"},{parentId:variant.id,relatedId:attribute.id}),
    await createVersion("audience_recommendation",{priority:"Alta"},{parentId:service.id,relatedId:audience.id}),
    await createVersion("unit_assignment",{description:"Unit assignment"},{parentId:service.id,relatedId:unit.id}),
    await createVersion("pricing_form_assignment",{description:"Pricing basis assignment"},{parentId:service.id,relatedId:pricing.id}),
    await createVersion("offering",{conditions:"Synthetic conditions",location:"Synthetic location"},{parentId:provider.id,relatedId:variant.id})
  ];
  const old=await catalog.read(await auth(),read,"version",service.revisionId);
  assert.equal((old.data as any).revision.definition.nature,"external");
  const appId=randomUUID();
  const refs=[service,variant,category,attribute,audience,unit,pricing,provider,...relations].map(x=>x.revisionId);
  await catalog.apply(await auth(),write,cat("fix_application","application",appId,
    {parentId:randomUUID(),revisionIds:refs}));
  const appBefore=(await admin`select applied_revisions from crm_private.catalog_applications
    where application_id=${appId}::uuid`)[0]?.applied_revisions;
  await catalog.apply(await auth(),write,cat("publish_version","category",category.id,
    {definition:{name:"Changed category"},expectedVersion:1}));
  await catalog.apply(await auth(),write,cat("publish_version","unit",unit.id,
    {definition:{name:"Changed unit",definition:"Different counting unit"},expectedVersion:1}));
  const appAfter=(await admin`select applied_revisions from crm_private.catalog_applications
    where application_id=${appId}::uuid`)[0]?.applied_revisions;
  assert.deepEqual(appAfter,appBefore);
  assert.equal(appAfter.length,14);
  assert.equal((await catalog.read(await auth(),read,"version",category.revisionId)).data!==null,true);
  assert.equal((await catalog.read(await auth(),read,"application",appId)).certainty,"verified");
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_history
    where subject_id=${category.id}::uuid`)[0]?.n,3);
  await assert.rejects(catalog.apply(await auth(),write,cat("publish_version","offering",relations[5]!.id,
    {parentId:provider.revisionId,relatedId:variant.revisionId,
      definition:{availability:"confirmed"}})),/CATALOG_INPUT_DENIED/);
  await assert.rejects(catalog.apply(await auth(),write,cat("publish_version","audience_recommendation",relations[2]!.id,
    {parentId:service.revisionId,relatedId:audience.revisionId,
      definition:{priority:"Alta",eligible:"yes"}})),/CATALOG_INPUT_DENIED/);
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_revisions
    where item_id=${relations[5]!.id}::uuid`)[0]?.n,1);
});

test("H1-005 I05/I07: provider identity link, invalid relation, replay and concurrency",async()=>{
  const party=randomUUID();
  await identity.apply(await auth(),write,input("create_entity",party,{displayName:"Synthetic provider contact"}));
  const linked=await createVersion("provider",{name:"Linked provider"},{partyId:party,partyKind:"contact"});
  assert.equal((await admin`select party_id::text from crm_private.catalog_items
    where item_id=${linked.id}::uuid`)[0]?.party_id,party);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_entities
    where identity_id=${party}::uuid`)[0]?.n,1);
  const category=await createVersion("category",{name:"Unrelated category"});
  await assert.rejects(catalog.apply(await auth(),write,cat("create_item","variant",randomUUID(),
    {parentId:category.id})),/CATALOG_RELATION_INVALID/);
  const service=randomUUID();
  const op=cat("create_item","service",service);
  const first=await catalog.apply(await auth(),write,op);
  assert.equal(first.replayed,false);
  assert.equal((await catalog.apply(await auth(),write,op)).replayed,true);
  await assert.rejects(catalog.apply(await auth(),write,{...op,reason:"changed"}),/CATALOG_REPLAY_CONFLICT/);
  const [a,b]=await Promise.allSettled([
    catalog.apply(await auth(),write,cat("publish_version","service",service,
      {definition:{name:"A",nature:"internal"}})),
    catalog.apply(await auth(),write,cat("publish_version","service",service,
      {definition:{name:"B",nature:"external"}}))]);
  assert.equal([a,b].filter(x=>x.status==="fulfilled").length,1);
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_revisions
    where item_id=${service}::uuid`)[0]?.n,1);
  assert.equal((await admin`select count(*)::int n from crm_private.catalog_operations
    where result_ref=${service}::uuid`)[0]?.n,1);
  await assert.rejects(runtime.unsafe("select * from crm_private.catalog_items"));
  assert.equal((await admin`select relrowsecurity,relforcerowsecurity from pg_class
    where oid='crm_private.catalog_items'::regclass`)[0]?.relforcerowsecurity,true);
});

test("H1-005 I07/I08: injected history failure rolls back and runtime cannot bypass",async()=>{
  const target=randomUUID(),operation=randomUUID();
  await admin.unsafe(`create function public.h1005_fail_history() returns trigger language plpgsql as $$
    begin raise exception 'H1005_INJECTED_FAILURE'; end $$;
    create trigger h1005_fail_history before insert on crm_private.catalog_history
    for each row execute function public.h1005_fail_history()`);
  try {
    await assert.rejects(catalog.apply(await auth(),write,cat("create_item","service",target,
      {operationId:operation})),/CATALOG_DENIED/);
    assert.equal((await admin`select count(*)::int n from crm_private.catalog_items
      where item_id=${target}::uuid`)[0]?.n,0);
    assert.equal((await admin`select count(*)::int n from crm_private.catalog_operations
      where operation_id=${operation}::uuid`)[0]?.n,0);
  } finally {
    await admin.unsafe("drop trigger h1005_fail_history on crm_private.catalog_history; drop function public.h1005_fail_history()");
  }
  await assert.rejects(runtime.unsafe("insert into crm_private.catalog_items(item_id,item_kind,admin_scope,source_ref,evidence_ref,created_by) values(gen_random_uuid(),'service','x','x','x',gen_random_uuid())"));
  await assert.rejects(runtime.unsafe("set role crm_h0_f2_executor"));
  for(const role of ["anon","authenticated"]){
    const client=connect(role);
    try {
      await assert.rejects(client.unsafe("select * from crm_private.catalog_items"));
      await assert.rejects(client.unsafe("select crm_api.catalog_read(null,null,null,null,null)"));
    } finally { await client.end({timeout:1}); }
  }
  assert.equal((await admin`select count(*)::int n from crm_private.identity_entities
    where identity_id=${predecessorIdentity}::uuid`)[0]?.n,1);
});
