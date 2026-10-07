# Expected independiente TSK-H4-024 — salida de H4

CONGELADO antes del verificador. Base exacta `cfa635f87354bea7fd090a6890995b05130ad671`; remoto IAndresB/crm-huescaventura-os; main; fetch y árbol limpio; HEAD/main/origin/main coincidentes y divergencia0/0. Autorización exclusiva de documentación/evidencia H4-024, commits lineales y publicación. Cero ampliación de producto, permisos o migraciones.

## Fuentes y correspondencias

Leídos Tasks §§2.1–2.3/§3, ficha H4-024, §6 y §7; Plan §§5.2/7.2/9–10; SPEC §§9/11/criterios, SM §§6–8/11–13/16–18, DM §§5.2/9–11/14 y BR §§9–13/16/20/27; DECISIONS D012/D015/D019/D020/D023/D028/D029/D037/D038/D039. Dependencias H3-015 y H4-001–023, incluidos correctivos. B04/B05/B06/B07/B08/B10; C01–C06; T04/T05/T06/T07/T08.

No hay filas exclusivas de H4-024 en Tasks §6. La consolidación deriva de su ficha, Plan §9 y las correspondencias auténticas de las dependencias, congeladas literalmente en `tests/fixtures/h4-024/normative-dependency-rows.json`. No añade filas normativas ni satisface por arrastre todas las verificaciones futuras de una fuente global. Los IDs Oxx son casos de evidencia, no reglas nuevas.

## Matriz literal previa

|Caso|Fundamento|Recorrido/alcance sintético|Expected literal|
|---|---|---|---|
|O01|SM-DO-01–05; SPEC-FR-DOC; SM-FORB-20|Requisito imprescindible S1; documento recibido sin revisión|S1 pendiente; S2 independiente; solo revisión expresa satisface|
|O02|SM-IN-01–06; SM-BK-10/11; SM-BS-11|Dos Incident y resolución localizada|Fase conservada; resolver una conserva otra; no restaura confirmación|
|O03|SM-AV-01–04; AC-020; DM-INV-018–023|Disponibilidad12 y petición16 u otro alcance|12 no cubre16; sin Hold/confirmación/preparación/ejecución inferidos|
|O04|SM-HO-01–07; AC-021; SM-FORB-12|Hold, liberación y conversión|Identidad conservada; porciones/localidad; Hold no confirma ni ejecuta|
|O05|SM-PC-01–03; AC-018/019/020|Confirmación con requisitos/capacidad vigentes|Solo cobertura exacta; dato recibido no revisado mantiene S1 pendiente|
|O06|SM-RV-01–04; SM-MO-01–10; T04/T06|Cambio/revalidación y proveedor/variante vigentes|Únicamente dependencias afectadas; before/desired independientes; A→B/V1→V2|
|O07|D019/D020; SM-RF-02; AC-040/041/042|Base o referencia civil desconocida y cancelación operativa|Efecto económico dependiente pendiente; resto operativo legítimo continúa; no cero|
|O08|PM-04; D023; Plan §5.2.2|100,01 ×50%|Derecho50,01; retención50,00|
|O09|PM-05; D023; DM-INV-039|Tres participaciones100,01 al50%|Derecho150,03; retención150,00; sin nominal obligatorio|
|O10|PM-06; SM-RF-04; D023|Derecho50,01; salida20,00; segunda30,01|Ejecutado20,00/pendiente30,01; ejecutado50,01/pendiente0,00|
|O11|PM-07; D019; SM-FORB-26|Precio fijo/grupal900,00 y cambio de asistentes|900,00 conservado; sin división ni derecho ficticio|
|O12|PM-08; D023/D028; T05/T07|Inversión enlazada +500,01 y −20,00|−500,01 y +20,00 exactos; originales/motivos preservados|
|O13|SM-RF-03–06; T08; AC-057|Intento incierto80, salida20 sobre derecho200|Ejecutado20; reserva restante60; derecho pendiente180|
|O14|SM-RF-06; H4-016-F23/F24|Resolver resto no ocurrido / acreditar otros60|Libera solo reserva60 / ejecutado80 conserva salida20 original|
|O15|SM-DE-01–03; SM-FORB-19|Exigencia100 entrega40|Pendiente entrega60; sin fondos internos por custodia externa|
|O16|SM-DE-04–08; AC-036; T07|Entrega100, retención20, restitución30; completar80|Pendiente devolver50 luego0; Deposit/Refund mismo movimiento canónico|
|O17|T05/T07/T08; SM-FORB-15; AC-027|Allocation80 y Refund80 sobre100, primeras sin hijos|Solo una porción80; nunca consumo160; ambos órdenes con solapamiento raíz real|
|O18|T05/T07/T08; H4-019; DM-INV-037/040|Provider Payment / Refund / garantía interna sobre fondos compartidos|Protección común; custodia externa no consume fondos; disjuntos con relectura|
|O19|D015/D038; H4-019-F06|Dos sesiones F2 del mismo administrador y mutadores autoridad|Ambas admisiones llegan a raíz negocio; sesión/epoch/mutadores exclusivos; PID/xid/locks/cadena|
|O20|SM-BK-02–05; H4-021-F23; BR-PAY-002; D020|Preparación con economía H3 real; falsos pago/Task/HA|Sin confirmación por recibo/fecha/aprobación; conciliación/asignación pertinente requerida|
|O21|SM-BK-06/07; SM-BS-07/08; AC-091/063|Inicio y prestación parcial/completa|Hecho acreditado; resto pendiente; excepcional revisado sin autorización retroactiva|
|O22|SM-BK-08/09; SM-BS-09; AC-031/058|Prestación seguida cancelación por alcance/finalización|Prestación/resto/historia conservados; Finalizada con factura/Refund/fianza pendientes|
|O23|DM-INV-013–017; BR-PAX/BR-NIGHT; PT-03|Booking/servicio/noche/contribución; N1=12 N2=10 nominales4 N1|Identidades propias;12/10; nunca4+12 ni personas ficticias|
|O24|H4-021-F23; H4-022/023; SM-BK; G6|Preparación nueva/replay con Cancelada/En curso/Finalizada|Nueva preparación rechazada; replay histórico no retrocede fase|
|O25|H4-022/023; SM §18; SPEC-NFR-009|Rectificación/finalización histórica/aplicabilidad|Original y versión enlazada; rectificar no nueva ejecución ni reaplicación automática|
|O26|D037/D038/D039; Plan §6/7.2; T08|F1/F2, HA exacta, replay, revocación/inhabilitación|Deniega autoridad ausente/material distinto/replay revocado; final check TTE exclusivo|
|O27|Plan §6; SPEC-FR-SEC; DM-INV-050|RLS/FORCE RLS/owners/ACL/helpers/search_path/proyecciones|Runtime sin CRUD/migración; ajenos no enumerables; originales privados; minimización|
|O28|T04/T05/T06/T07/T08; V-AT; D039|Fallos escritura/COMMIT, aborto/reintento y respuesta perdida tras COMMIT|Efecto/historia/resultado/seguimiento aplicable todos o ninguno; replay durable sin duplicar|
|O29|V-MIG; Plan §5.4; fichas H4-002–023|Fresh52; upgrades históricos; rollback/retry/data/catalog/private|52 intactas; fronteras anteriores declaradas; atributos preservados/cuerpos adaptados diferenciados|
|O30|Tasks §§2.3/7; Plan §§9–10; DM-PENDING-005|Preservación, límites y contadores|Sin producto/migración53/dependencias/health modificado; H5/H6 futuros; 2240PG+incremento explicado/138unit/health1 separado|
|O31|H4-012-F16; H4-016-F23/F24/F30; H4-019-F06; H4-021-F23; H4-023-Fxx|Retests correctivos y preservación histórica|Originales FAIL/reproducciones intactos; source-map-js1.2.2; no nuevos PASS atribuidos retrospectivamente|
|O32|B07/C01–C06; ficha H4-024; Plan §9|Contratos ordinarios con sintéticos y evidencia mínima|Hechos/versiones/original/historia/seguimiento mínimo sin capacidades H5 ni waits externos en transacción|

