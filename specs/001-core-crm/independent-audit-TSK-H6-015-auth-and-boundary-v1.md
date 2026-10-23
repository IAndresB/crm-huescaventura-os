# H6-015 — Auditoría independiente de Auth y frontera S05

Fecha: 2026-10-22. Worktree auditor: `/Users/andres/.codex/worktrees/h6-restore-audit/crm-huescaventura-os`. Base: `971c55d5ce5770c71284d106d3c0deecca9514b5`. Solo local, aislado y sintético. Sin S11, Hosted, Production, comunicaciones externas, commit, push o cambio de normativa.

## Veredicto y alcance

**PASS independiente de la variante Auth dedicada**, para el candidato congelado del ejecutor `auth-runs/2026-10-22T11-57-53-698Z/report.json`, SHA-256 `9cc4d2f1a8caedfabd9099eabed81f3f70144e8de02d345528d0ce53ab58c60c`. Se ha reproducido su código exacto y se ha efectuado una restauración adicional con adquisición, comparadores y solicitudes HTTP propios.

**Core y Storage permanecen bloqueados por `H6015-S05-GRANTOR`, estado OPEN.** No hay PASS de su restauración, integración S06–S10 ni aceptación integral de AC-073/AC-074. H6-015 no está COMPLETED. La entrada S11 no se ha ejecutado ni autorizado. `ARCH-PENDING-002` y `DM-PENDING-005` permanecen OPEN.

**La adenda de captura pasa una revisión independiente offline de consistencia**, con el límite explícito de que la identidad `work_start` del intento posterior a t0 se apoya en la adquisición del ejecutor y su código/hashes: el auditor no ha consultado su origen principal vivo posterior a t0. Las tres identidades anteriores al corte y la ausencia de la cuarta en t0 sí se han contrastado leyendo el contenido COPY del archivo completo, sin ejecutar SQL Core ni restaurarlo.

## Expected y cadena de custodia

Los criterios se derivaron antes de observar resultados del ejecutor de Constitution, Spec, Plan, Architecture, D017/D037/D038, las 15 asignaciones de H6-015 y el procedimiento r3. No se modificaron para obtener este resultado.

- [Expected original](independent-expected-TSK-H6-015-v1.json): `00251408e55631c7ff0a937e76c951c0fb6a0bddebeb5e80ccdeb5623237f8b3`.
- [Lock de fuentes](../../tests/fixtures/h6-015-independent-preparation/source-lock.json): `373ed6ef2a405b7ac6c52cdc913e08d11cae302e49c13ba4eee84344b6b10c69`.
- [Adenda instrumental de identidad lógica](independent-identity-addendum-TSK-H6-015-v1.json), congelada antes de sus pruebas y adquisición propias: `6f51bf48d40b3a7ef280de4afed8735327ea46c386aaa071ec5bdea2e8653f12`.
- [Verificación de copia del candidato ampliado](../../tests/fixtures/h6-015-independent-preparation/auth-candidate-copy-lock-v2.json). Script: `6a9c2e0510dcd95201f2e91de20b3e078e82ece9967d7c6a459a41ff34307f87`; runtime: `c25f9c99ac5ef5eb57ff23d0b48eaaa13fb663eac227ab02b8209ac95e0a0c2f`; proveedor: `5bbd34da40f2e927b21917bd23ae8d0a24bbae9c645fc33c69d675ed326d0e9e`.
- Binario oficial Auth verificado: `54a5afe7997bd16ab5244ab12c02905048b270a8f76eebf95739a6d364ffe01f`. Dependencia Postgres.js copiada offline y comparada archivo por archivo; recibo en `auth-runtime-prerequisites.json`.

El expected inicial de preparación conserva su estado histórico previo a la ejecución. Este informe documenta la fase posterior autorizada. Las copias de código del ejecutor son insumos de reproducción, no aportaciones del auditor a su producto; el auditor no ha escrito en el worktree ejecutor ni en fuentes proveedor.

## Evidencia Auth observada por el auditor

