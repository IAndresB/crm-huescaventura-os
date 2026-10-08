# Evidencia — TSK-H5-007/008

**TSK-H5-007/008 COMPLETED exclusivamente local/aislado — 2026-10-08.** SHA definitivamente probado `5e3add4b2c82fc5b0e459b43ea0685393c495840`. Expected independiente publicado antes de producto en `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`,26.621 bytes/SHA256 `39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d` intactos;45 filas literales y56 casos PASS. PostgreSQL2408+54=2462/2462, unit150+4=154/154, health1/1 independiente y focal54/54. Frozen/typecheck/lint-import boundaries/build/audit producción0 vulnerabilidades/V-MIG fresh56-upgrade55 poblado-rollback-retry/advisors loopback/RLS-FORCE RLS/12 carreras reales/reinicio de procesos/idempotencia/T08-T09/finalizador HA/preservación/diff/auditor PASS. F01–F08 CLOSED con originales conservados; solo guarda histórica F01/F03 autorizada. HA/TTE/D039, M02, B07/Task/reservas/operaciones/historia reutilizados. H0–H5-006 conservados; H5 global IN PROGRESS, H5-009/010 yH6 NOT STARTED. DM-PENDING-005, BR-PENDING-035 y parámetros scheduler/retry/pause/resume/capacidad pendientes. Solo sintéticos/contactos simulados; sin exactly-once externo, conectores, scheduler real, IA/PLAUD/audio/envíos/Hosted/Production. Cierre documental posterior al SHA probado; publicación mediante push normal condicionada a revalidación final. **STOP definitivo tras007/008; no preparar tareas posteriores.**

## Cadena y expected independiente

Base previa publicada: `ff109036e3bb08a1d61e948693bc622bb10f240e`. Expected exclusivo publicado: `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`, anterior a cualquier producto. Checkpoints419492b1 → bd683059 →640930a8 →eb739b15; correctivo F03/F01 `4da05b0f2e25ea13094e1ef06153a7aaed1d0aab`; producto0b88063a →correctivo F06/F07 3ae329df →captura F08/SHA definitivamente probado `5e3add4b2c82fc5b0e459b43ea0685393c495840`. Commit documental posterior identificado por Git; no se atribuyen sus cambios documentales al SHA de las pruebas. La publicación se realiza únicamente tras auditor final PASS y push normal; la igualdad HEAD/main/origin y0/0 se comprueba como recibo posterior, sin autoasignar un SHA propio en su contenido.

[Expected congelado](expected-TSK-H5-007-008.md):26.621bytes, SHA256 `39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d`. [Matriz](matrix-TSK-H5-008.md) entrega las45 filas literales de Tasks§6,56 expected/observados y trazabilidad fila→caso→fuente→prueba. [Reporte completo](../../tests/fixtures/h5-008/definitive/verification.json) y [hashes de capturas](../../tests/fixtures/h5-008/definitive/capture-preservation.json).

## Dominio y reutilización

Migración56 `20261008143617_h5_persisted_work_recovery.sql`, aditiva, crea Definition/version inmutable, Execution Record, partes, intentos/generaciones y recibos referidos a las operaciones B07 existentes. Cada ejecución conserva definición, contexto, permisos/inputs/afectados, responsable humano, ejecutor técnico, concesión explícita, Task e historial B07. Separación persistente: pending/claimed, contacted, uncertain, succeeded; control active/paused/stopped/review. Las definiciones no se modifican en sitio. No valores operativos de scheduler por defecto.

Se reutilizan proposals/decisions/parts/reservations/events de HA y ledger M02. No segunda aprobación/reserva/autorización de efectos. `withdraw_approval` retira la aplicabilidad del enlace exacto al trabajo y conserva la decisión histórica; resume no lo vuelve a aprobar. TTE/D039 es una fachada privada propietaria de BEGIN/F1/F2/escrituras/final check/COMMIT; sin SQL/issuers/callbacks/handles públicos. Proveedores de prueba se consultan fuera de transacciones. El batch final drena constraints, revalida trabajo y F2 original reserve/evidencia, y hace COMMIT en el mismo mensaje. Receipt durable solo después de conocer COMMIT; pérdida del acuse devuelve `WorkCommitUncertainError(operationId)` recuperable por identidad.

## Concurrencia, recuperación y seguridad observadas

Doce carreras PostgreSQL reales, ambos órdenes en seis pares: claim A/B, pausa/start, retirada HA/start, revisión de versión/start, recovery/resultado tardío y recovery/ejecutor antiguo. Sesiones reales distintas del único administrador V1, dos identidades técnicas cuando corresponde; PIDs, XID, espera Lock/advisory y blocking_pids recuperables en capturas. Un solo ganador por reclamación; reevalúa estado después del lock. No intercalación secuencial presentada como concurrencia.

