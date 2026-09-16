# Evidencia — TSK-H0-008

Estado: FAILED/BLOCKED — REVERIFICATION REQUIRED
H0-008-F01: CORRECTION IMPLEMENTED / PENDING FORMAL REVERIFICATION (véase §7)
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

## 7. V-EVI — implementación correctiva F01 conforme a D037

Fecha: 2026-09-16. Autorización: implementación correctiva local exclusivamente; no ejecución ni cierre de la reverificación formal TSK-H0-008. Las secciones 1–6 conservan la evidencia histórica fallida, incluida la observación inicial de 19 PASS / 1 FAIL. No se reinterpreta H0-007 como no ejecutada.

Base comprobada: `da7b71a3f2962093b7422899ab2193f29ae3c4e0`, main, HEAD=origin/main, árbol limpio, remoto `git@github.com:IAndresB/crm-huescaventura-os.git`. Commit correctivo: el único commit que incorpora esta sección y las migraciones F1, identificable en Git por `fix(h0): authenticate postgres transaction capabilities`. Last Approved Commit permanece en la aprobación D037, no en el commit correctivo.

Fuentes: Constitution P02/P06/P10/P12/P13/P18/P19; D037 APPROVED íntegra; Tasks TSK-H0-007/008; C01 AuthorizedQueryPort y C03 TransactionPort; evidencias H0-007/008. Diagnóstico §§12/13 como evidencia técnica, sin autoridad normativa. No se altera D037, Architecture, Plan, SPEC, contratos application/domain ni las migraciones publicadas H0-M01.

Entorno: mismo Mac, PostgreSQL 17.11 nativo Postgres.app, Postgres.js 3.4.9, Node 24.21.0, pnpm 11.19.0, Next.js 16.3.5, TypeScript 7.0.2. Clústeres efímeros independientes, socket Unix, sin TCP; datos y claves sintéticos. Sin dependencias nuevas, Supabase CLI, ORM ni recursos remotos. El mecanismo usa Node crypto, PL/pgSQL y pgcrypto 1.3.

### 7.1. Migraciones forward, autoridades y custodia

| Migración | Autoridad y operación | Resultado local |
|---|---|---|
| `202609160000_h0_f1_authorities.sql` | Administración separada con CREATEROLE: crea tres NOLOGIN y asigna SET/INHERIT/ADMIN exclusivamente a migration; verifica atributos/membresías runtime sin intentar modificar SUPERUSER | PASS; ejecutada también por administrador no SUPERUSER |
| `202609160001_h0_f1_capabilities.sql` | `crm_h0_migration`: crea estructuras sin secretos, revoca SELECT de tabla **y de columnas**, retira función/policies antiguas, transfiere ownership y crea funciones/ACL/policies F1 | PASS como migrador no SUPERUSER |

Las suites aplican la secuencia histórica desde clúster vacío. La nueva suite inserta datos H0-M01 antes del endurecimiento y comprueba que sobreviven con la proyección mínima; no se reescribe H0-M01. Cada migración es transaccional. Recuperación: un error revierte su propia migración; no desplegar runtime mientras falte la segunda. No hay down-migration que reactive el defecto; una corrección posterior debe ser forward. Roles del primer paso pueden existir si falla el segundo, pero no habilitan F1 por sí solos.

| Rol | Facultades finales del paquete | Denegaciones observadas |
|---|---|---|
| MIGRATION `crm_h0_migration` | Administra objetos; autoridad privilegiada separada, membresías explícitas en los tres owners técnicos | Nunca es conexión ordinaria |
| RUNTIME `crm_h0_runtime` | LOGIN; CONNECT; USAGE crm_api; EXECUTE read_probe/apply_probe_batch; catálogos públicos para binding | Sin SELECT/DML Core, key store, DDL, ownership, BYPASSRLS ni membresías; SET ROLE privilegiados denegado |
| TABLE OWNER `crm_h0_table_owner` | NOLOGIN; owner access_probe, keys y consumption | Distinto de executor/runtime |
| VERIFIER `crm_h0_verifier` | NOLOGIN; SELECT keys; owners de helpers; acceso a primitivas crypto | Sin acceso Core/DML ordinario |
| EXECUTOR `crm_h0_executor` | NOLOGIN; SELECT/INSERT de columnas públicas/context_scope, INSERT consumption, helpers privados | No owner de tablas; sin BYPASSRLS; sin claves/columna privada |
| PUBLIC / genérico | Sin acceso implícito a interfaz F1 ni tablas/schemas privados | EXECUTE de helpers/interfaz revocado; genérico sin CONNECT |

