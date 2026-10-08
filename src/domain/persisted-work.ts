import {canonicalTask} from './pending-task.ts';

export interface WorkContext {
 readonly recordId:string;readonly contextKind:string;readonly contextId:string;readonly purpose:string;
}
interface Command {readonly operationId:string;readonly executionId:string;readonly reason:string}
export type WorkCommand = Command & (
 | {readonly action:'define'|'revise';readonly definitionId:string;readonly version:number;readonly context:WorkContext;
    readonly proposalId:string;readonly decisionId:string;readonly material:unknown;
    readonly triggerRef:string;readonly inputsRef:string;readonly permissionsRef:string;readonly affectedRefs:readonly string[]}
 | {readonly action:'claim';readonly attemptId:string;readonly leaseUntil:string}
 | {readonly action:'renew';readonly attemptId:string;readonly generation:number;readonly leaseUntil:string}
 | {readonly action:'start';readonly attemptId:string;readonly generation:number;readonly material:unknown}
 | {readonly action:'recover'}
 | {readonly action:'result';readonly attemptId:string;readonly outcome:'succeeded'|'failed'|'uncertain';readonly resultRef:string}
 | {readonly action:'pause'|'stop'|'review'|'resume'}
 | {readonly action:'withdraw_approval';readonly proposalId:string;readonly decisionId:string}
 | {readonly action:'persistent_failure';readonly alertId:string;readonly urgency:'important'|'critical'}
);
export const canonicalWork=canonicalTask;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim()!==''&&v.length<=16384&&!v.includes('\0');
export function validateWork(command:WorkCommand):void {
 const fail=()=>{throw new Error('WORK_INPUT_INVALID');};
 if(!command||!uuid.test(command.operationId)||!uuid.test(command.executionId)||!text(command.reason))fail();
 const base=['action','operationId','executionId','reason'];
 const extra:Record<WorkCommand['action'],readonly string[]>={
  define:['definitionId','version','context','proposalId','decisionId','material','triggerRef','inputsRef','permissionsRef','affectedRefs'],
  revise:['definitionId','version','context','proposalId','decisionId','material','triggerRef','inputsRef','permissionsRef','affectedRefs'],
  claim:['attemptId','leaseUntil'],renew:['attemptId','generation','leaseUntil'],start:['attemptId','generation','material'],
  recover:[],result:['attemptId','outcome','resultRef'],pause:[],stop:[],review:[],resume:[],persistent_failure:['alertId','urgency'],withdraw_approval:['proposalId','decisionId']};
 const keys=extra[command.action];if(!keys||Object.keys(command).length!==base.length+keys.length||Object.keys(command).some(k=>![...base,...keys].includes(k)))fail();
 if('attemptId'in command&&!uuid.test(command.attemptId))fail();
 if('generation'in command&&(!Number.isSafeInteger(command.generation)||command.generation<1))fail();
 if('leaseUntil'in command&&(!text(command.leaseUntil)||!Number.isFinite(Date.parse(command.leaseUntil))||new Date(command.leaseUntil).toISOString()!==command.leaseUntil))fail();
 if(command.action==='define'||command.action==='revise'){
  if(!uuid.test(command.definitionId)||!Number.isSafeInteger(command.version)||command.version<1||
   ![command.triggerRef,command.inputsRef,command.permissionsRef,command.proposalId,command.decisionId].every(text)||
   !command.context||Object.keys(command.context).length!==4||!uuid.test(command.context.recordId)||!uuid.test(command.context.contextId)||
   ![command.context.contextKind,command.context.purpose].every(text)||!Array.isArray(command.affectedRefs)||!command.affectedRefs.length||!command.affectedRefs.every(text))fail();
 }
 if(command.action==='result'&&(!['succeeded','failed','uncertain'].includes(command.outcome)||!text(command.resultRef)))fail();
 if(command.action==='persistent_failure'&&(!uuid.test(command.alertId)||!['important','critical'].includes(command.urgency)))fail();
}
