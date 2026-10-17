import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {fifthDatabase,observation,pages,revision,persisted,read,write} from '../support/h5-018-fifth-isolated.ts';
import {workFixture,secondWorkActor} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
let h:Awaited<ReturnType<typeof fifthDatabase>>;
before(async()=>{h=await fifthDatabase('fifthseq',60301);});after(async()=>{await h?.close();});

test('V01 typed UUID collision after A B A with new evidence cannot change operation owner',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const q={contextKind:'booking' as const,contextId:f.context.contextId,pageSize:1};
 const old=observation(q.contextKind,q.contextId,{operationId:f.definition.operationId,executionId:f.executionId});await h.diagnostic.record(await h.auth(),write,old);
 const c=await communicationFixture(h),b={recordId:c.recordId,...c.context};await revision(f,b,2);
 const evidence=h.req('evidence',{claim:'SYNTHETIC return distinct evidence',coverage:'audit',certainty:'reviewed',source_kind:'manual'},q.contextId,'booking');await h.evidence.apply(await h.auth(),write,evidence);
 const a3={...f.context,recordId:evidence.targetId,purpose:evidence.purpose};await revision(f,a3,3);
 const shadow=await workFixture(h);await shadow.run({...shadow.definition,executionId:f.definition.operationId,context:a3,affectedRefs:[a3.recordId]});
 const state=await persisted(h);await assert.rejects(h.diagnostic.record(await h.auth(),write,observation(q.contextKind,q.contextId,{operationId:f.definition.operationId,executionId:f.definition.operationId})),/DENIED/);
 assert.equal((await h.diagnostic.record(await h.auth(),write,old)).replayed,true);assert.deepEqual(await persisted(h),state);
 const ns=await pages(h,q);assert.deepEqual(ns.filter(n=>n.source==='b08_definitions'&&n.id===f.definitionId).map(n=>n.version).sort(),[1,3]);assert.equal(JSON.stringify(ns).includes(b.recordId),false);
 const keys=ns.map(n=>n.key);assert.deepEqual((await pages(h,{...q,pageSize:100})).map(n=>n.key),keys);
 console.log('V01',JSON.stringify({operation:f.definition.operationId,owner:f.executionId,aliasExecution:f.definition.operationId,versions:[1,3],falsePairDenied:true}));
});

test('V02 repeated explicit historical lookup revalidates original and latest evidence independently',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=await communicationFixture(h),b={recordId:c.recordId,...c.context};await revision(f,b,2);await revision(f,f.context,3);await revision(f,b,4);
 const q={contextKind:'booking' as const,contextId:b.contextId,pageSize:2,reference:f.definition.operationId};
 const inspect=async()=>{const ns=await pages(h,q),op=ns.find(n=>n.source==='b07_operations'&&n.id===f.definition.operationId);assert.ok(op);assert.equal(op.historical,true);assert.equal(op.definitionVersion,1);assert.equal(op.originContextId,f.context.contextId);assert.equal(op.originContextKind,'booking');};await inspect();
 const bulk=await pages(h,{...q,reference:undefined});assert.equal(bulk.some(n=>n.id===f.definition.operationId),false);
 for(const record of [f.context.recordId,b.recordId]){await h.admin`update crm_private.b07_links set admin_scope='fifth-restricted-synthetic' where record_id=${record}::uuid`;try{assert.equal((await pages(h,q)).some(n=>n.id===f.definition.operationId),false);}finally{await h.admin`update crm_private.b07_links set admin_scope=${h.scope} where record_id=${record}::uuid`;}await inspect();}
 const stranger=await workFixture(h);await stranger.run(stranger.definition);assert.deepEqual(await pages(h,{...q,reference:stranger.definition.operationId}),[]);
 const state=await persisted(h);await assert.rejects(h.diagnostic.record(await h.auth(),write,observation('booking',b.contextId,{operationId:f.definition.operationId,executionId:f.executionId})),/DENIED/);assert.deepEqual(await persisted(h),state);
 console.log('V02',JSON.stringify({sequence:'A B A B',sourceRestrictions:2,explicitVersion:1,foreignWriteDenied:true}));
});

