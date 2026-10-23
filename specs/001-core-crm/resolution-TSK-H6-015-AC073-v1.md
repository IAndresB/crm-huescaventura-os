# Resolución final focal AC-073 — N03 innecesario para el criterio

Fecha: 2026-10-22. Estado: dictamen técnico local; H6-015 IN PROGRESS. No modificación normativa, N03, S11 ni aceptación integral. Base Git: 971c55d5ce5770c71284d106d3c0deecca9514b5. N01/N02, r4 y correctivo C07 aceptados por el director en el alcance demostrado.

## Conclusión inequívoca

**N03 es INNECESARIO para satisfacer AC-073 en el ensayo local en cuarentena.** Es una ampliación opcional para una capacidad distinta: aplicar un resultado B08 cuando falta su intento original. Esa capacidad no existe hoy, continúa reservada y no se implementa. No se necesita aprobar N03 para aceptar que el sistema protege correctamente un caso todavía pendiente.

AC-073 exige suspensión hasta conciliación, ausencia de duplicados, ausencia de falsa recuperación y ausencia de objetivos inventados. No exige que toda incertidumbre desaparezca, que todo resultado externo se aplique a B08 ni que se reanuden los automatismos. La evidencia por sí sola no basta: aquí se combina con contraste trazable, cuarentena, denegaciones efectivas y suspensión persistente ya ensayadas. El resultado es **PASS LOCAL de las obligaciones de AC-073**, no conciliación de negocio completa ni permiso de reentrada.

## Fuentes exactas y razonamiento

1. **SPEC, spec.md:566, AC-073**, texto exacto: «Restauración de punto anterior a pago/envío ya ejecutado externamente; objeto privado aún ausente.» Esperado: «Automatismos sensibles suspendidos hasta conciliar efecto externo; no pago/envío duplicado ni original declarado recuperado; objetivos RPO/RTO siguen pendientes, sin cifras inventadas.» Referencias: SPEC-FR-IDEMP-002, SPEC-FR-HIST-004, SPEC-NFR-005. Ninguna exige importar un intento ausente a B08.
2. **SPEC-NFR-005, spec.md:597**: procedimiento y restauración aislada probada; «Conciliar efectos externos antes de reanudar». Architecture §15, docs/architecture.md:401, y Plan §11.3, plan.md:575, fijan la misma condición previa. Es una guarda de continuación, no una orden de resolver por inferencia hechos que no pueden acreditarse.
3. **SPEC-FR-ERR-002, spec.md:414**, ordena mantener intervención pendiente si la fuente no permite verificar o sigue ambigua. **AC-057, spec.md:545**, dice «si no verificable, sigue pendiente». Tratar esa incertidumbre protegida como fallo obligatorio de AC-073 contradiría su tratamiento expresamente previsto.
4. **Tasks, tasks.md:2463–2476**, TSK-H6-015 «Restaurar en aislamiento y conciliar antes de reanudar»: pide acta, mediciones y conciliación con dobles; salida «Integridad y conciliación verificadas, pérdidas/tiempos observados y límites documentados». Esperado: pago/envío no repetido, objeto ausente no recuperado, reservas/aprobaciones no liberadas, sesiones revocadas no revividas. No prescribe una transición B08 para todo caso. La revisión documenta qué se concilió realmente y qué discrepancias permanecen protegidas, en vez de llamar conciliado al conjunto.
5. **PLAN-C04, plan.md:294**: registro original/manual autorizado, fuente, momentos, identidad/alcance y revisión; «no confirmación por adjuntar». **PLAN-B07, plan.md:104**: evidencia/coordinación; cerrar trabajo no acredita el hecho. C04→B07 conserva la observación y su revisión, no transforma incertidumbre en éxito ni aplica negocio.
6. **PLAN-B08, plan.md:105; PLAN-C05, plan.md:295; Plan §8, plan.md:344–346**: intención, intento y resultado separados; respuesta tardía ligada al intento original. **PLAN-T08, plan.md:315**: resultado incierto conserva reserva hasta conciliar. No es lícito usar la operación result para fabricar historia perdida.
7. **HA, SPEC-FR-HA-001–005, spec.md:366–370; SM-HA-01–03, docs/state-machines.md:633–635; SM-FORB-27:742**: aprobación exacta, ejecución e incertidumbre separadas, no repetición dudosa, solo el hecho acreditado produce transición. La suspensión preserva esas garantías; el registro C04 no consume ni libera una aprobación.
8. **r4 S10, procedure-TSK-H6-014-r4.md:685–691**: clasificar ejecutado/no ejecutado/incierto/cobertura insuficiente. En :689 prescribe expresamente, si falta el intento, «conservar evidencia/revisión por C04 y mantener el efecto suspendido hasta disponer de una vía legítima». En :691 la salida es la tabla efecto→restaurado→fuente→discrepancia→decisión; la parada comprende identidad ambigua, fuente incompleta o resultado incierto **sin protección**; se mantiene el bloqueo dependiente y no se declara no-efecto. **S11:695–697** exige conciliación completa para el efecto cuya continuación se estudie, no para poder documentar el ensayo seguro.
9. Constitución P05, P06, P07, P14, P18 y P19: desconocido explícito, bloqueo de la parte dependiente, trazabilidad/historia, control de automatismos y aceptación fiel a criterios. No se cambia ningún contrato ni se amplía autoridad mediante esta interpretación.

