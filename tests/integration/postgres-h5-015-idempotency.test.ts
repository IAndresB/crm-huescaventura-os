import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedJointClosures,write} from '../support/h5-joint-closure-isolated.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {secondWorkActor} from '../support/h5-work-isolated.ts';
import {H5013ClosureAdapter} from '../../src/infrastructure/postgres/h5-closure-adapter.ts';
test('H5-015 J06 concurrent operation identity reused across Bookings returns E2 without partial writes',async()=>{
 const h=await isolatedJointClosures('h5015identity',59538),guard=h.connect('crm_h0_migration'),monitor=h.connect('crm_h0_migration'),runtime=h.connect('crm_h0_runtime');
 let release=()=>{};let gate:Promise<unknown>|undefined,one:Promise<unknown>|undefined;
 try{
  const a=await jointFixture(h),b=await jointFixture(h),q=await a.j.command(),q2=await b.j.command({operationId:q.operationId}),second=await secondWorkActor(h),adapter=new H5013ClosureAdapter(runtime,h.f1,h.f2);
  let ready!:()=>void;const acquired=new Promise<void>(r=>{ready=r;}),held=new Promise<void>(r=>{release=r;});
  gate=guard.begin(async tx=>{await tx`select pg_advisory_xact_lock(7605015)`;ready();await held;});await acquired;
  await h.admin.unsafe(`create function crm_private.h5015_identity_gate()returns trigger language plpgsql as $$begin if new.booking_id='${a.bookingId}'::uuid then perform pg_advisory_xact_lock(7605015);end if;return new;end$$`);
  await h.admin.unsafe('create trigger h5015_identity_gate before insert on crm_private.b06_joint_closures for each row execute function crm_private.h5015_identity_gate()');
  one=a.j.run(q);one.catch(()=>{});
  const until=Date.now()+10000;while(Number((await monitor`select count(*) n from pg_locks where locktype='advisory' and objid=7605015 and not granted`)[0]!.n)!==1){if(Date.now()>until)throw new Error('IDENTITY_GATE_NOT_REACHED');await new Promise(r=>setTimeout(r,10));}
  await adapter.close(await second.auth(),write,q2);release();await gate;await assert.rejects(one,/REPLAY_CONFLICT:E2/);
  assert.equal((await a.j.c.view()).jointClosure.history.length,0);assert.equal((await b.j.c.view()).jointClosure.history.length,1);
 }finally{release();await gate;await Promise.allSettled([one]);await Promise.all([guard.end({timeout:1}),monitor.end({timeout:1}),runtime.end({timeout:1})]);await h.close();}
});
