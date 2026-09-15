const trustedContextMarker = Symbol("trusted-execution-context");

export interface TrustedExecutionContext {
  readonly [trustedContextMarker]: true;
  readonly identityId: string;
  readonly identityKind: "human" | "technical";
  readonly purpose: string;
  readonly scope: string;
  readonly requestId: string;
  readonly serverTime: string;
}

export interface VerifiedContextClaims {
  readonly identityId: string;
  readonly identityKind: "human" | "technical";
  readonly purpose: string;
  readonly scope: string;
  readonly requestId: string;
  readonly serverTime: string;
}

export function issueTrustedContext(claims: VerifiedContextClaims): TrustedExecutionContext {
  return Object.freeze({ ...claims, [trustedContextMarker]: true as const });
}

export function isTrustedContext(value: unknown): value is TrustedExecutionContext {
  if (typeof value !== "object" || value === null || !(trustedContextMarker in value)) {
    return false;
  }
  const candidate = value as Partial<TrustedExecutionContext>;
  const requiredStrings = [
    candidate.identityId,
    candidate.purpose,
    candidate.scope,
    candidate.requestId,
    candidate.serverTime,
  ];
  return requiredStrings.every((item) => typeof item === "string" && item.trim().length > 0)
    && (candidate.identityKind === "human" || candidate.identityKind === "technical")
    && !Number.isNaN(Date.parse(candidate.serverTime ?? ""));
}
