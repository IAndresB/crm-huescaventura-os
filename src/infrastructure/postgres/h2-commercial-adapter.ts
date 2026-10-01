import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {canonicalCommercial,validMaterial,decideCreation,type CommercialMaterial,type CommercialEvent} from "../../domain/commercial-progress.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";

export interface CommercialCommand {
 readonly action:"lead"|"direct"|"convert"|"progress";readonly operationId:string;readonly targetId:string;
 readonly leadId?:string;readonly expectedRevision:number;readonly sourceRef:string;readonly reason:string;
 readonly material?:CommercialMaterial;readonly event?:CommercialEvent;
}
export class H2001CommercialAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration) {
  this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);
 }
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:Record<string,unknown>):Promise<unknown> {
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?"interactive_action":"interactive_read")) throw new Error("COMMERCIAL_AUTH_REQUIRED");
  try {
   return await this.sql.begin("isolation level read committed",async tx=>{
    const rows=await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>(
     "select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]);
    const row=rows[0];if(!row?.epoch_id) throw new Error("COMMERCIAL_DENIED");
    const binding=await postgresF1Binding(tx);
    const identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
    const context=(purpose:string)=>issueTrustedContext({identityId:"h2-commercial-server",identityKind:"technical",purpose,
     scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
    const q=encodeF1Fields([write?"CRM-H2-COM-1":"CRM-H2-COM-READ1",canonicalCommercial(input)]);
    const h=this.f2(auth,identity,binding,write?"evidence_write":"evidence_read",q,interaction);
    const t=this.f1(context("h1-evidence"),binding,write?"C03":"C01",q,{resource:"evidence",action:write?"write_evidence":"read_evidence"});
    if(!write) return (await tx.unsafe<{data:unknown}[]>("select crm_api.b03_read($1,$2,$3,$4,$5) data",[h.payload,h.mac,t.payload,t.mac,q]))[0]?.data??null;
    const cq=encodeF1Fields(["CRM-H1-RESOLVE1","assign_code",String(input.targetId),String(input.targetId),"","OP",String(input.sourceRef),String(input.sourceRef),String(input.reason),"0"]);
    const ch=this.f2(auth,identity,binding,"identity_write",cq,interaction);
    const ct=this.f1(context("h1-identities"),binding,"C03",cq,{resource:"identities",action:"write_identity"});
    const result=await tx.unsafe<{result_ref:string;replayed:boolean}[]>("select result_ref::text,replayed from crm_api.b03_apply($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
     [h.payload,h.mac,t.payload,t.mac,q,ch.payload,ch.mac,ct.payload,ct.mac,cq]);
    return {id:result[0]?.result_ref,replayed:result[0]?.replayed};
   });
  } catch(error) {
   const message=error instanceof Error?error.message:"";
   if(/^COMMERCIAL_[A-Z_]+(?::[A-Za-z0-9_ :/.-]+)?$/.test(message)) throw new Error(message);
   throw new Error("COMMERCIAL_DENIED");
  }
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:CommercialCommand):Promise<{id:string;replayed:boolean}> {
  if(!Object.keys(input).every(k=>["action","operationId","targetId","leadId","expectedRevision","sourceRef","reason","material","event"].includes(k))||
   !["lead","direct","convert","progress"].includes(input.action)||![input.targetId,input.operationId,...(input.leadId?[input.leadId]:[])].every(x=>/^[0-9a-f-]{36}$/.test(x))||
   !Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0||!input.sourceRef?.trim()||!input.reason?.trim()) throw new Error("COMMERCIAL_INPUT_INVALID");
  if(input.action!=="progress"&&(!input.material||!validMaterial(input.material))) throw new Error("COMMERCIAL_INPUT_INVALID");
  if((input.action==="direct"||input.action==="convert")&&!decideCreation(input.material!).allowed) throw new Error("COMMERCIAL_MINIMUM_REQUIRED:SM-OP-01");
  return await this.call(auth,interaction,true,{...input}) as {id:string;replayed:boolean};
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,targetId:string,kind:"lead"|"opportunity"|"history"):Promise<unknown> {
  return await this.call(auth,interaction,false,{targetId,kind});
 }
}
