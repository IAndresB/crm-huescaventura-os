// Read-only H5-007/008 evidence and published closure preservation audit.
import assert from 'node:assert/strict';
import {readFileSync,existsSync,lstatSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:64*1024*1024}).trim(),root='tests/fixtures/h5-008/definitive/';
const report=JSON.parse(readFileSync(root+'verification.json','utf8'));
const preclosure=process.argv.includes('--preclosure');
function verifyPublishedClosure(){
 const closure='fdbd08bafdc6651d1ad6867242cd71791a25deb6',product='1c86e695144509fff0254c4d7a076dbb3921f777';
 const bytes=(ref,path)=>execFileSync('git',['show',ref+':'+path],{maxBuffer:32*1024*1024});
 // Exact product versions, including the separately authorized F01 guard and type-only fixture correction.
 const productPaths=['src/domain/external-boundary.ts','src/infrastructure/postgres/h5-external-event-adapter.ts',
  'supabase/migrations/20261008192000_h5_external_event_receipts.sql','tests/h5-009.test.ts',
  'tests/integration/postgres-h5-008-migration.test.ts','tests/integration/postgres-h5-009-migration.test.ts',
  'tests/integration/postgres-h5-009.test.ts','tests/support/h5-boundary-isolated.ts','tests/support/h5-work-isolated.ts'];
 const expectedPath='specs/001-core-crm/expected-TSK-H5-009-010.md';
 const documents=['specs/001-core-crm/evidence-TSK-H5-009-010.md','specs/001-core-crm/matrix-TSK-H5-009-010.md','specs/001-core-crm/defects-TSK-H5-009.md'];
 const fixture='tests/fixtures/h5-009/';
 const evidenceNames=['audit-production.json','build.log','channel-boundary-original-fail.log','channel-boundary-original-fail.status.json','f01-preservation.mjs',
  'focal-final.log','h5-008-preservation-gate-f01.log','health-independent-missing-postgres-env.fail.log','health-independent-ret-test.log','lint.log',
  'postgres-full-final.log','typecheck-final.log','typecheck-retest.log','typecheck.log','unit-final.log','verify-h5-008-evidence.log',
  'f05-counterexamples.mjs','f05-initial-revalidation.tar.gz','f05-development-deletion.log.gz','f05-precommit.tar.gz','f05-preflight.json','f05-diagnosis.md','f05-development-fails.json','f05-development-copy.log.gz','f05-development-buffer.log.gz','f05-development-scope.log.gz','verification.json'];
 const f01Names=['01-intact-56','02-valid-57','03-alter-first','04-alter-middle','05-alter-55','06-alter-56','07-delete-historical','08-comment-replacement','09-whitespace-56','10-unauthorized-within-protected-prefix','11-F10-F12-chain','12-prior-preservation-verifier'];
 const f05Names=['01-intact-closure','02-authorized-delta','03-historical-code','04-historical-migration','05-historical-expected','06-historical-evidence','07-unlisted-change','08-premature-h5011','09-premature-h5012','10-premature-h6','11-hosted','12-production','13-F10-F12','14-H5006-preservation','15-H5008-preservation','16-intact-historical-deletion','17-historical-symlink','18-historical-mode'];
 const gates=['frozen','typecheck','lint','unit','build','audit','focal','postgres','health','historical','historical-negative','f01','f05','diff','final'];
 const allowed=new Set([...productPaths,expectedPath,...documents,'docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md','specs/001-core-crm/tasks.md',
  'scripts/verify-h5-008-evidence.mjs',...evidenceNames.map(p=>fixture+p),fixture+'f01/result.json',...f01Names.map(p=>fixture+'f01/'+p+'.log.gz'),
  fixture+'revalidation/generated/archive.json',fixture+'f05/result.json',...f05Names.map(p=>fixture+'f05/'+p+'.log.gz'),...gates.flatMap(p=>[fixture+'revalidation/'+p+'.log.gz',fixture+'revalidation/'+p+'.status.json']),
  ...['tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json'].map(p=>fixture+'revalidation/generated/'+p+'.gz')]);
 const entries=git('ls-tree','-r','-z',closure).split('\0').filter(Boolean).map(e=>{const [meta,path]=e.split('\t');return {path,hash:meta.split(' ')[2]};});
 const historical=new Set(entries.map(e=>e.path));
 const current=git('ls-files','--cached','--others','--exclude-standard','-z').split('\0').filter(Boolean);
 for(const path of current){
  assert.ok(historical.has(path)||allowed.has(path),'unlisted posterior path: '+path);
  if(!historical.has(path)&&existsSync(path)){const metadata=lstatSync(path);assert.ok(metadata.isFile(),'posterior file type: '+path);assert.equal(metadata.mode&0o111,0,'posterior file mode: '+path);}
 }
 for(const {path,hash}of entries){
  const metadata=lstatSync(path);assert.ok(metadata.isFile(),'historical file type: '+path);assert.equal(metadata.mode&0o111,0,'historical file mode: '+path);
  if(allowed.has(path))continue;
  const raw=readFileSync(path);
  assert.equal(createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex'),hash,'published closure bytes: '+path);
 }
 const posterior=existsSync(expectedPath)||productPaths.some(p=>!historical.has(p)&&existsSync(p));
 for(const path of productPaths)if(posterior){
  assert.deepEqual(readFileSync(path),bytes(product,path),'authorized product bytes: '+path);
 }else if(existsSync(path)){
  // The intact historical copy may still contain its original versions or lack the additions.
  const original=historical.has(path)?bytes(closure,path):null,currentBytes=readFileSync(path);
  assert.ok((original&&currentBytes.equals(original))||currentBytes.equals(bytes(product,path)),'authorized product bytes: '+path);
 }
 if(posterior){
  const raw=readFileSync(expectedPath);assert.equal(raw.length,24417);assert.equal(createHash('sha256').update(raw).digest('hex'),'b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639');
  assert.deepEqual(raw,bytes('e8b38fa45b0170689784dd3af6ef6cba93e46ae1',expectedPath));
 }
 const taskPath='specs/001-core-crm/tasks.md',originalTasks=bytes(closure,taskPath).toString(),actualTasks=readFileSync(taskPath,'utf8');
 const block=(text,id)=>text.split('<a id="tsk-h5-'+id+'"></a>')[1].split('<a id=')[0];
 let normalized=actualTasks;
 for(const id of ['009','010']){
  const before=block(originalTasks,id),after=block(actualTasks,id);
  const beforeLines=before.split('\n'),afterLines=after.split('\n');assert.equal(afterLines.length,beforeLines.length);
  for(let i=0;i<beforeLines.length;i++)if(afterLines[i]!==beforeLines[i]){
   assert.ok(beforeLines[i].startsWith('- [ ] **Ejecución:')||beforeLines[i].startsWith('- **Evidencia necesaria:'),'unchanged task contract '+id+':'+i);
   assert.ok(after.includes('local/aislado')||after.includes('locales'),'isolated task claim '+id);
  }
  normalized=normalized.replace(after,before);
 }
 assert.equal(normalized,originalTasks,'only H5-009/010 status and evidence may progress');
 const progress=[...documents.filter(existsSync).map(p=>readFileSync(p,'utf8')),block(actualTasks,'009'),block(actualTasks,'010')];
 for(const path of ['docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md']){
  const original=bytes(closure,path).toString(),actual=readFileSync(path,'utf8');
  if(actual===original)continue;
  const title=original.slice(0,original.indexOf('\n')+1);assert.ok(actual.startsWith(title));
  const rest=original.slice(title.length),end=actual.indexOf(rest,title.length);assert.ok(end>=title.length);
  assert.equal(actual.slice(end),rest,'historical document preserved '+path);
  const addition=actual.slice(title.length,end);assert.ok(addition.trim().startsWith('**TSK-H5-009/010 '));assert.ok(addition.includes('local/aislado'));
  progress.push(addition);
 }
 for(const text of progress){
  assert.doesNotMatch(text.replaceAll('sin Hosted/Production','').replaceAll('Hosted/Production no acreditados',''),/\b(?:Hosted|Production)\b/,'no Hosted/Production accreditation');
  assert.doesNotMatch(text,/\b(?:H5-011|H5-012|H6)\b[^\n.]{0,50}\b(?:COMPLETED|PASS)\b/,'no later task accreditation');
 }
 if(['009','010'].some(id=>block(actualTasks,id).includes('Ejecución: COMPLETED'))){
  const proof=JSON.parse(readFileSync(fixture+'verification.json','utf8'));assert.equal(proof.status,'PASS');assert.equal(proof.scope,'local/isolated');
  assert.equal(git('merge-base',proof.testedSha,'HEAD'),proof.testedSha,'tested correction is an ancestor');
  for(const path of ['scripts/verify-h5-008-evidence.mjs',fixture+'f05-counterexamples.mjs'])assert.deepEqual(readFileSync(path),bytes(proof.testedSha,path),'tested F05 executable bytes: '+path);
  assert.deepEqual(proof.cases,['P01','P02','P03','P04','P05','P06','P07','P08','N01','N02','N03','N04','N05','N06','N07','N08','N09','N10','N11','N12','N13','N14','N15','N16','N17','N18']);assert.equal(proof.normativeRows,51);
  for(const gate of gates.filter(p=>p!=='final')){
   const status=JSON.parse(readFileSync(fixture+'revalidation/'+gate+'.status.json','utf8'));assert.equal(status.sha,proof.testedSha);assert.equal(status.exit,0,gate);
   const raw=gunzipSync(readFileSync(fixture+'revalidation/'+gate+'.log.gz'));assert.equal(createHash('sha256').update(raw).digest('hex'),status.sha256,gate);
  }
 }
 return current.filter(p=>!historical.has(p)||allowed.has(p));
}
const frozen=readFileSync('specs/001-core-crm/expected-TSK-H5-007-008.md');
assert.equal(frozen.length,26621);assert.equal(createHash('sha256').update(frozen).digest('hex'),'39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d');
assert.equal(frozen.toString(),execFileSync('git',['show','ae7f3b02745f3011bf3b324f2a5b3420f22a0a79:specs/001-core-crm/expected-TSK-H5-007-008.md'],{encoding:'utf8'}));
assert.equal(report.expectedPublication,'ae7f3b02745f3011bf3b324f2a5b3420f22a0a79');assert.equal(report.status,preclosure?'READY_FOR_FINAL_AUDIT':'PASS');
assert.equal(report.newPostgres,54);assert.equal(report.newUnit,4);assert.deepEqual(report.migrations,{before:55,after:56});assert.equal(report.sourceRows.length,45);
for(const gate of ['frozen','typecheck','lint','unit','build','audit','historical','historical-negative','focal','postgres','health','diff']){
 const status=JSON.parse(readFileSync(root+gate+'-final.status.json','utf8'));assert.equal(status.sha,report.testedSha);assert.equal(status.exit,0,gate);
}
for(const [gate,count]of [['focal',54],['postgres',2462],['unit',154],['health',1]]){
 const log=gunzipSync(readFileSync(root+gate+'-final.log.gz')).toString();for(const [label,n]of [['tests',count],['pass',count],['fail',0],['cancelled',0],['skipped',0]]){const found=[...log.matchAll(new RegExp('ℹ '+label+' (\\d+)','g'))];assert.equal(Number(found.at(-1)?.[1]),n,gate+':'+label);}
}
const rows=frozen.toString().split('\n').filter(x=>/^\| W\d\d \|/.test(x));assert.equal(report.cases.length,56);
const matrix=readFileSync('specs/001-core-crm/matrix-TSK-H5-008.md','utf8');
for(const line of rows){const cols=line.split('|').map(x=>x.trim()),id=cols[1],observed=report.cases.find(x=>x.id===id);assert.ok(observed,id);assert.equal(observed.source,cols[3]);assert.equal(observed.expected,cols[4]);assert.equal(observed.status,preclosure&&id==='W55'?'PENDING':'PASS');assert.ok(observed.evidence.length);for(const p of observed.evidence)assert.ok(existsSync(p),p);assert.ok(matrix.includes('| '+id+' |'));}
const inventory=frozen.toString().split('\n').filter(x=>x.startsWith('| **')).map(x=>x.match(/\*\*(.*?)\*\*/)[1]);assert.deepEqual(report.sourceRows,inventory);
for(const id of report.sourceRows){assert.ok(matrix.includes(id),id);const trace=report.normativeCoverage.find(x=>x.id===id);assert.ok(trace?.cases.length,id);assert.ok(trace.cases.every(c=>report.cases.some(x=>x.id===c)),id);}
for(const item of JSON.parse(readFileSync(root+'generated-historical/archive.json','utf8'))){const raw=gunzipSync(readFileSync(root+'generated-historical/'+item.file+'.gz'));assert.equal(raw.length,item.generatedBytes);assert.equal(createHash('sha256').update(raw).digest('hex'),item.generatedSha256);assert.equal(createHash('sha256').update(readFileSync(item.file)).digest('hex'),item.baselineSha256);}
const delta=verifyPublishedClosure();
const base='ff109036e3bb08a1d61e948693bc622bb10f240e';
for(const file of git('ls-tree','-r','--name-only',base,'src','scripts','tests/integration','tests/support','tests/operations','package.json','pnpm-lock.yaml').split('\n')){
 if(file==='tests/integration/postgres-h5-006-migration.test.ts')continue;
 assert.deepEqual(readFileSync(file),execFileSync('git',['show',base+':'+file]),file);
}
const guard='tests/integration/postgres-h5-006-migration.test.ts';assert.deepEqual(readFileSync(guard),execFileSync('git',['show','4da05b0f2e25ea13094e1ef06153a7aaed1d0aab:'+guard]));
execFileSync(process.execPath,['--experimental-strip-types','tests/fixtures/h5-006/f12/chain-counterexamples.mjs'],{stdio:'pipe'});
const tasks=readFileSync('specs/001-core-crm/tasks.md','utf8');for(const id of ['007','008']){const block=tasks.split('<a id="tsk-h5-'+id+'"></a>')[1].split('<a id=')[0];assert.ok(block.includes('Ejecución: '+(preclosure?'IN PROGRESS':'COMPLETED')));}
const baseTasks=execFileSync('git',['show','fdbd08bafdc6651d1ad6867242cd71791a25deb6:specs/001-core-crm/tasks.md'],{encoding:'utf8'});assert.equal(tasks.slice(tasks.indexOf('<a id="tsk-h5-011">')),baseTasks.slice(baseTasks.indexOf('<a id="tsk-h5-011">')));
console.log(JSON.stringify({audit:'PASS',mode:preclosure?'preclosure':'final',testedSha:report.testedSha,head:git('rev-parse','HEAD'),rows:45,cases:56,postgres:2462,unit:154,health:1,migrations:56,documentaryDelta:delta},null,2));
