// Local-only runner: fresh captures, allowlisted environment, frozen expected.
import {readFile,writeFile,mkdir,readdir,stat,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..'),group=process.argv[2]??'focal';
const groups={focal:['postgres-h6-001.test.ts'],regression:['postgres-h5-019-integrated.test.ts','postgres-h5-015.test.ts','postgres-h4-023.test.ts','postgres-h4-021.test.ts','postgres-h3-012.test.ts','postgres-h3-010.test.ts','postgres-h2-010.test.ts','postgres-h1-016.test.ts']};
if(!Object.hasOwn(groups,group))throw new Error('H6001_GROUP_INVALID');
const sha=b=>createHash('sha256').update(b).digest('hex');
const frozen=JSON.parse(await readFile(join(root,'tests/fixtures/h6-001/expected-freeze.json')));
if(sha(await readFile(join(root,frozen.path)))!==frozen.sha256)throw new Error('EXPECTED_CHANGED');
for(const f of JSON.parse(await readFile(join(root,'tests/fixtures/h6-001/inherited-inputs.json'))).files)if(sha(await readFile(join(root,f.path)))!==f.sha256)throw new Error('INHERITED_CHANGED');
const directory=join(root,'tests/fixtures/h6-001',group+'-'+new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(directory);
await mkdir(join(directory,'source'));for(const file of ['tests/integration/postgres-h6-001.test.ts','scripts/run-h6-001.mjs'])await copyFile(join(root,file),join(directory,'source',file.split('/').pop()));
const files=[];for(const dir of ['src','supabase/migrations','tests/support','tests/integration','scripts']){async function visit(p){for(const name of await readdir(p)){const file=join(p,name);if((await stat(file)).isDirectory())await visit(file);else files.push({path:file.slice(root.length+1),sha256:sha(await readFile(file))});}}await visit(join(root,dir));}
await writeFile(join(directory,'inputs.json'),JSON.stringify({baseCommit:spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),files},null,2)+'\n');
const bin='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin',runtime='/tmp/crm-h6001-runtime';await mkdir(runtime,{recursive:true,mode:0o700});
const env={PATH:process.env.PATH,TMPDIR:runtime,LANG:'C',LC_ALL:'C',POSTGRES_H0_BIN:bin,CI:'1',NODE_NO_WARNINGS:'1',H6001_OUTPUT:directory};
const args=['scripts/test-postgres.mjs',...groups[group]],startedAt=new Date().toISOString();
const child=spawn(process.execPath,args,{cwd:root,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
const [exitCode,signal]=await once(child,'exit');await writeFile(join(directory,'stdout.log'),stdout);await writeFile(join(directory,'stderr.log'),stderr);
const summary=stdout.split('\n').filter(x=>/^(?:#|ℹ) (tests|pass|fail|cancelled|skipped|duration)/.test(x));
const record={group,startedAt,finishedAt:new Date().toISOString(),command:['node',...args],node:process.version,postgres:spawnSync(join(bin,'postgres'),['--version'],{encoding:'utf8'}).stdout.trim(),exitCode,signal,status:exitCode===0?'PASS':'FAIL',expectedSHA256:frozen.sha256,stdoutSHA256:sha(stdout),stderrSHA256:sha(stderr),summary};await writeFile(join(directory,'run.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({directory,...record,tail:exitCode?stdout.slice(-4000)+stderr.slice(-1800):undefined},null,2));process.exitCode=exitCode??1;
