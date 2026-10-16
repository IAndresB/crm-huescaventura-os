# TSK-H5-015 — Candidato local y evidencias

**READY FOR INDEPENDENT REVIEW — 2026-10-16.** Implementación y verificación del autor exclusivamente local/aislada, con datos sintéticos. Sin defectos materiales conocidos dentro del alcance probado. No equivale a auditoría independiente, aceptación, publicación ni finalización de H5-016. STOP tras esta entrega.

## Base, autorización y fuentes

Base solicitada y verificada después de `git fetch origin`: `ff0ad6c6e505914f31eb15d56725179c9f065426`. HEAD, main y origin/main iguales, divergencia 0/0, índice y árbol inicialmente limpios. La autorización de esta tarea permite implementar H5-015 y verificarla en aislamiento; no autoriza commit/push/despliegue, Hosted/Production ni datos reales.

[Matriz normativa](matrix-TSK-H5-015.md): J01–J11 y las 33 filas asignadas por Tasks §6. Fuentes principales: Plan §§7.2–7.3/9–10 y T10; SPEC-FR-CLOSE-003/004, SPEC-FR-CONC-002; BR-CLOSE-002, BR-INC-002; DM-INV-041/042; SM-CL-03/04/05; AC-046/059/060/061/062. Se revisaron H5-013/H5-014, sus correctivos y la migración62. La documentación aprobada prevalece sobre cualquier antecedente.

## Resultado funcional y decisiones

`H5013ClosureAdapter.close` incorpora el acto explícito de cierre conjunto, integrado en la proyección de la Booking canónica. No hay un segundo evaluador: usa `closure_inputs`, `closure_basis` y `closure_assess` de H5-013. Comprueba las tres dimensiones vigentes y vuelve a evaluar sus fundamentos dentro de la transacción, bajo la raíz Booking. Además aplica la guarda conjunta de críticas de SM-CL-04/BR-INC-002; su justificación no dispensa requisitos económicos.

La migración nueva63 añade `b06_joint_closures` y `b06_closure_invalidations`. El cierre conserva estado contractual `Cerrada / Histórico`, Booking, revisiones dimensionales, fundamentos, actor, instante declarado, instante de registro, evidencia, motivo y referencia. El historial es inmutable. Evaluación histórica, `currentStatus`/`applicable`, `jointClosure.current` y evidencia del cierre son datos distintos. Ganada, Finalizada, cobro, factura o resolución aislada no ejecutan este comando.

Una modificación material registra invalidación duradera de la evaluación afectada y retira la vigencia conjunta, sin borrar el cierre. Las invalidaciones no desaparecen si una corrección restaura después el mismo fundamento. `reopen` exige evaluación previamente resuelta y fundamento material invalidado, evidencia vinculada y actor autorizado; añade una nueva evaluación Pendiente mediante el kernel existente. Reabrir, evaluar de nuevo y cerrar después son actos separados. No modifica obligaciones, ejecución, aceptación, documentos ni contratos económicos.

Replay exacto devuelve el resultado previo. Otra operación sobre cierre vigente se rechaza con `CLOSURE_ALREADY_CLOSED:E2`; revisión/material desactualizado, con E2. Reapertura sin fundamento devuelve `CLOSURE_REOPEN_UNFOUNDED:E3`; repetirla con nueva identidad cuando ya está Pendiente devuelve `CLOSURE_NOT_RESOLVED:E3`. Reutilizar identidad con otro actor, Booking o contenido devuelve conflicto E2. No se recomienda reintento ciego de conflictos materiales.

## Concurrencia y atomicidad

El cierre usa `booking_preparation_lock(bookingId)`, la raíz ya aprobada; las escrituras relevantes ya participan mediante `booking_preparation_writer` y `closure_writer`. Se conserva su resolución de raíces y orden, incluidos fondos compartidos. No se añade bloqueo global. La migración instala invalidación diferida sobre las mismas **36 tablas**: al final de la unidad observa sus fundamentos completos, conservando los bloqueos BEFORE hasta commit. El catálogo íntegro de tablas, funciones, propietarios y atributos está en el log23.

La comprobación y persistencia del cierre forman una sola operación. F1/F2 se vuelven a validar al final. Los fallos al insertar el cierre, registrar la operación o ejecutar triggers diferidos revierten todo; también revierten conjuntamente el cambio causante y su invalidación. Los ensayos verifican estado persistido, historia, operación ausente tras aborto y reintento posterior.

Se ejecutaron **25 casos nuevos con concurrencia real**, usando varias conexiones PostgreSQL y observaciones de `pg_locks`/bloqueadores:

