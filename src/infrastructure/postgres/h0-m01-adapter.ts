import type {
  AtomicCommit,
  AuthorizedProjection,
  AuthorizedQueryPort,
  TransactionPort,
} from "../../application/contracts.ts";
import type { ApplicationResult } from "../../application/result.ts";
import type { TrustedExecutionContext } from "../../application/trusted-context.ts";
import {
  postgresF1Binding,
  withTrustedPostgresTransaction,
  type PostgresSql,
} from "./transaction.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "./f1-codec.ts";
import { semanticIssue } from "../../domain/semantic-error.ts";

function exactKeys(value: unknown, names: readonly string[]): void {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))
    || Reflect.ownKeys(value).length !== names.length
    || names.some((name) => !Object.hasOwn(value, name))) throw new Error("F1_INVALID_INPUT");
}

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
  private readonly issue: ReturnType<typeof createF1Issuer>;

  constructor(sql: PostgresSql, configuration: F1SigningConfiguration) {
    this.sql = sql;
    this.issue = createF1Issuer(configuration);
  }

  async read(
    context: TrustedExecutionContext,
    query: TechnicalProbeQuery,
  ): Promise<AuthorizedProjection<TechnicalProbeProjection | undefined>> {
    exactKeys(query, ["probeId"]);
    const input = encodeF1Fields(["CRM-INP1", "C01", query.probeId]);
    const data = await withTrustedPostgresTransaction(this.sql, context, async (transaction) => {
      const capability = this.issue(context, await postgresF1Binding(transaction), "C01", input);
      const rows = await transaction<ProbeRow[]>`
        select probe_id, public_value from crm_api.read_probe(${capability.payload},${capability.mac},${input})
      `;
      const row = rows[0];
      return row
        ? { probeId: row.probe_id, publicValue: row.public_value }
        : undefined;
    }).catch(() => { throw new Error("F1_READ_DENIED"); });
    return { data, provenance: "postgres-h0-m01", certainty: "verified" };
  }

  async commit(
    context: TrustedExecutionContext,
    unit: AtomicCommit<RecordTechnicalProbe, never>,
  ): Promise<ApplicationResult<TechnicalCommitResult>> {
    exactKeys(unit, ["operationId", "changes", "historyRequired", "resultRequired"]);
    if (
      typeof unit.operationId !== "string" || unit.operationId.trim().length === 0
      || unit.historyRequired !== true
      || unit.resultRequired !== true
      || !Array.isArray(unit.changes) || unit.changes.length === 0
      || Reflect.ownKeys(unit.changes).length !== unit.changes.length + 1
      || unit.changes.some((change) => change.kind !== "record-technical-probe")
    ) {
      throw new Error("INVALID_ATOMIC_UNIT");
    }
    const fields = ["CRM-INP1", "C03", unit.operationId, "true", "true"];
    for (const change of unit.changes) {
      exactKeys(change, ["kind", "probeId", "publicValue"]);
      fields.push(change.kind, change.probeId, change.publicValue);
    }
    const input = encodeF1Fields(fields);
    let commandCompleted = false;
    try {
      const recordedProbeIds = await withTrustedPostgresTransaction(
        this.sql,
        context,
        async (transaction) => {
          const capability = this.issue(context, await postgresF1Binding(transaction), "C03", input);
          const rows = await transaction<{ recorded: string[] }[]>`
            select crm_api.apply_probe_batch(${capability.payload},${capability.mac},${input}) as recorded
          `;
          if (!rows[0]) throw new Error("F1_WRITE_DENIED");
          commandCompleted = true;
          return rows[0].recorded;
        },
      );
      return {
        status: "applied",
        value: { operationId: unit.operationId, recordedProbeIds },
      };
    } catch {
      if (commandCompleted) return { status: "pending", issues: [semanticIssue("E4", "postgres-unit")] };
      throw new Error("F1_WRITE_DENIED");
    }
  }
}
