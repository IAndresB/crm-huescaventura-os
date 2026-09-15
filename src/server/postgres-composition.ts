import {
  createPostgresRuntime,
  type PostgresRuntime,
} from "../infrastructure/postgres/runtime.ts";

export function composePostgresRuntime(input: {
  readonly databaseUrl: string;
}): PostgresRuntime {
  return createPostgresRuntime(input.databaseUrl);
}
