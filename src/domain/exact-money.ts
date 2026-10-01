// H1-009: EUR arithmetic. Decimal inputs are strings; no binary floating point enters a result.
export const MONEY_ALGORITHM_VERSION = "h1-money-d023-d028-d029-v1";

export interface Exact {
  readonly numerator: string;
  readonly denominator: string;
  readonly decimal: string | null;
}
export interface MoneyTrace {
  readonly sourceRef: string;
  readonly calculationRef: string;
  readonly configurationVersions: readonly Readonly<{kind:string; id:string; version:string}>[];
  readonly reason: string;
}
export interface Materialized {
  readonly exact: Exact;
  readonly amount: string;
  readonly difference: Exact;
  readonly algorithmVersion: typeof MONEY_ALGORITHM_VERSION;
  readonly trace: MoneyTrace;
}
type Rational={n:bigint;d:bigint};
const ZERO: Rational={n:0n,d:1n};
function fail():never {throw new Error("MONEY_INPUT_INVALID");}
function gcd(a:bigint,b:bigint):bigint {
  while(b!==0n) [a,b]=[b,a%b];
  return a;
}
function ratio(n:bigint,d:bigint):Rational {
  if(d===0n) fail();
  if(d<0n){n=-n;d=-d;}
  const g=gcd(n<0n?-n:n,d);
  return {n:n/g,d:d/g};
}
function parse(value:string):Rational {
  if(typeof value!=="string" || value.length>260
    || !/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) fail();
  const negative=value.startsWith("-");
  const text=negative?value.slice(1):value;
  const [whole,fraction=""]=text.split(".");
  if(fraction.length>100) fail();
  const d=10n**BigInt(fraction.length);
  return ratio((negative?-1n:1n)*BigInt(whole+fraction),d);
}
function add(a:Rational,b:Rational):Rational {return ratio(a.n*b.d+b.n*a.d,a.d*b.d);}
function negate(a:Rational):Rational {return {n:-a.n,d:a.d};}
function subtract(a:Rational,b:Rational):Rational {return add(a,negate(b));}
function multiply(a:Rational,b:Rational):Rational {return ratio(a.n*b.n,a.d*b.d);}
function decimal(a:Rational):string|null {
  let rest=a.d,twos=0,fives=0;
  while(rest%2n===0n){rest/=2n;twos++;}
  while(rest%5n===0n){rest/=5n;fives++;}
  if(rest!==1n) return null;
  const places=Math.max(twos,fives);
  const scaled=(a.n<0n?-a.n:a.n)*(10n**BigInt(places))/a.d;
  const raw=scaled.toString().padStart(places+1,"0");
  const text=places===0?raw:`${raw.slice(0,-places)}.${raw.slice(-places)}`;
  const trimmed=text.includes(".")?text.replace(/0+$/,"").replace(/\.$/,""):text;
  return a.n<0n && a.n!==0n?`-${trimmed}`:trimmed;
}
function exact(a:Rational):Exact {return Object.freeze({numerator:a.n.toString(),denominator:a.d.toString(),decimal:decimal(a)});}
function cents(a:Rational):bigint {
  const scaled=a.n*100n;
  if(scaled%a.d!==0n) fail();
  return scaled/a.d;
}
function money(c:bigint):string {
  const sign=c<0n?"-":"";
  const raw=(c<0n?-c:c).toString().padStart(3,"0");
  return `${sign}${raw.slice(0,-2)}.${raw.slice(-2)}`;
}
function positiveInteger(value:number):bigint {
  if(!Number.isSafeInteger(value)||value<=0) fail();
  return BigInt(value);
}
function trace(value:MoneyTrace):MoneyTrace {
  if(!value || !value.sourceRef || !value.calculationRef || !value.reason
    || !Array.isArray(value.configurationVersions)
    || value.configurationVersions.some(v=>!v.kind||!v.id||!v.version)) fail();
  return Object.freeze({...value,configurationVersions:Object.freeze(value.configurationVersions
    .map(v=>Object.freeze({...v})))});
}
export function materialize(value:string,context:MoneyTrace):Materialized {
  const source=parse(value);
  return materializeRatio(source,context);
}
function materializeRatio(value:Rational,context:MoneyTrace):Materialized {
  const magnitude=value.n<0n?-value.n:value.n;
  const scaled=magnitude*100n;
  let rounded=scaled/value.d;
  if((scaled%value.d)*2n>=value.d) rounded++;
  if(value.n<0n) rounded=-rounded;
  const resulting=ratio(rounded,100n);
  return Object.freeze({exact:exact(value),amount:money(rounded),
    difference:exact(subtract(resulting,value)),algorithmVersion:MONEY_ALGORITHM_VERSION,
    trace:trace(context)});
}
export interface Split {
  readonly base:string; readonly percent:string; readonly internal:Exact;
  readonly applied:Materialized; readonly remainder:string;
}
export function percentageSplit(base:string,percent:string,context:MoneyTrace):Split {
  const original=parse(base); cents(original);
  const p=parse(percent);
  if(p.n<0n||p.n>100n*p.d) fail();
  const internal=multiply(original,ratio(p.n,p.d*100n));
  const applied=materializeRatio(internal,context);
  return Object.freeze({base:money(cents(original)),percent,
    internal:exact(internal),applied,remainder:money(cents(original)-cents(parse(applied.amount)))});
}
export function perPersonTotal(finalPersonPrice:string,participations:number,context:MoneyTrace):Materialized {
  const price=parse(finalPersonPrice);
  cents(price);
  return materializeRatio(multiply(price,ratio(positiveInteger(participations),1n)),context);
}
export interface ParticipationRights {
  readonly each:Split; readonly bases:string; readonly total:string; readonly remainders:string;
  readonly participations:number;
}
export function participationRights(baseEach:string,participations:number,percent:string,
  context:MoneyTrace):ParticipationRights {
  const count=positiveInteger(participations);
  const each=percentageSplit(baseEach,percent,context);
  return Object.freeze({each,bases:money(cents(parse(baseEach))*count),
    total:money(cents(parse(each.applied.amount))*count),
    remainders:money(cents(parse(each.remainder))*count),participations});
}
export function remainingRight(fixedRight:string,paid:readonly string[]):string {
  let left=cents(parse(fixedRight));
  if(left<0n) fail();
  for(const item of paid){const amount=cents(parse(item));if(amount<0n) fail();left-=amount;if(left<0n) fail();}
  return money(left);
}
export function fixedGroupPrice(total:string,previousParticipants:number,currentParticipants:number):string {
  positiveInteger(previousParticipants);positiveInteger(currentParticipants);
  return money(cents(parse(total)));
}
export interface Reversal {readonly originalRef:string;readonly originalAmount:string;
  readonly amount:string;readonly reason:string;readonly algorithmVersion:typeof MONEY_ALGORITHM_VERSION;}
