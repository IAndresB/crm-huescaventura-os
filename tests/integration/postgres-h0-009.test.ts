import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import postgres from "postgres";
import { issueTrustedContext } from "../../src/application/trusted-context.ts";
import {
  H0009PostgresAdapter,
  type DurableTechnicalIntent,
} from "../../src/infrastructure/postgres/h0-009-adapter.ts";
import type { F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";
import { hardenF1 } from "./f1-fixture.ts";

const postgresBin = process.env.POSTGRES_H0_BIN;
if (!postgresBin) throw new Error("POSTGRES_H0_BIN_REQUIRED");

const projectRoot = resolve(import.meta.dirname, "../..");
const databaseName = "crm_h0_009_test";
const socketPort = 55410;
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

function context(scope = "scope-h0-009", identityId = "technical-actor-h0-009") {
  return issueTrustedContext({
    identityId,
    identityKind: "technical",
    purpose: "h0-009-local-implementation",
    scope,
    requestId: `request-${scope}`,
    serverTime: "2026-09-25T09:00:00.000Z",
  });
}

function intent(suffix: string): DurableTechnicalIntent {
  return {
    intentId: `intent-${suffix}`,
    effectId: `effect-${suffix}`,
    recipientReference: `synthetic-destination-${suffix}`,
    contentVersion: `synthetic-content-${suffix}-v1`,
  };
}

function unit(input: {
  operationId: string;
  rootId: string;
  expectedVersion: string;
  afterValue: string;
  intent?: DurableTechnicalIntent;
  evidenceState?: "none" | "candidate";
  happenedAt?: string;
}) {
  return {
    operationId: input.operationId,
    expectedVersion: input.expectedVersion,
    historyRequired: true as const,
    resultRequired: true as const,
    changes: [{
      kind: "set-technical-state" as const,
      rootId: input.rootId,
      afterValue: input.afterValue,
      reason: "synthetic-authorized-change",
      source: "h0-009-test",
      ...(input.happenedAt === undefined ? {} : { happenedAt: input.happenedAt }),
      evidenceState: input.evidenceState ?? "none",
    }],
    ...(input.intent === undefined ? {} : { intent: input.intent }),
  };
}

async function counts(operationId: string) {
  const rows = await bootstrap<{
    operations: string;
    attempts: string;
    history: string;
    results: string;
    intents: string;
  }[]>`
    select
      (select count(*)::text from crm_private.unit_operations where operation_id=${operationId}) operations,
      (select count(*)::text from crm_private.unit_attempts where operation_id=${operationId}) attempts,
      (select count(*)::text from crm_private.unit_history where operation_id=${operationId}) history,
      (select count(*)::text from crm_private.unit_results where operation_id=${operationId}) results,
      (select count(*)::text from crm_private.external_effect_records where operation_id=${operationId}) intents
  `;
  return rows[0]!;
}

async function addFailureTrigger(table: string, operationId: string): Promise<() => Promise<void>> {
  const safeName = table.replaceAll("_", "");
  await bootstrap.unsafe(`
    create function public.fail_${safeName}_h0009() returns trigger language plpgsql as $$
    begin
      if new.operation_id = '${operationId}' then raise exception 'SYNTHETIC_H0_009_FAILURE'; end if;
      return new;
    end $$;
    create trigger fail_${safeName}_h0009 before insert on crm_private.${table}
      for each row execute function public.fail_${safeName}_h0009();
  `);
  return async () => {
    await bootstrap.unsafe(`
      drop trigger fail_${safeName}_h0009 on crm_private.${table};
      drop function public.fail_${safeName}_h0009();
    `);
  };
}

before(async () => {
  temporaryRoot = await mkdtemp(join(tmpdir(), "crm-h0-009-"));
  dataDirectory = join(temporaryRoot, "data");
  socketDirectory = join(temporaryRoot, "socket");
  await mkdir(socketDirectory);
  command("initdb", [
    "-D", dataDirectory,
    "--username=bootstrap_h0_009",
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
  bootstrap = connect("bootstrap_h0_009", "postgres");
  await bootstrap.unsafe(await readFile(
    join(projectRoot, "supabase/migrations/202609150000_h0_m01_roles.sql"), "utf8",
  ));
  await bootstrap.unsafe(`create database ${databaseName} owner crm_h0_migration`);
  await bootstrap.end();
  bootstrap = connect("bootstrap_h0_009");
  migration = connect("crm_h0_migration");
  await migration.unsafe(await readFile(
    join(projectRoot, "supabase/migrations/202609150001_h0_m01_context.sql"), "utf8",
  ));
  await bootstrap`
    insert into crm_private.access_probe values (
      'h0-009-upgrade-probe','scope-h0-009','upgrade-preserved','private-synthetic'
    )
  `;
  await bootstrap`create role h0_009_role_admin login createrole nosuperuser nocreatedb nobypassrls`;
  await bootstrap`grant connect on database ${bootstrap(databaseName)} to h0_009_role_admin`;
  const roleAdmin = connect("h0_009_role_admin");
  try {
    config = await hardenF1(roleAdmin, migration);
  } finally {
    await roleAdmin.end();
  }
  const migrationResult = spawnSync(join(postgresBin!, "psql"), [
    "-h", socketDirectory,
    "-p", String(socketPort),
    "-U", "crm_h0_migration",
    "-d", databaseName,
    "-v", "ON_ERROR_STOP=1",
    "-f", join(projectRoot, "supabase/migrations/202609250000_h0_m02_unit_history.sql"),
  ], { encoding: "utf8", env: { ...process.env, LC_ALL: "C" } });
  if (migrationResult.status !== 0) {
    process.stderr.write(migrationResult.stderr);
    throw new Error("H0_009_MIGRATION_FAILED");
  }
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

test("H0-009 migration upgrades F1, preserves prior data and creates only technical objects", async () => {
  assert.deepEqual(Array.from(await bootstrap`
    select public_value from crm_private.access_probe where probe_id='h0-009-upgrade-probe'
  `), [{ public_value: "upgrade-preserved" }]);
  const relations = await bootstrap<{ relname: string }[]>`
    select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='crm_private' and relkind='r' and relname like 'unit_%'
    order by relname
  `;
  assert.deepEqual(Array.from(relations), [
    { relname: "unit_attempts" },
    { relname: "unit_history" },
    { relname: "unit_operations" },
    { relname: "unit_results" },
    { relname: "unit_roots" },
  ]);
  const source = await readFile(
    join(projectRoot, "supabase/migrations/202609250000_h0_m02_unit_history.sql"), "utf8",
  );
  await assert.rejects(runtimeA.unsafe(source), (error: unknown) => (error as { code?: string }).code === "42501");
  await runtimeA.unsafe("rollback");
});

test("H0-009 persists state, complete minimal history, fixed result and intent atomically", async () => {
  const result = await adapterA.commit(context(), unit({
    operationId: "operation-complete",
    rootId: "root-complete",
    expectedVersion: "0",
    afterValue: "estado-sintético-v1",
    happenedAt: "2026-09-25T09:01:00.000Z",
    evidenceState: "candidate",
    intent: intent("complete"),
  }));
  assert.equal(result.status, "applied");
  assert.equal(result.status === "applied" ? result.value.resultingVersion : undefined, "1");
  const history = await bootstrap`
    select before_value,after_value,reason,source,
      happened_at = timestamptz '2026-09-25T09:01:00.000Z' as happened,
      recorded_at is not null as recorded,
      actor_id,actor_kind,evidence_state from crm_private.unit_history where operation_id='operation-complete'
  `;
  assert.deepEqual(Array.from(history), [{
    before_value: null,
    after_value: "estado-sintético-v1",
    reason: "synthetic-authorized-change",
    source: "h0-009-test",
    happened: true,
    recorded: true,
    actor_id: "technical-actor-h0-009",
    actor_kind: "technical",
    evidence_state: "candidate",
  }]);
  assert.deepEqual(await counts("operation-complete"), {
    operations: "1", attempts: "1", history: "1", results: "1", intents: "1",
  });
  const effect = await bootstrap`
    select effect_id,intent_id,stage,attempt_id,outcome,result_reference
    from crm_private.external_effect_records where operation_id='operation-complete'
  `;
  assert.deepEqual(Array.from(effect), [{
    effect_id: "effect-complete",
    intent_id: "intent-complete",
    stage: "intent",
    attempt_id: null,
    outcome: null,
    result_reference: null,
  }]);
});

test("H0-009 later history records real before/after without rewriting the original", async () => {
  const result = await adapterA.commit(context(), unit({
    operationId: "operation-complete-v2",
    rootId: "root-complete",
    expectedVersion: "1",
    afterValue: "state-v2",
  }));
  assert.equal(result.status, "applied");
  const rows = await bootstrap`
    select operation_id,before_value,after_value from crm_private.unit_history
    where root_id='root-complete' order by recorded_at,operation_id
  `;
  assert.deepEqual(Array.from(rows), [
    { operation_id: "operation-complete", before_value: null, after_value: "estado-sintético-v1" },
    { operation_id: "operation-complete-v2", before_value: "estado-sintético-v1", after_value: "state-v2" },
  ]);
});

test("H0-009 equivalent replay reauthorizes, returns fixed result and creates only a new attempt", async () => {
  const request = unit({
    operationId: "operation-replay",
    rootId: "root-replay",
    expectedVersion: "0",
    afterValue: "replay-state",
    intent: intent("replay"),
  });
  const first = await adapterA.commit(context(), request);
  const replay = await adapterA.commit(context(), request);
  assert.equal(first.status, "applied");
  assert.equal(replay.status, "previous");
  if (first.status === "applied" && replay.status === "previous") assert.deepEqual(replay.value, first.value);
  assert.deepEqual(await counts("operation-replay"), {
    operations: "1", attempts: "2", history: "1", results: "1", intents: "1",
  });
  const attempts = await bootstrap<{ attempt_id: string; attempt_kind: string }[]>`
    select attempt_id,attempt_kind from crm_private.unit_attempts
    where operation_id='operation-replay' order by recorded_at,attempt_id
  `;
  assert.equal(new Set(attempts.map(({ attempt_id }) => attempt_id)).size, 2);
  assert.deepEqual(attempts.map(({ attempt_kind }) => attempt_kind).sort(), ["initial", "replay"]);
});

test("H0-009 same operation identity with different material returns E2 and no second effect", async () => {
  const requestInput = {
    operationId: "operation-conflict",
    rootId: "root-conflict",
    expectedVersion: "0",
    afterValue: "original",
    intent: intent("conflict"),
  };
  const request = unit(requestInput);
  assert.equal((await adapterA.commit(context(), request)).status, "applied");
  const conflict = await adapterA.commit(context(), unit({
    ...requestInput,
    afterValue: "altered",
  }));
  assert.equal(conflict.status, "rejected");
  assert.equal(conflict.status === "rejected" ? conflict.issues[0]?.code : undefined, "E2");
  assert.deepEqual(await counts("operation-conflict"), {
    operations: "1", attempts: "1", history: "1", results: "1", intents: "1",
  });
});

test("H0-009 concurrent equivalent operations converge on one durable result", async () => {
  const request = unit({
    operationId: "operation-concurrent-equivalent",
    rootId: "root-concurrent-equivalent",
    expectedVersion: "0",
    afterValue: "converged",
    intent: intent("concurrent-equivalent"),
  });
  const results = await Promise.all([
    adapterA.commit(context(), request),
    adapterB.commit(context(), request),
  ]);
  assert.deepEqual(results.map(({ status }) => status).sort(), ["applied", "previous"]);
  if (results[0]?.status !== "rejected" && results[1]?.status !== "rejected"
    && results[0]?.status !== "pending" && results[1]?.status !== "pending") {
    assert.deepEqual(results[0]?.value, results[1]?.value);
  }
  assert.deepEqual(await counts("operation-concurrent-equivalent"), {
    operations: "1", attempts: "2", history: "1", results: "1", intents: "1",
  });
});

test("H0-009 concurrent same identity with different fingerprints applies once and returns E2", async () => {
  const base = {
    operationId: "operation-concurrent-conflict",
    rootId: "root-concurrent-conflict",
    expectedVersion: "0",
  };
  const results = await Promise.all([
    adapterA.commit(context(), unit({ ...base, afterValue: "left-material" })),
    adapterB.commit(context(), unit({ ...base, afterValue: "right-material" })),
  ]);
  assert.deepEqual(results.map(({ status }) => status).sort(), ["applied", "rejected"]);
  const rejection = results.find(({ status }) => status === "rejected");
  assert.equal(rejection?.status === "rejected" ? rejection.issues[0]?.code : undefined, "E2");
  assert.deepEqual(await counts("operation-concurrent-conflict"), {
    operations: "1", attempts: "1", history: "1", results: "1", intents: "0",
  });
});

test("H0-009 expected version prevents concurrent overwrite", async () => {
  assert.equal((await adapterA.commit(context(), unit({
    operationId: "operation-version-seed",
    rootId: "root-version",
    expectedVersion: "0",
    afterValue: "v1",
  }))).status, "applied");
  const [left, right] = await Promise.all([
    adapterA.commit(context(), unit({
      operationId: "operation-version-left", rootId: "root-version", expectedVersion: "1", afterValue: "left",
    })),
    adapterB.commit(context(), unit({
      operationId: "operation-version-right", rootId: "root-version", expectedVersion: "1", afterValue: "right",
    })),
  ]);
  assert.deepEqual([left.status, right.status].sort(), ["applied", "rejected"]);
  const root = await bootstrap`
    select version,current_value from crm_private.unit_roots where root_id='root-version'
  `;
  assert.equal(root[0].version, "2");
  assert.ok(["left", "right"].includes(root[0].current_value));
  assert.equal((await bootstrap`select * from crm_private.unit_history where root_id='root-version'`).length, 2);
});

test("H0-009 failures at every critical boundary leave no partial unit", async () => {
  await assert.rejects(adapterA.commit(context(), unit({
    operationId: "rollback-before-change",
    rootId: "root-rollback-before-change",
    expectedVersion: "0",
    afterValue: "",
  })));
  const cases = [
    ["unit_operations", "rollback-before-operation", false],
    ["unit_history", "rollback-before-history", false],
    ["unit_results", "rollback-before-result", false],
    ["external_effect_records", "rollback-before-intent", true],
  ] as const;
  for (const [table, operationId, hasIntent] of cases) {
    const removeTrigger = await addFailureTrigger(table, operationId);
    try {
      await assert.rejects(adapterA.commit(context(), unit({
        operationId,
        rootId: `root-${operationId}`,
        expectedVersion: "0",
        afterValue: "must-rollback",
        ...(hasIntent ? { intent: intent(operationId) } : {}),
      })));
    } finally {
      await removeTrigger();
    }
    assert.deepEqual(await counts(operationId), {
      operations: "0", attempts: "0", history: "0", results: "0", intents: "0",
    });
    assert.equal((await bootstrap`select * from crm_private.unit_roots where root_id=${`root-${operationId}`}`).length, 0);
  }

  const rollbackConnection = connect("crm_h0_runtime");
  const rollbackSql = new Proxy(rollbackConnection, {
    get(target, property) {
      if (property !== "begin") return Reflect.get(target, property);
      return (options: string, work: (tx: postgres.TransactionSql) => Promise<unknown>) => target.begin(
        options,
        async (tx) => {
          await work(tx);
          throw new Error("SYNTHETIC_AFTER_INTENT_BEFORE_COMMIT");
        },
      );
    },
  });
  try {
    const pending = await new H0009PostgresAdapter(rollbackSql, config).commit(context(), unit({
      operationId: "rollback-after-intent",
      rootId: "root-rollback-after-intent",
      expectedVersion: "0",
      afterValue: "must-rollback",
      intent: intent("rollback-after-intent"),
    }));
    assert.equal(pending.status, "pending");
  } finally {
    await rollbackConnection.end({ timeout: 1 });
  }
  assert.deepEqual(await counts("rollback-after-intent"), {
    operations: "0", attempts: "0", history: "0", results: "0", intents: "0",
  });
});

test("H0-009 response lost after real COMMIT recovers the previous result without duplicate material work", async () => {
  const lossConnection = connect("crm_h0_runtime");
  const lossSql = new Proxy(lossConnection, {
    get(target, property) {
      if (property !== "begin") return Reflect.get(target, property);
      return async (options: string, work: (tx: postgres.TransactionSql) => Promise<unknown>) => {
        await target.begin(options, work);
        throw new Error("SYNTHETIC_RESPONSE_LOST_AFTER_COMMIT");
      };
    },
  });
  const request = unit({
    operationId: "operation-post-commit-loss",
    rootId: "root-post-commit-loss",
    expectedVersion: "0",
    afterValue: "committed-before-loss",
    intent: intent("post-commit-loss"),
  });
  try {
    const lost = await new H0009PostgresAdapter(lossSql, config).commit(context(), request);
    assert.equal(lost.status, "pending");
    assert.equal(lost.status === "pending" ? lost.issues[0]?.code : undefined, "E4");
  } finally {
    await lossConnection.end({ timeout: 1 });
  }
  const replay = await adapterA.commit(context(), request);
  assert.equal(replay.status, "previous");
  assert.deepEqual(await counts("operation-post-commit-loss"), {
    operations: "1", attempts: "2", history: "1", results: "1", intents: "1",
  });
});

test("H0-009 runtime cannot directly read, mutate or erase durable records", async () => {
  for (const statement of [
    "select * from crm_private.unit_history",
    "update crm_private.unit_history set after_value='forged'",
    "delete from crm_private.unit_history",
    "update crm_private.unit_results set result_state='applied'",
    "delete from crm_private.unit_results",
    "update crm_private.unit_operations set material_fingerprint=repeat('0',64)",
    "update crm_private.unit_operations set effect_id='forged'",
    "delete from crm_private.external_effect_records",
  ]) {
    await assert.rejects(runtimeA.unsafe(statement), (error: unknown) => (error as { code?: string }).code === "42501");
  }
  const allowed = await bootstrap<{ proname: string }[]>`
    select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname in ('crm_api','crm_f1') and has_function_privilege('crm_h0_runtime',p.oid,'execute')
    order by p.proname
  `;
  assert.deepEqual(Array.from(allowed), [
    { proname: "apply_probe_batch" },
    { proname: "commit_internal_unit" },
    { proname: "read_probe" },
  ]);
});

test("H0-009 roles, ownership, FORCE RLS and grants keep verifier/executor split", async () => {
  const tables = await bootstrap`
    select relname,relrowsecurity,relforcerowsecurity,pg_get_userbyid(relowner) owner
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='crm_private' and relname in (
      'unit_roots','unit_operations','unit_attempts','unit_history','unit_results','external_effect_records'
    ) order by relname
  `;
  assert.equal(tables.length, 6);
  for (const row of tables) assert.deepEqual(
    { rls: row.relrowsecurity, force: row.relforcerowsecurity, owner: row.owner },
    { rls: true, force: true, owner: "crm_h0_table_owner" },
  );
  await assert.rejects(migration.begin(async (tx) => {
    await tx`set local role crm_h0_executor`;
    await tx`select secret from crm_f1.keys`;
  }));
  await assert.rejects(migration.begin(async (tx) => {
    await tx`set local role crm_h0_verifier`;
    await tx`select * from crm_private.unit_results`;
  }));
});

test("H0-009 C04 remains candidate and C05 persists intent without provider attempt or outcome", async () => {
  assert.equal((await bootstrap`
    select evidence_state from crm_private.unit_history where operation_id='operation-complete'
  `)[0].evidence_state, "candidate");
  const records = await bootstrap`
    select stage,count(*)::text from crm_private.external_effect_records
    where operation_id='operation-complete' group by stage
  `;
  assert.deepEqual(Array.from(records), [{ stage: "intent", count: "1" }]);
});

test("H0-009 PostgreSQL deadlock aborts one complete transaction and does not preserve its marker", async () => {
  await bootstrap`create table public.deadlock_h0_009 (root_id text primary key, value text not null)`;
  await bootstrap`insert into public.deadlock_h0_009 values ('a','seed'),('b','seed')`;
  await bootstrap`create table public.deadlock_markers_h0_009 (marker text primary key)`;
  const left = connect("bootstrap_h0_009");
  const right = connect("bootstrap_h0_009");
  let leftReady!: () => void;
  let rightReady!: () => void;
  const leftLocked = new Promise<void>((resolve) => { leftReady = resolve; });
  const rightLocked = new Promise<void>((resolve) => { rightReady = resolve; });
  try {
    const first = left.begin(async (tx) => {
      await tx`set local deadlock_timeout='20ms'`;
      await tx`insert into public.deadlock_markers_h0_009 values ('left')`;
      await tx`update public.deadlock_h0_009 set value='left' where root_id='a'`;
      leftReady(); await rightLocked;
      await tx`update public.deadlock_h0_009 set value='left' where root_id='b'`;
    });
    const second = right.begin(async (tx) => {
      await tx`set local deadlock_timeout='20ms'`;
      await tx`insert into public.deadlock_markers_h0_009 values ('right')`;
      await tx`update public.deadlock_h0_009 set value='right' where root_id='b'`;
      rightReady(); await leftLocked;
      await tx`update public.deadlock_h0_009 set value='right' where root_id='a'`;
    });
    const settled = await Promise.allSettled([first, second]);
    assert.equal(settled.filter(({ status }) => status === "rejected").length, 1);
    const rejected = settled.find(({ status }) => status === "rejected");
    assert.equal(rejected?.status === "rejected"
      ? (rejected.reason as { code?: string }).code : undefined, "40P01");
    assert.equal((await bootstrap`select * from public.deadlock_markers_h0_009`).length, 1);
  } finally {
    await Promise.allSettled([left.end({ timeout: 1 }), right.end({ timeout: 1 })]);
  }

  for (const code of ["40P01", "40001"]) {
    const conflictSql = new Proxy(runtimeA, {
      get(target, property) {
        if (property !== "begin") return Reflect.get(target, property);
        return async () => { throw Object.assign(new Error("SYNTHETIC_POSTGRES_CONFLICT"), { code }); };
      },
    });
    const result = await new H0009PostgresAdapter(conflictSql, config).commit(context(), unit({
      operationId: `operation-${code.toLowerCase()}`,
      rootId: `root-${code.toLowerCase()}`,
      expectedVersion: "0",
      afterValue: "must-not-apply",
    }));
    assert.equal(result.status, "rejected");
    assert.equal(result.status === "rejected" ? result.issues[0]?.code : undefined, "E2");
  }
});

test("H0-009 migration is transactional: an injected failure leaves no H0-M02 objects", async () => {
  const failureDatabase = "crm_h0_009_migration_failure";
  await bootstrap.unsafe(`create database ${failureDatabase} owner crm_h0_migration`);
  const failedMigration = connect("crm_h0_migration", failureDatabase);
  try {
    await failedMigration.unsafe(await readFile(
      join(projectRoot, "supabase/migrations/202609150001_h0_m01_context.sql"), "utf8",
    ));
    await failedMigration.unsafe(await readFile(
      join(projectRoot, "supabase/migrations/202609160001_h0_f1_capabilities.sql"), "utf8",
    ));
    const source = await readFile(
      join(projectRoot, "supabase/migrations/202609250000_h0_m02_unit_history.sql"), "utf8",
    );
    await assert.rejects(failedMigration.unsafe(source.replace(/commit;\s*$/u, "select 1/0; commit;")));
    await failedMigration.unsafe("rollback");
    const objects = await failedMigration`
      select to_regclass('crm_private.unit_operations') as relation,
        to_regprocedure('crm_api.commit_internal_unit(bytea,bytea,bytea)') as function
    `;
    assert.deepEqual(objects[0], { relation: null, function: null });
  } finally {
    await failedMigration.end({ timeout: 1 });
  }
});
