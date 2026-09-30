import {randomUUID} from "node:crypto";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql} from "./transaction.ts";
import {digest,type PrivateStorage} from "../storage/private-storage.ts";
import type {B07ContextKind} from "./h1-evidence-adapter.ts";

export interface ObjectContext {
 readonly contextKind:B07ContextKind;readonly contextId:string;readonly purpose:string;
}
export interface PrepareObject extends ObjectContext {
 readonly operationId:string;readonly versionId:string;readonly rootId:string;
 readonly expectedVersion:number;readonly documentId:string;readonly sourceRef:string;
 readonly reason:string;readonly digest:string;readonly size:number;readonly media:string;
}
export interface ObjectVersion {
 readonly version_id:string;readonly root_id:string;readonly document_id:string;
 readonly version_number:number;readonly revision:number;readonly state:string;
 readonly private_ref:string;readonly expected_digest:string;readonly expected_size:number;
 readonly expected_media:string;
}
type Result={id:string;replayed:boolean};
function canonical(value:Record<string,unknown>):string {
 return JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0)));
}
export class H1015ObjectAdapter {
 private readonly sql:PostgresSql;private readonly storage:PrivateStorage;
 private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,storage:PrivateStorage,f1:F1SigningConfiguration,f2:F2SigningConfiguration) {
  this.sql=sql;this.storage=storage;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);
 }
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,
  write:boolean,input:Record<string,unknown>):Promise<unknown> {
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||
   !isVerifiedServerInteraction(interaction,write?"interactive_action":"interactive_read")) throw new Error("OBJECT_AUTH_REQUIRED");
  try {
   return await this.sql.begin("isolation level read committed",async tx=>{
    const lookup=await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>(
     "select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",
     [auth.subject,auth.sessionId!]);
    const row=lookup[0];if(!row?.epoch_id) throw new Error("OBJECT_DENIED");
    const binding=await postgresF1Binding(tx);
    const q=encodeF1Fields([write?"CRM-H1-OBJECT-1":"CRM-H1-OBJECT-READ1",canonical(input)]);
    const human=this.f2(auth,{actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,
     sessionId:auth.sessionId!,epochId:row.epoch_id},binding,write?"evidence_write":"evidence_read",q,interaction);
    const context=issueTrustedContext({identityId:"h1-object-server",identityKind:"technical",purpose:"h1-evidence",
     scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
    const technical=this.f1(context,binding,write?"C03":"C01",q,
     {resource:"evidence",action:write?"write_evidence":"read_evidence"});
    const args=[human.payload,human.mac,technical.payload,technical.mac,q];
    if(write) {
     const rows=await tx.unsafe<{result_ref:string;replayed:boolean}[]>(
      "select result_ref::text,replayed from crm_api.b07_object_apply($1,$2,$3,$4,$5)",args);
     return {id:rows[0]?.result_ref,replayed:rows[0]?.replayed};
    }
    const rows=await tx.unsafe<{data:unknown}[]>("select crm_api.b07_object_read($1,$2,$3,$4,$5) data",args);
    return rows[0]?.data??null;
   });
  } catch(error) {
   const message=error instanceof Error?error.message:"";
   if(/^OBJECT_[A-Z_]+$/.test(message)) throw new Error(message);
   throw new Error("OBJECT_DENIED");
  }
 }
 async prepare(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:PrepareObject):Promise<Result> {
  if(!Number.isSafeInteger(input.size)||input.size<0||!Number.isSafeInteger(input.expectedVersion)||
   input.expectedVersion<0||!input.media||!input.purpose||!input.reason||!input.sourceRef||
   !/^[0-9a-f]{64}$/.test(input.digest)) throw new Error("OBJECT_INPUT_INVALID");
  return await this.call(auth,interaction,true,{...input,action:"prepare"}) as Result;
 }
 async metadata(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,versionId:string,
  context:ObjectContext):Promise<ObjectVersion|null> {
  return await this.call(auth,interaction,false,{...context,versionId}) as ObjectVersion|null;
 }
 private async require(auth:VerifiedAuthEvidence,read:VerifiedServerInteraction,versionId:string,context:ObjectContext) {
  const row=await this.metadata(auth,read,versionId,context);if(!row) throw new Error("OBJECT_DENIED");return row;
 }
 async upload(auth:VerifiedAuthEvidence,read:VerifiedServerInteraction,write:VerifiedServerInteraction,
  versionId:string,context:ObjectContext,bytes:Uint8Array,operationId:string):Promise<Result> {
  const row=await this.require(auth,read,versionId,context);
  if(digest(bytes)!==row.expected_digest||bytes.length!==Number(row.expected_size)) throw new Error("OBJECT_CONTENT_CONFLICT");
  await this.storage.put(row.private_ref,bytes,row.expected_media);
  return await this.call(auth,write,true,{...context,versionId,operationId,action:"uploaded",
   expectedRevision:row.revision,sourceRef:"storage-upload-result",reason:"binary present; integrity accreditation pending"}) as Result;
 }
 async reconcile(auth:VerifiedAuthEvidence,read:VerifiedServerInteraction,write:VerifiedServerInteraction,
  versionId:string,context:ObjectContext,operationId:string):Promise<Result> {
  const row=await this.require(auth,read,versionId,context);
  const object=await this.storage.get(row.private_ref);
  return await this.call(auth,write,true,{...context,versionId,operationId,action:"observe",
   expectedRevision:row.revision,presence:object?"present":"missing",digest:object?digest(object.bytes):null,
   size:object?object.bytes.length:null,media:object?.media??null,sourceRef:"storage-byte-observation",
   reason:"reconcile actual bytes with prepared material"}) as Result;
 }
 async link(auth:VerifiedAuthEvidence,read:VerifiedServerInteraction,write:VerifiedServerInteraction,
  versionId:string,context:ObjectContext,operationId:string,evidenceId?:string):Promise<Result> {
  const row=await this.require(auth,read,versionId,context);
  const object=await this.storage.get(row.private_ref);
  if(!object||digest(object.bytes)!==row.expected_digest||object.bytes.length!==Number(row.expected_size)
   ||object.media!==row.expected_media) throw new Error("OBJECT_INTEGRITY_FAILED");
  return await this.call(auth,write,true,{...context,versionId,operationId,...(evidenceId?{evidenceId}:{}),action:"link",expectedRevision:row.revision,
   sourceRef:"verified-object-link",reason:"explicit version link"}) as Result;
 }
 async download(auth:VerifiedAuthEvidence,read:VerifiedServerInteraction,versionId:string,context:ObjectContext):Promise<Uint8Array> {
  const before=await this.require(auth,read,versionId,context);
  if(before.state!=="stored") throw new Error("OBJECT_NOT_CONSERVED");
  const object=await this.storage.get(before.private_ref);
  if(!object||digest(object.bytes)!==before.expected_digest||object.bytes.length!==Number(before.expected_size)
   ||object.media!==before.expected_media) throw new Error("OBJECT_INTEGRITY_FAILED");
  const after=await this.require(auth,read,versionId,context);
  if(after.state!=="stored"||after.revision!==before.revision) throw new Error("OBJECT_VERSION_CONFLICT");
  return object.bytes;
 }
 async diagnoseOrphan(auth:VerifiedAuthEvidence,read:VerifiedServerInteraction,write:VerifiedServerInteraction,reference:string,
  operationId:string):Promise<Result> {
  await this.call(auth,read,false,{versionId:operationId,contextKind:"other",contextId:operationId,purpose:"orphan-review"});
  if(!await this.storage.get(reference)) throw new Error("OBJECT_MISSING");
  return await this.call(auth,write,true,{action:"orphan",privateRef:reference,versionId:operationId,operationId,
   purpose:"orphan-review",reason:"present object without Core metadata; no owner inferred",sourceRef:"storage-inventory"}) as Result;
 }
}
