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
import type {F1SigningConfiguration} from "../../src/infrastructure/postgres/f1-codec.ts";
import type {F2SigningConfiguration} from "../../src/infrastructure/postgres/f2-codec.ts";

const bin=process.env.POSTGRES_H0_BIN;
if(!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
const root=resolve(import.meta.dirname,"../..");
const migrations=join(root,"supabase/migrations");
const database="crm_h1_014_formal",port=Number(process.env.POSTGRES_H1014_PORT??55444);
const subject=randomUUID(),actorId=randomUUID(),scope="h1-b07-synthetic-scope";
const contextId=randomUUID(),otherContextId=randomUUID(),predecessorId=randomUUID();
let temporaryRoot="",socket="",started=false,sessionId="";
let admin:postgres.Sql,migration:postgres.Sql,runtime:postgres.Sql,second:postgres.Sql;
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
    contextKind:"other",contextId,coverage:"synthetic-context-coverage",reason:"fixture-record",...change};
}
before(async()=>{
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-014-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1014_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1014_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1014_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin,"20260929000000_h0_m06_access_recovery.sql");
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h1-b07-formal",generation:randomUUID(),
    allowedPurposes:["h1-evidence"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h1-b07-formal",generation:randomUUID(),
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
  adapter=new H1013EvidenceAdapter(runtime,f1,f2);second=connect("crm_h0_migration");
});
after(async()=>{
  await Promise.allSettled([runtime?.end({timeout:1}),second?.end({timeout:1}),migration?.end({timeout:1}),admin?.end({timeout:1})]);
  if(started) command("pg_ctl",["-D",join(temporaryRoot,"data"),"-m","fast","-w","stop"]);
  if(temporaryRoot.startsWith(tmpdir())) await rm(temporaryRoot,{recursive:true,force:true});
});

test("R01-R04/R09: original, two links, late manual fact, incoming and no business inference",async()=>{
  const original=req("document",{relation:"original",content_ref:"synthetic-original",
    content_kind:"synthetic-transcript",storage_state:"reference_only"});
  await adapter.apply(await auth(),write,original);
  const derived=req("document",{relation:"derived",content_ref:"synthetic-summary",
    content_kind:"synthetic-summary",storage_state:"reference_only",review_ref:"synthetic-review"},
    {originalId:original.targetId});
  await adapter.apply(await auth(),write,derived);
  const extra=req("document",{},{action:"link",kind:undefined,material:undefined,
    occurredAt:undefined,originalId:original.targetId,contextId:otherContextId,
    coverage:"synthetic-second-context"});
  await adapter.apply(await auth(),write,extra);
  const call=req("evidence",{claim:"manual call mentioned a tentative date",coverage:"synthetic-service",
    certainty:"candidate",source_kind:"manual",channel:"phone"},{occurredAt:"2026-09-27T08:00:00Z"});
  await adapter.apply(await auth(),write,call);
  const incoming=req("communication",{direction:"incoming",channel:"synthetic-email",
    sender_ref:"synthetic-sender",recipient_ref:"synthetic-office",coverage:"synthetic-inquiry",
    initial_fact:"received"});
  await adapter.apply(await auth(),write,incoming);
  const rows=await second`select record_id::text,record_kind,original_id::text,material,
    recorded_by::text,occurred_at::text,recorded_at::text from crm_private.b07_records
    where record_id in (${original.targetId}::uuid,${derived.targetId}::uuid,${call.targetId}::uuid,${incoming.targetId}::uuid)`;
  assert.equal(rows.length,4);
  assert.equal(rows.find(r=>r.record_id===derived.targetId)?.original_id,original.targetId);
  assert.equal(rows.find(r=>r.record_id===call.targetId)?.recorded_by,actorId);
  assert.notEqual(rows.find(r=>r.record_id===call.targetId)?.occurred_at,
    rows.find(r=>r.record_id===call.targetId)?.recorded_at);
  assert.equal(rows.find(r=>r.record_id===incoming.targetId)?.material.initial_fact,"received");
  assert.equal((await second`select count(*)::int n from crm_private.b07_records where record_id=${original.targetId}::uuid`)[0]?.n,1);
  assert.equal((await second`select count(*)::int n from crm_private.b07_links where record_id=${original.targetId}::uuid`)[0]?.n,2);
  assert.equal((await adapter.read(await auth(),read,original.targetId,"other",otherContextId)).certainty,"verified");
  const secondView=await adapter.read(await auth(),read,original.targetId,"other",otherContextId);
  assert.equal((secondView.data as {links:{coverage:string}[]}).links[0]?.coverage,"synthetic-second-context");
  assert.equal((await adapter.read(await auth(),read,original.targetId,"contact",randomUUID())).data,null);
  assert.equal((await second`select count(*)::int n from crm_private.b07_records where record_kind in ('acceptance','payment')`)[0]?.n,0);
});

