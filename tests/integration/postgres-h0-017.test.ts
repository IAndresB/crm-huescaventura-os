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
const database="crm_h0_017_formal";
const port=Number(process.env.POSTGRES_H017_PORT??55429);
const actorId=randomUUID(), subject=randomUUID(), scope="scope-h017";
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
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h017_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h017_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h017_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin);
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h017-local",generation:randomUUID(),
    allowedPurposes:["h0-005-human-bridge","h0-016-recovery"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h017-local",generation:randomUUID(),
    allowedPurposes:["full-identification","core-human-access","session-revocation"]};
  await migration`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f1.keyId},${Buffer.from(f1.key)},${f1.audience},${f1.generation},${f1.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},${f2.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`select crm_api.provision_actor_mapping(${actorId}::uuid,${subject}::uuid,${scope})`;
  await admin`insert into crm_private.access_probe(probe_id,context_scope,public_value,private_value)
    values('h017-probe',${scope},'public','private')`;
  runtime=connect("crm_h0_runtime"); access=new H0005PostgresAdapter(runtime,f1,f2);
});
after(async()=>{
  await Promise.allSettled([runtime?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started) command("pg_ctl",["-D",join(temporaryRoot,"data"),"-m","fast","-w","stop"]);
  if(temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});

// R01-R12 derive from the APPROVED sources recorded in evidence-TSK-H0-017.md.
// This suite has its own cluster, database, subjects, generation and signing keys.
test("H0-017 R01/R02/R07 password recovery denies pre-MFA and stale authority",async()=>{
  const old=await access.establish(await auth());const stale=await auth(old.sessionId);
  const before=(await admin`select access_generation::text g from crm_private.crm_actors`)[0]!.g;
  await assert.rejects(start("password",{emailPreviouslyVerified:false}),/RECOVERY_START_DENIED/);
  await assert.rejects(start("password",{linkConsumed:false}),/RECOVERY_START_DENIED/);
  const id=randomUUID();const opened=await recovery().begin(await start("password"),id);
  assert.equal(opened.auth,"revoked");
  const mid=(await admin`select access_generation::text g,access_state s from crm_private.crm_actors`)[0]!;
  assert.equal(BigInt(mid.g),BigInt(before)+1n);assert.equal(mid.s,"recovery_in_progress");
  await assert.rejects(access.readCoreProbe(stale,classifyServerEvent("core-read"),"h017-probe"),/F2_CORE_DENIED/);
  await assert.rejects(access.establish(await auth(undefined,true,false)),/F2_FULL_IDENTIFICATION_REQUIRED/);
  await assert.rejects(complete(id,{totpVerified:false}),/RECOVERY_COMPLETION_DENIED/);
  await recovery().complete(await complete(id));
  await assert.rejects(access.reidentify(stale),/F2_REIDENTIFY_DENIED/);
  const fresh=await access.establish(await auth());assert.notEqual(fresh.epochId,old.epochId);
  assert.equal((await access.readCoreProbe(await auth(fresh.sessionId),classifyServerEvent("core-read"),"h017-probe"))?.publicValue,"public");
});

test("H0-017 R11 recovered access retains independent 7/30 server limits",async()=>{
  const inactive=await access.establish(await auth());
  await admin`update crm_private.identification_epochs set
    identified_at=clock_timestamp()-interval '8 days',
    last_human_activity_at=clock_timestamp()-interval '8 days'
    where epoch_id=${inactive.epochId}::uuid`;
  await assert.rejects(access.readCoreProbe(await auth(inactive.sessionId),
    classifyServerEvent("core-read"),"h017-probe"),/F2_CORE_DENIED/);
  const absolute=await access.establish(await auth());
  await admin`update crm_private.identification_epochs set
    identified_at=clock_timestamp()-interval '31 days',
    last_human_activity_at=clock_timestamp()
    where epoch_id=${absolute.epochId}::uuid`;
  await assert.rejects(access.readCoreProbe(await auth(absolute.sessionId),
    classifyServerEvent("core-read"),"h017-probe"),/F2_CORE_DENIED/);
});

test("H0-017 R04/R05 owner independence and factor replacement are mandatory",async()=>{
  await assert.rejects(start("break_glass",{ownerIndependent:false}),/RECOVERY_START_DENIED/);
  const stale=await access.establish(await auth());const oldAuth=await auth(stale.sessionId);
  const id=randomUUID();await recovery().begin(await start("break_glass"),id);
  for(const missing of [
    {newFactorEnrolled:false,oldFactorRevoked:true,newPaperCopyVerified:true},
    {newFactorEnrolled:true,oldFactorRevoked:false,newPaperCopyVerified:true},
    {newFactorEnrolled:true,oldFactorRevoked:true,newPaperCopyVerified:false},
  ]) await assert.rejects(recovery().complete(await complete(id,missing)),/RECOVERY_COMPLETION_DENIED/);
  const during=(await admin`select access_state from crm_private.crm_actors`)[0]!.access_state;
  assert.equal(during,"recovery_in_progress");
  await recovery().complete(await complete(id,{newFactorEnrolled:true,oldFactorRevoked:true,newPaperCopyVerified:true}));
  const incident=(await admin`select recovery_kind,auth_state,password_ready,totp_verified,
    new_factor_enrolled,old_factor_revoked,new_paper_copy_verified,completed_at is not null completed
    from crm_private.access_recoveries where recovery_id=${id}::uuid`)[0]!;
  assert.deepEqual({...incident},{recovery_kind:"break_glass",auth_state:"revoked",
    password_ready:true,totp_verified:true,new_factor_enrolled:true,old_factor_revoked:true,
    new_paper_copy_verified:true,completed:true});
  await assert.rejects(access.readCoreProbe(oldAuth,classifyServerEvent("core-read"),"h017-probe"),/F2_CORE_DENIED/);
  assert.equal((await admin`select count(*)::int n from crm_private.crm_actors`)[0]!.n,1);
});

test("H0-017 R08 concurrent starts allow one generation and one incident",async()=>{
  const before=(await admin`select access_generation::text g from crm_private.crm_actors`)[0]!.g;
  const a=randomUUID(),b=randomUUID();
  const results=await Promise.allSettled([
    recovery().begin(await start("password"),a),recovery().begin(await start("password"),b),
  ]);
  assert.equal(results.filter((r)=>r.status==="fulfilled").length,1);
  assert.equal(results.filter((r)=>r.status==="rejected").length,1);
  const after=(await admin`select access_generation::text g from crm_private.crm_actors`)[0]!.g;
  assert.equal(BigInt(after),BigInt(before)+1n);
  const ids=(await admin`select recovery_id::text id from crm_private.access_recoveries
    where recovery_id in (${a}::uuid,${b}::uuid)`);
  assert.equal(ids.length,1);
  const winner=ids[0]!.id;
  const duplicate=await recovery().begin(await start("password"),winner);
  assert.equal(duplicate.status,"partial");
  assert.equal((await admin`select access_generation::text g from crm_private.crm_actors`)[0]!.g,after);
  await recovery().complete(await complete(winner));
});

test("H0-017 R06/R09 provider uncertainty preserves denial and SQL boundary",async()=>{
  const id=randomUUID();
  const result=await recovery("uncertain").begin(await start("break_glass"),id);
  assert.deepEqual(result,{status:"partial",recoveryId:id,auth:"uncertain"});
  await assert.rejects(recovery().complete(await complete(id,{newFactorEnrolled:true,
    oldFactorRevoked:true,newPaperCopyVerified:true})),/RECOVERY_COMPLETION_DENIED/);
  await assert.rejects(access.establish(await auth()),/F2_ESTABLISH_DENIED/);
  await assert.rejects(runtime`update crm_private.access_recoveries set auth_state='revoked'`,/permission denied/);
  const obj=(await admin`select c.relrowsecurity,c.relforcerowsecurity,r.rolname owner
    from pg_class c join pg_roles r on r.oid=c.relowner
    where c.oid='crm_private.access_recoveries'::regclass`)[0]!;
  assert.deepEqual({...obj},{relrowsecurity:true,relforcerowsecurity:true,owner:"crm_h0_f2_owner"});
  for(const role of ["anon","authenticated"]){
    assert.equal((await admin`select has_function_privilege(${role},
      'crm_api.complete_access_recovery(bytea,bytea,bytea)','EXECUTE') ok`)[0]!.ok,false);
  }
});

test("H0-017 R10 forward migration preserves previous actor, session and epoch",async()=>{
  const db="crm_h0_017_upgrade";
  await admin.unsafe(`create database ${db} owner crm_h0_migration`);
  const oldAdmin=connect("h017_bootstrap",db),oldMigration=connect("crm_h0_migration",db);
  try {
    await applyChain(oldMigration,oldAdmin,"20260928223934_h0_m05_global_access_revocation.sql");
    const historicalActor=randomUUID(),historicalSubject=randomUUID();
    const historicalSession=randomUUID(),historicalEpoch=randomUUID();
    await oldAdmin`insert into crm_private.crm_actors(actor_id,auth_subject,admin_scope,enabled)
      values(${historicalActor}::uuid,${historicalSubject}::uuid,'historical-scope',true)`;
    await oldAdmin`insert into crm_private.crm_sessions(session_id,actor_id,auth_subject,access_generation,created_at)
      values(${historicalSession}::uuid,${historicalActor}::uuid,${historicalSubject}::uuid,1,clock_timestamp())`;
    await oldAdmin`insert into crm_private.identification_epochs(epoch_id,session_id,identified_at,
      last_human_activity_at,full_password,full_mfa,access_state,current_epoch)
      values(${historicalEpoch}::uuid,${historicalSession}::uuid,clock_timestamp(),clock_timestamp(),
      true,true,'ready',true)`;
    await oldMigration.unsafe(await readFile(join(migrations,
      "20260929000000_h0_m06_access_recovery.sql"),"utf8"));
    const persisted=(await oldAdmin`select a.actor_id::text actor_id,a.auth_subject::text subject,
      s.session_id::text session_id,e.epoch_id::text epoch_id,
      a.access_generation::text generation,a.access_state,
      (select count(*)::int from crm_private.access_recoveries) recoveries
      from crm_private.crm_actors a join crm_private.crm_sessions s on s.actor_id=a.actor_id
      join crm_private.identification_epochs e on e.session_id=s.session_id`)[0]!;
    assert.deepEqual({...persisted},{actor_id:historicalActor,subject:historicalSubject,
      session_id:historicalSession,epoch_id:historicalEpoch,generation:"1",
      access_state:"ready",recoveries:0});
  } finally {
    await Promise.allSettled([oldMigration.end({timeout:1}),oldAdmin.end({timeout:1})]);
  }
});
