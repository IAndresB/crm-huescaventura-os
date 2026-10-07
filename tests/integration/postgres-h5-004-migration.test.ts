import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {randomUUID as uid} from 'node:crypto';
import {isolatedAlerts,migration,alert,read,write} from '../support/h5-alert-isolated.ts';
import {H5001TaskAdapter} from '../../src/infrastructure/postgres/h5-task-adapter.ts';
const capture=async(name:string,value:unknown)=>{if(process.env.H5004_CAPTURE_DIR)await writeFile(`${process.env.H5004_CAPTURE_DIR}/${name}.json`,JSON.stringify(value,null,2)+'\n');};
const inventory=async(h:Awaited<ReturnType<typeof isolatedAlerts>>)=>({
 tables:Array.from(await h.observer`select c.oid,c.relname,c.relowner,c.relacl,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind in ('r','p') order by c.oid`),
 functions:Array.from(await h.observer`select p.oid,p.proname,p.proowner,p.proacl,p.proconfig,p.prosecdef,p.prosrc from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' order by p.oid`),
 policies:Array.from(await h.observer`select oid,polrelid,polname,polroles,polqual::text,polwithcheck::text from pg_policy order by oid`),
 roles:Array.from(await h.observer`select oid,rolname,rolsuper,rolcanlogin,rolbypassrls,rolcreaterole,rolcreatedb from pg_roles order by oid`)});
test('H5-AAB fresh 54 and populated 53 upgrade preserve history data ACL owners and functions with DDL rollback',async()=>{
 const h=await isolatedAlerts('crm_h5004_upgrade',58802,true);
 try{
  const tasks=new H5001TaskAdapter(h.runtime,h.f1,h.f2),id=uid(),contextId=uid();
  await tasks.apply(await h.auth(),write,{action:'receive',operationId:uid(),taskId:id,expectedRevision:0,
   identity:{causeKind:'document',causeId:uid(),contextKind:'booking',contextId,scopeRef:contextId,relatedKind:null,relatedId:null,effect:'review'},
   material:{title:'Task previa',deadline:{kind:'unknown',reason:'Pendiente'},priority:{kind:'pending',reason:'Sin configurar'},sourceRef:'synthetic-prior',sourceVersion:'1',triggerRef:'manual',triggerVersion:'1'},reason:'Preservación'});
  await tasks.transition(await h.auth(),write,{action:'complete',operationId:uid(),taskId:id,expectedRevision:1,reason:'Revisión anterior',result:'Hecho de seguimiento',references:['synthetic-result']});
  const old=await tasks.read(await h.auth(),read,id,'booking',contextId);
  const rows=async()=>await h.observer`select to_jsonb(x) data from crm_private.b07_history x order by history_id`;
  const hist=await rows(),catalog=await inventory(h),sql=await readFile(migration,'utf8');
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0; commit;')));await h.migration.unsafe('rollback');
  assert.deepEqual(await inventory(h),catalog);assert.deepEqual(await rows(),hist);
  await h.migration.unsafe(sql);assert.deepEqual(await tasks.read(await h.auth(),read,id,'booking',contextId),old);assert.deepEqual(await rows(),hist);
  const current=await inventory(h);for(const key of ['tables','functions','policies'] as const){const ids=new Set(catalog[key].map(x=>x.oid));assert.deepEqual(current[key].filter(x=>ids.has(x.oid)),catalog[key]);}
  assert.deepEqual(current.roles,catalog.roles);await capture('vmig',{before:catalog,after:current,priorTask:old,history:hist});
  const p=alert();await h.alerts.apply(await h.auth(),write,p);assert.equal((await h.alerts.read(await h.auth(),read,p.alertId))!.notifications.length,2);
 }finally{await h.close();}
});
test('H5-AAC official advisors fresh 54 loopback',async()=>{
 const label='crm_h5004_advisors',port=58803,h=await isolatedAlerts(label,port);
 try{
  const r=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--db-url',`postgresql://crm_h0_migration@127.0.0.1:${port}/${label}?sslmode=disable`,'--type','all','--fail-on','error'],{encoding:'utf8',timeout:45000});
  await capture('advisors',{status:r.status,stdout:r.stdout,stderr:r.stderr});assert.equal(r.status,0,r.stdout+r.stderr);assert.deepEqual(JSON.parse(r.stdout).results,[]);
 }finally{await h.close();}
});
test('H5-AQ/AZ/AAD expected base inventory old product D027 health and 53 migrations preserved',async()=>{
 const base='e54331e41d5da154379542d0a08578288a57f01a';
 const git=(args:string[])=>{const r=spawnSync('git',args,{encoding:'utf8'});assert.equal(r.status,0);return r.stdout;};
 const prior=git(['ls-tree','-r','--name-only',base,'src','supabase','tests/operations','scripts']).trim().split('\n');
 for(const file of prior)assert.equal(await readFile(file,'utf8'),git(['show',base+':'+file]),file);
 const expected='specs/001-core-crm/expected-TSK-H5-003-004.md';assert.equal(await readFile(expected,'utf8'),git(['show','7cfa0ee:'+expected]));
 const tasks=git(['show',base+':specs/001-core-crm/tasks.md']);const rows=tasks.split('## 6. Matrices de trazabilidad')[1]!.split('## 7.')[0]!.split('\n').filter(x=>x.startsWith('|')&&/\[TSK-H5-00[34]\]/.test(x));
 assert.equal(rows.length,10);for(const row of rows)assert.ok((await readFile(expected,'utf8')).includes(row));
 const files=(await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql'));assert.equal(files.length,54);assert.equal(prior.filter(x=>x.startsWith('supabase/migrations/')).length,53);
 const newProduct=['src/domain/internal-alert.ts','src/infrastructure/postgres/h5-alert-adapter.ts',migration];
 for(const file of newProduct){const s=await readFile(file,'utf8');assert.doesNotMatch(s,/\b(fetch\(|setInterval\(|cron\.schedule|https:\/\/|twilio|evolution-api|n8n)/i);}
 await capture('preservation',{base,expected:'7cfa0ee6e03662e3be645c0da3168a6bfd9c79ed',priorFiles:prior,rows,migrations:{before:53,added:1,after:54}});
});
