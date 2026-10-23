import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {canonicalCommercial} from "../../domain/commercial-progress.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from './f1-codec.ts';
import {createF2Issuer,type F2SigningConfiguration} from './f2-codec.ts';
import {postgresF1Binding,type PostgresSql} from './transaction.ts';
import type {DepositCommand} from '../../domain/deposit.ts';
export class H4017DepositAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:Record<string,unknown>):Promise<unknown>{
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?"interactive_action":"interactive_read")) throw new Error("DEPOSIT_AUTH_REQUIRED");
  try{return await this.sql.begin("isolation level read committed",async tx=>{
   const row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>("select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]))[0];if(!row?.epoch_id) throw new Error("DEPOSIT_DENIED");
   const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
   const q=encodeF1Fields([write?"CRM-H4-DEPOSIT1":"CRM-H4-DEPOSIT-READ1",canonicalCommercial(input)]);
   const context=issueTrustedContext({identityId:"h4-deposit-server",identityKind:"technical",purpose:"h1-evidence",scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
   const h=this.f2(auth,identity,binding,write?"evidence_write":"evidence_read",q,interaction),t=this.f1(context,binding,write?"C03":"C01",q,{resource:"evidence",action:write?"write_evidence":"read_evidence"});
   return (await tx.unsafe<{data:unknown}[]>(`select crm_api.${write?"deposit_apply":"deposit_read"}($1,$2,$3,$4,$5) data`,[h.payload,h.mac,t.payload,t.mac,q]))[0]?.data;
  });}catch(e){const m=e instanceof Error?e.message:"";throw new Error(/^DEPOSIT_[A-Z_]+(?::[A-Za-z0-9_,:./ -]+)?$/.test(m)?m:"DEPOSIT_DENIED");}
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:DepositCommand):Promise<any>{if(input.action==='determine')throw new Error('DEPOSIT_TTE_REQUIRED');return this.call(auth,interaction,true,Object.fromEntries(Object.entries(input).filter(([,v])=>v!==undefined)));}
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,bookingId:string,depositId:string,purpose:'history'|'summary'='history'):Promise<any>{return this.call(auth,interaction,false,{bookingId,depositId,purpose});}
}
