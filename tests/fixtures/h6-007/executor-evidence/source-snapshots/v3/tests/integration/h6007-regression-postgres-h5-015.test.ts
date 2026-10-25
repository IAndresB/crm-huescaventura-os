import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedJointClosures,read,write} from '../support/h6-007-regression-isolated.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
import {closureCommands} from '../support/h5-closure-fixtures.ts';
import type {JointClosureCommand} from '../../src/domain/closure-assessment.ts';
let h:Awaited<ReturnType<typeof isolatedJointClosures>>;
before(async()=>{h=await isolatedJointClosures('h5015',59545);});after(async()=>{await h?.close();});
test('H5-015 J01 no implicit closure and pending dimensions reject',async()=>{
 const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);
 const c=await closureCommands(h,f.q.bookingId),v=await c.view();assert.equal(v.jointClosure.current,false);
 const q:Omit<JointClosureCommand,'evidenceId'>={action:'close',bookingId:f.q.bookingId,operationId:uid(),expectedRevision:v.revision,expectedMaterial:v.material,expectedJointRevision:0,sourceRef:'SYNTHETIC close',reason:'SYNTHETIC explicit review',at:new Date().toISOString()};
 const hash=(await h.observer`select crm_private.booking_preparation_hash(${JSON.stringify(Object.fromEntries(Object.entries(q).filter(([k])=>k!=='operationId')))}::text::jsonb) h`)[0]!.h;
 const e=h.req('evidence',{claim:'closure:'+hash,coverage:f.q.bookingId,certainty:'reviewed',source_kind:'manual'},f.q.bookingId,'other');await h.evidence.apply(await h.auth(),write,{...e,occurredAt:q.at,coverage:f.q.bookingId});
 await assert.rejects(h.closures.close(await h.auth(),write,{...q,evidenceId:e.targetId}),/DIMENSION_PENDING/);
 assert.equal((await c.view()).jointClosure.history.length,0);
});

