import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {isolatedReality,read,write} from '../support/h4-reality-isolated.ts';
import {H5001TaskAdapter,type TaskTransition} from '../../src/infrastructure/postgres/h5-task-adapter.ts';
import {evaluateTaskDeadline} from '../../src/domain/pending-task.ts';
import {approvedTaskNeeds,type ApprovedTaskCause,type ApprovedTaskEvent} from '../../src/domain/approved-task-needs.ts';
import {civilReference,dateAtInstant,instant,localDate,zoneEvidence} from '../../src/domain/civil-time.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {obligationFixture} from '../support/h3-obligation-fixtures.ts';
import {allocationFixture} from '../support/h3-allocation-fixtures.ts';
import type {TaskCommand} from '../../src/infrastructure/postgres/h1-task-adapter.ts';

let h:Awaited<ReturnType<typeof isolatedReality>>;
let tasks:H5001TaskAdapter;
const migration='supabase/migrations/20261007180001_h5_task_lifecycle.sql';
before(async()=>{
 h=await isolatedReality('crm_h5002_task',58701);
 await h.migration.unsafe(await readFile(migration,'utf8'));
 tasks=new H5001TaskAdapter(h.runtime,h.f1,h.f2);
});
after(async()=>{await h?.close();});
function task(change:Partial<TaskCommand>={}):TaskCommand {
 return {action:'receive',operationId:uid(),taskId:uid(),expectedRevision:0,
  identity:{causeKind:'document',causeId:uid(),contextKind:'booking',contextId:uid(),
   scopeRef:uid(),relatedKind:null,relatedId:null,effect:'document-review'},
  material:{title:'Revisar documento sintético',deadline:{kind:'unknown',reason:'Fecha contractual no verificada'},
   priority:{kind:'pending',reason:'Prioridad sin configurar'},sourceRef:'SM-TA-01',sourceVersion:'1',
   triggerRef:'BR-TASK-005',triggerVersion:'1'},reason:'Documento sintético pendiente',...change};
}
const transition=(p:TaskCommand,action:TaskTransition['action'],revision:number,change:Partial<TaskTransition>={}):TaskTransition=>
 ({action,operationId:uid(),taskId:p.taskId,expectedRevision:revision,reason:'Revisión sintética fundada',
  ...(action==='complete'?{result:'Seguimiento realizado',references:['synthetic-record-1']}:{}),
  ...(action==='reopen'?{reviewEvidenceRef:'synthetic-review-1'}:{}),...change});
async function see(p:TaskCommand){return await tasks.read(await h.auth(),read,p.taskId,p.identity.contextKind,p.identity.contextId);}
async function history(p:TaskCommand){return await h.observer`select action_kind,after_state,reason,source_ref from crm_private.b07_history where subject_id=${p.taskId}::uuid order by recorded_at,history_id`;}

test('H5-T01/T05/T06/T08 completes and explicitly reopens without losing prior closure',async()=>{
 const p=task();await tasks.apply(await h.auth(),write,p);
 let s=await see(p);assert.equal(s?.state,'pending');assert.equal(s?.last_closure,null);
 const q=transition(p,'complete',1);await tasks.transition(await h.auth(),write,q);
 s=await see(p);assert.equal(s?.state,'completed');assert.equal(s?.last_closure?.result,'Seguimiento realizado');
 assert.equal((s?.last_closure?.references as string[])[0],'synthetic-record-1');
 assert.equal((await tasks.transition(await h.auth(),write,q)).replayed,true);
 const reopen=transition(p,'reopen',2);await tasks.transition(await h.auth(),write,reopen);
 s=await see(p);assert.equal(s?.state,'pending');assert.equal(s?.task_id,p.taskId);
 assert.equal(s?.last_closure?.result,'Seguimiento realizado');
 const rows=await history(p);assert.deepEqual(rows.map(x=>x.action_kind),['task_receive','task_complete','task_reopen']);
 assert.equal(rows[1]?.after_state.last_closure.result,'Seguimiento realizado');
 assert.equal(rows[2]?.source_ref,'synthetic-review-1');
});

