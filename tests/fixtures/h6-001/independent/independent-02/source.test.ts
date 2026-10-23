// Independent controls from /tmp/h6-001-independent-expected.md; no product edits.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid,createHash} from 'node:crypto';
import {writeFile,readFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fifthDatabase,read,write} from '../support/h5-018-fifth-isolated.ts';
import {providerPaymentFixture} from '../support/h3-provider-payment-fixtures.ts';
const out='/tmp/h6-001-audit/independent-02';
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
test('Independent IA10/13/14/21/23/24 T07 and explicit compatibility controls on chain68',async t=>{
 const h=await fifthDatabase('h6001_independent',62481);
 const snapshot=async()=>{const rows=await h.observer`select tablename from pg_tables where schemaname='crm_private' and tablename ~ '^(b0[2-9]_|b10_)' order by tablename`;const value:Record<string,unknown>={};for(const {tablename}of rows)value[tablename]=await h.observer.unsafe(`select to_jsonb(x) row from crm_private.${tablename} x order by to_jsonb(x)::text`);return value;};
 try{
  await t.test('A01 external payment partial reality cannot complete or replace invoice',async()=>{
   const f=await providerPaymentFixture(h,'700.00','500.00');await h.providerPayments.apply(await h.auth(),write,await f.open());const a=await f.assign();
   const q=await f.movement([await f.portion(a,'80.00')],'80.00');await h.providerPayments.apply(await h.auth(),write,q);
   const v=await f.view(),su=await f.su.see();assert.equal(v!.paid,'80.00');assert.equal(v!.remaining,'420.00');assert.equal(v!.complete,false);assert.equal(v!.movements.length,1);assert.equal(su!.components.invoice,null);assert.notEqual(su!.status,'Documentalmente resuelto');assert.equal((await f.su.funds.see()).summary.consumed,'80.00');
   await writeFile(out+'/a01-observed.json',JSON.stringify({payment:v,suplido:su},null,2)+'\n');
   const before=await snapshot();assert.equal((await h.providerPayments.apply(await h.auth(),write,q)).replayed,true);assert.deepEqual(await snapshot(),before);
   const bad=await f.attest({...q,reason:'SYNTHETIC changed material with old id'});const beforeBad=await snapshot();await assert.rejects(h.providerPayments.apply(await h.auth(),write,bad));assert.deepEqual(await snapshot(),beforeBad);
  });
  await t.test('A02 durable result still requires current actor authorization',async()=>{
   const f=await providerPaymentFixture(h);const q=await f.open();await h.providerPayments.apply(await h.auth(),write,q);const auth=await h.auth();
   await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;const before=await snapshot();
   try{await assert.rejects(h.providerPayments.apply(auth,write,q));await assert.rejects(h.providerPayments.read(auth,read,f.id,f.su.bookingId));assert.deepEqual(await snapshot(),before);}finally{await h.admin`update crm_private.crm_actors set enabled=true where actor_id=${h.actorId}::uuid`;}
   assert.equal((await h.providerPayments.apply(await h.auth(),write,q)).replayed,true);
  });
  await t.test('A03 deferred commit failure leaves no outgoing money history or result',async()=>{
   const f=await providerPaymentFixture(h);await h.providerPayments.apply(await h.auth(),write,await f.open());const a=await f.assign(),q=await f.movement([await f.portion(a,'50.00')],'50.00');
   await h.admin.unsafe("create sequence crm_private.h6001_audit_fault_count;create function crm_private.h6001_audit_fault() returns trigger language plpgsql security definer set search_path=pg_catalog,pg_temp as $$begin perform nextval('crm_private.h6001_audit_fault_count');raise exception 'SYNTHETIC_H6001_COMMIT_FAULT';end$$;create constraint trigger h6001_audit_fault after insert on crm_private.b05_provider_payment_operations deferrable initially deferred for each row execute function crm_private.h6001_audit_fault()");
   const before=await snapshot();try{await assert.rejects(h.providerPayments.apply(await h.auth(),write,q),/PROVIDER_PAYMENT_DENIED/);assert.equal(String((await h.admin`select last_value from crm_private.h6001_audit_fault_count`)[0].last_value),'1');assert.deepEqual(await snapshot(),before);}finally{await h.admin.unsafe('drop trigger h6001_audit_fault on crm_private.b05_provider_payment_operations;drop function crm_private.h6001_audit_fault()');}
   await h.providerPayments.apply(await h.auth(),write,q);assert.equal((await f.view())!.paid,'50.00');assert.equal((await f.view())!.movements.length,1);
  });
  await t.test('A04 payment without invoice stays documentary pending until explicit receipt review link',async()=>{
   const f=await providerPaymentFixture(h);await h.providerPayments.apply(await h.auth(),write,await f.open());const a=await f.assign();const scheduled=await f.schedule([await f.portion(a)]),approval=await f.approval(scheduled);await approval.execute();await h.providerPayments.apply(await h.auth(),write,await f.movement([await f.portion(a)],'500.00'));
   assert.equal((await f.view())!.paid,'500.00');assert.equal((await f.su.see())!.components.invoice,null);assert.notEqual((await f.su.see())!.status,'Documentalmente resuelto');
   await h.suplidos.apply(await h.auth(),write,await f.su.attachInvoice(2));const received=await f.su.see();assert.notEqual(received!.status,'Documentalmente resuelto');
   const invoice=f.su.invoice;await h.invoices.apply(await h.auth(),write,await invoice.attest({...await invoice.review(),bookingId:f.su.bookingId,expectedRevision:2}));
   await h.invoices.apply(await h.auth(),write,await invoice.attest({...await invoice.link(),bookingId:f.su.bookingId,expectedRevision:3,portions:[{serviceId:f.basis.serviceId,amount:'500.00',sourceRef:'SYNTHETIC one external service'}]}));
   await h.suplidos.apply(await h.auth(),write,await f.su.command('component',{component:'invoice',invoiceId:invoice.invoiceId}));await h.suplidos.apply(await h.auth(),write,await f.su.command('evaluate'));
   const final=await f.su.see();await writeFile(out+'/a04-diagnostic.json',JSON.stringify({received,final,payment:await f.view()},null,2)+'\n');assert.equal(final!.status,'Documentalmente resuelto');assert.equal((await f.view())!.paid,'500.00');assert.equal(final!.components.mandate,null);assert.equal(final!.evaluation!.bookingClosureInferred,false);
   await writeFile(out+'/a04-observed.json',JSON.stringify({received,final},null,2)+'\n');
  });
  await t.test('A05 missing/forged context and direct ordinary writes cannot mutate originals',async()=>{
   const f=await providerPaymentFixture(h),q=await f.open(),before=await snapshot();await assert.rejects(h.providerPayments.apply({} as never,write,q));await assert.rejects(h.providerPayments.apply({...await h.auth()},write,q));
   for(const role of ['crm_h0_runtime','authenticated','anon']){const sql=h.connect(role);await assert.rejects(sql.unsafe('select * from crm_private.b05_provider_outgoing_movements'));await assert.rejects(sql.unsafe('delete from crm_private.b05_provider_outgoing_movements'));}assert.deepEqual(await snapshot(),before);
  });
  await t.test('A06 advisors loopback pinned CLI explicit JSON output independent of agent env',async()=>{
   const binary='/Users/andres/.npm/_npx/c34c3565ecb5471d/node_modules/@supabase/cli-darwin-arm64/bin/supabase';
   const r=spawnSync(binary,['db','advisors','--db-url','postgresql://crm_h0_migration@127.0.0.1:62481/h6001_independent?sslmode=disable','--type','all','--fail-on','error','--output-format','json'],{encoding:'utf8',timeout:45000});
   await writeFile(out+'/advisors.json',JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr,binarySHA:sha(await readFile(binary))},null,2)+'\n');assert.equal(r.status,0);const result=JSON.parse(r.stdout);assert.deepEqual(result.results,[]);
  });
 }finally{await h.close();}
});
