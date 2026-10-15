# TSK-H5-012 — Verificación independiente consolidada

**2026-10-15 — READY FOR REVIEW, exclusivamente local/aislado/sintético.** No cierre formal ni publicación. El estado de esta revisión complementa los documentos históricos sellados, que permanecen intactos.

## Alcance y base exacta

Autorización humana: completar 41 casos y 34 filas normativas, corregir defectos técnicos dentro de H5-012, preservar expected/originales y detenerse en READY FOR REVIEW. Se verificaron constitution, decisiones, estado, próximos pasos, Tasks, expected, defecto F01 e informe correctivo. No se repitió la investigación histórica de F14 ni se modificaron sus guardas.

Preflight con fetch: `HEAD = main = origin/main = f063879d203330adb57d7e8fef3607ae796f52d5`, árbol base `104b4ecba9dd72aa166410470b362a956ed866e2`, divergencia 0/0, índice vacío. El producto probado incluye el delta local, por lo que los resultados **no se atribuyen al HEAD aislado**.

- [Manifiesto final principal](../../tests/fixtures/h5-012/resumed-20261015/inputs-final.json): 12 inputs, SHA-256 `4faed9774ab2977a6ea5d7eb927955d6de28f575c8e97e7be59c46ef5cd69765`.
- [Manifiesto suplementario](../../tests/fixtures/h5-012/resumed-20261015/inputs-supplement.json): mismos inputs de producto más una prueba de seguimiento de referencias, SHA-256 `bd1256d2df33399c709654f708e8894f961f5d6f2b66c338e79dfc44665f33c8`.
- Producto: compositor SHA-256 `429191803de93001ae228083b2533fba19dac3cb2a9a92326f55a6d92d705532`; migración 59 `0d6baa6546ba404330973f3a770c605cb7127836acc6a9375b0d89c8f1726760`; migración 60 `847499b0bd9298067825a57d02b17de1379d9b6a49d933c26250237fe1efc5a8`.

PostgreSQL real 17.11, runner del repositorio y Storage oficial en loopback, commit Storage `5def1dfc15ab7f08fe271c7d1e70542424524e4e`. Datos exclusivamente sintéticos. Copias desechables separadas para no sobrescribir las salidas históricas del checkout principal. No servicio Hosted/Production ni operaciones con clientes/proveedores reales.

## Resultado de casos y normativa

La [matriz consolidada](matrix-TSK-H5-012-resumed.md) presenta **los 41 casos individualmente** y **las 34 filas normativas**. El oráculo sigue siendo el expected congelado, con resultados literales definidos antes de invocar producto; las fixtures preparan hechos, no producen las expectativas. Las aserciones de la reproducción original F01 permanecen intactas.

Los 41 casos pasan la batería focal. Se comprueban historia/rectificación/archivo/fusión/códigos, estado operacional vigente, D020 con días completos, bloqueos/requisitos, modificaciones de hora y fecha, eventos y ecos, indisponibilidad auxiliar, mínimos externos en seis superficies y tres destinos, pack 120/10 y 180/8, prohibición fiscal/retención inferida, F1/F2, sesiones revocadas, vínculos compartidos, SQL directo y polling. Una prueba adicional sigue el receipt del timeline hasta el original autorizado y distingue responsable/aprobador humano y ejecutor automático sin acreditar una entrega.

Las filas son **28 verificaciones asignadas a H5-012 y seis límites locales**; no 34 tests ni aceptación global de otras tareas. Se conservan las asignaciones originales de SPEC-FR-SEC-007, AC-081, SPEC-NFR-003, DM-INV-025, DM-INV-050 y SM-FORB-29. No cierre de H6 ni de las tareas globales citadas por el expected.

## Defectos y correctivos

[Registro completo de incidencias](defects-TSK-H5-012-resumed.md), con los FAIL originales y cada transición.

**F01, revalidado:** la noche modificada se proyecta desde `b04_current_nights`: 23/10/2026 y versión operacional 2; historia aceptada 20/10; noche hermana 21/10 y otro Booking preservados. Migración 59 intacta.

