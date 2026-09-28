import { randomUUID } from "node:crypto";
import {
  isVerifiedRecoveryCompletion, isVerifiedRecoveryStart,
  type VerifiedRecoveryCompletion, type VerifiedRecoveryStart,
} from "../../application/recovery-authority.ts";
import { issueTrustedContext } from "../../application/trusted-context.ts";
import type { AuthGlobalRevocationOutcome } from "../../application/global-access-revocation.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "./f1-codec.ts";
import { postgresF1Binding, type PostgresSql, type PostgresTransaction } from "./transaction.ts";

export interface AuthRecoveryRevocationPort {
  revokeAllSessions(subject: string, recoveryId: string): Promise<AuthGlobalRevocationOutcome>;
}
type RecoveryStatus = {
  actor_id: string; auth_subject: string; admin_scope: string;
  recovery_kind: "password" | "break_glass";
  auth_state: "pending" | AuthGlobalRevocationOutcome;
  completed: boolean;
};
type Started = { recovery_id: string; access_generation: string; admin_scope: string; fresh: boolean };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class H0016RecoveryAdapter {
  private readonly issue: ReturnType<typeof createF1Issuer>;
  private readonly sql: PostgresSql;
  private readonly auth: AuthRecoveryRevocationPort;
  constructor(sql: PostgresSql, f1: F1SigningConfiguration,
    auth: AuthRecoveryRevocationPort) {
    this.sql = sql;
    this.auth = auth;
    this.issue = createF1Issuer(f1);
  }

  private async unit<T>(work: (tx: PostgresTransaction) => Promise<T>): Promise<T> {
    return this.sql.begin("isolation level read committed",work) as Promise<T>;
  }

  private async command<T>(scope: string, action: "begin" | "record_auth_outcome" | "complete",
    fields: readonly string[], sql: string): Promise<T[]> {
    return this.unit(async(tx) => {
      const input = encodeF1Fields(["CRM-H0-M06-REC1",...fields]);
      const ctx = issueTrustedContext({identityId:"h0-016-recovery-coordinator",
        identityKind:"technical",purpose:"h0-016-recovery",scope,
        requestId:randomUUID(),serverTime:new Date().toISOString()});
      const cap = this.issue(ctx,await postgresF1Binding(tx),"C03",input,
        {resource:"access_recovery",action});
      return tx.unsafe<T[]>(sql,[cap.payload,cap.mac,input]);
    });
  }

  private async status(id:string):Promise<RecoveryStatus|undefined> {
    const rows=await this.sql.unsafe<RecoveryStatus[]>(
      "select actor_id::text,auth_subject::text,admin_scope,recovery_kind,auth_state,completed from crm_api.recovery_status($1::uuid)",[id]);
    return rows[0];
  }

  async begin(start:VerifiedRecoveryStart, recoveryId=randomUUID()):Promise<{
    status:"pending" | "partial"; recoveryId:string; auth:"revoked" | "failed" | "uncertain" | "pending";
  }> {
    if (!isVerifiedRecoveryStart(start) || !uuid.test(recoveryId)) throw new Error("RECOVERY_START_DENIED");
    let started:Started;
    try {
      const rows=await this.sql.unsafe<{actor_id:string;admin_scope:string}[]>(
        "select actor_id::text,admin_scope from crm_api.recovery_lookup($1::uuid)",[start.subject]);
      const actor=rows[0];
      if (!actor) throw new Error("RECOVERY_START_DENIED");
      const result=await this.command<Started>(actor.admin_scope,"begin",
        ["begin",recoveryId,start.kind,actor.actor_id,start.subject],
        "select recovery_id::text,access_generation::text,admin_scope,fresh from crm_api.begin_access_recovery($1,$2,$3)");
      if (!result[0]) throw new Error("RECOVERY_START_DENIED");
      started=result[0];
    } catch { throw new Error("RECOVERY_START_UNCERTAIN"); }
    if (!started.fresh) {
      const existing=await this.status(recoveryId);
      return {status:"partial",recoveryId,auth:existing?.auth_state??"pending"};
    }
    let outcome:AuthGlobalRevocationOutcome="uncertain";
    try {
      const value=await this.auth.revokeAllSessions(start.subject,recoveryId);
      if (["revoked","failed","uncertain"].includes(value)) outcome=value;
    } catch { outcome="uncertain"; }
    try {
      await this.command(started.admin_scope,"record_auth_outcome",["auth",recoveryId,outcome],
        "select crm_api.record_recovery_auth_outcome($1,$2,$3)");
      return {status:outcome==="revoked"?"pending":"partial",recoveryId,auth:outcome};
    } catch {
      return {status:"partial",recoveryId,auth:"pending"};
    }
  }

  async complete(proof:VerifiedRecoveryCompletion):Promise<string> {
    if (!isVerifiedRecoveryCompletion(proof)) throw new Error("RECOVERY_COMPLETION_DENIED");
    const row=await this.status(proof.recoveryId);
    if (!row || row.auth_subject!==proof.subject || row.auth_state!=="revoked"
      || (row.recovery_kind==="break_glass" && (!proof.newFactorEnrolled || !proof.oldFactorRevoked
        || !proof.newPaperCopyVerified))) {
      throw new Error("RECOVERY_COMPLETION_DENIED");
    }
    try {
      const rows=await this.command<{generation:string}>(row.admin_scope,"complete",
        ["complete",proof.recoveryId,row.actor_id,proof.subject,
          proof.passwordReady?"true":"false",proof.totpVerified?"true":"false",
          proof.newFactorEnrolled?"true":"false",proof.oldFactorRevoked?"true":"false",
          proof.newPaperCopyVerified?"true":"false"],
        "select crm_api.complete_access_recovery($1,$2,$3)::text as generation");
      if (!rows[0]) throw new Error("RECOVERY_COMPLETION_DENIED");
      return rows[0].generation;
    } catch { throw new Error("RECOVERY_COMPLETION_UNCERTAIN"); }
  }
}