test('H5-T05/T07/T08 missing guards and closed reception reject without side effects',async()=>{
 const p=task();await tasks.apply(await h.auth(),write,p);
 const old=await history(p);
 for(const bad of [{result:''},{references:[]},{references:['']},{reason:''}])
  await assert.rejects(tasks.transition(await h.auth(),write,transition(p,'complete',1,bad)));
 assert.deepEqual(await history(p),old);assert.equal((await see(p))?.state,'pending');
 await tasks.transition(await h.auth(),write,transition(p,'cancel',1));
 assert.equal((await see(p))?.state,'cancelled');
 await assert.rejects(tasks.transition(await h.auth(),write,transition(p,'reopen',2,{reviewEvidenceRef:''})));
 await assert.rejects(tasks.apply(await h.auth(),write,{...p,action:'update',expectedRevision:2,operationId:uid(),
  material:{...p.material,title:'Cambio silencioso prohibido'}}));
 assert.equal((await see(p))?.state,'cancelled');assert.equal((await history(p)).length,2);
});

test('H5-T23 missing creation guards and transition authority leave no Task or history',async()=>{
 const p=task(),bad=[
  {...p,reason:''},
  {...p,identity:{...p.identity,causeId:''}},
  {...p,identity:{...p.identity,scopeRef:''}},
  {...p,material:{...p.material,title:''}},
  {...p,material:{...p.material,sourceRef:''}},
  {...p,material:{...p.material,priority:{kind:'pending' as const,reason:''}}},
  {...p,material:{...p.material,deadline:{kind:'unknown' as const,reason:''}}},
 ];
 for(const input of bad)await assert.rejects(tasks.apply(await h.auth(),write,input));
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_pending_tasks where task_id=${p.taskId}::uuid`)[0]!.n,0);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_history where subject_id=${p.taskId}::uuid`)[0]!.n,0);
 await tasks.apply(await h.auth(),write,p);
 const old=await history(p),state=await see(p);
 for(const action of ['complete','cancel','reopen'] as const){
  await assert.rejects(tasks.transition({} as never,write,transition(p,action,1)));
  await assert.rejects(tasks.transition(await h.auth(),read,transition(p,action,1)));
 }
 assert.deepEqual(await history(p),old);assert.deepEqual(await see(p),state);
});

