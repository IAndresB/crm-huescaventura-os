import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {isolatedCommunications,communicationFixture,migration,read} from '../support/h5-communication-isolated.ts';
const capture=async(name:string,value:unknown)=>{if(process.env.H5006_CAPTURE_DIR)await writeFile(`${process.env.H5006_CAPTURE_DIR}/${name}.json`,JSON.stringify(value,null,2)+'\n');};
const catalog=async(h:Awaited<ReturnType<typeof isolatedCommunications>>)=>({
 tables:Array.from(await h.observer`select c.oid,c.relname,c.relowner,c.relacl,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind in ('r','p') order by c.oid`),
 functions:Array.from(await h.observer`select p.oid,p.proname,p.proowner,p.proacl,p.proconfig,p.prosecdef,p.prosrc from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' order by p.oid`),
 policies:Array.from(await h.observer`select oid,polrelid,polname,polroles,polqual::text,polwithcheck::text from pg_policy order by oid`),
 roles:Array.from(await h.observer`select oid,rolname,rolsuper,rolcanlogin,rolbypassrls,rolcreaterole,rolcreatedb from pg_roles order by oid`)});
test('H5-CAS fresh55 populated54 upgrade DDL rollback retry preserve all old catalog data',async()=>{
 const h=await isolatedCommunications('crm_h5006_upgrade',58902,true);
 try{
 const f=await communicationFixture(h,'incoming');const old=await h.evidence.read(await h.auth(),read,f.recordId,'booking',f.context.contextId);
 const oldTables=(await h.observer`select schemaname,tablename from pg_tables where schemaname in ('crm_private','crm_ha')`).map(x=>x.schemaname+'.'+x.tablename);
 const hashes=async()=>{const result:Record<string,unknown>={};for(const t of oldTables)result[t]=await h.admin.unsafe(`select md5(coalesce(string_agg(x::text,',' order by x::text),'')) hash from ${t} x`);return result;};const oldData=await hashes();
 const before=await catalog(h),rows=await h.observer`select to_jsonb(r) data from crm_private.b07_records r order by record_id`,sql=await readFile(migration,'utf8');
 await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0; commit;')));await h.migration.unsafe('rollback');assert.deepEqual(await catalog(h),before);
 await h.migration.unsafe(sql);assert.deepEqual(await hashes(),oldData);const after=await catalog(h);for(const key of ['tables','functions','policies']as const){const ids=new Set(before[key].map(x=>x.oid));assert.deepEqual(after[key].filter(x=>ids.has(x.oid)),before[key]);}assert.deepEqual(after.roles,before.roles);
 assert.deepEqual(await h.observer`select to_jsonb(r) data from crm_private.b07_records r order by record_id`,rows);assert.deepEqual(await h.evidence.read(await h.auth(),read,f.recordId,'booking',f.context.contextId),old);
 await f.run(f.derive());assert.equal((await f.see()).work.length,1);await capture('vmig',{before,after,old,rows,oldData});
 }finally{await h.close();}
});
test('H5-CAS official advisors55 exclusively loopback',async()=>{
 const label='crm_h5006_advisors',port=58903,h=await isolatedCommunications(label,port);
 try{const r=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--db-url',`postgresql://crm_h0_migration@127.0.0.1:${port}/${label}?sslmode=disable`,'--type','all','--fail-on','error'],{encoding:'utf8',timeout:45000});await capture('advisors',{status:r.status,stdout:r.stdout,stderr:r.stderr});assert.equal(r.status,0,r.stdout+r.stderr);assert.deepEqual(JSON.parse(r.stdout).results,[]);}finally{await h.close();}
});
test('H5-CAR/CAN/CAM/CAO/CAP/CAZ/CBD/CBE exact expected33 rows57 cases and historic product bytes',async()=>{
 const base='7eac0d27b6b74331868a14bbc4ca967f8d2f6bb9',expectedSha='b14396627cbadfc4a99dd3b158b47c3562d3f08f';
 const git=(...args:string[])=>{const r=spawnSync('git',args,{encoding:'utf8'});assert.equal(r.status,0);return r.stdout;};
 const protectedFiles=git('ls-tree','-r','--name-only',base,'src','supabase','scripts','tests/operations').trim().split('\n');for(const f of protectedFiles)assert.equal(await readFile(f,'utf8'),git('show',base+':'+f),f);
 const expectedFile='specs/001-core-crm/expected-TSK-H5-005-006.md',expected=await readFile(expectedFile,'utf8');assert.equal(expected,git('show',expectedSha+':'+expectedFile));
 const tasks=git('show',base+':specs/001-core-crm/tasks.md'),rows=tasks.split('\n## 6.')[1]!.split('\n## 7.')[0]!.split('\n').filter(x=>x.startsWith('|')&&/\[TSK-H5-00[56]\]/.test(x));assert.equal(rows.length,33);for(const row of rows)assert.ok(expected.includes(row));assert.equal(expected.split('\n').filter(x=>x.startsWith('| H5-C')).length,57);
 assert.equal((await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')).length,55);
 for(const file of ['src/domain/communication-review.ts','src/infrastructure/postgres/h5-communication-adapter.ts',migration])assert.doesNotMatch(await readFile(file,'utf8'),/\b(fetch\(|setInterval\(|cron\.schedule|https:\/\/|openai\.com|anthropic|gemini|whisper|twilio|evolution-api|n8n)/i);
 await capture('preservation',{base,expectedSha,protectedFiles,rows,before:54,added:1,after:55});
});
