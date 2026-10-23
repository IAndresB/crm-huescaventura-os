import type {RealityCommand} from '../../domain/operational-reality.ts';
import type {BookingPreparationCommand} from '../../domain/booking-preparation.ts';
import type {DepositCommand} from '../../domain/deposit.ts';
import type {RefundCommand} from '../../domain/refund.ts';
import type {ProviderPaymentCommand} from '../../domain/provider-payment.ts';
import {canonicalCommercial} from '../../domain/commercial-progress.ts';
import { createHash, randomUUID } from "node:crypto";
import { isTrustedContext, issueTrustedContext, type TrustedExecutionContext } from "../../application/trusted-context.ts";
import { isVerifiedAuth, type VerifiedAuthEvidence } from "../../application/verified-auth.ts";
import { isVerifiedServerInteraction, type VerifiedServerInteraction } from "../../application/verified-interaction.ts";
import { isVerifiedEvidence, revalidateEvidence, type EvidenceRevalidationProvider,
  type EvidenceRevalidationRequest, type VerifiedEvidence } from "../../application/evidence-revalidation.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "./f1-codec.ts";
import { createF2Issuer, type F2Identity, type F2SigningConfiguration } from "./f2-codec.ts";
import { postgresF1Binding, type PostgresSql, type PostgresTransaction } from "./transaction.ts";

const idPattern = /^[a-z][a-z0-9-]{0,127}$/u;
const hexPattern = /^[0-9a-f]{64}$/u;
type Slot = { readonly state: "not-applicable" | "unknown" } | { readonly state: "value"; readonly value: string };
export interface HumanApprovalPart {
  readonly partId: string;
  readonly action: string;
  readonly contentVersion: string;
  readonly content: string;
  readonly recipient: Slot;
  readonly amount: Slot;
  readonly conditions: Slot;
  readonly scope: string;
  readonly effect: string;
}
export interface HumanApprovalMaterial {
  readonly action: string;
  readonly contentVersion: string;
  readonly content: string;
  readonly recipient: Slot;
  readonly amount: Slot;
  readonly conditions: Slot;
  readonly scope: string;
  readonly effect: string;
  readonly destination: Slot;
  readonly evidence?: { readonly reference: string; readonly fingerprint: string; readonly expiresAt: string };
  readonly parts: readonly HumanApprovalPart[];
}
export interface H0M04Receipt {
  readonly commandState: string;
  readonly proposalId: string;
  readonly decisionId?: string;
  readonly reservationId?: string;
  readonly attemptId?: string;
  readonly state: string;
  readonly materialFingerprint: string;
}
export interface H0M04Proposal {
  readonly proposalId: string;
  readonly materialFingerprint: string;
  readonly material: readonly string[];
  readonly decision?: "approved" | "rejected";
  readonly decisionId?: string;
}
type DbReceipt = { command_state: string; proposal_id: string; decision_id: string | null;
  reservation_id: string | null; attempt_id: string | null; state: string; material_fingerprint: string };
type ActorRow = { actor_id: string; access_generation: string; admin_scope: string; epoch_id: string | null };
type DurableRow = { replayed: boolean; operation_id: string; root_id: string; resulting_version: string;
  after_value: string; material_fingerprint: string; effect_id: string | null; intent_id: string | null };

