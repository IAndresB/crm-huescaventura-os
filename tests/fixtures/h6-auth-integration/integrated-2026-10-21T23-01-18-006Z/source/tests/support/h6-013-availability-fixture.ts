// H6-only environment correction. Supported domain timestamp; authentication/server clocks remain real.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {availabilityFixture as original} from './h4-availability-fixtures.ts';
const path='tests/fixtures/h6-013/corrective-v1/';
const seal=JSON.parse(await readFile(path+'expected-temporal-seal.json','utf8'));
for(const[p,h]of Object.entries(seal.files))assert.equal(createHash('sha256').update(await readFile(p)).digest('hex'),h);
const expected=JSON.parse(await readFile(path+'expected-temporal.json','utf8'));
export async function availabilityFixture(...args:Parameters<typeof original>){
 if(args[0].scope!==expected.historicalFixtureScope)return original(...args);
 assert.equal(args[3]?.at,undefined,'F12 source precondition changed; do not override an explicit historical domain timestamp');
 const result=await original(args[0],args[1],args[2],{at:expected.beforeAt});
 console.log('H6013 F12 explicit domain timestamp',JSON.stringify({scope:args[0].scope,at:result.at,factAt:expected.factAt,serverClockUnmodified:true}));
 return result;
}
