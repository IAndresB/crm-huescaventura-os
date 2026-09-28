import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import postgres from "postgres";
import { verifyAuth } from "../../src/application/verified-auth.ts";
import { verifyRecoveryCompletion, verifyRecoveryStart,
  type RecoveryStartClaims, type RecoveryCompletionClaims } from "../../src/application/recovery-authority.ts";
import { classifyServerEvent } from "../../src/application/verified-interaction.ts";
import { H0005PostgresAdapter } from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import { H0016RecoveryAdapter } from "../../src/infrastructure/postgres/h0-016-adapter.ts";
import type { F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";
import type { F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";

const bin=process.env.POSTGRES_H0_BIN;
if(!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h0_016_local";
const port=Number(process.env.POSTGRES_H016_PORT??55428);
const actorId=randomUUID(), subject=randomUUID(), scope="scope-h016";
let temporaryRoot="",socket="",started=false;
let admin:postgres.Sql,migration:postgres.Sql,runtime:postgres.Sql;
let f1:F1SigningConfiguration,f2:F2SigningConfiguration;
let access:H0005PostgresAdapter;
const starts=new Map<string,RecoveryStartClaims>();
const completions=new Map<string,RecoveryCompletionClaims>();
const provider={
  verifyStart:async(proof:string)=>starts.get(proof),
  verifyCompletion:async(proof:string)=>completions.get(proof),
};
function command(name:string,args:readonly string[]){
  const result=spawnSync(join(bin!,name),args,{encoding:"utf8",env:{...process.env,LC_ALL:"C"}});
  assert.equal(result.status,0,`${name}: ${result.stderr}`);
}
function connect(user:string,db=database){
  return postgres({host:socket,port,database:db,user,max:1,prepare:false,connect_timeout:3,onnotice:()=>{}});
}
async function applyChain(target:postgres.Sql,bootstrap:postgres.Sql){
  const files=(await readdir(migrations)).filter((name)=>name.endsWith(".sql")
    && name!=="202609150000_h0_m01_roles.sql").sort();
  for(const file of files){
    if(file.endsWith("_authorities.sql")){
      const exists=(await bootstrap`select exists(select 1 from pg_roles where rolname='crm_h0_ha_tx') present`)[0]?.present;
      if(!exists) await bootstrap.unsafe(await readFile(join(migrations,file),"utf8"));
    }else await target.unsafe(await readFile(join(migrations,file),"utf8"));
  }
}
async function auth(sessionId?:string,passwordVerified=true,mfaVerified=true){
  return verifyAuth({verify:async()=>({subject,...sessionId?{sessionId}:{},passwordVerified,mfaVerified})},randomUUID());
}
function recovery(outcome:"revoked"|"failed"|"uncertain"="revoked"){
  return new H0016RecoveryAdapter(runtime,f1,{revokeAllSessions:async()=>outcome});
}
async function start(kind:"password"|"break_glass",overrides:Partial<RecoveryStartClaims>={}){
  const proof=randomUUID();
  starts.set(proof,{kind,subject,emailPreviouslyVerified:kind==="password",linkConsumed:kind==="password",
    ownerIndependent:kind==="break_glass",...overrides});
  return verifyRecoveryStart(provider,proof);
}
async function complete(recoveryId:string,overrides:Partial<RecoveryCompletionClaims>={}){
  const proof=randomUUID();
  completions.set(proof,{recoveryId,subject,passwordReady:true,totpVerified:true,
    newFactorEnrolled:false,oldFactorRevoked:false,newPaperCopyVerified:false,...overrides});
  return verifyRecoveryCompletion(provider,proof);
}

before(async()=>{
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h0-016-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h016_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h016_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h016_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin);
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h016-local",generation:randomUUID(),
    allowedPurposes:["h0-005-human-bridge","h0-016-recovery"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h016-local",generation:randomUUID(),
    allowedPurposes:["full-identification","core-human-access","session-revocation"]};
  await migration`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f1.keyId},${Buffer.from(f1.key)},${f1.audience},${f1.generation},${f1.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},${f2.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`select crm_api.provision_actor_mapping(${actorId}::uuid,${subject}::uuid,${scope})`;
  await admin`insert into crm_private.access_probe(probe_id,context_scope,public_value,private_value)
    values('h016-probe',${scope},'public','private')`;
  runtime=connect("crm_h0_runtime"); access=new H0005PostgresAdapter(runtime,f1,f2);
});
after(async()=>{
  await Promise.allSettled([runtime?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started) command("pg_ctl",["-D",join(temporaryRoot,"data"),"-m","fast","-w","stop"]);
  if(temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});

test("H0-016 I01/I03/I05/I06 D027 closes Core and needs TOTP before new identification",async()=>{
  const old=await access.establish(await auth()); const oldAuth=await auth(old.sessionId);
  assert.equal((await access.readCoreProbe(oldAuth,classifyServerEvent("core-read"),"h016-probe"))?.publicValue,"public");
  const id=randomUUID(); const result=await recovery().begin(await start("password"),id);
  assert.deepEqual(result,{status:"pending",recoveryId:id,auth:"revoked"});
  await assert.rejects(access.readCoreProbe(oldAuth,classifyServerEvent("core-read"),"h016-probe"),/F2_CORE_DENIED/);
  await assert.rejects(access.reidentify(oldAuth),/F2_REIDENTIFY_DENIED/);
  await assert.rejects(access.establish(await auth(undefined,true,false)),/F2_FULL_IDENTIFICATION_REQUIRED/);
  await assert.rejects(complete(id,{totpVerified:false}),/RECOVERY_COMPLETION_DENIED/);
  const generation=await recovery().complete(await complete(id)); assert.equal(typeof generation,"string");
  await assert.rejects(access.readCoreProbe(oldAuth,classifyServerEvent("core-read"),"h016-probe"),/F2_CORE_DENIED/);
  const fresh=await access.establish(await auth());
  assert.notEqual(fresh.sessionId,old.sessionId);
  assert.equal((await access.readCoreProbe(await auth(fresh.sessionId),classifyServerEvent("core-read"),"h016-probe"))?.publicValue,"public");
  const persisted=(await admin`select a.actor_id::text actor_id,a.auth_subject::text subject,
    r.auth_state,r.completed_at is not null completed,r.access_generation::text generation,
    (select count(*)::int from crm_private.crm_sessions) sessions from crm_private.access_recoveries r
    join crm_private.crm_actors a on a.actor_id=r.actor_id where r.recovery_id=${id}::uuid`)[0]!;
  assert.deepEqual({...persisted},{actor_id:actorId,subject,auth_state:"revoked",completed:true,generation,sessions:2});
});

test("H0-016 I01 invalid/unverified email and owner cannot open recovery",async()=>{
  for(const claims of [
    {emailPreviouslyVerified:false},{linkConsumed:false},
    {kind:"break_glass" as const,ownerIndependent:false},
  ]){
    const kind=claims.kind??"password";
    await assert.rejects(start(kind,claims),/RECOVERY_START_DENIED/);
  }
  const before=(await admin`select access_generation::text generation from crm_private.crm_actors`)[0]!.generation;
  await assert.rejects(recovery().begin({kind:"password",subject,emailPreviouslyVerified:true,linkConsumed:true,ownerIndependent:false}),/RECOVERY_START_DENIED/);
  const after=(await admin`select access_generation::text generation from crm_private.crm_actors`)[0]!.generation;
  assert.equal(after,before);
});

test("H0-016 I02/I05 D031 requires new factor and verified new paper copy",async()=>{
  const previous=await access.establish(await auth());
  const oldAuth=await auth(previous.sessionId);
  const id=randomUUID();
  assert.deepEqual(await recovery().begin(await start("break_glass"),id),
    {status:"pending",recoveryId:id,auth:"revoked"});
  await assert.rejects(recovery().complete(await complete(id)),/RECOVERY_COMPLETION_DENIED/);
  await assert.rejects(recovery().complete(await complete(id,{newFactorEnrolled:true})),/RECOVERY_COMPLETION_DENIED/);
  await assert.rejects(access.readCoreProbe(oldAuth,classifyServerEvent("core-read"),"h016-probe"),/F2_CORE_DENIED/);
  const generation=await recovery().complete(await complete(id,{newFactorEnrolled:true,oldFactorRevoked:true,newPaperCopyVerified:true}));
  assert.equal(typeof generation,"string");
  await assert.rejects(access.readCoreProbe(oldAuth,classifyServerEvent("core-read"),"h016-probe"),/F2_CORE_DENIED/);
  const current=await access.establish(await auth());
  assert.equal((await access.readCoreProbe(await auth(current.sessionId),classifyServerEvent("core-read"),"h016-probe"))?.publicValue,"public");
});

test("H0-016 I02/I04/I05 D031 failure is partial; new factor and paper required",async()=>{
  const id=randomUUID(); const result=await recovery("failed").begin(await start("break_glass"),id);
  assert.deepEqual(result,{status:"partial",recoveryId:id,auth:"failed"});
  await assert.rejects(access.establish(await auth()),/F2_ESTABLISH_DENIED/);
  await assert.rejects(recovery().complete(await complete(id,{newFactorEnrolled:true,oldFactorRevoked:true,newPaperCopyVerified:true})),/RECOVERY_COMPLETION_DENIED/);
  assert.equal((await admin`select access_state from crm_private.crm_actors`)[0]?.access_state,"recovery_in_progress");
});

test("H0-016 I07/I08 duplicate attempts and direct runtime writes denied",async()=>{
  const id=(await admin`select recovery_id::text id from crm_private.access_recoveries where auth_state='failed'`)[0]!.id;
  const before=(await admin`select access_generation::text generation from crm_private.crm_actors`)[0]!.generation;
  const duplicate=await recovery().begin(await start("break_glass"),id);
  assert.equal(duplicate.status,"partial");assert.equal(duplicate.auth,"failed");
  const after=(await admin`select access_generation::text generation from crm_private.crm_actors`)[0]!.generation;
  assert.equal(after,before);
  await assert.rejects(recovery().begin(await start("break_glass"),randomUUID()),/RECOVERY_START_UNCERTAIN/);
  await assert.rejects(runtime`update crm_private.crm_actors set access_state='ready'`,/permission denied/);
  for(const role of ["crm_h0_runtime","anon","authenticated"]){
    const allowed=(await admin`select has_function_privilege(${role},
      'crm_api.complete_access_recovery(bytea,bytea,bytea)','EXECUTE') allowed`)[0]!.allowed;
    assert.equal(allowed,role==="crm_h0_runtime");
  }
  const relation=(await admin`select c.relrowsecurity,c.relforcerowsecurity,r.rolname owner
    from pg_class c join pg_roles r on r.oid=c.relowner
    where c.oid='crm_private.access_recoveries'::regclass`)[0]!;
  assert.deepEqual({...relation},{relrowsecurity:true,relforcerowsecurity:true,owner:"crm_h0_f2_owner"});
  const access=(await admin`select has_table_privilege('crm_h0_runtime',
    'crm_private.access_recoveries','SELECT,INSERT,UPDATE,DELETE') runtime_dml,
    has_table_privilege('anon','crm_private.access_recoveries','SELECT') anon_read,
    has_table_privilege('authenticated','crm_private.access_recoveries','SELECT') authenticated_read`)[0]!;
  assert.deepEqual({...access},{runtime_dml:false,anon_read:false,authenticated_read:false});
});
