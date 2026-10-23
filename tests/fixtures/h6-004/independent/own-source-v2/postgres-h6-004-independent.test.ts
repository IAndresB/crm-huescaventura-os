import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {createServer} from 'node:net';
import {once} from 'node:events';
import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fifthDatabase} from '../support/h5-018-fifth-isolated.ts';
import {e2e04Fixture,read,write} from '../support/h6-004-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {secondWorkActor} from '../support/h5-work-isolated.ts';
import {H4015RefundAdapter} from '../../src/infrastructure/postgres/h4-refund-adapter.ts';
import {H5013ClosureAdapter} from '../../src/infrastructure/postgres/h5-closure-adapter.ts';
let h:Awaited<ReturnType<typeof fifthDatabase>>;
const observed:Record<string,unknown>={};
before(async()=>{const s=createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const port=(s.address() as {port:number}).port;await new Promise<void>(r=>s.close(()=>r()));h=await fifthDatabase('ia04_'+uid().replaceAll('-','').slice(0,10),port);observed.environment={port,ownDatabase:true,chain:68};});
after(async()=>{if(process.env.H6004_AUDIT_OUTPUT)await writeFile(join(process.env.H6004_AUDIT_OUTPUT,'independent-observed.json'),JSON.stringify(observed,null,2)+'\n');await h?.close();});
async function operational(){const f=await e2e04Fixture(h),m=f.c.m;await m.run(await m.evaluate());await m.run(await f.provider());await m.run(await f.response());await m.run(await m.approve());await m.run(await m.apply());return f;}
async function due(){const f=await operational();await f.c.run(await f.determineRight());await f.run(await f.request());await f.run(await f.determine());return f;}
async function authorized(){const f=await due();await(await f.approveRefund(await f.authorization())).execute();return f;}
async function incident(f:Awaited<ReturnType<typeof e2e04Fixture>>){const i=await incidentFixture(h,f.c.conf.b,{bookingId:f.bid,serviceId:f.c.scope.id});await h.incidents.apply(await h.auth(),write,await i.command('detect',{...i.data,description:'SYNTHETIC independent refund investigation',impact:{...i.impact,effect:'economic-review',basis:'SYNTHETIC exact output verification'}}));return i;}
const funds=(f:Awaited<ReturnType<typeof e2e04Fixture>>)=>h.auth().then(a=>h.allocations.read(a,read,f.payment.paymentId));

test('I04-01 provider ambiguity and false scope cannot authorize cancellation; valid successor applies only S1',async()=>{
 const f=await e2e04Fixture(h),m=f.c.m,rest=await f.unaffected();
 const initial:any=await h.booking.read(await h.auth(),read,f.bid);
 const reality:any=(await f.snapshot()).reality;
 assert.ok(reality.history.some((r:any)=>JSON.stringify(r).includes('perform')),'prior executed fact exists');
 await m.run(await m.evaluate());await m.run(await f.provider());await m.run(await f.response('ambiguous'));
 const before=await m.see();await assert.rejects(m.run(await m.approve()));assert.deepEqual(await m.see(),before);
 const q=await f.response();await assert.rejects(m.run(await m.attest({...q,data:{...q.data,partIds:[uid()]}})));assert.deepEqual(await m.see(),before);
 await m.run(q);await m.run(await m.approve());assert.notEqual((await h.booking.read(await h.auth(),read,f.bid) as any).booking.detail.services[0].cancelled,true);
 await m.run(await m.apply());assert.equal((await h.booking.read(await h.auth(),read,f.bid) as any).booking.detail.services[0].cancelled,true);assert.deepEqual(await f.unaffected(),rest);
 assert.deepEqual((await h.booking.read(await h.auth(),read,f.bid) as any).booking.detail.services.slice(1).map((s:any)=>s.performance),initial.booking.detail.services.slice(1).map((s:any)=>s.performance));
 observed.I04_01={bookingId:f.bid,providerPendingBefore:before!.progress,applied:(await m.see())!.progress,priorReality:reality.history,unaffectedPreserved:true};
});

