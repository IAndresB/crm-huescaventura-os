// Server-composed port. No client-supplied validity flag is accepted as authority.
export interface EvidenceRevalidationRequest {
  readonly reference: string;
  readonly fingerprint: string;
  readonly approvedExpiresAt: string;
  readonly proposalId: string;
  readonly commandId: string;
  readonly partId: string;
  readonly materialFingerprint: string;
  readonly scope: string;
}
export interface EvidenceObservation {
  readonly reference: string;
  readonly fingerprint: string;
  readonly checkedAt: string;
  readonly validUntil: string;
  readonly verifierIdentity: string;
  readonly verifierKind: string;
  readonly outcome: "verified";
}
export interface EvidenceRevalidationProvider {
  revalidate(request: EvidenceRevalidationRequest): Promise<EvidenceObservation | undefined>;
}
export interface VerifiedEvidence extends EvidenceObservation {
  readonly effectiveValidUntil: string;
}
const verified = new WeakSet<object>();
function instant(value: string): number {
  if (typeof value !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/u.test(value)
    || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error("EVIDENCE_REVALIDATION_DENIED");
  }
  return Date.parse(value);
}
export async function revalidateEvidence(provider: EvidenceRevalidationProvider,
  request: EvidenceRevalidationRequest): Promise<VerifiedEvidence> {
  try {
    const observation = await provider.revalidate(Object.freeze({ ...request }));
    if (!observation || observation.outcome !== "verified" || observation.reference !== request.reference
      || observation.fingerprint !== request.fingerprint || !/^[0-9a-f]{64}$/u.test(observation.fingerprint)
      || [observation.verifierIdentity, observation.verifierKind].some((v) => typeof v !== "string"
        || !/^[a-z][a-z0-9-]{0,127}$/u.test(v))) throw new Error();
    const until = Math.min(instant(request.approvedExpiresAt), instant(observation.validUntil));
    if (instant(observation.checkedAt) >= until) throw new Error();
    const result = Object.freeze({ reference: observation.reference, fingerprint: observation.fingerprint,
      checkedAt: observation.checkedAt, validUntil: observation.validUntil,
      verifierIdentity: observation.verifierIdentity, verifierKind: observation.verifierKind,
      outcome: "verified" as const, effectiveValidUntil: new Date(until).toISOString() });
    verified.add(result);
    return result;
  } catch { throw new Error("EVIDENCE_REVALIDATION_DENIED"); }
}
export function isVerifiedEvidence(value: unknown): value is VerifiedEvidence {
  return typeof value === "object" && value !== null && verified.has(value);
}
