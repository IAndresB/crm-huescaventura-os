import {readFile} from 'node:fs/promises';
import {createHash,randomUUID as id} from 'node:crypto';
import {isolatedDiagnosticsD,read,write} from './h5-diagnostic-d-isolated.ts';
import type {DiagnosticObservation,DiagnosticQuery,DiagnosticNode} from '../../src/domain/operation-diagnostic.ts';
import type {WorkContext} from '../../src/domain/persisted-work.ts';
import {workFixture} from './h5-work-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
export {read,write};
export const migration67='supabase/migrations/20261016220850_h5_diagnostic_owned_references.sql';
export async function fourthDatabase(label:string,port:number,previous=false){
 const h=await isolatedDiagnosticsD(label,port);
 try{const sql=await readFile(migration67);if(createHash('sha256').update(sql).digest('hex')!=='45ee62b013979f09b1145b6fa3ad096f88f676bc2170f48e245b7df2ca8c28a5')throw new Error('FOURTH_CANDIDATE_CHANGED');if(!previous)await h.migration.unsafe(sql.toString());}catch(e){await h.close();throw e;}
 return h;
}
export type FourthDatabase=Awaited<ReturnType<typeof fourthDatabase>>;
export const observation=(kind:DiagnosticObservation['contextKind'],root:string,operationId?:string,executionId?:string,eventId?:string):DiagnosticObservation=>({contextKind:kind,contextId:root,observationId:id(),requestRef:diagnosticReference(id()),...(operationId?{operationId}:{}),...(executionId?{executionId}:{}),...(eventId?{eventId}:{}),outcome:'pending',issues:[semanticIssue('E4','execution')]});
export async function all(h:FourthDatabase,q:DiagnosticQuery,auth=h.auth){
 const nodes:DiagnosticNode[]=[];let cursor:string|undefined;const cursors=new Set<string>();
 do{const p=await h.diagnostic.read(await auth(),read,{...q,...(cursor?{after:cursor}:{})});nodes.push(...p.nodes);cursor=p.next??undefined;if(cursor){if(cursors.has(cursor))throw new Error('FOURTH_REPEATED_CURSOR');cursors.add(cursor);}}while(cursor);
 if(new Set(nodes.map(n=>n.key)).size!==nodes.length)throw new Error('FOURTH_DUPLICATE_NODE');return nodes;
}
export async function revise(f:Awaited<ReturnType<typeof workFixture>>,context:WorkContext,version:number){
 const material={...f.material,content:'SYNTHETIC fourth authorized revision '+version},approval=await f.approve(material);
 const command={...f.definition,...f.base(),action:'revise' as const,context,version,material,...approval,affectedRefs:[context.recordId]};await f.run(command);return command;
}
export async function saved(h:FourthDatabase,o:DiagnosticObservation){return(await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]?.row;}
