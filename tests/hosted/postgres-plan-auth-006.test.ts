import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import postgres, { type Sql, type TransactionSql } from "postgres";
import { issueTrustedContext } from "../../src/application/trusted-context.ts";
import { H0M01PostgresAdapter } from "../../src/infrastructure/postgres/h0-m01-adapter.ts";
import { encodeF1Fields, type F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";

if (process.env.HOSTED_H0_RUN !== "1") throw new Error("HOSTED_H0_RUN_REQUIRED");

const projectRef = "wrcrhbdbydkchxxlcacb";
const host = "aws-1-eu-west-1.pooler.supabase.com";
const runtimePassword = readFileSync(process.env.HOSTED_H0_RUNTIME_PASSWORD_FILE!, "utf8").trim();
const jitPat = readFileSync(process.env.HOSTED_H0_JIT_PAT_FILE!, "utf8").trim();
const ca = readFileSync(process.env.HOSTED_H0_CA_FILE!, "utf8");
const key = readFileSync(process.env.HOSTED_H0_KEY_FILE!);
const meta = JSON.parse(readFileSync(process.env.HOSTED_H0_META_FILE!, "utf8")) as Omit<F1SigningConfiguration, "key">;
const configuration: F1SigningConfiguration = { ...meta, key };
const connections: Sql[] = [];

function connection(port: 5432 | 6543, user: "runtime" | "admin", max = 1): Sql {
  const sql = postgres({
    host,
    port,
    database: "postgres",
    user: user === "runtime" ? `crm_h0_runtime.${projectRef}` : `postgres.${projectRef}`,
    password: user === "runtime" ? runtimePassword : jitPat,
    ssl: { ca, rejectUnauthorized: true },
    max,
    prepare: false,
    connect_timeout: 15,
    idle_timeout: 5,
    connection: user === "admin" ? { options: "-c jit=true" } : {},
  });
  connections.push(sql);
  return sql;
}

const denied = (operation: PromiseLike<unknown>) => assert.rejects(Promise.resolve(operation),
  (error: unknown) => ["42501", "42P01", "3F000", "0LP01"].includes((error as { code?: string }).code ?? ""));
const sha = (value: Buffer) => createHash("sha256").update(value).digest("hex");
const mac = (payload: Buffer, material = key) => createHmac("sha256", material).update(payload).digest();
const context = issueTrustedContext({
  identityId: "actor-hosted-A",
  identityKind: "technical",
  purpose: "hosted-validation",
  scope: "scope-hosted-A",
  requestId: "hosted-plan-auth-006",
  serverTime: new Date().toISOString(),
});

async function binding(tx: TransactionSql) {
  const [row] = await tx<{ xid: string; pid: string; database: string; start: string; login: string; now: string }[]>`
    select pg_current_xact_id()::text as xid, pg_backend_pid()::text as pid,
      (select oid::text from pg_database where datname=current_database()) as database,
      (extract(epoch from pg_postmaster_start_time())*1000000)::bigint::text as start,
      session_user::text as login,
      floor(extract(epoch from clock_timestamp())*1000000)::bigint::text as now
  `;
  assert.ok(row);
  return row;
}

async function capability(tx: TransactionSql, operation: "C01" | "C03", input: Buffer) {
  const b = await binding(tx);
  const fields = [
    "CRM-H0F1", "1", meta.keyId, meta.audience, meta.generation,
    b.database, b.start, b.xid, b.pid, "crm_h0_runtime",
    context.identityId, "technical", context.purpose, context.scope,
    operation, "access_probe", operation === "C01" ? "read_probe" : "apply_probe_batch",
    sha(input), b.now, (BigInt(b.now) + 30000000n).toString(), randomUUID(),
  ];
  const payload = encodeF1Fields(fields);
  return { fields, payload, mac: mac(payload), binding: b };
}

test("PLAN-AUTH-006 hosted DB/F1 subset", async t => {
  const admin = connection(5432, "admin");
  const session = connection(5432, "runtime");
  const transaction = connection(6543, "runtime");
  const other = connection(6543, "runtime");
  const createdIds = new Set<string>();
  try {
    await t.test("runtime identity and TLS-backed pooler login", async () => {
      for (const sql of [session, transaction]) {
        const [row] = await sql<{ current_user: string; session_user: string; ssl: boolean }[]>`
          select current_user::text, session_user::text,
            (select ssl from pg_stat_ssl where pid=pg_backend_pid()) as ssl
        `;
        assert.deepEqual(row, { current_user: "crm_h0_runtime", session_user: "crm_h0_runtime", ssl: true });
      }
    });

    await t.test("transaction pooler keeps backend/xid affinity only inside the unit", async () => {
      const seen: { pid: string; xid: string }[] = [];
      for (let i = 0; i < 4; i++) {
        await transaction.begin(async tx => {
          const first = await binding(tx);
          const second = await binding(tx);
          assert.equal(second.pid, first.pid);
          assert.equal(second.xid, first.xid);
          seen.push({ pid: first.pid, xid: first.xid });
          await tx`select set_config('crm.f1_payload','hostile',true)`;
        });
        const [residual] = await transaction<{ value: string | null }[]>`
          select nullif(current_setting('crm.f1_payload',true),'') as value
        `;
        assert.equal(residual.value, null);
      }
      assert.equal(new Set(seen.map(value => value.xid)).size, seen.length);
    });

    await t.test("F01/M2 direct SQL, GUC and role escalation remain denied", async () => {
      await session`select set_config('crm.identity_id','actor-hostile',false),
        set_config('crm.identity_kind','technical',false),set_config('crm.scope','scope-hosted-A',false)`;
      const attacks = [
        "select * from crm_private.access_probe",
        "insert into crm_private.access_probe values ('hostile','scope-hosted-A','x','x')",
        "update crm_private.access_probe set public_value='x'",
        "delete from crm_private.access_probe",
        "select secret from crm_f1.keys",
        "update crm_f1.keys set enabled=true",
        "select crm_f1.verify(null,null,null,'C01')",
        "select crm_f1.row_allows('scope-hosted-A','x','x','C01')",
        "set role crm_h0_verifier",
        "set role crm_h0_executor",
        "set role crm_h0_table_owner",
        "set role crm_h0_migration",
        "alter table crm_private.access_probe disable row level security",
        "create schema hostile",
        "grant crm_h0_executor to crm_h0_runtime",
      ];
      for (const attack of attacks) await denied(session.unsafe(attack));
    });

    await t.test("catalog proves minimum grants, owners, FORCE RLS and no signing oracle", async () => {
      const [role] = await admin`select rolcanlogin,rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,rolinherit
        from pg_roles where rolname='crm_h0_runtime'`;
      assert.deepEqual(role, { rolcanlogin: true, rolsuper: false, rolbypassrls: false,
        rolcreatedb: false, rolcreaterole: false, rolinherit: false });
      assert.equal((await admin`select 1 from pg_auth_members where member='crm_h0_runtime'::regrole`).length, 0);
      const [table] = await admin`select relrowsecurity,relforcerowsecurity,pg_get_userbyid(relowner) as owner
        from pg_class where oid='crm_private.access_probe'::regclass`;
      assert.deepEqual(table, { relrowsecurity: true, relforcerowsecurity: true, owner: "crm_h0_table_owner" });
      const publicExecute = await admin`select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        cross join lateral aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
        where n.nspname in ('crm_api','crm_f1') and a.grantee=0 and a.privilege_type='EXECUTE'`;
      assert.equal(publicExecute.length, 0);
      assert.equal((await admin`select has_table_privilege('crm_h0_runtime','crm_f1.keys','SELECT') as allowed`)[0].allowed, false);
      assert.equal((await admin`select has_table_privilege('crm_h0_executor','crm_f1.keys','SELECT') as allowed`)[0].allowed, false);
      for (const privilege of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
        assert.equal((await admin`select has_table_privilege('crm_h0_verifier','crm_private.access_probe',${privilege}) as allowed`)[0].allowed, false);
      }
    });

    const seed = `hosted-seed-${randomUUID()}`;
    const second = `hosted-second-${randomUUID()}`;
    createdIds.add(seed); createdIds.add(second);

    await t.test("C03 authenticates a manifest, is atomic and consumes once", async () => {
      const input = encodeF1Fields(["CRM-INP1", "C03", "hosted-unit", "true", "true",
        "record-technical-probe", seed, "public-A",
        "record-technical-probe", second, "public-B"]);
      await transaction.begin(async tx => {
        const cap = await capability(tx, "C03", input);
        const [result] = await tx<{ ids: string[] }[]>`select crm_api.apply_probe_batch(${cap.payload},${cap.mac},${input}) as ids`;
        assert.deepEqual(result.ids, [seed, second]);
        await denied(tx.savepoint(sp => sp`select crm_api.apply_probe_batch(${cap.payload},${cap.mac},${input})`));
      });
      const duplicate = `hosted-rollback-${randomUUID()}`;
      createdIds.add(duplicate);
      const failing = encodeF1Fields(["CRM-INP1", "C03", "hosted-rollback", "true", "true",
        "record-technical-probe", duplicate, "must-rollback",
        "record-technical-probe", seed, "duplicate"]);
      await denied(transaction.begin(async tx => {
        const cap = await capability(tx, "C03", failing);
        await tx`select crm_api.apply_probe_batch(${cap.payload},${cap.mac},${failing})`;
      }));
      const adapter = new H0M01PostgresAdapter(transaction, configuration);
      assert.equal((await adapter.read(context, { probeId: duplicate })).data, undefined);
    });

    await t.test("C01 is end-to-end, scoped and minimally projected on both pooler modes", async () => {
      for (const sql of [session, transaction]) {
        const adapter = new H0M01PostgresAdapter(sql, configuration);
        assert.deepEqual((await adapter.read(context, { probeId: seed })).data,
          { probeId: seed, publicValue: "public-A" });
        const wrong = issueTrustedContext({ ...context, scope: "scope-hosted-B", requestId: randomUUID() });
        assert.equal((await adapter.read(wrong, { probeId: seed })).data, undefined);
        assert.equal((await adapter.read(context, { probeId: "'; select secret from crm_f1.keys; --" })).data, undefined);
      }
    });

    await t.test("capability mutations and cross-transaction/client replay fail closed", async () => {
      const input = encodeF1Fields(["CRM-INP1", "C01", seed]);
      let previous: { payload: Buffer; mac: Buffer } | undefined;
      await transaction.begin(async tx => {
        const cap = await capability(tx, "C01", input); previous = cap;
        const [valid] = await tx`select * from crm_api.read_probe(${cap.payload},${cap.mac},${input})`;
        assert.equal(valid.probe_id, seed);
        for (const index of [2, 3, 4, 8, 13, 14, 16, 17]) {
          const changed = [...cap.fields]; changed[index] += "-mutated";
          await denied(tx.savepoint(sp => sp`select * from crm_api.read_probe(${encodeF1Fields(changed)},${cap.mac},${input})`));
        }
        await denied(tx.savepoint(sp => sp`select * from crm_api.read_probe(${cap.payload},${randomBytes(32)},${input})`));
        await denied(tx.savepoint(sp => sp`select * from crm_api.read_probe(${cap.payload},${Buffer.alloc(0)},${input})`));
        const changedInput = encodeF1Fields(["CRM-INP1", "C01", second]);
        await denied(tx.savepoint(sp => sp`select * from crm_api.read_probe(${cap.payload},${cap.mac},${changedInput})`));
        await denied(other.begin(ot => ot`select * from crm_api.read_probe(${cap.payload},${cap.mac},${input})`));
      });
      await denied(transaction.begin(tx => tx`select * from crm_api.read_probe(${previous!.payload},${previous!.mac},${input})`));
    });

    await t.test("key rotation and revocation are fail-closed", async () => {
      const rotated: F1SigningConfiguration = { ...configuration, keyId: randomUUID(), key: randomBytes(32) };
      await admin.begin(async tx => {
        await tx.unsafe("set local role crm_h0_migration");
        await tx`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
          values (${rotated.keyId},${Buffer.from(rotated.key)},${rotated.audience},${rotated.generation},
            ${rotated.allowedPurposes},true,clock_timestamp()-interval '1 minute',clock_timestamp()+interval '1 hour')`;
      });
      try {
        const rotatedAdapter = new H0M01PostgresAdapter(transaction, rotated);
        assert.equal((await rotatedAdapter.read(context, { probeId: seed })).data?.probeId, seed);
        await admin.begin(async tx => {
          await tx.unsafe("set local role crm_h0_migration");
          await tx`update crm_f1.keys set enabled=false where key_id=${configuration.keyId}`;
        });
        const original = new H0M01PostgresAdapter(transaction, configuration);
        await assert.rejects(original.read(context, { probeId: seed }), /F1_READ_DENIED/);
      } finally {
        await admin.begin(async tx => {
          await tx.unsafe("set local role crm_h0_migration");
          await tx`update crm_f1.keys set enabled=true where key_id=${configuration.keyId}`;
          await tx`delete from crm_f1.keys where key_id=${rotated.keyId}`;
        });
      }
    });

    await t.test("bounded F1/C01 performance has no evident hosted infeasibility", async () => {
      const adapter = new H0M01PostgresAdapter(transaction, configuration);
      const samples: number[] = [];
      for (let i = 0; i < 12; i++) {
        const start = performance.now();
        assert.equal((await adapter.read(context, { probeId: seed })).data?.probeId, seed);
        samples.push(performance.now() - start);
      }
      samples.sort((a, b) => a - b);
      assert.ok(samples[6] < 2000);
      t.diagnostic(`bounded C01 median=${samples[6].toFixed(1)}ms p95=${samples[11].toFixed(1)}ms`);
    });
  } finally {
    try {
      await admin.begin(async tx => {
        await tx.unsafe("set local role crm_h0_migration");
        await tx`delete from crm_private.access_probe where probe_id = any(${[...createdIds]})`;
        await tx`delete from crm_f1.consumption where generation=${configuration.generation}`;
      });
    } finally {
      await Promise.allSettled(connections.map(sql => sql.end({ timeout: 3 })));
    }
  }
});
