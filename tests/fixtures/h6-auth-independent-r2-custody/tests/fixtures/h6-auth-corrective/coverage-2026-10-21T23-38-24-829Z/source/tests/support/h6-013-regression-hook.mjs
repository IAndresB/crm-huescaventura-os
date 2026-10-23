// Preserve the official historical hook, adding one explicit, source-pinned H6 fixture correction.
import './h5-017-g-hook.mjs';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url);
const expected=JSON.parse(readFileSync(new URL('tests/fixtures/h6-013/corrective-v1/expected-temporal.json',root),'utf8'));
const seal=JSON.parse(readFileSync(new URL('tests/fixtures/h6-013/corrective-v1/expected-temporal-seal.json',root),'utf8'));
for(const [p,h]of Object.entries(seal.files))assert.equal(createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex'),h);
for(const [p,h]of Object.entries(expected.sourceFiles))assert.equal(createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex'),h);
const parent=new URL('../integration/postgres-h4-006-scope-reproducer.test.ts',import.meta.url).href;
const replacement=new URL('./h6-013-availability-fixture.ts',import.meta.url).href;
registerHooks({resolve(specifier,context,nextResolve){
 if(context.parentURL===parent&&specifier==='../support/h4-availability-fixtures.ts')return nextResolve(replacement,context);
 return nextResolve(specifier,context);
}});
