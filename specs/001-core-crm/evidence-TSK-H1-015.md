# TSK-H1-015 — objetos privados y conservación recuperable

Base `690bc54e1c811e25e025a739886a78bfdd052602`, main limpio, 2026-09-30. Expected fijado antes del código: Tasks H1-015/016, §§2.2/6/7; Plan §§5.3–5.4/6.3/6.5/7.1; SPEC-FR-HIST-003/004, CONC-004, SEC-005, NFR-002/008; AC-073/074/082; Architecture §9/12.3 y ARCH-DEC-002/010; Constitution P07/P10/P12/P13; BR-DOC-001–005 y BR-SEC-005; D017; PLAN-AUTH-003.

| ID | Expected |
|---|---|
| E01 | Preparación persistida no implica bytes; upload no acredita integridad ni vínculo. Referencia sin objeto queda missing, nunca stored. |
| E02 | Acreditación lee bytes y compara SHA-256, tamaño y content type; ausencia/cambio/corrupción quedan visibles y reparables. |
| E03 | Solo versión acreditada puede vincularse; misma versión puede usarse desde enlaces Document autorizados sin duplicar bytes. |
| E04 | Sustitución crea versión privada distinta, exige versión previa esperada y conserva original/versiones e historia. |
| E05 | Efecto, historia y resultado idempotente son ACID en Core; upload externo sobrevive a rollback Core y queda reparable. Ninguna transacción espera Storage. |
| E06 | Replay equivalente no duplica objeto, versión, vínculo o historia; operación distinta/material distinto entra en conflicto conforme a precondiciones. Reparación repetida converge. |
| E07 | Preparación/acreditación/vínculo/sustitución/reparación concurrentes no producen dos actuales incompatibles ni historia parcial. |
| E08 | Objeto sin metadata CRM se diagnostica sin inferir Document, propietario o contexto; no se borra. Sin política no hay limpieza/TTL de conservación. |
| E09 | C01/C03/C04 mantienen F1/F2, actor/sesión/generación vigentes, finalidad/contexto/recurso/operación; runtime, PUBLIC y roles API no tienen acceso directo Core. |
| E10 | Storage privado real aislado; tercero con ID/path/URL no obtiene acceso CRM. La aplicación reautoriza antes/después de leer, conforme Plan §6.3; no emite URLs Storage como autoridad. |
| E11 | Ensayo separado del mecanismo nativo de URL firmada: registrar su validez técnica tras revocar Core sin confundirla con revocación efectiva; secretos/URLs no aparecen en evidencia/logs. |
| E12 | Migración forward-only desde cadena previa/base vacía, fixtures preservados, owner separado y RLS/FORCE. DM-PENDING-005/PLAN-AUTH permanecen pendientes; solo bytes sintéticos, sin hosted/Production. |

Estados técnicos mínimos previstos: prepared, present_unverified, verified_unlinked, stored, missing, inconsistent. Sustitución es nueva versión con predecessor; diagnóstico de huérfano permanece needs_review. Son estados de conservación, no una máquina comercial. Ningún tamaño/MIME/TTL sintético será política real.

## Implementación observada

- Core canónico: `b07_object_versions`, `b07_evidence_object_bindings` y `b07_object_orphans`. Raíz/version UUID, Document, predecessor, finalidad, procedencia, referencia privada, digest/tamaño/media esperados y observados, revisión, tiempos y actor. Las unidades usan `b07_operations`/`b07_history` existentes: efecto, resultado y before/after atómicos, sin otra infraestructura de historia.
- `H1015ObjectAdapter` reutiliza F1/F2/C01/C03 y la autoridad documental C04. Las operaciones Storage transcurren fuera de la transacción Core. La observación es sobre bytes reales; no sobre path, ETag o metadata declarada. `SupabasePrivateStorage` nunca upsert, nunca delete, nunca entrega URLs ni tokens.
- Preparar → cargar → acreditar → vincular son operaciones separadas. `prepared` no prueba bytes; `present_unverified` no acredita; `verified_unlinked` no conserva vínculo; `stored` requiere digest/tamaño/media acreditados y vínculo explícito. `missing` significa que la referencia no permite recuperar el objeto por la API Storage; no acredita inexistencia física de bytes fuera de esa API. `inconsistent` conserva observación incompatible. No se transforma ausencia de metadata CRM en ausencia del binario.
- Reparación lee de nuevo el objeto y converge mediante operaciones idempotentes. Un upload que sobrevive a rollback Core queda visible en Storage y puede reconciliarse. Un fallo de historia revierte los efectos Core y el resultado de operación; no revierte Storage.
- Sustitución: expectedVersion + exclusión por raíz + nueva versión/path; original y predecessor conservados. La Evidence puede fijar una versión exacta e inmutable. Un nuevo enlace contextual al mismo Document reutiliza bytes, sin extender el permiso a otros contextos/finalidades.
- Huérfano: inventario Storage real + lectura real, registro `needs_review` sin atribuir Document/propietario/contexto ni borrar. El inventario es el de objetos de la API oficial: no se afirma inspección de todos los archivos físicos del backend. No existe política de limpieza/retención automática.
- Descarga: autorización Core vigente antes de leer y segunda autorización tras obtener/verificar bytes, misma revisión/estado. Revocación durante la lectura deniega entrega. Ningún signed URL nativo sale por este contrato. Es el acceso reautorizable ya aprobado en Plan §6.3, sin nueva política de TTL.

