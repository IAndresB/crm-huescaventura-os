# H5-012-F01 — Correctivo local de fecha vigente de noches en calendario

**2026-10-15 — CORRECTIVO IMPLEMENTADO Y VERIFICADO LOCALMENTE; pendiente de revisión humana.** Exclusivamente H5-012-F01. No cierre formal de H5-012, commit, publicación o despliegue. La evidencia independiente FAILED y su defecto original se conservan sin reescribir; este documento registra el correctivo autorizado posterior.

## Base y alcance autorizados

Tras fetch: rama main, `HEAD = main = origin/main = f063879d203330adb57d7e8fef3607ae796f52d5`, árbol `104b4ecba9dd72aa166410470b362a956ed866e2`, divergencia 0/0 e índice vacío. Existían los documentos, prueba y evidencias sin seguimiento de H5-012. Se inventariaron y preservaron antes de editar. [Preflight y diseño mínimo](../../tests/fixtures/h5-012/f01-corrective-20261015/preflight.json).

La autorización permite corregir F01, repetir su reproducción y verificar regresiones/seguridad/preservación; termina tras la verificación local. No autoriza cerrar H5-012 ni iniciar H5-013 u otras tareas. No se modifica el expected de 41 casos/34 filas ni las fuentes aprobadas. Constitution P13 exige migración versionada para cambiar una función persistente; SPEC-FR-COORD-008, ARCH-DEC-007 y los aspectos C01/C02/C05/C07 del expected determinan el comportamiento, conservando D020.

## Causa confirmada y modificación mínima

La migración 58 obtiene las noches del snapshot aceptado `b04_nights`. La rama de calendario las componía directamente, aunque una Modification posterior ya hubiera creado una versión operacional. La vista existente `b04_current_nights` resuelve esa versión mediante el contrato canónico `modification_scope`. El FAIL original ya corroboró versión 2 y fecha 23/10 frente a calendario 20/10; no era un cambio pendiente ni una alteración fallida del fixture.

Cambios de producto:

1. Nueva migración 59, [20261015172843_h5_calendar_current_nights.sql](../../supabase/migrations/20261015172843_h5_calendar_current_nights.sql). Reemplaza la función existente `h5_projection_read` conservando firma, controles F1/F2, owner, ACL, search_path, filtros y revalidación final. El único cambio funcional de su cuerpo selecciona `b04_current_nights` cuando la superficie es `calendar`; las demás superficies internas mantienen `b04_nights` como información aceptada/histórica. Las salidas para terceros mantienen su rama comercial mínima anterior. No se cambia la migración publicada 58 ni se añade tabla/fuente de verdad.
2. [coordinated-projection.ts](../../src/domain/coordinated-projection.ts): añadir el tipo de hecho canónico `b04_current_nights` a las categorías de calendario ya admitidas. Se conserva su procedencia real, sus datos y certeza; no se calcula una fecha en TypeScript ni se modifican reglas de negocio.

[Diff de la función forward frente a la 58 inmutable](../../tests/fixtures/h5-012/f01-corrective-20261015/function-forward.diff) y [revisión exacta del delta](../../tests/fixtures/h5-012/f01-corrective-20261015/source-delta-review.json). El uso de `CREATE OR REPLACE` no amplía privilegios: se comprobó el catálogo antes/después y en rollback/retry.

## Pruebas y procedencia de resultados

Ensayos local/aislado/sintético, con runner oficial `scripts/test-postgres.mjs`, PostgreSQL 17.11 y Storage oficial heredado en loopback. Node 24.21.0, pnpm 11.19.0, Next 16.3.8 y dependencias existentes, sin cambios de versión. Los datos de negocio se preparan por contratos reales con F1/F2; SQL observador sirve para verificar el estado resultante. No operaciones reales ni Hosted/Production.

Árbol probado: base publicada más los inputs exactos del [manifiesto final](../../tests/fixtures/h5-012/f01-corrective-20261015/tested-inputs.final.json), SHA-256 `bf2f7277dc2e59d522c725709338fb2cdf0ffc5e335d9650fa8a8ac678611b23`. No se atribuye al HEAD aislado un producto que contiene un delta local sin commit. Una [segunda copia para seguridad](../../tests/fixtures/h5-012/f01-corrective-20261015/tested-inputs.security.json), SHA-256 `d4f580b5697c95e9bbf8dd79696e64bfd6d20b7ef6590b33b8816a4e5245444f`, conserva los mismos inputs y añade solo su verificador, ejecutado separadamente. No comparte escrituras de checkout con el runner de regresión.