Key store: `crm_f1.keys`, clave binaria de 32 bytes, key_id exacto, audience/generation, purposes, enabled y ventanas valid_from/valid_until. No fallback ni claves en migración. El fixture genera K con CSPRNG en memoria e inserta por conexión administrativa separada; la copia del emisor permanece en memoria servidor. No atraviesa la conexión runtime. Rotación ensayada con coexistencia de dos key_id, cambio de emisor, retirada y rechazo de la clave revocada. Generación/keys nuevas antes de servir un entorno restaurado o clonado sigue siendo obligación operacional. Logs/backups/WAL administrativos requieren custodia propia.

`pgcrypto` es extensión trusted, pero sus funciones C pertenecen al bootstrap PostgreSQL: el instalador no superusuario no puede reescribir sus ACL. Se restringe USAGE de `crm_crypto` a la autoridad verificadora y migración; esas primitivas requieren una clave explícita y no acceden a K almacenada. Los helpers F1 que sí acceden a K tienen EXECUTE privado explícito. No se necesitó superuser para la migración F1 de schema ni para su uso. Compatibilidad técnica consultada en [pgcrypto PG17](https://www.postgresql.org/docs/17/pgcrypto.html) y [CREATE FUNCTION PG17](https://www.postgresql.org/docs/17/sql-createfunction.html); hosted conserva su ensayo pendiente.

### 7.2. Codec, binding, comparación y flujo

Codec v1 concreto: secuencia ordenada de campos, cada uno `U32BE(byteLength) || UTF8(value)`. Todos son strings explícitos; números públicos se emiten en decimal canónico, sin pérdida de precisión. No JSON firmado, NULL, NUL, normalización Unicode, surrogates sin pareja, campos extra ni trailing bytes aceptados. Máximo payload/input 65.536 bytes cada uno; máximo string 16.384 bytes. MAC separado, exactamente 32 bytes. Los offsets binarios del diagnóstico no estaban congelados por D037; se conserva su separación de dominios y todos los claims aprobados.

Payload, orden exacto de 21 campos: `CRM-H0F1`, protocol_version `1`, key_id, audience, generation, database OID, postmaster start en microsegundos Unix, xid8 decimal completo, backend PID, login, identity, identity_kind, purpose, scope, operation, resource, action, SHA-256 hex del input, not_before en microsegundos, expires_at, capability_id. El verifier compara binding con valores reales PostgreSQL, login=session_user=crm_h0_runtime, READ COMMITTED y configuración privada por key_id. Comprueba plazo de 30.000.000 microsegundos contra clock_timestamp en admisión, políticas y final; no promete deadline de COMMIT ni cancelación retroactiva MVCC.

Input C01: `CRM-INP1`, `C01`, probeId. Input C03: `CRM-INP1`, `C03`, operationId, `true`, `true`, seguido de triples ordenados kind/probeId/publicValue. Su longitud delimita el manifest completo. expectedVersion/intent y campos desconocidos se rechazan, no se omiten. PublicValue vacío es admisible; IDs vacíos no. El ejecutor rehasha y ejecuta exactamente esos bytes. Scope/IDs usan colación C en autorización de filas.

Emisión: contexto técnico servidor validado → BEGIN READ COMMITTED en conexión runtime reservada → obtener binding real → canonicalizar input/claims → HMAC en memoria servidor → función estrecha parametrizada → verificación/RLS → COMMIT. No función SQL de firma, claims HTTP libres ni criptografía en application/domain. La marca TypeScript no se presenta como protección frente a SQL directo.

Comparador D037: E=HMAC(K,payload); S=MAC recibido; B=gen_random_bytes(32) fresca por invocación; D=ASCII `CRM-H0F1-CMP-v1`; L=HMAC(B,D||E); R=HMAC(B,D||S); FOR 0..31, acumulador OR de XOR; acepta solo cero. B/E/L/R/K no se exponen. VOLATILE/PARALLEL UNSAFE, sin igualdad directa E/S ni random(), early return por prefijo o fallback. Se probaron 256 mutaciones de bit del MAC y se inspeccionó la definición ejecutada; no se afirma certificación constant-time CPU ni observación de B secreta.

### 7.3. C01/C03, RLS y consumo

C01 mantiene AuthorizedQueryPort y devuelve solo probeId/publicValue/provenance/certainty. C03 mantiene TransactionPort, aplica un manifest completo y solo devuelve resultado applied después de COMMIT confirmado. Error SQL revierte la unidad; pérdida de conexión tras respuesta de operación y antes de confirmar COMMIT devuelve pending/E4, sin retry automático. El experimento A27 provocó terminación real de backend: el observador administrativo comprobó rollback, mientras el adaptador mantuvo correctamente incertidumbre desde su propio punto de vista. No acredita reconciliación tras COMMIT confirmado pero respuesta perdida.

RLS ENABLE/FORCE permanece efectiva sobre access_probe, con policies exclusivamente para executor. Envelope/input/MAC se transportan mediante GUC locales, pero cada policy vuelve a autenticar y limita scope, probeId y valores del manifest. No quedan políticas que acepten crm.identity_id/identity_kind/scope planos. Un fixture temporal de pruebas, propiedad del executor, intentó SELECT más amplio e INSERT fuera del manifest: RLS los restringió aunque el executor tuviera grants. El fixture fue eliminado y no aparece en migraciones.

Las funciones SECURITY DEFINER tienen owner NOLOGIN separado, search_path pg_catalog/pg_temp, referencias cualificadas, sin SQL dinámico del caller, sin temporales confiados, sin EXECUTE PUBLIC, sin grants de ALTER/REPLACE runtime. Limpian envelope local antes de devolver; excepción revierte cambios locales por subtransacción. Un baseline GUC antiguo tampoco autoriza una transacción nueva por binding. Errores públicos son fijos; el driver bruto conserva parámetros suministrados por el caller y nunca se serializa a resultado/diagnóstico público.

`crm_f1.consumption` tiene unicidad por generation/database/xid/capability_id y expiración. Se inserta antes de efectos y se confirma/revierte con ellos. Runtime no puede leerla/borrarla; segunda aplicación superviviente denegada, rollback-to-savepoint revierte juntos marca y efectos. No hay historia, resultado/idempotencia/intención durable ni H0-009. Limpieza futura exclusivamente administrativa de marcas de transacciones terminadas y caducadas; ningún job ni interfaz ordinaria de borrado. La ausencia de housekeeping automático es una limitación operacional, no una vía de replay.

### 7.4. Matriz de pruebas de implementación

| ID / ataque | Expected | Observed / resultado |
|---|---|---|
| A01 identity; A02 scope; A03 operation; A04 fingerprint; A05 environment; A06 key_id modificados | Rechazo | 42501, PASS cada ID |
| A07 capability vacía/malformada; A08 MAC aleatorio/longitud incorrecta | Fail closed | NULL/0/31/33 bytes, bytes inválidos y 256 mutaciones rechazados, PASS |
| A09 transacción previa; A10 otra conexión; A24 capability copiada | Sin autoridad fuera de binding | Copia explícita válida rechazada en otra conexión y nuevo xid, PASS |
| A11 otro scope; A12 otra operación; A30 input material distinto | Sin ampliación | Ausencia de fila fuera de scope o rechazo por MAC/fingerprint/action, PASS |
| A13 replay C03; A25 savepoint/rollback | Una aplicación superviviente | Consumo impide repetición; rollback revierte efectos y consumo conjuntamente, PASS |
| A14 verifier directo; A15 executor sin capability; A16 leer K; A17 modificar K; A18 SET ROLE | Denegados | 42501, PASS cada ID |
| A19 GUC falsos/flag verified | Sin autoridad | Acceso directo denegado y función sin capability rechazada, PASS |
| A20 search_path; A21 temp homónimo; A22 function shadow | No alterar resolución/autorización | Función válida conserva resultado; creación hostil denegada, PASS |
| A23 canarios | Sin fuga pública | SECRET_CANARY_H0_008/TOKEN_CANARY_H0_008 ausentes de errores públicos/message/detail/hint/context, PASS |
| A26 commit/rollback/error/pool max1 | Sin heredar autoridad | Mismo PID en secuencia; envelope vacío y token previo rechazado, PASS |
| A27 pérdida de conexión antes de COMMIT | Incertidumbre sin retry | pending/E4, una sola operación intentada; rollback observado aparte, PASS local acotado |
| A28 expiración/not-before futuro | Rechazo | MAC válido pero ventana vencida/futura denegada, PASS |
| A29 revocación/rotación | key_id exacto, sin fallback | Solapamiento K1/K2, retirada de K1 y key desconocida comprobados, PASS |

Controles adicionales PASS: roles/ownership/membresías, executor sin K/columna privada, verifier sin Core, PUBLIC sin EXECUTE F1, RLS efectiva, DML directo prohibido, migraciones desde vacío y estado H0-M01 con datos, C01 mínimo/scope A/B, C03 fallo primera/intermedia/rollback, inyección SQL como valor parametrizado, límites codec y campos hostiles/unsupported.

Test original F01 conservado: mantiene nombre, GUC falsificados, SELECT objetivo y aserción final de ninguna fila. Se aplica forward después de sembrar H0-M01 y solo SQLSTATE 42501 se interpreta como denegación segura; cualquier otro fallo continúa fallando el test. No se cambió el esperado para aceptar una fila ni se eliminó el ataque.

### 7.5. Comandos y resultado

| Comando | Expected | Observed |
|---|---|---|
| pnpm install --frozen-lockfile | Reproducible sin cambios | PASS; already up to date |
| pnpm audit --prod | Sin vulnerabilidades conocidas | PASS; ninguna conocida |
| pnpm run typecheck | Tipos correctos | PASS |
| pnpm run lint | Fronteras conservadas | PASS |
| pnpm test | Regresiones generales | PASS 27/27 |
| POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres | Regresiones PostgreSQL/F1 | PASS 46/46: 19 H0-007 + 1 F01 original + 26 correctivos |
| pnpm run build | Build servidor | PASS; /health, sin UI ni endpoints de negocio nuevos |
| git diff --check | Sin errores de diff | PASS |

Total: **73 tests PASS, 0 FAIL, 0 skipped**. Los subcasos agrupados no se inflan como tests independientes. Estos resultados son de implementación/regresión, no cierre normativo H0-008.

La comprobación adicional de ejecución de la migración por runtime deniega con SQLSTATE 42501 explícito. Dos invocaciones de repetición no llegaron a ejecutar PostgreSQL por falta de POSTGRES_H0_BIN/ruta incorrecta; se corrigió la invocación a la ruta anterior, sin instalar nada. Se retiraron los directorios vacíos de esos arranques fallidos; la repetición completa posterior pasó.

Incidencias de desarrollo corregidas: sintaxis CASE en PL/pgSQL; intentos no efectivos de ACL sobre funciones C propiedad bootstrap; GUC proconfig rechazado al transferir owner no superusuario (sustituido por limpieza explícita transaccional); ALTER NOSUPERUSER redundante que exigía superuser (sustituido por verificación de atributos); aislamiento del test destructivo A27, que dejaba una conexión terminada en el pool usado por el caso siguiente. La última batería completa no emitió esos warnings. No se relajaron D037 ni las denegaciones.

Revisión de secretos: no claves/contraseñas/connection strings reales versionadas; solo generación en memoria y canarios sintéticos. Procesos/clústeres/funciones de fixture se detienen y eliminan al finalizar. No se creó recurso externo ni se instaló dependencia nueva.

### 7.6. Estado y límites

**H0-008-F01: CORRECTION IMPLEMENTED / PENDING FORMAL REVERIFICATION. TSK-H0-008: FAILED/BLOCKED — REVERIFICATION REQUIRED.** H0-007 mantiene su histórico. D037 sigue APPROVED sin cambios; PR-F-01 CLOSED técnicamente. H0-005/006/009/010 NOT STARTED. PLAN-AUTH-006 PENDING globalmente.

Pendiente: nueva autorización para reverificación adversarial formal completa; compatibilidad Supabase hosted real (roles/ownership/pgcrypto/ACL, pooler transaction mode, afinidad, TLS, logs/backups, claves/rotación, restauración/generación, límites/performance). No se acredita Auth, identidad humana, sesiones, MFA, RLS de Data API futura, Staging/Production, historia/idempotencia/intención durable ni reconciliación de resultado incierto. Robo de K, proceso servidor o administración comprometidos quedan fuera de M2. A27 no simula todos los fallos posibles de red; el comparador no ofrece garantía microarquitectónica absoluta.
