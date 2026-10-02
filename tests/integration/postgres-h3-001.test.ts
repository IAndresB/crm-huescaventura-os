import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedObligation,write,read} from '../support/h3-obligation-isolated.ts';
import {obligationFixture} from '../support/h3-obligation-fixtures.ts';
test('H3-001 focal: PM-03 schedule persists with no reception and replay',async()=>{
 const h=await isolatedObligation('crm_h3_001',55670);
 try {const f=await obligationFixture(h);const result=await h.obligations.apply(await h.auth(),write,f.q);
 const record=await h.obligations.read(await h.auth(),read,f.b.bookingId,result.id);
 assert.deepEqual(record!.current.snapshot.parts.map(p=>p.amount),['500.01','500.00']);
 assert.equal((await h.obligations.apply(await h.auth(),write,f.q)).replayed,true);
 assert.deepEqual((await h.obligations.evaluate(await h.auth(),read,f.b.bookingId,result.id,'2026-10-13T21:59:59Z'))!.map(x=>x.state),['pending','pending']);
 } finally {await h.close();}
});
