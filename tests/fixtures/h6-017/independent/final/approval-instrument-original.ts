import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedWork,read,write,workFixture,secondWorkActor} from '../support/h6-current-isolated.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {fingerprintHumanApprovalMaterial} from '../../src/infrastructure/postgres/h0-011-adapter.ts';
import {classifyServerEvent} from '../../src/application/verified-interaction.ts';
test('AUD11 original approval does not execute, grant identity or create external economic facts',async()=>{
 const h=await isolatedWork('audit_h6017_approval',59798);try{
  const counts=async()=>{const out:Record<string,number>={};for(const t of ['b03_acceptances','b04_confirmations','b05_payments','b05_provider_invoices'])out[t]=(await h.observer.unsafe(`select count(*)::int n from crm_private.${t}`))[0]!.n;return out;};
  const before=await counts(),f=await workFixture(h);await f.run(f.definition);assert.deepEqual(await counts(),before);assert.equal((await f.see())!.attempts.length,0);
  const approved=await f.see();for(const change of [{content:'SYNTHETIC changed after approval'},{recipient:{state:'value' as const,value:'SYNTHETIC another recipient'}},{amount:{state:'value' as const,value:'100.00'}}]){await assert.rejects(f.run({...f.definition,...f.base(),action:'revise',version:2,material:{...f.material,...change}}));assert.deepEqual(await f.see(),approved);}
  await assert.rejects(h.tte.decide({subject:'synthetic-ai'} as never,write,'decide-'+uid(),f.approval.proposalId,'d-'+uid(),'approved','SYNTHETIC AI self-approval',fingerprintHumanApprovalMaterial(f.material)));
  await assert.rejects(h.tte.decide(await h.auth(),classifyServerEvent('background-job'),'decide-'+uid(),f.approval.proposalId,'d-'+uid(),'approved','SYNTHETIC passive job',fingerprintHumanApprovalMaterial(f.material)));
  assert.equal((await f.run(f.definition)).replayed,true);const other=await secondWorkActor(h),auth=await other.auth();assert.ok(await f.worker.read(auth,read,f.executionId,f.context));await new H0005PostgresAdapter(h.runtime,h.f1,h.f2).revokeOne(auth);
  await assert.rejects(f.worker.read(auth,read,f.executionId,f.context));await assert.rejects(h.tte.decide(auth,write,'decide-'+uid(),f.approval.proposalId,'d-'+uid(),'approved','SYNTHETIC revoked decision',fingerprintHumanApprovalMaterial(f.material)));
  assert.deepEqual(await f.see(),approved);assert.deepEqual(await counts(),before);console.log('AUD11',JSON.stringify({humanApprovalPositive:true,noAttemptsOnApproval:true,noAcceptanceConfirmationPaymentInvoice:true,changedMaterialDenials:3,aiSelfApprovalDenied:true,jobDenied:true,exactReplay:true,revokedReadAndDecisionDenied:true}));
 }finally{await h.close();}
});
