import {readFile} from 'node:fs/promises';
import {isolatedSuplido,write,read} from './h3-suplido-isolated.ts';
import {H3011ProviderPaymentAdapter} from '../../src/infrastructure/postgres/h3-provider-payment-adapter.ts';
import {H0011PostgresAdapter} from '../../src/infrastructure/postgres/h0-011-adapter.ts';
export {write,read};
export const providerPaymentMigration='20261004185628_h3_provider_payment_accredited_outgoing.sql';
export async function isolatedProviderPayment(label:string,port:number,upgrade=false){
 const h=await isolatedSuplido(label,port);
 try{if(!upgrade)await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${providerPaymentMigration}`,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}
 const f1={...h.f1,allowedPurposes:[...h.f1.allowedPurposes,'h0-011-human-approval','h0-011-human-unit','h0-011-evidence-revalidation']};
 try{await h.migration`update crm_f1.keys set purposes=${f1.allowedPurposes} where key_id=${f1.keyId}`;}catch(e){await h.close();throw e;}
 return {...h,f1,providerPayments:new H3011ProviderPaymentAdapter(h.runtime,f1,h.f2),tte:new H0011PostgresAdapter(h.connect('crm_h0_ha_tx'),f1,h.f2)};
}
