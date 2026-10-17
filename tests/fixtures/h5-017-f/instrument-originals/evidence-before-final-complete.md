# CRM HUESCAVENTURA OS — H5-017/H5-018 — Correctivo F

Fecha: 2026-10-17, Europe/Madrid. Informe técnico A–Q. Autorización: encargo F conservado en `tests/fixtures/h5-017-f/request.txt`. Solo datos sintéticos y PostgreSQL local/aislado. El candidato E y las cuatro auditorías anteriores conservan sus resultados históricos.

## A. Dictamen y estado

**PENDIENTE DE CIERRE: retest completo tras corregir instrumentación.** La primera ejecución completa `14` terminó 2.916 PASS/4 FAIL. Se preserva íntegra; dos fallos de E-I05 corresponden a una precondición histórica de fixture incorrecta y dos al subcaso temporal H4-023 y su padre. El SQL final permanece idéntico al focal 78/78. El dictamen final se fijará tras los retests y la ejecución completa V2.

H5-017 y H5-018 permanecen **IN PROGRESS**. DM-PENDING-005 permanece **OPEN**. La quinta auditoría independiente está pendiente. No se acredita H6-015/H6-017. No se ha hecho commit, push ni despliegue, ni se han utilizado datos o servicios de negocio reales. La entrega cierra este correctivo con STOP.

## B. Identidad exacta del candidato

- Base aprobada y recibida: `9649a2773530ea8a43237b4e1f2034f80e34136f`; HEAD = main = origin/main, divergencia 0/0, índice vacío en preflight.
- Predecesor: **37.758 archivos de E + 116 de cuarta auditoría = 37.874 protegidos**.
- Inventario E, SHA-256 del contenido: `0e0c08b8b70da6d12c2480eb8217cdf1e5df9b640c6dd1244f153b76a3be8191`.
- Inventario cuarta auditoría: `b921a9a6f4cf2e48723112267e8b6aa589411a69833aee3fea6bdb395d701e58`.
- Inventario recibido F, contenido: `aee6754dd4d42b891e94fb93a1225e4af95b731b2c9fff635d5ad73194f22061`.
- Producto nuevo: `supabase/migrations/20261017004525_h5_diagnostic_version_provenance_replay.sql`, migración **68**, SHA-256 `69f8bdddb1acd5fbef1d2154ae81d16a6ecc1a0f5ed34783a99c11dbb83e9563`.
- Expected F congelado antes de implementar: `574dffd7080d0d36a54e3b13217b8448a665155af81cf2500688d3b32c622710`.

Los hashes del SQL, fixture, hook, runner y tres tests están en `candidate-inputs-final.json`; `candidate-inputs-final-v2.json` añade los instrumentos corregidos conservando los anteriores y el SQL exacto. El delta final frente al estado recibido se identifica por el inventario y sello descritos en O. Esta es una entrega local no confirmada en Git; el commit base por sí solo no contiene F. Los cuatro archivos ya modificados al recibir el encargo (`docs/NEXT-STEPS.md`, `docs/PROJECT-STATUS.md`, `specs/001-core-crm/tasks.md`, `src/server/composition.ts`) conservan sus bytes recibidos. No se usa el estado documental histórico D como resultado actual F.

## C. Causa raíz H5-018-4-F01

La proyección canónica verificaba el contexto vigente de una ejecución y usaba luego definitionId/executionId para incorporar todas sus versiones, aprobaciones, operaciones e historia. En A→B→A, el permiso vigente de A se extendía a hechos originales de B. La validación de observaciones nuevas utilizaba ese conjunto excesivo y aceptaba la operación B como canónica de A.

La identidad correcta de cada hecho incluye dueño B08, operación, definición y versión, contexto tipado y fuente canónica original. La existencia de una ejecución actual autorizada no cambia la procedencia de sus versiones. El [mapa transversal previo](analysis-TSK-H5-017-F.md) identifica fuentes y reglas de consulta/escritura/repetición; el [registro de defectos](defects-TSK-H5-017-F.md) conserva reproducción y evolución.

