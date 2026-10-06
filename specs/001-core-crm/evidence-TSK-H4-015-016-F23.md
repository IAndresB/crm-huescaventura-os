# Evidencia correctiva independiente H4-015/016-F23

Estado: corrección Refund verificada focalmente; cierre satisfactorio PENDING por auditoría F30. No se sustituye el cierre publicado ni final3. Alcance exclusivo local/aislado F23; H4-017+/H5/H6 NOT STARTED. Sin efectos externos reales, hosted, Production ni datos reales.

## Autoridad y congelación

Base publicada `32e85d1bc6631771f15c0a3817861a1ef3bef1e9`, main limpia y fetch inicial coincidente. Expected independiente [correctivo](expected-TSK-H4-015-016-F23.md), congelado y publicado antes del producto en `6c62dd5d223d4c030c2bc5fba2ee32c03c42b504`, SHA256 `81e8e0d4f08bddc27a06bcd5184930a8a23464250179b27c57f7acd08db8ea64`. Expected original SHA256 `571449d318f6db5c22517bab6d4f3869429c2c4b797fd12e2cbcc318cab27ad8` intacto, como todos los antecedentes. Fuentes exactas: SPEC-FR-ECON-007, AC-035/057, SM-RF-04/05/06, G1–G6, T05/T07/T08, D039/TTE; filas asignadas Tasks§6 conservadas en expected original y matriz anterior completa reejecutada.

Producto `a6630abc9101b095ca3656e1b845a4f8e40563d9`; verificador y SHA probado `542576160b5ee03abd143945ff2424ed446cba76`. No producto/migración/lógica de pruebas posterior a ese SHA. El cierre documental posterior no recibe atribución de otra ejecución de producto.

## Observación, reproducción y diagnóstico

Dirección aportó una observación estática independiente: ejecución parcial acreditada dentro de intento incierto. Se registró F23 como observación, antes de ejecutar. Reproducción sobre producto publicado de46 migraciones por contratos ordinarios H2→cobro/conciliaciónH3→derechoH4-013→Refund→HA/TTE exacta→Incident/intento80→salida20. El HEAD documental en esa cronología era6c62dd5; ninguna migración/producto anterior se modificó. El primer reproducer no emitió su propio git rev-parse; se declara ese límite de captura, sin reconstruir stdout ausente. Inputs, anterior/posterior y proyección completa: `tests/fixtures/h4-016-f23/repro-original/F23-original-state.json`; comandos/stdout/stderr/status en esa carpeta.

Ruta ordinaria: `REFUND_PORTIONS_REQUIRED`. Ruta vinculada resolve/occurred: `REFUND_UNCERTAIN_PORTION_MISMATCH`. FAIL ejecutado de C01, conservando ejecutado0, pendientes200 y reserva80. La causa material fue exigir identidad de porción/importe completos y no representar incertidumbre restante. F13 anterior no acreditaba este caso; su aserción original permanece byte a byte.

F24 adicional del mismo ámbito: record con attemptId excluía reserva sin pasar por resolución. Reproducción `repro-bypass` y `repro-bypass-state/F24-original-state.json`: salida20 aceptada mientras permanecía reserva80, FAIL del rechazo C02. Fix exige resolución vinculada para excluir la reserva; el registro ordinario con attemptId se rechaza antes del nuevo efecto.

## Cambio mínimo e integración

Migración forward47 creada con CLI2.119.0: `20261006065228_h4_refund_uncertain_partial_progress.sql`. Original46 y anteriores intactas. Modifica exclusivamente cuerpos `crm_private.refund_core(jsonb,text,uuid,text)`, `crm_private.refund_blocks(uuid,text,uuid)` y `crm_private.fund_summary(uuid,text)`. CREATE OR REPLACE conserva OID/firma/owner/ACL/configuración. Nuevo helper INVOKER privado `crm_private.refund_attempt_remaining(jsonb)`, ownerF2, search_path pg_catalog/pg_temp, EXECUTE solo executor/migración y nunca PUBLIC/runtime/anon/authenticated. CREATE temporal del owner en esquema se revoca al finalizar; catálogo final previo íntegro salvo cuerpos declarados.

Cada intento conserva id/porción original/evidencia; nuevas revisiones registran restantes y progreso. La salida almacena vínculo explícito sourceAttemptId. La autoridad/destinatario/método históricos del intento se conservan; para intentos anteriores se reconstruyen de su revisión immutable de registro, sin reescribirla. Nueva prueba B07 vincula actuación, intento, hecho y material exactos; inclusión numérica sola no basta. Porciones verificadas se restan usando numeric/rangos exactos, sin floats, ledger paralelo ni recálculo del derecho. Fondos H3 consumen la unión de salidas acreditadas y reserva restante, nunca ambas sobre el mismo intervalo. Incertidumbre y ejecución se persisten con historia/resultado/proyección dentro de la unidad T07.

Caso200/80/20: ejecutado20, pendientes derecho/autorizado180, reserva60 e intento todavía incierto, original80 recuperable. Nueva prueba no-ocurrió-resto retira solamente60 y conserva20/180; no envía ni autoriza otro efecto por inferencia. Nueva salida acreditada60 del mismo intento produce80/120 y reserva0. Interior/disjuntas conservan fragmentos restantes. No se recalcula Cancellation Right ni se altera obligación por simple resta. Confirmar/cerrar Incident no acredita salida ni libera reserva. No exactly-once externo ni rollback de movimiento externo.

## Verificación

