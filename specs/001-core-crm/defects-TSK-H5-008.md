# Defectos — TSK-H5-007/008

## F01 — OPEN / bloqueo material de verificación histórica

Detectado antes de modificar producto, sobre `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79` (solo expected posterior a la base autorizada). No es un fallo funcional de H5-007: todavía no hay implementación. La guarda `tests/integration/postgres-h5-006-migration.test.ts:35` cuenta todas las migraciones presentes y exige exactamente 55. El alcance autorizado exige persistencia nueva y V-MIG, pero cualquier migración posterior vuelve imposible el PASS íntegro con esta guarda sin adaptar.

### Reproducción y observado

`node tests/fixtures/h5-008/f01/reproduce.mjs`

El verificador histórico original se ejecuta sobre una vista temporal del filesystem: mismo Git, fuentes y 55 migraciones copiadas byte a byte; las referencias restantes son enlaces de lectura. No se conecta PostgreSQL ni se aplica SQL. Solo se selecciona el caso histórico de preservación. La migración 56 de la contraprueba es un comentario SQL inerte con nombre explícitamente sintético, no producto ni migración propuesta.

| Ensayo | Resultado real | Interpretación |
|---|---|---|
| Verificador original + 55 migraciones | PASS, 1/1, exit 0 | Baseline histórico vigente en su inventario. |
| Verificador original + archivo 56 inerte | FAIL, 0/1, exit 1, `56 !== 55` | La adición provoca fallo sin alterar las 55 originales. |
| Copia con corrección propuesta + archivo 56 | PASS, 1/1, exit 0 | La corrección acota la comprobación al hito histórico. |
| Misma copia + alteración sintética de primera migración histórica | FAIL esperado, exit 1 | La preservación byte a byte sigue rechazando alteraciones. |
| Contrapruebas F10/F12 originales | PASS | Siete verificadores, cuatro snapshots y sus 800 entradas efectivos intactos; sin ampliar excepciones. |

[FAIL original recuperable](../../tests/fixtures/h5-008/f01/additional56-original-fail.log.gz), [comandos/exit/SHA](../../tests/fixtures/h5-008/f01/runs.json), [reproductor](../../tests/fixtures/h5-008/f01/reproduce.mjs), [F12](../../tests/fixtures/h5-008/f01/f12-historical-negatives.json).

### Correctivo propuesto, NO APLICADO

[Patch de una línea](../../tests/fixtures/h5-008/f01/proposed-guard.patch): contar únicamente `*.sql` cuyo nombre sea menor o igual al nombre de `migration`, la constante histórica de H5-006 (`20261007230734_h5_communication_review.sql`). Sigue exigiendo exactamente 55; no toca los bucles que comparan bytes, expected congelados, fuentes, F10/F12, permisos ni aserciones funcionales. El patrón ya existe en H5-004. No basta con cambiar 55 a 56: debe preservar el inventario del hito original.

No se aplica por la instrucción humana de este turno: «No amplíes excepciones de preservación sin nueva autorización humana». La corrección reduce el ámbito temporal de una guarda histórica y se trata conservadoramente como cambio que requiere esa autorización expresa. No lo exige una skill ni un bloqueo automático de herramientas.

### Estado y condición de continuidad

F01 OPEN. H5-007/008 IN PROGRESS, implementación aún no iniciada. STOP sin publicación de producto ni modificación de verificadores históricos. Se necesita autorización concreta para aplicar exclusivamente la corrección mostrada, conservar estos FAIL y continuar H5-007/008 con todas las pruebas solicitadas. No se solicita ni presupone permiso para modificar otras guardas: cualquier hallazgo posterior conserva su propia obligación de diagnóstico.

## F02 — CLOSED / presentación de evidencia

El primer `git diff --cached --check` detectó espacios finales producidos por Node en los logs originales de FAIL. No es fallo de producto ni altera F01. Se archivaron los logs en gzip comprobando igualdad byte a byte tras descompresión y hashes originales en `tests/fixtures/h5-008/f01/raw-log-preservation.json`; también permanecen en el commit local inicial 419492b. No se limpiaron ni reescribieron los FAIL. El reproductor guarda sus salidas comprimidas. Diff-check repetido sobre el cambio completo y comprobación sintáctica PASS; no requiere regresión funcional al no existir producto.

