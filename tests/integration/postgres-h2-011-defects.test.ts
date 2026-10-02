/** Original verifier and normative failures retained; no product oracle changes. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
for(const [id,pattern,observed] of [['F01','R01 AC017',/6 !== 7/],['F02','R13 separate',/column l.snapshot does not exist/]] as const)test(`${id} historical original verifier failure preserved`,async()=>{
 const original=await readFile(new URL('../fixtures/h2-011/verifier-first-original.ts.txt',import.meta.url),'utf8');
 const path=new URL(`./h2011-original-${id}.ts`,import.meta.url);
 await writeFile(path,original.replace("'crm_h2011',55487","'crm_h2011_history',55488"));
 try{const env={...process.env};delete env.NODE_TEST_CONTEXT;const p=spawnSync(process.execPath,['--test','--experimental-strip-types',`--test-name-pattern=${pattern}`,path.pathname],{encoding:'utf8',env});await writeFile(new URL(`../fixtures/h2-011/reproducer-${id}-corrected.log`,import.meta.url),p.stdout+p.stderr);assert.equal(p.status,1);assert.match(p.stdout+p.stderr,observed);assert.match(p.stdout,/fail 1/);}finally{await unlink(path);}
});
