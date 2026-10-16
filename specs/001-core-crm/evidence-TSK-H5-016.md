# TSK-H5-016 — Auditoría técnica del candidato H5-015

**Dictamen final: PASS del candidato corregido.** Candidato original: **FAIL** por F01. Regresión completa limpia del candidato corregido: **2756/2756 PASS**, sin fallos, cancelaciones ni casos omitidos; proceso terminado con exit0. Exclusivamente local/aislado, datos sintéticos, sin commit/push/publicación/despliegue. No acredita Hosted/Production ni H6.

## Identidad y método independiente

Preflight de solo lectura antes de crear evidencias: rama main; HEAD = main = origin/main = `ff0ad6c6e505914f31eb15d56725179c9f065426`; divergencia0/0; índice vacío. Se compararon todos los hashes y el conjunto exacto de archivos: **58 archivos (6 modificados,52 nuevos),453 inputs**, sin diferencias ni cambios ajenos.

Manifiesto original: SHA-256 `6694767055ab2d0bfeb3cdefb95d4ab161352a90cd8a16cf396c4faa47b8f30a`. Inventario original: `322a3f2ce8105f076e8c32fd3ceed565dda5b11eb38da58365f00ad10fff4796`. [Preflight](../../tests/fixtures/h5-016/preflight.json) y snapshot `original-h5-015.tar.gz` conservan el candidato recibido.

Se leyó H5-016 aprobado, sus32 asignaciones de Tasks §6 y dependencias H4-024/H5-015, con jerarquía Constitución → fuentes de negocio → Spec/Plan/Tasks. Se escribió una [matriz independiente](matrix-TSK-H5-016.md) antes de las contrapruebas; el original se conserva en `matrix-initial.md`. Los resultados del implementador se trataron como hipótesis, no como oráculo. V-DOM, V-DAT, V-MIG, V-AT y las guardas/transiciones pertinentes se contrastaron con pruebas nuevas y PostgreSQL real. No se atribuye esta auditoría a un tercero externo ni a un despliegue.

## Hallazgo material y cambio mínimo

**F01: suficiencia ante fundamentos incompletos.** El candidato original aceptaba condiciones finales JSON null/vacías, aplicabilidad/resolución de fianza incompletas y modificación solicitada sin partes. Seis contrapruebas negativas fallaron. Una reproducción adicional sobre el SQL63 original demuestra dos cierres conjuntos indebidamente persistidos, con `terms = null` de JSON y `{}`.

La corrupción del estado se introduce explícitamente con rol de ensayo; después se invocan adapters ordinarios. No se presenta como una vía de edición histórica disponible al usuario. El defecto descubierto es que el evaluador autoriza suficiencia con datos incompletos. Los permisos directos de usuario siguen denegándola.

El correctivo modifica **solo el evaluador compartido existente** desde la migración63 no publicada: forma y contenido mínimo de términos ya exigidos por H2; partes no vacías; aplicabilidad de fianza explícita y resolución estructurada. No cambia reglas de cálculo, Refund, fianza, cancelación ni contratos aprobados. No se modifica la migración62 ni se crea un evaluador paralelo.

El test de upgrade H5-015 actualiza su lista explícita de cuerpos cambiados: `closure_apply`, `closure_read_core` y ahora `closure_assess`. No cambia un expected congelado ni oculta diferencias de catálogo. Se añaden tres suites independientes con37 casos. [Hallazgos, originales y correctivos](defects-TSK-H5-016.md) distinguen F01 de los errores de preparación del verificador.

## Cierre, reapertura y fuentes

La ruta pública de cierre exige decisión explícita, contexto F1/F2 y evidencia vinculada. Bajo la raíz Booking comprueba revisiones/material, tres evaluaciones actualmente aplicables, reevalúa con H5-013 y aplica la guarda adicional de críticas. La evidencia del cierre identifica los fundamentos realmente leídos; no basta una evaluación histórica. No hay invocación automática desde Ganada, Finalizada, pago, factura, Task o Incident.

Se mantienen separados evaluación histórica, vigencia actual, cierre persistido e invalidación. La evidencia posterior afecta solo sus dimensiones; no borra el cierre anterior ni reactiva automáticamente el cierre al corregir datos. La reapertura fundada crea Pendiente, seguida de nueva evaluación y eventual cierre explícito. Un snapshot independiente de ocho familias confirma que reabrir no modifica Booking/servicios, pagos, facturas, Refund, fianza, Incident ni requisitos. Actor, evidencia, referencias e instantes permanecen en la historia; el instante declarado se distingue de `recorded_at` de base.

La [auditoría de invalidación](invalidation-TSK-H5-016.md) deriva46 tablas leídas:31 con invalidación y15 de identidad/origen, más cinco puntos complementarios. Verifica mutabilidad real, resolutores, INSERT/UPDATE, prohibición de DELETE/reasignación ordinaria, fuentes compartidas y cambios no materiales. No toma el número36 como prueba de cobertura. El catálogo y la procedencia de cada clasificación se conservan en JSON.

