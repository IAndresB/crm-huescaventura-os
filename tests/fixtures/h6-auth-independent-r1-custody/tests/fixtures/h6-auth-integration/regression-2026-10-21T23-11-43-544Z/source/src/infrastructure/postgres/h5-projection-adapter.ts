import {randomUUID} from "node:crypto";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {canonicalCommercial} from "../../domain/commercial-progress.ts";
import {composeProjection,validateProjectionQuery,type CanonicalProjectionFrame,type ProjectionQuery} from "../../domain/coordinated-projection.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";

export class H5011ProjectionAdapter {
 private readonly sql:PostgresSql;
 private readonly f1:ReturnType<typeof createF1Issuer>;
 private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){
  this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:ProjectionQuery){
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,"interactive_read"))throw new Error("PROJECTION_AUTH_REQUIRED");
  validateProjectionQuery(input);
  try{return await this.sql.begin("isolation level read committed",async tx=>{
   const row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>(
    "select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]))[0];
   if(!row?.epoch_id)throw new Error("PROJECTION_DENIED");
   const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
   const query=encodeF1Fields(["CRM-H5-PROJECTION-READ1",canonicalCommercial(input)]);
   const context=issueTrustedContext({identityId:"h5-projection-server",identityKind:"technical",purpose:"h1-evidence",scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
   const h=this.f2(auth,identity,binding,"evidence_read",query,interaction),t=this.f1(context,binding,"C01",query,{resource:"evidence",action:"read_evidence"});
   const frame=(await tx.unsafe<{data:CanonicalProjectionFrame|null}[]>(
    "select crm_api.h5_projection_read($1,$2,$3,$4,$5) data",[h.payload,h.mac,t.payload,t.mac,query]))[0]?.data;
   return frame?composeProjection(frame,input):null;
  });}catch{throw new Error("PROJECTION_DENIED");}
 }
}
