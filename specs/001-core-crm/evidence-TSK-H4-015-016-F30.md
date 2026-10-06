# Cierre correctivo H4-015/016 — parche mínimo F30

COMPLETED exclusivamente local/aislado. F23/F24/F30 CLOSED tras regresión completa; no modificación adicional de Refund ni tareas futuras. Base autorizada `60ac2eb9d382931f4ef1e17555b29b1986cb170b`; main/HEAD/origin main coincidentes, árbol limpio y fetch antes de escritura. Cadena publicada lineal preservada. El checkpoint anterior permanece como antecedente, junto con todos sus FAIL y limitaciones.

## Expected y SHA exacto

Expected independiente [F30](expected-TSK-H4-015-016-F30.md) publicado antes del parche en `c73b882be11eb38b3283944280f0f73f9d946435`; SHA256 `d63255478a98b71af1cc2c3043660c0d023565faafe082df9662e14419684293`. Expected original y F23, fuentes aprobadas y evidencias previas conservan bytes. Parche/runner de captura publicado en `0aab9022dd0cfcf9d8884bf16b1d4e6fc6a13f74`: es el SHA exacto probado. El commit de cierre posterior contiene exclusivamente evidencia/logs/coordinación, no otra ejecución de producto. Cadena exacta y SHA documental final se comprueban después de push/fetch y se comunican en el informe final.

## Aviso, compatibilidad y parche

