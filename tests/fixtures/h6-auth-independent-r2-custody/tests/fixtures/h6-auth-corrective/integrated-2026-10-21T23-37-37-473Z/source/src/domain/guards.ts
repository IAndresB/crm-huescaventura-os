import { semanticIssue, type SemanticIssue } from "./semantic-error.ts";

export const guardIds = ["G1", "G2", "G3", "G4", "G5", "G6"] as const;
export type GuardId = (typeof guardIds)[number];

export interface CommonGuardFacts {
  readonly identityAndScope: "satisfied" | "missing";
  readonly materialTruth: "satisfied" | "insufficient";
  readonly sensitiveSupervision: "satisfied" | "not-required" | "missing";
  readonly conservation: "satisfied" | "missing";
  readonly independence: "satisfied" | "violated";
  readonly repetition: "new" | "equivalent" | "conflicting" | "uncertain";
}

export interface GuardFailure {
  readonly guard: GuardId;
  readonly issue: SemanticIssue;
}

export function evaluateCommonGuards(
  scope: string,
  facts: CommonGuardFacts,
): readonly GuardFailure[] {
  const failures: GuardFailure[] = [];
  if (facts.identityAndScope === "missing") failures.push({ guard: "G1", issue: semanticIssue("E1", scope) });
  if (facts.materialTruth === "insufficient") failures.push({ guard: "G2", issue: semanticIssue("E3", scope) });
  if (facts.sensitiveSupervision === "missing") failures.push({ guard: "G3", issue: semanticIssue("E1", scope) });
  if (facts.conservation === "missing") failures.push({ guard: "G4", issue: semanticIssue("E1", scope) });
  if (facts.independence === "violated") failures.push({ guard: "G5", issue: semanticIssue("E1", scope) });
  if (facts.repetition === "conflicting") failures.push({ guard: "G6", issue: semanticIssue("E2", scope) });
  if (facts.repetition === "uncertain") failures.push({ guard: "G6", issue: semanticIssue("E4", scope) });
  return failures;
}
