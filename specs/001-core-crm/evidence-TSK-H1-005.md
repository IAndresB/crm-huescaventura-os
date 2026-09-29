# TSK-H1-005 — contrato previo y evidencia local

Base inicial: `70e1e3a7ab49a750f5115e3bbe985b38a949ce8f`. Matriz fijada antes de implementar. Oráculo: Tasks H1-005, Plan §§4/5.1, FR-CAT-001/002/003, AC-085, Domain Model §5.1/DM-INV-018/028/029, BR-SVC-001/005/006, BR-SUP-001–004, D010 y Constitución P05/P06/P07/P10/P13.

| ID | Expected local |
| --- | --- |
| I01 | Service y Variant tienen identidad distinta; Variant pertenece a un Service; naturaleza propia/externa se conserva por versión. |
| I02 | Definiciones y asignaciones de categoría/atributo, públicos/recomendaciones, unidad y forma de precio son configurables, versionadas y referenciables por versión exacta. |
| I03 | Cambiar cualquier configuración no cambia una versión anterior ni una referencia aplicada; snapshot histórico reconstruible desde conexión independiente. |
| I04 | Recomendación Alta/Media/Baja no representa elegibilidad ni permite dispensar restricciones. |
| I05 | Provider es función/entidad distinta de Contact/Organization y CRM Actor; puede enlazar una identidad verificada sin duplicarla. Offering une Provider y Service/Variant; no acredita disponibilidad, opción ni confirmación. |
| I06 | Cantidad/unidad y forma de precio son conceptos separados; ninguna tarifa, cálculo monetario, capacidad o dato comercial real se inventa en H1-005. |
| I07 | F1/F2, C01/C02/C03, scope, RLS/FORCE, grants y operaciones idempotentes protegen lectura y escritura; concurrencia no duplica versiones; fallo revierte versión, historia y resultado juntos. |
| I08 | Migración forward-only desde H1-004 conserva datos previos. Fixtures PostgreSQL efímeros con actores y catálogo sintéticos. |

H2-011/H4-012 son integraciones posteriores. Los datos reales ausentes bloquean su uso, no esta estructura local. No se acredita hosted ni Production.

## Observado y resultado

| ID | Observado local | Resultado |
| --- | --- | --- |
| I01 | Service y Variant se crean con ID y tipo separados; Variant exige padre Service y su revisión señala versión exacta del padre. | PASS |
| I02 | Se crearon maestros y relaciones de categoría, atributo, público, recomendación, unidad, forma de precio, Provider y Offering con revisión propia. | PASS |
| I03 | Tras publicar revisiones nuevas, las 14 revisiones fijadas en una aplicación siguieron idénticas desde otra conexión. | PASS |
| I04 | `Alta` es un valor de prioridad; el campo `eligible` se rechaza y no hay operación de elegibilidad en este bloque. | PASS |
| I05 | Provider enlazó una identidad Contact verificada sin duplicarla; Offering enlazó Provider/Variant y rechazó `availability`. | PASS |
| I06 | Unit y Pricing Form tienen definiciones y asignaciones separadas; no hay tarifa, capacidad ni cálculo monetario. | PASS |
| I07 | F1/F2 C01/C03 admitieron solo operaciones tipadas; replay idéntico fue inerte, material cambiado chocó, dos revisiones concurrentes tuvieron un ganador, trigger de fallo revirtió item/operación/historia, runtime y roles genéricos no accedieron a tablas. | PASS |
| I08 | La migración `202609290003_h1_catalog_versions.sql` aplicó tras H1-004 y conservó la identidad sintética anterior. | PASS |

Focales: `tests/integration/postgres-h1-005.test.ts`, 4/4 PASS en PostgreSQL 17.11 efímero. Los dos fallos de desarrollo previos al PASS quedaron conservados: primera ejecución `CATALOG_DENIED` por falta del caso `h1-catalog` en `f1LoginAllows`, corregido en `f1-codec.ts`; segunda ejecución `permission denied for table catalog_items` al solicitar bloqueo `FOR UPDATE`, corregida con grant `UPDATE` al dueño ejecutor (sin conceder acceso directo al runtime). Ambos se reprodujeron, corrigieron y reejecutaron; no son defectos detectados durante H1-006. La versión publicada contiene ambas correcciones.

Gates finales: `pnpm install --frozen-lockfile` PASS; `pnpm audit --prod` sin vulnerabilidades conocidas; `pnpm run typecheck` PASS; `pnpm run lint`/boundaries PASS; `pnpm test` 31/31 PASS; suite PostgreSQL acumulada 291/291 PASS; `pnpm run build` PASS; `git diff --check` PASS. Búsqueda focal de secretos sin hallazgos. Ningún secreto, email, proveedor, tarifa, capacidad, cuenta o dispositivo real se usó. Sin Supabase hosted ni Production.
