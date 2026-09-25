import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import postgres from "postgres";
import { issueTrustedContext, type TrustedExecutionContext } from "../../src/application/trusted-context.ts";
import {
  H0009PostgresAdapter,
  type DurableTechnicalIntent,
} from "../../src/infrastructure/postgres/h0-009-adapter.ts";
import {
  createF1Issuer,
  encodeF1Fields,
  type F1Capability,
  type F1SigningConfiguration,
} from "../../src/infrastructure/postgres/f1-codec.ts";
import { postgresF1Binding } from "../../src/infrastructure/postgres/transaction.ts";

const postgresBin = process.env.POSTGRES_H0_BIN;
if (!postgresBin) throw new Error("POSTGRES_H0_BIN_REQUIRED");

const projectRoot = resolve(import.meta.dirname, "../..");
const databaseName = "crm_h0_010_test";
const socketPort = 55411;
let temporaryRoot = "";
let dataDirectory = "";
let socketDirectory = "";
let started = false;
let bootstrap: postgres.Sql;
let migration: postgres.Sql;
let runtimeA: postgres.Sql;
let runtimeB: postgres.Sql;
let config: F1SigningConfiguration;
let adapterA: H0009PostgresAdapter;
let adapterB: H0009PostgresAdapter;

function command(name: string, args: readonly string[]): void {
  const result = spawnSync(join(postgresBin!, name), args, {
    encoding: "utf8",
    env: { ...process.env, LC_ALL: "C" },
  });
  assert.equal(result.status, 0, `${name} failed`);
}

function connect(user: string, database = databaseName): postgres.Sql {
  return postgres({
    host: socketDirectory,
    port: socketPort,
    database,
    user,
    max: 1,
    prepare: false,
    connect_timeout: 2,
    idle_timeout: 2,
  });
}

function context(scope = "scope-h0-010", identityId = "technical-actor-h0-010", purpose = "h0-010-local-verification") {
  return issueTrustedContext({
    identityId,
    identityKind: "technical",
    purpose,
    scope,
    requestId: `request-${scope}-${identityId}`,
    serverTime: "2026-09-25T12:00:00.000Z",
  });
}

function intent(suffix: string, overrides: Partial<DurableTechnicalIntent> = {}): DurableTechnicalIntent {
  return {
    intentId: `intent-${suffix}`,
    effectId: `effect-${suffix}`,
    recipientReference: `synthetic-destination-${suffix}`,
    contentVersion: `synthetic-content-${suffix}-v1`,
    ...overrides,
  };
}

interface UnitInput {
  operationId: string;
  rootId: string;
  expectedVersion: string;
  afterValue: string;
  reason?: string;
  source?: string;
  intent?: DurableTechnicalIntent;
  evidenceState?: "none" | "candidate";
  happenedAt?: string;
}

function unit(input: UnitInput) {
  return {
    operationId: input.operationId,
    expectedVersion: input.expectedVersion,
    historyRequired: true as const,
    resultRequired: true as const,
    changes: [{
      kind: "set-technical-state" as const,
      rootId: input.rootId,
      afterValue: input.afterValue,
      reason: input.reason ?? "independent-normative-reason",
      source: input.source ?? "h0-010-verification",
      ...(input.happenedAt === undefined ? {} : { happenedAt: input.happenedAt }),
      evidenceState: input.evidenceState ?? "none",
    }],
    ...(input.intent === undefined ? {} : { intent: input.intent }),
  };
}

function referencePackFields(fields: readonly string[]): Buffer {
  const chunks: Buffer[] = [];
  let total = 0;
  for (const field of fields) {
    if (typeof field !== "string" || field.includes("\0")) throw new Error("REFERENCE_INVALID");
    const bytes = Buffer.from(field, "utf8");
    total += 4 + bytes.length;
    if (bytes.length > 16384 || total > 65536) throw new Error("REFERENCE_INVALID");
    const length = Buffer.alloc(4);
    length.writeUInt32BE(bytes.length);
    chunks.push(length, bytes);
  }
  return Buffer.concat(chunks);
}

function decodeFields(raw: Buffer): string[] {
  const fields: string[] = [];
  let position = 0;
  while (position < raw.length) {
    const length = raw.readUInt32BE(position);
    position += 4;
    fields.push(raw.subarray(position, position + length).toString("utf8"));
    position += length;
  }
  assert.equal(position, raw.length);
  return fields;
}

function rawUnitInput(
  trusted: TrustedExecutionContext,
  input: UnitInput,
  attemptId = randomUUID(),
): { bytes: Buffer; fingerprint: string } {
  const selectedIntent = input.intent;
  const intentFields = selectedIntent === undefined
    ? ["false", "", "", "", "", ""]
    : [
      "true",
      selectedIntent.effectId,
      selectedIntent.intentId,
      selectedIntent.recipientReference,
      selectedIntent.contentVersion,
      createHash("sha256").update(referencePackFields([
        "CRM-INTENT-MATERIAL1",
        selectedIntent.effectId,
        selectedIntent.recipientReference,
        selectedIntent.contentVersion,
      ])).digest("hex"),
    ];
  const material = referencePackFields([
    "CRM-UNIT-MATERIAL1",
    "technical-state-change",
    input.rootId,
    input.expectedVersion,
    input.afterValue,
    input.reason ?? "independent-normative-reason",
    input.source ?? "h0-010-verification",
    input.happenedAt ?? "",
    input.evidenceState ?? "none",
    trusted.identityId,
    trusted.identityKind,
    trusted.purpose,
    trusted.scope,
    ...intentFields,
  ]);
  const fingerprint = createHash("sha256").update(material).digest("hex");
  return {
    fingerprint,
    bytes: referencePackFields([
      "CRM-UNIT1",
      input.operationId,
      "technical-state-change",
      input.rootId,
      input.expectedVersion,
      fingerprint,
      attemptId,
      input.reason ?? "independent-normative-reason",
      input.source ?? "h0-010-verification",
      input.happenedAt ?? "",
      input.afterValue,
      input.evidenceState ?? "none",
      ...intentFields,
    ]),
  };
}

