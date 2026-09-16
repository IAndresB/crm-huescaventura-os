import assert from "node:assert/strict";
import { randomBytes, createHmac } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { before, after, test } from "node:test";
import postgres from "postgres";
import { hardenF1 } from "./f1-fixture.ts";
import { issueTrustedContext } from "../../src/application/trusted-context.ts";
import { H0M01PostgresAdapter } from "../../src/infrastructure/postgres/h0-m01-adapter.ts";
import { createF1Issuer, encodeF1Fields, type F1Capability, type F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";
import { postgresF1Binding } from "../../src/infrastructure/postgres/transaction.ts";

// Implementation regression suite for D037; not the formal H0-008 reverification.
const bin = process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
let root = "";
let started = false;
let admin: postgres.Sql, migration: postgres.Sql, runtime: postgres.Sql, other: postgres.Sql;
let adapter: H0M01PostgresAdapter, config: F1SigningConfiguration;
let issue: ReturnType<typeof createF1Issuer>;
const context = (scope = "scope-A", identityId = "actor-A") => issueTrustedContext({
  identityId, identityKind: "technical", purpose: "f1-corrective-test", scope,
  requestId: "synthetic-f1-request", serverTime: "2026-09-16T00:00:00Z",
});
const readInput = (id = "probe-A") => encodeF1Fields(["CRM-INP1", "C01", id]);
const writeInput = (id: string, value = "synthetic") => encodeF1Fields([
  "CRM-INP1", "C03", "synthetic-operation", "true", "true", "record-technical-probe", id, value,
]);
function command(name: string, args: string[]) {
  assert.equal(spawnSync(join(bin!,name),args,{env:{...process.env,LC_ALL:"C"}}).status,0,name);
}
function connect(user: string, database = "f1_correction") {
  return postgres({host:join(root,"socket"),port:55409,database,user,max:1,prepare:false,connect_timeout:2,idle_timeout:2});
}
const read = (tx: postgres.TransactionSql, cap: F1Capability, input = readInput()) =>
  tx`select * from crm_api.read_probe(${cap.payload},${cap.mac},${input})`;
const write = (tx: postgres.TransactionSql, cap: F1Capability, input: Buffer) =>
  tx`select crm_api.apply_probe_batch(${cap.payload},${cap.mac},${input})`;
function fields(raw: Buffer): string[] {
  const result: string[] = [];
  for (let pos=0;pos<raw.length;) {
    const len=raw.readUInt32BE(pos);pos+=4;result.push(raw.subarray(pos,pos+len).toString("utf8"));pos+=len;
  }
  return result;
}
function altered(cap: F1Capability, index: number, value: string, sign = false): F1Capability {
  const f=fields(cap.payload); f[index]=value;
  const payload=encodeF1Fields(f);
  return {payload,mac:sign ? createHmac("sha256",config.key).update(payload).digest() : cap.mac};
}
async function denied(operation: PromiseLike<unknown>) {
  await assert.rejects(Promise.resolve(operation),(e: unknown) => (e as {code?:string}).code === "42501");
}
before(async () => {
  root=await mkdtemp(join(tmpdir(),"crm-f1-correction-")); await mkdir(join(root,"socket"));
  command("initdb",["-D",join(root,"data"),"--username=f1_bootstrap","--auth-local=trust","--auth-host=scram-sha-256","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(root,"data"),"-l",join(root,"postgres.log"),"-o",`-k '${join(root,"socket")}' -h '' -p 55409`,"-w","start"]); started=true;
  admin=connect("f1_bootstrap","postgres");
  await admin.unsafe(await readFile(new URL("../../supabase/migrations/202609150000_h0_m01_roles.sql",import.meta.url),"utf8"));
  await admin`create database f1_correction owner crm_h0_migration`;
  await admin.end(); admin=connect("f1_bootstrap"); migration=connect("crm_h0_migration");
  await migration.unsafe(await readFile(new URL("../../supabase/migrations/202609150001_h0_m01_context.sql",import.meta.url),"utf8"));
  // Existing H0-M01 data survives forward migration.
  await admin`insert into crm_private.access_probe values ('probe-A','scope-A','public-A','SECRET_CANARY_H0_008'),('probe-B','scope-B','public-B','TOKEN_CANARY_H0_008')`;
  // Bootstrap forward roles with a real CREATEROLE administrator, not SUPERUSER.
  await admin`create role f1_role_admin login createrole nosuperuser nocreatedb nobypassrls`;
  await admin`grant connect on database f1_correction to f1_role_admin`;
  const rolesAdmin=connect("f1_role_admin");
  try {config=await hardenF1(rolesAdmin,migration);} finally {await rolesAdmin.end();}
  runtime=connect("crm_h0_runtime");other=connect("crm_h0_runtime");
  issue=createF1Issuer(config);adapter=new H0M01PostgresAdapter(runtime,config);
});
after(async () => {
  await Promise.allSettled([runtime?.end({timeout:1}),other?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started)command("pg_ctl",["-D",join(root,"data"),"-m","fast","-w","stop"]);
  if(root && root.startsWith(join(tmpdir(),"crm-f1-correction-")))await rm(root,{recursive:true,force:true});
});

test("F1 migration from H0-M01 preserves data; C01 returns only public projection",async()=>{
  assert.deepEqual((await adapter.read(context(),{probeId:"probe-A"})).data,{probeId:"probe-A",publicValue:"public-A"});
  assert.equal((await adapter.read(context(),{probeId:"probe-B"})).data,undefined);
  assert.deepEqual((await adapter.read(context("scope-B","actor-B"),{probeId:"probe-B"})).data,{probeId:"probe-B",publicValue:"public-B"});
});
for(const [id,index,value] of [
  ["A01",10,"actor-B"],["A02",13,"scope-B"],["A03",14,"C03"],
  ["A04",17,"0".repeat(64)],["A05",3,"another-environment"],["A06",2,"unknown-key"],
] as const)test(`${id} modification of authenticated claim is denied`,async()=>{
  await denied(runtime.begin(async tx=>{
    const cap=issue(context(),await postgresF1Binding(tx),"C01",readInput());
    await read(tx,altered(cap,index,value));
  }));
});
test("A07/A08 malformed capability, MAC lengths and random MAC fail closed",async()=>{
  for(const mac of [null,Buffer.alloc(0),randomBytes(31),randomBytes(33),randomBytes(32)]) {
    await denied(runtime.begin(async tx=>{
      const cap=issue(context(),await postgresF1Binding(tx),"C01",readInput());
      await tx`select * from crm_api.read_probe(${cap.payload},${mac},${readInput()})`;
    }));
  }
  for(const payload of [null,Buffer.alloc(0),Buffer.from([255,255,255,255]),Buffer.alloc(65537),Buffer.from([0,0,0,2,255,255])]) {
    await denied(runtime`select * from crm_api.read_probe(${payload},${randomBytes(32)},${readInput()})`);
  }
});
test("A09/A10/A24 copied capability fails on another transaction or connection",async()=>{
  const cap=await runtime.begin(async tx=>{
    const token=issue(context(),await postgresF1Binding(tx),"C01",readInput());
    assert.equal((await read(tx,token)).length,1);
    assert.equal((await read(tx,token)).length,1); // C01 may repeat the same authorized read.
    await denied(other.begin(otherTx=>read(otherTx,token)));
    return token;
  });
  await denied(runtime.begin(tx=>read(tx,cap)));
});
test("A11/A12/A30 valid capability cannot widen scope, operation or material input",async()=>{
  await runtime.begin(async tx=>{
    const q=readInput("probe-B"); const cap=issue(context(),await postgresF1Binding(tx),"C01",q);
    assert.equal((await read(tx,cap,q)).length,0);
  });
  for(const attack of ["operation","input"])await denied(runtime.begin(async tx=>{
    const cap=issue(context(),await postgresF1Binding(tx),"C01",readInput());
    if(attack==="operation")await write(tx,cap,writeInput("forged"));
    else await read(tx,cap,readInput("probe-B"));
  }));
});
test("A13/A25 C03 consumption permits only one surviving application, savepoints roll back effects together",async()=>{
  const q=writeInput("savepoint-probe");
  await runtime.begin(async tx=>{
    const cap=issue(context(),await postgresF1Binding(tx),"C03",q);
    await assert.rejects(tx.savepoint(async sp=>{await write(sp,cap,q);throw new Error("ROLLBACK_SYNTHETIC");}));
    assert.equal((await admin`select * from crm_private.access_probe where probe_id='savepoint-probe'`).length,0);
    await write(tx,cap,q);
    await denied(tx.savepoint(sp=>write(sp,cap,q)));
  });
  assert.equal((await adapter.read(context(),{probeId:"savepoint-probe"})).data?.publicValue,"synthetic");
});
test("A14/A15/A16/A17/A18 runtime cannot reach helpers, keys, roles or unsigned executors",async()=>{
  for(const sql of [
    "select crm_f1.verify(null,null,null,'C01')","select * from crm_f1.keys",
    "update crm_f1.keys set enabled=true","delete from crm_f1.consumption",
    "set role crm_h0_verifier","set role crm_h0_executor","set role crm_h0_table_owner","set role crm_h0_migration",
    "select * from crm_api.read_probe(null,null,null)","select crm_api.apply_probe_batch(null,null,null)",
  ])await denied(runtime.unsafe(sql));
});
test("A19 false GUC, verified flags and baseline envelope never authorize direct access",async()=>{
  await denied(runtime.begin(async tx=>{
    await tx`select set_config('crm.identity_id','actor-A',true),set_config('crm.identity_kind','technical',true),set_config('crm.scope','scope-A',true),set_config('crm.verified','true',true)`;
    await tx`select * from crm_private.access_probe`;
  }));
  await denied(runtime`select * from crm_api.read_probe(${Buffer.alloc(0)},${randomBytes(32)},${readInput()})`);
});
test("A20/A21/A22 hostile search_path and shadow attempts do not alter resolution",async()=>{
  await runtime.begin(async tx=>{
    await tx`set local search_path = pg_temp, public`;
    const cap=issue(context(),await postgresF1Binding(tx),"C01",readInput());
    assert.equal((await read(tx,cap)).length,1);
    await denied(tx.savepoint(sp=>sp`create temp table access_probe (secret text)`));
    await denied(tx.savepoint(sp=>sp.unsafe("create function crm_api.read_probe(text) returns text language sql as 'select $1'")));
  });
});
test("A23 driver/public failure paths do not include synthetic sensitive input",async()=>{
  for(const canary of ["SECRET_CANARY_H0_008","TOKEN_CANARY_H0_008"]) {
    await assert.rejects(adapter.commit(context(),{
      operationId:"canary-unit",historyRequired:true,resultRequired:true,
      changes:[{kind:"record-technical-probe",probeId:"probe-A",publicValue:canary}],
    }),e=>!JSON.stringify(e).includes(canary)&&!String(e).includes(canary));
    await runtime.begin(async tx=>{
      const q=writeInput("probe-A",canary);const cap=issue(context(),await postgresF1Binding(tx),"C03",q);
      await assert.rejects(tx.savepoint(sp=>write(sp,cap,q)),e=>{
        const error=e as Record<string,unknown>;
        // Postgres.js attaches caller parameters; these are not public diagnostics.
        for(const name of ["message","detail","hint","where"])assert.ok(!String(error[name]).includes(canary));
        return error.code==="42501";
      });
    });
  }
});
test("A26 commit, rollback, SQL error and reused max-one connection retain no authority",async()=>{
  const pids: string[]=[];
  for(const mode of ["commit","rollback","error"]) {
    let token: F1Capability;
    const run=runtime.begin(async tx=>{
      const binding=await postgresF1Binding(tx);pids.push(binding.pid);
      token=issue(context(),binding,"C01",readInput());await read(tx,token);
      if(mode==="rollback")throw new Error("ROLLBACK_SYNTHETIC");
      if(mode==="error")await tx`select 1/0`;
    });
    if(mode==="commit")await run;else await assert.rejects(run);
    const rows=await runtime`select nullif(current_setting('crm.f1_payload',true),'') as envelope`;
    assert.equal(rows[0].envelope,null);
    await denied(runtime.begin(tx=>read(tx,token!)));
  }
  assert.equal(new Set(pids).size,1);
});
test("A28 expiration and future not-before are denied with a valid MAC",async()=>{
  for(const delta of [-31000000n,31000000n])await denied(runtime.begin(async tx=>{
    const binding=await postgresF1Binding(tx);binding.now=(BigInt(binding.now)+delta).toString();
    await read(tx,issue(context(),binding,"C01",readInput()));
  }));
});
test("A29 exact key selection and revocation fail closed, no fallback",async()=>{
  await runtime.begin(async tx=>{
    const cap=issue(context(),await postgresF1Binding(tx),"C01",readInput());
    await migration`update crm_f1.keys set enabled=false where key_id=${config.keyId}`;
    try {await denied(tx.savepoint(sp=>read(sp,cap)));}
    finally {await migration`update crm_f1.keys set enabled=true where key_id=${config.keyId}`;}
    assert.equal((await read(tx,cap)).length,1);
    await denied(tx.savepoint(sp=>read(sp,altered(cap,2,"missing",true))));
  });
});
test("D037 effective ownership, memberships, FORCE RLS and split verifier/executor permissions",async()=>{
  const roles=await admin`select rolname,rolsuper,rolbypassrls,rolcanlogin from pg_roles where rolname in ('crm_h0_executor','crm_h0_verifier','crm_h0_table_owner')`;
  assert.equal(roles.length,3);for(const r of roles)assert.ok(!r.rolsuper&&!r.rolbypassrls&&!r.rolcanlogin);
  assert.equal((await admin`select * from pg_auth_members where member='crm_h0_runtime'::regrole`).length,0);
  const tables=await admin`select relrowsecurity,relforcerowsecurity,pg_get_userbyid(relowner) as owner from pg_class where oid='crm_private.access_probe'::regclass`;
  assert.deepEqual(tables[0],{relrowsecurity:true,relforcerowsecurity:true,owner:"crm_h0_table_owner"});
  for(const [role,sql] of [
    ["crm_h0_executor","select secret from crm_f1.keys"],
    ["crm_h0_verifier","select probe_id from crm_private.access_probe"],
    ["crm_h0_executor","select private_value from crm_private.access_probe"],
  ])await denied(migration.begin(async tx=>{await tx.unsafe(`set local role ${role}`);await tx.unsafe(sql);}));
  const allowed=await admin`select proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('crm_api','crm_f1') and has_function_privilege('crm_h0_runtime',p.oid,'execute') order by proname`;
  assert.deepEqual(Array.from(allowed),[{proname:"apply_probe_batch"},{proname:"read_probe"}]);
  const publicAcl=await admin`select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace cross join lateral aclexplode(p.proacl) a where n.nspname in ('crm_api','crm_f1') and a.grantee=0`;
  assert.equal(publicAcl.length,0);
  try {
    await denied(runtime.unsafe(await readFile(new URL("../../supabase/migrations/202609160001_h0_f1_capabilities.sql",import.meta.url),"utf8")));
  } finally { await runtime`rollback`; }
});
test("C03 first/intermediate error and explicit rollback leave no partial writes",async()=>{
  for(const changes of [
    [{kind:"record-technical-probe" as const,probeId:"probe-A",publicValue:"duplicate"}],
    [{kind:"record-technical-probe" as const,probeId:"partial",publicValue:"first"},{kind:"record-technical-probe" as const,probeId:"probe-A",publicValue:"duplicate"}],
  ])await assert.rejects(adapter.commit(context(),{operationId:"atomic",historyRequired:true,resultRequired:true,changes}));
  assert.equal((await adapter.read(context(),{probeId:"partial"})).data,undefined);
  await assert.rejects(runtime.begin(async tx=>{const q=writeInput("explicit-rollback");await write(tx,issue(context(),await postgresF1Binding(tx),"C03",q),q);throw new Error("ROLLBACK");}));
  assert.equal((await adapter.read(context(),{probeId:"explicit-rollback"})).data,undefined);
});
test("Codec rejects invalid UTF-8 source, oversized strings/input and unknown client authority fields",async()=>{
  assert.equal(encodeF1Fields(["a".repeat(16384)]).length,16388);
  assert.equal(encodeF1Fields(["é".repeat(8192)]).length,16388);
  for(const value of ["\ud800","\0","a".repeat(16385)])assert.throws(()=>encodeF1Fields([value]));
  assert.throws(()=>encodeF1Fields(Array(5).fill("a".repeat(16384))));
  for(const key of ["actor_id","actorId","TRUSTED_CONTEXT","trusted_context","role","permissions","migration_identity","privileged","bypass_rls","__proto__"]) {
    const input=JSON.parse(`{"probeId":"probe-A","${key}":{"nested":["authority"]}}`);
    await assert.rejects(adapter.read(context(),input));
  }
  const hostile="'; select secret from crm_f1.keys; --";
  assert.equal((await adapter.read(context(),{probeId:hostile})).data,undefined);
});

test("A27 connection lost before COMMIT returns E4 without blind retry",async()=>{
  let commits=0;
  const lossConnection=connect("crm_h0_runtime");
  const intercepted=new Proxy(lossConnection,{
    get(target,property) {
      if(property!=="begin")return Reflect.get(target,property);
      return (options: string,work: (tx: postgres.TransactionSql)=>Promise<unknown>) => target.begin(options,async tx=>{
        const result=await work(tx);commits++;
        const binding=await postgresF1Binding(tx);
        await admin`select pg_terminate_backend(${Number(binding.pid)})`;
        return result;
      });
    },
  });
  const port=new H0M01PostgresAdapter(intercepted,config);
  const result=await port.commit(context(),{operationId:"connection-loss",historyRequired:true,resultRequired:true,
    changes:[{kind:"record-technical-probe",probeId:"connection-loss",publicValue:"synthetic"}]});
  assert.equal(result.status,"pending");
  assert.equal(result.status==="pending"?result.issues[0].code:undefined,"E4");
  assert.equal(commits,1);
  assert.equal((await admin`select * from crm_private.access_probe where probe_id='connection-loss'`).length,0);
  await lossConnection.end({timeout:1});
});

test("A29 key rotation supports overlap, exact selection and retirement",async()=>{
  const next={...config,keyId:"synthetic-rotation-key",key:randomBytes(32)};
  await migration`insert into crm_f1.keys (key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values (${next.keyId},${Buffer.from(next.key)},${next.audience},${next.generation},${next.allowedPurposes},true,
    clock_timestamp()-interval '1 minute',clock_timestamp()+interval '1 hour')`;
  const nextPort=new H0M01PostgresAdapter(runtime,next);
  assert.ok((await nextPort.read(context(),{probeId:"probe-A"})).data);
  assert.ok((await adapter.read(context(),{probeId:"probe-A"})).data);
  await migration`update crm_f1.keys set enabled=false where key_id=${config.keyId}`;
  try {
    await assert.rejects(adapter.read(context(),{probeId:"probe-A"}));
    assert.ok((await nextPort.read(context(),{probeId:"probe-A"})).data);
  } finally {
    await migration`update crm_f1.keys set enabled=true where key_id=${config.keyId}`;
    await migration`delete from crm_f1.keys where key_id=${next.keyId}`;
  }
});

test("RLS independently limits the executor to authenticated scope, row and manifest",async()=>{
  // Fixture-only aperture lets the real executor attempt a broader SELECT/INSERT.
  // It exists only in the disposable cluster, not in any production migration.
  await admin.unsafe(`
    create function crm_api.fixture_select() returns table(probe_id text) language sql
      security definer set search_path=pg_catalog,pg_temp
      as 'select probe_id from crm_private.access_probe';
    alter function crm_api.fixture_select() owner to crm_h0_executor;
    revoke all on function crm_api.fixture_select() from public;
    grant execute on function crm_api.fixture_select() to crm_h0_runtime;
    create function crm_api.fixture_insert() returns void language sql
      security definer set search_path=pg_catalog,pg_temp
      as $$insert into crm_private.access_probe(probe_id,context_scope,public_value)
      values ('outside-manifest','scope-B','unapproved')$$;
    alter function crm_api.fixture_insert() owner to crm_h0_executor;
    revoke all on function crm_api.fixture_insert() from public;
    grant execute on function crm_api.fixture_insert() to crm_h0_runtime;
  `);
  try {
    assert.equal((await runtime`select * from crm_api.fixture_select()`).length,0);
    await runtime.begin(async tx=>{
      const cap=issue(context(),await postgresF1Binding(tx),"C01",readInput());
      await tx`select set_config('crm.f1_payload',${cap.payload.toString("hex")},true),
        set_config('crm.f1_mac',${cap.mac.toString("hex")},true),set_config('crm.f1_input',${readInput().toString("hex")},true)`;
      assert.deepEqual(Array.from(await tx`select * from crm_api.fixture_select()`),[{probe_id:"probe-A"}]);
    });
    await denied(runtime.begin(async tx=>{
      const q=writeInput("approved-only");const cap=issue(context(),await postgresF1Binding(tx),"C03",q);
      await tx`select set_config('crm.f1_payload',${cap.payload.toString("hex")},true),
        set_config('crm.f1_mac',${cap.mac.toString("hex")},true),set_config('crm.f1_input',${q.toString("hex")},true)`;
      await tx`select crm_api.fixture_insert()`;
    }));
  } finally {await admin`drop function crm_api.fixture_select()`;await admin`drop function crm_api.fixture_insert()`;}
});

test("D037 comparator checks every MAC bit and has fresh internal blinding with a fixed loop",async()=>{
  await runtime.begin(async tx=>{
    const cap=issue(context(),await postgresF1Binding(tx),"C01",readInput());
    for(let bit=0;bit<256;bit++) {
      const mac=Buffer.from(cap.mac);mac[Math.floor(bit/8)]^=1<<(bit%8);
      await denied(tx.savepoint(sp=>read(sp,{payload:cap.payload,mac})));
    }
    assert.equal((await read(tx,cap)).length,1);
  });
  const [definition]=await admin`select prosrc,provolatile,proparallel from pg_proc where oid='crm_f1.verify(bytea,bytea,bytea,text)'::regprocedure`;
  assert.equal(definition.provolatile,"v");assert.equal(definition.proparallel,"u");
  assert.match(definition.prosrc,/b := crm_crypto\.gen_random_bytes\(32\)/);
  assert.match(definition.prosrc,/for i in 0\.\.31 loop acc := acc \| \(get_byte\(l,i\) # get_byte\(r,i\)\); end loop/);
  assert.ok(!/e\s*=\s*s|random\(\)/i.test(definition.prosrc));
});

test("Authenticated but incompatible version, audience, generation, binding and limits fail closed",async()=>{
  for(const [index,value] of [[1,"2"],[3,"wrong-audience"],[4,"wrong-generation"],[5,"0"],[6,"0"],[7,"0"],[8,"0"],[9,"another-login"],[11,"human"],[12,"unapproved-purpose"]] as const) {
    await denied(runtime.begin(async tx=>{
      const cap=issue(context(),await postgresF1Binding(tx),"C01",readInput());
      await read(tx,altered(cap,index,value,true));
    }));
  }
  for(const extra of [{expectedVersion:"1"},{intent:{}},{historyRequired:"yes"},{resultRequired:1}]) {
    await assert.rejects(adapter.commit(context(),{
      operationId:"unsupported",changes:[{kind:"record-technical-probe",probeId:"new",publicValue:"value"}],
      historyRequired:true,resultRequired:true,...extra,
    } as Parameters<typeof adapter.commit>[1]));
  }
});
