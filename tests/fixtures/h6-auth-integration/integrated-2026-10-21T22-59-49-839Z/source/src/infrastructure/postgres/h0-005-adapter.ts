import { randomUUID } from "node:crypto";
import { issueTrustedContext } from "../../application/trusted-context.ts";
import { isVerifiedAuth, type VerifiedAuthEvidence } from "../../application/verified-auth.ts";
import {
  isVerifiedServerInteraction, type VerifiedServerInteraction,
} from "../../application/verified-interaction.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "./f1-codec.ts";
import { createF2Issuer, encodeF2Fields, type F2Identity, type F2SigningConfiguration } from "./f2-codec.ts";
import { postgresF1Binding, type PostgresSql, type PostgresTransaction } from "./transaction.ts";

type Lookup = {
  actor_id: string;
  access_generation: string;
  admin_scope: string;
  epoch_id: string | null;
};
type Probe = { probe_id: string; public_value: string };

function verified(auth: VerifiedAuthEvidence): void {
  if (!isVerifiedAuth(auth)) throw new Error("F2_AUTH_VERIFICATION_REQUIRED");
}

function session(auth: VerifiedAuthEvidence): string {
  verified(auth);
  if (!auth.sessionId) throw new Error("F2_SESSION_REQUIRED");
  return auth.sessionId;
}

function nonempty(value: string): void {
  if (typeof value !== "string" || value.length === 0 || value.length > 16384) {
    throw new Error("F2_INVALID_INPUT");
  }
}

export class H0005PostgresAdapter {
  private readonly sql: PostgresSql;
  private readonly issueF1: ReturnType<typeof createF1Issuer>;
  private readonly issueF2: ReturnType<typeof createF2Issuer>;

  constructor(
    sql: PostgresSql,
    f1: F1SigningConfiguration,
    f2: F2SigningConfiguration,
  ) {
    this.sql = sql;
    if (Buffer.from(f1.key).equals(Buffer.from(f2.key))) throw new Error("F2_KEY_SEPARATION_REQUIRED");
    this.issueF1 = createF1Issuer(f1);
    this.issueF2 = createF2Issuer(f2);
  }

  private async unit<T>(work: (tx: PostgresTransaction) => Promise<T>): Promise<T> {
    return this.sql.begin("isolation level read committed", work) as Promise<T>;
  }

  private async lookup(tx: PostgresTransaction, auth: VerifiedAuthEvidence, sessionId: string | null) {
    const rows = await tx.unsafe<Lookup[]>(
      "select actor_id::text,access_generation::text,admin_scope,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",
      [auth.subject, sessionId],
    );
    if (rows.length !== 1) throw new Error("F2_AUTHORIZATION_DENIED");
    return rows[0]!;
  }

  private identity(row: Lookup, sessionId: string, epochId: string): F2Identity {
    return {
      actorId: row.actor_id, sessionId, epochId,
      accessGeneration: row.access_generation, scope: row.admin_scope,
    };
  }

  async establish(auth: VerifiedAuthEvidence): Promise<{ sessionId: string; epochId: string }> {
    verified(auth);
    if (auth.sessionId !== undefined || !auth.passwordVerified || !auth.mfaVerified) {
      throw new Error("F2_FULL_IDENTIFICATION_REQUIRED");
    }
    try {
      return await this.unit(async (tx) => {
        const row = await this.lookup(tx, auth, null);
        const sessionId = randomUUID();
        const epochId = randomUUID();
        const q = encodeF2Fields(["CRM-F2-INP1","establish",auth.subject,sessionId,epochId]);
        const cap = this.issueF2(auth,this.identity(row,sessionId,epochId),
          await postgresF1Binding(tx),"establish",q);
        const result = await tx.unsafe<{ epoch_id: string }[]>(
          "select crm_api.establish_session($1,$2,$3)::text as epoch_id",
          [cap.payload,cap.mac,q],
        );
        if (result[0]?.epoch_id !== epochId) throw new Error("F2_ESTABLISH_DENIED");
        return { sessionId, epochId };
      });
    } catch { throw new Error("F2_ESTABLISH_DENIED"); }
  }

  async reidentify(auth: VerifiedAuthEvidence): Promise<string> {
    const sessionId = session(auth);
    if (!auth.passwordVerified || !auth.mfaVerified) throw new Error("F2_FULL_IDENTIFICATION_REQUIRED");
    try {
      return await this.unit(async (tx) => {
        const row = await this.lookup(tx, auth, sessionId);
        if (!row.epoch_id) throw new Error("F2_REIDENTIFY_DENIED");
        const nextEpoch = randomUUID();
        const q = encodeF2Fields(["CRM-F2-INP1","reidentify",sessionId,row.epoch_id,nextEpoch]);
        const cap = this.issueF2(auth,this.identity(row,sessionId,row.epoch_id),
          await postgresF1Binding(tx),"reidentify",q);
        const result = await tx.unsafe<{ epoch_id: string }[]>(
          "select crm_api.reidentify_session($1,$2,$3)::text as epoch_id",
          [cap.payload,cap.mac,q],
        );
        if (result[0]?.epoch_id !== nextEpoch) throw new Error("F2_REIDENTIFY_DENIED");
        return nextEpoch;
      });
    } catch { throw new Error("F2_REIDENTIFY_DENIED"); }
  }

