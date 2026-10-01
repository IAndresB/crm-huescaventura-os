# TSK-H2-004 — Expected normativo y matriz independiente

Estado vigente: PASS local/aislado el 2026-10-01, contra `a080eb76e800126d155e78471ad2f6b59e382a7d`. Estado inicial conservado: NO EJECUTADA; expected y matriz fijados antes del código (commit69a0ef1).
Base comprobada tras fetch: `8ec1c7a3cad4954b1fb316be10b1b8b1be7feb82`; main limpio, HEAD == origin/main.
H0 técnico/local/aislado, H1 local/aislado y H2-001/002 COMPLETED; H2 IN PROGRESS; H2-003/004 y H2-005+/H3–H6 NOT STARTED.

## Expected congelado

Autoridad: Tasks fichas H2-003/004, §§2.2/2.3/5/6/7; Plan §§3.2/4/5.1–5.2/6.5/7.1–7.3/10.2; SPEC, BR, DM, SM y decisiones vinculadas abajo. G1–G6 se aplican. P07 conserva historia. D011/D018/D019/D023 no autorizan flujo posterior.

Proposal estable pertenece a Opportunity real. Preparación editable exige alcance conocido, fuentes y pendientes explícitos; alternativas independientes coexisten. SM-OP-04 se acredita al crear preparación real, conservando historia. SM-PV-01 prepara; SM-PV-02 fija snapshot exacto con composición, cantidades por servicio/noche, fuentes, condiciones reproducibles y estimación identificada solo con regla aprobada. SM-PV-06 conserva v1, crea preparación/v2 ante cambio material, antes/después, motivo, revisión y sustitución cuando proceda. Contrato ordinario y SQL directo no editan ni eliminan versiones fijadas (SM-FORB-02).

Modalidades, líneas, servicios/noches, cantidades/unidades, incluidos/excluidos y selección independiente se conservan estructuradamente. A10 rafting/2 noches y B2 sin rafting/1 noche permiten reconstruir rafting10/cena12/noche1=12/noche2=10 sin Booking. AC013 conserva petición parcial no seleccionable y exige nueva versión antes de Acceptance; cero Acceptance en este bloque.

Reutilizar motor exacto H1, catálogo/unidades/tarifas/packs/promociones versionados y PR H1. Precio calculado y final manual se conservan con diferencia, actor/momento/motivo y bases/versiones. 100.01 EUR/persona x10 =1000.10. Fijo interno mantiene su unidad y total; no prorrateo contractual. Coste material desconocido permanece null/pendiente y bloquea únicamente compromiso dependiente, permitiendo preparación/trabajo independiente. Estimación exige regla aprobada con fuente; no estimación→confirmación por fijación. Maestros posteriores no alteran snapshot ni reconstrucción PM09. Elegibilidad objetiva no deriva de recomendación.

Proyección comercial de pack/modalidad: únicamente precio final/persona, participantes e incluidos; economía interna no sale por lectura/exportación fuera UI. Acceso Administrador interno no autoriza divulgación. Base protege permisos/RLS/contexto verificado/actor habilitado y no acepta autoridad del payload. Runtime ordinario no owner/BYPASSRLS/service_role.

T01: Proposal, preparación/versionado, composición/fuentes/snapshot, código aplicable, historia/resultado/intención/origen juntos o ninguno. Revision esperada, locks raíz y numeración serializada; equivalente replay reautoriza, contenido distinto misma key conflicto. Fallos antes/durante abortan; pérdida de respuesta tras commit recupera original. Historia independiente visible y append-only.

No acreditar caducidad/vigencia/revalidación/envío/rechazo formal H2-005+, Acceptance positiva SM-PV-07/SM-OP-07, Ganada, Booking, fondos/conciliación/Refund, Availability/Provider Confirmation/ejecución. E2E01/02 solo contribución futura H6. No datos reales, hosted ni Production.

## Matriz formal congelada

Cada Rxx ejecutará expected anterior en PostgreSQL17 aislado con datos sintéticos y runtime ordinario, comparando estado persistido desde conexión independiente; V-DOM/DAT/MIG/AT/SM/NEG/EVI según obligación. No hereda focales.

