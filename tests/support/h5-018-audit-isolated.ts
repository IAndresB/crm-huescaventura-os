import {readFile} from 'node:fs/promises';
import {isolatedJointClosures,read,write} from './h5-joint-closure-isolated.ts';
import {H5017DiagnosticAdapter} from '../../src/infrastructure/postgres/h5-diagnostic-adapter.ts';
export {read,write};
export const migration64='supabase/migrations/20261016142812_h5_protected_diagnostics.sql';
export async function auditDatabase(label:string,port:number,previous=false){
 const h=await isolatedJointClosures(label,port);
 try {if(!previous)await h.migration.unsafe(await readFile(migration64,'utf8'));}catch(e){await h.close();throw e;}
 return {...h,diagnostic:new H5017DiagnosticAdapter(h.runtime,h.f1,h.f2)};
}
