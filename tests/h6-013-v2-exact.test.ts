import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {canonicalPgJson} from './support/h6-013-preservation.ts';
const hash=(s:string)=>createHash('sha256').update(canonicalPgJson(s)).digest('hex');

test('H6 V2 exact token boundaries and scale, without Number rounding',()=>{
 for(const a of [9007199254740991n,9007199254740992n,-9007199254740993n,9223372036854775806n,-9223372036854775808n]){
  assert.notEqual(hash(a.toString()),hash((a+1n).toString()));
 }
 assert.equal(hash('1e10000'),hash('10e9999'));
 assert.equal(hash('-123.45000'),hash('-12345e-2'));
 assert.equal(hash('-0e-10000'),hash('0.00'));
 assert.notEqual(hash('1e-10000'),hash('2e-10000'));
});
test('H6 V2 nested canonical representation cannot collide with user data',()=>{
 assert.notEqual(hash('1'),hash('"1e0"'));
 assert.notEqual(hash('1'),hash('["number","1e0"]'));
 assert.notEqual(hash('1'),hash('{"value":"1e0"}'));
 assert.equal(hash('{"__proto__":1.00,"a":[true,null]}'),hash('{"a":[true,null],"__proto__":1}'));
 assert.notEqual(hash('[1,2]'),hash('[2,1]'));
 assert.notEqual(hash('[1,1]'),hash('[1]'));
 assert.notEqual(hash('{"a":null}'),hash('{}'));
});
