import {mkdtemp,symlink,mkdir,copyFile,readdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../../../..'),out=import.meta.dirname,verifier='tests/integration/postgres-h5-006-migration.test.ts';
const names=(await readdir(join(root,'supabase/migrations'))).filter(x=>x.endsWith('.sql')).sort();assert.equal(names.length,55);
const temp=await mkdtemp(join(tmpdir(),'crm-h5008-f03-retest-')),runs=[];
try{
 for(const name of ['.git','src','scripts','specs','tests','node_modules','docs','package.json','pnpm-lock.yaml'])await symlink(join(root,name),join(temp,name));
 await mkdir(join(temp,'supabase/migrations'),{recursive:true});
 for(const name of (await readdir(join(root,'supabase'))).filter(x=>x!=='migrations'))await symlink(join(root,'supabase',name),join(temp,'supabase',name));
 for(const file of names)await copyFile(join(root,'supabase/migrations',file),join(temp,'supabase/migrations',file));
 const run=async(name,expected,args=['--test','--test-name-pattern=H5-CAR/CAN/CAM/CAO/CAP/CAZ/CBD/CBE','--experimental-strip-types',join(root,verifier)])=>{
 const r=spawnSync(process.execPath,args,{cwd:temp,encoding:'utf8',env:{...process.env,H5006_CAPTURE_DIR:''}});await writeFile(join(out,name+'.log.gz'),gzipSync(r.stdout+r.stderr));runs.push({name,command:['node',...args],exit:r.status,expectedExit:expected,kind:expected===1?'expected negative rejection':'positive'});assert.equal(r.status,expected,r.stdout+r.stderr);};
 await run('01-intact55',0);
 await writeFile(join(temp,'supabase/migrations/20990101000000_synthetic_future_probe.sql'),'-- INERT synthetic; no SQL executed\n');await run('02-inert56',0);
 const change=async(name,file,content)=>{await writeFile(join(temp,'supabase/migrations',file),content);try{await run(name,1);}finally{await copyFile(join(root,'supabase/migrations',file),join(temp,'supabase/migrations',file));}};
 await change('03-alter-first',names[0],(await readFile(join(root,'supabase/migrations',names[0])))+'\n-- synthetic modification\n');
 const middle=names[Math.floor(names.length/2)];await rm(join(temp,'supabase/migrations',middle));await run('04-delete-middle',1);await copyFile(join(root,'supabase/migrations',middle),join(temp,'supabase/migrations',middle));
 const last=names.at(-1),original=await readFile(join(root,'supabase/migrations',last));
 await change('05-substitute55',last,'-- synthetic replacement, same filename\n');
 await change('06-comment55',last,Buffer.concat([original,Buffer.from('\n-- synthetic added comment\n')]));
 await change('07-whitespace55',last,Buffer.concat([original,Buffer.from(' \n')]));
 await rm(join(temp,'supabase/migrations',last));await run('08-delete55',1);await copyFile(join(root,'supabase/migrations',last),join(temp,'supabase/migrations',last));
 await run('09-f10-f12-chain',0,['--experimental-strip-types',join(root,'tests/fixtures/h5-006/f12/chain-counterexamples.mjs')]);
 const extra=join(temp,'supabase/migrations/20261007000000_synthetic_unauthorized_historical.sql');await writeFile(extra,'-- INERT unauthorized historical inventory probe\n');await run('10-unauthorized-within-protected-set',1);await rm(extra);
 await run('11-restored55-and-inert56',0);
 for(const file of names)assert.deepEqual(await readFile(join(temp,'supabase/migrations',file)),await readFile(join(root,'supabase/migrations',file)));
 await writeFile(join(out,'result.json'),JSON.stringify({status:'PASS',preflightSha:'eb739b15bdd8a5cd2a6803cbdf4a041bc7a86013',publishedHistoricalSource:'187bb1bb1de81c2bd4884f56de930d35acb93d26',protected55ExactBytes:true,runs,scope:'filesystem preservation only; no PostgreSQL tests or SQL'},null,2)+'\n');
 console.log('F01/F03 counterexamples PASS: all specified negatives rejected; F10/F12 intact.');
}finally{await rm(temp,{recursive:true,force:true});}
