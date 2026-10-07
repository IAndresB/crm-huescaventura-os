import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {canonicalTask} from "../../domain/pending-task.ts";
import {H1017TaskAdapter,type TaskCommand,type PendingTask} from "./h1-task-adapter.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";

export type TaskTransition = Readonly<{
 action:"complete"|"cancel"|"reopen";operationId:string;taskId:string;
 expectedRevision:number;reason:string;result?:string;references?:readonly string[];reviewEvidenceRef?:string;
}>;
export type BusinessTask = Omit<PendingTask,"state"> & Readonly<{
 state:"pending"|"completed"|"cancelled";
 last_closure:Readonly<Record<string,unknown>>|null;
}>;
type Result={id:string;replayed:boolean};

/** H5 extends the H1 Task contract without changing H1/H4 consumers. */
export class H5001TaskAdapter {
 private readonly sql:PostgresSql;
 private readonly earlier:H1017TaskAdapter;
 private readonly f1:ReturnType<typeof createF1Issuer>;
 private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration) {
  this.sql=sql;
  this.earlier=new H1017TaskAdapter(sql,f1,f2);
  this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);
 }
 apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:TaskCommand):Promise<Result> {
  return this.earlier.apply(auth,interaction,input);
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,taskId:string,
  contextKind:string,contextId:string):Promise<BusinessTask|null> {
  return await this.earlier.read(auth,interaction,taskId,contextKind,contextId) as BusinessTask|null;
 }
 async transition(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:TaskTransition):Promise<Result> {
  const allowed=["action","operationId","taskId","expectedRevision","reason","result","references","reviewEvidenceRef"];
  if(!Object.keys(input).every(k=>allowed.includes(k))||
   !["complete","cancel","reopen"].includes(input.action)||
   !Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<1||
   !input.reason?.trim()||![input.taskId,input.operationId].every(id=>/^[0-9a-f-]{36}$/.test(id)))
   throw new Error("TASK_INPUT_INVALID");
  if(input.action==="complete") {
   if(!input.result?.trim()||!input.references?.length||
    input.references.some(ref=>!ref.trim())||input.reviewEvidenceRef!==undefined)
    throw new Error("TASK_COMPLETION_EVIDENCE_REQUIRED");
  } else if(input.action==="cancel") {
   if(input.result!==undefined||input.references!==undefined||input.reviewEvidenceRef!==undefined)
    throw new Error("TASK_INPUT_INVALID");
  } else if(!input.reviewEvidenceRef?.trim()||input.result!==undefined||input.references!==undefined)
   throw new Error("TASK_REVIEW_EVIDENCE_REQUIRED");
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||
   !isVerifiedServerInteraction(interaction,"interactive_action")) throw new Error("TASK_AUTH_REQUIRED");
  try {
   return await this.sql.begin("isolation level read committed",async tx=>{
    const lookup=await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>(
     "select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",
     [auth.subject,auth.sessionId!]);
    const row=lookup[0];if(!row?.epoch_id) throw new Error("TASK_DENIED");
    const binding=await postgresF1Binding(tx);
    const q=encodeF1Fields(["CRM-H1-TASK-1",canonicalTask({...input,purpose:"pending-followup"})]);
    const human=this.f2(auth,{actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,
     sessionId:auth.sessionId!,epochId:row.epoch_id},binding,"evidence_write",q,interaction);
    const context=issueTrustedContext({identityId:"h5-task-server",identityKind:"technical",purpose:"h1-evidence",
     scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
    const technical=this.f1(context,binding,"C03",q,{resource:"evidence",action:"write_evidence"});
    const rows=await tx.unsafe<{result_ref:string;replayed:boolean}[]>(
     "select result_ref::text,replayed from crm_api.b07_task_apply($1,$2,$3,$4,$5)",
     [human.payload,human.mac,technical.payload,technical.mac,q]);
    return {id:rows[0]!.result_ref,replayed:rows[0]!.replayed};
   });
  } catch(error) {
   const message=error instanceof Error?error.message:"";
   if(/^TASK_[A-Z_]+$/.test(message)) throw new Error(message);
   throw new Error("TASK_DENIED");
  }
 }
}