function assertId(value: string): void { if (typeof value !== "string" || !idPattern.test(value)) throw new Error("H0_011_INVALID_INPUT"); }
function exactKeys(value: unknown, expected: readonly string[]): void {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))
    || Reflect.ownKeys(value).length !== expected.length
    || expected.some((key) => !Object.hasOwn(value, key))) throw new Error("H0_011_INVALID_INPUT");
}
function text(value: string): void {
  if (typeof value !== "string" || Buffer.byteLength(value, "utf8") > 16384 || value.includes("\0")
    || Buffer.from(value, "utf8").toString("utf8") !== value) throw new Error("H0_011_INVALID_INPUT");
}
function slot(value: Slot): readonly [string, string] {
  if (value?.state === "value") { exactKeys(value, ["state", "value"]); text(value.value); return ["value", value.value]; }
  if (value?.state === "unknown" || value?.state === "not-applicable") {
    exactKeys(value, ["state"]); return [value.state, ""];
  }
  throw new Error("H0_011_INVALID_INPUT");
}
function sha(value: Uint8Array): string { return createHash("sha256").update(value).digest("hex"); }
export function fingerprintHumanApprovalPart(part: HumanApprovalPart): string {
  exactKeys(part, ["partId", "action", "contentVersion", "content", "recipient", "amount", "conditions", "scope", "effect"]);
  assertId(part.partId); for (const value of [part.action, part.contentVersion, part.content, part.scope, part.effect]) text(value);
  return sha(encodeF1Fields(["CRM-H0-HA-PART1", part.partId, part.action, part.contentVersion, part.content,
    ...slot(part.recipient), ...slot(part.amount), ...slot(part.conditions), part.scope, part.effect]));
}
function materialBytes(material: HumanApprovalMaterial): Buffer {
  if (!material || typeof material !== "object" || !Array.isArray(material.parts) || material.parts.length < 1 || material.parts.length > 20) throw new Error("H0_011_INVALID_INPUT");
  exactKeys(material, material.evidence === undefined
    ? ["action", "contentVersion", "content", "recipient", "amount", "conditions", "scope", "effect", "destination", "parts"]
    : ["action", "contentVersion", "content", "recipient", "amount", "conditions", "scope", "effect", "destination", "evidence", "parts"]);
  if (Reflect.ownKeys(material.parts).length !== material.parts.length + 1
    || Array.from({ length: material.parts.length }, (_, index) => Object.hasOwn(material.parts, String(index))).some((present) => !present)) {
    throw new Error("H0_011_INVALID_INPUT");
  }
  const recipient = slot(material.recipient); const amount = slot(material.amount);
  const conditions = slot(material.conditions); const destination = slot(material.destination);
  for (const value of [material.action, material.contentVersion, material.content, material.scope, material.effect]) text(value);
  const evidence = material.evidence;
  if (evidence) {
    exactKeys(evidence, ["reference", "fingerprint", "expiresAt"]);
    if (!hexPattern.test(evidence.fingerprint) || !evidence.reference || !evidence.expiresAt
      || Number.isNaN(Date.parse(evidence.expiresAt))) throw new Error("H0_011_INVALID_INPUT");
  }
  const fields = ["CRM-H0-HA-MATERIAL1", "1", material.action, material.contentVersion, material.content,
    ...recipient, ...amount, ...conditions, material.scope, material.effect, ...destination,
    evidence ? "required" : "none", evidence?.reference ?? "", evidence?.fingerprint ?? "", evidence?.expiresAt ?? "",
    String(material.parts.length)];
  for (const part of material.parts) {
    exactKeys(part, ["partId", "action", "contentVersion", "content", "recipient", "amount", "conditions", "scope", "effect"]);
    assertId(part.partId); for (const value of [part.action, part.contentVersion, part.content, part.scope, part.effect]) text(value);
    const p = encodeF1Fields(["CRM-H0-HA-PART1", part.partId, part.action, part.contentVersion, part.content,
      ...slot(part.recipient), ...slot(part.amount), ...slot(part.conditions), part.scope, part.effect]);
    fields.push(part.partId, p.toString("hex"), sha(p));
  }
  const bytes = encodeF1Fields(fields);
  if (bytes.length > 16384) throw new Error("H0_011_INVALID_INPUT");
  return bytes;
}
export function fingerprintHumanApprovalMaterial(material: HumanApprovalMaterial): string {
  return sha(materialBytes(material));
}
function intentMaterial(effectId: string, recipientReference: string, contentVersion: string) {
  return ["true", effectId, `intent-${effectId.slice(7)}`, recipientReference, contentVersion,
    sha(encodeF1Fields(["CRM-INTENT-MATERIAL1", effectId, recipientReference, contentVersion]))];
}

