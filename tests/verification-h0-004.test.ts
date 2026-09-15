import assert from "node:assert/strict";
import test from "node:test";
import {
  invokeC01,
  invokeC02,
  invokeC03,
  invokeC04,
  invokeC05,
  invokeC06,
  type AtomicCommit,
  type ContractRequest,
  type ExternalEffectRecord,
  type ScopedEvaluation,
} from "../src/application/contracts.ts";
import type { ApplicationResult } from "../src/application/result.ts";
import {
  isTrustedContext,
  issueTrustedContext,
  type TrustedExecutionContext,
} from "../src/application/trusted-context.ts";
import {
  evaluateCommonGuards,
  type CommonGuardFacts,
} from "../src/domain/guards.ts";
import {
  errorCodes,
  semanticIssue,
  type ErrorCode,
} from "../src/domain/semantic-error.ts";
import { GET } from "../src/app/health/route.ts";
import {
  invokeServerBoundary,
  parseBoundaryEnvelope,
  type BoundaryDependencies,
  type ReplayInspection,
} from "../src/server/boundary.ts";
import { validateServerConfig } from "../src/server/config.ts";
import type { DiagnosticEvent } from "../src/server/diagnostics.ts";

const scope = "scope-synthetic-004";
const origin = "https://crm.synthetic.invalid";
const context = issueTrustedContext({
  identityId: "actor-synthetic-004",
  identityKind: "technical",
  purpose: "verification-h0-004",
  scope,
  requestId: "request-synthetic-004",
  serverTime: "2026-09-15T12:00:00.000Z",
});

const passingGuards: CommonGuardFacts = {
  identityAndScope: "satisfied",
  materialTruth: "satisfied",
  sensitiveSupervision: "not-required",
  conservation: "satisfied",
  independence: "satisfied",
  repetition: "new",
};

function contractRequest<T>(input: T, guards = passingGuards): ContractRequest<T> {
  return { context, scope, guards, input };
}

function boundaryDependencies(overrides: Partial<BoundaryDependencies> = {}): BoundaryDependencies {
  return {
    allowedOrigins: new Set([origin]),
    contexts: { resolve: async () => context },
    fingerprints: { fingerprint: (payload) => JSON.stringify(payload) },
    replay: { inspect: async () => ({ status: "new" }) },
    diagnostics: { record: () => undefined },
    ...overrides,
  };
}

function mutation(payload: unknown = { value: "synthetic" }, operationId = "operation-synthetic-004") {
  return {
    requestId: "request-synthetic-004",
    kind: "mutation" as const,
    origin,
    payload,
    operation: { id: operationId },
  };
}

test("H0-004 C01 authorizes before read and preserves the minimal port projection", async () => {
  let reads = 0;
  const port = {
    read: async () => {
      reads += 1;
      return {
        data: { id: "record-synthetic-004" },
        provenance: "authorized-fixture",
        certainty: "verified" as const,
      };
    },
  };
  const allowed = await invokeC01(contractRequest({ filter: "allowed" }), port);
  assert.deepEqual(allowed, {
    status: "applied",
    value: {
      data: { id: "record-synthetic-004" },
      provenance: "authorized-fixture",
      certainty: "verified",
    },
  });
  const denied = await invokeC01(contractRequest(
    { filter: "denied" },
    { ...passingGuards, identityAndScope: "missing" },
  ), port);
  assert.equal(denied.status, "rejected");
  assert.equal(reads, 1);
});

test("H0-004 C02 remains a synchronous pure decision contract", () => {
  let decisions = 0;
  const result = invokeC02(contractRequest({ currentVersion: "v1" }), (input) => {
    decisions += 1;
    return { allowedChanges: [`from-${input.currentVersion}`], blockers: [] };
  });
  assert.deepEqual(result, {
    status: "applied",
    value: { allowedChanges: ["from-v1"], blockers: [] },
  });
  assert.equal(decisions, 1);
});

test("H0-004 C03 represents one atomic port unit without claiming a real database", async () => {
  type Unit = AtomicCommit<string, { kind: "synthetic-intent" }>;
  let observed: Unit | undefined;
  const unit: Unit = {
    operationId: "operation-synthetic-004",
    expectedVersion: "v1",
    changes: ["change-synthetic-004"],
    historyRequired: true,
    resultRequired: true,
    intent: { kind: "synthetic-intent" },
  };
  const result = await invokeC03(contractRequest(unit), {
    commit: async (_trusted, received) => {
      observed = received;
      return { status: "applied", value: "synthetic-double-only" };
    },
  });
  assert.equal(result.status, "applied");
  assert.deepEqual(observed, unit);
});

