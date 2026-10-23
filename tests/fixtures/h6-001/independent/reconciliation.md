# Reconciliación de 46 fallos originales

El bruto conserva FAIL 2.899/2.945. Cada fallo tiene sucesor PASS; no hubo ejecución completa limpia posterior. No se suman repeticiones. Los filtros contaron solo los 34 títulos seleccionados, con 0 skips; el resto conserva su observación original.

| ID | Caso original | Causa | Sucesor PASS |
|---|---|---|---|
| AF001 | W50 official advisors56 loopback only — `tests/integration/h5017c-preservation-postgres-h5-008-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:93` |
| AF002 | W53 W54 W56 expected45 rows56 cases, all56 published migration bytes, F10/F12 unchanged and scoped synthetic product — `tests/integration/h5017c-preservation-postgres-h5-008-migration.test.ts` | PRE_INHERITED_BYTE_BASELINE | `compatibility-03/stdout.log.gz:26` |
| AF003 | H4-018 D19 fresh48 official advisors complete stdout stderr status signal error only loopback — `tests/integration/h5017c-preservation-postgres-h4-018-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:34` |
| AF004 | A12 official advisors on current49 loopback full stdout/stderr/status — `tests/integration/h5017c-preservation-postgres-h4-019-f06.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:36` |
| AF005 | J22 official advisors fresh48 exclusively loopback complete capture — `tests/integration/h5017c-preservation-postgres-h4-019-preservation.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:45` |
| AF006 | F23 C16/C18/C20 fresh51 authority privacy and official advisors exclusively loopback — `tests/integration/h5017c-preservation-postgres-h4-021-f23-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:52` |
| AF007 | H4-021 B67 advisors official exclusively loopback on current preparation chain — `tests/integration/h5017c-preservation-postgres-h4-021-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:59` |
| AF008 | H4-023 fresh52 RLS ACL private helpers privacy foreign references F1 F2 session epoch HA exclusive and loopback advisors — `tests/integration/h5017c-preservation-postgres-h4-023-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:88` |
| AF009 | H5-AAC official advisors fresh 54 loopback — `tests/integration/h5017c-preservation-postgres-h5-004-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:89` |
| AF010 | H5-AQ/AZ/AAD expected base inventory old product D027 health and 53 migrations preserved — `tests/integration/h5017c-preservation-postgres-h5-004-migration.test.ts` | PRE_INHERITED_BYTE_BASELINE | `compatibility-02/stdout.log.gz:90` |
| AF011 | H5-CAS official advisors55 exclusively loopback — `tests/integration/h5017c-preservation-postgres-h5-006-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:91` |
| AF012 | H5-CAR/CAN/CAM/CAO/CAP/CAZ/CBD/CBE exact expected33 rows57 cases and historic product bytes — `tests/integration/h5017c-preservation-postgres-h5-006-migration.test.ts` | PRE_INHERITED_BYTE_BASELINE | `compatibility-02/stdout.log.gz:92` |
| AF013 | H4-024 preserved product migrations historical verifiers sources expected and health — `tests/integration/h5017d-dependency-postgres-h4-024.test.ts` | PRE_INHERITED_BYTE_BASELINE | `compatibility-02/stdout.log.gz:95` |
| AF014 | H4-006 F12 later external fact cannot retroactively cover earlier action — `tests/integration/postgres-h4-006-scope-reproducer.test.ts` | EXPIRED_RELATIVE_TIME_FIXTURE | `compatibility-02/stdout.log.gz:96` |
| AF015 | H4-008 loopback security advisors for complete fresh41 — `tests/integration/postgres-h4-008-supplement.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:104` |
| AF016 | H4-010 R27 fresh42 advisors complete stdout stderr and exit loopback only — `tests/integration/postgres-h4-010-supplement.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:113` |
| AF017 | H4-012-F16 C16 fresh44 official advisors all complete streams status error signal loopback — `tests/integration/postgres-h4-012-f16.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:122` |
| AF018 | H4-012 R18 fresh43 advisors full stdout stderr status signal loopback only — `tests/integration/postgres-h4-012-supplement.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:131` |
| AF019 | H4-014 C31 fresh45 official advisors complete stdout stderr status signal error only loopback — `tests/integration/postgres-h4-014-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:140` |
| AF020 | F23 C12 fresh47 official advisors complete stdout stderr status signal error only loopback — `tests/integration/postgres-h4-016-f23-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:149` |
| AF021 | H4-016 R30 fresh46 official advisors complete stdout stderr status signal error only loopback — `tests/integration/postgres-h4-016-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:158` |
| AF022 | H5-R02 official Supabase advisors on fresh 53 isolated migrations — `tests/integration/postgres-h5-002-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:159` |
| AF023 | H5-011 A08 V-DAT: least privilege, authenticated guards, RLS and advisors on the new read function — `tests/integration/postgres-h5-011-coverage.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:161` |
| AF024 | H5-012-F01 security: migrated59 ACL, function authority, current-night view and official advisors — `tests/integration/postgres-h5-012-f01-security.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:163` |
| AF025 | H5-012-final60 security: migrated60 ACL, function authority, current-night view and official advisors — `tests/integration/postgres-h5-012-final-security.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:165` |
| AF026 | H5-012-candidate61 security: migrated61 ACL, function authority, current-night view and official advisors — `tests/integration/postgres-h5-012-security61.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:167` |
| AF027 | H5-013 N12 V-MIG: populated61 rollback/retry, existing catalogue and data, security/advisors — `tests/integration/postgres-h5-013-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:169` |
| AF028 | H5-015 J09/J10 populated62 upgrade, rollback, retry, ACL/FORCE RLS and original records — `tests/integration/postgres-h5-015-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:173` |
| AF029 | C12 populated64 rollback65 retry preserves every row and only replaces the two declared bodies — `tests/integration/postgres-h5-017-c-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:175` |
| AF030 | D08 populated65 rollback66 retry preserves all rows policies constraints ACL and only replaces diagnostic_nodes — `tests/integration/postgres-h5-017-d-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:177` |
| AF031 | E-M01 independent catalog, populated upgrade, aborted DDL, function recovery and exact effective privileges — `tests/integration/postgres-h5-017-e-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:182` |
| AF032 | F-MIG independent populated67 catalog data aborted upgrade restore retry and privileges — `tests/integration/postgres-h5-017-f-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:184` |
| AF033 | F-R01 exact replay conflicts and concurrent duplicates operation — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:27` |
| AF034 | F-R01 exact replay conflicts and concurrent duplicates execution — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:29` |
| AF035 | F-R01 exact replay conflicts and concurrent duplicates both — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:31` |
| AF036 | F-R01 exact replay conflicts and concurrent duplicates none — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:33` |
| AF037 | F-R02 historical replay reauthorizes sessions and requires the original actor — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:34` |
| AF038 | F-R03 late canonical ownership cannot turn stored intent into authorized replay true — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:35` |
| AF039 | F-R03 late canonical ownership cannot turn stored intent into authorized replay false — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:36` |
| AF040 | F-R04 historical replay checks current source authorization operation — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:37` |
| AF041 | F-R04 historical replay checks current source authorization execution — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:38` |
| AF042 | F-R04 historical replay checks current source authorization event — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:39` |
| AF043 | F-R05 revision while waiting for observation identity rechecks write versus replay false — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:41` |
| AF044 | F-R05 revision while waiting for observation identity rechecks write versus replay true — `tests/integration/postgres-h5-017-f-replay.test.ts` | FIXED_PORT_COLLISION | `freplay-isolated-01/stdout.log.gz:43` |
| AF045 | H5-017 D07 populated63 upgrade rollback retry historical rows functions owners ACL preserved — `tests/integration/postgres-h5-017-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:188` |
| AF046 | Q06 independent populated66 catalog data aborted upgrade restore retry and privileges — `tests/integration/postgres-h5-018-fourth-migration.test.ts` | CLI_OUTPUT_FORMAT | `compatibility-02/stdout.log.gz:190` |