| Caso | Expected / comprobación | Observed | Resultado |
|---|---|---|---|
| R01 | Preparación para Opportunity real; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R02 | Guardas de preparación: Opportunity/alcance/fuentes/pendientes; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R03 | Alternativas coexistentes; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R04 | Fijar v1; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R05 | Guardas individuales de fijación; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R06 | Editar versión fijada por contrato; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R07 | Precio material crea v2; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R08 | Composición material crea v2; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R09 | Términos materiales crean v2; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R10 | Modalidades y selección crean v2; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R11 | Antes/después/motivo/sustitución; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R12 | Petición parcial no seleccionable conservada; nueva versión requerida; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R13 | Modalidades A10 rafting/2 noches y B2 sin rafting/1 noche; cena12; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R14 | 100.01 x 10 = 1000.10 EUR; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R15 | Calculado/final/manual/actor/motivo/diferencia; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R16 | Proyección comercial económica mínima; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R17 | Desconocido no cero; bloqueo dependiente; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R18 | Referencias exactas H1; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R19 | Maestros posteriores no alteran v1; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R20 | PM09 reconstrucción histórica; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R21 | SQL directo ACL/RLS e inmutabilidad; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R22 | Sin contexto; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R23 | Contexto falsificado; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R24 | Actor inhabilitado; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R25 | Rol ordinario y actor no provisionado; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R26 | Fallo antes de escritura; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R27 | Fallo durante historia; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R28 | Respuesta perdida y replay equivalente; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R29 | Replay distinto conflicto; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R30 | Sesiones concurrentes revisión/fijación; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R31 | Carrera numeración; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R32 | Historia conexión independiente; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R33 | SM-FORB-02 intento explícito; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R34 | Sin efectos Acceptance/Ganada/Booking/economía/operación; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R35 | Límites H2-005+; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R36 | SM-OP-04 positivo y guardas negativas; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R37 | V-MIG cadena vacía y upgrade con fixtures/permisos; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |
| R38 | Fuentes exactas, estimación autorizada, elegibilidad independiente de recomendación; aplicar expected anterior, retirar cada guarda material y comprobar cero efecto parcial/historia perdida donde corresponda. | Expected satisfecho; pruebas y estado persistido en final-formal.log, conexiones independientes. | PASS local |

| R39 | AC085: regla objetiva no deriva de recomendación Alta; falta/candidata/ineligible bloquean únicamente definitivo; Evidence reviewed eligible con regla/alcance permite fijar. Expected concretado desde R38 congelado. | Fuentes y Evidence H1 reales aisladas, estado/history inspeccionados. | PASS local |

## Trazabilidad íntegra Tasks §6

