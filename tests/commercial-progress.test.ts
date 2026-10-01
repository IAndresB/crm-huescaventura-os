import assert from "node:assert/strict";
import {test} from "node:test";
import {decideCreation,decideProgress,lossReasons,type CommercialMaterial} from "../src/domain/commercial-progress.ts";
const m:CommercialMaterial={contact:{channel:"manual",address:"synthetic",sourceRef:"synthetic",valid:true},need:"event",commercialPossible:true,pending:[]};
test("H2 creation requires exactly the three commercial minima",()=>{
 assert.equal(decideCreation(m).destination,"Nueva");
 for(const x of [{...m,contact:null},{...m,need:null},{...m,commercialPossible:false}]) assert.equal(decideCreation(x).allowed,false);
 assert.equal(decideCreation({...m,dates:null,participants:null,services:null,budget:null}).allowed,true);
});
test("H2 progress and loss retain the approved vocabulary",()=>{
 assert.equal(decideProgress("Nueva",{type:"define_need",sourceRef:"manual",need:"event",scope:"event",pending:[]}).destination,"Necesidad definida");
 for(const lossReason of lossReasons) assert.equal(decideProgress("Nueva",{type:"lose",sourceRef:"manual",lossReason,context:"cause"}).destination,"Perdida");
 assert.equal(decideProgress("Nueva",{type:"lose",sourceRef:"manual",context:"cause"}).allowed,false);
});
test("H2 pause, reactivation and backward need current support",()=>{
 assert.equal(decideProgress("Nueva",{type:"pause",sourceRef:"manual",decision:"pause",context:"reason",followup:"review"}).destination,"En pausa");
 assert.equal(decideProgress("Perdida",{type:"reactivate",sourceRef:"manual",interest:"new",review:"current",destination:"En contacto",support:{contact:"current"}}).allowed,true);
 assert.equal(decideProgress("Perdida",{type:"reactivate",sourceRef:"manual",interest:"new",review:"current",destination:"Aceptada / Ganada",support:{contact:"current"}}).allowed,false);
});
test("H2 excludes future Proposal/Version and positive Acceptance",()=>{
 assert.deepEqual(decideProgress("Nueva",{type:"prepare",sourceRef:"manual",scope:"event",sufficient:true,alternativeRef:"a",pending:[]}).blockers,["proposal-capability-pending-H2-003"]);
 assert.equal(decideProgress("Nueva",{type:"send",sourceRef:"manual",versionRef:"v1",communicationId:"c",sendEvidenceRef:"e"}).allowed,false);
 assert.equal(decideProgress("Nueva",{type:"win",sourceRef:"manual"}).allowed,false);
});
