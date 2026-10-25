// H6-016 T08/T09 orchestration on full68; every context is a real application-created Booking.
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {createServer} from 'node:net';
import {once} from 'node:events';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fifthDatabase,read,write,type Fifth} from './h5-018-fifth-isolated.ts';
import {communicationFixture} from './h5-communication-isolated.ts';
import {bookingFixture} from './h2-booking-fixtures.ts';
import {boundaryFixture as originalBoundary} from './h5-boundary-isolated.ts';
import {fingerprintHumanApprovalMaterial,type HumanApprovalMaterial} from '../../src/infrastructure/postgres/h0-011-adapter.ts';
import type {WorkCommand} from '../../src/domain/persisted-work.ts';
export {secondWorkActor} from './h5-work-isolated.ts';
export {read,write};
export type H=Fifth&{port:number;label:string};
export async function capture(name:string,value:unknown){const out=process.env.H6016_T08_T09_OUTPUT;if(!out)throw new Error('H6016_CAPTURE_REQUIRED');await mkdir(out,{recursive:true});await writeFile(join(out,name+'.json'),JSON.stringify(value,null,2)+'\n');}
export async function isolatedWork(label:string):Promise<H>{const s=createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const port=(s.address()as{port:number}).port;await new Promise<void>(r=>s.close(()=>r()));const h=await fifthDatabase(label,port);await capture('runtime-'+label,{label,port,temporary:h.temporary,migrations:68,synthetic:true,ownTMPDIR:process.env.TMPDIR});return {...h,port,label};}
const bindings=new Map<string,{h:H;before:unknown}>();
async function bookingState(h:H,id:string){const b=await h.observer`select to_jsonb(x) row from crm_private.b04_bookings x where booking_id=${id}::uuid`;const services=await h.observer`select to_jsonb(x) row from crm_private.b04_services x where booking_id=${id}::uuid order by service_id`;return {booking:Array.from(b),services:Array.from(services)};}
async function actualBooking(h:H){const b=await bookingFixture(h);await h.booking.apply(await h.auth(),write,b.q);const before=await bookingState(h,b.q.bookingId);assert.equal(before.booking.length,1);assert.ok(before.services.length>0);bindings.set(b.q.bookingId,{h,before});return b.q.bookingId;}
async function bookedCommunication(h:H){const id=await actualBooking(h);return communicationFixture(h,'outgoing',id);}
export async function boundaryFixture(h:H,kind='other'){const id=await actualBooking(h);return originalBoundary(h,kind,id);}
export async function preserveBookings(h:H){const checked=[];for(const [id,b]of bindings){if(b.h!==h)continue;assert.deepEqual(await bookingState(h,id),b.before);checked.push(id);bindings.delete(id);}await capture('booking-preservation-'+uid(),{bookings:checked,originalBookingAndServiceFactsPreserved:true});}
export async function workFixture(h:H,parts=1){
 const comm=await bookedCommunication(h),executionId=uid(),definitionId=uid();
 const context={recordId:comm.recordId,...comm.context};
 const p={action:'simulated-contact',contentVersion:'synthetic-version-1',content:'Contenido sintético aprobado',recipient:{state:'value' as const,value:'synthetic-recipient'},amount:{state:'not-applicable' as const},conditions:{state:'not-applicable' as const},scope:h.scope,effect:'simulated-effect'};
 const material:HumanApprovalMaterial={...p,destination:{state:'not-applicable'},parts:Array.from({length:parts},(_,i)=>({...p,partId:'part-'+(i+1)}))};
 const approve=async(m=material)=>{const proposalId='p-'+uid(),decisionId='d-'+uid();await h.tte.propose(await h.auth(),write,proposalId,'ai',m);await h.tte.decide(await h.auth(),write,'decide-'+uid(),proposalId,decisionId,'approved','Revisión sintética',fingerprintHumanApprovalMaterial(m));return {proposalId,decisionId};};
 const approval=await approve(),worker=h.executor(),base=()=>({operationId:uid(),executionId,reason:'Prueba sintética autorizada'});
 const definition:WorkCommand={...base(),action:'define',definitionId,version:1,context,...approval,material,triggerRef:'manual-synthetic-trigger',inputsRef:'synthetic-inputs',permissionsRef:'synthetic-review',affectedRefs:[comm.recordId]};
 const run=(c:WorkCommand,w=worker)=>h.auth().then(a=>w.apply(a,write,c));
 const see=(w=worker)=>h.auth().then(a=>w.read(a,read,executionId,context));
 const claim=(seconds=30):Extract<WorkCommand,{action:'claim'}>=>({...base(),action:'claim',attemptId:uid(),leaseUntil:new Date(Date.now()+seconds*1000).toISOString()});
 const start=(c:Extract<WorkCommand,{action:'claim'}>,generation:number):WorkCommand=>({...base(),action:'start',attemptId:c.attemptId,generation,material});
 const prove=(attemptId:string,outcome:'succeeded'|'failed'='succeeded',resultRef='simulated-proof-'+uid())=>{h.observations.set(attemptId,{executionId,attemptId,outcome,resultRef,sourceKind:'simulated',verifierIdentity:'synthetic-durable-provider'});return {...base(),action:'result' as const,attemptId,outcome,resultRef};};
 return {comm,executionId,definitionId,context,material,approve,approval,definition,worker,base,run,see,claim,start,prove};
}
