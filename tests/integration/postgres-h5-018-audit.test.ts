import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {auditDatabase,read,write} from '../support/h5-018-audit-isolated.ts';
import {workFixture,secondWorkActor} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {invokeDiagnosticOperation} from '../../src/server/diagnostic-operation.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue,type ErrorCode} from '../../src/domain/semantic-error.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import type {DiagnosticObservation,DiagnosticQuery,DiagnosticNode} from '../../src/domain/operation-diagnostic.ts';
let h:Awaited<ReturnType<typeof auditDatabase>>;
before(async()=>{h=await auditDatabase('h5018audit',59718);});after(async()=>{await h?.close();});
const root=(contextId:string)=>({contextKind:'booking' as const,contextId,pageSize:100});
async function all(q:DiagnosticQuery){const nodes:DiagnosticNode[]=[];let after:string|undefined;const seen=new Set<string>();do{const p=await h.diagnostic.read(await h.auth(),read,{...q,...(after?{after}:{})});assert.equal(p.technicalOnly,true);nodes.push(...p.nodes);after=p.next??undefined;if(after){assert.equal(seen.has(after),false,'cursor cycle');seen.add(after);}}while(after);return nodes;}
function obs(contextId:string,code:ErrorCode='E4'):DiagnosticObservation{return {...root(contextId),observationId:id(),requestRef:diagnosticReference(id()),operationId:id(),outcome:code==='E4'?'pending':'rejected',issues:[semanticIssue(code,'operation')]};}
const record=async(o:DiagnosticObservation)=>h.diagnostic.record(await h.auth(),write,o);
const writer={record};
const canary='AUDIT_SYNTHETIC_CONFIDENTIAL_018';

test('A04 unknown exception after durable effect stays E4 with one invocation and canonical history',async()=>{
 const contextId=id(),q=h.req('evidence',{claim:'synthetic effect',coverage:'audit',certainty:'reviewed',source_kind:'manual'},contextId,'booking');let calls=0;const logs:unknown[]=[];
 const r=await invokeDiagnosticOperation({...root(contextId),operationId:q.operationId,requestId:canary},writer,async()=>{calls++;await h.evidence.apply(await h.auth(),write,q);throw new Error(canary);},{record:e=>logs.push(e)});
 assert.equal(calls,1);assert.equal(r.result.status,'pending');assert.ok(r.result.status==='pending'&&r.result.issues.some(x=>x.code==='E4'&&x.knownState==='uncertain'));
 assert.equal(r.diagnosticRecorded,true);assert.ok((await all({...root(contextId),reference:r.requestRef})).some(n=>n.id===q.operationId));
 assert.equal((await h.evidence.read(await h.auth(),read,q.targetId,'booking',contextId)).data!==null,true);assert.equal(JSON.stringify({r,logs}).includes(canary),false);
});

test('A09 rejected E4 and E6 remain distinct pending causes without retry',async()=>{
 const f=await communicationFixture(h);let calls=0;const r=await invokeDiagnosticOperation({...root(f.context.contextId),operationId:id(),requestId:id()},writer,async()=>{calls++;return {status:'rejected',issues:[semanticIssue('E4','execution'),semanticIssue('E6','dependency')]};});
 assert.equal(calls,1);assert.equal(r.result.status,'pending');const n=(await all({...root(f.context.contextId),reference:r.requestRef})).find(n=>n.source==='b10_diagnostic_observations')!;
 assert.deepEqual((n.issues as any[]).map(x=>[x.code,x.knownState,x.affectedScope]),[['E4','uncertain','execution'],['E6','pending','dependency']]);
});

test('A09 recorder and sink failure cannot change an established applied result',async()=>{
 let calls=0;const result={status:'applied' as const,value:{canonicalRef:id()}};
 const out=await invokeDiagnosticOperation({...root(id()),operationId:id(),requestId:id()},{record:async()=>{throw new Error(canary);}},async()=>{calls++;return result;},{record:()=>{throw new Error(canary);}});
 assert.deepEqual(out.result,result);assert.equal(out.diagnosticRecorded,false);assert.equal(calls,1);
});

