# Evidencia — TSK-H0-008

Estado: FAILED por defecto material abierto
Fecha de ejecución: 2026-09-16
Tarea: TSK-H0-008 — Verificar: Separar rol ordinario, migración y contexto transaccional
Entorno: Work Local Mac, PostgreSQL 17.11, repositorio `IAndresB/crm-huescaventura-os`, rama `main`
Commit base comprobado: `ef452459f477ac3c78b08595312e869770259d44`
Commit final: no creado; el criterio de cierre no se cumple

## 1. Alcance y método

Se inició V-DAT + V-MIG + V-EVI como comprobación independiente y adversarial de H0-007. La fuente exigía denegación por defecto, contexto establecido solo por servidor y que conocer los nombres de los GUC no concediese autoridad. La verificación se detuvo al confirmar un fallo material del modelo de confianza, conforme a la regla fail-fast de la autorización.

Fuentes contrastadas: Tasks TSK-H0-007/008 y §§2.2/2.3/6/7; Plan §§3.2/6.5/7.2, B01, C01/C03, V-DAT/V-MIG, PLAN-DEC-002/007, PLAN-AUTH-006; SPEC-FR-SEC-001/002/005, SPEC-FR-INT-002, AC-064/079, SPEC-NFR-002/004, DM-INV-050, SM-FORB-29, ARCH-DEC-002/004/005, P10, PT-11, G1, E1 y D015.

Datos: exclusivamente técnicos y sintéticos. PostgreSQL se ejecutó en clúster local efímero por socket Unix, sin TCP ni recursos remotos. El clúster y sus procesos fueron eliminados al terminar.

## 2. Hallazgo material H0-008-F01

| Fuente / requisito | Ataque | Expected | Observed | Resultado |
|---|---|---|---|---|
| Plan §6.5; SPEC-FR-SEC-002; AC-064; TSK-H0-008 F/G | Conexión SQL directa como `crm_h0_runtime`; ejecutar `set_config(..., true)` para `crm.identity_id`, `crm.identity_kind` y `crm.scope`; consultar una fila protegida de scope conocido | El runtime no puede convertir valores autodeclarados en contexto confiable; conocer los GUC no concede autoridad | PostgreSQL aceptó los GUC y RLS devolvió `probe-protected-008` con su proyección pública | **FAIL MATERIAL** |

Reproducción independiente observada:

1. Se aplicaron ambas migraciones H0-M01 desde clúster PostgreSQL 17.11 vacío.
2. La autoridad de migración insertó una fila sintética en `scope-protected-008`.
3. Una conexión directa como `crm_h0_runtime`, sin `withTrustedPostgresTransaction` ni contexto emitido por servidor, fijó los tres GUC mediante `set_config(..., true)`.
4. La misma transacción leyó `probe-protected-008|protected-value-008`.

La prueba mantenible `tests/integration/postgres-h0-008-verification.test.ts` expresa la obligación normativa como expectativa de cero filas. Con la implementación base falla porque obtiene la fila protegida.

Ejecución: `pnpm run test:postgres` lanzó 20 tests PostgreSQL: 19 PASS y 1 FAIL, precisamente `H0-008 knowing GUC names must not let runtime self-declare authority`. El resultado observado fue `[{ probe_id: 'probe-protected-008' }]` frente al esperado `[]`.

## 3. Causa y alcance

Las políticas RLS confían exclusivamente en GUC personalizados que el mismo rol `crm_h0_runtime` puede establecer. `set_config(..., true)` limita la duración a la transacción y evita filtración posterior, pero no acredita quién introdujo el valor. La marca privada de TypeScript protege la API de aplicación, no una conexión SQL directa con las credenciales runtime.

El defecto afecta deny-by-default, contexto confiable, conexión directa, RLS, grants+RLS, C01 y C03: cualquier poseedor de la identidad de conexión runtime puede seleccionar el scope deseado y utilizar la superficie concedida. No se ha demostrado BYPASSRLS ni privilegio administrativo; el fallo consiste en satisfacer fraudulentamente el predicado de la política.

## 4. Corrección y decisión

Correcciones realizadas: ninguna. Una corrección válida necesita un canal de confianza que el rol ordinario no pueda fabricar —por ejemplo, una identidad/capacidad de conexión separada o contexto autenticado criptográficamente— y revisar su composición, secretos, roles y pruebas. Elegirlo cambia materialmente el modelo de seguridad y no es una corrección pequeña e inequívoca autorizada para H0-008.

Resultado: **TSK-H0-008 FAILED**. H0-007 conserva su registro histórico de implementación, pero su aislamiento normativo no queda verificado y mantiene abierto H0-008-F01. No procede commit ni push de cierre.

## 5. Matriz parcial y controles no concluidos

| Área | Observado | Resultado |
|---|---|---|
| Migraciones desde vacío | Aplicación local real exitosa hasta reproducir el ataque | PASS parcial |
| Separación nominal migración/runtime | Roles distintos observados | PASS parcial |
| Contexto/GUC autodeclarado | Runtime fabrica identidad/scope y obtiene fila | FAIL MATERIAL |
| RLS | Política activa, pero acepta contexto fabricado por runtime | FAIL MATERIAL |
| Grants + RLS | Grants limitan columnas/DML, pero la lectura concedida queda accesible con scope autodeclarado | FAIL MATERIAL |
| Conexión directa | Barrera de aplicación eludida por SQL directo | FAIL MATERIAL |
| C01/C03 | La composición normal parametriza y transacciona, pero la base no distingue contexto servidor de contexto runtime fabricado | FAIL MATERIAL |
| Roles, escaladas restantes, commit/rollback/error/pool, cliente hostil, canarios y batería completa | No concluidos tras activarse la parada obligatoria | NOT COMPLETED |

Las comprobaciones de cierre `pnpm install --frozen-lockfile`, audit, typecheck, lint, tests generales y build no se reejecutaron después del hallazgo: no pueden convertir en satisfactorio un defecto material abierto y la autorización ordena detenerse. Sus resultados de H0-007 no se reutilizan como evidencia de H0-008.

## 6. Limitaciones y capacidades no acreditadas

No se acreditan aislamiento completo de roles/contexto, ausencia de escalada por todas las vías, C01/C03 normativos, Auth, CRM Actor humano, sesiones, MFA/TOTP, recuperación, Supabase hosted, pooler remoto, Production/Staging, credenciales/rotación, esquema comercial, historia/idempotencia/intención durable, T01–T11, proveedores, jobs, UI o deploy.

PLAN-AUTH-006 permanece **PENDING / NO EJECUTADA globalmente**. TSK-H0-009/010 y TSK-H0-005/006 permanecen **NOT STARTED**.
