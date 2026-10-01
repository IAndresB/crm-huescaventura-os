import {test} from 'node:test';
import assert from 'node:assert/strict';
import {acceptanceFixture} from '../support/h2-acceptance-fixtures.ts';
import {write,isolatedAcceptance} from '../support/h2-acceptance-isolated.ts';
test('H2-007 focal migration and runtime private integrity',async()=>{
 const h=await isolatedAcceptance('crm_h2_007',55479);try{
 const f=await acceptanceFixture(h),r=await f.register(f.mid);
 const v=await f.verification(r);const result=await h.acceptance.apply(await h.auth(),write,v);
 assert.equal(result.result.verified,true);assert.equal(result.result.won,true);
 assert.equal((await h.observer`select state from crm_private.b03_opportunities where opportunity_id=${f.opp.targetId}::uuid`)[0]!.state,'Aceptada / Ganada');
 assert.equal((await h.acceptance.apply(await h.auth(),write,v)).replayed,true);
 await assert.rejects(h.runtime`insert into crm_private.b03_acceptances(acceptance_id) values(gen_random_uuid())`);
 assert.equal((await h.observer`select relforcerowsecurity r from pg_class where oid='crm_private.b03_acceptances'::regclass`)[0]!.r,true);
 }finally{await h.close();}
});
