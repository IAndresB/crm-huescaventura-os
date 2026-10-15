// Independent H5-012 verification. Normative oracle: frozen expected C01/C02/C05/C07,
// SPEC-FR-COORD-008, ARCH-DEC-007 and D020. Setup fixtures supply synthetic facts,
// not expected results. Product tree f063879d203330adb57d7e8fef3607ae796f52d5.
import {before,after,test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {isolatedBoundaries,read,write} from "../support/h5-boundary-isolated.ts";
import {bookingFixture} from "../support/h2-booking-fixtures.ts";
import {quantityFixture} from "../support/h2-quantities-fixtures.ts";
import {invoiceFixture} from "../support/h3-invoice-fixtures.ts";
import {confirmationFixture} from "../support/h4-confirmation-fixtures.ts";
import {modificationFixture} from "../support/h4-modification-fixtures.ts";
import {H5011ProjectionAdapter} from "../../src/infrastructure/postgres/h5-projection-adapter.ts";
import {classifyServerEvent} from "../../src/application/verified-interaction.ts";
import type {ProjectionQuery} from "../../src/domain/coordinated-projection.ts";

let h:Awaited<ReturnType<typeof isolatedBoundaries>>,reader:H5011ProjectionAdapter;
before(async()=>{
 h=await isolatedBoundaries("h512",59412);
 await h.migration.unsafe(await readFile("supabase/migrations/20261014003559_h5_authorized_projections.sql","utf8"));
 await h.migration.unsafe(await readFile("supabase/migrations/20261015172843_h5_calendar_current_nights.sql","utf8"));
 await h.migration.unsafe(await readFile("supabase/migrations/20261015180420_h5_projection_canonical_revisions.sql","utf8"));
 reader=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);
});
after(async()=>{await h?.close();});
const query=(id:string,extra:Partial<ProjectionQuery>={}):ProjectionQuery=>({contextKind:"booking",contextId:id,surface:"timeline",destination:"administrator",...extra});
const booking=async()=>{const b=await bookingFixture(h);await h.booking.apply(await h.auth(),write,b.q);return b;};

test("H5-012 independent A01/A07/A08/A09: ordinary runtime, invalid authority and polling",async()=>{
 const a=await booking(),q=query(a.q.bookingId);
 const result=await reader.read(await h.auth(),read,q);
 assert.ok(result);assert.equal(result.mutationAuthority,false);
 await assert.rejects(reader.read({} as never,read,q),/PROJECTION_AUTH_REQUIRED/);
 await assert.rejects(reader.read(await h.auth(),classifyServerEvent("polling"),q),/PROJECTION_AUTH_REQUIRED/);
 for(const sql of ["select * from crm_private.b04_bookings","delete from crm_private.b04_bookings","select crm_api.h5_projection_read(null,null,null,null,null)"]){await assert.rejects(h.runtime.unsafe(sql));}
 console.log("H512 authority: authorized read succeeds; unverified identity, polling, direct SELECT/DML and unsigned SQL denied");
});

test("H5-012 independent S02-S07/A05: external selection precedes search and preserves independent roots",async()=>{
 const a=await booking(),b=await booking();
 const before=await h.observer`select to_jsonb(x) value from crm_private.b04_bookings x where booking_id=${a.q.bookingId}::uuid`;
 for(const destination of ["customer","provider","ai"] as const){
  for(const surface of ["query","search","export","document","timeline","ai_context"] as const){
   const q=query(a.q.bookingId,{surface,destination}),r=await reader.read(await h.auth(),read,q);assert.ok(r);
   assert.equal(r.entries.length,2);
   for(const value of r.entries){
    assert.deepEqual(Object.keys(value as object).sort(),["reference","finalPersonPrice","participants","included"].sort());
    assert.equal((value as {finalPersonPrice:string}).finalPersonPrice,"100.01");
   }
   for(const marker of ["700.00","cost_amount","economics",b.q.bookingId,a.f.accepterId]){
    assert.equal(JSON.stringify(r).includes(marker),false);
    assert.equal((await reader.read(await h.auth(),read,{...q,search:marker}))!.entries.length,0);
   }
  }
 }
 assert.deepEqual(await h.observer`select to_jsonb(x) value from crm_private.b04_bookings x where booking_id=${a.q.bookingId}::uuid`,before);
 console.log("H512 external: 18 purpose/surface combinations; five reserved/foreign markers each; Booking unchanged");
});

test("H5-012 independent C01/C02/C05/C07: calendar reconstructs a night after an approved date change",async()=>{
 const fallback=await invoiceFixture(h),n=await quantityFixture(h);
 await h.booking.apply(await h.auth(),write,n.q);
 const shared={...fallback,bookingId:n.q.bookingId,b:{...fallback.b,q:n.q,detail:n.detail}};
 const f=await confirmationFixture(h,shared,2),m=await modificationFixture(h,f);
 const service=n.detail.services[2]!,night=service.nights[0]!,newDate="2026-10-23";
 assert.equal(night.date,"2026-10-20");
 const q=query(n.q.bookingId,{surface:"calendar"});
 const before=await reader.read(await h.auth(),read,q);assert.ok(before);
 const nightEntries=(r:NonNullable<typeof before>)=>(r.entries as Record<string,any>[]).filter(e=>e.data?.night_id===night.id||e.scope?.id===night.id);
 assert.equal(nightEntries(before).length,1);
 await m.run(await m.request([{id:m.partId,scope:{kind:"night",id:night.id,serviceId:service.id},expectedScopeRevision:1,desired:{date:newDate},aspects:["date"],dependencies:[]}]));
 await m.run(await m.evaluate());await m.run(await m.approve());await m.run(await m.apply());
 // Independent SQL corroborates setup. Literal newDate was selected before product invocation.
 const current=await h.observer`select to_char(night_date,'YYYY-MM-DD') date from crm_private.b04_current_nights where night_id=${night.id}::uuid`;
 assert.equal(current[0]!.date,newDate,"setup must have committed the authorized canonical change");
 const history=await h.observer`select revision,material->>'date' date from crm_private.b04_operational_versions where scope_kind='night' and scope_id=${night.id}::uuid order by revision`;
 const after=await reader.read(await h.auth(),read,q);assert.ok(after);
 const projected=nightEntries(after);
 console.log("H512 night observation",JSON.stringify({bookingId:n.q.bookingId,serviceId:service.id,nightId:night.id,acceptedDate:night.date,expectedCurrentDate:newDate,canonicalCurrent:current[0],operationalVersions:history,calendarNightEntries:projected,mutationAuthority:after.mutationAuthority}));
 assert.equal(projected.length,1,"the applicable night remains reconstructible in this scope");
 const seen=projected[0]!;
 assert.equal(seen.scope?.date??seen.data?.night_date,newDate,"calendar must project the current canonical night date after the approved change, preserving the accepted date as history");
});
