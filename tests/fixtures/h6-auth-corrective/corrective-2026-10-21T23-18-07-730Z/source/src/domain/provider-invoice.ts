// Operational documentary facts only. No payment, allocation, mandate or fiscal act.
import {moneyDifference} from './exact-money.ts';
import {requirePaymentAmount} from './customer-payment.ts';
export type InvoiceStatus='Pendiente'|'Recibida'|'Revisada'|'Vinculada'|'Incidencia';
export interface InvoiceBasis {
 readonly providerRevisionId:string;readonly recipientId:string;readonly amount:string|null;
 readonly serviceIds:readonly string[];readonly sourceRef:string;readonly version:string;
}
export interface InvoiceDocument {
 readonly documentId:string;readonly objectVersionId:string;readonly issuerRevisionId:string;
 readonly recipientId:string;readonly amount:string;readonly serviceIds:readonly string[];
}
export interface InvoicePortion {readonly serviceId:string;readonly amount:string;readonly sourceRef:string;}
export function requireInvoiceAmount(value:unknown):string {
 if(typeof value!=='string')throw new Error('INVOICE_AMOUNT_INVALID');
 requirePaymentAmount(value.startsWith('-')?value.slice(1):value);
 if(moneyDifference(value,'0.00')!==value)throw new Error('INVOICE_AMOUNT_INVALID');return value;
}
export function invoiceDifferences(basis:InvoiceBasis,document:InvoiceDocument,providers?:Readonly<{expectedProviderId:string;issuerId:string}>):readonly string[] {
 if(basis.amount===null)throw new Error('INVOICE_COMPARISON_REQUIRED');
 requireInvoiceAmount(basis.amount);requireInvoiceAmount(document.amount);
 if(!providers&&basis.providerRevisionId!==document.issuerRevisionId)throw new Error('INVOICE_COMPARISON_REQUIRED');
 return [providers&&providers.expectedProviderId!==providers.issuerId?'provider':null,
 basis.recipientId!==document.recipientId?'recipient':null,basis.amount!==document.amount?'amount':null,
 JSON.stringify([...basis.serviceIds].sort())!==JSON.stringify([...document.serviceIds].sort())?'scope':null].filter((v):v is string=>v!==null);
}
export function verifyInvoicePortions(total:string,services:readonly string[],parts:readonly InvoicePortion[]):void {
 requireInvoiceAmount(total);
 if(!parts.length||new Set(parts.map(p=>p.serviceId)).size!==parts.length||parts.length!==services.length)throw new Error('INVOICE_PORTIONS_REQUIRED');
 let sum='0.00';for(const p of parts){requireInvoiceAmount(p.amount);if(!services.includes(p.serviceId)||!p.sourceRef?.trim())throw new Error('INVOICE_PORTIONS_REQUIRED');sum=moneyDifference(sum,moneyDifference('0.00',p.amount));}
 if(sum!==total)throw new Error('INVOICE_PORTIONS_REQUIRED');
}
