import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import postgres from "postgres";
import { H0M01PostgresAdapter } from "../../src/infrastructure/postgres/h0-m01-adapter.ts";
import { issueTrustedContext } from "../../src/application/trusted-context.ts";
import { invokeC01, invokeC03 } from "../../src/application/contracts.ts";
import { invokeServerBoundary } from "../../src/server/boundary.ts";
import type { DiagnosticEvent } from "../../src/server/diagnostics.ts";

// Independent D037 verification: no production codec, issuer or migration fixture.
// Only synthetic verifier provisioning has K. Every attack uses the runtime login.
const bin = process.env.POSTGRES_H0_BIN;
if (!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const migrationText = (name: string) => readFile(new URL(`../../supabase/migrations/${name}`, import.meta.url), "utf8");
const encode = (fields: readonly string[]) => Buffer.concat(fields.flatMap(value => {
  const bytes = Buffer.from(value, "utf8"), length = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length);
  return [length, bytes];
}));
const input = (id = "formal-A") => encode(["CRM-INP1", "C01", id]);
const sha = (raw: Buffer) => createHash("sha256").update(raw).digest("hex");
const denied = (operation: PromiseLike<unknown>) => assert.rejects(Promise.resolve(operation),
  (e: unknown) => (e as { code?: string }).code === "42501");

