import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedCancellation} from '../support/h4-cancellation-isolated.ts';
import {cancellationFixture} from '../support/h4-cancellation-fixtures.ts';
import {fifthDatabase} from '../support/h5-018-fifth-isolated.ts';

// Independent diagnosis only: original fixture, original assertions/clock/product unchanged.
// payment_evidence requires evidence.occurred_at <= command.at (migration H3-010).
for (const version of ['historical', '68'] as const) {
  test(`V09 ${version} original cancellation fixture clock expiry repeated; explicit chronology control and future denial`,async()=>{
    const h=version==='historical'
      ?await isolatedCancellation('crm_h5018_v9_old',56951)
      :await fifthDatabase('crm_h5018_v9_f',56952);
    try {
      const f=await cancellationFixture(h,{count:3});
      const q=await f.command();
      const rows=await h.observer`select occurred_at,material from crm_private.b07_records where record_id=${q.evidenceId}::uuid`;
      assert.equal(rows.length,1);
      const evidenceAt=new Date(rows[0]!.occurred_at).toISOString();
      assert.equal(q.at,'2026-10-17T10:00:00Z');
      assert.ok(Date.parse(evidenceAt)>Date.parse(q.at),'original fixture expires after its fixed act time');
      for(let repeat=0;repeat<2;repeat++)await assert.rejects(f.run(q),/CANCELLATION_EVIDENCE_REQUIRED:E3/);
      const futureAt=new Date(Date.parse(q.at)+1).toISOString();
      const future=await f.attest(q,'reviewed',futureAt);
      await assert.rejects(f.run(future),/CANCELLATION_EVIDENCE_REQUIRED:E3/);
      assert.equal((await h.observer`select count(*)::int n from crm_private.b06_cancellation_revisions`)[0]!.n,0);
      const control=await f.attest(q,'reviewed',q.at);
      const result=await f.run(control);
      assert.equal(result.result.computed.right,'150.03');
      assert.equal(result.result.computed.retention,'150.00');
      assert.equal(result.result.computed.baseTotal,'300.03');
      assert.equal((await f.run(control)).replayed,true);
      assert.equal((await h.observer`select count(*)::int n from crm_private.b06_cancellation_revisions`)[0]!.n,1);
      console.log('V09 chronology '+JSON.stringify({version,commandAt:q.at,originalEvidenceAt:evidenceAt,originalDenied:2,futureAt,futureDenied:true,explicitControlAt:q.at,right:result.result.computed.right,replayed:true,rows:1}));
    }finally{await h.close();}
  });
}
