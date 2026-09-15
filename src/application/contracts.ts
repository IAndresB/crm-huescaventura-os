import { evaluateCommonGuards, type CommonGuardFacts } from "../domain/guards.ts";
import { semanticIssue } from "../domain/semantic-error.ts";
import type { ApplicationResult } from "./result.ts";
import { isTrustedContext, type TrustedExecutionContext } from "./trusted-context.ts";

export interface ContractRequest<T> {
  readonly context: TrustedExecutionContext;
  readonly scope: string;
  readonly guards: CommonGuardFacts;
  readonly input: T;
}

function rejectedByGuards<T>(request: ContractRequest<T>): ApplicationResult<never> | undefined {
  if (!isTrustedContext(request.context)) {
    return { status: "rejected", issues: [semanticIssue("E1", request.scope)] };
  }
  const failures = evaluateCommonGuards(request.scope, request.guards);
  return failures.length > 0
    ? { status: "rejected", issues: failures.map(({ issue }) => issue) }
    : undefined;
}

export interface AuthorizedProjection<T> {
  readonly data: T;
  readonly provenance: string;
  readonly certainty: "verified" | "pending" | "unknown";
  readonly nextPage?: string;
}

export interface AuthorizedQueryPort<Query, Projection> {
  read(context: TrustedExecutionContext, query: Query): Promise<AuthorizedProjection<Projection>>;
}

export async function invokeC01<Query, Projection>(
  request: ContractRequest<Query>,
  port: AuthorizedQueryPort<Query, Projection>,
): Promise<ApplicationResult<AuthorizedProjection<Projection>>> {
  const rejection = rejectedByGuards(request);
  if (rejection) return rejection;
  return { status: "applied", value: await port.read(request.context, request.input) };
}

export interface DomainDecision<Change> {
  readonly allowedChanges: readonly Change[];
  readonly blockers: readonly string[];
}

export function invokeC02<Input, Change>(
  request: ContractRequest<Input>,
  decide: (input: Input) => DomainDecision<Change>,
): ApplicationResult<DomainDecision<Change>> {
  const rejection = rejectedByGuards(request);
  if (rejection) return rejection;
  return { status: "applied", value: decide(request.input) };
}

export interface AtomicCommit<Change, Intent> {
  readonly operationId: string;
  readonly expectedVersion?: string;
  readonly changes: readonly Change[];
  readonly historyRequired: true;
  readonly resultRequired: true;
  readonly intent?: Intent;
}

export interface TransactionPort<Change, Intent, Output> {
  commit(
    context: TrustedExecutionContext,
    unit: AtomicCommit<Change, Intent>,
  ): Promise<ApplicationResult<Output>>;
}

export async function invokeC03<Change, Intent, Output>(
  request: ContractRequest<AtomicCommit<Change, Intent>>,
  port: TransactionPort<Change, Intent, Output>,
): Promise<ApplicationResult<Output>> {
  const rejection = rejectedByGuards(request);
  if (rejection) return rejection;
  return port.commit(request.context, request.input);
}

export interface EvidenceRegistration {
  readonly sourceReference: string;
  readonly receivedAt: string;
  readonly preservation: "original" | "authorized-manual-record";
  readonly verification?: {
    readonly reviewerIdentityId: string;
    readonly reviewedAt: string;
  };
}

export interface EvidenceRecord {
  readonly evidenceId: string;
  readonly state: "candidate" | "verified";
}

export interface EvidencePort {
  register(
    context: TrustedExecutionContext,
    evidence: EvidenceRegistration,
  ): Promise<{ readonly evidenceId: string }>;
}

export async function invokeC04(
  request: ContractRequest<EvidenceRegistration>,
  port: EvidencePort,
): Promise<ApplicationResult<EvidenceRecord>> {
  const rejection = rejectedByGuards(request);
  if (rejection) return rejection;
  const registered = await port.register(request.context, request.input);
  const value: EvidenceRecord = {
    evidenceId: registered.evidenceId,
    state: request.input.verification === undefined ? "candidate" : "verified",
  };
  return { status: "applied", value };
}

export interface ExternalIntent {
  readonly effectId: string;
  readonly recipientReference: string;
  readonly contentVersion: string;
  readonly approvalReference?: string;
}

export interface PendingExternalIntent {
  readonly intentId: string;
  readonly state: "pending";
}

export interface ExternalIntentPort {
  recordIntent(
    context: TrustedExecutionContext,
    intent: ExternalIntent,
  ): Promise<PendingExternalIntent>;
}

export async function invokeC05(
  request: ContractRequest<ExternalIntent>,
  port: ExternalIntentPort,
): Promise<ApplicationResult<PendingExternalIntent>> {
  const rejection = rejectedByGuards(request);
  if (rejection) return rejection;
  const value = await port.recordIntent(request.context, request.input);
  return { status: "pending", value, issues: [semanticIssue("E6", request.scope)] };
}

export type ScopedEvaluationChange =
  | { readonly kind: "record-assessment"; readonly assessment: string }
  | { readonly kind: "mark-pending"; readonly reason: string }
  | { readonly kind: "request-review"; readonly reason: string };

export interface ScopedEvaluation {
  readonly scope: string;
  readonly changes: readonly ScopedEvaluationChange[];
}

export function invokeC06<Input>(
  request: ContractRequest<Input>,
  evaluate: (input: Input) => ScopedEvaluation,
): ApplicationResult<ScopedEvaluation> {
  const rejection = rejectedByGuards(request);
  if (rejection) return rejection;
  const value = evaluate(request.input);
  if (value.scope !== request.scope) {
    return { status: "rejected", issues: [semanticIssue("E1", request.scope)] };
  }
  return { status: "applied", value };
}
