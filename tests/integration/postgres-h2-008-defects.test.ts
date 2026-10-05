/** Historical product remains reproducible. The original normative tests must FAIL at R56/R57. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
test('H2-008 F01/F02 original15dbf11 reproduces normative FAIL without weakening expected',async()=>{
 const original=await readFile(new URL('../fixtures/h2-008/verifier-defects.ts.txt',import.meta.url),'utf8');
 // Scope only the fixture's file inventory to its original predecessor; every normative assertion stays unchanged.
 const inventory="x.endsWith('.sql')&&x!==acceptanceMigration";assert.ok(original.includes(inventory));
 let snapshot=original.replace(inventory,"x.endsWith('.sql')&&x<acceptanceMigration");
 // Historical R22 intends a fact after replacement. JS milliseconds can round below PG microseconds.
 // Separate only fixture chronology; keep every normative assertion and original SQL/text unchanged.
 const chronology='await replaceVersion(f);assert.equal(';assert.ok(snapshot.includes(chronology));
 snapshot=snapshot.replace(chronology,'await replaceVersion(f);await new Promise(r=>setTimeout(r,3));assert.equal(');
 const target=resolve(import.meta.dirname,`historical-${randomUUID()}.ts`);await writeFile(target,snapshot);
 try{const env:NodeJS.ProcessEnv={...process.env,H2008_REPRO_SQL:'../fixtures/h2-008/acceptance-15dbf11.sql.txt'};delete env.NODE_TEST_CONTEXT;
 const r=spawnSync(process.execPath,['--test','--experimental-strip-types',target],{encoding:'utf8',env,timeout:120000,maxBuffer:16*1024*1024});
 console.log('H2-008 historical complete stdout:',r.stdout);console.log('H2-008 historical complete stderr:',r.stderr);console.log('H2-008 historical status:',r.status,'signal:',r.signal,'error:',r.error?.message??null);
 assert.equal(r.status,1,r.stderr);assert.match(r.stdout,/fail 2/);assert.match(r.stdout,/pass 55/);assert.match(r.stdout,/R56/);assert.match(r.stdout,/Missing expected rejection/);assert.match(r.stdout,/ACCEPTANCE_ALREADY_DECIDED/);
 }finally{await unlink(target);}
});
