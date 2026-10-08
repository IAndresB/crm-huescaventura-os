import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {isolatedWork,workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';

const boundaryMigration='supabase/migrations/20261008192000_h5_external_event_receipts.sql';
async function catalog(h:Awaited<ReturnType<typeof isolatedWork>>){return {
 tables:Array.from(await h.observer`select c.oid,c.relname,c.relowner,c.relacl,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind in ('r','p') order by c.oid`),
 functions:Array.from(await h.observer`select p.oid,p.proname,p.proowner,p.proacl,p.proconfig,p.prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' order by p.oid`),
 policies:Array.from(await h.observer`select oid,polrelid,polname,polroles,polqual::text,polwithcheck::text from pg_policy order by oid`),
 roles:Array.from(await h.observer`select oid,rolname,rolsuper,rolcanlogin,rolbypassrls,rolcreaterole,rolcreatedb from pg_roles order by oid`)};}
async function data(h:Awaited<ReturnType<typeof isolatedWork>>,tables:string[]){const out:Record<string,unknown>={};for(const table of tables)out[table]=Array.from(await h.admin.unsafe(`select to_jsonb(x) value from ${table} x order by to_jsonb(x)::text`));return out;}

test('H5-009 V-MIG fresh delta, populated 56-to-57 upgrade, DDL rollback and retry',async()=>{
 const fresh=await isolatedWork('crm_h5009_migfresh',59115);
 try{
  const before=await catalog(fresh),sql=await readFile(boundaryMigration,'utf8');
  await assert.rejects(fresh.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')));
  await fresh.migration.unsafe('rollback');assert.deepEqual(await catalog(fresh),before);
  assert.equal((await fresh.observer`select to_regclass('crm_private.b09_event_receipts') is not null present`)[0]!.present,false);
  await fresh.migration.unsafe(sql);
  for(const table of ['b09_external_event_keys','b09_event_receipts']){
   const row=(await fresh.observer.unsafe(`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.${table}'::regclass`))[0]!;
   assert.equal(row.relrowsecurity,true);assert.equal(row.relforcerowsecurity,true);
  }
 }finally{await fresh.close();}

 const upgrade=await isolatedWork('crm_h5009_migupgrade',59116);
 try{
  const comm=await communicationFixture(upgrade,'incoming');
  const work=await workFixture(upgrade);await work.run(work.definition);const claim=work.claim(),claimed=await work.run(claim);await work.run(work.start(claim,claimed.generation!));
  const tables=(await upgrade.observer`select schemaname,tablename from pg_tables where schemaname in ('crm_private','crm_ha')`).map(x=>x.schemaname+'.'+x.tablename),beforeData=await data(upgrade,tables),beforeCatalog=await catalog(upgrade);
  const sql=await readFile(boundaryMigration,'utf8');
  await assert.rejects(upgrade.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')));
  await upgrade.migration.unsafe('rollback');assert.deepEqual(await data(upgrade,tables),beforeData);assert.deepEqual(await catalog(upgrade),beforeCatalog);
  assert.equal((await upgrade.observer`select to_regclass('crm_private.b09_event_receipts') is not null present`)[0]!.present,false);
  await upgrade.migration.unsafe(sql);
  assert.deepEqual(await data(upgrade,tables),beforeData);
  const current=await catalog(upgrade),knownTables=new Set(beforeCatalog.tables.map(x=>x.oid));
  assert.deepEqual(current.tables.filter(x=>knownTables.has(x.oid)),beforeCatalog.tables);
  const knownFunctions=new Set(beforeCatalog.functions.map(x=>x.oid));
  assert.deepEqual(current.functions.filter(x=>knownFunctions.has(x.oid)),beforeCatalog.functions);
  assert.deepEqual(current.roles,beforeCatalog.roles);
  assert.equal((await upgrade.observer`select count(*)::int n from crm_private.b07_records where record_id=${comm.recordId}::uuid`)[0]!.n,1);
  assert.equal((await work.see())!.parts[0]!.state,'contacted');
 }finally{await upgrade.close();}
});
