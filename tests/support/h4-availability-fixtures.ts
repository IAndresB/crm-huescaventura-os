import {randomUUID as uid} from 'node:crypto';
import {invoiceFixture} from './h3-invoice-fixtures.ts';
import {isolatedAvailability,read,write} from './h4-availability-isolated.ts';
import type {AvailabilityCommand,AvailabilityCoverage,AvailabilitySource} from '../../src/domain/availability.ts';
export type H=Awaited<ReturnType<typeof isolatedAvailability>>;
export async function availabilityFixture(h:H,shared?:Awaited<ReturnType<typeof invoiceFixture>>,index=0){
 const b=shared??await invoiceFixture(h),availabilityId=uid(),bookingId=b.bookingId,service=b.b.detail.services[index]!,at=new Date().toISOString();
 const unit=(await h.cat('unit',{name:'SYNTHETIC person capacity',definition:'SYNTHETIC individual attendee capacity, independently of charging unit'})).revision;
 const coverage:AvailabilityCoverage={serviceId:service.id,nightId:null,serviceRevisionId:service.serviceRevisionId,serviceRevision:1,bookingRevision:1,variant:null,dates:['2026-10-20'],quantity:'12',unitRevisionId:unit,purpose:'availability-for-action'};
 const source:AvailabilitySource=b.b.detail.services[0]!.nature==='internal'?{kind:'internal',id:h.actorId}:{kind:'provider',id:b.provider.revision};
 const state=async()=>h.availability.read(await h.auth(),read,availabilityId,bookingId);
 const attest=async(q:AvailabilityCommand,certainty='reviewed')=>{const value=Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId'].includes(k)&&v!==undefined));const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(value)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;const proof=h.req('evidence',{claim:`availability:${q.action}:${hash}`,coverage:q.availabilityId,certainty,source_kind:'manual'},q.availabilityId,'other');await h.evidence.apply(await h.auth(),write,{...proof,occurredAt:q.at,coverage:q.availabilityId});return {...q,evidenceId:proof.targetId};};
 const command=async(action:AvailabilityCommand['action'],data:Record<string,unknown>,changes:Partial<AvailabilityCommand>={})=>attest({action,availabilityId,bookingId,operationId:uid(),expectedRevision:(await state())?.revision??0,sourceRef:'SYNTHETIC identified source',reason:'SYNTHETIC domain event',at,evidenceId:uid(),data,...changes});
 const query=()=>command('query',{coverage,source,happenedAt:'2026-09-28T10:00:00Z',content:'SYNTHETIC query for 12, no answer inferred'});
 const record=async()=>{const q=h.req('document',{relation:'original',content_ref:'SYNTHETIC manual original',content_kind:'synthetic-text',storage_state:'reference_only'},bookingId,'booking');await h.evidence.apply(await h.auth(),write,q);return q.targetId;};
 const receive=async(changes:Record<string,unknown>={})=>command('receive',{coverage,source,happenedAt:'2026-09-29T10:00:00Z',content:'SYNTHETIC hay sitio para 12',factId:uid(),recordId:await record(),certainty:'communicated',conditions:'SYNTHETIC capacity only, no booking commitment',validUntil:null,...changes});
 const verify=async(changes:Record<string,unknown>={})=>{const v=await state();const response=v!.response!;return command('verify',{coverage:response.coverage,source:response.source,actionAt:at,actionUntil:at,authority:true,unequivocal:true,checks:{dates:true,quantity:true,unit:true,variant:true,conditions:true,capacity:true,validity:true},precedence:v?.confirmed?'verified-newer':'first',basis:'SYNTHETIC authorized call checked exact action',resolvedAspects:['dates','quantity','unit','variant','conditions','capacity','validity'],...changes});};
 const review=async(changes:Record<string,unknown>={})=>command('review',{cause:'SYNTHETIC material discrepancy',before:(await state())?.confirmed??null,after:{quantity:'16'},dependencies:[coverage],aspects:['quantity','capacity'],result:'pending',...changes});
 const apply=async(q:AvailabilityCommand)=>h.availability.apply(await h.auth(),write,q);

 const assess=async(c=coverage,s=source,t=at,u=at)=>h.availability.evaluate(await h.auth(),read,bookingId,c,s,t,u);
 return {b,availabilityId,bookingId,service,coverage,source,at,state,attest,command,query,receive,record,verify,review,apply,assess};
}
