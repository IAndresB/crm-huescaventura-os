import {readFile} from 'node:fs/promises';
import {isolatedHold,read,write} from './h4-hold-isolated.ts';
import {H4009ConfirmationAdapter} from '../../src/infrastructure/postgres/h4-confirmation-adapter.ts';
export {read,write};
export const confirmationMigration='20261005161912_h4_provider_confirmation.sql';
export const confirmationTables=['b04_confirmations','b04_confirmation_facts','b04_confirmation_operations','b04_confirmation_revisions','b04_confirmation_evaluations'];
export async function isolatedConfirmation(label:string,port:number,upgrade=false){const h=await isolatedHold(label,port);try{if(!upgrade)await h.migration.unsafe(await readFile(new URL('../../supabase/migrations/'+confirmationMigration,import.meta.url),'utf8'));}catch(e){await h.close();throw e;}return {...h,confirmations:new H4009ConfirmationAdapter(h.runtime,h.f1,h.f2)};}
