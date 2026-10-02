import {randomUUID as uid} from 'node:crypto';
import {write} from './h2-acceptance-isolated.ts';
import type {isolatedAcceptance} from './h2-acceptance-isolated.ts';
import type {AcceptanceCommand} from '../../src/infrastructure/postgres/h2-acceptance-adapter.ts';
type H=Awaited<ReturnType<typeof isolatedAcceptance>>;
const now=()=>new Date(Date.now()).toISOString();
export async function h3AcceptanceFixture(h:H,short=false,selectableLine=false,amount="1000.01",dates=["2026-10-20","2026-10-22"]){
 const service=await h.cat('service',{name:'H2 SYNTHETIC service',nature:'external'}),unit=await h.cat('unit',{name:'SYNTHETIC group',definition:'fixed group'}),form=await h.cat('pricing_form',{name:'SYNTHETIC fixed',definition:'fixed'});
 const tariff=await h.com('tariff',{label:'synthetic',price_state:'confirmed',amount:'900.00',cost_state:'confirmed',cost_amount:'700.00',vat_treatment:'included',unit_revision_id:unit.revision,pricing_form_revision_id:form.revision},service);
 const opp=h.input();await h.adapter.apply(await h.auth(),write,opp);
 const mid=uid(),line=uid(),other=uid(),content={scope:'H2 exact synthetic scope',terms:{version:'H2-T1',text:'Existing synthetic conditions; no mandate',sourceRef:'synthetic retained terms'},pending:[],modalities:[mid,other].map((id,i)=>({id,name:i?'B':'A',participants:1,independent:true,selectable:true,conditions:'synthetic exact',finalPersonPrice:amount,manualReason:'human synthetic',definitive:true,lines:[{id:i?uid():line,serviceRevisionId:service.revision,unitRevisionId:unit.revision,tariffRevisionId:tariff.revision,quantity:'1',included:true,independent:selectableLine,selectable:selectableLine,date:dates[i]!,datePending:false,priceBasis:'fixed' as const,costMaterial:true,sourceRef:'synthetic quantity'}]}))};
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

import {type isolatedObligation} from './h3-obligation-isolated.ts';
import {civilReference,localDate,zoneEvidence} from '../../src/domain/civil-time.ts';
import type {ObligationCommand} from '../../src/infrastructure/postgres/h3-obligation-adapter.ts';
import type {BookingCommand} from '../../src/infrastructure/postgres/h2-booking-adapter.ts';
import type {BookingDetail} from '../../src/domain/booking-conversion.ts';
export async function obligationFixture(h:Awaited<ReturnType<typeof isolatedObligation>>,amount='1000.01',at='2026-10-12T10:00:00Z',dates=['2026-10-20','2026-10-22'],full=false) {
 const f=await h3AcceptanceFixture(h,false,true,amount,dates),r=await f.register(full?f.content.scope:f.mid),vq=await f.verification(r);
 await h.acceptance.apply(await h.auth(),write,vq);
 const l=f.content.modalities[0]!.lines[0]!;
 const detail:BookingDetail={services:[{id:uid(),serviceRevisionId:l.serviceRevisionId,nature:'external',variant:null,provider:null,place:null,schedule:null,contributions:f.content.modalities.filter(m=>full||m.id===f.mid).map(m=>({id:uid(),lineId:m.lines[0]!.id,modalityId:m.id,quantity:m.lines[0]!.quantity,attendees:1,certainty:'estimated'})),nights:[]}],participants:[],assignments:[]};
 const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(detail)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
 const b:BookingCommand={operationId:uid(),bookingId:uid(),opportunityId:f.opp.targetId,acceptanceId:r.acceptanceId,proposalId:f.proposalId,versionId:f.versionId,coverage:r.coverage,terms:f.content.terms,...await f.revisions(),sourceRef:'SYNTHETIC H3 source',reason:'SYNTHETIC Booking',evidenceId:await f.proof(`booking:detail:${r.acceptanceId}:${hash}`,r.coverage,now()),detail,route:'normal'};
 await h.booking.apply(await h.auth(),write,b);
 const attest=async(q:ObligationCommand):Promise<ObligationCommand>=>{
  const value=Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId','computed'].includes(k)&&v!==undefined));
  const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(value)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
  return {...q,evidenceId:await f.proof(`obligation:${q.action}:${hash}`,r.coverage,q.at)};
 };
 const policyId=uid(),policy={id:policyId,version:1,rule:'ordinary_50_50' as const};
 const publish:ObligationCommand=await attest({action:'publish_policy',operationId:uid(),bookingId:b.bookingId,policyId,expectedRevision:0,policyVersion:1,selectors:{},sourceRef:'SYNTHETIC approved BR-PAY002',reason:'SYNTHETIC policy version',at,evidenceId:uid()});
 await h.obligations.apply(await h.auth(),write,publish);
 const q:ObligationCommand={action:'determine',operationId:uid(),bookingId:b.bookingId,policyId,scheduleId:uid(),scope:'global',scopeId:b.bookingId,policy,expectedRevision:0,sourceRef:'SYNTHETIC determination',reason:'SYNTHETIC Administrator decision',at,evidenceId:uid(),definition:{base:{amount:full?moneyDifference(amount,'-'+amount):amount,sourceRef:f.versionId,version:'1'},reference:civilReference({scope:'global',scopeId:b.bookingId},localDate(dates[0]!),zoneEvidence('Europe/Madrid','SYNTHETIC contractual zone','1'),f.versionId,'1'),at}};
 return {f,b,detail,publish,q:await attest(q),attest};
}

import {moneyDifference} from '../../src/domain/exact-money.ts';
