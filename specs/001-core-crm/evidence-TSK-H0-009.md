# V-EVI — TSK-H0-009

Estado: **COMPLETED (implementación local) / TSK-H0-010 NOT STARTED**

Fecha: 2026-09-25

Base: `96737132c2853c3dfb988ece023abbe0c0aa3daa`

Commit final: el único commit `feat(h0): persist unit history and idempotent results` que incorpora esta evidencia; el SHA se obtiene después de publicar con `git log -1 --format=%H -- specs/001-core-crm/evidence-TSK-H0-009.md`.
Entorno: Work Local, rama `main`, mismo Mac; PostgreSQL 17.11 Postgres.app por socket Unix y clústeres efímeros; Node 24.21.0, pnpm 11.19.0, Postgres.js 3.4.9, Next.js 16.3.5, TypeScript 7.0.2. Solo datos, identidades y claves sintéticos. Supabase Staging `wrcrhbdbydkchxxlcacb` no se conectó ni modificó.

## 1. Fuentes y alcance

Fuentes contrastadas: Tasks TSK-H0-009/010 y §§2.2/2.3/6/7; Plan §§5.1/5.4/7.1/7.2/8 y PLAN-DEC-001–009 aprobadas por D032; SPEC-FR-HIST-001/002, SPEC-FR-IDEMP-001/002, SPEC-FR-CONC-001–004, AC-015/066/067/068/073/081; D037 y F1 únicamente para conservar acceso, roles, RLS y C03.

Se implementa infraestructura técnica reutilizable B07/B08 sobre un único fixture `technical-state-change`. No se crean Opportunity, Proposal, Booking, Payment, Refund ni otra tabla comercial; no se ejecuta proveedor, job, Auth, UI o efecto externo. TSK-H0-010 queda expresamente fuera de esta evidencia de implementación.

## 2. Migración y esquema técnico

Migración forward: `202609250000_h0_m02_unit_history.sql`. No modifica H0-M01 ni F1. Se aplica después de la cadena histórica y exige `current_user=crm_h0_migration`. Los permisos CREATE transitorios requeridos para transferir ownership se revocan antes de COMMIT.

| Objeto | Propósito | Owner / acceso ordinario |
|---|---|---|
| `crm_private.unit_roots` | Estado vigente y versión material por raíz | `crm_h0_table_owner`; executor SELECT/INSERT/UPDATE bajo FORCE RLS |
| `crm_private.unit_operations` | Identidad estable, clase, scope, fingerprint, actor, causa, fuente, versiones y efecto | owner separado; executor SELECT/INSERT, sin UPDATE/DELETE |
| `crm_private.unit_attempts` | Intentos técnicos initial/replay con identidad distinta | owner separado; executor solo INSERT |
| `crm_private.unit_history` | Historia append-only before/after/cause/source/happened/recorded/actor | owner separado; executor solo INSERT |
| `crm_private.unit_results` | Resultado semántico durable fijado | owner separado; executor SELECT/INSERT, sin UPDATE/DELETE |
| `crm_private.external_effect_records` | Etapas separables intent/attempt/result/uncertain | owner separado; H0-009 inserta exclusivamente intent |
| `crm_api.commit_internal_unit` | Única interfaz runtime C03 | SECURITY DEFINER de executor; EXECUTE explícito runtime |
| `crm_f1.verify_envelope/verify_unit/unit_row_allows` | Capability específica internal_unit, binding y RLS | verifier NOLOGIN; helpers no públicos |

Todas las tablas nuevas tienen RLS ENABLE + FORCE, owner NOLOGIN separado y policies que vuelven a verificar la capability F1 autenticada. Runtime conserva solo USAGE/EXECUTE sobre `crm_api`; no SELECT/DML Core, ownership, membresía, key store ni función de firma.

## 3. Operación, huella y resultado durable

Input canónico `CRM-UNIT1`: campos UTF-8 ordenados con prefijo U32BE, sin JSON firmado, NULL, NUL, campos desconocidos o coerción implícita. La unidad autentica operation id/class, root, expected version, material fingerprint, attempt id, cause, source, happened_at, after, evidence state y manifest de intención.

La huella material es SHA-256 sobre un segundo dominio canónico `CRM-UNIT-MATERIAL1`: clase, raíz, expected version, after, causa, fuente, happened_at, evidence state, identidad/kind/purpose/scope confiables y todos los campos de intención. PostgreSQL reconstruye el mismo framing y recalcula la huella antes de admitir la unidad. No se basa en timestamp, request id ni operation id.

