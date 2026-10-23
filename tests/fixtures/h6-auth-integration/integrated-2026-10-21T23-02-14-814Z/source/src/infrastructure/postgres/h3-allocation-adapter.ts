import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {canonicalCommercial} from "../../domain/commercial-progress.ts";
import {allocationCalculation,requireAllocationAmount,type AllocationDestination,type AllocationPart,type EconomicBasis} from "../../domain/payment-allocation.ts";
import {type CalculationRecord} from "../../domain/exact-money.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";
export interface AllocationCommand {
 readonly action:'plan'|'assign'|'verify'|'consume'|'reverse'|'rectify'|'distribute'|'reverse_distribution';
 readonly operationId:string;readonly paymentId:string;readonly expectedRevision:number;readonly expectedPaymentRevision:number;
 readonly sourceRef:string;readonly reason:string;readonly at:string;readonly evidenceId:string;readonly origin?:'manual'|'ai';
 readonly cause?:'ordinary'|'correction'|'cancellation'|'refund'|'new_obligation'|'modification';readonly economicBasis?:EconomicBasis;
 readonly allocationId?:string;readonly originalAllocationId?:string;readonly originalActId?:string;
 readonly reconciliationId?:string;readonly expectedReconciliationRevision?:number;readonly destination?:AllocationDestination;
 readonly start?:string;readonly amount?:string;readonly expectedScheduleRevision?:number;
 readonly distributionId?:string;readonly total?:string;readonly parts?:readonly AllocationPart[];
}
export class H3005AllocationAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:Record<string,unknown>):Promise<unknown>{
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?"interactive_action":"interactive_read")) throw new Error("ALLOCATION_AUTH_REQUIRED");
  const mutation=write;
  try{return await this.sql.begin("isolation level read committed",async tx=>{
   const row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>("select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]))[0];if(!row?.epoch_id) throw new Error("ALLOCATION_DENIED");
   const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
   const q=encodeF1Fields([mutation?"CRM-H3-ALLOCATION1":"CRM-H3-ALLOCATION-READ1",canonicalCommercial(input)]);
   const context=issueTrustedContext({identityId:"h3-allocation-server",identityKind:"technical",purpose:"h1-evidence",scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
   const h=this.f2(auth,identity,binding,mutation?"evidence_write":"evidence_read",q,interaction),t=this.f1(context,binding,mutation?"C03":"C01",q,{resource:"evidence",action:mutation?"write_evidence":"read_evidence"});
   return (await tx.unsafe<{data:unknown}[]>(`select crm_api.${mutation?"allocation_apply":"allocation_read"}($1,$2,$3,$4,$5) data`,[h.payload,h.mac,t.payload,t.mac,q]))[0]?.data;
  });}catch(e){const m=e instanceof Error?e.message:"";throw new Error(/^ALLOCATION_[A-Z_]+(?::[A-Za-z0-9_,:./ -]+)?$/.test(m)?m:"ALLOCATION_DENIED");}
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:AllocationCommand):Promise<{id:string;replayed:boolean;result:Record<string,unknown>}>{
  for(const value of [input.amount,input.start])if(value!==undefined)requireAllocationAmount(value,false);
  const value:Record<string,unknown>=Object.fromEntries(Object.entries(input).filter(([,v])=>v!==undefined));
  if(input.action==='distribute'){
   if(!input.total||!input.parts)throw new Error('ALLOCATION_DISTRIBUTION_REQUIRED');requireAllocationAmount(input.total);
   value.calculation=allocationCalculation(input.total,input.parts,input.sourceRef,input.paymentId,input.reason);
  }
  if(input.action==='reverse_distribution'){
   if(!input.total||!input.parts)throw new Error('ALLOCATION_DISTRIBUTION_REQUIRED');
   value.calculation=allocationCalculation(input.total,input.parts,input.sourceRef,input.paymentId,input.reason);
  }
  return await this.call(auth,interaction,true,value) as {id:string;replayed:boolean;result:Record<string,unknown>};
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,paymentId:string):Promise<{
  revision:number;paymentRevision:number;summary:Record<string,unknown>;allocations:Record<string,unknown>[];
  acts:Record<string,unknown>[];history:unknown[];coverage:Record<string,unknown>[];
  distributions:{distribution_id:string;calculation:CalculationRecord}[]}|null>{
  return await this.call(auth,interaction,false,{paymentId}) as Awaited<ReturnType<H3005AllocationAdapter['read']>>;
 }
}
