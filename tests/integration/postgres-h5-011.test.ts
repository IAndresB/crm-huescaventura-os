import {before,after,test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {randomUUID as uid} from "node:crypto";
import {isolatedBoundaries,read,write} from "../support/h5-boundary-isolated.ts";
import {bookingFixture} from "../support/h2-booking-fixtures.ts";
import {H5011ProjectionAdapter} from "../../src/infrastructure/postgres/h5-projection-adapter.ts";
import {classifyServerEvent} from "../../src/application/verified-interaction.ts";
import type {ProjectionQuery} from "../../src/domain/coordinated-projection.ts";
const migration="supabase/migrations/20261014003559_h5_authorized_projections.sql";
let h:Awaited<ReturnType<typeof isolatedBoundaries>>,adapter:H5011ProjectionAdapter;
before(async()=>{h=await isolatedBoundaries("crm_h5011",59211);await h.migration.unsafe(await readFile(migration,"utf8"));adapter=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);});
after(async()=>{await h?.close();});
const fixture=async()=>{const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);return f;};
const q=(contextId:string,surface:ProjectionQuery["surface"]="timeline",destination:ProjectionQuery["destination"]="administrator"):ProjectionQuery=>({contextKind:"booking",contextId,surface,destination});
test("H5-011 native C01: reconstructs exact chain and scoped original/history without business writes",async()=>{
 const f=await fixture(),before=await h.observer`select to_jsonb(b) value from crm_private.b04_bookings b where booking_id=${f.q.bookingId}::uuid`;
 const result=await adapter.read(await h.auth(),read,q(f.q.bookingId));assert.ok(result);assert.equal(result.mutationAuthority,false);
 const entries=result.entries as {source:string;data:Record<string,unknown>}[];
 for(const source of ["b04_bookings","b03_proposal_versions","b03_acceptances","b04_history","b07_records"]){assert.ok(entries.some(x=>x.source===`crm_private.${source}`),source);}
 assert.deepEqual(await h.observer`select to_jsonb(b) value from crm_private.b04_bookings b where booking_id=${f.q.bookingId}::uuid`,before);
});
test("H5-011 native external surfaces: explicit commercial output preserves fixed internal economics",async()=>{
 const f=await fixture();
 for(const surface of ["query","search","export","document","timeline","ai_context"] as const){
  const result=await adapter.read(await h.auth(),read,q(f.q.bookingId,surface,"customer"));assert.ok(result);
  const content=JSON.stringify(result);
  const expected=await Promise.all(f.f.content.modalities.map(async m=>({
   reference:f.q.versionId,finalPersonPrice:m.finalPersonPrice,participants:m.participants,
   included:await Promise.all(m.lines.filter(l=>l.included).map(async l=>({
    service:(await h.observer`select definition->>'name' name from crm_private.catalog_revisions where revision_id=${l.serviceRevisionId}::uuid`)[0]!.name,
    quantity:Number(l.quantity),date:l.date,
   }))),
  })));
  assert.equal(result.entries.length,expected.length);
  assert.deepEqual(new Set(result.entries),new Set(expected));
  for(const forbidden of ["cost_amount","costMaterial","economics","accepter_id","terms_text","700.00"]){assert.equal(content.includes(forbidden),false,forbidden);}
  assert.equal((await adapter.read(await h.auth(),read,{...q(f.q.bookingId,surface,"customer"),search:"700.00"}))!.entries.length,0);
 }
 const internal=await adapter.read(await h.auth(),read,q(f.q.bookingId));assert.ok(JSON.stringify(internal).includes("economics"));
});
test("H5-011 native calendar reads current canonical service references",async()=>{
 const f=await fixture(),result=await adapter.read(await h.auth(),read,q(f.q.bookingId,"calendar"));assert.ok(result);
 const entries=(result.entries as {reference:string;bookingId:string;source:string;phase:unknown;scope:{id:string;serviceRevisionId:string;date:string|null;schedule:unknown;cancelled:boolean}}[])
  .filter(x=>x.source==="crm_private.modification_scope");
 assert.equal(entries.length,f.detail.services.length);
 assert.equal(new Set(entries.map(x=>x.reference)).size,entries.length);
 assert.deepEqual(new Set(entries.map(x=>x.reference)),new Set(f.detail.services.map(x=>x.id)));
 for(const service of f.detail.services){
  const entry=entries.find(x=>x.reference===service.id);assert.ok(entry);
  assert.equal(entry.reference,service.id);assert.equal(entry.scope.id,service.id);
  assert.equal(entry.bookingId,f.q.bookingId);assert.equal(entry.scope.serviceRevisionId,service.serviceRevisionId);
  assert.equal(entry.source,"crm_private.modification_scope");assert.equal(entry.phase,null);
  const lines=service.contributions.map(c=>f.f.content.modalities.flatMap(m=>m.lines).find(l=>l.id===c.lineId)!);
  assert.ok(lines.length>0);assert.ok(lines.every(l=>!l.datePending&&l.date===lines[0]!.date));
  assert.equal(entry.scope.date,lines[0]!.date);assert.equal(typeof entry.scope.date,"string");
  assert.deepEqual(entry.scope.schedule,service.schedule);assert.equal(entry.scope.cancelled,false);
 }
});
test("H5-011 native scope, untrusted context and SQL privilege attempts deny",async()=>{
 const f=await fixture();await assert.rejects(adapter.read(await h.auth(),read,q(uid())),/PROJECTION_DENIED/);
 await assert.rejects(adapter.read({} as never,read,q(f.q.bookingId)),/AUTH_REQUIRED/);
 await assert.rejects(adapter.read(await h.auth(),{interactionClass:"interactive_read"} as never,q(f.q.bookingId)),/AUTH_REQUIRED/);
 await assert.rejects(adapter.read(await h.auth(),classifyServerEvent("polling"),q(f.q.bookingId)),/AUTH_REQUIRED/);
 await assert.rejects(h.runtime.unsafe("select crm_api.h5_projection_read(null,null,null,null,null)"));
 await assert.rejects(h.runtime.unsafe("select * from crm_private.b04_bookings"));
});
test("H5-011 native independent bookings and stale sessions remain isolated",async()=>{
 const a=await fixture(),b=await fixture(),first=await adapter.read(await h.auth(),read,q(a.q.bookingId));
 assert.equal(JSON.stringify(first).includes(b.q.bookingId),false);
 const saved=await h.observer`select enabled from crm_private.crm_actors where actor_id=${h.actorId}::uuid`;
 await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;
 try{await assert.rejects(adapter.read(await h.auth(),read,q(a.q.bookingId)),/PROJECTION_DENIED/);}finally{await h.admin`update crm_private.crm_actors set enabled=${saved[0]!.enabled} where actor_id=${h.actorId}::uuid`;}
});
test("H5-011 V-MIG: rollback/retry leaves prior data and existing objects unchanged",async()=>{
 const previous=await isolatedBoundaries("crm_h5011_mig",59212);
 try{
  const f=await bookingFixture(previous);await previous.booking.apply(await previous.auth(),write,f.q);
  const tables=await previous.observer`select c.oid,c.relname,c.relowner,c.relacl,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='crm_private' and c.relkind in ('r','p') order by c.oid`;
  const before=await previous.observer`select to_jsonb(b) value from crm_private.b04_bookings b`;
  const sql=await readFile(migration,"utf8");
  await assert.rejects(previous.migration.unsafe(sql.replace(/commit;\s*$/,"select 1/0;commit;")));await previous.migration.unsafe("rollback");
  assert.equal((await previous.observer`select to_regprocedure('crm_api.h5_projection_read(bytea,bytea,bytea,bytea,bytea)') is null absent`)[0]!.absent,true);
  await previous.migration.unsafe(sql);
  assert.deepEqual(await previous.observer`select to_jsonb(b) value from crm_private.b04_bookings b`,before);
  assert.deepEqual(await previous.observer`select c.oid,c.relname,c.relowner,c.relacl,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='crm_private' and c.relkind in ('r','p') order by c.oid`,tables);
 }finally{await previous.close();}
});
