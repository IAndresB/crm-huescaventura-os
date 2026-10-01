# Evidencia TSK-H2-006 — expected previo e independiente

Base autorizada y comprobada: `bccdc93e23a8f34d21e7358503dfdf3489302993`. Main limpio; fetch PASS.

## Congelación antes de código

Estado al congelar, anterior a codigo: **NO EJECUTADA**. Expected derivado de fuentes APPROVED/Tasks, no de implementación.

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
| R01 | 7 días por defecto/configuración explícita | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R02 | límite material más restrictivo y fuente | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R03 | límites inválidos/sin evidencia | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R04 | vigencia dentro/fuera y no rechazo | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R05 | incertidumbre material con evidencia; ausencia rechazada | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R06 | revalidación exacta para acto sin mutar original | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R07 | cada aspecto material retirado/candidate/fuera de contexto | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R08 | acto/versión/cobertura/momento distinto no reutiliza revisión | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R09 | nueva vigencia exige nueva versión; reemisión rechazada | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R10 | T01 nueva condición/sustitución conserva v1 | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R11 | intención sin envío/recepción | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R12 | envío manual acreditado SM-PV03/SM-OP05/SM-CO04 | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R13 | cada guarda de envío: versión/destinatario/canal/momento/evidencia/fact/contexto | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R14 | Human Approval/IA sin hecho no envío | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R15 | caducada sin revisión no compromiso | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R16 | envío con revisión para ese acto y no prolongación | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R17 | coste material desconocido bloquea definitivo; intención permitida | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R18 | rechazo modalidad exacta no pierde venta/otras modalidades | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R19 | rechazo versión/línea conserva alcance | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R20 | rechazo sin motivo/atribuibilidad/evidencia rechazado | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R21 | no selección/leído/silencio ambiguo no rechazo/Acceptance | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R22 | sustituida/rechazada requiere revisión contenido/cobertura | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R23 | Acceptance/Ganada/pago/proveedor prohibidos explícitos | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R24 | runtime/anon/authenticated SQL directo no mutaciones | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R25 | RLS/FORCE RLS/ownership/ACL mínimos | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R26 | sin contexto | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R27 | scope falsificado/firma alterada | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R28 | actor inhabilitado lectura/escritura/replay | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R29 | actor no provisionado | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R30 | fallo antes primera escritura: rollback | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R31 | fallo tardío historia: rollback todo | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R32 | respuesta perdida/replay equivalente durable sin duplicados | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R33 | replay material distinto conflicto | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R34 | concurrencia dos sesiones ambos órdenes un ganador | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R35 | historia visible desde conexión independiente | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R36 | V-MIG sobre H2-004 con fixtures y conservación exacta | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R37 | V-MIG cadena vacía PostgreSQL17 | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R38 | migraciones publicadas sin cambios | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |
| R39 | regresión completa cero skipped/cancelled | Expected confirmado; ver comparacion final y logs recuperables | PASS local/aislado |

## Límites y pendientes

H2-007+ y H3–H6 NOT STARTED. PLAN-AUTH-001–006, parte abierta PLAN-PENDING-003, DM-PENDING-005, BR-PENDING-022/033 preservados. Datos personales/comerciales/políticas, catálogo/tarifas/costes/capacidades, prioridades/plazos reales no acreditados. Hosted H2 no acreditado, Production no autorizada, sin conectores/envíos/pagos/proveedores reales.

## Ampliación normativa y defectos formales (antes de corrección)

R40: guardas de cobertura SM-PV-08/AC-086 se aplican a todo contenido incluido: rechazo de modalidad/línea también afecta el reenvío agregado. R41: atribución al responsable contextual H1, BR-PROP-005/G1. R42: revisiones obligatorias tipadas no pueden ser null/string y eludir precondiciones concurrentes, PLAN-C03/G6. Expected fijado antes de sus ejecuciones; no derivado de salida.

