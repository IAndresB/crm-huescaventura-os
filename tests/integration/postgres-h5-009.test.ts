import {after,afterEach,before,test} from "node:test";
import assert from "node:assert/strict";
import {randomUUID as uid} from "node:crypto";
import {boundaryFixture,isolatedBoundaries,read,write} from "../support/h5-boundary-isolated.ts";
let h:Awaited<ReturnType<typeof isolatedBoundaries>>;
before(async()=>{h=await isolatedBoundaries("crm_h5009",59109);});
after(async()=>{await h?.close();});
afterEach(async()=>{await h?.closeExecutors();});
const material=async(x:Awaited<ReturnType<typeof boundaryFixture>>,recordId:string)=>h.observer`select record_kind,material,occurred_at from crm_private.b07_records where record_id=${recordId}::uuid`;

test("H5-009 B07 event receipt, duplicate and E2 conflict preserve canonical event",async()=>{
 const f=await boundaryFixture(h),first=f.base(),applied=await f.run(first);assert.equal(applied.state,"applied");
 const replay=await f.run(first);assert.equal(replay.replayed,true);assert.equal(replay.id,first.eventId);
 const repeat={...first,operationId:uid(),eventId:uid(),sourceRef:"fixture:redelivery"},duplicate=await f.run(repeat);
 assert.equal(duplicate.state,"duplicate");assert.equal(duplicate.id,first.eventId);
 const conflict=await f.run({...first,operationId:uid(),eventId:uid(),material:{amount:"101.00",currency:"EUR"}});
 assert.equal(conflict.state,"conflict");assert.equal(conflict.code,"E2");assert.equal(conflict.id,first.eventId);
 const receipts=await h.observer`select receipt_state,raw_material,raw_event,source_ref from crm_private.b09_event_receipts where source_id=${f.sourceId}::uuid order by received_at`;
 assert.deepEqual(receipts.map(x=>x.receipt_state),["applied","duplicate","conflict"]);
 assert.equal(receipts[2]!.raw_material.payload.amount,"101.00");assert.equal(receipts[1]!.raw_event.target_id,repeat.eventId);
 assert.equal(receipts[1]!.source_ref,"fixture:redelivery");assert.equal((await material(f,first.eventId)).length,1);
});

test("H5-009 unreliable event identity persists as review and does not fuzzy-deduplicate",async()=>{
 const f=await boundaryFixture(h),{externalKey:_oneKey,...one}=f.base(),{externalKey:_twoKey,...two}=f.base();
 const a=await f.run(one),b=await f.run(two);assert.equal(a.state,"review");assert.equal(b.state,"review");assert.notEqual(a.id,b.id);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b09_event_receipts where source_id=${f.sourceId}::uuid and receipt_state='review'`)[0]!.n,2);
});

test("H5-009 corrected external reference preserves the prior reference and history",async()=>{
 const f=await boundaryFixture(h),firstId=uid(),nextId=uid();
 const create=async(targetId:string,key:string,correctsId?:string)=>h.evidence.apply(await h.auth(),write,{action:"create",operationId:uid(),targetId,
  kind:"external_reference",material:{source_id:f.sourceId,external_key:key,coverage:f.coverage},sourceRef:"synthetic-provider-ref",
  purpose:"external-boundary",contextKind:"booking",contextId:f.contextId,coverage:f.coverage,reason:"Referencia sintética",...(correctsId?{correctsId}:{})});
 await create(firstId,"booking-old");await create(nextId,"booking-new",firstId);
 const rows=await h.observer`select record_id::text,material,corrects_id::text from crm_private.b07_records where record_id in (${firstId}::uuid,${nextId}::uuid) order by record_id`;
 assert.equal(rows.length,2);assert.ok(rows.find(x=>x.record_id===firstId));assert.equal(rows.find(x=>x.record_id===nextId)?.corrects_id,firstId);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_history where subject_id=${nextId}::uuid and before_state is not null`)[0]!.n,1);
});

test("H5-009 own B08 effect echo correlates to its original attempt without a second effect",async()=>{
 const {workFixture}=await import("../support/h5-work-isolated.ts"),work=await workFixture(h);
 await work.run(work.definition);const claim=work.claim(),claimed=await work.run(claim);await work.run(work.start(claim,claimed.generation!));
 const f=await boundaryFixture(h,"other",work.context.contextId),event={...f.base(),echoOfOperationId:claim.attemptId};
 const before=(await work.see())!,result=await f.run(event),after=(await work.see())!;
 assert.equal(result.state,"duplicate");assert.deepEqual(after,before);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b09_event_receipts where received_event_id=${event.eventId}::uuid and receipt_state='duplicate'`)[0]!.n,1);
});

test("H5-009 operation key material mismatch is rejected before any receipt side effect",async()=>{
 const f=await boundaryFixture(h),one=f.base();await f.run(one);
 const before=(await h.observer`select count(*)::int n from crm_private.b09_event_receipts where source_id=${f.sourceId}::uuid`)[0]!.n;
 await assert.rejects(f.run({...one,material:{amount:"200.00"}}),/B07_REPLAY_CONFLICT/);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b09_event_receipts where source_id=${f.sourceId}::uuid`)[0]!.n,before);
});

