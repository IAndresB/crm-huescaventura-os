# Correctivo H5-005/006-F12 — cadena histórica de preservación

Autorización humana expresa de 2026-10-08, exclusiva H5-005/006. Preflight: HEAD `daa3a7faf9dbe6668a934ffee2550749c0a357a7`, origin/main `b14396627cbadfc4a99dd3b158b47c3562d3f08f`, rama main, árbol limpio, divergencia 9/0. Expected independiente intacto: 22.889 bytes, SHA256 `ff777aa0a490e0293f9a12a462fcbab389253edbd2925c1a1e2bdf2ac5f092a4`.

SHA correctivo: `201dada023c6dc878928a28f296e00781cd3876d`. Todos los gates técnicos y auditor final documental reejecutados PASS. Este documento no reutiliza pruebas anteriores.

## Diagnóstico previo a la modificación

Las cuatro aserciones fallidas eran C19 de postgres-h4-021-f23-migration.test.ts:21, B68 de postgres-h4-021-migration.test.ts:13, la preservación de postgres-h4-023-migration.test.ts:16 y la de postgres-h4-024.test.ts:42. Comparaban hashes actuales con snapshots históricos anteriores a F10. C19/B68/H4-023 difieren en dos dependencias cada uno; H4-024 difiere en dos dependencias y tres verificadores adaptados durante F10: once aristas discrepantes. Los cuatro FAIL originales sobre `9be76f010f27f35e20dd806aafbd6f57f69b9a17` siguen recuperables, sin relabelar ni sustituir por retests.

[Diagnóstico congelado antes de editar](../../tests/fixtures/h5-006/f12/diagnosis-before-change.json), [originales y hashes](../../tests/fixtures/h5-006/f12/originals.json), [FAIL original](../../tests/fixtures/h5-006/f10/f12/postgres-original.log).

El inventario completo de código y manifiestos identifica siete verificadores activos implicados: tres adaptados en F10 y cuatro en F12. H4-024 protege seis de ellos; no se protege a sí mismo mediante su snapshot histórico. El nuevo control explícito verifica los siete, incluido H4-024. No se encontró otra guarda activa de esta cadena en el runner actual. El auditor `tests/support/h4-exit-audit.py` pertenece exclusivamente al cierre histórico H4-024: exige 52 migraciones, 2321 pruebas PostgreSQL, 138 unitarias y ausencia de producto desde cfa635f8. Está preservado; no se adapta ni se acredita su ejecución como auditor de H5. El auditor vigente de H5 es scripts/verify-h5-006-evidence.mjs.

## Corrección individual

| Verificador | Cambio mínimo | Garantías conservadas |
|---|---|---|
| H4-021-F23 C19 | Antes de su bucle, verifica los siete archivos actuales y cuatro snapshots exactos; el bucle aplica hash histórico/actual autorizado. | Las 67 entradas siguen presentes; expected F23 sigue comparado con Git bea40374; ninguna guarda funcional cambia. |
| H4-021 B68 | Mismo control de cadena y comparación estricta por entrada. | Las 183 entradas siguen presentes; las tres exclusiones documentales de coordinación ya existentes no se amplían; expected original sigue comparado con Git 33c8666. |
| H4-023 | Mismo control de cadena y comparación estricta por entrada. | Las 89 entradas siguen presentes; expected sigue comparado con Git 408a7f7; V-MIG, catálogo, RLS y advisors intactos. |
| H4-024 | Reconoce explícitamente los seis verificadores históricos protegidos en sus versiones autorizadas y verifica también su propio hash actual. | Las 464 entradas y 246 correspondencias normativas permanecen; no hay excepción general para pruebas. |

Solo se modifican estos cuatro archivos de prueba y tests/support/h5-006-dependency-preservation.ts. Los tres verificadores F10 permanecen byte exactos respecto al preflight F12. Ninguno de los cuatro manifiestos históricos se modifica. Las versiones originales no se reemplazan; sus hashes permanecen fijados y se distinguen de los actuales.

El helper conserva assertHistoricalBytes de F10. La nueva comparación assertHistoricalHash exige simultáneamente el hash histórico original y el hash actual exacto autorizado para las dos dependencias y los siete verificadores. Toda otra entrada sigue exigiendo el hash histórico exacto. assertAuthorizedPreservationChain comprueba las versiones actuales de esos nueve archivos y los cuatro manifiestos. No admite nombres solos, comodines, directorios, hashes descubiertos dinámicamente, switches de entorno ni excepciones por ausencia de diferencias.

## Hashes históricos y actuales exactos

