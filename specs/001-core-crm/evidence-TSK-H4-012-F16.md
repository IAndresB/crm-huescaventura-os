# Verificación independiente correctiva — TSK-H4-012 / F16

Resultado final PASS local/aislado:1584/1584 PostgreSQL,118/118 unitarias yhealth1/1 separado; todos los gates, V-MIG yadvisors loopback PASS. Esta evidencia suplementa el cierre anterior; no lo reescribe ni presenta final3 como cobertura del defecto nuevo. Base `7ca140ac4e3b3793d4aa49e7dbd9743d79191102`; expected correctivo `1a5141d3caf773aa3fb948e38c4701852ba1ad08`; producto/verificador congelados `992c336cb16d39fffc1044a1b0737541614bd773`.

## Método, entorno y comandos

Expected [C01–C17](expected-TSK-H4-011-012-F16.md) derivado de fuentes aprobadas antes del producto. Expected original inmutable. Fixtures sintéticos por contratos reales H2, catálogo, B07, modificación; SQL independiente observa datos/catálogo/historia. Únicamente las inyecciones identificadas de seguridad, locks y triggers técnicos utilizan autoridad de prueba.

Mac local, PostgreSQL17.11 aislado en loopback, Node24.21.0, pnpm11.19.0, CLI Supabase2.119.0. Sin hosted ni credenciales reales. `node tests/fixtures/h4-012-f16/run.mjs repro-01`, `dev-11` y `final`: comandos exactos, timestamps, stdout/stderr, exit status, signal y error capturados por el runner en archivos separados. Logs completos con compresión gzip sin pérdida; ningún extracto se presenta como salida íntegra. `repro-typecheck.log.gz` es comprobación auxiliar: no se reconstruyen campos no capturados en aquella llamada. El helper histórico de arranque aislado valida exit del proceso, pero no archiva separadamente todos los streams nativos initdb/pg_ctl en arranques correctos; no se atribuye esa captura. Los fallos de socket se conservan con el log PostgreSQL real. Advisors invocados dentro de las pruebas imprimen ambos streams completos y status/error/signal; no hay captura simulada.

## Matriz y regresión

`dev-11`96/96 PASS,70 casos anteriores y26 correctivos sin doble cómputo. El manifest y matriz definitiva identifican los casos de la regresión final por título y líneas recuperables de su log completo. Protocolos V-DOM/V-DAT/V-SM/V-NEG/V-AT/V-MIG/V-EVI.

C01–C08: H2 con A fijado→B aplicado, nuevo B legítimo, A obsoleto rechazado, OfferingV1/V2 y referencias cruzadas, ausencia de proveedor fijado acreditada por Offering, before/desired y sus pruebas independientes. C09–C10: S2/noches12/10/cuatro nominales, rechazo/retirada/replay, conservación de snapshot y ausencia de restauración automática. C11–C13: contexto/actor/sesión, F1/F2, CRUD/RLS/ACL, proyecciones mínimas, reautorización, replay y E2. C14–C15: sesiones independientes con overlap PostgreSQL observado, ambos órdenes, guards obsoletos, rollback de versiones/historia/resultados y COMMIT, respuesta B fallida, pérdida de respuesta solo después de COMMIT real. C16: fresh44, upgrade poblado43, Requirement revisado/original privado, Incident/INC, AV/Hold/Confirmation, fallo DDL/rollback/reintento, datos y catálogo preservados. C17: regresión acumulada/gates/health-check separado/advisors.

El harness aplica44 sobre43 para las focales y matriz H4-012 no upgrade cuando `H4012_CORRECTIVE44=1`. Las verificaciones históricas de upgrade42→43 mantienen esa frontera; se añade V-MIG43→44 propio. No se reducen assertions ni se cambian fuentes aprobadas.

## Defectos y preservación

[Ledger](../../tests/fixtures/h4-012-f16/defects.md): F16 material original con cuatro FAIL ejecutados; F17 SQL/migración durante desarrollo; F18 entorno/ejecución; F19 typecheck del doble; F20 fixture de original privado; F21 longitud de socket. Conservados resultados originales, diagnóstico, corrección y retests. F16/F17–F21 CLOSED tras la regresión completa del SHA probado.

Se comparan las43 migraciones, health-check y su documentación, fuentes aprobadas y ambos expected byte a byte contra sus commits. Comparación de datos y catálogo antes/después de upgrade; dos cuerpos cambiados se excluyen exclusivamente de comparación de body y conservan OID/firma/owner/ACL/configuración. Todas las demás funciones previas se comparan completas; relaciones/policies/triggers/roles previos intactos. Historial final3 y evidencias anteriores no se modifican.

## Pendientes y STOP

H4 IN PROGRESS; H4-013+ y H5–H6 NOT STARTED. Integraciones futuras y pendientes globales conservan ámbito; DM-PENDING-005 abierto, hosted H2/H3 no acreditados y Production no autorizada. No datos reales, audio, efectos externos ni capacidades posteriores. Tras publicar el cierre correctivo, STOP y continuidad al hilo de dirección H4.

## Evidencia recuperable definitiva

[Directorio correctivo](../../tests/fixtures/h4-012-f16/): matrix.json (C01–C17), final/results.json ycada status JSON, streams íntegros final/*.log.gz, byte-preservation.json (43 migraciones, fuentes yhealth-check), final-preservation.json (datos/catalogo antes/después), manifest.json (hashes comprimidos ysin comprimir), defects.md y direction-observation.md. Versiones ycomandos reales en final. Auditoría:0 vulnerabilidades de producción. Advisors fresh44:status0,signal null,error null,results=[]; el advisor histórico43 mantiene su frontera. Las96 focales y26 correctivas son subconjuntos de1584; no se suman otra vez.

El commit posterior a `992c336cb16d39fffc1044a1b0737541614bd773` solo añade evidencia/logs/coordinación. El SHA final publicado es el commit que contiene este cierre, recuperable con `git log -- specs/001-core-crm/evidence-TSK-H4-012-F16.md`; se informa exactamente tras push/fetch, sin referencia circular dentro de su propio contenido.
