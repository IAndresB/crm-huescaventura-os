// Re-run frozen H5-013/H5-014 assertions against migration63 without changing
// their originals. Only the harness import changes; both hashes are logged.
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const files=['postgres-h5-013.test.ts','postgres-h5-013-concurrency.test.ts','postgres-h5-014-audit.test.ts','postgres-h5-014-races.test.ts'];
const created=[];
try{
 for(const name of files){
  const source=await readFile('tests/integration/'+name,'utf8');
  const replacement=source.replace("from '../support/h5-closure-isolated.ts'","from '../support/h5-015-regression-isolated.ts'");
  if(source===replacement)throw new Error('H5015_REGRESSION_IMPORT_ANCHOR_MISSING');
  const file='h5015-regression-'+name;
  await writeFile('tests/integration/'+file,replacement,{flag:'wx'});created.push(file);
  const hash=x=>createHash('sha256').update(x).digest('hex');
  console.log(JSON.stringify({source:name,sourceSha256:hash(source),test:file,testSha256:hash(replacement),change:'harness import only; assertions unchanged'}));
 }
 const child=spawn(process.execPath,['scripts/test-postgres.mjs',...created],{stdio:'inherit',env:process.env});
 const [code]=await once(child,'exit');process.exitCode=code??1;
}finally{await Promise.all(created.map(n=>unlink('tests/integration/'+n)));}
