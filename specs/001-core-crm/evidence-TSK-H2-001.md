# TSK-H2-001 — Captación y progreso comercial

Base: `056d77bee91fdf87ffd510559e36de115106dcc7`, main limpio tras fetch, H1-019 COMPLETED local/aislado. Autorización humana exclusiva H2-001/002, 2026-10-01.

Expected normativo fijado **antes de implementar** en [H2-002](evidence-TSK-H2-002.md), sección Expected y matriz R01–R20. Las fuentes aprobadas tienen autoridad sobre implementación. SM-OP-07/Acceptance, Proposal/Version positiva, Booking y tareas H2-003+ quedan fuera. T02 únicamente prepara el límite contractual, no implementa Acceptance.

## Implementación y focales

Migración nueva `20261001081941_h2_commercial_progress.sql`, dominio `commercial-progress.ts`, adaptador `h2-commercial-adapter.ts`; harness efímero y focales recuperables en `tests/support/h2-isolated.ts`, `tests/commercial-progress.test.ts`, `tests/integration/postgres-h2-001.test.ts`. Dominio sin I/O; C01/C03 F1/F2 existentes sobre recurso B07; H1 `identity_resolve` asigna OP dentro de la misma unidad SQL, sin segundo generador. Lead y conversión mantienen origen/responsable; historia inmutable por permisos, revisiones y protección de Ganada. Proposal/Version dependiente devuelve bloqueo normativo, sin implementación futura. No se necesita crear Task B07 para acreditar una acción comercial.

Expected de focales: exactamente tres mínimos; alta directa Nueva/OP, replay único, Lead incompleto convertido conserva vínculo/origen/actor, pausa/reactivación e intento Ganada preservan historia, DML runtime denegado. Observed final: **8/8 PASS**, cero fail/skipped/cancelled (1599.074708 ms); typecheck PASS, lint/fronteras PASS, diff check PASS. Comando: `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/commercial-progress.test.ts tests/integration/postgres-h2-001.test.ts`. Solo fixtures sintéticos, cluster/credenciales nuevos, actor runtime no propietario/no BYPASSRLS; bootstrap/migración solo preparación/inspección.

Durante focales se observaron y corrigieron nombre de columna `merged_into_id` H1 y `SELECT FOR UPDATE` innecesario sobre Lead sin privilegio UPDATE. No se ampliaron permisos para corregirlo. Son incidencias focales anteriores a la primera verificación formal, cuyo PASS no se hereda. Node 24.21.0; pnpm 11.19.0; CLI Supabase 2.118.0 usado únicamente para generar archivo local. Revisión de documentación oficial RLS/changelog 17.11: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes); sin impacto de ltree/btree_gist/PGP legacy en este SQL.

Commit de implementación: el commit que contiene esta sección, identificable mediante `git log -- src/domain/commercial-progress.ts`; SHA exacto se registra en evidencia independiente posterior. No se declara COMPLETED hasta H2-002 satisfactoria.
