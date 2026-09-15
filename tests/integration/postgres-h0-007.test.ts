import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import postgres from "postgres";
import {
  invokeC01,
  invokeC03,
  type ContractRequest,
} from "../../src/application/contracts.ts";
import { issueTrustedContext } from "../../src/application/trusted-context.ts";
import type { CommonGuardFacts } from "../../src/domain/guards.ts";
import { H0M01PostgresAdapter } from "../../src/infrastructure/postgres/h0-m01-adapter.ts";
import { withTrustedPostgresTransaction } from "../../src/infrastructure/postgres/transaction.ts";

const postgresBin = process.env.POSTGRES_H0_BIN;
if (!postgresBin) throw new Error("POSTGRES_H0_BIN_REQUIRED");

const projectRoot = resolve(import.meta.dirname, "../..");
const databaseName = "crm_h0_007_test";
const socketPort = 55407;
let temporaryRoot = "";
let dataDirectory = "";
let socketDirectory = "";
let logPath = "";
let migrationApplied = false;

let bootstrapSql: postgres.Sql;
let migrationSql: postgres.Sql;
let runtimeSql: postgres.Sql;
let adapter: H0M01PostgresAdapter;

const guards: CommonGuardFacts = {
  identityAndScope: "satisfied",
  materialTruth: "satisfied",
  sensitiveSupervision: "not-required",
  conservation: "satisfied",
  independence: "satisfied",
  repetition: "new",
};

function contextFor(scope: string, requestId: string) {
  return issueTrustedContext({
    identityId: "technical-actor-synthetic-007",
    identityKind: "technical",
    purpose: "h0-007-local-verification",
    scope,
    requestId,
    serverTime: "2026-09-15T15:00:00.000Z",
  });
}

function request<T>(scope: string, input: T): ContractRequest<T> {
  return { context: contextFor(scope, `request-${scope}`), scope, guards, input };
}

function runPostgresCommand(executable: string, args: readonly string[]): void {
  const result = spawnSync(join(postgresBin!, executable), args, {
    encoding: "utf8",
    env: { ...process.env, LC_ALL: "C" },
  });
  if (result.status !== 0) {
    throw new Error(`${executable} failed with status ${String(result.status)}`);
  }
}

