# Defectos — TSK-H5-011

## H5-011-F01 — OPEN / MATERIAL — aislamiento incompatible con F1/F2

Estado: STOP de implementación local. Base `1346dd64ec2e9e804be23b17ea5f62f64515339c`; el producto probado es un delta sin commit, identificado por [tested-inputs.json](../../tests/fixtures/h5-011/implementation-20261014/tested-inputs.json). No se atribuyen estos resultados al SHA base como si contuviera el producto.

La nueva lectura de [h5-projection-adapter.ts](../../src/infrastructure/postgres/h5-projection-adapter.ts), línea 21, usa `isolation level repeatable read`. Las guardas existentes requieren `read committed`: F2 en la migración `202609260001_h0_m03_actor_session_access.sql`, línea 113, y F1 en `202609290001_h1_contextual_identities.sql`, línea 184. La ampliación de dispatch B07 en `202609300001_h1_evidence_communications.sql` conserva esos controles. No es un permiso faltante ni motivo para ampliar grants o debilitar guardas.

Reproducción focal con el entorno correcto: 2/6 PASS, cuatro FAIL de consultas legítimas con `PROJECTION_DENIED`. La instrumentación temporal fuera del repositorio registró SQLSTATE `42501`, `F2_DENIED` dentro de `crm_f2.admit`, antes de la lectura de negocio. El wrapper solo observó code/message/where y no cambió SQL, autoridades ni resultados; su salida es diagnóstico, no un PASS de producto. [Log original de la focal](../../tests/fixtures/h5-011/implementation-20261014/postgres-focal.log), [recibo](../../tests/fixtures/h5-011/implementation-20261014/postgres-focal.status.json), [diagnóstico](../../tests/fixtures/h5-011/implementation-20261014/diagnostic.log).

Impacto: reconstrucción interna, salidas comerciales y calendario legítimos no pasan admisión. La prueba de aislamiento de Bookings/sesión no alcanza su parte posterior al primer acceso. Las pruebas negativas y de migración poblada/rollback/retry observadas pasan; esto no valida las consultas positivas ni completa V-DAT/V-MIG globalmente.

Correctivo mínimo propuesto y NO APLICADO:

```diff
-  try{return await this.sql.begin("isolation level repeatable read",async tx=>{
+  try{return await this.sql.begin("isolation level read committed",async tx=>{
```

Solo una línea del adaptador nuevo; conservar F1/F2, locks/admisión/revalidación, expected, migración y pruebas. Tras autorización, repetir las focales con el runner oficial aislado y nueva evidencia; los FAIL originales permanecen. La causa detectada impide estas lecturas, pero corregirla no demuestra por adelantado ausencia de otros defectos posteriores.

Primer intento separado: invocación directa de node:test, sin preparar Storage heredado, terminó 0/6 y seis fallos de before hook `ISOLATED_STORAGE_REQUIRED`, sin alcanzar la migración/consulta nueva. [Resumen derivado](../../tests/fixtures/h5-011/implementation-20261014/direct-attempt-summary.json); no es un archivo stdout original. Se corrigió únicamente la invocación utilizando el runner existente; no se alteró producto o guardas por ese fallo de entorno.

STOP sin correctivo, H5-012 independiente, regresión global, build, staging, commit ni push. H5-011 no está COMPLETED. F09/F06–F08 y antecedentes históricos no se reabren.

## 2026-10-14 — Actualización autorizada de H5-011-F01

**Estado vigente: CORRECTIVO APLICADO; VERIFICACIÓN FOCAL INCOMPLETA; STOP.** El registro OPEN y la propuesta NO APLICADO anteriores se preservan como antecedente de la autorización posterior. No se asigna el estado CORRECTIVO VERIFICADO LOCALMENTE porque quedan dos FAIL focales; tampoco cierre formal de F01/H5-011 ni inicio de H5-012.

Se aplicó exclusivamente el reemplazo de `repeatable read` por `read committed` en la línea 21 del adaptador. [Diff exacto](../../tests/fixtures/h5-011/f01-corrective-20261014/authorized-change.diff), [inventario posterior](../../tests/fixtures/h5-011/f01-corrective-20261014/tested-inputs.json), SHA-256 del manifiesto `bd7cb2423e7b8100e96e32088b63f575ec370c34db4bbc7ff52157bcd44f5e0f`. HEAD/base local `1346dd64ec2e9e804be23b17ea5f62f64515339c`; base publicada `71906987f9b74241cc4583e51498759829cded73`. No atribución de pruebas al HEAD como si contuviera el correctivo.

