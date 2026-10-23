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
import type { F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";

const bin=process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h1_003_focal";
const port=Number(process.env.POSTGRES_H1003_PORT??55433);
const subject=randomUUID(),actorId=randomUUID(),scope="h1-fixture-scope";
let temporaryRoot="",socket="",started=false;
let admin:postgres.Sql,migration:postgres.Sql,runtime:postgres.Sql;
let f1:F1SigningConfiguration,f2:F2SigningConfiguration;
let identity:H1001IdentityAdapter,resolution:H1003ResolutionAdapter,access:H0005PostgresAdapter;
let sessionId="";
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
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-003-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1003_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1003_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1003_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin,"20260929000000_h0_m06_access_recovery.sql");
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h1-formal",generation:randomUUID(),
    allowedPurposes:["h1-identities"]};
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
  await migration.unsafe(await readFile(join(migrations,"202609290002_h1_merge_archive_codes.sql"),"utf8"));
  identity=new H1001IdentityAdapter(runtime,f1,f2);
  resolution=new H1003ResolutionAdapter(runtime,f1,f2);
});
after(async()=>{
  await Promise.allSettled([runtime?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started) command("pg_ctl",["-D",join(temporaryRoot,"data"),"-m","fast","-w","stop"]);
  if(temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});

function resolutionInput(action:ResolutionCommand["action"],targetId:string,
  overrides:Partial<ResolutionCommand>={}):ResolutionCommand {
  return {action,operationId:randomUUID(),targetId,kind:"contact",
    sourceRef:"synthetic-source",evidenceRef:"synthetic-reviewed-evidence",
    reason:"human-reviewed-resolution",expectedVersion:0,...overrides};
}

test("H1-003 I01-I03: candidates are passive; human merge and archive keep both histories",async()=>{
  const context=randomUUID(),first=randomUUID(),second=randomUUID();
  await identity.apply(await auth(),write,input("create_context",context,{kind:"opportunity"}));
  await identity.apply(await auth(),write,input("create_entity",first,
    {email:"shared@example.invalid",phone:"000123",displayName:"Shared Person"}));
  await identity.apply(await auth(),write,input("create_entity",second,
    {email:"shared@example.invalid",phone:"000123",displayName:"Shared Person"}));
  await identity.apply(await auth(),write,input("designate",randomUUID(),
    {contextId:context,relatedId:first,kind:"primary_contact"}));
  const candidates=await resolution.candidates(await auth(),read,first);
  assert.equal(candidates.length,1);
  assert.equal(candidates[0]?.identity_id,second);
  assert.equal((await admin`select merged_into_id from crm_private.identity_entities
    where identity_id=${first}::uuid`)[0]?.merged_into_id,null);
  const merge=resolutionInput("merge",first,{relatedId:second});
  const result=await resolution.apply(await auth(),write,merge);
  assert.equal(result.version,1);
  assert.equal((await resolution.apply(await auth(),write,merge)).replayed,true);
  const source=await identityData("entity",first) as {merged_into_id:string;archived_at:string};
  assert.equal(source.merged_into_id,second);assert.ok(source.archived_at);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_designations
    where party_id=${first}::uuid`)[0]?.n,1);
  const original=await identityData("history",first) as unknown[];
  const destinationHistory=await identityData("history",second) as unknown[];
  assert.ok(original.length>=3);assert.ok(destinationHistory.length>=2);
  await assert.rejects(resolution.apply(await auth(),write,
    resolutionInput("merge",second,{relatedId:first})),/IDENTITY_RESOLUTION_TARGET_INVALID/);
  const archive=await resolution.apply(await auth(),write,
    resolutionInput("archive",second));
  assert.equal(archive.version,1);
  const restored=await resolution.apply(await auth(),write,
    resolutionInput("restore",second,{expectedVersion:1}));
  assert.equal(restored.version,2);
  assert.equal((await admin`select archived_at from crm_private.identity_entities
    where identity_id=${second}::uuid`)[0]?.archived_at,null);
  assert.equal((await identityData("history",second) as unknown[]).length>=4,true);
});

test("H1-003 I04-I06: server year, independent annual series, concurrency and replay",async()=>{
  const boundary=await admin`select
    crm_private.code_year_at('2026-12-31T22:59:59Z'::timestamptz) a,
    crm_private.code_year_at('2026-12-31T23:00:00Z'::timestamptz) b,
    crm_private.code_year_at('2026-06-30T22:00:00Z'::timestamptz) c`;
  assert.deepEqual([boundary[0]?.a,boundary[0]?.b,boundary[0]?.c],[2026,2027,2026]);
  const opportunityA=randomUUID(),opportunityB=randomUUID();
  await identity.apply(await auth(),write,input("create_context",opportunityA,{kind:"opportunity"}));
  await identity.apply(await auth(),write,input("create_context",opportunityB,{kind:"opportunity"}));
  const first=resolutionInput("assign_code",opportunityA,{kind:"OP"});
  const second=resolutionInput("assign_code",opportunityB,{kind:"OP"});
  const results=await Promise.all([resolution.apply(await auth(),write,first),
    resolution.apply(await auth(),write,second)]);
  assert.equal(new Set(results.map(x=>x.code)).size,2);
  const numbers=results.map(x=>Number(x.code?.split("-").at(-1))).sort((a,b)=>a-b);
  assert.equal(numbers[1]-numbers[0],1);
  assert.equal((await resolution.apply(await auth(),write,first)).code,results[0]?.code);
  assert.equal((await resolution.findCode(await auth(),read,"OP","code",results[0]!.code!))?.target_id,
    opportunityA);
  assert.equal((await resolution.findCode(await auth(),read,"OP","target",opportunityB))?.human_code,
    results[1]?.code);
  await assert.rejects(resolution.apply(await auth(),write,{...first,reason:"different"}),
    /IDENTITY_REPLAY_CONFLICT/);
  await assert.rejects(resolution.apply(await auth(),write,
    resolutionInput("assign_code",opportunityA,{kind:"OP"})),/IDENTITY_CODE_ALREADY_ASSIGNED/);
  for (const kind of ["PR","RES","INC"] as const) {
    const target=randomUUID();
    if (kind==="RES")
      await identity.apply(await auth(),write,input("create_context",target,{kind:"booking"}));
    const item=await resolution.apply(await auth(),write,
      resolutionInput("assign_code",target,{kind}));
    assert.match(item.code??"",new RegExp(`^${kind}-\\d{4}-0001$`));
  }
  const persisted=await admin`select code_kind,human_code,assigned_at,
    code_year,serial_number from crm_private.identity_codes
    where target_id in (${opportunityA}::uuid,${opportunityB}::uuid)`;
  assert.equal(persisted.length,2);
  for (const row of persisted) {
    assert.equal(row.code_year,Number(new Intl.DateTimeFormat("en-US",
      {timeZone:"Europe/Madrid",year:"numeric"}).format(row.assigned_at)));
  }
});

test("H1-003 I07: scope, authorization, atomicity and SQL privileges",async()=>{
  const entity=randomUUID();
  await identity.apply(await auth(),write,input("create_entity",entity));
  await assert.rejects(resolution.apply(await auth(),write,
    resolutionInput("merge",entity,{relatedId:randomUUID()})),
    /IDENTITY_RESOLUTION_TARGET_INVALID/);
  assert.equal((await admin`select version from crm_private.identity_entities
    where identity_id=${entity}::uuid`)[0]?.version,"0");
  await assert.rejects(resolution.apply(await auth(),read,
    resolutionInput("archive",entity)),/IDENTITY_INPUT_DENIED/);
  const acl=await admin`select
    has_table_privilege('crm_h0_runtime','crm_private.identity_codes','insert') direct_write,
    has_table_privilege('anon','crm_private.identity_codes','select') anon_read,
    has_function_privilege('public','crm_api.identity_resolve(bytea,bytea,bytea,bytea,bytea)','execute') public_exec,
    (select relforcerowsecurity from pg_class where oid='crm_private.identity_codes'::regclass) forced,
    (select pg_get_userbyid(relowner) from pg_class where oid='crm_private.identity_codes'::regclass) owner`;
  assert.deepEqual([acl[0]?.direct_write,acl[0]?.anon_read,acl[0]?.public_exec],
    [false,false,false]);
  assert.equal(acl[0]?.forced,true);assert.equal(acl[0]?.owner,"crm_h0_f2_owner");
});
