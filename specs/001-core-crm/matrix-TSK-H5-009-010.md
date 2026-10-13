# Matriz H5-009/010 — inventario y ejecución local

## Cierre local vigente y atribución

**TSK-H5-009/010 COMPLETED exclusivamente local/aislado — cierre documental local, 2026-10-13.** SHA realmente probado `0d969541e119374561a6cd7d38e97faaed25add4`. PostgreSQL 2473/2473, focal ampliada 332/332, temporal C12/H4-014 110/110, unitarias 171/171 y health 1/1 PASS. F01–F09 CLOSED local/aislado, incluidos los cierres globales pendientes F06–F08. Expected intacto: 24.417 bytes, 26 casos y 51 filas normativas. Sin publicación. Hosted/Production no acreditados.

H5 global continúa IN PROGRESS. STOP tras H5-009/010. H5-011/012 y H6 permanecen NOT STARTED; no se preparan conectores reales.

Los dos logs originales siguen ORIGINAL NO RECUPERADO, con sustitución documental autorizada; las 69 diferencias históricas de hashes de tablas y R67/R030 permanecen como antecedentes independientes. Los resultados anteriores conservan su SHA y sus FAIL.


Huella de las 438 entradas del candidato: `584a276c5e0e261fe2118403c78a4a46d20c20c931613a919f5805d3ecae940a`. Los 21 recibos se verificaron contra ese SHA. Una sola regresión PostgreSQL completa; no se trasladan resultados de otros commits. El archivo [closure-originals.tar.gz](../../tests/fixtures/h5-009/f09/c12-20261013/closure-originals.tar.gz) conserva los siete documentos previos byte a byte y el expediente `candidate-validation/` completo, con su inventario independiente SHA-256 `79f7669c638bc01a07fa2b5928b5c4a121d1f7f5e00896077999131a01b37dfe`. El [certificado](../../tests/fixtures/h5-009/f09/c12-20261013/closure.json) vincula las siete transiciones exactas; el [inventario separado](../../tests/fixtures/h5-009/f09/c12-20261013/closure-inventory.json) sella las nuevas rutas sin modificar el inventario C12 congelado.

| Control sobre el candidato probado | Resultado | Evidencia |
|---|---|---|
| PostgreSQL completa | 2473/2473 PASS | [Recibo](../../tests/fixtures/h5-009/f09/c12-20261013/gates/postgres.status.json), [log](../../tests/fixtures/h5-009/f09/c12-20261013/gates/postgres.log.gz) |
| Focales H4/H5, H3-006/R52 y consumidores C12 | 332/332 PASS | [Recibo](../../tests/fixtures/h5-009/f09/c12-20261013/gates/focal.status.json) |
| Temporal C12 y H4-014 | 110/110 PASS | Archivo: candidate-validation/gates/c12-temporal/ |
| Unitarias / health | 171/171 y 1/1 PASS | [Unit](../../tests/fixtures/h5-009/f09/c12-20261013/gates/unit.status.json), [health](../../tests/fixtures/h5-009/f09/c12-20261013/gates/health.status.json) |
| Protocolo / preservación / F05 | 36/29/18 resultados esperados | Archivo: protocol-counterproofs/, classification-counterproofs.json, f05-index-isolated/ |
| Transiciones F07/F09 / C12 / F01 / wrapper | 40/15/12/14 resultados esperados | Archivo: recibos y contrapruebas de candidate-validation/ |
| Frozen, typecheck, lint, build, auditoría de dependencias | PASS; cero vulnerabilidades conocidas | [Gates](../../tests/fixtures/h5-009/f09/c12-20261013/closure-inventory.json) |
| V-MIG fresh, upgrade poblado, rollback/retry; advisors loopback | PASS | Focal y archivo: candidate-validation/gates/advisors/ |
| F10/F12, preservación H5-008 y auditor final | PASS | Archivo: candidate-validation/gates/final/ |

