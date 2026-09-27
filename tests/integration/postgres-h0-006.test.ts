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
import { H0005PostgresAdapter } from "../../src/infrastructure/postgres/h0-005-adapter.ts";
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