| **SPEC-FR-CAT-001** — [spec.md](spec.md), § 10.3. Catálogo mínimo del expediente | [TSK-H1-005] | [TSK-H1-006], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CAT-004** — [spec.md](spec.md), § 10.3. Catálogo mínimo del expediente | [TSK-H1-007] | [TSK-H1-008], [TSK-H2-004], [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CAT-005** — [spec.md](spec.md), § 10.3. Catálogo mínimo del expediente | [TSK-H1-007], [TSK-H2-003] | [TSK-H1-008], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-001** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003] | [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-002** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003] | [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-003** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003], [TSK-H2-009] | [TSK-H2-004], [TSK-H2-011], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-005** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003], [TSK-H1-009] | [TSK-H2-004], [TSK-H1-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-007** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003], [TSK-H2-005] | [TSK-H2-004], [TSK-H2-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ACC-003** — [spec.md](spec.md), § 10.5. Acceptance | [TSK-H2-007], [TSK-H2-003] | [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-ECON-013** — [spec.md](spec.md), § 10.9. Economía operativa y reservada | [TSK-H1-009], [TSK-H3-013] | [TSK-H1-010], [TSK-H3-014], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-HIST-002** — [spec.md](spec.md), § 14. Versions, Snapshots, History and Evidence | [TSK-H0-009], [TSK-H2-003], [TSK-H1-007], [TSK-H3-013] | [TSK-H0-010], [TSK-H2-004], [TSK-H3-014], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CONC-001** — [spec.md](spec.md), § 18. Concurrency and Consistency | [TSK-H0-009] | [TSK-H0-010], [TSK-H2-004], [TSK-H4-012], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-SEC-003** — [spec.md](spec.md), § 20. Security, Privacy and Authorization | [TSK-H2-003], [TSK-H5-011] | [TSK-H2-004], [TSK-H5-012], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-001** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H1-001], [TSK-H2-001], [TSK-H2-003] | [TSK-H1-002], [TSK-H2-002], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-007** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-003] | [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-010** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H1-007], [TSK-H2-003] | [TSK-H1-008], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-011** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-003], [TSK-H1-009] | [TSK-H2-004], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-013** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-003], [TSK-H2-007] | [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-017** — [spec.md](spec.md), § 24.2. Operación y economía | [TSK-H2-009], [TSK-H2-003] | [TSK-H2-011] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-065** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-011], [TSK-H2-003] | [TSK-H5-012], [TSK-H2-004], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-067** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-009], [TSK-H2-003], [TSK-H2-007], [TSK-H4-011] | [TSK-H2-004], [TSK-H2-008], [TSK-H4-012], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-085** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H1-005], [TSK-H1-007], [TSK-H1-009], [TSK-H2-003], [TSK-H3-013] | [TSK-H1-006], [TSK-H1-008], [TSK-H2-004], [TSK-H3-014] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-012** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-009], [TSK-H1-003], [TSK-H2-003], [TSK-H5-015] | [TSK-H1-004], [TSK-H2-004], [TSK-H5-016], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-001** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H0-003], [TSK-H1-001], [TSK-H2-003] | [TSK-H0-004], [TSK-H1-002], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-008** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-003] | [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-024** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-007], [TSK-H2-003] | [TSK-H1-008], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-025** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-003], [TSK-H5-011] | [TSK-H2-004], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-026** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-009], [TSK-H2-003] | [TSK-H1-010], [TSK-H2-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-028** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-005], [TSK-H1-007], [TSK-H2-003], [TSK-H3-013] | [TSK-H1-006], [TSK-H1-008], [TSK-H2-004], [TSK-H3-014], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SM-OP-04** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001], [TSK-H2-003] | [TSK-H2-002], [TSK-H2-004] | V-SM positivo: SM-OP-04 · Nueva / En contacto / Necesidad definida / Propuesta enviada / Negociación / cambios; evento «Preparar propuesta o revisión» → Propuesta en preparación. Efectos exigidos: Trabajar Proposal; conservar envíos/versiones anteriores.. Negativo: retirar/incumplir cada guarda material «Opportunity válida y alcance suficiente para preparar; vincular alternativa y pendientes», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-01** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-003] | [TSK-H2-004] | V-SM positivo: SM-PV-01 · Proposal sin preparación / con versiones; evento «Preparar alternativa/revisión» → Preparación editable. Efectos exigidos: Crear contenido de trabajo sin editar versiones fijadas.. Negativo: retirar/incumplir cada guarda material «Opportunity y alcance conocidos; fuentes y pendientes», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-02** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-003] | [TSK-H2-004] | V-SM positivo: SM-PV-02 · Preparación editable; evento «Fijar edición» → Nueva Proposal Version fijada. Efectos exigidos: Conservar snapshot exacto e identidad/versionado. Fijar no acredita verificación ni envío.. Negativo: retirar/incumplir cada guarda material «Alcance, composición, cantidades por servicio/noche, fuentes y condiciones reproducibles; distinguir estimaciones autorizadas», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-06** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-003] | [TSK-H2-004] | V-SM positivo: SM-PV-06 · Cualquier versión fijada; evento «Ofrecer cambio material» → Nueva preparación → nueva versión fijada. Efectos exigidos: Relacionar sustitución cuando corresponda; conservar versiones, alternativas y términos anteriores.. Negativo: retirar/incumplir cada guarda material «Antes/después y motivo; datos materiales revisados», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-FORB-02** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H2-003], [TSK-H2-007] | [TSK-H2-004], [TSK-H2-008] | V-NEG: intentar «Editar Proposal Version fijada/aceptada o Acceptance válida para cambiar el acuerdo histórico»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-007, AC-013, AC-075. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **P07** — [constitution.md](../../docs/constitution.md), § P07. Conservación del historial comercial y operativo | [TSK-H2-003], [TSK-H2-007], [TSK-H2-009], [TSK-H4-011], [TSK-H5-015] | [TSK-H2-004], [TSK-H2-008], [TSK-H2-010], [TSK-H4-012], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-DEC-003** — [plan.md](plan.md), § 3.2. PLAN-DEC — decisiones técnicas APPROVED | [TSK-H1-001], [TSK-H2-003], [TSK-H0-009], [TSK-H3-005] | [TSK-H1-002], [TSK-H2-004], [TSK-H0-010], [TSK-H3-006], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B03** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H2-001], [TSK-H2-003], [TSK-H2-005], [TSK-H2-007], [TSK-H2-009] | [TSK-H2-002], [TSK-H2-004], [TSK-H2-006], [TSK-H2-008], [TSK-H2-010], [TSK-H2-011] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-C02** — [plan.md](plan.md), § 7.1. Contrato común de aplicación | [TSK-H1-009], [TSK-H1-011], [TSK-H2-001], [TSK-H2-003], [TSK-H2-007], [TSK-H2-009], [TSK-H4-013], [TSK-H4-020], [TSK-H5-015] | [TSK-H1-010], [TSK-H1-012], [TSK-H2-002], [TSK-H2-004], [TSK-H2-008], [TSK-H2-010], [TSK-H4-014], [TSK-H4-021], [TSK-H5-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T01** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H2-003], [TSK-H2-005] | [TSK-H2-004], [TSK-H2-006], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-02** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H2-003], [TSK-H2-005], [TSK-H2-007], [TSK-H2-009] | [TSK-H2-004], [TSK-H2-006], [TSK-H2-008], [TSK-H2-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-01** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H1-001], [TSK-H2-001], [TSK-H2-003], [TSK-H2-007], [TSK-H2-009], [TSK-H4-020], [TSK-H4-022], [TSK-H5-013], [TSK-H5-015] | [TSK-H6-001] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **E2E-02** — [spec.md](spec.md), § 9. Core End-to-End Scenarios | [TSK-H2-003], [TSK-H2-007], [TSK-H2-009] | [TSK-H6-002] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PM-09** — [plan.md](plan.md), § 5.2.2. Ejemplos y oráculos documentales | [TSK-H1-009], [TSK-H2-003], [TSK-H3-013] | [TSK-H1-010], [TSK-H2-004], [TSK-H3-014] | Oráculo de Plan §5.2.2: Cambian tarifas/regla o faltan costes; se reconstruye PM-02–PM-08. — Mismas bases/versiones e importes históricos; no ajustar costes, suplidos o derechos para compensar diferencias ni sustituir desconocido por cero. Verificar valores, unidades, materialización e historia; NO EJECUTADA. |
| **G4** — [state-machines.md](../../docs/state-machines.md), § 2.1. Semántica de la transición | [TSK-H0-009], [TSK-H2-003], [TSK-H2-007], [TSK-H4-009] | [TSK-H0-010], [TSK-H2-004], [TSK-H2-008], [TSK-H4-010], [TSK-H6-013] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **D011** — [DECISIONS.md](../../docs/DECISIONS.md), § D011 — Política comercial, aceptación, cobros y cancelaciones | [TSK-H2-003], [TSK-H2-007], [TSK-H3-001], [TSK-H4-013], [TSK-H4-015] | [TSK-H2-004], [TSK-H2-008], [TSK-H3-002], [TSK-H4-014], [TSK-H4-016] | Política comercial y económica. |
| **D023** — [DECISIONS.md](../../docs/DECISIONS.md), § D023 — Precisión y materialización monetaria en los casos acordados | [TSK-H1-009], [TSK-H2-003], [TSK-H3-001], [TSK-H4-013] | [TSK-H1-010], [TSK-H2-004], [TSK-H3-002], [TSK-H4-014] | PM-01–PM-09; materialización acordada. |

