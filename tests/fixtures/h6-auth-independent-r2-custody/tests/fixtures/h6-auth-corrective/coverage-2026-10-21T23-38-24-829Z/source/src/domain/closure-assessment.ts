/** SM-CL-01–05: independent assessments, explicit joint close and founded reopening. */
export type ClosureDimension = 'commercial'|'operational'|'economic';
export type CriterionConclusion = 'pending'|'satisfied'|'not_applicable';
export interface ClosureCriterionReview {readonly id:string;readonly conclusion:CriterionConclusion;readonly reason:string;}
export interface ClosureCommand {
 readonly action:'open'|'evaluate'|'reopen';readonly operationId:string;readonly bookingId:string;readonly dimension:ClosureDimension;
 readonly expectedRevision:number;readonly expectedMaterial:string;readonly sourceRef:string;readonly reason:string;readonly at:string;readonly evidenceId:string;
 readonly criteria:readonly ClosureCriterionReview[];
 readonly documentDependencies:readonly {readonly requirementId:string;readonly dimensions:readonly ClosureDimension[];readonly reason:string;}[];
 readonly serviceApplicability:readonly {readonly serviceId:string;readonly suplido:boolean;readonly deposit:boolean;readonly ownEconomics:boolean;readonly reason:string;}[];
}
export interface ClosureAssessment {
 readonly dimension:ClosureDimension;readonly revision:number;readonly status:'Pendiente'|'Resuelto';
 readonly criteria:readonly {readonly id:string;readonly result:CriterionConclusion;readonly facts:unknown;readonly review:ClosureCriterionReview;}[];
 readonly basis:unknown;readonly basisHash:string;readonly actorId:string;readonly at:string;readonly evidenceId:string;readonly reason:string;readonly sourceRef:string;
}
export interface ClosureView {
 readonly jointClosure:JointClosureView;readonly invalidations:readonly Record<string,unknown>[];
 readonly bookingId:string;readonly revision:number;readonly material:string;readonly inputs:Readonly<Record<string,unknown>>;
 readonly assessments:Partial<Record<ClosureDimension,ClosureAssessment & {readonly applicable:boolean;readonly currentStatus:'Pendiente'|'Resuelto';readonly currentBasis:unknown;readonly currentBasisHash:string}>>;
 readonly history:readonly Record<string,unknown>[];
}

export interface JointClosureCommand {
 readonly action:'close';readonly operationId:string;readonly bookingId:string;
 readonly expectedRevision:number;readonly expectedMaterial:string;readonly expectedJointRevision:number;
 readonly sourceRef:string;readonly reason:string;readonly at:string;readonly evidenceId:string;
}
export interface JointClosureState {
 readonly status:'Cerrada / Histórico';readonly bookingId:string;readonly revision:number;
 readonly assessments:Readonly<Record<ClosureDimension,ClosureAssessment>>;
 readonly basis:unknown;readonly basisHash:string;readonly actorId:string;readonly at:string;
 readonly evidenceId:string;readonly sourceRef:string;readonly reason:string;
}
export interface JointClosureView {
 readonly revision:number;readonly current:boolean;readonly latestClose:JointClosureState|null;
 readonly history:readonly Record<string,unknown>[];
}
