# TSK-H0-012 — Verificación formal independiente local

Estado vigente tras la nueva reverificación: **H0-012-F02 OPEN — MATERIAL / ALTA**; **H0-012-F01 FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION**, sin cierre porque la matriz completa no pasa. **TSK-H0-012 sigue FAILED / NOT COMPLETED**. Se conservan por separado el primer FAILED, la corrección focal y el segundo FAILED registrado al final.

## V-EVI / preflight y orden de trabajo

Base probada: `efe217be79157902a8b3c148718ef81e6dfaec08`. Rama main, remoto `IAndresB/crm-huescaventura-os`, HEAD=origin/main y árbol limpio al comenzar. Solo PostgreSQL local efímero, identidades/datos sintéticos. Supabase Staging fuera de alcance.

Esta matriz se redacta antes de inspeccionar en esta ejecución M04, adaptador, codec, composición, tests/evidencia H0-011. El historial de la conversación contiene la implementación anterior; sus conclusiones no son oráculo. Los expected siguientes proceden de fuentes APPROVED, no de assertions existentes. Estado inicial de todas las filas: NO EJECUTADA.

Fuentes leídas selectivamente: Tasks §2.2–2.3, fichas H0-011/012 y §5; Plan B01/B08, §7.1 C02/C03/C05, §7.2 T08, §8; SPEC §16 HA-001–005, §18 CONC-002, §19 E1/E2/E4, §24.3 AC-053–056; State Machines §2.1 G1–G6 y §14.3 SM-HA-01–03; D009, D016, D038 completa.

## Matriz normativa fijada antes de inspeccionar implementación

Cada evidencia de persistencia requiere consulta posterior desde otra conexión; denegación no se acredita únicamente mediante excepción del adaptador.

| ID | Requisito / fuente exacta | Amenaza y setup sintético | Expected previo | Evidencia necesaria |
|---|---|---|---|---|
| R01 | HA-001/005; D009/D016; SM-HA-01 | Propuesta IA, credencial técnica y decisión sin humano | IA no aprueba; solo autoridad humana vigente decide | Denial y ausencia decisión/reserva |
| R02 | HA-001; SM-HA-01 | Propuesta pending y otra rejected; intentar reservar/intentar | Ningún efecto autorizado | Filas y resultados SQL |
| R03 | HA-003; AC-053 | Aprobar sin ejecutar | Decisión trazable, cero intento/success/confirmación externa | Conteos y vínculos |
| R04 | HA-001/002; Plan §8 | Material con acción, versión/contenido, destinatario, importe, condiciones, alcance, efecto | Todos forman autoridad exacta; ausencia inequívoca | Material persistido y comparación independiente |
| R05 | HA-002; AC-054; SM-HA-02 | Mutar cada componente tras aprobación | Denegar variante; original intacto; nueva revisión necesaria | Cada sustitución y snapshot histórico |
| R06 | HA-002; V-DOM | Reordenar propiedades, UTF-8/Unicode, vacío/ausente/desconocido, límites y byte alterado | Equivalencia solo canónica inequívoca; ninguna colisión semántica | Vectores diferenciales y denials |
| R07 | T08; HA-004 | Sustituir ID/material/scope de parte | Solo parte exacta cubierta reservable | Vínculos parte/material/efecto |
| R08 | AC-054; HA-002; Tasks H0-011/012; SM G2 | Evidencia caducada, no verificable y luego comprobación vigente autorizada | Sin evidencia actual se bloquea parte dependiente; se debe contrastar además recorrido de revalidación, no inferir suficiencia del mero rechazo | Resultado negativo y positivo aislado o falta de cobertura justificada por fuentes |
| R09 | D038 §§2,11–14,16–18; G1 | Revoked/disabled/stale generation/old epoch/MFA inválida | Ninguna decisión/reserva/actividad autorizada | Estados antes/después y denials |
| R10 | D038 §§4,6,13–15; Plan §7.2 | F2 inicialmente válida espera locks actor/session/epoch/advisory/parte hasta expirar | Denial con tiempo real; ninguna escritura superviviente | Bloqueo PostgreSQL, expiry, snapshots |
| R11 | D038 §§4,6,14; Plan §7.2: fuentes y permisos antes de confirmar; C03 | Dos conexiones, lock real de ledger M02 después de admisión M04; >30s y control corto | Largo: rollback completo, ninguna propuesta/decisión/reserva/history/receipt/operation/result/intent/activity superviviente; corto: permite commit mientras vigente | PID/xid, pg_locks, reloj real, expiración, outcome y conteos desde otra conexión |
| R12 | D038 §15; CONC-002 | Revocar/disable concurrente frente a actuar | Orden estable; revocación ganadora niega; no revive autoridad posterior | Locks y orden de commits |
| R13 | D038 §§1,4,5,14 | Solo F1/F2, targets/scope/input distintos y capacidades cruzadas | Denial; ninguna ampliación | SQL y estados |
| R14 | D038 §§2,19; V-DAT | Runtime/PUBLIC/roles genéricos intentan DML | Sin acceso directo ni alteración de autoridad/historia | Catálogo y ataques SQL |
| R15 | D038 §§2,5 | GUC libre, copiar payload, commit/rollback/error/reutilización | Ninguna autoridad inventada o residual | Conexión reutilizada real |
| R16 | HA-004; CONC-002; AC-055 | Dos conexiones reservan misma parte | Máximo una reserva; perdedor resultado/conflicto | Carrera y conteos |
| R17 | T08; HA-004 | Dos partes independientes | No repetir consumida; resto distinguible/reservable | Estados por parte |
| R18 | E4; HA-003/004; G6; T08 | Attempt uncertain y retry | Reserva retenida; no nuevo efecto peligroso | Attempt/uncertain y retry denial |
| R19 | Plan §8; HA-003; E4 | Conciliar attempt exacto y mismatches | Solo original incierto concilia; mismatch no altera resultado | Referencias y filas antes/después |
| R20 | HA-003/004; SM-HA-03 | Failure conocido, nuevo attempt seguro, success | Failure no acredita éxito; success consume; no repetir consumida | Historial de intentos/resultados |
| R21 | Plan §7.1; E2; V-AT | Replay equivalente vs misma identidad/material distinto | Reautorizar y devolver previo; conflicto E2 si distinto | Resultado y cardinalidades |
| R22 | C03; V-AT; E4 | Fallos M04/ledger/intent/history/receipt; pérdida post-COMMIT separada | Unidad completa o nada; post-COMMIT recupera, incertidumbre externa no es rollback | Inyección real y consulta posterior |
| R23 | D038 §§3,19; V-DAT | SET ROLE, shadow/temp, helpers, permisos residuales | Owners separados NOLOGIN, ACL mínimas, FORCE RLS/search_path fijo, sin bypass | Catálogo y SQL hostil |
| R24 | V-MIG; Plan C01 | Cadena vacía/upgrade, fixture previo, wrong migrator/runtime, fallo DDL; lectura fuera de scope | Migración atómica preserva datos y ACL; lectura mínima solo autorizada | Clúster real, rollback/reapply, catálogo y denials |
| R25 | HA-001/003; G4; Plan §7.1/§8 | proposer_kind IA frente a registrador/aprobador/ejecutor | Procedencia reconstruible por actores/campos separados; no atribución humana ambigua como productor IA | Propuesta, decisión, history, attempt y resultado |