## D. Causa raíz H5-018-4-F02

El escritor validaba operación/ejecución contra el contexto vigente antes de reconocer una observationId ya persistida. Tras A→B, una observación histórica autorizada desde A quedaba consultable e íntegra, pero su repetición idéntica era tratada como escritura nueva y rechazada.

La causa de código es diferente de F01: orden de reconocimiento y reautorización del resultado previo frente a uniones que pierden procedencia. La corrección comparte la distinción entre contexto actual e histórico, sin introducir una política nueva de idempotencia.

## E. Correcciones implementadas

La migración 68 sustituye únicamente los cuerpos de estas tres funciones existentes:

1. `crm_private.diagnostic_canonical_nodes(text,text,uuid)`: cada definición/aprobación/intento se filtra por su versión, contexto y evidencia autorizada. Las operaciones B08 se acreditan con B07 history, command result, propietario y snapshot exacto. Las partes se limitan al material vigente y sus referencias de intento a la versión compatible. La tarea original solo aparece si pertenece a la raíz autorizada.
2. `crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)`: conserva autenticación y validación inicial; bloquea observationId, compara todos los campos persistidos y reautoriza replay exacto por `diagnostic_nodes`. La rama de identidad inexistente sigue exigiendo las relaciones actuales. Ambas conservan F1/F2 finales después de las esperas.
3. `crm_api.h5_diagnostic_read(bytea,bytea,bytea,bytea,bytea)`: mantiene la consulta histórica explícita por operationId desde una ejecución actualmente autorizada. Comprueba fuente original y actual y marca `historical`, `definitionVersion`, `originContextKind`, `originContextId`. No incorpora esos hechos al conjunto canónico de escritura ni a la consulta general de la nueva raíz; tampoco mueve la petición original.

La tercera función responde a una regresión propia detectada por R01 intacto: el primer filtro F era excesivo para esa consulta explícita. F-P04/P05 acreditan la diferencia entre consultar historia y atribuirla al contexto actual. Se conserva el FAIL intermedio y su SQL. `diagnostic_nodes` permanece intacta en su versión 67, junto con su política de recuperación histórica y autorización de observaciones.

No se añade API, tabla, permiso, política, variable de entorno ni comportamiento de negocio nuevo. No se modifican normas ni ciclos de ejecución. La migración no reescribe datos, ni siquiera observaciones incorrectas que E hubiera admitido: V-MIG acredita su conservación física y que lectura/replay ahora las deniegan.

## F. Siete reproductores originales

`02-before` ejecutó los archivos originales sobre E/67 y reprodujo exactamente **10 PASS/7 FAIL**. `10-all-focal` ejecutó las aserciones originales funcionales sobre 68 sin editarlas.

| Reproductor independiente | E/67, captura 02 | F final, captura 10 |
|---|---|---|
| Q02 A→B→A, raíz booking | FAIL: incorpora B | PASS: B excluido |
| Q02 A→B→A, servicio desde reserva | FAIL: incorpora B | PASS: B excluido |
| Q02 A→B→A, servicio desde oportunidad | FAIL: incorpora B | PASS: B excluido |
| Q02 observación nueva A con operación histórica B | FAIL: acepta canónica | PASS: `DIAGNOSTIC_DENIED`, sin fila |
| Q04 replay operación+ejecución tras revisión y sesión nueva | FAIL: denegado | PASS: mismo id, `replayed:true` |
| Q04 replay solo operación | FAIL: denegado | PASS: mismo id, `replayed:true` |
| Q04 replay solo ejecución | FAIL: denegado | PASS: mismo id, `replayed:true` |