async function counts(operationId: string) {
  const rows = await bootstrap<{
    operations: string;
    attempts: string;
    history: string;
    results: string;
    effects: string;
  }[]>`
    select
      (select count(*)::text from crm_private.unit_operations where operation_id=${operationId}) operations,
      (select count(*)::text from crm_private.unit_attempts where operation_id=${operationId}) attempts,
      (select count(*)::text from crm_private.unit_history where operation_id=${operationId}) history,
      (select count(*)::text from crm_private.unit_results where operation_id=${operationId}) results,
      (select count(*)::text from crm_private.external_effect_records where operation_id=${operationId}) effects
  `;
  return rows[0]!;
}

async function expectE2(result: Awaited<ReturnType<H0009PostgresAdapter["commit"]>>): Promise<void> {
  assert.equal(result.status, "rejected");
  assert.equal(result.status === "rejected" ? result.issues[0]?.code : undefined, "E2");
}

async function denied(work: Promise<unknown>): Promise<void> {
  await assert.rejects(work, (error: unknown) => ["42501", "H0002"].includes((error as { code?: string }).code ?? ""));
}

async function residual(sql: postgres.Sql): Promise<Record<string, string | null>> {
  const rows = await sql<Record<string, string | null>[]>`
    select current_setting('crm.f1_payload',true) payload,
      current_setting('crm.f1_mac',true) mac,
      current_setting('crm.f1_input',true) input
  `;
  return rows[0]!;
}

function assertNoResidual(values: Record<string, string | null>): void {
  for (const value of Object.values(values)) assert.ok(value === null || value === "");
}

async function addFailureTrigger(table: string, operationId: string): Promise<() => Promise<void>> {
  const name = `${table.replaceAll("_", "")}${operationId.replaceAll("-", "")}`;
  await bootstrap.unsafe(`
    create function public.fail_${name}() returns trigger language plpgsql as $$
    begin
      if new.operation_id = '${operationId}' then raise exception 'SYNTHETIC_H0_010_FAILURE'; end if;
      return new;
    end $$;
    create trigger fail_${name} before insert on crm_private.${table}
      for each row execute function public.fail_${name}();
  `);
  return async () => {
    await bootstrap.unsafe(`
      drop trigger fail_${name} on crm_private.${table};
      drop function public.fail_${name}();
    `);
  };
}

before(async () => {
  temporaryRoot = await mkdtemp(join(tmpdir(), "crm-h0-010-"));
  dataDirectory = join(temporaryRoot, "data");
  socketDirectory = join(temporaryRoot, "socket");
  await mkdir(socketDirectory);
  command("initdb", [
    "-D", dataDirectory,
    "--username=bootstrap_h0_010",
    "--auth-local=trust",
    "--auth-host=scram-sha-256",
    "--no-locale",
    "--encoding=UTF8",
  ]);
  command("pg_ctl", [
    "-D", dataDirectory,
    "-l", join(temporaryRoot, "postgres.log"),
    "-o", `-k '${socketDirectory}' -h '' -p ${String(socketPort)}`,
    "-w", "start",
  ]);
  started = true;
  bootstrap = connect("bootstrap_h0_010", "postgres");
  await bootstrap.unsafe(await readFile(
    join(projectRoot, "supabase/migrations/202609150000_h0_m01_roles.sql"), "utf8",
  ));
  await bootstrap.unsafe(`create database ${databaseName} owner crm_h0_migration`);
  await bootstrap.end();
  bootstrap = connect("bootstrap_h0_010");
  migration = connect("crm_h0_migration");
  await migration.unsafe(await readFile(
    join(projectRoot, "supabase/migrations/202609150001_h0_m01_context.sql"), "utf8",
  ));
  await bootstrap`
    insert into crm_private.access_probe values (
      'h0-010-upgrade-probe','scope-h0-010','upgrade-preserved','private-synthetic'
    )
  `;
  await bootstrap.unsafe(await readFile(
    join(projectRoot, "supabase/migrations/202609160000_h0_f1_authorities.sql"), "utf8",
  ));
  await migration.unsafe(await readFile(
    join(projectRoot, "supabase/migrations/202609160001_h0_f1_capabilities.sql"), "utf8",
  ));
  config = {
    key: randomBytes(32),
    keyId: randomUUID(),
    audience: "h0-010-local-audience",
    generation: randomUUID(),
    allowedPurposes: ["h0-010-local-verification"],
  };
  await migration`
    insert into crm_f1.keys (key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values (${config.keyId},${Buffer.from(config.key)},${config.audience},${config.generation},
      ${config.allowedPurposes},true,clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')
  `;
  const result = spawnSync(join(postgresBin!, "psql"), [
    "-h", socketDirectory,
    "-p", String(socketPort),
    "-U", "crm_h0_migration",
    "-d", databaseName,
    "-v", "ON_ERROR_STOP=1",
    "-f", join(projectRoot, "supabase/migrations/202609250000_h0_m02_unit_history.sql"),
  ], { encoding: "utf8", env: { ...process.env, LC_ALL: "C" } });
  assert.equal(result.status, 0, result.stderr);
  runtimeA = connect("crm_h0_runtime");
  runtimeB = connect("crm_h0_runtime");
  adapterA = new H0009PostgresAdapter(runtimeA, config);
  adapterB = new H0009PostgresAdapter(runtimeB, config);
});

after(async () => {
  await Promise.allSettled([
    runtimeA?.end({ timeout: 1 }),
    runtimeB?.end({ timeout: 1 }),
    migration?.end({ timeout: 1 }),
    bootstrap?.end({ timeout: 1 }),
  ]);
  if (started) command("pg_ctl", ["-D", dataDirectory, "-m", "fast", "-w", "stop"]);
  if (temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot, { recursive: true, force: true });
});

test("H0-010 V-MIG starts from an empty PostgreSQL 17 cluster and preserves the F1 predecessor", async () => {
  const version = await bootstrap<{ version: string }[]>`select current_setting('server_version') version`;
  assert.match(version[0]!.version, /^17\./u);
  assert.deepEqual(Array.from(await bootstrap`
    select public_value from crm_private.access_probe where probe_id='h0-010-upgrade-probe'
  `), [{ public_value: "upgrade-preserved" }]);
  assert.equal((await bootstrap`
    select count(*)::integer count from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='crm_private' and c.relname in (
      'unit_roots','unit_operations','unit_attempts','unit_history','unit_results','external_effect_records'
    ) and c.relkind='r'
  `)[0].count, 6);
});

