// PLAN-T07 supplement: published provider-payment contracts on full68, synthetic and isolated.
import {before,after,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {createServer} from 'node:net';
import {once} from 'node:events';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fifthDatabase,read,write} from '../support/h5-018-fifth-isolated.ts';
import {secondWorkActor} from '../support/h5-work-isolated.ts';
import {providerPaymentFixture,type ProviderPaymentCommand} from '../support/h3-provider-payment-fixtures.ts';
import {H3011ProviderPaymentAdapter} from '../../src/infrastructure/postgres/h3-provider-payment-adapter.ts';

let h:Awaited<ReturnType<typeof fifthDatabase>>;
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function capture(name:string,data:unknown){const path=process.env.H6016_T07_OUTPUT;if(!path)throw new Error('H6016_T07_OUTPUT_REQUIRED');await mkdir(path,{recursive:true});await writeFile(join(path,name+'.json'),JSON.stringify(data,null,2)+'\n');}
before(async()=>{const server=createServer();server.listen(0,'127.0.0.1');await once(server,'listening');const port=(server.address()as{port:number}).port;await new Promise<void>(r=>server.close(()=>r()));const label='h6016_provider_author_'+process.pid;h=await fifthDatabase(label,port);await capture('runtime',{label,port,temporary:h.temporary,migrations:68,synthetic:true,ownTMPDIR:process.env.TMPDIR});});
after(async()=>{await h?.close();});
const protectedBookings:{id:string;before:unknown}[]=[];
async function bookingState(id:string){return {booking:Array.from(await h.observer`select to_jsonb(x) value from crm_private.b04_bookings x where booking_id=${id}::uuid`),services:Array.from(await h.observer`select to_jsonb(x) value from crm_private.b04_services x where booking_id=${id}::uuid order by service_id`)};}
afterEach(async()=>{for(const item of protectedBookings.splice(0)){assert.deepEqual(await bookingState(item.id),item.before);await capture('booking-preserved-'+item.id,{bookingId:item.id,originalBookingAndServicesExact:true});}await h?.closeExecutors();});
async function apply(q:ProviderPaymentCommand,adapter=h.providerPayments){return adapter.apply(await h.auth(),write,q);}
async function funded(approved=true){const f=await providerPaymentFixture(h,'100.00','100.00');await apply(await f.open());const allocation=await f.assign('100.00');protectedBookings.push({id:f.su.bookingId,before:await bookingState(f.su.bookingId)});let reservation:string|undefined;if(approved){const approval=await f.approval(await f.schedule([await f.portion(allocation)],'100.00'));await approval.execute();reservation=approval.reserve;}return {f,allocation,reservation};}
const atomicTables=['b05_provider_payments','b05_provider_payment_operations','b05_provider_payment_revisions','b05_provider_outgoing_movements','b05_provider_outgoing_correspondences','b05_provider_payment_corrections','b05_allocation_acts','b05_fund_operations','b05_fund_revisions','b05_fund_history','b05_coverage_evaluations','b05_suplido_revisions','b05_suplido_operations','b07_pending_tasks'];
async function snapshot(){const data:Record<string,unknown>={};for(const table of atomicTables)data[table]=Array.from(await h.observer.unsafe(`select to_jsonb(x) value from crm_private.${table} x order by to_jsonb(x)::text`));return data;}
async function overlap(key:string,commands:ProviderPaymentCommand[]){
 const secondConnection=h.connect('crm_h0_runtime'),guard=h.connect('h2_bootstrap'),monitor=h.connect('h2_bootstrap'),actor=await secondWorkActor(h);
 const actors=[await h.auth(),await actor.auth()],adapters=[h.providerPayments,new H3011ProviderPaymentAdapter(secondConnection,h.f1,h.f2)];
 let release!:()=>void,entered!:()=>void;const ready=new Promise<void>(r=>entered=r),unlock=new Promise<void>(r=>release=r);
 const holder=guard.begin(async tx=>{await tx`select pg_advisory_xact_lock(hashtextextended(${key},0))`;entered();await unlock;});await ready;
 const pending:Promise<unknown>[]=[];let locks:any[]=[];let failure:unknown;
 const wait=async(n:number)=>{for(let i=0;i<200;i++){const rows=await monitor`select pid,wait_event_type,wait_event,pg_blocking_pids(pid) blockers from pg_stat_activity where datname=current_database() and usename='crm_h0_runtime' and wait_event_type='Lock' and query like '%provider_payment_apply%'`;if(rows.length>=n)return Array.from(rows);await sleep(15);}throw new Error('H6016_PROVIDER_REAL_OVERLAP_MISSING');};
 try{pending.push(adapters[0]!.apply(actors[0]!,write,commands[0]!));pending[0]!.catch(()=>{});await wait(1);pending.push(adapters[1]!.apply(actors[1]!,write,commands[1]!));pending[1]!.catch(()=>{});locks=await wait(2);}catch(e){failure=e;}finally{release();await holder;}
 const results=await Promise.allSettled(pending);await Promise.all([secondConnection.end({timeout:1}),guard.end({timeout:1}),monitor.end({timeout:1})]);if(failure)throw failure;
 assert.equal(locks.length,2);assert.notEqual(locks[0].pid,locks[1].pid);assert.notEqual(actors[0]!.sessionId,actors[1]!.sessionId);
 return {locks,results,distinctSessions:true};
}

