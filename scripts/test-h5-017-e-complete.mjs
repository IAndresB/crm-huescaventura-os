// Full E verification in a disposable byte-verified replica. Historical tests
// may regenerate their old outputs there; the shared workspace stays untouched.
import {readFile,writeFile,mkdtemp,mkdir,copyFile,chmod,symlink,rm} from 'node:fs/promises';
import {constants} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.cwd(),out=join(root,'tests/fixtures/h5-017-e'),tag=process.argv[2];
if(!/^[a-z0-9-]+$/.test(tag??''))throw new Error('D_TAG_REQUIRED');
const hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(gunzipSync(await readFile(join(out,'preflight.json.gz'))));
const expected=JSON.parse(await readFile(join(out,'expected-seal.json'),'utf8'));if(hash(await readFile(expected.path))!==expected.sha256)throw new Error('D_EXPECTED_CHANGED');
const selection=JSON.parse(await readFile('tests/fixtures/h5-017-c/24-selection.json','utf8'));
const replacements={};
for(const row of JSON.parse(await readFile('tests/fixtures/h5-017-d/derived-tests.json','utf8'))){
 const name=row.source.split('/').at(-1),to=row.derived.split('/').at(-1);
 replacements[name==='postgres-h4-024.test.ts'?'h5017c-preservation-'+name:name]=to;
 if(hash(await readFile(row.source))!==row.sourceSha256||hash(await readFile(row.derived))!==row.derivedSha256)throw new Error('D_DERIVATIVE_CHANGED');
}
const selected=selection.selected.map(n=>replacements[n]??n);
selected.push('postgres-h5-018-second-correlation.test.ts','postgres-h5-018-second-migration.test.ts','postgres-h5-018-second-ownership.test.ts','postgres-h5-017-d-temporal.test.ts','postgres-h5-017-d-migration.test.ts','postgres-h5-017-d-reference-alias.test.ts');
selected.push('postgres-h5-018-third-temporal.test.ts','postgres-h5-018-third-parent-context.test.ts','postgres-h5-017-e-identity.test.ts','postgres-h5-017-e-parents.test.ts','postgres-h5-017-e-migration.test.ts');
selected.push('postgres-h5-017-e-owner-collision.test.ts','postgres-h5-017-e-current-evidence.test.ts','postgres-h5-017-e-observation-access.test.ts');
if(selected.length!==new Set(selected).size||selected.length!==184)throw new Error('D_SELECTION_DUPLICATE');
const original='tests/integration/postgres-h5-018-second-correlation.test.ts';if(hash(await readFile(original))!==baseline.files[original].sha256)throw new Error('D_ORIGINAL_REPRODUCER_CHANGED');
await writeFile(join(out,tag+'-selection.json'),JSON.stringify({selected,replacements,originalReproducerSha256:baseline.files[original].sha256,originalRuntimeHook:'tests/support/h5-017-e-full-hook.mjs',expected,reason:'Previous full176 selection, affected runtime fixtures advanced to67 by exact parent hooks, plus third audit originals12 and E new24; pinned historical migration tests preserved; no overlapping originals added'},null,2)+'\n',{flag:'wx'});
function git(args,cwd=root){const p=spawnSync('git',args,{cwd,encoding:'utf8',maxBuffer:16*1024*1024});if(p.status!==0)throw new Error('D_REPLICA_GIT:'+p.stderr);return p.stdout;}
const paths=[...new Set(git(['ls-files','-c','-o','--exclude-standard','-z']).split('\0').filter(Boolean))].sort();
const {lstat}=await import('node:fs/promises');const files={};
async function pool(values,fn){let next=0;await Promise.all(Array.from({length:16},async()=>{while(next<values.length){const value=values[next++];await fn(value);}}));}
await pool(paths,async path=>{const p=join(root,path),s=await lstat(p);if(!s.isFile()||s.isSymbolicLink())throw new Error('D_REPLICA_FILE_TYPE:'+path);files[path]={sha256:hash(await readFile(p)),bytes:s.size,mode:s.mode&0o777};});
const temporary=await mkdtemp(join(tmpdir(),'crm-h5017e-full-')),replica=join(temporary,'repo');let code=1;const regenerated=[];
try{
 git(['clone','--shared','--no-checkout','--quiet',root,replica]);git(['reset','--mixed','--quiet','HEAD'],replica);
 await Promise.all([...new Set(paths.map(p=>dirname(join(replica,p))))].map(p=>mkdir(p,{recursive:true})));
 await pool(paths,async path=>{const p=join(replica,path);await copyFile(join(root,path),p,constants.COPYFILE_FICLONE);await chmod(p,files[path].mode);if(hash(await readFile(p))!==files[path].sha256)throw new Error('D_REPLICA_COPY:'+path);});
 await symlink(join(root,'node_modules'),join(replica,'node_modules'),'dir');
 await writeFile(join(out,tag+'-copied-inputs.json.gz'),gzipSync(JSON.stringify({base:baseline.base,files,allBytesVerified:true,gitObjects:'read-only shared object store; separate clone index and refs',dependencies:'same pinned node_modules symlink',originalWorkspaceWrites:false})),{flag:'wx'});
 const env={...process.env,NODE_OPTIONS:[process.env.NODE_OPTIONS,'--import='+pathToFileURL(join(replica,'tests/support/h5-017-e-full-hook.mjs')).href].filter(Boolean).join(' ')};
 console.log('Corrective E full replica',JSON.stringify({files:paths.length,selected:selected.length,originalReproducerUnchanged:true,migrations:67}));
 // Historical subprocess reproducers reuse ports of current H2 suites.
 // Isolate those parents, then the millisecond-sensitive H2-008 fixture, and
 // execute the remaining disjoint files together. No assertion is changed.
 const isolated=selected.filter(n=>/postgres-h2-.*(?:-f0[0-9]|-defects)\.test\.ts$/.test(n)||n==='postgres-h2-011.test.ts'||n==='h5017c-preservation-postgres-h5-008-migration.test.ts'||n==='h5017d-dependency-postgres-h5-008.test.ts');
 const isolatedSet=new Set([...isolated,'postgres-h2-008.test.ts']);
 const phases=[...isolated.map(n=>[n]),['postgres-h2-008.test.ts'],selected.filter(n=>!isolatedSet.has(n))];
 if(phases.flat().length!==184||new Set(phases.flat()).size!==184)throw new Error('D_PHASE_OVERLAP');
 const observed=[];const total={tests:0,pass:0,fail:0,cancelled:0,skipped:0};code=0;
 for(let i=0;i<phases.length;i++){
  const phase=phases[i];console.log('Corrective E disjoint phase',JSON.stringify({index:i+1,total:phases.length,files:phase}));
  const child=spawn(process.execPath,['scripts/test-postgres.mjs',...phase],{cwd:replica,env,stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',b=>{stdout+=b;process.stdout.write(b);});child.stderr.on('data',b=>{stderr+=b;process.stderr.write(b);});const[result]=await once(child,'exit');
  const counts={};for(const key of Object.keys(total)){const values=[...stdout.matchAll(new RegExp('(?:ℹ|#) '+key+' (\\d+)','g'))];if(!values.length)throw new Error('D_PHASE_SUMMARY_MISSING:'+key);counts[key]=Number(values.at(-1)[1]);total[key]+=counts[key];}
  const prefix=tag+'-phase-'+String(i+1).padStart(2,'0');await writeFile(join(out,prefix+'.stdout.log.gz'),gzipSync(stdout),{flag:'wx'});await writeFile(join(out,prefix+'.stderr.log.gz'),gzipSync(stderr),{flag:'wx'});
  observed.push({files:phase,counts,exit:result,stdout:prefix+'.stdout.log.gz',stderr:prefix+'.stderr.log.gz'});if(result!==0)code=1;
  await writeFile(join(out,tag+'-phases.json'),JSON.stringify({selectedFiles:184,disjoint:true,phases:observed,total},null,2)+'\n');
 }
 for(const[key,value]of Object.entries(total))console.log('ℹ '+key+' '+value);

 const allowed=new Set(['tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json','supabase/.temp/cli-latest']);
 await pool(paths,async path=>{
  if(hash(await readFile(join(root,path)))!==files[path].sha256)throw new Error('D_WORKSPACE_CHANGED_DURING_FULL:'+path);
  const value=await readFile(join(replica,path));if(hash(value)!==files[path].sha256){if(!allowed.has(path))throw new Error('D_REPLICA_UNEXPECTED_WRITE:'+path);const capture=tag+'-generated-'+path.replaceAll('/','_')+'.gz';await writeFile(join(out,capture),gzipSync(value),{flag:'wx'});regenerated.push({path,capture,generatedSha256:hash(value),protectedWorkspaceSha256:files[path].sha256,protectedWorkspaceUnchanged:true});}
 });
 if(hash(await readFile(expected.path))!==expected.sha256)throw new Error('D_EXPECTED_CHANGED_DURING_FULL');
}finally{
 await writeFile(join(out,tag+'-replica-preservation.json'),JSON.stringify({regenerated:regenerated.sort((a,b)=>a.path.localeCompare(b.path)),workspaceProtectedOutputsNeverOverwritten:true,replicaRemoved:true,exit:code},null,2)+'\n',{flag:'wx'});
 await rm(temporary,{recursive:true,force:true});
}
process.exitCode=code??1;
