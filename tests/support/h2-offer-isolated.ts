import {readFile} from 'node:fs/promises';
import {isolatedProposal,write,read} from './h2-proposal-isolated.ts';
import {H2005OfferAdapter} from '../../src/infrastructure/postgres/h2-offer-adapter.ts';
export {write,read};
export const offerMigration='20261001150357_h2_offer_lifecycle.sql';
export async function isolatedOffer(label:string,port:number,upgrade=false){
 const h=await isolatedProposal(label,port);
 if(!upgrade) await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${offerMigration}`,import.meta.url),'utf8'));
 return {...h,offer:new H2005OfferAdapter(h.runtime,h.f1,h.f2)};
}
