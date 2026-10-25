// Explicit allowlist: never executes quarantined H6-015 or the global suite.
import {spawnSync} from 'node:child_process';
import {access,mkdir,writeFile,readFile,copyFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
if(process.env.STORAGE_H1_ENDPOINT&&new URL(process.env.STORAGE_H1_ENDPOINT).hostname!=='127.0.0.1')throw Error('H6017_LOOPBACK_REQUIRED');
await access(join(tmpdir(),'crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e/dist/start/server.js'));
const bin=process.env.POSTGRES_H0_BIN;if(!bin)throw Error('POSTGRES_H0_BIN_REQUIRED');
const out=resolve(root,'tests/fixtures/h6-017/functional-runs',new Date().toISOString().replaceAll(':','-'));await mkdir(out,{recursive:true});
for(const relative of ['tests/integration/postgres-h6-017-integrated.test.ts','scripts/test-h6-017-functional.mjs','tests/fixtures/h6-017/functional-expected.json','tests/fixtures/h6-017/functional-expected-v2.json']){const destination=join(out,'instruments',relative);await mkdir(resolve(destination,'..'),{recursive:true});await copyFile(join(root,relative),destination);}
const test='postgres-h6-017-integrated.test.ts',env={PATH:process.env.PATH,HOME:process.env.HOME,TMPDIR:process.env.TMPDIR,LANG:'C',POSTGRES_H0_BIN:bin};
const result=spawnSync(process.execPath,['scripts/test-postgres.mjs',test],{cwd:root,env,encoding:'utf8',maxBuffer:100*1024*1024});
await writeFile(join(out,'stdout.log'),result.stdout??'');await writeFile(join(out,'stderr.log'),result.stderr??'');
const expected=await readFile(join(root,'tests/fixtures/h6-017/functional-expected.json'));
await writeFile(join(out,'result.json'),JSON.stringify({task:'TSK-H6-017',test,status:result.status,signal:result.signal,error:result.error?.message??null,expectedSha256:createHash('sha256').update(expected).digest('hex'),syntheticOnly:true,externalConnections:'loopback Storage and PostgreSQL only'},null,2)+'\n');
console.log(JSON.stringify({out,status:result.status}));process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');process.exitCode=result.status??1;
