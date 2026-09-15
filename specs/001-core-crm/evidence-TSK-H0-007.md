# Evidencia — TSK-H0-007

Estado: COMPLETED en su alcance de implementación
Fecha de ejecución: 2026-09-15
Tarea: TSK-H0-007 — Separar rol ordinario, migración y contexto transaccional
Entorno: Work Local Mac, macOS 26.5.2 (arm64), repositorio `IAndresB/crm-huescaventura-os`, rama `main`
Commit base comprobado: `d328ae781b727e2bea5c19060ca89ce6cac1c277`
Commit final probado y publicado: el commit único que contiene este archivo, recuperable con `git log -1 --format=%H -- specs/001-core-crm/evidence-TSK-H0-007.md`; su igualdad con `origin/main` se comprobó después del push.

## 1. V-EVI, alcance y fuentes

Se implementó exclusivamente H0-M01 para TSK-H0-007: roles técnicos separados, migraciones mínimas, superficie técnica con grants/RLS, contexto técnico confiable por transacción, adaptador PostgreSQL para C01/C03 y composición servidor. TSK-H0-008 no se ejecutó; sus expectativas solo delimitaron qué debía quedar verificable.

Fuentes directas: Tasks TSK-H0-007/008, §§2.2/2.3/6/7; Plan §§3.2/4/6.5/7.1/7.2, PLAN-DEC-002/007, B01, C01/C03, PLAN-AUTH-006; SPEC-FR-SEC-001/002/005, SPEC-FR-INT-002, AC-064/079/082, SPEC-NFR-002/004; DM-INV-050, SM-FORB-29, ARCH-DEC-002/004/005/008, P10/P11, G1/E1, D007/D015 y evidencias H0-001/H0-002. No se modificó ninguna fuente APPROVED.

Método: V-DAT + V-MIG + V-EVI con PostgreSQL real local desde clúster vacío, datos exclusivamente sintéticos y una conexión runtime con `max: 1` para hacer observable la reutilización. No se usaron mocks para permisos, RLS, commit o rollback.

## 2. Versiones y PostgreSQL local

| Elemento | Versión observada | Resultado |
|---|---:|---|
| PostgreSQL / psql | 17.11, Postgres.app 2.9.6 | PASS |
| Postgres.js | 3.4.9, dependencia runtime fijada | PASS |
| Node.js | 24.21.0 | PASS |
| pnpm | 11.19.0 | PASS |
| Next.js | 16.3.5 | PASS |
| TypeScript | 7.0.2 | PASS |

Método local: binarios nativos universales de Postgres.app instalados en `/Users/andres/Applications/Postgres.app`; cada ejecución crea con `initdb` un clúster efímero bajo el directorio temporal del sistema, escucha solo por socket Unix, no escucha TCP, usa un único proceso local y se detiene/elimina al finalizar. No queda contenedor, clúster, rol, base, password ni proceso de prueba. La aplicación local de PostgreSQL queda instalada como herramienta autorizada.

No se instaló Docker ni Supabase CLI; no se creó proyecto Supabase, recurso remoto, Production, Staging hosted, billing o coste.

## 3. Migraciones y objetos técnicos

| Migración | Autoridad | Objetos / resultado |
|---|---|---|
| `202609150000_h0_m01_roles.sql` | bootstrap local del clúster | Crea `crm_h0_migration`, `crm_h0_runtime` y `crm_h0_untrusted`, todos sin SUPERUSER/CREATEDB/CREATEROLE/INHERIT/BYPASSRLS |
| `202609150001_h0_m01_context.sql` | exclusivamente `crm_h0_migration` | Revoca defaults, crea schemas `crm_private`/`crm_api`, tabla técnica `access_probe`, dos políticas RLS, función estrecha `record_probe`, grants y default privileges mínimos |

Ambas migraciones se ejecutaron desde un clúster vacío. La segunda se niega si `current_user` no es `crm_h0_migration`; aplicada como runtime falla. No se creó esquema comercial, historia, idempotencia ni intención durable.

Objeto técnico único: `crm_private.access_probe`, con `probe_id`, `context_scope`, `public_value` y `private_value`. Solo demuestra acceso acotado; no representa entidad de negocio ni anticipa el esquema CRM.