La reproducción independiente original conserva **todas sus aserciones**. Único delta en su preparación: aplicar la nueva migración después de 58. [Transición de una línea](../../tests/fixtures/h5-012/f01-corrective-20261015/independent-verifier-setup.diff); [fuente original exacta archivada](../../tests/fixtures/h5-012/f01-corrective-20261015/independent-verifier.original.ts.txt). El log original 2 PASS/1 FAIL permanece intacto. Se añaden dos pruebas nativas del correctivo/V-MIG, una unidad de composición y una prueba nativa de seguridad de la migración 59. No se cambian tests históricos H0–H5-011 ni guardas.

| Control ejecutado sobre el correctivo | Resultado nuevo | Evidencia |
|---|---|---|
| Reproducción original + aceptación A–D/E + V-MIG | **5/5 PASS**, sin omitidas | [Log final](../../tests/fixtures/h5-012/f01-corrective-20261015/focal-postgres.final.log), [recibo](../../tests/fixtures/h5-012/f01-corrective-20261015/focal-postgres.final.status.json) |
| Regresión PostgreSQL completa disponible al iniciar ese runner | **2498/2498 PASS**, 0 FAIL/skipped/cancelled/todo | [Log íntegro](../../tests/fixtures/h5-012/f01-corrective-20261015/postgres-regression.final.log), [recibo](../../tests/fixtures/h5-012/f01-corrective-20261015/postgres-regression.final.status.json) |
| Seguridad específica adicional de 59 | **1/1 PASS**, advisors `results: []` | [Log](../../tests/fixtures/h5-012/f01-corrective-20261015/focal-postgres.security.log), [recibo](../../tests/fixtures/h5-012/f01-corrective-20261015/focal-postgres.security.status.json) |
| Unitarias completas | **195/195 PASS** | [Log](../../tests/fixtures/h5-012/f01-corrective-20261015/unit-complete.final.log), [recibo](../../tests/fixtures/h5-012/f01-corrective-20261015/unit-complete.final.status.json) |
| Focal de dominio/composición | **24/24 PASS**, producto idéntico al final | [Log](../../tests/fixtures/h5-012/f01-corrective-20261015/focal-domain.log) |
| Typecheck, incluida la prueba adicional de seguridad | **PASS**, exit 0 | [Recibo final principal](../../tests/fixtures/h5-012/f01-corrective-20261015/typecheck.final.status.json), [recibo con seguridad](../../tests/fixtures/h5-012/f01-corrective-20261015/typecheck.security.status.json) |
| Build | **PASS**, exit 0 | [Log](../../tests/fixtures/h5-012/f01-corrective-20261015/build.final.log) |
| Lint / límites de imports configurados | **PASS**, exit 0 | [Log](../../tests/fixtures/h5-012/f01-corrective-20261015/lint.final.log) |
| Health SQL independiente | **1/1 PASS**, separado | [Log](../../tests/fixtures/h5-012/f01-corrective-20261015/health.final.log) |
| Auditoría de dependencias de producción | **0 vulnerabilidades**, exit 0 | [JSON original](../../tests/fixtures/h5-012/f01-corrective-20261015/audit.final.log) |

Contadores separados: las cinco focales nativas están incluidas una vez en 2498 y las 24 focales de dominio están incluidas en 195; no se suman. La prueba adicional de seguridad se añadió después de arrancar el listado de regresión y se ejecutó separadamente en su propia copia: **no está incluida en 2498**. El producto coincide entre ambas copias; solo difiere ese archivo de verificación. Cada recibo registra comando, cwd, duración, código, hash del log e inventario aplicado. [Resumen estructurado](../../tests/fixtures/h5-012/f01-corrective-20261015/results-summary.json).

El log completo conserva la reproducción deliberada de FAIL antiguos H2-008 F01/F02; la prueba actual que exige esa reproducción termina PASS. No son nuevos FAIL de esta regresión. Tampoco se borró el primer typecheck del correctivo: detectó TS2532 en el helper del test nuevo. Se añadió `assert.ok` para comprobar la presencia de la noche antes de desreferenciarla; producto y aserciones esperadas no cambiaron. Se repitieron focales y typecheck sobre los inputs finales, con PASS. Se conserva la fuente previa del ensayo y todos los recibos iniciales.

