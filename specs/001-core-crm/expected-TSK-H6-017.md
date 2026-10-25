# Expected — TSK-H6-017 local/aislado

Base `0cd5f06d2efec9741906d4927318734451b01d4a`, árbol `8b184d1d470a3bf190dee14499369fe9c665ab3d`. Expected reconstruido de las fuentes vigentes antes de resultados. Las 35 asignaciones exactas se conservan en `tests/fixtures/h6-017/normative/normative-expectations-v1.json`, SHA-256 `aec842ca961995d0130dc5e7e0e9363eb4280f706239bdb9a650ceae0314920a`.

La matriz diseñada incluye precondiciones, actor/ámbito, datos sintéticos, acción, esperado literal, instrumento y prueba independiente. El observado queda pendiente hasta ejecución: ningún mapeo nominal constituye PASS. Las familias funcionales tienen un expected propio congelado; el auditor conserva otro oráculo y recursos propios.

Autoridad: Constitución y decisiones aprobadas → fuentes normativas → SPEC → Plan → Tasks. El mandato actual autoriza ejecución y cierre condicionado local, sin cambiar las políticas. DM-PENDING-002/005 siguen abiertos en sus ámbitos dependientes. No se activa matriz de roles futura ni multitenancy inventada; se prueban ámbitos reales del Core y minimización por finalidad.

| Asignación | Fuente | Casos diseñados |
|---|---|---|
| SPEC-FR-ID-004 | specs/001-core-crm/spec.md:151 | F02 |
| SPEC-FR-PROP-003 | specs/001-core-crm/spec.md:182 | F01 |
| SPEC-FR-ECON-014 | specs/001-core-crm/spec.md:255 | F13 |
| SPEC-FR-HA-005 | specs/001-core-crm/spec.md:370 | F10 |
| SPEC-FR-SEC-002 | specs/001-core-crm/spec.md:423 | F02, F12 |
| SPEC-FR-SEC-003 | specs/001-core-crm/spec.md:424 | F01, F03 |
| SPEC-FR-SEC-005 | specs/001-core-crm/spec.md:426 | F05, F06, F07, F08, F12 |
| SPEC-FR-SEC-006 | specs/001-core-crm/spec.md:427 | F01, F03, F04 |
| SPEC-FR-SEC-007 | specs/001-core-crm/spec.md:428 | F09, F13 |
| SPEC-FR-INT-002 | specs/001-core-crm/spec.md:445 | F11 |
| AC-011 | specs/001-core-crm/spec.md:489 | F01 |
| AC-056 | specs/001-core-crm/spec.md:544 | F10, F13 |
| AC-065 | specs/001-core-crm/spec.md:558 | F01, F03 |
| AC-078 | specs/001-core-crm/spec.md:571 | F09, F13 |
| AC-079 | specs/001-core-crm/spec.md:572 | F14 |
| AC-082 | specs/001-core-crm/spec.md:575 | F05, F07, F08, F11 |
| AC-088 | specs/001-core-crm/spec.md:581 | F04 |
| SPEC-NFR-002 | specs/001-core-crm/spec.md:594 | F02, F05, F06, F12 |
| SPEC-NFR-003 | specs/001-core-crm/spec.md:595 | F03, F04 |
| SPEC-NFR-004 | specs/001-core-crm/spec.md:596 | F14 |
| DM-INV-025 | docs/domain-model.md:503 | F01 |
| DM-INV-050 | docs/domain-model.md:528 | F02 |
| DM-INV-052 | docs/domain-model.md:530 | F09, F13 |
| SM-FORB-22 | docs/state-machines.md:737 | F10 |
| SM-FORB-29 | docs/state-machines.md:744 | F01, F02 |
| ARCH-DEC-008 | docs/architecture.md:448 | F11 |
| P10 | docs/constitution.md:53 | F02, F04, F05, F06, F07, F12 |
| P11 | docs/constitution.md:57 | F01 |
| P12 | docs/constitution.md:61 | F08, F14 |
| P16 | docs/constitution.md:77 | F09, F10, F13 |
| PLAN-B10 | specs/001-core-crm/plan.md:107 | F08 |
| PT-11 | specs/001-core-crm/plan.md:404 | F08, F14 |
| G1 | docs/state-machines.md:28 | F02, F03 |
| D007 | docs/DECISIONS.md:53 | F11 |
| D008 | docs/DECISIONS.md:61 | F09 |

Protocolos aplicables: V-DOM/V-DAT/V-AT/V-NEG/V-EVI; V-MIG solo si se modifica persistencia. Los ensayos usan la cadena existente de 68 migraciones, no una migración nueva. La conservación y revisión documental no sustituyen una obligación funcional.

Frentes reservados: sin datos/credenciales reales, producción, efectos externos de negocio, cambio normativo/seguridad, commit/push/merge/Drive/deploy. H6-015 conserva cuarentena y cuatro trabajos suspendidos; no runtime, SQL, S11 ni reentrada. H6 global IN PROGRESS.
