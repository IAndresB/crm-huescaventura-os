# H6-015 — Preparación independiente de auditoría v1

22 de octubre de 2026. Estado: **EXPECTED CONGELADO; INSTRUMENTACIÓN PURA PROBADA; RESTAURACIÓN INDEPENDIENTE NO EJECUTADA**.

Worktree propio: `/Users/andres/.codex/worktrees/h6-restore-audit/crm-huescaventura-os`. HEAD `971c55d5ce5770c71284d106d3c0deecca9514b5`. No se modifica el worktree ejecutor ni las fuentes de los proveedores. No se han creado clusters, ejecutado SQL, abierto servicios o hecho restauraciones desde esta auditoría.

## Fuentes y expected

El expected procede de la lectura independiente anterior a la implementación del ejecutor: las quince asignaciones de Tasks §6, Constitution, Spec, Plan, Architecture, D017/D037/D038 y State Machines, desarrolladas por H6-014 r3 y el candidato H6-015 v1. El cierre previo de H6-006/008 no se interpreta como evidencia de restauración.

- [Expected independiente](independent-expected-TSK-H6-015-v1.json): quince asignaciones EI-01–EI-15, doce controles IC-01–IC-12 y 62 propiedades instrumentales P01–P62. SHA-256 `00251408e55631c7ff0a937e76c951c0fb6a0bddebeb5e80ccdeb5623237f8b3`.
- [Source lock](../../tests/fixtures/h6-015-independent-preparation/source-lock.json): ocho archivos de fuente idénticos a HEAD, quince filas literales y las 68 migraciones por bytes/hash. SHA-256 `373ed6ef2a405b7ac6c52cdc913e08d11cae302e49c13ba4eee84344b6b10c69`.
- [Sello anterior a las pruebas](../../tests/fixtures/h6-015-independent-preparation/expected-seal.json).
- [Fe de erratas de referencias](../../tests/fixtures/h6-015-independent-preparation/reference-erratum-v1.json): corrige solo dos números de línea — P13:65 y PLAN-DEC-008:89. Conserva intactos el expected y sus propiedades.

Los identificadores EI/IC/P y el formato de entrada son instrumentos de auditoría, no nuevas normas ni contratos de producto. Los futuros observados se anexarán; no se adaptará el expected para que coincida con el resultado del ejecutor.

## Instrumentación y límites

[Verificador](../../scripts/verify-h6-015-independent.py) y [contrapruebas](../../scripts/test-h6-015-independent.py). Solo leen archivos o comparan valores en memoria. No importan la aplicación, bibliotecas de base de datos ni componentes Auth/Storage; no ejecutan comandos, red o SQL. El CLI imprime únicamente estado/códigos de regla y nunca valores comparados.

Familias disponibles:

| Familia CLI | Argumentos del sobre JSON | Qué comprueba |
|---|---|---|
| `rows` | `[before, after]` | Multiconjunto de filas JSON textual; números exactos, tipos, duplicados, orden de arrays y bitmap SQL NULL. |
| `properties` | `[before, after, kind]` | Nombre, owner, ACL con grantor/opción de concesión y settings completos. Solo Core impide PUBLIC CONNECT/TEMP. |
| `catalog` | `[before, after]` | Comparación exacta de todas las secciones suministradas; presencia de once secciones mínimas. Ninguna exclusión por owner/schema. |
| `snapshot` | `[before, after]` | Momento de captura, inventario de tablas, columnas/tipos/recuentos/digests, migraciones, secuencias, globals y catálogo. |
| `pgcrypto` | `[before, after]` | Owner/schema/versión exactos y única equivalencia r3 entre bootstraps OID10 para miembros C no-definer con ACL por defecto. |
| `rotation` | `[t0, t1, after, expected_new]` | Claves restauradas conservadas/deshabilitadas, inventario exacto nuevo, no reutilización de generaciones/secretos, separación F1/F2 y propósitos congelados. Entradas siempre privadas. |
| `object` | `[observation]` | Clasificación derivada de metadata/bytes/digest/tamaño/media/vínculo y denegación si falta autoridad antes o después. |
| `effect` | `[observation]` | Identidad exacta, contador durable, cobertura de fuente, reserva e intento no fabricado; sin contacto ni reentrada nueva. |
| `scope` | `[observation]` | Cuarentena, S11 no ejecutada, tarea no completada y pendientes conservados. |
| `measurement` | `[observation]` | Intervalos monotónicos no negativos, desconocido distinto de cero y objetivos productivos no inventados. |
| `startup` | `[observation]` | Variante de arranque seleccionada compatible con la revisión estática, sin migrate ni funciones opcionales activas. |
| `manifest` | `[root, manifest]` | Existencia, ruta contenida, bytes, digest y modo opcional por entrada. |