Verificados directamente [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) y [release1.2.2](https://github.com/7rulnik/source-map-js/releases/tag/v1.2.2). El aviso afecta >=1.0.0/<1.2.2. Node24.21.0 y pnpm11.19.0 conservados; Next16.3.6→PostCSS8.5.23→source-map-js1.2.1. El consumidor instalado declara `^1.2.1`, que admite1.2.2. Ayuda efectiva pnpm11.19.0 y documentación oficial archivadas; selección por paquete y profundidad mantiene el rango existente.

Comando mínimo real: `pnpm update source-map-js --depth Infinity`, sin latest, audit fix, override, dependencia directa, ignoreAdvisories ni exención. Integridad suministrada por pnpm. Diff completo de lockfile: cuatro líneas sustituidas (clave/resolución1.2.2, integridad, dependencia PostCSS, snapshot). Normalizando exclusivamente esos registros, todos los bytes ajenos coinciden con la base; package.json idéntico. Next/React/DOM/Postgres/TypeScript/tipos/Node/pnpm y demás resoluciones permanecen iguales. No migración nueva y ningún cuerpo SQL modificado en este bloque.

Auditoría previa nueva: FAIL status1/high1, conservada en `before/audit.*`; antecedente original en `h4-016-f23/final1/audit.*` intacto. Árbol/list/why y rango consumidor antes/después recuperables. Después, la única instancia del árbol real de producción es1.2.2 y audit devuelve advisories vacío, vulnerabilidades0 en todas las categorías/status0. Las otras dependencias no cambian.

## Reproducibilidad y gates

Instalación en directorio local temporal desechable: se copian únicamente package.json y pnpm-lock.yaml, sin secretos; frozen install, árbol real, why y auditoría PASS. Lockfile copiado permanece idéntico. Directorio eliminado después del éxito. Captura completa en `clean-install/`, comandos y momentos reales en results/status. No test que replique el lockfile; verificación por gestor, instalación/árbol efectivos, auditoría y regresión.

Sobre `0aab9022dd0cfcf9d8884bf16b1d4e6fc6a13f74`, runner definitivo `tests/fixtures/h4-016-f30/run.mjs` con matrices históricas intactas y opción correctiva47 existente:

|Comprobación|Resultado observado|
|---|---|
|Frozen install / árbol producción / audit producción|PASS;1.2.2 efectivo;0 vulnerabilidades|
|Typecheck / lint-imports-boundaries / build|PASS|
|Unitarias completas|138/138;fail0/skipped0/cancelled0|
|PostgreSQL completo|1831/1831;fail0/skipped0/cancelled0;396121.854875ms|
|Health-check independiente|1/1 separado;sin cambio de código/documentación|
|V-MIG existente / advisors exclusivamente loopback|PASS; advisors results vacío/status0|
|Diff-check base autorizada→SHA probado|PASS|

No incremento de casos frente a checkpoint60ac: los43 correctivos permanecen incluidos dentro de1831 (=1788 anteriores+43), no se suman otra vez ni se presenta ejecución focal extra como total nuevo. Matriz H4-016 anterior y correctiva ejecutadas dentro de la suite completa. Comandos/versions/streams/status/signal/error disponibles en `final1/results.json` y archivos por comando. PostgreSQL17.11 y CLI2.119.0 conservados; entorno privado aislado, fixtures sintéticos.

## Refund, seguridad y preservación

Matrices verifican salida20/pendientes180/reserva60; resto no ocurrido conserva20/180 y reserva0; salida60 adicional acumula80/pendientes120/reserva0. F13 rechaza porción ajena; F24 rechaza record+attemptId que elude reserva. Idempotencia/replay técnico y E2, aprobaciones/TTE, reserva restante, hechos y originales, privacidad, actor/sesión revocados y CRUD privado continúan PASS. No nuevo cálculo de derecho ni cambio de Cancellation Right.

Concurrencia PostgreSQL: sesiones independientes, overlap Lock observado, ambos órdenes para solapadas/disjuntas/mismo hecho/resolución resto/Allocation contra reserva. Escrituras, historia, resultado y fondos con fallos controlados y constraint diferido al COMMIT conservan rollback exacto; pérdida de respuesta después de COMMIT real recupera resultado durable sin duplicación. Es prueba interna local; no exactly-once externo ni rollback de movimiento externo.

Preservación F30:380 archivos seleccionados comparados contra60ac, incluidas47 migraciones byte a byte, producto, todos los verificadores no-fixture, expected históricos y health/documentación; hashes en preservation.json. Artefactos históricos que la suite regenera se archivan bajo generated-historical-artifacts y se restauran a sus bytes publicados, sin modificar lógica/asserts ni borrar resultados anteriores.

V-MIG existente reejecutado: instalación vacía47, upgrade46→47 poblado por contratos reales con Refund parcial/intento incierto y componentes históricos; falloDDL/rollback/reintento PASS. Catálogo previo387relaciones/174funciones/280políticas/72triggers/28roles/9membresías, datos antes/después hash idéntico. Este ensayo mantiene las excepciones históricas de la migración47: refund_core/refund_blocks/fund_summary cambian cuerpo por F23, preservando firma/OID/owner/ACL/configuración; el parche F30 no cambia ninguno de esos cuerpos. Advisors all/fail-on error contra127.0.0.1:56965, status0, stdout/stderr/status propios íntegros.

## Defectos, evidencias y límites

[Matriz P01–P07](../../tests/fixtures/h4-016-f30/matrix.csv), [cronología posterior y cierre](../../tests/fixtures/h4-016-f30/defects.md), con la cronología F23 íntegra enlazada. F30 MATERIAL CLOSED con parche reproducible y conjunto completo PASS. F23/F24 MATERIAL CLOSED completo; su RETEST funcional previo y el bloqueo histórico por auditFAIL no se reescriben. F26/F28 mantienen clasificación MATERIAL y cierre acreditado; clasificaciones iniciales y FAIL se conservan. F32 exclusivamente DOCUMENTAL detectado al comprobar el cierre: whitespace de contexto en el artefacto lockfile.diff, no en el lockfile/producto. FAIL ejecutado completo/status conservado en closure-diff-original; mismo contenido archivado gzip sin pérdida. Primer retest conservado en closure-diff-retest1: el log FAIL textual reproducía los espacios originales; también comprimido sin pérdida. Retest final closure-diff-pass status0, F32 CLOSED. Ningún defecto material ni documental abierto.

Directorio recuperable `tests/fixtures/h4-016-f30/`: before, sources, clean-install, final1, manifests/preservación, diff y capturas. Logs completos comprimidos gzip sin pérdida donde corresponda, manifest con hash original/almacenado/bytes; no reemplazan FAIL anteriores. El comando de actualización inicial fue invocado por herramienta terminal con streams combinados, sin separación stdout/stderr ni campos signal/error propios; completion/status real0 y output de la herramienta conservados en update-tool-result.json, sin reconstruir campos ausentes. Los comandos del runner y subprocess tienen streams separados reales. Las limitaciones de captura de arranque heredadas del cierre F23 siguen declaradas; no se atribuye recuperación de esos streams a esta ejecución. `final1/F24-original-state.json` es el nombre heredado que emite el test en este RETEST; no constituye una nueva reproducción original pre-fix.

Tras SHA probado, solo evidencia/logs/coordinación. H4-001–016 COMPLETED local/aislado; H4 IN PROGRESS; H4-017+ y H5–H6 NOT STARTED. H4-019/H5-014/H6-004/H6-016 e integraciones futuras NO ACREDITADAS. Pendientes globales y DM-PENDING-005 conservan ámbitos; hosted H2/H3 no acreditados; Production no autorizada. Sin datos reales, audio, conectores, pagos/envíos/consultas empresariales ni efectos externos reales. STOP obligatorio tras publicar este cierre; continuidad al hilo de dirección H4.
