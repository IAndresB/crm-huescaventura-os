import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import postgres from "postgres";
import { verifyAuth } from "../../src/application/verified-auth.ts";
import { classifyServerEvent } from "../../src/application/verified-interaction.ts";
import { issueTrustedContext } from "../../src/application/trusted-context.ts";
import { H0005PostgresAdapter } from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";
import { createF2Issuer, encodeF2Fields, type F2SigningConfiguration } from "../../src/infrastructure/postgres/f2-codec.ts";
import { postgresF1Binding } from "../../src/infrastructure/postgres/transaction.ts";
import { hardenF1 } from "./f1-fixture.ts";
import { createSyntheticAuthVerifier } from "./synthetic-auth-fixture.ts";

const bin = process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root = resolve(import.meta.dirname, "../..");
const db = "crm_h0_005_test";
const port = 55415;
const actorId = randomUUID();
const subject = randomUUID();
const scope = "scope-human-h0-005";
let temporaryRoot = "";
let data = "";
let socket = "";
let started = false;
let bootstrap: postgres.Sql;
let migration: postgres.Sql;
let runtime: postgres.Sql;
let runtimeB: postgres.Sql;
let f1: F1SigningConfiguration;
let f2: F2SigningConfiguration;
let adapter: H0005PostgresAdapter;
let auth: ReturnType<typeof createSyntheticAuthVerifier>;
let sessionA: { sessionId: string; epochId: string };
let sessionB: { sessionId: string; epochId: string };

function command(name: string, args: readonly string[]): void {
  const result = spawnSync(join(bin!,name),args,{
    encoding: "utf8", env: { ...process.env, LC_ALL: "C" },
  });
  assert.equal(result.status,0,`${name} failed: ${result.stderr}`);
}

function connect(user: string, database = db) {
  return postgres({
    host: socket, port, database, user,
    max: 1, prepare: false, connect_timeout: 2, idle_timeout: 2,
  });
}

async function evidence(sessionId?: string, passwordVerified = true, mfaVerified = true) {
  const proof = auth.register({ subject, ...(sessionId ? { sessionId } : {}),
    passwordVerified,mfaVerified });
  return verifyAuth(auth.port,proof);
}

function humanRead(value: Awaited<ReturnType<typeof evidence>>, probeId: string,
  target = adapter) {
  return target.readCoreProbe(value,classifyServerEvent("core-read"),probeId);
}

function humanWrite(value: Awaited<ReturnType<typeof evidence>>, operationId: string,
  probeId: string, publicValue: string) {
  return adapter.applyCoreProbe(value,classifyServerEvent("core-action"),
    operationId,probeId,publicValue);
}

async function migrate(name: string, connection: postgres.Sql) {
  await connection.unsafe(await readFile(join(root,"supabase/migrations",name),"utf8"));
}

async function rawRead(
  tx: postgres.TransactionSql,
  sessionId: string,
  options: { scope?: string; oldTime?: boolean; signing?: F2SigningConfiguration } = {},
) {
  const rows = await tx<{ actor_id: string; access_generation: string; admin_scope: string; epoch_id: string }[]>`
    select actor_id::text,access_generation::text,admin_scope,epoch_id::text
      from crm_api.f2_lookup(${subject}::uuid,${sessionId}::uuid)
  `;
  const row = rows[0]!;
  const binding = await postgresF1Binding(tx);
  const q = encodeF1Fields(["CRM-INP1","C01","human-probe-a"]);
  const a = await evidence(sessionId);
  const f2cap = createF2Issuer(options.signing ?? f2)(a,{
    actorId: row.actor_id, sessionId, epochId: row.epoch_id,
    accessGeneration: row.access_generation, scope: options.scope ?? row.admin_scope,
  },options.oldTime ? { ...binding, now: (BigInt(binding.now)-31000000n).toString() } : binding,
  "C01",q,classifyServerEvent("core-read"));
  const trusted = issueTrustedContext({
    identityId: "technical-bridge-h0-005", identityKind: "technical",
    purpose: "h0-005-human-bridge", scope: row.admin_scope,
    requestId: randomUUID(), serverTime: new Date().toISOString(),
  });
  const f1cap = createF1Issuer(f1)(trusted,binding,"C01",q);
  return { q, f2cap, f1cap };
}

function unpack(raw: Buffer): string[] {
  const fields: string[] = [];
  for (let offset=0; offset<raw.length;) {
    const size=raw.readUInt32BE(offset);
    offset+=4;
    fields.push(raw.subarray(offset,offset+size).toString("utf8"));
    offset+=size;
  }
  return fields;
}

