import postgres from 'postgres';
import {createHash,randomUUID} from 'node:crypto';
import {canonicalWork,validateWork,type WorkCommand,type WorkContext} from '../../domain/persisted-work.ts';
import {issueTrustedContext} from '../../application/trusted-context.ts';
import {isVerifiedAuth,type VerifiedAuthEvidence} from '../../application/verified-auth.ts';
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from '../../application/verified-interaction.ts';
import {revalidateEvidence,type EvidenceRevalidationProvider,type VerifiedEvidence} from '../../application/evidence-revalidation.ts';
import {verifyWorkEffect,verifyWorkResult,type WorkResultVerifier} from '../../application/work-result-verification.ts';
import {fingerprintHumanApprovalMaterial,fingerprintHumanApprovalPart,type HumanApprovalMaterial} from './h0-011-adapter.ts';
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from './f1-codec.ts';
import {createF2Issuer,type F2SigningConfiguration,type F2Identity} from './f2-codec.ts';
import {postgresF1Binding,type PostgresTransaction} from './transaction.ts';

const sha=(v:Uint8Array)=>createHash('sha256').update(v).digest('hex');
interface Configuration {
 readonly databaseUrl:string;readonly capability:F1SigningConfiguration;readonly humanAuthorization:F2SigningConfiguration;
 readonly executorId:string;readonly resultVerifier?:WorkResultVerifier;readonly evidenceProvider?:EvidenceRevalidationProvider;
 readonly ssl?:postgres.Options<never>['ssl'];
}
export interface WorkSnapshot {
 readonly execution:any;readonly definition:any;readonly parts:any[];readonly attempts:any[];readonly history:any[];
}
export interface WorkReceipt {readonly replayed:boolean;readonly state:string;readonly attemptId?:string;readonly generation?:number;readonly [key:string]:unknown}

