# Verificación independiente TSK-H4-021

Estado: COMPLETED local/aislado; gates definitivos PASS, cero defectos materiales abiertos.

Base `77e36157f174eee1f796f429b556217b71d996fa`. Expected69 casos independiente/previo en commit `33c8666f58f0af915a652e41260b4996bb60b928`, SHA256 `fc6468995b62cba6ad5eeeb40e27074a20a1fe9d96a06a7c57739a4ddf87978c`, íntegro. Unión23 filas literalmente conservada. [Matriz observado/expected](matrix-TSK-H4-021.md) y gates definitivos registrados después de la ejecución.

Fixtures H2→H3→H4 ordinarios sintéticos: Acceptance/Ganada/conversión, dinero detectado/recibido/conciliado/verificado/asignado, confirmación por llamada, responsable interno, requisitos/documentos/revisión/Incident/Availability/Hold, modificaciones reales A→B/V1→V2. SQL privilegiado únicamente instalación, observación y fallos técnicos explícitos. Hash SQL de payload solo construye evidencia contractual; resultados esperados proceden de normas. No helper de producto como oráculo.

Concurrencia:14 pares en ambos órdenes, cada uno dos sesiones reales y mismo actor compatible F06; barrera técnica en raíz Booking, PID/xid/sesión/pg_locks/granted/pg_blocking_pids en logs completos. Ambas unidades alcanzan raíz de negocio tras F2; no espera actor global usada como prueba. Confirmación frente a pérdida crítica/primera necesidad documental/cambio de fecha/cambio económico/TTE y replay; versiones/huella se comprueban después de espera. Historia posterior legítima no inmuniza la fase actual.

Atomicidad: ocho puntos de inyección real (Task, Task history/result, evaluation, operation, approval, COMMIT ordinario y COMMIT TTE), snapshot íntegro antes/después y retest. Respuesta perdida tras COMMIT real se descarta técnicamente en wrapper; replay autorizado recupera un resultado y una historia; sesión revocada niega recuperación. No se presenta como fallo de red de un conector externo.

Tiempo:7/6 y10 actuales por API ordinaria; último microinstante civil/día siguiente/hora se observa con parámetro temporal explícito a función SQL sobre hechos ordinarios. B47 consulta API10→6 con inyección técnica aislada de reloj en el cuerpo de lectura, restaurado después; no cambia hechos ni reloj del host, y no se presenta como espera real cuatro días. El contrato de Task actual no implementa completar prestación/tareas futuras: intento taskCompleted como bypass denegado; Task local duradera no acredita crítico ausente.

V-MIG: vacío50, upgrade49 poblado con original Storage privado descargado antes/después (bytes iguales), datos/relaciones/historia y catálogo, falloDDL22012 rollback sin residuo/reintento; solo b07_task_apply cuerpo adaptado, OID/firma/owner/ACL/config conservados. Advisors CLI2.119.0 exclusivamente127.0.0.1, resultados[], status0 en desarrollo. F1/F2/HA/TTE preservados; runtime sin tabla privada/helper y actor disabled/sesión revocada sin actividad reactivada. Proyección sin original privado/costes reservados.

[Defectos originales](defects-TSK-H4-021.md). Logs íntegros y manifiestos en fixtures/h4-021; captura reproducible `python3 tests/fixtures/h4-021/capture.py /tmp/UNICO COMANDO ARGUMENTOS`. Instalar gate SHA y estado clean antes de ejecutar; generated outputs externos, luego conservación documental. Todos los gates finales PASS según el registro definitivo siguiente.

STOP H4-020/021. E2E-01 solo tramo local; H4-023/H6-001/H6-016 no acreditados. H4 sigue IN PROGRESS; tareas posteriores fuera de alcance; hosted H2/H3 no acreditados, Production no autorizada; DM-PENDING-005 abierto. No datos/efectos reales.

## Resultado definitivo sobre SHA publicado

Verificador y producto congelados/publicados en `bf4d707509e07f9caa30cfece26e5c418c5d42f7`; todos los comandos comenzaron con ese HEAD y árbol limpio. Cadena: expected previo `33c8666f58f0af915a652e41260b4996bb60b928` → producto/migración `1964dd732b2832988bf97a4a36e8f143d681bcc4` → verificador/SHA probado `bf4d707509e07f9caa30cfece26e5c418c5d42f7` → cierre posterior exclusivamente documental (documentación, matriz y salidas íntegras de evidencia; ningún cambio posterior de producto, SQL, lógica del verificador o dependencias).

