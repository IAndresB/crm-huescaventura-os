import { createHash, randomUUID } from "node:crypto";
import type { AtomicCommit, ExternalIntent, TransactionPort } from "../../application/contracts.ts";
import type { ApplicationResult } from "../../application/result.ts";
import type { TrustedExecutionContext } from "../../application/trusted-context.ts";
import { semanticIssue } from "../../domain/semantic-error.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "./f1-codec.ts";
import {
  postgresF1Binding,
  withTrustedPostgresTransaction,
  type PostgresSql,
} from "./transaction.ts";

const identifierPattern = /^[a-z][a-z0-9-]{0,127}$/;
const versionPattern = /^(0|[1-9][0-9]{0,18})$/;

function exactKeys(value: unknown, names: readonly string[]): void {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))
    || Reflect.ownKeys(value).length !== names.length
    || names.some((name) => !Object.hasOwn(value, name))) throw new Error("INVALID_ATOMIC_UNIT");
}

function requiredText(value: unknown, identifier = false): asserts value is string {
  if (typeof value !== "string" || value.length === 0 || Buffer.byteLength(value, "utf8") > 16384
    || value.includes("\0") || (identifier && !identifierPattern.test(value))) {
    throw new Error("INVALID_ATOMIC_UNIT");
  }
}

export interface DurableTechnicalChange {
  readonly kind: "set-technical-state";
  readonly rootId: string;
  readonly afterValue: string;
  readonly reason: string;
  readonly source: string;
  readonly happenedAt?: string;
  readonly evidenceState: "none" | "candidate";
}

export interface DurableTechnicalIntent extends ExternalIntent {
  readonly intentId: string;
}

export interface DurableTechnicalResult {
  readonly operationId: string;
  readonly rootId: string;
  readonly resultingVersion: string;
  readonly afterValue: string;
  readonly materialFingerprint: string;
  readonly effectId?: string;
  readonly intentId?: string;
}

type DurableRow = {
  replayed: boolean;
  operation_id: string;
  root_id: string;
  resulting_version: string;
  after_value: string;
  material_fingerprint: string;
  effect_id: string | null;
  intent_id: string | null;
};

function intentFields(intent: DurableTechnicalIntent | undefined): readonly string[] {
  if (!intent) return ["false", "", "", "", "", ""];
  exactKeys(intent, ["intentId", "effectId", "recipientReference", "contentVersion"]);
  requiredText(intent.intentId, true);
  requiredText(intent.effectId, true);
  requiredText(intent.recipientReference);
  requiredText(intent.contentVersion);
  const contentFingerprint = createHash("sha256").update(encodeF1Fields([
    "CRM-INTENT-MATERIAL1",
    intent.effectId,
    intent.recipientReference,
    intent.contentVersion,
  ])).digest("hex");
  return [
    "true",
    intent.effectId,
    intent.intentId,
    intent.recipientReference,
    intent.contentVersion,
    contentFingerprint,
  ];
}

function materialFields(
  context: TrustedExecutionContext,
  expectedVersion: string,
  change: DurableTechnicalChange,
  intent: DurableTechnicalIntent | undefined,
): readonly string[] {
  return [
    "CRM-UNIT-MATERIAL1",
    "technical-state-change",
    change.rootId,
    expectedVersion,
    change.afterValue,
    change.reason,
    change.source,
    change.happenedAt ?? "",
    change.evidenceState,
    context.identityId,
    context.identityKind,
    context.purpose,
    context.scope,
    ...intentFields(intent),
  ];
}

