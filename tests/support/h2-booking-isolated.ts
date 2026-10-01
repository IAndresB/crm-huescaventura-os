import {readFile} from 'node:fs/promises';
import {isolatedAcceptance,write,read} from './h2-acceptance-isolated.ts';
import {H2009BookingAdapter} from '../../src/infrastructure/postgres/h2-booking-adapter.ts';
export {write,read};
export const bookingMigration='20261001200941_h2_booking_conversion.sql';
export async function isolatedBooking(label:string,port:number,upgrade=false){
 const h=await isolatedAcceptance(label,port);
 if(!upgrade)await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${bookingMigration}`,import.meta.url),'utf8'));
 return {...h,booking:new H2009BookingAdapter(h.runtime,h.f1,h.f2)};
}
