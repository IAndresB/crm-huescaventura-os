# TSK-H5-012 — Contraste independiente de casos y filas

2026-10-15. **Dictamen general FAIL por H5-012-F03.** Esta auditoría es un registro posterior; no modifica la matriz ni las evidencias de la ejecución anterior.

Los 41 PASS ejecutables anteriores se verificaron individualmente en el log final y contra sus hashes. Un resultado de ejecución no prueba por sí solo toda la obligación de una fila. El contraste encuentra 36 casos sin hallazgo en las aserciones revisadas, dos afectados por F03 y tres con cobertura parcial. No se relabelan los logs originales.

## Contraste de 41 casos

| Caso | Ejecución anterior | Auditoría | Aserciones y alcance comprobado |
|---|---|---|---|
| H01 | PASS | PASS de aserciones revisadas | IDs de Booking, versión, Acceptance, propuesta, originales e historia; lectura sin mutación. |
| H02 | PASS | PASS de aserciones revisadas | Momentos de hecho y registro separados; momento desconocido conserva null. |
| H03 | PASS | PASS de aserciones revisadas | Aceptación telefónica, términos, verificación y rectificación recuperables. |
| H04 | PASS | PASS de aserciones revisadas | Original/derivado y actor; suplemento sigue la aprobación y el ejecutor automático por lectura autorizada. |
| H05 | PASS | PASS de aserciones revisadas | Bytes de Storage reales, objeto preparado incompleto y denegación sin autoridad. |
| H06 | PASS | PASS de aserciones revisadas | Archivo excluido de vista normal y recuperación con historia, sin cierre implícito. |
| H07 | PASS | PASS de aserciones revisadas | Restauración/fusión humana; dos identidades y Bookings conservados. |
| H08 | PASS | PASS de aserciones revisadas | Cancelación del Booking y códigos distintos conservados. No cubre la representación de noche cancelada descubierta en F03. |
| C01 | PASS | FAIL F03 | FAIL F03: una noche cancelada por versión operacional vigente sigue igual en calendario; Task genérica no representa su estado. |
| C02 | PASS | FAIL F03 | FAIL F03: releer tras cambio canónico no reconstruye el estado cancelado de la noche. Paginación y binding sí cuentan con pruebas. |
| C03 | PASS | BLOCKED parcial | Evidencia parcial: saldo y límites 13/14 probados; no se crea/proyecta la Task de cifra final configurada a siete días en esta prueba. |
| C04 | PASS | PASS de aserciones revisadas | Ocho determinaciones nativas: inicio/final de 13,14,17,18; intervalos y retenciones literales. |
| C05 | PASS | BLOCKED parcial | Evidencia parcial: servicios nativos 20/22 y helpers con referencias global/modalidad/servicio/noche construidas en el test; no vincula las cuatro referencias proyectadas ni la cifra final específica a registros reales. F01 sí cubre noche20→23. |
| C06 | PASS | BLOCKED parcial | Evidencia parcial: referencia contractual válida proyectada; el negativo usa projectCivilReference(null), sin registro sugerido/no verificado que compita con el canónico. |
| C07 | PASS | PASS de aserciones revisadas | Modificación real de hora y fecha, versiones históricas, límites civiles y horario externo; F01/F02 complementan noche y vencimiento. |
| C08 | PASS | PASS de aserciones revisadas | Schedule/deadline desconocidos, cálculo null y Booking independiente; zona ficticia rechazada. |
| C09 | PASS | PASS de aserciones revisadas | Señal crítica en revisión; calendario sin cambio automático ni autoridad de escritura. |
| C10 | PASS | PASS de aserciones revisadas | Eco real correlacionado con ejecución y evento antiguo; repetición no altera efecto ni fecha. |
| C11 | PASS | PASS de aserciones revisadas | Doble indisponible/sustituido y lectura Core/objeto original disponible; sin atribuir disponibilidad al proveedor real. |
| C12 | PASS | PASS de aserciones revisadas | Discrepancia Avaibook en revisión y solicitudes de escritura prohibidas. |
| S01 | PASS | PASS de aserciones revisadas | Economía interna disponible; salida para cliente elimina economía y Booking ajeno. |
| S02 | PASS | PASS de aserciones revisadas | Query externa: tres destinatarios, lista de campos permitidos y marcadores excluidos antes de búsqueda. |
| S03 | PASS | PASS de aserciones revisadas | Search externa: tres destinatarios, mismos controles de minimización efectivos. |
| S04 | PASS | PASS de aserciones revisadas | Export externa: tres destinatarios, mismos controles de minimización efectivos. |
| S05 | PASS | PASS de aserciones revisadas | Document externa: tres destinatarios, mismos controles de minimización efectivos. |
| S06 | PASS | PASS de aserciones revisadas | Timeline externo: tres destinatarios, sin originales ni derivados reservados. |
| S07 | PASS | PASS de aserciones revisadas | Contexto IA externo: tres destinatarios, lista mínima y ausencia de marcadores. |
| S08 | PASS | PASS de aserciones revisadas | PACK literal120/10,180/8; fijo900 interno sin prorrateo ni nueva regla. |
| S09 | PASS | PASS de aserciones revisadas | Parámetros de audio/consentimiento/retención/borrado no autorizan efecto; bytes originales conservados. |
| S10 | PASS | PASS de aserciones revisadas | Factura externa mantiene referencia de proveedor; emisión/numeración no admitidas. Solo límite local. |
| S11 | PASS | PASS de aserciones revisadas | Operaciones e historia; suplemento sigue receipt→ejecución autorizada sin convertir contacto en entrega. |
| S12 | PASS | PASS de aserciones revisadas | IDs y marcadores no revelados por denegación; original exige autoridad. |
| A01 | PASS | PASS de aserciones revisadas | Superficies rechazan identidad sin sesión/contexto válido y admiten control positivo. |
| A02 | PASS | PASS de aserciones revisadas | Sobres reales: MAC, raíz, destino, scope y replay transaccional rechazados. |
| A03 | PASS | PASS de aserciones revisadas | Revocación real de sesión y actor deshabilitado; lectura/objeto denegados. |
| A04 | PASS | PASS de aserciones revisadas | Relación de cliente/proveedor y rol futuro no conceden acceso. |
| A05 | PASS | PASS de aserciones revisadas | Original compartido conserva un vínculo por contexto; binding y finalidad de objeto no se amplían. |
| A06 | PASS | PASS de aserciones revisadas | Dos sesiones y conexión reutilizada; finalidad externa no hereda resultado interno y revocación deniega. |
| A07 | PASS | PASS de aserciones revisadas | Origen externo/público e IDs no autentican Core; SQL sin sobre denegado. |
| A08 | PASS | PASS de aserciones revisadas | SELECT/DML ordinario denegado; control60 añade vistas/revisiones, ACL/RLS y advisors. |
| A09 | PASS | PASS de aserciones revisadas | Polling/falsa interacción no renuevan sesión; salida carece de autoridad de mutación. |

