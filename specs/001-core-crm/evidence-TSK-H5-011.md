# Evidencia parcial — TSK-H5-011

**IN PROGRESS local/aislado — STOP por H5-011-F01.** H5-012 independiente NOT STARTED. No cierre funcional ni publicación.

## Base y alcance probado

Preflight: main; `HEAD = main = 1346dd64ec2e9e804be23b17ea5f62f64515339c`, origin/main `71906987f9b74241cc4583e51498759829cded73`, divergencia 1/0, índice vacío y árbol inicialmente limpio. El commit local adicional contiene exclusivamente el expected independiente congelado. SHA-256 esperado `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`, 67.346 bytes, 41 casos y 34 filas normativas: intacto.

Se han añadido una migración sin tablas/estados de negocio nuevos, función protegida de lectura, adaptador, composición de proyecciones y focales. La composición PostgreSQL añade el adaptador a su puerto de lectura. Canonical sources B01/B07/B09 existentes se conservan; query, search, export, document, timeline y ai_context externos usan una lista comercial explícita de información permitida. No objetos/cuerpos/identidades/economía reservada en esa rama ni descargas por referencia. El código es un candidato sin validación positiva PostgreSQL y todavía no acredita toda la cobertura del expected.

Las seis rutas ejecutables y sus huellas están en [tested-inputs.json](../../tests/fixtures/h5-011/implementation-20261014/tested-inputs.json). Este inventario identifica el árbol modificado realmente probado; no un commit de producto. La documentación y los logs se añaden después, sin modificar esos inputs. No se han editado expected anteriores, migraciones históricas, código ajeno al alcance, pruebas/guardas históricas ni documentos normativos.

## Resultados observados, separados

| Control | Resultado observado | Evidencia / límite |
|---|---|---|
| Focal de dominio | 11/11 PASS | D020, conservación de decisiones económicas existentes, separación temporal/original, seis salidas, búsqueda posterior a minimización, cursor/finalidad. Resumen derivado del stream de herramientas, no stdout original ni acreditación PostgreSQL. |
| Focal PostgreSQL con runner existente | 2/6 PASS; 4 FAIL | [Log](../../tests/fixtures/h5-011/implementation-20261014/postgres-focal.log), [recibo](../../tests/fixtures/h5-011/implementation-20261014/postgres-focal.status.json). Rechazos de contexto/SQL y migración poblada/rollback/retry pasan; consultas positivas fallan. |
| Diagnóstico focal | Causa de rechazo identificada | [Log](../../tests/fixtures/h5-011/implementation-20261014/diagnostic.log). F2 exige read committed y el adaptador usa repeatable read. Instrumentación externa temporal; no es validación de producto. |
| Typecheck | PASS, exit 0 | pnpm typecheck, salida observada del stream; resumen derivado. |
| Límites/lint | PASS, exit 0 | pnpm lint, Import boundaries: PASS; resumen derivado. |
| Primer intento directo | 0/6, fallo de preparación | ISOLATED_STORAGE_REQUIRED; la consulta nueva no fue alcanzada. Mantener separado de la focal real. |
| Build, unitarias completas, regresión integrada y health independiente | NO EJECUTADOS | STOP por defecto material; no traslado de resultados históricos. |
| H5-012 independiente y cierres posteriores | NO EJECUTADOS | No autorizados por este bloque. |

[Resumen de gates y procedencia](../../tests/fixtures/h5-011/implementation-20261014/gates-summary.json). Node 24.21.0 y pnpm 11.19.0 observados. PostgreSQL nativo se ejecutó mediante el binario local de Postgres.app y el runner existente levantó Storage oficial de referencia únicamente en loopback con recursos sintéticos efímeros. Los procesos de las ejecuciones focales se cerraron; no configuración Hosted/Production ni conexiones externas de negocio. No se configura una integración real por usar el runner aislado.

V-MIG parcial observado: instalación de la función sobre cadena anterior, upgrade poblado con Booking, rollback de DDL inducido y retry; datos de Booking y catálogos de tablas anteriores comparados. No se afirma comprobación de todos los datos/funciones/roles ni cierre de preservación global. Las 11 focales de dominio y seis pruebas PostgreSQL no equivalen a 41 casos aprobados.

## Pendiente y STOP

[H5-011-F01](defects-TSK-H5-011.md) permanece OPEN. Correctivo mínimo: una línea del adaptador para read committed, sin cambios de guardas o normativa. NO APLICADO; requiere autorización por la instrucción de STOP ante defecto material. Después deben revalidarse consultas positivas y continuar la cobertura faltante con resultados nuevos separados.

La propuesta debe superar sus verificaciones locales antes de la revisión independiente y del cierre. No se ha hecho staging, commit o push de producto. Conservación, referencias temporales reales, fiscalidad y conectores mantienen sus puertas localizadas; sin datos personales reales, comunicaciones, cobros o cambios de estado externos. Los antecedentes de H5-009/010 se mantienen cerrados localmente y con su atribución original.

## 2026-10-14 — Correctivo autorizado H5-011-F01: aplicado; verificación focal incompleta

**Estado vigente de este bloque: STOP. H5-011 IN PROGRESS; H5-012 NOT STARTED.** Se conserva íntegro el antecedente superior, incluidos sus resultados originales y su propuesta entonces no aplicada. Esta sección registra la autorización posterior y los resultados nuevos. **No se marca F01 CORRECTIVO VERIFICADO LOCALMENTE**: la focal PostgreSQL no pasa completa.

### Preflight y árbol probado

`main`, `HEAD = main = 1346dd64ec2e9e804be23b17ea5f62f64515339c`; base publicada `origin/main = 71906987f9b74241cc4583e51498759829cded73`, tras fetch. Divergencia 1/0 explicada por el commit local exclusivo de congelación; índice vacío. Los seis archivos ejecutables coinciden antes del correctivo con el inventario anterior; los cambios locales existentes se identifican y preservan. Expected congelado intacto: 67.346 bytes, SHA-256 `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`.

[Preflight e inventario de preservación](../../tests/fixtures/h5-011/f01-corrective-20261014/preflight-preservation.json), [entradas realmente probadas](../../tests/fixtures/h5-011/f01-corrective-20261014/tested-inputs.json). SHA-256 del nuevo manifiesto: `bd7cb2423e7b8100e96e32088b63f575ec370c34db4bbc7ff52157bcd44f5e0f`. Atribución: árbol local sin commit de producto identificado por esos seis archivos y sus huellas, **no** al SHA HEAD aislado. Documentación/evidencias se añaden después sin cambiar esas entradas.

Único delta funcional frente al inventario previo: [diff autorizado](../../tests/fixtures/h5-011/f01-corrective-20261014/authorized-change.diff).

```diff
-  try{return await this.sql.begin("isolation level repeatable read",async tx=>{
+  try{return await this.sql.begin("isolation level read committed",async tx=>{
```

No otra línea de código ni cambio de fixture, expected, migración, permisos, RLS, guardas, criptografía o contrato. El aislamiento pasa a cumplir las exigencias existentes de F1/F2; no se crea regla de negocio.

