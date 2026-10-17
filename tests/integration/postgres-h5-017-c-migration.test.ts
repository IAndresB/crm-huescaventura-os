import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID as id} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {isolatedCorrectedDiagnostics,migration65,read,write} from '../support/h5-diagnostic-corrected-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
const replaced=['crm_private.diagnostic_nodes(text,text,uuid)','crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)'];

test('C12 populated64 rollback65 retry preserves every row and only replaces the two declared bodies',async()=>{
 const h=await isolatedCorrectedDiagnostics('h5017cmigrate',59818,true);
 try{
  const a=await boundaryFixture(h),b=await boundaryFixture(h),event=b.base();await b.run(event);const observationId=id(),requestRef=diagnosticReference(id());
  await h.diagnostic.record(await h.auth(),write,{contextKind:'booking',contextId:a.contextId,operationId:event.operationId,observationId,requestRef,outcome:'accepted',issues:[]});
  assert.ok((await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:a.contextId,reference:requestRef,pageSize:100})).nodes.length,'legacy64 defect present before upgrade');
  const tables=await h.admin`select c.oid::int oid,n.nspname,c.relname,c.relowner::int owner,c.relacl::text acl,c.relrowsecurity rls,c.relforcerowsecurity force from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind='r' order by n.nspname,c.relname`;
  const hash=async()=>{const all=[];for(const t of tables)all.push([t.nspname+'.'+t.relname,await h.admin.unsafe(`select to_jsonb(x) v from ${t.nspname}.${t.relname} x order by to_jsonb(x)::text`)]);return createHash('sha256').update(JSON.stringify(all)).digest('hex');};
  const funcs=()=>h.admin`select p.oid::int oid,p.oid::regprocedure::text signature,pg_get_functiondef(p.oid) body,p.proowner::int owner,p.proacl::text acl,p.proconfig,p.prosecdef,p.provolatile from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' and p.prokind='f' order by p.oid`;
  const catalog=await funcs(),before=await hash(),sql=await readFile(migration65,'utf8');
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')));await h.migration.unsafe('rollback');assert.deepEqual(await funcs(),catalog);assert.equal(await hash(),before);assert.equal((await h.admin`select to_regprocedure('crm_private.diagnostic_contexts(text,text,uuid)') f`)[0]!.f,null);
  await h.migration.unsafe(sql);assert.equal(await hash(),before);const now=await funcs();let changes=0;
  for(const old of catalog){const found=now.find(x=>x.oid===old.oid)!;assert.ok(found);if(replaced.includes(old.signature)){assert.notEqual(found.body,old.body);assert.deepEqual({...found,body:old.body},old);changes++;}else assert.deepEqual(found,old);}
  assert.equal(changes,2);assert.equal(now.length,catalog.length+3);
  for(const t of tables){const row=(await h.admin`select relowner::int owner,relacl::text acl,relrowsecurity rls,relforcerowsecurity force from pg_class where oid=${t.oid}::oid`)[0]!;assert.deepEqual(row,{owner:t.owner,acl:t.acl,rls:t.rls,force:t.force});}
  assert.deepEqual((await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:a.contextId,reference:requestRef,pageSize:100})).nodes,[]);
  assert.equal((await h.admin`select count(*)::int n from crm_private.b10_diagnostic_observations where observation_id=${observationId}::uuid`)[0]!.n,1,'legacy evidence remains durable');
  const advisors=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--db-url','postgresql://crm_h0_migration@127.0.0.1:59818/h5017cmigrate?sslmode=disable','--type','all','--fail-on','error'],{encoding:'utf8',timeout:45000});assert.equal(advisors.status,0,advisors.stderr);assert.deepEqual(JSON.parse(advisors.stdout).results,[]);
  console.log('C12 migration65 preservation',JSON.stringify({oldTables:tables.length,oldFunctions:catalog.length,newHelpers:3,changedBodies:replaced,rowsHash:before,rollback:true,legacyBadObservationPreserved:true,advisors:JSON.parse(advisors.stdout)}));
 }finally{await h.close();}
});

test('C12 clean65 before API role creation retains all effective denials',async()=>{
 const h=await isolatedCorrectedDiagnostics('h5017cclean',59819,true);
 try{
 await h.admin.unsafe('drop role anon;drop role authenticated');await h.migration.unsafe(await readFile(migration65,'utf8'));await h.admin.unsafe('create role anon login;create role authenticated login');
 for(const role of ['anon','authenticated','crm_h0_runtime','crm_h0_ha_tx'])for(const f of ['crm_private.diagnostic_contexts(text,text,uuid)','crm_private.diagnostic_canonical_nodes(text,text,uuid)','crm_private.diagnostic_operation_reference(uuid,jsonb)'])assert.equal((await h.admin`select has_function_privilege(${role},${f},'EXECUTE') p`)[0]!.p,false);
 for(const f of ['crm_private.diagnostic_nodes(text,text,uuid)','crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)','crm_api.h5_diagnostic_read(bytea,bytea,bytea,bytea,bytea)'])for(const role of ['anon','authenticated'])assert.equal((await h.admin`select has_function_privilege(${role},${f},'EXECUTE') p`)[0]!.p,false);
 const event=await boundaryFixture(h);assert.ok(await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:event.contextId,pageSize:100}));
 }finally{await h.close();}
});