test("H5-009 actor, purpose and linked context are revalidated with no rejection effects",async()=>{
 const f=await boundaryFixture(h),input=f.base(),before=(await h.observer`select count(*)::int n from crm_private.b09_event_receipts`)[0]!.n,
  beforeEvents=(await h.observer`select count(*)::int n from crm_private.b07_records where record_kind='external_event'`)[0]!.n;
 const {verifyAuth}=await import("../../src/application/verified-auth.ts");
 const foreign=await verifyAuth({verify:async()=>({subject:uid(),passwordVerified:true,mfaVerified:true})},uid());
 await assert.rejects(h.boundaries.receive(foreign,write,input),/BOUNDARY_DENIED/);
 await assert.rejects(f.run({...input,purpose:"external-payment"}),/BOUNDARY_DENIED/);
 await assert.rejects(f.run({...input,contextId:uid()}),/BOUNDARY_DENIED/);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b09_event_receipts`)[0]!.n,before);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_records where record_kind='external_event'`)[0]!.n,beforeEvents);
});

test("H5-009 B09 receipt trigger rollback is atomic across B07 original and key; retry succeeds",async()=>{
 const f=await boundaryFixture(h),input=f.base();
 const counts=async()=>({records:(await h.observer`select count(*)::int n from crm_private.b07_records`)[0]!.n,
  operations:(await h.observer`select count(*)::int n from crm_private.b07_operations`)[0]!.n,
  history:(await h.observer`select count(*)::int n from crm_private.b07_history`)[0]!.n,
  keys:(await h.observer`select count(*)::int n from crm_private.b09_external_event_keys`)[0]!.n,
  receipts:(await h.observer`select count(*)::int n from crm_private.b09_event_receipts`)[0]!.n});
 const before=await counts();await h.admin.unsafe("create function crm_private.h5009_fail() returns trigger language plpgsql as $$begin raise exception 'H5009_INJECTED';end$$");
 await h.admin.unsafe("create trigger h5009_fail before insert on crm_private.b09_event_receipts for each row execute function crm_private.h5009_fail()");
 try{await assert.rejects(f.run(input));}finally{await h.admin.unsafe("drop trigger h5009_fail on crm_private.b09_event_receipts;drop function crm_private.h5009_fail()");}
 assert.deepEqual(await counts(),before);assert.equal((await material(f,input.eventId)).length,0);
 assert.equal((await f.run(input)).state,"applied");assert.equal((await counts()).records,before.records+1);
});

test("H5-009 RLS/FORCE RLS and grants keep B09 receipts private",async()=>{
 for(const table of ["b09_external_event_keys","b09_event_receipts"]){
  const row=(await h.observer.unsafe(`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.${table}'::regclass`))[0]!;
  assert.equal(row.relrowsecurity,true);assert.equal(row.relforcerowsecurity,true);
  for(const role of ["crm_h0_runtime","anon","authenticated"]){const sql=h.connect(role);try{await assert.rejects(sql.unsafe(`select * from crm_private.${table}`));await assert.rejects(sql.unsafe(`insert into crm_private.${table} default values`));}finally{await sql.end({timeout:1});}}
 }
 await assert.rejects(h.runtime.unsafe("select crm_api.b09_external_event_apply(null,null,null,null,null)"));
});