| Intercalaciones | Casos | Resultado probado |
|---|---:|---|
| Incident, documento requerido, fianza, revisión de pago, economía propia, Refund y obligación; cierre primero/escritor primero | 14 | Cierre previo queda histórico tras cambio, o el intento con fundamentos obsoletos se rechaza; no cierre vigente inválido. |
| Factura nueva, factura corregida y aplicación real de cambio de servicio; ambos órdenes | 6 | Raíz compartida observada y ausencia de cierre indebido; Booking externa con dimensiones pendientes. |
| Dos cierres con la misma operación | 1 | Un efecto y replay. |
| Cierre/reapertura, ambos órdenes | 2 | Conflicto de material/estado compatible con el orden; historia preservada. |
| Dos cierres incompatibles de una Booking | 1 | Un único cierre persistido. |
| Misma identidad de operación en dos Bookings | 1 | La segunda raíz progresa mientras la primera espera; conflicto E2 y rollback del perdedor. |

También se comprueba lectura pública de una Booking independiente mientras otra raíz espera. No se observaron deadlocks en estas intercalaciones. No es una medición de carga ni una prueba de todas las combinaciones posibles de escritores.

## Resultados y trazabilidad de ejecuciones

Todos los logs están en [tests/fixtures/h5-015](../../tests/fixtures/h5-015/). Se almacenan comprimidos sin pérdida; `log-integrity.json` contiene SHA-256 y tamaño de los bytes originales y del gzip. `gzip -dc archivo.log.gz` recupera exactamente el original, incluidos FAIL y diagnósticos esperados. No se han limpiado errores ni retocado salidas.

| Verificación | Resultado | Evidencia / inputs |
|---|---|---|
| Focal final H5-015 | **41/41 PASS**, cero omitidas | 23-final-focal.log.gz; 14 funcionales, 24 concurrencia, 1 identidad entre raíces, 2 migración/seguridad. Inputs finales453. |
| H5-013/H5-014 sobre63 | **66/66 PASS** | 24-evaluators-on63.log.gz; script dedicado copia cuatro tests y cambia solo el import del harness; originales y assertions conservados, hashes registrados. Verificación del autor, no H5-016. |
| Unitarias finales | **197/197 PASS** | 25-final-unit.log.gz. |
| Typecheck / lint finales | **PASS / PASS** | 26/27. Lint es el control de boundaries configurado por el repositorio. |
| PostgreSQL completo anterior | **2700/2716 PASS; 16 FAIL** | 13-postgres-complete.log.gz y 13-executed-inputs.json. Los 2678 casos históricos H0–H5-014 pasaron. Los 16 FAIL son 2 fixtures de obligación y 14 fallos de preparación por puerto compartido en los tests nuevos. |
| PostgreSQL consolidado por alcance | **2719 casos únicos PASS** | 2678 históricos de log13 +41 nuevos finales de log23. Los 66 de log24 son regresión adicional sobre63, no se suman como casos únicos. **No se afirma una ejecución completa limpia de2719 sobre el candidato final.** |
| Instalación reproducible | **PASS** | 12-install.log.gz; copia local independiente con `pnpm install --frozen-lockfile`. |
| Health independiente | **1/1 PASS** | 18-health.log.gz; separado del recuento de regresión. |
| Build | **PASS** | 19-build.log.gz; código de aplicación/configuración/lockfile idénticos al final. |
| Dependencias | **0 vulnerabilidades** | 17-audit.json producción; 28-audit-all.json incluye desarrollo. Sin cambios de dependencias. |
| Advisors de base aislada | **PASS; results=[]** | log23; Supabase CLI2.119.0, `db advisors --type all --fail-on error`. |
| Preservación | **PASS** | preservation.json: 62 migraciones históricas, 42 expected congelados, 36008 archivos de evidencias históricos, sin diferencias de blob ni modo ejecutable. |
| Formato e índice | **PASS** | final-verification.json; diff del conjunto completo mediante índice temporal, sin stage en el índice real. |

El completo13 utilizó el candidato anterior450; sus fallos se preservan y explican en [defectos](defects-TSK-H5-015.md). Después se corrigieron fixtures/puerto y la clasificación de unicidad en63, y se añadieron casos. Las suites históricas conservan sus cadenas hasta62; por eso se repitieron específicamente las cuatro suites de evaluadores sobre63 y toda la focal final. No se repitieron las 2678 pruebas históricas sin cambios en sus inputs relevantes. Health, instalación y build mantienen validez porque sus fuentes/dependencias no cambiaron; se distinguen de las ejecuciones posteriores25–27.

## Seguridad, migración y conservación

Fresh hasta63 probado por los fixtures focales. Upgrade desde62 poblada: **172 tablas y292 funciones anteriores** comparadas; todas las filas anteriores conservadas. Solo cambian los cuerpos de `closure_apply` y `closure_read_core`; propietario, ACL, configuración y atributo SECURITY DEFINER anteriores permanecen iguales. Se inyecta fallo antes del commit de la migración, se verifica rollback de catálogo/datos y se aplica de nuevo correctamente. No se propone borrar historia como mecanismo de downgrade.

