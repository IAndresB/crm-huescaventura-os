# TSK-H5-018 — matriz normativa independiente y resultados

**FAIL local/aislado; pendiente de correctivo y aceptación.** Esperado previo: [expected-TSK-H5-018.md](expected-TSK-H5-018.md), SHA256 `d93d2046681681be23384a30e3a70df994319632270ef78f40166dd8a8c1e77c`. Sus bytes no se han modificado. Extracción literal de las **13 filas** de Tasks §6: `tests/fixtures/h5-018/normative-rows.json`. La ficha H5-018 y sus B01/B07/B08/B10, C01/C04, protocolos §2.2 y pendientes §7 completan el alcance. No hay transiciones de §6.4 asignadas directamente; SM-FORB-27 sí se comprueba.

| Fila de Tasks §6 | Fuente directa / resultado exigido | Casos del esperado | Resultado observado y límites |
|---|---|---|---|
| SPEC-FR-HIST-001 | SPEC §14: actor, fuente, antes/después, momentos y corrección sin inventar secuencia | A10/A16/A18 | Historia y dos versiones/aprobaciones localizadas, originales preservados; F02 impide afirmar integridad de toda relación diagnóstica. |
| SPEC-FR-ERR-001 | SPEC §19: causas coexistentes, alcance, estado conocido y continuidad | A01–A09 | Ocho escenarios y E4+E6 distinguidos en contrato directo; F03 falla en composición conservada. |
| AC-070 | SPEC §24.4: fallo persistente y aviso CRM aunque WhatsApp falle, revisión/detención, sin recursión/email | A13 | PASS: dos notificaciones CRM visible/WhatsApp unavailable, detención bloquea claim, lectura no crea alertas. |
| AC-072 | SPEC §24.4: ocho causas, excepción desconocida sigue E4 | A01–A09 | E1–E8 directos PASS; F03 FAIL reproducido, E5 definitivo con efecto desconocido. |
| AC-081 | SPEC §24.4: recorrer alcance/intento/historia/aprobación/resultado con acceso autorizado y mínimo contenido | A10/A11/A14/A16 | Enlaces y paginación usual PASS; F01/F02 FAIL. Canarios de cuerpos/secretos no filtrados por caminos probados. |
| SPEC-NFR-009 | SPEC §25: autoría, motivo, momentos, versiones y evidencia | A10/A11/A18 | Dos versiones/aprobadores y fuentes recuperables; F01/F02 comprometen el contexto de la investigación. |
| SPEC-NFR-010 | SPEC §25: jobs, intentos, errores, pendientes, incertidumbre, logs minimizados | A04/A10/A12/A13/A14 | Incompletos/antigüedad/lease y avisos PASS; F03 impide acreditar incertidumbre integral; F01 expone metadatos fuera de contexto. |
| SPEC-NFR-014 | SPEC §25: fallos diferenciados, recuperación segura, no retry por timeout | A04/A09/A12 | Sin retry en envoltura; F03 FAIL. Regresión H5-008 sobre64 reutilizada con inputs acreditados. |
| DM-INV-047 | DM §14: procedencia/actores distintos, timeline no amplía permisos | A10/A11 | Actores/ejecutor y versiones PASS; F01/F02 abiertos. |
| SM-FORB-27 | SM §17: incierto no se convierte en éxito/reintento sin comprobar efecto | A04/A09/A16 | Sin repetición ni hechos por accepted técnico; F03 pierde incertidumbre. No se demostró un retry externo real, que no se ejecutó. |
| P12 | Constitución: secretos fuera de Git/logs | A14/A18 | Canarios sintéticos ausentes de salida, sink, error, persistencia y log PG inspeccionado; ningún secreto real utilizado. |
| PLAN-B08 | Plan §4/8: supervisión, versiones, intentos, permisos, recuperación | A10/A12/A13 | Versiones/HA/intentos/estado conservados; lectura no recupera ni ejecuta. Integración general F03 pendiente. |
| PT-11 | Plan §10.2: seguridad, exposición, incertidumbre y límites | A11/A14/A15/A17/A20 | Denegación roles/Auth/MFA y migración PASS; aislamiento de contexto F01 FAIL. No auditoría H6-017 ni Auth Hosted. |

## Comprobaciones adicionales exigidas por la ficha

