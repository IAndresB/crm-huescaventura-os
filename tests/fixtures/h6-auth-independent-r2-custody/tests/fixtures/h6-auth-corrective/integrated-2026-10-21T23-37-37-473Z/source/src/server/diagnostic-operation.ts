import {randomUUID} from 'node:crypto';
import type {ApplicationResult} from '../application/result.ts';
import {semanticIssue} from '../domain/semantic-error.ts';
import {diagnosticIssues,type DiagnosticObservation,type DiagnosticRoot} from '../domain/operation-diagnostic.ts';
import {diagnosticReference,type DiagnosticSink} from './diagnostics.ts';

export interface OperationDiagnosticWriter {record(observation:DiagnosticObservation):Promise<unknown>}
/** Server composition supplies the writer already bound to current verified Auth.
 * No retry is performed. A recorder failure never changes the business result.
 * Successful technical observation is explicitly not a business attestation.
 */
export async function invokeDiagnosticOperation<T>(
 input:DiagnosticRoot&{readonly requestId:string;readonly operationId:string;readonly executionId?:string;readonly eventId?:string},
 writer:OperationDiagnosticWriter,invoke:()=>Promise<ApplicationResult<T>>,sink?:DiagnosticSink,
):Promise<{result:ApplicationResult<T>;requestRef:string;diagnosticRecorded:boolean}>{
 const requestRef=diagnosticReference(input.requestId);let result:ApplicationResult<T>;
 try{result=await invoke();}catch{result={status:'pending',issues:[semanticIssue('E4','operation')]};}
 // Never forward exception text, result.value, caller extra fields or issue prose.
 let issues=result.status==='rejected'||result.status==='pending'?diagnosticIssues(result.issues):[];
 if(result.status==='pending'||result.status==='rejected'){
  const status=issues.some(x=>x.code==='E4')?'pending':result.status;
  result={...result,status,issues};
 }
 const outcome=result.status==='applied'?'accepted':result.status;
 let diagnosticRecorded=false;
 try{await writer.record({contextKind:input.contextKind,contextId:input.contextId,observationId:randomUUID(),requestRef,
  operationId:input.operationId,...(input.executionId?{executionId:input.executionId}:{}),...(input.eventId?{eventId:input.eventId}:{}),outcome,issues});diagnosticRecorded=true;}catch{}
 if(sink)for(const code of issues.length?issues.map(x=>x.code):[undefined]){
  try{sink.record({requestId:requestRef,operationId:diagnosticReference(input.operationId),code,outcome});}catch{}
 }
 return {result,requestRef,diagnosticRecorded};
}
