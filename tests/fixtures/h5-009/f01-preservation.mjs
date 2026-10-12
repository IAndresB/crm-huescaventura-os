import assert from 'node:assert/strict';
import {mkdtemp,symlink,mkdir,copyFile,readdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';

const root=resolve(import.meta.dirname,'../../..'),out=join(import.meta.dirname,'f01'),commit='5e3add4b2c82fc5b0e459b43ea0685393c495840';
const git=(...args)=>{const r=spawnSync('git',args,{cwd:root});assert.equal(r.status,0,r.stderr?.toString());return r.stdout;};
const list=git('ls-tree','-r','--name-only',commit,'supabase/migrations').toString().trim().split('\n').filter(x=>x.endsWith('.sql')).map(x=>x.split('/').at(-1)).sort();
assert.equal(list.length,56);
const source=name=>git('show',commit+':supabase/migrations/'+name);
const temp=await mkdtemp(join(tmpdir(),'crm-h5009-f01-'));
const runs=[];
const testFile='tests/integration/postgres-h5-008-migration.test.ts';
const run=async(name,args=['--test','--test-name-pattern=W53','--experimental-strip-types',join(temp,testFile)],expected=0)=>{
 const r=spawnSync(process.execPath,args,{cwd:temp,encoding:'utf8',env:{...process.env,H5008_CAPTURE_DIR:''}});
 const raw=Buffer.from((r.stdout??'')+(r.stderr??''));
 await writeFile(join(out,name+'.log.gz'),gzipSync(raw));
 const row={name,command:['node',...args],exit:r.status,expectedExit:expected,sha256:createHash('sha256').update(raw).digest('hex'),bytes:raw.length};runs.push(row);
 assert.equal(r.status,expected,`${name}:\n${raw.toString()}`);
 return raw.toString();
};
const restore=async(name)=>writeFile(join(temp,'supabase/migrations',name),source(name));
await mkdir(out,{recursive:true});
try{
 for(const name of ['.git','src','scripts','specs','docs','node_modules','package.json','pnpm-lock.yaml'])await symlink(join(root,name),join(temp,name));
 await mkdir(join(temp,'tests/integration'),{recursive:true});
 for(const name of await readdir(join(root,'tests/integration')))if(name!==testFile.split('/').at(-1)){if(['postgres-h4-006.test.ts','postgres-h4-021.test.ts'].includes(name))await copyFile(join(root,'tests/integration',name),join(temp,'tests/integration',name));else await symlink(join(root,'tests/integration',name),join(temp,'tests/integration',name));}
 await symlink(join(root,'tests/support'),join(temp,'tests/support'));
 await symlink(join(root,'tests/fixtures'),join(temp,'tests/fixtures'));
 await symlink(join(root,'tests/operations'),join(temp,'tests/operations'));
 await copyFile(join(root,testFile),join(temp,testFile));
 await mkdir(join(temp,'supabase/migrations'),{recursive:true});
 await symlink(join(root,'supabase/operations'),join(temp,'supabase/operations'));
 for(const name of (await readdir(join(root,'supabase'))).filter(x=>!['migrations','operations'].includes(x)))await symlink(join(root,'supabase',name),join(temp,'supabase',name));
 for(const name of list)await writeFile(join(temp,'supabase/migrations',name),source(name));

 await run('01-intact-56');
 const newMigration='20261008192000_h5_external_event_receipts.sql';
 await copyFile(join(root,'supabase/migrations',newMigration),join(temp,'supabase/migrations',newMigration));
 await run('02-valid-57');
 await rm(join(temp,'supabase/migrations',newMigration));

 const alter=async(name,file,bytes)=>{await writeFile(join(temp,'supabase/migrations',file),bytes);try{await run(name,undefined,1);}finally{await restore(file);}};
 await alter('03-alter-first',list[0],Buffer.concat([source(list[0]),Buffer.from('\n-- synthetic tamper\n')]));
 await alter('04-alter-middle',list[27],Buffer.concat([source(list[27]),Buffer.from('\n-- synthetic tamper\n')]));
 await alter('05-alter-55',list[54],Buffer.concat([source(list[54]),Buffer.from('\n-- synthetic tamper\n')]));
 await alter('06-alter-56',list[55],Buffer.concat([source(list[55]),Buffer.from('\n-- synthetic tamper\n')]));
 await rm(join(temp,'supabase/migrations',list[21]));await run('07-delete-historical',undefined,1);await restore(list[21]);
 await alter('08-comment-replacement',list[54],Buffer.from('-- synthetic SQL comment replacement\n'));
 await alter('09-whitespace-56',list[55],Buffer.concat([source(list[55]),Buffer.from(' \n')]));
 const unauthorized='20000101000000_synthetic_unauthorized_historical.sql';
 await writeFile(join(temp,'supabase/migrations',unauthorized),'-- inert synthetic inventory probe; never executed\n');
 await run('10-unauthorized-within-protected-prefix',undefined,1);await rm(join(temp,'supabase/migrations',unauthorized));

 await run('11-F10-F12-chain', ['--experimental-strip-types',join(temp,'tests/fixtures/h5-006/f12/chain-counterexamples.mjs')]);
 await run('12-prior-preservation-verifier', ['--experimental-strip-types',join(temp,'scripts/verify-h5-006-f10-preservation.mjs')]);
 const current=(await readdir(join(temp,'supabase/migrations'))).filter(x=>x.endsWith('.sql')).sort();assert.deepEqual(current.slice(0,56),list);
 const rows={status:'PASS',publishedH5008Closure:commit,protectedMigrationCount:list.length,protectedNames:list,tests:runs,scope:'Temporary copies only; synthetic inventory files are never executed as SQL; no connectors or external effects.'};
 await writeFile(join(out,'result.json'),JSON.stringify(rows,null,2)+'\n');
}finally{await rm(temp,{recursive:true,force:true});}
console.log('F01 historical migration counterexamples PASS');