### Resultados nuevos, sin sustituir los anteriores

| Control | Resultado | Evidencia |
|---|---|---|
| 11 focales de dominio | 11/11 PASS, exit 0 | [Stdout/stderr](../../tests/fixtures/h5-011/f01-corrective-20261014/domain-focal.log), [recibo](../../tests/fixtures/h5-011/f01-corrective-20261014/domain-focal.status.json). |
| 6 focales PostgreSQL | 4/6 PASS; 2 FAIL, exit 1 | [Stdout/stderr](../../tests/fixtures/h5-011/f01-corrective-20261014/postgres-focal.log), [recibo](../../tests/fixtures/h5-011/f01-corrective-20261014/postgres-focal.status.json). |
| Typecheck | PASS, exit 0 | [Log](../../tests/fixtures/h5-011/f01-corrective-20261014/typecheck.log), [recibo](../../tests/fixtures/h5-011/f01-corrective-20261014/typecheck.status.json). |
| Lint / límites arquitectónicos configurados | PASS, exit 0; Import boundaries: PASS | [Log](../../tests/fixtures/h5-011/f01-corrective-20261014/lint.log), [recibo](../../tests/fixtures/h5-011/f01-corrective-20261014/lint.status.json). `pnpm lint` ejecuta `check:boundaries`; no se afirma otra suite de lint. |
| Diagnóstico limitado de las dos aserciones | Datos observados, no PASS funcional | [Log](../../tests/fixtures/h5-011/f01-corrective-20261014/assertion-diagnostic.log), [procedencia y fuente temporal](../../tests/fixtures/h5-011/f01-corrective-20261014/assertion-diagnostic.status.json). |

[Resumen por prueba](../../tests/fixtures/h5-011/f01-corrective-20261014/results-summary.json).

| Prueba PostgreSQL individual | Resultado | Alcance observado |
|---|---|---|
| H5-011 native C01: reconstructs exact chain and scoped original/history without business writes | PASS | Reconstrucción prevista por la focal; Booking conservado. |
| H5-011 native external surfaces: explicit commercial output preserves fixed internal economics | FAIL | `content.includes("1000.01")` falla; las comprobaciones posteriores de esa prueba no quedan ejecutadas. |
| H5-011 native calendar reads current canonical service references | FAIL | Primera referencia distinta de `f.detail.services[0].id`; las aserciones posteriores no quedan ejecutadas. |
| H5-011 native scope, untrusted context and SQL privilege attempts deny | PASS | Rechaza raíz inexistente, auth/contexto falsificados, polling, lectura SQL sin sobres y SELECT directo. |
| H5-011 native independent bookings and stale sessions remain isolated | PASS | Booking ajeno ausente de la lectura; actor inhabilitado rechazado y fixture restaurado en finally. No equivale a auditoría completa de todas las variantes de sesión. |
| H5-011 V-MIG: rollback/retry leaves prior data and existing objects unchanged | PASS | Conserva la comprobación parcial ya descrita de upgrade poblado, rollback/retry y catálogo de tablas; no cierre V-MIG global. |

Comandos exactos: `node --test --experimental-strip-types tests/coordinated-projection-h5-011.test.ts`; `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node scripts/test-postgres.mjs postgres-h5-011.test.ts`; `pnpm typecheck`; `pnpm lint`. Runner existente aislado con Storage oficial heredado, datos sintéticos y PostgreSQL nativo efímero. No repetición de la invocación directa que falló en preparación. El diagnóstico posterior usa una copia temporal fuera del repositorio del mismo runner con dispatch de observación, conserva preparación/cleanup y no instrumenta ni altera el producto; su exit 0 no se transforma en PASS de pruebas.

### F1/F2, preservación y límites

F1/F2 y demás archivos previos conservan sus huellas; el cambio cumple su exigencia de read committed. La focal negativa y la inhabilitación del actor siguen rechazando los intentos mencionados. No se afirma auditoría criptográfica independiente ni cobertura completa V-DAT a partir de esas dos pruebas.

[Verificación final de preservación y Git](../../tests/fixtures/h5-011/f01-corrective-20261014/final-verification.json): todos los archivos tracked coinciden con el preflight, incluidos runtime con su delta anterior, expected y guardas; de las seis entradas ejecutables solo cambia la línea autorizada del adaptador. Todos los archivos de evidencia del intento anterior son idénticos. Los dos Markdown originales se conservan como prefijo exacto y reciben únicamente esta ampliación documental. No se modifican módulos históricos ni documentos normativos.

Archivos cambiados en este bloque: `src/infrastructure/postgres/h5-projection-adapter.ts`, ampliación de este documento y `defects-TSK-H5-011.md`, más nuevos logs/recibos/inventarios en `tests/fixtures/h5-011/f01-corrective-20261014/`. Los demás cambios locales listados en Git son anteriores e intactos. Estado final: main, HEAD/origin y divergencia 1/0 indicados arriba, índice vacío, árbol con candidato local y evidencia sin commit. No staging, commit ni push.

### Diagnóstico y siguiente puerta

Las consultas positivas ya no fallan por `F2_DENIED`. Quedan dos errores de aserción, documentados con fuentes y correctivo mínimo **propuesto, no aplicado** en [F01, actualización posterior](defects-TSK-H5-011.md). Los 4/6 no se sustituyen por un PASS inferido del diagnóstico. No se afirma cobertura total de 41 casos.

STOP tras este bloque. Build, regresión PostgreSQL completa, unitarias completas, health independiente y H5-012 NO EJECUTADOS. Expected intacto; H5-011 no COMPLETED. F09 y F06–F08 mantienen su cierre exclusivamente local/aislado; logs ORIGINAL NO RECUPERADO, 69 diferencias históricas y R67/R030 conservan sus límites. Sin Hosted/Production, integraciones externas, comunicaciones, cobros ni despliegue.

## 2026-10-14 — Correctivos de las dos aserciones PostgreSQL: focales completas PASS

**Estado vigente: H5-011 IN PROGRESS, H5-012 NOT STARTED; STOP tras este bloque. F01 OPEN, correctivo verificado localmente en focales; cierre formal pendiente.** Las secciones previas se conservan íntegramente como antecedentes. No se sustituyen los resultados 2/6 y 4/6 ni se atribuye al HEAD un producto que sigue sin commit.

### Preflight, normativa y alcance exacto

Fetch realizado; rama main, `HEAD = main = 1346dd64ec2e9e804be23b17ea5f62f64515339c`, `origin/main = 71906987f9b74241cc4583e51498759829cded73`, divergencia 1/0 por el commit local de congelación, índice vacío. Expected intacto: 67.346 bytes y SHA-256 `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`. Las seis entradas ejecutables coinciden con el manifiesto de F01 antes de editar; documentos coinciden con la comprobación final anterior, y evidencia original identificada/preservada. [Preflight](../../tests/fixtures/h5-011/test-correctives-20261014/preflight-preservation.json).

