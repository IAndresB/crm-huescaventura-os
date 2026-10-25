import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedClosures,read,write} from '../support/h6-007-regression-isolated.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
let h:Awaited<ReturnType<typeof isolatedClosures>>;
before(async()=>{h=await isolatedClosures('h5013',59513);});after(async()=>{await h?.close();});
test('H5-013 N01: canonical Booking has no closure by omission',async()=>{
 const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);
 const v=await h.closures.read(await h.auth(),read,f.q.bookingId);assert.equal(v.revision,0);assert.deepEqual(v.assessments,{});
 assert.ok(v.inputs);
});

import {randomUUID as uid} from 'node:crypto';
import {closureCommands} from '../support/h5-closure-fixtures.ts';
import {realityFixture} from '../support/h4-reality-fixtures.ts';
import {preparationFixture} from '../support/h4-booking-preparation-fixtures.ts';
import {requirementFixture} from '../support/h4-requirement-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {depositFixture} from '../support/h4-deposit-fixtures.ts';
import {refundFixture} from '../support/h4-refund-fixtures.ts';
import {providerPaymentFixture} from '../support/h3-provider-payment-fixtures.ts';
import {ownEconomicsFixture} from '../support/h3-own-economics-fixtures.ts';
const commercial={documents:'not_applicable', 'final-terms':'satisfied', modifications:'not_applicable'} as const;
const operational={documents:'not_applicable',performance:'satisfied','critical-incidents':'not_applicable'} as const;
const flags=(v:any,extra:Record<string,unknown>={})=>(v.inputs.services as any[]).map(s=>({serviceId:s.service_id,suplido:false,deposit:false,ownEconomics:false,reason:'SYNTHETIC explicit service applicability review; canonical obligations cannot be waived',...extra}));
const econ={documents:'not_applicable','customer-obligations':'satisfied','supplier-documents':'not_applicable','own-economics':'not_applicable',refunds:'not_applicable',deposits:'not_applicable','economic-incidents':'not_applicable','cancellation-obligations':'not_applicable'} as const;