export class H0011PostgresAdapter {
  private readonly sql: PostgresSql;
  private readonly f1: ReturnType<typeof createF1Issuer>;
  private readonly f2: ReturnType<typeof createF2Issuer>;
  private readonly f1Config: F1SigningConfiguration;
  private readonly technicalIdentity = "h0-011-server-bridge";
  private readonly technicalPurpose = "h0-011-human-approval";
  private readonly humanUnitPurpose = "h0-011-human-unit";
  private readonly evidencePurpose = "h0-011-evidence-revalidation";
  private readonly evidenceProvider?: EvidenceRevalidationProvider;

  constructor(sql: PostgresSql, f1: F1SigningConfiguration, f2: F2SigningConfiguration,
    evidenceProvider?: EvidenceRevalidationProvider) {
    if (Buffer.from(f1.key).equals(Buffer.from(f2.key))) throw new Error("H0_011_KEY_SEPARATION_REQUIRED");
    this.sql = sql; this.f1Config = f1; this.f1 = createF1Issuer(f1); this.f2 = createF2Issuer(f2);
    this.evidenceProvider = evidenceProvider;
  }

  private evidenceContext(scope: string) {
    return issueTrustedContext({ identityId: this.technicalIdentity, identityKind: "technical",
      purpose: this.evidencePurpose, scope, requestId: randomUUID(), serverTime: new Date().toISOString() });
  }

  private async evidenceForCommand(q: Buffer, request: EvidenceRevalidationRequest,
    auth: VerifiedAuthEvidence): Promise<VerifiedEvidence | undefined> {
    // Probe returns only existence, never a result or permission. The actual
    // replay below still goes through the original F1/F2 command and ledger.
    const replay = await this.sql.begin("isolation level read committed", async (tx) => {
      const identity = await this.identity(tx, auth);
      if (identity.scope !== request.scope) throw new Error("H0_011_CONTEXT_DENIED");
      const cap = this.f1(this.evidenceContext(request.scope), await postgresF1Binding(tx), "C01", q,
        { resource: "human_approval_evidence", action: "check_replay" });
      const [row] = await tx`select crm_api.h0_m04_evidence_replay(${cap.payload},${cap.mac},${q}) as present`;
      return row?.present === true;
    });
    if (replay) return undefined;
    if (!this.evidenceProvider) throw new Error("EVIDENCE_REVALIDATION_DENIED");
    // No PostgreSQL transaction/locks are held while a provider is contacted.
    return revalidateEvidence(this.evidenceProvider, request);
  }

  private async identity(tx: PostgresTransaction, auth: VerifiedAuthEvidence): Promise<F2Identity> {
    if (!isVerifiedAuth(auth) || !auth.sessionId || !auth.mfaVerified) throw new Error("H0_011_HUMAN_AUTH_REQUIRED");
    const rows = await tx<ActorRow[]>`select actor_id::text,access_generation::text,admin_scope,epoch_id::text
      from crm_api.f2_lookup(${auth.subject}::uuid,${auth.sessionId}::uuid)`;
    const row = rows[0]; if (!row?.epoch_id) throw new Error("H0_011_HUMAN_AUTH_REQUIRED");
    return { actorId: row.actor_id, sessionId: auth.sessionId, epochId: row.epoch_id,
      accessGeneration: row.access_generation, scope: row.admin_scope };
  }

  private technicalContext(scope: string, human: boolean): TrustedExecutionContext {
    const purpose = human ? this.humanUnitPurpose : this.technicalPurpose;
    if (!this.f1Config.allowedPurposes.includes(purpose)) throw new Error("H0_011_CONFIGURATION_INVALID");
    return issueTrustedContext({ identityId: this.technicalIdentity, identityKind: "technical",
      purpose, scope, requestId: randomUUID(), serverTime: new Date().toISOString() });
  }

