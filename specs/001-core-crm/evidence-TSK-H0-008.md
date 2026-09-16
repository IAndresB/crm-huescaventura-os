# Evidencia — TSK-H0-008

Estado vigente: COMPLETED — formalmente verificado en alcance local (véase §8)
H0-008-F01: CLOSED tras reverificación formal de la corrección F1
Los campos de fecha/base/commit siguientes registran la ejecución fallida original; el cierre vigente y su base están en §8.
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

## 8. FORMAL REVERIFICATION — 2026-09-16

Se conserva literalmente el rótulo solicitado en la autorización. **Fecha real de ejecución/cierre: 2026-09-17, Europe/Madrid.** Las secciones 1–6 son el fallo histórico; §7 es la implementación correctiva, no esta reverificación. Sus estados y resultados históricos no se borran ni se toman como prueba suficiente.

### 8.1. V-EVI: base, autoridad, entorno y método independiente

- Tarea: TSK-H0-008, reverificación formal exclusivamente local autorizada sobre **`c208b9fb45bf337a62c5b518d86d9b42db267949`**. Base exacta comprobada con fetch: HEAD=origin/main, main, árbol limpio, remoto `git@github.com:IAndresB/crm-huescaventura-os.git`.
- Commit de cierre: el único commit `test(h0): formally verify transaction capability isolation` que incorpora esta sección; recuperable mediante `git log -1 --format=%H -- tests/integration/postgres-h0-008-reverification.test.ts`. Last Approved Commit sigue `da7b71a3f2962093b7422899ab2193f29ae3c4e0` (D037).
- Entorno: Work Local, mismo Mac arm64/macOS 26.5.2; PostgreSQL 17.11 nativo Postgres.app; Node 24.21.0; pnpm 11.19.0; Postgres.js 3.4.9; Next.js 16.3.5; TypeScript 7.0.2. Clústeres efímeros por socket Unix, sin TCP, exclusivamente datos sintéticos; ninguna dependencia o recurso remoto nuevo.
- Fuentes: Constitution P10/P12/P13/P18/P19; D037 APPROVED §§1–12; Tasks H0-007/008, §§2.2/2.3/6/7; Plan §§3.2/6.5/7.1–7.2, PLAN-DEC-002/007/008, B01, C01/C03, PT-11; SPEC-FR-SEC-001/002/005, SPEC-FR-INT-002, AC-064/079/082, SPEC-NFR-002/004; DM-INV-050, SM-FORB-29/G1, E1, ARCH-DEC-002/004/005 y D015. Las obligaciones humanas/Auth compartidas con H0-005/006/H6 conservan esas verificaciones futuras según Tasks §2.3; no se simulan como capacidades implementadas.
- Método: V-DOM/V-DAT/V-MIG/V-EVI, inspección crítica del código y del catálogo efectivo, SQL M2 directo y reejecución real de suites. Se añadió una prueba independiente con codec, binding y firma de fixture propios: no importa el emisor/codec productivo ni el fixture correctivo. K solo la conoce el emisor de ensayo autorizado; los ataques usan conexiones runtime. Un fallo en cualquiera de sus casos interrumpe los restantes. El último caso atraviesa además boundary → contratos → adaptador real.
- Revisión técnica auxiliar: [PostgreSQL 17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html) y [RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html). Las guías de privilegios/RLS se usaron como checklist, no para sustituir D037 ni introducir Auth/hosted. Ningún cambio productivo, de migración, de contrato, de dependencia o de decisión fue necesario.

### 8.2. Evaluación de la evidencia anterior

Los 19 tests H0-007 no bastan: algunos miran GUC antiguos que ya no se establecen, y uno intenta la antigua función retirada. No se usaron esos PASS aislados para acreditar contexto F1 ni denegación del ejecutor vigente. Se contrastaron con A26 (envelope F1, mismo PID, commit/rollback/error), ataques a funciones actuales y la prueba independiente de GUC persistente/token previo. Las seis mutaciones originales no cubrían todos los claims: ahora se alteran uno por uno los 21 campos, manteniendo el MAC original.