**Precio:** expected §4.3 S02–S08, BR-PACK-003 (Business Rules §25), SPEC-FR-PROP-003 y SPEC-FR-SEC-003 exigen precio final por persona, participantes e incluidos por modalidad, excluyendo economía interna y personales innecesarios. No exigen 1000,01 EUR. El fixture existente `acceptanceFixture`, línea 11, fija 100,01 por persona y 10 participantes en ambas modalidades. El escenario PACK de expected §3/S08 conserva 120/180 y 10/8: este bloque no lo sustituye ni declara ese caso completo ejecutado.

**Calendario:** expected §4.2 C01/C02 y SPEC-FR-COORD-008 exigen referencias canónicas y pertenencia al alcance. Expected §2 declara expresamente que no fija orden ascendente/descendente ni desempates. `BookingDetail` conserva IDs propios por servicio, y `bookingFixture` genera UUID estables para ese escenario, sin contrato de primera posición; sus horarios son null. El contrato operativo existente `modification_scope` conserva servicio, Booking, revisión, fecha, horario y cancelación; ausencia de hechos de realidad deja phase null. No contradicción material con los correctivos autorizados ni regla nueva de ordenación.

Único archivo ejecutable cambiado en este bloque: `tests/integration/postgres-h5-011.test.ts`, únicamente los bloques de las dos aserciones autorizadas. Producto, SQL/migraciones, guardas F1/F2, contratos, fixtures y expected quedan byte/mode idénticos. Imports, hooks, preparación de datos y las otras cuatro pruebas quedan iguales. [Diff completo antes/después](../../tests/fixtures/h5-011/test-correctives-20261014/authorized-change.diff).

| Aserción anterior | Aserción nueva | Cobertura conservada o reforzada |
|---|---|---|
| `content.includes("1000.01")` | Cardinalidad y comparación estructurada sin orden del conjunto de entradas con modalidades del fixture: reference de versión, finalPersonPrice, participants e included. Nombres de servicio leídos por sus revisiones canónicas del catálogo; cantidad/fecha vienen del fixture. | Ambas modalidades, precio por persona 100.01, participantes 10 e incluidos exactos, sin campos adicionales en entradas ni objetos anidados. Number(l.quantity) normaliza la representación del 1 del fixture; no calcula importes ni cambia unidad/precio. Controles previos de exclusión del JSON, búsqueda reservada y economía interna quedan intactos. |
| Primer resultado igual a primer servicio del fixture | Conjunto exacto de referencias y cardinalidad, unicidad y comprobaciones por cada ID esperado. | Presencia de ambos servicios, identidad en reference/scope.id, Booking, revisión canónica, fecha exacta y tipo string, schedule null sin inventar hora, no cancelado, source y phase null. Sin duplicados o servicios ajenos en el conjunto de servicios; sin orden artificial. |

[Entradas probadas](../../tests/fixtures/h5-011/test-correctives-20261014/tested-inputs.json), SHA-256 del manifiesto `6c9000f3b835860b7572061042fd5d09012d1b62006ce97a1f19f2d847341b75`. Identificación del árbol local sin commit por seis rutas y sus huellas; la única transición frente al manifiesto previo es el archivo focal. Documentación/logs se añaden después sin alterar inputs.

### Resultados efectivamente ejecutados

| Focal PostgreSQL individual | Resultado |
|---|---|
| H5-011 native C01: reconstructs exact chain and scoped original/history without business writes | PASS |
| H5-011 native external surfaces: explicit commercial output preserves fixed internal economics | PASS |
| H5-011 native calendar reads current canonical service references | PASS |
| H5-011 native scope, untrusted context and SQL privilege attempts deny | PASS |
| H5-011 native independent bookings and stale sessions remain isolated | PASS |
| H5-011 V-MIG: rollback/retry leaves prior data and existing objects unchanged | PASS |

**PostgreSQL 6/6 PASS**, fail/cancelled/skipped/todo 0, exit 0: [stdout/stderr original](../../tests/fixtures/h5-011/test-correctives-20261014/postgres-focal.log), [recibo](../../tests/fixtures/h5-011/test-correctives-20261014/postgres-focal.status.json). Comando `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node scripts/test-postgres.mjs postgres-h5-011.test.ts`, con runner oficial existente, Storage heredado aislado y PostgreSQL nativo efímero/sintético. Sin invocación directa ni cambios de preparación para conseguir PASS.

**Dominio 11/11 PASS**, exit 0: `node --test --experimental-strip-types tests/coordinated-projection-h5-011.test.ts`, [log](../../tests/fixtures/h5-011/test-correctives-20261014/domain-focal.log), [recibo](../../tests/fixtures/h5-011/test-correctives-20261014/domain-focal.status.json).

**Typecheck PASS**, exit 0: `pnpm typecheck`, [log](../../tests/fixtures/h5-011/test-correctives-20261014/typecheck.log), [recibo](../../tests/fixtures/h5-011/test-correctives-20261014/typecheck.status.json).

**Lint/límites arquitectónicos PASS**, exit 0: `pnpm lint` ejecuta `check:boundaries`, Import boundaries PASS; [log](../../tests/fixtures/h5-011/test-correctives-20261014/lint.log), [recibo](../../tests/fixtures/h5-011/test-correctives-20261014/lint.status.json). No se afirma una suite adicional no configurada.

[Resumen e IDs individuales](../../tests/fixtures/h5-011/test-correctives-20261014/results-summary.json).

### Aserciones posteriores a los FAIL previos y seguridad

[Registro de aserciones alcanzadas](../../tests/fixtures/h5-011/test-correctives-20261014/executed-assertions.json). Los callbacks completos terminan PASS en el runner sin instrumentación. El flujo es lineal y awaited, sin return, catch, skip o eliminación de aserciones que pudieran omitir los puntos posteriores:

- En las seis superficies query/search/export/document/timeline/ai_context: comparación comercial estructurada, exclusión original de cost_amount/costMaterial/economics/accepter_id/terms_text/700.00 y búsqueda 700.00 sin entradas. El conjunto de entradas exacto también excluye campos adicionales de margen, comisión, honorarios o personales, conservando la forma comercial mínima.
- Tras las seis superficies: lectura interna y comprobación de conservación de economics alcanzadas y PASS; no reutiliza la salida interna para terceros.
- En ambos servicios: identidad, referencia, pertenencia, fecha, horario desconocido null, estado y procedencia alcanzados y PASS; la comprobación de tipo string posterior al fallo anterior se conserva.
- Focales negativas y de aislamiento: raíz inexistente, auth/contexto falsificados, polling, SQL sin sobres, SELECT directo y actor inhabilitado siguen rechazados. F1/F2 y todas sus autoridades, permisos y criptografía quedan intactos por huellas/diff. No equivale a verificación criptográfica completa ni a ejecución independiente H5-012.

No nuevos fallos observados en este bloque. El PASS V-MIG sigue teniendo el alcance parcial de su focal: upgrade poblado, rollback/retry y comparación de Booking/catálogo de tablas. No acredita por sí solo preservación global de todos los datos/funciones/roles. Las 6+11 focales tampoco equivalen a los 41 casos del expected ni a regresión completa.