  private async commitLedger(tx: PostgresTransaction, context: TrustedExecutionContext, commandId: string,
    state: string, intent: { effectId: string; recipientReference: string; contentVersion: string } | undefined,
    human: { payload: Buffer; mac: Buffer; input: Buffer } | undefined) {
    const attemptId = `attempt-${randomUUID()}`;
    const rootId = `ha-${commandId}`;
    const i = intent ? intentMaterial(intent.effectId, intent.recipientReference, intent.contentVersion)
      : ["false", "", "", "", "", ""];
    const fields = ["CRM-UNIT-MATERIAL1", "technical-state-change", rootId, "0", state,
      `H0-011 ${state}`, "h0-011", "", "none", context.identityId, context.identityKind,
      context.purpose, context.scope, ...i];
    const fp = sha(encodeF1Fields(fields));
    const q = encodeF1Fields(["CRM-UNIT1", commandId, "technical-state-change", rootId, "0", fp,
      attemptId, `H0-011 ${state}`, "h0-011", "", state, "none", ...i]);
    const cap = this.f1(context, await postgresF1Binding(tx), "C03", q,
      { resource: "internal_unit", action: "commit_internal_unit" });
    // The human overload revalidates the ORIGINAL F2 after delegated M02
    // work. The TTE then drains constraints and performs finalization.
    const result = human
      ? await tx<DurableRow[]>`select * from crm_api.commit_internal_unit(${cap.payload},${cap.mac},${q},${human.payload},${human.mac},${human.input})`
      : await tx<DurableRow[]>`select * from crm_api.commit_internal_unit(${cap.payload},${cap.mac},${q})`;
    if (!result[0]) throw new Error("H0_011_LEDGER_DENIED");
    return result[0];
  }

