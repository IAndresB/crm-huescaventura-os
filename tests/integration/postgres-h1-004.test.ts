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
const database="crm_h1_004_formal";
const port=Number(process.env.POSTGRES_H1004_PORT??55434);
const subject=randomUUID(),actorId=randomUUID(),scope="h1-fixture-scope";
let temporaryRoot="",socket="",started=false;
let admin:postgres.Sql,migration:postgres.Sql,runtime:postgres.Sql;
let f1:F1SigningConfiguration,f2:F2SigningConfiguration;
let identity:H1001IdentityAdapter,resolution:H1003ResolutionAdapter,access:H0005PostgresAdapter;
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
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-004-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1004_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1004_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1004_bootstrap");migration=connect("crm_h0_migration");
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
  await identity.apply(await auth(),write,input("create_entity",predecessorIdentity,
    {displayName:"Predecessor synthetic identity"}));
  await migration.unsafe(await readFile(join(migrations,"202609290002_h1_merge_archive_codes.sql"),"utf8"));
  resolution=new H1003ResolutionAdapter(runtime,f1,f2);
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

test("H1-004 R01-R04: no automatic merge, scoped resolution, retained links and restoration",async()=>{
  const opportunity=randomUUID(),a=randomUUID(),b=randomUUID(),organization=randomUUID();
  await identity.apply(await auth(),write,input("create_context",opportunity,{kind:"opportunity"}));
  await identity.apply(await auth(),write,input("create_entity",a,
    {email:"duplicate@example.invalid",phone:"000001",displayName:"Synthetic A"}));
  await identity.apply(await auth(),write,input("create_entity",b,
    {email:"duplicate@example.invalid",phone:"000001",displayName:"Synthetic B"}));
  await identity.apply(await auth(),write,input("create_entity",organization,{kind:"organization"}));
  await identity.apply(await auth(),write,input("designate",randomUUID(),
    {contextId:opportunity,relatedId:a,kind:"primary_contact"}));
  assert.equal((await resolution.candidates(await auth(),read,a)).length,1);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_entities
    where identity_id in (${a}::uuid,${b}::uuid) and archived_at is null`)[0]?.n,2);
  await assert.rejects(resolution.apply(await auth(),write,
    request("merge",a,{relatedId:organization})),/IDENTITY_RESOLUTION_TARGET_INVALID/);
  const outsider=randomUUID();
  await migration`insert into crm_private.identity_entities(identity_id,identity_kind,admin_scope,
    source_ref,evidence_ref,identity_verified) values(${outsider}::uuid,'contact',
    'other-scope','formal-synthetic','formal-proof',true)`;
  await assert.rejects(resolution.apply(await auth(),write,
    request("merge",a,{relatedId:outsider})),/IDENTITY_RESOLUTION_TARGET_INVALID/);
  assert.equal((await admin`select version from crm_private.identity_entities
    where identity_id=${a}::uuid`)[0]?.version,"0");
  await resolution.apply(await auth(),write,request("merge",a,{relatedId:b}));
  const persisted=await admin`select identity_id::text,merged_into_id::text,archived_at,source_ref
    from crm_private.identity_entities where identity_id in (${a}::uuid,${b}::uuid)
    order by identity_id`;
  assert.equal(persisted.length,2);
  assert.equal(persisted.find(x=>x.identity_id===a)?.merged_into_id,b);
  assert.ok(persisted.find(x=>x.identity_id===a)?.archived_at);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_designations
    where party_id=${a}::uuid`)[0]?.n,1);
  await assert.rejects(identity.apply(await auth(),write,input("designate",randomUUID(),
    {contextId:opportunity,relatedId:a,kind:"primary_contact",expectedVersion:1})),
    /IDENTITY_DENIED/);
  assert.equal((await admin`select version from crm_private.identity_contexts
    where context_id=${opportunity}::uuid`)[0]?.version,"1");
  assert.equal((await admin`select count(*)::int n from crm_private.identity_history
    where subject_id=${a}::uuid`)[0]?.n,2);
  const archive=await resolution.apply(await auth(),write,request("archive",b));
  assert.equal(archive.version,1);
  await resolution.apply(await auth(),write,request("restore",b,{expectedVersion:1}));
  const after=await admin`select archived_at from crm_private.identity_entities
    where identity_id=${b}::uuid`;
  assert.equal(after[0]?.archived_at,null);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_history
    where subject_id=${b}::uuid`)[0]?.n,3);
  let raced!:Promise<unknown>;
  await migration.begin(async tx=>{
    await tx.unsafe("select 1 from crm_private.identity_entities where identity_id=$1::uuid for update",[b]);
    raced=identity.apply(await auth(),write,input("designate",randomUUID(),
      {contextId:opportunity,relatedId:b,kind:"primary_contact",expectedVersion:1}));
    await new Promise(done=>setTimeout(done,40));
    await tx.unsafe("update crm_private.identity_entities set archived_at=clock_timestamp() where identity_id=$1::uuid",[b]);
  });
  await assert.rejects(raced,/IDENTITY_DENIED/);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_designations
    where party_id=${b}::uuid`)[0]?.n,0);
  await assert.rejects(resolution.apply(await auth(),write,
    request("merge",opportunity,{kind:"OP",relatedId:b})),/IDENTITY_INPUT_DENIED/);
});

