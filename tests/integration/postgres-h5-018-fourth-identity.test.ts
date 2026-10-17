import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {fourthDatabase,all,observation,revise,saved,read,write} from '../support/h5-018-fourth-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
let h:Awaited<ReturnType<typeof fourthDatabase>>;
before(async()=>{h=await fourthDatabase('fourthidentity',59983);});after(async()=>{await h?.close();});

for(const alias of [false,true])test('Q01 typed event execution alias with authorized multiple references and late owner '+alias,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const event=await boundaryFixture(h,'other',f.context.contextId),cmd={...event.base(),...(alias?{eventId:f.executionId}:{})};await event.run(cmd);
 const claim=f.claim(60),o=observation('booking',f.context.contextId,claim.operationId,f.executionId,cmd.eventId);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);
 const q={contextKind:'booking' as const,contextId:o.contextId,reference:o.requestRef,pageSize:2};assert.equal((await all(h,q)).find(n=>n.id===o.observationId)?.operationReferenceState,'unverified_attempt');await f.run(claim);
 assert.equal((await all(h,q)).find(n=>n.id===o.observationId)?.operationReferenceState,'canonical');
 await f.run({...f.base(),action:'pause'});
 assert.ok((await all(h,q)).some(n=>n.id===o.observationId));assert.deepEqual(await saved(h,o),original);
 console.log('Q01 typed positive',JSON.stringify({alias,event:cmd.eventId,execution:f.executionId,operation:claim.operationId,originalPreserved:true}));
});

test('Q03 shared original event links two contexts without moving observations or inventing ownership',async()=>{
 const a=await workFixture(h),b=await workFixture(h);await a.run(a.definition);await b.run(b.definition);
 const event=await boundaryFixture(h,'other',a.context.contextId),cmd=event.base();await event.run(cmd);
 assert.equal((await h.evidence.read(await h.auth(),read,cmd.eventId,'booking',b.context.contextId)).data,null);
 const link={action:'link' as const,operationId:id(),targetId:id(),originalId:cmd.eventId,sourceRef:'SYNTHETIC shared original',purpose:cmd.purpose,contextKind:'booking' as const,contextId:b.context.contextId,coverage:'SYNTHETIC related second root',reason:'Explicit authorized link'};await h.evidence.apply(await h.auth(),write,link);
 const oa=observation('booking',a.context.contextId,a.definition.operationId,a.executionId,cmd.eventId),ob=observation('booking',b.context.contextId,b.definition.operationId,b.executionId,cmd.eventId);
 await h.diagnostic.record(await h.auth(),write,oa);await h.diagnostic.record(await h.auth(),write,ob);
 for(const [own,other]of [[oa,ob],[ob,oa]]){
  const nodes=await all(h,{contextKind:'booking',contextId:own!.contextId,reference:cmd.eventId,pageSize:1});assert.ok(nodes.some(n=>n.id===own!.observationId));assert.equal(nodes.some(n=>n.id===other!.observationId),false);
 }
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_records where record_id=${cmd.eventId}::uuid`)[0]!.n,1);
});

test('Q05 withdrawal blocks effect but preserves E4 observation and human approval history',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const claim=f.claim(60),r=await f.run(claim),o=observation('booking',f.context.contextId,claim.operationId,f.executionId);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);
 await f.run({...f.base(),action:'withdraw_approval',...f.approval});await assert.rejects(f.run(f.start(claim,r.generation!)));await assert.rejects(f.run({...f.base(),action:'resume'}));
 const nodes=await all(h,{contextKind:'booking',contextId:o.contextId,reference:o.requestRef,pageSize:1});assert.ok(nodes.some(n=>n.id===o.observationId));assert.equal(nodes.find(n=>n.id===f.executionId)?.approvalWithdrawn,true);
 assert.equal((await h.observer`select decision from crm_ha.decisions where decision_id=${f.approval.decisionId}`)[0]!.decision,'approved');assert.deepEqual(await saved(h,o),original);
});

test('Q02 writing a foreign historical operation after return must not establish local provenance',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const dest=await communicationFixture(h),foreign={recordId:dest.recordId,...dest.context},middle=await revise(f,foreign,2);await revise(f,f.context,3);
 assert.equal((await h.evidence.read(await h.auth(),read,foreign.recordId,'booking',f.context.contextId)).data,null);
 const o=observation('booking',f.context.contextId,middle.operationId,f.executionId);let result:unknown,error:string|undefined;try{result=await h.diagnostic.record(await h.auth(),write,o);}catch(e){error=String(e);}
 const nodes=await all(h,{contextKind:'booking',contextId:o.contextId,reference:o.requestRef,pageSize:100});
 console.log('Q02 write provenance',JSON.stringify({origin:f.context,foreign,foreignOperation:middle.operationId,observation:o.observationId,result,error,returned:nodes.find(n=>n.id===o.observationId)}));
 assert.match(error??'',/DIAGNOSTIC_DENIED/,'Operation owner identity alone cannot substitute for its original authorized context');assert.equal(await saved(h,o),undefined);
});
