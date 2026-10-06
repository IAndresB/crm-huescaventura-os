import {readFile,readdir}from'node:fs/promises';import type postgres from'postgres';
export const f06Migration='20261006152658_h4_joint_funds_compatible_actor_admission.sql';
// Explicit adaptation: functional authority tests run against current49. Their
// predecessor V-MIG databases and original assertions remain at historical boundaries.
export async function applyF06Tail(target:postgres.Sql,bootstrap:postgres.Sql,after:string){
 for(const file of(await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')&&x>after&&x<=f06Migration).sort()){
  if(file.endsWith('_authorities.sql')){if(!(await bootstrap`select exists(select 1 from pg_roles where rolname='crm_h0_ha_tx') p`)[0]!.p)await bootstrap.unsafe(await readFile('supabase/migrations/'+file,'utf8'));}
  else await target.unsafe(await readFile('supabase/migrations/'+file,'utf8'));
 }
 console.log('F06 current authority chain applied through',f06Migration,'after historical boundary',after);
}
