import postgres from "postgres";
import { H0M01PostgresAdapter } from "./h0-m01-adapter.ts";

export interface PostgresRuntime {
  readonly adapter: H0M01PostgresAdapter;
  close(): Promise<void>;
}

export function createPostgresRuntime(databaseUrl: string): PostgresRuntime {
  if (databaseUrl.trim().length === 0) {
    throw new Error("DATABASE_URL_REQUIRED");
  }
  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: "require",
  });
  return Object.freeze({
    adapter: new H0M01PostgresAdapter(sql),
    close: () => sql.end({ timeout: 5 }),
  });
}
