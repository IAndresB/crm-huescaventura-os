import {test} from 'node:test';import assert from 'node:assert/strict';import {randomUUID as uid} from 'node:crypto';import {execFileSync} from 'node:child_process';
import {isolatedInvoice,write} from '../support/h3-invoice-isolated.ts';import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
test('H3-008-F07 SM-PI03 compares stable issuer identity, retaining both applied revisions',async()=>{
 const h=await isolatedInvoice('crm_h3_008_id',55708);
 try{
  const ready=async()=>{const f=await invoiceFixture(h);await h.invoices.apply(await h.auth(),write,await f.need());const revision=await h.catalog.apply(await h.auth(),write,{action:'publish_version',operationId:uid(),targetId:f.provider.id,kind:'provider',expectedVersion:1,sourceRef:'SYNTHETIC provider master update',evidenceRef:'SYNTHETIC verified same identity',reason:'SYNTHETIC changed name, same provider',definition:{name:'SYNTHETIC same issuer new version'}});await h.invoices.apply(await h.auth(),write,await f.receive(await f.document({issuerRevisionId:revision.id})));return f;};
  const f=await ready();await h.invoices.apply(await h.auth(),write,await f.review());assert.equal((await f.state())!.status,'Revisada');
  const historic=execFileSync('git',['show','36c7bdc:supabase/migrations/20261004161012_h3_provider_invoice_documentary.sql'],{encoding:'utf8'}),a=historic.indexOf('create function crm_api.invoice_apply('),b=historic.indexOf('create function crm_api.invoice_read(',a),old=historic.slice(a,b).replace('create function','create or replace function');
  const current=(await h.observer`select pg_get_functiondef('crm_api.invoice_apply(bytea,bytea,bytea,bytea,bytea)'::regprocedure) f`)[0]!.f,g=await ready();
  await h.admin.unsafe(old);try{await h.invoices.apply(await h.auth(),write,await g.review());assert.equal((await g.state())!.status,'Incidencia');assert.deepEqual((await g.state())!.review!.differences,['provider']);}finally{await h.admin.unsafe(current);}
  await h.invoices.apply(await h.auth(),write,await g.review());assert.equal((await g.state())!.status,'Revisada');
 }finally{await h.close();}
});