### Preservación, Git y STOP

[Comprobación final](../../tests/fixtures/h5-011/test-correctives-20261014/final-verification.json): expected y cinco inputs ejecutables restantes idénticos al preflight; anteriores documentos conservados como prefijo exacto y ampliados únicamente aquí/en F01; todos los archivos de evidencia anteriores intactos. Git diff/check y comprobación documental sin defectos; única transición de prueba autorizada identificada por el diff guardado. Sin modificaciones de producto, fixture o guardas para obtener PASS.

Estado final Git: main, HEAD/origin y divergencia 1/0 indicados; índice vacío. Persisten los cambios locales anteriores de implementación/evidencia; no se limpian ni restauran. Este bloque añade únicamente el correctivo focal, ampliaciones de los dos documentos H5-011 y nueva evidencia en `tests/fixtures/h5-011/test-correctives-20261014/`. Sin staging, commit o push.

STOP. F01 permanece OPEN con verificación focal local satisfactoria, pendiente de cierre formal autorizado. H5-011 IN PROGRESS y H5-012 NOT STARTED. Build, regresión PostgreSQL completa, unitarias completas, health independiente, H5-012, Hosted/Production y despliegues/integraciones reales NO EJECUTADOS. No datos personales reales ni comunicaciones/cobros. F09 y F06–F08 y los límites históricos permanecen intactos; no reabrir ni avanzar fases.

## 2026-10-14 — Verificación integral interna y STOP protegido

**Estado vigente: H5-011 IN PROGRESS; H5-012 NOT STARTED.** No se declara implementación/verificación interna COMPLETED porque la regresión falla y hay recorridos integrados cuya cobertura no se acredita completa. F01 CLOSED técnico local; F14 OPEN por fixture H4 protegido. Se conservan íntegros antecedentes y resultados originales.

Preflight tras fetch: main, HEAD local `1346dd64ec2e9e804be23b17ea5f62f64515339c`, origin/main `71906987f9b74241cc4583e51498759829cded73`, divergencia1/0 y índice vacío. Inventario, documentos y36 evidencias H5-011 anteriores coinciden. Expected67.346 bytes/SHA-256 `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b` intacto. [Preflight](../../tests/fixtures/h5-011/integral-20261014/preflight-preservation.json).

### Árbol e identificación de resultados

[Inventario final](../../tests/fixtures/h5-011/integral-20261014/tested-inputs.final.json), SHA-256 `de43fc2bfb73c3129f67dd897f1580e10aa239ba46254bc28bc507ba0b1f2a59`: ocho entradas ejecutables, incluyendo runtime en sus bytes históricos. La copia local aislada reproduce esos bytes; conserva historia Git para las guardas, dependencias instaladas copiadas sin cambios de versión y referencia origin/main publicada. [Preparación de copia](../../tests/fixtures/h5-011/integral-20261014/isolated-copy.json). No commit de producto; estos resultados no pertenecen al HEAD como si contuviera el delta.

### Gates definitivos

| Gate | Observado | Evidencia |
|---|---|---|
| PostgreSQL completa, runner autorizado |2492/2493 PASS;1 FAIL;0 skipped/cancelled/todo |[Log](../../tests/fixtures/h5-011/integral-20261014/postgres-complete.final.log), [recibo](../../tests/fixtures/h5-011/integral-20261014/postgres-complete.final.status.json). |
| Unitaria completa |194/194 PASS |[Log](../../tests/fixtures/h5-011/integral-20261014/unit-complete.final.log), [recibo](../../tests/fixtures/h5-011/integral-20261014/unit-complete.final.status.json). |
| Health independiente |1/1 PASS, separado |[Log](../../tests/fixtures/h5-011/integral-20261014/health-independent.final.log), [recibo](../../tests/fixtures/h5-011/integral-20261014/health-independent.final.status.json). |
| Build |PASS, exit0 |[Log](../../tests/fixtures/h5-011/integral-20261014/build.final.log), [recibo](../../tests/fixtures/h5-011/integral-20261014/build.final.status.json). No despliegue. |
| Typecheck |PASS, exit0 |[Log](../../tests/fixtures/h5-011/integral-20261014/typecheck.final.log), [recibo](../../tests/fixtures/h5-011/integral-20261014/typecheck.final.status.json). |
| Lint / límites arquitectónicos |PASS, exit0 |[Log](../../tests/fixtures/h5-011/integral-20261014/lint.final.log), [recibo](../../tests/fixtures/h5-011/integral-20261014/lint.final.status.json). Check configurado: import boundaries. |
| Auditoría de dependencias |0 vulnerabilidades;81 dependencias reportadas |[JSON original](../../tests/fixtures/h5-011/integral-20261014/audit.final.log), [recibo](../../tests/fixtures/h5-011/integral-20261014/audit.final.status.json). Sin modificar package/lockfile. |
| Auditor histórico sobre checkout actual |NO PASS; inventario H5-009/010 rechaza nuevas rutas H5-011 |[Log retest](../../tests/fixtures/h5-011/integral-20261014/historical-preservation.cache-retest.log), [recibo](../../tests/fixtures/h5-011/integral-20261014/historical-preservation.cache-retest.status.json). No se cambia guard/manifest/sello. |

[Resultados estructurados y SHA-256/bytes de cada log final](../../tests/fixtures/h5-011/integral-20261014/results-summary.json). Comandos exactos, cwd y duración están en cada recibo. PostgreSQL17 nativo/Storage oficial heredado loopback, datos exclusivamente sintéticos; no Hosted/Production. Versiones de paquetes del lockfile conservadas; Next16.3.8, Node24.21.0 y PostgreSQL17.11 del binario local.

Las20 nativas propias H5-011 y23 pruebas de dominio propias pasan dentro de estas suites, **incluidas una vez** en2493 y194; no se suman otra vez. Las focales anteriores y retests standalone quedan con sus inventarios de aquella ejecución. Focales H4/H5 y consumidores se ejercitaron en la completa; no se declara una focal ampliada separada PASS después del STOP ni un health de negocio/Hosted.

### Revisión crítica, seguridad y migración

La revisión detectó y corrigió F02–F13 ordinarios: preservación del runtime histórico; preparación de copia; linaje de Contact; derivados y recibos; certeza pendiente/estimada; tiempos explícitos; identidad UUID; orden técnico por instantes, incluyendo fracción de PostgreSQL; preservación de ACL y código ya asignado. [Registro](../../tests/fixtures/h5-011/integral-20261014/defect-register.json). Los resultados rojos anteriores se conservan, incluidos los fallos de infraestructura; no se normalizan como PASS.

Seguridad real focal: F1/F2 genuinos y cada MAC/input de Booking alterado; rol runtime ordinario, acceso SQL/DML sin autoridad, contexto falsificado/polling, actor inhabilitado y sesión revocada; Books independientes y original compartido con solo vínculos solicitados. ACL sin PUBLIC en función nueva, owner executor NOLOGIN/NOBYPASSRLS, search_path controlado, RLS/FORCE RLS de tablas privadas. Advisors oficiales pin2.119.0 sobre loopback: results=[] dentro de la prueba actual. Guardas/criptografía/finalización históricos sin cambios.

