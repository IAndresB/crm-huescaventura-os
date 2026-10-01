import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
test('H2-006 preserved F01/F02/F03 reproduce on archived implementation',async()=>{
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const path=new URL(`h2006-history-${randomUUID()}.ts`,import.meta.url);
 const original=await readFile(new URL('../fixtures/h2-006/sixth-verifier.ts.txt',import.meta.url),'utf8');
 const verifier=original.replace('crm_h2_006','crm_h2_006_history').replace('55475','55476').replace('../../supabase/migrations/${offerMigration}','../fixtures/h2-006/offer-ac6d770.sql.txt');
 try{await writeFile(path,verifier);const r=spawnSync(process.execPath,['--test','--experimental-strip-types',path.pathname],{env,encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024});const output=r.stdout+r.stderr;assert.equal(r.status,1,output);for(const id of ['R40','R41','R42'])assert.match(output,new RegExp(`✖ ${id} `));assert.match(output,/fail 3/);assert.match(output,/pass 39/);}finally{await unlink(path);}
});

test('H2-006 preserved F04 reproduces on archived temporal guard',async()=>{
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const path=new URL(`h2006-time-history-${randomUUID()}.ts`,import.meta.url);
 const original=await readFile(new URL('../fixtures/h2-006/tenth-verifier.ts.txt',import.meta.url),'utf8');
 const verifier=original.replace('crm_h2_006','crm_h2_006_f04').replace('55475','55477').replace('../../supabase/migrations/${offerMigration}','../fixtures/h2-006/offer-12814f4.sql.txt');
 try{await writeFile(path,verifier);const r=spawnSync(process.execPath,['--test','--experimental-strip-types',path.pathname],{env,encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024});const output=r.stdout+r.stderr;assert.equal(r.status,1,output);assert.match(output,/✖ R43 /);assert.match(output,/fail 1/);assert.match(output,/pass 42/);}finally{await unlink(path);}
});
