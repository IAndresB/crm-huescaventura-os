import {canonicalTask} from "./pending-task.ts";

export const commercialStates = ["Nueva","En contacto","Necesidad definida","Propuesta en preparación",
 "Propuesta enviada","Negociación / cambios","Aceptada / Ganada","Perdida","En pausa"] as const;
export type CommercialState = typeof commercialStates[number];
export const lossReasons = ["precio","fechas","falta de disponibilidad","cliente no responde",
 "eligió otra empresa","canceló/cambió viaje","no encaja","otro","desconocido"] as const;
export interface CommercialMaterial {
 readonly contact:Readonly<{channel:string;address:string;sourceRef:string;valid:boolean}>|null;
 readonly need:string|null;readonly commercialPossible:boolean|null;readonly pending:readonly string[];
 readonly dates?:unknown;readonly participants?:unknown;readonly services?:unknown;readonly budget?:unknown;
 readonly contactId?:string|null;readonly organizationId?:string|null;readonly groupId?:string|null;
}
export interface CommercialEvent {
 readonly type:string;readonly sourceRef:string;readonly occurredAt?:string|null;
 readonly communicationId?:string;readonly outcome?:string;readonly evidenceId?:string;
 readonly need?:string;readonly scope?:string;readonly pending?:readonly string[];
 readonly alternativeRef?:string;readonly sufficient?:boolean;
 readonly versionRef?:string;readonly sendEvidenceRef?:string;
 readonly exchangeRef?:string;readonly lossReason?:string;readonly context?:string;
 readonly decision?:string;readonly followup?:string;
 readonly interest?:string;readonly review?:string;readonly destination?:CommercialState;
 readonly support?:Readonly<{contact?:string;need?:string;scope?:string;pending?:readonly string[]}>;
 readonly change?:string;readonly humanEvaluation?:string;
}
export interface CommercialDecision {
 readonly allowed:boolean;readonly destination:CommercialState|null;
 readonly normativeIds:readonly string[];readonly blockers:readonly string[];
}
const text=(v:unknown):v is string=>typeof v==="string"&&v.trim()!=="";
const active=(s:CommercialState)=>!["Aceptada / Ganada","Perdida","En pausa"].includes(s);
const only=(v:object,keys:readonly string[])=>Object.keys(v).every(k=>keys.includes(k));
export const canonicalCommercial=canonicalTask;
export function validMaterial(m:CommercialMaterial):boolean {
 return !!m&&only(m,["contact","need","commercialPossible","pending","dates","participants","services","budget","contactId","organizationId","groupId"])
  &&(m.contact===null||!!m.contact&&only(m.contact,["channel","address","sourceRef","valid"])
   &&typeof m.contact.valid==="boolean"&&[m.contact.channel,m.contact.address,m.contact.sourceRef].every(text))
  &&(m.need===null||text(m.need))&&(m.commercialPossible===null||typeof m.commercialPossible==="boolean")
  &&Array.isArray(m.pending)&&m.pending.every(text);
}
export function decideCreation(m:CommercialMaterial):CommercialDecision {
 const blockers:string[]=[];
 if(!validMaterial(m)) blockers.push("material-invalid");
 if(!m?.contact?.valid) blockers.push("valid-contact-required");
 if(!text(m?.need)) blockers.push("identifiable-need-required");
 if(m?.commercialPossible!==true) blockers.push("real-commercial-possibility-required");
 return {allowed:blockers.length===0,destination:blockers.length?null:"Nueva",
  normativeIds:["SM-OP-01","BR-LEAD-002","DM-INV-005"],blockers};
}
export function decideProgress(state:CommercialState,e:CommercialEvent):CommercialDecision {
 const block=(id:string,...blockers:string[]):CommercialDecision=>({allowed:false,destination:null,normativeIds:[id],blockers});
 const allow=(id:string,destination:CommercialState):CommercialDecision=>({allowed:true,destination,normativeIds:[id],blockers:[]});
 if(!e||!text(e.sourceRef)) return block("G2","source-required");
 const common=["type","sourceRef","occurredAt"];
 const keys:Record<string,string[]>={contact:["communicationId","outcome","evidenceId"],define_need:["need","scope","pending"],
  prepare:["scope","sufficient","alternativeRef","pending"],send:["versionRef","sendEvidenceRef","communicationId"],
  negotiate:["exchangeRef","scope"],lose:["lossReason","context"],pause:["decision","context","followup"],
  reactivate:["interest","review","destination","support"],revise:["change","humanEvaluation","destination","support"],
  win:[],reject_alternative:["alternativeRef","context"]};
 if(!keys[e.type]||!only(e,[...common,...keys[e.type]!])) return block("SM-FORB-30","unsupported-effect");
 if(e.type==="win") return block("SPEC-FR-COM-003","verified-acceptance-required-H2-007");
 if(e.type==="contact") return state==="Nueva"&&text(e.communicationId)&&text(e.outcome)&&text(e.evidenceId)
  ?allow("SM-OP-02","En contacto"):block("SM-OP-02","registered-contact-required");
 if(e.type==="define_need") return ["Nueva","En contacto"].includes(state)&&text(e.need)&&text(e.scope)&&Array.isArray(e.pending)&&e.pending.every(text)
  ?allow("SM-OP-03","Necesidad definida"):block("SM-OP-03","need-scope-pending-required");
 if(e.type==="prepare") return block("SM-OP-04",...(["Nueva","En contacto","Necesidad definida","Propuesta enviada","Negociación / cambios"].includes(state)
  &&e.sufficient===true&&text(e.scope)&&text(e.alternativeRef)&&Array.isArray(e.pending)?["proposal-capability-pending-H2-003"]:["preparation-guards-required"]));
 if(e.type==="send") return block("SM-OP-05",...(active(state)&&text(e.versionRef)&&text(e.sendEvidenceRef)&&text(e.communicationId)
  ?["exact-version-send-capability-pending-H2-005"]:["exact-version-send-guards-required"]));
 if(e.type==="negotiate") return ["Necesidad definida","Propuesta en preparación","Propuesta enviada"].includes(state)&&text(e.exchangeRef)&&text(e.scope)
  ?allow("SM-OP-06","Negociación / cambios"):block("SM-OP-06","exchange-scope-required");
 if(e.type==="lose") return (active(state)||state==="En pausa")&&lossReasons.includes(e.lossReason as typeof lossReasons[number])&&text(e.context)
  ?allow("SM-OP-08","Perdida"):block("SM-OP-08","loss-reason-context-required");
 if(e.type==="pause") return active(state)&&text(e.decision)&&text(e.context)&&text(e.followup)
  ?allow("SM-OP-09","En pausa"):block("SM-OP-09","pause-decision-reason-followup-required");
 if(e.type==="reactivate"||e.type==="revise") {
  const id=e.type==="reactivate"?"SM-OP-10":"SM-OP-11";
  if(e.type==="reactivate"? !["Perdida","En pausa"].includes(state)||!text(e.interest)||!text(e.review)
   :!active(state)||!text(e.change)||!text(e.humanEvaluation)) return block(id,"documented-current-review-required");
  if(e.destination==="Propuesta en preparación"&&e.type==="reactivate") return block(id,"proposal-capability-pending-H2-003");
  const s=e.support;
  if(!s||!only(s,["contact","need","scope","pending"])) return block(id,"current-support-required");
  if(e.destination==="En contacto"&&text(s.contact)) return allow(id,"En contacto");
  if(e.destination==="Necesidad definida"&&text(s.need)&&text(s.scope)&&Array.isArray(s.pending)&&s.pending.every(text)) return allow(id,"Necesidad definida");
  return block(id,"current-destination-support-required");
 }
 // Recording an alternative decision alone cannot close the whole sale.
 return active(state)&&text(e.alternativeRef)&&text(e.context)?allow("AC-005",state):block("AC-005","alternative-context-required");
}