Tres procesos hijo terminan realmente antes de contacto, durante contacto simulado y después de efecto simulado durable antes de resultado; otros procesos reiniciados leen estado PostgreSQL. Antes de contacto: intento expirado conservado y nueva generación segura. Tras contacto: uncertain y reserva retenida, sin reenvío por concesión, orden manual o resume. Después de efecto: archivo propio del proveedor simulado permite conciliar el intento original una vez, con replay sin consumo duplicado. Generación antigua no inicia/renueva ni sobrescribe resultado posterior. Prueba tardía contradictoria produce conflicto/revisión y mantiene hecho previo. Parcial: consumed solo para parte acreditada; resto pending o uncertain, sin repetir la consumida. Pausa/stop conservan historia; stop posterior concilia sin reactivación.

Pérdida de acuse: PostgreSQL hace COMMIT real, doble wire retiene su acuse y presenta error08 simulado; resultado durable visible y replay recupera sin otra comprobación externa. No se acredita desconexión TCP limpia ni exactly-once externo. Reinicios de procesos son reales; contactos/aceptaciones/timeouts son simulados. Restauración de línea temporal es una barrera simulada de conciliación, no ensayo integral de backup/restore H6.

Cambios de contenido/versión/destinatario/alcance/importe/condiciones/efecto, evidencia caducada y retirada aplicable bloquean contacto. Rechazo de evidencia de éxito inventada, idempotencia equivalente y claves conflictivas. RLS+FORCE RLS en cinco tablas, sin CRUD directo runtime/HA/anon/authenticated; owners sin BYPASSRLS. Actor inhabilitado, sesión revocada, contexto/finalidad/autoridad adulterados denegados también en lectura/replay. Fallos de T08/T09 en ocho puntos de escritura, constraints deferred y finalizadores comparan20 tablas completas antes/después y retry de misma identidad. Roles/ACL/config/functions/tables/policies anteriores preservados.

## Gates y versiones

PostgreSQL17.11/Postgres.app real, Node24.21.0, pnpm11.19.0, Next16.3.8 intacto, Supabase CLI2.119.0 y Storage oficial aislado pinned `5def1dfc15ab7f08fe271c7d1e70542424524e4e`. Datos sintéticos; conexiones loopback. Migración rol distinto de roles de ejecución ordinarios.

| Gate sobre `5e3add4b2c82fc5b0e459b43ea0685393c495840` | Observado |
|---|---|
| Focal H5-007/008 |54/54 PASS;51 funcionales+3 migración/preservación |
| PostgreSQL completo |2408 previos+54 nuevos una vez=2462/2462 PASS |
| Unitarias completas |150 previas+4 nuevas=154/154 PASS |
| Health independiente posterior |1/1 PASS, separado de PostgreSQL |
| Frozen install/typecheck/lint-import boundaries/build |PASS |
| Auditoría producción |PASS,0 vulnerabilidades; dependencias/lockfile anteriores intactos |
| V-MIG |Fresh56, upgrade55 poblado, falloDDL/rollback/retry PASS; datos/catálogo previo exactos |
| Advisors |CLI oficial loopback, exit0, results[] |
| Preservación |55 migraciones anteriores exactas; F10/F12 y800 entradas PASS; H0–H5-006 conservados |
| Diff-check y auditor |PASS; cierre documental posterior sin producto cambiado |

[Comandos, SHA, exits y logs completos comprimidos](../../tests/fixtures/h5-008/definitive/verification.json). Protocolos Tasks§2.2: V-DOM(W01–27,37–44,56), V-DAT(W31–36,50), V-MIG(W48–50), V-AT(W03,19,26–30,45–47), V-SM/SM-HA-03(W11–25,43–44), V-NEG/SM-FORB-22/27(W04–18,22–25,34,39–44), V-EVI(W51–56); contexto/B08, C02/C03/C05/C06, T08/T09. Las fuentes se mantienen; no se marcan globalmente satisfechas sus comprobaciones futuras.

## F03 histórico y defectos preservados

Preflight F03: HEAD `eb739b15bdd8a5cd2a6803cbdf4a041bc7a86013`, origin/main `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`, main limpio4/0; expected intacto y55 reales intactas. Guarda conserva54 anteriores contra `7eac0d27b6b74331868a14bbc4ca967f8d2f6bb9` y exige bytes de55 obtenidos del cierre publicado `187bb1bb1de81c2bd4884f56de930d35acb93d26`:23.869bytes, SHA256 `f6b47fbfa260318b2af2fc48b9aab7b4ba2a431e6f44837d48f027d45fd00ab0`.

