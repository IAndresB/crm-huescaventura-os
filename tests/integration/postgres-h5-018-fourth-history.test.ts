import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {fourthDatabase,all,observation,revise,saved,read,write} from '../support/h5-018-fourth-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import type {WorkContext} from '../../src/domain/persisted-work.ts';
let h:Awaited<ReturnType<typeof fourthDatabase>>;
before(async()=>{h=await fourthDatabase('fourthhistory',59980);});after(async()=>{await h?.close();});

// Q02: approved C01/HIST003/006/BR-HIST004. The foreign evidence owner
// denies this typed root, even when the current execution returns to it.
for(const route of ['booking','service-booking','service-opportunity'] as const)test('Q02 return to original root does not import unrelated version sources '+route,async()=>{
 const f=await workFixture(h);let origin:WorkContext=f.context;
 let kind:'booking'|'opportunity'='booking',root=f.context.contextId;
 if(route!=='booking'){
  const joint=await jointFixture(h,[]),row=(await h.observer`select b.opportunity_id::text opportunity,s.service_id::text service from crm_private.b04_bookings b join crm_private.b04_services s using(booking_id) where b.booking_id=${joint.bookingId}::uuid limit 1`)[0]!;
  const e=h.req('evidence',{claim:'SYNTHETIC fourth child source',coverage:'fourth',certainty:'reviewed',source_kind:'manual'},row.service,'booking_service');await h.evidence.apply(await h.auth(),write,e);
  origin={recordId:e.targetId,contextKind:'booking_service',contextId:row.service,purpose:e.purpose};kind=route==='service-booking'?'booking':'opportunity';root=kind==='booking'?joint.bookingId:row.opportunity;
 }
 await f.run({...f.definition,context:origin,affectedRefs:[origin.recordId]});
 const o=observation(kind,root,f.definition.operationId,f.executionId);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);
 const q={contextKind:kind,contextId:root,reference:o.requestRef,pageSize:2};assert.ok((await all(h,q)).some(n=>n.id===o.observationId));
 const other=await communicationFixture(h),foreign={recordId:other.recordId,...other.context},middle=await revise(f,foreign,2);
 const b=observation('booking',foreign.contextId,middle.operationId,f.executionId);await h.diagnostic.record(await h.auth(),write,b);
 const away=await all(h,q);assert.ok(away.some(n=>n.id===o.observationId));assert.equal(JSON.stringify(away).includes(foreign.recordId),false);
 await revise(f,origin,3);
 assert.equal((await h.evidence.read(await h.auth(),read,foreign.recordId,kind,root)).data,null,'control: B07 does not authorize foreign source through queried root');
 const back=await all(h,q),foreignApproval=diagnosticReference(middle.decisionId);
 const exposed=back.filter(n=>JSON.stringify(n).includes(foreign.recordId)||n.id===middle.operationId||n.id===foreignApproval);
 const bAuthorized=await all(h,{contextKind:'booking',contextId:foreign.contextId,reference:b.requestRef,pageSize:2});assert.ok(bAuthorized.some(n=>n.id===b.observationId));
 assert.deepEqual(await saved(h,o),original);
 console.log('Q02 return scope',JSON.stringify({route,origin,foreign,operation:middle.operationId,foreignApproval,observation:o.observationId,sourceReaderDenied:true,exposed,originalPreserved:true}));
 assert.deepEqual(exposed,[],'An authorized return cannot lend the original root ownership of another context version, approval or operation');
});

test('Q03 pending request without operation survives A B C A and remains in original root',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=observation('booking',f.context.contextId,undefined,f.executionId);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);
 for(let version=2;version<=4;version++){
  const next=await communicationFixture(h),context=version===4?f.context:{recordId:next.recordId,...next.context};await revise(f,context,version);
  const q={contextKind:'booking' as const,contextId:o.contextId,reference:o.requestRef,pageSize:1};assert.ok((await all(h,q)).some(n=>n.id===o.observationId));
  if(version<4)assert.deepEqual(await all(h,{...q,contextId:context.contextId}),[]);
 }
 assert.deepEqual(await saved(h,o),original);
});
