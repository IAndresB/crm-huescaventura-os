import {test} from 'node:test';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {writeFile,readFile,unlink} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
test('H2-010 historical F01 reproduces original immutable FAIL and expected',async()=>{
 const target=new URL(`h2010-historical-${randomUUID()}.ts`,import.meta.url);await writeFile(target,await readFile(new URL('../fixtures/h2-010/verifier-F01-original.ts.txt',import.meta.url),'utf8'));
 try{const env:NodeJS.ProcessEnv={...process.env,H2010_REPRO_SQL:'../fixtures/h2-010/booking-38793e6.sql.txt'};delete env.NODE_TEST_CONTEXT;
 const p=spawnSync(process.execPath,['--test','--experimental-strip-types','--test-name-pattern','R61',target.pathname],{env,encoding:'utf8'});
 assert.equal(p.status,1,p.stdout+p.stderr);assert.match(p.stdout+p.stderr,/Missing expected rejection/);assert.match(p.stdout+p.stderr,/(?:fail 1|# fail 1)/);assert.match(p.stdout+p.stderr,/R61/);
 }finally{await unlink(target);}
});
