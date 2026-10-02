import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {canonicalCommercial} from "../../domain/commercial-progress.ts";
import {determineSchedule,evaluateExpected,type PaymentPolicy,type ScheduleDefinition,type ExpectedPart,type Due} from "../../domain/payment-obligation.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";
export interface ObligationCommand {
 readonly action:"publish_policy"|"determine"|"adjust";
 readonly operationId:string;readonly bookingId:string;readonly policyId:string;
 readonly expectedRevision:number;readonly sourceRef:string;readonly reason:string;
 readonly at:string;readonly evidenceId:string;readonly origin?:"manual"|"ai";
 readonly scheduleId?:string;readonly scope?:"global"|"modality"|"service"|"night";readonly scopeId?:string;
 readonly policy?:PaymentPolicy;readonly definition?:ScheduleDefinition;
 readonly policyVersion?:number;readonly selectors?:Readonly<Record<string,string|null>>;
 readonly slot?:"initial"|"balance";readonly amount?:string;readonly due?:Due;
}
export class H3001ObligationAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:Record<string,unknown>):Promise<unknown>{
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?"interactive_action":"interactive_read")) throw new Error("OBLIGATION_AUTH_REQUIRED");
  try{return await this.sql.begin("isolation level read committed",async tx=>{
   const row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>("select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]))[0];if(!row?.epoch_id) throw new Error("OBLIGATION_DENIED");
   const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
   const q=encodeF1Fields([write?"CRM-H3-OBLIGATION1":"CRM-H3-OBLIGATION-READ1",canonicalCommercial(input)]);
   const context=issueTrustedContext({identityId:"h3-obligation-server",identityKind:"technical",purpose:"h1-evidence",scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
   const h=this.f2(auth,identity,binding,write?"evidence_write":"evidence_read",q,interaction),t=this.f1(context,binding,write?"C03":"C01",q,{resource:"evidence",action:write?"write_evidence":"read_evidence"});
   return (await tx.unsafe<{data:unknown}[]>(`select crm_api.${write?"obligation_apply":"obligation_read"}($1,$2,$3,$4,$5) data`,[h.payload,h.mac,t.payload,t.mac,q]))[0]?.data;
  });}catch(e){const m=e instanceof Error?e.message:"";throw new Error(/^OBLIGATION_[A-Z_]+(?::[A-Za-z0-9_,:./ -]+)?$/.test(m)?m:"OBLIGATION_DENIED");}
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:ObligationCommand):Promise<{id:string;replayed:boolean;result:Record<string,unknown>}>{
  const value=Object.fromEntries(Object.entries(input).filter(([,v])=>v!==undefined));
  if(input.action==="determine") {if(!input.policy||!input.definition)throw new Error("OBLIGATION_MATERIAL_REQUIRED");value.computed=determineSchedule(input.policy,input.definition);}
  return await this.call(auth,interaction,true,value) as {id:string;replayed:boolean;result:Record<string,unknown>};
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,bookingId:string,scheduleId:string):Promise<{
  current:{snapshot:ReturnType<typeof determineSchedule>};original:ExpectedPart[];history:unknown[]}|null>{
  return await this.call(auth,interaction,false,{bookingId,scheduleId}) as {current:{snapshot:ReturnType<typeof determineSchedule>};original:ExpectedPart[];history:unknown[]}|null;
 }
 async evaluate(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,bookingId:string,scheduleId:string,at:string){
  const record=await this.read(auth,interaction,bookingId,scheduleId);if(!record)return null;
  return record.current.snapshot.parts.map(p=>({slot:p.slot,...evaluateExpected(p,record.current.snapshot.reference,at)}));
 }
}
