# Expected independiente TSK-H4-022/023

CONGELADO antes de producto. Base autorizada: `9355da0cd23059128b724f212e1417a08ac2e95d`. HEAD/main/origin/main coincidentes tras fetch; main, remoto IAndresB/crm-huescaventura-os, árbol limpio. Exclusivamente local/aislado. Expected históricos y 51 migraciones protegidos por hashes. No cambia el oráculo por resultado de implementación.

## Autoridad leída y límites

Tasks fichas H4-022/023, §2.2/§6/§7; Plan §§4,7.1–7.3,9,10.2; SPEC FR/AC/NFR de las28filas; SM §§2,6,7,12.1,13.3,15–18, G1–G6; Constitution P08/P09; D012 y correspondencias BR-SVC/SUP/PAX/NIGHT/CHANGE/HIST/TAR/DIM, DM-INV-006/013/017/022/036/038/040/041/047/048. Contratos C02/C03/C04/C06 y T04/T06 conservados. La copia de28filas de la base está en `tests/fixtures/h4-023/normative-rows-base.json`.
AC-058 solo preservación de finalización/pendientes; verificación integral H5-014. E2E-01 solo recorrido local disponible; H6-001 futuro. DM-PENDING-005 abierto. H4-024/H5/H6 no se preparan ni ejecutan. No hosted/Production, datos reales, audio ni efectos externos.

## Integración previa al producto

Identidad Booking/service/night/contribution ya contratada; ninguna persona ficticia ni identidad operacional paralela. B07 conserva evidencia/original y Review; hechos de prestación append-only con identidad fiable propia y versiones enlazadas, sin event-sourcing universal. Se reutilizan versiones operativas y Modification para cancelación; no segunda cancelación ni economía/Incident/aprobación nuevos.

La parte prestada se expresa sobre un alcance de servicio/noche/contribución existente y una porción cuantitativa identificada explícitamente por la fuente. Cuando sea útil un intervalo [inicio,fin), es partición de unidades homogéneas acreditada, nunca secuencia temporal ni lista de personas inferida. Fuentes que no distinguen partes solapadas no autorizan sumar. Noches independientes y nominales son referencias/detalle, nunca unidades adicionales a ocupación. Cantidades del servicio real, no del grupo. Alcance efectivo prestado y resto cancelado distinguibles incluso cuando el servicio queda Ejecutado.

Fase base real, cobertura actual y condición Incident se componen por separado. Booking read/preparation read y proyecciones ordinarias de servicio deben presentar idéntica realidad vigente. Los resultados replay permanecen snapshots históricos con identidad, no lectura vigente. Confirmaciones/Acceptance/Ganada/Modification/Incident/economía anteriores permanecen recuperables.

Autoridad V1 administrador único F1/F2, actor SHARE F06, locks de sesión/epoch exclusivos. Runtime sin CRUD; API estrecha. IA sensible solo HA exacta por TTE D039 exclusivo, final check y COMMIT sin control del caller. Sin ampliación de actores/permisos. Referencias ajenas no enumerables; originales privados y economía reservada.

Raíces existentes ordenadas antes de negocio: Opportunity → requirement → availability → confirmation → modification → preparación Booking; operación/hecho conforme a su identidad. Preparación comparte raíz actual con cambios de fundamentos; Incident mantiene raíz propia antes del lock de evaluación. Ningún registro adquiere raíz de Incident después de evaluación; se leen hechos actuales tras lock. No usar el lock del actor como prueba operacional. Alcances de Bookings independientes continúan.

Unidad T04/T06: hecho/revisión, versión/historia, resultado durable y seguimiento necesario juntos; Incident previamente acreditado y vinculado, o compuesto mediante contrato ordinario en la misma unidad si necesario. Cancelación aplica solo conjunto independiente aprobado. Sin REST sucesivo simulado ni espera humana/proveedor dentro de transacción. Rectificación exige original, evidencia, revisión y motivo; no sobrescribe ni vuelve a ejecutar. Contradicción tardía conserva ambas versiones y abre revisión localizada, sin decidir por recepción.

## Matriz normativa congelada

