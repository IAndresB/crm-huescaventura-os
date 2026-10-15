import {randomUUID as uid} from 'node:crypto';
import {ownEconomicsFixture} from './h3-own-economics-fixtures.ts';
import {paymentFixture} from './h3-payment-fixtures.ts';
import {type isolatedClosures,write,read} from './h5-closure-isolated.ts';
import type {ObligationCommand} from '../../src/infrastructure/postgres/h3-obligation-adapter.ts';
import type {AllocationCommand} from '../../src/infrastructure/postgres/h3-allocation-adapter.ts';
export async function settledInternalFixture(h:Awaited<ReturnType<typeof isolatedClosures>>){
 const own=await ownEconomicsFixture(h);const input={...structuredClone(own.input),costs:[...structuredClone(own.input.costs)]};for(const service of own.b.detail.services.slice(1)){input.costs.push({...structuredClone(input.costs[0]!),id:'cost-'+service.id,serviceId:service.id});}await h.ownEconomics.apply(await h.auth(),write,await own.command({input}));
 const payment=await paymentFixture(h,'2100.00',true,'2100.00'),bookingId=own.bookingId,scheduleId=uid(),at=payment.f.q.at;
 const hash=async(x:unknown)=>String((await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(x)}::text::jsonb::text,'UTF8'),'sha256'),'hex') h`)[0]!.h);
 const raw={...payment.f.q,operationId:uid(),bookingId,scheduleId,scopeId:bookingId,definition:{...payment.f.q.definition!,base:{...payment.f.q.definition!.base,sourceRef:own.b.q.versionId},reference:{...payment.f.q.definition!.reference,scopeId:bookingId,sourceRef:own.b.q.versionId}}} as ObligationCommand;
 const material=Object.fromEntries(Object.entries(raw).filter(([k,v])=>!['operationId','evidenceId','computed'].includes(k)&&v!==undefined));
 const q={...raw,evidenceId:await own.b.f.proof('obligation:determine:'+await hash(material),own.b.q.coverage,at)};
 await h.obligations.apply(await h.auth(),write,q);
 await h.payments.apply(await h.auth(),write,await payment.attest({...payment.detect,detection:{...payment.detect.detection!,bookingId}}));
 await h.payments.apply(await h.auth(),write,await payment.receive());
 for(const [index,slot] of ['initial','balance'].entries()){
  const base=await payment.propose(index===0?2:4,'1050.00',index===0?'0.00':'1050.00');
  const proposal=await payment.attest({...base,bookingId,scheduleId,slot:slot as 'initial'|'balance'});await h.payments.apply(await h.auth(),write,proposal);
  await h.payments.apply(await h.auth(),write,await payment.verify(proposal,index===0?3:5));
  const funds=(await h.allocations.read(await h.auth(),read,payment.paymentId))!;
  const allocation:AllocationCommand={action:'assign',operationId:uid(),paymentId:payment.paymentId,expectedRevision:funds.revision,expectedPaymentRevision:funds.paymentRevision,sourceRef:'SYNTHETIC whole obligation settlement',reason:'SYNTHETIC verified actual receipt allocation',at:payment.at,evidenceId:uid(),allocationId:uid(),reconciliationId:proposal.reconciliationId!,expectedReconciliationRevision:2,start:index===0?'0.00':'1050.00',amount:'1050.00',destination:{bookingId,purpose:'obligation',reference:'SYNTHETIC actual obligation',scheduleId,slot:slot as 'initial'|'balance'},expectedScheduleRevision:1};
  const value=Object.fromEntries(Object.entries(allocation).filter(([k,v])=>!['operationId','evidenceId','calculation'].includes(k)&&v!==undefined));
  await h.allocations.apply(await h.auth(),write,{...allocation,evidenceId:await payment.proof(payment.paymentId,'allocation:assign:'+await hash(value),'reviewed','manual',payment.at)});
 }
 return {...own,payment,scheduleId};
}
