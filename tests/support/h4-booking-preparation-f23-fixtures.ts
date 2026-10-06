import {randomUUID as uid}from'node:crypto';
import assert from'node:assert/strict';
import {modificationFixture}from'./h4-modification-fixtures.ts';
import {type H,preparationFixture}from'./h4-booking-preparation-fixtures.ts';
import {read}from'./h4-booking-preparation-isolated.ts';
export type F=Awaited<ReturnType<typeof preparationFixture>>;
export async function cancelFixture(h:H,f:Pick<F,'bid'|'conf'> & {o:Pick<F['o'],'detail'>},partial=false){
 const m=await modificationFixture(h,f.conf),services=partial?[f.o.detail.services[1]!]:f.o.detail.services;
 const parts=services.map(s=>({id:uid(),scope:{kind:'service',id:s.id},expectedScopeRevision:1,desired:{cancelled:true},aspects:['cancellation'],dependencies:[]}));
 const book={id:uid(),scope:{kind:'booking',id:f.bid},expectedScopeRevision:1,desired:{cancelled:true},aspects:['cancellation'],dependencies:[]};
 await m.run(await m.request(partial?parts:[...parts,book]));await m.run(await m.evaluate());await m.run(await m.approve(partial?parts.map(p=>p.id):[...parts.map(p=>p.id),book.id]));
 const applied=async()=>{const v=await h.booking.read(await h.auth(),read,f.bid)as any,mod=await m.see();assert.equal(mod!.progress,'Aplicada');assert.equal(v.booking.state==='Cancelada',!partial);assert.ok(v.booking.detail.services.filter((s:any)=>services.some(x=>x.id===s.id)).every((s:any)=>s.cancelled===true));const a=await h.modifications.assess(await h.auth(),read,m.modificationId,f.bid);assert.equal(a!.bookingCancelled,!partial);assert.equal(a!.refundExecuted,false);return {booking:v,modification:mod,assessment:a};};
 const applyAll=async()=>{const result=await m.run(await m.apply(partial?parts.map(p=>p.id):[...parts.map(p=>p.id),book.id]));return result;};
 const applySequential=async()=>{if(!partial){await assert.rejects(m.run(await m.apply([book.id])),/BOOKING_CANCELLATION/);console.log('F23 UPSTREAM Booking-before-services rejected as contract requires');}await m.run(await m.apply(parts.map(p=>p.id)));if(!partial)await m.run(await m.apply([book.id]));return applied();};
 return {m,parts,book,applyAll,applySequential,applied,command:async()=>m.apply(partial?parts.map(p=>p.id):[...parts.map(p=>p.id),book.id])};
}
export const businessTables=['b04_preparation_operations','b04_preparation_evaluations','b04_preparation_approvals','b07_pending_tasks','b07_operations','b07_history','b04_operational_versions','b06_modifications','b06_modification_operations','b06_modification_revisions'];
export async function businessSnapshot(h:H){return Object.fromEntries(await Promise.all(businessTables.map(async name=>[name,(await h.observer.unsafe(`select to_jsonb(x)::text v from crm_private.${name} x order by to_jsonb(x)::text`)).map(x=>x.v)])));}
export async function observed<T>(label:string,action:()=>Promise<T>){try{const value=await action();console.log('F23 ORDINARY RESULT',label,JSON.stringify(value));return {ok:true as const,value};}catch(e){console.log('F23 ORDINARY REJECTION',label,String(e));return {ok:false as const,error:String(e)};}}