Los UUID de cada preparación sintética, entradas, salidas y comparación de originales están en los stdout comprimidos; sus hashes y comandos en los `.status.json`. Se conservan los FAIL tanto de la cuarta auditoría como de esta reproducción. El hook sustituye únicamente fixtures de base mediante parejas exactas importador/especificador; `hook-provenance.json` acredita las fuentes originales intactas.

## G. Contrapruebas adicionales F

**19 casos propios: 5 de procedencia, 12 de repetición y 2 de migración; todos PASS en 10.**

| Grupo | Casos | Resultado acreditado |
|---|---:|---|
| F-P01 | 1 | A→B→A→C→A conserva versiones A 1/3/5; B/C siguen consultables y repetibles en sus recorridos propios. |
| F-P02 | 1 | Dos intentos históricos permanecen; el de B y partes retiradas no se atribuyen al contexto A vigente. |
| F-P03 | 1 | UUID de tarea de raíz anterior excluido en la actual; consulta original preservada. |
| F-P04/P05 | 2 | Historia explícita marcada, fuera de la consulta general; reautorización original y vigente; nueva escritura denegada. |
| F-R01 | 4 | Modos operación, ejecución, ambas, ninguna: dos llamadas iniciales, una fila; seis replays concurrentes; siete conflictos rechazados; cero efectos colaterales. |
| F-R02 | 1 | Revocación/restauración de sesión, actor original exigido; D025 impide fabricar un segundo administrador válido. |
| F-R03 | 2 | Propietario canónico tardío incompatible, en misma o distinta raíz: no convertir intención persistida en asociación confirmada. |
| F-R04 | 3 | Retirada/restauración sintética de fuente operación/ejecución/evento: replay denegado/restablecido, original intacto. |
| F-R05 | 2 | Revisión mientras el escritor espera observationId: replay exacto permitido; nueva identidad contra el contexto obsoleto denegada. Dos sesiones legítimas y orden comprobado por bloqueo real. |
| F-MIG | 2 | Base 67 poblada/rollback/restore/reapply e instalación limpia 68/roles posteriores/12 accesos denegados. |

Las retiradas de enlace mediante SQL privilegiado son perturbaciones de fuentes sintéticas, no un supuesto flujo B07 unlink. Los casos Q04 conservados sí ejercitan revokeOne/revokeAll por contratos B01 reales sobre datos sintéticos.

## H. Regresiones anteriores

Los **44 casos focales previos** pasan íntegros en `10-all-focal`: F01 aislamiento, F02 referencias, F03 incertidumbre E4; H5-018-2-F01 temporal (R01/R02); H5-018-3-F01 propietario y H5-018-3-F02 padres (T01–T07); variantes E-I06, E-S01 y E-S02 (esta última con tres modos). Las comprobaciones incluyen mismo UUID entre tipos, confirmación canónica tardía incompatible, referencias inexistentes, aprobaciones retiradas, secreto/canarios, acceso directo y revocación.

`09-original-regressions` conserva su resultado anterior **43 PASS/1 FAIL R01**. No se presenta como PASS ni se suma con el retest. La corrección de R01 y los dos casos adicionales P04/P05 preceden al SQL final y a la congelación de inputs de la ejecución completa.

## I. PostgreSQL completo y separación de conjuntos

**PENDIENTE DE CIERRE COMPLETO V2.** La ejecución `14` conserva 192 archivos, 14 fases y 2.920 casos: 2.916 PASS/4 FAIL, sin cancelados/omitidos. La nueva selección `24` mantiene los mismos archivos y casos, distribuidos en 15 fases disjuntas al aislar H4-023. Su resultado no se infiere del focal ni del primer completo.

La selección es 2.884 casos anteriores + 17 de cuarta auditoría + 19 F. Los 78 focales están contenidos en esos 2.920 y **no se suman**. Los dos Q06 de cuarta auditoría continúan anclados a 67; V-MIG propio F prueba 68. Los demás fixtures históricos conservan la migración correspondiente a su objeto: no se afirma que todos los 2.920 instalen 68.

