# Evidencia — TSK-H2-009

**Estado vigente: COMPLETED local/aislado.** Commit probado `cb2246ea4830fdf08a3a723bfc759309716712ca`;66/66 formal +2/2 históricos, V-MIG y579/579 PostgreSQL +81/81 unitarias PASS. Historial de intentos y FAIL conservado debajo.

Base `fd1c1e1b06bffbef786383e98827ade4b13c919d`, fetch/main/árbol limpio/HEAD==origin/main verificados antes de modificar. Expected previo: [expected-TSK-H2-009-010.md](expected-TSK-H2-009-010.md),60 casos congelados y todas las filas Tasks §6; estados H0/H1/H2 previos verificados.

## Implementación candidata

Migración nueva20261001200941_h2_booking_conversion.sql; ninguna histórica editada. Booking baseline append-only, servicios/modalidades/contribuciones/noches/ocupación/nominal opcional/historia/resultado, referencias FK y UNIQUE Opportunity. F1/F2 servidor/H1 RES existentes; FORCE RLS/ACL mínimas; runtime sin DML. Cadena Acceptance exacta verificada no rectificada, selección D018; evidencia B07 de traslado exacto del detalle con digest, no acuerdo inventado. Cantidades de cobro y asistentes separados, lista nominal vinculada a necesidad acreditada. El agrupamiento de contribuciones exige detalle revisado: nunca se deduce por catálogo. Datos aplicados desconocidos null; certeza explícita conservada.

Directa compone únicamente actuaciones tipadas de los contratos H2 existentes dentro de la misma transacción privada T03 o reutiliza cadena ya existente; no expone callback/SQL/tx handle. El contexto nominal H1 no concede permisos. No Payment/fondos/conciliación/Refund/proveedor/confirmación operacional/external.

## Focal de implementación

PostgreSQL17.11 nativo aislado, datos sintéticos, rol crm_h0_runtime distinto de migración/owner/BYPASSRLS. Node24.21.0/pnpm11.19.0. Comando `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h2-009.test.ts`. quinto intento1/1 PASS: raíz/detalle/RES/replay/read/inmutabilidad. Logs first–fourth-focal FAIL preservados: error del fixture al usar JSON.stringify como parámetro jsonb (cliente serializa cadena); diagnóstico hash/observed en third/fourth, corregido cast intermedio text en fixture. Expected intacto. Typecheck desarrollo PASS. No Fxx formal aún; H2-010 y regresión NO EJECUTADAS.

Pendientes globales intactos, H2 IN PROGRESS,011+/H3–H6 NOT STARTED; sin hosted H2/Production/datos reales/conectores. Evidencia local incompleta hasta H2-010; no COMPLETED todavía.

## Corrección tras verificación independiente

H2-010 detecta F01 duplicado nominal de Contact verificado. Guarda persistente añadida en la migración nueva aún no publicada, sin alterar las29 migraciones anteriores. Historial de defecto/SQL/log original preservado en evidencia H2-010. Matriz ampliada66/66 +1/1 reproducer PASS, regresión pendiente.

## Cierre final — COMPLETED local/aislado

Base `fd1c1e1b06bffbef786383e98827ade4b13c919d`; commit probado exacto `cb2246ea4830fdf08a3a723bfc759309716712ca`. Producto idéntico a4aa784c (cb2246e corrige exclusivamente el harness histórico). Matriz formal independiente R01–R66 **66/66 PASS**, **2/2 reproducers históricos PASS** (originales conservados), y complemento V-MIG R45/R66 PASS. Log formal-cb2246e.log. F01/F02 **CLOSED local/aislado**, cero abiertos; matriz completa afectada y regresión completa repetidas después de las correcciones.

Regresión final fresca: instalación congelada, typecheck, lint/import boundaries, **81/81 unitarias**, **579/579 PostgreSQL17.11**, build y audit--prod sin vulnerabilidades conocidas: PASS;0FAIL/skipped/cancelled. PostgreSQL395547.974667ms, todas las esperas H0 intactas. Logs `tests/fixtures/h2-010/*-cb2246e.log`, regression-summary.json y originales comprimidos con digest en raw-log-manifest.json. Gates ejecutados con pnpm11.19.0/Node24.21.0 y POSTGRES_H0_BIN17.

Comandos: `pnpm install --frozen-lockfile`; `pnpm run typecheck`; `pnpm run lint` (incluye check:boundaries); `pnpm test`; `pnpm run build`; `pnpm audit --prod`; `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres`; formal: misma variable + `node --test --experimental-strip-types tests/integration/postgres-h2-010.test.ts tests/integration/postgres-h2-010-defects.test.ts`. Diffcheck y comparación de coordinación final se registran antes de publicación.

Solo H2-009/010 cerradas en este bloque. **H2 IN PROGRESS; H2-011/012 y H3–H6 NOT STARTED. STOP tras010**. No iniciar/preparar posteriores. PLAN-AUTH001–006 globales, PLAN-PENDING003 en parte abierta, restantes PLAN-PENDING/ARCH-PENDING/DM-PENDING/BR-PENDING globales todavía abiertos conservados, incluidos DM-PENDING005 y BR-PENDING022/033. Datos personales/comerciales, catálogo/tarifas/costes/capacidades y prioridades/plazos reales no acreditados. Hosted H2 no acreditado; Production no autorizada. Sin módulos/efectos positivos Payment/fondos/conciliación/Refund/facturación/proveedor/disponibilidad operacional/ejecución/conectores/WhatsApp/email/telefonía reales. E2E y normas compartidas acreditadas solo en contribución local asignada; no integración total H6 ni cierre de pendientes por inferencia.
