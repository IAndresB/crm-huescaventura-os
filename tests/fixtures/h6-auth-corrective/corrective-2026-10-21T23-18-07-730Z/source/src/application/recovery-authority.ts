// Opaque evidence is minted only by a server-side Auth/owner verifier. The H0
// implementation has no provider adapter; tests use an isolated synthetic port.
const starts = new WeakSet<object>();
const completions = new WeakSet<object>();

export type RecoveryKind = "password" | "break_glass";
export interface RecoveryStartClaims {
  readonly kind: RecoveryKind;
  readonly subject: string;
  readonly emailPreviouslyVerified: boolean;
  readonly linkConsumed: boolean;
  readonly ownerIndependent: boolean;
}
export interface RecoveryCompletionClaims {
  readonly recoveryId: string;
  readonly subject: string;
  readonly passwordReady: boolean;
  readonly totpVerified: boolean;
  readonly newFactorEnrolled: boolean;
  readonly oldFactorRevoked: boolean;
  readonly newPaperCopyVerified: boolean;
}
export type VerifiedRecoveryStart = Readonly<RecoveryStartClaims>;
export type VerifiedRecoveryCompletion = Readonly<RecoveryCompletionClaims>;
export interface RecoveryVerificationPort {
  verifyStart(proof: string): Promise<RecoveryStartClaims | undefined>;
  verifyCompletion(proof: string): Promise<RecoveryCompletionClaims | undefined>;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function verifyRecoveryStart(port: RecoveryVerificationPort, proof: string): Promise<VerifiedRecoveryStart> {
  if (!proof) throw new Error("RECOVERY_START_DENIED");
  const value = await port.verifyStart(proof);
  if (!value || !uuid.test(value.subject) || !["password", "break_glass"].includes(value.kind)
    || [value.emailPreviouslyVerified,value.linkConsumed,value.ownerIndependent]
      .some((flag)=>typeof flag!=="boolean")
    || (value.kind === "password" && (!value.emailPreviouslyVerified || !value.linkConsumed))
    || (value.kind === "break_glass" && !value.ownerIndependent)) throw new Error("RECOVERY_START_DENIED");
  const verified = Object.freeze({ ...value });
  starts.add(verified);
  return verified;
}

export async function verifyRecoveryCompletion(port: RecoveryVerificationPort, proof: string): Promise<VerifiedRecoveryCompletion> {
  if (!proof) throw new Error("RECOVERY_COMPLETION_DENIED");
  const value = await port.verifyCompletion(proof);
  if (!value || !uuid.test(value.subject) || !uuid.test(value.recoveryId)
    || [value.passwordReady,value.totpVerified,value.newFactorEnrolled,
      value.oldFactorRevoked,value.newPaperCopyVerified].some((flag)=>typeof flag!=="boolean")
    || !value.passwordReady || !value.totpVerified) throw new Error("RECOVERY_COMPLETION_DENIED");
  const verified = Object.freeze({ ...value });
  completions.add(verified);
  return verified;
}

export function isVerifiedRecoveryStart(value: unknown): value is VerifiedRecoveryStart {
  return typeof value === "object" && value !== null && starts.has(value);
}
export function isVerifiedRecoveryCompletion(value: unknown): value is VerifiedRecoveryCompletion {
  return typeof value === "object" && value !== null && completions.has(value);
}
