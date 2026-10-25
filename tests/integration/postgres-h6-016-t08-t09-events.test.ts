// Event receipt T09 on all68 migrations and current application-created Booking context.
import {before,after,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedWork,boundaryFixture,secondWorkActor,read,write,capture,preserveBookings} from '../support/h6-016-t08-t09.ts';
import {H5009ExternalEventAdapter} from '../../src/infrastructure/postgres/h5-external-event-adapter.ts';
let h:Awaited<ReturnType<typeof isolatedWork>>;
before(async()=>{h=await isolatedWork('h6016_event_author_'+process.pid);});after(async()=>{await h?.close();});afterEach(async()=>{await preserveBookings(h);await h?.closeExecutors();});
const material=async(x:Awaited<ReturnType<typeof boundaryFixture>>,recordId:string)=>h.observer`select record_kind,material,occurred_at from crm_private.b07_records where record_id=${recordId}::uuid`;
test("H5-009 B07 event receipt, duplicate and E2 conflict preserve canonical event",async()=>{
 const f=await boundaryFixture(h),first=f.base(),applied=await f.run(first);assert.equal(applied.state,"applied");
 const replay=await f.run(first);assert.equal(replay.replayed,true);assert.equal(replay.id,first.eventId);
 const repeat={...first,operationId:uid(),eventId:uid(),sourceRef:"fixture:redelivery"},duplicate=await f.run(repeat);
 assert.equal(duplicate.state,"duplicate");assert.equal(duplicate.id,first.eventId);
 const conflict=await f.run({...first,operationId:uid(),eventId:uid(),material:{amount:"101.00",currency:"EUR"}});
 assert.equal(conflict.state,"conflict");assert.equal(conflict.code,"E2");assert.equal(conflict.id,first.eventId);
 const receipts=await h.observer`select receipt_state,raw_material,raw_event,source_ref from crm_private.b09_event_receipts where source_id=${f.sourceId}::uuid order by received_at`;
 assert.deepEqual(receipts.map(x=>x.receipt_state),["applied","duplicate","conflict"]);
 assert.equal(receipts[2]!.raw_material.payload.amount,"101.00");assert.equal(receipts[1]!.raw_event.target_id,repeat.eventId);
 assert.equal(receipts[1]!.source_ref,"fixture:redelivery");assert.equal((await material(f,first.eventId)).length,1);
});

test("H5-009 B09 receipt trigger rollback is atomic across B07 original and key; retry succeeds",async()=>{
 const f=await boundaryFixture(h),input=f.base();
 const counts=async()=>({records:(await h.observer`select count(*)::int n from crm_private.b07_records`)[0]!.n,
  operations:(await h.observer`select count(*)::int n from crm_private.b07_operations`)[0]!.n,
  history:(await h.observer`select count(*)::int n from crm_private.b07_history`)[0]!.n,
  keys:(await h.observer`select count(*)::int n from crm_private.b09_external_event_keys`)[0]!.n,
  receipts:(await h.observer`select count(*)::int n from crm_private.b09_event_receipts`)[0]!.n});
 const tables=['b07_records','b07_operations','b07_history','b09_external_event_keys','b09_event_receipts'];
 const exactRows=async()=>{const out:Record<string,unknown>={};for(const table of tables)out[table]=Array.from(await h.admin.unsafe(`select to_jsonb(x) value from crm_private.${table} x order by to_jsonb(x)::text`));return out;};
 const before=await counts(),beforeRows=await exactRows();await h.admin.unsafe("create sequence crm_private.h6016_event_fault_witness;create function crm_private.h5009_fail() returns trigger language plpgsql security definer set search_path=pg_catalog,pg_temp as $$begin perform nextval('crm_private.h6016_event_fault_witness');raise exception 'H5009_INJECTED';end$$");
 await h.admin.unsafe("create trigger h5009_fail before insert on crm_private.b09_event_receipts for each row execute function crm_private.h5009_fail()");
 try{await assert.rejects(f.run(input),{message:'BOUNDARY_DENIED'});assert.equal((await h.admin`select is_called from crm_private.h6016_event_fault_witness`)[0]!.is_called,true,'B09 receipt fault reached');}finally{await h.admin.unsafe("drop trigger h5009_fail on crm_private.b09_event_receipts;drop function crm_private.h5009_fail();drop sequence crm_private.h6016_event_fault_witness");}
 assert.deepEqual(await counts(),before);assert.deepEqual(await exactRows(),beforeRows);assert.equal((await material(f,input.eventId)).length,0);
 assert.equal((await f.run(input)).state,"applied");assert.equal((await counts()).records,before.records+1);
 await capture('event-rollback-witness',{bookingId:f.contextId,triggerReached:true,injectedMessage:'H5009_INJECTED',publicWrapper:'BOUNDARY_DENIED',tablesPreservedExactly:tables,retry:'applied',originalEventAbsentAfterRollback:true});
});