**F02, detectado y corregido en esta reanudación:** el calendario seleccionaba identidades de bloqueos/requisitos sin las revisiones que contienen vencimiento, condiciones y estado. Se conservó la reproducción 0/2 y se añadió migración 60 para leer las revisiones canónicas existentes. Calendario selecciona la última por identidad; timeline conserva historia. El compositor admite esas revisiones y conserva pendientes/revisión, sin crear una fuente nueva ni modificar su negocio. Reproducción final 2/2.

Archivos de producto de esta entrega:

- `src/domain/coordinated-projection.ts`: F01 previo más admisión/certeza de revisiones F02.
- `supabase/migrations/20261015172843_h5_calendar_current_nights.sql`: F01 previo conservado.
- `supabase/migrations/20261015180420_h5_projection_canonical_revisions.sql`: nueva lectura F02, único cuerpo de función afectado; [diff exacto frente a 59](../../tests/fixtures/h5-012/resumed-20261015/forward60.diff).

Pruebas nuevas: `postgres-h5-012-complete`, `postgres-h5-012-f02`, `postgres-h5-012-final-migration`, `postgres-h5-012-final-security`, `postgres-h5-012-reference-chain` y unidad `coordinated-projection-h5-012-f02`. Único cambio a una prueba previa: cargar 60 en el setup de `postgres-h5-012-independent`; fuente anterior exacta archivada y aserciones verificadas byte a byte. Los tests protegidos no se cambian.

## Verificaciones nuevas

| Control | Resultado | Evidencia |
|---|---|---|
| 41 casos + reproducción F01/F02 + V-MIG y seguridad focales | 52/52 PASS | [run4-focal.log](../../tests/fixtures/h5-012/resumed-20261015/run4-focal.log) |
| Seguimiento de referencia original H04/S11 adicional | 1/1 PASS, separado | [supplement-references.log](../../tests/fixtures/h5-012/resumed-20261015/supplement-references.log) |
| Regresión PostgreSQL completa | **2545/2545 PASS**, 0 FAIL/skipped/cancelled/todo | [final-full.log](../../tests/fixtures/h5-012/resumed-20261015/final-full.log) |
| Unitarias completas | 197/197 PASS | [final-unit.log](../../tests/fixtures/h5-012/resumed-20261015/final-unit.log) |
| Typecheck, incluido suplemento | PASS | [principal](../../tests/fixtures/h5-012/resumed-20261015/final-typecheck.json), [suplemento](../../tests/fixtures/h5-012/resumed-20261015/supplement-typecheck.json) |
| Lint/import boundaries | PASS | [final-lint.json](../../tests/fixtures/h5-012/resumed-20261015/final-lint.json) |
| Build | PASS | [final-build.json](../../tests/fixtures/h5-012/resumed-20261015/final-build.json) |
| Health independiente | 1/1 PASS, separado | [final-health.log](../../tests/fixtures/h5-012/resumed-20261015/final-health.log) |
| Auditoría dependencias producción | 0 vulnerabilidades | [final-audit.log](../../tests/fixtures/h5-012/resumed-20261015/final-audit.log) |
| V-MIG | Fresh cadena 60, poblada 59→60, rollback/retry/reaplicación PASS | Recibo focal y prueba `postgres-h5-012-final-migration` |
| Seguridad sobre 60 | ACL/RLS/F1/F2/SQL directo PASS; advisors `results: []` | Recibo focal y prueba `postgres-h5-012-final-security` |
| Preservación | PASS | [preservation-final.json](../../tests/fixtures/h5-012/resumed-20261015/preservation-final.json) |

La regresión incluye H4 y H5 y los 52 focales una vez. La prueba suplementaria se añadió después de fijar el listado de la regresión: **1/1 separado, no incluido en 2545**. Se ejecutó sobre producto idéntico en otra copia, y su typecheck también pasó; no se presenta una única corrida de 2546. Health 1/1 y unitarias 197/197 son contadores separados.

