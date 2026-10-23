import type { SemanticIssue } from "../domain/semantic-error.ts";

export type ApplicationResult<T> =
  | { readonly status: "applied"; readonly value: T }
  | { readonly status: "previous"; readonly value: T }
  | { readonly status: "pending"; readonly value?: T; readonly issues: readonly SemanticIssue[] }
  | { readonly status: "rejected"; readonly issues: readonly SemanticIssue[] };
