import { randomBytes } from "node:crypto";
import type { AuthEvidence, AuthVerificationPort } from "../../src/application/verified-auth.ts";

// Test-only Auth verification stub. No provider, JWT, password or TOTP secret.
export function createSyntheticAuthVerifier() {
  const proofs = new Map<string, AuthEvidence>();
  return {
    port: Object.freeze({
      verify: async (proof: string) => proofs.get(proof),
    }) satisfies AuthVerificationPort,
    register(value: AuthEvidence): string {
      const proof = randomBytes(32).toString("hex");
      proofs.set(proof, Object.freeze({ ...value }));
      return proof;
    },
  };
}