export function reverseExact(originalRef:string,originalAmount:string,reason:string):Reversal {
  if(!originalRef||!reason) fail();
  return Object.freeze({originalRef,originalAmount:money(cents(parse(originalAmount))),
    amount:money(-cents(parse(originalAmount))),reason,algorithmVersion:MONEY_ALGORITHM_VERSION});
}
export interface AllocationPart {
  readonly id:string;readonly order:number;readonly weight:string;
}
export interface AllocationResultPart extends AllocationPart {
  readonly internal:Exact;readonly fullCents:string;readonly remainder:Exact;
  readonly residualCents:string;readonly amount:string;
}
export interface Allocation {
  readonly total:string;readonly totalWeight:Exact;readonly parts:readonly AllocationResultPart[];
  readonly algorithmVersion:typeof MONEY_ALGORITHM_VERSION;readonly trace:MoneyTrace;
}
export function allocate(total:string,parts:readonly AllocationPart[],context:MoneyTrace):Allocation {
  const totalCents=cents(parse(total));
  if(!parts.length||parts.length>1000) fail();
  const ids=new Set<string>(),orders=new Set<number>();
  const registered=parts.map(p=>{
    if(!p.id||ids.has(p.id)||!Number.isSafeInteger(p.order)||p.order<0||orders.has(p.order)) fail();
    ids.add(p.id);orders.add(p.order);
    const weight=parse(p.weight);
    if(weight.n<=0n) fail();
    return {part:p,weight};
  }).sort((a,b)=>a.part.order-b.part.order);
  const weightSum=registered.reduce((sum,p)=>add(sum,p.weight),ZERO);
  const abs=totalCents<0n?-totalCents:totalCents;
  const prepared=registered.map(({part,weight})=>{
    const internalCents=ratio(abs*weight.n*weightSum.d,weight.d*weightSum.n);
    const full=internalCents.n/internalCents.d;
    return {part,internalCents,full,remainder:subtract(internalCents,ratio(full,1n)),extra:0n};
  });
  let residual=abs-prepared.reduce((sum,p)=>sum+p.full,0n);
  if(residual<0n||residual>BigInt(prepared.length)) fail();
  const ranked=[...prepared].sort((a,b)=>{
    const left=a.remainder.n*b.remainder.d,right=b.remainder.n*a.remainder.d;
    return left===right?a.part.order-b.part.order:left>right?-1:1;
  });
  for(const p of ranked){if(residual===0n)break;p.extra=1n;residual--;}
  const sign=totalCents<0n?-1n:1n;
  const results=prepared.map(p=>Object.freeze({...p.part,internal:exact(multiply(p.internalCents,ratio(sign,100n))),
    fullCents:p.full.toString(),remainder:exact(multiply(p.remainder,ratio(1n,100n))),
    residualCents:p.extra.toString(),amount:money(sign*(p.full+p.extra))}));
  if(results.reduce((sum,p)=>sum+cents(parse(p.amount)),0n)!==totalCents) fail();
  return Object.freeze({total:money(totalCents),totalWeight:exact(weightSum),
    parts:Object.freeze(results),algorithmVersion:MONEY_ALGORITHM_VERSION,trace:trace(context)});
}

