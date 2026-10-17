import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {isolatedCorrectedDiagnostics,read,write} from '../support/h5-diagnostic-corrected-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import type {DiagnosticNode,DiagnosticQuery} from '../../src/domain/operation-diagnostic.ts';
let h:Awaited<ReturnType<typeof isolatedCorrectedDiagnostics>>;
before(async()=>{h=await isolatedCorrectedDiagnostics('h5018correl',59922);});after(async()=>{await h?.close();});
async function all(q:DiagnosticQuery){const nodes:DiagnosticNode[]=[];let after:string|undefined;do{const p=await h.diagnostic.read(await h.auth(),read,{...q,...(after?{after}:{})});nodes.push(...p.nodes);after=p.next??undefined;}while(after);return nodes;}
async function sequence(known:boolean){
 const f=await workFixture(h);await f.run(f.definition);
 const o={contextKind:'booking' as const,contextId:f.context.contextId,observationId:id(),requestRef:diagnosticReference(id()),operationId:known?f.definition.operationId:id(),executionId:f.executionId,outcome:'pending' as const,issues:[semanticIssue('E4','execution')]};
 await h.diagnostic.record(await h.auth(),write,o);
 const before=await all({contextKind:'booking',contextId:f.context.contextId,pageSize:100,reference:o.requestRef});assert.ok(before.some(n=>n.id===o.observationId));
 const row=(await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row;
 const dest=await communicationFixture(h),context={recordId:dest.recordId,...dest.context},material={...f.material,content:'Revisión legítima independiente de correlación'},approval=await f.approve(material);
 await f.run({...f.definition,...f.base(),action:'revise',version:2,context,material,...approval,affectedRefs:[dest.recordId]});
 const owner=await f.worker.read(await h.auth(),read,f.executionId,context);assert.ok(owner);assert.ok(JSON.stringify(owner).includes(f.definition.operationId));assert.ok(JSON.stringify(owner).includes(f.comm.recordId));
 const old=await all({contextKind:'booking',contextId:f.context.contextId,pageSize:1,reference:o.requestRef}),next=await all({contextKind:'booking',contextId:context.contextId,pageSize:1,reference:o.requestRef});
 assert.deepEqual((await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row,row);
 return{f,o,context,old,next,before};
}
test('R01 valid canonical operation correlation must survive an authorized revision without losing its request',async()=>{
 const {f,o,context,old,next,before}=await sequence(true);
 const byOperation=await all({contextKind:'booking',contextId:context.contextId,pageSize:100,reference:f.definition.operationId});assert.ok(byOperation.some(n=>n.id===f.definition.operationId));
 console.log('R01 lost request',JSON.stringify({beforeNodes:before.length,beforeObservation:before.find(n=>n.id===o.observationId),afterOldRequest:old,afterNewRequest:next,authorizedHistoryByOperation:byOperation.some(n=>n.id===f.definition.operationId),oldRoot:f.context.contextId,newRoot:context.contextId,operationId:f.definition.operationId,executionId:f.executionId,requestRef:o.requestRef,originalObservationImmutable:true}));
 assert.ok([...old,...next].some(n=>n.id===o.observationId),'AC-081: a legitimate historical request must not disappear from both authorized contexts after a permitted revision');
});
test('R02 historical attempt reference survives without claiming current facts of the revised foreign context',async()=>{
 const {o,context,old,next}=await sequence(false);assert.ok(old.some(n=>n.id===o.observationId));assert.equal(next.some(n=>n.id===o.observationId),false);
 assert.equal(old.some(n=>n.source==='b08_executions'||n.source==='b08_definitions'),false);assert.equal(JSON.stringify(old).includes(context.recordId),false);
});