test("H0-008 formal independent D037 reverification (fail-fast)", async t => {
  const root = await mkdtemp(join(tmpdir(), "crm-h0-008-formal-"));
  const sockets = join(root, "socket"), connections: postgres.Sql[] = [];
  let started = false;
  function command(name: string, args: string[]) {
    assert.equal(spawnSync(join(bin!, name), args, { env: { ...process.env, LC_ALL: "C" } }).status, 0, name);
  }
  function connect(user: string, database = "formal_008") {
    const sql = postgres({ host: sockets, port: 55410, database, user, max: 1, prepare: false, connect_timeout: 2 });
    connections.push(sql);
    return sql;
  }
  async function check(name: string, work: (sub: TestContext) => Promise<void>) {
    let failure: unknown;
    await t.test(name, async sub => { try { await work(sub); } catch (e) { failure = e; throw e; } });
    if (failure) throw new Error(`FORMAL_FAIL_FAST: ${name}`);
  }
  try {
    await mkdir(sockets);
    command("initdb", ["-D", join(root, "data"), "--username=formal_bootstrap", "--auth-local=trust", "--auth-host=scram-sha-256", "--no-locale", "--encoding=UTF8"]);
    command("pg_ctl", ["-D", join(root, "data"), "-l", join(root, "postgres.log"), "-o", `-k '${sockets}' -h '' -p 55410`, "-w", "start"]);
    started = true;
    const bootstrap = connect("formal_bootstrap", "postgres");
    assert.match((await bootstrap`select version() as version`)[0].version, /PostgreSQL 17\.11/);
    await bootstrap.unsafe(await migrationText("202609150000_h0_m01_roles.sql"));
    await bootstrap`create database formal_008 owner crm_h0_migration`;
    const admin = connect("formal_bootstrap"), migrator = connect("crm_h0_migration");
    const runtime = connect("crm_h0_runtime"), other = connect("crm_h0_runtime");
    await migrator.unsafe(await migrationText("202609150001_h0_m01_context.sql"));
    await admin`insert into crm_private.access_probe values ('formal-A','scope-A','public-A','SECRET_CANARY_FORMAL_008'), ('formal-B','scope-B','public-B','TOKEN_CANARY_FORMAL_008')`;
    const forward = await migrationText("202609160001_h0_f1_capabilities.sql");
    await admin`create role formal_role_admin login createrole nosuperuser nocreatedb nobypassrls`;
    await admin`grant connect on database formal_008 to formal_role_admin`;
    const roleAdmin = connect("formal_role_admin");
    await roleAdmin.unsafe(await migrationText("202609160000_h0_f1_authorities.sql"));

    await check("V-MIG: failed forward is atomic; retry preserves H0-M01 data without superuser", async () => {
      // Existing conflicting object forces a deterministic failure, without editing migration bytes.
      await migrator`create schema crm_crypto`;
      await assert.rejects(migrator.unsafe(forward), (e: unknown) => (e as { code?: string }).code === "42P06");
      await migrator`rollback`;
      assert.equal((await admin`select to_regnamespace('crm_f1') as schema`)[0].schema, null);
      assert.equal((await admin`select count(*)::int as n from crm_private.access_probe`)[0].n, 2);
      await migrator`drop schema crm_crypto`;
      assert.equal((await migrator`select rolsuper from pg_roles where rolname=current_user`)[0].rolsuper, false);
      await migrator.unsafe(forward);
      assert.equal((await admin`select count(*)::int as n from crm_private.access_probe`)[0].n, 2);
      await denied(runtime`select probe_id from crm_private.access_probe`);
    });

    const key = randomBytes(32), keyId = randomUUID(), audience = randomUUID(), generation = randomUUID();
    await migrator`insert into crm_f1.keys values (${keyId},${key},${audience},${generation},array['formal-verification'],true,clock_timestamp()-interval '1 minute',clock_timestamp()+interval '1 hour')`;
    async function fields(tx: postgres.TransactionSql, q = input(), operation = "C01") {
      const [b] = await tx`select pg_current_xact_id()::text as xid, pg_backend_pid()::text as pid,
        (select oid::text from pg_database where datname=current_database()) as db,
        (extract(epoch from pg_postmaster_start_time())*1000000)::bigint::text as start,
        floor(extract(epoch from clock_timestamp())*1000000)::bigint::text as now`;
      return ["CRM-H0F1","1",keyId,audience,generation,b.db,b.start,b.xid,b.pid,"crm_h0_runtime",
        "actor-formal-A","technical","formal-verification","scope-A",operation,"access_probe",
        operation === "C01" ? "read_probe" : "apply_probe_batch",sha(q),b.now,(BigInt(b.now)+30000000n).toString(),randomUUID()];
    }
    const mac = (p: Buffer) => createHmac("sha256", key).update(p).digest();
    const read = (tx: postgres.TransactionSql, p: Buffer, s: Buffer, q = input()) => tx`select * from crm_api.read_probe(${p},${s},${q})`;

    await check("V-DAT: effective catalogs, owners, PUBLIC, transitive memberships and proconfig", async () => {
      const [runtimeRole] = await admin`select rolcanlogin,rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,rolreplication from pg_roles where rolname='crm_h0_runtime'`;
      assert.deepEqual(runtimeRole, {rolcanlogin:true,rolsuper:false,rolbypassrls:false,rolcreatedb:false,rolcreaterole:false,rolreplication:false});
      assert.equal((await admin`with recursive membership(roleid) as (
        select roleid from pg_auth_members where member='crm_h0_runtime'::regrole
        union select m.roleid from pg_auth_members m join membership r on m.member=r.roleid)
        select * from membership`).length, 0);
      const functions = await admin`select n.nspname,p.proname,p.prosecdef,p.proconfig,p.pronargdefaults,
        pg_get_userbyid(p.proowner) as owner,p.prosrc from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname in ('crm_api','crm_f1') order by n.nspname,p.proname`;
      assert.equal(functions.length,5);
      for (const f of functions) {
        assert.deepEqual(f.proconfig,["search_path=pg_catalog, pg_temp"]);
        assert.equal(f.pronargdefaults,0);
        assert.equal(f.owner,f.nspname === "crm_api" ? "crm_h0_executor" : "crm_h0_verifier");
        assert.equal(f.prosecdef,f.proname !== "fields");
        assert.doesNotMatch(f.prosrc,/\bexecute\s/i);
      }
      const acl = await admin`select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        cross join lateral aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
        where n.nspname in ('crm_api','crm_f1') and a.grantee=0 and a.privilege_type='EXECUTE'`;
      assert.equal(acl.length,0);
      const [table] = await admin`select relrowsecurity,relforcerowsecurity,pg_get_userbyid(relowner) as owner
        from pg_class where oid='crm_private.access_probe'::regclass`;
      assert.deepEqual(table,{relrowsecurity:true,relforcerowsecurity:true,owner:"crm_h0_table_owner"});
      for (const schema of ["crm_private","crm_api","crm_f1","crm_crypto","public"]) {
        assert.equal((await admin`select has_schema_privilege('crm_h0_runtime',${schema},'CREATE') as allowed`)[0].allowed,false);
      }
    });

    await check("V-DAT: hostile direct SQL cannot escalate, mutate ACL or use a privileged helper", async () => {
      const attacks = [
        "create schema hostile", "create table crm_private.hostile(x int)",
        "alter table crm_private.access_probe disable row level security", "drop table crm_private.access_probe",
        "alter table crm_private.access_probe owner to crm_h0_runtime",
        "alter policy access_probe_f1_read on crm_private.access_probe using (true)",
        "create role hostile", "alter role crm_h0_runtime createrole", "grant crm_h0_executor to crm_h0_runtime",
        "grant select on crm_private.access_probe to crm_h0_runtime", "revoke all on crm_private.access_probe from crm_h0_executor",
        "select secret from crm_f1.keys", "insert into crm_f1.keys(key_id) values ('hostile')", "update crm_f1.keys set enabled=true",
        "delete from crm_f1.keys", "delete from crm_f1.consumption", "select * from crm_private.access_probe",
        "insert into crm_private.access_probe values ('hostile','scope-B','x','x')", "update crm_private.access_probe set public_value='x'", "delete from crm_private.access_probe",
        "select crm_f1.fields(null)", "select crm_f1.verify(null,null,null,'C01')", "select crm_f1.row_allows('scope-B','formal-B','public-B','C01')",
        "alter function crm_api.read_probe(bytea,bytea,bytea) security invoker",
        "create function crm_api.read_probe(text default 'x') returns text language sql as 'select $1'",
        "create temp table access_probe(x text)",
        ...["crm_h0_migration","crm_h0_table_owner","crm_h0_verifier","crm_h0_executor"].map(r=>`set role ${r}`),
      ];
      for (const attack of attacks) await denied(runtime.unsafe(attack));
      const generic = connect("crm_h0_untrusted");
      await denied(generic`select 1`);
      // Same role visibility is assumed; knowing definitions is not authority.
      assert.ok((await runtime`select pg_get_functiondef('crm_api.read_probe(bytea,bytea,bytea)'::regprocedure) as source`)[0].source);
    });

    await check("Capability: every one of 21 fields is authenticated, not just the six original mutations", async () => {
      await runtime.begin(async tx => {
        const f = await fields(tx), p = encode(f), s = mac(p);
        assert.deepEqual(Array.from(await read(tx,p,s)),[{probe_id:"formal-A",public_value:"public-A"}]);
        for (let index=0;index<f.length;index++) {
          const modified=[...f]; modified[index]+="X";
          await denied(tx.savepoint(sp=>read(sp,encode(modified),s)));
        }
        assert.equal((await read(tx,p,s)).length,1);
      });
    });

    await check("Codec: signed malformed payload/input, trailing bytes, UTF-8 and exact limits fail closed", async () => {
      await runtime.begin(async tx => {
        const f=await fields(tx), p=encode(f);
        const over=[...f]; over[10]="x".repeat(16385);
        const invalidUtf8=Buffer.from(p); invalidUtf8[4]=255;
        const variants=[Buffer.alloc(0),p.subarray(0,p.length-1),Buffer.concat([p,Buffer.from([0])]),
          encode(f.slice(0,-1)),encode([...f,"extra"]),invalidUtf8,encode(over),Buffer.alloc(65537)];
        for (const malformed of variants) await denied(tx.savepoint(sp=>read(sp,malformed,mac(malformed))));
        for (const s of [Buffer.alloc(0),randomBytes(31),randomBytes(33),randomBytes(32)]) await denied(tx.savepoint(sp=>read(sp,p,s)));
        const validLimit=[...f]; validLimit[10]="é".repeat(8192);
        assert.equal((await read(tx,encode(validLimit),mac(encode(validLimit)))).length,1);
        for (const q of [encode(["CRM-INP1","C01"]),encode(["CRM-INP1","C01","formal-A","extra"]),
          Buffer.concat([input(),Buffer.from([0])]),encode(["CRM-INP1","C01","x".repeat(16385)]),Buffer.alloc(65537)]) {
          const fp=[...f]; fp[17]=sha(q); const payload=encode(fp);
          await denied(tx.savepoint(sp=>read(sp,payload,mac(payload),q)));
        }
      });
    });

    await check("Binding: public observations and persistent forged envelope cannot cross transaction/pool", async () => {
      let previous: {p: Buffer;s: Buffer;pid: string;xid: string} | undefined;
      await runtime.begin(async tx => {
        const f=await fields(tx),p=encode(f),s=mac(p); previous={p,s,pid:f[8],xid:f[7]};
        await tx`select set_config('crm.f1_payload',${p.toString('hex')},false),set_config('crm.f1_mac',${s.toString('hex')},false),set_config('crm.f1_input',${input().toString('hex')},false),set_config('crm.verified','true',false)`;
        await denied(other.begin(ot=>read(ot,p,s)));
        assert.equal((await read(tx,p,s)).length,1);
      });
      await runtime.begin(async tx => {
        const f=await fields(tx);
        assert.equal(f[8],previous!.pid);assert.notEqual(f[7],previous!.xid);
        await denied(tx.savepoint(sp=>read(sp,previous!.p,previous!.s)));
        await denied(tx.savepoint(sp=>sp`select * from crm_api.read_probe(null,null,null)`));
        const p=encode(f);assert.equal((await read(tx,p,mac(p))).length,1);
      });
    });

    await check("C03: authenticated order, complete manifest, no second surviving application or partial effect", async () => {
      const parts=["CRM-INP1","C03","formal-operation","true","true",
        "record-technical-probe","formal-write-1","first",
        "record-technical-probe","formal-write-2","second"];
      const q=encode(parts);
      await runtime.begin(async tx => {
        const p=encode(await fields(tx,q,"C03")),s=mac(p);
        const swapped=encode([...parts.slice(0,5),...parts.slice(8),...parts.slice(5,8)]);
        for (const changed of [swapped,encode(parts.slice(0,8)),encode([...parts,"extra"])]) {
          await denied(tx.savepoint(sp=>sp`select crm_api.apply_probe_batch(${p},${s},${changed})`));
        }
        const result=await tx`select crm_api.apply_probe_batch(${p},${s},${q}) as ids`;
        assert.deepEqual(result[0].ids,["formal-write-1","formal-write-2"]);
        await denied(tx.savepoint(sp=>sp`select crm_api.apply_probe_batch(${p},${s},${q})`));
      });
      assert.equal((await admin`select count(*)::int as n from crm_private.access_probe where probe_id in ('formal-write-1','formal-write-2')`)[0].n,2);
      const failing=encode(["CRM-INP1","C03","formal-failure","true","true",
        "record-technical-probe","must-rollback","synthetic","record-technical-probe","formal-A","duplicate"]);
      await denied(runtime.begin(async tx=>{
        const p=encode(await fields(tx,failing,"C03"));
        await tx`select crm_api.apply_probe_batch(${p},${mac(p)},${failing})`;
      }));
      assert.equal((await admin`select count(*)::int as n from crm_private.access_probe where probe_id='must-rollback'`)[0].n,0);
      assert.equal((await admin`select count(*)::int as n from crm_f1.consumption`)[0].n,1);
    });

    await check("D037 expiry during executor rolls back effects; no success after deadline", async () => {
      // Disposable witness sequence proves the delayed executor was entered.
      // Sequence advancement survives rollback; it is not a production mechanism.
      await migrator.unsafe(`create sequence crm_f1.formal_witness;
        create function crm_f1.formal_delay() returns trigger language plpgsql security definer
        set search_path=pg_catalog,pg_temp as $$ begin
          perform nextval('crm_f1.formal_witness'); perform pg_sleep(0.6); return new; end $$;
        revoke all on function crm_f1.formal_delay() from public;
        create trigger formal_delay before insert on crm_private.access_probe
          for each row execute function crm_f1.formal_delay();`);
      try {
        const q=encode(["CRM-INP1","C03","expiry-unit","true","true","record-technical-probe","expired-write","synthetic"]);
        await denied(runtime.begin(async tx => {
          const f=await fields(tx,q,"C03");f[18]=(BigInt(f[18])-29500000n).toString();f[19]=(BigInt(f[18])+30000000n).toString();
          const p=encode(f);await tx`select crm_api.apply_probe_batch(${p},${mac(p)},${q})`;
        }));
        assert.equal((await migrator`select is_called from crm_f1.formal_witness`)[0].is_called,true);
        assert.equal((await admin`select count(*)::int as n from crm_private.access_probe where probe_id='expired-write'`)[0].n,0);
        assert.equal((await admin`select count(*)::int as n from crm_f1.consumption`)[0].n,1);
      } finally {
        await migrator.unsafe("drop trigger formal_delay on crm_private.access_probe; drop function crm_f1.formal_delay(); drop sequence crm_f1.formal_witness;");
      }
    });

    await check("Keys: exact length, missing/revoked selection and no secret-bearing SQL definitions", async () => {
      await assert.rejects(migrator`insert into crm_f1.keys values ('invalid-size',${randomBytes(31)},${audience},${generation},array['formal-verification'],true,now(),now()+interval '1 hour')`,
        (e: unknown)=>(e as {code?: string}).code==='23514');
      await runtime.begin(async tx => {
        const f=await fields(tx),p=encode(f),s=mac(p);
        await migrator`update crm_f1.keys set enabled=false where key_id=${keyId}`;
        try {await denied(tx.savepoint(sp=>read(sp,p,s)));}
        finally {await migrator`update crm_f1.keys set enabled=true where key_id=${keyId}`;}
        f[2]="absent-key";const unknown=encode(f);await denied(tx.savepoint(sp=>read(sp,unknown,mac(unknown))));
        assert.equal((await read(tx,p,s)).length,1);
      });
      const definitions=await runtime`select prosrc from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('crm_api','crm_f1')`;
      assert.ok(!JSON.stringify(definitions).includes(key.toString('hex')));
      assert.ok(!JSON.stringify(definitions).includes(key.toString('base64')));
      assert.equal((await admin`select has_table_privilege('crm_h0_executor','crm_f1.keys','SELECT') as allowed`)[0].allowed,false);
      for (const privilege of ['SELECT','INSERT','UPDATE','DELETE']) {
        assert.equal((await admin`select has_table_privilege('crm_h0_verifier','crm_private.access_probe',${privilege}) as allowed`)[0].allowed,false);
      }
    });

    await check("C01/C03 server boundary: minimum projection, hostile input and real SQL errors do not leak canaries", async () => {
      const adapter=new H0M01PostgresAdapter(runtime,{key,keyId,audience,generation,allowedPurposes:["formal-verification"]});
      const context=issueTrustedContext({identityId:"actor-formal-A",identityKind:"technical",purpose:"formal-verification",
        scope:"scope-A",requestId:"formal-boundary",serverTime:new Date().toISOString()});
      const guards={identityAndScope:"satisfied",materialTruth:"satisfied",sensitiveSupervision:"not-required",
        conservation:"satisfied",independence:"satisfied",repetition:"new"} as const;
      const events: DiagnosticEvent[]=[];
      const dependencies={allowedOrigins:new Set(["https://synthetic.invalid"]),contexts:{resolve:async()=>context},
        fingerprints:{fingerprint:()=>"synthetic-fingerprint"},replay:{inspect:async()=>({status:"new" as const})},
        diagnostics:{record:(event: DiagnosticEvent)=>{events.push(event);}}};
      const raw={requestId:"SECRET_CANARY_FORMAL_008",kind:"query",origin:"https://synthetic.invalid",payload:{probeId:"formal-A"}};
      const result=await invokeServerBoundary(raw,dependencies,ctx=>invokeC01({context:ctx,scope:ctx.scope,guards,input:raw.payload},adapter));
      assert.deepEqual(result,{status:"applied",value:{data:{probeId:"formal-A",publicValue:"public-A"},provenance:"postgres-h0-m01",certainty:"verified"}});
      for (const probeId of ["formal-B","missing","'; SELECT secret FROM crm_f1.keys; --"]) {
        assert.equal((await adapter.read(context,{probeId})).data,undefined);
      }
      for (const forged of [undefined,{}, { ...context, scope:"" }]) {
        await assert.rejects(adapter.read(forged as typeof context,{probeId:"formal-A"}));
      }
      const canaries=["SECRET_CANARY_FORMAL_008","TOKEN_CANARY_FORMAL_008",key.toString('hex'),key.toString('base64')];
      for (const canary of canaries) {
        const unit={operationId:canary,historyRequired:true,resultRequired:true,
          changes:[{kind:"record-technical-probe",probeId:"formal-A",publicValue:canary}]} as const;
        const rejected=await invokeServerBoundary({...raw,kind:"mutation",operation:{id:canary},payload:unit},dependencies,
          ctx=>invokeC03({context:ctx,scope:ctx.scope,guards,input:unit},adapter));
        assert.equal(rejected.status,"rejected");
        for (const secret of canaries) assert.ok(!JSON.stringify({rejected,events,result}).includes(secret));
      }
      for (const claim of ["actor_id","trusted_context","role","permissions","migration_identity","privileged","bypass_rls"]) {
        await assert.rejects(adapter.read(context,{probeId:"formal-A",[claim]:{nested:["scope-B"]}}));
      }
    });
  } finally {
    await Promise.allSettled(connections.map(sql=>sql.end({timeout:1})));
    if (started) command("pg_ctl",["-D",join(root,"data"),"-m","fast","-w","stop"]);
    await rm(root,{recursive:true,force:true});
  }
});