Las lagunas C03/C05/C06 son insuficiencias de evidencia, no demostraciones de error en D020. Las regresiones históricas validan sus respectivos módulos y etapas; no sustituyen automáticamente su consumo por la proyección60. No se repitieron baterías completas ni se corrigieron pruebas anteriores.

## Contraste de 34 filas

Las asignaciones se extrajeron de nuevo del expected y se contrastaron con las 34 filas literales de Tasks: **28 verificaciones propias y seis límites locales**. Las filas marcadas FAIL no autorizan cerrar su obligación; BLOCKED indica cobertura incompleta, no cambio normativo demostrado.

| Fila | Asignación de verificación H5-012 | Casos | Dictamen local de auditoría |
|---|---|---|---|
| SPEC-FR-HIST-006 | Propia | H01–H08, S06, A05 | Sin hallazgo en las aserciones revisadas |
| SPEC-FR-COORD-008 | Propia | C01–C10, A09 | FAIL F03 |
| SPEC-FR-SEC-003 | Propia | S01–S08 | Sin hallazgo en las aserciones revisadas |
| SPEC-FR-SEC-006 | Propia | H05, S02–S09, A05 | Sin hallazgo en las aserciones revisadas |
| SPEC-FR-SEC-007 | Solo límite local | S10 (límite local) | PASS del límite local |
| SPEC-FR-INT-005 | Propia | C09–C11, A07 | Sin hallazgo en las aserciones revisadas |
| AC-062 | Propia | H06–H08 | Sin hallazgo en las aserciones revisadas |
| AC-065 | Propia | S02–S08 | Sin hallazgo en las aserciones revisadas |
| AC-075 | Propia | H03 | Sin hallazgo en las aserciones revisadas |
| AC-076 | Propia | C03–C10 | BLOCKED cobertura parcial |
| AC-081 | Solo límite local | S11–S12 (límite local) | PASS del límite local |
| SPEC-NFR-001 | Propia | H01–H04 | Sin hallazgo en las aserciones revisadas |
| SPEC-NFR-003 | Solo límite local | H05, S02–S09 (límite local) | PASS del límite local |
| SPEC-NFR-011 | Propia | C11 | Sin hallazgo en las aserciones revisadas |
| DM-INV-025 | Solo límite local | S08 (límite local) | PASS del límite local |
| DM-INV-047 | Propia | H02–H04, S11 | Sin hallazgo en las aserciones revisadas |
| DM-INV-049 | Propia | C09–C12 | Sin hallazgo en las aserciones revisadas |
| DM-INV-050 | Solo límite local | S01, A04 (límite local) | PASS del límite local |
| DM-INV-051 | Propia | H06–H08 | Sin hallazgo en las aserciones revisadas |
| SM-FORB-28 | Propia | C09–C12 | Sin hallazgo en las aserciones revisadas |
| SM-FORB-29 | Solo límite local | S06, A04–A07 (límite local) | PASS del límite local |
| SM-FORB-32 | Propia | H06–H08 | Sin hallazgo en las aserciones revisadas |
| ARCH-DEC-007 | Propia | C01, C09–C10 | FAIL F03 |
| ARCH-DEC-008 | Propia | C11, A07 | Sin hallazgo en las aserciones revisadas |
| ARCH-DEC-016 | Propia | H01–H04 | Sin hallazgo en las aserciones revisadas |
| P10 | Propia | S02–S09, S12, A01–A09 | Sin hallazgo en las aserciones revisadas |
| P11 | Propia | S01–S08 | Sin hallazgo en las aserciones revisadas |
| PLAN-DEC-009 | Propia | C02, A06 | FAIL F03 |
| PLAN-B07 | Propia | H01–H05, C01 | FAIL F03 |
| PLAN-C01 | Propia | C02, S01, A01–A09 | Sin hallazgo en las aserciones revisadas |
| PT-05 | Propia | C03–C07 (consumo D020, sin ampliar H4) | BLOCKED cobertura parcial |
| PT-08 | Propia | C01, C08–C10 (consulta, sin ampliar otros bloques) | FAIL F03 |
| G1 | Propia | A01–A09 | Sin hallazgo en las aserciones revisadas |
| D020 | Propia | C03–C09 | BLOCKED cobertura parcial |

Ningún límite local cierra tareas globales ajenas. [Dictamen y defecto](audit-TSK-H5-012.md). [Contraste estructurado](../../tests/fixtures/h5-012/audit-20261015/case-review.json). [Fuentes y asignaciones literales](../../tests/fixtures/h5-012/audit-20261015/normative-assignment-check.json).
