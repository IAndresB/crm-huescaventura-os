import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import postgres from "postgres";

const postgresBin = process.env.POSTGRES_H0_BIN;
if (!postgresBin) throw new Error("POSTGRES_H0_BIN_REQUIRED");

const projectRoot = resolve(import.meta.dirname, "../..");
const databaseName = "crm_h0_008_verification";
const socketPort = 55408;
let temporaryRoot = "";
let dataDirectory = "";
let socketDirectory = "";
let logPath = "";

let bootstrapSql: postgres.Sql;
let migrationSql: postgres.Sql;
let runtimeSql: postgres.Sql;

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

before(async () => {
  temporaryRoot = await mkdtemp(join(tmpdir(), "crm-h0-008-verification-"));
  dataDirectory = join(temporaryRoot, "data");
  socketDirectory = join(temporaryRoot, "socket");
  logPath = join(temporaryRoot, "postgres.log");
  await mkdir(socketDirectory);

  runPostgresCommand("initdb", [
    "-D", dataDirectory,
    "--username=bootstrap_h0_008",
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

  bootstrapSql = connection("bootstrap_h0_008", "postgres");
  await bootstrapSql.unsafe(await readFile(
    join(projectRoot, "supabase/migrations/202609150000_h0_m01_roles.sql"),
    "utf8",
  ));
  await bootstrapSql.unsafe(`create database ${databaseName} owner crm_h0_migration`);

  migrationSql = connection("crm_h0_migration");
  await migrationSql.unsafe(await readFile(
    join(projectRoot, "supabase/migrations/202609150001_h0_m01_context.sql"),
    "utf8",
  ));
  runtimeSql = connection("crm_h0_runtime");

  await migrationSql.begin(async (transaction) => {
    await transaction`select set_config('crm.identity_id', 'seed-authority-008', true)`;
    await transaction`select set_config('crm.identity_kind', 'technical', true)`;
    await transaction`select set_config('crm.scope', 'scope-protected-008', true)`;
    await transaction`
      insert into crm_private.access_probe (
        probe_id,
        context_scope,
        public_value,
        private_value
      ) values (
        'probe-protected-008',
        'scope-protected-008',
        'protected-value-008',
        'private-value-008'
      )
    `;
  });
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

test("H0-008 knowing GUC names must not let runtime self-declare authority", async () => {
  const rows = await runtimeSql.begin(async (transaction) => {
    await transaction`select set_config('crm.identity_id', 'self-declared-runtime-008', true)`;
    await transaction`select set_config('crm.identity_kind', 'technical', true)`;
    await transaction`select set_config('crm.scope', 'scope-protected-008', true)`;
    return transaction<{ probe_id: string }[]>`
      select probe_id
      from crm_private.access_probe
      where probe_id = 'probe-protected-008'
    `;
  });

  assert.deepEqual(Array.from(rows), []);
});
