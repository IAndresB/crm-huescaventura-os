# TSK-H6-008 — Corrección R2 y cobertura completa local

Fecha local: 2026-10-22. Base `971c55d5ce5770c71284d106d3c0deecca9514b5`, árbol `8b43af1acc0d4be40321de1c5bc303129cdb47cd`. Candidato sin commit en worktree `h6-auth-corrective`. Este informe sucede a las evidencias parciales y R1 sin reescribirlas. **Dictamen técnico final PASS local/aislado, con revisión independiente PASS y regresión final terminada. CANDIDATO DE ACEPTACIÓN Y CIERRE LOCAL; no se registra H6-008 COMPLETED.**

## Autoridad, fuentes y preflight

Autorización expresa del director para infraestructura Auth/servidor locales, identidades y credenciales sintéticas, implementación compatible, pruebas y correcciones. No autorización de publicación, credenciales reales, servicios Hosted, efectos externos ni H6-015. Las diez fuentes aprobadas y su jerarquía se conservan en `tests/fixtures/h6-local-validation/normative-source-lock.json`; no cambia ninguna. La definición exacta está en Tasks, líneas 2341–2354, y las 23 asignaciones de §6 se mantienen literalmente en la matriz histórica. Las dependencias H5-019, H0-006, H0-014, H1-016 y H5-012 están completadas en su alcance local, según preflight y actas de la base. Sus límites históricos no se convierten en evidencia Auth real por herencia.

No hay nueva estructura persistente Core ni migración Core. Las 68 migraciones aprobadas se aplican a bases nuevas desechables; no se restaura ninguna copia. Las migraciones oficiales de Auth se ejecutan exclusivamente en su base de ensayo. V-MIG no exige una migración Core vacía para una corrección de TypeScript.

## Implementación y corrección material F01

Se conservan los tres módulos añadidos por R1: `SupabaseAuthProvider`, `HumanAuthSessions` y la frontera HTTP componible. El proveedor oficial fijado es Supabase Auth v2.197.0, con archivo y binario comprobados por SHA-256. Password grant, enrolamiento/desafío/verificación TOTP, `/user`, refresh y logout se ejecutan contra ese proveedor local. PostgreSQL y Storage también son reales, con identidades efímeras y datos sintéticos. Las interfaces de negocio existentes siguen siendo las únicas que producen efectos Core.

La revisión independiente encontró F01: una identificación completa detenida antes de `establish` podía leer la generación posterior a una revocación global y abrir sesión nueva si Auth no se había cerrado. R1 queda preservado como **FAIL para aceptación**, aunque su suite inicial tuviera 17 PASS. El fallo no se oculta con un expected nuevo.

R2 separa password y segundo factor. Después de verificar el password real y antes de completar TOTP, el servidor captura la generación Core mediante una lectura de metadatos. `establish` recibe esa generación y la compara dentro de su transacción. La función SQL existente vuelve a comprobar la generación firmada bajo bloqueo del actor. No se mantiene una transacción abierta mientras el proveedor verifica TOTP. La protección se apoya en PostgreSQL y funciona entre instancias de servidor; no depende de conocer todos los logins pendientes en un Map local.

Cambios sobre archivos ya versionados: 17 líneas añadidas/1 sustituida en `h0-005-adapter.ts` y la exposición del método de lectura en `human-postgres-composition.ts`. No se modifica SQL, contratos normativos ni verificadores históricos. La firma anterior de `establish` sigue disponible para consumidores anteriores; la nueva frontera de login exige la generación capturada. No se expone al cliente un endpoint para elegir sesión, importar JWT como alta Core o invocar libremente los métodos internos de acceso.

Expected F01 SHA-256 `4f3b397be4061e16f2efd341c85ef926445f197d431b5035fabd41e1786c653b`, congelado antes de corregir. Tres contrapruebas propias PASS: demora antes de TOTP; demora después de verificación completa y antes de establecer; establecimiento confirmado antes del cierre y respuesta tardía. Las tres usan dos instancias, proveedor real y fallo local 503 de logout. En los dos primeros órdenes no se crea sesión Core; en el tercero llega el handle, pero 16 superficies y 16 pruebas de identidad previamente verificadas quedan denegadas. Una identificación nueva posterior funciona.

## Cobertura M02 y garantías del instrumento

La revisión independiente identificó 110 entradas humanas públicas en los adaptadores PostgreSQL de R1: 105 de acceso Core y cinco de ciclo de sesión. La nueva lectura de generación eleva a 111 las entradas actuales; su caso se acredita en F01. La matriz inicial de 16 superficies era insuficiente para afirmar cobertura exhaustiva.

