import type postgres from "postgres";
import type { F1Binding } from "./f1-codec.ts";
import {
  isTrustedContext,
  type TrustedExecutionContext,
} from "../../application/trusted-context.ts";

export type PostgresSql = postgres.Sql;
export type PostgresTransaction = postgres.TransactionSql;

function requireTechnicalContext(context: TrustedExecutionContext): void {
  if (!isTrustedContext(context) || context.identityKind !== "technical") {
    throw new Error("TRUSTED_TECHNICAL_CONTEXT_REQUIRED");
  }
}

export async function postgresF1Binding(transaction: PostgresTransaction): Promise<F1Binding> {
  const rows = await transaction<F1Binding[]>`
    select pg_catalog.pg_current_xact_id()::text as xid,
      pg_catalog.pg_backend_pid()::text as pid,
      (select oid::text from pg_catalog.pg_database where datname = pg_catalog.current_database()) as database,
      (extract(epoch from pg_catalog.pg_postmaster_start_time()) * 1000000)::bigint::text as start,
      session_user::text as login,
      floor(extract(epoch from pg_catalog.clock_timestamp()) * 1000000)::bigint::text as now
  `;
  if (!rows[0]) throw new Error("F1_BINDING_UNAVAILABLE");
  return rows[0];
}

export async function withTrustedPostgresTransaction<T>(
  sql: PostgresSql,
  context: TrustedExecutionContext,
  work: (transaction: PostgresTransaction) => Promise<T>,
): Promise<T> {
  requireTechnicalContext(context);
  return sql.begin("isolation level read committed", async (transaction) => {
    return work(transaction);
  }) as Promise<T>;
}
