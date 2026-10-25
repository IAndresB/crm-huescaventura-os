# Continuidad propuesta tras H6-017: H6-002, H6-003 y H6-005

Preparación documental de 2026-10-25 sobre la base `0cd5f06d2efec9741906d4927318734451b01d4a`, árbol `8b184d1d470a3bf190dee14499369fe9c665ab3d`. No inicia ninguna de las tres tareas ni cambia Tasks, PROJECT-STATUS o NEXT-STEPS. H6 global permanece **IN PROGRESS**. El estado definitivo de H6-017 pertenece a su acta y dictamen específicos; esta recomendación no lo presupone.

Fuentes consultadas directamente: [Tasks §§4–7](tasks.md), [SPEC §9 y §§10/24](spec.md), [Plan §§7.2,9–10.1](plan.md), [D018](../../docs/DECISIONS.md), [Constitución P09/P10/P11/P16](../../docs/constitution.md). La [extracción trazable](../../tests/fixtures/h6-017/preservation/continuity-extraction-v1.json) conserva las fichas, las filas literales de §6 y los hashes de fuentes. Los antecedentes de planificación no sustituyen estos contratos.

## Dependencias, alcance y resultados exigibles

| Tarea | Dependencia formal de su ficha | Alcance y salida observable | Asignaciones literales de Tasks §6 |
|---|---|---|---|
| H6-002, E2E-02 Reserva directa | H5-019 | Administrador registra/reutiliza Opportunity → Proposal/Version y términos → Acceptance verificable → una Booking. Sin Lead, envío ni aceptación ficticios. Repetición concurrente y respuesta perdida reconocen la misma Booking; falta de aceptación suficiente permite preparación, sin alta como venta aceptada. Historia, original/rectificación y atribución conservados. | SPEC-FR-ACC-004, SPEC-FR-BOOK-002, AC-075, E2E-02, D018: **5 filas**. |
| H6-003, E2E-03 Modalidades y noches distintas | H5-019 | Una Booking: grupo10+2, rafting10, cena12, noche1=12/noche2=10; cuatro nombres opcionales de12 no duplican cantidad agregada. Cambio autorizado de una noche mantiene los demás alcances. Promoción no reduce asistentes ni deudas. | P09, E2E-03: **2 filas**. |
| H6-005, E2E-05 Fondos ajenos y servicio propio | H5-019 | Transferencia sintética → recepción → conciliación/asignación; pago sin factura, documento externo posterior y fianza resuelta si aplica. Honorarios/costes propios separados de fondos ajenos; sin factura Tararí ficticia. Cierre documental depende de todos sus hechos y los saldos/cantidades son reproducibles. | E2E-05: **1 fila**. |

Las cifras anteriores cuentan asignaciones literales, no pruebas suficientes. SPEC §9 vincula E2E-02 con AC-014–016/075; E2E-03 con AC-017–019/024/038; E2E-05 con AC-023/025–028/035–036/044–049. Cada tarea deberá desarrollar también sus guardas, casos negativos, criterios y protocolos transversales de Tasks §2.2 y Plan §10.1. La ficha y la fila E2E no permiten reducir el alcance a su nombre.

H5-019 queda autenticada como dependencia local/sintética por el [readback de las cuatro dependencias H6-017](../../tests/fixtures/h6-017/preservation/dependencies-readback-v2.json): sello aceptado, inventario gzip original, informe/matriz/sello independientes externos y sus414 payloads. El cierre H5-019 fue documental/integrador; no convierte pruebas históricas en ejecución nueva ni su antigua reserva AC-073 en fallo actual de H6-015. DM-PENDING-005 sigue abierto. Antes de ejecutar una tarea futura deberá volver a comprobarse identidad de su base, compatibilidad y autorización; el presente mandato solo autoriza esta recomendación.

## Solapamientos y orden técnico recomendado

H6-002 usa T01/T02/T03; H6-003 usa T03/T04. Ambas comparten conversión, Acceptance, Booking única, cantidades, historia y permisos. Conviene cerrar primero H6-002 y después H6-003: así se fija la cadena directa y su idempotencia antes de añadir el caso combinado de modalidades/noches. Es una recomendación técnica; **H6-002 no se añade como dependencia normativa de H6-003**.

H6-005 usa T05/T07 y puede avanzar junto a H6-002 o H6-003 con recursos propios y contratos estables. Se solapa en lectura con Booking, documentos B07, economía reservada y cierre documental; H6-017 aporta antecedentes de privacidad y prohibiciones fiscales y H6-001/004/007/016 aportan recorridos ya acreditados, sin sustituir la prueba E2E-05 ni convertirse por ello en nuevas dependencias formales.

Orden propuesto, pendiente de mandato futuro:

1. Preparar expectativas independientes de H6-002 y H6-005, cada una desde su ficha y fuentes aprobadas, y comprobar H5-019.
2. Ejecutar H6-002 y H6-005 en worktrees separados, PostgreSQL propio, identidades/sesiones/puertos/fixtures distintos y sin escrituras de recursos compartidos.
3. Ejecutar H6-003 tras fijar los contratos de T03 del candidato H6-002; puede coincidir con H6-005 si siguen estables T05/T07 y las fronteras compartidas.
4. Auditar cada candidato por separado y revisar juntos los contratos comunes antes de cualquier integración futura expresamente autorizada. Custodiar candidatos y estados documentales como sucesores aislados.

Si una corrección alcanza el mismo archivo, migración, contrato o unidad PLAN-T, serializarla y revisar conjuntamente sus efectos; no resolver la colisión escribiendo simultáneamente en un recurso común. Tasks §5.3 admite E2E H6 independientes con bases/fixtures/recursos separados y prohíbe paralelizar cambios en la misma unidad PLAN-T. Ensayos de revocación no pueden compartir cuentas, sesiones ni factores. La independencia metodológica entre agentes no es una auditoría humana externa.

## Límites preservados

Solo datos sintéticos, aplicación real y PostgreSQL aislado cuando corresponda persistencia; sin efecto bancario, comunicación ni documento fiscal real. DM-PENDING-002 y fiscalidad/tipos/mandato pendientes bloquean exclusivamente el cálculo/tratamiento dependiente; registrar recepción no crea mandato ni convierte fondos ajenos en ingreso propio. D008/P16 continúan excluyendo emisión y numeración fiscal, incluso con aprobación humana o documento externo.

DM-PENDING-005 no se sustituye por política inventada de conservación/audio/borrado. H6-015 permanece en cuarentena con cuatro trabajos suspendidos; no acceder a runtime, S11 o reentrada. No modificar candidatos sellados, fuentes normativas, checkout principal ni los estados de las tres tareas. No se autoriza commit/push/merge, Drive, despliegue o acceso real. **Estas tareas no han sido iniciadas por esta recomendación.**
