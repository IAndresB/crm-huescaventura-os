export const errorCodes = ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"] as const;

export type ErrorCode = (typeof errorCodes)[number];

export type KnownState = "unchanged" | "conflicting" | "pending" | "uncertain";

export interface SemanticIssue {
  readonly code: ErrorCode;
  readonly affectedScope: string;
  readonly knownState: KnownState;
  readonly nextStep:
    | "correct-or-review"
    | "reevaluate-current-state"
    | "supply-required-evidence"
    | "reconcile-before-retry"
    | "retry-only-if-safe"
    | "restore-dependency"
    | "resolve-ambiguity"
    | "review-discrepancy";
}

const descriptors: Record<ErrorCode, Omit<SemanticIssue, "code" | "affectedScope">> = {
  E1: { knownState: "unchanged", nextStep: "correct-or-review" },
  E2: { knownState: "conflicting", nextStep: "reevaluate-current-state" },
  E3: { knownState: "pending", nextStep: "supply-required-evidence" },
  E4: { knownState: "uncertain", nextStep: "reconcile-before-retry" },
  E5: { knownState: "unchanged", nextStep: "retry-only-if-safe" },
  E6: { knownState: "pending", nextStep: "restore-dependency" },
  E7: { knownState: "pending", nextStep: "resolve-ambiguity" },
  E8: { knownState: "conflicting", nextStep: "review-discrepancy" },
};

export function semanticIssue(code: ErrorCode, affectedScope: string): SemanticIssue {
  const safeScope = /^[a-z][a-z0-9-]{0,63}$/.test(affectedScope)
    ? affectedScope
    : "restricted";
  return { code, affectedScope: safeScope, ...descriptors[code] };
}
