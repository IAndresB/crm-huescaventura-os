// Structural checks only. Eligibility, availability, capacity and money
// belong to their approved later flows and cannot be derived from catalog data.
export type CatalogKind =
  | "service" | "variant" | "category" | "attribute" | "audience" | "unit"
  | "pricing_form" | "provider" | "offering" | "category_assignment"
  | "attribute_assignment" | "audience_recommendation"
  | "unit_assignment" | "pricing_form_assignment";
export type CatalogAction="create_item"|"publish_version"|"fix_application";
export interface CatalogDecisionInput {
  readonly action:CatalogAction;
  readonly kind:CatalogKind|"application";
  readonly parentId?:string;
  readonly relatedId?:string;
  readonly partyId?:string;
  readonly partyKind?:"contact"|"organization";
  readonly definition?:Readonly<Record<string,string>>;
  readonly revisionIds?:readonly string[];
  readonly expectedVersion:number;
}
export function decideCatalogCommand(input:CatalogDecisionInput):boolean {
  if (!Number.isSafeInteger(input.expectedVersion) || input.expectedVersion<0) return false;
  if (input.action==="fix_application")
    return input.kind==="application" && !!input.parentId && !input.relatedId
      && !input.partyId && !input.partyKind && input.expectedVersion===0
      && !!input.revisionIds?.length && input.revisionIds.length<=50;
  if (input.kind==="application" || input.revisionIds?.length) return false;
  if (input.action==="create_item") {
    if (input.expectedVersion!==0 || input.definition) return false;
    const base=["service","category","attribute","audience","unit","pricing_form","provider"];
    const relation=["offering","category_assignment","attribute_assignment",
      "audience_recommendation","unit_assignment","pricing_form_assignment"];
    if (![...base,"variant",...relation].includes(input.kind)) return false;
    if (base.includes(input.kind) && (input.parentId || input.relatedId)) return false;
    if (input.kind==="variant" && (!input.parentId || input.relatedId)) return false;
    if (relation.includes(input.kind) && (!input.parentId || !input.relatedId)) return false;
    if (input.kind==="provider") return Boolean(input.partyId)===Boolean(input.partyKind);
    return !input.partyId && !input.partyKind;
  }
  if (!input.definition || Object.values(input.definition)
    .some(value=>typeof value!=="string" || value.includes("\0") || value.includes("\u001f")))
    return false;
  const keys=Object.keys(input.definition);
  const allowed=input.kind==="service" ? ["name","nature","description"]
    : ["variant","category","attribute","audience","provider"].includes(input.kind)
      ? ["name","description"]
      : ["unit","pricing_form"].includes(input.kind) ? ["name","definition"]
        : input.kind==="audience_recommendation" ? ["priority","description"]
          : input.kind==="offering"
            ? ["conditions","location","valid_from","valid_until"] : ["description"];
  if (keys.some(key=>!allowed.includes(key)) || input.partyId || input.partyKind) return false;
  if (input.kind==="service")
    return !!input.definition.name && ["internal","external"].includes(input.definition.nature??"");
  if (["variant","category","attribute","audience","provider"].includes(input.kind))
    return !!input.definition.name;
  if (["unit","pricing_form"].includes(input.kind))
    return !!input.definition.name && !!input.definition.definition;
  if (input.kind==="audience_recommendation")
    return ["Alta","Media","Baja"].includes(input.definition.priority??"");
  return true;
}
