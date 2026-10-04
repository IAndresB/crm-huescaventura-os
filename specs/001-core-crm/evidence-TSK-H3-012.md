# Evidencia TSK-H3-012 — Verificación normativa independiente

**Resultado: COMPLETED local/aislado.**

Base exacta `028cbaef887acf68a23bffd2069b91c477ac7e0c` tras fetch/main/árbol limpio/HEAD==origin/main. Producto y verificación probados en `aaa1ce94ebae591225a1f64054d1001372ae6f7b`; el SHA final publicado corresponde al commit documental sucesor y se distingue en el informe Git final. Expected independiente [R001–R100](expected-TSK-H3-011-012.md), congelado antes del producto en `095078128bb18f8e6dc28eb4d8282039b0b1f57b`;23 filas Tasks §6 asignadas, nunca modificado para acomodar producto.

Entorno local/aislado, fixtures solo sintéticos: Node24.21.0/pnpm11.19.0/PostgreSQL17.11 nativo/CLI2.118.0. B07 reutiliza Storage oficial fuente `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, file loopback privado/credenciales efímeras; sin hosted. Preflight confirma H0 técnico/local/aislado y H1/H2 local/aislado COMPLETED; H3 IN PROGRESS/H3-001–010 COMPLETED;011+ yH4–H6 NOT STARTED antes del bloque;H3-010-F01–F05 CLOSED/cero material abierto/35 migraciones/health-check independiente intacto; hosted H2/H3 no acreditado y Production no autorizada.

[Manifiesto](../../tests/fixtures/h3-012/closure-verification.json), [regresión PostgreSQL](../../tests/fixtures/h3-012/closure-postgres.log), [unitarias](../../tests/fixtures/h3-012/closure-unit.log), [defectos](../../tests/fixtures/h3-012/defects.md). **100/100 matriz +7/7 reproducers +1/1 focal =108 casos lógicos PASS;110 tests Node con dos agrupadores. PostgreSQL completo1113/1113 y unitarias109/109 PASS;0 FAIL/skipped/cancelled/todo/materiales abiertos.** Instalación congelada/typecheck/lint-boundaries-imports/build/audit producción0 vulnerabilidades conocidas/diff-check/V-MIG/preservación PASS.

## Comparación observada por caso

Expected independiente contiene fuente/precondición/acción/expected/prohibiciones/estado posterior por ID. Las observaciones siguientes resumen las aserciones reales del [verificador](../../tests/integration/postgres-h3-012.test.ts) en el SHA probado; el stdout conserva cada ID y resultado, sin usar producto como oráculo ni editar expected.

|ID|Observado en SHA probado|Resultado|
|---|---|---|
|R001|Pendiente; previsto500.00/confirmado null; pagado0.00 y consumo0.00.|PASS|
|R002|Base sin proveedor rechazada; no Provider Payment aparentemente válido.|PASS|
|R003|Base sin servicio rechazada; no Provider Payment aparentemente válido.|PASS|
|R004|Base sin obligación rechazada; no Provider Payment aparentemente válido.|PASS|
|R005|Base sin importe rechazada; no Provider Payment aparentemente válido.|PASS|
|R006|Base sin fuente rechazada; no Provider Payment aparentemente válido.|PASS|
|R007|Servicio interno Tararí rechazado como pago externo; sin raíz Provider Payment.|PASS|
|R008|Confirmado600.00 añadido; previsto500.00/historia intactos, pagado0.00.|PASS|
|R009|Programado con aprobación concreta; pagado0.00/consumo0.00.|PASS|
|R010|Programación sin importe material válida rechazada; snapshot anterior intacto.|PASS|
|R011|Programación sin destinatario material válida rechazada; snapshot anterior intacto.|PASS|
|R012|Programación sin medio material válida rechazada; snapshot anterior intacto.|PASS|
|R013|Programación sin fecha material válida rechazada; snapshot anterior intacto.|PASS|
|R014|Programación sin Booking/servicio material válida rechazada; snapshot anterior intacto.|PASS|
|R015|Programación sin Provider Payment/proveedor material válida rechazada; snapshot anterior intacto.|PASS|
|R016|Programación sin evidencia material válida rechazada; snapshot anterior intacto.|PASS|
|R017|Programación sin distinción fondos material válida rechazada; snapshot anterior intacto.|PASS|
|R018|Origen IA sin autoridad concreta rechazado; estado intacto.|PASS|
|R019|Una reserva exacta T08; propuesta IA autorizada por humano puede programarse, sin pago.|PASS|
|R020|Cambiar importe/destinatario/condiciones/medio/fecha/acción/contenido/scope/efecto invalida material aprobado.|PASS|
|R021|Runtime no programa ni finaliza; fachada TTE congelada solo scheduleProviderPayment/close.|PASS|
|R022|Evidencia caduca durante trigger diferido; final check rechaza y revierte unidad/reserva.|PASS|
|R023|Dos ejecutores con misma parte: resultado durable único, una reserva y una programación.|PASS|
|R024|Cambio de revisión de fondos antes finalización: rechazo y rollback de conjunto.|PASS|
|R025|Pagado200.00/saldo300.00/complete false; consumo200.00.|PASS|
|R026|Movimiento sin identidad rechazado; ni pago ni consumo/historia parciales.|PASS|
|R027|Movimiento sin proveedor rechazado; ni pago ni consumo/historia parciales.|PASS|
|R028|Movimiento sin importe rechazado; ni pago ni consumo/historia parciales.|PASS|
|R029|Movimiento sin instante rechazado; ni pago ni consumo/historia parciales.|PASS|
|R030|Movimiento sin medio rechazado; ni pago ni consumo/historia parciales.|PASS|
|R031|Movimiento sin referencia rechazado; ni pago ni consumo/historia parciales.|PASS|
|R032|Movimiento sin fuente rechazado; ni pago ni consumo/historia parciales.|PASS|
|R033|Movimiento sin servicio rechazado; ni pago ni consumo/historia parciales.|PASS|
|R034|Movimiento sin porciones rechazado; ni pago ni consumo/historia parciales.|PASS|
|R035|Movimientos200.00+300.00 conservados por separado; pagado500.00/saldo0.00.|PASS|
|R036|Dos identidades reales similares200.00+200.00: dos movimientos, pagado400.00/saldo100.00.|PASS|
|R037|Replay del mismo movimiento/clave recupera resultado; historia y fondos iguales.|PASS|
|R038|Mismo movimiento con nueva clave reutiliza hecho; ningún consumo duplicado.|PASS|
|R039|Identidad existente con importe201.00 frente200.00 rechazada; original intacto.|PASS|
|R040|Dos señales con identidad distinta se conservan para revisión; pagado0.00.|PASS|
|R041|Evidencia presentada/desconocida o fuente cliente no acredita salida; B07/API rechazan.|PASS|
|R042|Salida200.00/correspondencia específica/consumo200.00/pago Suplido quedan relacionados.|PASS|
|R043|Obligación500.00/fondos100.00/programación200.00 verificada: rechazo, consumo0.00.|PASS|
|R044|Realidad200.00 para base100.00 preservada con funding_unresolved; no correspondencia ni consumo falso.|PASS|
|R045|Fee/consumida/suspendida/Allocation ajena: salida real en incidencia, sin consumo de esas fuentes.|PASS|
|R046|80/80 sobre100 en AB/BA/simultáneo: consumo80.00, disponible20.00; stale/revalidación, nunca160.|PASS|
|R047|Factura Recibida y programación no acreditan pago; status inyectado rechazado.|PASS|
|R048|Pago500.00 sin factura: Gestión abierta/invoice pendiente/seguimiento conservado.|PASS|
|R049|Factura posterior correcta y evaluación resuelven documentalmente sin nuevo movimiento ni consumo.|PASS|
|R050|Todos los componentes locales: Documentalmente resuelto; mandato null/fiscalValidation false/bookingClosure false.|PASS|
|R051|Factura vinculada y pago200.00: saldo300.00/Suplido abierto; factura intacta.|PASS|
|R052|Retirar factura/pago/correspondencia/importe/vínculo material impide resolución completa.|PASS|
|R053|Discrepancia posterior reabre Revisión; evaluación/historia y factura vinculada conservadas.|PASS|
|R054|Campos ingreso propio/coste propio/cierre documental inferidos rechazados; pago sin factura no resuelve.|PASS|
|R055|Intento incierto conserva programación e incidencia; pagado0.00.|PASS|
|R056|Resultado incierto impide retirada y nueva programación ciega.|PASS|
|R057|Incidencia sin fuente/intento/resultado/scope rechazada sin efecto.|PASS|
|R058|AC063: salida real500.00/instante real preservados; aprobación null e incidencia unapproved_real.|PASS|
|R059|Payload de aprobación retroactiva rechazado; movimiento mantiene reserva null.|PASS|
|R060|Revisión del efecto ocurrido resuelve incidencia a Pagado sin fabricar aprobación previa.|PASS|
|R061|Resolver sin comprobación o sin movimiento probado no acredita pago.|PASS|
|R062|Salida original−20.00 produce ajuste+20.00; anticipo+500.01 inverso−500.01 exacto H1; fondos20.00 siguen afectados.|PASS|
|R063|Original/recepción histórica intactos; bankReversalInferred false; reversión Allocation no libera consumo acreditado.|PASS|
|R064|Retirada verificada sin ejecución: Pendiente; programación withdrawn e historia3 conservadas.|PASS|
|R065|Retirada sin noExecution/noPendingExecution/noUnknownResult/motivo rechazada.|PASS|
|R066|Programación con movimiento real no puede retirarse como si no existiera.|PASS|
|R067|Una programación sustenta dos movimientos200.00/300.00, sin imponer identidad1:1.|PASS|
|R068|Replay TTE devuelve previous; mismo snapshot/historia.|PASS|
|R069|Misma clave/material distinto rechazado; programación500.00 original.|PASS|
|R070|Respuesta perdida tras registro confirmado: replay no duplica movimiento/consumo.|PASS|
|R071|Booking/actor no autorizados no recuperan replay ni saldo.|PASS|
|R072|Dos programaciones distintas concurrentes: una válida; otra revisión en conflicto.|PASS|
|R073|Dos sesiones/mismo movimiento/claves iguales o distintas: un hecho y consumo200.00.|PASS|
|R074|Pagos parciales concurrentes: uno conflicto; reevaluación explícita completa500.00 sin sobreconsumo.|PASS|
|R075|Pago vs incidencia concurrentes: una revisión válida; historia2 completa.|PASS|
|R076|Pago vs retirada: una revisión válida; historia3, sin overwrite silencioso.|PASS|
|R077|Runtime espera F2; controlador sintético confirma consumo fuente200.00; revisión vieja rechazada/pago0.00.|PASS|
|R078|Revisión0 obsoleta en confirm/record/incident/withdraw/correct/resolve rechazada sin efecto.|PASS|
|R079|Observador MVCC ve pagado0.00/revisión anterior mientras unidad espera; lectura runtime espera F2 y luego ve200.00 íntegro.|PASS|
|R080|Fallo inyectado antes raíz: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R081|Fallo inyectado tras intención: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R082|Fallo inyectado tras movimiento antes historia: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R083|Fallo inyectado tras consumo: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R084|Fallo inyectado tras Provider Payment antes resto: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R085|Fallo inyectado durante correspondencia saliente: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R086|Fallo inyectado durante incidencia: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R087|Fallo inyectado durante corrección: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R088|Fallo inyectado durante retirada: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R089|Fallo inyectado durante reevaluación Suplido: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R090|Fallo inyectado COMMIT diferido: snapshots de tablas dependientes idénticos antes/después; rollback completo.|PASS|
|R091|F1/F2/scope forjados, IA sin autoridad y actor inhabilitado denegados.|PASS|
|R092|Runtime/anon/authenticated/TTE no leen ni borran tablas; runtime no asume login TTE.|PASS|
|R093|UPDATE de seis tablas históricas rechazado por inmutabilidad.|PASS|
|R094|ID/Booking ajenos null; enumeración referencia/importe/proveedor/filename rechazada incluso con F1/F2 válidos.|PASS|
|R095|Fresh36; seis tablas FORCE RLS/owners;12 policies/6 immutable triggers/8 funciones/search_path/ACL/PUBLIC/roles verificados.|PASS|
|R096|Upgrade poblado35→36 conserva todas las filas previas, snapshots y bytes originales B07 privados recuperables.|PASS|
|R097|Fallo DDL inyectado: rollback sin tabla raíz parcial; definiciones previas idénticas.|PASS|
|R098|Expected100 byteidéntico al congelado;35 migraciones históricas byteidénticas a base.|PASS|
|R099|Intentos fiscalidad/mandato/cierreBooking/coste propios rechazados; mandato null y evaluación sin inferencias.|PASS|
|R100|Correspondencia saliente verificada con ProviderPaymentId/direction outgoing; Reconciliation entrante permanece null.|PASS|

## Defectos y conservación de FAIL

H3-012-F01–F07:7 encontrados/7 CLOSED localmente/0 materiales abiertos tras la regresión completa. F01 construcción TypeScript y fixture;F02 tipo F1 text/cleanup bootstrap;F03 colisiones PL/pgSQL;F04 serialización JSONB de sidecar TTE;F05 precedencia de sustracción de claves;F06 harness de B07/F2 singleton/MVCC y captura síncrona;F07 colisión de puerto con upgrade histórico. F03–F05 corrigieron producto; el resto corrige construcción/verificador sin alterar normas/expected. [Registro](../../tests/fixtures/h3-012/defects.md) enlaza todos los logs originales y [reproducers](../../tests/integration/postgres-h3-012-defects.test.ts).

Primera matriz97 PASS/4 FAIL (tres casos y agrupador); primera regresión completa1110/1112 (dos FAIL del caso histórico R67 y agrupador) conservadas. La tercera matriz interrumpida se conserva como diagnóstico abandonado y no acredita cierre; los ensayos posteriores correctos usan el único Administrador existente y fuentes sintéticas controladas. Los archivos originales no se sobrescriben. La excepción whitespace solo aplica al log histórico F07 original para conservar sus tres líneas Node; diff normal de producto/evidencia pasa. La nueva namespace de puertos55811–55815 conserva los ensayos previos y permite toda la suite simultánea.

## Atomicidad, concurrencia, TTE y seguridad

Sesiones PostgreSQL independientes prueban programación/programación, mismo movimiento con claves iguales/distintas, parciales concurrentes, pago/incidencia, pago/retirada, fuente de fondos cambiada, revisión obsoleta, raíz compartida80/80 en ambos órdenes y comienzo simultáneo. F2 singleton se conserva; observador MVCC ve únicamente revisión anterior completa mientras runtime espera. Después de COMMIT lectura autorizada devuelve nuevo conjunto íntegro. Replay por clave y por identidad fiable no vuelve a consumir; identidades reales similares permanecen distintas; actor/scope/material no autorizados se rechazan. No se promete exactly-once externo.

Fallos reales antes raíz/tras intención/tras salida/consumo/Provider Payment/correspondencia/incidencia/corrección/retirada/reevaluación/COMMIT diferido revierten todas las tablas dependientes. Respuesta perdida tras COMMIT recupera resultado durable una sola vez. D039 finaliza bajo TTE sin devolver transacción; expiración de evidencia durante trigger diferido y cambio material de fondo antes COMMIT invalidan unidad; dos ejecutores sobre misma parte no duplican reserva ni intención.

F1/F2 y autoridad sensible separados; APIs security definer usan únicamente el patrón estrecho aprobado con propietarios NOLOGIN y search_path=pg_catalog,pg_temp, checks de material/actor/propósito/scope y PUBLIC EXECUTE revocado. Runtime tiene solo apply/read, TTE solo sensitive_schedule/finalize; sin CRUD ordinario ni login/pool de TTE accesible al runtime. C01/C03 privados requieren Booking/scope/finalidad; consultas por referencia/importe/proveedor/filename o ID ajeno no enumeran economía. C02 no emite efectos; C04/C05 separan evidencia/intent/result; C06 no expone fondos/referencias bancarias/costes/Fee/márgenes/documentos ajenos a salidas de terceros.

## V-MIG y preservación

Una migración nueva36,35 históricas intactas. Fresh36 PASS; upgrade poblado35→36 conserva todas las tablas anteriores/IDs/snapshots/historia/dinero y original privado B07 descargado byteidéntico. Fallo DDL rollback conserva catálogo/definiciones previas y no deja objetos parciales. Seis tablas FORCE RLS/owners correctos,12policies/6triggers append-only y trigger de protección de consumo;8funciones/ACL/roles/owners/search_paths/PUBLIC y límites runtime/TTE verificados. Funciones Suplido se integran mediante migración forward, sin editar migraciones históricas.

62 archivos protegidos byteidénticos (hashes manifiesto): decisiones/Constitution/architecture/domain/stateMachines/business-rules/Plan/SPEC,35 migraciones,expected/evidencias H3 previos,health-check. Regresión completa preserva H0–H3-010/B07/Allocation/Invoice/Suplido. Las fichas H3-013+ se conservan byteidénticas sin análisis ni preparación. V-DOM/V-DAT/V-MIG/V-AT/V-SM/V-NEG/V-EVI/PT07 y las23 filas Tasks§6 PASS;E2E05 únicamente fragmento autorizado. Se sustituyó localmente la frontera de pago sintético anterior por Provider Payment productivo local; no se modifica la evidencia histórica anterior.

## Pendiente posterior y no acreditado

H3 sigue IN PROGRESS. H3-013+ yH4–H6 siguen NOT STARTED; STOP obligatorio tras H3-012 y continuidad solo con nueva autorización humana. H4-019/H5-014/H6-005 y demás pendientes globales vigentes conservados, incluidas H4-021/H6-016 y carrera completa Refund/fianza. No se ha iniciado ni preparado ninguna tarea posterior.

Provider Payment es productivo únicamente como modelo local de registro de una salida externa ya ocurrida y comprobada. No existe banco/PSD2/conector/API proveedor/webhook/pago real iniciado por CRM, contacto a proveedores ni fondos/datos reales acreditados. Refund/fianza completos, cierre Booking/Economic Closure, fiscalidad/mandato real/facturación, hosted H2/H3 y Production no acreditados; Production no autorizada. D008/D013/P16 y todas las decisiones/normas protegidas intactas; fondos ajenos no son ingreso ni coste propio. Health-check Supabase independiente intacto, sin despliegue H3.
