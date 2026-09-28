import { randomUUID } from "node:crypto";
import type { AuthorizedProjection } from "../../application/contracts.ts";
import { decideIdentityCommand } from "../../domain/identity-rules.ts";
import { issueTrustedContext } from "../../application/trusted-context.ts";
import { isVerifiedAuth, type VerifiedAuthEvidence } from "../../application/verified-auth.ts";
import {
  isVerifiedServerInteraction, type VerifiedServerInteraction,
} from "../../application/verified-interaction.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "./f1-codec.ts";
import { createF2Issuer, type F2Identity, type F2SigningConfiguration } from "./f2-codec.ts";
import { postgresF1Binding, type PostgresSql, type PostgresTransaction } from "./transaction.ts";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type IdentityAction =
  | "create_context" | "create_entity" | "update_entity"
  | "link_organization_contact" | "designate";
export type IdentityReadKind = "entity" | "context" | "designations" | "history" | "organization_contacts";
export interface IdentityCommand {
  readonly action: IdentityAction;
  readonly operationId: string;
  readonly targetId: string;
  readonly relatedId?: string;
  readonly contextId?: string;
  readonly kind: string;
  readonly displayName?: string | null;
  readonly givenName?: string | null;
  readonly familyName?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly groupType?: string | null;
  readonly estimatedSize?: number | null;
  readonly confirmedSize?: number | null;
  readonly sizeSource?: string | null;
  readonly sourceRef: string;
  readonly evidenceRef?: string | null;
  readonly reason: string;
  readonly happenedAt?: string;
  readonly expectedVersion: number;
  readonly verified: boolean;
}
export interface IdentityCommandResult {
  readonly id: string;
  readonly version: number;
  readonly replayed: boolean;
}
type Lookup = { actor_id: string; access_generation: string; admin_scope: string; epoch_id: string | null };
type CommandRow = { result_ref: string; result_version: string; replayed: boolean };

function requiredAuth(auth: VerifiedAuthEvidence): string {
  if (!isVerifiedAuth(auth) || !auth.sessionId || !auth.mfaVerified) {
    throw new Error("IDENTITY_AUTH_REQUIRED");
  }
  return auth.sessionId;
}
function validCommand(input: IdentityCommand): boolean {
  return [input.operationId,input.targetId,input.relatedId,input.contextId]
    .every((id) => id === undefined || uuid.test(id))
    && [input.kind,input.sourceRef,input.reason,input.displayName ?? "",input.evidenceRef ?? "",
      input.givenName ?? "",input.familyName ?? "",input.email ?? "",input.phone ?? "",
      input.groupType ?? "",input.sizeSource ?? ""]
      .every((value) => typeof value === "string" && !value.includes("\0")
        && !value.includes("\u001f") && value.length <= 16384)
    && input.sourceRef.length > 0 && input.reason.length > 0
    && Number.isSafeInteger(input.expectedVersion) && input.expectedVersion >= 0
    && (input.happenedAt === undefined ||
      (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(input.happenedAt)
        && !Number.isNaN(Date.parse(input.happenedAt))))
    && [input.estimatedSize,input.confirmedSize].every((value) =>
      value === undefined || value === null || (Number.isSafeInteger(value) && value >= 0))
    && typeof input.verified === "boolean";
}
function optionalField(value: string | number | null | undefined, action: IdentityAction): string {
  if (value === undefined) return "";
  if (value === null) return action === "update_entity" ? "\u001f" : "";
  return String(value);
}

