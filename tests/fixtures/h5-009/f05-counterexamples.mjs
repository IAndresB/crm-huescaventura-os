// F05 counterproofs mutate disposable copies; published bytes always come from Git.
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm,symlink,copyFile,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const root=resolve(import.meta.dirname,'../../..'),out=join(import.meta.dirname,'f05');
const closure='fdbd08bafdc6651d1ad6867242cd71791a25deb6',auditor='scripts/verify-h5-008-evidence.mjs';
const git=(...args)=>{const r=spawnSync('git',args,{cwd:root,maxBuffer:256*1024*1024});assert.equal(r.status,0,r.stderr.toString());return r.stdout;};
const digest=b=>createHash('sha256').update(b).digest('hex');
const temp=await mkdtemp(join(tmpdir(),'crm-h5009-f05-')),runs=[];
await mkdir(out,{recursive:true});
const execute=(script)=>spawnSync(process.execPath,['--experimental-strip-types',script],{cwd:temp,encoding:'utf8',maxBuffer:8*1024*1024,timeout:60000});
const record=async(name,result,expectedExit,probe)=>{
 const raw=Buffer.from(result.stdout+result.stderr);await writeFile(join(out,name+'.log.gz'),gzipSync(raw));
 const row={name,exit:result.status,expectedExit,sha256:digest(raw),bytes:raw.length,probe};runs.push(row);
 assert.equal(result.status,expectedExit,`${name}: ${raw.toString().slice(0,3000)}`);console.log(name+' '+(expectedExit?'FAIL expected':'PASS'));
};
const run=async(name,expectedExit=0,probe=null,script=auditor)=>record(name,execute(script),expectedExit,probe);
const alter=async(name,path,transform)=>{
 const original=await readFile(join(temp,path)),changed=transform(original);
 await writeFile(join(temp,path),changed);
 try{await run(name,1,{path,originalSha256:digest(original),alteredSha256:digest(changed)});}finally{await writeFile(join(temp,path),original);}
};
try{
 const archive=git('archive',closure),unpack=spawnSync('tar',['-x','-C',temp],{input:archive});assert.equal(unpack.status,0);
 await symlink(join(root,'.git'),join(temp,'.git'));await mkdir(join(temp,'node_modules'));for(const name of await readdir(join(root,'node_modules')))await symlink(join(root,'node_modules',name),join(temp,'node_modules',name));
 await copyFile(join(root,auditor),join(temp,auditor));
 await run('01-intact-closure');
 const delta=git('diff','--name-only',closure,'HEAD').toString().trim().split('\n');
 const local=git('ls-files','--modified','--others','--exclude-standard','-z').toString().split('\0').filter(Boolean);
 for(const path of new Set([...delta,...local])){
  const target=join(temp,path);await mkdir(dirname(target),{recursive:true});await copyFile(join(root,path),target);
 }
 await run('02-authorized-delta');
 const append=b=>Buffer.concat([b,Buffer.from('\n-- synthetic F05 tampering probe\n')]);
 await alter('03-historical-code','src/domain/persisted-work.ts',append);
 await alter('04-historical-migration','supabase/migrations/20261008143617_h5_persisted_work_recovery.sql',append);
 await alter('05-historical-expected','specs/001-core-crm/expected-TSK-H5-007-008.md',append);
 await alter('06-historical-evidence','tests/fixtures/h5-008/definitive/verification.json',append);
 const unlisted='src/domain/h5-unauthorized-probe.ts';await writeFile(join(temp,unlisted),'// synthetic inert unauthorized addition\n');await run('07-unlisted-change',1,{path:unlisted});await rm(join(temp,unlisted));
 for(const [name,id]of [['08-premature-h5011','011'],['09-premature-h5012','012']])await alter(name,'specs/001-core-crm/tasks.md',b=>{
  const text=b.toString(),anchor='<a id="tsk-h5-'+id+'"></a>',at=text.indexOf(anchor);assert.ok(at>=0);
  return Buffer.from(text.slice(0,at)+text.slice(at).replace('Ejecución: NOT STARTED','Ejecución: COMPLETED'));
 });
 await alter('10-premature-h6','specs/001-core-crm/tasks.md',b=>{
  const text=b.toString(),at=text.indexOf('<a id="tsk-h6-001"></a>');assert.ok(at>=0);
  return Buffer.from(text.slice(0,at)+text.slice(at).replace('Ejecución: NOT STARTED','Ejecución: COMPLETED'));
 });
 for(const [name,environment]of [['11-hosted','Hosted'],['12-production','Production']])await alter(name,'specs/001-core-crm/evidence-TSK-H5-009-010.md',b=>Buffer.concat([b,Buffer.from('\n'+environment+': PASS acreditado sin evidencia.\n')]));
 await run('13-F10-F12',0,null,'tests/fixtures/h5-006/f12/chain-counterexamples.mjs');
 await run('14-H5006-preservation',0,null,'scripts/verify-h5-006-f10-preservation.mjs');
 await run('15-H5008-preservation');
 await writeFile(join(out,'result.json'),JSON.stringify({status:'PASS',closure,testedHead:git('rev-parse','HEAD').toString().trim(),auditorSha256:digest(await readFile(join(root,auditor))),runs,scope:'Disposable copies; historical archive from published Git closure; no external integrations.'},null,2)+'\n');
}finally{await rm(temp,{recursive:true,force:true});}
