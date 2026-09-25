# V-EVI — TSK-H0-010

Estado: **COMPLETED — comprobación normativa formal e independiente local**

Fecha: 2026-09-25

Commit bajo prueba: `f628a39a08dc3924dcdd0e6d766ce25548d49919` (`feat(h0): persist unit history and idempotent results`).

Commit de verificación: el único commit `test(h0): formally verify durable unit persistence` que incorpora esta evidencia; su SHA se obtiene tras publicar con `git log -1 --format=%H -- specs/001-core-crm/evidence-TSK-H0-010.md`.

Entorno: Work Local, rama `main`, mismo Mac; PostgreSQL 17.11 Postgres.app mediante socket Unix y clústeres efímeros; Node 24.21.0, pnpm 11.19.0, Postgres.js 3.4.9, Next.js 16.3.5 y TypeScript 7.0.2. Solo datos, identidades y claves sintéticos. Supabase Staging `wrcrhbdbydkchxxlcacb` no se conectó ni modificó.

## 1. Independencia, fuentes y método

La matriz se derivó antes de inspeccionar H0-M02 desde Tasks TSK-H0-009/010 y §§2.2/2.3/6/7; Plan §§5.1/5.4/7.1/7.2/8; SPEC-FR-HIST-001/002, SPEC-FR-IDEMP-001/002, SPEC-FR-CONC-001/003/004, AC-068 y SPEC-NFR-008; DM-INV-047; ARCH-DEC-002/013/014/015/016; P01/P06/P14; PLAN-DEC-002/003/004, B08, C03, PT-12, G4/G6, E2/E5, D004/D032 y D037 únicamente para F1.

La suite independiente es `tests/integration/postgres-h0-010.test.ts`: 21 tests nuevos. Reutiliza solo PostgreSQL efímero y las migraciones históricas; define su propio contexto, key provisioning, codec de referencia, construcción material, ataques y oráculos. No modifica ni importa asserts de `postgres-h0-009.test.ts`, no usa `evidence-TSK-H0-009.md` como oráculo y no cambia código productivo ni migraciones.

## 2. Matriz normativa independiente

| Fuente / requisito | Ataque o caso independiente | Expected | Observed | Resultado |
|---|---|---|---|---|
| HIST-001, G4, P06 | creación y cambio posterior | `before=NULL` al crear; después before/after reales, causa, fuente, actor y momentos | dos hechos append-only exactos; raíz vigente separada | PASS |
| HIST-002, ARCH-DEC-016 | capturar fila original, cambiar raíz y volver a leer | original idéntico; corrección añade historia | snapshot original byte/valor estable y segunda fila nueva | PASS |
| IDEMP-001, G6 | replay equivalente después de que otra operación lleve raíz a v2 | resultado histórico previo; v2 intacta | `previous`, mismo resultado/effect/intent; raíz sigue v2 | PASS |
| IDEMP-001/002, E2 | cambiar por separado raíz, versión, valor, causa, fuente, momento, evidencia, actor, propósito, scope e intención | conflicto/denegación sin segundo efecto | E2 o fail-closed; contadores materiales siguen 1 | PASS |
| IDEMP-001, DM-INV-047 | mismo operation id y Unicode visualmente igual pero bytes distintos | material distinto, no semejanza | compuesto/decompuesto produce E2 | PASS |
| ARCH-DEC-013 | mismo effect o intent desde otra operation id | no segundo derecho material | E2 y rollback total de segunda unidad | PASS |
| CONC-001, PLAN-DEC-004 | dos operations distintas sobre la misma versión | un ganador, un E2; no lost update | raíz v2 y exactamente dos historias incluida semilla | PASS |
| IDEMP-001, CONC-001 | misma operation/fingerprint concurrente real | applied + previous, mismo durable result | 1 mutation/history/result/intent y 2 attempts UUID distintos | PASS |
| IDEMP-001, E2 | misma operation, fingerprint distinto concurrente | una aplica, otra E2 | 1 única unidad material | PASS |
| CONC-003, AC-068, NFR-008 | fallos antes de operación, después de mutation, history, result e intent | todo o nada | 0 root/operation/attempt/history/result/intent del fallo | PASS |
| CONC-003/004, E4 | COMMIT real seguido de respuesta perdida | durable una vez; retry autorizado recupera previous | primer caller `pending`; replay nueva transacción `previous` | PASS |
| IDEMP-001, PLAN-C03 | scope incorrecto intenta recuperar result por operation id | no lectura previa | E2 sin attempt ni dato previo; scope correcto sí recupera | PASS |
| C04 | `evidence_state=candidate` | no verified/confirmación/privilegio | permanece `candidate`; no estado implícito | PASS |
| C05, CONC-004 | unidad con intención | solo intent; no attempt/result/uncertain ni red | una fila `stage=intent`, sin outcome ni provider attempt | PASS |
| D037, PLAN-DEC-002 | GUC falso, MAC/input/payload/target/binding alterados, replay cross transaction/PID | ningún acceso/efecto | 42501/H0002; solo capability válida exacta aplica | PASS |
| D037, pool | success/replay/conflict/error/savepoint y reutilización | sin autoridad residual | GUC NULL/vacío observado y acceso directo denegado después | PASS |
| P10/D037 | catálogo, ACL, owners, roles, RLS y SECURITY DEFINER | mínimo privilegio efectivo | seis tablas owner separado + FORCE RLS; runtime solo tres funciones API | PASS |
| P06/HIST-002 | UPDATE/DELETE/forja SQL directa | historia/result/identidades inmutables | todos los intentos runtime reciben 42501 | PASS |
| CONC-001, E2/E5 | deadlock real dentro de dos unidades H0-M02 | 40P01 aborta una completa; reevaluación, no retry ciego | una applied, otra E2; 0 filas del perdedor | PASS |
| P13, V-MIG | vacío, upgrade F1, runtime, reapply y fallo antes de commit | cadena reproducible y fail-safe | todos los casos observados sin estado híbrido | PASS |

