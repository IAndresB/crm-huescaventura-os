import {errorCodes,semanticIssue,type ErrorCode,type SemanticIssue} from './semantic-error.ts';

export const diagnosticScopes=['request','access','operation','execution','event','evidence','dependency','identity','document','work'] as const;
export interface DiagnosticRoot {readonly contextKind:'booking'|'opportunity'|'contact'|'organization';readonly contextId:string}
export interface DiagnosticObservation extends DiagnosticRoot {
 readonly observationId:string;readonly requestRef:string;readonly operationId?:string;readonly executionId?:string;readonly eventId?:string;
 readonly outcome:'accepted'|'previous'|'pending'|'rejected';readonly issues:readonly SemanticIssue[];
}
export interface DiagnosticQuery extends DiagnosticRoot {readonly pageSize:number;readonly after?:string;readonly reference?:string}
export interface DiagnosticNode {readonly key:string;readonly source:string;readonly id:string;readonly references:readonly string[];readonly [field:string]:unknown}
export interface DiagnosticPage {readonly nodes:readonly DiagnosticNode[];readonly next:string|null;readonly technicalOnly:true}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export function validDiagnosticRoot(input:DiagnosticRoot):boolean{return ['booking','opportunity','contact','organization'].includes(input.contextKind)&&uuid.test(input.contextId);}
export function diagnosticIssues(input:readonly SemanticIssue[]):readonly SemanticIssue[]{
 return input.map(x=>{if(!errorCodes.includes(x.code))throw new Error('DIAGNOSTIC_INPUT_INVALID');return semanticIssue(x.code,diagnosticScopes.includes(x.affectedScope as typeof diagnosticScopes[number])?x.affectedScope:'operation');});
}
export function validateDiagnosticObservation(input:DiagnosticObservation):void{
 if(!validDiagnosticRoot(input)||!uuid.test(input.observationId)||!/^ref-[a-f0-9]{16}$/.test(input.requestRef)
  ||[input.operationId,input.executionId,input.eventId].some(x=>x!==undefined&&!uuid.test(x))
  ||!['accepted','previous','pending','rejected'].includes(input.outcome)
  ||!Array.isArray(input.issues)||input.issues.length>errorCodes.length)throw new Error('DIAGNOSTIC_INPUT_INVALID');
 diagnosticIssues(input.issues);
 if((input.outcome==='accepted'||input.outcome==='previous')&&input.issues.length)throw new Error('DIAGNOSTIC_INPUT_INVALID');
 if((input.outcome==='pending'||input.outcome==='rejected')&&!input.issues.length)throw new Error('DIAGNOSTIC_INPUT_INVALID');
 if(input.outcome==='rejected'&&input.issues.some(x=>x.code==='E4'))throw new Error('DIAGNOSTIC_INPUT_INVALID');
}
export function validateDiagnosticQuery(input:DiagnosticQuery):void{
 if(!validDiagnosticRoot(input)||!Number.isInteger(input.pageSize)||input.pageSize<1||input.pageSize>100
  ||(input.after!==undefined&&!/^[a-z0-9_]+\/[a-z0-9:-]+$/.test(input.after))
  ||(input.reference!==undefined&&!/^(?:[a-f0-9-]{36}|ref-[a-f0-9]{16})$/.test(input.reference)))throw new Error('DIAGNOSTIC_INPUT_INVALID');
}
