import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID as id} from 'node:crypto';
import {isolatedDiagnosticsE as thirdDatabase,migration67 as migration66,read,write} from '../support/h5-diagnostic-e-isolated.ts';
import {spawnSync} from 'node:child_process';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
test('E-M01 independent catalog, populated upgrade, aborted DDL, function recovery and exact effective privileges',async()=>{
 const h=await thirdDatabase('h5017emig',59965,true);
 try{
  const f=await workFixture(h),other=await workFixture(h);await f.run(f.definition);await other.run({...other.definition,context:f.context,affectedRefs:[f.context.recordId]});
  const o={contextKind:'booking' as const,contextId:f.context.contextId,operationId:f.definition.operationId,executionId:other.executionId,observationId:id(),requestRef:diagnosticReference(id()),outcome:'pending' as const,issues:[semanticIssue('E4','execution')]};await h.diagnostic.record(await h.auth(),write,o);
  const q={contextKind:'booking' as const,contextId:o.contextId,reference:o.requestRef,pageSize:100};assert.ok((await h.diagnostic.read(await h.auth(),read,q)).nodes.some(n=>n.id===o.observationId));
  const booking=await jointFixture(h,[]),service=(await h.observer`select service_id::text id from crm_private.b04_services where booking_id=${booking.bookingId}::uuid order by service_id limit 1`)[0]!.id;
  const proof=h.req('evidence',{claim:'E upgrade child',coverage:'E',certainty:'reviewed',source_kind:'manual'},service,'booking_service');await h.evidence.apply(await h.auth(),write,proof);
  const child=await workFixture(h),childContext={recordId:proof.targetId,contextKind:'booking_service',contextId:service,purpose:proof.purpose};await child.run({...child.definition,context:childContext,affectedRefs:[proof.targetId]});
  const parentObservation={...o,observationId:id(),requestRef:diagnosticReference(id()),contextId:booking.bookingId,operationId:child.definition.operationId,executionId:undefined};await h.diagnostic.record(await h.auth(),write,parentObservation);
  const parentQuery={contextKind:'booking' as const,contextId:booking.bookingId,reference:parentObservation.requestRef,pageSize:100};assert.ok((await h.diagnostic.read(await h.auth(),read,parentQuery)).nodes.some(n=>n.id===parentObservation.observationId));
  const dest=await communicationFixture(h),context={recordId:dest.recordId,...dest.context},material={...child.material,content:'E migration revise child'},approval=await child.approve(material);await child.run({...child.definition,...child.base(),action:'revise',version:2,context,material,...approval,affectedRefs:[context.recordId]});assert.deepEqual((await h.diagnostic.read(await h.auth(),read,parentQuery)).nodes,[]);
  const classes=()=>h.admin`select c.oid::int oid,n.nspname,c.relname,c.relkind,c.relowner::int owner,c.relacl::text acl,c.relrowsecurity,c.relforcerowsecurity,c.reloptions from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' order by c.oid`;
  const functions=()=>h.admin`select p.oid::int oid,p.oid::regprocedure::text name,to_jsonb(p) attributes from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' order by p.oid`;
  const policies=()=>h.admin`select to_jsonb(p) row from pg_policy p order by oid`;
  const constraints=()=>h.admin`select to_jsonb(c) row from pg_constraint c where connamespace in(select oid from pg_namespace where nspname like 'crm%') order by oid`;
  const rights=async()=>{
   const rows=[];for(const role of ['crm_h0_runtime','crm_h0_ha_tx','crm_h0_f2_executor','anon','authenticated']){
    rows.push(await h.admin`select ${role} role_name,has_table_privilege(${role},'crm_private.b10_diagnostic_observations','SELECT') r,has_table_privilege(${role},'crm_private.b10_diagnostic_observations','INSERT') w,has_function_privilege(${role},'crm_private.diagnostic_nodes(text,text,uuid)','EXECUTE') helper,has_schema_privilege(${role},'crm_private','CREATE') ddl`);
   }return rows;
  };
  const tables=(await classes()).filter(x=>x.relkind==='r');
  const rowsHash=async()=>{
   const hash=createHash('sha256');for(const t of tables){hash.update(t.nspname+'.'+t.relname);hash.update(JSON.stringify(await h.admin.unsafe(`select to_jsonb(x) row from ${t.nspname}.${t.relname} x order by to_jsonb(x)::text`)));}return hash.digest('hex');
  };
  const rowsSnapshot=async()=>{
   const data:Record<string,unknown[]>={};for(const t of tables)data[t.nspname+'.'+t.relname]=await h.admin.unsafe(`select to_jsonb(x) row from ${t.nspname}.${t.relname} x order by to_jsonb(x)::text`);return data;
  };
  const initialRows=await rowsSnapshot();
  const before={classes:await classes(),functions:await functions(),policies:await policies(),constraints:await constraints(),rights:await rights(),data:await rowsHash()};
  const oldDefinition=(await h.admin`select pg_get_functiondef(p.oid) body from pg_proc p where p.oid in('crm_private.diagnostic_nodes(text,text,uuid)'::regprocedure,'crm_private.diagnostic_canonical_nodes(text,text,uuid)'::regprocedure,'crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)'::regprocedure) order by p.oid`).map(x=>x.body).join(';\n'),sql=await readFile(migration66,'utf8');
  const ordinary=await h.runtime.reserve();try{await assert.rejects(ordinary.unsafe(sql),/DIAGNOSTIC_MIGRATION_AUTHORITY_REQUIRED/);await ordinary.unsafe('rollback');}finally{ordinary.release();}
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')),/division by zero/);await h.migration.unsafe('rollback');
  assert.deepEqual(await functions(),before.functions);assert.deepEqual(await classes(),before.classes);assert.deepEqual(await policies(),before.policies);assert.deepEqual(await constraints(),before.constraints);assert.deepEqual(await rights(),before.rights);assert.equal(await rowsHash(),before.data);
  await h.migration.unsafe(sql);const after=await functions();assert.equal(after.length,before.functions.length);const changed=[];
  for(const old of before.functions){const now=after.find(x=>x.oid===old.oid)!;assert.ok(now);if(now.attributes.prosrc!==old.attributes.prosrc)changed.push(old.name);assert.deepEqual({...now.attributes,prosrc:old.attributes.prosrc},old.attributes);}
  assert.deepEqual(changed.sort(),['crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)','crm_private.diagnostic_nodes(text,text,uuid)','crm_private.diagnostic_canonical_nodes(text,text,uuid)'].sort());assert.deepEqual(await classes(),before.classes);assert.deepEqual(await policies(),before.policies);assert.deepEqual(await constraints(),before.constraints);assert.deepEqual(await rights(),before.rights);assert.equal(await rowsHash(),before.data);
  assert.equal((await h.diagnostic.read(await h.auth(),read,q)).nodes.some(n=>n.id===o.observationId),false);assert.ok((await h.diagnostic.read(await h.auth(),read,parentQuery)).nodes.some(n=>n.id===parentObservation.observationId));
  // Recovery experiment only in this disposable database: install the prior body,
  // observe its old limitation, then reapply the byte-identical candidate67.
  const beforeRecovery=await rowsHash();await h.migration.unsafe(oldDefinition);assert.deepEqual(await functions(),before.functions);assert.equal(await rowsHash(),beforeRecovery);
  assert.ok((await h.diagnostic.read(await h.auth(),read,q)).nodes.some(n=>n.id===o.observationId));assert.deepEqual((await h.diagnostic.read(await h.auth(),read,parentQuery)).nodes,[]);const beforeRetry=await rowsHash();await h.migration.unsafe(sql);assert.equal(await rowsHash(),beforeRetry);assert.equal((await h.diagnostic.read(await h.auth(),read,q)).nodes.some(n=>n.id===o.observationId),false);assert.ok((await h.diagnostic.read(await h.auth(),read,parentQuery)).nodes.some(n=>n.id===parentObservation.observationId));
  const afterReads=await rowsSnapshot(),changedByRead=[];
  for(const [table,rows]of Object.entries(initialRows)){
   if(JSON.stringify(rows)!==JSON.stringify(afterReads[table])){
    changedByRead.push(table);assert.equal(table,'crm_private.identification_epochs');
    const strip=(rs:unknown[])=>rs.map((x:any)=>{const{last_human_activity_at,...rest}=x.row;return rest;});assert.deepEqual(strip(afterReads[table]!),strip(rows));
   }
  }
  console.log('M01 legitimate post-read activity',JSON.stringify({changedByRead,onlyColumn:'last_human_activity_at',allDDLComparisonsExact:true}));
  const advisors=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--db-url','postgresql://crm_h0_migration@127.0.0.1:59965/h5017emig?sslmode=disable','--type','all','--fail-on','error','--output-format','json'],{encoding:'utf8',timeout:45000});assert.equal(advisors.status,0,advisors.stderr);assert.deepEqual(JSON.parse(advisors.stdout).results,[]);console.log('E advisors loopback',advisors.stdout);
  console.log('E-M01 independent67',JSON.stringify({tables:tables.length,classes:before.classes.length,functions:after.length,policies:before.policies.length,constraints:before.constraints.length,changed,newObjects:0,rowsHash:before.data,aclRlsUnchanged:true,ordinaryDDLRejected:true,abortedMigration:true,priorFunctionRecoveryAndForwardRetry:true}));
 }finally{await h.close();}
});
test('E-M02 new empty cluster installs through67 with API roles introduced afterwards, direct access and bypass denied',async()=>{
 const h=await thirdDatabase('h5017eclean',59966,true);
 try{
  await h.admin.unsafe('drop role anon;drop role authenticated');await h.migration.unsafe(await readFile(migration66,'utf8'));await h.admin.unsafe('create role anon login;create role authenticated login');
  const f=await workFixture(h);await f.run(f.definition);assert.ok((await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:f.context.contextId,pageSize:100})).nodes.some(n=>n.id===f.executionId));
  const rls=(await h.admin`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.b10_diagnostic_observations'::regclass`)[0]!;assert.equal(rls.relrowsecurity,true);assert.equal(rls.relforcerowsecurity,true);
  for(const role of ['anon','authenticated','crm_h0_runtime','crm_h0_ha_tx']){
   const db=h.connect(role);try{await assert.rejects(db.unsafe('select * from crm_private.b10_diagnostic_observations'));await assert.rejects(db.unsafe("select crm_private.diagnostic_nodes('synthetic','booking',null)"));}finally{await db.end({timeout:1});}
  }
  const owner=(await h.admin`select p.prosecdef,p.proconfig,r.rolsuper,r.rolbypassrls,r.rolcanlogin from pg_proc p join pg_roles r on r.oid=p.proowner where p.oid='crm_private.diagnostic_nodes(text,text,uuid)'::regprocedure`)[0]!;
  assert.equal(owner.prosecdef,false);for(const key of ['rolsuper','rolbypassrls','rolcanlogin'])assert.equal(owner[key],false);assert.deepEqual(owner.proconfig,['search_path=pg_catalog, pg_temp']);
  console.log('M02 clean67',JSON.stringify({newEmptyCluster:true,rolesAfterMigration:true,ordinaryDirectAttempts:8,denied:8,rls,owner}));
 }finally{await h.close();}
});
