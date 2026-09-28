// Static H1 identity checks. Database admission and current-state checks remain
// authoritative for actor, verified relations, version and atomic history.
export interface IdentityDecisionInput {
  readonly action: string;
  readonly kind: string;
  readonly relatedId?: string;
  readonly contextId?: string;
  readonly evidenceRef?: string | null;
  readonly verified: boolean;
  readonly groupType?: string | null;
  readonly estimatedSize?: number | null;
  readonly confirmedSize?: number | null;
  readonly sizeSource?: string | null;
  readonly givenName?: string | null;
  readonly familyName?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
}
export interface IdentityDecision {
  readonly allowed: boolean;
  readonly blockers: readonly string[];
}
export function decideIdentityCommand(input: IdentityDecisionInput): IdentityDecision {
  const blockers:string[]=[];
  const contactDetails=[input.givenName,input.familyName,input.email,input.phone]
    .some((value)=>value!==undefined && value!==null);
  const groupDetails=[input.groupType,input.estimatedSize,input.confirmedSize,input.sizeSource]
    .some((value)=>value!==undefined && value!==null);
  if (input.action==="create_entity" || input.action==="update_entity") {
    if (!["contact","organization","group"].includes(input.kind)
      || (input.action==="create_entity" && (input.kind==="group")!==Boolean(input.contextId))
      || (input.action==="update_entity" && Boolean(input.contextId))
      || (input.kind!=="contact" && contactDetails)
      || (input.kind!=="group" && groupDetails)) blockers.push("DM-INV-002");
    if ((input.estimatedSize!==undefined && input.estimatedSize!==null
      || input.confirmedSize!==undefined && input.confirmedSize!==null)
      && !input.sizeSource) blockers.push("DM-INV-001");
    if (input.action==="create_entity" && input.verified && !input.evidenceRef)
      blockers.push("DM-INV-003");
  } else if (input.action==="create_context") {
    if (!["opportunity","booking"].includes(input.kind) || !input.verified
      || !input.evidenceRef) blockers.push("DM-INV-003");
  } else if (input.action==="link_organization_contact") {
    if (!input.relatedId || !input.contextId || !input.verified || !input.evidenceRef)
      blockers.push("DM-INV-003");
  } else if (input.action==="designate") {
    if (!input.relatedId || !input.contextId
      || !["primary_contact","client","payer","participant"].includes(input.kind))
      blockers.push("DM-INV-002");
    if ((input.verified && !input.evidenceRef)
      || (input.kind==="primary_contact" && !input.verified))
      blockers.push("DM-INV-003", "DM-INV-004");
  } else blockers.push("SPEC-FR-ID-001");
  return {allowed:blockers.length===0,blockers};
}