Cada fila se expande en positivos y retirada individual de guardas G1 identidad/actor, G2 hecho/alcance/fuente/momento/evidencia/certidumbre/vigencia, G3 HA pertinente, G4 original/historia, G5 independencia, G6 replay. Retirar una guarda no se suple con Task/fecha/dinero. Resultado: rechazo E1/E2/E3 según contrato o alcance pendiente explícito, cero efecto dependiente indebido.

|Caso|Precondición/origen|Acción/hecho acreditado y evidencia|Resultado exacto/alcance|Pendientes/efectos prohibidos|
|---|---|---|---|---|
|A / BK06|Confirmada vigente|Inicio real acreditado; fuente/responsable/momento/alcance/B07|En curso; historia antes/después|No fecha/intención como inicio; economía intacta|
|B1 / AC091/FORB07|Fechas alcanzadas; sin hecho|Consultar/evaluar o intentar prestación sin prueba|Sin inicio/Ejecutado/Finalizada|Task/agenda/aprobación/pago no prueban ejecución|
|B2 / BS07|Confirmado, cantidad real conocida|Prestación parcial acreditada|Parte prestada recuperable; resto pendiente; no todo Ejecutado|No extrapolar grupo14 a rafting10|
|C / BK07/BS08/AC063|Preparación sin confirmación completa, o Modificado|Realidad verificada; revisión humana de faltas/responsables, Incident pertinente|En curso y progreso; Ejecutado solo si completa; condición superpuesta cuando pertinente|Sin confirmación/HA retroactiva ni permiso repetir irregularidad|
|D1 / BK08|En curso; S1 prestado/S2 pendiente/S3 cancelado|Intentar finalización|Rechazo/pending S2, no Finalizada|S1/S3 conservados|
|D2 / BK08|S2 después prestado/cancelado legítimamente|Constatar totalidad resuelta, >=una parte prestada y evidencia|Finalizada|Incident/economía/documentos independientes|
|E / BK09/BS09/FORB13/AC031|S1,S2,S3; otra parte ya prestada|Petición/evaluación/aprobación exacta/aplicación inequívoca solo S1|Solo S1 cancelado; otra ejecución intacta; no toda Booking Cancelada|Petición/envío no prueba proveedor; sin Refund/Hold/liberación inferida|
|F / BS07/BS09|Parte prestada; resto cancelado legítimamente|Aplicación de cancelación independiente con prueba|Ejecutado solo alcance efectivo prestado, cancelado separado, cero resto pendiente eterno|Prohibido ocultar prestación omitiéndola en payload de Modification|
|G / cantidades|N1=12,N2=10, cuatro nominalesN1|Prestación/cancelación por noche|12/10 separados; nominales no suman; original preservado|No personas ficticias ni arrastre N2→N1|
|H / SVC009|Tararí interno|Capacidad/confirmación/preparación/ejecución por separado con responsable/evidencia|Prestación exacta interna|Sin Provider externo/factura/Suplido/pago ficticios|
|I1 / BK10/BS11|En curso o Finalizada|Dos Incident ordinarias con alcance/impacto y gravedad independiente|Misma fase +condición; ambas referencias|Sin alterar Refund/economía ni fase por gravedad|
|I2 / BK11/BS11|Dos impactos vigentes|Resolver una con evidencia|Conserva impacto de otra|Sin quitar condición por resolver solo una|
|I3 / BK11|Resolver todas; confirmación invalidada|Consultar realidad y cobertura|Retira solo condición resuelta; fase real conservada; cobertura no restaurada|No confirmar/cerrar/pagar por Incident Resuelta|
|J / AC058|Finalizada; factura/fianza/Refund pendientes|Consultar/evaluación económica|Finalizada conservada; pendientes económicos idénticos|H5 cierres no implementados|
|K / F23|Cancelada/En curso/Finalizada|Preparación/evaluación/replay/HA/excepción económica/pérdida cobertura|Nuevo efecto preparación rechazado; replay resultado previo identificado; lectura fase real|No reactivación ni retroceso a preparación|
|L1 / HIST/NFR009|Hecho registrado; recepción tardía contradice|Registrar nueva evidencia/revisión localizada|Original/revisión recuperables; no orden recepción como precedencia|No sobrescritura ni suma automática de contradictorios|
|L2 / rectificación|Original identificado; evidencia/revisión humana|Rectificación enlazada de hecho|Antes/después/versiones conservados, corrección no nueva ejecución|Sin borrar historia ni reactivar terminal por vía ordinaria|
|M / guardas|Cada transición positiva|Retirar una a una hecho, alcance, fuente/responsable, evidencia, momento, revisión humana, aprobación aplicable y G1–G6|Sin efecto indebido, rechazo o pending localizado|No weakening/aserción tautológica ni helper producto como oráculo|

