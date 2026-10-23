# Revisión independiente de TSK-H6-006

Fecha local: 2026-10-22. Dictamen: **PASS exclusivamente local/aislado**, sin hallazgos materiales abiertos en las once asignaciones de H6-006. El candidato es apto para la aceptación técnica local autorizada por el director. Este informe no cambia por sí mismo Tasks ni acredita publicación, proveedor real, Auth real, Hosted, restauración o Production.

La revisión la ha realizado un agente distinto del autor del candidato, a partir de normativa y fuentes congeladas, en `/Users/andres/.codex/worktrees/h6-independent-review/crm-huescaventura-os`. El revisor no ha modificado el candidato original. La independencia no se basa en volver a llamar al comparador instrumental del autor: se han leído fuentes, contrastado las once obligaciones, reproducido las pruebas en otro checkout y escrito contrapruebas y un verificador propios.

## Identidad y custodia

- Base comprobada: `971c55d5ce5770c71284d106d3c0deecca9514b5`.
- Candidato original: `/Users/andres/.codex/worktrees/h6-local-validation/crm-huescaventura-os`.
- Manifiesto entregado: `tests/fixtures/h6-local-validation/delivery-manifest.json`, SHA-256 `cea8c91910000d89a075401cbed60322ff71abccf5f7ba39569d188956bcd627`.
- Copiados exclusivamente los 291 payloads del manifiesto y el propio manifiesto sobre checkout de la base. Los 291 hashes y tamaños coinciden. Producto, migraciones, normativa y archivos históricos versionados permanecen iguales a la base.
- Expected original H6-006: SHA-256 `031dbfa4d9e3155a48ba909ebfe369d596acb9b020040cad3a24cd253e282809`; fuente normativa sellada: `4c183fc000c703b47b1ffae4df4ac1991e0107df31fd83c0b96085eb7dbfbd17`. Se verifican por separado las filas literales de Tasks y los once IDs de matriz/expected. Los expected describen condiciones normativas, no resultados calculados por el producto.
- La cronología conservada registra el congelado a `2026-10-21T22:17:35Z`, antes de la primera ejecución; los hashes permanecen constantes. Es una cronología interna del expediente, sin afirmar un sello temporal externo. El revisor deriva además un expected propio de SPEC/SM/Tasks antes de escribir y ejecutar sus diez casos adicionales.

Evidencia de custodia y contraste: [copy-verification.json](../../tests/fixtures/h6-independent-review/copy-verification.json), [integrity-review.json](../../tests/fixtures/h6-independent-review/integrity-review.json) y [verificador independiente](../../tests/fixtures/h6-independent-review/verify-review.py).

## Ejecución independiente

