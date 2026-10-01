import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {canonicalCommercial} from "../../domain/commercial-progress.ts";
import {calculateProposal,decideProposal,proposalReferences,type ProposalContent,type ProposalSource} from "../../domain/proposal-version.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";
export interface ProposalCommand {
 readonly action:"prepare"|"fix"|"partial_request";readonly operationId:string;readonly proposalId:string;readonly opportunityId:string;
 readonly expectedRevision:number;readonly expectedOpportunityRevision:number;readonly sourceRef:string;readonly reason:string;
 readonly content?:ProposalContent;readonly baseVersionId?:string;readonly reviewed?:boolean;readonly versionId?:string;
 readonly partId?:string;readonly requestEvidenceId?:string;
}
export class H2003ProposalAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:Record<string,unknown>):Promise<unknown> {
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?"interactive_action":"interactive_read")) throw new Error("PROPOSAL_AUTH_REQUIRED");
  try {return await this.sql.begin("isolation level read committed",async tx=>{
   const row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>("select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]))[0];if(!row?.epoch_id) throw new Error("PROPOSAL_DENIED");
   const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
   const sign=(q:Buffer,purpose="h1-evidence",resource:"evidence"|"identities"="evidence",action:"write_identity"|"write_evidence"|"read_evidence"=write?"write_evidence":"read_evidence")=>{
    const context=issueTrustedContext({identityId:"h2-proposal-server",identityKind:"technical",purpose,scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
    return {h:this.f2(auth,identity,binding,purpose==="h1-identities"?"identity_write":write?"evidence_write":"evidence_read",q,interaction),t:this.f1(context,binding,write?"C03":"C01",q,{resource,action})};
   };
   if(!write){const q=encodeF1Fields(["CRM-H2-PROP-READ1",canonicalCommercial(input)]),{h,t}=sign(q);return (await tx.unsafe<{data:unknown}[]>("select crm_api.proposal_read($1,$2,$3,$4,$5) data",[h.payload,h.mac,t.payload,t.mac,q]))[0]?.data;}
   let enriched:Record<string,unknown>={...input};
   if(input.content){
    const c=input.content as ProposalContent;
    const decision=decideProposal(c,false);if(!decision.allowed) throw new Error(`PROPOSAL_BLOCKED:SM-PV-01:${decision.blockers.join(",")}`);
    const sq=encodeF1Fields(["CRM-H2-PROP-SOURCES1",canonicalCommercial({references:proposalReferences(c),opportunityId:input.opportunityId})]),s=sign(sq);
    const sources=(await tx.unsafe<{data:ProposalSource[]}[]>("select crm_api.proposal_sources($1,$2,$3,$4,$5) data",[s.h.payload,s.h.mac,s.t.payload,s.t.mac,sq]))[0]?.data??[];
    enriched={...input,economics:calculateProposal(c,sources,row.actor_id,new Date().toISOString(),false),sources};
   }
   const q=encodeF1Fields(["CRM-H2-PROP-1",canonicalCommercial(enriched)]),{h,t}=sign(q);
   const cq=encodeF1Fields(["CRM-H1-RESOLVE1","assign_code",String(input.proposalId),String(input.proposalId),"","PR",String(input.sourceRef),String(input.sourceRef),String(input.reason),"0"]),cs=sign(cq,"h1-identities","identities","write_identity");
   const r=(await tx.unsafe<{result_ref:string;replayed:boolean}[]>("select result_ref::text,replayed from crm_api.proposal_apply($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[h.payload,h.mac,t.payload,t.mac,q,cs.h.payload,cs.h.mac,cs.t.payload,cs.t.mac,cq]))[0];
   return {id:r?.result_ref,replayed:r?.replayed};
  });}catch(e){const m=e instanceof Error?e.message:"";if(/^PROPOSAL_[A-Z_]+(?::[A-Za-z0-9_,:./ -]+)?$/.test(m)) throw new Error(m);throw new Error("PROPOSAL_DENIED");}
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:ProposalCommand):Promise<{id:string;replayed:boolean}> {
  if(!Object.keys(input).every(k=>["action","operationId","proposalId","opportunityId","expectedRevision","expectedOpportunityRevision","sourceRef","reason","content","baseVersionId","reviewed","versionId","partId","requestEvidenceId"].includes(k))||!["prepare","fix","partial_request"].includes(input.action)||![input.operationId,input.proposalId,input.opportunityId,...[input.baseVersionId,input.versionId,input.partId,input.requestEvidenceId].filter(x=>x!==undefined)].every(x=>typeof x==="string"&&/^[0-9a-f-]{36}$/.test(x))||![input.expectedRevision,input.expectedOpportunityRevision].every(x=>Number.isSafeInteger(x)&&x>=0)||typeof input.sourceRef!=="string"||!input.sourceRef.trim()||typeof input.reason!=="string"||!input.reason.trim()) throw new Error("PROPOSAL_INPUT_INVALID");
  return await this.call(auth,interaction,true,Object.fromEntries(Object.entries(input).filter(([,v])=>v!==undefined))) as {id:string;replayed:boolean};
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,proposalId:string,kind:"internal"|"commercial"|"history"|"preparation",versionId?:string):Promise<unknown>{return this.call(auth,interaction,false,{proposalId,kind,...(versionId?{versionId}:{})});}
}
