// Synthetic invoice fixtures through existing H2 APIs; no historical Booking edits.
import {randomUUID as uid} from 'node:crypto';
import {write} from './h2-acceptance-isolated.ts';
import type {isolatedAcceptance} from './h2-acceptance-isolated.ts';
import type {AcceptanceCommand} from '../../src/infrastructure/postgres/h2-acceptance-adapter.ts';
type H=Awaited<ReturnType<typeof isolatedAcceptance>>;
export const now=()=>new Date(Date.now()).toISOString();
export async function economyAcceptanceFixture(h:H,short=false,selectableLine=false,nature:'internal'|'external'='external'){
 const service=await h.cat('service',{name:nature==='internal'?'SYNTHETIC Tararí':'SYNTHETIC external service',nature}),unit=await h.cat('unit',{name:'SYNTHETIC group',definition:'fixed group'}),form=await h.cat('pricing_form',{name:'SYNTHETIC fixed',definition:'fixed'});
 const tariff=await h.com('tariff',{label:'synthetic',price_state:'confirmed',amount:'900.00',cost_state:'confirmed',cost_amount:'700.00',vat_treatment:'included',unit_revision_id:unit.revision,pricing_form_revision_id:form.revision},service);
 const opp=h.input();await h.adapter.apply(await h.auth(),write,opp);
 const mid=uid(),line=uid(),other=uid(),content={scope:'H2 exact synthetic scope',terms:{version:'H2-T1',text:'Existing synthetic conditions; no mandate',sourceRef:'synthetic retained terms'},pending:[],modalities:[mid,other].map((id,i)=>({id,name:i?'B':'A',participants:i?5:10,independent:true,selectable:true,conditions:'synthetic exact',finalPersonPrice:i?'120.00':'150.00',manualReason:'human synthetic',definitive:true,lines:[{id:i?uid():line,serviceRevisionId:service.revision,unitRevisionId:unit.revision,tariffRevisionId:tariff.revision,quantity:'1',included:true,independent:selectableLine,selectable:selectableLine,date:'2026-10-20',datePending:false,priceBasis:'fixed' as const,costMaterial:true,sourceRef:'synthetic quantity'}]}))};
 const proposalId=uid(),versionId=uid(),c={action:'prepare' as const,operationId:uid(),proposalId,opportunityId:opp.targetId,expectedRevision:0,expectedOpportunityRevision:1,sourceRef:'synthetic',reason:'synthetic',content};
 await h.proposal.apply(await h.auth(),write,c);await h.proposal.apply(await h.auth(),write,{...c,action:'fix',operationId:uid(),versionId,content:undefined,expectedRevision:1});
 const accepterId=uid(),designationId=uid();await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId:uid(),targetId:accepterId,kind:'contact',expectedVersion:0,sourceRef:'synthetic identity',evidenceRef:'synthetic identity evidence',reason:'synthetic',verified:true,displayName:'SYNTHETIC CLIENT'});
 await h.identities.apply(await h.auth(),write,{action:'designate',operationId:uid(),targetId:designationId,relatedId:accepterId,contextId:opp.targetId,kind:'primary_contact',expectedVersion:0,sourceRef:'synthetic designation',evidenceRef:'synthetic faculty',reason:'synthetic',verified:true,happenedAt:new Date(Date.now()-1000).toISOString()});
 const proof=async(claim:string,coverage:string,at:string,certainty='reviewed')=>{const r=h.req('evidence',{claim,coverage,certainty,source_kind:'manual'},opp.targetId);await h.evidence.apply(await h.auth(),write,{...r,coverage,occurredAt:at});return r.targetId;};
 const revisions=async()=>({expectedRevision:Number((await h.observer`select revision from crm_private.b03_proposals where proposal_id=${proposalId}::uuid`)[0]!.revision),expectedOpportunityRevision:Number((await h.observer`select revision from crm_private.b03_opportunities where opportunity_id=${opp.targetId}::uuid`)[0]!.revision)});
 const issued=now(),until=new Date(Date.now()+60).toISOString(),limitEvidence=short?await proof(`offer:limit:${versionId}:availability:${until}`,content.scope,issued):undefined,evidenceId=await proof(`offer:issue:${versionId}:${issued}:7`,content.scope,issued);
 await h.offer.apply(await h.auth(),write,{action:'issue',operationId:uid(),proposalId,opportunityId:opp.targetId,versionId,...await revisions(),sourceRef:'synthetic',reason:'synthetic',coverage:content.scope,at:issued,issuance:{issuedAt:issued,limits:short?[{aspect:'availability',until,evidenceId:limitEvidence!}]:[]},evidenceId});
 const q=async(change:Partial<AcceptanceCommand>={}):Promise<AcceptanceCommand>=>({action:'candidate',operationId:uid(),acceptanceId:uid(),proposalId,opportunityId:opp.targetId,versionId,...await revisions(),sourceRef:'synthetic exact act',reason:'synthetic decision',coverage:content.scope,at:now(),...change});
 const registration=async(coverage=content.scope,channel='phone',certainty='reviewed')=>{const at=now(),acceptanceId=uid(),authorityEvidenceId=await proof(`acceptance:authority:${versionId}:${accepterId}:${designationId}`,coverage,at),evidenceId=await proof(`acceptance:agree:${versionId}:${acceptanceId}:${accepterId}:${channel}`,coverage,at,certainty);
  return q({action:'register',acceptanceId,at,coverage,accepterId,designationId,channel,terms:content.terms,authorityEvidenceId,evidenceId});};
 const register=async(coverage=content.scope,channel='phone')=>{const r=await registration(coverage,channel);await h.acceptance.apply(await h.auth(),write,r);return r;};
 const verification=async(r:AcceptanceCommand,won=true)=>{const reviewEvidence:Record<string,string>={};for(const aspect of ['prices','availability','conditions','capacity']) reviewEvidence[aspect]=await proof(`offer:review:${versionId}:${r.acceptanceId}:accept:${aspect}`,r.coverage,r.at);
  return q({action:'verify',acceptanceId:r.acceptanceId,at:r.at,coverage:r.coverage,reviewEvidence,won});};
 return {opp,content,mid,line,other,proposalId,versionId,accepterId,designationId,proof,q,revisions,registration,register,verification};
}




