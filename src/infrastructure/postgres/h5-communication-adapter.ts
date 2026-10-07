import {randomUUID} from 'node:crypto';
import {issueTrustedContext} from '../../application/trusted-context.ts';
import {isVerifiedAuth,type VerifiedAuthEvidence} from '../../application/verified-auth.ts';
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from '../../application/verified-interaction.ts';
import {canonicalCommunication,validateCommunication,type CommunicationCommand,type CommunicationContext} from '../../domain/communication-review.ts';
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from './f1-codec.ts';
import {createF2Issuer,type F2SigningConfiguration} from './f2-codec.ts';
import {postgresF1Binding,type PostgresSql} from './transaction.ts';
import type {HumanApprovalMaterial} from './h0-011-adapter.ts';
export function communicationApproval(scope:string,communicationId:string,versionId:string,material:unknown,recipient:string):HumanApprovalMaterial {
 const content=canonicalCommunication({communicationId,versionId,material});
 const part={partId:'content',action:'communication-content',contentVersion:versionId,content,
 recipient:{state:'value' as const,value:recipient},amount:{state:'not-applicable' as const},
 conditions:{state:'not-applicable' as const},scope,effect:'authorize-content'};
 const {partId: _partId,...header}=part;
 return {...header,destination:{state:'not-applicable'},parts:[part]};
}
export class H5005CommunicationAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:unknown):Promise<unknown>{
 if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?'interactive_action':'interactive_read'))throw new Error('COMM_DENIED');
 try{return await this.sql.begin('isolation level read committed',async tx=>{
 const rows=await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>('select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)',[auth.subject,auth.sessionId!]);
 const row=rows[0];if(!row?.epoch_id)throw new Error('COMM_DENIED');
 const q=encodeF1Fields([write?'CRM-H5-COMM-1':'CRM-H5-COMM-READ1',canonicalCommunication(input)]),binding=await postgresF1Binding(tx);
 const human=this.f2(auth,{actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id},binding,write?'evidence_write':'evidence_read',q,interaction);
 const technical=this.f1(issueTrustedContext({identityId:'h5-communication-server',identityKind:'technical',purpose:'h1-evidence',scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()}),binding,write?'C03':'C01',q,{resource:'evidence',action:write?'write_evidence':'read_evidence'});
 const result=await tx.unsafe<{data:unknown}[]>(`select crm_api.${write?'b07_communication_apply':'b07_communication_read'}($1,$2,$3,$4,$5) data`,[human.payload,human.mac,technical.payload,technical.mac,q]);return result[0]!.data;
 });}catch(e){const message=e instanceof Error?e.message:'';if(/^COMM_[A-Z_]+$/.test(message))throw new Error(message);throw new Error('COMM_DENIED');}
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:CommunicationCommand):Promise<{id:string;replayed:boolean}>{validateCommunication(input);return await this.call(auth,interaction,true,input) as {id:string;replayed:boolean};}
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,recordId:string,context:CommunicationContext):Promise<Record<string,unknown>|null>{return await this.call(auth,interaction,false,{...context,recordId}) as Record<string,unknown>|null;}
}
