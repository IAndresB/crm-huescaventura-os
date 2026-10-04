# H4-004 defect chronology

Expected frozen `0b2ec96`, initial verifier `902bad1`, product `570249b`.

| ID | Class | Original FAIL/reproducer | Source/cause | Correction / status |
|---|---|---|---|---|
| H4-004-F01 | Technical verifier | matrix-first.log.gz R02/R09/R13; missing() loop | SM-IN-01/03/05 allow explicit unknown hypothesis/uncertainty and no action; null is not necessarily removed guard | Missing field still rejected, null tested only where invalid. Expected untouched. Retest pending. |
| H4-004-F02 | Technical verifier | matrix-first.log.gz R07 | SM-BK-11, AC-060: other critical Incidents in shared Booking still support joint guard | Assert removal of affected Incident, not all other guards. Retest pending. |
| H4-004-F03 | Technical verifier | matrix-first.log.gz R28 | DM-INV-042: justification belongs to critical active state; previous step changed severity | Replay justification before severity change. Retest pending. |
| H4-004-F04 | Technical verifier | matrix-first.log.gz R31 | V-AT equivalent creation with different operation keys recovers same stable root | Both results may succeed without duplicates; different material/stale still E2. Retest pending. |
| H4-004-F05 | Technical verifier | typecheck-first.log.gz | TS UUID template inferred array too narrow for persisted string ID | Widen comparison array to string[]. Retest pending. |
| H4-004-F06 | Material product | links-first.log.gz; postgres-h4-004-links.test.ts | BR-INC-001, SM-IN-03: incident_links used wrong verified existing column payment_id instead of provider_payment_id; valid link denied | Correct current new migration, previous 38 unchanged. Retest pending. |

Historical H4-002 counter validators bounded to requirementMigration (38 at original boundary), preserving the exact historical expected and count. No former expected changed. Forward migration count checked by current V-MIG (39).

H4-004-F07 — Technical verifier, original retest-1.log.gz (R02 and economic links): invalid command time cannot become B07 evidence time; construct real proof at fixture time. Provider-payment fixture includes two independent Bookings (funds vs invoice); explicit incident scope must use the actual provider-payment Booking/service/client, not the unrelated invoice Booking. Cross-scope links remain rejected. No expected or domain relaxation. Retest pending.

H4-004-F08 — Technical verifier, supplement-first.log.gz/supplement-debug.log.gz: pg_stat_activity is restricted for migration role; use bootstrap observer only for lock inspection. F2 serializes actor/session admission, so both live units can wait on different locks (advisory or transactionid) before domain execution. Observe two runtime sessions blocked inside crm_api, not require both already at incident_apply. Ordinary authority unchanged.

H4-004-F09 — Technical verifier, supplement-first.log.gz/supplement-debug.log.gz: direct helper probe used pre-serialized JSON string with ::jsonb, driver encoded it as JSON string. Use ::text::jsonb for the independent SQL fixture. Product command framing already parses text and does not have this defect. Original FAIL preserved.

Affected matrices retest-2.log.gz 40/40 PASS and supplement-retest.log.gz 7/7 PASS. F01–F09 corrections verified locally; full exact-SHA regression pending before CLOSED declaration. Additional concurrency guards do not change expected.

H4-004-F10 — Technical execution, health-independent.log.gz: omitted mandatory POSTGRES_H0_BIN in first command. No source/test change; explicit approved native PostgreSQL binary supplied in health-independent-retest.log.gz, 1/1 PASS.

## Final closure — 2026-10-05

F01–F10 CLOSED local/isolated on tested `6bbab09d36632b1d9ed7726230fb402c5d4009d2`: 1344/1344 PostgreSQL, 118/118 unit, health independent 1/1; all gates PASS. F06 is the only material product defect; other nine are technical verifier/execution defects. Original pending statuses above describe chronology, not current status. No material defect remains. F06 minimum reproducer deliberately reinstates the former invalid helper in a synthetic isolated database, observes missing-column failure, restores exact definition and verifies the valid economic link. F08/F09 original probes and errors are retained in supplement-first.log.gz and supplement-debug.log.gz. Frozen expected unchanged. See regression-summary.json and log-originals.json for exact SHA/counts/raw hashes.
