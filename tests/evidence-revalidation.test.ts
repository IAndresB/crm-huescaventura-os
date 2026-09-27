import assert from "node:assert/strict";
import test from "node:test";
import { isVerifiedEvidence, revalidateEvidence, type EvidenceObservation } from "../src/application/evidence-revalidation.ts";

const request = { reference: "synthetic-reference", fingerprint: "a".repeat(64),
  approvedExpiresAt: "2030-01-01T01:00:00.000Z", proposalId: "synthetic-proposal", commandId: "synthetic-command",
  partId: "part-a", materialFingerprint: "b".repeat(64), scope: "synthetic-scope" };
const observation: EvidenceObservation = { reference: request.reference, fingerprint: request.fingerprint,
  checkedAt: "2030-01-01T00:00:00.000Z", validUntil: "2030-01-01T02:00:00.000Z",
  verifierIdentity: "synthetic-reader", verifierKind: "fixture", outcome: "verified" };

test("evidence authority is opaque, immutable and bounded by approved expiry", async () => {
  assert.equal(isVerifiedEvidence(observation), false);
  const result = await revalidateEvidence({ revalidate: async (received) => {
    assert.deepEqual(received, request); assert.equal(Object.isFrozen(received), true); return observation;
  } }, request);
  assert.equal(isVerifiedEvidence(result), true); assert.equal(Object.isFrozen(result), true);
  assert.equal(isVerifiedEvidence({ ...result }), false);
  assert.equal(result.effectiveValidUntil, request.approvedExpiresAt);
});
test("source validity may shorten but cannot extend approved validity", async () => {
  const until = "2030-01-01T00:30:00.000Z";
  const result = await revalidateEvidence({ revalidate: async () => ({ ...observation, validUntil: until }) }, request);
  assert.equal(result.effectiveValidUntil, until);
});
test("missing, mismatched, ambiguous and incoherent evidence fails closed", async () => {
  for (const value of [undefined, { ...observation, reference: "wrong" }, { ...observation, fingerprint: "c".repeat(64) },
    { ...observation, checkedAt: observation.validUntil }, { ...observation, outcome: "pending" },
    { ...observation, verifierIdentity: "" }, { ...observation, validUntil: "2030-02-31T00:00:00.000Z" }]) {
    await assert.rejects(() => revalidateEvidence({ revalidate: async () => value as never }, request), /EVIDENCE_REVALIDATION_DENIED/);
  }
});
test("provider errors are sanitized, not treated as evidence", async () => {
  await assert.rejects(() => revalidateEvidence({ revalidate: async () => { throw new Error("synthetic-private-provider-detail"); } }, request),
    { message: "EVIDENCE_REVALIDATION_DENIED" });
});
