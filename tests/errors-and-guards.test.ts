import assert from "node:assert/strict";
import test from "node:test";
import { evaluateCommonGuards, guardIds, type CommonGuardFacts } from "../src/domain/guards.ts";
import { errorCodes, semanticIssue } from "../src/domain/semantic-error.ts";

const satisfied: CommonGuardFacts = {
  identityAndScope: "satisfied",
  materialTruth: "satisfied",
  sensitiveSupervision: "not-required",
  conservation: "satisfied",
  independence: "satisfied",
  repetition: "new",
};

test("E1-E8 remain distinct and E4 is not E5", () => {
  assert.equal(new Set(errorCodes).size, 8);
  assert.notDeepEqual(semanticIssue("E4", "effect"), semanticIssue("E5", "effect"));
  assert.equal(semanticIssue("E4", "effect").knownState, "uncertain");
  assert.equal(semanticIssue("E5", "effect").knownState, "unchanged");
  assert.equal(semanticIssue("E5", "secret=value").affectedScope, "restricted");
});

test("G1-G6 are represented and failures remain scoped", () => {
  assert.deepEqual(guardIds, ["G1", "G2", "G3", "G4", "G5", "G6"]);
  const failures = evaluateCommonGuards("synthetic-scope", {
    ...satisfied,
    identityAndScope: "missing",
    materialTruth: "insufficient",
    sensitiveSupervision: "missing",
    conservation: "missing",
    independence: "violated",
    repetition: "uncertain",
  });
  assert.deepEqual(failures.map(({ guard }) => guard), guardIds);
  assert.ok(failures.every(({ issue }) => issue.affectedScope === "synthetic-scope"));
});
