// H3-005/006: allocation relations and internal use; no bank output/Refund engine.
import {captureCalculation,reverseExact,MONEY_ALGORITHM_VERSION,type CalculationRecord} from './exact-money.ts';
import {requirePaymentAmount} from './customer-payment.ts';
export interface AllocationDestination {
 readonly bookingId:string;readonly purpose:'obligation'|'managed_client_funds'|'fee'|'deposit';
 readonly reference:string;readonly scheduleId?:string;readonly slot?:'initial'|'balance';readonly serviceId?:string;
}
export interface AllocationPart {
 readonly id:string;readonly reconciliationId:string;readonly expectedReconciliationRevision:number;
 readonly destination:AllocationDestination;readonly order:number;readonly weight:string;
}
export interface AllocationState {
 readonly id:string;readonly paymentId:string;readonly reconciliationId:string;readonly reconciliationRevision:number;
 readonly destination:AllocationDestination;readonly start:string;readonly amount:string;
 readonly status:'planned'|'verified'|'reversed';readonly revision:number;readonly originalRef:string|null;
}
export interface EconomicBasis {
 readonly kind:'cancellation'|'refund'|'new_obligation'|'modification';readonly amount:string;
 readonly originalRef:string;readonly sourceRef:string;readonly version:string;readonly evidenceId:string;
}
export function allocationCalculation(total:string,parts:readonly AllocationPart[],sourceRef:string,paymentId:string,reason:string):CalculationRecord {
 return captureCalculation({kind:'allocation',total,parts:parts.map(({id,order,weight})=>({id,order,weight}))},
 {sourceRef,calculationRef:paymentId,configurationVersions:[{kind:'funds',id:paymentId,version:MONEY_ALGORITHM_VERSION}],reason});
}
export function allocationReversal(originalRef:string,originalAmount:string,reason:string){return reverseExact(originalRef,originalAmount,reason);}
export function requireAllocationAmount(value:unknown,positive=true){return requirePaymentAmount(value,positive);}