test("H0-010 history represents creation, later before/after and immutable chronology", async () => {
  const first = await adapterA.commit(context(), unit({
    operationId: "verify-history-create",
    rootId: "verify-history-root",
    expectedVersion: "0",
    afterValue: "estado-uno",
    reason: "creación-sintética-autorizada",
    source: "h0-010-independent-source",
    happenedAt: "2026-09-25T12:01:00.000Z",
    evidenceState: "candidate",
  }));
  assert.equal(first.status, "applied");
  const beforeSnapshot = await bootstrap`
    select * from crm_private.unit_history where operation_id='verify-history-create'
  `;
  assert.equal(beforeSnapshot[0].before_value, null);
  assert.deepEqual({
    after: beforeSnapshot[0].after_value,
    reason: beforeSnapshot[0].reason,
    source: beforeSnapshot[0].source,
    actor: beforeSnapshot[0].actor_id,
    kind: beforeSnapshot[0].actor_kind,
    evidence: beforeSnapshot[0].evidence_state,
    happened: beforeSnapshot[0].happened_at.toISOString(),
    recorded: beforeSnapshot[0].recorded_at instanceof Date,
  }, {
    after: "estado-uno",
    reason: "creación-sintética-autorizada",
    source: "h0-010-independent-source",
    actor: "technical-actor-h0-010",
    kind: "technical",
    evidence: "candidate",
    happened: "2026-09-25T12:01:00.000Z",
    recorded: true,
  });
  assert.equal((await adapterA.commit(context(), unit({
    operationId: "verify-history-update",
    rootId: "verify-history-root",
    expectedVersion: "1",
    afterValue: "estado-dos",
    reason: "corrección-añadida",
  }))).status, "applied");
  const history = await bootstrap`
    select operation_id,before_value,after_value,reason from crm_private.unit_history
    where root_id='verify-history-root' order by recorded_at,operation_id
  `;
  assert.deepEqual(Array.from(history), [
    {
      operation_id: "verify-history-create",
      before_value: null,
      after_value: "estado-uno",
      reason: "creación-sintética-autorizada",
    },
    {
      operation_id: "verify-history-update",
      before_value: "estado-uno",
      after_value: "estado-dos",
      reason: "corrección-añadida",
    },
  ]);
  assert.deepEqual(beforeSnapshot[0], (await bootstrap`
    select * from crm_private.unit_history where operation_id='verify-history-create'
  `)[0]);
  assert.deepEqual((await bootstrap`
    select version,current_value from crm_private.unit_roots where root_id='verify-history-root'
  `)[0], { version: "2", current_value: "estado-dos" });
});

test("H0-010 equivalent replay after a later root change returns the historical fixed result", async () => {
  const original = unit({
    operationId: "verify-replay-historical",
    rootId: "verify-replay-root",
    expectedVersion: "0",
    afterValue: "versión-original",
    intent: intent("replay-historical"),
  });
  const applied = await adapterA.commit(context(), original);
  assert.equal(applied.status, "applied");
  assert.equal((await adapterA.commit(context(), unit({
    operationId: "verify-replay-later-change",
    rootId: "verify-replay-root",
    expectedVersion: "1",
    afterValue: "versión-posterior",
  }))).status, "applied");
  const replay = await adapterB.commit(context(), original);
  assert.equal(replay.status, "previous");
  if (applied.status === "applied" && replay.status === "previous") assert.deepEqual(replay.value, applied.value);
  assert.deepEqual(await counts("verify-replay-historical"), {
    operations: "1", attempts: "2", history: "1", results: "1", effects: "1",
  });
  assert.deepEqual((await bootstrap`
    select version,current_value from crm_private.unit_roots where root_id='verify-replay-root'
  `)[0], { version: "2", current_value: "versión-posterior" });
});

test("H0-010 every material field change conflicts instead of reusing the prior result", async () => {
  const originalContext = context("scope-material", "actor-material");
  const base: UnitInput = {
    operationId: "verify-material-conflicts",
    rootId: "verify-material-root",
    expectedVersion: "0",
    afterValue: "material-original",
    reason: "reason-original",
    source: "source-original",
    happenedAt: "2026-09-25T12:02:00.000Z",
    evidenceState: "candidate",
    intent: intent("material-original"),
  };
  assert.equal((await adapterA.commit(originalContext, unit(base))).status, "applied");
  const changes: Array<[TrustedExecutionContext, UnitInput]> = [
    [originalContext, { ...base, rootId: "verify-material-other-root" }],
    [originalContext, { ...base, expectedVersion: "1" }],
    [originalContext, { ...base, afterValue: "material-altered" }],
    [originalContext, { ...base, reason: "reason-altered" }],
    [originalContext, { ...base, source: "source-altered" }],
    [originalContext, { ...base, happenedAt: "2026-09-25T12:02:01.000Z" }],
    [originalContext, { ...base, evidenceState: "none" }],
    [context("scope-material", "actor-material-other"), base],
    [context("scope-material", "actor-material", "other-approved-purpose"), base],
    [context("scope-material-other", "actor-material"), base],
    [originalContext, { ...base, intent: undefined }],
    [originalContext, { ...base, intent: intent("material-original", { effectId: "effect-material-other" }) }],
    [originalContext, { ...base, intent: intent("material-original", { intentId: "intent-material-other" }) }],
    [originalContext, { ...base, intent: intent("material-original", { recipientReference: "destination-other" }) }],
    [originalContext, { ...base, intent: intent("material-original", { contentVersion: "content-other-v2" }) }],
  ];
  for (const [trusted, changed] of changes) {
    if (trusted.purpose === "other-approved-purpose") {
      await assert.rejects(adapterA.commit(trusted, unit(changed)));
    } else {
      await expectE2(await adapterA.commit(trusted, unit(changed)));
    }
  }
  const humanContext = issueTrustedContext({
    identityId: "actor-material",
    identityKind: "human",
    purpose: "h0-010-local-verification",
    scope: "scope-material",
    requestId: "request-human-context",
    serverTime: "2026-09-25T12:00:00.000Z",
  });
  await assert.rejects(adapterA.commit(humanContext, unit(base)));
  assert.deepEqual(await counts(base.operationId), {
    operations: "1", attempts: "1", history: "1", results: "1", effects: "1",
  });
});