| Fxx | Reproducer / expected | Observed original | Materialidad / corrección | Estado |
|---|---|---|---|---|
| F01 | R40: rechazo de modalidad; reenviar conjunto sin revalidación debe bloquear | Segundo/sixth formal: envío permitido; Missing expected rejection | Material, compromiso incluye alcance rechazado. Intersección versión/modalidad/línea y nueva revisión exacta | CLOSED local/aislado tras matriz y regresion final |
| F02 | R41: contacto verificado ajeno al contexto no puede rechazar oferta del responsable | Sexta ejecución: rechazo permitido | Material, atribución comercial indebida. Reutilizar Primary Contact verificado H1 con vigencia al acto | CLOSED local/aislado tras matriz y regresion final |
| F03 | R42: null/string en revisiones debe rechazar | Quinta/sexta ejecución: intención escrita con revisión null | Material, omite concurrencia. Validación SQL tipos y presencia, además de comparación bajo locks | CLOSED local/aislado tras matriz y regresion final |

Original de migración `offer-ac6d770.sql.txt`, verifier `sixth-verifier.ts.txt` y FAIL/logs completos en `tests/fixtures/h2-006/`. Primera matriz39/39 PASS; ampliaciones conservadas. Tercera ejecución falló por fixture H1 expectedVersion=1 incorrecto (contexto empieza0), corregido solo en harness sin cambiar expected. R41 inicial usaba destinatario original por cierre del helper: se corrigió antes del FAIL material auténtico en sexta ejecución.

### F04 — límite anterior a emisión

Expected R43 fijado antes de décima ejecución: SM-PV-04 requiere alcance ofrecido vigente en el momento evaluado; un acto anterior a emisión no acredita vigencia (BR-PROP-004/DM-INV-011/G2). Observed: `pending=false` y escritura permitida antes de emisión, Missing expected rejection. Materialidad: condición temporal indebida para acto; no hubo Acceptance. Corrección: comprobar emisión antes de evaluación, igual que envío/revalidación. Original `offer-12814f4.sql.txt` y `tenth-verifier.ts.txt`, FAIL original `tenth-formal.log`. Estado CLOSED local/aislado tras matriz completa y regresion final. La primera regresión iniciada sobre12814f4 se conserva como anterior a F04; no acredita el estado corregido.

Repetición posterior a F04: matriz43/43 PASS y2/2 reproducers históricos PASS (`twelfth-formal.log`), sin skipped/cancelled. Undécima ejecución:43 casos actuales PASS, reproducerF04 no arrancó por ruta de socket Unix macOS >103bytes; log PostgreSQL nativo conservado en `historical-harness-socket.log`. Se acortó exclusivamente la etiqueta sintética del cluster; expected y reglas no cambiados.

### F05 — migración nativa sin roles de Data API

Expected V-MIG/regresión: cadena válida también en PostgreSQL nativo sin roles opcionales anon/authenticated; runtime sigue sin privilegios directos y roles presentes no reciben permisos. Observed regresión iniciada sobre12814f4: suites H0-005/006/016/017 fallan SQLSTATE42704, `role anon does not exist`, al aplicar nueva migración. FAIL íntegro `postgres.log`. Materialidad: regresión de instalación H0/H1. Corrección: revocar siempre PUBLIC/runtime y revocar roles Data API solamente cuando existen, sin crearlos ni dar permisos. Original anterior a corrección `offer-e7f1a90.sql.txt`. Estado CLOSED local/aislado tras matriz y regresion final completa posterior.

F05 corrección y reproducer: `thirteenth-formal.log`43/43 matriz +3/3 reproducers/complemento nativo PASS (46/46 total), cero skipped/cancelled. Reproducer F05 instala SQL original sin roles opcionales, comprueba42704 y rollback sin tabla parcial, instala corrección y demuestra FORCE RLS sin crear roles. Regresión anterior443 casos:418 PASS/25 FAIL (todos role anon ausente), cero skipped/cancelled; se conserva íntegra y no acredita cierre. Esa ejecución empezó en12814f4 y seguía en curso durante la corrección F04; no se presenta como snapshot homogéneo final.

## Verificación formal final contra SHA fijado

