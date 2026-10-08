// Read-only counterexample: execute the ORIGINAL historical guard in a
// temporary filesystem view. The extra .sql is inert and is never applied.
import {mkdtemp,symlink,mkdir,copyFile,readdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../../../..');
const output=import.meta.dirname;
const verifier='tests/integration/postgres-h5-006-migration.test.ts';
const sha=value=>createHash('sha256').update(value).digest('hex');
const original=await readFile(join(root,verifier));
const files=(await readdir(join(root,'supabase/migrations'))).filter(x=>x.endsWith('.sql')).sort();
assert.equal(files.length,55);
const temp=await mkdtemp(join(tmpdir(),'crm-h5008-f01-'));
const runs=[];
try {
 for(const name of ['.git','src','scripts','specs','tests','node_modules','docs'])await symlink(join(root,name),join(temp,name));
 await mkdir(join(temp,'supabase/migrations'),{recursive:true});
 await symlink(join(root,'supabase/operations'),join(temp,'supabase/operations'));
 for(const name of (await readdir(join(root,'supabase'))).filter(x=>!['migrations','operations'].includes(x)))await symlink(join(root,'supabase',name),join(temp,'supabase',name));
 for(const name of files)await copyFile(join(root,'supabase/migrations',name),join(temp,'supabase/migrations',name));
 const run=(name,testFile=join(root,verifier))=>{
  const args=['--test','--test-name-pattern=H5-CAR/CAN/CAM/CAO/CAP/CAZ/CBD/CBE','--experimental-strip-types',testFile];
  const r=spawnSync(process.execPath,args,{cwd:temp,encoding:'utf8',env:{...process.env,H5006_CAPTURE_DIR:''}});
  runs.push({name,command:['node',...args],exit:r.status,stdout:r.stdout,stderr:r.stderr});return r;
 };
 assert.equal(run('baseline55').status,0);
 await writeFile(join(temp,'supabase/migrations/20990101000000_synthetic_inventory_probe.sql'),'-- Inert filesystem probe only; NEVER executed as SQL.\n');
 const failing=run('additional56-original-fail');
 assert.equal(failing.status,1);assert.match(failing.stdout,/56 !== 55/);
 // Proposed one-line correction is tried only in a disposable copy.
 const from=".filter(x=>x.endsWith('.sql')).length,55)",to=".filter(x=>x.endsWith('.sql')&&x<=migration.split('/').at(-1)!).length,55)";
 assert.equal(original.toString().split(from).length,2);
 const candidate=original.toString().replace(from,to);
 await mkdir(join(temp,'review/integration'),{recursive:true});
 await symlink(join(root,'tests/support'),join(temp,'review/support'));
 const candidatePath=join(temp,'review/integration/postgres-h5-006-migration.test.ts');
 await writeFile(candidatePath,candidate);
 assert.equal(run('proposed-cutoff56-pass',candidatePath).status,0);
 const first=join(temp,'supabase/migrations',files[0]);
 await writeFile(first,(await readFile(first))+'\n-- synthetic historical tampering counterexample\n');
 const negative=run('proposed-cutoff-historical-tamper-rejected',candidatePath);
 assert.equal(negative.status,1);assert.doesNotMatch(negative.stdout,/56 !== 55/);
 await copyFile(join(root,'supabase/migrations',files[0]),first);
 await writeFile(join(output,'proposed-guard.patch'),'--- a/'+verifier+'\n+++ b/'+verifier+'\n@@ -35,1 +35,1 @@\n-'+original.toString().split('\n')[34]+'\n+'+candidate.split('\n')[34]+'\n');

 for(const name of files)assert.deepEqual(await readFile(join(temp,'supabase/migrations',name)),await readFile(join(root,'supabase/migrations',name)));
 assert.deepEqual(await readFile(join(root,verifier)),original);
}finally{
 for(const r of runs)await writeFile(join(output,r.name+'.log'),r.stdout+r.stderr);
 await writeFile(join(output,'runs.json'),JSON.stringify({testedSha:spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),node:process.version,verifier,verifierSha256:sha(original),historicalMigrations:files.length,scope:'Filesystem historical guard only, no PostgreSQL or product implementation',runs:runs.map(({stdout,stderr,...r})=>r)},null,2)+'\n');
 await rm(temp,{recursive:true,force:true});
}
console.log('Historical guard: baseline55 PASS; inert56 FAIL 56 !== 55. Repository bytes preserved.');
