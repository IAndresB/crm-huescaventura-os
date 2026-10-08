# Evidencia H5-005/006 — checkpoint F10/F12 incompleto

**H5-005/006 IN PROGRESS. Sin cierre ni producto publicado.** Next 16.3.6→16.3.8 corrige los seis avisos auditados; audit producción actual 0 avisos. La regresión sobre `9be76f010f27f35e20dd806aafbd6f57f69b9a17` da2404 PASS / 4 FAIL de 2408 por cuatro guardas adicionales de preservación,F12 OPEN. F10 no se cierra formalmente al incumplirse la condición de todos los gatesPASS. STOP humano respetado.

[Correctivo/diagnóstico individual](evidence-TSK-H5-005-006-F10.md), [expected inmutable](expected-TSK-H5-005-006.md), [matriz57/33](matrix-TSK-H5-006.md), [defectos](defects-TSK-H5-006.md), [manifest](../../tests/fixtures/h5-006/verification.json).

## Preflight y cadena Git

Preflight original: fetch, main, HEAD/origin7eac0d27b6b74331868a14bbc4ca967f8d2f6bb9,0/0,árbol limpio. Expected publicado antes de producto enb14396627cbadfc4a99dd3b158b47c3562d3f08f,22.889 bytes,SHA256 ff777aa0a490e0293f9a12a462fcbab389253edbd2925c1a1e2bdf2ac5f092a4 intactos. Preflight correctivo autorizado: HEAD32888cebda0f85f5cc98df5e4d1a1112dd1cb215,origin/mainb14396627cbadfc4a99dd3b158b47c3562d3f08f,main, 7/0, limpio y expected exacto. [Captura](../../tests/fixtures/h5-006/f10/preflight.json).

| Etapa | SHA exacto | Alcance |
|---|---|---|
| Base original autorizada |7eac0d27b6b74331868a14bbc4ca967f8d2f6bb9| Cierre previo; SHA definitivamente probado del bloque anterior4ac610910c43bb80e8ead4a6fbdba10f9cf647cb |
| Commit local | `b14396627cbadfc4a99dd3b158b47c3562d3f08f` | docs: freeze independent expected for H5-005/006 |
| Commit local | `3aa7dc2686d8ff933b4c1792c1200b9af33879db` | feat: add local communication composition and synthetic derived review |
| Commit local | `318e3ed56f04791c43e56988f1869eaa75d5d310` | fix: disambiguate communication queries and extend independent verifier |
| Commit local | `5e4bb7970461f1c00e88c36e0e7face588e29fa0` | fix: reopen existing review Task for new material discrepancy |
| Commit local | `210b620df5b33a205e6bc670f98c32a70a41d2b5` | test: freeze H5 communication boundary counterexamples |
| Commit local | `b944e55324abf17e9eec883413811f350aaf8740` | fix: preserve H1 facts and exact preparation approval boundaries |
| Commit local | `86f90461adcfe606fb4a525b12ee1e9fd8456768` | fix: require matching HA part and verify object metadata failure |
| Commit local | `32888cebda0f85f5cc98df5e4d1a1112dd1cb215` | docs: preserve incomplete H5-005/006 checkpoint and audit blocker |
| Commit local | `9be76f010f27f35e20dd806aafbd6f57f69b9a17` | fix(h5): patch Next security and constrain historical dependency exception |

Último SHA ejecutado `9be76f010f27f35e20dd806aafbd6f57f69b9a17` con FAIL de regresión. **No existe SHA con aceptación global definitivaPASS de este bloque.** Resultados86f90461 no se atribuyen al correctivo. El checkpoint documental posterior añade únicamente docs/evidencia/fixtures; no altera producto/tests/migraciones/permisos/verificador. Antes de ese checkpoint: main/HEAD9be76f01,origin/mainb14396627,8/0; el estado final exacto se comprobará tras guardar evidencia. Cierre COMPLETED: inexistente. No push del producto.

## Parche y verificadores

Dependencias modificadas: solo package.json ypnpm-lock.yaml. Next 16.3.6→16.3.8,familia@next/env/@next/swc,sin otras versiones modificadas,force niupdate masivo. Los seis avisos están identificados individualmente en [F10](evidence-TSK-H5-005-006-F10.md); no quedan avisos conocidos deNext niotros paquetes en audit actual. React/ReactDOM 19.3.0,Node 24.21.0 admitidos por metadata; TypeScript 7.0.2 y resto intactos,compatibilidad typecheck/build/unitPASS.

D19 de postgres-h4-018-migration,J22 de postgres-h4-019-preservation yA11 de postgres-h4-019-f06 adaptados mediante tests/support/h5-006-dependency-preservation.ts. Originales recuperables porGit32888ceb ycopiasexactas; toda ruta ajena a dos dependencias mantiene igualdadbyte estricta. Hashes históricos congelados y hashes actuales exactos del correctivo; modificacionesadicionales rechazadas. Contrapruebas físicas de migración,constitution,health ydeps históricas/corrientesPASS. Scripts verify-h5-006-f10-preservation yverify-h5-006-evidence incluyen los nuevosgates. Las20 pruebas de los tres archivos adaptadosPASS,ya incluidas enregresión.

