import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {test} from "node:test";
import {
  CIVIL_ALGORITHM_VERSION,civilDaysBetween,civilReference,dateAtInstant,evaluateCivil,
  evaluateCivilDeadline,evaluateInstant,explicitHourlyDeadline,hourlyDeadlineExpired,
  instant,localDate,reevaluateCivil,selectReference,shiftCivilDate,zoneEvidence,
} from "../src/domain/civil-time.ts";

const zone=zoneEvidence("Europe/Madrid","formal-zone-evidence","2026-v1");
const make=(scope:"global"|"modality"|"service"|"night",scopeId:string,date:string,
  basis:"default"|"express_contract"="default")=>civilReference({scope,scopeId},localDate(date),
  zone,`formal-${scope}-${scopeId}`,"terms-v1",basis);
const service=make("service","S20","2026-06-20");

test("H1-012 R01-R04: literal date and full-day oracles",()=>{
  const expected:[string,number,string][]=[
    ["2026-06-12",8,"at_least_7"],["2026-06-13",7,"at_least_7"],
    ["2026-06-14",6,"at_least_3"],["2026-06-16",4,"at_least_3"],
    ["2026-06-17",3,"at_least_3"],["2026-06-18",2,"under_3"],
  ];
  for(const [day,count,band] of expected){const actual=evaluateCivil(service,localDate(day));
    assert.equal(actual.daysBefore,count);assert.equal(actual.interval,band);}
  assert.deepEqual(["2026-06-12","2026-06-13","2026-06-14"].map(d=>
    evaluateCivilDeadline(service,localDate(d),7).expired),[false,false,true]);
  const first=evaluateInstant(service,instant("2026-06-13T00:00:01+02:00"));
  const last=evaluateInstant(service,instant("2026-06-13T23:59:59+02:00"));
  const after=evaluateInstant(service,instant("2026-06-14T00:00:01+02:00"));
  assert.deepEqual([first.daysBefore,last.daysBefore,after.daysBefore],[7,7,6]);
});

test("H1-012 R05-R06: contractual zone defeats UTC and process timezone",()=>{
  const moment=instant("2026-06-13T22:30:00Z");
  assert.equal(dateAtInstant(moment,zone),"2026-06-14");
  assert.equal(dateAtInstant(moment,zoneEvidence("UTC","formal-utc","v1")),"2026-06-13");
  const file=resolve(import.meta.dirname,"../src/domain/civil-time.ts");
  const program=`import {dateAtInstant,instant,zoneEvidence} from ${JSON.stringify(file)};\n`+
    `process.stdout.write(dateAtInstant(instant("2026-06-13T22:30:00Z"),`+
    `zoneEvidence("Europe/Madrid","formal-zone-evidence","2026-v1")));`;
  const options={encoding:"utf8" as const};
  const inUtc=execFileSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",program],
    {...options,env:{...process.env,TZ:"UTC"}});
  const inTokyo=execFileSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",program],
    {...options,env:{...process.env,TZ:"Asia/Tokyo"}});
  assert.deepEqual([inUtc,inTokyo],["2026-06-14","2026-06-14"]);
  assert.throws(()=>zoneEvidence(null,"formal","v1"),/CIVIL_INPUT_INVALID/);
  assert.throws(()=>zoneEvidence("Europe/Madrid","","v1"),/CIVIL_INPUT_INVALID/);
  assert.throws(()=>dateAtInstant(moment,{...zone,sourceRef:""}),/CIVIL_INPUT_INVALID/);
});

