import {readFile} from 'node:fs/promises';
import {createHmac,randomUUID as uid} from 'node:crypto';
import {isolatedAllocation,write,read} from './h3-allocation-isolated.ts';
import {H3007InvoiceAdapter} from '../../src/infrastructure/postgres/h3-invoice-adapter.ts';
import {H1015ObjectAdapter} from '../../src/infrastructure/postgres/h1-object-adapter.ts';
import {SupabasePrivateStorage} from '../../src/infrastructure/storage/private-storage.ts';
export {write,read};
export const invoiceMigration='20261004161012_h3_provider_invoice_documentary.sql';
export async function isolatedInvoice(label:string,port:number,upgrade=false){
 const h=await isolatedAllocation(label,port);
 try{if(!upgrade)await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${invoiceMigration}`,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}
 const endpoint=process.env.STORAGE_H1_ENDPOINT,config=process.env.STORAGE_H1_CONFIG;
 if(!endpoint||!config||new URL(endpoint).hostname!=='127.0.0.1'){await h.close();throw new Error('ISOLATED_STORAGE_REQUIRED');}
 const secret=(await readFile(config,'utf8')).match(/^AUTH_JWT_SECRET=(.*)$/m)?.[1];if(!secret)throw new Error('ISOLATED_STORAGE_REQUIRED');
 const header=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),payload=Buffer.from(JSON.stringify({role:'service_role',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');
 const token=`${header}.${payload}.${createHmac('sha256',secret).update(`${header}.${payload}`).digest('base64url')}`,bucket='synthetic-invoice-'+uid();
 const created=await fetch(`${endpoint}/bucket`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({id:bucket,name:bucket,public:false})});if(!created.ok)throw new Error('ISOLATED_STORAGE_REQUIRED');
 const storage=new SupabasePrivateStorage(endpoint,bucket,token);
 return {...h,storage,objects:new H1015ObjectAdapter(h.runtime,storage,h.f1,h.f2),invoices:new H3007InvoiceAdapter(h.runtime,h.f1,h.f2)};
}
