# Evidencia — TSK-H5-009/010

**Estado vigente: IN PROGRESS / STOP por F09; sin PASS global ni publicación.** Candidato `8c1109426a8e85effeda6c2bb59c08ac0693c032`: unitarias171/171 y focal ampliada113/113 PASS; PostgreSQL2472/2473 FAIL en H3-R52 por solapamiento no acreditado. F01–F05 CLOSED; F06/F07/F08 controles locales PASS, cierre global pendiente; F09 OPEN. Expected intacto,26 casos/51 normas. Hosted/Production no acreditados.

## Preflight y cadena

- Preflight de continuación: rama `main`; `HEAD=e8b38fa45b0170689784dd3af6ef6cba93e46ae1`; `origin/main=fdbd08bafdc6651d1ad6867242cd71791a25deb6`; ahead/behind 1/0; inventario de los cambios locales coincidió con el trabajo previamente informado. Expected: 24.417 bytes, SHA-256 `b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639`.
- Expected de TSK-H5-009/010 en commit local exclusivo `e8b38fa45b0170689784dd3af6ef6cba93e46ae1`, anterior al producto y sin modificación.
- Commit local de producto: `1c86e695144509fff0254c4d7a076dbb3921f777` (`Implement H5 external event boundary`). El HEAD local es este SHA; no se publicó.
- Cierre documental todavía no committeado. `origin/main` sigue en `fdbd08bafdc6651d1ad6867242cd71791a25deb6`; árbol con archivos documentales/evidencia H5-009/010 pendientes. No se afirma `HEAD = origin/main` ni árbol limpio.

## F02 — discrepancia reconciliada

El expected congelado contiene **26 identificadores únicos de casos**: `P01, P02, P03, P04, P05, P06, P07, P08, N01, N02, N03, N04, N05, N06, N07, N08, N09, N10, N11, N12, N13, N14, N15, N16, N17, N18`. Son 8 positivos y 18 negativos. La fila reportada como caso 27 era el encabezado de la tabla (además del separador Markdown); la referencia a “24 casos” fue un conteo previo incompleto. No hay caso extra, duplicado ni contradicción material. **F02 CLOSED.** No se añadió, quitó, fusionó ni editó ningún caso del expected.

El expected tiene aparte **51 filas normativas literales** de Tasks §6; no son casos:

`SPEC-FR-COORD-008; SPEC-FR-IDEMP-001/003/004; SPEC-FR-CONC-004; SPEC-FR-ERR-002; SPEC-FR-INT-001/002/003/004/005/006; AC-057/066/071/076/077/082; SPEC-NFR-006/008/011/014; DM-INV-048/049; SM-FORB-27/28/33; ARCH-DEC-001/003/005/006/008/009/013; P01/P16/P17; PLAN-DEC-008/009; PLAN-B09; PLAN-C05; PLAN-T09; PT-12; E2E-06; E4/E6; D002/D007/D008/D014/D021.`

La [matriz de trazabilidad](matrix-TSK-H5-009-010.md) asigna los 26 casos y cada una de las 51 filas a su expected, observación y evidencia.

## Defectos y correctivos

