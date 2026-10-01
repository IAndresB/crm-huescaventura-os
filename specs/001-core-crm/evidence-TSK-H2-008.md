# Evidencia TSK-H2-008 — verificación independiente

Base autorizada y comprobada: `d333f140abf63b900b7e6ffbfdcfc4869575cca5`. Primera implementación `15dbf11026d12e770af1069a06a706944f4b1c6b`; expected antes de código en [expected-TSK-H2-007-008.md](expected-TSK-H2-007-008.md). Solo H2-007/008 y sus integraciones expresamente asignadas; STOP tras008. H2-009+ y H3–H6 NOT STARTED.

## Expected, datos y entorno

El expected recuperable contiene todas las filas asignadas de Tasks §6 y matriz R01–R60, fijada antes de cada ejecución/ampliación. Oráculo: fuentes APPROVED, no respuestas del producto. Implementación focal no sustituye este ensayo. PostgreSQL17.11 nativo, cluster/data sintéticos nuevos e independientes de007; runtime `crm_h0_runtime` sin owner/superuser/BYPASSRLS; migración y observador separados. Dos sesiones sintéticas autorizadas del Administrador V1 para carreras; no introducir segundo Administrador (singleton aprobado H1). No hosted ni Auth reales.

Datos: identidades de contacto/designación H1, Opportunity directa y códigos OP/PR H1, dos modalidades A/B, fuentes catálogo/tarifa sintéticas conocidas, precio final100.01, condiciones sintéticas T1 sin mandato inventado; evidencias revisadas B07/candidatas, Communications concretas cuando hay canal escrito, llamada sin Communication ficticia, anticipo solo evidencia inequívoca sin Payment. Momentos reales y de registro diferenciados. Preupgrade incluye código/identidad/contexto, catálogo/comercial/propuesta fijada/issuance/evidencia/Communication/Task H1.

## Matriz formal y observed

`tests/integration/postgres-h2-008.test.ts`: R01–R60. `tests/fixtures/h2-008/tenth-formal.log`:60/60 PASS y1/1 reproducer histórico; cero FAIL/skipped/cancelled. V-DOM/DAT/MIG/AT/SM/NEG/EVI; SM-AC01–03, SM-PV07, SM-OP07; prohibiciones FORB01/02/03/31/32 y guards materiales. Se comprueba persisted state y rollback desde observador real. V-MIG cadena vacía y predecesor completo con fixtures, ACL/functions/policies y bytes de28 migraciones anteriores conservados. Toda prueba de SM-BK/Payment/proveedor queda fuera; E2E-01/02 no completados.

R01–R16: candidato/registro/verificación, guards de identidad/relaciones/términos/selección/evidencia/vigencia, registro tardío, parcialA sinB, no seleccionable pendiente, llamada. R17–R29: anticipo como prueba/no fondos; sustitutos internos/comunicación rechazados; historia contextual; versión sustituida/rechazada; revisión posterior no retroactiva; SQL directo/inmutabilidad; rectificación enlazada y sus guards. R30–R40: replay, contenido distinto, carrera, fallo temprano/tardío/historia, actor autorizado/observador, sin/falso contexto, inhabilitado/no provisionado/ordinario, ACL/RLS. R41–R46: migraciones/fixtures/IDs/códigos/B07 y ausencia de efectos externos/económicos/operativos; vigencia posterior no desacepta histórico. R47–R60: revisión previa exacta con originales inmutables; cada material review withdrawn; WhatsApp/email/form/web exactos; total y línea selectable; autoridad inválida; pérdida; revisiones tipadas directSQL; ACL/migraciones anteriores; dos sesiones; rechazo de alcance ya aceptado vsB; posterior Ganada sin segundaAcceptance; fix/verify solapados ambos órdenes; rectificación no verificada.

## Fallos históricos y correcciones

