import {test} from "node:test";
import assert from "node:assert/strict";
import {BoundaryError,ManualExternalBoundaryDouble,type BoundaryAuthority,type ExternalEvent,type IntegrationSource} from "../src/domain/external-boundary.ts";
const source=(id:string,kind:IntegrationSource["kind"]="other",enabled=true):IntegrationSource=>({id,kind,label:`synthetic ${id}`,provenance:`fixture:${id}`,verifiedCapabilities:[],enabled});
const authority=(context="booking-1",coverage="service-1",permission:BoundaryAuthority["permission"]="boundary:receive",actor="admin-a"):BoundaryAuthority=>({actor,purpose:"external-boundary",context,coverage,permission});
const event=(id:string,operationId:string,changes:Partial<ExternalEvent>={}):ExternalEvent=>({id,operationId,sourceId:"s1",externalKey:"provider-event-1",context:"booking-1",coverage:"service-1",occurredAt:"2026-10-08T10:00:00Z",receivedAt:"2026-10-08T10:05:00Z",payload:{amount:"100.00",currency:"EUR"},provenance:"synthetic-source-record",review:"pending",...changes});
function seed(kind:IntegrationSource["kind"]="other") {const d=new ManualExternalBoundaryDouble();d.registerSource(source("s1",kind));d.registerReference({id:"ref1",sourceId:"s1",externalKey:"booking-1",context:"booking-1",coverage:"service-1",authority:"reference_only",recordedAt:"2026-10-08T10:00:00Z"},authority());return d;}