## Pendientes preservados

PLAN-AUTH-001–006 globales, PLAN-PENDING-003 abierto parcialmente, DM-PENDING-005, BR-PENDING-022/033, datos/políticas personales/comerciales reales, catálogo/tarifas/costes/capacidades reales, prioridades/plazos reales. Hosted H2 no acreditado; Production no autorizada. H2-005+/H3–H6 NOT STARTED.

## Primera ejecución formal conservada

Commit probado `69a0ef1bb2bf012bb29e65a1bcd36e560c9cd944`. PostgreSQL17.11 real aislado; R01–R38: 34 PASS / 4 FAIL, 0 skipped/cancelled. Log y verificador originales en `tests/fixtures/h2-004/first-formal.log` y `first-verifier.ts.txt`.

**H2-004-F01 OPEN — MATERIAL**. R20, expected PM09: reconstrucción de snapshot monetario persistido equivale exactamente a cálculo histórico. Observed: `MONEY_HISTORY_MISMATCH` tras roundtrip jsonb por orden de claves diferente. Materialidad: impediría reconstrucción histórica aunque bases/valores permanecen correctos. Reproducer: fixture R20 contra SHA anterior y módulo anterior `exact-money-69a0ef1.ts.txt`. Corrección prevista: comparación estructural canónica, conservando arrays, tipos y todos los valores; no recalcular ni cambiar importes históricos. Estado CLOSED solo tras nueva matriz completa PASS y regresión.