Commit de producto verificado: `ad28a0ed25b598e891e7eb88e95b058a08e59137`. Expected inicial congelado antes de código; ampliaciones R40–R43 antes de sus observed, correcciones y reproducers conservados en commits adicionales sin amend/rebase.

Entorno real: Darwin/macOS arm64; Node 24.21.0, pnpm 11.19.0, PostgreSQL 17.11 (Postgres.app), Postgres.js 3.4.9, TypeScript 7.0.2, Next 16.3.6; CLI Supabase 2.118.0 solo para crear migración. Binario PostgreSQL `/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin`. Auth es doble local; Storage del runner usa el servicio oficial aislado fijado por H1, sin hosted.

Datos exclusivamente sintéticos: `H2006 SYNTHETIC`, actor Admin/contextos/contactos H0/H1; tarifa 900.00, coste 700.00 y desconocido=null; precio manual 100.01; modalidades A10/B5 y cantidad fija 1. Momentos explícitos sintéticos, 7 días/configuración 3 y límite material anterior real en cluster efímero. No fija zona/fecha contractual real. B07 Evidence reviewed/candidate y originales Communication exactos, sin personas/proveedores reales.

### Comando recuperable

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin \
node --test --experimental-strip-types \
  tests/integration/postgres-h2-006.test.ts \
  tests/integration/postgres-h2-006-defects.test.ts