## Acta de contraste y conciliación por alcance

Las identidades exactas de operación/parte/intento/contexto están en el testigo sintético protegido y en los registros C04→B07 auditados. No se inventan identificadores históricos ni se publican payloads privados. Referencias reproducibles: run v2 `2026-10-22T14-52-59-084Z`, campo conciliation; run C04 `2026-10-22T16-46-33.825Z`; scripts/run-h6-c04-integration.ts:63–98 y :134.

| Caso | Resultado externo | Estado restaurado y evidencia | Conciliación de negocio aplicada | Decisión protegida |
|---|---|---|---|---|
| executed | Ejecución confirmada por fuente sintética independiente | Intento presente; resultado contrastado por verificador | Sí: succeeded, replay idempotente en B08/HA | Pausado; claim denegado |
| absence-proven | Ausencia de efecto acreditada; no un mero timeout | Intento presente y prueba de ausencia | Sí: failed, replay idempotente | Pausado; no reintento autorizado |
| absent-t0-attempt | Ejecución t1 acreditada por testigo; intento posterior al corte | Cero intentos restaurados; observación y revisión persistidas mediante C04→B07 con contexto/identificadores originales | **No**. Ningún result B08 ni intento reconstruido | Suspensión y negativa de claim; futura aplicación requeriría vía contractual autorizada |
| uncertain | Resultado desconocido; evidencia insuficiente para éxito o fallo | Intento/estado uncertain conservados; observación unknown registrada como candidata | **No resultado definitivo**; incertidumbre registrada | Reserva y suspensión mantenidas; start/claim/repetición denegados |

Evidencia registrada, revisión de evidencia, contraste técnico y resultado de negocio aplicado son hechos diferentes. La tabla no declara totalmente conciliado el intento ausente. N03 tampoco resolvería por sí solo una fuente incierta: autorización normativa no es prueba del resultado.

Objeto privado ausente: estado missing y descarga denegada antes/después del contraste; nunca original recuperado. Contador externo simulado: 3 antes y 3 después; testigo C04 con hash inalterado. Los cuatro trabajos siguen pausados; B08/HA/finanzas sin cambios durante C04. Los resultados aplicados sobre intentos presentes demuestran que el ensayo no consiste únicamente en apagar servicios.

## Verificación adicional ejecutada

No hay cambio de producto ni nueva configuración. No procede repetir SQL, Auth, Storage o las baterías históricas sin cambios afectados.