## Estrategia independiente y ejecución pendiente

Expected no usa helpers de producto ni resultados observados como oráculo. Las aserciones monetarias serán literales. Fixtures pueden generar comandos/evidencia por contratos existentes; las pruebas observan por APIs y SQL reservado al observador para catálogos, raíces y atomicidad. No se siembra éxito por UPDATE privilegiado.

Reutilizar verificadores acreditados en una regresión nueva sobre SHA congelado, manteniendo sus fronteras históricas. Añadir cobertura de salida conjunta sobre52 donde los harness antiguos no llegan: carreras compartidas H4-019 con doble F2 y raíz económica; PM04–08, Refund parcial/incertidumbre y Deposit canónico. Las rutas operacionales H4-023 ya usan52 y se reejecutan sin cambio. Ambos órdenes y solapamiento observado con PID/xid/locks/raíz/cadena; Bookings independientes, porciones disjuntas/solapadas y primeras sin hijos. No actor global como oráculo de protección.

Capturar ejecución real, SHA, versiones, argumentos, stdout/stderr/status/error/signal y resultados literales por caso. Históricos conservados, nueva ejecución diferenciada, obligaciones futuras pendientes. Matriz debe indicar PASS/FAIL/BLOQUEADO sin ajustar este expected. Baseline2240PG/138unit/health1; nuevos Node tests/subtests contados una vez, carreras/focales no sumados otra vez. Health independiente y documentación intactos. V-MIG/advisors exclusivamente loopback. Compresión sin pérdida y hashes verificables.

Si aparece defecto material de producto: conservar reproducción/FAIL original, clasificar y dejar dependiente pendiente; esta tarea no autoriza reparar producto. Fallos técnicos de nuevo verificador o documentación pueden corregirse conservando originales y retest. Cero cuerpos/logs/versiones inexistentes reconstruidos.

Protección SHA256 desde base de52 migraciones, producto, tests/harness históricos, fuentes aprobadas, expected/evidencias/defectos, dependencias y health en `protected-base.json`; fixtures históricos además comparación Git/base y restauración byte a byte de salidas generadas después de archivarlas. Solo cierre documental tras SHA probado; cualquier cambio de lógica exige nuevo SHA y regresión.

## Límites obligatorios

AC-058 integral en H5-014 y E2E-01 integral en H6-001. Sin Closure Assessment, cierres conjuntos, expansión de Task/avisos/calendario/jobs/conectores/supervisión, UI, hosted ni Production. Hosted H2/H3 no acreditados; Hosted H4/Production no autorizados. Solo sintéticos y hechos externos simulados; no audio/datos reales/costes Tararí reales/fiscalidad/mandato/facturación legal/PSD2/fondos reales. DM-PENDING-005 abierto; no consentimiento/retención/anonimización/borrado inventados. Base/ref civil desconocida afecta solo efecto dependiente. H0–H3 y H4-001–023 conservados; H4 solo COMPLETED si todos los criterios pasan; H5–H6 NOT STARTED. STOP inequívoco tras publicación H4-024; continuidad vuelve al hilo de dirección H4.