## Entorno real aislado reproducible

Servicio oficial `supabase/storage`, commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, ejecutado nativamente con backend file, PostgreSQL propio efímero, API exclusivamente loopback y buckets privados sintéticos. Core H1-015 y H1-016 usan clústeres/buckets distintos. PostgreSQL 17 de Postgres.app; `POSTGRES_H0_BIN` apunta a sus binarios locales. Sin Docker ni servicios hosted necesarios.

`pnpm run test:postgres` invoca `scripts/test-postgres.mjs`: obtiene/builda ese commit fijado si falta en cache temporal, genera claves sintéticas y configuración 0600, levanta servicio y PostgreSQL aislados, ejecuta todas las integraciones y detiene/elimina únicamente su fixture temporal. No añade dependencias productivas ni cambia lockfile. El servidor no hereda variables de conexiones hosted; sus logs están silenciados. No se acreditan bytes mediante mocks. Las identidades/Auth son sintéticas según el patrón H0; el ensayo de revocación durante lectura envuelve una lectura Storage real.

El mecanismo nativo de signed URL se ensaya solo desde la verificación: GET autorizado 200 antes de revocar Core y también tras revocar, hasta la expiración sintética de 3 segundos; después rechaza. Ese valor es un fixture, no TTL operativo. SPEC-FR-SEC-005/AC-082 se satisfacen localmente por la descarga reautorizada, no por afirmar que Storage revoca la URL. Revocación hosted/JWT/Auth real y superficies H6 siguen sin acreditar.

## Trazabilidad focal

| Expected | Observado / prueba |
|---|---|
| E01–E03 | Focal 1: cuatro fases y bytes recuperados; focal 2: referencia sola missing. Formal R01–R05: observación persistida desde otra conexión, corrupción/media/tamaño/ausencia y rechazo de vínculo tardío. |
| E04/E07 | Focal 3: único sucesor ante competencia, original accesible. Formal R09/R10/R16: cinco carreras, binding Evidence inmutable y dos contextos sin duplicar bytes. |
| E05/E06 | Focal 2: upload sobrevive rollback, replay/reparación/conflicto. Formal R06–R08/R17: fault en upload/link, operación e historia ausentes tras rollback, retry equivalente y ausencia de duplicados. La respuesta perdida se reproduce descartando resultado ya confirmado y repitiendo operationId; no se afirma fallo físico de red. |
| E08 | Focal 4 y formal R15: huérfano real conservado, inventory y diagnóstico idempotente, no asociación ni eliminación. |
| E09/E10 | Focal 4 y formal R10–R13/R18: context/purpose/scope, runtime/SET ROLE, roles genéricos y bucket privado; F1/F2 existentes y revocación antes/durante descarga. |
| E11 | Formal R14: URL nativa observada realmente, nunca usada como identidad/acceso de la aplicación ni persistida. |
| E12 | Formal R18: cadena vacía, upgrade desde cadena anterior con fixture, fallo/reapply, owner/RLS/FORCE/ACL. Regresión acumulada conserva H0/H1 anteriores. |

Los 41 casos solicitados se agrupan en focales y verificación independiente: 1–15/36–37 → E01–E06/R01–R08/R17; 16–20 → E04/E07/R09–R10; 21–30 → E09–E11/R10–R14/R18–R19; 31–35 → E07/R16; 38–41 → E08/E12/R15/R19. El código formal deriva de la matriz previa, no reutiliza los expected de assertions focales.

## Migración y límites

Nueva migración forward-only `20260930170533_h1_private_object_conservation.sql`; ninguna migración histórica editada. Owner `crm_h0_f2_owner`, executor estrecho `crm_h0_f2_executor`, runtime solo RPC, RLS/FORCE, sin privilegios directos PUBLIC/anon/authenticated/runtime. F1/F2/TTE no se amplían ni se añade Human Approval.

DM-PENDING-005 pendiente; PLAN-AUTH-001–006 pendientes globalmente, incluido PLAN-AUTH-003. Sin PII/documentos/datos reales, hosted, Staging real ni Production. Tamaño máximo, MIME permitido, cuota, conservación, borrado, TTL operativo y demás valores reales continúan pendientes; los fixtures no configuran esas políticas. Integraciones H6-008/H6-015 futuras y acceso real no acreditados. H1-017 no iniciado.

## Resultado y regresión final — 2026-09-30

**COMPLETED exclusivamente local/aislado.** Expected anterior intacto; focales 4/4 PASS; verificación independiente H1-016 7/7 pruebas agrupadas / R01–R20 PASS. H1-016-F01 cerrado localmente; ver detalle/historial en evidencia independiente.

| Comprobación real | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | PASS; lockfile sin cambios |
| `pnpm audit --prod` | PASS; sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS; fronteras |
| `pnpm test` | 67/67 PASS |
| `POSTGRES_H0_BIN=… pnpm run test:postgres` | 321/321 PASS, 0 failed/skipped/cancelled; 398729.818125 ms; cadena H0 y H1 previa más nuevas focales/formales |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |
| Búsqueda focal de claves privadas, secretos productivos, endpoint hosted y logging token/URL firmada | Sin coincidencias en archivos del bloque |

No se modifica expected para conseguir PASS. Último Approved Commit documental `3e3f47a1692290412a03cf14087c2c470b8cab90` conservado; los commits técnicos de este bloque no lo sustituyen. H1 IN PROGRESS; H1-017 y posteriores NOT STARTED.
