import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {write,read,isolatedClosures} from '../support/h5-closure-isolated.ts';
import {closureCommands} from '../support/h5-closure-fixtures.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {H5013ClosureAdapter} from '../../src/infrastructure/postgres/h5-closure-adapter.ts';
import {H4003IncidentAdapter} from '../../src/infrastructure/postgres/h4-incident-adapter.ts';
import {secondWorkActor} from '../support/h5-work-isolated.ts';
let h:Awaited<ReturnType<typeof isolatedClosures>>;
before(async()=>{h=await isolatedClosures('h5013race',59515);});after(async()=>{await h?.close();});
const waitFor=async(check:()=>Promise<boolean>)=>{const until=Date.now()+6000;while(Date.now()<until){if(await check())return;await new Promise(r=>setTimeout(r,15));}throw new Error('CLOSURE_RACE_NOT_OBSERVED');};
for(const first of ['assessment','incident'] as const)test('H5-013 N10: real two-session root overlap, '+first+' first',async()=>{
 const f=await incidentFixture(h),c=await closureCommands(h,f.bookingId);
 const decision=await c.command('commercial',{documents:'not_applicable','final-terms':'satisfied',modifications:'not_applicable'});
 const event=await f.detect();
 const other=await bookingFixture(h);await h.booking.apply(await h.auth(),write,other.q);
 const second=await secondWorkActor(h),runtime=h.connect('crm_h0_runtime'),closure=new H5013ClosureAdapter(runtime,h.f1,h.f2),incident=new H4003IncidentAdapter(runtime,h.f1,h.f2);
 const guard=h.connect('crm_h0_migration'),monitor=h.connect('crm_h0_migration');let release!:()=>void;
 const held=new Promise<void>(r=>{release=r;});let ready!:()=>void;const acquired=new Promise<void>(r=>{ready=r;});
 const gate=guard.begin(async tx=>{await tx.unsafe('select pg_advisory_xact_lock(7605013)');ready();await held;});await acquired;
 const table=first==='assessment'?'b06_closure_assessments':'b07_incident_revisions';
 await h.admin.unsafe("create function crm_private.h5013_gate()returns trigger language plpgsql as $$begin perform pg_advisory_xact_lock(7605013);return new;end$$");
 await h.admin.unsafe(`create trigger zz_h5013_gate before insert on crm_private.${table} for each row execute function crm_private.h5013_gate()`);
 let one:Promise<unknown>|undefined,two:Promise<unknown>|undefined;let observed:unknown;
 try{
  one=first==='assessment'?c.run(decision):h.incidents.apply(await h.auth(),write,event);one.catch(()=>{});
  await waitFor(async()=>Number((await monitor`select count(*) n from pg_locks where locktype='advisory'and not granted`)[0]!.n)>=1);
  // An unrelated Booking is readable while the first transaction owns its root.
  const independent=await closure.read(await second.auth(),read,other.q.bookingId);assert.equal(independent.revision,0);
  two=first==='assessment'?incident.apply(await second.auth(),write,event):closure.apply(await second.auth(),write,decision);two.catch(()=>{});
  await waitFor(async()=>Number((await monitor`select count(*) n from pg_locks where locktype='advisory'and not granted`)[0]!.n)>=2);
  const locks=await monitor`select a.pid,a.backend_xid,a.wait_event_type,a.wait_event,l.locktype,l.classid,l.objid,l.granted from pg_stat_activity a join pg_locks l using(pid)where a.datname=current_database()and l.locktype='advisory'order by a.pid,l.granted`;
  assert.ok(new Set(locks.filter(x=>!x.granted).map(x=>x.pid)).size>=2);observed=Array.from(locks);
 }finally{
  release();await gate;const results=await Promise.allSettled([one,two].filter(Boolean) as Promise<unknown>[]);
  await h.admin.unsafe(`drop trigger zz_h5013_gate on crm_private.${table};drop function crm_private.h5013_gate()`);
  await Promise.all([guard.end({timeout:1}),monitor.end({timeout:1}),runtime.end({timeout:1})]);
  assert.equal(results[0]!.status,'fulfilled');
  if(first==='assessment'){assert.equal(results[1]!.status,'fulfilled');assert.equal((await c.view()).assessments.commercial!.applicable,true);}
  else {assert.equal(results[1]!.status,'rejected');assert.match(String((results[1]as PromiseRejectedResult).reason),/MATERIAL_CONFLICT/);assert.equal((await c.view()).revision,0);}
 }
 assert.ok(observed);console.log('H5013 race',JSON.stringify({first,observed}));
});

