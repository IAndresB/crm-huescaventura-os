import assert from 'node:assert/strict';
import {readFileSync,lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const hash=b=>createHash('sha256').update(b).digest('hex');
const raw=readFileSync('tests/fixtures/h5-009/f09/c12-20261013/trust.json');
assert.match(process.env.C12_TRUST_SHA256??'',/^[a-f0-9]{64}$/);
assert.equal(hash(raw),process.env.C12_TRUST_SHA256,'externally supplied trust seal');
const t=JSON.parse(raw);
assert.equal(t.baseCommit,'eda8b0becb3daa2dff1baa02be53cec914750f13');
assert.equal(t.scope,'H5-009/010 local/isolated');
assert.equal(t.authorization,'Human-authorized C12 fixture and two guard corrections');
assert.deepEqual(t.entries.map(e=>e.path).sort(),['scripts/verify-h5-008-evidence.mjs','tests/support/h4-cancellation-fixtures.ts','tests/support/h5-006-dependency-preservation.ts']);
for(const e of t.entries){const s=lstatSync(e.path);assert.ok(s.isFile()&&!s.isSymbolicLink());assert.equal(s.mode&0o777,0o644);const b=readFileSync(e.path);assert.equal(b.length,e.bytes);assert.equal(hash(b),e.sha256,e.path);assert.equal(hash(execFileSync('git',['show',t.baseCommit+':'+e.path])),e.beforeSha256);}
console.log(JSON.stringify({status:'PASS',scope:t.scope,trustSeal:hash(raw),paths:t.entries.map(e=>e.path),importsChangedGuards:false}));
