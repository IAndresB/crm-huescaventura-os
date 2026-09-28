# TSK-H0-012 — Verificación formal independiente local

**Estado vigente tras reverificación formal D039:** TSK-H0-012 **COMPLETED en alcance local**; H0-012-F01/F02/F03/F04/F05 **CLOSED localmente**. D039 **APPROVED / IMPLEMENTED LOCALLY**. Nueva R01–R25: **25/25 filas PASS**, 32/32 tests Node, sin F06+ material. H0 IN PROGRESS; H0-013 NOT STARTED; PLAN-AUTH-002/006 PENDING globalmente y hosted M03/M04 NO ACREDITADOS.

Resumen histórico tras la puerta experimental F05 sobre `2aeaeeaa55f5ce7bc525a4d02227ee205e45d7b5`: **TSK-H0-012 FAILED / NOT COMPLETED; H0-012-F05 OPEN / MATERIAL / ALTA — BLOCKED BY DESIGN; F01/F02/F03/F04 = FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION**. PostgreSQL 17.11 permite a runtime desactivar `transaction_timeout` incluso después de `REVOKE SET ON PARAMETER`; las dos variantes F05 siguen confirmando evidencia caducada. No se modifica producto, migraciones ni tests. La quinta ejecución formal conserva sus 8 filas PASS, 2 FAIL y 15 BLOCKED; no se ejecuta una nueva R01–R25 completa. La cronología F01–F05 se conserva íntegra y la etapa experimental se añade al final.

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

## Etapa posterior — corrección localizada H0-012-F02 (2026-09-27)

Autorización separada, base exacta `0edcf8da385a00849d44973eb37a869b63990624`, `main`, HEAD=origin/main y árbol limpio. Esta etapa no reejecuta R01–R25, no cierra F01/F02 y no inicia H0-013. D037/D038 y Last Approved Commit `6248820e3253a9d88755ed0a4996fff8f865690e` permanecen intactos.

### Causa e inventario previo de callers

F02 no era una rotura de MAC ni del binding. La composición humana emitía una F1 válida para `internal_unit/commit_internal_unit`; runtime podía seleccionar el overload técnico de tres argumentos y omitir la F2 final del overload humano. La elección de overload quedaba fuera del material firmado. El núcleo M02 publicado era además la propia interfaz runtime, por lo que no existía una frontera interna donde imponer la partición.

Inventario por búsqueda de todos los call sites reales de `commit_internal_unit(bytea,bytea,bytea)`:

| Caller | Purpose/resource/action | Identidad | Clasificación |
|---|---|---|---|
| `src/infrastructure/postgres/h0-009-adapter.ts` | purpose técnico permitido por configuración; `internal_unit` / `commit_internal_unit` | `TrustedExecutionContext` técnico | A — M02 técnico legítimo |
| `src/infrastructure/postgres/h0-011-adapter.ts`, comandos `attempt/outcome/reconcile` | `h0-011-human-approval`; `internal_unit` / `commit_internal_unit` | ejecutor técnico confiable | A — resultado técnico posterior, no decisión/reserva humana |
| `src/infrastructure/postgres/h0-011-adapter.ts`, `propose/decide/reserve` | antes compartía `h0-011-human-approval`; ahora purpose reservado firmado `h0-011-human-unit` | bridge técnico + F2 humana original | B — composición M04, solo overload de seis argumentos |
| `tests/integration/postgres-h0-009.test.ts`, `postgres-h0-010.test.ts` y `tests/hosted/postgres-h0-m02.test.ts` | capabilities técnicas M02 | fixtures técnicos | Verificación legítima, no caller productivo adicional |
| `tests/integration/postgres-h0-012.test.ts::chooseTechnicalLedger` | reutiliza exactamente la F1 humana observada y elige tres argumentos | adversario de frontera SQL | Reproducer F02, no uso legítimo |

No hay otro caller productivo. H0-009 necesita conservar la entrada técnica; revocarla a ciegas rompería el contrato técnico y no resolvería la separación semántica.

### Diseño aplicado

Migración forward nueva: `202609270002_h0_m04_m02_authority_partition_fix.sql`. Las migraciones históricas M01/F1/M02/M03/M04/F01 no cambian.

1. El objeto publicado de tres argumentos se **mueve**, sin copiar ni reescribir su cuerpo, a `crm_internal.commit_internal_unit_core(bytea,bytea,bytea)`.
2. El core conserva owner `crm_h0_executor` NOLOGIN y `search_path=pg_catalog, pg_temp`; runtime/PUBLIC/anon/authenticated/untrusted no tienen USAGE/EXECUTE. Solo `crm_h0_f2_executor` recibe EXECUTE adicional para la composición humana; ambos executors pierden CREATE al terminar la migración.
3. La nueva interfaz técnica pública de tres argumentos verifica la F1 y deniega el purpose firmado reservado `h0-011-human-unit`; delega en el core solo para unidades técnicas.
4. La interfaz humana de seis argumentos acepta exclusivamente ese purpose reservado, conserva los enlaces q/hq/receipt, ejecuta F2 antes y después del core y delega directamente al core no invocable por runtime.
5. El adaptador emite `h0-011-human-unit` solo para `propose/decide/reserve`; mantiene `h0-011-human-approval` para `attempt/outcome/reconcile` y lectura técnica. También rechaza en aplicación cualquier combinación human/purpose incompatible.

El selector no es un GUC ni un booleano libre: `purpose` pertenece al payload F1 autenticado. Cambiarlo invalida la MAC; runtime no firma. Emitir otra F1 automáticamente o ampliar la ventana F2 queda expresamente descartado. Tampoco se duplica el cuerpo M02: existe un único core movido y dos wrappers estrechos.

### Reproducer, controles y ausencia de residuo

El reproducer publicado F02 conserva la espera real de actor, la F2 de 30 segundos, la F1 posterior aún vigente y la selección de los tres argumentos exactos. Tras el fix, la entrada técnica deniega **antes de alcanzar el core/lock ledger** por el purpose reservado. El harness distingue explícitamente este rechazo temprano seguro; los otros escenarios siguen exigiendo `pg_locks` real.

Observed F02: edad F2 `30.301 s`; F1 aún vigente; `committed=false`; `realLedgerLockObserved=false`; `deniedBeforeLedger=true`; snapshot posterior igual al anterior. Cero reservas, events, receipts, roots, operations, attempts, history, results o intents nuevos; actividad humana sin cambio. Las proposal/decision previas permanecen como preparación independiente.

Controles focales:

- ruta humana corta: PASS; wait ledger real `103 ms`, F2 viva, reserva/history/intent confirmados;
- F01 combinado: PASS; actor real + ledger real, F2 caduca con F1 viva, rollback completo;
- espera M02 larga: PASS; F1/F2 caducan, rollback completo;
- expiración en primera fase: PASS; denegación antes de ledger, snapshot íntegro;
- ruta técnica H0-009 posterior al upgrade: dos conexiones convergen `applied` + `previous`, una operación/history; replay posterior `previous`;
- ruta humana normal, concurrencia, replay y pérdida real de respuesta post-COMMIT: PASS;
- el core interno deniega runtime y rol genérico; no existe segundo wrapper runtime-equivalente distinto de los dos overloads públicos inventariados.

### Superficie efectiva y ACL

Consulta programática de `pg_proc/pg_namespace/proowner/proacl/has_function_privilege` enumeró todas las funciones ejecutables por runtime en `crm_api`, `crm_f1`, `crm_f2`, `crm_ha`:

`crm_api.apply_probe_batch(bytea,bytea,bytea)`; `crm_api.commit_internal_unit(bytea,bytea,bytea)`; `crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)`; `crm_api.establish_session(bytea,bytea,bytea)`; `crm_api.f2_lookup(uuid,uuid)`; `crm_api.f2_lookup_revoke_all_authority(uuid,uuid)`; `crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)`; `crm_api.h0_m04_read_proposal(bytea,bytea,bytea,bytea,bytea,text)`; `crm_api.human_apply_probe_batch(bytea,bytea,bytea,bytea,bytea)`; `crm_api.human_read_probe(bytea,bytea,bytea,bytea,bytea)`; `crm_api.read_probe(bytea,bytea,bytea)`; `crm_api.reidentify_session(bytea,bytea,bytea)`; `crm_api.revoke_all_sessions(bytea,bytea,bytea)`; `crm_api.revoke_session(bytea,bytea,bytea)`.

No aparece función ejecutable runtime en `crm_internal`. Los dos overloads públicos M02 son los únicos `commit_internal_unit`; ambos tienen `SECURITY DEFINER`, owner NOLOGIN esperado, `search_path` fijo y EXECUTE explícito solo runtime. PUBLIC, anon, authenticated y rol genérico no ejecutan wrappers ni core. Runtime no tiene USAGE del schema interno; executors tienen USAGE, no CREATE residual; no hay nuevo acceso a K ni signing oracle.

### V-MIG focal

Cadena desde vacío M01→F1→M02→M03→M04→F01→F02 PASS en PostgreSQL 17.11. Upgrade desde predecesor F01 PASS. Fixtures M02 (`m04-upgrade-root`) y M04 (`f01-upgrade-fixture`) se compararon mediante `row_to_json` antes/después y permanecieron idénticos. Runtime y bootstrap incorrecto reciben `42501`. Un event trigger inyectó fallo en `CREATE SCHEMA`: rollback dejó `crm_internal` ausente, la función histórica todavía pública y fixtures intactos; retirada la inyección, la aplicación fue correcta. Reaplicación denegada `42P06`, rollback y fixtures intactos. La autoridad de migración no deja CREATE residual en los executors.

### Ingeniería y estado

| Comprobación | Observed |
|---|---|
| H0-011 focal | 17/17 PASS, 0 skipped/cancelled |
| H0-012 focal | 6/6 PASS, 0 skipped/cancelled; incluye F01 y F02 originales |
| `pnpm install --frozen-lockfile` | PASS; lockfile sin cambios |
| `pnpm audit --prod` | PASS; sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS; fronteras de imports |
| `pnpm test` | 27/27 PASS, 0 skipped/cancelled |
| `pnpm run test:postgres` | 174/174 PASS, 0 skipped/cancelled |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |
| Secret scan/revisión manual | PASS; sin K-F1/K-F2, PAT, password, JWT/TOTP real, verifier, URL autenticada ni datos reales |

Total de regresión: **201 tests PASS, 0 FAIL, 0 skipped, 0 cancelled**. No apareció defecto material diferente de F02.

Estado tras esta etapa: **H0-012-F02 = FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION**; **H0-012-F01 = FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION**; **TSK-H0-012 = FAILED / NOT COMPLETED**; H0-011 conserva su antecedente COMPLETED; H0-013 NOT STARTED. R01–R25 no se ha reejecutado ni reinterpretado. PLAN-AUTH-002/006 PENDING globalmente; Auth/TOTP/recovery/dispositivos y H0-M03/M04 hosted no acreditados. Supabase Staging no se conectó ni modificó. Próximo paso, solo con nueva autorización: reverificación completa e independiente R01–R25.

## Tercera ejecución formal independiente — base 98a90d1 (2026-09-27)

Preflight: `main`, remoto correcto, árbol limpio, HEAD=origin/main=`98a90d155dbb8669c1daa331a6fc377e8c2cee5f`. Relectura selectiva de Tasks §2.2–2.3/H0-011/012, Plan B01/B08/C02/C03/C05/T08/§8, SPEC HA-001–005/CONC-002/AC-053–056/E1/E2/E4, SM G1–G6/SM-HA-01–03 y D009/D016/D038. La matriz R01–R25 superior permanece literalmente intacta.

Orden de ejecución: escenarios históricos F01/F02 y controles; después casos independientes R01–R08 en orden y continuación R09–R25 solo si no aparece defecto material. Los controles históricos no acreditan filas enteras por sí solos. Los casos con efectos/denegaciones comparan persistencia mediante conexión administrativa independiente del login runtime ordinario; R06 contrasta el codec puro. Primer fallo material: detener matriz y publicar reproducción, sin cambios productivos.

Expected R08 fijado antes de ejecutar: evidencia caducada/no verificable deniega; una propuesta idéntica aprobada con evidencia sintética vigente, fuente identificada y fingerprint contrastado debe disponer de un recorrido positivo autorizado de revalidación/reserva. No se exige conector comercial, pero tampoco se acepta un rechazo incondicional de toda evidencia requerida. Fuentes: SPEC-FR-HA-002 y AC-054; Plan §7.2 (fuentes/permisos antes de confirmar) y §8 (revalidar datos/estado/permisos antes de consumir); Tasks §2.2 V-SM/V-DAT y fichas H0-011/012 (casos positivos/negativos); SM G2/HA-03. Se conserva la interpretación B fijada previamente y ratificada expresamente en esta autorización.

### Resultado: H0-012-F03 — OPEN / MATERIAL / ALTA

**Defecto:** no existe un recorrido positivo de revalidación/reserva cuando el material aprobado requiere evidencia, aunque la fuente sintética sea vigente y verificable. Es una capacidad funcional obligatoria incompleta, no una evasión de autorización ni un efecto indebido: el rechazo es seguro, pero no satisface el positivo R08. No se rebaja el expected ni se introduce un verificador durante esta comprobación.

**Fuentes y alcance:** SPEC-FR-HA-002/AC-054 exigen comprobar aplicabilidad y revalidación; Plan §7.2 exige revalidar fuentes/permisos antes de confirmar y §8 exige datos/estado/permisos vigentes antes de consumir. Tasks H0-011/012 asignan explícitamente la revalidación de evidencia, con positivos y negativos conforme §2.2. SM G2/HA-03 conserva guardas/evidencia, sin fabricar éxito. La interpretación B y la exigencia positiva R08 se fijaron antes de esta ejecución; no se derivan del comportamiento actual ni de los tests H0-011.

**Reproducción independiente:** `R08 positive: current independently checked evidence must permit exact approved reservation`, dentro de la suite H0-012.

1. Crear fuente sintética en memoria del ensayo, calcular SHA-256 de sus bytes y comprobar la huella independientemente; vigencia una hora posterior al `clock_timestamp()` PostgreSQL real.
2. Registrar propuesta y decisión humana válida mediante F2 con referencia, huella y vigencia exactas incluidas en el material aprobado.
3. Controles negativos: propuesta con evidencia caducada y otra con referencia sin fuente; ambas deniegan sin alterar persistencia.
4. Control positivo sin requisito de evidencia: misma autoridad y parte sintética reservan correctamente.
5. Intentar reservar la propuesta de evidencia vigente usando exactamente su material, decisión y parte aprobados.
6. Expected: existe revalidación confiable positiva y reserva permitida. Observed: `H0_011_EVIDENCE_REVALIDATION_REQUIRED`, sin llegar a la unidad de reserva. Snapshot independiente de 13 tablas íntegramente idéntico antes/después.

Diagnóstico observado: `sourceFingerprintChecked=true`, `sourceStillCurrent=true`, `approvedMaterialMatches=true`, `negativeExpiredDenied=true`, `negativeMissingDenied=true`, `noEvidenceControlReserved=true`, `expected=reserved`, `observed=denied`, `noResidueIfDenied=true`.

**Límite importante del ensayo:** es el test quien comprueba los bytes y la vigencia de la fuente sintética. No se afirma que producción los haya revalidado ni que un campo `evidence_valid` de cliente otorgue autoridad. Precisamente falta una interfaz/capacidad confiable que permita acreditar el positivo: no basta con enviar referencia/fingerprint/expiry. No se requiere ni se ensaya proveedor real.

**Causa delimitada por inspección:** `src/infrastructure/postgres/h0-011-adapter.ts::reserve` rechaza incondicionalmente cualquier `material.evidence`. Además, la rama `reserve` de `202609270000_h0_m04_human_approval.sql` deniega cuando el campo de evidencia del material no es `none` (`H0_M04_EVIDENCE_UNVERIFIED`). No hay recorrido positivo alternativo en esa rama. La comprobación SQL es inspección de código, no un ataque SQL adicional ejecutado tras fail-fast. Producto y migraciones permanecen intactos.

**Impacto:** toda parte dependiente de evidencia queda permanentemente no reservable, incluso con las restantes guardas satisfechas. R08 FAIL invalida el cierre formal de H0-012. Primer defecto material nuevo; no se buscan otros ni se ejecutan R09–R25 después. F01/F02 no se reabren por este defecto distinto y tampoco se cierran formalmente.

### Matriz de resultados de esta ejecución

Los requisitos/expected son los de la matriz normativa superior, conservada literalmente. Para filas BLOCKED no hay ejecución completa ni observación suficiente; los controles previos se identifican sin convertirlos en PASS de fila.

