import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {isolatedDiagnosticsE,migration67,read,write} from '../support/h5-diagnostic-e-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import type {DiagnosticObservation} from '../../src/domain/operation-diagnostic.ts';
let h:Awaited<ReturnType<typeof isolatedDiagnosticsE>>;
before(async()=>{h=await isolatedDiagnosticsE('h5017eidentity',59961);});after(async()=>{await h?.close();});
const observation=(contextId:string,operationId:string,executionId?:string):DiagnosticObservation=>({contextKind:'booking',contextId,operationId,...(executionId?{executionId}:{}),observationId:id(),requestRef:diagnosticReference(id()),outcome:'pending',issues:[semanticIssue('E4','execution')]});
const record=async(o:DiagnosticObservation)=>h.diagnostic.record(await h.auth(),write,o);
const nodes=async(o:DiagnosticObservation)=>(await h.diagnostic.read(await h.auth(),read,{contextKind:o.contextKind,contextId:o.contextId,reference:o.requestRef,pageSize:100})).nodes;
const saved=async(o:DiagnosticObservation)=>(await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]?.row;

test('E-I01 genuine B08 ownership survives define claim start and accredited result',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const claim=f.claim(60),start=f.start(claim,1),commands=[f.definition,claim,start,f.prove(claim.attemptId)];
 for(const c of commands){if(c!==f.definition)await f.run(c);const o=observation(f.context.contextId,c.operationId,f.executionId);await record(o);assert.equal((await nodes(o)).find(n=>n.id===o.observationId)?.operationReferenceState,'canonical');}
 assert.equal((await h.observer`select count(*)::int n from crm_private.b08_attempts where execution_id=${f.executionId}::uuid`)[0]!.n,1);
});
test('E-I02 late confirmation for the same execution promotes only the verified association and preserves the original row',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const claim=f.claim(60),o=observation(f.context.contextId,claim.operationId,f.executionId);await record(o);const original=await saved(o);
 assert.equal((await nodes(o)).find(n=>n.id===o.observationId)?.operationReferenceState,'unverified_attempt');await f.run(claim);
 assert.equal((await nodes(o)).find(n=>n.id===o.observationId)?.operationReferenceState,'canonical');assert.deepEqual(await saved(o),original);
});
test('E-I03 a late wrong owner stays suppressed after subsequent authorized revisions',async()=>{
 const a=await workFixture(h),b=await workFixture(h);await a.run(a.definition);const o=observation(a.context.contextId,b.definition.operationId,a.executionId);await record(o);const original=await saved(o);
 await b.run({...b.definition,context:a.context,affectedRefs:[a.comm.recordId]});assert.equal((await nodes(o)).some(n=>n.id===o.observationId),false);
 const dest=await communicationFixture(h),context={recordId:dest.recordId,...dest.context},material={...b.material,content:'E wrong owner revised'},approval=await b.approve(material);
 await b.run({...b.definition,...b.base(),action:'revise',version:2,context,material,...approval,affectedRefs:[context.recordId]});assert.equal((await nodes(o)).some(n=>n.id===o.observationId),false);assert.deepEqual(await saved(o),original);
});
for(const alias of [false,true])test('E-I04 a non-work operation cannot own an execution through result UUID coincidence alias='+alias,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const q=h.req('evidence',{claim:'synthetic non-work owner',coverage:'E',certainty:'reviewed',source_kind:'manual'},f.context.contextId,'booking');
 const evidence={...q,...(alias?{targetId:f.executionId}:{})};await h.evidence.apply(await h.auth(),write,evidence);
 const o=observation(f.context.contextId,evidence.operationId,f.executionId);await assert.rejects(record(o),/DIAGNOSTIC_DENIED/);assert.equal(await saved(o),undefined);
 const legitimate=observation(f.context.contextId,evidence.operationId);await record(legitimate);assert.equal((await nodes(legitimate)).find(n=>n.id===legitimate.observationId)?.operationReferenceState,'canonical');
});
for(const alias of [false,true])test('E-I05 upgrade preserves and suppresses a false pair accepted by D alias='+alias,async()=>{
 const db=await isolatedDiagnosticsE('h5017elegacy'+Number(alias),59962+Number(alias),true);
 try{
  const a=await workFixture(db),b=await workFixture(db);await a.run(a.definition);const execution=alias?a.definition.operationId:b.executionId;await b.run({...b.definition,executionId:execution,context:a.context,affectedRefs:[a.comm.recordId]});
  const o=observation(a.context.contextId,a.definition.operationId,execution);await db.diagnostic.record(await db.auth(),write,o);
  const q={contextKind:'booking' as const,contextId:o.contextId,reference:o.requestRef,pageSize:100};assert.equal((await db.diagnostic.read(await db.auth(),read,q)).nodes.find(n=>n.id===o.observationId)?.operationReferenceState,'canonical');
  const original=(await db.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row;
  await db.migration.unsafe(await readFile(migration67,'utf8'));assert.equal((await db.diagnostic.read(await db.auth(),read,q)).nodes.some(n=>n.id===o.observationId),false);
  await assert.rejects(db.diagnostic.record(await db.auth(),write,{...o,observationId:id()}),/DIAGNOSTIC_DENIED/);
  assert.deepEqual((await db.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row,original);
 }finally{await db.close();}
});
