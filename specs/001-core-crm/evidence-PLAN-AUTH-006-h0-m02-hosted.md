# PLAN-AUTH-006 — Hosted H0-M02 subset

## V-EVI — identity, scope and verdict

- Date: 2026-09-26.
- Authorization: isolated hosted validation of the already implemented and
  formally verified H0-M02; no new TSK was started.
- Project: `wrcrhbdbydkchxxlcacb`, CRM Huescaventura OS - Staging.
- Organization: `dzgrnoidxesrxjtafqwz`; region `eu-west-1`.
- Environment: Work Local, same Mac, repository
  `IAndresB/crm-huescaventura-os`, branch `main`.
- Base: `2945a9c7bb9c55af5216f60a3bcdc750aef34bab`.
- Final commit: the single commit that publishes this evidence.
- Last Approved Commit remains
  `da7b71a3f2962093b7422899ab2193f29ae3c4e0` (D037).
- Platform: Supabase PostgreSQL engine 17, platform `17.6.1.166`, project
  status `ACTIVE_HEALTHY` at final inspection.
- Verdict: **PASS — H0-M02 is applied and the hosted database/F1/H0-M02
  subset is validated on the authorized technical Staging.**
- TSK-H0-009 and TSK-H0-010 remain COMPLETED. H0-005/006 and later tasks remain
  NOT STARTED. PLAN-AUTH-006 remains PENDING globally.

No Production, Auth, UI, Vercel, provider, business data or additional project
was created or exercised.

## Sources and method

Constitution; D037 APPROVED; Plan §§5.1, 5.4, 6.5, 7.1–7.2 and 8;
PLAN-AUTH-006; TSK-H0-009/010; their local evidence; the published H0-M02
migration and adapter; the prior hosted database/F1 evidence. The implementation
was not used as the normative oracle.

Methods: effective catalog/ACL inspection through the Supabase administrative
connector, one corrected Temporary Access session, real runtime authentication
through Session and Transaction poolers, maintained Node/Postgres.js hosted test
suites, security/performance advisors, and the full local regression. Secret
values were supplied only from protected files outside the repository.

## JIT bootstrap and TLS

Temporary Access, the active postgres rule and the scoped PAT were checked before
use. The JIT authorization POST returned HTTP 200. The single corrected Session
pooler login used the current documented option `options='-c jit=true'` with the
official CA and hostname verification. It returned `session_user=postgres`,
`current_user=postgres`, database `postgres`, and an SSL connection. The earlier
`jit=on` authentication rejection is not presented as a database-password defect.

JIT was only the administrative bootstrap channel. It was never used for M2,
F1, C03/C04/C05 or runtime assertions.

## Migration and hosted adaptation

The hosted baseline now records five migrations:

| Version | Name | Result |
| --- | --- | --- |
| `20260917143607` | `h0_m01_roles_hosted` | existing PASS |
| `20260917143656` | `h0_m01_context_hosted` | existing PASS |
| `20260917143704` | `h0_f1_authorities_hosted` | existing PASS |
| `20260917143721` | `h0_f1_capabilities_hosted` | existing PASS |
| `20260926163759` | `h0_m02_unit_history_hosted` | PASS |

`tests/hosted/migrations/202609250000_h0_m02_unit_history_hosted.sql` is the
reviewed operational transcript. The only hosted adaptations are:

1. the migration service provides the outer transaction;
2. the existing pgcrypto 1.3 installation in `extensions` is asserted rather
   than moved or reinstalled;
3. the three crypto primitives are qualified in `extensions`;
4. CRM DDL runs with `SET LOCAL ROLE crm_h0_migration`, followed by `RESET ROLE`
   so Supabase can record migration history.

Schema, codec, limits, SQLSTATEs, comparator, ACL, FORCE RLS and C03/C04/C05
semantics are unchanged. The published product migration was not rewritten.

## Effective catalog, roles and Data API

All H0-M02 tables are owned by `crm_h0_table_owner`, with RLS enabled and forced:
`unit_roots`, `unit_operations`, `unit_attempts`, `unit_history`, `unit_results`
and `external_effect_records`. Their policies name only `crm_h0_executor`.

- Runtime has LOGIN and only explicit schema/function access; it has no direct
  Core SELECT/INSERT/UPDATE/DELETE and no privileged membership.
- `commit_internal_unit` is owned by executor, is SECURITY DEFINER, pins
  `search_path` to `pg_catalog, pg_temp`, and is the only runtime H0-M02 entry.
- Verifier helpers are owned by the NOLOGIN verifier; verifier has no Core DML.
- Executor is NOLOGIN, is not table owner, has no BYPASSRLS and cannot read K.
- PUBLIC has no function execution; runtime cannot call verifier helpers.
- `anon`, `authenticated` and `service_role` have no USAGE on `crm_private`,
  `crm_api` or `crm_f1`, no H0/F1 table grant and no H0/F1 function grant.
  The H0-M02 surface is therefore absent from the Data API trust surface.

Security Advisor after migration and tests: zero findings. Performance Advisor:
three INFO findings for unindexed foreign keys (`unit_operations.root_id`,
`unit_attempts.operation_id`, `external_effect_records.operation_id`). They are
recorded as a bounded future optimization, not a security or correctness failure;
no unapproved schema change was introduced to silence them.

## Hosted behavioral matrix

The maintained suite `tests/hosted/postgres-h0-m02.test.ts` ran as the real
`crm_h0_runtime` login, with `prepare:false` and a single reserved connection.

