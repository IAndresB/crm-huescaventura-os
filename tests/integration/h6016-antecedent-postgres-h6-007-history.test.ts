// Identified H6-016 derivative of sealed H6-007; assertions unchanged, own helper/labels only.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {database,fixture,read,write,businessSnapshot} from '../support/h6-016-foundation.ts';
import {H1003ResolutionAdapter} from '../../src/infrastructure/postgres/h1-resolution-adapter.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
test('H6-007 H01 archived identity context recovers original Booking and closure history',async()=>{
 const h=await database('h6016_antecedent_h7_history_'+process.pid);
 try{
  const f=await fixture(h),id=f.b.f.accepterId,before=await f.j.c.view(),resolver=new H1003ResolutionAdapter(h.runtime,h.f1,h.f2),projection=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);
  const code=(await h.observer`select human_code from crm_private.identity_codes where target_id=${f.bookingId}::uuid`)[0]!.human_code;
  const act=async(action:'archive'|'restore')=>resolver.apply(await h.auth(),write,{action,targetId:id,kind:'contact',operationId:uid(),expectedVersion:Number((await h.observer`select version from crm_private.identity_entities where identity_id=${id}::uuid`)[0]!.version),sourceRef:'SYNTHETIC contextual archive decision',evidenceRef:'SYNTHETIC explicit human decision',reason:'SYNTHETIC preserve recoverable history; no erasure'});
  const query={contextKind:'contact' as const,contextId:id,surface:'timeline' as const,destination:'administrator' as const};
  await act('archive');assert.equal(await projection.read(await h.auth(),read,query),null);const pure=await businessSnapshot(h);
  const recovered=await projection.read(await h.auth(),read,{...query,includeArchived:true});assert.ok(recovered);assert.equal(recovered.mutationAuthority,false);
  const entries=recovered.entries as any[];assert.ok(entries.some(e=>e.source==='crm_private.b04_bookings'&&e.data.booking_id===f.bookingId));assert.ok(entries.some(e=>e.source==='crm_private.identity_history'));assert.ok(entries.some(e=>e.source==='crm_private.identity_codes'&&e.data.human_code===code));
  assert.deepEqual(await businessSnapshot(h),pure);assert.deepEqual((await f.j.c.view()).jointClosure,before.jointClosure);assert.equal((await f.j.c.view()).jointClosure.current,true);
  await act('restore');assert.ok(await projection.read(await h.auth(),read,query));assert.equal((await h.observer`select human_code from crm_private.identity_codes where target_id=${f.bookingId}::uuid`)[0]!.human_code,code);assert.deepEqual((await f.j.c.view()).jointClosure.history,before.jointClosure.history);
 }finally{await h.close();}
});
