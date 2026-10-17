# Quinta auditoría — hallazgos y clasificación

## Dictamen y alcance de los hallazgos

Ningún defecto funcional nuevo del diagnóstico F confirmado por la revisión estática, los71 casos focales recibidos repetidos, las11 contrapruebas funcionales nuevas y los2 casos V-MIG independientes. Existe un hallazgo material de verificación abierto, H5-018-5-F01, descrito abajo. El resultado completo y su postcheck se acreditan separadamente en el informe A–R y `current-coverage.json`; esta conclusión no se extrapola a Hosted/Production.

Los cuatro reproductores H5-018-4-F01 y los tres H5-018-4-F02 pasan sobre68 en la captura01. El verificador de resultados exige además sus nombres exactos dentro de la selección completa actual. Las cuatro auditorías anteriores conservan FAIL sobre sus propios candidatos; no se reescriben ni se les atribuye retrospectivamente PASS.

El dictamen global es FAIL: la completa08 tiene2630 PASS/303 FAIL. No se recomienda aceptación/publicación. Se requiere un correctivo de los fixtures recibidos y revalidación completa, documentado abajo y no implementado. No hay un nuevo defecto funcional de68 confirmado por estas contrapruebas.

## Incidencias del instrumento independiente

| ID | Evidencia preservada | Causa y resolución | Clasificación |
|---|---|---|---|
| AUD5-I01 | Captura02, V01 WORK_APPROVAL_REQUIRED; `instrument-originals/sequences-v1.ts`. | El fixture cambió recordId, pero copió purpose de una comunicación anterior. La revisión fue correctamente denegada antes de probar la colisión. Se trasladó la finalidad de la evidencia nueva junto a su identidad. V01 PASS05/06. | Precondición incorrecta del auditor. Sin cambio de producto. |
| AUD5-I02 | Captura02 V03, captura05 V03; expected inicial y ambas aclaraciones; instrumentosv1/v2. | La primera aserción trató como ajena la oportunidad canónica de la propia reserva. BR-BOOK-001/BR-HIST-002 permiten esa procedencia. El primer retest invocó además B07 con el contexto del padre, pero el lector directo exige contexto exacto. La precisiónv2 verifica la fuente en opportunity y la relación canónica creada por el flujo ordinario; una reserva distinta sigue denegada. V03 PASS06. | Interpretación e invocación incorrectas del auditor, explícitamente corregidas. Ninguna supresión de FAIL o norma nueva. |

La captura02 tiene9 PASS/2 FAIL y la05 tiene10 PASS/1 FAIL. No se contabilizan como baterías PASS. La captura06 tiene11/11 PASS con la versión final del instrumento. Las preimágenes permiten reconstruir cada captura por SHA256. El expected original permanece intacto; las aclaraciones son aditivas y visibles.

Se creó por error un archivo propio vacío ` spec.tmp` durante la escritura documental y se retiró inmediatamente; nunca fue input de ejecución ni parte del candidato. El inventario final exige que solo permanezcan rutas de la quinta auditoría. No se tocó un archivo recibido para resolver este error.

## Límites explícitos

- Restricción/restauración de enlaces de evidencia: perturbación SQL privilegiada de datos sintéticos; no se presenta como API ordinaria de revocación B07.
- Revocación de sesión: contrato real B01, con nuevas sesiones legítimas del mismo administrador D025. No se atribuye una fuga entre usuarios.
- Replay sin efectos laterales: se comprueban observaciones, operaciones e historia; no se afirma ausencia de toda actividad técnica de autenticación/capacidades.
- La selección completa mantiene versiones históricas de sus ensayos de migración. No se afirma que cada archivo físico histórico instale68.
- DM-PENDING-005 sigue OPEN. No se fijan conservación, eliminación, anonimización ni parámetros operativos.
- H5-017/H5-018 siguen IN PROGRESS. No commit/push/deploy, H5-019/H6, H6-015/H6-017, datos o servicios de negocio reales.


## H5-018-5-F01 — fixture de cancelación dependiente de la fecha de ejecución

**OPEN; material para la puerta de verificación/aceptación. Origen heredado, no atribuido a migración68.**