El ensayo M02 captura controles positivos útiles de **105/105 métodos Core** usando fixtures de negocio existentes y una identidad obtenida con password/TOTP auténticos. La instrumentación de prototipos solo compone los fixtures con esa identidad y observa resultados: llama los métodos originales, no reemplaza SQL, la guardia, el resultado ni la verificación del proveedor. No cuenta un error de negocio como control positivo. No conserva adaptadores anidados vinculados a transacciones terminadas. Los objetos de interacción verificados se preservan, evitando que una copia pierda su marca y produzca un falso rechazo previo a PostgreSQL.

Cada método se repite con los mismos argumentos materiales bajo seis condiciones: siete días inactivos, treinta absolutos, actor inhabilitado, recuperación incompleta, enrolamiento pendiente y generación revocada. Son **630 rechazos directos con identidad real previamente verificada** y **630 rechazos HTTP**. Los cinco métodos de ciclo de sesión tienen expectativas propias y no se fuerzan a seguir las de una lectura de negocio. Logout/revocación, por ejemplo, no se confunden con una lectura que debe denegarse por inactividad.

Para 103 métodos de clases, una instrumentación transparente observa las consultas reales y exige SQLSTATE 42501 en los límites temporales/revocación, o ausencia de mapping habilitado en `f2_lookup` para estados de actor. Las tres delegaciones H5001 se observan en sus adaptadores internos. No se acepta error de transporte, transacción cerrada o mera excepción genérica como denegación acreditada. Los dos métodos de la factoría Work mantienen su encapsulación; se verifican por sus resultados reales, HTTP, invariancia y suites de trabajo, sin atribuirles una traza SQL interna que el instrumento no recoge.

El test compara hashes de **todas las tablas de `crm_private`**, incluidas sesiones, epochs e historial, después de preparar cada condición y tras todos sus rechazos. Intercepta exclusivamente para contar las llamadas a los métodos reales de Storage: **cero solicitudes de Storage** durante los rechazos. El control positivo conserva y descarga bytes reales. El test integrado independiente conserva además la reautorización después de recuperar bytes y antes de entregarlos.

Expected M02 SHA-256 `849e208a476afe77358d91dd6ae4eb7fd0cd6b83d75635c88959d51fd2e0e634`, anterior al primer ensayo M02. No se redujo el inventario para ajustarlo a lo observado. Se conservaron los FAIL intermedios de cobertura e instrumentación. El freeze F01 anterior queda recuperado byte a byte y contrastado con el SHA de su ejecución en `expected-freeze-f01-preserved.json`; el freeze ampliado añade M02 sin cambiar el expected F01.

## Resultados propios reproducibles

| Ensayo | Resultado | Registro |
|---|---|---|
| Auth, HTTP, 16 superficies, PG/Storage y carreras | 17 PASS, 0 FAIL, 0 skipped | `tests/fixtures/h6-auth-corrective/integrated-2026-10-21T23-18-42-964Z/run.json` |
| F01, ambos órdenes y dos instancias | 3 PASS, 0 FAIL, 0 skipped | `tests/fixtures/h6-auth-corrective/corrective-2026-10-21T23-18-07-730Z/run.json` |
| M02: 105 controles + 6 matrices directas/HTTP | 7 tests PASS; 105/105 útiles; 1.260 denegaciones | `tests/fixtures/h6-auth-corrective/coverage-2026-10-21T23-34-55-434Z/run.json` |
| Regresión H6-006 sobre R2 | 62 PASS, 0 FAIL, 0 skipped | `tests/fixtures/h6-auth-corrective/h6006-2026-10-21T23-39-39-540Z/run.json` |
| Regresión histórica H6-008 + H0/H1 | 60 PASS, 0 FAIL, 1 skip histórico S10 | `tests/fixtures/h6-auth-corrective/regression-2026-10-21T23-40-09-163Z/run.json` |
| Unitarias | 210 PASS, 0 FAIL, 0 skipped | `tests/fixtures/h6-auth-corrective/checks-20261021T233522Z/unit.json` |
| Lint, typecheck, build | exit 0 en los tres | mismo directorio `checks-20261021T233522Z` |

Comandos de reproducción: `node scripts/prepare-h6-auth-tools.mjs`; `node scripts/run-h6-auth-corrective.mjs integrated`, `corrective`, `coverage`, `regression` y `h6006`, secuencialmente. El runner verifica base, expected y fuentes normativas, crea registros nuevos, identifica fuentes y no hereda credenciales de servicios. Requiere PostgreSQL 17 local y el código público fijado de Storage. No ejecuta H6-015. La prueba M02 puede obtener estado inválido mediante la conexión administrativa del fixture; la operación que se evalúa utiliza siempre el rol ordinario y una prueba de identidad real.

## Semántica de seguridad y límites precisos

