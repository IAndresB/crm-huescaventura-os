import {civilDaysBetween,evaluateCivilDeadline,instant,localDate,zoneEvidence,civilReference,
 type CivilReference,type CivilDeadline} from "./civil-time.ts";

export type TaskDeadline =
 | Readonly<{kind:"unknown";reason:string}>
 | Readonly<{kind:"civil";date:string;sourceRef:string;version:string}>
 | Readonly<{kind:"instant";at:string;sourceRef:string;version:string}>
 | Readonly<{kind:"d020";reference:CivilReference;daysBefore:number;sourceRef:string;version:string}>;
export interface TaskIdentity {
 readonly causeKind:string;readonly causeId:string;readonly contextKind:string;
 readonly contextId:string;readonly scopeRef:string;readonly relatedKind:string|null;
 readonly relatedId:string|null;readonly effect:string;
}
export interface TaskMaterial {
 readonly title:string;readonly deadline:TaskDeadline;
 readonly priority:Readonly<{kind:"pending";reason:string}>;
 readonly sourceRef:string;readonly sourceVersion:string;
 readonly triggerRef:"manual"|"BR-TASK-005";readonly triggerVersion:string;
}
export const TASK_IDENTITY_VERSION="h1-pending-cause-v1";
export function canonicalTask(value:unknown):string {
 if(Array.isArray(value)) return `[${value.map(canonicalTask).join(",")}]`;
 if(value!==null&&typeof value==="object") return `{${Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0)
  .map(([k,v])=>`${JSON.stringify(k)}:${canonicalTask(v)}`).join(",")}}`;
 return JSON.stringify(value);
}
const kinds=["review","document","amount","data","block","advance","balance","provider","invoice",
 "suplido","participants_list","availability","modification","cancellation","proposal","final_participants"];
function invalid():never {throw new Error("TASK_INPUT_INVALID");}
function text(value:unknown):value is string {return typeof value==="string"&&value.trim()!=="";}
function only(value:object,keys:readonly string[]):boolean {return Object.keys(value).every(k=>keys.includes(k));}
export function validateTask(identity:TaskIdentity,material:TaskMaterial):void {
 if(!identity||!material||!only(identity,["causeKind","causeId","contextKind","contextId","scopeRef","relatedKind","relatedId","effect"])||
  !only(material,["title","deadline","priority","sourceRef","sourceVersion","triggerRef","triggerVersion"])||
  !kinds.includes(identity.causeKind)||!text(identity.causeId)||!text(identity.contextKind)||
  !/^[0-9a-f-]{36}$/.test(identity.contextId)||!text(identity.scopeRef)||!text(identity.effect)||
  !["contact","organization","opportunity","booking","booking_service","provider","proposal","other"].includes(identity.contextKind)||
  !((identity.relatedId===null&&identity.relatedKind===null)||(text(identity.relatedId)&&text(identity.relatedKind)))||
  !text(material.title)||!text(material.sourceRef)||!text(material.sourceVersion)||!text(material.triggerVersion)||
  !["manual","BR-TASK-005"].includes(material.triggerRef)||
  material.triggerRef==="BR-TASK-005"&&["review","amount","data"].includes(identity.causeKind)||
  material.priority?.kind!=="pending"||!text(material.priority.reason)||!only(material.priority,["kind","reason"])) invalid();
 validateDeadline(material.deadline);
}
export function validateDeadline(deadline:TaskDeadline):void {
 if(!deadline) invalid();
 if(deadline.kind==="unknown") {if(!text(deadline.reason)||!only(deadline,["kind","reason"])) invalid();return;}
 if(!text(deadline.sourceRef)||!text(deadline.version)) invalid();
 if(deadline.kind==="civil") {
  if(!only(deadline,["kind","date","sourceRef","version"])) invalid();
  localDate(deadline.date);
 }
 else if(deadline.kind==="instant") {
  if(!only(deadline,["kind","at","sourceRef","version"])) invalid();
  instant(deadline.at);
 }
 else if(deadline.kind==="d020") {
  const r=deadline.reference;
  if(!only(deadline,["kind","reference","daysBefore","sourceRef","version"])||!r||
   !only(r,["scope","scopeId","date","zone","sourceRef","version","basis"])||!r.zone||
   !only(r.zone,["zone","sourceRef","version"])) invalid();
  civilReference(r,localDate(r.date),zoneEvidence(r.zone.zone,r.zone.sourceRef,r.zone.version),r.sourceRef,r.version,r.basis);
  evaluateCivilDeadline(r,r.date,deadline.daysBefore);
 } else invalid();
}
export function evaluateTaskDeadline(deadline:TaskDeadline,at:Readonly<{date?:string;instant?:string}>):
 Readonly<{known:boolean;overdue:boolean;evaluation?:CivilDeadline}> {
 validateDeadline(deadline);
 if(deadline.kind==="unknown") return {known:false,overdue:false};
 if(deadline.kind==="instant") {
  if(!at.instant) throw new Error("TASK_EVALUATION_REFERENCE_UNKNOWN");
  return {known:true,overdue:Date.parse(instant(at.instant))>Date.parse(deadline.at)};
 }
 if(!at.date) throw new Error("TASK_EVALUATION_REFERENCE_UNKNOWN");
 const date=localDate(at.date);
 if(deadline.kind==="civil") return {known:true,overdue:civilDaysBetween(localDate(deadline.date),date)>0};
 const evaluation=evaluateCivilDeadline(deadline.reference,date,deadline.daysBefore);
 return {known:true,overdue:evaluation.expired,evaluation};
}
