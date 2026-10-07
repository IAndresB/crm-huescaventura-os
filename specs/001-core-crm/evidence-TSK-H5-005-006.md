# Evidencia local — TSK-H5-005/006, checkpoint incompleto

Fecha: 2026-10-08. Exclusivamente Mac Local, PostgreSQL17.11 y Storage privado aislados/loopback, datos sintéticos. **Aceptación del bloque: FAIL por gate audit. TSK-H5-005/006 IN PROGRESS, no COMPLETED.** H5 sigue IN PROGRESS. No cierre ni publicación del producto mientras F10 permanezca OPEN.

[Expected independiente](expected-TSK-H5-005-006.md), [matriz57 casos/33 filas](matrix-TSK-H5-006.md), [FAIL originales y correctivos](defects-TSK-H5-006.md), [manifest de ejecución](../../tests/fixtures/h5-006/verification.json).

## Cadena Git y preflight

Preflight realizado antes de modificar archivos: `git fetch origin`, rama main, HEAD y origin/main exactamente `7eac0d27b6b74331868a14bbc4ca967f8d2f6bb9`, divergencia0/0 y árbol limpio. Evidencia de la comprobación en el registro de herramientas de esta ejecución; no se inventa log previo.

| Etapa | SHA | Alcance |
|---|---|---|
| Base autorizada | `7eac0d27b6b74331868a14bbc4ca967f8d2f6bb9` | Cierre H5-003/004; SHA previo probado4ac610910c43bb80e8ead4a6fbdba10f9cf647cb |
| Expected independiente publicado | `b14396627cbadfc4a99dd3b158b47c3562d3f08f` | docs: freeze independent expected for H5-005/006 |
| Producto/verificador/correctivo local | `3aa7dc2686d8ff933b4c1792c1200b9af33879db` | feat: add local communication composition and synthetic derived review |
| Producto/verificador/correctivo local | `318e3ed56f04791c43e56988f1869eaa75d5d310` | fix: disambiguate communication queries and extend independent verifier |
| Producto/verificador/correctivo local | `5e4bb7970461f1c00e88c36e0e7face588e29fa0` | fix: reopen existing review Task for new material discrepancy |
| Producto/verificador/correctivo local | `210b620df5b33a205e6bc670f98c32a70a41d2b5` | test: freeze H5 communication boundary counterexamples |
| Producto/verificador/correctivo local | `b944e55324abf17e9eec883413811f350aaf8740` | fix: preserve H1 facts and exact preparation approval boundaries |
| Producto/verificador/correctivo local | `86f90461adcfe606fb4a525b12ee1e9fd8456768` | fix: require matching HA part and verify object metadata failure |

Expected publicado por push normal antes de producto; origin/main comprobado entonces en `b14396627cbadfc4a99dd3b158b47c3562d3f08f`,0/0. Archivo22889 bytes y SHA256 `ff777aa0a490e0293f9a12a462fcbab389253edbd2925c1a1e2bdf2ac5f092a4`; bytes conservados. [Hashes](../../tests/fixtures/h5-006/file-preservation.json).

**Último SHA ejecutado: `86f90461adcfe606fb4a525b12ee1e9fd8456768`.** Sobre él pasan la regresión y gates funcionales, pero audit producción falla. No existe un SHA con aceptación global definitiva PASS. Los cambios posteriores de este checkpoint son únicamente documentación/evidencia/fixtures; no se atribuyen pruebas a su SHA. Cierre final COMPLETED: inexistente. HEAD y main antes de checkpoint=`86f90461adcfe606fb4a525b12ee1e9fd8456768`; origin/main=`b14396627cbadfc4a99dd3b158b47c3562d3f08f`,6/0. El commit que contiene este checkpoint añade solo documentación/evidencia; el estado Git final exacto se informa al usuario tras comprobarlo. [Cadena capturada](../../tests/fixtures/h5-006/git-chain-before-checkpoint.json).

## Implementación mínima y archivos

- `src/domain/communication-review.ts`: contrato/validación de composición, derivados y hechos sintéticos; rechaza campos de audio, consentimiento, retención, ejecución IA/envío externo y efectos inferidos.
- `src/infrastructure/postgres/h5-communication-adapter.ts`: F1/F2 actuales y material exacto para Human Approval existente; no sistema paralelo.
- `supabase/migrations/20261007230734_h5_communication_review.sql`: migración55 forward-only. Tabla suplementaria B07 y funciones composition/read; originales/derivados/hechos/historia/Task reutilizan H1/H5. Guarda adicional sobre hechos de raíces con composición H5 impide bypass de HA; cuerpos previos intactos.
- `tests/support/h5-communication-isolated.ts`, `tests/integration/postgres-h5-006.test.ts`, `tests/integration/postgres-h5-006-migration.test.ts`: fixture local y38 pruebasPostgreSQL nuevas únicas.
- `tests/communication-review.test.ts`:4 unitarias nuevas.
- `tests/integration/postgres-h5-004-migration.test.ts`: única adaptación histórica, contador54 limitado a su frontera temporal de migración; no modifica contratos de negocio ni omite aserción.
- `scripts/verify-h5-006-evidence.mjs`: auditor de cierre estricto; rechaza correctamente el cierre actual por audit exit1.
- Documentación: expected,matriz,defectos,este informe,coordinación en Tasks/NEXT-STEPS/PROJECT-STATUS y fixtures de evidencia. [Inventario del diff](../../tests/fixtures/h5-006/changed-files-before-checkpoint.txt).

Migraciones: **54 anteriores +1 nueva=55**. Las54 históricas byte exactas. Fresh55 y upgrade54 poblado, fallo DDL/rollback/retry, datos previos, OID/owner/ACL/RLS/FORCE RLS, políticas, roles y cuerpos previos verificados. [V-MIG](../../tests/fixtures/h5-006/definitive/vmig.json). Storage privado permanece.

