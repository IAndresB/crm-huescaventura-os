import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedDiagnostics,read,write} from '../support/h5-diagnostic-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {errorCodes,semanticIssue} from '../../src/domain/semantic-error.ts';
import type {DiagnosticObservation,DiagnosticQuery} from '../../src/domain/operation-diagnostic.ts';
import {invokeDiagnosticOperation} from '../../src/server/diagnostic-operation.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
let h:Awaited<ReturnType<typeof isolatedDiagnostics>>;
before(async()=>{h=await isolatedDiagnostics('h5017',59617);});after(async()=>{await h?.close();});
const base=(contextId:string)=>({contextKind:'booking' as const,contextId,pageSize:100});
async function observation(contextId:string,code:'E1'|'E2'|'E3'|'E4'|'E5'|'E6'|'E7'|'E8'):Promise<DiagnosticObservation>{return{...base(contextId),observationId:uid(),requestRef:diagnosticReference(uid()),operationId:uid(),outcome:code==='E4'?'pending':'rejected',issues:[semanticIssue(code,'operation')]};}
const page=async(q:DiagnosticQuery)=>h.diagnostics.read(await h.auth(),read,q);
async function all(q:DiagnosticQuery){const nodes=[];let after:string|undefined;do{const r=await page({...q,...(after?{after}:{})});nodes.push(...r.nodes);after=r.next??undefined;}while(after);return nodes;}
for(const code of errorCodes)test('H5-017 D01 exact normative '+code+' is persisted and locatable',async()=>{
 const f=await communicationFixture(h),q=await observation(f.context.contextId,code);await h.diagnostics.record(await h.auth(),write,q);
 const v=await page({...base(f.context.contextId),reference:q.requestRef});assert.equal(v.technicalOnly,true);const o=v.nodes.find(x=>x.id===q.observationId)!;assert.ok(o);assert.equal(o.outcome,q.outcome);assert.deepEqual(o.issues,[semanticIssue(code,'operation')]);
});
test('H5-017 D01 coexistence preserves E4 E6 and distinct original observations',async()=>{
 const f=await communicationFixture(h),q={...await observation(f.context.contextId,'E4'),issues:[semanticIssue('E4','execution'),semanticIssue('E6','dependency')]};
 await h.diagnostics.record(await h.auth(),write,q);await h.diagnostics.record(await h.auth(),write,{...q,observationId:uid(),issues:[semanticIssue('E8','document')]});const v=await page({...base(f.context.contextId),reference:q.operationId});assert.equal(v.nodes.filter(x=>x.source==='b10_diagnostic_observations').length,2);assert.deepEqual(v.nodes.find(x=>x.id===q.observationId)!.issues,[semanticIssue('E4','execution'),semanticIssue('E6','dependency')]);
});
test('H5-017 D02 effect then exception remains E4 and never retries or changes business facts',async()=>{
 const f=await communicationFixture(h),q=await observation(f.context.contextId,'E4');let effects=0;const logs:unknown[]=[];
 const before=await h.observer`select count(*)::int n from crm_private.b07_records`;
 const r=await invokeDiagnosticOperation({...base(f.context.contextId),requestId:'synthetic-token-private',operationId:q.operationId!},
  {record:o=>h.auth().then(a=>h.diagnostics.record(a,write,o))},async()=>{effects++;await h.evidence.apply(await h.auth(),write,h.req('evidence',{claim:'synthetic-authorized-effect',coverage:'test',certainty:'reviewed',source_kind:'manual'},f.context.contextId,'booking'));throw new Error('synthetic-token-private https://private.invalid/token=secret');}, {record:e=>logs.push(e)});
 assert.equal(effects,1);assert.equal(r.result.status,'pending');assert.deepEqual(r.result.status==='pending'&&r.result.issues,[semanticIssue('E4','operation')]);assert.equal(r.diagnosticRecorded,true);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_records`)[0]!.n,before[0]!.n+1);
 const nodes=await all({...base(f.context.contextId),reference:r.requestRef});assert.equal(nodes.find(x=>x.source==='b10_diagnostic_observations')!.outcome,'pending');assert.equal(JSON.stringify({r,logs,nodes}).includes('synthetic-token-private'),false);
});
test('H5-017 D02 known technical failure E5 explicit, success technical only and sink failure preserves result',async()=>{
 const f=await communicationFixture(h),input={...base(f.context.contextId),requestId:uid(),operationId:uid()};
 const w={record:(o:DiagnosticObservation)=>h.auth().then(a=>h.diagnostics.record(a,write,o))};
 const fail=await invokeDiagnosticOperation(input,w,async()=>({status:'rejected',issues:[semanticIssue('E5','operation')]}));assert.equal(fail.result.status,'rejected');
 const result={status:'applied' as const,value:{technical:'synthetic'}};
 const ok=await invokeDiagnosticOperation({...input,operationId:uid()},w,async()=>result);assert.deepEqual(ok.result,result);
 const unavailable=await invokeDiagnosticOperation(input,{record:async()=>{throw new Error('PRIVATE');}},async()=>result,{record:()=>{throw new Error('PRIVATE');}});assert.deepEqual(unavailable.result,result);assert.equal(unavailable.diagnosticRecorded,false);
 assert.equal((await page({...base(f.context.contextId),reference:input.operationId})).technicalOnly,true);
});
test('H5-017 D03 execution attempts approval history operation and request form one scoped investigation',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const claim=f.claim();await f.run(claim);const start=f.start(claim,1);await f.run(start);
 const q={...await observation(f.context.contextId,'E4'),operationId:claim.operationId,executionId:f.executionId};await h.diagnostics.record(await h.auth(),write,q);
 const nodes=await all({...base(f.context.contextId),pageSize:3,reference:q.requestRef});const sources=new Set(nodes.map(x=>x.source));
 for(const s of ['b10_diagnostic_observations','b08_executions','b08_attempts','b08_parts','crm_ha.decisions','b07_operations','b07_history'])assert.ok(sources.has(s),s);
 const e=nodes.find(x=>x.source==='b08_executions')!;assert.equal(e.incomplete,true);assert.equal(e.responsibleActor,h.actorId);assert.ok(e.approvalRef);assert.equal(nodes.find(x=>x.source==='b08_attempts')!.state,'contacted');
 for(const op of [f.definition.operationId,claim.operationId,start.operationId])assert.ok(nodes.some(x=>x.source==='b07_history'&&x.references.includes(op)),op);assert.equal(new Set(nodes.map(x=>x.key)).size,nodes.length);
 const b=await f.see();const after=await all({...base(f.context.contextId),reference:f.executionId});assert.deepEqual(await f.see(),b);assert.ok(after.length);
});
test('H5-017 D03 event receipt and authorized evidence retain provenance without raw payload',async()=>{
 const f=await boundaryFixture(h),c={...f.base(),material:{token:'CANARY_SECRET',cost:'CANARY_MARGIN',body:'CANARY_BODY',url:'https://CANARY_URL.invalid'}};await f.run(c);
 const q={...await observation(f.contextId,'E8'),operationId:c.operationId,eventId:c.eventId};await h.diagnostics.record(await h.auth(),write,q);
 const nodes=await all({...base(f.contextId),reference:q.requestRef});for(const s of ['b09_event_receipts','b07_records','b07_history','b07_operations'])assert.ok(nodes.some(x=>x.source===s),s);
 assert.ok(nodes.some(x=>x.authorizedEvidenceRef===c.eventId));assert.equal(/CANARY/.test(JSON.stringify(nodes)),false);
 const record=await h.observer`select material from crm_private.b07_records where record_id=${c.eventId}::uuid`;assert.ok(JSON.stringify(record).includes('CANARY_SECRET'));
});
test('H5-017 D04 incomplete object visible and source body remains behind evidence authorization',async()=>{
 const f=await communicationFixture(h),version=uid(),root=uid();
 await h.migration`insert into crm_private.b07_object_versions(version_id,root_id,version_number,document_id,admin_scope,purpose,source_ref,private_ref,expected_digest,expected_size,expected_media,state,recorded_by)values(${version}::uuid,${root}::uuid,1,${f.originalId}::uuid,${h.scope},'synthetic','PRIVATE_SOURCE',${root+'/'+version},${'a'.repeat(64)},1,'text/plain','prepared',${h.actorId}::uuid)`;
 const v=await page(base(f.context.contextId));const o=v.nodes.find(x=>x.id===version)!;assert.equal(o.state,'prepared');assert.equal(o.incomplete,true);assert.equal(JSON.stringify(v).includes('PRIVATE_SOURCE'),false);
});
test('H5-017 D05 observation allowlist rejects secrets, states and dangling/cross-root references',async()=>{
 const a=await workFixture(h),b=await workFixture(h);await a.run(a.definition);await b.run(b.definition);
 const q=await observation(a.context.contextId,'E4');
 for(const change of [{executionId:uid()},{executionId:b.executionId},{eventId:a.comm.recordId},{eventId:uid()},{outcome:'accepted'},{outcome:'rejected'}])await assert.rejects(h.diagnostics.record(await h.auth(),write,{...q,...change} as DiagnosticObservation));
 const extra={...q,secret:'CANARY_EXTRA',issues:[{...semanticIssue('E4','operation'),affectedScope:'canary-private',message:'CANARY_MESSAGE'}]};await h.diagnostics.record(await h.auth(),write,extra);
 const v=await page(base(a.context.contextId));assert.equal(/CANARY|canary-private/.test(JSON.stringify(v)),false);
});
test('H5-017 D06 another root cannot expose request execution event or history',async()=>{
 const a=await communicationFixture(h),b=await communicationFixture(h),q=await observation(a.context.contextId,'E1');await h.diagnostics.record(await h.auth(),write,q);
 assert.deepEqual((await page({...base(b.context.contextId),reference:q.requestRef})).nodes,[]);await assert.rejects(page(base(uid())));
});
test('H5-017 D07 equivalent observation replays and conflicting content never overwrites original',async()=>{
 const f=await communicationFixture(h),q=await observation(f.context.contextId,'E3');const first=await h.diagnostics.record(await h.auth(),write,q),again=await h.diagnostics.record(await h.auth(),write,q);assert.equal(first.replayed,false);assert.equal(again.replayed,true);
 await assert.rejects(h.diagnostics.record(await h.auth(),write,{...q,issues:[semanticIssue('E2','operation')]}));assert.equal((await page({...base(f.context.contextId),reference:q.requestRef})).nodes.filter(x=>x.id===q.observationId).length,1);
});

test('H5-017 D03 original evidence can be followed through B07 with fresh authorization',async()=>{
 const f=await boundaryFixture(h),c=f.base();await f.run(c);const nodes=await all({...base(f.contextId),reference:c.operationId});assert.ok(nodes.some(x=>x.authorizedEvidenceRef===c.eventId));
 const original=await h.evidence.read(await h.auth(),read,c.eventId,'booking',f.contextId);assert.notEqual(original.data,null);
 const other=await communicationFixture(h);const denied=await h.evidence.read(await h.auth(),read,c.eventId,'booking',other.context.contextId);assert.equal(denied.data,null);
});
test('H5-017 D04 persistent failure alert and unavailable notification visible with explicit test lease',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const claim=f.claim();await f.run(claim);await f.run(f.start(claim,1));
 await h.admin`update crm_private.b08_attempts set lease_until=clock_timestamp()-interval '1 second' where attempt_id=${claim.attemptId}::uuid`;
 const alertId=uid();await f.run({...f.base(),action:'persistent_failure',alertId,urgency:'critical'});
 const nodes=await all({...base(f.context.contextId),pageSize:2,reference:f.executionId});assert.equal(nodes.find(x=>x.source==='b08_attempts')!.leaseExpired,true);assert.ok(Number(nodes.find(x=>x.source==='b08_executions')!.ageSeconds)>=0);
 assert.equal(nodes.find(x=>x.source==='b07_alerts')!.state,'review_required');const notifications=nodes.filter(x=>x.source==='b07_notifications');assert.equal(notifications.length,2);assert.ok(notifications.some(x=>x.state==='unavailable'));assert.ok(notifications.some(x=>x.state==='visible'));
 const before=await f.see();await all(base(f.context.contextId));assert.deepEqual(await f.see(),before);assert.equal(before!.parts[0]!.state,'contacted');
});

import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
test('H5-017 D03 real Booking closure commercial operation economic histories linked by references only',async()=>{
 const f=await jointFixture(h);const command=await f.j.command();await f.j.run(command);const q={...await observation(f.bookingId,'E8'),operationId:command.operationId};await h.diagnostics.record(await h.auth(),write,q);
 const before=await f.j.c.view(),nodes=await all({...base(f.bookingId),pageSize:7});
 for(const source of ['b04_operations','b04_history','b06_closure_operations','b06_closure_assessments','b06_joint_closures','b05_obligation_operations'])assert.ok(nodes.some(x=>x.source===source),source);
 assert.equal(new Set(nodes.map(x=>x.key)).size,nodes.length);for(const n of nodes)for(const k of ['command','state_snapshot','before_data','after_data','result','material','amount','cost','margin','benefit'])assert.equal(k in n,false);
 assert.deepEqual(await f.j.c.view(),before);assert.equal(before.jointClosure.current,true);
});
