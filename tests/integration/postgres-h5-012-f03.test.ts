// F03: original audit assertion retained, strengthened against the corrected candidate.
// C01/C02/H08: current calendar must distinguish an approved night cancellation.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {isolatedBoundaries,read,write} from '../support/h5-boundary-isolated.ts';
import {quantityFixture} from '../support/h2-quantities-fixtures.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {confirmationFixture} from '../support/h4-confirmation-fixtures.ts';
import {modificationFixture} from '../support/h4-modification-fixtures.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';

test('H5-012 independent audit: approved night cancellation remains distinguishable in current calendar',async()=>{
 const h=await isolatedBoundaries('h512f03',59455);
 try{
  for(const name of ['20261014003559_h5_authorized_projections.sql','20261015172843_h5_calendar_current_nights.sql','20261015180420_h5_projection_canonical_revisions.sql','20261015190418_h5_calendar_night_operational_state.sql'])await h.migration.unsafe(await readFile('supabase/migrations/'+name,'utf8'));
  const fallback=await invoiceFixture(h),n=await quantityFixture(h);await h.booking.apply(await h.auth(),write,n.q);
  const shared={...fallback,bookingId:n.q.bookingId,b:{...fallback.b,q:n.q,detail:n.detail}},f=await confirmationFixture(h,shared,2),m=await modificationFixture(h,f);
  const service=n.detail.services[2]!,night=service.nights[0]!,sibling=service.nights[1]!;
  const reader=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);
  const query={contextKind:'booking' as const,contextId:n.q.bookingId,surface:'calendar' as const,destination:'administrator' as const};
  const before=await reader.read(await h.auth(),read,query);
  await m.run(await m.request([{id:m.partId,scope:{kind:'night',id:night.id,serviceId:service.id},expectedScopeRevision:1,desired:{cancelled:true},aspects:['cancellation'],dependencies:[]}]));
  await m.run(await m.evaluate());await m.run(await m.approve());
  const approved=await reader.read(await h.auth(),read,query);
  assert.deepEqual(approved!.entries.filter((v:any)=>v.data?.night_id===night.id),before!.entries.filter((v:any)=>v.data?.night_id===night.id));
  await m.run(await m.apply());
  const versions=await h.observer`select scope_kind,scope_id,revision,material,before_data from crm_private.b04_operational_versions where scope_id=${night.id}::uuid order by revision`;
  assert.equal(versions.length,1);assert.equal(versions[0]!.material.cancelled,true);assert.equal(versions[0]!.revision,'2');
  const after=await reader.read(await h.auth(),read,query);
  const history=await reader.read(await h.auth(),read,{...query,surface:'timeline'});
  const rows=(x:any,id:string)=>x.entries.filter((v:any)=>v.data?.night_id===id||v.scope?.id===id);
  assert.equal(rows(history,night.id)[0].data.night_date,'2026-10-20');
  assert.ok((history!.entries as any[]).some(v=>v.source==='crm_private.b04_operational_versions'&&v.data.scope_id===night.id&&v.data.material.cancelled===true));
  assert.deepEqual(rows(after,sibling.id),rows(before,sibling.id));
  assert.equal(rows(after,night.id)[0].data.operational.cancelled,true);
  assert.equal(rows(after,night.id)[0].data.operational.revision,2);
  assert.equal(rows(after,night.id)[0].data.operational_source,'crm_private.modification_scope');
  assert.equal(rows(after,sibling.id)[0].data.operational.cancelled,false);
  for(const destination of ['customer','provider','ai'] as const)assert.equal(JSON.stringify(await reader.read(await h.auth(),read,{...query,destination})).includes(night.id),false);
  await assert.rejects(reader.read({} as never,read,query));
  console.log('CANDIDATE NIGHT CANCELLATION',JSON.stringify({nightId:night.id,siblingId:sibling.id,canonical:versions,before,after,timelineRetainsCancelled:true}));
  // No prescribed rendering: omission or explicit cancelled state are both acceptable.
  // Identical verified active-looking output before/after is not a current operational projection.
  assert.notDeepEqual(rows(after,night.id),rows(before,night.id),'C01/C02: the affected night remains identical after approved cancellation; a generic review Task cannot identify its current cancelled state');
 }finally{await h.close();}
});