- **F01 CLOSED local/aislado:** la guarda W53 anterior comparaba el número global `56`, fallaba al existir migración 57 y no verificaba bytes de la 56. Correctivo limitado al test: toma los 56 nombres/blobs del cierre publicado H5-008 `5e3add4b2c82fc5b0e459b43ea0685393c495840`, exige orden/prefijo y comparación byte/hash exacta, y admite migraciones posteriores. No se editaron migraciones originales, manifest ni snapshots. 56 intactas y 57 válida pasan; alterar #1, intermedia, #55, #56, eliminar una histórica, reemplazarla por comentario, alterar whitespace de #56 o insertar una histórica no autorizada falla como se esperaba. F10/F12 y el verificador previo pasan en copias temporales. Contrapruebas: [result.json](../../tests/fixtures/h5-009/f01/result.json), 12 salidas comprimidas con hashes. FAIL original W53 preservado: 2.235 bytes, SHA-256 `e0fc40862757cdb6cc821cc8efd6c0f4449e7aa8882d8d33eefe4f4d850d8ac4`.
- **F02 CLOSED:** recuento literal y distinción entre header y casos, sin modificar expected.
- **F03 CLOSED local/aislado:** FAIL original focal 9/10: eventos Avaibook que pedían crear/modificar/cancelar quedaban `applied` (tres resultados) y debían entrar a Review. Log: [channel-boundary-original-fail.log.gz](../../tests/fixtures/h5-009/channel-boundary-original-fail.log.gz), 3.182 bytes, SHA-256 `c61fff4777eeebd01f87e700855847f8b14beeecaeebe76f457c56fa2f5cf690`, en base `e8b38fa...`. La migración clasifica Avaibook/calendario/web como Review; el retest muestra cero efectos B08/Booking/factura.
- **F04 CLOSED local/aislado:** el doble trata el reemplazo de referencia externa como dato de procedencia, conserva cada evento raw y enlaza la reentrega con el resultado canónico sin fusionar referencias. Unitario e integración cubren referencia sustituida, historia y autoridad.
- **F05 OPEN / STOP:** auditor `scripts/verify-h5-008-evidence.mjs` falla en línea 27 porque su whitelist del delta desde el SHA probado H5-008 excluye el código, migración y tests nuevos de H5-009. La línea 36 protege también que las tareas H5-009+ permanezcan idénticas al snapshot anterior. No se cambió ninguna de esas guardas. Log: [verify-h5-008-evidence.log](../../tests/fixtures/h5-009/verify-h5-008-evidence.log), 10.865 bytes, SHA-256 `0da057cef8311426a7c18e4192003d1570288f0103c06fbfc7ef4c447ce953be`. Esto bloquea el auditor final y la publicación, aunque las pruebas de producto pasen.

## Observados por caso

Los 26 casos tienen salida `PASS local/aislado` según las pruebas identificadas en la matriz. Coberturas clave: deduplicación canónica; no retroceso por evento antiguo; correlación de eco; conflicto E2 sin sobrescritura; Review por identidad incierta; referencia corregida con historia; S1 aislada de S2; timeout incierto sin reenvío; resultado tardío conciliado; concurrencia real en dos sesiones PostgreSQL; conflicto E2 concurrente; rechazos sin efectos por actor/finalidad/permiso/contexto/cobertura; Avaibook escritura prohibida; calendario en Review; web separada; resultado de canal simulado; rollback T09; preservación histórica; doble incapaz sin proveedor; ACK COMMIT perdido y recuperación durable; y D039/HA/TTE preservados por las regresiones anteriores.

La prueba de ACK COMMIT retenido es `W30 W47` de H5-008 con PostgreSQL real y fallo de cable simulado. La recuperación concilia resultado durable por identidad y no repite el efecto. No implica exactly-once de un proveedor.

## Antecedente de regresión en1c86e69 — previo al correctivo F05