test('H5-013 P01/P02/N05/N09: explicit commercial assessment, replay and exact history',async()=>{
 const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);const c=await closureCommands(h,f.q.bookingId);
 await assert.rejects(c.run(await c.command('commercial',commercial,{action:'evaluate'})),/OPEN_REQUIRED/);
 const q=await c.command('commercial',commercial),r=await c.run(q);assert.equal(r.result.status,'Pendiente');assert.deepEqual(Object.keys((await c.view()).assessments),['commercial']);
 const done=await c.command('commercial',commercial,{action:'evaluate'});assert.equal((await c.run(done)).result.status,'Resuelto');
 assert.equal((await c.run(done)).replayed,true);await assert.rejects(c.run({...done,reason:'different'}),/REPLAY_CONFLICT:E2/);
 const v=await c.view();assert.equal(v.history.length,2);assert.equal(v.assessments.commercial!.applicable,true);assert.equal(v.assessments.commercial!.actorId,h.actorId);
 assert.ok(v.assessments.commercial!.evidenceId);await assert.rejects(c.run(await c.command('commercial',commercial)),/REOPEN_RESERVED/);
 const projected:any=await h.booking.read(await h.auth(),read,f.q.bookingId);assert.equal(projected.closureAssessments.assessments.commercial.status,'Resuelto');assert.notEqual(projected.booking.state,'Cerrada / Histórico');
});
test('H5-013 N01/N05: no missing criterion, no unsupported No aplica, evidence and stale revision',async()=>{
 const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);const c=await closureCommands(h,f.q.bookingId);
 for(const changes of [{criteria:[]},{criteria:[{id:'performance',conclusion:'not_applicable' as const,reason:'unsupported'}]}])await assert.rejects(c.run(await c.command('operational',{},changes)));
 const q=await c.command('commercial',commercial);await assert.rejects(c.run({...q,evidenceId:uid()}),/EVIDENCE_REQUIRED/);
 await c.run(q);await assert.rejects(c.run({...await c.proof({...q,operationId:uid()}),expectedMaterial:'old'}),/EVIDENCE_REQUIRED/);
 const old=await c.command('operational');await c.run(await c.command('commercial'));await assert.rejects(c.run(old),/MATERIAL_CONFLICT/);
 assert.equal((await c.view()).revision,2);
});
test('H5-013 P03: actual performance resolves operational only; Ganada/Finalizada do not evaluate',async()=>{
 const f=await realityFixture(h);await f.run(await f.command('start'));await f.run(await f.command('perform'));await f.run(await f.command('finish'));
 const c=await closureCommands(h,f.f.bid);assert.deepEqual((await c.view()).assessments,{});
 await c.run(await c.command('operational',operational));assert.equal((await c.run(await c.command('operational',operational,{action:'evaluate'}))).result.status,'Resuelto');
 assert.equal((await c.view()).assessments.economic,undefined);
});
test('H5-013 N14/N07: documentary need affects only its explicit dimension and reads canonical latest revision',async()=>{
 const f=await requirementFixture(h);await h.requirements.apply(await h.auth(),write,await f.need());const c=await closureCommands(h,f.bookingId);
 const deps=[{requirementId:f.requirementId,dimensions:['operational' as const],reason:'SYNTHETIC permission required solely for performance'}];
 await assert.rejects(c.run(await c.command('commercial',commercial)),/DOCUMENT_DEPENDENCIES_REQUIRED/);
 await c.run(await c.command('commercial',commercial,{documentDependencies:deps}));await c.run(await c.command('commercial',commercial,{action:'evaluate',documentDependencies:deps}));
 await c.run(await c.command('operational',{}, {documentDependencies:deps}));
 assert.equal((await c.view()).assessments.operational!.criteria.find(x=>x.id==='documents')!.result,'pending');
 await h.requirements.apply(await h.auth(),write,await f.receive());await h.requirements.apply(await h.auth(),write,await f.review());
 const v=await c.view();assert.equal(v.assessments.commercial!.applicable,true);assert.equal(v.assessments.operational!.applicable,false);assert.equal(v.history.length,3);
});
test('H5-013 N05/N15: economic incident remains blocking with permitted critical justification',async()=>{
 const f=await incidentFixture(h);await h.incidents.apply(await h.auth(),write,await f.command('detect',{...f.data,impact:{...f.impact,effect:'economic-review'}}));
 await h.incidents.apply(await h.auth(),write,await f.justify());const c=await closureCommands(h,f.bookingId);const v=await c.view();
 const q=await c.command('economic',{}, {serviceApplicability:flags(v)});await c.run(q);
 const ev=(await c.view()).assessments.economic!;assert.equal(ev.status,'Pendiente');assert.equal(ev.criteria.find(x=>x.id==='economic-incidents')!.result,'pending');
 await h.incidents.apply(await h.auth(),write,await f.resolve());await h.incidents.apply(await h.auth(),write,await f.close());
 assert.equal((await c.view()).assessments.economic!.status,'Pendiente');assert.equal((await c.view()).revision,1);
});
test('H5-013 N04: deposit partial retention and pending return block economic criterion',async()=>{
 const f=await depositFixture(h);await f.initialize();await f.run(await f.delivery());await f.run(await f.evaluate());await(await f.approval(await f.determination('20.00'))).execute();await f.run(await f.fact('retain','20.00','0.00'));
 const c=await closureCommands(h,f.bid),v=await c.view();await c.run(await c.command('economic',{}, {serviceApplicability:flags(v)}));
 const e=(await c.view()).assessments.economic!;assert.equal(e.criteria.find(x=>x.id==='deposits')!.result,'pending');assert.equal(e.criteria.find(x=>x.id==='refunds')!.result,'pending');
 await f.run(await f.fact('return','80.00','20.00'));assert.equal((await c.view()).assessments.economic!.applicable,false);
});
test('H5-013 N03: unexecuted refund and cancellation right remain pending',async()=>{
 const f=await refundFixture(h);await f.run(await f.request());await f.run(await f.determine());await(await f.approval(await f.authorization())).execute();
 const c=await closureCommands(h,f.bid);await c.run(await c.command('economic',{}, {serviceApplicability:flags(await c.view())}));
 assert.equal((await c.view()).assessments.economic!.criteria.find(x=>x.id==='refunds')!.result,'pending');
});
test('H5-013 N02: actual supplier payment without invoice cannot resolve economy',async()=>{
 const f=await providerPaymentFixture(h);await h.providerPayments.apply(await h.auth(),write,await f.open());const a=await f.assign('500.00');const part=await f.portion(a);await(await f.approval(await f.schedule([part],'500.00'))).execute();
 await h.providerPayments.apply(await h.auth(),write,await f.movement([part],'500.00'));
 const c=await closureCommands(h,f.su.bookingId);await c.run(await c.command('economic',{}, {serviceApplicability:flags(await c.view())}));
 const e=(await c.view()).assessments.economic!;assert.equal(e.criteria.find(x=>x.id==='supplier-documents')!.result,'pending');assert.equal(e.status,'Pendiente');
 await h.suplidos.apply(await h.auth(),write,await f.su.attachInvoice());
 await c.run(await c.command('economic',{'supplier-documents':'satisfied'}, {action:'evaluate',serviceApplicability:flags(await c.view())}));
 const history=(await c.view()).history;
 const correction=await f.su.invoice.attest({...await f.su.invoice.correct(),bookingId:f.su.bookingId,expectedRevision:4,affectedServiceIds:[f.su.basis.serviceId],affectedRecipientId:f.su.basis.clientId,affectedAmount:'500.00'});await h.invoices.apply(await h.auth(),write,correction);
 const after=await c.view();assert.equal(after.assessments.economic!.applicable,false);assert.equal(after.assessments.economic!.currentStatus,'Pendiente');assert.deepEqual(after.history,history);
 await c.run(await c.command('economic',{}, {action:'evaluate',serviceApplicability:flags(after)}));assert.equal((await c.view()).assessments.economic!.criteria.find(x=>x.id==='supplier-documents')!.result,'pending');
});
test('H5-013 N13: internal Tarari never creates external invoice, unknown own costs block',async()=>{
 const f=await ownEconomicsFixture(h);const input=structuredClone(f.input);Object.assign(input.costs[0]!.phases.real,{input:null});await h.ownEconomics.apply(await h.auth(),write,await f.command({input}));
 const c=await closureCommands(h,f.bookingId);await c.run(await c.command('economic',{}, {serviceApplicability:flags(await c.view(),{ownEconomics:true})}));
 const e=(await c.view()).assessments.economic!;assert.equal(e.criteria.find(x=>x.id==='own-economics')!.result,'pending');assert.deepEqual((await c.view()).inputs.invoices,[]);
 await assert.rejects(c.run(await c.command('economic',{}, {serviceApplicability:flags(await c.view(),{suplido:true})})),/SERVICE_APPLICABILITY_REQUIRED/);
});

