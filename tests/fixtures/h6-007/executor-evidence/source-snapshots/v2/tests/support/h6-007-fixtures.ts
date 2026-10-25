// E2E-07 synthetic orchestration; business state is written only through published adapters.
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {createServer} from 'node:net';
import {once} from 'node:events';
import {fifthDatabase,read,write,type Fifth} from './h5-018-fifth-isolated.ts';
import {jointFixture} from './h5-joint-closure-fixtures.ts';
import {secondWorkActor} from './h5-work-isolated.ts';
import {H5013ClosureAdapter} from '../../src/infrastructure/postgres/h5-closure-adapter.ts';
import {H3003PaymentAdapter} from '../../src/infrastructure/postgres/h3-payment-adapter.ts';
export {read,write};
export async function unusedPort(){const s=createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=(s.address() as {port:number}).port;await new Promise<void>(r=>s.close(()=>r()));return p;}
export async function database(label:string){return fifthDatabase(label,await unusedPort());}
export type H=Fifth;
export async function fixture(h:H,closed=true){
 const f=await jointFixture(h);const beforeClose=await f.j.c.view();const close=await f.j.command();
 if(closed)await f.j.run(close);
 return {...f,beforeClose,close};
}
export type F=Awaited<ReturnType<typeof fixture>>;
export async function businessSnapshot(h:H,pattern='^(b0[2-9]_|b10_|catalog_|commercial_|identity_)'){
 const rows=await h.observer`select tablename from pg_tables where schemaname='crm_private' and tablename ~ ${pattern} order by tablename`;
 const result:Record<string,string>={};
 for(const r of rows){assert.match(r.tablename,/^[a-z0-9_]+$/);result[r.tablename]=String((await h.observer.unsafe(`select encode(crm_crypto.digest(coalesce(string_agg(to_jsonb(x)::text,E'\n' order by to_jsonb(x)::text),''),'sha256'),'hex') h from crm_private.${r.tablename} x`))[0]!.h);}
 return result;
}
export async function denyUnchanged(h:H,run:()=>Promise<unknown>,match?:RegExp){
 const before=await businessSnapshot(h);if(match)await assert.rejects(run,match);else await assert.rejects(run);assert.deepEqual(await businessSnapshot(h),before);
}
export async function discrepancy(h:H,f:F){
 const p=(await h.payments.read(await h.auth(),read,f.payment.paymentId))!;
 const q=await f.payment.discrepancy(p.current.revision,'0.00','100.00');
 // The inherited builder captures fixture creation time; this is a NEW fact
 // after closing, so bind fresh time and a fresh evidence digest to that fact.
 return f.payment.attest({...q,at:new Date().toISOString()});
}
export async function contradict(h:H,f:F){const q=await discrepancy(h,f);const result=await h.payments.apply(await h.auth(),write,q);return {q,result};}
export async function repair(h:H,f:F,q:Awaited<ReturnType<typeof discrepancy>>){
 const p=(await h.payments.read(await h.auth(),read,f.payment.paymentId))!;
 const command=await f.payment.attest({action:'resolve',operationId:uid(),paymentId:f.payment.paymentId,expectedRevision:p.current.revision,sourceRef:'SYNTHETIC later independent bank contrast',reason:'SYNTHETIC discrepancy resolved, original retained',at:new Date().toISOString(),evidenceId:uid(),incidentId:q.incidentId,sourceEvidenceId:f.payment.sourceEvidenceId});
 return h.payments.apply(await h.auth(),write,command);
}
export async function fault(h:H,table:string,deferred=false){
 assert.match(table,/^[a-z0-9_]+$/);
 // Test-only DDL in this ephemeral database. Sequence witnesses survive rollback;
 // none of these objects is a product migration or an ordinary runtime capability.
 await h.admin.unsafe("create sequence crm_private.h6007_witness;create function crm_private.h6007_fault()returns trigger language plpgsql security definer set search_path=pg_catalog,pg_temp as $$begin perform nextval('crm_private.h6007_witness');raise exception 'H6007_CONTROLLED_FAULT';return new;end$$");
 await h.admin.unsafe(deferred?`create constraint trigger h6007_fault after insert on crm_private.${table} deferrable initially deferred for each row execute function crm_private.h6007_fault()`:`create trigger h6007_fault before insert on crm_private.${table} for each row execute function crm_private.h6007_fault()`);
 return {reached:async()=>Boolean((await h.admin`select is_called from crm_private.h6007_witness`)[0]!.is_called),clear:()=>h.admin.unsafe(`drop trigger h6007_fault on crm_private.${table};drop function crm_private.h6007_fault();drop sequence crm_private.h6007_witness`)};
}
export async function waitFor(check:()=>Promise<boolean>){const end=Date.now()+12000;while(Date.now()<end){if(await check())return;await new Promise(r=>setTimeout(r,15));}throw new Error('H6007_EXPECTED_LOCK_NOT_OBSERVED');}
export async function race(h:H,f:F,sourceFirst:boolean,other?:F){
 const session=await secondWorkActor(h),runtime=h.connect('crm_h0_runtime'),guard=h.connect('crm_h0_migration'),monitor=h.connect('crm_h0_migration');
 const closures=new H5013ClosureAdapter(runtime,h.f1,h.f2),payments=new H3003PaymentAdapter(runtime,h.f1,h.f2);
 const close=await f.j.command(),change=await discrepancy(h,f);const priorOther=other?await other.j.c.view():null;
 let release!:()=>void,entered!:()=>void;const ready=new Promise<void>(r=>entered=r),unlock=new Promise<void>(r=>release=r);
 const held=guard.begin(async tx=>{await tx`select pg_advisory_xact_lock(hashtextextended(${'booking-preparation:'+f.bookingId},0))`;entered();await unlock;});await ready;
 const count=async()=>Number((await monitor`select count(*)::int n from pg_locks where locktype='advisory' and not granted`)[0]!.n);
 const doClose=()=>session.auth().then(a=>closures.close(a,write,close));const doChange=()=>h.auth().then(a=>payments.apply(a,write,change));
 const jobs:Promise<unknown>[]=[];let locks:unknown,otherAfter:unknown,failure:unknown;
 try{
  jobs.push(sourceFirst?doChange():doClose());jobs[0]!.catch(()=>{});await waitFor(async()=>await count()>=1);
  jobs.push(sourceFirst?doClose():doChange());jobs[1]!.catch(()=>{});await waitFor(async()=>await count()>=2);
  locks=await monitor`select pid,classid,objid,granted,pg_blocking_pids(pid) blockers from pg_locks where locktype='advisory' order by pid,classid,objid`;
  if(other){await other.j.run(await other.j.command());otherAfter=await other.j.c.view();assert.equal((otherAfter as any).jointClosure.current,true);assert.equal((priorOther as any).jointClosure.current,false);}
 }catch(e){failure=e;}finally{release();await held;}
 const results=await Promise.allSettled(jobs);
 await Promise.all([runtime.end({timeout:1}),guard.end({timeout:1}),monitor.end({timeout:1})]);
 if(failure)throw failure;
 const v=await f.j.c.view();assert.equal(v.jointClosure.current,false);
 if(sourceFirst){assert.equal(results[0]!.status,'fulfilled');assert.equal(results[1]!.status,'rejected');assert.equal(v.jointClosure.history.length,0);assert.match(String((results[1] as PromiseRejectedResult).reason),/CONFLICT|PENDING/);}
 else{assert.ok(results.every(x=>x.status==='fulfilled'));assert.equal(v.jointClosure.history.length,1);assert.ok(v.invalidations.length>=1);}
 return {sourceFirst,bookingId:f.bookingId,locks,results:results.map(x=>x.status==='fulfilled'?{status:x.status}:{status:x.status,error:String(x.reason)}),otherAfter,view:v};
}
