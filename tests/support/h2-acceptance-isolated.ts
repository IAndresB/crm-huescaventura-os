import {readFile} from 'node:fs/promises';
import {isolatedOffer,write,read} from './h2-offer-isolated.ts';
import {H2007AcceptanceAdapter} from '../../src/infrastructure/postgres/h2-acceptance-adapter.ts';
export {write,read};
export const acceptanceMigration='20261001172433_h2_exact_acceptance.sql';
export async function isolatedAcceptance(label:string,port:number,upgrade=false){
 const h=await isolatedOffer(label,port);
 if(!upgrade) await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${acceptanceMigration}`,import.meta.url),'utf8'));
 return {...h,acceptance:new H2007AcceptanceAdapter(h.runtime,h.f1,h.f2)};
}
