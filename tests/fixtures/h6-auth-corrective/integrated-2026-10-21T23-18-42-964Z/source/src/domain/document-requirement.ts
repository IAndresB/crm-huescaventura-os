// Applied documentary need; original bytes and identity remain in B07.
export type RequirementStatus='Pendiente'|'Recibido'|'Revisado'|'No aplica'|'Incidencia';
export interface RequirementScope {readonly action:string;readonly serviceId?:string;readonly nightId?:string;readonly participantId?:string;}
export interface DocumentRule {
 readonly id:string;readonly version:string;readonly sourceRef:string;readonly purpose:string;readonly documentType:string;
 readonly scopeKind:'booking'|'service'|'night'|'participant';readonly indispensable:boolean;
 readonly conditionKey:string;readonly equals:string;readonly requiredFields:readonly string[];
}
export interface RequirementBasis {
 readonly rule:DocumentRule;readonly scope:RequirementScope;
 readonly context:{readonly conditionKey:string;readonly value:string;readonly sourceRef:string;readonly version:string};
}
export interface RequirementDocument {
 readonly documentId:string;readonly objectVersionId:string|null;readonly ruleVersion:string;
 readonly purpose:string;readonly coverage:readonly RequirementScope[];
}
export interface RequirementCommand {
 readonly action:'need'|'receive'|'review'|'no_apply'|'change';readonly operationId:string;
 readonly requirementId:string;readonly bookingId:string;readonly expectedRevision:number;
 readonly sourceRef:string;readonly reason:string;readonly at:string;readonly evidenceId:string;readonly origin?:'manual'|'ai';
 readonly basis?:RequirementBasis;readonly document?:RequirementDocument|null;
 readonly context?:RequirementBasis['context'];readonly discrepancy?:string;
 readonly checks?:{readonly content:boolean;readonly version:boolean;readonly scope:boolean;readonly purpose:boolean};
}
export interface RequirementView {
 readonly id:string;readonly bookingId:string;readonly revision:number;readonly status:RequirementStatus;
 readonly basis:RequirementBasis;readonly document:RequirementDocument|null;
 readonly review:Record<string,unknown>|null;readonly incident:Record<string,unknown>|null;
 readonly history:readonly Record<string,unknown>[];
}
export function requirementSatisfied(view:Pick<RequirementView,'status'|'review'>):boolean {
 return view.status==='Revisado' && view.review!==null;
}
export function documentaryMissing(view:Pick<RequirementView,'status'|'review'>):string|null {
 if(requirementSatisfied(view)||view.status==='No aplica')return null;
 return view.status==='Pendiente'?'document':view.status==='Recibido'?'review':'compliance';
}
