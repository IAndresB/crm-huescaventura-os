# TSK-H0-006 — independent formal verification

Status: FAILED / NOT COMPLETED. Local only, 2026-09-26.
Material finding at initial verification: **H0-006-F01 OPEN at detection**;
the separately authorized local correction is recorded at the end of this file.
Verification stopped at the first
reproduced material defect, as explicitly required by the authorization.
Commit under test: `600ae3bbba6a2b2e2d2bf3332299aed0789d7cd4`.
Preflight: clean main, correct origin, fetched HEAD = origin/main = required base.
Last Approved Commit: `6248820e3253a9d88755ed0a4996fff8f865690e`.

## Independent expected-results matrix (recorded before inspecting H0-005 code)

Sources: D038 complete §§1–20; D037 §§1–11; D015/025/026/027/031/032;
Tasks H0-005/006, §§2.2/2.3, all H0-006 rows of §6 and applicable §7 gates;
Plan §§6.1/6.3/6.4/6.5, PLAN-DEC-007/B01/C01; SPEC-FR-SEC-001/002/004,
AC-064/080, SPEC-NFR-002, E1 (§19); ARCH-DEC-004 (§5); G1.
Implementation, its evidence and tests are not expected-result oracles.

| ID / source | Threat/case | Independent setup | Exact expected | Evidence required / observed |
|---|---|---|---|---|
| N01 D038.2/.8/.19; D015; AC-064 | M2 known IDs, singleton/mapping, direct SQL | Fresh local cluster, ordinary login, separate admin fixtures | No ordinary provision/mapping/DDL/role escalation; one actor | Effective ACL/catalog + attempted calls; PENDING |
| N02 D038.3/.17/.18; SEC-001/004 | Forged Auth objects, password-only/MFA-only, recovery | Independent verifier double; literal/clone/prototype attacks | Only verified complete identity can establish; incomplete Core denied | Boundary and persistent observations; PENDING |
| N03 D038.4/.6; D037.3/.7 | Codec, field mutation, malformed/oversized/Unicode | Independent 25-field length-prefix reference encoder/decoder | Exact bytes, no normalization; malformed or changed claim denied | TS/SQL differential and field attacks; PENDING |
| N04 D038.1/.6 | F1/F2 cross-key/protocol/domain | Independent random keys and signed reference envelopes | All cross-authority substitutions denied | Real runtime calls; PENDING |
| N05 D038.5/.6 | Binding, expiry, replay, GUC | Multiple transactions/PIDs, copied envelope, arbitrary GUC | No cross-unit authority; 30-second expiry enforced | Positive call and denied replays; PENDING |
| N06 D038.6/.19 | Keys and comparator lifecycle | Admin provisions ephemeral keys; runtime/executor tries access | Exact key/no fallback; enabled validity; fresh RNG double-HMAC and 32-byte loop | Catalog, source audit, lifecycle calls; PENDING |
| N07 D038.9/.10/.16 | Session/epoch integrity and stale authority | Two sessions, historical epoch, invalid FK/state fixtures | Foreign/revoked/stale authority denied; constraints enforce declared invariants | DML negatives and runtime access; PENDING |
| N08 D038.11/.13; D025/026; PLAN-AUTH-002 | Exact 7/30 and activity-before-allow | Independent epoch-microsecond arithmetic; UTC/DST hostile timezone | < limit potentially allowed; equality/after denied; failed call changes no activity | Before/after persisted timestamps; PENDING |
| N09 D038.12; D026 | Forged interaction and passive traffic | Server classifier vs client-shaped objects; two devices | Only admitted interactive read/action updates its own session | Boundary plus timestamps; PENDING |
| N10 D038.10/.17/.18 | Reidentify, expired/recovery sessions | Valid full identification and alternate states | New epoch; old times retained; old authority never revives | Persistent epochs and old-capability denial; PENDING |
| N11 D038.1/.2/.15/.16/.17; Plan 6.1/6.3 | Revoke one/all, disable/enable, overflow | Independent connections + lock barriers; BIGINT max fixture | First confirmed revocation wins; authorized lock-holder may finish; no wrap/old-session revival | **FAIL:** revoked session obtains global revocation authority; remaining races/overflow NOT EXECUTED |
| N12 D038.14; D037.8/.9; C01/C03 | Missing/mismatched F1/F2, fault injection | Same transaction, technical read/write, trigger/abort faults | Both authorities and exact input required; activity + Core all-or-none | Persisted effects and rollback observation; PENDING |
| N13 D038.19; SEC-002; V-DAT | SECURITY DEFINER/helper/lookup/search_path/temp | Runtime and generic login, effective ownership/ACL/RLS catalogs | No signing oracle or role escalation; lookup metadata confers no authority | SQL attacks and call-chain inspection; PENDING |
| N14 V-MIG; Tasks 2.2 | Empty/upgrade/inverted/reapply/failure | Fresh cluster and H0-M02 predecessor fixture | Historical chain intact, data preserved, failures atomic/fail-safe | Migration output/catalog/fixture comparison; PENDING |
| N15 E1; Plan 7.1; D037.10 | Sanitization, lost response, uncertainty | Synthetic canary and real commit followed by discarded response | No sensitive output or unsafe reactivation; known guard vs uncertain effect distinguished | Public errors and durable state; PENDING |
| N16 Tasks 2.3; H0-006 §42 authorization | All regressions and scope | Local tests only | Full required suite PASS, zero skipped; no hosted/Auth real | Commands/counts; PENDING |

Fail-fast rule: the first reproduced material violation stops verification;
no production repair, commit or push is authorized on failure. Unexecuted
rows remain PENDING, never inferred PASS from H0-005's tests.

## H0-006-F01 — revoked session can revoke all other sessions

Severity: HIGH / MATERIAL. Surface: ordinary server F2 issuance and
`crm_api.revoke_all_sessions`. Impact demonstrated: unauthorized persistent
global revocation / denial of service against another valid session. This
test does **not** demonstrate unauthorized Core reads, HMAC forgery, key
disclosure or a pure M2-only bypass.