| Gate | Resultado en/para SHA de producto | Evidencia |
|---|---|---|
| Focal conjunta | 14/14 PASS: H5-008 migration 3, H5-009 10, V-MIG H5-009 1. Incluye ambas carreras de dos sesiones y E2. | `focal-final.log`, 2.721 bytes, SHA-256 `f9e0df9311794a6e09841415d6990b72fefe8bc8e96ddbf7353e4ad21d823773`. |
| PostgreSQL completa | 2473/2473 PASS, 0 fail, 0 skipped/cancelled; baseline histórico 2462 + 11 tests nuevos. Duración 398155.630334 ms. | `postgres-full-final.log.gz`, 6.920.965 bytes, SHA-256 `89c8ca9a0af2ff8ea02e37c2d9fdd0308c53ef5890f2f647e9e2c9e7e8584a2d`. |
| Unitarias | 171/171 PASS, 0 skip/fail; baseline 154 + 17. | `unit-final.log`, SHA-256 `f5393d8d54a46b3117ebfa4b2c109172045598ad7ca972d3a5aa73702c63e6af`. |
| Health independiente | 1/1 PASS con PostgreSQL 17.11. Primer intento sin `POSTGRES_H0_BIN` falló precondición y se conserva; retest PASS. | FAIL: `health-independent-missing-postgres-env.fail.log`, SHA-256 `f7a2c056b9a864c77087c47b70f388c3feb69f24a91ccc815bc442efa2ba51e1`. PASS: `health-independent-ret-test.log`, SHA-256 `ef168e5734ee400abd596dc827a207f838bfb17c1daa2f4d2bb806b5d59b42f9`. |
| Frozen install | `pnpm install --frozen-lockfile`: Already up to date; PASS. | Resultado de consola. |
| Typecheck | Primera ejecución detectó tipos incorrectos de fixture; FAIL preservado. Dos retests sucesivos documentan primero un error restante y luego PASS. El PASS es el último `typecheck-final.log`. | FAIL1 `typecheck.log`, SHA-256 `196f5d62d98e6b7d4544203f1c9e315159af0fdcbc53383b581b3661947006a0`; FAIL2 `typecheck-retest.log`, SHA-256 `2e2ad8e44bda4f30bfe8ee41d513312f6a427e1c99b3dd72b9d0fa90cdd93a23`; PASS `typecheck-final.log`, SHA-256 `99d7c2179cdd316467c51f37901025a0753453664d741214ba56fc631fa6c0bc`. |
| Lint/import boundaries | PASS. | `lint.log`, SHA-256 `6eaeae66537f6e78eccf8bc1538038163c02589c1f4bcef2e62b3cc4e58dcc54`. |
| Build | PASS, Next.js 16.3.8. | `build.log.gz`, SHA-256 `de300c33e16b8696f67db33e94f6e4d50541fc2afed4c325ad0641a79c75cc75`. |
| Audit producción | 0 vulnerabilidades; 57 dependencias auditadas. | `audit-production.json`, SHA-256 `11124a8c8cd76328bb93c913c49494fd2f63d7a4193871141c812f5b1cffc655`. |
| V-MIG | Fresh, upgrade poblado 56→57, fallo DDL/rollback íntegro/retry, datos y catálogo previos conservados; RLS/FORCE RLS. PASS. | Test `H5-009 V-MIG fresh delta, populated 56-to-57 upgrade, DDL rollback and retry` en focal y suite completa. |
| Advisors | Supabase `db advisors --type all --fail-on error` loopback sobre 56 migraciones: `results=[]`; PASS. | W50 en `focal-final.log` y regresión completa. |
| Seguridad/concurrencia/T09 | RLS/FORCE RLS, aislamiento actor/contexto/finalidad, dos sesiones independientes, dedup, conflicto concurrente E2, fallo T09/rollback y retry: PASS. | Focal y regresión completos. |
| Preservación histórica | Primeras 56 migraciones conservadas byte a byte, F10/F12 chain y verificadores previos PASS; artifacts históricos H2/H4 reescritos por runner restaurados exactamente. **Auditor final separado falla F05, no modificado.** | F01 matrix; PostgreSQL log; F05 log y SHA arriba. |
| Diff-check/final auditor | `git diff --check` PASS antes de preparar el cierre documental. `verify-h5-008-evidence.mjs` FAIL según F05; no se declara auditor final PASS. | F05. |

## Antecedente del STOP original — estado entonces