## Resultados y contadores sin doble cómputo

| Gate sobre 86f90461adcfe606fb4a525b12ee1e9fd8456768 | Resultado | Evidencia |
|---|---|---|
| Focales PostgreSQL | 38/38 PASS | [focal-final.log](../../tests/fixtures/h5-006/focal-final.log) |
| Regresión PostgreSQL | **2370 baseline +38 nuevos=2408/2408 PASS** | [postgres-final.log](../../tests/fixtures/h5-006/postgres-final.log) |
| Unitarias | **146 baseline +4 nuevas=150/150 PASS** | [unit-final.log](../../tests/fixtures/h5-006/unit-final.log) |
| Health independiente | **1/1 PASS, separado** | [health-final.log](../../tests/fixtures/h5-006/health-final.log) |
| Frozen install | PASS | [frozen-final.log](../../tests/fixtures/h5-006/frozen-final.log) |
| Typecheck | PASS | [typecheck-final.log](../../tests/fixtures/h5-006/typecheck-final.log) |
| Lint/import boundaries | PASS | [lint-final.log](../../tests/fixtures/h5-006/lint-final.log) |
| Build | PASS | [build-final.log](../../tests/fixtures/h5-006/build-final.log) |
| Audit producción | **FAIL, exit1, seis vulnerabilidades** | [audit-final.log](../../tests/fixtures/h5-006/audit-final.log) |
| V-MIG/fresh/upgrade/rollback/retry | PASS, incluidos en38 | [vmig.json](../../tests/fixtures/h5-006/definitive/vmig.json) |
| Advisors CLI oficial v2.119.0 | PASS, results=[] contra127.0.0.1 | [advisors.json](../../tests/fixtures/h5-006/definitive/advisors.json) |
| Diff-check | PASS | [diff-final.log](../../tests/fixtures/h5-006/diff-final.log) |
| Preservación | PASS | [preservation.json](../../tests/fixtures/h5-006/definitive/preservation.json) |
| Auditor de evidencia | **FAIL esperado por mismo F10**, no nuevo defecto | [evidence-auditor-blocked.log](../../tests/fixtures/h5-006/evidence-auditor-blocked.log) |

Cada `*-final.status.json` conserva SHA/comando/exit/duración. Cero skipped/cancelled/fail en las suites funcionales definitivas. No sumar57 casos,33 filas,4 intercalaciones,subcasos,retests nihealth a los contadores. Focales38 ya incluidos en2408. V-DOM/V-DAT/V-SM/V-NEG/V-AT/T08: comprobados por focales y regresión; V-EVI documenta también el FAIL de aceptación, sin convertirlo en PASS.

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

## F10 y excepción pendiente

Audit producción detecta Next.js16.3.6: GHSA-cjq9-62q9-8jv4(high),GHSA-3w37-wq28-93x7,GHSA-4jqv-mc3x-m676,GHSA-f87g-xv8r-7p7x,GHSA-mcj8-r9mp-w47p(moderate),GHSA-39w2-rjm5-chcv(low). Corrección publicada16.3.8 según [aviso oficial](https://github.com/advisories/GHSA-cjq9-62q9-8jv4) y [release](https://github.com/vercel/next.js/releases/tag/v16.3.8). Esto es fallo real del gate; no se supone explotación ni se rebaja por entorno local.

[Parche propuesto y NO aplicado](../../tests/fixtures/h5-006/security-proposal/next-16.3.8-proposed.patch): package.json16.3.6→16.3.8; lockfile solo Next/@next asociados. Propuesta generada en carpeta temporal aislada; su auditoría no detecta vulnerabilidades conocidas, pero **no acredita el repositorio ni compatibilidad del parche**.

Tres verificadores históricos exigen bytes idénticos de dependencias: `postgres-h4-018-migration.test.ts` D19, `postgres-h4-019-preservation.test.ts` J22 y `postgres-h4-019-f06.test.ts` A11. [Expected H4-019-F06](expected-TSK-H4-019-F06.md), apartado Atomicidad/migración/cierre, exige dependencias intactas. Se solicitó decisión expresa sobre excepción puntual antes de aplicar parche/ajustar esas comprobaciones. No se modifica ningún expected congelado. F01–F09 corregidos y reprobados; F11 documental (espacios de logs/EOF) corregido preservando bytes de salidas mediante atributo local de evidencia y diff staged PASS. **F10 OPEN** impide COMPLETED y publicación del producto.

## Coordinación y límites

H0 COMPLETED técnico/local/aislado; H1–H4 y H4-001–024 COMPLETED local/aislado conservados; H5-001–004 conservan COMPLETED. **H5-005/006 IN PROGRESS con bloqueo F10; H5 IN PROGRESS; H5-007 en adelante NOT STARTED; H6 NOT STARTED.** No se preparó ni ejecutó ninguna tarea posterior.

NO acreditados: H5-007/008,H5-009/010,H5-011/012,H5-013+,H5-014/AC-058 integral,H6,E2E-06 integral,H6-006/H6-017,IA/PLAUD/audio reales,consentimiento,política de retención,scheduler,envío real,WhatsApp/email/telefonía real,Hosted/Production. Hosted H2/H3 no acreditados; Hosted H4 y Production no autorizados. ARCH-PENDING-001 sigue PENDING.

**STOP antes de cualquier tarea posterior.** Continuidad exclusivamente al hilo de dirección CRM HUESCAVENTURA OS; el bloque actual requiere resolver F10, repetir todos los gates sobre SHA posterior y solo entonces valorar COMPLETED/publicación. Este documento es checkpoint de evidencia, no cierre aprobado.