## Concurrencia real y atomicidad

**13 casos nuevos**, además de las25 carreras de H5-015 reejecutadas en la focal final. Se usan sesiones independientes del administrador autorizado y conexiones PostgreSQL, no mocks de locks. El contrato actual de un administrador no se sustituye por actores ficticios con permisos ampliados.

| Escenario nuevo | Intercalación y comprobación |
|---|---|
| Pago, fianza, crítica, documento, obligación, Refund | Detener cierre después de calcular `closure_inputs`; el escritor espera en Booking. Cierre primero y cambio después dejan historial y retiran vigencia. |
| Factura corregida, servicio aplicado, cancelación | Misma pausa después de leer; se prueba exclusión y rechazo de cierre sobre Booking pendiente. No se atribuye una venta externa integral resuelta. |
| Dos cambios de la misma identidad Payment | Dos comandos con misma revisión, dos sesiones y espera real en payment-root: uno confirma, otro reconoce conflicto. Reasignar ese pago a Booking distinta se rechaza; no se inventa distribución entre reservas. |
| Reapertura frente a nueva crítica | Reapertura ya leyó fundamento invalidado; nuevo cambio espera. Economía queda Pendiente y la crítica afecta operación, conservando el cierre histórico. |
| Dos cierres incompatibles | El primero ya leyó fundamentos; el segundo espera y recibe conflicto. Solo un cierre persistido. |
| Bookings independientes | Una segunda Booking cierra mientras la primera está detenida después de leer. No hay bloqueo global añadido. |

Los logs incluyen PID, claves advisory, grant y bloqueadores. Se comprueban estados/historia finales y no solo éxito de promesas. No se observaron deadlocks en estos ensayos. Los órdenes inversos están cubiertos además por la focal H5-015; no se confunden con las13 intercalaciones nuevas.

Se verifican fallo al escribir y al commit, rollback de cambio+invalidación y replay. La contraprueba independiente de revalidación final fuerza fallo F2 **después del INSERT del cierre**; una secuencia de instrumentación acredita que se alcanzó ese punto, y las tablas de negocio/operación quedan iguales al estado anterior. No se confunde rechazo de admisión con rollback tardío. El reintento limpio confirma una sola vez.

## Seguridad y migración

V-DAT independiente: firmas alteradas, actor/scope falsificados, comando cambiado después de firmar, reutilización en otra transacción, actor revocado y replay tras revocación; denegación fuera de UI. La reactivación exige nueva sesión: no se revive una sesión revocada para hacer pasar el ensayo.

Se revisan tablas, restricciones, índices y funciones. Las tablas nuevas tienen RLS/FORCE RLS, FK de Booking/evaluación/operación/actor/evidencia e inmutabilidad. Runtime no recibe DML directo. Propietarios de funciones de cierre: NOLOGIN, NOSUPERUSER y NOBYPASSRLS; search_path fijo y ACL restringidas. Los UPDATE/DELETE/reasignaciones ensayados se rechazan también con el executor restringido. Las consultas elevadas conservan scope y autorización. El grant UPDATE histórico de catalog_items no se amplía ni se expone como un comando de reasignación.

V-MIG: fresh hasta63; upgrade62 con las tres evaluaciones resueltas; conservación exacta de la historia anterior; fallo deliberado a mitad de migración, rollback de catálogo/datos y retry; cierre posterior válido. La comprobación adicional heredada contrasta172 tablas/292 funciones anteriores y confirma que solo cambian los tres cuerpos declarados, manteniendo atributos/ACL. Se inspeccionan las restricciones y tres índices de las dos tablas nuevas. Advisors sobre loopback: `results=[]`.

La versión63 original nunca se publica ni se considera migración histórica. Las bases de ensayo se recrean con el SQL candidato; no se promete un downgrade que borre historia. Las migraciones1–62, expected congelados y evidencias históricas se preservan byte a byte.

## Ejecuciones y resultados exactos

Evidencia bajo [tests/fixtures/h5-016](../../tests/fixtures/h5-016/). Los logs finales se conservan en gzip sin pérdida, con hashes de bytes originales y comprimidos en `log-integrity.json`. FAIL no se borra ni se reescribe.

