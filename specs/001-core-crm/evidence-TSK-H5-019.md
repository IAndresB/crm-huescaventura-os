# TSK-H5-019 — Informe de cierre integrado Core: candidato local

## Dictamen propuesto y alcance

**PASS técnico exclusivamente local/aislado, preparado para auditoría independiente.** Las obligaciones de consolidación local están respaldadas por evidencias recuperables y no se detectan defectos materiales abiertos. Este dictamen es una propuesta: **H5-019 permanece IN PROGRESS, pendiente de auditoría y aceptación del director; H5 global IN PROGRESS; H6 NOT STARTED.** No se declara COMPLETED.

Se consolida seguimiento y coordinación, supervisión y ejecución, fronteras, proyecciones, historia, calendario, tres cierres y reapertura. El alcance corresponde a B06/B07/B08/B09/B10, C01–C06 y T08/T09/T10. Tasks §2.3 permite acreditar los tramos locales conservando las verificaciones integradas futuras.

## Base e identidad verificadas

La lectura inicial encontró `HEAD = main = origin/main = 1e7822c11be817e4f2d4791338284aa825ad1a24`, árbol `bbc8b1f1219201a8425e55a5cde6ce873cdc4006`, divergencia 0/0, índice vacío y working tree limpio. No había cambios ajenos. Una lectura posterior mediante `git ls-remote origin refs/heads/main`, sin fetch ni mutación remota, confirmó el mismo SHA: [recibo](../../tests/fixtures/h5-019/remote-readback.json).

Se protegen individualmente **38.524 archivos publicados**, por ruta, tamaño, modo y SHA-256. El JSON de preflight se capturó después de crear el inventario propio y refleja ese instante posterior; su nota conserva la distinción con la primera lectura limpia. El original no se sobrescribe.

La identidad ensayada es el producto publicado intacto, acompañado por las pruebas e instrumentos H5-019 identificados en cada captura. **No existe un nuevo commit probado.** El inventario y sello finales vinculan también las altas documentales posteriores, sin atribuir sus bytes a una ejecución funcional anterior. El verificador rechaza cambios en cualquier archivo publicado y altas ajenas al namespace autorizado.

## Autoridad y trazabilidad

Fuentes consultadas directamente: Tasks §§2.1–2.3, ficha H5-019, §6 y §7; SPEC y sus FR/NFR/AC; Plan §§7–12, contratos y unidades; BR-TASK/DOC/COMM/INC/CLOSE/AUTO/INT/HIST; SM-DO/TA/IN/CO/HA/CL, G1–G6 y prohibiciones pertinentes; invariantes y decisiones aplicables, incluidas D016, D020 y D037–D039.

El [registro normativo](../../tests/fixtures/h5-019/normative-sources.json) conserva fuentes y hashes, los 26 literales AC y 187 asignaciones de Tasks §6 relacionadas con las capacidades H5. **187 expresa trazabilidad documental, no pruebas aprobadas.** El [protocolo previo](expected-TSK-H5-019.md) quedó sellado antes de ejecutar; el [complemento I01–I03](protocol-TSK-H5-019-additional.md) define previamente los suplementos actuales. Ningún esperado se deriva del resultado observado.

## Dependencias y capacidades

La [matriz de las 19 dependencias](dependencies-TSK-H5-019.md) y su [registro con hashes](../../tests/fixtures/h5-019/dependencies.json) separan estado literal, capacidad, identidad histórica, pruebas, compatibilidad y pendientes. H4-024 aporta operación y economía integradas. H5-001–018 aportan Task; avisos D016; comunicaciones y derivados; trabajo persistido; fronteras/eventos; proyecciones; evaluaciones de cierre; cierre conjunto/reapertura; y diagnóstico protegido. H0–H3 se enlazan mediante sus informes de salida y suites de regresión.

Las fichas H5-011/H5-013/H5-015 conservan estados anteriores. Se registra la discrepancia frente a la base COMPLETED indicada por el director y sus sucesores técnicos publicados; las capacidades se contrastan mediante código, manifiestos y auditorías. No se modifica Tasks ni se acepta una dependencia por su casilla. Los SHAs históricos disponibles se verifican como commits ancestros; los candidatos ensayados sin commit se identifican por manifiestos propios.

C01 protege lectura, finalidad y procedencia; C02 evalúa reglas desde hechos actuales; C03 confirma hecho, historia, resultado e intención juntos; C04 conserva original y revisión por alcance; C05 distingue intención, intento y resultado; C06 evalúa y reevalúa sin arrastre. T08 y T09 conservan aprobación, reserva, intento e incertidumbre; T10 conserva las dimensiones y fundamentos del cierre. Los 106 archivos de producto y 68 migraciones permanecen intactos.