Las 26 filas de casos y 51 referencias normativas conservan el expected original. Las matrices y observaciones previas que siguen más abajo son antecedentes; esta sección aporta la ejecución vigente de la implementación y de todas sus verificaciones aplicables.

## Preservación y límites que permanecen

- Expected: 24.417 bytes, SHA-256 `b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639`, intacto.
- F01, F02, F16, los manifiestos y los snapshots originales permanecen intactos. Los cuatro artefactos regenerados fueron capturados y restaurados; cero diferencias residuales.
- El inventario C12 conserva `847ef52f945eb5eedf66f3ee58a07ccaf43967a40267b1d0097d58532e3c2ce9`. El expediente F16 y sus sellos no cambian.
- Comparador F16 intacto: `fd85642e0df6fd387781d813d0b0e2469efc5adb6ac95881b87430a82f80baf0`. Focal y regresión nueva pasan; solo los dos OID autorizados pueden variar. Las 69 diferencias de tablas permanecen identificadas separadamente, con C16 de preservación dentro de cada ejecución; no se afirma igualdad fila a fila entre bases históricas independientes.
- `build.log`: ORIGINAL NO RECUPERADO, 545 bytes, SHA-256 histórico `063f7ffad5445d9b2a45a17aceb16a01a6dfbbe70032787c0fdd02ea690fd0fa`.
- `health-independent.log`: ORIGINAL NO RECUPERADO, 202 bytes, SHA-256 histórico `2794076bee6b763f2a15c62a692735addf3e6b08e4fa296266b92953489f6f30`.
- Se mantiene la sustitución documental autorizada y las salidas sobrescritas conservadas. Los nuevos PASS no recuperan los originales.
- R67/R030 permanece como anomalía histórica independiente, de causa no demostrada, sin reaparición en esta regresión. No se atribuye su resolución al correctivo R52.
- F05 conserva stdout/stderr y 18 salidas individuales en el archivo; su recibo de cierre identifica el resumen JSON como derivado de la ejecución anidada, sin presentarlo como stdout nuevo.
- Este cierre es local y está pendiente de revisión del sello, commit documental y autorización separada de publicación.

## Antecedentes íntegros — resultados atribuidos a sus SHAs originales

**Estado vigente: IN PROGRESS / STOP por F09; sin PASS global ni publicación.** Candidato `8c1109426a8e85effeda6c2bb59c08ac0693c032`: unitarias171/171 y focal ampliada113/113 PASS; PostgreSQL2472/2473 FAIL en H3-R52 por solapamiento no acreditado. F01–F05 CLOSED; F06/F07/F08 controles locales PASS, cierre global pendiente; F09 OPEN. Expected intacto,26 casos/51 normas. Hosted/Production no acreditados.

## Expected congelado y recuentos

- Archivo: `expected-TSK-H5-009-010.md`, congelado en `e8b38fa45b0170689784dd3af6ef6cba93e46ae1`.
- Tamaño/hash comprobados: 24.417 bytes; SHA-256 `b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639`.
- Casos: 26 identificadores únicos: P01–P08 (8) y N01–N18 (18).
- Inventario normativo: 51 identificadores literales en una sección independiente de la tabla de casos.
- Discrepancia F02: el recuento anterior de “27 filas” contó 26 filas de casos más el encabezado; el separador Markdown no es fila de datos. “24 casos” fue un conteo incompleto en evidencia previa. No había un caso número 27 ni un expected contradictorio. El expected no se modificó.

## Caso → fuente → expected → observado → evidencia

Los expected de la tercera columna son el resumen de la fila literal del expected congelado; su texto íntegro se conserva allí. Focal conjunta: `postgres-h5-008-migration.test.ts`, `postgres-h5-009.test.ts`, `postgres-h5-009-migration.test.ts` (14/14). Suite unitaria (171/171), regresión PostgreSQL integral (2473/2473). Logs y hashes se registran en la sección Gates.

