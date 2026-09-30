import assert from "node:assert/strict";
import {randomBytes,randomUUID,createHmac} from "node:crypto";
import {spawnSync} from "node:child_process";
import {mkdtemp,mkdir,readFile,readdir,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {after,before,test} from "node:test";
import postgres from "postgres";
import {verifyAuth} from "../../src/application/verified-auth.ts";
import {classifyServerEvent} from "../../src/application/verified-interaction.ts";
import {H0005PostgresAdapter} from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import {H1013EvidenceAdapter,type B07Command} from "../../src/infrastructure/postgres/h1-evidence-adapter.ts";
import {H1015ObjectAdapter,type PrepareObject,type ObjectContext} from "../../src/infrastructure/postgres/h1-object-adapter.ts";
import {SupabasePrivateStorage,digest} from "../../src/infrastructure/storage/private-storage.ts";
import type {F1SigningConfiguration} from "../../src/infrastructure/postgres/f1-codec.ts";
import type {F2SigningConfiguration} from "../../src/infrastructure/postgres/f2-codec.ts";

const bin=process.env.POSTGRES_H0_BIN;
if(!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h1_015_isolated",port=Number(process.env.POSTGRES_H1015_PORT??55448);
const subject=randomUUID(),actorId=randomUUID(),scope="h1-b07-synthetic-scope";
const contextId=randomUUID(),otherContextId=randomUUID(),predecessorId=randomUUID();
let temporaryRoot="",socket="",started=false,sessionId="";
let admin:postgres.Sql,migration:postgres.Sql,runtime:postgres.Sql,second:postgres.Sql;
let objects:H1015ObjectAdapter,storage:SupabasePrivateStorage,serviceToken="",bucket="";
const endpoint=process.env.STORAGE_H1_ENDPOINT;
const storageRuntime=process.env.STORAGE_H1_RUNTIME;
if(!endpoint||!storageRuntime||new URL(endpoint).hostname!=="127.0.0.1") throw new Error("ISOLATED_STORAGE_REQUIRED");
const objectContext:ObjectContext={contextKind:"other",contextId,purpose:"fixture-case"};
function preparation(bytes:Uint8Array,change:Partial<PrepareObject>={}):PrepareObject {
 return {...objectContext,operationId:randomUUID(),rootId:randomUUID(),versionId:randomUUID(),documentId:predecessorId,
 expectedVersion:0,sourceRef:"fixture-source",reason:"fixture-private-object",digest:digest(bytes),size:bytes.length,media:"application/octet-stream",...change};
}
let f1:F1SigningConfiguration,f2:F2SigningConfiguration,adapter:H1013EvidenceAdapter;
const read=classifyServerEvent("core-read"),write=classifyServerEvent("core-action");
function command(name:string,args:readonly string[]){
  const result=spawnSync(join(bin!,name),args,{encoding:"utf8",env:{...process.env,LC_ALL:"C"}});
  assert.equal(result.status,0,`${name}: ${result.stderr}`);
}
function connect(user:string,db=database){
  return postgres({host:socket,port,database:db,user,max:user==="crm_h0_runtime"?3:1,
    prepare:false,connect_timeout:3,onnotice:()=>{}});
}
async function applyChain(target:postgres.Sql,bootstrap:postgres.Sql,until?:string,afterFile?:string){
  const files=(await readdir(migrations)).filter(name=>name.endsWith(".sql")
    &&name!=="202609150000_h0_m01_roles.sql"&&(until===undefined||name<=until)
    &&(afterFile===undefined||name>afterFile)).sort();
  for(const file of files){
    if(file.endsWith("_authorities.sql")){
      const exists=(await bootstrap`select exists(select 1 from pg_roles where rolname='crm_h0_ha_tx') present`)[0]?.present;
      if(!exists) await bootstrap.unsafe(await readFile(join(migrations,file),"utf8"));
    }else await target.unsafe(await readFile(join(migrations,file),"utf8"));
  }
}
async function auth(){return verifyAuth({verify:async()=>({subject,sessionId,passwordVerified:true,mfaVerified:true})},randomUUID());}
function req(kind:B07Command["kind"],material:Record<string,unknown>,change:Partial<B07Command>={}):B07Command{
  return {action:"create",operationId:randomUUID(),targetId:randomUUID(),kind,material,
    sourceRef:"fixture-manual-source",purpose:"fixture-case",occurredAt:"2026-09-28T10:00:00Z",
    contextKind:"other",contextId,coverage:"fixture-context-coverage",reason:"fixture-record",...change};
}
before(async()=>{
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-015-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1015_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1015_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1015_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin,"20260929000000_h0_m06_access_recovery.sql");
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h1-object-015",generation:randomUUID(),
    allowedPurposes:["h1-evidence"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h1-object-015",generation:randomUUID(),
    allowedPurposes:["full-identification","core-human-access"]};
  await migration`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f1.keyId},${Buffer.from(f1.key)},${f1.audience},${f1.generation},${f1.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until)
    values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},${f2.allowedPurposes},true,
      clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`select crm_api.provision_actor_mapping(${actorId}::uuid,${subject}::uuid,${scope})`;
  runtime=connect("crm_h0_runtime");
  const access=new H0005PostgresAdapter(runtime,f1,f2);
  const first=await verifyAuth({verify:async()=>({subject,passwordVerified:true,mfaVerified:true})},randomUUID());
  sessionId=(await access.establish(first)).sessionId;
  await applyChain(migration,admin,"202609290004_h1_commercial_rules.sql",
    "20260929000000_h0_m06_access_recovery.sql");
  await migration`insert into crm_private.identity_entities(identity_id,identity_kind,admin_scope,
    source_ref,identity_verified) values(${predecessorId}::uuid,'contact',${scope},'fixture-predecessor',false)`;
  await migration.unsafe(await readFile(join(migrations,"202609300001_h1_evidence_communications.sql"),"utf8"));
  await migration.unsafe(await readFile(join(migrations,"20260930170533_h1_private_object_conservation.sql"),"utf8"));
  adapter=new H1013EvidenceAdapter(runtime,f1,f2);second=connect("crm_h0_migration");
  await adapter.apply(await auth(),write,req("document",{relation:"original",content_ref:"synthetic-private-reference",content_kind:"synthetic-binary",storage_state:"reference_only"},{targetId:predecessorId}));
  const secret=(await readFile(process.env.STORAGE_H1_CONFIG??join(storageRuntime!,".env"),"utf8")).match(/^AUTH_JWT_SECRET=(.*)$/m)?.[1];
  assert.ok(secret);
  const header=Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})).toString("base64url");
  const payload=Buffer.from(JSON.stringify({role:"service_role",iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600})).toString("base64url");
  serviceToken=`${header}.${payload}.${createHmac("sha256",secret).update(`${header}.${payload}`).digest("base64url")}`;
  bucket="synthetic-"+randomUUID();
  const created=await fetch(`${endpoint}/bucket`,{method:"POST",headers:{Authorization:`Bearer ${serviceToken}`,"Content-Type":"application/json"},body:JSON.stringify({id:bucket,name:bucket,public:false})});
  assert.equal(created.status,200);
  storage=new SupabasePrivateStorage(endpoint!,bucket,serviceToken);
  objects=new H1015ObjectAdapter(runtime,storage,f1,f2);
});
after(async()=>{
  await Promise.allSettled([runtime?.end({timeout:1}),second?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started) command("pg_ctl",["-D",join(temporaryRoot,"data"),"-m","fast","-w","stop"]);
  if(temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});

test("E01-E03: real Storage prepare/upload/accredit/link and authorized bytes",async()=>{
 const bytes=Buffer.from("synthetic original 015");const p=preparation(bytes);
 await objects.prepare(await auth(),write,p);
 assert.equal((await objects.metadata(await auth(),read,p.versionId,objectContext))?.state,"prepared");
 await assert.rejects(objects.download(await auth(),read,p.versionId,objectContext));
 await objects.upload(await auth(),read,write,p.versionId,objectContext,bytes,randomUUID());
 assert.equal((await objects.metadata(await auth(),read,p.versionId,objectContext))?.state,"present_unverified");
 await objects.reconcile(await auth(),read,write,p.versionId,objectContext,randomUUID());
 assert.equal((await objects.metadata(await auth(),read,p.versionId,objectContext))?.state,"verified_unlinked");
 await objects.link(await auth(),read,write,p.versionId,objectContext,randomUUID());
 assert.deepEqual(Buffer.from(await objects.download(await auth(),read,p.versionId,objectContext)),bytes);
 const row=(await second`select state,observed_digest,observed_size::text,observed_media from crm_private.b07_object_versions where version_id=${p.versionId}::uuid`)[0];
 assert.equal(row?.state,"stored");assert.equal(row?.observed_digest,digest(bytes));assert.equal(row?.observed_size,String(bytes.length));
 const direct=await fetch(`${endpoint}/object/authenticated/${bucket}/${p.rootId}/${p.versionId}`);
 assert.notEqual(direct.status,200);
});

test("E01/E02/E05/E06: reference absent, repair, replay and lost metadata after upload",async()=>{
 const bytes=Buffer.from("synthetic repair 015");const p=preparation(bytes);
 await objects.prepare(await auth(),write,p);
 await objects.reconcile(await auth(),read,write,p.versionId,objectContext,randomUUID());
 assert.equal((await objects.metadata(await auth(),read,p.versionId,objectContext))?.state,"missing");
 const uploadOp=randomUUID();
 await objects.upload(await auth(),read,write,p.versionId,objectContext,bytes,uploadOp);
 assert.equal((await objects.upload(await auth(),read,write,p.versionId,objectContext,bytes,uploadOp)).replayed,true);
 const repairOp=randomUUID();
 await objects.reconcile(await auth(),read,write,p.versionId,objectContext,repairOp);
 assert.equal((await objects.reconcile(await auth(),read,write,p.versionId,objectContext,repairOp)).replayed,true);
 const linkOp=randomUUID();await objects.link(await auth(),read,write,p.versionId,objectContext,linkOp);
 assert.equal((await objects.link(await auth(),read,write,p.versionId,objectContext,linkOp)).replayed,true);
 assert.equal((await second`select count(*)::int n from crm_private.b07_object_versions where root_id=${p.rootId}::uuid`)[0]?.n,1);
 await assert.rejects(objects.prepare(await auth(),write,{...p,reason:"material changed"}));
 const failed=preparation(Buffer.from("synthetic persisted outside DB"));await objects.prepare(await auth(),write,failed);
 await migration.unsafe(`create function crm_private.object_fail() returns trigger language plpgsql as $$ begin raise exception 'synthetic fault'; end $$;
 create trigger object_fail before insert on crm_private.b07_history for each row execute function crm_private.object_fail()`);
 await assert.rejects(objects.upload(await auth(),read,write,failed.versionId,objectContext,Buffer.from("synthetic persisted outside DB"),randomUUID()));
 await migration.unsafe("drop trigger object_fail on crm_private.b07_history; drop function crm_private.object_fail()");
 assert.ok(await storage.get(`${failed.rootId}/${failed.versionId}`));
 assert.equal((await objects.metadata(await auth(),read,failed.versionId,objectContext))?.state,"prepared");
 await objects.reconcile(await auth(),read,write,failed.versionId,objectContext,randomUUID());
 await objects.link(await auth(),read,write,failed.versionId,objectContext,randomUUID());
 assert.equal((await objects.metadata(await auth(),read,failed.versionId,objectContext))?.state,"stored");
});

test("E04/E07: replacement preserves original, concurrency rejects incompatible successors",async()=>{
 const a=Buffer.from("synthetic first version");const p=preparation(a);
 await objects.prepare(await auth(),write,p);await objects.upload(await auth(),read,write,p.versionId,objectContext,a,randomUUID());
 await objects.reconcile(await auth(),read,write,p.versionId,objectContext,randomUUID());await objects.link(await auth(),read,write,p.versionId,objectContext,randomUUID());
 const b=Buffer.from("synthetic replacement");const replacement=preparation(b,{rootId:p.rootId,expectedVersion:1});
 const competing={...replacement,operationId:randomUUID(),versionId:randomUUID()};
 const race=await Promise.allSettled([objects.prepare(await auth(),write,replacement),objects.prepare(await auth(),write,competing)]);
 assert.equal(race.filter(r=>r.status==="fulfilled").length,1);
 const winner=race[0]?.status==="fulfilled"?replacement:competing;
 await objects.upload(await auth(),read,write,winner.versionId,objectContext,b,randomUUID());
 await objects.reconcile(await auth(),read,write,winner.versionId,objectContext,randomUUID());await objects.link(await auth(),read,write,winner.versionId,objectContext,randomUUID());
 assert.deepEqual(Buffer.from(await objects.download(await auth(),read,p.versionId,objectContext)),a);
 const rows=await second`select version_id::text,predecessor_id::text from crm_private.b07_object_versions where root_id=${p.rootId}::uuid`;
 assert.equal(rows.length,2);assert.equal(rows.find(r=>r.version_id===winner.versionId)?.predecessor_id,p.versionId);
});

test("E08-E10: orphan diagnostic keeps real bytes, direct and wrong-context access deny",async()=>{
 const reference=`${randomUUID()}/${randomUUID()}`;const bytes=Buffer.from("synthetic orphan");
 await storage.put(reference,bytes,"application/octet-stream");const op=randomUUID();
 await objects.diagnoseOrphan(await auth(),read,write,reference,op);
 assert.equal((await objects.diagnoseOrphan(await auth(),read,write,reference,op)).replayed,true);
 assert.ok(await storage.get(reference));
 assert.equal((await second`select state from crm_private.b07_object_orphans where private_ref=${reference}`)[0]?.state,"needs_review");
 await assert.rejects(runtime.unsafe("select * from crm_private.b07_object_versions"));
 const p=preparation(Buffer.from("synthetic context"));await objects.prepare(await auth(),write,p);
 assert.equal(await objects.metadata(await auth(),read,p.versionId,{...objectContext,contextId:otherContextId}),null);
 assert.equal(await objects.metadata(await auth(),read,p.versionId,{...objectContext,purpose:"other-purpose"}),null);
});
