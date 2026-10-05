import {readFile} from 'node:fs/promises';
import {isolatedAvailability,read,write} from './h4-availability-isolated.ts';
import {H4007HoldAdapter} from '../../src/infrastructure/postgres/h4-hold-adapter.ts';
export {read,write};
export const holdMigration='20261005141534_h4_capacity_holds.sql';
export const holdTables=['b04_holds','b04_hold_operations','b04_hold_revisions'];
export async function isolatedHold(label:string,port:number,upgrade=false){const h=await isolatedAvailability(label,port);try{if(!upgrade)await h.migration.unsafe(await readFile(new URL('../../supabase/migrations/'+holdMigration,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}return {...h,holds:new H4007HoldAdapter(h.runtime,h.f1,h.f2)};}