test("H1-004 R05-R07: D040 cut, distinct serials, no reuse and replay competition",async()=>{
  await admin.unsafe("set time zone 'UTC'");
  const utc=await admin`select crm_private.code_year_at('2026-12-31T22:59:59.999Z') before_cut,
    crm_private.code_year_at('2026-12-31T23:00:00Z') at_cut`;
  await admin.unsafe("set time zone 'America/Los_Angeles'");
  const pacific=await admin`select crm_private.code_year_at('2026-12-31T22:59:59.999Z') before_cut,
    crm_private.code_year_at('2026-12-31T23:00:00Z') at_cut`;
  assert.deepEqual([utc[0]?.before_cut,utc[0]?.at_cut],[2026,2027]);
  assert.deepEqual([pacific[0]?.before_cut,pacific[0]?.at_cut],[2026,2027]);
  const dst=await admin`select
    crm_private.code_year_at('2026-03-29T00:59:59Z'::timestamptz) before_year,
    crm_private.code_year_at('2026-03-29T01:00:00Z'::timestamptz) after_year,
    to_char('2026-03-29T00:59:59Z'::timestamptz at time zone 'Europe/Madrid','HH24:MI') before_clock,
    to_char('2026-03-29T01:00:00Z'::timestamptz at time zone 'Europe/Madrid','HH24:MI') after_clock`;
  assert.deepEqual([dst[0]?.before_year,dst[0]?.after_year,
    dst[0]?.before_clock,dst[0]?.after_clock],[2026,2026,"01:59","03:00"]);
  const targets=[randomUUID(),randomUUID(),randomUUID()];
  for (const id of targets)
    await identity.apply(await auth(),write,input("create_context",id,{kind:"opportunity"}));
  const requests=targets.map(id=>request("assign_code",id,{kind:"OP"}));
  const issued=await Promise.all(requests.map(async request=>
    resolution.apply(await auth(),write,request)));
  const nums=issued.map(x=>Number(x.code?.split("-").at(-1))).sort((a,b)=>a-b);
  assert.deepEqual(nums,[1,2,3]);
  for (let i=0;i<targets.length;i++) {
    assert.equal((await resolution.findCode(await auth(),read,"OP","code",issued[i]!.code!))
      ?.target_id,targets[i]);
    assert.equal((await resolution.findCode(await auth(),read,"OP","target",targets[i]!))
      ?.human_code,issued[i]?.code);
  }
  assert.equal(await resolution.findCode(await auth(),read,"PR","code",issued[0]!.code!),null);
  assert.equal((await resolution.apply(await auth(),write,requests[0]!)).code,issued[0]?.code);
  await assert.rejects(resolution.apply(await auth(),write,
    {...requests[0]!,reason:"altered"}),/IDENTITY_REPLAY_CONFLICT/);
  const competing=await Promise.allSettled([
    resolution.apply(await auth(),write,request("assign_code",targets[0]!,{kind:"OP"})),
    resolution.apply(await auth(),write,request("assign_code",targets[0]!,{kind:"OP"}))]);
  assert.equal(competing.filter(x=>x.status==="fulfilled").length,0);
  await assert.rejects(resolution.apply(await auth(),write,
    request("assign_code",randomUUID(),{kind:"RES"})),
    /IDENTITY_RESOLUTION_TARGET_INVALID/);
  for (const kind of ["PR","RES","INC"] as const) {
    const target=randomUUID();
    if (kind==="RES")
      await identity.apply(await auth(),write,input("create_context",target,{kind:"booking"}));
    const value=await resolution.apply(await auth(),write,
      request("assign_code",target,{kind}));
    assert.match(value.code??"",new RegExp(`^${kind}-\\d{4}-0001$`));
  }
  const rows=await admin`select code_kind,code_year,serial_number,human_code,assigned_at
    from crm_private.identity_codes order by code_kind,serial_number`;
  assert.equal(rows.length,6);
  assert.equal(new Set(rows.map(x=>x.human_code)).size,6);
  assert.ok(rows.every(x=>x.code_year===Number(new Intl.DateTimeFormat("en-US",
    {timeZone:"Europe/Madrid",year:"numeric"}).format(x.assigned_at))));
});