test('H5-013 P04/P05: current fully covered customer obligation and explicit no-applicability resolve economic only',async()=>{
 const f=await settledInternalFixture(h);const c=await closureCommands(h,f.bookingId),app=flags(await c.view());
 await c.run(await c.command('economic',{...econ,'own-economics':'satisfied'},{serviceApplicability:app}));const r=await c.run(await c.command('economic',{...econ,'own-economics':'satisfied'},{action:'evaluate',serviceApplicability:app}));
 assert.equal(r.result.status,'Resuelto');assert.equal((await c.view()).assessments.commercial,undefined);assert.equal((await c.view()).assessments.operational,undefined);
 assert.ok(r.result.criteria.filter(x=>x.result==='not_applicable').every(x=>x.review.reason.length>0));
});
test('H5-013 N15: operational critical justification lifts only incident guard, never actual performance',async()=>{
 const f=await incidentFixture(h);await h.incidents.apply(await h.auth(),write,await f.detect());const c=await closureCommands(h,f.bookingId);
 await c.run(await c.command('operational'));let e=(await c.view()).assessments.operational!;assert.equal(e.criteria.find(x=>x.id==='critical-incidents')!.result,'pending');
 await h.incidents.apply(await h.auth(),write,await f.justify());await c.run(await c.command('operational',{'critical-incidents':'satisfied'},{action:'evaluate'}));
 e=(await c.view()).assessments.operational!;assert.equal(e.criteria.find(x=>x.id==='critical-incidents')!.result,'satisfied');assert.equal(e.criteria.find(x=>x.id==='performance')!.result,'pending');assert.equal(e.status,'Pendiente');
});
test('H5-013 N08/N16: invalid auth, direct SQL, other scope and unsupported joint close deny without writes',async()=>{
 const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);const c=await closureCommands(h,f.q.bookingId),q=await c.command('commercial',commercial);
 await assert.rejects(h.closures.apply({} as any,write,q),/AUTH_REQUIRED/);await assert.rejects(h.closures.apply(await h.auth(),read,q),/AUTH_REQUIRED/);
 for(const sql of ['select * from crm_private.b06_closure_assessments','select crm_private.closure_inputs(null,null)','select crm_api.closure_apply(null,null,null,null,null)'])await assert.rejects(h.runtime.unsafe(sql));
 await assert.rejects(c.run(await c.proof({...q,action:'close-jointly'} as any)),/INPUT_INVALID/);
 await assert.rejects(c.run(await c.proof({...q,bookingId:uid()})),/DENIED/);assert.equal((await c.view()).revision,0);
 const other=await bookingFixture(h);await h.booking.apply(await h.auth(),write,other.q);await c.run(q);assert.deepEqual((await h.closures.read(await h.auth(),read,other.q.bookingId)).assessments,{});
});
for(const target of ['b06_closure_assessments','b06_closure_operations','deferred'] as const)test('H5-013 N11: rollback and retry at '+target,async()=>{
 const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);const c=await closureCommands(h,f.q.bookingId),q=await c.command('commercial',commercial),before=await c.view();
 await h.admin.unsafe("create function crm_private.h5013_fail()returns trigger language plpgsql as $$begin raise exception 'CLOSURE_INJECTED_FAILURE';end$$");
 const table=target==='deferred'?'b06_closure_assessments':target;
 await h.admin.unsafe(target==='deferred'?`create constraint trigger h5013_fail after insert on crm_private.${table} deferrable initially deferred for each row execute function crm_private.h5013_fail()`:`create trigger h5013_fail before insert on crm_private.${table} for each row execute function crm_private.h5013_fail()`);
 try{await assert.rejects(c.run(q));assert.deepEqual(await c.view(),before);}finally{await h.admin.unsafe(`drop trigger h5013_fail on crm_private.${table};drop function crm_private.h5013_fail()`);}
 assert.equal((await c.run(q)).result.status,'Pendiente');assert.equal((await c.run(q)).replayed,true);assert.equal((await c.view()).history.length,1);
});