import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {H3007InvoiceAdapter} from '../../src/infrastructure/postgres/h3-invoice-adapter.ts';
for(const first of ['assessment','invoice'] as const)test('H5-013 N10: economic assessment versus new invoice, '+first+' first',async()=>{
 const f=await invoiceFixture(h),c=await closureCommands(h,f.bookingId),v:any=await c.view();
 const serviceApplicability=v.inputs.services.map((s:any)=>({serviceId:s.service_id,suplido:false,deposit:false,ownEconomics:false,reason:'SYNTHETIC recorded direct settlement applicability'}));
 const decision=await c.command('economic',{}, {serviceApplicability}),event=await f.need();
 const second=await secondWorkActor(h),runtime=h.connect('crm_h0_runtime'),closure=new H5013ClosureAdapter(runtime,h.f1,h.f2),invoice=new H3007InvoiceAdapter(runtime,h.f1,h.f2);
 const guard=h.connect('crm_h0_migration'),monitor=h.connect('crm_h0_migration');let release!:()=>void,ready!:()=>void;
 const held=new Promise<void>(r=>{release=r;}),acquired=new Promise<void>(r=>{ready=r;});
 const gate=guard.begin(async tx=>{await tx.unsafe('select pg_advisory_xact_lock(7605013)');ready();await held;});await acquired;
 const table=first==='assessment'?'b06_closure_assessments':'b05_invoice_revisions';
 await h.admin.unsafe("create function crm_private.h5013_gate()returns trigger language plpgsql as $$begin perform pg_advisory_xact_lock(7605013);return new;end$$");await h.admin.unsafe(`create trigger zz_h5013_gate before insert on crm_private.${table} for each row execute function crm_private.h5013_gate()`);
 let one:Promise<unknown>|undefined,two:Promise<unknown>|undefined,observed:unknown;
 try{
  one=first==='assessment'?c.run(decision):h.invoices.apply(await h.auth(),write,event);one.catch(()=>{});
  await waitFor(async()=>Number((await monitor`select count(*) n from pg_locks where locktype='advisory'and not granted`)[0]!.n)>=1);
  two=first==='assessment'?invoice.apply(await second.auth(),write,event):closure.apply(await second.auth(),write,decision);two.catch(()=>{});
  await waitFor(async()=>Number((await monitor`select count(*) n from pg_locks where locktype='advisory'and not granted`)[0]!.n)>=2);
  observed=Array.from(await monitor`select pid,classid,objid,granted from pg_locks where locktype='advisory'order by pid,granted`);
 }finally{
  release();await gate;const results=await Promise.allSettled([one,two].filter(Boolean)as Promise<unknown>[]);
  await h.admin.unsafe(`drop trigger zz_h5013_gate on crm_private.${table};drop function crm_private.h5013_gate()`);
  await Promise.all([guard.end({timeout:1}),monitor.end({timeout:1}),runtime.end({timeout:1})]);assert.equal(results[0]!.status,'fulfilled');
  if(first==='assessment'){assert.equal(results[1]!.status,'fulfilled');assert.equal((await c.view()).assessments.economic!.applicable,false);}else{assert.equal(results[1]!.status,'rejected');assert.match(String((results[1]as PromiseRejectedResult).reason),/MATERIAL_CONFLICT/);}
 }
 assert.ok(observed);console.log('H5013 invoice race',JSON.stringify({first,observed}));
});

test('H5-013 N09/N10: concurrent exact operation from two sessions records one assessment',async()=>{
 const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);const c=await closureCommands(h,f.q.bookingId),q=await c.command('commercial',{documents:'not_applicable','final-terms':'satisfied',modifications:'not_applicable'});
 const second=await secondWorkActor(h),sql=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(sql,h.f1,h.f2);
 try{const results=await Promise.all([c.run(q),adapter.apply(await second.auth(),write,q)]);assert.equal(results.filter(x=>x.replayed).length,1);assert.equal((await c.view()).history.length,1);assert.equal((await c.view()).revision,1);}finally{await sql.end({timeout:1});}
});
