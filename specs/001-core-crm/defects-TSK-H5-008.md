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
