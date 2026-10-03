import {readFile} from 'node:fs/promises';
import {isolatedPayment,write,read} from './h3-payment-isolated.ts';
import {H3005AllocationAdapter} from '../../src/infrastructure/postgres/h3-allocation-adapter.ts';
export {write,read};
export const allocationMigration='20261003110048_h3_payment_allocation_funds.sql';
export async function isolatedAllocation(label:string,port:number,upgrade=false){
 const h=await isolatedPayment(label,port);
 try{if(!upgrade)await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${allocationMigration}`,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}
 return {...h,allocations:new H3005AllocationAdapter(h.runtime,h.f1,h.f2)};
}
