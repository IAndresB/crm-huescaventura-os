// R19 supplementary executable V-MIG oracle: H2 cannot alter H0/H1 ACLs,
// policies, schema privileges or function definitions. Synthetic fresh cluster.
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {isolatedH2,h2Migration} from "./h2-isolated.ts";
const h=await isolatedH2("crm_h2_permissions",55464,true);
try {
 const snapshot=async()=>({
  relations:await h.observer`select n.nspname,c.relname,c.relacl::text,c.relowner::regrole::text,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('crm_private','crm_f1','crm_f2') and c.relkind in ('r','v','S') and c.relname not like 'b03_%' order by n.nspname,c.relname`,
  columns:await h.observer`select c.relname,a.attname,a.attacl::text from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='crm_private' and c.relname not like 'b03_%' and a.attnum>0 order by c.relname,a.attnum`,
  policies:await h.observer`select c.relname,p.polname,p.polroles::text,p.polcmd,p.polpermissive,pg_get_expr(p.polqual,p.polrelid) q,pg_get_expr(p.polwithcheck,p.polrelid) check_expr from pg_policy p join pg_class c on c.oid=p.polrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('crm_private','crm_f1','crm_f2') and c.relname not like 'b03_%' order by c.relname,p.polname`,
  functions:await h.observer`select n.nspname,p.proname,p.oid::regprocedure::text signature,p.proacl::text,p.proowner::regrole::text,md5(pg_get_functiondef(p.oid)) definition_digest from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('crm_api','crm_private','crm_f1','crm_f2') and p.proname not like 'b03_%' order by n.nspname,signature`,
  schemas:await h.observer`select nspname,nspacl::text from pg_namespace where nspname in ('crm_private','crm_api','crm_f1','crm_f2') order by nspname`,
  roles:await h.observer`select rolname,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb from pg_roles where rolname like 'crm_%' order by rolname`,
  membership:await h.observer`select roleid::regrole::text,member::regrole::text,admin_option,inherit_option,set_option from pg_auth_members order by roleid,member`
 });
 const before=await snapshot();await h.migration.unsafe(await readFile(join(import.meta.dirname,"../../supabase/migrations",h2Migration),"utf8"));
 const after=await snapshot();assert.deepEqual(after,before);
 console.log(JSON.stringify({case:"R19-permissions",expected:"H0/H1 relations, columns, policies, function definitions/ACL/owners, schemas, roles and memberships unchanged",observed:"identical",result:"PASS",relations:before.relations.length,policies:before.policies.length,functions:before.functions.length}));
} finally {await h.close();}
