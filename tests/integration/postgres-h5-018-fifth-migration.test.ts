import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fifthDatabase,migration68,observation,write,read} from '../support/h5-018-fifth-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
const targets=['crm_api.h5_diagnostic_read(bytea,bytea,bytea,bytea,bytea)','crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)','crm_private.diagnostic_canonical_nodes(text,text,uuid)'];
test('V08 populated67 all catalogs dependencies exact rows rollback recovery reapplication',async()=>{
 const h=await fifthDatabase('fifthmig',60302,true);
 try{
  const f=await workFixture(h);await f.run(f.definition);const o=observation('booking',f.context.contextId,{operationId:f.definition.operationId,executionId:f.executionId});await h.diagnostic.record(await h.auth(),write,o);
  const catalog=async()=>({
   functions:await h.admin`select p.oid::int id,p.oid::regprocedure::text signature,to_jsonb(p) attributes from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' order by p.oid`,
   relations:await h.admin`select to_jsonb(c) value from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' order by c.oid`,
   policies:await h.admin`select to_jsonb(p) value from pg_policy p order by oid`,
   constraints:await h.admin`select to_jsonb(c) value from pg_constraint c where connamespace in(select oid from pg_namespace where nspname like 'crm%') order by oid`,
   dependencies:await h.admin`select to_jsonb(d) value from pg_depend d where objid in(select oid from pg_proc where pronamespace in(select oid from pg_namespace where nspname like 'crm%')) order by to_jsonb(d)::text`,
   namespaces:await h.admin`select to_jsonb(n) value from pg_namespace n where nspname like 'crm%' order by oid`,
   defaults:await h.admin`select to_jsonb(d) value from pg_default_acl d order by oid`,
   roles:await h.admin`select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconfig from pg_roles order by rolname`,
   memberships:await h.admin`select to_jsonb(m) value from pg_auth_members m order by to_jsonb(m)::text`
  });
  const tables=await h.admin`select n.nspname,c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind='r' order by n.nspname,c.relname`;
  const rows=async()=>{const sum=createHash('sha256');for(const t of tables){sum.update(t.nspname+'.'+t.relname);sum.update(JSON.stringify(await h.admin.unsafe(`select to_jsonb(x) value from ${t.nspname}.${t.relname} x order by to_jsonb(x)::text`)));}return sum.digest('hex');};
  const before=await catalog(),data=await rows(),defs:string[]=[];for(const target of targets)defs.push((await h.admin`select pg_get_functiondef(${target}::regprocedure) definition`)[0]!.definition);
  const sql=await readFile(migration68,'utf8');const ordinary=await h.runtime.reserve();try{await assert.rejects(ordinary.unsafe(sql),/DIAGNOSTIC_MIGRATION_AUTHORITY_REQUIRED/);await ordinary.unsafe('rollback');}finally{ordinary.release();}
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')),/division by zero/);await h.migration.unsafe('rollback');assert.deepEqual(await catalog(),before);assert.equal(await rows(),data);
  await h.migration.unsafe(sql);const after=await catalog();assert.equal(after.functions.length,before.functions.length);const changed=[];
  for(const fn of before.functions){const current=after.functions.find(x=>x.id===fn.id);assert.ok(current);if(current.attributes.prosrc!==fn.attributes.prosrc)changed.push(fn.signature);assert.deepEqual({...current.attributes,prosrc:fn.attributes.prosrc},fn.attributes);}
  assert.deepEqual(changed.sort(),targets);assert.deepEqual({...after,functions:before.functions},before);assert.equal(await rows(),data);
  await h.migration.unsafe(defs.join(';\n'));assert.deepEqual(await catalog(),before);assert.equal(await rows(),data);await h.migration.unsafe(sql);assert.deepEqual(await catalog(),after);assert.equal(await rows(),data);
  assert.equal((await h.diagnostic.record(await h.auth(),write,o)).replayed,true);
  console.log('V08 upgrade',JSON.stringify({tables:tables.length,functions:before.functions.length,relations:before.relations.length,policies:before.policies.length,dependencies:before.dependencies.length,changed,dataSha256:data,rowsUnchanged:true,rollback:true,restoreReapply:true}));
 }finally{await h.close();}
});

test('V08 clean chain68 owners ACL RLS definer boundaries and direct access',async()=>{
 const h=await fifthDatabase('fifthclean',60303);
 try{
  const f=await workFixture(h);await f.run(f.definition);const o=observation('booking',f.context.contextId);await h.diagnostic.record(await h.auth(),write,o);assert.ok((await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:f.context.contextId,pageSize:100})).nodes.some(n=>n.id===o.observationId));
  for(const target of targets){const row=(await h.admin`select p.prosecdef,p.proconfig,p.proacl,r.rolname,r.rolsuper,r.rolbypassrls,r.rolcanlogin from pg_proc p join pg_roles r on r.oid=p.proowner where p.oid=${target}::regprocedure`)[0]!;assert.equal(row.prosecdef,target.startsWith('crm_api.'));assert.deepEqual(row.proconfig,['search_path=pg_catalog, pg_temp']);assert.equal(row.rolsuper,false);assert.equal(row.rolbypassrls,false);assert.equal(row.rolcanlogin,false);}
  const policy=(await h.admin`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.b10_diagnostic_observations'::regclass`)[0]!;assert.equal(policy.relrowsecurity,true);assert.equal(policy.relforcerowsecurity,true);
  let denied=0;for(const role of ['anon','authenticated','crm_h0_runtime','crm_h0_ha_tx']){const db=h.connect(role);try{for(const command of ["select * from crm_private.b10_diagnostic_observations","select crm_private.diagnostic_canonical_nodes('x','booking',null)","update crm_private.b10_diagnostic_observations set outcome='accepted'","set role crm_h0_migration"]){await assert.rejects(db.unsafe(command));denied++;}}finally{await db.end({timeout:1});}}
  console.log('V08 clean',JSON.stringify({chain:68,denied,rls:policy,ownersNoLoginNoBypass:true}));
 }finally{await h.close();}
});