test("R05-R08: send, receipt and response are separate; proposal guard rejects inference",async()=>{
  const proposalContext=randomUUID();
  const proposal=req("communication",{direction:"outgoing",channel:"synthetic-manual",
    recipient_ref:"synthetic-client",coverage:"synthetic-proposal-v1",initial_fact:"none",
    proposal_version_ref:"synthetic-v1",authorization_ref:"synthetic-approval-v1"},
    {contextKind:"proposal",contextId:proposalContext});
  await adapter.apply(await auth(),write,proposal);
  assert.equal((await second`select count(*)::int n from crm_private.b07_records where original_id=${proposal.targetId}::uuid`)[0]?.n,0);
  const proof=req("evidence",{claim:"synthetic external delivery confirmation",
    coverage:"synthetic-proposal-v1",certainty:"reviewed",source_kind:"manual"},
    {contextKind:"proposal",contextId:proposalContext});
  await adapter.apply(await auth(),write,proof);
  const sent=req("communication_fact",{fact_kind:"sent",evidence_id:proof.targetId,
    party_ref:"synthetic-client",coverage:"synthetic-proposal-v1"},
    {originalId:proposal.targetId,contextKind:"proposal",contextId:proposalContext});
  await adapter.apply(await auth(),write,sent);
  let facts=await second`select material->>'fact_kind' kind from crm_private.b07_records where original_id=${proposal.targetId}::uuid`;
  assert.deepEqual(facts.map(r=>r.kind),["sent"]);
  const invalidReceived=req("communication_fact",{fact_kind:"received",evidence_id:proof.targetId,
    party_ref:"synthetic-client",coverage:"synthetic-proposal-v1"},
    {originalId:proposal.targetId,contextKind:"proposal",contextId:proposalContext});
  await assert.rejects(adapter.apply(await auth(),write,invalidReceived));
  assert.equal((await second`select count(*)::int n from crm_private.b07_operations where operation_id=${invalidReceived.operationId}::uuid`)[0]?.n,0);
  const receiptProof=req("evidence",{claim:"synthetic receipt proof",coverage:"synthetic-proposal-v1",
    certainty:"reviewed",source_kind:"manual"},{contextKind:"proposal",contextId:proposalContext});
  await adapter.apply(await auth(),write,receiptProof);
  const received=req("communication_fact",{fact_kind:"received",evidence_id:receiptProof.targetId,
    party_ref:"synthetic-client",coverage:"synthetic-proposal-v1"},
    {originalId:proposal.targetId,contextKind:"proposal",contextId:proposalContext});
  await adapter.apply(await auth(),write,received);
  const responseProof=req("evidence",{claim:"synthetic response record",coverage:"tentative answer only",
    certainty:"reviewed",source_kind:"manual"},{contextKind:"proposal",contextId:proposalContext});
  await adapter.apply(await auth(),write,responseProof);
  const response=req("communication_fact",{fact_kind:"response",evidence_id:responseProof.targetId,
    party_ref:"synthetic-client",coverage:"tentative answer only"},
    {originalId:proposal.targetId,contextKind:"proposal",contextId:proposalContext});
  await adapter.apply(await auth(),write,response);
  facts=await second`select material->>'fact_kind' kind from crm_private.b07_records where original_id=${proposal.targetId}::uuid`;
  assert.deepEqual(facts.map(r=>r.kind).sort(),["received","response","sent"]);
  const noApproval=req("communication",{direction:"outgoing",channel:"synthetic-manual",
    recipient_ref:"synthetic-client",coverage:"synthetic-proposal-v2",initial_fact:"none"},
    {contextKind:"proposal",contextId:proposalContext});
  await adapter.apply(await auth(),write,noApproval);
  const forbidden=req("communication_fact",{fact_kind:"sent",evidence_id:proof.targetId,
    party_ref:"synthetic-client",coverage:"synthetic-proposal-v2"},
    {originalId:noApproval.targetId,contextKind:"proposal",contextId:proposalContext});
  await assert.rejects(adapter.apply(await auth(),write,forbidden));
  assert.equal((await second`select count(*)::int n from crm_private.b07_operations where operation_id=${forbidden.operationId}::uuid`)[0]?.n,0);
});

