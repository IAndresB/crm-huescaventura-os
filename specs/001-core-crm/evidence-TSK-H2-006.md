# Evidencia TSK-H2-006 — expected previo e independiente

Base autorizada y comprobada: `bccdc93e23a8f34d21e7358503dfdf3489302993`. Main limpio; fetch PASS.

## Congelación antes de código

Estado: **NO EJECUTADA**. Expected derivado de fuentes APPROVED/Tasks, no de implementación.

1. Vigencia ordinaria configurable: 7 días por defecto; emisión y límite efectivo originales inmutables; mínimo de límites de precio/disponibilidad/opción materiales con fuente B07.
2. Caducidad e incertidumbre son condiciones; no rechazo ni Acceptance; ratificación solo para acto/versión/cobertura/momento comprobados con nueva prueba de todos los aspectos materiales.
3. Nueva vigencia ofrecida es cambio de condición: nueva preparación/version T01; no editar ni reemitir la antigua. Versiones sustituidas/rechazadas requieren revisión exacta antes de volver a comprometer.
4. Envío manual: identidad/destinatario, canal, momento, versión exacta, Communication outgoing y communication_fact sent con Evidence reviewed, contexto y cobertura coherentes; intención/Human Approval/lectura/silencio no sustituyen hecho.
5. Rechazo atribuible por versión/modalidad/línea y motivo conocido; conserva alternativas e historia; no selección/ambigüedad no rechazo; no perder Opportunity automáticamente.
6. Desconocido material no cero; no bloquear preparación/intención independiente. Precio definitivo requiere coste final material confirmado y datos del compromiso comprobados.
7. Actor Admin F2 y F1 vinculados a transacción; permisos mínimos/FORCE RLS; historia+resultado+efectos atomizados, replay reautorizado, revisión y locks en orden H2 existente.
8. Sin envío externo/conector; T08 existente no se reimplementa ni se consume por registrar manualmente un hecho. IA sensible no se ejecuta por esta API; conserva intención pendiente y frontera HA/TTE.
9. Sin Acceptance positiva, Ganada, Booking, fondos, proveedor ni disponibilidad operativa. Vigencia no borra acuerdos históricos futuros; la integración Acceptance corresponde H2-008.

## Trazabilidad completa Tasks §6 asignada