```

`tests/fixtures/h2-006/verified-ad28a0e.log`: **43/43 casos R01–R43 PASS + 3/3 reproducers/complemento nativo PASS = 46/46**, cero FAIL/skipped/cancelled. Cluster nuevo por ejecución; negocio con runtime no owner/BYPASSRLS/service_role; migrador solo para bootstrap/fixtures/inyección de fallos. Observador independiente inspecciona persistencia/historia/ACL. Concurrencia: dos sesiones autorizadas del único Admin V1, ambos órdenes; no inventar segundo actor contra singleton H1.

### Correspondencia normativa a casos reales

| IDs | Casos y comparación esperada/observada |
|---|---|
| SPEC-FR-COM-003 / SM-OP-05 | R12–R14/R23/R31/R35: solo envío real B07 avanza a Propuesta enviada; guardas negativas sin mutación; no Ganada |
| SPEC-FR-PROP-004 / DM-INV-011 / AC-008 | R01–R10/R15/R16/R43: 7 días/configuración 3, mínimo material, caducidad/revisión exacta, condición nueva vía T01 sin prórroga y antes de emisión denegado |
| SPEC-FR-PROP-006 / AC-087 / SM-PV-03 / SM-CO-04 | R11–R17/R21/R23/R35: intención no envío; versión/contacto/canal/momento/Communication/fact/proof exactos, cada guarda negativa; coste desconocido no cero; no recepción/Acceptance |
| SPEC-FR-PROP-007 / AC-005 / AC-086 / SM-PV-08 | R18–R22/R40/R41: versión/modalidad/línea, respuesta del Primary Contact verificado H1 y motivo explícito; alternativa B aún enviable, agregado exige revisión, historia del rechazo conservada |
| SM-PV-04 | R04/R05/R13/R43: origen temporal real/uncertainty con fuente/alcance; pending sin rechazo; sin fuente o antes de emisión denegado |
| SM-PV-05 | R06–R08/R16/R22/R40: acto/versión/cobertura/momento exactos; retirar cada aspecto material o usar candidate bloquea; original inmutable |
| SM-FORB-01 | R06/R08/R09/R15/R16/R23: no reparación silenciosa; caducidad exige revisión; revalidar no crea Acceptance |
| SM-FORB-03 | R11/R14/R21/R23: intentos por leído/silencio/approval rechazados; dimensiones independientes |
| PLAN-B03 / PT-02 | R01–R43: alcance local de oferta; no Acceptance/conversión ni PT-02 global completo |
| PLAN-T01 | R10/R36/R37: nueva condición/vigencia con nueva versión H2-003, sustitución y snapshot retenidos; fijar no envía |
| C02/C03/C04/C05 / G1–G6 / V-DAT/V-AT | R07/R13/R24–R35/R40–R42: F1/F2, ACL/FORCE RLS/actor/contexto/directSQL, fallo temprano/tardío, replay postcommit/conflicto, locks/concurrencia e historia independiente |
| V-MIG / V-EVI | R36–R38 y complemento F05: todos los registros/ACL anteriores iguales con fixtures H0/H1/H2; cadena vacía, con/sin roles opcionales; migraciones publicadas y fuentes APPROVED intactas |

V-AT: hecho de oferta + historia + resultado + revisión Proposal y, solo envío real, historia/avance Opportunity. B07 conserva el hecho por su contrato; referenciarlo no lo duplica. T01 reutilizado. T08/HA/TTE no se reimplementa ni se consume por registro manual: no se ejecuta efecto IA/externo; intento IA por esta superficie denegado G3. La autorización H0 existente conserva su unidad y regresión; composición/envío externo se integra posteriormente en H5-006. Conector ausente conserva pendingExternal sin éxito.

Caducidad/rechazo/sustitución no borran versiones/hechos. No existe Acceptance positiva aquí: integración y conservación ante Acceptance real corresponden H2-008/H6, sin mock que la acredite. Originales B07 se conservan aunque el avance dependiente sea denegado.

Regresion final sobre ad28a0e: PASS. F01–F05 CLOSED local/aislado, cero abiertos en este bloque.

## Cierre y regresion final

TSK-H2-006 **COMPLETED local/aislado**. Expected se conserva en el commit inicial y esta evidencia; observed posterior y cronologia FAIL/correccion intactos. Todas las20 filas de Tasks asignadas quedan contrastadas en su alcance local; no acredita sus integraciones futuras.

| Comprobacion sobre SHA ad28a0e | Resultado observado | Evidencia recuperable |
|---|---|---|
| Matriz R01-R43 | 43/43 PASS | verified-ad28a0e.log |
| Reproducers F01-F04 y V-MIG F05 | 3/3 PASS (FAIL esperado en codigo original, PASS en corregido) | verified-ad28a0e.log / archivos SQL y verifier .txt |
| pnpm install --frozen-lockfile | PASS | install-verified.log |
| pnpm run typecheck | PASS | typecheck-verified.log |
| pnpm run lint / boundaries | PASS | lint-verified.log |
| pnpm test | 79/79 PASS;0FAIL/skipped/cancelled | unit-verified.log |
| POSTGRES_H0_BIN=... pnpm run test:postgres | 446/446 PASS;0FAIL/skipped/cancelled;397433.666791ms | postgres-verified.log |
| pnpm run build | PASS | build-verified.log |
| pnpm audit --prod | PASS, No known vulnerabilities found | audit-verified.log |
| git diff --check | PASS | diff-check-verified.log |

Todos los logs estan en `tests/fixtures/h2-006/`; resumen estructurado `regression-summary.json`. La instalacion usa lock congelado sin cambiar dependencias. La comprobacion de limites de importacion es el lint exigido por package.json. No se elimina ni debilita una prueba H0/H1.

**F01-F05 CLOSED local/aislado** solo despues de la repeticion43/43 y regresion446/446+79/79. Materialidades, originales y correcciones se conservan arriba y en los archivos recuperables. Ningun Fxx abierto en H2-005/006. El cierre no borra los FAIL anteriores ni cierra pendientes globales.

Fuentes APPROVED y migraciones anteriores conservadas byte a byte; coordinacion cambia solo estados/evidencia de005/006. H2 permanece IN PROGRESS. H2-007+ y H3-H6 NOT STARTED; STOP obligatorio. PLAN-AUTH-001-006, PLAN-PENDING-003 abierto, DM-PENDING-005, BR-PENDING-022/033 intactos. Datos/politicas personales/comerciales, catalogo/tarifas/costes/capacidades, prioridades/plazos reales no acreditados. Hosted H2 no acreditado, Production no autorizada. Sin conectores/envios/pagos/proveedores reales.

Presentacion del log build final: se eliminan solo lineas vacias terminales de `build-verified.log` para diff-check; stdout original exacto recuperable en `build-verified.log.gz`. Ningun FAIL/reproducer fue normalizado.
