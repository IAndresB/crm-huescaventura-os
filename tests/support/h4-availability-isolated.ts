import {readFile} from 'node:fs/promises';
import {isolatedIncident,read,write} from './h4-incident-isolated.ts';
import {H4005AvailabilityAdapter} from '../../src/infrastructure/postgres/h4-availability-adapter.ts';
export {read,write};
export const availabilityMigration='20261005055658_h4_availability_evidence.sql';
export const availabilityTables=['b04_availability','b04_availability_operations','b04_availability_revisions'];
export async function isolatedAvailability(label:string,port:number,upgrade=false){const h=await isolatedIncident(label,port);try{if(!upgrade)await h.migration.unsafe(await readFile(new URL('../../supabase/migrations/'+availabilityMigration,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}return {...h,availability:new H4005AvailabilityAdapter(h.runtime,h.f1,h.f2)};}