[Resultado focal original preservado](../../tests/fixtures/h5-011/implementation-20261014/postgres-focal.log): 2/6 PASS, cuatro rechazos de admisión. [Resultado nuevo](../../tests/fixtures/h5-011/f01-corrective-20261014/postgres-focal.log): 4/6 PASS; reconstrucción C01 y aislamiento Booking/actor ahora pasan, salidas externas y calendario alcanzan datos y fallan en aserciones. La causa de aislamiento de F01 deja de impedir estas lecturas; esto no valida toda la funcionalidad. Dominio 11/11 PASS, typecheck/lint exit 0, focal negativa PASS, guardas F1/F2 intactas. [Resumen](../../tests/fixtures/h5-011/f01-corrective-20261014/results-summary.json), [evidencia detallada](evidence-TSK-H5-011.md).

### Hallazgo focal adicional: precio esperado de la prueba no corresponde al fixture

**Fuentes:** `tests/integration/postgres-h5-011.test.ts:27` exige `1000.01`; `tests/support/h2-acceptance-fixtures.ts:11` fija `finalPersonPrice: '100.01'` y 10 participantes en ambas modalidades. Normativa BR-PACK-003 (`docs/business-rules.md:301`), SPEC-FR-PROP-003/SEC-003 y expected congelado S08: presentar precio final por persona, participantes e incluidos por modalidad, sin reinterpretar economía interna. SQL nuevo líneas 54–58 lee `m.final_person_price`, sin cálculo nuevo.

**Diagnóstico acreditado:** [observación sintética limitada](../../tests/fixtures/h5-011/f01-corrective-20261014/assertion-diagnostic.log) registra precio canónico `100.01` y salida `finalPersonPrice: "100.01"` en las seis superficies externas. No hay base para exigir `1000.01`; tampoco para alterar el precio canónico o la presentación comercial para satisfacer la aserción.

**Impacto:** la focal comercial se detiene antes de sus controles posteriores de campos reservados, búsqueda e información interna. Estos controles no se declaran PASS. El error observado está en la aserción; no acredita un defecto económico del producto ni valida toda la salida comercial.

**Correctivo mínimo propuesto, NO APLICADO:** únicamente en la focal nueva, sustituir la búsqueda de la cadena `1000.01` por una comparación estructurada de precios por persona y participantes con las modalidades sintéticas fijadas en `f.f.content.modalities` (100.01 y 10 en este fixture), manteniendo los controles posteriores de exclusión, búsqueda y economía interna. Conservar fixture, expected, SQL y producto. No generar cantidades nuevas ni debilitar controles; requiere autorización expresa para cambiar la prueba y repetir focales.

### Hallazgo focal adicional: dependencia de posición no normativa en calendario

**Fuentes:** `tests/integration/postgres-h5-011.test.ts:35–37` compara `result.entries[0].reference` con `f.detail.services[0].id`; `tests/support/h2-booking-fixtures.ts:10–11` construye servicios en orden de modalidades con UUID aleatorios. SQL nuevo ordena los servicios por `v.service_id` (línea 109); no coincide necesariamente con el orden de construcción. SPEC-FR-COORD-008 y expected C01/C02 exigen referencias canónicas y alcance; no fijan esa posición como regla de negocio.

**Diagnóstico:** el log focal muestra dos UUID diferentes en esa comparación. La lectura de código explica el fallo por el orden de UUID frente al orden del fixture; la observación limitada posterior devuelve ambos IDs de servicio del Booking con fecha `2026-10-20`, origen `crm_private.modification_scope`, alcance e indicador no cancelado. En ese segundo fixture la primera posición coincide accidentalmente; no se trata como una repetición PASS ni se fuerza otra muestra. Inferencia de causa: aserción dependiente del orden aleatorio, no evidencia de mezcla de expedientes. El caso de Bookings independientes sí pasa su focal.

**Impacto:** resultado de la focal dependiente de los UUID generados y controles de fecha/cancelación posteriores al FAIL no alcanzados. No exige cambiar el orden del producto ni crear una regla normativa de desempate.

**Correctivo mínimo propuesto, NO APLICADO:** en la focal nueva, identificar los servicios por `reference` contra los IDs sintéticos del fixture y comprobar el conjunto completo de servicios y sus datos canónicos por identidad (Booking, fecha, no cancelado y procedencia), conservando los controles ya previstos. No exigir una primera posición no normativa. No modificar fixture, dominio, SQL ni expected. Requiere autorización expresa para corregir la prueba y repetir focales.

### STOP y preservación

No se aplican correctivos de pruebas ni otro cambio de producto en este bloque. Evidencias/FAIL anteriores intactos y ampliación documental sin sobrescritura, acreditada en [verificación final](../../tests/fixtures/h5-011/f01-corrective-20261014/final-verification.json). Índice vacío; sin commit ni push. H5-011 IN PROGRESS, H5-012 NOT STARTED. No build, regresión completa, health independiente ni integraciones externas. No se reabren antecedentes cerrados.

