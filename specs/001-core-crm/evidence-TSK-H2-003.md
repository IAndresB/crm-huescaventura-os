# TSK-H2-003 — Implementación local aislada

Estado vigente: COMPLETED local/aislado, verificado independientemente por H2-004; detalles finales y correcciones al final.

Base comprobada tras fetch: `8ec1c7a3cad4954b1fb316be10b1b8b1be7feb82`, main limpio, HEAD == origin/main. Autorización exclusiva H2-003/004, STOP antes de H2-005.

Expected fijado antes del código en [evidence-TSK-H2-004.md](evidence-TSK-H2-004.md): 38 filas NO EJECUTADAS y 46 filas de trazabilidad íntegra Tasks §6. Fuentes APPROVED prevalecen sobre implementación.

## Implementación y focales iniciales (antecedente)

Migración nueva `20261001115235_h2_proposal_versions.sql`: Proposal → Opportunity real; preparaciones editables mediante revisión optimista con retención append-only, versiones fijadas inmutables, modalidades/líneas estructuradas con FK, fuentes/snapshots, operación/intención/origen/historia atómica T01. Serialización Opportunity/Proposal y numeración; replay reautoriza. PR usa API/contador H1 D040. SM-OP-04 se produce junto a preparación real; preparación no crea envíos ni Acceptance.

Dominio `proposal-version.ts` devuelve decisiones con IDs y cálculo sin I/O. Motor H1 `exact-money.ts` amplía composición exacta reutilizando racionales/materialización; no segundo motor. Adaptador PostgreSQL firma F1/F2 tras BEGIN, consulta fuentes reales scoped y captura cálculo/manual actor/momento. Proyección comercial explícita únicamente precio final/persona, participantes e incluidos; tablas privadas FORCE RLS, runtime sin DML/DDL/owner/BYPASSRLS.

Prueba focal `postgres-h2-003.test.ts`: PostgreSQL 17 aislado real, fixtures sintéticos, runtime crm_h0_runtime; preparación/fijación/PR/replay, v1 idéntica tras v2, 100.01x10=1000.10, calculado90.00/final100.01/diferencia10.01, proyección mínima y escritura SQL denegada. 1/1 PASS. Unitarias focales 2/2 PASS, conjunto pnpm test 77/77 PASS; typecheck/lint PASS. Fallos de desarrollo: tipos TypeScript y normalización de opcionales undefined corregidos antes del commit de implementación/verificación; no FAIL formal acreditado.

Commit de implementación: se identifica por el commit que contiene esta evidencia; en aquel momento, verificación independiente pendiente H2-004 contra SHA exacto recuperable. No hereda focales.

## Límites

Preparación y fijación únicamente; no vigencia/caducidad/revalidación/envío/rechazo formal H2-005+, Acceptance positiva/SM-PV-07/SM-OP-07, Ganada, Booking/economía/operación. E2E01/02 y AC017 conversión quedan para integración posterior. Solo sintéticos; no hosted/Production/conectores. PLAN-AUTH001–006 globales, PLAN-PENDING003 parte abierta, DM-PENDING005, BR-PENDING022/033 y datos/políticas reales siguen pendientes. H2 IN PROGRESS; H2-005+/H3–H6 NOT STARTED.

## Verificación final y correcciones publicadas

Implementación inicial `69a0ef1bb2bf012bb29e65a1bcd36e560c9cd944`; correcciones separadas `c5f4540a8af560fc87438138a003c9f4d713ec1b` (F01 canonical JSON histórico), `b40a2411bc71e75e2ec3d7709506a2ddd2620eef` (F02 etiqueta estimada/pendiente), `a080eb76e800126d155e78471ad2f6b59e382a7d` (F03 elegibilidad H1 con Evidence revisada). Sin amend/rebase. H2-004 independiente sobre último SHA: R01–R39 39/39 PASS más complementos R13/R37; F01–F03 CLOSED localmente con FAIL/reproducers preservados. Regresión íntegra77/77 unitarias y399/399 PostgreSQL17, 0 fail/skipped/cancelled; frozeninstall/typecheck/lint/build/audit/diffcheck PASS. Versiones reales Node24.21.0/pnpm11.19.0/PG17.11/Postgres.js3.4.9/Next16.3.6/TS7.0.2. Expected, observed, comandos/logs y límites recuperables en evidencia H2-004 y `tests/fixtures/h2-004/regression-summary.json`.

TSK-H2-003 COMPLETED local/aislado junto a H2-004. H2 IN PROGRESS; H2-005+/H3–H6 NOT STARTED. No capacidades futuras ni datos reales acreditados. STOP.