test('A10 request joins actual attempts approvals and history; pagination preserves identities',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim();await f.run(c);const s=f.start(c,1);await f.run(s);const o={...obs(f.context.contextId),executionId:f.executionId,operationId:s.operationId};await record(o);
 const a=await all({...root(f.context.contextId),reference:o.requestRef}),b=await all({...root(f.context.contextId),reference:o.requestRef,pageSize:1});assert.deepEqual(b.map(n=>n.key),a.map(n=>n.key));
 for(const op of [f.definition.operationId,c.operationId,s.operationId])assert.ok(a.some(n=>n.source==='b07_history'&&n.references.includes(op)));
 const attempt=a.find(n=>n.id===c.attemptId)!;assert.equal(attempt.state,'contacted');assert.notEqual(attempt.executorRef,h.actorId);
 assert.equal(a.find(n=>n.source==='b08_executions')?.responsibleActor,h.actorId);assert.equal(a.find(n=>n.source==='crm_ha.decisions')?.actorId,h.actorId);
});

test('A10 revisions retain both approvals and original history',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const material={...f.material,content:'audited second version'};const approval=await f.approve(material);
 await f.run({...f.definition,...f.base(),action:'revise',version:2,material,...approval});
 const n=await all({...root(f.context.contextId),reference:f.executionId,pageSize:2});
 assert.deepEqual(n.filter(x=>x.source==='b08_definitions').map(x=>Number(x.version)),[1,2]);assert.equal(n.filter(x=>x.source==='crm_ha.decisions').length,2);
 assert.equal(new Set(n.map(x=>x.key)).size,n.length);assert.equal(n.find(x=>x.source==='b08_executions')!.version,2);
});

test('A11 wrong root denies original evidence and filters diagnostic references',async()=>{
 const a=await boundaryFixture(h),b=await boundaryFixture(h),event=a.base();await a.run(event);
 assert.ok((await all({...root(a.contextId),reference:event.operationId})).some(n=>n.id===event.eventId));
 assert.deepEqual(await all({...root(b.contextId),reference:event.operationId}),[]);
 assert.equal((await h.evidence.read(await h.auth(),read,event.eventId,'booking',b.contextId)).data,null);
});

test('A11 same UUID different context kind must not disclose another context record',async()=>{
 const shared=id(),booking=await communicationFixture(h,'outgoing',shared);
 const contact=h.req('evidence',{claim:'contact-only',coverage:'audit',certainty:'reviewed',source_kind:'manual'},shared,'contact');await h.evidence.apply(await h.auth(),write,contact);
 assert.equal((await h.evidence.read(await h.auth(),read,booking.recordId,'contact',shared)).data,null,'original reader denies wrong kind');
 const n=await all({contextKind:'contact',contextId:shared,pageSize:100});
 console.log('A11 same-kind separation',JSON.stringify({shared,bookingRecord:booking.recordId,contactRecord:contact.targetId,unexpected:n.filter(x=>x.id===booking.recordId)}));
 assert.equal(n.some(x=>x.id===booking.recordId),false,'diagnostic must respect contextKind, not only UUID');
});

test('A11 a known operation of another root must not be attached as this roots operation',async()=>{
 const a=await boundaryFixture(h),b=await boundaryFixture(h),event=b.base();await b.run(event);
 const o={...obs(a.contextId,'E8'),operationId:event.operationId};
 await assert.rejects(record(o),'existing foreign-root operation must not become false provenance');
});

test('A12 incomplete work and expired lease visible without mutating business state',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim();await f.run(c);await f.run(f.start(c,1));await h.admin`update crm_private.b08_attempts set lease_until=clock_timestamp()-interval '1 second' where attempt_id=${c.attemptId}::uuid`;
 const before=await f.see();const n=await all({...root(f.context.contextId),reference:f.executionId});assert.equal(n.find(x=>x.id===c.attemptId)!.leaseExpired,true);assert.equal(n.find(x=>x.id===f.executionId&&x.source==='b08_executions')!.incomplete,true);assert.ok(Number(n.find(x=>x.source==='b08_executions')!.ageSeconds)>=0);assert.deepEqual(await f.see(),before);
});

test('A13 persistent failure visible CRM plus unavailable WhatsApp; stop blocks new claim',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const alertId=id();await f.run({...f.base(),action:'persistent_failure',alertId,urgency:'critical'});
 const n=await all({...root(f.context.contextId),reference:f.executionId});const notifications=n.filter(x=>x.source==='b07_notifications');assert.equal(notifications.length,2);assert.deepEqual(notifications.map(x=>x.state).sort(),['unavailable','visible']);
 await f.run({...f.base(),action:'stop'});await assert.rejects(f.run(f.claim()));assert.equal((await f.see())!.execution.control_state,'stopped');
 const count=(await h.observer`select count(*)::int n from crm_private.b07_alerts`)[0]!.n;await all(root(f.context.contextId));assert.equal((await h.observer`select count(*)::int n from crm_private.b07_alerts`)[0]!.n,count);
});

