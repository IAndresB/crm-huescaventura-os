// Synthetic setup through approved application contracts, no normative oracle.
import {randomUUID as uid} from 'node:crypto';
import {isolatedWork,read,write} from './h6-current-isolated.ts';
import {quantityFixture,nominalFixture} from './h2-quantities-fixtures.ts';
import {invoiceFixture} from './h3-invoice-fixtures.ts';
import {confirmationFixture} from './h4-confirmation-fixtures.ts';
import {modificationFixture} from './h4-modification-fixtures.ts';
export {isolatedWork,read,write,modificationFixture};
export type H=Awaited<ReturnType<typeof isolatedWork>>;
export async function integratedFixture(h:H,convert=true){
 const base=await invoiceFixture(h),quantities=await quantityFixture(h),q=await nominalFixture(h,quantities);
 if(convert)await h.booking.apply(await h.auth(),write,q);
 const shared={...base,bookingId:q.bookingId,b:{...base.b,q,detail:q.detail}};
 const confirm=async(index=0)=>confirmationFixture(h,shared,index);
 const current=async()=>h.booking.read(await h.auth(),read,q.bookingId) as Promise<any>;
 const change=async(index=0)=>modificationFixture(h,await confirm(index));
 return {q,quantities,shared,confirm,current,change};
}
export async function ratify(h:H,m:Awaited<ReturnType<typeof modificationFixture>>,aspects:string[]){const p=(await m.see())!.parts.find(p=>p.id===m.partId)!,validUntil='2030-01-01T00:00:00Z',hash=await m.f.hash({part:Object.fromEntries(Object.entries(p).filter(([k])=>k!=='review')),aspects,validUntil});return m.command('ratify',{partIds:[m.partId],aspects,validUntil,proofId:await m.f.proof('modification:ratify:'+hash,m.bookingId),result:'H6003 SYNTHETIC exact listed aspects only'});}
export async function exactChange(h:H,x:Awaited<ReturnType<typeof integratedFixture>>,scope:Record<string,unknown>,desired:Record<string,unknown>,aspects:string[],revision=1){const m=await x.change();await m.run(await m.request([{id:m.partId,scope,expectedScopeRevision:revision,desired,aspects,dependencies:[]}]));await m.run(await m.evaluate());await m.run(await m.approve());return m;}
export const operation=()=>uid();
