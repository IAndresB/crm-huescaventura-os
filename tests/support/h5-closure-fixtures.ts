import {randomUUID as uid} from 'node:crypto';
import {type isolatedClosures,read,write} from './h5-closure-isolated.ts';
import type {ClosureCommand,ClosureDimension,CriterionConclusion} from '../../src/domain/closure-assessment.ts';
export const criterionIds={commercial:['documents','final-terms','modifications'],operational:['documents','performance','critical-incidents'],economic:['documents','customer-obligations','supplier-documents','own-economics','refunds','deposits','economic-incidents','cancellation-obligations']} as const;
export async function closureCommands(h:Awaited<ReturnType<typeof isolatedClosures>>,bid:string){
 const view=()=>h.auth().then(a=>h.closures.read(a,read,bid));
 const proof=async(q:Omit<ClosureCommand,'evidenceId'>)=>{
  const material=Object.fromEntries(Object.entries(q).filter(([k])=>!['operationId','evidenceId'].includes(k)));
  const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(material)}::text::jsonb::text,'UTF8'),'sha256'),'hex') h`)[0]!.h;
  const e=h.req('evidence',{claim:'closure:'+hash,coverage:bid,certainty:'reviewed',source_kind:'manual'},bid,'other');
  await h.evidence.apply(await h.auth(),write,{...e,occurredAt:q.at,coverage:bid});return {...q,evidenceId:e.targetId};
 };
 const command=async(dimension:ClosureDimension,conclusions:Partial<Record<string,CriterionConclusion>>={},changes:Partial<Omit<ClosureCommand,'evidenceId'>>={})=>{
  const v=await view();return proof({action:'open',operationId:uid(),bookingId:bid,dimension,expectedRevision:v.revision,expectedMaterial:v.material,
   at:new Date().toISOString(),sourceRef:'SYNTHETIC independent criterion review',reason:'SYNTHETIC explicit normative assessment',
   criteria:criterionIds[dimension].map(id=>({id,conclusion:conclusions[id]??'pending',reason:'SYNTHETIC independently reviewed '+id})),
   documentDependencies:[],serviceApplicability:[],...changes});
 };
 return {view,proof,command,run:async(q:ClosureCommand)=>h.closures.apply(await h.auth(),write,q)};
}