R11/R32/R37: defectos del verificador, no del producto. R11 comparó historia base sin código con proyección enriquecida PR; R32 JOIN nombró operation_id inexistente en history (history_id referencia operación); R37 incluyó índices nuevos en comparación de columnas anteriores. Expected permanece; corregir consulta/comparación y rerun. Tipos del verificador corregibles, sin cambio normativo.

## Reverificación y cobertura ampliada

Segunda ejecución completa: 38/38 PASS sobre implementación + corrección F01, antes del commit corrector; log `second-formal.log`. La comparación canónica conserva valores/tipos/orden de arrays; una alteración real del importe sigue produciendo MONEY_HISTORY_MISMATCH. F01 FIX IMPLEMENTED / PENDING FINAL REGRESSION.

**H2-004-F02 OPEN — MATERIAL**. La extensión positiva de R38 crea estimación con Evidence revisada explícita de la regla BR-ECON-001, fija contenido no definitivo y consulta proyección comercial. Expected BR-PROP-003/DM-INV-001: importe mostrado con etiqueta de estimación, sin compromiso confirmado. Observed: string100.01 sin certeza/etiqueta. Tercera matriz: 37/38 PASS / 1 FAIL, 0 skipped/cancelled. Verificador/log/SQL original preservados en `f02-verifier.ts.txt`, `third-formal.log`, `proposal-69a0ef1.sql.txt`. Corrección prevista: el campo precio final de la misma proyección mínima conserva amount + certainty estimated/pending para alcance no definitivo, sin desglose reservado ni implementar envío/vigencia/Acceptance.

Cuarta matriz completa: R01–R38 38/38 PASS tras F02; log `fourth-formal.log`. F02 FIX IMPLEMENTED / PENDING FINAL REGRESSION. Reproducers independientes ejecutables `postgres-h2-004-f01.test.ts` y `postgres-h2-004-f02.test.ts` conservan observed históricos; su PASS no acredita el contrato actual.

**H2-004-F03 OPEN — MATERIAL**. Expected congelado AC085: recomendación no acredita elegibilidad objetiva; regla material incumplida/no comprobada bloquea el compromiso dependiente y permite preparación independiente. R39 añadido para concretar esa obligación ya fijada: crea H1 Eligibility Rule Version known sobre servicio, prepara y trata de fijar precio definitivo sin evidencia de cumplimiento. Observed: fijación permitida. Quinta matriz 38/39 PASS / 1 FAIL (`fifth-formal.log`, `f03-verifier.ts.txt`), commit `b40a241` de producto. Corrección prevista: resolver y conservar reglas H1 aplicables, exigir Evidence revisada de cumplimiento con regla/alcance, bloqueo limitado a definitivo; sin motor paralelo ni umbrales inventados.

F03 corrección: fuente real de Eligibility Rule Version H1 aplicable al servicio, sin sustituir elegibilidad por recomendación. Preparación conserva blockers, reglas y evidencia; fijación definitiva verifica Evidence revisada scoped con referencia de regla. R39 ampliado prueba recomendación Alta + regla objetiva, ausencia/candidata/ineligible no habilitan compromiso; evidencia reviewed eligible de regla exacta sí permite fijar y queda conservada. No se evalúan umbrales inventados ni se crea motor H1 paralelo. Sexta matriz39/39 PASS; séptima42tests tuvo41PASS/1FAIL por fixture del verificador (publicación de recomendación H1 requiere IDs de revisión de endpoints, no IDs de maestro); log preservado y fixture corregido, expected intacto. Octava matriz completa39/39 PASS; F03 FIX IMPLEMENTED / PENDING FINAL REGRESSION.

## Resultado final y ejecución recuperable

Commit de producto probado: `a080eb76e800126d155e78471ad2f6b59e382a7d`. Nueva ejecución formal íntegra R01–R39 **39/39 PASS**, 0 fail/skipped/cancelled: `tests/fixtures/h2-004/final-formal.log`. Expected normativo permaneció anterior al observed; no se tomó implementación como oráculo. Verificador independiente: `tests/integration/postgres-h2-004.test.ts`; fuentes congeladas con las 46 filas originales arriba.

