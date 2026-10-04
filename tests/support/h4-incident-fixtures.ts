import {randomUUID as uid} from 'node:crypto';
import {invoiceFixture} from './h3-invoice-fixtures.ts';
import {isolatedIncident,write,read} from './h4-incident-isolated.ts';
import type {IncidentCommand,IncidentImpact} from '../../src/domain/incident.ts';
export type H=Awaited<ReturnType<typeof isolatedIncident>>;
export async function incidentFixture(h:H,shared?:Awaited<ReturnType<typeof invoiceFixture>>,scope?:{bookingId:string;serviceId:string}){
 const b=shared??await invoiceFixture(h),incidentId=uid(),bookingId=scope?.bookingId??b.bookingId,at=new Date().toISOString();
 const impact:IncidentImpact={scope:{serviceId:scope?.serviceId??b.b.detail.services[0]!.id,action:'prepare'},effect:'preparation',material:true,coverageReviewed:true,basis:'SYNTHETIC broken equipment affects only S1'};
 const data={detectorId:h.actorId,happenedAt:'2024-12-30T23:00:00Z',description:'SYNTHETIC equipment failure',facts:'SYNTHETIC inspected damaged equipment',hypothesis:'SYNTHETIC possible wear',severity:'Crítica',impact,knownEvidence:[],effectLinks:[],context:{}};
 const state=async()=>h.incidents.read(await h.auth(),read,incidentId,bookingId);
 const attest=async(q:IncidentCommand,certainty='reviewed')=>{
  const value=Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId'].includes(k)&&v!==undefined));
  const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(value)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
  const proof=h.req('evidence',{claim:`incident:${q.action}:${hash}`,coverage:q.incidentId,certainty,source_kind:'manual'},q.incidentId,'other');
  await h.evidence.apply(await h.auth(),write,{...proof,occurredAt:q.at??at,coverage:q.incidentId});return {...q,evidenceId:proof.targetId};
 };
 const command=async(action:IncidentCommand['action'],d:Record<string,unknown>,changes:Partial<IncidentCommand>={})=>attest({action,incidentId,bookingId,operationId:uid(),expectedRevision:(await state())?.revision??0,sourceRef:'SYNTHETIC inspection',reason:'SYNTHETIC verified domain event',at,evidenceId:uid(),data:d,...changes});
 const detect=(changes:Partial<IncidentCommand>={})=>command('detect',data,{expectedRevision:0,...changes});
 const manage=()=>command('manage',{responsibleId:h.actorId,action:'SYNTHETIC repair equipment'});
 const solution={result:'SYNTHETIC repair inspected',resultVerified:true,actions:'SYNTHETIC replaced damaged component',scopeResolved:true,cause:'SYNTHETIC verified damage',causeVerified:true,uncertainty:null,uncertaintyCompatible:false,effectsIdentified:true};
 const resolve=()=>command('resolve',solution);
 const close=()=>command('close',{solutionVerified:true,recordSufficient:true,effectsIdentified:true});
 const reopen=()=>command('reopen',{sameProblem:true,basis:'recurrence',action:null,responsibleId:null});
 const severity=()=>command('severity',{severity:'Importante',basis:'SYNTHETIC new inspection verifies reduced actual risk',evasion:false});
 const justify=()=>command('justify',{scope:impact.scope,responsibleId:h.actorId,purpose:'complete-close',basis:'SYNTHETIC specific permitted follow-up exception'});
 return {b,incidentId,bookingId,impact,data,at,attest,command,detect,manage,solution,resolve,close,reopen,severity,justify,state};
}
