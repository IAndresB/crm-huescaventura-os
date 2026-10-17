import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {fourthDatabase,all,observation,revise,saved,write} from '../support/h5-018-fourth-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
let h:Awaited<ReturnType<typeof fourthDatabase>>;
before(async()=>{h=await fourthDatabase('fourthreplayrefs',59986);});after(async()=>{await h?.close();});
// Q04/Plan7.1/V-AT: isolate both pre-replay checks with an absent-reference control.
for(const mode of ['operation-only','execution-only','no-optional-reference'] as const)test('Q04 historical exact replay optional reference control '+mode,async()=>{
 const f=await workFixture(h);await f.run(f.definition);
 const o=observation('booking',f.context.contextId,mode==='operation-only'?f.definition.operationId:undefined,mode==='execution-only'?f.executionId:undefined);await h.diagnostic.record(await h.auth(),write,o);const original=await saved(h,o);
 assert.equal((await h.diagnostic.record(await h.auth(),write,o)).replayed,true);
 const dest=await communicationFixture(h);await revise(f,{recordId:dest.recordId,...dest.context},2);
 assert.ok((await all(h,{contextKind:'booking',contextId:o.contextId,reference:o.requestRef,pageSize:100})).some(n=>n.id===o.observationId));
 let result:unknown,error:string|undefined;try{result=await h.diagnostic.record(await h.auth(),write,o);}catch(e){error=String(e);}
 assert.deepEqual(await saved(h,o),original);
 console.log('Q04 replay guard isolation',JSON.stringify({mode,observation:o.observationId,operation:o.operationId,execution:o.executionId,result,error,priorReplay:true,historicalRead:true,originalPreserved:true}));
 assert.equal(error,undefined,'Authorized equivalent observation identity must recover its immutable result');assert.equal((result as {replayed:boolean}).replayed,true);
});
