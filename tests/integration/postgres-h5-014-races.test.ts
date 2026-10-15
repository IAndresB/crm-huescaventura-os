import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedClosures,read,write} from '../support/h5-closure-isolated.ts';
import {closureCommands} from '../support/h5-closure-fixtures.ts';
import {secondWorkActor} from '../support/h5-work-isolated.ts';
import {H5013ClosureAdapter} from '../../src/infrastructure/postgres/h5-closure-adapter.ts';
import {H3007InvoiceAdapter} from '../../src/infrastructure/postgres/h3-invoice-adapter.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {ownEconomicsFixture} from '../support/h3-own-economics-fixtures.ts';
import {requirementFixture} from '../support/h4-requirement-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {modificationFixture} from '../support/h4-modification-fixtures.ts';
import {refundFixture} from '../support/h4-refund-fixtures.ts';
import {depositFixture} from '../support/h4-deposit-fixtures.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
let h:Awaited<ReturnType<typeof isolatedClosures>>;
before(async()=>{h=await isolatedClosures('h5014race',59525);});after(async()=>{await h?.close();});
const pause=()=>new Promise(r=>setTimeout(r,12));
async function wait(check:()=>Promise<boolean>){const end=Date.now()+8000;while(Date.now()<end){if(await check())return;await pause();}throw new Error('H5014_OVERLAP_NOT_OBSERVED');}
async function setup(kind:string){
 if(kind==='invoice'){const f=await invoiceFixture(h),q=await f.need();return{bid:f.bookingId,table:'b05_invoice_revisions',run:()=>h.auth().then(a=>h.invoices.apply(a,write,q))};}
 if(kind==='own'){const f=await ownEconomicsFixture(h),q=await f.command();return{bid:f.bookingId,table:'b05_own_economic_revisions',run:()=>h.auth().then(a=>h.ownEconomics.apply(a,write,q))};}
 if(kind==='document'){const f=await requirementFixture(h),q=await f.need();return{bid:f.bookingId,table:'b07_requirement_revisions',run:()=>h.auth().then(a=>h.requirements.apply(a,write,q))};}
 if(kind==='incident'){const f=await incidentFixture(h),q=await f.detect();return{bid:f.bookingId,table:'b07_incident_revisions',run:()=>h.auth().then(a=>h.incidents.apply(a,write,q))};}
 if(kind==='modification'){const f=await modificationFixture(h),q=await f.request();return{bid:f.bookingId,table:'b06_modification_revisions',run:()=>f.run(q)};}
 if(kind==='refund'){const f=await refundFixture(h),q=await f.request();return{bid:f.bid,table:'b05_refund_revisions',run:()=>f.run(q)};}
 const f=await depositFixture(h);await f.initialize();const q=await f.delivery();return{bid:f.bid,table:'b05_deposit_revisions',run:()=>f.run(q)};
}
for(const kind of ['invoice','own','document','incident','modification','refund','deposit'])for(const first of ['writer','assessment'])test(`H5-014 C03 ${kind} ${first} first; real root wait and stale check`,async()=>{
 const f=await setup(kind),c=await closureCommands(h,f.bid),q=await c.command('commercial'),session=await secondWorkActor(h),rt=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(rt,h.f1,h.f2);
 const unrelated=await bookingFixture(h);await h.booking.apply(await h.auth(),write,unrelated.q);
 const guard=h.connect('crm_h0_migration'),monitor=h.connect('crm_h0_migration');let release!:()=>void,ready!:()=>void;
 const held=new Promise<void>(r=>{release=r;}),acquired=new Promise<void>(r=>{ready=r;});const gate=guard.begin(async tx=>{await tx.unsafe('select pg_advisory_xact_lock(7605014)');ready();await held;});await acquired;
 const table=first==='writer'?f.table:'b06_closure_assessments';
 await h.admin.unsafe('create function crm_private.h5014_gate()returns trigger language plpgsql as $$begin perform pg_advisory_xact_lock(7605014);return new;end$$');
 await h.admin.unsafe(`create trigger zz_h5014_gate before insert on crm_private.${table} for each row execute function crm_private.h5014_gate()`);
 let one:Promise<unknown>|undefined,two:Promise<unknown>|undefined;let observations:any[]=[];
 try{
  one=first==='writer'?f.run():adapter.apply(await session.auth(),write,q);one.catch(()=>{});
  await wait(async()=>Number((await monitor`select count(*) n from pg_locks where locktype='advisory'and not granted`)[0]!.n)>=1);
  // Public read on another root completes during the held transaction.
  assert.equal((await (first==='writer'?adapter.read(await session.auth(),read,unrelated.q.bookingId):h.closures.read(await h.auth(),read,unrelated.q.bookingId))).revision,0);
  two=first==='writer'?adapter.apply(await session.auth(),write,q):f.run();two.catch(()=>{});
  await wait(async()=>Number((await monitor`select count(*) n from pg_locks where locktype='advisory'and not granted`)[0]!.n)>=2);
  observations=Array.from(await monitor`select l.pid,a.backend_xid,a.wait_event,l.classid,l.objid,l.granted,pg_blocking_pids(l.pid) blockers from pg_locks l join pg_stat_activity a using(pid) where l.locktype='advisory' order by l.pid,l.granted`);
  const blocked=observations.filter(x=>!x.granted);assert.equal(new Set(blocked.map(x=>x.pid)).size,2);assert.ok(blocked.some(x=>observations.some(y=>y.pid!==x.pid&&y.granted&&y.classid===x.classid&&y.objid===x.objid)));
 }finally{
  release();await gate;const results=await Promise.allSettled([one,two].filter(Boolean) as Promise<unknown>[]);
  await h.admin.unsafe(`drop trigger zz_h5014_gate on crm_private.${table};drop function crm_private.h5014_gate()`);
  await Promise.all([guard.end({timeout:1}),monitor.end({timeout:1}),rt.end({timeout:1})]);
  assert.equal(results[0]!.status,'fulfilled');
  if(first==='writer'){assert.equal(results[1]!.status,'rejected');assert.match(String((results[1] as PromiseRejectedResult).reason),/MATERIAL_CONFLICT/);assert.equal((await c.view()).revision,0);}else{assert.equal(results[1]!.status,'fulfilled');assert.equal((await c.view()).revision,1);}
 }
 console.log('H5014 lock evidence',JSON.stringify({kind,first,observations}));
});
test('H5-014 C01 two distinct simultaneous assessments same revision: one winner',async()=>{
 const b=await bookingFixture(h);await h.booking.apply(await h.auth(),write,b.q);const c=await closureCommands(h,b.q.bookingId),a=await c.command('commercial'),bq=await c.command('operational'),session=await secondWorkActor(h),rt=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(rt,h.f1,h.f2);
 try{const outcomes=await Promise.allSettled([c.run(a),adapter.apply(await session.auth(),write,bq)]);assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.match(String((outcomes.find(x=>x.status==='rejected') as PromiseRejectedResult).reason),/MATERIAL_CONFLICT/);assert.equal((await c.view()).history.length,1);}finally{await rt.end({timeout:1});}
});
