# TSK-H1-017 — necesidades mínimas B07

Base `204356ffb24ac0481990081b63e37b3cb293daab`, main/origin iguales y árbol limpio antes de modificación. Fuentes: Tasks H1-017/018 y §§2.2/6/7; Plan §§4/8/9, C01/C03/C06 y T09, PLAN-DEC-009; SPEC-FR-COORD-001/002, IDEMP-002, AC-024/050; BR-TASK-001–005; DM Task/DM-INV-044; SM G1–G6, SM-TA-01/04 y §2.4/D020; ARCH-DEC-011; Constitution P14. Alcance parcial de AC-050: persistencia pendiente y no inferencia; cierre/cancelación/reapertura H5 excluidos.

| ID | Expected fijado antes del código |
|---|---|
| E01 | Task de negocio pending con causa/tipo, contexto, alcance, objeto opcional y efecto; responsable CRM Actor Administrador, fuente/origen/versionado. No job/Execution Record. |
| E02 | Prioridad sin valor verificado permanece pendiente con motivo; ninguna escala ni default inventado. Las fuentes no fijan vocabulario de prioridad Task: no se reutilizan niveles Notification/recomendación. Ranking por prioridad no implementado. |
| E03 | Deadline unknown conserva necesidad/motivo; no hoy/created_at/hora/zona inferida y no overdue. |
| E04 | Fecha civil/instante explícitos con procedencia/versiones se conservan. D020 utiliza H1-civil y día completo cuando aplica; evaluación recibe reloj/fecha explícitos, nunca timezone Mac ni fecha inferida. |
| E05 | Identidad estructural causa/contexto/alcance/objeto/efecto, no texto/similitud ni datos mutables de origen. Igual causa material igual con operationIDs distintos devuelve misma Task, una revisión. |
| E06 | Replay técnico exacto mismo resultado sin nueva historia; mismo operationID material distinto conflicto. |
| E07 | Update material explícito misma identidad exige revisión esperada y conserva before/after fuente/origen/versiones. Cambio identidad en update rechaza; nueva causa se recibe separada. |
| E08 | Recepción/deduplicación registrada no afirma ejecución del hecho; no confirmación pago/proveedor/documento/disponibilidad/Acceptance/Booking ni revalidación. T09 recepción separada conceptualmente de aplicar negocio. No leases ni effects externos. |
| E09 | Alta equivalente/replay/updates concurrentes protegidos antes de existir fila; causas/contextos/alcances distintos separados, sin overwrite. |
| E10 | Task + historia + operación/resultado son una unidad Core; fault historia revierte todo. |
| E11 | F1/F2/C01/C03 existentes B07, scope/purpose/contexto, actor habilitado/sesión/generación vigentes; runtime/roles API/PUBLIC sin acceso directo. C06 no crea superficie nueva: lectura autorizada + evaluación de dominio sin confirmar otros hechos. |
| E12 | Migración forward-only vacía/upgrade/rollback/fixture anterior, owners/grants/RLS/FORCE. Regresión H0/H1 intacta, exclusivamente local/aislado/sintético. Sin scheduler/Notification/conectores/H1-019. |

Observed pendiente. No se modifica oráculo para lograr PASS.

## Implementación y comparación focal

- Una sola tabla nueva `b07_pending_tasks`; Task pendiente, identidad estructurada/versionada, material explícito, CRM Actor responsable, revisión y momentos. No estados En curso/overdue ni ciclo de cierre/reapertura. No Automation Definition, Execution Record, worker, lease, Notification, job ni intención externa.
- Identidad `h1-pending-cause-v1`: causeKind/causeId + contextKind/contextId + scopeRef + relatedKind/relatedId opcionales + effect; admin_scope separa autoridad. Digest SHA-256 sobre JSONB canónico/versionado, verificación de igualdad de la identidad completa y UNIQUE(scope,key). No título/texto/similitud ni deadline/versiones mutables en la identidad. advisory xact lock protege también ausencia; row lock y expectedRevision protegen update.
- `receive` registra recepción/causa y Task pending; procesar el mismo trigger con otro operationId/material idéntico devuelve el task_id existente sin incrementar revisión. Cada nueva recepción tiene su operación/historia de recepción, no otra Task ni ejecución del hecho. Replay técnico de la misma operación devuelve resultado durable sin insertar historia. Material diferente con operationId reutilizado conflictúa.
- `update` conserva identidad y task_id; exige revisión esperada incluso si llega tarde. Cambiar origen/versionado/plazo material exige update explícito y conserva before/after. Cambiar causa/contexto/alcance/objeto/efecto en update rechaza; otra necesidad se recibe como otra Task. No actualización silenciosa.
- Responsable: actor Administrador admitido por F2, no una asignación remitida por el cliente. La prioridad no determinada se conserva como `pending` con motivo. No hay vocabulario de prioridad Task aprobado en las fuentes localizadas: no se aceptan niveles arbitrarios, no se copian niveles Notification/Service ni se define un ranking. La parte dependiente de valores reales de prioridad queda pendiente de fuente/configuración aprobada; no impide registrar la necesidad independiente.
- Deadline `unknown` con motivo, `civil` con fecha literal/fuente/versión, `instant` con offset explícito/fuente/versión, o `d020` con referencia/zona verificadas/versiones/daysBefore explícitos. Esos parámetros son entradas autorizadas sintéticas, no plazos globales nuevos. `evaluateTaskDeadline` reutiliza H1-011 civil-time; actDate/instant de evaluación siempre explícitos. Día civil completo, igualdad no vencida; unknown → known:false/overdue:false. No Date.now, created_at ni timezone Mac como deadline. Campos horarios adicionales en fecha civil se rechazan.
- C01/C03 reutilizan F1/F2 B07 `evidence_read/write`, purpose técnico `h1-evidence`, envelope Task específico y finalidad `pending-followup`; no cambia ningún codec/contrato F1/F2 ni TTE. C06 no requiere nueva RPC de combinación: la lectura autorizada entrega la Task, la evaluación de vencimiento es dominio puro, sin confirmar otros hechos/estados.
- Core efecto + operación/resultado + historia se confirman juntos o ninguno. Historia usa `b07_history` existente y no crea otro mecanismo de auditoría. H1-017 no persiste ni emite efectos externos. Los contextos futuros se conservan como referencias estructurales suministradas por módulos/autorización B07, sin fabricar existencia de Booking/servicios aún no implementados.

