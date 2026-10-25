# Matriz aceptada — TSK-H6-017 exclusivamente local/aislado

**35/35 asignaciones acreditadas.** Dictamen independiente PASS, 24/24 focales y 11 grupos propios del auditor (10+1), sin defectos materiales abiertos. La [matriz completa JSON](../../tests/fixtures/h6-017/normative/matrix-accepted-v2.json) conserva el criterio literal, fuente/hash, positivo/negativo, precondiciones, actor/ámbito, datos sintéticos, acción, expected/observed, instrumento y prueba independiente por fila.

La matriz observada v1 y su estado pendiente de dictamen permanecen congelados como antecedente técnico. Esta aceptación v2 añade el dictamen final sin cambiar su candidato. Regresión:74 PASS y1 SKIP histórico de75; el SKIP no es PASS. Alcance local: no cierre global de fuentes compartidas ni acceso real/Hosted/Production.

| Asignación | Casos funcionales | Prueba independiente | Resultado |
|---|---|---|---|
| SPEC-FR-ID-004 | F02, F15 | AUD05, AUD09 | PASS local/aislado |
| SPEC-FR-PROP-003 | F01 | AUD01 | PASS local/aislado |
| SPEC-FR-ECON-014 | F13, F16 | AUD10 | PASS local/aislado |
| SPEC-FR-HA-005 | F10 | AUD06, candidate F10/F18, AUD11 | PASS local/aislado |
| SPEC-FR-SEC-002 | F02, F12 | AUD02, AUD03 | PASS local/aislado |
| SPEC-FR-SEC-003 | F01, F03, F18 | AUD01, AUD07 | PASS local/aislado |
| SPEC-FR-SEC-005 | F05, F06, F07, F08, F12, F17 | AUD03, AUD04, sensitive-content-scan | PASS local/aislado |
| SPEC-FR-SEC-006 | F01, F03, F04, F15 | AUD05, AUD09 | PASS local/aislado |
| SPEC-FR-SEC-007 | F09, F13, F18 | AUD06, AUD10 | PASS local/aislado |
| SPEC-FR-INT-002 | F11 | AUD08 | PASS local/aislado |
| AC-011 | F01 | AUD01 | PASS local/aislado |
| AC-056 | F10, F13, F18 | AUD06, candidate F10/F18, AUD11 | PASS local/aislado |
| AC-065 | F01, F03, F18 | AUD01, AUD07 | PASS local/aislado |
| AC-078 | F09, F13, F18 | AUD06, AUD10, candidate F18 | PASS local/aislado |
| AC-079 | F14, F17 | AUTH, AUD03, independent resource/source review | PASS local/aislado |
| AC-082 | F05, F07, F08, F11 | AUD04, AUD08, sensitive-content-scan | PASS local/aislado |
| AC-088 | F04 | AUD05 | PASS local/aislado |
| SPEC-NFR-002 | F02, F05, F06, F12 | AUTH, AUD02, AUD03, AUD04 | PASS local/aislado |
| SPEC-NFR-003 | F03, F04, F15 | AUD01, AUD05, AUD09 | PASS local/aislado |
| SPEC-NFR-004 | F14, F17 | AUTH, AUD03, independent resource/source review | PASS local/aislado |
| DM-INV-025 | F01 | AUD01 | PASS local/aislado |
| DM-INV-050 | F02 | AUD01, AUD02, AUD03 | PASS local/aislado |
| DM-INV-052 | F09, F13, F16, F18 | AUD06, AUD10 | PASS local/aislado |
| SM-FORB-22 | F10, F18 | AUD06, candidate F10/F18, AUD11 | PASS local/aislado |
| SM-FORB-29 | F01, F02 | AUD01, AUD02 | PASS local/aislado |
| ARCH-DEC-008 | F11 | AUD08, static route/boundary inspection | PASS local/aislado |
| P10 | F02, F04, F05, F06, F07, F12 | AUTH, AUD02, AUD03, AUD04, AUD05, AUD09 | PASS local/aislado |
| P11 | F01 | AUD01, AUD07 | PASS local/aislado |
| P12 | F08, F14 | sensitive-content-scan, AUTH, static boundary inspection | PASS local/aislado |
| P16 | F09, F10, F13, F16, F18 | AUD06, AUD10, candidate F18, AUD11 | PASS local/aislado |
| PLAN-B10 | F08 | base-independent-readback, custody-independent-refutation, candidate quality/trace review | PASS local/aislado |
| PT-11 | F08, F14 | AUD01, AUD02, AUD03, AUD04, AUD06, AUD07, AUD08 | PASS local/aislado |
| G1 | F02, F03, F15 | AUD02, AUD03, AUD08 | PASS local/aislado |
| D007 | F11 | AUD08, static route/boundary inspection | PASS local/aislado |
| D008 | F09 | AUD06, AUD10, candidate F18 | PASS local/aislado |
