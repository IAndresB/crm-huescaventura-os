# Matriz independiente — TSK-H5-012

**2026-10-15 — FAILED / STOP por H5-012-F01.** Producto `f063879d203330adb57d7e8fef3607ae796f52d5`. Expected congelado intacto. Esta matriz registra resultados parciales; no reemplaza sus 41 casos ni cambia sus fuentes.

[Evidencia](evidence-TSK-H5-012.md), [defecto material](defects-TSK-H5-012.md) y [resultados estructurados](../../tests/fixtures/h5-012/independent-20261015/results-summary.json).

## 41 casos conceptuales

| Caso | Resultado de esta revisión | Alcance y límite |
|---|---|---|
| H01 Reconstrucción canónica | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| H02 Registro tardío y momento desconocido | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| H03 Rectificación de llamada atribuida | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| H04 Actores y procedencia distintos | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| H05 Original, derivado y conservación incompleta | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| H06 Archivado recuperable | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| H07 Fusión humana de identidades | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| H08 Anulación e IDs no reutilizables | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| C01 Calendario canónico completo en su alcance | FAIL en recorrido de noche modificada | Una única prueba física: noche20→23 aprobada/aplicada; calendario20 frente a canónico23. No todos los subescenarios del caso ejecutados. |
| C02 Proyección reconstruible y filtros | FAIL en recorrido de noche modificada | Una única prueba física: noche20→23 aprobada/aplicada; calendario20 frente a canónico23. No todos los subescenarios del caso ejecutados. |
| C03 Día completo a siete días | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| C04 Límites civiles de cancelación a siete y tres días | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| C05 Referencias por Booking/modalidad/servicio/noche | FAIL en recorrido de noche modificada | Una única prueba física: noche20→23 aprobada/aplicada; calendario20 frente a canónico23. No todos los subescenarios del caso ejecutados. |
| C06 Referencia contractual expresa | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| C07 Hora, fecha y vencimiento externo | FAIL en recorrido de noche modificada | Una única prueba física: noche20→23 aprobada/aplicada; calendario20 frente a canónico23. No todos los subescenarios del caso ejecutados. |
| C08 Datos temporales o parámetros desconocidos | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| C09 Cambio Calendar crítico y vista atrasada | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| C10 Eco y evento fuera de orden | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| C11 Frontera indisponible o sustituida | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| C12 Avaibook sin escritura V1 | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| S01 Consulta interna del Administrador | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| S02 Consulta para tercero | Comprobaciones parciales PASS; caso NO COMPLETADO | Selección mínima y búsqueda posterior, 18 combinaciones superficie/destinatario; no original/adjunto/derivado completo. |
| S03 Búsqueda para tercero | Comprobaciones parciales PASS; caso NO COMPLETADO | Selección mínima y búsqueda posterior, 18 combinaciones superficie/destinatario; no original/adjunto/derivado completo. |
| S04 Exportación para tercero | Comprobaciones parciales PASS; caso NO COMPLETADO | Selección mínima y búsqueda posterior, 18 combinaciones superficie/destinatario; no original/adjunto/derivado completo. |
| S05 Documento para tercero | Comprobaciones parciales PASS; caso NO COMPLETADO | Selección mínima y búsqueda posterior, 18 combinaciones superficie/destinatario; no original/adjunto/derivado completo. |
| S06 Timeline para tercero | Comprobaciones parciales PASS; caso NO COMPLETADO | Selección mínima y búsqueda posterior, 18 combinaciones superficie/destinatario; no original/adjunto/derivado completo. |
| S07 Contexto IA permitido | Comprobaciones parciales PASS; caso NO COMPLETADO | Selección mínima y búsqueda posterior, 18 combinaciones superficie/destinatario; no original/adjunto/derivado completo. |
| S08 Pack comercial multimodal | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| S09 Finalidad y conservación no presumidas | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| S10 Naturaleza fiscal de las salidas | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| S11 Referencias de diagnóstico autorizadas | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| S12 Diagnóstico o rechazo no autorizados | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| A01 Sin contexto válido | Comprobaciones parciales PASS; caso NO COMPLETADO | Autoridad ordinaria/denegaciones o separación de dos Bookings, según prueba. No variantes completas de sesión, scope compartido o frontera pública. |
| A02 Contexto falsificado o ampliado | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| A03 Actor/sesión ya inhabilitados o revocados | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| A04 Relación o rol futuro sin acceso | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| A05 Vínculo compartido y scope concreto | Comprobaciones parciales PASS; caso NO COMPLETADO | Autoridad ordinaria/denegaciones o separación de dos Bookings, según prueba. No variantes completas de sesión, scope compartido o frontera pública. |
| A06 Sesiones y respuestas personales aisladas | NO EJECUTADO | STOP ante defecto de producto; sin aceptación por resultados previos del implementador. |
| A07 Frontera pública y origen externo | Comprobaciones parciales PASS; caso NO COMPLETADO | Autoridad ordinaria/denegaciones o separación de dos Bookings, según prueba. No variantes completas de sesión, scope compartido o frontera pública. |
| A08 Acceso directo y privilegios mínimos | Comprobaciones parciales PASS; caso NO COMPLETADO | Autoridad ordinaria/denegaciones o separación de dos Bookings, según prueba. No variantes completas de sesión, scope compartido o frontera pública. |
| A09 Lectura no autoriza mutación ni actividad ficticia | Comprobaciones parciales PASS; caso NO COMPLETADO | Autoridad ordinaria/denegaciones o separación de dos Bookings, según prueba. No variantes completas de sesión, scope compartido o frontera pública. |