  private async command(input: { action: string; commandId: string; data: readonly string[];
    human?: { auth: VerifiedAuthEvidence; interaction: VerifiedServerInteraction };
    scope?: string; context?: TrustedExecutionContext; ledgerState: string;
    intent?: { effectId: string; recipientReference: string; contentVersion: string };
    providerPayment?: ProviderPaymentCommand; refund?:RefundCommand; deposit?:DepositCommand; bookingPreparation?:BookingPreparationCommand; reality?:RealityCommand; evidence?: EvidenceRevalidationRequest }): Promise<H0M04Receipt> {
    assertId(input.commandId);
    if (input.human && !isVerifiedServerInteraction(input.human.interaction, "interactive_action")) throw new Error("H0_011_INTERACTION_REQUIRED");
    const q = encodeF1Fields(["CRM-H0-M04", input.action, input.commandId, ...input.data]);
    let commitStarted = false;
    try {
      if (input.human && (!isVerifiedAuth(input.human.auth) || !input.human.auth.mfaVerified)) throw new Error("H0_011_HUMAN_AUTH_REQUIRED");
      const evidence = input.evidence && input.human
        ? await this.evidenceForCommand(q, input.evidence, input.human.auth) : undefined;
      return await this.sql.begin("isolation level read committed", async (tx) => {
      const identity = input.human ? await this.identity(tx, input.human.auth) : undefined;
      const scope = identity?.scope ?? input.scope;
      if (!scope) throw new Error("H0_011_SCOPE_REQUIRED");
      const context = input.context ?? this.technicalContext(scope, input.human !== undefined);
      if (!isTrustedContext(context) || context.identityKind !== "technical" || context.scope !== scope
        || !this.f1Config.allowedPurposes.includes(context.purpose)
        || (input.human !== undefined) !== (context.purpose === this.humanUnitPurpose)) {
        throw new Error("H0_011_CONTEXT_DENIED");
      }
      const binding = await postgresF1Binding(tx);
      const f1 = this.f1(context, binding, "C03", q,
        { resource: "human_approval", action: "manage_effect" });
      const f2 = identity && input.human
        ? this.f2(input.human.auth, identity, binding, "C03", q, input.human.interaction)
        : { payload: null, mac: null };
      if (evidence && input.evidence) {
        if (!isVerifiedEvidence(evidence)) throw new Error("EVIDENCE_REVALIDATION_DENIED");
        const micros = (value: string) => (BigInt(Date.parse(value)) * 1000n).toString();
        const eq = encodeF1Fields(["CRM-HA-EVIDENCE1", input.commandId, input.evidence.proposalId,
          input.evidence.partId, sha(q), evidence.reference, evidence.fingerprint, micros(evidence.checkedAt),
          micros(evidence.validUntil), micros(evidence.effectiveValidUntil), evidence.verifierIdentity, evidence.verifierKind]);
        const cap = this.f1(this.evidenceContext(scope), binding, "C03", eq,
          { resource: "human_approval_evidence", action: "revalidate_evidence" });
        await tx`select crm_api.h0_m04_revalidate_evidence(${cap.payload},${cap.mac},${eq},${f2.payload},${f2.mac},${q})`;
      }
      const rows = await tx.unsafe<DbReceipt[]>("select * from crm_api.h0_m04_command($1,$2,$3,$4,$5)",
        [f2.payload, f2.mac, f1.payload, f1.mac, q]);
      if (!rows[0]) throw new Error("H0_011_COMMAND_DENIED");
      if (input.providerPayment) {
        await tx.unsafe("select crm_api.provider_payment_sensitive_schedule($1,$2,$3,$4,$5,convert_from($6::bytea,'UTF8')::jsonb)",
          [f2.payload,f2.mac,f1.payload,f1.mac,q,Buffer.from(canonicalCommercial(input.providerPayment),"utf8")]);
      }
      if(input.refund) await tx.unsafe("select crm_api.refund_sensitive_authorize($1,$2,$3,$4,$5,convert_from($6::bytea,'UTF8')::jsonb)",[f2.payload,f2.mac,f1.payload,f1.mac,q,Buffer.from(canonicalCommercial(input.refund),'utf8')]);
      if(input.deposit) await tx.unsafe("select crm_api.deposit_sensitive_determine($1,$2,$3,$4,$5,convert_from($6::bytea,'UTF8')::jsonb)",[f2.payload,f2.mac,f1.payload,f1.mac,q,Buffer.from(canonicalCommercial(input.deposit),'utf8')]);
      if(input.bookingPreparation) await tx.unsafe("select crm_api.booking_preparation_sensitive($1,$2,$3,$4,$5,convert_from($6::bytea,'UTF8')::jsonb)",[f2.payload,f2.mac,f1.payload,f1.mac,q,Buffer.from(canonicalCommercial(input.bookingPreparation),'utf8')]);
      if(input.reality) await tx.unsafe("select crm_api.reality_sensitive($1,$2,$3,$4,$5,convert_from($6::bytea,'UTF8')::jsonb)",[f2.payload,f2.mac,f1.payload,f1.mac,q,Buffer.from(canonicalCommercial(input.reality),'utf8')]);
      await this.commitLedger(tx, context, input.commandId, input.ledgerState, input.intent,
        f2.payload && f2.mac ? { payload: f2.payload, mac: f2.mac, input: q } : undefined);
      const r = rows[0];
      const receipt: H0M04Receipt = { commandState: r.command_state, proposalId: r.proposal_id,
        ...(r.decision_id ? { decisionId: r.decision_id } : {}),
        ...(r.reservation_id ? { reservationId: r.reservation_id } : {}),
        ...(r.attempt_id ? { attemptId: r.attempt_id } : {}), state: r.state,
        materialFingerprint: r.material_fingerprint };
      {
        // D039: drain deferred work before the mandatory final check, then
        // initiate COMMIT in this same private server message. No caller hook.
        commitStarted = true;
        await tx.unsafe(`set constraints all immediate; ${input.providerPayment ? `select crm_api.provider_payment_finalize('${input.commandId}'); ` : ''}${input.refund ? `select crm_api.refund_finalize('${input.commandId}'); ` : ''}${input.deposit ? `select crm_api.deposit_finalize('${input.commandId}'); ` : ''}${input.bookingPreparation ? `select crm_api.booking_preparation_finalize('${input.commandId}'); ` : ''}${input.reality ? `select crm_api.reality_finalize('${input.commandId}'); ` : ''}select crm_api.h0_m04_finalize_evidence('${input.commandId}'); commit`);
      }
      return receipt;
    }); } catch (error) {
      // A transport failure after dispatch cannot prove rollback. Keep the
      // stable command identity; recovery must ask for the same operation.
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (commitStarted && (!/^[0-9A-Z]{5}$/.test(code) || code.startsWith("08") || code.startsWith("57"))) {
        throw new HumanApprovalCommitUncertainError(input.commandId);
      }
      if (error && typeof error === "object" && "code" in error && error.code === "H0002") {
        throw new Error("H0_011_CONFLICT_E2");
      }
      throw new Error(`H0_011_${input.action.toUpperCase()}_DENIED`);
    }
  }

