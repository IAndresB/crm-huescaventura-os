import {readFile} from 'node:fs/promises';
import {isolatedBooking,write,read} from './h2-booking-isolated.ts';
import {H3001ObligationAdapter} from '../../src/infrastructure/postgres/h3-obligation-adapter.ts';
export {write,read};
export const obligationMigration='20261002233922_h3_expected_obligations.sql';
export async function isolatedObligation(label:string,port:number,upgrade=false){
 const h=await isolatedBooking(label,port);
 try {if(!upgrade)await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${obligationMigration}`,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}
 return {...h,obligations:new H3001ObligationAdapter(h.runtime,h.f1,h.f2)};
}
