import {readFile} from 'node:fs/promises';
import {isolatedObligation,write,read} from './h3-obligation-isolated.ts';
import {H3003PaymentAdapter} from '../../src/infrastructure/postgres/h3-payment-adapter.ts';
export {write,read};
export const paymentMigration='20261003093202_h3_customer_payment_reconciliation.sql';
export async function isolatedPayment(label:string,port:number,upgrade=false){
 const h=await isolatedObligation(label,port);
 try {if(!upgrade)await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${paymentMigration}`,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}
 return {...h,payments:new H3003PaymentAdapter(h.runtime,h.f1,h.f2)};
}