## Criterios A–G y seguridad

| Criterio autorizado | Observado |
|---|---|
| A. Estado operacional vigente | Modification solicitada/evaluada/aprobada/aplicada; versión 2, fecha 23/10/2026 corroborada. |
| B. Calendario corregido | Entrada de la noche 23/10/2026 con fuente `crm_private.b04_current_nights`. |
| C. Historia original | Timeline conserva `b04_nights` con 20/10 y la versión operacional con 23/10. Lecturas no cambian snapshots ni historia. |
| D. Noches independientes | Noche hermana 21/10 conserva exactamente la entrada previa; otro Booking no recibe la noche modificada. |
| E. Controles | Lectura autorizada, rechazo de identidad no verificada/polling/SQL sin sobres y SELECT/DML directos; 18 combinaciones superficie/destinatario con minimización y búsqueda posterior. Contratos de disponibilidad y demás consumidores pasan en regresión. |
| F. Pruebas/preservación | Gates anteriores PASS; catálogo y datos de migración, expected, originales y transiciones comprobados. |
| G. Normativa | D020, economía, contratos de cancelación/modificación, expected y fuentes aprobadas idénticos. |

V-MIG: instalación desde cadena vacía mediante el bootstrap aislado y aplicación 58→59; además, base 58 poblada con Booking, fallo DDL antes de commit, rollback íntegro, retry y reaplicación idempotente. Se conservan datos de 170 tablas, 284 funciones (excepto el cuerpo previsto), tablas/vistas, schemas, roles, policies, ACL, owners y atributos. No nueva tabla ni ampliación de permiso. Se mantiene executor NOLOGIN/NOBYPASSRLS, search_path fijado, sin EXECUTE público, FORCE RLS privado y vista de noches no consultable por runtime directamente. Los advisors oficiales se ejecutaron específicamente después de aplicar 59, exclusivamente en loopback.

Los resultados acreditan este correctivo, no las 41 aceptaciones independientes de H5-012 ni el cierre global de fuentes compartidas. No se repitió una instalación de dependencias porque no se modificaron package/lockfile o sus versiones. No se ejecutó el auditor histórico V3 bajo refs Git falsificadas ni se alteraron sus sellos; su contexto autenticado anterior se conserva. No se realizaron ensayos Hosted/Production, conectores, comunicaciones, cobros o reservas reales.

## Preservación, Git y parada

[Preservación final](../../tests/fixtures/h5-012/f01-corrective-20261015/preservation-final.json): de 36.240 blobs tracked, 36.239 idénticos en bytes/modo y una transición autorizada exacta del dominio. Las 58 migraciones publicadas y los documentos normativos, guardas, fixtures y artefactos V1/V2/V3 son idénticos. Expected 67.346 bytes/SHA-256 `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`. Se preservan los 13 artefactos previos inventariados; el único test adaptado conserva su fuente original exacta y cambia una sola línea de preparación.

Las tres salidas históricas que la regresión genera se guardaron desde la copia desechable en [generated-regression.json](../../tests/fixtures/h5-012/f01-corrective-20261015/generated-regression.json); los originales del checkout principal no se sobrescribieron. La CLI actualizó su caché de avisos al consultar help: se archivó la salida generada y se restituyeron únicamente los bytes propios de ese caché a la base, sin alterar herramienta, versión o guards. [Recibo](../../tests/fixtures/h5-012/f01-corrective-20261015/cli-cache-housekeeping.json).

Archivos nuevos/modificados de este bloque: dominio, migración 59, setup de reproducción independiente, unidad de composición, pruebas nativas de correctivo y seguridad; este informe; y logs/recibos/inventarios/fuentes originales/scripts reproducibles en la carpeta propia del correctivo. Los documentos de defecto/evidencia/matriz FAILED de H5-012 no se modificaron. Índice vacío, main/HEAD/origin en `f063879d`, 0/0. Sin staging, commit, push, merge o despliegue.

**STOP local cumplido.** F01 tiene correctivo verificado localmente, pendiente de revisión humana; no se declara cierre formal del defecto o de H5-012. Recomendación: revisar el delta y sus evidencias, y autorizar después la reanudación de H5-012 sobre el inventario corregido. H5-013 y las tareas posteriores no se han iniciado ni preparado.
