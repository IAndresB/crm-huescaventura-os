// Additive coverage for independent finding IA04-07. Original focal31 stays frozen.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {createServer} from 'node:net';
import {once} from 'node:events';
import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fifthDatabase,read,write} from '../support/h5-018-fifth-isolated.ts';
import {providerPaymentFixture} from '../support/h3-provider-payment-fixtures.ts';
import {cancellationFixture} from '../support/h5-017-g-cancellation-fixtures.ts';
test('H6-004 S02 AC032 chronological actual provider payment200 on same Booking and service never reduces cancellation right200',async()=>{
 const server=createServer();server.listen(0,'127.0.0.1');await once(server,'listening');const port=(server.address() as {port:number}).port;await new Promise<void>(r=>server.close(()=>r()));
 const h=await fifthDatabase('h6004ac032_'+uid().replaceAll('-','').slice(0,8),port);
 try{
  const pp=await providerPaymentFixture(h,'700.00','200.00');const run=async(q:Parameters<typeof h.providerPayments.apply>[2])=>h.providerPayments.apply(await h.auth(),write,q);
  await run(await pp.open());const allocation=await pp.assign('200.00');const planned=await pp.schedule([await pp.portion(allocation)],'200.00');await (await pp.approval(planned)).execute();assert.equal((await pp.view())!.paid,'0.00');
  const movement=await pp.movement([await pp.portion(allocation)],'200.00');await run(movement);assert.equal((await pp.view())!.paid,'200.00');assert.equal((await run(movement)).replayed,true);
  const paid=await pp.view(),funds=await pp.su.funds.see();assert.equal(paid!.movements.length,1);
  const c=await cancellationFixture(h,{existing:pp.su.funds.f,scopeKind:'service'});assert.equal(c.b.bookingId,pp.su.bookingId);assert.equal(c.scope.id,pp.basis.serviceId);
  const restBefore=(await h.booking.read(await h.auth(),read,c.b.bookingId) as any).booking.detail.services.slice(1);
  await c.applyOperational();const at=new Date().toISOString(),q=await c.command();await c.run(await c.command({at,facts:{...q.facts!,at,cause:'provider',base:await c.base('200.00')}}));const right=await c.see();
  assert.ok(Date.parse(String((paid!.movements[0]!.material as {occurredAt:string}).occurredAt))<=Date.parse(right.facts.at));
  assert.equal(right.computed.right,'200.00');assert.equal(right.computed.retention,'0.00');assert.equal(right.computed.baseTotal,'200.00');assert.deepEqual(await pp.view(),paid);assert.deepEqual(await pp.su.funds.see(),funds);
  assert.deepEqual((await h.booking.read(await h.auth(),read,c.b.bookingId) as any).booking.detail.services.slice(1),restBefore);
  assert.equal((await h.observer`select count(*)::int n from crm_private.b05_refunds where booking_id=${c.b.bookingId}::uuid`)[0]!.n,0);
  if(process.env.H6004_OUTPUT)await writeFile(join(process.env.H6004_OUTPUT,'ac032-temporal-readback.json'),JSON.stringify({bookingId:c.b.bookingId,serviceId:c.scope.id,paymentBeforeCancellation:paid,fundsBeforeCancellation:funds,determination:right,paymentAfterCancellation:await pp.view(),fundsAfterCancellation:await pp.su.funds.see(),refundCount:0},null,2)+'\n');
 }finally{await h.close();}
});
