import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import postgres from "postgres";
import { verifyAuth } from "../../src/application/verified-auth.ts";
import { classifyServerEvent } from "../../src/application/verified-interaction.ts";
import { H0005PostgresAdapter } from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import { H0011PostgresAdapter, fingerprintHumanApprovalPart,
  type HumanApprovalMaterial } from "../../src/infrastructure/postgres/h0-011-adapter.ts";
import type { F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";
import type { F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";

// Independent expected: Plan 7.2 revalidates permissions before confirmation;
// D038 4/6/14 requires live F2 within the same material Core transaction.
// This file deliberately keeps the normative DENY assertion if the race commits.
const bin = process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root = resolve(import.meta.dirname, "../..");
const port = 55422;
const database = "crm_h0_012_independent";
let temp = ""; let socket = ""; let started = false;
let admin: postgres.Sql; let migration: postgres.Sql; let runtime: postgres.Sql;
let actorBlocker: postgres.Sql; let ledgerBlocker: postgres.Sql;
let f1: F1SigningConfiguration; let f2: F2SigningConfiguration;
let auth: Awaited<ReturnType<typeof verifyAuth>>;
let sessionId = ""; let runtimePid = 0;
const actor = randomUUID(); const subject = randomUUID();
const scope = "scope-h012-synthetic";
const interaction = classifyServerEvent("core-action");

function command(name: string, args: string[]) {
  const result = spawnSync(join(bin!, name), args, { encoding: "utf8", env: { ...process.env, LC_ALL: "C" } });
  assert.equal(result.status, 0, `${name}: ${result.stderr}`);
}
function connect(user: string, db = database) {
  return postgres({ host: socket, port, database: db, user, max: 1, prepare: false,
    connect_timeout: 3, onnotice: () => {} });
}
before(async () => {
  temp = await mkdtemp(join(tmpdir(), "crm-h012-independent-")); socket = join(temp, "socket");
  await mkdir(socket);
  command("initdb", ["-D", join(temp, "data"), "--username=h012_bootstrap", "--auth-local=trust",
    "--auth-host=scram-sha-256", "--no-locale", "--encoding=UTF8"]);
  command("pg_ctl", ["-D", join(temp, "data"), "-l", join(temp, "postgres.log"),
    "-o", `-k '${socket}' -h '' -p ${port}`, "-w", "start"]); started = true;
  admin = connect("h012_bootstrap", "postgres");
  const migrations = join(root, "supabase/migrations");
  await admin.unsafe(await readFile(join(migrations, "202609150000_h0_m01_roles.sql"), "utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end(); admin = connect("h012_bootstrap"); migration = connect("crm_h0_migration");
  const files = (await readdir(migrations)).filter((name) => name.endsWith(".sql")
    && name <= "202609270000_h0_m04_human_approval.sql").sort();
  for (const file of files) {
    if (file === "202609150000_h0_m01_roles.sql") continue;
    const authority = file.endsWith("_authorities.sql") ? admin : migration;
    await authority.unsafe(await readFile(join(migrations, file), "utf8"));
  }
  assert.equal((await admin`select current_setting('server_version_num') as v`)[0]!.v, "170011");
  f1 = { key: randomBytes(32), keyId: randomUUID(), audience: "h012-local",
    generation: randomUUID(), allowedPurposes: ["h0-005-human-bridge", "h0-011-human-approval"] };
  f2 = { key: randomBytes(32), keyId: randomUUID(), audience: "h012-local",
    generation: randomUUID(), allowedPurposes: ["full-identification", "core-human-access", "session-revocation"] };
  await migration`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f1.keyId},${Buffer.from(f1.key)},${f1.audience},${f1.generation},${f1.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},${f2.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`select crm_api.provision_actor_mapping(${actor}::uuid,${subject}::uuid,${scope})`;
  runtime = connect("crm_h0_runtime"); actorBlocker = connect("h012_bootstrap"); ledgerBlocker = connect("h012_bootstrap");
  runtimePid = (await runtime`select pg_backend_pid() as pid`)[0]!.pid as number;
  const verified = await verifyAuth({ verify: async () => ({ subject, passwordVerified: true, mfaVerified: true }) }, "synthetic-proof");
  const established = await new H0005PostgresAdapter(runtime, f1, f2).establish(verified);
  sessionId = established.sessionId;
  auth = await verifyAuth({ verify: async () => ({ subject, sessionId,
    passwordVerified: true, mfaVerified: true }) }, "synthetic-session-proof");
});
after(async () => {
  await Promise.allSettled([runtime?.end({ timeout: 1 }), actorBlocker?.end({ timeout: 1 }),
    ledgerBlocker?.end({ timeout: 1 }), migration?.end({ timeout: 1 }), admin?.end({ timeout: 1 })]);
  if (started) command("pg_ctl", ["-D", join(temp, "data"), "-m", "fast", "-w", "stop"]);
  if (temp.startsWith(join(tmpdir(), "crm-h012-independent-"))) await rm(temp, { recursive: true, force: true });
});

function fields(payload: Buffer): string[] {
  const out: string[] = []; let i = 0;
  while (i < payload.length) { const n = payload.readUInt32BE(i); i += 4;
    out.push(payload.subarray(i, i + n).toString("utf8")); i += n; }
  return out;
}
type Trace = { f2Issued?: bigint; f2Expiry?: bigint; f1Expiry?: bigint; m04Returned: boolean };
// Observe only existing driver calls; do not change payloads, SQL, clocks or results.
function observedClient(trace: Trace): postgres.Sql {
  return new Proxy(runtime, { get(target, key, receiver) {
    if (key !== "begin") return Reflect.get(target, key, receiver);
    return (options: string, work: (tx: postgres.TransactionSql) => Promise<unknown>) =>
      target.begin(options, (tx) => work(new Proxy(tx, {
        get(inner, property, rec) {
          if (property !== "unsafe") return Reflect.get(inner, property, rec);
          return async (query: string, args: Buffer[]) => {
            if (query.includes("crm_api.h0_m04_command")) {
              const f = fields(args[0]!); trace.f2Issued = BigInt(f[22]!); trace.f2Expiry = BigInt(f[23]!);
              const result = await inner.unsafe(query, args); trace.m04Returned = true; return result;
            }
            return inner.unsafe(query, args);
          };
        },
        apply(inner, thisArg, args: unknown[]) {
          const sql = args[0] as TemplateStringsArray;
          if (sql.join("").includes("crm_api.commit_internal_unit")) trace.f1Expiry = BigInt(fields(args[1] as Buffer)[19]!);
          return Reflect.apply(inner, thisArg, args);
        },
      }))) as unknown;
  } }) as postgres.Sql;
}
async function lock(sql: postgres.Sql, kind: "actor" | "ledger") {
  const deferred = () => {
    let resolve!: () => void; let reject!: (reason?: unknown) => void;
    const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
  };
  const ready = deferred(); const release = deferred();
  const task = sql.begin(async (tx) => {
    if (kind === "actor") await tx`select actor_id from crm_private.crm_actors where actor_id=${actor}::uuid for update`;
    else await tx`lock table crm_private.unit_roots in access exclusive mode`;
    ready.resolve(); await release.promise;
  });
  const done = Promise.resolve(task); void done.catch(ready.reject);
  await ready.promise;
  return async () => { release.resolve(); await done; };
}
async function waitBlocked(kind: "actor" | "ledger") {
  for (let i = 0; i < 200; i++) {
    const row = (await admin`select a.wait_event_type='Lock' and
      case when ${kind}='ledger' then exists(select 1 from pg_locks l where l.pid=a.pid
        and not l.granted and l.relation='crm_private.unit_roots'::regclass)
      else a.query like '%crm_api.h0_m04_command%' end blocked
      from pg_stat_activity a where a.pid=${runtimePid}`)[0];
    if (row?.blocked) return;
    await delay(25);
  }
  assert.fail(`real ${kind} lock wait was not observed`);
}
async function nowUs(): Promise<bigint> {
  return BigInt((await admin`select floor(extract(epoch from clock_timestamp())*1000000)::text as us`)[0]!.us as string);
}
function material(): HumanApprovalMaterial {
  return { action: "synthetic-send", contentVersion: "v1", content: "Synthetic H012 notice",
    recipient: { state: "value", value: "synthetic-recipient" }, amount: { state: "not-applicable" },
    conditions: { state: "not-applicable" }, scope, effect: "synthetic-effect",
    destination: { state: "value", value: "synthetic-target" }, parts: [{ partId: "part-a",
      action: "synthetic-send", contentVersion: "v1", content: "Synthetic H012 notice",
      recipient: { state: "value", value: "synthetic-recipient" }, amount: { state: "not-applicable" },
      conditions: { state: "not-applicable" }, scope, effect: "synthetic-effect" }] };
}
async function snapshot(id: string) {
  return (await admin`select
    (select count(*)::int from crm_ha.reservations where reservation_id=${id}) reservations,
    (select count(*)::int from crm_ha.events where event_id=${id}) events,
    (select count(*)::int from crm_ha.command_receipts where command_id=${id}) receipts,
    (select count(*)::int from crm_private.unit_operations where operation_id=${id}) operations,
    (select count(*)::int from crm_private.unit_roots where root_id=${`ha-${id}`}) roots,
    (select count(*)::int from crm_private.unit_attempts where operation_id=${id}) attempts,
    (select count(*)::int from crm_private.unit_history where operation_id=${id}) history,
    (select count(*)::int from crm_private.unit_results where operation_id=${id}) results,
    (select count(*)::int from crm_private.external_effect_records where operation_id=${id}) intents,
    (select count(*)::int from crm_ha.proposals where proposal_id=${`proposal-${id}`}) proposals,
    (select count(*)::int from crm_ha.decisions where decision_id=${`decision-${id}`}) decisions,
    (select last_human_activity_at::text from crm_private.identification_epochs
      where session_id=${sessionId}::uuid and current_epoch) activity`)[0]!;
}

async function race(id: string, mode: "short" | "both-expired" | "f2-only-expired") {
  const plain = new H0011PostgresAdapter(runtime, f1, f2); const m = material();
  const proposal = await plain.propose(auth, interaction, `proposal-${id}`, "ai", m);
  await plain.decide(auth, interaction, `decision-command-${id}`, proposal.proposalId,
    `decision-${id}`, "approved", "synthetic independent review", proposal.materialFingerprint);
  const beforeState = await snapshot(id);
  const trace: Trace = { m04Returned: false };
  const releaseActor = mode === "f2-only-expired" ? await lock(actorBlocker, "actor") : undefined;
  const releaseLedger = await lock(ledgerBlocker, "ledger");
  let actorReleased = false; let ledgerReleased = false;
  const pending = new H0011PostgresAdapter(observedClient(trace), f1, f2).reserve(auth, interaction, id,
    proposal.proposalId, `decision-${id}`, "part-a", proposal.materialFingerprint,
    fingerprintHumanApprovalPart(m.parts[0]!), m).then(() => ({ committed: true }),
      () => ({ committed: false }));
  let releasedAt = 0n; let ledgerBlockedAt = 0n;
  try {
    if (releaseActor) {
      await waitBlocked("actor"); await delay(3000);
      await releaseActor(); actorReleased = true;
    }
    await waitBlocked("ledger"); ledgerBlockedAt = await nowUs();
    assert.equal(trace.m04Returned, true, "M04 must already have returned before ledger wait");
    assert.ok(trace.f2Expiry && trace.f2Issued && trace.f1Expiry);
    assert.equal(trace.f2Expiry - trace.f2Issued, 30_000_000n, "real protocol window must stay 30s");
    const deadline = mode === "short" ? ledgerBlockedAt + 100_000n
      : (mode === "both-expired" ? trace.f1Expiry : trace.f2Expiry) + 250_000n;
    while (await nowUs() <= deadline) await delay(50);
    releasedAt = await nowUs();
    if (mode === "f2-only-expired") assert.ok(releasedAt < trace.f1Expiry, "F1 must still be live");
    await releaseLedger(); ledgerReleased = true;
  } finally {
    if (releaseActor && !actorReleased) await releaseActor();
    if (!ledgerReleased) await releaseLedger();
  }
  const outcome = await pending; const afterState = await snapshot(id);
  return { outcome, beforeState, afterState, facts: {
    m04ReturnedBeforeLedger: trace.m04Returned, realLedgerLockObserved: true,
    protocolWindowSeconds: Number((trace.f2Expiry! - trace.f2Issued!) / 1_000_000n),
    f2ExpiredAtRelease: releasedAt > trace.f2Expiry!, f1ExpiredAtRelease: releasedAt > trace.f1Expiry!,
    f2AgeMsAtRelease: Number((releasedAt - trace.f2Issued!) / 1000n),
    ledgerWaitMs: Number((releasedAt - ledgerBlockedAt) / 1000n),
    committed: outcome.committed, activityChanged: beforeState.activity !== afterState.activity,
    ...Object.fromEntries(Object.entries(afterState).filter(([key]) => key !== "activity")),
  } };
}

test("H0-012 R11 control: short real M02 ledger wait commits with live F2", async (t) => {
  const r = await race("h012-short", "short"); t.diagnostic(JSON.stringify(r.facts));
  assert.equal(r.facts.f2ExpiredAtRelease, false); assert.equal(r.outcome.committed, true);
  assert.equal(r.afterState.reservations, 1); assert.equal(r.afterState.history, 1); assert.equal(r.afterState.intents, 1);
});
test("H0-012 R11 control: M02 wait above 30s expires both capabilities and rolls back", async (t) => {
  const r = await race("h012-both-expired", "both-expired"); t.diagnostic(JSON.stringify(r.facts));
  assert.ok(r.facts.ledgerWaitMs > 30000); assert.equal(r.facts.f2ExpiredAtRelease, true);
  assert.equal(r.facts.f1ExpiredAtRelease, true); assert.equal(r.outcome.committed, false);
  assert.deepEqual(r.afterState, r.beforeState);
});
test("H0-012 R11: expired F2 must roll back M04 plus M02 even while later F1 remains live", async (t) => {
  const r = await race("h012-f2-expired", "f2-only-expired"); t.diagnostic(JSON.stringify(r.facts));
  assert.equal(r.facts.f2ExpiredAtRelease, true); assert.equal(r.facts.f1ExpiredAtRelease, false);
  assert.ok(r.facts.f2AgeMsAtRelease > 30000);
  assert.equal(r.outcome.committed, false, "H0-012-F01: expired human authority committed reservation and ledger");
  assert.deepEqual(r.afterState, r.beforeState, "DENY must preserve preparation but no new reservation/ledger/activity");
});
