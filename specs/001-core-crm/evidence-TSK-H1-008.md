# TSK-H1-008 — matriz formal independiente previa

Expected fijado desde las fuentes APPROVED antes de inspeccionar assertions de H1-007. Fuentes: Tasks H1-008/§§6–7; Plan §§5.1–5.2; SPEC FR-CAT-004/005/007, FR-HIST-002, AC-010/085; D019/D023/D028/D029; BR y DM citados en evidencia H1-007. Cada fila se evalúa desde cero, sin heredar PASS focal.

| Fila | Expected a intentar falsar |
| --- | --- |
| R01 | Tariff con identidad y revisiones inmutables; fuente, vigencia, estado de importe y fiscalidad explícitos. |
| R02 | Cambiar Tariff no modifica referencia aplicada; coste hotelero desconocido bloquea precio definitivo dependiente. |
| R03 | Pack/composición versionados; personalización sin maestro y promoción manual conservan procedencia/historia. |
| R04 | Promotion Version de única política automática aprobada; sin modalidad/elegibilidad material no hay efecto definitivo. |
| R05 | Capacidad conocida/desconocida y elegibilidad conocida/desconocida no se convierten en disponibilidad, confirmación ni autorización por recomendación. |
| R06 | Requisito/documentación por finalidad no acredita recepción/revisión; solo lo imprescindible bloquea su parte. |
| R07 | Unidad y tratamiento fiscal desconocidos bloquean únicamente cálculo dependiente; no importes supuestos ni motor H1-009. |
| R08 | Aplicación histórica conserva versiones, catálogo vinculado, fuente y vigencia tras revisiones posteriores; lectura de conexión independiente. |
| R09 | Carrera de versión: un ganador; replay idéntico inerte y material distinto denegado; fallo inyectado revierte todo. |
| R10 | Cross-scope, sesión/generación anterior, acceso directo runtime/PUBLIC/anon/authenticated y SQL no firmado se deniegan. |
| R11 | Migración conserva H1-001–006 y la regresión H0/H1 previa permanece PASS. |

Estado inicial: NO EJECUTADA. BR-PENDING-022 y datos reales ausentes conservan sus puertas localizadas; no se les atribuye valor sintético fuera de pruebas.

## Verificación independiente

Base PostgreSQL efímera nueva, nuevo actor/sesión/claves y conexión separada para lectura de persistencia. Expected original arriba; assertions implementadas después. V-DOM + V-DAT + V-MIG en `tests/integration/postgres-h1-008.test.ts`.

| Filas | Observado | Resultado |
| --- | --- | --- |
| R01–R02 | Tariff desconocida sin importe; nueva revisión confirmada y revisión real conservan estados distintos. Fuente, vigencia y catálogo exactos; coste/IVA inciertos bloquean solo precio definitivo dependiente. | PASS |
| R03 | `custom_pack` existe sin master; promoción manual deja vínculo a revisión origen; cambio posterior de ambos no altera aplicación anterior. | PASS |
| R04 | Promotion conserva versión/condiciones aprobadas; otra política se rechaza. Sin modalidad o elegibilidad objetiva no hay aplicabilidad C02. | PASS |
| R05 | Capacidad/eligibilidad desconocidas no pasan el guard; capacidad negativa se rechaza. Capacidad estructural suficiente no sustituye disponibilidad temporal verificada. | PASS |
| R06 | Requisito documental esencial configurado aparece en snapshot, pero no como recibido/revisado; guard deniega falta de documento. | PASS |
| R07 | Tarifa/coste estimados, fiscalidad no verificada y unidad ausente bloquean solo dependencia material, sin cálculo económico. | PASS |
| R08 | Siete revisiones aplicadas permanecen idénticas tras nuevas versiones; leídas desde conexión independiente. | PASS |
| R09 | Carrera de versiones con un ganador, replay idéntico inerte, material distinto rechazado y fallo de historia con rollback íntegro. | PASS |
| R10 | Scope ajeno, runtime/anon/authenticated directos y sesión revocada/generación antigua denegados. | PASS |
| R11 | Identidad y revisión H1-005 previas conservadas al migrar; regresión acumulada se registra al cerrar gates. | PASS |

