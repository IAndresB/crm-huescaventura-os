import {readFile} from 'node:fs/promises';
import {isolatedOwnEconomics,read,write} from './h3-own-economics-isolated.ts';
import {H4001RequirementAdapter} from '../../src/infrastructure/postgres/h4-requirement-adapter.ts';
export {read,write};
export const requirementMigration='20261004213420_h4_document_requirements.sql';
export const requirementTables=['b07_document_rules','b07_requirements','b07_requirement_operations','b07_requirement_revisions','b07_requirement_documents'];
export async function isolatedRequirement(label:string,port:number,upgrade=false){
 const h=await isolatedOwnEconomics(label,port);
 try{if(!upgrade)await h.migration.unsafe(await readFile(new URL('../../supabase/migrations/'+requirementMigration,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}
 return {...h,requirements:new H4001RequirementAdapter(h.runtime,h.f1,h.f2)};
}
