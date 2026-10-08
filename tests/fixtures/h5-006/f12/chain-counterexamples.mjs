// F12 verification fixture: only disposable on-disk copies are mutated.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {assertHistoricalHash,assertHistoricalBytes,assertAuthorizedPreservationChain,f10DependencyHashes,f12VerifierHashes,f12ManifestHashes} from '../../../support/h5-006-dependency-preservation.ts';
const digest=b=>createHash('sha256').update(b).digest('hex');
const git=(...a)=>execFileSync('git',a);
const sealedPaths=[...Object.keys(f10DependencyHashes),...Object.keys(f12VerifierHashes),...Object.keys(f12ManifestHashes)];
const before=Object.fromEntries(await Promise.all(sealedPaths.map(async p=>[p,digest(await readFile(p))])));
const temp=await mkdtemp(join(tmpdir(),'crm-h5006-f12-counterexamples-'));
const observations=[];
try{
 for(const p of sealedPaths){const target=join(temp,p);await mkdir(dirname(target),{recursive:true});await writeFile(target,await readFile(p));}
 await assertAuthorizedPreservationChain();await assertAuthorizedPreservationChain(temp);
 let manifestEntries=0;
 for(const p of Object.keys(f12ManifestHashes)){
  const d=JSON.parse(await readFile(p,'utf8')),map=d.sha256??d;
  const exclusions=p==='tests/fixtures/h4-021/base-preservation.json'?['docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md','specs/001-core-crm/tasks.md']:[];
  for(const [path,hash]of Object.entries(map)){
   if(exclusions.includes(path))continue;
   assertHistoricalHash(path,await readFile(path),hash);manifestEntries++;
  }
 }
 const protectedMap=JSON.parse(await readFile('tests/fixtures/h4-024/protected-base.json','utf8'));
 const migration=Object.keys(protectedMap).find(p=>p.startsWith('supabase/migrations/'));
 for(const p of [migration,'docs/constitution.md','specs/001-core-crm/expected-TSK-H4-020-021.md','tests/operations/supabase-health.test.mjs']){
  const original=await readFile(p),target=join(temp,p);await mkdir(dirname(target),{recursive:true});await writeFile(target,Buffer.concat([original,Buffer.from('\nF12_FORBIDDEN_CHANGE\n')]));
  const changed=await readFile(target);assert.throws(()=>assertHistoricalHash(p,changed,protectedMap[p]));
  observations.push({path:p,currentHash:digest(original),alteredHash:digest(changed),rejected:true,guard:'actual protected manifest hash'});
 }
 const expected='specs/001-core-crm/expected-TSK-H5-005-006.md',frozen=git('show','b14396627cbadfc4a99dd3b158b47c3562d3f08f:'+expected),target=join(temp,expected);
 await mkdir(dirname(target),{recursive:true});await writeFile(target,Buffer.concat([frozen,Buffer.from('\nF12_FORBIDDEN_EXPECTED_CHANGE\n')]));
 const alteredExpected=await readFile(target);assert.throws(()=>assertHistoricalBytes(expected,alteredExpected,frozen));
 observations.push({path:expected,currentHash:digest(frozen),alteredHash:digest(alteredExpected),rejected:true,guard:'immutable expected bytes'});
 // Reject an unrelated installed dependency too; it has no path exception.
 const other='node_modules/postgres/package.json',otherBytes=await readFile(other),otherTarget=join(temp,other);
 await mkdir(dirname(otherTarget),{recursive:true});await writeFile(otherTarget,Buffer.concat([otherBytes,Buffer.from('\nUNAUTHORIZED_OTHER_DEPENDENCY\n')]));
 const changedOther=await readFile(otherTarget);assert.throws(()=>assertHistoricalHash(other,changedOther,digest(otherBytes)));
 observations.push({path:other,currentHash:digest(otherBytes),alteredHash:digest(changedOther),rejected:true,guard:'unlisted dependency exact hash'});
 for(const p of sealedPaths){
  const original=await readFile(p),copy=join(temp,p);
  await writeFile(copy,Buffer.concat([original,Buffer.from('\nF12_UNAUTHORIZED_VERSION\n')]));
  await assert.rejects(assertAuthorizedPreservationChain(temp));
  observations.push({path:p,currentHash:digest(original),alteredHash:digest(await readFile(copy)),rejected:true,guard:'current seven-verifier/four-manifest/dependency chain'});
  await writeFile(copy,original);await assertAuthorizedPreservationChain(temp);
 }
 for(const [p,t]of Object.entries({...f10DependencyHashes,...f12VerifierHashes})){
  assert.throws(()=>assertHistoricalHash(p,Buffer.from('UNAUTHORIZED_BYTES'),t.historical));
  assert.throws(()=>assertHistoricalHash(p,Buffer.from('UNAUTHORIZED_BYTES'),'0'.repeat(64)));
 }
 // A different package version inside otherwise authorized package.json is rejected.
 const pkg=await readFile('package.json','utf8'),changedPackage=pkg.replace('"react": "19.3.0"','"react": "19.3.1"');assert.notEqual(pkg,changedPackage);
 await writeFile(join(temp,'package.json'),changedPackage);await assert.rejects(assertAuthorizedPreservationChain(temp));await writeFile(join(temp,'package.json'),pkg);
 observations.push({path:'package.json/react',rejected:true,guard:'unrelated dependency edit rejected by exact authorized hash'});
 await assertAuthorizedPreservationChain(temp);
 execFileSync(process.execPath,['--experimental-strip-types','scripts/verify-h5-006-f10-preservation.mjs'],{stdio:'inherit'});
 const after=Object.fromEntries(await Promise.all(sealedPaths.map(async p=>[p,digest(await readFile(p))])));assert.deepEqual(after,before);
 const result={status:'PASS',sha:git('rev-parse','HEAD').toString().trim(),sevenCurrentVerifiers:7,immutableManifests:4,manifestEntriesChecked:manifestEntries,legitimateNext1638:true,workingTreeProtectedFilesUnchanged:true,countsExcludedFromPostgresAndUnit:true,observations};
 if(process.env.H5006_CAPTURE_DIR)await writeFile(join(process.env.H5006_CAPTURE_DIR,'f12-historical-negatives.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
}finally{await rm(temp,{recursive:true,force:true});}
