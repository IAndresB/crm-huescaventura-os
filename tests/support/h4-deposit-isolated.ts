import {readFile} from 'node:fs/promises';
import {isolatedRefund,write,read} from './h4-refund-isolated.ts';
import {H4017DepositAdapter} from '../../src/infrastructure/postgres/h4-deposit-adapter.ts';
export {write,read};
export const depositMigration='20261006133716_h4_deposit_guarantee_custody.sql';
export const depositTables=['b05_deposits','b05_deposit_operations','b05_deposit_revisions','b05_deposit_facts'];
export async function isolatedDeposit(label='crm_h4018',port=57000,previous=false){const h=await isolatedRefund(label,port,false,true,!previous&&process.env.H4018_CURRENT48==='1');if(!previous&&process.env.H4018_CURRENT48!=='1')try{await h.migration.unsafe(await readFile('supabase/migrations/'+depositMigration,'utf8'));}catch(e){await h.close();throw e;}return {...h,deposits:new H4017DepositAdapter({begin:async(options:any,work:any)=>h.runtime.begin(options,async(tx:any)=>work(new Proxy(tx,{get(target,key){const v=target[key];if(key!=='unsafe')return typeof v==='function'?v.bind(target):v;return async(...args:any[])=>{try{return await v.apply(target,args);}catch(e){console.log('H4-018 isolated SQL diagnostic',e);throw e;}};}})))} as typeof h.runtime,h.f1,h.f2)};}