import {cancellationFixture} from '../support/h4-cancellation-fixtures.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
for(const scopeKind of ['service','booking'] as const)test(`H5-012 F03 equivalent ${scopeKind} cancellation is explicit on every affected night`,async()=>{
 const h=await isolatedBoundaries('h512parent'+scopeKind,scopeKind==='service'?59457:59458);
 try{
  for(const name of ['20261014003559_h5_authorized_projections.sql','20261015172843_h5_calendar_current_nights.sql','20261015180420_h5_projection_canonical_revisions.sql','20261015190418_h5_calendar_night_operational_state.sql'])await h.migration.unsafe(await readFile('supabase/migrations/'+name,'utf8'));
  const f=await cancellationFixture(h,{scopeKind,night:true}),reader=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2),query={contextKind:'booking' as const,contextId:f.b.bookingId,surface:'calendar' as const,destination:'administrator' as const};
  const other=await bookingFixture(h);await h.booking.apply(await h.auth(),write,other.q);const oq={...query,contextId:other.q.bookingId},outside=await reader.read(await h.auth(),read,oq);
  const before=await reader.read(await h.auth(),read,query),nights=(x:any)=>x.entries.filter((v:any)=>v.source==='crm_private.b04_current_nights');assert.equal(nights(before).length,1);
  if(scopeKind==='booking')for(let index=0;index<f.detail.services.length;index++){const conf=await confirmationFixture(h,f.conf.b,index),m=await modificationFixture(h,conf),request=await m.request([{id:m.partId,scope:m.scope,expectedScopeRevision:1,desired:{cancelled:true},aspects:['cancellation'],dependencies:[]}]);await m.run(await m.attest({...request,data:{...request.data,type:'cancellation'}}));await m.run(await m.evaluate());await m.run(await m.approve());await m.run(await m.apply());}
  await f.applyOperational();const after=await reader.read(await h.auth(),read,query);
  for(const row of nights(after)){assert.equal(row.data[scopeKind+'_operational'].cancelled,true);assert.equal(row.data[scopeKind+'_operational'].revision,2);assert.equal(row.data.operational.cancelled,false);assert.equal(row.data.night_date,nights(before)[0].data.night_date);assert.equal(row.data.operational_source,'crm_private.modification_scope');}
  assert.deepEqual(await reader.read(await h.auth(),read,oq),outside);const history=await reader.read(await h.auth(),read,{...query,surface:'timeline'});assert.ok((history!.entries as any[]).some(x=>x.source==='crm_private.b04_operational_versions'&&x.data.scope_kind===scopeKind&&x.data.material.cancelled===true));
 }finally{await h.close();}
});

test('H5-012 F01/F03 sequence: changed date survives cancellation and retains both revisions',async()=>{
 const h=await isolatedBoundaries('h512seq',59459);
 try{
  for(const name of ['20261014003559_h5_authorized_projections.sql','20261015172843_h5_calendar_current_nights.sql','20261015180420_h5_projection_canonical_revisions.sql','20261015190418_h5_calendar_night_operational_state.sql'])await h.migration.unsafe(await readFile('supabase/migrations/'+name,'utf8'));
  const fallback=await invoiceFixture(h),n=await quantityFixture(h);await h.booking.apply(await h.auth(),write,n.q);const shared={...fallback,bookingId:n.q.bookingId,b:{...fallback.b,q:n.q,detail:n.detail}},f=await confirmationFixture(h,shared,2),service=n.detail.services[2]!,night=service.nights[0]!,sibling=service.nights[1]!,reader=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2),query={contextKind:'booking' as const,contextId:n.q.bookingId,surface:'calendar' as const,destination:'administrator' as const};
  const rows=(x:any,id:string)=>x.entries.filter((v:any)=>v.data?.night_id===id),before=await reader.read(await h.auth(),read,query);
  for(const [revision,desired,aspects] of [[1,{date:'2026-10-23'},['date']],[2,{cancelled:true},['cancellation']]] as const){const m=await modificationFixture(h,f);await m.run(await m.request([{id:m.partId,scope:{kind:'night',id:night.id,serviceId:service.id},expectedScopeRevision:revision,desired,aspects,dependencies:[]}]));await m.run(await m.evaluate());await m.run(await m.approve());await m.run(await m.apply());}
  const after=await reader.read(await h.auth(),read,query),current=rows(after,night.id)[0];assert.equal(current.data.night_date,'2026-10-23');assert.equal(current.data.operational.date,'2026-10-23');assert.equal(current.data.operational.cancelled,true);assert.equal(current.data.operational.revision,3);assert.deepEqual(rows(after,sibling.id),rows(before,sibling.id));const history=await reader.read(await h.auth(),read,{...query,surface:'timeline'});assert.equal(rows(history,night.id)[0].data.night_date,'2026-10-20');const versions=(history!.entries as any[]).filter(x=>x.source==='crm_private.b04_operational_versions'&&x.data.scope_id===night.id).map(x=>x.data);assert.equal(versions.length,2);assert.ok(versions.some(x=>x.material.revision===2&&x.material.cancelled===false&&x.material.date==='2026-10-23'));assert.ok(versions.some(x=>x.material.revision===3&&x.material.cancelled===true&&x.before_data.cancelled===false));
 }finally{await h.close();}
});
