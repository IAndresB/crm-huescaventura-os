import { createHash } from "node:crypto";
import type { EvidenceRevalidationProvider } from "../../src/application/evidence-revalidation.ts";

// Test authority owns these bytes. Requests cannot register a source or assert
// its validity. No production provider/connector or external I/O is supplied.
export function syntheticEvidenceProvider() {
  const sources = new Map<string, { bytes: Buffer; validUntil: string; scope: string }>();
  let calls = 0;
  const provider: EvidenceRevalidationProvider = {
    async revalidate(request) {
      calls++;
      const source = sources.get(request.reference);
      if (!source || source.scope !== request.scope) return undefined;
      const fingerprint = createHash("sha256").update(source.bytes).digest("hex");
      if (fingerprint !== request.fingerprint) return undefined;
      return { reference: request.reference, fingerprint, checkedAt: new Date().toISOString(),
        validUntil: source.validUntil, verifierIdentity: "h0-synthetic-source-reader",
        verifierKind: "synthetic-fixture", outcome: "verified" };
    },
  };
  return { provider, sources, calls: () => calls };
}
