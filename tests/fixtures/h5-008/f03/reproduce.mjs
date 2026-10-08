// Diagnostic only: append a harmless comment to historical migration 55 in
// disposable copies and execute the unmodified preservation controls there.
import {mkdtemp,symlink,mkdir,copyFile,readdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../../../..'),out=import.meta.dirname;
const verifier='tests/integration/postgres-h5-006-migration.test.ts',historical='20261007230734_h5_communication_review.sql';
const names=(await readdir(join(root,'supabase/migrations'))).filter(x=>x.endsWith('.sql')).sort();assert.equal(names.length,55);assert.equal(names.at(-1),historical);
const temp=await mkdtemp(join(tmpdir(),'crm-h5008-f03-')),observations=[];
const original=await readFile(join(root,'supabase/migrations',historical));
try{
 for(const name of ['.git','src','scripts','specs','tests','node_modules','docs','package.json','pnpm-lock.yaml'])await symlink(join(root,name),join(temp,name));
 await mkdir(join(temp,'supabase/migrations'),{recursive:true});
 for(const name of (await readdir(join(root,'supabase'))).filter(x=>x!=='migrations'))await symlink(join(root,'supabase',name),join(temp,'supabase',name));
 for(const file of names)await copyFile(join(root,'supabase/migrations',file),join(temp,'supabase/migrations',file));
 const run=async(name,args,environment={})=>{const r=spawnSync(process.execPath,args,{cwd:temp,encoding:'utf8',env:{...process.env,...environment,H5006_CAPTURE_DIR:''}});await writeFile(join(out,name+'.log.gz'),gzipSync(r.stdout+r.stderr));observations.push({name,command:['node',...args],exit:r.status});assert.equal(r.status,0,r.stdout+r.stderr);};
 const args=['--test','--test-name-pattern=H5-CAR/CAN/CAM/CAO/CAP/CAZ/CBD/CBE','--experimental-strip-types',join(root,verifier)];
 await run('untouched55-baseline',args);
 const changed=Buffer.concat([original,Buffer.from('\n-- F03 synthetic historical-byte alteration; no SQL executed.\n')]);
 await writeFile(join(temp,'supabase/migrations',historical),changed);
 await run('altered55-preservation-bypass',args);
 await run('altered55-f12-chain',['--experimental-strip-types',join(root,'tests/fixtures/h5-006/f12/chain-counterexamples.mjs')]);
 assert.notDeepEqual(changed,original);
 for(const file of names.filter(x=>x!==historical))assert.deepEqual(await readFile(join(temp,'supabase/migrations',file)),await readFile(join(root,'supabase/migrations',file)));
 assert.deepEqual(await readFile(join(root,'supabase/migrations',historical)),original);
 const protectedFiles=spawnSync('git',['ls-tree','-r','--name-only','7eac0d27b6b74331868a14bbc4ca967f8d2f6bb9','src','supabase','scripts','tests/operations'],{cwd:root,encoding:'utf8'}).stdout.trim().split('\n');
 assert.equal(protectedFiles.filter(x=>x.startsWith('supabase/migrations/')).length,54);
 assert.equal(protectedFiles.includes('supabase/migrations/'+historical),false);
 const result={status:'FAIL_REQUIRED_NEGATIVE_NOT_REJECTED',preflightSha:'bd6830595ef3fed94fb1a91a4e7250861eb768e2',verifier,authorizedOneLineApplied:true,historicalMigration:historical,originalSha256:createHash('sha256').update(original).digest('hex'),alteredSha256:createHash('sha256').update(changed).digest('hex'),protectedHistoricalBaselineMigrations:54,currentCount:55,repositoryHistoricalBytesUnchanged:true,observations,scope:'filesystem preservation only; no SQL; no PostgreSQL claim'};
 await writeFile(join(out,'result.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
}finally{await rm(temp,{recursive:true,force:true});}
