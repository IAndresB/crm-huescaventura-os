import postgres from "postgres";
import type { AuthGlobalRevocationPort } from "../application/global-access-revocation.ts";
import type { AuthVerificationPort } from "../application/verified-auth.ts";
import { verifyAuth } from "../application/verified-auth.ts";
import { H0005PostgresAdapter } from "../infrastructure/postgres/h0-005-adapter.ts";
import { H0013GlobalAccessRevocationAdapter } from "../infrastructure/postgres/h0-013-adapter.ts";
import type { F1SigningConfiguration } from "../infrastructure/postgres/f1-codec.ts";
import type { F2SigningConfiguration } from "../infrastructure/postgres/f2-codec.ts";

// Future Supabase Auth adapter must implement AuthVerificationPort by actually
// verifying provider identity/assurance. H0-005 supplies only a synthetic stub.
export function composeHumanPostgresRuntime(input: {
  readonly databaseUrl: string;
  readonly f1: F1SigningConfiguration;
  readonly f2: F2SigningConfiguration;
  readonly auth: AuthVerificationPort;
  readonly authRevocation: AuthGlobalRevocationPort;
}) {
  if (!input.databaseUrl?.trim()) throw new Error("HUMAN_DATABASE_CONFIGURATION_REQUIRED");
  try {
    const sql = postgres(input.databaseUrl,{
      max:1,prepare:false,ssl:"require",
    });
    const adapter = new H0005PostgresAdapter(sql,input.f1,input.f2);
    const globalRevocation = new H0013GlobalAccessRevocationAdapter(
      sql,input.f1,input.f2,input.authRevocation,
    );
    const access = Object.freeze({
      establish: adapter.establish.bind(adapter),
      reidentify: adapter.reidentify.bind(adapter),
      revokeOne: adapter.revokeOne.bind(adapter),
      revokeAll: globalRevocation.revokeAll.bind(globalRevocation),
      readCoreProbe: adapter.readCoreProbe.bind(adapter),
      applyCoreProbe: adapter.applyCoreProbe.bind(adapter),
    });
    return Object.freeze({
      verify: (opaqueProof: string) => verifyAuth(input.auth,opaqueProof),
      access,
      close: () => sql.end({timeout:5}),
    });
  } catch {
    throw new Error("HUMAN_RUNTIME_CONFIGURATION_INVALID");
  }
}
