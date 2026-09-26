# H0 hosted validation — operational migration transcripts

The first four SQL files are the exact successful migration bodies applied on
2026-09-17 to the explicitly authorized technical Staging project
`wrcrhbdbydkchxxlcacb`. They are not a replacement for the published local
H0-M01/F1 migrations and do not authorize another environment.

The filenames use the migration versions returned by Supabase. The migration
service executes each body in a transaction and records it after `RESET ROLE`.
Do not replay these files on the existing baseline: they are already applied.
Any future reproduction must start from an authorized clean hosted application
surface, confirm the platform roles/extension layout, and execute each entire file
in one administrative transaction. Never use runtime as migration authority.

Operational differences from `supabase/migrations/`:

1. Roles: preserve the original CREATE ROLE attributes, omit the redundant ALTER
   attributes rejected by hosted PostgreSQL, and assert all effective attributes.
2. H0-M01: platform `postgres` preserves effective CONNECT/TEMP for existing
   managed LOGIN roles before revoking PUBLIC database privileges; it performs
   database/public-schema ACL changes itself. Migration receives CONNECT/CREATE,
   not database ownership or superuser. `postgres` receives SET, without INHERIT,
   on migration; CRM objects are created with `SET LOCAL ROLE crm_h0_migration`.
   The remaining H0-M01 schema/objects/policies body is unchanged. RESET ROLE
   restores the platform authority before the migration service records history.
3. F1 authorities: unchanged substantive body; the migration service supplies
   the transaction instead of the file's BEGIN/COMMIT.
4. F1 capabilities: assert existing pgcrypto 1.3 in `extensions`, grant only
   schema USAGE to verifier, and qualify hmac/gen_random_bytes/digest there.
   Do not drop, move or reinstall pgcrypto. The original empty private
   `crm_crypto` schema remains harmless. Crypto algorithms, comparator, key
   custody, codec, limits, roles, policies and narrow functions are unchanged.
   The CRM body runs as migration, with RESET ROLE before history registration.
5. H0-M02: `202609250000_h0_m02_unit_history_hosted.sql` is the reviewed hosted
   operational variant of the published H0-M02 migration. Supabase supplies the
   outer transaction; the body asserts pgcrypto 1.3 in `extensions`, runs CRM DDL
   under the migration role, qualifies only the three pgcrypto primitives in
   `extensions`, and resets role before migration-history registration. Schema,
   codec, SQLSTATEs, ACL, FORCE RLS and C03/C04/C05 semantics are unchanged.

No password, HMAC key, connection string or business data is in these files.
They do not provision keys or enable an application login with a password.

The opt-in `postgres-plan-auth-006.test.ts` is the maintained behavioral hosted
suite. It requires `HOSTED_H0_RUN=1` plus external paths for the runtime password,
JIT PAT, official CA, synthetic key and non-secret metadata. Never place those
values in Git or command output. It intentionally stays outside the default test
glob and must run only against the explicitly authorized technical Staging.

See [hosted evidence](../../specs/001-core-crm/evidence-PLAN-AUTH-006-hosted.md).
Migration/catalog success alone is **not** successful end-to-end hosted F1
validation; the evidence records the separate 10/10 behavioral result.

The opt-in `postgres-h0-m02.test.ts` is the maintained hosted H0-M02 behavioral
suite. It uses only the real runtime login for behavioral assertions and covers
both poolers, transaction binding/cleanup, F1/M2 attacks, C03/C04/C05, replay,
concurrency, expected-version conflicts, post-COMMIT recovery, rollback and ACL
attacks. Its external secret-path contract is identical in spirit to the prior
hosted suite; no secret belongs in Git or test output. See
[H0-M02 hosted evidence](../../specs/001-core-crm/evidence-PLAN-AUTH-006-h0-m02-hosted.md).
