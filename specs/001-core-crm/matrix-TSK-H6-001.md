# H6-001 — Matriz de contraste local

**Tres asignaciones directas: AC-089, SPEC-NFR-001 y E2E-01. H6-001 IN PROGRESS; aceptación del director pendiente.** Expected previo: [IA01–IA30](expected-TSK-H6-001-independent.md). Esta matriz identifica evidencia ejecutada y sus límites; no cambia ninguna norma ni acredita globalmente tareas o AC compartidos.

## Recorrido integrado

Todos los casos siguientes son **PASS** en el intento del ejecutor `focal-2026-10-22T22-00-10-476Z` y en la repetición independiente del mismo source. **21 subcasos + contenedor = 22 tests**. `TRACE` es un registro de evidencia adicional dentro de P14, no otro test. No se suman las dos ejecuciones como 44 casos únicos.

| Caso | Fuente / relación | Esperado y observado | Límite |
|---|---|---|---|
| P01 | E2E-01; AC-004; IA01/02 | Contexto, contacto, grupo y Lead creados por contratos; Lead accesible ordinariamente. | La guarda de mínimos ausentes se contrasta en regresión; no organización ficticia innecesaria. |
| P02 | AC-007/011/012/016; T01/T02; IA04–06 | Lead enlaza Opportunity; dos versiones fijadas; aceptación verificable y Ganada; todavía cero Bookings. | No todas las alternativas/caducidades en esta misma venta. |
| N01 | AC-013/015/016; G1; IA05/21 | Ausencia de Acceptance y contexto de autenticación falsificado rechazan conversión; tablas de negocio intactas. | El contexto falso es contraprueba técnica; no usuario real. |
| P03 | AC-015/017/019; T03; IA07/08 | Una Booking, tres servicios y dos noches; rafting 10, cena 12, noches 12/10; replay reconoce resultado. | No listas nominales ni modificación en esta venta; regresión separada. |
| N02 | AC-016/023/058; IA06/11/15 | Ganada y fechas no confirman ni finalizan sin hechos. | No prueba todas las excepciones económicas. |
| P04 | AC-023/025; IA09 | Política ordinaria aprobada y base exacta 1.200,12; fecha de referencia impone 100 % inicial en este caso. | Umbrales 7/3 días y zona por regresión; sin regla nueva. |
| P05 | AC-025–028; T05; IA09/10/11 | Detectado conserva recepción nula; recibido conserva correspondencia cero; verificado aún sin asignación; asignación completa después; fondos sin críticos no confirman. | No salida bancaria ni uso externo en este recorrido. |
| N03 | AC-027/028; IA10/23 | Replay no mueve fondos; asignación extra de la misma porción se rechaza sin mutación. | Concurrencia y otro movimiento real de igual importe: regresión. |
| P06 | AC-023/024; IA11/12 | Cuatro confirmaciones internas con fuente, alcance y contribuciones de la noche correcta. | No proveedor real ni actualización ambigua en esta venta. |
| P07 | Requisitos documentales; IA15–17 | Necesidad indispensable impide preparación dependiente. | Alcance secundario independiente y cambios: regresión. |
| P08 | T04; G4; IA20/21 | Original privado subido, reconciliado y vinculado; Recibido aún bloquea; revisión explícita; download coincide en bytes. | Storage local real, sin servicio remoto ni datos personales. |
| P09 | AC-023; SM-BK-04; IA11 | Fondos, cuatro críticos y requisito revisado permiten confirmar operativamente. | No dispensa implícita ni ruta excepcional. |
| N04 | AC-058/063; IA15 | Finalizar sin ejecución real se rechaza y conserva hechos. | Anomalía/ejecución parcial: regresión. |
| P10 | E2E-01; IA15 | `start → perform → finish`, cantidades resueltas, original propio y responsable; ruta ordinaria. | No acredita ninguna actividad de negocio real. |
| P11 | AC-044 por separación; IA13 | Economía propia con fuentes versionadas: honorarios 300, costes 60, resultado real 240; independiente de 1.200,12 recibidos. | Terceros, mandato, factura y pago proveedor se contrastan por separado. |
| N05 | AC-058/059; IA16 | Finalizada no tiene evaluaciones ni cierre conjunto implícitos; intento conjunto denegado sin efectos. | Pendientes de factura/fianza/refund: regresión. |
| P12 | AC-059; T10; IA16/18 | Tres evaluaciones independientes y explícitas; la operacional incluye documento; ninguna cierra conjuntamente sola. | No aplica tiene fundamento por servicio interno; no se inventa factura externa. |
| P13 | T10; IA18/23 | Cierre conjunto explícito; repetición reconoce resultado sin otra historia; material distinto con misma operación genera conflicto. | Reapertura posterior: regresión. |
| P14 | SPEC-NFR-001; AC-089; IA20 | Reconstrucción desde Booking hacia versión/Acceptance/Lead, fondos/porciones/origen, cuatro confirmaciones/originales, requisito/objeto/digest, realidad y evidencias de cada criterio/cierre. Versiones intactas; proyecciones no mutan. | SQL observador corrobora; no sustituye acceso ordinario ni hace escrituras de negocio. |
| N06 | V-DAT; G1/G4; IA21/22 | `crm_h0_runtime`, `anon` y `authenticated` no actualizan Booking ni leen B07 directamente; sin cambios en negocio. | Roles efímeros aislados; no política Hosted/Production. |
| N07 | G1; IA21 | Actor deshabilitado no puede leer, repetir o descargar; logout invalida la evidencia anterior. | Actor deshabilitado/restaurado como precondición técnica; sin afectar H6-015. |