| Expected | Observed focal / contraste independiente |
|---|---|
| E01/E02/E03/E08 | 16 causas sintéticas, manual SM-TA-01 y BR-TASK-005 pertinentes; responsable real del fixture, pending/unknown sin fechas ni hechos inferidos. R01/R02/R06/R14 verifican persistencia y guardas. |
| E04 | Fecha civil/instant y referencia D020 conservadas, día íntegro/equivalencia offsets. Dominio independiente y R03–R05 contrastan fuentes/parámetros/algoritmo. |
| E05/E06/E07/E09 | Repetición causal vs replay, identidades distintas, revisión/material/conflicto y carreras. R07–R12 inspeccionan historia/estado desde conexión independiente. |
| E10 | Trigger fault en historia creación/update; no Task/operación/historia parcial. Reintento posterior permitido. R13 independiente. |
| E11/E12 | Contexto/finalidad/scope/clave/sesión/generación y runtime/roles/owner/FORCE, upgrade/fault/reapply e índices. R15–R18 independientes y regresión acumulada. |

Los 36 casos requeridos quedan agrupados: 1–11 → focales 1/2 + unitarias + R01–R06; 12–15 → focal 1/R14; 16–26 → focal 3/4 y R07–R12; 27–28 → focal 4/R13; 29–33 → focal 4/R15–R17 y guardas H0 acumuladas; 34–36 → inspección de las superficies nuevas y R19. Las assertions formales fueron escritas desde matriz previa separada.

## Migración y límites

Forward-only `20260930185257_h1_pending_business_tasks.sql`, creada con CLI. Tabla privada, owner f2_owner, executor f2_executor, RLS/FORCE, índices causa/contexto y grants estrechos; runtime solo dos RPC firmadas. Sin grants PUBLIC/anon/authenticated ni overloads auxiliares. Ninguna migración anterior editada.

Solo PostgreSQL 17 efímero y datos sintéticos; Storage aislado real anterior se ejecuta únicamente para la regresión H1-015/016, sin cambios en su código/configuración. No hosted, Production, datos/PII reales ni conector/scheduler/avisos. PLAN-AUTH-001–006/DM-PENDING-005 y pendientes previos conservados. Disparadores reales H2–H5, datos/prioridades/plazos reales dependientes e integraciones H4-002/H5-002/H5-004 aún no acreditados. H5 completa cierre/cancelación/reapertura y coordinación. H1-019 no iniciado.

Antecedente de implementación conservado: primeras focales 0/4 por `operator is not unique: unknown - unknown`; diagnóstico SQL de precedencia y paréntesis correctos en extracción/resta JSONB, después 4/4 PASS. No expected debilitado. Ver H1-018-F01 para el defecto detectado formalmente y su reverificación.

## Cierre local — 2026-09-30

**COMPLETED local/aislado — PASS.** Expected previo preservado. Focales H1-017 4/4, verificación independiente H1-018 5/5 agrupadas / R01–R20 PASS tras H1-018-F01 CLOSED localmente; ningún defecto material abierto.

| Comprobación ejecutada | Resultado |
|---|---|
| Instalación `pnpm install --frozen-lockfile` | PASS; lockfile sin cambios |
| `pnpm audit --prod` | PASS; sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` / fronteras | PASS |
| `pnpm test` | 71/71 PASS |
| `POSTGRES_H0_BIN=… pnpm run test:postgres` | 330/330 PASS; 0 failed/skipped/cancelled; 396127.921709 ms |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |
| Búsqueda focal de secretos/claves privadas/endpoints hosted/logging token | Sin coincidencias en archivos del bloque |
| Inspección ausencia scheduler/Notification/efectos externos | PASS; solo mención explicativa en comentario SQL, ninguna superficie de ejecución |

Regresión acumulada H0/H1-001–016 íntegra, incluido Storage oficial real aislado de H1-015/016; servicios y clústeres temporales del runner detenidos. No cambia implementación anterior ni su evidencia histórica. Last Approved Commit documental conservado, no sustituido por commits técnicos. PLAN-AUTH-001–006/DM-PENDING-005 siguen pendientes globalmente, datos/privacidad/límites/prioridades reales no acreditados. H1 IN PROGRESS, H1-019 y posteriores NOT STARTED; STOP tras H1-018.