test("H1-012 R07-R10/R18: scope isolation, contract override and non-mutating replay",()=>{
  const global=make("global","B1","2026-06-20");
  const modality=make("modality","B","2026-06-22");
  const night=make("night","N23","2026-06-23");
  const refs=[global,modality,service,night];
  assert.deepEqual(refs.map(r=>selectReference(refs,{scope:r.scope,scopeId:r.scopeId}).date),
    ["2026-06-20","2026-06-22","2026-06-20","2026-06-23"]);
  const express=make("modality","B","2026-06-24","express_contract");
  assert.equal(selectReference([...refs,express],{scope:"modality",scopeId:"B"}).date,"2026-06-24");
  assert.equal(selectReference([...refs,express],{scope:"night",scopeId:"N23"}).date,"2026-06-23");
  assert.throws(()=>selectReference([...refs,express,express],{scope:"modality",scopeId:"B"}),
    /CIVIL_INPUT_INVALID/);
  assert.throws(()=>selectReference(refs,{scope:"service",scopeId:"unverified"}),
    /CIVIL_REFERENCE_UNKNOWN/);
  assert.throws(()=>civilReference({scope:"service",scopeId:"S20"},localDate("2026-06-20"),
    zone,"formal-unverified-basis","v1","unverified" as "default"),/CIVIL_INPUT_INVALID/);
  const before=evaluateCivil(service,localDate("2026-06-17"));
  const changed=make("service","S20","2026-06-22");
  const after=reevaluateCivil(before,changed,localDate("2026-06-17"),"formal-admin",
    "verified-date-change",instant("2026-06-10T10:00:00Z"));
  assert.deepEqual([before.daysBefore,after.before.daysBefore,after.after.daysBefore],[3,3,5]);
  assert.equal(before.reference.date,"2026-06-20");
  assert.equal(after.after.reference.date,"2026-06-22");
  assert.equal(after.after.algorithmVersion,CIVIL_ALGORITHM_VERSION);
  assert.deepEqual(evaluateCivil(service,localDate("2026-06-17")),before);
  assert.throws(()=>reevaluateCivil(before,night,localDate("2026-06-17"),"actor","reason",
    instant("2026-06-10T10:00:00Z")),/CIVIL_INPUT_INVALID/);
});

test("H1-012 R11-R13: DST, leap year and invalid dates",()=>{
  assert.equal(civilDaysBetween(localDate("2026-03-28"),localDate("2026-03-30")),2);
  assert.equal(civilDaysBetween(localDate("2026-10-24"),localDate("2026-10-26")),2);
  assert.equal((Date.parse("2026-03-30T00:00:00+02:00")-
    Date.parse("2026-03-29T00:00:00+01:00"))/3600000,23);
  assert.equal((Date.parse("2026-10-26T00:00:00+01:00")-
    Date.parse("2026-10-25T00:00:00+02:00"))/3600000,25);
  assert.equal(dateAtInstant(instant("2026-03-29T01:30:00Z"),zone),"2026-03-29");
  assert.equal(dateAtInstant(instant("2026-10-25T01:30:00Z"),zone),"2026-10-25");
  assert.equal(shiftCivilDate(localDate("2024-02-28"),1),"2024-02-29");
  assert.equal(shiftCivilDate(localDate("2024-02-29"),1),"2024-03-01");
  assert.equal(shiftCivilDate(localDate("2026-12-31"),1),"2027-01-01");
  for(const wrong of ["2026-02-29","1900-02-29","2026-11-31","2026-00-01","2026-06-1"])
    assert.throws(()=>localDate(wrong),/CIVIL_INPUT_INVALID/);
  assert.equal(localDate("2000-02-29"),"2000-02-29");
  assert.throws(()=>instant("2026-02-29T10:00:00Z"),/CIVIL_INPUT_INVALID/);
  assert.throws(()=>instant("2026-06-20T25:00:00Z"),/CIVIL_INPUT_INVALID/);
});

test("H1-012 R14-R15: accredited hourly deadline differs from complete civil day",()=>{
  const hour=explicitHourlyDeadline({scope:"service",scopeId:"S20",date:localDate("2026-06-13"),
    time:"12:30:00",zone,at:instant("2026-06-13T10:30:00Z"),
    sourceRef:"formal-provider-terms",version:"v1"});
  assert.equal(hourlyDeadlineExpired(hour,instant("2026-06-13T10:30:00Z")),false);
  assert.equal(hourlyDeadlineExpired(hour,instant("2026-06-13T10:30:01Z")),true);
  assert.equal(evaluateCivilDeadline(service,localDate("2026-06-13"),7).expired,false);
  assert.throws(()=>explicitHourlyDeadline({...hour,time:"12:31:00"}),/CIVIL_INPUT_INVALID/);
  assert.throws(()=>explicitHourlyDeadline({...hour,sourceRef:""}),/CIVIL_INPUT_INVALID/);
});

test("H1-012 R16-R17: pure domain and deterministic replay",()=>{
  const src=readFileSync(resolve(import.meta.dirname,"../src/domain/civil-time.ts"),"utf8");
  assert.doesNotMatch(src,/(?:process\.env|Date\.now|new Date\(\)|168\s*\*|72\s*\*)/);
  assert.doesNotMatch(src,/session|postgres|supabase|booking payment|refund/iu);
  const a=evaluateCivil(service,localDate("2026-06-13"));
  const b=evaluateCivil(service,localDate("2026-06-13"));
  assert.deepEqual(a,b);
  assert.equal(a.reference.zone.sourceRef,"formal-zone-evidence");
  assert.equal(a.reference.version,"terms-v1");
});
