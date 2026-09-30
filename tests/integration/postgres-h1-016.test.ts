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
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "../../src/infrastructure/postgres/f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "../../src/infrastructure/postgres/f2-codec.ts";
import {issueTrustedContext} from "../../src/application/trusted-context.ts";
import {postgresF1Binding} from "../../src/infrastructure/postgres/transaction.ts";

const bin=process.env.POSTGRES_H0_BIN;
if(!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h1_016_isolated",port=Number(process.env.POSTGRES_H1016_PORT??55449);
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
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-016-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1016_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1016_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1016_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin,"20260929000000_h0_m06_access_recovery.sql");
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h1-object-016",generation:randomUUID(),
    allowedPurposes:["h1-evidence"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h1-object-016",generation:randomUUID(),
    allowedPurposes:["full-identification","core-human-access","session-revocation"]};
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

test("R01-R04/R08: independent conservation oracle and durable replay",async()=>{
 const bytes=Buffer.from("formal original bytes");const p=preparation(bytes);
 await objects.prepare(await auth(),write,p);
 assert.equal((await second`select state from crm_private.b07_object_versions where version_id=${p.versionId}::uuid`)[0]?.state,"prepared");
 assert.equal(await storage.get(`${p.rootId}/${p.versionId}`),null);
 await objects.reconcile(await auth(),read,write,p.versionId,objectContext,randomUUID());
 assert.equal((await second`select state from crm_private.b07_object_versions where version_id=${p.versionId}::uuid`)[0]?.state,"missing");
 const upload=randomUUID();await objects.upload(await auth(),read,write,p.versionId,objectContext,bytes,upload);
 assert.equal((await second`select state from crm_private.b07_object_versions where version_id=${p.versionId}::uuid`)[0]?.state,"present_unverified");
 await assert.rejects(objects.link(await auth(),read,write,p.versionId,objectContext,randomUUID()));
 const repair=randomUUID();await objects.reconcile(await auth(),read,write,p.versionId,objectContext,repair);
 const row=(await second`select state,observed_digest,observed_size::text from crm_private.b07_object_versions where version_id=${p.versionId}::uuid`)[0];
 assert.equal(row?.state,"verified_unlinked");assert.equal(row?.observed_digest,digest(bytes));assert.equal(row?.observed_size,String(bytes.length));
 const link=randomUUID();await objects.link(await auth(),read,write,p.versionId,objectContext,link);
 assert.deepEqual(Buffer.from(await objects.download(await auth(),read,p.versionId,objectContext)),bytes);
 assert.equal((await objects.link(await auth(),read,write,p.versionId,objectContext,link)).replayed,true);
 assert.equal((await objects.prepare(await auth(),write,p)).replayed,true);
 await assert.rejects(objects.prepare(await auth(),write,{...p,digest:digest(Buffer.from("different"))}));
 assert.equal((await second`select count(*)::int n from crm_private.b07_object_versions where root_id=${p.rootId}::uuid`)[0]?.n,1);
});

