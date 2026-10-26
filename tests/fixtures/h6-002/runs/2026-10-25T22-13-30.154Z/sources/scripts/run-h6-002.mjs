// Exact suite allowlist, environment allowlist and immutable per-attempt captures.
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..'),out=join(root,'tests/fixtures/h6-002/runs',new Date().toISOString().replaceAll(':','-'));await mkdir(out,{recursive:true});
const suites=process.argv.slice(2);if(!suites.length)throw Error('H6002_EXPLICIT_SUITES_REQUIRED');
for(const path of ['scripts/run-h6-002.mjs','scripts/test-h6-002-runtime.mjs','tests/integration/postgres-h6-002-integrated.test.ts','tests/support/h6-002-direct-fixture.ts','tests/fixtures/h6-002/expected.json',...suites.map(s=>'tests/integration/'+s)]){const to=join(out,'sources',path);await mkdir(resolve(to,'..'),{recursive:true});await copyFile(join(root,path),to);}
const env={PATH:'/Users/andres/.openclaw/bin:/usr/bin:/bin',HOME:process.env.HOME,TMPDIR:'/tmp/h6002-runtime',LANG:'C',POSTGRES_H0_BIN:'/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin',H6002_RUN_DIR:out,H4014_CAPTURE_DIR:out};
const r=spawnSync(process.execPath,['scripts/test-h6-002-runtime.mjs',...suites],{cwd:root,env,encoding:'utf8',maxBuffer:100*1024*1024});
await writeFile(join(out,'stdout.log'),r.stdout??'');await writeFile(join(out,'stderr.log'),r.stderr??'');await writeFile(join(out,'result.json'),JSON.stringify({task:'TSK-H6-002',status:r.status,signal:r.signal,error:r.error?.message??null,suites,ports:[61101,61102,61103,61104],syntheticOnly:true},null,2)+'\n');console.log(JSON.stringify({out,status:r.status}));process.stdout.write(r.stdout??'');process.stderr.write(r.stderr??'');process.exitCode=r.status??1;
