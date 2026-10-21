// Paired real-PG diagnosis for the expired historical fixture; no historical code is modified.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {isolatedAvailability} from '../support/h4-availability-isolated.ts';
import {availabilityFixture} from '../support/h4-availability-fixtures.ts';
const out=process.env.H6013_TEMPORAL_DIR;if(!out)throw new Error('H6013_TEMPORAL_NEW_OUTPUT_REQUIRED');await mkdir(out);
const path='tests/fixtures/h6-013/corrective-v1/';
const seal=JSON.parse(await readFile(path+'expected-temporal-seal.json','utf8'));
for(const[p,h]of Object.entries(seal.files))assert.equal(createHash('sha256').update(await readFile(p)).digest('hex'),h);
const expected=JSON.parse(await readFile(path+'expected-temporal.json','utf8'));
for(const [index,kind]of ['before','after'].entries())test('H6-013 F12 independent explicit action '+kind+' external fact',async()=>{
 const h=await isolatedAvailability('crm_h6013_time_'+kind,61470+index);
 try{
  const f=await availabilityFixture(h,undefined,0,{at:kind==='before'?expected.beforeAt:expected.afterAt});
  await f.apply(await f.receive({happenedAt:expected.factAt}));const before=await f.state();let error:string|null=null;
  if(kind==='before'){
   try{await f.apply(await f.verify());}catch(e){error=(e as Error).message;}
   assert.equal(error,expected.expectedBefore.split(' and ')[0]);assert.deepEqual(await f.state(),before);
  }else{
   await f.apply(await f.verify());const state=await f.state();assert.ok(state?.confirmed);assert.equal((await f.assess())?.usable,true);
  }
  await writeFile(out+'/'+kind+'.json',JSON.stringify({kind,at:f.at,factAt:expected.factAt,error,before,after:await f.state(),pass:true,authAndServerClockUnmodified:true},null,2)+'\n',{flag:'wx'});
 }finally{await h.close();}
});
