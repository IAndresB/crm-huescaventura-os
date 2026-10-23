import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";
import type {B07ContextKind} from "./h1-evidence-adapter.ts";

export interface ExternalEventCommand {
 readonly operationId:string;readonly eventId:string;readonly sourceId:string;readonly externalKey?:string;
 readonly echoOfOperationId?:string;
 readonly targetId:string;readonly contextKind:B07ContextKind;readonly contextId:string;readonly coverage:string;
 readonly sourceRef:string;readonly purpose:string;readonly reason:string;readonly occurredAt?:string;
 readonly material:Readonly<Record<string,unknown>>;
}
export interface ExternalEventResult {readonly id:string;readonly state:"applied"|"duplicate"|"conflict"|"review";readonly replayed:boolean;readonly code?:"E2"}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const instant=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
function canonical(value:unknown):unknown {
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b,"en")).map(([k,v])=>[k,canonical(v)]));
 return value;
}
function valid(input:ExternalEventCommand):boolean {
 return [input.operationId,input.eventId,input.sourceId,input.targetId,input.contextId].every(x=>uuid.test(x))
  && (input.externalKey===undefined||(input.externalKey.length>0&&input.externalKey.length<=512))
  && (input.echoOfOperationId===undefined||uuid.test(input.echoOfOperationId))
  && [input.coverage,input.sourceRef,input.reason].every(x=>typeof x==="string"&&x.length>0&&x.length<=16384)
  && input.purpose==="external-boundary"
  && instant.test(input.occurredAt??"")
  && ["contact","organization","opportunity","booking","booking_service","provider","proposal","other"].includes(input.contextKind)
  && !Object.keys(input.material).some(key=>["source_id","external_key","coverage","review_state"].includes(key));
}

/** PostgreSQL boundary adapter. Authenticated C03 and B07 persistence remain authoritative. */
export class H5009ExternalEventAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 async receive(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:ExternalEventCommand):Promise<ExternalEventResult>{
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,"interactive_action")||!valid(input))throw new Error("BOUNDARY_DENIED");
  try{return await this.sql.begin("isolation level read committed",async tx=>{
   const rows=await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>(
    "select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]);
   const row=rows[0];if(!row?.epoch_id)throw new Error("BOUNDARY_DENIED");
   const material={source_id:input.sourceId,...(input.externalKey===undefined?{}:{external_key:input.externalKey}),coverage:input.coverage,review_state:"pending",
    payload:{...input.material,...(input.echoOfOperationId?{echo_of_operation_id:input.echoOfOperationId}:{})}};
   const fields=["CRM-H1-B07-1","create",input.operationId,input.eventId,"external_event",JSON.stringify(canonical(material)),input.sourceRef,input.purpose,input.occurredAt??"","","",input.contextKind,input.contextId,input.reason,input.coverage];
   const q=encodeF1Fields(fields),binding=await postgresF1Binding(tx);
   const human=this.f2(auth,{actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id},binding,"evidence_write",q,interaction);
   const context=issueTrustedContext({identityId:"h5-external-event-server",identityKind:"technical",purpose:"h1-evidence",scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
   const technical=this.f1(context,binding,"C03",q,{resource:"evidence",action:"write_evidence"});
   const result=await tx.unsafe<{data:ExternalEventResult}[]>("select crm_api.b09_external_event_apply($1,$2,$3,$4,$5) data",[human.payload,human.mac,technical.payload,technical.mac,q]);
   const data=result[0]?.data;if(!data)throw new Error("BOUNDARY_DENIED");return data;
  });}catch(error){const message=error instanceof Error?error.message:"";if(/^(BOUNDARY_[A-Z_]+|B07_REPLAY_CONFLICT)$/.test(message))throw new Error(message);throw new Error("BOUNDARY_DENIED");}
 }
}
