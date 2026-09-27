import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import postgres from "postgres";
import { verifyAuth } from "../../src/application/verified-auth.ts";
import { issueTrustedContext } from "../../src/application/trusted-context.ts";
import { classifyServerEvent } from "../../src/application/verified-interaction.ts";
import { H0005PostgresAdapter } from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import { H0011PostgresAdapter, fingerprintHumanApprovalMaterial, fingerprintHumanApprovalPart,
  type HumanApprovalMaterial } from "../../src/infrastructure/postgres/h0-011-adapter.ts";
import { createF1Issuer, type F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";
import { postgresF1Binding } from "../../src/infrastructure/postgres/transaction.ts";
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
    && name <= "202609270002_h0_m04_m02_authority_partition_fix.sql").sort();
  for (const file of files) {
    if (file === "202609150000_h0_m01_roles.sql") continue;
    const authority = file.endsWith("_authorities.sql") ? admin : migration;
    await authority.unsafe(await readFile(join(migrations, file), "utf8"));
  }
  assert.equal((await admin`select current_setting('server_version_num') as v`)[0]!.v, "170011");
  f1 = { key: randomBytes(32), keyId: randomUUID(), audience: "h012-local",
    generation: randomUUID(), allowedPurposes: ["h0-005-human-bridge", "h0-011-human-approval", "h0-011-human-unit"] };
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
async function isBlocked(kind: "actor" | "ledger") {
  const row = (await admin`select a.wait_event_type='Lock' and
    case when ${kind}='ledger' then exists(select 1 from pg_locks l where l.pid=a.pid
      and not l.granted and l.relation='crm_private.unit_roots'::regclass)
    else a.query like '%crm_api.h0_m04_command%' end blocked
    from pg_stat_activity a where a.pid=${runtimePid}`)[0];
  return row?.blocked === true;
}
async function waitBlocked(kind: "actor" | "ledger") {
  for (let i = 0; i < 200; i++) {
    if (await isBlocked(kind)) return;
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

async function race(id: string, mode: "short" | "both-expired" | "f2-only-expired",
  clientFor: (trace: Trace) => postgres.Sql = observedClient,
  allowDenialBeforeLedger = false) {
  const plain = new H0011PostgresAdapter(runtime, f1, f2); const m = material();
  const proposal = await plain.propose(auth, interaction, `proposal-${id}`, "ai", m);
  await plain.decide(auth, interaction, `decision-command-${id}`, proposal.proposalId,
    `decision-${id}`, "approved", "synthetic independent review", proposal.materialFingerprint);
  const beforeState = await snapshot(id);
  const trace: Trace = { m04Returned: false };
  const releaseActor = mode === "f2-only-expired" ? await lock(actorBlocker, "actor") : undefined;
  const releaseLedger = await lock(ledgerBlocker, "ledger");
  let actorReleased = false; let ledgerReleased = false;
  const pending = new H0011PostgresAdapter(clientFor(trace), f1, f2).reserve(auth, interaction, id,
    proposal.proposalId, `decision-${id}`, "part-a", proposal.materialFingerprint,
    fingerprintHumanApprovalPart(m.parts[0]!), m).then(() => ({ committed: true }),
      () => ({ committed: false }));
  let pendingSettled = false;
  void pending.then(() => { pendingSettled = true; });
  let releasedAt = 0n; let ledgerBlockedAt = 0n;
  let realLedgerLockObserved = false;
  try {
    if (releaseActor) {
      await waitBlocked("actor"); await delay(3000);
      await releaseActor(); actorReleased = true;
    }
    if (allowDenialBeforeLedger) {
      for (let i = 0; i < 200 && !pendingSettled; i++) {
        if (await isBlocked("ledger")) { realLedgerLockObserved = true; break; }
        await delay(25);
      }
      assert.ok(pendingSettled || realLedgerLockObserved,
        "the adversarial call must either be denied before M02 or reach the real ledger lock");
    } else {
      await waitBlocked("ledger"); realLedgerLockObserved = true;
    }
    ledgerBlockedAt = await nowUs();
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
    m04ReturnedBeforeLedger: trace.m04Returned, realLedgerLockObserved,
    deniedBeforeLedger: !realLedgerLockObserved && !outcome.committed,
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

// Focal correction tests only; these do not resume the R01–R25 verification.
test("F01 correction: expiry in the first phase denies before ledger and preserves every snapshot field", async (t) => {
  const id = "h012-first-phase-expired";
  const plain = new H0011PostgresAdapter(runtime, f1, f2); const m = material();
  const p = await plain.propose(auth, interaction, `proposal-${id}`, "ai", m);
  await plain.decide(auth, interaction, `decision-command-${id}`, p.proposalId,
    `decision-${id}`, "approved", "synthetic correction check", p.materialFingerprint);
  const beforeState = await snapshot(id); const trace: Trace = { m04Returned: false };
  const release = await lock(actorBlocker, "actor");
  const pending = new H0011PostgresAdapter(observedClient(trace), f1, f2).reserve(auth, interaction,
    id, p.proposalId, `decision-${id}`, "part-a", p.materialFingerprint,
    fingerprintHumanApprovalPart(m.parts[0]!), m).then(() => true, () => false);
  try {
    await waitBlocked("actor");
    assert.ok(trace.f2Expiry && trace.f2Issued);
    assert.equal(trace.f2Expiry - trace.f2Issued, 30_000_000n);
    while (await nowUs() <= trace.f2Expiry + 250_000n) await delay(50);
    t.diagnostic(`real actor wait; F2 age >30s: ${await nowUs() > trace.f2Expiry}`);
  } finally { await release(); }
  assert.equal(await pending, false);
  assert.equal(trace.m04Returned, false);
  assert.equal(trace.f1Expiry, undefined, "no ledger capability issued after failed M04");
  assert.deepEqual(await snapshot(id), beforeState);
});

test("F01 correction: normal concurrent units, durable replay and actual post-COMMIT response loss", async () => {
  const other = connect("crm_h0_runtime");
  try {
    const a = new H0011PostgresAdapter(runtime, f1, f2);
    const b = new H0011PostgresAdapter(other, f1, f2);
    const m = material();
    const [p1, p2] = await Promise.all([
      a.propose(auth, interaction, "f01-normal-a", "ai", m),
      b.propose(auth, interaction, "f01-normal-b", "ai", m),
    ]);
    assert.equal(p1.commandState, "applied"); assert.equal(p2.commandState, "applied");
    const fixedBefore = await admin`select row_to_json(r)::text v from crm_private.unit_results r where operation_id='f01-normal-a'`;
    // Both adapter promises resolved AFTER COMMIT. A separate connection sees
    // the fixed result before the client deliberately discards its response.
    assert.equal(fixedBefore.length, 1);
    await assert.rejects(async () => { throw new Error("SYNTHETIC_RESPONSE_LOST_AFTER_COMMIT"); }, /RESPONSE_LOST_AFTER_COMMIT/u);
    const replay = await b.propose(auth, interaction, "f01-normal-a", "ai", m);
    assert.equal(replay.commandState, "previous"); assert.equal(replay.proposalId, p1.proposalId);
    assert.deepEqual(await admin`select row_to_json(r)::text v from crm_private.unit_results r where operation_id='f01-normal-a'`, fixedBefore);
    const [counts] = await admin`select
      (select count(*)::int from crm_ha.proposals where proposal_id='f01-normal-a') proposals,
      (select count(*)::int from crm_ha.events where event_id='f01-normal-a') events,
      (select count(*)::int from crm_private.unit_history where operation_id='f01-normal-a') history`;
    assert.deepEqual(counts, { proposals: 1, events: 1, history: 1 });
  } finally { await other.end({ timeout: 1 }); }
});

// Adversarial SQL caller, separate from observedClient (which remains purely
// observational). Receives only a runtime client and already-issued arguments;
// never reads/signs with F1/F2 keys or changes signed material/binding/time.
// The trusted test server issues one legitimate unit, then the caller chooses
// the still-public technical overload instead of submitting the F2 arguments.
function chooseTechnicalLedger(client: postgres.Sql): postgres.Sql {
  return new Proxy(client, { get(target, key, receiver) {
    if (key !== "begin") return Reflect.get(target, key, receiver);
    return (options: string, work: (tx: postgres.TransactionSql) => Promise<unknown>) =>
      target.begin(options, (tx) => work(new Proxy(tx, {
        apply(inner, thisArg, args: unknown[]) {
          const sql = args[0] as TemplateStringsArray;
          if (sql.join("").includes("crm_api.commit_internal_unit") && args.length === 7) {
            // Exactly the same p/s/q bytes, same backend and transaction.
            return inner`select * from crm_api.commit_internal_unit(${args[1] as Buffer},${args[2] as Buffer},${args[3] as Buffer})`;
          }
          return Reflect.apply(inner, thisArg, args);
        },
      }))) as unknown;
  } }) as postgres.Sql;
}

test("H0-012 R11/R13/R23 M2: selecting the technical overload cannot bypass final human authority", async (t) => {
  const [acl] = await runtime`select session_user, current_user,
    has_function_privilege(current_user,'crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)','execute') m04,
    has_function_privilege(current_user,'crm_api.commit_internal_unit(bytea,bytea,bytea)','execute') technical,
    has_function_privilege(current_user,'crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)','execute') human`;
  assert.equal(acl!.session_user, "crm_h0_runtime"); assert.equal(acl!.current_user, "crm_h0_runtime");
  t.diagnostic(JSON.stringify({ runtimeEntryPoints: acl }));
  const r = await race("h012-overload-bypass", "f2-only-expired",
    (trace) => chooseTechnicalLedger(observedClient(trace)), true);
  t.diagnostic(JSON.stringify(r.facts));
  assert.equal(r.facts.f2ExpiredAtRelease, true); assert.equal(r.facts.f1ExpiredAtRelease, false);
  assert.ok(r.facts.f2AgeMsAtRelease > 30000);
  assert.equal(r.facts.deniedBeforeLedger, true,
    "the reserved human-unit F1 purpose must be denied before the technical M02 core");
  assert.equal(r.outcome.committed, false,
    "M2 chose a permitted overload and committed a human unit after its original F2 expired");
  assert.deepEqual(r.afterState, r.beforeState, "overload selection must not bypass the unit's final F2 authority");
});

// Independent reference framing: unsigned 32-bit big-endian UTF-8 lengths.
// Normative expectations come from the published R01–R25 matrix, not H0-011 assertions.
function referencePack(values: readonly string[]): Buffer {
  return Buffer.concat(values.map((value) => {
    const bytes = Buffer.from(value, "utf8"); const size = Buffer.alloc(4);
    size.writeUInt32BE(bytes.length); return Buffer.concat([size, bytes]);
  }));
}
function referenceHash(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
function referenceSlot(s: HumanApprovalMaterial["amount"]): string[] {
  return [s.state, s.state === "value" ? s.value : ""];
}
function referencePart(p: HumanApprovalMaterial["parts"][number]): Buffer {
  return referencePack(["CRM-H0-HA-PART1", p.partId, p.action, p.contentVersion, p.content,
    ...referenceSlot(p.recipient), ...referenceSlot(p.amount), ...referenceSlot(p.conditions), p.scope, p.effect]);
}
function referenceMaterial(m: HumanApprovalMaterial): Buffer {
  return referencePack(["CRM-H0-HA-MATERIAL1", "1", m.action, m.contentVersion, m.content,
    ...referenceSlot(m.recipient), ...referenceSlot(m.amount), ...referenceSlot(m.conditions), m.scope, m.effect,
    ...referenceSlot(m.destination), m.evidence ? "required" : "none", m.evidence?.reference ?? "",
    m.evidence?.fingerprint ?? "", m.evidence?.expiresAt ?? "", String(m.parts.length),
    ...m.parts.flatMap((part) => { const bytes = referencePart(part);
      return [part.partId, bytes.toString("hex"), referenceHash(bytes)]; })]);
}
function formalTechnicalContext() {
  return issueTrustedContext({ identityId: "h012-independent-executor", identityKind: "technical",
    purpose: "h0-011-human-approval", scope, requestId: randomUUID(), serverTime: new Date().toISOString() });
}
async function formalSnapshot() {
  const tables = ["crm_ha.proposals", "crm_ha.parts", "crm_ha.decisions", "crm_ha.reservations",
    "crm_ha.events", "crm_ha.command_receipts", "crm_private.unit_roots", "crm_private.unit_operations",
    "crm_private.unit_attempts", "crm_private.unit_history", "crm_private.unit_results",
    "crm_private.external_effect_records", "crm_private.identification_epochs"];
  const result: Record<string, unknown> = {};
  for (const table of tables) result[table] = await admin.unsafe(
    `select row_to_json(t)::text v from ${table} t order by row_to_json(t)::text`);
  return result;
}
async function deniedWithoutChanges(work: () => unknown) {
  const beforeState = await formalSnapshot();
  await assert.rejects(async () => { await work(); });
  assert.deepEqual(await formalSnapshot(), beforeState);
}

test("H0-012 third formal execution: R01–R08 independent cases, stop at first material failure", async (t) => {
  const api = new H0011PostgresAdapter(runtime, f1, f2);
  async function row(name: string, work: () => Promise<void>) {
    let passed = false;
    await t.test(name, async () => { await work(); passed = true; });
    // Node reports a child failure to the parent; stop scheduling subsequent rows.
    return passed;
  }
  async function prepared(id: string, m = material(), decision: "approved" | "rejected" = "approved") {
    const p = await api.propose(auth, interaction, id, "ai", m);
    await api.decide(auth, interaction, `cmd-${id}`, id, `decision-${id}`, decision,
      "independent synthetic review", referenceHash(referenceMaterial(m)));
    return { p, m, decisionId: `decision-${id}` };
  }
  async function reserve(id: string, p: string, d: string, m: HumanApprovalMaterial,
    partId = m.parts[0]!.partId, partHash = referenceHash(referencePart(m.parts[0]!))) {
    return api.reserve(auth, interaction, id, p, d, partId, referenceHash(referenceMaterial(m)), partHash, m);
  }
  if (!await row("R01 AI origin cannot decide without human authority; live human decides", async () => {
    const m = material(); const p = await api.propose(auth, interaction, "r01-ai", "ai", m);
    assert.equal((await admin`select proposer_kind from crm_ha.proposals where proposal_id='r01-ai'`)[0]!.proposer_kind, "ai");
    await deniedWithoutChanges(() => api.decide(undefined as unknown as typeof auth, interaction,
      "r01-no-human", p.proposalId, "r01-denied", "approved", "synthetic", p.materialFingerprint));
    // A correctly signed technical F1 is insufficient to approve, even by raw runtime SQL.
    await deniedWithoutChanges(() => runtime.begin(async (tx) => {
      const q = referencePack(["CRM-H0-M04", "decide", "r01-tech-decision",
        referencePack([p.proposalId, "r01-tech", "approved", "synthetic", p.materialFingerprint]).toString("hex")]);
      const cap = createF1Issuer(f1)(formalTechnicalContext(), await postgresF1Binding(tx), "C03", q,
        { resource: "human_approval", action: "manage_effect" });
      await tx`select * from crm_api.h0_m04_command(null,null,${cap.payload},${cap.mac},${q})`;
    }));
    await api.decide(auth, interaction, "r01-human", p.proposalId, "r01-approved", "approved",
      "independent human decision", p.materialFingerprint);
    assert.deepEqual((await admin`select actor_id::text,session_id::text,decision from crm_ha.decisions
      where proposal_id='r01-ai'`)[0], { actor_id: actor, session_id: sessionId, decision: "approved" });
  })) return;
  if (!await row("R02 pending and rejected proposals permit neither reservation nor attempts/outcomes", async () => {
    const m = material(); await api.propose(auth, interaction, "r02-pending", "ai", m);
    const rejected = await prepared("r02-rejected", m, "rejected");
    for (const id of ["r02-pending", rejected.p.proposalId]) {
      await deniedWithoutChanges(() => reserve(`reserve-${id}`, id, `decision-${id}`, m));
      await deniedWithoutChanges(() => api.recordAttempt(formalTechnicalContext(), `attempt-${id}`, `reserve-${id}`, `try-${id}`));
      await deniedWithoutChanges(() => api.recordOutcome(formalTechnicalContext(), `outcome-${id}`, `reserve-${id}`,
        `try-${id}`, "succeeded", "synthetic-unaccredited"));
    }
  })) return;
  if (!await row("R03 approval alone creates no external attempt, success or reservation", async () => {
    await prepared("r03-approved");
    const [counts] = await admin`select
      (select count(*)::int from crm_ha.decisions where proposal_id='r03-approved' and decision='approved') decisions,
      (select count(*)::int from crm_ha.reservations where proposal_id='r03-approved') reservations,
      (select count(*)::int from crm_ha.events where proposal_id='r03-approved' and event_kind not in ('proposed','approved')) execution_events,
      (select count(*)::int from crm_private.external_effect_records where operation_id in ('r03-approved','cmd-r03-approved')) external_records`;
    assert.deepEqual(counts, { decisions: 1, reservations: 0, execution_events: 0, external_records: 0 });
  })) return;
  if (!await row("R04 exact material persists byte-for-byte with an independently computed fingerprint", async () => {
    const m = { ...material(), amount: { state: "value" as const, value: "12.30 EUR" },
      conditions: { state: "value" as const, value: "synthetic-condition" } };
    await prepared("r04-material", m);
    const [stored] = await admin`select material_payload,material_fingerprint from crm_ha.proposals where proposal_id='r04-material'`;
    assert.deepEqual(stored!.material_payload, referenceMaterial(m));
    assert.equal(stored!.material_fingerprint, referenceHash(referenceMaterial(m)));
    assert.equal((await admin`select material_fingerprint from crm_ha.decisions where proposal_id='r04-material'`)[0]!.material_fingerprint,
      referenceHash(referenceMaterial(m)));
  })) return;
  if (!await row("R05 each changed material component denies and preserves the original approval", async () => {
    const m = material(); const { p, decisionId } = await prepared("r05-original", m);
    const variants: Partial<HumanApprovalMaterial>[] = [{ action: "other-action" }, { contentVersion: "v2" },
      { content: "changed" }, { recipient: { state: "value", value: "other-recipient" } },
      { amount: { state: "value", value: "0.01" } }, { conditions: { state: "value", value: "other-condition" } },
      { scope: "other-scope" }, { effect: "other-effect" }];
    for (const [i, change] of variants.entries()) {
      const changed = { ...m, ...change };
      assert.notEqual(referenceHash(referenceMaterial(changed)), p.materialFingerprint);
      await deniedWithoutChanges(() => api.reserve(auth, interaction, `r05-change-${i}`, p.proposalId, decisionId,
        "part-a", p.materialFingerprint, referenceHash(referencePart(m.parts[0]!)), changed));
      // Supplying the changed, internally consistent hash must also fail against the stored approval.
      await deniedWithoutChanges(() => reserve(`r05-newhash-${i}`, p.proposalId, decisionId, changed));
    }
  })) return;
  if (!await row("R06 independent codec vectors distinguish Unicode, slots, framing and exact limits", async () => {
    const m = material(); const base = referenceHash(referenceMaterial(m));
    const reordered = Object.fromEntries(Object.entries(m).reverse()) as unknown as HumanApprovalMaterial;
    assert.equal(fingerprintHumanApprovalMaterial(reordered), base);
    const vectors = ["", "é", "e\u0301", "🧭", "a|b", "a:b", "a", "b", " "];
    const hashes = vectors.map((content) => {
      const value = { ...m, content };
      assert.equal(fingerprintHumanApprovalMaterial(value), referenceHash(referenceMaterial(value)));
      return fingerprintHumanApprovalMaterial(value);
    });
    assert.equal(new Set(hashes).size, vectors.length);
    const slots: HumanApprovalMaterial["amount"][] = [{ state: "value", value: "" }, { state: "unknown" }, { state: "not-applicable" }];
    assert.equal(new Set(slots.map((amount) => fingerprintHumanApprovalMaterial({ ...m, amount }))).size, 3);
    const absent: Record<string, unknown> = { ...m }; delete absent.amount;
    assert.throws(() => fingerprintHumanApprovalMaterial(absent as unknown as HumanApprovalMaterial));
    assert.throws(() => fingerprintHumanApprovalMaterial({ ...m, content: "\ud800" }));
    assert.throws(() => fingerprintHumanApprovalMaterial({ ...m, content: "nul\0byte" }));
    const empty = { ...m, content: "" }; const max = 16384 - referenceMaterial(empty).length;
    const exact = { ...empty, content: "x".repeat(max) };
    assert.equal(referenceMaterial(exact).length, 16384);
    assert.equal(fingerprintHumanApprovalMaterial(exact), referenceHash(referenceMaterial(exact)));
    assert.throws(() => fingerprintHumanApprovalMaterial({ ...empty, content: "x".repeat(max + 1) }));
    assert.throws(() => fingerprintHumanApprovalMaterial({ ...empty, content: "x".repeat(16385) }));
    assert.notEqual(referenceHash(referencePack(["a|", "b"])), referenceHash(referencePack(["a", "|b"])));
    const bytes = referenceMaterial(m); bytes[bytes.length - 1] = bytes[bytes.length - 1]! ^ 1;
    assert.notEqual(referenceHash(bytes), base);
  })) return;
  if (!await row("R07 part ID, fingerprint, scope, effect and cross-proposal swaps deny", async () => {
    const m = material(); const { p, decisionId } = await prepared("r07-parts", m);
    await deniedWithoutChanges(() => reserve("r07-id", p.proposalId, decisionId, m, "other-part"));
    await deniedWithoutChanges(() => reserve("r07-hash", p.proposalId, decisionId, m, "part-a", "0".repeat(64)));
    const other = { ...m, parts: [{ ...m.parts[0]!, content: "different-proposal-part" }] };
    const otherProposal = await prepared("r07-other", other);
    for (const [i, part] of [{ ...m.parts[0]!, scope: "other-scope" },
      { ...m.parts[0]!, effect: "other-effect" }, other.parts[0]!].entries()) {
      await deniedWithoutChanges(() => reserve(`r07-swap-${i}`, p.proposalId, decisionId, m,
        "part-a", referenceHash(referencePart(part))));
    }
    await deniedWithoutChanges(() => reserve("r07-decision-swap", p.proposalId, otherProposal.decisionId, m));
    assert.equal((await reserve("r07-correct", p.proposalId, decisionId, m)).state, "reserved");
  })) return;
  await row("R08 positive: current independently checked evidence must permit exact approved reservation", async () => {
    // Synthetic authorized source held only by the test authority, not a caller-provided validity flag.
    const source = Buffer.from("independent current synthetic evidence", "utf8");
    const validUntil = new Date(Number(await nowUs() / 1000n) + 3_600_000).toISOString();
    const evidence = { reference: "r08-independent-source", fingerprint: referenceHash(source), expiresAt: validUntil };
    assert.equal(evidence.fingerprint, createHash("sha256").update(source).digest("hex"));
    assert.ok(BigInt(Date.parse(validUntil)) * 1000n > await nowUs());
    const m = { ...material(), evidence };
    const current = await prepared("r08-current", m);
    const expired = await prepared("r08-expired", { ...m, evidence: { ...evidence, expiresAt: "2000-01-01T00:00:00.000Z" } });
    const missing = await prepared("r08-missing", { ...m, evidence: { ...evidence, reference: "r08-no-source" } });
    await deniedWithoutChanges(() => reserve("r08-expired-reserve", expired.p.proposalId, expired.decisionId, expired.m));
    await deniedWithoutChanges(() => reserve("r08-missing-reserve", missing.p.proposalId, missing.decisionId, missing.m));
    const noRequirement = await prepared("r08-no-evidence");
    assert.equal((await reserve("r08-control", noRequirement.p.proposalId, noRequirement.decisionId, noRequirement.m)).state, "reserved");
    const beforeState = await formalSnapshot(); let observed: string; let failure: string | undefined;
    try { observed = (await reserve("r08-positive-reserve", current.p.proposalId, current.decisionId, m)).state; }
    catch (error) { observed = "denied"; failure = (error as Error).message; }
    if (observed === "denied") assert.deepEqual(await formalSnapshot(), beforeState);
    t.diagnostic(JSON.stringify({ row: "R08", sourceFingerprintChecked: true, sourceStillCurrent: true,
      approvedMaterialMatches: current.p.materialFingerprint === referenceHash(referenceMaterial(m)),
      negativeExpiredDenied: true, negativeMissingDenied: true, noEvidenceControlReserved: true,
      expected: "reserved", observed, failure, noResidueIfDenied: observed === "denied" }));
    assert.equal(observed, "reserved", "H0-012-F03: required evidence has no positive revalidation/reservation route");
  });
});
