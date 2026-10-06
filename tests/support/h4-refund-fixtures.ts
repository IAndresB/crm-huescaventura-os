import {randomUUID as uid} from 'node:crypto';
import {type isolatedRefund,write,read} from './h4-refund-isolated.ts';
import {allocationFixture} from './h3-allocation-fixtures.ts';
import {cancellationFixture} from './h4-cancellation-fixtures.ts';
import {incidentFixture} from './h4-incident-fixtures.ts';
import {canonicalCommercial} from '../../src/domain/commercial-progress.ts';
import {fingerprintHumanApprovalMaterial as mf,fingerprintHumanApprovalPart as pf,type HumanApprovalMaterial} from '../../src/infrastructure/postgres/h0-011-adapter.ts';
import type {RefundCommand,RefundPortion,RefundAuthorization} from '../../src/domain/refund.ts';
type H=Awaited<ReturnType<typeof isolatedRefund>>;
export async function refundFixture(h:H,amount='200.00',received=amount,cause:'voluntary'|'provider'='provider'){
 const a=await allocationFixture(h,received,received,'verified',amount),c=await cancellationFixture(h,{existing:a.f,amount}),id=uid(),bid=c.b.bookingId;
 const det=await c.command();await c.run(await c.attest({...det,facts:{...det.facts!,cause}}));
 const view=async()=>h.refunds.read(await h.auth(),read,bid,id);
 const attest=async(q:RefundCommand,certainty='reviewed')=>{const material=Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId'].includes(k)&&v!==undefined));return {...q,evidenceId:await a.proof(id,'refund:'+q.action+':'+await c.conf.hash(material),certainty,'manual',q.at)};};
 const command=async(action:RefundCommand['action'],change:Partial<RefundCommand>={})=>attest({action,operationId:uid(),refundId:id,bookingId:bid,expectedRevision:(await view())?.revision??0,sourceRef:'SYNTHETIC authorized statement',reason:'SYNTHETIC exact domain fact',at:new Date().toISOString(),evidenceId:uid(),...change});
 const request=()=>command('request',{requesterId:a.f.f.accepterId,paymentIds:[a.paymentId],cause:'voluntary',affectedScope:c.scope.id});
 const determine=async()=>command('determine',{determinationId:c.did,determinationRevision:(await c.see()).revision});
 const portion=async(value=amount,start='0.00',allocationId?:string):Promise<RefundPortion>=>{const x=await a.see();return {paymentId:a.paymentId,reconciliationId:a.p.reconciliationId!,start,amount:value,paymentRevision:x.paymentRevision,fundRevision:x.revision,...(allocationId?{allocationId}:{})};};
 const authorization=async(value=amount,parts?:RefundPortion[],extra:Partial<RefundAuthorization>={})=>command('authorize',{authorization:{amount:value,recipientId:a.f.f.accepterId,method:'bank_transfer',cause,effect:'refund-contractual-right',conditions:'SYNTHETIC exact scope and no bank execution',portions:parts??[await portion(value)],...extra}});
 const approval=async(q:RefundCommand)=>{const proposal='refund-proposal-'+uid(),decision='refund-decision-'+uid(),part='refund-part-'+uid(),reserve='refund-reserve-'+uid(),au=q.authorization!;
  const material:HumanApprovalMaterial={action:'refund-authorize',contentVersion:'h4-015-v1',content:canonicalCommercial(q),recipient:{state:'value',value:au.recipientId},amount:{state:'value',value:au.amount},conditions:{state:'value',value:au.conditions},scope:h.scope,effect:'authorize-refund-fact',destination:{state:'value',value:au.recipientId},parts:[{partId:part,action:'refund-authorize',contentVersion:'h4-015-v1',content:canonicalCommercial(q),recipient:{state:'value',value:au.recipientId},amount:{state:'value',value:au.amount},conditions:{state:'value',value:au.conditions},scope:h.scope,effect:'authorize-refund-fact'}]};
  await h.tte.propose(await h.auth(),write,proposal,q.origin==='ai'?'ai':'human',material);await h.tte.decide(await h.auth(),write,'refund-decide-'+uid(),proposal,decision,'approved','SYNTHETIC exact Administrator approval',mf(material));
  const execute=async(input=q,commandId=reserve,executor=h.tte)=>executor.authorizeRefund(await h.auth(),write,commandId,proposal,decision,part,mf(material),pf(material.parts[0]!),material,input);
  return {proposal,decision,part,reserve,material,execute};};
 const movement=async(value='80.00',start='0.00',change:Partial<RefundCommand>={})=>command('record',{movement:{identity:{source:'SYNTHETIC verified bank statement',account:'SYNTHETIC bank account A',externalId:uid()},amount:value,recipientId:a.f.f.accepterId,method:'bank_transfer',occurredAt:new Date().toISOString(),reference:'SYNTHETIC movement ref',portions:[await portion(value,start)]},...change});
 const run=async(q:RefundCommand)=>h.refunds.apply(await h.auth(),write,q);
 const incident=async()=>{const inc=await incidentFixture(h,undefined,{bookingId:bid,serviceId:c.detail.services[0]!.id});await h.incidents.apply(await h.auth(),write,await inc.command('detect',{...inc.data,description:'SYNTHETIC Refund output requires verification',facts:'SYNTHETIC durable output/attempt record',hypothesis:'SYNTHETIC outcome not yet verified',impact:{...inc.impact,basis:'SYNTHETIC Refund outcome affects only its economic scope'}}));return inc;};
 return {a,c,id,bid,view,attest,command,request,determine,portion,authorization,approval,movement,run,incident};
}