function connection(user: string, database = databaseName): postgres.Sql {
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

async function contextValue(): Promise<string | null> {
  const rows = await runtimeSql<{ identity_id: string | null }[]>`
    select nullif(current_setting('crm.identity_id', true), '') as identity_id
  `;
  return rows[0]?.identity_id ?? null;
}

before(async () => {
  temporaryRoot = await mkdtemp(join(tmpdir(), "crm-h0-007-"));
  dataDirectory = join(temporaryRoot, "data");
  socketDirectory = join(temporaryRoot, "socket");
  logPath = join(temporaryRoot, "postgres.log");
  await mkdir(socketDirectory);
  runPostgresCommand("initdb", [
    "-D", dataDirectory,
    "--username=bootstrap_h0_007",
    "--auth-local=trust",
    "--auth-host=scram-sha-256",
    "--no-locale",
  ]);
  runPostgresCommand("pg_ctl", [
    "-D", dataDirectory,
    "-l", logPath,
    "-o", `-k '${socketDirectory}' -h '' -p ${String(socketPort)}`,
    "-w",
    "start",
  ]);

  bootstrapSql = connection("bootstrap_h0_007", "postgres");
  const rolesMigration = await readFile(
    join(projectRoot, "supabase/migrations/202609150000_h0_m01_roles.sql"),
    "utf8",
  );
  await bootstrapSql.unsafe(rolesMigration);
  await bootstrapSql.unsafe(`create database ${databaseName} owner crm_h0_migration`);

  migrationSql = connection("crm_h0_migration");
  const contextMigration = await readFile(
    join(projectRoot, "supabase/migrations/202609150001_h0_m01_context.sql"),
    "utf8",
  );
  await migrationSql.unsafe(contextMigration);
  migrationApplied = true;

  runtimeSql = connection("crm_h0_runtime");
  adapter = new H0M01PostgresAdapter(runtimeSql);

  await withTrustedPostgresTransaction(
    migrationSql,
    contextFor("scope-synthetic-007", "seed-request-007-a"),
    async (transaction) => {
      await transaction`
        insert into crm_private.access_probe (
          probe_id,
          context_scope,
          public_value,
          private_value
        ) values (
          'probe-synthetic-007-a',
          'scope-synthetic-007',
          'public-synthetic-007-a',
          'private-synthetic-007-a'
        )
      `;
    },
  );
  await withTrustedPostgresTransaction(
    migrationSql,
    contextFor("scope-other-007", "seed-request-007-b"),
    async (transaction) => {
      await transaction`
        insert into crm_private.access_probe (
          probe_id,
          context_scope,
          public_value,
          private_value
        ) values (
          'probe-synthetic-007-b',
          'scope-other-007',
          'public-synthetic-007-b',
          'private-synthetic-007-b'
        )
      `;
    },
  );
});

after(async () => {
  await Promise.allSettled([
    runtimeSql?.end({ timeout: 1 }),
    migrationSql?.end({ timeout: 1 }),
    bootstrapSql?.end({ timeout: 1 }),
  ]);
  if (dataDirectory) {
    runPostgresCommand("pg_ctl", ["-D", dataDirectory, "-m", "fast", "-w", "stop"]);
  }
  if (temporaryRoot.startsWith(tmpdir())) {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("H0-007 runtime is non-owner and has no global privilege attributes", async () => {
  const rows = await bootstrapSql<{
    rolsuper: boolean;
    rolcreatedb: boolean;
    rolcreaterole: boolean;
    rolinherit: boolean;
    rolbypassrls: boolean;
  }[]>`
    select rolsuper, rolcreatedb, rolcreaterole, rolinherit, rolbypassrls
    from pg_roles
    where rolname = 'crm_h0_runtime'
  `;
  assert.deepEqual(rows[0], {
    rolsuper: false,
    rolcreatedb: false,
    rolcreaterole: false,
    rolinherit: false,
    rolbypassrls: false,
  });
  const owners = await migrationSql<{ owner: string }[]>`
    select pg_get_userbyid(relowner) as owner
    from pg_class
    where oid = 'crm_private.access_probe'::regclass
  `;
  assert.equal(owners[0]?.owner, "crm_h0_migration");
});

test("H0-007 runtime cannot administer schema", async () => {
  await assert.rejects(runtimeSql`create table public.forbidden_h0_007 (id integer)`);
  await assert.rejects(runtimeSql`create schema forbidden_h0_007`);
});

test("H0-007 runtime cannot grant itself privileges or roles", async () => {
  await assert.rejects(runtimeSql`grant crm_h0_migration to crm_h0_runtime`);
  await assert.rejects(runtimeSql`grant all on crm_private.access_probe to crm_h0_runtime`);
});

test("H0-007 generic untrusted role cannot connect to the Core database", async () => {
  const untrusted = connection("crm_h0_untrusted");
  try {
    await assert.rejects(untrusted`select 1`);
  } finally {
    await untrusted.end({ timeout: 1 });
  }
});

test("H0-007 absence of context is denied by RLS", async () => {
  const rows = await runtimeSql<{ probe_id: string }[]>`
    select probe_id from crm_private.access_probe
  `;
  assert.deepEqual(Array.from(rows), []);
  await assert.rejects(runtimeSql`select crm_api.record_probe('no-context-007', 'denied')`);
});

test("H0-007 valid technical context authorizes only its scoped projection", async () => {
  const projection = await adapter.read(
    contextFor("scope-synthetic-007", "valid-context-request-007"),
    { probeId: "probe-synthetic-007-a" },
  );
  assert.deepEqual(projection.data, {
    probeId: "probe-synthetic-007-a",
    publicValue: "public-synthetic-007-a",
  });
});

test("H0-007 hostile client fields cannot establish trusted context", async () => {
  const hostile = {
    probeId: "probe-synthetic-007-a",
    actor_id: "attacker-007",
    trusted_context: true,
    role: "crm_h0_migration",
    permissions: ["all"],
    migration_identity: "crm_h0_migration",
    privileged: true,
    bypass_rls: true,
  };
  const result = await invokeC01(request("scope-synthetic-007", hostile), adapter);
  assert.equal(result.status, "applied");
  assert.equal(result.status === "applied" ? result.value.data?.probeId : undefined, "probe-synthetic-007-a");
  const forged = {
    identityId: "attacker-007",
    identityKind: "technical" as const,
    purpose: "forged",
    scope: "scope-synthetic-007",
    requestId: "forged-base-007",
    serverTime: "2026-09-15T15:00:00.000Z",
  } as ReturnType<typeof contextFor>;
  await assert.rejects(adapter.read(forged, { probeId: "probe-synthetic-007-a" }));
});

test("H0-007 commit clears transaction-local identity", async () => {
  await adapter.read(
    contextFor("scope-synthetic-007", "commit-context-007"),
    { probeId: "probe-synthetic-007-a" },
  );
  assert.equal(await contextValue(), null);
});

test("H0-007 rollback clears transaction-local identity", async () => {
  await assert.rejects(withTrustedPostgresTransaction(
    runtimeSql,
    contextFor("scope-synthetic-007", "rollback-context-007"),
    async () => {
      throw new Error("SYNTHETIC_ROLLBACK_H0_007");
    },
  ));
  assert.equal(await contextValue(), null);
});

test("H0-007 database error clears transaction-local identity", async () => {
  await assert.rejects(withTrustedPostgresTransaction(
    runtimeSql,
    contextFor("scope-synthetic-007", "error-context-007"),
    async (transaction) => {
      await transaction`select * from crm_private.relation_that_does_not_exist`;
    },
  ));
  assert.equal(await contextValue(), null);
});

test("H0-007 reused max-one connection does not inherit the prior actor", async () => {
  await adapter.read(
    contextFor("scope-synthetic-007", "reuse-context-a-007"),
    { probeId: "probe-synthetic-007-a" },
  );
  assert.equal(await contextValue(), null);
  const withoutContext = await runtimeSql<{ probe_id: string }[]>`
    select probe_id from crm_private.access_probe
  `;
  assert.deepEqual(Array.from(withoutContext), []);
});

test("H0-007 grants and RLS jointly hide rows from another scope", async () => {
  const rows = await withTrustedPostgresTransaction(
    runtimeSql,
    contextFor("scope-synthetic-007", "rls-context-007"),
    (transaction) => transaction<{ probe_id: string }[]>`
      select probe_id from crm_private.access_probe order by probe_id
    `,
  );
  assert.deepEqual(Array.from(rows), [{ probe_id: "probe-synthetic-007-a" }]);
});

test("H0-007 runtime cannot read the reserved column directly", async () => {
  await assert.rejects(withTrustedPostgresTransaction(
    runtimeSql,
    contextFor("scope-synthetic-007", "private-column-007"),
    async (transaction) => {
      await transaction`select private_value from crm_private.access_probe`;
    },
  ));
});

test("H0-007 runtime cannot perform arbitrary table DML", async () => {
  await assert.rejects(withTrustedPostgresTransaction(
    runtimeSql,
    contextFor("scope-synthetic-007", "direct-dml-007"),
    async (transaction) => {
      await transaction`
        insert into crm_private.access_probe (
          probe_id,
          context_scope,
          public_value
        ) values ('direct-dml-007', 'scope-synthetic-007', 'forbidden')
      `;
    },
  ));
});

test("H0-007 H0-M01 migrations execute from an empty local cluster", () => {
  assert.equal(migrationApplied, true);
});

test("H0-007 migration and runtime authorities are separate", async () => {
  const migrationIdentity = await migrationSql<{ current_user: string }[]>`select current_user`;
  const runtimeIdentity = await runtimeSql<{ current_user: string }[]>`select current_user`;
  assert.equal(migrationIdentity[0]?.current_user, "crm_h0_migration");
  assert.equal(runtimeIdentity[0]?.current_user, "crm_h0_runtime");
  await assert.rejects(runtimeSql.unsafe(
    await readFile(join(projectRoot, "supabase/migrations/202609150001_h0_m01_context.sql"), "utf8"),
  ));
});

test("H0-007 C01 consumes a real authorized PostgreSQL read port", async () => {
  const result = await invokeC01(
    request("scope-synthetic-007", { probeId: "probe-synthetic-007-a" }),
    adapter,
  );
  assert.equal(result.status, "applied");
  assert.equal(result.status === "applied" ? result.value.provenance : undefined, "postgres-h0-m01");
});

test("H0-007 C03 commits a real PostgreSQL unit through the narrow function", async () => {
  const result = await invokeC03(request("scope-synthetic-007", {
    operationId: "operation-c03-success-007",
    changes: [{
      kind: "record-technical-probe" as const,
      probeId: "probe-c03-success-007",
      publicValue: "public-c03-success-007",
    }],
    historyRequired: true as const,
    resultRequired: true as const,
  }), adapter);
  assert.equal(result.status, "applied");
  const projection = await adapter.read(
    contextFor("scope-synthetic-007", "read-c03-success-007"),
    { probeId: "probe-c03-success-007" },
  );
  assert.equal(projection.data?.publicValue, "public-c03-success-007");
});

test("H0-007 C03 rolls back all changes after a database error", async () => {
  const duplicated = "probe-c03-rollback-007";
  await assert.rejects(invokeC03(request("scope-synthetic-007", {
    operationId: "operation-c03-rollback-007",
    changes: [
      { kind: "record-technical-probe" as const, probeId: duplicated, publicValue: "first" },
      { kind: "record-technical-probe" as const, probeId: duplicated, publicValue: "second" },
    ],
    historyRequired: true as const,
    resultRequired: true as const,
  }), adapter));
  const projection = await adapter.read(
    contextFor("scope-synthetic-007", "read-c03-rollback-007"),
    { probeId: duplicated },
  );
  assert.equal(projection.data, undefined);
  assert.equal(await contextValue(), null);
});
