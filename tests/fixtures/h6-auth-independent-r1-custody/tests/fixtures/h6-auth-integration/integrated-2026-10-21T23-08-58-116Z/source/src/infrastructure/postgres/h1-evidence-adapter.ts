import {randomUUID} from "node:crypto";
import type {AuthorizedProjection} from "../../application/contracts.ts";
import {issueTrustedContext} from "../../application/trusted-context.ts";
import {isVerifiedAuth,type VerifiedAuthEvidence} from "../../application/verified-auth.ts";
import {isVerifiedServerInteraction,type VerifiedServerInteraction} from "../../application/verified-interaction.ts";
import {createF1Issuer,encodeF1Fields,type F1SigningConfiguration} from "./f1-codec.ts";
import {createF2Issuer,type F2Identity,type F2SigningConfiguration} from "./f2-codec.ts";
import {postgresF1Binding,type PostgresSql,type PostgresTransaction} from "./transaction.ts";

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const instant=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
export type B07Kind="document"|"evidence"|"communication"|"communication_fact"|
  "integration_source"|"external_reference"|"external_event";
export type B07ContextKind="contact"|"organization"|"opportunity"|"booking"|
  "booking_service"|"provider"|"proposal"|"other";
export interface B07Command {
  readonly action:"create"|"link";
  readonly operationId:string;
  readonly targetId:string;
  readonly kind?:B07Kind;
  readonly material?:Readonly<Record<string,unknown>>;
  readonly sourceRef:string;
  readonly purpose:string;
  readonly occurredAt?:string;
  readonly originalId?:string;
  readonly correctsId?:string;
  readonly contextKind:B07ContextKind;
  readonly contextId:string;
  readonly coverage:string;
  readonly reason:string;
}
type Lookup={actor_id:string;access_generation:string;admin_scope:string;epoch_id:string|null};
function validText(value:string):boolean {
  return typeof value==="string" && value.length>0 && value.length<=16384
    && !value.includes("\0") && !value.includes("\u001f");
}
function canonical(value:unknown):unknown {
  if(Array.isArray(value)) return value.map(canonical);
  if(value && typeof value==="object") return Object.fromEntries(
    Object.entries(value).sort(([a],[b])=>a.localeCompare(b,"en")).map(([k,v])=>[k,canonical(v)]));
  return value;
}
function validCommand(input:B07Command):boolean {
  return [input.operationId,input.targetId,input.contextId,input.originalId,input.correctsId]
    .every(value=>value===undefined||uuid.test(value))
    && [input.sourceRef,input.purpose,input.coverage,input.reason].every(validText)
    && (!input.occurredAt || instant.test(input.occurredAt))
    && (input.action==="create"?Boolean(input.kind&&input.material)
      :input.action==="link" && input.originalId!==undefined
        && input.kind===undefined && input.material===undefined && input.occurredAt===undefined
        && input.correctsId===undefined);
}
function sessionOf(auth:VerifiedAuthEvidence):string {
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified) throw new Error("B07_AUTH_REQUIRED");
  return auth.sessionId;
}
export class H1013EvidenceAdapter {
  private readonly sql:PostgresSql;
  private readonly f1:ReturnType<typeof createF1Issuer>;
  private readonly f2:ReturnType<typeof createF2Issuer>;
  constructor(sql:PostgresSql,f1:F1SigningConfiguration,f2:F2SigningConfiguration) {
    this.sql=sql;this.f1=createF1Issuer(f1);this.f2=createF2Issuer(f2);
  }
  private async lookup(tx:PostgresTransaction,auth:VerifiedAuthEvidence,session:string):Promise<Lookup> {
    const rows=await tx.unsafe<Lookup[]>(
      "select actor_id::text,access_generation::text,admin_scope,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",
      [auth.subject,session]);
    if(rows.length!==1||!rows[0]?.epoch_id) throw new Error("B07_DENIED");
    return rows[0];
  }
  private identity(row:Lookup,session:string):F2Identity {
    return {actorId:row.actor_id,sessionId:session,epochId:row.epoch_id!,
      accessGeneration:row.access_generation,scope:row.admin_scope};
  }
  private context(scope:string) {
    return issueTrustedContext({identityId:"h1-evidence-server",identityKind:"technical",
      purpose:"h1-evidence",scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
  }
  async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,
    input:B07Command):Promise<Readonly<{id:string;replayed:boolean}>> {
    const session=sessionOf(auth);
    if(!isVerifiedServerInteraction(interaction,"interactive_action")||!validCommand(input))
      throw new Error("B07_INPUT_DENIED");
    try {
      return await this.sql.begin("isolation level read committed",async(tx)=>{
        const row=await this.lookup(tx,auth,session);
        const q=encodeF1Fields(["CRM-H1-B07-1",input.action,input.operationId,input.targetId,
          input.kind??"",JSON.stringify(canonical(input.material??{})),input.sourceRef,input.purpose,
          input.occurredAt??"",input.originalId??"",input.correctsId??"",input.contextKind,
          input.contextId,input.reason,input.coverage]);
        const binding=await postgresF1Binding(tx);
        const human=this.f2(auth,this.identity(row,session),binding,"evidence_write",q,interaction);
        const technical=this.f1(this.context(row.admin_scope),binding,"C03",q,
          {resource:"evidence",action:"write_evidence"});
        const result=await tx.unsafe<{result_ref:string;replayed:boolean}[]>(
          "select result_ref::text,replayed from crm_api.b07_apply($1,$2,$3,$4,$5)",
          [human.payload,human.mac,technical.payload,technical.mac,q]);
        if(!result[0]) throw new Error("B07_DENIED");
        return {id:result[0].result_ref,replayed:result[0].replayed};
      }) as Readonly<{id:string;replayed:boolean}>;
    } catch(error) {
      const message=error instanceof Error?error.message:"";
      if(/^B07_(REPLAY_CONFLICT|RELATION_INVALID|INPUT_INVALID)$/.test(message)) throw new Error(message);
      throw new Error("B07_DENIED");
    }
  }
  async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,recordId:string,
    contextKind:B07ContextKind,contextId:string):Promise<AuthorizedProjection<unknown>> {
    const session=sessionOf(auth);
    if(!isVerifiedServerInteraction(interaction,"interactive_read")
      ||!uuid.test(recordId)||!uuid.test(contextId)
      ||!["contact","organization","opportunity","booking","booking_service","provider","proposal","other"].includes(contextKind))
      throw new Error("B07_INPUT_DENIED");
    try {
      return await this.sql.begin("isolation level read committed",async(tx)=>{
        const row=await this.lookup(tx,auth,session);
        const q=encodeF1Fields(["CRM-H1-B07-READ1",recordId,contextKind,contextId]);
        const binding=await postgresF1Binding(tx);
        const human=this.f2(auth,this.identity(row,session),binding,"evidence_read",q,interaction);
        const technical=this.f1(this.context(row.admin_scope),binding,"C01",q,
          {resource:"evidence",action:"read_evidence"});
        const result=await tx.unsafe<{b07_read:unknown}[]>(
          "select crm_api.b07_read($1,$2,$3,$4,$5) as b07_read",
          [human.payload,human.mac,technical.payload,technical.mac,q]);
        const data=result[0]?.b07_read??null;
        return {data,provenance:"crm-b07-register",certainty:data===null?"unknown":"verified"};
      }) as AuthorizedProjection<unknown>;
    } catch {throw new Error("B07_DENIED");}
  }
}
