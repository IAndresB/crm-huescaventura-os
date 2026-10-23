import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {isolatedJointClosures,jointMigration,read,write} from '../support/h5-joint-closure-isolated.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
import {closureCommands} from '../support/h5-closure-fixtures.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
test('H5-015 J09/J10 populated62 upgrade, rollback, retry, ACL/FORCE RLS and original records',async()=>{
 const h=await isolatedJointClosures('h5015migration',59536,true);
 try{
  const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);const c=await closureCommands(h,f.q.bookingId);
  const cc={documents:'not_applicable','final-terms':'satisfied',modifications:'not_applicable'} as const;
  await c.run(await c.command('commercial',cc));await c.run(await c.command('commercial',cc,{action:'evaluate'}));
  const tables=await h.observer`select schemaname,tablename from pg_tables where schemaname like 'crm%' order by schemaname,tablename`;
  const data=async()=>hash(await Promise.all(tables.map(async t=>({table:t.tablename,rows:await h.admin.unsafe(`select to_jsonb(x) value from ${t.schemaname}.${t.tablename} x order by to_jsonb(x)::text`)}))));
  const catalog=()=>h.observer`select p.oid,p.proname,p.proowner,p.proacl,p.proconfig,p.prosecdef,md5(pg_get_functiondef(p.oid)) body from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' and p.prokind='f' order by p.oid`;
  const before=await catalog(),digest=await data(),sql=await readFile('supabase/migrations/'+jointMigration,'utf8');
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')));await h.migration.unsafe('rollback');assert.deepEqual(await catalog(),before);assert.equal(await data(),digest);
  await h.migration.unsafe(sql);const after=await catalog();assert.equal(await data(),digest);
  const changed:string[]=[];for(const old of before){const current=after.find(x=>x.oid===old.oid)!;assert.ok(current);if(current.body!==old.body)changed.push(old.proname);assert.deepEqual({...current,body:old.body},old);}assert.deepEqual(changed.sort(),['closure_apply','closure_assess','closure_read_core']);
  assert.equal((await c.view()).jointClosure.current,false);assert.equal((await c.view()).assessments.commercial!.currentStatus,'Resuelto');
  for(const t of ['b06_joint_closures','b06_closure_invalidations']){
   const m=(await h.observer`select relrowsecurity,relforcerowsecurity from pg_class where oid=${'crm_private.'+t}::regclass`)[0]!;assert.equal(m.relrowsecurity,true);assert.equal(m.relforcerowsecurity,true);
   for(const role of ['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated'])for(const perm of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE'])assert.equal((await h.observer`select has_table_privilege(${role},${'crm_private.'+t},${perm}) ok`)[0]!.ok,false);
  }
  const fs=await h.observer`select p.oid::regprocedure::text signature,p.proconfig,p.prosecdef,r.rolsuper,r.rolbypassrls,r.rolcanlogin from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_roles r on r.oid=p.proowner where n.nspname in('crm_private','crm_api') and p.proname like 'closure_%'`;
  for(const f of fs){assert.equal(f.rolsuper,false);assert.equal(f.rolbypassrls,false);assert.equal(f.rolcanlogin,false);assert.ok(f.proconfig.includes('search_path=pg_catalog, pg_temp'));for(const role of ['anon','authenticated','crm_h0_ha_tx'])assert.equal((await h.observer`select has_function_privilege(${role},${f.signature},'EXECUTE') ok`)[0]!.ok,false);}
  const uncovered=await h.observer`select tgrelid::regclass::text t from pg_trigger where tgfoid in('crm_private.booking_preparation_writer()'::regprocedure,'crm_private.closure_writer()'::regprocedure)except select tgrelid::regclass::text from pg_trigger where tgname='closure_material_invalidation'`;
  assert.deepEqual(Array.from(uncovered),[]);
  const triggers=await h.observer`select tgrelid::regclass::text t,tgdeferrable,tginitdeferred from pg_trigger where tgname='closure_material_invalidation'order by 1`;assert.ok(triggers.length>30);assert.ok(triggers.every(t=>t.tgdeferrable&&t.tginitdeferred));
  for(const query of ['select * from crm_private.b06_joint_closures','select * from crm_private.b06_closure_invalidations','select crm_private.closure_invalidate(null,null)','select crm_api.closure_joint_apply(null,null,null,null,null)'])await assert.rejects(h.runtime.unsafe(query));
  const help=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--help'],{encoding:'utf8',timeout:45000});assert.equal(help.status,0);
  const advisors=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--db-url','postgresql://crm_h0_migration@127.0.0.1:59536/h5015migration?sslmode=disable','--type','all','--fail-on','error','--output-format','json'],{encoding:'utf8',timeout:45000});assert.equal(advisors.status,0,advisors.stderr);assert.deepEqual(JSON.parse(advisors.stdout).results,[]);console.log('H5015 advisors',advisors.stdout);
  console.log('H5015 migration and security',JSON.stringify({chain:(await readdir('supabase/migrations')).filter(n=>n.endsWith('.sql')).length,oldTables:tables.length,oldFunctions:before.length,changed,rollback:true,retry:true,triggers,functions:fs}));
 }finally{await h.close();}
});
test('H5-015 J09 authorized evidence, identity/scope/session, immutable history and no direct DML',async()=>{
 const h=await isolatedJointClosures('h5015security',59537);
 try{
  const f=await jointFixture(h),j=f.j,q=await j.command(),before=await j.c.view();
  await assert.rejects(h.closures.close({} as never,write,q),/AUTH_REQUIRED/);await assert.rejects(h.closures.close(await h.auth(),read,q),/AUTH_REQUIRED/);
  await assert.rejects(j.run({...q,evidenceId:'00000000-0000-0000-0000-000000000000'}),/EVIDENCE_REQUIRED/);
  await assert.rejects(j.run({...q,bookingId:'00000000-0000-0000-0000-000000000000'}),/DENIED/);assert.deepEqual(await j.c.view(),before);
  await j.run(q);const closed=await j.c.view();
  for(const table of ['b06_joint_closures','b06_closure_assessments','b06_closure_operations'])for(const action of ['update','delete'])await assert.rejects(h.admin.unsafe(action==='update'?`update crm_private.${table} set admin_scope=admin_scope where booking_id=$1`:`delete from crm_private.${table} where booking_id=$1`,[q.bookingId]));
  assert.deepEqual(await j.c.view(),closed);
  const auth=await h.auth();await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,false,'ready')`;try{await assert.rejects(h.closures.close(auth,write,q));await assert.rejects(h.closures.read(auth,read,q.bookingId));}finally{await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,true,'ready')`;}
 }finally{await h.close();}
});
