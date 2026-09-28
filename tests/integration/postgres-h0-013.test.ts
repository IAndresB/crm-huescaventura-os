import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import postgres from "postgres";
import type { AuthGlobalRevocationOutcome } from "../../src/application/global-access-revocation.ts";
import { verifyAuth, type VerifiedAuthEvidence } from "../../src/application/verified-auth.ts";
import { classifyServerEvent } from "../../src/application/verified-interaction.ts";
import { H0005PostgresAdapter } from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import { H0013GlobalAccessRevocationAdapter } from "../../src/infrastructure/postgres/h0-013-adapter.ts";
import type { F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";
import type { F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";

const bin = process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root = resolve(import.meta.dirname,"../..");
const migrations = join(root,"supabase/migrations");
const migrationName = "20260928223934_h0_m05_global_access_revocation.sql";
const database = "crm_h0_013_test";
const port = Number(process.env.POSTGRES_H013_PORT ?? 55425);
const actorId = randomUUID();
const subject = randomUUID();
const scope = "scope-h013-synthetic";
let temporaryRoot = "";
let socket = "";
let started = false;
let admin: postgres.Sql;
let migration: postgres.Sql;
let runtime: postgres.Sql;
let f1: F1SigningConfiguration;
let f2: F2SigningConfiguration;
let access: H0005PostgresAdapter;
let providerOutcome: AuthGlobalRevocationOutcome = "revoked";
let providerThrows = false;
let providerCalls = 0;
let providerHook: (() => Promise<void>) | undefined;
let revocation: H0013GlobalAccessRevocationAdapter;

function command(name: string,args: readonly string[]): void {
  const result=spawnSync(join(bin!,name),args,{encoding:"utf8",env:{...process.env,LC_ALL:"C"}});
  assert.equal(result.status,0,`${name} failed: ${result.stderr}`);
}

function connect(user: string,db=database) {
  return postgres({host:socket,port,database:db,user,max:1,prepare:false,connect_timeout:3,onnotice:()=>{}});
}

async function applyChain(target: postgres.Sql, bootstrap: postgres.Sql, until?: string) {
  const files=(await readdir(migrations)).filter((name)=>name.endsWith(".sql")
    && name!=="202609150000_h0_m01_roles.sql" && (until===undefined || name<=until)).sort();
  for (const file of files) {
    if (file.endsWith("_authorities.sql")) {
      const exists=(await bootstrap`select exists(select 1 from pg_roles where rolname='crm_h0_ha_tx') as present`)[0]?.present;
      if (!exists) await bootstrap.unsafe(await readFile(join(migrations,file),"utf8"));
      continue;
    }
    await target.unsafe(await readFile(join(migrations,file),"utf8"));
  }
}

async function evidence(sessionId?: string): Promise<VerifiedAuthEvidence> {
  return verifyAuth({verify:async()=>({subject,...(sessionId?{sessionId}:{}),
    passwordVerified:true,mfaVerified:true})},randomUUID());
}

async function establish(): Promise<{sessionId:string;auth:VerifiedAuthEvidence}> {
  const created=await access.establish(await evidence());
  return {sessionId:created.sessionId,auth:await evidence(created.sessionId)};
}

before(async()=>{
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h0-013-"));
  socket=join(temporaryRoot,"socket");
  await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h013_bootstrap",
    "--auth-local=trust","--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);
  started=true;
  admin=connect("h013_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();
  admin=connect("h013_bootstrap");
  migration=connect("crm_h0_migration");
  await applyChain(migration,admin);
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h013-local",generation:randomUUID(),
    allowedPurposes:["h0-005-human-bridge","h0-013-auth-revocation"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h013-local",generation:randomUUID(),
    allowedPurposes:["full-identification","core-human-access","session-revocation"]};
  await migration`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f1.keyId},${Buffer.from(f1.key)},${f1.audience},${f1.generation},${f1.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},${f2.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`select crm_api.provision_actor_mapping(${actorId}::uuid,${subject}::uuid,${scope})`;
  await admin`insert into crm_private.access_probe(probe_id,context_scope,public_value,private_value)
    values('h013-probe',${scope},'public','private')`;
  runtime=connect("crm_h0_runtime");
  access=new H0005PostgresAdapter(runtime,f1,f2);
  revocation=new H0013GlobalAccessRevocationAdapter(runtime,f1,f2,{
    revokeAllSessions:async()=>{
      providerCalls+=1;
      if (providerHook) await providerHook();
      if (providerThrows) throw new Error("synthetic provider uncertainty");
      return providerOutcome;
    },
  });
});

after(async()=>{
  await Promise.allSettled([runtime?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started) command("pg_ctl",["-D",join(temporaryRoot,"data"),"-m","fast","-w","stop"]);
  if(temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});

test("H0-013 completes Core and Auth revocation without preserving emitter authority",async()=>{
  const a=await establish();
  const b=await establish();
  assert.equal((await access.readCoreProbe(a.auth,classifyServerEvent("core-read"),"h013-probe"))?.publicValue,"public");
  providerOutcome="revoked"; providerThrows=false; providerHook=undefined;
  const before=providerCalls;
  const result=await revocation.revokeAll(a.auth,randomUUID());
  assert.equal(result.status,"completed");
  assert.equal(result.auth,"revoked");
  assert.equal(providerCalls,before+1);
  for (const old of [a.auth,b.auth]) {
    await assert.rejects(access.readCoreProbe(old,classifyServerEvent("core-read"),"h013-probe"),/F2_CORE_DENIED/);
  }
  const row=(await admin`select access_generation::text,auth_state,auth_attempt_count,
    core_revoked_at is not null as core_time,auth_revoked_at is not null as auth_time
    from crm_private.global_access_revocations where revocation_id=${result.revocationId}::uuid`)[0]!;
  assert.deepEqual({...row},{access_generation:result.accessGeneration,auth_state:"revoked",
    auth_attempt_count:1,core_time:true,auth_time:true});
});

test("H0-013 keeps Core closed and reports known Auth failure explicitly",async()=>{
  const current=await establish();
  providerOutcome="failed"; providerThrows=false; providerHook=undefined;
  const result=await revocation.revokeAll(current.auth,randomUUID());
  assert.deepEqual({status:result.status,auth:result.auth},{status:"partial",auth:"failed"});
  await assert.rejects(access.readCoreProbe(current.auth,classifyServerEvent("core-read"),"h013-probe"),/F2_CORE_DENIED/);
  assert.equal((await admin`select auth_state from crm_private.global_access_revocations
    where revocation_id=${result.revocationId}::uuid`)[0]?.auth_state,"failed");
});

test("H0-013 records provider uncertainty without fictitious success",async()=>{
  const current=await establish();
  providerOutcome="revoked"; providerThrows=true; providerHook=undefined;
  const result=await revocation.revokeAll(current.auth,randomUUID());
  assert.deepEqual({status:result.status,auth:result.auth},{status:"partial",auth:"uncertain"});
  assert.equal((await admin`select auth_state from crm_private.global_access_revocations
    where revocation_id=${result.revocationId}::uuid`)[0]?.auth_state,"uncertain");
  await assert.rejects(access.reidentify(current.auth),/F2_REIDENTIFY_DENIED/);
});

test("H0-013 returns pending if post-provider persistence fails and does not reopen Core",async()=>{
  const current=await establish();
  providerOutcome="revoked"; providerThrows=false;
  providerHook=async()=>{
    await admin.unsafe(`create function public.fail_h013_auth_result() returns trigger language plpgsql as $$
      begin raise exception 'SYNTHETIC_H013_AUTH_RESULT_FAILURE'; end $$;
      create trigger fail_h013_auth_result before insert on crm_private.global_access_revocation_attempts
      for each row execute function public.fail_h013_auth_result()`);
  };
  const result=await revocation.revokeAll(current.auth,randomUUID());
  assert.deepEqual({status:result.status,auth:result.auth},{status:"partial",auth:"pending"});
  assert.equal((await admin`select auth_state,auth_attempt_count from crm_private.global_access_revocations
    where revocation_id=${result.revocationId}::uuid`)[0]?.auth_state,"pending");
  await assert.rejects(access.readCoreProbe(current.auth,classifyServerEvent("core-read"),"h013-probe"),/F2_CORE_DENIED/);
  await admin.unsafe("drop trigger fail_h013_auth_result on crm_private.global_access_revocation_attempts; drop function public.fail_h013_auth_result()");
  providerHook=undefined;
});

test("H0-013 does not contact Auth when the Core revocation unit is denied",async()=>{
  const current=await establish();
  const before=providerCalls;
  await admin`update crm_private.crm_actors set access_generation=9223372036854775807 where actor_id=${actorId}::uuid`;
  await admin`update crm_private.crm_sessions set access_generation=9223372036854775807 where session_id=${current.sessionId}::uuid`;
  await assert.rejects(revocation.revokeAll(current.auth,randomUUID()),/H0_013_REVOCATION_DENIED/);
  assert.equal(providerCalls,before);
  assert.equal((await admin`select count(*)::int as n from crm_private.global_access_revocations
    where initiating_session_id=${current.sessionId}::uuid`)[0]?.n,0);
  await admin`update crm_private.crm_actors set access_generation=100 where actor_id=${actorId}::uuid`;
});

test("H0-M05 is forward-only, atomic, preserves predecessor fixtures and restores ACL",async()=>{
  const alternate="crm_h0_013_upgrade";
  await admin.unsafe(`create database ${alternate} owner crm_h0_migration`);
  const upgrade=connect("crm_h0_migration",alternate);
  const ordinary=connect("crm_h0_runtime",alternate);
  const superuser=connect("h013_bootstrap",alternate);
  try {
    await applyChain(upgrade,superuser,"20260928193111_h0_m04_tte_boundary.sql");
    const fixture=randomUUID();
    await upgrade`select crm_api.provision_actor_mapping(${fixture}::uuid,${randomUUID()}::uuid,'preserved-h013')`;
    const source=await readFile(join(migrations,migrationName),"utf8");
    await assert.rejects(ordinary.unsafe(source),(error:unknown)=>(error as {code?:string}).code==="42501");
    await ordinary.unsafe("rollback");
    await superuser.unsafe(`create function public.fail_h013_ddl() returns event_trigger language plpgsql as $$
      begin raise exception 'SYNTHETIC_H013_DDL_FAILURE'; end $$;
      create event trigger fail_h013_ddl on ddl_command_end when tag in ('CREATE TABLE')
      execute function public.fail_h013_ddl()`);
    await assert.rejects(upgrade.unsafe(source));
    await upgrade.unsafe("rollback");
    assert.equal((await superuser`select to_regclass('crm_private.global_access_revocations') is null as absent`)[0]?.absent,true);
    assert.equal((await superuser`select count(*)::int as n from crm_private.crm_actors where actor_id=${fixture}::uuid`)[0]?.n,1);
    await superuser.unsafe("drop event trigger fail_h013_ddl; drop function public.fail_h013_ddl()");
    await upgrade.unsafe(source);
    const acl=(await superuser`select
      relrowsecurity as rls,relforcerowsecurity as force_rls,
      not has_table_privilege('crm_h0_runtime',c.oid,'select') as runtime_denied,
      not has_table_privilege('public',c.oid,'select') as public_denied
      from pg_class c where c.oid='crm_private.global_access_revocations'::regclass`)[0]!;
    assert.deepEqual({...acl},{rls:true,force_rls:true,runtime_denied:true,public_denied:true});
  } finally {
    await Promise.allSettled([upgrade.end({timeout:1}),ordinary.end({timeout:1}),superuser.end({timeout:1})]);
  }
});
