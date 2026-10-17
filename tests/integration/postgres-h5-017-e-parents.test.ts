import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {isolatedDiagnosticsE,read,write} from '../support/h5-diagnostic-e-isolated.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import type {DiagnosticObservation,DiagnosticQuery,DiagnosticNode} from '../../src/domain/operation-diagnostic.ts';
import type {WorkContext} from '../../src/domain/persisted-work.ts';
let h:Awaited<ReturnType<typeof isolatedDiagnosticsE>>;
before(async()=>{h=await isolatedDiagnosticsE('h5017eparents',59964);});after(async()=>{await h?.close();});
async function all(q:DiagnosticQuery){const nodes:DiagnosticNode[]=[];let after:string|undefined;const seen=new Set<string>();do{const page=await h.diagnostic.read(await h.auth(),read,{...q,pageSize:2,...(after?{after}:{})});nodes.push(...page.nodes);after=page.next??undefined;if(after){assert.equal(seen.has(after),false);seen.add(after);}}while(after);assert.equal(new Set(nodes.map(n=>n.key)).size,nodes.length);return nodes;}
async function hierarchy(){
 const f=await jointFixture(h,[]);return(await h.observer`select b.booking_id::text booking,b.opportunity_id::text opportunity,s.service_id::text service,p.proposal_id::text proposal from crm_private.b04_bookings b join crm_private.b04_services s using(booking_id) join crm_private.b03_proposals p on p.opportunity_id=b.opportunity_id where b.booking_id=${f.bookingId}::uuid order by s.service_id,p.proposal_id limit 1`)[0]!;
}
async function context(contextKind:'booking_service'|'booking'|'opportunity'|'proposal'|'contact',contextId:string){const q=h.req('evidence',{claim:'E synthetic original source',coverage:'E',certainty:'reviewed',source_kind:'manual'},contextId,contextKind);await h.evidence.apply(await h.auth(),write,q);return {recordId:q.targetId,contextKind,contextId,purpose:q.purpose};}
async function revise(f:Awaited<ReturnType<typeof workFixture>>,target:WorkContext,version:number){const material={...f.material,content:'E authorized revision '+version},approval=await f.approve(material),cmd={...f.definition,...f.base(),action:'revise' as const,context:target,version,material,...approval,affectedRefs:[target.recordId]};await f.run(cmd);return cmd;}
const observation=(contextKind:DiagnosticObservation['contextKind'],contextId:string,operationId:string,executionId?:string):DiagnosticObservation=>({contextKind,contextId,operationId,...(executionId?{executionId}:{}),observationId:id(),requestRef:diagnosticReference(id()),outcome:'pending',issues:[semanticIssue('E4','operation')]});
for(const route of ['service-booking','booking-opportunity','service-opportunity','proposal-opportunity']as const)for(const explicitExecution of [false,true])test('E-P01 parent history, successive revisions, later requests and return '+route+' execution='+explicitExecution,async()=>{
 const ids=await hierarchy(),childKind=route.startsWith('service')?'booking_service':route.startsWith('proposal')?'proposal':'booking',childId=childKind==='booking_service'?ids.service:childKind==='proposal'?ids.proposal:ids.booking;
 const parentKind=route==='service-booking'?'booking':'opportunity',parentId=parentKind==='booking'?ids.booking:ids.opportunity,originalContext=await context(childKind,childId);
 const f=await workFixture(h);await f.run({...f.definition,context:originalContext,affectedRefs:[originalContext.recordId]});const o=observation(parentKind,parentId,f.definition.operationId,explicitExecution?f.executionId:undefined);await h.diagnostic.record(await h.auth(),write,o);
 const q:DiagnosticQuery={contextKind:parentKind,contextId:parentId,reference:o.requestRef,pageSize:100};assert.ok((await all(q)).some(n=>n.id===o.observationId));const before=(await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row;
 const dest=await communicationFixture(h),b={recordId:dest.recordId,...dest.context},second=await revise(f,b,2);const later=observation('booking',b.contextId,second.operationId,f.executionId);await h.diagnostic.record(await h.auth(),write,later);
 const old=await all(q);assert.ok(old.some(n=>n.id===o.observationId));assert.equal(JSON.stringify(old).includes(b.recordId),false);assert.equal(old.some(n=>n.source==='b08_executions'&&n.id===f.executionId),false);
 assert.deepEqual(await all({...q,contextKind:'booking',contextId:b.contextId}),[]);
 const bookingContext=await context('booking',ids.booking),opportunityContext=await context('opportunity',ids.opportunity);await revise(f,bookingContext,3);await revise(f,opportunityContext,4);
 assert.ok((await all(q)).some(n=>n.id===o.observationId));assert.ok((await all({contextKind:'booking',contextId:b.contextId,reference:later.requestRef,pageSize:100})).some(n=>n.id===later.observationId));
 assert.deepEqual(await all({...q,reference:later.requestRef}),[]);await revise(f,originalContext,5);assert.ok((await all(q)).some(n=>n.id===o.observationId));
 assert.deepEqual((await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row,before);
});
for(const denied of ['evidence','typed-root']as const)test('E-P02 parent recovery revalidates original evidence and typed root '+denied,async()=>{
 const ids=await hierarchy(),child=await context('booking_service',ids.service),f=await workFixture(h);await f.run({...f.definition,context:child,affectedRefs:[child.recordId]});const o=observation('opportunity',ids.opportunity,f.definition.operationId,f.executionId);await h.diagnostic.record(await h.auth(),write,o);
 const dest=await communicationFixture(h);await revise(f,{recordId:dest.recordId,...dest.context},2);const q={contextKind:'opportunity' as const,contextId:ids.opportunity,reference:o.requestRef,pageSize:100};assert.ok((await all(q)).some(n=>n.id===o.observationId));
 if(denied==='typed-root'){
  await context('contact',ids.opportunity);assert.deepEqual(await all({...q,contextKind:'contact'}),[]);assert.deepEqual(await all({...q,contextKind:'booking',contextId:dest.context.contextId}),[]);
 }else{
  // Adversarial fixture only: simulate source access revoked, without editing history.
  await h.admin`update crm_private.b07_links set admin_scope='E-restricted-synthetic-scope' where record_id=${child.recordId}::uuid`;
  try{const hidden=await all(q);assert.equal(hidden.some(n=>n.id===o.observationId||n.id===f.definition.operationId),false);}finally{await h.admin`update crm_private.b07_links set admin_scope=${h.scope} where record_id=${child.recordId}::uuid`;}
  assert.ok((await all(q)).some(n=>n.id===o.observationId));
 }
});
