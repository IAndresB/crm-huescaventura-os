import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedPayment,write,read} from '../support/h3-payment-isolated.ts';
import {paymentFixture} from '../support/h3-payment-fixtures.ts';
test('H3-003 focal: detection receipt correspondence 500/200/300 are separate',async()=>{
 const h=await isolatedPayment('crm_h3_003',55680);
 try {const f=await paymentFixture(h);const apply=async(q:Parameters<typeof h.payments.apply>[2])=>h.payments.apply(await h.auth(),write,q);
 await apply(f.detect);assert.equal((await h.payments.read(await h.auth(),read,f.paymentId))!.summary.grossReceived,null);
 await apply(await f.receive());const p=await f.propose();await apply(p);await apply(await f.verify(p));
 const r=(await h.payments.read(await h.auth(),read,f.paymentId))!;
 assert.equal(r.summary.grossReceived,'500.00');assert.equal(r.summary.verifiedCorrespondence,'200.00');assert.equal(r.summary.unreconciled,'300.00');
 assert.equal(r.acts.length,2);assert.equal(r.receipts.length,1);
 }finally{await h.close();}
});
