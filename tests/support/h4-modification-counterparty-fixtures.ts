import {randomUUID as uid} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {isolatedModification,read,write} from './h4-modification-isolated.ts';
import {invoiceBookingFixture} from './h3-invoice-booking-fixtures.ts';
import {invoiceFixture} from './h3-invoice-fixtures.ts';
import {confirmationFixture} from './h4-confirmation-fixtures.ts';
import {modificationFixture} from './h4-modification-fixtures.ts';
export {read,write};
export async function counterpartyHarness(name='crm_h4012_f16',port=56620,previous=false){const h=await isolatedModification(name,port);const files=(await readdir('supabase/migrations')).filter(x=>x.endsWith('_h4_modification_counterparty.sql'));if(!previous&&process.env.H4012_F16_BEFORE!=='1'&&files.length)await h.migration.unsafe(await readFile('supabase/migrations/'+files[0],'utf8'));return h;}
type H=Awaited<ReturnType<typeof counterpartyHarness>>;
export async function counterpartyFixture(h:H,{fixed=true,variant=false}={}){
 const fallback=await invoiceFixture(h),b=await invoiceBookingFixture(h,'total',true),A=await h.cat('provider',{name:'SYNTHETIC A original counterpart'}),B=await h.cat('provider',{name:'SYNTHETIC B new counterpart'}),C=await h.cat('provider',{name:'SYNTHETIC C unrelated counterpart'}),service=b.detail.services[0]!;
 const svc={id:String((await h.observer`select item_id::text id from crm_private.catalog_revisions where revision_id=${service.serviceRevisionId}::uuid`)[0]!.id),revision:service.serviceRevisionId};
 const make=async(kind:'variant'|'offering',definition:Record<string,string>,parent:{id:string;revision:string},related?:{id:string;revision:string})=>{const id=uid(),base={operationId:uid(),targetId:id,kind,expectedVersion:0,sourceRef:'SYNTHETIC versioned relation',evidenceRef:'SYNTHETIC catalogue relationship',reason:'SYNTHETIC'};await h.catalog.apply(await h.auth(),write,{...base,action:'create_item',parentId:parent.id,relatedId:related?.id});const r=await h.catalog.apply(await h.auth(),write,{...base,operationId:uid(),action:'publish_version',parentId:parent.revision,relatedId:related?.revision,definition});return {id,revision:r.id};};
 const V1=await make('variant',{name:'SYNTHETIC V1'},svc),V2=await make('variant',{name:'SYNTHETIC V2'},svc),detail=structuredClone(b.detail);(detail.services[0] as any).provider=fixed?A.revision:null;(detail.services[0] as any).variant=variant?V1.revision:null;
 const q={...b.q,detail,evidenceId:await b.proof(detail)};await h.booking.apply(await h.auth(),write,q);
 const shared={...fallback,bookingId:q.bookingId,provider:A,b:{...b,q,detail}},f=await confirmationFixture(h,shared),scope={kind:'service',id:service.id};
 const source=async(provider=A,target=variant?V1:svc)=>({kind:'provider',id:provider.revision,offeringRevisionId:(await make('offering',{conditions:'SYNTHETIC exact supplier scope'},provider,target)).revision,counterpart:'SYNTHETIC verified responsible counterpart',channel:'phone'});
 const SA=await source(A),SB=await source(B),SC=await source(C),SV2=await source(A,V2);
 const fresh=()=>modificationFixture(h,f);
 const request=async(m:Awaited<ReturnType<typeof fresh>>,provider=A,desired:Record<string,unknown>={date:'2026-10-22'},revision=1)=>{const q=await m.request([{id:m.partId,scope,expectedScopeRevision:revision,desired,aspects:Object.keys(desired),dependencies:[]}]);return m.attest({...q,data:{...q.data,requester:{kind:'provider',id:provider.revision}}});};
 const prepare=async(m:Awaited<ReturnType<typeof fresh>>,desired:Record<string,unknown>,revision=1)=>{await m.run(await m.request([{id:m.partId,scope,expectedScopeRevision:revision,desired,aspects:Object.keys(desired),dependencies:[]}]));await m.run(await m.evaluate());await m.run(await m.approve());return m.apply();};
 const pending=async(m:Awaited<ReturnType<typeof fresh>>)=>{await m.run(await m.evaluate());await m.run(await m.command('provider',{partIds:[m.partId],commitment:'SYNTHETIC precisely identified source commitment',recordId:null}));};
 const response=async(m:Awaited<ReturnType<typeof fresh>>,src=SB,extra:Record<string,unknown>={})=>m.command('response',{partIds:[m.partId],source:src,recordId:await f.record(),happenedAt:'2026-10-03T10:00:00Z',result:'accepted',coverage:{[m.partId]:(await m.see())!.parts[0]!.desired},alternatives:[],...extra});
 const current=async()=>h.booking.read(await h.auth(),read,q.bookingId);
 return {A,B,C,V1,V2,svc,b,detail,q,f,scope,SA,SB,SC,SV2,source,fresh,request,prepare,pending,response,current};
}
