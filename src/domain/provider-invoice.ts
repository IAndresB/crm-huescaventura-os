// Operational documentary facts only. No payment, allocation, mandate or fiscal act.
import {moneyDifference} from './exact-money.ts';
import {requirePaymentAmount} from './customer-payment.ts';
export type InvoiceStatus='Pendiente'|'Recibida'|'Revisada'|'Vinculada'|'Incidencia';
export interface InvoiceBasis {
 readonly providerRevisionId:string;readonly recipientId:string;readonly amount:string;
 readonly serviceIds:readonly string[];readonly sourceRef:string;readonly version:string;
}
export interface InvoiceDocument {
 readonly documentId:string;readonly objectVersionId:string;readonly issuerRevisionId:string;
 readonly recipientId:string;readonly amount:string;readonly serviceIds:readonly string[];
}
export interface InvoicePortion {readonly serviceId:string;readonly amount:string;readonly sourceRef:string;}
export function invoiceDifferences(basis:InvoiceBasis,document:InvoiceDocument):readonly string[] {
 requirePaymentAmount(basis.amount,true);requirePaymentAmount(document.amount,true);
 return [basis.providerRevisionId!==document.issuerRevisionId?'provider':null,
 basis.recipientId!==document.recipientId?'recipient':null,basis.amount!==document.amount?'amount':null,
 JSON.stringify([...basis.serviceIds].sort())!==JSON.stringify([...document.serviceIds].sort())?'scope':null].filter((v):v is string=>v!==null);
}
export function verifyInvoicePortions(total:string,services:readonly string[],parts:readonly InvoicePortion[]):void {
 requirePaymentAmount(total,true);
 if(!parts.length||new Set(parts.map(p=>p.serviceId)).size!==parts.length||parts.length!==services.length)throw new Error('INVOICE_PORTIONS_REQUIRED');
 let sum='0.00';for(const p of parts){requirePaymentAmount(p.amount,true);if(!services.includes(p.serviceId)||!p.sourceRef?.trim())throw new Error('INVOICE_PORTIONS_REQUIRED');sum=moneyDifference(sum,'-'+p.amount);}
 if(sum!==total)throw new Error('INVOICE_PORTIONS_REQUIRED');
}
