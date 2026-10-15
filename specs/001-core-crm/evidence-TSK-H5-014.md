# TSK-H5-014 — Auditoría técnica independiente

Fecha: 15–16 de octubre de 2026, Europe/Madrid. Alcance exclusivamente local y aislado, datos sintéticos. **Dictamen: original FAIL; candidato corregido PASS.** Recomiendo aceptar técnicamente el candidato corregido de H5-013 y cerrar H5-014 en este alcance. H5-013 queda pendiente de aceptación humana/publicación; no se ha hecho commit, push ni despliegue. STOP después de esta entrega.

## Identidad y preflight

`HEAD = main = origin/main = b8f4fc9db033de54bcdc01c5f7554647d02f11aa`, confirmado después de fetch; divergencia 0/0 e índice vacío. Inventario original: 36.589 archivos, 4 archivos previos modificados y 75 nuevos. No se alteró el candidato durante el preflight.

El archivo `strict-candidate-inputs.json` original tiene el SHA256 declarado **7e5ae6a7df16d71ac7e9a8702bec8e51c04d7d9f5cb6225a076fb1c283005f06** y sus 431 entradas coincidían. El inventario auxiliar tenía 79 entradas; 78 y todos los modos coincidían, pero su entrada autorreferente estaba desactualizada (F02). No se confunde ese defecto con el manifiesto estricto, cuya integridad sí se verificó.

Expected H5-013 conservado: SHA256 `d4437ce800a9abd9a9ac41586baece3996ff4d8831b996b6ad1b720d45b8da64`. Las 61 migraciones anteriores y todas las evidencias previas permanecen intactas. El original de migración62 y los cuatro archivos previos se conservan comprimidos; el inventario de preflight incluye todos los hashes. [Preflight](../../tests/fixtures/h5-014/preflight.json.gz), [contraste del inventario](../../tests/fixtures/h5-014/inventory-crosscheck.json).

## Método y matriz

Se leyeron Constitución, README, decisiones, estado y próximos pasos, SPEC-FR-CLOSE-001/002, AC-058/059/060, SM §15/G1–G6, BR-CLOSE-001/002, DM-INV-041/042, Plan §§7.1–7.3/9 y ficha/protocolos H5-014. Se extrajeron las **15 filas asignadas** desde Tasks §6; el esperado independiente se escribió antes de las nuevas pruebas y está sellado. Los fixtures existentes solo preparan datos, evidencias y sesiones; sus pruebas no definen el resultado esperado.

[Matriz normativa y 50 resultados por caso](matrix-TSK-H5-014.md), [expected independiente](expected-TSK-H5-014.md), [resultados estructurados](../../tests/fixtures/h5-014/observed-independent-cases.json).

Los ensayos nuevos incluyen Ganada/Finalizada sin evaluación automática; comercial y economía resueltas con operación pendiente; prestación finalizada y requisito nuevo; modificación solicitada; factura vinculada sin pago; Refund parcial e intento no ejecutado; incidente económico posterior y cierre de incidente sin resolver la evaluación; justificación vacía; seis fundamentos económicos pendientes simultáneamente y datos incompletos/null. Los focales del implementador se reejecutan como regresión separada y añaden fianza parcialmente retenida con devolución pendiente, pago al proveedor sin factura, coste interno desconocido, Task cerrada sin resolver el documento, cancelación aplicada y excepción crítica sin acreditar hechos faltantes.

## Defectos y correctivos

**F01: un dato ausente podía acreditarse como satisfecho.** Doce contrapruebas de kernel fallaron en el original; una decimotercera reprodujo el problema con una revisión documental persistida incoherente leída a través del adapter público. Causa: SQL NULL en predicados de `NOT EXISTS`. Se corrigieron seis comparaciones en `closure_assess` mediante comprobaciones explícitas de suficiencia. Solo cambia producto en migración62. No se ha demostrado una vía ordinaria para crear los datos incoherentes; la inyección se hizo exclusivamente con autoridad de ensayo sobre PostgreSQL efímero. Severidad: consistencia, no bypass demostrado de autenticación. Trece reproducciones pasan tras el correctivo.

