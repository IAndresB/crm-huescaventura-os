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
import type { F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";

const bin=process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h1_002_formal";
const port=Number(process.env.POSTGRES_H1002_PORT??55432);
const subject=randomUUID(),actorId=randomUUID(),scope="h1-fixture-scope";
let temporaryRoot="",socket="",started=false;
let admin:postgres.Sql,migration:postgres.Sql,runtime:postgres.Sql;
let f1:F1SigningConfiguration,f2:F2SigningConfiguration;
let identity:H1001IdentityAdapter,access:H0005PostgresAdapter;
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
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-002-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1002_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1002_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1002_bootstrap");migration=connect("crm_h0_migration");
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
  identity=new H1001IdentityAdapter(runtime,f1,f2);
});
after(async()=>{
  await Promise.allSettled([runtime?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started) command("pg_ctl",["-D",join(temporaryRoot,"data"),"-m","fast","-w","stop"]);
  if(temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});

test("H1-002 R01-R08,R17: distinct parties, context, history and denied inference",async()=>{
  const caseId=randomUUID(),org=randomUUID(),one=randomUUID(),two=randomUUID(),group=randomUUID();
  await identity.apply(await auth(),write,input("create_context",caseId,{kind:"booking"}));
  await identity.apply(await auth(),write,input("create_entity",org,
    {kind:"organization",displayName:"Formal fixture organization"}));
  await identity.apply(await auth(),write,input("create_entity",one,
    {displayName:"",email:"shared@example.invalid"}));
  await identity.apply(await auth(),write,input("create_entity",two,
    {displayName:"",email:"shared@example.invalid"}));
  await identity.apply(await auth(),write,input("create_entity",group,
    {kind:"group",contextId:caseId,estimatedSize:12,sizeSource:"fixture-estimate"}));
  const entities=await admin`select identity_id::text,identity_kind,display_name,email,estimated_size,
    confirmed_size from crm_private.identity_entities where identity_id in
    (${org}::uuid,${one}::uuid,${two}::uuid,${group}::uuid)`;
  assert.equal(entities.length,4);
  assert.deepEqual(new Set(entities.map(e=>e.identity_kind)),new Set(["contact","organization","group"]));
  assert.equal(entities.find(e=>e.identity_id===one)?.display_name,null);
  assert.equal(entities.find(e=>e.identity_id===group)?.confirmed_size,null);
  assert.equal(entities.find(e=>e.identity_id===group)?.estimated_size,12);
  assert.equal(entities.filter(e=>e.email==="shared@example.invalid").length,2);
  const bad=input("link_organization_contact",randomUUID(),
    {contextId:org,relatedId:one,verified:false,evidenceRef:undefined});
  await assert.rejects(identity.apply(await auth(),write,bad),/IDENTITY_INPUT_DENIED/);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_organization_contacts
    where organization_id=${org}::uuid`)[0]?.n,0);
  await identity.apply(await auth(),write,input("link_organization_contact",randomUUID(),
    {contextId:org,relatedId:one}));
  await identity.apply(await auth(),write,input("link_organization_contact",randomUUID(),
    {contextId:org,relatedId:two}));
  assert.equal((await admin`select count(*)::int n from crm_private.identity_history
    where context_id=${org}::uuid`)[0]?.n,2);
  const oldDesignation=randomUUID(),newDesignation=randomUUID();
  const historical="2026-01-10T09:00:00Z";
  await identity.apply(await auth(),write,input("designate",oldDesignation,
    {contextId:caseId,relatedId:one,kind:"primary_contact",happenedAt:historical}));
  await identity.apply(await auth(),write,input("designate",newDesignation,
    {contextId:caseId,relatedId:two,kind:"primary_contact",expectedVersion:1}));
  await identity.apply(await auth(),write,input("designate",randomUUID(),
    {contextId:caseId,relatedId:org,kind:"payer",expectedVersion:2}));
  await identity.apply(await auth(),write,input("designate",randomUUID(),
    {contextId:caseId,relatedId:group,kind:"participant",expectedVersion:3}));
  const rows=await admin`select designation_id::text,party_id::text,role_kind,ended_at,effective_at,
    recorded_at from crm_private.identity_designations where context_id=${caseId}::uuid`;
  assert.equal(rows.length,4);
  assert.equal(rows.find(d=>d.designation_id===oldDesignation)?.party_id,one);
  assert.ok(rows.find(d=>d.designation_id===oldDesignation)?.ended_at);
  assert.equal(rows.find(d=>d.designation_id===newDesignation)?.ended_at,null);
  assert.equal(rows.find(d=>d.designation_id===oldDesignation)?.effective_at.toISOString(),
    "2026-01-10T09:00:00.000Z");
  assert.ok(rows.find(d=>d.designation_id===oldDesignation)?.recorded_at
    > rows.find(d=>d.designation_id===oldDesignation)?.effective_at);
  assert.equal(rows.find(d=>d.role_kind==="payer")?.party_id,org);
  assert.equal(rows.find(d=>d.role_kind==="participant")?.party_id,group);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_designations
    where role_kind='acceptor'`)[0]?.n,0);
  await identity.apply(await auth(),write,input("designate",randomUUID(),
    {contextId:caseId,relatedId:org,kind:"client",expectedVersion:4}));
  assert.equal((await admin`select count(*)::int n from crm_private.identity_designations
    where context_id=${caseId}::uuid and role_kind='client' and party_id=${org}::uuid`)[0]?.n,1);
  const oldHistory=await admin`select h.actor_id::text,h.source_ref,h.evidence_ref,h.reason,
    h.before_state,h.after_state,h.happened_at,h.recorded_at
    from crm_private.identity_history h where h.subject_id=${oldDesignation}::uuid`;
  assert.equal(oldHistory.length,1);assert.equal(oldHistory[0]?.source_ref,"fixture-manual-record");
  assert.equal(oldHistory[0]?.actor_id,actorId);
  assert.equal(oldHistory[0]?.evidence_ref,"fixture-verification");
  assert.equal(oldHistory[0]?.reason,"fixture-operation");
  assert.equal(oldHistory[0]?.before_state,null);
  assert.equal(oldHistory[0]?.happened_at.toISOString(),"2026-01-10T09:00:00.000Z");
  assert.ok(oldHistory[0]?.recorded_at>oldHistory[0]?.happened_at);
  const candidate=randomUUID();
  await identity.apply(await auth(),write,input("create_entity",candidate,
    {verified:false,evidenceRef:undefined}));
  await assert.rejects(identity.apply(await auth(),write,input("designate",randomUUID(),
    {contextId:caseId,relatedId:candidate,kind:"primary_contact",expectedVersion:5})),
    /IDENTITY_RELATION_UNVERIFIED/);
  assert.equal((await admin`select version from crm_private.identity_contexts
    where context_id=${caseId}::uuid`)[0]?.version,"5");
  assert.equal((await admin`select count(*)::int n from crm_private.identity_history
    where related_id=${candidate}::uuid`)[0]?.n,0);
});