Privacidad: PACK literal120/10 y180/8 con fijo900 y coste700 internos, seis superficies para customer/provider/ai con entradas mínimas exactas y búsqueda posterior a minimización. Original/derivado/candidato y evidencia conocida separados; ningún resumen es original, pendiente no se eleva a confirmado, factura externa no crea numeración/factura CRM, consulta no ejecuta cambio crítico/eco/escritura Avaibook. No nuevos roles activos ni políticas de retención/audio.

V-MIG actual: fresh cadena anterior más función58; upgrade57 poblado, rollback de DDL inducido, retry y reaplicación negada.170 tablas y283 funciones previas, todos sus datos por digest y catálogo de tablas/schemas/roles/policies/funciones preservados; exactamente una función nueva. No cambio de permisos previos: el revoke CREATE indebido del SQL nuevo se retiró. Los hashes de datos incluyen solo salida digest, no secretos/credenciales. La prueba básica6 y la ampliada14 no sustituyen la revisión independiente H5-012.

[41 casos trazados y34 filas normativas](matrix-TSK-H5-011.md): no41 PASS. Se corrigió la atribución demasiado amplia C03–C08 de una unidad que solo verificaba intervalos de servicio. El escenario integrado de saldo/cifra final13/14 noviembre no se atribuye a esa unidad. C01/C05–C08 y escenarios completos no ejercitados permanecen delimitados; las asignaciones H1-011→H5-012 y H6-007/H6-017 se conservan sin ejecutarlas ni prepararlas.

### Preservación, defecto bloqueante y estado final

La suite corre en copia desechable para proteger evidencias. Sus tres outputs históricos regenerados se archivan separados y los originales del checkout no se tocaron. [Generados finales](../../tests/fixtures/h5-011/integral-20261014/generated.final.json). La CLI alteró su cache cli-latest durante la focal: generado archivado y solo ese cache restituido a HEAD, sin git reset/restore/clean. [Recibo](../../tests/fixtures/h5-011/integral-20261014/cli-cache-preservation.json).36 evidencias H5-011 previas y expected intactos; todas las rutas tracked vuelven a HEAD. [Preservación y STOP](../../tests/fixtures/h5-011/integral-20261014/preservation-and-stop.json).

Único FAIL final: H4-012 R06 en test protegido, evidencia generada14/10 posterior al comando13/10; la guarda temporal correcta rechaza E3. [F14 y correctivo mínimo NO APLICADO](defects-TSK-H5-011.md). Requiere autorización de transición literal del fixture protegido y sus guardas, no permiso genérico para alterar tests hasta PASS. No se reabren F09/F06–F08, ORIGINAL NO RECUPERADO,69 diferencias históricas o R67/R030.

Archivos nuevos/cambiados de implementación: dominio y adaptador H5-011, migración58 nueva, dos archivos de dominio y dos de PostgreSQL. Runtime antiguo restaurado exacto, sin delta final. Ampliación de evidence/defects y nueva matrix H5-011, más logs/inventarios propios. No documentos normativos, expected congelados, código/migraciones/fixtures/guardas históricos modificados.

Main, HEAD1346dd64/origin71906987/divergencia1/0, índice vacío, árbol con candidato H5-011 sin seguimiento y sin cambios tracked. Sin staging, commit, push o despliegue. H5-011 no COMPLETED; H5-012 NOT STARTED. STOP tras documentación por el límite protegido, sin operaciones reales.

## 2026-10-14 — H5-011-F14: correctivo temporal autorizado; STOP de transición de preservación

El fixture `tests/support/h4-modification-fixtures.ts` traslada el override explícito q.at a occurredAt por el contrato B07 existente; el caso por defecto conserva f.proof. Guarda de negocio, reloj global y aserciones R06 intactos. Original SHA256 `7739f5603d576a41855c0d1238f1f2535568e2dd34f4a8fd0f48d35fec8d75ed`; corregido `5cb28867ff6bbba211ff04fd65dc39f8d00c26727957bcc3d827e37708cd14d2` (2856→3177bytes). BR-HIST-002 distingue momentos de hecho/registro y payment_evidence admite occurred_at<=at_time con los demás controles intactos. El FAIL2492/2493 anterior permanece íntegro.

R06 pasa con sus aserciones originales; suplemento H4-012 completo **45/45 PASS**,0 FAIL/skipped/cancelled/todo. [Log](../../tests/fixtures/h5-011/f14-20261014/r06-and-supplement.log), [recibo](../../tests/fixtures/h5-011/f14-20261014/r06-and-supplement.status.json). Árbol sin commit [inventario](../../tests/fixtures/h5-011/f14-20261014/tested-inputs.candidate.json), SHA256 `a88f185697b7bc4a7727ec768af758e4aaabfae52bc8a59d5c40afacea85fea3`. No se atribuyen al árbol corregido los gates integrales del bloque anterior.

**F14 OPEN — correctivo funcional focal verificado; transición de preservación PENDIENTE. H5-011 IN PROGRESS; H5-012 NOT STARTED.** El precedente C12 admite pares exactos previa autorización y autenticación independiente de la guarda. El protocolo publicado exige revisión del diff y suministro separado del sello; la guarda no tiene una excepción F14 automática. Se prepara [propuesta de transición](../../tests/fixtures/h5-011/f14-20261014/preservation-transition-proposal.md) y [diff de guarda NO APLICADO](../../tests/fixtures/h5-011/f14-20261014/guard-transition.proposed.diff). Guarda y auditor histórico conservan sus hashes; ningún sello/inventario histórico se modifica. La guarda actual rechaza el hash nuevo y versiones arbitrarias, como corresponde antes de autorizar la transición.

STOP por instrucción§4: «Si el procedimiento exige aprobación adicional para alterar una guarda o auditor histórico, prepara la propuesta y detente antes de modificarlo». Resto H4-012, consumidores ampliados, transición/negativos sucesores, regresión completa, unitarias, build/typecheck/lint, health/audit y auditor compatible **NO EJECUTADOS en este bloque**. Expected congelado intacto;36 evidencias previas y todas las112 entradas H5-011 anteriores conservadas. Sin staging, commit, push, H5-012 ni efectos reales. F06–F09 conservan CLOSED histórico exclusivamente local/aislado; F16 y límites documentados intactos.

## 2026-10-15 — F14: expediente sucesor completo preparado; autenticación externa pendiente

Preparación autónoma autorizada. [Expediente sucesor](../../tests/fixtures/h5-011/f14-successor-20261015/README.md): guarda candidata inerte idéntica al diff anterior, original conservado, registro candidato, manifiesto, lanzador, auditor separado y contrapruebas. La guarda activa, el fixture corregido, los expected, el auditor F09 y todos los expedientes históricos permanecen intactos respecto al preflight. No se ha aplicado una nueva transición ni se ha generado una aprobación externa.

