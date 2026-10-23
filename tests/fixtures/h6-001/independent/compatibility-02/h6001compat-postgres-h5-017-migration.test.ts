import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {isolatedDiagnostics,diagnosticMigration,write,read} from '../support/h5-diagnostic-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import {randomUUID as uid} from 'node:crypto';
test('H5-017 D07 populated63 upgrade rollback retry historical rows functions owners ACL preserved',async()=>{
 const h=await isolatedDiagnostics('h5017migration',59619,true);
 try{
  const f=await workFixture(h);await f.run(f.definition);const claim=f.claim();await f.run(claim);await f.run(f.start(claim,1));
  const tables=await h.observer`select schemaname,tablename from pg_tables where schemaname in('crm_private','crm_ha')order by schemaname,tablename`;
  const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
  const data=async()=>hash(await Promise.all(tables.map(async t=>({table:t.schemaname+'.'+t.tablename,rows:await h.admin.unsafe(`select to_jsonb(x)value from ${t.schemaname}.${t.tablename} x order by to_jsonb(x)::text`)}))));
  const catalog=()=>h.observer`select p.oid,p.proowner,p.proacl,p.proconfig,p.prosecdef,md5(pg_get_functiondef(p.oid))body from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%'and p.prokind='f'order by p.oid`;
  const before=await catalog(),digest=await data(),sql=await readFile('supabase/migrations/'+diagnosticMigration,'utf8');
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')));await h.migration.unsafe('rollback');assert.deepEqual(await catalog(),before);assert.equal(await data(),digest);assert.equal((await h.observer`select to_regclass('crm_private.b10_diagnostic_observations') t`)[0]!.t,null);
  await h.migration.unsafe(sql);assert.equal(await data(),digest);const after=await catalog();for(const r of before)assert.deepEqual(after.find(x=>x.oid===r.oid),r);
  const q={contextKind:'booking' as const,contextId:f.context.contextId,pageSize:100,reference:f.executionId};const p=await h.diagnostics.read(await h.auth(),read,q);assert.ok(p.nodes.some(x=>x.source==='b08_attempts'));assert.equal(p.nodes.find(x=>x.source==='b08_executions')!.incomplete,true);
  console.log('H5017 migration',JSON.stringify({chain:(await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')).length,oldTables:tables.length,oldFunctions:before.length,changedOldFunctions:0,populatedUpgrade:true,rollback:true,retry:true,dataHash:digest}));
  const advisors=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--db-url','postgresql://crm_h0_migration@127.0.0.1:59619/h5017migration?sslmode=disable','--type','all','--fail-on','error','--output-format','json'],{encoding:'utf8',timeout:45000});assert.equal(advisors.status,0,advisors.stderr);assert.deepEqual(JSON.parse(advisors.stdout).results,[]);console.log('H5017 advisors',advisors.stdout);
 }finally{await h.close();}
});
test('H5-017 D07 clean64 install, permissions and two real contexts isolated',async()=>{
 const h=await isolatedDiagnostics('h5017clean',59620);
 try{
  const a=await communicationFixture(h),b=await communicationFixture(h),o={contextKind:'booking' as const,contextId:a.context.contextId,observationId:uid(),requestRef:diagnosticReference(uid()),outcome:'rejected' as const,issues:[semanticIssue('E1','operation')]};await h.diagnostics.record(await h.auth(),write,o);
  assert.equal((await h.diagnostics.read(await h.auth(),read,{contextKind:'booking',contextId:b.context.contextId,pageSize:100,reference:o.requestRef})).nodes.length,0);
  const constraints=await h.observer`select contype,pg_get_constraintdef(oid)d from pg_constraint where conrelid='crm_private.b10_diagnostic_observations'::regclass`;assert.equal(constraints.filter(x=>x.contype==='f').length,3);
 }finally{await h.close();}
});
test('H5-017 D07 clean chain also installs before API roles exist and later roles inherit no authority',async()=>{
 const h=await isolatedDiagnostics('h5017withoutapi',59621,true);
 try{
  await h.admin.unsafe('drop role anon;drop role authenticated');
  assert.equal((await h.observer`select count(*)::int n from pg_roles where rolname in('anon','authenticated')`)[0]!.n,0);
  await h.migration.unsafe(await readFile('supabase/migrations/'+diagnosticMigration,'utf8'));
  await h.admin.unsafe('create role anon nologin;create role authenticated nologin');
  for(const role of ['anon','authenticated']){
   assert.equal((await h.observer`select has_table_privilege(${role},'crm_private.b10_diagnostic_observations','SELECT,INSERT,UPDATE,DELETE')ok`)[0]!.ok,false);
   for(const f of ['crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)','crm_api.h5_diagnostic_read(bytea,bytea,bytea,bytea,bytea)','crm_private.diagnostic_nodes(text,text,uuid)'])assert.equal((await h.observer`select has_function_privilege(${role},${f},'EXECUTE')ok`)[0]!.ok,false);
  }
  const c=await communicationFixture(h);assert.ok(await h.diagnostics.read(await h.auth(),read,{contextKind:'booking',contextId:c.context.contextId,pageSize:100}));
 }finally{await h.close();}
});