## 3. V-DOM

PASS. El fixture técnico demuestra las propiedades reutilizables sin inventar entidades T01–T11: estado vigente no sustituye historia; creación representa ausencia previa; actor técnico, causa, fuente, happened/recorded y before/after quedan reconstruibles. `operation_id`, `effect_id`, `intent_id` y `attempt_id` permanecen conceptos distintos. Una nueva invocación equivalente crea solo un intento; una corrección legítima añade un hecho.

La evidencia candidata no se transforma en verificada (C04). La única etapa externa generada es `intent`; no existe llamada de red/proveedor y runtime no puede crear directamente `attempt`, `result` o `uncertain` (C05). No se afirma event sourcing, entrega, exactly-once externo ni dominio comercial.

## 4. V-DAT — idempotencia, replay y autorización

El replay secuencial y concurrente equivalente devuelve el resultado durable fijado, conserva `effect_id`/`intent_id`, añade un `attempt_id` distinto y no repite estado, historia, resultado o intención. El replay de A después de B recupera A sin revertir la raíz de v2. La recuperación se reautoriza mediante nueva capability F1; un scope distinto no recibe el resultado aunque conozca `operation_id`.

La misma key con cualquier material distinto produce E2 o denegación previa. Se alteraron individualmente raíz, expected version, after, reason, source, happened_at, evidence state, identidad, identity kind, purpose, scope, presencia de intent, effect/intent id, destination y content version/fingerprint. Unicode compuesto y descompuesto se mantuvieron byte-distintos.

## 5. Concurrencia, deadlock y conflictos

Se usaron dos conexiones PostgreSQL reales, no secuenciación simulada. Misma operation/material produjo `applied + previous`, un único efecto material y dos attempts. Misma operation/material diferente produjo `applied + E2`. Dos operations distintas sobre una raíz/version produjeron un ganador y E2; un writer stale posterior tampoco sobrescribió.

Un trigger efímero de prueba hizo que dos unidades, después de adquirir sus locks de operation, esperasen el lock opuesto en `unit_results`. PostgreSQL detectó deadlock real: el adaptador recibió 40P01 y lo clasificó E2; la transacción perdedora dejó cero filas en las seis superficies. El mapeo 40001→E2 se verificó por inyección controlada del error del driver; no se indujo una anomalía serializable real porque C03 está normativamente fijado a READ COMMITTED. No hay retry automático.

## 6. C03 y fault injection

Se inyectaron fallos en las fronteras antes de la unidad, al insertar operación, antes de historia, antes de resultado, antes de intención y después de que la función completase todas sus escrituras pero antes de COMMIT. En cada caso se contaron explícitamente raíz/version, operation, attempts, history, results y external records: todo quedó en cero para la unidad fallida.

En la pérdida post-COMMIT, el wrapper esperó a que `begin` terminase —incluido COMMIT— y lanzó solo después. El resultado fue E4/pending; la base ya contenía una unidad completa. Una nueva transacción/capability equivalente recuperó `previous`, sin segunda mutation/history/result/effect/intent; solo añadió attempt autorizado.

## 7. Codec y fingerprint diferencial

Se implementó un encoder de referencia independiente: cada campo UTF-8 lleva longitud U32BE; límite 16 KiB por string y 64 KiB total, sin NUL ni normalización Unicode. Se compararon sus bytes con `encodeF1Fields` TypeScript y `crm_f1.pack_fields` PostgreSQL para ASCII, UTF-8 multibyte, emoji, combinantes, vacíos permitidos, prefijos comunes y longitudes próximas a ambos límites: igualdad exacta en válidos y rechazo coherente en exceso/NUL.

