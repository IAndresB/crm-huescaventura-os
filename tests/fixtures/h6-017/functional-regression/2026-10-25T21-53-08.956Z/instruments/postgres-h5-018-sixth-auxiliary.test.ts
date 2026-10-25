import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fifthDatabase,write} from '../support/h5-018-fifth-isolated.ts';
import {cancellationFixture} from '../support/h5-017-g-cancellation-fixtures.ts';
test('S6 auxiliary default is fixed-act scoped; earlier explicit act still needs coherent auxiliary evidence',async()=>{
 const h=await fifthDatabase('sixth_auxiliary',60454);
 try{
  const f=await cancellationFixture(h,{amount:'200.00',scopeKind:'service'}),base=await f.base('200.00');assert.ok('administratorDecision' in base);const template=await f.command(),at='2026-10-13T10:00:00Z',q=await f.command({at,facts:{...template.facts!,at,cause:'provider',base}});
  const evidence=(await h.observer`select to_jsonb(r) data from crm_private.b07_records r where record_id=${base.administratorDecision.evidenceId}::uuid`)[0]!.data;
  assert.equal(Date.parse(evidence.occurred_at),Date.parse('2026-10-17T10:00:00Z'));
  for(let n=0;n<2;n++)await assert.rejects(f.run(q),/CANCELLATION_ADMIN_BASE_REQUIRED:E3/);assert.equal(await f.see(),null);
  const req=h.req('evidence',evidence.material,f.b.bookingId,'other');await h.evidence.apply(await h.auth(),write,{...req,occurredAt:at,coverage:f.b.bookingId});
  const coherent=await f.attest({...q,facts:{...q.facts!,base:{...base,administratorDecision:{...base.administratorDecision,evidenceId:req.targetId}}}});
  assert.equal((await f.run(coherent)).result.computed.right,'200.00');assert.equal((await f.run(coherent)).replayed,true);assert.equal((await f.see()).history.length,1);
  assert.deepEqual((await h.observer`select to_jsonb(r) data from crm_private.b07_records r where record_id=${base.administratorDecision.evidenceId}::uuid`)[0]!.data,evidence);
  console.log('S6 auxiliary scope '+JSON.stringify({defaultEvidence:'2026-10-17T10:00:00Z',earlierAct:at,defaultCorrectlyDenied:2,explicitCoherentEvidenceAccepted:true,productModified:false}));
 }finally{await h.close();}
});
