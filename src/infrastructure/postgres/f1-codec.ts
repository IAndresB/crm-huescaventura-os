import { createHash, createHmac, randomUUID } from "node:crypto";
import { isTrustedContext, type TrustedExecutionContext } from "../../application/trusted-context.ts";

// F1 v1: ordered UTF-8 fields, each prefixed by an unsigned big-endian uint32.
// No optional fields, normalization, JSON serialization or implicit coercion.
export function encodeF1Fields(fields: readonly string[]): Buffer {
  const chunks: Buffer[] = [];
  let size = 0;
  for (const field of fields) {
    if (typeof field !== "string" || Buffer.from(field, "utf8").toString("utf8") !== field || field.includes("\0")) {
      throw new Error("F1_INVALID_INPUT");
    }
    const bytes = Buffer.from(field, "utf8");
    size += 4 + bytes.length;
    if (bytes.length > 16384 || size > 65536) throw new Error("F1_INVALID_INPUT");
    const length = Buffer.alloc(4);
    length.writeUInt32BE(bytes.length);
    chunks.push(length, bytes);
  }
  return Buffer.concat(chunks);
}

export interface F1Binding {
  xid: string;
  pid: string;
  database: string;
  start: string;
  login: string;
  now: string;
}

export interface F1SigningConfiguration {
  readonly keyId: string;
  readonly key: Uint8Array;
  readonly audience: string;
  readonly generation: string;
  readonly allowedPurposes: readonly string[];
}

export interface F1Capability {
  readonly payload: Buffer;
  readonly mac: Buffer;
}

export interface F1AuthorizationTarget {
  readonly resource:
    | "access_probe"
    | "internal_unit"
    | "human_approval"
    | "human_approval_evidence"
    | "global_access_revocation"
    | "access_recovery"
    | "identities";
  readonly action:
    | "read_probe"
    | "apply_probe_batch"
    | "commit_internal_unit"
    | "read_proposal"
    | "manage_effect"
    | "revalidate_evidence"
    | "check_replay"
    | "record_auth_outcome"
    | "begin"
    | "complete"
    | "read_identity"
    | "write_identity";
}

function targetFor(
  operation: "C01" | "C03",
  target?: F1AuthorizationTarget,
): F1AuthorizationTarget {
  const selected = target ?? {
    resource: "access_probe",
    action: operation === "C01" ? "read_probe" : "apply_probe_batch",
  };
  const allowed = (
    operation === "C01"
      && selected.resource === "access_probe"
      && selected.action === "read_probe"
  ) || (
    operation === "C03"
      && selected.resource === "access_probe"
      && selected.action === "apply_probe_batch"
  ) || (
    operation === "C03"
      && selected.resource === "internal_unit"
      && selected.action === "commit_internal_unit"
  ) || (
    operation === "C01"
      && selected.resource === "human_approval"
      && selected.action === "read_proposal"
  ) || (
    operation === "C03"
      && selected.resource === "human_approval"
      && selected.action === "manage_effect"
  ) || (
    selected.resource === "human_approval_evidence"
      && ((operation === "C03" && selected.action === "revalidate_evidence")
        || (operation === "C01" && selected.action === "check_replay"))
  ) || (
    operation === "C03"
      && selected.resource === "global_access_revocation"
      && selected.action === "record_auth_outcome"
  ) || (
    operation === "C03"
      && selected.resource === "access_recovery"
      && ["begin", "record_auth_outcome", "complete"].includes(selected.action)
  ) || (
    selected.resource === "identities"
      && ((operation === "C01" && selected.action === "read_identity")
        || (operation === "C03" && selected.action === "write_identity"))
  );
  if (!allowed) throw new Error("F1_AUTHORIZATION_DENIED");
  return selected;
}

export function createF1Issuer(configuration: F1SigningConfiguration) {
  if (configuration.key.byteLength !== 32 || configuration.allowedPurposes.length === 0) {
    throw new Error("F1_CONFIGURATION_INVALID");
  }
  const key = Buffer.from(configuration.key);
  const { keyId, audience, generation } = configuration;
  if ([keyId, audience, generation].some((value) => typeof value !== "string" || !value.trim())) {
    throw new Error("F1_CONFIGURATION_INVALID");
  }
  if (configuration.allowedPurposes.some((purpose) => typeof purpose !== "string" || !purpose.trim())) {
    throw new Error("F1_CONFIGURATION_INVALID");
  }
  encodeF1Fields([keyId, audience, generation, ...configuration.allowedPurposes]);
  const purposes = new Set(configuration.allowedPurposes);
  return (
    context: TrustedExecutionContext,
    binding: F1Binding,
    operation: "C01" | "C03",
    input: Buffer,
    requestedTarget?: F1AuthorizationTarget,
  ): F1Capability => {
    if (!isTrustedContext(context) || context.identityKind !== "technical"
      || !purposes.has(context.purpose) || !f1LoginAllows(binding.login, context.purpose, operation, targetFor(operation, requestedTarget))
      || input.length > 65536) throw new Error("F1_AUTHORIZATION_DENIED");
    const target = targetFor(operation, requestedTarget);
    const now = BigInt(binding.now);
    const payload = encodeF1Fields([
      "CRM-H0F1", "1", keyId, audience, generation,
      binding.database, binding.start, binding.xid, binding.pid, binding.login,
      context.identityId, context.identityKind, context.purpose, context.scope,
      operation, target.resource, target.action,
      createHash("sha256").update(input).digest("hex"),
      now.toString(), (now + 30000000n).toString(), randomUUID(),
    ]);
    return { payload, mac: createHmac("sha256", key).update(payload).digest() };
  };
}

function f1LoginAllows(login: string, purpose: string, operation: string, target: F1AuthorizationTarget): boolean {
  const ha = ["h0-011-human-unit", "h0-011-human-approval", "h0-011-evidence-revalidation"].includes(purpose);
  if (login === "crm_h0_runtime") {
    if (purpose === "h1-identities") {
      return target.resource === "identities"
        && ((operation === "C01" && target.action === "read_identity")
          || (operation === "C03" && target.action === "write_identity"));
    }
    if (purpose === "h0-016-recovery") {
      return operation === "C03" && target.resource === "access_recovery"
        && ["begin", "record_auth_outcome", "complete"].includes(target.action);
    }
    if (purpose === "h0-013-auth-revocation") {
      return operation === "C03"
        && target.resource === "global_access_revocation"
        && target.action === "record_auth_outcome";
    }
    return !ha && (target.resource === "access_probe" || target.resource === "internal_unit");
  }
  if (login !== "crm_h0_ha_tx") return false;
  if (purpose === "h0-011-evidence-revalidation") return target.resource === "human_approval_evidence"
    && ((operation === "C01" && target.action === "check_replay") || (operation === "C03" && target.action === "revalidate_evidence"));
  if (purpose !== "h0-011-human-unit" && purpose !== "h0-011-human-approval") return false;
  return (operation === "C03" && ((target.resource === "human_approval" && target.action === "manage_effect")
    || (target.resource === "internal_unit" && target.action === "commit_internal_unit")))
    || (purpose === "h0-011-human-approval" && operation === "C01" && target.resource === "human_approval" && target.action === "read_proposal");
}
