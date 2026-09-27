import postgres from "postgres";
import { H0M01PostgresAdapter } from "./h0-m01-adapter.ts";
import { H0009PostgresAdapter } from "./h0-009-adapter.ts";
import { H0011PostgresAdapter } from "./h0-011-adapter.ts";
import type { F1SigningConfiguration } from "./f1-codec.ts";
import type { F2SigningConfiguration } from "./f2-codec.ts";
import type { EvidenceRevalidationProvider } from "../../application/evidence-revalidation.ts";

export interface PostgresRuntime {
  readonly adapter: H0M01PostgresAdapter;
  readonly durableUnit: H0009PostgresAdapter;
  readonly humanApproval: H0011PostgresAdapter;
  close(): Promise<void>;
}

export function createPostgresRuntime(databaseUrl: string, configuration: F1SigningConfiguration,
  humanAuthorization: F2SigningConfiguration, evidenceProvider?: EvidenceRevalidationProvider): PostgresRuntime {
  if (databaseUrl.trim().length === 0) {
    throw new Error("DATABASE_URL_REQUIRED");
  }
  try {
    const sql = postgres(databaseUrl, {
      max: 1,
      prepare: false,
      ssl: "require",
    });
    return Object.freeze({
      adapter: new H0M01PostgresAdapter(sql, configuration),
      durableUnit: new H0009PostgresAdapter(sql, configuration),
      humanApproval: new H0011PostgresAdapter(sql, configuration, humanAuthorization, evidenceProvider),
      close: () => sql.end({ timeout: 5 }),
    });
  } catch {
    // Never expose driver/configuration objects, URLs or key material.
    throw new Error("POSTGRES_RUNTIME_CONFIGURATION_INVALID");
  }
}