  propose(auth: VerifiedAuthEvidence, interaction: VerifiedServerInteraction, proposalId: string,
    proposerKind: "human" | "ai", material: HumanApprovalMaterial) {
    assertId(proposalId); const raw = materialBytes(material);
    return this.command({ action: "propose", commandId: proposalId, data: [proposerKind, raw.toString("hex")],
      human: { auth, interaction }, scope: material.scope, ledgerState: "proposal" });
  }

  decide(auth: VerifiedAuthEvidence, interaction: VerifiedServerInteraction, commandId: string,
    proposalId: string, decisionId: string, decision: "approved" | "rejected", reason: string,
    materialFingerprint: string) {
    assertId(proposalId); assertId(decisionId); text(reason); if (!hexPattern.test(materialFingerprint)) throw new Error("H0_011_INVALID_INPUT");
    return this.command({ action: "decide", commandId, data: [encodeF1Fields([proposalId, decisionId, decision, reason, materialFingerprint]).toString("hex")],
      human: { auth, interaction }, ledgerState: `decision-${decision}` });
  }

  private reserveUnit(auth: VerifiedAuthEvidence, interaction: VerifiedServerInteraction, commandId: string,
    proposalId: string, decisionId: string, partId: string, proposalFingerprint: string,
    partFingerprint: string, material: HumanApprovalMaterial, providerPayment?: ProviderPaymentCommand, refund?:RefundCommand, deposit?:DepositCommand, bookingPreparation?:BookingPreparationCommand, reality?:RealityCommand) {
    assertId(proposalId); assertId(decisionId); assertId(partId);
    if (fingerprintHumanApprovalMaterial(material) !== proposalFingerprint) throw new Error("H0_011_MATERIAL_CHANGED");
    const approvedPart = material.parts.find((part) => part.partId === partId);
    if (!approvedPart || fingerprintHumanApprovalPart(approvedPart) !== partFingerprint) throw new Error("H0_011_PART_CHANGED");
    const recipient = slot(approvedPart.recipient);
    if (recipient[0] !== "value" || !recipient[1]) throw new Error("H0_011_RECIPIENT_REQUIRED");
    const stablePartKey = Buffer.from(`${proposalId}:${partId}`, "utf8");
    const stableHash = sha(stablePartKey).slice(0, 32);
    const effectId = `effect-${stableHash}`;
    const intentId = `intent-${stableHash}`;
    const data = encodeF1Fields([proposalId, decisionId, partId, proposalFingerprint, partFingerprint, effectId, intentId]).toString("hex");
    return this.command({ action: "reserve", commandId, data: [data], human: { auth, interaction },
      ...(material.evidence ? { evidence: { reference: material.evidence.reference, fingerprint: material.evidence.fingerprint,
        approvedExpiresAt: material.evidence.expiresAt,
        proposalId, commandId, partId, materialFingerprint: proposalFingerprint, scope: material.scope } } : {}),
      ...(providerPayment ? {providerPayment} : {}), ...(refund?{refund}:{}), ...(deposit?{deposit}:{}),...(bookingPreparation?{bookingPreparation}:{}),...(reality?{reality}:{}), ledgerState: "reserved", intent: { effectId, recipientReference: recipient[1], contentVersion: approvedPart.contentVersion } });
  }