Normative requirement: D038.1/.2/.15/.16/.17 requires current actor/session
authority, denial after confirmed revocation and no recovery of revoked
authority merely because Auth remains valid. Plan §6.1 permits global signout
from another **authorized** device; §6.3 requires effective rejection of prior
sessions even while Auth tokens survive. SPEC-FR-SEC-001/002 and AC-064 require
current authorization, not authentication alone.

### Independent setup and minimal reproduction

1. PostgreSQL 17.11 (Postgres.app), Node 24.21.0, pnpm 11.19.0. Disposable
   local cluster, Unix socket only, TCP disabled. Apply the historical chain
   H0-M01 → F1 → H0-M02 → both H0-M03 migrations, unchanged.
2. Administrative setup provisions one synthetic actor/subject, one technical
   probe and independent ephemeral random F1/F2 keys. Only low-level F1
   bootstrap is reused; no H0-005 test assertions or Auth fixture are copied.
3. Two actual `crm_h0_runtime` connections (max:1, prepare:false) use the
   production H0-005 adapter. An independent AuthVerificationPort double
   verifies opaque synthetic proofs. The server owns keys; the attacking
   caller does not receive them. There is no HTTP endpoint in this package:
   the reproduced attack is at the existing server adapter boundary.
4. Establish A and B with complete identification. Confirm B can read the
   synthetic public probe.
5. Call `revokeOne(authA)` and allow its real transaction to COMMIT. Observe
   `A.revoked_at IS NOT NULL`. Confirm A Core access is denied and B still
   reads successfully.
6. With the same still-verified Auth evidence for A, call
   `revokeAll(authA)`. No new full identification, administrative action or
   test-supplied signing occurs between revocation and this call.
7. Observe durable actor generation and B's Core access after the call.

| Observation | Expected | Observed |
|---|---|---|
| A Core access after revoke-one | DENY | DENY (positive control) |
| B before attack | Authorized | Authorized (positive control) |
| Global revocation requested by revoked A | DENY without mutation | **Succeeds, returns generation 2** |
| Actor generation | Remains 1 | **2, committed** |
| B after attack | Remains authorized | **F2_CORE_DENIED** |

### Cause in the object under test

- `crm_api.f2_lookup` joins the session/epoch but returns the actor's current
  generation without filtering session revocation or session generation.
- `H0005PostgresAdapter.revokeAll` requires an epoch returned by lookup, then
  issues a new F2 using that current actor generation.
- The F2 issuer's revocation branch validates the branded Auth identity and
  session ID match; it does not establish current CRM session authority.
- `crm_api.revoke_all_sessions` authenticates F2 and locks/checks the actor,
  but never checks/locks the calling session or epoch, including revoked_at.
  A valid cryptographic signature therefore authenticates an operation that
  the issuer should not authorize and the persistent gate should reject.

Required correction (proposal only, NOT IMPLEMENTED): require current
authorized initiating session/epoch for global revocation, with actor →
session → epoch locking and D038-consistent generation/revocation checks in
the data function. Server emission/lookup must not promote revoked or stale
session evidence into current authority. An Auth proof remaining valid is
not sufficient. Preserve the failed test; add the related stale-generation,
expired/recovery and concurrent revocation cases in a separately authorized
corrective block, then rerun the complete H0-006 verification.

### Executed command and result

`POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h0-006.test.ts`

Exit 1: **1 test, 0 PASS, 1 FAIL, 0 skipped**. Sanitized observation:
`globalRevocationDenied=false; generationBefore=1; generationAfter=2;
returnedGeneration=2; otherSessionStillAuthorized=false`.

The failure is the normative assertion itself, not bootstrap, migration,
connectivity, parsing or fixture failure. The assertion remains failing;
it was not inverted to turn the defect into a passing regression.

## Stop, scope and limitations

No further adversarial cases or full regression commands were executed after
the material failure. N01–N10 and N12–N16 remain incomplete, even where setup
or positive controls exercised a subset. V-DAT has a material FAIL; V-DOM and
V-MIG are not fully accredited. Historical H0-005 test counts are not new
verification evidence. No claim of a pure M2 forgery or complete F1/F2 audit
is made.

At initial detection only this evidence file and the new independent test were
created. Production code, migrations, H0-005 tests and approved decisions were
unchanged. The previous H0-006 NOT STARTED status was superseded by this
FAILED attempt. H0-005's historical implementation remains completed, but its
formal verification has failed. A later, separately authorized block publishes
this historical failure before any correction.

The cluster is stopped and its data, socket, log and synthetic keys removed
by test teardown. No real credentials, personal data or versioned secrets
were used. Supabase Staging was not contacted or modified. PLAN-AUTH-002/006
remain PENDING globally. No later task, Auth real or hosted H0-M03 started.
At initial detection there was no commit or push. This paragraph records the
historical fail-fast state; publication is documented by the later commit.

## H0-006-F01 — correction implemented, pending full reverification

Status of this corrective block: **FIX IMPLEMENTED / PENDING FORMAL
REVERIFICATION**. The historical failed verification above was published first
in `05bcb395a2092434ff7623416073af42feaf01c9`, separately from this fix.
The defective implementation base was
`600ae3bbba6a2b2e2d2bf3332299aed0789d7cd4`. The original N11 test and
its expected assertion remain unchanged; only the migration chain includes the
new forward fix. **TSK-H0-006 remains FAILED / NOT COMPLETED**: the unfinished
N01–N10 and N12–N16 matrix is not reclassified from focused corrective tests.

Source: D038 §§1–20 (especially current actor/session/epoch, full MFA, lock
order and revocation), D025/D026, Plan §§6.1/6.3 and the published H0-M03
history. Environment: local PostgreSQL 17.11, Unix socket, disposable cluster,
Node 24.21.0, pnpm 11.19.0; synthetic data and ephemeral keys only.

Cause: the generic `f2_lookup` exposed current actor generation for a revoked
initiating session; server F2 issuance promoted that metadata into authority.
The prior `revoke_all_sessions` checked only the actor, so its valid MAC did not
establish live session/epoch authority. This was an authorization failure, not
an HMAC failure.