| Caso | Fuente | Expected congelado | Observado | Evidencia |
|---|---|---|---|---|
| P01 | IDEMP-001/002/004; INT-001/002; AC-066; T09 | Repetición equivalente conserva original/procedencia y retorna un canónico, sin segunda aplicación. | PASS focal: una fila B07 canónica; reentrega `duplicate`, con dos recibos preservados. | `H5-009 B07 event receipt, duplicate and E2 conflict preserve canonical event`; `H5-009 equivalent repeated event retains both receipts and one canonical result`. |
| P02 | IDEMP-004; COORD-008; INT-002; AC-066 | Registrar antigüedad sin retroceder estado vigente. | PASS unitario; evento antiguo retenido sin cambiar proyección. | `H5-009 stale event is retained without changing a current projection` en `tests/h5-009.test.ts`. |
| P03 | IDEMP-004; INT-003/005; AC-076; SM-FORB-28 | Correlacionar eco a intención original sin nueva intención/efecto. | PASS focal; eco B08 queda duplicado y snapshots de ejecución/intentos permanecen iguales. | `H5-009 own B08 effect echo correlates to its original attempt without a second effect`. |
| N01 | IDEMP-001/002; Plan C05; E2; AC-066 | Diferencia material bajo clave igual produce conflicto E2 sin sobrescritura. | PASS focal: estado `conflict`, código E2, ambos recibos y payload conflictivo retenidos. | `H5-009 B07 event receipt, duplicate and E2 conflict preserve canonical event`; unit test de conflicto. |
| N02 | IDEMP-003; INT-001/002; AC-066 | Identidad no fiable queda Review; no deduplicar por similitud. | PASS focal: dos recibos `review` con IDs distintos; sin dedup aproximada. | `H5-009 unreliable event identity persists as review and does not fuzzy-deduplicate`; unit test correspondiente. |
| P04 | INT-001/003; NFR-011; AC-071; D014 | Corrección autorizada enlaza referencias y conserva procedencia/historia/autoridad. | PASS focal: ambas referencias B07 presentes, `corrects_id` y registro histórico conservados. | `H5-009 corrected external reference preserves the prior reference and history`; unit test de sustitución autorizada. |
| P05 | INT-003/005; CONC-004; NFR-011; AC-071 | Fallo S1 queda aislado; S2 independiente puede avanzar. | PASS unitario con dobles de estado propio: S1 no disponible, S2 aplica su evento. | `H5-009 failed S1 does not block independent S2`; `H5-009 source/channel failure is isolated; S2 event remains available`. |
| N03 | ERR-002; IDEMP-004; INT-003; SM-FORB-27; AC-057/066 | Timeout conserva incertidumbre; sin reenvío ciego; resultado tardío se concilia con intento original. | PASS unitario simulado: segundo outcome rechazado; resultado tardío vinculado a la intención original. | `H5-009 uncertain outcome is not resent; late simulated result reconciles original`. |
| P06 | ERR-002; IDEMP-001/004; T09; C05; AC-057/066 | Recuperar resultado ejecutado antes del timeout sin nuevo efecto; no afirmar exactly-once externo. | PASS: doble simulado concilia resultado tardío en la intención original; suite histórica real H5-008 conserva un intento y recupera resultado sin repetir. | Unit `H5-009 uncertain outcome...`; PostgreSQL integral W06/W09/W10/W30, W46 y W30/W47. |
| P07 | CONC-004; IDEMP-001/004; PLAN-T09; AC-066 | Dos sesiones PostgreSQL independientes producen una única aplicación y un duplicado vinculado. | PASS focal: PIDs distintos; segunda sesión espera lock; resultados 1 `applied` + 1 `duplicate`, una fila canónica. | `H5-009 concurrent independent PostgreSQL sessions apply one event once`. |
| N04 | CONC-004; ERR-002; AC-066; T09 | Eventos incompatibles concurrentes crean conflicto visible, sin corrupción ni elección silenciosa. | PASS focal: bajo lock concurrente, 1 `applied` + 1 `conflict/E2`; recibo conflictivo preservado. | Segunda intercalación dentro de `H5-009 concurrent independent PostgreSQL sessions apply one event once`. |
| N05 | Plan §7.1 C01/C03; INT-002; AC-082; RLS | Actor o finalidad inválidos se rechazan sin efecto ni fuga. | PASS focal/unidades: actor ajeno y finalidad incorrecta denegados; contadores B07/B09 sin cambio. | `H5-009 actor, purpose and linked context are revalidated with no rejection effects`; tests `denies wrong actor/purpose without side effects`. |
| N06 | INT-001/002; AC-082; DM-INV-048/049 | Permisos, contexto, cobertura y alcance confiables limitan la recepción. | PASS focal/unidades: contexto ajeno denegado; permisos/cobertura/principal incorrectos denegados en el doble sin eventos. RLS/FORCE RLS retiene tablas. | Test de actor/finalidad/contexto; tests unitarios de permission/context/coverage; `H5-009 RLS/FORCE RLS and grants keep B09 receipts private`. |
| N07 | INT-006; AC-077; SM-FORB-28; D014 | Avaibook no puede crear, modificar ni cancelar reservas; evidencia solo Review. | PASS focal: tres comandos sintéticos quedan Review; contadores de Booking e intentos/ejecuciones no cambian. | `H5-009 Avaibook, calendar and web stay review-only and cannot execute external action requests`. |
| N08 | COORD-008; INT-005; AC-076; SM-FORB-28 | Calendario externo que pretende cambiar reserva/precio/disponibilidad queda en Review. | PASS focal: cambio sintético de precio/disponibilidad queda Review; sin cambios de Booking/ejecuciones. | Mismo test de frontera Avaibook/calendario/web. |
| N09 | INT-002/005; D007; AC-082; P17 | Web tiene identidad/frontera propia; misma clave en otra fuente no mezcla autoridad. | PASS focal: web queda Review mientras fuente `other` distinta conserva su propio evento; no cambian entidades de negocio. | Mismo test de frontera Avaibook/calendario/web; fixtures separados para `web` y `other`. |
| P08 | C05; INT-003/004/005; ERR-002; NFR-014 | Intención, aceptación simulada, resultado e incertidumbre separados; jamás afirmar envío real. | PASS unitario: resultado se marca `simulated`, capacidad verificada permanece vacía; incertidumbre no permite reenvío. | `H5-009 uncertain outcome is not resent; late simulated result reconciles original`; doble manual. |
| N10 | PLAN-C03/T09; CONC-004; AC-068; RLS/FORCE RLS | Fallo en T09 revierte recibo, clave, B07 e historia; retry sobre misma unidad solo tras aborto conocido. | PASS focal: trigger inyectado revierte conteos/filas; retry aplica una vez. V-MIG también prueba rollback/retry de DDL. | `H5-009 B09 receipt trigger rollback is atomic across B07 original and key; retry succeeds`; `H5-009 V-MIG fresh delta, populated 56-to-57 upgrade, DDL rollback and retry`. |
| N11 | INT-001/003; IDEMP-004; NFR-006/011; AC-071 | Preservar originales, referencias, intentos, aprobaciones, operaciones e historia. | PASS: recibos duplicados/conflictivos, evento raw, referencias e historia B07 conservados; V-MIG preserva datos y catálogo anteriores; las guardas históricas F10/F12 pasan. | Tests P01/P04/N01; V-MIG 56→57 rollback/retry; `tests/fixtures/h5-009/f01/result.json`. |
| N12 | IDEMP-001/004; INT-001/003; AC-066 | Referencia externa distinta no es identidad canónica; repetir conserva raw input y enlaza al canónico. | PASS unitario; nuevo `referenceId` y procedencia retenidos en segundo evento, enlazado con `resultRef` canónico. | `H5-009 repeated event with a replacement reference retains the raw reference and links to the canonical event`. |
| N13 | INT-001/003–006; BR-PENDING-035; ARCH-PENDING-001 | Sin capacidades/proveedor verificados; solo dobles y hechos simulados. | PASS local/aislado: dobles anuncian `verifiedCapabilities=[]`; no se ejecuta proveedor ni cambia B08/Booking/factura; auditoría de producción sin vulnerabilidades. | `src/domain/external-boundary.ts`; `H5-009 Avaibook, calendar and web stay review-only...`; audit producción PASS. |
| N14 | INT-003/005; CONC-004; NFR-011; AC-071 | Aislar canal/adaptador/fallo y preservar historial sin bloquear trabajo independiente. | PASS: dobles de fuente con estado propio, operaciones S1/S2 aisladas, carrera concurrente y referencia corregida sin perder historia. | Tests S1/S2; race P07/N04; P04; migración de frontera; `tests/h5-009.test.ts`. |
| N15 | Plan §7.2/T09; IDEMP-001/004; ERR-002 | Pérdida de ACK COMMIT se resuelve por identidad estable; desconocido no significa rollback/retry. | PASS: PostgreSQL real con ACK de COMMIT retenido por fallo de cable simulado recupera el resultado durable por la misma identidad. | Regresión integral `tests/integration/postgres-h5-008.test.ts`, W30/W47; log PostgreSQL final. |
| N16 | Plan §7.2; D039; AC-057; C03/T09 | Si hay efecto sensible autorizado, revalidar HA/TTE/estado justo antes del commit; entrada externa no abre efecto. | PASS condicional: eventos externos no abren una acción sensible ni afectan operaciones; la revalidación HA/TTE/D039 de efectos autorizados permanece protegida por la regresión histórica completa. No se introdujo una nueva acción sensible. | Test de frontera de canales; suite histórica D039/HA/TTE; regresión PostgreSQL 2473/2473. |
| N17 | INT-002; AC-082; P01/P17; SM-FORB-28 | Evento externo es evidencia, no orden; revalidar actor/finalidad/permisos/alcance. | PASS focal: payloads de crear/modificar/cancelar reserva y emitir factura no ejecutan acciones ni alteran contadores; rechazos auth no dejan efectos. | `H5-009 Avaibook, calendar and web stay review-only...`; test actor/purpose/context; RLS/FORCE RLS. |
| N18 | CONC-004; INT-003/005/006; NFR-011; AC-071/077 | Fallback queda aislado de Booking y operaciones ajenas; límites por canal persisten. | PASS focal/unidades: fallo S1 no bloquea S2; Avaibook/calendario/web sin efectos de reserva/operación. | Tests S1/S2 y frontera de canales. |

