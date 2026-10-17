import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {isolatedCorrectedDiagnostics,read,write,migration65} from '../support/h5-diagnostic-d-isolated.ts';
import {workFixture,secondWorkActor} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {H5009ExternalEventAdapter} from '../../src/infrastructure/postgres/h5-external-event-adapter.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import type {DiagnosticObservation} from '../../src/domain/operation-diagnostic.ts';
let h:Awaited<ReturnType<typeof isolatedCorrectedDiagnostics>>;
before(async()=>{h=await isolatedCorrectedDiagnostics('h5017cown',59817);});after(async()=>{await h?.close();});
const query=(contextId:string,contextKind:'booking'|'contact'='booking')=>({contextKind,contextId,pageSize:100});
const obs=(contextId:string,operationId:string=id()):DiagnosticObservation=>({contextKind:'booking',contextId,operationId,observationId:id(),requestRef:diagnosticReference(id()),outcome:'accepted',issues:[]});
const record=async(o:DiagnosticObservation)=>h.diagnostic.record(await h.auth(),write,o);
const page=async(contextId:string,contextKind:'booking'|'contact'='booking',reference?:string)=>h.diagnostic.read(await h.auth(),read,{...query(contextId,contextKind),...(reference?{reference}:{})});

test('C02 C03 typed scope excludes B07 B08 Task Alert B09 metadata with same UUID',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const alertId=id();await f.run({...f.base(),action:'persistent_failure',alertId,urgency:'critical'});
 const event=await boundaryFixture(h,'other',f.context.contextId),command=event.base();await event.run(command);
 const contact=h.req('evidence',{claim:'contact-only',coverage:'synthetic',certainty:'reviewed',source_kind:'manual'},f.context.contextId,'contact');await h.evidence.apply(await h.auth(),write,contact);
 const p=await page(f.context.contextId,'contact');assert.ok(p.nodes.some(x=>x.id===contact.targetId));
 for(const source of ['b08_executions','b08_definitions','b08_parts','b08_attempts','b07_pending_tasks','b07_alerts','b07_notifications','b09_event_receipts'])assert.equal(p.nodes.some(x=>x.source===source),false,source);
 for(const ref of [f.comm.recordId,f.executionId,event.sourceId,command.operationId,command.eventId,alertId])assert.deepEqual((await page(f.context.contextId,'contact',ref)).nodes,[]);
 const own=await page(f.context.contextId);for(const source of ['b08_executions','b07_pending_tasks','b07_alerts','b09_event_receipts'])assert.ok(own.nodes.some(x=>x.source===source),source);
});

test('C03 legitimate child service evidence stays visible and mismatched kind does not',async()=>{
 const f=await jointFixture(h),service=(await h.observer`select service_id::text from crm_private.b04_services where booking_id=${f.bookingId}::uuid`)[0]!.service_id;
 const good=h.req('evidence',{claim:'service-only',coverage:'synthetic',certainty:'reviewed',source_kind:'manual'},service,'booking_service');const bad=h.req('evidence',{claim:'contact-only',coverage:'synthetic',certainty:'reviewed',source_kind:'manual'},service,'contact');
 await h.evidence.apply(await h.auth(),write,good);await h.evidence.apply(await h.auth(),write,bad);const p=await page(f.bookingId);
 assert.ok(p.nodes.some(x=>x.id===good.targetId));assert.equal(p.nodes.some(x=>x.id===bad.targetId),false);assert.notEqual((await h.evidence.read(await h.auth(),read,good.targetId,'booking_service',service)).data,null);
});

