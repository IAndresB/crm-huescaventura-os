import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {auditDatabase,migration64,read} from '../support/h5-018-audit-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';

// Independent snapshots include table ACL, constraints, RLS policies and function
// security attributes, not merely function names or implementer counters.
test('A17 populated63 rollback and forward64 preserve all original rows and catalog permissions',async()=>{
 const h=await auditDatabase('h5018upgrade',59719,true);
 try{
  const f=await workFixture(h);await f.run(f.definition);const claim=f.claim();await f.run(claim);await f.run(f.start(claim,1));
  const tables=await h.admin`select c.oid::int oid,n.nspname,c.relname,c.relowner::int owner,c.relacl::text acl,c.relrowsecurity rls,c.relforcerowsecurity force from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in('crm_private','crm_ha') and c.relkind='r' order by n.nspname,c.relname`;
  const dump=async()=>{const values=[];for(const t of tables)values.push({table:t.nspname+'.'+t.relname,rows:await h.admin.unsafe(`select to_jsonb(t) value from ${t.nspname}.${t.relname} t order by to_jsonb(t)::text`)});return createHash('sha256').update(JSON.stringify(values)).digest('hex');};
  const funcs=()=>h.admin`select p.oid::int oid,pg_get_functiondef(p.oid) body,p.proowner::int owner,p.proacl::text acl,p.proconfig,p.prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' and p.prokind='f' order by p.oid`;
  const policies=()=>h.admin`select polrelid::int rel,polname,polcmd,polroles::text roles,pg_get_expr(polqual,polrelid) qual,pg_get_expr(polwithcheck,polrelid) checkexpr from pg_policy order by polrelid,polname`;
  const oldFunctions=await funcs(),oldPolicies=await policies(),oldRows=await dump(),sql=await readFile(migration64,'utf8');
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,"select 1/0; commit;")));await h.migration.unsafe('rollback');assert.equal(await dump(),oldRows);assert.deepEqual(await funcs(),oldFunctions);assert.deepEqual(await policies(),oldPolicies);
  assert.equal((await h.admin`select to_regclass('crm_private.b10_diagnostic_observations') value`)[0]!.value,null);
  await h.migration.unsafe(sql);assert.equal(await dump(),oldRows);const newFunctions=await funcs(),newPolicies=await policies();for(const old of oldFunctions)assert.deepEqual(newFunctions.find(x=>x.oid===old.oid),old);for(const old of oldPolicies)assert.deepEqual(newPolicies.find(x=>x.rel===old.rel&&x.polname===old.polname),old);
  const after=await h.admin`select c.oid::int oid,n.nspname,c.relname,c.relowner::int owner,c.relacl::text acl,c.relrowsecurity rls,c.relforcerowsecurity force from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in('crm_private','crm_ha') and c.relkind='r' order by n.nspname,c.relname`;for(const old of tables)assert.deepEqual(after.find(x=>x.oid===old.oid),old);
  const page=await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:f.context.contextId,reference:claim.operationId,pageSize:100});assert.ok(page.nodes.some(x=>x.id===claim.attemptId));
  console.log('A17 independent upgrade catalog',JSON.stringify({oldTables:tables.length,oldFunctions:oldFunctions.length,oldPolicies:oldPolicies.length,oldRowsSha256:oldRows,rollback:true,preserved:true}));
 }finally{await h.close();}
});

test('A17 clean64 and roles created after migration retain deny by default',async()=>{
 const h=await auditDatabase('h5018clean',59720,true);
 try{
 await h.admin.unsafe('drop role anon;drop role authenticated');await h.migration.unsafe(await readFile(migration64,'utf8'));await h.admin.unsafe('create role anon login;create role authenticated login');
 assert.equal((await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')&&x<='20261016142812_h5_protected_diagnostics.sql').length,64);
 for(const role of ['anon','authenticated','crm_h0_runtime','crm_h0_ha_tx']){
  assert.equal((await h.admin`select has_table_privilege(${role},'crm_private.b10_diagnostic_observations','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') p`)[0]!.p,false);
  assert.equal((await h.admin`select has_function_privilege(${role},'crm_private.diagnostic_nodes(text,text,uuid)','EXECUTE') p`)[0]!.p,false);
 }
 const api=await h.admin`select n.nspname,p.proname,p.prosecdef,p.proconfig,p.proacl::text acl from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.proname in('h5_diagnostic_read','h5_diagnostic_record','diagnostic_ref','diagnostic_root','diagnostic_nodes') order by p.proname`;
 assert.equal(api.length,5);for(const f of api){assert.ok(f.proconfig!.includes('search_path=pg_catalog, pg_temp'));assert.equal(/(?:\{|,)=/.test(f.acl),false,'PUBLIC execute');}
 console.log('A17 clean64 effective ACL',JSON.stringify(api));
 }finally{await h.close();}
});
