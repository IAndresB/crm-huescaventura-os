# Evidencia — TSK-H5-012, revisión independiente

**2026-10-15 — FAILED / STOP por H5-012-F01. Verificación independiente iniciada y no completada.** No aceptación H5-011/012 ni cierre global H5. Esta evidencia se añade después del cierre interno publicado de H5-011, sin reescribirlo.

## Base y autorización comprobadas

Autorización original de este chat: exclusivamente TSK-H5-012 cuando H5-011 tenga implementación y verificación interna terminadas, expected intacto y ausencia de bloqueos materiales conocidos. El cierre vigente de H5-011 está en su evidencia desde el apartado «Cierre interno autorizado de H5-011 y entrega a revisión independiente». Se han contrastado Constitution, README, DECISIONS, PROJECT-STATUS, NEXT-STEPS, Tasks, expected y sus fuentes. No hay AGENTS.md en el repositorio; se conservan las instrucciones del responsable. Los encabezados históricos sellados no se reescriben para actualizar estados.

Tras `git fetch origin`: `HEAD = main = origin/main = f063879d203330adb57d7e8fef3607ae796f52d5`, árbol `104b4ecba9dd72aa166410470b362a956ed866e2`, divergencia 0/0, índice vacío y checkout limpio antes de añadir esta revisión. Dependencias H4-024 y cierre interno H5-011 acreditadas documentalmente; H5-009/010 y sus cierres permanecen conservados. La automatización anterior continúa pausada: no se ha duplicado ni reactivado.

Expected congelado: [expected-TSK-H5-011-012.md](expected-TSK-H5-011-012.md), 67.346 bytes y SHA-256 `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`, intacto antes y después. Se mantienen 41 casos y 34 filas originales: 32 asignaciones de desarrollo, 28 de comprobación y 26 compartidas. No se convierten en 41 resultados físicos.

## Independencia y árbol probado

[Plan fuente primero](../../tests/fixtures/h5-012/independent-20261015/source-first-plan.json), SHA-256 `609d8f3226468e5e4f6bf85da2cd37d630111b20af184a70721925d495f3286a`, guardado antes de leer el producto H5-011 como contraste. Conserva filas literales, fuentes y prioridades de autorización/privacidad/calendario. El expected no se deriva de la implementación ni de sus aserciones.

Se ha creado una [copia desechable](../../tests/fixtures/h5-012/independent-20261015/isolated-copy.json) del commit publicado, con dependencias instaladas clonadas sin cambiar versiones. En ella se ha añadido únicamente la [prueba independiente nueva](../../tests/integration/postgres-h5-012-independent.test.ts). La preparación de datos usa fixtures anteriores por contratos reales; las aserciones y el escenario nuevo proceden de esta revisión. Las pruebas creadas por H5-011 no constituyen la evidencia independiente.

[Inputs](../../tests/fixtures/h5-012/independent-20261015/tested-inputs.json): producto exacto del SHA/tree publicados, más el verificador nuevo identificado por SHA-256. No cambios tracked en la copia antes o después del runner. Los resultados corresponden a esa combinación, no a un commit nuevo del verificador.

## Ejecución y resultados