test('I04-02 unknown base blocks zero average and dependent economics until explicit supported determination',async()=>{
 const f=await operational(),c=f.c,rest=await f.unaffected();await c.run(await f.determineRight(true));const before=await c.see(),obligation=await f.obligation(),money=await funds(f);
 assert.equal(before.computed.right,null);assert.equal(before.computed.status,'pending');
 for(const amount of ['0.00','16.67']){const q=await f.determineRight(true);await assert.rejects(c.run(await c.attest({...q,facts:{...q.facts!,base:{...q.facts!.base!,amount}}})));assert.deepEqual(await c.see(),before);}
 await assert.rejects(c.run(await f.adjustment()));await f.run(await f.request());await assert.rejects(f.run(await f.determine()));assert.equal((await f.view())!.right,null);assert.equal((await f.view())!.executed,'0.00');assert.deepEqual(await f.obligation(),obligation);assert.deepEqual(await funds(f),money);
 await c.run(await f.determineRight());assert.equal((await c.see()).computed.right,'200.00');await f.run(await f.determine());await(await f.approveRefund(await f.authorization())).execute();await f.run(await f.movement('80.00'));assert.equal((await f.view())!.pendingRight,'120.00');assert.deepEqual(await f.unaffected(),rest);
 observed.I04_02={pending:before,determined:await c.see(),refund:await f.view(),unaffectedPreserved:true};
});

test('I04-03 withdrawal and resolved Incident preserve output80 right120 and economic closure barrier',async()=>{
 const f=await authorized();await f.run(await f.movement('80.00'));const i=await incident(f);await h.incidents.apply(await h.auth(),write,await i.resolve());await f.run(await f.command('withdraw'));
 const v=await f.view();assert.equal(v!.executed,'80.00');assert.equal(v!.pendingRight,'120.00');assert.equal(v!.pendingAuthorized,'120.00');assert.equal(v!.request!.status,'Retirada');
 await f.assessRefund();await assert.rejects(f.joint.run(await f.joint.command()));const closure=await f.closures.view();assert.equal(closure.assessments.economic!.criteria.find(x=>x.id==='refunds')!.result,'pending');assert.equal(closure.jointClosure.current,false);
 await assert.rejects(f.run(await f.command('not_due')));assert.deepEqual(await f.view(),v);
 observed.I04_03={refund:v,incident:await i.state(),closure};
});

test('I04-04 movement identities deduplicate; uncertainty survives resolved Incident and needs verified outcome',async()=>{
 const f=await authorized(),q=await f.movement('80.00');await f.run(q);const before=await f.view(),money=await funds(f);
 const repeat=await f.attest({...q,operationId:uid(),expectedRevision:before!.revision,at:new Date().toISOString()});assert.equal((await f.run(repeat)).replayed,true);assert.deepEqual(await f.view(),before);
 const changed=await f.attest({...repeat,operationId:uid(),movement:{...q.movement!,amount:'81.00'}});await assert.rejects(f.run(changed));assert.deepEqual(await f.view(),before);assert.deepEqual(await funds(f),money);
 await assert.rejects(h.refunds.apply({} as never,write,q));assert.deepEqual(await f.view(),before);
 const u=await authorized(),inc=await incident(u),movement=await u.movement('80.00'),attempt={id:uid(),sourceRef:'SYNTHETIC independent unknown effect',portion:movement.movement!.portions[0]!};
 await u.run(await u.command('uncertain',{attempt,incidentId:inc.incidentId}));await assert.rejects(u.run(await u.movement('80.00')));await h.incidents.apply(await h.auth(),write,await inc.resolve());await assert.rejects(u.run(await u.movement('80.00')));assert.equal((await u.view())!.uncertain,'80.00');assert.equal((await u.view())!.executed,'0.00');assert.equal((await funds(u))!.summary.refundReserved,'80.00');
 const verified=await u.movement('80.00');const resolved=await u.command('resolve',{attemptId:attempt.id,resolution:'occurred',movement:verified.movement});await u.run(resolved);assert.equal((await u.view())!.executed,'80.00');assert.equal((await u.view())!.pendingRight,'120.00');assert.equal((await u.view())!.uncertain,'0.00');assert.equal((await u.run(resolved)).replayed,true);
 observed.I04_04={deduplicated:await f.view(),verifiedResolution:await u.view()};
});