## Criterio de parada

Primer defecto material reproducido: FAILED / NOT COMPLETED; conservar reproducción y evidencia, parar matriz normativa, no modificar producto. Filas no alcanzadas permanecen NO EJECUTADAS, nunca PASS por regresión heredada. R11 se prioriza tras control positivo corto. Regresiones de ingeniería no sustituyen la matriz independiente.

## Resultado formal: FAILED / NOT COMPLETED

**H0-012-F01 — OPEN — MATERIAL / ALTA.** F2 caduca entre M04 y el ledger H0-M02, pero una F1 técnica emitida después permite confirmar la reserva humana. Detectado el 2026-09-27; sin corrección productiva. La implementación H0-011 conserva su antecedente histórico, pero esta verificación no acredita su cierre funcional.

### Fuente violada y causa delimitada

- Plan §7.2, párrafo inicial: «Las fuentes y permisos se revalidan antes de confirmar»; C03 incluye hecho/historia/resultado/intención en la unidad.
- D038 §4/6: F2 autentica not_before/expires_at y tiene ventana de 30 s; §14 exige autoridad F2 y F1 en la misma unidad material.
- SPEC-FR-HA-002 y Plan §8: permisos actuales antes del efecto/consumo de la parte.
- D038 §15 permite completar frente a revocación que espera detrás de locks ya adquiridos; no elimina expires_at ni convierte F1 técnica en renovación F2. Aquí no hubo revocación ni modificación de reloj o ventana.

`H0011PostgresAdapter.command` ejecuta `crm_api.h0_m04_command` y después `commitLedger` en la misma transacción. M04 admite/revalida F2 antes de sus INSERT. `commitLedger` obtiene binding temporal nuevo y emite otra F1, pero no recibe ni verifica F2. H0-M02 verifica F1 al entrar y al finalizar. El callback retorna tras M02 sin una comprobación final F2. Por ello la autoridad técnica puede seguir viva cuando la humana ya caducó.

### Reproducción independiente R11

Suite: `tests/integration/postgres-h0-012.test.ts`. PostgreSQL **17.11 (Postgres.app)** real; Node **24.21.0**, pnpm **11.19.0**, socket Unix efímero y sin TCP. Clúster, claves aleatorias en memoria, roles y fixtures desechables. Cadena histórica aplicada usando la autoridad prevista. Ningún secreto sale en diagnósticos.