Comando, en la copia aislada:

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node scripts/test-postgres.mjs postgres-h5-012-independent.test.ts
```

Node 24.21.0, pnpm 11.19.0 y PostgreSQL 17.11; runner oficial del repositorio con Storage oficial heredado en loopback, instancias efímeras y datos sintéticos. El runtime ordinario ejecuta las lecturas/escrituras de negocio por contratos F1/F2; observador y migración se reservan a comprobación y preparación. No pruebas de permisos basadas únicamente en dobles.

| Prueba independiente física | Observado |
|---|---|
| A01/A07/A08/A09, aspectos de acceso ordinario y autoridad | PASS: lectura autorizada; identidad no verificada, polling, SQL sin sobres, SELECT y DML directos rechazados. Cobertura parcial de esos casos conceptuales. |
| S02–S07/A05, aspectos de minimización y raíces | PASS: 18 combinaciones de seis superficies y tres destinatarios; cinco marcadores reservados/ajenos buscados tras selección, dos Bookings independientes y Booking conservado. No prueba completa de originales/adjuntos/vínculos compartidos ni del PACK literal. |
| C01/C02/C05/C07, noche con fecha modificada | **FAIL**: fecha vigente 23/10; calendario devuelve 20/10 como `verified`. [H5-012-F01](defects-TSK-H5-012.md). |

**Focal PostgreSQL independiente: 3 pruebas, 2 PASS, 1 FAIL, exit 1; 0 skipped/cancelled/todo.** Duración total del comando 12,603 segundos. [Log original](../../tests/fixtures/h5-012/independent-20261015/independent-postgres.log), [recibo con comando/fechas/hash](../../tests/fixtures/h5-012/independent-20261015/independent-postgres.status.json), [resultados estructurados](../../tests/fixtures/h5-012/independent-20261015/results-summary.json). Se conserva el primer resultado; no retest modificado ni instrumentación para obtener PASS.

El hallazgo material exige STOP antes de ampliar la batería. No se han ejecutado regresión PostgreSQL completa, unitarias completas, build, typecheck, lint, health independiente, auditoría de dependencias o V-MIG completa en H5-012. Aplicar la cadena de migraciones para preparar la focal no acredita V-MIG ni sus escenarios de recuperación/preservación. Los resultados anteriores 2493/2493, 733/733, 194/194, 9/9 y health1/1 de H5-011 conservan su atribución histórica; no se adoptan como resultados de H5-012.

## Cobertura y límites

[Matriz de los 41 casos y 34 filas](matrix-TSK-H5-012.md). Un escenario fallido afecta a cuatro casos; once tienen comprobaciones positivas parciales y 26 no se ejecutan por STOP. No son cuatro FAIL físicos ni once casos completos PASS. D020/H1-011 conserva pendientes los escenarios integrados no ejecutados; el defecto observa una fecha de noche superada, sin acreditar ni invalidar globalmente el cálculo civil. Las seis filas sin comprobación explícita H5-012 y las dos sin desarrollo H5-011 conservan sus asignaciones originales. V-SM no tiene transiciones propias asignadas; no se declara PASS de máquinas ni de todas las unidades históricas. H6-007/H6-017 y H5-013/014 no se preparan ni ejecutan.

Seguridad/privacidad verificadas únicamente hasta las dos focales descritas: denegaciones ordinarias y minimización comercial en la muestra. No auditoría completa de todas las firmas, sesiones, roles, objetos, originales o derivaciones. No datos reales, proveedores reales, envío, IA externa, Hosted/Production, cobros ni cambios en reservas reales. El defecto no demuestra fuga de datos ni modificación silenciosa por leer.

## Preservación, archivos y estado final

[Preservación](../../tests/fixtures/h5-012/independent-20261015/preservation.json): los **36.240 blobs tracked** y modos del checkout principal coinciden con el árbol publicado. Expected, migraciones, fixture/guarda V3, versiones V1/V2, sellos y evidencias históricas intactos. No se ejecutó el auditor V3 fuera de su contexto ni se alteraron refs para hacerlo pasar. F09/F06–F08, dos logs ORIGINAL NO RECUPERADO, 69 diferencias históricas y R67/R030 permanecen como antecedentes separados.

Únicamente se añaden esta evidencia, defectos y matriz H5-012; la prueba independiente; y plan, copia/inventario, log/recibo, observación, resultados y preservación bajo `tests/fixtures/h5-012/independent-20261015/`. No correctivos de producto, guardas o arnés. Índice vacío y HEAD/main/origin en la base publicada 0/0. Las nuevas rutas quedan sin seguimiento para revisión; sin staging, commit, push o despliegue.

**Estado alcanzado:** implementación y verificación interna H5-011 históricas conservadas; revisión independiente H5-012 FAILED y bloqueada por evidencia nueva H5-012-F01. No COMPLETED. Siguiente paso recomendado: autorizar un correctivo mínimo en una tarea de implementación, conservar este FAIL y después reanudar H5-012 sobre su árbol corregido. No se ejecuta ese paso ni ninguna otra tarea.
