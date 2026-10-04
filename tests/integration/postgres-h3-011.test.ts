import {readFile} from 'node:fs/promises';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {isolatedProviderPayment,write} from '../support/h3-provider-payment-isolated.ts';
import {providerPaymentFixture} from '../support/h3-provider-payment-fixtures.ts';
test('H3-011 TTE programming, verified partial200/500 and final Suplido integration',async()=>{
 const h=await isolatedProviderPayment('crm_h3_011',55711);try{
  const f=await providerPaymentFixture(h);await h.providerPayments.apply(await h.auth(),write,await f.open());
  const a=await f.assign();const approval=await f.approval(await f.schedule([await f.portion(a)]));await approval.execute();
  assert.equal((await f.view())!.status,'Programado');assert.equal((await f.view())!.paid,'0.00');
  await h.providerPayments.apply(await h.auth(),write,await f.movement([await f.portion(a,'200.00')],'200.00'));
  assert.equal((await f.view())!.paid,'200.00');assert.equal((await f.view())!.remaining,'300.00');assert.equal((await f.view())!.complete,false);
  await h.suplidos.apply(await h.auth(),write,await f.su.attachInvoice());
  await h.providerPayments.apply(await h.auth(),write,await f.movement([await f.portion(a,'300.00','200.00')],'300.00'));
  assert.equal((await f.view())!.paid,'500.00');assert.equal((await f.su.see())!.status,'Documentalmente resuelto');
  assert.equal((await f.su.funds.see()).summary.consumed,'500.00');
 }catch(e){console.error((await readFile(h.temporary+'/postgres.log','utf8')).split('\n').filter(l=>/ERROR:|CONTEXT:/.test(l)).join('\n'));throw e;}finally{await h.close();}
});
