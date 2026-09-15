import type {
  AtomicCommit,
  AuthorizedProjection,
  AuthorizedQueryPort,
  TransactionPort,
} from "../../application/contracts.ts";
import type { ApplicationResult } from "../../application/result.ts";
import type { TrustedExecutionContext } from "../../application/trusted-context.ts";
import {
  withTrustedPostgresTransaction,
  type PostgresSql,
} from "./transaction.ts";

export interface TechnicalProbeQuery {
  readonly probeId: string;
}

export interface TechnicalProbeProjection {
  readonly probeId: string;
  readonly publicValue: string;
}

export interface RecordTechnicalProbe {
  readonly kind: "record-technical-probe";
  readonly probeId: string;
  readonly publicValue: string;
}

export interface TechnicalCommitResult {
  readonly operationId: string;
  readonly recordedProbeIds: readonly string[];
}

type ProbeRow = {
  probe_id: string;
  public_value: string;
};

export class H0M01PostgresAdapter implements
  AuthorizedQueryPort<TechnicalProbeQuery, TechnicalProbeProjection | undefined>,
  TransactionPort<RecordTechnicalProbe, never, TechnicalCommitResult>
{
  private readonly sql: PostgresSql;

  constructor(sql: PostgresSql) {
    this.sql = sql;
  }

  async read(
    context: TrustedExecutionContext,
    query: TechnicalProbeQuery,
  ): Promise<AuthorizedProjection<TechnicalProbeProjection | undefined>> {
    const data = await withTrustedPostgresTransaction(this.sql, context, async (transaction) => {
      const rows = await transaction<ProbeRow[]>`
        select probe_id, public_value
        from crm_private.access_probe
        where probe_id = ${query.probeId}
      `;
      const row = rows[0];
      return row
        ? { probeId: row.probe_id, publicValue: row.public_value }
        : undefined;
    });
    return { data, provenance: "postgres-h0-m01", certainty: "verified" };
  }

  async commit(
    context: TrustedExecutionContext,
    unit: AtomicCommit<RecordTechnicalProbe, never>,
  ): Promise<ApplicationResult<TechnicalCommitResult>> {
    if (
      unit.operationId.trim().length === 0
      || !unit.historyRequired
      || !unit.resultRequired
      || unit.changes.some((change) => change.kind !== "record-technical-probe")
    ) {
      throw new Error("INVALID_ATOMIC_UNIT");
    }
    const recordedProbeIds = await withTrustedPostgresTransaction(
      this.sql,
      context,
      async (transaction) => {
        const recorded: string[] = [];
        for (const change of unit.changes) {
          const rows = await transaction<{ record_probe: string }[]>`
            select crm_api.record_probe(${change.probeId}, ${change.publicValue})
          `;
          const probeId = rows[0]?.record_probe;
          if (!probeId) throw new Error("PROBE_NOT_RECORDED");
          recorded.push(probeId);
        }
        return recorded;
      },
    );
    return {
      status: "applied",
      value: { operationId: unit.operationId, recordedProbeIds },
    };
  }
}
