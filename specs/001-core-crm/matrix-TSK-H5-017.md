# TSK-H5-017 — Matriz de implementación (Bloque A)

Base: `9649a2773530ea8a43237b4e1f2034f80e34136f`, HEAD/main/origin/main, 0/0, limpio tras fetch. Preflight verifica los 456 inputs H5-016 y conserva hashes de todos los tracked. Fuentes APPROVED prevalecen sobre memoria; encabezados históricos de prepublicación no describen el Git actual. Se autoriza aquí únicamente H5-017 local/aislado; pendiente aceptación y H5-018.

## Asignaciones literales de Tasks §6

| **SPEC-FR-ERR-001** — [spec.md](spec.md), § 19. Errors, Revalidation and Uncertainty | [TSK-H0-003], [TSK-H5-017] | [TSK-H0-004], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-072** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-003], [TSK-H5-017] | [TSK-H0-004], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-081** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H0-009], [TSK-H5-017], [TSK-H5-011] | [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-009** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-009], [TSK-H1-013], [TSK-H5-017] | [TSK-H2-008], [TSK-H4-023], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA.  **Evidencia local H4-023 EJECUTADA:** [matriz28](matrix-TSK-H4-023.md), SHA `f99de8bad495c86021e91730bb69af81f69e44ec`; alcance asignado local, AC-058/H5-014 y E2E-01/H6-001 integrales futuros conservados. |
| **SPEC-NFR-010** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H5-017], [TSK-H5-003] | [TSK-H5-018], [TSK-H5-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-014** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H0-003], [TSK-H5-007], [TSK-H5-009], [TSK-H5-017] | [TSK-H0-004], [TSK-H5-008], [TSK-H5-010], [TSK-H5-018], [TSK-H6-015] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-047** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H0-009], [TSK-H1-013], [TSK-H5-017], [TSK-H5-011] | [TSK-H0-010], [TSK-H1-014], [TSK-H5-018], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **P12** — [constitution.md](../../docs/constitution.md), § P12. Secretos fuera de Git | [TSK-H0-003], [TSK-H5-017], [TSK-H0-015] | [TSK-H0-004], [TSK-H5-018], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B08** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H0-009], [TSK-H0-011], [TSK-H5-007], [TSK-H5-017] | [TSK-H0-010], [TSK-H0-012], [TSK-H5-008], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-11** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H0-003], [TSK-H0-005], [TSK-H0-007], [TSK-H0-013], [TSK-H0-016], [TSK-H1-015], [TSK-H5-017], [TSK-H3-007] | [TSK-H0-004], [TSK-H6-008], [TSK-H6-009], [TSK-H6-010], [TSK-H6-011], [TSK-H0-008], [TSK-H1-016], [TSK-H5-018], [TSK-H3-008], [TSK-H6-017] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |

## Obligación → implementación prevista → prueba prevista → evidencia

| Caso | Requisito y fuente | Implementación prevista | Prueba y esperado |
|---|---|---|---|
| D01 | SPEC §19 ERR-001, AC-072, NFR-014 | Observaciones técnicas mínimas con todas las causas coexistentes; descriptores normativos existentes. | Persistir/localizar E1–E8, alcance, estado conocido y continuidad exactos. |
| D02 | SPEC §19 E4/E5/E6, Plan §8, SM-FORB-27 | Frontera de operación diagnosticada conserva E4 ante excepción sin resultado conocido. | Efecto sintético registrado antes de lanzar excepción, E4 y reconciliar; no reenvío ni fracaso inferido. Fallo conocido sin efecto E5 explícito. |
| D03 | AC-081, DM-INV-047, NFR-009, Plan C01/C04 | Consulta autorizada y paginada relaciona petición/operación/ejecución/evento e historia existente. | Encontrar intentos, aprobación, responsable/ejecutor y referencias de historia/evidencia; ninguna copia de cuerpos. |
| D04 | Plan B08/§11.2, NFR-010 | Consulta de estados existentes de ejecución/partes/intentos, reclamaciones y antigüedad, tareas/alertas/objetos incompletos. | Incertidumbre/pendientes, lease vencida sin umbral ni política nueva; completar trabajo no acredita pago/aceptación/entrega. |
| D05 | P10/P11/P12, PT-11, Plan §6.5/§11.2 | Allowlist cerrada en servidor y SQL, errores constantes, IDs opacos; sin texto libre diagnóstico. | Marcadores confidenciales en datos originales, errores y extras; no aparecen en respuesta, log ni registro. |
| D06 | V-DAT, Plan C01, dependencias H4-024/H5-008/H5-012/H5-016 | F1/F2 transaccionales y revalidación final, rol ordinario mínimo y RLS/FORCE RLS. | Sin contexto, falsificación, SQL directo, polling, actor inhabilitado, sesión revocada y otra raíz/ámbito rechazados. |
| D07 | P07/P13, V-MIG | Migración nueva; observación técnica append-only, sin estado/entidad de negocio nuevos. | Cadena vacía, upgrade63 con datos, rollback provocado/reintento, catálogo/filas previos intactos, DML denegado. |
| D08 | V-EVI/P18/P19 | Capturas originales separadas de retests, hashes de inputs/inventario; candidato IN PROGRESS. | Focal propia, regresión íntegra, unitarias, health independiente, frozen install, lint/typecheck/build/audit. |
| D09 | Tasks §7, DM-PENDING-005, BR-PENDING-014/015/019/020 | Sin política de conservación/eliminación/audio ni parámetros productivos. | Sintéticos y límites explícitos de consulta/prueba; sin proveedores/envíos/Hosted/Production. |

