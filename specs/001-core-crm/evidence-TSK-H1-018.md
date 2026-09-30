# TSK-H1-018 — verificación independiente de seguimiento mínimo

Fuentes y base: las mismas APPROVED identificadas en evidencia H1-017, ficha vigente H1-018 y correspondencias §6. Matriz fijada antes de código/assertions relevantes; ninguna assertion focal es oráculo. Clúster PostgreSQL aislado propio, datos sintéticos, conexión independiente para verificar efectos persistidos. Cada fila admite PASS únicamente si coincide expected y no hay efecto colateral indebido. V-DOM/V-DAT/V-MIG/V-EVI/V-AT/V-NEG y tramo V-SM SM-TA-01/04; no máquina H5 completa.

| ID | Expected previo / intento de falsación |
|---|---|
| R01 | review/document/amount/data pending conservan causa, responsable único, fuente/versiones y estado pending. |
| R02 | Deadline unknown no inventa fecha/hora ni usa created_at/TZ; overdue false con conocimiento unknown. |
| R03 | Fecha civil explícita conserva día; igualdad no vence, día siguiente vence, sin hora de corte. |
| R04 | D020 reutiliza civil-time, parámetros/referencia/versiones conservados; cambio de origen solo en update con historia. |
| R05 | Instante explícito conserva offset y procedencia; no se inventa a partir de fecha civil. |
| R06 | Prioridad pending conservada; rechazo de nivel arbitrario/escala no aprobada; no default. |
| R07 | Dos operaciones distintas mismo trigger/causa/material → una Task y misma revisión. |
| R08 | Replay exacto devuelve resultado sin historia nueva; operationID distinto material conflicto. |
| R09 | Misma frase con causa/contexto/alcance/objeto/efecto distintos → Tasks distintas. |
| R10 | Update material misma Task con expectedRevision, before/after/origen/versionado; stale rechaza sin overwrite. |
| R11 | Update que cambia identidad causal no fusiona; recepción distinta crea necesidad distinta. |
| R12 | Dos altas iguales simultáneas y replay concurrente → una Task; dos updates distintos esperados → un ganador/conflicto. |
| R13 | Fault historia creación/update → ningún efecto/operación parcial, inspección desde otra conexión. |
| R14 | Registrar seguimiento no cambia hechos/Document/Evidence ni genera pago/proveedor/Acceptance/Booking/Execution/Notification. |
| R15 | C01/C03 scope/contexto/purpose/F1/F2; firmado scope falsificado/sin MAC deniega sin efecto. |
| R16 | Revocación/generación vieja deniega lectura/mutación; nueva identificación legítima no rehabilita sesiones viejas. |
| R17 | Owner/RLS/FORCE/grants/SET ROLE/runtime/PUBLIC/anon/authenticated estrechos. |
| R18 | Cadena vacía/upgrade base esperada/fixture anterior/fault DDL/reapply, restricciones/índices y H1-013–016 preservados. |
| R19 | Ausencia scheduler/cron/worker/conectores/Notification; no cierre/reapertura H5 ni H1-019. |
| R20 | Regresión acumulada completa y ingeniería PASS; pendientes DM/PLAN-AUTH/hosted/Production conservados. |

Observed pendiente. Expected anterior se conserva en todo ciclo de corrección.

## Historial formal, preservado

1. Primera ejecución: 4/5 PASS; fallo del harness R13/R14 `42P01`, consulta a `crm_private.ha_proposals` inexistente. Se corrigió la consulta a la tabla real `crm_ha.proposals` tras localizar la migración; no cambio productivo/expected.
2. Ejecución adversarial ampliada dentro de R03/R05: 4/5 PASS, R01–R06 FAIL `Missing expected rejection` por campo horario adicional en fecha civil. Defecto material H1-018-F01.
3. Corrección y repetición completa desde clúster nuevo: focales 4/4 + formal 5/5 PASS, 9/9 agrupadas, sin omisiones. Matriz normativa previa intacta. Regresión acumulada en ejecución antes de declarar R20.

### H1-018-F01 — campos de tiempo ajenos a naturaleza del deadline — CLOSED localmente