| Fila | Implementación | Verificación | Contrato normativo |
|---|---|---|---|
| **SPEC-FR-COM-003** — [spec.md](spec.md), § 10.2. Comercial | [TSK-H2-001], [TSK-H2-007], [TSK-H2-005] | [TSK-H2-002], [TSK-H2-008], [TSK-H2-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-004** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-005] | [TSK-H2-006], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-006** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-005], [TSK-H1-013], [TSK-H5-005] | [TSK-H2-006], [TSK-H1-014], [TSK-H5-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-PROP-007** — [spec.md](spec.md), § 10.4. Propuestas | [TSK-H2-003], [TSK-H2-005] | [TSK-H2-004], [TSK-H2-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-005** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-001], [TSK-H2-005] | [TSK-H2-002], [TSK-H2-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-008** — [spec.md](spec.md), § 24.1. Identidad, comercial y aceptación | [TSK-H2-005], [TSK-H2-007] | [TSK-H2-006], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-086** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H2-005], [TSK-H2-007] | [TSK-H2-006], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-087** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H1-013], [TSK-H5-005], [TSK-H2-005] | [TSK-H1-014], [TSK-H5-006], [TSK-H2-006] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-011** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H2-005], [TSK-H2-007] | [TSK-H2-006], [TSK-H2-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SM-OP-05** — [state-machines.md](../../docs/state-machines.md), § 4. Opportunity / Commercial State | [TSK-H2-001], [TSK-H2-005] | [TSK-H2-002], [TSK-H2-006] | V-SM positivo: SM-OP-05 · Activa; evento «Registrar envío de propuesta exacta» → Propuesta enviada. Efectos exigidos: Vincular Communication y versión enviada; no aceptación. Puede omitir etapas de preparación no registradas, sin inventarlas.. Negativo: retirar/incumplir cada guarda material «Versión fijada, guardas de §5 y evidencia real del envío», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-03** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-005] | [TSK-H2-006] | V-SM positivo: SM-PV-03 · Versión fijada; evento «Enviar propuesta» → Hecho Enviada de esa versión. Efectos exigidos: Evidencia de envío/destinatario; presentación comercial respeta BR-PACK-003 y economía reservada.. Negativo: retirar/incumplir cada guarda material «Datos materiales del compromiso verificados; coste final relevante confirmado si afecta al precio definitivo; vigencia utilizable o revisión previa; G3 si sensible IA», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-04** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-005] | [TSK-H2-006] | V-SM positivo: SM-PV-04 · Alcance ofrecido vigente, aún no aceptado; evento «Alcanzar vencimiento efectivo o detectar incertidumbre material» → Caducada y/o Pendiente de revalidación. Efectos exigidos: Impedir aceptación sin revisión; no registrar rechazo.. Negativo: retirar/incumplir cada guarda material «Fecha realmente aplicada o evidencia de la incertidumbre; alcance», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-05** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-005] | [TSK-H2-006] | V-SM positivo: SM-PV-05 · Pendiente de revalidación; evento «Ratificar contenido para aceptación concreta» → Revalidación acreditada para el acto revisado. Efectos exigidos: Conservar emisión/vencimiento originales. No «extender» silenciosamente la versión. Si cambia el contenido, incluida una nueva vigencia ofrecida como condición, usar SM-PV-06.. Negativo: retirar/incumplir cada guarda material «Nueva evidencia de precios, disponibilidad, condiciones/capacidad materiales; revisión y momento aplicables», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-PV-08** — [state-machines.md](../../docs/state-machines.md), § 5. Proposal / Proposal Version lifecycle | [TSK-H2-005] | [TSK-H2-006] | V-SM positivo: SM-PV-08 · Alcance no aceptado de versión fijada; evento «Registrar rechazo» → Hecho Rechazada en ese alcance. Efectos exigidos: Mantener alternativas y partes aceptadas. No seleccionar una parte no prueba rechazo. Nueva negociación conserva el rechazo y revalida antes de nuevo compromiso.. Negativo: retirar/incumplir cada guarda material «Respuesta atribuible, versión/alternativa y alcance afectados, motivo conocido», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-CO-04** — [state-machines.md](../../docs/state-machines.md), § 14.1. Communication sin máquina artificial | [TSK-H1-013], [TSK-H5-005], [TSK-H2-005] | [TSK-H1-014], [TSK-H5-006], [TSK-H2-006] | V-SM positivo: SM-CO-04 · Contenido listo y autorización aplicable; evento «Enviar y registrar resultado» → Hecho Enviada. Efectos exigidos: Aprobación no es envío. Incertidumbre/fallo conserva intento y revisión, sin presentarse como éxito.. Negativo: retirar/incumplir cada guarda material «Destinatario/contenido concretos, permisos, guardas de la acción y G3; evidencia de envío real», además de G1–G6 pertinentes; aplicar rechazo/pendiente y conservación según §2.2. |
| **SM-FORB-01** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H2-005], [TSK-H2-007] | [TSK-H2-006], [TSK-H2-008] | V-NEG: intentar «Caducada → Aceptada sin revalidación previa material, o prorrogar silenciosamente vencimiento»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-008, AC-009. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **SM-FORB-03** — [state-machines.md](../../docs/state-machines.md), § 17. Forbidden transitions — Transiciones prohibidas | [TSK-H4-005], [TSK-H2-005], [TSK-H2-007], [TSK-H5-005] | [TSK-H4-006], [TSK-H2-006], [TSK-H2-008], [TSK-H5-006] | V-NEG: intentar «Silencio, leído, visto, envío o mensaje ambiguo → aceptación/rechazo/confirmación»; impedir la transición/inferencia y conservar hechos/historia. V-NEG: AC-020, AC-086, AC-087. Intentar inferencia/transición prohibida de SM §17; debe rechazarse sin efecto indebido. |
| **PLAN-B03** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H2-001], [TSK-H2-003], [TSK-H2-005], [TSK-H2-007], [TSK-H2-009] | [TSK-H2-002], [TSK-H2-004], [TSK-H2-006], [TSK-H2-008], [TSK-H2-010], [TSK-H2-011] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-T01** — [plan.md](plan.md), § 7.2. Unidades internas | [TSK-H2-003], [TSK-H2-005] | [TSK-H2-004], [TSK-H2-006], [TSK-H6-016] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-02** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H2-003], [TSK-H2-005], [TSK-H2-007], [TSK-H2-009] | [TSK-H2-004], [TSK-H2-006], [TSK-H2-008], [TSK-H2-010] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |

## Matriz independiente congelada