## 4. Roles y privilegios efectivos

| Identidad | Atributos / grants | Prohibiciones observadas | Resultado |
|---|---|---|---|
| `crm_h0_migration` | Owner de base/objetos H0-M01; aplica DDL versionado | Sin SUPERUSER, CREATEDB, CREATEROLE, INHERIT o BYPASSRLS; no se usa como runtime | PASS |
| `crm_h0_runtime` | CONNECT; USAGE de schemas técnicos; SELECT solo de `probe_id/context_scope/public_value`; EXECUTE solo de `crm_api.record_probe` | No owner; sin SUPERUSER/BYPASSRLS/CREATEROLE/CREATEDB/INHERIT; no CREATE schema/table, GRANT, columna privada ni DML de tabla | PASS |
| `crm_h0_untrusted` | Ninguno sobre la base Core | CONNECT denegado | PASS |
| `PUBLIC` | Defaults revocados sobre base, schemas, tablas, secuencias y funciones | Sin acceso implícito | PASS |

La función de escritura es `SECURITY DEFINER` deliberadamente estrecha: búsqueda fija, sin SQL dinámico, EXECUTE revocado a PUBLIC, solo inserta la forma técnica prevista y la tabla tiene RLS forzada incluso para su owner. Sin contexto, la función falla. RLS no sustituye grants: ambos fueron probados conjuntamente.

## 5. Contexto transaccional confiable

`withTrustedPostgresTransaction` exige el `TrustedExecutionContext` opaco de application y `identityKind = technical`. Dentro de `sql.begin`, establece con consultas parametrizadas y `set_config(..., true)`:

- `crm.identity_id`;
- `crm.identity_kind`;
- `crm.purpose`;
- `crm.scope`;
- `crm.request_id`;
- `crm.server_time`.

El tercer argumento `true` limita cada valor a la transacción. El adaptador no acepta actor, role, permisos, privileged, bypass_rls ni contexto desde el query/cambio; recibe contexto por parámetro separado ya emitido por servidor. La composición servidor crea el runtime desde una URL aportada solo en servidor; Postgres.js usa `max: 1`, `prepare: false` y SSL requerido para esa conexión futura.

## 6. Matriz commit, rollback, error y pool

| Caso | Expected | Observed | Resultado |
|---|---|---|---|
| A con contexto → commit → B sin contexto | B sin actor y acceso denegado | `current_setting` vacío; RLS devuelve 0 filas | PASS |
| A con contexto → rollback → B | Contexto eliminado | Excepción sintética revierte; siguiente conexión lógica sin actor | PASS |
| A con contexto → error SQL → B | Contexto eliminado | Relación inexistente aborta; siguiente uso sin actor | PASS |
| Conexión reutilizada | No heredar identidad | Pool `max: 1`; mismo cliente reutilizado, GUC vacío y 0 filas sin contexto | PASS |
| C03 dos inserts, segundo falla | Ningún parcial | Violación de PK revierte ambos; consulta posterior no encuentra el primero | PASS |

## 7. Grants, RLS, DML y cliente hostil

| Caso | Expected | Observed | Resultado |
|---|---|---|---|
| Runtime sin contexto | Deny by default | 0 filas por RLS; función de escritura denegada | PASS |
| Runtime con contexto válido | Solo su alcance | Fila de `scope-synthetic-007`; otra scope invisible | PASS |
| Columna reservada | Sin lectura directa | `private_value` denegada por grants | PASS |
| DML directo | Denegado | INSERT directo falla aunque exista contexto | PASS |
| Administración de esquema | Denegada | CREATE TABLE/SCHEMA falla | PASS |
| Gestión de privilegios | Denegada | GRANT de rol/tabla falla | PASS |
| Rol genérico | Denegado | CONNECT falla | PASS |
| Input hostil | No establece autoridad | `actor_id`, `trusted_context`, `role`, `permissions`, `migration_identity`, `privileged`, `bypass_rls` se ignoran como datos; contexto plano falsificado se rechaza antes de SQL | PASS |

## 8. Integración C01/C03

C01: `H0M01PostgresAdapter.read` implementa `AuthorizedQueryPort`; abre transacción, aplica contexto servidor, usa consulta parametrizada, RLS y grants, y devuelve únicamente `probeId/publicValue` con procedencia y certeza. No devuelve `context_scope` ni `private_value`.