test('I04-05 exact approval rejects changed material and unapproved actual output remains anomalous history',async()=>{
 const f=await due(),q=await f.authorization(),a=await f.approveRefund(q);const changed=await f.attest({...q,authorization:{...q.authorization!,recipientId:uid()}});await assert.rejects(a.execute(changed));assert.equal((await f.view())!.authorized,'0.00');await a.execute();assert.equal((await f.view())!.authorized,'200.00');
 await f.run(await f.command('revoke'));await assert.rejects(f.run(await f.movement('20.00')));assert.equal((await f.view())!.executed,'0.00');
 const u=await due(),inc=await incident(u),move=await u.movement('20.00');await u.run(await u.attest({...move,incidentId:inc.incidentId}));const v=await u.view();assert.equal(v!.executed,'20.00');assert.equal(v!.authorized,'0.00');assert.equal(v!.authorization,null);assert.equal(v!.movements[0]!.authorized,false);assert.equal(v!.movements[0]!.authorizationRef,null);assert.equal(v!.status,'Incidencia');await h.incidents.apply(await h.auth(),write,await inc.resolve());assert.equal((await u.view())!.pendingRight,'180.00');assert.equal((await u.view())!.movements[0]!.authorizationRef,null);
 observed.I04_05={revoked:await f.view(),actualUnapproved:await u.view()};
});

test('I04-06 real deferred T07 failure rolls back all; lost response after COMMIT recovers exactly once',async()=>{
 const f=await authorized(),q=await f.movement('80.00'),before=await f.view(),money=await funds(f);
 await h.admin.unsafe("create function crm_private.ia04_refund_fail() returns trigger language plpgsql as $$begin raise exception 'SYNTHETIC_IA04_DEFERRED_REFUND';end$$");await h.admin.unsafe('create constraint trigger ia04_refund_fail after insert on crm_private.b05_refund_operations deferrable initially deferred for each row execute function crm_private.ia04_refund_fail()');
 try{await assert.rejects(f.run(q));assert.deepEqual(await f.view(),before);assert.deepEqual(await funds(f),money);}finally{await h.admin.unsafe('drop trigger ia04_refund_fail on crm_private.b05_refund_operations');await h.admin.unsafe('drop function crm_private.ia04_refund_fail()');}
 const sql={begin:async(options:any,work:any)=>{await h.runtime.begin(options,work);throw new Error('SYNTHETIC_IA04_RESPONSE_LOST_AFTER_COMMIT');}} as unknown as typeof h.runtime;
 await assert.rejects(new H4015RefundAdapter(sql,h.f1,h.f2).apply(await h.auth(),write,q));const committed=await f.view();assert.equal(committed!.executed,'80.00');assert.equal(committed!.movements.length,1);assert.equal((await f.run(q)).replayed,true);assert.deepEqual(await f.view(),committed);
 observed.I04_06={rollbackPreserved:true,recovered:committed};
});