1. Crear mediante los adaptadores públicos una propuesta IA sintética y una aprobación humana vigente; esas dos unidades previas están confirmadas y deben conservarse.
2. Con conexión independiente bloquear la fila actor; con otra bloquear `crm_private.unit_roots` en ACCESS EXCLUSIVE.
3. Llamar al adaptador real `reserve`. Observar la F2 emitida (solo se conservan tiempos derivados en memoria) y el bloqueo PostgreSQL real en actor. Esperar 3 s y liberar actor.
4. M04 completa su reserva/event/receipt, aún no confirmados. El adaptador emite una F1 nueva y llama al ledger. `pg_stat_activity`/`pg_locks` confirman espera real del backend runtime sobre `unit_roots`, después del retorno M04.
5. Mantener ese segundo lock hasta que `clock_timestamp` supere expires_at F2 en 250 ms, comprobando que la F1 posterior todavía vive. No cambiar payload, reloj, firma, SQL ni resultado mediante el observador del driver.
6. Liberar ledger, esperar el resultado del adaptador y consultar persistencia desde otra conexión.

**Expected fijado antes de inspeccionar código:** DENY/rollback; preparación previa conservada, cero reserva/event/receipt/operation/root/attempt/history/result/intent nuevos y actividad sin cambio.

**Observed primera ejecución válida:** F2 tenía 30.283 s al liberar; espera real ledger 27.219 s, más espera previa actor 3 s; F2 expirada y F1 vigente. **COMMIT**. Persistieron 1 reserva, 1 evento, 1 receipt, 1 operation, 1 root, 1 attempt técnico de ledger, 1 history, 1 result y 1 intent. `last_human_activity_at` cambió. Propuesta y decisión previas continuaron en 1. No hubo intento de proveedor ni efecto externo real.

Precisión: no se atribuyen >30 s íntegros al segundo lock de esta reproducción; supera 30 s la edad real de F2. Un lock de ledger >30 s desde la F1 nueva caduca también F1 y enmascara el defecto. Se ensayaron ambos casos, sin acortar ninguna ventana.

| Control/caso | Esperado | Observado | Resultado |
|---|---|---|---|
| Wait ledger corto | Commit con F2/F1 vivas | 104 ms de wait; edad F2 133 ms; unidad completa | PASS |
| Wait ledger íntegro >30 s | Rollback | 30.273 s de wait; F2/F1 expiradas; cero filas nuevas; actividad intacta; preparación previa conservada | PASS |
| Wait actor + ledger; solo F2 expira | Rollback de unidad humana completa | Edad F2 30.283 s, F1 vigente; commit con reserva/ledger/intent/activity | **FAIL MATERIAL** |

La assertion normativa `committed === false` queda deliberadamente fallando. No se invirtió para convertir la reproducción en PASS. Prueba focal: **3 tests, 2 PASS, 1 FAIL, 0 skipped**. Las comprobaciones iniciales del harness encontraron únicamente incompatibilidades del test (Promise.withResolvers frente al lib TS vigente y sufijo Postgres.app de server_version); se corrigieron en la suite independiente, no en producto, antes de la reproducción válida.

### Orden de locks observado por lectura y ejecución focal

Humano M04: F1 verify → F2 admit con actor → session → current epoch → consumo F1 → advisory(command) → decisión advisory(proposal:decision) o reserva advisory(proposal:part) → re-admit F2 → escrituras M04. Propuesta/decisión/parte se leen sin FOR UPDATE específico; la exclusión de la parte usa advisory y constraints. Intentos/resultados técnicos usan FOR UPDATE reservation. Después el adaptador invoca M02: verify F1 nuevo → advisory(operation) → lectura operación previa → INSERT/lock root → FOR UPDATE root → operation/attempt/history/result/intent → reverify F1. La prueba bloquea en ese INSERT/lock root. No se acreditó auditoría completa de deadlocks ni todos los órdenes inversos; detenida por F01.

### R08: interpretación normativa y límite de esta ejecución

La respuesta de alcance es **B: el mero rechazo permanente no acredita toda la revalidación asignada**. Tasks H0-011/012 exige «evidencia caducada se revalida»; AC-054 exige revalidación aun sin cambio de contenido; HA-002 exige comprobar datos/permisos/estado actuales; V-SM §2.2 exige también caso positivo con guardas satisfechas. SM §2.3 (SM-RV-02/04) distingue comprobación válida posterior de incertidumbre persistente. Fallar cerrado satisface la negativa para evidencia no acreditable, pero no demuestra el recorrido positivo aislado de comprobación vigente. No exige conector ni proveedor real para probar esa frontera local.

La inspección del adaptador muestra rechazo de cualquier `material.evidence`, y SQL rechaza material con evidencia requerida. R08 no se marca PASS por seguridad del rechazo. La prueba positiva independiente y clasificación final de esa falta de cobertura quedan **NO EJECUTADAS por fail-fast F01**, sin inventar política ni abrir aquí otra corrección. Deben abordarse en la futura ejecución completa; no se asigna un segundo defecto reproducido.

### Estado por fila al detenerse

| Filas | Resultado de esta ejecución |
|---|---|
| R11 | **FAIL**, H0-012-F01; dos controles PASS y carrera F2/F1 FAIL |
| R08 | Análisis normativo B; cobertura funcional positiva NO ACREDITADA, fila incompleta |
| R01–R07, R09–R10, R12–R25 | **NO EJECUTADAS COMPLETAMENTE** por fail-fast. El setup/lectura/regresión histórica no equivale a PASS formal |