## F01 — aplicación autorizada, cierre pendiente por F03

Autorización humana expresa de continuación F01: preflight `bd6830595ef3fed94fb1a91a4e7250861eb768e2`, origin/main `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`, main limpio, 2/0 tras fetch. Expected 26.621 bytes/hash congelado intactos. Se aplica exclusivamente el patch de una línea ya preparado mediante `git apply --unidiff-zero`; no se modifica otro verificador histórico. Hash actual del verificador: `8bff5ff548a8e64f4ec1777c8ca840e2e6801d708bf0bfd74bcac6782944e297`.

Baseline55 y adición inerte56 PASS. Alteración de primera migración y eliminación de una intermedia: FAIL esperados. Sustitución de la migración55 por comentario: **PASS indebido**, la fixture exige FAIL y termina exit1. Cadena F10/F12 original PASS sin cambios. No se cierra F01 porque no se han satisfecho todas las contrapruebas humanas. [Ejecución original aplicada](../../tests/fixtures/h5-008/f01-applied/original-application-result.json), [salida de la sustitución](../../tests/fixtures/h5-008/f01-applied/replace-original.log.gz).

## F03 — OPEN / MATERIAL / contraprueba de preservación no rechazada

La migración `20261007230734_h5_communication_review.sql` es la número55. El caso histórico H5-CAR/CAN/CAM/CAO/CAP/CAZ/CBD/CBE obtiene sus archivos protegidos mediante `git ls-tree 7eac0d27… src supabase scripts tests/operations`: ese baseline contiene54 migraciones y no incluye la propia55 de H5-006. El recuento a55 y la comprobación de ausencia de llamadas externas no comparan sus bytes con un original.

Reproducción independiente adicional: `node tests/fixtures/h5-008/f03/reproduce.mjs`. Copia temporal de55 migraciones; se añade únicamente un comentario a la55, preservando las54 restantes. Hash original55 `f6b47fbfa260318b2af2fc48b9aab7b4ba2a431e6f44837d48f027d45fd00ab0`; hash alterado `e550341ac08294c13ec02c267e96f4a59043b609f0ca80f09803c96bb367e3d8`. El caso histórico aplicado da PASS y las contrapruebas F10/F12 también dan PASS sobre esa copia. El expected humano exige rechazo de alteración de una original: **FAIL material de preservación**. [Resultado exacto](../../tests/fixtures/h5-008/f03/result.json), [log del bypass](../../tests/fixtures/h5-008/f03/altered55-preservation-bypass.log.gz), [cadena sobre copia alterada](../../tests/fixtures/h5-008/f03/altered55-f12-chain.log.gz).

Esto no acredita fallo funcional PostgreSQL ni corrupción del repositorio: no se ejecutó SQL, la migración real55 permanece byte exacta y las54 originales tampoco se modificaron. Acredita una laguna de comprobación de bytes en la cadena histórica examinada. Las contrapruebas F10/F12 conservan su alcance original y no se relabelan como fallidas por no cubrir una migración posterior a sus snapshots.

No se ha aplicado otro correctivo, ampliado excepción, cambiado permisos, dependencias, migración o producto. No se declara que una regresión completa rechazaría o aceptaría este caso: no se ejecutó. La incompatibilidad con la condición de protección de las55 originales exige STOP conforme a la instrucción humana de continuación. F01 y F03 OPEN; H5-007/008 IN PROGRESS. Cualquier continuación deberá decidir cómo acreditar la protección de55 sin modificar expected ni relajar comprobaciones.

## Retest autorizado F03 — F03/F01 CLOSED localmente

Preflight exacto `eb739b15bdd8a5cd2a6803cbdf4a041bc7a86013`, origin/main `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`, main limpio4/0; expected26.621bytes/hash congelado intactos;55 migraciones reales comparadas byte a byte.