La raíz propuesta es trust.json, cuyo sello debe calcular y suministrar un revisor externo. El bootstrap independiente debe autenticar registro, lanzador y auditor antes de ejecutar el expediente. El protocolo sucesor mantiene la ejecución histórica F09/F16 sobre el snapshot publicado71906987 y verifica separadamente los bytes actuales y la transición F14 exacta. No reutiliza sellos históricos para autenticar archivos nuevos. Las contrapruebas futuras incluyen ambas entradas de comparación, versiones arbitrarias, ruta/hash/registro/modo/symlink/expected y adulteración del expediente antes del auditor.

La comprobación de preparación usa herramientas estándar ajenas al auditor y no acredita autenticación independiente ni PASS funcional. [Solicitud exacta de aprobación externa](../../tests/fixtures/h5-011/f14-successor-review-20261015/approval-request.md). No consta mecanismo autorizado y accesible para que esta ejecución obtenga una firma o un sello aprobado por un tercero. STOP exclusivamente en esa puerta. F14 OPEN; H5-011 IN PROGRESS; H5-012 NOT STARTED. No nuevas suites funcionales, staging, commit, push, despliegues o efectos externos. R06/suplemento45/45 y PostgreSQL2492/2493 anteriores conservan sus árboles y resultados; no se relabelan.

## 2026-10-15 — Activación F14 autenticada V1; STOP por auditor histórico del sucesor

El usuario suministró tras revisión independiente del ZIP el sello517619e94784ffbbf6267db25ba270d200927c3be1d3b2a998b11b2ef5ce2d97. Bootstrap independiente PASS; nueve artefactos exactos. Lanzador autenticado preapply PASS:35942 entradas históricas y135 entradas H5-011. Aplicado exclusivamente el diff autenticado de la guarda, SHA256722780f466a8d1f490ad3a4b993dfc1cda49bb1ee09242c1c7bbc192d09f8aa2, y copiado el registro por sus640bytes exactos, SHA25633797865bfebaf7e19649a805d47eafb232afff424d87aad6874d9a4a3eb4bcb. Fixture previo5cb28867 intacto. La aplicación no es cierre de preservación.

[Applied V1 FAIL](../../tests/fixtures/h5-011/f14-successor-runs/applied-20261015.log), con recibo separado: el auditor F09 original rechaza `unlisted posterior path: node_modules` en el snapshot desechable. El auditor sucesor audit.py sellado crea node_modules como enlace simbólico; la regla publicada node_modules/ ignora directorios físicos pero no ese enlace. [Diagnóstico reproducido](../../tests/fixtures/h5-011/f14-successor-runs/historical-dependencies-diagnosis-20261015.json) en un Git temporal, sin alterar exclusiones o dependencias reales. No es defecto de la guarda de negocio ni evidencia de regresión de producto.

El subproceso de contrapruebas retornó0 antes de alcanzar la fase histórica según el control de flujo autenticado. Su stdout individual quedó capturado en memoria y el auditor no lo exportó al fallar después; no se declara un recibo standalone31/31 conservado. No nuevas pruebas funcionales o gates posteriores a este fallo. R06/suplemento45/45 y PostgreSQL2492/2493 anteriores permanecen con sus árboles propios.

Correctivo mínimo propuesto, NO INSTALADO: audit.py copia físicamente node_modules al snapshot con shutil.copytree(...,symlinks=True), conservando enlaces internos de paquetes, sin instalar dependencias, cambiar .gitignore, ocultar rutas o debilitar el auditor. [Diff y candidato V2 completos](../../tests/fixtures/h5-011/f14-successor-runs/review-v2-20261015.json). SHA256 candidato auditor47d0eadfcb89c30036317b321223dbf9f7319841c3b57d99a907a00bc67a4088; checksum trust.json V2 bfc239e6f462d9aaef0a8700ef4e4777504efedb781aebe0a70be68cdb44f17d, únicamente propuesto para revisión. Ocho artefactos autenticados idénticos; audit.py y trust.json activos V1 intactos. El sello V1 no se atribuye a V2. Nuevo ZIP candidato verificado por bytes y modos entregado para revisión externa; no aprobación propia.

F14 OPEN; transición instalada, auditoría obligatoria pendiente. H5-011 IN PROGRESS; H5-012 NOT STARTED. STOP por la instrucción de activación: si cambia cualquiera de los nueve artefactos, el sello deja de ser válido y se exige nueva revisión independiente. Los nueve activos no se han modificado. Tras aprobación V2, preservar V1, instalar únicamente audit.py/trust.json V2 autenticados y retomar fase applied; la guarda/registro ya están aplicados y no se revierten/reaplican automáticamente. Expected, migraciones, contratos, expedientes históricos y evidencias anteriores intactos. Sin staging, commit, push, despliegues, operaciones reales ni H5-012.

## 2026-10-15 — V2 autenticada: preservación PASS; STOP por consumidor protegido MO01

Instalados únicamente audit.py y trust.json V2 desde el ZIP revisado, tras verificación independiente. Sello externo aceptado bfc239e6f462d9aaef0a8700ef4e4777504efedb781aebe0a70be68cdb44f17d; auditor47d0eadfcb89c30036317b321223dbf9f7319841c3b57d99a907a00bc67a4088. Los otros ocho artefactos permanecen idénticos. V1 conservada por bytes en v1-before-v2-20261015.json. Guarda722780f4 y registro33797865 no reaplicados ni recopiados; fixture5cb28867 intacto.

Bootstrap V2 PASS. Lanzador applied V2 **PASS**, incluida preservación actual35942/135, predecesores y auditor F09/F16 sobre snapshot71906987. [Recibo autenticado](../../tests/fixtures/h5-011/f14-successor-runs/v2-applied-20261015.log). **31/31 contrapruebas**, recibos individuales conservados por ejecución standalone y reejecución integrada; son31 casos, no62 distintos. [Recibos](../../tests/fixtures/h5-011/f14-successor-runs/v2-counterproofs-individual-20261015.json). El FAIL V1 por symlink sigue intacto.

Árbol funcional sin commit [inventario](../../tests/fixtures/h5-011/f14-successor-runs/v2-tested-inputs-20261015.json), SHA2563be54ea09624b8c906533d7fd12dc34a68cfc6e618c58aafdef42f5b9fae56da, en copia física independiente con dependencias completas antes de ejecutar. No se atribuye al SHA HEAD solo.

| Comprobación nueva V2 | Resultado |
|---|---|
| Focal PostgreSQL ampliada,31 archivos/consumidores transitivos | **732/733 PASS,1 FAIL**,0 skipped/cancelled/todo |
| R06 y suplemento H4-012 | **45/45 PASS** en el log actual; identificación exacta de casos, no conteo por prefijo compartido |
| Focal nativa propia H5-011 | **20/20 PASS**, subconjunto de733 |
| Dominio focal H5-011 | **23/23 PASS**, subconjunto de194 |
| Unitarias completas | **194/194 PASS** |
| Build/typecheck/lint y límites arquitectónicos | **PASS** |
| Health independiente | **1/1 PASS**, no Hosted/Production |
| Auditoría dependencias | **0 vulnerabilidades** |
| V-MIG nativa H5-011 | PASS:57→58 poblada,rollback/retry/reaplicación negada,170 tablas y283 funciones previas preservadas; una función nueva |
| Seguridad focal F1/F2, MAC/contexto alterados, sesiones/actor, Bookings, SQL directo/RLS/privilegios, salidas externas | **PASS** en las20 nativas; sin atribuir seguridad global independiente |
| PostgreSQL completa nueva | **NO EJECUTADA** tras FAIL focal protegido |

