# TSK-H6-008 — Evidencia parcial local

2026-10-22. **IN PROGRESS / PARTIAL / NO COMPLETED.** Base `971c55d5ce5770c71284d106d3c0deecca9514b5` más fuentes nuevas sin commit, identificadas por manifiesto por ejecución. Dependencias H5-019, H0-006, H0-014, H1-016 y H5-012 completadas en su alcance local; ninguna acredita por herencia Auth real global.

Expected anterior al observado: [expected-TSK-H6-008.json](expected-TSK-H6-008.json), SHA-256 `f1f7b53e5eaf4143dc3bec2da3de88fc38838e5de1322e7af168d0a92bd23703`. [matrix-TSK-H6-008.json](matrix-TSK-H6-008.json) enlaza las 23 asignaciones exactas; todas se conservan parciales para el alcance completo de la tarea. No se inventan dependencias circulares con los ensayos personales H6-009/010/011.

## Ejecución real y cobertura

Mismo entorno aislado/sintético descrito en H6-006: PostgreSQL 17.11, Storage oficial real con backend privado de archivos, cadena aprobada hasta migración 68, roles ordinarios sin privilegio global. Auth es un port sintético. Las pruebas invocan contratos de aplicación, sin requerir UI.

Resultado final de `node scripts/run-h6-local-validation.mjs h6-008`: [ejecución 22:26:54 UTC](../../tests/fixtures/h6-local-validation/h6-008-2026-10-21T22-26-54-921Z/run.json), **19 PASS, 0 FAIL y 1 caso explícitamente sin ejecutar**, de 20 tests agrupados. Se conserva también la ejecución anterior de 17 PASS/1 pendiente, previa a añadir las dos carreras S09; no se reemplazó.

| Caso | Observado |
|---|---|
| S01/S02/S06 | 16 controles positivos por fixture y rechazo sobre las mismas superficies ante 7d de inactividad, 30d absolutos, revocación individual, disabled, recovery, enrollment, falta de MFA, sujeto no mapeado, copia falsificada y ausencia de autoridad. Witness desde conexión administrativa compara hashes de efectos/historia/actividad; los actores de aplicación siguen siendo ordinarios. |
| S02/S03 | Seis comparaciones del servidor en borde anterior/exacto/posterior a 7/30 días, con microsegundo explícito. Actividad de B no modifica A; refresh/polling/job/passive y señal JSON falsificada no acreditan actividad. Falta de contraseña o MFA impide establecimiento sintético. |
| S04/S05 | Revocación desde B rechaza A y emisora B en 32 accesos por variante. Proveedor doble revoked/failed/uncertain/throw; los tres fallos conservan `partial`. Nueva identificación sintética independiente pasa. No acredita revocación del proveedor real. |
| S07 | 172 tablas privadas/HA × 4 roles × lectura/borrado directo: **1.376 denegaciones**. RLS/FORCE RLS y ausencia de superuser/BYPASSRLS contrastadas. Objeto privado rechaza ruta conocida anónima y JWT autenticado sintético aún vigente. |
| S08 | Storage obtiene bytes reales; la barrera retiene su entrega, se confirma revocación y se libera la barrera. Reautorización final Core deniega: **cero bytes entregados al solicitante**. No se usó mock de existencia/integridad del objeto. |
| S09 | Proyección y revocación en ambos órdenes con conexiones/PID distintos y bloqueos reales observados. Una lectura ya autorizada puede finalizar antes del cierre; si revocación toma autoridad primero, lectura denegada. Todos los accesos posteriores rechazados. |
| S10 | **PENDING / NO EJECUTADA:** integración con Auth/MFA/refresh/logout reales y frontera HTTP de origen/interacción. Está visible como skipped y no se transforma en PASS. |

Las 16 superficies son lectura/mutación/replay comercial; lectura/replay de trabajo; lectura de evidencia; timeline, calendar, query, search, export, document, ai_context; metadata, descarga y replay de objeto. Esta cobertura transversal no acredita automáticamente cada método público de cada adaptador.

## Regresión complementaria

`node scripts/run-h6-local-validation.mjs h6-008-regression`: [ejecución 22:28:31 UTC](../../tests/fixtures/h6-local-validation/h6-008-regression-2026-10-21T22-28-31-395Z/run.json), **41/41 PASS**, sin saltos. Reejecuta H0-006, H0-014 y H1-016 sin modificar sus tests históricos: límites F2, global closure, carreras, fallo parcial, SQL directo, objetos reales, enlace firmado todavía vigente, upgrade/rollback/reapply. Los límites de cada fixture histórico se mantienen; no convierten Auth sintética en real ni sustituyen la matriz nueva de cadena completa.

La primera comprobación TypeScript del borrador detectó dos errores del instrumento: llamada de evidencia con contexto agregado en vez de los dos argumentos exigidos y unión de headers incompatible. Se corrigieron usando las firmas existentes; el typecheck posterior y el definitivo pasan. No fueron defectos del producto. No se necesitó modificar `src/`, migraciones, contratos ni normativa.

## Límite que impide cerrar

[pending-TSK-H6-008-auth.md](pending-TSK-H6-008-auth.md) identifica archivos, ports ausentes, verificación de infraestructura, diferencia entre renovación del proveedor y actividad humana Core, diseño y casos pendientes. Falta un adaptador real Auth/MFA, su revocación integrada y la frontera de ingreso de servidor con origen e interacción acreditados. La composición actual no basta para afirmar PLAN-AUTH-002/003/006 global ni ausencia de alta pública del proveedor.

No se ha usado cuenta, credencial, backup, TOTP o autoridad real; no Hosted/Production, envíos, cobros o comunicaciones externas. La descarga del código público fijado de Storage y la lectura de documentación oficial solo prepararon/contrastaron herramientas de ensayo local. No se declaró ni activó un conector de negocio.

H6-015 permanece NOT STARTED. Su dependencia H6-008 no queda satisfecha; su expediente documental no autoriza restauración ni reentrada. ARCH-PENDING-002 y DM-PENDING-005 continúan OPEN.
