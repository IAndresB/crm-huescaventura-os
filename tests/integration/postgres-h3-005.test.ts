import {test} from 'node:test';import assert from 'node:assert/strict';
import {isolatedAllocation,write} from '../support/h3-allocation-isolated.ts';
import {allocationFixture} from '../support/h3-allocation-fixtures.ts';
test('H3-005 focal verified funds allocate and consume without overuse',async()=>{
 const h=await isolatedAllocation('crm_h3_005',55686);
 try{const f=await allocationFixture(h,'100.00','100.00'),q=await f.assign('80.00');await h.allocations.apply(await h.auth(),write,q);
 await h.allocations.apply(await h.auth(),write,await f.consume(q));const r=await f.see();assert.equal(r.summary.received,'100.00');assert.equal(r.summary.assigned,'80.00');assert.equal(r.summary.consumed,'80.00');assert.equal(r.summary.available,'20.00');
 await assert.rejects(h.allocations.apply(await h.auth(),write,await f.assign('80.00')));assert.equal((await f.see()).history.length,2);
 }finally{await h.close();}
});
