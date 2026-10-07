# TSK-H5-001/002 — Task del negocio, implementación y verificación

**PASS exclusivamente Mac Local/PostgreSQL aislado/datos sintéticos.** H5-001 y H5-002 quedan acreditadas en su alcance local tras la regresión definitiva; H5-003 en adelante y H6 permanecen NOT STARTED. No hay prueba Hosted/Production, scheduler, conector o envío real.

## Cadena de autoridad y SHAs

- Base `98ac77fda7ccf769ef3f05633b5bf8a4a59cec95`: preflight tras `git fetch origin`, `main = HEAD = origin/main`, divergencia 0/0 y árbol limpio; 52 migraciones. Las fuentes APPROVED y los 20 IDs literales de Tasks §6 se recuperaron antes del diseño.
- Expected independiente `9c0afccd73b9ac209bdcff9ddcbfd93a31f76230`: commit/push separado, origin/main coincidente antes de escribir producto. SHA256 del archivo congelado `95fe1d6e56ec55e2739d52f5af8a3112b504b48ebb8802b48e503042e08606ca`; bytes verificados iguales en el SHA probado.
- Producto/verificador: `69aeb6bccd76b6cdffe8a33388c635afcc146506`, `18e0f489997407a7a584d3e68adf962f9ad7ec32`, `fbf2f9faf4ee9dcadd2edc4acbe5012b6564d9b0`, `c4d641fc29504685f5bbb61df64806861e8c2908`, `b7c1be7ad7b2ec76f413da445babbe3466012675` y **`6478d0f835fc89f38a17042ba2342105034e6883`**, SHA exacto definitivamente probado. F07 corrigió la proyección Vencida antes de ese SHA. Ningún producto, test o migración cambió después de él.
- Commit documental sucesor: exclusivamente esta evidencia, matriz, registro Fxx, fixtures/logs y coordinación. El SHA publicado de ese commit se informa tras push; no se le atribuye la ejecución de los tests.

## Resultado ejecutado en `6478d0f8…`

|Comprobación|Resultado|Evidencia local|
|---|---|---|
|Foco PostgreSQL H5|19/19 PASS; 16 tests de ciclo/disparadores y 3 V-MIG/advisors, sin doble cómputo|`tests/fixtures/h5-002/focal-6478d0f.log.gz`|
|PostgreSQL completo|**2340/2340 PASS**, fail/skipped/cancelled 0; **2321 baseline H0–H4 + 19 nuevos H5 = 2340**|`tests/fixtures/h5-002/postgres-6478d0f-retest.log.gz` (líneas descomprimidas en `case-results.json`)|
|Unitarias|**142/142 PASS**; 138 previas + 4 H5|`tests/fixtures/h5-002/unit-6478d0f.log.gz`|
|Health independiente, después de PostgreSQL|**1/1 PASS**|`tests/fixtures/h5-002/health-6478d0f-retest.log.gz`|
|`pnpm install --frozen-lockfile`, typecheck, lint/boundaries, build, `pnpm audit --prod`|PASS, todos en SHA probado|`frozen-6478d0f.log.gz`, `typecheck-6478d0f.log.gz`, `lint-6478d0f.log.gz`, `build-6478d0f.log.gz`, `audit-6478d0f.log.gz`|
|V-MIG y advisors oficiales|Fresh 53, upgrade poblado 52→53, fallo DDL/rollback/retry PASS; advisors loopback exit 0 y `results=[]`|`case-results.json` H5-R02; `advisors.*`|

La [matriz](matrix-TSK-H5-002.md) compara las 26 filas congeladas (24 nuevas y 2 regresión), sus observaciones y las 20 filas normativas de §6. Los 13 subcasos de BR-TASK-005 están indexados individualmente; las reejecuciones focales, subcasos y health no suman tests PostgreSQL nuevos. `tests/fixtures/h5-002/manifest.json` conserva tamaños y hashes de 100 archivos de evidencia; las 39 entradas y líneas de `case-results.json` se reabrieron y cotejaron contra el stream real, incluido el gzip descomprimido. El runner incluye reproducciones históricas con FAIL interno deliberado; su test envolvente pasó y el resumen final es el anterior.