Focal final dev7:136/136=93 anteriores+43 correctivos. Los43 ya se cuentan dentro de la suite PostgreSQL completa. `postgres-h4-016-f23.test.ts` y `postgres-h4-016-f23-migration.test.ts` derivan constantes20/180/60 y80/120/0 del expected independiente. [Matriz C01–C13](../../tests/fixtures/h4-016-f23/matrix.csv), [defectos/cronología](../../tests/fixtures/h4-016-f23/defects.md). La única extensión del fixture histórico es opción explícita H4016_CORRECTIVE47 para aplicar47 a la matriz Refund; sus aserciones/test original F13 están intactos. Su upgrade histórico45→46 sigue en su frontera; V-MIG nuevo verifica46→47.

Sesiones PostgreSQL independientes, Lock observado y ambos órdenes: parciales solapadas/disjuntas, mismo hecho nueva operación, parcial frente a no-ocurrió-resto y Allocation sobre reserva restante. Sobre misma revisión solo una actualización material pasa; la otra reevalúa/E2, disjuntas pueden reintentarse con nueva base y completar40 sin duplicar. Mismo hecho produce una salida con ambos replays admitidos. Reserva restante sigue protegida. Autoridad compartida F2 puede serializar la cola; no se presenta Promise.all como prueba ni se afirma COMMIT paralelo mientras está retenida.

Inyecciones en movimiento/revisión/operación/revisión de fondos y constraint diferido al COMMIT: snapshot entero igual tras rollback y retry válido. Pérdida de respuesta solo después de COMMIT PG real: replay durable sin otra salida/reserva/historia. F1/F2, TTE y finalcheck anteriores reejecutados; revocación/inhabilitación deniegan replay parcial; referencias cruzadas/proyección mínima/CRUD privado/helper denegado. No cambios de permisos para resolver el defecto.

V-MIG instalación vacía47 y upgrade46 poblado por contratos, Refund parcial20 e intento80 anterior; DDLfallo/rollback/retry conserva datos/catálogo. Tras upgrade nuevo fragmento20 del intento legacy conserva original y reserva60. Manifest SQL en `final1-remaining/f23-preservation.json`:387relaciones,174funciones,280políticas,72triggers,28roles,9membresías previas; todos los atributos previos coinciden, salvo los tres cuerpos declarados. Advisors all/fail-onerror exclusivamente loopback56965, salida JSON results vacía/status0 y streams completos conservados. Manifest byte a byte69 archivos publicados,46 migraciones, expected históricos y health/documentación intactos.

## Regresión y bloqueo

Sobre5425761: frozen install, typecheck, lint/imports/boundaries,138/138 unitarias, build PASS. Auditoría producción final1 status1: source-map-js1.2.1, GHSA-68fv-2mgg-jv7q alta, transitiva Next→postcss, parche indicado1.2.2. FAIL original intacto; F30 OPEN, externo al cambio Refund, autorización del ajuste mínimo solicitada. No parche/override/exención aplicado por inferencia. Fuente consultada: https://github.com/advisories/GHSA-68fv-2mgg-jv7q.

PostgreSQL completo/health/diff restantes se ejecutan mediante continuación explícita sobre el mismo5425761; no se atribuyen a otro SHA ni se declara auditoría PASS. Resultado observado cerrado:1831/1831 PostgreSQL (1788 anteriores+43 correctivos incluidos),138/138unitarias,health-check1/1 separado; cero FAIL/skipped/cancelled en estas suites. V-MIG/advisors y diff rango PASS. Auditoría F30 sigue FAIL; no cierre satisfactorio. Nodo24.21.0, pnpm11.19.0, PostgreSQL17.11, CLI2.119.0, loopback aislado/Storage privado sintético. No herramientas/dependencias cambiadas.

## Evidencia recuperable y límites

Directorio `tests/fixtures/h4-016-f23/`: repro-original/repro-bypass/repro-bypass-state; cli-new; dev1–dev7; final1; final1-remaining; preservación, matriz, cronología, ledgerSHA y manifest. Logs completos de stdout/stderr del comando principal y status/signal/error capturados; advisors y comandos nativos instrumentados tienen streams/status propios. Compresión gzip sin pérdida con hash del original y almacenado cuando se aplique. Extractos del informe son resúmenes, no salidas completas.

Dev2 tuvo terminación manual del hijo del verificador que dejó conexiones de dos clusters propios abiertas tras errorDDL; wrapper corregido catch/close y clusters apagados. El status principal real1 se conserva; no se reconstruyen streams/estado individuales de esa intervención disponibles solo en conversación. Los helpers históricos de arranque que suprimen streams antes del runner no se presentan como capturados. Documentación/changelog oficiales consultados, PostgreSQL17.11 ya fijado, sin cambio de extensiones/cifrados ni upgrade.

H4 IN PROGRESS. Cierre H4-015/016 correctivo PENDING hasta gate completo; PASS anterior preservado. H4-017+/H5/H6 NOT STARTED. H4-019/H5-014/H6-004/H6-016 NO ACREDITADAS; DM-PENDING-005 y pendientes globales intactos. STOP y continuidad al hilo de dirección H4; sin datos reales ni efectos externos reales.

## Checkpoint publicado pendiente de autorización

Se publica implementación/verificación y evidencia pendiente, sin atribuir PASS a auditoría ni CLOSED a F23. SHA final documental se obtiene tras commit/push/fetch y se comunica separado; contiene únicamente evidencia/logs/coordinación sobre5425761. La solicitud de autorización sigue pendiente para parche mínimo source-map-js1.2.2 y nueva regresión sobre otro SHA. STOP: ninguna tarea posterior preparada.
