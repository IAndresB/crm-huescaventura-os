import assert from "node:assert/strict";
import {test} from "node:test";
import {captureCalculation,moneyDifference,reconstructCalculation} from "../src/domain/exact-money.ts";
import {decideProposal,type ProposalContent} from "../src/domain/proposal-version.ts";
const trace={sourceRef:"synthetic-source",calculationRef:"synthetic-composition",configurationVersions:[{kind:"tariff",id:"synthetic-version",version:"1"}],reason:"synthetic-calculation"};
test("H2 composition reuses H1 exact rational arithmetic and reproducible trace",()=>{
 const c=captureCalculation({kind:"composition",components:[{amount:"900.00",quantity:"1"},{amount:"10.005",quantity:"2"}],participants:10},trace);
 assert.equal((c.output as any).amount,"92.00");assert.deepEqual(reconstructCalculation(c),c.output);assert.equal(moneyDifference("100.01","90.00"),"10.01");
});
test("H2 guard returns explicit IDs and no side effects",()=>{
 const d=decideProposal({scope:"",terms:{version:"",text:"",sourceRef:""},pending:[],modalities:[]} as ProposalContent,true);
 assert.equal(d.allowed,false);assert.ok(d.ids.includes("SM-PV-02"));assert.deepEqual(d.blockers,["scope-sources-pending","terms-reproducible","composition-required"]);
});
