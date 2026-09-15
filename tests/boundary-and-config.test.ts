import assert from "node:assert/strict";
import test from "node:test";
import { issueTrustedContext } from "../src/application/trusted-context.ts";
import { semanticIssue } from "../src/domain/semantic-error.ts";
import { invokeServerBoundary, type BoundaryDependencies } from "../src/server/boundary.ts";
import { validateServerConfig } from "../src/server/config.ts";

function dependencies(replayStatus: "new" | "previous" | "conflict" | "uncertain" = "new"): BoundaryDependencies {
  return {
    allowedOrigins: new Set(["https://crm.synthetic.invalid"]),
    contexts: {
      resolve: async ({ requestId }) => issueTrustedContext({
        identityId: "technical-synthetic-01",
        identityKind: "technical",
        purpose: "boundary-test",
        scope: "scope-synthetic-01",
        requestId,
        serverTime: "2026-09-15T12:00:00.000Z",
      }),
    },
    fingerprints: { fingerprint: () => "server-fingerprint-synthetic-01" },
    replay: {
      inspect: async <T>() => replayStatus === "previous"
        ? { status: "previous", value: { source: "prior" } as T }
        : { status: replayStatus },
    },
    diagnostics: { record: () => undefined },
  };
}

const validMutation = {
  requestId: "request-synthetic-01",
  kind: "mutation",
  origin: "https://crm.synthetic.invalid",
  payload: { value: "synthetic" },
  operation: { id: "operation-synthetic-01" },
};

test("invalid input and disallowed origin fail closed", async () => {
  const invalid = await invokeServerBoundary({}, dependencies(), async () => ({ status: "applied", value: "unexpected" }));
  assert.equal(invalid.status, "rejected");

  const injectedContext = await invokeServerBoundary(
    { ...validMutation, context: { identityId: "forged-synthetic-01" } },
    dependencies(),
    async () => ({ status: "applied", value: "unexpected" }),
  );
  assert.equal(injectedContext.status, "rejected");

  const disallowed = await invokeServerBoundary({ ...validMutation, origin: "https://outside.synthetic.invalid" }, dependencies(), async () => ({ status: "applied", value: "unexpected" }));
  assert.equal(disallowed.status, "rejected");
});

test("missing trusted context denies without a bypass", async () => {
  const deps = dependencies();
  deps.contexts.resolve = async () => undefined;
  const result = await invokeServerBoundary(validMutation, deps, async () => ({ status: "applied", value: "unexpected" }));
  assert.equal(result.status, "rejected");
});

test("equivalent, conflicting and uncertain replay remain distinct", async () => {
  const handler = async () => ({ status: "rejected", issues: [semanticIssue("E5", "handler")] } as const);
  assert.equal((await invokeServerBoundary(validMutation, dependencies("previous"), handler)).status, "previous");
  const conflict = await invokeServerBoundary(validMutation, dependencies("conflict"), handler);
  assert.equal(conflict.status === "rejected" ? conflict.issues[0]?.code : undefined, "E2");
  const uncertain = await invokeServerBoundary(validMutation, dependencies("uncertain"), handler);
  assert.equal(uncertain.status === "pending" ? uncertain.issues[0]?.code : undefined, "E4");
});

test("internal exceptions become E5 without exposing their message", async () => {
  const result = await invokeServerBoundary(validMutation, dependencies(), async () => {
    throw new Error("synthetic-secret-that-must-not-leak");
  });
  assert.equal(result.status, "rejected");
  assert.equal(result.status === "rejected" ? result.issues[0]?.code : undefined, "E5");
  assert.equal(JSON.stringify(result).includes("synthetic-secret-that-must-not-leak"), false);
});

test("configuration requires an explicit environment and origins", () => {
  assert.deepEqual(validateServerConfig({}), { status: "invalid", code: "CONFIGURATION_INVALID" });
  const result = validateServerConfig({
    CRM_ENV: "development",
    CRM_ALLOWED_ORIGINS: "https://crm.synthetic.invalid",
  });
  assert.equal(result.status, "valid");
});