Correction: `202609260002_h0_m03_revoke_all_authority_fix.sql` is forward-only.
It adds a read-only, narrow `f2_lookup_revoke_all_authority` and replaces the
existing `revoke_all_sessions` definition without changing its signature.
The adapter uses only the narrow lookup for global revocation. The F2 issuer
requires verified Auth MFA for `revoke_all`, without inventing password
reentry. The persistent function verifies F2/input, locks **actor → session
→ epoch**, then rechecks subject, enabled/ready state, signed scope and
generation, unrevoked same-session authority, current full-password/full-MFA
epoch, 7-day inactivity and 30-day absolute limits, and F2 expiry using the
PostgreSQL clock. It increments generation only after all checks. It never
updates human activity, clears revocation, creates an epoch or reidentifies.
Failure maps to `F2_DENIED`; the adapter returns `F2_REVOKE_DENIED`.

| Focused case | Expected | Observed |
|---|---|---|
| Original N11: revoke A, then global revoke from A | DENY; generation 1; B authorized | PASS: DENY, generation 1, B reads |
| Narrow preparation: revoked/stale/disabled/recovery/enrollment/expired/foreign subject/MFA absent | No effective F2 | PASS: all denied, generation unchanged |
| Valid B after A revoked | B may revoke globally | PASS: generation increments once; B activity timestamp unchanged |
| T1 capability prepared, T2 revoke-one(A) COMMIT, T1 global revoke | Locked persistent recheck denies | PASS: SQLSTATE 42501, generation unchanged, B still reads |
| Pre-issued old epoch or later 7/30-day expiry | Locked persistent recheck denies | PASS: no generation change |
| BIGINT maximum generation | Fail closed without wrap/partial mutation | PASS: generation remains maximum, session unrevoked |
| Revoke-one cause-bound review | Cannot revoke a different session using the initiating-session F2 | PASS by source review: signed input equals signed session ID; actor/session/epoch locked; existing one-revoke tests still pass. No change to revoke-one. |

V-MIG: the tests apply H0-M01 → F1 → H0-M02 → historical H0-M03 → fix
from an empty local cluster. A separate predecessor database tests the upgrade:
an injected exception after creation of the new lookup rolls back both it and
the replacement; the old function and synthetic actor fixture remain. An
authorized clean retry succeeds; ordinary runtime cannot apply the migration;
reapplication fails safely without removing the fixed function. Catalog checks
show new lookup owner `crm_h0_f2_executor`, SECURITY DEFINER, runtime EXECUTE,
no PUBLIC EXECUTE and no persistent CREATE grant to executor. The two published
H0-M03 migration files are byte-for-byte unchanged in Git.

Focused commands: original N11 1/1 PASS; H0-005 implementation suite 27/27
PASS. Full engineering regression: `pnpm install --frozen-lockfile` PASS;
`pnpm audit --prod` PASS (no known vulnerabilities); `pnpm run typecheck`
PASS; `pnpm run lint` PASS (import boundaries); `pnpm test` 27/27 PASS;
`POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres`
121/121 PASS, zero skipped; `pnpm run build` PASS; `git diff --check` PASS.
One TypeScript nullability issue in the new adapter lookup was corrected before
the passing regression; no additional material defect was found.

Limitations: this is implementation testing of the local fix, **not** the new
independent full TSK-H0-006 reverification, real Auth/MFA, production access or
hosted H0-M03. PLAN-AUTH-002 and PLAN-AUTH-006 remain PENDING globally.
Supabase Staging was not contacted or changed. F1, D037/D038 and Last Approved
Commit remain unchanged. No secrets, real people or external resources were
created; disposable local clusters are stopped and removed by test teardown.

## FORMAL REVERIFICATION AFTER H0-006-F01 FIX

New independent execution, local only, 2026-09-26. Object under test:
`b73ca9d0f8e93034edfd8f9e9e85601917d69009`. Preflight: main, clean tree,
correct origin, fetch succeeded and HEAD = origin/main = the exact required
base. Last Approved Commit remains `6248820e3253a9d88755ed0a4996fff8f865690e`.
The preceding FAILED record and corrective record are historical evidence,
not an oracle for this execution.

Expected results derive from D038 complete, D037, D015/025/026/027/031/032;
Tasks H0-005/006, §§2.2/2.3, all H0-006 rows of §6 and applicable §7 gates;
Plan §§6.1/6.3/6.4/6.5, PLAN-DEC-007, B01/C01; SPEC-FR-SEC-001/002/004,
AC-064/080, SPEC-NFR-002, E1; Architecture §5/ARCH-DEC-004; SM §2.1 G1.
The implementation and H0-005 expected outputs do not define these results.
The PostgreSQL review guide was used only for supplemental privilege/lock
review; approved D037/D038 prevail over generic GUC/RLS examples.