| Fxx | Expected previo / reproducer | Observed15dbf11 | Materialidad y corrección | Estado |
|---|---|---|---|---|
| F01 | R56: SM-PV08 admite rechazo solo de alcance no aceptado; A verificada no rechazable por ese contrato | Missing expected rejection; intento permitido | Integración comercial indebida. Trigger nuevo en migración007 bloquea intersección con Acceptance verificada usable; B sigue independiente | CLOSED local/aislado tras matriz62/62+histórico y regresión510/510+80/80 |
| F02 | R57: SM-AC02 habilita evaluación comercial posterior del mismo hecho, sin editar verificación ni duplicar Acceptance | ACCEPTANCE_ALREADY_DECIDED | Bloqueo de recorrido material. Actos anexos de evaluación/verificación, unicidad por Acceptance/solicitudGanada; conserva verificación inicial | CLOSED local/aislado tras matriz62/62+histórico y regresión510/510+80/80 |

Original: `acceptance-15dbf11.sql.txt`. Verifier normativo original de57 casos congelado `verifier-defects.ts.txt`; archivo no modifica expected, solo usa cluster/puerto histórico propio. `original-15dbf11-reproduced-fail.log`:55PASS/2FAIL exactos R56/R57. `postgres-h2-008-defects.test.ts` requiere exactamente ese FAIL y causas originales. Nueva matriz afectada completa60/60 PASS, mismo expected material; ninguna historia publicada amend/rebase.

Errores del harness conservados en first–ninth logs: Task previa con payload ajeno al contrato H1; campo/time type; snapshots que incluían creación de pruebas aún no preparadas; comparación de actividad humana H0 como si fuese hecho comercial; código humano consultado con nombre inexistente; acto R22 artificialmente1ms anterior a sustitución (diagnóstico recuperable, corrige origen); Communication y progress fixtures incompatibles con B07/H2-001; sintaxis al cambiar solo now; colisión de puertos con reproducer. Expected no relajado: cronología/fixture conforme fuentes. Replay comprueba monotonicidad de `last_human_activity_at` y conserva todos los restantes datos del epoch, además de todos los hechos comerciales. Raw logs originales con whitespace conservados comprimidos y hash en raw-log-manifest.json; presentación normalizada sin ocultar FAIL.

## Comando recuperable

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin \
node --test --experimental-strip-types \
 tests/integration/postgres-h2-008.test.ts tests/integration/postgres-h2-008-defects.test.ts
