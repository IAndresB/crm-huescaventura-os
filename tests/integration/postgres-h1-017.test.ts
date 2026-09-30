import assert from "node:assert/strict";
import {randomBytes,randomUUID} from "node:crypto";
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
import {H1017TaskAdapter,type TaskCommand} from "../../src/infrastructure/postgres/h1-task-adapter.ts";
import {evaluateTaskDeadline} from "../../src/domain/pending-task.ts";
import {civilReference,localDate,zoneEvidence} from "../../src/domain/civil-time.ts";
import type {F1SigningConfiguration} from "../../src/infrastructure/postgres/f1-codec.ts";
import type {F2SigningConfiguration} from "../../src/infrastructure/postgres/f2-codec.ts";

const bin=process.env.POSTGRES_H0_BIN;
if(!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h1_017_isolated",port=Number(process.env.POSTGRES_H1017_PORT??55450);
const subject=randomUUID(),actorId=randomUUID(),scope="h1-b07-synthetic-scope";
const contextId=randomUUID(),otherContextId=randomUUID(),predecessorId=randomUUID();
let temporaryRoot="",socket="",started=false,sessionId="";
let admin:postgres.Sql,migration:postgres.Sql,runtime:postgres.Sql,second:postgres.Sql;
let tasks:H1017TaskAdapter;
function request(change:Partial<TaskCommand>={}):TaskCommand {
 return {action:"receive",operationId:randomUUID(),taskId:randomUUID(),expectedRevision:0,
  identity:{causeKind:"review",causeId:randomUUID(),contextKind:"other",contextId,scopeRef:"synthetic-part-one",
   relatedKind:null,relatedId:null,effect:"review-only"},
  material:{title:"synthetic pending work",deadline:{kind:"unknown",reason:"reference not verified"},
   priority:{kind:"pending",reason:"priority not determined"},sourceRef:"synthetic-origin",sourceVersion:"v1",
   triggerRef:"manual",triggerVersion:"SM-TA-01-v1"},reason:"synthetic need",...change};
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
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-017-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1017_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1017_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1017_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin,"20260929000000_h0_m06_access_recovery.sql");
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h1-task-017",generation:randomUUID(),
    allowedPurposes:["h1-evidence"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h1-task-017",generation:randomUUID(),
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
  await migration.unsafe(await readFile(join(migrations,"20260930185257_h1_pending_business_tasks.sql"),"utf8"));
  tasks=new H1017TaskAdapter(runtime,f1,f2);
});
after(async()=>{
  await Promise.allSettled([runtime?.end({timeout:1}),second?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started) command("pg_ctl",["-D",join(temporaryRoot,"data"),"-m","fast","-w","stop"]);
  if(temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});


test("E01/E02/E03/E08: business needs preserve unknowns and never prove the motivating fact",async()=>{
 const before=(await second`select count(*)::int n from crm_private.b07_records`)[0]?.n;
 for(const causeKind of ["review","document","amount","data","provider","availability","advance","balance","invoice","suplido","block","participants_list","modification","cancellation","proposal","final_participants"]) {
  const p=request();const input={...p,identity:{...p.identity,causeKind},material:{...p.material,triggerRef:["review","amount","data"].includes(causeKind)?"manual" as const:"BR-TASK-005" as const}};
  const result=await tasks.apply(await auth(),write,input);const row=await tasks.read(await auth(),read,result.id,"other",contextId);
  assert.equal(row?.state,"pending");assert.equal(row?.responsible_actor,actorId);
  assert.deepEqual(row?.material.deadline,{kind:"unknown",reason:"reference not verified"});
  assert.deepEqual(evaluateTaskDeadline(row!.material.deadline,{}),{known:false,overdue:false});
  assert.equal(row?.material.priority.kind,"pending");
 }
 assert.equal((await second`select count(*)::int n from crm_private.b07_records`)[0]?.n,before);
});

test("E04: civil and exact instant deadlines preserve sources; D020 grants a complete day",async()=>{
 const p=request();const reference=civilReference({scope:"service",scopeId:"synthetic-service"},localDate("2026-10-20"),zoneEvidence("Europe/Madrid","synthetic-zone","v1"),"synthetic-service-source","v1");
 for(const deadline of [
  {kind:"civil" as const,date:"2026-10-13",sourceRef:"synthetic-manual-date",version:"v1"},
  {kind:"instant" as const,at:"2026-10-13T12:30:00+02:00",sourceRef:"synthetic-express-instant",version:"v1"},
  {kind:"d020" as const,reference,daysBefore:7,sourceRef:"D020-synthetic-reference",version:"v1"}]) {
  const input={...request(),material:{...p.material,deadline}};await tasks.apply(await auth(),write,input);
  const row=await tasks.read(await auth(),read,input.taskId,"other",contextId);assert.deepEqual(row?.material.deadline,deadline);
  if(deadline.kind!=="instant") {
   assert.equal(evaluateTaskDeadline(deadline,{date:"2026-10-13"}).overdue,false);
   assert.equal(evaluateTaskDeadline(deadline,{date:"2026-10-14"}).overdue,true);
  } else assert.equal(evaluateTaskDeadline(deadline,{instant:"2026-10-13T10:30:00Z"}).overdue,false);
 }
});

test("E05-E07/E09: functional dedup differs from replay, revision and separate causes",async()=>{
 const p=request();const first=await tasks.apply(await auth(),write,p);
 const repeated=await tasks.apply(await auth(),write,{...p,operationId:randomUUID(),taskId:randomUUID()});assert.equal(repeated.id,first.id);
 assert.equal(Number((await tasks.read(await auth(),read,p.taskId,"other",contextId))?.revision),1);
 assert.equal((await tasks.apply(await auth(),write,p)).replayed,true);
 await assert.rejects(tasks.apply(await auth(),write,{...p,reason:"changed operation material"}));
 const update={...p,action:"update" as const,operationId:randomUUID(),expectedRevision:1,material:{...p.material,title:"revised pending work",sourceVersion:"v2"}};
 const race=await Promise.allSettled([tasks.apply(await auth(),write,update),tasks.apply(await auth(),write,{...update,operationId:randomUUID(),material:{...update.material,title:"competing update"}})]);
 assert.equal(race.filter(x=>x.status==="fulfilled").length,1);
 assert.equal(Number((await tasks.read(await auth(),read,p.taskId,"other",contextId))?.revision),2);
 const other={...p,taskId:randomUUID(),operationId:randomUUID(),identity:{...p.identity,causeId:randomUUID()}};
 await tasks.apply(await auth(),write,other);assert.notEqual(other.taskId,p.taskId);
 await assert.rejects(tasks.apply(await auth(),write,{...update,operationId:randomUUID(),identity:other.identity}));
});

test("E09/E10/E11: concurrent receipts, history rollback, context and runtime",async()=>{
 const p=request();const race=await Promise.all([tasks.apply(await auth(),write,p),tasks.apply(await auth(),write,{...p,operationId:randomUUID(),taskId:randomUUID()})]);
 assert.equal(race[0].id,race[1].id);
 await migration.unsafe(`create function crm_private.task_fault() returns trigger language plpgsql as $$ begin raise exception 'synthetic history fault'; end $$;
 create trigger task_fault before insert on crm_private.b07_history for each row execute function crm_private.task_fault()`);
 const failed=request();await assert.rejects(tasks.apply(await auth(),write,failed));
 await migration.unsafe("drop trigger task_fault on crm_private.b07_history; drop function crm_private.task_fault()");
 assert.equal((await second`select count(*)::int n from crm_private.b07_pending_tasks where task_id=${failed.taskId}::uuid`)[0]?.n,0);
 assert.equal((await second`select count(*)::int n from crm_private.b07_operations where operation_id=${failed.operationId}::uuid`)[0]?.n,0);
 assert.equal(await tasks.read(await auth(),read,p.taskId,"other",otherContextId),null);
 await assert.rejects(tasks.read(await auth(),read,p.taskId,"other",contextId,"different-purpose"));
 await assert.rejects(runtime.unsafe("select * from crm_private.b07_pending_tasks"));
});