test("H0-010 visually similar byte-distinct Unicode and boundary inputs are not conflated", async () => {
  const composed = "café";
  const decomposed = "cafe\u0301";
  assert.notDeepEqual(Buffer.from(composed), Buffer.from(decomposed));
  const base = {
    operationId: "verify-unicode-material",
    rootId: "verify-unicode-root",
    expectedVersion: "0",
    afterValue: composed,
  };
  assert.equal((await adapterA.commit(context(), unit(base))).status, "applied");
  await expectE2(await adapterA.commit(context(), unit({ ...base, afterValue: decomposed })));
  assert.equal((await adapterA.commit(context(), unit({
    operationId: "verify-string-limit",
    rootId: "verify-string-limit-root",
    expectedVersion: "0",
    afterValue: "a".repeat(16384),
  }))).status, "applied");
  await assert.rejects(adapterA.commit(context(), unit({
    operationId: "verify-string-too-long",
    rootId: "verify-string-too-long-root",
    expectedVersion: "0",
    afterValue: "a".repeat(16385),
  })));
  for (const field of ["operationId", "rootId", "afterValue", "reason", "source"] as const) {
    const candidate = {
      operationId: "verify-empty-field",
      rootId: "verify-empty-field-root",
      expectedVersion: "0",
      afterValue: "value",
      reason: "reason",
      source: "source",
      [field]: "",
    };
    await assert.rejects(adapterA.commit(context(), unit(candidate)));
  }
});

test("H0-010 SQL pack_fields is byte-for-byte equal to an independent reference codec", async () => {
  const cases = [
    ["a"],
    ["ASCII", "prefix-common-a", ""],
    ["áéíóú", "漢字", "🙂"],
    ["é", "e\u0301"],
    ["x".repeat(16383), "y"],
    ["a".repeat(16000), "b".repeat(16000), "c".repeat(16000), "d".repeat(16000)],
  ];
  for (const fields of cases) {
    const rows = await bootstrap<{ encoded: string }[]>`
      select encode(crm_f1.pack_fields(${fields}::text[]),'hex') encoded
    `;
    assert.equal(rows[0]!.encoded, referencePackFields(fields).toString("hex"));
    assert.equal(encodeF1Fields(fields).toString("hex"), referencePackFields(fields).toString("hex"));
  }
  await assert.rejects(bootstrap`select crm_f1.pack_fields(${["x".repeat(16385)]}::text[])`);
  await assert.rejects(bootstrap`select crm_f1.pack_fields(${[
    "a".repeat(16384), "b".repeat(16384), "c".repeat(16384), "d".repeat(16384),
  ]}::text[])`);
  await assert.rejects(bootstrap.unsafe("select crm_f1.pack_fields(array[convert_from(decode('00','hex'),'UTF8')])"));
  assert.throws(() => referencePackFields(["contains\0nul"]));
});

test("H0-010 distinct operation/effect/intent identities cannot mint a second material right", async () => {
  assert.equal((await adapterA.commit(context(), unit({
    operationId: "verify-identity-first",
    rootId: "verify-identity-first-root",
    expectedVersion: "0",
    afterValue: "first",
    intent: intent("shared-identity"),
  }))).status, "applied");
  await expectE2(await adapterA.commit(context(), unit({
    operationId: "verify-identity-effect-conflict",
    rootId: "verify-identity-effect-root",
    expectedVersion: "0",
    afterValue: "second",
    intent: intent("different-intent", { effectId: "effect-shared-identity" }),
  })));
  await expectE2(await adapterA.commit(context(), unit({
    operationId: "verify-identity-intent-conflict",
    rootId: "verify-identity-intent-root",
    expectedVersion: "0",
    afterValue: "third",
    intent: intent("shared-identity", { effectId: "effect-different" }),
  })));
  assert.deepEqual(await counts("verify-identity-effect-conflict"), {
    operations: "0", attempts: "0", history: "0", results: "0", effects: "0",
  });
  assert.deepEqual(await counts("verify-identity-intent-conflict"), {
    operations: "0", attempts: "0", history: "0", results: "0", effects: "0",
  });
});

test("H0-010 concurrent equivalent operation converges, with one effect and distinct attempts", async () => {
  const request = unit({
    operationId: "verify-concurrent-equivalent",
    rootId: "verify-concurrent-equivalent-root",
    expectedVersion: "0",
    afterValue: "converged-value",
    intent: intent("concurrent-equivalent"),
  });
  const results = await Promise.all([
    adapterA.commit(context(), request),
    adapterB.commit(context(), request),
  ]);
  assert.deepEqual(results.map(({ status }) => status).sort(), ["applied", "previous"]);
  const values = results.flatMap((result) => result.status === "applied" || result.status === "previous" ? [result.value] : []);
  assert.deepEqual(values[0], values[1]);
  assert.deepEqual(await counts("verify-concurrent-equivalent"), {
    operations: "1", attempts: "2", history: "1", results: "1", effects: "1",
  });
  const attempts = await bootstrap<{ attempt_id: string }[]>`
    select attempt_id from crm_private.unit_attempts where operation_id='verify-concurrent-equivalent'
  `;
  assert.equal(new Set(attempts.map(({ attempt_id }) => attempt_id)).size, 2);
});

test("H0-010 concurrent different material under one operation identity applies once and returns E2", async () => {
  const common = {
    operationId: "verify-concurrent-material-conflict",
    rootId: "verify-concurrent-material-root",
    expectedVersion: "0",
  };
  const results = await Promise.all([
    adapterA.commit(context(), unit({ ...common, afterValue: "left" })),
    adapterB.commit(context(), unit({ ...common, afterValue: "right" })),
  ]);
  assert.deepEqual(results.map(({ status }) => status).sort(), ["applied", "rejected"]);
  await expectE2(results.find(({ status }) => status === "rejected")!);
  assert.deepEqual(await counts(common.operationId), {
    operations: "1", attempts: "1", history: "1", results: "1", effects: "0",
  });
});