import {settledInternalFixture} from '../support/h5-closure-settlement-fixture.ts';

import {H5001TaskAdapter} from '../../src/infrastructure/postgres/h5-task-adapter.ts';
import {modificationFixture} from '../support/h4-modification-fixtures.ts';
test('H5-013 N06: completing Task preserves the unpaid obligation and explicit assessment',async()=>{
 const f=await requirementFixture(h);await h.requirements.apply(await h.auth(),write,await f.need());const c=await closureCommands(h,f.bookingId);
 const documentDependencies=[{requirementId:f.requirementId,dimensions:['operational' as const],reason:'SYNTHETIC scoped permission for operation'}];
 await c.run(await c.command('operational',{}, {documentDependencies}));const before=await c.view(),tasks=new H5001TaskAdapter(h.runtime,h.f1,h.f2),taskId=uid();
 await tasks.apply(await h.auth(),write,{action:'receive',operationId:uid(),taskId,expectedRevision:0,identity:{causeKind:'document',causeId:f.requirementId,contextKind:'booking',contextId:f.bookingId,scopeRef:f.requirementId,relatedKind:null,relatedId:null,effect:'document-review'},material:{title:'SYNTHETIC review permission',deadline:{kind:'unknown',reason:'SYNTHETIC no recorded deadline'},priority:{kind:'pending',reason:'SYNTHETIC unconfigured'},sourceRef:'SM-TA-01',sourceVersion:'1',triggerRef:'BR-TASK-005',triggerVersion:'1'},reason:'SYNTHETIC explicit follow-up'});
 await tasks.transition(await h.auth(),write,{action:'complete',operationId:uid(),taskId,expectedRevision:1,reason:'SYNTHETIC work done only',result:'SYNTHETIC follow-up call',references:[f.requirementId]});
 assert.deepEqual(await c.view(),before);assert.equal((await f.see())!.status,'Pendiente');
});
test('H5-013 N07: new requested modification invalidates commercial applicability without rewriting history or resolving other dimensions',async()=>{
 const f=await modificationFixture(h),c=await closureCommands(h,f.bookingId);
 await c.run(await c.command('commercial',commercial));await c.run(await c.command('commercial',commercial,{action:'evaluate'}));const before=(await c.view()).history;
 await f.run(await f.request());const v=await c.view();assert.equal(v.assessments.commercial!.applicable,false);assert.equal(v.assessments.commercial!.status,'Resuelto');assert.equal(v.assessments.commercial!.currentStatus,'Pendiente');assert.deepEqual(v.history,before);
 assert.deepEqual(Object.keys(v.assessments),['commercial']);
});
test('H5-013 N08: disabled actor denies even replay and existing Booking from another scope does not leak',async()=>{
 const h=await isolatedClosures('h5013security',59516);try{
 const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);const c=await closureCommands(h,f.q.bookingId),q=await c.command('commercial',commercial);await c.run(q);
 const auth=await h.auth();await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,false,'ready')`;
 try{await assert.rejects(h.closures.apply(auth,write,q));await assert.rejects(h.closures.read(auth,read,f.q.bookingId));}finally{await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,true,'ready')`;}
 h.auth=(await secondWorkActor(h)).auth;
 await h.admin.unsafe('alter table crm_private.b04_bookings disable trigger user');await h.admin`update crm_private.b04_bookings set admin_scope='SYNTHETIC-foreign' where booking_id=${f.q.bookingId}::uuid`;await h.admin.unsafe('alter table crm_private.b04_bookings enable trigger user');
 try{await assert.rejects(c.view(),/DENIED/);await assert.rejects(c.run(q),/DENIED/);}finally{await h.admin.unsafe('alter table crm_private.b04_bookings disable trigger user');await h.admin`update crm_private.b04_bookings set admin_scope=${h.scope} where booking_id=${f.q.bookingId}::uuid`;await h.admin.unsafe('alter table crm_private.b04_bookings enable trigger user');}
 assert.equal((await c.view()).history.length,1);
 }finally{await h.close();}
});

