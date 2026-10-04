import postgres from "postgres";
import { H0011PostgresAdapter } from "./h0-011-adapter.ts";
import type { F1SigningConfiguration } from "./f1-codec.ts";
import type { F2SigningConfiguration } from "./f2-codec.ts";
import type { EvidenceRevalidationProvider } from "../../application/evidence-revalidation.ts";

export type HumanApprovalOperations = Pick<H0011PostgresAdapter,
  "propose" | "decide" | "reserve" | "recordAttempt" | "recordOutcome" | "reconcile" | "readProposal">;

// Trusted composition only. Callers receive operations, never this private
// pool, an adapter instance, an issuer, a SQL callback, or a transaction handle.
export function createHumanApprovalExecutor(input: {
  readonly databaseUrl: string;
  readonly capability: F1SigningConfiguration;
  readonly humanAuthorization: F2SigningConfiguration;
  readonly evidenceProvider?: EvidenceRevalidationProvider;
  readonly ssl?: postgres.Options<never>["ssl"];
}): { readonly operations: HumanApprovalOperations; close(): Promise<void> } {
  if (!input.databaseUrl.trim()) throw new Error("HA_DATABASE_URL_REQUIRED");
  const sql = postgres(input.databaseUrl, { max: 1, prepare: false, ssl: input.ssl ?? "require" });
  const adapter = new H0011PostgresAdapter(sql, input.capability, input.humanAuthorization, input.evidenceProvider);
  const operations: HumanApprovalOperations = Object.freeze({
    propose: adapter.propose.bind(adapter),
    decide: adapter.decide.bind(adapter),
    reserve: adapter.reserve.bind(adapter),
    recordAttempt: adapter.recordAttempt.bind(adapter),
    recordOutcome: adapter.recordOutcome.bind(adapter),
    reconcile: adapter.reconcile.bind(adapter),
    readProposal: adapter.readProposal.bind(adapter),
  });
  return Object.freeze({ operations, close: () => sql.end({ timeout: 5 }) });
}

// A separate narrow TTE facade preserves the historical HA operation surface.
export function createProviderPaymentExecutor(input: {
 readonly databaseUrl:string;readonly capability:F1SigningConfiguration;readonly humanAuthorization:F2SigningConfiguration;
 readonly evidenceProvider?:EvidenceRevalidationProvider;readonly ssl?:postgres.Options<never>["ssl"];
}): {readonly scheduleProviderPayment:H0011PostgresAdapter["scheduleProviderPayment"];close():Promise<void>} {
 if(!input.databaseUrl.trim())throw new Error('HA_DATABASE_URL_REQUIRED');
 const sql=postgres(input.databaseUrl,{max:1,prepare:false,ssl:input.ssl??"require"});
 const adapter=new H0011PostgresAdapter(sql,input.capability,input.humanAuthorization,input.evidenceProvider);
 return Object.freeze({scheduleProviderPayment:adapter.scheduleProviderPayment.bind(adapter),close:()=>sql.end({timeout:5})});
}
