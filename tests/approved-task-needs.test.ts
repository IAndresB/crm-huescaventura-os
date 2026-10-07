import assert from 'node:assert/strict';
import {test} from 'node:test';
import {randomUUID as uid} from 'node:crypto';
import {approvedTaskNeeds,type ApprovedTaskCause,type ApprovedTaskEvent} from '../src/domain/approved-task-needs.ts';
import {civilReference,localDate,zoneEvidence} from '../src/domain/civil-time.ts';
import {evaluateTaskDeadline} from '../src/domain/pending-task.ts';

const base=()=>({causeId:uid(),contextKind:'booking',contextId:uid(),scopeRef:uid(),
 sourceRef:'synthetic approved source',sourceVersion:'1'});
const reference=(scope:'global'|'service'='global',date='2026-10-20')=>
 civilReference({scope,scopeId:uid()},localDate(date),zoneEvidence('Europe/Madrid','synthetic zone','1'),
  'synthetic contracted date','1');
const causes:ApprovedTaskCause[]=['block','advance','balance','provider','invoice','suplido','document',
 'participants_list','availability','modification','cancellation','proposal','final_participants'];

test('H5-T19 thirteen approved causes produce scoped needs with stable identities',()=>{
 const identities=new Set<string>();
 for(const cause of causes){
  const b=base();const e={...b,cause,
   ...(cause==='proposal'?{proposal:{createdDate:'2026-10-01'}}:{}),
   ...(cause==='final_participants'?{finalParticipants:{reference:reference()}}:{}),
   ...(cause==='balance'?{balance:{reference:reference(),verifiedRemaining:'50.00'}}:{})} as ApprovedTaskEvent;
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
 const e={...base(),cause:'proposal' as const,proposal:{createdDate:'2026-10-01',expiresDate:'2026-10-10'}};
 const missing=approvedTaskNeeds(e);
 assert.deepEqual(missing.map(x=>x.material.deadline.kind),['unknown','unknown']);
 assert.match((missing[0]!.material.deadline as {reason:string}).reason,/2–3/);
 assert.match((missing[1]!.material.deadline as {reason:string}).reason,/adelanto/);
 const known=approvedTaskNeeds({...e,proposal:{...e.proposal,followupDate:'2026-10-04',preExpiryDays:2}});
 assert.deepEqual(known.map(x=>(x.material.deadline as {date:string}).date),['2026-10-04','2026-10-08']);
 assert.throws(()=>approvedTaskNeeds({...e,proposal:{...e.proposal,followupDate:'2026-10-05'}}),/TASK_TRIGGER_INPUT_INVALID/);
});

test('H5-T12/T13/T15 balance and final participants keep D020 scope and full deadline day',()=>{
 const global=reference('global','2026-10-20'),specific=reference('service','2026-10-22');
 const balance=approvedTaskNeeds({...base(),cause:'balance',balance:{reference:global,verifiedRemaining:'50.00'}})[0]!;
 assert.equal(evaluateTaskDeadline(balance.material.deadline,{date:'2026-10-13'}).overdue,false);
 assert.equal(evaluateTaskDeadline(balance.material.deadline,{date:'2026-10-14'}).overdue,true);
 assert.equal(approvedTaskNeeds({...base(),cause:'balance',balance:{reference:global,verifiedRemaining:'0.00'}}).length,0);
 const final=approvedTaskNeeds({...base(),cause:'final_participants',finalParticipants:{reference:specific}})[0]!;
 assert.equal((final.material.deadline as {reference:{scope:string;date:string};daysBefore:number}).reference.scope,'service');
 assert.equal((final.material.deadline as {reference:{scope:string;date:string};daysBefore:number}).reference.date,'2026-10-22');
 assert.equal((final.material.deadline as {daysBefore:number}).daysBefore,7);
 assert.equal(evaluateTaskDeadline(final.material.deadline,{date:'2026-10-15'}).overdue,false);
 assert.equal(evaluateTaskDeadline(final.material.deadline,{date:'2026-10-16'}).overdue,true);
 const unresolved=approvedTaskNeeds({...base(),cause:'final_participants',finalParticipants:{reference:specific,daysBefore:null}})[0]!;
 assert.equal(unresolved.material.deadline.kind,'unknown');
});