Son **3 pruebas físicas: 2 PASS y 1 FAIL**. Cuatro casos se ven afectados por ese único escenario fallido, once tienen comprobaciones positivas parciales y 26 quedan sin ejecutar. No41/41 ni suma de parametrizaciones.

## 34 filas y asignaciones conservadas

Cada fila mantiene su asignación original de desarrollo/comprobación. La columna de cierre se limita a esta revisión y no modifica el contrato ni acredita obligaciones globales de otras tareas.

| ID | Desarrollo H5-011 | Comprobación H5-012 | Casos congelados | Otras comprobaciones conservadas | Cierre H5-012 |
|---|---|---|---|---|---|
| SPEC-FR-HIST-006 | Sí | Sí | H01–H08, S06, A05 | [TSK-H1-004], [TSK-H5-016] | NO CERRADA: revisión detenida |
| SPEC-FR-COORD-008 | Sí | Sí | C01–C10, A09 | [TSK-H5-010] | NO CERRADA: revisión detenida |
| SPEC-FR-SEC-003 | Sí | Sí | S01–S08 | [TSK-H2-004], [TSK-H6-017] | NO CERRADA: revisión detenida |
| SPEC-FR-SEC-006 | Sí | Sí | H05, S02–S09, A05 | [TSK-H1-002], [TSK-H4-002], [TSK-H5-006], [TSK-H6-017] | NO CERRADA: revisión detenida |
| SPEC-FR-SEC-007 | Sí | No | S10 (límite local) | [TSK-H3-014], [TSK-H3-010], [TSK-H6-017] | NO CERRADA: revisión detenida |
| SPEC-FR-INT-005 | Sí | Sí | C09–C11, A07 | [TSK-H5-010] | NO CERRADA: revisión detenida |
| AC-062 | Sí | Sí | H06–H08 | [TSK-H1-004], [TSK-H5-016] | NO CERRADA: revisión detenida |
| AC-065 | Sí | Sí | S02–S08 | [TSK-H2-004], [TSK-H6-017] | NO CERRADA: revisión detenida |
| AC-075 | Sí | Sí | H03 | [TSK-H2-008], [TSK-H6-002] | NO CERRADA: revisión detenida |
| AC-076 | Sí | Sí | C03–C10 | [TSK-H5-010] | NO CERRADA: revisión detenida |
| AC-081 | Sí | No | S11–S12 (límite local) | [TSK-H5-018] | NO CERRADA: revisión detenida |
| SPEC-NFR-001 | Sí | Sí | H01–H04 | [TSK-H2-008], [TSK-H6-001], [TSK-H6-018] | NO CERRADA: revisión detenida |
| SPEC-NFR-003 | Sí | No | H05, S02–S09 (límite local) | [TSK-H2-011], [TSK-H4-002], [TSK-H5-006], [TSK-H6-017] | NO CERRADA: revisión detenida |
| SPEC-NFR-011 | No | Sí | C11 | [TSK-H5-010] | NO CERRADA: revisión detenida |
| DM-INV-025 | Sí | No | S08 (límite local) | [TSK-H2-004], [TSK-H6-017] | NO CERRADA: revisión detenida |
| DM-INV-047 | Sí | Sí | H02–H04, S11 | [TSK-H0-010], [TSK-H1-014], [TSK-H5-018] | NO CERRADA: revisión detenida |
| DM-INV-049 | Sí | Sí | C09–C12 | [TSK-H5-010] | NO CERRADA: revisión detenida |
| DM-INV-050 | Sí | No | S01, A04 (límite local) | [TSK-H6-008], [TSK-H0-008], [TSK-H6-017] | NO CERRADA: revisión detenida |
| DM-INV-051 | Sí | Sí | H06–H08 | [TSK-H1-004], [TSK-H6-013] | NO CERRADA: revisión detenida |
| SM-FORB-28 | Sí | Sí | C09–C12 | [TSK-H5-010] | NO CERRADA: revisión detenida |
| SM-FORB-29 | Sí | No | S06, A04–A07 (límite local) | [TSK-H0-008], [TSK-H6-008], [TSK-H6-017] | NO CERRADA: revisión detenida |
| SM-FORB-32 | No | Sí | H06–H08 | [TSK-H1-004], [TSK-H2-008] | NO CERRADA: revisión detenida |
| ARCH-DEC-007 | Sí | Sí | C01, C09–C10 | — | NO CERRADA: revisión detenida |
| ARCH-DEC-008 | Sí | Sí | C11, A07 | [TSK-H5-010], [TSK-H6-017] | NO CERRADA: revisión detenida |
| ARCH-DEC-016 | Sí | Sí | H01–H04 | [TSK-H0-010], [TSK-H1-014], [TSK-H1-004] | NO CERRADA: revisión detenida |
| P10 | Sí | Sí | S02–S09, S12, A01–A09 | [TSK-H6-008], [TSK-H0-008], [TSK-H1-016], [TSK-H6-017] | NO CERRADA: revisión detenida |
| P11 | Sí | Sí | S01–S08 | [TSK-H3-014], [TSK-H6-017] | NO CERRADA: revisión detenida |
| PLAN-DEC-009 | Sí | Sí | C02, A06 | [TSK-H1-018], [TSK-H5-008], [TSK-H5-010] | NO CERRADA: revisión detenida |
| PLAN-B07 | Sí | Sí | H01–H05, C01 | [TSK-H1-014], [TSK-H1-016], [TSK-H1-018], [TSK-H5-002], [TSK-H5-004], [TSK-H5-006] | NO CERRADA: revisión detenida |
| PLAN-C01 | Sí | Sí | C02, S01, A01–A09 | [TSK-H0-006], [TSK-H0-008], [TSK-H1-016], [TSK-H6-008] | NO CERRADA: revisión detenida |
| PT-05 | Sí | Sí | C03–C07 (consumo D020, sin ampliar H4) | [TSK-H4-012], [TSK-H4-014], [TSK-H1-012] | NO CERRADA: revisión detenida |
| PT-08 | Sí | Sí | C01, C08–C10 (consulta, sin ampliar otros bloques) | [TSK-H1-018], [TSK-H5-002], [TSK-H4-002], [TSK-H4-004], [TSK-H5-004], [TSK-H5-006], [TSK-H5-008] | NO CERRADA: revisión detenida |
| G1 | Sí | Sí | A01–A09 | [TSK-H0-006], [TSK-H0-008], [TSK-H6-017] | NO CERRADA: revisión detenida |
| D020 | Sí | Sí | C03–C09 | [TSK-H1-012], [TSK-H4-014], [TSK-H3-002] | NO CERRADA: revisión detenida |

