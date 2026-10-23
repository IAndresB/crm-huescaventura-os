# H6 — Propuesta determinista de publicación tras el cierre local H6-001

**PREPARADA, NO EJECUTADA. H6-001 COMPLETED local/aislado; H6 global IN PROGRESS.** No hay autorización de commit, push, integración en main, publicación remota, Drive o despliegue. Este documento perfecciona el [inventario anterior](publication-TSK-H6-001.md) sin modificarlo.

## Inventario literal y lotes

Base `971c55d5ce5770c71284d106d3c0deecca9514b5`, únicamente refs locales observados. [Catálogo exacto de rutas y versiones](../../tests/fixtures/h6-001-local-closure/publication-paths-v1.json): **4.899 rutas / 4.902 posiciones path+hash** de los lotes previos y del candidato H6-001. Cada posición conserva tamaño, origen, manifiesto y SHA. 4.862 rutas tienen propuesta de archivo exacto; 34 están excluidas como metadatos de preservación local; tres tienen resolución documental aislada pendiente de autorización. No son 4.899 archivos automáticamente publicables ni casos de prueba.

El lote D2 nuevo se enumera por su [manifiesto de cierre](../../tests/fixtures/h6-001-local-closure/delivery-manifest-v1.json), sin incluirse recursivamente en el catálogo que contiene. La lectura final tiene su [manifiesto separado](../../tests/fixtures/h6-001-local-closure-readback/receipt-manifest-v1.json). La lista literal completa se compone de esos tres inventarios; sus envolturas están identificadas expresamente. Los artefactos locales de inventario, preflight y recibos requieren selección expresa y revisión de metadatos antes de cualquier destino remoto.

| Lote | Contenido y raíz de identidad | Dependencia y puerta |
|---|---|---|
| A | H6-006/H6-008; inventario `8d0f443747cdb1d66f9cd9af0945fc5df12e81bf16cf25cf9f4e2060fdbb7982`, 4.067 payloads + 3 envolturas. | Base. Selección explícita de R2 aceptado; R1 no se incorpora. |
| B | H6-015 técnico y correctivos/auditorías. Cadena literal de manifiestos en `sourceManifests`; aceptación `542321de105ab58d2ba662c4e4936ce0a057e6c83beb7aca2d3a8c1eb550e499`. | A y sus identidades exactas. Publicación no autoriza ejecutar los scripts históricos ni acceder a cuarentena. |
| C | Cierre formal H6-015 y auditoría; snapshot `8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0`, manifiesto `991d14013efd0f2527dea48bdc50dd426747a6089d15fc54745eac8140b15ada`. | B. Sus decisiones y textos permanecen históricos e intactos. |
| D1 | H6-001 técnico: 305 propios, dos envolturas principales y diez archivos de recibo; manifiesto `d97ab86cd4d78c001f5a5e29f3ce501c0c6b44cf592a7b22e78589c26569c435`. | 14 antecedentes exactos de A/B, ocho de producto y seis de pruebas/soporte. Publicar el test sin esas dependencias no reproduce el candidato. |
| D2 | Aceptación/cierre local H6-001, tres variantes, patch no aplicado, verificadores, inventario y custodia nueva. | D1; C para cualquier resolución documental combinada. Autorización expresa sobre la identidad final de D2. |
| E | Históricos, R1, archivos excluidos y 14.954 untracked históricos del principal, cuyo índice literal se referencia en el catálogo. | Preservación. Sin inclusión masiva ni publicación implícita. Los FAIL que ya forman parte de paquetes seleccionados permanecen en ellos. |

No se duplica código para resolver dependencias. El catálogo agrupa versiones iguales por path+hash y conserva todos sus orígenes. Los 14 archivos heredados están enumerados separadamente, sin atribuirlos a cambios nuevos H6-001. No hay migraciones nuevas. El inventario no reemplaza una decisión de autorización sobre los archivos de A/B/C.

## Solapamientos y procedencia

Las únicas rutas con bytes diferentes entre los conjuntos manifestados seleccionados son `docs/NEXT-STEPS.md`, `docs/PROJECT-STATUS.md` y `specs/001-core-crm/tasks.md`. Los [pre/posthash y fuentes](../../tests/fixtures/h6-001-local-closure/documentary-variant-manifest.json) y el [parche exacto](../../tests/fixtures/h6-001-local-closure/documentary-variant.patch) proponen preservar el cierre H6-015 histórico, el inicio H6-001 histórico y el cierre H6-001 actual. Los originales se conservan sin modificación. La variante es **resolución propuesta no aplicada, pendiente de autorización expresa de publicación conjunta**; no fusiona automáticamente los lotes H6-001 y H6-015.

Las dos variantes históricas de autenticación se verifican por origen/hash:

| Ruta | R1 histórico excluido | R2 aceptado localmente |
|---|---|---|
| `src/infrastructure/auth/supabase-auth-provider.ts` | `9f483e7909d6c2773c20f1a351a64021774bd17b501f19e8d1e76f16fa073248` | `5bbd34da40f2e927b21917bd23ae8d0a24bbae9c645fc33c69d675ed326d0e9e` |
| `src/server/human-auth-session.ts` | `c019972f8cc011325e7e8e9e5c536149eb4544e5933e02cca7b530101621c3cb` | `4be67b2900b794f211df753d30520693b9aaeb93b4a7d8eca30f2b18d92b56ec` |

