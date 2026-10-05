import {readFile} from 'node:fs/promises';
import {isolatedModification,read,write} from './h4-modification-isolated.ts';
import {H3005AllocationAdapter} from '../../src/infrastructure/postgres/h3-allocation-adapter.ts';
import {H4013CancellationAdapter} from '../../src/infrastructure/postgres/h4-cancellation-adapter.ts';
export {read,write};
export const cancellationMigration='20261005223726_h4_cancellation_right.sql';
export const cancellationTables=['b06_cancellation_determinations','b06_cancellation_revisions','b06_cancellation_operations','b06_cancellation_applications'];
export async function isolatedCancellation(label='crm_h4014',port=56800,previous=false){const h=await isolatedModification(label,port,false,true);try{if(!previous)await h.migration.unsafe(await readFile('supabase/migrations/'+cancellationMigration,'utf8'));}catch(e){await h.close();throw e;}
 const diagnostic={begin:async(options:any,work:any)=>h.runtime.begin(options,async(tx:any)=>work(new Proxy(tx,{get(target,key){const v=target[key];if(key!=='unsafe')return typeof v==='function'?v.bind(target):v;return async(...args:any[])=>{try{return await v.apply(target,args);}catch(error){console.log('H4-014 SQL diagnostic',error);throw error;}};}})))} as typeof h.runtime;
 return {...h,allocations:new H3005AllocationAdapter(diagnostic,h.f1,h.f2),cancellations:new H4013CancellationAdapter(diagnostic,h.f1,h.f2)};
}
