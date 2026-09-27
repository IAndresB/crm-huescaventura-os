import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import postgres from "postgres";
import { verifyAuth } from "../../src/application/verified-auth.ts";
import type { VerifiedAuthEvidence } from "../../src/application/verified-auth.ts";
import { issueTrustedContext } from "../../src/application/trusted-context.ts";
import { classifyServerEvent } from "../../src/application/verified-interaction.ts";
import { H0005PostgresAdapter } from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import { H0009PostgresAdapter } from "../../src/infrastructure/postgres/h0-009-adapter.ts";
import { fingerprintHumanApprovalMaterial, fingerprintHumanApprovalPart, H0011PostgresAdapter, type HumanApprovalMaterial } from "../../src/infrastructure/postgres/h0-011-adapter.ts";
import type { F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";
import type { F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";

const bin = process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root = resolve(import.meta.dirname, "../..");
const port = 55421;
const db = "crm_h0_011_test";
let temp = "";
let data = "";
let socket = "";
let started = false;
let admin: postgres.Sql;
let migration: postgres.Sql;
let runtime: postgres.Sql;
let runtimeB: postgres.Sql;
let untrusted: postgres.Sql;
let f1: F1SigningConfiguration;
let f2: F2SigningConfiguration;
let approval: H0011PostgresAdapter;
let approvalB: H0011PostgresAdapter;
let humanAuth: Awaited<ReturnType<typeof verifyAuth>>;
let interaction: ReturnType<typeof classifyServerEvent>;
let f01UpgradePreserved = false;
const f01Migration = "202609270001_h0_m04_f2_unit_revalidation_fix.sql";
const actorId = randomUUID();
const subjectId = randomUUID();
const scope = "scope-h0-011-synthetic";

function command(name: string, args: readonly string[]): void {
  const result = spawnSync(join(bin!, name), args, { encoding: "utf8", env: { ...process.env, LC_ALL: "C" } });
  assert.equal(result.status, 0, `${name} failed: ${result.stderr}`);
}

function connect(user: string, database = db): postgres.Sql {
  return postgres({ host: socket, port, database, user, max: 1, prepare: false, connect_timeout: 2 });
}

async function apply(file: string): Promise<void> {
  const source = await readFile(join(root, "supabase/migrations", file), "utf8");
  await migration.unsafe(source);
}

before(async () => {
  temp = await mkdtemp(join(tmpdir(), "crm-h0-011-"));
  data = join(temp, "data");
  socket = join(temp, "socket");
  await mkdir(socket);
  command("initdb", ["-D", data, "--username=bootstrap_h0_011", "--auth-local=trust", "--auth-host=scram-sha-256", "--no-locale", "--encoding=UTF8"]);
  command("pg_ctl", ["-D", data, "-l", join(temp, "postgres.log"), "-o", `-k '${socket}' -h '' -p ${port}`, "-w", "start"]);
  started = true;
  admin = postgres({ host: socket, port, database: "postgres", user: "bootstrap_h0_011", max: 1, prepare: false });
  await admin.unsafe(await readFile(join(root, "supabase/migrations/202609150000_h0_m01_roles.sql"), "utf8"));
  await admin.unsafe(`create database ${db} owner crm_h0_migration`);
  await admin.end();
  admin = connect("bootstrap_h0_011");
  migration = connect("crm_h0_migration");
  await apply("202609150001_h0_m01_context.sql");
  await admin.unsafe(await readFile(join(root, "supabase/migrations/202609160000_h0_f1_authorities.sql"), "utf8"));
  await apply("202609160001_h0_f1_capabilities.sql");
  await apply("202609250000_h0_m02_unit_history.sql");
  await admin.unsafe(await readFile(join(root, "supabase/migrations/202609260000_h0_m03_authorities.sql"), "utf8"));
  await apply("202609260001_h0_m03_actor_session_access.sql");
  await apply("202609260002_h0_m03_revoke_all_authority_fix.sql");
  await apply("202609260003_h0_m03_f2_expiry_revalidation_fix.sql");
  f1 = { key: randomBytes(32), keyId: randomUUID(), audience: "h0-011-audience", generation: randomUUID(),
    allowedPurposes: ["h0-005-human-bridge", "h0-011-human-approval"] };
  f2 = { key: randomBytes(32), keyId: randomUUID(), audience: "h0-011-audience", generation: randomUUID(),
    allowedPurposes: ["full-identification", "core-human-access", "session-revocation"] };
  await migration`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f1.keyId},${Buffer.from(f1.key)},${f1.audience},${f1.generation},${f1.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},${f2.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`select crm_api.provision_actor_mapping(${actorId}::uuid,${subjectId}::uuid,${scope})`;
  runtime = connect("crm_h0_runtime");
  const durable = new H0009PostgresAdapter(runtime, f1);
  const seedContext = issueTrustedContext({ identityId: "h0-011-upgrade-seed", identityKind: "technical",
    purpose: "h0-011-human-approval", scope, requestId: "request-h0-011-upgrade-seed",
    serverTime: "2026-09-27T12:00:00.000Z" });
  assert.equal((await durable.commit(seedContext, { operationId: "m04-upgrade-preserved", expectedVersion: "0",
    historyRequired: true, resultRequired: true, changes: [{ kind: "set-technical-state",
      rootId: "m04-upgrade-root", afterValue: "predecessor-preserved", reason: "upgrade-fixture",
      source: "h0-011-v-mig", evidenceState: "none" }] })).status, "applied");
  await admin.unsafe(`create function public.fail_h011_migration() returns event_trigger language plpgsql as $$
    declare command record;
    begin
      for command in select * from pg_event_trigger_ddl_commands() loop
        if command.object_identity='crm_ha.proposals' then raise exception 'SYNTHETIC_H0_011_MIGRATION_FAILURE'; end if;
      end loop;
    end $$;
    create event trigger fail_h011_migration on ddl_command_end when tag in ('CREATE TABLE')
      execute function public.fail_h011_migration()`);
  await assert.rejects(() => apply("202609270000_h0_m04_human_approval.sql"));
  await migration.end();
  migration = connect("crm_h0_migration");
  assert.equal((await admin`select to_regnamespace('crm_ha') is null empty`)[0]!.empty, true);
  assert.equal((await admin`select current_value from crm_private.unit_roots where root_id='m04-upgrade-root'`)[0]!.current_value,
    "predecessor-preserved");
  await admin.unsafe("drop event trigger fail_h011_migration; drop function public.fail_h011_migration()");
  await apply("202609270000_h0_m04_human_approval.sql");
  // F01 upgrade: keep predecessor fixtures byte-for-byte, including a M04 row.
  await admin`insert into crm_ha.proposals values('f01-upgrade-fixture',repeat('a',64),
    convert_to('synthetic predecessor preservation sentinel','UTF8'),'ai',${actorId}::uuid,
    ${scope},clock_timestamp())`;
  const prior = await admin`select row_to_json(p)::text v from crm_ha.proposals p
    where proposal_id='f01-upgrade-fixture'`;
  const priorRoot = await admin`select row_to_json(r)::text v from crm_private.unit_roots r
    where root_id='m04-upgrade-root'`;
  const fixSource = await readFile(join(root, "supabase/migrations", f01Migration), "utf8");
  for (const wrong of [runtime, admin]) {
    await assert.rejects(() => wrong.unsafe(fixSource), { code: "42501" });
    await wrong.unsafe("rollback");
  }
  await admin.unsafe(`create function public.fail_f01_upgrade() returns event_trigger language plpgsql as $$
    declare c record;
    begin for c in select * from pg_event_trigger_ddl_commands() loop
      if exists(select 1 from pg_proc where oid=c.objid and proname='commit_internal_unit' and pronargs=6)
      then raise exception 'SYNTHETIC_F01_UPGRADE_FAILURE'; end if;
    end loop; end $$;
    create event trigger fail_f01_upgrade on ddl_command_end when tag in ('CREATE FUNCTION')
      execute function public.fail_f01_upgrade()`);
  try {
    await assert.rejects(() => apply(f01Migration), { code: "P0001" });
    await migration.unsafe("rollback");
    assert.equal((await admin`select to_regprocedure('crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)') is null absent`)[0]!.absent, true);
    assert.deepEqual(await admin`select row_to_json(p)::text v from crm_ha.proposals p where proposal_id='f01-upgrade-fixture'`, prior);
  } finally {
    await admin.unsafe("drop event trigger fail_f01_upgrade; drop function public.fail_f01_upgrade()");
  }
  await apply(f01Migration);
  await assert.rejects(() => apply(f01Migration), { code: "42723" });
  await migration.unsafe("rollback");
  assert.deepEqual(await admin`select row_to_json(p)::text v from crm_ha.proposals p where proposal_id='f01-upgrade-fixture'`, prior);
  assert.deepEqual(await admin`select row_to_json(r)::text v from crm_private.unit_roots r where root_id='m04-upgrade-root'`, priorRoot);
  f01UpgradePreserved = true;
  await admin.unsafe("create role h0_011_untrusted login");
  runtimeB = connect("crm_h0_runtime");
  untrusted = connect("h0_011_untrusted");
  const proof = randomUUID();
  const auth = await verifyAuth({ verify: async (candidate) => candidate === proof
    ? { subject: subjectId, passwordVerified: true, mfaVerified: true } : undefined }, proof);
  const access = new H0005PostgresAdapter(runtime, f1, f2);
  const session = await access.establish(auth);
  const sessionProof = randomUUID();
  humanAuth = await verifyAuth({ verify: async (candidate) => candidate === sessionProof
    ? { subject: subjectId, sessionId: session.sessionId, passwordVerified: true, mfaVerified: true } : undefined }, sessionProof);
  interaction = classifyServerEvent("core-action");
  approval = new H0011PostgresAdapter(runtime, f1, f2);
  approvalB = new H0011PostgresAdapter(runtimeB, f1, f2);
});

after(async () => {
  await Promise.allSettled([untrusted?.end({ timeout: 1 }), runtimeB?.end({ timeout: 1 }), runtime?.end({ timeout: 1 }), admin?.end({ timeout: 1 }), migration?.end({ timeout: 1 })]);
  if (started) command("pg_ctl", ["-D", data, "-m", "fast", "-w", "stop"]);
  if (temp.startsWith(tmpdir())) await rm(temp, { recursive: true, force: true });
});

test("F01 correction V-MIG: predecessor M04/M02 survives denied authority, DDL rollback, upgrade and safe reapply denial", () => {
  assert.equal(f01UpgradePreserved, true);
});

test("F01 correction executor is narrow, NOLOGIN, fixed search_path, with no public grant or new key access", async () => {
  const [r] = await admin`select p.prosecdef, p.proconfig, o.rolname, o.rolcanlogin, o.rolbypassrls,
    has_schema_privilege(o.oid,'crm_api','create') can_create,
    has_table_privilege(o.oid,'crm_f2.keys','select') can_read_key,
    has_function_privilege('crm_h0_runtime',p.oid,'execute') runtime_execute,
    exists(select 1 from aclexplode(p.proacl) where grantee=0 and privilege_type='EXECUTE') public_execute
    from pg_proc p join pg_roles o on o.oid=p.proowner
    where p.oid='crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)'::regprocedure`;
  assert.deepEqual(r, { prosecdef: true, proconfig: ["search_path=pg_catalog, pg_temp"],
    rolname: "crm_h0_f2_executor", rolcanlogin: false, rolbypassrls: false,
    can_create: false, can_read_key: false, runtime_execute: true, public_execute: false });
  await assert.rejects(() => runtime`select * from crm_api.commit_internal_unit(null,null,null,null,null,null)`, { code: "42501" });
  await assert.rejects(() => untrusted`select * from crm_api.commit_internal_unit(null,null,null,null,null,null)`, { code: "42501" });
});

test("H0-011 V-MIG applies M04 forward after M01/F1/M02/M03 on PostgreSQL 17", async () => {
  const version = await admin<{ version: string }[]>`select current_setting('server_version') version`;
  assert.match(version[0]!.version, /^17\./u);
  assert.equal((await admin`select count(*)::int n from pg_tables where schemaname='crm_ha'`)[0]!.n, 6);
  assert.equal((await admin`select count(*)::int n from pg_roles where rolname like 'crm_h0_ha_%'`)[0]!.n, 0);
  const apiRole = await admin<{ select_ok: boolean; insert_ok: boolean; owner: string }[]>`
    select has_table_privilege('crm_h0_f2_executor','crm_ha.command_receipts','select') select_ok,
      has_table_privilege('crm_h0_f2_executor','crm_ha.command_receipts','insert') insert_ok,
      pg_get_userbyid((select proowner from pg_proc where oid='crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)'::regprocedure)) owner`;
  assert.deepEqual(apiRole[0], { select_ok: true, insert_ok: true, owner: "crm_h0_f2_executor" });
  const runtime = await admin<{ direct: boolean; execute: boolean }[]>`
    select has_table_privilege('crm_h0_runtime','crm_ha.proposals','select') direct,
      has_function_privilege('crm_h0_runtime','crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)','execute') execute`;
  assert.deepEqual(runtime[0], { direct: false, execute: true });
  const acl = await admin<{ table_owner: string; rls: boolean; force_rls: boolean; public_execute: boolean;
    helper_owner: string; helper_public_execute: boolean }[]>`
    select (select rolname from pg_roles where oid=c.relowner) table_owner,c.relrowsecurity rls,c.relforcerowsecurity force_rls,
      has_function_privilege('public','crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)','execute') public_execute,
      (select rolname from pg_roles where oid=hp.proowner) helper_owner,
      has_function_privilege('public','crm_ha.effect_record_allows(text,text,text,text,text,text,text)','execute') helper_public_execute
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
      join pg_proc hp on hp.oid='crm_ha.effect_record_allows(text,text,text,text,text,text,text)'::regprocedure
    where n.nspname='crm_ha' and c.relname='proposals'`;
  assert.deepEqual(acl[0], { table_owner: "crm_h0_table_owner", rls: true, force_rls: true,
    public_execute: false, helper_owner: "crm_h0_f2_executor", helper_public_execute: false });
  assert.deepEqual((await admin`select current_value from crm_private.unit_roots where root_id='m04-upgrade-root'`)[0],
    { current_value: "predecessor-preserved" });
  assert.equal((await admin`select count(*)::int n from crm_private.unit_history where operation_id='m04-upgrade-preserved'`)[0]!.n, 1);
});

function material(overrides: Partial<HumanApprovalMaterial> = {}): HumanApprovalMaterial {
  return {
    action: "send-synthetic-notice", contentVersion: "notice-v1", content: "Mensaje técnico de prueba",
    recipient: { state: "value", value: "synthetic-recipient-01" },
    amount: { state: "not-applicable" }, conditions: { state: "value", value: "sin condiciones comerciales" },
    scope, effect: "synthetic-notification", destination: { state: "value", value: "synthetic-destination" },
    parts: [{ partId: "part-a", action: "send-synthetic-notice", contentVersion: "notice-v1",
      content: "Mensaje técnico de prueba", recipient: { state: "value", value: "synthetic-recipient-01" },
      amount: { state: "not-applicable" }, conditions: { state: "value", value: "sin condiciones comerciales" },
      scope, effect: "synthetic-notification" }],
    ...overrides,
  };
}

test("synthetic AI proposal requires an independent human decision before exact-part reservation", async () => {
  const proposed = await approval.propose(humanAuth, interaction, "proposal-h011-main", "ai", material());
  assert.equal(proposed.state, "proposed");
  await assert.rejects(() => approval.reserve(humanAuth, interaction, "reserve-h011-early", proposed.proposalId,
    "decision-h011-main", "part-a", proposed.materialFingerprint,
    fingerprintHumanApprovalPart(material().parts[0]!), material()));
  const rejected = await approval.decide(humanAuth, interaction, "decision-cmd-h011-reject", proposed.proposalId,
    "decision-h011-reject", "rejected", "no debe ejecutarse", proposed.materialFingerprint);
  assert.equal(rejected.state, "rejected");
  await assert.rejects(() => approval.reserve(humanAuth, interaction, "reserve-h011-rejected", proposed.proposalId,
    "decision-h011-reject", "part-a", proposed.materialFingerprint,
    fingerprintHumanApprovalPart(material().parts[0]!), material()));
  assert.equal((await admin`select count(*)::int n from crm_ha.reservations where proposal_id=${proposed.proposalId}`)[0]!.n, 0);
});

test("human approval is exact, immutable and distinct from execution; uncertainty keeps reservation", async () => {
  const m = material();
  const proposed = await approval.propose(humanAuth, interaction, "proposal-h011-approved", "ai", m);
  const read = await approval.readProposal(humanAuth, classifyServerEvent("core-read"), proposed.proposalId);
  assert.equal(read?.materialFingerprint, proposed.materialFingerprint);
  assert.equal(read?.decision, undefined);
  const decision = await approval.decide(humanAuth, interaction, "decision-cmd-h011-approve", proposed.proposalId,
    "decision-h011-approved", "approved", "revisión humana sintética", proposed.materialFingerprint);
  assert.equal(decision.state, "approved");
  assert.equal((await admin`select count(*)::int n from crm_private.external_effect_records where stage='attempt'`)[0]!.n, 0);
  const reservation = await approval.reserve(humanAuth, interaction, "reserve-h011-approved", proposed.proposalId,
    "decision-h011-approved", "part-a", proposed.materialFingerprint,
    fingerprintHumanApprovalPart(m.parts[0]!), m);
  assert.equal(reservation.state, "reserved");
  const stableHash = createHash("sha256").update(`${proposed.proposalId}:part-a`, "utf8").digest("hex").slice(0, 32);
  const intentId = `intent-${stableHash}`;
  assert.equal((await admin`select count(*)::int n from crm_private.external_effect_records
    where intent_id=${intentId} and stage='intent'`)[0]!.n, 1);
  assert.equal((await admin`select material_fingerprint from crm_ha.reservations
    where reservation_id=${reservation.reservationId!}`)[0]!.material_fingerprint,
    fingerprintHumanApprovalPart(m.parts[0]!));
  const technical = () => issueTrustedContext({
    identityId: "h0-011-executor", identityKind: "technical", purpose: "h0-011-human-approval", scope,
    requestId: randomUUID(), serverTime: new Date().toISOString(),
  });
  await approval.recordAttempt(technical(), "attempt-command-h011", reservation.reservationId!, "attempt-h011-uncertain");
  await approval.recordOutcome(technical(), "outcome-command-h011", reservation.reservationId!,
    "attempt-h011-uncertain", "uncertain", "synthetic-unknown-result");
  assert.equal((await admin`select state from crm_ha.reservations where reservation_id=${reservation.reservationId!}`)[0]!.state, "uncertain");
  assert.equal((await admin`select count(*)::int n from crm_private.external_effect_records
    where operation_id=${reservation.reservationId!} and stage='uncertain'`)[0]!.n, 1);
  assert.equal((await admin`select count(*)::int n from crm_private.external_effect_records
    where operation_id=${reservation.reservationId!} and stage='result'`)[0]!.n, 0);
  await assert.rejects(() => approval.recordAttempt(technical(), "attempt-command-h011-retry",
    reservation.reservationId!, "attempt-h011-retry"));
  await approval.reconcile(technical(), "reconcile-command-h011", reservation.reservationId!,
    "attempt-h011-uncertain", "succeeded", "synthetic-reconciled-result");
  assert.equal((await admin`select state from crm_ha.reservations where reservation_id=${reservation.reservationId!}`)[0]!.state, "consumed");
  assert.equal((await admin`select count(*)::int n from crm_private.external_effect_records
    where operation_id=${reservation.reservationId!} and stage='result' and outcome='succeeded'`)[0]!.n, 1);
});

test("material fingerprint separates absent, empty and every authorized material slot", async () => {
  const base = material();
  const baseFp = fingerprintHumanApprovalMaterial(base);
  assert.equal(fingerprintHumanApprovalMaterial({ ...base, content: `${base.content}` }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, content: `${base.content} ` }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, action: "different-action" }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, contentVersion: "notice-v2" }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, recipient: { state: "value", value: "synthetic-recipient-02" } }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, recipient: { state: "value", value: "" } }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, recipient: { state: "not-applicable" } }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, amount: { state: "value", value: "0.00" } }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, conditions: { state: "value", value: "otras condiciones" } }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, scope: "scope-h0-011-other" }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, effect: "other-effect" }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, destination: { state: "value", value: "other-target" } }), baseFp);
  assert.notEqual(fingerprintHumanApprovalMaterial({ ...base, content: "Aviso técnico 🧭" }), baseFp);
  assert.equal(fingerprintHumanApprovalPart(base.parts[0]!), fingerprintHumanApprovalPart({
    effect: base.parts[0]!.effect, scope: base.parts[0]!.scope, conditions: base.parts[0]!.conditions,
    amount: base.parts[0]!.amount, recipient: base.parts[0]!.recipient, content: base.parts[0]!.content,
    contentVersion: base.parts[0]!.contentVersion, action: base.parts[0]!.action, partId: base.parts[0]!.partId,
  }));
  assert.throws(() => fingerprintHumanApprovalMaterial({ ...base, unknownClientFlag: true } as never));
  const hostilePrototype = Object.assign(Object.create({ actorId: actorId }), base) as HumanApprovalMaterial;
  assert.throws(() => fingerprintHumanApprovalMaterial(hostilePrototype));
  assert.throws(() => fingerprintHumanApprovalMaterial({ ...base, content: "x".repeat(16385) }));
  assert.throws(() => fingerprintHumanApprovalMaterial({ ...base, parts: [] }));
});

test("changed material, expired/unverifiable evidence and unverified identity never reserve", async () => {
  const original = material();
  const p = await approval.propose(humanAuth, interaction, "proposal-h011-revalidate", "ai", original);
  const decision = await approval.decide(humanAuth, interaction, "decision-cmd-h011-revalidate", p.proposalId,
    "decision-h011-revalidate", "approved", "revisión sintética", p.materialFingerprint);
  assert.throws(() => approval.reserve(humanAuth, interaction, "reserve-h011-recipient-change", p.proposalId,
    decision.decisionId!, "part-a", p.materialFingerprint, fingerprintHumanApprovalPart(original.parts[0]!),
    material({ recipient: { state: "value", value: "synthetic-recipient-changed" } })));
  assert.throws(() => approval.reserve(humanAuth, interaction, "reserve-h011-amount-change", p.proposalId,
    decision.decisionId!, "part-a", p.materialFingerprint, fingerprintHumanApprovalPart(original.parts[0]!),
    material({ amount: { state: "value", value: "0.01" } })));
  assert.throws(() => approval.reserve(humanAuth, interaction, "reserve-h011-evidence-expired", p.proposalId,
    decision.decisionId!, "part-a", p.materialFingerprint, fingerprintHumanApprovalPart(original.parts[0]!),
    material({ evidence: { reference: "synthetic-evidence", fingerprint: "0".repeat(64),
      expiresAt: "2020-01-01T00:00:00.000Z" } })));
  await assert.rejects(() => verifyAuth({ verify: async () => undefined }, "invalid-proof"));
  await assert.rejects(() => approval.decide(undefined as unknown as VerifiedAuthEvidence, interaction,
    "decision-cmd-h011-unverified", p.proposalId, "decision-h011-unverified", "approved", "sin autoridad", p.materialFingerprint));
  assert.equal((await admin`select count(*)::int n from crm_ha.reservations where proposal_id=${p.proposalId}`)[0]!.n, 0);
});

test("same exact part is serialized across two PostgreSQL runtime connections", async () => {
  const m = material();
  const p = await approval.propose(humanAuth, interaction, "proposal-h011-race", "ai", m);
  await approval.decide(humanAuth, interaction, "decision-cmd-h011-race", p.proposalId,
    "decision-h011-race", "approved", "revisión sintética", p.materialFingerprint);
  const reservation = (port: H0011PostgresAdapter, commandId: string) => port.reserve(humanAuth, interaction,
    commandId, p.proposalId, "decision-h011-race", "part-a", p.materialFingerprint,
    fingerprintHumanApprovalPart(m.parts[0]!), m);
  const results = await Promise.allSettled([
    reservation(approval, "reserve-h011-race-a"), reservation(approvalB, "reserve-h011-race-b"),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await admin`select count(*)::int n from crm_ha.reservations where proposal_id=${p.proposalId} and part_id='part-a'`)[0]!.n, 1);
});

test("approved effect can be consumed part by part without reusing the completed part", async () => {
  const m = material({ parts: [
    ...material().parts,
    { ...material().parts[0]!, partId: "part-b", content: "Segunda parte técnica" },
  ] });
  const p = await approval.propose(humanAuth, interaction, "proposal-h011-partial", "ai", m);
  await approval.decide(humanAuth, interaction, "decision-cmd-h011-partial", p.proposalId,
    "decision-h011-partial", "approved", "revisión sintética", p.materialFingerprint);
  const first = await approval.reserve(humanAuth, interaction, "reserve-h011-partial-a", p.proposalId,
    "decision-h011-partial", "part-a", p.materialFingerprint, fingerprintHumanApprovalPart(m.parts[0]!), m);
  const technical = () => issueTrustedContext({ identityId: "h0-011-executor", identityKind: "technical",
    purpose: "h0-011-human-approval", scope, requestId: randomUUID(), serverTime: new Date().toISOString() });
  await approval.recordAttempt(technical(), "attempt-command-h011-partial", first.reservationId!, "attempt-h011-partial");
  await approval.recordOutcome(technical(), "outcome-command-h011-partial", first.reservationId!,
    "attempt-h011-partial", "succeeded", "synthetic-result-reference");
  assert.equal((await admin`select state from crm_ha.reservations where reservation_id=${first.reservationId!}`)[0]!.state, "consumed");
  const second = await approval.reserve(humanAuth, interaction, "reserve-h011-partial-b", p.proposalId,
    "decision-h011-partial", "part-b", p.materialFingerprint, fingerprintHumanApprovalPart(m.parts[1]!), m);
  assert.equal(second.state, "reserved");
  await assert.rejects(() => approval.reserve(humanAuth, interaction, "reserve-h011-partial-a-again", p.proposalId,
    "decision-h011-partial", "part-a", p.materialFingerprint, fingerprintHumanApprovalPart(m.parts[0]!), m));
});

test("direct runtime and PUBLIC SQL cannot mutate or read approval tables", async () => {
  await assert.rejects(() => runtime`select * from crm_ha.proposals`);
  await assert.rejects(() => runtime`insert into crm_ha.proposals values ('direct-h011',repeat('0',64),decode('00','hex'),'human',${actorId}::uuid,${scope},clock_timestamp())`);
  await assert.rejects(() => runtime`set role crm_h0_f2_executor`);
  await assert.rejects(() => runtime`set role crm_h0_executor`);
  await assert.rejects(() => runtime`set role crm_h0_table_owner`);
  await assert.rejects(() => runtime`set role crm_h0_migration`);
  await assert.rejects(() => runtime`select crm_ha.effect_record_allows('x','x','x','x','x','x','attempt')`);
  await assert.rejects(() => runtime`update crm_ha.decisions set decision='approved'`);
  await assert.rejects(() => runtime`delete from crm_ha.reservations`);
  await assert.rejects(() => runtime`update crm_ha.events set actor_identity='synthetic-forged'`);
  await assert.rejects(() => runtime`delete from crm_private.unit_history`);
  await assert.rejects(() => runtime`select secret from crm_f2.keys`);
  await assert.rejects(() => untrusted`select * from crm_ha.proposals`);
  await assert.rejects(() => untrusted`select * from crm_api.h0_m04_command(null,null,null,null,null)`);
  const grants = await admin<{ public_select: boolean; runtime_insert: boolean }[]>`
    select has_table_privilege('public','crm_ha.proposals','select') public_select,
      has_table_privilege('crm_h0_runtime','crm_ha.decisions','insert') runtime_insert`;
  assert.deepEqual(grants[0], { public_select: false, runtime_insert: false });
});

test("same operation identity conflicts on changed material and recovers after lost post-COMMIT response", async () => {
  const original = material();
  const p = await approval.propose(humanAuth, interaction, "proposal-h011-idem", "ai", original);
  await assert.rejects(() => approval.propose(humanAuth, interaction, "proposal-h011-idem", "ai",
    material({ content: "contenido material distinto" })), /H0_011_CONFLICT_E2/u);
  await approval.decide(humanAuth, interaction, "decision-cmd-h011-idem", p.proposalId,
    "decision-h011-idem", "approved", "revisión sintética", p.materialFingerprint);
  // The adapter's commit resolves before this synthetic client transport loss.
  await assert.rejects(async () => {
    await approval.reserve(humanAuth, interaction, "reserve-h011-idem", p.proposalId,
      "decision-h011-idem", "part-a", p.materialFingerprint, fingerprintHumanApprovalPart(original.parts[0]!), original);
    throw new Error("SYNTHETIC_RESPONSE_LOST_AFTER_COMMIT");
  }, /SYNTHETIC_RESPONSE_LOST_AFTER_COMMIT/u);
  const replay = await approval.reserve(humanAuth, interaction, "reserve-h011-idem", p.proposalId,
    "decision-h011-idem", "part-a", p.materialFingerprint, fingerprintHumanApprovalPart(original.parts[0]!), original);
  assert.equal(replay.commandState, "previous");
  assert.equal(replay.reservationId, "reserve-h011-idem");
  assert.equal((await admin`select count(*)::int n from crm_ha.reservations where proposal_id=${p.proposalId}`)[0]!.n, 1);
  assert.equal((await admin`select count(*)::int n from crm_private.unit_history where operation_id='reserve-h011-idem'`)[0]!.n, 1);
});

test("failure writing the M02 effect intent rolls back reservation and history atomically", async () => {
  const m = material();
  const p = await approval.propose(humanAuth, interaction, "proposal-h011-rollback", "ai", m);
  await approval.decide(humanAuth, interaction, "decision-cmd-h011-rollback", p.proposalId,
    "decision-h011-rollback", "approved", "revisión sintética", p.materialFingerprint);
  await admin.unsafe(`create function public.fail_h011_intent() returns trigger language plpgsql as $$
    begin if new.stage='intent' then raise exception 'SYNTHETIC_H0_011_FAILURE'; end if; return new; end $$;
    create trigger fail_h011_intent before insert on crm_private.external_effect_records
      for each row execute function public.fail_h011_intent()`);
  try {
    await assert.rejects(() => approval.reserve(humanAuth, interaction, "reserve-h011-rollback", p.proposalId,
      "decision-h011-rollback", "part-a", p.materialFingerprint, fingerprintHumanApprovalPart(m.parts[0]!), m));
  } finally {
    await admin.unsafe("drop trigger fail_h011_intent on crm_private.external_effect_records; drop function public.fail_h011_intent()");
  }
  assert.equal((await admin`select count(*)::int n from crm_ha.reservations where proposal_id=${p.proposalId}`)[0]!.n, 0);
  assert.equal((await admin`select count(*)::int n from crm_private.unit_operations where operation_id='reserve-h011-rollback'`)[0]!.n, 0);
});

test("decision actor, technical executor, attempt and outcome remain separate records", async () => {
  const m = material();
  const p = await approval.propose(humanAuth, interaction, "proposal-h011-identities", "ai", m);
  await approval.decide(humanAuth, interaction, "decision-cmd-h011-identities", p.proposalId,
    "decision-h011-identities", "approved", "revisión sintética", p.materialFingerprint);
  const reservation = await approval.reserve(humanAuth, interaction, "reserve-h011-identities", p.proposalId,
    "decision-h011-identities", "part-a", p.materialFingerprint, fingerprintHumanApprovalPart(m.parts[0]!), m);
  const technical = issueTrustedContext({ identityId: "synthetic-executor-01", identityKind: "technical",
    purpose: "h0-011-human-approval", scope, requestId: "request-executor-01", serverTime: new Date().toISOString() });
  await approval.recordAttempt(technical, "attempt-command-h011-identities", reservation.reservationId!, "attempt-h011-identities");
  const row = await admin<{ actor_id: string; session_id: string; executor_identity: string; event_kinds: string[] }[]>`
    select d.actor_id::text actor_id,d.session_id::text session_id,
      (select actor_identity from crm_ha.events where reservation_id=${reservation.reservationId!} and event_kind='attempted') executor_identity,
      array(select event_kind from crm_ha.events where proposal_id=${p.proposalId} order by recorded_at) event_kinds
    from crm_ha.decisions d
    where d.proposal_id=${p.proposalId}`;
  assert.equal(row[0]!.actor_id, actorId);
  assert.equal(row[0]!.session_id, humanAuth.sessionId);
  assert.equal(row[0]!.executor_identity, "synthetic-executor-01");
  assert.deepEqual(row[0]!.event_kinds, ["proposed", "approved", "reserved", "attempted"]);
});

test("revoked session cannot approve a previously proposed effect", async () => {
  const p = await approval.propose(humanAuth, interaction, "proposal-h011-revoked", "ai", material());
  const access = new H0005PostgresAdapter(runtime, f1, f2);
  await access.revokeOne(humanAuth);
  await assert.rejects(() => approval.decide(humanAuth, interaction, "decision-cmd-h011-revoked",
    p.proposalId, "decision-h011-revoked", "approved", "revocada", p.materialFingerprint));
  assert.equal((await admin`select count(*)::int n from crm_ha.decisions where proposal_id=${p.proposalId}`)[0]!.n, 0);
});
