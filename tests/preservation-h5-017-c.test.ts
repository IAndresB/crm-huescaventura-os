import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {assertHistoricalHash} from './support/h5-017-c-dependency-preservation.ts';
const baseline='fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879';
test('C15 successor guard accepts only the exact authorized composition transition',async()=>{
 const bytes=await readFile('src/server/composition.ts');assertHistoricalHash('src/server/composition.ts',bytes,baseline);
 assert.throws(()=>assertHistoricalHash('src/server/composition.ts',Buffer.concat([bytes,Buffer.from('unauthorized')]),baseline));
 assert.throws(()=>assertHistoricalHash('src/server/composition.ts',bytes,'0'.repeat(64)));
 assert.throws(()=>assertHistoricalHash('src/server/boundary.ts',bytes,baseline));
});
