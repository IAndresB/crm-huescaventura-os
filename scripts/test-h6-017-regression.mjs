// Narrow directed regression allowlist; no H6-015 runtime or global enumeration.
import {spawnSync} from 'node:child_process';
import {mkdir,writeFile,copyFile,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
const root=resolve(import.meta.dirname,'..');
await access(join(tmpdir(),'crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e/dist/start/server.js'));
const out=resolve(root,'tests/fixtures/h6-017/functional-regression',new Date().toISOString().replaceAll(':','-'));await mkdir(out,{recursive:true});
const files=['postgres-h5-012-complete.test.ts','postgres-h5-018-sixth-temporal.test.ts','postgres-h5-018-sixth-auxiliary.test.ts','postgres-h6-008.test.ts'];
await mkdir(join(out,'instruments'),{recursive:true});
for(const file of files){const dest=join(out,'instruments',file);await copyFile(join(root,'tests/integration',file),dest);}
const env={PATH:process.env.PATH,HOME:process.env.HOME,TMPDIR:process.env.TMPDIR,LANG:'C',POSTGRES_H0_BIN:process.env.POSTGRES_H0_BIN};
const result=spawnSync(process.execPath,['scripts/test-postgres.mjs',...files],{cwd:root,env,encoding:'utf8',maxBuffer:100*1024*1024});
await writeFile(join(out,'stdout.log'),result.stdout??'');await writeFile(join(out,'stderr.log'),result.stderr??'');await writeFile(join(out,'result.json'),JSON.stringify({files,status:result.status,signal:result.signal,error:result.error?.message??null,scope:'synthetic local only; H5-012 original bootstrap60, H5-018 sixth all68, H6-008 all68; unimplemented real Auth historical skip is not new accreditation'},null,2)+'\n');
console.log(JSON.stringify({out,status:result.status}));process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');process.exitCode=result.status??1;
