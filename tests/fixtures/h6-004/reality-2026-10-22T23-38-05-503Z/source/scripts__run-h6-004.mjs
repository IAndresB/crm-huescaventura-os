// Local isolated execution; no ambient credentials, fresh append-only capture per attempt.
import {readFile,writeFile,mkdir,readdir,copyFile,stat,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..'),group=process.argv[2]??'focal';
const groups={modification_compat:['h6004compat-postgres-h4-012-supplement.test.ts','h6004compat-postgres-h4-012-f16.test.ts'],focal:['postgres-h6-004.test.ts'],dependency:['postgres-h5-019-integrated.test.ts'],modification:['postgres-h4-012.test.ts','postgres-h4-012-supplement.test.ts','postgres-h4-012-f16.test.ts'],cancellation:['postgres-h4-014.test.ts'],refund:['postgres-h4-016.test.ts','postgres-h4-016-f23.test.ts'],deposit:['postgres-h4-018.test.ts'],closure:['postgres-h5-013.test.ts','postgres-h5-015.test.ts','postgres-h5-015-concurrency.test.ts'],reality:['postgres-h4-023.test.ts'],promotion:['postgres-h3-012.test.ts']};
if(!Object.hasOwn(groups,group))throw new Error('H6004_UNKNOWN_GROUP');
const sha=b=>createHash('sha256').update(b).digest('hex');
const frozen=JSON.parse(await readFile(join(root,'tests/fixtures/h6-004/expected-freeze.json')));
if(sha(await readFile(join(root,frozen.path)))!==frozen.sha256)throw new Error('H6004_EXPECTED_CHANGED');
const runtime='/tmp/crm-h6004-runtime',bin='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin';
await access(join(runtime,'crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e/dist/start/server.js'));
const directory=join(root,'tests/fixtures/h6-004',group+'-'+new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(directory);await mkdir(join(directory,'source'));
for(const p of ['scripts/run-h6-004.mjs','tests/support/h6-004-fixtures.ts',...groups[group].map(x=>'tests/integration/'+x)])await copyFile(join(root,p),join(directory,'source',p.replaceAll('/','__')));
const files=[];for(const dir of ['src','supabase/migrations','tests/support','tests/integration','scripts']){async function visit(p){for(const n of await readdir(p)){const f=join(p,n);if((await stat(f)).isDirectory())await visit(f);else files.push({path:f.slice(root.length+1),sha256:sha(await readFile(f))});}}await visit(join(root,dir));}
await writeFile(join(directory,'inputs.json'),JSON.stringify({base:spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),files},null,2)+'\n');
const env={PATH:process.env.PATH,TMPDIR:runtime,LANG:'C',LC_ALL:'C',POSTGRES_H0_BIN:bin,CI:'1',NODE_NO_WARNINGS:'1',H6004_OUTPUT:directory,H4012_CORRECTIVE44:'1',H4016_CORRECTIVE47:'1',H4018_CURRENT48:'1',...(group==='focal'?{}:{NODE_OPTIONS:'--import='+new URL('../tests/support/h5-017-g-hook.mjs',import.meta.url).href})};
const phases=[];for(const [index,file] of groups[group].entries()){
 const startedAt=new Date().toISOString(),args=['scripts/test-postgres.mjs',file],child=spawn(process.execPath,args,{cwd:root,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);const [exitCode,signal]=await once(child,'exit');
 const prefix=join(directory,'phase-'+String(index+1).padStart(2,'0'));await writeFile(prefix+'.stdout.log',stdout);await writeFile(prefix+'.stderr.log',stderr);
 const summary=stdout.split('\n').filter(s=>/^(?:#|ℹ) (tests|pass|fail|cancelled|skipped|duration)/.test(s));
 const p={file,startedAt,finishedAt:new Date().toISOString(),command:['node',...args],exitCode,signal,status:exitCode===0?'PASS':'FAIL',stdoutSHA256:sha(stdout),stderrSHA256:sha(stderr),summary};phases.push(p);await writeFile(prefix+'.json',JSON.stringify(p,null,2)+'\n');console.log(JSON.stringify({directory,...p,tail:exitCode?stdout.slice(-3000)+stderr.slice(-1800):undefined}));
}
const r={group,node:process.version,postgres:spawnSync(join(bin,'postgres'),['--version'],{encoding:'utf8'}).stdout.trim(),expectedSHA256:frozen.sha256,phases,status:phases.every(p=>p.status==='PASS')?'PASS':'FAIL',realExternalEffects:false};await writeFile(join(directory,'run.json'),JSON.stringify(r,null,2)+'\n');process.exitCode=r.status==='PASS'?0:1;
