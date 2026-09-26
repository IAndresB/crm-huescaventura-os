import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
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
// Only historical migrations and the low-level F1 bootstrap are shared.
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
  } finally {
    await Promise.allSettled(clients.map((sql) => sql.end({ timeout: 1 })));
    if (started) command("pg_ctl", ["-D", data, "-m", "fast", "-w", "stop"]);
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
