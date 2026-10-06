import {readFile} from 'node:fs/promises';
import {isolatedCancellation,write,read} from './h4-cancellation-isolated.ts';
import {H0011PostgresAdapter} from '../../src/infrastructure/postgres/h0-011-adapter.ts';
import {H3003PaymentAdapter} from '../../src/infrastructure/postgres/h3-payment-adapter.ts';
import {H4015RefundAdapter} from '../../src/infrastructure/postgres/h4-refund-adapter.ts';
export {read,write};
export const refundMigration='20261006001131_h4_refund_partial_portions.sql';
export const refundTables=['b05_refunds','b05_refund_operations','b05_refund_revisions','b05_refund_movements'];
export async function isolatedRefund(label='crm_h4016',port=56900,previous=false){const h=await isolatedCancellation(label,port);try{if(!previous)await h.migration.unsafe(await readFile('supabase/migrations/'+refundMigration,'utf8'));}catch(e){await h.close();throw e;}
 const capture=(sql:typeof h.runtime)=>({begin:async(options:any,work:any)=>sql.begin(options,async(tx:any)=>work(new Proxy(tx,{get(target,key){const v=target[key];if(key!=='unsafe')return typeof v==='function'?v.bind(target):v;return async(...args:any[])=>{try{return await v.apply(target,args);}catch(e){console.log('H4-016 SQL diagnostic',e);throw e;}};}})))} as typeof h.runtime);
 const diagnostic=capture(h.runtime);
 return {...h,tte:new H0011PostgresAdapter(capture(h.connect('crm_h0_ha_tx')),h.f1,h.f2),payments:new H3003PaymentAdapter(diagnostic,h.f1,h.f2),refunds:new H4015RefundAdapter(diagnostic,h.f1,h.f2)};
}
