import {test} from 'node:test';import assert from 'node:assert/strict';
import {isolatedSuplido,write} from '../support/h3-suplido-isolated.ts';
import {suplidoFixture} from '../support/h3-suplido-fixtures.ts';
test('H3-009 real coordination keeps 300 assigned/200 pending and invoice independent',async()=>{
 const h=await isolatedSuplido('crm_h3_009',55709);try{
  const f=await suplidoFixture(h);await h.suplidos.apply(await h.auth(),write,await f.open());
  const q=await f.assign();await h.suplidos.apply(await h.auth(),write,await f.fundsCommand([q.allocationId!]));
  let s=(await f.see())!;assert.equal((s as unknown as {funding:{remaining:string}}).funding.remaining,'200.00');assert.equal(s.components.mandate,null);assert.equal(s.components.payment,null);
  await h.suplidos.apply(await h.auth(),write,await f.attachInvoice());await h.suplidos.apply(await h.auth(),write,await f.command('evaluate'));s=(await f.see())!;
  assert.equal(s.status,'Gestión abierta');assert.ok(s.pending.includes('payment'));assert.ok(!s.pending.includes('invoice'));assert.equal(s.components.payment,null);
 }finally{await h.close();}
});
