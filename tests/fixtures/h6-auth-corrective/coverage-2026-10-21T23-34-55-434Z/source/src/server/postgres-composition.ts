import {
  createPostgresRuntime,
  type PostgresRuntime,
} from "../infrastructure/postgres/runtime.ts";
import type { F1SigningConfiguration } from "../infrastructure/postgres/f1-codec.ts";
import type { F2SigningConfiguration } from "../infrastructure/postgres/f2-codec.ts";
import type { EvidenceRevalidationProvider } from "../application/evidence-revalidation.ts";

export function composePostgresRuntime(input: {
  readonly databaseUrl: string;
  readonly humanApprovalDatabaseUrl: string;
  readonly capability: F1SigningConfiguration;
  readonly humanAuthorization: F2SigningConfiguration;
  readonly evidenceProvider?: EvidenceRevalidationProvider;
}): PostgresRuntime {
  return createPostgresRuntime(input.databaseUrl, input.humanApprovalDatabaseUrl, input.capability, input.humanAuthorization, input.evidenceProvider);
}
