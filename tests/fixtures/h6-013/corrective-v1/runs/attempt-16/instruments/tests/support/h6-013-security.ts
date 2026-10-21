// Verification-only. Independent prior inventory; no product policy or migrations modified.
import assert from 'node:assert/strict';
import type postgres from 'postgres';
export interface Definer {
 signature:string;schema:string;owner:string;super:boolean;bypass:boolean;login:boolean;
 createRole:boolean;createDb:boolean;config:string[]|null;acl:string[]|null;
 ordinaryExecute:Record<string,boolean>;
}
export interface DefinerExpected {
 searchPath:string[];
 functions:{signature:string;schema:string;owner:string;ordinaryExecute:Record<string,boolean>}[];
}
export async function discoverDefiners(db:postgres.Sql|postgres.TransactionSql):Promise<Definer[]> {
 return [...await db.unsafe<Definer[]>(`select p.oid::regprocedure::text signature,n.nspname schema,r.rolname owner,
 r.rolsuper super,r.rolbypassrls bypass,r.rolcanlogin login,r.rolcreaterole "createRole",r.rolcreatedb "createDb",
 p.proconfig config,p.proacl::text[] acl,
 jsonb_build_object('runtime',has_function_privilege('crm_h0_runtime',p.oid,'EXECUTE'),
 'tte',has_function_privilege('crm_h0_ha_tx',p.oid,'EXECUTE'),'anon',has_function_privilege('anon',p.oid,'EXECUTE'),
 'authenticated',has_function_privilege('authenticated',p.oid,'EXECUTE')) "ordinaryExecute"
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_roles r on r.oid=p.proowner
 where p.prosecdef and n.nspname not like 'pg\\_%' escape '\\' and n.nspname<>'information_schema'
 order by p.oid::regprocedure::text`)];
}
export function verifyDefiners(actual:Definer[],expected:DefinerExpected):void {
 const identities=actual.map(f=>f.signature).sort();
 assert.equal(new Set(identities).size,identities.length,'DEFINER_DUPLICATE_IDENTITY');
 assert.deepEqual(identities,expected.functions.map(f=>f.signature).sort(),'DEFINER_INVENTORY_MISMATCH');
 for(const f of actual){
  const prior=expected.functions.find(p=>p.signature===f.signature)!;
  assert.equal(f.schema,prior.schema,'DEFINER_SCHEMA:'+f.signature);
  assert.equal(f.owner,prior.owner,'DEFINER_OWNER:'+f.signature);
  for(const property of ['super','bypass','login','createRole','createDb'] as const)
   assert.equal(f[property],false,'DEFINER_UNSAFE_OWNER:'+f.signature+':'+property);
  const settings=(f.config??[]).filter(c=>c.startsWith('search_path='));
  assert.equal(settings.length,1,'DEFINER_SEARCH_PATH_MISSING_OR_AMBIGUOUS:'+f.signature);
  const path=settings[0]!.slice('search_path='.length).split(',').map(s=>s.trim());
  assert.deepEqual(path,expected.searchPath,'DEFINER_SEARCH_PATH_UNSAFE:'+f.signature);
  assert.deepEqual(f.ordinaryExecute,prior.ordinaryExecute,'DEFINER_EXECUTE_PRIVILEGE:'+f.signature);
 }
}
