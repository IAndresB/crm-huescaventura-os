import {randomUUID as uid} from 'node:crypto';
import {write} from './h3-payment-isolated.ts';
import type {isolatedPayment} from './h3-payment-isolated.ts';
import type {PaymentCommand} from '../../src/infrastructure/postgres/h3-payment-adapter.ts';
import {obligationFixture} from './h3-obligation-fixtures.ts';
type H=Awaited<ReturnType<typeof isolatedPayment>>;
export async function paymentFixture(h:H,amount='500.00',known=true){
 const f=await obligationFixture(h);await h.obligations.apply(await h.auth(),write,f.q);
 const paymentId=uid(),identity={sourceRef:'SYNTHETIC-BANK-STATEMENT',externalId:uid()},at=new Date().toISOString();
 const proof=async(root:string,claim:string,certainty='reviewed',source_kind='manual',moment=at)=>{
  const q={action:'create' as const,operationId:uid(),targetId:uid(),kind:'evidence' as const,material:{claim,coverage:root,certainty,source_kind},sourceRef:'SYNTHETIC source',purpose:'SYNTHETIC internal payment verification',occurredAt:moment,contextKind:'other' as const,contextId:root,coverage:root,reason:'SYNTHETIC Administrator checked'};
  await h.evidence.apply(await h.auth(),write,q);return q.targetId;
 };
 const attest=async(q:PaymentCommand,root=q.paymentId,certainty='reviewed',source_kind='manual'):Promise<PaymentCommand>=>{
  const value=Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId','sourceEvidenceId','paymentId'].includes(k)&&v!==undefined));
  const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(value)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
  return {...q,evidenceId:await proof(root,`payment:${q.action}:${hash}`,certainty,source_kind,q.at)};
 };
 const sourceEvidenceId=await proof(paymentId,`payment-source:${identity.sourceRef}`);
 const detect=await attest({action:'detect',operationId:uid(),paymentId,expectedRevision:0,sourceRef:'SYNTHETIC observation',reason:'SYNTHETIC detected movement',at,evidenceId:uid(),sourceEvidenceId:known?sourceEvidenceId:undefined,
  detection:{amount,payerRef:'SYNTHETIC payer',date:'2026-10-03',method:'bank_transfer',reference:'SYNTHETIC same reference',bookingId:f.b.bookingId,identity:known?identity:null}});
 const receive=async(revision=1,amt=amount)=>attest({action:'receive',operationId:uid(),paymentId,expectedRevision:revision,sourceRef:'SYNTHETIC checked statement',reason:'SYNTHETIC receipt contrast',at,evidenceId:uid(),amount:amt,identity,sourceEvidenceId});
 const propose=async(revision=2,amt='200.00',start='0.00')=>attest({action:'propose',operationId:uid(),paymentId,expectedRevision:revision,sourceRef:'SYNTHETIC candidate source',reason:'SYNTHETIC correspondence proposal',at,evidenceId:uid(),reconciliationId:uid(),start,amount:amt,bookingId:f.b.bookingId,scheduleId:f.q.scheduleId!,slot:'initial'});
 const verify=async(q:PaymentCommand,revision=3)=>attest({action:'verify',operationId:uid(),paymentId,expectedRevision:revision,sourceRef:'SYNTHETIC checked identity/context/amount/reference/obligation',reason:'SYNTHETIC Administrator contrast; doubt resolved',at,evidenceId:uid(),reconciliationId:q.reconciliationId!,sourceEvidenceId});
 const discrepancy=async(revision=4,start='0.00',amt='100.00',rc?:string)=>attest({action:'discrepancy',operationId:uid(),paymentId,expectedRevision:revision,sourceRef:'SYNTHETIC discrepant source',reason:'SYNTHETIC affected portion only',at,evidenceId:uid(),incidentId:uid(),reconciliationId:rc,start,amount:amt});
 const rectify=async(q:PaymentCommand,i:PaymentCommand,revision=5,amt='200.00')=>attest({...q,action:'rectify',operationId:uid(),expectedRevision:revision,incidentId:i.incidentId,amount:amt,sourceEvidenceId,sourceRef:'SYNTHETIC correction contrast',reason:'SYNTHETIC linked rectification'});
 return {f,paymentId,identity,at,proof,attest,sourceEvidenceId,detect,receive,propose,verify,discrepancy,rectify};
}
