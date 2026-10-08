import {readFile} from 'node:fs/promises';
import {randomUUID as uid} from 'node:crypto';
import {isolatedCommunications,communicationFixture,read,write} from './h5-communication-isolated.ts';
import {createPersistedWorkExecutor} from '../../src/infrastructure/postgres/persisted-work-executor.ts';
import {fingerprintHumanApprovalMaterial,type HumanApprovalMaterial} from '../../src/infrastructure/postgres/h0-011-adapter.ts';
import type {WorkCommand} from '../../src/domain/persisted-work.ts';
import type {WorkResultObservation,WorkResultRequest} from '../../src/application/work-result-verification.ts';
export {read,write};
export const migration='supabase/migrations/20261008143617_h5_persisted_work_recovery.sql';
export async function isolatedWork(label:string,port:number,previous=false){
 const h=await isolatedCommunications(label,port);
 try{if(!previous)await h.migration.unsafe(await readFile(migration,'utf8'));}catch(e){await h.close();throw e;}
 const observations=new Map<string,WorkResultObservation>();let inspections=0;
 const resultVerifier={checkEffect:async(r:any)=>({...r,availability:'available' as const,priorEffect:'none' as const,sourceKind:'simulated' as const,verifierIdentity:'synthetic-durable-provider',observationRef:'synthetic-effect-check'}),inspect:async(r:WorkResultRequest)=>{inspections++;return observations.get(r.attemptId);}};
 const executors:ReturnType<typeof createPersistedWorkExecutor>[]=[];
 const executor=(executorId='synthetic-executor-a',changes:Record<string,unknown>={})=>{
 const out=createPersistedWorkExecutor({databaseUrl:`postgresql://crm_h0_ha_tx@127.0.0.1:${port}/${label}`,ssl:false,capability:h.f1,humanAuthorization:h.f2,executorId,resultVerifier,...changes});executors.push(out);return out;};
 const closeExecutors=async()=>{await Promise.allSettled(executors.splice(0).map(x=>x.close()));};
 return {...h,observations,inspections:()=>inspections,executor,closeExecutors,close:async()=>{await closeExecutors();await h.close();}};
}
export async function workFixture(h:Awaited<ReturnType<typeof isolatedWork>>,parts=1){
 const comm=await communicationFixture(h),executionId=uid(),definitionId=uid();
 const context={recordId:comm.recordId,...comm.context};
 const p={action:'simulated-contact',contentVersion:'synthetic-version-1',content:'Contenido sintético aprobado',recipient:{state:'value' as const,value:'synthetic-recipient'},amount:{state:'not-applicable' as const},conditions:{state:'not-applicable' as const},scope:h.scope,effect:'simulated-effect'};
 const material:HumanApprovalMaterial={...p,destination:{state:'not-applicable'},parts:Array.from({length:parts},(_,i)=>({...p,partId:'part-'+(i+1)}))};
 const approve=async(m=material)=>{const proposalId='p-'+uid(),decisionId='d-'+uid();await h.tte.propose(await h.auth(),write,proposalId,'ai',m);await h.tte.decide(await h.auth(),write,'decide-'+uid(),proposalId,decisionId,'approved','Revisión sintética',fingerprintHumanApprovalMaterial(m));return {proposalId,decisionId};};
 const approval=await approve(),worker=h.executor(),base=()=>({operationId:uid(),executionId,reason:'Prueba sintética autorizada'});
 const definition:WorkCommand={...base(),action:'define',definitionId,version:1,context,...approval,material,triggerRef:'manual-synthetic-trigger',inputsRef:'synthetic-inputs',permissionsRef:'synthetic-review',affectedRefs:[comm.recordId]};
 const run=(c:WorkCommand,w=worker)=>h.auth().then(a=>w.apply(a,write,c));
 const see=(w=worker)=>h.auth().then(a=>w.read(a,read,executionId,context));
 const claim=(seconds=30):WorkCommand=>({...base(),action:'claim',attemptId:uid(),leaseUntil:new Date(Date.now()+seconds*1000).toISOString()});
 const start=(c:Extract<WorkCommand,{action:'claim'}>,generation:number):WorkCommand=>({...base(),action:'start',attemptId:c.attemptId,generation,material});
 const prove=(attemptId:string,outcome:'succeeded'|'failed'='succeeded',resultRef='simulated-proof-'+uid())=>{h.observations.set(attemptId,{executionId,attemptId,outcome,resultRef,sourceKind:'simulated',verifierIdentity:'synthetic-durable-provider'});return {...base(),action:'result' as const,attemptId,outcome,resultRef};};
 return {comm,executionId,definitionId,context,material,approve,approval,definition,worker,base,run,see,claim,start,prove};
}
export async function secondWorkActor(h:Awaited<ReturnType<typeof isolatedWork>>){
 const {verifyAuth}=await import('../../src/application/verified-auth.ts');const {H0005PostgresAdapter}=await import('../../src/infrastructure/postgres/h0-005-adapter.ts');
 const subject=h.subject,actorId=h.actorId;
 const runtime=h.connect('crm_h0_runtime'),access=new H0005PostgresAdapter(runtime,h.f1,h.f2);const first=await verifyAuth({verify:async()=>({subject,passwordVerified:true,mfaVerified:true})},uid());
 const sessionId=(await access.establish(first)).sessionId;await runtime.end({timeout:1});
 return {actorId,sessionId,auth:()=>verifyAuth({verify:async()=>({subject,sessionId,passwordVerified:true,mfaVerified:true})},uid())};
}