| Independent control / source | Expected result | Current result |
|---|---|---|
| R01 F01, D038.1/.13/.15/.16, D025 | Revoked A cannot globally revoke; B stays authorized and may revoke globally | PASS for original regression and valid B control; not full F01 closure |
| R02 Issuance and locked recheck, D038.3/.13/.15 | Neither stale lookup nor pre-issued capability bypasses a committed revocation | PENDING |
| R03 Generic lookup, D038.3/.7 | Minimal metadata does not itself confer authority | PENDING |
| R04 M1/M2, D038.2/.3, SEC-001/002, G1 | No fabricated actor/session/MFA, clock extension, signing/key/role access | PENDING |
| R05 F1/F2, D038.1/.6/.14 | Cross-key/domain/payload/target substitutions fail closed | PENDING |
| R06 25 fields/codec, D038.4/.6 | Independent encoder agrees; every mutation or malformed signed input denied | PENDING |
| R07 Binding/replay, D038.5/.6 | No authority outside binding or signed 30-second window, including waiting for locks | FAIL: H0-006-F02; other binding/replay cases NOT EXECUTED |
| R08 GUC/reuse, D038.2/.5, Plan 6.5 | Plain GUCs and reused connections never retain authority | PENDING |
| R09 Keys/comparator, D038.6/.19 | Split key access, fresh blinded full MAC, fixed loop, exact lifecycle/no fallback | PENDING |
| R10 Actor/mapping, D015, D038.8 | One administrator; no ordinary mapping mutation or generation decrease | PENDING |
| R11 Sessions/epochs, D038.9/.10 | Current coherent state, one current epoch, history preserved; runtime no mutation | PENDING |
| R12 Auth/interaction boundaries, D038.3/.12/.17 | Forged/cloned/mutated input has no authority; full identification and server event required | PENDING |
| R13 7/30 limits, D025/026, D038.11 | Exact elapsed 7/30 × 24h; equality denied, timezone/DST independent | PENDING |
| R14 Admission before activity, D038.13, Plan 6.3 | Every rejection leaves previous activity unchanged | PENDING |
| R15 Multidevice/reidentify, D026, D038.9/.10/.17 | Activity isolated; full reidentify creates new epoch, never revives prior authority | PENDING |
| R16 Revoke one/all, D038.15/.16 | Signed session only, generation monotonic, old authority rejected, overflow closed | PENDING |
| R17 Disable/enable, D038.8/.15 | Disable invalidates prior authority; enable never restores old generation | PENDING |
| R18 Locks/races, D038.15 | Actor → session → epoch or compatible prefix; first authorized lock holder may finish | FAIL: H0-006-F02 establishes after expiry while awaiting actor lock; other races NOT EXECUTED |
| R19 Atomicity, D038.14, C01/C03 | Admission/activity/Core in one transaction; each injected failure leaves no partial state | PENDING |
| R20 Dual authority, D038.1/.14 | Protected human surface requires exact valid F1 and F2 and matching input/scope | PENDING |
| R21 ACL/SD/RLS, D038.19, D037.11, V-DAT | Runtime/public/generic denied; NOLOGIN owners, fixed paths, no helper/shadow escalation | PENDING |
| R22 Migration chain, V-MIG | Empty/upgrade/fixtures/order/rollback/reapply preserve data and effective ACL | PENDING |
| R23 Lost response/error, E1, D037.10, D038.2/.16 | Real committed outcomes never revive authority on retry; no sensitive disclosure | PENDING |
| R24 F1/general regression, Tasks 2.3 | All required engineering regressions pass, zero skipped | PENDING |

Execution order prioritizes the original F01 regression and the uncovered
expiry-while-waiting race. On the first reproduced material failure the run
stops, preserves its reproduction and does not infer PASS for unexecuted rows.

### V-EVI — outcome: FAILED / NOT COMPLETED, fail-fast

**H0-006-F02 — OPEN / MATERIAL (HIGH): an F2 that expires while waiting for
the actor lock can establish a fresh, usable human session.** No production
correction was attempted. H0-006-F01 remains FIX IMPLEMENTED / PENDING FORMAL
REVERIFICATION: its original regression passes, but this new full verification
attempt is incomplete and cannot close the task or its full acceptance matrix.
All remaining PENDING rows above mean NOT EXECUTED to completion in this run,
not PASS carried forward from implementation tests. R06/R11/R15/R16 have only
incidental observations from the two cases below, not complete accreditation.

Environment: same local Mac/main; PostgreSQL **17.11 (Postgres.app)**;
Node **24.21.0**; Postgres.js with `max:1`, `prepare:false`; disposable Unix
socket clusters with TCP disabled. The test applies H0-M01 → F1 → H0-M02 →
H0-M03 → the F01 forward fix. Keys, actors, sessions and probe values are
synthetic; signing keys are generated in memory and provisioned only in the
disposable database. This is not real Auth/MFA or hosted evidence.

Normative expected: D038.4 authenticates `not_before`/`expires_at`; D038.6
fixes the signed window at 30 seconds. D038.15 permits an operation that
already obtained locks **and** authorization to finish, not one still waiting
for the actor lock. D038.2 prohibits recovering expired authority. Therefore
a capability that expires before the actor lock and admission must be denied,
without inserting a new session/epoch. This case does not require cancelling
an already admitted transaction retroactively or rejecting only because its
COMMIT occurs after expiry.

Independent reproduction (test `H0-006 R07/R18`):

1. A reference uint32-BE length-prefixed encoder and Node HMAC sign all 25
   fields from the real runtime transaction binding. No production F2 codec
   or issuer is used for establishment. Normal server-side issuance is modeled
   by the trusted synthetic signer, not granted to the database runtime role.
2. Positive control: immediate, valid F2 establishes successfully. Negative
   control: an F2 already expired at verifier entry is denied (`42501`).
3. A separate fixture connection holds the actor row `FOR UPDATE`. Its only
   role here is deterministic lock scheduling; it does not alter the actor,
   clock, policy, function or pending operation. The tested call uses
   `session_user = crm_h0_runtime` throughout.
4. Runtime begins and obtains its actual binding. The trusted reference signer
   issues a fresh, full **30-second** window; the runtime connection invokes
   `crm_api.establish_session`. `pg_blocking_pids` proves it is waiting; no
   attempted session exists yet. The database runtime role never receives K.
5. Wait using the PostgreSQL clock until `now >= expires_at` (plus 100 ms),
   then release the actor lock. No shortened window or clock mock is used.
6. Expected: `42501`, transaction rollback, zero new sessions/epochs and no
   authority from that attempt. Observed: the call succeeds and commits one
   session with `created_at >= expires_at`.
7. A subsequent independent unit, using the ordinary adapter with synthetic
   verified Auth and newly issued F1/F2, successfully reads the Core probe
   through the newly created session. This proves the persistent impact; it
   does **not** claim the expired capability itself was replayed in that new
   transaction or that M2 forged a MAC/read K.

| Case | Expected | Observed | Verdict |
|---|---|---|---|
| Original F01 N11 | Revoked A cannot globally revoke; generation stays 1; B remains allowed | A denied; generation 1→1; B allowed | PASS |
| Valid B global revocation after N11 | Generation increments exactly once; old B denied afterward | 1→2; B Core denied | PASS |
| Fresh reference F2 | Establish allowed inside window | Allowed | PASS control |
| Already expired F2 | Establish denied | SQLSTATE 42501 | PASS control |
| F2 expires while actor lock unavailable | Denied after lock acquisition; no new authority | Accepted, one session created after expiry, subsequent Core access allowed | FAIL / F02 |

