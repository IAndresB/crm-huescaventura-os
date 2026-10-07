import {H4009ConfirmationAdapter}from'../../src/infrastructure/postgres/h4-confirmation-adapter.ts';
import {readFile}from'node:fs/promises';
import {isolatedPreparation,read,write}from'./h4-booking-preparation-isolated.ts';
import {H4022OperationalRealityAdapter}from'../../src/infrastructure/postgres/h4-operational-reality-adapter.ts';
export{read,write};export const realityMigration='20261006233358_h4_operational_reality.sql';
export async function isolatedReality(label='crm_h4023',port=58500,previous=false){const h=await isolatedPreparation(label,port);if(!previous)try{await h.migration.unsafe(await readFile('supabase/migrations/'+realityMigration,'utf8'));}catch(e){await h.close();throw e;}const runtime=new Proxy(h.runtime,{get(target,key){const value=Reflect.get(target,key);if(key!=='begin')return typeof value==='function'?value.bind(target):value;return async(...args:any[])=>{try{return await value.apply(target,args);}catch(e){console.log('H4-023 isolated technical SQL diagnostic',e);throw e;}};}});return{...h,confirmations:new H4009ConfirmationAdapter(runtime,h.f1,h.f2),reality:new H4022OperationalRealityAdapter(runtime,h.f1,h.f2)};}
