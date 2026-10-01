# Evidencia TSK-H2-005 — implementación aislada

Base comprobada: `bccdc93e23a8f34d21e7358503dfdf3489302993`; fetch, main, árbol limpio y HEAD=origin/main PASS. Autorización exclusiva H2-005/006.

Expected congelado antes de código en [H2-006](evidence-TSK-H2-006.md): 20 filas de Tasks §6, matriz independiente R01–R39 NO EJECUTADA. Fuentes APPROVED prevalecen.

Dominio de vigencia (7 días configurables y límite menor); migración forward `20261001150357_h2_offer_lifecycle.sql`; adaptador F1/F2 `h2-offer-adapter.ts`. Emisión inmutable, intención pendiente, evaluación, revalidación exacta para acto, envío manual con hechos B07, rechazo por alcance; historia/resultados/revisión en una unidad. Locks Opportunity→Proposal existentes. No nuevo generador OP/PR, dinero, identidad ni Communication. Nueva condición reutiliza T01 H2-003.

Focales: PostgreSQL17 aislado `tests/integration/postgres-h2-005.test.ts` 1/1 PASS; `tests/offer-lifecycle.test.ts` 2/2 PASS; typecheck y lint/boundaries PASS. Comando: POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h2-005.test.ts. Dos ambigüedades PL/pgSQL corregidas antes del commit; no se presentan como verificación formal.

Al commit de implementacion ac6d770, H2-006 estaba pendiente; las focales no acreditaban cierre. La verificacion posterior y sus correcciones constan en H2-006.

Límites: registro manual, sin envío externo; IA sensible rechazada aquí con frontera HA/TTE/T08 existente. Revisión B07 no crea disponibilidad/confirmación. Acceptance positiva/SM-PV-07/SM-OP-07, Ganada, Booking/economía fuera de alcance. H2-007+ y H3–H6 NOT STARTED. PLAN-AUTH-001–006, PLAN-PENDING-003 abierto, DM-PENDING-005, BR-PENDING-022/033 y datos/políticas reales preservados. Sin hosted H2/Production/conectores/datos reales.

## Cierre acreditado posterior

TSK-H2-005 COMPLETED local/aislado tras H2-006. Commit inicial `ac6d7707307281f620a1a82dbad6a9ff9b05027b`; producto finalmente probado `ad28a0ed25b598e891e7eb88e95b058a08e59137`. F01-F05 detectados por verificacion/regresion se corrigieron en commits adicionales; originales/FAIL/reproducers conservados en H2-006. Matriz43/43 +3/3 complementos; regresion446/446 PostgreSQL17 +79/79 unitarias, cero skipped/cancelled. Install congelado/typecheck/lint/build/audit/diff-check PASS.

Archivos principales: `src/domain/offer-lifecycle.ts`, `src/infrastructure/postgres/h2-offer-adapter.ts`, migracion nueva `20261001150357_h2_offer_lifecycle.sql`, tests focales/independientes y `tests/fixtures/h2-006/`. SQL original, tipos, permisos, datos sinteticos, expected/observed, comandos y entorno real recuperables en [H2-006](evidence-TSK-H2-006.md) y `regression-summary.json`. Referencias de envio exactas conservan Evidence/Communication B07, version/contacto/canal/momento/actor; revalidacion no renueva fecha emitida; rechazo contextual mantiene alternativas. Ningun Booking/fondo/proveedor ni Acceptance positiva.

Los protocolos V-DOM/DAT/MIG/AT/SM/NEG/EVI se acreditan por H2-006, sin heredar las focales. H2 sigue IN PROGRESS; H2-007+ y H3-H6 NOT STARTED, STOP. Pendientes globales y acceso real/hosted/Production intactos.
