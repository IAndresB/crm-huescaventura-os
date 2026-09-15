import type postgres from "postgres";
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

async function setLocalContext(
  transaction: PostgresTransaction,
  context: TrustedExecutionContext,
): Promise<void> {
  await transaction`
    select
      set_config('crm.identity_id', ${context.identityId}, true),
      set_config('crm.identity_kind', ${context.identityKind}, true),
      set_config('crm.purpose', ${context.purpose}, true),
      set_config('crm.scope', ${context.scope}, true),
      set_config('crm.request_id', ${context.requestId}, true),
      set_config('crm.server_time', ${context.serverTime}, true)
  `;
}

export async function withTrustedPostgresTransaction<T>(
  sql: PostgresSql,
  context: TrustedExecutionContext,
  work: (transaction: PostgresTransaction) => Promise<T>,
): Promise<T> {
  requireTechnicalContext(context);
  return sql.begin(async (transaction) => {
    await setLocalContext(transaction, context);
    return work(transaction);
  }) as Promise<T>;
}
