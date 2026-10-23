// H1-007 C02: this is a dependency guard, not a price, eligibility or availability engine.
export type CommercialKind = "tariff" | "pack" | "custom_pack" | "promotion"
  | "capacity_rule" | "eligibility_rule" | "document_requirement";
export type CommercialAction = "create" | "publish" | "promote_custom" | "fix_application";
export interface CommercialDecisionInput {
  readonly action:CommercialAction;
  readonly kind:CommercialKind|"application";
  readonly expectedVersion:number;
  readonly catalogItemId?:string;
  readonly catalogRevisionId?:string;
  readonly originRevisionId?:string;
  readonly definition?:Readonly<Record<string,unknown>>;
  readonly revisionIds?:readonly string[];
  readonly validFrom?:string;
  readonly validUntil?:string;
}
export function decideCommercialCommand(input:CommercialDecisionInput):boolean {
  if (!Number.isSafeInteger(input.expectedVersion) || input.expectedVersion<0) return false;
  if (input.action==="create") return input.kind!=="application" && input.expectedVersion===0
    && !input.definition && !input.catalogRevisionId && !input.originRevisionId
    && !input.validFrom && !input.validUntil && !input.revisionIds?.length
    && (["pack","custom_pack","promotion"].includes(input.kind)
      ? !input.catalogItemId : !!input.catalogItemId);
  if (input.action==="publish") return input.kind!=="application" && !!input.definition
    && !!input.catalogItemId===!!input.catalogRevisionId
    && !input.originRevisionId && !input.revisionIds?.length;
  if (input.action==="promote_custom") return input.kind==="pack" && !!input.originRevisionId
    && input.expectedVersion===0 && !input.catalogItemId && !input.catalogRevisionId
    && !input.definition && !input.validFrom && !input.validUntil && !input.revisionIds?.length;
  if (input.action==="fix_application") return input.kind==="application"
    && !!input.originRevisionId && input.expectedVersion===0
    && !input.catalogItemId && !input.catalogRevisionId && !input.definition
    && !input.validFrom && !input.validUntil
    && !!input.revisionIds?.length && input.revisionIds.length<=50;
  return false;
}
export interface DependentActionFacts {
  readonly definitivePriceNeeded:boolean;
  readonly tariffAmount:"unknown"|"estimated"|"confirmed"|"real";
  readonly materialHotelCost:"not_applicable"|"unknown"|"estimated"|"confirmed"|"real";
  readonly fiscalTreatment:"unknown"|"verified";
  readonly validity:"unknown"|"current"|"expired";
  readonly perPersonBasis:boolean;
  readonly unitRevisionId:string|null;
  readonly capacity:"unknown"|"insufficient"|"verified_sufficient";
  readonly availabilityNeeded:boolean;
  readonly availability:"unknown"|"unavailable"|"verified_available";
  readonly eligibility:"unknown"|"ineligible"|"verified_eligible";
  readonly documentRequirement:"unknown"|"not_essential"|"essential_missing"|"essential_verified";
}
export function assessDependentAction(facts:DependentActionFacts):Readonly<{allowed:boolean;blockers:readonly string[]}> {
  const blockers:string[]=[];
  if (facts.definitivePriceNeeded) {
    if (facts.tariffAmount!=="confirmed" && facts.tariffAmount!=="real")
      blockers.push("TARIFF_AMOUNT_UNVERIFIED");
    if (facts.materialHotelCost!=="not_applicable"
      && facts.materialHotelCost!=="confirmed" && facts.materialHotelCost!=="real")
      blockers.push("MATERIAL_COST_UNVERIFIED");
    if (facts.fiscalTreatment!=="verified") blockers.push("FISCAL_TREATMENT_UNVERIFIED");
    if (facts.perPersonBasis && !facts.unitRevisionId) blockers.push("UNIT_MISSING");
  }
  if (facts.validity!=="current") blockers.push("VALIDITY_UNVERIFIED_OR_EXPIRED");
  if (facts.capacity!=="verified_sufficient") blockers.push("CAPACITY_UNVERIFIED_OR_INSUFFICIENT");
  if (facts.availabilityNeeded && facts.availability!=="verified_available")
    blockers.push("AVAILABILITY_UNVERIFIED_OR_UNAVAILABLE");
  if (facts.eligibility!=="verified_eligible") blockers.push("ELIGIBILITY_UNVERIFIED_OR_FAILED");
  if (facts.documentRequirement==="unknown" || facts.documentRequirement==="essential_missing")
    blockers.push("DOCUMENT_REQUIREMENT_UNRESOLVED");
  return Object.freeze({allowed:blockers.length===0,blockers:Object.freeze(blockers)});
}

export interface ApprovedPromotionFacts {
  readonly audience:"despedida"|"other"|"unknown";
  readonly objectiveEligibility:"unknown"|"ineligible"|"verified_eligible";
  readonly totalAttendees:number|null;
  readonly packComplete:boolean|null;
  readonly lodgingIncluded:boolean|null;
  readonly activityIncluded:boolean|null;
  readonly restaurantIncluded:boolean|null;
  readonly tarariDrinksIncluded:number|null;
  readonly honoreeModalityId:string|null;
  readonly honoreeModalityFinalPersonPriceVerified:boolean;
}
export function assessApprovedPromotion(facts:ApprovedPromotionFacts):Readonly<{applicable:boolean;blockers:readonly string[]}> {
  const blockers:string[]=[];
  if (facts.audience!=="despedida") blockers.push("AUDIENCE_NOT_VERIFIED");
  if (facts.objectiveEligibility!=="verified_eligible")
    blockers.push("OBJECTIVE_ELIGIBILITY_UNVERIFIED_OR_FAILED");
  if (facts.totalAttendees===null || !Number.isSafeInteger(facts.totalAttendees)
    || facts.totalAttendees<15) blockers.push("MINIMUM_ATTENDEES_NOT_MET");
  if (facts.packComplete!==true || facts.lodgingIncluded!==true || facts.activityIncluded!==true
    || facts.restaurantIncluded!==true || facts.tarariDrinksIncluded===null
    || !Number.isSafeInteger(facts.tarariDrinksIncluded)
    || facts.tarariDrinksIncluded<2) blockers.push("PACK_COMPOSITION_NOT_VERIFIED");
  if (!facts.honoreeModalityId || !facts.honoreeModalityFinalPersonPriceVerified)
    blockers.push("HONOREE_MODALITY_PRICE_UNVERIFIED");
  return Object.freeze({applicable:blockers.length===0,blockers:Object.freeze(blockers)});
}