for(const conflict of [false,true])for(const order of [0,1])test(`H6016 T07 provider common movement ${conflict?'conflict':'duplicate'} order ${order}`,async()=>{
 const {f,allocation,reservation}=await funded(),first=await f.movement([await f.portion(allocation,'80.00')],'80.00');
 const second=await f.attest({...first,operationId:uid(),...(conflict?{movement:{...first.movement!,reference:'SYNTHETIC independently contested reference'}}:{})});
 const commands=order?[second,first]:[first,second],identity=first.movement!.identity;
 assert.equal((await h.observer`select count(*)::int n from crm_private.b05_provider_outgoing_movements where identity_source=${identity.source} and external_id=${identity.externalId}`)[0]!.n,0);
 const before=(await f.view())!,suBefore=(await f.su.see())!;
 const raced=await overlap('provider-movement:'+identity.source+':'+identity.externalId,commands);
 assert.equal(raced.results[0]!.status,'fulfilled');const firstResult=(raced.results[0]as PromiseFulfilledResult<any>).value;assert.equal(firstResult.replayed,false);
 if(conflict){assert.equal(raced.results[1]!.status,'rejected');assert.equal((raced.results[1]as PromiseRejectedResult).reason.message,'PROVIDER_PAYMENT_MOVEMENT_CONFLICT:E2');}
 else{assert.equal(raced.results[1]!.status,'fulfilled');assert.equal((raced.results[1]as PromiseFulfilledResult<any>).value.replayed,true);}
 const view=(await f.view())!,funds=await f.su.funds.see(),movements=await h.observer`select to_jsonb(x) value from crm_private.b05_provider_outgoing_movements x where identity_source=${identity.source} and external_id=${identity.externalId}`;
 assert.equal(movements.length,1);assert.equal(view.movements.length,1);assert.deepEqual(view.movements[0]!.material,commands[0]!.movement);assert.equal(view.movements[0]!.approvalReservation,reservation);assert.equal(view.movements[0]!.actualEffectPrecedesRegistration,true);assert.equal(view.movements[0]!.externalExecutionAuthorizedByCRM,false);
 assert.equal(view.paid,'80.00');assert.equal(view.remaining,'20.00');assert.equal(view.history.length,before.history.length+1);assert.equal((await f.su.see())!.history.length,suBefore.history.length+1);assert.equal(funds.summary.consumed,'80.00');assert.equal((funds.summary.byPurpose as any).managed_client_funds.availableForPurpose,'20.00');
 assert.equal((await h.observer`select count(*)::int n from crm_private.b05_provider_outgoing_correspondences where movement_id=${view.movements[0]!.id as string}::uuid`)[0]!.n,1);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b05_allocation_acts where payment_id=${f.su.funds.paymentId}::uuid and kind='consume'`)[0]!.n,1);
 const after=await f.view(),afterFunds=await f.su.funds.see();assert.equal((await apply(commands[0]!)).replayed,true);assert.deepEqual(await f.view(),after);assert.deepEqual(await f.su.funds.see(),afterFunds);
 await capture('race-'+conflict+'-'+order,{conflict,order,bookingId:f.su.bookingId,initialMovementCount:0,locks:raced.locks,distinctSessions:raced.distinctSessions,results:raced.results.map(x=>x.status==='fulfilled'?{status:x.status,value:x.value}:{status:x.status,message:x.reason.message}),view,funds,movements:Array.from(movements),historyIncrement:1,consumptionCount:1,noExternalExecution:true});
});

test('H6016 T07 provider direct schedule cannot bypass TTE or manufacture paid state',async()=>{
 const {f,allocation}=await funded(false),q=await f.schedule([await f.portion(allocation)],'100.00'),before=await snapshot();
 await assert.rejects(apply(q),{message:'PROVIDER_PAYMENT_TTE_REQUIRED'});assert.deepEqual(await snapshot(),before);assert.equal((await f.view())!.paid,'0.00');assert.equal((await f.su.funds.see()).summary.consumed,'0.00');await capture('guard-tte',{message:'PROVIDER_PAYMENT_TTE_REQUIRED',tablesPreserved:atomicTables});
});

test('H6016 T07 provider movement without independent correspondence source is denied atomically',async()=>{
 const {f,allocation}=await funded(),valid=await f.movement([await f.portion(allocation,'80.00')],'80.00'),q=await f.attest({...valid,movement:{...valid.movement!,correspondenceSourceRef:''}}),before=await snapshot();
 await assert.rejects(apply(q),{message:'PROVIDER_PAYMENT_MOVEMENT_REQUIRED'});assert.deepEqual(await snapshot(),before);await capture('guard-material',{message:'PROVIDER_PAYMENT_MOVEMENT_REQUIRED',tablesPreserved:atomicTables});
});

test('H6016 T07 provider stale common fund revision requires reevaluation without side effects',async()=>{
 const {f,allocation}=await funded(),part=await f.portion(allocation,'80.00');assert.ok(part.fundRevision>0);const q=await f.movement([{...part,fundRevision:part.fundRevision-1}],'80.00'),before=await snapshot();
 await assert.rejects(apply(q),{message:'PROVIDER_PAYMENT_FUNDS_REVISION_CONFLICT:E2'});assert.deepEqual(await snapshot(),before);await capture('guard-funds',{message:'PROVIDER_PAYMENT_FUNDS_REVISION_CONFLICT:E2',tablesPreserved:atomicTables});
});

test('H6016 T07 unapproved fact opens review and cannot acquire retroactive approval',async()=>{
 const {f,allocation}=await funded(false),q=await f.movement([await f.portion(allocation,'80.00')],'80.00');await apply(q);const state=(await f.view())!;
 assert.equal(state.paid,'80.00');assert.equal(state.status,'Incidencia');assert.equal(state.movements[0]!.approvalReservation,null);assert.equal(state.movements[0]!.actualEffectPrecedesRegistration,true);assert.equal(state.movements[0]!.externalExecutionAuthorizedByCRM,false);assert.ok(state.incidents.some(x=>x.kind==='unapproved_real'));
 const legitimate=await f.command('resolve',{incidentId:state.incidents.find(x=>x.kind==='unapproved_real')!.id as string,previousEffectCheck:'occurred_verified'}),retro=await f.attest({...legitimate,approvalReservation:'SYNTHETIC retroactive forbidden'}as any),before=await snapshot();
 await assert.rejects(apply(retro),{message:'PROVIDER_PAYMENT_INPUT_INVALID'});assert.deepEqual(await snapshot(),before);assert.equal((await f.view())!.movements[0]!.approvalReservation,null);await capture('unapproved-no-retro',{state,retroactiveRejected:'PROVIDER_PAYMENT_INPUT_INVALID',tablesPreserved:atomicTables,noExternalExecution:true});
});

test('H6016 T07 late supplier revision failure rolls movement funds history result and Suplido together',async()=>{
 const {f,allocation}=await funded(),q=await f.movement([await f.portion(allocation,'80.00')],'80.00'),before=await snapshot();
 await h.admin.unsafe("create sequence crm_private.h6016_pp_fault_witness;create function crm_private.h6016_pp_fault() returns trigger language plpgsql security definer set search_path=pg_catalog,pg_temp as $$begin perform nextval('crm_private.h6016_pp_fault_witness');raise exception 'PROVIDER_PAYMENT_INJECTED_FAILURE';end$$;create trigger h6016_pp_fault before insert on crm_private.b05_provider_payment_revisions for each row execute function crm_private.h6016_pp_fault()");
 try{await assert.rejects(apply(q),{message:'PROVIDER_PAYMENT_INJECTED_FAILURE'});assert.equal((await h.admin`select is_called from crm_private.h6016_pp_fault_witness`)[0]!.is_called,true);}finally{await h.admin.unsafe('drop trigger h6016_pp_fault on crm_private.b05_provider_payment_revisions;drop function crm_private.h6016_pp_fault();drop sequence crm_private.h6016_pp_fault_witness');}
 assert.deepEqual(await snapshot(),before);assert.equal((await apply(q)).replayed,false);assert.equal((await f.view())!.movements.length,1);assert.equal((await f.view())!.paid,'80.00');assert.equal((await f.su.funds.see()).summary.consumed,'80.00');await capture('rollback-late',{injectedMessage:'PROVIDER_PAYMENT_INJECTED_FAILURE',faultReached:true,tablesPreserved:atomicTables,retrySameIdentity:'PASS',movementCount:1,consumed:'80.00'});
});