- Reutilizado: B07 para eventos/referencias/historial; B08 para operaciones/eco y recuperación H5-007/008; B09 para identidad/recepción. HA/TTE/D039 conservados por controles históricos: no se originó una nueva acción sensible desde evento externo.
- Avaibook no puede crear/modificar/cancelar reservas; calendario externo solo informa/revisión; Web mantiene frontera propia; WhatsApp/correo y demás salidas son dobles. Ningún resultado se describe como envío real.
- Solo datos sintéticos/dobles controlados. No se ejecutaron conectores, webhooks, pagos, envíos, IA, PLAUD ni scheduler reales. No se atribuye capacidad a proveedores.
- H0–H4 y H5-001–008 conservan sus cierres. F01–F04 cerrados localmente; F05 abierto. H5-009/010 quedan IN PROGRESS por la incompatibilidad de preservación pendiente. No se inicia H5-011/012 ni H6.
- Producto commit `1c86e695144509fff0254c4d7a076dbb3921f777` probado en suites locales pero no publicado. Commit documental y push no realizados. Requiere decisión humana expresa para resolver la incompatibilidad del auditor histórico sin debilitar integridad previa.

## Revalidación definitiva tras F05 — 2026-10-09

Cadena: cierre publicado H5-008 `fdbd08b` → expected independiente `e8b38fa` → producto `1c86e69` → candidato auditor `3158161` (sin PASS global) → correctivo definitivamente probado `0dae8a4a0b5ce92845b13fd82c60c1ed931184dc` → cierre documental posterior. Producto y migración57 no cambian durante F05; solo auditor y prueba directa. Expected 24.417 bytes/hash original,26 identificadores P01–P08/N01–N18 y 51 filas normativas permanecen intactos.

Todas las ejecuciones siguientes tienen status JSON con SHA, comando, exit, bytes y SHA256 del log descomprimido. El auditor final valida recuentos, hashes, matriz/casos/normas, F05 y originales del preflight; su fuente íntegra se incluye en su log para reproducibilidad.

| Gate nuevo | Resultado | Bytes log | SHA256 log descomprimido |
|---|---|---|---|
| [audit](../../tests/fixtures/h5-009/revalidation/audit.status.json) | PASS — 0 vulnerabilidades | 277 | `11124a8c8cd76328bb93c913c49494fd2f63d7a4193871141c812f5b1cffc655` |
| [build](../../tests/fixtures/h5-009/revalidation/build.status.json) | PASS — Next.js 16.3.8 | 546 | `53832cfaa0eeae4b276f77a225b5ec11e88e1efd528ca93c99838f08789edeaa` |
| [diff](../../tests/fixtures/h5-009/revalidation/diff.status.json) | PASS — exit0 | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| [f01](../../tests/fixtures/h5-009/revalidation/f01.status.json) | PASS — 12 contrapruebas; PASS/FAIL esperado | 41985 | `40768c154be44721078886510fdb3d6d5a078567d8c5dbfdb7fbb23f504db87e` |
| [f05](../../tests/fixtures/h5-009/revalidation/f05.status.json) | PASS — 18 contrapruebas; PASS/FAIL esperado | 557 | `0a19c977e330ff0d642ae1043af94bb9f1b83408ffa3a0a41cf90f6ad67f421f` |
| [final](../../tests/fixtures/h5-009/revalidation/final.status.json) | PASS — 26 casos / 51 normas; auditor global PASS | 6868 | `2bef15e4af3098d5783d55b30888a15bfb167f17b42b97b5b94897d26bcf45df` |
| [focal](../../tests/fixtures/h5-009/revalidation/focal.status.json) | PASS — 14/14 | 2598 | `ff80be6fad50c80a10132a941d2915f43ce4886b3a2ef79800f61a94ba28d039` |
| [frozen](../../tests/fixtures/h5-009/revalidation/frozen.status.json) | PASS — exit0 | 53 | `fc43ce1dd23171696002c6f6966f7679b1560379b3e1ba19f6978e2441ebcab4` |
| [health](../../tests/fixtures/h5-009/revalidation/health.status.json) | PASS — 1/1 | 200 | `2e8412f5bf29811c0bb3b346fc36fb87912bdefffe0e2f94f0e72d5c94a25dc2` |
| [historical-negative](../../tests/fixtures/h5-009/revalidation/historical-negative.status.json) | PASS — exit0 | 3800 | `2fd69701f44dbadc2336126706c84cd99e9fbf6e89c3e79fa44d2529d3ae612b` |
| [historical](../../tests/fixtures/h5-009/revalidation/historical.status.json) | PASS — exit0 | 10675 | `c7d915b5d2936052691b3782a79449e7f6b7ade6079bae90d8426b182834051a` |
| [lint](../../tests/fixtures/h5-009/revalidation/lint.status.json) | PASS — exit0 | 88 | `6eaeae66537f6e78eccf8bc1538038163c02589c1f4bcef2e62b3cc4e58dcc54` |
| [postgres](../../tests/fixtures/h5-009/revalidation/postgres.status.json) | PASS — 2473/2473 | 6920880 | `0c5f61a6b06be67c73f3a8c324781d25939583a5fb7283b6af41c77eb1d2ebfd` |
| [typecheck](../../tests/fixtures/h5-009/revalidation/typecheck.status.json) | PASS — exit0 | 90 | `99d7c2179cdd316467c51f37901025a0753453664d741214ba56fc631fa6c0bc` |
| [unit](../../tests/fixtures/h5-009/revalidation/unit.status.json) | PASS — 171/171 | 13811 | `469a583ec34c9e6d0add983516ef2278173344254c1a60090483fbf7bf439bb5` |

