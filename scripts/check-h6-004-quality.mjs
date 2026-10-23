import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..'),directory=join(root,'tests/fixtures/h6-004','quality-'+new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(directory);
const sha=b=>createHash('sha256').update(b).digest('hex');
const env={PATH:process.env.PATH,TMPDIR:'/tmp/crm-h6004-runtime',LANG:'C',CI:'1',NEXT_TELEMETRY_DISABLED:'1'};
await writeFile(join(directory,'source-inputs.json'),JSON.stringify(await Promise.all(['scripts/check-h6-004-quality.mjs','tests/support/h6-004-fixtures.ts','tests/integration/postgres-h6-004.test.ts','tests/integration/postgres-h6-004-ac032.test.ts','tests/integration/postgres-h6-004-ac032-temporal.test.ts'].map(async path=>({path,sha256:sha(await readFile(join(root,path)))}))),null,2)+'\n');
const results=[];for(const name of ['test','typecheck','lint','build']){const startedAt=new Date().toISOString();const child=spawn('pnpm',[name],{cwd:root,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);const [exitCode,signal]=await once(child,'exit');await writeFile(join(directory,name+'.stdout.log'),stdout);await writeFile(join(directory,name+'.stderr.log'),stderr);const result={name,startedAt,finishedAt:new Date().toISOString(),exitCode,signal,status:exitCode===0?'PASS':'FAIL',stdoutSHA256:sha(stdout),stderrSHA256:sha(stderr)};results.push(result);await writeFile(join(directory,name+'.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({directory,...result,tail:exitCode?stdout.slice(-1800)+stderr.slice(-1800):undefined}));}
await writeFile(join(directory,'run.json'),JSON.stringify({status:results.every(r=>r.status==='PASS')?'PASS':'FAIL',results},null,2)+'\n');process.exitCode=results.every(r=>r.status==='PASS')?0:1;
