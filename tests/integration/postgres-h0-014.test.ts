import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import postgres from "postgres";
import type { AuthGlobalRevocationOutcome } from "../../src/application/global-access-revocation.ts";
import { verifyAuth, type VerifiedAuthEvidence } from "../../src/application/verified-auth.ts";
import { classifyServerEvent } from "../../src/application/verified-interaction.ts";
import { H0005PostgresAdapter } from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import { H0013GlobalAccessRevocationAdapter } from "../../src/infrastructure/postgres/h0-013-adapter.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";
import type { F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";
import { issueTrustedContext } from "../../src/application/trusted-context.ts";
import { postgresF1Binding } from "../../src/infrastructure/postgres/transaction.ts";

// Expected R01-R23 is fixed in evidence-TSK-H0-014.md before this file's
// assertions. Product output is never used as the normative oracle here.
const bin=process.env.POSTGRES_H0_BIN;
if(!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const migrationName="20260928223934_h0_m05_global_access_revocation.sql";
const database="crm_h0_014_independent";
const port=Number(process.env.POSTGRES_H014_PORT ?? 55426);
const actorId=randomUUID();
const subject=randomUUID();
const scope="scope-h014-independent";
let temporaryRoot=""; let socket=""; let started=false;
let admin:postgres.Sql; let migration:postgres.Sql; let runtimeA:postgres.Sql; let runtimeB:postgres.Sql;
let blocker:postgres.Sql; let ha:postgres.Sql;
let f1:F1SigningConfiguration; let f2:F2SigningConfiguration;
let accessA:H0005PostgresAdapter; let accessB:H0005PostgresAdapter;

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
async function evidence(sessionId?:string,passwordVerified=true,mfaVerified=true):Promise<VerifiedAuthEvidence>{
  return verifyAuth({verify:async()=>({subject,...(sessionId?{sessionId}:{}),passwordVerified,mfaVerified})},randomUUID());
}
async function establish(target=accessA){
  const created=await target.establish(await evidence());
  return {sessionId:created.sessionId,epochId:created.epochId,auth:await evidence(created.sessionId)};
}
function coordinator(sql:postgres.Sql,outcome:()=>Promise<AuthGlobalRevocationOutcome>){
  return new H0013GlobalAccessRevocationAdapter(sql,f1,f2,{revokeAllSessions:outcome});
}
async function lockTable(table:string){
  let ready!:()=>void; let release!:()=>void;
  const readyPromise=new Promise<void>((resolve)=>{ready=resolve;});
  const releasePromise=new Promise<void>((resolve)=>{release=resolve;});
  const task=blocker.begin(async(tx)=>{
    await tx.unsafe(`lock table ${table} in access exclusive mode`);
    ready(); await releasePromise;
  });
  await readyPromise;
  return async()=>{release(); await task;};
}
async function waitForBlocked(fragment:string){
  for(let index=0;index<200;index+=1){
    const row=(await admin`select exists(select 1 from pg_stat_activity
      where datname=current_database() and wait_event_type='Lock' and query like ${`%${fragment}%`}) blocked`)[0];
    if(row?.blocked===true) return;
    await delay(20);
  }
  assert.fail(`real lock wait not observed for ${fragment}`);
}

before(async()=>{
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h0-014-")); socket=join(temporaryRoot,"socket");
  await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h014_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]); started=true;
  admin=connect("h014_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end(); admin=connect("h014_bootstrap"); migration=connect("crm_h0_migration");
  await applyChain(migration,admin);
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h014-local",generation:randomUUID(),
    allowedPurposes:["h0-005-human-bridge","h0-013-auth-revocation"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h014-local",generation:randomUUID(),
    allowedPurposes:["full-identification","core-human-access","session-revocation"]};
  await migration`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f1.keyId},${Buffer.from(f1.key)},${f1.audience},${f1.generation},${f1.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},${f2.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`select crm_api.provision_actor_mapping(${actorId}::uuid,${subject}::uuid,${scope})`;
  await admin`insert into crm_private.access_probe(probe_id,context_scope,public_value,private_value)
    values('h014-probe',${scope},'public','private')`;
  runtimeA=connect("crm_h0_runtime"); runtimeB=connect("crm_h0_runtime"); blocker=connect("h014_bootstrap");
  ha=connect("crm_h0_ha_tx");
  accessA=new H0005PostgresAdapter(runtimeA,f1,f2); accessB=new H0005PostgresAdapter(runtimeB,f1,f2);
});
after(async()=>{
  await Promise.allSettled([runtimeA?.end({timeout:1}),runtimeB?.end({timeout:1}),blocker?.end({timeout:1}),
    ha?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started) command("pg_ctl",["-D",join(temporaryRoot,"data"),"-m","fast","-w","stop"]);
  if(temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});

test("H0-014 R01-R04/R13/R16/R18: global closure is durable, includes emitter and permits only new identification",async()=>{
  const a=await establish(); const b=await establish(); let authCalls=0;
  const close=coordinator(runtimeA,async()=>{authCalls+=1;return "revoked";});
  const before=BigInt((await admin`select access_generation::text g from crm_private.crm_actors`)[0]!.g as string);
  const result=await close.revokeAll(a.auth,randomUUID());
  assert.equal(result.status,"completed"); assert.equal(authCalls,1);
  assert.equal(BigInt(result.accessGeneration),before+1n);
  for(const old of [a.auth,b.auth]){
    await assert.rejects(accessB.readCoreProbe(old,classifyServerEvent("core-read"),"h014-probe"),/F2_CORE_DENIED/);
    await assert.rejects(accessB.reidentify(old),/F2_REIDENTIFY_DENIED/);
  }
  const durable=(await admin`select r.auth_state,r.previous_access_generation::text previous,
    r.access_generation::text current,r.core_revoked_at<=r.auth_revoked_at ordered,
    (select count(*)::int from crm_private.global_access_revocation_attempts a
      where a.revocation_id=r.revocation_id) attempts
    from crm_private.global_access_revocations r where r.revocation_id=${result.revocationId}::uuid`)[0]!;
  assert.deepEqual({...durable},{auth_state:"revoked",previous:before.toString(),
    current:(before+1n).toString(),ordered:true,attempts:1});
  const fresh=await establish();
  assert.equal((await accessA.readCoreProbe(fresh.auth,classifyServerEvent("core-read"),"h014-probe"))?.publicValue,"public");
  assert.equal((await admin`select count(*)::int n from crm_private.identification_epochs
    where session_id in (${a.sessionId}::uuid,${b.sessionId}::uuid) and current_epoch`)[0]?.n,2,
    "historical epochs remain stored but cannot regain authority");
});

test("H0-014 R05-R08: every partial Auth outcome leaves Core denied and never reports success",async()=>{
  for(const scenario of ["failed","uncertain","throw"] as const){
    const current=await establish(); let calls=0;
    const close=coordinator(runtimeA,async()=>{
      calls+=1;
      if(scenario==="throw") throw new Error("synthetic unknown provider outcome");
      return scenario;
    });
    const result=await close.revokeAll(current.auth,randomUUID());
    assert.equal(result.status,"partial"); assert.equal(calls,1);
    assert.equal(result.auth,scenario==="throw"?"uncertain":scenario);
    await assert.rejects(accessA.readCoreProbe(current.auth,classifyServerEvent("core-read"),"h014-probe"),/F2_CORE_DENIED/);
    assert.equal((await admin`select auth_state from crm_private.global_access_revocations
      where revocation_id=${result.revocationId}::uuid`)[0]?.auth_state,result.auth);
  }
  const postProvider=await establish();
  const postProviderResult=await coordinator(runtimeA,async()=>{
    await admin.unsafe(`create function public.fail_h014_auth_result() returns trigger language plpgsql as $$
      begin raise exception 'SYNTHETIC_H014_AUTH_RESULT_FAILURE'; end $$;
      create trigger fail_h014_auth_result before insert on crm_private.global_access_revocation_attempts
      for each row execute function public.fail_h014_auth_result()`);
    return "revoked";
  }).revokeAll(postProvider.auth,randomUUID());
  assert.deepEqual({status:postProviderResult.status,auth:postProviderResult.auth},
    {status:"partial",auth:"pending"});
  assert.equal((await admin`select auth_state from crm_private.global_access_revocations
    where revocation_id=${postProviderResult.revocationId}::uuid`)[0]?.auth_state,"pending");
  await assert.rejects(accessA.readCoreProbe(postProvider.auth,classifyServerEvent("core-read"),"h014-probe"),/F2_CORE_DENIED/);
  await admin.unsafe("drop trigger fail_h014_auth_result on crm_private.global_access_revocation_attempts; drop function public.fail_h014_auth_result()");

  const current=await establish(); let called=false;
  await admin`update crm_private.crm_actors set enabled=false where actor_id=${actorId}::uuid`;
  await assert.rejects(coordinator(runtimeA,async()=>{called=true;return "revoked";})
    .revokeAll(current.auth,randomUUID()),/H0_013_REVOCATION_DENIED/);
  assert.equal(called,false);
  await admin`update crm_private.crm_actors set enabled=true where actor_id=${actorId}::uuid`;

  const rollback=await establish();
  const generationBefore=(await admin`select access_generation::text g from crm_private.crm_actors`)[0]!.g;
  await admin.unsafe(`create function public.fail_h014_core_record() returns trigger language plpgsql as $$
    begin raise exception 'SYNTHETIC_H014_CORE_RECORD_FAILURE'; end $$;
    create trigger fail_h014_core_record before insert on crm_private.global_access_revocations
    for each row execute function public.fail_h014_core_record()`);
  await assert.rejects(coordinator(runtimeA,async()=>{called=true;return "revoked";})
    .revokeAll(rollback.auth,randomUUID()),/H0_013_REVOCATION_DENIED/);
  assert.equal(called,false);
  assert.equal((await admin`select access_generation::text g from crm_private.crm_actors`)[0]?.g,generationBefore);
  await admin.unsafe("drop trigger fail_h014_core_record on crm_private.global_access_revocations; drop function public.fail_h014_core_record()");
});

test("H0-014 R09: concurrent global closures serialize and coordinate Auth once",async()=>{
  const a=await establish(); const b=await establish(); let calls=0;
  const outcome=async()=>{calls+=1;return "revoked" as const;};
  const before=BigInt((await admin`select access_generation::text g from crm_private.crm_actors`)[0]!.g as string);
  const results=await Promise.allSettled([
    coordinator(runtimeA,outcome).revokeAll(a.auth,randomUUID()),
    coordinator(runtimeB,outcome).revokeAll(b.auth,randomUUID()),
  ]);
  assert.equal(results.filter((entry)=>entry.status==="fulfilled").length,1);
  assert.equal(results.filter((entry)=>entry.status==="rejected").length,1);
  assert.equal(calls,1);
  assert.equal((await admin`select access_generation::text g from crm_private.crm_actors`)[0]?.g,(before+1n).toString());
});

test("H0-014 R10: an already-authorized Core operation may finish before later revocation",async()=>{
  const current=await establish();
  const release=await lockTable("crm_private.access_probe");
  const read=accessA.readCoreProbe(current.auth,classifyServerEvent("core-read"),"h014-probe")
    .then((value)=>({status:"allowed" as const,value}),
      (error:unknown)=>({status:"denied" as const,error}));
  await waitForBlocked("human_read_probe");
  const closing=coordinator(runtimeB,async()=>"revoked").revokeAll(current.auth,randomUUID());
  await waitForBlocked("start_global_access_revocation");
  await release();
  const readResult=await read;
  assert.equal(readResult.status,"allowed");
  assert.equal((readResult as {value:{publicValue:string}|undefined}).value?.publicValue,"public");
  assert.equal((await closing).status,"completed");
  await assert.rejects(accessA.readCoreProbe(current.auth,classifyServerEvent("core-read"),"h014-probe"),/F2_CORE_DENIED/);
});

test("H0-014 R11: revocation that holds actor first defeats an in-flight old Core request",async()=>{
  const current=await establish();
  const release=await lockTable("crm_private.global_access_revocations");
  const closing=coordinator(runtimeB,async()=>"revoked").revokeAll(current.auth,randomUUID());
  await waitForBlocked("start_global_access_revocation");
  const read=accessA.readCoreProbe(current.auth,classifyServerEvent("core-read"),"h014-probe")
    .then((value)=>({status:"allowed" as const,value}),
      (error:unknown)=>({status:"denied" as const,error}));
  await waitForBlocked("human_read_probe");
  await release();
  assert.equal((await closing).status,"completed");
  const readResult=await read;
  assert.equal(readResult.status,"denied");
  assert.match(String((readResult as {error:unknown}).error),/F2_CORE_DENIED/);
});

test("H0-014 R12/R14/R15: revoked, disabled, stale and non-human routes cannot revive activity",async()=>{
  const current=await establish();
  const before=(await admin`select last_human_activity_at::text activity from crm_private.identification_epochs
    where session_id=${current.sessionId}::uuid and current_epoch`)[0]!.activity;
  await coordinator(runtimeA,async()=>"revoked").revokeAll(current.auth,randomUUID());
  for(const event of ["token-refresh","polling","background-job","passive"] as const){
    await assert.rejects(accessA.readCoreProbe(current.auth,classifyServerEvent(event),"h014-probe"));
  }
  assert.equal((await admin`select last_human_activity_at::text activity from crm_private.identification_epochs
    where session_id=${current.sessionId}::uuid and current_epoch`)[0]?.activity,before);
  const next=await establish();
  await migration`select crm_api.set_actor_enabled(${actorId}::uuid,false,'ready')`;
  await migration`select crm_api.set_actor_enabled(${actorId}::uuid,true,'ready')`;
  await assert.rejects(accessA.readCoreProbe(next.auth,classifyServerEvent("core-read"),"h014-probe"),/F2_CORE_DENIED/);
});

test("H0-014 R17/R20/R21: ACL, capability binding and TTE partition deny indirect authority",async()=>{
  for(const statement of [
    "select * from crm_private.global_access_revocations",
    "insert into crm_private.global_access_revocations(revocation_id,actor_id,auth_subject,initiating_session_id,previous_access_generation,access_generation,admin_scope,core_revoked_at) values('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000004',1,2,'x',clock_timestamp())",
    "set role crm_h0_f2_executor",
  ]){
    await assert.rejects(runtimeA.unsafe(statement),(error:unknown)=>["42501","42P01"].includes((error as {code?:string}).code??""));
    await runtimeA.unsafe("rollback");
  }
  await assert.rejects(runtimeA`select crm_api.record_global_auth_revocation_outcome(''::bytea,''::bytea,''::bytea)`,
    (error:unknown)=>(error as {code?:string}).code==="42501");
  const target={resource:"global_access_revocation" as const,action:"record_auth_outcome" as const};
  const context=issueTrustedContext({identityId:"h014-independent",identityKind:"technical",
    purpose:"h0-013-auth-revocation",scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
  const input=encodeF1Fields(["CRM-H0-M05-AUTH1","C03",randomUUID(),randomUUID(),"failed"]);
  let capability:{payload:Buffer;mac:Buffer}|undefined;
  await runtimeA.begin(async(tx)=>{capability=createF1Issuer(f1)(context,await postgresF1Binding(tx),"C03",input,target);});
  await assert.rejects(runtimeA`select crm_api.record_global_auth_revocation_outcome(
    ${capability!.payload},${capability!.mac},${input})`,(error:unknown)=>(error as {code?:string}).code==="42501");
  assert.equal((await admin`select has_function_privilege('public',
    'crm_api.start_global_access_revocation(bytea,bytea,bytea)','execute') allowed`)[0]?.allowed,false);
  const catalog=(await admin`select
    (select rolname from pg_roles where oid=c.relowner) table_owner,
    c.relrowsecurity as rls,c.relforcerowsecurity as force_rls,
    not has_table_privilege('anon',c.oid,'select') as anon_denied,
    not has_table_privilege('authenticated',c.oid,'select') as authenticated_denied,
    (select count(*)::int from pg_proc where pronamespace='crm_api'::regnamespace
      and proname='start_global_access_revocation') overloads,
    (select rolname from pg_roles where oid=p.proowner) function_owner,
    p.prosecdef as security_definer,p.proconfig @> array['search_path=pg_catalog, pg_temp'] as fixed_path
    from pg_class c cross join pg_proc p
    where c.oid='crm_private.global_access_revocations'::regclass
      and p.oid='crm_api.start_global_access_revocation(bytea,bytea,bytea)'::regprocedure`)[0]!;
  assert.deepEqual({...catalog},{table_owner:"crm_h0_f2_owner",rls:true,force_rls:true,
    anon_denied:true,authenticated_denied:true,overloads:1,function_owner:"crm_h0_f2_executor",
    security_definer:true,fixed_path:true});
  assert.equal((await admin`select pg_has_role('crm_h0_runtime','crm_h0_f2_executor','member') member`)[0]?.member,false);
  assert.equal((await admin`select has_function_privilege('crm_h0_runtime',
    'crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)','execute') allowed`)[0]?.allowed,false);
  await assert.rejects(ha`select crm_api.start_global_access_revocation(''::bytea,''::bytea,''::bytea)`,
    (error:unknown)=>(error as {code?:string}).code==="42501");
});

test("H0-014 R19: independent predecessor upgrade is atomic and preserves D039 objects",async()=>{
  const alternate="crm_h0_014_upgrade";
  await admin.unsafe(`create database ${alternate} owner crm_h0_migration`);
  const upgrade=connect("crm_h0_migration",alternate); const superuser=connect("h014_bootstrap",alternate);
  try{
    await applyChain(upgrade,superuser,"20260928193111_h0_m04_tte_boundary.sql");
    const before=(await superuser`select pg_get_functiondef(
      'crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)'::regprocedure) definition`)[0]!.definition;
    const source=await readFile(join(migrations,migrationName),"utf8");
    await superuser.unsafe(`create function public.fail_h014_ddl() returns event_trigger language plpgsql as $$
      begin raise exception 'SYNTHETIC_H014_DDL_FAILURE'; end $$;
      create event trigger fail_h014_ddl on ddl_command_end when tag in ('CREATE FUNCTION')
      execute function public.fail_h014_ddl()`);
    await assert.rejects(upgrade.unsafe(source)); await upgrade.unsafe("rollback");
    assert.equal((await superuser`select to_regclass('crm_private.global_access_revocations') is null absent`)[0]?.absent,true);
    assert.equal((await superuser`select pg_get_functiondef(
      'crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)'::regprocedure) definition`)[0]?.definition,before);
    await superuser.unsafe("drop event trigger fail_h014_ddl; drop function public.fail_h014_ddl()");
    await upgrade.unsafe(source);
    assert.equal((await superuser`select pg_get_functiondef(
      'crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)'::regprocedure) definition`)[0]?.definition,before);
  }finally{await Promise.allSettled([upgrade.end({timeout:1}),superuser.end({timeout:1})]);}
});
