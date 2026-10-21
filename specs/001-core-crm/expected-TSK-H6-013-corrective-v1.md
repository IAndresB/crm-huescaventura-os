# H6-013 — expected adicional del correctivo controlado v1

Este suplemento corresponde exclusivamente a AUD-H6013-01/02/03. La observación04 afecta a interpretación de contadores. No sustituye los expected originales ni sus tres sellos. Fuentes aprobadas: base `8a5f1408777b81b760a02646fa414a34dc17983e`, Tasks2.2–2.3/6/7 y ficha H6-013; Plan5.4/10.1/11.4; SPEC-FR-HIST-002, AC-079, P13 y G4.

El expected ejecutable `tests/fixtures/h6-013/corrective-v1/expected.json` y el inventario independiente `inputs/expected-definers.json` se identificaron mediante `expected-seal.json` antes de cualquier ejecución del correctivo. Este texto explica esos criterios ya sellados; no cambia sus valores. Cada intento conserva sus instrumentos, comandos y resultados con una etiqueta nueva.

## Funciones privilegiadas

Descubrir todas las SECURITY DEFINER en espacios de nombres no pertenecientes al sistema, sin una lista cerrada de cuatro esquemas. Comparar firmas, esquemas, propietarios y permisos efectivos ordinarios con el catálogo independiente de la primera auditoría, preservado en custodia duradera y referenciado por hash. El conjunto de132 firmas es una fotografía de esta base concreta, no una regla numérica universal.

Las propiedades incompatibles del propietario son LOGIN, SUPERUSER, BYPASSRLS, CREATEROLE y CREATEDB. La política de búsqueda aplicable a esta fotografía exige una configuración explícita única con los esquemas `pg_catalog, pg_temp`, en ese orden; no acepta `public`, `$user`, orden inverso, ausencia ni ambigüedad. La configuración se lee de pg_proc.proconfig; no se usa el search_path de la sesión del auditor como sustituto.

Controles reales en transacciones desechables: propietario inseguro en una función antes omitida, `search_path=public`, orden `pg_temp,pg_catalog`, ausencia de search_path, filtro incompleto de esquemas, función privilegiada inesperada fuera de los esquemas CRM y permiso EXECUTE ordinario inesperado. Cada control debe fallar en el verificador por su causa concreta. Tras rollback, el catálogo debe ser idéntico y el conjunto legítimo aceptado.

## Conservación H1

Obligatorias:19→20,20→21,21→22 y22→23. El examen de pruebas heredadas encuentra debilidad semejante en23→24 y24→25; se incluyen ambas, además de18→19 y25→26 como enlaces adyacentes H0/H1/H2. Son ocho transiciones desde predecesores SQL auténticos, no ocho releases inventados.

Preparar datos sintéticos mediante los contratos reales disponibles en cada prefijo: actor/sesión/probe H0; identidades, contexto y relaciones19; código/archivo20; catálogo/versiones21; configuración comercial22; documento e historia23; metadatos de objeto preparado24; Task25. Los metadatos24 se persisten en PostgreSQL; este ensayo no pretende acreditar contenido binario en Storage.

Antes de cada aplicación, registrar tablas y columnas anteriores, hashes completos ordenados, restricciones y referencias de fixture. Cada columna preexistente conserva exactamente su contenido. Las ocho migraciones no prescriben transformar valores anteriores. Las nuevas columnas20 de archivo/fusión comienzan nulas; el posterior archivo sintético es un acto independiente de preparación del siguiente predecesor.

Inyectar fallo antes de COMMIT en una copia del SQL y comprobar rollback de esquema/datos, después aplicar SQL oficial. Intentar cambios de valor, pérdida de fila y cambio de referencia válida en transacciones locales; el comparador debe detectarlos y el rollback restaurar el original. Comprobar restricciones anteriores, FK/UNIQUE reales, RLS y denegación de lectura directa de identidades ordinarias. Las lecturas legítimas posteriores prueban compatibilidad del contrato disponible.

Los hashes de filas de claves técnicas se registran sin volcar sus valores secretos. Los datos de prueba no se convierten en reglas o valores productivos.

## Suplemento temporal del entorno de regresión

El intento10 conservó un FAIL del fixture histórico F12 al pasar la medianoche UTC del20 de octubre. Su hecho externo fijo dejó de ser posterior al instante de acción por defecto. La regla SQL aprobada sigue exigiendo que el hecho no sea posterior a la acción; no se modifica el producto, la fuente histórica ni su aserción.

Antes de repetir este caso se creó `corrective-v1/expected-temporal.json`, sellado por `expected-temporal-seal.json` a las00:16:32Z. Deriva de los tres archivos históricos identificados por hash. Dos controles independientes usan el parámetro de dominio `options.at` ya admitido por el fixture: acción23:59Z anterior al hecho00:00Z debe rechazarse con `AVAILABILITY_CHRONOLOGY_REQUIRED:E3`, conservando datos; acción00:01Z posterior al hecho permite verificación legítima. No se modifica Date, el reloj del servidor ni la caducidad de Auth/F1/F2.

El hook H6 conserva el hook oficial y adapta exclusivamente la llamada del fixture F12 de `postgres-h4-006-scope-reproducer.test.ts`, pasando el instante anterior. El resultado fallido original permanece disponible. Esta reparación ordinaria de preparación de ensayo no amplía el alcance funcional ni reinterpreta la regla temporal.
