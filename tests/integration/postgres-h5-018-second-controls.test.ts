import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {isolatedCorrectedDiagnostics,read,write} from '../support/h5-diagnostic-corrected-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import {composeServer} from '../../src/server/composition.ts';
import {issueTrustedContext} from '../../src/application/trusted-context.ts';
import type {DiagnosticQuery,DiagnosticNode} from '../../src/domain/operation-diagnostic.ts';
let h:Awaited<ReturnType<typeof isolatedCorrectedDiagnostics>>;
before(async()=>{h=await isolatedCorrectedDiagnostics('h5018secondcontrols',59919);});after(async()=>{await h?.close();});
async function all(q:DiagnosticQuery){const nodes:DiagnosticNode[]=[];let after:string|undefined;do{const p=await h.diagnostic.read(await h.auth(),read,{...q,...(after?{after}:{})});nodes.push(...p.nodes);after=p.next??undefined;}while(after);return nodes;}
const observation=(f:Awaited<ReturnType<typeof workFixture>>)=>({contextKind:'booking' as const,contextId:f.context.contextId,observationId:id(),requestRef:diagnosticReference(id()),operationId:id(),executionId:f.executionId,outcome:'pending' as const,issues:[semanticIssue('E4','execution')]});
test('T01 same-root legitimate revision retains observation and both version links',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=observation(f);await h.diagnostic.record(await h.auth(),write,o);
 const material={...f.material,content:'Control misma raíz'},approval=await f.approve(material);await f.run({...f.definition,...f.base(),action:'revise',version:2,material,...approval});
 assert.equal((await f.see())!.execution.version,2);const nodes=await all({contextKind:'booking',contextId:f.context.contextId,pageSize:100,reference:o.requestRef});
 assert.ok(nodes.some(n=>n.id===o.observationId));assert.deepEqual(nodes.filter(n=>n.source==='b08_definitions').map(n=>Number(n.version)),[1,2]);
});
test('T02 deferred execution reference with an ordinary unknown attempt operation is revalidated on read',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=observation(f);await h.diagnostic.record(await h.auth(),write,o);
 const dest=await communicationFixture(h),context={recordId:dest.recordId,...dest.context},material={...f.material,content:'Control traslado permitido'},approval=await f.approve(material);
 await f.run({...f.definition,...f.base(),action:'revise',version:2,context,material,...approval,affectedRefs:[dest.recordId]});
 await assert.rejects(f.see(),/WORK_DENIED/);assert.equal((await f.worker.read(await h.auth(),read,f.executionId,context))!.execution.version,2);
 await assert.rejects(h.diagnostic.record(await h.auth(),write,{...o,observationId:id()}),/DIAGNOSTIC_DENIED/);
 const nodes=await all({contextKind:'booking',contextId:f.context.contextId,pageSize:1,reference:o.requestRef});
 console.log('T02',JSON.stringify({oldReaderDenied:true,newWriteDenied:true,nodes,oldRoot:f.context.contextId,newRoot:context.contextId,execution:f.executionId}));
 assert.equal(nodes.some(n=>n.references.includes(f.executionId)),false);
});
test('T03 same UUID booking to contact revision must not leak the old booking evidence through definition history',async()=>{
 const f=await workFixture(h);await f.run(f.definition);
 const req=h.req('evidence',{claim:'Contacto sintético del control tipado',coverage:'independent',certainty:'reviewed',source_kind:'manual'},f.context.contextId,'contact');await h.evidence.apply(await h.auth(),write,req);
 const context={recordId:req.targetId,contextKind:'contact',contextId:f.context.contextId,purpose:req.purpose},material={...f.material,content:'Control tipo distinto misma identidad UUID'},approval=await f.approve(material);
 await f.run({...f.definition,...f.base(),action:'revise',version:2,context,material,...approval,affectedRefs:[req.targetId]});
 assert.equal((await h.evidence.read(await h.auth(),read,f.comm.recordId,'contact',context.contextId)).data,null);
 assert.equal((await f.worker.read(await h.auth(),read,f.executionId,context))!.execution.version,2);
 const nodes=await all({contextKind:'contact',contextId:context.contextId,pageSize:1,reference:f.executionId});
 console.log('T03',JSON.stringify({oldBookingRecord:f.comm.recordId,sameUUID:context.contextId,versions:nodes.filter(n=>n.source==='b08_definitions')}));
 assert.ok(nodes.some(n=>n.id===f.executionId));assert.equal(nodes.some(n=>n.source==='b07_records'&&n.id===f.comm.recordId),false);
 assert.equal(nodes.some(n=>n.references.includes(f.comm.recordId)),false);
});
test('T04 actual composition preserves explicit outcomes and no retry after a durable effect exception',async()=>{
 const f=await communicationFixture(h),ctx=issueTrustedContext({identityId:h.actorId,identityKind:'human',scope:h.scope,purpose:'independent-audit',requestId:id(),serverTime:new Date().toISOString()}),logs:unknown[]=[];
 const deps={allowedOrigins:new Set(['second-audit']),contexts:{resolve:async()=>ctx},fingerprints:{fingerprint:()=> 'independent'},replay:{inspect:async()=>({status:'new' as const})},diagnostics:{record:(e:unknown)=>{logs.push(e);}}};
 const raw={requestId:id(),origin:'second-audit',kind:'mutation',operation:{id:id()},payload:{}};
 const rejected={status:'rejected' as const,issues:[semanticIssue('E5','operation')]};assert.deepEqual(await composeServer(deps).invoke(raw,async()=>rejected),rejected);
 const applied={status:'applied' as const,value:{technicalReference:id()}};assert.deepEqual(await composeServer(deps).invoke(raw,async()=>applied),applied);
 let calls=0;const cmd=h.req('evidence',{claim:'Efecto durable independiente',coverage:'independent',certainty:'reviewed',source_kind:'manual'},f.context.contextId,'booking');
 const result=await composeServer(deps).invoke(raw,async()=>{calls++;await h.evidence.apply(await h.auth(),write,cmd);throw new Error('SECOND_AUDIT_SECRET_CANARY');});
 assert.deepEqual(result,{status:'pending',issues:[semanticIssue('E4','operation')]});assert.equal(calls,1);assert.notEqual((await h.evidence.read(await h.auth(),read,cmd.targetId,'booking',f.context.contextId)).data,null);assert.equal(JSON.stringify({result,logs}).includes('SECOND_AUDIT_SECRET_CANARY'),false);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_operations where operation_id=${cmd.operationId}::uuid`)[0]!.n,1);
 const denied=await composeServer({...deps,contexts:{resolve:async()=>undefined}}).invoke(raw,async()=>{calls++;return applied;});assert.equal(denied.status,'rejected');assert.equal(calls,1);
 const previous=await composeServer({...deps,replay:{inspect:async<T>()=>({status:'previous' as const,value:applied.value as T})}}).invoke(raw,async()=>{calls++;return applied;});assert.equal(previous.status,'previous');assert.equal(calls,1);
});
