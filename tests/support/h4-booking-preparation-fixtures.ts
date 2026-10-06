import {randomUUID as uid}from'node:crypto';
import {obligationFixture}from'./h3-obligation-fixtures.ts';
import {confirmationFixture}from'./h4-confirmation-fixtures.ts';
import {isolatedPreparation,read,write}from'./h4-booking-preparation-isolated.ts';
import type {BookingPreparationCommand,CriticalScope}from'../../src/domain/booking-preparation.ts';
import type {PaymentCommand}from'../../src/infrastructure/postgres/h3-payment-adapter.ts';
import type {AllocationCommand}from'../../src/infrastructure/postgres/h3-allocation-adapter.ts';
import {canonicalCommercial}from'../../src/domain/commercial-progress.ts';
import {fingerprintHumanApprovalMaterial as mf,fingerprintHumanApprovalPart as pf,type HumanApprovalMaterial}from'../../src/infrastructure/postgres/h0-011-adapter.ts';
export type H=Awaited<ReturnType<typeof isolatedPreparation>>;
export function futureCivil(days:number){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=(k:string)=>p.find(x=>x.type===k)!.value;const d=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export async function preparationFixture(h:H,days=10,options:{at?:string;definition?:Record<string,unknown>;determine?:boolean}={}){
 const at=options.at??new Date().toISOString(),date=futureCivil(days),o=await obligationFixture(h,'1000.00',at,[date,date]);
 if(options.definition)o.q=await o.attest({...o.q,definition:{...o.q.definition!,...options.definition}}as typeof o.q);
 if(options.determine!==false)await h.obligations.apply(await h.auth(),write,o.q);
 const bid=o.b.bookingId,provider=await h.cat('provider',{name:'SYNTHETIC current provider'});
 const shared={b:{detail:o.detail},bookingId:bid,provider}as unknown as Parameters<typeof confirmationFixture>[1];
 const conf=await confirmationFixture(h,shared);const coverage={...conf.coverage,date,quantity:'1'};
 const hash=async(v:unknown)=>String((await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(v)}::text::jsonb::text,'UTF8'),'sha256'),'hex') h`)[0]!.h);
 const proof=async(claim:string,target=bid,moment=at,certainty='reviewed')=>{const q=h.req('evidence',{claim,coverage:target,certainty,source_kind:'manual'},target,'other');await h.evidence.apply(await h.auth(),write,{...q,coverage:target,occurredAt:moment});return q.targetId;};
 const see=async()=>h.preparation.read(await h.auth(),read,bid);
 const classify=async(necessary=true):Promise<CriticalScope>=>{const c={serviceId:o.detail.services[0]!.id,nightId:null,contributionId:null,necessary,basis:necessary?'SYNTHETIC contracted sole critical activity; cannot carry out booking without it':'SYNTHETIC optional independent service; documented absence of blocking necessity'};return {...c,evidenceId:await proof('booking-preparation:critical:'+await hash(c))};};
 const coordination=await proof('booking-preparation:coordination');
 const attest=async(q:BookingPreparationCommand)=>({...q,evidenceId:await proof('booking-preparation:'+q.action+':'+await hash(Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId'].includes(k)&&v!==undefined))),bid,q.at)});
 const command=async(action:BookingPreparationCommand['action']='evaluate',changes:Partial<BookingPreparationCommand>={})=>{const v=(await see())!;return attest({action,operationId:uid(),bookingId:bid,expectedRevision:v.revision,expectedMaterial:v.material,sourceRef:'SYNTHETIC norm-grounded preparation decision',reason:'SYNTHETIC current authorized act',at,evidenceId:uid(),criticalScopes:[await classify()],preparationEvidenceIds:[coordination],...changes});};
 const run=async(q:BookingPreparationCommand)=>h.preparation.apply(await h.auth(),write,q);
 const confirm=async()=>{await conf.apply(await conf.register({coverage}));return conf.apply(await conf.evaluate());};
 // Facts through ordinary H3 APIs, manual arithmetic expected:1000 base→500/500 or1000.
 const pay=async(amount=days<7?'1000.00':'500.00',stage='assign')=>{
  const paymentId=uid(),identity={sourceRef:'SYNTHETIC-BANK',externalId:uid()},sourceEvidenceId=await proof('payment-source:'+identity.sourceRef,paymentId);
  const attestPay=async(q:PaymentCommand)=>({...q,evidenceId:await proof('payment:'+q.action+':'+await hash(Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId','sourceEvidenceId','paymentId'].includes(k)&&v!==undefined))),paymentId,q.at)});
  const base={operationId:uid(),paymentId,expectedRevision:0,sourceRef:'SYNTHETIC checked bank statement',reason:'SYNTHETIC authorized exact fact',at,evidenceId:uid(),sourceEvidenceId};
  await h.payments.apply(await h.auth(),write,await attestPay({...base,action:'detect',detection:{amount,payerRef:'SYNTHETIC customer',date:at.slice(0,10),method:'bank_transfer',reference:'SYNTHETIC booking',bookingId:bid,identity}}));
  await h.payments.apply(await h.auth(),write,await attestPay({...base,action:'receive',operationId:uid(),expectedRevision:1,amount,identity}));
  const reconciliationId=uid();if(['propose','verify','assign'].includes(stage))await h.payments.apply(await h.auth(),write,await attestPay({...base,action:'propose',sourceEvidenceId:undefined,operationId:uid(),expectedRevision:2,reconciliationId,start:'0.00',amount,bookingId:bid,scheduleId:o.q.scheduleId!,slot:'initial'}));
  if(['verify','assign'].includes(stage))await h.payments.apply(await h.auth(),write,await attestPay({...base,action:'verify',operationId:uid(),expectedRevision:3,reconciliationId}));
  const destination={bookingId:bid,purpose:'obligation' as const,reference:'SYNTHETIC initial obligation',scheduleId:o.q.scheduleId!,slot:'initial' as const};
  const fund=(await h.allocations.read(await h.auth(),read,paymentId))!;
  const assign:AllocationCommand={action:'assign',operationId:uid(),paymentId,expectedRevision:fund.revision,expectedPaymentRevision:fund.paymentRevision,sourceRef:'SYNTHETIC verified pertinent assignment',reason:'SYNTHETIC ordinary purpose',at,evidenceId:uid(),allocationId:uid(),reconciliationId,expectedReconciliationRevision:2,start:'0.00',amount,destination,expectedScheduleRevision:1};
  const attestAllocation=async(q:AllocationCommand)=>({...q,evidenceId:await proof('allocation:'+q.action+':'+await hash(Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId','calculation'].includes(k)&&v!==undefined))),paymentId,q.at)});
  if(stage==='assign')await h.allocations.apply(await h.auth(),write,await attestAllocation(assign));
  return {paymentId,reconciliationId,assign,attestAllocation,attestPay,base,destination};
 };
 const exception=async()=>{const x={reason:'SYNTHETIC Administrator authorized only the economic initial condition',scopeIds:[o.q.scheduleId!]};return {...x,evidenceId:await proof('booking-preparation:exception:'+await hash(x))};};
 const approval=async(q:BookingPreparationCommand)=>{
  const proposal='booking-proposal-'+uid(),decision='booking-decision-'+uid(),part='booking-part-'+uid(),reserve='booking-reserve-'+uid();
  const p={partId:part,action:'booking-confirmation',contentVersion:'h4-020-v1',content:canonicalCommercial(q),recipient:{state:'value' as const,value:q.bookingId},amount:{state:'unknown' as const},conditions:{state:'value' as const,value:q.economicException?.reason??'SYNTHETIC all current guards'},scope:h.scope,effect:'evaluate-booking-preparation'};
  const {partId:ignoredPartId,...parent}=p;void ignoredPartId;
  const material:HumanApprovalMaterial={...parent,destination:{state:'value',value:q.bookingId},parts:[p]};
  await h.tte.propose(await h.auth(),write,proposal,q.origin==='ai'?'ai':'human',material);await h.tte.decide(await h.auth(),write,'booking-decide-'+uid(),proposal,decision,'approved','SYNTHETIC exact current Administrator decision',mf(material));
  const execute=async(input=q,commandId=reserve)=>h.tte.evaluateBookingPreparation(await h.auth(),write,commandId,proposal,decision,part,mf(material),pf(p),material,input);
  return {proposal,decision,part,reserve,material,execute};
 };
 return {o,conf,bid,date,at,coverage,hash,proof,see,classify,coordination,attest,command,run,confirm,pay,exception,approval};
}
export async function preparationCommands(h:H,bid:string){
 const at=new Date().toISOString();
 const hash=async(v:unknown)=>String((await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(v)}::text::jsonb::text,'UTF8'),'sha256'),'hex') h`)[0]!.h);
 const proof=async(claim:string)=>{const q=h.req('evidence',{claim,coverage:bid,certainty:'reviewed',source_kind:'manual'},bid,'other');await h.evidence.apply(await h.auth(),write,{...q,coverage:bid,occurredAt:at});return q.targetId;};
 const classify=async(serviceId:string,nightId:string|null=null,necessary=true,contributionId:string|null=null):Promise<CriticalScope>=>{const c={serviceId,nightId,contributionId,necessary,basis:necessary?'SYNTHETIC independently documented contracted critical scope':'SYNTHETIC independently documented optional scope'};return {...c,evidenceId:await proof('booking-preparation:critical:'+await hash(c))};};
 const coordination=await proof('booking-preparation:coordination');
 const command=async(criticalScopes:readonly CriticalScope[],action:BookingPreparationCommand['action']='evaluate')=>{const v=(await h.preparation.read(await h.auth(),read,bid))!;const q={action,operationId:uid(),bookingId:bid,expectedRevision:v.revision,expectedMaterial:v.material,sourceRef:'SYNTHETIC independent scoped decision',reason:'SYNTHETIC current exact decision',at,criticalScopes,preparationEvidenceIds:[coordination]};return {...q,evidenceId:await proof('booking-preparation:'+action+':'+await hash(Object.fromEntries(Object.entries(q).filter(([k])=>k!=='operationId'))))};};
 return {classify,command,proof,hash,read:async()=>h.preparation.read(await h.auth(),read,bid),run:async(q:BookingPreparationCommand)=>h.preparation.apply(await h.auth(),write,q)};
}
