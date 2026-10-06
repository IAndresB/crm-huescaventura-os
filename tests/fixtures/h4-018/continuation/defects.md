# Cronología H4-018: antecedentes originales y retest

Estado de esta cronología previa a la regresión definitiva: correcciones focales PASS; cierre depende del SHA final probado. Expected original intacto. No se reinterpretan los resultados de otros bloques.

|ID|Clase|Primera evidencia ejecutada|Causa y corrección|Retest focal|
|---|---|---|---|---|
|F01|Técnico de entorno|focal1: ISOLATED_STORAGE_REQUIRED, exit 1|Invocación directa omitía el runtime Storage aislado. Se usa scripts/test-postgres.mjs existente.|focal2 arranca Storage; focal5+ recorrido pasa.|
|F02|Material (migración no instalable)|focal2: 42601, syntax error, posición12615|CASE en expresión de IF necesita paréntesis, sin cambiar regla.|focal3 instala; focal5+ PASS.|
|F03|Material (entrega bloqueada)|focal3 fallo normalizado; focal4 diagnóstico 42702|Alias SQL x ambiguo con variable PL/pgSQL. Directiva local use_column para alias de consultas.|focal5 AC036 PASS.|
|F04|Técnico del verificador|focal6: trigger syntax cerca de each; posteriores fallos de función existente son cascada|Faltaba espacio entre nombre de tabla y FOR. Conservadas las cinco salidas FAIL; no cinco defectos materiales.|focal7 y siguientes: inyecciones PASS.|
|F05|Material (migración no instalable)|focal8: 22P02 Token fund inválido; 75 casos fallan por before común|Precedencia del operador JSON en normalización de identidad. Se añade paréntesis al operando.|focal9 instala y 74/75 PASS.|
|F06|Material (custodia interna bloqueada)|focal9: 42703 columna destination inexistente|Se consultó una columna no existente del root Allocation. Usa fund_allocations canónico, exige status verified y purpose deposit.|focal10 custodia interna y 75/75 PASS.|
|F07|Técnico del verificador|typecheck invocado por herramienta: TS2352, exit1; salida combinada conservada en typecheck-F07.extract.txt|El doble de pérdida de respuesta requiere cast mediante unknown. No cambio de producto.|typecheck1 y prefreeze-typecheck PASS.|
|F08|Material (scope noche)|Observación estática tras primer commit; F08-original: 93/94, MODIFICATION_DENIED|Faltaba serviceId en llamada a modification_scope(kind=night). Fix de integración añade serviceId tanto en kernel como finalcheck. H2 real conserva snapshots.|F08-retest:98/98; prefreeze-focal incluye ampliación de prohibiciones.|

F01: stdout/stderr se redirigieron completos; exit1 está en el resultado real de herramienta. No se capturaron signal/error separados y no se reconstruyen. F07: extracto explícito de la salida combinada original, sin afirmar separación stdout/stderr. Desde focal2 el capturador conserva stdout, stderr, status, signal y error del proceso hijo. Los anteriores runners no capturaban SHA dentro de su status; los commits y cronología contextual se conservan, sin fingir ejecución de un árbol limpio anterior al freeze.

F08-original se ejecutó con HEAD76ec263 y verificador en elaboración. No se atribuye ese repro a un conjunto de verificadores ya congelado. La migración original de ese commit se recupera con git show76ec263:supabase/migrations/20261006133716_h4_deposit_guarantee_custody.sql.

F09 — técnico del verificador: primer run final sobre92cdfe3 detenido en typecheck (TS2540). Fixture de noches modificaba propiedades readonly. Se reconstruye detalle/command inmutables antes de conversión; no cambia ninguna expectativa ni producto. FAIL completo en failed-final-92cdfe3/final-typecheck.*; el nuevo SHA exige regresión completa.
