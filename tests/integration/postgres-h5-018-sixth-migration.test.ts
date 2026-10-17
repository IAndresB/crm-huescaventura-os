import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fifthDatabase,migration68,observation,write,read} from '../support/h5-018-fifth-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
const targets=['crm_api.h5_diagnostic_read(bytea,bytea,bytea,bytea,bytea)','crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)','crm_private.diagnostic_canonical_nodes(text,text,uuid)'];
const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
test('S6 V-MIG independently inventory populated67 rollback recover reapply68 with exact ACL and rows',async()=>{
 const h=await fifthDatabase('sixth_migration',60452,true);
 try{
  const f=await workFixture(h);await f.run(f.definition);const o=observation('booking',f.context.contextId,{operationId:f.definition.operationId,executionId:f.executionId});await h.diagnostic.record(await h.auth(),write,o);
  const schema=async()=>({
   functions:await h.admin`select p.oid::int id,p.oid::regprocedure::text signature,to_jsonb(p) data from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' order by p.oid`,
   relations:await h.admin`select to_jsonb(c) data from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' order by c.oid`,
   policies:await h.admin`select to_jsonb(x) data from pg_policy x order by oid`,
   constraints:await h.admin`select to_jsonb(x) data from pg_constraint x where connamespace in(select oid from pg_namespace where nspname like 'crm%') order by oid`,
   roles:await h.admin`select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconfig from pg_roles order by rolname`,
   memberships:await h.admin`select to_jsonb(x) data from pg_auth_members x order by to_jsonb(x)::text`,
   defaults:await h.admin`select to_jsonb(x) data from pg_default_acl x order by oid`,
   namespaces:await h.admin`select to_jsonb(x) data from pg_namespace x where nspname like 'crm%' order by oid`,
   dependencies:await h.admin`select to_jsonb(x) data from pg_depend x where objid in(select oid from pg_proc where pronamespace in(select oid from pg_namespace where nspname like 'crm%')) order by to_jsonb(x)::text`
  });
  const tables=await h.admin`select quote_ident(n.nspname)||'.'||quote_ident(c.relname) name from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind='r' order by n.nspname,c.relname`;
  const rows=async()=>{const result:Record<string,string>={};for(const table of tables)result[table.name]=sha(JSON.stringify(await h.admin.unsafe(`select to_jsonb(r) data from ${table.name} r order by to_jsonb(r)::text`)));return result;};
  const before=await schema(),data=await rows(),sql=await readFile(migration68,'utf8'),definitions=[];
  for(const name of targets)definitions.push((await h.admin`select pg_get_functiondef(${name}::regprocedure) definition`)[0]!.definition);
  await assert.rejects(h.migration.unsafe(sql.replace(/commit;\s*$/,'select 1/0;commit;')),/division by zero/);await h.migration.unsafe('rollback');assert.deepEqual(await schema(),before);assert.deepEqual(await rows(),data);
  await h.migration.unsafe(sql);const after=await schema(),changed=[];
  for(let i=0;i<before.functions.length;i++){const a=before.functions[i]!,b=after.functions[i]!;if(a.data.prosrc!==b.data.prosrc)changed.push(a.signature);assert.deepEqual({...b.data,prosrc:a.data.prosrc},a.data);}
  assert.equal(after.functions.length,before.functions.length);assert.deepEqual(changed.sort(),targets);assert.deepEqual({...after,functions:before.functions},before);assert.deepEqual(await rows(),data);
  await h.migration.unsafe(definitions.join(';\n'));assert.deepEqual(await schema(),before);assert.deepEqual(await rows(),data);
  await h.migration.unsafe(sql);assert.deepEqual(await schema(),after);assert.deepEqual(await rows(),data);assert.equal((await h.diagnostic.record(await h.auth(),write,o)).replayed,true);
  console.log('S6 migration '+JSON.stringify({migrations:68,tables:tables.length,functions:before.functions.length,policies:before.policies.length,relations:before.relations.length,dependencies:before.dependencies.length,changed,tableHashes:data,rollback:true,restoreReapply:true,aclOwnersRolesUnchanged:true}));
 }finally{await h.close();}
});
test('S6 V-DAT clean68 effective roles direct access history update and owner escalation denied',async()=>{
 const h=await fifthDatabase('sixth_security',60453);
 try{
  const f=await workFixture(h);await f.run(f.definition);const o=observation('booking',f.context.contextId);await h.diagnostic.record(await h.auth(),write,o);assert.ok((await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:f.context.contextId,pageSize:100})).nodes.some(n=>n.id===o.observationId));
  const rows=await h.admin`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.b10_diagnostic_observations'::regclass`;assert.deepEqual({...rows[0]},{relrowsecurity:true,relforcerowsecurity:true});
  const ownerRows=[];for(const target of targets){const p=(await h.admin`select prosecdef,proconfig,r.rolname,r.rolsuper,r.rolcanlogin,r.rolbypassrls from pg_proc p join pg_roles r on r.oid=p.proowner where p.oid=${target}::regprocedure`)[0]!;assert.equal(p.prosecdef,target.startsWith('crm_api.'));assert.deepEqual(p.proconfig,['search_path=pg_catalog, pg_temp']);assert.equal(p.rolsuper,false);assert.equal(p.rolcanlogin,false);assert.equal(p.rolbypassrls,false);ownerRows.push(p);}
  const before=await h.admin`select to_jsonb(r) data from crm_private.b10_diagnostic_observations r order by observation_id`;let denied=0;
  for(const role of ['anon','authenticated','crm_h0_runtime','crm_h0_ha_tx']){const c=h.connect(role);try{for(const sql of ["select * from crm_private.b10_diagnostic_observations","update crm_private.b10_diagnostic_observations set outcome='accepted'","delete from crm_private.b10_diagnostic_observations","select crm_private.diagnostic_canonical_nodes('synthetic','booking',null)","set role crm_h0_migration"]){await assert.rejects(c.unsafe(sql));denied++;}}finally{await c.end({timeout:1});}}
  assert.deepEqual(await h.admin`select to_jsonb(r) data from crm_private.b10_diagnostic_observations r order by observation_id`,before);
  console.log('S6 security '+JSON.stringify({chain:68,denied,owners:ownerRows,rls:true,forceRls:true,historyUnchanged:true}));
 }finally{await h.close();}
});
