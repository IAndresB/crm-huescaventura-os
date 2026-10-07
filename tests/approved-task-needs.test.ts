import assert from 'node:assert/strict';
import {test} from 'node:test';
import {randomUUID as uid} from 'node:crypto';
import {approvedTaskNeeds,type ApprovedTaskCause,type ApprovedTaskEvent} from '../src/domain/approved-task-needs.ts';
import {civilReference,localDate,zoneEvidence} from '../src/domain/civil-time.ts';
import {evaluateTaskDeadline} from '../src/domain/pending-task.ts';

const base=()=>({causeId:uid(),contextKind:'booking',contextId:uid(),scopeRef:uid(),
 sourceRef:'synthetic approved source',sourceVersion:'1'});
const reference=(scope:'global'|'service'='global',date='2026-10-20',scopeId=uid())=>
 civilReference({scope,scopeId},localDate(date),zoneEvidence('Europe/Madrid','synthetic zone','1'),
  'synthetic contracted date','1');
const causes:ApprovedTaskCause[]=['block','advance','balance','provider','invoice','suplido','document',
 'participants_list','availability','modification','cancellation','proposal','final_participants'];

test('H5-T19 thirteen approved causes produce scoped needs with stable identities',()=>{
 const identities=new Set<string>();
 for(const cause of causes){
  const b=base();if(cause==='balance'||cause==='final_participants')b.scopeRef=b.contextId;
  const e={...b,cause,contextKind:cause==='proposal'?'proposal':b.contextKind,
   ...(cause==='proposal'?{proposal:{createdDate:'2026-10-01'}}:{}),
   ...(cause==='final_participants'?{finalParticipants:{reference:reference('global','2026-10-20',b.contextId)}}:{}),
   ...(cause==='balance'?{balance:{reference:reference('global','2026-10-20',b.contextId),verifiedRemaining:'50.00'}}:{})} as ApprovedTaskEvent;
  const needs=approvedTaskNeeds(e);assert.equal(needs.length,cause==='proposal'?2:1);
  assert.deepEqual(approvedTaskNeeds(e),needs);
  for(const n of needs){assert.equal(n.material.triggerRef,'BR-TASK-005');
   assert.equal(n.identity.scopeRef,b.scopeRef);assert.ok(n.identity.effect);
   const key=JSON.stringify(n.identity);assert.equal(identities.has(key),false);identities.add(key);}
 }
 assert.equal(identities.size,14);
 assert.throws(()=>approvedTaskNeeds({...base(),cause:'unapproved'} as unknown as ApprovedTaskEvent),/TASK_TRIGGER_INPUT_INVALID/);
});

test('H5-T16/T17 proposal dates are 2–3 full days or a localized unknown',()=>{
 const e={...base(),contextKind:'proposal',cause:'proposal' as const,proposal:{createdDate:'2026-10-01',expiresDate:'2026-10-10'}};
 const missing=approvedTaskNeeds(e);
 assert.deepEqual(missing.map(x=>x.material.deadline.kind),['unknown','unknown']);
 assert.match((missing[0]!.material.deadline as {reason:string}).reason,/2–3/);
 assert.match((missing[1]!.material.deadline as {reason:string}).reason,/adelanto/);
 const known=approvedTaskNeeds({...e,proposal:{...e.proposal,followupDate:'2026-10-04',preExpiryDays:2}});
 assert.deepEqual(known.map(x=>(x.material.deadline as {date:string}).date),['2026-10-04','2026-10-08']);
 assert.throws(()=>approvedTaskNeeds({...e,proposal:{...e.proposal,followupDate:'2026-10-05'}}),/TASK_TRIGGER_INPUT_INVALID/);
 assert.throws(()=>approvedTaskNeeds({...e,proposal:{...e.proposal,preExpiryDays:12}}),/TASK_TRIGGER_INPUT_INVALID/);
});

