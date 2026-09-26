import { createHash, createHmac, randomUUID } from "node:crypto";
import { isVerifiedAuth, type VerifiedAuthEvidence } from "../../application/verified-auth.ts";
import {
  isVerifiedServerInteraction, type VerifiedServerInteraction,
} from "../../application/verified-interaction.ts";
import type { F1Binding } from "./f1-codec.ts";

// Independent F2 v1 domain, key and ordered wire contract. Each UTF-8 field
// has an unsigned big-endian 32-bit length; no JSON, optional slots or coercion.
export function encodeF2Fields(fields: readonly string[]): Buffer {
  const chunks: Buffer[] = [];
  let size = 0;
  for (const field of fields) {
    if (typeof field !== "string" || field.includes("\0")
      || Buffer.from(field, "utf8").toString("utf8") !== field) {
      throw new Error("F2_INVALID_INPUT");
    }
    const bytes = Buffer.from(field, "utf8");
    size += 4 + bytes.length;
    if (bytes.length > 16384 || size > 65536) throw new Error("F2_INVALID_INPUT");
    const length = Buffer.alloc(4);
    length.writeUInt32BE(bytes.length);
    chunks.push(length, bytes);
  }
  return Buffer.concat(chunks);
}

export interface F2SigningConfiguration {
  readonly keyId: string;
  readonly key: Uint8Array;
  readonly audience: string;
  readonly generation: string;
  readonly allowedPurposes: readonly string[];
}

export interface F2Capability {
  readonly payload: Buffer;
  readonly mac: Buffer;
}

export interface F2Identity {
  readonly actorId: string;
  readonly sessionId: string;
  readonly epochId: string;
  readonly accessGeneration: string;
  readonly scope: string;
}

export type F2Operation =
  | "establish" | "reidentify" | "revoke_one" | "revoke_all" | "C01" | "C03";

const targets: Record<F2Operation, {
  resource: string;
  action: string;
  interaction: string;
  purpose: string;
}> = {
  establish: { resource: "human_session", action: "establish",
    interaction: "identification", purpose: "full-identification" },
  reidentify: { resource: "human_session", action: "reidentify",
    interaction: "identification", purpose: "full-identification" },
  revoke_one: { resource: "human_session", action: "revoke_one",
    interaction: "administrative_action", purpose: "session-revocation" },
  revoke_all: { resource: "human_actor", action: "revoke_all",
    interaction: "administrative_action", purpose: "session-revocation" },
  C01: { resource: "human_core_probe", action: "read_probe",
    interaction: "interactive_read", purpose: "core-human-access" },
  C03: { resource: "human_core_probe", action: "apply_probe_batch",
    interaction: "interactive_action", purpose: "core-human-access" },
};

export function createF2Issuer(configuration: F2SigningConfiguration) {
  if (configuration.key.byteLength !== 32 || configuration.allowedPurposes.length === 0
    || [configuration.keyId, configuration.audience, configuration.generation]
      .some((value) => typeof value !== "string" || value.trim() === "")
    || configuration.allowedPurposes.some((value) => typeof value !== "string" || value.trim() === "")) {
    throw new Error("F2_CONFIGURATION_INVALID");
  }
  encodeF2Fields([configuration.keyId, configuration.audience, configuration.generation,
    ...configuration.allowedPurposes]);
  const key = Buffer.from(configuration.key);
  const purposes = new Set(configuration.allowedPurposes);
  return (
    auth: VerifiedAuthEvidence,
    identity: F2Identity,
    binding: F1Binding,
    operation: F2Operation,
    input: Buffer,
    interaction?: VerifiedServerInteraction,
  ): F2Capability => {
    const target = targets[operation];
    if (!isVerifiedAuth(auth) || !target || !purposes.has(target.purpose)
      || binding.login !== "crm_h0_runtime" || input.length > 65536
      || !/^[1-9][0-9]{0,18}$/.test(identity.accessGeneration)
      || [identity.actorId, identity.sessionId, identity.epochId, identity.scope]
        .some((value) => typeof value !== "string" || value.length === 0)
      || (operation === "establish" || operation === "reidentify")
        && (!auth.passwordVerified || !auth.mfaVerified)
      || (operation === "C01" || operation === "C03") && !auth.mfaVerified
      || (operation === "C01" || operation === "C03")
        && !isVerifiedServerInteraction(interaction,
          operation === "C01" ? "interactive_read" : "interactive_action")
      || (operation !== "establish" && auth.sessionId !== identity.sessionId)) {
      throw new Error("F2_AUTHORIZATION_DENIED");
    }
    const now = BigInt(binding.now);
    const payload = encodeF2Fields([
      "CRM-H0F2", "1", configuration.keyId, configuration.audience, configuration.generation,
      binding.database, binding.start, binding.xid, binding.pid, binding.login,
      auth.subject, identity.actorId, identity.sessionId, identity.epochId,
      identity.accessGeneration, target.purpose, identity.scope, operation,
      target.resource, target.action, target.interaction,
      createHash("sha256").update(input).digest("hex"),
      now.toString(), (now + 30000000n).toString(), randomUUID(),
    ]);
    return { payload, mac: createHmac("sha256", key).update(payload).digest() };
  };
}