test("H5-009 equivalent repeated event retains both receipts and one canonical result",()=>{
 const d=seed(),first=d.receive(event("evt1","op1"),authority());
 const repeated=d.receive(event("evt2","op2",{receivedAt:"2026-10-08T10:06:00Z",provenance:"synthetic-redelivery"}),authority());
 assert.equal(first.id,"evt1");assert.equal(repeated.id,"evt2");assert.equal(repeated.resultRef,first.resultRef);assert.equal(d.snapshot().events.length,2);
});
test("H5-009 repeated event with a replacement reference retains the raw reference and links to the canonical event",()=>{
 const d=seed();d.registerReference({id:"ref2",sourceId:"s1",externalKey:"booking-2",context:"booking-1",coverage:"service-1",replacesId:"ref1",authority:"reference_only",recordedAt:"2026-10-08T11:00:00Z"},authority());
 const first=d.receive(event("evt1","op1",{referenceId:"ref1"}),authority());
 const repeat=d.receive(event("evt2","op2",{referenceId:"ref2",receivedAt:"2026-10-08T10:06:00Z",provenance:"synthetic-redelivery"}),authority());
 assert.equal(repeat.review,"pending");assert.equal(first.resultRef,"evt1");assert.equal(repeat.resultRef,"evt1");
 assert.equal(d.snapshot().events.find(x=>x.id==="evt2")?.referenceId,"ref2");assert.equal(d.snapshot().references.length,2);
});
test("H5-009 stale event is retained without changing a current projection",()=>{
 const d=seed();d.receive(event("evt-new","op-new",{externalKey:"new",occurredAt:"2026-10-08T11:00:00Z",payload:{state:"current"}}),authority());
 d.receive(event("evt-old","op-old",{externalKey:"old",occurredAt:"2026-10-08T09:00:00Z",payload:{state:"old"}}),authority());
 assert.equal(d.snapshot().events.length,2);assert.equal(d.snapshot().events.find(x=>x.id==="evt-old")?.review,"pending");
});
test("H5-009 own-action echo is correlated and cannot create a second action",()=>{
 const d=seed();d.recordIntent("own-op-1","s1","booking-1","service-1",authority("booking-1","service-1","boundary:send"));
 const e=d.receive(event("evt1","op1",{echoOfOperationId:"own-op-1"}),authority());
 assert.equal(e.echoRecognized,true);assert.equal(e.review,"pending");assert.equal(d.snapshot().intents.length,1);
});
test("H5-009 material conflict under same external key returns E2 and preserves original",()=>{
 const d=seed();d.receive(event("evt1","op1"),authority());
 assert.throws(()=>d.receive(event("evt2","op2",{payload:{amount:"101.00",currency:"EUR"}}),authority()),(e:unknown)=>e instanceof BoundaryError&&e.code==="E2");
 assert.equal(d.snapshot().events.length,1);
});
test("H5-009 event without reliable identity goes to review rather than fuzzy dedup",()=>{
 const d=seed();const e=d.receive(event("evt1","op1",{externalKey:undefined}),authority());assert.equal(e.review,"review");
 const second=d.receive(event("evt2","op2",{externalKey:undefined,payload:{amount:"100.00",currency:"EUR"}}),authority());assert.equal(second.id,"evt2");assert.equal(d.snapshot().events.length,2);
});
test("H5-009 authorized reference replacement preserves old reference and authority",()=>{
 const d=seed();const next=d.registerReference({id:"ref2",sourceId:"s1",externalKey:"booking-2",context:"booking-1",coverage:"service-1",replacesId:"ref1",authority:"reference_only",recordedAt:"2026-10-08T11:00:00Z"},authority());
 assert.equal(next.replacesId,"ref1");assert.equal(d.snapshot().references.length,2);assert.equal(d.snapshot().references[0]?.authority,"reference_only");
});
test("H5-009 failed S1 does not block independent S2",()=>{
 const d=new ManualExternalBoundaryDouble();d.registerSource(source("s1","other",false));d.registerSource(source("s2"));
 assert.throws(()=>d.receive(event("e1","o1"),authority()),/BOUNDARY_SOURCE_UNAVAILABLE/);
 assert.equal(d.receive(event("e2","o2",{sourceId:"s2"}),authority()).id,"e2");
});
test("H5-009 uncertain outcome is not resent; late simulated result reconciles original",()=>{
 const d=seed();d.recordIntent("send-1","s1","booking-1","service-1",authority("booking-1","service-1","boundary:send"));
 d.recordOutcome("send-1",{state:"uncertain",resultRef:"simulated-timeout",effectMayHaveOccurred:true},authority("booking-1","service-1","boundary:send"));
 assert.throws(()=>d.recordOutcome("send-1",{state:"accepted_simulated",resultRef:"second-send",effectMayHaveOccurred:true},authority("booking-1","service-1","boundary:send")),/E2/);
 d.reconcile("send-1",{state:"accepted_simulated",resultRef:"late-original-result",effectMayHaveOccurred:true},authority("booking-1","service-1","boundary:review"));
 assert.equal(d.snapshot().outcomes.length,1);assert.equal(d.snapshot().outcomes[0]?.resultRef,"late-original-result");assert.equal(d.snapshot().outcomes[0]?.simulated,true);
 assert.equal(d.snapshot().intents[0]?.simulated,true);assert.deepEqual(d.snapshot().sources[0]?.verifiedCapabilities,[]);
});
test("H5-009 source/channel failure is isolated; S2 event remains available",()=>{
 const d=new ManualExternalBoundaryDouble();d.registerSource(source("s1","other",false));d.registerSource(source("s2"));
 assert.throws(()=>d.receive(event("e1","o1"),authority()),(e:unknown)=>e instanceof BoundaryError&&e.code==="BOUNDARY_SOURCE_UNAVAILABLE");
 const e=d.receive(event("e2","o2",{sourceId:"s2"}),authority());assert.equal(e.id,"e2");
});
for(const [name,auth] of [
 ["actor",authority("booking-1","service-1","boundary:receive","")],
 ["purpose",{...authority(),purpose:"payment"}],
 ["permission",authority("booking-1","service-1","boundary:send")],
 ["context",authority("other-context")],
 ["coverage",authority("booking-1","other-coverage")],
] as const) test(`H5-009 denies wrong ${name} without side effects`,()=>{
 const d=seed();assert.throws(()=>d.receive(event("evt1","op1"),auth),(e:unknown)=>e instanceof BoundaryError&&e.code==="BOUNDARY_DENIED");assert.deepEqual(d.snapshot().events,[]);
});
test("H5-009 calendar and Avaibook events remain review-only",()=>{
 for(const kind of ["calendar","avaibook"] as const){const d=seed(kind),e=d.receive(event(`evt-${kind}`,`op-${kind}`),authority());assert.equal(e.review,"review");assert.deepEqual(d.snapshot().intents,[]);}
});
test("H5-009 doubles own independent state",()=>{const a=seed(),b=seed();a.receive(event("evt1","op1"),authority());assert.equal(a.snapshot().events.length,1);assert.equal(b.snapshot().events.length,0);});
