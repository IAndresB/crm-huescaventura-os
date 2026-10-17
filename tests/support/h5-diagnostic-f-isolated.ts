import {readFile} from 'node:fs/promises';
import {isolatedDiagnosticsE} from './h5-diagnostic-e-isolated.ts';
export {read,write,migration65,migration66,migration67} from './h5-diagnostic-e-isolated.ts';
export {all,observation,revise,saved} from './h5-018-fourth-isolated.ts';
export const migration68='supabase/migrations/20261017004525_h5_diagnostic_version_provenance_replay.sql';
export async function isolatedDiagnosticsF(label:string,port:number,previous=false){
 const h=await isolatedDiagnosticsE(label,port);
 try{if(!previous)await h.migration.unsafe(await readFile(migration68,'utf8'));}catch(e){await h.close();throw e;}
 return h;
}
export {isolatedDiagnosticsF as fourthDatabase,isolatedDiagnosticsF as thirdDatabase,isolatedDiagnosticsF as isolatedDiagnosticsE,isolatedDiagnosticsF as isolatedDiagnosticsD,isolatedDiagnosticsF as isolatedCorrectedDiagnostics,isolatedDiagnosticsF as auditDatabase,isolatedDiagnosticsF as isolatedDiagnostics};
