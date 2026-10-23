import { randomUUID } from "node:crypto";
import type {
  AuthGlobalRevocationOutcome,
  AuthGlobalRevocationPort,
  GlobalAccessRevocationResult,
} from "../../application/global-access-revocation.ts";
import { issueTrustedContext } from "../../application/trusted-context.ts";
import { isVerifiedAuth, type VerifiedAuthEvidence } from "../../application/verified-auth.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "./f1-codec.ts";
import { createF2Issuer, encodeF2Fields, type F2Identity, type F2SigningConfiguration } from "./f2-codec.ts";
import { postgresF1Binding, type PostgresSql, type PostgresTransaction } from "./transaction.ts";

type AuthorityLookup = {
  actor_id: string;
  access_generation: string;
  admin_scope: string;
  epoch_id: string;
};

type StartedRevocation = {
  revocation_id: string;
  access_generation: string;
  admin_scope: string;
};

type FinalizedRevocation = {
  auth_state: "revoked" | "failed" | "uncertain";
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class H0013GlobalAccessRevocationAdapter {
  private readonly sql: PostgresSql;
  private readonly issueF1: ReturnType<typeof createF1Issuer>;
  private readonly issueF2: ReturnType<typeof createF2Issuer>;
  private readonly authRevocation: AuthGlobalRevocationPort;

  constructor(
    sql: PostgresSql,
    f1: F1SigningConfiguration,
    f2: F2SigningConfiguration,
    authRevocation: AuthGlobalRevocationPort,
  ) {
    if (Buffer.from(f1.key).equals(Buffer.from(f2.key))) {
      throw new Error("H0_013_KEY_SEPARATION_REQUIRED");
    }
    this.sql = sql;
    this.authRevocation = authRevocation;
    this.issueF1 = createF1Issuer(f1);
    this.issueF2 = createF2Issuer(f2);
  }

  private async unit<T>(work: (tx: PostgresTransaction) => Promise<T>): Promise<T> {
    return this.sql.begin("isolation level read committed", work) as Promise<T>;
  }

  private requireAuthority(auth: VerifiedAuthEvidence): string {
    if (!isVerifiedAuth(auth) || !auth.sessionId || !auth.mfaVerified) {
      throw new Error("H0_013_REVOCATION_DENIED");
    }
    return auth.sessionId;
  }

  private identity(row: AuthorityLookup, sessionId: string): F2Identity {
    return {
      actorId: row.actor_id,
      sessionId,
      epochId: row.epoch_id,
      accessGeneration: row.access_generation,
      scope: row.admin_scope,
    };
  }

  private async start(
    auth: VerifiedAuthEvidence,
    sessionId: string,
    revocationId: string,
  ): Promise<StartedRevocation> {
    try {
      return await this.unit(async (tx) => {
        const rows = await tx.unsafe<AuthorityLookup[]>(
          "select actor_id::text,access_generation::text,admin_scope,epoch_id::text from crm_api.f2_lookup_revoke_all_authority($1::uuid,$2::uuid)",
          [auth.subject, sessionId],
        );
        if (rows.length !== 1) throw new Error("H0_013_REVOCATION_DENIED");
        const row = rows[0]!;
        const input = encodeF2Fields([
          "CRM-F2-INP1", "revoke_all", row.actor_id, revocationId,
        ]);
        const capability = this.issueF2(
          auth,
          this.identity(row, sessionId),
          await postgresF1Binding(tx),
          "revoke_all",
          input,
        );
        const started = await tx.unsafe<StartedRevocation[]>(
          "select revocation_id::text,access_generation::text,admin_scope from crm_api.start_global_access_revocation($1,$2,$3)",
          [capability.payload, capability.mac, input],
        );
        if (!started[0]) throw new Error("H0_013_REVOCATION_DENIED");
        return started[0];
      });
    } catch {
      throw new Error("H0_013_REVOCATION_DENIED");
    }
  }

  private async persistAuthOutcome(
    revocation: StartedRevocation,
    outcome: Exclude<AuthGlobalRevocationOutcome, never>,
  ): Promise<FinalizedRevocation> {
    const attemptId = randomUUID();
    const context = issueTrustedContext({
      identityId: "h0-013-auth-revocation-coordinator",
      identityKind: "technical",
      purpose: "h0-013-auth-revocation",
      scope: revocation.admin_scope,
      requestId: attemptId,
      serverTime: new Date().toISOString(),
    });
    const input = encodeF1Fields([
      "CRM-H0-M05-AUTH1", "C03", revocation.revocation_id, attemptId, outcome,
    ]);
    return this.unit(async (tx) => {
      const capability = this.issueF1(
        context,
        await postgresF1Binding(tx),
        "C03",
        input,
        { resource: "global_access_revocation", action: "record_auth_outcome" },
      );
      const rows = await tx.unsafe<FinalizedRevocation[]>(
        "select auth_state from crm_api.record_global_auth_revocation_outcome($1,$2,$3)",
        [capability.payload, capability.mac, input],
      );
      if (!rows[0]) throw new Error("H0_013_AUTH_RESULT_NOT_PERSISTED");
      return rows[0];
    });
  }

  async revokeAll(
    auth: VerifiedAuthEvidence,
    revocationId = randomUUID(),
  ): Promise<GlobalAccessRevocationResult> {
    const sessionId = this.requireAuthority(auth);
    if (!uuidPattern.test(revocationId)) throw new Error("H0_013_REVOCATION_DENIED");
    const revocation = await this.start(auth, sessionId, revocationId);

    let outcome: AuthGlobalRevocationOutcome = "uncertain";
    try {
      outcome = await this.authRevocation.revokeAllSessions(auth);
      if (!["revoked", "failed", "uncertain"].includes(outcome)) outcome = "uncertain";
    } catch {
      outcome = "uncertain";
    }

    try {
      const finalized = await this.persistAuthOutcome(revocation, outcome);
      if (finalized.auth_state === "revoked") {
        return {
          status: "completed",
          revocationId: revocation.revocation_id,
          accessGeneration: revocation.access_generation,
          auth: "revoked",
        };
      }
      return {
        status: "partial",
        revocationId: revocation.revocation_id,
        accessGeneration: revocation.access_generation,
        auth: finalized.auth_state,
      };
    } catch {
      return {
        status: "partial",
        revocationId: revocation.revocation_id,
        accessGeneration: revocation.access_generation,
        auth: "pending",
      };
    }
  }
}