test("H0-010 concurrent different operations on one expected version prevent lost update", async () => {
  assert.equal((await adapterA.commit(context(), unit({
    operationId: "verify-root-seed",
    rootId: "verify-shared-root",
    expectedVersion: "0",
    afterValue: "v1",
  }))).status, "applied");
  const results = await Promise.all([
    adapterA.commit(context(), unit({
      operationId: "verify-root-left", rootId: "verify-shared-root", expectedVersion: "1", afterValue: "left-v2",
    })),
    adapterB.commit(context(), unit({
      operationId: "verify-root-right", rootId: "verify-shared-root", expectedVersion: "1", afterValue: "right-v2",
    })),
  ]);
  assert.deepEqual(results.map(({ status }) => status).sort(), ["applied", "rejected"]);
  const root = (await bootstrap`
    select version,current_value from crm_private.unit_roots where root_id='verify-shared-root'
  `)[0];
  assert.equal(root.version, "2");
  assert.ok(["left-v2", "right-v2"].includes(root.current_value));
  assert.equal((await bootstrap`
    select count(*)::integer count from crm_private.unit_history where root_id='verify-shared-root'
  `)[0].count, 2);
  await expectE2(await adapterA.commit(context(), unit({
    operationId: "verify-root-stale-afterward",
    rootId: "verify-shared-root",
    expectedVersion: "1",
    afterValue: "forbidden-overwrite",
  })));
});

test("H0-010 failures at every C03 boundary commit no partial root, operation, attempt, history, result or intent", async () => {
  await assert.rejects(adapterA.commit(context(), unit({
    operationId: "verify-fail-before-mutation",
    rootId: "verify-fail-before-mutation-root",
    expectedVersion: "0",
    afterValue: "",
  })));
  const boundaries = [
    ["unit_operations", "verify-fail-before-operation", false],
    ["unit_history", "verify-fail-after-mutation", false],
    ["unit_results", "verify-fail-after-history", false],
    ["external_effect_records", "verify-fail-after-result", true],
  ] as const;
  for (const [table, operationId, withIntent] of boundaries) {
    const remove = await addFailureTrigger(table, operationId);
    try {
      await assert.rejects(adapterA.commit(context(), unit({
        operationId,
        rootId: `${operationId}-root`,
        expectedVersion: "0",
        afterValue: "must-not-survive",
        ...(withIntent ? { intent: intent(operationId) } : {}),
      })));
    } finally {
      await remove();
    }
    assert.deepEqual(await counts(operationId), {
      operations: "0", attempts: "0", history: "0", results: "0", effects: "0",
    });
    assert.equal((await bootstrap`
      select count(*)::integer count from crm_private.unit_roots where root_id=${`${operationId}-root`}
    `)[0].count, 0);
  }

  const connection = connect("crm_h0_runtime");
  const proxy = new Proxy(connection, {
    get(target, property) {
      if (property !== "begin") return Reflect.get(target, property);
      return (options: string, work: (tx: postgres.TransactionSql) => Promise<unknown>) => target.begin(
        options,
        async (tx) => {
          await work(tx);
          throw new Error("SYNTHETIC_LOSS_BEFORE_COMMIT");
        },
      );
    },
  });
  try {
    const result = await new H0009PostgresAdapter(proxy, config).commit(context(), unit({
      operationId: "verify-fail-after-intent",
      rootId: "verify-fail-after-intent-root",
      expectedVersion: "0",
      afterValue: "must-not-survive",
      intent: intent("fail-after-intent"),
    }));
    assert.equal(result.status, "pending");
  } finally {
    await connection.end({ timeout: 1 });
  }
  assert.deepEqual(await counts("verify-fail-after-intent"), {
    operations: "0", attempts: "0", history: "0", results: "0", effects: "0",
  });
});

test("H0-010 a real post-COMMIT response loss is recovered only by a newly authorized transaction", async () => {
  const connection = connect("crm_h0_runtime");
  const proxy = new Proxy(connection, {
    get(target, property) {
      if (property !== "begin") return Reflect.get(target, property);
      return async (options: string, work: (tx: postgres.TransactionSql) => Promise<unknown>) => {
        await target.begin(options, work);
        throw new Error("SYNTHETIC_RESPONSE_NOT_OBSERVED_AFTER_REAL_COMMIT");
      };
    },
  });
  const request = unit({
    operationId: "verify-post-commit-loss",
    rootId: "verify-post-commit-loss-root",
    expectedVersion: "0",
    afterValue: "durably-committed",
    intent: intent("post-commit-loss"),
  });
  try {
    const unknown = await new H0009PostgresAdapter(proxy, config).commit(context(), request);
    assert.equal(unknown.status, "pending");
    assert.equal(unknown.status === "pending" ? unknown.issues[0]?.code : undefined, "E4");
  } finally {
    await connection.end({ timeout: 1 });
  }
  assert.deepEqual(await counts("verify-post-commit-loss"), {
    operations: "1", attempts: "1", history: "1", results: "1", effects: "1",
  });
  await expectE2(await adapterA.commit(context("scope-not-authorized"), request));
  assert.deepEqual(await counts("verify-post-commit-loss"), {
    operations: "1", attempts: "1", history: "1", results: "1", effects: "1",
  });
  const recovered = await adapterB.commit(context(), request);
  assert.equal(recovered.status, "previous");
  assert.deepEqual(await counts("verify-post-commit-loss"), {
    operations: "1", attempts: "2", history: "1", results: "1", effects: "1",
  });
});

test("H0-010 C04 candidate is not verification and C05 creates intent only", async () => {
  assert.equal((await adapterA.commit(context(), unit({
    operationId: "verify-c04-c05",
    rootId: "verify-c04-c05-root",
    expectedVersion: "0",
    afterValue: "candidate-does-not-confirm",
    evidenceState: "candidate",
    intent: intent("c04-c05"),
  }))).status, "applied");
  assert.deepEqual((await bootstrap`
    select evidence_state from crm_private.unit_history where operation_id='verify-c04-c05'
  `)[0], { evidence_state: "candidate" });
  assert.deepEqual(Array.from(await bootstrap`
    select stage,attempt_id,outcome,result_reference from crm_private.external_effect_records
    where operation_id='verify-c04-c05'
  `), [{ stage: "intent", attempt_id: null, outcome: null, result_reference: null }]);
  assert.equal((await bootstrap`
    select count(*)::integer count from crm_private.external_effect_records
    where operation_id='verify-c04-c05' and stage in ('attempt','result','uncertain')
  `)[0].count, 0);
});

