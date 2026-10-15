// Security validation of the F01 function after migration59, separate from the
// historical tests whose setup intentionally stops at migration58.
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import {isolatedBoundaries} from "../support/h5-boundary-isolated.ts";

test("H5-012-F01 security: migrated59 ACL, function authority, current-night view and official advisors",async()=>{
 const h=await isolatedBoundaries("h512sec",59415);
 try{
  for(const name of ["20261014003559_h5_authorized_projections.sql","20261015172843_h5_calendar_current_nights.sql"]){await h.migration.unsafe(await readFile(`supabase/migrations/${name}`,"utf8"));}
  const meta=(await h.observer`select p.prosecdef,p.proconfig,r.rolname,r.rolsuper,r.rolbypassrls,r.rolcanlogin from pg_proc p join pg_roles r on r.oid=p.proowner where p.oid='crm_api.h5_projection_read(bytea,bytea,bytea,bytea,bytea)'::regprocedure`)[0]!;
  assert.equal(meta.prosecdef,true);assert.equal(meta.rolname,"crm_h0_f2_executor");
  assert.equal(meta.rolsuper,false);assert.equal(meta.rolbypassrls,false);assert.equal(meta.rolcanlogin,false);
  assert.ok(meta.proconfig.includes("search_path=pg_catalog, pg_temp"));
  assert.equal((await h.observer`select count(*)::int n from pg_proc p cross join lateral aclexplode(p.proacl) a where p.oid='crm_api.h5_projection_read(bytea,bytea,bytea,bytea,bytea)'::regprocedure and a.grantee=0`)[0]!.n,0);
  assert.equal((await h.observer`select count(*)::int n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='crm_private' and c.relkind='r' and (not c.relrowsecurity or not c.relforcerowsecurity)`)[0]!.n,0);
  for(const sql of ["select * from crm_private.b04_current_nights","delete from crm_private.b04_nights","select crm_api.h5_projection_read(null,null,null,null,null)"]){await assert.rejects(h.runtime.unsafe(sql));}
  const help=spawnSync("npx",["--yes","supabase@2.119.0","db","advisors","--help"],{encoding:"utf8",timeout:45000});assert.equal(help.status,0);assert.ok(help.stdout.includes("--db-url"));
  const check=spawnSync("npx",["--yes","supabase@2.119.0","db","advisors","--db-url","postgresql://crm_h0_migration@127.0.0.1:59415/h512sec?sslmode=disable","--type","all","--fail-on","error"],{encoding:"utf8",timeout:45000});
  assert.equal(check.status,0,check.stderr);assert.deepEqual(JSON.parse(check.stdout).results,[]);
  console.log("H512 F01 security",JSON.stringify({migration:59,ordinaryRuntimeDirectViewDenied:true,publicExecute:false,ownerBypassRls:false,privateTablesForceRls:true,advisors:JSON.parse(check.stdout)}));
 }finally{await h.close();}
});