import {cancelFixture} from '../support/h4-booking-preparation-f23-fixtures.ts';
test('H5-013 P03: complete applied cancellation resolves operational scopes without manufacturing performance or economy',async()=>{
 const f=await preparationFixture(h);const cancellation=await cancelFixture(h,f);await cancellation.applyAll();const c=await closureCommands(h,f.bid);
 await c.run(await c.command('operational',operational));await c.run(await c.command('operational',operational,{action:'evaluate'}));
 const v=await c.view();assert.equal(v.assessments.operational!.currentStatus,'Resuelto');assert.equal(v.assessments.economic,undefined);assert.equal(v.assessments.commercial,undefined);
});
test('H5-013 N05: empty manual applicability cannot waive missing supplier documents or own economics',async()=>{
 const f=await preparationFixture(h,3);await f.pay();const c=await closureCommands(h,f.bid),serviceApplicability=flags(await c.view());
 await c.run(await c.command('economic',{}, {serviceApplicability}));const e=(await c.view()).assessments.economic!;
 assert.equal(e.criteria.find(x=>x.id==='customer-obligations')!.result,'satisfied');assert.equal(e.criteria.find(x=>x.id==='supplier-documents')!.result,'pending');assert.equal(e.criteria.find(x=>x.id==='own-economics')!.result,'pending');
 await assert.rejects(c.run(await c.command('economic',{'supplier-documents':'not_applicable'},{action:'evaluate',serviceApplicability})),/CRITERION_UNSUPPORTED/);
});

test('H5-013 N05: JSON null never bypasses opening or an explicit criterion decision',async()=>{
 const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);const c=await closureCommands(h,f.q.bookingId),q=await c.command('commercial',commercial);
 for(const changes of [{action:null},{dimension:null}])await assert.rejects(c.run(await c.proof({...q,...changes} as any)),/INPUT_INVALID/);
 await assert.rejects(c.run(await c.proof({...q,criteria:q.criteria.map(x=>({...x,conclusion:null}))} as any)),/CRITERION_UNSUPPORTED/);
 assert.equal((await c.view()).revision,0);
});

import {secondWorkActor} from '../support/h5-work-isolated.ts';
