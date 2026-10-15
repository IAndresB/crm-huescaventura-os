// Execute only after independent authentication, through the successor launcher.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,chmodSync,rmSync,symlinkSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';

const root=resolve(process.argv[2]),seal=process.argv[3];
assert.match(seal??'',/^[a-f0-9]{64}$/);
const prefix='tests/fixtures/h5-011/f14-successor-20261015/';
const fixture='tests/support/h4-modification-fixtures.ts';
const record='tests/fixtures/h5-011/f14-20261014/transition.authorized.json';
const expected='specs/001-core-crm/expected-TSK-H5-011-012.md';
const original=execFileSync('git',['show','71906987f9b74241cc4583e51498759829cded73:'+fixture],{cwd:root});
const candidate=readFileSync(join(root,fixture));
const hash=b=>createHash('sha256').update(b).digest('hex');
const oldHash='7739f5603d576a41855c0d1238f1f2535568e2dd34f4a8fd0f48d35fec8d75ed';
assert.equal(hash(original),oldHash);
assert.equal(hash(candidate),'5cb28867ff6bbba211ff04fd65dc39f8d00c26727957bcc3d827e37708cd14d2');
const guard=await import(pathToFileURL(join(root,'tests/support/h5-006-dependency-preservation.ts')).href);
const results=[];
const positive=(id,fn)=>{fn();results.push({id,result:'ACCEPTED AS REQUIRED'});};
const negative=(id,fn)=>{assert.throws(fn);results.push({id,result:'REJECTED AS REQUIRED'});};
const temporary=mkdtempSync(join(tmpdir(),'crm-f14-counterproofs-'));
const oldEnvironment={GIT_DIR:process.env.GIT_DIR,GIT_WORK_TREE:process.env.GIT_WORK_TREE};
try{
 const target=join(temporary,'guard-root');mkdirSync(target);
 const put=(path,bytes)=>{mkdirSync(resolve(target,path,'..'),{recursive:true});writeFileSync(join(target,path),bytes,{mode:0o644});chmodSync(join(target,path),0o644);};
 const originalRecord=readFileSync(join(root,record)),originalExpected=readFileSync(join(root,expected));
 put(record,originalRecord);put(expected,originalExpected);put(fixture,candidate);
 process.env.GIT_DIR=execFileSync('git',['rev-parse','--absolute-git-dir'],{cwd:root,encoding:'utf8'}).trim();
 process.env.GIT_WORK_TREE=target;
 const check=(bytes=candidate,historical=oldHash,path=fixture)=>guard.assertHistoricalHash(path,bytes,historical,target);
 positive('F14-01 corrected exact version',()=>check());
 const bytesCheck=(bytes=candidate)=>{
  const cwd=process.cwd();try{process.chdir(target);guard.assertHistoricalBytes(fixture,bytes,original);}finally{process.chdir(cwd);}
 };
 positive('F14-01B corrected byte comparator',()=>bytesCheck());
 put(fixture,original);positive('F14-02 historical exact version',()=>check(original));put(fixture,candidate);
 put(fixture,original);positive('F14-02B historical byte comparator',()=>bytesCheck(original));put(fixture,candidate);
 negative('F14-03 arbitrary third version',()=>{const third=Buffer.concat([candidate,Buffer.from('\n// arbitrary\n')]);put(fixture,third);check(third);});put(fixture,candidate);
 negative('F14-03B byte comparator rejects third version',()=>{const third=Buffer.concat([candidate,Buffer.from('\n// arbitrary\n')]);put(fixture,third);bytesCheck(third);});put(fixture,candidate);
 negative('F14-04 forged historical hash',()=>check(candidate,'0'.repeat(64)));
 negative('F14-05 different path cannot inherit exception',()=>check(candidate,oldHash,'tests/support/other-fixture.ts'));
 negative('F14-06 caller buffer differs from actual file',()=>check(original));
 chmodSync(join(target,fixture),0o600);negative('F14-07 fixture wrong mode',()=>check());chmodSync(join(target,fixture),0o644);
 rmSync(join(target,fixture));symlinkSync(join(root,fixture),join(target,fixture));negative('F14-08 fixture symlink',()=>check());rmSync(join(target,fixture));put(fixture,candidate);
 put(record,Buffer.from('{}'));negative('F14-09 authorization record forged',()=>check());put(record,originalRecord);
 rmSync(join(target,record));negative('F14-10 authorization record missing',()=>check());put(record,originalRecord);
 chmodSync(join(target,record),0o600);negative('F14-11 authorization wrong mode',()=>check());chmodSync(join(target,record),0o644);
 rmSync(join(target,record));symlinkSync(join(root,record),join(target,record));negative('F14-12 authorization symlink',()=>check());rmSync(join(target,record));put(record,originalRecord);
 put(expected,Buffer.concat([originalExpected,Buffer.from('\n')]));negative('F14-13 expected altered',()=>check());put(expected,originalExpected);
 const runtime='src/infrastructure/postgres/runtime.ts',runtimeBytes=readFileSync(join(root,runtime));
 negative('F14-14 unrelated protected runtime remains strict',()=>guard.assertHistoricalHash(runtime,Buffer.concat([runtimeBytes,Buffer.from('\n')]),hash(runtimeBytes),target));
 // Package attacks must fail authentication before any auditor can start.
 const attackRoot=join(temporary,'package-root');mkdirSync(join(attackRoot,prefix),{recursive:true});
 cpSync(join(root,prefix),join(attackRoot,prefix),{recursive:true});
 const python=process.env.F14_PYTHON_EXECUTABLE;assert.ok(python,'reviewed launcher supplies Python executable');
 const invoke=(attemptSeal=seal)=>{
  const env={...process.env};for(const key of ['GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR'])delete env[key];
  const result=spawnSync(python,['-B',join(root,prefix,'verify.py'),'--root',attackRoot,'--seal',attemptSeal],{encoding:'utf8',env});
  assert.notEqual(result.status,0);assert.match(result.stderr,/AUTHENTICATION:/);assert.doesNotMatch(result.stderr,/successor audit failed/);assert.equal(result.stdout,'');
 };
 invoke('0'.repeat(64));results.push({id:'F14 wrong external successor seal',result:'REJECTED BEFORE AUDITOR'});
 for(const name of ['audit.py','verify.py','guard.candidate.ts.txt','guard-before.ts.txt','guard-transition.diff','transition.record.candidate.json','manifest.json','counterproofs.mjs','README.md']){
  const path=join(attackRoot,prefix,name),bytes=readFileSync(path);writeFileSync(path,Buffer.concat([bytes,Buffer.from('\n')]));invoke();writeFileSync(path,bytes);
  results.push({id:'F14 sealed package alteration '+name,result:'REJECTED BEFORE AUDITOR'});
 }
 const trustPath=join(attackRoot,prefix,'trust.json'),trustBytes=readFileSync(trustPath);writeFileSync(trustPath,Buffer.concat([trustBytes,Buffer.from('\n')]));invoke();writeFileSync(trustPath,trustBytes);
 results.push({id:'F14 successor trust alteration cannot reuse external seal',result:'REJECTED BEFORE AUDITOR'});
 writeFileSync(join(attackRoot,prefix,'unregistered.txt'),'arbitrary');invoke();rmSync(join(attackRoot,prefix,'unregistered.txt'));
 results.push({id:'F14 unregistered dossier path',result:'REJECTED BEFORE AUDITOR'});
 const auditPath=join(attackRoot,prefix,'audit.py'),auditBytes=readFileSync(auditPath);chmodSync(auditPath,0o600);invoke();chmodSync(auditPath,0o644);rmSync(auditPath);symlinkSync(join(root,prefix,'audit.py'),auditPath);invoke();rmSync(auditPath);writeFileSync(auditPath,auditBytes,{mode:0o644});
 results.push({id:'F14 auditor wrong mode',result:'REJECTED BEFORE AUDITOR'},{id:'F14 auditor symlink',result:'REJECTED BEFORE AUDITOR'});
 console.log(JSON.stringify({status:'PASS',scope:'F14 exact transition and successor authentication negatives only',count:results.length,cases:results,newPostgresExecution:false},null,2));
}finally{
 for(const [key,value]of Object.entries(oldEnvironment)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
 rmSync(temporary,{recursive:true,force:true});
}