test("R05: real same-path corruption and media mismatch are not conserved",async()=>{
 const bytes=Buffer.from("formal integrality");const p=preparation(bytes);
 await objects.prepare(await auth(),write,p);await objects.upload(await auth(),read,write,p.versionId,objectContext,bytes,randomUUID());
 await objects.reconcile(await auth(),read,write,p.versionId,objectContext,randomUUID());await objects.link(await auth(),read,write,p.versionId,objectContext,randomUUID());
 for(const corrupted of [Buffer.from("short"),Buffer.from("FORMAL INTEGRALITY")]) {
  const changed:Response=await fetch(`${endpoint}/object/${bucket}/${p.rootId}/${p.versionId}`,{method:"POST",
   headers:{Authorization:`Bearer ${serviceToken}`,"Content-Type":"application/octet-stream","x-upsert":"true"},body:corrupted});
  assert.equal(changed.status,200);
  await assert.rejects(objects.download(await auth(),read,p.versionId,objectContext));
  await objects.reconcile(await auth(),read,write,p.versionId,objectContext,randomUUID());
  assert.equal((await second`select state from crm_private.b07_object_versions where version_id=${p.versionId}::uuid`)[0]?.state,"inconsistent");
 }
 const changedMedia=await fetch(`${endpoint}/object/${bucket}/${p.rootId}/${p.versionId}`,{method:"POST",
  headers:{Authorization:`Bearer ${serviceToken}`,"Content-Type":"text/plain","x-upsert":"true"},body:bytes});
 assert.equal(changedMedia.status,200);await objects.reconcile(await auth(),read,write,p.versionId,objectContext,randomUUID());
 assert.equal((await second`select state from crm_private.b07_object_versions where version_id=${p.versionId}::uuid`)[0]?.state,"inconsistent");
 const missing=preparation(Buffer.from("formal disappear before link"));await objects.prepare(await auth(),write,missing);
 await objects.upload(await auth(),read,write,missing.versionId,objectContext,Buffer.from("formal disappear before link"),randomUUID());
 await objects.reconcile(await auth(),read,write,missing.versionId,objectContext,randomUUID());
 const removed=await fetch(`${endpoint}/object/${bucket}`,{method:"DELETE",headers:{Authorization:`Bearer ${serviceToken}`,"Content-Type":"application/json"},
  body:JSON.stringify({prefixes:[`${missing.rootId}/${missing.versionId}`]})});
 assert.equal(removed.status,200);
 const linkId=randomUUID();await assert.rejects(objects.link(await auth(),read,write,missing.versionId,objectContext,linkId));
 assert.equal((await second`select linked_at from crm_private.b07_object_versions where version_id=${missing.versionId}::uuid`)[0]?.linked_at,null);
 assert.equal((await second`select count(*)::int n from crm_private.b07_operations where operation_id=${linkId}::uuid`)[0]?.n,0);
 await objects.reconcile(await auth(),read,write,missing.versionId,objectContext,randomUUID());
 assert.equal((await second`select state from crm_private.b07_object_versions where version_id=${missing.versionId}::uuid`)[0]?.state,"missing");
});

test("R10/R11/R13: independently signed foreign scope and generic JWT cannot access",async()=>{
 const scopedBytes=Buffer.from("formal scoped object");const p=preparation(scopedBytes);await objects.prepare(await auth(),write,p);
 await objects.upload(await auth(),read,write,p.versionId,objectContext,scopedBytes,randomUUID());
 assert.equal((await fetch(`${endpoint}/object/authenticated/${bucket}/${p.rootId}/${p.versionId}`,{headers:{Authorization:`Bearer ${serviceToken}`}})).status,200);
 const current=await auth();
 await assert.rejects(runtime.begin(async tx=>{
  const row=(await tx`select actor_id::text,access_generation::text,epoch_id::text from crm_api.f2_lookup(${subject}::uuid,${sessionId}::uuid)`)[0]!;
  const binding=await postgresF1Binding(tx);
  const q=encodeF1Fields(["CRM-H1-OBJECT-READ1",JSON.stringify({...objectContext,versionId:p.versionId})]);
  const foreignScope="synthetic-foreign-scope";
  const human=createF2Issuer(f2)(current,{actorId:row.actor_id,accessGeneration:row.access_generation,
   epochId:row.epoch_id,sessionId,scope:foreignScope},binding,"evidence_read",q,read);
  const technical=createF1Issuer(f1)(issueTrustedContext({identityId:"formal-foreign",identityKind:"technical",
   purpose:"h1-evidence",scope:foreignScope,requestId:randomUUID(),serverTime:new Date().toISOString()}),binding,"C01",q,
   {resource:"evidence",action:"read_evidence"});
  await tx.unsafe("select crm_api.b07_object_read($1,$2,$3,$4,$5)",[human.payload,human.mac,technical.payload,technical.mac,q]);
 }));
 const secret=(await readFile(process.env.STORAGE_H1_CONFIG??join(storageRuntime!,".env"),"utf8")).match(/^AUTH_JWT_SECRET=(.*)$/m)![1]!;
 for(const role of ["anon","authenticated"]) {
  const h=Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})).toString("base64url");
  const body=Buffer.from(JSON.stringify({role,sub:randomUUID(),exp:Math.floor(Date.now()/1000)+60})).toString("base64url");
  const token=`${h}.${body}.${createHmac("sha256",secret).update(`${h}.${body}`).digest("base64url")}`;
  assert.notEqual((await fetch(`${endpoint}/object/authenticated/${bucket}/${p.rootId}/${p.versionId}`,{headers:{Authorization:`Bearer ${token}`}})).status,200);
 }
});

