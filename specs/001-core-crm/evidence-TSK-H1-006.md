# TSK-H1-006 — matriz normativa independiente

Matriz fijada antes de inspeccionar las assertions de H1-005. Fuentes aprobadas: Tasks H1-006 y §6, Plan §§4/5.1, FR-CAT-001/002/003, AC-085, DM-INV-018/028/029, BR-SVC-001/005/006, BR-SUP-001–004, D010, Constitución P05/P06/P07/P10/P13. Cada fila se evalúa desde cero contra el expected, sin heredar PASS focal.

| Fila | Expected a intentar falsar |
| --- | --- |
| R01 | Service/Variant y sus IDs/parentesco exactos; no se transforma Variant en servicio ni prestación. |
| R02 | Categoría y atributo: definición y asignación versionadas; cambio actual no reinterpreta referencia anterior. |
| R03 | Público y recomendación versionados; prioridad alta no constituye elegibilidad. |
| R04 | Unidad y forma de precio versionadas y separadas; aplicación histórica retiene versión exacta y no calcula dinero. |
| R05 | Provider distinto de identidad y actor; Offering vincula proveedor y servicio/variante sin declarar disponibilidad. |
| R06 | Una aplicación fijada conserva la composición y procedencia tras nuevas versiones de todos los componentes; lectura desde conexión independiente. |
| R07 | Dos versiones concurrentes sobre la misma base tienen un ganador; replay idéntico no añade versión, material cambiado choca. |
| R08 | Fallo inyectado en historia revierte versión, operación y aplicación, sin éxito parcial. |
| R09 | Scope ajeno, relación incompatible, sesión/generación revocada y acceso SQL directo/PUBLIC/anon/authenticated se deniegan. |
| R10 | Migración en base previa con fixtures conserva H1-001–004; regresión H0/H1 existente permanece PASS. |

Estado al fijar matriz: NO EJECUTADA. PostgreSQL efímero y datos sintéticos, sin proveedor real, disponibilidad real, tarifas, hosted ni Production.

## Ejecución formal independiente

Nueva base PostgreSQL efímera, nuevas claves/actor/sesión y datos sintéticos en `tests/integration/postgres-h1-006.test.ts`. Matriz ejecutada después de focales H1-005, sin usar sus assertions como oráculo. Consulta de persistencia mediante conexión independiente.

| Filas | Observado | Resultado |
| --- | --- | --- |
| R01 | Service y Variant conservaron ID, tipo, padre y revisión del padre exactos. | PASS |
| R02 | Categoría, atributo y sus asignaciones aceptaron nuevas revisiones; snapshot anterior íntegro. | PASS |
| R03 | Público y recomendación cambiaron de revisión; `Alta` no admitió `eligible`. | PASS |
| R04 | Unidad, forma de precio y asignaciones cambiaron por revisión; snapshot antiguo no cambió; ningún cálculo económico. | PASS |
| R05 | Provider y Offering tuvieron ID/tipo separados; relación Provider/Variant exacta; `availability` se rechazó. | PASS |
| R06 | Las 14 revisiones aplicadas y su procedencia fueron iguales antes/después de revisiones nuevas, comprobadas desde otra conexión. | PASS |
| R07 | Un solo ganador concurrente; replay idéntico sin mutación y replay cambiado denegado. | PASS |
| R08 | Error inyectado en historia revirtió item y operación; sin éxito parcial. | PASS |
| R09 | Relación incompatible y scope ajeno denegados; sesión revocada/generación antigua, runtime y rol `authenticated` denegados. | PASS |
| R10 | Identidad H1 anterior persistió tras migración; regresión acumulada: ver resultado de gates en esta evidencia. | PASS |

Resultado formal: R01–R10, 10/10 PASS; 2/2 pruebas formales PASS. No se halló H1-006-F01+ material. Un primer intento de la propia prueba R05 esperaba erróneamente una sola revisión de Offering después de que la matriz publicara una segunda; la assertion se corrigió a dos y se reejecutó la matriz completa PASS. No hubo cambio de implementación provocado por este error de expected del test.

V-DOM: R01–R06 6/6 PASS; V-DAT: R06–R09 4/4 PASS; V-MIG: R10 PASS. Regresión final: 291/291 PostgreSQL, 31/31 unitarios, typecheck, boundaries, build y audit PASS. Todas las comprobaciones fueron locales con fixtures sintéticos. PLAN-AUTH-001–006 y demás pendientes globales mantienen su estado; H1-007 y posteriores no iniciadas.