| ID | Setup / prueba asociada | Observed frente al expected fijado | Resultado |
|---|---|---|---|
| R01 | Subtest R01: origen IA, decisión sin auth, F1 técnica válida por SQL runtime y decisión humana | IA persistida como origen; intentos sin F2 denegados sin cambios; humano vigente decide con actor/session correctos | PASS |
| R02 | Subtest R02: pending y rejected; reserve/attempt/outcome | Todos denegados; snapshot sin residuos | PASS |
| R03 | Subtest R03: aprobar y consultar conexión independiente | 1 decisión, 0 reservas, 0 eventos de ejecución, 0 registros externos; el attempt técnico del ledger no es intento de proveedor | PASS |
| R04 | Subtest R04: todos los campos materiales, importe literal sintético y condiciones | Bytes persistidos y huella coinciden con framing/hash de referencia independiente; decisión ligada a esa huella | PASS |
| R05 | Subtest R05: action/version/content/recipient/amount/conditions/scope/effect, uno por uno | Huella anterior y nueva variante autoconsistente denegadas; original e historial intactos | PASS |
| R06 | Subtest R06: orden, UTF-8, Unicode compuesto/descompuesto, vacío/ausente, slots, separadores, límites y byte alterado | Orden equivalente; UTF-8 exacto sin normalización implícita; diferencias materiales distintas; 16384 bytes aceptados, exceso/UTF-8 inválido/NUL denegados | PASS |
| R07 | Subtest R07: ID/huella/scope/effect de parte, material y decisión de otra propuesta | Sustituciones denegadas sin cambios; parte exacta reservada | PASS |
| R08 | Subtest R08 y controles descritos arriba | Negativos denegados; sin evidencia reserva; positivo vigente/verificable rechazado incondicionalmente | FAIL — F03 |
| R09 | Estados humanos completos no ejecutados | Bloqueado por F03; ningún PASS heredado | BLOCKED |
| R10 | Matriz completa de locks no ejecutada; control previo expira en actor | Observación focal válida, insuficiente para toda la fila | BLOCKED |
| R11 | Escenario original F01 y controles corto/largo/combinado ejecutados antes de R08 | Rollback con F2 expirada/F1 viva; fila no completada como matriz total por fail-fast | BLOCKED |
| R12 | Carreras revoke/disable/generation y órdenes opuestos no ejecutados | Bloqueado por F03 | BLOCKED |
| R13 | F02 original ejecutado antes de R08; combinaciones restantes no ejecutadas | Wrapper técnico deniega F1 humana antes del core; partición completa no acreditada en esta etapa | BLOCKED |
| R14 | Acceso directo multirrol no ejecutado | Bloqueado por F03 | BLOCKED |
| R15 | Matriz GUC/reuse/temp no ejecutada | Bloqueado por F03 | BLOCKED |
| R16 | Carrera misma parte no ejecutada | Bloqueado por F03; concurrencia de unidades independientes previa no sustituye este caso | BLOCKED |
| R17 | Partes independientes no ejecutadas | Bloqueado por F03 | BLOCKED |
| R18 | Uncertain/retry no ejecutado | Bloqueado por F03 | BLOCKED |
| R19 | Reconcile exacto/mismatches no ejecutado | Bloqueado por F03 | BLOCKED |
| R20 | Known failure/success/consumed no ejecutado | Bloqueado por F03 | BLOCKED |
| R21 | Replay humano y pérdida post-COMMIT observados en control previo; E2 completo no ejecutado | Observación parcial, no PASS de fila | BLOCKED |
| R22 | Rollback de autoridad final observado en controles; inyecciones completas no ejecutadas | Snapshots intactos en abortos observados; no acredita toda la atomicidad requerida | BLOCKED |
| R23 | Derechos de los tres entrypoints consultados en F02; catálogo/roles completos no ejecutados | Inventario completo y ataques pendientes | BLOCKED |
| R24 | Bootstrap cadena histórica desde vacío usado; upgrade/fallos/C01 completos no ejecutados | Bootstrap no sustituye V-MIG/C01 independiente completo | BLOCKED |
| R25 | Procedencia histórica completa no ejecutada | Bloqueado por F03; R01 no sustituye la distinción productor/registrador/aprobador/ejecutor | BLOCKED |

### F01/F02 y controles históricos reejecutados

- Control corto: F2 edad `133 ms`, ledger wait real `104 ms`, COMMIT válido y una reserva.
- Espera M02 larga: F2 edad `30274 ms`, wait real `30246 ms`; expiración y rollback, sin residuos.
- F01 original combinado: M04 retorna antes del ledger, lock ledger real, F2 edad `30283 ms`, wait ledger `27222 ms`, F2 expirada y F1 todavía viva; `committed=false`, actividad sin cambio, cero reservas/events/receipts/operations/roots/attempts/history/results/intents nuevos. Proposal y decisión preparatorias previas conservadas.
- Expiración primera fase: lock real de actor >30 s, DENY antes de ledger y snapshot íntegro.
- Control normal concurrente, replay durable y pérdida simulada de respuesta realmente posterior al COMMIT: PASS; no se confunde con rollback pre-COMMIT ni con incertidumbre externa.
- F02 original: exactamente overload de tres argumentos y capability humana legítima, F2 edad `30276 ms`, F1 viva; `deniedBeforeLedger=true`, `realLedgerLockObserved=false`, `committed=false`, snapshot íntegro. El rechazo temprano es el esperado tras la partición; no se finge espera ledger que ya no se alcanza.

Estos seis escenarios pasan, pero **F01/F02 siguen FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION** porque toda R01–R25 no ha pasado. No se usa el resultado histórico 201/201 como acreditación actual.

### Ejecución, comprobaciones de publicación y límites

Entorno local: PostgreSQL 17.11 (Postgres.app), Node 24.21.0, pnpm 11.19.0. Suite independiente ejecutada con:

`POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h0-012.test.ts`

Resultado Node: **15 tests, 13 PASS, 2 FAIL, 0 skipped, 0 cancelled**, exit 1; duración `122843.933375 ms`. Hay **14 casos hoja: 13 PASS y 1 FAIL material R08**; el segundo FAIL de Node es el contenedor que propaga ese mismo fallo, no otro defecto. Se conserva el assert positivo fallido, sin invertirlo ni saltarlo.

`pnpm run typecheck` y `pnpm run lint` PASS tras corregir errores de autoría del nuevo test (sintaxis/tipo, sin cambios de producto ni expected). La regresión global (`install --frozen-lockfile`, audit, unitarios, `test:postgres` completo, build) **NO EJECUTADA en esta etapa por fail-fast**, conforme a la condición del bloque 34 de esta autorización. No se atribuyen conteos previos a esta ejecución.

Comprobaciones de publicación: `git diff --check` PASS; solo los cinco archivos autorizados; ninguna modificación de producto/migraciones/fuentes normativas. Comparación programática contra HEAD confirma que desde el primer encabezado histórico V-EVI todo el contenido anterior de evidencia (incluida la matriz normativa) permanece literal y contiguo, y que los seis cuerpos de tests anteriores están intactos. Secret scan del diff añadido: cero coincidencias de PAT, JWT, private key, SCRAM, URL PostgreSQL, asignación de credencial literal o email; revisión manual sin K-F1/K-F2, TOTP, QR, recovery secret ni datos reales. Las claves de fixtures existentes siguen generándose en memoria, no versionadas. La publicación conserva el fallo de reproducción explícito; no declara una suite verde.

Estado: H0-011 antecedente COMPLETED de implementación; H0-012 FAILED / NOT COMPLETED; F03 OPEN — MATERIAL / ALTA; F01/F02 pendientes formales. H0 IN PROGRESS, H0-013 NOT STARTED. PLAN-AUTH-002/006 PENDING globalmente. Auth/TOTP/recovery/dispositivos reales y H0-M03/M04 hosted siguen no acreditados. Supabase Staging no conectado ni modificado. D037/D038, fuentes APPROVED, código productivo, migraciones y Last Approved Commit `6248820e3253a9d88755ed0a4996fff8f865690e` intactos.

Próximo paso, SIN EJECUTAR: autorización humana separada para corregir H0-012-F03 (recorrido positivo confiable de revalidación de evidencia); posteriormente nueva ejecución formal completa R01–R25. Esta publicación no autoriza ese fix ni H0-013.

## Corrección localizada H0-012-F03 — revalidación positiva (2026-09-28)

Autorización separada sobre base `0b2b118bee0ea63b47c6971d2ac82f8a3d23f324`. Preflight: `main`, HEAD=origin/main=base, árbol limpio y remoto `IAndresB/crm-huescaventura-os`. No se ejecuta nueva matriz formal R01–R25, no se inicia H0-013 ni se conecta Supabase. Se releen F03/R08, Tasks H0-011/012, SPEC HA-002/AC-054, SM G2/HA-02 y Plan T08/§7.2/§8, además de adapter/M04/F01/F02 necesarios.

### Causa y alternativa elegida

Adapter y SQL denegaban toda evidencia requerida: faltaba una frontera confiable capaz de acreditar el positivo, no una simple condición booleana. Se añade un port servidor y prueba F1 específica, reutilizando firma, binding y verificador existentes. Se descartan un flag libre `verified=true`, aceptar solo el fingerprint aportado, quitar la guarda SQL, renovar F2, ampliar ventanas o duplicar firmas/ledger. La fuente sintética se implementa exclusivamente en tests.

- `src/application/evidence-revalidation.ts`: `EvidenceRevalidationProvider.revalidate(request)` recibe reference/fingerprint, expiración aprobada, proposal/command/part, material fingerprint y scope. La implementación inyectada por composición es autoridad servidor, no argumento público de `reserve` ni objeto de cliente.
- El resultado exige `reference`, `fingerprint`, `checkedAt`, `validUntil`, `verifierIdentity`, `verifierKind`, `outcome=verified`; se contrasta con la solicitud, se validan formato/tiempos/identidad y se calcula `effectiveValidUntil`. Un objeto congelado reconocido por WeakSet solo se obtiene tras invocar el port. JSON/copia/cast no fabrica esa marca. La confianza del port sigue siendo un supuesto explícito de composición, no una garantía criptográfica de JavaScript.
- `tests/fixtures/evidence-provider.ts`: registro de fuentes sintéticas propiedad del harness; lee sus bytes y recalcula SHA-256, exige scope exacto, registra momento actual y caducidad de la fuente. La solicitud no registra fuentes ni decide su validez. No hay proveedor real, Storage, Drive, email, WhatsApp ni datos personales.
- `runtime.ts` y `postgres-composition.ts` permiten inyectar opcionalmente el port. Sin él, una reserva nueva con evidencia deniega; material sin evidencia conserva su recorrido. La configuración/clave F1 debe autorizar explícitamente el purpose `h0-011-evidence-revalidation`; no se amplían claves provisionadas automáticamente ni se crea K nueva persistente.

### Prueba transaccional y SQL

El provider se invoca **fuera de cualquier transacción PostgreSQL abierta**. Después el servidor emite F1 en la transacción runtime real con resource `human_approval_evidence`, action `revalidate_evidence`, purpose `h0-011-evidence-revalidation`. No cambia protocolo F1, MAC, binding ni ventana F2.

Payload de entrada canónico `CRM-HA-EVIDENCE1`, con framing F1 existente: command, proposal, part, SHA-256 del comando humano completo, reference, fingerprint, checked_at, vigencia fuente, vigencia efectiva, identidad/tipo del verificador. Scope y binding xid8/PID/database/postmaster/generation/audience/login están en el envelope F1 autenticado. Los tiempos se transportan en microsegundos enteros.

`crm_api.h0_m04_revalidate_evidence` verifica F1 y F2, obtiene locks actor/session/epoch antes del advisory de command (mismo orden M04), compara con material/proposal/decision/part persistidos y exige aprobación, scope, command digest, reference y fingerprint exactos. Rechaza timestamps futuros/incoherentes, datos incompletos y prueba inválida. La rama M04 `reserve` solo acepta evidencia requerida con registro autenticado del mismo comando y xid actual; sin prueba no basta una decisión humana.

Se distinguen expresamente:

1. `approved_until_us`: caducidad incluida en el material aprobado;
2. `source_valid_until_us`: caducidad obtenida de la fuente;
3. `checked_us`: instante de comprobación del provider;
4. `clock_timestamp()` PostgreSQL: reloj real para admitir y finalizar.

`effective_until_us = min(approved_until_us, source_valid_until_us)`, comprobado por SQL y constraint. Se exige `checked_us <= reloj real < effective_until_us`. SQL no confía en reloj de cliente ni permite ampliar vigencia aprobada.

### Final de unidad, atomicidad e historia

Nueva tabla privada append-only `crm_ha.evidence_revalidations`: command/proposal/part, command fingerprint, reference/fingerprint, los cuatro tiempos relevantes (incluido recorded_at), identidad/tipo de verifier, scope, xid y outcome verificado. Command identifica la reserva exacta. No almacena bytes de fuente, K ni capabilities.

Owner `crm_h0_table_owner` NOLOGIN; ENABLE/FORCE RLS; executor F2 separado con SELECT/INSERT, sin UPDATE/DELETE; runtime/PUBLIC/anon/authenticated sin acceso. Funciones privilegiadas owner `crm_h0_f2_executor` NOLOGIN, search_path fijo y PUBLIC revocado; helpers privados no ejecutables por runtime. No hay nuevo rol ni signing oracle ni CREATE residual.

FK diferidas enlazan command con reservation, command receipt y operación M02: una prueba sola no puede quedar confirmada. El wrapper humano conserva sus comprobaciones F01/F02 y añade check de evidencia después del core M02 y de la F2 final. Un constraint trigger diferido vuelve a comprobar la vigencia al cerrar la transacción. Los errores revierten conjuntamente prueba, reserva, event/receipt, operación/root/attempt/history/result/intent y actividad humana. No cambia semántica del core M02 ni se introduce un commit parcial.

### Replay y E2

Una consulta F1 C01 estrecha (`h0_m04_evidence_replay`, action `check_replay`) reconoce únicamente existencia de receipt equivalente en scope. No devuelve resultado ni autoridad humana. Se cierra esa transacción antes de contactar el provider. Si ya existe, no se invoca provider; la operación real vuelve a pasar M04 y el wrapper humano F1/F2 vigente, recuperando ledger durable. E2 se conserva para command reutilizado con material diferente.

El registro de evidencia de un xid ya confirmado es historia, no una nueva autorización: su expiración posterior no impide leer replay autorizado, ni se renueva el registro. Para un efecto nuevo se exige prueba nueva en xid actual y comprobación de vigencia final. Si otro concurrente confirma mientras se verificaba la fuente, el receipt exacto se reconoce bajo el advisory lock sin duplicar comprobación/efecto.

### Migración forward y V-MIG focal

Nueva: `202609270003_h0_m04_evidence_revalidation_fix.sql`. M01/F1/M02/M03 y M04/000/001/002 permanecen byte-for-byte intactas. Para evitar duplicar cuerpos M04/M02 no relacionados, la migración sustituye dos fragmentos exactos de definiciones obtenidas del catálogo; exige una única coincidencia y aborta si el predecesor no coincide. No hay SQL dinámico de caller. CREATE OR REPLACE conserva identidad/ACL/owner; consulta de catálogo posterior lo verifica. Criterio contrastado con [PostgreSQL 17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html).

Ensayo local desde cadena vacía hasta 002; antes de 003 se establecen actor/session/epoch M03 y proposal/ledger M04/M02 sintéticos. Snapshot de tablas antes/después conserva fixtures. Autoridad runtime y bootstrap incorrecta denegadas `42501`; event trigger inyecta fallo DDL `P0001`, rollback elimina la tabla nueva y conserva datos y definiciones anteriores; aplicación posterior correcta; reaplicación denegada `42P07` sin corrupción. Tabla y cuatro funciones nuevas verificadas por catálogo: owners NOLOGIN, fixed search_path, RLS/FORCE RLS, EXECUTE mínimo y roles genéricos sin acceso.

### Pruebas focales

- Reproducer R08 conserva fuente/huella/material/aprobación, expected `reserved` y negativos. Solo se añade la conexión al provider sintético: el positivo ahora reserva. No se elimina, invierte ni marca skip.
- Sin evidencia: controles actuales continúan funcionando.
- Fuente caducada, referencia/fingerprint incorrectos, ausencia, fallo, respuesta incompleta/ambigua y checked_at futuro: DENY con snapshots sin residuo.
- SQL recibe pruebas incluso válidamente firmadas pero para otro command/proposal/part/scope/reference/fingerprint, checked_at incoherente o vigencia ampliada: DENY. MAC alterada: DENY. No se confunde test signer confiable con capacidad del rol runtime.
- Espera real sobre `unit_roots` después de retornar M04: la fuente caduca durante espera de ~1.8 s con F1/F2 aún vivas; rollback completo, incluida evidencia nueva y actividad. No se cambia la ventana F2 de 30 s. Control corto de 75 ms confirma mientras vigente.
- Replay positivo después de COMMIT, incluso tras caducar la comprobación y retirar la fuente: resultado durable previo, sin provider ni segunda reserva. Pérdida simulada de respuesta solo después de observar COMMIT en otra conexión. Command idéntico con evidencia/material distintos: E2.
- F01 y F02 originales mantienen waits reales de 30 s y sus expected; pasan focalmente, sin cierre formal.

Las ejecuciones de la suite H0-012 en esta etapa son **regresión de corrección**, no nueva reverificación normativa completa. No se ejecutan ni se acreditan R09–R25 como matriz formal.

### Resultado de ingeniería y límites de cierre

Entorno comprobado: PostgreSQL 17.11 (Postgres.app), Node 24.21.0 y pnpm 11.19.0. Solo clústeres locales efímeros, socket Unix, sin conexión hosted. Las fuentes/migraciones históricas se comparan contra el commit base; ninguna cambia. Las guías PostgreSQL/Supabase se usaron para revisar mínimo privilegio, RLS y conservación de ACL al reemplazar funciones; no sustituyen las fuentes normativas ni autorizan operaciones remotas.

| Comando / ensayo | Resultado final |
|---|---|
| `pnpm install --frozen-lockfile` | PASS; ya actualizado; lockfile intacto |
| `pnpm audit --prod` | PASS; sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS; import boundaries |
| `pnpm test` | 31/31 PASS; 0 FAIL/skipped/cancelled |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | 208/208 PASS; 0 FAIL/skipped/cancelled; ejecución final 130552.949 ms |
| Suite H0-012 dentro de esa regresión | 40/40 PASS (incluye contenedores/subtests), de ellos 25 focales F03; escenarios F01/F02/R08 preservados |
| `pnpm run build` | PASS; sin warnings relevantes observados |
| `git diff --check` | PASS |
| Secret scan del diff y archivos nuevos + revisión manual | PASS; cero credenciales/PAT/JWT/URL autenticadas/SCRAM/email real; ninguna K persistente |

