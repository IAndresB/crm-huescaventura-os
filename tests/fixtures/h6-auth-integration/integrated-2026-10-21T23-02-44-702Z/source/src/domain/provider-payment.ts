// H3-011: records independently verified reality; never initiates a bank effect.
import {moneyDifference} from './exact-money.ts';
import {requireInvoiceAmount} from './provider-invoice.ts';
export interface OutgoingPortion {readonly allocationId:string;readonly paymentId:string;readonly start:string;readonly amount:string;readonly fundRevision:number;readonly paymentRevision:number;}
export interface ProviderPaymentBasis {readonly providerRevisionId:string;readonly serviceId:string;readonly expectedAmount:string|null;readonly confirmedAmount:string|null;readonly obligationRef:string;readonly sourceRef:string;readonly version:string;}
export interface ProviderPaymentSchedule {readonly amount:string;readonly recipientId:string;readonly method:string;readonly scheduledDate:string;readonly conditions:string;readonly fundsKind:'verified'|'planned';readonly portions:readonly OutgoingPortion[];}
export interface AccreditedOutgoing {readonly identity:{readonly source:string;readonly externalId:string};readonly providerId:string;readonly serviceId:string;readonly amount:string;readonly occurredAt:string;readonly method:string;readonly reference:string;readonly sourceRef:string;readonly correspondenceSourceRef:string;readonly portions:readonly OutgoingPortion[];}
export interface ProviderPaymentCommand {
 readonly action:'open'|'confirm'|'schedule'|'record'|'incident'|'resolve'|'correct'|'withdraw';
 readonly operationId:string;readonly providerPaymentId:string;readonly bookingId:string;readonly expectedRevision:number;
 readonly sourceRef:string;readonly reason:string;readonly at:string;readonly evidenceId:string;readonly origin?:'manual'|'ai';
 readonly suplidoId?:string;readonly basis?:ProviderPaymentBasis;readonly confirmedAmount?:string;readonly schedule?:ProviderPaymentSchedule;readonly movement?:AccreditedOutgoing;
 readonly incident?:{readonly id:string;readonly sourceRef:string;readonly attemptRef:string;readonly result:'uncertain'|'failed_verified'|'discrepancy';readonly scope:string;};
 readonly incidentId?:string;readonly previousEffectCheck?:'not_occurred'|'occurred_verified';readonly originalMovementId?:string;
 readonly noExecution?:boolean;readonly noPendingExecution?:boolean;readonly noUnknownResult?:boolean;
}
export interface ProviderPaymentView {readonly id:string;readonly bookingId:string;readonly revision:number;readonly status:'Pendiente'|'Programado'|'Pagado'|'Incidencia';readonly basis:ProviderPaymentBasis;readonly paid:string;readonly remaining:string;readonly complete:boolean;readonly schedule:Record<string,unknown>|null;readonly movements:readonly Record<string,unknown>[];readonly incidents:readonly Record<string,unknown>[];readonly corrections:readonly Record<string,unknown>[];readonly history:readonly Record<string,unknown>[];}
export function providerPaymentAmounts(due:string,amounts:readonly string[]):{paid:string;remaining:string;excess:string;complete:boolean}{
 requireInvoiceAmount(due);for(const x of amounts)requireInvoiceAmount(x);
 const paid=amounts.reduce((total,amount)=>moneyDifference(total,moneyDifference("0.00",amount)),"0.00"),difference=moneyDifference(due,paid);
 return {paid,remaining:difference.startsWith('-')?'0.00':difference,excess:difference.startsWith('-')?moneyDifference('0.00',difference):'0.00',complete:difference==='0.00'};
}
