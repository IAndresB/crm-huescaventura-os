# PLAN-AUTH-006 — Hosted database / F1 subset

## V-EVI — execution identity and verdict

- Dates: 2026-09-17 through 2026-09-25.
- Authorization: human continuation for the newly created technical Staging only.
- Project: `wrcrhbdbydkchxxlcacb`, CRM Huescaventura OS - Staging.
- Organization: `dzgrnoidxesrxjtafqwz`; region `eu-west-1`; reported plan `free`.
- Previous project explicitly excluded; no operation in this execution targets it.
- Environment: same Mac, Work Local, repository IAndresB/crm-huescaventura-os, main.
- Base and current HEAD/origin/main: `841064d1bd4895c680b4cb58e0d537587ee9d8f7`.
- Final commit: the single evidence commit that publishes this file (assigned on publication).
- Last Approved Commit unchanged: `da7b71a3f2962093b7422899ab2193f29ae3c4e0`.
- Verdict: **VALIDATED — the hosted DB/F1 subset passed on real Supabase PostgreSQL,
  Session pooler and Transaction pooler.**
- PLAN-AUTH-006 remains PENDING globally; only its hosted database/F1 subset is
  validated. Auth, human sessions, MFA/recovery, SMTP, Vercel and Production are
  outside this execution and remain pending.
- H0-008 remains COMPLETED locally, F01 CLOSED locally; no hosted closure inferred.
- H0-005/006/009/010 remain NOT STARTED.

## Sources and method

Constitution P10–P15/P13; D037 APPROVED (especially clauses 2–12); Plan §§3.2,
5.4, 6.5, 7.2 and PLAN-AUTH-006; Tasks H0-007/008; their existing evidence;
the four published H0-M01/F1 migrations; F1 codec, adapter, transaction/runtime
and server composition. Approved normative sources were not changed.

Current official platform references:

