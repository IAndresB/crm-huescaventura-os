import {readFile} from 'node:fs/promises';
import {isolatedInvoice,write,read} from './h3-invoice-isolated.ts';
import {H3009SuplidoAdapter} from '../../src/infrastructure/postgres/h3-suplido-adapter.ts';
export {write,read};
export const suplidoMigration='20261004175435_h3_managed_client_funds_documentary.sql';
export async function isolatedSuplido(label:string,port:number,upgrade=false){
 const h=await isolatedInvoice(label,port);
 try{if(!upgrade)await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${suplidoMigration}`,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}
 return {...h,suplidos:new H3009SuplidoAdapter(h.runtime,h.f1,h.f2)};
}
