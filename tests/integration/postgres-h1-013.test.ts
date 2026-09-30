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
const database="crm_h1_013_focal",port=Number(process.env.POSTGRES_H1013_PORT??55443);
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
    contextKind:"other",contextId,coverage:"fixture-context-coverage",reason:"fixture-record",...change};
}
before(async()=>{
  temporaryRoot=await mkdtemp(join(tmpdir(),"crm-h1-013-"));socket=join(temporaryRoot,"socket");await mkdir(socket);
  command("initdb",["-D",join(temporaryRoot,"data"),"--username=h1013_bootstrap","--auth-local=trust",
    "--auth-host=trust","--no-locale","--encoding=UTF8"]);
  command("pg_ctl",["-D",join(temporaryRoot,"data"),"-l",join(temporaryRoot,"postgres.log"),
    "-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);started=true;
  admin=connect("h1013_bootstrap","postgres");
  await admin.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
  await admin.unsafe(`create database ${database} owner crm_h0_migration`);
  await admin.end();admin=connect("h1013_bootstrap");migration=connect("crm_h0_migration");
  await applyChain(migration,admin,"20260929000000_h0_m06_access_recovery.sql");
  await admin.unsafe("create role anon nologin; create role authenticated nologin");
  f1={key:randomBytes(32),keyId:randomUUID(),audience:"h1-b07-focal",generation:randomUUID(),
    allowedPurposes:["h1-evidence"]};
  f2={key:randomBytes(32),keyId:randomUUID(),audience:"h1-b07-focal",generation:randomUUID(),
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

test("H1-013 E01/E02: document, evidence, derived and late manual call remain distinct",async()=>{
  const original=req("document",{relation:"original",content_ref:"synthetic-object-reference",
    content_kind:"synthetic-pdf",storage_state:"reference_only"});
  await adapter.apply(await auth(),write,original);
  const derived=req("document",{relation:"derived",content_ref:"synthetic-summary-reference",
    content_kind:"synthetic-summary",storage_state:"reference_only",review_ref:"fixture-review"},
    {originalId:original.targetId});
  await adapter.apply(await auth(),write,derived);
  const evidence=req("evidence",{claim:"fixture receipt attached, payment unverified",
    coverage:"fixture-booking",certainty:"candidate",source_kind:"document",document_id:original.targetId});
  await adapter.apply(await auth(),write,evidence);
  const call=req("evidence",{claim:"fixture manual call stated availability",
    coverage:"fixture-service",certainty:"reviewed",source_kind:"manual",channel:"phone"},
    {sourceRef:"fixture-authorized-manual-call",occurredAt:"2026-09-27T09:00:00Z"});
  await adapter.apply(await auth(),write,call);
  const rows=await second`select record_id::text,record_kind,original_id::text,
    occurred_at::text,recorded_at::text,recorded_by::text,material
    from crm_private.b07_records where record_id in (${original.targetId}::uuid,${derived.targetId}::uuid,
      ${evidence.targetId}::uuid,${call.targetId}::uuid)`;
  assert.equal(rows.length,4);
  assert.equal(rows.find(r=>r.record_id===derived.targetId)?.original_id,original.targetId);
  assert.equal(rows.find(r=>r.record_id===call.targetId)?.recorded_by,actorId);
  assert.notEqual(rows.find(r=>r.record_id===call.targetId)?.occurred_at,
    rows.find(r=>r.record_id===call.targetId)?.recorded_at);
  assert.equal((await adapter.read(await auth(),read,original.targetId,"other",contextId)).certainty,"verified");
  assert.equal((await second`select count(*)::int n from crm_private.b07_records where record_id=${original.targetId}::uuid`)[0]?.n,1);
});

test("H1-013 E03: one original links two contexts without broadening either read",async()=>{
  const doc=req("document",{relation:"original",content_ref:"fixture-original-2",
    content_kind:"synthetic-text",storage_state:"reference_only"});
  await adapter.apply(await auth(),write,doc);
  assert.equal((await adapter.read(await auth(),read,doc.targetId,"other",otherContextId)).data,null);
  const link=req("document",{}, {action:"link",kind:undefined,material:undefined,
    targetId:randomUUID(),originalId:doc.targetId,occurredAt:undefined,
    contextKind:"other",contextId:otherContextId,coverage:"fixture-second-context"});
  await adapter.apply(await auth(),write,link);
  assert.equal((await adapter.read(await auth(),read,doc.targetId,"other",otherContextId)).certainty,"verified");
  const projection=await adapter.read(await auth(),read,doc.targetId,"other",otherContextId);
  assert.equal((projection.data as {links:{coverage:string}[]}).links[0]?.coverage,"fixture-second-context");
  const rows=await second`select count(*)::int n from crm_private.b07_records where record_id=${doc.targetId}::uuid`;
  assert.equal(rows[0]?.n,1);
  assert.equal((await second`select count(*)::int n from crm_private.b07_links where record_id=${doc.targetId}::uuid`)[0]?.n,2);
  assert.equal((await adapter.read(await auth(),read,doc.targetId,"contact",randomUUID())).data,null);
});

test("H1-013 E05: incoming begins received, outgoing facts require separate evidence",async()=>{
  const incoming=req("communication",{direction:"incoming",channel:"synthetic-email",
    sender_ref:"fixture-sender",recipient_ref:"fixture-recipient",coverage:"fixture-inquiry",initial_fact:"received"});
  await adapter.apply(await auth(),write,incoming);
  const outgoing=req("communication",{direction:"outgoing",channel:"synthetic-email",
    sender_ref:"fixture-sender",recipient_ref:"fixture-recipient",coverage:"fixture-reply",initial_fact:"none"});
  await adapter.apply(await auth(),write,outgoing);
  let facts=await second`select count(*)::int n from crm_private.b07_records where original_id=${outgoing.targetId}::uuid`;
  assert.equal(facts[0]?.n,0);
  const proof=req("evidence",{claim:"fixture transport receipt",coverage:"fixture-reply",
    certainty:"reviewed",source_kind:"manual"});
  await adapter.apply(await auth(),write,proof);
  const sent=req("communication_fact",{fact_kind:"sent",evidence_id:proof.targetId,
    party_ref:"fixture-recipient",coverage:"fixture-reply"},{originalId:outgoing.targetId});
  await adapter.apply(await auth(),write,sent);
  facts=await second`select record_kind,material from crm_private.b07_records where original_id=${outgoing.targetId}::uuid`;
  assert.equal(facts.length,1);assert.equal(facts[0]?.material.fact_kind,"sent");
  assert.equal((await second`select count(*)::int n from crm_private.b07_records where original_id=${incoming.targetId}::uuid`)[0]?.n,0);
  const invalid=req("communication_fact",{fact_kind:"received",evidence_id:randomUUID(),
    party_ref:"fixture-recipient",coverage:"fixture-reply"},{originalId:outgoing.targetId});
  await assert.rejects(adapter.apply(await auth(),write,invalid));
  assert.equal((await second`select count(*)::int n from crm_private.b07_records where record_id=${invalid.targetId}::uuid`)[0]?.n,0);
});

test("H1-013 E05/E06: proposal send guard and external candidate are not confirmation",async()=>{
  const proposalContext=randomUUID();
  const outgoing=req("communication",{direction:"outgoing",channel:"synthetic-manual",
    recipient_ref:"fixture-recipient",coverage:"fixture-proposal",initial_fact:"none"},
    {contextKind:"proposal",contextId:proposalContext});
  await adapter.apply(await auth(),write,outgoing);
  const proof=req("evidence",{claim:"fixture send proof",coverage:"fixture-proposal",
    certainty:"reviewed",source_kind:"manual"},{contextKind:"proposal",contextId:proposalContext});
  await adapter.apply(await auth(),write,proof);
  const attempted=req("communication_fact",{fact_kind:"sent",evidence_id:proof.targetId,
    party_ref:"fixture-recipient",coverage:"fixture-proposal"},
    {originalId:outgoing.targetId,contextKind:"proposal",contextId:proposalContext});
  await assert.rejects(adapter.apply(await auth(),write,attempted));
  const source=req("integration_source",{source_kind:"synthetic",label:"fixture external source"});
  await adapter.apply(await auth(),write,source);
  const ref=req("external_reference",{source_id:source.targetId,external_key:"fixture-key",
    coverage:"unreviewed external reference"});
  await adapter.apply(await auth(),write,ref);
  const event=req("external_event",{source_id:source.targetId,external_key:"fixture-event",
    coverage:"tentative availability",review_state:"pending"});
  await adapter.apply(await auth(),write,event);
  assert.equal((await second`select material->>'review_state' state from crm_private.b07_records where record_id=${event.targetId}::uuid`)[0]?.state,"pending");
  assert.equal((await second`select count(*)::int n from crm_private.b07_records where record_id=${attempted.targetId}::uuid`)[0]?.n,0);
});

test("H1-013 E07/E08: correction, replay, conflict and atomic rollback",async()=>{
  const first=req("evidence",{claim:"fixture tentative observation",coverage:"fixture-case",
    certainty:"candidate",source_kind:"manual"});
  assert.equal((await adapter.apply(await auth(),write,first)).replayed,false);
  assert.equal((await adapter.apply(await auth(),write,first)).replayed,true);
  const altered={...first,material:{...first.material,claim:"changed"}};
  await assert.rejects(adapter.apply(await auth(),write,altered));
  const correction=req("evidence",{claim:"fixture corrected observation",coverage:"fixture-case",
    certainty:"reviewed",source_kind:"manual"},{correctsId:first.targetId,reason:"fixture-correction"});
  await adapter.apply(await auth(),write,correction);
  const rows=await second`select record_id::text,corrects_id::text,material from crm_private.b07_records
    where record_id in (${first.targetId}::uuid,${correction.targetId}::uuid)`;
  assert.equal(rows.length,2);assert.equal(rows.find(r=>r.record_id===correction.targetId)?.corrects_id,first.targetId);
  assert.equal(rows.find(r=>r.record_id===first.targetId)?.material.claim,"fixture tentative observation");
  assert.equal((await second`select count(*)::int n from crm_private.b07_history where subject_id=${first.targetId}::uuid`)[0]?.n,1);
  await migration.unsafe(`create function crm_private.b07_fail_history() returns trigger language plpgsql as $$ begin raise exception 'fixture history failure'; end $$;
    create trigger b07_fail_history before insert on crm_private.b07_history for each row execute function crm_private.b07_fail_history()`);
  const failed=req("evidence",{claim:"fixture atomic failure",coverage:"fixture-case",
    certainty:"candidate",source_kind:"manual"});
  await assert.rejects(adapter.apply(await auth(),write,failed));
  await migration.unsafe("drop trigger b07_fail_history on crm_private.b07_history; drop function crm_private.b07_fail_history()");
  assert.equal((await second`select count(*)::int n from crm_private.b07_records where record_id=${failed.targetId}::uuid`)[0]?.n,0);
  assert.equal((await second`select count(*)::int n from crm_private.b07_operations where operation_id=${failed.operationId}::uuid`)[0]?.n,0);
});

test("H1-013 E08/E09: concurrent replay and runtime direct access denial",async()=>{
  const concurrent=req("evidence",{claim:"fixture concurrent",coverage:"fixture-case",
    certainty:"candidate",source_kind:"manual"});
  const results=await Promise.all([adapter.apply(await auth(),write,concurrent),
    adapter.apply(await auth(),write,concurrent)]);
  assert.deepEqual(results.map(r=>r.replayed).sort(),[false,true]);
  assert.equal((await second`select count(*)::int n from crm_private.b07_records where record_id=${concurrent.targetId}::uuid`)[0]?.n,1);
  await assert.rejects(runtime.unsafe("select * from crm_private.b07_records"));
  await assert.rejects(runtime.unsafe("insert into crm_private.b07_records(record_id) values (gen_random_uuid())"));
});