test("H0-004 C04 requires an explicit valid review before verified", async () => {
  let registrations = 0;
  const port = {
    register: async () => {
      registrations += 1;
      return { evidenceId: "evidence-synthetic-004" };
    },
  };
  const candidate = await invokeC04(contractRequest({
    sourceReference: "source-synthetic-004",
    receivedAt: "2026-09-15T12:00:00.000Z",
    preservation: "original",
  }), port);
  assert.equal(candidate.status === "applied" ? candidate.value.state : undefined, "candidate");

  const verified = await invokeC04(contractRequest({
    sourceReference: "source-synthetic-004",
    receivedAt: "2026-09-15T12:00:00.000Z",
    preservation: "original",
    verification: {
      reviewerIdentityId: "reviewer-synthetic-004",
      reviewedAt: "2026-09-15T12:01:00.000Z",
    },
  }), port);
  assert.equal(verified.status === "applied" ? verified.value.state : undefined, "verified");

  const invalidReview = await invokeC04(contractRequest({
    sourceReference: "source-synthetic-004",
    receivedAt: "2026-09-15T12:00:00.000Z",
    preservation: "original",
    verification: { reviewerIdentityId: "", reviewedAt: "not-a-date" },
  }), port);
  assert.equal(invalidReview.status, "rejected");
  assert.equal(invalidReview.status === "rejected" ? invalidReview.issues[0]?.code : undefined, "E3");
  assert.equal(registrations, 2);
});

test("H0-004 C05 distinguishes intent, attempt, known result and uncertainty without a provider", async () => {
  const input = contractRequest({
    effectId: "effect-synthetic-004",
    recipientReference: "recipient-synthetic-004",
    contentVersion: "v1",
  });
  const records: readonly ExternalEffectRecord[] = [
    { stage: "intent", intentId: "intent-synthetic-004" },
    { stage: "attempt", intentId: "intent-synthetic-004", attemptId: "attempt-synthetic-004" },
    {
      stage: "result",
      intentId: "intent-synthetic-004",
      attemptId: "attempt-synthetic-004",
      resultReference: "result-synthetic-004",
      outcome: "failed",
    },
    { stage: "uncertain", intentId: "intent-synthetic-004", attemptId: "attempt-synthetic-004" },
  ];
  const observed: ApplicationResult<ExternalEffectRecord>[] = [];
  for (const record of records) {
    observed.push(await invokeC05(input, { record: async () => record }));
  }
  assert.deepEqual(observed.map((result) => result.status), ["pending", "pending", "applied", "pending"]);
  assert.equal(observed[3]?.status === "pending" ? observed[3].issues[0]?.code : undefined, "E4");
});

test("H0-004 C06 is scoped and rejects runtime attempts to close or confirm", () => {
  const valid = invokeC06(contractRequest({ fact: "synthetic" }), () => ({
    scope,
    changes: [{ kind: "request-review", reason: "synthetic" }],
  }));
  assert.equal(valid.status, "applied");

  const escaped = invokeC06(contractRequest({ fact: "synthetic" }), () => ({
    scope: "other-scope",
    changes: [],
  }));
  assert.equal(escaped.status, "rejected");

  const malicious = invokeC06(contractRequest({ fact: "synthetic" }), () => ({
    scope,
    changes: [{ kind: "close", reason: "injected" }],
  }) as unknown as ScopedEvaluation);
  assert.equal(malicious.status, "rejected");
});

test("H0-004 G1-G6 allow satisfied facts and deny each failed guard semantically", () => {
  assert.deepEqual(evaluateCommonGuards(scope, passingGuards), []);
  const cases: readonly [keyof CommonGuardFacts, CommonGuardFacts[keyof CommonGuardFacts], ErrorCode][] = [
    ["identityAndScope", "missing", "E1"],
    ["materialTruth", "insufficient", "E3"],
    ["sensitiveSupervision", "missing", "E1"],
    ["conservation", "missing", "E1"],
    ["independence", "violated", "E1"],
    ["repetition", "conflicting", "E2"],
    ["repetition", "uncertain", "E4"],
  ];
  for (const [key, value, code] of cases) {
    const failures = evaluateCommonGuards(scope, { ...passingGuards, [key]: value } as CommonGuardFacts);
    assert.equal(failures.length, 1);
    assert.equal(failures[0]?.issue.code, code);
  }
});

