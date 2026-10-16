# H5-016 — Matriz independiente previa a contrapruebas

Base `ff0ad6c6e505914f31eb15d56725179c9f065426`; candidato original58/453 identificado sin diferencias antes de escribir. Autorización exclusivamente local/sintética. El snapshot original se conserva separado. Esta matriz parte de los contratos y no del resultado esperado de H5-015.

| ID | Fuente / invariante | Intento de falsación y evidencia exigida |
|---|---|---|
| A01 | SM-CL-04, CLOSE-003, DM-INV-041/042, AC-059/060 | Aceptación solo con tres evaluaciones actuales y guarda crítica; JSON null, campos ausentes, arrays vacíos, revisiones obsoletas. No cierre por arrastre. |
| A02 | SM-CL-03/05, CLOSE-004, AC-061, P07 | Cada fundamento realmente leído debe tener raíz y invalidación o ser inmutable/inaccesible. Derivar relaciones desde consultas y comandos; no deducir cobertura del número de triggers. |
| A03 | T10, C03/C06, CONC-002, ARCH-DEC-014, PLAN-DEC-004 | Pausar después de leer fundamentos y antes de escribir; escritor debe esperar o cierre perder. Pago/factura/Refund/fianza/crítica/documento/obligación/servicio/cancelación. Inspeccionar estado e historia, no solo promesas. |
| A04 | SM-CL-03/05, P06/P07, HIST-006, AC-062 | Reapertura fundada, repetición, nuevo cambio concurrente, corrección y recierre. Firma temporal, identidad/evidencia y estado anterior conservados; cero cambios económicos colaterales. |
| A05 | C01/C03, G1–G6, P10/P11, V-DAT | Rechazo sin contexto, falsificación, actor/sesión revocados y replay reautorizado; permisos directos, SECURITY DEFINER y FORCE RLS; evidencia de otro actor/raíz. |
| A06 | P13, V-MIG, C03 | Fresh63 y upgrade62 con datos; fallo de migración y retry; catálogo/ACL/identidades/datos anteriores, constraints e índices. |
| A07 | CONC-002, E2, T10 | Identidad compartida entre Bookings, dos cierres incompatibles y replay; sin efectos parciales ni deadlocks evitables; reservas independientes progresan. |
| A08 | SM-CL-03, P05, C06 | No invalidar por cambios no materiales ni Booking ajena; INSERT/UPDATE/DELETE, referencias reasignadas y fuentes compartidas conforme a mutabilidad real. |
| A09 | P18/P19, V-EVI | Investigar los16 FAIL originales, preservar pruebas/oráculos, ejecución completa final limpia si viable; diferenciar versiones, retests y consolidado. |

Las asignaciones exactas de Tasks §6 se conservan en `tests/fixtures/h5-016/normative-assignments.txt`. Dependencias H4-024/H5-015; contratos B06/B04/B05/B07, C01/C02/C03/C06, T10. V-DOM/V-DAT/V-MIG/V-AT/V-SM/V-NEG son obligatorios en su alcance. H6 y publicación no quedan autorizados. Las pruebas con estado sintético dañado se distinguirán de comandos ordinarios alcanzables, sin atribuir accesos de migración a usuarios normales.

## Correspondencia de las32 filas asignadas

| Fila aprobada | Contraste independiente / límite |
|---|---|
| SPEC-FR-CLOSE-002 | A01/A03/A04 |
| SPEC-FR-CLOSE-003 | A01/A03/A05 |
| SPEC-FR-CLOSE-004 | A02/A03/A04/A08 |
| SPEC-FR-HIST-006 | A04/A05/A08 |
| SPEC-FR-CONC-002 | A03/A07 |
| AC-046 | A02/A03; límite de venta externa integral declarado |
| AC-059 | A01/A04 |
| AC-060 | A01/A03 |
| AC-061 | A03/A04 |
| AC-062 | A04/A08; no se implementa fusión de Bookings |
| SPEC-NFR-007 | A03/A07 |
| SPEC-NFR-012 | A04/A06 |
| DM-INV-041 | A01/A04 |
| DM-INV-042 | A01/A03 |
| SM-CL-03 | A02/A04/A08 |
| SM-CL-04 | A01/A03/A05 |
| SM-CL-05 | A03/A04 |
| SM-FORB-23 | A01; focal H5-015 y evaluadores sobre63 |
| SM-FORB-24 | A01/A04; focal H5-015 y evaluadores sobre63 |
| ARCH-DEC-014 | A03/A07 |
| P07 | A04/A06 |
| PLAN-DEC-004 | A03/A07 |
| PLAN-B06 | A01–A08 |
| PLAN-C02 | A01 |
| PLAN-C03 | A03/A05/A06/A07 |
| PLAN-C06 | A01/A02/A04/A08 |
| PLAN-T10 | A02/A03/A04/A07 |
| PT-06 | A03/A04; tramos locales, no H6 |
| PT-10 | A01–A08 |
| G5 | A03/A05/A07 |
| E2 | A01/A07 |
| D012 | A01/A04; regresión de kernel, no cierre por arrastre |

## Resultados del candidato corregido

37 contrapruebas nuevas:19 de suficiencia/dependencias/historia,13 de concurrencia y5 de seguridad/migración. Focal conjunta78/78 y regresión de evaluadores sobre63 66/66 PASS. Los seis negativos materiales F01 y la reproducción original de cierre incorrecto se conservan separados. El resultado de regresión completa, inputs456 y dictamen se remiten al informe H5-016; no se infieren de esta tabla.