C03: el mismo adaptador implementa `TransactionPort`; valida la unidad técnica mínima y ejecuta uno o varios cambios mediante la función estrecha dentro de una transacción real. Se probaron commit y rollback total. Esta tarea solo acredita la transacción y su frontera: no implementa historia, resultado idempotente durable, intención durable ni T01–T11, asignados a H0-009/010.

## 9. Tests y comandos

| Comando / control | Expected | Observed | Resultado |
|---|---|---|---|
| Comprobación Git inicial | main limpio; HEAD=origin/main=base | `d328ae781b727e2bea5c19060ca89ce6cac1c277` | PASS |
| `pnpm install --frozen-lockfile` | lockfile reproducible | salida 0 | PASS |
| `pnpm audit --prod` | sin vulnerabilidad runtime conocida | `No known vulnerabilities found` | PASS |
| `pnpm run typecheck` | TypeScript estricto | salida 0 | PASS |
| `pnpm run lint` | fronteras conservadas | `Import boundaries: PASS` | PASS |
| `pnpm test` | regresión H0-003/004 | 27 tests; 27 pass | PASS |
| `POSTGRES_H0_BIN=… pnpm run test:postgres` | implementación PostgreSQL real | 19 tests; 19 pass | PASS |
| `pnpm run build` | build servidor | Next.js compiló; salida 0 | PASS |
| Proceso/clúster temporal | eliminado tras tests | sin proceso ni directorio H0-007 restante | PASS |

Total: 46 tests, 46 PASS, 0 FAIL/cancelled/skipped/todo.

## 10. Defectos encontrados y corregidos

1. El primer grant SELECT por columnas no incluía USAGE del schema: se añadió exclusivamente USAGE, sin ampliar DML.
2. `INSERT ... RETURNING` dentro de la función owner con RLS forzada requería visibilidad de retorno y chocaba con la política SELECT limitada al runtime: la función ahora inserta y devuelve el argumento validado sin releer/retornar la fila.
3. El runner TypeScript strip-only no admite parameter properties: se sustituyó por propiedad/constructor explícitos sin cambiar comportamiento.

No queda defecto material conocido propio de TSK-H0-007.

## 11. Limitaciones y capacidades no acreditadas

No se acreditan Auth, CRM Actor humano, login, sesiones, MFA/TOTP, recuperación, Supabase hosted, RLS de una futura Data API, Production/Staging hosted, pooler Supabase real, credenciales/rotación, tablas comerciales, historia material, resultado idempotente durable, intención durable, T01–T11, concurrencia de negocio, objetos, jobs, proveedores, correo, WhatsApp, UI, DNS, Vercel o deploy.

La prueba local por socket Unix y pool Postgres.js `max: 1` acredita semántica PostgreSQL 17.11 y reutilización de conexión, no el pooler remoto futuro. Los roles LOGIN locales no tienen password porque el clúster efímero usa autenticación local `trust`; ninguna credencial se versionó. La futura credencial de servidor deberá inyectarse por entorno y no concede facultad humana.

PLAN-AUTH-006 permanece **PENDING / NO EJECUTADA globalmente**. TSK-H0-007 aporta únicamente la parte técnica local de permisos/contexto insuficiente y deny-by-default; enrolamiento, recuperación, actor inhabilitado, MFA, sesiones y repetición en todas las superficies siguen asignados a H0-005/006/008/017 y H6.

## 12. Resultado

PostgreSQL real local ejecuta H0-M01 desde base vacía; migración/runtime están separados; runtime no es owner ni BYPASSRLS y no administra schema/privilegios; grants+RLS/contexto niegan por defecto; cliente hostil no establece autoridad; commit/rollback/error/reutilización no filtran identidad; C01/C03 conservan sus contratos; 46/46 tests, typecheck, lint, audit y build son PASS.

Resultado: **PASS / TSK-H0-007 COMPLETED exclusivamente en su alcance de implementación**.

TSK-H0-008, TSK-H0-005/006 y TSK-H0-009/010 permanecen **NOT STARTED / NO EJECUTADAS**. No se creó recurso remoto ni se inició Auth, UI, Production o Staging hosted.