- [Connections and pooler modes](https://supabase.com/docs/guides/database/connecting-to-postgres).
- [PostgreSQL roles](https://supabase.com/docs/guides/database/postgres/roles).
- [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [Backups and recovery](https://supabase.com/docs/guides/platform/backups).
- [Supabase changelog](https://supabase.com/changelog.md).

Live methods: project/organization metadata, administrative PostgreSQL queries,
transactional migration service, effective PostgreSQL catalogs/privilege
functions, live Data API negative requests using an existing publishable key,
security/performance advisors, local DNS/routing inspection and local regressions.
Administrative catalog checks are explicitly not login-runtime or pooler tests.

## Initial gate and platform

Git status/branch/remotes/fetch/rev-parse: clean main, correct SSH origin,
HEAD == origin/main == base. No concurrent change or overwrite.

Application-clean hosted preflight: no own public relations/functions/policies,
no crm_* roles/schemas, zero Auth users. Standard Supabase objects were preserved.
PostgreSQL reports **17.6**, aarch64 Linux; platform version **17.6.1.166**.
This is not local PostgreSQL 17.11. Initial/final project status ACTIVE_HEALTHY.
Administrative session_user/current_user is postgres: not SUPERUSER, with
CREATEROLE/CREATEDB/BYPASSRLS. This platform authority is never ordinary runtime.
max_connections = 60; ssl = on. This is a database limit, not a measured pooler limit.

## Migrations and operational adaptations

Expected: reproduce historical H0-M01 then F1 without changing D037.
Observed: all four successful hosted bodies are retained verbatim under
`tests/hosted/migrations/`, with the versions returned by Supabase:

| Version | Name | Result |
| --- | --- | --- |
| 20260917143607 | h0_m01_roles_hosted | PASS |
| 20260917143656 | h0_m01_context_hosted | PASS |
| 20260917143704 | h0_f1_authorities_hosted | PASS |
| 20260917143721 | h0_f1_capabilities_hosted | PASS |

Operational findings, not suppressed:

1. The unchanged historical roles migration failed 42501 at redundant ALTER ROLE
   NOSUPERUSER; PostgreSQL reported that altering SUPERUSER attributes requires
   superuser. Transaction rollback left no crm roles. Fresh CREATE ROLE with the
   same nonprivileged attributes succeeds. Hosted variant omits redundant ALTER
   and asserts effective attributes; no privilege is relaxed.
2. H0-M01 local bootstrap assumes database/public-schema ownership. Hosted
   platform ownership is preserved: database/global ACL setup runs as postgres;
   migration only receives CONNECT/CREATE. Existing managed LOGIN roles retain
   their previously effective CONNECT/TEMP explicitly before PUBLIC is revoked.
   CRM schema/object creation runs as crm_h0_migration, not postgres.
3. Attempting ADMIN TRUE back to postgres failed 0LP01 (own grantor). Only the
   required SET TRUE/INHERIT FALSE is granted; existing creator ADMIN membership
   remains distinct. Runtime receives no membership.
4. Leaving SET LOCAL ROLE migration active prevented the migration service from
   inserting its history (42501, supabase_migrations); the transaction failed.
   RESET ROLE at the end fixes history registration without granting runtime or
   migration access to the platform's migration-history schema.
5. pgcrypto 1.3 already exists in extensions, owned by postgres. It was not moved,
   dropped or reinstalled. The hosted F1 body qualifies the same three primitives
   in extensions and grants verifier USAGE. No cryptographic semantics changed.

Failed attempts did not leave partial CRM schema changes; successful migration
history contains the four versions above. Published local migrations and all
productive source code remain unchanged. These hosted bodies are specific to the
inspected platform layout, not a universally applicable Supabase bootstrap.

## Effective roles, grants, ownership and policies

All six crm roles: SUPERUSER/CREATEDB/CREATEROLE/INHERIT/BYPASSRLS false.
Migration/runtime/untrusted LOGIN true; table_owner/verifier/executor LOGIN false.
No password or HMAC key has been provisioned in this execution.

- Runtime has CONNECT, no database CREATE, no role memberships, no Core table or
  column SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER privilege.
- Untrusted has no CONNECT to postgres after PUBLIC database privileges revoked.
- Runtime has USAGE only on crm_api among CRM schemas and EXECUTE on read_probe
  and apply_probe_batch; no access to private helpers or keys.
- All three technical tables are owned by crm_h0_table_owner, not executor/runtime.
- Verifier can SELECT keys, not insert/update them, and has no Core column DML.
- Executor cannot read keys; it receives only the intended Core data permissions.
- Migration inherits/sets/administers the three privileged NOLOGIN roles; this
  belongs to the administrative trust perimeter, not runtime.
- Helpers fields/verify/row_allows owned by verifier; executors owned by executor.
  All five functions pin search_path to pg_catalog, pg_temp. fields is INVOKER;
  verify/row_allows/read_probe/apply_probe_batch are SECURITY DEFINER.
- Function ACLs list only their owners and explicit executor/runtime grants;
  PUBLIC has no EXECUTE. anon/authenticated/service_role have neither USAGE of
  the four CRM schemas nor EXECUTE of any F1/API function.
- access_probe has RLS and FORCE RLS. Only executor SELECT/INSERT policies exist,
  calling authenticated row_allows for C01/C03; old plain-GUC policies removed.
- keys/consumption are private grant-protected tables, not RLS-enabled. This is
  the existing F1 design, not an omitted claim that every technical table has RLS.

## Interim control matrix — 2026-09-17

| Control / source | Expected | Observed | Classification |
| --- | --- | --- | --- |
| Hosted platform / D037.12 | Real PG17, supported roles | PG17.6; six roles created; no custom role privileged attrs | PASS |
| V-MIG / P13 | H0-M01 → F1, exact ownership | Four transactional hosted variants applied; catalog matches | PASS |
| pgcrypto / D037.5–6 | Same HMAC/RNG/digest | 1.3 in extensions, references adapted without relocation | PASS for availability; execution pending |
| M2 / D037.1–2 | No authority fabrication | ACL/membership denial confirmed; actual runtime-login attacks not run | PARTIAL |
| F1 / D037.3–7 | Signed authorization and binding | Functions installed; no synthetic key provisioned or valid capability executed | NOT TESTABLE YET |
| C01 / D037.8 | Scope and minimum projection | Structural grants verified; hosted valid/invalid scoped reads pending | NOT TESTABLE YET |
| C03 / D037.9–10 | Atomic manifest and consumption | Tables/functions installed; hosted writes/rollback/replay pending | NOT TESTABLE YET |
| SECURITY DEFINER / D037.11 | Safe owner/path/ACL | Catalogs match; shadow/hostile-query execution pending | PARTIAL |
| RLS / D037.11 | Effective scope isolation | ENABLE/FORCE and policies confirmed; real scoped behavior pending | PARTIAL |
| Direct PostgreSQL / D037.4 | Runtime login from same Mac | Host has AAAA only; no default IPv6 route on Mac | NOT TESTABLE YET |
| Pooler / D037.4 | In-transaction PID/xid/login affinity | Official host/ports known; session administrative provisioning authentication rejected 28P01 after verified TLS; no runtime credentials provisioned | NOT TESTABLE YET |
| Serverless / Plan B01 | Reserved transaction, max1, prepare false | Existing implementation aligns conceptually with docs; no Vercel deployed | PARTIAL |
| Key custody / D037.5 | Runtime/executor no K, verifier minimum | Key ACLs match; provision/rotate/revoke/restore generation untested hosted | PARTIAL |
| TLS / D037.12 | Encrypted real connections | Prior management channel TLS1.3 AES256; session pooler client now validates official CA and hostname before authentication rejection; runtime/transaction pooler and enforcement pending | PARTIAL |
| Logs/backups/recovery | No secret leakage, recovery verified | Settings inspected; no K emitted; no restore/PITR/backup trial | PARTIAL |
| Data API / D037.2 | No Core/F1 access | Live requests for all three schemas return 406 PGRST106; role ACLs denied | PASS for tested exposure |
| Advisors | No unresolved advisory | Security [] and performance [] | PASS |
| Bounded performance | No obvious infeasibility | Valid F1 C01/C03 not executable yet; no misleading benchmark | NOT TESTABLE YET |
| Local regressions | Prior guarantees intact | 84 runner results PASS; typecheck/lint/audit/build PASS | PASS, local only |

## Connection, TLS, logging and recovery limitations

Direct DNS: db.wrcrhbdbydkchxxlcacb.supabase.co has an AAAA record and no A record.
Node lookup on this Mac returns ENOTFOUND with its current network configuration;
the AAAA record is confirmed separately by dig, and no default IPv6 route exists.
No paid IPv4 add-on was enabled and no machine/network environment was changed.

Official docs state that the shared pooler host must be copied from Connect; its
cluster index cannot be inferred from region. The subsequent human continuation
supplied aws-1-eu-west-1.pooler.supabase.com, session 5432 / transaction 6543.
Transaction mode requires prepare:false; Postgres.js implementation already uses
max:1 and prepare:false. A session-pooler connection would not prove direct access.
Neither documentation nor administrative SQL proves runtime transaction affinity.

The observed administrative channel uses TLSv1.3, TLS_AES_256_GCM_SHA384, 256 bits.
ssl=on alone does not prove mandatory TLS or certificate validation for all clients.
Logging defaults inspected: log_statement=ddl, log_min_error_statement=error,
log_parameter_max_length=-1, log_parameter_max_length_on_error=0. A transaction-local
administrative check can set log_statement=none and log_min_error_statement=panic;
no persistent logging configuration was changed. This is not proof of provider log,
audit or backup secrecy. Runtime capability/key-bearing paths remain untested.

Organization reports free plan. Official backup documentation recommends manual
exports for free projects; do not infer available customer restore/PITR, RPO/RTO,
backup encryption/access controls or tested generation replacement. No add-on,
plan change, restore, clone or backup download was performed.

## Commands, expected and observed

Initial git gate and final git diff/status/rev-parse: expected main/base integrity;
base remains unchanged, only hosted evidence/operational fixtures/coordination pending.

Local commands executed after adding the hosted SQL transcripts:

| Command | Expected | Observed |
| --- | --- | --- |
| pnpm install --frozen-lockfile | Locked install | PASS, already up to date |
| pnpm audit --prod | No production vulnerability | PASS, none reported |
| pnpm run typecheck | Type safety | PASS |
| pnpm run lint | Import boundaries | PASS |
| pnpm test | Unit/contract regressions | PASS 27/27 |
| POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres | Real local PostgreSQL regressions | PASS 57/57 |
| pnpm run build | Production build | PASS |
| git diff --check | No whitespace errors | PASS |

Total 84 runner results (83 cases + 1 parent container), zero failures/skips.
These are local results, not 84 hosted tests. No dependencies changed.

## Final remote state and resumption gate

Staging remains ACTIVE_HEALTHY with four recorded migrations, six technical roles,
four CRM schemas, three technical tables and five functions. pgcrypto remains in
extensions. keys=0, consumption=0, access_probe=0. No synthetic K/password provisioned,
no business data, no CRM Auth/UI, no deployment, no new project/branch/paid resource.
No temporary local database process remains from the completed regression suite.

Next: correct/verify the administrative credential for this exact project in the
already protected local file (current value rejected 28P01), then establish ephemeral technical credentials through a protected administrative
channel, provision independent synthetic K securely, then execute the remaining
runtime/pooler/M2/F1/C01/C03/custody/performance checks. Clean temporary material and
repeat final checks before any single evidence commit/push. Do not replay the four
already applied migrations. Preserve this partial evidence on resumption.

No material D037 incompatibility has been demonstrated. Conversely the full subset
cannot be called VALIDATED or used to lift hosted prerequisites for H0-009.
H0-009 still needs separate human authorization and is not started here.

## Continuation gate — endpoints supplied, credentials blocked

The human supplied official Dashboard Connect endpoints for this project:
`aws-1-eu-west-1.pooler.supabase.com:5432` (session) and `:6543` (transaction).
This resolves the previous missing-endpoint blocker, not authentication or affinity.

Live rechecks in this continuation: main, expected SSH remote, successful fetch,
HEAD == origin/main == 841064d1bd4895c680b4cb58e0d537587ee9d8f7. The deliberate
pending files remain; the SHA-256 hashes of all four hosted SQL transcripts match
the preceding execution. Supabase reports ACTIVE_HEALTHY and the same four
migration versions. Role attributes, owners, function ACL/search_path, runtime's
zero memberships, FORCE RLS and pgcrypto location match the recorded baseline.
keys/consumption/access_probe remain empty. No material concurrent drift observed.

Credential discovery inspected existence/names only: no standard PostgreSQL or
database-password environment variables, no ~/.pgpass and no ~/.pg_service.conf.
No secret values were read or printed. The connected SQL tool accepts query text,
not separate bound parameters or a protected password-provisioning input. No
secure credential transfer through that tool has been established. Suppressing
database statement logs alone would not establish secrecy of tool/API traces;
passing SCRAM verifiers as SQL literals is not assumed safe either.

Per the explicit stop condition, no password/key was generated or changed, no
pooler authentication attempted, and no F1 behavioral result inferred from the
administrative connection. No remote mutation occurred in this continuation.

Minimum human action: place the existing PostgreSQL administrative password for
THIS project only in a protected local UTF-8 file outside the repository (one
password, no connection string; file 0600, parent directory 0700), and provide only
its absolute path. For example, a dedicated file under
/Users/andres/.config/crm-huescaventura/. Do not paste its contents into chat and do
not reset the project password unnecessarily. This administrative channel would
be used only to provision/clean up temporary technical runtime credentials and K;
all M2/C01/C03 tests must still authenticate as runtime, never as administrator.

This is an operational access blocker, not a demonstrated failure of D037 or
Supavisor. Approval sources, productive code, migrations/tests and Last Approved
Commit remain unchanged. Only this evidence and coordination are updated. The
local regression suite is repeated for this documentary continuation; hosted
behavioral tests remain NOT TESTABLE YET. No commit/push while the subset is incomplete.

## Continuation — local credential supplied; authentication rejected

The human supplied an administrative password file outside Git. The filesystem
check confirms owner andres, directory 0700 and file 0600. No contents, length,
hash, password verifier or connection string were printed. Reading removed only
one optional terminal newline; format checks found a nonempty value without BOM,
remaining line breaks, outer whitespace, wrapping quotes or connection-string form.
The user's file was not modified or deleted.

Git still matches the expected base; only the prior pending hosted package exists.
Project metadata and migration history match the baseline. The administrative
management-channel catalog confirms postgres LOGIN/CONNECT, runtime memberships=0,
keys=0, consumption=0, probes=0 and pgcrypto still in extensions. No migration was
reapplied and no remote mutation was performed.

Provisioning connection attempts used Postgres.js 3.4.9, session pooler port 5432,
the documented postgres.<project-ref> administrative login, max:1, prepare:false,
and certificate rejection enabled. This channel was intended only for provisioning,
not for running M2/F1 tests as administrator.

1. Default Node trust store: SELF_SIGNED_CERT_IN_CHAIN, before authentication.
2. The guessed generic supabase.com/downloads certificate URL returned 404; it was
   not used as trust material. The actual distribution URL was located in the
   [official Studio configuration](https://github.com/supabase/supabase/blob/master/apps/studio/hooks/custom-content/custom-content.json),
   as used by its SSLConfiguration component:
   https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt.
   It was fetched over verified HTTPS and held in memory, not installed globally.
3. CA SHA-256 fingerprint (public certificate, not a secret):
   80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA.
4. With that CA and rejectUnauthorized:true, PostgreSQL authentication failed
   with SQLSTATE **28P01**. One confirmation attempt explicitly pinned servername
   to aws-1-eu-west-1.pooler.supabase.com and returned the same code. No fallback
   to unverified TLS or plaintext was used and no password variants were guessed.

The client reaching PostgreSQL password rejection after TLS verification proves
the session endpoint's accepted CA/hostname path for these attempts, not successful
database login, negotiated protocol/cipher measurement, runtime TLS, transaction
pooler TLS, or server-wide SSL enforcement. See the official
[SSL verification guidance](https://supabase.com/docs/guides/platform/ssl-enforcement).
The existing productive runtime's ssl:"require" does not itself provide certificate
verification in Postgres.js; this validation explicitly uses an SSL options object.
No productive runtime configuration was changed.

The BEGIN/provisioning callback was never reached. No runtime password, SCRAM
verifier or hosted K was generated/provisioned. No runtime behavioral test or
performance measurement can be credited. Both client instances were closed.
This is an authentication blocker, not a demonstrated D037/pooler security failure.

Minimum human action: verify that the protected file contains the CURRENT raw
PostgreSQL password for postgres of project wrcrhbdbydkchxxlcacb (not an API key,
Dashboard account password, another project's password or URI-encoded password),
and replace it there if necessary. Keep its permissions and communicate only that
it is ready; never send the value. Do not reset the project password blindly.
H0-009 remains NOT STARTED; full hosted validation still cannot be closed.

## Final hosted execution — 2026-09-25

The preceding entries are retained as an audit trail of the blocked attempts.
They are superseded for the hosted DB/F1 verdict by this final execution, after
the project recovered to ACTIVE_HEALTHY and official Temporary Access/JIT was
used only as an administrative bootstrap channel.

### Administrative bootstrap and separation

- Temporary Access was enabled only for the validation window. A project-scoped,
  short-lived PAT and an explicit user-to-`postgres` rule authorized the JIT
  session. The current documented pooler option `jit=true` succeeded; `jit=on`
  did not authenticate on this platform version.
- The JIT administrator provisioned an independent random runtime password and
  a distinct synthetic 32-byte F1 key. Neither value was printed, versioned,
  reused, or embedded in a migration/fixture/connection string.
- All behavioral controls authenticated normally as
  `crm_h0_runtime.<project-ref>`, never through JIT. Thus JIT did not weaken or
  contaminate the M2 evidence.
- On completion the runtime password was cleared, the synthetic key and all
  probe/consumption rows were removed, the user JIT mapping was deleted,
  Temporary Access was disabled, both validation PATs were revoked and all
  corresponding local temporary files were removed.

### Maintained independent hosted test

`tests/hosted/postgres-plan-auth-006.test.ts` is opt-in (`HOSTED_H0_RUN=1`) and
requires secret file paths supplied outside Git. It uses Postgres.js 3.4.9 with
`max: 1`, `prepare: false` and strict certificate validation through the official
Supabase CA. It never logs passwords, K, PATs or complete connection strings.

Observed hosted runner: **10/10 PASS**, zero failures, approximately 88.5 s.

| Case | Expected | Observed | Result |
| --- | --- | --- | --- |
| Runtime identity/TLS | Real runtime on both poolers over verified TLS | `session_user=current_user=crm_h0_runtime`; SSL true | PASS |
| Transaction affinity | Stable backend PID/xid within each transaction only | PID/xid stable inside; fresh xid each subsequent unit | PASS |
| Pool reuse | No LOCAL/GUC authority after commit | Four sequential max:1 units retained no value | PASS |
| F01/M2 | Arbitrary runtime SQL cannot fabricate authority | Direct Core DML/SELECT, GUC claims, DDL, GRANT and SET ROLE denied | PASS |
| Catalog | Least roles/grants/owners; no signing oracle | Runtime has zero memberships/direct Core/K access; PUBLIC EXECUTE absent | PASS |
| C03 | Authenticated atomic manifest and one surviving application | Two writes committed together; duplicate and failed batch denied/rolled back | PASS |
| C01 | Capability, correct scope and minimum projection | Public pair only; wrong scope, missing id and hostile input returned no authority/data | PASS |
| Mutation/replay | Fail closed across claims/input/transaction/client | MAC, identity, scope, operation, resource/action, fingerprint, input, tx and client attacks denied | PASS |
| Key lifecycle | Rotation works; revocation fails closed | Rotated key accepted; disabled original rejected; temporary row removed | PASS |
| Bounded performance | No evident hosted infeasibility | 12 C01 samples; median 1285.0 ms, p95 1390.3 ms | PASS |

### Poolers, F1, C01 and C03

Session pooler `:5432` and Transaction pooler `:6543` both accepted the real
runtime login. Within `BEGIN`, PostgreSQL-derived xid8, backend PID, database OID,
postmaster start and login remained coherent through binding, capability and
operation. Transaction pooling did not break backend affinity inside the unit;
later units did not inherit transaction-local state.

The F1 verifier accepted a valid HMAC capability and rejected random/empty MACs,
mutated authenticated fields, different material input, another scope/operation,
another client and cross-transaction replay. Runtime could not call private
verifier helpers, read or update `crm_f1.keys`, assume verifier/executor/owner/
migration, or obtain a signing oracle. C01 returned only `probe_id` and
`public_value`. C03 preserved atomicity, protected technical consumption and
denied a second surviving application without claiming durable idempotency,
history, intent or result.

### SECURITY DEFINER, RLS, Data API and advisors

Catalog and hostile execution reconfirmed explicit owners, fixed safe search
paths, qualified references, no PUBLIC EXECUTE, no runtime ALTER/REPLACE, table
owner separate from executor, executor without K, verifier without Core DML,
and `ENABLE/FORCE RLS` after final cleanup. Plain hostile GUCs never conferred
authority. `anon`, `authenticated` and `service_role` have neither CRM-schema
USAGE nor Core/API privileges. Security Advisor and Performance Advisor each
reported zero errors/warnings/suggestions after the final infrastructure state.

### TLS, serverless assumptions and provider limits

Both poolers were exercised with hostname/certificate validation and the official
CA; the server negotiated PostgreSQL 17.6 over TLS. Supabase's incoming SSL
enforcement is enabled. The hosted test validates that Postgres.js can run the
approved pattern with `max:1`, `prepare:false` and a strict CA object. No Vercel
deployment was authorized, so cold-start/concurrency/secret injection in Vercel
remain NOT TESTABLE YET. The current productive runtime helper still uses
Postgres.js `ssl:"require"`; this is not recorded as proof of `verify-full` and
must be hardened/configured before any hosted application deployment.

Free-plan backup/restore, PITR, provider-log access, post-restore generation,
Production RPO/RTO and backup confidentiality were not exercised or inferred.
They remain provider/Production controls under the wider PLAN-AUTH-006.

### Final regression and repository controls

| Command | Observed |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS, locked and already current |
| `pnpm audit --prod` | PASS, no known vulnerabilities |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS, including boundaries |
| `pnpm test` | PASS 27/27 |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | PASS 57/57 |
| `pnpm run build` | PASS |
| hosted opt-in runner | PASS 10/10 |
| `git diff --check` | PASS |

No dependency or productive implementation changed. The maintained hosted test
adds independent real-platform evidence; the four operational SQL transcripts
remain exact records of the successful baseline and are not to be replayed.

### Final verdict and limits

**PLAN-AUTH-006 / hosted database and F1 subset: VALIDATED.** This establishes
Supabase hosted compatibility for H0-M01/F1, minimum roles/grants, pgcrypto,
M2/F01 resistance, capabilities, C01/C03, SECURITY DEFINER, FORCE RLS, both
pooler modes, bounded performance and technical key lifecycle. It is sufficient
for a human to consider separately authorizing H0-009.

PLAN-AUTH-006 is not globally RESOLVED: Auth, sessions, MFA/TOTP, recovery,
SMTP, Vercel runtime, Production, backups/restores and operational continuity
remain pending in their assigned future scopes. H0-008 remains COMPLETED locally;
H0-005/006/009/010 remain NOT STARTED. Last Approved Commit remains D037 at
`da7b71a3f2962093b7422899ab2193f29ae3c4e0`.
