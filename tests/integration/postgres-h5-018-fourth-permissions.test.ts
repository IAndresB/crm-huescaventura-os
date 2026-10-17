import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fourthDatabase,all,observation,revise,saved,read,write} from '../support/h5-018-fourth-isolated.ts';
import {workFixture,secondWorkActor} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';

// Q04 uses actual B01 session revocation and a newly established session.
// No permission rows are edited, and no revoked session is resurrected.
for(const mode of ['one','all'] as const)test('Q04 authorized revocation and fresh identification protect parent history and optional references '+mode,async()=>{
 const h=await fourthDatabase('fourthperm'+mode,59981);
 try{
  const f=await workFixture(h),joint=await jointFixture(h,[]);
  const row=(await h.observer`select service_id::text service from crm_private.b04_services where booking_id=${joint.bookingId}::uuid limit 1`)[0]!;
  const e=h.req('evidence',{claim:'SYNTHETIC fourth permission source',coverage:'fourth',certainty:'reviewed',source_kind:'manual'},row.service,'booking_service');await h.evidence.apply(await h.auth(),write,e);
  const context={recordId:e.targetId,contextKind:'booking_service',contextId:row.service,purpose:e.purpose};await f.run({...f.definition,context,affectedRefs:[e.targetId]});
  const event=await boundaryFixture(h,'other',joint.bookingId),eventCommand=event.base();await event.run(eventCommand);
  const o=observation('booking',joint.bookingId,f.definition.operationId,f.executionId,eventCommand.eventId);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);
  const q={contextKind:'booking' as const,contextId:joint.bookingId,reference:o.requestRef,pageSize:2};assert.ok((await all(h,q)).some(n=>n.id===o.observationId));
  const dest=await communicationFixture(h),newContext={recordId:dest.recordId,...dest.context};await revise(f,newContext,2);
  assert.ok((await all(h,q)).some(n=>n.id===o.observationId));
  const current=observation('booking',newContext.contextId,undefined,f.executionId);await h.diagnostic.record(await h.auth(),write,current);
  const auth=await h.auth(),other=await secondWorkActor(h),access=new H0005PostgresAdapter(h.runtime,h.f1,h.f2);
  if(mode==='one')await access.revokeOne(auth);else await access.revokeAll(auth);
  await assert.rejects(h.diagnostic.read(auth,read,q),/DENIED/);
  await assert.rejects(h.diagnostic.record(auth,write,current),/DENIED/);
  await assert.rejects(h.evidence.read(auth,read,e.targetId,'booking_service',row.service),/DENIED/);
  await assert.rejects(h.evidence.read(auth,read,eventCommand.eventId,'booking',joint.bookingId),/DENIED/);
  await assert.rejects(f.worker.read(auth,read,f.executionId,newContext),/DENIED/);
  if(mode==='all')await assert.rejects(h.diagnostic.read(await other.auth(),read,q),/DENIED/);
  else assert.ok((await all(h,q,other.auth)).some(n=>n.id===o.observationId));
  const fresh=await secondWorkActor(h);assert.notEqual(fresh.sessionId,auth.sessionId);
  assert.ok((await all(h,q,fresh.auth)).some(n=>n.id===o.observationId));
  assert.notEqual((await h.evidence.read(await fresh.auth(),read,e.targetId,'booking_service',row.service)).data,null);
  assert.notEqual((await h.evidence.read(await fresh.auth(),read,eventCommand.eventId,'booking',joint.bookingId)).data,null);
  await f.worker.read(await fresh.auth(),read,f.executionId,newContext);
  assert.equal((await h.diagnostic.record(await fresh.auth(),write,current)).replayed,true);
  await assert.rejects(h.diagnostic.read(auth,read,q),/DENIED/);
  assert.deepEqual(await saved(h,o),original);
  console.log('Q04 actual transitions',JSON.stringify({mode,revocation:'production B01 adapter',restoration:'new identified session',oldSessionStillDenied:true,protected:['evidence','event','operation','execution','observation','parent','child','metadata','links'],originalPreserved:true}));
 }finally{await h.close();}
});

test('Q04 exact historical observation replay remains authorized after revision and new session',async()=>{
 const h=await fourthDatabase('fourthreplay',59982);
 try{
  const f=await workFixture(h);await f.run(f.definition);const o=observation('booking',f.context.contextId,f.definition.operationId,f.executionId);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);
  assert.equal((await h.diagnostic.record(await h.auth(),write,o)).replayed,true);
  const dest=await communicationFixture(h);await revise(f,{recordId:dest.recordId,...dest.context},2);
  const fresh=await secondWorkActor(h),q={contextKind:'booking' as const,contextId:o.contextId,reference:o.requestRef,pageSize:100};assert.ok((await all(h,q,fresh.auth)).some(n=>n.id===o.observationId));
  let result:unknown,error:string|undefined;try{result=await h.diagnostic.record(await fresh.auth(),write,o);}catch(e){error=String(e);}
  assert.deepEqual(await saved(h,o),original);
  console.log('Q04 historical replay',JSON.stringify({observation:o.observationId,operation:o.operationId,execution:o.executionId,historicalReadAuthorized:true,originalPreserved:true,result,error}));
  assert.equal(error,undefined,'Plan7.1/V-AT: equivalent authorized replay returns its persisted result, without requiring a new current-context write');
  assert.equal((result as {replayed:boolean}).replayed,true);
 }finally{await h.close();}
});
