import {readFile} from 'node:fs/promises';
import {createHash,randomUUID as id} from 'node:crypto';
import {isolatedJointClosures,read,write} from './h5-joint-closure-isolated.ts';
import {H5017DiagnosticAdapter} from '../../src/infrastructure/postgres/h5-diagnostic-adapter.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import type {DiagnosticObservation,DiagnosticQuery,DiagnosticNode} from '../../src/domain/operation-diagnostic.ts';
import type {WorkContext} from '../../src/domain/persisted-work.ts';
import {workFixture} from './h5-work-isolated.ts';
export {read,write};
export const migration68='supabase/migrations/20261017004525_h5_diagnostic_version_provenance_replay.sql';
const migrations=['20261016142812_h5_protected_diagnostics.sql','20261016174248_h5_diagnostic_context_reference_fix.sql','20261016192425_h5_diagnostic_temporal_trace.sql','20261016220850_h5_diagnostic_owned_references.sql','20261017004525_h5_diagnostic_version_provenance_replay.sql'];
export async function fifthDatabase(label:string,port:number,previous=false){
 const h=await isolatedJointClosures(label,port);
 try{for(const name of migrations.slice(0,previous?4:5)){const sql=await readFile('supabase/migrations/'+name);if(name===migrations[4]){if(createHash('sha256').update(sql).digest('hex')!=='69f8bdddb1acd5fbef1d2154ae81d16a6ecc1a0f5ed34783a99c11dbb83e9563')throw new Error('AUDIT_CANDIDATE_MISMATCH');}await h.migration.unsafe(sql.toString());}}catch(e){await h.close();throw e;}
 return {...h,diagnostic:new H5017DiagnosticAdapter(h.runtime,h.f1,h.f2)};
}
export type Fifth=Awaited<ReturnType<typeof fifthDatabase>>;
export function observation(contextKind:DiagnosticObservation['contextKind'],contextId:string,refs:Partial<DiagnosticObservation>={}):DiagnosticObservation{return {contextKind,contextId,observationId:id(),requestRef:diagnosticReference(id()),outcome:'pending',issues:[semanticIssue('E4','execution')],...refs};}
export async function pages(h:Fifth,q:DiagnosticQuery){const result:DiagnosticNode[]=[];const seen=new Set<string>();let after:string|undefined;do{const p=await h.diagnostic.read(await h.auth(),read,{...q,...(after?{after}:{})});result.push(...p.nodes);after=p.next??undefined;if(after){if(seen.has(after))throw new Error('AUDIT_CURSOR_LOOP');seen.add(after);}}while(after);if(new Set(result.map(n=>n.key)).size!==result.length)throw new Error('AUDIT_DUPLICATE_NODES');return result;}
export async function revision(f:Awaited<ReturnType<typeof workFixture>>,context:WorkContext,version:number){const material={...f.material,content:'SYNTHETIC fifth revision '+version},approval=await f.approve(material),command={...f.definition,...f.base(),action:'revise' as const,context,version,material,...approval,affectedRefs:[context.recordId]};await f.run(command);return command;}
export async function persisted(h:Fifth){return {observations:await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x order by observation_id`,operations:await h.observer`select to_jsonb(x) row from crm_private.b07_operations x order by operation_id`,history:await h.observer`select to_jsonb(x) row from crm_private.b07_history x order by history_id`};}