El runner trabaja sobre réplica temporal de bytes verificados, con índice y referencias propios. `24-copied-inputs.json.gz` registra entradas; `24-selection.json` y `24-phases.json`, selección/fases/resultados. La primera ejecución conserva sus equivalentes `14-*`. Las evidencias históricas que algunos tests regeneran quedan capturadas bajo F desde la réplica, sin sobrescribir las protegidas del workspace. También se captura cualquier actualización de caché CLI en esa réplica. Los registros `*-replica-preservation.json` prueban preservación y retirada de las copias. El verificador reconstruye nombres y conteos desde logs, excluye 54 nombres históricos incrustados en un subprocess H2 y comprueba que coinciden con la unión de los tres conjuntos.

La descripción libre `reason` de la selección conserva el conteo intermedio «17 additional F cases» del runner. `selection-clarification.json` corrige expresamente ese texto: los tres archivos F seleccionados contienen **19** casos finales, incluidos P04/P05. La selección ejecutable y los inputs congelados permanecen intactos; el conteo válido se reconstruye de los nombres y resultados reales, no de esa descripción.

V2 corrige también esa descripción. Su hook selecciona un fixture mixto exclusivamente para `postgres-h5-017-e-identity.test.ts`: E-I01–I04 usan F/68; E-I05 conserva preparación D/66 y aplicación 67, tal como prescribe el test protegido. El fixture F normal sigue usando 67 como previo de 68. No se editan tests, aserciones o fixtures anteriores. La batería H4-023 conserva su plazo original de 2.000 ms y se ejecuta en una fase separada; no cambia producto de H4. `complete-instrument-correction.json` registra causa y alcance.

Retests: `21-h4-isolated` **34/34 PASS**, incluido progreso independiente dentro del plazo original; `22-e-mixed-retest` **7/7 PASS**, incluidas las dos preparaciones D/66. `23-typecheck` PASS. Estas ejecuciones validan el ajuste del instrumento; no sustituyen el completo V2 ni se suman a él.

## J. Unitarias, health y comprobaciones auxiliares

| Captura | Comando | Resultado |
|---|---|---|
| 11-typecheck | `pnpm typecheck` | PASS, código final |
| 23-typecheck | `pnpm typecheck` | PASS tras añadir fixture mixto V2; producto sin cambios |
| 12-frozen | `pnpm install --frozen-lockfile --ignore-scripts` | PASS, instalación congelada sin scripts de instalación |
| 15-unit | `pnpm test` | 208/208 PASS |
| 16-health | `node --test tests/operations/supabase-health.test.mjs` | 1/1 PASS independiente |
| 17-lint | `pnpm lint` | PASS |
| 18-build | `pnpm build` | PASS |
| 19-audit | `pnpm audit --prod --json` | PASS, 0 vulnerabilidades en dependencias de producción |

Unitarias y health no forman parte de la cifra PostgreSQL. Los estados iniciales de typecheck y la instrumentación de concurrencia se conservan y explican en el registro de defectos. Cada captura fija entradas, comando, tiempos, salida y cambios durante su ejecución; no se reutiliza una salida antigua para acreditar el código definitivo.

## K. V-DOM, V-DAT y V-MIG

La [matriz F](matrix-TSK-H5-017-F.md) contrasta directamente las 13 asignaciones de Tasks §6 y separa V-DOM/V-DAT/V-NEG/V-AT/V-MIG/V-EVI. La normativa consultada incluye Tasks §2.2/H5-017/H5-018/§6, Plan §§7.1/8/11.2 y B01/B07/B08/B10/C01/C04, HIST001/003/006, ERR001/002, AC070/072/081, NFR009/010/014, SEC, DM-INV047, BR-HIST001–005, SM-FORB27/29 y Constitución. Los hashes de fuentes y expected están congelados; ninguna modificación normativa.

