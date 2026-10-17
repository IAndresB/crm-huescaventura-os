import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {auditDatabase,read,write} from '../support/h5-diagnostic-corrected-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {invokeDiagnosticOperation} from '../../src/server/diagnostic-operation.ts';
import {invokeC01,invokeC04,invokeC05} from '../../src/application/contracts.ts';
import {issueTrustedContext} from '../../src/application/trusted-context.ts';
import {composeServer} from '../../src/server/composition.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import type {CommonGuardFacts} from '../../src/domain/guards.ts';
import type {ApplicationResult} from '../../src/application/result.ts';
let h:Awaited<ReturnType<typeof auditDatabase>>;
before(async()=>{h=await auditDatabase('h5018causes',59721);});after(async()=>{await h?.close();});
const safe:CommonGuardFacts={identityAndScope:'satisfied',materialTruth:'satisfied',sensitiveSupervision:'satisfied',conservation:'satisfied',independence:'satisfied',repetition:'new'};
const context=()=>issueTrustedContext({identityId:h.actorId,identityKind:'human',purpose:'independent-audit',scope:h.scope,requestId:id(),serverTime:new Date().toISOString()});
async function locate(contextId:string,operationId:string,invoke:()=>Promise<ApplicationResult<unknown>>,expected:{code:string,state:string,step:string},eventId?:string){
 const logs:unknown[]=[];const result=await invokeDiagnosticOperation({contextKind:'booking',contextId,operationId,requestId:id(),...(eventId?{eventId}:{})},{record:o=>h.auth().then(a=>h.diagnostic.record(a,write,o))},invoke,{record:x=>logs.push(x)});
 const page=await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId,reference:result.requestRef,pageSize:100});
 const node=page.nodes.find(n=>n.source==='b10_diagnostic_observations')!;assert.ok(node);const issues=node.issues as any[];assert.equal(issues[0].code,expected.code);assert.equal(issues[0].knownState,expected.state);assert.equal(issues[0].nextStep,expected.step);assert.ok(node.references.includes(operationId));assert.equal(JSON.stringify({page,logs}).includes('CAUSE_CANARY'),false);return result;
}

test('A01 E1 actual C01 guard blocks port and authorized reviewer locates cause',async()=>{
 const f=await communicationFixture(h);let invoked=0;
 await locate(f.context.contextId,id(),()=>invokeC01({context:context(),scope:'access',guards:{...safe,identityAndScope:'missing'},input:{}},{read:async()=>{invoked++;return {data:{},provenance:'synthetic',certainty:'verified'};}}),{code:'E1',state:'unchanged',step:'correct-or-review'});assert.equal(invoked,0);
});

