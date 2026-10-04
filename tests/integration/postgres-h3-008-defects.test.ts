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
test('H3-008-F05 documentary need can have unknown comparison amount; review stays fail closed',async()=>{
 const historic=execFileSync('git',['show','404fb77:supabase/migrations/20261004161012_h3_provider_invoice_documentary.sql'],{encoding:'utf8'});
 const a=historic.indexOf('create function crm_api.invoice_apply('),b=historic.indexOf('create function crm_api.invoice_read(',a),old=historic.slice(a,b).replace('create function','create or replace function');
 const current=(await h.observer`select pg_get_functiondef('crm_api.invoice_apply(bytea,bytea,bytea,bytea,bytea)'::regprocedure) f`)[0]!.f;
 const f=await invoiceFixture(h),q=await f.attest({...await f.need(),basis:{...f.basis,amount:null}});
 await h.admin.unsafe(old);try{if(process.env.H3008_REPRO_ORIGINAL==='F05')await h.invoices.apply(await h.auth(),write,q);else await assert.rejects(h.invoices.apply(await h.auth(),write,q),/INVOICE_BASIS_REQUIRED/);}finally{await h.admin.unsafe(current);}
 await h.invoices.apply(await h.auth(),write,q);assert.equal((await f.state())!.status,'Pendiente');assert.equal((await f.state())!.basis.amount,null);
 await h.invoices.apply(await h.auth(),write,await f.receive());await assert.rejects(h.invoices.apply(await h.auth(),write,await f.review()),/INVOICE_REVIEW_REQUIRED/);
 await h.invoices.apply(await h.auth(),write,await f.attest({...await f.review(),comparisonBasis:f.basis}));await h.invoices.apply(await h.auth(),write,await f.link());assert.equal((await f.state())!.status,'Vinculada');assert.equal((await f.state())!.basis.amount,null);
});
test('H3-008-F06 historical verifier inventory is frozen at H3-006, not global live migrations',async()=>{const {readdir,readFile}=await import('node:fs/promises');const {allocationMigration}=await import('../support/h3-allocation-isolated.ts');const {invoiceMigration}=await import('../support/h3-invoice-isolated.ts');const files=(await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')&&x<=invoiceMigration);assert.equal(files.length,34);assert.throws(()=>assert.equal(files.length,33),/34 !== 33/);assert.equal(files.filter(x=>x<=allocationMigration).length,33);for(const file of ['tests/integration/postgres-h3-006.test.ts','tests/integration/postgres-h3-006-defects.test.ts'])assert.ok((await readFile(file,'utf8')).includes('<=allocationMigration'));});
test('H3-008-F08 isolated Unix socket fixture name fits native 103-byte limit',()=>{const prefix='/var/folders/yl/gkcr80ts3q78l9tnv5943flc0000gn/T/crm-',suffix='-pRUAe5/socket/.s.PGSQL.55708';assert.ok(Buffer.byteLength(prefix+'crm_h3_008_provider_identity'+suffix)>103);assert.ok(Buffer.byteLength(prefix+'crm_h3_008_id'+suffix)<=103);});
