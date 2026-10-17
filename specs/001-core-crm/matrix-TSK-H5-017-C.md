# H5-017/H5-018 — Bloque C: matriz del candidato corregido

Esperado previo [expected-TSK-H5-017-C.md](expected-TSK-H5-017-C.md), SHA256054ba768cc71a6157ced3d31e2773ae9073fe9b81c23f10fd52506075deac882. La matriz independiente H5-018 y sus13 asignaciones, las10 H5-017 y todos sus expected quedan congelados; esta matriz añade el contraste del correctivo, sin reinterpretarlos.

| Esperado C | Fuentes / asignaciones | Producto o control | Evidencia ejecutada propia |
|---|---|---|---|
| C01 | V-EVI, P06/P07/P18/P19 | Preflight y overlay previos; reproducción intacta |01:25 casos22 PASS/3 FAIL, F01/F02/F03 originales reproducidos. |
| C02/C03 | AC-081, HIST-001, NFR-009/010, DM-INV-047, C01/C04, PT-11 | diagnostic_contexts + diagnostic_canonical_nodes: tipo/UUID y relaciones canónicas, sin nuevos roles | Focal15: caso independiente F01 más fuentes B07/B08/Task/Alert/B09 homónimas y servicio hijo legítimo. |
| C04/C05/C06 | ERR-001, AC-081, NFR-009, P06/P07 | diagnostic_operation_reference, record/read revalidados, estado técnico de procedencia | Focal15: F02 y12 contrapruebas propias en conjunto; operaciones propias/ajenas, referencias aún desconocidas, replay y dos órdenes de persistencia, commit intercalado con dos sesiones. |
| C07/C11 | P10/P11/P12, PT-11, C01/C04 | F1/F2 y checks finales intactos, RLS/FORCE RLS sin privilegios nuevos, helpers privados | Focal15 incluye29 aserciones H5-017 originales sobre65; MAC/actor/sesión/SQL/reauthorización final y canarios. Nuevos helpers denegados a runtime/API/TTE. |
| C08/C09/C10 | ERR-001/002, AC-072, NFR-014, SM-FORB-27, B01/B08 | composeServer conserva E4 antes del catch técnico; explicit E5 y fallos previos conservados | F03 independiente PASS y6 unitarias de composición; previous/conflict/uncertain no invocan el contrato. Consumidores H0 directos intactos. |
| C12 | V-MIG, P13, B10 | Nueva65, dos cuerpos reemplazados con atributos conservados, tres helpers privados; sin tablas nuevas | Focal15:2 tests de migración PASS,175 tablas/302 funciones originales, solo2 cuerpos autorizados cambiados, todas las filas/ACL/RLS conservadas; rollback/retry y advisors sin resultados. |
| C13/C14 | §2.2, AC-070/072/081, B01/B07/B08/B10 | Sucesores de harness y preservación con hash/ruta exactos; suite completa sin duplicar originales | Focal15:68/68 =25 independientes repetidas+29 regresiones+14 propias; dependencias17:104/104; unitarias18:208/208 =201 previas+6 composición+1 guard; health12:1/1 separado. Completa24 registrada aparte. |
| C15 | V-EVI, P06/P07/P12/P18/P19 | Sellos antiguos intocados; transición composition y metadatos de coordinación; inventario nuevo | Verificación final por hashes, archivo original recuperable, pruebas negativas del guard y diff.455 inputs H5-016 idénticos y1 transición explícitamente autorizada. |
| C16 | Tasks §7, P18/P19 | Sintéticos/local, privacidad pendiente y STOP | No política, dato, servicio de negocio, publicación ni tarea posterior. H5-017/H5-018 IN PROGRESS, nueva auditoría requerida. |

La completa incluye estas pruebas y regresiones solapadamente: no se suman68+104+completa. Las10 asignaciones H5-017 y13 H5-018 mantienen los demás alcances históricos y futuros; esta corrección no acredita globalmente todas las verificaciones de una fuente ni H6.

**Cierre de gates:** completa24:2834/2834 PASS,0 fail/cancelled/skipped y sin cambios de inputs; frozen26/tipos22/lint23/build19/audit20 PASS,health25:1/1. No se suman baterías solapadas. V-DOM/V-DAT/V-MIG del correctivo PASS interno; nueva auditoría independiente pendiente.

## Asignación de las13 filas H5-018 al correctivo

HIST-001 → C02–C06/C12/C15. ERR-001 → C04–C10. AC-070 → regresión de avisos/detención conservada en los25 repetidos y dependencias H5-008. AC-072 → ocho causas repetidas y F03. AC-081 → tipos/referencias/procedencia/minimización. NFR-009 → relaciones y conservación. NFR-010 → intentos/incompletos y logs sin contenido. NFR-014 → incertidumbre sin retry. DM-INV-047 → identidad/actor/historia y límites de contexto. SM-FORB-27 → E4 sin fracaso/éxito/repetición. P12 → canarios y ausencia de secretos reales. PLAN-B08 → versiones/aprobación/ejecución independientes. PT-11 → accesos negativos, F1/F2, migración y confidencialidad.

La evidencia final distingue candidato original FAIL, pruebas propias y candidato corregido preparado para nueva auditoría cuando todos sus gates estén acreditados.
