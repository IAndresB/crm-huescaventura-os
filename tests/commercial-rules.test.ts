import assert from "node:assert/strict";
import { test } from "node:test";
import { assessApprovedPromotion, assessDependentAction } from "../src/domain/commercial-rules.ts";

const ready={definitivePriceNeeded:true,tariffAmount:"confirmed" as const,
  materialHotelCost:"confirmed" as const,fiscalTreatment:"verified" as const,
  validity:"current" as const,perPersonBasis:true,unitRevisionId:"synthetic-version",
  capacity:"verified_sufficient" as const,availabilityNeeded:false,
  availability:"unknown" as const,eligibility:"verified_eligible" as const,
  documentRequirement:"essential_verified" as const};
test("unknown material hotel cost blocks only dependent definitive action",()=>{
  const result=assessDependentAction({...ready,materialHotelCost:"unknown"});
  assert.equal(result.allowed,false);
  assert.deepEqual(result.blockers,["MATERIAL_COST_UNVERIFIED"]);
  const independent=assessDependentAction({...ready,definitivePriceNeeded:false,
    materialHotelCost:"unknown",tariffAmount:"unknown",fiscalTreatment:"unknown"});
  assert.equal(independent.allowed,true);
});
test("unknown tariff, fiscal treatment, validity and unit never become final values",()=>{
  const result=assessDependentAction({...ready,tariffAmount:"unknown",
    fiscalTreatment:"unknown",validity:"unknown",unitRevisionId:null});
  assert.deepEqual(result.blockers,["TARIFF_AMOUNT_UNVERIFIED",
    "FISCAL_TREATMENT_UNVERIFIED","UNIT_MISSING","VALIDITY_UNVERIFIED_OR_EXPIRED"]);
});
test("recommendation cannot replace eligibility, capacity or essential document",()=>{
  const result=assessDependentAction({...ready,capacity:"unknown",eligibility:"unknown",
    documentRequirement:"essential_missing"});
  assert.deepEqual(result.blockers,["CAPACITY_UNVERIFIED_OR_INSUFFICIENT",
    "ELIGIBILITY_UNVERIFIED_OR_FAILED","DOCUMENT_REQUIREMENT_UNRESOLVED"]);
});
test("structural capacity cannot substitute temporal availability",()=>{
  const result=assessDependentAction({...ready,availabilityNeeded:true,
    availability:"unknown"});
  assert.deepEqual(result.blockers,["AVAILABILITY_UNVERIFIED_OR_UNAVAILABLE"]);
});
const promotion={audience:"despedida" as const,objectiveEligibility:"verified_eligible" as const,
  totalAttendees:15,packComplete:true,
  lodgingIncluded:true,activityIncluded:true,restaurantIncluded:true,
  tarariDrinksIncluded:2,honoreeModalityId:"synthetic-modality",
  honoreeModalityFinalPersonPriceVerified:true};
test("approved promotion requires exact composition and honoree modality",()=>{
  assert.equal(assessApprovedPromotion(promotion).applicable,true);
  assert.deepEqual(assessApprovedPromotion({...promotion,honoreeModalityId:null}).blockers,
    ["HONOREE_MODALITY_PRICE_UNVERIFIED"]);
  assert.equal(assessApprovedPromotion({...promotion,audience:"other"}).applicable,false);
  assert.equal(assessApprovedPromotion({...promotion,objectiveEligibility:"unknown"}).applicable,false);
  assert.equal(assessApprovedPromotion({...promotion,tarariDrinksIncluded:1}).applicable,false);
  assert.equal(assessApprovedPromotion({...promotion,totalAttendees:14}).applicable,false);
});