test('A14 opaque canaries in raw event and issue prose never reach diagnostics or persistence',async()=>{
 const f=await boundaryFixture(h),event={...f.base(),externalKey:canary,material:{token:canary,secret:canary,password:canary,body:canary,email:canary,cost:canary,url:'https://audit.invalid/?token='+canary}};await f.run(event);
 const logs:unknown[]=[];const r=await invokeDiagnosticOperation({...root(f.contextId),operationId:event.operationId,eventId:event.eventId,requestId:canary},writer,async()=>({status:'pending',issues:[{...semanticIssue('E8','document'),message:canary}]}),{record:e=>logs.push(e)});
 const n=await all({...root(f.contextId),reference:r.requestRef});const persisted=await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where context_id=${f.contextId}::uuid`;
 assert.equal(JSON.stringify({n,persisted,logs,r}).includes(canary),false);
 const source=(await h.evidence.read(await h.auth(),read,event.eventId,'booking',f.contextId)).data;assert.ok(JSON.stringify(source).includes(canary),'canary reached canonical source');
});

test('A15 unauthenticated forged and wrong interaction access is denied',async()=>{
 const f=await communicationFixture(h),q=root(f.context.contextId),valid=await h.auth();
 for(const fake of [{}, {...valid}, {subject:h.subject,sessionId:h.sessionId,mfaVerified:true}])await assert.rejects(h.diagnostic.read(fake as any,read,q),/DIAGNOSTIC_DENIED/);
 await assert.rejects(h.diagnostic.read(valid,write,q),/DIAGNOSTIC_DENIED/);
 const noMfa=await verifyAuth({verify:async()=>({subject:h.subject,sessionId:h.sessionId,passwordVerified:true,mfaVerified:false})},id());await assert.rejects(h.diagnostic.read(noMfa,read,q),/DIAGNOSTIC_DENIED/);
});

test('A15 SQL and helper direct access denied to runtime API and TTE; RLS FORCE',async()=>{
 const row=(await h.observer`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.b10_diagnostic_observations'::regclass`)[0]!;assert.equal(row.relrowsecurity,true);assert.equal(row.relforcerowsecurity,true);
 for(const role of ['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated']){
 const db=h.connect(role);await assert.rejects(db.unsafe('select * from crm_private.b10_diagnostic_observations'));await assert.rejects(db.unsafe("select crm_private.diagnostic_nodes('x','booking','00000000-0000-0000-0000-000000000001')"));
 }
 const owner=(await h.observer`select rolbypassrls,rolsuper from pg_roles where rolname='crm_h0_f2_owner'`)[0]!;assert.equal(owner.rolbypassrls,false);assert.equal(owner.rolsuper,false);
});

test('A16 durable replay immutable and rejected E4 forbidden',async()=>{
 const f=await communicationFixture(h),o=obs(f.context.contextId);assert.equal((await record(o)).replayed,false);assert.equal((await record(o)).replayed,true);
 await assert.rejects(record({...o,requestRef:diagnosticReference(id())}));await assert.rejects(record({...o,observationId:id(),outcome:'rejected'}));
 await assert.rejects(h.migration`update crm_private.b10_diagnostic_observations set outcome='accepted' where observation_id=${o.observationId}::uuid`);
 assert.equal((await h.observer`select outcome from crm_private.b10_diagnostic_observations where observation_id=${o.observationId}::uuid`)[0]!.outcome,'pending');
});

test('A16 missing or foreign execution and non-event record references rejected',async()=>{
 const a=await workFixture(h),b=await workFixture(h);await a.run(a.definition);await b.run(b.definition);
 for(const delta of [{executionId:id()},{executionId:b.executionId},{eventId:a.comm.recordId},{eventId:id()}])await assert.rejects(record({...obs(a.context.contextId),...delta}));
});

test('A15 revoked actor cannot read existing results or originals',async()=>{
 const f=await communicationFixture(h),o=obs(f.context.contextId);await record(o);const old=await h.auth();
 try{await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;await assert.rejects(h.diagnostic.read(old,read,root(f.context.contextId)),/DIAGNOSTIC_DENIED/);await assert.rejects(h.evidence.read(old,read,f.recordId,'booking',f.context.contextId));}
 finally{await h.admin`update crm_private.crm_actors set enabled=true where actor_id=${h.actorId}::uuid`;const renewed=await secondWorkActor(h);h.auth=renewed.auth;}
});
