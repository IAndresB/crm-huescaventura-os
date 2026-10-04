import {test} from 'node:test';import assert from 'node:assert/strict';
import {isolatedIncident,write} from '../support/h4-incident-isolated.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {providerPaymentFixture} from '../support/h3-provider-payment-fixtures.ts';
test('H4-004 real economic effect links survive resolution without execution',async()=>{
 const h=await isolatedIncident('crm_h4004_links',56207);try{const p=await providerPaymentFixture(h);await h.providerPayments.apply(await h.auth(),write,await p.open());const f=await incidentFixture(h,p.su.invoice);await h.incidents.apply(await h.auth(),write,await f.detect({data:{...f.data,effectLinks:[{kind:'provider-payment',id:p.id},{kind:'invoice',id:p.su.invoice.invoiceId}],context:{providerId:p.providerId,clientId:p.su.invoice.basis.recipientId}}}));const original=await p.view();await h.incidents.apply(await h.auth(),write,await f.resolve());assert.deepEqual(await p.view(),original);assert.equal((await f.state())!.effectLinks.length,2);}finally{await h.close();}
});