test('C04 known foreign B09 and B07 operation IDs reject without observation or side effect',async()=>{
 const a=await boundaryFixture(h),b=await boundaryFixture(h),event=b.base();await b.run(event);
 const proof=h.req('evidence',{claim:'other-root',coverage:'synthetic',certainty:'reviewed',source_kind:'manual'},b.contextId,'booking');await h.evidence.apply(await h.auth(),write,proof);
 const before=(await h.observer`select count(*)::int n from crm_private.b10_diagnostic_observations`)[0]!.n;
 for(const op of [event.operationId,proof.operationId])await assert.rejects(record(obs(a.contextId,op)),/^Error: DIAGNOSTIC_DENIED$/);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b10_diagnostic_observations`)[0]!.n,before);assert.equal((await h.observer`select raw_event->>'context_id' root from crm_private.b09_event_receipts where operation_id=${event.operationId}::uuid`)[0]!.root,b.contextId);
});

test('C05 valid operation is canonical and never becomes a business attestation',async()=>{
 const f=await boundaryFixture(h),event=f.base();await f.run(event);const o=obs(f.contextId,event.operationId);await record(o);const p=await page(f.contextId,'booking',o.requestRef);
 assert.equal(p.technicalOnly,true);assert.equal(p.nodes.find(x=>x.id===o.observationId)!.operationReferenceState,'canonical');assert.ok(p.nodes.some(x=>x.source==='b09_event_receipts'));
});

test('C05 unknown attempted operation is explicit and replay cannot fabricate a canonical fact',async()=>{
 const f=await communicationFixture(h),o=obs(f.context.contextId);await record(o);assert.equal((await record(o)).replayed,true);const p=await page(f.context.contextId,'booking',o.requestRef);
 assert.equal(p.nodes.find(x=>x.id===o.observationId)!.operationReferenceState,'unverified_attempt');assert.equal(p.nodes.some(x=>x.id===o.operationId),false);assert.equal((await h.observer`select count(*)::int n from crm_private.b07_operations where operation_id=${o.operationId!}::uuid`)[0]!.n,0);
});

test('C06 unknown first then foreign canonical commit hides stale association without rewriting evidence',async()=>{
 const a=await boundaryFixture(h),b=await boundaryFixture(h),event=b.base(),o=obs(a.contextId,event.operationId);await record(o);const original=(await h.observer`select to_jsonb(x) value from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.value;
 await b.run(event);assert.deepEqual((await page(a.contextId,'booking',o.requestRef)).nodes,[]);await assert.rejects(record(o),/DIAGNOSTIC_DENIED/);
 assert.deepEqual((await h.observer`select to_jsonb(x) value from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.value,original);
});

test('C06 canonical commit after observation snapshot cannot expose a false root',async()=>{
 const a=await boundaryFixture(h),b=await boundaryFixture(h),event=b.base(),o=obs(a.contextId,event.operationId);let ready!:()=>void,release!:()=>void;const written=new Promise<void>(r=>ready=r),continueCommit=new Promise<void>(r=>release=r);
 const blocked=new H5009ExternalEventAdapter({begin:async(options:any,work:any)=>h.runtime.begin(options,async(tx:any)=>{const result=await work(tx);ready();await continueCommit;return result;})}as typeof h.runtime,h.f1,h.f2);
 const otherSession=await secondWorkActor(h);const pending=otherSession.auth().then(auth=>blocked.receive(auth,write,event));try{await Promise.race([written,pending.then(()=>{throw new Error('expected uncommitted barrier');})]);await record(o);assert.equal((await page(a.contextId,'booking',o.requestRef)).nodes[0]!.operationReferenceState,'unverified_attempt');}finally{release();await pending;}
 assert.deepEqual((await page(a.contextId,'booking',o.requestRef)).nodes,[]);console.log('C06 ordering',JSON.stringify({canonicalSQLBeforeObservation:true,canonicalCommitAfterObservation:true,falseReferenceReturnedAfterCommit:false}));
});

test('C06 own operation committed later resolves attempt without duplicate observation',async()=>{
 const f=await boundaryFixture(h),event=f.base(),o=obs(f.contextId,event.operationId);await record(o);await f.run(event);assert.equal((await page(f.contextId,'booking',o.requestRef)).nodes.find(x=>x.id===o.observationId)!.operationReferenceState,'canonical');assert.equal((await record(o)).replayed,true);
});

test('C07 every new helper is private and original table retains FORCE RLS',async()=>{
 for(const role of ['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated'])for(const f of ['crm_private.diagnostic_contexts(text,text,uuid)','crm_private.diagnostic_canonical_nodes(text,text,uuid)','crm_private.diagnostic_operation_reference(uuid,jsonb)'])assert.equal((await h.observer`select has_function_privilege(${role},${f},'EXECUTE') p`)[0]!.p,false);
 const table=(await h.observer`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.b10_diagnostic_observations'::regclass`)[0]!;assert.equal(table.relrowsecurity,true);assert.equal(table.relforcerowsecurity,true);
});

test('C04 parallel conflicting observations do not change the first persisted result',async()=>{
 const f=await boundaryFixture(h),event=f.base();await f.run(event);const o=obs(f.contextId,event.operationId),results=await Promise.all([record(o),record(o)]);assert.deepEqual(results.map(x=>x.replayed).sort(),[false,true]);await assert.rejects(record({...o,requestRef:diagnosticReference(id())}));assert.equal((await h.observer`select count(*)::int n from crm_private.b10_diagnostic_observations where observation_id=${o.observationId}::uuid`)[0]!.n,1);
});

test('C05 identity operations keep their real typed root and cannot be attached to another booking',async()=>{
 const contact=id(),operationId=id();await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId,targetId:contact,kind:'contact',expectedVersion:0,sourceRef:'synthetic-c',reason:'synthetic-c',verified:false,displayName:'SYNTHETIC C'});
 const o={...obs(contact,operationId),contextKind:'contact' as const};await record(o);const p=await page(contact,'contact',o.requestRef);assert.equal(p.nodes.find(n=>n.id===o.observationId)!.operationReferenceState,'canonical');
 const other=await boundaryFixture(h);await assert.rejects(record(obs(other.contextId,operationId)),/DIAGNOSTIC_DENIED/);
});

test('C05 requirement and incident operations retain canonical ownership and reject another booking',async()=>{
 const {requirementFixture}=await import('../support/h4-requirement-fixtures.ts');const {incidentFixture}=await import('../support/h4-incident-fixtures.ts');
 const requirement=await requirementFixture(h),need=await requirement.need();await h.requirements.apply(await h.auth(),write,need);
 const incident=await incidentFixture(h,requirement.b),detect=await incident.detect();await h.incidents.apply(await h.auth(),write,detect);
 const foreign=await boundaryFixture(h);
 for(const operationId of [need.operationId,detect.operationId]){const o=obs(requirement.bookingId,operationId);await record(o);assert.equal((await page(requirement.bookingId,'booking',o.requestRef)).nodes.find(n=>n.id===o.observationId)!.operationReferenceState,'canonical');await assert.rejects(record(obs(foreign.contextId,operationId)),/DIAGNOSTIC_DENIED/);}
});
