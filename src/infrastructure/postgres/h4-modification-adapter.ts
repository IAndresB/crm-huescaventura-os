import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {canonicalCommercial} from "../../domain/commercial-progress.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";
import type {ModificationCommand,ModificationView,ModificationAssessment} from '../../domain/operational-modification.ts';
export type {ModificationCommand,ModificationView};
export class H4011ModificationAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:Record<string,unknown>):Promise<unknown>{
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?"interactive_action":"interactive_read")) throw new Error("MODIFICATION_AUTH_REQUIRED");
  const mutation=write;
  try{return await this.sql.begin("isolation level read committed",async tx=>{
   const row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>("select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]))[0];if(!row?.epoch_id) throw new Error("MODIFICATION_DENIED");
   const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
   const q=encodeF1Fields([mutation?"CRM-H4-MODIFICATION1":"CRM-H4-MODIFICATION-READ1",canonicalCommercial(input)]);
   const context=issueTrustedContext({identityId:"h4-modification-server",identityKind:"technical",purpose:"h1-evidence",scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
   const h=this.f2(auth,identity,binding,mutation?"evidence_write":"evidence_read",q,interaction),t=this.f1(context,binding,mutation?"C03":"C01",q,{resource:"evidence",action:mutation?"write_evidence":"read_evidence"});
   if(!mutation)return (await tx.unsafe<{data:unknown}[]>("select crm_api.modification_read($1,$2,$3,$4,$5) data",[h.payload,h.mac,t.payload,t.mac,q]))[0]?.data;
   const task={action:"receive",operationId:String(input.operationId),taskId:String(input.modificationId),expectedRevision:0,purpose:"pending-followup",identity:{causeKind:"block",causeId:String(input.modificationId),contextKind:"booking",contextId:String(input.bookingId),scopeRef:String(input.modificationId),effect:"modification-review"},material:{title:"Revisar modificación operativa por alcance",deadline:{kind:"unknown",reason:"No consta fecha fijada para el seguimiento"},priority:{kind:"pending",reason:"Prioridad no configurada"},sourceRef:"SM-MO",sourceVersion:"1",triggerRef:"BR-TASK-005",triggerVersion:"1"},reason:"Seguimiento de modificación por alcance"};
   const cq=encodeF1Fields(["CRM-H1-TASK-1",canonicalCommercial(task)]);
   const ch=this.f2(auth,identity,binding,"evidence_write",cq,interaction),ct=this.f1(context,binding,"C03",cq,{resource:"evidence",action:"write_evidence"});
   return (await tx.unsafe<{data:unknown}[]>("select crm_api.modification_apply($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) data",[h.payload,h.mac,t.payload,t.mac,q,ch.payload,ch.mac,ct.payload,ct.mac,cq]))[0]?.data;
  });}catch(e){const m=e instanceof Error?e.message:"";throw new Error(/^MODIFICATION_[A-Z_]+(?::[A-Za-z0-9_,:./ -]+)?$/.test(m)?m:"MODIFICATION_DENIED");}
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:ModificationCommand):Promise<{id:string;replayed:boolean;result:ModificationView}>{
  return await this.call(auth,interaction,true,Object.fromEntries(Object.entries(input).filter(([,v])=>v!==undefined))) as {id:string;replayed:boolean;result:ModificationView};
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,modificationId:string,bookingId:string):Promise<ModificationView|null>{return await this.call(auth,interaction,false,{modificationId,bookingId}) as ModificationView|null;}
 async assess(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,modificationId:string,bookingId:string):Promise<ModificationAssessment|null>{return await this.call(auth,interaction,false,{modificationId,bookingId,purpose:'service-coverage'}) as ModificationAssessment|null;}
}