1. **Reproducción exacta del candidato ampliado: 34/34.** [Informe propio](../../tests/fixtures/h6-015-execution/auth-runs/2026-10-22T12-06-11-132Z/report.json), con copia congelada de los tres archivos ejecutados en su subcarpeta `source/`. La reproducción histórica anterior 30/30 también se conserva en `auth-runs/2026-10-22T11-56-40-867Z/`.
2. **Restauración adicional propia y observación independiente: 9 grupos PASS.** [Informe R7](../../tests/fixtures/h6-015-independent-preparation/auth-independent-runtime-r7.json). Se restauró el archivo completo de Auth y globals en otro cluster efímero nuevo. No se cargaron Core ni Storage.
3. **Esquema SQL completo idéntico byte a byte.** `pg_restore --schema-only --create` leyó el archivo t0; `pg_dump --schema-only --create` leyó origen y destino. Los tres resultados completos coincidieron. Solo se fijó previamente la misma clave de framing `\restrict`; no se eliminaron líneas, owners, ACL, definiciones, tipos o grants. El origen procedía de la reproducción propia, y la lectura de todos sus datos antes/después confirmó que esta adquisición no cambió sus filas.
4. **Datos exactos recanonizados por Python propio:** 27 tablas y 100 filas, todas las columnas, tipos, SQL NULL, números exactos, orden de arrays y multiplicidad. Sus hashes coincidieron con t0. El parser independiente conserva los números como Decimal antes de producir las etiquetas canónicas; no usa float para importes o IDs.
5. **Adquisición propia de catálogo:** 405 columnas vivas y 96 triggers FK, 72 tipos, 26 etiquetas enum y una secuencia con sus parámetros; también roles, caducidad, memberships con grantor, vistas/reglas y ausencia de publicaciones, suscripciones, event triggers y tablas extranjeras en esta variante. El esquema SQL completo complementa esta adquisición estructurada. El único rol adicional fue el bootstrap del cluster nuevo, comprobado contra sus atributos esperados.
6. **Arranque oficial `serve` sin `migrate`:** las fotos anterior y posterior a `/health`, antes de las solicitudes funcionales, conservaron el esquema, catálogo, todas las filas y ledger de migraciones. Se mantuvo deshabilitado el index worker de arranque; las fuentes proveedor no se editaron.
7. **Pruebas HTTP directas propias:** la sesión t0 reapareció en cuarentena tras restore; la t1 ausente en el backup fue rechazada con HTTP 403 y `session_not_found`, y su refresh con HTTP 400. Después del logout global, tanto t0 como la sesión emisora conservaron HMAC y expiración válidos, pero `/user` respondió 403 con ese mismo código y los refresh respondieron 400. Una nueva identificación password + TOTP, refresh y logout local funcionó, con control positivo después de las denegaciones. Los errores de transporte y HTTP 5xx no se aceptan como revocación.
8. **Permisos ordinarios:** la reproducción exacta acredita SQLSTATE 42501 para leer sesiones, factores y crear una tabla Auth con el rol ordinario. Esta variante no acredita permisos ni generación Core/F1/F2.

No se publicaron filas privadas, secretos, tokens, factores, dumps ni configuración. Las huellas y rutas de evidencia privada están en los recibos. Los procesos propios finalizaron y se conservaron los archivos de ensayo.

## Correcciones de identidad lógica