export class H1001IdentityAdapter {
  private readonly sql: PostgresSql;
  private readonly f1: ReturnType<typeof createF1Issuer>;
  private readonly f2: ReturnType<typeof createF2Issuer>;
  constructor(sql: PostgresSql, f1: F1SigningConfiguration,
    f2: F2SigningConfiguration) {
    this.sql=sql;
    this.f1=createF1Issuer(f1); this.f2=createF2Issuer(f2);
  }
  private async unit<T>(work: (tx: PostgresTransaction) => Promise<T>): Promise<T> {
    return this.sql.begin("isolation level read committed",work) as Promise<T>;
  }
  private async lookup(tx: PostgresTransaction, auth: VerifiedAuthEvidence, session: string): Promise<Lookup> {
    const rows=await tx.unsafe<Lookup[]>(
      "select actor_id::text,access_generation::text,admin_scope,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",
      [auth.subject,session]);
    if (rows.length!==1 || !rows[0]?.epoch_id) throw new Error("IDENTITY_DENIED");
    return rows[0];
  }
  private identity(row: Lookup, session: string): F2Identity {
    return {actorId:row.actor_id,sessionId:session,epochId:row.epoch_id!,
      accessGeneration:row.access_generation,scope:row.admin_scope};
  }
  private technicalContext(scope: string) {
    return issueTrustedContext({identityId:"h1-identity-server",identityKind:"technical",
      purpose:"h1-identities",scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
  }
  async apply(auth: VerifiedAuthEvidence, interaction: VerifiedServerInteraction,
    input: IdentityCommand): Promise<IdentityCommandResult> {
    const session=requiredAuth(auth);
    if (!isVerifiedServerInteraction(interaction,"interactive_action") || !validCommand(input)
      || !decideIdentityCommand(input).allowed) {
      throw new Error("IDENTITY_INPUT_DENIED");
    }
    try {
      return await this.unit(async(tx)=>{
        const row=await this.lookup(tx,auth,session);
        const q=encodeF1Fields(["CRM-H1-ID1",input.action,input.operationId,input.targetId,
          input.relatedId??"",input.contextId??"",input.kind,optionalField(input.displayName,input.action),
          input.sourceRef,optionalField(input.evidenceRef,input.action),input.reason,String(input.expectedVersion),
          String(input.verified),optionalField(input.groupType,input.action),
          optionalField(input.estimatedSize,input.action),optionalField(input.confirmedSize,input.action),
          optionalField(input.sizeSource,input.action),optionalField(input.givenName,input.action),
          optionalField(input.familyName,input.action),optionalField(input.email,input.action),
          optionalField(input.phone,input.action),input.happenedAt??""]);
        const binding=await postgresF1Binding(tx);
        const human=this.f2(auth,this.identity(row,session),binding,"identity_write",q,interaction);
        const technical=this.f1(this.technicalContext(row.admin_scope),binding,"C03",q,
          {resource:"identities",action:"write_identity"});
        const result=await tx.unsafe<CommandRow[]>(
          "select result_ref::text,result_version::text,replayed from crm_api.identity_apply($1,$2,$3,$4,$5)",
          [human.payload,human.mac,technical.payload,technical.mac,q]);
        if (!result[0]) throw new Error("IDENTITY_DENIED");
        return {id:result[0].result_ref,version:Number(result[0].result_version),
          replayed:result[0].replayed};
      });
    } catch(error) {
      const message=error instanceof Error?error.message:"";
      if (/^IDENTITY_(VERSION_CONFLICT|REPLAY_CONFLICT|RELATION_UNVERIFIED|CONTEXT_UNVERIFIED|EVIDENCE_REQUIRED|INPUT_INVALID)$/.test(message)) {
        throw new Error(message);
      }
      throw new Error("IDENTITY_DENIED");
    }
  }
  async read(auth: VerifiedAuthEvidence, interaction: VerifiedServerInteraction,
    kind: IdentityReadKind, targetId: string,
    page: { readonly limit?: number; readonly offset?: number } = {}): Promise<AuthorizedProjection<unknown>> {
    const session=requiredAuth(auth);
    if (!isVerifiedServerInteraction(interaction,"interactive_read") || !uuid.test(targetId)
      || !["entity","context","designations","history","organization_contacts"].includes(kind)
      || !Number.isSafeInteger(page.limit??100) || (page.limit??100)<1 || (page.limit??100)>100
      || !Number.isSafeInteger(page.offset??0) || (page.offset??0)<0) {
      throw new Error("IDENTITY_INPUT_DENIED");
    }
    try {
      return await this.unit(async(tx)=>{
        const row=await this.lookup(tx,auth,session);
        const q=encodeF1Fields(["CRM-H1-ID-READ1",kind,targetId,
          String(page.limit??100),String(page.offset??0)]);
        const binding=await postgresF1Binding(tx);
        const human=this.f2(auth,this.identity(row,session),binding,"identity_read",q,interaction);
        const technical=this.f1(this.technicalContext(row.admin_scope),binding,"C01",q,
          {resource:"identities",action:"read_identity"});
        const result=await tx.unsafe<{identity_read:{data:unknown;nextPage:string|null}}[]>(
          "select crm_api.identity_read($1,$2,$3,$4,$5) as identity_read",
          [human.payload,human.mac,technical.payload,technical.mac,q]);
        const data=result[0]?.identity_read?.data ?? null;
        const rows=Array.isArray(data)?data:[data];
        const certainty=data===null?"unknown"
          : rows.some((value)=>typeof value==="object" && value!==null
            && (("verified" in value && value.verified===false)
              || ("identity_verified" in value && value.identity_verified===false)))
            ? "pending" : "verified";
        const nextPage=result[0]?.identity_read?.nextPage;
        return {data,provenance:"crm-identity-register",certainty,
          ...(nextPage?{nextPage}:{})};
      });
    } catch { throw new Error("IDENTITY_DENIED"); }
  }
}