test("H0-004 E1-E8 retain distinct state and next-step semantics", async () => {
  const expected = {
    E1: ["unchanged", "correct-or-review"],
    E2: ["conflicting", "reevaluate-current-state"],
    E3: ["pending", "supply-required-evidence"],
    E4: ["uncertain", "reconcile-before-retry"],
    E5: ["unchanged", "retry-only-if-safe"],
    E6: ["pending", "restore-dependency"],
    E7: ["pending", "resolve-ambiguity"],
    E8: ["conflicting", "review-discrepancy"],
  } as const;
  for (const code of errorCodes) {
    const issue = semanticIssue(code, scope);
    assert.deepEqual([issue.knownState, issue.nextStep], expected[code]);
    const pending = new Set<ErrorCode>(["E4", "E6", "E7"]);
    const routed = await invokeServerBoundary(
      mutation({ code }, `operation-${code.toLowerCase()}-004`),
      boundaryDependencies(),
      async () => pending.has(code)
        ? { status: "pending", issues: [issue] }
        : { status: "rejected", issues: [issue] },
    );
    assert.ok(routed.status === "pending" || routed.status === "rejected");
    assert.equal(routed.issues[0]?.code, code);
  }
  assert.notDeepEqual(semanticIssue("E4", scope), semanticIssue("E5", scope));
});

test("H0-004 malformed input and authority injection fail closed", () => {
  const invalid: unknown[] = [
    {},
    null,
    [],
    "wrong-type",
    { requestId: "r", kind: "query", origin },
    { requestId: "r", kind: "mutation", origin, payload: {} },
    { ...mutation(), operation: {} },
    { ...mutation(), operation: { id: "op", authority: "admin" } },
    { ...mutation(), context: { identityId: "forged" } },
    { ...mutation(), identityId: "forged" },
  ];
  for (const value of invalid) assert.equal(parseBoundaryEnvelope(value), undefined);
});

test("H0-004 origin comparison is exact for missing, deceptive and partial variants", async () => {
  const attempts = [
    "https://evil.crm.synthetic.invalid",
    "https://crm.synthetic.invalid.evil.invalid",
    "http://crm.synthetic.invalid",
    "https://crm.synthetic.invalid:444",
    "crm.synthetic.invalid",
  ];
  for (const attemptedOrigin of attempts) {
    const result = await invokeServerBoundary(
      { ...mutation(), origin: attemptedOrigin },
      boundaryDependencies(),
      async () => ({ status: "applied", value: "unexpected" }),
    );
    assert.equal(result.status, "rejected");
  }
  assert.equal(parseBoundaryEnvelope({ ...mutation(), origin: "" }), undefined);
  const allowed = await invokeServerBoundary(
    mutation(),
    boundaryDependencies(),
    async () => ({ status: "applied", value: "allowed" }),
  );
  assert.equal(allowed.status, "applied");
});

test("H0-004 replay returns prior equivalent, conflicts on changed material and never doubles the handler", async () => {
  const stored = new Map<string, { fingerprint: string; value: string; uncertain?: boolean }>();
  let handlerCalls = 0;
  const deps = boundaryDependencies({
    replay: {
      inspect: async <T>(_trusted: TrustedExecutionContext, operationId: string, fingerprint: string): Promise<ReplayInspection<T>> => {
        const prior = stored.get(operationId);
        if (!prior) return { status: "new" };
        if (prior.uncertain) return { status: "uncertain" };
        if (prior.fingerprint !== fingerprint) return { status: "conflict" };
        return { status: "previous", value: prior.value as T };
      },
    },
  });
  const handler = async (_trusted: TrustedExecutionContext, payload: unknown) => {
    handlerCalls += 1;
    stored.set("operation-replay-004", { fingerprint: JSON.stringify(payload), value: "first-result" });
    return { status: "applied", value: "first-result" } as const;
  };
  const first = await invokeServerBoundary(mutation({ amount: 1 }, "operation-replay-004"), deps, handler);
  const equivalent = await invokeServerBoundary(mutation({ amount: 1 }, "operation-replay-004"), deps, handler);
  const conflict = await invokeServerBoundary(mutation({ amount: 2 }, "operation-replay-004"), deps, handler);
  stored.set("operation-uncertain-004", { fingerprint: "unused", value: "none", uncertain: true });
  const uncertain = await invokeServerBoundary(mutation({ amount: 3 }, "operation-uncertain-004"), deps, handler);
  const absent = await invokeServerBoundary(mutation({ amount: 4 }, "operation-new-004"), deps, async () => {
    handlerCalls += 1;
    return { status: "applied", value: "new-result" };
  });
  assert.equal(first.status, "applied");
  assert.equal(equivalent.status, "previous");
  assert.equal(conflict.status === "rejected" ? conflict.issues[0]?.code : undefined, "E2");
  assert.equal(uncertain.status === "pending" ? uncertain.issues[0]?.code : undefined, "E4");
  assert.equal(absent.status, "applied");
  assert.equal(handlerCalls, 2);
});