Las dos tablas nuevas tienen RLS y FORCE RLS, integridad referencial e inmutabilidad. Runtime, HA, anon y authenticated carecen de acceso directo a sus datos; el acceso público pasa por las funciones autorizadas. Los propietarios de las funciones de cierre son NOLOGIN, NOSUPERUSER y NOBYPASSRLS; `search_path=pg_catalog,pg_temp`. Funciones privadas sin EXECUTE público; solo el límite API necesario se concede a runtime. Se ensayan identidad inexistente, contexto no autorizado, evidencia ajena/inexistente, escritura desde contexto de lectura, actor deshabilitado, acceso directo y modificación retroactiva.

La evidencia de invalidación conserva tabla y registro causante, operación/actor/evidencia disponibles en la fuente, fundamentos anterior/actual e instante. Las pruebas comprueban explícitamente ese enlace para Incident. Las validaciones de scope/sesión/F1/F2 previas se mantienen y se ejercitan adicionalmente en la regresión de evaluadores. No se debilita seguridad para pasar fixtures.

## Defectos resueltos y límites

**F01:** la primera versión no retiraba vigencia ante una crítica global con `material:false`; se añadió la guarda conjunta a la invalidación operacional. **F02:** colisión concurrente de operationId entre Bookings devolvía error genérico; se traduce únicamente la unicidad de identidad a E2, conservando rollback. FAIL originales, SQL anteriores y correctivos están conservados; ambas reproducciones pasan dentro de las41 finales. H01–H05 documentan incidencias del entorno/fixtures/tipado sin alterar expected.

Límites expresos: los seis casos de factura/cambio de servicio parten de Booking externa pendiente; no acreditan una venta externa integral cerrada. La cancelación y ausencia de inferencia se apoyan en el kernel/regresión existente; no se añade aquí un recorrido integral nuevo de cancelación y cierre. Los recorridos E2E-01/04/07 y H6 siguen pendientes en su alcance. No se ha probado Hosted/Production, carga real ni datos reales. No hay auditoría independiente realizada en esta tarea.

## Manifiesto, inventario y reproducción

Manifiesto de inputs finales: [candidate-inputs.json](../../tests/fixtures/h5-015/candidate-inputs.json), **453 archivos**. SHA-256: `6694767055ab2d0bfeb3cdefb95d4ab161352a90cd8a16cf396c4faa47b8f30a`. Verificados byte a byte en el workspace y en la copia aislada utilizada para23–27. Incluye código, configuración, scripts, tests y migraciones; los originales fixture permanecen en la base y en la copia, verificados por separado.

[candidate-inventory.json](../../tests/fixtures/h5-015/candidate-inventory.json) enumera cada archivo modificado/nuevo, tamaño, modo y SHA-256, incluidos documentación y evidencias. Excluye únicamente su propio hash para evitar autorreferencia. [git-final.txt](../../tests/fixtures/h5-015/git-final.txt) recoge refs, divergencia, índice real y status completo. Los artefactos de cierre documental no alteran los453 inputs probados.

Inventario funcional: dominio y adapter existentes; migración63; harness histórico acotado hasta62; cuatro suites nuevas; tres helpers nuevos; script de regresión sobre63; matriz/defectos/este informe; actualización de estado/Tasks; recibos, originales FAIL y manifiestos de esta tarea. El inventario JSON es la lista exacta, no esta agrupación.

Entorno: Node24.21.0, pnpm11.19.0, PostgreSQL17 nativo y Storage aislado del runner del repositorio. `validation-location.json` identifica la copia local preservada; no se atribuye el resultado solo al SHA base. Desde una copia con los archivos de inventario y los inputs verificados:

```sh
pnpm install --frozen-lockfile
export POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin
node scripts/test-postgres.mjs postgres-h5-015.test.ts postgres-h5-015-concurrency.test.ts postgres-h5-015-migration.test.ts postgres-h5-015-idempotency.test.ts
node scripts/test-h5-015-regression.mjs
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm audit --json
# Ejecución completa opcional para reproducción independiente:
node scripts/test-postgres.mjs
```

Los puertos59535–59538 y59545 deben estar libres; el runner prepara Storage sintético. Los tests no deben lanzarse directamente omitiendo ese runner. No requieren credenciales ni endpoints reales de negocio. El test de advisors usa la CLI fijada y conexión loopback a su base temporal.

## Dictamen y siguiente límite

H5-015 queda **IN PROGRESS, candidato READY FOR INDEPENDENT REVIEW**. Base sin cambios, candidato sin commit y sin stage en el índice real. H5 global continúa IN PROGRESS. H5-016 **NOT STARTED**: se recomienda, bajo autorización posterior, contrastar independientemente normativa, raíces de escritura, invalidaciones, idempotencia, permisos y los límites de cobertura sobre este inventario exacto. No se inicia ni prepara su auditoría. Sin commit, push, deploy, Hosted/Production ni datos reales. STOP.