V-MIG compara **175 tablas, 487 relaciones, 305 funciones, 332 políticas y 1.037 constraints**. El único delta permitido es `prosrc` de las tres funciones identificadas. Datos exactos conservados, sin variación de ACL, propietarios, search_path, SECURITY DEFINER, RLS/FORCE RLS, constraints u otros objetos. La prueba conserva una observación legítima y otra incorrecta admitida por 67: 68 recupera la primera y bloquea lectura/replay de la segunda sin borrarla.

Se ejecutan DDL abortado con rollback íntegro, actualización poblada, recuperación de cuerpos 67 y reaplicación 68. La instalación limpia añade roles API después de las migraciones y prueba 12/12 accesos directos denegados; acceso ordinario a DDL denegado. Advisors de Supabase sobre loopback devuelven `results:[]`.

## L. Seguridad y confidencialidad

F1/F2 permanecen al inicio y al final de lectura/escritura. El bloqueo de identidad no evita la reautorización posterior. Un replay exige coincidencia completa de actor, ámbito, raíz y contenido; una identidad ausente no hereda autorización histórica. La propiedad de operación se contrasta con el dueño B08 real, no con igualdad de UUID entre tipos.

La consulta general excluye versiones de otros contextos y la tarea ajena; la consulta histórica explícita muestra solo nodos mínimos y procedencia marcada. No copia cuerpos originales de evidencia/evento, material de aprobación, secretos ni URLs. Los originales A14/A15 y Q04, junto con los casos F, cubren esos límites locales. No se atribuye cobertura de multiadministrador/multitenant o producción que no se haya ensayado.

## M. Migraciones y entorno

Cadena recibida 1–67 intacta; única adición de producto 68, creada con el mecanismo de migración de Supabase. PostgreSQL 17 local, CLI Supabase fijada en 2.119.0; no se actualiza la dependencia. La documentación oficial consultada de funciones y changelog no impone cambios al caso nativo PostgreSQL local. No se usó un proyecto Supabase de negocio. Las comprobaciones de contratos, efectos y servicios son sintéticas/aisladas.

El rollback se limita a lo realmente ensayado: DDL abortado y restauración de los cuerpos anteriores dentro de la base sintética. No se publica una migración inversa de producción ni se propone borrar datos.

## N. Preservación histórica y fallos conservados

El preflight verificó el sello E, cuarta auditoría, inventarios anteriores, expected y FAIL. La preservación actual vuelve a comprobar **37.874 archivos recibidos**, incluidos tipos, modos, tamaños y SHA-256; 456 inputs H5-016, con 455 idénticos y la transición de `composition.ts` previamente autorizada; migraciones 1–67. Las versiones documentales anteriores autorizadas se recuperan de los archivos históricos ya recibidos. No se borra evidencia ni se convierte ningún dictamen histórico FAIL en PASS.

Hay un incidente de integridad resuelto y explícito: la comprobación automática de versión de la CLI escribió `v2.121.0` en la caché protegida `supabase/.temp/cli-latest`. La preservación detectó el cambio; se restauraron los ocho bytes recibidos `v2.120.0`, SHA `2f99ec07bad208b0108748390c2fe80fb0a91b1784a8f7bf1d303efda7deeaee`. `cli-cache-restoration.json` conserva el evento. El delta final es cero; no se afirma que jamás se escribiera esa caché durante el proceso. Las llamadas CLI posteriores del completo corren en la réplica.

Capturas preservadas: 01 fallos de setup; 02 siete FAIL originales; 03 retest original; 04 un defecto derivado y tres problemas de instrumento; 05 typecheck propio; 06 dos problemas de concurrencia del instrumento; 07 tipos; 08 retest propio; 09 regresión R01; 10 focal final; 11/12 y 14–19 verificaciones finales. SQL/tests intermedios propios conservados por hash en `instrument-originals`. El primer verificador de preservación omitió de su allowlist una ruta F; V2 corrige exclusivamente esa ruta, con ambos instrumentos y explicación conservados.