- Expected focal nuevo congelado en tests/fixtures/h6-ac073-final/expected-v1.json antes de comparar. No sustituye ningún expected anterior.
- scripts/verify-h6-ac073-final.py verifica integridad de **174 payloads**: 106 de variante PG17 v2, 35 C04 R2 y 33 de auditoría independiente. Ningún archivo sellado alterado.
- Contrasta **20 controles focales ejecutados previamente** y las observaciones estructuradas: estados, intentos, pausas, contador, objeto, objetivos y ausencia de S11/N03. Es verificación de evidencia, no 20 nuevos ensayos runtime.
- **12 contrapruebas sobre copias en memoria** detectan retirada de evidencia, contacto duplicado, trabajo liberado, intento inventado, incertidumbre convertida en éxito, objeto falsamente recuperado, objetivos inventados, S11, N03, estados globales incorrectos y contador explícito de efectos distinto de cero. No modifican las evidencias reales ni simulan una nueva prueba del producto.
- Resultado focal final: verification-v4.json PASS. La primera referencia del expected apuntaba a línea 691 en vez de 689 de r4: errata explícita conservada; instrumento y resultado v1 preservados, v2 comprueba también las tres citas literales. No cambia la obligación ni oculta un FAIL del producto. La revisión independiente pidió guardas explícitas adicionales para estado de ejecución y efectos; al añadirlas, v3 produjo un FAIL instrumental porque el campo de efectos es contador entero 0, no boolean false. Se preservan FAIL e instrumento v3; adenda v3 y verificador v4 exigen entero cero estricto y añaden tres contrapruebas. No se corrigió ningún dato para pasar.
- Auditoría independiente final PASS: [audit-ac073-final-v1.md](/Users/andres/.codex/worktrees/h6-c04-audit/crm-huescaventura-os/specs/001-core-crm/audit-ac073-final-v1.md). Readback propio: 41 comprobaciones, 174 payloads intactos, 20 controles históricos y revisión de 12 contrapruebas; sin repetir runtime. El auditor rectifica expresamente su interpretación anterior. Paquete nuevo de tres payloads separado del anterior de 33, que permanece intacto.

## Rectificación de interpretación histórica y límites

Los informes bootstrap-v2/adoption-v1/C04-B07-r2 calificaron AC-073 como parcial por falta de resultado B08 del intento ausente y resolución del incierto. Tras leer el criterio exacto y su jerarquía, esa inferencia era excesiva: confundía aceptación de recuperación segura con conciliación de negocio completa y posibilidad de reentrada. Se rectifica **solo esa valoración** mediante esta adenda; no se reescriben informes, expected, resultados, FAIL, manifiestos ni dictámenes anteriores. Las limitaciones operativas descritas por ellos siguen siendo ciertas.

No se declara H6-015 COMPLETED. Este análisis focal no constituye una reevaluación de todas las asignaciones de la tarea ni aceptación integral; el director mantiene IN PROGRESS. No se afirma que S11 sea un paso obligatorio para probar AC-073: es una operación diferente y reservada. AC-074 no se vuelve a ejecutar ni se amplía su cobertura.

ARCH-PENDING-002 y DM-PENDING-005 OPEN. No garantías Production, periodicidad, recuperación completa de t0–t1 ni RPO/RTO aprobados. No reentrada, efectos reales, secretos reales, despliegue, GitHub ni Drive.

## Siguiente bloque

Puede prepararse una matriz integral de aceptación H6-015 que incorpore este dictamen sin exigir N03 como prerrequisito de AC-073, y mantenga cada pendiente y límite restante. Si se desea además aplicar un resultado sin intento en B08, N03 es una ampliación contractual separada: debe definir acto nuevo, evidencia/identidad exactas, autoridad, idempotencia, conflictos, relación con HA y conservación, sin fabricar intentos, liberar reservas ni habilitar efectos. No se propone cambiar AC-073 para permitirlo ni se implementa aquí.

STOP ante esa ampliación no aprobada, S11 o cualquier otra operación reservada; no por N01/N02 ni por una supuesta obligación de N03 para AC-073.