  async revokeOne(auth: VerifiedAuthEvidence): Promise<void> {
    const sessionId = session(auth);
    try {
      await this.unit(async (tx) => {
        const row = await this.lookup(tx, auth, sessionId);
        if (!row.epoch_id) throw new Error("F2_REVOKE_DENIED");
        const q = encodeF2Fields(["CRM-F2-INP1","revoke_one",sessionId]);
        const cap = this.issueF2(auth,this.identity(row,sessionId,row.epoch_id),
          await postgresF1Binding(tx),"revoke_one",q);
        await tx.unsafe("select crm_api.revoke_session($1,$2,$3)",[cap.payload,cap.mac,q]);
      });
    } catch { throw new Error("F2_REVOKE_DENIED"); }
  }

  async revokeAll(auth: VerifiedAuthEvidence): Promise<string> {
    const sessionId = session(auth);
    try {
      return await this.unit(async (tx) => {
        const rows = await tx.unsafe<Lookup[]>(
          "select actor_id::text,access_generation::text,admin_scope,epoch_id::text from crm_api.f2_lookup_revoke_all_authority($1::uuid,$2::uuid)",
          [auth.subject, sessionId],
        );
        if (rows.length !== 1) throw new Error("F2_REVOKE_DENIED");
        const row = rows[0]!;
        const epochId = row.epoch_id;
        if (!epochId) throw new Error("F2_REVOKE_DENIED");
        const q = encodeF2Fields(["CRM-F2-INP1","revoke_all",row.actor_id]);
        const cap = this.issueF2(auth,this.identity(row,sessionId,epochId),
          await postgresF1Binding(tx),"revoke_all",q);
        const result = await tx.unsafe<{ access_generation: string }[]>(
          "select crm_api.revoke_all_sessions($1,$2,$3)::text as access_generation",
          [cap.payload,cap.mac,q],
        );
        if (!result[0]) throw new Error("F2_REVOKE_DENIED");
        return result[0].access_generation;
      });
    } catch { throw new Error("F2_REVOKE_DENIED"); }
  }

  private technicalContext(scope: string) {
    return issueTrustedContext({
      identityId: "h0-005-server-technical-bridge",
      identityKind: "technical", purpose: "h0-005-human-bridge",
      scope, requestId: randomUUID(), serverTime: new Date().toISOString(),
    });
  }

  async readCoreProbe(auth: VerifiedAuthEvidence, interaction: VerifiedServerInteraction,
    probeId: string): Promise<{
    probeId: string; publicValue: string;
  } | undefined> {
    const sessionId = session(auth);
    if (!isVerifiedServerInteraction(interaction,"interactive_read")) {
      throw new Error("F2_INTERACTION_DENIED");
    }
    nonempty(probeId);
    try {
      return await this.unit(async (tx) => {
        const row = await this.lookup(tx, auth, sessionId);
        if (!row.epoch_id) throw new Error("F2_CORE_DENIED");
        const identity = this.identity(row,sessionId,row.epoch_id);
        const q = encodeF1Fields(["CRM-INP1","C01",probeId]);
        const binding = await postgresF1Binding(tx);
        const f2 = this.issueF2(auth,identity,binding,"C01",q,interaction);
        const f1 = this.issueF1(this.technicalContext(identity.scope),binding,"C01",q);
        const result = await tx.unsafe<Probe[]>(
          "select probe_id,public_value from crm_api.human_read_probe($1,$2,$3,$4,$5)",
          [f2.payload,f2.mac,f1.payload,f1.mac,q],
        );
        return result[0] ? { probeId: result[0].probe_id, publicValue: result[0].public_value } : undefined;
      });
    } catch { throw new Error("F2_CORE_DENIED"); }
  }

  async applyCoreProbe(auth: VerifiedAuthEvidence, interaction: VerifiedServerInteraction,
    operationId: string, probeId: string,
    publicValue: string): Promise<readonly string[]> {
    const sessionId = session(auth);
    if (!isVerifiedServerInteraction(interaction,"interactive_action")) {
      throw new Error("F2_INTERACTION_DENIED");
    }
    nonempty(operationId); nonempty(probeId); nonempty(publicValue);
    try {
      return await this.unit(async (tx) => {
        const row = await this.lookup(tx, auth, sessionId);
        if (!row.epoch_id) throw new Error("F2_CORE_DENIED");
        const identity = this.identity(row,sessionId,row.epoch_id);
        const q = encodeF1Fields(["CRM-INP1","C03",operationId,"true","true",
          "record-technical-probe",probeId,publicValue]);
        const binding = await postgresF1Binding(tx);
        const f2 = this.issueF2(auth,identity,binding,"C03",q,interaction);
        const f1 = this.issueF1(this.technicalContext(identity.scope),binding,"C03",q);
        const result = await tx.unsafe<{ recorded: string[] }[]>(
          "select crm_api.human_apply_probe_batch($1,$2,$3,$4,$5) as recorded",
          [f2.payload,f2.mac,f1.payload,f1.mac,q],
        );
        if (!result[0]) throw new Error("F2_CORE_DENIED");
        return result[0].recorded;
      });
    } catch { throw new Error("F2_CORE_DENIED"); }
  }
}