La ejecución completa `14` conserva sus cuatro FAIL. Se añaden 21 H4 aislado, 22 fixture mixto E, 23 typecheck y 24 completo V2, sin sumar los retests al total de casos. Los tres documentos F de informe/matriz/defectos se archivan antes de 24 para poder finalizar después sus resultados y conservar el texto exacto copiado durante la ejecución. Ningún input de producto, prueba o instrumento cambia durante el completo V2 ni después de él.

## O. Inventario, hashes y sello

**PENDIENTE DE SELLADO FINAL.** Los metadatos finales se crean después de verificar la ejecución completa, documentación y preservación. Rutas previstas:

- `tests/fixtures/h5-017-f/current-case-inventory.json.gz`: nombres y resultados actuales por fase, sin duplicar casos incrustados.
- `tests/fixtures/h5-017-f/current-coverage.json` y `final-verification.json`: reconstrucción de capturas y conteos.
- `tests/fixtures/h5-017-f/delta-inventory.json`: archivos nuevos exactos, modificados/eliminados recibidos vacíos, migración nueva y regla de exclusión de metadatos.
- `tests/fixtures/h5-017-f/candidate-inventory.json.gz`: todas las rutas inventariables con tipo, modo, tamaño y SHA-256, incluido el delta.
- `tests/fixtures/h5-017-f/candidate-seal.json`: hashes de contenido y comprimido del inventario, delta, migración y bases, conteos y estado STOP.

El inventario sigue el mismo perímetro reproducible recibido: archivos seguidos y no ignorados obtenidos de Git; no incluye `.git`, dependencias, compilados ni datos efímeros ignorados. Excluye de su propio hash solo el inventario y el sello para evitar autorreferencia; el delta declara además su propia exclusión. Esos metadatos se incluyen en el conteo final y el verificador comprueba el conjunto exacto, sin archivos extra o faltantes.

Creación append-only con `scripts/seal-h5-017-f.py`; verificación posterior de solo lectura con `scripts/verify-h5-017-f-seal.py`. JSON ordenado UTF-8 y gzip mtime=0. El hash final se comunica fuera del propio inventario para evitar un ciclo. No se alteran archivos después de sellar.

## P. Defectos materiales pendientes

F01, F02, el derivado de tarea F-P03 y la regresión R01 tienen retest focal final PASS. **El cierre interno global permanece pendiente de la regresión completa y su verificación.** Los problemas de instrumento están resueltos y conservados. La aprobación independiente sigue pendiente y no se deduce de los PASS del implementador.

## Q. Superficies para quinta auditoría independiente

1. Procedencia exacta definición/versión/contexto B07/B08; A→B→A y revisiones sucesivas; padres acreditados, intentos, partes y tarea original.
2. Separación entre consulta general, petición histórica original y consulta explícita por operación desde la ejecución vigente. Comprobar marcadores, permiso de ambas fuentes y ausencia de autoridad de escritura derivada.
3. Identidad completa del replay; actor/scope/contexto y todos los campos; confirmación canónica tardía; autorización retirada/restaurada; diferencia entre identidad existente e inexistente.
4. Concurrencia con bloqueo real de observationId y dos sesiones legítimas; F1/F2 después de las esperas; filas/historia/efectos sin duplicación.
5. Conservación de las correcciones anteriores y variantes E, especialmente R01, T01–T07, E-I06/E-S01/E-S02 y Q04 real de B01.
6. V-MIG 68 desde 67 poblada e instalación limpia; tres cuerpos exactos; datos heredados incorrectos conservados pero inaccesibles; permisos efectivos y catálogo sin ampliación.
7. Integridad de los 37.874 archivos recibidos, FAIL y expected, transición autorizada H5-016, inputs intermedios archivados y separación de conteos actuales/históricos/solapados.

Estas superficies delimitan la revisión futura solicitada; no se inicia ni se prepara una nueva ejecución de auditoría. STOP al sellar y verificar F. No H5-019 ni H6.
