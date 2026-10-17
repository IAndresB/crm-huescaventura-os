import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {isolatedDiagnosticsF,all,observation,revise,saved,read,write} from '../support/h5-diagnostic-f-isolated.ts';
import {workFixture,secondWorkActor} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import type {DiagnosticObservation} from '../../src/domain/operation-diagnostic.ts';
let h:Awaited<ReturnType<typeof isolatedDiagnosticsF>>;
before(async()=>{h=await isolatedDiagnosticsF('freplay',60202);});after(async()=>{await h?.close();});
const state=async()=>({observations:await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x order by observation_id`,history:await h.observer`select to_jsonb(x) row from crm_private.b07_history x order by history_id`,operations:await h.observer`select to_jsonb(x) row from crm_private.b07_operations x order by operation_id`});

for(const mode of ['operation','execution','both','none']as const)test('F-R01 exact replay conflicts and concurrent duplicates '+mode,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=observation('booking',f.context.contextId,mode==='operation'||mode==='both'?f.definition.operationId:undefined,mode==='execution'||mode==='both'?f.executionId:undefined);
 const first=await Promise.all([1,2].map(async()=>h.diagnostic.record(await h.auth(),write,o)));assert.equal(first.filter(x=>!x.replayed).length,1);assert.ok(first.every(x=>x.id===o.observationId));const original=await saved(h,o);
 const comm=await communicationFixture(h);await revise(f,{recordId:comm.recordId,...comm.context},2);
 const before=await state();const repeated=await Promise.all(Array.from({length:6},async()=>h.diagnostic.record(await h.auth(),write,o)));assert.ok(repeated.every(x=>x.replayed&&x.id===o.observationId));
 const conflicts:DiagnosticObservation[]=[{...o,requestRef:diagnosticReference(id())},{...o,issues:[semanticIssue('E3','dependency')]},{...o,outcome:'rejected',issues:[semanticIssue('E3','dependency')]},{...o,operationId:id()},{...o,executionId:id()},{...o,eventId:id()},{...o,contextId:comm.context.contextId}];
 const race=await Promise.allSettled([h.diagnostic.record(await h.auth(),write,o),...await Promise.all(conflicts.map(async c=>{const auth=await h.auth();return {auth,c};})).then(xs=>xs.map(x=>h.diagnostic.record(x.auth,write,x.c)))]);
 assert.equal(race[0]!.status,'fulfilled');assert.ok(race.slice(1).every(x=>x.status==='rejected'));
 if(mode!=='none')await assert.rejects(h.diagnostic.record(await h.auth(),write,{...o,observationId:id()}),/DENIED/);
 assert.deepEqual(await state(),before);assert.deepEqual(await saved(h,o),original);
 console.log('F-R01 replay',JSON.stringify({mode,firstWrites:1,parallelReplays:6,conflictsRejected:conflicts.length,sideEffects:0}));
});

test('F-R02 historical replay reauthorizes sessions and requires the original actor',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=observation('booking',f.context.contextId,f.definition.operationId,f.executionId);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);const c=await communicationFixture(h);await revise(f,{recordId:c.recordId,...c.context},2);
 const access=new H0005PostgresAdapter(h.runtime,h.f1,h.f2),session=await secondWorkActor(h),auth=await session.auth();await access.revokeOne(auth);await assert.rejects(h.diagnostic.record(auth,write,o),/DENIED/);
 const fresh=await secondWorkActor(h);assert.equal((await h.diagnostic.record(await fresh.auth(),write,o)).replayed,true);
 // D025's singleton actor is a real precondition; do not invent a second admin.
 const subject=id(),actor=id();await assert.rejects(h.migration`select crm_api.provision_actor_mapping(${actor}::uuid,${subject}::uuid,${h.scope})`,/F2_DENIED/);
 const other=await verifyAuth({verify:async()=>({subject,passwordVerified:true,mfaVerified:true})},id());await assert.rejects(access.establish(other),/DENIED/);
 await assert.rejects(h.diagnostic.record(other,write,o),/DENIED|SESSION/);assert.deepEqual(await saved(h,o),original);
});

for(const sameRoot of [true,false])test('F-R03 late canonical ownership cannot turn stored intent into authorized replay '+sameRoot,async()=>{
 const a=await workFixture(h),b=await workFixture(h);await a.run(a.definition);await b.run(sameRoot?{...b.definition,context:a.context,affectedRefs:[a.context.recordId]}:b.definition);
 const op=id(),o=observation('booking',a.context.contextId,op,a.executionId);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);assert.equal((await h.diagnostic.record(await h.auth(),write,o)).replayed,true);
 await b.run({...b.claim(),operationId:op});await assert.rejects(h.diagnostic.record(await h.auth(),write,o),/DENIED/);
 assert.equal((await all(h,{contextKind:'booking',contextId:o.contextId,reference:o.requestRef,pageSize:100})).some(n=>n.id===o.observationId),false);assert.deepEqual(await saved(h,o),original);
});

// Synthetic source perturbation, not an invented ordinary evidence-revocation API.
for(const mode of ['operation','execution','event']as const)test('F-R04 historical replay checks current source authorization '+mode,async()=>{
 const f=await workFixture(h);await f.run(f.definition);let evidence:string=f.context.recordId,eventId:string|undefined;
 if(mode==='event'){const b=await boundaryFixture(h,'other',f.context.contextId),cmd=b.base();await b.run(cmd);eventId=cmd.eventId;evidence=eventId;}
 const o=observation('booking',f.context.contextId,mode==='operation'?f.definition.operationId:undefined,mode==='execution'?f.executionId:undefined,eventId);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);
 const c=await communicationFixture(h);await revise(f,{recordId:c.recordId,...c.context},2);assert.equal((await h.diagnostic.record(await h.auth(),write,o)).replayed,true);
 await h.admin`update crm_private.b07_links set admin_scope='F-synthetic-source-restricted' where record_id=${evidence}::uuid`;
 try{await assert.rejects(h.diagnostic.record(await h.auth(),write,o),/DENIED/);assert.equal((await all(h,{contextKind:'booking',contextId:o.contextId,reference:o.requestRef,pageSize:100})).some(n=>n.id===o.observationId),false);}
 finally{await h.admin`update crm_private.b07_links set admin_scope=${h.scope} where record_id=${evidence}::uuid`;}
 assert.equal((await h.diagnostic.record(await h.auth(),write,o)).replayed,true);assert.deepEqual(await saved(h,o),original);
});

for(const existing of [false,true])test('F-R05 revision while waiting for observation identity rechecks write versus replay '+existing,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=observation('booking',f.context.contextId,f.definition.operationId,f.executionId);
 if(existing)await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);
 const c=await communicationFixture(h),context={recordId:c.recordId,...c.context},material={...f.material,content:'SYNTHETIC preapproved concurrent revision'},approval=await f.approve(material);
 const command={...f.definition,...f.base(),action:'revise' as const,version:2,context,material,...approval,affectedRefs:[context.recordId]};
 const lock=await h.observer.reserve();let result:Promise<PromiseSettledResult<unknown>[]>|undefined;
 try{
  await lock`begin`;await lock`select pg_advisory_xact_lock(hashtextextended(${o.observationId},17017))`;
  result=Promise.allSettled([h.diagnostic.record(await h.auth(),write,o)]);
  let blocked=false;for(let i=0;i<100;i++){blocked=(await h.admin`select exists(select 1 from pg_stat_activity where datname=current_database() and wait_event='advisory') ok`)[0]!.ok;if(blocked)break;await new Promise(r=>setTimeout(r,20));}
  assert.equal(blocked,true);await f.run(command);await lock`commit`;
  const [outcome]=await result;assert.equal(outcome!.status,existing?'fulfilled':'rejected');if(outcome!.status==='fulfilled')assert.deepEqual(outcome.value,{id:o.observationId,replayed:true});
  assert.deepEqual(await saved(h,o),original);console.log('F-R05 ordered revision',JSON.stringify({existing,blockedBeforeRevision:true,result:outcome!.status}));
 }finally{await lock`rollback`;lock.release();if(result)await result;}
});
