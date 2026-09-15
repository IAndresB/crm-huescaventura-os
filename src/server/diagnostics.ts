import type { ErrorCode } from "../domain/semantic-error.ts";

export interface DiagnosticEvent {
  readonly requestId: string;
  readonly operationId?: string;
  readonly code?: ErrorCode | "CONFIGURATION_INVALID";
  readonly outcome: "accepted" | "previous" | "pending" | "rejected";
}

export interface DiagnosticSink {
  record(event: DiagnosticEvent): void;
}

export const silentDiagnostics: DiagnosticSink = Object.freeze({
  record: (_event: DiagnosticEvent): void => undefined,
});
