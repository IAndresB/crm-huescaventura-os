import {readFile} from 'node:fs/promises';
import {isolatedProviderPayment,read,write} from './h3-provider-payment-isolated.ts';
import {H3013OwnEconomicsAdapter} from '../../src/infrastructure/postgres/h3-own-economics-adapter.ts';
export {read,write};
export const ownEconomicsMigration='20261004201022_h3_own_economics_fee_cost_promotion_tarari.sql';
export async function isolatedOwnEconomics(label:string,port:number,upgrade=false){
 const h=await isolatedProviderPayment(label,port);try{if(!upgrade)await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${ownEconomicsMigration}`,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}
 return {...h,ownEconomics:new H3013OwnEconomicsAdapter(h.runtime,h.f1,h.f2)};
}
