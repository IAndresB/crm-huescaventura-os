# TSK-H6-008 — Acta de aceptación, cierre y trazabilidad local

22 de octubre de 2026, Europe/Madrid. **TSK-H6-008 COMPLETED exclusivamente local/aislado.** H6 global no queda completada. H6-015 permanece NOT STARTED.

## Autoridad y condición cumplida

El director acepta técnicamente R2 y autoriza su cierre local si el candidato conserva íntegramente los resultados y evidencias auditados. La [constancia de autorización](../../tests/fixtures/h6-local-closure/authorization.json) identifica esa instrucción; no es una firma criptográfica ni una autorización de publicación.

La [verificación de cierre](../../tests/fixtures/h6-local-closure/verification.json) es **PASS**: se comprobaron los 4.055 payloads del manifiesto final, bytes, SHA-256 y modos; coincidencia exacta del inventario inicial y ausencia de incorporaciones posteriores; checkpoint ejecutable R2; expected y FAIL históricos; las diez fuentes aprobadas; las 23 asignaciones literales y su cobertura independiente; manifiestos originales y recibos/logs de las pruebas. No apareció discrepancia material, por lo que no se repitieron pruebas completas ni se inició infraestructura.

## Identidad aceptada

- Base Git: `971c55d5ce5770c71284d106d3c0deecca9514b5`; árbol base: `8b43af1acc0d4be40321de1c5bc303129cdb47cd`.
- Manifiesto R2: `tests/fixtures/h6-auth-corrective/delivery-manifest-r2.json`, **4.055 payloads**, SHA-256 `23419baa5d5ddb985ce4ac42d1d408d510ffad89959b1154fb0e6f147e30f14f`.
- Checkpoint ejecutable: 13 archivos, SHA-256 `c71b34b195cb922b2b7e3945f176b78cb279063f2b0fbe50c5da08dceb02ee9e`.
- Revisión independiente R2: 564 payloads, manifiesto SHA-256 `63fb482b12b44672db1abd948970a7ae2ec682788b9e02f3a59822baad086af9`.

La aceptación recae sobre estos bytes sin commit, no sobre una rama móvil. Esta acta y los demás documentos de cierre son incorporaciones posteriores inventariadas por separado; no forman retrospectivamente parte de las pruebas ni del manifiesto R2. Los informes anteriores que dicen «candidato» o «pendiente de aceptación» se conservan y quedan sucedidos por esta decisión operativa.

## Fundamento del cierre

Las dependencias H5-019, H0-006, H0-014, H1-016 y H5-012 mantienen su salida local acreditada. La [matriz R2](matrix-TSK-H6-008-r2.json) conserva 23 asignaciones sin alterar requisitos. El [dictamen independiente](../../tests/fixtures/h6-auth-independent-r2-custody/specs/001-core-crm/independent-review-TSK-H6-008-r2.md) no deja defecto material abierto dentro del alcance examinado.

F01 queda cerrado: captura de generación antes de TOTP, comparación al establecer y revalidación SQL bajo bloqueo; I04 conserva su expected y ahora deniega, e I05 devuelve SQL42501 para una capacidad anterior a la revocación que llega tarde. M02 queda cerrado: 105 entradas Core con control positivo y 630 denegaciones directas más 630 HTTP; 103 trazas de clases y dos funciones Work con excepción instrumental documentada y guardias revisadas. El mapa de 111 entradas distingue además cinco operaciones de sesión y una de metadatos. Esta cobertura de admisión no significa todas las ramas funcionales del producto.

Resultados ya ejecutados y ahora verificados: 17 integrados Auth/HTTP/PG/Storage, tres F01 y siete M02 PASS; revisor separado 32 PASS, sin saltos. Regresión H6-006 62 PASS; histórica H6-008/H0/H1 60 PASS y un skip S10; 210 unitarias y lint/typecheck/build correctos. S10 conserva su estado histórico y su carencia se acredita por separado con Auth real. Las reproducciones no se suman como casos distintos.

Auth y Core se contrastan por separado: una firma JWT puede seguir válida tras logout; el proveedor local fijado rechaza `/user` y refresh cuando la sesión ha sido eliminada. Core conserva cierre durable ante Auth503 y no declara éxito global ficticio. La autoridad Core, las sesiones del proveedor y las generaciones F1/F2 son controles distintos.

## Alcance y reservas

Se acredita únicamente el entorno local/sintético con Supabase Auth v2.197.0, PostgreSQL 17.11 y Storage fijado. No se acredita Hosted/Production, UI completa, dispositivos físicos, recuperación real, continuidad multinodo ni restauración. Los handles son memoria del servidor; su pérdida exige nueva identificación. No hay autoridad basada en claims editables o tokens importados por el cliente.

El candidato previo de 291 archivos, R1 adverso, ambas revisiones y todos los expected permanecen intactos. No cambia la normativa, SQL ni los documentos históricos. El [registro operativo sucesor](../../tests/fixtures/h6-local-closure/operational-status.json) anota H6-006/H6-008 COMPLETED local y H6-015 NOT STARTED sin reescribir Tasks.

ARCH-PENDING-002 y DM-PENDING-005 siguen OPEN. Commit, push, custodia remota, publicación, despliegue, reentrada, datos/autoridades reales y ejecución H6-015 no están autorizados por este cierre. **STOP antes de esas operaciones.**
