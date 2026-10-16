# H5-015 — Matriz normativa inicial

Base verificada tras fetch: `ff0ad6c6e505914f31eb15d56725179c9f065426`; HEAD/main/origin/main iguales, divergencia 0/0, índice y árbol limpios. Alcance exclusivamente local/aislado con sintéticos. Esta matriz precede a la implementación. No acredita H5-016 ni H6.

| ID | Fuente normativa | Invariante / prueba necesaria |
|---|---|---|
| J01 | Tasks H5-015; SPEC-FR-CLOSE-003; SM-CL-04; DM-INV-041 | Acto explícito, tres evaluaciones Resuelto actualmente aplicables, reevaluación con kernel H5-013, persistencia atómica. Positivo y cada combinación pendiente. |
| J02 | BR-CLOSE-002; BR-INC-002; DM-INV-042; AC-060 | Guarda crítica conjunta independiente; justificación admisible no dispensa economía/documentos/Refund/fianza. |
| J03 | SPEC-FR-CLOSE-001/002; SM-CL §15; AC-058/059 | No aplica por criterio motivado; ausencia de datos no suficiencia. Ganada/Finalizada/pago/Task/Incident no cierran. Cancelación total puede cerrar si cumple. |
| J04 | SPEC-FR-CLOSE-004; SM-CL-03/05; AC-046/061; P07 | Cambio material invalida solo dimensión afectada y retira cierre actual; cierre previo inmutable. Corrección posterior no revive cierre automáticamente. |
| J05 | Plan C02/C03/C06, T10; SM-CL-03/05 | Reapertura explícita fundada, evidencia y actor; sin hecho material no procede. Nueva evaluación y eventual nuevo cierre son actos distintos. |
| J06 | Plan §7.1; SPEC §19 E2 | Replay exacto reutiliza resultado; misma identidad con contenido/actor distinto E2; conflicto material exige nueva revisión, sin retry ciego. |
| J07 | Plan T10, §§7.2/7.3; SPEC-FR-CONC-002; ARCH-DEC-014; PLAN-DEC-004 | Raíz Booking compartida y lecturas actuales tras esperas; ambos órdenes reales frente a obligaciones, documentos, pagos, facturas, Refund, fianza, Incident y servicio. Reservas independientes progresan. |
| J08 | Plan C03; P06/P07/P13 | Evidencia/historia/resultado juntos o rollback, fallo por escritura y commit; retry de unidad abortada. |
| J09 | P10/P11; Plan C01; G1–G6 | F1/F2, actor/scope/sesión vigentes, permisos mínimos, RLS/FORCE, funciones privadas y sin EXECUTE PUBLIC; negativos fuera de UI. |
| J10 | P13/P18; Tasks §2.2 V-MIG | Nueva migración; fresh y upgrade62 poblada; rollback/reintento, catálogo/filas anteriores preservados. Migraciones 1–62 inmutables. |
| J11 | P18/P19; Tasks H5-015/H5-016 | Regresión H3/H4/H5-013/H5-014, unitarias, health, instalación, typecheck/lint/build/audit; inputs e inventario sin hash autorreferente. Auditoría independiente H5-016 pendiente. |

Los contratos aprobados de invalidación son explícitos: SM-CL-03/05 y SPEC-FR-CLOSE-004 requieren retirar la condición vigente ante evidencia posterior. Eso no autoriza una reapertura arbitraria sin criterio afectado ni una evaluación Resuelto automática. La implementación reutilizará `closure_inputs`, `closure_basis` y `closure_assess` de migración62; no modificará su archivo ni el oráculo congelado.

Dependencias revisadas: H5-013 (evaluaciones/fundamentos), H5-014 (correctivo fail-closed de seis predicados, original FAIL conservado), H5-012 (proyecciones autorizadas), H4-024, H3/H4 (economía, obligaciones y operación). H5-016 deberá auditar independientemente el candidato; recorridos H6 no acreditados.

## Correspondencia de las 33 filas asignadas por Tasks §6

| Filas | Casos / alcance |
|---|---|
| SPEC-FR-CLOSE-003, DM-INV-041, SM-CL-04, BR-CLOSE-002 | J01/J02/J03; cierre explícito y guarda conjunta. |
| SPEC-FR-CLOSE-004, AC-061, SM-CL-03, SM-CL-05, P07, SPEC-NFR-012 | J04/J05/J08; invalidación persistida, reapertura fundada, historial. |
| SPEC-FR-CONC-002, SPEC-NFR-007, ARCH-DEC-014, PLAN-DEC-004, E2 | J06/J07/J08; raíz, replay, conflictos, rollback. |
| AC-046, AC-059, AC-060, AC-062, SM-FORB-23, SM-FORB-24, D012, G5 | J01–J05; fundamentos/documentos independientes, crítica y economía, ausencia de inferencias. H5-013/H5-014 conservan sus negativos. Archivado no es una llamada al nuevo cierre. |
| PLAN-B06, PLAN-C02, PLAN-C03, PLAN-C06, PLAN-T10 | J01–J10; componentes existentes, kernel único, persistencia y lectura autorizadas. |
| PT-06, PT-10 | Pruebas focales/regresión con criterio/evidencia actual; no se afirma completar recorridos futuros por una prueba local. |
| E2E-01, E2E-04, E2E-07 | Tramo local del cierre, cambios e invalidación probado; recorridos integrales H6 pendientes. |

Las pruebas de factura nueva/corregida y aplicación de cambio de servicio usan una Booking externa con dimensiones pendientes, en ambos órdenes frente al intento de cierre. Las demás carreras parten de tres dimensiones resueltas. No se presenta esa cobertura como una venta externa integral ya cerrada. Los resultados exactos y diferencias entre candidatos están en el informe de evidencias.