El test original `postgres-h0-008-verification.test.ts` fue inspeccionado y ejecutado también individualmente, sin editarlo: mantiene los tres GUC falsificados, la fila objetivo y el esperado de ninguna fila. Solo convierte SQLSTATE **42501** en denegación segura; errores de conexión/migración u otros códigos no pasan. Los catálogos y las lecturas positivas descartan que el PASS proceda de una superficie inexistente.

### 8.3. Matriz normativa y ataques observados

| Fuente / control | Ataque o caso independiente / reutilizado críticamente | Expected | Observed / resultado |
|---|---|---|---|
| D037.1–2; P10; SEC-002; V-DAT 1–10 | SELECT/INSERT/UPDATE/DELETE, CREATE SCHEMA/TABLE/ROLE, ALTER ROLE/TABLE/FUNCTION/POLICY, DROP, GRANT/REVOKE, cambio de owner, cuatro SET ROLE | Denegación efectiva M2, sin administración ni Core directo | 42501 en cada ataque; runtime LOGIN sin SUPERUSER/BYPASSRLS/CREATEDB/CREATEROLE/REPLICATION; cierre recursivo de membresías vacío. PASS |
| D037.2/11; V-DAT 11–15 | Catálogo, ACL PUBLIC, genérico, executor intenta claves/columna privada; verifier intenta Core | Autoridades separadas y mínimo privilegio | Table owner separado NOLOGIN; executor/verifier NOLOGIN sin BYPASSRLS; executor sin claves; verifier sin Core; PUBLIC sin EXECUTE F1; genérico sin CONNECT. ENABLE/FORCE RLS true. PASS |
| F01; D037.1/4/11; V-DAT 16–20 | GUC identity/kind/scope, flag verified, helpers y ejecutores sin MAC; nombres/definiciones conocidos | Sin autoridad autodeclarada ni signing oracle | F01 original PASS; helpers/key store inaccesibles; ejecutores rechazan NULL; solo dos funciones estrechas ejecutables. No función SQL que firme con K o acepte E/B del caller. PASS |
| D037.3/7; capability/codec | Mutar todos los 21 campos con MAC anterior; además claims incompatibles firmados por fixture | Cada alteración invalida; no downgrade | 21/21 mutaciones denegadas; versión, kind, purpose, audience, generation, db/start/xid/PID/login incompatibles denegados. PASS |
| D037.3/7; codec | MAC NULL/vacío/aleatorio/31/33 bytes; payload/input truncado, trailing byte, campos extra/ausentes, UTF-8 inválido, strings >16 KiB, buffer >64 KiB; firma válida de malformaciones | Fail closed incluso sin depender únicamente de MAC inválido | 42501; string UTF-8 válido de exactamente 16 KiB aceptado; límites superiores rechazados. NUL/surrogates rechazados también en codec servidor. PASS |
| D037.4/10; R1/R2 | Capability copiada a otra conexión; mismo PID con xid nuevo; commit/rollback/error/pool max1; token/envelope residual de sesión | No heredar autoridad | Copia denegada; PID igual y xid distinto comprobados; valores residuales no habilitan función ni SELECT. PASS |
| D037.3/9/10; R3–R7 | Scope/operación/input distintos; manifest reordenado, truncado o ampliado; C01 repetida; segunda C03; savepoint | Solo alcance/material autorizado; una aplicación C03 superviviente | Fuera de scope: 0 filas; cambio de operación/input: 42501; orden/manifest alterado: 42501; C01 repetida válida; C03 repetida denegada; rollback-to-savepoint revierte consumo y efectos. PASS |
| D037.6; PR-F-01 | Inspección fuente y pg_proc, 256 mutaciones de bit del MAC | Double-HMAC fresco + 32 XOR/OR, sin alternativa | B interna gen_random_bytes(32), dominio exacto, L/R con B, loop 0..31; sin igualdad final E/S, random(), fallback ni retorno E/B/L/R/K. Mutaciones rechazadas. PASS estructural/funcional; no benchmark ni garantía CPU absoluta |
| D037.5; keys | Longitud 31 bytes al provisionar, key desconocida/revocada, K1/K2 y retirada, intento lectura/modificación | K32 y selección exacta, sin fallback | CHECK rechaza longitud; unknown/revoked denegadas; rotación con solapamiento y retirada PASS; clave no aparece en definiciones SQL accesibles. PASS |
| C01; D037.8; SEC-001/002; AC-064; G1/E1 | Boundary/contrato/adaptador real; scope A/B, ID inexistente, valor SQL hostil, contexto falso/ausente, campos de autoridad | Proyección mínima y denegación de input/autoridad falsa | Solo probeId/publicValue y provenance/certainty; otro scope/ID: undefined sin fuga; valor SQL no altera consulta; input/contexto falsos rechazados. PASS local técnico, no Auth humano |
| C03; D037.9; Plan 7.2 | Manifest de dos escrituras; fallo primero/intermedio; rollback; consumo; firma/input material | Unidad completa o ninguno, sin CRUD genérico | Orden de IDs esperado; ninguna escritura parcial; consumo previo a efectos, no manipulable por runtime, revertido con efectos. Sin historia/resultado/intención durable. PASS en subconjunto técnico |
| D037.7 | Caducidad real dentro del ejecutor: trigger efímero demora 0,6s tras admisión con 0,5s restante | Error y rollback, nunca éxito parcial | Witness de secuencia acredita entrada en ejecutor; 42501 tras demora, fila ausente y consumo sin incremento. Trigger/función/secuencia solo de fixture eliminados. PASS |
| D037.11; SECURITY DEFINER/RLS | proconfig efectivo, search_path hostil, pg_temp, shadow/default overload, ALTER, helper indirecto; fixture executor consulta más amplio/escribe fuera de manifest | Resolución fija y RLS efectiva aun con grants | Cinco funciones F1/API esperadas, sin defaults/overloads adicionales; search_path=pg_catalog,pg_temp; owners correctos, EXECUTE PUBLIC revocado; creación/reemplazo hostil denegados; RLS restringe fila/scope/input aunque executor tenga grants. PASS |
| SEC-005; AC-082; P12; errores | Error SQL real por PK duplicada con canarios y K efímera representada como dato de prueba; boundary/contrato/adaptador/diagnósticos | No secretos ni detalles SQL públicos | Resultado rechazado saneado y eventos sin canarios/K; message/detail/hint/where sanitizados en suite SQL. No se imprime ni versiona K. Driver interno conserva parámetros del caller: no se serializa públicamente. PASS |
| V-MIG; P13; D037.2 | Secuencia desde vacío, upgrade con dos filas, segunda migración fallida por schema preexistente, rollback y reaplicación | Historia intacta, error transaccional, autoridad distinta de runtime | Datos preservados; crm_f1 no queda parcialmente creado; forward completo posterior cierra SELECT. F1 roles aplicado por CREATEROLE no superuser; schema por migration no superuser; runtime no migra. PASS |
| D037.10; A27 | Terminar realmente backend después de ejecutar operación y antes de COMMIT | E4/pending, sin retry ciego | Una ejecución, E4; observador admin ve rollback en ESTE ensayo. No prueba todo fallo de red ni reconciliación tras commit. PASS acotado |
| PLAN-DEC-002/008; ARCH-DEC-002/004/005; B01; INT-002 | Inspección imports, composición, parametrización, contratos y lint | Transporte adapta; dominio/application sin driver/SQL | Fronteras PASS; SQL/crypto en infraestructura, composición servidor; application/domain sin cambio. PASS |
| AC-079; NFR-004; V-EVI | Entorno y datos | Separación local, sin Production/hosted | Solo clústeres locales desechables, datos sintéticos y claves en memoria; sin recursos remotos. PASS |

