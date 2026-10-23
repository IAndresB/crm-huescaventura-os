import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedJointClosures,read,write} from '../support/h5-joint-closure-isolated.ts';
import {jointFixture,jointCommands} from '../support/h5-joint-closure-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {requirementFixture} from '../support/h4-requirement-fixtures.ts';
import {depositFixture} from '../support/h4-deposit-fixtures.ts';
import {refundFixture} from '../support/h4-refund-fixtures.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {modificationFixture} from '../support/h4-modification-fixtures.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
import {secondWorkActor} from '../support/h5-work-isolated.ts';
import {H5013ClosureAdapter} from '../../src/infrastructure/postgres/h5-closure-adapter.ts';
let h:Awaited<ReturnType<typeof isolatedJointClosures>>;
before(async()=>{h=await isolatedJointClosures('h5015race',59535);});after(async()=>{await h?.close();});
const waitFor=async(check:()=>Promise<boolean>)=>{const until=Date.now()+10000;while(Date.now()<until){if(await check())return;await new Promise(r=>setTimeout(r,15));}throw new Error('H5015_ROOT_WAIT_NOT_OBSERVED');};
async function race(bid:string,first:()=>Promise<unknown>,second:()=>Promise<unknown>){
 const independent=await bookingFixture(h);await h.booking.apply(await h.auth(),write,independent.q);
 const guard=h.connect('crm_h0_migration'),monitor=h.connect('crm_h0_migration'),free=h.connect('crm_h0_runtime');
 const third=await secondWorkActor(h),reader=new H5013ClosureAdapter(free,h.f1,h.f2);
 let release!:()=>void,ready!:()=>void,pid=0;const held=new Promise<void>(r=>{release=r;}),acquired=new Promise<void>(r=>{ready=r;});
 const gate=guard.begin(async tx=>{pid=Number((await tx`select pg_backend_pid() pid`)[0]!.pid);await tx`select crm_private.booking_preparation_lock(${bid}::uuid)`;ready();await held;});await acquired;
 const waiting=async()=>Number((await monitor`select count(*) n from pg_locks w join pg_locks g on w.locktype=g.locktype and w.classid=g.classid and w.objid=g.objid where g.pid=${pid} and g.locktype='advisory'and g.granted and not w.granted`)[0]!.n);
 let one:Promise<unknown>|undefined,two:Promise<unknown>|undefined,observed:unknown,failure:unknown;
 try{
  one=first();one.catch(()=>{});await waitFor(async()=>await waiting()===1);
  two=second();two.catch(()=>{});await waitFor(async()=>await waiting()===2);
  assert.equal((await reader.read(await third.auth(),read,independent.q.bookingId)).jointClosure.current,false);
  observed=Array.from(await monitor`select pid,classid,objid,granted,pg_blocking_pids(pid) blockers from pg_locks where locktype='advisory' order by pid,granted`);
 }catch(e){failure=e;}finally{release();await gate;}
 const results=await Promise.allSettled([one,two].filter(Boolean) as Promise<unknown>[]);await Promise.all([guard.end({timeout:1}),monitor.end({timeout:1}),free.end({timeout:1})]);
 if(failure){console.log('H5015 harness failure',results.map(r=>r.status==='rejected'?String(r.reason):r.status));throw failure;}
 assert.ok(observed);console.log('H5015 real root interleaving',JSON.stringify({bookingId:bid,observed,results:results.map(r=>({status:r.status,...(r.status==='rejected'?{error:String(r.reason)}:{})}))}));return results;
}
for(const kind of ['incident','document','deposit','payment','own-economics','refund','obligation'] as const)for(const first of ['close','writer'] as const)test(`H5-015 J07 ${kind}, ${first} first, independent Booking progresses`,async()=>{
 const f=await jointFixture(h),j=f.j,bid=f.bookingId;let mutate:()=>Promise<unknown>;
 if(kind==='incident'){
  const x=await incidentFixture(h,undefined,{bookingId:bid,serviceId:f.b.detail.services[0]!.id}),q=await x.command('detect',{...x.data,severity:'Importante',impact:{...x.impact,effect:'economic-review'}});mutate=()=>h.auth().then(a=>h.incidents.apply(a,write,q));
 }else if(kind==='document'){
  const x=await requirementFixture(h),q=await x.need({bookingId:bid,basis:{...x.basis,scope:{action:'prepare',serviceId:f.b.detail.services[0]!.id}}});mutate=()=>h.auth().then(a=>h.requirements.apply(a,write,q));
 }else if(kind==='deposit'){
  const x=await depositFixture(h,f.b),q=await x.command('open');mutate=()=>x.run(q);
 }else if(kind==='payment'){
  const q=await f.payment.discrepancy(6,'0.00','100.00');mutate=()=>h.auth().then(a=>h.payments.apply(a,write,q));
 }else if(kind==='own-economics'){
  const original=structuredClone((await f.see())!.input),firstCost=original.costs[0]!;const input={...original,costs:[{...firstCost,phases:{...firstCost.phases,real:{...firstCost.phases.real,input:null}}},...original.costs.slice(1)]};const q=await f.command({input});mutate=()=>h.auth().then(a=>h.ownEconomics.apply(a,write,q));
 }else if(kind==='obligation'){
  const q={action:'adjust' as const,operationId:uid(),bookingId:bid,policyId:f.payment.f.q.policyId,scheduleId:f.scheduleId,scope:'global' as const,scopeId:bid,expectedRevision:1,slot:'balance' as const,amount:'1100.00',due:{kind:'before_confirmation' as const},sourceRef:'SYNTHETIC new contractual obligation',reason:'SYNTHETIC material evidenced adjustment',at:new Date().toISOString(),evidenceId:uid()};
  const mat=Object.fromEntries(Object.entries(q).filter(([k])=>!['operationId','evidenceId'].includes(k)));const e=await f.b.f.proof('obligation:adjust:'+await j.hash(mat),f.b.q.coverage,q.at);mutate=()=>h.auth().then(a=>h.obligations.apply(a,write,{...q,evidenceId:e}));
 }else{
  const x=await refundFixture(h),q=await x.command('request',{bookingId:bid,requesterId:f.b.f.accepterId,paymentIds:[f.payment.paymentId],cause:'voluntary',affectedScope:bid});mutate=()=>x.run(q);
 }
 const q=await j.command(),other=await secondWorkActor(h),sql=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(sql,h.f1,h.f2),close=()=>other.auth().then(a=>adapter.close(a,write,q));
 try{
  const results=await race(bid,first==='close'?close:mutate,first==='close'?mutate:close);
  assert.equal(results[0]!.status,'fulfilled');
  if(first==='close')assert.equal(results[1]!.status,'fulfilled');else{assert.equal(results[1]!.status,'rejected');assert.match(String((results[1]as PromiseRejectedResult).reason),/MATERIAL_CONFLICT/);}
  const v=await j.c.view();assert.equal(v.jointClosure.current,false);assert.equal(v.jointClosure.history.length,first==='close'?1:0);assert.ok(v.invalidations.length>0);
 }finally{await sql.end({timeout:1});}
});
for(const kind of ['invoice','invoice-correction','service'] as const)for(const first of ['close','writer'] as const)test(`H5-015 J07 pending external Booking versus ${kind}, ${first} first`,async()=>{
 let bid:string,mutate:()=>Promise<unknown>;
 if(kind==='invoice'||kind==='invoice-correction'){const f=await invoiceFixture(h);bid=f.bookingId;if(kind==='invoice-correction'){for(const q of [await f.need()])await h.invoices.apply(await h.auth(),write,q);await h.invoices.apply(await h.auth(),write,await f.receive());await h.invoices.apply(await h.auth(),write,await f.review());await h.invoices.apply(await h.auth(),write,await f.link());}const q=kind==='invoice'?await f.need():await f.correct();mutate=()=>h.auth().then(a=>h.invoices.apply(a,write,q));}
 else{const f=await modificationFixture(h);bid=f.bookingId;await f.run(await f.request());await f.run(await f.evaluate());await f.run(await f.approve());const q=await f.apply();mutate=()=>f.run(q);}
 const j=await jointCommands(h,bid),q=await j.command(),other=await secondWorkActor(h),sql=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(sql,h.f1,h.f2),close=()=>other.auth().then(a=>adapter.close(a,write,q));
 try{const rs=await race(bid,first==='close'?close:mutate,first==='close'?mutate:close);const denied=rs[first==='close'?0:1]as PromiseRejectedResult;assert.equal(denied.status,'rejected');assert.match(String(denied.reason),first==='close'?/DIMENSION_PENDING/:/MATERIAL_CONFLICT/);assert.equal(rs[first==='close'?1:0]!.status,'fulfilled');assert.equal((await j.c.view()).jointClosure.history.length,0);}finally{await sql.end({timeout:1});}
});
test('H5-015 J06/J07 same operation closes once under real overlap',async()=>{
 const f=await jointFixture(h),q=await f.j.command(),other=await secondWorkActor(h),sql=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(sql,h.f1,h.f2);
 try{const rs=await race(f.bookingId,()=>f.j.run(q),()=>other.auth().then(a=>adapter.close(a,write,q)));assert.ok(rs.every(r=>r.status==='fulfilled'));assert.equal((rs[1]as PromiseFulfilledResult<{replayed:boolean}>).value.replayed,true);assert.equal((await f.j.c.view()).jointClosure.history.length,1);}finally{await sql.end({timeout:1});}
});
for(const first of ['close','reopen'] as const)test(`H5-015 J07 close/reopen overlap, ${first} first`,async()=>{
 const f=await jointFixture(h),j=f.j;await j.run(await j.command());const incident=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id});
 await h.incidents.apply(await h.auth(),write,await incident.command('detect',{...incident.data,severity:'Importante',impact:{...incident.impact,effect:'economic-review'}}));
 const reopen=await j.c.command('economic',{}, {action:'reopen',serviceApplicability:await j.flags()}),q=await j.command(),other=await secondWorkActor(h),sql=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(sql,h.f1,h.f2),close=()=>other.auth().then(a=>adapter.close(a,write,q)),open=()=>j.c.run(reopen);
 try{const rs=await race(f.bookingId,first==='close'?close:open,first==='close'?open:close);assert.equal(rs[first==='close'?1:0]!.status,'fulfilled');const fail=rs[first==='close'?0:1]as PromiseRejectedResult;assert.equal(fail.status,'rejected');assert.match(String(fail.reason),first==='close'?/DIMENSION_PENDING/:/MATERIAL_CONFLICT/);const v=await j.c.view();assert.equal(v.jointClosure.current,false);assert.equal(v.jointClosure.history.length,1);assert.equal(v.assessments.economic!.status,'Pendiente');}finally{await sql.end({timeout:1});}
});
test('H5-015 J07 incompatible concurrent close identities produce one persisted result',async()=>{
 const f=await jointFixture(h),q=await f.j.command(),q2=await f.j.command({operationId:uid(),reason:'SYNTHETIC other closing decision'}),other=await secondWorkActor(h),sql=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(sql,h.f1,h.f2);
 try{const rs=await race(f.bookingId,()=>f.j.run(q),()=>other.auth().then(a=>adapter.close(a,write,q2)));assert.equal(rs[0]!.status,'fulfilled');assert.equal(rs[1]!.status,'rejected');assert.match(String((rs[1]as PromiseRejectedResult).reason),/MATERIAL_CONFLICT/);assert.equal((await f.j.c.view()).jointClosure.history.length,1);}finally{await sql.end({timeout:1});}
});
