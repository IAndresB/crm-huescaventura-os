# TSK-H2-001 — Captación y progreso comercial

Base: `056d77bee91fdf87ffd510559e36de115106dcc7`, main limpio tras fetch, H1-019 COMPLETED local/aislado. Autorización humana exclusiva H2-001/002, 2026-10-01.

Expected normativo fijado **antes de implementar** en [H2-002](evidence-TSK-H2-002.md), sección Expected y matriz R01–R20. Las fuentes aprobadas tienen autoridad sobre implementación. SM-OP-07/Acceptance, Proposal/Version positiva, Booking y tareas H2-003+ quedan fuera. T02 únicamente prepara el límite contractual, no implementa Acceptance.

## Implementación y focales

Migración nueva `20261001081941_h2_commercial_progress.sql`, dominio `commercial-progress.ts`, adaptador `h2-commercial-adapter.ts`; harness efímero y focales recuperables en `tests/support/h2-isolated.ts`, `tests/commercial-progress.test.ts`, `tests/integration/postgres-h2-001.test.ts`. Dominio sin I/O; C01/C03 F1/F2 existentes sobre recurso B07; H1 `identity_resolve` asigna OP dentro de la misma unidad SQL, sin segundo generador. Lead y conversión mantienen origen/responsable; historia inmutable por permisos, revisiones y protección de Ganada. Proposal/Version dependiente devuelve bloqueo normativo, sin implementación futura. No se necesita crear Task B07 para acreditar una acción comercial.

Expected de focales: exactamente tres mínimos; alta directa Nueva/OP, replay único, Lead incompleto convertido conserva vínculo/origen/actor, pausa/reactivación e intento Ganada preservan historia, DML runtime denegado. Observed final: **8/8 PASS**, cero fail/skipped/cancelled (1599.074708 ms); typecheck PASS, lint/fronteras PASS, diff check PASS. Comando: `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/commercial-progress.test.ts tests/integration/postgres-h2-001.test.ts`. Solo fixtures sintéticos, cluster/credenciales nuevos, actor runtime no propietario/no BYPASSRLS; bootstrap/migración solo preparación/inspección.

Durante focales se observaron y corrigieron nombre de columna `merged_into_id` H1 y `SELECT FOR UPDATE` innecesario sobre Lead sin privilegio UPDATE. No se ampliaron permisos para corregirlo. Son incidencias focales anteriores a la primera verificación formal, cuyo PASS no se hereda. Node 24.21.0; pnpm 11.19.0; CLI Supabase 2.118.0 usado únicamente para generar archivo local. Revisión de documentación oficial RLS/changelog 17.11: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes); sin impacto de ltree/btree_gist/PGP legacy en este SQL.

Commit de implementación: el commit que contiene esta sección, identificable mediante `git log -- src/domain/commercial-progress.ts`; SHA exacto se registra en evidencia independiente posterior. No se declara COMPLETED hasta H2-002 satisfactoria.


## Resultado final publicado con verificación vinculada

**TSK-H2-001 COMPLETED local/aislado** por [verificación independiente H2-002](evidence-TSK-H2-002.md). Commit inicial `00cf358c24829d21529893eaf846ad40ab931bec`; correcciones ordinarias materiales F01/F02 conservadas en los commits `a5bbb06e323e897d853a5ea9527bc3a931a814fc` y `6aba8be5dfffdca46c355b405314fb261643869b`. Último commit de producto probado: `6aba8be5dfffdca46c355b405314fb261643869b`. No cambios H0/H1 ni fuentes APPROVED; migración H2 nueva, aún no aplicada hosted.

Expected original permanece fijado en H2-002 antes de codificar. Observed final: matriz R01–R20 20/20 PASS y R19 permisos/definiciones H0/H1 idénticos; regresión posterior 75/75 unitarias, 356/356 PostgreSQL completo, instalación congelada/typecheck/lint/build/audit/diff check PASS. F01/F02 CLOSED localmente, cero abiertos; logs/reproducers/casos/versiones/entornos/comandos/expected/observed y limitaciones en la evidencia vinculada.

IDs cubiertos en el alcance comercial local: SPEC-FR-COM-001–005; AC-001/004/005/006; DM-INV-005–007; SM-OP-01–06/08–11 y SM-FORB-30, G1–G6 aplicables; P08, PLAN-B03/C02 y PT-01. SM-OP-04/05 y preparación OP-10 mantienen explícita la dependencia Proposal/Version H2-003/005; las integraciones restantes de filas compartidas no se declaran satisfechas. PLAN-T02 es únicamente límite reservado a Acceptance futura. **SM-OP-07 no implementada/acreditada; E2E-01 total pendiente H6**.

Pendientes conservados: H2-003 y posteriores/H3–H6 NOT STARTED; H2 no COMPLETED; PLAN-AUTH-001–006 globalmente pendientes, PLAN-PENDING-003 parcialmente abierto, DM-PENDING-005, BR-PENDING-022 y demás límites. Datos personales/comerciales, catálogo/tarifas/costes/capacidades y prioridades/plazos reales no acreditados; hosted H2 no acreditado, Production no autorizada. Sin conectores/envíos/pagos/proveedores reales, sin Acceptance/Booking/economía/operación por arrastre. STOP tras publicación de este bloque.
