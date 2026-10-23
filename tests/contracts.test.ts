import assert from "node:assert/strict";
import test from "node:test";
import {
  invokeC01,
  invokeC02,
  invokeC03,
  invokeC04,
  invokeC05,
  invokeC06,
  type ContractRequest,
  type EvidenceRegistration,
} from "../src/application/contracts.ts";
import { issueTrustedContext } from "../src/application/trusted-context.ts";
import type { CommonGuardFacts } from "../src/domain/guards.ts";

const context = issueTrustedContext({
  identityId: "actor-synthetic-01",
  identityKind: "technical",
  purpose: "contract-test",
  scope: "scope-synthetic-01",
  requestId: "request-synthetic-01",
  serverTime: "2026-09-15T12:00:00.000Z",
});

const guards: CommonGuardFacts = {
  identityAndScope: "satisfied",
  materialTruth: "satisfied",
  sensitiveSupervision: "not-required",
  conservation: "satisfied",
  independence: "satisfied",
  repetition: "new",
};

function request<T>(input: T): ContractRequest<T> {
  return { context, scope: "scope-synthetic-01", guards, input };
}

test("C01 returns only the authorized projection", async () => {
  const result = await invokeC01(request({ filter: "synthetic" }), {
    read: async () => ({ data: { id: "record-synthetic-01" }, provenance: "fixture", certainty: "verified" }),
  });
  assert.equal(result.status, "applied");
});

test("C02 is an isolated domain decision", () => {
  const result = invokeC02(request({ version: "v1" }), () => ({ allowedChanges: ["change-01"], blockers: [] }));
  assert.equal(result.status, "applied");
});

test("C03 delegates the atomic unit without claiming PostgreSQL", async () => {
  const result = await invokeC03(request({
    operationId: "operation-synthetic-01",
    changes: ["change-01"],
    historyRequired: true,
    resultRequired: true,
  }), {
    commit: async () => ({ status: "applied", value: { committedBy: "synthetic-port" } }),
  });
  assert.equal(result.status, "applied");
});

test("C04 keeps evidence candidate without an explicit review", async () => {
  const result = await invokeC04(request({
    sourceReference: "source-synthetic-01",
    receivedAt: "2026-09-15T12:00:00.000Z",
    preservation: "original",
  }), {
    register: async () => ({ evidenceId: "evidence-synthetic-01" }),
  });
  assert.equal(result.status, "applied");
  assert.equal(result.status === "applied" ? result.value.state : undefined, "candidate");
});

for (const reviewed of [false, true]) {
  test(`C04 preserves captured registration during a wait (reviewed=${reviewed})`, async () => {
    const input = {
      sourceReference: "source-before-wait",
      receivedAt: "2026-09-15T12:00:00.000Z",
      preservation: "authorized-manual-record" as const,
      verification: reviewed ? {
        reviewerIdentityId: "reviewer-before-wait",
        reviewedAt: "2026-09-15T12:01:00.000Z",
      } : undefined,
    };
    const original = structuredClone(input);
    const mutable = { ...request(input) };
    let release!: () => void;
    const pending = new Promise<void>((resolve) => { release = resolve; });
    let persisted: EvidenceRegistration | undefined;
    const result = invokeC04(mutable, {
      register: async (_context, captured) => {
        assert.ok(Object.isFrozen(captured));
        if (captured.verification) assert.ok(Object.isFrozen(captured.verification));
        await pending;
        persisted = captured;
        return { evidenceId: "new-evidence" };
      },
    });
    if (input.verification) input.verification.reviewerIdentityId = "mutated-reviewer";
    mutable.input = { ...input, sourceReference: "replacement-source",
      verification: reviewed ? undefined : {
        reviewerIdentityId: "replacement-reviewer",
        reviewedAt: "2026-09-15T12:02:00.000Z",
      } };
    release();
    const observed = await result;
    assert.deepEqual(persisted, original);
    assert.equal(observed.status, "applied");
    assert.equal(observed.status === "applied" && observed.value.state, reviewed ? "verified" : "candidate");
  });
}

test("C05 records an intent but leaves the external channel pending", async () => {
  const result = await invokeC05(request({
    effectId: "effect-synthetic-01",
    recipientReference: "recipient-synthetic-01",
    contentVersion: "v1",
  }), {
    record: async () => ({ stage: "intent", intentId: "intent-synthetic-01" }),
  });
  assert.equal(result.status, "pending");
  assert.equal(result.issues[0]?.code, "E6");
});

test("C06 rejects evaluation that escapes its requested scope", () => {
  const result = invokeC06(request({ fact: "synthetic" }), () => ({ scope: "another-scope", changes: [] }));
  assert.equal(result.status, "rejected");
});