Son compatibles con S09 r3, que conserva la identidad lógica y definición y excluye OIDs como identidad contractual. PostgreSQL documenta que una columna eliminada sigue físicamente en `pg_attribute`, pero deja de ser accesible por SQL. El dump lógico reconstruye las columnas vivas. Por eso se coteja su ordinal lógico, manteniendo nombre, orden relativo, tipo/typmod, default, NULL, identity/generated, collation y ACL. No se omite ninguna columna viva. [Catálogo oficial PG17](https://www.postgresql.org/docs/17/catalog-pg-attribute.html), [pg_dump PG17.11](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/src/bin/pg_dump/pg_dump.c).

El código oficial de creación de triggers agrega el OID a nombres internos. La proyección propia exige `tgisinternal=true`, FK resuelta, nombre `RI_ConstraintTrigger_[ac]_<OID>` y sufijo igual al OID observado. Cambia únicamente el identificador inicial de `pg_get_triggerdef`; conserva prefijo action/check, relación, identidad de constraint, función, evento, estado enabled, deferrabilidad, argumentos, columnas UPDATE y toda la definición restante, con multiplicidad exacta. No cambia owners, grantors, ACL ni nombres de triggers de usuario. [Implementación oficial PG17.11](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/src/backend/commands/trigger.c).

[Contrapruebas propias: 28/28](../../tests/fixtures/h6-015-independent-preparation/catalog-identity-pure-r1.json): solo se admitieron el hueco físico de columnas y el cambio acotado de OID/nombre FK. Las otras 26 alteraciones fueron rechazadas. La batería general independiente conserva [62/62 PASS](../../tests/fixtures/h6-015-independent-preparation/pure-results-r2.json). Ambas baterías son instrumentales; no sustituyen la adquisición dinámica anterior.

## Captura principal y adenda

[Revisión offline propia](../../tests/fixtures/h6-015-independent-preparation/capture-offline-review-v2.json): 6 grupos PASS. Se verificaron los hashes del informe original, instrumento, runtime, expected, testigo original y los tres archivos completos. Las TOC contienen 2.546/265/127 entradas y datos de 175/27/10 tablas Core/Auth/Storage, con cobertura exacta y sin IDs de entrada duplicados.

Leyendo únicamente el COPY del archivo Core en memoria se verificaron las tres identidades t0 completas: intento, ejecución, parte, reserva, efecto, intent y operación `work_start` con su receipt. La cuarta identidad está ausente del corte como declara la adenda. Las tres épocas t0 y sus sesiones/actores/generación también coinciden con el archivo; no se usó `current_epoch=false` como condición para inventariarlas.

El testigo original continúa con su hash `ec682a9958a2c9f1ba6f7e51b67ccdd4701ab77bc218fad752e41ad33770a6e1`; no fue reescrito. La adenda separa `definitionOperationId` de `startOperationId`. El estado posterior del intento tardío y su `startOperationId` conservan la limitación ya descrita: código y recibo del ejecutor revisados, sin consulta viva independiente de ese origen. Esta captura no demuestra reconciliación, ausencia de duplicación tras restore ni aceptación de las operaciones dependientes.

## S05 y frontera reservada

El [hallazgo independiente S05](independent-finding-TSK-H6-015-S05-grantor.md) permanece vigente. Los recibos Core y Storage, verificados contra sus dumps de globals, identifican SQLSTATE 42501 y `check_role_grantor`. Un nombre de bootstrap importado no conserva OID 10. PostgreSQL exige ADMIN OPTION al grantor explícito que no sea su bootstrap builtin; ser superuser ejecutor no elimina esa integridad del grafo. [GRANT PG17](https://www.postgresql.org/docs/17/sql-grant.html), [código PG17.11](https://raw.githubusercontent.com/postgres/postgres/REL_17_11/src/backend/commands/user.c).

No se ha encontrado una receta exacta compatible con todas las condiciones de r3: bootstrap distinto, globals íntegros y prohibición de normalizar grantors/memberships, omitir grants, escribir catálogos o añadir privilegios para forzar el resultado. Corresponde una decisión y revisión posterior del procedimiento. El gate `blocked-operations.json` permanece OPEN e impide relanzar la restauración principal. Auth dedicado es separable y no resuelve ese bloqueo.

## FAILs y reparaciones instrumentales conservados

Se preservan el FAIL material principal S05, los dos diagnósticos Core/Storage y el primer FAIL Auth por comparación de números físicos de atributos y nombres FK. No se convierten retrospectivamente en PASS.

En el worktree auditor se conservan también:

- `pure-results-r1.json`: una prueba de fixture compartía una lista entre observado y esperado; se separaron las copias, sin modificar el expected. R2: 62/62.
- `auth-independent-runtime-r1` a `r5`, con sus fuentes exactas: selección de carpeta demasiado amplia; falta de salida explícita de `pg_restore`; longitud de socket macOS; alias SQL reservado `notnull`; supuesto instrumental HTTP 401 frente al 403 documentado del proveedor. Cada fallo detuvo la adquisición, con recursos propios cerrados. R6 acredita el candidato histórico; R7 acredita el candidato ampliado.
- La [corrección HTTP](../../tests/fixtures/h6-015-independent-preparation/auth-http-expectation-correction.json) enlaza hashes de la fuente oficial: `auth.go:155` y `apierrors.go:73–74`. El expected congelado exigía denegación Auth 4xx, no HTTP 401; la corrección exige exactamente 403 + `session_not_found`, sin aceptar errores genéricos.
- `capture-offline-review-v1`: el parser limitado rechazó identificadores con dígitos antes de procesar datos; V2 admite identificadores simples SQL con dígitos y conserva la misma cobertura esperada.

Estas correcciones cambian adquisición/representación, no contratos, permisos ni comportamiento del producto. No hay pérdida t0 observada en la variante Auth; no se deduce pérdida de negocio, RPO/RTO objetivo, equivalencia Core/Storage ni reentrada.