La reproducción exacta del grupo `h6-006` finaliza **62/62 PASS, 0 FAIL, 0 skipped**, con cuarenta observaciones nuevas. No se hereda el PASS de la ejecución del autor. PostgreSQL 17.11 real, Node 24.21.0, pnpm 11.19.0, Storage oficial fijado a `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, loopback y credenciales sintéticas efímeras. Se ha reutilizado una copia propia del cache público compilado intacto; el cache temporal histórico dañado se preserva. Puertos de Core 59606/59607/59609; bases y servicio Storage efímeros independientes.

El ensayo mata realmente el proceso ejecutor mediante SIGKILL después de escribir un hecho en el ledger del proveedor simulado. Un proceso nuevo observa el intento persistido; la recuperación conserva incertidumbre y reserva. El resultado original concilia una sola vez, su replay no consume de nuevo, otra parte continúa y el hecho comercial se mantiene. Es persistencia frente a caída de proceso; no se infiere restauración de backup ni supervivencia de hardware.

Los otros casos prueban exclusión con conexiones/PID distintos y esperas Lock observadas en ambos órdenes, fencing de generación, resultado tardío obsoleto frente a sucesor, fallos antes/durante escritura, fallo diferido y evidencia caducada en el último check del TTE, COMMIT real con respuesta retenida, aprobación exacta/retirada y controles persistidos. La inspección de código confirma que el proveedor se consulta fuera de la transacción sensible y que final check/COMMIT siguen bajo control del TTE conforme D039.

Referencias:

- [run.json de la reproducción](../../tests/fixtures/h6-local-validation/h6-006-2026-10-21T22-53-38-215Z/run.json), [stdout completo](../../tests/fixtures/h6-local-validation/h6-006-2026-10-21T22-53-38-215Z/stdout.log) y `observations/` del mismo directorio.
- [Test nuevo del candidato](../../tests/integration/postgres-h6-006.test.ts), [hijo proveedor durable](../../tests/support/h6-durable-provider-child.ts), [regresión H6](../../tests/integration/postgres-h6-006-regression.test.ts) y [frontera B09](../../tests/integration/postgres-h6-006-boundary.test.ts).
- [Comparación H5-008/H6](../../tests/fixtures/h6-independent-review/postgres-h6-006-regression.test.ts.diff) y [H5-009/H6](../../tests/fixtures/h6-independent-review/postgres-h6-006-boundary.test.ts.diff): solo encabezados, fixture de cadena completa y nombre/puerto de base. No se han debilitado las aserciones históricas.

## Once asignaciones contrastadas

| Obligación | Evidencia decisiva comprobada | Dictamen local |
|---|---|---|
| SPEC-FR-HA-003 | Aprobación/propuesta, actor humano y ejecutor técnico distintos; execution/attempt/part/reservation/result enlazados. Resultado durable del hijo y `late-result.json`; estados comerciales conservados. | PASS |
| SPEC-FR-CONC-005 | W03, W04/W08/W39, W46: claim exclusivo, generaciones, caída/reinicio, `claim-race-0/1`, `recovery-old-executor-race-0/1` y `commit-response-loss`. | PASS |
| SPEC-FR-ERR-002 | W05/W07/W23, W40/W41/W44 y recorrido SIGKILL; no claim/reenvío de parte incierta ni inferencia de ausencia de efecto. IR01/IR02 refuerzan los negativos. | PASS |
| AC-057 | Timeout y revisión/resume mantienen incertidumbre/reserva; medio de verificación ausente o ambiguo impide iniciar; resultado exacto posterior concilia una vez. | PASS |
| SM-HA-03 | Resultado verificado frente a inventado/discordante; guardas G1–G6: actor/scope/purpose, evidencia caducada, material/retirada, historia/rollback, partes independientes y no duplicación. | PASS |
| P15 | Siete cambios materiales denegados antes de reserva, nueva versión/retirada en ambos órdenes, aprobación histórica conservada; identidad del ejecutor distinta del humano. | PASS |
| PLAN-B09 | Diez casos B09: recepción canónica, identidad fiable/ambigua, duplicado/conflicto, echo propio, referencia corregida, límites de canal, autoridad, atomicidad y SQL directo. | PASS |
| PLAN-C05 | Intención e intento separados del resultado acreditado, parte pendiente conservada, fuente propia y canal no disponible; no envío/pago real deducido. | PASS |
| PT-09 | Aprobación exacta y estado actual; consumo por parte, concurrencia, incertidumbre, replay y expiración final. Solo contribución de H6-006, no cierre global de la familia. | PASS |
| E2E-06 | Recorrido Core desde propuesta/revisión/aprobación por contratos hasta caída real, recuperación, conciliación tardía y continuación segura, con doble externo de estado propio. | PASS |
| E4 | Estado incierto distinguido de fracaso/éxito; reserva e intento retenidos, intervención manual no convierte incertidumbre en fallo; fuente exacta requerida. | PASS |

## Diez contrapruebas nuevas del revisor

Expected independiente SHA-256 `9f78a5bb300e7d9e5a0768a9c78d9006dba5ecbb9fe6898f014a3f9c8b761862`, congelado antes del código. **10/10 PASS**, sin omitidas:

1. Discordancia individual de executionId, attemptId, outcome y resultRef devueltos por el proveedor: cuatro rechazos sin cambios en quince tablas; prueba exacta posterior consume una vez y replay no reinspecciona.
2. Efecto previo uncertain, proveedor ausente, check ausente, observación ausente y excepción del verificador: cinco rechazos antes de contacto/reserva; intento sigue claimed y las quince tablas permanecen iguales.
3. Mismo ID de resultado ya confirmado con material diferente: conflicto antes de reinspección, sin sobrescritura del hecho ni historia.

[Expected propio](../../tests/fixtures/h6-independent-review/independent-expected.json), [fuente de las contrapruebas](../../tests/integration/postgres-h6-independent-review.test.ts), [registro y hashes](../../tests/fixtures/h6-independent-review/supplemental-run.json), [stdout](../../tests/fixtures/h6-independent-review/supplemental.stdout.log). Estas diez pruebas no se incluyen dentro de las 62 originales.

También se han ejecutado unitarias **210/210 PASS**, lint/import boundaries **PASS**, typecheck **PASS** y `git diff --check` **PASS**. No hay cambios de producto que justifiquen repetir build o la regresión global completa. Los logs propios están en `tests/fixtures/h6-independent-review/`.

## Observaciones críticas y fallos conservados

**O01, informativa, resuelta por comprobación de alcance:** el source-manifest de la ejecución original satisfactoria H6-006 incluye un snapshot de `postgres-h6-008.test.ts` anterior a sus correcciones posteriores. Una comparación inicial indiscriminada de todas las fuentes detectó la diferencia; se conserva ese resultado en `integrity-review.json`. Ese test no pertenece a los tres seleccionados ni a su cierre transitivo de imports/child entrypoints. Todas las fuentes efectivamente usadas por H6-006 coinciden, y la reproducción independiente nueva usa y sella el candidato final completo, sin diferencias. No se atribuye el antiguo H6-008 a H6-006 ni se altera el manifiesto histórico.

**O02, refuerzo de evidencia, resuelto:** las cuatro discordancias de tuple y priorEffect uncertain estaban verificadas de forma directa en `tests/persisted-work.test.ts`, mientras la integración original mostraba sobre todo referencia inventada y fuente succeeded/unavailable. Las contrapruebas IR01/IR02 acreditan ahora directamente contra PostgreSQL la conservación de las quince tablas y ausencia de reserva ante cada variante. No se ha encontrado defecto de producto.

Se preservan íntegramente los tres fallos históricos originales: 52 errores de setup sin Storage; fallo de setup por cache dañado; 61 PASS/1 FAIL por comparación instrumental de UUID sin el namespace HA `a-`. La corrección final se coteja con `persisted-work-executor.ts`, que usa `a-` al vincular intento y resultado. No cambian expected, requisito de identidad ni producto. El comparador del autor declara correctamente independencia instrumental y no se presenta como este segundo revisor.

## Reproducción y límite del dictamen

En este checkout, con Node/pnpm de `/Users/andres/.openclaw/bin` en PATH:

```sh
node scripts/run-h6-local-validation.mjs h6-006
TMPDIR=/tmp/crm-h6-local-e6521d38a7a7 POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node scripts/test-postgres.mjs postgres-h6-independent-review.test.ts
python3 tests/fixtures/h6-independent-review/verify-review.py
pnpm test
pnpm lint
pnpm typecheck
```

La ejecución suplementaria conservada utilizó entorno limpio explícito, sin conexiones ni captura heredadas. `supplemental-run.json` identifica comando, tiempos, source y logs. El verificador independiente comprueba las observaciones nuevas, hashes, cobertura, permisos de resultado, dos PID y conservación; sus comparaciones de custodia no se cuentan como pruebas funcionales.

No hay commits, staging, push, despliegues, escrituras Hosted, Drive, datos reales ni efectos externos de negocio. El candidato original se relee al finalizar para comprobar de nuevo sus 291 payloads y manifiesto. **H6-015 NOT STARTED; ARCH-PENDING-002 y DM-PENDING-005 OPEN; H6 global sin cierre.** El PASS permite la aceptación técnica local de H6-006 en el alcance de este informe; las fuentes compartidas conservan todas sus verificaciones y puertas restantes.