PostgreSQL recalcula el fingerprint material y el content fingerprint; modificar input tras firmar, MAC, claim, target, transacción o PID falla cerrado. Una capability C01 o `access_probe` no sirve para `internal_unit`; una capability consumida no vuelve a aplicar.

## 8. F1, GUC, RLS, ACL e inmutabilidad

La regresión F1 completa anterior (A01–A30, comparator, binding, key lifecycle, C01/C03 y M2) volvió a pasar. H0-M02 no reabre H0-008-F01: nombres/GUC falsos no conceden DML; runtime no tiene acceso directo, key store, firmador, helpers, ownership ni membresía SET/INHERIT/ADMIN.

Las seis tablas H0-M02 tienen RLS ENABLE + FORCE y owner `crm_h0_table_owner`. Executor/verifier/table owner son NOLOGIN, sin BYPASSRLS; executor no lee K y verifier no hace Core DML. PUBLIC no ejecuta las funciones privilegiadas. Las funciones SECURITY DEFINER auditadas tienen owner separado y `search_path=pg_catalog, pg_temp`; runtime solo ejecuta `read_probe`, `apply_probe_batch` y `commit_internal_unit`. `search_path` hostil, objetos temporales y function shadow no alteraron la resolución.

Tras success, previous, conflict, error, rollback/savepoint, nueva transacción, conexión reutilizada y otro cliente, `crm.f1_payload/mac/input` se observaron NULL/vacíos y SQL directo siguió denegado. El rollback de savepoint revirtió conjuntamente consumo F1 y unidad; la capability pudo aplicarse una sola vez después dentro de la misma transacción.

## 9. V-MIG

| Caso | Expected | Observed | Resultado |
|---|---|---|---|
| Clúster vacío | cadena histórica completa hasta H0-M02 | M01 roles/context → F1 authorities/capabilities → M02 | PASS |
| Upgrade real desde F1 | conservar fixture anterior | `access_probe` previo idéntico | PASS |
| Autoridad | migration aplica; runtime rechaza | psql migration PASS; runtime 42501 | PASS |
| Ownership/grants/RLS | separación y mínimos | catálogo coincide; seis FORCE RLS | PASS |
| Fallo inyectado | rollback sin objetos M02 | tabla y función ausentes | PASS |
| Reaplicación | fallo seguro, sin híbrido/corrupción | falla por objeto existente; transacción revierte y datos siguen | PASS |

Las migraciones históricas H0-M01/F1 no se modificaron. H0-M02 no se aplicó hosted.

## 10. Comandos, conteos y resultado

| Comando | Expected | Observed |
|---|---|---|
| `pnpm install --frozen-lockfile` | lock reproducible | PASS, ya actualizado |
| `pnpm audit --prod` | sin vulnerabilidades conocidas | PASS |
| `pnpm run typecheck` | tipos correctos | PASS |
| `pnpm run lint` | fronteras/imports | PASS |
| `pnpm test` | regresiones generales | PASS 27/27 |
| `POSTGRES_H0_BIN=.../17/bin pnpm run test:postgres` | regresión PostgreSQL completa | PASS 93/93 |
| suite H0-010 aislada | ataques independientes | PASS 21/21 |
| `pnpm run build` | build Next.js | PASS |
| `git diff --check` | diff válido | PASS al pre-commit |

Total: **120 tests PASS, 0 FAIL, 0 skipped** (27 generales + 93 PostgreSQL). Los 21 H0-010 forman parte de los 93 PostgreSQL y no se suman otra vez.

## 11. Defectos, limitaciones y capacidades no acreditadas

No se encontró defecto material en TSK-H0-009. Durante el desarrollo de la suite se corrigió solo un error de tipos del propio test H0-010 (`runtime` posiblemente ausente); no se alteró el objeto bajo prueba.

Limitaciones: 40001 se verificó como clasificación del adaptador mediante error controlado, mientras 40P01 sí se produjo realmente dentro de H0-M02. Los fixtures acreditan infraestructura reutilizable, no T01–T11, Auth/CRM Actor humano, Human Approval, proveedor/job, entrega, resultado externo, exactly-once entre sistemas, Production, backup/restore de H0-M02 ni capacidad/performance comercial. PLAN-AUTH-006 continúa PENDING globalmente; solo su subset hosted database/F1 previo permanece VALIDATED. La aplicación/validación hosted de H0-M02 requiere bloque posterior y autorización humana separada.

**TSK-H0-010 COMPLETED localmente. TSK-H0-009 permanece COMPLETED. H0-005/006 y tareas posteriores siguen NOT STARTED. Last Approved Commit permanece `da7b71a3f2962093b7422899ab2193f29ae3c4e0` (D037).**