test("R06/R07/R15/R17: real upload survives internal rollback and repair/orphan retains bytes",async()=>{
 const bytes=Buffer.from("formal storage survives rollback");const p=preparation(bytes);await objects.prepare(await auth(),write,p);
 await migration.unsafe(`create function crm_private.formal_object_fault() returns trigger language plpgsql as $$ begin raise exception 'formal history fault'; end $$;
 create trigger formal_object_fault before insert on crm_private.b07_history for each row execute function crm_private.formal_object_fault()`);
 const failedOp=randomUUID();await assert.rejects(objects.upload(await auth(),read,write,p.versionId,objectContext,bytes,failedOp));
 await migration.unsafe("drop trigger formal_object_fault on crm_private.b07_history; drop function crm_private.formal_object_fault()");
 assert.deepEqual(Buffer.from((await storage.get(`${p.rootId}/${p.versionId}`))!.bytes),bytes);
 assert.equal((await second`select state from crm_private.b07_object_versions where version_id=${p.versionId}::uuid`)[0]?.state,"prepared");
 assert.equal((await second`select count(*)::int n from crm_private.b07_operations where operation_id=${failedOp}::uuid`)[0]?.n,0);
 await objects.reconcile(await auth(),read,write,p.versionId,objectContext,randomUUID());
 await migration.unsafe(`create function crm_private.formal_link_fault() returns trigger language plpgsql as $$ begin raise exception 'formal link fault'; end $$;
 create trigger formal_link_fault before insert on crm_private.b07_history for each row execute function crm_private.formal_link_fault()`);
 const linkRetry=randomUUID();await assert.rejects(objects.link(await auth(),read,write,p.versionId,objectContext,linkRetry));
 await migration.unsafe("drop trigger formal_link_fault on crm_private.b07_history; drop function crm_private.formal_link_fault()");
 assert.equal((await second`select state from crm_private.b07_object_versions where version_id=${p.versionId}::uuid`)[0]?.state,"verified_unlinked");
 assert.equal((await second`select count(*)::int n from crm_private.b07_operations where operation_id=${linkRetry}::uuid`)[0]?.n,0);
 await objects.link(await auth(),read,write,p.versionId,objectContext,linkRetry);
 const orphan=`${randomUUID()}/${randomUUID()}`;await storage.put(orphan,Buffer.from("formal unknown orphan"),"application/octet-stream");
 const diagnosis=randomUUID();await objects.diagnoseOrphan(await auth(),read,write,orphan,diagnosis);
 assert.equal((await objects.diagnoseOrphan(await auth(),read,write,orphan,diagnosis)).replayed,true);
 const diagnostic=(await second`select state from crm_private.b07_object_orphans where private_ref=${orphan}`)[0];
 assert.equal(diagnostic?.state,"needs_review");assert.ok(await storage.get(orphan));
 assert.ok((await storage.inventory(orphan.split("/")[0]!)).includes(orphan));
});

