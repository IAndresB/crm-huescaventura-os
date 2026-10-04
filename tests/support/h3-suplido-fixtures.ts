import {randomUUID as uid} from 'node:crypto';
import {allocationFixture} from './h3-allocation-fixtures.ts';
import {invoiceFixture} from './h3-invoice-fixtures.ts';
import {type isolatedSuplido,write,read} from './h3-suplido-isolated.ts';
import type {SuplidoCommand} from '../../src/infrastructure/postgres/h3-suplido-adapter.ts';
import type {SuplidoBasis,MandateFact,DocumentaryFacts} from '../../src/domain/managed-client-funds.ts';
export type {SuplidoCommand};
type H=Awaited<ReturnType<typeof isolatedSuplido>>;
export async function suplidoFixture(h:H,received='700.00',amount='500.00',nature:'external'|'internal'='external'){
 const funds=await allocationFixture(h,received,received,'verified','2000.00');
 const invoice=await invoiceFixture(h,nature),suplidoId=uid(),bookingId=nature==='external'?funds.f.b.bookingId:invoice.bookingId;
 const basis:SuplidoBasis={clientId:nature==='external'?funds.f.f.accepterId:invoice.basis.recipientId,providerRevisionId:invoice.provider.revision,serviceId:nature==='external'?funds.f.detail.services[0]!.id:invoice.basis.serviceIds[0]!,expectedAmount:amount,confirmedAmount:null,sourceRef:'SYNTHETIC provider amount',version:'1'};
 const at=new Date().toISOString();
 const attest=async(q:SuplidoCommand,certainty='reviewed',source_kind='manual')=>{
  const v=Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId'].includes(k)&&v!==undefined));
  const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(v)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
  return {...q,evidenceId:await funds.proof(q.suplidoId,`suplido:${q.action}:${hash}`,certainty,source_kind,q.at)};
 };
 const see=async()=>h.suplidos.read(await h.auth(),read,suplidoId,bookingId);
 const command=async(action:SuplidoCommand['action'],changes:Partial<SuplidoCommand>={})=>attest({action,suplidoId,bookingId,operationId:uid(),expectedRevision:(await see())?.revision??0,sourceRef:'SYNTHETIC component contrast',reason:'SYNTHETIC Administrator decision',at,evidenceId:uid(),...changes});
 const open=()=>command('open',{basis,expectedRevision:0});
 const assign=async(amt='300.00',start='0.00',purpose:'managed_client_funds'|'fee'='managed_client_funds')=>{const q=await funds.assign(amt,start,{bookingId,purpose,reference:'SYNTHETIC client service purpose',serviceId:basis.serviceId});await h.allocations.apply(await h.auth(),write,q);return q;};
 const fundsCommand=async(ids:readonly string[])=>command('component',{component:'funds',allocationIds:ids});
 const attachInvoice=async(stage=4,wrong:Record<string,unknown>={})=>{
  const ib={...invoice.basis,recipientId:basis.clientId,serviceIds:[basis.serviceId],amount,...wrong};
  await h.invoices.apply(await h.auth(),write,await invoice.attest({...await invoice.need(),bookingId,basis:ib}));
  const d=stage>=2?await invoice.document({recipientId:ib.recipientId,serviceIds:ib.serviceIds,amount:ib.amount!}):undefined;
  // The original must be linked to this Booking through the already accredited B07 command.
  if(d)await h.evidence.apply(await h.auth(),write,{action:'link',operationId:uid(),targetId:uid(),originalId:d.documentId,sourceRef:'SYNTHETIC original reused',contextKind:'booking',contextId:bookingId,purpose:'provider-invoice-documentary',coverage:d.documentId,reason:'SYNTHETIC same original pertinent Booking'});
  if(stage>=2)await h.invoices.apply(await h.auth(),write,await invoice.attest({...await invoice.receive(d),bookingId,expectedRevision:1}));
  if(stage>=3)await h.invoices.apply(await h.auth(),write,await invoice.attest({...await invoice.review(),bookingId,expectedRevision:2}));
  if(stage>=4)await h.invoices.apply(await h.auth(),write,await invoice.attest({...await invoice.link(),bookingId,expectedRevision:3,portions:[{serviceId:basis.serviceId,amount,sourceRef:'SYNTHETIC one service attribution'}]}));
  return command('component',{component:'invoice',invoiceId:invoice.invoiceId});
 };
 const mandate=async():Promise<MandateFact>=>{
  const m={id:uid(),version:'SYNTHETIC-M1',content:'SYNTHETIC ONLY accepted administration permission; no legal validity',acceptanceRef:uid(),acceptedBy:basis.clientId,acceptedAt:at};
  const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(m)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
  return {...m,evidenceId:await funds.proof(suplidoId,`mandate:accepted:${hash}`,'reviewed','manual',at)};
 };
 return {funds,invoice,suplidoId,bookingId,basis,at,attest,see,command,open,assign,fundsCommand,attachInvoice,mandate};
}
// This fixture supplies only C02 inputs. It cannot persist a supplier payment or issue F1/F2 authority.
export function syntheticDocumentaryFacts():DocumentaryFacts {
 return {clientId:'SYNTHETIC-C',providerId:'SYNTHETIC-P',serviceId:'SYNTHETIC-S',amount:'500.00',differences:[],
 invoice:{clientId:'SYNTHETIC-C',providerId:'SYNTHETIC-P',serviceId:'SYNTHETIC-S',amount:'500.00',linked:true,sourceRef:'SYNTHETIC-I'},
 payment:{id:'SYNTHETIC-PP',clientId:'SYNTHETIC-C',providerId:'SYNTHETIC-P',serviceId:'SYNTHETIC-S',amount:'500.00',performed:true,sourceRef:'SYNTHETIC-PAY',evidenceId:'SYNTHETIC-E'},
 reconciliation:{amount:'500.00',verified:true,paymentRef:'SYNTHETIC-PP',sourceRef:'SYNTHETIC-R',evidenceId:'SYNTHETIC-E2'}};
}