| Archivo | Histórico SHA256 | Actual autorizado SHA256 |
|---|---|---|
| package.json | `28b6223e2a3e8e414eaacc54c2f21cc73f3ceeb041dce1d3b3ebfe10201a1258` | `135c5c52046f92d70fa6c77c9e5fc9014a7e24fa2d6d20867b0e325de490cb3c` |
| pnpm-lock.yaml | `1380c6afde70f15ca12514a9989dd314b462de9cd4e87cfb92274e943083fcdf` | `a97d77d529c30b46f5f6cd100d0ab8e2b8e2393e1365cdd0caad563e29044a15` |
| tests/integration/postgres-h4-018-migration.test.ts | `e7e3d4a55c03c3b658be1a03c6f00eb041ba9f105058a8897c275480c1480495` | `8db373d47c06366158e75e365060b781d2616ccdc7f782421b7000b5ded531b9` |
| tests/integration/postgres-h4-019-preservation.test.ts | `9bc2f609b69600f267182c4b67ee5c5aa7c63fece8d95e922a359fac0631ced2` | `c842a602ad6be7f816fcead6409b4d2c59eee40ff4b5a5b508240e3b587ebb8f` |
| tests/integration/postgres-h4-019-f06.test.ts | `59680d864f05e27255fb72a2e0bc1197c89d5a9adb92544e41b3e22ec1472de2` | `7a8eb711d31209ecbaf75ff8d506aeae1fb1d7c3c4068f804914513fe405db15` |
| tests/integration/postgres-h4-021-f23-migration.test.ts | `48e155536451ace443c07584fe054091894f0c7c7388cbad86042a3b91ed62b2` | `fa89dd436303d54cf8bc258aee272c643faf4845d9d8a90a8089d762fea14640` |
| tests/integration/postgres-h4-021-migration.test.ts | `7e3fbea13c51af0d386eab36ff2aef4496e41edf95f57e7caa9352d02cc915b1` | `0c2f90a03531452a75fe56f1e0a62e9b9d25e85f2b32194dc61f87951b132466` |
| tests/integration/postgres-h4-023-migration.test.ts | `0cfff1dacc0875ba7cbb552acb39f887e7fecfaaf928c46d6fc104fd6307cfd5` | `96df97f6a68e09d66f7a492a1bab2f8f35ec95985422eb17a6f45241d109c230` |
| tests/integration/postgres-h4-024.test.ts | `ada14fe8628b5c0e9edf7854acac96cb2640aaa862a00981efb075200e672f70` | `de4fb78dab89745746fdc210f17149191f14e751b0f56aa07b380a1b1b363d4b` |

Los cuatro snapshots son inmutables; histórico = actual:

| Manifiesto | SHA256 histórico y actual |
|---|---|
| tests/fixtures/h4-021-f23/base-preservation.json | `945db27514ae7ed42d98f24838367ad867c13d06f48f33f88981f747dc721db4` |
| tests/fixtures/h4-021/base-preservation.json | `60ca9ba5685772925a65e58869ecfd3d9314fae2947f86fcc0defe2af9ae5e04` |
| tests/fixtures/h4-023/protected-base.json | `f098ef65f2c91e45adedd13ad272a0066007f8b2f82dd195aa1f8df9210409db` |
| tests/fixtures/h4-024/protected-base.json | `59f2d6566a953ffc599a02d5fce41443af5d2f1db50cd109da97a2b51dfb7363` |

## Contrapruebas y preservación

La fixture chain-counterexamples.mjs escribe, lee y altera copias físicas temporales. Comprueba el estado legítimo Next16.3.8 y las 800 entradas efectivas de los cuatro snapshots; conserva las exclusiones documentales históricas de B68. Rechaza migración histórica, Constitution, expected histórico, expected H5 congelado, health, dependencia instalada fuera de las rutas autorizadas, edición de React dentro del manifiesto, hashes no autorizados de package.json/lockfile, cada uno de los siete verificadores y cada uno de los cuatro manifiestos. También rechaza hashes históricos manipulados y vuelve a ejecutar los negativos F10. Todos esos negativos son esperados y no se cuentan como FAIL de producto ni como tests nuevos PostgreSQL/unitarios.

[Resultados reales sobre el SHA correctivo](../../tests/fixtures/h5-006/definitive/f12-historical-negatives.json). Verifica que los archivos protegidos del árbol real permanecen idénticos antes/después y elimina las copias temporales. [Preservación funcional de 186 archivos](../../tests/fixtures/h5-006/f12/functional-preservation.json): src, las 55 migraciones, operaciones y health, todos los expected y las dependencias exactos respecto al preflight. No se altera ningún contrato funcional, política, permiso ni regla de negocio.

## Límites

Exclusivamente Mac Local, PostgreSQL/Storage aislados loopback y sintéticos. DM-PENDING-005 y pendientes transversales permanecen abiertos. Sin IA/PLAUD/audio/envíos/conectores reales, consentimiento o retención supuestos, scheduler ni Hosted/Production. H5-007/008 y posteriores no se preparan ni ejecutan; H6 NOT STARTED. STOP tras H5-005/006; continuidad exclusivamente a dirección CRM.

## Resultados definitivos sobre 201dada023c6dc878928a28f296e00781cd3876d

| Comprobación | Resultado |
|---|---|
| PostgreSQL |2370+38=2408/2408 PASS;0 FAIL/skipped/cancelled|
| Unitarias |146+4=150/150 PASS|
| Focales H5-005/006 |38/38 PASS, incluidos una vez en2408|
| Health independiente |1/1 PASS, separado|
| Siete verificadores históricos |47/47 PASS, retests incluidos en baseline|
| Contrapruebas F10/F12 |PASS; siete versiones/cuatro snapshots/800 entradas|
| Frozen install/typecheck/lint-import boundaries/build |PASS|
| Audit producción |PASS, cero vulnerabilidades conocidas; Next16.3.8|
| V-MIG fresh55/upgrade54 poblado/rollback/retry |PASS|
| Advisors loopback/RLS-FORCE RLS/concurrencia real/idempotencia/T08 |PASS|
| Diff y auditor final |PASS, diff documental y auditor final ejecutados antes de push|

Ningún test nuevo por F12: baseline2370+38 y146+4 permanecen. Las intercalaciones/negativos/800 entradas/57 casos/33 filas y retests no aumentan esos contadores. F10/F12 técnicamente cerrados tras retest; el auditor documental final pasa y autoriza el cierre local/aislado y push normal. Todos los resultados actuales tienen comando/exit/SHA en sus status. Archivos de ejecución anteriores archivados en f12/pre-corrective y Gitdaa3a7fa; FAIL originales no borrados.
