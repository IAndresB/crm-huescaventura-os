import {readFile} from 'node:fs/promises';
import {isolatedJointClosures,read,write} from './h5-joint-closure-isolated.ts';
import {H5017DiagnosticAdapter} from '../../src/infrastructure/postgres/h5-diagnostic-adapter.ts';
export {read,write};
export const diagnosticMigration='20261016142812_h5_protected_diagnostics.sql';
export async function isolatedDiagnostics(label:string,port:number,previous=false){
 const h=await isolatedJointClosures(label,port);
 try{if(!previous)await h.migration.unsafe(await readFile('supabase/migrations/'+diagnosticMigration,'utf8'));}catch(e){await h.close();throw e;}
 return {...h,diagnostics:new H5017DiagnosticAdapter(h.runtime,h.f1,h.f2)};
}
