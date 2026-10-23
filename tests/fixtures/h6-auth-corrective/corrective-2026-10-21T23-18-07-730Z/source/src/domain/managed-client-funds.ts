// Operational D013 coordination, never fiscal authority or an external payment command.
import {moneyDifference} from './exact-money.ts';
import {requireInvoiceAmount} from './provider-invoice.ts';
export type SuplidoComponent='amount'|'funds'|'invoice'|'reconciliation'|'payment'|'obligation'|'mandate';
export interface SuplidoBasis {readonly clientId:string;readonly providerRevisionId:string;readonly serviceId:string;readonly expectedAmount:string|null;readonly confirmedAmount:string|null;readonly sourceRef:string;readonly version:string;}
export interface MandateFact {readonly id:string;readonly version:string;readonly content:string;readonly acceptanceRef:string;readonly acceptedBy:string;readonly acceptedAt:string;readonly evidenceId:string;}
export interface DocumentaryFacts {
 readonly invoice:{readonly clientId:string;readonly providerId:string;readonly serviceId:string;readonly amount:string;readonly linked:boolean;readonly sourceRef:string}|null;
 readonly payment:{readonly clientId:string;readonly providerId:string;readonly serviceId:string;readonly amount:string;readonly performed:boolean;readonly id:string;readonly sourceRef:string;readonly evidenceId:string}|null;
 readonly reconciliation:{readonly amount:string;readonly verified:boolean;readonly paymentRef:string;readonly sourceRef:string;readonly evidenceId:string}|null;
 readonly clientId:string;readonly providerId:string;readonly serviceId:string;readonly amount:string|null;
 readonly differences:readonly SuplidoComponent[];
}
// C02 only. Callers must supply independently accredited facts. Runtime H3-009 cannot supply a payment.
export function assessSuplido(f:DocumentaryFacts):Readonly<{state:'Gestión abierta'|'Documentalmente resuelto';pending:readonly string[];basis:DocumentaryFacts}> {
 const pending:string[]=[];if(f.amount===null)pending.push('amount');else requireInvoiceAmount(f.amount);
 const i=f.invoice,p=f.payment,r=f.reconciliation;
 if(!i?.linked||!i.sourceRef||i.clientId!==f.clientId||i.providerId!==f.providerId||i.serviceId!==f.serviceId||i.amount!==f.amount)pending.push('invoice');
 if(!p?.performed||!p.sourceRef||!p.evidenceId||p.clientId!==f.clientId||p.providerId!==f.providerId||p.serviceId!==f.serviceId||p.amount!==f.amount)pending.push('payment');
 if(!r?.verified||!r.sourceRef||!r.evidenceId||!r.paymentRef||r.paymentRef!==p?.id||r.amount!==f.amount)pending.push('reconciliation');
 pending.push(...f.differences.map(c=>`difference:${c}`));
 return {state:pending.length?'Gestión abierta':'Documentalmente resuelto',pending,basis:f};
}
export function managedFundsComparison(due:string,usable:string):Readonly<{remaining:string;excess:string}> {
 requireInvoiceAmount(due);requireInvoiceAmount(usable);const d=moneyDifference(due,usable);
 return d.startsWith('-')?{remaining:'0.00',excess:moneyDifference('0.00',d)}:{remaining:d,excess:'0.00'};
}
