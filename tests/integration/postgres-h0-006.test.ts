import {applyF06Tail} from '../support/h4-019-current-chain.ts';
import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import postgres from "postgres";
import { verifyAuth, type AuthVerificationPort } from "../../src/application/verified-auth.ts";
import { classifyServerEvent } from "../../src/application/verified-interaction.ts";
import { issueTrustedContext } from "../../src/application/trusted-context.ts";
import { createF1Issuer } from "../../src/infrastructure/postgres/f1-codec.ts";
import { H0005PostgresAdapter } from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import { postgresF1Binding } from "../../src/infrastructure/postgres/transaction.ts";
import { hardenF1 } from "./f1-fixture.ts";

// Independent normative oracle: D038.1/.2/.15/.16/.17, Plan 6.1/6.3,
// SPEC-FR-SEC-001/002 and AC-064. A revoked session retaining a valid Auth
// proof must not revoke another session. No producer assertions are reused.
// Historical chain plus the forward F01 fix; only low-level F1 bootstrap is shared.
test("H0-006 N11: revoked session cannot invoke global revocation through server F2 issuance", async (t) => {
  const bin = process.env.POSTGRES_H0_BIN;
  assert.ok(bin, "POSTGRES_H0_BIN_REQUIRED");
  const temporaryRoot = await mkdtemp(join(tmpdir(), "crm-h0-006-"));
  const data = join(temporaryRoot, "data");
  const socket = join(temporaryRoot, "socket");
  const clients: postgres.Sql[] = [];
  let started = false;
  const command = (name: string, args: string[]) => {
    const result = spawnSync(join(bin, name), args, {
      encoding: "utf8", env: { ...process.env, LC_ALL: "C" },
    });
    assert.equal(result.status, 0, `${name} failed`);
  };
  const connection = (user: string, database = "h0_006_independent") => {
    const sql = postgres({ host: socket, port: 55416, database, user,
      max: 1, prepare: false, connect_timeout: 3, idle_timeout: 2 });
    clients.push(sql);
    return sql;
  };
  const migrate = async (sql: postgres.Sql, name: string) => {
    await sql.unsafe(await readFile(new URL(`../../supabase/migrations/${name}`, import.meta.url), "utf8"));
  };
  try {
    await mkdir(socket);
    command("initdb", ["-D", data, "--username=h0_006_bootstrap", "--auth-local=trust",
      "--auth-host=scram-sha-256", "--no-locale", "--encoding=UTF8"]);
    command("pg_ctl", ["-D", data, "-l", join(temporaryRoot, "postgres.log"),
      "-o", `-k '${socket}' -h '' -p 55416`, "-w", "start"]);
    started = true;
    const cluster = connection("h0_006_bootstrap", "postgres");
    await migrate(cluster, "202609150000_h0_m01_roles.sql");
    await cluster.unsafe("create database h0_006_independent owner crm_h0_migration");
    const admin = connection("h0_006_bootstrap");
    const migration = connection("crm_h0_migration");
    await migrate(migration, "202609150001_h0_m01_context.sql");
    const originalF1 = await hardenF1(admin, migration);
    await migrate(migration, "202609250000_h0_m02_unit_history.sql");
    await migrate(admin, "202609260000_h0_m03_authorities.sql");
    await migrate(migration, "202609260001_h0_m03_actor_session_access.sql");
    await migrate(migration, "202609260002_h0_m03_revoke_all_authority_fix.sql");
    await migrate(migration, "202609260003_h0_m03_f2_expiry_revalidation_fix.sql");
  await applyF06Tail(migration,admin,'202609260003_h0_m03_f2_expiry_revalidation_fix.sql');
    const f1 = { ...originalF1,
      allowedPurposes: [...originalF1.allowedPurposes, "h0-005-human-bridge"] };
    await migration`update crm_f1.keys set purposes=${f1.allowedPurposes} where key_id=${f1.keyId}`;
    const f2 = { key: randomBytes(32), keyId: randomUUID(), audience: randomUUID(),
      generation: randomUUID(),
      allowedPurposes: ["full-identification", "core-human-access", "session-revocation"] };
    await migration`
      insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
      values(${f2.keyId},${f2.key},${f2.audience},${f2.generation},${f2.allowedPurposes},true,
        clock_timestamp()-interval '1 minute',clock_timestamp()+interval '10 minutes')
    `;
    const actor = randomUUID();
    const subject = randomUUID();
    const scope = "synthetic-h0-006-scope";
    await migration`select crm_api.provision_actor_mapping(${actor}::uuid,${subject}::uuid,${scope})`;
    await admin`
      insert into crm_private.access_probe(probe_id,context_scope,public_value,private_value)
      values('h0-006-probe',${scope},'synthetic-public','synthetic-private')
    `;
    const runtimeA = connection("crm_h0_runtime");
    const runtimeB = connection("crm_h0_runtime");
    assert.equal((await runtimeA`select session_user as login`)[0]?.login, "crm_h0_runtime");
    assert.equal((await runtimeB`select session_user as login`)[0]?.login, "crm_h0_runtime");
    const accessA = new H0005PostgresAdapter(runtimeA, f1, f2);
    const accessB = new H0005PostgresAdapter(runtimeB, f1, f2);
    // Independent synthetic Auth boundary: provider identity remains verified
    // after CRM-side session revocation, as required by the threat model.
    const verifiedIdentity = async (sessionId?: string) => {
      const proof = randomUUID();
      const port: AuthVerificationPort = { verify: async (candidate) => candidate === proof
        ? { subject, sessionId, passwordVerified: true, mfaVerified: true } : undefined };
      return verifyAuth(port, proof);
    };
    const a = await accessA.establish(await verifiedIdentity());
    const b = await accessB.establish(await verifiedIdentity());
    const authA = await verifiedIdentity(a.sessionId);
    const authB = await verifiedIdentity(b.sessionId);
    const read = classifyServerEvent("core-read");
    assert.equal((await accessB.readCoreProbe(authB, read, "h0-006-probe"))?.publicValue,
      "synthetic-public");
    await accessA.revokeOne(authA); // real COMMIT by the production adapter
    assert.equal((await admin`select revoked_at is not null as revoked
      from crm_private.crm_sessions where session_id=${a.sessionId}::uuid`)[0]?.revoked, true);
    await assert.rejects(accessA.readCoreProbe(authA, read, "h0-006-probe"), /F2_CORE_DENIED/);
    assert.equal((await accessB.readCoreProbe(authB, read, "h0-006-probe"))?.publicValue,
      "synthetic-public");
    const generationBefore = (await admin`select access_generation::text as g
      from crm_private.crm_actors where actor_id=${actor}::uuid`)[0]?.g;
    let denied = false;
    let returnedGeneration: string | undefined;
    try { returnedGeneration = await accessA.revokeAll(authA); }
    catch (error) {
      assert.match((error as Error).message, /^F2_REVOKE_DENIED$/);
      denied = true;
    }
    const generationAfter = (await admin`select access_generation::text as g
      from crm_private.crm_actors where actor_id=${actor}::uuid`)[0]?.g;
    let otherSessionStillAuthorized = false;
    try {
      otherSessionStillAuthorized = (await accessB.readCoreProbe(authB, read, "h0-006-probe"))
        ?.publicValue === "synthetic-public";
    } catch (error) { assert.match((error as Error).message, /^F2_CORE_DENIED$/); }
    t.diagnostic(JSON.stringify({ revokedSessionDeniedForCore: true,
      globalRevocationDenied: denied, generationBefore, generationAfter,
      returnedGeneration, otherSessionStillAuthorized }));
    assert.deepEqual({ denied, generationAfter, otherSessionStillAuthorized },
      { denied: true, generationAfter: generationBefore, otherSessionStillAuthorized: true },
      "H0-006-F01: revoked session must not regain global revocation authority");
    assert.equal(await accessB.revokeAll(authB),(BigInt(generationBefore)+1n).toString());
    await assert.rejects(accessB.readCoreProbe(authB,read,"h0-006-probe"),/F2_CORE_DENIED/);
  } finally {
    await Promise.allSettled(clients.map((sql) => sql.end({ timeout: 1 })));
    if (started) command("pg_ctl", ["-D", data, "-m", "fast", "-w", "stop"]);
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("H0-006 R22: independent predecessor upgrade, rollback and reapply",async () => {
  const bin=process.env.POSTGRES_H0_BIN;
  assert.ok(bin,"POSTGRES_H0_BIN_REQUIRED");
  const root=await mkdtemp(join(tmpdir(),"crm-h0-006-upgrade-"));
  const data=join(root,"data"),socket=join(root,"socket");
  const clients:postgres.Sql[]=[];
  let started=false;
  const command=(name:string,args:string[]) => {
    const result=spawnSync(join(bin,name),args,{encoding:"utf8",
      env:{...process.env,LC_ALL:"C"}});
    assert.equal(result.status,0,`${name} failed`);
  };
  const connection=(user:string,database="h0_006_upgrade") => {
    const sql=postgres({host:socket,port:55446,database,user,max:1,
      prepare:false,connect_timeout:3,idle_timeout:2});
    clients.push(sql);return sql;
  };
  const readMigration=(name:string) => readFile(new URL(
    `../../supabase/migrations/${name}`,import.meta.url),"utf8");
  const migrate=async (sql:postgres.Sql,name:string) => sql.unsafe(await readMigration(name));
  try {
    await mkdir(socket);
    command("initdb",["-D",data,"--username=h0_006_bootstrap","--auth-local=trust",
      "--auth-host=scram-sha-256","--no-locale","--encoding=UTF8"]);
    command("pg_ctl",["-D",data,"-l",join(root,"postgres.log"),
      "-o",`-k '${socket}' -h '' -p 55446`,"-w","start"]);
    started=true;
    const cluster=connection("h0_006_bootstrap","postgres");
    await migrate(cluster,"202609150000_h0_m01_roles.sql");
    await cluster.unsafe("create database h0_006_upgrade owner crm_h0_migration");
    const admin=connection("h0_006_bootstrap");
    const migration=connection("crm_h0_migration");
    const runtime=connection("crm_h0_runtime");
    await migrate(migration,"202609150001_h0_m01_context.sql");
    await hardenF1(admin,migration);
    await migrate(migration,"202609250000_h0_m02_unit_history.sql");
    await migrate(admin,"202609260000_h0_m03_authorities.sql");
    await migrate(migration,"202609260001_h0_m03_actor_session_access.sql");
    await migrate(migration,"202609260002_h0_m03_revoke_all_authority_fix.sql");
    const actor=randomUUID(),subject=randomUUID();
    await migration`select crm_api.provision_actor_mapping(
      ${actor}::uuid,${subject}::uuid,'synthetic-upgrade-scope')`;
    const definition=async () => (await admin<{body:string}[]>`
      select pg_get_functiondef('crm_api.establish_session(bytea,bytea,bytea)'::regprocedure)
        as body`)[0]!.body;
    const before=await definition();
    const fix=await readMigration("202609260003_h0_m03_f2_expiry_revalidation_fix.sql");
    assert.ok(fix.includes("create or replace function crm_api.reidentify_session"));
    const injected=fix.replace("create or replace function crm_api.reidentify_session",
      () => "do $$ begin raise exception 'INJECTED_F02_FAILURE'; end $$;\n"+
        "create or replace function crm_api.reidentify_session");
    await assert.rejects(migration.unsafe(injected),/INJECTED_F02_FAILURE/);
    await migration.unsafe("rollback");
    assert.equal(await definition(),before,"failed forward migration must restore predecessor");
    await assert.rejects(runtime.unsafe(fix),
      (error:unknown)=>(error as {code?:string}).code==="42501");
    await runtime.unsafe("rollback");
    assert.equal(await definition(),before);
    await migrate(migration,"202609260003_h0_m03_f2_expiry_revalidation_fix.sql");
    const after=await definition();
    assert.notEqual(after,before);
    assert.equal((await admin`select count(*)::int as n from crm_private.crm_actors
      where actor_id=${actor}::uuid and auth_subject=${subject}::uuid`)[0]?.n,1);
    await migrate(migration,"202609260003_h0_m03_f2_expiry_revalidation_fix.sql");
    assert.equal(await definition(),after,"reapply must preserve function behavior");
    assert.equal((await admin`select count(*)::int as n from crm_private.crm_actors
      where actor_id=${actor}::uuid`)[0]?.n,1);
  } finally {
    await Promise.allSettled(clients.map((sql)=>sql.end({timeout:1})));
    if (started) command("pg_ctl",["-D",data,"-m","fast","-w","stop"]);
    await rm(root,{recursive:true,force:true});
  }
});

// Independent length-prefix framing; no producer codec or F2 issuer is used.
function referenceFields(fields: readonly string[]): Buffer {
  const parts: Buffer[]=[];
  for (const field of fields) {
    const value=Buffer.from(field,"utf8");
    const header=Buffer.alloc(4);
    header.writeUInt32BE(value.length);
    parts.push(header,value);
  }
  return Buffer.concat(parts);
}

// D038.4/.6: authenticated not_before/expires_at and a 30-second window.
// D038.15 allows an already locked/authorized unit to finish; it does not
// grant authority before obtaining the actor lock. No clocks are replaced.
test("H0-006 R07/R18: F2 expiry while waiting for actor lock must deny establishment",
  {timeout:60000},async (t) => {
  const bin=process.env.POSTGRES_H0_BIN;
  assert.ok(bin,"POSTGRES_H0_BIN_REQUIRED");
  const temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h0-006-expiry-"));
  const data=join(temporaryRoot,"data");
  const socket=join(temporaryRoot,"socket");
  const clients: postgres.Sql[]=[];
  let started=false;
  let releaseLock=() => {};
  let holding: Promise<unknown> | undefined;
  let pending: Promise<unknown> | undefined;
  const command=(name: string,args: string[]) => {
    const result=spawnSync(join(bin,name),args,{
      encoding:"utf8",env:{...process.env,LC_ALL:"C"},
    });
    assert.equal(result.status,0,`${name} failed`);
  };
  const connection=(user: string,database="h0_006_expiry") => {
    const sql=postgres({host:socket,port:55426,database,user,max:1,
      prepare:false,connect_timeout:3,idle_timeout:2});
    clients.push(sql);
    return sql;
  };
  const migrate=async (sql: postgres.Sql,name: string) => {
    await sql.unsafe(await readFile(new URL(`../../supabase/migrations/${name}`,import.meta.url),"utf8"));
  };
  try {
    await mkdir(socket);
    command("initdb",["-D",data,"--username=h0_006_bootstrap","--auth-local=trust",
      "--auth-host=scram-sha-256","--no-locale","--encoding=UTF8"]);
    command("pg_ctl",["-D",data,"-l",join(temporaryRoot,"postgres.log"),
      "-o",`-k '${socket}' -h '' -p 55426`,"-w","start"]);
    started=true;
    const cluster=connection("h0_006_bootstrap","postgres");
    await migrate(cluster,"202609150000_h0_m01_roles.sql");
    await cluster.unsafe("create database h0_006_expiry owner crm_h0_migration");
    const admin=connection("h0_006_bootstrap");
    const migration=connection("crm_h0_migration");
    await migrate(migration,"202609150001_h0_m01_context.sql");
    const originalF1=await hardenF1(admin,migration);
    await migrate(migration,"202609250000_h0_m02_unit_history.sql");
    await migrate(admin,"202609260000_h0_m03_authorities.sql");
    await migrate(migration,"202609260001_h0_m03_actor_session_access.sql");
    await migrate(migration,"202609260002_h0_m03_revoke_all_authority_fix.sql");
    await migrate(migration,"202609260003_h0_m03_f2_expiry_revalidation_fix.sql");
    const f1={...originalF1,allowedPurposes:[...originalF1.allowedPurposes,"h0-005-human-bridge"]};
    await migration`update crm_f1.keys set purposes=${f1.allowedPurposes} where key_id=${f1.keyId}`;
    const f2={key:randomBytes(32),keyId:randomUUID(),audience:randomUUID(),generation:randomUUID(),
      allowedPurposes:["full-identification","core-human-access","session-revocation"]};
    await migration`insert into crm_f2.keys
      (key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
      values(${f2.keyId},${f2.key},${f2.audience},${f2.generation},${f2.allowedPurposes},true,
        clock_timestamp()-interval '1 minute',clock_timestamp()+interval '10 minutes')`;
    const actor=randomUUID(),subject=randomUUID(),scope="synthetic-expiry-scope";
    await migration`select crm_api.provision_actor_mapping(${actor}::uuid,${subject}::uuid,${scope})`;
    await admin`insert into crm_private.access_probe(probe_id,context_scope,public_value,private_value)
      values('expiry-probe',${scope},'synthetic-public','synthetic-private')`;
    const runtime=connection("crm_h0_runtime");
    const blocker=connection("h0_006_bootstrap");
    const adapter=new H0005PostgresAdapter(runtime,f1,f2);
    const verifiedIdentity=async (sessionId?: string) => {
      const proof=randomUUID();
      return verifyAuth({verify:async (candidate) => candidate===proof
        ? {subject,sessionId,passwordVerified:true,mfaVerified:true} : undefined},proof);
    };
    const envelope=async (tx: postgres.TransactionSql,sessionId: string,epochId: string,
      ageMicroseconds=0n) => {
      const b=(await tx<{ xid: string; pid: string; db: string; start: string;
        now: string; login: string }[]>`
        select pg_current_xact_id()::text as xid,pg_backend_pid()::text as pid,
          (select oid::text from pg_database where datname=current_database()) as db,
          (extract(epoch from pg_postmaster_start_time())*1000000)::bigint::text as start,
          floor(extract(epoch from clock_timestamp())*1000000)::bigint::text as now,
          session_user::text as login
      `)[0]!;
      assert.equal(b.login,"crm_h0_runtime");
      const nbf=BigInt(b.now)-ageMicroseconds,expiry=nbf+30000000n;
      const q=referenceFields(["CRM-F2-INP1","establish",subject,sessionId,epochId]);
      const payload=referenceFields(["CRM-H0F2","1",f2.keyId,f2.audience,f2.generation,
        b.db,b.start,b.xid,b.pid,b.login,subject,actor,sessionId,epochId,"1",
        "full-identification",scope,"establish","human_session","establish","identification",
        createHash("sha256").update(q).digest("hex"),nbf.toString(),expiry.toString(),randomUUID()]);
      return {q,payload,mac:createHmac("sha256",f2.key).update(payload).digest(),
        pid:Number(b.pid),expiry};
    };
    // Positive control: the independently encoded authorized input works now.
    await runtime.begin(async (tx) => {
      const sessionId=randomUUID(),epochId=randomUUID();
      const c=await envelope(tx,sessionId,epochId);
      const rows=await tx`select crm_api.establish_session(${c.payload},${c.mac},${c.q})::text as epoch`;
      assert.equal(rows[0]?.epoch,epochId);
    });
    // Negative control: already expired at initial verification is denied.
    await assert.rejects(runtime.begin(async (tx) => {
      const c=await envelope(tx,randomUUID(),randomUUID(),31000000n);
      await tx`select crm_api.establish_session(${c.payload},${c.mac},${c.q})`;
    }),(error: unknown) => (error as {code?: string}).code==="42501");

    let actorLocked!: () => void;
    const locked=new Promise<void>((resolve) => {actorLocked=resolve;});
    const released=new Promise<void>((resolve) => {releaseLock=resolve;});
    holding=blocker.begin(async (tx) => {
      await tx`select actor_id from crm_private.crm_actors where actor_id=${actor}::uuid for update`;
      actorLocked();
      await released;
    });
    await locked;
    const attemptedSession=randomUUID(),attemptedEpoch=randomUUID();
    let issued!: (value:{pid:number;expiry:bigint}) => void;
    const issuing=new Promise<{pid:number;expiry:bigint}>((resolve) => {issued=resolve;});
    const attempt=runtime.begin(async (tx) => {
      await tx.unsafe("set local statement_timeout='45s'");
      const c=await envelope(tx,attemptedSession,attemptedEpoch);
      issued({pid:c.pid,expiry:c.expiry});
      return tx`select crm_api.establish_session(${c.payload},${c.mac},${c.q})::text as epoch`;
    }).then(() => ({accepted:true,code:null as string|null}),
      (error: unknown) => ({accepted:false,code:(error as {code?:string}).code ?? "UNKNOWN"}));
    pending=attempt;
    const binding=await issuing;
    let sawLockWait=false;
    for (let i=0;i<100;i++) {
      const row=(await admin`select cardinality(pg_blocking_pids(${binding.pid}))>0 as waiting`)[0];
      if (row?.waiting) {sawLockWait=true;break;}
      await new Promise((resolve) => setTimeout(resolve,20));
    }
    assert.equal(sawLockWait,true,"operation must be waiting after F2 verify and before actor lock");
    assert.equal((await admin`select count(*)::int as n from crm_private.crm_sessions
      where session_id=${attemptedSession}::uuid`)[0]?.n,0);
    // Real elapsed expiry, with the PostgreSQL clock and no shortened protocol.
    await admin`select pg_sleep(greatest(0::double precision,
      (${binding.expiry.toString()}::numeric-extract(epoch from clock_timestamp())*1000000)/1000000)+0.1)`;
    const releaseTime=(await admin<{ expired: boolean }[]>`select
      floor(extract(epoch from clock_timestamp())*1000000)::bigint
        >=${binding.expiry.toString()}::bigint as expired`)[0]!;
    assert.equal(releaseTime.expired,true);
    releaseLock();
    await holding;
    const outcome=await attempt;
    const state=(await admin<{ sessions: number; epochs: number;
      created_after_expiry: boolean|null }[]>`
      select count(*)::int as sessions,
        (select count(*)::int from crm_private.identification_epochs
          where session_id=${attemptedSession}::uuid) as epochs,
        bool_and(extract(epoch from created_at)*1000000>=${binding.expiry.toString()}::numeric)
          as created_after_expiry
      from crm_private.crm_sessions where session_id=${attemptedSession}::uuid
    `)[0]!;
    let coreAllowed=false;
    if (state.sessions===1) {
      coreAllowed=(await adapter.readCoreProbe(await verifiedIdentity(attemptedSession),
        classifyServerEvent("core-read"),"expiry-probe"))?.publicValue==="synthetic-public";
    }
    t.diagnostic(JSON.stringify({initialValidControl:true,initialExpiredControlDenied:true,
      sawLockWait,releasedAfterExpiry:releaseTime.expired,...outcome,...state,coreAllowed}));
    assert.deepEqual({accepted:outcome.accepted,sessions:state.sessions,
      epochs:state.epochs,coreAllowed},
      {accepted:false,sessions:0,epochs:0,coreAllowed:false},
      "H0-006: expired F2 must not create fresh human authority after waiting for actor lock");
  } finally {
    releaseLock();
    await Promise.allSettled([holding,pending]);
    await Promise.allSettled(clients.map((sql) => sql.end({timeout:1})));
    if (started) command("pg_ctl",["-D",data,"-m","fast","-w","stop"]);
    await rm(temporaryRoot,{recursive:true,force:true});
  }
});

// Third formal execution: this fixture owns a fresh local cluster. Its expected
// results are the normative matrix in evidence-TSK-H0-006, not H0-005 tests.
test("H0-006 third execution: independent actor, lookup and M2 controls",async (t) => {
  const bin=process.env.POSTGRES_H0_BIN;
  assert.ok(bin,"POSTGRES_H0_BIN_REQUIRED");
  const temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h0-006-matrix-"));
  const data=join(temporaryRoot,"data"),socket=join(temporaryRoot,"socket");
  const clients:postgres.Sql[]=[];
  let started=false;
  const command=(name:string,args:string[]) => {
    const result=spawnSync(join(bin,name),args,{
      encoding:"utf8",env:{...process.env,LC_ALL:"C"},
    });
    assert.equal(result.status,0,`${name} failed`);
  };
  const connection=(user:string,database="h0_006_matrix") => {
    const sql=postgres({host:socket,port:55436,database,user,max:1,prepare:false,
      connect_timeout:3,idle_timeout:2});
    clients.push(sql);
    return sql;
  };
  const migrate=async (sql:postgres.Sql,name:string) => {
    await sql.unsafe(await readFile(new URL(`../../supabase/migrations/${name}`,import.meta.url),"utf8"));
  };
  try {
    await mkdir(socket);
    command("initdb",["-D",data,"--username=h0_006_bootstrap","--auth-local=trust",
      "--auth-host=scram-sha-256","--no-locale","--encoding=UTF8"]);
    command("pg_ctl",["-D",data,"-l",join(temporaryRoot,"postgres.log"),
      "-o",`-k '${socket}' -h '' -p 55436`,"-w","start"]);
    started=true;
    const cluster=connection("h0_006_bootstrap","postgres");
    await migrate(cluster,"202609150000_h0_m01_roles.sql");
    await cluster.unsafe("create database h0_006_matrix owner crm_h0_migration");
    const admin=connection("h0_006_bootstrap"),migration=connection("crm_h0_migration");
    await migrate(migration,"202609150001_h0_m01_context.sql");
    const originalF1=await hardenF1(admin,migration);
    await migrate(migration,"202609250000_h0_m02_unit_history.sql");
    await migrate(admin,"202609260000_h0_m03_authorities.sql");
    await migrate(migration,"202609260001_h0_m03_actor_session_access.sql");
    await migrate(migration,"202609260002_h0_m03_revoke_all_authority_fix.sql");
    await migrate(migration,"202609260003_h0_m03_f2_expiry_revalidation_fix.sql");
    const f1={...originalF1,
      allowedPurposes:[...originalF1.allowedPurposes,"h0-005-human-bridge"]};
    await migration`update crm_f1.keys set purposes=${f1.allowedPurposes}
      where key_id=${f1.keyId}`;
    const f2={key:randomBytes(32),keyId:randomUUID(),audience:randomUUID(),
      generation:randomUUID(),allowedPurposes:["full-identification",
        "core-human-access","session-revocation"]};
    await migration`insert into crm_f2.keys
      (key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
      values(${f2.keyId},${f2.key},${f2.audience},${f2.generation},${f2.allowedPurposes},
        true,clock_timestamp()-interval '1 minute',clock_timestamp()+interval '10 minutes')`;
    const actor=randomUUID(),subject=randomUUID(),scope="synthetic-matrix-scope";
    await migration`select crm_api.provision_actor_mapping(
      ${actor}::uuid,${subject}::uuid,${scope})`;
    await admin`insert into crm_private.access_probe
      (probe_id,context_scope,public_value,private_value)
      values('matrix-probe',${scope},'synthetic-public','synthetic-private')`;
    const runtime=connection("crm_h0_runtime"),generic=connection("crm_h0_untrusted");
    const adapter=new H0005PostgresAdapter(runtime,f1,f2);
    const verifiedIdentity=async (sessionId?:string,passwordVerified=true,mfaVerified=true) => {
      const proof=randomUUID();
      return verifyAuth({verify:async (candidate) => candidate===proof
        ? {subject,sessionId,passwordVerified,mfaVerified}:undefined},proof);
    };
    const session=await adapter.establish(await verifiedIdentity());
    const auth=await verifiedIdentity(session.sessionId);
    const coreRead=classifyServerEvent("core-read");
    const run=async (name:string,body:()=>Promise<void>) => {
      let failure:unknown;
      await t.test(name,async () => {
        try { await body(); } catch (error) { failure=error; throw error; }
      });
      if (failure) throw failure;
    };
    type NormativeOperation="establish"|"reidentify"|"revoke_one"|"revoke_all"|"C01"|"C03";
    const target:Record<NormativeOperation,{purpose:string;resource:string;
      action:string;interaction:string}>={
      establish:{purpose:"full-identification",resource:"human_session",
        action:"establish",interaction:"identification"},
      reidentify:{purpose:"full-identification",resource:"human_session",
        action:"reidentify",interaction:"identification"},
      revoke_one:{purpose:"session-revocation",resource:"human_session",
        action:"revoke_one",interaction:"administrative_action"},
      revoke_all:{purpose:"session-revocation",resource:"human_actor",
        action:"revoke_all",interaction:"administrative_action"},
      C01:{purpose:"core-human-access",resource:"human_core_probe",
        action:"read_probe",interaction:"interactive_read"},
      C03:{purpose:"core-human-access",resource:"human_core_probe",
        action:"apply_probe_batch",interaction:"interactive_action"},
    };
    const issueF2=async (tx:postgres.TransactionSql,operation:NormativeOperation,
      q:Buffer,sessionId:string,epochId:string,subjectId=subject,actorId=actor,
      generation="1",claimedScope=scope) => {
      const binding=await postgresF1Binding(tx);
      const now=BigInt(binding.now);
      const x=target[operation];
      const fields=["CRM-H0F2","1",f2.keyId,f2.audience,f2.generation,
        binding.database,binding.start,binding.xid,binding.pid,binding.login,
        subjectId,actorId,sessionId,epochId,generation,x.purpose,claimedScope,
        operation,x.resource,x.action,x.interaction,
        createHash("sha256").update(q).digest("hex"),now.toString(),
        (now+30000000n).toString(),randomUUID()];
      const payload=referenceFields(fields);
      return {payload,mac:createHmac("sha256",f2.key).update(payload).digest(),
        fields,binding};
    };
    const issueF1=createF1Issuer(f1);
    const technical=(binding:Awaited<ReturnType<typeof postgresF1Binding>>,
      operation:"C01"|"C03",q:Buffer) => issueF1(issueTrustedContext({
        identityId:"independent-h0-006-bridge",identityKind:"technical",
        purpose:"h0-005-human-bridge",scope,requestId:randomUUID(),
        serverTime:new Date().toISOString(),
      }),binding,operation,q);
    const readInput=referenceFields(["CRM-INP1","C01","matrix-probe"]);

    await run("R03 generic lookup is metadata, not authority; revoke-all lookup requires live session",
      async () => {
      const rows=await runtime<{actor_id:string;access_generation:string;
        admin_scope:string;epoch_id:string|null}[]>`
        select * from crm_api.f2_lookup(${subject}::uuid,${session.sessionId}::uuid)`;
      assert.equal(rows.length,1);
      assert.deepEqual(Object.keys(rows[0]!).sort(),
        ["actor_id","access_generation","admin_scope","epoch_id"].sort());
      assert.equal(rows[0]!.actor_id,actor);
      assert.equal(rows[0]!.epoch_id,session.epochId);
      assert.equal((await runtime`select * from crm_api.f2_lookup(
        ${randomUUID()}::uuid,${session.sessionId}::uuid)`).length,0);
      const unknown=await runtime<{epoch_id:string|null}[]>`select * from crm_api.f2_lookup(
        ${subject}::uuid,${randomUUID()}::uuid)`;
      assert.equal(unknown.length,1);
      assert.equal(unknown[0]!.epoch_id,null);
      assert.equal((await runtime`select * from crm_api.f2_lookup_revoke_all_authority(
        ${subject}::uuid,${randomUUID()}::uuid)`).length,0);
      assert.equal((await runtime`select * from crm_api.f2_lookup_revoke_all_authority(
        ${randomUUID()}::uuid,${session.sessionId}::uuid)`).length,0);
      assert.equal((await runtime`select * from crm_api.f2_lookup_revoke_all_authority(
        ${subject}::uuid,${session.sessionId}::uuid)`).length,1);
      assert.equal((await adapter.readCoreProbe(auth,coreRead,"matrix-probe"))?.publicValue,
        "synthetic-public");
    });

    await run("R03 revoke-all lookup rejects revoked, stale, old epoch, disabled and 7/30 expiry",
      async () => {
      const probe=await adapter.establish(await verifiedIdentity());
      const lookup=async () => (await runtime`select *
        from crm_api.f2_lookup_revoke_all_authority(
          ${subject}::uuid,${probe.sessionId}::uuid)`).length;
      const original=(await admin<{identified_at:string;last_human_activity_at:string}[]>`
        select identified_at::text,last_human_activity_at::text
        from crm_private.identification_epochs where epoch_id=${probe.epochId}::uuid`)[0]!;
      assert.equal(await lookup(),1);
      await admin`update crm_private.crm_sessions set revoked_at=clock_timestamp()
        where session_id=${probe.sessionId}::uuid`;
      assert.equal(await lookup(),0);
      await admin`update crm_private.crm_sessions set revoked_at=null
        where session_id=${probe.sessionId}::uuid`;
      await admin`update crm_private.crm_sessions set access_generation=2
        where session_id=${probe.sessionId}::uuid`;
      assert.equal(await lookup(),0);
      await admin`update crm_private.crm_sessions set access_generation=1
        where session_id=${probe.sessionId}::uuid`;
      await admin`update crm_private.identification_epochs
        set current_epoch=false,closed_at=clock_timestamp()
        where epoch_id=${probe.epochId}::uuid`;
      assert.equal(await lookup(),0);
      await admin`update crm_private.identification_epochs
        set current_epoch=true,closed_at=null where epoch_id=${probe.epochId}::uuid`;
      await admin`update crm_private.crm_actors set enabled=false where actor_id=${actor}::uuid`;
      assert.equal(await lookup(),0);
      await admin`update crm_private.crm_actors set enabled=true where actor_id=${actor}::uuid`;
      await admin`update crm_private.identification_epochs
        set identified_at=clock_timestamp()-interval '29 days',
          last_human_activity_at=clock_timestamp()-interval '7 days'
        where epoch_id=${probe.epochId}::uuid`;
      assert.equal(await lookup(),0);
      await admin`update crm_private.identification_epochs
        set identified_at=clock_timestamp()-interval '30 days',
          last_human_activity_at=clock_timestamp()
        where epoch_id=${probe.epochId}::uuid`;
      assert.equal(await lookup(),0);
      await admin`update crm_private.identification_epochs
        set identified_at=${original.identified_at}::timestamptz,
          last_human_activity_at=${original.last_human_activity_at}::timestamptz
        where epoch_id=${probe.epochId}::uuid`;
      assert.equal(await lookup(),1);
    });

    await run("R04 M2 SQL cannot create an actor, session, epoch or mutate authority",async () => {
      const sessionsBefore=(await admin`select count(*)::int as n
        from crm_private.crm_sessions`)[0]?.n;
      assert.equal((await runtime`select session_user as login`)[0]?.login,"crm_h0_runtime");
      const denied=async (work:()=>Promise<unknown>) => {
        await assert.rejects(work(),(error:unknown) =>
          (error as {code?:string}).code==="42501");
      };
      await denied(() => runtime`insert into crm_private.crm_actors
        (actor_id,auth_subject,admin_scope,enabled)
        values(${randomUUID()}::uuid,${randomUUID()}::uuid,'intruder',true)`);
      await denied(() => runtime`insert into crm_private.crm_sessions
        (session_id,actor_id,auth_subject,access_generation)
        values(${randomUUID()}::uuid,${actor}::uuid,${subject}::uuid,1)`);
      await denied(() => runtime`update crm_private.identification_epochs
        set last_human_activity_at=clock_timestamp()+interval '1 day'
        where epoch_id=${session.epochId}::uuid`);
      await denied(() => runtime`update crm_private.crm_actors
        set access_generation=1,enabled=true where actor_id=${actor}::uuid`);
      await denied(() => runtime`select crm_api.provision_actor_mapping(
        ${randomUUID()}::uuid,${randomUUID()}::uuid,'intruder')`);
      await denied(() => runtime`select crm_api.set_actor_enabled(
        ${actor}::uuid,true,'ready')`);
      await denied(() => runtime`select secret from crm_f2.keys`);
      await denied(() => runtime.unsafe("set role crm_h0_f2_executor"));
      await denied(() => runtime.unsafe("set role crm_h0_f2_verifier"));
      await denied(() => runtime.unsafe("set role crm_h0_migration"));
      await denied(() => generic`select * from crm_api.f2_lookup(
        ${subject}::uuid,${session.sessionId}::uuid)`);
      assert.equal((await admin`select count(*)::int as n from crm_private.crm_actors`)[0]?.n,1);
      assert.equal((await admin`select count(*)::int as n
        from crm_private.crm_sessions`)[0]?.n,sessionsBefore);
      assert.equal((await adapter.readCoreProbe(auth,coreRead,"matrix-probe"))?.publicValue,
        "synthetic-public");
    });

    await run("R05/R20 independently signed F2 and F1 are both necessary and scope-bound",
      async () => {
      await runtime.begin(async (tx) => {
        const f2cap=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
        const f1cap=technical(f2cap.binding,"C01",readInput);
        const rows=await tx<{probe_id:string;public_value:string}[]>`
          select * from crm_api.human_read_probe(${f2cap.payload},${f2cap.mac},
            ${f1cap.payload},${f1cap.mac},${readInput})`;
        assert.equal(rows.length,1);
        assert.equal(rows[0]?.probe_id,"matrix-probe");
        assert.equal(rows[0]?.public_value,"synthetic-public");
        assert.equal(Object.hasOwn(rows[0]!,"private_value"),false);
      });
      const denial=async (kind:"bad-f2"|"bad-f1"|"wrong-scope"|"wrong-operation"|
        "changed-input"|"no-f1"|"no-f2") => {
        await assert.rejects(runtime.begin(async (tx) => {
          const f2cap=await issueF2(tx,kind==="wrong-operation"?"C03":"C01",
            readInput,session.sessionId,session.epochId,subject,actor,"1",
            kind==="wrong-scope"?"other-scope":scope);
          const f1cap=technical(f2cap.binding,"C01",readInput);
          const changed=referenceFields(["CRM-INP1","C01","other-probe"]);
          await tx`select * from crm_api.human_read_probe(
            ${kind==="no-f2"?null:f2cap.payload},
            ${kind==="bad-f2"?randomBytes(32):kind==="no-f2"?null:f2cap.mac},
            ${kind==="no-f1"?null:f1cap.payload},
            ${kind==="bad-f1"?randomBytes(32):kind==="no-f1"?null:f1cap.mac},
            ${kind==="changed-input"?changed:readInput})`;
        }),(error:unknown)=>(error as {code?:string}).code==="42501",kind);
      };
      for (const kind of ["bad-f2","bad-f1","wrong-scope","wrong-operation",
        "changed-input","no-f1","no-f2"] as const) await denial(kind);
    });

    await run("R06 independent 25-field framing rejects mutation and malformed input",async () => {
      for (let index=0;index<25;index++) {
        await assert.rejects(runtime.begin(async (tx) => {
          const cap=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
          assert.equal(cap.fields.length,25);
          const f1cap=technical(cap.binding,"C01",readInput);
          const altered=[...cap.fields];
          altered[index]=`${altered[index]}x`;
          await tx`select * from crm_api.human_read_probe(
            ${referenceFields(altered)},${cap.mac},${f1cap.payload},${f1cap.mac},${readInput})`;
        }),(error:unknown)=>(error as {code?:string}).code==="42501",`field ${index+1}`);
      }
      for (const malformed of [Buffer.alloc(0),Buffer.from([0,0,0,9,65]),
        Buffer.alloc(65537)]) {
        await assert.rejects(runtime.begin(async (tx) => {
          const cap=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
          const f1cap=technical(cap.binding,"C01",readInput);
          await tx`select * from crm_api.human_read_probe(
            ${malformed},${cap.mac},${f1cap.payload},${f1cap.mac},${readInput})`;
        }),(error:unknown)=>(error as {code?:string}).code==="42501");
      }
    });

    await run("R07 a valid capability cannot cross transactions or backends",async () => {
      let prior:{payload:Buffer;mac:Buffer}|undefined;
      await runtime.begin(async (tx) => {
        const cap=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
        const f1cap=technical(cap.binding,"C01",readInput);
        await tx`select * from crm_api.human_read_probe(${cap.payload},${cap.mac},
          ${f1cap.payload},${f1cap.mac},${readInput})`;
        prior={payload:cap.payload,mac:cap.mac};
      });
      assert.ok(prior);
      await assert.rejects(runtime.begin(async (tx) => {
        const fresh=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
        const f1cap=technical(fresh.binding,"C01",readInput);
        await tx`select * from crm_api.human_read_probe(${prior!.payload},${prior!.mac},
          ${f1cap.payload},${f1cap.mac},${readInput})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
      const another=connection("crm_h0_runtime");
      await runtime.begin(async (first) => {
        const cap=await issueF2(first,"C01",readInput,session.sessionId,session.epochId);
        await assert.rejects(another.begin(async (second) => {
          const binding=await postgresF1Binding(second);
          assert.notEqual(binding.pid,cap.binding.pid);
          const f1cap=technical(binding,"C01",readInput);
          await second`select * from crm_api.human_read_probe(${cap.payload},${cap.mac},
            ${f1cap.payload},${f1cap.mac},${readInput})`;
        }),(error:unknown)=>(error as {code?:string}).code==="42501");
      });
      await assert.rejects(runtime.begin(async (tx) => {
        const cap=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
        const now=BigInt(cap.binding.now);
        const altered=[...cap.fields];
        altered[22]=(now+2000000n).toString();
        altered[23]=(now+32000000n).toString();
        const payload=referenceFields(altered);
        const f1cap=technical(cap.binding,"C01",readInput);
        await tx`select * from crm_api.human_read_probe(
          ${payload},${createHmac("sha256",f2.key).update(payload).digest()},
          ${f1cap.payload},${f1cap.mac},${readInput})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
    });

    await run("R08 plain GUC and reused pooled connection grant no authority",async () => {
      await runtime.begin(async (tx) => {
        await tx`select set_config('crm.identity_id',${actor},true),
          set_config('crm.identity_kind','human',true),
          set_config('crm.scope',${scope},true)`;
        assert.equal((await tx`select current_setting('crm.scope',true) as scope`)[0]?.scope,scope);
      });
      await runtime.begin(async (tx) => {
        assert.notEqual((await tx`select current_setting('crm.scope',true) as scope`)[0]?.scope,
          scope);
      });
      await assert.rejects(runtime.begin(async (tx) => {
        await tx`select * from crm_private.access_probe`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
      await assert.rejects(runtime.begin(async (tx) => {
        await tx`select * from crm_api.human_read_probe(null::bytea,null::bytea,
          null::bytea,null::bytea,${readInput})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
      await assert.rejects(runtime.begin(async (tx) => {
        await tx`select set_config('crm.scope',${scope},true)`;
        throw new Error("SYNTHETIC_ROLLBACK");
      }),/SYNTHETIC_ROLLBACK/);
      assert.notEqual((await runtime`select current_setting('crm.scope',true) as scope`)[0]?.scope,
        scope);
      await assert.rejects(runtime.begin(async (tx) => {
        await tx`select set_config('crm.scope',${scope},true)`;
        await tx.unsafe("select 1/0");
      }),(error:unknown)=>(error as {code?:string}).code==="22012");
      assert.notEqual((await runtime`select current_setting('crm.scope',true) as scope`)[0]?.scope,
        scope);
    });

    await run("R09 key custody and exact key lifecycle fail closed",async () => {
      assert.equal(Buffer.from(f1.key).equals(f2.key),false);
      const catalog=await admin<{role:string;key_access:boolean;verify_access:boolean}[]>`
        select r.rolname as role,
          has_table_privilege(r.oid,'crm_f2.keys','SELECT') as key_access,
          has_function_privilege(r.oid,
            'crm_f2.verify(bytea,bytea,bytea,text,text,text)','EXECUTE') as verify_access
        from pg_roles r where r.rolname in
          ('crm_h0_runtime','crm_h0_f2_executor','crm_h0_f2_verifier')
        order by r.rolname`;
      assert.equal(catalog.length,3);
      assert.equal(catalog.find((r)=>r.role==="crm_h0_runtime")?.key_access,false);
      assert.equal(catalog.find((r)=>r.role==="crm_h0_runtime")?.verify_access,false);
      assert.equal(catalog.find((r)=>r.role==="crm_h0_f2_executor")?.key_access,false);
      assert.equal(catalog.find((r)=>r.role==="crm_h0_f2_verifier")?.key_access,true);
      await assert.rejects(runtime`select crm_f2.verify(null::bytea,null::bytea,
        null::bytea,'C01','human_core_probe','read_probe')`,
        (error:unknown)=>(error as {code?:string}).code==="42501");
      await migration`update crm_f2.keys set enabled=false where key_id=${f2.keyId}`;
      await assert.rejects(adapter.readCoreProbe(auth,coreRead,"matrix-probe"),
        /F2_CORE_DENIED/);
      await migration`update crm_f2.keys set enabled=true where key_id=${f2.keyId}`;
      assert.equal((await adapter.readCoreProbe(auth,coreRead,"matrix-probe"))?.publicValue,
        "synthetic-public");
      await assert.rejects(runtime.begin(async (tx) => {
        const cap=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
        const f1cap=technical(cap.binding,"C01",readInput);
        const unknown=[...cap.fields];unknown[2]=randomUUID();
        const payload=referenceFields(unknown);
        await tx`select * from crm_api.human_read_probe(
          ${payload},${createHmac("sha256",f2.key).update(payload).digest()},
          ${f1cap.payload},${f1cap.mac},${readInput})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
      await assert.rejects(runtime.begin(async (tx) => {
        const cap=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
        const f1cap=technical(cap.binding,"C01",readInput);
        await tx`select * from crm_api.human_read_probe(
          ${cap.payload},${cap.mac.subarray(0,31)},
          ${f1cap.payload},${f1cap.mac},${readInput})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
      const nextKey={key:randomBytes(32),keyId:randomUUID(),generation:randomUUID()};
      await migration`insert into crm_f2.keys
        (key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
        values(${nextKey.keyId},${nextKey.key},${f2.audience},${nextKey.generation},
          ${f2.allowedPurposes},true,clock_timestamp()-interval '1 minute',
          clock_timestamp()+interval '10 minutes')`;
      const old={key:f2.key,keyId:f2.keyId,generation:f2.generation};
      try {
        f2.key=nextKey.key;f2.keyId=nextKey.keyId;f2.generation=nextKey.generation;
        await runtime.begin(async (tx) => {
          const cap=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
          const f1cap=technical(cap.binding,"C01",readInput);
          assert.equal((await tx`select * from crm_api.human_read_probe(
            ${cap.payload},${cap.mac},${f1cap.payload},${f1cap.mac},${readInput})`).length,1);
        });
        await migration`update crm_f2.keys set enabled=false where key_id=${nextKey.keyId}`;
        await assert.rejects(runtime.begin(async (tx) => {
          const cap=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
          const f1cap=technical(cap.binding,"C01",readInput);
          await tx`select * from crm_api.human_read_probe(
            ${cap.payload},${cap.mac},${f1cap.payload},${f1cap.mac},${readInput})`;
        }),(error:unknown)=>(error as {code?:string}).code==="42501");
      } finally {
        f2.key=old.key;f2.keyId=old.keyId;f2.generation=old.generation;
      }
    });

    await run("R10 singleton mapping cannot be duplicated or changed by runtime",async () => {
      await assert.rejects(migration`select crm_api.provision_actor_mapping(
        ${randomUUID()}::uuid,${randomUUID()}::uuid,'another-admin')`,
        (error:unknown)=>(error as {code?:string}).code==="42501");
      assert.equal((await admin`select count(*)::int as n from crm_private.crm_actors`)[0]?.n,1);
      assert.equal((await admin`select auth_subject::text as subject from crm_private.crm_actors
        where actor_id=${actor}::uuid`)[0]?.subject,subject);
      await assert.rejects(runtime`update crm_private.crm_actors set
        auth_subject=${randomUUID()}::uuid where actor_id=${actor}::uuid`,
        (error:unknown)=>(error as {code?:string}).code==="42501");
    });

    await run("R11 session, subject and epoch must match current coherent rows",async () => {
      const wrong=await verifyAuth({verify:async (proof)=>proof==="synthetic"
        ? {subject:randomUUID(),sessionId:session.sessionId,
          passwordVerified:true,mfaVerified:true}:undefined},"synthetic");
      await assert.rejects(adapter.readCoreProbe(wrong,coreRead,"matrix-probe"),
        /F2_CORE_DENIED/);
      await assert.rejects(adapter.readCoreProbe(
        await verifiedIdentity(randomUUID()),coreRead,"matrix-probe"),/F2_CORE_DENIED/);
      await assert.rejects(runtime.begin(async (tx) => {
        const cap=await issueF2(tx,"C01",readInput,session.sessionId,randomUUID());
        const f1cap=technical(cap.binding,"C01",readInput);
        await tx`select * from crm_api.human_read_probe(${cap.payload},${cap.mac},
          ${f1cap.payload},${f1cap.mac},${readInput})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
      const present=await admin<{n:number}[]>`select count(*)::int as n
        from crm_private.identification_epochs where session_id=${session.sessionId}::uuid
          and current_epoch`;
      assert.equal(present[0]?.n,1);
      await assert.rejects(runtime`update crm_private.identification_epochs
        set current_epoch=false,closed_at=clock_timestamp()
        where epoch_id=${session.epochId}::uuid`,
        (error:unknown)=>(error as {code?:string}).code==="42501");
    });

    await run("R12 unverified Auth, incomplete MFA and unclassified interaction deny",async () => {
      const forged={kind:"verified-auth-evidence",subject,
        passwordVerified:true,mfaVerified:true};
      await assert.rejects(adapter.establish(forged as never),/F2_AUTH_VERIFICATION_REQUIRED/);
      for (const hostile of [
        {auth:forged,actor_id:actor,role:"crm_h0_f2_executor",trusted_context:true},
        {actorId:actor,permissions:["admin"],auth:{...forged,sessionId:session.sessionId}},
        [{...forged,privileged:true}],
        JSON.parse('{"__proto__":{"mfaVerified":true},"subject":"'+subject+'"}'),
      ]) {
        await assert.rejects(adapter.establish(hostile as never),
          /F2_AUTH_VERIFICATION_REQUIRED/);
      }
      await assert.rejects(adapter.establish(await verifiedIdentity(undefined,true,false)),
        /F2_FULL_IDENTIFICATION_REQUIRED/);
      await assert.rejects(adapter.establish(await verifiedIdentity(undefined,false,true)),
        /F2_FULL_IDENTIFICATION_REQUIRED/);
      await assert.rejects(adapter.readCoreProbe(auth,
        {interactionClass:"interactive_read"} as never,"matrix-probe"),
        /F2_INTERACTION_DENIED/);
      for (const event of ["token-refresh","polling","background-job","passive"] as const) {
        await assert.rejects(adapter.readCoreProbe(auth,classifyServerEvent(event),
          "matrix-probe"),/F2_INTERACTION_DENIED/);
      }
      const before=(await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${session.epochId}::uuid`)[0]?.at;
      await assert.rejects(adapter.readCoreProbe(
        await verifiedIdentity(session.sessionId,true,false),coreRead,"matrix-probe"),
        /F2_CORE_DENIED/);
      assert.equal((await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${session.epochId}::uuid`)[0]?.at,
        before);
    });

    await run("R13/R14 elapsed 7/30-day limits deny at equality before activity update",async () => {
      const anchor="2026-09-27T12:00:00Z";
      const boundaries=await admin<{seven_before:boolean;seven_at:boolean;
        thirty_before:boolean;thirty_at:boolean;dst:boolean}[]>`
        select crm_f2.within_limit(${anchor}::timestamptz-interval '1 microsecond',
          ${anchor}::timestamptz-interval '7 days',7) as seven_before,
          crm_f2.within_limit(${anchor}::timestamptz,
          ${anchor}::timestamptz-interval '7 days',7) as seven_at,
          crm_f2.within_limit(${anchor}::timestamptz-interval '1 microsecond',
          ${anchor}::timestamptz-interval '30 days',30) as thirty_before,
          crm_f2.within_limit(${anchor}::timestamptz,
          ${anchor}::timestamptz-interval '30 days',30) as thirty_at,
          crm_f2.within_limit('2026-03-30 01:00:00+02'::timestamptz,
          '2026-03-23 01:00:01+01'::timestamptz,7) as dst`;
      assert.deepEqual({...boundaries[0]},
        {seven_before:true,seven_at:false,thirty_before:true,thirty_at:false,dst:true});
      const idle=await adapter.establish(await verifiedIdentity());
      const idleAuth=await verifiedIdentity(idle.sessionId);
      await admin`update crm_private.identification_epochs
        set identified_at=clock_timestamp()-interval '29 days',
          last_human_activity_at=clock_timestamp()-interval '7 days'
        where epoch_id=${idle.epochId}::uuid`;
      const before=(await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${idle.epochId}::uuid`)[0]?.at;
      await assert.rejects(adapter.readCoreProbe(idleAuth,coreRead,"matrix-probe"),
        /F2_CORE_DENIED/);
      assert.equal((await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${idle.epochId}::uuid`)[0]?.at,
        before);
      await admin`update crm_private.identification_epochs
        set identified_at=clock_timestamp()-interval '30 days',
          last_human_activity_at=clock_timestamp()
        where epoch_id=${idle.epochId}::uuid`;
      const beforeAbsolute=(await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${idle.epochId}::uuid`)[0]?.at;
      await assert.rejects(adapter.readCoreProbe(idleAuth,coreRead,"matrix-probe"),
        /F2_CORE_DENIED/);
      assert.equal((await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${idle.epochId}::uuid`)[0]?.at,
        beforeAbsolute);
      const fresh=await adapter.establish(await verifiedIdentity());
      await admin`update crm_private.identification_epochs
        set identified_at=clock_timestamp()-interval '29 days',
          last_human_activity_at=clock_timestamp()-interval '6 days 23 hours'
        where epoch_id=${fresh.epochId}::uuid`;
      assert.equal((await adapter.readCoreProbe(
        await verifiedIdentity(fresh.sessionId),coreRead,"matrix-probe"))?.publicValue,
        "synthetic-public");
    });

    await run("R02 pre-issued authority loses to a committed revocation",async () => {
      const victim=await adapter.establish(await verifiedIdentity());
      const victimAuth=await verifiedIdentity(victim.sessionId);
      const waiting=connection("crm_h0_runtime");
      let issue!:()=>void;
      const issued=new Promise<void>((resolve)=>{issue=resolve;});
      let release!:()=>void;
      const gate=new Promise<void>((resolve)=>{release=resolve;});
      const preissued=waiting.begin(async (tx) => {
        const cap=await issueF2(tx,"C01",readInput,victim.sessionId,victim.epochId);
        const f1cap=technical(cap.binding,"C01",readInput);
        issue();
        await gate;
        return tx`select * from crm_api.human_read_probe(${cap.payload},${cap.mac},
          ${f1cap.payload},${f1cap.mac},${readInput})`;
      });
      try {
        await issued;
        await adapter.revokeOne(victimAuth);
        release();
        await assert.rejects(preissued,(error:unknown)=>(error as {code?:string}).code==="42501");
        const revoked=(await admin`select revoked_at is not null as revoked
          from crm_private.crm_sessions where session_id=${victim.sessionId}::uuid`)[0]?.revoked;
        assert.equal(revoked,true);
        await assert.rejects(adapter.readCoreProbe(victimAuth,coreRead,"matrix-probe"),
          /F2_CORE_DENIED/);
      } finally {
        release();
        await Promise.allSettled([preissued]);
      }
    });

    await run("R15 two devices keep independent activity and reidentify without history rewrite",
      async () => {
      const a=await adapter.establish(await verifiedIdentity());
      const b=await adapter.establish(await verifiedIdentity());
      const activity=async (epochId:string) => (await admin<{at:string}[]>`
        select last_human_activity_at::text as at from crm_private.identification_epochs
        where epoch_id=${epochId}::uuid`)[0]!.at;
      const bBefore=await activity(b.epochId);
      await adapter.readCoreProbe(await verifiedIdentity(a.sessionId),coreRead,"matrix-probe");
      assert.equal(await activity(b.epochId),bBefore);
      const oldEpoch=b.epochId;
      const newEpoch=await adapter.reidentify(await verifiedIdentity(b.sessionId));
      assert.notEqual(newEpoch,oldEpoch);
      const historical=await admin<{epoch_id:string;current_epoch:boolean;
        closed_at:string|null}[]>`select epoch_id::text,current_epoch,closed_at::text
        from crm_private.identification_epochs where session_id=${b.sessionId}::uuid
        order by identified_at`;
      assert.equal(historical.length,2);
      assert.equal(historical.find((row)=>row.epoch_id===oldEpoch)?.current_epoch,false);
      assert.notEqual(historical.find((row)=>row.epoch_id===oldEpoch)?.closed_at,null);
      assert.equal(historical.find((row)=>row.epoch_id===newEpoch)?.current_epoch,true);
      assert.equal((await adapter.readCoreProbe(
        await verifiedIdentity(b.sessionId),coreRead,"matrix-probe"))?.publicValue,
        "synthetic-public");
      await assert.rejects(runtime.begin(async (tx) => {
        const cap=await issueF2(tx,"C01",readInput,b.sessionId,oldEpoch);
        const f1cap=technical(cap.binding,"C01",readInput);
        await tx`select * from crm_api.human_read_probe(${cap.payload},${cap.mac},
          ${f1cap.payload},${f1cap.mac},${readInput})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
    });

    await run("R19 failed Core operation rolls back F2 activity and F1 consumption",async () => {
      const unit=await adapter.establish(await verifiedIdentity());
      const before=(await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${unit.epochId}::uuid`)[0]?.at;
      const consumedBefore=(await admin`select count(*)::int as n from crm_f1.consumption`)[0]?.n;
      const writeId=`matrix-denied-${randomUUID()}`;
      const q=referenceFields(["CRM-INP1","C03",randomUUID(),"true","true",
        "record-technical-probe",writeId,"synthetic-public"]);
      await assert.rejects(runtime.begin(async (tx) => {
        const cap=await issueF2(tx,"C03",q,unit.sessionId,unit.epochId);
        const f1cap=technical(cap.binding,"C03",q);
        await tx`select crm_api.human_apply_probe_batch(
          ${cap.payload},${cap.mac},${f1cap.payload},${randomBytes(32)},${q})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
      assert.equal((await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${unit.epochId}::uuid`)[0]?.at,
        before);
      assert.equal((await admin`select count(*)::int as n from crm_f1.consumption`)[0]?.n,
        consumedBefore);
      assert.equal((await admin`select count(*)::int as n from crm_private.access_probe
        where probe_id=${writeId}`)[0]?.n,0);
      const result=await adapter.applyCoreProbe(await verifiedIdentity(unit.sessionId),
        classifyServerEvent("core-action"),randomUUID(),writeId,"synthetic-public");
      assert.ok(result.length>0);
      assert.equal((await admin`select count(*)::int as n from crm_private.access_probe
        where probe_id=${writeId}`)[0]?.n,1);
      const beforeRead=(await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${unit.epochId}::uuid`)[0]?.at;
      await assert.rejects(runtime.begin(async (tx) => {
        const cap=await issueF2(tx,"C01",readInput,unit.sessionId,unit.epochId);
        const f1cap=technical(cap.binding,"C01",readInput);
        await tx`select * from crm_api.human_read_probe(
          ${cap.payload},${cap.mac},${f1cap.payload},${randomBytes(32)},${readInput})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
      assert.equal((await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${unit.epochId}::uuid`)[0]?.at,
        beforeRead);
    });

    await run("R21 roles, SECURITY DEFINER and FORCE RLS remain effective",async () => {
      const roles=await admin<{rolname:string;rolsuper:boolean;rolbypassrls:boolean;
        rolcreaterole:boolean;rolcreatedb:boolean;rolcanlogin:boolean}[]>`
        select rolname,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolcanlogin
        from pg_roles where rolname in ('crm_h0_runtime','crm_h0_f2_owner',
          'crm_h0_f2_verifier','crm_h0_f2_executor') order by rolname`;
      assert.equal(roles.length,4);
      assert.equal(roles.find((row)=>row.rolname==="crm_h0_runtime")?.rolcanlogin,true);
      assert.ok(roles.filter((row)=>row.rolname!=="crm_h0_runtime")
        .every((row)=>!row.rolcanlogin));
      assert.ok(roles.every((row)=>!row.rolsuper&&!row.rolbypassrls
        &&!row.rolcreaterole&&!row.rolcreatedb));
      const relations=await admin<{relname:string;relrowsecurity:boolean;
        relforcerowsecurity:boolean;owner:string}[]>`
        select c.relname,c.relrowsecurity,c.relforcerowsecurity,
          pg_get_userbyid(c.relowner) as owner
        from pg_class c join pg_namespace n on n.oid=c.relnamespace
        where (n.nspname='crm_private' and c.relname in
          ('crm_actors','crm_sessions','identification_epochs'))
          or (n.nspname='crm_f2' and c.relname='keys')`;
      assert.equal(relations.length,4);
      assert.ok(relations.every((row)=>row.relrowsecurity&&row.relforcerowsecurity
        &&row.owner==="crm_h0_f2_owner"));
      const funcs=await admin<{proname:string;owner:string;prosecdef:boolean;
        proconfig:string[];public_execute:boolean}[]>`
        select p.proname,pg_get_userbyid(p.proowner) as owner,p.prosecdef,
          coalesce(p.proconfig,'{}'::text[]) as proconfig,
          has_function_privilege('public',p.oid,'EXECUTE') as public_execute
        from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='crm_api' and p.proname in
          ('establish_session','reidentify_session','revoke_session',
           'revoke_all_sessions','human_read_probe','human_apply_probe_batch')`;
      assert.equal(funcs.length,6);
      assert.ok(funcs.every((row)=>row.owner==="crm_h0_f2_executor"&&row.prosecdef
        &&row.proconfig.includes("search_path=pg_catalog, pg_temp")&&!row.public_execute));
      await assert.rejects(runtime.unsafe("set role crm_h0_f2_owner"),
        (error:unknown)=>(error as {code?:string}).code==="42501");
      await assert.rejects(runtime.unsafe("set role crm_h0_f2_executor"),
        (error:unknown)=>(error as {code?:string}).code==="42501");
      await assert.rejects(runtime`delete from crm_private.identification_epochs`,
        (error:unknown)=>(error as {code?:string}).code==="42501");
      await assert.rejects(runtime.begin(async (tx) => {
        await tx.unsafe("set local search_path=pg_temp, public");
        await tx.unsafe("create function pg_temp.verify(bytea,bytea,bytea,text,text,text) returns text[] language sql as $$select array['forged']::text[]$$");
        const cap=await issueF2(tx,"C01",readInput,session.sessionId,session.epochId);
        const f1cap=technical(cap.binding,"C01",readInput);
        await tx`select * from crm_api.human_read_probe(
          ${cap.payload},${randomBytes(32)},${f1cap.payload},${f1cap.mac},${readInput})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
    });

    await run("R18 F02 six independently issued operations deny after a real actor-lock expiry",
      async () => {
      const units=await Promise.all(Array.from({length:5},async () =>
        adapter.establish(await verifiedIdentity())));
      const newSession=randomUUID(),newEpoch=randomUUID(),replacement=randomUUID();
      const writeId=`matrix-expired-${randomUUID()}`;
      const cases=[
        {op:"establish" as const,sessionId:newSession,epochId:newEpoch,
          q:referenceFields(["CRM-F2-INP1","establish",subject,newSession,newEpoch])},
        {op:"reidentify" as const,sessionId:units[0]!.sessionId,epochId:units[0]!.epochId,
          q:referenceFields(["CRM-F2-INP1","reidentify",units[0]!.sessionId,
            units[0]!.epochId,replacement])},
        {op:"revoke_one" as const,sessionId:units[1]!.sessionId,epochId:units[1]!.epochId,
          q:referenceFields(["CRM-F2-INP1","revoke_one",units[1]!.sessionId])},
        {op:"revoke_all" as const,sessionId:units[2]!.sessionId,epochId:units[2]!.epochId,
          q:referenceFields(["CRM-F2-INP1","revoke_all",actor])},
        {op:"C01" as const,sessionId:units[3]!.sessionId,epochId:units[3]!.epochId,
          q:readInput},
        {op:"C03" as const,sessionId:units[4]!.sessionId,epochId:units[4]!.epochId,
          q:referenceFields(["CRM-INP1","C03",randomUUID(),"true","true",
            "record-technical-probe",writeId,"synthetic-public"])},
      ];
      const before=(await admin<{generation:string;activity:string}[]>`
        select a.access_generation::text as generation,
          e.last_human_activity_at::text as activity
        from crm_private.crm_actors a join crm_private.crm_sessions s
          on s.actor_id=a.actor_id join crm_private.identification_epochs e
          on e.session_id=s.session_id
        where e.epoch_id=${units[4]!.epochId}::uuid`)[0]!;
      const blocker=connection("h0_006_bootstrap");
      const workers=cases.map(()=>connection("crm_h0_runtime"));
      let release!:()=>void;
      const held=new Promise<void>((resolve)=>{release=resolve;});
      let lockReady!:()=>void;
      const ready=new Promise<void>((resolve)=>{lockReady=resolve;});
      let holding:Promise<unknown>|undefined;
      const attempts:Promise<{op:string;accepted:boolean;code:string|null}>[]=[];
      try {
        holding=blocker.begin(async (tx) => {
          await tx`select actor_id from crm_private.crm_actors
            where actor_id=${actor}::uuid for update`;
          lockReady();
          await held;
        });
        await ready;
        const signals=cases.map((item,index) => {
          let signal!:(value:{pid:number;expires:bigint;txStart:bigint})=>void;
          const issued=new Promise<{pid:number;expires:bigint;txStart:bigint}>(
            (resolve)=>{signal=resolve;});
          const attempt=workers[index]!.begin(async (tx) => {
            await tx.unsafe("set local statement_timeout='45s'");
            const cap=await issueF2(tx,item.op,item.q,item.sessionId,item.epochId);
            const f1cap=(item.op==="C01"||item.op==="C03")
              ?technical(cap.binding,item.op,item.q):undefined;
            const txStart=(await tx<{at:string}[]>`select
              floor(extract(epoch from transaction_timestamp())*1000000)::bigint::text as at`
            )[0]!.at;
            signal({pid:Number(cap.binding.pid),expires:BigInt(cap.fields[23]!),
              txStart:BigInt(txStart)});
            if (item.op==="establish") await tx`
              select crm_api.establish_session(${cap.payload},${cap.mac},${item.q})`;
            else if (item.op==="reidentify") await tx`
              select crm_api.reidentify_session(${cap.payload},${cap.mac},${item.q})`;
            else if (item.op==="revoke_one") await tx`
              select crm_api.revoke_session(${cap.payload},${cap.mac},${item.q})`;
            else if (item.op==="revoke_all") await tx`
              select crm_api.revoke_all_sessions(${cap.payload},${cap.mac},${item.q})`;
            else if (item.op==="C01") await tx`
              select * from crm_api.human_read_probe(${cap.payload},${cap.mac},
                ${f1cap!.payload},${f1cap!.mac},${item.q})`;
            else await tx`select crm_api.human_apply_probe_batch(${cap.payload},${cap.mac},
              ${f1cap!.payload},${f1cap!.mac},${item.q})`;
          }).then(() => ({op:item.op,accepted:true,code:null}),
            (error:unknown) => ({op:item.op,accepted:false,
              code:(error as {code?:string}).code??"UNKNOWN"}));
          attempts.push(attempt);
          return issued;
        });
        const issued=await Promise.all(signals);
        assert.ok(issued.every((item)=>item.txStart<item.expires));
        let blocked=0;
        for (let tries=0;tries<100;tries++) {
          blocked=(await admin<{n:number}[]>`
            select count(*)::int as n from pg_stat_activity
            where pid=any(${issued.map((item)=>item.pid)}::int[])
              and cardinality(pg_blocking_pids(pid))>0`)[0]!.n;
          if (blocked===6) break;
          await new Promise((resolve)=>setTimeout(resolve,20));
        }
        assert.equal(blocked,6,"all six must reach the lock after initial F2 verify");
        const expiry=issued.reduce((latest,item)=>item.expires>latest?item.expires:latest,0n);
        await admin`select pg_sleep(greatest(0::double precision,
          (${expiry.toString()}::numeric-extract(epoch from clock_timestamp())*1000000)
          /1000000)+0.1)`;
        const clock=(await admin<{at:string;transaction_at:string}[]>`select
          floor(extract(epoch from clock_timestamp())*1000000)::bigint::text as at,
          floor(extract(epoch from transaction_timestamp())*1000000)::bigint::text
            as transaction_at`)[0]!;
        assert.ok(BigInt(clock.at)>expiry);
        release();
        await holding;
        const outcome=await Promise.all(attempts);
        assert.deepEqual(outcome.map((row)=>[row.op,row.accepted,row.code]),
          cases.map((row)=>[row.op,false,"42501"]));
        assert.equal((await admin`select count(*)::int as n from crm_private.crm_sessions
          where session_id=${newSession}::uuid`)[0]?.n,0);
        assert.equal((await admin`select count(*)::int as n
          from crm_private.identification_epochs where epoch_id in
            (${newEpoch}::uuid,${replacement}::uuid)`)[0]?.n,0);
        assert.equal((await admin`select current_epoch from crm_private.identification_epochs
          where epoch_id=${units[0]!.epochId}::uuid`)[0]?.current_epoch,true);
        assert.equal((await admin`select revoked_at from crm_private.crm_sessions
          where session_id=${units[1]!.sessionId}::uuid`)[0]?.revoked_at,null);
        assert.equal((await admin`select access_generation::text as generation
          from crm_private.crm_actors where actor_id=${actor}::uuid`)[0]?.generation,
          before.generation);
        assert.equal((await admin`select last_human_activity_at::text as activity
          from crm_private.identification_epochs
          where epoch_id=${units[4]!.epochId}::uuid`)[0]?.activity,before.activity);
        assert.equal((await admin`select count(*)::int as n from crm_private.access_probe
          where probe_id=${writeId}`)[0]?.n,0);
        t.diagnostic(JSON.stringify({f02SixBlocked:true,postLockClockAfterExpiry:true,
          sixDeniedWithoutPartialEffect:true}));
      } finally {
        release();
        await Promise.allSettled([holding,...attempts]);
      }
    });

    await run("R18 a short real lock wait may continue while F2 remains valid",async () => {
      const blocker=connection("h0_006_bootstrap");
      const worker=connection("crm_h0_runtime");
      let release!:()=>void,ready!:()=>void,issued!:()=>void;
      const held=new Promise<void>((resolve)=>{release=resolve;});
      const locked=new Promise<void>((resolve)=>{ready=resolve;});
      const prepared=new Promise<void>((resolve)=>{issued=resolve;});
      let holding:Promise<unknown>|undefined,attempt:Promise<unknown>|undefined;
      const sessionId=randomUUID(),epochId=randomUUID();
      const q=referenceFields(["CRM-F2-INP1","establish",subject,sessionId,epochId]);
      try {
        holding=blocker.begin(async (tx) => {
          await tx`select actor_id from crm_private.crm_actors
            where actor_id=${actor}::uuid for update`;
          ready();
          await held;
        });
        await locked;
        attempt=worker.begin(async (tx) => {
          const cap=await issueF2(tx,"establish",q,sessionId,epochId);
          issued();
          return tx`select crm_api.establish_session(${cap.payload},${cap.mac},${q}) as epoch`;
        });
        await prepared;
        await new Promise((resolve)=>setTimeout(resolve,200));
        release();
        await holding;
        const rows=await attempt as {epoch:string}[];
        assert.equal(rows[0]?.epoch,epochId);
        assert.equal((await admin`select count(*)::int as n from crm_private.crm_sessions
          where session_id=${sessionId}::uuid`)[0]?.n,1);
      } finally {
        release();
        await Promise.allSettled([holding,attempt]);
      }
    });

    await run("R18 F2 also expires while waiting on session and epoch locks",async () => {
      const guarded=await adapter.establish(await verifiedIdentity());
      const before=(await admin`select last_human_activity_at::text as at
        from crm_private.identification_epochs where epoch_id=${guarded.epochId}::uuid`)[0]?.at;
      for (const [table,id] of [
        ["crm_sessions",guarded.sessionId],
        ["identification_epochs",guarded.epochId],
      ] as const) {
        const blocker=connection("h0_006_bootstrap"),worker=connection("crm_h0_runtime");
        let release!:()=>void,ready!:()=>void,issued!:(value:{pid:number;expires:bigint})=>void;
        const held=new Promise<void>((resolve)=>{release=resolve;});
        const locked=new Promise<void>((resolve)=>{ready=resolve;});
        const prepared=new Promise<{pid:number;expires:bigint}>((resolve)=>{issued=resolve;});
        let holding:Promise<unknown>|undefined,attempt:Promise<unknown>|undefined;
        try {
          holding=blocker.begin(async (tx) => {
            await tx.unsafe(`select 1 from crm_private.${table} where
              ${table==="crm_sessions"?"session_id":"epoch_id"}=$1::uuid for update`,[id]);
            ready();
            await held;
          });
          await locked;
          attempt=worker.begin(async (tx) => {
            await tx.unsafe("set local statement_timeout='45s'");
            const cap=await issueF2(tx,"C01",readInput,guarded.sessionId,guarded.epochId);
            const f1cap=technical(cap.binding,"C01",readInput);
            issued({pid:Number(cap.binding.pid),expires:BigInt(cap.fields[23]!)});
            return tx`select * from crm_api.human_read_probe(
              ${cap.payload},${cap.mac},${f1cap.payload},${f1cap.mac},${readInput})`;
          });
          const preparedCap=await prepared;
          let blocked=false;
          for (let i=0;i<100;i++) {
            blocked=(await admin`select cardinality(pg_blocking_pids(
              ${preparedCap.pid}))>0 as waiting`)[0]?.waiting===true;
            if (blocked) break;
            await new Promise((resolve)=>setTimeout(resolve,20));
          }
          assert.equal(blocked,true,`${table} wait must be real`);
          await admin`select pg_sleep(greatest(0::double precision,
            (${preparedCap.expires.toString()}::numeric-
              extract(epoch from clock_timestamp())*1000000)/1000000)+0.1)`;
          assert.equal((await admin`select
            floor(extract(epoch from clock_timestamp())*1000000)::bigint>
              ${preparedCap.expires.toString()}::bigint as expired`)[0]?.expired,true);
          release();
          await holding;
          await assert.rejects(attempt,(error:unknown)=>(error as {code?:string}).code==="42501");
          assert.equal((await admin`select last_human_activity_at::text as at
            from crm_private.identification_epochs
            where epoch_id=${guarded.epochId}::uuid`)[0]?.at,before);
        } finally {
          release();
          await Promise.allSettled([holding,attempt]);
        }
      }
    });

    await run("R17 disable, recovery and enrollment deny; re-enable does not revive old generation",
      async () => {
      const old=await adapter.establish(await verifiedIdentity());
      const oldAuth=await verifiedIdentity(old.sessionId);
      assert.equal((await adapter.readCoreProbe(oldAuth,coreRead,"matrix-probe"))?.publicValue,
        "synthetic-public");
      const start=(await admin<{g:string}[]>`select access_generation::text as g
        from crm_private.crm_actors where actor_id=${actor}::uuid`)[0]!.g;
      await migration`select crm_api.set_actor_enabled(${actor}::uuid,false,'ready')`;
      assert.equal((await admin`select access_generation::text as g
        from crm_private.crm_actors where actor_id=${actor}::uuid`)[0]?.g,
        (BigInt(start)+1n).toString());
      assert.equal((await runtime`select * from crm_api.f2_lookup(
        ${subject}::uuid,${old.sessionId}::uuid)`).length,0);
      await assert.rejects(adapter.readCoreProbe(oldAuth,coreRead,"matrix-probe"),
        /F2_CORE_DENIED/);
      await migration`select crm_api.set_actor_enabled(${actor}::uuid,true,'ready')`;
      await assert.rejects(adapter.readCoreProbe(oldAuth,coreRead,"matrix-probe"),
        /F2_CORE_DENIED/);
      const current=await adapter.establish(await verifiedIdentity());
      const currentAuth=await verifiedIdentity(current.sessionId);
      assert.equal((await adapter.readCoreProbe(currentAuth,coreRead,"matrix-probe"))?.publicValue,
        "synthetic-public");
      for (const state of ["enrollment_required","recovery_in_progress",
        "reidentification_required"] as const) {
        await migration`select crm_api.set_actor_enabled(${actor}::uuid,true,${state})`;
        assert.equal((await runtime`select * from crm_api.f2_lookup_revoke_all_authority(
          ${subject}::uuid,${current.sessionId}::uuid)`).length,0);
        await assert.rejects(adapter.readCoreProbe(currentAuth,coreRead,"matrix-probe"),
          /F2_CORE_DENIED/);
      }
      await migration`select crm_api.set_actor_enabled(${actor}::uuid,true,'ready')`;
    });

    await run("R23 a committed global revocation stays effective after response loss",async () => {
      const prior=await adapter.establish(await verifiedIdentity());
      const priorAuth=await verifiedIdentity(prior.sessionId);
      const generation=(await admin<{g:string}[]>`select access_generation::text as g
        from crm_private.crm_actors where actor_id=${actor}::uuid`)[0]!.g;
      const prepared=await runtime.begin(async (tx) => {
        const cap=await issueF2(tx,"revoke_all",
          referenceFields(["CRM-F2-INP1","revoke_all",actor]),
          prior.sessionId,prior.epochId,subject,actor,generation);
        await tx`select crm_api.revoke_all_sessions(${cap.payload},${cap.mac},
          ${referenceFields(["CRM-F2-INP1","revoke_all",actor])})`;
        return {payload:cap.payload,mac:cap.mac};
      }); // COMMIT completed here; the result is intentionally discarded by the caller.
      assert.equal((await admin`select access_generation::text as g
        from crm_private.crm_actors where actor_id=${actor}::uuid`)[0]?.g,
        (BigInt(generation)+1n).toString());
      await assert.rejects(adapter.readCoreProbe(priorAuth,coreRead,"matrix-probe"),
        /F2_CORE_DENIED/);
      await assert.rejects(runtime.begin(async (tx) => {
        await tx`select crm_api.revoke_all_sessions(${prepared.payload},${prepared.mac},
          ${referenceFields(["CRM-F2-INP1","revoke_all",actor])})`;
      }),(error:unknown)=>(error as {code?:string}).code==="42501");
      assert.equal((await admin`select access_generation::text as g
        from crm_private.crm_actors where actor_id=${actor}::uuid`)[0]?.g,
        (BigInt(generation)+1n).toString());
      const canary="SECRET_CANARY_H0_006";
      await assert.rejects(adapter.readCoreProbe(priorAuth,coreRead,canary),
        (error:unknown) => (error as Error).message==="F2_CORE_DENIED"
          && !(error as Error).message.includes(canary));
    });

    await run("R16 revoke-one/global are scoped and generation overflow fails closed",async () => {
      const a=await adapter.establish(await verifiedIdentity());
      const b=await adapter.establish(await verifiedIdentity());
      const authA=await verifiedIdentity(a.sessionId);
      const authB=await verifiedIdentity(b.sessionId);
      await adapter.revokeOne(authA);
      await assert.rejects(adapter.readCoreProbe(authA,coreRead,"matrix-probe"),
        /F2_CORE_DENIED/);
      assert.equal((await adapter.readCoreProbe(authB,coreRead,"matrix-probe"))?.publicValue,
        "synthetic-public");
      const before=(await admin<{g:string}[]>`select access_generation::text as g
        from crm_private.crm_actors where actor_id=${actor}::uuid`)[0]!.g;
      assert.equal(await adapter.revokeAll(authB),(BigInt(before)+1n).toString());
      await assert.rejects(adapter.readCoreProbe(authB,coreRead,"matrix-probe"),
        /F2_CORE_DENIED/);
      const overflow=await adapter.establish(await verifiedIdentity());
      await admin`update crm_private.crm_actors
        set access_generation=9223372036854775807 where actor_id=${actor}::uuid`;
      await admin`update crm_private.crm_sessions
        set access_generation=9223372036854775807
        where session_id=${overflow.sessionId}::uuid`;
      await assert.rejects(adapter.revokeAll(await verifiedIdentity(overflow.sessionId)),
        /F2_REVOKE_DENIED/);
      assert.equal((await admin`select access_generation::text as g
        from crm_private.crm_actors where actor_id=${actor}::uuid`)[0]?.g,
        "9223372036854775807");
    });
  } finally {
    await Promise.allSettled(clients.map((sql)=>sql.end({timeout:1})));
    if (started) command("pg_ctl",["-D",data,"-m","fast","-w","stop"]);
    await rm(temporaryRoot,{recursive:true,force:true});
  }
});
