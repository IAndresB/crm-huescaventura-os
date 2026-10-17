import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {isolatedDiagnosticsF,migration68,observation,revise,saved,read,write} from '../support/h5-diagnostic-f-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';

const targets=['crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)','crm_private.diagnostic_canonical_nodes(text,text,uuid)'];
test('F-MIG independent populated67 catalog data aborted upgrade restore retry and privileges',async()=>{
 const h=await isolatedDiagnosticsF('fmig',60204,true);
 try{
  const a=await workFixture(h);await a.run(a.definition);
  const legitimate=observation('booking',a.context.contextId,a.definition.operationId,a.executionId);await h.diagnostic.record(await h.auth(),write,legitimate);
  const other=await communicationFixture(h),context={recordId:other.recordId,...other.context},middle=await revise(a,context,2);await revise(a,a.context,3);
  const bad=observation('booking',a.context.contextId,middle.operationId,a.executionId);await h.diagnostic.record(await h.auth(),write,bad);const original=await saved(h,bad);
  await revise(a,context,4);
  const sql=await readFile(migration68,'utf8');
  const snapshot=async()=>({functions:await h.admin`select p.oid::int oid,p.oid::regprocedure::text signature,to_jsonb(p) attrs from pg_proc p join pg_namespace n on p.pronamespace=n.oid where n.nspname like 'crm%' order by p.oid`,classes:await h.admin`select to_jsonb(c) row from pg_class c join pg_namespace n on c.relnamespace=n.oid where n.nspname like 'crm%' order by c.oid`,policies:await h.admin`select to_jsonb(x) row from pg_policy x order by oid`,constraints:await h.admin`select to_jsonb(x) row from pg_constraint x where connamespace in(select oid from pg_namespace where nspname like 'crm%') order by oid`,roles:await h.admin`select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconfig from pg_roles where rolname like 'crm%' or rolname in('anon','authenticated') order by rolname`});
  const tables=await h.admin`select n.nspname,c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind='r' order by n.nspname,c.relname`;
  const dataHash=async()=>{const hash=createHash('sha256');for(const t of tables){hash.update(t.nspname+'.'+t.relname);hash.update(JSON.stringify(await h.admin.unsafe(`select to_jsonb(x) row from ${t.nspname}.${t.relname} x order by to_jsonb(x)::text`)));}return hash.digest('hex');};
  const before=await snapshot(),rows=await dataHash(),bodies=[];
  for(const target of targets)bodies.push((await h.admin`select pg_get_functiondef(${target}::regprocedure) body`)[0]!.body);
  const ordinary=await h.runtime.reserve();try{await assert.rejects(ordinary.unsafe(sql),/DIAGNOSTIC_MIGRATION_AUTHORITY_REQUIRED/);await ordinary.unsafe('rollback');}finally{ordinary.release();}
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')),/division by zero/);await h.migration.unsafe('rollback');assert.deepEqual(await snapshot(),before);assert.equal(await dataHash(),rows);
  await h.migration.unsafe(sql);const after=await snapshot(),changed:string[]=[];assert.equal(after.functions.length,before.functions.length);
  for(const old of before.functions){const current=after.functions.find(x=>x.oid===old.oid)!;assert.ok(current);if(old.attrs.prosrc!==current.attrs.prosrc)changed.push(old.signature);assert.deepEqual({...current.attrs,prosrc:old.attrs.prosrc},old.attrs);}
  assert.deepEqual(changed.sort(),targets);assert.deepEqual({...after,functions:before.functions},before);assert.equal(await dataHash(),rows);
  await h.migration.unsafe(bodies.join(';\n'));assert.deepEqual(await snapshot(),before);assert.equal(await dataHash(),rows);
  await h.migration.unsafe(sql);assert.deepEqual(await snapshot(),after);assert.equal(await dataHash(),rows);
  const q={contextKind:'booking' as const,contextId:bad.contextId,reference:bad.requestRef,pageSize:100};assert.equal((await h.diagnostic.read(await h.auth(),read,q)).nodes.some(n=>n.id===bad.observationId),false);assert.deepEqual(await saved(h,bad),original);await assert.rejects(h.diagnostic.record(await h.auth(),write,bad),/DENIED/);assert.equal((await h.diagnostic.record(await h.auth(),write,legitimate)).replayed,true);
  const advisor=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--db-url','postgresql://crm_h0_migration@127.0.0.1:60204/fmig?sslmode=disable','--type','all','--fail-on','error'],{encoding:'utf8',timeout:45000});assert.equal(advisor.status,0,advisor.stderr);assert.deepEqual(JSON.parse(advisor.stdout).results,[]);
  console.log('F-MIG catalog',JSON.stringify({changed,tables:tables.length,relations:before.classes.length,functions:before.functions.length,policies:before.policies.length,constraints:before.constraints.length,dataSha256:rows,ddlDataChanges:0,otherCatalogChanges:0,abortedRollback:true,recoveredThenReapplied:true,advisors:JSON.parse(advisor.stdout)}));
 }finally{await h.close();}
});

test('F-MIG fresh cluster chain68 roles added afterwards and effective privilege denial',async()=>{
 const h=await isolatedDiagnosticsF('fclean',60205,true);
 try{
  await h.admin.unsafe('drop role anon;drop role authenticated');await h.migration.unsafe(await readFile(migration68,'utf8'));await h.admin.unsafe('create role anon login;create role authenticated login');
  const f=await workFixture(h);await f.run(f.definition);assert.ok((await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:f.context.contextId,pageSize:100})).nodes.some(n=>n.id===f.executionId));
  const table=(await h.admin`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.b10_diagnostic_observations'::regclass`)[0]!;assert.equal(table.relrowsecurity,true);assert.equal(table.relforcerowsecurity,true);
  for(const target of targets){const p=(await h.admin`select prosecdef,proconfig,r.rolsuper,r.rolbypassrls,r.rolcanlogin from pg_proc p join pg_roles r on r.oid=p.proowner where p.oid=${target}::regprocedure`)[0]!;assert.equal(p.prosecdef,target.startsWith('crm_api.'));assert.deepEqual(p.proconfig,['search_path=pg_catalog, pg_temp']);assert.equal(p.rolsuper,false);assert.equal(p.rolbypassrls,false);assert.equal(p.rolcanlogin,false);}
  let denied=0;for(const role of ['anon','authenticated','crm_h0_runtime','crm_h0_ha_tx']){const db=h.connect(role);try{for(const sql of ["select * from crm_private.b10_diagnostic_observations","select crm_private.diagnostic_nodes('synthetic','booking',null)","set role crm_h0_migration"]){await assert.rejects(db.unsafe(sql));denied++;}}finally{await db.end({timeout:1});}}
  console.log('F-MIG fresh',JSON.stringify({migrations:68,emptyCluster:true,apiRolesAfterMigration:true,directAttempts:denied,denied,rls:table}));
 }finally{await h.close();}
});
