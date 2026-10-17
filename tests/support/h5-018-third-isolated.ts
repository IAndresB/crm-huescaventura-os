import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {isolatedCorrectedDiagnostics,read,write} from './h5-diagnostic-corrected-isolated.ts';
export {read,write};
export const migration66='supabase/migrations/20261016192425_h5_diagnostic_temporal_trace.sql';
export async function thirdDatabase(label:string,port:number,previous=false){
 const h=await isolatedCorrectedDiagnostics(label,port);
 try{
  const sql=await readFile(migration66);
  if(createHash('sha256').update(sql).digest('hex')!=='dff04069aac713b87cd07b82e69d7ca5811a9ef1290dd6599605dd1eced1600c')throw new Error('THIRD_CANDIDATE_MISMATCH');
  if(!previous)await h.migration.unsafe(sql.toString());
 }catch(e){await h.close();throw e;}
 return h;
}
export {thirdDatabase as isolatedCorrectedDiagnostics};
