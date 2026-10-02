import {captureCalculation,materialize,moneyDifference,remainingRight,MONEY_ALGORITHM_VERSION,type CalculationRecord,type Split} from './exact-money.ts';
import {civilReference,dateAtInstant,evaluateCivilDeadline,evaluateInstant,instant,localDate,CIVIL_ALGORITHM_VERSION,type CivilReference} from './civil-time.ts';
export interface PaymentPolicy {readonly id:string;readonly version:number;readonly rule:'ordinary_50_50';}
export type Due = Readonly<{kind:'at_confirmation'|'before_confirmation'}>|Readonly<{kind:'civil';date:string}>;
export interface ExpectedPart {readonly slot:'initial'|'balance';readonly amount:string;readonly due:Due;}
export interface ObligationBasis {readonly amount:string;readonly sourceRef:string;readonly version:string;}
export interface ScheduleDefinition {
 readonly base:ObligationBasis;readonly reference:CivilReference;readonly at:string;
 readonly exception?:Readonly<{reason:string;parts:readonly ExpectedPart[]}>;
}
function invalid():never {throw new Error('OBLIGATION_INPUT_INVALID');}
export function exactNonnegativeAmount(amount:string):string {
 if(typeof amount!=='string'||! /^(?:0|[1-9]\d*)\.\d{2}$/.test(amount))invalid();
 const x=materialize(amount,{sourceRef:'validation',calculationRef:'validation',configurationVersions:[],reason:'canonical cents'});
 if(x.amount!==amount)invalid();return amount;
}
export function validExpectedParts(parts:readonly ExpectedPart[],base:string):void {
 if(!Array.isArray(parts)||!parts.length||parts.length>2||new Set(parts.map(p=>p.slot)).size!==parts.length)invalid();
 for(const p of parts){if(!['initial','balance'].includes(p.slot))invalid();exactNonnegativeAmount(p.amount);
  if(!p.due||!['civil','at_confirmation','before_confirmation'].includes(p.due.kind))invalid();
  if(p.due.kind==='civil')localDate(p.due.date);}
 if(remainingRight(base,parts.map(p=>p.amount))!=='0.00')invalid();
}
export function determineSchedule(policy:PaymentPolicy,value:ScheduleDefinition) {
 if(!policy?.id||!Number.isSafeInteger(policy.version)||policy.version<1||policy.rule!=='ordinary_50_50'
  ||!value.base?.sourceRef||!value.base.version||!value.reference)invalid();
 exactNonnegativeAmount(value.base.amount);
 const r=value.reference,reference=civilReference({scope:r.scope,scopeId:r.scopeId},localDate(r.date),r.zone,r.sourceRef,r.version,r.basis);
 const at=instant(value.at),evaluation=evaluateInstant(reference,at);
 const trace={sourceRef:value.base.sourceRef,calculationRef:reference.scopeId,configurationVersions:[{kind:'payment_policy',id:policy.id,version:String(policy.version)},{kind:'economic_base',id:value.base.sourceRef,version:value.base.version}],reason:'D023 PM-03 ordinary payment policy'};
 const calculation:CalculationRecord=captureCalculation({kind:'percentage',base:value.base.amount,percent:evaluation.daysBefore<7?'100':'50'},trace);
 const split=calculation.output as Split;
 const ordinary:ExpectedPart[]=evaluation.daysBefore<7?[{slot:'initial',amount:split.applied.amount,due:{kind:'before_confirmation'}}]:[
  {slot:'initial',amount:split.applied.amount,due:{kind:'at_confirmation'}},
  {slot:'balance',amount:split.remainder,due:{kind:'civil',date:evaluateCivilDeadline(reference,evaluation.actDate,7).lastAllowedDate}}];
 const parts=value.exception?.parts??ordinary;if(value.exception&&!value.exception.reason.trim())invalid();validExpectedParts(parts,value.base.amount);
 return {policy,base:value.base,reference,at,evaluation,calculation,ordinary,parts,
  ...(value.exception?{exception:value.exception}:{}),moneyVersion:MONEY_ALGORITHM_VERSION,civilVersion:CIVIL_ALGORITHM_VERSION};
}
// No producer of accredited portions exists in H3-001/002. H3-006 must supply a trusted
// economic facts port. A client JSON boolean can never mint this authority.
declare const verifiedPortion:unique symbol;
export interface VerifiedCoveragePortion {readonly [verifiedPortion]:true;readonly id:string;readonly obligationRef:string;readonly amount:string;readonly factRef:string;}
export interface CoverageEvaluation {readonly state:'pending'|'partial'|'complete';readonly verifiedAmount:string;readonly remaining:string;readonly expired:boolean|null;}
export function evaluateExpected(part:ExpectedPart,reference:CivilReference,at:string,portions:readonly VerifiedCoveragePortion[]=[]):CoverageEvaluation {
 // Fail closed until the actual trusted funds integration is available. No fake positive coverage.
 if(portions.length)throw new Error('OBLIGATION_VERIFIED_FUNDS_INTEGRATION_PENDING');
 exactNonnegativeAmount(part.amount);const act=dateAtInstant(instant(at),reference.zone);
 const expired=part.due.kind==='civil'?act>localDate(part.due.date):null;
 return {state:'pending',verifiedAmount:'0.00',remaining:part.amount,expired};
}
export function obligationAdjustment(original:ExpectedPart,amount:string,due:Due) {
 exactNonnegativeAmount(amount);if(due.kind==='civil')localDate(due.date);
 return {before:original,after:{...original,amount,due},difference:moneyDifference(amount,original.amount),moneyVersion:MONEY_ALGORITHM_VERSION};
}