R39 concreta el expected de elegibilidad ya congelado en R38/AC085. Complementos `tests/support/h2-004-modalities.mjs` y `modalities.log`: R13 con identidades distintas de rafting/cena/alojamiento y unit personas, modalidades A10/B2, rafting expresamente excluido en B, cantidades10/12/12/10 y1000.10; R37 aplicación H1 previa con fuentes de cálculo versionadas idéntica después de migración. El ensayo primario R13 prueba líneas/contribuciones, el complemento prueba identidad y unidades exactas. Ninguna Booking ni compromiso operacional.

Entorno real: macOS/Postgres.app PostgreSQL17.11, Node24.21.0, pnpm11.19.0, Postgres.js3.4.9, Next16.3.6, TypeScript7.0.2, Supabase CLI2.118.0 solo generador de migración. Clúster formal efímero propio `crm_h2_004` puerto55467, complemento55473 y reproducers55468–55472; datos exclusivamente sintéticos, login runtime `crm_h0_runtime` ordinario, migration/provision/observer separados. Un único Administrador según autoridad V1; carreras con dos sesiones y conexiones independientes del actor autorizado, más actor no provisionado denegado R25. Doble únicamente del proveedor Auth: no acredita Auth real; permisos/RLS/rollback/concurrencia/datos se prueban en PostgreSQL real. Finalización HA/TTE H0 no se modifica.

V-DOM R14/15/17/20/38/39; V-DAT R21–25/32/33; V-MIG R37 y complemento; V-AT R26–31 y T01 R01/04; V-SM SM-OP04 R01/02/36, SM-PV01 R01–03/11, SM-PV02 R04–06/14–18/38/39, SM-PV06 R07–11; V-NEG SM-FORB02 R06/21/33; V-EVI este registro y archivos recuperables. Cada rechazo compara tablas de estado, versiones, composición, historia, operaciones, códigos/contadores anteriores y posteriores. R24 deshabilita al actor únicamente por canal de fixture/provision, nunca lo usa como identidad de negocio. Inmutabilidad ante runtime y roles API genéricos comprobada mediante SQL real.

La migración nueva se aplica sobre base publicada H2-001/002 con fixtures H0/H1/H2 anteriores: identidad/contexto/códigos OP, catálogo/unidades/formas/tarifas/packs, Lead/Opportunity/historia, Evidence/Communication/Task y aplicación H1 conservados. Comparación de datos y ACL/columnas/roles/memberships/policies/funciones/esquemas previos idéntica; cadena completa en segunda base vacía PASS. Migraciones publicadas H0/H1/H2-001/002 byte a byte intactas. Las correcciones de esta nueva migración se realizaron en commits adicionales antes de su primera publicación, sin amend/rebase.