- **Fuente/expected previo:** E03/E04 y R03/R05; SPEC-FR-COORD-001, BR-TASK-001, SM-TA-04 y §2.4/D020. Fecha civil no incorpora hora no acreditada ni se convierte en instante.
- **Observed ejecutado:** `validateDeadline` admitía campos adicionales en deadline civil; RPC aceptó el material, y la assertion adversarial `assert.rejects` falló. La evaluación seguía siendo civil pero el registro aceptaba una hora ajena al contrato.
- **Reproducer conservado:** receive sintético con `deadline:{kind:"civil",date:"2028-03-26",sourceRef:"formal",version:"1",time:"00:00:00"}`; expected rechazo y cero operación. R01–R06 mantiene este vector sin modificar.
- **Materialidad:** confusión entre día contractual y corte horario; localizado dominio + validación de persistencia H1-017, no política nueva.
- **Corrección:** allowlist exacta de propiedades por naturaleza, también referencia/zona D020; SQL rechaza propiedades horarias ajenas. Unknown rechaza fecha/hora/otros campos; los instantes explícitos mantienen su representación propia.
- **Reverificación:** matriz completa nueva 5/5 PASS; focales 4/4 y 4 unitarias de dominio PASS. Regresión acumulada R20 330/330 PASS; ningún defecto material abierto.

## Observed independiente por fila

| Filas | Observed / prueba | Resultado |
|---|---|---|
| R01/R02/R06 | Pendientes review/document/amount/data persistidas; Administrador CRM Actor; unknown sin date/at/overdue inferido y prioridad pending con motivo. Niveles arbitrarios/fecha inventada/trigger no aprobado rechazan, operación ausente. | PASS |
| R03–R05 | Fechas/offset/referencias/versiones explícitas idénticas en persistencia; igualdad vs posterior, día completo/D020/fecha civil sin hora, evaluación sin referencia rechaza. Vector F01 rechazado tras corrección. | PASS |
| R07/R08 | Dos altas distintas mismo trigger/material → mismo ID/revisión; replay concurrente no duplica historia; material diferente mismo operationId rechaza. | PASS |
| R09/R11 | Mismo título pero causa/contexto/alcance/objeto/efecto distintos conservan Tasks separadas. Cambiar identidad mediante update rechaza sin reatribución. | PASS |
| R10/R12 | Dos updates diferentes sobre misma revisión tienen único ganador, otro conflicto; revision 2, before/after conserva sourceVersion anterior/nueva y plazo. Stale update no sobrescribe. | PASS |
| R13 | Fault historia en creación/update: sin operación ni historia nuevas ni Task parcial; revisión previa preservada; retry posterior funciona. Inspección `second` independiente. | PASS |
| R14 | Registrar seguimiento de anticipo/proveedor/documento/disponibilidad no cambia B07 records; sin HA proposals ni nuevos registros que acrediten pago/Booking/Acceptance. Estado exclusivamente pending. | PASS |
| R15/R16 | Lectura contexto falso null; purpose falso rechaza; capability firmada con scope falso y MAC F1 inválida rechazan. revokeAll con autoridad anterior deniega lectura/write; nueva identificación válida no rehabilita sesión vieja. | PASS |
| R17 | Owner separado, RLS/FORCE; runtime directo/SET ROLE rechazados; cero grants tablas a PUBLIC/anon/authenticated/runtime, roles API sin EXECUTE, dos funciones sin overload extra. | PASS |
| R18 | Cadena vacía aplicada en before; upgrade desde cadena hasta H1-015 conserva fixture anterior; fault DDL revierte tabla nueva, reapply PASS; índices causa/contexto. H1-013–016 se verifican además en regresión. | PASS |
| R19 | Inspección de archivos/contratos nuevos: sin timer, scheduler, cron, worker, Notification, conector, efecto externo o cierre/reapertura; tabla state solo pending y superficies receive/update/read. | PASS |
| R20 | Nueva regresión 330/330 PostgreSQL + 71/71 unitarias, instalación/audit/typecheck/fronteras/build/diff PASS; pendientes globales conservados. | PASS |

El deadline vence como dimensión derivada, no como nuevo estado. La evaluación no escribe otro hecho ni usa un reloj oculto. C06 no se amplía: dominio puro tras C01 para esta necesidad; ninguna reevaluación de Booking/economía implementada. T09 registra recepción/dedup y necesidad pending, sin claims, lease o Execution Record; registrar trabajo no acredita efecto externo.

## Límites

V-DOM/V-DAT/V-MIG/V-EVI/V-AT/V-NEG y tramo SM-TA-01/04 locales; cierre/cancelación/reapertura y avisos H5 no acreditados. Datos/actores/Auth sintéticos, Core PostgreSQL real aislado; sin mocks de persistencia. PLAN-AUTH-001–006 globalmente pendientes; DM-PENDING-005 pendiente; límites/datos/prioridades/plazos reales permanecen dependencias localizadas. Hosted/Production/conectores no ejecutados. H1 continúa IN PROGRESS, H1-019 NOT STARTED.

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