| Ejecución | Resultado | Identidad y alcance |
|---|---|---|
| Original confirmado02 | 13/19 PASS;6 FAIL materiales | SQL63 recibido; negativos de suficiencia. |
| Original E2E11 | FAIL esperado de contraprueba | SQL63 archivado: dos cierres incorrectos efectivamente persistidos. |
| Correctivo04 | 19/19 PASS | Retest previo a ampliación de suites; no es completo final. |
| Final focal12 | **78/78 PASS** | 41 H5-015 +37 H5-016, manifiesto456. |
| Evaluadores sobre63, log13 | **66/66 PASS** | Cuatro suites originales; solo se sustituye import de harness en copias temporales. Assertions y originales conservados. |
| Completo final20 | **2756/2756 PASS, 0 FAIL, exit0** | Todos los archivos de integración, mismos456 inputs; resultado final separado de logs anidados de contrapruebas históricas. |
| Unitarias15 | **197/197 PASS** | Candidato final. |
| Health19 | **1/1 PASS** | Independiente del recuento PostgreSQL. |
| Instalación05 | **PASS** | Copia independiente, `pnpm install --frozen-lockfile`. |
| Typecheck14 / lint16 / build17 | **PASS / PASS / PASS** | Sin cambios posteriores de producto/tests a esos inputs. |
| Audit18 | **0 vulnerabilidades** | Dependencias de producción y desarrollo; sin cambios de dependencias. |
| Formato/preservación final | **PASS, exit0; cero diferencias protegidas** | Conjunto completo e índice temporal; índice real vacío. |

Las66 pruebas sobre63 son regresión adicional, no66 casos nuevos a sumar al completo. Los37 de H5-016 sí son nuevos y están incluidos una vez en la regresión completa:2678 históricos +41 H5-015 +37 H5-016 =2756. El completo final20 es una sola ejecución limpia, no un consolidado de retests. Los fallos instrumentales01/06/07/08/09 se conservan y explican; no se presentan como PASS ni como resultados del manifiesto final.

Los16 fallos del completo anterior H5-015 se investigaron con hashes: dos fixtures de obligación carecían de scope/scopeId/due, y14 casos compartían puerto59525 con H5-014-races. El fichero reconstruido y el original comprimido coinciden exactamente con sus hashes ejecutados. El candidato usa59545 y comandos completos. `legacy16-analysis.json` conserva esta comprobación. El resultado2700/2716 anterior permanece como ejecución completa con fallos; no se corrige retrospectivamente.

## Candidato final y reproducción

Base inalterada: `ff0ad6c6e505914f31eb15d56725179c9f065426`.

[Manifiesto final456](../../tests/fixtures/h5-016/final-inputs.json), SHA-256 **`f72596dafa448cbba1d3ddb1525aab57097a4992f40bc0712da2eb444008f30d`**. Migración63 corregida: **`a58cb35c5a6fad3c78580377218bc6e8839bdeb0ac62cbe68cfd3919e38043b0`**. Cada input se verifica en workspace y copia aislada. [Inventario final](../../tests/fixtures/h5-016/candidate-inventory.json) identifica archivos, bytes, modos y hashes, incluyendo auditoría/evidencia; excluye solo su propio hash. El candidato completo contiene **112 archivos:6 modificados respecto a la base y106 nuevos**, incluidos los58 originales y54 añadidos en H5-016. Frente al candidato recibido solo cambian migración63, su test de upgrade y tres documentos de estado. El SHA-256 del inventario completo se comunica fuera de ese inventario para evitar autorreferencia. [Verificación final](../../tests/fixtures/h5-016/final-verification.json) y [estado Git final](../../tests/fixtures/h5-016/git-final.txt) registran los controles y la identidad.

`validation-location.json` identifica la copia con Git e instalación física independiente. Node24.21.0, pnpm11.19.0, PostgreSQL17 y Storage sintético del runner oficial. No hay acceso a datos o cuentas de negocio reales.

```sh
pnpm install --frozen-lockfile
export POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin
node scripts/test-postgres.mjs
node scripts/test-h5-015-regression.mjs
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm audit --json
node --test tests/operations/supabase-health.test.mjs
```

Para focal: seleccionar los cuatro archivos postgres-h5-015 y los tres postgres-h5-016 en el runner. Los puertos59560–59563 se reservan para estas nuevas suites;59565 solo se usó en la reproducción original archivada. No se ejecutan tests directamente omitiendo Storage. La fuente de la reproducción11 está comprimida fuera de la búsqueda automática de suites para no ejecutar deliberadamente el producto defectuoso en la regresión final.

## Límites y recomendación

La cobertura de factura/cambio de servicio/cancelación concurrentes comprueba raíz, lecturas, rechazo y estado final en Bookings pendientes; no representa un recorrido completo de venta externa o cancelación total ya liquidada. Los recorridos integrales H6, proveedores reales, Hosted/Production y carga de producción permanecen fuera de esta tarea. No se reclama prueba exhaustiva de todas las mutaciones que un administrador de base con privilegios extraordinarios podría fabricar.

Recomendación final: **aceptación técnica del candidato corregido en local/aislado**. Puede proponerse su publicación controlada en una instrucción posterior, referida al inventario exacto; la aceptación humana y la publicación no se ejecutan en esta auditoría. No aceptar ni publicar el candidato original. Toda aceptación se debe referir exclusivamente al manifiesto e inventario corregidos. La recomendación de publicación no ejecuta ni autoriza commit/push/deploy. H5-017 y H6 no se inician. STOP tras el dictamen y evidencias.
