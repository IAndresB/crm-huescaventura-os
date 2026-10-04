# H3-012 — registro de defectos y FAIL conservados

Expected 0950781 permanece intacto. Todos los datos son sintéticos. Ningún FAIL se sustituye.

|ID|Clasificación/fuente|FAIL original|Reproducer / corrección|Estado|
|---|---|---|---|---|
|H3-012-F01|Construcción TypeScript; H1/D023 reutilización exacta|F01-original-typecheck.log; F01-fixture-typecheck.log|Nombre de helper inexistente e ID de fixture incorrecto; utilizar moneyDifference H1 y provider.id; unitarias monetarias/typecheck|Corrección aplicada; regresión pendiente|
|H3-012-F02|Harness PostgreSQL; V-MIG/V-EVI|F02-original-focal.log; F02-original-postgres.log|key_id F1 es text, no uuid; preservar tipo existente y cerrar conexiones también si falla bootstrap|Corrección aplicada; regresión pendiente|
|H3-012-F03|Producto PL/pgSQL; SM-PP-01/T07|F03-original-focal.log; F03-original-diagnostic.log; F03-second-diagnostic.log|Resolver colisiones basis/v entre columnas, variables y aliases sin alterar normas|Corrección aplicada; regresión pendiente|
|H3-012-F04|Producto TTE/serialización; D039/T08|F04-original-focal.log; F04-original-diagnostic.log|El parámetro jsonb del driver convertía una cadena JSON en un escalar; enviar bytes UTF8 y convertir en servidor, conservando igualdad con material aprobado|Corrección aplicada; regresión pendiente|
|H3-012-F05|Producto PostgreSQL; SM-PP-03/G2|F05-original-focal.log|Paréntesis explícitos en sustracción de claves de identity, conservando contrato fail-closed|Corrección aplicada; regresión pendiente|
|H3-012-F06|Verificador; V-EVI/V-AT|F06-first-matrix-original.log|R041 debe incluir rechazo B07; R046 usa byPurpose real; R079 necesita lector humano independiente para no esperar el bloqueo F2 de la misma sesión; expected intacto|Corrección pendiente|

La primera matriz termina con 97 PASS y 4 FAIL del runner (tres casos y contenedor), 0 skipped/cancelled. R079 quedó esperando el bloqueo F2 de su propio actor; se terminó exclusivamente la conexión sintética que retenía el lock de prueba para completar y conservar esa ejecución. No se cambió producto para acomodar este error de harness.
