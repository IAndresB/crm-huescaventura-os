import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedBooking,write,read} from '../support/h2-booking-isolated.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
test('H2-009 focal: exact immutable chain, complete detail, RES H1, replay and authorized read',async()=>{
 const h=await isolatedBooking('crm_h2_009',55482);
 try{const {q}=await bookingFixture(h),r=await h.booking.apply(await h.auth(),write,q);assert.equal(r.id,q.bookingId);
 const rows=await h.observer`select * from crm_private.b04_bookings`;assert.equal(rows.length,1);assert.equal(rows[0]!.state,'Pendiente de preparación');
 assert.equal((await h.observer`select * from crm_private.b04_services`).length,2);
 assert.match(String((await h.observer`select human_code from crm_private.identity_codes where target_id=${q.bookingId}::uuid`)[0]!.human_code),/^RES-2026-\d{4,}$/);
 assert.equal((await h.booking.apply(await h.auth(),write,q)).replayed,true);assert.ok(await h.booking.read(await h.auth(),read,q.bookingId));
 await assert.rejects(h.runtime`update crm_private.b04_bookings set state='Confirmada'`);
 }finally{await h.close();}
});
