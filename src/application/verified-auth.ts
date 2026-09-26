// The production Auth adapter is deliberately absent in H0-005. Only a
// server-side verifier can mint this opaque, non-serializable authority.
const verified = new WeakSet<object>();

export interface AuthEvidence {
  readonly subject: string;
  readonly sessionId?: string;
  readonly passwordVerified: boolean;
  readonly mfaVerified: boolean;
}

export interface VerifiedAuthEvidence extends AuthEvidence {
  readonly kind: "verified-auth-evidence";
}

export interface AuthVerificationPort {
  verify(opaqueProof: string): Promise<AuthEvidence | undefined>;
}

export async function verifyAuth(
  port: AuthVerificationPort,
  opaqueProof: string,
): Promise<VerifiedAuthEvidence> {
  if (typeof opaqueProof !== "string" || opaqueProof.length === 0) {
    throw new Error("AUTH_VERIFICATION_REQUIRED");
  }
  const value = await port.verify(opaqueProof);
  if (!value || typeof value.subject !== "string"
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.subject)
    || (value.sessionId !== undefined
      && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.sessionId))
    || typeof value.passwordVerified !== "boolean"
    || typeof value.mfaVerified !== "boolean") {
    throw new Error("AUTH_VERIFICATION_REQUIRED");
  }
  const result = Object.freeze({
    kind: "verified-auth-evidence" as const,
    subject: value.subject,
    ...(value.sessionId === undefined ? {} : { sessionId: value.sessionId }),
    passwordVerified: value.passwordVerified,
    mfaVerified: value.mfaVerified,
  });
  verified.add(result);
  return result;
}

export function isVerifiedAuth(value: unknown): value is VerifiedAuthEvidence {
  return typeof value === "object" && value !== null && verified.has(value);
}