R22 queda afectada por el alcance persistido de F01, pero no se ejecutó su matriz independiente de fault injection/post-COMMIT. R24 solo tiene bootstrap de cadena vacía; upgrade/fallo/ACL/read completos no se acreditan. Procedencia R25, reconcile/known-failure/retry R19–R20 y las otras carreras no se amplían tras el primer defecto.

## Publicación y límites

### Comprobaciones de ingeniería finales (no continuación de la matriz normativa)

| Comando | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | PASS; lockfile intacto; aviso informativo de nueva versión pnpm, sin actualización |
| `pnpm audit --prod` | PASS; sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS; Import boundaries |
| `pnpm test` | PASS: 27/27, 0 skipped |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | **FAIL: 166 tests, 165 PASS, 1 FAIL, 0 skipped**. Único FAIL: H0-012-F01; los 163 tests históricos y los dos controles nuevos pasan |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |

Total de regresión: **193 tests, 192 PASS, 1 FAIL, 0 skipped**. No se declara suite verde. La ejecución conjunta reprodujo F01 nuevamente: edad F2 30.298 s, espera ledger 27.235 s, F1 viva; misma persistencia indebida y activity cambiada. Control de ledger >30 s: 30.252 s, rollback íntegro; control corto: 104 ms, commit permitido.

Escaneo razonable de los cinco archivos: sin patrones de PAT, URL PostgreSQL autenticada, JWT, clave privada o verifier SCRAM; revisión manual confirma secretos generados en memoria y fixtures sintéticos. `git diff` contra base confirma sin modificaciones de `src`, migraciones, DECISIONS, dependencias o lockfile. El teardown detuvo y eliminó los clústeres/socket efímeros; no recursos hosted.

Se publican exclusivamente esta evidencia, suite independiente y coordinación mínima. Producto, migraciones, D037/D038 y Last Approved Commit `6248820e3253a9d88755ed0a4996fff8f865690e` intactos. H0-012 FAILED / NOT COMPLETED; H0-013 y posteriores NOT STARTED. H0 continúa IN PROGRESS; PLAN-AUTH-002/006 PENDING globalmente. Supabase Staging intacto; Auth/TOTP real, recovery, dispositivos y H0-M03/M04 hosted no acreditados.

Siguiente paso requiere autorización humana específica para corregir H0-012-F01; después, nueva reverificación completa H0-012. Ningún fix se implementa en este bloque.

## Etapa posterior — corrección localizada H0-012-F01 (2026-09-27)

Esta etapa tiene autorización humana separada y no reescribe el FAILED anterior ni continúa la matriz R01–R25. Base exacta: `5f1e20fd01ec8a8ec033e398b4fea9fa29b2c53a`; main, HEAD=origin/main y árbol limpio verificados antes de modificar. Last Approved Commit D038 permanece `6248820e3253a9d88755ed0a4996fff8f865690e`.

### Causa y alternativas mínimas

El callback transaccional admitía M04 con F2 y terminaba mediante el ejecutor técnico M02, que solo recibía F1. El binding temporal posterior de esa F1 no renueva la autoridad humana original. Faltaba coordinar el último ejecutor de la unidad con esa F2 después de las esperas M02.

| Alternativa | Evaluación |
|---|---|
| Comparación de hora/claims en TypeScript | Descartada: no comprueba la autoridad en PostgreSQL ni reutiliza su reloj/verificador |
| Nueva F2 automática o ventana más larga | Descartada: oculta el defecto y cambia la autorización de 30 s |
| Helper de comprobación llamado después de M02 desde la aplicación | Posible coordinación, pero añade otra llamada separada del ejecutor; se prefiere que el ledger no devuelva éxito sin completar la comprobación humana |
| Fusionar/reimplementar todo M04 y M02 | Superficie y duplicación innecesarias para esta causa; altera interfaces y tratamiento de operaciones técnicas no afectadas |
| Overload humano estrecho del ejecutor M02 | **Elegido**: delega el ledger sin copiarlo y comprueba F2 al entrar y al terminar; misma conexión/transacción y misma capability original |

Migración forward nueva: `supabase/migrations/202609270001_h0_m04_f2_unit_revalidation_fix.sql`. Crea exclusivamente `crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)`. La variante técnica de tres argumentos y todas las migraciones históricas permanecen intactas. No se crean tablas, roles, claves, GUC de autoridad ni helpers firmadores.

`H0011PostgresAdapter.command()` conserva el payload/MAC/input F2 original y lo pasa a `commitLedger()`. Para propose/decide/reserve, esta utiliza el overload humano como **última operación SQL** del callback, sin nuevas escrituras después ni renovación de F2. Attempt/outcome/reconcile técnicos conservan su ruta F1 anterior.

Flujo del overload: admisión F2 existente → verificación F1 del ledger → correspondencia de scope, command ID, root y receipt/fingerprint M04 → ejecución del M02 existente (incluido replay) → **admisión F2 completa final** → retorno → COMMIT del callback. Se reutiliza `crm_f2.admit`, no se duplica criptografía: MAC/input/binding, actor/session/epoch/generation, identificación, límites 7/30 días y ventana F2 con `clock_timestamp()`. Actor→session→epoch ya están bloqueados por M04 y permanecen bloqueados hasta terminar. La actualización adicional de actividad está dentro de la misma unidad; una denegación revierte también la actividad previa de M04. No existe actualización fuera de la transacción.

