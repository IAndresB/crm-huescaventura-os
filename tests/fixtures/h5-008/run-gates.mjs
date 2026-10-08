// Capture real gates on one immutable product SHA. No reconstructed streams.
import {spawnSync,spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'../../..'),out=resolve(import.meta.dirname,'definitive');
const git=(...args)=>{const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr);return r.stdout.trim();};
const sha=git('rev-parse','HEAD');
await mkdir(out,{recursive:true});await mkdir(out+'/historical',{recursive:true});
const gates=[['frozen','pnpm',['install','--frozen-lockfile']],['typecheck','pnpm',['typecheck']],['lint','pnpm',['lint']],['unit','pnpm',['test']],['build','pnpm',['build']],['audit','pnpm',['audit','--prod','--json']],['historical',process.execPath,['--experimental-strip-types','tests/fixtures/h5-006/f12/chain-counterexamples.mjs']],['historical-negative',process.execPath,['--experimental-strip-types','scripts/verify-h5-006-f10-preservation.mjs']],['focal',process.execPath,['scripts/test-postgres.mjs','postgres-h5-008.test.ts','postgres-h5-008-migration.test.ts']],['postgres','pnpm',['test:postgres']],['health',process.execPath,['--test','tests/operations/supabase-health.test.mjs']],['diff','git',['diff','--check']]];
for(const[name,cmd,args]of gates){
 if(git('rev-parse','HEAD')!==sha)throw new Error('GATE_SHA_CHANGED');
 const capture=out+'/'+name+'-data';await mkdir(capture,{recursive:true});
 const env={...process.env,H5008_CAPTURE_DIR:capture,H5006_CAPTURE_DIR:out+'/historical'};
 const started=Date.now(),path=out+'/'+name+'-final.log',stream=createWriteStream(path);let code,error;
 console.log(name+' START '+sha);
 await new Promise(resolve=>{const p=spawn(cmd,args,{cwd:root,env,stdio:['ignore','pipe','pipe']});p.stdout.pipe(stream,{end:false});p.stderr.pipe(stream,{end:false});p.on('error',e=>{error=e.message;});p.on('close',c=>{code=c;stream.end(resolve);});});
 const bytes=await readFile(path);await writeFile(path+'.gz',gzipSync(bytes));
 const {unlink}=await import('node:fs/promises');await unlink(path);
 await writeFile(out+'/'+name+'-final.status.json',JSON.stringify({sha,command:[cmd,...args],exit:code,error:error??null,seconds:(Date.now()-started)/1000},null,2)+'\n');
 console.log(name+' '+(code===0?'PASS':'FAIL')+' '+((Date.now()-started)/1000).toFixed(1)+'s');
 if(name==='postgres'){
  // These three existing tests regenerate outputs unconditionally. Preserve
  // the new raw bytes separately, then restore their exact Git input bytes.
  // No guard, manifest, source or other historical file is rewritten.
  const records=[],digest=v=>createHash('sha256').update(v).digest('hex');
  for(const file of ['tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json']){
   const baseline=spawnSync('git',['show',sha+':'+file],{cwd:root,maxBuffer:128*1024*1024});if(baseline.status!==0)throw new Error('GENERATED_BASELINE_MISSING');
   const raw=await readFile(resolve(root,file)),destination=resolve(out,'generated-historical',file+'.gz');
   await mkdir(dirname(destination),{recursive:true});await writeFile(destination,gzipSync(raw));
   records.push({file,generatedBytes:raw.length,generatedSha256:digest(raw),baselineSha256:digest(baseline.stdout),restored:true});
   await writeFile(resolve(root,file),baseline.stdout);
  }
  await writeFile(out+'/generated-historical/archive.json',JSON.stringify(records,null,2)+'\n');
 }
 if(code!==0){process.exitCode=1;break;}
}
