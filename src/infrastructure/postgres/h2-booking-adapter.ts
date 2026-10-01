import {H2001CommercialAdapter,type CommercialCommand} from "./h2-commercial-adapter.ts";
import {H2003ProposalAdapter,type ProposalCommand} from "./h2-proposal-adapter.ts";
import {H2005OfferAdapter,type OfferCommand} from "./h2-offer-adapter.ts";
import {H2007AcceptanceAdapter,type AcceptanceCommand} from "./h2-acceptance-adapter.ts";
import type {PostgresTransaction} from "./transaction.ts";
export type DirectStage = {readonly kind:"opportunity";readonly command:CommercialCommand}|{readonly kind:"proposal";readonly command:ProposalCommand}|{readonly kind:"offer";readonly command:OfferCommand}|{readonly kind:"acceptance";readonly command:AcceptanceCommand};
import type {BookingDetail} from "../../domain/booking-conversion.ts";
import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {canonicalCommercial} from "../../domain/commercial-progress.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";
export interface BookingCommand {
 readonly operationId:string;readonly bookingId:string;readonly opportunityId:string;readonly acceptanceId:string;
 readonly proposalId:string;readonly versionId:string;readonly coverage:string;readonly terms:unknown;
 readonly expectedRevision:number;readonly expectedOpportunityRevision:number;readonly sourceRef:string;readonly reason:string;
 readonly evidenceId:string;readonly detail:BookingDetail;readonly origin?:"manual"|"ai";readonly route:"normal"|"direct";
}
export class H2009BookingAdapter {
 private readonly configuration:{f1:F1SigningConfiguration;f2:F2SigningConfiguration};private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.configuration={f1,f2};this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:Record<string,unknown>):Promise<unknown>{
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?"interactive_action":"interactive_read")) throw new Error("BOOKING_AUTH_REQUIRED");
  try{return await this.sql.begin("isolation level read committed",async tx=>{
   const row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>("select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]))[0];if(!row?.epoch_id) throw new Error("BOOKING_DENIED");
   const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
   const q=encodeF1Fields([write?"CRM-H2-BOOKING1":"CRM-H2-BOOKING-READ1",canonicalCommercial(input)]);
   const context=issueTrustedContext({identityId:"h2-booking-server",identityKind:"technical",purpose:"h1-evidence",scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
   const h=this.f2(auth,identity,binding,write?"evidence_write":"evidence_read",q,interaction),t=this.f1(context,binding,write?"C03":"C01",q,{resource:"evidence",action:write?"write_evidence":"read_evidence"});
   if(!write) return (await tx.unsafe<{data:unknown}[]>("select crm_api.booking_read($1,$2,$3,$4,$5) data",[h.payload,h.mac,t.payload,t.mac,q]))[0]?.data;
   const cq=encodeF1Fields(["CRM-H1-RESOLVE1","assign_code",String(input.bookingId),String(input.bookingId),"","RES",String(input.sourceRef),String(input.evidenceId),String(input.reason),"0"]);
   const cctx=issueTrustedContext({identityId:"h2-booking-server",identityKind:"technical",purpose:"h1-identities",scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
   const ch=this.f2(auth,identity,binding,"identity_write",cq,interaction),ct=this.f1(cctx,binding,"C03",cq,{resource:"identities",action:"write_identity"});
   return (await tx.unsafe<{data:unknown}[]>("select crm_api.booking_apply($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) data",[h.payload,h.mac,t.payload,t.mac,q,ch.payload,ch.mac,ct.payload,ct.mac,cq]))[0]?.data;
  });}catch(e){const m=e instanceof Error?e.message:"";throw new Error(/^BOOKING_[A-Z_]+(?::[A-Za-z0-9_,:./ -]+)?$/.test(m)?m:"BOOKING_DENIED");}
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:BookingCommand):Promise<{id:string;replayed:boolean;result:Record<string,unknown>}>{return await this.call(auth,interaction,true,Object.fromEntries(Object.entries(input).filter(([,v])=>v!==undefined))) as {id:string;replayed:boolean;result:Record<string,unknown>};}
 /** Reuses existing contracts on the same private transaction. No callback/SQL handle exposed. */
 async direct(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,stages:readonly DirectStage[],input:BookingCommand){
  if(input.route!=="direct"||stages.some(x=>x.kind==="opportunity"&&!['direct','convert'].includes(x.command.action)||x.kind==="proposal"&&!['prepare','fix'].includes(x.command.action)||x.kind==="offer"&&!['issue','revalidate'].includes(x.command.action)||x.kind==="acceptance"&&!['register','verify'].includes(x.command.action)))throw new Error("BOOKING_DIRECT_STAGE_INVALID");
  if(stages.some(x=>x.kind==="opportunity"?x.command.targetId!==input.opportunityId:x.command.opportunityId!==input.opportunityId||x.command.proposalId!==input.proposalId))throw new Error("BOOKING_DIRECT_CHAIN_MISMATCH");
  return this.sql.begin("isolation level read committed",async tx=>{
   const scoped={begin:async(...args:unknown[])=>(args.at(-1) as (tx:PostgresTransaction)=>Promise<unknown>)(tx)} as unknown as PostgresSql;
   const {f1,f2}=this.configuration;
   for(const stage of stages){
    if(stage.kind==="opportunity")await new H2001CommercialAdapter(scoped,f1,f2).apply(auth,interaction,stage.command);
    else if(stage.kind==="proposal")await new H2003ProposalAdapter(scoped,f1,f2).apply(auth,interaction,stage.command);
    else if(stage.kind==="offer")await new H2005OfferAdapter(scoped,f1,f2).apply(auth,interaction,stage.command);
    else await new H2007AcceptanceAdapter(scoped,f1,f2).apply(auth,interaction,stage.command);
   }
   return new H2009BookingAdapter(scoped,f1,f2).apply(auth,interaction,input);
  });
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,bookingId:string):Promise<unknown>{return this.call(auth,interaction,false,{bookingId});}
}