test("R09/R10/R16: all five concurrency surfaces and retained original",async()=>{
 const bytes=Buffer.from("formal concurrent original");const p=preparation(bytes);
 const prepRace=await Promise.all([objects.prepare(await auth(),write,p),objects.prepare(await auth(),write,p)]);
 assert.deepEqual(prepRace.map(x=>x.replayed).sort(),[false,true]);
 await objects.upload(await auth(),read,write,p.versionId,objectContext,bytes,randomUUID());
 const observe=randomUUID();const observeRace=await Promise.all([objects.reconcile(await auth(),read,write,p.versionId,objectContext,observe),objects.reconcile(await auth(),read,write,p.versionId,objectContext,observe)]);
 assert.deepEqual(observeRace.map(x=>x.replayed).sort(),[false,true]);
 const link=randomUUID();const linkRace=await Promise.all([objects.link(await auth(),read,write,p.versionId,objectContext,link),objects.link(await auth(),read,write,p.versionId,objectContext,link)]);
 assert.deepEqual(linkRace.map(x=>x.replayed).sort(),[false,true]);
 const evidence=req("evidence",{claim:"formal original version supports this fact",coverage:"formal-case",certainty:"reviewed",source_kind:"document",document_id:predecessorId});
 await adapter.apply(await auth(),write,evidence);
 await objects.link(await auth(),read,write,p.versionId,objectContext,randomUUID(),evidence.targetId);
 const repair=randomUUID();await Promise.all([objects.reconcile(await auth(),read,write,p.versionId,objectContext,repair),objects.reconcile(await auth(),read,write,p.versionId,objectContext,repair)]);
 const replacementBytes=Buffer.from("formal next original");const a=preparation(replacementBytes,{rootId:p.rootId,expectedVersion:1});
 const b={...a,operationId:randomUUID(),versionId:randomUUID()};
 const replacementRace=await Promise.allSettled([objects.prepare(await auth(),write,a),objects.prepare(await auth(),write,b)]);
 assert.equal(replacementRace.filter(x=>x.status==="fulfilled").length,1);
 const winner=replacementRace[0]?.status==="fulfilled"?a:b;
 await objects.upload(await auth(),read,write,winner.versionId,objectContext,replacementBytes,randomUUID());
 await objects.reconcile(await auth(),read,write,winner.versionId,objectContext,randomUUID());await objects.link(await auth(),read,write,winner.versionId,objectContext,randomUUID());
 await assert.rejects(objects.link(await auth(),read,write,winner.versionId,objectContext,randomUUID(),evidence.targetId));
 assert.equal((await second`select version_id::text from crm_private.b07_evidence_object_bindings where evidence_id=${evidence.targetId}::uuid`)[0]?.version_id,p.versionId);
 assert.deepEqual(Buffer.from(await objects.download(await auth(),read,p.versionId,objectContext)),bytes);
 assert.equal((await second`select count(*)::int n from crm_private.b07_object_versions where root_id=${p.rootId}::uuid`)[0]?.n,2);
 await adapter.apply(await auth(),write,req("document",{},{action:"link",kind:undefined,material:undefined,occurredAt:undefined,originalId:predecessorId,contextId:otherContextId}));
 assert.deepEqual(Buffer.from(await objects.download(await auth(),read,p.versionId,{...objectContext,contextId:otherContextId})),bytes);
 assert.equal(await objects.metadata(await auth(),read,p.versionId,{...objectContext,contextId:randomUUID()}),null);
 assert.equal(await objects.metadata(await auth(),read,p.versionId,{...objectContext,purpose:"not-authorized-purpose"}),null);
});

