import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, test } from "node:test";
import postgres, { type Sql, type TransactionSql } from "postgres";
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

if (process.env.HOSTED_H0_M02_RUN !== "1") throw new Error("HOSTED_H0_M02_RUN_REQUIRED");

const projectRef = "wrcrhbdbydkchxxlcacb";
const host = "aws-1-eu-west-1.pooler.supabase.com";
const runTag = process.env.HOSTED_H0_M02_RUN_TAG!;
if (!/^hm2-[a-z0-9-]{4,48}$/u.test(runTag)) throw new Error("HOSTED_H0_M02_RUN_TAG_INVALID");

const runtimePassword = readFileSync(process.env.HOSTED_H0_RUNTIME_PASSWORD_FILE!, "utf8").trim();
const ca = readFileSync(process.env.HOSTED_H0_CA_FILE!, "utf8");
const key = readFileSync(process.env.HOSTED_H0_KEY_FILE!);
const meta = JSON.parse(readFileSync(process.env.HOSTED_H0_META_FILE!, "utf8")) as
  Omit<F1SigningConfiguration, "key">;
const configuration: F1SigningConfiguration = { ...meta, key };
const connections: Sql[] = [];

function connection(port: 5432 | 6543): Sql {
  const sql = postgres({
    host,
    port,
    database: "postgres",
    user: `crm_h0_runtime.${projectRef}`,
    password: runtimePassword,
    ssl: { ca, rejectUnauthorized: true },
    max: 1,
    prepare: false,
    connect_timeout: 15,
    idle_timeout: 5,
  });
  connections.push(sql);
  return sql;
}

after(async () => {
  await Promise.allSettled(connections.map((sql) => sql.end({ timeout: 2 })));
});

const session = connection(5432);
const transactionA = connection(6543);
const transactionB = connection(6543);
const transactionC = connection(6543);
const adapterA = new H0009PostgresAdapter(transactionA, configuration);
const adapterB = new H0009PostgresAdapter(transactionB, configuration);

function id(suffix: string): string {
  return `${runTag}-${suffix}`;
}

function context(scopeSuffix = "scope", actorSuffix = "actor"): TrustedExecutionContext {
  return issueTrustedContext({
    identityId: id(actorSuffix),
    identityKind: "technical",
    purpose: "hosted-validation",
    scope: id(scopeSuffix),
    requestId: id(`request-${scopeSuffix}-${actorSuffix}`),
    serverTime: new Date().toISOString(),
  });
}

function intent(suffix: string, overrides: Partial<DurableTechnicalIntent> = {}): DurableTechnicalIntent {
  return {
    intentId: id(`intent-${suffix}`),
    effectId: id(`effect-${suffix}`),
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
  intent?: DurableTechnicalIntent;
  evidenceState?: "none" | "candidate";
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
      reason: "hosted-validation-reason",
      source: "hosted-h0-m02",
      evidenceState: input.evidenceState ?? "none",
    }],
    ...(input.intent === undefined ? {} : { intent: input.intent }),
  };
}

function rawUnitInput(
  trusted: TrustedExecutionContext,
  input: UnitInput,
  attemptId = randomUUID(),
): Buffer {
  const intentFields = input.intent === undefined
    ? ["false", "", "", "", "", ""]
    : [
      "true",
      input.intent.effectId,
      input.intent.intentId,
      input.intent.recipientReference,
      input.intent.contentVersion,
      createHash("sha256").update(encodeF1Fields([
        "CRM-INTENT-MATERIAL1",
        input.intent.effectId,
        input.intent.recipientReference,
        input.intent.contentVersion,
      ])).digest("hex"),
    ];
  const material = encodeF1Fields([
    "CRM-UNIT-MATERIAL1", "technical-state-change", input.rootId,
    input.expectedVersion, input.afterValue, "hosted-validation-reason",
    "hosted-h0-m02", "", input.evidenceState ?? "none",
    trusted.identityId, trusted.identityKind, trusted.purpose, trusted.scope,
    ...intentFields,
  ]);
  return encodeF1Fields([
    "CRM-UNIT1", input.operationId, "technical-state-change", input.rootId,
    input.expectedVersion, createHash("sha256").update(material).digest("hex"),
    attemptId, "hosted-validation-reason", "hosted-h0-m02", "",
    input.afterValue, input.evidenceState ?? "none", ...intentFields,
  ]);
}

async function denied(operation: PromiseLike<unknown>): Promise<void> {
  await assert.rejects(Promise.resolve(operation), (error: unknown) =>
    ["42501", "H0002", "0LP01", "42P01", "3F000"].includes(
      (error as { code?: string }).code ?? "",
    ));
}