R1 procede de `h6-auth-independent`/`h6-auth-integration`; R2 se coteja con `h6-auth-corrective` y los sucesores declarados. Los scripts de inventario solo leen estos bytes. No alteran autenticación ni mezclan variantes. `git-before.bin` y `preservation-baseline.json` de H6-015 permanecen expresamente excluidos como `localOnlyPreservationMetadata`.

## Procedimiento propuesto, aún no autorizado para ejecutar

1. Fijar autorización posterior por lote y lista literal de rutas/hash/modos, incluyendo por separado la resolución documental si se selecciona. Confirmar entonces la base remota real; este cierre no la ha consultado.
2. Preparar un destino de integración nuevo y exclusivo, con snapshot previo recuperable. No usar principal ni los worktrees sellados como destino de copias. Releer cada fuente contra su manifiesto y comprobar las exclusiones locales; no copiar directorios completos.
3. Aplicar el orden A → B → C → D1 → D2 en revisiones separadas. Las coincidencias path+hash se satisfacen una sola vez, conservando procedencia. La selección de un lote no selecciona implícitamente otro. Las rutas documentales conflictivas quedan bloqueadas hasta aprobar sus postimágenes combinadas; el resto puede verificarse independientemente.
4. Para cada archivo seleccionado: si el destino ya tiene la postimagen exacta, registrar `ALREADY_APPLIED` y no escribir; si tiene la preimagen esperada o falta una alta prevista, proponer únicamente la postimagen fijada; ante cualquier otro contenido, bloquear esa ruta y conservar el ajeno. Los hashes no se recalculan para hacer coincidir una fuente divergente.
5. Contrastar el inventario de resultado completo, modos, ausencia de rutas extras, diff, estado del índice y pruebas mínimas de la tabla siguiente. Una repetición sobre el mismo resultado no añade archivos, versiones ni efectos. Los 5.575 controles del cierre incluyen esta clasificación determinista y su no-op posterior; no son una aplicación real del plan.
6. Solo con autorización correspondiente, preparar el árbol Git exacto y su lectura independiente antes de publicar. Los candidatos históricos se verifican contra sus originales o blobs inmutables, no contra versiones posteriores de los documentos compartidos. No debilitar los verificadores congelados que exigen HEAD/base/documentos originales; el nuevo árbol necesitará un readback de integración propio.

El [generador de inventario](../../scripts/prepare-h6-001-publication-inventory.py) es de solo lectura y produce JSON determinista. No contiene staging, aplicación de parches, commit, push, restore ni acceso de red. Las propuestas de archivos identifican preimagen y postimagen; el script no ejecuta sus escrituras.

## Comprobaciones mínimas posteriores por integración

| Integración futura | Comprobación necesaria |
|---|---|
| A, componentes Auth R2 | Identidad exacta de R2 y pruebas/soporte aprobados; `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`. Contrapruebas de Auth/sesión en recursos sintéticos nuevos cuando cambie la composición, según sus instrumentos originales. |
| B, antecedentes C04/B07/C07 | Igualdad de los ocho archivos de producto y seis de soporte requeridos por H6-001; 68 migraciones intactas; mismas comprobaciones estáticas/unitarias. Si cambia la composición efectiva, repetir el focal H6-001 con DB/Auth/Storage nuevos y separados, una vez disponibles sus dependencias. Nunca ejecutar automáticamente restauración o S11 de H6-015. |
| C, documentos H6-015 | Hashes, manifiestos, cronología, literal de las decisiones anteriores y cuarentena documental. Ninguna prueba requiere su runtime. |
| D1, recorrido H6-001 | Identidad de fuente y expected; focal local con `node scripts/run-h6-001.mjs focal` en destino aislado si la integración cambia las condiciones probadas. Revalidar las 46 reconciliaciones; no declarar limpia la histórica completa sin ejecutarla y obtener ese resultado. |
| D2, cierre documental | Lectura independiente del estado COMPLETED local/H6 IN PROGRESS, conservación de originales, patch/postimágenes autorizadas, integridad de lotes y recibos. Sin reejecución funcional si solo cambian documentos y sus condiciones permanecen idénticas. |

Las pruebas indicadas son una propuesta para ese futuro destino. Las pruebas reales del expediente actual ya están selladas; aquí solo se han reejecutado verificaciones documentales/de integridad. La publicación de un script no autoriza ejecutarlo sobre una cuarentena.

## Rollback y recuperación propuestos

Ante un hash desconocido, archivo faltante, dependencia no autorizada, regresión material, aparición de datos reales o intento de acceso a cuarentena: bloquear la operación afectada y conservar evidencia. Antes de publicar, descartar únicamente el destino nuevo que se haya creado para la integración, tras conservar su estado y diagnóstico; los worktrees fuente, principal y snapshots quedan intactos. No usar `reset --hard`, limpieza masiva ni sobrescritura de fuentes como reparación.

Después de una eventual publicación autorizada, la recuperación sería un cambio compensatorio revisado sobre la identidad publicada, con autorización propia; no force-push ni reescritura de historia. Los snapshots archivados prueban recuperabilidad documental, no una restauración de runtime ejecutada aquí. Ningún rollback de código levanta bloqueos, reproduce pagos/comunicaciones o reanuda los cuatro trabajos de H6-015.

La propuesta queda preparada para revisión del director. Su aceptación no se presupone por el cierre local H6-001. Drive, despliegues, Production, conectores reales y reentrada no son necesarios para completar este cierre y mantienen puertas independientes.
