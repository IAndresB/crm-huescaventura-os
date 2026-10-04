import {readFile} from 'node:fs/promises';
import {isolatedRequirement,read,write} from './h4-requirement-isolated.ts';
import {H4003IncidentAdapter} from '../../src/infrastructure/postgres/h4-incident-adapter.ts';
export {read,write};
export const incidentMigration='20261004231359_h4_incidents.sql';
export const incidentTables=['b07_incidents','b07_incident_operations','b07_incident_revisions'];
export async function isolatedIncident(label:string,port:number,upgrade=false){
 const h=await isolatedRequirement(label,port);
 try{if(!upgrade)await h.migration.unsafe(await readFile(new URL('../../supabase/migrations/'+incidentMigration,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}
 return {...h,incidents:new H4003IncidentAdapter(h.runtime,h.f1,h.f2)};
}