| Caso | Expected previo | Observed | Resultado |
|---|---|---|---|
| R01 | 7 días por defecto/configuración explícita | No ejecutado | NO EJECUTADA |
| R02 | límite material más restrictivo y fuente | No ejecutado | NO EJECUTADA |
| R03 | límites inválidos/sin evidencia | No ejecutado | NO EJECUTADA |
| R04 | vigencia dentro/fuera y no rechazo | No ejecutado | NO EJECUTADA |
| R05 | incertidumbre material con evidencia; ausencia rechazada | No ejecutado | NO EJECUTADA |
| R06 | revalidación exacta para acto sin mutar original | No ejecutado | NO EJECUTADA |
| R07 | cada aspecto material retirado/candidate/fuera de contexto | No ejecutado | NO EJECUTADA |
| R08 | acto/versión/cobertura/momento distinto no reutiliza revisión | No ejecutado | NO EJECUTADA |
| R09 | nueva vigencia exige nueva versión; reemisión rechazada | No ejecutado | NO EJECUTADA |
| R10 | T01 nueva condición/sustitución conserva v1 | No ejecutado | NO EJECUTADA |
| R11 | intención sin envío/recepción | No ejecutado | NO EJECUTADA |
| R12 | envío manual acreditado SM-PV03/SM-OP05/SM-CO04 | No ejecutado | NO EJECUTADA |
| R13 | cada guarda de envío: versión/destinatario/canal/momento/evidencia/fact/contexto | No ejecutado | NO EJECUTADA |
| R14 | Human Approval/IA sin hecho no envío | No ejecutado | NO EJECUTADA |
| R15 | caducada sin revisión no compromiso | No ejecutado | NO EJECUTADA |
| R16 | envío con revisión para ese acto y no prolongación | No ejecutado | NO EJECUTADA |
| R17 | coste material desconocido bloquea definitivo; intención permitida | No ejecutado | NO EJECUTADA |
| R18 | rechazo modalidad exacta no pierde venta/otras modalidades | No ejecutado | NO EJECUTADA |
| R19 | rechazo versión/línea conserva alcance | No ejecutado | NO EJECUTADA |
| R20 | rechazo sin motivo/atribuibilidad/evidencia rechazado | No ejecutado | NO EJECUTADA |
| R21 | no selección/leído/silencio ambiguo no rechazo/Acceptance | No ejecutado | NO EJECUTADA |
| R22 | sustituida/rechazada requiere revisión contenido/cobertura | No ejecutado | NO EJECUTADA |
| R23 | Acceptance/Ganada/pago/proveedor prohibidos explícitos | No ejecutado | NO EJECUTADA |
| R24 | runtime/anon/authenticated SQL directo no mutaciones | No ejecutado | NO EJECUTADA |
| R25 | RLS/FORCE RLS/ownership/ACL mínimos | No ejecutado | NO EJECUTADA |
| R26 | sin contexto | No ejecutado | NO EJECUTADA |
| R27 | scope falsificado/firma alterada | No ejecutado | NO EJECUTADA |
| R28 | actor inhabilitado lectura/escritura/replay | No ejecutado | NO EJECUTADA |
| R29 | actor no provisionado | No ejecutado | NO EJECUTADA |
| R30 | fallo antes primera escritura: rollback | No ejecutado | NO EJECUTADA |
| R31 | fallo tardío historia: rollback todo | No ejecutado | NO EJECUTADA |
| R32 | respuesta perdida/replay equivalente durable sin duplicados | No ejecutado | NO EJECUTADA |
| R33 | replay material distinto conflicto | No ejecutado | NO EJECUTADA |
| R34 | concurrencia dos sesiones ambos órdenes un ganador | No ejecutado | NO EJECUTADA |
| R35 | historia visible desde conexión independiente | No ejecutado | NO EJECUTADA |
| R36 | V-MIG sobre H2-004 con fixtures y conservación exacta | No ejecutado | NO EJECUTADA |
| R37 | V-MIG cadena vacía PostgreSQL17 | No ejecutado | NO EJECUTADA |
| R38 | migraciones publicadas sin cambios | No ejecutado | NO EJECUTADA |
| R39 | regresión completa cero skipped/cancelled | No ejecutado | NO EJECUTADA |

## Límites y pendientes

H2-007+ y H3–H6 NOT STARTED. PLAN-AUTH-001–006, parte abierta PLAN-PENDING-003, DM-PENDING-005, BR-PENDING-022/033 preservados. Datos personales/comerciales/políticas, catálogo/tarifas/costes/capacidades, prioridades/plazos reales no acreditados. Hosted H2 no acreditado, Production no autorizada, sin conectores/envíos/pagos/proveedores reales.

