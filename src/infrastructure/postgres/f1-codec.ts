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
  readonly resource: "access_probe" | "internal_unit";
  readonly action: "read_probe" | "apply_probe_batch" | "commit_internal_unit";
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
      || !purposes.has(context.purpose) || binding.login !== "crm_h0_runtime"
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