- Un JWT anterior mantiene firma válida y `exp` futura después del logout. En la versión fijada de Auth, `/user` y refresh rechazan la sesión eliminada. Core aplica además su propia generación y cierre durable. No se promete invalidación criptográfica instantánea de JWT ni de todo consumidor externo.
- La revocación Core precede al intento de cierre en Auth. Si Auth falla, el resultado permanece `partial/uncertain`; no se declara cierre completo. Los handles, pruebas previamente verificadas y respuestas refresh tardías no recuperan autoridad Core.
- Los access/refresh tokens y handles son memoria del servidor; no se escriben en Core, logs ni evidencias. La prueba de pérdida de estado sustituye el gestor de sesiones, no mata un proceso HTTP del sistema operativo. El comportamiento de cierre por pérdida de Map se comprueba; no se afirma una prueba de crash de proceso para H6-008. H6-006 sí conserva su ensayo de caída de ejecutor.
- Los “dispositivos” aquí son sesiones/instancias lógicas independientes. No equivalen a la copia TOTP en papel ni al ensayo de dispositivos físicos de H6-009, ni a recuperación real de credenciales de H6-010/011.
- No hay UI ni despliegue: el build publica únicamente las rutas ya existentes `/health` y not-found como artefacto local. La frontera HTTP se acredita con servidor local de ensayo y adaptadores reales. No se ha activado un servicio de negocio externo.
- Auth/HTTP/proxy/interceptor y PostgreSQL escuchan en loopback; signup público desactivado; SMTP exclusivamente a interceptor local, SMS/OAuth externos sin activar. El contador HTTP del interceptor no acredita por sí solo conversaciones SMTP: la restricción SMTP se sostiene en la configuración local fijada. El test no reclama certificación general de egress del sistema operativo.
- `ARCH-PENDING-002`, `DM-PENDING-005` y las partes no acreditadas de `PLAN-PENDING-003` siguen abiertas. Los resultados locales no aprueban RPO/RTO, retención, Hosted/Production, recuperación de autoridad real ni reentrada.

## Históricos y custodia

Se preservan el candidato original de 291 payloads; R1 de integración con sus fallos de infraestructura y F01; revisión independiente R1; expected originales; todas las ejecuciones correctivas, incluida la instrumentación que inicialmente no observaba las delegaciones H5001. Las incompatibilidades ordinarias de fixtures se resolvieron usando firmas/inputs válidos y el fixture de cancelación temporal ya corregido; no alterando reglas, restricciones o resultados esperados.

La revisión R1 original queda en su worktree y con copia verificada bajo `tests/fixtures/h6-auth-independent-r1-custody`. El checkpoint ejecutable R2 de 13 archivos tiene SHA-256 `c71b34b195cb922b2b7e3945f176b78cb279063f2b0fbe50c5da08dceb02ee9e`. Los informes y regresiones se añaden sin modificar ese código congelado. El manifiesto final `tests/fixtures/h6-auth-corrective/delivery-manifest-r2.json` identifica el conjunto de entrega, incluyendo las dos modificaciones versionadas, no solo los archivos nuevos.

La regresión conserva literalmente el antiguo skip S10: el resultado es 60 PASS y un skip, nunca 61 PASS. Su faltante histórico se satisface con la suite Auth real nueva de 17 casos sin saltos, la cobertura M02 y su revisión independiente; no se modifica el test histórico para borrar su limitación.

## Dictamen independiente final y candidatura

Un revisor en contexto y checkout separados reprodujo 17 integrados, tres F01, siete M02 y cinco contrapruebas propias: **32 PASS, sin FAIL ni skip**. No alteró ni ejecutó el checkout candidato. Sus contrapruebas incluyen denegación de tablas Auth al runtime, cierre global efectivo del proveedor manteniendo la firma JWT válida, fallo Auth503 tras cierre local Core, el caso original F01 y una capacidad F2 firmada antes de revocación que llega después al SQL. Esta última recibe 42501 y no crea sesión. La regresión principal se contrastó mediante recibos, logs y SHA; se distingue de las ejecuciones propias del revisor.

El [dictamen independiente R2](../../tests/fixtures/h6-auth-independent-r2-custody/specs/001-core-crm/independent-review-TSK-H6-008-r2.md) cierra F01/M02 y recomienda aceptar el candidato local, sin defecto material abierto adicional en el alcance examinado. Su manifiesto de 564 payloads tiene SHA-256 `63fb482b12b44672db1abd948970a7ae2ec682788b9e02f3a59822baad086af9`; la copia completa está verificada bajo `tests/fixtures/h6-auth-independent-r2-custody`. La [matriz de 23 asignaciones](matrix-TSK-H6-008-r2.json) incorpora su resultado, manteniendo el texto normativo literal y las referencias históricas.

La autorización de H6-008 permite preparar el candidato de aceptación y cierre. A diferencia del cierre condicionado expresamente autorizado para H6-006, este documento no registra H6-008 COMPLETED. La decisión concreta propuesta queda en [candidate-acceptance-TSK-H6-008-local.md](candidate-acceptance-TSK-H6-008-local.md). H6-015 sigue NOT STARTED; no se ha ejecutado restauración ni preparado recursos para ella.