Cause localized by source inspection: in
`supabase/migrations/202609260001_h0_m03_actor_session_access.sql`,
`crm_f2.verify` checks expiry at lines 133–141, before returning claims.
`crm_api.establish_session` verifies at line 219, waits for the actor lock at
lines 225–226, then checks actor state and inserts session/epoch at lines
230–236 without rechecking expiry. The TOCTOU interval is the lock wait.
The published F01 fix only replaces the global-revocation path; it does not
replace establishment. No other function is labeled defective without its
own reproduction, and no additional search/testing continued after F02.

Command executed once in this run:

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h0-006.test.ts
```

Observed: exit **1**; **2 tests, 1 PASS, 1 FAIL, 0 skipped, 0 cancelled,
0 todo**; total 32.498 s. F02 took 31.196 s including setup/cleanup.
Sanitized diagnostic:

```json
{"initialValidControl":true,"initialExpiredControlDenied":true,"sawLockWait":true,"releasedAfterExpiry":true,"accepted":true,"code":null,"sessions":1,"created_after_expiry":true,"coreAllowed":true}
```

No full install/audit/typecheck/lint/unit/build/general PostgreSQL regression
was run after this material result: the authorized fail-fast rule takes
precedence. Historical passing regressions above are not results of this run.
Applying the chain successfully for the fixtures is only setup evidence, not
the full V-MIG upgrade/failure/ACL protocol. No V-DOM/V-DAT/V-MIG blanket PASS.

Final scope: only this evidence and the independent H0-006 test are modified.
The original F01 normative assertion is retained; two assertions strengthen
its valid-session control. The new failing reproduction is preserved, not
weakened to accept the defect. Production code, migrations, normative sources,
Tasks/status coordination and Last Approved Commit remain unchanged. No
commit or push. Both ephemeral clusters are stopped and removed by teardown;
no fixtures, keys or logs remain. Supabase Staging was not contacted or changed.
PLAN-AUTH-002/006 remain PENDING globally; hosted H0-M03, real Auth/MFA,
H0-011 and later tasks remain unstarted. Next action requires separate human
authorization to correct F02, then a new complete independent reverification.

Final read-only checks: `git diff --check` PASS; original evidence prefix and
F01 normative assertion preserved byte-for-byte; only the two authorized
files changed; zero matching ephemeral directories/PostgreSQL processes left.
Changed-file scan found zero PAT/API-secret/JWT/private-key/SCRAM/credentialed
connection-string patterns, complemented by diff review of in-memory random
test keys (no real credentials). Main and origin remote remain correct;
HEAD = origin/main = `b73ca9d0f8e93034edfd8f9e9e85601917d69009`.
Working tree is intentionally dirty with the uncommitted failed evidence/test.

## H0-006-F02 — correction implemented / pending formal reverification

Date: 2026-09-27. Historical failure published separately in `c8238c8`
(`test(h0): record f2 expiry race failure`) from the clean required base
`b73ca9d0f8e93034edfd8f9e9e85601917d69009`. This section describes the
subsequent, **local implementation correction**, not a new formal H0-006
reverification. The earlier F01 FAILED evidence, F01 correction, and second
FAILED F02 evidence above remain unchanged as historical records. D037/D038 and
Last Approved Commit `6248820e3253a9d88755ed0a4996fff8f865690e` remain
unchanged. Supabase Staging was not contacted or modified.

Root cause: `crm_f2.verify` used `clock_timestamp` and enforced the signed
30-second window at entry. Several F2 functions could then wait for PostgreSQL
locks without checking expiry again before material work. The original
`establish_session` race committed a new session and epoch after the capability
expired. Source review of the seven named paths found the same relevant gap
in reidentification, one-revoke, and admission. The F01-corrected global
revocation already had a post-lock clock comparison; it now uses the common
complete verifier while preserving F01 live-session/epoch checks. The two
human Core wrappers also needed a final F2 check: the delegated F1 operation
can wait after F2 admission. No F1 defect was proved; F1 implementation,
protocol and key are untouched.

Forward migration:
`202609260003_h0_m03_f2_expiry_revalidation_fix.sql`. It replaces only the
seven existing function bodies with unchanged signatures, owner, SECURITY
DEFINER mode, fixed search paths and EXECUTE ACLs. No new signing function,
helper, role, table, key, or runtime grant is added. The migration briefly
grants CREATE to the existing NOLOGIN F2 executor to replace its functions,
then revokes it before COMMIT. Runtime cannot apply it. The three published
H0-M03/F01 migrations remain byte-for-byte intact.

Every affected operation retains **initial** `crm_f2.verify` for fast MAC,
protocol, binding, target, signed input and window rejection. After the actor
or actor→session→epoch locks and live-state checks, it calls the same verifier
again. That verifier obtains a fresh `clock_timestamp()` after the wait;
`transaction_timestamp`, `now()` and `CURRENT_TIMESTAMP` are not used for
post-wait freshness. A final call before function return aborts the entire
transaction if a later DML/table lock, F1 delegated call, key change or Core
access consumed the rest of the F2 window. The signed 30-second window is
unchanged. For human Core wrappers, F2 is checked after F1 verification just
before delegated access and once more after that access; a late failure rolls
back human activity, F1 technical consumption and Core effects together.
The function's completed authorization may still commit afterward under
D038.15 while it holds the admitted locks; this correction never claims
retroactive cancellation after valid admission and completed SQL work.

| Cause-bound case | Expected | Observed in PostgreSQL 17.11 | Result |
|---|---|---|---|
| Original F02 establish: actor lock held >30s | `42501`, no session/epoch | `42501`; sessions 0, epochs 0 | PASS |
| Reidentify: F2 expires waiting actor lock | Old epoch remains current; no new epoch | `42501`, no replacement; old epoch current | PASS |
| Revoke one: same wait | No `revoked_at` | `42501`, `revoked_at` null | PASS |
| Revoke all: same wait | Generation unchanged; F01 live authority intact | `42501`, generation unchanged | PASS |
| `crm_f2.admit` via C01/C03: same wait | No activity or Core effect | Both `42501`; activity unchanged, no probe | PASS |
| Short actor-lock wait within window | Authorized establish succeeds | Real observed wait, session + epoch committed | PASS |
| Session INSERT blocked **after** actor admission until F2 expires | Entire establishment rolls back | Relation wait observed; `42501`, session/epoch 0 | PASS |
| C01 delegated Core table wait; F2 expires, F1 remains valid | No returned Core data; activity unchanged | `42501`; activity unchanged | PASS |
| C03 delegated Core table wait; F2 expires, F1 remains valid | No Core/consumption/activity partial state | `42501`; probe absent, consumption/activity unchanged | PASS |
| F2 initially expired / not-before invalid | Initial verifier rejects, no wait-to-valid retry | Original expired control `42501`; initial verifier unchanged | PASS for expired control; not-before covered by existing F2 implementation tests |

The six actor-lock cases share one 30-second real-clock interval and six
independent runtime transactions/connections; `pg_blocking_pids` confirms all
waited. The original independent F02 test retains its **full** 30-second wait
and normative expected denial. A separate INSERT lock test forces a second
wait after the actor lock and post-lock check. C01/C03 each wait 30 seconds
inside delegated Core access; F1 is deliberately issued three seconds after
F2, and PostgreSQL confirms F2 expired while F1 remained valid. No test
shortens the protocol, mocks the clock or changes F1. The C03 final check
denies before a durable effect; PostgreSQL rollback removes prior in-unit
writes. All test clusters, Unix sockets and synthetic keys are disposable.

V-MIG: a fresh database in a local 17.11 cluster applies M01 context → F1 →
M02 → M03 → F01 → F02. The main test database independently applies the whole
chain from the published migration sequence. On the F01 predecessor, an
injected failure after the first F02 function replacement restores all seven
predecessor definitions and preserves a synthetic actor fixture. Ordinary
runtime cannot apply F02. Authorized upgrade succeeds and preserves the
fixture; reapplication leaves definitions and ACLs unchanged. Catalog checks
show all seven functions still owned by `crm_h0_f2_executor`, SECURITY
DEFINER, with fixed `pg_catalog, pg_temp` search_path and no PUBLIC EXECUTE;
the internal `crm_f2.admit` is not runtime-callable. The executor has no
persistent CREATE on `crm_api` or `crm_f2`. Historical migrations were not
edited. This is local V-MIG implementation evidence, not hosted H0-M03.

Regression commands and observed results after the corrective migration:

| Command | Observed |
|---|---|
| `pnpm install --frozen-lockfile` | PASS; lockfile unchanged |
| `pnpm audit --prod` | PASS; no known vulnerabilities |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS; import boundaries |
| `pnpm test` | 27/27 PASS, 0 skipped |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | 127/127 PASS, 0 skipped |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |

The complete PostgreSQL suite includes the original F01 regression and the
unweakened F02 discovery regression, the six concurrent expiry cases, short
wait positive control, post-admission INSERT wait, post-F1 C01/C03 waits,
V-MIG and earlier F1/F2 security tests. These are **correction/engineering
regressions only**. They do not execute the full independent R01–R24
H0-006 matrix; its unfinished rows above are not promoted to PASS.

Final status of this corrective block: H0-006-F02 **FIX IMPLEMENTED / PENDING
FORMAL REVERIFICATION**. H0-006-F01 remains **FIX IMPLEMENTED / PENDING FORMAL
REVERIFICATION**; TSK-H0-006 remains **FAILED / NOT COMPLETED**. PLAN-AUTH-002
and PLAN-AUTH-006 remain PENDING globally. Real Auth/MFA, hosted H0-M03,
Staging application, Production, H0-011 and later tasks remain unexecuted.
The next step is a separately authorized complete independent H0-006
reverification from the new implementation commit.

## Third complete formal execution — normative matrix fixed before testing

Base under review: `32a56221bb868a8463af13f71fa1f74e764085ef`,
PostgreSQL 17 local only. This is a **new execution**, not a reinterpretation of
either historical FAILED run. F01 and F02 start as FIX IMPLEMENTED / PENDING
FORMAL REVERIFICATION. The following expected outcomes were fixed from D038,
D037, D015/D025/D026/D027/D031/D032, Tasks H0-005/006 §§2.2–2.3/6–7,
Plan §§6.1/6.3–6.5 and C01/C03, SPEC-FR-SEC-001/002/004, AC-064/080, E1,
ARCH-DEC-004 and G1 **before inspecting implementation or running tests**.
Real Auth, recovery delivery, devices and hosted H0-M03 remain outside this
local fixture; their global PLAN-AUTH gates do not become PASS from doubles.

| ID / normative requirement | Threat and synthetic setup | Exact expected outcome | Required evidence |
|---|---|---|---|
| R01 / D038.15–16, D025 | A/B valid; revoke A; stale A invokes revoke-all; B invokes it later | A Core and revoke-all deny without generation change; B remains allowed, then B increments generation exactly once and prior authority denies | Real commits, generation/session/Core observations |
| R02 / D038.3/.13/.15 | Pre-issue F2 or read lookup before concurrent revoke/disable | First committed revocation wins; stale request denies without activity/effect; first authorized lock holder may finish | Two connections and lock-order observations |
| R03 / D038.3/.7 | Enumerate generic and revoke-all lookup with unknown, wrong-subject, revoked, stale, old-epoch, disabled and expired records | Metadata is minimal; lookup grants no authority; revoke-all preparation requires live initiating authority | Returned columns, denials and subsequent Core attempt |
| R04 / D038.2–3, SEC-001/002, G1 | M1 forged nested claims; M2 runtime SQL with known IDs/scopes | Neither creates/changes actor, mapping, session, epoch, MFA, activity or generation; no key/sign/role escalation | Server rejection, SQLSTATE and before/after catalog/rows |
| R05 / D038.1/.6/.14 | Substitute F1/F2 MAC, key, domain, target, scope or shared input | Each mismatch denies; F1 technical authority never becomes human F2 or vice versa | Distinct negative calls with zero effect |
| R06 / D038.4/.6 | Independent F2 codec and 25 signed fields; malformed lengths, order, encoding, MAC and material input | Exact canonical bytes agree; any alteration/unknown/omission denies | Independent encoding and mutation table |
| R07 / D038.5–6 | Reuse F2 across xid, backend, DB/audience, session/scope/action or after 30 s | Every mismatch/expired capability denies; no authority persists | PostgreSQL binding values and before/after state |
| R08 / D038.2/.5, Plan 6.5 | Set plain GUC; reuse connection after commit/rollback/error | No authority from GUC or previous request | Pool max:1 sequential transactions and SQL denial |
| R09 / D038.6/.19 | Runtime reads/signs K, malformed key id, revoked key, short MAC, comparator oracle | Exact key/no fallback; inaccessible signing/key store; full 32-byte blinded comparison fails closed | Catalog grants and negative calls without secret output |
| R10 / D015, D038.8 | Attempt second admin, duplicate subject, mapping change, disable/enable, generation decrease | One operational admin; runtime cannot mutate mapping or decrease generation; old authority stays invalid | Constraints, grants and state/generation observations |
| R11 / D038.9–10 | Unknown/wrong session or subject, absent/historical/stale/incoherent epoch | Core denies; exactly one current epoch per session; history remains, direct mutation denied | Row constraints and negative access attempts |
| R12 / D038.3/.12/.17 | Unverified/password-only/MFA-only Auth and forged human interaction | Establish/reidentify/activity deny unless full server-verified identification/classified interaction | Server-boundary calls and unchanged rows |
| R13 / D025/026, D038.11 | Set 7/30-day elapsed instants just before/at/after bounds, including timezone shift | Strict `<` at both limits; no civil-day/DST shortcut, no automatic renewal | DB clock/row timestamps and access results |
| R14 / D038.13, Plan 6.3 | Arrive at expired/revoked/disabled/incomplete state and try activity update | Deny before update; prior activity unchanged | Before/after timestamp and Core denial |
| R15 / D026, D038.9–10/.17 | Two devices; activity on A; B idle; full reidentify B | A cannot extend B; B needs password+MFA; new epoch, old remains historical/invalid | Per-session timestamps/epochs and Core decisions |
| R16 / D038.15–16 | Revoke one/all, stale initiating session, generation overflow, repeated/cross-session operation | Only signed target changes; stale initiator denies; generation monotonic and overflow closed | Exact rows/generation before/after and Core access |
| R17 / D038.8/.15 | Disable then enable actor while old session/capability survives | Disable denies Core; enable does not restore old generation/session authority | Separate committed transactions and old/new access |
| R18 / D038.15 | Lock actor/session/epoch during authorize, revoke, disable and F2 expiry | Coherent lock order; prior committed revocation wins; expired F2 after wait denies without effect; short wait may pass | Real blocked PIDs, post-lock clock and row state |
| R19 / D038.14, C01/C03 | Inject failure between admission, activity and Core read/write; retry after rollback | Admission and Core one DB unit; no partial activity, consumption, probe or result | Fault points, rollback and row counts |
| R20 / D038.1/.14, C01/C03 | Present only F1, only F2, mismatched scope/input, then matching pair | Only exact live pair reaches minimal C01 or atomic C03 | Function calls, projections and denied mutations |
| R21 / D038.19, D037.11, V-DAT | Runtime/generic/PUBLIC direct SQL; SET ROLE, shadow/temp, RLS/SD access | No Core DML/key access/privileged role; fixed path, owners and FORCE RLS effective | PostgreSQL catalog and active SQL attacks |
| R22 / Tasks V-MIG | Empty chain and F01 predecessor upgrade; fixture, wrong migrator, injected failure, reapply | Same valid schema/ACL; fixture preserved; runtime denied; failure atomic; reapply safe | Catalog/fixture comparisons on real PostgreSQL |
| R23 / E1, D037.10, D038.2/.16 | Lost response after real commit; retry stale authority; canary in failure | Prior revocation remains effective; no fabricated success/secret leakage; error class is denial | Two transactions, SQLSTATE and sanitized outputs |
| R24 / Tasks §2.3 | Full local engineering regression after independent controls | Install, audit, types, lint, unit, PostgreSQL and build pass with zero skipped | Command/exit/test counts and diff check |

Execution remains fail-fast: the first **new material** failure becomes F03,
with only its reproduction/evidence committed; no product repair is authorized.

### Third execution — observed V-EVI (2026-09-27)

**Task/base/environment:** TSK-H0-006, starting commit
`32a56221bb868a8463af13f71fa1f74e764085ef`, main, local Mac,
PostgreSQL 17.11 (Postgres.app) on disposable Unix-socket clusters, Node
24.21.0, pnpm 11.19.0. Only synthetic actor, subject, scope, probe and random
ephemeral F1/F2 keys were used. No connection to Supabase Staging was made.
This third-stage evidence is published separately from its tested base commit;
the containing Git commit is the publication identity.
The new independent cases are in
`tests/integration/postgres-h0-006.test.ts`; the H0-005 implementation suite
was used only as an additional engineering regression, never as the normative
oracle. Expected outcomes remain the source-derived matrix above. Every case
below ran against real PostgreSQL, except server-boundary negatives that are
explicitly identified as local synthetic Auth/interaction checks.

| ID | Observed against the expected outcome above | Result |
|---|---|---|
| R01 | Historical F01 attack retained: revoked A denied Core and revoke-all; generation unchanged and B still read; B then advanced generation by one and old authority denied. | PASS |
| R02 | Pre-issued F2 lost to a separately committed revoke-one; subsequent Core denied, with no activity revival. | PASS |
| R03 | Generic lookup returned only four metadata columns; unknown/wrong subject did not confer authority. Revoke-all lookup returned no authority for unknown, wrong subject, revoked, stale generation, old epoch, disabled, 7-day or 30-day expired rows. | PASS |
| R04 | Branded server Auth rejected forged/nested/array/prototype-shaped client claims. Real runtime SQL received `42501` for actor/session/epoch DML, mapping/enable helpers, key SELECT and privileged `SET ROLE`; no actor/session count changed. Generic role denied lookup. | PASS |
| R05 | A matching F2/F1 pair allowed C01; altered F2 or F1 MAC, scope, operation, input, or either missing capability returned `42501`. | PASS |
| R06 | Independent length-prefix F2 fixture signed all 25 fields; changing each field separately, malformed framing and oversized payload returned `42501`; no producer F2 codec supplied expected bytes. | PASS |
| R07 | A signed F2 used in another transaction or backend was rejected; signed not-before in the future was rejected. The unmodified original expiry regression denied after the real 30-second window. | PASS |
| R08 | Plain identity/scope GUCs did not permit direct Core read or unsigned function use; max-one connection lost local GUC state after commit, explicit rollback and SQL error. | PASS |
| R09 | F1/F2 keys differed; runtime/executor could not read F2 key or invoke verifier, exact unknown/revoked key and 31-byte MAC denied. Independently provisioned replacement key allowed its own valid capability, then denied after revocation; no fallback. | PASS |
| R10 | Migration mapping refused a second operational admin; runtime could not change the subject/actor mapping or generation. Actor count remained one. | PASS |
| R11 | Wrong Auth subject, unknown session and noncurrent/wrong epoch denied Core; historical epoch remained stored but unusable; runtime could not edit it. | PASS |
| R12 | Unverified and client-shaped Auth, password-only, MFA-only, unclassified interaction, refresh, polling, background and passive events denied; failed access left activity unchanged. These are synthetic verifier/classifier boundaries, not Supabase Auth proof. | PASS in local scope |
| R13 | `within_limit` returned true one microsecond before 7/30 days and false exactly at both limits; DST-crossing UTC elapsed-time case passed. Real Core denial at the expired limits and positive pre-boundary case were observed. | PASS |
| R14 | Expired, disabled and incomplete states denied before changing last activity. | PASS |
| R15 | Reading on device A left B's epoch activity unchanged. Full reidentification of B made a new current epoch, retained the old closed row and denied a newly signed claim for the old epoch. | PASS |
| R16 | Revoke-one denied only A while B remained authorized. B's revoke-all incremented generation once and denied its old Core authority; maximum bigint generation denied without wraparound or mutation. Original F01 case also passed. | PASS |
| R17 | Disable incremented generation and denied Core; enable did not restore old session authority. Enrollment, recovery and reidentification-required states denied Core and revoke-all preparation. | PASS |
| R18 | Six independently issued operations waited on a real actor lock with initially valid 30-second F2; after `clock_timestamp > expires_at`, all denied `42501` with no session, epoch, revocation, generation, activity or Core mutation. Separate C01 waits on session and epoch locks also expired and denied; a 200-ms real actor wait while valid succeeded. The original F02 reproduction stayed unchanged and passed. | PASS |
| R19 | Bad F1 after F2 admission rolled back C03 activity, consumption and probe, and separately rolled back C01 activity. Matching C03 committed both Core probe and activity. | PASS |
| R20 | Exact live F2+F1 enabled minimal C01 projection and C03; either absent or mismatched authority denied. Private column was absent from returned C01 row. | PASS |
| R21 | Catalog showed runtime LOGIN without superuser/BYPASSRLS/CREATEROLE/CREATEDB, split NOLOGIN F2 owners, FORCE RLS, fixed `pg_catalog, pg_temp` SECURITY DEFINER search path and no PUBLIC EXECUTE. Runtime direct DML and role assumption denied; a hostile temporary `verify` shadow and hostile search path did not bypass an invalid MAC. | PASS |
| R22 | Independent fresh PostgreSQL 17 cluster applied M01→F1→M02→M03→F01 predecessor, kept a synthetic actor fixture, injected a mid-F02 migration error and observed predecessor definition intact. Runtime migration denied; migration authority applied F02; reapplication kept the function definition and fixture. Main independent cluster applied full historical chain from empty. | PASS |
| R23 | Revoke-all committed before its caller intentionally discarded the response; old Core/replayed capability denied and generation remained incremented exactly once. Synthetic canary did not appear in the public adapter error. This is a caller-side loss **after** real COMMIT, not proof of a network cut. | PASS in local scope |
| R24 | Frozen install, production audit, typecheck, boundary lint, unit tests, PostgreSQL integration and Next build all exited 0; counts below. | PASS |

**E1 boundary:** The F2 guard cases above returned PostgreSQL `42501` and
sanitized server-facing `F2_*_DENIED`, with unchanged protected state. This
accredits E1's *deny/no-effect* behavior for this technical component. H0-005
does not expose a business application endpoint returning a structured
`SemanticIssue`; end-to-end presentation of E1's affected scope and next step
is not claimed here and remains an application-integration obligation. The
unit result-contract regression separately keeps E1 distinct from E2–E8.

**F01/F02 historical preservation and current disposition:** The earlier first
FAILED run (F01), its reproduction and correction, the second FAILED run
(F02), its reproduction and correction remain in prior sections unchanged.
This third, complete independent execution adds a new local PASS stage. No
H0-006-F03 was observed. H0-006-F01 and H0-006-F02 are **CLOSED in the local
formal-verification scope**; TSK-H0-006 is **COMPLETED in its local verification
scope**. Neither statement accredits hosted H0-M03, real Supabase Auth/TOTP,
recovery, device/browser sessions or Production.

| Command / control | Expected | Observed |
|---|---|---|
| `pnpm install --frozen-lockfile` | Lock unchanged, exit 0 | PASS; already up to date |
| `pnpm audit --prod` | No known production vulnerability | PASS; none found |
| `pnpm run typecheck` | Exit 0 | PASS |
| `pnpm run lint` | Import boundaries PASS | PASS |
| `pnpm test` | All pass, none skipped | 27/27 PASS, 0 skipped |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | All pass, none skipped | 151/151 PASS, 0 skipped; includes historical F01/F02, new independent R01–R23 and prior engineering suites |
| `pnpm run build` | Exit 0 | PASS; Next.js 16.3.5 |

**Limitations / unaccredited capabilities:** All human Auth proofs and
interactions are synthetic server-side fixtures. No real login, password,
TOTP, Supabase Auth session, iPhone/Mac/iPad, recovery delivery or browser
behavior was tested. Local Unix-socket PostgreSQL is not hosted H0-M03.
PLAN-AUTH-002 and PLAN-AUTH-006 remain PENDING globally; the separately
validated hosted database/F1 subset is unchanged. Staging was untouched.
No F1/D037/D038, product code or migration was modified in this verification.