test("H1-004 R06: code remains searchable after linked identities merge and archive",async()=>{
  const opportunity=randomUUID(),first=randomUUID(),second=randomUUID();
  await identity.apply(await auth(),write,input("create_context",opportunity,{kind:"opportunity"}));
  await identity.apply(await auth(),write,input("create_entity",first));
  await identity.apply(await auth(),write,input("create_entity",second));
  await identity.apply(await auth(),write,input("designate",randomUUID(),
    {contextId:opportunity,relatedId:first,kind:"primary_contact"}));
  const issued=await resolution.apply(await auth(),write,
    request("assign_code",opportunity,{kind:"OP"}));
  await resolution.apply(await auth(),write,request("merge",first,{relatedId:second}));
  await resolution.apply(await auth(),write,request("archive",second));
  assert.equal((await resolution.findCode(await auth(),read,"OP","target",opportunity))?.human_code,
    issued.code);
  assert.equal((await resolution.findCode(await auth(),read,"OP","code",issued.code!))?.target_id,
    opportunity);
  await assert.rejects(resolution.apply(await auth(),write,
    request("assign_code",opportunity,{kind:"OP"})),/IDENTITY_CODE_ALREADY_ASSIGNED/);
  const rows=await admin`select
    (select count(*)::int from crm_private.identity_codes where target_id=${opportunity}::uuid) codes,
    (select count(*)::int from crm_private.identity_designations where party_id=${first}::uuid) links,
    (select count(*)::int from crm_private.identity_entities
      where identity_id in (${first}::uuid,${second}::uuid)) identities`;
  assert.deepEqual([rows[0]?.codes,rows[0]?.links,rows[0]?.identities],[1,1,2]);
});