## 2026-10-14 — Corrección autorizada de aserciones: F01 OPEN con focales PASS

**Estado vigente: OPEN — CORRECTIVO VERIFICADO LOCALMENTE EN FOCALES; CIERRE FORMAL PENDIENTE.** H5-011 IN PROGRESS y H5-012 NOT STARTED. Se conservan como antecedentes íntegros las secciones previas, incluidos resultados 2/6 y 4/6, diagnósticos y sus estados entonces pendientes. No cierre formal ni aceptación global.

La autorización posterior permite corregir exclusivamente las dos aserciones defectuosas de `tests/integration/postgres-h5-011.test.ts`, sin producto/fixture/expected. [Diff exacto](../../tests/fixtures/h5-011/test-correctives-20261014/authorized-change.diff) y [preflight](../../tests/fixtures/h5-011/test-correctives-20261014/preflight-preservation.json). Normativa comprobada antes de editar: expected S02–S08, BR-PACK-003 y SPEC-FR-PROP-003/SEC-003 para precio/incluidos/minimización; expected C01/C02, §2 sin ordenación prefijada y SPEC-FR-COORD-008 para calendario/alcance. No exigencia de 1000,01 ni de primera posición; no contradicción material detectada en estas correcciones.

Precio: sustituida cadena 1000.01 por cardinalidad y comparación de las entradas comerciales con las modalidades canónicas del fixture, 100.01 por persona, 10 participantes e incluidos exactos. Conservadas las comprobaciones posteriores de contenido reservado, búsqueda e información económica interna. Calendario: sustituida primera posición por conjunto de IDs exacto, sin duplicados/servicios ajenos, comprobando cada servicio, Booking, revisión/referencia, fecha, schedule null sin hora inventada, no cancelado, source y phase null. Producto, fixtures, expected, SQL, F1/F2, permisos y criptografía sin cambios.

Nueva focal completa **6/6 PostgreSQL PASS**, **11/11 dominio PASS**, typecheck/lint exit 0. [Log PostgreSQL](../../tests/fixtures/h5-011/test-correctives-20261014/postgres-focal.log), [resultados individuales](../../tests/fixtures/h5-011/test-correctives-20261014/results-summary.json), [aserciones posteriores efectivamente alcanzadas](../../tests/fixtures/h5-011/test-correctives-20261014/executed-assertions.json), [evidencia detallada](evidence-TSK-H5-011.md). Los callbacks completos de ambas focales antes fallidas terminan PASS, sin instrumentación/skip ni eliminación de controles; las focales negativas y de actor inhabilitado también pasan. Sin nuevos fallos observados.

Árbol probado sin commit de producto: [tested-inputs.json](../../tests/fixtures/h5-011/test-correctives-20261014/tested-inputs.json), SHA-256 `6c9000f3b835860b7572061042fd5d09012d1b62006ce97a1f19f2d847341b75`; HEAD local `1346dd64ec2e9e804be23b17ea5f62f64515339c`, origin/main `71906987f9b74241cc4583e51498759829cded73`, divergencia 1/0, índice vacío. Pruebas atribuidas al inventario completo posterior, no al SHA base aislado. [Preservación final](../../tests/fixtures/h5-011/test-correctives-20261014/final-verification.json).

Este bloque acredita la corrección focal del rechazo original y de las dos aserciones posteriores; no los 41 casos completos, el escenario literal PACK 120/180, V-DAT/V-MIG global ni la revisión independiente. F01 se mantiene abierto hasta cierre formal con verificación suficiente. STOP tras entrega: sin build, regresión PostgreSQL completa, health independiente, H5-012, staging, commit, push o efectos externos. Expected congelado e históricos intactos.

## 2026-10-14 — Verificación integral interna: correctivos locales y STOP por F14

**H5-011 IN PROGRESS; H5-012 NOT STARTED.** Los antecedentes superiores y sus FAIL permanecen intactos. No cierre integral ni publicación. Árbol final sin commit: [inventario](../../tests/fixtures/h5-011/integral-20261014/tested-inputs.final.json), SHA-256 `de43fc2bfb73c3129f67dd897f1580e10aa239ba46254bc28bc507ba0b1f2a59`.

### F01 — CLOSED técnico local

El cambio read committed conserva F1/F2 y supera las consultas legítimas, las firmas auténticas y sus ataques por MAC/input modificado, actor/sesión inhabilitados, SQL directo y permisos/RLS en las20 pruebas nativas propias incluidas en la tanda final. Dominio194/194, build/typecheck/lint/health/audit PASS. Su rechazo original42501/F2_DENIED, los4 FAIL iniciales y los2 FAIL posteriores de aserción permanecen archivados. El FAIL global R06 es de una prueba/fixture H4 protegido sin relación con el aislamiento del adaptador. Cerrar F01 no cierra H5-011 ni H5-012.

