import postgres from "postgres";
import { H0M01PostgresAdapter } from "./h0-m01-adapter.ts";
import type { F1SigningConfiguration } from "./f1-codec.ts";

export interface PostgresRuntime {
  readonly adapter: H0M01PostgresAdapter;
  close(): Promise<void>;
}

export function createPostgresRuntime(databaseUrl: string, configuration: F1SigningConfiguration): PostgresRuntime {
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
      close: () => sql.end({ timeout: 5 }),
    });
  } catch {
    // Never expose driver/configuration objects, URLs or key material.
    throw new Error("POSTGRES_RUNTIME_CONFIGURATION_INVALID");
  }
}