## Cobertura de las 51 filas normativas asignadas en Tasks §6

Las 51 filas normativas, su archivo/sección y expected genérico constan literalmente en el expected congelado. Esta tabla relaciona cada ID con los casos y las evidencias focales o históricas del gate integral PASS.

| Fila normativa | Casos relacionados | Evidencia de contraste |
|---|---|---|
| SPEC-FR-COORD-008 | P02, N04, N08, N14, N18 | Tests de evento antiguo, concurrencia y frontera calendario; focal y regresión integral PASS. |
| SPEC-FR-IDEMP-001 | P01, N01, P07, N12, N15 | Duplicado/E2/concurrencia y W30/W47 COMMIT PASS en focal/regresión integral. |
| SPEC-FR-IDEMP-003 | N02 | Identidad no fiable → Review, PostgreSQL y unitario. |
| SPEC-FR-IDEMP-004 | P01, P02, P03, N03, P06, P07, N11, N12, N15 | Duplicación/eco/timeout y recuperación H5-008 PASS; resultado sin repetición. |
| SPEC-FR-CONC-004 | P05, P07, N04, N10, N14, N18 | Dos sesiones independientes, conflicto, aislamiento de fuentes y rollback T09 PASS. |
| SPEC-FR-ERR-002 | N03, P06, N04, N10, N15 | Incertidumbre y rollback doble focal; W30/W47 y recuperación en regresión PASS. |
| SPEC-FR-INT-001 | P01, N02, P04, N11, N12, N13 | Raw receipts, identidad, autoridad, referencias y auditoría estática PASS. |
| SPEC-FR-INT-002 | N02, N05, N06, N09, N17 | Review sin ID; actor/finalidad/contexto/permisos y frontera Web. |
| SPEC-FR-INT-003 | P03, P04, P05, N03, P06, N11, N12, N13, N14, N18 | Correlación, fuente aislada, incertidumbre simulada y preservación PASS focal/regresión. |
| SPEC-FR-INT-004 | P08, N13 | Intención/outcome simulado separados y sin capacidad verificada; auditoría de producción PASS. |
| SPEC-FR-INT-005 | P02, P03, P05, N08, N09, N14, N18 | Orden, eco, aislamiento y Review por canal focal. |
| SPEC-FR-INT-006 | N07, N13, N17, N18 | Avaibook sin write; no se invocan proveedores/conectores; auditoría PASS. |
| AC-057 | N03, P06, N15, N16 | Doble incierto y recovery/HA-TTE histórico PASS en suite integral. |
| AC-066 | P01, P02, N01, N02, P07, N04, N12, N15 | B07 duplicate/E2, stale, Review, race y COMMIT gate PASS. |
| AC-071 | P04, P05, N11, N14, N18 | Referencia/historia y aislamiento por fuente focal. |
| AC-076 | P03, N08, N18 | Eco B08 y Review calendario; sin segunda acción. |
| AC-077 | N07, N18 | Avaibook create/modify/cancel bloqueados por frontera; focal. |
| AC-082 | N05, N06, N09, N17 | Actor/purpose/context/coverage y RLS/FORCE RLS focal. |
| SPEC-NFR-006 | N11 | Originales, recibos, historia y datasets del upgrade preservados; regresión histórica PASS. |
| SPEC-NFR-008 | P05, P07, N04, N10, N14 | Independencia, locking, conflicto y atomicidad focal. |
| SPEC-NFR-011 | P04, P05, N11, N14, N18 | Referencias históricas y aislamiento focal; sin promoción global. |
| SPEC-NFR-014 | P08, N03, N13 | Outcome simulado/uncertainty y verifiedCapabilities vacío; revisión estática/audit PASS. |
| DM-INV-048 | N06, N17 | No ampliar autoridad por entrada; rechazo de auth y ningún efecto. |
| DM-INV-049 | N06, N14, N18 | Alcance y separación de fuentes/canales; focal. |
| SM-FORB-27 | N03, P06, N15 | Sin retry ciego; doble unitario; recovery histórico H5-008 dentro del retest global. |
| SM-FORB-28 | P03, N07, N08, N17, N18 | Eco correlacionado, canales externos Review-only y ausencia de acción. |
| SM-FORB-33 | — | Fila normativa asignada literalmente en Tasks §6, pero su transición trata ventanas de plazo/alcance de otro dominio y no se activa por eventos externos H5-009. Se contrasta por invariante de no mutación/ausencia de ese efecto; no se simula una modificación de disponibilidad o plazo. Referencia: expected congelado y auditoría final de fronteras. |
| ARCH-DEC-001 | N05, N06, N13 | Límites de autoridad y doble manual; revisión estática/auditoría PASS. |
| ARCH-DEC-003 | P04, N13, N14 | Puertos/adaptadores y referencias focales; sin proveedor real. |
| ARCH-DEC-005 | N05, N06, N17 | Autorización antes de acceso/efecto; focal con verificación F1/F2. |
| ARCH-DEC-006 | P01, N01, N12 | Identidad canónica, conflicto y raw repeats focal. |
| ARCH-DEC-008 | N09, N13, N14 | Frontera Web separada, no proveedor real; focal/estático. |
| ARCH-DEC-009 | N13 | Capacidad explícita vacía y dobles; auditoría PASS. |
| ARCH-DEC-013 | N03, P06, N10, N15 | Incertidumbre, T09 y recuperación H5-008 PASS en focal/regresión integral. |
| P01 | P01, P02, P04, N11 | B07 conservación y eventos/rerefencias focales. |
| P16 | N17 | No se crea/ejecuta acción de factura desde evento; contadores de factura no cambian. |
| P17 | N09, N17 | Web/externo no adquiere autoridad sobre Core; frontera focal. |
| PLAN-DEC-008 | P05, N14, N18 | Fuente/canal aislados; dobles con estado propio y focal. |
| PLAN-DEC-009 | N03, P06, P08, N15 | Intención y resultado simulado separados; recuperación/COMMIT PASS integral. |
| PLAN-B09 | P01, N01, N02, P07, N04, N10, N11 | Recibos, clave, conflicto, serialización y rollback focal; V-MIG fresh/upgrade/rollback/retry PASS. |
| PLAN-C05 | P08, N03, P06, N13 | Contrato del doble y de outcomes simulados; sin conector real. |
| PLAN-T09 | P07, N04, N10, N15 | Race, rollback y COMMIT uncertainty PASS en suite integral. |
| PT-12 | N05, N06, N17 | Guardas de autoridad y cero efectos al rechazo; focal. |
| E2E-06 | P01, P03, P04, P08 | Recorrido local con doble, registro/eco/referencia/intención y resultado simulado PASS. |
| E4 | N03, P06, P08, N15 | Incertidumbre explícita y conciliación sin reenvío; recovery global PASS. |
| E6 | N05, N06, N13, N17 | Denegaciones sin efecto y sin capacidades externas; auditoría PASS. |
| D002 | P01, N01, N12 | Clave/correlación y conflicto material E2 focal. |
| D007 | N09, N13 | Frontera Web propia, no conectada; focal/estático. |
| D008 | P05, N14, N18 | Aislamiento por fuente/canal con dobles focal. |
| D014 | P04, N07, N08 | Referencias sin autoridad y prohibiciones Avaibook/calendario focal. |
| D021 | P02, N11, N14 | Conservación temporal/histórica y aislamiento; focal y preservación histórica PASS. |