### Correctivos ordinarios verificados dentro de H5-011

[Registro detallado F02–F13](../../tests/fixtures/h5-011/integral-20261014/defect-register.json): retirada de la extensión propia del runtime para preservar bytes históricos; preparación estable de dependencias de la copia; linaje de identidades; derivados B07; recibos B09; certeza del calendario/candidato/contribuciones; momentos de recibo y hecho; comparación de UUID; orden de instantes con desplazamientos; conservación de ACL y corrección del ensayo de código preexistente. Cambios de producto limitados a archivos nuevos H5-011; runtime histórico exacto. No alteraciones de funciones/roles/guardas/migraciones históricas ni expected.

Los logs coverage.initial (1/5 PASS), coverage.expanded-before (7/11 PASS), domain-expanded-before (9/10 PASS), domain-temporal-before (10/12 PASS) y los retests se conservan. La primera regresión1364/1416,52 fallos de carga por preparación de la copia, se conserva y no se trata como fallo de producto. Los20 nativos y23 dominios propios pasan en las suites finales, sin doble conteo.

### H5-011-F14 — OPEN / BLOQUEO DE REGRESIÓN — cronología del fixture H4 protegido

[Regresión final](../../tests/fixtures/h5-011/integral-20261014/postgres-complete.final.log):2492/2493 PASS, un FAIL en `tests/integration/postgres-h4-012-supplement.test.ts:22`, H4-012 R06 AC043. Error `MODIFICATION_EVIDENCE_REQUIRED:E3` en la primera evaluación; no alcanza las aserciones civiles ni las siguientes fases de ese caso.

Fuente exacta: R06 pasa `at:'2026-10-13T21:59:59+02:00'` a `m.command('evaluate',...)`. `tests/support/h4-modification-fixtures.ts:9–10` conserva ese override para el comando pero su attest llama a `f.proof(...)` sin trasladar q.at. `tests/support/h4-confirmation-fixtures.ts:7/18` fija `at = new Date().toISOString()` y usa ese mismo instante al crear la evidencia. Hoy14/10/2026 es posterior al13/10 del comando. `crm_private.payment_evidence`, migración `20261003093202_h3_customer_payment_reconciliation.sql:73–79`, exige `r.occurred_at <= at_time`; `modification_proof` y `modification_apply` mantienen esa guarda y rechazan E3. Causa por lectura de código y fecha actual, consistente con el error observado; no se atribuye a R67/R030 ni a H5-011 y no invalida el PASS histórico en su fecha.

Ambas rutas están congeladas por `tests/fixtures/h4-024/protected-base.json` y el inventario C12:

- Test R06: SHA-256 `3b51d33b5decdb5411a5fff02fbd5202d22879c2662e4eaa5309514fad682999`.
- Fixture modificación: SHA-256 `7739f5603d576a41855c0d1238f1f2535568e2dd34f4a8fd0f48d35fec8d75ed`.

**Correctivo mínimo propuesto, NO APLICADO:** en attest del fixture de modificación, conservar íntegro el comportamiento normal cuando q.at===f.at y, solo para el override histórico explícito, crear por el mismo contrato B07 la evidencia sintética revisada con occurredAt=q.at, claim/hash/coverage/actor iguales. No cambiar el producto ni la condición temporal. Requiere autorización literal de esa ruta y transición before/after exacta en la preservación protegida; los manifiestos históricos no deben reescribirse. No fijar reloj del Mac, preload de Date ni instrumentación para declarar PASS. Después: focal R06/H4-012 y consumidores temporales, contrapruebas de preservación y nueva regresión del árbol aprobado.

STOP conforme a la autorización actual: «Ante un defecto que requiera cambiar contratos protegidos, decisiones aprobadas o alcance funcional, STOP y presenta diagnóstico». No se ha modificado ninguna ruta H4 ni guarda.

### Auditor histórico: límite de alcance conservado

La primera invocación del auditor falló por el cache CLI generado, ya archivado y restituido. El retest del protocolo exacto rechaza `specs/001-core-crm/defects-TSK-H5-011.md` como `unlisted posterior path`: su lista cerrada pertenece al cierre H5-009/010. [Ambos logs y procedencia](../../tests/fixtures/h5-011/integral-20261014/historical-preservation.cache-retest.status.json). No se amplía el auditor, se cambia su sello ni se reabre F09/F06–F08. La preservación actual de bytes se registra separadamente; no se declara auditor histórico PASS sobre el árbol nuevo.

Otros pendientes de cobertura figuran en [matriz interna](matrix-TSK-H5-011.md). No41 PASS ni H5-012 ejecutada. Sin staging, commit, push, despliegue u operaciones reales.

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
