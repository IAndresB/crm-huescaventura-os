import {civilDaysBetween,civilReference,localDate,shiftCivilDate,type CivilReference} from './civil-time.ts';
import {validateTask,type TaskDeadline,type TaskIdentity,type TaskMaterial} from './pending-task.ts';

const effects={
 block:['block','hold-expiry-review','Revisar bloqueo de alojamiento'],
 advance:['advance','advance-payment-review','Revisar anticipo pendiente'],
 balance:['balance','balance-payment-review','Revisar saldo pendiente'],
 provider:['provider','provider-confirmation-review','Revisar confirmación de proveedor'],
 invoice:['invoice','provider-invoice-review','Revisar factura de proveedor'],
 suplido:['suplido','suplido-payment-review','Revisar suplido pendiente de pago'],
 document:['document','document-review','Revisar documentación pendiente'],
 participants_list:['participants_list','participants-list-review','Revisar lista necesaria de participantes'],
 availability:['availability','availability-revalidation','Revalidar disponibilidad'],
 modification:['modification','modification-review','Revisar modificación pendiente'],
 cancellation:['cancellation','cancellation-review','Revisar cancelación pendiente'],
 proposal:['proposal','proposal-followup','Seguir propuesta'],
 final_participants:['final_participants','final-participants-review','Confirmar cifra final de participantes'],
} as const;
export type ApprovedTaskCause=keyof typeof effects;
type Base=Readonly<{
 cause:ApprovedTaskCause;causeId:string;contextKind:TaskIdentity['contextKind'];contextId:string;
 scopeRef:string;sourceRef:string;sourceVersion:string;relatedKind?:string|null;relatedId?:string|null;
}>;
export type ApprovedTaskEvent=Base & Readonly<{
 deadline?:TaskDeadline;missingParameter?:string;
 proposal?:Readonly<{createdDate:string;followupDate?:string;expiresDate?:string;preExpiryDays?:number}>;
 finalParticipants?:Readonly<{reference:CivilReference;daysBefore?:number|null}>;
 balance?:Readonly<{reference:CivilReference;verifiedRemaining:string}>;
}>;
export type ApprovedTaskNeed=Readonly<{identity:TaskIdentity;material:TaskMaterial;reason:string}>;
function invalid():never{throw new Error('TASK_TRIGGER_INPUT_INVALID');}
function filled(x:unknown):x is string{return typeof x==='string'&&x.trim().length>0;}
function deadlineUnknown(reason:string):TaskDeadline {if(!filled(reason))invalid();return {kind:'unknown',reason};}
function civil(date:string,sourceRef:string,version:string):TaskDeadline {
 return {kind:'civil',date:localDate(date),sourceRef,version};
}
function d020(reference:CivilReference,daysBefore:number,sourceRef:string,version:string):TaskDeadline {
 civilReference({scope:reference.scope,scopeId:reference.scopeId},localDate(reference.date),reference.zone,
  reference.sourceRef,reference.version,reference.basis);
 if(!Number.isSafeInteger(daysBefore)||daysBefore<0)invalid();
 return {kind:'d020',reference,daysBefore,sourceRef,version};
}

/** C02-only plan. The caller must supply a verified source fact; this does not mint one. */
export function approvedTaskNeeds(e:ApprovedTaskEvent):readonly ApprovedTaskNeed[] {
 if(!e||!Object.hasOwn(effects,e.cause)||![e.causeId,e.contextKind,e.contextId,e.scopeRef,e.sourceRef,e.sourceVersion].every(filled)
  ||(e.relatedKind==null)!==(e.relatedId==null))invalid();
 const [causeKind,effect,title]=effects[e.cause];
 const make=(suffix:string,heading:string,deadline:TaskDeadline,reason:string):ApprovedTaskNeed=>{
  const identity:TaskIdentity={causeKind,causeId:e.causeId,contextKind:e.contextKind,contextId:e.contextId,
   scopeRef:e.scopeRef,relatedKind:e.relatedKind??null,relatedId:e.relatedId??null,effect:suffix};
  const material:TaskMaterial={title:heading,deadline,priority:{kind:'pending',reason:'Prioridad no configurada'},
   sourceRef:e.sourceRef,sourceVersion:e.sourceVersion,triggerRef:'BR-TASK-005',triggerVersion:'0.2'};
  validateTask(identity,material);return {identity,material,reason};
 };
 if(e.cause==='proposal') {
  if(!e.proposal||e.deadline||e.finalParticipants||e.balance)invalid();
  const p=e.proposal;localDate(p.createdDate);
  if(p.followupDate){const interval=civilDaysBetween(localDate(p.createdDate),localDate(p.followupDate));if(interval<2||interval>3)invalid();}
  if(p.expiresDate&&civilDaysBetween(localDate(p.createdDate),localDate(p.expiresDate))<0)invalid();
  if(p.preExpiryDays!==undefined&&(!Number.isSafeInteger(p.preExpiryDays)||p.preExpiryDays<1))invalid();
  const follow=p.followupDate?civil(p.followupDate,e.sourceRef,e.sourceVersion):deadlineUnknown('Falta fecha concreta verificada dentro de 2–3 días');
  const expiry=p.expiresDate&&p.preExpiryDays!==undefined?
   civil(shiftCivilDate(localDate(p.expiresDate),-p.preExpiryDays),e.sourceRef,e.sourceVersion):
   deadlineUnknown(p.expiresDate?'Falta adelanto verificado antes de caducidad':'Falta caducidad verificada');
  return [make(effect,title,follow,'Seguimiento interno de propuesta'),
   make('proposal-pre-expiry','Avisar antes de caducar propuesta',expiry,'Revisar caducidad de propuesta')];
 }
 if(e.cause==='final_participants') {
  if(!e.finalParticipants||e.deadline||e.proposal||e.balance)invalid();
  const p=e.finalParticipants;
  const deadline=p.daysBefore===null?deadlineUnknown('Plazo específico de cifra final pendiente de verificar'):
   d020(p.reference,p.daysBefore??7,e.sourceRef,e.sourceVersion);
  return [make(effect,title,deadline,'Confirmación de cifra final por alcance')];
 }
 if(e.cause==='balance') {
  if(!e.balance||e.deadline||e.proposal||e.finalParticipants)invalid();
  if(e.balance.reference.scope!=='global'||!/^(?:0|[1-9]\d*)\.\d{2}$/.test(e.balance.verifiedRemaining))invalid();
  if(e.balance.verifiedRemaining==='0.00')return [];
  return [make(effect,title,d020(e.balance.reference,7,e.sourceRef,e.sourceVersion),
   'Saldo general verificado pendiente')];
 }
 if(e.proposal||e.finalParticipants||e.balance)invalid();
 const deadline=e.deadline??deadlineUnknown(e.missingParameter??'Falta plazo verificado para esta necesidad');
 return [make(effect,title,deadline,'Disparador aprobado pendiente de revisión')];
}