El hallazgo contrasta directamente SPEC-FR-COORD-008, ARCH-DEC-007 y la reconstrucción canónica de PLAN-DEC-009. C05/C07 preservan el consumo de referencias D020: no se afirma un defecto de su algoritmo ni se dan por ejecutados cancelación, saldo o cifra final integrados. Las obligaciones globales de AC-076 y demás fuentes mantienen sus ensayos y asignaciones; un cambio interno de noche no acredita escenarios externos de Google Calendar.

## Protocolos y verificaciones pendientes

| Control | Estado de esta revisión |
|---|---|
| V-DAT / V-NEG focales | Dos pruebas parciales PASS; tercera alcanza el producto y FAIL. PostgreSQL real y rol runtime ordinario. |
| V-DOM | Comparación normativa literal dentro de la focal; no suite independiente completa ni aceptación de todos los casos. |
| V-MIG | NO EJECUTADA completa. La migración aplicada para preparar la focal no es prueba fresh/upgrade poblado/rollback/retry/preservación. |
| V-EVI | Plan/inputs/log/recibo/observación/defecto/preservación recuperables; evidencia de fallo y límites. |
| V-SM / nueva unidad V-AT | Sin filas de transición ni nueva unidad de negocio propias; no PASS global. Las guardas/coordinación aplicables pendientes no se dan por verificadas. |
| Regresión, unitarias, health, build, typecheck, lint y audit | NO EJECUTADOS por STOP; resultados históricos H5-011 separados. |

STOP: pendiente correctivo de producto autorizado y repetición independiente posterior, sin staging, commit, push, despliegue ni otras tareas.