F12: identificación inicial incompleta; fallan C19 de postgres-h4-021-f23-migration,B68 de postgres-h4-021-migration,postgres-h4-023-migration ypostgres-h4-024. Comparan manifiestos históricos fijados; esos archivos y manifiestos NO modificados. H4-024 también protege los tres verificadores adaptados; no se asume que el primer hash fallido agote las comprobaciones pendientes. [Diagnóstico](../../tests/fixtures/h5-006/f10/f12/diagnosis.json) y [original íntegro](../../tests/fixtures/h5-006/f10/f12/postgres-original.log). Sin corrección/retest deF12 ni ampliación del parche tras STOP.

Cambios funcionales deH5 previos: communication-review.ts,h5-communication-adapter.ts,migración55,fixture y 38 tests PostgreSQL / 4 unitarios; mínimos, reutilizan H1 B07,HA/TTE/D039 y Task H5. El correctivoF10 no cambia src,SQL,permisos ohealth. [Inventarioarchivos](../../tests/fixtures/h5-006/changed-files-before-checkpoint.txt).

Migraciones:54 previas+1=55;54 históricasbyte intactas. F10 conserva también la 55 y 193 archivos funcionales/fuentes/expected exactos respecto 32888ceb. [Preservaciónfuncional](../../tests/fixtures/h5-006/f10/functional-preservation.json). V-MIG fresh55/upgrade 54 poblado,rollback/retry y catálogos/roles/owners/ACL/RLS/FORCE RLSPASS enel SHA nuevo. La preservación global de verificadores NO esPASS por F12.

## Resultados sobre 9be76f010f27f35e20dd806aafbd6f57f69b9a17

| Gate | Resultado |
|---|---|
| PostgreSQL completo | **2370 baseline + 38 nuevos = 2408: 2404 PASS, 4 FAIL**;0 skipped/cancelled |
| Unitarias | **146 baseline + 4 nuevas = 150/150 PASS** |
| Focales H5-005/006 |38/38 PASS,ya incluidos en2408 |
| Tres archivos históricos adaptados |20/20 PASS; retests sin sumar al baseline |
| Contrapruebas físicas de preservación |PASS, separadas de PG/unit |
| Auditoría de producción |PASS, 0 vulnerabilidades conocidas |
| Frozen install / typecheck / lint-import boundaries / build |PASS |
| V-MIG/advisors loopback/RLS/FORCE RLS/concurrencia/idempotencia/T08 focales |PASS,38focales |
| Health independiente |No reejecutado sobre9be76f01 por STOP tras FAIL. Anterior1/1 sobre 86f90461, archivado; no se acredita sobreel SHA nuevo. |
| Auditor final de cierre |No reejecutado tras STOP; anterior rechazo por F10 conservado. Cierre NO autorizado por F12. |
| Diff-check documental |Comprobación de Git/evidencia al guardar checkpoint; no acredita regresión PASS. |

Logs/status finales conservan SHA/comando/exit. Resultados previos en Git 32888ceb y fixtures/f10/pre-corrective. No sumar 57 casos, 33 filas, retests, intercalaciones o health a 2408/150. V-DOM/V-DAT/V-SM/V-NEG/V-AT/T08 focales PASS; V-EVI recoge FAIL global y todos los Fxx. Las capturas actuales son /definitive; los JSON previos fuera no se relabelan. Matriz H5-CAR y H5-CBE FAIL; demás observados locales trazados sin convertirlos en aceptación global.

## Semántica comprobada

