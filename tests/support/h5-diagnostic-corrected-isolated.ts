import {readFile} from 'node:fs/promises';
import {isolatedJointClosures,read,write} from './h5-joint-closure-isolated.ts';
import {H5017DiagnosticAdapter} from '../../src/infrastructure/postgres/h5-diagnostic-adapter.ts';
export {read,write};
export const migration65='supabase/migrations/20261016174248_h5_diagnostic_context_reference_fix.sql';
/** previous selects populated64 for migration65 testing; historical helpers are untouched. */
export async function isolatedCorrectedDiagnostics(label:string,port:number,previous=false){
 const h=await isolatedJointClosures(label,port);
 try{
  await h.migration.unsafe(await readFile('supabase/migrations/20261016142812_h5_protected_diagnostics.sql','utf8'));
  if(!previous)await h.migration.unsafe(await readFile(migration65,'utf8'));
 }catch(e){await h.close();throw e;}
 const diagnostic=new H5017DiagnosticAdapter(h.runtime,h.f1,h.f2);
 return {...h,diagnostic,diagnostics:diagnostic};
}
export {isolatedCorrectedDiagnostics as auditDatabase,isolatedCorrectedDiagnostics as isolatedDiagnostics};
