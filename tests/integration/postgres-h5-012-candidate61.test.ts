// Independent acceptance oracle: frozen expected-TSK-H5-011-012.md, 41 cases.
// Fixtures only prepare synthetic canonical state through existing contracts.
// Literal expectations below come from the frozen rows, not implementation output.
import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID as uid,createHash} from 'node:crypto';
import {isolatedBoundaries,boundaryFixture,read,write} from '../support/h5-boundary-isolated.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
import {acceptanceFixture} from '../support/h2-acceptance-fixtures.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {holdFixture} from '../support/h4-hold-fixtures.ts';
import {requirementFixture} from '../support/h4-requirement-fixtures.ts';
import {ManualExternalBoundaryDouble} from '../../src/domain/external-boundary.ts';
import {secondWorkActor,workFixture} from '../support/h5-work-isolated.ts';
import {obligationFixture} from '../support/h3-obligation-fixtures.ts';
import {cancellationFixture} from '../support/h4-cancellation-fixtures.ts';
import {confirmationFixture} from '../support/h4-confirmation-fixtures.ts';
import {modificationFixture} from '../support/h4-modification-fixtures.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
import {H1003ResolutionAdapter} from '../../src/infrastructure/postgres/h1-resolution-adapter.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {classifyServerEvent} from '../../src/application/verified-interaction.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import {issueTrustedContext} from '../../src/application/trusted-context.ts';
import {createF1Issuer,encodeF1Fields} from '../../src/infrastructure/postgres/f1-codec.ts';
import {createF2Issuer} from '../../src/infrastructure/postgres/f2-codec.ts';
import {postgresF1Binding} from '../../src/infrastructure/postgres/transaction.ts';
import {canonicalCommercial} from '../../src/domain/commercial-progress.ts';
import {projectCivilReference,cancellationProjection,type ProjectionQuery} from '../../src/domain/coordinated-projection.ts';
import {civilReference,localDate,zoneEvidence,selectReference,explicitHourlyDeadline,hourlyDeadlineExpired,instant} from '../../src/domain/civil-time.ts';
import {evaluateExpected} from '../../src/domain/payment-obligation.ts';

let h:Awaited<ReturnType<typeof isolatedBoundaries>>,reader:H5011ProjectionAdapter;
let a:Awaited<ReturnType<typeof bookingFixture>>,b:typeof a,c:Awaited<ReturnType<typeof communicationFixture>>;
let version:string,missingVersion:string;
const markers=['PRIVATE-COST-719','PRIVATE-MARGIN-283','PRIVATE-PROFIT-514','PRIVATE-COMMISSION-626','PRIVATE-FEE-807','PRIVATE-PERSON-333'];
const bytes=Buffer.from('SYNTHETIC explicitly authorized original '+markers.join(' '));
const q=(id:string,extra:Partial<ProjectionQuery>={}):ProjectionQuery=>({contextKind:'booking',contextId:id,surface:'timeline',destination:'administrator',...extra});
const entries=(r:any):any[]=>{assert.ok(r);assert.equal(r.mutationAuthority,false);return r.entries;};
const facts=(r:any,kind:string)=>entries(r).filter(e=>e.source==='crm_private.'+kind).map(e=>e.data);
const get=async(id=a.q.bookingId,extra:Partial<ProjectionQuery>={})=>reader.read(await h.auth(),read,q(id,extra));
const tables=['b04_bookings','b04_services','b04_nights','b04_operational_versions','b03_acceptances','b03_proposal_versions','b07_records','b07_links','b07_object_versions','b07_communication_work','b07_pending_tasks','b09_event_receipts'];
async function snapshot(){const out:Record<string,unknown>={};for(const t of tables)out[t]=Array.from(await h.observer.unsafe(`select md5(coalesce(string_agg(x::text,',' order by x::text),'')) hash from crm_private.${t} x`));return out;}
async function pure(action:()=>Promise<void>){const old=await snapshot();await action();assert.deepEqual(await snapshot(),old,'projection must not mutate canonical business/history/object state');}
const book=async()=>{const x=await bookingFixture(h);await h.booking.apply(await h.auth(),write,x.q);return x;};
const resolution=async(action:any,targetId:string,kind:any='contact',relatedId?:string)=>new H1003ResolutionAdapter(h.runtime,h.f1,h.f2).apply(await h.auth(),write,{action,targetId,kind,relatedId,operationId:uid(),expectedVersion:action==='assign_code'?0:Number((await h.observer`select version from crm_private.identity_entities where identity_id=${targetId}::uuid`)[0]!.version),sourceRef:'synthetic human resolution',evidenceRef:'synthetic explicit evidence',reason:'independent H5-012'});
let hAuth:Awaited<ReturnType<typeof verifyAuth>>;
async function document(material:Record<string,unknown>,occurredAt?:string){const id=uid();await h.evidence.apply(await h.auth(),write,{action:'create',operationId:uid(),targetId:id,kind:'document',material:{content_kind:'manual_record',...material},sourceRef:'independent synthetic original',purpose:'independent internal history',contextKind:'booking',contextId:a.q.bookingId,coverage:'independent scope',reason:'explicit synthetic authorization',...(occurredAt?{occurredAt}:{})});return id;}
before(async()=>{
 h=await isolatedBoundaries('h512c61',59450);
 for(const name of ['20261014003559_h5_authorized_projections.sql','20261015172843_h5_calendar_current_nights.sql','20261015180420_h5_projection_canonical_revisions.sql','20261015190418_h5_calendar_night_operational_state.sql'])await h.migration.unsafe(await readFile('supabase/migrations/'+name,'utf8'));
 reader=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);hAuth=await h.auth();a=await book();b=await book();
 c=await communicationFixture(h,'incoming',a.q.bookingId);
 await c.run({...c.derive('summary'),content:markers.join(' ')});await c.run(c.derive('candidate'));
 await document({relation:'original',content_ref:markers.join(' '),content_kind:'manual_record',storage_state:'reference_only'});
 version=uid();missingVersion=uid();
 for(const v of [version,missingVersion])await h.objects.prepare(await h.auth(),write,{...c.context,operationId:uid(),versionId:v,rootId:uid(),expectedVersion:0,documentId:c.originalId,digest:createHash('sha256').update(bytes).digest('hex'),size:bytes.length,media:'text/plain',sourceRef:'synthetic explicit permission',reason:'independent original preservation'});
 await h.objects.upload(await h.auth(),read,write,version,c.context,bytes,uid());await h.objects.reconcile(await h.auth(),read,write,version,c.context,uid());await h.objects.link(await h.auth(),read,write,version,c.context,uid());
});
after(async()=>{await h?.close();});

