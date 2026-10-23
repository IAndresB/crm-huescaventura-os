# Revisión independiente H6-008 — R2

Fecha: 2026-10-22 Europe/Madrid. **F01 corregido y M02 resuelto en el ámbito local examinado.** **Propuesta: aceptar el candidato de aceptación y cierre local de H6-008 en el alcance documentado.** La regresión final H6-008/H0/H1 también terminó sin fallos. Esta revisión no cambia el estado de Tasks ni declara H6-008 COMPLETED.

## Identidad de la revisión

Base Git exacta `971c55d5ce5770c71284d106d3c0deecca9514b5`. Worktree independiente R2: `/Users/andres/.codex/worktrees/h6-auth-independent-r2/crm-huescaventura-os`. Se verificaron y copiaron únicamente las 1423 entradas originales, SHA del manifiesto `b674ac9ac035371fd2175a0ac22744f6c60c1b0f58b7538cb0d9af2e30d1d3b5`, y las 13 entradas correctivas del checkpoint R2 `c71b34b195cb922b2b7e3945f176b78cb279063f2b0fbe50c5da08dceb02ee9e`. Las primeras siete coincidían con F01 `0662e541a36e68a2643e43a754ecd849f5d7d1766b57fdaab9749edad4130b2d`.

Se conserva R1 íntegro: 323 archivos de su manifiesto `6429e85b95a1db241cce9d2dbf073dd0f2dea26166f17df7edf5b5f32078e066` comprobados de nuevo. El FAIL de I04, los expected y el informe adverso original no se alteran. El suplemento de guardias producido después de ese manifiesto tiene custodia separada, SHA `6cf37b44b4c0e0e6bb53f7075407e7785b1ecfef09209f597e9d5aa604f9320e`.

No se editó ni ejecutó el checkout candidato. Todos los ensayos del revisor se ejecutaron en su copia, en serie respecto del runner principal. PostgreSQL 17.11 y 68 migraciones Core, Auth oficial v2.197.0 con archivo/binario SHA verificados, y Storage oficial fijado y compilado. Entorno explícito; identidades, TOTP, objetos y efectos sintéticos en loopback. Dependencias instaladas offline con lock y sin scripts. Sin Hosted, credenciales reales, mensajes externos, commits, push, deploy, Drive o restore.

## F01: cierre verificado

La identificación obtiene la generación Core después de verificar password y antes de completar TOTP. `HumanAuthSessions.login` exige esa generación al establecer; el adaptador la compara y el ejecutor SQL existente la vuelve a contrastar bajo el bloqueo del actor, antes de insertar sesión y epoch. `completeTotp` exige el mismo subject y provider session antes y después del segundo factor. No se añaden tablas ni se modifica la semántica normativa o la cadena SQL.

La contraprueba independiente original I04 conserva su expectativa: password, TOTP y verificación online completados antes de una revocación global con logout Auth503. En R1 entregaba login y Core HTTP200; en R2 ambos resultan HTTP403. Una contraprueba adicional, **I05 de R2**, detiene la ejecución después de comparar generación y emitir la capacidad F2; tras confirmar revoke-all en otra conexión, el SQL recibe la capacidad anterior y devuelve **42501 sin nueva sesión Core**. I05 de R2 es distinto del inventario SQL denominado I05 en R1.

Se reprodujeron también las tres carreras del candidato: demora anterior a TOTP, demora anterior a establish y establish confirmado antes del cierre. Las dos primeras prueban dos instancias independientes, rechazo de identificación anterior y nueva identificación posterior válida. En el orden inverso puede entregarse una respuesta tardía HTTP200 con handle, pero las 16 superficies y las 16 llamadas con prueba previamente verificada deniegan todo acceso posterior. Una respuesta de login no equivale a autoridad Core vigente.

`H0005PostgresAdapter.establish` conserva el parámetro opcional por compatibilidad con llamadores confiables anteriores. La búsqueda de producto confirma una única llamada a establish, en HumanAuthSessions, que pasa la generación capturada. No se encontró otro llamador de producto que omita esta condición. Cualquier integración futura de proveedor debe conservarla; esta revisión no acredita composiciones futuras.

## M02: inventario y guardias

El inventario usado por M02 coincide exactamente con las 110 entradas obtenidas por el revisor en R1: **105 entradas Core y cinco de lifecycle**. R2 añade un método de metadatos de identificación, cubierto por F01. El mapa nuevo contiene 111 filas con fuente, línea actual, SHA, categoría, funciones SQL, equivalencias revisadas y resultado por estado: `tests/fixtures/h6-auth-independent-review-r2/surface-coverage-r2.json` y `.md`.

La reproducción demuestra una llamada positiva completa con Auth real y DTO válido por cada una de las 105 entradas; después repite los argumentos ante idle7, absolute30, actor disabled, recovery, enrollment y revocación global. Son 630 denegaciones directas con prueba anterior y 630 HTTP. Para las 103 entradas de clase se observa PostgreSQL real: 103 SQLSTATE42501 por cada estado idle7/absolute30/global y 103 consultas f2_lookup sin fila por cada estado disabled/recovery/enrollment. No se admite un transporte cerrado, una TX abortada ni una ausencia de consultas como prueba de denegación.