La capability usa resource `internal_unit`, action `commit_internal_unit`, operation C03 y binding F1 real (database/postmaster/xid8/PID/login/audience/generation). El verificador común preserva C01/C03 previos y el comparador D037. Modificar input, scope, operation, actor o fingerprint invalida capability/huella.

`unit_results` fija estado `applied`, versión resultante, after, fingerprint, effect/intent y fixed_at. Un replay equivalente crea capability y attempt nuevos, vuelve a comprobar autorización/scope, bloquea por operation id, compara fingerprint y devuelve el mismo resultado como `previous`. No vuelve a cambiar raíz, historia, resultado o intención.

## 4. Historia, efecto, intento e intención

La primera creación conserva `before_value=NULL`; cambios posteriores registran el valor realmente vigente. Cada fila conserva `reason`, `source`, `happened_at` opcional, `recorded_at` PostgreSQL y actor técnico confiable. `evidence_state=candidate` permanece candidato: la interfaz no admite una confirmación/verificación implícita.

`operation_id`, `effect_id` y `attempt_id` son identidades separadas. `effect_id` e `intent_id` quedan fijados en operación/resultado; cada invocación tiene attempt UUID nuevo. Replays agregan exclusivamente un intento técnico `replay`, no otro efecto, historia, resultado o intención.

H0-009 inserta solo `stage=intent` con destination abstracto, content version y content fingerprint. Las restricciones permiten distinguir persistentemente `intent`, `attempt`, `result` y `uncertain`, pero no se crea intento ni resultado de proveedor. Una intención persistida no acredita envío, ejecución ni entrega.

## 5. Atomicidad C03, C04 y C05

| Control | Expected | Observed | Resultado |
|---|---|---|---|
| C03 unidad | estado + operación + intento + historia + resultado + intención aplicable en un COMMIT | Una función estrecha, una transacción reservada; cualquier fallo revierte todo | PASS |
| C04 | evidencia candidata no confirma | `candidate` persistido; `verified` no pertenece a la interfaz H0-009 | PASS |
| C05 | intención ≠ intento ≠ resultado conocido ≠ incierto | Solo fila intent; 0 attempts/results/uncertain de proveedor | PASS |
| Sin intención | unidad sigue atómica sin inventar efecto | result effect/intent NULL, 0 external records | PASS |

No hay REST múltiple, transacción distribuida, proveedor, exactly-once externo, historia/event sourcing ni idempotencia entre sistemas.

## 6. Replay, concurrencia y conflicto

| Caso | Expected | Observed | Resultado |
|---|---|---|---|
| Replay equivalente secuencial | mismo resultado; sin duplicar material | applied + previous; 1 operación/raíz/historia/resultado/intención y 2 attempts | PASS |
| Misma key, material distinto | E2; sin segundo efecto | H0002 mapeado a E2; contadores materiales permanecen en 1 | PASS |
| Dos transacciones, misma key/fingerprint | una aplica, otra converge | advisory xact lock + unicidad: applied/previous y resultado idéntico | PASS |
| Dos transacciones, misma key/fingerprint distinto | una aplica, otra E2 | 1 operación/historia/resultado; conflictiva rejected E2 | PASS |
| Dos operaciones sobre v1 | una cambia a v2, la otra no sobrescribe | bloqueo de raíz + expected version: applied/rejected E2; versión 2 | PASS |
| Deadlock PostgreSQL real | una transacción completa aborta; nada parcial del perdedor | SQLSTATE 40P01; solo un marcador transaccional sobrevivió | PASS |
| 40P01/40001 en adaptador | reevaluar, no retry ciego | mapeo explícito a E2; no bucle automático | PASS de implementación |

La serialización por operation id usa advisory transaction lock; la raíz usa fila/version real. No hay `MAX()+1`. Colisiones del hash solo reducen concurrencia, no conceden autoridad ni duplican efectos.

## 7. Fallos, rollback y pérdida post-COMMIT

Fixtures temporales del clúster efímero provocaron fallo: antes de la operación material, después del update de estado y antes de historia, después de historia y antes de resultado, antes de intención, y después de que la función hubiese creado intención pero antes del COMMIT. En cada caso se observaron 0 operación/attempt/historia/resultado/intención y ausencia de raíz nueva: **PASS**.