test('H5-T12/T13/T15 balance and final participants keep D020 scope and full deadline day',()=>{
 const booking=base(),service=base();booking.scopeRef=booking.contextId;
 const global=reference('global','2026-10-20',booking.contextId),specific=reference('service','2026-10-22',service.scopeRef);
 const balance=approvedTaskNeeds({...booking,cause:'balance',balance:{reference:global,verifiedRemaining:'50.00'}})[0]!;
 assert.equal(evaluateTaskDeadline(balance.material.deadline,{date:'2026-10-13'}).overdue,false);
 assert.equal(evaluateTaskDeadline(balance.material.deadline,{date:'2026-10-14'}).overdue,true);
 assert.equal(approvedTaskNeeds({...booking,cause:'balance',balance:{reference:global,verifiedRemaining:'0.00'}}).length,0);
 const final=approvedTaskNeeds({...service,cause:'final_participants',finalParticipants:{reference:specific}})[0]!;
 assert.equal((final.material.deadline as {reference:{scope:string;date:string};daysBefore:number}).reference.scope,'service');
 assert.equal((final.material.deadline as {reference:{scope:string;date:string};daysBefore:number}).reference.date,'2026-10-22');
 assert.equal((final.material.deadline as {daysBefore:number}).daysBefore,7);
 assert.equal(evaluateTaskDeadline(final.material.deadline,{date:'2026-10-15'}).overdue,false);
 assert.equal(evaluateTaskDeadline(final.material.deadline,{date:'2026-10-16'}).overdue,true);
 const unresolved=approvedTaskNeeds({...service,cause:'final_participants',finalParticipants:{reference:specific,daysBefore:null}})[0]!;
 assert.equal(unresolved.material.deadline.kind,'unknown');
 assert.throws(()=>approvedTaskNeeds({...base(),cause:'balance',balance:{reference:global,verifiedRemaining:'50.00'}}),/TASK_TRIGGER_INPUT_INVALID/);
 assert.throws(()=>approvedTaskNeeds({...base(),cause:'final_participants',finalParticipants:{reference:specific}}),/TASK_TRIGGER_INPUT_INVALID/);
 assert.throws(()=>approvedTaskNeeds({...booking,contextKind:'proposal',cause:'balance',balance:{reference:global,verifiedRemaining:'50.00'}}),/TASK_TRIGGER_INPUT_INVALID/);
 assert.throws(()=>approvedTaskNeeds({...booking,cause:'provider',deadline:{kind:'d020',reference:specific,daysBefore:7,
  sourceRef:'wrong service',version:'1'}}),/TASK_TRIGGER_INPUT_INVALID/);
});

test('H5-T11/T18/T24 verified hour is distinct; missing automation parameter stays local',()=>{
 const b=base();
 const hourly=approvedTaskNeeds({...b,cause:'provider',deadline:{kind:'instant',at:'2026-10-13T16:00:00+02:00',
  sourceRef:'synthetic verified provider deadline',version:'1'}})[0]!;
 assert.equal(evaluateTaskDeadline(hourly.material.deadline,{instant:'2026-10-13T15:59:59+02:00'}).overdue,false);
 assert.equal(evaluateTaskDeadline(hourly.material.deadline,{instant:'2026-10-13T16:00:01+02:00'}).overdue,true);
 const pending=approvedTaskNeeds({...base(),contextKind:'proposal',cause:'proposal',proposal:{createdDate:'2026-10-01'}});
 assert.deepEqual(pending.map(x=>x.material.deadline.kind),['unknown','unknown']);
 const limited=approvedTaskNeeds({...base(),cause:'document',missingParameter:'Falta límite de reintentos aprobado'})[0]!;
 assert.equal(limited.material.deadline.kind,'unknown');
 assert.match((limited.material.deadline as {reason:string}).reason,/límite de reintentos/);
 const balance=base();balance.scopeRef=balance.contextId;
 const ref=reference('global','2026-10-20',balance.contextId);
 const due=approvedTaskNeeds({...balance,cause:'balance',balance:{reference:ref,verifiedRemaining:'50.00'}})[0]!;
 for(const date of ['2026-10-13'])assert.equal(evaluateTaskDeadline(due.material.deadline,{date}).overdue,false);
 assert.equal(evaluateTaskDeadline(due.material.deadline,{date:'2026-10-14'}).overdue,true);
 assert.throws(()=>approvedTaskNeeds({...balance,cause:'balance',balance:{reference:ref,verifiedRemaining:'50.00'},
  deadline:{kind:'instant',at:'2026-10-13T00:00:00+02:00',sourceRef:'fabricated 168h cut',version:'1'}}),/TASK_TRIGGER_INPUT_INVALID/);
 const service=base(),serviceRef=reference('service','2026-10-20',service.scopeRef);
 const three=approvedTaskNeeds({...service,cause:'final_participants',finalParticipants:{reference:serviceRef,daysBefore:3}})[0]!;
 assert.equal(evaluateTaskDeadline(three.material.deadline,{date:'2026-10-17'}).overdue,false);
 assert.equal(evaluateTaskDeadline(three.material.deadline,{date:'2026-10-18'}).overdue,true);
 assert.throws(()=>approvedTaskNeeds({...service,cause:'final_participants',finalParticipants:{reference:serviceRef,daysBefore:3},
  deadline:{kind:'instant',at:'2026-10-17T00:00:00+02:00',sourceRef:'fabricated 72h cut',version:'1'}}),/TASK_TRIGGER_INPUT_INVALID/);
 assert.throws(()=>approvedTaskNeeds({...base(),cause:'final_participants',finalParticipants:{reference:ref}}),/TASK_TRIGGER_INPUT_INVALID/);
});