test("R10-R14: external pending, correction, replay conflict, concurrency and rollback",async()=>{
  const source=req("integration_source",{source_kind:"synthetic-feed",label:"synthetic-provider"});
  await adapter.apply(await auth(),write,source);
  const event=req("external_event",{source_id:source.targetId,external_key:"synthetic-key",
    coverage:"tentative availability",review_state:"pending"});
  await adapter.apply(await auth(),write,event);
  assert.equal((await second`select material->>'review_state' state from crm_private.b07_records where record_id=${event.targetId}::uuid`)[0]?.state,"pending");
  const first=req("evidence",{claim:"synthetic initial",coverage:"synthetic-case",
    certainty:"candidate",source_kind:"manual"});
  const raced=await Promise.all([adapter.apply(await auth(),write,first),
    adapter.apply(await auth(),write,first)]);
  assert.deepEqual(raced.map(r=>r.replayed).sort(),[false,true]);
  await assert.rejects(adapter.apply(await auth(),write,{...first,
    material:{claim:"different",coverage:"synthetic-case",certainty:"candidate",source_kind:"manual"}}));
  const fixed=req("evidence",{claim:"synthetic corrected",coverage:"synthetic-case",
    certainty:"reviewed",source_kind:"manual"},{correctsId:first.targetId,reason:"synthetic correction"});
  await adapter.apply(await auth(),write,fixed);
  const persisted=await second`select record_id::text,corrects_id::text,material->>'claim' claim
    from crm_private.b07_records where record_id in (${first.targetId}::uuid,${fixed.targetId}::uuid)`;
  assert.equal(persisted.find(r=>r.record_id===first.targetId)?.claim,"synthetic initial");
  assert.equal(persisted.find(r=>r.record_id===fixed.targetId)?.corrects_id,first.targetId);
  const history=await second`select operation_id::text,reason,source_ref,recorded_at::text,actor_id::text,
    before_state->>'record_id' prior_id,after_state->'record'->>'record_id' after_id
    from crm_private.b07_history where subject_id=${fixed.targetId}::uuid`;
  assert.equal(history.length,1);assert.equal(history[0]?.reason,"synthetic correction");
  assert.equal(history[0]?.actor_id,actorId);
  assert.equal(history[0]?.prior_id,first.targetId);
  assert.equal(history[0]?.after_id,fixed.targetId);
  await migration.unsafe(`create function crm_private.h1014_fail() returns trigger language plpgsql as $$ begin raise exception 'synthetic history fault'; end $$;
    create trigger h1014_fail before insert on crm_private.b07_history for each row execute function crm_private.h1014_fail()`);
  const failed=req("evidence",{claim:"should rollback",coverage:"synthetic-case",
    certainty:"candidate",source_kind:"manual"});
  await assert.rejects(adapter.apply(await auth(),write,failed));
  await migration.unsafe("drop trigger h1014_fail on crm_private.b07_history; drop function crm_private.h1014_fail()");
  assert.equal((await second`select count(*)::int n from crm_private.b07_records where record_id=${failed.targetId}::uuid`)[0]?.n,0);
  assert.equal((await second`select count(*)::int n from crm_private.b07_links where link_id=${failed.operationId}::uuid`)[0]?.n,0);
  assert.equal((await second`select count(*)::int n from crm_private.b07_operations where operation_id=${failed.operationId}::uuid`)[0]?.n,0);
});

test("R13: concurrent distinct links to the same context have one durable winner",async()=>{
  const original=req("document",{relation:"original",content_ref:"synthetic-link-race",
    content_kind:"synthetic-text",storage_state:"reference_only"});
  await adapter.apply(await auth(),write,original);
  const destination=randomUUID();
  const link=()=>req("document",{},{action:"link",kind:undefined,material:undefined,
    occurredAt:undefined,originalId:original.targetId,contextId:destination});
  const a=link(),b=link();
  const attempts=await Promise.allSettled([adapter.apply(await auth(),write,a),
    adapter.apply(await auth(),write,b)]);
  assert.equal(attempts.filter(x=>x.status==="fulfilled").length,1);
  assert.equal((await second`select count(*)::int n from crm_private.b07_links where record_id=${original.targetId}::uuid
    and context_id=${destination}::uuid`)[0]?.n,1);
  const operationCount=await second`select count(*)::int n from crm_private.b07_operations where operation_id in
    (${a.operationId}::uuid,${b.operationId}::uuid)`;
  assert.equal(operationCount[0]?.n,1);
});

test("R15-R17: role boundary, forced RLS and local migration",async()=>{
  await assert.rejects(runtime.unsafe("select * from crm_private.b07_records"));
  const invalid=await verifyAuth({verify:async()=>({subject:randomUUID(),sessionId:randomUUID(),
    passwordVerified:true,mfaVerified:true})},randomUUID());
  await assert.rejects(adapter.apply(invalid,write,req("evidence",{claim:"no access",
    coverage:"synthetic",certainty:"candidate",source_kind:"manual"})));
  const tables=await second`select c.relname,c.relrowsecurity,c.relforcerowsecurity,
    pg_get_userbyid(c.relowner) owner from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='crm_private' and c.relname in ('b07_records','b07_links','b07_operations','b07_history')`;
  assert.equal(tables.length,4);
  for(const row of tables){assert.equal(row.relrowsecurity,true);assert.equal(row.relforcerowsecurity,true);
    assert.equal(row.owner,"crm_h0_f2_owner");}
  const grants=await second`select grantee,table_name,privilege_type from information_schema.role_table_grants
    where table_schema='crm_private' and table_name like 'b07_%'
      and grantee in ('PUBLIC','anon','authenticated','crm_h0_runtime')`;
  assert.equal(grants.length,0);
  const migrationRecord=await second`select count(*)::int n from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='crm_api' and p.proname in ('b07_apply','b07_read')`;
  assert.equal(migrationRecord[0]?.n,2);
});
