import assert from "node:assert/strict";
import {test} from "node:test";
import {
  allocate,captureCalculation,fixedGroupPrice,materialize,participationRights,
  perPersonTotal,percentageSplit,reconstructCalculation,remainingRight,
  requireKnownMoneyFacts,reverseExact,selectManualFinalPrice,
  type MoneyTrace,
} from "../src/domain/exact-money.ts";

const trace:MoneyTrace={sourceRef:"fixture-approved",calculationRef:"fixture-calc",
  configurationVersions:[{kind:"tariff",id:"fixture-tariff",version:"v1"}],reason:"fixture-proof"};
const parts=(weights:readonly string[])=>weights.map((weight,i)=>({id:String.fromCharCode(65+i),order:i,weight}));

test("H1-009 PM-01 / PM-10: exact positive and symmetric negative half cents",()=>{
  const positive=materialize("10.005",trace),negative=materialize("-10.005",trace);
  assert.equal(positive.exact.decimal,"10.005");assert.equal(positive.amount,"10.01");
  assert.equal(positive.difference.decimal,"0.005");
  assert.equal(negative.exact.decimal,"-10.005");assert.equal(negative.amount,"-10.01");
  assert.equal(negative.difference.decimal,"-0.005");
});
test("H1-009 PM-02: fixed final per-person price is multiplied before any new decision",()=>{
  const value=perPersonTotal("100.01",10,trace);
  assert.equal(value.amount,"1000.10");assert.equal(value.difference.decimal,"0");
});
test("H1-009 PM-03 / PM-04: only the right is rounded, complement is difference",()=>{
  const advance=percentageSplit("1000.01","50",trace);
  const refund=percentageSplit("100.01","50",trace);
  assert.deepEqual([advance.internal.decimal,advance.applied.amount,advance.remainder],
    ["500.005","500.01","500.00"]);
  assert.deepEqual([refund.internal.decimal,refund.applied.amount,refund.remainder],
    ["50.005","50.01","50.00"]);
  assert.equal(advance.applied.difference.decimal,"0.005");
});
test("H1-009 PM-05: independent participations precede addition",()=>{
  const rights=participationRights("100.01",3,"50",trace);
  assert.deepEqual([rights.each.applied.amount,rights.total,rights.bases,rights.remainders],
    ["50.01","150.03","300.03","150.00"]);
  assert.equal(percentageSplit("300.03","50",trace).applied.amount,"150.02");
});
test("H1-009 PM-06: payouts reduce a fixed right without recalculation",()=>{
  assert.equal(remainingRight("50.01",["20.00"]),"30.01");
  assert.equal(remainingRight("50.01",["20.00","30.01"]),"0.00");
  assert.throws(()=>remainingRight("50.01",["50.02"]),/MONEY_INPUT_INVALID/);
});
test("H1-009 PM-07: fixed/group total does not vary with attendance",()=>{
  assert.equal(fixedGroupPrice("900.00",10,8),"900.00");
  assert.equal(fixedGroupPrice("900.00",8,10),"900.00");
});
test("H1-009 PM-08: reversals invert the materialized original",()=>{
  assert.deepEqual([reverseExact("advance","500.01","undo").amount,
    reverseExact("outflow","-20.00","undo").amount],["-500.01","20.00"]);
  assert.equal(reverseExact("half","10.01","undo").amount,"-10.01");
  assert.equal(materialize("-10.005",trace).amount,"-10.01");
  assert.throws(()=>reverseExact("","500.01","undo"),/MONEY_INPUT_INVALID/);
});
test("H1-009 PM-09: captured bases/configuration reproduce after current config changes",()=>{
  const variants=[
    {kind:"per_person" as const,finalPersonPrice:"100.01",participations:10},
    {kind:"percentage" as const,base:"1000.01",percent:"50"},
    {kind:"participations" as const,baseEach:"100.01",participations:3,percent:"50"},
    {kind:"remaining" as const,fixedRight:"50.01",paid:["20.00"]},
    {kind:"fixed" as const,total:"900.00",previousParticipants:10,currentParticipants:8},
    {kind:"reversal" as const,originalRef:"advance",originalAmount:"500.01",reason:"undo"},
  ];
  const records=variants.map(v=>captureCalculation(v,trace));
  const later={...trace,configurationVersions:[{kind:"tariff",id:"fixture-tariff",version:"v2"}]};
  assert.equal(later.configurationVersions[0]?.version,"v2");
  for(const record of records){
    assert.equal(record.trace.configurationVersions[0]?.version,"v1");
    assert.deepEqual(reconstructCalculation(record),record.output);
  }
  const tampered={...records[0]!,output:"0.00"};
  assert.throws(()=>reconstructCalculation(tampered),/MONEY_HISTORY_MISMATCH/);
});
test("H1-009 PM-11: equal residual cents follow registered order",()=>{
  const result=allocate("100.00",parts(["1","1","1"]),trace);
  assert.deepEqual(result.parts.map(p=>p.amount),["33.34","33.33","33.33"]);
  assert.deepEqual(result.parts.map(p=>p.residualCents),["1","0","0"]);
});
test("H1-009 PM-12: weighted largest remainder and evidence",()=>{
  const result=allocate("0.05",parts(["1","1","2"]),trace);
  assert.deepEqual(result.parts.map(p=>p.internal.decimal),["0.0125","0.0125","0.025"]);
  assert.deepEqual(result.parts.map(p=>p.fullCents),["1","1","2"]);
  assert.deepEqual(result.parts.map(p=>p.remainder.decimal),["0.0025","0.0025","0.005"]);
  assert.deepEqual(result.parts.map(p=>p.residualCents),["0","0","1"]);
  assert.deepEqual(result.parts.map(p=>p.amount),["0.01","0.01","0.03"]);
});
test("H1-009 PM-13: negative allocations preserve magnitude order and remainder",()=>{
  const equal=allocate("-100.00",parts(["1","1","1"]),trace);
  const weighted=allocate("-0.05",parts(["1","1","2"]),trace);
  assert.deepEqual(equal.parts.map(p=>p.amount),["-33.34","-33.33","-33.33"]);
  assert.deepEqual(weighted.parts.map(p=>p.amount),["-0.01","-0.01","-0.03"]);
  assert.deepEqual(weighted.parts.map(p=>p.remainder.decimal),["0.0025","0.0025","0.005"]);
});
test("H1-009 zero, non-half and exactness at large valid magnitudes",()=>{
  assert.equal(materialize("0",trace).amount,"0.00");
  assert.equal(materialize("1.0049",trace).amount,"1.00");
  assert.equal(materialize("-1.0049",trace).amount,"-1.00");
  assert.equal(materialize("1.005",trace).amount,"1.01");
  assert.equal(materialize("-1.005",trace).amount,"-1.01");
  assert.equal(materialize("999999999999999999999999.995",trace).amount,
    "1000000000000000000000000.00");
  assert.equal(perPersonTotal("999999999999999999.99",999999,trace).amount,
    "999998999999999999990000.01");
});
test("H1-009 allocation rejects invalid weights, order and unknown bases",()=>{
  for(const invalid of ["0","-1","NaN","1e2",""])
    assert.throws(()=>allocate("1.00",parts(["1",invalid]),trace),/MONEY_INPUT_INVALID/);
  assert.throws(()=>allocate("1.00",[{id:"A",order:0,weight:"1"},
    {id:"B",order:0,weight:"1"}],trace),/MONEY_INPUT_INVALID/);
  assert.throws(()=>allocate("1.00",[{id:"A",order:0,weight:"1"},
    {id:"A",order:1,weight:"1"}],trace),/MONEY_INPUT_INVALID/);
  assert.throws(()=>allocate("1.00",[],trace),/MONEY_INPUT_INVALID/);
  assert.deepEqual(requireKnownMoneyFacts([{name:"cost",value:null},{name:"tax",value:null}]),
    {ready:false,blockers:["cost","tax"]});
  assert.deepEqual(requireKnownMoneyFacts([{name:"cost",value:"0"}]),{ready:true,blockers:[]});
});
test("H1-009 invalid decimal strings and cent-only inputs fail closed",()=>{
  for(const invalid of ["1,00","1e2"," 1.00","+1.00",".5","1.","Infinity","NaN",""])
    assert.throws(()=>materialize(invalid,trace),/MONEY_INPUT_INVALID/);
  assert.throws(()=>perPersonTotal("100.005",10,trace),/MONEY_INPUT_INVALID/);
  assert.throws(()=>remainingRight("10.005",[]),/MONEY_INPUT_INVALID/);
  assert.throws(()=>percentageSplit("10.00","101",trace),/MONEY_INPUT_INVALID/);
});
test("H1-009 manual final remains distinct with actor, time and reason",()=>{
  const selected=selectManualFinalPrice("100.00","100.01","fixture-actor",
    "2026-09-29T10:00:00Z","fixture-decision",trace);
  assert.deepEqual([selected.calculated,selected.final],["100.00","100.01"]);
  assert.equal(selected.actorRef,"fixture-actor");
  assert.throws(()=>selectManualFinalPrice("100.00","100.01","",
    "2026-09-29T10:00:00Z","fixture-decision",trace),/MONEY_INPUT_INVALID/);
});