test("R11-R14: actual signed URL remains technically valid; Core access is reauthorized",async()=>{
 const bytes=Buffer.from("formal private access");const p=preparation(bytes);await objects.prepare(await auth(),write,p);
 await objects.upload(await auth(),read,write,p.versionId,objectContext,bytes,randomUUID());await objects.reconcile(await auth(),read,write,p.versionId,objectContext,randomUUID());await objects.link(await auth(),read,write,p.versionId,objectContext,randomUUID());
 const path=`${bucket}/${p.rootId}/${p.versionId}`;
 for(const route of [`/object/authenticated/${path}`,`/object/public/${path}`,`/object/sign/${path}`]) {
  assert.notEqual((await fetch(`${endpoint}${route}`)).status,200);
 }
 const issued=await fetch(`${endpoint}/object/sign/${path}`,{method:"POST",
  headers:{Authorization:`Bearer ${serviceToken}`,"Content-Type":"application/json"},body:JSON.stringify({expiresIn:3})});
 assert.equal(issued.status,200);
 const signed=(await issued.json() as {signedURL:string}).signedURL;
 assert.equal((await fetch(`${endpoint}${signed}`)).status,200);
 const oldAuth=await auth();const access=new H0005PostgresAdapter(runtime,f1,f2);
 await access.revokeAll(oldAuth);
 await assert.rejects(objects.download(oldAuth,read,p.versionId,objectContext));
 await assert.rejects(objects.prepare(oldAuth,write,preparation(bytes)));
 assert.equal((await fetch(`${endpoint}${signed}`)).status,200);
 await new Promise(resolve=>setTimeout(resolve,3500));
 assert.notEqual((await fetch(`${endpoint}${signed}`)).status,200);
 const fresh=await verifyAuth({verify:async()=>({subject,passwordVerified:true,mfaVerified:true})},randomUUID());
 sessionId=(await access.establish(fresh)).sessionId;
 const realStorage=storage;const during=new H1015ObjectAdapter(runtime,{
  put:(...args)=>realStorage.put(...args),inventory:(prefix)=>realStorage.inventory(prefix),
  get:async(reference)=>{const object=await realStorage.get(reference);await access.revokeOne(await auth());return object;}
 },f1,f2);
 await assert.rejects(during.download(await auth(),read,p.versionId,objectContext));
 sessionId=(await access.establish(fresh)).sessionId;
 assert.deepEqual(Buffer.from(await objects.download(await auth(),read,p.versionId,objectContext)),bytes);
 const persisted=await second`select private_ref from crm_private.b07_object_versions where version_id=${p.versionId}::uuid`;
 assert.equal(persisted[0]?.private_ref,`${p.rootId}/${p.versionId}`);
});

test("R18/R19: forced RLS, narrow grants and migration rollback/reapply",async()=>{
 await assert.rejects(runtime.unsafe("select * from crm_private.b07_object_versions"));
 await assert.rejects(runtime.unsafe("set role crm_h0_f2_executor"));
 const rows=await second`select c.relname,c.relrowsecurity,c.relforcerowsecurity,pg_get_userbyid(c.relowner) owner
  from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='crm_private' and c.relname in ('b07_object_versions','b07_object_orphans','b07_evidence_object_bindings')`;
 assert.equal(rows.length,3);for(const row of rows){assert.equal(row.relrowsecurity,true);assert.equal(row.relforcerowsecurity,true);assert.equal(row.owner,"crm_h0_f2_owner");}
 assert.equal((await second`select count(*)::int n from information_schema.role_table_grants where table_schema='crm_private'
  and table_name in ('b07_object_versions','b07_object_orphans','b07_evidence_object_bindings') and grantee in ('PUBLIC','anon','authenticated','crm_h0_runtime')`)[0]?.n,0);
 const upgrade="crm_h1016_upgrade";await admin.unsafe(`create database ${upgrade} owner crm_h0_migration`);
 const upgradeMigration=connect("crm_h0_migration",upgrade),upgradeAdmin=connect("h1016_bootstrap",upgrade);
 try {
  await applyChain(upgradeMigration,upgradeAdmin,"202609300001_h1_evidence_communications.sql");
  await upgradeMigration`select crm_api.provision_actor_mapping(${actorId}::uuid,${subject}::uuid,${scope})`;
  await upgradeMigration`insert into crm_private.identity_entities(identity_id,identity_kind,admin_scope,source_ref,identity_verified)
   values(${predecessorId}::uuid,'contact',${scope},'synthetic-old-fixture',false)`;
  const sql=await readFile(join(migrations,"20260930170533_h1_private_object_conservation.sql"),"utf8");
  await assert.rejects(upgradeMigration.unsafe(sql.replace("commit;","do $$ begin raise exception 'synthetic migration fault'; end $$; commit;")));
  await upgradeMigration.unsafe("rollback");
  assert.equal((await upgradeMigration`select to_regclass('crm_private.b07_object_versions') name`)[0]?.name,null);
  await upgradeMigration.unsafe(sql);
  assert.equal((await upgradeMigration`select count(*)::int n from crm_private.identity_entities where identity_id=${predecessorId}::uuid`)[0]?.n,1);
 } finally {await upgradeMigration.end();await upgradeAdmin.end();}
});