`RETURN QUERY` almacena el resultado antes de la comprobación final, pero no evita ejecutarla ni confirma la transacción; cualquier excepción posterior impide el retorno satisfactorio y el adaptador hace rollback de toda la unidad. Es una función VOLATILE / PARALLEL UNSAFE / SECURITY DEFINER con owner `crm_h0_f2_executor` NOLOGIN, sin BYPASSRLS ni lectura de K, nombres cualificados, `search_path=pg_catalog,pg_temp`, EXECUTE explícito runtime y revocado PUBLIC. No queda CREATE residual. Se mantiene la separación existente de ejecutores/owners/RLS de M02. La guía de privilegios mínimos y funciones privilegiadas se usó como comprobación de ingeniería, no como fuente de requisitos de negocio ([PostgreSQL 17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html)).

### Reproducción conservada y pruebas focales

Las tres pruebas publicadas permanecen con el mismo cuerpo, tiempos y assertions; solo su bootstrap añade la nueva migración. El observador sigue interceptando M04 y `commit_internal_unit` sin cambiar argumentos, SQL, reloj o resultado. No se acorta la ventana de 30 s. Se añaden únicamente casos focales de primera fase, operación concurrente/replay/post-COMMIT, upgrade y ACL.

| Caso | Expected | Observed de la ejecución focal | Estado |
|---|---|---|---|
| F01 original: actor 3 s + ledger hasta expirar solo F2 | Rollback aunque la F1 posterior aún viva | F2 30.299 s, wait ledger 27.239 s; F1 viva; DENY | PASS |
| Control original corto | Commit con ambas autoridades vivas | Wait 103 ms, edad F2 131 ms; unidad completa | PASS |
| Control original largo íntegro en M02 | Rollback | Wait ledger 30.241 s; F1/F2 caducadas; DENY | PASS |
| Primera fase: lock actor real >30 s | Denegar antes del ledger | F2 caducada; M04 no retorna; no se emite F1 ledger | PASS |
| Atomicidad en los tres abortos | Cero cambios atribuibles a esa unidad | Snapshot idéntico: reserva/event/receipt/root/operation/attempt/history/result/intent y actividad; propuesta/decisión previas conservadas | PASS |
| Unidades normales concurrentes | Ambas válidas, sin bloqueo indebido | Dos conexiones runtime reales confirman propuestas distintas | PASS |
| Replay / pérdida de respuesta después de COMMIT | Resultado durable sin segundo efecto | COMMIT y lectura desde otra conexión antes de descartar respuesta; replay `previous`, resultado fijo idéntico, una proposal/event/history | PASS |
| Regresiones H0-011 | Idempotencia, E2, concurrencia de parte, partial/uncertain, lost-response, fault injection siguen funcionando | Suite existente completa, sin reducir pruebas | PASS |

Prueba focal conjunta H0-011/H0-012: **19/19 PASS, 0 skipped**, PostgreSQL **17.11 (Postgres.app)**; Node **24.21.0**, pnpm **11.19.0**. El conteo comprende 14 pruebas H0-011 (12 existentes + upgrade/ACL) y 5 H0-012 (3 publicadas + 2 focales). No se atribuye PASS formal a R01–R25 por estos resultados.

### V-MIG y controles de publicación

- Cadena vacía completa M01→F1→M02→M03→F01/F02→M04→nuevo fix aplicada en el clúster independiente.
- Upgrade desde predecesor M04 aplicado: fila M04 sintética y root M02 anterior preservados byte-for-byte mediante snapshots `row_to_json`.
- Autoridad migration correcta; runtime y bootstrap distinto rechazados `42501`.
- Fallo DDL real inyectado al crear el overload: rollback, función nueva ausente y fixture anterior intacto. Se retira el inyector y la aplicación posterior pasa.
- Reaplicación manual falla de forma segura `42723`; rollback sin alterar el baseline.
- ACL efectiva del nuevo ejecutor y denegaciones runtime sin capacidades/PUBLIC: PASS. No acceso nuevo a key store ni firma.

Regresión completa y comprobaciones finales:

| Comando / control | Resultado de la corrección |
|---|---|
| `pnpm install --frozen-lockfile` | PASS; dependencias/lockfile sin cambios |
| `pnpm audit --prod` | PASS; sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS; Import boundaries |
| `pnpm test` | **27/27 PASS**, 0 skipped |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | **170/170 PASS**, 0 skipped, 0 cancelled; 126.424 s |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |
| Escaneo razonable diff + SQL nuevo | Sin PAT, credenciales/URL PostgreSQL autenticada, JWT real, verifier SCRAM, clave privada ni TOTP; revisión de fixtures y secretos aleatorios en memoria |
| Inmutabilidad histórica | SHA-256 de las 10 migraciones publicadas idéntico a la base; D037/D038/DECISIONS sin cambios |

