import {randomUUID} from 'node:crypto';
import {isVerifiedAuth,type VerifiedAuthEvidence} from '../../application/verified-auth.ts';
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from '../../application/verified-interaction.ts';
import {issueTrustedContext} from '../../application/trusted-context.ts';
import {canonicalCommercial} from '../../domain/commercial-progress.ts';
import {diagnosticIssues,validateDiagnosticObservation,validateDiagnosticQuery,type DiagnosticObservation,type DiagnosticQuery,type DiagnosticPage} from '../../domain/operation-diagnostic.ts';
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from './f1-codec.ts';
import {createF2Issuer,type F2SigningConfiguration} from './f2-codec.ts';
import {postgresF1Binding,type PostgresSql} from './transaction.ts';

/** Technical observations only. This adapter cannot apply a business result. */
export class H5017DiagnosticAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:unknown):Promise<unknown>{
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?'interactive_action':'interactive_read'))throw new Error('DIAGNOSTIC_DENIED');
  try{return await this.sql.begin('isolation level read committed',async tx=>{
   const row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>('select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)',[auth.subject,auth.sessionId!]))[0];if(!row?.epoch_id)throw new Error('DIAGNOSTIC_DENIED');
   const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
   const q=encodeF1Fields([write?'CRM-H5-DIAGNOSTIC1':'CRM-H5-DIAGNOSTIC-READ1',canonicalCommercial(input)]);
   const ctx=issueTrustedContext({identityId:'h5-diagnostic-server',identityKind:'technical',purpose:'h1-evidence',scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
   const h=this.f2(auth,identity,binding,write?'evidence_write':'evidence_read',q,interaction),t=this.f1(ctx,binding,write?'C03':'C01',q,{resource:'evidence',action:write?'write_evidence':'read_evidence'});
   return(await tx.unsafe<{data:unknown}[]>(`select crm_api.h5_diagnostic_${write?'record':'read'}($1,$2,$3,$4,$5) data`,[h.payload,h.mac,t.payload,t.mac,q]))[0]?.data;
  });}catch{throw new Error('DIAGNOSTIC_DENIED');}
 }
 async record(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:DiagnosticObservation):Promise<{id:string;replayed:boolean}>{
  validateDiagnosticObservation(input);
  // Construct every field explicitly: no extra property or arbitrary descriptor reaches SQL.
  const value={contextKind:input.contextKind,contextId:input.contextId,observationId:input.observationId,requestRef:input.requestRef,
   ...(input.operationId?{operationId:input.operationId}:{}),...(input.executionId?{executionId:input.executionId}:{}),...(input.eventId?{eventId:input.eventId}:{}),
   outcome:input.outcome,issues:diagnosticIssues(input.issues).map(x=>({code:x.code,affectedScope:x.affectedScope}))};
  return await this.call(auth,interaction,true,value) as {id:string;replayed:boolean};
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:DiagnosticQuery):Promise<DiagnosticPage>{
  validateDiagnosticQuery(input);
  const page=await this.call(auth,interaction,false,{contextKind:input.contextKind,contextId:input.contextId,pageSize:input.pageSize,...(input.after?{after:input.after}:{}),...(input.reference?{reference:input.reference}:{})}) as DiagnosticPage;
  return {...page,nodes:page.nodes.map(node=>({...node,...(Array.isArray(node.issues)?{issues:diagnosticIssues(node.issues)}:{})}))};
 }
}
