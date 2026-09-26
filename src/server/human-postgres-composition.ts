import postgres from "postgres";
import type { AuthVerificationPort } from "../application/verified-auth.ts";
import { verifyAuth } from "../application/verified-auth.ts";
import { H0005PostgresAdapter } from "../infrastructure/postgres/h0-005-adapter.ts";
import type { F1SigningConfiguration } from "../infrastructure/postgres/f1-codec.ts";
import type { F2SigningConfiguration } from "../infrastructure/postgres/f2-codec.ts";

// Future Supabase Auth adapter must implement AuthVerificationPort by actually
// verifying provider identity/assurance. H0-005 supplies only a synthetic stub.
export function composeHumanPostgresRuntime(input: {
  readonly databaseUrl: string;
  readonly f1: F1SigningConfiguration;
  readonly f2: F2SigningConfiguration;
  readonly auth: AuthVerificationPort;
}) {
  if (!input.databaseUrl?.trim()) throw new Error("HUMAN_DATABASE_CONFIGURATION_REQUIRED");
  try {
    const sql = postgres(input.databaseUrl,{
      max:1,prepare:false,ssl:"require",
    });
    const adapter = new H0005PostgresAdapter(sql,input.f1,input.f2);
    return Object.freeze({
      verify: (opaqueProof: string) => verifyAuth(input.auth,opaqueProof),
      access: adapter,
      close: () => sql.end({timeout:5}),
    });
  } catch {
    throw new Error("HUMAN_RUNTIME_CONFIGURATION_INVALID");
  }
}
