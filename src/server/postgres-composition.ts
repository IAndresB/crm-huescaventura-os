import {
  createPostgresRuntime,
  type PostgresRuntime,
} from "../infrastructure/postgres/runtime.ts";
import type { F1SigningConfiguration } from "../infrastructure/postgres/f1-codec.ts";

export function composePostgresRuntime(input: {
  readonly databaseUrl: string;
  readonly capability: F1SigningConfiguration;
}): PostgresRuntime {
  return createPostgresRuntime(input.databaseUrl, input.capability);
}