## Matriz de las cuatro familias

La [matriz H5-019](matrix-TSK-H5-019.md) contiene los 26 criterios asignados, responsables, reglas, implementación, evidencia original, casos actuales y limitaciones. El [registro por criterio](../../tests/fixtures/h5-019/criteria-results.json) proporciona los localizadores íntegros.

| Familia | AC revisados | SATISFACTORIA local | FALLIDA | BLOQUEADA | Fuera de alcance, NO EJECUTADA |
|---|---:|---:|---:|---:|---:|
| PT-08 | 8 | 8 | 0 | 0 | 0 |
| PT-09 | 5 | 5 | 0 | 0 | 0 |
| PT-10 | 4 | 4 | 0 | 0 | 0 |
| PT-12 | 9 | 8 | 0 | 0 | 1: AC-073 |
| Total | 26 | 25 | 0 | 0 | 1 |

Los 25 resultados satisfactorios acreditan exclusivamente el tramo local. **Ninguna familia se declara íntegramente acreditada.** Sus verificaciones H6 permanecen NO EJECUTADAS. AC-073 requiere restauración y conciliación H6-015; los controles preventivos de incertidumbre y objetos son parciales y no sustituyen ese escenario.

Las negativas verifican rechazo, conservación de historia y ausencia de efectos indebidos según los casos originales y los suplementos. Las referencias documentales sirven de procedencia; los resultados proceden de logs completos. Los nombres genéricos repetidos se identifican por fase y ordinal, sin inventar una fuente única.

## Pruebas nuevas de esta ejecución

| Ejecución | Resultado observado | Evidencia en `tests/fixtures/h5-019/` |
|---|---|---|
| Regresión completa recibida de sexta | **2.945/2.945 PASS**, 196 archivos y 15 fases disjuntas; cero fallos, cancelaciones u omisiones. Postcontrol íntegro. | `01-complete.status.json`, `01-phases.json`, 30 logs de fase, inventario de copia y preservación de réplica. |
| Integración adicional sobre cadena 68 | **3/3 PASS**: incertidumbre sin retry; invalidación económica con historia y expediente independiente; recepción Calendar y proyecciones sin mutación canónica. | `03-integrated.status.json`, stdout/stderr. |
| Instalación limpia congelada | `pnpm install --frozen-lockfile --ignore-scripts`, exit 0; lockfile intacto y `node_modules` nuevo. | `g04-frozen.*`. |
| Typecheck, lint y build | Todos exit 0. Lint aplica las fronteras arquitectónicas existentes. | `g04-typecheck.*`, `g04-lint.*`, `g04-build.*`. |
| Auditoría de dependencias | `pnpm audit --prod --json`, exit 0; cero vulnerabilidades en esta captura. | `g04-audit.*`. |
| Unitarias | **208/208 PASS**. | `g04-unit.*`. |
| Health independiente | **1/1 PASS**, SQL aislado local; no acredita scheduler Hosted. | `g04-health.*`. |
| V-MIG/V-DAT de cadena 68 | **2/2 PASS**: fresh68 y upgrade67 poblado; fallo DDL, rollback, recuperación de cuerpos y reaplicación; datos, ACL, owners, RLS/FORCE conservados; 20 intentos directos denegados. | `g04-migration.*`. |
| Temporalidad adicional | **14/14 PASS**, cronología y guardas conservadas. | `g04-temporal.*`. |

