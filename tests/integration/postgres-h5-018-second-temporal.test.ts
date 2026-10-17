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
before(async()=>{h=await isolatedCorrectedDiagnostics('h5018secondtime',59918);});after(async()=>{await h?.close();});
async function all(q:DiagnosticQuery){const nodes:DiagnosticNode[]=[];let after:string|undefined;do{const p=await h.diagnostic.read(await h.auth(),read,{...q,...(after?{after}:{})});nodes.push(...p.nodes);after=p.next??undefined;}while(after);return nodes;}
async function moved(){
 const f=await workFixture(h);await f.run(f.definition);
 const dest=await communicationFixture(h),context={recordId:dest.recordId,...dest.context};
 const material={...f.material,content:'Revisión sintética independiente de contexto'};
 const approval=await f.approve(material);
 const revise={...f.definition,...f.base(),action:'revise' as const,version:2,context,material,...approval,affectedRefs:[dest.recordId]};
 return {f,dest,context,revise};
}
test('S01 initially valid execution observation must be coherent after an authorized context revision',async()=>{
 const {f,context,revise}=await moved();
 const o={contextKind:'booking' as const,contextId:f.context.contextId,observationId:id(),requestRef:diagnosticReference(id()),executionId:f.executionId,outcome:'pending' as const,issues:[semanticIssue('E4','execution')]};
 await h.diagnostic.record(await h.auth(),write,o);
 assert.ok((await all({...o,pageSize:100,reference:o.requestRef})).some(n=>n.id===f.executionId));
 const original=(await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row;
 await f.run(revise);
 await assert.rejects(f.worker.read(await h.auth(),read,f.executionId,f.context),/WORK_DENIED/);
 assert.equal((await f.worker.read(await h.auth(),read,f.executionId,context))!.execution.version,2);
 await assert.rejects(h.diagnostic.record(await h.auth(),write,{...o,observationId:id(),requestRef:diagnosticReference(id())}),/DIAGNOSTIC_DENIED/);
 const nodes=await all({contextKind:'booking',contextId:f.context.contextId,pageSize:100,reference:o.requestRef});
 console.log('S01 deferred-reference',JSON.stringify({originalReaderDenied:true,writeNowDenied:true,nodes,executionId:f.executionId,oldRoot:f.context.contextId,newRoot:context.contextId}));
 assert.deepEqual((await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row,original,'audit must preserve original observation');
 assert.equal(nodes.some(n=>n.references.includes(f.executionId)),false,'read must not retain a reference that current write and original reader deny');
});
test('S02 moved work must not expand access to evidence of a different typed root through old versions',async()=>{
 const {f,context,revise}=await moved();await f.run(revise);
 assert.equal((await h.evidence.read(await h.auth(),read,f.comm.recordId,'booking',context.contextId)).data,null);
 const nodes=await all({contextKind:'booking',contextId:context.contextId,pageSize:100,reference:f.executionId});
 console.log('S02 historical projection',JSON.stringify({oldEvidence:f.comm.recordId,newRoot:context.contextId,versions:nodes.filter(n=>n.source==='b08_definitions')}));
 assert.ok(nodes.some(n=>n.id===f.executionId),'current authorized work remains visible');
 assert.equal(nodes.some(n=>n.references.includes(f.comm.recordId)),false,'old evidence denied by its original reader must not leak through version references');
});
