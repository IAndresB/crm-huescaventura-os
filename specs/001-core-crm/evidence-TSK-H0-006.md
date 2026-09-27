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