Total ingeniería: **197/197 PASS, 0 skipped** (las 19 focales son subconjunto, no se suman dos veces). Regresiones F1/F2, M02/M03, H0-006 y H0-011 continúan verdes. En la suite completa: control corto 104 ms / F2 133 ms; largo ledger 30.236 s, rollback; combinación F01 edad F2 30.282 s / ledger 27.215 s, F1 aún viva, rollback completo sin actividad nueva. No se encontró otro defecto material durante la corrección; R08 permanece fuera de esta ejecución focal.

Archivos productivos: adaptador `src/infrastructure/postgres/h0-011-adapter.ts` y nueva migración forward. Tests: bootstrap/casos focales en `postgres-h0-011.test.ts` y `postgres-h0-012.test.ts`, sin debilitar reproducer ni controles originales. Coordinación: esta evidencia, Tasks, PROJECT-STATUS y NEXT-STEPS. Publicación prevista en un único commit `fix(h0): keep human approval valid through unit commit`; el SHA exacto es el commit que contiene esta etapa, no Last Approved Commit.

**H0-012-F01: FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION**, nunca CLOSED en esta etapa. **TSK-H0-012: FAILED / NOT COMPLETED**. H0-011 conserva su antecedente COMPLETED con corrección posterior. Siguiente paso, con autorización separada: nueva reverificación completa e independiente H0-012. No se ha ejecutado aquí.

### Límites conservados

Esta corrección coordina el final del ejecutor de la unidad M04→M02 con su F2 original. No introduce un deadline físico de WAL/fsync/COMMIT ni un mecanismo para cancelar retroactivamente transacciones; se mantiene la semántica aprobada de comprobación en el ejecutor y rollback ante caducidad durante su trabajo. La interfaz técnica M02 de tres argumentos sigue necesitando su F1 y no emite autoridad humana; el adaptador humano usa obligatoriamente la variante de seis argumentos. No hay fallback ni retry automático.

R08 y las otras obligaciones no completadas de la matriz siguen pendientes de la nueva reverificación independiente; no se corrigen ni se dan por PASS aquí. No se acreditan Auth/TOTP real, recovery, dispositivos ni H0-M03/M04 hosted. Supabase Staging no se conecta ni modifica. D037/D038, fuentes APPROVED y Last Approved Commit intactos; H0-013 NOT STARTED, PLAN-AUTH-002/006 PENDING globalmente.

## Nueva ejecución formal independiente — base 0ab6520 (2026-09-27)

Preflight: main, remoto `IAndresB/crm-huescaventura-os`, árbol limpio y HEAD=origin/main=`0ab652046931a04e757b64fd9631e4a907b7bed3`. Relectura selectiva de Tasks §2.2–2.3/H0-011/012, Plan B01/B08/C02/C03/C05/T08/§8, HA-001–005/CONC-002/AC-053–056/E1/E2/E4, G1–G6/SM-HA-01–03, D009/D016/D038. La matriz R01–R25 superior se conserva literalmente como oráculo; no se transfieren PASS de implementación ni de la corrección focal.

Orden de ejecución fijado: repetir primero el escenario F01 y sus controles originales; contrastar a continuación la frontera SQL real M2, no solo la selección de función del adaptador; después completar las demás filas mientras no exista defecto material. Para R11/R13/R23, D038 §§2/4/6/14 y Plan §7.2 exigen que seleccionar una interfaz SQL permitida a runtime no elimine la necesidad de F2 vigente de una unidad humana. **Expected independiente adicional dentro de esas filas:** mismas capacidades y mismo binding de una unidad legítima, elección adversarial de cualquier overload accesible, espera real que expire F2 antes de terminar el ledger → DENY/rollback íntegro. No se presume que la selección del overload en TypeScript sea frontera M2. No cambia la ventana, no se forjan firmas y no se dan claves al caller adversarial.

El fail-fast prevalece sobre completar filas posteriores: ante un defecto material reproducido se detiene la matriz, se conserva la prueba negativa y las filas no completadas se registran BLOCKED por ese fallo, nunca PASS heredado. No se autoriza corrección productiva.

### H0-012-F02 — OPEN — MATERIAL / ALTA

**Revalidación final F2 eludible seleccionando el overload técnico de M02.** El overload humano corregido funciona para el recorrido del adaptador, pero la misma autoridad runtime conserva EXECUTE sobre `crm_api.commit_internal_unit(bytea,bytea,bytea)`. Esa entrada acepta los mismos p/s/q F1 del ledger sin exigir la F2 original ni vincular obligatoriamente el cierre de la unidad humana al overload de seis argumentos.

Fuentes: D038 §§2/4/6/14 (SQL arbitrario permitido a runtime, autoridad humana autenticada y vigente junto con F1 en la unidad), Plan §7.2/C03 y §8 (revalidación de permisos antes de confirmar/consumir), SPEC-FR-HA-002. Afecta R11/R13/R23. No cambia el expected normativo: una entrada alternativa permitida no debe convertir la F1 técnica en sustituto del control humano final.

