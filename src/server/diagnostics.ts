import type { ErrorCode } from "../domain/semantic-error.ts";
import { createHash } from "node:crypto";

export interface DiagnosticEvent {
  readonly requestId: string;
  readonly operationId?: string;
  readonly code?: ErrorCode | "CONFIGURATION_INVALID";
  readonly outcome: "accepted" | "previous" | "pending" | "rejected";
}

export interface DiagnosticSink {
  record(event: DiagnosticEvent): void;
}

export function diagnosticReference(value: string): string {
  return `ref-${createHash("sha256").update(value).digest("hex").slice(0, 16)}`;
}

export const silentDiagnostics: DiagnosticSink = Object.freeze({
  record: (_event: DiagnosticEvent): void => undefined,
});