test('V03 service booking opportunity service keeps parent and original provenance separate',async()=>{
 const joint=await jointFixture(h,[]),row=(await h.observer`select b.opportunity_id::text opportunity,s.service_id::text service from crm_private.b04_bookings b join crm_private.b04_services s using(booking_id) where b.booking_id=${joint.bookingId}::uuid order by s.service_id limit 1`)[0]!;
 const contexts=[];for(const [kind,root]of [['booking_service',row.service],['booking',joint.bookingId],['opportunity',row.opportunity]]as const){const e=h.req('evidence',{claim:'SYNTHETIC fifth hierarchy',coverage:'audit',certainty:'reviewed',source_kind:'manual'},root,kind);await h.evidence.apply(await h.auth(),write,e);contexts.push({recordId:e.targetId,contextKind:kind,contextId:root,purpose:e.purpose});}
 const f=await workFixture(h);await f.run({...f.definition,context:contexts[0]!,affectedRefs:[contexts[0]!.recordId]});
 const first=observation('booking',joint.bookingId,{operationId:f.definition.operationId,executionId:f.executionId});await h.diagnostic.record(await h.auth(),write,first);
 await revision(f,contexts[1]!,2);const op3=await revision(f,contexts[2]!,3),third=observation('opportunity',row.opportunity,{operationId:op3.operationId,executionId:f.executionId});await h.diagnostic.record(await h.auth(),write,third);await revision(f,contexts[0]!,4);
 const state=await persisted(h);for(const o of [first,third]){assert.equal((await h.diagnostic.record(await h.auth(),write,o)).replayed,true);assert.ok((await pages(h,{contextKind:o.contextKind,contextId:o.contextId,reference:o.requestRef,pageSize:1})).some(n=>n.id===o.observationId));}assert.deepEqual(await persisted(h),state);
 const b={contextKind:'booking' as const,contextId:joint.bookingId,pageSize:1};assert.notEqual((await h.evidence.read(await h.auth(),read,contexts[2]!.recordId,'opportunity',row.opportunity)).data,null,'B07 independently authorizes the original opportunity evidence; its canonical booking relation was established above');assert.ok((await pages(h,b)).some(n=>n.id===op3.operationId));
 const historical=(await pages(h,{...b,reference:op3.operationId})).find(n=>n.source==='b07_operations'&&n.id===op3.operationId);assert.ok(historical);assert.equal(historical.historical,undefined,'Already canonical through the existing B07 relationship, not the historical expansion branch');
 assert.equal((await h.diagnostic.record(await h.auth(),write,observation('booking',joint.bookingId,{operationId:op3.operationId,executionId:f.executionId}))).replayed,false);const unrelated=await communicationFixture(h);assert.deepEqual(await pages(h,{contextKind:'booking',contextId:unrelated.context.contextId,pageSize:1,reference:op3.operationId}),[]);
 console.log('V03',JSON.stringify({sequence:['service','booking','opportunity','service'],parentReplays:2,linkedOpportunityAuthorized:true,unrelatedBookingDenied:true}));
});