**Total final: 239 PASS, 0 FAIL, 0 skipped, 0 cancelled** (unitarios + PostgreSQL; no se suman ejecuciones repetidas). Los 25 tests focales F03 incluyen la denegación SQL sin registro firmado y el rechazo al COMMIT de una prueba huérfana sin reserva/receipt/ledger. Todos los negativos comparan snapshots desde otra conexión; sin residuos de la unidad abortada.

Archivos productivos: nuevo port `src/application/evidence-revalidation.ts`; integración en `src/infrastructure/postgres/h0-011-adapter.ts`, `runtime.ts` y `src/server/postgres-composition.ts`; whitelist de targets específicos en `f1-codec.ts`, sin cambiar criptografía/protocolo F1. Persistencia: únicamente migración forward 003. Tests: fixture de fuente, unitarios del port y ampliación focal de suite H0-012; no se rebajan asserts históricos. Coordinación: solo esta evidencia, Tasks, PROJECT-STATUS y NEXT-STEPS.

**Estado final de corrección:** F03 FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION; F01/F02 mantienen FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION. H0-012 FAILED / NOT COMPLETED; H0-011 antecedente COMPLETED; H0-013 NOT STARTED; H0 IN PROGRESS. PLAN-AUTH-002/006 PENDING globalmente. Last Approved Commit `6248820e3253a9d88755ed0a4996fff8f865690e` intacto; sin D039.

Limitaciones: el provider productivo es un port, no un conector real; su composición, autoridad y reloj se deben acreditar al introducir una fuente real. Un fallo, ausencia o incoherencia de fuente deniega la parte dependiente. El positivo demostrado usa fuente sintética local; no acredita evidencia comercial, entrega externa, Auth/TOTP/recovery/dispositivos, H0-M03/M04 hosted ni Production. Supabase Staging no tocado. No se detectó otro defecto material distinto de F03 durante esta corrección.

Próximo paso, SIN EJECUTAR: nueva autorización para reverificación formal completa e independiente R01–R25 desde el commit correctivo publicado. El commit de esta etapa se identifica en Git por `fix(h0): support verified evidence revalidation`, hijo de la base exacta indicada arriba; no altera Last Approved Commit.

## Cuarta ejecución formal independiente — base eaf02a2 (2026-09-28)

Preflight: main, HEAD=origin/main=`eaf02a2ee976124462e2f8b59fbef31b0324c844`, árbol limpio, remoto correcto. Se releen selectivamente Tasks §2.2/H0-011/012, Plan B01/B08/C02/C03/C05/T08/§8, HA-001–005/CONC-002/AC-053–056/E1/E2/E4, SM G1–G6/HA-01–03 y D009/D016/D038. La matriz R01–R25 anterior se conserva sin cambiar ningún expected. No se heredan PASS de correcciones.

