import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID as id} from 'node:crypto';
import {isolatedCorrectedDiagnostics,migration65,read,write} from '../support/h5-diagnostic-corrected-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
test('M01 independent populated64 upgrade65 is atomic and preserves policies constraints rows and effective rights',async()=>{
 const h=await isolatedCorrectedDiagnostics('h5018secondmigration',59920,true);
 try{
 const a=await boundaryFixture(h),b=await boundaryFixture(h),own=a.base(),foreign=b.base();await a.run(own);await b.run(foreign);
 const good={contextKind:'booking' as const,contextId:a.contextId,operationId:own.operationId,observationId:id(),requestRef:diagnosticReference(id()),outcome:'accepted' as const,issues:[]};
 const bad={...good,operationId:foreign.operationId,observationId:id(),requestRef:diagnosticReference(id())};
 await h.diagnostic.record(await h.auth(),write,good);await h.diagnostic.record(await h.auth(),write,bad);
 const tables=await h.admin`select n.nspname,c.relname,c.oid::int oid,c.relowner::int owner,c.relacl::text acl,c.relrowsecurity rls,c.relforcerowsecurity force from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind='r' order by c.oid`;
 const policies=()=>h.admin`select to_jsonb(x) row from pg_policy x where polrelid in (select c.oid from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%') order by oid`;
 const constraints=()=>h.admin`select to_jsonb(x) row from pg_constraint x where connamespace in(select oid from pg_namespace where nspname like 'crm%') order by oid`;
 const functions=()=>h.admin`select p.oid::int oid,p.oid::regprocedure::text name,pg_get_functiondef(p.oid) body,p.proowner::int owner,p.proacl::text acl,p.prosecdef,p.proconfig,p.provolatile,p.proisstrict,p.proleakproof,p.proparallel from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' and p.prokind='f' order by p.oid`;
 const rows=async()=>Promise.all(tables.map(async t=>[t.nspname+'.'+t.relname,await h.admin.unsafe(`select to_jsonb(x) row from ${t.nspname}.${t.relname} x order by to_jsonb(x)::text`)]));
 const before={policies:await policies(),constraints:await constraints(),functions:await functions(),rows:await rows()},sql=await readFile(migration65,'utf8');
 await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,"select 1/0; commit;")));await h.migration.unsafe('rollback');assert.deepEqual(await functions(),before.functions);assert.deepEqual(await policies(),before.policies);assert.deepEqual(await constraints(),before.constraints);assert.deepEqual(await rows(),before.rows);
 await h.migration.unsafe(sql);assert.deepEqual(await rows(),before.rows);assert.deepEqual(await policies(),before.policies);assert.deepEqual(await constraints(),before.constraints);
 const now=await functions(),changed=[];
 for(const old of before.functions){const next=now.find(n=>n.oid===old.oid)!;assert.ok(next);if(next.body!==old.body)changed.push(old.name);assert.deepEqual({...next,body:old.body},old);}
 assert.deepEqual(changed.sort(),['crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)','crm_private.diagnostic_nodes(text,text,uuid)']);assert.equal(now.length-before.functions.length,3);
 for(const t of tables)assert.deepEqual((await h.admin`select relowner::int owner,relacl::text acl,relrowsecurity rls,relforcerowsecurity force from pg_class where oid=${t.oid}::oid`)[0],{owner:t.owner,acl:t.acl,rls:t.rls,force:t.force});
 const goodPage=await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:a.contextId,pageSize:100,reference:good.requestRef});assert.ok(goodPage.nodes.some(n=>n.id===good.observationId));
 const badPage=await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:a.contextId,pageSize:100,reference:bad.requestRef});assert.deepEqual(badPage.nodes,[]);await assert.rejects(h.diagnostic.record(await h.auth(),write,bad),/DIAGNOSTIC_DENIED/);
 for(const role of ['anon','authenticated','crm_h0_runtime','crm_h0_ha_tx']){
 assert.equal((await h.admin`select has_table_privilege(${role},'crm_private.b10_diagnostic_observations','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') permitted`)[0]!.permitted,false);
 for(const fn of ['crm_private.diagnostic_contexts(text,text,uuid)','crm_private.diagnostic_canonical_nodes(text,text,uuid)','crm_private.diagnostic_operation_reference(uuid,jsonb)'])assert.equal((await h.admin`select has_function_privilege(${role},${fn},'EXECUTE') permitted`)[0]!.permitted,false);
 }
 assert.equal((await h.admin`select has_schema_privilege('crm_h0_f2_executor','crm_private','CREATE') permitted`)[0]!.permitted,false);
 console.log('M01 independent catalog',JSON.stringify({tables:tables.length,functionsBefore:before.functions.length,functionsAfter:now.length,policies:before.policies.length,constraints:before.constraints.length,changed,allRowsAndACLUnchanged:true,rollback:true,legacyBadObservationPreserved:true}));
 }finally{await h.close();}
});