Preservación F01 y F10/F12 reejecutadas; archivos originales y56 migraciones intactos. Tres outputs históricos regenerados por la suite fueron archivados con sus hashes y restaurados byte a byte (`revalidation/generated/archive.json`); no se cambiaron guardas/manifests/snapshots originales. Fresh57/upgrade poblado56→57/DDL rollback/retry, advisors loopback, RLS/FORCE RLS, PIDs distintos/espera de lock/deduplicación y conflicto concurrente, T09/rollback, resultados tardíos y recovery H5-007/008 se verifican de nuevo dentro de focal/regresión.

F05 CLOSED tras18 contrapruebas y auditor final; todos los defectos F01–F05 están CLOSED. La tanda3158161 y los FAIL originales/de desarrollo siguen separados; no acreditan el nuevo SHA. [Prueba estructurada y trazabilidad](../../tests/fixtures/h5-009/verification.json), [contrapruebas](../../tests/fixtures/h5-009/f05/result.json), [diagnóstico](../../tests/fixtures/h5-009/f05-diagnosis.md).

Incidencia de regresión conservada: la primera tanda0dae8a4 dio2469/2473 PASS (dos subtests H3-010 R67 yH3-012 R030 más sus padres). Ambos archivos pasaron171/171 en retest focal sin cambios y la regresión completa definitiva se reejecutó. Causa de las denegaciones no confirmada; no se cambió código, expected, guarda ni timeout. FAIL/log/status/hash y retest comprimidos íntegros en `f05-development-fails.json`; ningún PASS antiguo sustituye ese FAIL. Advisors adicionales sobre las 57 migraciones actuales y URL127.0.0.1, CLI2.119.0: exit0, `results=[]`, con log/hash/comando/fuente en el mismo registro.

Canales: Avaibook sin crear/modificar/cancelar reservas; calendario Review-only; Web con identidad/procedencia/permisos propios y Review-only; WhatsApp/correo/otros únicamente dobles, intención/aceptación simulada/resultado/incertidumbre separados, sin envío real. B07/B08/Task/historia/operaciones/idempotencia/recovery y HA/TTE/D039 reutilizados; ninguna entrada externa se convierte en orden por referencia. ARCH-PENDING-001, BR-PENDING-034/035 y DM-PENDING-005 permanecen pendientes; integraciones reales bloqueadas. Sin exactly-once externo. Hosted/Production no acreditados. STOP definitivo: no iniciar ni preparar H5-011/012, H6 o conectores reales.

## F06 — resultado final de publicación: STOP

`git diff --cached --check` exit2 al incluir cinco logs originales que antes eran untracked. No se hizo commit documental ni push. La salida completa (508 bytes; SHA256 `aa7fe79734d1b0547bc65afbc7857797d8b2324db552ba4c16883ef8c8b7f0e1`), hashes de originales y retests permanecen en [registro de defectos](defects-TSK-H5-009.md) y [metadata/log F06](../../tests/fixtures/h5-009/f05-development-fails.json). [Verification](../../tests/fixtures/h5-009/verification.json) BLOCKED.

