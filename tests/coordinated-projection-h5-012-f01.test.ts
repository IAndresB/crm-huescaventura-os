import {test} from "node:test";
import assert from "node:assert/strict";
import {composeProjection,type CanonicalProjectionFrame,type ProjectionQuery} from "../src/domain/coordinated-projection.ts";

test("H5-012-F01: current-night provenance, dates and input frames survive composition and external minimization",()=>{
 const contextId="a1111111-1111-4111-8111-111111111111";
 const q:ProjectionQuery={contextKind:"booking",contextId,surface:"calendar",destination:"administrator"};
 const data={night_id:"synthetic-night",night_date:"2026-10-23",service_id:"synthetic-service"};
 const frame:CanonicalProjectionFrame={contextKind:"booking",contextId,facts:[{kind:"b04_current_nights",data}],calendar:[],commercial:[]};
 const before=structuredClone(frame),result=composeProjection(frame,q);
 assert.equal(result.entries.length,1);
 const night=result.entries[0] as {source:string;certainty:string;data:typeof data};
 assert.equal(night.source,"crm_private.b04_current_nights");assert.equal(night.data.night_date,"2026-10-23");
 assert.equal(night.certainty,"verified");assert.equal(result.mutationAuthority,false);
 for(const destination of ["customer","provider","ai"] as const){assert.deepEqual(composeProjection(frame,{...q,destination}).entries,[]);}
 assert.deepEqual(frame,before);
});