test('H5-T02/T04 stable identity converges and related distinct need survives',async()=>{
 const p=task(),duplicate={...p,taskId:uid(),operationId:uid()};
 const [a,b]=await Promise.all([tasks.apply(await h.auth(),write,p),tasks.apply(await h.auth(),write,duplicate)]);
 assert.equal(a.id,b.id);
 const other=task({identity:{...p.identity,causeId:uid(),relatedKind:'task',relatedId:p.taskId}});
 const c=await tasks.apply(await h.auth(),write,other);assert.notEqual(c.id,a.id);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_pending_tasks where task_id in (${p.taskId}::uuid,${other.taskId}::uuid)`)[0]?.n,2);
});

test('H5-T03/T22 two sessions race close, one revision and one closure',async()=>{
 const p=task();await tasks.apply(await h.auth(),write,p);
 const a=transition(p,'complete',1),b=transition(p,'cancel',1);
 const outcomes=await Promise.allSettled([tasks.transition(await h.auth(),write,a),tasks.transition(await h.auth(),write,b)]);
 assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);
 assert.equal(outcomes.filter(x=>x.status==='rejected').length,1);
 assert.equal((await see(p))?.revision,2);assert.equal((await history(p)).length,2);
});

test('H5-T03 observed two PostgreSQL sessions overlap in both close orders',async()=>{
 const observations=[];
 for(const first of ['complete','cancel'] as const){
  const p=task();await tasks.apply(await h.auth(),write,p);
  const second=first==='complete'?'cancel':'complete',key=7643201;
  await h.admin.unsafe("create function crm_private.h5_wait_overlap() returns trigger language plpgsql as $$begin perform pg_advisory_xact_lock(7643201);return new;end$$");
  await h.admin.unsafe(`create trigger h5_wait_overlap before update on crm_private.b07_pending_tasks for each row when (old.task_id='${p.taskId}'::uuid) execute function crm_private.h5_wait_overlap()`);
  let release!:()=>void,ready!:()=>void;
  const released=new Promise<void>(r=>release=r),held=new Promise<void>(r=>ready=r);
  const holder=h.admin.begin(async tx=>{await tx.unsafe('select pg_advisory_xact_lock($1)',[key]);ready();await released;});
  await held;
  const a=tasks.transition(await h.auth(),write,transition(p,first,1));
  const watcher=h.connect('h2_bootstrap');
  const waiters=async()=>await watcher.unsafe<{pid:number;wait_event_type:string;wait_event:string}[]>(
   "select pid,wait_event_type,wait_event from pg_stat_activity where usename='crm_h0_runtime' and wait_event_type='Lock' and query like '%b07_task_apply%' order by pid");
  let firstWaiting=false,waiting:Awaited<ReturnType<typeof waiters>>=[];
  for(let i=0;i<80;i++){waiting=await waiters();if(waiting.length>=1){firstWaiting=true;break;}await new Promise(r=>setTimeout(r,25));}
  assert.equal(firstWaiting,true);
  const b=tasks.transition(await h.auth(),write,transition(p,second,1));
  let results:PromiseSettledResult<{id:string;replayed:boolean}>[]=[];
  try{
   for(let i=0;i<80;i++){waiting=await waiters();if(waiting.length>=2)break;await new Promise(r=>setTimeout(r,25));}
   assert.equal(waiting.length,2,'two different backend sessions waited on the same Task operation');
  }finally{release();await holder;results=await Promise.allSettled([a,b]);
   await h.admin.unsafe('drop trigger h5_wait_overlap on crm_private.b07_pending_tasks');
   await h.admin.unsafe('drop function crm_private.h5_wait_overlap()');}
  assert.equal(new Set(waiting.map(x=>x.pid)).size,2);
  assert.equal(results[0]?.status,'fulfilled');assert.equal(results[1]?.status,'rejected');
  assert.equal((await see(p))?.state,first==='complete'?'completed':'cancelled');
  assert.equal((await see(p))?.revision,2);assert.equal((await history(p)).length,2);
  observations.push({taskId:p.taskId,first,second,waiting,fulfilled:1,rejected:1,finalRevision:2,historyRows:2});
 }
 if(process.env.H5002_CAPTURE_DIR)await writeFile(`${process.env.H5002_CAPTURE_DIR}/concurrency.json`,
  JSON.stringify(observations,null,2)+'\n');
});

test('H5-T09/T10 deadline unknown, civil full last day and next day',async()=>{
 const p=task();await tasks.apply(await h.auth(),write,p);
 assert.deepEqual(evaluateTaskDeadline((await see(p))!.material.deadline,{}),{known:false,overdue:false});
 const known={kind:'civil' as const,date:'2026-10-13',sourceRef:'synthetic-civil-source',version:'1'};
 await tasks.apply(await h.auth(),write,{...p,action:'update',operationId:uid(),expectedRevision:1,
  material:{...p.material,deadline:known}});
 const s=await see(p);assert.equal(evaluateTaskDeadline(s!.material.deadline,{date:'2026-10-13'}).overdue,false);
 assert.equal(evaluateTaskDeadline(s!.material.deadline,{date:'2026-10-14'}).overdue,true);
 assert.equal(s?.state,'pending');
});

test('H5-T19 all thirteen approved trigger needs persist without duplicate identity',async()=>{
 const causes:ApprovedTaskCause[]=['block','advance','balance','provider','invoice','suplido','document',
  'participants_list','availability','modification','cancellation','proposal','final_participants'];
 let count=0;
 for(const cause of causes){
  const scopeId=uid(),contextId=uid(),reference=civilReference({scope:'global',scopeId:contextId},localDate('2026-10-20'),
   zoneEvidence('Europe/Madrid','synthetic zone','1'),'synthetic contracted date','1');
  const event={cause,causeId:uid(),contextKind:cause==='proposal'?'proposal':'booking',contextId,
   scopeRef:cause==='balance'||cause==='final_participants'?contextId:scopeId,
   sourceRef:'synthetic-source-'+cause,sourceVersion:'1',
   ...(cause==='proposal'?{proposal:{createdDate:'2026-10-01'}}:{}),
   ...(cause==='balance'?{balance:{reference,verifiedRemaining:'50.00'}}:{}),
   ...(cause==='final_participants'?{finalParticipants:{reference}}:{})} as ApprovedTaskEvent;
  for(const need of approvedTaskNeeds(event)){
   const p=task({identity:need.identity,material:need.material,reason:need.reason});
   const a=await tasks.apply(await h.auth(),write,p);
   const b=await tasks.apply(await h.auth(),write,{...p,operationId:uid(),taskId:uid()});
   assert.equal(a.id,b.id,cause);
   assert.equal((await see(p))?.material.sourceRef,event.sourceRef);count++;
  }
 }
 assert.equal(count,14);
});

test('H5-T13/T14/T15/T20 hour change retains interval; date change revises only affected scope',async()=>{
 const zone=zoneEvidence('Europe/Madrid','synthetic-zone','1');
 const bookingId=uid(),serviceA=uid(),serviceB=uid();
 const reference=(serviceId:string,at:string,version:string)=>civilReference({scope:'service',scopeId:serviceId},
  dateAtInstant(instant(at),zone),zone,'synthetic-service-date',version);
 const aEvent={cause:'final_participants' as const,causeId:serviceA,contextKind:'booking',contextId:bookingId,
  scopeRef:serviceA,sourceRef:'synthetic-final-figure',sourceVersion:'1',
  finalParticipants:{reference:reference(serviceA,'2026-10-20T08:00:00+02:00','1')}};
 const bEvent={...aEvent,causeId:serviceB,scopeRef:serviceB,
  finalParticipants:{reference:reference(serviceB,'2026-10-23T09:00:00+02:00','1')}};
 const aNeed=approvedTaskNeeds(aEvent)[0]!,bNeed=approvedTaskNeeds(bEvent)[0]!;
 const a=task({...aNeed,reason:aNeed.reason}),b=task({...bNeed,reason:bNeed.reason});
 await tasks.apply(await h.auth(),write,a);await tasks.apply(await h.auth(),write,b);
 const otherBefore=await see(b);
 const sameDay=approvedTaskNeeds({...aEvent,finalParticipants:{reference:reference(serviceA,'2026-10-20T23:00:00+02:00','1')}})[0]!;
 assert.deepEqual(sameDay.material.deadline,aNeed.material.deadline);
 assert.equal((await tasks.apply(await h.auth(),write,{...a,operationId:uid(),taskId:uid()})).id,a.taskId);
 const revised=approvedTaskNeeds({...aEvent,sourceVersion:'2',
  finalParticipants:{reference:reference(serviceA,'2026-10-22T08:00:00+02:00','2')}})[0]!;
 await tasks.apply(await h.auth(),write,{...a,action:'update',operationId:uid(),expectedRevision:1,material:revised.material});
 assert.equal((await see(a))?.revision,2);
 assert.equal(((await see(a))!.material.deadline as {reference:{date:string}}).reference.date,'2026-10-22');
 assert.deepEqual(await see(b),otherBefore);
 const prior=await history(a);assert.equal((prior[0]!.after_state.material.deadline.reference as {date:string}).date,'2026-10-20');
 const changed=prior.find(x=>x.action_kind==='task_update');
 assert.equal((changed!.after_state.material.deadline.reference as {date:string}).date,'2026-10-22');
});

test('H5-T12 balance need derives remaining amount from signed H3 obligation read',async()=>{
 const f=await obligationFixture(h);
 await h.obligations.apply(await h.auth(),write,f.q);
 const record=await h.obligations.read(await h.auth(),read,f.q.bookingId,f.q.scheduleId!);
 assert.equal(record?.current.snapshot.parts.find(p=>p.slot==='balance')?.amount,'500.00');
 const needs=await tasks.balanceNeeds(await h.auth(),read,f.q.bookingId,f.q.scheduleId!);
 assert.equal(needs.length,1);
 assert.equal(needs[0]!.identity.contextId,f.q.bookingId);
 assert.equal(needs[0]!.material.deadline.kind,'d020');
 const p=task({identity:needs[0]!.identity,material:needs[0]!.material,reason:needs[0]!.reason});
 await tasks.apply(await h.auth(),write,p);
 assert.equal(evaluateTaskDeadline((await see(p))!.material.deadline,{date:'2026-10-13'}).overdue,false);
 assert.equal(evaluateTaskDeadline((await see(p))!.material.deadline,{date:'2026-10-14'}).overdue,true);
 await assert.rejects(tasks.balanceNeeds(await h.auth(),read,uid(),f.q.scheduleId!));
});

test('H5-T12 verified partial/full balance coverage changes only the derived need',async()=>{
 const f=await allocationFixture(h,'500.00','500.00','received','1000.00');
 const p=await f.paymentAttest({...await f.propose(2,'500.00'),slot:'balance'});
 await h.payments.apply(await h.auth(),write,p);
 await h.payments.apply(await h.auth(),write,await f.verify(p));
 const destination={...f.destination,slot:'balance' as const,reference:'SYNTHETIC checked balance'};
 const assign=async(amount:string,start:string)=>{
  const q=await f.assign(amount,start,destination);
  await h.allocations.apply(await h.auth(),write,await f.attest({...q,reconciliationId:p.reconciliationId}));
 };
 await assign('200.00','0.00');
 const record=await h.obligations.read(await h.auth(),read,f.f.b.bookingId,f.f.q.scheduleId!);
 assert.equal(record?.coverage?.find(x=>x.slot==='balance')?.verifiedAmount,'200.00');
 assert.equal((await h.obligations.evaluate(await h.auth(),read,f.f.b.bookingId,f.f.q.scheduleId!,f.f.q.at))?.[1]?.state,'partial');
 assert.equal((await tasks.balanceNeeds(await h.auth(),read,f.f.b.bookingId,f.f.q.scheduleId!)).length,1);
 await assign('300.00','200.00');
 assert.equal((await h.obligations.evaluate(await h.auth(),read,f.f.b.bookingId,f.f.q.scheduleId!,f.f.q.at))?.[1]?.state,'complete');
 assert.equal((await tasks.balanceNeeds(await h.auth(),read,f.f.b.bookingId,f.f.q.scheduleId!)).length,0);
});

test('H5-T17/T18 AC083 missing proposal parameters stay localized while independent Task proceeds',async()=>{
 const base={cause:'proposal' as const,causeId:uid(),contextKind:'proposal',contextId:uid(),scopeRef:uid(),
  sourceRef:'synthetic-proposal',sourceVersion:'1',proposal:{createdDate:'2026-10-01',expiresDate:'2026-10-10'}};
 const needs=approvedTaskNeeds(base);
 assert.deepEqual(needs.map(x=>x.material.deadline.kind),['unknown','unknown']);
 for(const need of needs){const p=task({...need,reason:need.reason});await tasks.apply(await h.auth(),write,p);
  assert.equal((await see(p))?.material.deadline.kind,'unknown');}
 const independent=task({material:{...task().material,deadline:{kind:'civil',date:'2026-10-13',sourceRef:'synthetic-explicit-deadline',version:'1'}}});
 await tasks.apply(await h.auth(),write,independent);
 assert.equal((await see(independent))?.material.deadline.kind,'civil');
 assert.equal(evaluateTaskDeadline((await see(independent))!.material.deadline,{date:'2026-10-14'}).overdue,true);
 for(const missingParameter of ['Falta límite aprobado de reintentos','Falta pausa aprobada de automatismo']){
  const need=approvedTaskNeeds({cause:'document',causeId:uid(),contextKind:'booking',contextId:uid(),
   scopeRef:uid(),sourceRef:'synthetic-automation-parameter',sourceVersion:'1',missingParameter})[0]!;
  const pending=task({...need,reason:need.reason});
  await tasks.apply(await h.auth(),write,pending);
  assert.equal((await see(pending))?.material.deadline.kind,'unknown');
  assert.equal(((await see(pending))?.material.deadline as {reason:string}).reason,missingParameter);
 }
});

test('H5-T21 RLS/FORCE RLS and direct runtime/anon denied',async()=>{
 const policy=(await h.observer`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.b07_pending_tasks'::regclass`)[0]!;
 assert.equal(policy.relrowsecurity,true);assert.equal(policy.relforcerowsecurity,true);
 await assert.rejects(h.runtime.unsafe('select * from crm_private.b07_pending_tasks'));
 assert.equal((await h.observer`select count(*)::int n from information_schema.role_table_grants where table_schema='crm_private' and table_name='b07_pending_tasks' and grantee in ('PUBLIC','anon','authenticated','crm_h0_runtime')`)[0]?.n,0);
 for(const role of ['anon','authenticated'])
  assert.equal((await h.observer`select has_function_privilege(${role},'crm_api.b07_task_apply(bytea,bytea,bytea,bytea,bytea)','execute') allowed`)[0]!.allowed,false);
});