test("H0-010 runtime cannot create provider attempt/result/uncertain or mutate durable records directly", async () => {
  const statements = [
    "select * from crm_private.unit_history",
    "update crm_private.unit_history set after_value='forged'",
    "delete from crm_private.unit_history",
    "update crm_private.unit_results set after_value='forged'",
    "delete from crm_private.unit_results",
    "update crm_private.unit_operations set material_fingerprint=repeat('0',64)",
    "update crm_private.unit_operations set effect_id='forged'",
    "update crm_private.unit_operations set intent_id='forged'",
    "delete from crm_private.unit_operations",
    "insert into crm_private.unit_attempts values ('forged','verify-c04-c05','verify-c04-c05-root','scope-h0-010','replay',clock_timestamp())",
    "insert into crm_private.external_effect_records(record_id,operation_id,root_id,context_scope,effect_id,stage,intent_id,attempt_id,recorded_at) values ('forged','verify-c04-c05','verify-c04-c05-root','scope-h0-010','effect-c04-c05','attempt','intent-c04-c05','forged',clock_timestamp())",
    "update crm_private.external_effect_records set stage='result'",
    "delete from crm_private.external_effect_records",
    "update crm_private.unit_roots set current_value='forged'",
  ];
  for (const statement of statements) {
    await assert.rejects(runtimeA.unsafe(statement), (error: unknown) => (error as { code?: string }).code === "42501");
  }
});

test("H0-010 H0-M02 rejects forged GUCs and binds valid capabilities to input, transaction, PID and target", async () => {
  const issuer = createF1Issuer(config);
  const trusted = context("scope-f1-attacks", "actor-f1-attacks");
  let captured: { capability: F1Capability; input: Buffer } | undefined;
  await runtimeA.begin("isolation level read committed", async (tx) => {
    const raw = rawUnitInput(trusted, {
      operationId: "verify-f1-valid",
      rootId: "verify-f1-valid-root",
      expectedVersion: "0",
      afterValue: "authorized",
    });
    const binding = await postgresF1Binding(tx);
    const capability = issuer(trusted, binding, "C03", raw.bytes, {
      resource: "internal_unit",
      action: "commit_internal_unit",
    });
    await tx`select set_config('crm.f1_payload','00',true),set_config('crm.f1_mac','00',true),set_config('crm.f1_input','00',true)`;
    await denied(tx.savepoint((sp) => sp`select * from crm_private.unit_results`));
    await denied(tx.savepoint((sp) => sp`
      select * from crm_api.commit_internal_unit(${capability.payload},${randomBytes(32)},${raw.bytes})
    `));
    const changedInput = Buffer.from(raw.bytes);
    changedInput[changedInput.length - 1] ^= 1;
    await denied(tx.savepoint((sp) => sp`
      select * from crm_api.commit_internal_unit(${capability.payload},${capability.mac},${changedInput})
    `));
    const alteredFields = decodeFields(capability.payload);
    alteredFields[13] = "scope-altered";
    const alteredPayload = referencePackFields(alteredFields);
    await denied(tx.savepoint((sp) => sp`
      select * from crm_api.commit_internal_unit(${alteredPayload},${capability.mac},${raw.bytes})
    `));
    const accessInput = referencePackFields(["CRM-INP1", "C03", "probe", "true", "true", "record-technical-probe", "x", "y"]);
    const accessCapability = issuer(trusted, binding, "C03", accessInput, {
      resource: "access_probe",
      action: "apply_probe_batch",
    });
    await denied(tx.savepoint((sp) => sp`
      select * from crm_api.commit_internal_unit(${accessCapability.payload},${accessCapability.mac},${accessInput})
    `));
    const readInput = referencePackFields(["CRM-INP1", "C01", "x"]);
    const readCapability = issuer(trusted, binding, "C01", readInput, {
      resource: "access_probe",
      action: "read_probe",
    });
    await denied(tx.savepoint((sp) => sp`
      select * from crm_api.commit_internal_unit(${readCapability.payload},${readCapability.mac},${readInput})
    `));
    const expiredFields = [
      "CRM-H0F1", "1", config.keyId, config.audience, config.generation,
      binding.database, binding.start, binding.xid, binding.pid, binding.login,
      trusted.identityId, trusted.identityKind, trusted.purpose, trusted.scope,
      "C03", "internal_unit", "commit_internal_unit",
      createHash("sha256").update(raw.bytes).digest("hex"),
      (BigInt(binding.now) - 60_000_000n).toString(),
      (BigInt(binding.now) - 30_000_000n).toString(),
      randomUUID(),
    ];
    const expiredPayload = referencePackFields(expiredFields);
    const expiredMac = createHmac("sha256", config.key).update(expiredPayload).digest();
    await denied(tx.savepoint((sp) => sp`
      select * from crm_api.commit_internal_unit(${expiredPayload},${expiredMac},${raw.bytes})
    `));
    const applied = await tx`
      select * from crm_api.commit_internal_unit(${capability.payload},${capability.mac},${raw.bytes})
    `;
    assert.equal(applied[0].replayed, false);
    await denied(tx.savepoint((sp) => sp`
      select * from crm_api.commit_internal_unit(${capability.payload},${capability.mac},${raw.bytes})
    `));
    captured = { capability, input: raw.bytes };
  });
  assert.ok(captured);
  await runtimeA.begin("isolation level read committed", async (tx) => {
    await denied(tx.savepoint((sp) => sp`
      select * from crm_api.commit_internal_unit(
        ${captured!.capability.payload},${captured!.capability.mac},${captured!.input}
      )
    `));
  });
  await runtimeB.begin("isolation level read committed", async (tx) => {
    await denied(tx.savepoint((sp) => sp`
      select * from crm_api.commit_internal_unit(
        ${captured!.capability.payload},${captured!.capability.mac},${captured!.input}
      )
    `));
  });
});

