// Explicit local-only entry point. Fresh evidence directories; frozen expected;
// no inherited credentials/capture paths and no invocation of H6-015.
import {readFile,writeFile,mkdir,readdir,copyFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {resolve,join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
const root=resolve(import.meta.dirname,'..'),group=process.argv[2];
const groups={
 'h6-006':['postgres-h6-006.test.ts','postgres-h6-006-regression.test.ts','postgres-h6-006-boundary.test.ts'],
 'h6-008':['postgres-h6-008.test.ts'],
 'h6-008-regression':['postgres-h0-006.test.ts','postgres-h0-014.test.ts','postgres-h1-016.test.ts'],
};
if(!Object.hasOwn(groups,group))throw new Error('H6_GROUP_NOT_ALLOWED');
const hash=b=>createHash('sha256').update(b).digest('hex');
const base='971c55d5ce5770c71284d106d3c0deecca9514b5';
const git=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',env:{PATH:process.env.PATH,GIT_OPTIONAL_LOCKS:'0'}});
if(git.status!==0||git.stdout.trim()!==base)throw new Error('H6_BASE_MISMATCH');
const fixture=join(root,'tests/fixtures/h6-local-validation');
for(const item of JSON.parse(await readFile(join(fixture,'expected-freeze.json'),'utf8')).files){if(hash(await readFile(join(root,item.path)))!==item.sha256)throw new Error('H6_EXPECTED_CHANGED');}
for(const item of JSON.parse(await readFile(join(fixture,'normative-source-lock.json'),'utf8')).sources){if(hash(await readFile(join(root,item.path)))!==item.sha256)throw new Error('H6_NORMATIVE_CHANGED');}
const run=group+'-'+new Date().toISOString().replace(/[:.]/g,'-'),directory=join(fixture,run);await mkdir(directory);
const sources=[];
for(const folder of ['src','supabase/migrations','tests/support','tests/integration','scripts']){
 const visit=async p=>{for(const name of await readdir(join(root,p))){const rel=join(p,name),full=join(root,rel);if((await stat(full)).isDirectory())await visit(rel);else if(/\.(?:ts|mjs|py|sql)$/.test(rel)){sources.push({path:rel,sha256:hash(await readFile(full))});if(rel.includes('h6-')||rel.includes('h6-008')){const out=join(directory,'source',rel);await mkdir(dirname(out),{recursive:true});await copyFile(full,out);}}}};await visit(folder);
}
await writeFile(join(directory,'source-manifest.json'),JSON.stringify({baseCommit:base,uncommittedCandidate:true,sources},null,2)+'\n');
const bin='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin';
const version=spawnSync(join(bin,'postgres'),['--version'],{encoding:'utf8'});if(version.status!==0)throw new Error('LOCAL_POSTGRES_REQUIRED');
// A previous system-temp Storage cache has deleted tracked files. Preserve it;
// use this worktree's own short private runtime root (Unix socket path limit).
const runtime=join('/tmp','crm-h6-local-'+hash(root).slice(0,12));await mkdir(runtime,{recursive:true,mode:0o700});
const observations=join(directory,'observations');await mkdir(observations);
const env={PATH:process.env.PATH,HOME:process.env.HOME,TMPDIR:runtime,LANG:'C',LC_ALL:'C',POSTGRES_H0_BIN:bin,NODE_NO_WARNINGS:'1',CI:'1',H5008_CAPTURE_DIR:observations,H5009_CAPTURE_DIR:observations};
// All complete-chain fixtures require official Storage, including H6-006.
// Existing approved runner obtains only its pinned public source if absent;
// service/DB configuration is ephemeral, synthetic and loopback-only.
const args=['scripts/test-postgres.mjs',...groups[group]];
const startedAt=new Date().toISOString();
await writeFile(join(directory,'run.json'),JSON.stringify({group,baseCommit:base,startedAt,command:['node',...args],node:process.version,postgres:version.stdout.trim(),status:'RUNNING',scope:'local isolated synthetic; H6-015 not started',expectedFreezeSha256:hash(await readFile(join(fixture,'expected-freeze.json')))},null,2)+'\n');
const child=spawn(process.execPath,args,{cwd:root,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
child.stdout.on('data',b=>{stdout+=b;});child.stderr.on('data',b=>{stderr+=b;});
const [exitCode,signal]=await once(child,'exit');
await writeFile(join(directory,'stdout.log'),stdout);await writeFile(join(directory,'stderr.log'),stderr);
const record=JSON.parse(await readFile(join(directory,'run.json'),'utf8'));Object.assign(record,{finishedAt:new Date().toISOString(),exitCode,signal,status:exitCode===0?'COMMAND_PASSED':'COMMAND_FAILED',stdoutSha256:hash(stdout),stderrSha256:hash(stderr)});
await writeFile(join(directory,'run.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({directory,exitCode,summary:stdout.split('\n').filter(x=>/^(# (tests|pass|fail|cancelled|skipped|duration)|[✖✔ℹ])/.test(x)).slice(-12),stderr:stderr.slice(-1500)},null,2));
process.exitCode=exitCode??1;
