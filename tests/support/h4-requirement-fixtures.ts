import {randomUUID as uid} from 'node:crypto';
import {invoiceFixture} from './h3-invoice-fixtures.ts';
import {isolatedRequirement,write,read} from './h4-requirement-isolated.ts';
import type {RequirementBasis,RequirementCommand,RequirementDocument} from '../../src/domain/document-requirement.ts';
export type H=Awaited<ReturnType<typeof isolatedRequirement>>;
export async function requirementFixture(h:H,shared?:Awaited<ReturnType<typeof invoiceFixture>>){
 const b=shared??await invoiceFixture(h),requirementId=uid(),bookingId=b.bookingId,at=new Date().toISOString();
 const basis:RequirementBasis={rule:{id:uid(),version:'V1',sourceRef:'SYNTHETIC configured material need',purpose:'activity-preparation',documentType:'permission',scopeKind:'service',indispensable:true,conditionKey:'variant',equals:'regulated',requiredFields:[]},scope:{serviceId:b.b.detail.services[0]!.id,action:'prepare'},context:{conditionKey:'variant',value:'regulated',sourceRef:'SYNTHETIC applied service condition',version:'1'}};
 const see=async()=>h.requirements.read(await h.auth(),read,requirementId,bookingId);
 const attest=async(q:RequirementCommand,certainty='reviewed')=>{
  const value=Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId'].includes(k)&&v!==undefined));
  const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(value)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
  const proof=h.req('evidence',{claim:`requirement:${q.action}:${hash}`,coverage:q.requirementId,certainty,source_kind:'manual'},q.requirementId,'other');
  await h.evidence.apply(await h.auth(),write,{...proof,occurredAt:q.at,coverage:q.requirementId});return {...q,evidenceId:proof.targetId};
 };
 const command=async(action:RequirementCommand['action'],changes:Partial<RequirementCommand>={})=>attest({action,requirementId,bookingId,operationId:uid(),expectedRevision:(await see())?.revision??0,sourceRef:'SYNTHETIC source',reason:'SYNTHETIC authorized material documentary act',at,evidenceId:uid(),...changes});
 const document=async(changes:Partial<RequirementDocument>={},previous?:string)=>{
  const d=await b.document({},previous);return {documentId:d.documentId,objectVersionId:d.objectVersionId,ruleVersion:'V1',purpose:basis.rule.purpose,coverage:[basis.scope],...changes};
 };
 const need=(changes:Partial<RequirementCommand>={})=>command('need',{basis,expectedRevision:0,...changes});
 const receive=async(d?:RequirementDocument)=>command('receive',{document:d??await document()});
 const review=(changes:Partial<RequirementCommand>={})=>command('review',{checks:{content:true,version:true,scope:true,purpose:true},...changes});
 return {b,requirementId,bookingId,basis,at,attest,command,document,need,receive,review,see};
}