[F03 aplicado11/11](../../tests/fixtures/h5-008/f03-applied/result.json): intactas55/adición56/restauración PASS; alterar primera, eliminar intermedia, sustituir55/comentario55/whitespace55/eliminar55 y adicional dentro de protegido producen FAIL esperados; F10/F12 PASS sin modificaciones. Son contrapruebas filesystem separadas de los contadores. F01 y F03 CLOSED solo después de ese PASS. [Registro F01–F08](defects-TSK-H5-008.md) conserva FAIL originales, correctivos y retests;0b88063/3ae329d no se reutilizan para cierre. F06 corrigió únicamente snapshots nuevos; F07/F08 archivaron outputs generados y restauraron sus bytes históricos, sin nuevas excepciones ni guardas cambiadas.

## Límites y estado global

H0–H4 yH5-001–006 conservan cierres locales/aislados; H5-007/008 COMPLETED local/aislado; H5 global IN PROGRESS. DM-PENDING-005, BR-PENDING-035 y parámetros retry/pause/resume/schedulerCapacity siguen pendientes. Fallo persistente declarado por actor autorizado produce revisión visible en CRM Importante/Crítico y WhatsApp unavailable, sin umbral automático inventado. Sin scheduler externo, conectores reales, IA/PLAUD/audio/WhatsApp/email/cobros/envíos ni Hosted/Production. H5-010/H6-006/015/016 y E2E-06 integral no acreditados; fichas H5-009 en adelante yH6 intactas/NOT STARTED. **STOP definitivo tras H5-007/008.**

## Antecedentes originales conservados

**TSK-H5-007/008 IN PROGRESS — continuación autorizada tras F03/F01 CLOSED.** Correctivo registrado en `4da05b0f2e25ea13094e1ef06153a7aaed1d0aab`; contrapruebas11/11 PASS, 55 migraciones históricas intactas, expected26.621bytes/SHA256 intacto. Implementación B08 aditiva en curso: migración56, TTE privado con HA/M02 y B07/Task reutilizados. Focal54/54 PASS tras F05, incluida revalidación final de reserva original; pendientes gates completos sobre SHA probado, auditor y publicación condicionada. No publicación de producto ni COMPLETED. H0–H5-006 conservados; H5-009/010 y H6 NOT STARTED. DM-PENDING-005, BR-PENDING-035 y parámetros operativos del scheduler pendientes. Solo datos sintéticos y efectos simulados. STOP tras007/008.

El correctivo autorizado añade bytes exactos de la55 publicada en `187bb1bb…`, SHA256 `f6b47fbfa260318b2af2fc48b9aab7b4ba2a431e6f44837d48f027d45fd00ab0`; conserva la comparación de54 contra7eac0d27 y la cadena F10/F12. [Contrapruebas](../../tests/fixtures/h5-008/f03-applied/result.json).

### Antecedente local eb739b15 conservado

**Continuación F01: IN PROGRESS / STOP por F03.** La línea autorizada está aplicada localmente; F01 no se cierra al fallar una contraprueba requerida. Preflight `bd683059…`/origin`ae7f3b0…`, main limpio2/0. Expected congelado intacto. Diagnóstico y salidas en [defectos](defects-TSK-H5-008.md) y [F03](../../tests/fixtures/h5-008/f03/result.json).

| Contraprueba de continuación | Observado | Resultado respecto a instrucción humana |
|---|---|---|
| 55 originales, guarda aplicada | PASS | Satisfactorio para recuento |
| Archivo56 inerte posterior | PASS | Satisfactorio para adición |
| Alterar original1 | FAIL esperado | Satisfactorio |
| Eliminar original intermedia | FAIL esperado | Satisfactorio |
| Sustituir original55 por comentario | PASS indebido | **FAIL material; F03** |
| Añadir comentario a original55 | PASS indebido | **FAIL material; F03** |
| F10/F12 sin cambios | PASS | Alcance original conservado; no cubre55 |

El caso histórico de comparación de bytes protege54 migraciones del baseline anterior y no incluye la55 propia. En copias temporales, su alteración por comentario pasa también F10/F12. No se ejecutó SQL ni PostgreSQL; las55 reales siguen intactas. No se ha cambiado otra guarda ni ampliado excepción. Implementación y toda verificación funcional H5-007/008 siguen NO EJECUTADAS. Reutilización HA/TTE/D039 pendiente de implementación. Sin SHA de producto definitivamente probado ni publicado.

