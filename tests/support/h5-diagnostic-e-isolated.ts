import {readFile} from 'node:fs/promises';
import {isolatedDiagnosticsD,read,write,migration65,migration66} from './h5-diagnostic-d-isolated.ts';
export {read,write,migration65,migration66};
export const migration67='supabase/migrations/20261016220850_h5_diagnostic_owned_references.sql';
export async function isolatedDiagnosticsE(label:string,port:number,previous=false){
 const h=await isolatedDiagnosticsD(label,port);
 try{if(!previous)await h.migration.unsafe(await readFile(migration67,'utf8'));}catch(e){await h.close();throw e;}
 return h;
}
export {isolatedDiagnosticsE as thirdDatabase,isolatedDiagnosticsE as isolatedDiagnosticsD,isolatedDiagnosticsE as isolatedCorrectedDiagnostics,isolatedDiagnosticsE as auditDatabase,isolatedDiagnosticsE as isolatedDiagnostics};
