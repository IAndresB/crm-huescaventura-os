# Evidencia TSK-H2-005 — implementación aislada

Base comprobada: `bccdc93e23a8f34d21e7358503dfdf3489302993`; fetch, main, árbol limpio y HEAD=origin/main PASS. Autorización exclusiva H2-005/006.

Expected congelado antes de código en [H2-006](evidence-TSK-H2-006.md): 20 filas de Tasks §6, matriz independiente R01–R39 NO EJECUTADA. Fuentes APPROVED prevalecen.

Dominio de vigencia (7 días configurables y límite menor); migración forward `20261001150357_h2_offer_lifecycle.sql`; adaptador F1/F2 `h2-offer-adapter.ts`. Emisión inmutable, intención pendiente, evaluación, revalidación exacta para acto, envío manual con hechos B07, rechazo por alcance; historia/resultados/revisión en una unidad. Locks Opportunity→Proposal existentes. No nuevo generador OP/PR, dinero, identidad ni Communication. Nueva condición reutiliza T01 H2-003.

Focales: PostgreSQL17 aislado `tests/integration/postgres-h2-005.test.ts` 1/1 PASS; `tests/offer-lifecycle.test.ts` 2/2 PASS; typecheck y lint/boundaries PASS. Comando: POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h2-005.test.ts. Dos ambigüedades PL/pgSQL corregidas antes del commit; no se presentan como verificación formal.

H2-006 pendiente contra commit de implementación. No acredita cierre por pruebas focales.

Límites: registro manual, sin envío externo; IA sensible rechazada aquí con frontera HA/TTE/T08 existente. Revisión B07 no crea disponibilidad/confirmación. Acceptance positiva/SM-PV-07/SM-OP-07, Ganada, Booking/economía fuera de alcance. H2-007+ y H3–H6 NOT STARTED. PLAN-AUTH-001–006, PLAN-PENDING-003 abierto, DM-PENDING-005, BR-PENDING-022/033 y datos/políticas reales preservados. Sin hosted H2/Production/conectores/datos reales.