Matriz A01–A30: los 30 identificadores fueron reejecutados en la suite correctiva, inspeccionados y complementados por los casos anteriores. Todos PASS en su alcance local; A27, comparator y exposición de errores mantienen expresamente sus límites. RLS no sustituye grants ni autorización; se prueba como capa adicional efectiva sobre executor.

V-MIG — recuperación: si el forward falla, se conserva el estado anterior, que en H0-M01 contiene F01. **No es seguro servir tráfico con esa actualización incompleta**; no se acredita que un rollback convierta H0-M01 en seguro. La evidencia §7.1 ya exige no habilitar runtime hasta completar el segundo forward. No hay down-migration ni fallback automático que reactive el acceso tras F1. El ensayo verificó rollback íntegro y posterior aplicación válida; despliegue/recuperación hosted continúa pendiente.

### 8.4. Comandos, resultados y conservación

| Comando | Observed |
|---|---|
| git status / branch / remote / fetch / rev-parse / diff --check inicial | Base exacta, main, remoto correcto y árbol limpio: PASS |
| pnpm install --frozen-lockfile | PASS, already up to date; aviso de pnpm 12.4.2 disponible, **no actualizado** |
| pnpm audit --prod | PASS, ninguna vulnerabilidad conocida |
| pnpm run typecheck | PASS |
| pnpm run lint | PASS, Import boundaries |
| pnpm test | PASS 27/27 |
| POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres | PASS 57/57: 46 anteriores + 10 casos independientes + 1 contenedor fail-fast |
| Misma variable + node --test --experimental-strip-types tests/integration/postgres-h0-008-verification.test.ts | PASS 1/1, F01 original ejecutado también expresamente |
| pnpm run build | PASS, Next.js; sin nueva UI/ruta de negocio |
| git diff --check | PASS |

