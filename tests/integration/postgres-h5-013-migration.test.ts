import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {isolatedClosures,closureMigration,read,write} from '../support/h5-closure-isolated.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
test('H5-013 N12 V-MIG: populated61 rollback/retry, existing catalogue and data, security/advisors',async()=>{
 const h=await isolatedClosures('h5013mig',59514,true);
 try{
  const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);
  const catalog=()=>h.observer`select p.oid,p.proname,p.proowner,p.proacl,p.proconfig,p.prosecdef,md5(pg_get_functiondef(p.oid)) body from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' and p.prokind='f' order by p.oid`;
  const tables=await h.observer`select schemaname,tablename from pg_tables where schemaname like 'crm%' order by schemaname,tablename`;
  const data=async()=>hash(await Promise.all(tables.map(async t=>({table:t.tablename,rows:await h.admin.unsafe(`select to_jsonb(x) value from ${t.schemaname}.${t.tablename} x order by to_jsonb(x)::text`)}))));
  const before=await catalog(),digest=await data(),sql=await readFile('supabase/migrations/'+closureMigration,'utf8');
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')));await h.migration.unsafe('rollback');
  assert.deepEqual(await catalog(),before);assert.equal(await data(),digest);
  await h.migration.unsafe(sql);const after=await catalog();assert.equal(await data(),digest);
  for(const old of before){const current=after.find(x=>x.oid===old.oid)!;assert.ok(current);if(old.proname==='booking_read'){assert.notEqual(current.body,old.body);assert.deepEqual({...current,body:old.body},old);}else assert.deepEqual(current,old);}
  assert.equal((await h.closures.read(await h.auth(),read,f.q.bookingId)).revision,0);
  for(const t of ['b06_closure_operations','b06_closure_assessments']){
   const meta=(await h.observer`select relrowsecurity,relforcerowsecurity from pg_class where oid=${'crm_private.'+t}::regclass`)[0]!;assert.equal(meta.relrowsecurity,true);assert.equal(meta.relforcerowsecurity,true);
   for(const role of ['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated'])assert.equal((await h.observer`select has_table_privilege(${role},${'crm_private.'+t},'select,insert,update,delete') allowed`)[0]!.allowed,false);
  }
  for(const name of ['closure_apply','closure_read']){
   const meta=(await h.observer`select p.prosecdef,p.proconfig,r.rolname,r.rolsuper,r.rolbypassrls,r.rolcanlogin from pg_proc p join pg_roles r on r.oid=p.proowner where p.oid=${'crm_api.'+name+'(bytea,bytea,bytea,bytea,bytea)'}::regprocedure`)[0]!;
   assert.equal(meta.prosecdef,true);assert.equal(meta.rolname,'crm_h0_f2_executor');assert.equal(meta.rolsuper,false);assert.equal(meta.rolbypassrls,false);assert.equal(meta.rolcanlogin,false);assert.ok(meta.proconfig.includes('search_path=pg_catalog, pg_temp'));
  }
  assert.equal((await h.observer`select count(*)::int n from pg_proc p join pg_namespace n on n.oid=p.pronamespace cross join lateral aclexplode(p.proacl) a where n.nspname in('crm_api','crm_private') and p.proname like 'closure_%' and a.grantee=0`)[0]!.n,0);
  const help=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--help'],{encoding:'utf8',timeout:45000});assert.equal(help.status,0);
  const advisors=spawnSync('npx',['--yes','supabase@2.119.0','db','advisors','--db-url','postgresql://crm_h0_migration@127.0.0.1:59514/h5013mig?sslmode=disable','--type','all','--fail-on','error'],{encoding:'utf8',timeout:45000});assert.equal(advisors.status,0,advisors.stderr);assert.deepEqual(JSON.parse(advisors.stdout).results,[]);
  console.log('H5013 migration',JSON.stringify({chain:(await readdir('supabase/migrations')).filter(n=>n.endsWith('.sql')).length,priorTablesPreserved:tables.length,priorFunctionsPreserved:before.length-1,intentionalBodyChange:'booking_read',rollback:true,retry:true,advisors:JSON.parse(advisors.stdout)}));
 }finally{await h.close();}
});
