import assert from "node:assert/strict";
import {test} from "node:test";
import {
  civilDaysBetween,civilReference,dateAtInstant,evaluateCivil,evaluateCivilDeadline,
  evaluateInstant,explicitHourlyDeadline,hourlyDeadlineExpired,instant,localDate,
  reevaluateCivil,selectReference,shiftCivilDate,zoneEvidence,
} from "../src/domain/civil-time.ts";

const madrid=zoneEvidence("Europe/Madrid","fixture-contract-zone","v1");
const utc=zoneEvidence("UTC","fixture-other-zone","v1");
const ref=(scope:"global"|"modality"|"service"|"night",scopeId:string,date:string,
  zone=madrid,basis:"default"|"express_contract"="default")=>
  civilReference({scope,scopeId},localDate(date),zone,`fixture-${scope}-${scopeId}`,"v1",basis);
const service20=ref("service","S1","2026-06-20");

test("H1-011 E01/E02: inclusive 7/3 civil boundaries and full last day",()=>{
  assert.deepEqual([12,13,14,16,17,18].map(day=>evaluateCivil(service20,localDate(`2026-06-${day}`)).interval),
    ["at_least_7","at_least_7","at_least_3","at_least_3","at_least_3","under_3"]);
  for(const day of [12,13,14]){
    const result=evaluateCivilDeadline(service20,localDate(`2026-06-${day}`),7);
    assert.equal(result.lastAllowedDate,"2026-06-13");
    assert.equal(result.expired,day===14);
  }
  assert.equal(evaluateCivil(service20,localDate("2026-06-13")).daysBefore,7);
  assert.equal(evaluateCivil(service20,localDate("2026-06-17")).daysBefore,3);
});

test("H1-011 E03/E07: instant conversion has explicit zone, midnight and DST do not change civil arithmetic",()=>{
  const morning=evaluateInstant(service20,instant("2026-06-13T00:01:00+02:00"));
  const evening=evaluateInstant(service20,instant("2026-06-13T23:59:00+02:00"));
  assert.deepEqual([morning.daysBefore,evening.daysBefore],[7,7]);
  assert.equal(evaluateInstant(service20,instant("2026-06-14T00:01:00+02:00")).daysBefore,6);
  assert.equal(dateAtInstant(instant("2026-06-13T22:30:00Z"),madrid),"2026-06-14");
  assert.equal(dateAtInstant(instant("2026-06-13T22:30:00Z"),utc),"2026-06-13");
  const spring=ref("service","spring","2026-03-30");
  const autumn=ref("service","autumn","2026-10-26");
  assert.equal(evaluateCivil(spring,localDate("2026-03-29")).daysBefore,1);
  assert.equal(evaluateCivil(autumn,localDate("2026-10-25")).daysBefore,1);
  assert.equal(dateAtInstant(instant("2026-03-29T01:30:00Z"),madrid),"2026-03-29");
  assert.equal(dateAtInstant(instant("2026-10-25T01:30:00Z"),madrid),"2026-10-25");
  assert.throws(()=>zoneEvidence(null,"fixture","v1"),/CIVIL_INPUT_INVALID/);
  assert.throws(()=>zoneEvidence("invalid/zone","fixture","v1"),/CIVIL_INPUT_INVALID/);
});

test("H1-011 E04/E05: exact scope selection and historical reevaluation",()=>{
  const global=ref("global","B1","2026-06-20");
  const modality=ref("modality","B","2026-06-22");
  const night=ref("night","N1","2026-06-23");
  const list=[global,modality,service20,night];
  assert.deepEqual(list.map(r=>selectReference(list,{scope:r.scope,scopeId:r.scopeId}).date),
    ["2026-06-20","2026-06-22","2026-06-20","2026-06-23"]);
  assert.throws(()=>selectReference(list,{scope:"night",scopeId:"N2"}),/CIVIL_REFERENCE_UNKNOWN/);
  const override=ref("modality","B","2026-06-24",madrid,"express_contract");
  assert.equal(selectReference([...list,override],{scope:"modality",scopeId:"B"}).date,"2026-06-24");
  assert.equal(selectReference([...list,override],{scope:"global",scopeId:"B1"}).date,"2026-06-20");
  const before=evaluateCivil(service20,localDate("2026-06-13"));
  const next=ref("service","S1","2026-06-22");
  const change=reevaluateCivil(before,next,localDate("2026-06-13"),"fixture-admin",
    "changed-service-date",instant("2026-06-10T10:00:00Z"));
  assert.deepEqual([before.daysBefore,change.before.daysBefore,change.after.daysBefore],[7,7,9]);
  assert.equal(change.after.reference.sourceRef,"fixture-service-S1");
  assert.equal(before.reference.date,"2026-06-20");
  assert.throws(()=>reevaluateCivil(before,night,localDate("2026-06-13"),"actor","reason",
    instant("2026-06-10T10:00:00Z")),/CIVIL_INPUT_INVALID/);
});

test("H1-011 E06: Gregorian validation across month, year and leap day",()=>{
  assert.equal(shiftCivilDate(localDate("2024-02-28"),1),"2024-02-29");
  assert.equal(shiftCivilDate(localDate("2024-02-29"),1),"2024-03-01");
  assert.equal(shiftCivilDate(localDate("2026-12-31"),1),"2027-01-01");
  assert.equal(civilDaysBetween(localDate("2026-12-31"),localDate("2027-01-01")),1);
  assert.equal(civilDaysBetween(localDate("2024-02-28"),localDate("2024-03-01")),2);
  for(const bad of ["2023-02-29","2026-04-31","2026-13-01","0000-01-01","2026-6-20"])
    assert.throws(()=>localDate(bad),/CIVIL_INPUT_INVALID/);
});

test("H1-011 E08/E09: genuine external hour has evidence and distinct expiry",()=>{
  const deadline=explicitHourlyDeadline({scope:"service",scopeId:"S1",date:localDate("2026-06-13"),
    time:"15:00:00",zone:madrid,at:instant("2026-06-13T13:00:00Z"),
    sourceRef:"fixture-provider-terms",version:"v1"});
  assert.equal(hourlyDeadlineExpired(deadline,instant("2026-06-13T12:59:59Z")),false);
  assert.equal(hourlyDeadlineExpired(deadline,instant("2026-06-13T13:00:01Z")),true);
  assert.equal(evaluateCivilDeadline(service20,localDate("2026-06-13"),7).expired,false);
  assert.throws(()=>explicitHourlyDeadline({...deadline,time:"16:00:00"}),/CIVIL_INPUT_INVALID/);
  assert.throws(()=>explicitHourlyDeadline({...deadline,sourceRef:""}),/CIVIL_INPUT_INVALID/);
});