Se conserva el patch autorizado y este diagnóstico en un checkpoint local posterior; no push. F01 OPEN por cierre condicionado a contrapruebas completas; F03 OPEN/MATERIAL. No se puede acreditar «ninguna otra incompatibilidad histórica» ante el bypass observado. STOP conforme al mandato humano de continuación, sin correctivo adicional ni tareas posteriores.

### Antecedente local bd683059 conservado

**IN PROGRESS / STOP por F01. No implementado ni acreditado localmente.** Fecha: 2026-10-08. Solo expected independiente publicado; diagnóstico y checkpoint posteriores locales. Sin producto, migración nueva, conector ni cambio de permisos.

## Preflight

Fetch de origin ejecutado. Rama main; HEAD = origin/main = `ff109036e3bb08a1d61e948693bc622bb10f240e`, divergencia 0/0 y árbol limpio. Cierres H0–H4 y H5-001–006 locales/aislados conservados; fichas H5-007/008 NOT STARTED antes de esta ejecución. Baseline documental: PostgreSQL 2408, unitarias 150, health independiente 1, migraciones 55, Next.js 16.3.8. No se vuelve a acreditar esa regresión por lectura documental.

## Expected publicado antes de producto

[Expected](expected-TSK-H5-007-008.md): commit exclusivo/publicado `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`; 26.621 bytes; SHA-256 `39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d`. Contiene 45 filas literales Tasks §6 y 56 casos W01–W56 con fuentes, expected y trazabilidad. No hay filas DM-INV asignadas literalmente a estas tareas; se conservan sus fundamentos derivados. AC-073 y E2E-06 mantienen obligaciones integrales futuras, no acreditadas aquí.

Fuentes localizadas: Tasks §§2.2/5/6/7 y fichas 007/008; Plan §§7.1/7.2/8/11.2; requisitos y AC solicitados; Constitution, Business Rules, Domain Model, State Machines, Architecture, D009/D016/D039. B08, C02/C03/C05/C06 y T08/T09. README leído; no AGENTS.md físico encontrado dentro del repositorio, se aplican las instrucciones AGENTS aportadas por el usuario.

## Hallazgo y verificación efectuada

[F01](defects-TSK-H5-008.md) impide añadir una migración manteniendo PASS del verificador histórico sin corregir su cuenta global fija de 55. Original sin cambios: baseline55 PASS; copia temporal con archivo56 inerte FAIL `56 !== 55`. Propuesta de una línea probada solo en copia: PASS con 56 y rechazo efectivo de alteración histórica. Original, FAIL, comandos y código del reproductor conservados. Es una prueba de filesystem de un verificador histórico, **no una prueba PostgreSQL ni funcional H5**.

Cadena F10/F12 original reejecutada PASS, con siete verificadores, cuatro snapshots y 800 entradas efectivas; contrapruebas excluidas de contadores PostgreSQL/unitarios. No se han modificado las excepciones. [Resultados](../../tests/fixtures/h5-008/f01/f12-historical-negatives.json).

## Trabajo no ejecutado

Implementación persistente, concurrencia real, recuperación, fencing, resultados tardíos, T08/T09, RLS/FORCE RLS y V-MIG nuevos: NO EJECUTADOS. HA/TTE/D039 se han revisado para reutilización; no se ha añadido ninguna segunda autoridad ni integración de producto. No hay un SHA de producto definitivamente probado.

Regresión PostgreSQL completa, unitarias completas, health, frozen install, typecheck, lint/import boundaries, build, auditoría producción y advisors del bloque: NO EJECUTADOS por STOP previo a producto. El PASS histórico de 2408/150/1 pertenece al cierre H5-006. La verificación limitada actual no lo sustituye. Diff-check y preservación de bytes sí se comprueban para este checkpoint.

## Cadena y límites

Base `ff109036…` → expected publicado `ae7f3b0…` → checkpoint documental local posterior (SHA consultable en Git). El único push de este bloque publica el expected, autorizado antes de implementar. No se publica este checkpoint ni producto sin PASS completo. El repositorio queda main con commit local pendiente respecto a origin; no se reclama 0/0 de cierre ni COMPLETED.

H5 IN PROGRESS, H5-007/008 IN PROGRESS; H0–H4 y H5-001–006 conservan COMPLETED local/aislado. H5-009/010, posteriores y H6 NOT STARTED y no preparados. DM-PENDING-005, BR-PENDING-035, capacidad/límites/pausas/reanudación/reintentos del scheduler y puertas Hosted/Production pendientes. No datos reales, IA, PLAUD, audio, scheduler externo, WhatsApp/email, cobros/envíos ni conectores. AC-073 integral/H5-010/H6-006/015/016/E2E-06 no acreditados. **STOP.**
