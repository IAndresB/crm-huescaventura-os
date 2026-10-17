import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {isolatedDiagnosticsD,read,write} from '../support/h5-diagnostic-d-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
test('D10 operation UUID alias must not substitute the actual execution subject in historical recovery',async()=>{
 const h=await isolatedDiagnosticsD('h5017dalias',59934);
 try{
 const f=await workFixture(h);await f.run(f.definition);
 // UUIDs are not globally unique across the operation and execution registries.
 // Both executions are initially authorized in A, but only f owns this operation.
 const shadow=await workFixture(h),shadowId=f.definition.operationId;
 await shadow.run({...shadow.definition,executionId:shadowId,context:f.context,affectedRefs:[f.comm.recordId]});
 const base={contextKind:'booking' as const,contextId:f.context.contextId,operationId:f.definition.operationId,outcome:'pending' as const,issues:[semanticIssue('E4','execution')]};
 const good={...base,executionId:f.executionId,observationId:id(),requestRef:diagnosticReference(id())},bad={...base,executionId:shadowId,observationId:id(),requestRef:diagnosticReference(id())};
 await h.diagnostic.record(await h.auth(),write,good);await h.diagnostic.record(await h.auth(),write,bad);
 const original=(await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${bad.observationId}::uuid`)[0]!.row;
 const dest=await communicationFixture(h),context={recordId:dest.recordId,...dest.context},material={...f.material,content:'Revisión sintética D10'},approval=await f.approve(material);await f.run({...f.definition,...f.base(),action:'revise',version:2,context,material,...approval,affectedRefs:[dest.recordId]});
 const query=(reference:string)=>({contextKind:'booking' as const,contextId:f.context.contextId,pageSize:100,reference});
 const valid=await h.diagnostic.read(await h.auth(),read,query(good.requestRef)),wrong=await h.diagnostic.read(await h.auth(),read,query(bad.requestRef));
 assert.ok(valid.nodes.some(n=>n.id===good.observationId),'matching original execution remains investigable');
 assert.deepEqual((await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${bad.observationId}::uuid`)[0]!.row,original);
 console.log('D10 alias',JSON.stringify({operationId:f.definition.operationId,actualExecution:f.executionId,unrelatedExecution:shadowId,wrongObservationReturned:wrong.nodes.some(n=>n.id===bad.observationId),originalUnchanged:true}));
 assert.equal(wrong.nodes.some(n=>n.id===bad.observationId),false,'execution must match the historical work subject, not its operation UUID');
 }finally{await h.close();}
});