Cada mutación tiene entrada y salida contractual en `observed.json`, o readback específico y fuentes persistentes para objetos privados. `inputs.json` identifica los sources ejecutados. Los estados denegados se contrastan con hashes de las tablas de negocio; no se exige inmovilidad de los epochs técnicos de autenticación.

## Regresión y contrapruebas

Los 34 AC asociados por SPEC §9 se mapean a **105 referencias ejecutadas exactas** en la [matriz independiente](../../tests/fixtures/h6-001/independent/ac-matrix.md), con SHA de source, línea de caso y línea de log. La [matriz IA01–IA30](../../tests/fixtures/h6-001/independent/ia-matrix.json) y el [contraste transaccional](../../tests/fixtures/h6-001/independent/atomicity-replay-concurrency.json) distinguen cobertura funcional, documental y local. No se sustituye un caso por el nombre de un archivo ni por un PASS de una entrega anterior. La cadena integrada interna acredita su rama; las demás variantes se contrastan como componentes. En particular:

- AC-001/010: desconocido y coste pendiente; AC-002/003/062: identidades/roles/fusión y archivo; AC-005/006: pérdida/reactivación.
- AC-007–014: composición, alternativas, validez, registro tardío y reservas directas; la tarea E2E-02 global no se declara completada.
- AC-015/027/028: replays, pérdida de respuesta, conflicto y concurrencia PostgreSQL real; casos afectados por puerto se repiten aislados.
- AC-018/019/024: modificaciones de cantidad/noche y revisión acotada; E2E-03/04 no se cierran por estas regresiones.
- AC-023/025/026: exigencia económica y conciliación parcial; no confundir previsión con dinero.
- AC-044/045/046 y T07: pago parcial/salida acreditada, factura recibida frente a revisión/vinculación, saldo documental y separación de ingresos propios. Contrapruebas independientes con PostgreSQL real; no mismo expediente mixto E2E-01 ni E2E-05 global.
- AC-058–063: cierres parciales, crítica/devolución pendiente, invalidación/reapertura, archivo y realidad anómala; E2E-07 global pendiente.

La regresión histórica conserva su resultado bruto **2.899 PASS / 46 FAIL de 2.945 tests**, sin cancelados/skips. Los [46 FAIL AF001–AF046](../../tests/fixtures/h6-001/independent/reconciliation.md) tienen sucesor PASS identificado, con cero hallazgos materiales pendientes. Los intentos fallidos de sucesores también se conservan. No se afirma una nueva ejecución limpia de 2.945 por sumar repeticiones o retirar comprobaciones fallidas. A01–A06 añaden seis contrapruebas independientes (7/7 con contenedor); I01–I03 de H5-019 pasan 3/3 sobre cadena68. El dictamen es PASS técnico local con regresión explícitamente reconciliada.

## Identidad, custodia y publicación

IA27–IA30 se contrastan con el auditor de custodia, los manifiestos previos, los 14 heredados, 68 migraciones, cuarentena documental de cuatro trabajos y el inventario de lotes. [Informe consolidado](evidence-TSK-H6-001.md) y [publicación pendiente](publication-TSK-H6-001.md). La aceptación local y cualquier publicación son decisiones posteriores distintas.