before(async () => {
  temporaryRoot = await mkdtemp(join(tmpdir(),"crm-h0-005-"));
  data = join(temporaryRoot,"data");
  socket = join(temporaryRoot,"socket");
  await mkdir(socket);
  command("initdb",["-D",data,"--username=bootstrap_h0_005","--auth-local=trust",
    "--auth-host=scram-sha-256","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",data,"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '' -p ${port}`,"-w","start"]);
  started = true;
  bootstrap = connect("bootstrap_h0_005","postgres");
  await migrate("202609150000_h0_m01_roles.sql",bootstrap);
  await bootstrap.unsafe(`create database ${db} owner crm_h0_migration`);
  await bootstrap.end();
  bootstrap = connect("bootstrap_h0_005");
  migration = connect("crm_h0_migration");
  await migrate("202609150001_h0_m01_context.sql",migration);
  const originalF1 = await hardenF1(bootstrap,migration);
  await migrate("202609250000_h0_m02_unit_history.sql",migration);
  await bootstrap`
    insert into crm_private.access_probe(probe_id,context_scope,public_value,private_value)
    values('pre-h0-m03-fixture','upgrade-scope','preserved','restricted')
  `;
  await migrate("202609260000_h0_m03_authorities.sql",bootstrap);
  await migrate("202609260001_h0_m03_actor_session_access.sql",migration);
  await migrate("202609260002_h0_m03_revoke_all_authority_fix.sql",migration);
  f1 = { ...originalF1,
    allowedPurposes: [...originalF1.allowedPurposes,"h0-005-human-bridge"] };
  await migration`update crm_f1.keys set purposes=${f1.allowedPurposes} where key_id=${f1.keyId}`;
  f2 = {
    key: randomBytes(32), keyId: randomUUID(), audience: randomUUID(),
    generation: randomUUID(),
    allowedPurposes: ["full-identification","core-human-access","session-revocation"],
  };
  await migration`
    insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},
      ${f2.allowedPurposes},true,clock_timestamp()-interval '1 minute',
      clock_timestamp()+interval '1 hour')
  `;
  await migration`select crm_api.provision_actor_mapping(${actorId}::uuid,${subject}::uuid,${scope})`;
  await bootstrap`
    insert into crm_private.access_probe(probe_id,context_scope,public_value,private_value)
    values('human-probe-a',${scope},'synthetic-public','synthetic-private')
  `;
  runtime = connect("crm_h0_runtime");
  runtimeB = connect("crm_h0_runtime");
  adapter = new H0005PostgresAdapter(runtime,f1,f2);
  auth = createSyntheticAuthVerifier();
});

after(async () => {
  await Promise.allSettled([
    runtime?.end({timeout:1}),runtimeB?.end({timeout:1}),
    migration?.end({timeout:1}),bootstrap?.end({timeout:1}),
  ]);
  if (started) command("pg_ctl",["-D",data,"-m","fast","-w","stop"]);
  if (temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});

test("H0-M03 upgrades historical chain; only migration can apply and mapping is unique",async () => {
  assert.equal((await bootstrap`
    select public_value from crm_private.access_probe where probe_id='pre-h0-m03-fixture'
  `)[0]?.public_value,"preserved");
  const actor = await bootstrap`select actor_id::text,auth_subject::text from crm_private.crm_actors`;
  assert.equal(actor.length,1);
  assert.equal(actor[0]?.actor_id,actorId);
  await assert.rejects(
    runtime`select crm_api.provision_actor_mapping(${randomUUID()}::uuid,${randomUUID()}::uuid,'other')`,
    (error: unknown) => (error as { code?: string }).code === "42501",
  );
  await assert.rejects(
    migration`select crm_api.provision_actor_mapping(${randomUUID()}::uuid,${randomUUID()}::uuid,'other')`,
    (error: unknown) => (error as { code?: string }).code === "42501",
  );
  const source = await readFile(join(root,"supabase/migrations",
    "202609260001_h0_m03_actor_session_access.sql"),"utf8");
  await assert.rejects(runtimeB.unsafe(source),
    (error: unknown) => (error as { code?: string }).code === "42501");
  await runtimeB.unsafe("rollback");
  await assert.rejects(migration.unsafe(source));
  await migration.unsafe("rollback");
  assert.equal((await bootstrap`
    select count(*)::int as n from crm_private.crm_actors
  `)[0]?.n,1);
});

test("H0-M03 injected mid-migration failure is atomic and a clean retry succeeds",async () => {
  const failureDb="crm_h0_005_failure";
  await bootstrap.unsafe(`create database ${failureDb} owner crm_h0_migration`);
  const alternate=connect("crm_h0_migration",failureDb);
  try {
    await migrate("202609150001_h0_m01_context.sql",alternate);
    await migrate("202609160001_h0_f1_capabilities.sql",alternate);
    await migrate("202609250000_h0_m02_unit_history.sql",alternate);
    const source=await readFile(join(root,"supabase/migrations",
      "202609260001_h0_m03_actor_session_access.sql"),"utf8");
    const marker="create function crm_f2.verify(";
    assert.ok(source.includes(marker));
    const injected=source.replace(marker,
      "do $$ begin raise exception 'H0_M03_INJECTED_FAILURE'; end $$;\n"+marker);
    await assert.rejects(alternate.unsafe(injected));
    const absent=await alternate<{ schema_absent: boolean; actor_absent: boolean;
      predecessor_present: boolean }[]>`
      select to_regnamespace('crm_f2') is null as schema_absent,
        to_regclass('crm_private.crm_actors') is null as actor_absent,
        to_regclass('crm_private.unit_history') is not null as predecessor_present
    `;
    assert.deepEqual({...absent[0]},{
      schema_absent:true,actor_absent:true,predecessor_present:true,
    });
    await alternate.unsafe(source);
    assert.equal((await alternate`
      select to_regclass('crm_private.crm_actors') is not null as present
    `)[0]?.present,true);
  } finally {
    await alternate.end({timeout:1});
  }
});

test("H0-006-F01 forward migration is atomic, preserves predecessor and restores narrow ACL",async () => {
  const prior="crm_h0_005_failure";
  const upgrader=connect("crm_h0_migration",prior);
  const ordinary=connect("crm_h0_runtime",prior);
  const source=await readFile(join(root,"supabase/migrations",
    "202609260002_h0_m03_revoke_all_authority_fix.sql"),"utf8");
  try {
    const previous=(await upgrader<{ definition: string }[]>`
      select pg_get_functiondef('crm_api.revoke_all_sessions(bytea,bytea,bytea)'::regprocedure)
        as definition
    `)[0]!.definition;
    const fixture=randomUUID();
    await upgrader`select crm_api.provision_actor_mapping(
      ${fixture}::uuid,${randomUUID()}::uuid,'preserved-f01-fixture')`;
    const marker="create or replace function crm_api.revoke_all_sessions";
    assert.ok(source.includes(marker));
    const interrupted=source.replace(marker,
      "do $$ begin raise exception 'F01_INJECTED'; end $$;\n"+marker);
    await assert.rejects(upgrader.unsafe(interrupted));
    assert.equal((await upgrader`select to_regprocedure(
      'crm_api.f2_lookup_revoke_all_authority(uuid,uuid)') is null as absent`)[0]?.absent,true);
    assert.equal((await upgrader<{ definition: string }[]>`
      select pg_get_functiondef('crm_api.revoke_all_sessions(bytea,bytea,bytea)'::regprocedure)
        as definition`)[0]?.definition,previous);
    assert.equal((await upgrader`select count(*)::int as n from crm_private.crm_actors
      where actor_id=${fixture}::uuid`)[0]?.n,1);
    await assert.rejects(ordinary.unsafe(source));
    await ordinary.unsafe("rollback");
    await upgrader.unsafe(source);
    const catalog=(await upgrader<{ owner: string; definer: boolean;
      runtime_execute: boolean; public_execute: boolean; executor_create: boolean }[]>`
      select p.proowner::regrole::text as owner,p.prosecdef as definer,
        has_function_privilege('crm_h0_runtime',p.oid,'EXECUTE') as runtime_execute,
        has_function_privilege('public',p.oid,'EXECUTE') as public_execute,
        has_schema_privilege('crm_h0_f2_executor','crm_api','CREATE') as executor_create
      from pg_proc p where p.oid=
        'crm_api.f2_lookup_revoke_all_authority(uuid,uuid)'::regprocedure
    `)[0]!;
    assert.deepEqual({...catalog},{owner:"crm_h0_f2_executor",definer:true,
      runtime_execute:true,public_execute:false,executor_create:false});
    assert.equal((await upgrader`select count(*)::int as n from crm_private.crm_actors
      where actor_id=${fixture}::uuid`)[0]?.n,1);
    await assert.rejects(upgrader.unsafe(source));
    await upgrader.unsafe("rollback");
    assert.equal((await upgrader`select to_regprocedure(
      'crm_api.f2_lookup_revoke_all_authority(uuid,uuid)') is not null as present`)[0]?.present,true);
  } finally {
    await Promise.allSettled([upgrader.end({timeout:1}),ordinary.end({timeout:1})]);
  }
});

test("verified Auth boundary rejects client-shaped claims and incomplete full identification",async () => {
  const fake = { kind: "verified-auth-evidence",subject,passwordVerified:true,mfaVerified:true };
  await assert.rejects(adapter.establish(fake as never),/F2_AUTH_VERIFICATION_REQUIRED/);
  await assert.rejects(adapter.establish(await evidence(undefined,true,false)),/F2_FULL_IDENTIFICATION_REQUIRED/);
  await assert.rejects(adapter.establish(await evidence(undefined,false,true)),/F2_FULL_IDENTIFICATION_REQUIRED/);
  assert.equal((await bootstrap`select count(*)::int as n from crm_private.crm_sessions`)[0]?.n,0);
});

test("full identification creates two independent sessions and minimal F2+F1 C01",async () => {
  sessionA = await adapter.establish(await evidence());
  sessionB = await adapter.establish(await evidence());
  assert.notEqual(sessionA.sessionId,sessionB.sessionId);
  const readA = await humanRead(await evidence(sessionA.sessionId),"human-probe-a");
  assert.deepEqual(readA,{probeId:"human-probe-a",publicValue:"synthetic-public"});
  const readB = await humanRead(await evidence(sessionB.sessionId),"human-probe-a");
  assert.deepEqual(readB,readA);
  const rows = await bootstrap`select session_id::text from crm_private.crm_sessions order by session_id`;
  assert.equal(rows.length,2);
});

test("F2 owners, FORCE RLS and grants exclude runtime, generic roles and the key",async () => {
  const rows = await bootstrap<{ name: string; owner: string; rls: boolean; force: boolean }[]>`
    select c.relname as name,pg_get_userbyid(c.relowner) as owner,
      c.relrowsecurity as rls,c.relforcerowsecurity as force
      from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where (n.nspname='crm_private' and c.relname in
        ('crm_actors','crm_sessions','identification_epochs'))
        or (n.nspname='crm_f2' and c.relname='keys')
      order by c.relname
  `;
  assert.equal(rows.length,4);
  assert.ok(rows.every((row) => row.owner === "crm_h0_f2_owner" && row.rls && row.force));
  const roles = await bootstrap`
    select rolname,rolcanlogin,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb
      from pg_roles where rolname like 'crm_h0_f2_%' order by rolname
  `;
  assert.equal(roles.length,3);
  assert.ok(roles.every((row) => !row.rolcanlogin && !row.rolsuper
    && !row.rolbypassrls && !row.rolcreaterole && !row.rolcreatedb));
  for (const query of [
    "select * from crm_private.crm_actors",
    "select * from crm_private.crm_sessions",
    "select * from crm_private.identification_epochs",
    "select * from crm_f2.keys",
    "update crm_private.crm_actors set enabled=true",
    "select crm_f2.verify(null,null,null,'C01','human_core_probe','read_probe')",
    "set role crm_h0_f2_verifier",
    "set role crm_h0_f2_executor",
    "set role crm_h0_f2_owner",
    "set role crm_h0_migration",
  ]) {
    await assert.rejects(runtimeB.unsafe(query),
      (error: unknown) => (error as { code?: string }).code === "42501",query);
  }
  await assert.rejects(runtimeB`select * from crm_private.crm_actors`,
    (error: unknown) => (error as { code?: string }).code === "42501");
  assert.equal((await bootstrap`select count(*)::int as n from pg_auth_members
    where member='crm_h0_runtime'::regrole`)[0]?.n,0);
});

test("M2 plain GUCs, wrong scope, altered MAC and F1/F2 substitution cannot authorize",async () => {
  const denied = (work: (tx: postgres.TransactionSql) => Promise<unknown>) =>
    assert.rejects(runtimeB.begin(work),
      (error: unknown) => (error as { code?: string }).code === "42501");
  await denied(async (tx) => {
    await tx`select set_config('crm.identity_id',${actorId},true),
      set_config('crm.identity_kind','human',true),set_config('crm.scope',${scope},true)`;
    await tx`select * from crm_private.access_probe`;
  });
  await denied(async (tx) => {
    const { q, f2cap, f1cap } = await rawRead(tx,sessionA.sessionId);
    const altered = Buffer.from(f2cap.mac);
    altered[0] = altered[0]! ^ 1;
    await tx`
      select * from crm_api.human_read_probe(${f2cap.payload},${altered},
        ${f1cap.payload},${f1cap.mac},${q})
    `;
  });
  await denied(async (tx) => {
    const { q, f2cap, f1cap } = await rawRead(tx,sessionA.sessionId);
    await tx`
      select * from crm_api.human_read_probe(${f1cap.payload},${f1cap.mac},
        ${f1cap.payload},${f1cap.mac},${q})
    `;
  });
  await denied(async (tx) => {
    const { q, f2cap, f1cap } = await rawRead(tx,sessionA.sessionId);
    await tx`
      select * from crm_api.human_read_probe(${f2cap.payload},${f2cap.mac},
        ${f2cap.payload},${f2cap.mac},${q})
    `;
  });
  await denied(async (tx) => {
    const { q, f2cap, f1cap } = await rawRead(tx,sessionA.sessionId,{scope:"scope-other"});
    await tx`
      select * from crm_api.human_read_probe(${f2cap.payload},${f2cap.mac},
        ${f1cap.payload},${f1cap.mac},${q})
    `;
  });
  await denied(async (tx) => {
    const { q, f2cap, f1cap } = await rawRead(tx,sessionA.sessionId,{oldTime:true});
    await tx`
      select * from crm_api.human_read_probe(${f2cap.payload},${f2cap.mac},
        ${f1cap.payload},${f1cap.mac},${q})
    `;
  });
});

test("F2 is transaction/PID bound; valid F1 alone and valid F2 alone both fail",async () => {
  let carried: Awaited<ReturnType<typeof rawRead>> | undefined;
  await assert.rejects(runtimeB.begin(async (tx) => {
    carried = await rawRead(tx,sessionA.sessionId);
    await tx`
      select * from crm_api.human_read_probe(null,null,
        ${carried.f1cap.payload},${carried.f1cap.mac},${carried.q})
    `;
  }),(error: unknown) => (error as { code?: string }).code === "42501");
  await assert.rejects(runtimeB.begin(async (tx) => {
    const current = await rawRead(tx,sessionA.sessionId);
    await tx`
      select * from crm_api.human_read_probe(${current.f2cap.payload},${current.f2cap.mac},
        null,null,${current.q})
    `;
  }),(error: unknown) => (error as { code?: string }).code === "42501");
  await assert.rejects(runtimeB.begin(async (tx) => {
    const current = await rawRead(tx,sessionA.sessionId);
    const old = carried!;
    await tx`
      select * from crm_api.human_read_probe(${old.f2cap.payload},${old.f2cap.mac},
        ${current.f1cap.payload},${current.f1cap.mac},${current.q})
    `;
  }),(error: unknown) => (error as { code?: string }).code === "42501");
});

test("C03 writes and human activity commit together; failed F1 leaves neither",async () => {
  const authA = await evidence(sessionA.sessionId);
  const first = await humanWrite(authA,"human-op-1","human-probe-write","synthetic-write");
  assert.deepEqual(first,["human-probe-write"]);
  const before = (await bootstrap<{ last: string }[]>`
    select last_human_activity_at::text as last from crm_private.identification_epochs
      where epoch_id=${sessionA.epochId}::uuid
  `)[0]!.last;
  await assert.rejects(
    humanWrite(authA,"human-op-duplicate","human-probe-write","second-write"),
    /F2_CORE_DENIED/,
  );
  const after = (await bootstrap<{ last: string }[]>`
    select last_human_activity_at::text as last from crm_private.identification_epochs
      where epoch_id=${sessionA.epochId}::uuid
  `)[0]!.last;
  assert.equal(after,before);
  assert.equal((await bootstrap`select public_value from crm_private.access_probe
    where probe_id='human-probe-write'`)[0]?.public_value,"synthetic-write");
});

test("interactive read moves only its own epoch; refresh/polling/passive cannot claim activity",async () => {
  const before = await bootstrap<{ session_id: string; last: string }[]>`
    select session_id::text,last_human_activity_at::text as last
      from crm_private.identification_epochs where current_epoch
      order by session_id
  `;
  const byId = new Map(before.map((row) => [row.session_id,row.last]));
  await humanRead(await evidence(sessionA.sessionId),"human-probe-a");
  const after = await bootstrap<{ session_id: string; last: string }[]>`
    select session_id::text,last_human_activity_at::text as last
      from crm_private.identification_epochs where current_epoch
      order by session_id
  `;
  const changed = new Map(after.map((row) => [row.session_id,row.last]));
  assert.notEqual(changed.get(sessionA.sessionId),byId.get(sessionA.sessionId));
  assert.equal(changed.get(sessionB.sessionId),byId.get(sessionB.sessionId));
  await assert.rejects(humanRead(
    await evidence(sessionA.sessionId,true,false),"human-probe-a"),/F2_CORE_DENIED/);
  assert.equal((await bootstrap`
    select last_human_activity_at::text as last from crm_private.identification_epochs
      where epoch_id=${sessionA.epochId}::uuid
  `)[0]?.last,changed.get(sessionA.sessionId));
  const current = await evidence(sessionA.sessionId);
  for (const passive of ["token-refresh","polling","background-job","passive"] as const) {
    await assert.rejects(adapter.readCoreProbe(current,classifyServerEvent(passive),"human-probe-a"),
      /F2_INTERACTION_DENIED/);
  }
  await assert.rejects(adapter.readCoreProbe(current,
    {interactionClass:"interactive_read"} as never,"human-probe-a"),
  /F2_INTERACTION_DENIED/);
  assert.equal((await bootstrap`
    select last_human_activity_at::text as last from crm_private.identification_epochs
      where epoch_id=${sessionA.epochId}::uuid
  `)[0]?.last,changed.get(sessionA.sessionId));
});

test("7/30 day boundaries deny at equality; expired epoch needs a new full identification",async () => {
  const origin = "2026-09-01T00:00:00.000Z";
  const rules = await migration<{ before7: boolean; exact7: boolean; after7: boolean;
    before30: boolean; exact30: boolean; after30: boolean }[]>`
    select crm_f2.within_limit(${origin}::timestamptz+interval '7 days'-interval '1 microsecond',
      ${origin}::timestamptz,7) as before7,
      crm_f2.within_limit(${origin}::timestamptz+interval '7 days',
      ${origin}::timestamptz,7) as exact7,
      crm_f2.within_limit(${origin}::timestamptz+interval '7 days'+interval '1 microsecond',
      ${origin}::timestamptz,7) as after7,
      crm_f2.within_limit(${origin}::timestamptz+interval '30 days'-interval '1 microsecond',
      ${origin}::timestamptz,30) as before30,
      crm_f2.within_limit(${origin}::timestamptz+interval '30 days',
      ${origin}::timestamptz,30) as exact30,
      crm_f2.within_limit(${origin}::timestamptz+interval '30 days'+interval '1 microsecond',
      ${origin}::timestamptz,30) as after30
  `;
  assert.deepEqual({ ...rules[0] },{
    before7:true,exact7:false,after7:false,before30:true,exact30:false,after30:false,
  });
  await migration.unsafe("set time zone 'America/New_York'");
  try {
    const dst=await migration<{ before: boolean; exact: boolean }[]>`
      select crm_f2.within_limit('2026-03-15T06:29:59.999999Z'::timestamptz,
        '2026-03-08T06:30:00Z'::timestamptz,7) as before,
        crm_f2.within_limit('2026-03-15T06:30:00Z'::timestamptz,
        '2026-03-08T06:30:00Z'::timestamptz,7) as exact
    `;
    assert.deepEqual({...dst[0]},{before:true,exact:false});
  } finally {
    await migration.unsafe("reset time zone");
  }
  const fresh = await adapter.establish(await evidence());
  await bootstrap`
    update crm_private.identification_epochs
      set identified_at=clock_timestamp()-interval '8 days',
        last_human_activity_at=clock_timestamp()-interval '7 days'
      where epoch_id=${fresh.epochId}::uuid
  `;
  await assert.rejects(humanRead(await evidence(fresh.sessionId),"human-probe-a"),
    /F2_CORE_DENIED/);
  const oldActivity = (await bootstrap`
    select last_human_activity_at::text as last from crm_private.identification_epochs
      where epoch_id=${fresh.epochId}::uuid
  `)[0]?.last;
  const nextEpoch = await adapter.reidentify(await evidence(fresh.sessionId));
  assert.notEqual(nextEpoch,fresh.epochId);
  const old = (await bootstrap`
    select current_epoch,closed_at is not null as closed,last_human_activity_at::text as last
      from crm_private.identification_epochs where epoch_id=${fresh.epochId}::uuid
  `)[0];
  assert.deepEqual(old,{current_epoch:false,closed:true,last:oldActivity});
  assert.deepEqual(await humanRead(await evidence(fresh.sessionId),"human-probe-a"),
    {probeId:"human-probe-a",publicValue:"synthetic-public"});
  await bootstrap`
    update crm_private.identification_epochs
      set identified_at=clock_timestamp()-interval '31 days',
        last_human_activity_at=clock_timestamp()-interval '1 day'
      where epoch_id=${nextEpoch}::uuid
  `;
  await assert.rejects(humanRead(await evidence(fresh.sessionId),"human-probe-a"),
    /F2_CORE_DENIED/);
});

test("single revoke isolates devices; global revoke advances generation and disables prior sessions",async () => {
  await adapter.revokeOne(await evidence(sessionB.sessionId));
  await assert.rejects(humanRead(await evidence(sessionB.sessionId),"human-probe-a"),
    /F2_CORE_DENIED/);
  assert.deepEqual(await humanRead(await evidence(sessionA.sessionId),"human-probe-a"),
    {probeId:"human-probe-a",publicValue:"synthetic-public"});
  const previous = (await bootstrap`
    select access_generation::text as generation from crm_private.crm_actors
      where actor_id=${actorId}::uuid
  `)[0]?.generation;
  const next = await adapter.revokeAll(await evidence(sessionA.sessionId));
  assert.equal(BigInt(next),BigInt(previous)+1n);
  await assert.rejects(humanRead(await evidence(sessionA.sessionId),"human-probe-a"),
    /F2_CORE_DENIED/);
  await assert.rejects(adapter.reidentify(await evidence(sessionA.sessionId)),/F2_REIDENTIFY_DENIED/);
});

test("disabled/recovery/enrollment actor never grants Core; enable does not revive old generation",async () => {
  const fresh = await adapter.establish(await evidence());
  for (const state of ["enrollment_required","recovery_in_progress","reidentification_required"]) {
    await migration`select crm_api.set_actor_enabled(${actorId}::uuid,true,${state})`;
    await assert.rejects(humanRead(await evidence(fresh.sessionId),"human-probe-a"),
      /F2_CORE_DENIED/);
  }
  await migration`select crm_api.set_actor_enabled(${actorId}::uuid,true,'ready')`;
  await migration`select crm_api.set_actor_enabled(${actorId}::uuid,false,'ready')`;
  await assert.rejects(humanRead(await evidence(fresh.sessionId),"human-probe-a"),
    /F2_CORE_DENIED/);
  await migration`select crm_api.set_actor_enabled(${actorId}::uuid,true,'ready')`;
  await assert.rejects(humanRead(await evidence(fresh.sessionId),"human-probe-a"),
    /F2_CORE_DENIED/);
});

async function holdAuthorizedReadThen(
  sessionId: string,
  competing: () => Promise<unknown>,
): Promise<void> {
  let release!: () => void;
  let entered!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  const ready = new Promise<void>((resolve) => { entered = resolve; });
  const first = runtimeB.begin(async (tx) => {
    const { q,f2cap,f1cap } = await rawRead(tx,sessionId);
    const rows = await tx`
      select * from crm_api.human_read_probe(${f2cap.payload},${f2cap.mac},
        ${f1cap.payload},${f1cap.mac},${q})
    `;
    assert.equal(rows.length,1);
    entered();
    await held;
  });
  await ready;
  let completed = false;
  const second = competing().then(() => { completed=true; });
  try {
    await new Promise((resolve) => setTimeout(resolve,50));
    assert.equal(completed,false,"competing action must wait for actor lock");
  } finally {
    release();
  }
  await first;
  await second;
}

test("actor lock serializes authorize versus one-revoke, global revoke and disable",async () => {
  const one = await adapter.establish(await evidence());
  await holdAuthorizedReadThen(one.sessionId,
    async () => adapter.revokeOne(await evidence(one.sessionId)));
  await assert.rejects(humanRead(await evidence(one.sessionId),"human-probe-a"),
    /F2_CORE_DENIED/);
  const all = await adapter.establish(await evidence());
  await holdAuthorizedReadThen(all.sessionId,
    async () => adapter.revokeAll(await evidence(all.sessionId)));
  await assert.rejects(humanRead(await evidence(all.sessionId),"human-probe-a"),
    /F2_CORE_DENIED/);
  const disabled = await adapter.establish(await evidence());
  await holdAuthorizedReadThen(disabled.sessionId,
    async () => { await migration`select crm_api.set_actor_enabled(${actorId}::uuid,false,'ready')`; });
  await assert.rejects(humanRead(await evidence(disabled.sessionId),"human-probe-a"),
    /F2_CORE_DENIED/);
  await migration`select crm_api.set_actor_enabled(${actorId}::uuid,true,'ready')`;
});

test("reidentification committed first invalidates an old epoch capability in a live transaction",async () => {
  const fresh=await adapter.establish(await evidence());
  await assert.rejects(runtimeB.begin(async (tx) => {
    const prior=await rawRead(tx,fresh.sessionId);
    const replacement=await adapter.reidentify(await evidence(fresh.sessionId));
    assert.notEqual(replacement,fresh.epochId);
    await tx`
      select * from crm_api.human_read_probe(${prior.f2cap.payload},${prior.f2cap.mac},
        ${prior.f1cap.payload},${prior.f1cap.mac},${prior.q})
    `;
  }),(error: unknown) => (error as { code?: string }).code === "42501");
  assert.equal((await bootstrap`
    select current_epoch from crm_private.identification_epochs where epoch_id=${fresh.epochId}::uuid
  `)[0]?.current_epoch,false);
});

test("two concurrent reads serialize safely and do not share connection/session authority",async () => {
  const fresh = await adapter.establish(await evidence());
  const first = humanRead(await evidence(fresh.sessionId),"human-probe-a");
  const secondAdapter = new H0005PostgresAdapter(runtimeB,f1,f2);
  const second = humanRead(await evidence(fresh.sessionId),"human-probe-a",secondAdapter);
  const results = await Promise.all([first,second]);
  assert.deepEqual(results,[
    {probeId:"human-probe-a",publicValue:"synthetic-public"},
    {probeId:"human-probe-a",publicValue:"synthetic-public"},
  ]);
});

test("fault after activity update rolls back activity and Core; reidentify and generation faults roll back",async () => {
  const fresh = await adapter.establish(await evidence());
  const before = (await bootstrap`
    select last_human_activity_at::text as last from crm_private.identification_epochs
      where epoch_id=${fresh.epochId}::uuid
  `)[0]?.last;
  await bootstrap.unsafe(
    "create function public.fail_f2_probe() returns trigger language plpgsql as $$ begin " +
    "if new.probe_id='fail-after-admit' then raise exception 'synthetic-fault'; end if; return new; end $$; " +
    "create trigger fail_f2_probe before insert on crm_private.access_probe " +
    "for each row execute function public.fail_f2_probe()",
  );
  try {
    await assert.rejects(humanWrite(await evidence(fresh.sessionId),
      "fault-op","fail-after-admit","synthetic"),/F2_CORE_DENIED/);
  } finally {
    await bootstrap.unsafe(
      "drop trigger fail_f2_probe on crm_private.access_probe; drop function public.fail_f2_probe()",
    );
  }
  assert.equal((await bootstrap`
    select last_human_activity_at::text as last from crm_private.identification_epochs
      where epoch_id=${fresh.epochId}::uuid
  `)[0]?.last,before);
  assert.equal((await bootstrap`select count(*)::int as n from crm_private.access_probe
    where probe_id='fail-after-admit'`)[0]?.n,0);
  await bootstrap.unsafe(
    "create function public.fail_f2_epoch() returns trigger language plpgsql as $$ begin " +
    "raise exception 'synthetic-epoch-fault'; end $$; " +
    "create trigger fail_f2_epoch before insert on crm_private.identification_epochs " +
    "for each row execute function public.fail_f2_epoch()",
  );
  try {
    await assert.rejects(adapter.reidentify(await evidence(fresh.sessionId)),
      /F2_REIDENTIFY_DENIED/);
  } finally {
    await bootstrap.unsafe(
      "drop trigger fail_f2_epoch on crm_private.identification_epochs; " +
      "drop function public.fail_f2_epoch()",
    );
  }
  assert.equal((await bootstrap`
    select current_epoch from crm_private.identification_epochs
      where epoch_id=${fresh.epochId}::uuid
  `)[0]?.current_epoch,true);
  const oldGeneration = (await bootstrap`
    select access_generation::text as generation from crm_private.crm_actors
      where actor_id=${actorId}::uuid
  `)[0]?.generation;
  await bootstrap.unsafe(
    "create function public.fail_f2_generation() returns trigger language plpgsql as $$ begin " +
    "if new.access_generation>old.access_generation then raise exception 'synthetic-generation-fault'; " +
    "end if; return new; end $$; " +
    "create trigger fail_f2_generation before update on crm_private.crm_actors " +
    "for each row execute function public.fail_f2_generation()",
  );
  try {
    await assert.rejects(adapter.revokeAll(await evidence(fresh.sessionId)),
      /F2_REVOKE_DENIED/);
  } finally {
    await bootstrap.unsafe(
      "drop trigger fail_f2_generation on crm_private.crm_actors; " +
      "drop function public.fail_f2_generation()",
    );
  }
  assert.equal((await bootstrap`
    select access_generation::text as generation from crm_private.crm_actors
      where actor_id=${actorId}::uuid
  `)[0]?.generation,oldGeneration);
});

test("F2 authenticates every authority claim and material input; malformed MACs fail closed",async () => {
  const fresh = await adapter.establish(await evidence());
  for (const index of [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]) {
    await assert.rejects(runtimeB.begin(async (tx) => {
      const { q,f2cap,f1cap } = await rawRead(tx,fresh.sessionId);
      const fields=unpack(f2cap.payload);
      fields[index-1] = fields[index-1] + "x";
      const changed=encodeF2Fields(fields);
      await tx`select * from crm_api.human_read_probe(${changed},${f2cap.mac},
        ${f1cap.payload},${f1cap.mac},${q})`;
    }),(error: unknown) => (error as { code?: string }).code === "42501");
  }
  for (const mac of [Buffer.alloc(0),Buffer.alloc(31),randomBytes(32)]) {
    await assert.rejects(runtimeB.begin(async (tx) => {
      const { q,f2cap,f1cap } = await rawRead(tx,fresh.sessionId);
      await tx`select * from crm_api.human_read_probe(${f2cap.payload},${mac},
        ${f1cap.payload},${f1cap.mac},${q})`;
    }),(error: unknown) => (error as { code?: string }).code === "42501");
  }
  await assert.rejects(runtimeB.begin(async (tx) => {
    const { f2cap,f1cap } = await rawRead(tx,fresh.sessionId);
    const changedInput=encodeF1Fields(["CRM-INP1","C01","other-probe"]);
    await tx`select * from crm_api.human_read_probe(${f2cap.payload},${f2cap.mac},
      ${f1cap.payload},${f1cap.mac},${changedInput})`;
  }),(error: unknown) => (error as { code?: string }).code === "42501");
  const validPayload=await runtimeB.begin(async (tx) =>
    (await rawRead(tx,fresh.sessionId)).f2cap.payload);
  assert.equal(unpack(validPayload)[0],"CRM-H0F2");
});

test("F2 capability from another live backend cannot cross PID",async () => {
  const fresh=await adapter.establish(await evidence());
  await runtimeB.begin(async (firstTx) => {
    const fromFirst=await rawRead(firstTx,fresh.sessionId);
    await assert.rejects(runtime.begin(async (secondTx) => {
      const current=await rawRead(secondTx,fresh.sessionId);
      await secondTx`
        select * from crm_api.human_read_probe(${fromFirst.f2cap.payload},${fromFirst.f2cap.mac},
          ${current.f1cap.payload},${current.f1cap.mac},${current.q})
      `;
    }),(error: unknown) => (error as { code?: string }).code === "42501");
  });
});

test("runtime cannot enable actor, invent subject, sign, or exploit search_path/temp shadow",async () => {
  const fresh=await adapter.establish(await evidence());
  await assert.rejects(humanRead(
    await verifyAuth(auth.port,auth.register({
      subject:randomUUID(),sessionId:fresh.sessionId,
      passwordVerified:true,mfaVerified:true,
    })),"human-probe-a"),/F2_CORE_DENIED/);
  for (const query of [
    "select crm_api.set_actor_enabled(null,true,'ready')",
    "select crm_api.provision_actor_mapping(null,null,'other')",
    "select * from crm_f2.keys",
  ]) {
    await assert.rejects(runtimeB.unsafe(query),
      (error: unknown) => (error as { code?: string }).code === "42501");
  }
  await runtimeB.unsafe("set search_path = pg_temp, public, crm_api");
  await assert.rejects(runtimeB.unsafe(
    "create function pg_temp.f2_lookup(uuid,uuid) returns int language sql as 'select 1'",
  ),(error: unknown) => (error as { code?: string }).code === "42501");
  await assert.rejects(runtimeB`select * from crm_api.human_read_probe(null,null,null,null,null)`,
    (error: unknown) => (error as { code?: string }).code === "42501");
  await runtimeB.unsafe("reset search_path");
});

test("F2 issuer requires branded interactive route and a key distinct from F1",async () => {
  const fresh=await adapter.establish(await evidence());
  const current=await evidence(fresh.sessionId);
  await runtimeB.begin(async (tx) => {
    const rows=await tx<{ actor_id: string; access_generation: string;
      admin_scope: string; epoch_id: string }[]>`
      select actor_id::text,access_generation::text,admin_scope,epoch_id::text
        from crm_api.f2_lookup(${subject}::uuid,${fresh.sessionId}::uuid)
    `;
    const row=rows[0]!;
    const identity={
      actorId:row.actor_id,sessionId:fresh.sessionId,epochId:row.epoch_id,
      accessGeneration:row.access_generation,scope:row.admin_scope,
    };
    const q=encodeF1Fields(["CRM-INP1","C01","human-probe-a"]);
    const binding=await postgresF1Binding(tx);
    assert.throws(() => createF2Issuer(f2)(current,identity,binding,"C01",q),
      /F2_AUTHORIZATION_DENIED/);
    assert.throws(() => createF2Issuer(f2)(current,identity,binding,"C01",q,
      {interactionClass:"interactive_read"} as never),/F2_AUTHORIZATION_DENIED/);
    assert.throws(() => createF2Issuer(f2)(current,identity,binding,"C01",q,
      classifyServerEvent("polling")) ,/F2_AUTHORIZATION_DENIED/);
    assert.doesNotThrow(() => createF2Issuer(f2)(current,identity,binding,"C01",q,
      classifyServerEvent("core-read")));
  });
  assert.throws(() => new H0005PostgresAdapter(runtimeB,f1,
    {...f2,key:f1.key}),/F2_KEY_SEPARATION_REQUIRED/);
});

test("F2 exact key selection, generation and rotation fail closed without fallback",async () => {
  const fresh=await adapter.establish(await evidence());
  const rotated: F2SigningConfiguration={
    ...f2,keyId:randomUUID(),key:randomBytes(32),
  };
  await migration`
    insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${rotated.keyId},${Buffer.from(rotated.key)},${rotated.audience},${rotated.generation},
      ${rotated.allowedPurposes},true,clock_timestamp()-interval '1 minute',
      clock_timestamp()+interval '1 hour')
  `;
  for (const signing of [
    {...f2,keyId:randomUUID()},
    {...f2,generation:randomUUID()},
    {...f2,key:f1.key},
  ]) {
    await assert.rejects(runtimeB.begin(async (tx) => {
      const {q,f2cap,f1cap}=await rawRead(tx,fresh.sessionId,{signing});
      await tx`select * from crm_api.human_read_probe(${f2cap.payload},${f2cap.mac},
        ${f1cap.payload},${f1cap.mac},${q})`;
    }),(error: unknown) => (error as { code?: string }).code === "42501");
  }
  await migration`update crm_f2.keys set enabled=false where key_id=${f2.keyId}`;
  await assert.rejects(humanRead(await evidence(fresh.sessionId),"human-probe-a"),
    /F2_CORE_DENIED/);
  await runtimeB.begin(async (tx) => {
    const {q,f2cap,f1cap}=await rawRead(tx,fresh.sessionId,{signing:rotated});
    const rows=await tx`select * from crm_api.human_read_probe(${f2cap.payload},${f2cap.mac},
      ${f1cap.payload},${f1cap.mac},${q})`;
    assert.equal(rows.length,1);
  });
  await migration`update crm_f2.keys set enabled=true where key_id=${f2.keyId}`;
});

test("synthetic sensitive canaries do not escape the server-facing failure",async () => {
  const canary="SECRET_CANARY_H0_005";
  const current=await adapter.establish(await evidence());
  let observed: unknown;
  try {
    await humanWrite(await evidence(current.sessionId),"canary-op",
      "human-probe-write",canary);
  } catch (error) {
    observed=error;
  }
  assert.equal((observed as Error)?.message,"F2_CORE_DENIED");
  assert.ok(!JSON.stringify(observed).includes(canary));
});

async function currentGeneration(): Promise<string> {
  return (await bootstrap<{ generation: string }[]>`
    select access_generation::text as generation from crm_private.crm_actors
      where actor_id=${actorId}::uuid
  `)[0]!.generation;
}

async function preparedGlobalRevocation(tx: postgres.TransactionSql, sessionId: string) {
  const row = (await tx<{ actor_id: string; access_generation: string;
    admin_scope: string; epoch_id: string }[]>`
    select actor_id::text,access_generation::text,admin_scope,epoch_id::text
      from crm_api.f2_lookup_revoke_all_authority(${subject}::uuid,${sessionId}::uuid)
  `)[0]!;
  assert.ok(row, "live session must pass the narrow preparation lookup");
  const q=encodeF2Fields(["CRM-F2-INP1","revoke_all",row.actor_id]);
  const cap=createF2Issuer(f2)(await evidence(sessionId),{
    actorId:row.actor_id,sessionId,epochId:row.epoch_id,
    accessGeneration:row.access_generation,scope:row.admin_scope,
  },await postgresF1Binding(tx),"revoke_all",q);
  return {q,cap};
}

test("H0-006-F01 preparation denies revoked, stale, old epoch, disabled and expired authority",async () => {
  const denied=async (sessionId: string) => {
    const before=await currentGeneration();
    await assert.rejects(adapter.revokeAll(await evidence(sessionId)),/F2_REVOKE_DENIED/);
    assert.equal(await currentGeneration(),before);
  };
  const revoked=await adapter.establish(await evidence());
  await adapter.revokeOne(await evidence(revoked.sessionId));
  await denied(revoked.sessionId);

  const stale=await adapter.establish(await evidence());
  await migration`select crm_api.set_actor_enabled(${actorId}::uuid,false,'ready')`;
  await migration`select crm_api.set_actor_enabled(${actorId}::uuid,true,'ready')`;
  await denied(stale.sessionId);

  const oldEpoch=await adapter.establish(await evidence());
  await adapter.reidentify(await evidence(oldEpoch.sessionId));
  // The active replacement epoch is authorized; the old one cannot be reused.
  assert.notEqual((await runtime<{ epoch_id: string }[]>`
    select epoch_id::text from crm_api.f2_lookup_revoke_all_authority(
      ${subject}::uuid,${oldEpoch.sessionId}::uuid)
  `)[0]?.epoch_id,oldEpoch.epochId);

  const disabled=await adapter.establish(await evidence());
  await migration`select crm_api.set_actor_enabled(${actorId}::uuid,false,'ready')`;
  await denied(disabled.sessionId);
  await migration`select crm_api.set_actor_enabled(${actorId}::uuid,true,'ready')`;
  for (const state of ["enrollment_required","recovery_in_progress",
    "reidentification_required"] as const) {
    await migration`select crm_api.set_actor_enabled(${actorId}::uuid,true,${state})`;
    const before=await currentGeneration();
    await assert.rejects(adapter.revokeAll(await evidence(oldEpoch.sessionId)),
      /F2_REVOKE_DENIED/);
    assert.equal(await currentGeneration(),before);
    await migration`select crm_api.set_actor_enabled(${actorId}::uuid,true,'ready')`;
  }

  for (const [identifiedAge,activityAge] of [["9 days","8 days"],
    ["31 days","1 day"]] as const) {
    const expired=await adapter.establish(await evidence());
    await bootstrap`update crm_private.identification_epochs
      set identified_at=clock_timestamp()-${identifiedAge}::interval,
        last_human_activity_at=clock_timestamp()-${activityAge}::interval
      where epoch_id=${expired.epochId}::uuid`;
    await denied(expired.sessionId);
  }

  const current=await adapter.establish(await evidence());
  const foreign=await verifyAuth(auth.port,auth.register({
    subject:randomUUID(),sessionId:current.sessionId,
    passwordVerified:true,mfaVerified:true,
  }));
  await assert.rejects(adapter.revokeAll(foreign),/F2_REVOKE_DENIED/);
  await assert.rejects(adapter.revokeAll(await evidence(current.sessionId,true,false)),
    /F2_REVOKE_DENIED/);
  assert.equal((await runtime`select count(*)::int as n from
    crm_api.f2_lookup_revoke_all_authority(${subject}::uuid,${current.sessionId}::uuid)`)[0]?.n,1);
});

test("H0-006-F01 locked recheck denies a capability issued before revoke-one COMMIT",async () => {
  const first=await adapter.establish(await evidence());
  const other=await adapter.establish(await evidence());
  const before=await currentGeneration();
  await assert.rejects(runtimeB.begin(async (tx) => {
    const {q,cap}=await preparedGlobalRevocation(tx,first.sessionId);
    await adapter.revokeOne(await evidence(first.sessionId));
    await tx`select crm_api.revoke_all_sessions(${cap.payload},${cap.mac},${q})`;
  }),(error: unknown) => (error as { code?: string }).code === "42501");
  assert.equal(await currentGeneration(),before);
  assert.deepEqual(await humanRead(await evidence(other.sessionId),"human-probe-a"),
    {probeId:"human-probe-a",publicValue:"synthetic-public"});
  const beforeActivity=(await bootstrap<{ activity: string }[]>`
    select last_human_activity_at::text as activity from crm_private.identification_epochs
      where epoch_id=${other.epochId}::uuid
  `)[0]!.activity;
  assert.equal(await adapter.revokeAll(await evidence(other.sessionId)),
    (BigInt(before)+1n).toString());
  assert.equal((await bootstrap<{ activity: string }[]>`
    select last_human_activity_at::text as activity from crm_private.identification_epochs
      where epoch_id=${other.epochId}::uuid
  `)[0]!.activity,beforeActivity);
});

test("H0-006-F01 locked recheck rejects a pre-issued old epoch and expired session",async () => {
  const oldEpoch=await adapter.establish(await evidence());
  const before=await currentGeneration();
  await assert.rejects(runtimeB.begin(async (tx) => {
    const {q,cap}=await preparedGlobalRevocation(tx,oldEpoch.sessionId);
    await adapter.reidentify(await evidence(oldEpoch.sessionId));
    await tx`select crm_api.revoke_all_sessions(${cap.payload},${cap.mac},${q})`;
  }),(error: unknown) => (error as { code?: string }).code === "42501");
  assert.equal(await currentGeneration(),before);

  for (const [identifiedAge,activityAge] of [["9 days","8 days"],
    ["31 days","1 day"]] as const) {
    const expiring=await adapter.establish(await evidence());
    await assert.rejects(runtimeB.begin(async (tx) => {
      const {q,cap}=await preparedGlobalRevocation(tx,expiring.sessionId);
      await bootstrap`update crm_private.identification_epochs
        set identified_at=clock_timestamp()-${identifiedAge}::interval,
          last_human_activity_at=clock_timestamp()-${activityAge}::interval
        where epoch_id=${expiring.epochId}::uuid`;
      await tx`select crm_api.revoke_all_sessions(${cap.payload},${cap.mac},${q})`;
    }),(error: unknown) => (error as { code?: string }).code === "42501");
    assert.equal(await currentGeneration(),before);
  }
});

test("H0-006-F01 generation overflow fails closed without partial mutation",async () => {
  const current=await adapter.establish(await evidence());
  const max="9223372036854775807";
  await bootstrap`update crm_private.crm_actors set access_generation=${max}::bigint
    where actor_id=${actorId}::uuid`;
  await bootstrap`update crm_private.crm_sessions set access_generation=${max}::bigint
    where session_id=${current.sessionId}::uuid`;
  await assert.rejects(adapter.revokeAll(await evidence(current.sessionId)),/F2_REVOKE_DENIED/);
  assert.equal(await currentGeneration(),max);
  assert.equal((await bootstrap`select revoked_at from crm_private.crm_sessions
    where session_id=${current.sessionId}::uuid`)[0]?.revoked_at,null);
});
