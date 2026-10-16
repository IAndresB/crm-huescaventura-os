import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedJointClosures,write,read} from '../support/h5-joint-closure-isolated.ts';
import {jointFixture,jointCommands} from '../support/h5-joint-closure-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {requirementFixture} from '../support/h4-requirement-fixtures.ts';
import {depositFixture} from '../support/h4-deposit-fixtures.ts';
import {refundFixture} from '../support/h4-refund-fixtures.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {modificationFixture} from '../support/h4-modification-fixtures.ts';
import {cancellationFixture} from '../support/h4-cancellation-fixtures.ts';
import {secondWorkActor} from '../support/h5-work-isolated.ts';
import {H5013ClosureAdapter} from '../../src/infrastructure/postgres/h5-closure-adapter.ts';
let h:Awaited<ReturnType<typeof isolatedJointClosures>>;
before(async()=>{h=await isolatedJointClosures('h5016races',59561);});after(async()=>{await h?.close();});
const waitFor=async(check:()=>Promise<boolean>)=>{const end=Date.now()+15000;while(Date.now()<end){if(await check())return;await new Promise(r=>setTimeout(r,20));}throw new Error('H5016_EXPECTED_PG_LOCK_NOT_OBSERVED');};
// Delay after closure_inputs has computed the material: this is deliberately
// different from queuing both requests before the root as H5-015 did.
async function afterReadRace(bid:string,close:()=>Promise<unknown>,writer:()=>Promise<unknown>,blockedWriter=true){
 const guard=h.connect('crm_h0_migration'),monitor=h.connect('crm_h0_migration');let unlock!:()=>void,entered!:()=>void;const ready=new Promise<void>(r=>entered=r),release=new Promise<void>(r=>unlock=r);
 const original=String((await h.observer`select pg_get_functiondef('crm_private.closure_inputs(uuid,text)'::regprocedure) body`)[0]!.body);
 assert.ok(original.includes('return r;'));
 await h.admin.unsafe(original.replace('return r;',`if bid='${bid}'::uuid then perform pg_advisory_xact_lock(601616::bigint);end if;return r;`));
 const gate=guard.begin(async(tx:any)=>{await tx`select pg_advisory_xact_lock(601616::bigint)`;entered();await release;});await ready;
 let first:Promise<unknown>|undefined,second:Promise<unknown>|undefined,locks:unknown,error:unknown;
 try{first=close();first.catch(()=>{});await waitFor(async()=>(await monitor`select count(*)::int n from pg_locks where locktype='advisory'and not granted`)[0]!.n>=1);second=writer();second.catch(()=>{});if(blockedWriter)await waitFor(async()=>(await monitor`select count(*)::int n from pg_locks where locktype='advisory'and not granted`)[0]!.n>=2);else{let done=false;second.then(()=>done=true,()=>done=true);await waitFor(async()=>done);}locks=Array.from(await monitor`select pid,classid,objid,granted,pg_blocking_pids(pid) blockers from pg_locks where locktype='advisory' order by pid,classid,objid`);}catch(e){error=e;}finally{unlock();await gate;}
 const results=await Promise.allSettled([first,second].filter(Boolean) as Promise<unknown>[]);await h.admin.unsafe(original);await Promise.all([guard.end({timeout:1}),monitor.end({timeout:1})]);
 console.log('H5016 after-read interleaving',JSON.stringify({bid,locks,results:results.map(r=>r.status==='fulfilled'?{status:r.status}:{status:r.status,error:String(r.reason)})}));if(error)throw error;return results;
}
for(const kind of ['payment','deposit','critical','document','obligation','refund','invoice','service','cancellation'] as const)test(`H5-016 A03 close has read material before ${kind} writes`,async()=>{
 let bid:string,j:Awaited<ReturnType<typeof jointCommands>>,mutate:()=>Promise<unknown>,resolved=true;
 if(kind==='invoice'){resolved=false;const f=await invoiceFixture(h);bid=f.bookingId;j=await jointCommands(h,bid);await h.invoices.apply(await h.auth(),write,await f.need());await h.invoices.apply(await h.auth(),write,await f.receive());await h.invoices.apply(await h.auth(),write,await f.review());await h.invoices.apply(await h.auth(),write,await f.link());const q=await f.correct();mutate=()=>h.auth().then(a=>h.invoices.apply(a,write,q));}
 else if(kind==='service'){resolved=false;const f=await modificationFixture(h);bid=f.bookingId;j=await jointCommands(h,bid);await f.run(await f.request());await f.run(await f.evaluate());await f.run(await f.approve());const q=await f.apply();mutate=()=>f.run(q);}
 else if(kind==='cancellation'){resolved=false;const f=await cancellationFixture(h);bid=f.b.bookingId;j=await jointCommands(h,bid);const q=await f.command();mutate=()=>f.run(q);}
 else{
  const f=await jointFixture(h);bid=f.bookingId;j=f.j;
  if(kind==='payment'){const q=await f.payment.discrepancy(6,'0.00','100.00');mutate=()=>h.auth().then(a=>h.payments.apply(a,write,q));}
  else if(kind==='deposit'){const f2=await depositFixture(h,f.b),q=await f2.command('open');mutate=()=>f2.run(q);}
  else if(kind==='critical'){const f2=await incidentFixture(h,undefined,{bookingId:bid,serviceId:f.b.detail.services[0]!.id}),q=await f2.command('detect',{...f2.data,impact:{...f2.impact,material:false}});mutate=()=>h.auth().then(a=>h.incidents.apply(a,write,q));}
  else if(kind==='document'){const f2=await requirementFixture(h),q=await f2.need({bookingId:bid,basis:{...f2.basis,scope:{action:'prepare',serviceId:f.b.detail.services[0]!.id}}});mutate=()=>h.auth().then(a=>h.requirements.apply(a,write,q));}
  else if(kind==='refund'){const f2=await refundFixture(h),q=await f2.command('request',{bookingId:bid,requesterId:f.b.f.accepterId,paymentIds:[f.payment.paymentId],cause:'voluntary',affectedScope:bid});mutate=()=>f2.run(q);}
  else{const q={action:'adjust' as const,operationId:uid(),bookingId:bid,policyId:f.payment.f.q.policyId,scheduleId:f.scheduleId,scope:'global' as const,scopeId:bid,expectedRevision:1,slot:'balance' as const,amount:'1100.00',due:{kind:'before_confirmation' as const},sourceRef:'SYNTHETIC independent obligation change',reason:'SYNTHETIC contractual increase',at:new Date().toISOString(),evidenceId:uid()};const mat=Object.fromEntries(Object.entries(q).filter(([k])=>!['operationId','evidenceId'].includes(k)));const evidenceId=await f.b.f.proof('obligation:adjust:'+await j.hash(mat),f.b.q.coverage,q.at);mutate=()=>h.auth().then(a=>h.obligations.apply(a,write,{...q,evidenceId}));}
 }
 const q=await j.command(),session=await secondWorkActor(h),sql=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(sql,h.f1,h.f2);
 try{const results=await afterReadRace(bid,()=>session.auth().then(a=>adapter.close(a,write,q)),mutate);assert.equal(results[1]!.status,'fulfilled');assert.equal(results[0]!.status,resolved?'fulfilled':'rejected');const v=await j.c.view();assert.equal(v.jointClosure.current,false);assert.equal(v.jointClosure.history.length,resolved?1:0);if(resolved){assert.ok(v.invalidations.length>0);assert.deepEqual(v.jointClosure.latestClose!.basisHash,q.expectedMaterial);}}finally{await sql.end({timeout:1});}
});

