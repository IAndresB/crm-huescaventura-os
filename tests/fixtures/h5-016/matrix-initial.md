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