## Gates y estado de cierre

Reejecución íntegra posterior al correctivo F05 en `0dae8a4a0b5ce92845b13fd82c60c1ed931184dc`: focal 14/14, PostgreSQL 2473/2473, unitarias 171/171, health 1/1; frozen/typecheck/lint/build Next16.3.8/audit producción0 vulnerabilidades/V-MIG fresh57 y56→57 poblado-rollback-retry/advisors loopback/RLS-FORCE RLS/concurrencia/T09/HA-TTE-D039/recovery/F10-F12/preservación/diff/auditor final PASS. F05 contrapruebas 18/18; F01 reejecutado conservando originales.

Las fuentes/expected y observaciones de las26 filas anteriores se conservan; las mismas pruebas se ejecutaron nuevamente y sus logs/status/hashes están en [evidencia definitiva](evidence-TSK-H5-009-010.md#revalidación-definitiva-tras-f05--2026-10-09) y [verification.json](../../tests/fixtures/h5-009/verification.json). Cada una de las51 filas normativas sigue trazada separadamente. SM-FORB-33 conserva el contraste de ausencia de transición fuera de alcance; HA/TTE/D039 se revalidan con los efectos de los casos históricos.

F01–F05 CLOSED local/aislado. Expected inmutable. El producto1c86e69 y candidato3158161 conservan evidencia propia y FAIL originales; ningún PASS antiguo se atribuye al correctivo final. Cierre documental/publicación posteriores al SHA probado.

STOP definitivo tras H5-009/010. No iniciar ni preparar H5-011/012, H6 ni conectores reales.

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
