import {randomUUID as uid} from 'node:crypto';
import {type isolatedProviderPayment,write,read} from './h3-provider-payment-isolated.ts';
import {suplidoFixture} from './h3-suplido-fixtures.ts';
import {fingerprintHumanApprovalMaterial as mf,fingerprintHumanApprovalPart as pf,type HumanApprovalMaterial} from '../../src/infrastructure/postgres/h0-011-adapter.ts';
import {canonicalCommercial} from '../../src/domain/commercial-progress.ts';
import type {ProviderPaymentCommand,OutgoingPortion} from '../../src/domain/provider-payment.ts';
export type {ProviderPaymentCommand};
type H=Awaited<ReturnType<typeof isolatedProviderPayment>>;
export async function providerPaymentFixture(h:H,received='700.00',due='500.00',nature:'external'|'internal'='external'){
 const su=await suplidoFixture(h,received,due,nature);await h.suplidos.apply(await h.auth(),write,await su.open());
 const id=uid(),providerId=su.invoice.provider.id;
 const basis={providerRevisionId:su.basis.providerRevisionId,serviceId:su.basis.serviceId,expectedAmount:due,confirmedAmount:null,obligationRef:'SYNTHETIC service provider obligation',sourceRef:'SYNTHETIC provider due',version:'1'};
 const view=async()=>h.providerPayments.read(await h.auth(),read,id,su.bookingId);
 const attest=async(q:ProviderPaymentCommand,certainty='reviewed',source_kind='manual')=>{
  const material=Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId'].includes(k)&&v!==undefined));
  const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(material)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
  return {...q,evidenceId:await su.funds.proof(id,`provider-payment:${q.action}:${hash}`,certainty,source_kind,q.at)};
 };
 const command=async(action:ProviderPaymentCommand['action'],change:Partial<ProviderPaymentCommand>={})=>attest({action,operationId:uid(),providerPaymentId:id,bookingId:su.bookingId,suplidoId:su.suplidoId,expectedRevision:(await view())?.revision??0,sourceRef:'SYNTHETIC manual bank contrast',reason:'SYNTHETIC Administrator verified fact',at:new Date().toISOString(),evidenceId:uid(),...change});
 const open=()=>command('open',{basis,expectedRevision:0});
 const assign=async(amount=due,start='0.00',purpose:'managed_client_funds'|'fee'='managed_client_funds')=>{const q=await su.assign(amount,start,purpose);if(purpose==='managed_client_funds')await h.suplidos.apply(await h.auth(),write,await su.fundsCommand([q.allocationId!]));return q;};
 const portion=async(a:{allocationId?:string;start?:string;amount?:string},amount=a.amount!,start=a.start!):Promise<OutgoingPortion>=>{const funds=await su.funds.see();return {allocationId:a.allocationId!,paymentId:su.funds.paymentId,start,amount,fundRevision:funds.revision,paymentRevision:funds.paymentRevision};};
 const movement=async(parts:readonly OutgoingPortion[],amount='200.00',identity=uid())=>command('record',{movement:{identity:{source:'SYNTHETIC authorized statement',externalId:identity},providerId,serviceId:basis.serviceId,amount,occurredAt:new Date().toISOString(),method:'SYNTHETIC manual transfer',reference:'SYNTHETIC outgoing '+identity,sourceRef:'SYNTHETIC individually verified external movement',correspondenceSourceRef:'SYNTHETIC independent outgoing correspondence',portions:parts}});
 const schedule=async(parts:readonly OutgoingPortion[]=[],amount=due)=>command('schedule',{schedule:{amount,recipientId:providerId,method:'SYNTHETIC manual transfer',scheduledDate:'2026-10-05',conditions:'SYNTHETIC only internal intention; no bank dispatch',fundsKind:parts.length?'verified':'planned',portions:parts}});
 const approval=async(q:ProviderPaymentCommand,evidence?:HumanApprovalMaterial["evidence"])=>{
  const proposal='pp-proposal-'+uid(),decision='pp-decision-'+uid(),part='pp-part-'+uid(),reserve='pp-reserve-'+uid();
  const material:HumanApprovalMaterial={action:'provider-payment-schedule',contentVersion:'h3-011-v1',content:canonicalCommercial(q),recipient:{state:'value',value:providerId},amount:{state:'value',value:q.schedule!.amount},conditions:{state:'value',value:q.schedule!.conditions},scope:h.scope,effect:'record-payment-intention',destination:{state:'value',value:providerId},parts:[{partId:part,action:'provider-payment-schedule',contentVersion:'h3-011-v1',content:canonicalCommercial(q),recipient:{state:'value',value:providerId},amount:{state:'value',value:q.schedule!.amount},conditions:{state:'value',value:q.schedule!.conditions},scope:h.scope,effect:'record-payment-intention'}]};
  if(evidence)(material as {evidence?:HumanApprovalMaterial['evidence']}).evidence=evidence;
  await h.tte.propose(await h.auth(),write,proposal,q.origin==='ai'?'ai':'human',material);await h.tte.decide(await h.auth(),write,'pp-decide-'+uid(),proposal,decision,'approved','SYNTHETIC exact Administrator intention',mf(material));
  const execute=(input=q,commandId=reserve,executor=h.tte)=>h.auth().then(auth=>executor.scheduleProviderPayment(auth,write,commandId,proposal,decision,part,mf(material),pf(material.parts[0]!),material,input));
  return {proposal,decision,part,reserve,material,execute};
 };
 return {su,id,providerId,basis,view,attest,command,open,assign,portion,movement,schedule,approval};
}
