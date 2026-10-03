import {randomUUID as uid} from 'node:crypto';
import {paymentFixture} from './h3-payment-fixtures.ts';
import {read,write,type isolatedAllocation} from './h3-allocation-isolated.ts';
import type {AllocationCommand} from '../../src/infrastructure/postgres/h3-allocation-adapter.ts';
import type {AllocationDestination} from '../../src/domain/payment-allocation.ts';
export type {AllocationCommand};
type H=Awaited<ReturnType<typeof isolatedAllocation>>;
export async function allocationFixture(h:H,received='500.00',correspondence='500.00',stage='verified'){
 const f=await paymentFixture(h,received,true,'1000.00');
 if(stage!=='none')await h.payments.apply(await h.auth(),write,f.detect);
 if(!['none','detected'].includes(stage))await h.payments.apply(await h.auth(),write,await f.receive());
 const p=await f.propose(2,correspondence);
 if(['proposed','verified'].includes(stage))await h.payments.apply(await h.auth(),write,p);
 if(stage==='verified')await h.payments.apply(await h.auth(),write,await f.verify(p));
 const see=async()=>(await h.allocations.read(await h.auth(),read,f.paymentId))!;
 const attest=async(q:AllocationCommand,certainty='reviewed',source_kind='manual'):Promise<AllocationCommand>=>{
  if(!q.evidenceId)return q;
  const value=Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId','calculation'].includes(k)&&v!==undefined));
  const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(value)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
  return {...q,evidenceId:await f.proof(f.paymentId,`allocation:${q.action}:${hash}`,certainty,source_kind,q.at)};
 };
 const destination:AllocationDestination={bookingId:f.f.b.bookingId,purpose:'obligation',reference:'SYNTHETIC expected initial',scheduleId:f.f.q.scheduleId!,slot:'initial'};
 const command=async(action:AllocationCommand['action'],change:Partial<AllocationCommand>={}):Promise<AllocationCommand>=>{const state=await see();return attest({action,operationId:uid(),paymentId:f.paymentId,expectedRevision:state?.revision??0,expectedPaymentRevision:state?.paymentRevision??0,sourceRef:'SYNTHETIC verified destination',reason:'SYNTHETIC Administrator funds decision',at:f.at,evidenceId:uid(),...change});};
 const assign=async(amount=correspondence,start='0.00',dest=destination)=>command('assign',{allocationId:uid(),reconciliationId:p.reconciliationId,expectedReconciliationRevision:stage==='proposed'?1:2,start,amount,destination:dest,expectedScheduleRevision:1});
 const consume=async(q:AllocationCommand,amount=q.amount!,start=q.start!)=>command('consume',{allocationId:q.allocationId,amount,start,destination:q.destination});
 const reverse=async(act:string)=>command('reverse',{originalActId:act,cause:'correction'});
 return {...f,p,destination,see,attest,command,assign,consume,reverse};
}