// D039 trusted composition. The facade never exposes SQL, an issuer, a callback,
// a transaction handle or a separate commit. HA/M02 remain the effect authority.
export function createPersistedWorkExecutor(config:Configuration):{
 apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,command:WorkCommand):Promise<WorkReceipt>;
 read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,executionId:string,context:WorkContext):Promise<WorkSnapshot|null>;
 close():Promise<void>;
} {
 if(!config.databaseUrl.trim()||!/^[a-z][a-z0-9-]{0,127}$/u.test(config.executorId)||Buffer.from(config.capability.key).equals(Buffer.from(config.humanAuthorization.key)))throw new Error('WORK_CONFIGURATION_INVALID');
 const sql=postgres(config.databaseUrl,{max:1,prepare:false,ssl:config.ssl??'require',onnotice:()=>{}});
 const f1=createF1Issuer(config.capability),f2=createF2Issuer(config.humanAuthorization);
 const context=(scope:string,purpose='h0-011-human-unit')=>issueTrustedContext({identityId:config.executorId,identityKind:'technical',purpose,scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
 async function identity(tx:PostgresTransaction,auth:VerifiedAuthEvidence):Promise<F2Identity>{
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified)throw new Error('WORK_DENIED');
  const [r]=await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>('select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)',[auth.subject,auth.sessionId]);
  if(!r?.epoch_id)throw new Error('WORK_DENIED');return {actorId:r.actor_id,scope:r.admin_scope,accessGeneration:r.access_generation,sessionId:auth.sessionId,epochId:r.epoch_id};
 }
 async function signatures(tx:PostgresTransaction,auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,q:Buffer,read=false){
  const who=await identity(tx,auth),binding=await postgresF1Binding(tx);
  const h=f2(auth,who,binding,read?'C01':'C03',q,interaction);
  const t=f1(context(who.scope,read?'h0-011-human-approval':undefined),binding,read?'C01':'C03',q,{resource:'human_approval',action:read?'read_proposal':'manage_effect'});
  return {who,binding,h,t};
 }
 async function read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,executionId:string,ctx:WorkContext):Promise<WorkSnapshot|null>{
  if(!isVerifiedServerInteraction(interaction,'interactive_read'))throw new Error('WORK_DENIED');
  const q=encodeF1Fields(['CRM-H5-WORK-READ1',canonicalWork({executionId,context:ctx})]);
  return await sql.begin('isolation level read committed',async tx=>{
   const {h,t}=await signatures(tx,auth,interaction,q,true);
   const [r]=await tx.unsafe<{data:WorkSnapshot|null}[]>('select crm_api.b08_work_read($1,$2,$3,$4,$5) data',[h.payload,h.mac,t.payload,t.mac,q]);return r!.data;
  }) as WorkSnapshot|null;
 }
 async function ha(tx:PostgresTransaction,auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,scope:string,action:string,key:string,data:string[],human=false,evidence?:VerifiedEvidence,evPart?:string,reserveIntent?:{effectId:string;recipient:string;version:string}){
  const q=encodeF1Fields(['CRM-H0-M04',action,key,encodeF1Fields(data).toString('hex')]);
  const binding=await postgresF1Binding(tx),t=f1(context(scope,human?'h0-011-human-unit':'h0-011-human-approval'),binding,'C03',q,{resource:'human_approval',action:'manage_effect'});
  const h=human?f2(auth,await identity(tx,auth),binding,'C03',q,interaction):{payload:null,mac:null};
  if(evidence){
   const micros=(s:string)=>(BigInt(Date.parse(s))*1000n).toString();
   const eq=encodeF1Fields(['CRM-HA-EVIDENCE1',key,data[0]!,evPart!,sha(q),evidence.reference,evidence.fingerprint,micros(evidence.checkedAt),micros(evidence.validUntil),micros(evidence.effectiveValidUntil),evidence.verifierIdentity,evidence.verifierKind]);
   const cap=f1(context(scope,'h0-011-evidence-revalidation'),binding,'C03',eq,{resource:'human_approval_evidence',action:'revalidate_evidence'});
   await tx.unsafe('select crm_api.h0_m04_revalidate_evidence($1,$2,$3,$4,$5,$6)',[cap.payload,cap.mac,eq,h.payload,h.mac,q]);
  }
  const [receipt]=await tx.unsafe<any[]>('select * from crm_api.h0_m04_command($1,$2,$3,$4,$5)',[h.payload,h.mac,t.payload,t.mac,q]);
  const partRecipient=reserveIntent;
  await ledger(tx,scope,key,receipt.state,partRecipient,human?{payload:h.payload!,mac:h.mac!,input:q}:undefined);
  return {...receipt,originalHuman:human?{payload:h.payload!,mac:h.mac!,input:q}:undefined};
 }
 async function ledger(tx:PostgresTransaction,scope:string,op:string,state:string,intent?:{effectId:string;recipient:string;version:string},human?:{payload:Buffer;mac:Buffer;input:Buffer}){
  const root='ha-'+op,reason='H0-011 '+state,c=human?issueTrustedContext({identityId:'h0-011-server-bridge',identityKind:'technical',purpose:'h0-011-human-unit',scope,requestId:randomUUID(),serverTime:new Date().toISOString()}):context(scope,'h0-011-human-approval');
  const i=intent?['true',intent.effectId,'intent-'+intent.effectId.slice(7),intent.recipient,intent.version,sha(encodeF1Fields(['CRM-INTENT-MATERIAL1',intent.effectId,intent.recipient,intent.version]))]:['false','','','','',''];
  const fp=sha(encodeF1Fields(['CRM-UNIT-MATERIAL1','technical-state-change',root,'0',state,reason,'h0-011','','none',c.identityId,c.identityKind,c.purpose,c.scope,...i]));
  const q=encodeF1Fields(['CRM-UNIT1',op,'technical-state-change',root,'0',fp,'attempt-'+randomUUID(),reason,'h0-011','',state,'none',...i]);
  const t=f1(c,await postgresF1Binding(tx),'C03',q,{resource:'internal_unit',action:'commit_internal_unit'});
  if(human)await tx.unsafe('select * from crm_api.commit_internal_unit($1,$2,$3,$4,$5,$6)',[t.payload,t.mac,q,human.payload,human.mac,human.input]);else await tx.unsafe('select * from crm_api.commit_internal_unit($1,$2,$3)',[t.payload,t.mac,q]);
 }
 async function apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,command:WorkCommand):Promise<WorkReceipt>{
  validateWork(command);if(!isVerifiedServerInteraction(interaction,'interactive_action'))throw new Error('WORK_DENIED');
  // Canonical public input is the idempotency identity. Attestations and HA IDs
  // are server-composed auxiliary data and do not change a replay's identity.
  const m:any={...command,executorId:config.executorId};
  if('material'in command){const material=command.material as HumanApprovalMaterial;m.materialFingerprint=fingerprintHumanApprovalMaterial(material);m.partFingerprints=Object.fromEntries(material.parts.map(p=>[p.partId,fingerprintHumanApprovalPart(p)]));}
  const q=encodeF1Fields(['CRM-H5-WORK-1',canonicalWork(m)]);
  const prior=await sql.begin('isolation level read committed',async tx=>{
   const {h,t}=await signatures(tx,auth,interaction,q);const [r]=await tx.unsafe<{present:boolean}[]>('select crm_api.b08_work_probe($1,$2,$3,$4,$5) present',[h.payload,h.mac,t.payload,t.mac,q]);await tx.unsafe('rollback');return r!.present;
  });
  let proof:unknown=null,evidence:VerifiedEvidence|undefined;
  if(!prior&&command.action==='result'&&command.outcome!=='uncertain')proof=await verifyWorkResult(config.resultVerifier,{executionId:command.executionId,attemptId:command.attemptId,outcome:command.outcome,resultRef:command.resultRef});
  if(!prior&&command.action==='start'){
   const material=command.material as HumanApprovalMaterial;
   {
    // Provider outside all transactions and locks. Exact proposal/part is
    // obtained by an authorized read; SQL rechecks it after taking the lock.
    const snapshot=await sql.begin('isolation level read committed',async tx=>{
     const {h,t}=await signatures(tx,auth,interaction,q);const [r]=await tx.unsafe<{data:any}[]>('select crm_api.b08_work_probe_material($1,$2,$3,$4,$5) data',[h.payload,h.mac,t.payload,t.mac,q]);await tx.unsafe('rollback');return r!.data;
    });
    await verifyWorkEffect(config.resultVerifier,{executionId:command.executionId,proposalId:snapshot.proposal_id,partId:snapshot.part_id,materialFingerprint:m.materialFingerprint});
    if(material.evidence){
    if(!config.evidenceProvider)throw new Error('EVIDENCE_REVALIDATION_DENIED');
    evidence=await revalidateEvidence(config.evidenceProvider,{...material.evidence,approvedExpiresAt:material.evidence.expiresAt,proposalId:snapshot.proposal_id,commandId:'reserve-'+command.executionId+'-'+snapshot.part_id,partId:snapshot.part_id,materialFingerprint:m.materialFingerprint,scope:material.scope});
    }
   }
  }
  let commitStarted=false;
  try{return await sql.begin('isolation level read committed',async tx=>{
   const {h,t,who}=await signatures(tx,auth,interaction,q);
   const [locked]=await tx.unsafe<{data:any}[]>('select crm_api.b08_work_lock($1,$2,$3,$4,$5) data',[h.payload,h.mac,t.payload,t.mac,q]);
   let originalHuman:{payload:Buffer;mac:Buffer;input:Buffer}|undefined;
   let reservationId:string|null=null,intent:{effectId:string;recipient:string;version:string}|undefined,haKey:string|undefined;
   if(!locked!.data.replayed&&command.action==='start'){
    const d=locked!.data,material=command.material as HumanApprovalMaterial,part=material.parts.find(p=>p.partId===d.part_id)!;
    if(!part||part.recipient.state!=='value')throw new Error('WORK_MATERIAL_CHANGED');
    const stable=sha(Buffer.from(d.proposal_id+':'+d.part_id)).slice(0,32);haKey='reserve-'+command.executionId+'-'+d.part_id;
    intent={effectId:'effect-'+stable,recipient:part.recipient.value,version:part.contentVersion};
    const r=await ha(tx,auth,interaction,who.scope,'reserve',haKey,[d.proposal_id,d.decision_id,d.part_id,m.materialFingerprint,m.partFingerprints[d.part_id],'effect-'+stable,'intent-'+stable],true,evidence,d.part_id,intent);
    reservationId=r.reservation_id;originalHuman=r.originalHuman;
    await ha(tx,auth,interaction,who.scope,'attempt','contact-'+command.operationId,[reservationId!,'a-'+command.attemptId]);
    intent={effectId:'effect-'+stable,recipient:part.recipient.value,version:part.contentVersion};
   }
   const [row]=await tx.unsafe<{data:any}[]>("select crm_api.b08_work_apply($1,$2,$3,$4,$5,convert_from($6::bytea,'UTF8')::jsonb) data",[h.payload,h.mac,t.payload,t.mac,q,Buffer.from(JSON.stringify({reservationId,proof}))]);
   const result=row!.data,transition=result.haTransition;
   if(!result.replayed){
    if(transition)await ha(tx,auth,interaction,who.scope,transition.action,'result-'+command.operationId,[transition.reservationId,'a-'+transition.attemptId,transition.outcome,transition.resultRef]);
    await ledger(tx,who.scope,'w-'+command.operationId,command.action);
   }
   commitStarted=true;
   // Mandatory final reauthorization after constraints, waits and all HA/M02
   // writes. COMMIT is in this same server message, with no caller hook.
   const bytea=(v:Buffer)=>"decode('"+v.toString('hex')+"','hex')";
   await tx.unsafe('set constraints all immediate; select crm_api.b08_work_finalize('+[h.payload,h.mac,t.payload,t.mac,q].map(bytea).join(',')+');'+(originalHuman?' select crm_api.b08_ha_finalize('+[originalHuman.payload,originalHuman.mac,originalHuman.input].map(bytea).join(',')+');':'')+' commit');
   const {haTransition:_haTransition,...receipt}=result;return receipt;
  }) as WorkReceipt;}catch(error){
   const code=error&&typeof error==='object'&&'code'in error?String(error.code):'';
   if(commitStarted&&(!/^[0-9A-Z]{5}$/u.test(code)||code.startsWith('08')||code.startsWith('57')))throw new WorkCommitUncertainError(command.operationId);
   throw error;
  }
 }
 return Object.freeze({apply,read,close:()=>sql.end({timeout:5})});
}
export class WorkCommitUncertainError extends Error {
 readonly operationId:string;
 constructor(operationId:string){super('WORK_COMMIT_UNCERTAIN');this.operationId=operationId;}
}