|Gate|Comando / comprobación|Resultado|
|---|---|---|
|Instalación congelada|`pnpm install --frozen-lockfile`|PASS; status0|
|Tipos|`pnpm typecheck`|PASS; status0|
|Lint/imports/boundaries|`pnpm lint`|PASS; status0|
|Build|`pnpm build`|PASS; status0|
|Auditoría dependencias producción|`pnpm audit --prod`|PASS; cero vulnerabilidades; status0|
|PostgreSQL completo|`node scripts/test-postgres.mjs`|2076/2076; fail0/skipped0/cancelled0; status0|
|Unitarias completas|`pnpm test`|138/138; status0|
|Salud independiente|`node --test tests/operations/supabase-health.test.mjs`|1/1 separado; status0|
|V-MIG y advisors|Incluidos en PostgreSQL; CLI2.119.0, URL127.0.0.1 exclusivamente|PASS; resultados[]; status0|
|Diff rango completo|`git diff 77e36157f174eee1f796f429b556217b71d996fa --check`|PASS; status0; se repite tras cierre documental|

2010 pruebas PostgreSQL anteriores +66 nuevas (21 focales +17 concretas +15 Node concurrencia +10 Node atomicidad +3 V-MIG/advisors) =2076; los 66 focales ya están incluidos, no se vuelven a sumar. La [matriz](matrix-TSK-H4-021.md) contrasta69 casos lógicos y la unión23 filas: los casos lógicos no equivalen a69 tests nuevos. V-DOM/V-DAT/V-SM/V-NEG/V-MIG/V-EVI aplicables acreditados localmente. B34/B46 incluyen contratos heredados efectivamente regresados; B44 deniega el bypass Task, con la limitación explícita del contrato actual sin completar Task/prestación futura.

Evidencia íntegra: `tests/fixtures/h4-021/final/manifest.json` incluye comando/argumentos, SHA/árbol inicial/final, tiempos Unix, status/signal y hashes de cada stdout/stderr/native/catalogue/resultado conservado, gzip sin pérdida. Versiones: Node24.21.0, pnpm11.19.0, PostgreSQL17.11, CLI2.119.0. Capturas originales de desarrollo y sus campos ausentes siguen identificados, sin reconstrucción. PostgreSQL regeneró tres salidas históricas de evidencia y un aviso CLI; sus nuevas salidas se conservaron en `final/generated`, y los tres archivos históricos se restituyeron a sus bytes exactos HEAD. Registro de ambos hashes y `restoredExactly:true` en `final/generated-preservation.json`. El código de producto/pruebas no cambió durante el gate.

V-MIG vacío50 y49poblado→50 PASS; falloDDL22012 rollback y reintento PASS; todas las49 migraciones anteriores byte idénticas. Original privado descargado antes/después: SHA256 `1e6056de4d02f1a3d69e7f93307b8e0e23f22f881e432f89af1db1741bd27203`, bytes iguales. Datos/relaciones/historia y catálogo preservados, salvo único cuerpo previo declarado `b07_task_apply` adaptado; OID/firma/owner/ACL/config intactos. Datos SHA `a247f00c6384cf484a6fcbd57af729426746c53120a7b7f86f7a79ac4df7b19e`; catálogo previo `c96d71e09ddb602d75b18899e2dbf9d35388e10bd1cdc8402bd8c659e2e78158`, catálogo actual distinto declarado `4a8616915bffb44e792ca7ee095a4f714f6061cbfd631cd59d2c40cdf5954f06`. Registro y snapshots completos en `final/postgres/preparation-vmig.json` y catálogo asociado.

Concurrencia14 pares ambos órdenes PASS: dos sesiones/conexiones reales con ambas admisiones F2 compatibles antes de la raíz Booking, PID/xid/sesión/locks/cadena de bloqueo observados. Ocho puntos de fallo de escritura/COMMIT y recuperación tras COMMIT real/respuesta descartada PASS; sin estado residual ni consumo parcial de aprobación. F1/F2/HA/TTE/D039, revocación/inhabilitación, privacidad y runtime sin CRUD/helper preservados. [Defectos](defects-TSK-H4-021.md) F01–F22 CLOSED:19 técnicos y3 materiales; F19/F20 observaciones estáticas explícitas, sin FAIL ejecutado atribuido. Cero defectos materiales abiertos y cero FAIL/skipped/cancelled materiales al cierre.

H0 técnico/local/aislado y H1/H2/H3 local/aislado COMPLETED conservados; H4-001–021 COMPLETED local/aislado; H4 IN PROGRESS; H4-022+ y H5–H6 NOT STARTED. E2E-01 solo tramo local; H4-023/H6-001/H6-016 futuros. Hosted H2/H3 no acreditados; Production no autorizada; DM-PENDING-005 y pendientes globales abiertos en sus ámbitos. STOP tras publicar H4-021; continuidad únicamente al hilo de dirección H4.