test("H0-010 GUC authority is observationally absent after success, replay, conflict, error and connection reuse", async () => {
  const request = unit({
    operationId: "verify-guc-success",
    rootId: "verify-guc-root",
    expectedVersion: "0",
    afterValue: "success",
  });
  assert.equal((await adapterA.commit(context(), request)).status, "applied");
  assertNoResidual(await residual(runtimeA));
  assert.equal((await adapterA.commit(context(), request)).status, "previous");
  assertNoResidual(await residual(runtimeA));
  await expectE2(await adapterA.commit(context(), unit({
    operationId: "verify-guc-success",
    rootId: "verify-guc-root",
    expectedVersion: "0",
    afterValue: "conflicting",
  })));
  assertNoResidual(await residual(runtimeA));
  const remove = await addFailureTrigger("unit_results", "verify-guc-error");
  try {
    await assert.rejects(adapterA.commit(context(), unit({
      operationId: "verify-guc-error",
      rootId: "verify-guc-error-root",
      expectedVersion: "0",
      afterValue: "must-fail",
    })));
  } finally {
    await remove();
  }
  assertNoResidual(await residual(runtimeA));
  assertNoResidual(await residual(runtimeB));
  await assert.rejects(runtimeA`select * from crm_private.unit_results`);
});

test("H0-010 savepoint rollback removes capability consumption, material effects and GUC authority together", async () => {
  const issuer = createF1Issuer(config);
  const trusted = context("scope-savepoint", "actor-savepoint");
  const raw = rawUnitInput(trusted, {
    operationId: "verify-savepoint-rollback",
    rootId: "verify-savepoint-root",
    expectedVersion: "0",
    afterValue: "must-rollback",
  });
  await runtimeA.begin("isolation level read committed", async (tx) => {
    const capability = issuer(trusted, await postgresF1Binding(tx), "C03", raw.bytes, {
      resource: "internal_unit",
      action: "commit_internal_unit",
    });
    await assert.rejects(tx.savepoint(async (sp) => {
      await sp`select * from crm_api.commit_internal_unit(${capability.payload},${capability.mac},${raw.bytes})`;
      throw new Error("ROLLBACK_SAVEPOINT_AFTER_UNIT");
    }));
    assertNoResidual((await tx<Record<string, string | null>[]>`
      select current_setting('crm.f1_payload',true) payload,
        current_setting('crm.f1_mac',true) mac,
        current_setting('crm.f1_input',true) input
    `)[0]!);
    const applied = await tx`
      select * from crm_api.commit_internal_unit(${capability.payload},${capability.mac},${raw.bytes})
    `;
    assert.equal(applied[0].replayed, false);
  });
  assert.deepEqual(await counts("verify-savepoint-rollback"), {
    operations: "1", attempts: "1", history: "1", results: "1", effects: "0",
  });
});

test("H0-010 catalog audit preserves D037 roles, ownership, minimal grants, SECURITY DEFINER and FORCE RLS", async () => {
  const roles = await bootstrap`
    select rolname,rolcanlogin,rolsuper,rolcreatedb,rolcreaterole,rolinherit,rolbypassrls,rolreplication
    from pg_roles where rolname in (
      'crm_h0_runtime','crm_h0_executor','crm_h0_verifier','crm_h0_table_owner','crm_h0_migration'
    ) order by rolname
  `;
  assert.equal(roles.length, 5);
  for (const role of roles) {
    if (role.rolname === "crm_h0_runtime" || role.rolname === "crm_h0_migration") continue;
    assert.deepEqual({ login: role.rolcanlogin, super: role.rolsuper, bypass: role.rolbypassrls }, {
      login: false, super: false, bypass: false,
    });
  }
  const runtime = roles.find(({ rolname }) => rolname === "crm_h0_runtime");
  assert.ok(runtime);
  assert.deepEqual({
    login: runtime.rolcanlogin,
    super: runtime.rolsuper,
    createdb: runtime.rolcreatedb,
    createrole: runtime.rolcreaterole,
    inherit: runtime.rolinherit,
    bypass: runtime.rolbypassrls,
    replication: runtime.rolreplication,
  }, {
    login: true, super: false, createdb: false, createrole: false,
    inherit: false, bypass: false, replication: false,
  });
  assert.equal((await bootstrap`
    select count(*)::integer count from pg_auth_members where member='crm_h0_runtime'::regrole
  `)[0].count, 0);
  const tables = await bootstrap`
    select relname,relrowsecurity,relforcerowsecurity,pg_get_userbyid(relowner) owner,
      has_table_privilege('crm_h0_runtime',c.oid,'select,insert,update,delete') runtime_dml
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='crm_private' and relname in (
      'unit_roots','unit_operations','unit_attempts','unit_history','unit_results','external_effect_records'
    ) order by relname
  `;
  assert.equal(tables.length, 6);
  for (const table of tables) assert.deepEqual({
    rls: table.relrowsecurity,
    force: table.relforcerowsecurity,
    owner: table.owner,
    runtimeDml: table.runtime_dml,
  }, { rls: true, force: true, owner: "crm_h0_table_owner", runtimeDml: false });
  const callable = await bootstrap<{ proname: string }[]>`
    select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname in ('crm_api','crm_f1') and has_function_privilege('crm_h0_runtime',p.oid,'execute')
    order by p.proname
  `;
  assert.deepEqual(Array.from(callable), [
    { proname: "apply_probe_batch" },
    { proname: "commit_internal_unit" },
    { proname: "read_probe" },
  ]);
  const functions = await bootstrap`
    select n.nspname,p.proname,p.prosecdef,pg_get_userbyid(p.proowner) owner,p.proconfig,
      has_function_privilege('public',p.oid,'execute') public_execute
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where (n.nspname='crm_api' and p.proname='commit_internal_unit')
       or (n.nspname='crm_f1' and p.proname in ('verify_envelope','verify_unit','unit_row_allows'))
    order by n.nspname,p.proname
  `;
  assert.equal(functions.length, 4);
  for (const fn of functions) {
    assert.equal(fn.prosecdef, true);
    assert.deepEqual(fn.proconfig, ["search_path=pg_catalog, pg_temp"]);
    assert.equal(fn.public_execute, false);
    assert.ok(["crm_h0_executor", "crm_h0_verifier"].includes(fn.owner));
  }
  for (const role of ["crm_h0_executor", "crm_h0_verifier", "crm_h0_table_owner", "crm_h0_migration"]) {
    await assert.rejects(runtimeA.unsafe(`set role ${role}`), (error: unknown) => (error as { code?: string }).code === "42501");
  }
  await assert.rejects(migration.begin(async (tx) => {
    await tx`set local role crm_h0_executor`;
    await tx`select secret from crm_f1.keys`;
  }));
  await assert.rejects(migration.begin(async (tx) => {
    await tx`set local role crm_h0_verifier`;
    await tx`insert into crm_private.unit_history(operation_id) values ('forged')`;
  }));
});

