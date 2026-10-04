import {test} from 'node:test';import assert from 'node:assert/strict';
import {isolatedIncident,write,read} from '../support/h4-incident-isolated.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
test('H4-003 focal: INC and explicit critical cycle, independent localized guard',async()=>{
 const h=await isolatedIncident('crm_h4003_focal',56201);try{
  const f=await incidentFixture(h);const apply=async(q:Parameters<typeof h.incidents.apply>[2])=>h.incidents.apply(await h.auth(),write,q);
  await apply(await f.detect());assert.equal((await f.state())!.status,'Abierta');
  await apply(await f.manage());assert.equal((await f.state())!.status,'En gestión');
  assert.equal((await h.incidents.evaluate(await h.auth(),read,f.bookingId,f.impact.scope,'complete-close'))!.incidentGuardAllowed,false);
  await apply(await f.resolve());await apply(await f.close());const code=(await f.state())!.code;
  await apply(await f.reopen());assert.equal((await f.state())!.code,code);assert.equal((await f.state())!.status,'Abierta');assert.ok((await f.state())!.closure);
 }finally{await h.close();}
});
