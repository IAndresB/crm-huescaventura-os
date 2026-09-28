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
const database="crm_h1_001_local";
const port=Number(process.env.POSTGRES_H1001_PORT??55431);
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
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-001-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1001_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1001_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1001_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin,"20260929000000_h0_m06_access_recovery.sql");
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h1-local",generation:randomUUID(),
    allowedPurposes:["h1-identities"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h1-local",generation:randomUUID(),
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

test("H1-001 identities remain distinct, incomplete and attributable",async()=>{
  const contextId=randomUUID(),contactId=randomUUID(),orgId=randomUUID(),groupId=randomUUID();
  await identity.apply(await auth(),write,input("create_context",contextId,{kind:"opportunity"}));
  const contact=await identity.apply(await auth(),write,input("create_entity",contactId,{displayName:""}));
  await identity.apply(await auth(),write,input("create_entity",orgId,{kind:"organization",displayName:"Synthetic organization"}));
  await identity.apply(await auth(),write,input("create_entity",groupId,{kind:"group",contextId,
    displayName:"Synthetic group"}));
  assert.equal(contact.version,0);
  const c=await identityData("entity",contactId) as {identity_kind:string;display_name:null;identity_verified:boolean};
  assert.equal(c.identity_kind,"contact");assert.equal(c.display_name,null);assert.equal(c.identity_verified,true);
  assert.equal((await identityData("entity",orgId) as {identity_kind:string}).identity_kind,"organization");
  assert.equal((await identityData("entity",groupId) as {identity_kind:string}).identity_kind,"group");
  const link=await identity.apply(await auth(),write,input("link_organization_contact",randomUUID(),
    {relatedId:contactId,contextId:orgId}));
  assert.equal(link.version,0);
  assert.equal((await identityData("organization_contacts",orgId) as unknown[]).length,1);
  const factTime="2026-01-01T10:00:00Z";
  const first=await identity.apply(await auth(),write,input("designate",randomUUID(),
    {relatedId:contactId,contextId,kind:"primary_contact",happenedAt:factTime}));
  assert.equal(first.version,1);
  const secondContact=randomUUID();
  await identity.apply(await auth(),write,input("create_entity",secondContact,{displayName:"Second synthetic contact"}));
  const second=await identity.apply(await auth(),write,input("designate",randomUUID(),
    {relatedId:secondContact,contextId,kind:"primary_contact",expectedVersion:1}));
  assert.equal(second.version,2);
  const ds=await identityData("designations",contextId) as {party_id:string;ended_at:string|null}[];
  assert.equal(ds.length,2);assert.equal(ds.filter(d=>d.ended_at===null)[0]?.party_id,secondContact);
  assert.equal(ds.filter(d=>d.ended_at!==null)[0]?.party_id,contactId);
  assert.equal((await identityData("history",first.id) as unknown[]).length,1);
  const historical=await admin`select d.effective_at, d.recorded_at, h.happened_at,
    h.recorded_at as history_recorded_at from crm_private.identity_designations d
    join crm_private.identity_history h on h.subject_id=d.designation_id
    where d.designation_id=${first.id}::uuid`;
  assert.equal(historical[0]?.effective_at.toISOString(),"2026-01-01T10:00:00.000Z");
  assert.equal(historical[0]?.happened_at.toISOString(),"2026-01-01T10:00:00.000Z");
  assert.ok(historical[0]?.recorded_at > historical[0]?.effective_at);
  assert.ok(historical[0]?.history_recorded_at > historical[0]?.happened_at);
});

test("H1-001 separate roles, provenance, version, replay and rollback",async()=>{
  const contextId=randomUUID(),payerId=randomUUID(),groupId=randomUUID();
  await identity.apply(await auth(),write,input("create_context",contextId,{kind:"booking"}));
  await identity.apply(await auth(),write,input("create_entity",payerId,{kind:"organization"}));
  await identity.apply(await auth(),write,input("create_entity",groupId,{kind:"group",contextId}));
  const payerCommand=input("designate",randomUUID(),{relatedId:payerId,contextId,kind:"payer"});
  const payer=await identity.apply(await auth(),write,payerCommand);
  assert.equal(payer.version,1);
  assert.equal((await identity.apply(await auth(),write,payerCommand)).replayed,true);
  await assert.rejects(identity.apply(await auth(),write,{...payerCommand,kind:"participant"}),/IDENTITY_REPLAY_CONFLICT/);
  const group=await identity.apply(await auth(),write,input("designate",randomUUID(),
    {relatedId:groupId,contextId,kind:"participant",expectedVersion:1}));
  assert.equal(group.version,2);
  const ds=await identityData("designations",contextId) as {role_kind:string;party_id:string}[];
  assert.deepEqual(new Set(ds.map(d=>d.role_kind)),new Set(["payer","participant"]));
  assert.equal(ds.find(d=>d.role_kind==="payer")?.party_id,payerId);
  await assert.rejects(identity.apply(await auth(),write,input("designate",randomUUID(),
    {relatedId:payerId,contextId,kind:"primary_contact",expectedVersion:2})),/IDENTITY_RELATION_UNVERIFIED/);
  assert.equal((await identityData("designations",contextId) as unknown[]).length,2);
  const update=input("update_entity",payerId,{kind:"organization",displayName:"Synthetic changed",
    expectedVersion:0});
  const updated=await identity.apply(await auth(),write,update);assert.equal(updated.version,1);
  await assert.rejects(identity.apply(await auth(),write,input("update_entity",payerId,
    {kind:"organization",expectedVersion:0,displayName:"Stale"})),/IDENTITY_VERSION_CONFLICT/);
  const history=await identityData("history",payerId) as
    {subject_kind:string;before_state:unknown;after_state:{display_name:string}}[];
  assert.equal(history.length,3);
  assert.equal(history.find(h=>h.subject_kind==="update_entity")?.after_state.display_name,
    "Synthetic changed");
});

test("H1-001 runtime SQL surface denies direct writes and unauthenticated reads",async()=>{
  await assert.rejects(runtime`select * from crm_private.identity_entities`,/permission denied/);
  await assert.rejects(runtime`insert into crm_private.identity_contexts(context_id,context_kind,admin_scope,source_ref,evidence_ref,verified)
    values(${randomUUID()}::uuid,'booking',${scope},'x','x',true)`,/permission denied/);
  await assert.rejects(identity.read({subject} as never,read,"entity",randomUUID()),/IDENTITY_AUTH_REQUIRED/);
});

test("H1-001 unverified identity cannot become primary while independent work continues",async()=>{
  const contextId=randomUUID(),contactId=randomUUID(),groupId=randomUUID();
  await identity.apply(await auth(),write,input("create_context",contextId,{kind:"opportunity"}));
  await identity.apply(await auth(),write,input("create_entity",contactId,
    {verified:false,evidenceRef:undefined,displayName:""}));
  const invalid=input("designate",randomUUID(),{relatedId:contactId,contextId,
    kind:"primary_contact",verified:true});
  await assert.rejects(identity.apply(await auth(),write,invalid),/IDENTITY_RELATION_UNVERIFIED/);
  const persisted=(await admin`select count(*)::int n from crm_private.identity_operations
    where operation_id=${invalid.operationId}::uuid`)[0]!.n;
  assert.equal(persisted,0);
  await identity.apply(await auth(),write,input("create_entity",groupId,{kind:"group",contextId,
    verified:false,evidenceRef:undefined}));
  assert.equal((await identityData("entity",groupId) as {identity_kind:string}).identity_kind,"group");
  const pending=await identity.apply(await auth(),write,input("designate",randomUUID(),
    {relatedId:groupId,contextId,kind:"participant",verified:false,evidenceRef:undefined}));
  assert.equal(pending.version,1);
  const designation=(await identityData("designations",contextId) as {verified:boolean}[])[0];
  assert.equal(designation?.verified,false);
  assert.equal((await identityData("history",invalid.targetId) as unknown[]).length,0);
});

test("H1-001 overlapping primary changes have one winner and no partial history",async()=>{
  const contextId=randomUUID(),a=randomUUID(),b=randomUUID();
  await identity.apply(await auth(),write,input("create_context",contextId,{kind:"booking"}));
  await identity.apply(await auth(),write,input("create_entity",a));
  await identity.apply(await auth(),write,input("create_entity",b));
  const x=input("designate",randomUUID(),{relatedId:a,contextId,kind:"primary_contact"});
  const y=input("designate",randomUUID(),{relatedId:b,contextId,kind:"primary_contact"});
  const outcomes=await Promise.allSettled([
    identity.apply(await auth(),write,x),identity.apply(await auth(),write,y),
  ]);
  assert.equal(outcomes.filter(o=>o.status==="fulfilled").length,1);
  assert.equal(outcomes.filter(o=>o.status==="rejected").length,1);
  assert.equal((await identityData("context",contextId) as {version:number}).version,1);
  assert.equal((await identityData("designations",contextId) as unknown[]).length,1);
  const persisted=await admin`select operation_id::text from crm_private.identity_operations
    where operation_id in (${x.operationId}::uuid,${y.operationId}::uuid)`;
  assert.equal(persisted.length,1);
  const history=await admin`select history_id::text from crm_private.identity_history
    where operation_id in (${x.operationId}::uuid,${y.operationId}::uuid)`;
  assert.equal(history.length,1);
});

test("H1-001 ACL keeps human tables outside runtime, public, Data API and SET ROLE",async()=>{
  const rows=await admin`select
    has_table_privilege('crm_h0_runtime','crm_private.identity_entities','select') as runtime_select,
    has_table_privilege('anon','crm_private.identity_entities','select') as anon_select,
    has_table_privilege('authenticated','crm_private.identity_entities','select') as authenticated_select,
    has_function_privilege('public','crm_api.identity_apply(bytea,bytea,bytea,bytea,bytea)','execute') as public_execute,
    (select rolbypassrls from pg_roles where rolname='crm_h0_runtime') as bypass,
    (select relforcerowsecurity from pg_class where oid='crm_private.identity_entities'::regclass) as force_rls`;
  assert.deepEqual({...rows[0]},
    {runtime_select:false,anon_select:false,authenticated_select:false,
      public_execute:false,bypass:false,force_rls:true});
  await assert.rejects(runtime.unsafe("set role crm_h0_f2_executor"),/permission denied/);
});

test("H1-001 contact signals and group counts preserve unknown versus known",async()=>{
  const contextId=randomUUID(),contactId=randomUUID(),groupId=randomUUID();
  await identity.apply(await auth(),write,input("create_context",contextId,{kind:"opportunity"}));
  await identity.apply(await auth(),write,input("create_entity",contactId,
    {givenName:"Synthetic",familyName:"Person",email:"synthetic@example.invalid",phone:"000000000"}));
  await identity.apply(await auth(),write,input("create_entity",groupId,{kind:"group",contextId,
    groupType:"synthetic-school",estimatedSize:24,sizeSource:"fixture-estimate"}));
  const before=await identityData("entity",groupId) as {
    estimated_size:number;confirmed_size:null;group_type:string;size_source:string
  };
  assert.equal(before.estimated_size,24);assert.equal(before.confirmed_size,null);
  await identity.apply(await auth(),write,input("update_entity",groupId,{kind:"group",
    confirmedSize:22,sizeSource:"fixture-confirmation",expectedVersion:0}));
  const after=await identityData("entity",groupId) as {
    estimated_size:number;confirmed_size:number;group_type:string;size_source:string
  };
  assert.equal(after.estimated_size,24);assert.equal(after.confirmed_size,22);
  assert.equal(after.group_type,"synthetic-school");
  assert.equal(after.size_source,"fixture-confirmation");
  await identity.apply(await auth(),write,input("update_entity",groupId,{kind:"group",
    confirmedSize:0,sizeSource:"fixture-confirmed-empty",expectedVersion:1}));
  const empty=await identityData("entity",groupId) as {confirmed_size:number;estimated_size:number};
  assert.equal(empty.confirmed_size,0);assert.equal(empty.estimated_size,24);
  await identity.apply(await auth(),write,input("update_entity",contactId,{kind:"contact",
    displayName:"Synthetic Person",expectedVersion:0}));
  const contact=await identityData("entity",contactId) as {email:string;phone:string;display_name:string};
  assert.equal(contact.email,"synthetic@example.invalid");assert.equal(contact.phone,"000000000");
  assert.equal(contact.display_name,"Synthetic Person");
  const history=await identityData("history",groupId) as {before_state:unknown;after_state:unknown}[];
  assert.equal(history.length,3);assert.equal(history[0]?.before_state,null);
  assert.ok(history[1]?.before_state);assert.ok(history[1]?.after_state);
});

test("H1-001 C01 limits and pages history with explicit provenance",async()=>{
  const contactId=randomUUID();
  await identity.apply(await auth(),write,input("create_entity",contactId));
  await identity.apply(await auth(),write,input("update_entity",contactId,
    {expectedVersion:0,displayName:"Paged synthetic contact"}));
  const first=await identity.read(await auth(),read,"history",contactId,{limit:1,offset:0});
  assert.equal(first.provenance,"crm-identity-register");
  assert.equal(first.nextPage,"1");
  assert.equal((first.data as unknown[]).length,1);
  const second=await identity.read(await auth(),read,"history",contactId,{limit:1,offset:1});
  assert.equal(second.nextPage,undefined);
  assert.equal((second.data as unknown[]).length,1);
  assert.notEqual((first.data as {history_id:string}[])[0]?.history_id,
    (second.data as {history_id:string}[])[0]?.history_id);
  await assert.rejects(identity.read(await auth(),read,"history",contactId,{limit:101}),
    /IDENTITY_INPUT_DENIED/);
});

test("H1-001 injected history failure rolls back the entity and result together",async()=>{
  const targetId=randomUUID(),operationId=randomUUID();
  await admin.unsafe(`create function crm_private.h1_fixture_abort_history() returns trigger
    language plpgsql as $$ begin raise exception 'H1_FIXTURE_ABORT'; end $$`);
  await admin.unsafe(`create trigger h1_fixture_abort_history before insert on crm_private.identity_history
    for each row execute function crm_private.h1_fixture_abort_history()`);
  try {
    await assert.rejects(identity.apply(await auth(),write,input("create_entity",targetId,
      {operationId})),/IDENTITY_DENIED/);
  } finally {
    await admin.unsafe("drop trigger h1_fixture_abort_history on crm_private.identity_history");
    await admin.unsafe("drop function crm_private.h1_fixture_abort_history()");
  }
  const rows=await admin`select
    (select count(*)::int from crm_private.identity_entities where identity_id=${targetId}::uuid) as entities,
    (select count(*)::int from crm_private.identity_operations where operation_id=${operationId}::uuid) as operations,
    (select count(*)::int from crm_private.identity_history where operation_id=${operationId}::uuid) as history`;
  assert.deepEqual({...rows[0]},{entities:0,operations:0,history:0});
});
