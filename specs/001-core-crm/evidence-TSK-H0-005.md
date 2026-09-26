# Evidence — TSK-H0-005 (implementation, local only)

Status: COMPLETED in the authorized **local implementation** scope, subject to
the separate, still NOT STARTED TSK-H0-006 adversarial reverification. Date:
2026-09-26. Base: `8806f9e345d13a710357ef2f23a59fb26b7316ce` on clean
`main`; Last Approved Commit remains
`6248820e3253a9d88755ed0a4996fff8f865690e` (D038). No Supabase
Staging connection or modification was made.

## V-EVI: sources, environment and implementation

Normative sources: Constitution P10; D038 APPROVED (F2), D037 APPROVED (F1
separation), D025/D026/D027/D031/D032; Tasks TSK-H0-005/006 and §§2.2/2.3/6/7;
Plan §§6.1/6.3–6.5, B01 and C01/C03; SPEC-FR-SEC-001/004/005,
SPEC-NFR-002, AC-064/080; ARCH-DEC-004, DM-INV-050 and SM-FORB-29. The
historical F1 implementation is a regression target, not the normative source.

Environment: Work Local, same Mac/repository/branch; PostgreSQL 17.11
(Postgres.app) via disposable Unix-socket clusters, Node 24.21.0, pnpm 11.19.0.
Each test cluster, synthetic role/data/key and socket is removed in teardown.
No hosted resource or real personal data was used.

Forward migrations, without rewriting H0-M01/F1/H0-M02:

1. `202609260000_h0_m03_authorities.sql`: NOLOGIN F2 table owner, verifier and
   executor, granted to migration authority but not runtime.
2. `202609260001_h0_m03_actor_session_access.sql`: singleton CRM Actor and
   protected mapping, independent sessions and historical identification
   epochs, F2 key store, verifier, narrow operations, grants and FORCE RLS.
   Migrations contain **no K-F2, password, Auth user or business data**.

The synthetic test provisions K-F2 as a fresh 32-byte random value outside
versioned SQL, distinct from K-F1. F2 uses a separate 25-field length-prefixed
UTF-8 codec, `CRM-H0F2` v1, HMAC-SHA-256 full 32-byte MAC, exact key_id,
environment/generation and 30-second nbf/expiry. Its binding checks actual
PostgreSQL xid8, PID, database OID, postmaster start and session_user.
The private verifier uses a new 32-byte random comparator key on each call,
`CRM-H0F2-CMP-v1`, double-HMAC and a 32-byte XOR/OR loop. K-F1 and the F1
protocol are unchanged.

The test-only Auth stub maps opaque random proofs to verified subject,
session and assurance. A branded boundary rejects a client-shaped copy. No
real Supabase Auth, login, JWT validation, TOTP or recovery service exists.
The server-classified route signal is separately branded; Core F2 issuance
requires `interactive_read` or `interactive_action`, whereas refresh,
polling, jobs and passive events cannot mint it. The actor mapping is
administrative-only. Actor, then session, then epoch is the lock order for
Core admission, reidentification and revocation; disable/global revoke lock
the actor prefix. Server clock determines identified/activity timestamps
and strict 7×24h / 30×24h limits. Epochs are not overwritten on
reidentification. Disable advances access_generation; revoke-all increments
it monotonically and old sessions cannot reidentify into the new generation.

Runtime has no direct SELECT/DML on actor/session/epoch/keys/Core probes, no
F2 helper/signing endpoint and no privileged membership. PUBLIC and the local
generic role have no implicit F2 surface; hosted Data API remains untested.
Verifier only reads the F2 key store;
executor cannot read K-F2. F2 admission and F1 technical C01/C03 occur in
one PostgreSQL transaction via narrow human probe functions. F1 alone does
not enter that human interface; F2 alone does not execute the technical
operation. C02 remains a domain-only decision and is not reimplemented.

## V-EVI: expected → observed