## Implementación y fronteras

La migración **53**, `20261007180001_h5_task_lifecycle.sql`, extiende `b07_pending_tasks` existente con estados Pendiente/Completada/Cancelada, cierre conservado, reapertura expresa, guardas de identidad/cierre e historia; no crea sistema Task paralelo. El adaptador H5 reutiliza recepción/lectura H1 y F1/F2. La transición usa admisión server-side, transacción T09, lock de operación, bloqueo de fila, revisión esperada, RLS/FORCE RLS y replay reautorizado. No se tocó ninguna de las 52 migraciones anteriores; `preservation.json` verifica bytes, expected y lista de producto. La función `b07_task_apply` conserva OID/owner/ACL/config en el upgrade. La prueba de DDL fallido demostró rollback y retry con Task previa y su historia intactas.

El planner C02 admite solo las 13 causas BR-TASK-005, con identidad causa/alcance/efecto, origen/versionado y ausencia de parámetros expresada como `unknown`. El saldo se deriva mediante lectura autorizada H3 y cobertura verificada; con 200.00 de 500.00 queda parcial y hay necesidad, con 500.00 completa desaparece la necesidad. D020 usa fecha civil y ámbito propio; una Task cerrada no queda Vencida. La propuesta con seguimiento dentro de 2–3 días y adelanto previo solo produce fechas conocidas si ambos parámetros concretos existen. Falta de fecha, adelanto, límite o pausa bloquea únicamente su necesidad dependiente. No hay scheduler ni envío al cliente.

`concurrency.json` contiene dos órdenes reales de carrera completar→cancelar y cancelar→completar sobre la misma identidad, dos PID PostgreSQL distintos y esperas observadas: una transición triunfa y la otra rechaza, revisión final 2, dos filas de historia, sin doble cierre. Otra prueba concurre dos recepciones equivalentes y verifica un ID; una necesidad relacionada mantiene ID diferente. El fallo inyectado al insertar historia revierte cierre/operación/historia y el retry válido cierra una vez. Runtime, anon y authenticated carecen de acceso directo; actor deshabilitado, contexto ajeno y autoridad/interacción ausente rechazan. Completar/cancelar Task no modifica Booking, factura de proveedor, Acceptance ni pagos del cliente sintéticos.

## Defectos, preservación y límites

[Registro F01–F08](defects-TSK-H5-002.md): F01–F06 técnicos del harness/entorno, F07 material de producto detectado estáticamente y corregido antes del SHA definitivo, F08 agotamiento de memoria compartida por PostgreSQL temporales huérfanos. Todos los FAIL y streams interrumpidos se conservan con retests separados; `orphan-postgres-stop.json` registra las 28 paradas dirigidas. El FAIL de health simultáneo y la regresión con error de memoria no son la ejecución definitiva. Tres fixtures históricos regenerados por el runner se archivaron bajo `generated-historical-final/` y se restauraron byte a byte. La caché CLI `.temp` se archivó allí y se retiró del árbol fuente. No se alteraron package/lockfile, fuentes APPROVED, migraciones anteriores, health, H0–H4 ni sus expected.

Versión de ensayo: Node 24.21.0, pnpm 11.19.0, PostgreSQL 17.11 Postgres.app y CLI Supabase 2.119.0. `POSTGRES_H0_BIN` apunta a Postgres.app local; `H5002_CAPTURE_DIR` conserva observaciones sintéticas. El tramo Task de PT-08 queda acreditado localmente; **H5-004/H6-006, AC-058 integral, E2E-01 integral, H5-014, Hosted H2/H3/H4 y Production no se acreditan**. DM-PENDING-005 y los demás bloqueos de Tasks §7 permanecen en su ámbito. H0 técnico/local/aislado, H1–H4 y H4-001–024 conservan el estado COMPLETED anterior. STOP después de H5-001/002.