Se inspeccionó la instrumentación: ejecuta los métodos originales, sólo captura llamadas exteriores completadas y evita conservar adaptadores internos ligados a una TX terminada. Mantiene objetos Auth/interaction auténticos, copia los DTO y observa las delegaciones earlier/obligations de H5001. Cada estado compara un hash de todas las tablas crm_private antes/después y exige cero llamadas get/put/inventory a Storage. El significado de «positivo útil» del test es valor no nulo, incluidas colecciones vacías autorizadas; las fixtures crean datos y ejecutan rutas de negocio válidas.

Las dos funciones del factory Work conservan SQL privado en un closure y no se instrumentan internamente en M02. Sí tienen positivo y seis denegaciones directas/HTTP, junto con las rutas de trabajo de la integrada y la regresión H6-006. La revisión de fuente identifica sus probes/admisión y la finalización obligatoria antes de COMMIT; no se presenta una traza SQL inexistente como observada.

El suplemento revisa el orden de cada guardia y las excepciones: las delegaciones exactas preservan Auth/interaction; los dispatchers comparten admisión incondicional anterior a acción/replay; Booking.direct usa una misma TX; Storage revalida tras unidades externas; TTE distingue F1 técnico, reserva humana y ledger final, incluidos overloads de commit_internal_unit. El grafo de nombres SQL y los imports históricos no se usan como sustituto de pruebas. La cobertura por método no implica ensayar todas las ramas de negocio; las equivalencias se limitan a la admisión común demostrada y las ramas particulares conservan sus regresiones.

## Resultados y procedencia

| Grupo | Ejecutor | Resultado | Directorio de evidencia |
|---|---|---|---|
| I01–I05 R2 | Revisor | 5 PASS, sin skip | `h6-auth-independent-review-r2/contraprobes-2026-10-21T23-36-35-124Z` |
| F01 entre instancias | Revisor | 3 PASS, sin skip | `h6-auth-corrective/corrective-2026-10-21T23-37-03-376Z` |
| Integración Auth/HTTP/Core | Revisor | 17 PASS, sin skip | `h6-auth-corrective/integrated-2026-10-21T23-37-37-473Z` |
| M02 | Revisor | 7 PASS; 105 positivos + 630 directos + 630 HTTP | `h6-auth-corrective/coverage-2026-10-21T23-38-24-829Z` |
| H6-006 regresión R2 | Principal; recibo/logs/SHA revisados | 62 PASS, sin skip | `principal-evidence/.../h6006-2026-10-21T23-39-39-540Z` |
| Unitarias/lint/typecheck/build | Principal; recibos/logs/SHA revisados | 210 unitarias; cuatro exitCode0 | `principal-evidence/.../checks-20261021T233522Z` |
| H6-008/H0/H1 regresión R2 | Principal; recibo/logs/SHA revisados | 60 PASS, 0 FAIL, 1 skip histórico S10 | `principal-evidence/.../regression-2026-10-21T23-40-09-163Z` |

El skip histórico S10 se conserva: su objeto Auth local tiene acreditación separada en los 17 integrados nuevos sin skip; no se transforma el test antiguo en un PASS. Los manifiestos de ambas regresiones principales coinciden con los cinco archivos de producto examinados.

Los resultados propios suman 32 casos de test, cuyos subcasos se describen en la tabla sin confundirlos con tests adicionales. I01 acredita runtime conectado a la base Auth existente, con users/sessions/mfa_factors denegados42501. I02 comprueba Auth sessions4→0 tras logout global y denegación de /user y refresh aunque la firma del JWT anterior siga válida. I03 conserva cierre local de Core frente a Auth503 y acceso de otro dispositivo no revocado.

## Asignaciones y límites

Las 23 asignaciones normativas derivadas de Tasks se mantienen completas en `coverage-23-r2.json`, con texto fuente literal, referencias R1 y evidencia correctiva R2. Las 10 fuentes normativas y los expected originales permanecen intactos. `preservation-r2.json` diferencia las dos sustituciones de archivos nuevos Auth originales, los dos cambios tracked autorizados y las nuevas pruebas. No se halló un defecto material abierto adicional dentro del alcance examinado.

El alcance sigue siendo local y sintético con proveedor Auth real. No acredita Hosted/Production, UI terminada, dispositivos físicos, recuperación/entrega externa ni continuidad multinodo. Los handles se guardan en memoria: perder el proceso exige nueva identificación. Firma JWT válida no basta para acceso; la verificación online del proveedor y la autoridad Core son barreras independientes. Los tests no aceptan permisos por metadata o relaciones ni reabren la aceptación funcional de privacidad H5.

El contador mailAttempts observa peticiones HTTP al sink; no mide conexiones SMTP ni todo el egress. El contador de M02 observa llamadas del adaptador Storage, no una auditoría universal de red. La ausencia de efectos externos se limita a la configuración local y a las rutas probadas.

H6-015 sigue NOT STARTED. ARCH-PENDING-002 y DM-PENDING-005 siguen OPEN. PLAN-PENDING-003 mantiene sus dispositivos, recuperación real y Production. La propuesta de aceptación local de F01/M02 no cambia esas fronteras ni declara H6 global COMPLETED.