function validateUnit(
  unit: AtomicCommit<DurableTechnicalChange, DurableTechnicalIntent>,
): { change: DurableTechnicalChange; intent: DurableTechnicalIntent | undefined; expectedVersion: string } {
  const names = unit.intent === undefined
    ? ["operationId", "expectedVersion", "changes", "historyRequired", "resultRequired"]
    : ["operationId", "expectedVersion", "changes", "historyRequired", "resultRequired", "intent"];
  exactKeys(unit, names);
  requiredText(unit.operationId, true);
  if (typeof unit.expectedVersion !== "string" || !versionPattern.test(unit.expectedVersion)
    || unit.historyRequired !== true || unit.resultRequired !== true
    || !Array.isArray(unit.changes) || unit.changes.length !== 1
    || Reflect.ownKeys(unit.changes).length !== 2) throw new Error("INVALID_ATOMIC_UNIT");
  const change = unit.changes[0]!;
  exactKeys(change, change.happenedAt === undefined
    ? ["kind", "rootId", "afterValue", "reason", "source", "evidenceState"]
    : ["kind", "rootId", "afterValue", "reason", "source", "happenedAt", "evidenceState"]);
  if (change.kind !== "set-technical-state" || !["none", "candidate"].includes(change.evidenceState)) {
    throw new Error("INVALID_ATOMIC_UNIT");
  }
  requiredText(change.rootId, true);
  requiredText(change.afterValue);
  requiredText(change.reason);
  requiredText(change.source, true);
  if (change.happenedAt !== undefined
    && (Number.isNaN(Date.parse(change.happenedAt)) || new Date(change.happenedAt).toISOString() !== change.happenedAt)) {
    throw new Error("INVALID_ATOMIC_UNIT");
  }
  const intent = unit.intent;
  intentFields(intent);
  return { change, intent, expectedVersion: unit.expectedVersion };
}

export class H0009PostgresAdapter implements
  TransactionPort<DurableTechnicalChange, DurableTechnicalIntent, DurableTechnicalResult>
{
  private readonly sql: PostgresSql;
  private readonly issue: ReturnType<typeof createF1Issuer>;

  constructor(sql: PostgresSql, configuration: F1SigningConfiguration) {
    this.sql = sql;
    this.issue = createF1Issuer(configuration);
  }

  async commit(
    context: TrustedExecutionContext,
    unit: AtomicCommit<DurableTechnicalChange, DurableTechnicalIntent>,
  ): Promise<ApplicationResult<DurableTechnicalResult>> {
    const { change, intent, expectedVersion } = validateUnit(unit);
    const material = encodeF1Fields(materialFields(context, expectedVersion, change, intent));
    const materialFingerprint = createHash("sha256").update(material).digest("hex");
    const attemptId = randomUUID();
    const input = encodeF1Fields([
      "CRM-UNIT1",
      unit.operationId,
      "technical-state-change",
      change.rootId,
      expectedVersion,
      materialFingerprint,
      attemptId,
      change.reason,
      change.source,
      change.happenedAt ?? "",
      change.afterValue,
      change.evidenceState,
      ...intentFields(intent),
    ]);
    let commandCompleted = false;
    try {
      const row = await withTrustedPostgresTransaction(this.sql, context, async (transaction) => {
        const capability = this.issue(
          context,
          await postgresF1Binding(transaction),
          "C03",
          input,
          { resource: "internal_unit", action: "commit_internal_unit" },
        );
        const rows = await transaction<DurableRow[]>`
          select * from crm_api.commit_internal_unit(${capability.payload},${capability.mac},${input})
        `;
        if (!rows[0]) throw new Error("H0_009_WRITE_DENIED");
        commandCompleted = true;
        return rows[0];
      });
      const value: DurableTechnicalResult = {
        operationId: row.operation_id,
        rootId: row.root_id,
        resultingVersion: row.resulting_version,
        afterValue: row.after_value,
        materialFingerprint: row.material_fingerprint,
        ...(row.effect_id === null ? {} : { effectId: row.effect_id }),
        ...(row.intent_id === null ? {} : { intentId: row.intent_id }),
      };
      return row.replayed ? { status: "previous", value } : { status: "applied", value };
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "H0002" || code === "40001" || code === "40P01") {
        return { status: "rejected", issues: [semanticIssue("E2", context.scope)] };
      }
      if (commandCompleted) {
        return { status: "pending", issues: [semanticIssue("E4", context.scope)] };
      }
      throw new Error("H0_009_WRITE_DENIED");
    }
  }
}
