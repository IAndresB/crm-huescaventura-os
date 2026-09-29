# TSK-H1-007 — expected normativo previo

Base `4035a232bb50441877e81860753535a2511f7cd6`. Matriz fijada antes de implementar. Oráculo: Tasks H1-007/§§6–7; Plan §§5.1–5.2; SPEC FR-CAT-004–007, FR-HIST-002, AC-010/038/049/085; D019/D023/D028/D029; BR-ECON-001/006/007, BR-PACK-001–004, BR-PROMO-001/002, BR-PAX-005/007, BR-DOC-001–004; DM §5.1, INV-001/018/024/027–029/043; Constitución P05–P07/P10/P13.

| ID | Expected local |
| --- | --- |
| I01 | Tariff tiene ID estable, versiones inmutables, fuente/vigencia, importes y tratamiento fiscal conocidos o desconocidos expresamente; referencias exactas a Service/Variant/Offering, unidad y forma cuando apliquen. |
| I02 | Pack maestro versionado conserva composición exacta. La personalización puede existir sin maestro y convertirse en maestro solo por acción manual trazable, sin reescribir su versión histórica. |
| I03 | Promotion Version solo representa política aprobada; novio/a gratis exige condiciones y modalidad concreta para efecto definitivo, no crea otra promoción automática ni cambia cantidad/deudas. |
| I04 | Capacidad y elegibilidad versionadas son distintas de recomendación, disponibilidad temporal y confirmación. Desconocido no equivale a ilimitado/elegible. |
| I05 | Requisito/documentación por finalidad versionados; configurado, aplicable, exigido y recibido/revisado permanecen separados; requisito no acredita documento. |
| I06 | Coste hotelero material desconocido impide precio definitivo dependiente; ausencia de unidad impide cálculo por persona; BR-PENDING-022 impide fiscalidad dependiente. No se implementa motor monetario H1-009. |
| I07 | Nueva versión de cualquier configuración no altera versión/aplicación anterior; reconstrucción desde conexión independiente. |
| I08 | F1/F2, C01/C02/C03, ámbito, RLS/FORCE, grants, replay, concurrencia y atomicidad impiden bypass y efecto parcial. |
| I09 | Migración forward-only sobre H1-006 conserva datos anteriores; fixtures sintéticos únicamente. |

BR-PENDING-022 permanece abierto para tipos/tratamientos concretos sin verificar. No hay valores comerciales reales, hosted, Auth real ni Production acreditados por este bloque.

## Observado local

| ID | Observado | Resultado |
| --- | --- | --- |
| I01 | Tariff con ID y revisiones; EUR explícito, estado de importe/coste `unknown`, `estimated`, `confirmed` o `real` separado de tratamiento IVA `unknown`/incluido/excluido. Decimal textual sin recorte arbitrario, tramos y referencias exactas a catálogo, unidad y forma. Vigencia distingue fecha civil e instante con desplazamiento explícito. | PASS |
| I02 | Pack maestro y `custom_pack` independientes. `promote_custom` exige acción F1/F2 humana, crea nuevo ID con origen en revisión personalizada y deja la revisión original inmutable. | PASS |
| I03 | Promotion Version conserva los parámetros aprobados de «novio/a gratis», incluido mínimo 15, composición y base por modalidad concreta; otra política automática se rechaza. El guard C02 requiere modalidad/precio y elegibilidad objetiva verificados; no calcula importe. | PASS |
| I04 | Capacity Rule `known` con unidad y máximo, o `unknown` sin valor supuesto; Eligibility Rule conocida/desconocida separada de recomendación. C02 exige disponibilidad temporal verificada cuando la acción la necesita; ninguna configuración crea confirmación. | PASS |
| I05 | Document Requirement conserva finalidad, tipo, carácter imprescindible y conocimiento explícito; no contiene estado `received` ni `reviewed`. El guard C02 bloquea requisito imprescindible faltante. | PASS |
| I06 | Guard C02 bloquea precio definitivo si tarifa/coste hotelero material, fiscalidad, vigencia o unidad necesaria están sin verificar. Estimado no equivale a confirmado. No hay motor PM-01–PM-13. | PASS |
| I07 | Aplicación focal de Tariff conserva snapshot y referencia de catálogo tras nueva revisión. La matriz formal comprueba siete revisiones desde conexión independiente. | PASS |
| I08 | `commercial_apply/read` consumen F1/F2, C03/C01 y scope; replay idéntico inerte, material cambiado rechazado, un ganador concurrente y fallo inyectado en historia revierte todo. Runtime, PUBLIC, anon y authenticated sin acceso directo. | PASS |
| I09 | La migración `202609290004_h1_commercial_rules.sql` aplica después de H1-006 sin editar migraciones previas; identidad H1 anterior y revisión de catálogo previa persisten. | PASS |

Ensayos focales: `tests/integration/postgres-h1-007.test.ts` 6/6 PASS; guardas C02 en `tests/commercial-rules.test.ts` 5/5 PASS. PostgreSQL 17.11 efímero, claves/actores/servicios/tarifas sintéticos. Los primeros intentos revelaron una fixture que pasaba vigencia a `create`, un `price_state` omitido que el SQL aceptaba y una referencia PL/pgSQL ambigua en Capacity Rule; se conservaron los fallos, se corrigieron y se reejecutaron las focales. Ningún dato comercial real se cargó.

Gates finales: `pnpm install --frozen-lockfile` PASS; `pnpm audit --prod` sin vulnerabilidades conocidas; `pnpm test` 36/36 PASS; `pnpm run test:postgres` 299/299 PASS tras corregir H1-008-F04; `pnpm run typecheck`, `pnpm run lint`/boundaries y `pnpm run build` PASS; `git diff --check` PASS. El primer intento de regresión PostgreSQL falló en H0-017 R10 por F04 y se conserva en la evidencia formal; el segundo recorrió toda la suite desde cero. Búsqueda focal de secretos: sin hallazgos.
