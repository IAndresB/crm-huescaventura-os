# H5-012-F03 — Correctivo local y nuevas evidencias

2026-10-15. **Corregido y verificado localmente; pendiente de revisión humana.** El FAIL original del [dictamen](audit-TSK-H5-012.md) y sus sondas siguen íntegros.

## Causa confirmada

`b04_current_nights` resuelve `night_date` mediante `modification_scope`, pero devuelve el tipo histórico `b04_nights`, que carece de revisión y cancelación. La lectura60 incluye esas filas y el compositor las conserva con certeza verificada. Una cancelación aprobada y aplicada crea la versión canónica de noche, pero no cambia esa fila proyectada. La Task genérica de modificación no identifica ni representa el estado de la noche. No se reabrió la investigación ya acreditada: se contrastó esa cadena con las migraciones, el compositor y el FAIL original.

## Correctivo mínimo

La nueva migración61 `20261015190418_h5_calendar_night_operational_state.sql` reemplaza exclusivamente el cuerpo de `crm_api.h5_projection_read`. En la rama interna de calendario conserva la fila de `b04_current_nights` y añade:

- `operational`: estado completo de la noche leído por la fuente existente `crm_private.modification_scope` (id, revisión, fecha, cancelación).
- `service_operational` y `booking_operational`: id, revisión y cancelación canónicos de cada ámbito superior.
- `operational_source`: procedencia explícita de dichos estados.

Cada lectura se limita a las raíces autorizadas y a `admin_scope`. Los ámbitos siguen separados: cancelar un servicio no inventa una versión cancelada de cada noche. La fila sí muestra explícitamente la cancelación del servicio. No hay nueva tabla, vista, caché, fuente de verdad o regla de propagación. El compositor F01/F02 ya conserva estos datos; no requiere otra edición. La rama externa, autorización F1/F2 inicial/final, owner, ACL y search_path permanecen iguales.

La vista original, los snapshots aceptados y todas las versiones anteriores permanecen intactos. No se modifican migraciones59/60, D020 ni contratos de modificación/cancelación. [Diff exacto60→61](../../tests/fixtures/h5-012/f03-20261015/migration60-to61.diff).

## Pruebas posteriores

Cuatro pruebas F03 en PostgreSQL real y Storage oficial loopback:

1. La aserción original de auditoría pasa y se refuerza: `operational.cancelled=true`, revisión2, historia conservada, hermana idéntica, minimización y rechazo sin autoridad. Antes de aplicar, la aprobación no altera la noche.
2. Cancelación de servicio: cada noche refleja `service_operational.cancelled=true`, conservando su estado propio y la fecha histórica. Otro Booking idéntico.
3. Cancelación de Booking: sus servicios se cancelan antes por el contrato existente; cada noche muestra la cancelación de Booking. Otro Booking idéntico.
4. Fecha20→23 seguida de cancelación: fecha vigente23, revisión3 cancelada, revisión2 no cancelada, original20 y hermana21 conservados.

F01 y F02 se ejecutan de nuevo sobre61. V-MIG60→61 verifica rollback por fallo inyectado, retry, reaplicación y conservación de datos de170 tablas; metadatos de284 funciones, roles, esquemas, ACL/RLS y políticas, con único cambio de cuerpo en la función objetivo. Seguridad/advisors sin hallazgos. No se usa el PASS anterior para acreditar61.

## C03/C05/C06

- C03 crea y proyecta una Task real de cifra final configurada a siete días. No vence durante el día13 y sí el14. La lectura no confirma cantidades estimadas.
- C05 vincula cuatro referencias a Booking/modalidad/servicio/noche reales. Las fechas20/22/20/23 de noviembre y las fuentes aceptadas se comprueban en registros, proyección y lectura autorizada de Tasks. Cambiar la configuración de una noche no propaga a los otros alcances ni a otro Booking.
- C06 conserva un contrato válido25/11 y persiste una sugerencia28/11 con certeza candidate en el contexto requerido. El intento obtiene exactamente `OBLIGATION_AUTHORIZED_EVIDENCE_REQUIRED`; la sugerencia permanece pendiente y la revisión válida queda idéntica.

No se demostró otro defecto del producto. Se corrigió una incidencia de tipado de la prueba nueva (`created` sin tipo de array), conservando el FAIL de typecheck. El primer negativo C06 se fortaleció para usar el contexto de oportunidad que exige el contrato y exigir el código exacto de rechazo: el PASS preliminar no sustituye esta evidencia final. No se debilitó ninguna aserción original.

[Log focal final](../../tests/fixtures/h5-012/f03-20261015/final-focal.log), [fuentes anteriores de pruebas nuevas](../../tests/fixtures/h5-012/f03-20261015/source-check/), [informe y límites](review-TSK-H5-012-candidate61.md).