| Control / source | Expected | Observed | Result |
|---|---|---|---|
| D038 actor/mapping; AC-064 | One admin mapping; runtime cannot register or enable another actor | Unique singleton; migration-only provisioning; direct runtime calls denied | PASS |
| D038 verified identity; M1 | Client-supplied subject, MFA, epoch, interaction or activity flag cannot mint authority | Unbranded copies fail; password-only and MFA-only identification denied; passive classes denied | PASS |
| D038 F2/K; M2 | Runtime cannot read K/sign or change claims, scope, operation, input, audience, key or binding | Catalog/ACL and direct SQL negatives; all 25 payload fields altered with original MAC fail; random/short/empty MAC fail | PASS |
| D038 binding/replay | Capability never crosses transaction or backend | Cross-transaction and simultaneous cross-PID attempts denied | PASS |
| D038 key lifecycle | Exact key selection, generation, revocation, no fallback | Unknown ID/wrong generation/wrong K rejected; rotated key accepted, revoked old key rejected | PASS |
| D038 7/30; D026 | Strict before/equality/after; check before activity update; independent of client timezone | Deterministic microsecond boundaries, live expired sessions and DST-hostile TimeZone pass; denied call does not move activity | PASS |
| D038 sessions/epochs | Independent devices, historical reidentification, no old-epoch revival | Two active sessions; one device's read moves only its activity; new epoch recorded, old remains closed | PASS |
| D038 revoke/disable | One-session and all-session revoke, monotonic generation, actor disable | Other device stays valid after one revoke; global revoke/disable deny old sessions even after enable | PASS |
| D038 lock order | Revocation/disable cannot race past authorized Core | Real concurrent transactions show competing action waits for actor lock; later access denied; two reads serialize | PASS |
| D038/ARCH C01+C03 | F2 and F1 both required in same transaction, minimal projection and atomic write | C01 returns public fields only; F1-only/F2-only fail; C03 write and activity commit/rollback together | PASS |
| D038 roles/RLS; SPEC-FR-SEC-005 | Runtime/PUBLIC no direct Core or key access; FORCE RLS | Effective catalogs and direct SQL attacks deny tables, key, verifier, SET ROLE, GUC and search_path/temp shadow | PASS |
| V-MIG | From empty and H0-M02 upgrade, preserve predecessor, runtime denied, atomic failure/retry | Historical chain applied to PostgreSQL 17.11; predecessor row preserved; injected mid-migration failure left no H0-M03 hybrid and retry succeeded | PASS |
| Sensitive output | Synthetic canary must not escape public failure | Generic `F2_CORE_DENIED`, no canary in returned error | PASS |

Fault injection also proved rollback after activity update/before Core insert,
after prior epoch closure/before next insert, and during generation increment.
No partial activity, Core row, epoch transition or generation survived. The
failed F1 material write did not commit the F2 activity update.

## Commands and observed results

- `pnpm install --frozen-lockfile`: PASS, no lockfile change.
- `pnpm audit --prod`: PASS, no known production vulnerabilities.
- `pnpm run typecheck`: PASS.
- `pnpm run lint`: PASS, import boundaries.
- `pnpm test`: PASS, 27/27.
- `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres`: PASS, 115/115 (22 H0-005 implementation tests plus prior suites); zero skipped. Together with `pnpm test`: 142/142.
- `pnpm run build`: PASS.
- `git diff --check`: PASS after final staging check.

Implementation defects discovered and corrected before final verification:
session UUID validation in the synthetic boundary, and DST-sensitive
calendar-day interval arithmetic. The latter now compares epoch seconds for
strict 7×24h/30×24h duration, unaffected by caller `TimeZone`.

## Limits and capabilities not accredited

This is implementation evidence, **not** TSK-H0-006's independent normative
verification. It does not prove a real Supabase Auth subject/session/AAL2
adapter, actual password/TOTP verification, recovery delivery, browser/HTTP
routes, production session cookies, hosted H0-M03 migration, hosted RLS, TLS
configuration, Production, or H6 integrated permission surfaces. The
synthetic Auth port must be replaced and independently tested before real
access. PLAN-AUTH-002 and PLAN-AUTH-006 remain PENDING globally. TSK-H0-006
and all later tasks remain NOT STARTED. Staging `wrcrhbdbydkchxxlcacb` was
not touched.
