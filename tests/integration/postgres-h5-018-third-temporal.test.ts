import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {thirdDatabase,read,write} from '../support/h5-018-third-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import type {DiagnosticNode,DiagnosticObservation,DiagnosticQuery} from '../../src/domain/operation-diagnostic.ts';
let h:Awaited<ReturnType<typeof thirdDatabase>>;
before(async()=>{h=await thirdDatabase('h5018thirdtemporal',59951);});after(async()=>{await h?.close();});
async function all(contextId:string,reference:string,contextKind:DiagnosticQuery['contextKind']='booking'){
 const rows:DiagnosticNode[]=[];let after:string|undefined;const seen=new Set<string>();
 do{const p=await h.diagnostic.read(await h.auth(),read,{contextKind,contextId,reference,pageSize:2,...(after?{after}:{})});rows.push(...p.nodes);after=p.next??undefined;if(after){assert.equal(seen.has(after),false);seen.add(after);}}while(after);
 assert.equal(new Set(rows.map(x=>x.key)).size,rows.length);return rows;
}
const observation=(contextId:string,operationId?:string,executionId?:string):DiagnosticObservation=>({contextKind:'booking',contextId,observationId:id(),requestRef:diagnosticReference(id()),...(operationId?{operationId}:{}),...(executionId?{executionId}:{}),outcome:'pending',issues:[semanticIssue('E4','execution')]});
const record=async(o:DiagnosticObservation)=>h.diagnostic.record(await h.auth(),write,o);
const saved=async(o:DiagnosticObservation)=>(await h.observer`select to_jsonb(x) value from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]?.value;
async function revise(f:Awaited<ReturnType<typeof workFixture>>,context:typeof f.context,version:number){
 const material={...f.material,content:'Cambio sintético auditoría tercera '+version},approval=await f.approve(material);
 const cmd={...f.definition,...f.base(),action:'revise' as const,version,context,material,...approval,affectedRefs:[context.recordId]};await f.run(cmd);return cmd;
}

for(const mode of ['known','operation-only','unknown','no-operation'] as const)test('T01-'+mode+' preserves requests across A-B-C-A and later requests keep their context',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const b=await communicationFixture(h),c=await communicationFixture(h);
 const bctx={recordId:b.recordId,...b.context},cctx={recordId:c.recordId,...c.context};
 const o=observation(f.context.contextId,mode==='unknown'?id():mode==='no-operation'?undefined:f.definition.operationId,mode==='operation-only'?undefined:f.executionId);await record(o);const initial=await saved(o);
 assert.ok((await all(f.context.contextId,o.requestRef)).some(x=>x.id===o.observationId));
 const v2=await revise(f,bctx,2),later=observation(bctx.contextId,v2.operationId,f.executionId);await record(later);const second=await saved(later);
 const old=await all(f.context.contextId,o.requestRef);assert.ok(old.some(x=>x.id===o.observationId));assert.equal(old.some(x=>['b08_executions','b08_definitions'].includes(x.source)),false);assert.equal(JSON.stringify(old).includes(b.recordId),false);
 assert.equal((await all(bctx.contextId,o.requestRef)).some(x=>x.id===o.observationId),false);
 await revise(f,cctx,3);assert.ok((await all(f.context.contextId,o.requestRef)).some(x=>x.id===o.observationId));assert.ok((await all(bctx.contextId,later.requestRef)).some(x=>x.id===later.observationId));assert.deepEqual(await all(cctx.contextId,later.requestRef),[]);
 await revise(f,f.context,4);assert.ok((await all(f.context.contextId,o.requestRef)).some(x=>x.id===o.observationId));assert.ok((await all(bctx.contextId,later.requestRef)).some(x=>x.id===later.observationId));
 assert.deepEqual(await saved(o),initial);assert.deepEqual(await saved(later),second);
 const owner=await f.worker.read(await h.auth(),read,f.executionId,f.context);assert.ok(JSON.stringify(owner).includes(v2.operationId));
 console.log('T01 sequence',JSON.stringify({mode,versions:[1,2,3,4],originalPreserved:true,secondPreserved:true}));
});

test('T02 same UUID context kind does not reveal the booking historical request',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const o=observation(f.context.contextId,f.definition.operationId,f.executionId);await record(o);
 const contact=h.req('evidence',{claim:'synthetic contact only',coverage:'audit',certainty:'reviewed',source_kind:'manual'},f.context.contextId,'contact');await h.evidence.apply(await h.auth(),write,contact);
 const b=await communicationFixture(h);await revise(f,{recordId:b.recordId,...b.context},2);
 assert.deepEqual(await all(f.context.contextId,o.requestRef,'contact'),[]);assert.ok((await all(f.context.contextId,o.requestRef)).some(x=>x.id===o.observationId));
});

test('T03 unknown operation later owned by another execution cannot become a confirmed false association',async()=>{
 const a=await workFixture(h);await a.run(a.definition);const b=await workFixture(h);const future=b.definition.operationId;
 const o=observation(a.context.contextId,future,a.executionId);await record(o);
 assert.equal((await all(a.context.contextId,o.requestRef)).find(x=>x.id===o.observationId)?.operationReferenceState,'unverified_attempt');
 await b.run({...b.definition,context:a.context,affectedRefs:[a.comm.recordId]});
 const nodes=await all(a.context.contextId,o.requestRef),falseAssociation=nodes.find(x=>x.id===o.observationId&&x.operationReferenceState==='canonical');
 console.log('T03 later canonical owner',JSON.stringify({operation:future,actualExecution:b.executionId,observedExecution:a.executionId,returned:falseAssociation??null}));
 assert.equal(falseAssociation,undefined,'F02: a later canonical operation for B cannot confirm an observation claiming execution A');
});

for(const collision of [false,true])test('T04 current incompatible execution pair is not canonical; UUID alias='+collision,async()=>{
 const a=await workFixture(h);await a.run(a.definition);const b=await workFixture(h),otherExecution=collision?a.definition.operationId:b.executionId;
 await b.run({...b.definition,executionId:otherExecution,context:a.context,affectedRefs:[a.comm.recordId]});
 const o=observation(a.context.contextId,a.definition.operationId,otherExecution);let rejected=false;
 try{await record(o);}catch(e){assert.match(String(e),/DIAGNOSTIC_DENIED/);rejected=true;}
 const nodes=await all(a.context.contextId,o.requestRef),returned=nodes.find(x=>x.id===o.observationId);
 const canonicalOwner=(await h.observer`select result_ref::text execution from crm_private.b07_operations where operation_id=${a.definition.operationId}::uuid`)[0]!.execution;
 assert.equal(canonicalOwner,a.executionId);assert.notEqual(canonicalOwner,otherExecution);
 console.log('T04 contradictory pair',JSON.stringify({collision,rejected,operation:a.definition.operationId,canonicalOwner,claimedExecution:otherExecution,returned:returned??null}));
 assert.ok(rejected||!returned||returned.operationReferenceState!=='canonical','Operation and execution identities conflict with their canonical owner; do not present the pair as canonical');
});

test('T05 historical recovery checks exact execution even when operation UUID equals a different execution',async()=>{
 const a=await workFixture(h);await a.run(a.definition);const b=await workFixture(h);await b.run({...b.definition,executionId:a.definition.operationId,context:a.context,affectedRefs:[a.comm.recordId]});
 const good=observation(a.context.contextId,a.definition.operationId,a.executionId),bad=observation(a.context.contextId,a.definition.operationId,a.definition.operationId);await record(good);
 try{await record(bad);}catch(e){assert.match(String(e),/DIAGNOSTIC_DENIED/);}
 const dest=await communicationFixture(h);await revise(a,{recordId:dest.recordId,...dest.context},2);
 assert.ok((await all(a.context.contextId,good.requestRef)).some(x=>x.id===good.observationId));assert.equal((await all(a.context.contextId,bad.requestRef)).some(x=>x.id===bad.observationId),false);
});

test('T06 nonexistent and foreign execution references reject without inserting observations',async()=>{
 const a=await workFixture(h),b=await workFixture(h);await a.run(a.definition);await b.run(b.definition);
 const before=(await h.observer`select count(*)::int n from crm_private.b10_diagnostic_observations`)[0]!.n;
 for(const execution of [id(),b.executionId])await assert.rejects(record(observation(a.context.contextId,a.definition.operationId,execution)),/DIAGNOSTIC_DENIED/);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b10_diagnostic_observations`)[0]!.n,before);
});