### Comandos y regresión

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h2-004.test.ts
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --experimental-strip-types tests/support/h2-004-modalities.mjs
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm test
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres
pnpm run build
pnpm audit --prod
git diff --check
```

Regresión íntegra posterior a matriz PASS: instalación congelada/typecheck/lint/build/audit/diffcheck PASS; **77/77 unitarias +399/399 PostgreSQL17**, 0 fail/skipped/cancelled; audit producción sin vulnerabilidades conocidas. Runner íntegro H0/H1/H2 anterior y nuevo, sin filtros ni debilitamiento; 396436ms PostgreSQL con esperas históricas deliberadas. Logs por comando y `regression-summary.json` recuperables en `tests/fixtures/h2-004/`. F01/F02/F03 **CLOSED localmente** tras matriz actual y regresión completas; 0 Fxx abiertos. Tres reproducers históricos PASS en runner íntegro, adicionales al crédito formal actual, sin ocultar FAIL previos.

### Limitaciones y STOP

Fijar no certifica envío, vigencia efectiva, aceptación, disponibilidad ni proveedor. El estado Propuesta enviada de SM-OP04 requiere funcionalidad posterior: no se construye mediante fixture ficticio ni se acredita ese recorrido antes de H2-005. SM-OP04 se habilita mediante el contrato que crea preparación real; el comando ordinario H2-001 no inventa una Proposal para cambiar el estado. Preparación editable conserva revisiones; no se vuelve editable el snapshot fijado.

AC013 acredita únicamente conservación de petición no seleccionable y exigencia de versión nueva, cero Acceptance; AC017 solo composición/cantidades, sin convertir. E2E01/02/PT02 y demás fuentes compartidas mantienen sus integraciones asignadas posteriores. Estimación admite únicamente prueba sintética explícita de regla aprobada; no acredita ninguna regla/precio comercial real. La proyección mínima mantiene certainty estimated/pending en el campo de precio no definitivo; nunca publica costes, unidad fija interna, ajuste/actor/motivo ni rentabilidad. Source/version histórico conserva lo usado; no afirma vigencia actual H2-005.

TSK-H2-003/004 COMPLETED exclusivamente local/aislado; H2 IN PROGRESS. H2-005+/H3–H6 NOT STARTED. PLAN-AUTH001–006 globales, PLAN-PENDING003 parte abierta, DM-PENDING005, BR-PENDING022/033 y políticas/datos personales/comerciales/catálogos/tarifas/costes/capacidades/prioridades/plazos reales siguen pendientes. Hosted H2 no acreditado; Production no autorizada; sin conectores/envíos/pagos/proveedores reales. STOP obligatorio antes de H2-005.

## Correspondencia individual de las 46 filas asignadas

| ID | Evidencia local / pendiente preservado |
|---|---|
| SPEC-FR-CAT-001 | R18/19/37 + complemento R13/R37 |
| SPEC-FR-CAT-004 | R17/18/19/20/38 |
| SPEC-FR-CAT-005 | R03/13/18/19 |
| SPEC-FR-PROP-001 | R01/02/03/11 |
| SPEC-FR-PROP-002 | R04–11/21/33 |
| SPEC-FR-PROP-003 | R13/16/18 + complemento R13 |
| SPEC-FR-PROP-005 | R14/15/17/20/38/39 |
| SPEC-FR-PROP-007 | R07–12; sustitución, no rechazo formal/vigencia futura |
| SPEC-FR-ACC-003 | R12; límite previo, cero Acceptance |
| SPEC-FR-ECON-013 | R15/17/18/20; snapshot/coste desconocido, no rentabilidad integrada H3 |
| SPEC-FR-HIST-002 | R07–11/19/20/32/33 |
| SPEC-FR-CONC-001 | R29/30/31 |
| SPEC-FR-SEC-003 | R16/21/25 |
| AC-001 | R02/17 |
| AC-007 | R04–11/33 |
| AC-010 | R17/38 |
| AC-011 | R14/15/16/18 |
| AC-013 | R12; sin Acceptance |
| AC-017 | R13 y complemento; sin Booking |
| AC-065 | R16/21/25; superficies implementadas |
| AC-067 | R29/30/31; no Acceptance futura |
| AC-085 | R18/19/20/39 |
| SPEC-NFR-012 | R07–11/19/20/32/33 |
| DM-INV-001 | R02/17/38 |
| DM-INV-008 | R04–11/21/33 |
| DM-INV-024 | R13 + complemento |
| DM-INV-025 | R16/21 |
| DM-INV-026 | R14/15/20 |
| DM-INV-028 | R18/19/20/37 + complemento |
| SM-OP-04 | R01/02/36; origen Propuesta enviada reservado H2-005 |
| SM-PV-01 | R01/02/03/11 |
| SM-PV-02 | R04/05/06/17/18/38/39 |
| SM-PV-06 | R07/08/09/10/11 |
| SM-FORB-02 | R06/21/33 |
| P07 | R07–11/19/20/32/33 |
| PLAN-DEC-003 | R01/04/13/18/21/37 |
| PLAN-B03 | R01–18/34/35/36 |
| PLAN-C02 | R02/05/11/17/38/39 |
| PLAN-T01 | R01/04/26/27/28/29/30/31/32 |
| PT-02 | R04–12/33; local solamente, Acceptance/vigencia/conversión posteriores |
| E2E-01 | R01/04/13; contribución, integración total H6 NO ACREDITADA |
| E2E-02 | R01/04; contribución sin Lead/envíos ficticios, cadena Acceptance/Booking H6 NO ACREDITADA |
| PM-09 | R19/20 |
| G4 | R07–11/19/20/32/33 |
| D011 | R01/04/12/34/35; solo frontera comercial |
| D023 | R14/15/20 |

Referencia técnica consultada (no sustituye autoridad del repo): [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), ACL y RLS conjuntamente; [changelog PG17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes). No índices ltree/btree_gist float ni cifrado legado introducidos; migración usa infraestructura H0 existente y pruebas reales.
