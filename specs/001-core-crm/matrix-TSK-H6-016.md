# Matriz normativa TSK-H6-016

Evaluación técnica: PASS local/aislado; las 25 asignaciones y T01–T11 están contrastadas por el auditor. El acto de aceptación permanece condicionado a la custodia y se añade en una envoltura posterior sin reescribir esta capa. Fuentes directas: Tasks, SPEC §18/§19, Architecture ARCH-DEC-014, Plan §§7.1/7.2/10.1, Constitución, decisiones D018/D019/D020/D032/D037–D039 y máquinas de estado G6. El expected del ejecutor quedó congelado antes del código (`bfab0ddb…`); el auditor conserva su expected propio anterior a la réplica.

Hay 25 asignaciones directas en la columna de verificación de Tasks. Se preservan literalmente en `tests/fixtures/h6-016/expected-v1.json`; no son once tareas nuevas ni autorizan cambios normativos.

| Unidad | Evidencia ejecutable prevista y observada | Límite |
|---|---|---|
| T01 | T01-R0, T01-R1, T01-F0, T01-F1, T01-F2, T01-L, T01-N, T01-Fpre, T01-N2, T01-Lwire; X01 ambos órdenes; X02 vía directa | Contrato y unidad reales; sin negocio externo |
| T02 | T02-R0, T02-R1, T02-F0, T02-F1, T02-F2, T02-L, T02-N, T02-Fpre, T02-N2, T02-Lwire; X01 ambos órdenes; X02 vía directa | Contrato y unidad reales; sin negocio externo |
| T03 | T03-R0, T03-R1, T03-F0, T03-F1, T03-F2, T03-L, T03-N, T03-Fpre, T03-N2, T03-Lwire; X02 todos los hechos reales de T01/T02/T03 | Contrato y unidad reales; sin negocio externo |
| T04 | T04-R0, T04-R1, T04-F0, T04-F1, T04-F2, T04-L, T04-N, T04-Fpre, T04-N2, T04-Lwire; X05 servicio no afectado; contraprueba independiente de noche/confirmación | Contrato y unidad reales; sin negocio externo |
| T05 | T05-R0, T05-R1, T05-F0, T05-F1, T05-F2, T05-L, T05-N, T05-Fpre, T05-N2, T05-Lwire; X03 ambos órdenes Allocation80/Refund80 sobre recepción100 sin hijos | Contrato y unidad reales; sin negocio externo |
| T06 | T06-R0, T06-R1, T06-F0, T06-F1, T06-F2, T06-L, T06-N, T06-Fpre, T06-N2, T06-Lwire; X05 base pendiente D019 y atribución; X06 ajuste de obligación atómico | Contrato y unidad reales; sin negocio externo |
| T07 | T07-R0, T07-R1, T07-F0, T07-F1, T07-F2, T07-L, T07-N, T07-Fpre, T07-N2, T07-Lwire; X04 Deposit/Refund misma salida; suplemento Provider Payment | Contrato y unidad reales; sin negocio externo |
| T08 | work W28/W29/W30/W45/W47, replay autorizado y final check D039 | Contrato y unidad reales; sin negocio externo |
| T09 | work claim/generación/lease; events recepción/dedupe; pool y permisos | Contrato y unidad reales; sin negocio externo |
| T10 | T10-R0, T10-R1, T10-F0, T10-F1, T10-F2, T10-L, T10-N, T10-Fpre, T10-N2, T10-Lwire; X07 factura/corrección/Refund/Incident/pago, ambos órdenes; antecedente E2E-07 | Contrato y unidad reales; sin negocio externo |
| T11 | T11-R0, T11-R1, T11-F0, T11-F1, T11-F2, T11-L, T11-N, T11-Fpre, T11-N2, T11-Lwire; X08 identidades y Bookings distintas; códigos y pool independientes | Contrato y unidad reales; sin negocio externo |

Las 25 asignaciones son: SPEC-FR-CONC-001, SPEC-FR-CONC-002, SPEC-FR-CONC-003, AC-067, AC-068, SPEC-NFR-007, ARCH-DEC-014, PLAN-DEC-004, PLAN-DEC-008, PLAN-B10, PLAN-C03, PLAN-T01, PLAN-T02, PLAN-T03, PLAN-T04, PLAN-T05, PLAN-T06, PLAN-T07, PLAN-T08, PLAN-T09, PLAN-T10, PLAN-T11, PT-12, G6, E2.

SPEC-FR-CONC-001/002/003, AC-067/068, SPEC-NFR-007, ARCH-DEC-014, PLAN-DEC-004 y PLAN-C03 se contrastan con los órdenes reales observados, snapshots antes/después y fallos/replay por unidad. PLAN-DEC-008 y PLAN-B10 añaden conservación de evidencias, recuperabilidad y límites de cobertura; PT-12, G6 y E2 añaden rechazo de conflictos sin efectos parciales, trazabilidad y recuperación. Las obligaciones transversales de permisos, historia, alcance, D019/D020 y D039 permanecen aplicables.

La referencia de la ficha a «matriz §6.5» se conserva en su original. Las unidades concretas verificadas se enumeran en Tasks §6.7 y Plan §7.2; no se corrige una fuente normativa sellada.

D039 se evalúa en el orden aprobado `SET CONSTRAINTS ALL IMMEDIATE → finalizadores → COMMIT`, bajo TTE, sin devolución de control del solicitante. El vencimiento durante esperas debe rechazar en el control final. No se promete que el commit durable termine físicamente antes de expiry. Los límites Fpre de unidades ordinarias usan una envoltura test-only de BEGIN y no una API SQL abierta del TTE.

T10: el caso externo de factura acredita bloqueo sobre una Booking aún pendiente; no se presenta como cierre conjunto válido externo. Los cierres válidos internos usan ejecución excepcional revisada ya aprobada, no una acreditación nueva del recorrido ordinario de ejecución.

Las seis dependencias son H5-019, H6-013, H6-001, H6-004, H6-006 y H6-007. Las cinco primeras cuentan con actas en la base publicada; H6-007 está satisfecha localmente en su candidato `4aeb3d83…`, no publicada. Ambos manifiestos H7 se verificaron íntegramente (138 y 455 archivos). Solo se derivan instrumentos identificados, sin integración implícita de su expediente.

Exclusiones: H6-015 runtime/S11/cuatro trabajos, restauración de cuarentena, Production/Hosted, datos o efectos reales, publicación Git/Drive, cambios normativos o de seguridad. PT-12 no autoriza reentrada en H6-015. H6 global permanece IN PROGRESS.

Auditoría final: 138 repeticiones del candidato y 8 contrapruebas propias PASS. Q04 acredita una noche confirmada y conservación de dos noches/dos servicios ajenos; Q08 códigos no vacíos/no reutilizados y backend físico del pool con guardas actuales. El dictamen conserva los 3 FAIL propios y sus sucesores. Matriz independiente y catálogo literal enlazados en la cápsula de auditoría. No hay una única corrida independiente de146 ni auditoría humana externa.
