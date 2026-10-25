// Identified H6-016 derivative of published H5-019; dynamic exclusive port/label only.
import {unusedPort}from '../support/h6-016-foundation.ts';
import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {fifthDatabase,observation,read,write} from '../support/h5-018-fifth-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
let h:Awaited<ReturnType<typeof fifthDatabase>>;
before(async()=>{h=await fifthDatabase('h6016_antecedent_h5019_'+process.pid,await unusedPort());});
after(async()=>{await h?.close();});
test('H5-019 I01 chain68 T08 T09 approval claim uncertainty diagnostic and denied retry',async()=>{
 const f=await workFixture(h);await f.run(f.definition);
 assert.equal((await f.see())!.attempts.length,0);
 const c=f.claim(),claimed=await f.run(c);assert.equal(claimed.state,'claimed');
 await f.run(f.start(c,claimed.generation!));
 await f.run({...f.base(),action:'result',attemptId:c.attemptId,outcome:'uncertain',resultRef:'SYNTHETIC lost provider result'});
 const s=(await f.see())!;assert.equal(s.parts[0].state,'uncertain');assert.equal(s.attempts.length,1);
 await f.run({...f.base(),action:'recover'});const before=await f.see();
 await assert.rejects(f.run(f.claim()));assert.deepEqual(await f.see(),before);
 const o=observation('booking',f.context.contextId,{operationId:f.definition.operationId,executionId:f.executionId});
 await h.diagnostic.record(await h.auth(),write,o);
 const d=await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:f.context.contextId,pageSize:100});
 assert.ok(d.nodes.some(n=>n.id===o.observationId));assert.deepEqual(await f.see(),before);
});
test('H5-019 I02 chain68 T10 three assessments founded invalidation history and independent root',async()=>{
 const f=await jointFixture(h),other=await jointFixture(h);
 await f.j.run(await f.j.command());await other.j.run(await other.j.command());
 const prior=await f.j.c.view(),independent=await other.j.c.view();assert.equal(prior.jointClosure.current,true);
 const i=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id});
 await h.incidents.apply(await h.auth(),write,await i.command('detect',{...i.data,severity:'Importante',impact:{...i.impact,effect:'economic-review'}}));
 const v=await f.j.c.view();assert.equal(v.jointClosure.current,false);assert.equal(v.assessments.economic!.currentStatus,'Pendiente');
 assert.equal(v.assessments.commercial!.currentStatus,'Resuelto');assert.equal(v.assessments.operational!.currentStatus,'Resuelto');
 assert.deepEqual(v.jointClosure.history,prior.jointClosure.history);assert.deepEqual(await other.j.c.view(),independent);
 // Evidence registration for the attempted command precedes the snapshot.
 const q=await f.j.command(),before=await f.j.c.view();await assert.rejects(f.j.run(q),/DIMENSION_PENDING/);assert.deepEqual(await f.j.c.view(),before);
});
test('H5-019 I03 chain68 C01 C04 C06 calendar duplicate conflict and projections leave canonical facts intact',async()=>{
 const f=await jointFixture(h),b=await boundaryFixture(h,'calendar',f.bookingId),q=b.base();
 const snapshot=async()=>({closure:await f.j.c.view(),services:await h.observer`select to_jsonb(x) row from crm_private.b04_services x order by service_id`,nights:await h.observer`select to_jsonb(x) row from crm_private.b04_nights x order by night_id`});
 const before=await snapshot();await b.run(q);await b.run(q);await assert.rejects(b.run({...q,material:{amount:'101.00',currency:'EUR'}}));
 const reader=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);
 for(const surface of ['calendar','timeline'] as const){const p=await reader.read(await h.auth(),read,{contextKind:'booking',contextId:f.bookingId,surface,destination:'administrator'});assert.ok(p);assert.equal(p.mutationAuthority,false);}
 assert.deepEqual(await snapshot(),before);
});
