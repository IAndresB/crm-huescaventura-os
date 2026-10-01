import {randomUUID as uid} from 'node:crypto';
import {acceptanceFixture,now} from './h2-acceptance-fixtures.ts';
import {write,type isolatedBooking} from './h2-booking-isolated.ts';
import type {BookingCommand} from '../../src/infrastructure/postgres/h2-booking-adapter.ts';
import type {BookingDetail} from '../../src/domain/booking-conversion.ts';
type H=Awaited<ReturnType<typeof isolatedBooking>>;
export async function bookingFixture(h:H,coverage:'total'|'modality'|'line'='total',verify=true){
 const f=await acceptanceFixture(h,false,true),r=await f.register(coverage==='total'?f.content.scope:coverage==='modality'?f.mid:f.line),vq=await f.verification(r);
 if(verify)await h.acceptance.apply(await h.auth(),write,vq);
 const selected=f.content.modalities.flatMap(m=>m.lines.filter(l=>l.included&&(coverage==='total'||coverage==='modality'&&m.id===f.mid||coverage==='line'&&l.id===f.line)).map(l=>({m,l})));
 const detail:BookingDetail={services:selected.map(({m,l})=>({id:uid(),serviceRevisionId:l.serviceRevisionId,nature:'external',variant:null,provider:null,place:null,schedule:null,contributions:[{id:uid(),lineId:l.id,modalityId:m.id,quantity:l.quantity,attendees:m.participants,certainty:'estimated'}],nights:[]})),participants:[],assignments:[]};
 const proof=async(d:BookingDetail)=>{const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(d)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;return f.proof(`booking:detail:${r.acceptanceId}:${hash}`,r.coverage,now());};
 const q:BookingCommand={operationId:uid(),bookingId:uid(),opportunityId:f.opp.targetId,acceptanceId:r.acceptanceId,proposalId:f.proposalId,versionId:f.versionId,coverage:r.coverage,terms:f.content.terms,...await f.revisions(),sourceRef:'H2009 SYNTHETIC booking origin',reason:'SYNTHETIC conversion',evidenceId:await proof(detail),detail,route:'normal'};
 return {f,r,vq,q,detail,proof};
}
