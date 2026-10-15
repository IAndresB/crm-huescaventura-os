// Independent H04/S11: follow a projected receipt to the authorized original
// execution. The projection must not substitute a log for approved business facts.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {randomUUID as uid} from 'node:crypto';
import {isolatedBoundaries,boundaryFixture,read,write} from '../support/h5-boundary-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
test('H5-012 H04/S11 authorized reference chain distinguishes responsible approver and automatic executor',async()=>{
 const h=await isolatedBoundaries('h512refs',59430);
 try{
  for(const name of (await readdir('supabase/migrations')).filter(x=>x>='20261014003559'&&x.endsWith('.sql')).sort())await h.migration.unsafe(await readFile('supabase/migrations/'+name,'utf8'));
  const w=await workFixture(h);await h.identities.apply(await h.auth(),write,{action:'create_context',operationId:uid(),targetId:w.context.contextId,kind:'booking',expectedVersion:0,verified:true,sourceRef:'synthetic reference context',evidenceRef:'synthetic permission',reason:'independent chain'});
  await w.run(w.definition);const claim=w.claim(),r=await w.run(claim);await w.run(w.start(claim,r.generation!));
  const f=await boundaryFixture(h,'other',w.context.contextId),event={...f.base(),echoOfOperationId:claim.attemptId};assert.equal((await f.run(event)).state,'duplicate');
  const before=await w.see(),reader=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2),result=await reader.read(await h.auth(),read,{contextKind:'booking',contextId:w.context.contextId,surface:'timeline',destination:'administrator'});
  const receipt=(result!.entries as any[]).find(x=>x.source==='crm_private.b09_event_receipts'&&x.data.operation_id===event.operationId);assert.ok(receipt);assert.ok(JSON.stringify(receipt).includes(claim.attemptId));
  const original:any=await w.see();assert.equal(original.definition.responsible_actor,h.actorId);assert.equal(original.definition.decision_id,w.approval.decisionId);assert.equal(original.definition.proposal_id,w.approval.proposalId);const attempt=original.attempts.find((x:any)=>x.attempt_id===claim.attemptId);assert.ok(attempt);assert.equal(attempt.executor_id,'synthetic-executor-a');assert.notEqual(attempt.executor_id,original.definition.responsible_actor);assert.equal(attempt.result_ref,null);assert.equal(attempt.state,'contacted');assert.ok(attempt.contacted_at);
  assert.ok(original.history.length);assert.deepEqual(await w.see(),before);assert.equal(result!.mutationAuthority,false);
  await assert.rejects(w.worker.read({} as never,read,w.executionId,w.context));
  const outside=await reader.read(await h.auth(),read,{contextKind:'booking',contextId:w.context.contextId,surface:'timeline',destination:'customer'});assert.equal(JSON.stringify(outside).includes(claim.attemptId),false);
 }
 finally{await h.close();}
});