test('H5-T21 missing or disabled actor, wrong scope and wrong context cannot transition',async()=>{
 const p=task();await tasks.apply(await h.auth(),write,p);
 const q=transition(p,'complete',1),before=await history(p);
 assert.equal(await tasks.read(await h.auth(),read,p.taskId,'booking',uid()),null);
 await assert.rejects(tasks.transition({} as never,write,q));
 await assert.rejects(tasks.transition(await h.auth(),write,{...q,taskId:uid(),operationId:uid()}));
 await h.migration`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;
 try{await assert.rejects(tasks.transition(await h.auth(),write,q));}
 finally{await h.migration`update crm_private.crm_actors set enabled=true where actor_id=${h.actorId}::uuid`;}
 assert.deepEqual(await history(p),before);assert.equal((await see(p))?.state,'pending');
});

test('H5-T06/T07 completed or cancelled work leaves real Booking and payment facts unchanged',async()=>{
 const b=await invoiceFixture(h);
 await h.invoices.apply(await h.auth(),write,await b.need());
 const before=(await h.observer`select to_jsonb(x) body from crm_private.b04_bookings x where booking_id=${b.bookingId}::uuid`)[0]!.body;
 const payments=(await h.observer`select count(*)::int n from crm_private.b05_customer_payments`)[0]!.n;
 const invoiceBefore=(await h.observer`select to_jsonb(x) body from crm_private.b05_provider_invoices x where invoice_id=${b.invoiceId}::uuid`)[0]!.body;
 const acceptanceBefore=(await h.observer`select count(*)::int n from crm_private.b03_acceptances`)[0]!.n;
 for(const action of ['complete','cancel'] as const){
  const p=task({identity:{...task().identity,contextId:b.bookingId,causeId:uid()}});
  await tasks.apply(await h.auth(),write,p);
  await tasks.transition(await h.auth(),write,transition(p,action,1));
  assert.equal((await see(p))?.state,action==='complete'?'completed':'cancelled');
 }
 assert.deepEqual((await h.observer`select to_jsonb(x) body from crm_private.b04_bookings x where booking_id=${b.bookingId}::uuid`)[0]!.body,before);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b05_customer_payments`)[0]!.n,payments);
 assert.deepEqual((await h.observer`select to_jsonb(x) body from crm_private.b05_provider_invoices x where invoice_id=${b.invoiceId}::uuid`)[0]!.body,invoiceBefore);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b03_acceptances`)[0]!.n,acceptanceBefore);
});

test('H5-T22 T09 failed history write rolls back closure and operation, then retry succeeds',async()=>{
 const p=task();await tasks.apply(await h.auth(),write,p);
 const q=transition(p,'complete',1),before=await see(p),oldHistory=await history(p);
 await h.admin.unsafe("create function crm_private.h5_synthetic_fault() returns trigger language plpgsql as $$begin raise exception 'H5_SYNTHETIC_HISTORY_FAILURE';end$$");
 await h.admin.unsafe("create trigger h5_synthetic_fault before insert on crm_private.b07_history for each row when (new.action_kind='task_complete') execute function crm_private.h5_synthetic_fault()");
 try{
  await assert.rejects(tasks.transition(await h.auth(),write,q));
  assert.deepEqual(await see(p),before);assert.deepEqual(await history(p),oldHistory);
  assert.equal((await h.observer`select count(*)::int n from crm_private.b07_operations where operation_id=${q.operationId}::uuid`)[0]!.n,0);
 }finally{
  await h.admin.unsafe('drop trigger h5_synthetic_fault on crm_private.b07_history');
  await h.admin.unsafe('drop function crm_private.h5_synthetic_fault()');
 }
 await tasks.transition(await h.auth(),write,q);
 assert.equal((await see(p))?.state,'completed');assert.equal((await history(p)).length,2);
});
