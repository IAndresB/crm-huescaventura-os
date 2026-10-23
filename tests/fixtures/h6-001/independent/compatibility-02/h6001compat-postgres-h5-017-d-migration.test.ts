import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID as id} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {isolatedDiagnosticsD,read,write,migration66} from '../support/h5-diagnostic-d-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
test('D08 populated65 rollback66 retry preserves all rows policies constraints ACL and only replaces diagnostic_nodes',async()=>{
 const h=await isolatedDiagnosticsD('h5017dmig',59932,true);
 try{
 const f=await workFixture(h);await f.run(f.definition);const o={contextKind:'booking' as const,contextId:f.context.contextId,observationId:id(),requestRef:diagnosticReference(id()),operationId:f.definition.operationId,executionId:f.executionId,outcome:'pending' as const,issues:[semanticIssue('E4','operation')]};await h.diagnostic.record(await h.auth(),write,o);
 const dest=await communicationFixture(h),context={recordId:dest.recordId,...dest.context},material={...f.material,content:'Versión anterior a66'},approval=await f.approve(material);await f.run({...f.definition,...f.base(),action:'revise',version:2,context,material,...approval,affectedRefs:[dest.recordId]});
 const q={contextKind:'booking' as const,contextId:f.context.contextId,pageSize:100,reference:o.requestRef};assert.deepEqual((await h.diagnostic.read(await h.auth(),read,q)).nodes,[],'65 must still reproduce the original loss');
 const tables=await h.admin`select c.oid::int oid,n.nspname,c.relname,c.relowner::int owner,c.relacl::text acl,c.relrowsecurity rls,c.relforcerowsecurity force from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind='r' order by c.oid`;
 const rowsHash=async()=>{const data=[];for(const t of tables)data.push([t.oid,await h.admin.unsafe(`select to_jsonb(x) row from ${t.nspname}.${t.relname} x order by to_jsonb(x)::text`)]);return createHash('sha256').update(JSON.stringify(data)).digest('hex');};
 const functions=()=>h.admin`select p.oid::int oid,p.oid::regprocedure::text name,pg_get_functiondef(p.oid) body,p.proowner::int owner,p.proacl::text acl,p.proconfig,p.prosecdef,p.provolatile,p.proisstrict,p.proleakproof,p.proparallel from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' and p.prokind='f' order by p.oid`;
 const policies=()=>h.admin`select to_jsonb(p) row from pg_policy p order by oid`,constraints=()=>h.admin`select to_jsonb(c) row from pg_constraint c where connamespace in(select oid from pg_namespace where nspname like 'crm%') order by oid`;
 const before={rows:await rowsHash(),functions:await functions(),policies:await policies(),constraints:await constraints()},sql=await readFile(migration66,'utf8');
 const runtime=await h.runtime.reserve();try{await assert.rejects(runtime.unsafe(sql),/DIAGNOSTIC_MIGRATION_AUTHORITY_REQUIRED/);await runtime.unsafe('rollback');}finally{runtime.release();}
 await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')));await h.migration.unsafe('rollback');assert.equal(await rowsHash(),before.rows);assert.deepEqual(await functions(),before.functions);assert.deepEqual(await policies(),before.policies);assert.deepEqual(await constraints(),before.constraints);
 await h.migration.unsafe(sql);assert.equal(await rowsHash(),before.rows);assert.deepEqual(await policies(),before.policies);assert.deepEqual(await constraints(),before.constraints);
 const after=await functions();assert.equal(after.length,before.functions.length);const changed=[];
 for(const old of before.functions){const current=after.find(n=>n.oid===old.oid)!;assert.ok(current);if(current.body!==old.body)changed.push(old.name);assert.deepEqual({...current,body:old.body},old);}
 assert.deepEqual(changed,['crm_private.diagnostic_nodes(text,text,uuid)']);
 for(const t of tables)assert.deepEqual((await h.admin`select relowner::int owner,relacl::text acl,relrowsecurity rls,relforcerowsecurity force from pg_class where oid=${t.oid}::oid`)[0],{owner:t.owner,acl:t.acl,rls:t.rls,force:t.force});
 const n=(await h.diagnostic.read(await h.auth(),read,q)).nodes;assert.ok(n.some(x=>x.id===o.observationId));assert.equal(n.find(x=>x.id===o.observationId)!.historicalOperationReference,true);assert.equal(n.some(x=>x.source==='b08_executions'),false);
 const advisors=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--db-url','postgresql://crm_h0_migration@127.0.0.1:59932/h5017dmig?sslmode=disable','--type','all','--fail-on','error','--output-format','json'],{encoding:'utf8',timeout:45000});assert.equal(advisors.status,0,advisors.stderr);assert.deepEqual(JSON.parse(advisors.stdout).results,[]);
 console.log('D08 migration catalog',JSON.stringify({tables:tables.length,functions:after.length,changed,policies:before.policies.length,constraints:before.constraints.length,rowsSha256:before.rows,rollback:true,newObjects:0,advisors:JSON.parse(advisors.stdout)}));
 }finally{await h.close();}
});
test('D09 clean66 preserves low privilege denials with API roles created afterwards and FORCE RLS',async()=>{
 const h=await isolatedDiagnosticsD('h5017dclean',59933,true);
 try{
 await h.admin.unsafe('drop role anon;drop role authenticated');await h.migration.unsafe(await readFile(migration66,'utf8'));await h.admin.unsafe('create role anon login;create role authenticated login');
 const table=(await h.admin`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.b10_diagnostic_observations'::regclass`)[0]!;assert.equal(table.relrowsecurity,true);assert.equal(table.relforcerowsecurity,true);
 for(const role of ['anon','authenticated','crm_h0_runtime','crm_h0_ha_tx']){assert.equal((await h.admin`select has_table_privilege(${role},'crm_private.b10_diagnostic_observations','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') allowed`)[0]!.allowed,false);assert.equal((await h.admin`select has_function_privilege(${role},'crm_private.diagnostic_nodes(text,text,uuid)','EXECUTE') allowed`)[0]!.allowed,false);}
 for(const role of ['anon','authenticated'])for(const fn of ['crm_api.h5_diagnostic_read(bytea,bytea,bytea,bytea,bytea)','crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)'])assert.equal((await h.admin`select has_function_privilege(${role},${fn},'EXECUTE') allowed`)[0]!.allowed,false);
 const f=await workFixture(h);await f.run(f.definition);assert.ok((await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:f.context.contextId,pageSize:100})).nodes.some(n=>n.id===f.executionId));
 }finally{await h.close();}
});
