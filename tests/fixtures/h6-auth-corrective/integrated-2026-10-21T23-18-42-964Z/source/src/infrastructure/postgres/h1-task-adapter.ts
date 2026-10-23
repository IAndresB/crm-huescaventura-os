import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";
import {canonicalTask,validateTask,type TaskIdentity,type TaskMaterial} from "../../domain/pending-task.ts";

export interface TaskCommand {
 readonly action:"receive"|"update";readonly operationId:string;readonly taskId:string;
 readonly expectedRevision:number;readonly identity:TaskIdentity;readonly material:TaskMaterial;readonly reason:string;
}
export interface PendingTask {
 readonly task_id:string;readonly responsible_actor:string;readonly state:"pending";
 readonly revision:number;readonly identity:TaskIdentity;readonly material:TaskMaterial;
 readonly created_at:string;readonly updated_at:string;
}
type Result={id:string;replayed:boolean};
export class H1017TaskAdapter {
 private readonly sql:PostgresSql;
 private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration) {
  this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);
 }
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,
  write:boolean,input:Record<string,unknown>):Promise<unknown> {
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||
   !isVerifiedServerInteraction(interaction,write?"interactive_action":"interactive_read")) throw new Error("TASK_AUTH_REQUIRED");
  try {
   return await this.sql.begin("isolation level read committed",async tx=>{
    const lookup=await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>(
     "select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",
     [auth.subject,auth.sessionId!]);
    const row=lookup[0];if(!row?.epoch_id) throw new Error("TASK_DENIED");
    const binding=await postgresF1Binding(tx);
    const q=encodeF1Fields([write?"CRM-H1-TASK-1":"CRM-H1-TASK-READ1",canonicalTask(input)]);
    const human=this.f2(auth,{actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,
     sessionId:auth.sessionId!,epochId:row.epoch_id},binding,write?"evidence_write":"evidence_read",q,interaction);
    const context=issueTrustedContext({identityId:"h1-task-server",identityKind:"technical",purpose:"h1-evidence",
     scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
    const technical=this.f1(context,binding,write?"C03":"C01",q,
     {resource:"evidence",action:write?"write_evidence":"read_evidence"});
    const args=[human.payload,human.mac,technical.payload,technical.mac,q];
    if(write) {
     const rows=await tx.unsafe<{result_ref:string;replayed:boolean}[]>(
      "select result_ref::text,replayed from crm_api.b07_task_apply($1,$2,$3,$4,$5)",args);
     return {id:rows[0]?.result_ref,replayed:rows[0]?.replayed};
    }
    const rows=await tx.unsafe<{data:unknown}[]>("select crm_api.b07_task_read($1,$2,$3,$4,$5) data",args);
    return rows[0]?.data??null;
   });
  } catch(error) {
   const message=error instanceof Error?error.message:"";
   if(/^TASK_[A-Z_]+$/.test(message)) throw new Error(message);
   throw new Error("TASK_DENIED");
  }
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:TaskCommand):Promise<Result> {
  validateTask(input.identity,input.material);
  if(!Object.keys(input).every(k=>["action","operationId","taskId","expectedRevision","identity","material","reason"].includes(k))||
   !["receive","update"].includes(input.action)||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0||
   !input.reason||![input.taskId,input.operationId].every(id=>/^[0-9a-f-]{36}$/.test(id))) throw new Error("TASK_INPUT_INVALID");
  return await this.call(auth,interaction,true,{...input,purpose:"pending-followup"}) as Result;
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,taskId:string,
  contextKind:string,contextId:string,purpose="pending-followup"):Promise<PendingTask|null> {
  return await this.call(auth,interaction,false,{taskId,contextKind,contextId,purpose}) as PendingTask|null;
 }
}
