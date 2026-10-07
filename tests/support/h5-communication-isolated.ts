import {readFile} from 'node:fs/promises';
import {randomUUID as uid} from 'node:crypto';
import {isolatedAlerts,read,write} from './h5-alert-isolated.ts';
import {H5005CommunicationAdapter,communicationApproval} from '../../src/infrastructure/postgres/h5-communication-adapter.ts';
import {fingerprintHumanApprovalMaterial} from '../../src/infrastructure/postgres/h0-011-adapter.ts';
import type {CommunicationCommand} from '../../src/domain/communication-review.ts';
export {read,write};
export const migration='supabase/migrations/20261007230734_h5_communication_review.sql';
export async function isolatedCommunications(label:string,port:number,previous=false){
 const h=await isolatedAlerts(label,port);try{if(!previous)await h.migration.unsafe(await readFile(migration,'utf8'));}catch(e){await h.close();throw e;}
 return {...h,communications:new H5005CommunicationAdapter({begin:async(options:any,work:any)=>h.runtime.begin(options,async(tx:any)=>work(new Proxy(tx,{get(target,key){const v=target[key];if(key!=='unsafe')return typeof v==='function'?v.bind(target):v;return async(...args:any[])=>{try{return await v.apply(target,args);}catch(e:any){console.log('H5006 SQL diagnostic',{code:e.code,message:e.message,where:e.where});throw e;}};}})))} as typeof h.runtime,h.f1,h.f2)};
}
export async function communicationFixture(h:Awaited<ReturnType<typeof isolatedCommunications>>,direction='outgoing',bookingId?:string){
 const contextId=bookingId??uid(),recordId=uid(),at='2026-10-07T12:00:00Z',context={contextKind:'booking' as const,contextId,purpose:'synthetic-communication-review'};
 const document=async(contentKind='transcript')=>{const id=uid();await h.evidence.apply(await h.auth(),write,{action:'create',operationId:uid(),targetId:id,kind:'document',material:{relation:'original',content_ref:'synthetic-original-'+id,content_kind:contentKind,author_ref:'synthetic-person',review_ref:'synthetic-authorized',storage_state:'reference_only'},sourceRef:'synthetic-PLAUD-authorized',...context,coverage:'synthetic scope',reason:'Autorización sintética explícita',occurredAt:at});return id;};
 const originalId=await document();
 await h.evidence.apply(await h.auth(),write,{action:'create',operationId:uid(),targetId:recordId,kind:'communication',material:{direction,channel:'telephone',sender_ref:'synthetic-person',recipient_ref:'synthetic-recipient',coverage:'synthetic scope',initial_fact:direction==='incoming'?'received':'none'},sourceRef:originalId,...context,coverage:'synthetic scope',reason:'Registro sintético autorizado',occurredAt:at});
 const proof=async(claim:string,coverage='participants',source_kind='manual',certainty='reviewed',when=at)=>{const id=uid();await h.evidence.apply(await h.auth(),write,{action:'create',operationId:uid(),targetId:id,kind:'evidence',material:{claim,coverage,certainty,source_kind,channel:'manual'},sourceRef:'synthetic-manual-record',...context,coverage,reason:'Prueba sintética explícita',occurredAt:when});return id;};
 const confirmedId=await proof('18');
 const base=()=>({...context,operationId:uid(),workId:uid(),recordId,reason:'Verificación sintética',sourceRef:'synthetic-source',at});
 const draft=():Extract<CommunicationCommand,{action:'draft'}>=>({...base(),action:'draft',previousId:null,material:{content:'Contenido sintético vinculante',coverage:'synthetic scope',recipient:'synthetic-recipient',nature:'sensitive',origin:'synthetic_automatic',pending:[],sourceRef:originalId}});
 const derive=(kind:'summary'|'note'|'candidate'='candidate'):Extract<CommunicationCommand,{action:'derive'}>=>({...base(),action:'derive',kind,originalId,content:kind==='candidate'?'quizá 16':'Resumen sintético',origin:'synthetic_automatic',review:'Revisión requerida',permissionRef:'synthetic-purpose-authorized',authorRef:'synthetic-generator',confirmedId:kind==='candidate'?confirmedId:null,confidence:.99,field:kind==='candidate'?'participants':null});
 const run=async(q:CommunicationCommand)=>h.communications.apply(await h.auth(),write,q);
 const see=async()=>await h.communications.read(await h.auth(),read,recordId,context) as any;
 const prepare=async(d:ReturnType<typeof draft>)=>run({...base(),action:'prepare',versionId:d.workId});
 const approve=async(d:ReturnType<typeof draft>)=>{
 const material=communicationApproval(h.scope,recordId,d.workId,d.material,d.material.recipient),proposal='p-'+uid(),decision='d-'+uid();
 await h.tte.propose(await h.auth(),write,proposal,'ai',material);
 await h.tte.decide(await h.auth(),write,'decide-'+uid(),proposal,decision,'approved','Revisión humana sintética',fingerprintHumanApprovalMaterial(material));return {material,proposal,decision};};
 const fact=async(kind:'sent'|'received'|'read'|'response',versionId:string|null=null):Promise<Extract<CommunicationCommand,{action:'fact'}>>=>{
 const party='synthetic-recipient',coverage='synthetic scope';const evidenceId=await proof(`synthetic:${kind}:${recordId}:${versionId??''}:${party}`,coverage);
 return {...base(),action:'fact',versionId,fact:kind,evidenceId,party,coverage,ambiguous:kind==='response',synthetic:true};};
 return {context,recordId,originalId,confirmedId,at,base,document,proof,draft,derive,run,see,prepare,approve,fact};
}