### Defectos materiales H1-008-Fxx

| ID | Fuente, expected y observed | Reproducer y materialidad | Corrección y reverificación |
| --- | --- | --- | --- |
| H1-008-F01 | SPEC-FR-CAT-004 y BR-ECON-001: previsto/confirmado/real distintos. Antes, `price_state` y `cost_state` solo admitían `unknown`, `estimated`, `verified`; `real` se rechazaba y confirmado/real colapsaban en `verified`. | Publicar versión Tariff con `price_state: real` producía `COMMERCIAL_DEFINITION_INVALID`; no podía reconstruirse la fase económica. Material. | Validador y C02 distinguen `unknown`/`estimated`/`confirmed`/`real`; el guard solo permite confirmado/real para dato definitivo. Reejecutadas focales y matriz formal completa desde cero: PASS. |
| H1-008-F02 | DM-INV-018 y SPEC-FR-CAT-007: recomendación/promoción no dispensan elegibilidad objetiva. Antes, `assessApprovedPromotion` podía devolver `applicable: true` con composición y modalidad válidas sin recibir un hecho de elegibilidad objetiva. | Pasar despedida, 15 asistentes, composición y modalidad completas sin aportar elegibilidad objetiva dejaba vía a aplicar la promoción. Material. | C02 exige `objectiveEligibility: verified_eligible`; desconocido o inelegible bloquea. Pruebas unitarias y matriz formal completa desde cero: PASS. |
| H1-008-F03 | DM-INV-018 y BR-PAX-005: capacidad configurada no acredita disponibilidad temporal. Antes, `assessDependentAction` no recibía un hecho de disponibilidad y podía devolver `allowed: true` con capacidad suficiente. | Con todos los demás datos satisfechos y capacidad suficiente, una acción dependiente de disponibilidad desconocida carecía de bloqueo específico. Material para compromiso operativo. | C02 exige `availabilityNeeded` y, cuando es verdadero, `verified_available`; `unknown`/`unavailable` bloquean. Prueba unitaria nueva y matriz formal completa desde cero: PASS. |
| H1-008-F04 | Tasks §2.2 V-MIG/P13: migración forward-only debe aplicar sobre bases H0/H1 previas compatibles. En la primera regresión acumulada, H0-017 R10 falló con `role "anon" does not exist`. | La migración ejecutaba `REVOKE ... FROM anon, authenticated` aun cuando una fixture histórica H0 no creó esos roles. Bloqueaba actualización compatible y rompía la regresión. Material. | `REVOKE` de PUBLIC/runtime permanece siempre; roles Data API se revocan solo si existen. Reejecutado H0-017 R01–R11 y H1-007/008 focal/formal: 14/14 PASS; suite acumulada completa se registra al cerrar gates. |

Resultado formal tras correcciones: R01–R11 11/11 PASS, 2/2 pruebas PostgreSQL formales PASS. Los FAIL anteriores se conservan arriba; no se heredó PASS de H1-007. La obligación de integrar el efecto económico definitivo y propuestas reales corresponde a sus tareas posteriores, no a este ensayo estructural.

Regresión acumulada definitiva tras F04: `pnpm run test:postgres` 299/299 PASS, con H0/H1 anteriores y H1-007/008. `pnpm test` 36/36 PASS; typecheck, lint/boundaries, build, audit de producción y diff check PASS. La primera regresión fallida y sus condiciones permanecen documentadas en F04. Toda la matriz R01–R11 se reejecutó desde una base PostgreSQL efímera nueva tras las correcciones; no hay aceptación hosted, datos comerciales reales ni cálculo monetario H1-009.