```

En el commit inicial de esta evidencia la regresión estaba PENDIENTE; el cierre actual se acredita en el apartado final. Commit de producto probado y resultados finales se anexarán tras ejecutar. Pendientes globales preservados: PLAN-AUTH001–006, PLAN-PENDING003 abierto, DM-PENDING005, BR-PENDING022/033; datos/políticas/catálogo/tarifas/costes/capacidades/prioridades/plazos reales no acreditados. Hosted H2 no acreditado, Production no autorizada. Sin conectores/envíos/pagos/proveedores reales ni ampliación Booking/operación/economía.

## Integración adicional de identidad y primera regresión

Producto `76cfc7160ee598fd2c3a3316de7fc70b9436c8de`: matriz60/60 +1/1 histórico PASS; runner completo508/508 PostgreSQL17.11,80/80 unitarias; instalación congelada/typecheck/lint/boundaries/build/audit PASS. Raw logs recuperables en fixtures/h2-008. Duración PostgreSQL397210.413208ms; esperas H0 conservadas.

R61/R62 amplían el ensayo de la integración obligatoria AC-002/SPEC-FR-ID-002: Organization y vínculos a dos Contacts H1; payer contextual real no participante; cambio Primary Contact conserva aceptante/designación/historia; payer no adquiere facultad de aceptación ni acceso CRM. Expected fijado antes del ensayo; complemento2/2 PASS. Ningún cambio de producto. Se repetirá matriz completa62/62+histórico y regresión contra commit con estos ensayos; estados aún no cerrados.

## Cierre actual — COMPLETED local/aislado

Base `d333f140abf63b900b7e6ffbfdcfc4869575cca5`. Commit probado exacto `800de9518f0289f46e74a5a3a2c1218ad4b403d0`; producto sin diferencias frente a76cfc71 (el último commit añade integración de identidad). Matriz independiente R01–R62 **62/62 PASS**, reproducer histórico **1/1 PASS**, log `verified-800de95.log`; cero fallos/skipped/cancelled.

Regresión fresca posterior a matriz: instalación congelada, typecheck, lint/boundaries, **80/80 unitarias**, **510/510 PostgreSQL17.11**, build y audit--prod sin vulnerabilidades conocidas: PASS. PostgreSQL397530.340125ms, esperas H0 intactas. Node24.21.0/pnpm11.19.0. Comandos y outputs exactos en `tests/fixtures/h2-008/*-800de95.log`; resumen recuperable regression-summary.json. Diffcheck final y comparación de coordinación se registran antes de publicación. F01/F02 **CLOSED local/aislado**, cero Fxx abiertos; matriz completa afectada y regresión completas repetidas.

El diffcheck previo al commit800de95 detectó exclusivamente líneas vacías finales en logs de instalación/build. Presentación corregida mediante commit posterior; originales byte a byte comprimidos y hash verificado en raw-log-manifest.json. No se ocultó un FAIL ni se reescribió ningún commit.

H2 IN PROGRESS, únicamente007/008 cerradas en este bloque. H2-009+ y H3–H6 NOT STARTED. STOP tras008. PLAN-AUTH001–006 pendientes globales; PLAN-PENDING003 en su parte abierta; DM-PENDING005; BR-PENDING022/033; datos personales/comerciales/catálogo/tarifas/costes/capacidades/prioridades/plazos reales no acreditados. Hosted H2 no acreditado, Production no autorizada. Sin Booking/conversión/Payment/recepción/conciliación/fondos/Refund/proveedor/disponibilidad operacional/conectores/envíos reales.

Los IDs compartidos con tareas posteriores no se cierran globalmente: AC-014/016 solo contribución comercial/Acceptance, no Booking; AC-044 solo separación Acceptance/mandato/evidencia, no economía; SPEC-NFR-001 y E2E-01/02 conservan integración completa H6 pendiente. El anticipo se ensaya como prueba B07 inequívoca; no hay un movimiento económico. La prueba de Human Approval comprueba que una evidencia interna y origen IA no sustituyen cliente/actos exactos; no acredita nuevas acciones sensibles externas ni hosted.

## Matriz final Rxx: expected y observed

IDs normativos y guards: tabla completa en expected previo; filas de Tasks §6 conservadas byte a byte. Observed procede de ejecución y assertions persistentes del verifier final, no de ensayo focal.

| Rxx | Expected normativo previo | Observed final | Resultado |
|---|---|---|---|
| R01 | Candidato incompleto preservado; cero Acceptance válida. | incomplete candidate preserves evidence without Acceptance | PASS |
| R02 | Registro identificado inmutable; cero Ganada. | registered immutable fact is unverified | PASS |
| R03 | Verificación válida sin Ganada solicitada. | verification without won requested preserves commercial state | PASS |
| R04 | Verificación válida + Ganada atómica. | verified Acceptance + exact won/history/result T02 | PASS |
| R05 | Falta aceptante/contexto/facultad: revisión/bloqueo. | missing each identity/faculty/context guard stays pending | PASS |
| R06 | Versión/Proposal/Opportunity incorrectos: bloqueo. | each incorrect commercial relation rejects atomically | PASS |
| R07 | Términos distintos: bloqueo. | different exact terms cannot register | PASS |
| R08 | Selección distinta: bloqueo. | verification cannot replace registered selection | PASS |
| R09 | Evidencia ambigua/candidate: bloqueo. | ambiguous evidence cannot verify | PASS |
| R10 | Fuera de vigencia sin revisión previa: pendiente. | outside effective material expiry cannot verify | PASS |
| R11 | Registro tardío con acto vigente acreditado: válido. | late recording preserves real act within validity | PASS |
| R12 | Registro tardío sin prueba temporal: pendiente. | missing evidence of real act time blocks | PASS |
| R13 | Selección A: B intacta. | selection A leaves B neither accepted nor rejected | PASS |
| R14 | Parte no seleccionable: nueva versión pendiente. | nonselectable request needs new version before Acceptance | PASS |
| R15 | Llamada exacta autorizada sin escrito: válida. | exact phone act requires no fictitious Communication | PASS |
| R16 | Llamada insuficiente: pendiente. | insufficient phone cannot verify | PASS |
| R17 | Anticipo exacto como evidencia: sin Payment. | advance unequivocally linked is evidence without Payment | PASS |
| R18 | Human Approval no sustituye cliente. | Human Approval cannot replace client | PASS |
| R19 | Leído/envío/silencio no aceptación. | sent/read/silence/supposed payment/provider are not agreement | PASS |
| R20 | Aceptante distinto de pagador e interlocutor posterior. | changing Primary Contact preserves earlier accepter | PASS |
| R21 | Reactivación/aceptación antigua no Ganada ordinaria. | ordinary win with historical or claimed acceptance blocked | PASS |
| R22 | Versión sustituida: contenido/cobertura revisados antes de nuevo compromiso. | replaced version cannot silently verify as current | PASS |
| R23 | Versión rechazada: revisión actual obligatoria. | rejected coverage cannot verify without review | PASS |
| R24 | Revalidación posterior no acredita acto anterior. | later revalidation cannot rescue an earlier expired act | PASS |
| R25 | Escritura directa Ganada rechazada. | direct ordinary Ganada write denied; DB guard too | PASS |
| R26 | Acceptance/Version/verificación/historia inmutables. | direct editing/deleting historical facts denied | PASS |
| R27 | Rectificación conserva original y reevaluación explícita. | rectification preserves original and historical verification; reeval explicit | PASS |
| R28 | Rectificación sin motivo/evidencia/revisión: bloqueo. | every material rectification guard required | PASS |
| R29 | Cambio de opinión no rectificación. | opinion change is not an error | PASS |
| R30 | Replay equivalente tras respuesta perdida. | lost response replay recovers persisted result without second effect | PASS |
| R31 | Misma clave cambiado: conflicto. | changed replay conflicts and preserves every fact | PASS |
| R32 | Carrera de verificaciones y Ganada. | concurrent verifications in both dispatch orders | PASS |
| R33 | Carrera aceptación/nueva versión: revisión/conflicto. | new version and stale verification serialize without overwrite | PASS |
| R34 | Fallo previo: rollback integral. | pre-write fault rolls back all T02 effects | PASS |
| R35 | Fallo tardío/historia: rollback integral. | late history fault rolls back verification/Ganada/result | PASS |
| R36 | Administrador autorizado y observador independiente. | authorized administrator and independent observer see exact chain | PASS |
| R37 | Sin contexto. | missing auth/context cannot write | PASS |
| R38 | Contexto falsificado. | forged context and signature reject from direct SQL | PASS |
| R39 | Actor inhabilitado/no provisionado. | disabled/unprovisioned actor denied including replay | PASS |
| R40 | Rol ordinario/ACL/RLS/direct SQL. | minimal ACL/FORCE RLS/ordinary roles and successful direct authorized SQL | PASS |
| R41 | Migración sobre predecesor con fixtures. | upgrade retains all prior H0/H1/H2 persisted fixtures | PASS |
| R42 | Migración vacía cadena completa. | empty database installs full chain through new migration | PASS |
| R43 | H1 identidad/códigos/contextos/historia conservados. | old IDs, human OP/PR codes and contexts remain retained | PASS |
| R44 | B07 hechos/evidencia separados y conservados. | B07 records/links/Tasks immutable during Acceptance | PASS |
| R45 | Ningún efecto Booking/económico/operativo/external. | no forbidden future/economic/operational effects from actual paths | PASS |
| R46 | Caducidad posterior no desacepta acuerdo histórico. | historical agreement not revoked by later expired evaluation | PASS |
| R47 | Revalidación material previa acreditada para acto exacto tras caducidad permite verificar, conserva emisión/vencimiento; pruebas revisadas con momento anterior al acto y vínculo H2-005. | prior material revalidation for exact expired act permits verification | PASS |
| R48 | Cada prueba material de precios/disponibilidad/condiciones/capacidad retirada bloquea sin efectos. | every material review guard independently withdrawn | PASS |
| R49 | WhatsApp/email/formulario/web exactos con Communication atribuible permiten verificar; distinto canal/aceptante/versión/cobertura/momento bloquea. | exact received multichannel agreement; each Communication guard | PASS |
| R50 | Aceptación total de versión conserva términos exactos. | total acceptance retains exact immutable terms | PASS |
| R51 | Authority/designación ajena o posterior al acto permanece pendiente; pagador no sustituye aceptante. | wrong identity/faculty is not client acceptance | PASS |
| R52 | Ganada exige origen comercial activo. | lost/paused origin cannot become won from ordinary verification | PASS |
| R53 | Revisión optimista no admite null/string, firma directa SQL incluido. | null/string revision attempts direct SQL rejected atomically | PASS |
| R54 | Migración conserva ACL/functions/policies anteriores salvo incorporación puntual de la guarda Ganada. | historical migration source bytes and ACL preserved | PASS |
| R55 | Dos sesiones autorizadas concurrentes contra la misma raíz reconocen un resultado o conflicto sin efectos incompatibles. | two authorized sessions concurrently verify same root | PASS |
| R56 | Integración H2-005: rechazar alcance ya aceptado válidamente no es SM-PV-08; intento se rechaza atómicamente. B aún no aceptada sigue rechazable mediante sus propias pruebas, conservando Acceptance A. | actual H2-005 rejection cannot affect accepted A but B remains independent | PASS |
| R57 | Verificación válida sin Ganada inicial permite solicitar evaluación comercial/Ganada posteriormente sobre el mismo hecho exacto; no crear segunda Acceptance ni editar la verificación anterior. Nueva actuación conserva resultados previos. | later requested Ganada preserves the initial verification and same Acceptance | PASS |
| R58 | V-AT: fijación de nueva versión y verificación/Ganada concurrentes en ambos órdenes: exactamente una unidad compatible y conflicto de la otra, sin overwrite. | actual fix/verify concurrency in both dispatch orders | PASS |
| R59 | SM-AC-03 también rectifica Acceptance registrada no verificada; conserva original y no inventa Ganada anterior. | rectification of unverified registration preserves original | PASS |
| R60 | SM-PV-07 selección de línea expresamente independiente/seleccionable: Acceptance identifica únicamente esa línea, no toda modalidad. | expressly selectable line preserves exact partial scope | PASS |
| R61 | Integración AC-002/SPEC-FR-ID-002: Organization con dos interlocutores verificables y pagador contextual no participante, cambio Primary Contact después de Acceptance conserva aceptante/designación anterior y no concede permisos internos. | Organization/context payer/nonparticipant and changed interlocutor preserve Acceptance | PASS |
| R62 | Designación real H1 de payer, aun con prueba candidata favorable, no sustituye a Primary Contact facultado para aceptar; conserva candidato y cero Acceptance válida. | actual verified H1 payer designation cannot act as accepter authority | PASS |

## Comprobación final de publicación

`coordination-check.json`: PASS;125 fichas comparadas, solo H2-007/008 modificadas;80 tareas posteriores NOT STARTED. Tasks §§6–7, fuentes APPROVED y28 migraciones anteriores intactas. Producto y ensayos sin cambios frente al commit probado800de95. `git diff --check` y `git diff d333f140abf63b900b7e6ffbfdcfc4869575cca5 --check`: PASS. Fetch previo confirma origin/main todavía en la base autorizada. Hashes de todos los originales comprimidos: PASS.