test("H5-009 concurrent independent PostgreSQL sessions apply one event once",async()=>{
 const f=await boundaryFixture(h),one=f.base(),two={...one,operationId:uid(),eventId:uid(),sourceRef:"fixture:concurrent-redelivery"};
 const secondSql=h.connect("crm_h0_runtime");try{
  const pids=await Promise.all([h.runtime`select pg_backend_pid()::int pid`,secondSql`select pg_backend_pid()::int pid`]);
  assert.notEqual(pids[0]![0]!.pid,pids[1]![0]!.pid);
  const secondAdapter=new (await import("../../src/infrastructure/postgres/h5-external-event-adapter.ts")).H5009ExternalEventAdapter(secondSql,h.f1,h.f2);
  const auth=await h.auth();
  await h.admin.unsafe("create function crm_private.h5009_race_gate() returns trigger language plpgsql as $$begin perform pg_sleep(0.2);return new;end$$");
  await h.admin.unsafe("create trigger h5009_race_gate before insert on crm_private.b09_external_event_keys for each row execute function crm_private.h5009_race_gate()");
  const first=h.boundaries.receive(auth,write,one),second=secondAdapter.receive(auth,write,two);first.catch(()=>{});second.catch(()=>{});
  let waiting:any[]=[];for(let i=0;i<50;i++){waiting=await h.admin`select pid,wait_event_type,wait_event,pg_blocking_pids(pid) blockers from pg_stat_activity where usename='crm_h0_runtime' and wait_event_type='Lock'`;if(waiting.length)break;await new Promise(resolve=>setTimeout(resolve,10));}
  await h.admin.unsafe("drop trigger h5009_race_gate on crm_private.b09_external_event_keys;drop function crm_private.h5009_race_gate()");
  assert.ok(waiting.length>0,"second independent PostgreSQL session must block on the event identity lock");
  const results=await Promise.all([first,second]);
  assert.equal(results.filter(x=>x.state==="applied").length,1);assert.equal(results.filter(x=>x.state==="duplicate").length,1);
  assert.equal(results[0]!.id,results[1]!.id);
  assert.equal((await h.observer`select count(*)::int n from crm_private.b07_records where record_kind='external_event' and material->>'source_id'=${f.sourceId}`)[0]!.n,1);
  const conflictFixture=await boundaryFixture(h),left={...conflictFixture.base(),material:{amount:"50.00",currency:"EUR"}},right={...conflictFixture.base(),material:{amount:"51.00",currency:"EUR"}};
  await h.admin.unsafe("create function crm_private.h5009_race_gate() returns trigger language plpgsql as $$begin perform pg_sleep(0.2);return new;end$$");
  await h.admin.unsafe("create trigger h5009_race_gate before insert on crm_private.b09_external_event_keys for each row execute function crm_private.h5009_race_gate()");
  const conflicting=[h.boundaries.receive(auth,write,left),secondAdapter.receive(auth,write,right)];conflicting.forEach(p=>p.catch(()=>{}));
  let conflictWaiting:any[]=[];for(let i=0;i<50;i++){conflictWaiting=await h.admin`select pid from pg_stat_activity where usename='crm_h0_runtime' and wait_event_type='Lock'`;if(conflictWaiting.length)break;await new Promise(resolve=>setTimeout(resolve,10));}
  await h.admin.unsafe("drop trigger h5009_race_gate on crm_private.b09_external_event_keys;drop function crm_private.h5009_race_gate()");
  assert.ok(conflictWaiting.length>0);
  const conflicts=await Promise.all(conflicting);assert.equal(conflicts.filter(x=>x.state==="applied").length,1);assert.equal(conflicts.filter(x=>x.state==="conflict"&&x.code==="E2").length,1);
  assert.equal((await h.observer`select count(*)::int n from crm_private.b09_event_receipts where source_id=${conflictFixture.sourceId}::uuid and receipt_state='conflict'`)[0]!.n,1);
 }finally{await h.admin.unsafe("drop trigger if exists h5009_race_gate on crm_private.b09_external_event_keys;drop function if exists crm_private.h5009_race_gate()");await secondSql.end({timeout:1});}
});

test("H5-009 Avaibook, calendar and web stay review-only and cannot execute external action requests",async()=>{
 const counts=async()=>({attempts:(await h.observer`select count(*)::int n from crm_private.b08_attempts`)[0]!.n,
  executions:(await h.observer`select count(*)::int n from crm_private.b08_executions`)[0]!.n,
  bookings:(await h.observer`select count(*)::int n from crm_private.b07_records where record_kind in ('booking','booking_service')`)[0]!.n,
  invoices:(await h.observer`select count(*)::int n from crm_private.b07_records where record_kind='invoice'`)[0]!.n});
 const before=await counts(),avaibook=await boundaryFixture(h,"avaibook"),states=[];
 for(const action of ["create_reservation","modify_reservation","cancel_reservation"]){
  states.push((await avaibook.run({...avaibook.base(),externalKey:`avaibook-${action}`,material:{action,booking_id:uid(),price:"999.00",availability:"closed"}})).state);
 }
 const calendar=await boundaryFixture(h,"calendar"),calendarResult=await calendar.run({...calendar.base(),material:{action:"change_price_and_availability",price:"999.00",availability:"closed"}});
 const web=await boundaryFixture(h,"web"),other=await boundaryFixture(h,"other");
 const [webResult,otherResult,invoiceAttempt]=await Promise.all([
  web.run({...web.base(),externalKey:"same-key-other-source",material:{action:"create_reservation"}}),
  other.run({...other.base(),externalKey:"same-key-other-source",material:{action:"create_reservation"}}),
  other.run({...other.base(),externalKey:"synthetic-invoice-command",material:{action:"issue_invoice"}})]);
 assert.deepEqual(states,["review","review","review"]);assert.equal(calendarResult.state,"review");assert.equal(webResult.state,"review");assert.equal(otherResult.state,"applied");assert.equal(invoiceAttempt.state,"applied");
 assert.deepEqual(await counts(),before);
});