import {paymentFixture} from '../support/h3-payment-fixtures.ts';
import {H3003PaymentAdapter} from '../../src/infrastructure/postgres/h3-payment-adapter.ts';
test('H5-016 A07 shared payment identity conflicts; foreign Booking reassignment rejected',async()=>{
 const a=await jointFixture(h),b=await jointFixture(h),p=await paymentFixture(h,'200.00',true,'200.00');await h.payments.apply(await h.auth(),write,await p.attest({...p.detect,detection:{...p.detect.detection!,bookingId:a.bookingId}}));await h.payments.apply(await h.auth(),write,await p.receive());
 const proposal=await p.attest({...await p.propose(2,'100.00','0.00'),bookingId:a.bookingId,scheduleId:a.scheduleId});await h.payments.apply(await h.auth(),write,proposal);await h.payments.apply(await h.auth(),write,await p.verify(proposal,3));
 const foreign=await p.attest({...await p.propose(4,'100.00','100.00'),bookingId:b.bookingId,scheduleId:b.scheduleId});await assert.rejects(h.payments.apply(await h.auth(),write,foreign),/CONTEXT_REQUIRED/);
 await a.j.run(await a.j.command());await b.j.run(await b.j.command());const beforeA=await a.j.c.view(),beforeB=await b.j.c.view(),one=await p.discrepancy(4,'0.00','50.00'),two=await p.discrepancy(4,'50.00','50.00');
 const other=await secondWorkActor(h),conn=h.connect('crm_h0_runtime'),adapter=new H3003PaymentAdapter(conn,h.f1,h.f2),guard=h.connect('crm_h0_migration'),monitor=h.connect('crm_h0_migration');let release!:()=>void,entered!:()=>void;const ready=new Promise<void>(r=>entered=r),unlock=new Promise<void>(r=>release=r);
 const gate=guard.begin(async(tx:any)=>{await tx`select pg_advisory_xact_lock(hashtextextended(${'payment-root:'+p.paymentId},0))`;entered();await unlock;});await ready;let promises:Promise<unknown>[]=[],failure:unknown;
 try{promises.push(h.auth().then(auth=>h.payments.apply(auth,write,one)));promises[0]!.catch(()=>{});await waitFor(async()=>(await monitor`select count(*)::int n from pg_locks where locktype='advisory'and not granted`)[0]!.n>=1);promises.push(other.auth().then(auth=>adapter.apply(auth,write,two)));promises[1]!.catch(()=>{});await waitFor(async()=>(await monitor`select count(*)::int n from pg_locks where locktype='advisory'and not granted`)[0]!.n>=2);console.log('H5016 shared-payment wait',JSON.stringify(await monitor`select pid,classid,objid,granted,pg_blocking_pids(pid) blockers from pg_locks where locktype='advisory'`));}catch(e){failure=e;}finally{release();await gate;}
 const result=await Promise.allSettled(promises);await Promise.all([conn.end({timeout:1}),guard.end({timeout:1}),monitor.end({timeout:1})]);if(failure)throw failure;assert.equal(result[0]!.status,'fulfilled');assert.equal(result[1]!.status,'rejected');assert.match(String((result[1]as PromiseRejectedResult).reason),/CONFLICT|REVISION/);
 assert.deepEqual((await a.j.c.view()).jointClosure,beforeA.jointClosure);assert.deepEqual((await b.j.c.view()).jointClosure,beforeB.jointClosure);assert.equal((await a.j.c.view()).invalidations.length,0);assert.equal((await b.j.c.view()).invalidations.length,0);
});
test('H5-016 A04 reopening has read invalidated basis before a new critical event',async()=>{
 const f=await jointFixture(h),j=f.j;await j.run(await j.command());await h.payments.apply(await h.auth(),write,await f.payment.discrepancy(6,'0.00','100.00'));const old=(await j.c.view()).jointClosure.history,q=await j.c.command('economic',{}, {action:'reopen',serviceApplicability:await j.flags()});
 const inc=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id}),change=await inc.command('detect',{...inc.data,impact:{...inc.impact,material:false}}),other=await secondWorkActor(h),conn=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(conn,h.f1,h.f2);
 try{const rs=await afterReadRace(f.bookingId,()=>other.auth().then(a=>adapter.apply(a,write,q)),()=>h.auth().then(a=>h.incidents.apply(a,write,change)));assert.ok(rs.every(r=>r.status==='fulfilled'));const v=await j.c.view();assert.equal(v.assessments.economic!.status,'Pendiente');assert.equal(v.assessments.operational!.currentStatus,'Pendiente');assert.equal(v.jointClosure.current,false);assert.deepEqual(v.jointClosure.history,old);}finally{await conn.end({timeout:1});}
});
test('H5-016 A07 two incompatible closes after first has read material persist one decision',async()=>{
 const f=await jointFixture(h),q=await f.j.command(),q2=await f.j.command({reason:'SYNTHETIC different concurrent decision'}),other=await secondWorkActor(h),conn=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(conn,h.f1,h.f2);
 try{const rs=await afterReadRace(f.bookingId,()=>other.auth().then(a=>adapter.close(a,write,q)),()=>f.j.run(q2));assert.equal(rs[0]!.status,'fulfilled');assert.equal(rs[1]!.status,'rejected');assert.match(String((rs[1]as PromiseRejectedResult).reason),/CONFLICT/);assert.equal((await f.j.c.view()).jointClosure.history.length,1);}finally{await conn.end({timeout:1});}
});
test('H5-016 A07 independent Booking closes while another close is paused after material read',async()=>{
 const a=await jointFixture(h),b=await jointFixture(h),q=await a.j.command(),q2=await b.j.command(),other=await secondWorkActor(h),conn=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(conn,h.f1,h.f2);
 try{const rs=await afterReadRace(a.bookingId,()=>other.auth().then(auth=>adapter.close(auth,write,q)),()=>b.j.run(q2),false);assert.ok(rs.every(r=>r.status==='fulfilled'));assert.equal((await a.j.c.view()).jointClosure.current,true);assert.equal((await b.j.c.view()).jointClosure.current,true);}finally{await conn.end({timeout:1});}
});