for(const order of [0,1])test(`H6016 T09 real event root competition absent child both material cases order ${order}`,async()=>{
 for(const conflict of [false,true]){
  const f=await boundaryFixture(h),one=f.base(),two={...f.base(),material:{amount:conflict?'101.00':'100.00',currency:'EUR'}},commands=order?[two,one]:[one,two];
  const other=h.connect('crm_h0_runtime'),guard=h.connect('h2_bootstrap'),monitor=h.connect('h2_bootstrap'),second=new H5009ExternalEventAdapter(other,h.f1,h.f2),actor=await secondWorkActor(h);
  const actors=[await h.auth(),await actor.auth()],adapters=[h.boundaries,second];
  assert.equal((await h.observer`select count(*)::int n from crm_private.b09_external_event_keys where source_id=${f.sourceId}::uuid`)[0]!.n,0);
  const key='b09-key:'+h.scope+':'+f.sourceId+':booking:'+f.contextId+':'+f.coverage+':'+one.externalKey;
  let release!:()=>void,entered!:()=>void;const ready=new Promise<void>(r=>entered=r),unlock=new Promise<void>(r=>release=r);
  const holder=guard.begin(async tx=>{await tx`select pg_advisory_xact_lock(hashtextextended(${key},0))`;entered();await unlock;});await ready;
  const jobs:Promise<any>[]=[];let locks:any[]=[];let failure:any;
  const wait=async(n:number)=>{for(let i=0;i<200;i++){const rows=await monitor`select pid,wait_event_type,wait_event,pg_blocking_pids(pid) blockers from pg_stat_activity where usename='crm_h0_runtime' and wait_event_type='Lock' and query like '%b09_external_event_apply%'`;if(rows.length>=n)return Array.from(rows);await new Promise(r=>setTimeout(r,15));}throw new Error('H6016_EVENT_REAL_LOCK_NOT_OBSERVED');};
  try{jobs.push(adapters[0]!.receive(actors[0]!,write,commands[0]!));jobs[0]!.catch(()=>{});await wait(1);jobs.push(adapters[1]!.receive(actors[1]!,write,commands[1]!));jobs[1]!.catch(()=>{});locks=await wait(2);}catch(e){failure=e;}finally{release();await holder;}
  const results=await Promise.allSettled(jobs);await Promise.all([other.end({timeout:1}),guard.end({timeout:1}),monitor.end({timeout:1})]);if(failure)throw failure;
  assert.equal(locks.length,2);assert.notEqual(locks[0].pid,locks[1].pid);assert.ok(results.every(x=>x.status==='fulfilled'));const values=results.map(x=>(x as PromiseFulfilledResult<any>).value);
  assert.equal(values[0].state,'applied');assert.equal(values[1].state,conflict?'conflict':'duplicate');assert.equal(values[0].id,commands[0]!.eventId);assert.equal(values[1].id,commands[0]!.eventId);
  assert.equal((await h.observer`select count(*)::int n from crm_private.b09_external_event_keys where source_id=${f.sourceId}::uuid`)[0]!.n,1);
  const receipts=await h.observer`select receipt_state,raw_material,received_event_id::text from crm_private.b09_event_receipts where source_id=${f.sourceId}::uuid order by received_at`;
  assert.equal(receipts.length,2);assert.equal((await material(f,commands[0]!.eventId)).length,1);assert.equal((await material(f,commands[1]!.eventId)).length,0);
  await capture('event-race-'+order+'-'+conflict,{order,conflict,bookingId:f.contextId,initialChildren:0,locks,results:values,receipts});
 }
});
