import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {isolatedWork,workFixture,migration} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
const capture=async(name:string,value:unknown)=>{if(process.env.H5008_CAPTURE_DIR)await writeFile(`${process.env.H5008_CAPTURE_DIR}/${name}.json`,JSON.stringify(value,null,2)+'\n');};
const catalog=async(h:Awaited<ReturnType<typeof isolatedWork>>)=>({
 tables:Array.from(await h.observer`select c.oid,c.relname,c.relowner,c.relacl,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind in ('r','p') order by c.oid`),
 functions:Array.from(await h.observer`select p.oid,p.proname,p.proowner,p.proacl,p.proconfig,p.prosecdef,p.prosrc from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' order by p.oid`),
 policies:Array.from(await h.observer`select oid,polrelid,polname,polroles,polqual::text,polwithcheck::text from pg_policy order by oid`),
 roles:Array.from(await h.observer`select oid,rolname,rolsuper,rolcanlogin,rolbypassrls,rolcreaterole,rolcreatedb from pg_roles order by oid`)});
test('W48 W49 fresh56 populated55 upgrade rollback retry preserve old catalog and data',async()=>{
 const h=await isolatedWork('crm_h5008_upgrade',59009,true);
 try{await communicationFixture(h,'incoming');const tables=(await h.observer`select schemaname,tablename from pg_tables where schemaname in ('crm_private','crm_ha')`).map(x=>x.schemaname+'.'+x.tablename);
 const data=async()=>{const out:Record<string,unknown>={};for(const table of tables)out[table]=Array.from(await h.admin.unsafe(`select to_jsonb(x) value from ${table} x order by to_jsonb(x)::text`));return out;};const before=await catalog(h),rows=await data(),sql=await readFile(migration,'utf8');
 await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')));await h.migration.unsafe('rollback');assert.deepEqual(await catalog(h),before);
 await h.migration.unsafe(sql);const after=await catalog(h);assert.deepEqual(await data(),rows);for(const key of ['tables','functions','policies']as const){const ids=new Set(before[key].map(x=>x.oid));assert.deepEqual(after[key].filter(x=>ids.has(x.oid)),before[key]);}assert.deepEqual(after.roles,before.roles);
 const f=await workFixture(h);await f.run(f.definition);assert.equal((await f.run(f.claim())).state,'claimed');await capture('vmig',{before,after,tables,oldRowsPreserved:true,rollbackCatalogIdentical:true,retry:'PASS',upgrade:'55->56'});
 }finally{await h.close();}
 const fresh=await isolatedWork('crm_h5008_fresh',59011);try{const f=await workFixture(fresh);await f.run(f.definition);assert.equal((await f.run(f.claim())).state,'claimed');}finally{await fresh.close();}
});
test('W50 official advisors56 loopback only',async()=>{
 const h=await isolatedWork('crm_h5008_advisors',59010);try{const r=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--db-url','postgresql://crm_h0_migration@127.0.0.1:59010/crm_h5008_advisors?sslmode=disable','--type','all','--fail-on','error'],{encoding:'utf8',timeout:45000});await capture('advisors',{status:r.status,stdout:r.stdout,stderr:r.stderr});assert.equal(r.status,0,r.stdout+r.stderr);assert.deepEqual(JSON.parse(r.stdout).results,[]);}finally{await h.close();}
});
test('W53 W54 W56 expected45 rows56 cases, all55 exact bytes, F10/F12 unchanged and scoped synthetic product',async()=>{
 const git=(...args:string[])=>{const r=spawnSync('git',args,{encoding:'utf8'});assert.equal(r.status,0);return r.stdout;};
 const path='specs/001-core-crm/expected-TSK-H5-007-008.md',raw=await readFile(path);assert.equal(raw.length,26621);assert.equal(createHash('sha256').update(raw).digest('hex'),'39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d');assert.equal(raw.toString(),git('show','ae7f3b02745f3011bf3b324f2a5b3420f22a0a79:'+path));
 const tasks=git('show','ff109036e3bb08a1d61e948693bc622bb10f240e:specs/001-core-crm/tasks.md'),rows=tasks.split('\n## 6.')[1]!.split('\n## 7.')[0]!.split('\n').filter(x=>x.startsWith('|')&&/\[TSK-H5-00[78]\]/.test(x));assert.equal(rows.length,45);for(const row of rows)assert.ok(raw.toString().includes(row));assert.equal(raw.toString().split('\n').filter(x=>/^\| W\d\d \|/.test(x)).length,56);
 const files=git('ls-tree','-r','--name-only','187bb1bb1de81c2bd4884f56de930d35acb93d26','supabase/migrations').trim().split('\n');assert.equal(files.length,55);for(const file of files)assert.equal(await readFile(file,'utf8'),git('show','187bb1bb1de81c2bd4884f56de930d35acb93d26:'+file),file);
 const baseline=git('ls-tree','-r','--name-only','ff109036e3bb08a1d61e948693bc622bb10f240e','src','scripts','tests/operations','package.json','pnpm-lock.yaml').trim().split('\n');for(const file of baseline)assert.equal(await readFile(file,'utf8'),git('show','ff109036e3bb08a1d61e948693bc622bb10f240e:'+file),file);
 assert.equal((await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')).length,56);
 const chain=spawnSync(process.execPath,['tests/fixtures/h5-006/f12/chain-counterexamples.mjs'],{encoding:'utf8',timeout:60000});assert.equal(chain.status,0,chain.stdout+chain.stderr);
 for(const file of [migration,'src/domain/persisted-work.ts','src/infrastructure/postgres/persisted-work-executor.ts','src/application/work-result-verification.ts'])assert.doesNotMatch(await readFile(file,'utf8'),/\b(fetch\(|setInterval\(|cron\.schedule|https:\/\/|openai\.com|anthropic|gemini|whisper|twilio|evolution-api|n8n)/i);
 await capture('preservation',{files,baseline,rows,expectedPublication:'ae7f3b0',expectedSha256:createHash('sha256').update(raw).digest('hex'),expectedBytes:raw.length,chainStatus:chain.status,pending:['DM-PENDING-005','BR-PENDING-035','schedulerCapacity','resumePolicy'],laterTasksStarted:false});
});