| Control | Expected | Observed | Result |
| --- | --- | --- | --- |
| Session/Transaction poolers | Strict TLS and real runtime | Both authenticate; SSL true | PASS |
| Transaction affinity | Stable PID/xid/login within unit | Stable binding; fresh xid after unit | PASS |
| Residual authority | No GUC/context after commit | Subsequent transaction has none | PASS |
| C03 apply | State/history/result/intent atomic | One durable unit, minimal result | PASS |
| C04 | Candidate does not confirm evidence | Candidate remains candidate | PASS |
| C05 | Intent differs from attempt/result | Intent stored; provider attempts remain zero | PASS |
| Equivalent replay | Fixed result, no second material change | Same result/history/effect; new attempt only | PASS |
| Different material | E2 | Conflict; no second operation/effect | PASS |
| Expected version | Stale writer rejected | Conflict; no overwrite | PASS |
| Concurrent equivalent | Converge without duplicate | One apply, one replay result | PASS |
| Concurrent conflict | One valid material result | Loser rejected; no incompatible effect | PASS |
| Shared-root concurrency | Version lock protects root | No lost update | PASS |
| Post-COMMIT response loss | Replay recovers durable result | Same result; no duplicate history/effect | PASS |
| Pre-COMMIT error | Full rollback | No partial durable row | PASS |
| F1/M2 mutation attacks | Deny forged authority | GUC/MAC/input/scope/target/expiry rejected | PASS |
| Binding/replay | Deny other tx/client | Previous capability rejected | PASS |
| Direct SQL/helper/role attacks | Deny | DML, helper, SET ROLE, shadow/temp denied | PASS |
| Immutability/identity | Stable operation/effect, distinct attempt | Constraints and ACL effective | PASS |

Suite result: **12/12 PASS**, zero failures and zero skips. A first diagnostic run
found one test-only assertion that compared the time field twice inside one valid
transaction; xid, PID, database, login and postmaster start were stable while
time correctly advanced. The assertion was narrowed to the actual affinity
contract and the full suite then passed. No product or migration defect was found.

The previous maintained hosted DB/F1 suite was rerun after H0-M02: **10/10 PASS**,
zero failures/skips. F01/M2, F1, C01 and the original C03 surface remain intact.

## History, replay, concurrency and recovery observations

Administrative semantic inspection after the successful run showed:

- each normal operation had one history row and one fixed result;
- before was absent on creation and after matched the authorized synthetic value;
- the evidence state remained `candidate`;
- applicable external records remained `intent`, with provider attempts zero;
- equivalent and post-COMMIT replays added attempts but not a second history,
  result, effect or material state change;
- deliberately conflicting second/third operations left no durable material row;
- there were no orphaned results.

This validates technical persistence, not provider execution, delivery,
distributed exactly-once or durable business idempotency beyond H0-M02.

## Bounded performance

Using the Transaction pooler and the real runtime login, eight small applies and
eight equivalent replays were measured after functional security passed:

- apply: median 1271.7 ms; p95 3340.5 ms;
- replay: median 1347.4 ms; p95 1542.1 ms.

The run is deliberately small and is not a Production capacity benchmark. It
showed no obvious hosted infeasibility. Network/JIT-era conditions and Nano
compute make these values unsuitable as a latency SLO.

## Cleanup and final remote state

All fixtures used `hm2-*` technical identifiers. Cleanup removed 24 roots,
26 operations, 40 attempts, 26 histories, 26 results, 10 external-intent records,
16 F1 consumption rows, two access probes and the one synthetic key. Because the
immutable tables intentionally expose no delete path, cleanup ran as the
administrative table-owner chain in one transaction: RLS was disabled only inside
that cleanup transaction and immediately re-enabled and forced before commit.
Final catalog inspection confirms RLS enabled/forced on all seven relevant tables.

Final counts: roots/operations/attempts/history/results/effects/access_probe/
consumption/keys all zero. Runtime password is absent. No business data remains.
The H0-M02 migration and objects remain as the technical baseline.

Temporary runtime password, K and metadata stayed outside Git with mode 0600 and
were removed after validation. The JIT rule, Temporary Access and temporary PAT
were also removed/revoked at closure; no secret, verifier or connection string is
recorded here.

## Local regression and repository gate

The final evidence commit was permitted only after the following commands passed:

| Command | Expected | Observed |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | locked install | PASS |
| `pnpm audit --prod` | no production vulnerability | PASS |
| `pnpm run typecheck` | type safety | PASS |
| `pnpm run lint` | lint/import boundaries | PASS |
| `pnpm test` | unit/contract regression | PASS |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | real local PostgreSQL regression | PASS |
| `pnpm run build` | production build | PASS |
| `git diff --check` | clean patch | PASS |

Application suite: 27/27 PASS. Real local PostgreSQL suite: 93/93 PASS.
Combined local regression: **120/120 PASS**, zero failures and zero skips.

No dependency, approved source or D037 was changed.

## Limits and next gate

The validated subset is sufficient database evidence for H0-M02 on this Staging,
but PLAN-AUTH-006 remains globally PENDING for Auth, human sessions, MFA,
recovery, SMTP, Vercel/serverless deployment, Production, backup/restore/PITR and
continuity acceptance. The current product connection option `ssl:"require"` is
not asserted to provide verify-full and must be addressed before a hosted app
deployment. No Production performance, RPO/RTO or provider behavior is claimed.

Next action requires a new human authorization. Do not start H0-005/006 or any
later task from this evidence alone.
