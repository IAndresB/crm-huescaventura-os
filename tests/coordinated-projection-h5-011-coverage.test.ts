import {test} from "node:test";
import assert from "node:assert/strict";
import {composeProjection,projectCivilReference,validateProjectionQuery,type CanonicalProjectionFrame,type ProjectionQuery} from "../src/domain/coordinated-projection.ts";
import {civilReference,localDate,zoneEvidence,selectReference} from "../src/domain/civil-time.ts";
const id="a1111111-1111-4111-8111-111111111111";
const q:ProjectionQuery={contextKind:"booking",contextId:id,surface:"timeline",destination:"administrator"};
const empty:CanonicalProjectionFrame={contextKind:"booking",contextId:id,facts:[],calendar:[],commercial:[]};
const zone=zoneEvidence("Europe/Madrid","synthetic declared zone","1");

test("H5-011 H02: late, earlier registered and unknown facts keep their actual two moments",()=>{
 const data=[{record_id:"late",occurred_at:"2026-11-10T10:00:00Z",recorded_at:"2026-11-12T10:00:00Z"},{record_id:"earlier-register",occurred_at:"2026-11-11T10:00:00Z",recorded_at:"2026-11-11T10:00:00Z"},{record_id:"unknown",occurred_at:null,recorded_at:"2026-11-12T11:00:00Z"}];
 const entries=composeProjection({...empty,facts:data.map(d=>({kind:"b07_records",data:{...d,material:{certainty:"unknown"}}}))},q).entries as Record<string,any>[];
 for(const original of data){const e=entries.find(x=>x.data.record_id===original.record_id)!;assert.ok(e);assert.equal(e.occurredAt,original.occurred_at);assert.equal(e.recordedAt,original.recorded_at);}
});
test("H5-011 H04: requester, registrant, approver and automatic executor remain different provenance",()=>{
 const d={actor_id:"synthetic-registrant",requested_by:"synthetic-external",approved_by:"synthetic-approver",executed_by:"synthetic-automatic",before_state:null,after_state:{state:"synthetic created"},reason:"synthetic cause"};
 const result=composeProjection({...empty,facts:[{kind:"identity_history",data:d}]},q);
 assert.deepEqual((result.entries[0] as Record<string,any>).data,d);assert.equal(result.mutationAuthority,false);
});
test("H5-011 C01: calendar retains service and canonical night, hold, payment, Task and document categories",()=>{
 const kinds=["b04_nights","b04_holds","b05_expected_payments","b07_pending_tasks","b07_requirements"];
 const frame={...empty,calendar:[{reference:"synthetic-service",source:"crm_private.modification_scope",certainty:"pending",scope:{schedule:null}}],facts:kinds.map(kind=>({kind,data:{}}))};
 const result=composeProjection(frame,{...q,surface:"calendar"});assert.equal(result.entries.length,6);
 for(const kind of kinds)assert.ok((result.entries as Record<string,any>[]).some(e=>e.source===`crm_private.${kind}`));assert.equal(result.mutationAuthority,false);
});
test("H5-011 C05: provided canonical Booking, modality, service and night anchors stay independent",()=>{
 for(const [scope,date,days] of [["global","2026-11-20",2],["modality","2026-11-22",4],["service","2026-11-20",2],["night","2026-11-23",5]] as const){
  const reference=civilReference({scope,scopeId:`synthetic-${scope}`},localDate(date),zone,`synthetic-${scope}-source`,"1");const projected=projectCivilReference(reference,"2026-11-18T12:00:00+01:00");
  assert.equal(projected.evaluation!.reference,reference);assert.equal(projected.evaluation!.daysBefore,days);assert.equal(projected.evaluation!.reference.scope,scope);
 }
});
test("H5-011 C06: accredited explicit contract reference keeps its basis; missing validity stays pending",()=>{
 const normal=civilReference({scope:"service",scopeId:id},localDate("2026-11-20"),zone,"synthetic service","1"),contract=civilReference({scope:"service",scopeId:id},localDate("2026-11-25"),zone,"synthetic approved contract","2","express_contract");
 const result=projectCivilReference(selectReference([normal,contract],{scope:"service",scopeId:id}),"2026-11-18T12:00:00+01:00");
 assert.equal(result.evaluation!.reference,contract);assert.equal(result.evaluation!.reference.basis,"express_contract");assert.equal(result.evaluation!.daysBefore,7);
 assert.equal(projectCivilReference(null,"2026-11-18T12:00:00+01:00").certainty,"pending");
});
test("H5-011 C07: same civil date hours keep interval; an accredited changed date retains the prior reference",()=>{
 const original=civilReference({scope:"service",scopeId:id},localDate("2026-11-20"),zone,"synthetic original","1"),changed=civilReference({scope:"service",scopeId:id},localDate("2026-11-22"),zone,"synthetic approved date change","2");
 assert.equal(projectCivilReference(original,"2026-11-13T00:00:00+01:00").evaluation!.daysBefore,7);assert.equal(projectCivilReference(original,"2026-11-13T23:59:59+01:00").evaluation!.daysBefore,7);
 assert.equal(projectCivilReference(changed,"2026-11-13T23:59:59+01:00").evaluation!.daysBefore,9);assert.equal(original.date,"2026-11-20");assert.equal(changed.version,"2");
});
test("H5-011 C08/D020: autumn clock repetition changes the instant without changing its civil day",()=>{
 const reference=civilReference({scope:"service",scopeId:id},localDate("2026-11-01"),zone,"synthetic service date","1");
 for(const at of ["2026-10-25T02:30:00+02:00","2026-10-25T02:30:00+01:00"]){const result=projectCivilReference(reference,at);assert.equal(result.evaluation!.actDate,"2026-10-25");assert.equal(result.evaluation!.daysBefore,7);}
});
test("H5-011 S09/S12/A09: unsupported audio, retention and fiscal authority cannot be injected or echoed",()=>{
 for(const key of ["includeAudio","retentionDays","emitInvoice","mergeBookings","permission"]){assert.throws(()=>validateProjectionQuery({...q,[key]:"PRIVATE-CANARY"} as ProjectionQuery),error=>error instanceof Error&&error.message==="PROJECTION_INPUT_INVALID");}
});
test("H5-011 H05/H02: candidate review and receipt moments follow explicit canonical metadata",()=>{
 const frame={...empty,facts:[{kind:"b07_communication_work",data:{material:{reviewState:"pending"},kind:"candidate"}},{kind:"b09_event_receipts",data:{received_at:"2026-11-12T10:00:00Z",raw_event:{occurred_at:"2026-11-10T10:00:00Z"}}}]};
 const entries=composeProjection(frame,q).entries as Record<string,any>[];assert.equal(entries.find(e=>e.data.kind==="candidate")!.certainty,"pending");const receipt=entries.find(e=>e.source==="crm_private.b09_event_receipts")!;assert.equal(receipt.recordedAt,"2026-11-12T10:00:00Z");assert.equal(receipt.occurredAt,"2026-11-10T10:00:00Z");
});
test("H5-011 C02: UUID input accepted by the contract identifies the same canonical root in either case",()=>{
 assert.equal(composeProjection(empty,{...q,contextId:id.toUpperCase()}).contextId,id);
});
test("H5-011 H02: the chosen registration order compares actual instants across the repeated clock hour",()=>{
 const frame={...empty,facts:[{kind:"identity_history",data:{subject_id:"early",recorded_at:"2026-10-25T02:30:00+02:00"}},{kind:"identity_history",data:{subject_id:"late",recorded_at:"2026-10-25T02:30:00+01:00"}}]};
 const entries=composeProjection(frame,q).entries as Record<string,any>[];assert.deepEqual(entries.map(e=>e.data.subject_id),["early","late"]);
});
test("H5-011 C05/C08: estimated canonical contributions remain pending and confirmed ones keep their certainty",()=>{
 for(const [certainty,expected] of [["estimated","pending"],["confirmed","verified"]]){const result=composeProjection({...empty,facts:[{kind:"b04_contributions",data:{certainty}}]},q);assert.equal((result.entries[0] as Record<string,any>).certainty,expected);}
});