| Protocolo / contrato | Ejecución independiente | Dictamen |
|---|---|---|
| V-DOM | C01 guardas; C04 insuficiencia; C05 intención/incertidumbre; composición, versiones, coexistencia, no efectos por accepted | FAIL por F02/F03; no falsea los PASS parciales. |
| V-DAT | PostgreSQL17.11 real; runtime ordinario, consultas de originales, scopes/tipos, roles API/TTE, MFA, actor revocado, RLS/FORCE RLS, replay/inmutabilidad | FAIL por F01/F02; controles de acceso no afectados PASS. |
| V-MIG | Fresh64, populated63→64, fallo antes de commit/rollback/reintento, roles creados después, comparativa171 tablas/297 funciones/330 políticas | PASS, captura04. Conserva contenido y ACL/owners/config de objetos previos. |
| V-NEG | Contexto falso, referencia ajena, excepción después del efecto, rechazo de rol y credenciales, technical accepted | F01/F02/F03 reproducidos; resto PASS. |
| PLAN-C01/C04 | Lectura mínima y original reautorizado; no evidencia verificada por adjuntar ni hechos por logs | F01/F02 impiden aceptación integral. |
| V-EVI / preservación | Sello candidato, esperado previo, entradas por ejecución, originales FAIL, hashes y recuperación de copias | PASS después de corregir T01/T02 del auditor. |

## E1–E8: definición y estímulo separados del enumerado

Las definiciones se toman literalmente de SPEC §19; los tests nuevos no importan el listado `errorCodes` para fabricar ocho PASS.

| Causa | Definición normativa | Estímulo / resultado |
|---|---|---|
| E1 | Rechazo por guardas/permisos | C01 con G1 ausente no invoca el puerto; revisión legítima localiza unchanged/correct-or-review. Pruebas separadas deniegan Auth/MFA/contexto falso. |
| E2 | Conflicto de concurrencia/versión | Dos recibos B09 contradictorios conservados; G6 conflicting bloquea C01; conflicting/reevaluate-current-state. |
| E3 | Pendiente de revisión por insuficiencia | C04 sin verificación válida no registra; evidencia independiente sigue consultable; pending/supply-required-evidence. |
| E4 | Resultado incierto tras intento | C05 uncertain y excepción directa después de efecto durable conservan pending/reconcile-before-retry; F03 en composición heredada. |
| E5 | Error técnico confirmado | Falla resolución antes del callback: cero efectos; unchanged/retry-only-if-safe. Se diferencia del caso posterior al efecto. |
| E6 | Dependencia externa no disponible | C05 solo conserva intención; no hay entrega, pending/restore-dependency; coexistencia con E4 conservada. |
| E7 | Dato ambiguo | Derivado candidato B07 con alternativas/original conservados; composición explícita E7, pending/resolve-ambiguity; lectura no promueve dato. |
| E8 | Discrepancia externa | Recibos contradictorios y fuente anterior intacta; composición explícita E8, conflicting/review-discrepancy. |

E7/E8 se ensayan como clasificación aportada por una composición confiable sobre hechos sintéticos reales persistidos; no se acredita un clasificador automático de contenido. E2 y E8 pueden coexistir en la misma contradicción, con causas distintas. Los adaptadores históricos usan resultados específicos de módulo; esta auditoría no inventa un motor semántico nuevo.

## Contadores sin solapamiento

- **32 tests nuevos independientes: 29 PASS / 3 FAIL** =16 de auditoría (14/2), 9 de causas (8/1), 2 de migración corregidos (2/0), 5 controles (5/0). Los controles F02/F03 miden reproducción/orden de composición, no aceptan los fallos.
- Repeticiones confirmatorias `02` (16) y `11` (9) no se suman como casos nuevos. Reproducen los mismos tres FAIL.
- `03` conserva dos FAIL del instrumento de migración; `04` ejecuta las dos mismas pruebas corregidas, no añade dos casos.
- Regresión efectivamente repetida: **29/29 H5-017**, **201/201 unitarias**. **Health1/1 separado**.
- Reutilización histórica acreditada, no reejecutada ni sumada: **2788/2788 completa**, **104/104 sobre64** y frozen install. La completa no contiene estas32 pruebas nuevas.

Dictamen y límites completos en [evidence-TSK-H5-018.md](evidence-TSK-H5-018.md); causas/reproducción en [defects-TSK-H5-018.md](defects-TSK-H5-018.md).
