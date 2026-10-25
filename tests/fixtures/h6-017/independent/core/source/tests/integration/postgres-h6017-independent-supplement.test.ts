import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedWork,read,write} from '../support/h6-current-isolated.ts';
import {quantityFixture,nominalFixture} from '../support/h2-quantities-fixtures.ts';
import {ownEconomicsFixture} from '../support/h3-own-economics-fixtures.ts';

test('AUD09 independent scoped necessity and verified-contact positive/negative',async()=>{
 const h=await isolatedWork('audit_h6017_nominal',59796);try{
  const f=await quantityFixture(h),q=await nominalFixture(h,f,4),contact=uid();
  await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId:uid(),targetId:contact,kind:'contact',expectedVersion:0,sourceRef:'SYNTHETIC audit source',evidenceRef:'SYNTHETIC verified identity',reason:'SYNTHETIC scoped contract audit',verified:true,displayName:'SYNTHETIC verified participant'});
  const d=structuredClone(q.detail);(d.participants[0] as {contactId:string}).contactId=contact;await h.booking.apply(await h.auth(),write,{...q,detail:d,evidenceId:await f.detailProof(d)});
  const people=await h.observer`select participant_id,contact_id from crm_private.b04_participants where booking_id=${q.bookingId}::uuid`;assert.equal(people.length,4);assert.equal(people.filter(p=>p.contact_id===contact).length,1);
  const nights=await h.observer`select n.night_date::text date,sum(c.attendees)::int n from crm_private.b04_nights n join crm_private.b04_night_occupancies o using(night_id) join crm_private.b04_contributions c using(contribution_id) where c.booking_id=${q.bookingId}::uuid group by n.night_date order by n.night_date`;assert.deepEqual(Array.from(nights),[{date:'2026-10-20',n:12},{date:'2026-10-21',n:10}]);
  const x=await quantityFixture(h),n=await nominalFixture(h,x,1),missing=structuredClone(n.detail);(missing.assignments[0] as {necessity:string}).necessity='';await assert.rejects(h.booking.apply(await h.auth(),write,{...n,detail:missing,evidenceId:await x.detailProof(missing)}),/BOOKING_NOMINAL_NECESSITY_REQUIRED/);
  const unverified=uid();await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId:uid(),targetId:unverified,kind:'contact',expectedVersion:0,sourceRef:'SYNTHETIC tentative',evidenceRef:'SYNTHETIC not verified',reason:'SYNTHETIC audit counterexample',verified:false,displayName:'SYNTHETIC unverified participant'});
  const invalid=structuredClone(n.detail);(invalid.participants[0] as {contactId:string}).contactId=unverified;await assert.rejects(h.booking.apply(await h.auth(),write,{...n,detail:invalid,evidenceId:await x.detailProof(invalid)}),/BOOKING_CONTACT_VERIFICATION_REQUIRED/);
  assert.equal((await h.observer`select count(*)::int n from crm_private.b04_bookings where booking_id=${n.bookingId}::uuid`)[0]!.n,0);
  console.log('AUD09',JSON.stringify({verifiedAssociation:true,names:4,nightOccupancies:[12,10],noFictitiousParticipants:true,missingNecessityDenied:true,unverifiedContactDenied:true,noPartialBooking:true}));
 }finally{await h.close();}
});

test('AUD10 independent persisted EUR VAT Tarari unknown extra costs and fiscal negative',async()=>{
 const h=await isolatedWork('audit_h6017_econ',59797);try{
  const f=await ownEconomicsFixture(h),q=await f.command(),booking=(await h.observer`select to_jsonb(t) data from crm_private.b04_bookings t where booking_id=${f.bookingId}::uuid`)[0]!.data;
  for(const kind of ['included2','extra25','extra50']as const)(q.input.tarari as unknown[]).push({id:uid(),serviceId:f.b.detail.services[0]!.id,unitRevisionId:f.unit.revision,pricingFormRevisionId:f.form.revision,kind});
  Object.assign(q.input.fees[0]!.phases.expected,{vat:'included',tax:{base:'82.65',tax:'17.35',total:'100.00',sourceRef:'SYNTHETIC explicit arithmetic evidence'}});Object.assign(q.input.fees[0]!.phases.confirmed,{vat:'excluded'});
  await h.ownEconomics.apply(await h.auth(),write,await f.attest(q));const seen=(await f.see())!;assert.equal(seen.computed.currency,'EUR');
  assert.deepEqual(seen.computed.tarari.map(t=>({kind:t.kind,commercial:t.commercial,cost:t.cost,version:t.configurationVersion,internalInvoice:t.internalInvoice,provider:t.provider,suplido:t.suplido})),[{kind:'included2',commercial:'15.00',cost:'3.80',version:'approved-initial-v1',internalInvoice:null,provider:null,suplido:null},{kind:'extra25',commercial:'175.00',cost:null,version:'approved-initial-v1',internalInvoice:null,provider:null,suplido:null},{kind:'extra50',commercial:'325.00',cost:null,version:'approved-initial-v1',internalInvoice:null,provider:null,suplido:null}]);
  assert.equal(seen.computed.fiscalValidation,false);assert.equal(seen.computed.mandateInferred,false);assert.equal(seen.computed.totals.real.definitive,false);assert.equal(seen.input.costs[0]!.phases.real.vat,'unknown');assert.equal(seen.input.costs[0]!.phases.real.tax,null);
  assert.equal(seen.input.fees[0]!.phases.expected.vat,'included');assert.equal(seen.input.fees[0]!.phases.confirmed.vat,'excluded');
  const tax=await f.command();Object.assign(tax.input.costs[0]!.phases.real,{vat:'unknown',tax:{base:'10.00',tax:'10.00',total:'20.00',sourceRef:'SYNTHETIC invented tax counterexample'}});await assert.rejects(h.ownEconomics.apply(await h.auth(),write,await f.attest(tax)));
  const decimals=await f.command();Object.assign(decimals.input.fees[0]!.phases.real,{vat:'included',tax:{base:'82.65',tax:'17.350',total:'100.00',sourceRef:'SYNTHETIC three decimals counterexample'}});await assert.rejects(h.ownEconomics.apply(await h.auth(),write,await f.attest(decimals)));
  const extrapolate=await f.command();(extrapolate.input.tarari as unknown[]).push({...q.input.tarari[1],id:uid(),cost:'47.50'});await assert.rejects(h.ownEconomics.apply(await h.auth(),write,await f.attest(extrapolate)));
  assert.deepEqual((await h.observer`select to_jsonb(t) data from crm_private.b04_bookings t where booking_id=${f.bookingId}::uuid`)[0]!.data,booking);
  const newer=await f.command();Object.assign(newer.input.costs[0]!.phases.real,{input:{kind:'materialize',value:'25.00'},version:'SYNTHETIC-2'});await h.ownEconomics.apply(await h.auth(),write,await f.attest(newer));const revised=(await f.see())!;assert.equal(revised.revision,2);assert.equal(revised.history.length,2);
  console.log('AUD10',JSON.stringify({currency:'EUR',VAT:['included','excluded','unknown'],approvedTarariCommercial:['15.00','175.00','325.00'],approvedIncludedCost:'3.80',extrasCostUnknown:true,version:'approved-initial-v1',newVersionHistoryRetained:true,negativeTaxAndExtrapolation:3,commercialBookingUnchanged:true,noInternalInvoice:true,fiscalValidation:false,mandateInferred:false}));
 }finally{await h.close();}
});