C01/C04 son contratos semánticos, no un permiso nuevo: la consulta devuelve referencias; descargar originales exige el acceso B07 autorizado existente. Logs técnicos no son hechos de negocio. Observaciones rechazadas sin autorización no se atribuyen a un expediente ajeno. No se modifican fuentes aprobadas, expected, migraciones1–63, pruebas ni evidencias históricas. Las guardas protegen también código anterior: se añade superficie H5-017 sin reescribirlo. La frontera H0 técnica existente conserva su contrato; la nueva frontera para operación de negocio usa E4 ante efecto desconocido.

No hay filas V-SM propias asignadas a H5-017; se contraprueban independencia de hechos y SM-FORB-27 en el alcance. H5-018 revisará las nueve obligaciones y las diez asignaciones literales de arriba, sin iniciarse aquí. H6-015/H6-017 no acreditadas.

## Correspondencia de implementación y verificación propia

| Asignación literal | Casos / superficies ejecutados | Resultado local del candidato |
|---|---|---|
| SPEC-FR-ERR-001 | D01 ocho causas y coexistencia; D02 excepción tras efecto y E5 explícito; descriptores unitarios | PASS |
| AC-072 | E1–E8 persistidas/localizadas; estado/continuidad exactos; E4 sin repetición ni fracaso inferido | PASS |
| AC-081 | D03 petición→operación→ejecución/intento/HA/historia/evento; original B07 autorizado; contraprueba de otra raíz | PASS |
| SPEC-NFR-009 | D03 metadatos de procedencia y referencias al antes/después/razón originales; D07 conservación, inmutabilidad y rollback | PASS |
| SPEC-NFR-010 | D04 incompletos/lease/antigüedad, fallo persistente y avisos CRM/WhatsApp no entregado; D05 minimización | PASS |
| SPEC-NFR-014 | D01/D02/D04; ninguna lectura reintenta, libera reserva o convierte registro técnico en resultado de negocio | PASS |
| DM-INV-047 | D03 registra/ejecuta/aprueba/responsable distinguidos; historia y evidencia permanecen en fuentes canónicas con permisos | PASS |
| P12 | D05 marcadores sintéticos rechazados/eliminados de observación, logs, errores y consulta; ningún secreto real utilizado | PASS |
| PLAN-B08 | D03/D04/D06 ejecutan contratos existentes; no cambios de TTE, definición, aprobación o reintentos productivos | PASS |
| PT-11 | D05/D06/D07: falsificación/contexto/actor/ámbito/SQL/MAC/replay/check final, RLS/FORCE RLS y advisors | PASS |

Los32 casos físicos focales cubren estas filas solapadamente; las cuatro unitarias nuevas verifican los descriptores y la frontera. No son diez auditorías independientes ni aceptación global de esos requisitos. D08 se consolida en los recibos de calidad y el informe; D09 conserva todos los bloqueos de Tasks§7. No queda una obligación propia del alcance sin implementación/verificación interna; aceptación, H5-018 y verificación integrada H6-015/H6-017 siguen pendientes.

D07 incluye además la contraprueba de instalación64 antes de existir anon/authenticated y creación posterior sin privilegios. El SQL inicial falla25 casos H0 de la primera completa; el correctivo57/57 y la regresión104/104 tienen recibos separados. Los resultados de la completa inicial siguen siendo FAIL.
