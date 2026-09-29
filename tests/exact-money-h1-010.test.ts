import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {resolve} from "node:path";
import {
  MONEY_ALGORITHM_VERSION,allocate,captureCalculation,fixedGroupPrice,materialize,
  participationRights,perPersonTotal,percentageSplit,reconstructCalculation,
  remainingRight,requireKnownMoneyFacts,reverseExact,selectManualFinalPrice,
  type MoneyTrace,
} from "../src/domain/exact-money.ts";

const evidence:MoneyTrace={sourceRef:"formal-synthetic-source",calculationRef:"formal-R",
  configurationVersions:[{kind:"unit",id:"synthetic-person",version:"1"},
    {kind:"tariff",id:"synthetic-rate",version:"2026-a"}],reason:"formal-evaluation"};
const ordered=(weights:readonly string[])=>weights.map((weight,i)=>
  ({id:["A","B","C","D","E"][i]!,order:i,weight}));

test("H1-010 R01-R06 and R10: independent approved monetary oracles",()=>{
  const p=materialize("10.005",evidence),n=materialize("-10.005",evidence);
  assert.deepEqual([p.exact.decimal,p.amount,p.difference.decimal],["10.005","10.01","0.005"]);
  assert.deepEqual([n.exact.decimal,n.amount,n.difference.decimal],["-10.005","-10.01","-0.005"]);
  assert.equal(perPersonTotal("100.01",10,evidence).amount,"1000.10");
  const deposit=percentageSplit("1000.01","50",evidence);
  assert.deepEqual([deposit.internal.decimal,deposit.applied.amount,deposit.remainder],
    ["500.005","500.01","500.00"]);
  const right=percentageSplit("100.01","50",evidence);
  assert.deepEqual([right.internal.decimal,right.applied.amount,right.remainder],
    ["50.005","50.01","50.00"]);
  const three=participationRights("100.01",3,"50",evidence);
  assert.deepEqual([three.each.applied.amount,three.total,three.bases,three.remainders],
    ["50.01","150.03","300.03","150.00"]);
  assert.notEqual(three.total,percentageSplit("300.03","50",evidence).applied.amount);
  assert.equal(remainingRight("50.01",["20.00"]),"30.01");
  assert.equal(remainingRight("50.01",["20.00","30.01"]),"0.00");
});
test("H1-010 R07-R09: fixed price, exact reverse and retained history",()=>{
  for(const count of [1,2,10,100]) assert.equal(fixedGroupPrice("900.00",10,count),"900.00");
  const reversalA=reverseExact("fixed-advance","500.01","formal-undo");
  const reversalB=reverseExact("fixed-outflow","-20.00","formal-undo");
  assert.deepEqual([reversalA.amount,reversalB.amount],["-500.01","20.00"]);
  assert.deepEqual([reversalA.originalRef,reversalA.reason],["fixed-advance","formal-undo"]);
  const recorded=[
    {kind:"per_person" as const,finalPersonPrice:"100.01",participations:10},
    {kind:"percentage" as const,base:"1000.01",percent:"50"},
    {kind:"percentage" as const,base:"100.01",percent:"50"},
    {kind:"participations" as const,baseEach:"100.01",participations:3,percent:"50"},
    {kind:"remaining" as const,fixedRight:"50.01",paid:["20.00"]},
    {kind:"fixed" as const,total:"900.00",previousParticipants:10,currentParticipants:7},
    {kind:"reversal" as const,originalRef:"fixed-advance",originalAmount:"500.01",reason:"formal-undo"},
  ].map(input=>captureCalculation(input,evidence));
  for(const record of recorded){
    assert.equal(record.algorithmVersion,MONEY_ALGORITHM_VERSION);
    assert.equal(record.trace.configurationVersions[1]?.version,"2026-a");
    assert.deepEqual(reconstructCalculation(record),record.output);
  }
  const latest={...evidence,configurationVersions:[{kind:"tariff",id:"synthetic-rate",version:"2026-b"}]};
  assert.equal(latest.configurationVersions[0]?.version,"2026-b");
  assert.equal(recorded[0]?.trace.configurationVersions[1]?.version,"2026-a");
  assert.throws(()=>reconstructCalculation({...recorded[0]!,output:"0.00"}),/MONEY_HISTORY_MISMATCH/);
});
test("H1-010 R11-R13/R16: registered order, larger remainders and negative sign",()=>{
  const equal=allocate("100.00",ordered(["1","1","1"]),evidence);
  const unequal=allocate("0.05",ordered(["1","1","2"]),evidence);
  assert.deepEqual(equal.parts.map(x=>x.amount),["33.34","33.33","33.33"]);
  assert.deepEqual(equal.parts.map(x=>x.residualCents),["1","0","0"]);
  assert.deepEqual(unequal.parts.map(x=>x.internal.decimal),["0.0125","0.0125","0.025"]);
  assert.deepEqual(unequal.parts.map(x=>x.fullCents),["1","1","2"]);
  assert.deepEqual(unequal.parts.map(x=>x.remainder.decimal),["0.0025","0.0025","0.005"]);
  assert.deepEqual(unequal.parts.map(x=>x.amount),["0.01","0.01","0.03"]);
  assert.deepEqual(allocate("-100.00",ordered(["1","1","1"]),evidence).parts.map(x=>x.amount),
    ["-33.34","-33.33","-33.33"]);
  assert.deepEqual(allocate("-0.05",ordered(["1","1","2"]),evidence).parts.map(x=>x.amount),
    ["-0.01","-0.01","-0.03"]);
  const twoResidual=allocate("0.05",ordered(["1","1","1"]),evidence);
  assert.deepEqual(twoResidual.parts.map(x=>x.amount),["0.02","0.02","0.01"]);
  const reversed=allocate("0.01",[{id:"C",order:2,weight:"1"},
    {id:"B",order:1,weight:"1"},{id:"A",order:0,weight:"1"}],evidence);
  assert.deepEqual(reversed.parts.map(x=>x.id),["A","B","C"]);
  assert.deepEqual(reversed.parts.map(x=>x.amount),["0.01","0.00","0.00"]);
  for(const cents of [1,2,5,17,10001,999999]){
    const value=`${Math.floor(cents/100)}.${String(cents%100).padStart(2,"0")}`;
    const split=allocate(value,ordered(["1","2","3"]),evidence);
    const sum=split.parts.reduce((n,p)=>n+BigInt(p.amount.replace(".","")),0n);
    assert.equal(sum,BigInt(cents));
    assert.deepEqual(allocate(value,ordered(["1","2","3"]),evidence),split);
  }
});
test("H1-010 R14-R15/R17-R18: malformed, unknown and manual authority fail closed",()=>{
  assert.equal(materialize("0",evidence).amount,"0.00");
  assert.equal(materialize("2.004",evidence).amount,"2.00");
  assert.equal(materialize("2.005",evidence).amount,"2.01");
  assert.equal(materialize("-2.005",evidence).amount,"-2.01");
  assert.equal(materialize("9007199254740993.005",evidence).amount,"9007199254740993.01");
  for(const invalid of ["1e2","0,01"," 0.01","+0.01",".01","1.","NaN"])
    assert.throws(()=>materialize(invalid,evidence),/MONEY_INPUT_INVALID/);
  assert.throws(()=>allocate("0.01",ordered(["1","0"]),evidence),/MONEY_INPUT_INVALID/);
  assert.throws(()=>allocate("0.01",[{id:"A",order:0,weight:"1"},
    {id:"B",order:0,weight:"1"}],evidence),/MONEY_INPUT_INVALID/);
  assert.throws(()=>allocate("0.01",[{id:"A",order:0,weight:"1"},
    {id:"A",order:1,weight:"1"}],evidence),/MONEY_INPUT_INVALID/);
  assert.deepEqual(requireKnownMoneyFacts([{name:"tariff",value:"0"},{name:"cost",value:null},
    {name:"tax-treatment",value:null}]),
    {ready:false,blockers:["cost","tax-treatment"]});
  assert.deepEqual(requireKnownMoneyFacts([{name:"tariff",value:"0"},
    {name:"tax-treatment",kind:"verified_reference",value:"fixture-tax-treatment-v1"}]),
    {ready:true,blockers:[]});
  assert.throws(()=>requireKnownMoneyFacts([{name:"tax-treatment",kind:"verified_reference",
    value:"unknown"}]),/MONEY_INPUT_INVALID/);
  const manual=selectManualFinalPrice("99.99","100.01","synthetic-admin",
    "2026-09-29T12:00:00Z","approved-manual-final",evidence);
  assert.deepEqual([manual.calculated,manual.final,manual.actorRef,manual.reason],
    ["99.99","100.01","synthetic-admin","approved-manual-final"]);
  assert.throws(()=>selectManualFinalPrice("99.99","100.01","",
    "2026-09-29T12:00:00Z","approved-manual-final",evidence),/MONEY_INPUT_INVALID/);
});
test("H1-010 R19-R20: pure domain has no framework, SQL or binary money operators",()=>{
  const source=readFileSync(resolve(import.meta.dirname,"../src/domain/exact-money.ts"),"utf8");
  assert.doesNotMatch(source,/\bfrom\s+["'](?:next|postgres|@supabase)/);
  assert.doesNotMatch(source,/parseFloat|Math\.round|toFixed/);
  const record=captureCalculation({kind:"allocation",total:"0.05",parts:ordered(["1","1","2"])},evidence);
  assert.deepEqual(reconstructCalculation(record),record.output);
  assert.equal(record.algorithmVersion,MONEY_ALGORITHM_VERSION);
});