test("H0-004 trusted context is server-issued, complete and deny-by-default", async () => {
  assert.equal(isTrustedContext(context), true);
  assert.equal(isTrustedContext(undefined), false);
  assert.equal(isTrustedContext({ identityId: "forged" }), false);
  const incomplete = issueTrustedContext({
    identityId: "",
    identityKind: "technical",
    purpose: "verification-h0-004",
    scope,
    requestId: "request-incomplete-004",
    serverTime: "not-a-date",
  });
  assert.equal(isTrustedContext(incomplete), false);
  const result = await invokeServerBoundary(
    { ...mutation(), payload: { context: context as unknown } },
    boundaryDependencies({ contexts: { resolve: async () => incomplete } }),
    async () => ({ status: "applied", value: "unexpected" }),
  );
  assert.equal(result.status, "rejected");
  assert.equal(result.status === "rejected" ? result.issues[0]?.code : undefined, "E1");
});

test("H0-004 E4 remains distinct from E5 and synthetic canaries never leave failure paths", async () => {
  const events: DiagnosticEvent[] = [];
  const deps = boundaryDependencies({ diagnostics: { record: (event) => events.push(event) } });
  const canaryEnvelope = {
    ...mutation({ secret: "SECRET_CANARY_H0_004" }, "TOKEN_CANARY_H0_004"),
    requestId: "SECRET_CANARY_H0_004",
  };
  const knownFailure = await invokeServerBoundary(canaryEnvelope, deps, async () => {
    throw new Error("TOKEN_CANARY_H0_004");
  });
  const uncertain = await invokeServerBoundary(
    mutation({}, "uncertain-004"),
    boundaryDependencies({
      replay: { inspect: async () => ({ status: "uncertain" }) },
      diagnostics: { record: (event) => events.push(event) },
    }),
    async () => ({ status: "applied", value: "unexpected" }),
  );
  assert.equal(knownFailure.status === "rejected" ? knownFailure.issues[0]?.code : undefined, "E5");
  assert.equal(uncertain.status === "pending" ? uncertain.issues[0]?.code : undefined, "E4");
  const observable = JSON.stringify({ knownFailure, uncertain, events });
  assert.equal(observable.includes("SECRET_CANARY_H0_004"), false);
  assert.equal(observable.includes("TOKEN_CANARY_H0_004"), false);
});

test("H0-004 configuration fails closed and health reveals no environment values", async () => {
  assert.equal(validateServerConfig({}).status, "invalid");
  assert.equal(validateServerConfig({ CRM_ENV: "unknown", CRM_ALLOWED_ORIGINS: origin }).status, "invalid");
  assert.equal(validateServerConfig({ CRM_ENV: "development", CRM_ALLOWED_ORIGINS: "not-an-origin" }).status, "invalid");
  assert.equal(validateServerConfig({ CRM_ENV: "development", CRM_ALLOWED_ORIGINS: `${origin}/path` }).status, "invalid");
  assert.equal(validateServerConfig({
    CRM_ENV: "development",
    CRM_ALLOWED_ORIGINS: origin,
    UNRELATED_VALUE: "SECRET_CANARY_H0_004",
  }).status, "valid");

  const previousEnvironment = process.env.CRM_ENV;
  const previousOrigins = process.env.CRM_ALLOWED_ORIGINS;
  const previousCanary = process.env.UNRELATED_VALUE;
  try {
    delete process.env.CRM_ENV;
    process.env.CRM_ALLOWED_ORIGINS = "TOKEN_CANARY_H0_004";
    process.env.UNRELATED_VALUE = "SECRET_CANARY_H0_004";
    const response = GET();
    const body = await response.text();
    assert.equal(response.status, 503);
    assert.deepEqual(JSON.parse(body), { status: "denied", code: "CONFIGURATION_INVALID" });
    assert.equal(body.includes("SECRET_CANARY_H0_004"), false);
    assert.equal(body.includes("TOKEN_CANARY_H0_004"), false);
  } finally {
    if (previousEnvironment === undefined) delete process.env.CRM_ENV;
    else process.env.CRM_ENV = previousEnvironment;
    if (previousOrigins === undefined) delete process.env.CRM_ALLOWED_ORIGINS;
    else process.env.CRM_ALLOWED_ORIGINS = previousOrigins;
    if (previousCanary === undefined) delete process.env.UNRELATED_VALUE;
    else process.env.UNRELATED_VALUE = previousCanary;
  }
});