Fuente histórica publicada: cierre H5-006 `187bb1bb1de81c2bd4884f56de930d35acb93d26`, ancestro de origin/main. Migración55:23.869bytes, SHA256 `f6b47fbfa260318b2af2fc48b9aab7b4ba2a431e6f44837d48f027d45fd00ab0`, extraído mediante `git show` del cierre publicado, no del árbol de trabajo. El verificador conserva el bucle anterior54 contra7eac0d27 y añade hash explícito del blob histórico más comparación Buffer exacta de la55 vigente contra ese blob fijado. Cualquier diferencia de comentario/whitespace o sustitución se rechaza. No se modifican migraciones, manifiestos F10/F12, otras guardas ni permisos.

[Fuente y preflight](../../tests/fixtures/h5-008/f03-applied/historical-source.json), [retests completos](../../tests/fixtures/h5-008/f03-applied/result.json), [reproductor](../../tests/fixtures/h5-008/f03-applied/verify.mjs).55 intactas/adición56/restauración:PASS; alterar primera/eliminar intermedia/sustituir55/comentario55/whitespace55/eliminar55/adicional dentro del conjunto:FAIL esperados, todas las contrapruebas PASS; F10/F12 PASS sin cambios. Los resultados originales F03 siguen intactos. Pruebas de filesystem, excluidas de contadores PostgreSQL/unitarios. F03 y F01 CLOSED exclusivamente en este correctivo local; H5-007/008 sigue IN PROGRESS y continúa dentro de autorización anterior. No cierre funcional por estas contrapruebas.

## F04 — Defectos de desarrollo y fixtures locales; correctivos dentro de H5-007/008

Estado: IN PROGRESS hasta los gates definitivos. Se conserva cada FAIL original comprimido en `tests/fixtures/h5-008/implementation/`. No se modifica el expected, una guarda histórica, dependencias ni permisos anteriores.

- Typecheck inicial: estrechar outcome antes de solicitar evidencia de resultado.
- Arranque focal directo: usar runner oficial con Storage aislado requerido por la cadena existente.
- Helpers nuevos: separar owner privado invoker de owner API executor; no grants anteriores persistentes.
- M02: respetar overload humano solo para reserve exacto; ledger técnico para trabajo e intentos. HA/M02 siguen atómicos y el F2 original de reserve se revalida al final.
- Aux JSON: transmitir bytes UTF8 para impedir doble codificación por el driver.
- Fixture: generación JSON numérica; segunda sesión del único actor V1, sin crear otro administrador.
- Snapshot: usar external_effect_records y unit_attempts reales; no tabla de intenciones inventada.
- Cadena F12: invocar chain-counterexamples.mjs existente, sin editarlo.
- Fallo de transporte: la desconexión inmediata provocó un TypeError asíncrono del driver; FAIL conservado. El doble de wire actual retiene el acuse real de COMMIT e introduce un error08 simulado después del COMMIT real, verificando WorkCommitUncertainError y recuperación por identidad. No se cambia el driver ni se acredita una desconexión TCP limpia. Las caídas reales de procesos hijo permanecen verificadas separadamente.
- Conexiones de fixture: cerrar pools/observadores entre casos; conservar límite PostgreSQL original.

Retest tras correctivos: focal54/54 PASS, unit154/154 y lint/import boundaries PASS preliminares. Tras confirmación global se registra SHA exacto y cierre.

## F05 — Omisión de revalidación original de reserva en el cierre del nuevo adaptador

Estado: IN PROGRESS hasta retest y gates definitivos. La revisión de composición detectó que el helper nuevo `b08_ha_finalize` existía pero no era llamado por el batch final del adaptador. El batch revalidaba el trabajo y evidencia, pero no el F2 original de `reserve` después de todas las escrituras/esperas. No afecta a una guarda histórica ni implica decisión normativa nueva.

Contraprueba de W11/W29/W47: sustituir temporalmente solo el helper nuevo en PostgreSQL por un rechazo obligatorio. Antes del correctivo el inicio no se rechazó: `Missing expected rejection`, focal53PASS/1FAIL, exit1. Original íntegro: `tests/fixtures/h5-008/implementation/focal-15-f05-original-fail.log.gz`. Correctivo mínimo: invocar `b08_ha_finalize` con el payload/MAC/input originales de reserva en el mismo batch que drena constraints, finaliza el trabajo y ejecuta COMMIT. La contraprueba compara rollback completo de20 tablas, restaura el helper original y repite la misma identidad. Expected independiente intacto. Retest y cierre global pendientes.