  reserve(auth: VerifiedAuthEvidence, interaction: VerifiedServerInteraction, commandId: string,
    proposalId: string, decisionId: string, partId: string, proposalFingerprint: string,
    partFingerprint: string, material: HumanApprovalMaterial) {
    return this.reserveUnit(auth,interaction,commandId,proposalId,decisionId,partId,proposalFingerprint,partFingerprint,material);
  }

  scheduleProviderPayment(auth: VerifiedAuthEvidence, interaction: VerifiedServerInteraction, commandId: string,
    proposalId: string, decisionId: string, partId: string, proposalFingerprint: string,
    partFingerprint: string, material: HumanApprovalMaterial, input: ProviderPaymentCommand) {
    if (input.action !== 'schedule' || canonicalCommercial(input) !== material.parts.find(p => p.partId===partId)?.content)
      throw new Error('H0_011_PROVIDER_PAYMENT_MATERIAL_CHANGED');
    return this.reserveUnit(auth,interaction,commandId,proposalId,decisionId,partId,proposalFingerprint,partFingerprint,material,input);
  }

  authorizeRefund(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,commandId:string,proposalId:string,decisionId:string,partId:string,proposalFingerprint:string,partFingerprint:string,material:HumanApprovalMaterial,input:RefundCommand){
    if(input.action!=='authorize'||canonicalCommercial(input)!==material.parts.find(p=>p.partId===partId)?.content)throw new Error('H0_011_REFUND_MATERIAL_CHANGED');
    return this.reserveUnit(auth,interaction,commandId,proposalId,decisionId,partId,proposalFingerprint,partFingerprint,material,undefined,input);
  }

  evaluateBookingPreparation(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,commandId:string,proposalId:string,decisionId:string,partId:string,proposalFingerprint:string,partFingerprint:string,material:HumanApprovalMaterial,input:BookingPreparationCommand){
    return this.reserveUnit(auth,interaction,commandId,proposalId,decisionId,partId,proposalFingerprint,partFingerprint,material,undefined,undefined,undefined,input);
  }

  recordReality(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,commandId:string,proposalId:string,decisionId:string,partId:string,proposalFingerprint:string,partFingerprint:string,material:HumanApprovalMaterial,input:RealityCommand){
    if(canonicalCommercial(input)!==material.parts.find(p=>p.partId===partId)?.content)throw new Error('H0_011_REALITY_MATERIAL_CHANGED');
    return this.reserveUnit(auth,interaction,commandId,proposalId,decisionId,partId,proposalFingerprint,partFingerprint,material,undefined,undefined,undefined,undefined,input);
  }

  determineDeposit(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,commandId:string,proposalId:string,decisionId:string,partId:string,proposalFingerprint:string,partFingerprint:string,material:HumanApprovalMaterial,input:DepositCommand){
    if(input.action!=='determine'||canonicalCommercial(input)!==material.parts.find(p=>p.partId===partId)?.content)throw new Error('H0_011_DEPOSIT_MATERIAL_CHANGED');
    return this.reserveUnit(auth,interaction,commandId,proposalId,decisionId,partId,proposalFingerprint,partFingerprint,material,undefined,undefined,input);
  }

  recordAttempt(context: TrustedExecutionContext, commandId: string, reservationId: string, attemptId: string) {
    if (!isTrustedContext(context)) throw new Error("TRUSTED_TECHNICAL_CONTEXT_REQUIRED");
    assertId(reservationId); assertId(attemptId);
    return this.command({ action: "attempt", commandId, data: [encodeF1Fields([reservationId, attemptId]).toString("hex")],
      scope: context.scope, context, ledgerState: "attempting" });
  }