test("H1-002 R09-R10,R15: C01/C02 and narrow SQL authority",async()=>{
  const id=randomUUID();
  await identity.apply(await auth(),write,input("create_entity",id,
    {verified:false,evidenceRef:undefined}));
  const observed=await identity.read(await auth(),read,"entity",id);
  assert.equal(observed.provenance,"crm-identity-register");
  assert.equal(observed.certainty,"pending");
  await identity.apply(await auth(),write,input("update_entity",id,
    {verified:false,evidenceRef:undefined,displayName:"Formal known",expectedVersion:0}));
  const firstPage=await identity.read(await auth(),read,"history",id,{limit:1,offset:0});
  const secondPage=await identity.read(await auth(),read,"history",id,{limit:1,offset:1});
  assert.equal((firstPage.data as unknown[]).length,1);
  assert.equal(firstPage.nextPage,"1");
  assert.equal((secondPage.data as unknown[]).length,1);
  assert.equal(secondPage.nextPage,undefined);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_history
    where subject_id=${id}::uuid`)[0]?.n,2);
  await assert.rejects(identity.read({subject} as never,read,"entity",id),/IDENTITY_AUTH_REQUIRED/);
  await assert.rejects(identity.apply(await auth(),write,input("create_entity",randomUUID(),
    {kind:"organization",email:"invalid@example.invalid"})),/IDENTITY_INPUT_DENIED/);
  const acl=await admin`select
    has_table_privilege('crm_h0_runtime','crm_private.identity_entities','select') as runtime_read,
    has_table_privilege('anon','crm_private.identity_entities','select') as anon_read,
    has_table_privilege('authenticated','crm_private.identity_entities','select') as auth_read,
    has_function_privilege('public','crm_api.identity_apply(bytea,bytea,bytea,bytea,bytea)','execute') as public_apply,
    pg_has_role('crm_h0_runtime','crm_h0_f2_owner','MEMBER') as runtime_owner_member,
    (select relforcerowsecurity from pg_class where oid='crm_private.identity_entities'::regclass) as forced,
    (select pg_get_userbyid(relowner) from pg_class where oid='crm_private.identity_entities'::regclass) as owner`;
  assert.deepEqual([acl[0]?.runtime_read,acl[0]?.anon_read,acl[0]?.auth_read,acl[0]?.public_apply],
    [false,false,false,false]);
  assert.equal(acl[0]?.forced,true);assert.equal(acl[0]?.owner,"crm_h0_f2_owner");
  assert.equal(acl[0]?.runtime_owner_member,false);
  await assert.rejects(runtime`select * from crm_private.identity_entities`,/permission denied/);
});

test("H1-002 R11-R14: concurrent versions, replay and cross-connection rollback",async()=>{
  const context=randomUUID(),a=randomUUID(),b=randomUUID();
  await identity.apply(await auth(),write,input("create_context",context,{kind:"opportunity"}));
  await identity.apply(await auth(),write,input("create_entity",a));
  await identity.apply(await auth(),write,input("create_entity",b));
  const first=input("designate",randomUUID(),{contextId:context,relatedId:a,kind:"primary_contact"});
  const second=input("designate",randomUUID(),{contextId:context,relatedId:b,kind:"primary_contact"});
  const concurrent=await Promise.allSettled([
    identity.apply(await auth(),write,first),identity.apply(await auth(),write,second)]);
  assert.equal(concurrent.filter(x=>x.status==="fulfilled").length,1);
  assert.equal(concurrent.filter(x=>x.status==="rejected").length,1);
  assert.equal((await admin`select version from crm_private.identity_contexts
    where context_id=${context}::uuid`)[0]?.version,"1");
  assert.equal((await admin`select count(*)::int n from crm_private.identity_designations
    where context_id=${context}::uuid`)[0]?.n,1);
  const winner=concurrent[0]?.status==="fulfilled"?first:second;
  assert.equal((await identity.apply(await auth(),write,winner)).replayed,true);
  await assert.rejects(identity.apply(await auth(),write,{...winner,reason:"changed"}),
    /IDENTITY_REPLAY_CONFLICT/);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_operations
    where operation_id=${winner.operationId}::uuid`)[0]?.n,1);
  const changed=input("update_entity",a,{expectedVersion:0,displayName:"Formal one"});
  const other=input("update_entity",a,{expectedVersion:0,displayName:"Formal two"});
  const updates=await Promise.allSettled([
    identity.apply(await auth(),write,changed),identity.apply(await auth(),write,other)]);
  assert.equal(updates.filter(x=>x.status==="fulfilled").length,1);
  assert.equal((await admin`select version from crm_private.identity_entities
    where identity_id=${a}::uuid`)[0]?.version,"1");
  const faultId=randomUUID(),faultOperation=randomUUID();
  await admin.unsafe(`create function pg_temp.h1_formal_fail() returns trigger language plpgsql as $$
    begin raise exception 'FORMAL_FAULT'; end $$`);
  await admin.unsafe(`create trigger h1_formal_fail before insert on crm_private.identity_history
    for each row when (new.operation_id='${faultOperation}'::uuid)
    execute function pg_temp.h1_formal_fail()`);
  try {
    await assert.rejects(identity.apply(await auth(),write,input("create_entity",faultId,
      {operationId:faultOperation})),/IDENTITY_DENIED/);
  } finally {
    await admin.unsafe("drop trigger h1_formal_fail on crm_private.identity_history");
  }
  const residue=await admin`select
    (select count(*)::int from crm_private.identity_entities where identity_id=${faultId}::uuid) as entity,
    (select count(*)::int from crm_private.identity_operations where operation_id=${faultOperation}::uuid) as operation,
    (select count(*)::int from crm_private.identity_history where operation_id=${faultOperation}::uuid) as history`;
  assert.deepEqual([residue[0]?.entity,residue[0]?.operation,residue[0]?.history],[0,0,0]);
});

test("H1-002 R16,R18: migration chain and synthetic fixture discipline",async()=>{
  const tables=await admin`select tablename from pg_tables where schemaname='crm_private'
    and tablename like 'identity_%' order by tablename`;
  assert.equal(tables.length,6);
  const migrationsList=await readdir(migrations);
  assert.equal(migrationsList.filter(x=>x.startsWith("202609290001_h1_")).length,1);
  assert.equal(scope,"h1-fixture-scope");
});
