import assert from "node:assert/strict";
import {test} from "node:test";
import {evaluateTaskDeadline,validateDeadline,canonicalTask,type TaskDeadline} from "../src/domain/pending-task.ts";
import {civilReference,localDate,zoneEvidence} from "../src/domain/civil-time.ts";

test("pending task: unknown never invents a deadline or becomes overdue",()=>{
 assert.deepEqual(evaluateTaskDeadline({kind:"unknown",reason:"not determined"},{}),{known:false,overdue:false});
 assert.throws(()=>validateDeadline({kind:"unknown",reason:"not determined",date:"2028-01-01"} as unknown as TaskDeadline));
});
test("pending task: civil date needs an explicit calendar reference, with entire last day",()=>{
 const date={kind:"civil" as const,date:"2028-02-29",sourceRef:"synthetic-authorized-date",version:"1"};
 assert.equal(evaluateTaskDeadline(date,{date:"2028-02-29"}).overdue,false);
 assert.equal(evaluateTaskDeadline(date,{date:"2028-03-01"}).overdue,true);
 assert.throws(()=>evaluateTaskDeadline(date,{instant:"2028-02-29T23:59:59Z"}),/REFERENCE_UNKNOWN/);
 assert.throws(()=>validateDeadline({...date,time:"00:00:00"} as unknown as TaskDeadline));
});
test("pending task: D020 evaluation conserves explicit scope, zone, source and algorithm",()=>{
 const reference=civilReference({scope:"night",scopeId:"synthetic-night"},localDate("2028-04-02"),zoneEvidence("Europe/Madrid","synthetic-zone","1"),"synthetic-source","1");
 const deadline={kind:"d020" as const,reference,daysBefore:7,sourceRef:"D020-synthetic",version:"1"};
 const result=evaluateTaskDeadline(deadline,{date:"2028-03-26"});
 assert.equal(result.overdue,false);assert.equal(result.evaluation?.lastAllowedDate,"2028-03-26");
 assert.equal(result.evaluation?.evaluation.algorithmVersion,"h1-civil-d020-v1");
 assert.deepEqual(result.evaluation?.evaluation.reference,reference);
});
test("pending task: explicit instants retain equality and canonical input ignores property order",()=>{
 const deadline={kind:"instant" as const,at:"2028-01-01T01:00:00+01:00",sourceRef:"synthetic-hour-contract",version:"1"};
 assert.equal(evaluateTaskDeadline(deadline,{instant:"2028-01-01T00:00:00Z"}).overdue,false);
 assert.equal(evaluateTaskDeadline(deadline,{instant:"2028-01-01T00:00:01Z"}).overdue,true);
 assert.equal(canonicalTask({b:{y:1,x:2},a:0}),canonicalTask({a:0,b:{x:2,y:1}}));
});
