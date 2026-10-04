import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {isolatedOwnEconomics,write} from '../support/h3-own-economics-isolated.ts';import {ownEconomicsFixture,promotion} from '../support/h3-own-economics-fixtures.ts';
test('H3-013 own economy persisted with exact Fee/cost and A150/B120 promotion',async()=>{
 const h=await isolatedOwnEconomics('crm_h3_013',55931);try{
 const f=await ownEconomicsFixture(h),q=await f.command();Object.assign(q.input,{promotion:{...promotion(f.b.f.mid),revisionId:f.promo.revision}});const c=await f.attest(q);
 const r=await h.ownEconomics.apply(await h.auth(),write,c);assert.equal(r.result.computed.promotion!.amount,'150.00');assert.equal(r.result.computed.totals.real.profit,'80.00');assert.equal(r.result.computed.promotion!.realAttendees,15);assert.equal(r.result.computed.promotion!.payers,14);
 assert.equal((await f.see())!.history.length,1);assert.equal((await h.ownEconomics.apply(await h.auth(),write,c)).replayed,true);assert.equal((await f.see())!.history.length,1);
 }catch(e){console.error((await readFile(h.temporary+'/postgres.log','utf8')).split('\n').filter(l=>/ERROR:|CONTEXT:/.test(l)).join('\n'));throw e;}finally{await h.close();}
});