El log íntegro conserva dos FAIL deliberados R56/R57 del producto histórico `15dbf11`, cuya reproducción exige la metaprueba actual H2-008. Esa metaprueba pasa; no son fallos actuales ni se ocultaron. Las tres salidas históricas generadas se archivaron desde la copia en [generated-copy.json](../../tests/fixtures/h5-012/resumed-20261015/generated-copy.json); sus originales principales permanecen intactos.

Los 52 focales incluyen 49 comprobaciones de la cadena final y tres verificaciones específicas de la migración 59 que se conservan como regresión de esa transición. Los 41 casos, F02, reproducción original F01 y su aceptación final se ejecutan sobre 60. Las suites históricas de regresión conservan sus propias etapas de migración; no se cambian para forzar el último esquema. Ningún PASS previo a la reanudación se usa como evidencia del código actual.

Cada recibo conserva comando, copia, UTC, duración, exit, hash del log y manifiesto. Los FAIL run1/run2/run3 y el red F02 se conservan. Los errores de preparación/selector del verificador se distinguieron del defecto real F02 y se corrigieron sin retirar expectativas legítimas. No hubo cambios de dependencias ni necesidad de repetir instalación; se mantuvieron versiones y lockfile.

## Seguridad, preservación y límites

La migración modifica solo el cuerpo de `h5_projection_read`. V-MIG conserva datos de 170 tablas y metadatos de 284 funciones salvo ese cuerpo; conserva owners, ACL, schemas, policies, roles y vistas. Executor NOLOGIN, sin superuser/BYPASSRLS, search_path fijo, ausencia de EXECUTE público y FORCE RLS privado comprobados. Lectura/DML ordinarios directos denegados. F1/F2 rechazan MAC, contexto, finalidad, scope y binding alterados; sesión revocada y polling no recuperan autoridad. Originales requieren reautorizar lectura por contexto/finalidad.

Preservación: **36.306/36.308 archivos previos idénticos**. Las dos transiciones autorizadas son compositor y setup de reproducción; ambas fuentes anteriores archivadas exactamente. No faltan archivos ni cambian modos. Expected **67.346 bytes**, SHA-256 `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`. Diez fuentes normativas idénticas y 34 filas literales de Tasks verificadas. D020, contratos, economía, migraciones publicadas, guardas/auditores y evidencias originales intactos.

Los documentos PROJECT-STATUS/NEXT-STEPS/Tasks y matrices anteriores conservan sus estados históricos sellados; esta revisión registra el estado posterior sin reescribirlos. No se ejecutó el auditor V3 bajo refs falsificadas ni se alteraron sus sellos. Los dos logs ORIGINAL NO RECUPERADO, las 69 diferencias históricas y R67/R030 conservan su alcance documentado, sin reabrirlos ni dar por recuperadas evidencias ausentes.

Riesgos/límites pendientes: revisión humana del delta y aceptación local; DM-PENDING-005 para política real de privacidad/retención; capacidad y operación de conectores, Hosted/Production y aceptación global de otras tareas siguen sin acreditar. Los escenarios sintéticos no acreditan esas capacidades.

## Reproducción y punto de parada

`tests/fixtures/h5-012/resumed-20261015/prepare-reproduction.py <etiqueta-nueva>` prepara una copia de la base y sus inputs exactos. `run-gate.py <etiqueta-nueva> <gate>` ejecuta el gate y rechaza sobrescribir evidencia; `verify-preservation.py` comprueba los originales del checkout. Git final: HEAD/main/origin/main permanecen en `f063879d203330adb57d7e8fef3607ae796f52d5`, divergencia 0/0 e índice vacío. El único archivo tracked modificado es el compositor (7 líneas añadidas, 3 retiradas frente a la base); migraciones, pruebas y documentos locales se enumeran en el inventario. No staging/commit/push/deploy.

**Recomendación: aceptar técnicamente H5-012 en alcance local/aislado tras revisión humana del delta y las evidencias. Estado READY FOR REVIEW; no COMPLETED ni cierre formal.** No hay defectos materiales abiertos detectados en el alcance ejecutado. La siguiente acción recomendada es revisión humana y, solo con autorización separada, publicación/cierre de H5-012. No se inicia ni prepara H5-013.