test('H5-012 H01 canonical chain, exact version/acceptance and references',async()=>pure(async()=>{
 const r=await get();assert.ok(facts(r,'b04_bookings').some(x=>x.booking_id===a.q.bookingId&&x.version_id===a.q.versionId&&x.acceptance_id===a.q.acceptanceId));
 assert.ok(facts(r,'b03_proposal_versions').some(x=>x.version_id===a.q.versionId));assert.ok(facts(r,'b03_acceptances').some(x=>x.acceptance_id===a.q.acceptanceId));assert.ok(facts(r,'b04_history').length);assert.ok(facts(r,'b07_records').some(x=>x.record_id===c.originalId));
}));
test('H5-012 H02 late and unknown moments remain distinct',async()=>{
 const late=await document({relation:'original',content_ref:'late',storage_state:'reference_only'},'2026-10-10T08:11:00Z'),early=await document({relation:'original',content_ref:'early',storage_state:'reference_only'},'2026-10-11T09:12:00Z'),unknown=await document({relation:'original',content_ref:'unknown',storage_state:'reference_only'});
 await pure(async()=>{const es=entries(await get());for(const [id,when] of [[late,'2026-10-10T08:11:00'],[early,'2026-10-11T09:12:00'],[unknown,null]]){const e=es.find(x=>x.data?.record_id===id);assert.ok(e);if(when)assert.equal(Date.parse(e.occurredAt),Date.parse(when+'Z'));else assert.equal(e.occurredAt,null);assert.ok(e.recordedAt);assert.notEqual(e.occurredAt,e.recordedAt);}});
});
test('H5-012 H03 attributed phone acceptance and rectification remain retrievable',async()=>{
 const f=await acceptanceFixture(h),r=await f.register();await h.acceptance.apply(await h.auth(),write,await f.verification(r));
 const at=new Date().toISOString(),evidenceId=await f.proof(`acceptance:error:${r.acceptanceId}`,r.coverage,at),review=await f.proof(`acceptance:reevaluate:${r.acceptanceId}:Necesidad definida`,r.coverage,at);
 await h.acceptance.apply(await h.auth(),write,await f.q({action:'rectify',acceptanceId:r.acceptanceId,coverage:r.coverage,at,evidenceId,humanReviewed:true,reevaluation:{destination:'Necesidad definida',evidenceId:review,dependentEffects:['verification','commercial']}}));
 await pure(async()=>{const result=await get(f.opp.targetId,{contextKind:'opportunity'}),original=facts(result,'b03_acceptances').find(x=>x.acceptance_id===r.acceptanceId);assert.ok(original);assert.equal(original.accepter_id,f.accepterId);assert.equal(original.version_id,f.versionId);assert.equal(original.channel,'phone');assert.ok(facts(result,'b03_acceptance_verifications').length);assert.ok(facts(result,'b03_acceptance_rectifications').some(x=>x.acceptance_id===r.acceptanceId));assert.ok(JSON.stringify(original).includes('H2-T1'));});
});
test('H5-012 H04 provenance distinguishes human recorder and automatic derivative',async()=>pure(async()=>{
 const r=await get(),original=facts(r,'b07_records').find(x=>x.record_id===c.recordId),derived=facts(r,'b07_communication_work').find(x=>x.kind==='summary');assert.ok(original);assert.ok(derived);assert.equal(original.material.sender_ref,'synthetic-person');assert.equal(derived.material.origin,'synthetic_automatic');assert.equal(derived.recorded_by,h.actorId);assert.equal(derived.original_id,c.originalId);assert.ok(derived.recorded_at);assert.notEqual(original.material.sender_ref,derived.recorded_by);assert.ok(facts(r,'b07_history').length);
}));
test('H5-012 H05 original bytes, derivative and incomplete conservation reauthorize',async()=>pure(async()=>{
 assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,version,c.context)),bytes);await assert.rejects(h.objects.download(await h.auth(),read,missingVersion,c.context));
 assert.equal((await h.objects.metadata(await h.auth(),read,missingVersion,c.context))!.state,'prepared');
 const r=await get();assert.equal(facts(r,'b07_records').find(x=>x.record_id===c.originalId).material.relation,'original');const d=facts(r,'b07_communication_work').find(x=>x.kind==='summary');assert.equal(d.original_id,c.originalId);assert.notEqual(d.work_id,c.originalId);
 await assert.rejects(h.objects.download({} as never,read,version,c.context));
}));
test('H5-012 H06 archive hides normal view and preserves recovery without closure',async()=>{
 const id=a.f.accepterId;await resolution('archive',id);await pure(async()=>{assert.equal(await get(id,{contextKind:'contact'}),null);const recovered=await get(id,{contextKind:'contact',includeArchived:true});assert.ok(facts(recovered,'identity_entities').some(x=>x.identity_id===id&&x.archived_at));assert.ok(facts(recovered,'b04_bookings').some(x=>x.booking_id===a.q.bookingId));assert.ok(facts(recovered,'identity_history').length);});
});
test('H5-012 H07 human identity merge preserves two histories and distinct Bookings',async()=>{
 await resolution('restore',a.f.accepterId);await resolution('merge',b.f.accepterId,'contact',a.f.accepterId);await pure(async()=>{const r=await get(a.f.accepterId,{contextKind:'contact',includeArchived:true});const ids=facts(r,'identity_entities').map(x=>x.identity_id);assert.ok(ids.includes(a.f.accepterId)&&ids.includes(b.f.accepterId));const roots=facts(r,'b04_bookings').map(x=>x.booking_id);assert.ok(roots.includes(a.q.bookingId)&&roots.includes(b.q.bookingId));assert.equal(facts(await get(),'b04_bookings').length,1);await assert.rejects(reader.read(await h.auth(),read,{...q(a.q.bookingId),mergeBookings:true} as never),/INPUT_INVALID/);});
});
test('H5-012 H08 stable distinct codes survive cancelled operation and future service dates',async()=>{
 const x=await cancellationFixture(h,{scopeKind:'booking'});
 for(let index=0;index<x.detail.services.length;index++){const conf=await confirmationFixture(h,x.conf.b,index),m=await modificationFixture(h,conf),request=await m.request([{id:m.partId,scope:m.scope,expectedScopeRevision:1,desired:{cancelled:true},aspects:['cancellation'],dependencies:[]}]);await m.run(await m.attest({...request,data:{...request.data,type:'cancellation'}}));await m.run(await m.evaluate());await m.run(await m.approve());await m.run(await m.apply());}
 await x.m.run(await x.m.evaluate());await x.m.run(await x.m.approve());await x.m.run(await x.m.apply());
 const newer=await book();const ca={code:String((await h.observer`select human_code from crm_private.identity_codes where target_id=${x.b.bookingId}::uuid`)[0]!.human_code)},cb={code:String((await h.observer`select human_code from crm_private.identity_codes where target_id=${newer.q.bookingId}::uuid`)[0]!.human_code)};assert.ok(ca.code&&cb.code);assert.notEqual(ca.code,cb.code);assert.match(ca.code,/RES/);assert.ok(ca.code.includes(String(new Date().getFullYear())));
 await pure(async()=>{const r=await get(x.b.bookingId);assert.equal(facts(r,'identity_codes').find(x=>x.human_code===ca.code)?.human_code,ca.code);assert.ok(facts(r,'b04_operational_versions').length);assert.ok(facts(r,'b04_history').length);await assert.rejects(resolution('assign_code',x.b.bookingId,'RES'),/CODE_ALREADY_ASSIGNED/);await assert.rejects(reader.read(await h.auth(),read,{...q(x.b.bookingId),reuseCode:ca.code,deleteHistory:true} as never));});
});