F01–F05 conservan sus cierres locales y evidencias;26 casos/51 filas y todos los gates ejecutados mantienen sus resultados con su SHA, pero el gate de publicación completo FAIL impide COMPLETED/PASS global. No se modificaron originales ni se relajó el diff-check. Se necesita autorización humana para decidir un empaquetado byte-preserving y la actualización mínima de referencias/rutas, con nuevos retests aplicables. STOP, sin tareas posteriores ni efectos externos reales.

## F06 — revalidación2026-10-12 y STOP F07

Cuatro archivos afectados (no cinco), seis diagnósticos. Los cuatro originales se conservan en gzip con todos sus bytes y resultados. [Manifiesto](../../tests/fixtures/h5-009/f06/compression.json) registra original/gzip/descomprimido con tamaños/SHA256 y ejecución; [preflight](../../tests/fixtures/h5-009/f06/preflight.json) conserva inventario antes de editar. Todos los enlaces necesarios se actualizaron y resuelven. [Contrapruebas](../../tests/fixtures/h5-009/f06/counterproofs.json): igualdad4/4, cinco alteraciones FAIL esperados, F05 18/18, F10/F12 PASS.

Nuevo SHA `d15b5ba93e4c0b0a2d97339a02280738297db26d`: frozen/typecheck/lint/unitarias171/build Next16.3.8/audit producción0/F01/preservación/F05/focal14 PASS. [Regresión PostgreSQL](../../tests/fixtures/h5-009/f06/gates/postgres.status.json)2470/2473, tres FAIL de H4-006 R11 y H4-021 B20/B21/B30/B31 con grupo padre. Sin causa demostrada; sin cambios funcionales, de permisos, dependencias ni guardas históricas. Se conserva el log completo; no se repite ni se normaliza para obtener PASS. Health y auditor global final no ejecutados tras STOP.

Los cuatro gates definitivos anteriores de0dae8a4 (PostgreSQL2473,unit171,focal14,health1) siguen conservados y asociados a su SHA en `revalidation/`; el manifiesto conserva la anterior verification completa. La anomalía2469/2473 previa y sus retests permanecen con causa no confirmada. No se acreditan como pruebas nuevas.

F06 packaging/auto-integridad PASS, cierre global pendiente por F07 OPEN. Ver [defectos](defects-TSK-H5-009.md). No hay commit documental ni publicación; no se inicia ninguna tarea posterior.

Conjunto completo preparado: `git diff --cached --check` exit0, sin exclusiones. Cuatro logs originales en gzip y registro Markdown con cita sustituida por enlace al diagnóstico original gzip; snapshot byte a byte anterior de esa referencia conservado en el manifiesto. El staging propio se revierte después del control, sin descartar archivos. No se crea commit documental ni push porque F07 bloquea la regresión global.

## Revalidación F08 — STOP por F09

**Estado vigente: IN PROGRESS / STOP por F09; sin PASS global ni publicación.** Candidato `8c1109426a8e85effeda6c2bb59c08ac0693c032`: unitarias171/171 y focal ampliada113/113 PASS; PostgreSQL2472/2473 FAIL en H3-R52 por solapamiento no acreditado. F01–F05 CLOSED; F06/F07/F08 controles locales PASS, cierre global pendiente; F09 OPEN. Expected intacto,26 casos/51 normas. Hosted/Production no acreditados.

Informe, inventario, contrapruebas y todos los PASS/FAIL preservados fuera del repositorio: `/Users/andres/Documents/Codex/F08-revalidacion-2026-10-12-STOP-F09/INFORME-F08-F09.md`. El PASS integral17673f9 permanece separado del FAIL8c11094; la anomalía previa H3 R67/R030 conserva causa no demostrada. No se cerraron tareas ni se publicó.