**F02: hash autorreferente desactualizado del inventario auxiliar.** Se conserva el original. El inventario sucesor omite su propia entrada y se entrega con hash externo; incluye el hash real del inventario original. No se cambia ninguna evidencia protegida.

[Registro de defectos, originales y transiciones](defects-TSK-H5-014.md), [diff mínimo de producto](../../tests/fixtures/h5-014/corrective.diff). F01 y F02 **CLOSED local/aislado mediante candidato e inventario sucesores**, conservando el FAIL original.

## Seguridad, concurrencia y atomicidad

RLS y FORCE RLS activos en ambas tablas. Roles runtime/HA/anon/authenticated sin CRUD directo; propietarios y ejecutores sin LOGIN/SUPERUSER/BYPASSRLS; funciones con search_path fijo y sin EXECUTE público. Los casos nuevos intentan acceso directo, modificación/borrado, uso de evidencia de otra Booking, colisión de operationId, envelopes con MAC/actor/alcance/raíz/purpose alterados y replay entre transacciones. La regresión incluye actor inhabilitado y Booking de otro alcance. La lectura económica se limita al administrador autorizado de V1; no se acredita un futuro modelo multiusuario.

Se observaron PID, xid, advisory locks y bloqueadores en **14 intercalaciones nuevas**: factura, economía propia, requisito, incidente, modificación, Refund y fianza, con escritor primero y evaluación primero. Otra Booking progresa durante la espera. La raíz serializa la lectura y persistencia; si el escritor gana, la evaluación rechaza material obsoleto. Dos evaluaciones distintas con igual revisión producen un ganador y un conflicto. La regresión incluye replay concurrente exacto. Estas carreras usan dos sesiones del mismo Administrador, conforme a V1.

Fallos inyectados al escribir evaluación, al escribir recibo y durante COMMIT diferido dejan cero efecto/historia/recibo; reintentar produce una única operación y el replay reutiliza su resultado. Los rechazos no añaden historia. No se ha implementado cierre conjunto ni reapertura persistida de H5-015.

## Migración e integración

Cadena62 instalada en PostgreSQL17.11 efímero. Upgrade61 poblado, error antes de COMMIT, rollback y reintento verificados. El ensayo de catálogo preserva 170 tablas previas y los atributos de 284 funciones previas: 283 cuerpos idénticos; solo `booking_read` recibe la composición prevista, conservando OID/owner/ACL/config. Dos tablas nuevas, PK por operación y por Booking/revisión, FK a Booking/actor/evidencia, dimensión restringida, revisión positiva, operación única y referencias diferidas; historial inmutable. Advisors locales: cero resultados. El ensayo independiente adicional conserva una necesidad documental previa y la proyección Booking previa al upgrade.

Los snapshots de evaluación/recibo son historia derivada; no sustituyen los registros canónicos de documentos, pagos, Refund, fianza, modificación o prestación. Tipos, adapter y persistencia mantienen el contrato existente; el adapter autentica, firma y transacciona, y la suficiencia se decide en servidor. El fallo de datos incoherentes hallado en esa frontera queda cubierto por F01.

Los cuatro archivos previos modificados por el implementador eran `docs/NEXT-STEPS.md`, `docs/PROJECT-STATUS.md`, `specs/001-core-crm/tasks.md` y `tsconfig.json`. Los tres primeros documentaban su entrega; esta auditoría añade estado y enlaces propios. En tsconfig, `tests/fixtures` excluye copias archivadas sin importación; **324 archivos activos comprobados, cero omitidos** y tres fixtures históricos importados siguen incluidos por TypeScript. [Auditoría de tsconfig](../../tests/fixtures/h5-014/tsconfig-audit.json). No se cambia esa configuración.

## Verificación del candidato definitivo