## Concurrencia: expected previo en ambos órdenes y solapamiento real

Dos sesiones PostgreSQL/PID/xid distintos y sesiones F2 válidas del mismo administrador, ambas admitidas antes de negocio; observación roots/locks/blocking chain. Cada ensayo hace ambos órdenes.

|Intercalación|Expected de orden1 / orden2|
|---|---|
|Mismo hecho equivalente|Un hecho/historia/seguimiento; segundo recupera resultado / simétrico|
|Misma clave material distinto|Primero válido; segundo E2 / simétrico|
|Partes disjuntas|Ambas tras relectura/versiones actuales; nunca pérdida / simétrico|
|Partes solapadas|No doble cómputo; conflicto/revisión localizada del segundo / simétrico|
|Prestación vs cancelación mismo alcance|Prestación primero obliga preservar parte y cancelar solo resto legítimo; cancelación primero no autoriza registro ordinario contradictorio, exige realidad sobrevenida revisada / ambos originales preservados|
|Finalización vs pendiente/cambio|Pendiente impide finalizar; cambio primero se ve; finalización primero se conserva ante reevaluación, nuevo compromiso/corrección requiere proceso propio|
|Inicio vs pérdida confirmación/requisito|Pérdida primero impide inicio normal, permite solo excepcional revisado; inicio primero preserva En curso y faltas actuales|
|Sobrevenida vs aprobación/cambio|No aprobación retrospectiva; cambio visto exige alcance/revisión actuales; HA material obsoleta no aplicable|
|Preparación vs inicio/final/cancel|Preparación primero luego hecho cambia fase; realidad primero preparación rechazada; replay no reejecuta|
|Incident/resolución vs realidad|Fase real intacta; condición depende de todas las incidencias vigentes, no de orden recibido; raíz compartida protege lectura|

## Atomicidad, instalación y verificación definitivas pendientes

Inyectar fallos antes/entre hecho, historia, resultado, seguimiento y COMMIT: rollback completo y aprobación no consumida parcialmente. Respuesta perdida tras COMMIT real: resultado recuperable tras reautorizar, sin nuevo efecto. V-MIG fresh52 y upgrade51poblado, errorDDL/rollback/retry, catálogo/OID/firmas/owners/ACL/config/policies/triggers/roles y originales privados/datos/versiones preservados. Cuerpos adaptados se declaran explícitamente; no afirmar igualdad de cuerpos cambiados.

Verificador independiente usa APIs reales H2/H3/H4 con sintéticos, solo observación/instalación/inyección privilegiadas. Matriz28filas con trazas A–M y guardas. Fxx conserva FAIL/repro/cause/fix/retest, estático separado. Capturas completas comandos/argumentos/SHA/árbol/versiones/tiempos/stdout/stderr/status/error/signal/counts, gzip sin pérdida y hashes; ausentes declarados. Congelar producto/verificador antes de gates en SHA exacto: frozen/type/lint/build/audit/PG completo/unit138/health1 separado/V-MIG/advisorsloopback/diff.2105PGprevios conservados; focales no se suman doble. Cierre solo cero defectos materiales abiertos y cero FAIL/skipped/cancelled materiales; posterior commit exclusivamente evidencia/coordinación; push sin force y fetch refs iguales/árbol limpio. STOP después H4-023; H4 IN PROGRESS, H4-024/H5/H6 NOT STARTED.