for(const mode of ['operation','execution','both','event','all']as const)test('V04 V05 A B A replay event authorization concurrency and session revocation '+mode,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const external=await boundaryFixture(h,'other',f.context.contextId),cmd=external.base();await external.run(cmd);
 const refs={...(mode==='operation'||mode==='both'||mode==='all'?{operationId:f.definition.operationId}:{}),...(mode==='execution'||mode==='both'||mode==='all'?{executionId:f.executionId}:{}),...(mode==='event'||mode==='all'?{eventId:cmd.eventId}:{})};
 const o=observation('booking',f.context.contextId,refs),session=await secondWorkActor(h);
 const first=await Promise.all([h.diagnostic.record(await h.auth(),write,o),h.diagnostic.record(await session.auth(),write,o)]);assert.equal(first.filter(x=>!x.replayed).length,1);
 const c=await communicationFixture(h);await revision(f,{recordId:c.recordId,...c.context},2);assert.equal((await h.diagnostic.record(await session.auth(),write,o)).replayed,true);await revision(f,f.context,3);
 const before=await persisted(h),access=new H0005PostgresAdapter(h.runtime,h.f1,h.f2),auth=await session.auth();await access.revokeOne(auth);await assert.rejects(h.diagnostic.record(auth,write,o),/DENIED/);
 const restored=await secondWorkActor(h),same=await Promise.all(Array.from({length:4},async()=>h.diagnostic.record(await restored.auth(),write,o)));assert.ok(same.every(x=>x.replayed&&x.id===o.observationId));
 const conflict={...o,requestRef:diagnosticReference(id())};await assert.rejects(h.diagnostic.record(await restored.auth(),write,conflict),/DENIED/);assert.deepEqual(await persisted(h),before);
 if(mode==='event'||mode==='all'){await h.admin`update crm_private.b07_links set admin_scope='fifth-event-withdrawn' where record_id=${cmd.eventId}::uuid`;try{await assert.rejects(h.diagnostic.record(await h.auth(),write,o),/DENIED/);assert.equal((await pages(h,{contextKind:'booking',contextId:o.contextId,reference:o.requestRef,pageSize:1})).some(n=>n.id===o.observationId),false);}finally{await h.admin`update crm_private.b07_links set admin_scope=${h.scope} where record_id=${cmd.eventId}::uuid`;}assert.equal((await h.diagnostic.record(await h.auth(),write,o)).replayed,true);assert.deepEqual(await persisted(h),before);}
 console.log('V04 V05',JSON.stringify({mode,insertions:1,parallelReplays:4,revokedDenied:true,rowsUnchanged:true,eventRevocation:['event','all'].includes(mode)}));
});

for(const compatible of [true,false])test('V06 delayed canonical confirmation after return '+compatible,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const op=id(),o=observation('booking',f.context.contextId,{operationId:op,executionId:f.executionId});await h.diagnostic.record(await h.auth(),write,o);
 const c=await communicationFixture(h);await revision(f,{recordId:c.recordId,...c.context},2);await revision(f,f.context,3);
 const other=await workFixture(h);await other.run({...other.definition,context:f.context,affectedRefs:[f.context.recordId]});const owner=compatible?f:other;await owner.run({...owner.claim(),operationId:op});
 const state=await persisted(h),ns=await pages(h,{contextKind:'booking',contextId:o.contextId,reference:o.requestRef,pageSize:1});
 if(compatible){assert.equal((await h.diagnostic.record(await h.auth(),write,o)).replayed,true);assert.equal(ns.find(n=>n.id===o.observationId)?.operationReferenceState,'canonical');}else{await assert.rejects(h.diagnostic.record(await h.auth(),write,o),/DENIED/);assert.equal(ns.some(n=>n.id===o.observationId),false);}assert.deepEqual(await persisted(h),state);
 console.log('V06',JSON.stringify({compatible,lateOwner:owner.executionId,observedExecution:f.executionId,originalUnchanged:true}));
});

test('V07 foreign task evidence execution operation and matching record UUID remain scoped',async()=>{
 const a=await workFixture(h),b=await workFixture(h);await a.run(a.definition);await b.run(b.definition);
 const task=(await h.observer`select task_id::text id from crm_private.b08_executions where execution_id=${a.executionId}::uuid`)[0]!.id;await revision(a,b.context,2);
 const q={contextKind:'booking' as const,contextId:b.context.contextId,pageSize:1};const ns=await pages(h,q);assert.equal(JSON.stringify(ns).includes(task),false);assert.equal(JSON.stringify(ns).includes(a.context.recordId),false);
 const stranger=await workFixture(h);await stranger.run(stranger.definition);const before=await persisted(h);
 for(const refs of [{executionId:stranger.executionId},{operationId:stranger.definition.operationId},{eventId:stranger.context.recordId},{operationId:a.definition.operationId,executionId:a.executionId}])await assert.rejects(h.diagnostic.record(await h.auth(),write,observation(q.contextKind,q.contextId,refs)),/DENIED/);
 for(const ref of [task,stranger.context.recordId,stranger.executionId,stranger.definition.operationId])assert.deepEqual(await pages(h,{...q,reference:ref}),[]);
 assert.deepEqual(await persisted(h),before);console.log('V07',JSON.stringify({foreignReferencesDenied:4,foreignLookupsEmpty:4,taskNotTransferred:true}));
});
