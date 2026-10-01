# Evidencia — TSK-H2-009

Base `fd1c1e1b06bffbef786383e98827ade4b13c919d`, fetch/main/árbol limpio/HEAD==origin/main verificados antes de modificar. Expected previo: [expected-TSK-H2-009-010.md](expected-TSK-H2-009-010.md),60 casos congelados y todas las filas Tasks §6; estados H0/H1/H2 previos verificados.

## Implementación candidata

Migración nueva20261001200941_h2_booking_conversion.sql; ninguna histórica editada. Booking baseline append-only, servicios/modalidades/contribuciones/noches/ocupación/nominal opcional/historia/resultado, referencias FK y UNIQUE Opportunity. F1/F2 servidor/H1 RES existentes; FORCE RLS/ACL mínimas; runtime sin DML. Cadena Acceptance exacta verificada no rectificada, selección D018; evidencia B07 de traslado exacto del detalle con digest, no acuerdo inventado. Cantidades de cobro y asistentes separados, lista nominal vinculada a necesidad acreditada. El agrupamiento de contribuciones exige detalle revisado: nunca se deduce por catálogo. Datos aplicados desconocidos null; certeza explícita conservada.

Directa compone únicamente actuaciones tipadas de los contratos H2 existentes dentro de la misma transacción privada T03 o reutiliza cadena ya existente; no expone callback/SQL/tx handle. El contexto nominal H1 no concede permisos. No Payment/fondos/conciliación/Refund/proveedor/confirmación operacional/external.

## Focal de implementación

PostgreSQL17.11 nativo aislado, datos sintéticos, rol crm_h0_runtime distinto de migración/owner/BYPASSRLS. Node24.21.0/pnpm11.19.0. Comando `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h2-009.test.ts`. quinto intento1/1 PASS: raíz/detalle/RES/replay/read/inmutabilidad. Logs first–fourth-focal FAIL preservados: error del fixture al usar JSON.stringify como parámetro jsonb (cliente serializa cadena); diagnóstico hash/observed en third/fourth, corregido cast intermedio text en fixture. Expected intacto. Typecheck desarrollo PASS. No Fxx formal aún; H2-010 y regresión NO EJECUTADAS.

Pendientes globales intactos, H2 IN PROGRESS,011+/H3–H6 NOT STARTED; sin hosted H2/Production/datos reales/conectores. Evidencia local incompleta hasta H2-010; no COMPLETED todavía.
