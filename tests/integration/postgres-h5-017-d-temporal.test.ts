import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {isolatedDiagnosticsD,read,write,migration65,migration66} from '../support/h5-diagnostic-d-isolated.ts';
import {isolatedCorrectedDiagnostics} from '../support/h5-diagnostic-corrected-isolated.ts';
import {workFixture,secondWorkActor} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import type {DiagnosticObservation,DiagnosticQuery,DiagnosticNode} from '../../src/domain/operation-diagnostic.ts';
import type {WorkContext} from '../../src/domain/persisted-work.ts';
let h:Awaited<ReturnType<typeof isolatedDiagnosticsD>>;
before(async()=>{h=await isolatedDiagnosticsD('h5017down',59930);});after(async()=>{await h?.close();});
async function all(q:DiagnosticQuery){const nodes:DiagnosticNode[]=[];let after:string|undefined;const seen=new Set<string>();do{const p=await h.diagnostic.read(await h.auth(),read,{...q,...(after?{after}:{})});assert.equal(p.technicalOnly,true);nodes.push(...p.nodes);after=p.next??undefined;if(after){assert.equal(seen.has(after),false);seen.add(after);}}while(after);assert.equal(new Set(nodes.map(n=>n.key)).size,nodes.length);return nodes;}
const query=(contextId:string,contextKind:DiagnosticQuery['contextKind']='booking',reference?:string):DiagnosticQuery=>({contextKind,contextId,pageSize:100,...(reference?{reference}:{})});
const obs=(root:string,operationId:string,executionId?:string):DiagnosticObservation=>({contextKind:'booking',contextId:root,observationId:id(),requestRef:diagnosticReference(id()),operationId,...(executionId?{executionId}:{}),outcome:'pending',issues:[semanticIssue('E4','operation')]});
const record=async(o:DiagnosticObservation)=>h.diagnostic.record(await h.auth(),write,o);
async function revise(f:Awaited<ReturnType<typeof workFixture>>,context:WorkContext,version:number){const material={...f.material,content:'Versión sintética D '+version},approval=await f.approve(material),cmd={...f.definition,...f.base(),action:'revise' as const,context,version,material,...approval,affectedRefs:[context.recordId]};await f.run(cmd);return cmd;}
async function otherContext(contextKind:'contact'|'organization',contextId:string=id()):Promise<WorkContext>{const c=h.req('evidence',{claim:'Evidencia sintética D',coverage:'independent',certainty:'reviewed',source_kind:'manual'},contextId,contextKind);await h.evidence.apply(await h.auth(),write,c);return {recordId:c.targetId,contextKind,contextId,purpose:c.purpose};}
const stored=async(o:DiagnosticObservation)=>(await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row;

test('D01 unchanged canonical petition preserves current projection and pagination identity',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=obs(f.context.contextId,f.definition.operationId,f.executionId);await record(o);
 const a=await all(query(o.contextId,'booking',o.requestRef)),b=await all({...query(o.contextId,'booking',o.requestRef),pageSize:1});assert.deepEqual(a.map(({ageSeconds,...n})=>n),b.map(({ageSeconds,...n})=>n));assert.equal(a.find(n=>n.id===o.observationId)!.operationReferenceState,'canonical');assert.ok(a.some(n=>n.source==='b08_executions'));assert.equal(a.find(n=>n.id===o.observationId)!.historicalOperationReference,undefined);
});
test('D02 two authorized revisions keep each typed original petition and no current foreign execution or evidence',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const a=obs(f.context.contextId,f.definition.operationId,f.executionId);await record(a);const beforeA=await stored(a);
 const bctx=await otherContext('contact',f.context.contextId),bop=await revise(f,bctx,2),b={...obs(bctx.contextId,bop.operationId,f.executionId),contextKind:'contact' as const};await record(b);const beforeB=await stored(b);
 const cctx=await otherContext('organization');await revise(f,cctx,3);
 for(const o of[a,b]){const n=await all(query(o.contextId,o.contextKind,o.requestRef));const observation=n.find(n=>n.id===o.observationId)!;assert.ok(observation);assert.equal(observation.historicalOperationReference,true);assert.ok(n.some(n=>n.source==='b07_history'&&n.references.includes(o.operationId!)));assert.equal(n.some(n=>n.source==='b08_executions'||n.source==='b08_definitions'),false);assert.equal(JSON.stringify(n).includes(cctx.recordId),false);assert.deepEqual(await all(query(cctx.contextId,'organization',o.requestRef)),[]);}
 assert.deepEqual(await stored(a),beforeA);assert.deepEqual(await stored(b),beforeB);await assert.rejects(f.see(),/WORK_DENIED/);assert.equal((await f.worker.read(await h.auth(),read,f.executionId,cctx))!.execution.version,3);
 assert.deepEqual(await all(query(bctx.contextId,'contact',a.requestRef)),[]);assert.deepEqual(await all(query(f.context.contextId,'booking',b.requestRef)),[]);
 assert.equal((await h.evidence.read(await h.auth(),read,cctx.recordId,'booking',f.context.contextId)).data,null);
 await revise(f,f.context,4);assert.equal((await f.see())!.execution.version,4);assert.ok((await all(query(a.contextId,'booking',a.requestRef))).some(n=>n.id===a.observationId));
});
test('D03 operation-only and authorized original event references retain provenance without copying bodies',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const event=await boundaryFixture(h,'other',f.context.contextId),cmd={...event.base(),material:{body:'D_RESTRICTED_EVENT_BODY_CANARY'}};await event.run(cmd);
 const o={...obs(f.context.contextId,f.definition.operationId),eventId:cmd.eventId};await record(o);const original=await stored(o);const dest=await communicationFixture(h);await revise(f,{recordId:dest.recordId,...dest.context},2);
 const nodes=await all(query(o.contextId,'booking',o.requestRef));assert.ok(nodes.some(n=>n.id===o.observationId));assert.equal(nodes.find(n=>n.id===o.observationId)!.historicalOperationReference,true);assert.ok(nodes.some(n=>n.id===cmd.eventId));assert.equal(JSON.stringify(nodes).includes('D_RESTRICTED_EVENT_BODY_CANARY'),false);assert.deepEqual(await stored(o),original);
 assert.deepEqual(await all(query(dest.context.contextId,'booking',o.requestRef)),[]);
});
test('D04 historical visibility never authorizes new writes with stale execution or foreign and missing references',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=obs(f.context.contextId,f.definition.operationId,f.executionId);await record(o);const dest=await communicationFixture(h);await revise(f,{recordId:dest.recordId,...dest.context},2);
 const before=(await h.observer`select count(*)::int n from crm_private.b10_diagnostic_observations`)[0]!.n;
 for(const bad of[{...o,observationId:id()},{...o,observationId:id(),executionId:id()},{...o,observationId:id(),eventId:id()}])await assert.rejects(record(bad),/DIAGNOSTIC_DENIED/);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b10_diagnostic_observations`)[0]!.n,before);assert.ok((await all(query(o.contextId,'booking',o.requestRef))).some(n=>n.id===o.observationId));
});
test('D05 unknown attempt later canonized in another work context stays hidden despite history and revision elsewhere',async()=>{
 const a=await communicationFixture(h),f=await workFixture(h),o=obs(a.context.contextId,f.definition.operationId);await record(o);assert.equal((await all(query(o.contextId,'booking',o.requestRef))).find(n=>n.id===o.observationId)!.operationReferenceState,'unverified_attempt');const before=await stored(o);
 await f.run(f.definition);const dest=await communicationFixture(h);await revise(f,{recordId:dest.recordId,...dest.context},2);assert.deepEqual(await all(query(o.contextId,'booking',o.requestRef)),[]);assert.deepEqual(await stored(o),before);
 await assert.rejects(record({...o,observationId:id()}),/DIAGNOSTIC_DENIED/);
});
test('D06 recovered historical read still requires actual verified MFA interaction session and enabled actor',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=obs(f.context.contextId,f.definition.operationId,f.executionId);await record(o);const dest=await communicationFixture(h);await revise(f,{recordId:dest.recordId,...dest.context},2);const q=query(o.contextId,'booking',o.requestRef),valid=await h.auth();
 for(const bad of[{}, {...valid}])await assert.rejects(h.diagnostic.read(bad as any,read,q),/DIAGNOSTIC_DENIED/);
 await assert.rejects(h.diagnostic.read(valid,write,q),/DIAGNOSTIC_DENIED/);
 const noMfa=await verifyAuth({verify:async()=>({subject:h.subject,sessionId:h.sessionId,passwordVerified:true,mfaVerified:false})},id());await assert.rejects(h.diagnostic.read(noMfa,read,q),/DIAGNOSTIC_DENIED/);
 try{await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;await assert.rejects(h.diagnostic.read(valid,read,q),/DIAGNOSTIC_DENIED/);}finally{await h.admin`update crm_private.crm_actors set enabled=true where actor_id=${h.actorId}::uuid`;h.auth=(await secondWorkActor(h)).auth;}
 assert.ok((await all(q)).some(n=>n.id===o.observationId));
});
test('D07 legacy64 foreign work operation cannot acquire historical authority through upgrade65 and66',async()=>{
 const legacy=await isolatedCorrectedDiagnostics('h5017dlegacy',59931,true);
 try{const a=await communicationFixture(legacy),b=await workFixture(legacy);await b.run(b.definition);const o=obs(a.context.contextId,b.definition.operationId);await legacy.diagnostic.record(await legacy.auth(),write,o);
 await legacy.migration.unsafe(await readFile(migration65,'utf8'));await legacy.migration.unsafe(await readFile(migration66,'utf8'));
 assert.deepEqual((await legacy.diagnostic.read(await legacy.auth(),read,query(o.contextId,'booking',o.requestRef))).nodes,[]);await assert.rejects(legacy.diagnostic.record(await legacy.auth(),write,{...o,observationId:id()}),/DIAGNOSTIC_DENIED/);
 assert.equal((await legacy.observer`select count(*)::int n from crm_private.b10_diagnostic_observations where observation_id=${o.observationId}::uuid`)[0]!.n,1);
 }finally{await legacy.close();}
});
