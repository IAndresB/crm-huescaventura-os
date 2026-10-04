import {randomUUID} from 'node:crypto';
import {issueTrustedContext} from '../../application/trusted-context.ts';
import {isVerifiedAuth,type VerifiedAuthEvidence} from '../../application/verified-auth.ts';
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from '../../application/verified-interaction.ts';
import {canonicalCommercial} from '../../domain/commercial-progress.ts';
import {calculateOwnEconomics,ownReferences,type EconomicSource,type OwnEconomicsCommand,type OwnEconomicsView} from '../../domain/own-economics.ts';
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from './f1-codec.ts';
import {createF2Issuer,type F2SigningConfiguration} from './f2-codec.ts';
import {postgresF1Binding,type PostgresSql} from './transaction.ts';
export class H3013OwnEconomicsAdapter {
 private readonly sql:PostgresSql;private readonly f1:ReturnType<typeof createF1Issuer>;private readonly f2:ReturnType<typeof createF2Issuer>;
 constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration){this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);}
 private async call(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,write:boolean,input:Record<string,unknown>):Promise<unknown>{
 if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified||!isVerifiedServerInteraction(interaction,write?'interactive_action':'interactive_read'))throw new Error('OWN_ECONOMICS_AUTH_REQUIRED');
 return this.sql.begin('isolation level read committed',async tx=>{
 const row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>('select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)',[auth.subject,auth.sessionId!]))[0];if(!row?.epoch_id)throw new Error('OWN_ECONOMICS_DENIED');
 const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
 const invoke=async(tag:string,name:string,body:unknown)=>{const characters=Array.from(canonicalCommercial(body)),parts:string[]=[];for(let i=0;i<characters.length;i+=2000)parts.push(characters.slice(i,i+2000).join(''));const q=encodeF1Fields([tag,...parts]),context=issueTrustedContext({identityId:'h3-own-economics-server',identityKind:'technical',purpose:'h1-evidence',scope:row.admin_scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
 const h=this.f2(auth,identity,binding,write?'evidence_write':'evidence_read',q,interaction),t=this.f1(context,binding,write?'C03':'C01',q,{resource:'evidence',action:write?'write_evidence':'read_evidence'});return (await tx.unsafe<{data:unknown}[]>(`select crm_api.${name}($1,$2,$3,$4,$5) data`,[h.payload,h.mac,t.payload,t.mac,q]))[0]?.data;};
 if(!write)return invoke('CRM-H3-OWN-READ1','own_economics_read',input);
 const c=input as unknown as OwnEconomicsCommand;
 const sources=await invoke('CRM-H3-OWN-SOURCES1','own_economics_sources',{bookingId:c.bookingId,references:ownReferences(c.input)}) as EconomicSource;
 const computed=calculateOwnEconomics(c.input,sources,row.actor_id,c.at,c.reason,c.sourceRef);
 // The authoritative sources are carried once; C03 restores the identical retained projection.
 const wireComputed=Object.fromEntries(Object.entries(computed).filter(([key])=>!['bookingSource','modalities'].includes(key)));
 return invoke('CRM-H3-OWN1','own_economics_apply',{...c,sources,computed:wireComputed});
 });
 }
 async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,c:OwnEconomicsCommand):Promise<{id:string;replayed:boolean;result:OwnEconomicsView}>{
 if(Object.keys(c).some(k=>!['operationId','economyId','bookingId','scope','expectedRevision','expectedBookingRevision','at','sourceRef','reason','evidenceId','input'].includes(k)))throw new Error('OWN_ECONOMICS_INPUT_INVALID');
 return await this.call(auth,interaction,true,{...c}) as {id:string;replayed:boolean;result:OwnEconomicsView};
 }
 async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,economyId:string,bookingId:string):Promise<OwnEconomicsView|null>{return await this.call(auth,interaction,false,{economyId,bookingId}) as OwnEconomicsView|null;}
}
