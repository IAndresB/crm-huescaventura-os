export const OFFER_ASPECTS = ["prices", "availability", "conditions", "capacity"] as const;
export type OfferAspect = typeof OFFER_ASPECTS[number];
export interface OfferLimit {readonly aspect:OfferAspect;readonly until:string;readonly evidenceId:string}
export interface OfferIssuance {readonly issuedAt:string;readonly days?:number;readonly limits:readonly OfferLimit[]}
export interface OfferDecision {readonly allowed:boolean;readonly ids:readonly string[];readonly blockers:readonly string[];readonly effectiveUntil:string|null}
export function decideOfferValidity(issuance:OfferIssuance,at:string):OfferDecision {
 const blockers:string[]=[];const days=issuance.days??7;
 const instant=(s:string)=>typeof s==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(s)&&Number.isFinite(Date.parse(s));
 if(!instant(issuance.issuedAt)||!instant(at)||!Number.isSafeInteger(days)||days<=0||!Array.isArray(issuance.limits)) return {allowed:false,ids:["BR-PROP-004","DM-INV-011"],blockers:["invalid-validity"],effectiveUntil:null};
 let until=Date.parse(issuance.issuedAt)+days*86400000;
 for(const l of issuance.limits){if(!OFFER_ASPECTS.includes(l.aspect)||!instant(l.until)||!l.evidenceId) blockers.push("material-limit-source");else until=Math.min(until,Date.parse(l.until));}
 if(!Number.isFinite(until)||until<=Date.parse(issuance.issuedAt)) blockers.push("invalid-effective-limit");
 if(Date.parse(at)<Date.parse(issuance.issuedAt)) blockers.push("not-issued-at-act");
 if(Date.parse(at)>until) blockers.push("act-revalidation-required");
 return {allowed:blockers.length===0,ids:["BR-PROP-004","DM-INV-011","SM-PV-04","SM-FORB-01"],blockers,effectiveUntil:Number.isFinite(until)?new Date(until).toISOString():null};
}