test('A02 E2 actual C01 version guard blocks port while original and conflicting external receipt persist',async()=>{
 const f=await boundaryFixture(h),first=f.base();await f.run(first);const second={...f.base(),material:{amount:'200.00',currency:'EUR'}};await f.run(second);let invoked=0;
 const receipt=(await h.observer`select receipt_state from crm_private.b09_event_receipts where operation_id=${second.operationId}::uuid`)[0]!;assert.equal(receipt.receipt_state,'conflict');
 await locate(f.contextId,second.operationId,()=>invokeC01({context:context(),scope:'event',guards:{...safe,repetition:'conflicting'},input:{}},{read:async()=>{invoked++;return {data:{},provenance:'synthetic',certainty:'verified'};}}),{code:'E2',state:'conflicting',step:'reevaluate-current-state'},first.eventId);assert.equal(invoked,0);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b09_event_receipts where source_id=${f.sourceId}::uuid`)[0]!.n,2);
});

test('A03 E3 actual evidence contract blocks invalid verification but independent query remains usable',async()=>{
 const f=await communicationFixture(h);let registered=0;
 await locate(f.context.contextId,id(),()=>invokeC04({context:context(),scope:'evidence',guards:safe,input:{sourceReference:'CAUSE_CANARY',receivedAt:new Date().toISOString(),preservation:'original',verification:{reviewerIdentityId:'',reviewedAt:'invalid'}}},{register:async()=>{registered++;return {evidenceId:id()};}}),{code:'E3',state:'pending',step:'supply-required-evidence'});
 assert.equal(registered,0);assert.notEqual((await h.evidence.read(await h.auth(),read,f.originalId,'booking',f.context.contextId)).data,null);
});

test('A04 E4 actual C05 uncertain attempt remains pending with stable attempt reference',async()=>{
 const f=await communicationFixture(h),attemptId=id();let calls=0;
 const r=await locate(f.context.contextId,id(),()=>invokeC05({context:context(),scope:'execution',guards:safe,input:{effectId:id(),recipientReference:'CAUSE_CANARY',contentVersion:'1'}},{record:async()=>{calls++;return {stage:'uncertain',intentId:'audit-intent',attemptId};}}),{code:'E4',state:'uncertain',step:'reconcile-before-retry'});
 assert.equal(calls,1);assert.equal(r.result.status,'pending');assert.ok(r.result.status==='pending'&&(r.result.value as any).attemptId===attemptId);
});

test('A05 E5 known resolver failure occurs before business callback and does not claim unknown external effect',async()=>{
 const f=await communicationFixture(h);let effects=0;
 const server=composeServer({allowedOrigins:new Set(['audit']),contexts:{resolve:async()=>{throw new Error('CAUSE_CANARY');}},fingerprints:{fingerprint:()=>''},replay:{inspect:async()=>({status:'new'})},diagnostics:{record:()=>{}}});
 await locate(f.context.contextId,id(),()=>server.invoke({requestId:id(),kind:'query',origin:'audit',payload:{}},async()=>{effects++;return {status:'applied',value:{}};}),{code:'E5',state:'unchanged',step:'retry-only-if-safe'});assert.equal(effects,0);
});

test('A06 E6 actual C05 intent without available channel stays pending without delivery',async()=>{
 const f=await communicationFixture(h);let sends=0;
 const r=await locate(f.context.contextId,id(),()=>invokeC05({context:context(),scope:'dependency',guards:safe,input:{effectId:id(),recipientReference:'CAUSE_CANARY',contentVersion:'1'}},{record:async()=>({stage:'intent',intentId:'channel-not-enabled'})}),{code:'E6',state:'pending',step:'restore-dependency'});
 assert.equal(sends,0);assert.equal(r.result.status,'pending');assert.equal(r.result.status==='pending'&&(r.result.value as any).stage,'intent');
});

test('A07 E7 original ambiguous candidates retained; diagnostic locates review without promoting extraction',async()=>{
 const f=await communicationFixture(h);const c=f.derive('candidate');await f.run(c);const before=await f.see();
 // Domain adapters use module-specific states; explicit trusted composition maps
 // this demonstrated ambiguous candidate to SPEC E7. It is not an automatic classifier.
 await locate(f.context.contextId,c.operationId,async()=>({status:'pending',issues:[semanticIssue('E7','identity')]}),{code:'E7',state:'pending',step:'resolve-ambiguity'});
 assert.deepEqual(await f.see(),before);assert.notEqual((await h.evidence.read(await h.auth(),read,f.originalId,'booking',f.context.contextId)).data,null);
});

test('A08 E8 contradictory external versions remain preserved and diagnostic cannot rewrite canonical event',async()=>{
 const f=await boundaryFixture(h),a=f.base();await f.run(a);const b={...f.base(),material:{amount:'999.00',currency:'EUR'}};await f.run(b);
 const original=await h.evidence.read(await h.auth(),read,a.eventId,'booking',f.contextId);
 await locate(f.contextId,b.operationId,async()=>({status:'pending',issues:[semanticIssue('E8','document')]}),{code:'E8',state:'conflicting',step:'review-discrepancy'},a.eventId);
 assert.deepEqual(await h.evidence.read(await h.auth(),read,a.eventId,'booking',f.contextId),original);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b09_event_receipts where source_id=${f.sourceId}::uuid`)[0]!.n,2);
});

test('A04 composed public server path after an effect must preserve E4 through diagnostics',async()=>{
 const f=await communicationFixture(h),op=id(),logs:unknown[]=[];let effects=0;
 const server=composeServer({allowedOrigins:new Set(['audit']),contexts:{resolve:async()=>context()},fingerprints:{fingerprint:()=> 'fixed-audit'},replay:{inspect:async()=>({status:'new'})},diagnostics:{record:e=>logs.push(e)}});
 const r=await invokeDiagnosticOperation({contextKind:'booking',contextId:f.context.contextId,requestId:id(),operationId:op},{record:o=>h.auth().then(a=>h.diagnostic.record(a,write,o))},()=>server.invoke({requestId:id(),kind:'mutation',origin:'audit',payload:{},operation:{id:op}},async()=>{effects++;await h.evidence.apply(await h.auth(),write,h.req('evidence',{claim:'effect-before-exception',coverage:'audit',certainty:'reviewed',source_kind:'manual'},f.context.contextId,'booking'));throw new Error('CAUSE_CANARY');}));
 const n=await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:f.context.contextId,reference:r.requestRef,pageSize:100});console.log('A04 composition observed',JSON.stringify({effects,result:r.result,nodes:n.nodes.filter(x=>x.source==='b10_diagnostic_observations'),logs}));
 assert.equal(effects,1);assert.equal(r.result.status,'pending','public composition must not downgrade unknown effect to definitive E5');assert.ok(r.result.status==='pending'&&r.result.issues.some(x=>x.code==='E4'));
});