**Nuevo bloqueo dentro de F14:** `tests/integration/postgres-h4-012.test.ts:12`, MO01, error B07_INPUT_INVALID en attest antes de alcanzar m.run/assert.rejects. La prueba retira deliberadamente at:undefined; el fixture corregido selecciona entonces la rama temporal explícita porque undefined!==f.at y crea evidencia revisada sin occurredAt. B07 exige t no nulo. El await de attest ocurre durante la construcción del argumento de assert.rejects, fuera de su captura. Diagnóstico concreto, no atribuido a concurrencia/reloj/R67/R030 ni a la guarda de negocio.

[Diagnóstico, diff y candidato inerte](../../tests/fixtures/h5-011/f14-successor-runs/v2-mo01-protected-fixture-diagnosis-20261015.json): mínimo propuesto `if(q.at===f.at||q.at===undefined)` para conservar f.proof en el negativo de at ausente, manteniendo at ausente en el comando. No cambia aserciones ni controles; los instantes explícitos válidos conservan occurredAt=q.at. **NO APLICADO**.3177→3195bytes; hash candidato1dd453597648051e727efd2d394f2e248ab50fed3ed81e046ef7ba95fbe8d01b. Ese hash queda fuera de la transición autenticada actual; no puede introducirse sin nueva transición protegida y revisión de los artefactos afectados. No se admite automáticamente una tercera versión.

F14 **OPEN**, porque un consumidor obligatorio falla aunque preservación y R06 pasen. H5-011 **IN PROGRESS**; H5-012 **NOT STARTED**. La [matriz de contraste V2](../../tests/fixtures/h5-011/f14-successor-runs/v2-coverage-contrast-20261015.json) mantiene41 casos/34 filas y los límites previos de integración, especialmente C03 y C01/C05–C08; no41/41 ni aceptación por pasar focales. La matriz original congelada en el manifiesto no se modifica.

Una salida histórica F16 generada exclusivamente en la copia se archivó gzip por bytes antes de devolver a esa copia su original; el checkout principal no fue alterado. [Preservación de salida](../../tests/fixtures/h5-011/f14-successor-runs/v2-focal-generated-preservation.json). Contratos, migraciones, expected e históricos previos conservados.

STOP §5/§8 ante necesidad de cambiar el fixture protegido y su admisión autenticada. Ningún correctivo adicional aplicado; nueve artefactos V2, fixture y guarda activos permanecen exactos. Sin staging, commit, push, despliegue, operaciones reales ni H5-012. La siguiente autorización deberá delimitar la nueva versión del fixture y su transición, conservando ambas versiones anteriores y sus evidencias; V2 no autentica bytes nuevos.


## 2026-10-15 — Estado vigente: activación F14 V3 y regresión integral interna

**F14 CLOSED técnico local. H5-011 preparado para revisión de cierre interno/formal;
no COMPLETED. H5-012 NOT STARTED.** Cierre técnico basado en autenticación externa,
transición exacta, consumidores, preservación y regresión completas; la aceptación
independiente y publicación permanecen separadas.

Sello externo suministrado por el usuario tras revisión independiente:
`9dc6cc08ce3434490ea4108ae2807947ff88f0e8c5353cce22b59535d374d704`. Auditor autorizado e intacto:
`49d74834d2ab8c18228e102e7ed39e8f148da153c5ac522e8888753ed7c0a3da`.
Bootstrap independiente previo al auditor, preapply y applied PASS. Aplicados solo
fixture-transition.diff, guard-transition.diff y registro V3 byte-exacto en ruta
nueva. Fixture `1dd453597648051e727efd2d394f2e248ab50fed3ed81e046ef7ba95fbe8d01b`,
3195 bytes; guarda `8c0aeab42167b9a6f8c819d35311de2455ca70040754a8a93b77120abbeb7ade`.
Los doce artefactos/trust V3 no se modifican. V1/V2, sus sellos, archivos y ZIPs
contrastados independientemente e intactos. [Bootstrap](../../tests/fixtures/h5-011/f14-v3-runs/activation-v3-bootstrap-20261015.json),
[preapply](../../tests/fixtures/h5-011/f14-v3-runs/activation-v3-preapply-20261015.status.json),
[applied](../../tests/fixtures/h5-011/f14-v3-runs/activation-v3-applied-20261015.log),
[37 recibos individuales](../../tests/fixtures/h5-011/f14-v3-runs/activation-v3-counterproofs-individual-20261015.json),
[predecesores](../../tests/fixtures/h5-011/f14-v3-runs/activation-v3-predecessors-independent-20261015.json).

Resultados del árbol no publicado, inventario SHA-256
`6b5c9cb959bf51a929d1762b150addc93f737c209e5226e47f435dc9773e8c37`:

| Grupo | Resultado real | Atribución |
|---|---|---|
| PostgreSQL completa | 2493/2493 PASS, exit0; cero skips/cancelled/todo | runner oficial aislado |
| Focal ampliada,31 archivos | 733/733 PASS, exit0 | subset de regresión, no suma adicional |
| H4-012 principal/suplemento/F16 | 95/95 PASS; suplemento45/45; MO01 y R06 PASS | subset de focal |
| Focal propia PostgreSQL H5-011 | 20/20 PASS | subset de focal/regresión |
| Unitarias completas | 194/194 PASS | dominio H5-01123/23 incluido |
| Nuevas comprobaciones internas | 9/9 PASS, exit0 | copia desechable, fuentes exactas archivadas como JSON |
| Build / typecheck / lint / límites | PASS, exit0 | mismo árbol de producto |
| Health independiente | 1/1 PASS, exit0 | separado de funcionales |
| Dependencias | 0 vulnerabilidades, exit0 | pnpm audit --json |
| V-MIG | instalación vacía58;57→58 poblada;170 tablas/283 funciones anteriores preservadas;1 función nueva; rollback/retry/reaplicación negada PASS | funciones, esquemas, políticas, roles, ACL y datos previos exactos |
| F1/F2, RLS y seguridad | PASS | control positivo; cada MAC y binding falsos rechazados; actor/sesión revocados, SQL directo sin permiso, RLS/FORCE RLS, mínimo privilegio |
| Preservación | applied V3 y F09/F16 histórico PASS | histórico en71906987 y predecesorF16; no nueva funcional de ese SHA |