Plan adversarial fijado antes de ejecutar: además de repetir F01/F02 y los casos independientes R01–R08, R08 contrasta evidencia vigente/caducada, provider ausente/no disponible, identidad/material cruzados, replay y tiempo real. Se compara la comprobación diferida normal con `SET CONSTRAINTS ALL IMMEDIATE` emitido por runtime mientras la evidencia vive, seguido de un lock advisory real antes de COMMIT hasta que expire. Expected para ambos recorridos largos: DENY y rollback completo; control corto: COMMIT. Este expected deriva de Plan §7.2 (fuentes/permisos antes de confirmar), HA-002/AC-054/G2 y del requisito expreso de esta ejecución de que el trigger diferido no sea evitable por SQL permitido. [PostgreSQL 17 SET CONSTRAINTS](https://www.postgresql.org/docs/17/sql-set-constraints.html) documenta que IMMEDIATE adelanta los eventos pendientes, incluidos constraint triggers; no se cambia norma ni producto para acomodar ese comportamiento.

La ejecución continúa hacia R09–R25 solo si no aparece defecto material; cualquier fallo nuevo detiene la matriz y conserva los anteriores pendientes formales. Solo suite/evidencia/coordinación pueden cambiar.

### Resultado: FAILED — H0-012-F04 OPEN / MATERIAL / ALTA

**Defecto:** el runtime puede adelantar y agotar la comprobación final diferida de evidencia, y confirmar una nueva reserva después de que la evidencia haya caducado. No se alteran firma, payload, material, reloj, permisos, ventanas F1/F2 ni configuración productiva. No se usa un firmador runtime: las capabilities son las legítimas emitidas por el adapter a partir de la fuente sintética confiable.

**Fuentes vulneradas:** Plan §7.2 exige revalidar fuentes y permisos antes de confirmar; SPEC-FR-HA-002 y AC-054 exigen contexto/evidencia vigentes, SM G2 exige fuente/momento/vigencia. R08 exige rollback si la evidencia expira durante una espera anterior al final de unidad. R23 exige que el trigger diferido no pueda evitarse mediante SQL permitido a runtime. D038 §2 fija M2 con SQL arbitrario permitido; no es suficiente que el adapter ordinario no emita `SET CONSTRAINTS`.

**Causa delimitada:** `h0_m04_evidence_commit_guard` es un constraint trigger `DEFERRABLE INITIALLY DEFERRED`. La llamada SQL `SET CONSTRAINTS ALL IMMEDIATE`, permitida a runtime, dispara y agota sus eventos pendientes mientras la evidencia sigue vigente. Las FK diferidas pasan porque M04 y M02 ya han escrito todos sus registros dentro de la transacción. Un lock posterior no genera otro INSERT de evidencia ni rearma el trigger. El COMMIT no vuelve a comprobar esa vigencia. La comprobación explícita del wrapper humano ya ocurrió antes del lock.

**Diferencia frente a F01/F02/F03:** aquí el wrapper humano correcto termina, F1/F2 siguen vivas al liberar el lock y el positivo de evidencia ya existe. El defecto no consiste en ausencia de positivo, ni en seleccionar el overload técnico, ni en caducar F2 durante el ledger: se controla el momento del nuevo guard de evidencia desde SQL M2.

### Reproducción y controles

Suite independiente `tests/integration/postgres-h0-012.test.ts`, helper `finalEvidenceWait`, filas `R08 final evidence authority`. PostgreSQL 17.11 real, sockets locales efímeros; login `crm_h0_runtime`, max=1/prepare=false. Node 24.21.0 y pnpm 11.19.0. Sin proyecto hosted, proveedor real ni datos personales.

1. Crear fuente sintética con bytes conocidos y huella recalculada, vigencia fuente de 2.5 s y vigencia material aprobada de 60 s. Confirmar proposal IA y aprobación humana como preparación previa independiente.
2. Otra conexión toma un advisory lock transaccional con clave sintética fija `12008004`.
3. Ejecutar `reserve` mediante el adapter real: provider confiable, prueba F1, admisión F2, registro de evidence, reserva/event/receipt, wrapper humano M02, ledger/intención y checks finales normales.
4. Después de retornar el wrapper y antes del COMMIT, el driver de ensayo añade SQL permitido a runtime, sin modificar llamadas o resultados productivos: `SET CONSTRAINTS ALL IMMEDIATE` y `SELECT pg_advisory_xact_lock(12008004)`.
5. Comprobar desde otra conexión `pg_locks`: PID runtime bloqueado realmente en advisory, tras retornar M04/M02. Comprobar que el cambio a IMMEDIATE ocurrió mientras la evidencia aún vivía.
6. Con reloj real PostgreSQL esperar hasta `effective_until + 100 ms`; observar que F1/F2 todavía viven. Liberar el lock desde la conexión independiente.
7. Intentar COMMIT y consultar todas las tablas desde la conexión administrativa de inspección. El atacante nunca utiliza esa conexión para efectuar la operación; únicamente prepara el lock/fixture y observa persistencia.

Expected: DENY/rollback de la nueva unidad, conservando únicamente propuesta/decisión previas; actividad intacta. Observed: **COMMIT**, con 1 evidence_revalidation, 1 reservation, 1 event, 1 receipt, 1 root, 1 operation, 1 attempt técnico M02, 1 history, 1 result y 1 intent nuevos. La actividad humana cambia. La propuesta y decisión previas continúan existiendo. No ocurrió ningún efecto externo real.

| Caso | Evidencia al liberar | F1/F2 al liberar | Expected | Observed | Resultado |
|---|---|---|---|---|---|
| IMMEDIATE + lock corto (50 ms) | Vigente | Vigentes | COMMIT | COMMIT, unidad íntegra | PASS |
| Guard diferido normal + lock hasta expiración | Caducada | Vigentes | ROLLBACK | ROLLBACK, snapshot completo idéntico, 0 prueba nueva y actividad intacta | PASS |
| IMMEDIATE + mismo lock hasta expiración | Caducada | Vigentes | ROLLBACK | COMMIT con todos los registros nuevos y actividad cambiada | **FAIL MATERIAL F04** |

Los casos largos duran aproximadamente 2.63 s cada uno; no se reduce la ventana F2 de 30 s. Se aísla la caducidad de evidencia de la humana/técnica. La assertion `committed === false` permanece fallando, no invertida ni omitida. El test se detiene al fallo y no sigue con otras filas.

### Matriz de esta ejecución (sin PASS heredados)

Las fuentes y expected completos siguen en la matriz normativa inicial, intacta. Esta tabla registra su ejecución nueva, observación y estado. BLOCKED significa no completada en esta ejecución por F04, aunque existan ensayos históricos o incidentales; no acredita cobertura formal.

| Fila / requisito | Setup y expected de esta ejecución | Observed / test o consulta asociada | Estado |
|---|---|---|---|
| R01 HA-001/005: autoridad humana | IA y F1 técnica intentan decidir; solo humano vigente permite | Subtest R01: ambos denials con snapshots intactos; decisión válida conserva actor/session desde conexión independiente | PASS |
| R02 HA-001: pending/rejected | Reservar, intentar y registrar outcome sin aprobación válida: DENY | Subtest R02: todos denegados sin cambios en snapshot | PASS |
| R03 HA-003/AC-053 | Aprobar sin ejecutar: decisión, sin reserva/intento/success externo | Subtest R03: decisión=1, reserva=0, eventos de ejecución=0, external records=0 | PASS |
| R04 HA-001/002: material exacto | Persistir acción, versión, contenido, destinatario, importe, condiciones, scope/efecto | Subtest R04: bytes y hash calculados por framing independiente coinciden con proposal/decision persistidas | PASS |
| R05 HA-002/AC-054 | Mutar ocho componentes uno a uno; DENY y original intacto | Subtest R05: hash original o hash coherente de variante no permiten reserva; snapshots iguales | PASS |
| R06 V-DOM/HA-002 | Orden, Unicode/UTF-8, empty/absent/unknown/not-applicable, límites/NUL/bytes/separadores | Subtest R06: referencia independiente, distinción compuesta/descompuesta, límite exacto 16384 y exceso rechazado, sin ambigüedad ensayada | PASS |
| R07 T08/HA-004 | Cambiar ID/hash/scope/efecto de parte y decisión/propuesta cruzadas | Subtest R07: variantes denegadas, parte exacta reservada; snapshots negativos intactos | PASS |
| R08 AC-054/HA-002/G2 | Evidencia positiva, negativos, replay y vigencia al final | Positivo real y replay sin provider PASS; caducidad material/fuente, ausencia, fingerprint, provider, proof cruzada/alterada DENY. IMMEDIATE permite confirmar evidencia caducada tras lock: F04 | FAIL |
| R09 D038: estado humano | Revoked/disabled/stale/old epoch/MFA/ready: DENY | No ejecutada íntegramente: parada material en R08 | BLOCKED |
| R10 D038: todos los locks | F2 caduca en actor/session/epoch/advisory/parte: DENY | La regresión primera fase/actor pasa, pero no se ejecuta matriz completa de recursos por fail-fast | BLOCKED |
| R11 D038/C03: F01 | Escenario original actor+ledger, F2 expirada/F1 vigente; rollback; control corto | Reejecución original: edad F2 30257 ms, ledger 27193 ms, rollback sin residuos/activity. Largo ambas expiradas también rollback; corto 104 ms COMMIT. No usa evidence en este escenario histórico | PASS |
| R12 D038 §15/CONC-002 | Carreras revoke/disable/generation en órdenes opuestos | No ejecutada: fail-fast F04 | BLOCKED |
| R13 D038: partición F01/F02 | F1/F2 exactas y targets cruzados, sin ruta humana alternativa | Reproducer F02 reejecutado DENY antes del ledger; faltan restantes combinaciones formales por fail-fast | BLOCKED |
| R14 V-DAT | CRUD/helpers runtime/PUBLIC/anon/authenticated: DENY | No ejecutada íntegramente: fail-fast F04 | BLOCKED |
| R15 D038: residual | GUC/payload copiado/error/rollback/reuse/temp: sin autoridad | No ejecutada: fail-fast F04 | BLOCKED |
| R16 HA-004/CONC-002 | Misma parte simultánea, máximo una reserva | No ejecutada: fail-fast F04 | BLOCKED |
| R17 T08 | Partes distintas/consumida/pendiente separadas | No ejecutada: fail-fast F04 | BLOCKED |
| R18 E4/G6 | Uncertain conserva reserva e impide retry peligroso | No ejecutada: fail-fast F04 | BLOCKED |
| R19 Plan §8 | Solo attempt/reservation/result incierto exacto concilia | No ejecutada: fail-fast F04 | BLOCKED |
| R20 HA-003/004 | Failed conocido, nuevo intento seguro, consumed no repetible | No ejecutada: fail-fast F04 | BLOCKED |
| R21 E2/V-AT | Replays humanos/técnicos/evidencia y conflictos materiales | Replay humano/post-COMMIT y replay evidencia sin provider pasan como casos ejecutados; fila completa no finalizada | BLOCKED |
| R22 C03/V-AT | Fault injection en todas las fronteras y post-COMMIT distinto de uncertain | Control diferido caducado revierte snapshot completo; resto de fault matrix no ejecutado | BLOCKED |
| R23 D038/V-DAT: SQL surface | Incluye guard diferido no evitable desde runtime | **Mismo ataque F04 de R08**, sin búsqueda adicional: SET CONSTRAINTS permitido neutraliza comprobación al COMMIT. Auditoría restante detenida | FAIL |
| R24 V-MIG/C01 | Cadena/upgrade/fixtures/autoridades/falloDDL y lectura scope | Bootstrap ensaya cadena y upgrade F03, preservación, DDL failure/rollback/reapply; no fila completa C01/predecesores | BLOCKED |
| R25 HA-001/003/G4 | Procedencia IA/registrador/aprobador/ejecutor/source inequívoca | No ejecutada: fail-fast F04; no PASS inferido de proposer_kind | BLOCKED |

R01–R07 y R11 PASS; R08/R23 FAIL por **un único defecto nuevo**; otras 15 filas BLOCKED. F01/F02 originales pasan en esta ejecución, pero F01/F02/F03 permanecen FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION: no se cierra ninguno sin matriz completa.

### Comandos, conteos y límites

Comando reproducible de la ejecución formal detenida:

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types --test-name-pattern='H0-012 R11|F01 correction|H0-012 fourth formal execution' tests/integration/postgres-h0-012.test.ts
```

Selección explícita: escenarios históricos obligatorios F01/F02, controles y nueva matriz secuencial. Los tests focales de implementación posteriores no se seleccionan ni se reinterpretan como PASS formal. No hay `.skip` ni reducción de tiempos/expectativas. Si R08 hubiese pasado, habría continuado la ampliación/ejecución de las filas restantes; F04 exige detenerla.

Resultado real: **19 resultados Node: 17 PASS, 2 FAIL, 0 skipped, 0 cancelled**, duración 128493.641 ms. Los 2 FAIL son el caso F04 y su contenedor, no dos defectos: **18 casos hoja, 17 PASS y 1 FAIL**. Typecheck PASS antes de ejecutar. La regresión global (install/audit/unitarios/PostgreSQL total/build) no se ejecuta después del fail-fast, conforme §33 de esta autorización; no se heredan los 239 PASS de la corrección F03.

Comprobaciones de publicación: **typecheck PASS, lint/import boundaries PASS, git diff --check PASS**. Revisión de alcance: solo cinco archivos autorizados; src/migraciones/fuentes normativas intactos. Comprobación programática de cronología: todo el contenido anterior desde `## V-EVI` permanece íntegro, con nueva etapa añadida y resumen vigente actualizado. Escaneo del diff: 0 PAT/JWT/private keys/connection strings/SCRAM/credenciales literales/emails; revisión manual sin material sensible persistente. No se implementa solución ni se propone aquí una nueva decisión arquitectónica. Las guías PostgreSQL/Supabase se usaron para contrastar permisos y semántica de triggers, no como sustituto de los expected normativos.

Estado: H0-011 antecedente COMPLETED; H0-012 FAILED / NOT COMPLETED; F04 OPEN — MATERIAL / ALTA; F01/F02/F03 pendientes formales. H0 IN PROGRESS, H0-013 NOT STARTED, PLAN-AUTH-002/006 PENDING globalmente. Last Approved Commit `6248820e3253a9d88755ed0a4996fff8f865690e` intacto. Auth/TOTP/recovery/dispositivos, H0-M03/M04 hosted y Production no acreditados; Supabase Staging no conectado ni modificado.

Próximo paso, SIN EJECUTAR: autorización humana separada para corregir H0-012-F04 y preservar una garantía final de vigencia no adelantable por SQL permitido a runtime; después nueva reverificación completa R01–R25. Esta publicación no autoriza el fix, D039 ni H0-013.

## Corrección localizada H0-012-F04 — comprobación y COMMIT indivisibles (2026-09-28)

Preflight obligatorio: repositorio `IAndresB/crm-huescaventura-os`, rama `main`, `HEAD=origin/main=70cf54cdfd81a4a1cfaec671ed9cc3dd0ffe6f30`, árbol limpio. Se trabajó en local, sin rama nueva, sin Cloud y sin conexión a Supabase Staging. Se releen únicamente F04 y sus controles, la migración 003, la composición M04→M02, `h0-011-adapter` y `transaction.ts`. La cronología F01–F04 anterior permanece intacta.

### Puerta de diseño

La reproducción previa se ejecutó primero en PostgreSQL 17.11: `SET CONSTRAINTS ALL IMMEDIATE` agotaba el `h0_m04_evidence_commit_guard` mientras la evidencia seguía vigente; el lock advisory posterior permitía que la evidencia caducara y el `COMMIT` confirmaba toda la unidad. Resultado previo: `COMMIT`, una prueba y nuevas filas en reservations, events, receipts, operations, roots, attempts, history, results e intents; actividad modificada.

Se estudiaron estas alternativas:

1. Mantener el constraint trigger diferido y añadir otra comprobación explícita: insuficiente si devuelve el control al driver con la transacción abierta.
2. `transaction_timeout` de PostgreSQL 17.11: el ensayo aislado aborta y revierte al vencer, pero el rol runtime puede sobrescribir el GUC con `SET LOCAL`; no es una garantía de autoridad.
3. `CALL`/procedimiento con control transaccional: exigiría rehacer la frontera de capabilities F1/F2 ligadas a `xid`/backend, porque la aplicación firma después de obtener el binding dentro de la transacción explícita; no es una corrección localizada.
4. Frontera explícita en el adaptador: el último mensaje del servidor ejecuta `h0_m04_finalize_evidence(command_id)` y `COMMIT` en secuencia, sin devolver control entre ambos. Esta fue la alternativa menor compatible con F1/F2 y la atomicidad existente.

### Implementación y garantía

La migración forward `20260927231932_h0_m04_f04_transaction_commit_guard.sql` añade únicamente el wrapper `crm_api.h0_m04_finalize_evidence(text)`, con owner NOLOGIN `crm_h0_f2_executor`, `search_path` fijo y `EXECUTE` solo para `crm_h0_runtime`; el wrapper delega en el helper privado existente. `src/infrastructure/postgres/h0-011-adapter.ts` emite, solo para una operación nueva con evidencia, `select crm_api.h0_m04_finalize_evidence('<command_id>'); commit` mediante una única consulta sin parámetros; `command_id` ya está validado por `assertId`.

Por ello cualquier SQL M2 adicional, incluido `SET CONSTRAINTS ALL IMMEDIATE`, debe ocurrir antes del mensaje final y no puede consumir una comprobación posterior: el wrapper vuelve a leer `clock_timestamp()` después de la espera y, si la evidencia caducó, falla antes de `COMMIT`. Si sigue vigente, el servidor ejecuta el `COMMIT` inmediatamente en la misma secuencia; no queda un intervalo de código o driver entre la última comprobación y la confirmación.

### Ensayos focales y V-MIG

El control focal actualizado inserta el SQL adversarial antes del mensaje final: lock advisory real observado desde otra conexión, control corto vigente, guard diferido expirado e `IMMEDIATE` expirado. Los tres casos pasan: el corto confirma; ambos casos expirados hacen rollback. La suite completa `tests/integration/postgres-h0-012.test.ts` termina **44/44 PASS, 0 skipped, 0 cancelled**, incluyendo F01, F02, F03 positivo/negativos, replay sin provider, operación normal y controles de rollback.

V-MIG de la nueva migración pasa en PostgreSQL 17.11: cadena local desde vacío hasta 003 y upgrade 003→004; runtime y bootstrap incorrectos reciben `42501`; fallo DDL inyectado produce rollback sin dejar la función nueva ni alterar fixtures; retirada la inyección, la aplicación correcta conserva el snapshot previo. No se modifica 003 ni migraciones anteriores.

Resultado de esta etapa: **F01 = FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION; F02 = FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION; F03 = FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION; F04 = FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION**. **TSK-H0-012 = FAILED / NOT COMPLETED**. **H0-013 = NOT STARTED**. No se ejecuta R01–R25 completa.


## Quinta ejecución formal independiente — base c38c896 (2026-09-28)

### Preflight, fuentes y criterio previo

Autorización exclusiva de reverificación formal H0-012, con parada ante el primer defecto material y publicación de test/evidencia/coordinación. Preflight ejecutado en el orden solicitado: `pwd`, `git rev-parse --show-toplevel`, `git branch --show-current`, `git remote -v`, `git fetch origin`, `git rev-parse HEAD`, `git rev-parse origin/main`, `git status --short`, `git status --branch --short`. Resultado: `/Users/andres/Developer/crm-huescaventura-os`, rama `main`, remoto `git@github.com:IAndresB/crm-huescaventura-os.git`, **HEAD = origin/main = c38c896ac2d9de350782e5afb189b9e95dae6156**, árbol limpio. Local, sin nueva rama, Cloud ni conexión a Supabase Staging.

Fuentes contrastadas selectivamente antes de editar: README, Tasks §2.2–2.3 y H0-011/012, Plan B01/B08/C02/C03/C05/T08/§7.2/§8, SPEC HA-001–005/CONC-002/AC-053–056/E1/E2/E4, State Machines G1–G6/SM-HA-01–03 y D009/D016/D038. Después se contrastan la matriz histórica, evidencia F01–F04, suite H0-012, adaptador y migraciones de corrección. No se cambia ningún expected de la matriz normativa inicial.

Orden: escenarios originales F01/F02 y controles, después R01–R08 secuenciales; continuar R09–R25 solo si no aparece defecto. Los PASS siguientes son nuevas ejecuciones desde esta base. R11 ya se ejecuta completo en los controles iniciales. Los otros controles parciales no acreditan filas enteras.

Expected adversarial previo: D038 §2 permite a M2 elegir cualquier SQL permitido al login runtime; no se confía en TypeScript. Por tanto, además de añadir SQL antes del mensaje final F04, runtime puede **sustituir ese mensaje por COMMIT** o **invocar la función final mientras la evidencia vive y confirmar separadamente después de la espera**. En todos los casos largos, HA-002/AC-054/G2/Plan §7.2 exigen rollback si la evidencia caduca antes de finalizar. El comportamiento actual del adaptador no reduce ese expected.

### Resultado: H0-012-F05 — OPEN / MATERIAL / ALTA

**Defecto reproducido:** la función `crm_api.h0_m04_finalize_evidence(text)` es una comprobación invocable, pero su ejecución inmediatamente antes de COMMIT no es obligatoria en la frontera SQL de runtime. El mensaje conjunto de F04 protege el recorrido que conserva el adaptador. Un caller M2 puede elegir otro mensaje SQL y confirmar una unidad con evidencia ya caducada.

No es falsificación de claves, MAC, input, binding, reloj ni material. Una unidad legítima recibe sus capacidades F1/F2 y prueba de evidencia por el servidor del fixture; el proxy adversarial utiliza exclusivamente la conexión runtime y esos argumentos ya emitidos. No accede a los firmadores ni cambia argumentos. `session_user = current_user = crm_h0_runtime` se comprueba durante el ataque. Las conexiones administrativas solo preparan el bloqueo y observan persistencia; no ejecutan el COMMIT atacado ni alteran los datos de esa unidad.

**Reproducer conservado:** `tests/integration/postgres-h0-012.test.ts`, subtest `R08/R23 M2: final evidence authority must survive omission or early invocation of the F04 wrapper`, helper `finalEvidenceWait`, modos `runtime-commit-expired` y `split-finalize-expired`.

1. Propuesta IA y decisión humana exactas, confirmadas mediante el adaptador público, con source sintética identificada, fingerprint contrastado y vigencia efectiva de 2500 ms; material aprobado por 60000 ms.
2. El servidor revalida la fuente y emite las capacidades originales. Runtime ejecuta revalidación, M04 y overload humano M02 sin cambios de bytes. Todas las guardas iniciales pasan y las escrituras siguen dentro de la transacción.
3. Antes del mensaje final, runtime comprueba su login/rol y que la evidencia todavía vive. Ejecuta `SET CONSTRAINTS ALL IMMEDIATE`, que evalúa anticipadamente el constraint trigger y las FK pendientes.
4. En la variante principal omite el finalizador. En la variante de caracterización llama a `select crm_api.h0_m04_finalize_evidence($1)` y obtiene retorno satisfactorio mientras la evidencia vive.
5. Runtime espera un lock advisory PostgreSQL real (`pg_advisory_xact_lock(12008004)`) retenido por otra conexión. La conexión observadora comprueba `pg_locks` para el PID runtime. El reloj real `clock_timestamp()` supera la caducidad de la evidencia en al menos 100 ms; F1/F2 siguen vigentes.
6. Se libera el lock; runtime ejecuta únicamente `COMMIT`. Otra conexión consulta todas las tablas del snapshot y los conteos específicos de la unidad.

**Expected:** rollback íntegro, preparación previa conservada, ninguna nueva evidence/reservation/event/receipt/operation/root/attempt/history/result/intent, actividad intacta.

**Observed:** ambas variantes confirman. Cada una deja **1 evidence_revalidation, 1 reservation, 1 event, 1 receipt, 1 operation, 1 root, 1 attempt de ledger, 1 history, 1 result y 1 intent**; cambia la actividad humana. Proposal=1 y decision=1 previas se conservan. No se ha contactado un proveedor de efectos ni se acredita envío/ejecución externa.

La variante principal libera el lock a `1790615855777621` µs, después de `effective_until = 1790615855661000` µs (**116621 µs caducada**). La variante con finalizador adelantado lo libera a `1790615861022508` µs, después de `1790615860919000` µs (**103508 µs caducada**). En ambas: `realAdvisoryWait=true`, `checkedWhileLive=true`, `immediateApplied=true`, `f1LiveAtRelease=true`, `f2LiveAtRelease=true`, `committed=true`. Solo la segunda tiene `earlyFinalizerReturned=true`.

La assertion normativa permanece `committed === false` y falla. No se invierte, elimina ni marca skip. F05 registra la insuficiencia de la corrección F04 frente al caller SQL M2; la reproducción histórica F04 con el mensaje final intacto sí pasa ahora. F01–F04 no se cierran ni se reescribe su historia.

### R08 completo hasta la parada y controles del mismo defecto

| Caso / setup | Expected | Observed actual / comprobación posterior | Resultado |
|---|---|---|---|
| Material sin evidence requerida | Reserva exacta permitida | `reserved`; persistencia real | PASS |
| Evidence vigente, fuente independiente, fingerprint exacto | Revalidar y reservar | `reserved`, huella/material coinciden | PASS |
| Material evidence caducado | DENY y rollback | Rechazo; snapshot independiente idéntico | PASS |
| Source caducada | DENY y rollback | Rechazo; snapshot idéntico | PASS |
| Fingerprint de source diferente | DENY y rollback | Rechazo; snapshot idéntico | PASS |
| Reference inexistente | DENY y rollback | Rechazo; snapshot idéntico | PASS |
| Provider falla con excepción | DENY y rollback | Rechazo; snapshot idéntico | PASS |
| Provider devuelve no disponible / no hay provider configurado | DENY y rollback | Ambos rechazados; snapshots idénticos | PASS |
| Proof autenticada con proposal, part o scope incorrectos | DENY y rollback | Cada variante denegada; snapshot idéntico | PASS |
| MAC de proof alterada | DENY y rollback | Denegado; snapshot idéntico | PASS |
| Replay confirmado, source retirada y adaptador sin provider | `previous`, sin revalidación nueva | `previous` de la reserva confirmada | PASS |
| `IMMEDIATE`, wait corto, mensaje final F04 intacto | COMMIT vigente | COMMIT; 1 proof y unidad completa desde otra conexión | PASS |
| Guard diferido, evidence caduca, mensaje final F04 intacto | Rollback | Proof=0; snapshot completo intacto | PASS |
| F04 original: `IMMEDIATE`, espera real y caducidad, mensaje final intacto | Rollback | Proof=0; snapshot completo intacto | PASS |
| M2 omite finalizador; `IMMEDIATE` y wait corto | COMMIT vigente | COMMIT; 1 proof y unidad completa | PASS |
| M2 omite finalizador; `IMMEDIATE` y evidence caduca | Rollback | **COMMIT con evidencia caducada y unidad completa** | **FAIL — F05** |
| Caracterización F05: omitir finalizador sin adelantar constraints; evidence caduca | Rollback | Trigger diferido deniega; snapshot completo intacto | PASS |
| Caracterización F05: `IMMEDIATE`, llamar finalizador antes del wait, evidence caduca, COMMIT separado | Rollback | **Finalizador retorna vigente; COMMIT posterior persiste evidencia caducada** | **FAIL — mismo F05** |

Las dos últimas observaciones se ejecutan exclusivamente para caracterizar F05, dentro del mismo subtest, antes de propagar su assertion fallida. No se prosigue a filas posteriores. El control diferido distingue la causa: al agotar el trigger anticipadamente, el COMMIT independiente carece de una nueva comprobación obligatoria. La semántica de PostgreSQL para [SET CONSTRAINTS](https://www.postgresql.org/docs/17/sql-set-constraints.html) incluye constraint triggers y explica la evaluación anticipada; [COMMIT](https://www.postgresql.org/docs/17/sql-commit.html) hace visibles los cambios a otras conexiones. La prueba local, no la documentación por sí sola, acredita el fallo.

### Matriz de esta ejecución — 25 filas, sin PASS heredado

`formalSnapshot` lee desde una conexión administrativa distinta de runtime las tablas M04, M02, actor/session/epoch y evidence. `deniedWithoutChanges` compara antes/después completos. `snapshot(id)` consulta conteos específicos y actividad. Para filas BLOCKED se conserva el expected normativo y se identifica lo no ejecutado; no se simula cobertura.

| ID / requisito | Expected previo | Setup y test/consulta utilizados | Observed / verificación independiente | Resultado |
|---|---|---|---|---|
| R01 HA-001/005, D009/D016 | IA/técnico no decide; humano vigente sí | Subtest R01: propuesta IA, sin auth y F1 técnica por SQL, decisión humana | Denials sin cambios; decisión conserva actor/session exactos | PASS |
| R02 HA-001, SM-HA-01 | Pending/rejected sin reserva ni ejecución | Subtest R02: reserve/attempt/outcome sobre ambos estados | Todos denegados; snapshots intactos | PASS |
| R03 HA-003, AC-053 | Aprobación no equivale a ejecución | Subtest R03; conteos por proposal/operation | 1 decisión; 0 reservas, eventos de ejecución y registros externos | PASS |
| R04 HA-001/002, Plan §8 | Todos los campos materiales fijados | Subtest R04; importe y condiciones sintéticos; framing/hash independientes | Bytes de proposal y hash de decision exactos desde otra conexión | PASS |
| R05 HA-002, AC-054 | Cada cambio material deniega; historia intacta | Subtest R05: action/version/content/recipient/amount/conditions/scope/effect; hash original y de variante | 16 intentos rechazados sin cambios | PASS |
| R06 HA-002, V-DOM | Canonicalización inequívoca; límites válidos | Subtest R06: UTF-8/Unicode, orden, empty/absent/unknown/not-applicable, 16384 bytes/exceso, NUL, alteración de byte | Referencia independiente coincide; diferencias separadas; inválidos rechazados; prueba pura sin persistencia | PASS |
| R07 T08, HA-004 | Parte/material/scope/effect/decision/proposal exactos | Subtest R07: swaps e intento exacto | Variantes denegadas con snapshots intactos; parte exacta reservada | PASS |
| R08 HA-002, AC-054, G2 | Revalidación positiva y vigente hasta finalizar | Casos R08 y helper `finalEvidenceWait`; tabla anterior | Positivo/negativos y F04 ordinario pasan; runtime confirma caducada omitiendo/adelantando finalizador | **FAIL — F05** |
| R09 D038 §§11–18 | Revoked/disabled/generation/epoch/MFA/ready deniegan | Matriz de estados no alcanzada | Sin resultado completo: fail-fast F05 | BLOCKED |
| R10 D038 §§4/6/13–15 | Caducidad en actor/session/epoch/advisory/parte revierte; corto pasa | Control previo actor >30 s; no toda la matriz de locks | Actor deniega sin llegar a M02; no acredita otros recursos | BLOCKED |
| R11 D038 §§4/6/14, C03 | F01 original revierte aun con F1 viva; corto confirma | Tres tests `H0-012 R11`; actor 3 s + lock M02 real; snapshots por ID | F2 30250 ms, ledger 27187 ms, F1 viva: rollback; corto 103 ms confirma; ambas caducadas revierte | PASS |
| R12 D038 §15, CONC-002 | Revocación/disable/generation con órdenes opuestos coherentes | Carreras completas no alcanzadas | Detenida por F05 | BLOCKED |
| R13 D038 §§1/4/5/14 | F1/F2 y purpose/resource/action/scope/input exactos | F02 original inicial; combinaciones restantes no alcanzadas | F02 deniega antes del core; no acredita la partición completa | BLOCKED |
| R14 V-DAT | Runtime/PUBLIC/anon/authenticated sin interfaces ni DML indebidos | Auditoría multirrol no alcanzada | No se heredan ACL históricas | BLOCKED |
| R15 D038 §§2/5 | Error/rollback/commit/reuse/GUC/temp sin autorización residual | Matriz residual no alcanzada | Detenida por F05 | BLOCKED |
| R16 HA-004, CONC-002, AC-055 | Dos conexiones/misma parte: máximo una reserva | Carrera específica no alcanzada | Detenida por F05 | BLOCKED |
| R17 T08, HA-004 | Partes independientes; consumida no se repite | Recorrido por dos partes no alcanzado | Detenido por F05 | BLOCKED |
| R18 E4, G6, T08 | Uncertain mantiene reserva y bloquea segundo efecto | Attempt/uncertain/retry no alcanzado | Detenido por F05 | BLOCKED |
| R19 Plan §8, HA-003 | Solo attempt/reservation/reference uncertain exactos concilian | Reconcile succeeded/failed y mismatches no alcanzados | Detenido por F05 | BLOCKED |
| R20 HA-003/004 | Known failure permite continuación segura; success consume sin repetir | Failure/new attempt/success/consumed no alcanzado | Detenido por F05 | BLOCKED |
| R21 E2, V-AT | Replay equivalente previous; material/evidence diferentes E2 | Control inicial replay humano/post-COMMIT y R08 sin provider; matriz E2 pendiente | Casos parciales pasan; no PASS formal de fila | BLOCKED |
| R22 C03, V-AT, E4 | Fallos antes de COMMIT rollback; post-COMMIT/uncertain distintos | Rollbacks F01/evidence y control post-COMMIT observados; fault injection completo pendiente | Snapshots de controles acreditados; no toda la fila | BLOCKED |
| R23 D038 §§2/19, V-DAT | Frontera F04 no eludible por SQL runtime, incluso constraints anticipadas | Mismo ataque R08; login/current_user runtime; COMMIT y finalizador separados | Frontera opcional eludida; resto del inventario SQL detenido | **FAIL — mismo F05** |
| R24 V-MIG, C01 | Cadena/upgrade/fixtures/autoridades/falloDDL/rollback y scope correcto | Bootstrap vacío hasta 002; upgrades 003/004 con fixture M02/M03/M04, autoridad incorrecta, DDL failure y retry | Bootstrap/controles pasan; no cubre V-MIG completo F01/F02 ni lectura C01/scope | BLOCKED |
| R25 HA-001/003, G4 | IA/registrador/aprobador/sesión/ejecutor/attempt/result/source inequívocos | Reconstrucción completa no alcanzada | No PASS por `proposer_kind` ni por R01 | BLOCKED |

Resultado de filas: **8 PASS, 2 FAIL, 15 BLOCKED**. Los dos FAIL son un único defecto material F05 compartido por R08 y R23. No se inicia una búsqueda de otros defectos.

### F01–F04 y controles anteriores reejecutados

- **F01 original:** PASS actual. Wait previo actor y wait M02 real; F2 30250 ms, F1 posterior vigente; rollback de todos los campos del snapshot. Control corto: F2 131 ms, wait ledger 103 ms, COMMIT. Control ambas expiradas: wait ledger 30270 ms, rollback completo.
- **Primera fase:** wait actor >30 s deniega antes de M02; ninguna F1 de ledger emitida; actividad y snapshot intactos.
- **F02 original:** PASS actual. F2 30288 ms y F1 viva; el overload técnico deniega antes de llegar al core/lock M02, `deniedBeforeLedger=true`. Snapshot intacto. Las interfaces runtime M04/M02 técnica/M02 humana aparecen ejecutables en la consulta inicial, como espera la partición de propósito.
- **F03:** recorrido positivo y negativos requeridos de R08 pasan; replay de reserva confirmada devuelve previous con source retirada/adaptador sin provider. No se hereda el resultado focal anterior.
- **F04:** los tres controles con el mensaje final intacto pasan, incluido IMMEDIATE + wait real + caducidad. **F05 impide afirmar que esa frontera sea obligatoria para SQL M2.**
- **Estado final de cada uno, F01, F02, F03 y F04: FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION.** Ninguno CLOSED porque no pasa toda R01–R25.

### Ejecución, conteos, publicación y límites

Entorno observado: PostgreSQL **17.11 (170011)**, Node **24.21.0**, pnpm **11.19.0**. Clúster efímero con socket Unix y TCP deshabilitado. Datos/identidades/fuentes sintéticas; claves aleatorias solo en memoria. Teardown completado: servidor local detenido y directorio efímero eliminado.

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types --test-name-pattern='H0-012 R11|F01 correction|H0-012 fifth formal execution' tests/integration/postgres-h0-012.test.ts
```

Resultado Node: **21 tests; 19 PASS; 2 FAIL; 0 skipped; 0 cancelled; 0 todo**, exit 1; duración **136618.172167 ms**. Son **20 casos hoja: 19 PASS y 1 FAIL material**; Node cuenta además el contenedor fallido. La segunda variante de F05 es diagnóstico dentro del mismo caso hoja, no otro defecto ni otro test contado. De los 20 casos hoja, 6 son controles históricos reejecutados y 14 pertenecen a la matriz hasta la parada.

| Comprobación | Resultado de esta ejecución |
|---|---|
| H0-012 formal PostgreSQL seleccionado | FAILED: 21 tests / 19 PASS / 2 FAIL / 0 skipped / 0 cancelled |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS, import boundaries |
| `git diff --check` | PASS |
| Secret scan razonable del diff permitido | PASS; sin patrones de claves privadas, PAT, JWT, URL PostgreSQL autenticada, claves Supabase o SCRAM; sin claves/credenciales en diagnósticos |
| `pnpm install --frozen-lockfile`, `pnpm audit --prod`, `pnpm test`, `pnpm run build` | NO EJECUTADOS: la regresión completa del apartado 27 estaba condicionada a no encontrar defecto material; parada F05 |
| `POSTGRES_H0_BIN=… pnpm run test:postgres` completo | NO EJECUTADO por fail-fast; no se atribuyen los 212/212 históricos a esta ejecución |
| Total de tests efectivamente ejecutados | 21 contados por Node: 19 PASS, 2 FAIL, 0 skipped, 0 cancelled; 20 hojas, un único fallo material |

La selección se limita a los controles originales y la nueva ejecución secuencial. Los tests focales restantes no se seleccionan; Node informa 0 skipped, lo que **no significa cobertura de esos tests ni de las filas BLOCKED**. No se continúa la matriz ni la regresión PostgreSQL completa tras F05. Solo se realizan controles estáticos de publicación.

Publicación autorizada exclusivamente de cinco archivos: suite H0-012, esta evidencia, Tasks, PROJECT-STATUS y NEXT-STEPS. Mensaje de commit: `test(h0): record further human approval verification failure`, hijo directo de la base obligatoria. Sin producto, migraciones, dependencias, lockfile, fuentes normativas ni D039. Last Approved Commit conserva `6248820e3253a9d88755ed0a4996fff8f865690e`.

Estado: **TSK-H0-011 COMPLETED como antecedente local; TSK-H0-012 FAILED / NOT COMPLETED; F05 OPEN / MATERIAL / ALTA; F01–F04 FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION; H0-013 NOT STARTED; H0 IN PROGRESS; PLAN-AUTH-002/006 PENDING globalmente**. H0-M03/M04 hosted, Auth/TOTP/recovery/dispositivos reales y Production no acreditados. Supabase Staging **sin conexión ni cambios** en esta ejecución.

Siguiente paso recomendado, **SIN EJECUTAR**: autorización separada para analizar y corregir F05 mediante una frontera de finalización obligatoria bajo el modelo M2 aprobado, preservando F01–F04. Después, nueva reverificación formal completa e independiente R01–R25. Esta publicación no autoriza el fix, D039, H0-013 ni hosted.

## Etapa posterior — puerta experimental F05: BLOCKED BY DESIGN (2026-09-28)

### Alcance, base y conclusión

Autorización exclusiva para analizar F05, reproducir sus variantes y ensayar PostgreSQL 17.11 antes de cualquier fix. Preflight ejecutado en el orden requerido: `git fetch origin`, `git rev-parse HEAD`, `git rev-parse origin/main`, `git branch --show-current`, `git status --short`. Resultado: **HEAD = origin/main = `2aeaeeaa55f5ce7bc525a4d02227ee205e45d7b5`; main; árbol limpio**. Trabajo local en el checkout existente, sin rama nueva ni Cloud. README sin reglas adicionales; no se encontró AGENTS.md en el checkout/ancestros inspeccionados. La lectura técnica se limita a F05/reproducer, F03/F04, adaptador H0-011, transaction y roles/grants H0 pertinentes; los otros documentos se leen para su coordinación autorizada.

**Resultado: F05 OPEN / MATERIAL / ALTA — BLOCKED BY DESIGN.** El candidato A falla una precondición necesaria: `transaction_timeout` es `PGC_USERSET` (`pg_settings.context = 'user'`) y revocar el privilegio SET no impide que runtime lo quite. Un parámetro armado por una función interna seguiría siendo modificable al retornar al caller. Además, reducir un valor positivo mientras su timer ya está activo no adelanta ese timer. No se ha demostrado una solución localizada compatible con la frontera aprobada. Se detiene la implementación, no la documentación/publicación autorizadas.

No se modifica código, migraciones, pruebas, dependencias, lockfile, expected ni fuentes APPROVED. La actualización de Tasks se limita a estado/evidencia/bloqueo. D037/D038 y Last Approved Commit `6248820e3253a9d88755ed0a4996fff8f865690e` permanecen intactos; no se crea D039. No se ejecuta R01–R25 completa ni se inicia H0-013. Supabase Staging no se conecta ni modifica.

### Reproducción publicada, íntegra y previa a los ensayos

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types --test-name-pattern='H0-012 fifth formal execution' tests/integration/postgres-h0-012.test.ts
```

La selección ejecuta el contenedor publicado con R01–R08 hasta su parada F05; no es una sexta matriz formal completa. Resultado: **15 tests Node: 13 PASS, 2 FAIL, 0 skipped/cancelled/todo; 15297.546875 ms; exit 1**. Son 14 casos hoja, 13 PASS y un FAIL material; el segundo FAIL es el contenedor. B y el control diferido son diagnósticos dentro del mismo caso, sin sumarlos como tests independientes. F01/F02 focales no se seleccionan en esta etapa.

| Recorrido original | Resultado actual independiente |
|---|---|
| A: IMMEDIATE → lock real hasta expiry → COMMIT sin finalizador | **FAIL normativo: COMMIT**; expiry `1790617290219000` µs, liberación `1790617290345199` µs, **126199 µs después** |
| B: IMMEDIATE → finalizador retorna vigente → lock real hasta expiry → COMMIT separado | **FAIL normativo: COMMIT**; expiry `1790617295488000` µs, liberación `1790617295595126` µs, **107126 µs después** |
| Omitir finalizador sin anticipar constraints | Rollback; trigger diferido aún pendiente |
| F04 intacto: deferred-expired / immediate-expired | Ambos rollback, incluso tras IMMEDIATE en el segundo |
| F04 intacto: immediate-short | COMMIT vigente |
| COMMIT runtime sin finalizador, wait corto | COMMIT vigente |
| Evidence vigente exacta; replay confirmado sin source/provider | `reserved`; después `previous`, incluido adaptador sin provider |

A/B comprueban `session_user = current_user = crm_h0_runtime`, lock advisory real en `pg_locks`, evidencia viva al adelantar checks y F1/F2 aún vivas tras la espera. Las capacidades/argumentos originales no se cambian. Cada COMMIT indebido deja desde otra conexión **1** nueva fila en cada categoría: reservations, evidence_revalidations, events, receipts, roots, operations, attempts, history, results e intents; actividad humana cambia. Las proposal/decision previas se conservan.

En los tres recorridos caducados que sí abortan, la conexión observadora acredita **0** nuevas filas en las diez categorías, actividad humana sin cambio durable y snapshot completo idéntico. Los rechazos R08 usan también comparación completa antes/después. No se confunde la falta de rechazo de A/B con ausencia de residuos.

Archivo publicado `tests/integration/postgres-h0-012.test.ts` sin cambios; SHA-256: `816adbb8e54e2c911d07fe1d35c700ab24288fa5951ed6be9e382c57d1b82fbf`. No se modifica su helper ni se cambia `committed === false`.

### Puerta A — duración real y cambios del timer

Clúster nuevo PostgreSQL **17.11 / 170011**, socket Unix, TCP deshabilitado, esquema `lab` y tabla marcadora sintética. Roles creados con las tres migraciones históricas de bootstrap/autoridades H0; runtime sin superuser/createdb/createrole/inherit/bypassrls/replication ni membresías. Solo se le concede INSERT en la tabla marcadora del laboratorio. Cada caso usa una conexión runtime nueva; otra conexión lee persistencia. No se emplean claves, datos humanos reales, proveedores ni relojes simulados.

Los tiempos siguientes son medidas aproximadas en milisegundos con `clock_timestamp()` del servidor. Incluyen el pequeño coste de observación; no son una cota de puntualidad del sistema operativo. La terminación se verifica en el log PostgreSQL por PID y **FATAL SQLSTATE 25P04**; Postgres.js entrega `CONNECTION_CLOSED`. El primer ensayo preliminar se interrumpió por esperar 25P04 directamente en el cliente: se corrigió solo la instrumentación para contrastar log/PID y se repitió desde un clúster vacío. No es un defecto de producto ni un PASS adicional.

| ID | Secuencia medida | Observed |
|---|---|---|
| E00 | Versión, atributos, membresías y `pg_settings` | 170011; membresías runtime=0; `context=user`, `unit=ms`, default=0, máximo=2147483647 |
| E01 | Default 0; BEGIN, trabajo 250 ms, COMMIT | COMMIT a ~254 ms; marcador=1 |
| E02 | SET 600 ms antes de BEGIN; trabajo 2 s | Termina a ~606 ms desde BEGIN; marcador=0 |
| E03 | BEGIN con 0; trabajo 500 ms; SET LOCAL 600 ms; trabajo 2 s | Termina a ~1107 ms desde BEGIN / ~604 ms desde SET |
| E04 | Timer activo 1200 ms; a ~250 ms SET LOCAL 250 ms | SHOW=250 ms, pero termina a ~1203 ms desde BEGIN / ~950 ms desde SET; **no acorta el timer activo** |
| E05 | Timer activo 600 ms; a ~200 ms SET LOCAL 1800 ms | SHOW=1800 ms, pero termina a ~603 ms desde BEGIN / ~400 ms desde SET; no alarga ese timer activo |
| E06 | BEGIN con 0; trabajo 800 ms; SET LOCAL 300 ms; trabajo 100 ms; COMMIT | COMMIT a ~907 ms desde BEGIN / ~104 ms desde SET; **no rechaza por la edad ya transcurrida** |
| E07 | Timer 600 ms; a ~200 ms SET LOCAL 0 y después 1800 ms; trabajo 700 ms | COMMIT a ~908 ms desde BEGIN; desactivar/reactivar permite superar el límite original |
| E08 | Timer 5 s; unidad sintética termina en 1 s | COMMIT a ~1005 ms; marcador=1 |
| E09 | Timer 600 ms; `pg_sleep(1)` antes de COMMIT | Sesión termina a ~603 ms; no alcanza COMMIT de la unidad; marcador=0 |
| E10 | Timer 5 s; otra conexión retiene advisory lock más allá del límite | Wait real observado; sesión termina a ~5004 ms, antes de liberar el blocker; marcador=0 |

Semántica contrastada: si ya hay un valor positivo al iniciar una transacción, el timer se arma al inicio de esa transacción, explícita o implícita. Si estaba desactivado y se pone un valor positivo dentro de una transacción abierta, cuenta desde **el armado al hacer SET**, sin descontar la edad anterior. Cambiar positivo→positivo actualiza el GUC visible pero no reprograma un timer activo; cambiar a 0 lo desactiva y 0→positivo lo arma de nuevo.

Esto coincide con el código oficial **REL_17_11**: [registro PGC_USERSET](https://github.com/postgres/postgres/blob/REL_17_11/src/backend/utils/misc/guc_tables.c), [assign_transaction_timeout](https://github.com/postgres/postgres/blob/REL_17_11/src/backend/tcop/postgres.c) y [StartTransaction/CommitTransaction](https://github.com/postgres/postgres/blob/REL_17_11/src/backend/access/transam/xact.c). La [documentación del parámetro](https://www.postgresql.org/docs/17/runtime-config-client.html#GUC-TRANSACTION-TIMEOUT) confirma terminación de sesión, unidad ms y 0 desactivado. La conclusión principal procede de las ejecuciones, no solo de estas fuentes.

### Puerta A — REVOKE, GRANT y runtime real

Como autoridad del clúster aislado, antes de E12–E22:

```sql
REVOKE SET ON PARAMETER transaction_timeout FROM PUBLIC;
REVOKE SET ON PARAMETER transaction_timeout FROM crm_h0_runtime;
GRANT SET ON PARAMETER transaction_timeout TO crm_h0_f2_executor;
```

E11 observa ACL `{f05_bootstrap=sA/f05_bootstrap,crm_h0_f2_executor=s/f05_bootstrap}`, sin PUBLIC/runtime, y `has_parameter_privilege('crm_h0_runtime','transaction_timeout','SET') = false`. **Ese false no implica que se prohíba modificar un parámetro USERSET.** No hace falta grant alguno para que runtime lo cambie. En E12–E19 el login y rol efectivo son ambos `crm_h0_runtime`.

Cada caso E12–E19 abre una transacción nueva, arma `SET LOCAL transaction_timeout='350ms'`, inserta un marcador, ejecuta la operación indicada y trata de completar `pg_sleep(0.55); COMMIT`. Persistencia siempre consultada desde otra conexión.

| ID / operación runtime | Permiso y SHOW observado | Resultado después del límite original |
|---|---|---|
| SHOW transaction_timeout | Permitido; 350ms al armar | Lectura disponible |
| E12 `SET transaction_timeout=0` | Aceptado; 0 | **COMMIT; marcador=1** |
| E13 `SET LOCAL transaction_timeout=0` | Aceptado; 0 | **COMMIT; marcador=1** |
| E14 `RESET transaction_timeout` | Aceptado; default=0 | **COMMIT; marcador=1** |
| E15 `RESET ALL` | Aceptado; default=0 | **COMMIT; marcador=1** |
| E16 `set_config('transaction_timeout','0',true)` | Aceptado; 0 | **COMMIT; marcador=1** |
| E17 `set_config('transaction_timeout','0',false)` | Aceptado; 0 | **COMMIT; marcador=1** |
| E18 `SET transaction_timeout='3s'` | Aceptado; 3s | Timer original sigue activo: termina; marcador=0 |
| E19 `SET LOCAL transaction_timeout='3s'` | Aceptado; 3s | Timer original sigue activo: termina; marcador=0 |
| E20 `ALTER ROLE crm_h0_runtime SET ...='2s'`, después RESET propio | Ambos aceptados; sesión nueva 2s / 0 | El default propio también es mutable; sesión nueva permite SET 0 |
| E21 `ALTER DATABASE f05_gate SET ...='2s'` | Denegado 42501: runtime no es propietario | Esta denegación no impide los bypass anteriores |
| E22 Default 2s impuesto por admin con ALTER ROLE; runtime BEGIN + SET LOCAL 0 | Aceptado; 0 dentro de transacción, 2s tras COMMIT | Default administrativo tampoco es una restricción obligatoria |

**Matiz de ampliación:** E18/E19 aceptan un valor superior pero por sí solos no posponen el timer ya activo. E07 demuestra el bypass real 0→valor superior. No se registra falsamente una denegación por permisos ni un alargamiento inmediato positivo→positivo.

La [semántica de privilegios SET](https://www.postgresql.org/docs/17/ddl-priv.html) los hace útiles para habilitar parámetros que requieren autoridad superior, no para quitar la mutabilidad inherente a USERSET. El [código GUC 17.11](https://github.com/postgres/postgres/blob/REL_17_11/src/backend/utils/misc/guc.c) comprueba ACL en PGC_SUSET y admite PGC_USERSET. Se consultan asimismo [GRANT](https://www.postgresql.org/docs/17/sql-grant.html), [REVOKE](https://www.postgresql.org/docs/17/sql-revoke.html), [SET/SET LOCAL](https://www.postgresql.org/docs/17/sql-set.html), [RESET](https://www.postgresql.org/docs/17/sql-reset.html) y [ALTER ROLE](https://www.postgresql.org/docs/17/sql-alterrole.html).

La condición previa del apartado 7 de la autorización **no se cumple**. No se construye una función de producto para armar el timeout ni se introduce una API con timeout arbitrario. Tampoco se integra un prototipo descartado en la ruta de evidence. Los casos 1/2 de duración de la puerta tienen controles sintéticos positivos; los casos 3/4/5 no demuestran inmutabilidad del límite. Los casos 6/7/8 conservan los resultados originales de F04/F05, sin atribuirles protección de un candidato que no pasó la puerta.

### Precisión temporal

B08 ejecuta conversiones numéricas reales: `0.999::numeric::int = 1`, `1.999::numeric::int = 2`, `4999.999::numeric::int = 5000`; `floor` produce respectivamente 0, 1 y 4999. Una conversión a integer sin floor puede ampliar la duración. Un cálculo conservador tendría que usar `floor(extract(epoch FROM (effectiveValidUntil - clock_timestamp())) * 1000)`, denegar si el resultado es <=0 y nunca convertir ese 0 en un timeout desactivado ni redondearlo a 1 ms. La resolución del parámetro es **1 ms**, con descarte inferior a 1 ms por floor.

**No se acredita un margen operativo que garantice un deadline absoluto:** el timer relativo se arma después de muestrear el reloj; floor por sí solo no acota ese intervalo, ni sustituye rearmar un timer positivo ya activo. Los milisegundos observados tampoco certifican una cota de planificación. Por tanto, esta etapa no acepta ni implementa una conversión que afirme `timeout efectivo <= vigencia restante`. El fallo de permisos ya descarta A independientemente del redondeo.

### Candidato B — otras fronteras aisladas

Segundo clúster vacío, misma versión 17.11 y sin producto. `lab.finish(text)` es una procedure sintética invoker que inserta un marcador con XID/PID y hace COMMIT; se ensayan también sus variantes SECURITY DEFINER y con cláusula SET. Los cambios de roles/objetos se limitan a este laboratorio y desaparecen en teardown.

| ID | Ensayo | Resultado observado |
|---|---|---|
| B01 | CALL invoker de nivel superior, fuera de BEGIN | COMMIT permitido, marcador=1 |
| B02 | BEGIN; CALL invoker que intenta COMMIT | **2D000 invalid transaction termination**, rollback, marcador=0 |
| B03 | CALL SECURITY DEFINER que intenta COMMIT | **2D000**, marcador=0 |
| B04 | CALL con cláusula SET search_path que intenta COMMIT | **2D000**, marcador=0 |
| B05 | SET ROLE sin membresía; después grant sintético solo de laboratorio y cambio de rol dentro de unidad | Sin grant: 42501. Con grant: `session_user=crm_h0_runtime`, `current_user=crm_h0_untrusted`, mismo backend/transacción; **COMMIT permitido**, marcador=1 |
| B06 | Segunda conexión runtime intenta finalizar mientras la primera tiene escritura sin confirmar | PID/XID distintos (`68938/746`, `68939/747`); COMMIT de la segunda no publica la primera (0 filas); COMMIT del dueño sí (1) |
| B07 | Obtener binding en BEGIN, terminarlo y ejecutar CALL superior en la misma conexión | Mismo PID 68938; XID cambia **748→749**. El binding de la transacción previa no se conserva |
| B08 | Conversión a milisegundos | Resultados de precisión anteriores |

[CALL](https://www.postgresql.org/docs/17/sql-call.html), [control transaccional PL/pgSQL](https://www.postgresql.org/docs/17/plpgsql-transactions.html) y [CREATE PROCEDURE](https://www.postgresql.org/docs/17/sql-createprocedure.html) explican estas restricciones. [COMMIT](https://www.postgresql.org/docs/17/sql-commit.html) actúa sobre la transacción de la conexión; no hay un grant COMMIT que retire esa capacidad al runtime propietario. Un SECURITY DEFINER cambia autoridad de ejecución, no entrega el control de la transacción a otro backend.

**Decisión humana necesaria, no creada ni implementada:** decidir quién controla exclusivamente la conexión y la finalización de una nueva unidad dependiente de evidence, de modo que M2 no pueda emitir COMMIT alternativo ni SQL posterior a la última validación. Debe definirse el ciclo de emisión/verificación F1/F2 ligado al mismo XID/backend y cómo se mantiene la atomicidad M04+M02, historia/resultado/intención, replay y ventanas aprobadas. Una separación builder/finalizer con otra conexión no transfiere la transacción existente; una nueva autoridad/rol de finalización o un ciclo CALL de nivel superior exige revisar arquitectura/D037/D038 y probar la garantía temporal. No se presenta ninguna de estas alternativas como solución ya validada.

No se modifican protocolos F1/F2, ventanas, firmadores, binding, H0-M02 ni replay. Tampoco se prueba que un rediseño pendiente los preserve: ese diseño no existe aún. F04 permanece como defensa del recorrido que conserva el adaptador, insuficiente para hacer obligatoria la propiedad frente a M2. Otro finalizador opcional, trigger diferible, GUC libre o aumento/renovación de vigencia no resuelve el defecto y no se adopta.

### Resultados, artefactos locales y publicación

| Comprobación | Estado de esta etapa |
|---|---|
| Reproducer publicado A/B y controles incluidos | 15 tests Node: 13 PASS, 2 FAIL; fallo material F05 + contenedor; 0 skipped/cancelled |
| Puerta aislada timeout/permisos | 23 registros E00–E22, incluyendo metadatos E00/E11; **candidato rechazado**, no 23 PASS funcionales |
| Otras fronteras/precisión | 8 registros B01–B08; limitaciones demostradas, no fix |
| Total | **15 tests Node + 31 registros experimentales**, métricas distintas; no sumar como 46 tests ni heredar conteos anteriores |
| F01 / F02 focales | NO REEJECUTADOS en esta selección; conservan estado pendiente formal |
| F03 | Positivo/negativos/replay de R08 reejecutados; no se ejecuta toda su suite focal |
| F04 | Tres controles publicados reejecutados PASS; garantía obligatoria sigue refutada por F05 |
| Residuos H0 | Tres unidades caducadas denegadas: 0 en las diez categorías y actividad intacta; A/B: 1 por categoría y actividad cambiada |
| Residuos de laboratorios | Cada aborto comprueba marcador=0 desde otra conexión; son unidades sintéticas, no sustituyen la comprobación de tablas H0 anterior |
| Nueva migración / V-MIG F05 | **No aplica: no hay migración**. El before del reproducer vuelve a ejecutar bootstrap/upgrade y rollback DDL históricos F03/F04; no se acredita V-MIG de un fix inexistente |
| `pnpm test` / `pnpm run test:postgres` completos | NO EJECUTADOS: apartado 18 condicionado a fix focal PASS, condición no alcanzada |
| Install frozen / audit / build | NO EJECUTADOS por el mismo alcance condicionado; sin dependencias ni producto modificados |
| `pnpm run typecheck` | PASS: generación Next de tipos y `tsc --noEmit` |
| `pnpm run lint` | PASS: import boundaries |
| `git diff --check` y revisión del alcance | PASS; exactamente los cuatro documentos autorizados; reproducer byte a byte igual a la base, cronología histórica íntegra y harness incrustados idénticos a los ejecutados |
| Revisión razonable de secretos del diff | PASS; sin patrones de claves privadas, PAT, JWT ni URI PostgreSQL autenticada |

Los harness y registros auxiliares permanecen localmente en `/tmp/h0-f05-gate/`; log del reproducer en `/tmp/h0-f05-published-reproducer.log`. Los tres clústeres de las ejecuciones completas quedaron detenidos y sus directorios de datos eliminados; también se cerró/eliminó el clúster del ensayo preliminar interrumpido. Los archivos de scripts/logs se conservan aparte. Son artefactos temporales, no se presupone su conservación indefinida. Las secuencias SQL y resultados relevantes se recogen arriba; a continuación se conserva además el código exacto de los dos harness completos dentro de esta evidencia para permitir su reconstrucción sin añadir tests al repositorio.

Estado final: **F01/F02/F03/F04 = FIX IMPLEMENTED / PENDING FORMAL REVERIFICATION; F05 = OPEN / MATERIAL / ALTA — BLOCKED BY DESIGN; TSK-H0-012 = FAILED / NOT COMPLETED; H0-013 = NOT STARTED**. H0 IN PROGRESS; PLAN-AUTH-002/006 PENDING globalmente; Staging sin conexión/cambios. Publicación autorizada: solo este archivo, Tasks, PROJECT-STATUS y NEXT-STEPS, commit `test(h0): record evidence lifetime design blocker`, push normal a `origin/main`.

Siguiente paso **SIN EJECUTAR**: decisión humana sobre la frontera de finalización obligatoria y su relación con D037/D038; después autorización específica para un diseño/implementación y sus ensayos. Solo tras un fix demostrado, nueva reverificación formal completa R01–R25. No se crea D039 ni se avanza a H0-013.

<details>
<summary>Harness A: transaction_timeout y ACL</summary>

Código de laboratorio, sin integración productiva. Guardar como `/tmp/h0-f05-gate/gate.mjs` y ejecutar con Node 24.21.0; crear antes `/tmp/h0-f05-gate`. Requiere el checkout y Postgres.app en las rutas explícitas.

```js
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
const repo = '/Users/andres/Developer/crm-huescaventura-os';
const postgres = createRequire(repo + '/package.json')('postgres');
const bin = '/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin';
const out = '/tmp/h0-f05-gate';
const temp = await mkdtemp(join(tmpdir(), 'h0-f05-gate-'));
const socket = join(temp, 'socket');
await mkdir(socket);
const port = 55435;
let started = false;
const all = [];
const report = [];
function command(name, args) {
  const r = spawnSync(join(bin, name), args, {encoding:'utf8', env:{...process.env, LC_ALL:'C'}});
  assert.equal(r.status, 0, r.stderr);
}
function connect(user='f05_bootstrap', database='f05_gate') {
  const c = postgres({host:socket, port, database, user, max:1, prepare:false, connect_timeout:3, onnotice:()=>{}});
  all.push(c); return c;
}
function emit(name, facts) { const r = {name,...facts}; report.push(r); console.log(JSON.stringify(r)); }
async function show(c) { return (await c.unsafe('show transaction_timeout'))[0].transaction_timeout; }
async function clock(c) { return Number((await c`select extract(epoch from clock_timestamp())::double precision*1000 ms`)[0].ms); }
let admin;
async function count(name) { return (await admin`select count(*)::int n from lab.markers where id=${name}`)[0].n; }
async function temporal(name, preset, beforeSet, change, sleep, expected, extra=undefined) {
  const c = connect('crm_h0_runtime'); const r = await c.reserve();
  let error; let current; let beginMs; let setMs; let doneMs; let committed=false; let pid;
  try {
    await r.unsafe(`set transaction_timeout='${preset}ms'`);
    await r.unsafe('begin'); beginMs = await clock(r); pid=(await r`select pg_backend_pid() pid`)[0].pid;
    await r`insert into lab.markers(id) values(${name})`;
    if (beforeSet) await r`select pg_sleep(${beforeSet/1000})`;
    if (change!==undefined) { await r.unsafe(`set local transaction_timeout='${change}ms'`); setMs = await clock(r); }
    if (extra) await extra(r);
    current = await show(r);
    await r`select pg_sleep(${sleep/1000})`;
    await r.unsafe('commit'); committed=true;
  } catch(e) { error={code:e.code,message:e.message}; }
  finally { doneMs=await clock(admin); r.release(); await c.end({timeout:1}); }
  const persisted=await count(name);
  assert.equal(committed,expected); assert.equal(persisted,expected?1:0);
  if(!expected) { assert.ok(['25P04','CONNECTION_CLOSED'].includes(error?.code)); assert.match(await readFile(join(out,'postgres.log'),'utf8'),new RegExp('\\['+pid+'\\].*FATAL:  25P04:')); }
  emit(name,{presetMs:preset,changeMs:change,show:current,elapsedFromBeginMs:Math.round(doneMs-beginMs),
    elapsedFromSetMs:setMs?Math.round(doneMs-setMs):null,pid,serverSQLSTATE:expected?undefined:'25P04',committed,persisted,error});
}
try {
  command('initdb',['-D',join(temp,'data'),'--username=f05_bootstrap','--auth-local=trust','--auth-host=scram-sha-256','--no-locale','--encoding=UTF8']);
  command('pg_ctl',['-D',join(temp,'data'),'-l',join(out,'postgres.log'),'-o',`-k '${socket}' -h '' -p ${port} -c log_error_verbosity=verbose`,'-w','start']); started=true;
  const boot=connect('f05_bootstrap','postgres');
  for (const file of ['202609150000_h0_m01_roles.sql','202609160000_h0_f1_authorities.sql','202609260000_h0_m03_authorities.sql'])
    await boot.unsafe(await readFile(join(repo,'supabase/migrations',file),'utf8'));
  await boot.unsafe('create database f05_gate owner crm_h0_migration'); admin=connect();
  await admin.unsafe('create schema lab; create table lab.markers(id text primary key); grant usage on schema lab to crm_h0_runtime; grant insert on lab.markers to crm_h0_runtime');
  const [version]=await admin`select version() version,current_setting('server_version_num') version_num`;
  assert.equal(version.version_num,'170011');
  const roles=await admin`select rolname,rolsuper,rolcreatedb,rolcreaterole,rolinherit,rolbypassrls,rolreplication from pg_roles where rolname='crm_h0_runtime'`;
  const [setting]=await admin`select name,context,unit,setting,min_val,max_val from pg_settings where name='transaction_timeout'`;
  emit('E00-environment',{...version,roles,setting,runtimeMemberships:(await admin`select * from pg_auth_members where member='crm_h0_runtime'::regrole`).length});
  await temporal('E01-zero-default',0,0,undefined,250,true);
  await temporal('E02-preset-begin',600,0,undefined,2000,false);
  await temporal('E03-enable-in-running-transaction',0,500,600,2000,false);
  await temporal('E04-active-lowered',1200,250,250,2000,false);
  await temporal('E05-active-raised',600,200,1800,2000,false);
  await temporal('E06-elapsed-exceeds-new-value',0,800,300,100,true);
  await temporal('E07-disable-and-rearm',600,200,0,700,true, async r=>{await r.unsafe("set local transaction_timeout='1800ms'");});
  await temporal('E08-five-seconds-commit-in-one',5000,0,undefined,1000,true);
  await temporal('E09-commit-after-limit',600,0,undefined,1000,false);
  {
    const name='E10-real-lock-five-seconds'; const blocker=connect(); const b=await blocker.reserve();
    const c=connect('crm_h0_runtime'); const r=await c.reserve();
    await b.unsafe('begin; select pg_advisory_xact_lock(105000)');
    await r.unsafe("set transaction_timeout='5s'; begin");
    const pid=(await r`select pg_backend_pid() pid`)[0].pid; const beginMs=await clock(r);
    await r`insert into lab.markers(id) values(${name})`;
    const pending=r`select pg_advisory_xact_lock(105000)`.then(()=>({ok:true}),e=>({code:e.code,message:e.message}));
    let locked=false;
    for(let n=0;n<100;n++) { locked=(await admin`select exists(select 1 from pg_locks where pid=${pid} and not granted and locktype='advisory') x`)[0].x; if(locked)break; await delay(10); }
    assert.ok(locked); const result=await pending; assert.ok(['25P04','CONNECTION_CLOSED'].includes(result.code)); assert.match(await readFile(join(out,'postgres.log'),'utf8'),new RegExp('\\['+pid+'\\].*FATAL:  25P04:'));
    const elapsedMs=Math.round(await clock(admin)-beginMs);
    await b.unsafe('commit'); b.release(); r.release(); await c.end({timeout:1});
    assert.equal(await count(name),0); emit(name,{realLock:locked,elapsedMs,pid,serverSQLSTATE:'25P04',persisted:0,result});
  }
  await admin.unsafe('revoke set on parameter transaction_timeout from public; revoke set on parameter transaction_timeout from crm_h0_runtime; grant set on parameter transaction_timeout to crm_h0_f2_executor');
  emit('E11-parameter-acl-after-revoke',{
    acl:await admin`select parname,paracl::text from pg_parameter_acl where parname='transaction_timeout'`,
    reportedPrivilege:(await admin`select has_parameter_privilege('crm_h0_runtime','transaction_timeout','SET') allowed`)[0].allowed,
    setting:(await admin`select name,context,unit from pg_settings where name='transaction_timeout'`)[0]
  });
  const mutations=[
    ['E12-SET-zero','set transaction_timeout=0','0'],
    ['E13-SET-LOCAL-zero','set local transaction_timeout=0','0'],
    ['E14-RESET','reset transaction_timeout','0'],
    ['E15-RESET-ALL','reset all','0'],
    ['E16-set_config-local',"select set_config('transaction_timeout','0',true)",'0'],
    ['E17-set_config-session',"select set_config('transaction_timeout','0',false)",'0'],
    ['E18-SET-increase',"set transaction_timeout='3s'",'3s'],
    ['E19-SET-LOCAL-increase',"set local transaction_timeout='3s'",'3s'],
  ];
  for(const [name,sql,value] of mutations) {
    const c=connect('crm_h0_runtime'); const r=await c.reserve();
    await r.unsafe("begin; set local transaction_timeout='350ms'");
    const identity=(await r`select session_user,current_user`)[0];
    await r`insert into lab.markers(id) values(${name})`;
    const before=await show(r); await r.unsafe(sql); const after=await show(r); assert.equal(after,value);
    let error; let committed=false;
    try { await r.unsafe('select pg_sleep(0.55); commit'); committed=true; } catch(e){error={code:e.code,message:e.message};}
    r.release(); await c.end({timeout:1});
    const persisted=await count(name);
    const bypass=!name.includes('increase'); assert.equal(committed,bypass); assert.equal(persisted,bypass?1:0);
    emit(name,{sql,identity,before,after,accepted:true,committedAfterOriginalLimit:committed,persisted,error});
  }
  {
    const c=connect('crm_h0_runtime');
    await c.unsafe("alter role crm_h0_runtime set transaction_timeout='2s'");
    const fresh=connect('crm_h0_runtime'); assert.equal(await show(fresh),'2s');
    await fresh.unsafe('set transaction_timeout=0'); assert.equal(await show(fresh),'0');
    await c.unsafe('alter role crm_h0_runtime reset transaction_timeout');
    const freshReset=connect('crm_h0_runtime'); assert.equal(await show(freshReset),'0');
    emit('E20-ALTER-ROLE-own-default',{setAccepted:true,newSession:'2s',runtimeSETOverride:'0',resetAccepted:true,newSessionAfterReset:'0'});
    let error; try {await c.unsafe("alter database f05_gate set transaction_timeout='2s'");} catch(e){error={code:e.code,message:e.message};}
    assert.equal(error?.code,'42501'); emit('E21-ALTER-DATABASE',{accepted:false,error});
    await admin.unsafe("alter role crm_h0_runtime set transaction_timeout='2s'");
    const fromAdmin=connect('crm_h0_runtime'); assert.equal(await show(fromAdmin),'2s');
    await fromAdmin.unsafe('set local transaction_timeout=0'); // outside tx warns only; test below is explicit
    await fromAdmin.unsafe('begin; set local transaction_timeout=0'); assert.equal(await show(fromAdmin),'0');
    await fromAdmin.unsafe('commit'); assert.equal(await show(fromAdmin),'2s');
    await admin.unsafe('alter role crm_h0_runtime reset transaction_timeout');
    emit('E22-admin-role-default-overridable',{atLogin:'2s',inTransactionAfterRuntimeSETLOCAL:'0',afterCommit:'2s'});
  }
  // Gate rejected: do not implement an evidence-path helper or change product.
} finally {
  await Promise.allSettled(all.map(c=>c.end({timeout:1})));
  if(started) command('pg_ctl',['-D',join(temp,'data'),'-m','fast','-w','stop']);
  await writeFile(join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
  await rm(temp,{recursive:true,force:true});
  console.log(JSON.stringify({teardown:'stopped and removed isolated cluster',reports:report.length}));
}
```

</details>

<details>
<summary>Harness B: CALL, roles, conexiones y precisión</summary>

Código de laboratorio, sin integración productiva. Guardar como `/tmp/h0-f05-gate/boundaries.mjs` y ejecutar con Node 24.21.0; crear antes `/tmp/h0-f05-gate`. Requiere el checkout y Postgres.app en las rutas explícitas.

```js
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const repo='/Users/andres/Developer/crm-huescaventura-os';
const postgres=createRequire(repo+'/package.json')('postgres');
const bin='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin';
const out='/tmp/h0-f05-gate';
const temp=await mkdtemp(join(tmpdir(),'h0-f05-boundaries-')); const socket=join(temp,'socket'); await mkdir(socket);
const clients=[]; const report=[]; let started=false;
function command(name,args){const r=spawnSync(join(bin,name),args,{encoding:'utf8',env:{...process.env,LC_ALL:'C'}});assert.equal(r.status,0,r.stderr);}
function connect(user='f05_bootstrap'){const c=postgres({host:socket,port:55436,user,database:'postgres',max:1,prepare:false,onnotice:()=>{}});clients.push(c);return c;}
function emit(name,facts){const r={name,...facts};report.push(r);console.log(JSON.stringify(r));}
try{
 command('initdb',['-D',join(temp,'data'),'--username=f05_bootstrap','--auth-local=trust','--auth-host=scram-sha-256','--no-locale','--encoding=UTF8']);
 command('pg_ctl',['-D',join(temp,'data'),'-l',join(out,'boundaries-postgres.log'),'-o',`-k '${socket}' -h '' -p 55436`,'-w','start']);started=true;
 const admin=connect();await admin.unsafe(await readFile(join(repo,'supabase/migrations/202609150000_h0_m01_roles.sql'),'utf8'));
 const runtime=connect('crm_h0_runtime');const r=await runtime.reserve();
 await admin.unsafe(`create schema lab; create table lab.markers(id text primary key,xid xid8,pid int);
 grant usage on schema lab to crm_h0_runtime;
 grant insert on lab.markers to crm_h0_runtime;
 create procedure lab.finish(k text) language plpgsql as $$ begin insert into lab.markers values(k,pg_current_xact_id(),pg_backend_pid()); commit; end $$;
 create procedure lab.finish_definer(k text) language plpgsql security definer as $$ begin insert into lab.markers values(k,pg_current_xact_id(),pg_backend_pid()); commit; end $$;
 create procedure lab.finish_config(k text) language plpgsql set search_path=pg_catalog,pg_temp as $$ begin insert into lab.markers values(k,pg_current_xact_id(),pg_backend_pid()); commit; end $$;
 revoke all on procedure lab.finish(text),lab.finish_definer(text),lab.finish_config(text) from public;
 grant execute on procedure lab.finish(text),lab.finish_definer(text),lab.finish_config(text) to crm_h0_runtime`);
 const count=async id=>(await admin`select count(*)::int n from lab.markers where id=${id}`)[0].n;
 await r.unsafe("call lab.finish('B01-top-level')");assert.equal(await count('B01-top-level'),1);emit('B01-top-level-CALL',{committed:true,persisted:1});
 for(const [name,sql]of[
  ['B02-CALL-in-explicit-transaction',"begin; call lab.finish('B02')"],
  ['B03-SECURITY-DEFINER-CALL',"call lab.finish_definer('B03')"],
  ['B04-CALL-with-SET-clause',"call lab.finish_config('B04')"]]){
  let error;try{await r.unsafe(sql);}catch(e){error={code:e.code,message:e.message};}await r.unsafe('rollback');
  assert.equal(error?.code,'2D000');assert.equal(await count(name.slice(0,3)),0);emit(name,{error,persisted:0});
 }
 // These synthetic memberships exist only in this disposable cluster.
 let denied;try{await r.unsafe('set role crm_h0_untrusted');}catch(e){denied=e.code;}assert.equal(denied,'42501');
 await admin.unsafe('grant crm_h0_untrusted to crm_h0_runtime with inherit false,set true');
 await r.unsafe("begin; insert into lab.markers values('B05-role-change',pg_current_xact_id(),pg_backend_pid()); set local role crm_h0_untrusted");
 const identity=(await r`select session_user,current_user,pg_backend_pid() pid,pg_current_xact_id()::text xid`)[0];
 await r.unsafe('commit');assert.equal(await count('B05-role-change'),1);
 emit('B05-role-change-keeps-COMMIT',{baselineSetRoleDenied:denied,syntheticMembership:true,identity,persisted:1});
 const other=connect('crm_h0_runtime');const o=await other.reserve();
 await r.unsafe("begin; insert into lab.markers values('B06-other-connection',pg_current_xact_id(),pg_backend_pid())");
 const first=(await r`select pg_backend_pid() pid,pg_current_xact_id()::text xid`)[0];
 await o.unsafe('begin');const second=(await o`select pg_backend_pid() pid,pg_current_xact_id()::text xid`)[0];await o.unsafe('commit');
 assert.notEqual(first.pid,second.pid);assert.notEqual(first.xid,second.xid);assert.equal(await count('B06-other-connection'),0);
 await r.unsafe('commit');assert.equal(await count('B06-other-connection'),1);
 emit('B06-other-connection-cannot-finalize',{first,second,visibleAfterOtherCommit:0,visibleAfterOwnerCommit:1});
 await r.unsafe('begin');const pre=(await r`select pg_backend_pid() pid,pg_current_xact_id()::text xid`)[0];await r.unsafe('commit');
 await r.unsafe("call lab.finish('B07-new-call-binding')");const inside=(await admin`select pid,xid::text from lab.markers where id='B07-new-call-binding'`)[0];
 assert.equal(pre.pid,inside.pid);assert.notEqual(pre.xid,inside.xid);emit('B07-top-level-CALL-after-binding',{pre,inside,samePID:true,sameXID:false});
 const precision=await admin`select v::text milliseconds,v::int nearest_integer,floor(v)::int conservative_floor from (values(0.999::numeric),(1.001),(1.999),(4999.999)) s(v)`;
 assert.deepEqual(precision.map(x=>x.conservative_floor),[0,1,1,4999]);emit('B08-millisecond-rounding',{precision,zeroMustDeny:true});
 o.release();r.release();
}finally{
 await Promise.allSettled(clients.map(c=>c.end({timeout:1})));
 if(started)command('pg_ctl',['-D',join(temp,'data'),'-m','fast','-w','stop']);
 await writeFile(join(out,'boundaries-results.json'),JSON.stringify(report,null,2)+'\n');await rm(temp,{recursive:true,force:true});
 console.log(JSON.stringify({teardown:'stopped and removed isolated cluster',reports:report.length}));
}
```

</details>


## D039 — fases A/B/C: sincronización, mapa y puerta local (2026-09-28)

Autorización de continuidad limitada a D039/F05/H0-012; base inicial `64ce6cae0e79e9083b72cf9690b93b0a59a01275`, `main`, HEAD/origin iguales y árbol limpio tras fetch. Fase A publicada en `4e5e241709e96559b3db97b7c560452da3edc2d3`: Architecture/Plan y coordinación alineados, D037/D038/D039 y fuentes superiores intactos. Last Approved Commit sigue `3e3f47a1692290412a03cf14087c2c470b8cab90`.

### Mapa previo exacto

Inventario obtenido del catálogo real tras aplicar la cadena histórica completa, en PostgreSQL 17.11 aislado por socket `/tmp/h0-d039-lab/socket`, puerto 55429; sin conexión hosted. Tabla: EXECUTE efectivo previo de runtime, propietario y SECURITY DEFINER. Las funciones internas también se inventarían para evitar omitir overloads/helpers.

| Función | Owner | SECURITY DEFINER | EXECUTE runtime previo |
|---|---|---|---|
| `crm_api.apply_probe_batch(bytea,bytea,bytea)` | `crm_h0_executor` | True | True |
| `crm_api.commit_internal_unit(bytea,bytea,bytea)` | `crm_h0_executor` | True | True |
| `crm_api.commit_internal_unit(bytea,bytea,bytea,bytea,bytea,bytea)` | `crm_h0_f2_executor` | True | True |
| `crm_api.establish_session(bytea,bytea,bytea)` | `crm_h0_f2_executor` | True | True |
| `crm_api.f2_lookup(uuid,uuid)` | `crm_h0_f2_executor` | True | True |
| `crm_api.f2_lookup_revoke_all_authority(uuid,uuid)` | `crm_h0_f2_executor` | True | True |
| `crm_api.h0_m04_command(bytea,bytea,bytea,bytea,bytea)` | `crm_h0_f2_executor` | True | True |
| `crm_api.h0_m04_evidence_replay(bytea,bytea,bytea)` | `crm_h0_f2_executor` | True | True |
| `crm_api.h0_m04_finalize_evidence(text)` | `crm_h0_f2_executor` | True | True |
| `crm_api.h0_m04_read_proposal(bytea,bytea,bytea,bytea,bytea,text)` | `crm_h0_f2_executor` | True | True |
| `crm_api.h0_m04_revalidate_evidence(bytea,bytea,bytea,bytea,bytea,bytea)` | `crm_h0_f2_executor` | True | True |
| `crm_api.human_apply_probe_batch(bytea,bytea,bytea,bytea,bytea)` | `crm_h0_f2_executor` | True | True |
| `crm_api.human_read_probe(bytea,bytea,bytea,bytea,bytea)` | `crm_h0_f2_executor` | True | True |
| `crm_api.provision_actor_mapping(uuid,uuid,text)` | `crm_h0_f2_executor` | True | False |
| `crm_api.read_probe(bytea,bytea,bytea)` | `crm_h0_executor` | True | True |
| `crm_api.reidentify_session(bytea,bytea,bytea)` | `crm_h0_f2_executor` | True | True |
| `crm_api.revoke_all_sessions(bytea,bytea,bytea)` | `crm_h0_f2_executor` | True | True |
| `crm_api.revoke_session(bytea,bytea,bytea)` | `crm_h0_f2_executor` | True | True |
| `crm_api.set_actor_enabled(uuid,boolean,text)` | `crm_h0_f2_executor` | True | False |
| `crm_f1.fields(bytea)` | `crm_h0_verifier` | False | False |
| `crm_f1.pack_fields(text[])` | `crm_h0_verifier` | False | False |
| `crm_f1.row_allows(text,text,text,text)` | `crm_h0_verifier` | True | False |
| `crm_f1.unit_row_allows(text,text)` | `crm_h0_verifier` | True | False |
| `crm_f1.verify(bytea,bytea,bytea,text)` | `crm_h0_verifier` | True | False |
| `crm_f1.verify_envelope(bytea,bytea,bytea,text,text,text)` | `crm_h0_verifier` | True | False |
| `crm_f1.verify_unit(bytea,bytea,bytea)` | `crm_h0_verifier` | True | False |
| `crm_f2.admit(bytea,bytea,bytea,text,text)` | `crm_h0_f2_executor` | True | False |
| `crm_f2.verify(bytea,bytea,bytea,text,text,text)` | `crm_h0_f2_verifier` | True | False |
| `crm_f2.within_limit(timestamp with time zone,timestamp with time zone,integer)` | `crm_h0_f2_executor` | False | False |
| `crm_ha.check_evidence_at_end(text)` | `crm_h0_f2_executor` | True | False |
| `crm_ha.effect_record_allows(text,text,text,text,text,text,text)` | `crm_h0_f2_executor` | True | False |
| `crm_ha.evidence_commit_guard()` | `crm_h0_f2_executor` | True | False |
| `crm_internal.commit_internal_unit_core(bytea,bytea,bytea)` | `crm_h0_executor` | True | False |

Membresías previas: únicamente `crm_h0_migration` pertenece a `crm_h0_table_owner`, `crm_h0_verifier`, `crm_h0_executor`, `crm_h0_f2_owner`, `crm_h0_f2_verifier`, `crm_h0_f2_executor` (ADMIN/INHERIT/SET). Runtime no tiene membresías. Los genéricos sintéticos anon/authenticated no tienen EXECUTE sobre las funciones CRM inventariadas (se excluyen funciones de extensión pgcrypto del inventario propio). Los helpers internos no se conceden al login ordinario.

Composición previa: `createPostgresRuntime` crea un solo pool Postgres.js y entrega ese cliente a M01/M02/H0011; H0011 abre BEGIN mediante `sql.begin`, obtiene binding en `postgresF1Binding`, emite F1/F2 y ejecuta M04 y M02. La sobrecarga M02 humana revalida F2 original; la técnica rechaza el purpose humano. Revalidación del proveedor ocurre fuera de la unidad. F04 ejecuta finalizador + COMMIT en un mensaje solo en el recorrido con evidencia, pero runtime conserva acceso directo y puede alterar esa secuencia. Los codecs/verificadores previos fijan login runtime.

Superficie mínima seleccionada: nuevo LOGIN `crm_h0_ha_tx` sin atributos privilegiados ni membresías, CONNECT explícito y USAGE crm_api. Trasladar M04 command/read/revalidate/replay/finalize y sobrecarga M02 humana al TTE. Conceder además únicamente f2_lookup y sobrecarga M02 técnica, conservando esta última en runtime para H0-009. No nuevos roles NOLOGIN, tablas o stores. F1 debe negar todos los purposes HA en runtime y admitir en ha_tx solo combinaciones HA exactas de purpose/operation/resource/action. F2 en ha_tx solo autoriza acceso Core C01/C03; identificación y revocación permanecen en runtime. Los bindings y las verificaciones criptográficas no cambian. El API público del TTE solo expone operaciones vinculadas, sin objeto SQL, callback transaccional, issuer o commit separado.

### Puerta C aislada

Prototipo sin modificar producto/migraciones históricas: `/tmp/h0-d039-lab/setup.mjs`, `boundary.sql`, `apply.mjs`, codecs/adaptador de laboratorio y `gate.mjs`; resultados `results.json`. Se corrigieron dos problemas preparatorios del harness: reutilización de la única identidad sintética ya provisionada y CONNECT explícito del nuevo login tras la revocación histórica de PUBLIC. No se relajó ningún expected. La ejecución completa posterior terminó exit 0.

| Controles | Resultado observado |
|---|---|
| C04/C11 | PASS: TTE propone, aprueba y reserva con evidencia; M02 result persiste en backend independiente. |
| C01/C09/C10 | PASS: runtime sin EXECUTE M04/revalidación/replay/finalizador/M02 humano; ataques construir+COMMIT sin finalizador y adelantar finalizador+wait+COMMIT denegados 42501. |
| C02/C03 | PASS: cero membresías runtime/ha_tx; SET ROLE denegado; helper core inaccesible y Data API genérica sin EXECUTE CRM. |
| C05 | PASS: emisores deniegan purpose ordinario con ha_tx, purpose HA con runtime y establish F2 con ha_tx; catálogo SQL aplica asociación cerrada equivalente. |
| C06 | PASS: lectura F1/F2 positiva en binding real; mismas capacidades denegadas en otro backend y en nueva transacción del mismo backend. |
| C07/C08 | PASS del prototipo: API congelada solo con siete operaciones, sin sql/begin/commit/unsafe/transaction/firmadores; secuencia fija procesa constraints antes de final check + COMMIT. La implementación definitiva y fault injection se verifican después. |

Son seis grupos de comprobaciones que cubren C01–C11, no once tests Node ni una reverificación R01–R25. Prototipo de frontera viable conforme a D039: vigencia en check final obligatorio, seguido de inicio COMMIT sin control del caller. No se exige deadline físico de commit durable. **Puerta C PASS; F05 sigue OPEN / MATERIAL / ALTA y pendiente de implementación definitiva/verificación técnica.** F01–F04 pendientes de reverificación formal; H0-012 FAILED / NOT COMPLETED; H0-013 NOT STARTED. Hosted intacto. No se heredan resultados para el cierre formal.

## Implementación local D039/F05 — continuidad autorizada (2026-09-28)

La autorización posterior a D039 permite la secuencia A–L dentro de H0-012, con correcciones, pruebas y publicación sin aprobaciones intermedias. Base inicial `64ce6cae0e79e9083b72cf9690b93b0a59a01275`, comprobada main/limpio/HEAD=origin/main. Publicados: `4e5e241709e96559b3db97b7c560452da3edc2d3` (Architecture/Plan y coordinación) y `3c0476888c64e258541051906b9479808c274cf4` (mapa y puerta de viabilidad anterior). Last Approved Commit permanece `3e3f47a1692290412a03cf14087c2c470b8cab90`.

### Implementación y frontera efectiva

- `human-approval-executor.ts` crea un pool privado separado y devuelve siete operaciones ligadas a su adaptador dentro de un objeto congelado. La composición recibe explícitamente `humanApprovalDatabaseUrl`; no hay fallback al pool general. El solicitante de operaciones no recibe SQL, callback, issuer, conexión, handle ni COMMIT separado. La configuración pertenece al servidor de confianza; no se amplía M1/M2 a un compromiso de ese proceso.
- Migraciones forward `20260928193107_h0_m04_tte_authorities.sql` y `20260928193111_h0_m04_tte_boundary.sql`: LOGIN mínimo `crm_h0_ha_tx`, sin nuevos NOLOGIN, sin ownership/DDL/keys/DML directo ni memberships. CONNECT a la base actual y USAGE crm_api; EXECUTE solo en entrada M04, lectura, evidencia/replay/finalización, dos overloads M02 y lookup de identidad. Revocadas a PUBLIC/runtime las entradas HA y el overload humano M02. El overload técnico ordinario sigue disponible a runtime con su F1 correspondiente.
- Los codecs y verificadores SQL vinculan login/purpose/operation/resource/action mediante conjuntos cerrados. `crm_h0_runtime` deja de aceptar los tres purposes HA; el nuevo login solo acepta esos purposes/targets. F2 conserva los seis contratos originales para runtime y únicamente C01/C03 Core para HA. PID/xid/database/start/login/audience/generation se cotejan en la transacción real; no se cambian claves, ventanas ni criptografía.
- El TTE conserva M04/M02 en una unidad. Prepara el resultado y envía `SET CONSTRAINTS ALL IMMEDIATE; SELECT crm_api.h0_m04_finalize_evidence(...); COMMIT` como un único mensaje privado: el trabajo diferido precede al check final, sin retorno al solicitante. El proveedor solo se consulta fuera de la transacción sensible. El replay no obtiene evidencia nueva.
- Si se pierde transporte/respuesta después de despachar el mensaje final, `HumanApprovalCommitUncertainError` conserva la identidad estable y no afirma rollback. Los errores SQL conocidos de validación siguen denegando; E2 permanece distinto. La recuperación usa el resultado durable de la misma identidad.

### Conservación de reproducción y resultados focales

`tests/fixtures/pre-d039/postgres-h0-012-original.txt` conserva **byte a byte** el fichero normativo de la base, incluidos A/B; SHA-256 `816adbb8e54e2c911d07fe1d35c700ab24288fa5951ed6be9e382c57d1b82fbf`, contrastado con `git show` de la base. El harness vigente dirige A/B a las credenciales reales M2 `crm_h0_runtime`: ambas secuencias reciben 42501 antes de construir/finalizar una unidad. No se cambia su expected de denegación. Los controles que inyectan waits dentro del TTE son instrumentación de prueba del servidor confiable, no una facultad de M2.

Las copias del adaptador/codec pre-D039 en fixtures mantienen la regresión del predecesor H0-011 contra sus migraciones históricas. No se introduce un bypass legacy productivo. El seed técnico de upgrade utiliza un purpose ordinario independiente de los purposes HA reservados. La suite H0-012 prueba la cadena y frontera actuales.

- F05 focal: **8/8 tests Node PASS, 0 skipped**, 10484.08725 ms. A/B runtime denegados, API/pool privado positivo, espera corta válida y dos esperas que caducan antes del check con rollback completo. Snapshots independientes de actividad, M04, M02 e intents.
- Control temporal positivo: un COMMIT real queda en `SyncRep` por un standby sintético ausente, observado desde otra conexión cuando la evidencia sigue vigente. Se libera después de su expiry y la unidad queda durable. Acredita precisamente D039: inicio tras check vigente; no deadline físico del COMMIT. Se restaura la configuración en `finally` y se elimina el clúster.
- Primera prueba del pool: FAIL de harness por una URL con `?host=socket` ignorado por postgres.js. Se corrigió a TCP loopback de clúster sintético desechable (auth trust solo en ese entorno), manteniendo TLS obligatorio por defecto en la fábrica productiva. Reejecución completa F05: 8/8 anterior. No fue un fallo de autoridad ni se debilitó el expected.
- Focales F01/F02/F03: **31/31 tests Node PASS, 0 skipped**, 127411.322958 ms; ventanas reales 30 s, actor/ledger, F2 original frente a F1 posterior, overload técnico, evidencia positiva/negativa, replay, rollback/activity, ACL/RLS/NOLOGIN y upgrade atómico. F04 se reejecuta en los controles final-message/SET CONSTRAINTS y waits reales del focal F05.
- Focal independiente R19/R20 adicional: **1/1 PASS**, un resultado tardío del primer intento ya fallido no puede consumir la reserva durante el segundo intento. La unicidad durable del resultado por attempt impide la sustitución; no se identifica un nuevo defecto por esta hipótesis.

Estos resultados **no cierran** F01–F05 ni H0-012. Regresión completa y R01–R25 independiente aún pendientes al registrar esta etapa. Hosted/Production/efectos externos no tocados. H0-013 NOT STARTED.

### Regresión completa inicial y correcciones del harness

Primera ejecución completa: **231 tests Node, 228 PASS, 3 FAIL, 0 skipped**, 387571.299792 ms. Dos fallos hoja y un contenedor: el fixture técnico histórico H0-009 usaba `h0-011-human-approval`, purpose ahora reservado a HA por D039; se cambia exclusivamente ese contexto sintético a un purpose técnico ordinario incluido en su key de prueba. R17 comparaba directamente `postgres.Result` con `Array`: las dos filas SQL eran exactamente `part-a/consumed` y `part-b/reserved`, pero difería el prototipo del contenedor. Se convierte el resultado mediante `Array.from` antes de la misma comparación exacta. No cambia producto ni expected normativo por estos dos fallos.

La matriz incluida en esa ejecución detuvo su programación en R17; R18–R25 no se acreditan por esa corrida. También se corrigieron antes de la nueva ejecución dos referencias del harness según el esquema real (`proposer_actor` y denegación SQL de lectura fuera de scope), y se añadieron controles actuales H0-009, intento histórico y API privada. No se registra F06 por errores de harness sin violación de una obligación aprobada. Se exige repetir suite completa y luego una nueva corrida formal desde cero.

Catálogo posterior leído durante la segunda regresión (`/tmp/h0-d039-surface-after.txt`): 19 funciones `crm_api`; runtime conserva 11 entradas ordinarias y HA tiene 8. Seis entradas exclusivas HA: command, read_proposal, evidence_replay, revalidate_evidence, finalize_evidence y overload humano M02 de seis argumentos. Dos compartidas: lookup de identidad y overload técnico M02 de tres argumentos, siempre sujetos a los verificadores. Owners existentes `crm_h0_executor`/`crm_h0_f2_executor`; no ownership nuevo. TEMP/CREATE de base y CREATE public son false para ambos logins. Cuatro ataques SQL adicionales, tabla temporal y función shadow bajo cada login, reciben 42501; son comprobaciones de catálogo/SQL, no se suman al total Node. Prototipo de puerta C detenido y su clúster sintético eliminado; scripts/resultados sin claves permanecen en `/tmp/h0-d039-lab`.


### Cierre del bloque de implementación, antes de reverificación formal separada

Segunda regresión PostgreSQL completa: **240/240 PASS, 0 skipped/cancelled/todo**, 396352.46625 ms, exit 0 (`/tmp/h0-d039-all-postgres-2.log`). Incluye una R01–R25 completa dentro de la regresión; la fase H ejecutará otra desde cero en un clúster nuevo tras publicar este bloque. No se heredan sus PASS para el cierre.

`pnpm install --frozen-lockfile`, `pnpm audit --prod` (sin vulnerabilidades conocidas), typecheck, lint/import boundaries, **31/31 tests unitarios**, build y `git diff --check`: PASS. Escaneo razonable de patrones de secretos sin coincidencias; claves aleatorias solo en clústeres de prueba, sin credenciales reales. Dependencias/lockfile y migraciones históricas intactos. Total de regresión: **271/271 tests Node**; focales y futura corrida formal son ejecuciones distintas y no se suman a ese total.

La advertencia PostgreSQL 25P01 del pool de prueba corresponde al COMMIT automático del driver después del COMMIT explícito ya confirmado por el mensaje TTE; no ejecuta otra unidad ni altera el resultado. La prueba de respuesta perdida después del COMMIT real devuelve incertidumbre y recupera el resultado durable con la misma identidad. No se ha identificado un nuevo defecto material F06+ en esta etapa.


## Reverificación formal independiente D039 y cierre local H0-012 — 2026-09-28

Base publicada exacta `08fc36b80e46e1026de3e20e9debfc4379aeff08`. Preflight posterior al bloque: HEAD=origin/main, rama main y árbol limpio. PostgreSQL 17.11, Node 24.21.0 y pnpm 11.19.0; nuevo clúster/datos/keys sintéticos, separado de la regresión anterior. Se seleccionó únicamente el contenedor `H0-012 D039 formal R01-R25` mediante `node --test --experimental-strip-types --test-name-pattern=... tests/integration/postgres-h0-012.test.ts`, con POSTGRES_H0_BIN local. Log `/tmp/h0-d039-formal.log`.

Expected derivado de la matriz normativa inicial y D039 aprobada; framing y hashes de referencia independientes de los codecs productivos. Cada fila empezó de cero. La lógica adversarial contrasta SQL y persistencia desde otra conexión, controles positivos junto a denegaciones, locks/reloj reales, firmas válidas con cruces inválidos, fallos reales de DDL/escritura y respuesta perdida tras COMMIT. Ningún PASS se hereda de focales ni de la regresión. Fail-fast permaneció activo y no se encontró defecto material nuevo.

| Fila | Evidencia nueva en esta corrida | Resultado |
|---|---|---|
| R01 | Propuesta IA sin autoridad humana no decide; decisión humana vigente trazable | PASS |
| R02 | Pending/rejected no reservan, intentan ni registran resultado | PASS |
| R03 | Aprobar deja cero reserva/intento/success externo | PASS |
| R04 | Payload exacto y fingerprint calculado mediante framing independiente | PASS |
| R05 | Cada componente cambiado deniega y conserva la aprobación | PASS |
| R06 | Vectores Unicode/slots/framing, límites exactos y bytes diferentes | PASS |
| R07 | ID/hash/scope/effect de parte y decisión cruzada deniegan | PASS |
| R08 | Evidencia positiva, fuente/expiry/prueba negativa, waits, replay sin proveedor y A/B M2 | PASS |
| R09 | Revocación, disable, generation/epoch, MFA/password, límites 7/30 días y actividad | PASS |
| R10 | Cinco waits reales >30 s: actor, sesión, epoch, advisory de comando y parte; rollback total | PASS |
| R11 | M02 corto y largo; F2 caduca con F1 posterior viva; overload técnico no evita F2 | PASS |
| R12 | Revocación ganadora deniega; unidad ya admitida bloquea revocación hasta concluir | PASS |
| R13 | Cruces firmados login/purpose/target/scope/input y F1/F2 ausentes; H0-009 ordinario positivo en runtime | PASS |
| R14 | DML/DDL/keys/SET ROLE denegados; memberships y entradas HA/Data API/overloads contrastados | PASS |
| R15 | Payload copiado a backend/tx nuevos, rollback/error/GUC; sin autoridad residual | PASS |
| R16 | Dos conexiones sobre una parte: una sola reserva y una intención | PASS |
| R17 | Primera parte consumida no se repite; segunda independiente queda reservable | PASS |
| R18 | Uncertain retiene reserva y deniega retry/reserva nueva | PASS |
| R19 | Solo attempt/reserva original incierto concilia; mismatches y segunda conciliación deniegan | PASS |
| R20 | Failure conocido permite nuevo intento; intento histórico no lo sustituye; success consume | PASS |
| R21 | Replay committed tras expiry sin proveedor ni refresh, resultado fijo y E2 si cambia material | PASS |
| R22 | Fault injection receipts/history/results/intents sin residuos; COMMIT real con respuesta perdida da incertidumbre y replay | PASS |
| R23 | A/B runtime denegados; TTE privado positivo, RLS/owners/privilegios y commit durable posterior al expiry | PASS |
| R24 | Cadena vacía/upgrade de esta corrida, wrong authorities, rollback DDL, fixture exacto y lectura fuera de scope | PASS |
| R25 | Origen IA, registrador/aprobador humano y ejecutor técnico distinguidos en propuesta/decisión/events/results | PASS |

**Resultado formal: 25/25 filas PASS; 32/32 tests Node PASS** (31 casos hoja y su contenedor; R08 tiene varios casos), 0 skipped/cancelled/todo, 258984.1565 ms, exit 0. Los cuatro ataques shadow/temp adicionales se repitieron contra este mismo clúster con 42501 y privilegios TEMP/CREATE false (`/tmp/h0-d039-formal-shadow.json`); no se cuentan como tests Node.

**Cierre:** F01, F02, F03, F04 y F05 CLOSED en alcance local por esta corrida completa. No F06+ material identificado. TSK-H0-012 COMPLETED localmente y D039 IMPLEMENTED LOCALLY; D037/D038 y el contenido normativo D039 intactos. Se preservan todas las ejecuciones FAILED y puertas anteriores, además de los errores de harness de esta etapa; el cierre no cambia sus resultados históricos.

Regresión acreditada antes de esta corrida: **240/240 PostgreSQL + 31/31 unitarios = 271/271**, install frozen/audit/typecheck/lint/build/diff-check PASS. Los 32 tests formales son otra ejecución y no se presentan como casos únicos adicionales. Clústeres efímeros detenidos/eliminados por teardown; sin proveedor ni efecto externo real. Hosted M03/M04 NO ACREDITADOS, Supabase Staging/Production intactos, PLAN-AUTH-002/006 PENDING globalmente, H0 IN PROGRESS. **Punto de parada alcanzado: H0-013 NOT STARTED y no ejecutado.** Last Approved Commit permanece `3e3f47a1692290412a03cf14087c2c470b8cab90`; publicar implementación/cierre no constituye una nueva aprobación arquitectónica.