Retest material F05: focal54/54 PASS, exit0; `tests/fixtures/h5-008/implementation/focal-16-f05-retest-pass.log.gz`. Se alcanzó el rechazo obligatorio del finalizador original, se conservó el rollback íntegro y se pudo repetir la identidad tras restaurarlo. F05 corregido, cierre condicionado a gates definitivos.

## F06 — Snapshots de auditoría recursivos en dominio nuevo

Estado: IN PROGRESS; no cierre/publicación con este defecto abierto. La captura focal en `0b88063a48a7020de7d45ac1d711c8133c4517b2` muestra ocho entradas de historial con30.979.660 bytes serializados: el `after_state` del último evento contiene siete eventos completos anteriores. `b08_snapshot` es adecuado para lectura, pero su uso sin excluir `history` en cada evento vuelve a anidar el historial de forma recursiva. La historia debe conservar cada antes/después sin volver a copiar las entradas previas dentro de sus estados. Contraprueba técnica independiente sobre captura real: exit1, `AUDIT_STATE_MUST_NOT_EMBED_PREVIOUS_HISTORY`. Original conservado en `implementation/f06-history-original-fail.log.gz` y captura gzip completa con hash/bytes en su manifiesto.

Correctivo acotado previsto: omitir la propiedad `history` solamente al registrar los estados before/after en B07; conservar íntegramente las filas históricas y el historial agregado de lectura. Se ampliará la comprobación de estados del caso W01 y la conciliación tras detención de W22. No cambia el expected ni fuentes/guardas anteriores. La ejecución global anterior es antecedente; después se repiten todos los gates sobre nuevo SHA.

Retest F06: focal54/54 PASS, exit0, en `implementation/focal-17-f06-retest-pass.log.gz`. Los estados de cada entrada de W01 no contienen `history`; W22 verifica también detención después de contacto, incertidumbre, conciliación original única y rechazo de reanudación/reenvío. Cierre pendiente de repetición global sobre nuevo SHA.

## F07 — Salidas históricas regeneradas con espacios en diff-check

Estado: IN PROGRESS hasta gates definitivos. Ejecución global anterior sobre `0b88063a48a7020de7d45ac1d711c8133c4517b2`: PostgreSQL2462/2462 y health1/1 PASS, pero diff-check FAIL por espacios del stdout regenerado en `tests/fixtures/h2-011/reproducer-F01-corrected.log`. La prueba histórica escribe ese archivo y F02; V-MIG F16 regenera `preservation.json`. No es incompatibilidad de guardas ni autoriza nuevas excepciones. Se conservan stdout/JSON completos en gzip, hashes de generación y baseline, y se restauran exactamente los bytes Git de esos tres outputs después de finalizar PostgreSQL. El runner nuevo automatiza exclusivamente ese archivo de evidencia y restauración. Guardas, manifiestos y snapshots protegidos F10/F12 no se modifican. El FAIL diff original permanece en `implementation/global-0b88063/diff-final.log.gz`; la corrida completa anterior es antecedente no elegible para cierre por F06. Retest global pendiente.

## F08 — Límite de captura del archivador nuevo

Estado: IN PROGRESS hasta retest definitivo. Sobre `3ae329df6c6f682d49dd474b576b66fac6ecf85f`, focal54/54, PostgreSQL2462/2462 y restantes gates previos PASS; el wrapper se interrumpió antes de health/diff con `GENERATED_BASELINE_MISSING`. Diagnóstico: `git show` del snapshot F16 existe, pero supera el maxBuffer por defecto de spawnSync; status null y ENOBUFS. El error no indica baseline ausente, incompatibilidad de preservación ni fallo de la migración. Diagnóstico original recuperable en `implementation/f08-archive-original-fail.log.gz`; corrida conservada en `implementation/global-3ae329d` sin cierre.

Correctivo único: maxBuffer explícito de128MiB para capturar bytes del snapshot histórico en el archivador de evidencia nuevo. No modifica producto de dominio, test funcional, oracle, guarda, snapshot, dependencia, permiso ni parámetro operativo; no amplía excepciones de preservación. Originales generados archivados con hash y restaurados byte a byte. Se repiten todos los gates sobre nuevo SHA para evitar arrastre de verificación.
