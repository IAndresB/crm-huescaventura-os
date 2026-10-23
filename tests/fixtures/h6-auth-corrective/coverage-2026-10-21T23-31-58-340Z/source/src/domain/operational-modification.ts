import {civilReference,evaluateInstant,instant,localDate,zoneEvidence,type Scope} from './civil-time.ts';
/** Modification progress, approval, current scope and historical facts are separate. */
export interface ModificationCommand {readonly action:'request'|'evaluate'|'provider'|'response'|'approve'|'apply'|'reject'|'withdraw'|'change'|'incident'|'review'|'ratify'|'review_negative';readonly operationId:string;readonly modificationId:string;readonly bookingId:string;readonly expectedRevision:number;readonly sourceRef:string;readonly reason:string;readonly at:string;readonly evidenceId:string;readonly data:Readonly<Record<string,unknown>>;readonly origin?:'manual'|'ai'}
export interface ModificationView {readonly id:string;readonly bookingId:string;readonly revision:number;readonly progress:string;readonly request:Record<string,unknown>;readonly parts:readonly Record<string,unknown>[];readonly approval:Record<string,unknown>|null;readonly review:Record<string,unknown>|null;readonly incident:Record<string,unknown>|null;readonly history:readonly Record<string,unknown>[]}
export interface ModificationAssessment {readonly id:string;readonly progress:string;readonly parts:readonly Record<string,unknown>[];readonly bookingCancelled:boolean;readonly economicPending:true;readonly refundExecuted:false;readonly fundsChanged:false}

/** Validate civil references with the accredited H1/D020 kernel, before final database guards. */
export function validateModificationTemporal(command:Readonly<Record<string,unknown>>):void {
 if(command.action!=="evaluate")return;const data=command.data as Record<string,unknown>;
 if(data.temporal===undefined)return;if(!Array.isArray(data.temporal))throw new Error("MODIFICATION_TEMPORAL_REQUIRED:E3");
 for(const input of data.temporal){const x=input as Record<string,unknown>,scope=x.scope as {kind:string;id:string};
  const kind=scope.kind==="booking"?"global":scope.kind==="contribution"?"service":scope.kind;
  const reference=civilReference({scope:kind as Scope,scopeId:scope.id},localDate(String(x.referenceDate)),zoneEvidence(String(x.zone),String(x.sourceRef),String(x.version)),String(x.sourceRef),String(x.version),x.basis as "default"|"express_contract");
  evaluateInstant(reference,instant(String(command.at)));
 }
}
