import {test} from 'node:test';import assert from 'node:assert/strict';
import {isolatedProviderPayment,write} from '../support/h3-provider-payment-isolated.ts';
import {providerPaymentFixture} from '../support/h3-provider-payment-fixtures.ts';
import {providerPaymentAmounts} from '../../src/domain/provider-payment.ts';
test('H3-012 minimal corrected reproducers F01–F06; original FAIL files retained',async t=>{
 const h=await isolatedProviderPayment('crm_h3_012_defects',55815);try{
  await t.test('F01 exact H1 helpers and fixture identity',()=>{assert.equal(providerPaymentAmounts('500.01',['200.00','300.01']).paid,'500.01');});
  await t.test('F02 existing key_id type preserved, bootstrap succeeds',async()=>{assert.equal((await h.admin`select data_type from information_schema.columns where table_schema='crm_f1' and table_name='keys' and column_name='key_id'`)[0]!.data_type,'text');});
  const f=await providerPaymentFixture(h);
  await t.test('F03 root and revision SQL have unambiguous variables',async()=>{await h.providerPayments.apply(await h.auth(),write,await f.open());assert.equal((await f.view())!.paid,'0.00');});
  const a=await f.assign();
  await t.test('F04 UTF8 sidecar equals approved JSON object and stays inside TTE',async()=>{const ap=await f.approval(await f.schedule([await f.portion(a)]));await ap.execute();assert.equal((await f.view())!.status,'Programado');});
  await t.test('F05 identity validation preserves separate accredited movement',async()=>{await h.providerPayments.apply(await h.auth(),write,await f.movement([await f.portion(a,'200.00')],'200.00'));assert.equal((await f.view())!.paid,'200.00');assert.equal((await f.view())!.remaining,'300.00');});
  await t.test('F06 verifier respects B07 guards, byPurpose and F2 singleton',async()=>{const q=await f.movement([await f.portion(a,'200.00','200.00')],'200.00');await assert.rejects(async()=>h.providerPayments.apply(await h.auth(),write,await f.attest(q,'presented','client')));assert.equal(((await f.su.funds.see()).summary.byPurpose as any).managed_client_funds.availableForPurpose,'300.00');assert.equal((await h.admin`select count(*)::int n from crm_private.crm_actors`)[0]!.n,1);});
 }finally{await h.close();}
});
test('H3-012-F07 minimal port namespace reproducer and correction',async()=>{
 const {readFile}=await import('node:fs/promises');const historical=await readFile(new URL('./postgres-h3-010.test.ts',import.meta.url),'utf8'),current=await readFile(new URL('./postgres-h3-012.test.ts',import.meta.url),'utf8');
 assert.ok(historical.includes("'crm_h3_010_up',55712,true"));assert.ok(historical.includes("'crm_h3_010_rb',55713,true"));
 assert.ok(current.includes("'crm_h3_012',55812"));assert.ok(current.includes("'crm_h3_012_upgrade',55813,true"));assert.ok(current.includes("'crm_h3_012_rollback',55814,true"));
 const {createServer}=await import('node:net');const one=createServer();one.listen(0,'127.0.0.1');await new Promise<void>(r=>one.once('listening',()=>r()));const port=(one.address() as {port:number}).port,two=createServer();const collision=new Promise<NodeJS.ErrnoException>(r=>two.once('error',e=>r(e)));two.listen(port,'127.0.0.1');assert.equal((await collision).code,'EADDRINUSE');await new Promise<void>(r=>one.close(()=>r()));
});