test("H1-004 R08-R10: rollback, SQL authority, RLS and old session",async()=>{
  const predecessor=await admin`select display_name,version,archived_at
    from crm_private.identity_entities where identity_id=${predecessorIdentity}::uuid`;
  assert.deepEqual([predecessor[0]?.display_name,predecessor[0]?.version,
    predecessor[0]?.archived_at],["Predecessor synthetic identity","0",null]);
  const target=randomUUID(),operation=randomUUID();
  await identity.apply(await auth(),write,input("create_context",target,{kind:"opportunity"}));
  await admin.unsafe(`create function pg_temp.h1_formal_code_fail() returns trigger language plpgsql as $$
    begin raise exception 'FORMAL_HISTORY_FAULT'; end $$`);
  await admin.unsafe(`create trigger h1_formal_code_fail before insert on crm_private.identity_history
    for each row when (new.operation_id='${operation}'::uuid)
    execute function pg_temp.h1_formal_code_fail()`);
  try {
    await assert.rejects(resolution.apply(await auth(),write,
      request("assign_code",target,{kind:"OP",operationId:operation})),/IDENTITY_DENIED/);
  } finally {
    await admin.unsafe("drop trigger h1_formal_code_fail on crm_private.identity_history");
  }
  const residue=await admin`select
    (select count(*)::int from crm_private.identity_codes where target_id=${target}::uuid) codes,
    (select count(*)::int from crm_private.identity_operations where operation_id=${operation}::uuid) operations,
    (select count(*)::int from crm_private.identity_history where operation_id=${operation}::uuid) history`;
  assert.deepEqual([residue[0]?.codes,residue[0]?.operations,residue[0]?.history],[0,0,0]);
  const next=await resolution.apply(await auth(),write,request("assign_code",target,{kind:"OP"}));
  assert.equal(Number(next.code?.split("-").at(-1)),5);
  const acl=await admin`select
    has_table_privilege('crm_h0_runtime','crm_private.identity_codes','select') runtime_read,
    has_table_privilege('crm_h0_runtime','crm_private.identity_code_counters','update') runtime_update,
    has_table_privilege('anon','crm_private.identity_codes','select') anon_read,
    has_table_privilege('authenticated','crm_private.identity_codes','select') auth_read,
    has_function_privilege('public','crm_api.identity_resolve(bytea,bytea,bytea,bytea,bytea)','execute') public_resolve,
    (select relforcerowsecurity from pg_class where oid='crm_private.identity_codes'::regclass) forced,
    (select pg_get_userbyid(relowner) from pg_class where oid='crm_private.identity_codes'::regclass) owner`;
  assert.deepEqual([acl[0]?.runtime_read,acl[0]?.runtime_update,acl[0]?.anon_read,
    acl[0]?.auth_read,acl[0]?.public_resolve],[false,false,false,false,false]);
  assert.equal(acl[0]?.forced,true);assert.equal(acl[0]?.owner,"crm_h0_f2_owner");
  await migration`update crm_private.crm_actors
    set access_generation=access_generation+1 where actor_id=${actorId}::uuid`;
  await assert.rejects(resolution.apply(await auth(),write,
    request("assign_code",randomUUID(),{kind:"PR"})),/IDENTITY_DENIED/);
  await migration`update crm_private.crm_actors
    set access_generation=access_generation-1 where actor_id=${actorId}::uuid`;
  await migration`update crm_private.identification_epochs
    set current_epoch=false,closed_at=clock_timestamp() where session_id=${sessionId}::uuid`;
  await assert.rejects(resolution.apply(await auth(),write,
    request("assign_code",randomUUID(),{kind:"PR"})),/IDENTITY_DENIED/);
  await migration`update crm_private.identification_epochs
    set current_epoch=true,closed_at=null where session_id=${sessionId}::uuid`;
  await migration`update crm_private.crm_sessions set revoked_at=clock_timestamp()
    where session_id=${sessionId}::uuid`;
  await assert.rejects(resolution.candidates(await auth(),read,target),/IDENTITY_DENIED/);
  await assert.rejects(resolution.apply(await auth(),write,
    request("assign_code",randomUUID(),{kind:"PR"})),/IDENTITY_DENIED/);
  assert.equal((await admin`select count(*)::int n from crm_private.identity_codes
    where code_kind='PR'`)[0]?.n,1);
});