Norma: encargo §11 requiere PostgreSQL completo; Tasks §2.2 V-EVI exige esperado/observado reproducibles y V-DAT evidencia real. SPEC-FR-CHG-006/008 exige causa/base/evidencia acreditadas; no permite suprimir la guarda para aprobar un escenario inválido. La causalidad técnica temporal se demuestra en el contrato SQL `payment_evidence` (migración20261003093202, líneas73–78), delegado por `modification_proof` y exigido en `cancellation_apply`.

- Fixture recibido `h4-cancellation-fixtures.ts:44–51`: comando por defecto y facts.at fijos en `2026-10-17T10:00:00Z`; attest por defecto delega a conf.proof.
- `h4-confirmation-fixtures.ts:7,18`: conf.proof usa la hora real de construcción. Tras las10:00Z su evidencia resulta posterior al acto; se obtiene `CANCELLATION_EVIDENCE_REQUIRED:E3`.
- Las cinco fuentes implicadas son idénticas a la base aprobada. SHA y detalles de los303 fallos en `complete-failure-analysis.json`.
- Reproductor recibido íntegro `postgres-h4-013.test.ts`: FAIL18 y FAIL20,1/1 cada vez. No se altera el archivo ni su expected.
- V09,2 casos independientes sobre esquema histórico y68: PASS16 y PASS19 al comprobar dos rechazos del original, rechazo de evidencia un milisegundo futura, cero revisiones tras denegación, control con evidencia exactamente en q.at y derecho150.03/retención150.00/base300.03, replay sin duplicado y una revisión. Son controles diagnósticos, no una conversión del test original a PASS.

**Alcance de la causalidad:**295 fallos completos contienen explícitamente el rechazo de evidencia. Siete fallos de aserción concurrente y uno por bloqueo no observado se preservan sin causa individual concluyente; pueden compartir la precondición, pero no se da por probado. Tampoco se afirma que corregir este fixture eliminará necesariamente los303 fallos.

**Correctivo mínimo necesario, no aplicado:** establecer una cronología sintética explícita y coherente por acto de cancelación y sus evidencias; cubrir determine, re-attest y pruebas de base administrativa/aprobación/no reembolsable que usan conf.proof. Conservar fechas civiles del escenario, casos de evidencia posterior, identidad, permisos, expected y aserciones. No cambiar el reloj global/OS, retrasar arbitrariamente el acto, omitir casos ni relajar payment_evidence. Probar límites antes/igual/después y concurrencia. Conservar el candidato y registros anteriores; ejecutar nuevamente la batería completa y resolver por separado cualquier residual, especialmente los8 casos señalados. Requiere correctivo separado: esta auditoría no modifica producto ni fixtures recibidos.

## AUD5-I03 — invocación del runner

Capturas15 y17: exit1 `ISOLATED_TEST_NAME_INVALID`, cero tests ejecutados. Se pasó una ruta cuando el runner requiere nombre de archivo. Capturas16/18 corrigen únicamente el argumento;19/20 repiten. Los intentos fallidos quedan conservados y fuera de los conteos de casos. No hay cambio de instrumento recibido ni defecto de producto.

Los borradores de informe/matriz/hallazgos y los verificadores propios escritos antes del resultado08 están preservados en `instrument-originals/pre-complete-result-*`. Sus supuestos provisionales PASS no son resultados ejecutados; los verificadores finales exigen la salida FAIL real y distinguen integridad del sello de dictamen funcional.


## AUD5-I04 — conciliación de salida histórica incrustada

El primer pase del verificador propio de resultados se detuvo en su aserción de conteo, antes de producir cobertura o sello. El parser inicial solo contaba54 líneas PASS históricas visibles y mezclaba el corte de fallos del subprocess con el test exterior. La salida original contiene57 casos históricos (55 PASS/2 FAIL esperados), con R01 en la línea del prefijo y R56/R57 repetidos en el resumen de errores. Se corrige exclusivamente el parser propio: extrae el bloque histórico, exige57 y55/2, excluye esos57 del conteo actual y conserva únicamente el test exterior H2-008. Se preserva la preimagen `results-parser-first-fail.py`. No se modifica el log ni el resultado de ningún caso. La completa sigue siendo2933=2630+303.