export type CalculationInput =
  | Readonly<{kind:"composition";components:readonly Readonly<{amount:string;quantity:string}>[];participants:number}>
  | Readonly<{kind:"materialize";value:string}>
  | Readonly<{kind:"per_person";finalPersonPrice:string;participations:number}>
  | Readonly<{kind:"percentage";base:string;percent:string}>
  | Readonly<{kind:"participations";baseEach:string;participations:number;percent:string}>
  | Readonly<{kind:"remaining";fixedRight:string;paid:readonly string[]}>
  | Readonly<{kind:"fixed";total:string;previousParticipants:number;currentParticipants:number}>
  | Readonly<{kind:"reversal";originalRef:string;originalAmount:string;reason:string}>
  | Readonly<{kind:"allocation";total:string;parts:readonly AllocationPart[]}>;
export type CalculationOutput=Materialized|Split|ParticipationRights|string|Reversal|Allocation;
export interface CalculationRecord {
  readonly input:CalculationInput;
  readonly output:CalculationOutput;
  readonly trace:MoneyTrace;
  readonly algorithmVersion:typeof MONEY_ALGORITHM_VERSION;
}
function frozenCopy<T>(value:T):T {
  const copied=structuredClone(value);
  function freeze(object:unknown):void {
    if(object && typeof object==="object") {
      for(const child of Object.values(object)) freeze(child);
      Object.freeze(object);
    }
  }
  freeze(copied);
  return copied;
}
function calculate(input:CalculationInput,context:MoneyTrace):CalculationOutput {
  switch(input.kind) {
    case "composition": {
      if(!input.components.length) fail();
      const total=input.components.reduce((sum,c)=>add(sum,multiply(parse(c.amount),parse(c.quantity))),ZERO);
      const each=ratio(total.n,total.d*positiveInteger(input.participants));
      return materializeRatio(each,context);
    }
    case "materialize": return materialize(input.value,context);
    case "per_person": return perPersonTotal(input.finalPersonPrice,input.participations,context);
    case "percentage": return percentageSplit(input.base,input.percent,context);
    case "participations": return participationRights(input.baseEach,input.participations,input.percent,context);
    case "remaining": return remainingRight(input.fixedRight,input.paid);
    case "fixed": return fixedGroupPrice(input.total,input.previousParticipants,input.currentParticipants);
    case "reversal": return reverseExact(input.originalRef,input.originalAmount,input.reason);
    case "allocation": return allocate(input.total,input.parts,context);
  }
}
export function captureCalculation(input:CalculationInput,context:MoneyTrace):CalculationRecord {
  const captured=frozenCopy(input),capturedTrace=trace(context);
  return Object.freeze({input:captured,output:frozenCopy(calculate(captured,capturedTrace)),
    trace:capturedTrace,algorithmVersion:MONEY_ALGORITHM_VERSION});
}
export function reconstructCalculation(record:CalculationRecord):CalculationOutput {
  if(record.algorithmVersion!==MONEY_ALGORITHM_VERSION) throw new Error("MONEY_VERSION_UNSUPPORTED");
  const reconstructed=calculate(record.input,record.trace);
  if(JSON.stringify(reconstructed)!==JSON.stringify(record.output)) throw new Error("MONEY_HISTORY_MISMATCH");
  return reconstructed;
}
export interface RequiredMoneyFact {
  readonly name:string;
  readonly value:string|null;
  readonly kind?:"money"|"verified_reference";
}
export function requireKnownMoneyFacts(facts:readonly RequiredMoneyFact[]):Readonly<{ready:boolean;blockers:readonly string[]}> {
  const blockers=facts.filter(f=>!f.name || f.value===null || f.value==="")
    .map(f=>f.name||"UNNAMED_FACT");
  for(const fact of facts) if(fact.value!==null && fact.value!=="") {
    if(fact.kind===undefined || fact.kind==="money") parse(fact.value);
    else if(fact.kind!=="verified_reference" || fact.value.trim()!==fact.value
      || /^unknown$/i.test(fact.value)) fail();
  }
  return Object.freeze({ready:blockers.length===0,blockers:Object.freeze(blockers)});
}
export interface ManualFinalPrice {
  readonly calculated:string;readonly final:string;readonly actorRef:string;
  readonly recordedAt:string;readonly reason:string;readonly trace:MoneyTrace;
}
export function selectManualFinalPrice(calculated:string,final:string,actorRef:string,
  recordedAt:string,reason:string,context:MoneyTrace):ManualFinalPrice {
  if(!actorRef||!reason||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(recordedAt)
    || Number.isNaN(Date.parse(recordedAt))) fail();
  return Object.freeze({calculated:money(cents(parse(calculated))),final:money(cents(parse(final))),
    actorRef,recordedAt,reason,trace:trace(context)});
}

export function moneyDifference(after:string,before:string):string {
  return money(cents(parse(after))-cents(parse(before)));
}
