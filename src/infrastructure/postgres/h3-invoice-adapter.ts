import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {canonicalCommercial} from "../../domain/commercial-progress.ts";
import type {InvoiceBasis,InvoiceDocument,InvoicePortion,InvoiceStatus} from "../../domain/provider-invoice.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";
export interface InvoiceCommand {
 readonly action:'need'|'receive'|'review'|'link'|'correct';readonly operationId:string;
 readonly invoiceId:string;readonly bookingId:string;readonly expectedRevision:number;
 readonly sourceRef:string;readonly reason:string;readonly at:string;readonly evidenceId:string;
 readonly origin?:'manual'|'ai';readonly basis?:InvoiceBasis;readonly document?:InvoiceDocument;
 readonly comparisonBasis?:InvoiceBasis;
 readonly checks?:{readonly provider:boolean;readonly recipient:boolean;readonly amount:boolean;readonly scope:boolean};
 readonly portions?:readonly InvoicePortion[];readonly affectedServiceIds?:readonly string[];
 readonly affectedRecipientId?:string;readonly affectedAmount?:string;
}
export interface InvoiceView {
 readonly id:string;readonly bookingId:string;readonly status:InvoiceStatus;readonly revision:number;
 readonly basis:InvoiceBasis;readonly document:InvoiceDocument|null;readonly review:Record<string,unknown>|null;
 readonly link:Record<string,unknown>|null;readonly incident:Record<string,unknown>|null;
 readonly history:readonly Record<string,unknown>[];
}
export class H3007InvoiceAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:Record<string,unknown>):Promise<unknown>{
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?"interactive_action":"interactive_read")) throw new Error("INVOICE_AUTH_REQUIRED");
  const mutation=write;
  try{return await this.sql.begin("isolation level read committed",async tx=>{
   const row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>("select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]))[0];if(!row?.epoch_id) throw new Error("INVOICE_DENIED");
   const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
   const q=encodeF1Fields([mutation?"CRM-H3-INVOICE1":"CRM-H3-INVOICE-READ1",canonicalCommercial(input)]);
   const context=issueTrustedContext({identityId:"h3-invoice-server",identityKind:"technical",purpose:"h1-evidence",scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
   const h=this.f2(auth,identity,binding,mutation?"evidence_write":"evidence_read",q,interaction),t=this.f1(context,binding,mutation?"C03":"C01",q,{resource:"evidence",action:mutation?"write_evidence":"read_evidence"});
   return (await tx.unsafe<{data:unknown}[]>(`select crm_api.${mutation?"invoice_apply":"invoice_read"}($1,$2,$3,$4,$5) data`,[h.payload,h.mac,t.payload,t.mac,q]))[0]?.data;
  });}catch(e){const m=e instanceof Error?e.message:"";throw new Error(/^INVOICE_[A-Z_]+(?::[A-Za-z0-9_,:./ -]+)?$/.test(m)?m:"INVOICE_DENIED");}
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:InvoiceCommand):Promise<{id:string;replayed:boolean;result:InvoiceView}>{
  return await this.call(auth,interaction,true,Object.fromEntries(Object.entries(input).filter(([,v])=>v!==undefined))) as {id:string;replayed:boolean;result:InvoiceView};
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,invoiceId:string,bookingId:string):Promise<InvoiceView|null>{
  return await this.call(auth,interaction,false,{invoiceId,bookingId}) as InvoiceView|null;
 }
}