Total del runner: **84 PASS, 0 FAIL, 0 skipped**; son 83 casos y un contenedor, no 84 obligaciones distintas. La ejecución individual F01 no se suma otra vez. No se modificaron los tests anteriores para hacerlos pasar, ni src/, migraciones, D037, package.json o lockfile. El nuevo archivo es exclusivamente de verificación. Escaneo de patrones sensibles y revisión de diff: sin credenciales/claves reales ni prototipos productivos; canarios sintéticos permitidos. Recursos temporales y conexiones se cierran en finally; comprobados sin clústeres/procesos/directorios supervivientes.

### 8.5. Veredicto, limitaciones y siguiente puerta

**TSK-H0-008 COMPLETED en su alcance formal local. H0-008-F01 CLOSED. F1 IMPLEMENTED AND FORMALLY VERIFIED LOCALLY.** Ningún nuevo defecto material encontrado; ninguna corrección productiva realizada en este bloque. Se cubren los 16 criterios de cierre mediante catálogo, ataques reales, integración y regresión. H0-007 conserva COMPLETED histórico; su fallo posterior fue corregido por c208b9f y reverificado aquí.

No se acredita seguridad criptográfica incondicional, DoS, robo de K/proceso servidor/administración, acceso humano/Auth/MFA/recuperación, Data API futura, todas las contingencias de COMMIT, historia/idempotencia/intención durable, H0-009, capacidad/performance de producción ni housekeeping automático del consumo técnico. Restauración/clonación exige nueva generation antes de servir; no se ha ensayado recuperación hosted. La custodia de logs/backups/secretos, TLS, roles efectivos de Supabase, pgcrypto y afinidad de pooler remoto siguen pendientes. **PLAN-AUTH-006 PENDING / NO EJECUTADA globalmente**, sin ejecución hosted en este bloque.

H0-005/006/009/010 y H1–H6 siguen NOT STARTED. D037 APPROVED y Last Approved Commit intactos. Próximo bloque por dependencias: H0-009, únicamente tras nueva autorización humana; hosted/PLAN-AUTH-006 requiere autorización específica antes de depender de sus capacidades. Nada de ello se inicia con este cierre.
