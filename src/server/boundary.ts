import { semanticIssue } from "../domain/semantic-error.ts";
import type { ApplicationResult } from "../application/result.ts";
import type { TrustedExecutionContext } from "../application/trusted-context.ts";
import type { DiagnosticSink } from "./diagnostics.ts";

export interface BoundaryEnvelope {
  readonly requestId: string;
  readonly kind: "query" | "mutation";
  readonly origin: string;
  readonly payload: unknown;
  readonly operation?: {
    readonly id: string;
  };
}

export interface ContextResolver {
  resolve(input: {
    readonly requestId: string;
    readonly origin: string;
  }): Promise<TrustedExecutionContext | undefined>;
}

export type ReplayInspection<T> =
  | { readonly status: "new" }
  | { readonly status: "previous"; readonly value: T }
  | { readonly status: "conflict" }
  | { readonly status: "uncertain" };

export interface ReplayPort {
  inspect<T>(
    context: TrustedExecutionContext,
    operationId: string,
    fingerprint: string,
  ): Promise<ReplayInspection<T>>;
}

export interface FingerprintPort {
  fingerprint(payload: unknown): string;
}

export interface BoundaryDependencies {
  readonly allowedOrigins: ReadonlySet<string>;
  readonly contexts: ContextResolver;
  readonly fingerprints: FingerprintPort;
  readonly replay: ReplayPort;
  readonly diagnostics: DiagnosticSink;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseBoundaryEnvelope(value: unknown): BoundaryEnvelope | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const allowedKeys = new Set(["requestId", "kind", "origin", "payload", "operation"]);
  if (Object.keys(record).some((key) => !allowedKeys.has(key))) return undefined;
  if (!isNonEmptyString(record.requestId) || !isNonEmptyString(record.origin)) return undefined;
  if (record.kind !== "query" && record.kind !== "mutation") return undefined;
  if (!("payload" in record)) return undefined;

  let operation: BoundaryEnvelope["operation"];
  if (record.operation !== undefined) {
    if (typeof record.operation !== "object" || record.operation === null) return undefined;
    const candidate = record.operation as Record<string, unknown>;
    if (Object.keys(candidate).some((key) => key !== "id")) return undefined;
    if (!isNonEmptyString(candidate.id)) return undefined;
    operation = { id: candidate.id };
  }
  if (record.kind === "mutation" && operation === undefined) return undefined;

  return {
    requestId: record.requestId,
    kind: record.kind,
    origin: record.origin,
    payload: record.payload,
    operation,
  };
}

export async function invokeServerBoundary<T>(
  raw: unknown,
  dependencies: BoundaryDependencies,
  invoke: (context: TrustedExecutionContext, payload: unknown) => Promise<ApplicationResult<T>>,
): Promise<ApplicationResult<T>> {
  const envelope = parseBoundaryEnvelope(raw);
  if (!envelope) return { status: "rejected", issues: [semanticIssue("E1", "request")] };

  if (!dependencies.allowedOrigins.has(envelope.origin)) {
    dependencies.diagnostics.record({ requestId: envelope.requestId, code: "E1", outcome: "rejected" });
    return { status: "rejected", issues: [semanticIssue("E1", "origin")] };
  }

  let context: TrustedExecutionContext | undefined;
  try {
    context = await dependencies.contexts.resolve({
      requestId: envelope.requestId,
      origin: envelope.origin,
    });
  } catch {
    dependencies.diagnostics.record({ requestId: envelope.requestId, code: "E5", outcome: "rejected" });
    return { status: "rejected", issues: [semanticIssue("E5", "access")] };
  }
  if (!context) {
    dependencies.diagnostics.record({ requestId: envelope.requestId, code: "E1", outcome: "rejected" });
    return { status: "rejected", issues: [semanticIssue("E1", "access")] };
  }

  if (envelope.operation) {
    let replay: ReplayInspection<T>;
    try {
      replay = await dependencies.replay.inspect<T>(
        context,
        envelope.operation.id,
        dependencies.fingerprints.fingerprint(envelope.payload),
      );
    } catch {
      dependencies.diagnostics.record({
        requestId: envelope.requestId,
        operationId: envelope.operation.id,
        code: "E5",
        outcome: "rejected",
      });
      return { status: "rejected", issues: [semanticIssue("E5", "operation")] };
    }
    if (replay.status === "previous") {
      dependencies.diagnostics.record({
        requestId: envelope.requestId,
        operationId: envelope.operation.id,
        outcome: "previous",
      });
      return { status: "previous", value: replay.value };
    }
    if (replay.status === "conflict") {
      dependencies.diagnostics.record({
        requestId: envelope.requestId,
        operationId: envelope.operation.id,
        code: "E2",
        outcome: "rejected",
      });
      return { status: "rejected", issues: [semanticIssue("E2", "operation")] };
    }
    if (replay.status === "uncertain") {
      dependencies.diagnostics.record({
        requestId: envelope.requestId,
        operationId: envelope.operation.id,
        code: "E4",
        outcome: "pending",
      });
      return { status: "pending", issues: [semanticIssue("E4", "operation")] };
    }
  }

  let result: ApplicationResult<T>;
  try {
    result = await invoke(context, envelope.payload);
  } catch {
    dependencies.diagnostics.record({
      requestId: envelope.requestId,
      operationId: envelope.operation?.id,
      code: "E5",
      outcome: "rejected",
    });
    return { status: "rejected", issues: [semanticIssue("E5", "operation")] };
  }
  dependencies.diagnostics.record({
    requestId: envelope.requestId,
    operationId: envelope.operation?.id,
    code: result.status === "rejected" || result.status === "pending" ? result.issues[0]?.code : undefined,
    outcome: result.status === "applied" ? "accepted" : result.status,
  });
  return result;
}
