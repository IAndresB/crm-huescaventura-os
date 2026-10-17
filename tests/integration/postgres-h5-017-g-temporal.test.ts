import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {fifthDatabase} from '../support/h5-018-fifth-isolated.ts';
import {cancellationFixture} from '../support/h5-017-g-cancellation-fixtures.ts';

let h:Awaited<ReturnType<typeof fifthDatabase>>;
const act='2026-10-17T10:00:00Z';
before(async()=>{h=await fifthDatabase('crm_h5017g_time',59671);});
after(async()=>{await h?.close();});
const evidence=async(ref:string)=>(await h.observer`select to_jsonb(r) row from crm_private.b07_records r where record_id=${ref}::uuid`)[0]!.row;
const state=async(did:string)=>({
 roots:await h.observer`select to_jsonb(r) row from crm_private.b06_cancellation_determinations r where determination_id=${did}::uuid`,
 revisions:await h.observer`select to_jsonb(r) row from crm_private.b06_cancellation_revisions r where determination_id=${did}::uuid order by revision`,
 operations:await h.observer`select to_jsonb(r) row from crm_private.b06_cancellation_operations r where determination_id=${did}::uuid order by operation_id`,
 payments:await h.observer`select count(*)::int n from crm_private.b05_payment_operations`,
});

test('G-T01 fixed act and re-attest preserve result, history, evidence and exact replay',async()=>{
 const f=await cancellationFixture(h,{count:3}),first=await f.command();
 assert.equal(first.at,act);assert.equal(first.facts!.at,act);
 const q=await f.attest(first),source=await evidence(q.evidenceId);
 assert.equal(Date.parse(source.occurred_at),Date.parse(act));
 const value=await f.run(q);assert.equal(value.result.computed.right,'150.03');
 assert.equal(value.result.computed.retention,'150.00');assert.equal(value.result.computed.baseTotal,'300.03');
 const saved=await state(f.did);assert.equal((await f.run(q)).replayed,true);
 assert.deepEqual(await state(f.did),saved);assert.deepEqual(await evidence(q.evidenceId),source);
 assert.equal((await f.see()).history.length,1);
});

for(const offset of [-1,0])test(`G-T02 evidence offset ${offset}ms from protected fixed act is accepted`,async()=>{
 const f=await cancellationFixture(h,{amount:'200.00'}),q=await f.command({},new Date(Date.parse(act)+offset).toISOString());
 assert.equal(q.at,act);assert.equal(Date.parse((await evidence(q.evidenceId)).occurred_at),Date.parse(act)+offset);
 assert.equal((await f.run(q)).result.computed.right,'100.00');
});

test('G-T03 explicit later evidence remains E3 without cancellation or financial effects',async()=>{
 const f=await cancellationFixture(h),base=await f.command(),saved=await state(f.did);
 for(const offset of [1,86400000]){
  const q=await f.attest(base,'reviewed',new Date(Date.parse(act)+offset).toISOString());
  await assert.rejects(f.run(q),/CANCELLATION_EVIDENCE_REQUIRED:E3/);
  assert.deepEqual(await state(f.did),saved);assert.equal(await f.see(),null);
 }
});

test('G-T04 earlier historical evidence remains immutable and queryable after determination',async()=>{
 const f=await cancellationFixture(h),q=await f.command({},'2026-10-01T09:00:00Z'),source=await evidence(q.evidenceId);
 await f.run(q);const saved=await state(f.did);
 assert.equal((await f.run(q)).replayed,true);assert.deepEqual(await evidence(q.evidenceId),source);
 assert.deepEqual(await state(f.did),saved);assert.equal((await f.see()).history.length,1);
});

test('G-T05 another determination or booking evidence cannot establish this cancellation',async()=>{
 const f=await cancellationFixture(h),other=await cancellationFixture(h),q=await f.command(),foreign=await other.command();
 const sameRootForeign=await f.attest({...q,determinationId:id()});
 const saved=await state(f.did);
 for(const evidenceId of [foreign.evidenceId,sameRootForeign.evidenceId]){
  await assert.rejects(f.run({...q,evidenceId}),/CANCELLATION_EVIDENCE_REQUIRED:E3/);
  assert.deepEqual(await state(f.did),saved);
 }
 assert.equal(await f.see(),null);
});

test('G-T06 auxiliary cancellation proofs use synthetic act; other proof families keep their original clock',async()=>{
 const f=await cancellationFixture(h);
 for(const kind of ['base','approve','nonrefundable']){
  const ref=await f.conf.proof('cancellation:'+kind+':SYNTHETIC chronology control',f.did);
  assert.equal(Date.parse((await evidence(ref)).occurred_at),Date.parse(act));
 }
 const other=await f.conf.proof('SYNTHETIC non-cancellation clock control',f.did);
 assert.equal(Date.parse((await evidence(other)).occurred_at),Date.parse(f.conf.at));
});

test('G-T07 different real construction moments do not change cancellation evidence or act',async()=>{
 const seen=[];
 for(let i=0;i<2;i++){
  const f=await cancellationFixture(h),q=await f.command();
  seen.push({realFixtureAt:f.conf.at,act:q.at,evidenceAt:(await evidence(q.evidenceId)).occurred_at});
  assert.equal(q.at,act);assert.equal(Date.parse(seen[i]!.evidenceAt),Date.parse(act));
  assert.equal((await f.run(q)).result.computed.right,'50.01');
 }
 assert.notEqual(seen[0]!.realFixtureAt,seen[1]!.realFixtureAt);
 console.log('G deterministic chronology '+JSON.stringify(seen));
});

for(const [at,right]of [['2026-10-13T10:00:00Z','200.00'],['2026-10-18T10:00:00Z','0.00']])test(`G-T08 explicit civil act ${at} determines chronology independently of current date`,async()=>{
 const f=await cancellationFixture(h,{amount:'200.00'}),base=await f.command();
 const q=await f.command({at,facts:{...base.facts!,at:at!}});
 assert.equal(Date.parse((await evidence(q.evidenceId)).occurred_at),Date.parse(at!));
 assert.equal((await f.run(q)).result.computed.right,right);
});
