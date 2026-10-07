import {readFile} from 'node:fs/promises';
import {randomUUID as uid} from 'node:crypto';
import {isolatedReality,read,write} from './h4-reality-isolated.ts';
import {H5003AlertAdapter} from '../../src/infrastructure/postgres/h5-alert-adapter.ts';
import type {AlertCommand,AlertMaterial} from '../../src/domain/internal-alert.ts';
export {read,write};
export const migration='supabase/migrations/20261007193441_h5_alert_notifications.sql';
export async function isolatedAlerts(label:string,port:number,previous=false){
 const h=await isolatedReality(label,port);
 try{await h.migration.unsafe(await readFile('supabase/migrations/20261007180001_h5_task_lifecycle.sql','utf8'));
 if(!previous)await h.migration.unsafe(await readFile(migration,'utf8'));}catch(e){await h.close();throw e;}
 return {...h,alerts:new H5003AlertAdapter({begin:async(options:any,work:any)=>h.runtime.begin(options,async(tx:any)=>work(new Proxy(tx,{get(target,key){const v=target[key];if(key!=="unsafe")return typeof v==="function"?v.bind(target):v;return async(...args:any[])=>{try{return await v.apply(target,args);}catch(e:any){console.log("H5004 SQL diagnostic",{code:e.code,message:e.message,where:e.where});throw e;}};}})))} as typeof h.runtime,h.f1,h.f2)};
}
export const automation=():NonNullable<AlertMaterial['automation']>=>({definitionRef:'synthetic-definition',executionRef:uid(),
 version:'1',triggerRef:'synthetic-trigger',inputsRef:'synthetic-inputs',permissionsRef:'synthetic-permissions',
 effectsRef:'synthetic-effects',recordsRef:'synthetic-records',retryLimit:null,pauseSeconds:null,missingParameters:[]});
export const alert=(urgency:AlertMaterial['urgency']='important',auto:AlertMaterial['automation']=null):Extract<AlertCommand,{action:'receive'}>=>({
 action:'receive',operationId:uid(),alertId:uid(),identity:{sourceRef:'synthetic-source',causeId:uid(),contextKind:'booking',
 contextId:uid(),scopeRef:uid(),effect:'review-cause'},material:{cause:'Fallo sintético',risk:'Revisión pendiente del expediente',
 requiredAction:'Revisar causa y pruebas',urgency,sourceVersion:'1',automation:auto},reason:'Registro sintético autorizado'});
export const attempt=(p:ReturnType<typeof alert>,revision=1,outcome:'failed'|'uncertain'|'simulated_delivered'='failed'):Extract<AlertCommand,{action:'record_synthetic_result'}>=>({
 action:'record_synthetic_result',operationId:uid(),alertId:p.alertId,expectedRevision:revision,attemptId:uid(),outcome,
 resultRef:'synthetic-result',version:'1',reason:'Doble local sin red',reviewRef:null});