test("H0-010 hostile search_path, temporary shadows and public helpers cannot bypass the narrow API", async () => {
  await runtimeA.begin(async (tx) => {
    await tx`set local search_path=pg_temp,public,crm_api,crm_f1,crm_private`;
    await denied(tx.savepoint((sp) => sp`create temp table unit_results (after_value text)`));
    await denied(tx.savepoint((sp) => sp.unsafe(
      "create function pg_temp.verify_unit(bytea,bytea,bytea) returns text[] language sql as 'select array[]::text[]'",
    )));
    await denied(tx.savepoint((sp) => sp`select * from crm_api.commit_internal_unit(null,null,null)`));
  });
});

test("H0-010 a real deadlock aborts one complete H0-M02 unit and the adapter returns E2", async () => {
  await bootstrap`alter role crm_h0_runtime set deadlock_timeout='20ms'`;
  await bootstrap.unsafe(`
    create function public.h0_010_deadlock() returns trigger language plpgsql as $$
    begin
      perform pg_sleep(0.20);
      if new.operation_id = 'verify-deadlock-left' then
        perform pg_advisory_xact_lock(hashtextextended('verify-deadlock-right',0));
      elsif new.operation_id = 'verify-deadlock-right' then
        perform pg_advisory_xact_lock(hashtextextended('verify-deadlock-left',0));
      end if;
      return new;
    end $$;
    create trigger h0_010_deadlock before insert on crm_private.unit_results
      for each row execute function public.h0_010_deadlock();
  `);
  let results;
  try {
    results = await Promise.all([
      adapterA.commit(context(), unit({
        operationId: "verify-deadlock-left",
        rootId: "verify-deadlock-left-root",
        expectedVersion: "0",
        afterValue: "left",
      })),
      adapterB.commit(context(), unit({
        operationId: "verify-deadlock-right",
        rootId: "verify-deadlock-right-root",
        expectedVersion: "0",
        afterValue: "right",
      })),
    ]);
  } finally {
    await bootstrap.unsafe(`
      drop trigger h0_010_deadlock on crm_private.unit_results;
      drop function public.h0_010_deadlock();
      alter role crm_h0_runtime reset deadlock_timeout;
    `);
  }
  assert.deepEqual(results.map(({ status }) => status).sort(), ["applied", "rejected"]);
  const rejectedIndex = results.findIndex(({ status }) => status === "rejected");
  await expectE2(results[rejectedIndex]!);
  const rejectedOperation = rejectedIndex === 0 ? "verify-deadlock-left" : "verify-deadlock-right";
  const appliedOperation = rejectedIndex === 0 ? "verify-deadlock-right" : "verify-deadlock-left";
  assert.deepEqual(await counts(rejectedOperation), {
    operations: "0", attempts: "0", history: "0", results: "0", effects: "0",
  });
  assert.deepEqual(await counts(appliedOperation), {
    operations: "1", attempts: "1", history: "1", results: "1", effects: "0",
  });
  const serializationProxy = new Proxy(runtimeA, {
    get(target, property) {
      if (property !== "begin") return Reflect.get(target, property);
      return async () => { throw Object.assign(new Error("SYNTHETIC_SERIALIZATION_ABORT"), { code: "40001" }); };
    },
  });
  await expectE2(await new H0009PostgresAdapter(serializationProxy, config).commit(context(), unit({
    operationId: "verify-serialization-classification",
    rootId: "verify-serialization-root",
    expectedVersion: "0",
    afterValue: "must-not-apply",
  })));
});

test("H0-010 migration rejects runtime, reapplication is fail-safe and injected failure leaves no hybrid schema", async () => {
  const source = await readFile(
    join(projectRoot, "supabase/migrations/202609250000_h0_m02_unit_history.sql"), "utf8",
  );
  await assert.rejects(runtimeA.unsafe(source), (error: unknown) => (error as { code?: string }).code === "42501");
  await runtimeA.unsafe("rollback");
  const beforeObjects = (await bootstrap`
    select count(*)::integer count from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='crm_private' and relname like 'unit_%'
  `)[0].count;
  await assert.rejects(migration.unsafe(source));
  await migration.unsafe("rollback");
  assert.equal((await bootstrap`
    select count(*)::integer count from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='crm_private' and relname like 'unit_%'
  `)[0].count, beforeObjects);
  assert.equal((await bootstrap`
    select current_value from crm_private.unit_roots where root_id='verify-history-root'
  `)[0].current_value, "estado-dos");

  const failureDatabase = "crm_h0_010_migration_failure";
  await bootstrap.unsafe(`create database ${failureDatabase} owner crm_h0_migration`);
  const failed = connect("crm_h0_migration", failureDatabase);
  try {
    await failed.unsafe(await readFile(
      join(projectRoot, "supabase/migrations/202609150001_h0_m01_context.sql"), "utf8",
    ));
    await failed.unsafe(await readFile(
      join(projectRoot, "supabase/migrations/202609160001_h0_f1_capabilities.sql"), "utf8",
    ));
    await assert.rejects(failed.unsafe(source.replace(/commit;\s*$/u, "select 1/0; commit;")));
    await failed.unsafe("rollback");
    assert.deepEqual((await failed`
      select to_regclass('crm_private.unit_operations') relation,
        to_regprocedure('crm_api.commit_internal_unit(bytea,bytea,bytea)') function
    `)[0], { relation: null, function: null });
  } finally {
    await failed.end({ timeout: 1 });
  }
});