## Ampliación normativa y defectos formales (antes de corrección)

R40: guardas de cobertura SM-PV-08/AC-086 se aplican a todo contenido incluido: rechazo de modalidad/línea también afecta el reenvío agregado. R41: atribución al responsable contextual H1, BR-PROP-005/G1. R42: revisiones obligatorias tipadas no pueden ser null/string y eludir precondiciones concurrentes, PLAN-C03/G6. Expected fijado antes de sus ejecuciones; no derivado de salida.

| Fxx | Reproducer / expected | Observed original | Materialidad / corrección | Estado |
|---|---|---|---|---|
| F01 | R40: rechazo de modalidad; reenviar conjunto sin revalidación debe bloquear | Segundo/sixth formal: envío permitido; Missing expected rejection | Material, compromiso incluye alcance rechazado. Intersección versión/modalidad/línea y nueva revisión exacta | OPEN hasta matriz y regresión |
| F02 | R41: contacto verificado ajeno al contexto no puede rechazar oferta del responsable | Sexta ejecución: rechazo permitido | Material, atribución comercial indebida. Reutilizar Primary Contact verificado H1 con vigencia al acto | OPEN hasta matriz y regresión |
| F03 | R42: null/string en revisiones debe rechazar | Quinta/sexta ejecución: intención escrita con revisión null | Material, omite concurrencia. Validación SQL tipos y presencia, además de comparación bajo locks | OPEN hasta matriz y regresión |

Original de migración `offer-ac6d770.sql.txt`, verifier `sixth-verifier.ts.txt` y FAIL/logs completos en `tests/fixtures/h2-006/`. Primera matriz39/39 PASS; ampliaciones conservadas. Tercera ejecución falló por fixture H1 expectedVersion=1 incorrecto (contexto empieza0), corregido solo en harness sin cambiar expected. R41 inicial usaba destinatario original por cierre del helper: se corrigió antes del FAIL material auténtico en sexta ejecución.

### F04 — límite anterior a emisión

Expected R43 fijado antes de décima ejecución: SM-PV-04 requiere alcance ofrecido vigente en el momento evaluado; un acto anterior a emisión no acredita vigencia (BR-PROP-004/DM-INV-011/G2). Observed: `pending=false` y escritura permitida antes de emisión, Missing expected rejection. Materialidad: condición temporal indebida para acto; no hubo Acceptance. Corrección: comprobar emisión antes de evaluación, igual que envío/revalidación. Original `offer-12814f4.sql.txt` y `tenth-verifier.ts.txt`, FAIL original `tenth-formal.log`. Estado OPEN hasta matriz completa y regresión. La primera regresión iniciada sobre12814f4 se conserva como anterior a F04; no acredita el estado corregido.

Repetición posterior a F04: matriz43/43 PASS y2/2 reproducers históricos PASS (`twelfth-formal.log`), sin skipped/cancelled. Undécima ejecución:43 casos actuales PASS, reproducerF04 no arrancó por ruta de socket Unix macOS >103bytes; log PostgreSQL nativo conservado en `historical-harness-socket.log`. Se acortó exclusivamente la etiqueta sintética del cluster; expected y reglas no cambiados.

### F05 — migración nativa sin roles de Data API

Expected V-MIG/regresión: cadena válida también en PostgreSQL nativo sin roles opcionales anon/authenticated; runtime sigue sin privilegios directos y roles presentes no reciben permisos. Observed regresión iniciada sobre12814f4: suites H0-005/006/016/017 fallan SQLSTATE42704, `role anon does not exist`, al aplicar nueva migración. FAIL íntegro `postgres.log`. Materialidad: regresión de instalación H0/H1. Corrección: revocar siempre PUBLIC/runtime y revocar roles Data API solamente cuando existen, sin crearlos ni dar permisos. Original anterior a corrección `offer-e7f1a90.sql.txt`. Estado OPEN hasta matriz y regresión completa posterior.

F05 corrección y reproducer: `thirteenth-formal.log`43/43 matriz +3/3 reproducers/complemento nativo PASS (46/46 total), cero skipped/cancelled. Reproducer F05 instala SQL original sin roles opcionales, comprueba42704 y rollback sin tabla parcial, instala corrección y demuestra FORCE RLS sin crear roles. Regresión anterior443 casos:418 PASS/25 FAIL (todos role anon ausente), cero skipped/cancelled; se conserva íntegra y no acredita cierre. Esa ejecución empezó en12814f4 y seguía en curso durante la corrección F04; no se presenta como snapshot homogéneo final.
