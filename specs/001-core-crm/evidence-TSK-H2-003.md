# TSK-H2-003 — Implementación local aislada

Base comprobada tras fetch: `8ec1c7a3cad4954b1fb316be10b1b8b1be7feb82`, main limpio, HEAD == origin/main. Autorización exclusiva H2-003/004, STOP antes de H2-005.

Expected fijado antes del código en [evidence-TSK-H2-004.md](evidence-TSK-H2-004.md): 38 filas NO EJECUTADAS y 46 filas de trazabilidad íntegra Tasks §6. Fuentes APPROVED prevalecen sobre implementación.

## Implementación y focales

Migración nueva `20261001115235_h2_proposal_versions.sql`: Proposal → Opportunity real; preparaciones editables mediante revisión optimista con retención append-only, versiones fijadas inmutables, modalidades/líneas estructuradas con FK, fuentes/snapshots, operación/intención/origen/historia atómica T01. Serialización Opportunity/Proposal y numeración; replay reautoriza. PR usa API/contador H1 D040. SM-OP-04 se produce junto a preparación real; preparación no crea envíos ni Acceptance.

Dominio `proposal-version.ts` devuelve decisiones con IDs y cálculo sin I/O. Motor H1 `exact-money.ts` amplía composición exacta reutilizando racionales/materialización; no segundo motor. Adaptador PostgreSQL firma F1/F2 tras BEGIN, consulta fuentes reales scoped y captura cálculo/manual actor/momento. Proyección comercial explícita únicamente precio final/persona, participantes e incluidos; tablas privadas FORCE RLS, runtime sin DML/DDL/owner/BYPASSRLS.

Prueba focal `postgres-h2-003.test.ts`: PostgreSQL 17 aislado real, fixtures sintéticos, runtime crm_h0_runtime; preparación/fijación/PR/replay, v1 idéntica tras v2, 100.01x10=1000.10, calculado90.00/final100.01/diferencia10.01, proyección mínima y escritura SQL denegada. 1/1 PASS. Unitarias focales 2/2 PASS, conjunto pnpm test 77/77 PASS; typecheck/lint PASS. Fallos de desarrollo: tipos TypeScript y normalización de opcionales undefined corregidos antes del commit de implementación/verificación; no FAIL formal acreditado.

Commit de implementación: se identifica por el commit que contiene esta evidencia; verificación independiente pendiente H2-004 contra SHA exacto recuperable. No hereda focales.

## Límites

Preparación y fijación únicamente; no vigencia/caducidad/revalidación/envío/rechazo formal H2-005+, Acceptance positiva/SM-PV-07/SM-OP-07, Ganada, Booking/economía/operación. E2E01/02 y AC017 conversión quedan para integración posterior. Solo sintéticos; no hosted/Production/conectores. PLAN-AUTH001–006 globales, PLAN-PENDING003 parte abierta, DM-PENDING005, BR-PENDING022/033 y datos/políticas reales siguen pendientes. H2 IN PROGRESS; H2-005+/H3–H6 NOT STARTED.
