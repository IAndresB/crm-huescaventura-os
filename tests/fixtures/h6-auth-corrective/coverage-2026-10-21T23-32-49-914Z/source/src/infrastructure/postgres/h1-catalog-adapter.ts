import { randomUUID } from "node:crypto";
import type { AuthorizedProjection } from "../../application/contracts.ts";
import { issueTrustedContext } from "../../application/trusted-context.ts";
import { isVerifiedAuth, type VerifiedAuthEvidence } from "../../application/verified-auth.ts";
import { isVerifiedServerInteraction, type VerifiedServerInteraction } from "../../application/verified-interaction.ts";
import { decideCatalogCommand, type CatalogAction, type CatalogKind } from "../../domain/catalog-rules.ts";
import { createF1Issuer, encodeF1Fields, type F1SigningConfiguration } from "./f1-codec.ts";
import { createF2Issuer, type F2Identity, type F2SigningConfiguration } from "./f2-codec.ts";
import { postgresF1Binding, type PostgresSql, type PostgresTransaction } from "./transaction.ts";

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Lookup={actor_id:string;access_generation:string;admin_scope:string;epoch_id:string|null};
export interface CatalogCommand {
  readonly action:CatalogAction;
  readonly operationId:string;
  readonly targetId:string;
  readonly kind:CatalogKind|"application";
  readonly parentId?:string;
  readonly relatedId?:string;
  readonly partyId?:string;
  readonly partyKind?:"contact"|"organization";
  readonly definition?:Readonly<Record<string,string>>;
  readonly revisionIds?:readonly string[];
  readonly sourceRef:string;
  readonly evidenceRef:string;
  readonly reason:string;
  readonly expectedVersion:number;
}
export interface CatalogResult {
  readonly id:string;
  readonly version:number;
  readonly replayed:boolean;
}
export type CatalogReadKind="item"|"version"|"application"|"history";
function sessionOf(auth:VerifiedAuthEvidence):string {
  if (!isVerifiedAuth(auth) || !auth.sessionId || !auth.mfaVerified)
    throw new Error("CATALOG_AUTH_REQUIRED");
  return auth.sessionId;
}
function validText(value:string):boolean {
  return typeof value==="string" && value.length>0 && value.length<=16384
    && !value.includes("\0") && !value.includes("\u001f");
}
function validCommand(input:CatalogCommand):boolean {
  return [input.operationId,input.targetId,input.parentId,input.relatedId,input.partyId,
    ...(input.revisionIds??[])].every(id=>id===undefined || uuid.test(id))
    && validText(input.sourceRef) && validText(input.evidenceRef)
    && validText(input.reason) && decideCatalogCommand(input);
}
function definitionText(input:CatalogCommand):string {
  const value=input.definition??{};
  return JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b,"en"))));
}
export class H1005CatalogAdapter {
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
    if (rows.length!==1 || !rows[0]?.epoch_id) throw new Error("CATALOG_DENIED");
    return rows[0];
  }
  private identity(row:Lookup,session:string):F2Identity {
    return {actorId:row.actor_id,sessionId:session,epochId:row.epoch_id!,
      accessGeneration:row.access_generation,scope:row.admin_scope};
  }
  private context(scope:string) {
    return issueTrustedContext({identityId:"h1-catalog-server",identityKind:"technical",
      purpose:"h1-catalog",scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
  }
  async apply(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,
    input:CatalogCommand):Promise<CatalogResult> {
    const session=sessionOf(auth);
    if (!isVerifiedServerInteraction(interaction,"interactive_action") || !validCommand(input))
      throw new Error("CATALOG_INPUT_DENIED");
    try {
      return await this.sql.begin("isolation level read committed",async(tx)=>{
        const row=await this.lookup(tx,auth,session);
        const q=encodeF1Fields(["CRM-H1-CAT1",input.action,input.operationId,input.targetId,
          input.kind,input.parentId??"",input.relatedId??"",input.partyId??"",
          input.partyKind??"",definitionText(input),input.sourceRef,input.evidenceRef,
          input.reason,String(input.expectedVersion),(input.revisionIds??[]).join(",")]);
        const binding=await postgresF1Binding(tx);
        const human=this.f2(auth,this.identity(row,session),binding,"catalog_write",q,interaction);
        const technical=this.f1(this.context(row.admin_scope),binding,"C03",q,
          {resource:"catalog",action:"write_catalog"});
        const result=await tx.unsafe<{result_ref:string;result_version:string;replayed:boolean}[]>(
          "select result_ref::text,result_version::text,replayed from crm_api.catalog_apply($1,$2,$3,$4,$5)",
          [human.payload,human.mac,technical.payload,technical.mac,q]);
        if (!result[0]) throw new Error("CATALOG_DENIED");
        return {id:result[0].result_ref,version:Number(result[0].result_version),
          replayed:result[0].replayed};
      }) as CatalogResult;
    } catch(error) {
      const message=error instanceof Error?error.message:"";
      if (/^CATALOG_(VERSION_CONFLICT|REPLAY_CONFLICT|RELATION_INVALID|DEFINITION_INVALID|INPUT_INVALID)$/.test(message))
        throw new Error(message);
      throw new Error("CATALOG_DENIED");
    }
  }
  async read(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,
    kind:CatalogReadKind,targetId:string,
    page:{readonly limit?:number;readonly offset?:number}={}):Promise<AuthorizedProjection<unknown>> {
    const session=sessionOf(auth);
    if (!isVerifiedServerInteraction(interaction,"interactive_read") || !uuid.test(targetId)
      || !["item","version","application","history"].includes(kind)
      || !Number.isSafeInteger(page.limit??100) || (page.limit??100)<1 || (page.limit??100)>100
      || !Number.isSafeInteger(page.offset??0) || (page.offset??0)<0)
      throw new Error("CATALOG_INPUT_DENIED");
    try {
      return await this.sql.begin("isolation level read committed",async(tx)=>{
        const row=await this.lookup(tx,auth,session);
        const q=encodeF1Fields(["CRM-H1-CAT-READ1",kind,targetId,
          String(page.limit??100),String(page.offset??0)]);
        const binding=await postgresF1Binding(tx);
        const human=this.f2(auth,this.identity(row,session),binding,"catalog_read",q,interaction);
        const technical=this.f1(this.context(row.admin_scope),binding,"C01",q,
          {resource:"catalog",action:"read_catalog"});
        const result=await tx.unsafe<{catalog_read:{data:unknown;nextPage:string|null}}[]>(
          "select crm_api.catalog_read($1,$2,$3,$4,$5) as catalog_read",
          [human.payload,human.mac,technical.payload,technical.mac,q]);
        const data=result[0]?.catalog_read?.data??null;
        const nextPage=result[0]?.catalog_read?.nextPage;
        return {data,provenance:"crm-catalog-register",
          certainty:data===null?"unknown":"verified",
          ...(nextPage?{nextPage}:{})};
      }) as AuthorizedProjection<unknown>;
    } catch { throw new Error("CATALOG_DENIED"); }
  }
}
