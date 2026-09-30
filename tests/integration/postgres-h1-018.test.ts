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
import {canonicalTask,evaluateTaskDeadline} from "../../src/domain/pending-task.ts";
import {civilReference,localDate,zoneEvidence} from "../../src/domain/civil-time.ts";
import {issueTrustedContext} from "../../src/application/trusted-context.ts";
import {createF1Issuer,encodeF1Fields} from "../../src/infrastructure/postgres/f1-codec.ts";
import {createF2Issuer} from "../../src/infrastructure/postgres/f2-codec.ts";
import {postgresF1Binding} from "../../src/infrastructure/postgres/transaction.ts";
import type {F1SigningConfiguration} from "../../src/infrastructure/postgres/f1-codec.ts";
import type {F2SigningConfiguration} from "../../src/infrastructure/postgres/f2-codec.ts";

const bin=process.env.POSTGRES_H0_BIN;
if(!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h1_018_isolated",port=Number(process.env.POSTGRES_H1018_PORT??55451);
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
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-018-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1018_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1018_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1018_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin,"20260929000000_h0_m06_access_recovery.sql");
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h1-task-018",generation:randomUUID(),
    allowedPurposes:["h1-evidence"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h1-task-018",generation:randomUUID(),
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


test("R01-R06: independent unknown, civil/instant/D020 and priority oracle",async()=>{
 for(const causeKind of ["review","document","amount","data"]) {
  const input=request();const p={...input,identity:{...input.identity,causeKind}};await tasks.apply(await auth(),write,p);
  const persisted=(await second`select state,responsible_actor::text,material,created_at from crm_private.b07_pending_tasks where task_id=${p.taskId}::uuid`)[0]!;
  assert.equal(persisted.state,"pending");assert.equal(persisted.responsible_actor,actorId);
  assert.equal(persisted.material.deadline.kind,"unknown");assert.equal(persisted.material.deadline.date,undefined);
  assert.equal(persisted.material.deadline.at,undefined);assert.equal(persisted.material.priority.kind,"pending");
  assert.deepEqual(evaluateTaskDeadline(persisted.material.deadline,{}),{known:false,overdue:false});
 }
 const base=request();
 const civil={kind:"civil" as const,date:"2028-03-26",sourceRef:"formal-calendar-source",version:"1"};
 const hourly={kind:"instant" as const,at:"2028-03-26T12:00:00+02:00",sourceRef:"formal-express-hour",version:"1"};
 const reference=civilReference({scope:"service",scopeId:"formal-service"},localDate("2028-04-02"),zoneEvidence("Europe/Madrid","formal-zone-evidence","1"),"formal-contract-date","1");
 const contractual={kind:"d020" as const,reference,daysBefore:7,sourceRef:"formal-rule",version:"D020"};
 for(const deadline of [civil,hourly,contractual]) {
  const p={...request(),material:{...base.material,deadline}};await tasks.apply(await auth(),write,p);
  assert.deepEqual((await second`select material from crm_private.b07_pending_tasks where task_id=${p.taskId}::uuid`)[0]?.material.deadline,deadline);
 }
 assert.equal(evaluateTaskDeadline(civil,{date:"2028-03-26"}).overdue,false);
 assert.equal(evaluateTaskDeadline(civil,{date:"2028-03-27"}).overdue,true);
 assert.equal(evaluateTaskDeadline(hourly,{instant:"2028-03-26T10:00:00Z"}).overdue,false);
 assert.equal(evaluateTaskDeadline(hourly,{instant:"2028-03-26T10:00:01Z"}).overdue,true);
 assert.equal(evaluateTaskDeadline(contractual,{date:"2028-03-26"}).overdue,false);
 assert.equal(evaluateTaskDeadline(contractual,{date:"2028-03-27"}).overdue,true);
 assert.equal(evaluateTaskDeadline(contractual,{date:"2028-03-26"}).evaluation?.lastAllowedDate,"2028-03-26");
 for(const invalid of [
  {...base,material:{...base.material,priority:{kind:"known",value:"high"}}},
  {...base,material:{...base.material,deadline:{kind:"unknown",reason:"unknown",date:"2028-03-26"}}},
  {...base,material:{...base.material,deadline:{kind:"civil",date:"2028-02-30",sourceRef:"formal",version:"1"}}},
  {...base,material:{...base.material,deadline:{kind:"instant",at:"2028-03-26",sourceRef:"formal",version:"1"}}},
  {...base,material:{...base.material,triggerRef:"unapproved-trigger"}},
  {...base,material:{...base.material,deadline:{kind:"civil",date:"2028-03-26",sourceRef:"formal",version:"1",time:"00:00:00"}}}]) {
  await assert.rejects(tasks.apply(await auth(),write,invalid as unknown as TaskCommand));
  assert.equal((await second`select count(*)::int n from crm_private.b07_operations where operation_id=${base.operationId}::uuid`)[0]?.n,0);
 }
 assert.throws(()=>evaluateTaskDeadline(civil,{}),/REFERENCE_UNKNOWN/);
});

test("R07-R12: independent technical replay, structured cause separation and concurrency",async()=>{
 const p=request();const pair=await Promise.all([tasks.apply(await auth(),write,p),tasks.apply(await auth(),write,{...p,operationId:randomUUID(),taskId:randomUUID()})]);
 assert.equal(pair[0].id,pair[1].id);
 const replay=await Promise.all([tasks.apply(await auth(),write,p),tasks.apply(await auth(),write,p)]);
 assert.deepEqual(replay.map(x=>x.replayed),[true,true]);
 assert.equal((await second`select count(*)::int n from crm_private.b07_history where operation_id=${p.operationId}::uuid`)[0]?.n,1);
 await assert.rejects(tasks.apply(await auth(),write,{...p,material:{...p.material,title:"different operation"}}));
 for(const identity of [
  {...p.identity,causeId:randomUUID()}, {...p.identity,contextId:otherContextId}, {...p.identity,scopeRef:"different-scope"},
  {...p.identity,relatedKind:"synthetic-entity",relatedId:randomUUID()}, {...p.identity,effect:"different-effect"}]) {
  const other={...p,taskId:randomUUID(),operationId:randomUUID(),identity};
  const result=await tasks.apply(await auth(),write,other);assert.notEqual(result.id,p.taskId);
 }
 const update={...p,action:"update" as const,operationId:randomUUID(),expectedRevision:1,
  material:{...p.material,sourceVersion:"formal-v2",deadline:{kind:"civil" as const,date:"2028-10-31",sourceRef:"formal-revised-deadline",version:"v2"}}};
 const race=await Promise.allSettled([tasks.apply(await auth(),write,update),tasks.apply(await auth(),write,{...update,operationId:randomUUID(),material:{...update.material,sourceVersion:"formal-v3"}})]);
 assert.equal(race.filter(x=>x.status==="fulfilled").length,1);assert.equal(race.filter(x=>x.status==="rejected").length,1);
 const after=(await second`select material,revision::text from crm_private.b07_pending_tasks where task_id=${p.taskId}::uuid`)[0]!;
 assert.equal(after.revision,"2");
 const history=(await second`select before_state,after_state from crm_private.b07_history where subject_id=${p.taskId}::uuid and action_kind='task_update'`)[0]!;
 assert.equal(history.before_state.material.sourceVersion,"v1");assert.equal(history.after_state.revision,2);
 await assert.rejects(tasks.apply(await auth(),write,{...update,operationId:randomUUID(),expectedRevision:1}));
 await assert.rejects(tasks.apply(await auth(),write,{...update,operationId:randomUUID(),expectedRevision:2,identity:{...p.identity,contextId:otherContextId}}));
 assert.deepEqual((await second`select material from crm_private.b07_pending_tasks where task_id=${p.taskId}::uuid`)[0]?.material,after.material);
});

test("R13/R14: independent fault create/update rollback and no motivating-fact inference",async()=>{
 const baseline=(await second`select jsonb_agg(to_jsonb(r) order by record_id) data from crm_private.b07_records r`)[0]?.data;
 const p=request();await tasks.apply(await auth(),write,p);
 await migration.unsafe(`create function crm_private.formal_task_fault() returns trigger language plpgsql as $$ begin raise exception 'formal task history fault'; end $$;
 create trigger formal_task_fault before insert on crm_private.b07_history for each row execute function crm_private.formal_task_fault()`);
 const creation=request();const update={...p,action:"update" as const,expectedRevision:1,operationId:randomUUID(),material:{...p.material,sourceVersion:"v2"}};
 for(const input of [creation,update]) {
  await assert.rejects(tasks.apply(await auth(),write,input));
  assert.equal((await second`select count(*)::int n from crm_private.b07_operations where operation_id=${input.operationId}::uuid`)[0]?.n,0);
  assert.equal((await second`select count(*)::int n from crm_private.b07_history where operation_id=${input.operationId}::uuid`)[0]?.n,0);
 }
 assert.equal((await second`select count(*)::int n from crm_private.b07_pending_tasks where task_id=${creation.taskId}::uuid`)[0]?.n,0);
 assert.equal((await second`select revision::text from crm_private.b07_pending_tasks where task_id=${p.taskId}::uuid`)[0]?.revision,"1");
 await migration.unsafe("drop trigger formal_task_fault on crm_private.b07_history; drop function crm_private.formal_task_fault()");
 await tasks.apply(await auth(),write,update);
 for(const causeKind of ["advance","provider","document","availability"]) {
  const item=request();await tasks.apply(await auth(),write,{...item,identity:{...item.identity,causeKind}});
 }
 assert.deepEqual((await second`select jsonb_agg(to_jsonb(r) order by record_id) data from crm_private.b07_records r`)[0]?.data,baseline);
 assert.equal((await second`select count(*)::int n from crm_ha.proposals`)[0]?.n,0);
});

test("R15-R17: scope/context/purpose, stale authority and forced RLS",async()=>{
 const p=request();await tasks.apply(await auth(),write,p);
 assert.equal(await tasks.read(await auth(),read,p.taskId,"other",otherContextId),null);
 await assert.rejects(tasks.read(await auth(),read,p.taskId,"other",contextId,"false-purpose"));
 await assert.rejects(runtime.unsafe("select * from crm_private.b07_pending_tasks"));
 await assert.rejects(runtime.unsafe("set role crm_h0_f2_executor"));
 const table=(await second`select relrowsecurity,relforcerowsecurity,pg_get_userbyid(relowner) owner from pg_class where oid='crm_private.b07_pending_tasks'::regclass`)[0]!;
 assert.equal(table.owner,"crm_h0_f2_owner");assert.equal(table.relrowsecurity,true);assert.equal(table.relforcerowsecurity,true);
 assert.equal((await second`select count(*)::int n from information_schema.role_table_grants where table_schema='crm_private' and table_name='b07_pending_tasks' and grantee in ('PUBLIC','anon','authenticated','crm_h0_runtime')`)[0]?.n,0);
 for(const role of ["anon","authenticated"]) {
  assert.equal((await second`select has_function_privilege(${role},'crm_api.b07_task_apply(bytea,bytea,bytea,bytea,bytea)','execute') allowed`)[0]?.allowed,false);
 }
 assert.equal((await second`select count(*)::int n from pg_proc p join pg_namespace n on p.pronamespace=n.oid where n.nspname='crm_api' and p.proname in ('b07_task_apply','b07_task_read')`)[0]?.n,2);
 const current=await auth();
 for(const forgedScope of [true,false]) {
  await assert.rejects(runtime.begin(async tx=>{
   const row=(await tx`select actor_id::text,access_generation::text,epoch_id::text from crm_api.f2_lookup(${subject}::uuid,${sessionId}::uuid)`)[0]!;
   const binding=await postgresF1Binding(tx);const chosen=forgedScope?"formal-false-scope":scope;
   const q=encodeF1Fields(["CRM-H1-TASK-READ1",canonicalTask({taskId:p.taskId,contextKind:"other",contextId,purpose:"pending-followup"})]);
   const human=createF2Issuer(f2)(current,{actorId:row.actor_id,scope:chosen,sessionId,epochId:row.epoch_id,accessGeneration:row.access_generation},binding,"evidence_read",q,read);
   const technical=createF1Issuer(f1)(issueTrustedContext({identityId:"formal-task-server",identityKind:"technical",purpose:"h1-evidence",scope:chosen,requestId:randomUUID(),serverTime:new Date().toISOString()}),binding,"C01",q,{resource:"evidence",action:"read_evidence"});
   await tx.unsafe("select crm_api.b07_task_read($1,$2,$3,$4,$5)",[human.payload,human.mac,technical.payload,forgedScope?technical.mac:Buffer.alloc(32),q]);
  }));
 }
 const old=await auth();const access=new H0005PostgresAdapter(runtime,f1,f2);await access.revokeAll(old);
 await assert.rejects(tasks.read(old,read,p.taskId,"other",contextId));
 const rejected=request();await assert.rejects(tasks.apply(old,write,rejected));
 assert.equal((await second`select count(*)::int n from crm_private.b07_pending_tasks where task_id=${rejected.taskId}::uuid`)[0]?.n,0);
 const fresh=await verifyAuth({verify:async()=>({subject,passwordVerified:true,mfaVerified:true})},randomUUID());
 sessionId=(await access.establish(fresh)).sessionId;
 assert.equal((await tasks.read(await auth(),read,p.taskId,"other",contextId))?.task_id,p.taskId);
 await assert.rejects(tasks.read(old,read,p.taskId,"other",contextId));
});

test("R18: predecessor upgrade retains records, DDL rollback/reapply and unique cause backstop",async()=>{
 const upgrade="crm_h1018_upgrade";await admin.unsafe(`create database ${upgrade} owner crm_h0_migration`);
 const um=connect("crm_h0_migration",upgrade),ua=connect("h1018_bootstrap",upgrade);
 try {
  await applyChain(um,ua,"20260930170533_h1_private_object_conservation.sql");
  await um`select crm_api.provision_actor_mapping(${actorId}::uuid,${subject}::uuid,${scope})`;
  await um`insert into crm_private.identity_entities(identity_id,identity_kind,admin_scope,source_ref,identity_verified)
   values(${predecessorId}::uuid,'contact',${scope},'formal-old-fixture',false)`;
  const sql=await readFile(join(migrations,"20260930185257_h1_pending_business_tasks.sql"),"utf8");
  await assert.rejects(um.unsafe(sql.replace("commit;","do $$ begin raise exception 'formal migration fault'; end $$; commit;")));
  await um.unsafe("rollback");assert.equal((await um`select to_regclass('crm_private.b07_pending_tasks') name`)[0]?.name,null);
  await um.unsafe(sql);
  assert.equal((await um`select count(*)::int n from crm_private.identity_entities where identity_id=${predecessorId}::uuid`)[0]?.n,1);
  assert.ok((await um`select indexname from pg_indexes where schemaname='crm_private' and tablename='b07_pending_tasks'`).length>=3);
 } finally {await um.end();await ua.end();}
});