[Inputs exactos](../../tests/fixtures/h5-011/f14-v3-runs/regression-v3-tested-inputs-20261015.json),
[gates/exit/hashes](../../tests/fixtures/h5-011/f14-v3-runs/regression-v3-gates-20261015.json),
[recibos individuales y V-MIG](../../tests/fixtures/h5-011/f14-v3-runs/regression-v3-individual-receipts-20261015.json).
Node24.21.0, pnpm11.19.0, PostgreSQL17.11, Storage oficial aislado/pinned.
Los outputs de las suites en la copia se archivaron y solo allí se restituyeron
los outputs conocidos. Ningún archivo histórico del checkout se sobrescribió.

Las nuevas nueve pruebas internas cubren C01/C02/C03/C05–C08 y Organization/H07.
Calendario reúne servicios/noches/bloqueos/pagos/Task/requisito documental; el
vencimiento de hold se recupera siguiendo su referencia autorizada, sin imponer
campos/formato nuevos. C03 contrasta saldo500.00 sobre base1000.00 y Task de cifra
final a siete días:13 noviembre completo no vencido,14 vencido; ninguna cifra
estimada se confirma ni hay cobro por leer. Booking20/modalidad22/servicio20/noche23,
contrato expreso25 y sugerencia pendiente, cambios reales de hora/fecha, desconocidos,
paginación y Organization se contrastan sobre datos canónicos sintéticos.
[Fuentes reproducibles](../../tests/fixtures/h5-011/f14-v3-runs/internal-completion-sources-retry1-20261015.json),
[log9/9](../../tests/fixtures/h5-011/f14-v3-runs/internal-completion-retry1-20261015.log).

Conservados el primer intento Storage ISOLATED_STORAGE_NOT_READY sin pruebas
funcionales, y el intento9/9 FAIL de hooks por nombres de fixtures auxiliares
que excedían103 bytes de socket Unix de PostgreSQL en macOS. Causa de este último
confirmada por postgres.log; se acortaron solo los nombres en los tests nuevos de
la copia. No se alteraron producto, soportes protegidos, tests originales, puertos,
relojes o aserciones para obtener PASS. El fallo Storage inicial no recibe causa
no acreditada. [Diagnóstico y logs](../../tests/fixtures/h5-011/f14-v3-runs/internal-completion-infrastructure-diagnosis-20261015.json).

[Contraste vigente41/34](../../tests/fixtures/h5-011/f14-v3-runs/coverage-v3-41cases-34rows-20261015.json):41 casos
trazados y34 filas literales idénticas a Tasks;32 desarrollo/28 comprobación/26
compartidas.35 tienen comprobaciones internas principales ejercitadas y6 mantienen
límites de escenario conjunto/global (H01,H04,H08,C11,S11,A04). **No41/41 PASS de
casos completos**, no verificación independiente ni cierre global de esas fuentes.
Estos límites no se convierten en defectos materiales sin evidencia; se conserva
qué se ejecutó por componente y qué aceptación conjunta sigue sin acreditarse.
H1-011/D020 conserva integración H5-012; H6-007/H6-017, fiscalidad, observabilidad y
roles futuros mantienen sus asignaciones. No se inicia ni prepara su ejecución.

Expected67346bytes/SHA256669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b
intacto. F01–F13 conservan cierres técnicos locales; todos los FAIL anteriores,
F09/F06–F08 CLOSED local/aislado, dos logs ORIGINAL NO RECUPERADO,69 diferencias y
R67/R030 permanecen intactos. Sin datos reales, Hosted/Production, integraciones,
staging, commit, push, despliegue ni H5-012. HEAD1346dd64 y origin71906987 no cambian,
main1/0 e índice vacío. La identificación de inputs probados es distinta del cierre
documental y de cualquier publicación futura. STOP después del informe.


## 2026-10-15 — Cierre interno autorizado de H5-011 y entrega a revisión independiente

**H5-011: IMPLEMENTACIÓN Y VERIFICACIÓN INTERNA COMPLETADAS LOCALMENTE.
Cierre interno autorizado por Andrés; aceptación independiente H5-012 pendiente.**
F14 CLOSED técnico local. H5 global IN PROGRESS; H6 NOT STARTED.
La autorización de esta sesión permite crear y publicar un commit verificable y,
solo después de verificar la publicación, iniciar TSK-H5-012 en su hilo preparado.
No acredita todavía el inicio ni resultados de H5-012.

El producto, migración, pruebas, fixture y guarda que se publican conservan los
bytes del inventario realmente probado
`6b5c9cb959bf51a929d1762b150addc93f737c209e5226e47f435dc9773e8c37`.
Los logs originales se han contrastado por SHA-256: PostgreSQL2493/2493,
focal ampliada733/733, unitarias194/194, internas adicionales9/9, health1/1;
build/typecheck/lint/límites/audit/V-MIG/F1/F2/preservación PASS según los recibos
de la sección anterior. Las focales son subconjuntos, no se suman a la regresión.
No se reejecutan suites funcionales por este cierre documental ni se atribuyen
retroactivamente a un nuevo SHA Git. El enlace verificable con el commit se
establece comparando los blobs publicados con esos inputs, conservando separado
el cierre documental, la ejecución anterior y la publicación.

La revisión interna no encontró defectos materiales abiertos.41 casos y34 filas
están trazados;35 tienen comprobaciones internas principales y6 conservan
límites conjuntos/globales (H01,H04,H08,C11,S11,A04). **No se afirma41/41 PASS.**
H5-012 debe juzgar de forma independiente esos límites, las filas asignadas,
H1-011/D020 y todas sus obligaciones; un defecto material exige registro ySTOP,
sin corregir producto ni expected durante la revisión. H6-007/H6-017 y las
comprobaciones globales de otras tareas siguen con sus dependencias originales.

El expected mantiene67346bytes y SHA256
`669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`.
El sello V3 y sus12 artefactos, registros V1/V2/V3, expedientes yFAIL anteriores
permanecen intactos. Este cierre es el estado vigente de implementación; los
textos antiguos de Tasks, PROJECT-STATUS, NEXT-STEPS, propuestas autenticadas y
la matriz original permanecen como snapshots históricos protegidos, sin
reescribir sus declaraciones previas a la publicación.

El auditor V3 autentica el contexto de activación HEAD1346dd64/origin71906987
con índice vacío. Su recibo anterior al staging se conserva; después del commit
y push no debe adulterarse el auditor ni su contexto para obtenerPASS. Para
reproducción histórica se utiliza una copia desechable que reconstruya ese
contexto y esos bytes; las comprobaciones nuevas de H5-012 son independientes.

La comprobación de formato separa código/documentos de23 logs/parches crudos
con espacios originales. Estos últimos se publican byte a byte: no se normalizan
evidencias ni se cambian atributos, guardas o manifiestos para ocultar avisos.
El informe de cierre conserva las rutas y la salida literal del chequeo.

F09 yF06–F08 siguen CLOSED exclusivamente local/aislado; dos logs ORIGINAL NO
RECUPERADO,69 diferencias históricas yR67/R030 mantienen sus límites. Sin
Hosted/Production, despliegue, datos reales, comunicaciones ni operaciones reales.