test('H5-012 C01 calendar exposes canonical services, payments, Tasks and pending schedules',async()=>{
 const hold=await holdFixture(h,'2026-11-13T13:15:00Z');await hold.apply(await hold.grant());const requirement=await requirementFixture(h);await h.requirements.apply(await h.auth(),write,await requirement.need());
 await pure(async()=>{const hr=await get(hold.opportunityId,{contextKind:'opportunity',surface:'calendar'});assert.ok(facts(hr,'b04_holds').some(x=>x.hold_id===hold.holdId));assert.ok(JSON.stringify(hr).includes('2026-11-13T13:15:00'));const rr=await get(requirement.bookingId,{surface:'calendar'});assert.ok(facts(rr,'b07_requirements').some(x=>x.requirement_id===requirement.requirementId));});
 const o=await obligationFixture(h,'1000.00','2026-11-12T10:00:00Z',['2026-11-20','2026-11-22']);await h.obligations.apply(await h.auth(),write,o.q);
 await pure(async()=>{const calendar=entries(await get(a.q.bookingId,{surface:'calendar'}));assert.ok(calendar.some(x=>x.source==='crm_private.b07_pending_tasks'));const services=calendar.filter(x=>x.source==='crm_private.modification_scope');assert.equal(services.length,2);for(const s of services){assert.equal(s.scope.date,'2026-10-20');assert.equal(s.scope.schedule,null);assert.equal(s.certainty,'pending');}assert.ok(facts(await get(o.b.bookingId,{surface:'calendar'}),'b05_expected_payments').length);});
});
test('H5-012 C02 reconstruction pagination and filters bind purpose and root',async()=>pure(async()=>{
 const whole=await get(),again=await get();assert.deepEqual(whole,again);let after:string|undefined,all:unknown[]=[];do{const page=await get(a.q.bookingId,{pageSize:3,...(after?{after}:{})});all.push(...entries(page));after=page!.nextPage;}while(after);assert.deepEqual(all,whole!.entries);
 const page=await get(a.q.bookingId,{pageSize:3});assert.ok(page!.nextPage);await assert.rejects(get(b.q.bookingId,{pageSize:3,after:page!.nextPage}),/DENIED/);await assert.rejects(get(a.q.bookingId,{pageSize:3,after:page!.nextPage,destination:'customer'}),/DENIED/);
 assert.equal(entries(await get(a.q.bookingId,{search:b.q.bookingId})).length,0);
}));
test('H5-012 C03 full seventh day balance and final-count civil reference',async()=>{
 const o=await obligationFixture(h,'1000.00','2026-11-12T10:00:00Z',['2026-11-20','2026-11-22']);await h.obligations.apply(await h.auth(),write,o.q);
 await pure(async()=>{const r=await get(o.b.bookingId),parts=facts(r,'b05_expected_payments');assert.equal(parts.length,2);const balance=parts.find(x=>x.slot==='balance');assert.ok(balance);assert.equal(balance.amount,500);assert.deepEqual(balance.due,{kind:'civil',date:'2026-11-13'});
 console.log('H512 C03 projected payments',JSON.stringify(parts));
 const reference=o.q.definition!.reference;for(const [at,days,expired] of [['2026-11-13T00:00:00+01:00',7,false],['2026-11-13T23:59:59+01:00',7,false],['2026-11-14T00:00:00+01:00',6,true]] as const){assert.equal(projectCivilReference(reference,at).evaluation!.daysBefore,days);assert.equal(evaluateExpected({slot:'balance',amount:String(balance.amount)+'.00',due:balance.due},reference,at).expired,expired);}assert.ok(JSON.stringify(parts).includes('2026-11-13'));assert.ok(JSON.stringify(parts).includes('500'));void balance;});
});
test('H5-012 C04 retained canonical cancellation results respect complete 7/3 days',async()=>{
 for(const [day,interval,retention] of [[13,'at_least_7','0.00'],[14,'at_least_3','50.00'],[17,'at_least_3','50.00'],[18,'under_3','100.00']] as const)for(const time of ['00:00:00','23:59:59']){
  const f=await cancellationFixture(h,{amount:'100.00',dates:['2026-11-20','2026-11-22'],scopeKind:'service'}),at=`2026-11-${day}T${time}+01:00`,cmd=await f.command({at});await f.run(await f.attest({...cmd,facts:{...cmd.facts!,base:await f.base('100.00'),at}},'reviewed',at));
  await pure(async()=>{const revisions=facts(await get(f.b.bookingId),'b06_cancellation_revisions');assert.ok(revisions.length);const latest=revisions.at(-1),p:any=cancellationProjection(latest);assert.equal(p.temporal.interval,interval);assert.equal(p.retention,retention);assert.equal(p.reference.date,'2026-11-20');});
 }
});
test('H5-012 C05 civil scopes retain independent anchors and accepted quantities',async()=>{
 const f=await cancellationFixture(h,{dates:['2026-11-20','2026-11-22'],night:true,index:1});
 await pure(async()=>{const r=await get(f.b.bookingId,{surface:'calendar'}),services=entries(r).filter(x=>x.source==='crm_private.modification_scope');assert.deepEqual(services.map(x=>x.scope.date).sort(),['2026-11-20','2026-11-22']);
 const z=zoneEvidence('Europe/Madrid','synthetic explicit zone','1');for(const [scope,date,days] of [['global','2026-11-20',2],['modality','2026-11-22',4],['service','2026-11-20',2],['night','2026-11-23',5]] as const){const ref=civilReference({scope,scopeId:uid()},localDate(date),z,'synthetic exact scope','1');assert.equal(projectCivilReference(ref,'2026-11-18T12:00:00+01:00').evaluation!.daysBefore,days);}assert.ok(facts(await get(f.b.bookingId),'b04_contributions').every(x=>x.certainty==='estimated'));});
});
test('H5-012 C06 expressly valid contract reference prevails without inventing validity',async()=>{
 const o=await obligationFixture(h,'1000.00','2026-11-12T10:00:00Z',['2026-11-20','2026-11-22']),normal=o.q.definition!.reference,contract=civilReference({scope:'global',scopeId:o.b.bookingId},localDate('2026-11-25'),normal.zone,'synthetic expressly valid contract','2','express_contract');
 const chosen=selectReference([normal,contract],{scope:'global',scopeId:o.b.bookingId});await h.obligations.apply(await h.auth(),write,await o.attest({...o.q,definition:{...o.q.definition!,reference:chosen}}));
 await pure(async()=>{const r=await get(o.b.bookingId);assert.ok(JSON.stringify(facts(r,'b05_schedule_revisions')).includes('2026-11-25'));assert.equal(projectCivilReference(chosen,'2026-11-18T23:59:59+01:00').evaluation!.daysBefore,7);assert.equal(projectCivilReference(null,'2026-11-18T23:59:59+01:00').certainty,'pending');assert.equal(normal.date,'2026-11-20');});
});
test('H5-012 C07 hourly external limit keeps own instant while D020 remains civil',async()=>{
 const conf=await confirmationFixture(h);for(const desired of [{schedule:{final:'16:30:00+02:00',sourceRef:'SYNTHETIC approved hour'}},{date:'2026-10-22'}]){const m=await modificationFixture(h,conf),revision=desired.date?2:1,request=await m.request([{id:m.partId,scope:m.scope,expectedScopeRevision:revision,desired,aspects:desired.date?['date']:['time'],dependencies:[]}]);await m.run(request);await m.run(await m.evaluate());await m.run(await m.approve());await m.run(await m.apply());const r=await get(conf.bookingId,{surface:'calendar'}),service=entries(r).find(x=>x.reference===conf.service.id);assert.equal(service.scope.date,desired.date??'2026-10-20');assert.equal(service.scope.schedule.final,'16:30:00+02:00');}
 const versions=facts(await get(conf.bookingId),'b04_operational_versions').filter(x=>x.scope_id===conf.service.id);assert.equal(versions.length,2);assert.ok(versions.some(x=>x.material.date==='2026-10-20'));assert.ok(versions.some(x=>x.material.date==='2026-10-22'));
 await pure(async()=>{
 const z=zoneEvidence('Europe/Madrid','synthetic external limit','1'),ref=civilReference({scope:'service',scopeId:a.detail.services[0]!.id},localDate('2026-11-20'),z,'accepted service','1');
 for(const at of ['2026-11-13T00:00:00+01:00','2026-11-13T23:59:59+01:00'])assert.equal(projectCivilReference(ref,at).evaluation!.daysBefore,7);
 const limit=explicitHourlyDeadline({scope:'service',scopeId:ref.scopeId,date:localDate('2026-11-13'),time:'14:15:00',zone:z,at:instant('2026-11-13T14:15:00+01:00'),sourceRef:'explicit option source',version:'1'});assert.equal(hourlyDeadlineExpired(limit,instant('2026-11-13T14:15:00+01:00')),false);assert.equal(hourlyDeadlineExpired(limit,instant('2026-11-13T14:15:01+01:00')),true);assert.ok(await get());
 // Night-change and sibling preservation additionally use the unchanged F01 reproducer.
});});
test('H5-012 C08 unknown schedule/deadline stays pending and independent Booking remains readable',async()=>pure(async()=>{
 const es=entries(await get(a.q.bookingId,{surface:'calendar'}));assert.ok(es.some(x=>x.scope?.schedule===null&&x.certainty==='pending'));assert.ok(facts(await get(),'b07_pending_tasks').some(x=>x.material.deadline.kind==='unknown'&&x.state==='pending'));assert.equal(projectCivilReference(null,'2026-11-18T12:00:00+01:00').evaluation,null);assert.equal(facts(await get(b.q.bookingId),'b04_bookings').length,1);await assert.rejects(reader.read(await h.auth(),read,{...q(a.q.bookingId),serverTimeZone:'UTC'} as never));
}));
test('H5-012 C09 critical Calendar event remains review and stale projection has no write authority',async()=>{
 const previous=await get(a.q.bookingId,{surface:'calendar'}),f=await boundaryFixture(h,'calendar',a.q.bookingId),event={...f.base(),material:{date:'2026-12-29',critical:true}};assert.equal((await f.run(event)).state,'review');
 await pure(async()=>{assert.deepEqual(await get(a.q.bookingId,{surface:'calendar'}),previous);const r=await get();assert.ok(facts(r,'b09_event_receipts').some(x=>x.operation_id===event.operationId&&x.receipt_state==='review'));await assert.rejects(reader.read(await h.auth(),read,{...q(a.q.bookingId),approveChange:previous} as never));});
});
test('H5-012 C10 echo and earlier event never duplicate effect or overwrite current dates',async()=>{
 const w=await workFixture(h);await h.identities.apply(await h.auth(),write,{action:'create_context',operationId:uid(),targetId:w.context.contextId,kind:'booking',expectedVersion:0,sourceRef:'synthetic reference',evidenceRef:'synthetic context',reason:'independent echo context',verified:true});await w.run(w.definition);const claim=w.claim(),claimed=await w.run(claim);await w.run(w.start(claim,claimed.generation!));const ef=await boundaryFixture(h,'other',w.context.contextId),e={...ef.base(),echoOfOperationId:claim.attemptId},prior=await w.see();assert.equal((await ef.run(e)).state,'duplicate');await pure(async()=>{assert.ok(facts(await get(w.context.contextId),'b09_event_receipts').some(x=>x.operation_id===e.operationId&&x.receipt_state==='duplicate'));assert.deepEqual(await w.see(),prior);});
 const f=await boundaryFixture(h,'other',a.q.bookingId),one=f.base();await f.run(one);const echo={...f.base(),externalKey:'echo-'+uid(),echoOfOperationId:one.operationId};await f.run(echo);
 const old={...f.base(),externalKey:'old-'+uid(),occurredAt:'2026-10-01T09:00:00Z',material:{date:'2026-09-01'}};await f.run(old);
 await pure(async()=>{for(let i=0;i<2;i++){const r=await get(),receipts=facts(r,'b09_event_receipts');assert.ok(receipts.some(x=>x.operation_id===echo.operationId));assert.ok(JSON.stringify(receipts).includes(one.operationId));const older=entries(r).find(x=>x.source==='crm_private.b09_event_receipts'&&x.data?.operation_id===old.operationId);assert.equal(Date.parse(older.occurredAt),Date.parse(old.occurredAt));assert.ok(entries(await get(a.q.bookingId,{surface:'calendar'})).filter(x=>x.scope).every(x=>x.scope.date==='2026-10-20'));}});
});
test('H5-012 C11 unavailable/replaced auxiliary source does not make Core unavailable',async()=>{
 for(const label of ['original adapter unavailable','replacement adapter unavailable']){const double=new ManualExternalBoundaryDouble(),sourceId=uid();double.registerSource({id:sourceId,kind:'calendar',label,provenance:'synthetic',verifiedCapabilities:[],enabled:false});assert.throws(()=>double.registerReference({id:uid(),sourceId,externalKey:'synthetic',context:a.q.bookingId,coverage:'synthetic',authority:'reference_only',recordedAt:'2026-10-15T10:00:00Z'},{actor:'synthetic-admin',purpose:'external-boundary',context:a.q.bookingId,coverage:'synthetic',permission:'boundary:receive'}),/SOURCE_UNAVAILABLE/);assert.ok(await get());}
 const f=await boundaryFixture(h,'calendar',b.q.bookingId);await f.run({...f.base(),material:{availability:'unavailable',replacement:'synthetic-adapter-v2'}});
 await pure(async()=>{for(const id of [a.q.bookingId,b.q.bookingId]){assert.ok(await get(id));assert.ok(await get(id,{surface:'calendar'}));}assert.ok(JSON.stringify(await get(b.q.bookingId)).includes('unavailable'));assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,version,c.context)),bytes);});
});
test('H5-012 C12 Avaibook discrepancy never grants create/update/cancel capability',async()=>{
 const f=await boundaryFixture(h,'avaibook',a.q.bookingId),e={...f.base(),material:{discrepancy:'synthetic date mismatch',requestedAction:'modify'}};assert.equal((await f.run(e)).state,'review');await pure(async()=>{assert.ok(facts(await get(),'b09_event_receipts').some(x=>x.operation_id===e.operationId&&x.receipt_state==='review'));for(const action of ['create','modify','cancel'])await assert.rejects(reader.read(await h.auth(),read,{...q(a.q.bookingId),avaibookWrite:action} as never));});
});
test('H5-012 S01 legitimate internal economics remains available only to internal purpose',async()=>pure(async()=>{
 const inside=JSON.stringify(await get());assert.ok(inside.includes('economics'));assert.ok(inside.includes('700.00'));assert.ok(inside.includes(markers[0]!));const outside=JSON.stringify(await get(a.q.bookingId,{destination:'customer'}));assert.equal(outside.includes('economics'),false);assert.equal(outside.includes('700.00'),false);assert.equal(outside.includes(b.q.bookingId),false);
}));
const surfaces=[['S02','query'],['S03','search'],['S04','export'],['S05','document'],['S06','timeline'],['S07','ai_context']] as const;
for(const [id,surface] of surfaces)test(`H5-012 ${id} external ${surface} excludes marked economics personal data originals derivatives`,async()=>pure(async()=>{
 for(const destination of ['customer','provider','ai'] as const){const r=await get(a.q.bookingId,{surface,destination});assert.equal(entries(r).length,2);for(const e of entries(r)){assert.deepEqual(Object.keys(e).sort(),['finalPersonPrice','included','participants','reference']);assert.equal(e.finalPersonPrice,'100.01');assert.equal(e.participants,10);}
 for(const marker of [...markers,'700.00','900.00',a.f.accepterId,b.q.bookingId,c.originalId,version,'private_ref','storage_state']){assert.equal(JSON.stringify(r).includes(marker),false,marker);assert.equal(entries(await get(a.q.bookingId,{surface,destination,search:marker})).length,0);}
 await assert.rejects(reader.read(await h.auth(),read,{...q(a.q.bookingId,{surface,destination}),includeOriginal:version,ownerOverride:true} as never),/INPUT_INVALID/);
 }
}));
test('H5-012 S08 PACK preserves literal 120/10 and 180/8 with fixed900 internal',async()=>{
 const f=await h.fixtures();const content={...f.content,pending:[],modalities:[{p:'120.00',n:10,d:'2026-11-20'},{p:'180.00',n:8,d:'2026-11-22'}].map(x=>({...f.content.modalities[0]!,id:uid(),participants:x.n,finalPersonPrice:x.p,lines:[{...f.content.modalities[0]!.lines[0]!,id:uid(),date:x.d,datePending:false}]}))};const command=f.command({content});await h.proposal.apply(await h.auth(),write,command);const v=uid();await h.proposal.apply(await h.auth(),write,{...command,action:'fix',operationId:uid(),versionId:v,content:undefined,expectedRevision:1});
 await pure(async()=>{const inside=await get(f.opp.targetId,{contextKind:'opportunity'});assert.ok(JSON.stringify(inside).includes('900.00'));for(const destination of ['customer','provider','ai'] as const){const r=await get(f.opp.targetId,{contextKind:'opportunity',surface:'document',destination});assert.deepEqual(entries(r).map(x=>[x.finalPersonPrice,x.participants]).sort(),[['120.00',10],['180.00',8]]);for(const e of entries(r)){assert.equal(e.reference,v);assert.equal(e.included[0].quantity,1);}for(const token of ['900.00','700.00','economics','commission','margin','fee'])assert.equal(JSON.stringify(r).includes(token),false);}});
});
test('H5-012 S09 purpose does not presume all personal data audio retention or consent',async()=>pure(async()=>{
 for(const key of ['includeAudio','consent','retentionDays','deleteOriginal','allContactData'])await assert.rejects(reader.read(await h.auth(),read,{...q(a.q.bookingId,{destination:'customer'}),[key]:markers[5]} as never),e=>e instanceof Error&&e.message==='PROJECTION_INPUT_INVALID');assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,version,c.context)),bytes);
}));
test('H5-012 S10 external invoice keeps issuer and projection cannot emit fiscal documents',async()=>{
 const f=await invoiceFixture(h);await h.invoices.apply(await h.auth(),write,await f.need());await h.invoices.apply(await h.auth(),write,await f.receive());await pure(async()=>{const r=await get(f.bookingId),invoices=facts(r,'b05_provider_invoices');assert.ok(invoices.some(x=>x.invoice_id===f.invoiceId));assert.ok(JSON.stringify(invoices).includes(f.provider.revision));await assert.rejects(reader.read(await h.auth(),read,{...q(f.bookingId,{surface:'document'}),fiscalNumber:'SYNTHETIC-123',emitInvoice:true} as never));assert.equal(JSON.stringify(await get(f.bookingId,{surface:'document',destination:'customer'})).includes(f.invoiceId),false);});
});
test('H5-012 S11 authorized diagnostic references remain facts not evidence of delivery',async()=>pure(async()=>{
 const r=await get(),operations=facts(r,'b07_operations'),history=facts(r,'b07_history');assert.ok(operations.length);assert.ok(history.length);assert.ok(operations.every(x=>x.operation_id));assert.ok(facts(r,'b07_communication_work').some(x=>x.kind==='summary'));assert.equal(facts(r,'b07_records').some(x=>x.kind==='communication_fact'&&x.material.fact==='sent'),false);assert.equal(JSON.stringify(r).includes('signedURL'),false);assert.equal(JSON.stringify(r).includes('secret_key'),false);
}));
test('H5-012 S12 known diagnostic IDs and injected markers cannot leak on rejection',async()=>pure(async()=>{
 for(const id of [a.q.bookingId,c.originalId,version])await assert.rejects(reader.read({subject:a.f.accepterId,role:'administrator',diagnostic:markers.join(' ')} as never,read,q(id)),e=>e instanceof Error&&e.message==='PROJECTION_AUTH_REQUIRED');await assert.rejects(h.objects.download({} as never,read,version,c.context));
}));
test('H5-012 A01 invalid or absent identity/session/MFA refuses every surface',async()=>pure(async()=>{
 for(const surface of ['timeline','calendar','query','search','export','document','ai_context'] as const){await assert.rejects(reader.read({} as never,read,q(a.q.bookingId,{surface})),/AUTH_REQUIRED/);const noSession=await verifyAuth({verify:async()=>({subject:h.subject,passwordVerified:true,mfaVerified:true})},uid());await assert.rejects(reader.read(noSession,read,q(a.q.bookingId,{surface})),/AUTH_REQUIRED/);}assert.ok(await get());
}));
async function signed(mode:'valid'|'mac1'|'mac2'|'root'|'destination'|'scope'|'reuse'){
 return h.runtime.begin('isolation level read committed',async tx=>{
  const auth=await h.auth(),row=(await tx.unsafe<any[]>('select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)',[auth.subject,auth.sessionId!]))[0],binding=await postgresF1Binding(tx),input=encodeF1Fields(['CRM-H5-PROJECTION-READ1',canonicalCommercial(q(a.q.bookingId))]);
  const human=createF2Issuer(h.f2)(auth,{actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id},binding,'evidence_read',input,read);
  const technical=createF1Issuer(h.f1)(issueTrustedContext({identityId:'independent-verifier',identityKind:'technical',purpose:'h1-evidence',scope:mode==='scope'?'foreign-synthetic-scope':row.admin_scope,requestId:uid(),serverTime:new Date().toISOString()}),binding,'C01',input,{resource:'evidence',action:'read_evidence'});
  const changed=mode==='root'?q(b.q.bookingId):q(a.q.bookingId,{destination:'customer'}),bad=(mac:Buffer)=>{const x=Buffer.from(mac);x[0]=x[0]!^1;return x;};
  const args=[human.payload,mode==='mac2'?bad(human.mac):human.mac,technical.payload,mode==='mac1'?bad(technical.mac):technical.mac,['root','destination'].includes(mode)?encodeF1Fields(['CRM-H5-PROJECTION-READ1',canonicalCommercial(changed)]):input];
  if(mode==='reuse')return {args};return (await tx.unsafe<any[]>('select crm_api.h5_projection_read($1,$2,$3,$4,$5) data',args))[0]!.data;
 });
}
test('H5-012 A02 genuine bound envelopes reject forged MAC root purpose scope and transaction replay',async()=>pure(async()=>{
 assert.equal((await signed('valid')).contextId,a.q.bookingId);for(const mode of ['mac1','mac2','root','destination','scope'] as const)await assert.rejects(signed(mode));const replay=await signed('reuse');await assert.rejects(h.runtime.unsafe('select crm_api.h5_projection_read($1,$2,$3,$4,$5)',replay.args));
}));
test('H5-012 A03 disabled actor revoked session and stale epochs cannot read',async()=>{
 const s=await secondWorkActor(h),auth=await s.auth();assert.ok(await reader.read(auth,read,q(a.q.bookingId)));await new H0005PostgresAdapter(h.runtime,h.f1,h.f2).revokeOne(auth);
 await pure(async()=>{await assert.rejects(reader.read(auth,read,q(a.q.bookingId)),/DENIED/);await assert.rejects(h.objects.download(auth,read,version,c.context));assert.ok(await get());});
 await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;try{await assert.rejects(get(),/DENIED/);}finally{await h.admin`update crm_private.crm_actors set enabled=true where actor_id=${h.actorId}::uuid`;}
});
test('H5-012 A04 customer/provider identity and future role are not active permissions',async()=>pure(async()=>{
 for(const role of ['customer','provider','collaborator','administrator']){const auth=await verifyAuth({verify:async()=>({subject:a.f.accepterId,sessionId:uid(),passwordVerified:true,mfaVerified:true})},uid());await assert.rejects(reader.read(auth,read,q(a.q.bookingId)),/DENIED/);await assert.rejects(reader.read({...await h.auth(),role} as never,read,q(a.q.bookingId)),/AUTH_REQUIRED/);}assert.ok(await get());
}));
test('H5-012 A05 shared original and Contact never expand bound root or object purpose',async()=>{
 await h.evidence.apply(await h.auth(),write,{action:'link',operationId:uid(),targetId:uid(),originalId:c.originalId,contextKind:'booking',contextId:b.q.bookingId,purpose:c.context.purpose,sourceRef:'explicit second original link',coverage:'synthetic',reason:'synthetic consent for second context'});
 await pure(async()=>{for(const [own,other] of [[a,b],[b,a]]){const r=await get(own!.q.bookingId),e=entries(r).find(x=>x.data?.record_id===c.originalId);assert.ok(e);assert.equal(e.links.length,1);assert.equal(e.links[0].context_id,own!.q.bookingId);assert.equal(facts(r,'b04_bookings').some(x=>x.booking_id===other!.q.bookingId),false);}await assert.rejects(signed('root'));await assert.rejects(h.objects.download(await h.auth(),read,version,{...c.context,purpose:'unapproved-purpose'}));assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,version,c.context)),bytes);});
});
test('H5-012 A06 two sessions and reused pool do not share internal/external responses',async()=>{
 const second=await secondWorkActor(h),auth=await second.auth();await pure(async()=>{for(let i=0;i<3;i++){const inside=await get();assert.ok(JSON.stringify(inside).includes('economics'));const outside=await reader.read(auth,read,q(b.q.bookingId,{destination:'customer'}));assert.equal(JSON.stringify(outside).includes('economics'),false);assert.equal(JSON.stringify(outside).includes(a.q.bookingId),false);}});await new H0005PostgresAdapter(h.runtime,h.f1,h.f2).revokeOne(auth);await pure(async()=>{await assert.rejects(reader.read(auth,read,q(b.q.bookingId,{destination:'customer'})));assert.ok(await get());});
});
test('H5-012 A07 public/external event ID never authenticates Core',async()=>pure(async()=>{
 for(const source of ['web','calendar','avaibook']){await assert.rejects(reader.read({source,contextId:a.q.bookingId,subject:h.subject} as never,read,q(a.q.bookingId)),/AUTH_REQUIRED/);await assert.rejects(h.runtime.unsafe('select crm_api.h5_projection_read(null,null,null,null,null)'));}assert.ok(await get());
}));
test('H5-012 A08 direct SQL cannot read or mutate original histories or operational view',async()=>pure(async()=>{
 for(const table of ['b04_bookings','b04_current_nights','b04_operational_versions','b07_records','b07_object_versions','b03_proposal_versions']){await assert.rejects(h.runtime.unsafe(`select * from crm_private.${table}`));await assert.rejects(h.runtime.unsafe(`delete from crm_private.${table}`));}
 const role=(await h.observer`select rolsuper,rolbypassrls from pg_roles where rolname='crm_h0_runtime'`)[0]!;assert.equal(role.rolsuper,false);assert.equal(role.rolbypassrls,false);assert.ok(await get());
}));
test('H5-012 A09 projection cannot mutate or renew human authority through polling',async()=>pure(async()=>{
 const before=await h.observer`select to_jsonb(s) v from crm_private.crm_sessions s where session_id=${h.sessionId}::uuid`;
 await assert.rejects(reader.read(await h.auth(),classifyServerEvent('polling'),q(a.q.bookingId)),/AUTH_REQUIRED/);await assert.rejects(reader.read(await h.auth(),{interactionClass:'interactive_read'} as never,q(a.q.bookingId)),/AUTH_REQUIRED/);
 assert.deepEqual(await h.observer`select to_jsonb(s) v from crm_private.crm_sessions s where session_id=${h.sessionId}::uuid`,before);
 for(const key of ['approve','confirm','close','refund','send','execute'])await assert.rejects(reader.read(await h.auth(),read,{...q(a.q.bookingId),[key]:true} as never));assert.equal((await get())!.mutationAuthority,false);
}));
