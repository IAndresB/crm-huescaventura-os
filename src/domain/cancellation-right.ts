import {captureCalculation,type CalculationRecord,type ParticipationRights,type Split,remainingRight,MONEY_ALGORITHM_VERSION} from './exact-money.ts';
import {civilReference,evaluateInstant,instant,localDate,type CivilReference,CIVIL_ALGORITHM_VERSION} from './civil-time.ts';
import {exactNonnegativeAmount} from './payment-obligation.ts';
export const CANCELLATION_VERSION='h4-d011-d019-d020-d023-v1';
export type CancellationCause='provider'|'huescaventura'|'voluntary'|'no_show'|'late'|'alcohol_drugs'|'safety';
export interface CancellationFacts {
 readonly cause:CancellationCause|null;readonly policy:Readonly<{id:string;version:string;rule:'D011';terms:unknown}>;
 readonly base:Readonly<{kind:'participation'|'fixed'|'component';amount:string|null;count:number;start:number;modalityId?:string;components:readonly unknown[];administratorDecision?:Readonly<{recordId:string;evidenceId:string;reason:string}>}>;
 readonly reference:CivilReference|null;readonly nonRefundable:Readonly<{clause:string;evidenceId:string}>|null;
 readonly at:string;
}
/** Pure C02. Authority and material scope are checked again by explicit C03. */
export function determineCancellation(f:CancellationFacts){
 if(!f.policy?.id||!f.policy.version||f.policy.rule!=='D011'||!['participation','fixed','component'].includes(f.base?.kind)||!Number.isSafeInteger(f.base.count)||f.base.count<1||!Number.isSafeInteger(f.base.start)||f.base.start<0||f.base.kind!=='participation'&&(f.base.count!==1||f.base.start!==0)||!Array.isArray(f.base.components))throw new Error('CANCELLATION_INPUT_INVALID');
 instant(f.at);const missing:string[]=[];
 if(!f.cause)missing.push('cause');else if(!['provider','huescaventura','voluntary','no_show','late','alcohol_drugs','safety'].includes(f.cause))throw new Error('CANCELLATION_INPUT_INVALID');
 if(f.base.amount===null)missing.push('base:D019');else exactNonnegativeAmount(f.base.amount);
 if(!f.reference)missing.push('reference:D020');
 const reference=f.reference?civilReference({scope:f.reference.scope,scopeId:f.reference.scopeId},localDate(f.reference.date),f.reference.zone,f.reference.sourceRef,f.reference.version,f.reference.basis):null;
 const temporal=reference?evaluateInstant(reference,instant(f.at)):null;
 if(missing.length)return {status:'pending' as const,missing,temporal,calculation:null,right:null,retention:null,baseTotal:null,version:CANCELLATION_VERSION,currency:'EUR',unit:f.base.kind==='participation'?'participation':'contractual_component',moneyVersion:MONEY_ALGORITHM_VERSION,civilVersion:CIVIL_ALGORITHM_VERSION};
 const percent=['provider','huescaventura'].includes(f.cause!)?'100':f.cause!=='voluntary'||f.nonRefundable?'0':temporal!.daysBefore>=7?'100':temporal!.daysBefore>=3?'50':'0';
 const trace={sourceRef:f.policy.id,calculationRef:f.reference!.scopeId,configurationVersions:[{kind:'cancellation_policy',id:f.policy.id,version:f.policy.version},{kind:'economic_basis',id:f.base.modalityId??f.reference!.scopeId,version:CANCELLATION_VERSION}],reason:'D019 contractual right before funds; D023 materialize per participation'};
 const calculation:CalculationRecord=captureCalculation(f.base.kind==='participation'?{kind:'participations',baseEach:f.base.amount!,participations:f.base.count,percent}:{kind:'percentage',base:f.base.amount!,percent},trace);
 const p=calculation.output as ParticipationRights,s=calculation.output as Split;
 return {status:'determined' as const,missing,temporal,calculation,percent,right:f.base.kind==='participation'?p.total:s.applied.amount,retention:f.base.kind==='participation'?p.remainders:s.remainder,baseTotal:f.base.kind==='participation'?p.bases:s.base,version:CANCELLATION_VERSION,currency:'EUR',unit:f.base.kind==='participation'?'participation':'contractual_component',moneyVersion:MONEY_ALGORITHM_VERSION,civilVersion:CIVIL_ALGORITHM_VERSION};
}
/** A fixed right is reduced only by accredited materialized amounts, not a new percentage. */
export function pendingCancellationRight(fixed:string,accredited:readonly string[]){return remainingRight(fixed,accredited);}