  recordOutcome(context: TrustedExecutionContext, commandId: string, reservationId: string, attemptId: string,
    outcome: "succeeded" | "failed" | "uncertain", resultReference: string) {
    if (!isTrustedContext(context)) throw new Error("TRUSTED_TECHNICAL_CONTEXT_REQUIRED");
    assertId(reservationId); assertId(attemptId); text(resultReference);
    return this.command({ action: "outcome", commandId, data: [encodeF1Fields([reservationId, attemptId, outcome, resultReference]).toString("hex")],
      scope: context.scope, context, ledgerState: outcome, });
  }

  reconcile(context: TrustedExecutionContext, commandId: string, reservationId: string, attemptId: string,
    outcome: "succeeded" | "failed", resultReference: string) {
    if (!isTrustedContext(context)) throw new Error("TRUSTED_TECHNICAL_CONTEXT_REQUIRED");
    assertId(reservationId); assertId(attemptId); text(resultReference);
    return this.command({ action: "reconcile", commandId,
      data: [encodeF1Fields([reservationId, attemptId, outcome, resultReference]).toString("hex")],
      scope: context.scope, context, ledgerState: `reconciled-${outcome}` });
  }

  async readProposal(auth: VerifiedAuthEvidence, interaction: VerifiedServerInteraction,
    proposalId: string): Promise<H0M04Proposal | undefined> {
    assertId(proposalId);
    if (!isVerifiedServerInteraction(interaction, "interactive_read")) throw new Error("H0_011_INTERACTION_REQUIRED");
    if (!isVerifiedAuth(auth) || !auth.sessionId || !auth.mfaVerified) throw new Error("H0_011_HUMAN_AUTH_REQUIRED");
    try {
      return this.sql.begin("isolation level read committed", async (tx) => {
        const identity = await this.identity(tx, auth);
        const input = encodeF1Fields(["CRM-INP1", "C01", proposalId]);
        const binding = await postgresF1Binding(tx);
        const f1 = this.f1(this.technicalContext(identity.scope, false), binding, "C01", input,
          { resource: "human_approval", action: "read_proposal" });
        const f2 = this.f2(auth, identity, binding, "C01", input, interaction);
        const rows = await tx<{ proposal_id: string; material_fingerprint: string; material_payload: Buffer;
          decision: "approved" | "rejected" | null; decision_id: string | null }[]>`
          select * from crm_api.h0_m04_read_proposal(${f2.payload},${f2.mac},${f1.payload},${f1.mac},${input},${proposalId})`;
        const row = rows[0];
        if (!row) return undefined;
        return { proposalId: row.proposal_id, materialFingerprint: row.material_fingerprint,
          material: decodeF1(row.material_payload),
          ...(row.decision ? { decision: row.decision } : {}),
          ...(row.decision_id ? { decisionId: row.decision_id } : {}) };
      }) as Promise<H0M04Proposal | undefined>;
    } catch { throw new Error("H0_011_READ_DENIED"); }
  }
}

function decodeF1(raw: Uint8Array): string[] {
  const bytes = Buffer.from(raw); const fields: string[] = []; let offset = 0;
  while (offset < bytes.length) {
    if (offset + 4 > bytes.length) throw new Error("H0_011_INVALID_STORED_MATERIAL");
    const length = bytes.readUInt32BE(offset); offset += 4;
    if (length > 16384 || offset + length > bytes.length) throw new Error("H0_011_INVALID_STORED_MATERIAL");
    const value = bytes.subarray(offset, offset + length).toString("utf8");
    if (Buffer.from(value, "utf8").compare(bytes.subarray(offset, offset + length)) !== 0) throw new Error("H0_011_INVALID_STORED_MATERIAL");
    fields.push(value); offset += length;
  }
  if (offset !== bytes.length || bytes.length > 16384) throw new Error("H0_011_INVALID_STORED_MATERIAL");
  return fields;
}

export class HumanApprovalCommitUncertainError extends Error {
  readonly commandId: string;
  constructor(commandId: string) {
    super("H0_011_COMMIT_UNCERTAIN");
    this.name = "HumanApprovalCommitUncertainError";
    this.commandId = commandId;
  }
}
