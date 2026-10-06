import {readFile} from 'node:fs/promises';
import {isolatedDeposit,read,write} from './h4-deposit-isolated.ts';
import {H4020BookingPreparationAdapter} from '../../src/infrastructure/postgres/h4-booking-preparation-adapter.ts';
export {read,write};
export const preparationF23Migration='20261006225826_h4_booking_preparation_cancelled_origin.sql';
export const preparationMigration='20261006175137_h4_booking_preparation_confirmation.sql';
export async function isolatedPreparation(label='crm_h4021',port=58200,previous=false,f23=true){
 const h=await isolatedDeposit(label,port);try{
  await h.migration.unsafe(await readFile('supabase/migrations/20261006152658_h4_joint_funds_compatible_actor_admission.sql','utf8'));
  if(!previous)await h.migration.unsafe(await readFile('supabase/migrations/'+preparationMigration,'utf8'));
  if(!previous&&f23)await h.migration.unsafe(await readFile('supabase/migrations/'+preparationF23Migration,'utf8'));
 }catch(e){await h.close();throw e;}
 return {...h,preparation:new H4020BookingPreparationAdapter({begin:async(options:any,work:any)=>h.runtime.begin(options,async(tx:any)=>work(new Proxy(tx,{get(target,key){const v=target[key];if(key!=='unsafe')return typeof v==='function'?v.bind(target):v;return async(...args:any[])=>{try{return await v.apply(target,args);}catch(e){console.log('H4-021 isolated SQL diagnostic',e);throw e;}};}})))}as typeof h.runtime,h.f1,h.f2)};
}