El sobre lleva exactamente `{"arguments": [...]}`. El esquema concreto de cada argumento está visible en las funciones y los datos ficticios de las contrapruebas. Una captura real exige conservar procedencia y cobertura, y contrastar su adquisición independientemente. Una suma de flags PASS, dos snapshots derivados del mismo destino o un manifiesto suministrado por el ejecutor no prueban ejecución ni integridad por sí mismos.

El comparador de snapshot usa descriptores completos por tabla; los digests deben proceder de captura canónica privada contrastada con `rows`, nunca de una normalización con Number. `catalog`/`globals` no corrigen automáticamente diferencias de bootstrap: toda excepción debe ser explícita, acotada y autorizada. La equivalencia permitida de pgcrypto es un instrumento separado y no autoriza normalizar membresías o grantors.

Las entradas con sesiones/factores/secretos/configuración deben permanecer fuera de Git y de este paquete, bajo custodia privada. El instrumento no publica sus valores, pero no sustituye el control de custodia del llamador. El código de salida cero se etiqueta `PASS_INSTRUMENTAL_ONLY`; no existe salida automática `H6-015 COMPLETED` ni PASS independiente funcional.

## Resultados puros e historia

[R1](../../tests/fixtures/h6-015-independent-preparation/pure-results-r1.json): 61 PASS y un FAIL P33. La fixture compartía la lista `purposes` entre el valor alterado y su descriptor esperado; al mutar ambos, ocultaba el ensanchamiento. Se conservan el resultado y ambos scripts originales en `r1-sources/`.

La corrección utiliza una copia independiente del descriptor de prueba. No cambia ninguna propiedad esperada ni código de producto. [R2](../../tests/fixtures/h6-015-independent-preparation/pure-results-r2.json): **62/62 PASS**, cero FAIL, todos instrumentales y con datos ficticios. Los números no cuentan pruebas de PostgreSQL/Auth/Storage/restauración.

## Proveedores fijados

[Revisión estática y hashes](../../tests/fixtures/h6-015-independent-preparation/provider-source-review.json): siete archivos Auth se cotejan byte a byte con el archivo público cacheado fijado y siete Storage con Git HEAD limpio. El directorio extraído Auth no contiene `.git`; su identidad se acredita por hash de archivo y recibo previo, no por un Git inexistente. No se modificó ningún proveedor.

Auth raíz llama `migrate` antes de `serve`; el subcomando `serve` evita esa llamada. Sin embargo, su trabajador de índices puede crear índices si se activa cualquiera de las dos opciones de `IndexWorker`. Ambas deben permanecer desactivadas. El recargador de plantillas requiere configuración sin salidas externas. Se exige catálogo/ledger antes y después del arranque y enumeración de cambios de datos legítimos.

Storage estándar `dist/start/server.js` llama a migraciones en single-tenant. `DB_MIGRATIONS_FREEZE_AT` no es un interruptor que desactive migrate. El builder oficial de `src/app.ts` permite separar API y bootstrap en un launcher propio, sin editar proveedor. El middleware de peticiones no ejecuta sus ramas de migración cuando `isMultitenant=false`. Esa lectura estática aún requiere contraste dinámico del catálogo/ledger tras arranque y primera petición real. Los artefactos `dist` se han inventariado; no se atribuye todavía una construcción reproducible desde el source fijado.

## Límites y siguiente uso

S11 sigue prohibida. Se admiten mediciones y documento parciales de fases realizadas; no se puede falsificar `explicit_reentry` para satisfacer la cadena JSON completa r3. ARCH-PENDING-002 y DM-PENDING-005 permanecen OPEN; Hosted/Production no acreditados.

La siguiente auditoría requiere candidato ejecutor congelado, manifiesto, fuentes y evidencia recuperable, y autorización para recursos independientes cuando proceda. El nuevo [hallazgo S05](independent-finding-TSK-H6-015-S05-grantor.md) se documenta aparte después de recibir el FAIL del ejecutor; no modifica el expected previo ni transforma esta preparación en aceptación.

STOP antes de servicios/SQL, reentrada, publicación o despliegue desde esta auditoría.