**Precondición y alcance exactos:** el emisor confiable del harness autoriza una unidad legítima con sus capabilities reales en una transacción runtime. Un selector SQL adversarial recibe los argumentos ya emitidos y elige la sobrecarga pública técnica en **esa misma conexión/transacción**, sin cambiar ningún byte firmado, MAC, input, binding o reloj. El selector no recibe K-F1/K-F2 ni firma. Esto prueba una composición no obligatoria en la frontera SQL con capacidades legítimamente emitidas; **no demuestra que unas credenciales robadas por sí solas permitan obtener esos argumentos en otra conexión ni romper el binding**, ni que se pueda explotar vía un endpoint HTTP actual. No se afirma compromiso del proceso servidor: el proxy de test modela la elección de SQL y de argumentos disponibles al caller, no una nueva API productiva.

Reproducción exacta, PostgreSQL **17.11** local efímero:

1. Preparar propuesta IA sintética y decisión humana válida mediante dos unidades independientes ya confirmadas.
2. Consultar como runtime `session_user/current_user` y `has_function_privilege` para M04 y ambos overloads M02: usuario actual y de sesión `crm_h0_runtime`; EXECUTE **true** en las tres entradas.
3. Otra conexión bloquea actor; otra bloquea `crm_private.unit_roots` en ACCESS EXCLUSIVE. Iniciar reserva válida; confirmar espera actor real y liberar tras 3 s.
4. M04 retorna con sus escrituras aún sin confirmar. El servidor de prueba emite la F1 de ledger más tarde que F2. El selector llama `SELECT * FROM crm_api.commit_internal_unit(p,s,q)` con exactamente los tres primeros parámetros de la llamada humana prevista. Omite únicamente los tres argumentos F2 que elegirían el overload humano.
5. Confirmar espera PostgreSQL real del PID runtime en `unit_roots` mediante `pg_stat_activity/pg_locks`. Esperar usando `clock_timestamp()` hasta `F2.expires_at + 250 ms`, sin caducar la F1 posterior.
6. Liberar lock y consultar persistencia desde otra conexión después del resultado/COMMIT.

**Expected:** DENY/rollback íntegro de la reserva y ledger; conservar solo las dos unidades previas. **Observed:** edad F2 **30.268 s**, espera ledger **27.209 s**, F2 caducada/F1 aún vigente, **COMMIT**. Se confirmó **1** fila nueva en cada una de: reservation, event, command receipt, M02 operation, root, attempt técnico, history, result e intent. La actividad cambió; proposal y decision previas permanecen en **1**. No hubo proveedor ni intento externo real. No es una fuga parcial por rollback: es la confirmación completa de una unidad que debía ser denegada.

La assertion `committed === false` queda **fallando deliberadamente**, no invertida/omitida. Suite: `H0-012 R11/R13/R23 M2: selecting the technical overload cannot bypass final human authority`. `chooseTechnicalLedger` está separado del observador neutral y solo selecciona la entrada SQL pública; `race` conserva su recorrido original por defecto. No se ha modificado código productivo ni migración.

### F01 original y controles ejecutados de nuevo

| Caso | Expected | Observed en esta reverificación | Resultado del caso |
|---|---|---|---|
| Espera corta ledger | Commit con F2 viva | 105 ms; edad F2 133 ms; unidad confirmada | PASS |
| Espera larga M02 | Rollback completo | 30.251 s de wait; edad F2 30.279 s; F1/F2 expiradas, snapshot intacto | PASS |
| F01 original combinado, overload humano | Rollback aunque F1 siga viva | Actor 3 s + ledger 27.235 s; edad F2 30.298 s; rollback y actividad intacta | PASS |
| Expiración primera fase | Denegar antes de ledger | Lock actor >30 s; M04 no retorna; snapshot intacto | PASS |
| Unidades normales concurrentes/replay/pérdida post-COMMIT | Confirmación válida y mismo resultado durable sin duplicación | Dos conexiones confirman; resultado acreditado desde otra conexión antes de descartar respuesta; replay previo, una proposal/event/history | PASS |
| F02: overload técnico con misma F1 legítima | Denegar al caducar F2 | COMMIT a edad F2 30.268 s con todos los efectos anteriores | **FAIL MATERIAL** |

Los tres abortos de controles conservan cero reserva/event/receipt/root/operation/attempt/history/result/intent nuevos y actividad idéntica, con preparación previa intacta. El PASS del escenario original F01 no cierra F01: el criterio humano exige todas las filas R01–R25 PASS, lo que no se cumple.

### Matriz de resultado de esta ejecución (sin PASS heredados)

La matriz normativa superior conserva literalmente requisito, setup, expected y evidencia requerida de **cada** ID. Esta tabla la referencia por ID y añade observed, resultado y prueba asociada. «BLOCKED F02» significa ejecución independiente no completada porque el primer fallo material detuvo la matriz; no significa requisito satisfecho ni fallo adicional probado.

