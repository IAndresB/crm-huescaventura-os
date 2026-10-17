// Run existing assertions on chain64 without changing any historical verifier.
// Generated files change only the explicitly named harness import. Sources and
// copies are hashed in the immutable run stream; all copies are removed at exit.
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const cases=[
 ['postgres-h4-024.test.ts','h4-reality-isolated.ts','isolatedReality'],
 ['postgres-h5-008.test.ts','h5-work-isolated.ts','isolatedWork'],
 ['postgres-h5-009.test.ts','h5-boundary-isolated.ts','isolatedBoundaries'],
 ['postgres-h5-016-audit.test.ts','h5-joint-closure-isolated.ts','isolatedJointClosures'],
];
const created=[];
try{
 for(const[name,sourceHarness,alias]of cases){
  const source=await readFile('tests/integration/'+name,'utf8');
  let changed=source.replace(`from '../support/${sourceHarness}'`,`from '../support/h5-diagnostic-regression-isolated.ts'`);
  if(changed===source)changed=source.replace(`from "../support/${sourceHarness}"`,`from "../support/h5-diagnostic-regression-isolated.ts"`);
  if(changed===source)throw new Error('H5017_REGRESSION_HARNESS_MISSING');
  // One historical suite imports two helpers from its original harness. Keep
  // these names available via the successor without changing any assertions.
  const file='h5017-regression-'+name;
  await writeFile('tests/integration/'+file,changed,{flag:'wx'});created.push(file);
  const sha=x=>createHash('sha256').update(x).digest('hex');
  console.log(JSON.stringify({source:name,sourceSha256:sha(source),test:file,testSha256:sha(changed),change:'harness import only',harnessAlias:alias}));
 }
 const child=spawn(process.execPath,['scripts/test-postgres.mjs',...created,'postgres-h5-012-f02.test.ts','postgres-h5-012-coverage61.test.ts','postgres-h5-012-reference-chain.test.ts'],{stdio:'inherit',env:process.env});const[code]=await once(child,'exit');process.exitCode=code??1;
}finally{await Promise.all(created.map(name=>unlink('tests/integration/'+name)));}