1. **Human Approval:** HA/TTE/D039 existentes; contenido,versión,alcance,destinatario,cabecera y parte exactos; actor/momento. Decisión anterior a preparación no autoriza retrospectivamente. Aprobador y ejecutor siguen separados; reserva T08 no acredita envío. Cambio material conserva aprobación histórica y exige preparación/nueva aprobación aplicable. No hay excepción inventada de cambio no material; replay idéntico conserva identidad.
2. **Original/derivados:** original autorizado Document/Evidence, transcripción sintética PLAUD, resumen y nota diferenciados; cada derivado con origen,finalidad,revisión,permisos,autor,momentos,vínculos. Dos contextos autorizados no duplican original/objeto. Resumen no reemplaza original ni prueba negocio. Llamada manual puede ser Evidence sin archivo/audio.
3. **Candidato/confirmado y Review/Task:** confirmado18 permanece; quizá16 conserva origen automático sintético/confianza/procedencia y Review pending. Reutiliza Task existente por causa/campo/contexto, sin duplicar necesidad. Nueva discrepancia material tras cierre reabre la misma Task conservando last_closure. Cerrar Task no confirma candidato. Provider Confirmation real sintética18 y demás hechos H2/H3/H4 antes/después iguales.
4. **Entrante:** recibida directamente vía H1, conserva fuente/autor/momento/alcance/original; work vacío, sin borrador ficticio.
5. **Hechos independientes:** Aprobada≠Enviada; Enviada≠Recibida; Recibida/Leída≠Aceptación; Respuesta≠Acceptance/Provider Confirmation/Modification. Ambigüedad permanece pendiente. Hechos salientes/recepción/lectura/respuesta solo sintéticos explícitos con prueba específica. E3/E4/E6 no se presentan como éxito.
6. **Idempotencia/concurrencia:** mismo material/derivado/extracción reautoriza y reutiliza ID; material/fuente distintos no se colapsan. Sesión revocada/actor deshabilitado bloquean replay. Cuatro intercalaciones PostgreSQL reales, dos sesiones/PID/xid y Lock observados, ambos órdenes equivalente/distinto; una Task equivalente y ninguna discrepancia perdida. [Captura](../../tests/fixtures/h5-006/definitive/concurrency.json).
7. **Autorización:** F1/F2,contexto,actor,finalidad,original,derivado,Review y Task protegidos. Links Contact/Booking no conceden contenido. Runtime/anon/authenticated sin DML directo, FORCE RLS; RLS/ACL/owner preservados. Proyección mínima por finalidad; denegación de contexto/finalidad ajenos.
8. **T08/rollback y objetos:** escritura interna de candidato/Review/Task/historia/operación revierte en cuatro fallos de tabla y deferred COMMIT. HA previa persiste; reserva exacta una vez mediante TTE existente. Fallo objeto/metadata muestra bytes existentes fuera y metadata prepared dentro; no afirma stored ni transacción distribuida. Reintento/reconcile/link produce stored verificable. [Fallo real aislado](../../tests/fixtures/h5-006/definitive/object-metadata-failure.json).
9. **Preservación:** Task H5-001/002,Alert/Notification H5-003/004,D027,HA/TTE/D039,H1 Communication/Evidence/Document,H2 Acceptance/Proposal,H3 economía,H4 realidad operativa,seguridad,idempotencia,historia y Storage privado reejecutados sin alterar producto histórico. Tres archivos de salidas históricas regenerados se archivaron y restauraron byte a byte; no sustituyen originales.
10. **Privacidad:** DM-PENDING-005 y BR-PENDING-014/015/019/020 permanecen abiertos; solo sintéticos. Sin audio,consentimiento inferido,retención universal,anonimización/borrado automático importante ni tratamiento real de datos personales. D016 no autoriza conector PLAUD.

## Inventario exacto de §6

Las33 filas completas, incluidas obligaciones textuales y todas sus asignaciones, se conservan en expected y se contrastan en matriz. IDs:

SPEC-FR-PROP-006, SPEC-FR-HIST-003, SPEC-FR-HIST-005, SPEC-FR-COORD-007, SPEC-FR-SEC-006, SPEC-FR-INT-004, AC-024, AC-087, AC-088, SPEC-NFR-003, DM-INV-045, DM-INV-046, SM-CO-01, SM-CO-02, SM-CO-03, SM-CO-04, SM-CO-05, SM-CO-06, SM-FORB-03, SM-FORB-09, SM-FORB-21, ARCH-DEC-003, P15, PLAN-DEC-005, PLAN-B07, PLAN-C04, PLAN-C05, PT-08, E2E-06, G3, E7, D009, D016.

Pendiente transversal: DM-PENDING-005; BR-PENDING-014/015/019/020. Su fila completa está congelada en expected. E2E-06 se contrasta únicamente en tramo local; no se acredita su integración integral.


## Estado ySTOP

F01–F09 y F11 conservan CLOSED anteriores; F10 técnicamente corregido enaudit peroformalmente OPEN condicionado; F12 OPEN,sin corrección/retest. Los FAIL originales son recuperables. El historial H0 técnico/local/aislado, H1–H4/H4-001–024 y H5-001–004 conserva sus COMPLETED; los cuatro fallos de preservación actual quedan explícitos. H5-005/006 IN PROGRESS; H5 IN PROGRESS; H5-007+ y H6 NOT STARTED.

DM-PENDING-005/BR-PENDING-014/015/019/020 y ARCH-PENDING-001 permanecen abiertos. Solo sintéticos; sin IA/PLAUD/audio/envíos/conectores reales, consentimiento/retención/borrado/anonimización inventados, datos personales reales, scheduler o Hosted/Production. No acreditados H5-007/008,H5-009/010,H5-011/012,H5-013+,H5-014/AC-058 integral,H6,E2E-06 integral,H6-006/H6-017. Hosted H2/H3 no acreditados; Hosted H4/Production no autorizados.

**STOP tras FAIL conforme a la instrucción humana. No publicar producto,ni preparar/ejecutar H5-007/008 o tareas posteriores. Continuidad exclusivamente al hilo de dirección CRM HUESCAVENTURA OS.**