| ID | Observed / prueba o consulta asociada | Resultado |
|---|---|---|
| R01 | No ejecutada íntegramente; propuesta IA de preparación no prueba autoaprobación. BLOCKED F02 | BLOCKED |
| R02 | Pending/rejected no ejecutados. BLOCKED F02 | BLOCKED |
| R03 | Separación completa approval/execution no ensayada. BLOCKED F02 | BLOCKED |
| R04 | Sin vectores independientes de todos los campos. BLOCKED F02 | BLOCKED |
| R05 | Sustituciones individuales no ejecutadas. BLOCKED F02 | BLOCKED |
| R06 | Diferenciales canónicos completos no ejecutados. BLOCKED F02 | BLOCKED |
| R07 | Variantes de parte/scope no ejecutadas. BLOCKED F02 | BLOCKED |
| R08 | Positivo de evidencia vigente NO ejecutado; interpretación B conservada, no se acepta fail-closed general como PASS. BLOCKED F02 | BLOCKED |
| R09 | Matriz revoked/disabled/stale/MFA no completada. BLOCKED F02 | BLOCKED |
| R10 | Control actor >30 s PASS; no cubre session/epoch/advisory/parte restantes. BLOCKED F02 | BLOCKED |
| R11 | Controles y F01 original PASS; selector técnico confirma tras caducar F2. Test F02 + pg_locks/reloj/snapshot | **FAIL** |
| R12 | Revocación/disable concurrentes no ejecutados. BLOCKED F02 | BLOCKED |
| R13 | F1 técnica sin los argumentos F2 finales permite completar la unidad humana. Test F02; otros cruces no ejecutados | **FAIL** |
| R14 | DML directo/PUBLIC/genéricos no ensayados íntegramente. BLOCKED F02 | BLOCKED |
| R15 | GUC/reuse/error no ensayados íntegramente. BLOCKED F02 | BLOCKED |
| R16 | Carrera por misma parte no ejecutada. BLOCKED F02 | BLOCKED |
| R17 | Partes distintas no ejecutadas. BLOCKED F02 | BLOCKED |
| R18 | Uncertain/retry no ejecutado. BLOCKED F02 | BLOCKED |
| R19 | Reconcile/mismatches no ejecutados. BLOCKED F02 | BLOCKED |
| R20 | Known failure/nuevo attempt/success no ejecutados. BLOCKED F02 | BLOCKED |
| R21 | Replay equivalente puntual PASS; E2 completo no ejecutado. BLOCKED F02 | BLOCKED |
| R22 | Rollback temporal y post-COMMIT puntual PASS; inyecciones restantes no ejecutadas. BLOCKED F02 | BLOCKED |
| R23 | ACL runtime permite elegir sobrecarga que evita guarda final humana. Consulta ACL y test F02; resto de matriz ACL no completada | **FAIL** |
| R24 | Bootstrap de cadena desde vacío PASS; upgrade/failure/read-scope no completados independientemente. BLOCKED F02 | BLOCKED |
| R25 | Provenance completa no ejecutada; fixtures no equivalen a verificación. BLOCKED F02 | BLOCKED |

**Parada:** no se continúa R08 ni se buscan otros defectos tras F02; no se asigna un nuevo defecto por un recorrido no ejecutado. No se amplía a R26+. No se cambia D037/D038 ni Last Approved Commit `6248820e3253a9d88755ed0a4996fff8f865690e`.

### Verificación de publicación y límites

Comando ejecutado: `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h0-012.test.ts` → **6 tests: 5 PASS, 1 FAIL (F02), 0 skipped, 0 cancelled**, 122.829 s. El clúster efímero se cierra/elimina con el teardown de la suite. No se lanza `pnpm run test:postgres` completo después del hallazgo: parada normativa fail-fast, no otra búsqueda de defectos ni PASS heredado de sus 170 pruebas históricas. Controles de publicación de ingeniería se registran aparte; no convierten H0-012 en PASS.

| Comprobación ejecutada en esta etapa | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | PASS; sin cambios de dependencias/lockfile |
| `pnpm audit --prod` | PASS; sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS; fronteras de imports |
| `pnpm test` | 27/27 PASS; 0 skipped/cancelled |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |
| Secret scan del diff y revisión manual de fixtures | PASS; sin PAT/JWT real/password/clave privada/SCRAM/URL autenticada/TOTP ni material secreto nuevo |
| Integridad del alcance | Solo cinco archivos autorizados; matriz normativa literal idéntica; src/migraciones/DECISIONS sin cambios |
| Limpieza local | Sin directorio efímero `crm-h012-independent-*` restante tras teardown |

Total de tests **realmente ejecutados en esta etapa: 33; 32 PASS, 1 FAIL, 0 skipped, 0 cancelled**. No representa la regresión PostgreSQL completa ni toda la matriz. Publicación autorizada exclusivamente de reproducción/evidencia/coordinación con mensaje `test(h0): record human approval reverification failure`; el commit que contiene esta etapa identifica el resultado final, sin cambiar Last Approved Commit.

TSK-H0-011 permanece antecedente COMPLETED de implementación; TSK-H0-012 FAILED / NOT COMPLETED; F01 FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION; F02 OPEN — MATERIAL / ALTA. H0 IN PROGRESS; H0-013 y posteriores NOT STARTED. PLAN-AUTH-002/006 PENDING globalmente. Auth/TOTP/recovery/dispositivos y H0-M03/M04 hosted no acreditados. Supabase Staging no conectado ni modificado. Próximo paso requiere nueva autorización para resolver F02; luego nueva reverificación completa, incluido el positivo R08 y R25. No se implementa ninguna solución en esta publicación.