| Verificación | Observado |
|---|---|
| V-DOM/V-DAT/V-AT/V-SM/V-NEG nuevos | 50/50 PASS, incluidos una sola vez en la regresión. |
| Focales H5-013 reejecutados | 28/28 PASS; separados de las contrapruebas independientes. |
| PostgreSQL completo y recuperación focal | **2678 casos únicos consolidados PASS =2600 previos +28 H5-013 +50 H5-014**. Segunda ejecución completa:2675 PASS/3 FAIL de entorno; retest íntegro de dos archivos afectados:46/46 PASS, incluidos los tres fallos. Cero skipped/cancelled. No se presenta como una ejecución completa limpia. |
| Unitarias | 197/197 PASS, fuera del total PostgreSQL. |
| Health aislado | 1/1 PASS, separado. |
| Typecheck y límites de imports | PASS. |
| Build estándar | PASS en copia física con los mismos 434 inputs. |
| V-MIG | Fresh62, upgrade61 poblado, rollback/retry, datos/catálogo/permisos y advisors PASS. |
| V-EVI | Matriz por caso/fila, logs, errores originales, manifiestos y preservación entregados. |
| Diff completo | PASS mediante índice temporal; índice real permanece vacío. |

[Log definitivo PostgreSQL](../../tests/fixtures/h5-014/postgres-final.log.gz), [recibo](../../tests/fixtures/h5-014/postgres-final.json). Node24.21.0, pnpm11.19.0, PostgreSQL17.11; Storage oficial local del runner existente; solo loopback y datos sintéticos. No se reutiliza una prueba anterior como acreditación del SQL corregido.

La primera regresión completa dio 2637/2678 y 41 FAIL porque la copia aislada inicialmente no disponía del historial Git exigido por los verificadores históricos. Se conserva el log; se añade una copia independiente de metadatos Git con lectura de objetos locales y se restauran tres evidencias generadas solo dentro de esa copia. La repetición completa sobre los mismos inputs da 2675/2678: tres verificadores históricos aún fallan porque el clone sin checkout tenía un índice vacío. Se inicializa únicamente ese índice mediante `git read-tree HEAD` y se repiten íntegramente los dos archivos afectados: 46/46 PASS. Los tres negativos se recuperan sin cambiar producto ni tests; el resultado consolidado cubre los 2678 casos únicos. No se ocultan las ejecuciones completas fallidas ni se afirma una tercera ejecución completa limpia. [Retest](../../tests/fixtures/h5-014/historical-retest.log.gz). También se conservan incidencias de transporte JSON del primer harness, conexión ocupada de la primera carrera, anotación TypeScript y symlink de Turbopack. Ninguna se oculta ni se cuenta como defecto funcional distinto de F01.

## Identidad final y límites

Manifiesto corregido, 434 inputs: **`1e96b60542c517660c9d0deb6394e1947e1bc6f450588848003425d31915c652`**. [Archivo verificable](../../tests/fixtures/h5-014/corrected-candidate-inputs.json). Migración62 corregida: **`b514b8c99409e2d71e9abe493df9bcf0c630541fb0899ec54d3d9ae6bc0d253e`**; original `c4ab8dfa226df3621da49b30d6684c4a117bf761099a20415bed16226eb1e178`. Expected H5-014: `1d56996f01277e8f4df57eb6714ae43f5351affd4d5be6d093cf71e7626d2c5c`. Los originales H5-013 permanecen referenciados a su candidato, nunca al sucesor.

La clasificación documental y la justificación de aplicabilidad siguen requiriendo una revisión humana explícita sustentada por evidencia; no se infiere su suficiencia semántica por texto libre. Se han probado las intercalaciones descritas, sin afirmar cobertura de todos los órdenes posibles. No hay riesgos materiales abiertos detectados dentro del alcance probado; esto no acredita Hosted/Production, datos reales, cierre conjunto, reapertura persistida ni integraciones futuras. DM-PENDING-005 y los demás pendientes globales se conservan.

Estado final Git: base y remoto sin cambios, 0/0; índice real vacío; candidato original más correctivo y evidencias de auditoría locales sin commit. El inventario sucesor y su recibo de preservación detallan cada archivo. **Recomendación: aceptar el candidato corregido local de H5-013 y cerrar la auditoría H5-014. Publicación no ejecutada. STOP.**