test('I04-07 real root overlap in both orders prevents closing over a new Refund and preserves independent dimensions',async()=>{
 const rows=[];
 for(const first of ['close','refund'] as const){
  const complete=await jointFixture(h),j=complete.j,bid=complete.bookingId,src=await e2e04Fixture(h);
  const request=await src.command('request',{bookingId:bid,requesterId:complete.b.f.accepterId,paymentIds:[complete.payment.paymentId],cause:'voluntary',affectedScope:bid});const close=await j.command(),other=await secondWorkActor(h),second=h.connect('crm_h0_runtime'),adapter=new H5013ClosureAdapter(second,h.f1,h.f2);
  const doClose=()=>other.auth().then(a=>adapter.close(a,write,close)),doRefund=()=>src.run(request),guard=h.connect('crm_h0_migration');let release!:()=>void,ready!:()=>void,pid=0;const held=new Promise<void>(r=>release=r),acquired=new Promise<void>(r=>ready=r);
  const gate=guard.begin(async tx=>{pid=Number((await tx`select pg_backend_pid() pid`)[0]!.pid);await tx`select crm_private.booking_preparation_lock(${bid}::uuid)`;ready();await held;});await acquired;
  const waiting=async()=>Number((await h.admin`select count(*) n from pg_locks w join pg_locks g on w.locktype=g.locktype and w.classid=g.classid and w.objid=g.objid where g.pid=${pid} and g.locktype='advisory' and g.granted and not w.granted`)[0]!.n);
  const wait=async(n:number)=>{for(let i=0;i<500;i++){if(await waiting()>=n)return;await new Promise(r=>setTimeout(r,10));}throw new Error('IA04_LOCK_NOT_OBSERVED');};
  const pending:Promise<unknown>[]=[];let seen=0;
  try{pending.push((first==='close'?doClose:doRefund)());pending[0]!.catch(()=>{});await wait(1);pending.push((first==='close'?doRefund:doClose)());pending[1]!.catch(()=>{});await wait(2);seen=await waiting();}finally{release();await gate;}
  const results=await Promise.allSettled(pending);await guard.end();await second.end();assert.equal(seen,2);assert.equal(results[0]!.status,'fulfilled');assert.equal(results[1]!.status,first==='close'?'fulfilled':'rejected');
  const view=await j.c.view();assert.equal(view.jointClosure.current,false);assert.equal(view.jointClosure.history.length,first==='close'?1:0);assert.equal(view.assessments.economic!.currentStatus,'Pendiente');assert.equal(view.assessments.commercial!.currentStatus,'Resuelto');assert.equal(view.assessments.operational!.currentStatus,'Resuelto');
  rows.push({first,bookingId:bid,observedWaiters:seen,results:results.map(r=>r.status==='fulfilled'?{status:r.status}:{status:r.status,error:String(r.reason)}),closure:view});
 }
 observed.I04_07=rows;
});

test('I04-08 ordinary direct SQL forged context and disabled actor cannot read write or replay protected facts',async()=>{
 const f=await authorized(),q=await f.movement('80.00');await f.run(q);const before=await f.view(),auth=await h.auth();let denied=0;
 for(const role of ['crm_h0_runtime','anon','authenticated']){const db=h.connect(role);try{for(const t of ['b06_modification_revisions','b06_cancellation_revisions','b05_refund_revisions','b05_refund_operations'])for(const query of [`select * from crm_private.${t}`,`update crm_private.${t} set admin_scope='SYNTHETIC wrong'`,`delete from crm_private.${t}`]){await assert.rejects(db.unsafe(query));denied++;}}finally{await db.end();}}
 await assert.rejects(h.refunds.read({} as never,read,f.bid,f.id));await assert.rejects(h.refunds.apply(auth,read,q));assert.deepEqual(await f.view(),before);
 await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;
 await assert.rejects(h.refunds.read(auth,read,f.bid,f.id));await assert.rejects(h.refunds.apply(auth,write,q));
 const persisted=(await h.observer`select after_data from crm_private.b05_refund_revisions where refund_id=${f.id}::uuid order by revision desc limit 1`)[0]!.after_data;assert.equal(persisted.executed,'80.00');assert.equal(persisted.pendingRight,'120.00');
 observed.I04_08={directDenials:denied,disabledActorDenied:true,persisted};
});
