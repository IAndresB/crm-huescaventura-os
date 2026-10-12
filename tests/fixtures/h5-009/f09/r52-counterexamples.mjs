import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFile,mkdir,mkdtemp,readFile,rm,symlink,writeFile,chmod} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {assertHistoricalHash,f07Transitions,f09R52Transition} from '../../../support/h5-006-dependency-preservation.ts';

const root=process.cwd(),path=f09R52Transition.path,closure='fdbd08bafdc6651d1ad6867242cd71791a25deb6';
const digest=b=>createHash('sha256').update(b).digest('hex'),git=(...args)=>execFileSync('git',args,{cwd:root,maxBuffer:256*1024*1024});
const original=git('show',closure+':'+path),corrected=await readFile(path),expected=await readFile('specs/001-core-crm/expected-TSK-H5-009-010.md');
assert.equal(digest(original),f09R52Transition.historical);assert.equal(digest(corrected),f09R52Transition.current);
assert.equal(expected.length,24417);assert.equal(digest(expected),'b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639');
const temp=await mkdtemp(join(tmpdir(),'crm-f09-r52-')),cases=[];
const file=join(temp,path),otherPath='tests/integration/postgres-h3-006-defects.test.ts',otherFile=join(root,otherPath);
const outcome=(name,fn,expectedStatus)=>{let status='PASS';try{fn();}catch(error){status='FAIL';if(expectedStatus==='PASS')throw error;}if(status!==expectedStatus)throw new Error(`${name}: expected ${expectedStatus}, observed ${status}`);cases.push({name,status});};
try{
 await mkdir(dirname(file),{recursive:true});await mkdir(dirname(join(temp,'specs/001-core-crm','expected-TSK-H5-009-010.md')),{recursive:true});
 await writeFile(file,corrected,{mode:0o644});await writeFile(join(temp,'specs/001-core-crm/expected-TSK-H5-009-010.md'),expected,{mode:0o644});
 await copyFile(otherFile,join(temp,otherPath));await symlink(join(root,'.git'),join(temp,'.git'));
 outcome('historical exact in historical baseline',()=>assertHistoricalHash(path,original,f09R52Transition.historical,temp),'PASS');
 outcome('corrected exact in authorized H5 context',()=>assertHistoricalHash(path,corrected,f09R52Transition.historical,temp),'PASS');
 outcome('one-byte third version',()=>assertHistoricalHash(path,Buffer.concat([corrected,Buffer.from(' ')]),f09R52Transition.historical,temp),'FAIL');
 await rm(file);outcome('deletion',()=>assertHistoricalHash(path,corrected,f09R52Transition.historical,temp),'FAIL');
 await writeFile(file,corrected,{mode:0o644});await rm(file);await symlink(join(root,path),file);
 outcome('symlink',()=>assertHistoricalHash(path,corrected,f09R52Transition.historical,temp),'FAIL');
 await rm(file);await writeFile(file,corrected,{mode:0o600});
 outcome('permissions altered',()=>assertHistoricalHash(path,corrected,f09R52Transition.historical,temp),'FAIL');
 await chmod(file,0o644);
 outcome('hash exchanged with another path',()=>assertHistoricalHash(otherPath,corrected,f09R52Transition.historical,temp),'FAIL');
 for(const [f07Path,transition]of Object.entries(f07Transitions)){
  const old=git('show',closure+':'+f07Path),current=await readFile(join(root,f07Path));
  await mkdir(dirname(join(temp,f07Path)),{recursive:true});await copyFile(join(root,f07Path),join(temp,f07Path));
  outcome('F07 historical exact '+f07Path,()=>assertHistoricalHash(f07Path,old,transition.historical,temp),'PASS');
  outcome('F07 authorized exact '+f07Path,()=>assertHistoricalHash(f07Path,current,transition.historical,temp),'PASS');
 }

 const auditTree=await mkdtemp(join(tmpdir(),'crm-f09-r52-audit-'));
 try{
  const archive=git('archive','HEAD');const unpack=spawnSync('tar',['-x','-C',auditTree],{input:archive});assert.equal(unpack.status,0);
  const pending=git('ls-files','--modified','--others','--exclude-standard','-z').toString().split('\0').filter(Boolean);
  for(const p of pending){await mkdir(dirname(join(auditTree,p)),{recursive:true});await copyFile(join(root,p),join(auditTree,p));}
  await symlink(join(root,'.git'),join(auditTree,'.git'));
  await writeFile(join(auditTree,'tests/fixtures/h5-009/f09/r52-counterexamples.json'),JSON.stringify({status:'PASS',testedSha:digest(corrected),historicalSha256:digest(original),caseCount:14,cases:Array.from({length:14},(_,i)=>({name:String(i),status:['PASS','PASS','FAIL','FAIL','FAIL','FAIL','FAIL','PASS','PASS','PASS','PASS','PASS','PASS','FAIL'][i]}))}));
  await writeFile(join(auditTree,'tests/fixtures/h5-009/f09/unlisted-historical-delta.txt'),'unauthorized\n');
  const result=spawnSync(process.execPath,['scripts/verify-h5-008-evidence.mjs'],{cwd:auditTree,encoding:'utf8',maxBuffer:16*1024*1024});
  assert.notEqual(result.status,0);assert.match(result.stderr+result.stdout,/unlisted posterior path/);
  cases.push({name:'additional unauthorized historical delta',status:'FAIL'});
 }finally{await rm(auditTree,{recursive:true,force:true});}
 const output={status:'PASS',testedSha:digest(corrected),historicalSha256:digest(original),caseCount:cases.length,cases};
 await writeFile(join(root,'tests/fixtures/h5-009/f09/r52-counterexamples.json'),JSON.stringify(output,null,2)+'\n');
}finally{await rm(temp,{recursive:true,force:true});}
