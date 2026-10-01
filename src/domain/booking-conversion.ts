/** Initial immutable scope. Unknown applied facts stay null and are never inferred. */
export interface BookingContribution {readonly id:string;readonly lineId:string;readonly modalityId:string;readonly quantity:string;readonly attendees:number;readonly certainty:"estimated"|"confirmed"}
export interface BookingNight {readonly id:string;readonly date:string;readonly contributionIds:readonly string[]}
export interface BookingService {readonly id:string;readonly serviceRevisionId:string;readonly nature:"internal"|"external";readonly variant:unknown|null;readonly provider:unknown|null;readonly place:unknown|null;readonly schedule:unknown|null;readonly contributions:readonly BookingContribution[];readonly nights:readonly BookingNight[]}
export interface BookingParticipant {readonly id:string;readonly name:string;readonly contactId:string|null;readonly evidenceId:string;readonly sourceRef:string}
export interface BookingAssignment {readonly participantId:string;readonly serviceId:string;readonly nightId:string|null;readonly necessity:string;readonly evidenceId:string}
export interface BookingDetail {readonly services:readonly BookingService[];readonly participants:readonly BookingParticipant[];readonly assignments:readonly BookingAssignment[]}
export interface ConversionAssessment {readonly verifiedChain:boolean;readonly rectified:boolean;readonly exactScope:boolean;readonly completeDetail:boolean;readonly currentRevision:boolean;readonly authorized:boolean;readonly ai:boolean;readonly exactHumanApproval:boolean}
export function decideConversion(a:ConversionAssessment){
 const blockers:string[]=[];
 if(!a.verifiedChain||a.rectified)blockers.push("verified-unrectified-chain-required");
 if(!a.exactScope)blockers.push("exact-selected-scope-required");
 if(!a.completeDetail)blockers.push("initial-detail-required");
 if(!a.currentRevision)blockers.push("current-revision-required");
 if(!a.authorized||a.ai&&!a.exactHumanApproval)blockers.push("authorized-actor-and-approval-required");
 return {allowed:blockers.length===0,state:blockers.length?null:"Pendiente de preparación",ids:["SM-BK-01","SM-BS-01","D018","PLAN-T03"],blockers};
}
