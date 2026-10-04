import {test} from 'node:test';import assert from 'node:assert/strict';
import {isolatedInvoice,write} from '../support/h3-invoice-isolated.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
test('H3-007 focal external invoice need/receive/review/link and linked correction',async()=>{
 const h=await isolatedInvoice('crm_h3_007',55701);
 try{const f=await invoiceFixture(h);await h.invoices.apply(await h.auth(),write,await f.need());assert.equal((await f.state())?.document,null);
 const d=await f.document();await h.invoices.apply(await h.auth(),write,await f.receive(d));assert.equal((await f.state())?.status,'Recibida');
 await h.invoices.apply(await h.auth(),write,await f.review());assert.equal((await f.state())?.status,'Revisada');
 await h.invoices.apply(await h.auth(),write,await f.link());assert.equal((await f.state())?.status,'Vinculada');
 const correction=await f.document({},d.documentId);await h.invoices.apply(await h.auth(),write,await f.correct(correction));assert.equal((await f.state())?.status,'Incidencia');
 await h.invoices.apply(await h.auth(),write,await f.review());await h.invoices.apply(await h.auth(),write,await f.link());assert.equal((await f.state())?.history.length,7);
 }finally{await h.close();}
});
