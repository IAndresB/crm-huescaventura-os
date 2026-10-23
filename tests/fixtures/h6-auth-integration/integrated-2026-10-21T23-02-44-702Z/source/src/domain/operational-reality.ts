/** Actual service portions are facts, distinct from confirmation and cancellation. */
export interface RealityScope {readonly serviceId:string;readonly nightId:string|null;readonly contributionId:string|null;readonly dimension:'quantity'|'attendees';readonly start:string;readonly amount:string;}
export type RealityMoment={readonly kind:'instant'|'civil';readonly value:string}|{readonly kind:'unknown';readonly reason:string};
export interface RealityCommand {
 readonly action:'start'|'perform'|'finish'|'correct'|'review';readonly operationId:string;readonly factId:string;readonly bookingId:string;
 readonly expectedRevision:number;readonly expectedMaterial:string;readonly sourceRef:string;readonly reason:string;readonly at:string;readonly evidenceId:string;
 readonly data:{readonly scopes:readonly RealityScope[];readonly moment:RealityMoment;readonly source:Readonly<Record<string,unknown>>;readonly responsibleId:string;
 readonly originalId:string;readonly certainty:'verified';readonly exceptional:boolean;readonly review:Readonly<Record<string,unknown>>|null;readonly correctsFactId:string|null;readonly correctsRevision:number|null};
 readonly origin?:'manual'|'ai';
}
export interface RealityView {readonly bookingId:string;readonly revision:number;readonly phase:string|null;readonly material:string;readonly facts:readonly Record<string,unknown>[];readonly scopes:readonly Record<string,unknown>[];readonly incidents:readonly Record<string,unknown>[];readonly pending:readonly string[];readonly history:readonly Record<string,unknown>[];}
