import { randomUUID } from "node:crypto";
import { issueTrustedContext } from "../../application/trusted-context.ts";
import { isVerifiedAuth, type VerifiedAuthEvidence } from "../../application/verified-auth.ts";
import { isVerifiedServerInteraction, type VerifiedServerInteraction } from "../../application/verified-interaction.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "./f1-codec.ts";
import { createF2Issuer, type F2Identity, type F2SigningConfiguration } from "./f2-codec.ts";
import { postgresF1Binding, type PostgresSql, type PostgresTransaction } from "./transaction.ts";

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export interface ResolutionCommand {
  readonly action:"merge"|"archive"|"restore"|"assign_code";
  readonly operationId:string;
  readonly targetId:string;
  readonly relatedId?:string;
  readonly kind:"contact"|"organization"|"OP"|"PR"|"RES"|"INC";
  readonly sourceRef:string;
  readonly evidenceRef:string;
  readonly reason:string;
  readonly expectedVersion:number;
}
export interface ResolutionResult {
  readonly id:string;
  readonly version:number;
  readonly code:string|null;
  readonly replayed:boolean;
}
export interface DuplicateCandidate {
  readonly identity_id:string;
  readonly identity_kind:"contact"|"organization";
  readonly signals:readonly (string|null)[];
}
export interface AssignedCode {
  readonly target_id:string;
  readonly code_kind:"OP"|"PR"|"RES"|"INC";
  readonly human_code:string;
  readonly assigned_at:string;
  readonly source_ref:string;
}
type Lookup={actor_id:string;access_generation:string;admin_scope:string;epoch_id:string|null};
function requireSession(auth:VerifiedAuthEvidence):string {
  if (!isVerifiedAuth(auth) || !auth.sessionId || !auth.mfaVerified)
    throw new Error("IDENTITY_AUTH_REQUIRED");
  return auth.sessionId;
}
function validText(value:string):boolean {
  return value.length>0 && value.length<=16384 && !value.includes("\0")
    && !value.includes("\u001f");
}
function validCommand(input:ResolutionCommand):boolean {
  return uuid.test(input.operationId) && uuid.test(input.targetId)
    && (input.relatedId===undefined || uuid.test(input.relatedId))
    && validText(input.sourceRef) && validText(input.evidenceRef)
    && validText(input.reason) && Number.isSafeInteger(input.expectedVersion)
    && input.expectedVersion>=0
    && (input.action==="assign_code"
      ? ["OP","PR","RES","INC"].includes(input.kind)
        && !input.relatedId && input.expectedVersion===0
      : ["contact","organization"].includes(input.kind)
        && (input.action==="merge" ? !!input.relatedId && input.relatedId!==input.targetId
          : !input.relatedId));
}
export class H1003ResolutionAdapter {
  private readonly sql:PostgresSql;
  private readonly f1:ReturnType<typeof createF1Issuer>;
  private readonly f2:ReturnType<typeof createF2Issuer>;
  constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration) {
    this.sql=sql;
    this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);
  }
  private async lookup(tx:PostgresTransaction,auth:VerifiedAuthEvidence,session:string):Promise<Lookup> {
    const rows=await tx.unsafe<Lookup[]>(
      "select actor_id::text,access_generation::text,admin_scope,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",
      [auth.subject,session]);
    if (rows.length!==1 || !rows[0]?.epoch_id) throw new Error("IDENTITY_DENIED");
    return rows[0];
  }
  private identity(row:Lookup,session:string):F2Identity {
    return {actorId:row.actor_id,sessionId:session,epochId:row.epoch_id!,
      accessGeneration:row.access_generation,scope:row.admin_scope};
  }
  private context(scope:string) {
    return issueTrustedContext({identityId:"h1-resolution-server",identityKind:"technical",
      purpose:"h1-identities",scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
  }
  async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,
    input:ResolutionCommand):Promise<ResolutionResult> {
    const session=requireSession(auth);
    if (!isVerifiedServerInteraction(interaction,"interactive_action") || !validCommand(input))
      throw new Error("IDENTITY_INPUT_DENIED");
    try {
      return await this.sql.begin("isolation level read committed",async(tx)=>{
        const row=await this.lookup(tx,auth,session);
        const q=encodeF1Fields(["CRM-H1-RESOLVE1",input.action,input.operationId,input.targetId,
          input.relatedId??"",input.kind,input.sourceRef,input.evidenceRef,input.reason,
          String(input.expectedVersion)]);
        const binding=await postgresF1Binding(tx);
        const human=this.f2(auth,this.identity(row,session),binding,"identity_write",q,interaction);
        const technical=this.f1(this.context(row.admin_scope),binding,"C03",q,
          {resource:"identities",action:"write_identity"});
        const result=await tx.unsafe<{result_ref:string;result_version:string;human_code:string|null;replayed:boolean}[]>(
          "select result_ref::text,result_version::text,human_code,replayed from crm_api.identity_resolve($1,$2,$3,$4,$5)",
          [human.payload,human.mac,technical.payload,technical.mac,q]);
        if (!result[0]) throw new Error("IDENTITY_DENIED");
        return {id:result[0].result_ref,version:Number(result[0].result_version),
          code:result[0].human_code,replayed:result[0].replayed};
      }) as ResolutionResult;
    } catch(error) {
      const message=error instanceof Error?error.message:"";
      if (/^IDENTITY_(VERSION_CONFLICT|REPLAY_CONFLICT|CODE_ALREADY_ASSIGNED|RESOLUTION_TARGET_INVALID|RESOLUTION_INPUT_INVALID)$/.test(message))
        throw new Error(message);
      throw new Error("IDENTITY_DENIED");
    }
  }
  async candidates(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,
    targetId:string):Promise<readonly DuplicateCandidate[]> {
    const session=requireSession(auth);
    if (!isVerifiedServerInteraction(interaction,"interactive_read") || !uuid.test(targetId))
      throw new Error("IDENTITY_INPUT_DENIED");
    try {
      return await this.sql.begin("isolation level read committed",async(tx)=>{
        const row=await this.lookup(tx,auth,session);
        const q=encodeF1Fields(["CRM-H1-CANDIDATES1",targetId]);
        const binding=await postgresF1Binding(tx);
        const human=this.f2(auth,this.identity(row,session),binding,"identity_read",q,interaction);
        const technical=this.f1(this.context(row.admin_scope),binding,"C01",q,
          {resource:"identities",action:"read_identity"});
        const result=await tx.unsafe<{identity_candidates:DuplicateCandidate[]}[]>(
          "select crm_api.identity_candidates($1,$2,$3,$4,$5) as identity_candidates",
          [human.payload,human.mac,technical.payload,technical.mac,q]);
        return result[0]?.identity_candidates??[];
      }) as readonly DuplicateCandidate[];
    } catch { throw new Error("IDENTITY_DENIED"); }
  }
  async findCode(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,
    kind:AssignedCode["code_kind"],by:"code"|"target",value:string):Promise<AssignedCode|null> {
    const session=requireSession(auth);
    if (!isVerifiedServerInteraction(interaction,"interactive_read")
      || !["OP","PR","RES","INC"].includes(kind)
      || (by==="target" ? !uuid.test(value)
        : by!=="code" || !/^(OP|PR|RES|INC)-[0-9]{4}-[0-9]{4,}$/.test(value)))
      throw new Error("IDENTITY_INPUT_DENIED");
    try {
      return await this.sql.begin("isolation level read committed",async(tx)=>{
        const row=await this.lookup(tx,auth,session);
        const q=encodeF1Fields(["CRM-H1-CODE-LOOKUP1",by,kind,value]);
        const binding=await postgresF1Binding(tx);
        const human=this.f2(auth,this.identity(row,session),binding,"identity_read",q,interaction);
        const technical=this.f1(this.context(row.admin_scope),binding,"C01",q,
          {resource:"identities",action:"read_identity"});
        const result=await tx.unsafe<{identity_code_lookup:AssignedCode|null}[]>(
          "select crm_api.identity_code_lookup($1,$2,$3,$4,$5) as identity_code_lookup",
          [human.payload,human.mac,technical.payload,technical.mac,q]);
        return result[0]?.identity_code_lookup??null;
      }) as AssignedCode|null;
    } catch { throw new Error("IDENTITY_DENIED"); }
  }
}
