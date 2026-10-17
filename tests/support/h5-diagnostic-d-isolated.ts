import {readFile} from 'node:fs/promises';
import {isolatedCorrectedDiagnostics,read,write,migration65} from './h5-diagnostic-corrected-isolated.ts';
export {read,write,migration65};
export const migration66='supabase/migrations/20261016192425_h5_diagnostic_temporal_trace.sql';
export async function isolatedDiagnosticsD(label:string,port:number,previous=false){
 const h=await isolatedCorrectedDiagnostics(label,port);
 try{if(!previous)await h.migration.unsafe(await readFile(migration66,'utf8'));}catch(e){await h.close();throw e;}
 return h;
}
export {isolatedDiagnosticsD as isolatedCorrectedDiagnostics,isolatedDiagnosticsD as auditDatabase,isolatedDiagnosticsD as isolatedDiagnostics};
