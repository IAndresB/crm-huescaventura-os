import {randomUUID as uid} from 'node:crypto';
import {invoiceBookingFixture} from './h3-invoice-booking-fixtures.ts';
import {write,read,type isolatedInvoice} from './h3-invoice-isolated.ts';
import {digest} from '../../src/infrastructure/storage/private-storage.ts';
import type {InvoiceCommand} from '../../src/infrastructure/postgres/h3-invoice-adapter.ts';
import type {InvoiceBasis,InvoiceDocument} from '../../src/domain/provider-invoice.ts';
export type {InvoiceCommand};
type H=Awaited<ReturnType<typeof isolatedInvoice>>;
export async function invoiceFixture(h:H,nature:'internal'|'external'='external'){
 const b=await invoiceBookingFixture(h,'total',true,nature);await h.booking.apply(await h.auth(),write,b.q);
 const provider=nature==='external'?await h.cat('provider',{name:'SYNTHETIC external issuer'}):{id:uid(),revision:uid()},invoiceId=uid(),bookingId=b.q.bookingId,at=new Date().toISOString();
 const basis:InvoiceBasis={providerRevisionId:provider.revision,recipientId:b.f.accepterId,amount:'100.01',serviceIds:b.detail.services.map(v=>v.id),sourceRef:'SYNTHETIC external service amount source',version:'1'};
 const attest=async(q:InvoiceCommand,certainty='reviewed',source_kind='manual'):Promise<InvoiceCommand>=>{
  const value=Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId'].includes(k)&&v!==undefined));
  const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(value)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
  const proof={action:'create' as const,operationId:uid(),targetId:uid(),kind:'evidence' as const,material:{claim:`invoice:${q.action}:${hash}`,coverage:q.invoiceId,certainty,source_kind},sourceRef:'SYNTHETIC manual contrast',purpose:'provider-invoice-documentary',occurredAt:q.at,contextKind:'other' as const,contextId:q.invoiceId,coverage:q.invoiceId,reason:'SYNTHETIC Administrator review'};
  await h.evidence.apply(await h.auth(),write,proof);return {...q,evidenceId:proof.targetId};
 };
 const state=async()=>h.invoices.read(await h.auth(),read,invoiceId,bookingId);
 const command=async(action:InvoiceCommand['action'],change:Partial<InvoiceCommand>={})=>attest({action,invoiceId,bookingId,operationId:uid(),expectedRevision:(await state())?.revision??0,sourceRef:'SYNTHETIC original/contrast provenance',reason:'SYNTHETIC documentary decision',at,evidenceId:uid(),...change});
 const document=async(change:Partial<InvoiceDocument>={},correctsId?:string)=>{
  const documentId=uid(),objectVersionId=uid(),bytes=new TextEncoder().encode(JSON.stringify({label:'SYNTHETIC invoice; no fiscal validity',documentId,issuerRevisionId:basis.providerRevisionId,recipientId:basis.recipientId,amount:basis.amount!,serviceIds:basis.serviceIds,...change})),ctx={contextKind:'booking' as const,contextId:bookingId,purpose:'provider-invoice-documentary'};
  await h.evidence.apply(await h.auth(),write,{action:'create',operationId:uid(),targetId:documentId,kind:'document',material:{relation:'original',content_ref:'synthetic-private-original',content_kind:'synthetic-text',storage_state:'reference_only'},sourceRef:'SYNTHETIC external original',purpose:ctx.purpose,occurredAt:at,correctsId,contextKind:ctx.contextKind,contextId:ctx.contextId,coverage:documentId,reason:'SYNTHETIC original retained'});
  await h.objects.prepare(await h.auth(),write,{...ctx,documentId,rootId:uid(),versionId:objectVersionId,expectedVersion:0,operationId:uid(),sourceRef:'SYNTHETIC private upload',reason:'SYNTHETIC preserve bytes',digest:digest(bytes),size:bytes.length,media:'application/octet-stream'});
  await h.objects.upload(await h.auth(),read,write,objectVersionId,ctx,bytes,uid());
  await h.objects.reconcile(await h.auth(),read,write,objectVersionId,ctx,uid());
  await h.objects.link(await h.auth(),read,write,objectVersionId,ctx,uid());
  return {documentId,objectVersionId,issuerRevisionId:basis.providerRevisionId,recipientId:basis.recipientId,amount:basis.amount!,serviceIds:basis.serviceIds,...change};
 };
 const need=()=>command('need',{basis});const receive=async(d?:InvoiceDocument)=>command('receive',{document:d??await document()});
 const review=()=>command('review',{checks:{provider:true,recipient:true,amount:true,scope:true}});
 const portions=basis.serviceIds.map((serviceId,i)=>({serviceId,amount:i===0?'50.01':'50.00',sourceRef:'SYNTHETIC attributed service basis'}));
 const link=()=>command('link',{portions});
 const correct=(d?:InvoiceDocument)=>command('correct',{document:d,affectedServiceIds:basis.serviceIds,affectedRecipientId:basis.recipientId,affectedAmount:basis.amount!});
 return {b,provider,invoiceId,bookingId,basis,at,attest,state,command,document,need,receive,review,link,correct,portions};
}