[Resultados y comandos exactos](../../tests/fixtures/h5-019/results.json). Cada captura conserva entorno, timestamps, inputs SHA-256, stdout/stderr gzip y exit. Entorno: Node 24.21.0, pnpm 11.19.0, PostgreSQL 17.11 y Europe/Madrid; Storage oficial fijado al commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e`. Solo loopback y datos sintéticos. La descarga/auditoría técnica de paquetes no opera sobre servicios de negocio.

Los 3 suplementos, 2 casos de migración, 14 temporales, 208 unitarias y health 1 se informan separados de los 2.945. Las suites históricas conservan sus versiones fijadas: **no se afirma que los 2.945 casos instalen todos la cadena 68**. Los suplementos actuales y V-MIG68 comprueban convivencia con el producto vigente.

La primera serie g02 terminó con nueve puertas exit 0 y un postcontrol FALLIDO por incluir un log propio en actualización paralela. Se conserva exit 1, fuente y logs. La serie g04 repite las nueve puertas con un snapshot correctamente delimitado y postcontrol satisfactorio. Un SyntaxError del generador documental se corrigió sin afectar producto o pruebas; su fuente anterior permanece recuperable. [Registro de defectos](defects-TSK-H5-019.md).

## Evidencia histórica reutilizada

La [verificación de sexta](../../tests/fixtures/h5-019/inherited-audit-verification.json) comprueba su sello, fuentes y resultados. Se reextraen sus 2.945 casos históricos y la nueva regresión reproduce el mismo multiconjunto de nombres. Las tres transiciones documentales aprobadas posteriores a sexta se contrastan con sus preimágenes; no se exige al Tasks actual conservar un hash anterior autorizado a cambiar.

No se repiten en H5-019 el contraste diferencial original/G de 116 casos, la reconstrucción diferencial de los 303 fallos ni la V-MIG66 extra de dos casos: son antecedentes de sexta con identidad verificada. Los 71 reproductores protegidos están incluidos en la selección completa, sin sumar una nueva focal independiente de 71.

Se mantienen las 27 exclusiones justificadas: 24 predecesores con derivada, dos instrumentos históricamente excesivos aclarados y una V-MIG66 adicional de sexta. Los dos instrumentos excluidos no se declaran PASS actual. H5-009 conserva dos logs no recuperados y su sustitución autorizada, así como las 69 diferencias históricas de tablas y R67/R030. No se oculta ni repara retroactivamente esa limitación.

## Reproducción y preservación

Comandos principales ejecutados desde la raíz:

```text
python3 scripts/capture-h5-019.py 01-complete node scripts/test-h5-019-complete.mjs 01
python3 scripts/capture-h5-019.py 02-gates python3 scripts/test-h5-019-gates.py g02
python3 scripts/capture-h5-019.py 03-integrated node scripts/test-postgres.mjs postgres-h5-019-integrated.test.ts
python3 scripts/capture-h5-019.py 04-gates-repeat python3 scripts/test-h5-019-gates.py g04
python3 scripts/consolidate-h5-019.py sources
python3 scripts/consolidate-h5-019.py dependencies
python3 scripts/consolidate-h5-019.py results
python3 scripts/consolidate-h5-019.py report
python3 scripts/verify-h5-019.py
```

El verificador final es de solo lectura. Las capturas rechazan sobrescribir etiquetas. Para repetir pruebas, crear una copia con índice Git independiente y etiquetas nuevas de captura/fases/gates. Conservar el sello y los inputs originales; no ejecutar generadores sobre los outputs existentes. El runner completo copia bytes verificados y retira la réplica solo después de superar el postcontrol.

No cambia ningún archivo publicado: producto, migraciones, normas, contratos, decisiones, expected congelados, pruebas, health, permisos y dependencias permanecen exactos. Los cinco dictámenes FAIL de H5-018 y sus sellos, inventarios y reproductores se preservan; también los FAIL de H5-012/014/016 y los originales propios. Los límites temporales auxiliares G siguen vigentes: otros actos necesitan cronología explícita coherente. Los snapshots de pureza de negocio no confunden la actualización legítima de actividad humana con una mutación de negocio.

## Pendientes y propuesta de aceptación

**DM-PENDING-005 OPEN.** Se conservan los pendientes de Tasks §7 y Plan §12: PLAN-PENDING-003 y PLAN-AUTH-001–006 globales; ARCH-PENDING-001/002; DM-PENDING-002/006; BR-PENDING-001/012/013/014/015/019/020/021/022/033/034/035, con sus bloqueos localizados. Los pendientes resueltos mantienen su resolución. No se inventan políticas, tarifas, capacidades, vigencias, fianzas, costes ni parámetros de avisos, retry, pausa o continuidad.

Se distingue implementación local, integración simulada mediante dobles y funciones dependientes de configuración futura. Hosted no está acreditado; Production no está validada; H6, sus E2E y sus verificaciones de acceso, recuperación, restauración, migración, concurrencia y privacidad no se ejecutan aquí. No se acreditan pagos, entregas externas ni recuperación de copias reales. No se fijan RPO/RTO, coste o periodicidad.

Se propone una auditoría independiente sobre el inventario y sello exactos y, después, la decisión expresa del director sobre H5-019 y el cierre de H5. **STOP al entregar.** No se inicia H6 ni se hace commit, push, merge, rebase, despliegue o modificación remota.
