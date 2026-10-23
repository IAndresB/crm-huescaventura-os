// D020: contractual days are Gregorian civil dates, never elapsed-hour durations.
export const CIVIL_ALGORITHM_VERSION = "h1-civil-d020-v1";
declare const localDateBrand: unique symbol;
declare const instantBrand: unique symbol;
declare const timeZoneBrand: unique symbol;
export type LocalDate = string & {readonly [localDateBrand]:true};
export type Instant = string & {readonly [instantBrand]:true};
export type TimeZone = string & {readonly [timeZoneBrand]:true};
export type Scope = "global"|"modality"|"service"|"night";
export interface ScopeKey {readonly scope:Scope;readonly scopeId:string;}
export interface ZoneEvidence {readonly zone:TimeZone;readonly sourceRef:string;readonly version:string;}
export interface CivilReference extends ScopeKey {
  readonly date:LocalDate;readonly zone:ZoneEvidence;readonly sourceRef:string;
  readonly version:string;readonly basis:"default"|"express_contract";
}
export interface CivilEvaluation {
  readonly reference:CivilReference;readonly actDate:LocalDate;readonly daysBefore:number;
  readonly interval:"at_least_7"|"at_least_3"|"under_3";
  readonly algorithmVersion:typeof CIVIL_ALGORITHM_VERSION;
}
export interface CivilDeadline {
  readonly evaluation:CivilEvaluation;readonly daysBefore:number;
  readonly lastAllowedDate:LocalDate;readonly expired:boolean;
}
function invalid():never {throw new Error("CIVIL_INPUT_INVALID");}
function leap(year:number):boolean {return year%4===0 && (year%100!==0 || year%400===0);}
const monthLengths=[31,28,31,30,31,30,31,31,30,31,30,31] as const;
function components(date:string):readonly [number,number,number] {
  if(typeof date!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) invalid();
  const year=Number(date.slice(0,4)),month=Number(date.slice(5,7)),day=Number(date.slice(8,10));
  if(year<1||month<1||month>12||day<1||day>(monthLengths[month-1]!+(month===2&&leap(year)?1:0))) invalid();
  return [year,month,day];
}
export function localDate(value:string):LocalDate {components(value);return value as LocalDate;}
function ordinal(value:LocalDate):number {
  const [year,month,day]=components(value);
  const before=year-1;
  let days=365*before+Math.floor(before/4)-Math.floor(before/100)+Math.floor(before/400);
  for(let m=1;m<month;m++) days+=monthLengths[m-1]!+(m===2&&leap(year)?1:0);
  return days+day;
}
function fromOrdinal(day:number):LocalDate {
  if(!Number.isSafeInteger(day)||day<1||day>ordinal("9999-12-31" as LocalDate)) invalid();
  let low=1,high=9999;
  while(low<high){const mid=Math.ceil((low+high)/2);
    const before=mid-1,start=365*before+Math.floor(before/4)-Math.floor(before/100)+Math.floor(before/400)+1;
    if(start<=day) low=mid;else high=mid-1;
  }
  const year=low;
  let remaining=day-ordinal(`${year.toString().padStart(4,"0")}-01-01` as LocalDate)+1;
  let month=1;
  while(remaining>monthLengths[month-1]!+(month===2&&leap(year)?1:0)) {
    remaining-=monthLengths[month-1]!+(month===2&&leap(year)?1:0);month++;
  }
  return localDate(`${year.toString().padStart(4,"0")}-${String(month).padStart(2,"0")}-${String(remaining).padStart(2,"0")}`);
}
export function shiftCivilDate(date:LocalDate,days:number):LocalDate {
  if(!Number.isSafeInteger(days)) invalid();
  return fromOrdinal(ordinal(date)+days);
}
export function civilDaysBetween(from:LocalDate,to:LocalDate):number {return ordinal(to)-ordinal(from);}
export function timeZone(value:string):TimeZone {
  if(typeof value!=="string"||!value||value.trim()!==value) invalid();
  try {new Intl.DateTimeFormat("en-GB",{timeZone:value});} catch {invalid();}
  return value as TimeZone;
}
export function zoneEvidence(zone:string|null,sourceRef:string,version:string):ZoneEvidence {
  if(zone===null||!sourceRef||!version) invalid();
  return Object.freeze({zone:timeZone(zone),sourceRef,version});
}
export function instant(value:string):Instant {
  if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) invalid();
  localDate(value.slice(0,10));
  if(Number(value.slice(11,13))>23||Number(value.slice(14,16))>59||Number(value.slice(17,19))>59) invalid();
  const parsed=Date.parse(value);
  if(!Number.isFinite(parsed)) invalid();
  return value as Instant;
}
function localParts(at:Instant,zone:ZoneEvidence):Readonly<{date:LocalDate;time:string}> {
  if(!zone||!zone.sourceRef||!zone.version) invalid();
  timeZone(zone.zone);
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:zone.zone,year:"numeric",month:"2-digit",
    day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"})
    .formatToParts(new Date(at));
  const part=(name:string)=>parts.find(p=>p.type===name)?.value??invalid();
  return {date:localDate(`${part("year")}-${part("month")}-${part("day")}`),
    time:`${part("hour")}:${part("minute")}:${part("second")}`};
}
export function dateAtInstant(at:Instant,zone:ZoneEvidence):LocalDate {return localParts(at,zone).date;}
export function civilReference(key:ScopeKey,date:LocalDate,zone:ZoneEvidence,sourceRef:string,
  version:string,basis:"default"|"express_contract"="default"):CivilReference {
  if(!["global","modality","service","night"].includes(key.scope)||!key.scopeId||!sourceRef||!version
    ||(basis!=="default"&&basis!=="express_contract")) invalid();
  localDate(date);timeZone(zone.zone);
  if(!zone.sourceRef||!zone.version) invalid();
  return Object.freeze({...key,date,zone:Object.freeze({...zone}),sourceRef,version,basis});
}
export function selectReference(references:readonly CivilReference[],key:ScopeKey):CivilReference {
  const matches=references.filter(r=>r.scope===key.scope&&r.scopeId===key.scopeId);
  if(!matches.length) throw new Error("CIVIL_REFERENCE_UNKNOWN");
  const explicit=matches.filter(r=>r.basis==="express_contract");
  if(explicit.length>1||matches.length>2||(matches.length===2&&explicit.length!==1)) invalid();
  return explicit[0]??matches[0]!;
}
export function evaluateCivil(reference:CivilReference,actDate:LocalDate):CivilEvaluation {
  const daysBefore=civilDaysBetween(actDate,reference.date);
  return Object.freeze({reference,actDate,daysBefore,
    interval:daysBefore>=7?"at_least_7":daysBefore>=3?"at_least_3":"under_3",
    algorithmVersion:CIVIL_ALGORITHM_VERSION});
}
export function evaluateInstant(reference:CivilReference,at:Instant):CivilEvaluation {
  return evaluateCivil(reference,dateAtInstant(at,reference.zone));
}
export function evaluateCivilDeadline(reference:CivilReference,actDate:LocalDate,daysBefore:number):CivilDeadline {
  if(!Number.isSafeInteger(daysBefore)||daysBefore<0) invalid();
  const lastAllowedDate=shiftCivilDate(reference.date,-daysBefore);
  return Object.freeze({evaluation:evaluateCivil(reference,actDate),daysBefore,lastAllowedDate,
    expired:civilDaysBetween(lastAllowedDate,actDate)>0});
}
export interface Reevaluation {
  readonly before:CivilEvaluation;readonly after:CivilEvaluation;
  readonly actorRef:string;readonly reason:string;readonly recordedAt:Instant;
}
export function reevaluateCivil(before:CivilEvaluation,newReference:CivilReference,actDate:LocalDate,
  actorRef:string,reason:string,recordedAt:Instant):Reevaluation {
  if(!actorRef||!reason||before.reference.scope!==newReference.scope
    ||before.reference.scopeId!==newReference.scopeId) invalid();
  instant(recordedAt);
  return Object.freeze({before,after:evaluateCivil(newReference,actDate),actorRef,reason,recordedAt});
}
export interface ExplicitHourlyDeadline extends ScopeKey {
  readonly date:LocalDate;readonly time:string;readonly zone:ZoneEvidence;
  readonly at:Instant;readonly sourceRef:string;readonly version:string;
}
export function explicitHourlyDeadline(value:ExplicitHourlyDeadline):ExplicitHourlyDeadline {
  if(!value.sourceRef||!value.version||!value.scopeId
    ||!["global","modality","service","night"].includes(value.scope)
    ||!/^\d{2}:\d{2}:\d{2}$/.test(value.time)) invalid();
  const seen=localParts(instant(value.at),value.zone);
  if(seen.date!==localDate(value.date)||seen.time!==value.time) invalid();
  return Object.freeze({...value,zone:Object.freeze({...value.zone})});
}
export function hourlyDeadlineExpired(deadline:ExplicitHourlyDeadline,at:Instant):boolean {
  explicitHourlyDeadline(deadline);
  return Date.parse(instant(at))>Date.parse(deadline.at);
}