Pérdida real de respuesta tras COMMIT: el wrapper dejó completar `target.begin` —incluido COMMIT— y solo entonces lanzó la pérdida sintética. El primer caller obtuvo E4/pending; el estado ya estaba durable. El replay normal equivalente devolvió `previous`; quedaron 1 cambio, 1 historia, 1 resultado, 1 efecto/intención y 2 attempts: **PASS**. No se simuló lanzando antes del COMMIT.

## 8. Inmutabilidad, permisos y fronteras

Runtime directo recibió 42501 al intentar SELECT/UPDATE/DELETE de historia/resultados, cambiar fingerprint/effect id o borrar intención. No puede ejecutar verifier, common helper, packer o key store; solo aparecen `read_probe`, `apply_probe_batch` y `commit_internal_unit` en su ACL de funciones. Executor no puede leer K y verifier no puede leer/DML las tablas de unidad. PUBLIC carece de EXECUTE implícito.

Domain y application no importan PostgreSQL, infrastructure ni Next.js. El adaptador PostgreSQL implementa TransactionPort; server composition expone el adaptador. SQL protege integridad, atomicidad, concurrencia, permisos e inmutabilidad técnica; no decide reglas comerciales.

## 9. V-MIG

| Caso | Observed | Resultado |
|---|---|---|
| Cadena histórica desde base vacía | H0-M01 roles/context → F1 authorities/capabilities → H0-M02 | PASS |
| Upgrade desde F1 | dato técnico `access_probe` previo conservado | PASS |
| Autoridad | migration aplica; runtime ejecutando el mismo archivo obtiene 42501 | PASS |
| Ownership/ACL/RLS posterior | seis tablas table_owner; FORCE RLS; grants mínimos | PASS |
| Fallo inyectado antes de COMMIT | transacción abortada; `unit_operations` y función API inexistentes tras ROLLBACK | PASS |

No se aplicó la migración en Supabase Staging. Esa aplicación/compatibilidad hosted queda posterior a TSK-H0-010 y a autorización humana separada.

## 10. Comandos y resultados

| Comando | Expected | Observed |
|---|---|---|
| `pnpm install --frozen-lockfile` | lock reproducible | PASS |
| `pnpm audit --prod` | sin vulnerabilidades conocidas | PASS |
| `pnpm run typecheck` | tipos correctos | PASS |
| `pnpm run lint` | fronteras correctas | PASS |
| `pnpm test` | regresiones unitarias | PASS 27/27 |
| `POSTGRES_H0_BIN=.../17/bin pnpm run test:postgres` | cadena PostgreSQL/F1/H0-009 | PASS 72/72, incluidas 15 H0-009 |
| `pnpm run build` | build Next.js | PASS |
| `git diff --check` | diff limpio | PASS |

Total final: **99 tests PASS, 0 FAIL, 0 skipped** (27 generales + 72 PostgreSQL). La suite H0-009 contiene 15 tests mantenibles. No se cuentan aserciones o subcasos como tests separados.

## 11. Defectos corregidos durante implementación

Se corrigieron antes del cierre: palabra reservada en parámetro PL/pgSQL; necesidad de CREATE transitorio para transferir ownership tras F1; uso no válido de NUL en texto PostgreSQL; referencias ambiguas por nombres de columnas de retorno; `FOR UPDATE` innecesario sobre operación append-only; y normalización del `bigint` de Postgres.js en la prueba. Ninguno cambió fuentes APPROVED, D037 ni contratos C01/C03.

## 12. Limitaciones y capacidades no acreditadas

No se acreditan todavía la reverificación adversarial independiente TSK-H0-010, aplicación hosted de H0-M02, esquema/domain T01–T11, Auth/actor humano/MFA, Human Approval, proveedor/job, entrega, historia/resultados externos, exactly-once externo, reconciliación durable de COMMIT incierto con proveedor, performance/capacidad Production, backups/restore de H0-M02 ni UI/deploy. El fixture permite una raíz técnica por unidad; composición comercial futura debe reutilizar el puerto y cumplir sus propias tareas.

**TSK-H0-010 NOT STARTED. H0-005/006 NOT STARTED. PLAN-AUTH-006 continúa PENDING globalmente; únicamente su subset hosted database/F1 previo permanece VALIDATED. Last Approved Commit permanece `da7b71a3f2962093b7422899ab2193f29ae3c4e0` (D037).**
