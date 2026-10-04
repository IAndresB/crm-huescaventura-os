// Preserved reproducers: historical FAIL and live normative correction are separate.
import {test,before,after} from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {isolatedInvoice,write} from '../support/h3-invoice-isolated.ts';import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import type {InvoiceCommand} from '../../src/infrastructure/postgres/h3-invoice-adapter.ts';
let h:Awaited<ReturnType<typeof isolatedInvoice>>;
before(async()=>{h=await isolatedInvoice('crm_h3_008_repro',55705);});after(async()=>{await h?.close();});
test('H3-008-F01 fixture bootstrap authority differs from migration/runtime authority',async()=>{await assert.rejects(h.migration.unsafe('alter table crm_private.b04_services disable trigger all'),/system trigger/);const f=await invoiceFixture(h,'internal');await assert.rejects(h.invoices.apply(await h.auth(),write,await f.need()),/INVOICE_BASIS_REQUIRED/);assert.equal(await f.state(),null);});
test('H3-008-F02 attest helper must not reinsert intentionally absent evidence',async()=>{const f=await invoiceFixture(h),q=await f.need();const regenerated=await f.attest({...q,evidenceId:null} as unknown as InvoiceCommand);assert.ok(regenerated.evidenceId);await assert.rejects(h.invoices.apply(await h.auth(),write,{...q,evidenceId:null} as unknown as InvoiceCommand));assert.equal(await f.state(),null);});
test('H3-008-F03 independent visibility probe avoids F2 actor-lock harness deadlock',async()=>{const f=await invoiceFixture(h);await h.invoices.apply(await h.auth(),write,await f.need());const locker=h.connect('crm_h0_migration');await locker.begin(async t=>{await t`select pg_advisory_xact_lock(hashtextextended(${'invoice-root:'+f.invoiceId},0))`;const visible=await h.observer`select after_data from crm_private.b05_invoice_revisions where invoice_id=${f.invoiceId}::uuid`;assert.equal(visible[0]!.after_data.status,'Pendiente');});});
test('H3-008-F04 identified signed/zero document is retained; positive receipt validator is historical defect',async()=>{
 const historic=execFileSync('git',['show','775fc5a:supabase/migrations/20261004161012_h3_provider_invoice_documentary.sql'],{encoding:'utf8'});
 const a=historic.indexOf('create function crm_private.invoice_original('),b=historic.indexOf('create function crm_api.invoice_apply(',a);
 const old=historic.slice(a,b).replace('create function','create or replace function');
 const current=(await h.observer`select pg_get_functiondef('crm_private.invoice_original(jsonb,uuid,text,uuid)'::regprocedure) f`)[0]!.f;
 for(const amount of ['-20.00','0.00']){
  const f=await invoiceFixture(h);await h.invoices.apply(await h.auth(),write,await f.need());const q=await f.receive(await f.document({amount}));
  await h.admin.unsafe(old);
  try{
   if(process.env.H3008_REPRO_ORIGINAL==='F04')await h.invoices.apply(await h.auth(),write,q);
   else await assert.rejects(h.invoices.apply(await h.auth(),write,q),/INVOICE_DOCUMENT_REQUIRED/);
  }finally{await h.admin.unsafe(current);}
  await h.invoices.apply(await h.auth(),write,q);assert.equal((await f.state())!.status,'Recibida');assert.equal((await f.state())!.document!.amount,amount);
  await h.invoices.apply(await h.auth(),write,await f.review());assert.equal((await f.state())!.status,'Incidencia');assert.equal((await f.state())!.basis.amount,'100.01');
 }
});
