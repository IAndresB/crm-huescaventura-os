import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uuid} from 'node:crypto';
import {fifthDatabase,write,read} from '../support/h5-018-fifth-isolated.ts';
import {cancellationFixture as original} from '../support/h4-cancellation-fixtures.ts';
import {cancellationFixture as candidate} from '../support/h5-017-g-cancellation-fixtures.ts';
let h:Awaited<ReturnType<typeof fifthDatabase>>;
const act='2026-10-17T10:00:00Z';
before(async()=>{h=await fifthDatabase('sixth_time',60451);});
after(async()=>{await h?.close();});
const record=async(id:string)=>(await h.observer`select to_jsonb(r) data from crm_private.b07_records r where record_id=${id}::uuid`)[0]!.data;
const snapshot=async()=>{
 const tables=['b06_cancellation_determinations','b06_cancellation_revisions','b06_cancellation_operations','b06_cancellation_applications','b05_payment_operations','b05_obligation_history','b05_obligation_adjustments'];
 const result:Record<string,unknown>={};for(const name of tables)result[name]=await h.observer.unsafe(`select to_jsonb(r) data from crm_private.${name} r order by to_jsonb(r)::text`);return result;
};
for(const delta of [-86400000,-1,0,1,86400000])test(`S6 A/B/C delta ${delta}ms with historical and repeated immutable effects`,async()=>{
 const f=await candidate(h,{amount:'200.00'});const q=await f.command({},new Date(Date.parse(act)+delta).toISOString());const evidence=await record(q.evidenceId),before=await snapshot();
 assert.equal(q.at,act);assert.equal(q.facts!.at,act);assert.equal(q.facts!.reference!.date,'2026-10-20');assert.equal(Date.parse(evidence.occurred_at),Date.parse(act)+delta);
 if(delta>0){for(let i=0;i<2;i++)await assert.rejects(f.run(q),/CANCELLATION_EVIDENCE_REQUIRED:E3/);assert.deepEqual(await snapshot(),before);assert.equal(await f.see(),null);}
 else{const result=await f.run(q);assert.equal(result.result.computed.right,'100.00');assert.equal(result.result.computed.retention,'100.00');const saved=await snapshot();assert.equal((await f.run(q)).replayed,true);assert.deepEqual(await snapshot(),saved);assert.equal((await f.see()).history.length,1);assert.deepEqual(saved.b05_payment_operations,before.b05_payment_operations);assert.deepEqual(saved.b05_obligation_history,before.b05_obligation_history);}
 assert.deepEqual(await record(q.evidenceId),evidence);
});
for(const [at,dates,right]of [
 ['2026-10-13T10:00:00Z',['2026-10-20','2026-10-22'],'200.00'],
 ['2026-10-18T10:00:00Z',['2026-10-20','2026-10-22'],'0.00'],
 ['2025-02-22T22:00:00Z',['2025-03-01','2025-03-03'],'200.00'],
 ['2027-03-26T22:00:00Z',['2027-03-29','2027-03-31'],'100.00'],
]as const)test(`S6 D civil act ${at} retains contractual reference`,async()=>{
 const f=await candidate(h,{amount:'200.00',dates:[...dates]}),basis=await f.command(),q=await f.command({at,facts:{...basis.facts!,at}});
 assert.equal(Date.parse((await record(q.evidenceId)).occurred_at),Date.parse(at));assert.equal(q.facts!.reference!.date,dates[0]);assert.equal((await f.run(q)).result.computed.right,right);
});
test('S6 E/F original expiry and G control at two real construction moments',async()=>{
 const moments=[];
 for(let i=0;i<2;i++){
  const old=await original(h),oldq=await old.command(),oldrow=await record(oldq.evidenceId);assert.ok(Date.parse(oldrow.occurred_at)>Date.parse(act));
  await assert.rejects(old.run(oldq),/CANCELLATION_EVIDENCE_REQUIRED:E3/);assert.equal(await old.see(),null);
  const explicit=await old.attest(oldq,'reviewed',act);assert.equal((await old.run(explicit)).result.computed.right,'50.01');
  const f=await candidate(h),q=await f.command(),row=await record(q.evidenceId);assert.equal(q.at,oldq.at);assert.equal(Date.parse(row.occurred_at),Date.parse(act));assert.equal((await f.run(q)).result.computed.right,'50.01');
  assert.ok(Date.parse(row.recorded_at)>=Date.parse(f.conf.at));moments.push({real:f.conf.at,original:oldrow.occurred_at,corrected:row.occurred_at,recorded:row.recorded_at});
 }
 assert.notEqual(moments[0]!.real,moments[1]!.real);console.log('S6 actual clocks '+JSON.stringify(moments));
});
test('S6 H/J/K wrong context, unreviewed evidence and contradictory clocks retain all negatives',async()=>{
 const f=await candidate(h),foreign=await candidate(h),q=await f.command(),alien=await foreign.command();
 await assert.rejects(f.attest(q,'estimated'),/B07_INPUT_INVALID/);
 const changed=await f.attest({...q,determinationId:uuid()});
 const bad=[{...q,evidenceId:alien.evidenceId},await f.attest(q,'candidate'),await f.attest({...q,facts:{...q.facts!,at:'2026-10-18T10:00:00Z'}}),{...q,evidenceId:changed.evidenceId}];
 const saved=await snapshot();
 for(const command of bad as (typeof q)[])await assert.rejects(f.run(command),/CANCELLATION_(EVIDENCE|MATERIAL)_REQUIRED:E3/);
 assert.deepEqual(await snapshot(),saved);assert.equal(await f.see(),null);
 await assert.rejects(h.cancellations.apply({} as any,write,q),/AUTH_REQUIRED/);await assert.rejects(h.cancellations.read({} as any,read,f.b.bookingId,f.did),/AUTH_REQUIRED/);assert.deepEqual(await snapshot(),saved);
});
test('S6 L/M idempotency conflict and successive decisions preserve exact prior history',async()=>{
 const f=await candidate(h,{amount:'200.00'}),q=await f.command();await f.run(q);const first=(await f.see()).history,one=await snapshot();
 await assert.rejects(f.run(await f.attest({...q,reason:'SYNTHETIC different material same operation'})),/CONFLICT/);assert.deepEqual(await snapshot(),one);
 const next=await f.command({expectedRevision:1,facts:{...q.facts!,cause:'provider'}});assert.equal((await f.run(next)).result.computed.right,'200.00');const history=(await f.see()).history;assert.equal(history.length,2);assert.deepEqual(history[0],first[0]);
 const two=await snapshot();assert.equal((await f.run(q)).replayed,true);assert.deepEqual(await snapshot(),two);assert.deepEqual((await f.see()).history,history);
});
test('S6 N auxiliary proof timing remains scoped and future auxiliary evidence is rejected',async()=>{
 const f=await candidate(h,{amount:'200.00',scopeKind:'service'}),b=await f.base('200.00'),template=await f.command();
 const q=await f.command({facts:{...template.facts!,cause:'provider',base:b}});assert.equal((await f.run(q)).result.computed.right,'200.00');
 const other=await f.conf.proof('confirmation:SYNTHETIC unaffected');assert.equal(Date.parse((await record(other)).occurred_at),Date.parse(f.conf.at));
 const approval=b.administratorDecision!,old=await record(approval.evidenceId),entry=h.req('evidence',old.material,f.b.bookingId,'other');await h.evidence.apply(await h.auth(),write,{...entry,occurredAt:'2026-10-17T10:00:00.001Z',coverage:f.b.bookingId});
 const bad=await f.command({expectedRevision:1,facts:{...q.facts!,base:{...b,administratorDecision:{...approval,evidenceId:entry.targetId}}}}),saved=await snapshot();await assert.rejects(f.run(bad),/CANCELLATION_ADMIN_BASE_REQUIRED:E3/);assert.deepEqual(await snapshot(),saved);assert.deepEqual(await record(approval.evidenceId),old);
});
