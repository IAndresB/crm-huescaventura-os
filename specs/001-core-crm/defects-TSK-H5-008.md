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
