import {randomUUID as uid} from 'node:crypto';
import {type isolatedJointClosures,read,write} from './h5-joint-closure-isolated.ts';
import {settledInternalFixture} from './h5-closure-settlement-fixture.ts';
import {closureCommands} from './h5-closure-fixtures.ts';
import type {ClosureDimension,JointClosureCommand,CriterionConclusion} from '../../src/domain/closure-assessment.ts';
import type {RealityCommand,RealityScope} from '../../src/domain/operational-reality.ts';
type H=Awaited<ReturnType<typeof isolatedJointClosures>>;
export const conclusions:Record<ClosureDimension,Record<string,CriterionConclusion>>={
 commercial:{documents:'not_applicable','final-terms':'satisfied',modifications:'not_applicable'},
 operational:{documents:'not_applicable',performance:'satisfied','critical-incidents':'not_applicable'},
 economic:{documents:'not_applicable','customer-obligations':'satisfied','supplier-documents':'not_applicable','own-economics':'satisfied',refunds:'not_applicable',deposits:'not_applicable','economic-incidents':'not_applicable','cancellation-obligations':'not_applicable'}
};
export async function jointCommands(h:H,bid:string){
 const c=await closureCommands(h,bid);
 const hash=async(x:unknown)=>String((await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(x)}::text::jsonb::text,'UTF8'),'sha256'),'hex') h`)[0]!.h);
 const proof=async(claim:string,at:string)=>{const e=h.req('evidence',{claim,coverage:bid,certainty:'reviewed',source_kind:'manual'},bid,'other');await h.evidence.apply(await h.auth(),write,{...e,occurredAt:at,coverage:bid});return e.targetId;};
 const attest=async(q:Omit<JointClosureCommand,'evidenceId'>)=>({...q,evidenceId:await proof('closure:'+await hash(Object.fromEntries(Object.entries(q).filter(([k])=>!['operationId','evidenceId'].includes(k)))),q.at)});
 const command=async(changes:Partial<JointClosureCommand>={})=>{const v=await c.view();return attest({action:'close',operationId:uid(),bookingId:bid,expectedRevision:v.revision,expectedMaterial:v.material,expectedJointRevision:v.jointClosure.revision,sourceRef:'SYNTHETIC explicit final review',reason:'SYNTHETIC reviewed joint closure',at:new Date().toISOString(),...changes});};
 const flags=async()=>((await c.view()).inputs.services as {service_id:string}[]).map(s=>({serviceId:s.service_id,suplido:false,deposit:false,ownEconomics:false,reason:'SYNTHETIC actual internal services with no deposit'}));
 const resolve=async(d:ClosureDimension)=>{
  const v=await c.view();if(!v.assessments[d])await c.run(await c.command(d,conclusions[d],{serviceApplicability:await flags()}));
  return c.run(await c.command(d,conclusions[d],{action:'evaluate',serviceApplicability:await flags()}));
 };
 return {c,hash,proof,attest,command,flags,resolve,run:async(q:JointClosureCommand)=>h.closures.close(await h.auth(),write,q)};
}
export async function jointFixture(h:H,dimensions:readonly ClosureDimension[]=['commercial','operational','economic']){
 const f=await settledInternalFixture(h),j=await jointCommands(h,f.bookingId),bid=f.bookingId,at=new Date().toISOString();
 const doc=h.req('document',{relation:'original',content_ref:'SYNTHETIC actual internal service record',content_kind:'manual_record',storage_state:'reference_only'},bid,'booking');await h.evidence.apply(await h.auth(),write,{...doc,occurredAt:at});
 const v=(await h.reality.read(await h.auth(),read,bid))!;
 const scopes:RealityScope[]=v.scopes.map(s=>({serviceId:String(s.serviceId),nightId:s.nightId as string|null,contributionId:s.contributionId as string|null,dimension:s.dimension as 'quantity',start:'0',amount:String(s.current)}));
 const rv={responsibleId:h.actorId,basis:'SYNTHETIC verified performed services, no outstanding review',pending:[],incidentRequired:false,incidentIds:[]};
 const review={...rv,evidenceId:await j.proof('reality:review:'+await j.hash(rv),at)};
 const rq:RealityCommand={action:'perform',operationId:uid(),factId:uid(),bookingId:bid,expectedRevision:v.revision,expectedMaterial:v.material,sourceRef:'SYNTHETIC actual services',reason:'SYNTHETIC verified actual performance',at,evidenceId:uid(),data:{scopes,moment:{kind:'civil',value:'2026-10-01'},source:{kind:'internal',id:h.actorId,offeringRevisionId:null,counterpart:'SYNTHETIC responsible',channel:'internal-record'},responsibleId:h.actorId,originalId:doc.targetId,certainty:'verified',exceptional:true,review,correctsFactId:null,correctsRevision:null}};
 const material=Object.fromEntries(Object.entries(rq).filter(([k])=>!['operationId','evidenceId'].includes(k)));
 await h.reality.apply(await h.auth(),write,{...rq,evidenceId:await j.proof('reality:perform:'+await j.hash(material),at)});
 for(const d of dimensions)await j.resolve(d);
 return {...f,j};
}
