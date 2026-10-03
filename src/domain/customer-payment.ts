// H3-003/004. Correspondence portions only: no allocation, consumption or coverage engine.
import {moneyDifference,remainingRight,MONEY_ALGORITHM_VERSION} from './exact-money.ts';
export interface MovementIdentity {readonly sourceRef:string;readonly externalId:string;}
export interface Detection {
 readonly amount:string|null;readonly payerRef:string|null;readonly date:string|null;
 readonly method:'bank_transfer'|null;readonly reference:string|null;readonly bookingId:string|null;
 readonly identity:MovementIdentity|null;
}
export interface Correspondence {
 readonly id:string;readonly start:string;readonly amount:string;readonly bookingId:string;
 readonly scheduleId:string;readonly slot:'initial'|'balance';readonly status:'proposed'|'verified';
 readonly revision:number;readonly evidenceId:string;readonly sourceRef:string;
}
export interface PaymentIncident {readonly id:string;readonly reconciliationId:string|null;
 readonly start:string;readonly amount:string;readonly resolved:boolean;readonly reason:string;}
export interface PaymentSnapshot {
 readonly detection:Detection;readonly receipt:Readonly<{amount:string;sourceRef:string;evidenceId:string;identity:MovementIdentity;discrepancy:string|null}>|null;
 readonly correspondences:readonly Correspondence[];readonly incidents:readonly PaymentIncident[];
 readonly duplicateOf:string|null;readonly revision:number;
}
const cmp=(a:string,b:string)=>{const d=moneyDifference(a,b);return d==='0.00'?0:d.startsWith('-')?-1:1;};
const add=(a:string,b:string)=>moneyDifference(a,'-'+b);
export function requirePaymentAmount(value:unknown,positive=false):string {
 if(typeof value!=='string'||value.length>260||! /^(0|[1-9]\d*)\.\d{2}$/.test(value)
 ||moneyDifference(value,'0.00')!==value||(positive&&value==='0.00')) throw new Error('PAYMENT_AMOUNT_INVALID');
 return value;
}
export function paymentSummary(snapshot:PaymentSnapshot){
 const gross=snapshot.receipt?.amount??null;
 if(gross===null)return {grossReceived:null,verifiedCorrespondence:'0.00',unreconciled:null,suspended:null,base:snapshot.correspondences.length?'pending_reconciliation':'detected',incidence:snapshot.incidents.some(x=>!x.resolved),algorithmVersion:MONEY_ALGORITHM_VERSION};
 requirePaymentAmount(gross,true);
 const ranges=snapshot.incidents.filter(i=>!i.resolved).map(i=>({start:i.start,end:add(i.start,i.amount)})).sort((a,b)=>cmp(a.start,b.start));
 const union:{start:string;end:string}[]=[];
 for(const r of ranges){requirePaymentAmount(r.start);requirePaymentAmount(r.end,true);if(cmp(r.end,gross)>0)throw new Error('PAYMENT_PORTION_INVALID');const last=union.at(-1);if(last&&cmp(r.start,last.end)<=0){if(cmp(r.end,last.end)>0)last.end=r.end;}else union.push({...r});}
 let verified='0.00',historical='0.00';const intervals:{start:string;end:string}[]=[];
 for(const c of snapshot.correspondences.filter(c=>c.status==='verified')){
  requirePaymentAmount(c.start);requirePaymentAmount(c.amount,true);const end=add(c.start,c.amount);
  if(cmp(end,gross)>0||intervals.some(x=>cmp(c.start,x.end)<0&&cmp(end,x.start)>0))throw new Error('PAYMENT_PORTION_INVALID');
  intervals.push({start:c.start,end});historical=add(historical,c.amount);let current=c.amount;
  for(const i of union){const lo=cmp(c.start,i.start)>0?c.start:i.start,hi=cmp(end,i.end)<0?end:i.end;if(cmp(hi,lo)>0)current=remainingRight(current,[moneyDifference(hi,lo)]);}
  verified=add(verified,current);
 }
 const suspended=union.reduce((s,i)=>add(s,moneyDifference(i.end,i.start)),'0.00');
 return {grossReceived:gross,verifiedCorrespondence:verified,unreconciled:remainingRight(gross,[verified]),suspended,
 base:historical===gross?'reconciled':snapshot.correspondences.length?'pending_reconciliation':'detected',incidence:union.length>0,algorithmVersion:MONEY_ALGORITHM_VERSION};
}
