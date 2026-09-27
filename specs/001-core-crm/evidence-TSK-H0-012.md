# TSK-H0-012 — Verificación formal independiente local

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
