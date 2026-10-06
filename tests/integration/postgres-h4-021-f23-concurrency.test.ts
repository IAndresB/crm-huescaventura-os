import {test}from'node:test';import assert from'node:assert/strict';import {randomUUID as uid}from'node:crypto';
import {isolatedPreparation,write}from'../support/h4-booking-preparation-isolated.ts';
import {preparationFixture}from'../support/h4-booking-preparation-fixtures.ts';
import {cancelFixture}from'../support/h4-booking-preparation-f23-fixtures.ts';
import {observePreparation}from'../support/h4-booking-preparation-observation.ts';
import {H0005PostgresAdapter}from'../../src/infrastructure/postgres/h0-005-adapter.ts';
import {H4011ModificationAdapter}from'../../src/infrastructure/postgres/h4-modification-adapter.ts';
import {verifyAuth}from'../../src/application/verified-auth.ts';
test('F23 C09–C12 legitimate whole cancellation versus preparation on real root both compatible F2 sessions',async t=>{const h=await isolatedPreparation('crm_f23_races',58301);try{
 const login=h.connect('crm_h0_runtime'),access=new H0005PostgresAdapter(login,h.f1,h.f2),subject=h.subject;
 const sessionId=(await access.establish(await verifyAuth({verify:async()=>({subject,passwordVerified:true,mfaVerified:true})},uid()))).sessionId;
 const other=()=>verifyAuth({verify:async()=>({subject,sessionId,passwordVerified:true,mfaVerified:true})},uid()),second=h.connect('crm_h0_runtime'),mod=new H4011ModificationAdapter(second,h.f1,h.f2);
 for(const order of [[0,1],[1,0]])for(const kind of ['evaluate','start','HA','replay']as const)await t.test(kind+' cancellation order '+order,async()=>{
  const f=await preparationFixture(h);await f.confirm();await f.pay();
  const replayCommand=kind==='replay'?await f.command():null,original=replayCommand?await f.run(replayCommand):null,c=await cancelFixture(h,f);
  // Modification request/evaluation/approval themselves change material; build new commands afterwards.
  const q=replayCommand??await f.command(kind==='start'?'start':'evaluate',kind==='HA'?{origin:'ai'}:{}),approval=kind==='HA'?await f.approval(q):null,cancel=await c.command();
  const r=await observePreparation(h,f.bid,[()=>approval?approval.execute():f.run(q),async()=>mod.apply(await other(),write,cancel)],order,[h.sessionId,sessionId]);
  console.log('F23 RACE RESULTS',JSON.stringify({kind,order,results:r}));assert.equal(r[order.indexOf(1)]!.ok,true,'legitimate cancellation completes');await c.applied();
  const preparation=r[order.indexOf(0)]!;assert.equal(preparation.ok,kind==='replay'||order[0]===0);const view=(await f.see())!;assert.equal(view.phase,'Cancelada');assert.equal(view.applicable,false);
  assert.equal(view.history.length,kind==='replay'||order[0]===0?1:0);if(original){assert.ok(preparation.ok);assert.deepEqual((preparation.value as typeof original).result,original.result);assert.equal((preparation.value as typeof original).replayed,true);}
  if(approval)assert.equal((await h.observer`select count(*)n from crm_ha.reservations where reservation_id=${approval.reserve}`)[0]!.n,order[0]===0?'1':'0');
 });
 await second.end();await login.end();
}finally{await h.close();}});
