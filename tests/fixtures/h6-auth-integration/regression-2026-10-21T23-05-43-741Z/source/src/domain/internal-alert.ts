export type AlertUrgency="informative"|"important"|"critical";
export interface AlertIdentity {
 readonly sourceRef:string;readonly causeId:string;readonly contextKind:string;
 readonly contextId:string;readonly scopeRef:string;readonly effect:string;
}
/** References only: no message bodies, credentials or inferred business facts. */
export interface AlertMaterial {
 readonly cause:string;readonly risk:string;readonly requiredAction:string;
 readonly urgency:AlertUrgency;readonly sourceVersion:string;
 readonly automation:null|Readonly<{
  definitionRef:string;executionRef:string;version:string;triggerRef:string;
  inputsRef:string;permissionsRef:string;effectsRef:string;recordsRef:string;
  retryLimit:number|null;pauseSeconds:number|null;missingParameters:readonly string[];
 }>;
}
export type AlertCommand=
 | Readonly<{action:"receive";operationId:string;alertId:string;identity:AlertIdentity;material:AlertMaterial;reason:string}>
 | Readonly<{action:"stop"|"review";operationId:string;alertId:string;expectedRevision:number;reason:string;reviewRef:string}>
 | Readonly<{action:"record_synthetic_result";operationId:string;alertId:string;expectedRevision:number;
  attemptId:string;outcome:"failed"|"uncertain"|"simulated_delivered";resultRef:string;version:string;
  reason:string;reviewRef:string|null}>;
export function internalChannels(urgency:AlertUrgency):readonly ("crm"|"whatsapp")[] {
 if(!["informative","important","critical"].includes(urgency))throw new Error("ALERT_URGENCY_INVALID");
 return urgency==="informative"?["crm"]:["crm","whatsapp"];
}
export function missingAlertParameters(material:AlertMaterial):readonly string[] {
 const a=material.automation;if(!a)return [];
 return [...new Set([...(a.retryLimit===null?["retryLimit"]:[]),...(a.pauseSeconds===null?["pauseSeconds"]:[]),...a.missingParameters])];
}