import type {BookingCommand} from '../../src/infrastructure/postgres/h2-booking-adapter.ts';
import type {BookingDetail} from '../../src/domain/booking-conversion.ts';

export async function economyBookingFixture(h:H,coverage:'total'|'modality'|'line'='total',verify=true,nature:'internal'|'external'='external'){
 const f=await economyAcceptanceFixture(h,false,true,nature),r=await f.register(coverage==='total'?f.content.scope:coverage==='modality'?f.mid:f.line),vq=await f.verification(r);
 if(verify)await h.acceptance.apply(await h.auth(),write,vq);
 const selected=f.content.modalities.flatMap(m=>m.lines.filter(l=>l.included&&(coverage==='total'||coverage==='modality'&&m.id===f.mid||coverage==='line'&&l.id===f.line)).map(l=>({m,l})));
 const detail:BookingDetail={services:selected.map(({m,l})=>({id:uid(),serviceRevisionId:l.serviceRevisionId,nature,variant:null,provider:null,place:null,schedule:null,contributions:[{id:uid(),lineId:l.id,modalityId:m.id,quantity:l.quantity,attendees:m.participants,certainty:'estimated'}],nights:[]})),participants:[],assignments:[]};
 const proof=async(d:BookingDetail)=>{const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(d)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;return f.proof(`booking:detail:${r.acceptanceId}:${hash}`,r.coverage,now());};
 const q:BookingCommand={operationId:uid(),bookingId:uid(),opportunityId:f.opp.targetId,acceptanceId:r.acceptanceId,proposalId:f.proposalId,versionId:f.versionId,coverage:r.coverage,terms:f.content.terms,...await f.revisions(),sourceRef:'H2009 SYNTHETIC booking origin',reason:'SYNTHETIC conversion',evidenceId:await proof(detail),detail,route:'normal'};
 return {f,r,vq,q,detail,proof};
}
