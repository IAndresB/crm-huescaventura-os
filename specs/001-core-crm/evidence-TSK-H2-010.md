# Evidencia independiente — TSK-H2-010

Base `fd1c1e1b06bffbef786383e98827ade4b13c919d`. Expected [expected-TSK-H2-009-010.md](expected-TSK-H2-009-010.md) congelado antes de38793e677368008193ad785862e2f8b9d5cdef3a; R61–R66 fijados antes de ensayarlos. Todas las filas Tasks §6 copiadas. PostgreSQL17.11 aislado en cluster nuevo crm_h2_010:55483, reproducer histórico cluster crm_h2_010_hist:55484, datos sintéticos, runtime sin owner/BYPASSRLS. Node24.21.0/pnpm11.19.0/Supabase CLI2.118.0.

## Resultados históricos

Primer intento formal first-formal-38793e6.log:51/60 PASS,9 FAIL de fixtures: revisión Opportunity omitida tras T02 (R03), verify reutilizaba campos inmutables de register (R18/22/23/24/25/26/49), designación H1 usaba expectedVersion0 en contexto versión1 (R28). Expected intacto, corregidos los inputs para construir los orígenes normativos. Segundo intento second-formal-38793e6.log:60/60 PASS. Typecheck-verifier-development FAIL por array implícito, corregido tipo explícito sin cambiar expected.

### F01 — duplicado nominal de identidad conocida

Expected previo R61/DM-INV015/SPEC-FR-SVC004: el mismo Contact verificado no cuenta como dos personas dentro del mismo alcance nominal. Observed sobre producto38793e6: dos Participant IDs enlazados al mismo Contact pasan alta; `Missing expected rejection`. Material: duplicado de identidad y recuento nominal. Original F01-original-38793e6.log, SQL booking-38793e6.sql.txt y verifier-F01-original.ts.txt conservados. Corrección: índice único parcial Booking/Contact en Participant; una persona reutiliza la misma entidad para sus asignaciones. No deduplicación por nombre/canal ni inferencia de identidades desconocidas.

Nueva ejecución completa third-formal-corrected.log:66/66 casos normativos +1/1 reproducer histórico PASS;0FAIL/skipped/cancelled. V-DOM/DAT/MIG/AT/SM/NEG/EVI ejecutados: normativa, ACL/FORCE RLS/direct SQL/falsificación/actores, migración vacía/predecesor/fallo/roles opcionales, replay/carreras/dos sesiones, fallos todos los puntos T03 incluyendo noches/nominal/COMMIT y composición directa T01/T02/T03. El reproducer aplica SQL original y exige el FAIL normativo original, no adapta expected al defecto. F01 corregido, cierre definitivo pendiente de commit probado y regresión.

Regresión completa PENDIENTE. Matriz final por caso y commit probado se anexan después de ejecución fresca. Ningún cierre todavía en Tasks. H2 IN PROGRESS, H2-011+/H3–H6 NOT STARTED; pendientes globales conservados; hosted H2 no acreditado/Production no autorizada. Sin módulos/efectos positivos económicos/operativos/externos ni datos reales. Origen IA se deniega: el ensayo de G3 no acredita nueva automatización sensible ni habilita acciones H5/H6; Administrador manual y Acceptance real siguen siendo hechos distintos.
