import {randomUUID as uid} from 'node:crypto';
import {economyBookingFixture} from './h3-own-booking-fixtures.ts';
import {isolatedOwnEconomics,read,write} from './h3-own-economics-isolated.ts';
import type {OwnEconomicsCommand,OwnComponent,OwnFact,OwnEconomicsInput,EconomicSource} from '../../src/domain/own-economics.ts';
export type {OwnEconomicsCommand,OwnEconomicsInput,EconomicSource};
export const fact=(value:string|null):OwnFact=>({input:value===null?null:{kind:'materialize',value},sourceRef:'SYNTHETIC approved fact; no fiscal validation',version:'SYNTHETIC-1',vat:'unknown',tax:null});
export function syntheticOwnInput():OwnEconomicsInput{
 const component=(id:string,value:string):OwnComponent=>({id,serviceId:'S',unitRevisionId:'U',pricingFormRevisionId:'F',rule:{id:'SYNTHETIC-'+id,version:'1',mechanism:'fixed',sourceRef:'SYNTHETIC rule fixed amount approved solely for test',approvalEvidenceId:'E-'+id},phases:{expected:fact(value),confirmed:fact(value),real:fact(value)}});
 return {fees:[component('fee','100.00')],costs:[component('cost','20.00')],tarari:[],promotion:null};
}
export function syntheticOwnSources():EconomicSource{return {booking:{id:'B',commercialPrice:'approved; independent of own economics',providerDebt:'500.00'},modalities:[{modality_id:'A',snapshot:{id:'A',name:'A',participants:10,finalPersonPrice:'150.00'}},{modality_id:'B',snapshot:{id:'B',name:'B',participants:5,finalPersonPrice:'120.00'}}],services:[{service_id:'S',nature:'internal'}],versions:[{id:'U',kind:'unit',version:'1',definition:{name:'fixed group',definition:'fixed group'}},{id:'F',kind:'pricing_form',version:'1',definition:{name:'fixed',definition:'fixed'}},{id:'P',kind:'promotion',version:'1',definition:{policy:'novio_gratis'}}]};}
export const promotion=(honoreeModalityId:string|null='A')=>({revisionId:'P',audience:'despedida' as const,objectiveEligibility:'verified_eligible' as const,packComplete:true,lodgingIncluded:true,activityIncluded:true,restaurantIncluded:true,tarariDrinksIncluded:2,honoreeModalityId});
export async function ownEconomicsFixture(h:Awaited<ReturnType<typeof isolatedOwnEconomics>>){
 const b=await economyBookingFixture(h,'total',true,'internal');await h.booking.apply(await h.auth(),write,b.q);
 const unit=await h.cat('unit',{name:'SYNTHETIC exact economic unit',definition:'fixed group'}),form=await h.cat('pricing_form',{name:'SYNTHETIC own fixed economic basis',definition:'fixed'}),promo=await h.com('promotion',{policy:'novio_gratis',minimum_attendees:'15',required_lodging:'1',required_activity:'1',required_restaurant:'1',required_tarari_drinks:'2',effect_basis:'honoree_modality_final_person_price'});
 const economyId=uid(),at=new Date().toISOString(),bookingId=b.q.bookingId;
 const proof=async(claim:string)=>{const r=h.req('evidence',{claim,coverage:economyId,certainty:'reviewed',source_kind:'manual'},economyId,'other');await h.evidence.apply(await h.auth(),write,{...r,coverage:economyId,occurredAt:at});return r.targetId;};
 const digest=async(x:unknown)=>(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(x)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash as string;
 const input=structuredClone(syntheticOwnInput());for(const c of [...input.fees,...input.costs]){Object.assign(c,{serviceId:b.detail.services[0]!.id,unitRevisionId:unit.revision,pricingFormRevisionId:form.revision});const {approvalEvidenceId,...rule}=c.rule;Object.assign(c.rule,{approvalEvidenceId:await proof('own-rule:'+await digest(rule))});}
 const see=async()=>h.ownEconomics.read(await h.auth(),read,economyId,bookingId);
 const attest=async(q:OwnEconomicsCommand)=>{const {operationId,evidenceId,...material}=q;return {...q,evidenceId:await proof('own-economics:'+await digest(material))};};
 const command=async(changes:Partial<OwnEconomicsCommand>={})=>attest({operationId:uid(),economyId,bookingId,scope:'SYNTHETIC own attributable scope',expectedRevision:(await see())?.revision??0,expectedBookingRevision:1,at,sourceRef:'SYNTHETIC exact source',reason:'SYNTHETIC materialization by authorized Administrator',evidenceId:uid(),input:structuredClone(input),...changes});
 return {b,unit,form,promo,economyId,bookingId,at,input,proof,digest,attest,command,see};
}
