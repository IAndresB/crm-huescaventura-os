// Filesystem counterexamples for the three historical verifier adaptations.
// Only disposable copies are altered; historical repository files stay intact.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {assertHistoricalBytes} from '../tests/support/h5-006-dependency-preservation.ts';
const git=(...args)=>execFileSync('git',args);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const firstMigration=git('ls-tree','-r','--name-only','50dedbdb','supabase/migrations').toString().trim().split('\n')[0];
const cases=[
 {verifier:'tests/integration/postgres-h4-018-migration.test.ts',base:'50dedbdb',protected:firstMigration},
 {verifier:'tests/integration/postgres-h4-019-preservation.test.ts',base:'ae1f3c360624bb0fb3714ec3983a13b888a444a7',protected:'docs/constitution.md'},
 {verifier:'tests/integration/postgres-h4-019-f06.test.ts',base:'f8318fad8bf8a7b6d8224330dc1b8840288dba60',protected:'tests/operations/supabase-health.test.mjs'}
];
const directory=await mkdtemp(join(tmpdir(),'crm-h5006-f10-counterexamples-')),observations=[];
try {
 for(const c of cases){
  const source=await readFile(c.verifier,'utf8');assert.ok(source.includes('assertHistoricalBytes('));
  const current=await readFile(c.protected),historical=git('show',c.base+':'+c.protected);
  assertHistoricalBytes(c.protected,current,historical);
  const path=join(directory,c.base,c.protected);await mkdir(dirname(path),{recursive:true});
  await writeFile(path,Buffer.concat([current,Buffer.from('\nH5006_F10_FORBIDDEN_HISTORICAL_CHANGE\n')]));
  const altered=await readFile(path);assert.throws(()=>assertHistoricalBytes(c.protected,altered,historical));
  const checks={historicalProtectedFileRejected:true,protected:c.protected,originalHash:hash(current),alteredHash:hash(altered)};
  for(const dependency of ['package.json','pnpm-lock.yaml']){
   const now=await readFile(dependency),old=git('show',c.base+':'+dependency);assertHistoricalBytes(dependency,now,old);
   const depPath=join(directory,c.base,dependency);await writeFile(depPath,Buffer.concat([now,Buffer.from('\nFORBIDDEN_DEPENDENCY_CHANGE\n')]));
   const alteredDependency=await readFile(depPath);
   assert.throws(()=>assertHistoricalBytes(dependency,alteredDependency,old));
   assert.throws(()=>assertHistoricalBytes(dependency,now,Buffer.concat([old,Buffer.from('\nFORBIDDEN_HISTORY_CHANGE\n')])));
   checks[dependency]={exactApprovedPatchAccepted:true,otherCurrentChangeRejected:true,historicalDependencyTamperingRejected:true};
  }
  observations.push({...c,...checks});
 }
 const result={status:'PASS',sha:git('rev-parse','HEAD').toString().trim(),historicalVerifiers:3,countsExcludedFromPostgresAndUnit:true,observations};
 if(process.env.H5006_CAPTURE_DIR)await writeFile(join(process.env.H5006_CAPTURE_DIR,'f10-historical-negatives.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
}finally{await rm(directory,{recursive:true,force:true});}
