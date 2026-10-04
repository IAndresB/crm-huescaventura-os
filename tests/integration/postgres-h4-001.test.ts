import {test} from 'node:test';import assert from 'node:assert/strict';
import {isolatedRequirement,write} from '../support/h4-requirement-isolated.ts';
import {requirementFixture} from '../support/h4-requirement-fixtures.ts';
test('H4-001 focal need/receipt/explicit review/versioned reopening, B07 original preserved',async()=>{
 const h=await isolatedRequirement('crm_h4001',56001);try{
 const f=await requirementFixture(h);await h.requirements.apply(await h.auth(),write,await f.need());assert.equal((await f.see())!.document,null);
 await h.requirements.apply(await h.auth(),write,await f.receive());assert.equal((await f.see())!.status,'Recibido');assert.equal((await f.see())!.review,null);
 await h.requirements.apply(await h.auth(),write,await f.review());assert.equal((await f.see())!.status,'Revisado');
 await h.requirements.apply(await h.auth(),write,await f.command('change',{basis:{...f.basis,rule:{...f.basis.rule,version:'V2',requiredFields:['permission-scope']}}}));
 assert.equal((await f.see())!.status,'Pendiente');assert.equal((await f.see())!.history[2]!.after && ((await f.see())!.history[2]!.after as {status:string}).status,'Revisado');
 }finally{await h.close();}
});
