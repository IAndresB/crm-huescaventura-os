// Synthetic direct-sale fixture. Each Opportunity begins without Proposal, Acceptance or Booking.
import {randomUUID as uid} from 'node:crypto';
import {write,type isolatedWork} from './h6-current-isolated.ts';
import type {BookingCommand,DirectStage} from '../../src/infrastructure/postgres/h2-booking-adapter.ts';
import type {BookingDetail} from '../../src/domain/booking-conversion.ts';
export async function directFixture(h:Awaited<ReturnType<typeof isolatedWork>>){
 const service=await h.cat('service',{name:'H6002 SYNTHETIC service',nature:'external'}),unit=await h.cat('unit',{name:'H6002 SYNTHETIC group',definition:'fixed group'}),form=await h.cat('pricing_form',{name:'H6002 SYNTHETIC fixed',definition:'fixed'});
 const tariff=await h.com('tariff',{label:'H6002 SYNTHETIC tariff',price_state:'confirmed',amount:'90.00',cost_state:'confirmed',cost_amount:'70.00',vat_treatment:'included',unit_revision_id:unit.revision,pricing_form_revision_id:form.revision},service);
 const opportunity=h.input({sourceRef:'H6002 SYNTHETIC actual call',reason:'H6002 SYNTHETIC direct need'});await h.adapter.apply(await h.auth(),write,opportunity);
 const opportunityId=opportunity.targetId,proposalId=uid(),versionId=uid(),acceptanceId=uid(),accepterId=uid(),designationId=uid(),at=new Date().toISOString(),coverage='H6002 SYNTHETIC exact accepted whole scope',modalityId=uid(),lineId=uid();
 await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId:uid(),targetId:accepterId,kind:'contact',expectedVersion:0,sourceRef:'H6002 SYNTHETIC identity',evidenceRef:'H6002 SYNTHETIC identity proof',reason:'SYNTHETIC',verified:true,displayName:'H6002 SYNTHETIC CLIENT'});
 await h.identities.apply(await h.auth(),write,{action:'designate',operationId:uid(),targetId:designationId,contextId:opportunityId,relatedId:accepterId,kind:'primary_contact',expectedVersion:0,sourceRef:'SYNTHETIC',evidenceRef:'SYNTHETIC authority',reason:'SYNTHETIC',verified:true,happenedAt:new Date(Date.now()-1000).toISOString()});
 const terms={version:'H6002 synthetic terms 1',text:'H6002 exact synthetic agreed conditions',sourceRef:'H6002 synthetic retained conditions'};
 const content={scope:coverage,terms,pending:[],modalities:[{id:modalityId,name:'H6002 SYNTHETIC whole group',participants:4,independent:true,selectable:true,conditions:'H6002 exact',finalPersonPrice:'100.00',manualReason:'H6002 human fixture',definitive:true,lines:[{id:lineId,serviceRevisionId:service.revision,unitRevisionId:unit.revision,tariffRevisionId:tariff.revision,quantity:'1',included:true,independent:false,selectable:false,date:'2026-10-26',datePending:false,priceBasis:'fixed' as const,costMaterial:true,sourceRef:'H6002 synthetic source quantity'}]}]};
 const proof=async(claim:string,when=at)=>{const e=h.req('evidence',{claim,coverage,certainty:'reviewed',source_kind:'manual'},opportunityId);await h.evidence.apply(await h.auth(),write,{...e,coverage,occurredAt:when});return e.targetId;};
 const common={opportunityId,proposalId,sourceRef:'H6002 SYNTHETIC actual direct agreement',reason:'H6002 SYNTHETIC',expectedOpportunityRevision:2};
 const prepare={...common,action:'prepare' as const,operationId:uid(),expectedRevision:0,expectedOpportunityRevision:1,content};
 const fix={...common,action:'fix' as const,operationId:uid(),expectedRevision:1,versionId};
 const issue={...common,action:'issue' as const,operationId:uid(),expectedRevision:2,versionId,coverage,at,issuance:{issuedAt:at,limits:[]},evidenceId:await proof(`offer:issue:${versionId}:${at}:7`)};
 const register={...common,action:'register' as const,operationId:uid(),expectedRevision:3,versionId,acceptanceId,coverage,at,accepterId,designationId,channel:'phone',terms,authorityEvidenceId:await proof(`acceptance:authority:${versionId}:${accepterId}:${designationId}`),evidenceId:await proof(`acceptance:agree:${versionId}:${acceptanceId}:${accepterId}:phone`)};
 const reviewEvidence:Record<string,string>={};for(const aspect of ['prices','availability','conditions','capacity'])reviewEvidence[aspect]=await proof(`offer:review:${versionId}:${acceptanceId}:accept:${aspect}`);
 const verify={...common,action:'verify' as const,operationId:uid(),expectedRevision:4,versionId,acceptanceId,coverage,at,reviewEvidence,won:true};
 const detail:BookingDetail={services:[{id:uid(),serviceRevisionId:service.revision,nature:'external',variant:null,provider:null,place:null,schedule:null,contributions:[{id:uid(),lineId,modalityId,quantity:'1',attendees:4,certainty:'estimated'}],nights:[]}],participants:[],assignments:[]};
 const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(detail)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
 const q:BookingCommand={...common,versionId,acceptanceId,coverage,terms,expectedRevision:5,expectedOpportunityRevision:3,operationId:uid(),bookingId:uid(),evidenceId:await proof(`booking:detail:${acceptanceId}:${hash}`),detail,route:'direct'};
 const stages:DirectStage[]=[{kind:'proposal',command:prepare},{kind:'proposal',command:fix},{kind:'offer',command:issue},{kind:'acceptance',command:register},{kind:'acceptance',command:verify}];
 return {opportunityId,proposalId,versionId,acceptanceId,accepterId,designationId,at,coverage,terms,content,prepare,fix,issue,register,verify,stages,q,proof};
}
