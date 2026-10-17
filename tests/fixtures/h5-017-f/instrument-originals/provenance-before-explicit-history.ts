import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedDiagnosticsF,all,observation,revise,saved,write,read} from '../support/h5-diagnostic-f-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
let h:Awaited<ReturnType<typeof isolatedDiagnosticsF>>;
before(async()=>{h=await isolatedDiagnosticsF('fprovenance',60201);});after(async()=>{await h?.close();});

test('F-P01 A B A C A preserves exactly scoped versions approvals operations and requests',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=observation('booking',f.context.contextId,f.definition.operationId,f.executionId);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);
 const foreign=[];const local=[f.definition.operationId];
 for(let version=2;version<=5;version++){
  const comm=await communicationFixture(h),context=version%2?f.context:{recordId:comm.recordId,...comm.context};const command=await revise(f,context,version);
  if(version%2)local.push(command.operationId);else{const request=observation('booking',context.contextId,command.operationId,f.executionId);await h.diagnostic.record(await h.auth(),write,request);foreign.push({command,context,request});}
  assert.ok((await all(h,{contextKind:'booking',contextId:o.contextId,reference:o.requestRef,pageSize:1})).some(n=>n.id===o.observationId));
 }
 const nodes=await all(h,{contextKind:'booking',contextId:o.contextId,pageSize:1});
 assert.deepEqual(nodes.filter(n=>n.source==='b08_definitions'&&n.id===f.definitionId).map(n=>n.version).sort(),[1,3,5]);
 for(const operation of local)assert.ok(nodes.some(n=>n.source==='b07_operations'&&n.id===operation));
 for(const b of foreign){
  assert.equal(JSON.stringify(nodes).includes(b.context.recordId),false);assert.equal(nodes.some(n=>n.id===b.command.operationId||n.id===diagnosticReference(b.command.decisionId)),false);
  const own=await all(h,{contextKind:'booking',contextId:b.context.contextId,reference:b.request.requestRef,pageSize:1});assert.ok(own.some(n=>n.id===b.request.observationId));assert.ok(own.some(n=>n.source==='b07_operations'&&n.id===b.command.operationId));
  assert.equal((await h.diagnostic.record(await h.auth(),write,b.request)).replayed,true);
 }
 assert.deepEqual(await saved(h,o),original);
 console.log('F-P01 provenance',JSON.stringify({versions:[1,2,3,4,5],localVersions:[1,3,5],foreignHistoricalRequests:foreign.length,originalPreserved:true}));
});

test('F-P02 expired attempts and removed parts retain history without borrowing current context',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const a=f.claim();await f.run(a);
 const comm=await communicationFixture(h),context={recordId:comm.recordId,...comm.context};
 const material={...f.material,parts:f.material.parts.map(p=>({...p,partId:'foreign-part'}))},approval=await f.approve(material);
 await f.run({...f.definition,...f.base(),action:'revise',version:2,context,material,...approval,affectedRefs:[context.recordId]});const b=f.claim();await f.run(b);
 await revise(f,f.context,3);
 const nodes=await all(h,{contextKind:'booking',contextId:f.context.contextId,pageSize:1});
 assert.ok(nodes.some(n=>n.source==='b08_attempts'&&n.id===a.attemptId));assert.equal(nodes.some(n=>n.id===b.attemptId||n.id===diagnosticReference('foreign-part')),false);
 const raw=await h.observer`select definition_version,state from crm_private.b08_attempts where execution_id=${f.executionId}::uuid order by definition_version`;assert.equal(raw.length,2);assert.deepEqual(raw.map(x=>Number(x.definition_version)),[1,2]);assert.ok(raw.every(x=>x.state==='expired'));
 const own=await f.see();assert.ok(own);console.log('F-P02 attempts',JSON.stringify({retained:raw.length,visibleAttempt:a.attemptId,excludedAttempt:b.attemptId,removedPartExcluded:true}));
});

test('F-P03 current execution cannot expose the original task of a different root',async()=>{
 const f=await workFixture(h);await f.run(f.definition);
 const task=(await h.observer`select task_id::text id from crm_private.b08_executions where execution_id=${f.executionId}::uuid`)[0]!.id;
 const comm=await communicationFixture(h),context={recordId:comm.recordId,...comm.context};await revise(f,context,2);
 const nodes=await all(h,{contextKind:'booking',contextId:context.contextId,reference:f.executionId,pageSize:1});
 assert.ok(nodes.some(n=>n.id===f.executionId));console.log('F-P03 task scope',JSON.stringify({task,visible:JSON.stringify(nodes).includes(task)}));
 assert.equal(JSON.stringify(nodes).includes(task),false,'Current execution may not lend the original task a new context');
 assert.ok((await all(h,{contextKind:'booking',contextId:f.context.contextId,pageSize:100})).some(n=>n.id===task));
});
