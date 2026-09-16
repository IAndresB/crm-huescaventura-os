import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import type postgres from "postgres";
import type { F1SigningConfiguration } from "../../src/infrastructure/postgres/f1-codec.ts";

export async function hardenF1(bootstrap: postgres.Sql, migration: postgres.Sql): Promise<F1SigningConfiguration> {
  await bootstrap.unsafe(await readFile(new URL("../../supabase/migrations/202609160000_h0_f1_authorities.sql", import.meta.url), "utf8"));
  await migration.unsafe(await readFile(new URL("../../supabase/migrations/202609160001_h0_f1_capabilities.sql", import.meta.url), "utf8"));
  const configuration: F1SigningConfiguration = {
    key: randomBytes(32), keyId: randomUUID(), audience: randomUUID(), generation: randomUUID(),
    allowedPurposes: ["h0-007-local-verification", "f1-corrective-test"],
  };
  // Ephemeral local administrative channel; never runtime and never a versioned secret.
  await migration`
    insert into crm_f1.keys (key_id, secret, audience, generation, purposes, enabled, valid_from, valid_until)
    values (${configuration.keyId},${Buffer.from(configuration.key)},${configuration.audience},
      ${configuration.generation},${configuration.allowedPurposes},true,
      clock_timestamp() - interval '1 minute',clock_timestamp() + interval '1 hour')
  `;
  return configuration;
}
