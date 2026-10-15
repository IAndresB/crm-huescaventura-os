import {test} from "node:test";
import assert from "node:assert/strict";
import {composeProjection,cancellationProjection,projectCivilReference,validateProjectionQuery,type CanonicalProjectionFrame,type ProjectionQuery} from "../src/domain/coordinated-projection.ts";
import {civilReference,localDate,zoneEvidence} from "../src/domain/civil-time.ts";
const id="11111111-1111-4111-8111-111111111111";
const query=(surface:ProjectionQuery["surface"]="timeline",destination:ProjectionQuery["destination"]="administrator"):ProjectionQuery=>({contextKind:"booking",contextId:id,surface,destination});
const frame:CanonicalProjectionFrame={contextKind:"booking",contextId:id,calendar:[],commercial:[{
 reference:id,finalPersonPrice:"120.00",participants:10,included:[{service:"Synthetic rafting",quantity:1,date:"2026-11-20",cost:"PRIVATE-COST"}],
 cost:"PRIVATE-COST",margin:"PRIVATE-MARGIN",phone:"PRIVATE-PHONE",
}],facts:[{kind:"b07_records",data:{record_id:id,material:{claim:"PRIVATE-CONTENT",certainty:"unknown"},occurred_at:"2026-11-10T10:00:00Z",recorded_at:"2026-11-12T10:00:00Z",corrects_id:null}}]};
test("H5-011 H02/H05: fact and registration instants and unknown original remain distinct",()=>{
 const result=composeProjection(frame,query());const entry=result.entries[0] as {occurredAt:string;recordedAt:string;certainty:string};
 assert.equal(entry.occurredAt,"2026-11-10T10:00:00Z");assert.equal(entry.recordedAt,"2026-11-12T10:00:00Z");assert.equal(entry.certainty,"unknown");assert.equal(result.mutationAuthority,false);
});
for(const surface of ["query","search","export","document","timeline","ai_context"] as const){
 test(`H5-011 S02–S07: ${surface} uses the permitted list before external search`,()=>{
  const result=composeProjection(frame,query(surface,"customer")),serialized=JSON.stringify(result);
  assert.equal(serialized.includes("PRIVATE-"),false);assert.ok(serialized.includes("120.00"));assert.ok(serialized.includes("Synthetic rafting"));
  assert.equal(composeProjection(frame,{...query(surface,"customer"),search:"PRIVATE-COST"}).entries.length,0);
  assert.equal(frame.facts[0]!.data.material!==undefined,true);
 });
}
test("H5-011 A05/A06: mismatched root and cursor purpose fail without shared cache",()=>{
 assert.throws(()=>composeProjection({...frame,contextId:"22222222-2222-4222-8222-222222222222"},query()),/PROJECTION_DENIED/);
 const many={...frame,commercial:[...frame.commercial,...frame.commercial]},first=composeProjection(many,{...query("query","customer"),pageSize:1});assert.ok(first.nextPage);
 assert.throws(()=>composeProjection(many,{...query("query","provider"),pageSize:1,after:first.nextPage}),/CURSOR_INVALID/);
 assert.equal(composeProjection(many,{...query("query","customer"),pageSize:1,after:first.nextPage}).entries.length,1);
});
test("H5-011 C04/C08: pure D020 service interval and missing reference remain pending",()=>{
 const reference=civilReference({scope:"service",scopeId:id},localDate("2026-11-20"),zoneEvidence("Europe/Madrid","synthetic-zone","1"),"synthetic-service","1");
 for(const [day,expected] of [[13,"at_least_7"],[14,"at_least_3"],[17,"at_least_3"],[18,"under_3"]] as const){
  for(const hour of ["00:00:00+01:00","23:59:59+01:00"]){const x=projectCivilReference(reference,`2026-11-${day}T${hour}`);assert.equal(x.evaluation?.interval,expected);}
 }
 assert.equal(projectCivilReference(null,null).certainty,"pending");
});
test("H5-011 C04: cancellation output preserves four accredited decisions without calculating amounts",()=>{
 for(const [day,interval,right,retention] of [[13,"at_least_7","200.00","0.00"],[14,"at_least_3","100.00","100.00"],[17,"at_least_3","100.00","100.00"],[18,"under_3","0.00","200.00"]]){
  const state={revision:day,after_data:{facts:{reference:{date:"2026-11-20",scope:"service",scopeId:id}},computed:{status:"determined",temporal:{actDate:`2026-11-${day}`,interval},right,retention}}};
  const result=cancellationProjection(state);assert.equal(result.right,right);assert.equal(result.retention,retention);assert.equal(result.temporal,state.after_data.computed.temporal);
 }
 assert.equal(cancellationProjection({after_data:{computed:{status:"pending",right:null}}}).right,null);
});
test("H5-011 query rejects undeclared authority and input fields",()=>{
 assert.throws(()=>validateProjectionQuery({...query(),authority:true} as ProjectionQuery),/INPUT_INVALID/);
 assert.throws(()=>validateProjectionQuery({...query(),destination:"owner"} as unknown as ProjectionQuery),/INPUT_INVALID/);
 assert.throws(()=>validateProjectionQuery({...query(),pageSize:0}),/INPUT_INVALID/);
});
