# TSK-H4-024 — defectos y límites de captura

Registro de esta tarea documental. Ningún hallazgo material de producto. Los defectos históricos y sus FAIL/reproducciones no se modifican ni se convierten en cobertura nueva.

|ID|Clasificación y observación|Original recuperable|Causa/corrección mínima|Retest/cierre|
|---|---|---|---|---|
|H4-024-F01|Técnico de invocación, ejecutado: 0PASS/81FAIL por before hook; ISOLATED_STORAGE_REQUIRED|development/stdout.log.gz y stderr.log.gz; initial-capture-limitations.json|Se invocó Node directo sin preparar Storage aislado. Usar node scripts/test-postgres.mjs con nombres focales, runner acreditado del repo.|focal-2 ejecuta realmente; focal-3 81/81 PASS. CLOSED. No81 defectos diferentes; una causa de setup.|
|H4-024-F02|Técnico del nuevo verificador, ejecutado: typecheck status1, cuatro TS2304|development/typecheck.stdout.log.gz y stderr.log.gz; verifier-before-import-fix.ts.gz|Imports writeFile/resolve ausentes en rutas F23 reutilizadas. Añadir exactamente los imports.|typecheck-2 y typecheck-3 status0; typecheck definitivo status0. CLOSED.|
|H4-024-F03|Técnico del nuevo verificador, ejecutado: focal-2 80/81 PASS,1FAIL; actual2 expected0 en conteo global CustomerPayment|development/focal-2/stdout.log.gz, stderr.log.gz, status.json y verifier-before-count-fix.ts.gz|La suite comparte harness52: otras rutas habían creado dos pagos legítimos. Custodia externa exige no fabricar pagos; comparar count antes/después de esa operación, conservando la aserción de no nuevo fondo.|focal-3 81/81; definitivo81 nuevos incluidos una vez en2321. CLOSED. Expected intacto; sin alterar producto.|
|H4-024-F04|Técnico de captura de versiones, ejecutado: ERR_PACKAGE_PATH_NOT_EXPORTED y status1|development/versions-export-failure/stdout.log.gz, stderr.log.gz, status.json|postgres no exporta package.json por require. Leer directamente node_modules/<paquete>/package.json; mismo binario/lock/versión.|final/versions status0: Node24.21.0/pnpm11.19.0/PG17.11/CLI2.119.0/Next16.3.6/TS7.0.2/postgres3.4.9. CLOSED. Invocación de captura, sin cambio de lógica posterior al SHA probado.|

Los dos comandos iniciales anteriores al capturador conservan stdout/stderr auténticos y exit_code1 observado por la herramienta. No disponen de status nativo/error/signal/timestamps/versiones originales; `initial-capture-limitations.json` declara NOT_CAPTURED. No se reconstruyen. Las ejecuciones posteriores conservan todos esos campos mediante el capturador publicado.

Focal-2/3 y la regresión definitiva usan una instalación nueva sintética cada vez. La salida íntegra de focal-2 se conserva antes de corregir F03. El expected ba9b9f7 jamás se ajusta. Las correcciones de imports y rutas PostgreSQL preceden1de3623. La corrección del auditor F05 se publica después en a6e28cb y exige nueva regresión completa. Después de a6e28cb solo se generan artefactos documentales/evidencia.

Históricos H4-012-F16, H4-016-F13/F23/F24/F30, H4-019-F06, H4-021-F23 y H4-023-F01–F30: originales protegidos por SHA256/Git y nuevas ejecuciones referenciadas en matriz. source-map-js1.2.2 y lock intactos. No PASS retrospectivo de casos entonces ausentes. Ausencias declaradas en originales siguen declaradas.

## H4-024-F05 — auditor de capturas

Técnico del auditor independiente, ejecutado: SyntaxError porque `pass` se usó como argumento con nombre en `dict(...)`. Original en `development/audit-syntax-original/{stdout.log,stderr.log,status.json}`; código auténtico publicado en1de3623 recuperable por Git. Primer fallo al invocarlo tras gates1de3623 quedó además visible en la herramienta; no se reconstruye aquella captura ausente. El reproducer archivado vuelve a ejecutar el mismo fallo sobre el archivo intacto antes de corregirlo.

Corrección mínima de una línea a diccionario literal, sin cambiar expected ni contadores: commit `a6e28cb099ce1ba0f13382b69d992adde25601e6`. Se valida sintaxis Python y se repite toda la regresión y auditoría sobre ese SHA. El auditor corregido ya comparó retrospectivamente los gates1de3623 con cambio local todavía sin commit; `regression-1de3623/audit-retrospective-limit.json` declara expresamente que ese resultado derivado no es el cierre definitivo ni prueba del auditor original. Los streams/status de aquellos gates son auténticos y PASS; no se arrastran al nuevo SHA.

CLOSED únicamente tras auditor y regresión definitivos de a6e28cb PASS. Cero defecto material de producto y cero defecto técnico abierto. Después de a6e28cb no cambia producto ni lógica de verificadores; cierre posterior solo documentación/evidencia/coordinación.

## H4-024-F06 — referencia normativa de O01

**CLOSED exclusivamente documental — 2026-10-07.** Observación estática de trazabilidad, sin fallo ejecutado ni defecto de producto. Base autorizada de esta corrección: `228f476b3b42106325481b88c320582f88ff1aa7`.

- **Original recuperable:** O01 de `expected-TSK-H4-024.md`, congelado en `ba9b9f7f25a44b3999fa9f609e26d696a829f449`, y O01 de `matrix-TSK-H4-024.md` en la base de esta corrección citan `SPEC-FR-DOC`. El expected conserva literalmente esa referencia; la matriz original sigue recuperable en Git.
- **Causa:** referencia normativa inexistente en la SPEC usada en el expected y trasladada a la matriz; error de identificación documental, sin cambio de la expectativa literal de O01.
- **Corrección:** sustituir únicamente la referencia errónea en la celda de fuentes de O01 por `SPEC-FR-COORD-005`, `SPEC-FR-CAT-007` y `AC-051`, conservando `SM-DO-01–05` y `SM-FORB-20`. Añadir errata explícita en `evidence-TSK-H4-024.md`; no editar el expected congelado ni los artefactos históricos de ejecución.
- **Comprobación/cierre:** cotejo directo de las tres filas de la SPEC vigente y de las transiciones/prohibición de State Machines; búsqueda de `SPEC-FR-DOC` sin coincidencias en la SPEC. Diff limitado a matriz, evidencia y este registro, con las demás celdas de O01 intactas; `git diff --check` sin incidencias y comparación con la base para preservar el resto de archivos. No se repiten regresiones ni se atribuye una nueva ejecución al SHA documental.

Casos, resultados, contadores y alcance conservados. Sin cambios de producto, tests, permisos, migraciones, dependencias o health. H4 COMPLETED local/aislado; H5–H6 NOT STARTED; todos los pendientes y límites existentes permanecen. STOP tras publicar esta corrección; continuidad al hilo de dirección H4.
