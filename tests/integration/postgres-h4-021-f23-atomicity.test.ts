import {test}from'node:test';import assert from'node:assert/strict';
import {isolatedPreparation,read,write}from'../support/h4-booking-preparation-isolated.ts';
import {preparationFixture}from'../support/h4-booking-preparation-fixtures.ts';
import {cancelFixture,businessSnapshot}from'../support/h4-booking-preparation-f23-fixtures.ts';
import {H4020BookingPreparationAdapter}from'../../src/infrastructure/postgres/h4-booking-preparation-adapter.ts';
test('F23 C13/C14 actual writes and COMMIT rollback complete including legitimate cancellation',async t=>{const h=await isolatedPreparation('crm_f23_atomic',58302);try{
 for(const point of ['evaluation','operation','commit','tte-commit','cancel-version','cancel-commit'])await t.test(point,async()=>{
  const f=await preparationFixture(h);await f.confirm();await f.pay();const q=await f.command('evaluate',point==='tte-commit'?{origin:'ai'}:{}),a=point==='tte-commit'?await f.approval(q):null,c=point.startsWith('cancel')?await cancelFixture(h,f):null,cq=c?await c.command():null;
  const before=await businessSnapshot(h),table=point==='evaluation'?'b04_preparation_evaluations':point==='cancel-version'?'b04_operational_versions':point==='cancel-commit'?'b06_modification_revisions':'b04_preparation_operations',deferred=point.includes('commit');
  const condition=point==='cancel-version'?`new.booking_id='${f.bid}'::uuid and new.scope_kind='booking'`:point==='cancel-commit'?`new.modification_id='${c!.m.modificationId}'::uuid`:`new.booking_id='${f.bid}'::uuid`;
  await h.migration.unsafe(`create function crm_private.f23_fault()returns trigger language plpgsql set search_path=pg_catalog,pg_temp as $$begin if ${condition} then raise exception 'F23_TECHNICAL_${point}'using errcode='23514';end if;return new;end$$;${deferred?'create constraint trigger f23_fault after insert':'create trigger f23_fault before insert'} on crm_private.${table} ${deferred?'deferrable initially deferred':''} for each row execute function crm_private.f23_fault()`);
  try{await assert.rejects(c?c.m.run(cq!):a?a.execute():f.run(q));assert.deepEqual(await businessSnapshot(h),before);if(a)assert.equal((await h.observer`select count(*)n from crm_ha.reservations where reservation_id=${a.reserve}`)[0]!.n,'0');console.log('F23 ACTUAL ROLLBACK',point,JSON.stringify({bookingId:f.bid,completeSnapshotEqual:true,phase:(await f.see())!.phase}));}finally{await h.migration.unsafe(`drop trigger f23_fault on crm_private.${table};drop function crm_private.f23_fault()`);}
  if(c){await c.m.run(cq!);await c.applied();assert.equal((await f.see())!.phase,'Cancelada');}else{if(a)await a.execute();else await f.run(q);assert.equal((await f.see())!.phase,'Confirmada operativamente');}
 });
}finally{await h.close();}});
test('F23 C15 actual commit lost response then legitimate cancellation and reauthorized durable recovery',async()=>{const h=await isolatedPreparation('crm_f23_lost',58303);try{
 const f=await preparationFixture(h);await f.confirm();await f.pay();const q=await f.command();let committed=false;
 const lost=new H4020BookingPreparationAdapter({begin:async(options:any,work:any)=>{await h.runtime.begin(options,work);committed=true;throw new Error('F23_RESPONSE_DISCARDED_AFTER_ACTUAL_COMMIT');}}as unknown as typeof h.runtime,h.f1,h.f2);
 await assert.rejects(lost.apply(await h.auth(),write,q));assert.equal(committed,true);const c=await cancelFixture(h,f);await c.applyAll();await c.applied();const before=await businessSnapshot(h),r=await f.run(q);assert.equal(r.replayed,true);assert.equal(r.result.phase,'Confirmada operativamente');assert.equal((await f.see())!.phase,'Cancelada');assert.deepEqual(await businessSnapshot(h),before);
 const current=(await f.see())!.phase,auth=await h.auth();await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,false,'ready')`;try{await assert.rejects(h.preparation.apply(auth,write,q));assert.deepEqual(await businessSnapshot(h),before);}finally{await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,true,'ready')`;}
 console.log('F23 LOST RESPONSE RECOVERY',JSON.stringify({bookingId:f.bid,committed,replayed:r.replayed,historical:r.result.phase,current,disabledDenied:true}));
}finally{await h.close();}});
