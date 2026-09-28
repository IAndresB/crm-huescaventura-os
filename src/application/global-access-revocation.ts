import type { VerifiedAuthEvidence } from "./verified-auth.ts";

export type AuthGlobalRevocationOutcome = "revoked" | "failed" | "uncertain";

// The provider adapter retains any access token or provider credential. The
// Core receives only opaque, server-verified evidence and a bounded outcome.
export interface AuthGlobalRevocationPort {
  revokeAllSessions(auth: VerifiedAuthEvidence): Promise<AuthGlobalRevocationOutcome>;
}

export type GlobalAccessRevocationResult =
  | {
    readonly status: "completed";
    readonly revocationId: string;
    readonly accessGeneration: string;
    readonly auth: "revoked";
  }
  | {
    readonly status: "partial";
    readonly revocationId: string;
    readonly accessGeneration: string;
    readonly auth: "failed" | "uncertain" | "pending";
  };
