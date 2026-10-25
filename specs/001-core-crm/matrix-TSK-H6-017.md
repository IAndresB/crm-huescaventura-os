# Matriz observada — TSK-H6-017 local/aislado

35 asignaciones reconstruidas literalmente; 24/24 focales nuevas PASS; 74 PASS y 1 SKIP histórico en regresión dirigida; 10/10 contrapruebas independientes PASS. Dictamen final del candidato pendiente.

La [matriz JSON](../../tests/fixtures/h6-017/normative/matrix-observed-v1.json) contiene por fila fuente/criterio literal, escenarios, precondiciones, actor/ámbito, datos, acción, resultado esperado/observado, instrumento y prueba independiente. El [expected original](expected-TSK-H6-017.md) y sus hashes permanecen íntegros.

| Asignación | Casos funcionales observados | Contrapruebas originales | Resultado funcional |
|---|---|---|---|
| SPEC-FR-ID-004 | F02, F15 | AUD05, AUD09 | PASS local |
| SPEC-FR-PROP-003 | F01 | AUD01 | PASS local |
| SPEC-FR-ECON-014 | F13, F16 | AUD10 | PASS local |
| SPEC-FR-HA-005 | F10 | AUD02, AUD06 | PASS local |
| SPEC-FR-SEC-002 | F02, F12 | AUD02, AUD03 | PASS local |
| SPEC-FR-SEC-003 | F01, F03, F18 | AUD01, AUD07 | PASS local |
| SPEC-FR-SEC-005 | F05, F06, F07, F08, F12, F17 | AUD02, AUD03, AUD04, AUD07 | PASS local |
| SPEC-FR-SEC-006 | F01, F03, F04, F15 | AUD05, AUD09 | PASS local |
| SPEC-FR-SEC-007 | F09, F13, F18 | AUD06, AUD10 | PASS local |
| SPEC-FR-INT-002 | F11 | AUD08 | PASS local |
| AC-011 | F01 | AUD01 | PASS local |
| AC-056 | F10, F13, F18 | AUD06 | PASS local |
| AC-065 | F01, F03, F18 | AUD01 | PASS local |
| AC-078 | F09, F13, F18 | AUD06, AUD10 | PASS local |
| AC-079 | F14, F17 | AUTH | PASS local |
| AC-082 | F05, F07, F08, F11 | AUD04, AUD07, AUD08 | PASS local |
| AC-088 | F04 | AUD05 | PASS local |
| SPEC-NFR-002 | F02, F05, F06, F12 | AUD02, AUD03, AUD04 | PASS local |
| SPEC-NFR-003 | F03, F04, F15 | AUD05, AUD09 | PASS local |
| SPEC-NFR-004 | F14, F17 | AUTH | PASS local |
| DM-INV-025 | F01 | AUD01 | PASS local |
| DM-INV-050 | F02 | AUD02, AUD03 | PASS local |
| DM-INV-052 | F09, F13, F16, F18 | AUD06, AUD10 | PASS local |
| SM-FORB-22 | F10, F18 | AUD06 | PASS local |
| SM-FORB-29 | F01, F02 | AUD01, AUD02 | PASS local |
| ARCH-DEC-008 | F11 | AUD08 | PASS local |
| P10 | F02, F04, F05, F06, F07, F12 | AUD02, AUD03, AUD04, AUD05 | PASS local |
| P11 | F01 | AUD01 | PASS local |
| P12 | F08, F14 | AUD07 | PASS local |
| P16 | F09, F10, F13, F16, F18 | AUD06, AUD10 | PASS local |
| PLAN-B10 | F08 | AUD07 | PASS local |
| PT-11 | F08, F14 | AUD02, AUD03, AUD04, AUD06, AUD07, AUD08 | PASS local |
| G1 | F02, F03, F15 | AUD02, AUD09 | PASS local |
| D007 | F11 | AUD08 | PASS local |
| D008 | F09 | AUD06, AUD10 | PASS local |

ARCH-DEC-008/D007 se acreditan además por inspección del árbol y contrato de entrada pública limitada. PLAN-B10 incluye trazabilidad, pruebas, revisión de candidato e integridad; no readiness Production. AC-079/NFR-004 incluyen recursos propios/loopback, preflight negativo sin red y ausencia de secretos por configuración. PT-11 se limita al ámbito local de H6-017; las comprobaciones de acceso real compartidas con H6-009/010/011 no quedan satisfechas automáticamente.

El SKIP histórico H6-008 S10 se conserva como tal. La auditoría ha ejecutado Auth oficial real por separado con contraseña y TOTP, sin cambiar el histórico. Todos los FAIL previos y sucesores se conservan. H6 global IN PROGRESS.