async function expectE2(result: Awaited<ReturnType<H0009PostgresAdapter["commit"]>>): Promise<void> {
  assert.equal(result.status, "rejected");
  assert.equal(result.status === "rejected" ? result.issues[0]?.code : undefined, "E2");
}

async function noResidual(sql: Sql | TransactionSql): Promise<void> {
  const [row] = await sql<Record<string, string | null>[]>`
    select nullif(current_setting('crm.f1_payload',true),'') payload,
      nullif(current_setting('crm.f1_mac',true),'') mac,
      nullif(current_setting('crm.f1_input',true),'') input
  `;
  assert.deepEqual(row, { payload: null, mac: null, input: null });
}

test("PLAN-AUTH-006 hosted H0-M02 subset", async (t) => {
  await t.test("runtime identity, strict TLS and transaction-pooler affinity", async () => {
    for (const sql of [session, transactionA]) {
      const [row] = await sql<{
        current_user: string; session_user: string; database: string; ssl: boolean;
      }[]>`
        select current_user::text,session_user::text,current_database() database,
          (select ssl from pg_stat_ssl where pid=pg_backend_pid()) ssl
      `;
      assert.deepEqual(row, {
        current_user: "crm_h0_runtime",
        session_user: "crm_h0_runtime",
        database: "postgres",
        ssl: true,
      });
    }
    const seen: string[] = [];
    for (let index = 0; index < 3; index++) {
      await transactionA.begin("isolation level read committed", async (tx) => {
        const first = await postgresF1Binding(tx);
        const second = await postgresF1Binding(tx);
        assert.deepEqual({
          xid: second.xid,
          pid: second.pid,
          database: second.database,
          start: second.start,
          login: second.login,
        }, {
          xid: first.xid,
          pid: first.pid,
          database: first.database,
          start: first.start,
          login: first.login,
        });
        assert.ok(BigInt(second.now) >= BigInt(first.now));
        seen.push(first.xid);
        await tx`select set_config('crm.f1_payload','hostile',true)`;
      });
      await noResidual(transactionA);
    }
    assert.equal(new Set(seen).size, seen.length);
  });

  const normal = unit({
    operationId: id("normal-operation"),
    rootId: id("normal-root"),
    expectedVersion: "0",
    afterValue: "normal-value",
    evidenceState: "candidate",
    intent: intent("normal"),
  });

  await t.test("C03, durable result, replay, C04 candidate and C05 intent", async () => {
    const applied = await adapterA.commit(context(), normal);
    assert.equal(applied.status, "applied");
    const replay = await adapterB.commit(context(), normal);
    assert.equal(replay.status, "previous");
    if (applied.status === "applied" && replay.status === "previous") {
      assert.deepEqual(replay.value, applied.value);
    }
    await noResidual(transactionA);
    await noResidual(transactionB);
  });

  await t.test("material and expected-version conflicts return E2", async () => {
    await expectE2(await adapterB.commit(context(), unit({
      operationId: normal.operationId,
      rootId: normal.changes[0].rootId,
      expectedVersion: "0",
      afterValue: "materially-different",
      evidenceState: "candidate",
      intent: normal.intent,
    })));
    await expectE2(await adapterA.commit(context(), unit({
      operationId: id("stale-operation"),
      rootId: normal.changes[0].rootId,
      expectedVersion: "0",
      afterValue: "forbidden-overwrite",
    })));
  });

  await t.test("concurrent equivalent requests converge", async () => {
    const request = unit({
      operationId: id("concurrent-equivalent"),
      rootId: id("concurrent-equivalent-root"),
      expectedVersion: "0",
      afterValue: "converged",
      intent: intent("concurrent-equivalent"),
    });
    const results = await Promise.all([
      adapterA.commit(context(), request),
      adapterB.commit(context(), request),
    ]);
    assert.deepEqual(results.map(({ status }) => status).sort(), ["applied", "previous"]);
  });

  await t.test("concurrent conflicting material applies once", async () => {
    const common = {
      operationId: id("concurrent-material"),
      rootId: id("concurrent-material-root"),
      expectedVersion: "0",
    };
    const results = await Promise.all([
      adapterA.commit(context(), unit({ ...common, afterValue: "left" })),
      adapterB.commit(context(), unit({ ...common, afterValue: "right" })),
    ]);
    assert.deepEqual(results.map(({ status }) => status).sort(), ["applied", "rejected"]);
  });

  await t.test("different operations on one version prevent lost update", async () => {
    const rootId = id("shared-root");
    assert.equal((await adapterA.commit(context(), unit({
      operationId: id("shared-seed"), rootId, expectedVersion: "0", afterValue: "v1",
    }))).status, "applied");
    const results = await Promise.all([
      adapterA.commit(context(), unit({
        operationId: id("shared-left"), rootId, expectedVersion: "1", afterValue: "left-v2",
      })),
      adapterB.commit(context(), unit({
        operationId: id("shared-right"), rootId, expectedVersion: "1", afterValue: "right-v2",
      })),
    ]);
    assert.deepEqual(results.map(({ status }) => status).sort(), ["applied", "rejected"]);
  });

  await t.test("post-COMMIT loss recovers the prior result", async () => {
    const lossConnection = connection(6543);
    const proxy = new Proxy(lossConnection, {
      get(target, property) {
        if (property !== "begin") return Reflect.get(target, property);
        return async (options: string, work: (tx: TransactionSql) => Promise<unknown>) => {
          await target.begin(options, work);
          throw new Error("SYNTHETIC_RESPONSE_NOT_OBSERVED_AFTER_REAL_COMMIT");
        };
      },
    });
    const request = unit({
      operationId: id("post-commit-loss"),
      rootId: id("post-commit-loss-root"),
      expectedVersion: "0",
      afterValue: "durably-committed",
      intent: intent("post-commit-loss"),
    });
    const unknown = await new H0009PostgresAdapter(proxy, configuration).commit(context(), request);
    assert.equal(unknown.status, "pending");
    assert.equal((await adapterB.commit(context(), request)).status, "previous");
  });

  await t.test("rollback before COMMIT leaves no surviving material right", async () => {
    const rollbackConnection = connection(6543);
    const proxy = new Proxy(rollbackConnection, {
      get(target, property) {
        if (property !== "begin") return Reflect.get(target, property);
        return (options: string, work: (tx: TransactionSql) => Promise<unknown>) =>
          target.begin(options, async (tx) => {
            await work(tx);
            throw new Error("SYNTHETIC_ROLLBACK_BEFORE_COMMIT");
          });
      },
    });
    const request = unit({
      operationId: id("rollback-operation"),
      rootId: id("rollback-root"),
      expectedVersion: "0",
      afterValue: "must-not-survive",
      intent: intent("rollback"),
    });
    const unknown = await new H0009PostgresAdapter(proxy, configuration).commit(context(), request);
    assert.equal(unknown.status, "pending");
    assert.equal((await adapterA.commit(context(), request)).status, "applied");
  });

  await t.test("F1 rejects forged GUC, MAC, input, scope, target, expiry and replay", async () => {
    const trusted = context("f1-scope", "f1-actor");
    const issuer = createF1Issuer(configuration);
    const raw = rawUnitInput(trusted, {
      operationId: id("f1-valid"),
      rootId: id("f1-valid-root"),
      expectedVersion: "0",
      afterValue: "authorized",
    });
    let captured: { capability: F1Capability; input: Buffer } | undefined;
    await transactionA.begin("isolation level read committed", async (tx) => {
      const binding = await postgresF1Binding(tx);
      const capability = issuer(trusted, binding, "C03", raw, {
        resource: "internal_unit", action: "commit_internal_unit",
      });
      await tx`select set_config('crm.identity_id','forged',true),
        set_config('crm.scope','forged',true),set_config('crm.f1_payload','00',true)`;
      await denied(tx.savepoint((sp) => sp`select * from crm_private.unit_results`));
      await denied(tx.savepoint((sp) => sp`
        select * from crm_api.commit_internal_unit(${capability.payload},${randomBytes(32)},${raw})
      `));
      const changedInput = Buffer.from(raw);
      changedInput[changedInput.length - 1] ^= 1;
      await denied(tx.savepoint((sp) => sp`
        select * from crm_api.commit_internal_unit(
          ${capability.payload},${capability.mac},${changedInput}
        )
      `));
      const alteredFields = [
        "CRM-H0F1", "1", meta.keyId, meta.audience, meta.generation,
        binding.database, binding.start, binding.xid, binding.pid, binding.login,
        trusted.identityId, trusted.identityKind, trusted.purpose, "altered-scope",
        "C03", "internal_unit", "commit_internal_unit",
        createHash("sha256").update(raw).digest("hex"),
        binding.now, (BigInt(binding.now) + 30000000n).toString(), randomUUID(),
      ];
      const alteredPayload = encodeF1Fields(alteredFields);
      await denied(tx.savepoint((sp) => sp`
        select * from crm_api.commit_internal_unit(
          ${alteredPayload},${createHmac("sha256", key).update(alteredPayload).digest()},${raw}
        )
      `));
      const wrongInput = encodeF1Fields([
        "CRM-INP1", "C03", "probe", "true", "true",
        "record-technical-probe", id("probe"), "value",
      ]);
      const wrongTarget = issuer(trusted, binding, "C03", wrongInput, {
        resource: "access_probe", action: "apply_probe_batch",
      });
      await denied(tx.savepoint((sp) => sp`
        select * from crm_api.commit_internal_unit(
          ${wrongTarget.payload},${wrongTarget.mac},${wrongInput}
        )
      `));
      const expiredFields = [
        "CRM-H0F1", "1", meta.keyId, meta.audience, meta.generation,
        binding.database, binding.start, binding.xid, binding.pid, binding.login,
        trusted.identityId, trusted.identityKind, trusted.purpose, trusted.scope,
        "C03", "internal_unit", "commit_internal_unit",
        createHash("sha256").update(raw).digest("hex"),
        (BigInt(binding.now) - 60000000n).toString(),
        (BigInt(binding.now) - 30000000n).toString(),
        randomUUID(),
      ];
      const expiredPayload = encodeF1Fields(expiredFields);
      await denied(tx.savepoint((sp) => sp`
        select * from crm_api.commit_internal_unit(
          ${expiredPayload},${createHmac("sha256", key).update(expiredPayload).digest()},${raw}
        )
      `));
      const [applied] = await tx`
        select * from crm_api.commit_internal_unit(${capability.payload},${capability.mac},${raw})
      `;
      assert.equal(applied.replayed, false);
      await denied(tx.savepoint((sp) => sp`
        select * from crm_api.commit_internal_unit(${capability.payload},${capability.mac},${raw})
      `));
      captured = { capability, input: raw };
    });
    assert.ok(captured);
    for (const sql of [transactionA, transactionC]) {
      await sql.begin("isolation level read committed", async (tx) => {
        await denied(tx.savepoint((sp) => sp`
          select * from crm_api.commit_internal_unit(
            ${captured!.capability.payload},${captured!.capability.mac},${captured!.input}
          )
        `));
      });
      await noResidual(sql);
    }
  });

  await t.test("runtime cannot bypass narrow API or assume privileged roles", async () => {
    const attacks = [
      "select * from crm_private.unit_history",
      "update crm_private.unit_history set after_value='forged'",
      "delete from crm_private.unit_results",
      "update crm_private.unit_operations set material_fingerprint=repeat('0',64)",
      "select secret from crm_f1.keys",
      "select crm_f1.verify_unit(null,null,null)",
      "select crm_f1.verify_envelope(null,null,null,'C03','internal_unit','commit_internal_unit')",
      "set role crm_h0_verifier",
      "set role crm_h0_executor",
      "set role crm_h0_table_owner",
      "set role crm_h0_migration",
      "alter table crm_private.unit_history disable row level security",
      "create schema hostile",
      "grant crm_h0_executor to crm_h0_runtime",
    ];
    for (const attack of attacks) await denied(session.unsafe(attack));
    await session.begin(async (tx) => {
      await tx`set local search_path=pg_temp,public,crm_api,crm_f1,crm_private`;
      await denied(tx.savepoint((sp) => sp`create temp table unit_results(after_value text)`));
      await denied(tx.savepoint((sp) => sp.unsafe(
        "create function pg_temp.verify_unit(bytea,bytea,bytea) returns text[] language sql as 'select array[]::text[]'",
      )));
      await denied(tx.savepoint((sp) => sp`
        select * from crm_api.commit_internal_unit(null,null,null)
      `));
    });
  });

  await t.test("effect and intent identities cannot mint another right", async () => {
    assert.equal((await adapterA.commit(context(), unit({
      operationId: id("identity-first"),
      rootId: id("identity-first-root"),
      expectedVersion: "0",
      afterValue: "first",
      intent: intent("shared-identity"),
    }))).status, "applied");
    await expectE2(await adapterB.commit(context(), unit({
      operationId: id("identity-second"),
      rootId: id("identity-second-root"),
      expectedVersion: "0",
      afterValue: "second",
      intent: intent("different-intent", { effectId: id("effect-shared-identity") }),
    })));
    await expectE2(await adapterB.commit(context(), unit({
      operationId: id("identity-third"),
      rootId: id("identity-third-root"),
      expectedVersion: "0",
      afterValue: "third",
      intent: intent("shared-identity", { effectId: id("effect-different") }),
    })));
  });
});
