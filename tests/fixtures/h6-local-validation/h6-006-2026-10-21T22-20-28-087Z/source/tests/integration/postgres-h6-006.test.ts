import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {isolatedWork,workFixture,write} from '../support/h6-current-isolated.ts';

test('H6-006 E01 E03 E04 E07 E11 E12 E13: durable external double, killed executor, independent observer and safe continuation',async t=>{
 const h=await isolatedWork('crm_h6006',59606),provider=await mkdtemp(join(tmpdir(),'crm-h6006-provider-'));
 try{
  const f=await workFixture(h,2);await f.run(f.definition);
  const baseline=await h.admin`select record_id,material from crm_private.b07_records where record_id=${f.comm.recordId}::uuid`;
  const before=await f.see();assert.equal(before!.parts[0].state,'pending');
  const c=f.claim(),receipt=await f.run(c),providerFile=join(provider,'ledger.jsonl');
  const config={databaseUrl:'postgresql://crm_h0_ha_tx@127.0.0.1:59606/crm_h6006',ssl:false,capability:{...h.f1,key:Array.from(h.f1.key)},humanAuthorization:{...h.f2,key:Array.from(h.f2.key)},executorId:'synthetic-executor-a'};
  const child=(mode:string,command?:unknown)=>{
   const p=spawnSync(process.execPath,['--experimental-strip-types','tests/support/h6-durable-provider-child.ts'],{input:JSON.stringify({mode,command,providerFile,config,auth:{subject:h.subject,sessionId:h.sessionId,passwordVerified:true,mfaVerified:true},executionId:f.executionId,context:f.context}),encoding:'utf8',timeout:20000});
   assert.equal(p.error,undefined);return {status:p.status,signal:p.signal,error:p.stderr,data:p.stdout.trim()?JSON.parse(p.stdout):null};
  };
  const killed=child('effect_then_crash',f.start(c,receipt.generation!));assert.equal(killed.signal,'SIGKILL',killed.error);
  const ledger=JSON.parse((await readFile(providerFile,'utf8')).trim());
  assert.equal(ledger.attemptId,c.attemptId);assert.equal(ledger.partId,'part-1');
  const restarted=child('read');assert.equal(restarted.status,0,restarted.error);assert.equal(restarted.data.result.parts[0].state,'contacted');
  await h.admin`update crm_private.b08_attempts set lease_until=clock_timestamp()-interval '1 second' where attempt_id=${c.attemptId}::uuid`;
  await f.run({...f.base(),action:'recover'});let observed=(await f.see())!;
  assert.equal(observed.parts[0].state,'uncertain');
  assert.equal((await h.observer`select state from crm_ha.reservations where reservation_id=${observed.parts[0].reservation_id}`)[0]!.state,'uncertain');
  // Manual review/resume does not make this part safe. Another pending part may
  // legitimately proceed, so assert the exact affected part rather than all work.
  await f.run({...f.base(),action:'review'});await f.run({...f.base(),action:'resume'});
  const invented={...f.base(),action:'result' as const,attemptId:c.attemptId,outcome:'succeeded' as const,resultRef:'invented'};
  assert.notEqual(child('apply',invented).status,0);
  const proof={...invented,operationId:uid(),resultRef:ledger.resultRef};
  const reconciled=child('apply',proof);assert.equal(reconciled.status,0,reconciled.error);
  assert.equal(child('apply',proof).data.result.replayed,true);
  const observedAfter=(await f.see())!;assert.deepEqual(observedAfter.parts.map(p=>p.state),['succeeded','pending']);
  const second=f.claim(),claim=await f.run(second);assert.equal(claim.partId,'part-2');
  await f.run(f.start(second,claim.generation!));await f.run(f.prove(second.attemptId));
  assert.equal((await readFile(providerFile,'utf8')).trim().split('\n').length,1);
  const rows=await h.observer`select event_kind,attempt_id from crm_ha.events where reservation_id=${observedAfter.parts[0].reservation_id}`;
  assert.equal(rows.filter(x=>x.event_kind==='reconciled-succeeded').length,1);
  assert.equal(rows.find(x=>x.event_kind==='reconciled-succeeded')!.attempt_id,c.attemptId);
  assert.deepEqual(await h.admin`select record_id,material from crm_private.b07_records where record_id=${f.comm.recordId}::uuid`,baseline);
  await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;
  assert.notEqual(child('apply',proof).status,0,'replay must reauthorize');
  t.diagnostic(JSON.stringify({chain:68,providerEffects:1,childKilled:true,restartedPid:restarted.data.pid,partStates:(await h.observer`select state from crm_private.b08_parts where execution_id=${f.executionId}::uuid order by part_id`).map(x=>x.state),oneReconciliation:true,replayReauthorized:true,commercialFactUnchanged:true,auth:'synthetic-port',externalEffects:'simulated'}));
 }finally{await h.close();await rm(provider,{recursive:true,force:true});}
});
