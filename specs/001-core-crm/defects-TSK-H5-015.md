# H5-015 — Defectos y correctivos locales

## F01 — Guarda crítica conjunta omitida en invalidación persistida

Contraprueba J02: cerrar una Booking válida y registrar una crítica abierta con impacto localizado `material:false`. SM-CL-04 y BR-INC-002 siguen exigiendo justificación para el cierre conjunto. El primer candidato filtraba exclusivamente por las bases dimensionales H5-013: `jointClosure.current` permanecía true. FAIL real conservado en `tests/fixtures/h5-015/04-critical-original.log.gz`; SQL y test originales comprimidos con prefijo F01.

Correctivo en migración63: invalidación operacional fundada también en la guarda crítica conjunta, sin modificar `closure_assess` ni migración62. Mantiene fuente/registro causante y fundamentos previos/actuales; permite reapertura explícita y no dispensa economía. Retest en `05-functional-corrective.log.gz`: 12/12 PASS, incluida la reproducción. La evidencia definitiva posterior se identifica en el informe.

## F02 — Conflicto concurrente de identidad entre Bookings clasificado genéricamente

J06 con dos conexiones, dos Bookings y mismo operationId: el primer cierre espera antes del INSERT; el segundo confirma sobre otra Booking; el primero revierte íntegramente por unicidad. El estado era seguro, pero el adapter devolvía CLOSURE_DENIED en lugar del E2 contractual. FAIL en `21-idempotency-original.log.gz`, SQL precedente F02 conservado.

Correctivo mínimo en migración63: traducir únicamente las colisiones de las restricciones de identidad de operación a `CLOSURE_REPLAY_CONFLICT:E2`, preservando el rollback y relanzando cualquier otra violación de unicidad. Aplica al nuevo cierre conjunto y al límite existente de evaluación/reapertura; no añade bloqueos globales ni permite replay con otra raíz/actor/contenido. Retest y candidato definitivo en el informe de evidencias.

## Instrumental (sin cambiar expected históricos)

- H01: lanzamiento directo del test sin el runner Storage devolvió ISOLATED_STORAGE_REQUIRED (01). Se usa el runner oficial local del repositorio; smoke 02 PASS.
- H02: fixture de ajuste de obligación omitía `scope`/`scopeId` y `due`, por lo que el comando era rechazado antes del bloqueo esperado. Batería 10: 36/38, dos esperas no observadas; original del test comprimido. La primera corrección solo añadió `due`; el log20 expuso OBLIGATION_SCOPE_REQUIRED y se completó el alcance explícito. Se garantiza cierre de conexiones incluso si falla la observación. No se cambia el resultado esperado.
- H03: typecheck detectó una sustitución textual demasiado amplia en el tipo de retorno y asignaciones a tipos readonly en el fixture. Corregidos conservando los logs 07/09; typecheck 11/15 PASS.
- H04: la primera copia de regresión se preparó antes del correctivo H02; el comando de sincronización se lanzó con cwd de la copia y no encontró el registro local de ubicación. Esa ejecución completa se conserva como ejecución anterior, no como evidencia del conjunto final de inputs. Los informes distinguen producto y tests de cada ejecución.

- H05: la ejecución completa13 detectó colisión del puerto59525 entre la suite funcional nueva y H5-014-races: 14 fallos de preparación. Se asignó59545 a H5-015 y se ejecutaron las41 focales finales sin errores; el log13 se conserva íntegro.

## Cierre del candidato

F01 y F02 reproducidos y corregidos: ambas contrapruebas incluidas en **23-final-focal.log.gz, 41/41 PASS**. Regresión de evaluadores sobre63 **66/66 PASS** (24); unitarias197/197, typecheck/lint finales PASS (25–27). Los FAIL intermedios10/13/20 no se presentan como ejecuciones correctas. Detalle de inputs, resultados consolidados y límites en [informe H5-015](evidence-TSK-H5-015.md). Sin auditoría independiente realizada.