import {jointFixture,jointCommands,conclusions} from '../support/h5-joint-closure-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
test('H5-015 J01/J06 explicit closure, canonical projection, replay and duplicate rejection',async()=>{
 const f=await jointFixture(h),j=f.j,v=await j.c.view();assert.equal(v.jointClosure.current,false);
 const q=await j.command(),r=await j.run(q);assert.equal(r.result.status,'Cerrada / Histórico');assert.equal(r.result.actorId,h.actorId);
 assert.equal((await j.run(q)).replayed,true);await assert.rejects(j.run(await j.attest({...q,reason:'different'})),/REPLAY_CONFLICT/);
 await assert.rejects(j.run(await j.command()),/ALREADY_CLOSED/);assert.equal((await j.c.view()).jointClosure.history.length,1);
 const canonical=await h.booking.read(await h.auth(),read,f.bookingId) as {closureAssessments:{jointClosure:{current:boolean}}};assert.equal(canonical.closureAssessments.jointClosure.current,true);
});
for(const omit of ['commercial','operational','economic'] as const)test('H5-015 J01 pending '+omit+' blocks independently',async()=>{
 const f=await jointFixture(h,(['commercial','operational','economic'] as const).filter(d=>d!==omit));
 await assert.rejects(f.j.run(await f.j.command()),/DIMENSION_PENDING/);assert.equal((await f.j.c.view()).jointClosure.revision,0);
});
test('H5-015 J04/J05 close, economic incident, founded reopen, correction, reevaluation and new close',async()=>{
 const f=await jointFixture(h),j=f.j;await j.run(await j.command());const history=(await j.c.view()).jointClosure.history;
 const incident=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id});
 await h.incidents.apply(await h.auth(),write,await incident.command('detect',{...incident.data,severity:'Importante',impact:{...incident.impact,effect:'economic-review'}}));
 let v=await j.c.view();assert.equal(v.jointClosure.current,false);assert.equal(v.assessments.economic!.currentStatus,'Pendiente');assert.equal(v.assessments.commercial!.currentStatus,'Resuelto');assert.equal(v.assessments.operational!.currentStatus,'Resuelto');assert.equal(v.invalidations.length,1);
 await j.c.run(await j.c.command('economic',{}, {action:'reopen',serviceApplicability:await j.flags()}));
 await assert.rejects(j.c.run(await j.c.command('economic',{}, {action:'reopen',serviceApplicability:await j.flags()})),/NOT_RESOLVED/);
 await h.incidents.apply(await h.auth(),write,await incident.resolve());await h.incidents.apply(await h.auth(),write,await incident.close());
 await j.c.run(await j.c.command('economic',{...conclusions.economic,'economic-incidents':'not_applicable'},{action:'evaluate',serviceApplicability:await j.flags()}));
 assert.equal((await j.c.view()).jointClosure.current,false);await j.run(await j.command());v=await j.c.view();assert.equal(v.jointClosure.current,true);assert.equal(v.jointClosure.revision,2);assert.deepEqual(v.jointClosure.history.slice(0,1),history);
});
test('H5-015 J05 unfounded explicit reopen is rejected',async()=>{
 const f=await jointFixture(h);await assert.rejects(f.j.c.run(await f.j.c.command('commercial',{}, {action:'reopen'})),/REOPEN_UNFOUNDED/);assert.equal((await f.j.c.view()).revision,6);
});
test('H5-015 J02 global critical guard persists invalidation even outside dimension materiality filter',async()=>{
 const f=await jointFixture(h),j=f.j;await j.run(await j.command());
 const incident=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id});
 await h.incidents.apply(await h.auth(),write,await incident.command('detect',{...incident.data,impact:{...incident.impact,material:false,effect:'complete-close'}}));
 const v=await j.c.view();assert.equal(v.jointClosure.current,false);assert.equal(v.assessments.operational!.currentStatus,'Pendiente');
});
test('H5-015 J02 critical exception is explicit, scoped and cannot waive economic incident',async()=>{
 const f=await jointFixture(h,[]),j=f.j,incident=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id});
 await h.incidents.apply(await h.auth(),write,await incident.detect());
 await h.incidents.apply(await h.auth(),write,await incident.justify());
 await j.resolve('commercial');await j.resolve('economic');
 await j.c.run(await j.c.command('operational',{...conclusions.operational,'critical-incidents':'satisfied'}));
 await j.c.run(await j.c.command('operational',{...conclusions.operational,'critical-incidents':'satisfied'},{action:'evaluate'}));
 await j.run(await j.command());assert.equal((await j.c.view()).jointClosure.current,true);
 const economic=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id});
 await h.incidents.apply(await h.auth(),write,await economic.command('detect',{...economic.data,impact:{...economic.impact,effect:'economic-review'}}));
 await h.incidents.apply(await h.auth(),write,await economic.justify());assert.equal((await j.c.view()).jointClosure.current,false);
 await assert.rejects(j.run(await j.command()),/DIMENSION_PENDING/);
});
for(const target of ['b06_joint_closures','b06_closure_operations','commit'] as const)test('H5-015 J08 rollback at '+target+' and retry',async()=>{
 const f=await jointFixture(h),j=f.j,q=await j.command(),before=await j.c.view(),table=target==='commit'?'b06_joint_closures':target;
 await h.admin.unsafe("create function crm_private.h5015_fail()returns trigger language plpgsql as $$begin raise exception 'H5015_INJECTED';end$$");
 await h.admin.unsafe(target==='commit'?`create constraint trigger h5015_fail after insert on crm_private.${table} deferrable initially deferred for each row execute function crm_private.h5015_fail()`:`create trigger h5015_fail before insert on crm_private.${table} for each row execute function crm_private.h5015_fail()`);
 try{await assert.rejects(j.run(q));assert.deepEqual(await j.c.view(),before);assert.equal((await h.observer`select count(*)::int n from crm_private.b06_closure_operations where operation_id=${q.operationId}::uuid`)[0]!.n,0);}finally{await h.admin.unsafe(`drop trigger h5015_fail on crm_private.${table};drop function crm_private.h5015_fail()`);}
 assert.equal((await j.run(q)).replayed,false);assert.equal((await j.run(q)).replayed,true);
});
test('H5-015 J08 source mutation and invalidation roll back together on deferred error',async()=>{
 const f=await jointFixture(h),j=f.j;await j.run(await j.command());const before=await j.c.view();
 const incident=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id}),q=await incident.command('detect',{...incident.data,severity:'Importante',impact:{...incident.impact,effect:'economic-review'}});
 await h.admin.unsafe("create function crm_private.h5015_invalid_fail()returns trigger language plpgsql as $$begin raise exception 'H5015_INVALIDATION_INJECTED';end$$");
 await h.admin.unsafe('create trigger h5015_invalid_fail before insert on crm_private.b06_closure_invalidations for each row execute function crm_private.h5015_invalid_fail()');
 try{await assert.rejects(h.incidents.apply(await h.auth(),write,q));assert.deepEqual(await j.c.view(),before);assert.equal(await incident.state(),null);}finally{await h.admin.unsafe('drop trigger h5015_invalid_fail on crm_private.b06_closure_invalidations;drop function crm_private.h5015_invalid_fail()');}
 await h.incidents.apply(await h.auth(),write,q);const v=await j.c.view();assert.equal(v.jointClosure.current,false);assert.equal(v.invalidations.length,1);const cause=v.invalidations[0]!.cause as {sourceTable:string;sourceRecord:{operation_id:string;actor_id:string;evidence_id:string}};
 assert.equal(cause.sourceTable,'b07_incident_revisions');assert.equal(cause.sourceRecord.operation_id,q.operationId);assert.equal(cause.sourceRecord.actor_id,h.actorId);assert.equal(cause.sourceRecord.evidence_id,q.evidenceId);
});
test('H5-015 J03 insufficient No aplica cannot authorize joint closure',async()=>{
 const f=await jointFixture(h,['commercial','operational']),j=f.j;
 const q=await j.c.command('economic',conclusions.economic,{serviceApplicability:await j.flags()});
 await assert.rejects(j.c.run(await j.c.proof({...q,criteria:q.criteria.map(c=>({...c,reason:' '}))})),/CRITERION_UNSUPPORTED/);
 await assert.rejects(j.run(await j.command()),/DIMENSION_PENDING/);
});
