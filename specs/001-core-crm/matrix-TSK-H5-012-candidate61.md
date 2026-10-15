# TSK-H5-012 — Matriz del candidato61

2026-10-15. **PASS — READY FOR REVIEW local/aislado**. Nueva serie posterior al dictamen FAIL; ninguna matriz ni evidencia anterior se sustituye.

## 41 casos individuales

Las aserciones originales se conservan idénticas, salvo setup de migración61 y aislamiento. Los suplementos resuelven las lagunas demostradas de la auditoría. Resultados extraídos de `final-focal.log` (57 pruebas físicas, 41 casos conceptuales) y corroborados en la regresión completa.

| Caso | Resultado | Aserción / complemento |
|---|---|---|
| H01 | PASS | canonical chain, exact version/acceptance and references.  |
| H02 | PASS | late and unknown moments remain distinct.  |
| H03 | PASS | attributed phone acceptance and rectification remain retrievable.  |
| H04 | PASS | provenance distinguishes human recorder and automatic derivative. Además, suplemento de cadena autorizada responsable/aprobador/ejecutor. |
| H05 | PASS | original bytes, derivative and incomplete conservation reauthorize.  |
| H06 | PASS | archive hides normal view and preserves recovery without closure.  |
| H07 | PASS | human identity merge preserves two histories and distinct Bookings.  |
| H08 | PASS | stable distinct codes survive cancelled operation and future service dates.  |
| C01 | PASS | calendar exposes canonical services, payments, Tasks and pending schedules. F03: noche cancelada explícita; estados canónicos de servicio/Booking; conserva fecha vigente. |
| C02 | PASS | reconstruction pagination and filters bind purpose and root. F03: relectura tras aplicar cambia solo alcance afectado; aprobación sin aplicación no cambia noche. |
| C03 | PASS | full seventh day balance and final-count civil reference. Suplemento persistido: Task final_participants, 7 días, pendiente el 13 completo y vencida el 14; cantidades estimadas intactas. |
| C04 | PASS | retained canonical cancellation results respect complete 7/3 days.  |
| C05 | PASS | civil scopes retain independent anchors and accepted quantities. Suplemento persistido: cuatro scopes reales 20/22/20/23 de noviembre; referencias autorizadas; cambio a 3 días solo en Task de noche. |
| C06 | PASS | expressly valid contract reference prevails without inventing validity. Suplemento persistido: evidencia candidate para 28/11 rechazada exactamente por OBLIGATION_AUTHORIZED_EVIDENCE_REQUIRED; contrato válido 25/11 intacto. |
| C07 | PASS | hourly external limit keeps own instant while D020 remains civil.  |
| C08 | PASS | unknown schedule/deadline stays pending and independent Booking remains readable.  |
| C09 | PASS | critical Calendar event remains review and stale projection has no write authority.  |
| C10 | PASS | echo and earlier event never duplicate effect or overwrite current dates.  |
| C11 | PASS | unavailable/replaced auxiliary source does not make Core unavailable.  |
| C12 | PASS | Avaibook discrepancy never grants create/update/cancel capability.  |
| S01 | PASS | legitimate internal economics remains available only to internal purpose.  |
| S02 | PASS | external query excludes marked economics personal data originals derivatives.  |
| S03 | PASS | external search excludes marked economics personal data originals derivatives.  |
| S04 | PASS | external export excludes marked economics personal data originals derivatives.  |
| S05 | PASS | external document excludes marked economics personal data originals derivatives.  |
| S06 | PASS | external timeline excludes marked economics personal data originals derivatives.  |
| S07 | PASS | external ai_context excludes marked economics personal data originals derivatives.  |
| S08 | PASS | PACK preserves literal 120/10 and 180/8 with fixed900 internal.  |
| S09 | PASS | purpose does not presume all personal data audio retention or consent.  |
| S10 | PASS | external invoice keeps issuer and projection cannot emit fiscal documents.  |
| S11 | PASS | authorized diagnostic references remain facts not evidence of delivery. Además, suplemento receipt→ejecución autorizada; contacto no acredita entrega. |
| S12 | PASS | known diagnostic IDs and injected markers cannot leak on rejection.  |
| A01 | PASS | invalid or absent identity/session/MFA refuses every surface.  |
| A02 | PASS | genuine bound envelopes reject forged MAC root purpose scope and transaction replay.  |
| A03 | PASS | disabled actor revoked session and stale epochs cannot read.  |
| A04 | PASS | customer/provider identity and future role are not active permissions.  |
| A05 | PASS | shared original and Contact never expand bound root or object purpose.  |
| A06 | PASS | two sessions and reused pool do not share internal/external responses.  |
| A07 | PASS | public/external event ID never authenticates Core.  |
| A08 | PASS | direct SQL cannot read or mutate original histories or operational view.  |
| A09 | PASS | projection cannot mutate or renew human authority through polling.  |

## 34 filas normativas

| Fila | Asignación | Casos del expected | Resultado local |
|---|---|---|---|
| SPEC-FR-HIST-006 | Propia | H01–H08, S06, A05 | PASS |
| SPEC-FR-COORD-008 | Propia | C01–C10, A09 | PASS |
| SPEC-FR-SEC-003 | Propia | S01–S08 | PASS |
| SPEC-FR-SEC-006 | Propia | H05, S02–S09, A05 | PASS |
| SPEC-FR-SEC-007 | Solo límite local | S10 (límite local) | PASS del límite local |
| SPEC-FR-INT-005 | Propia | C09–C11, A07 | PASS |
| AC-062 | Propia | H06–H08 | PASS |
| AC-065 | Propia | S02–S08 | PASS |
| AC-075 | Propia | H03 | PASS |
| AC-076 | Propia | C03–C10 | PASS |
| AC-081 | Solo límite local | S11–S12 (límite local) | PASS del límite local |
| SPEC-NFR-001 | Propia | H01–H04 | PASS |
| SPEC-NFR-003 | Solo límite local | H05, S02–S09 (límite local) | PASS del límite local |
| SPEC-NFR-011 | Propia | C11 | PASS |
| DM-INV-025 | Solo límite local | S08 (límite local) | PASS del límite local |
| DM-INV-047 | Propia | H02–H04, S11 | PASS |
| DM-INV-049 | Propia | C09–C12 | PASS |
| DM-INV-050 | Solo límite local | S01, A04 (límite local) | PASS del límite local |
| DM-INV-051 | Propia | H06–H08 | PASS |
| SM-FORB-28 | Propia | C09–C12 | PASS |
| SM-FORB-29 | Solo límite local | S06, A04–A07 (límite local) | PASS del límite local |
| SM-FORB-32 | Propia | H06–H08 | PASS |
| ARCH-DEC-007 | Propia | C01, C09–C10 | PASS |
| ARCH-DEC-008 | Propia | C11, A07 | PASS |
| ARCH-DEC-016 | Propia | H01–H04 | PASS |
| P10 | Propia | S02–S09, S12, A01–A09 | PASS |
| P11 | Propia | S01–S08 | PASS |
| PLAN-DEC-009 | Propia | C02, A06 | PASS |
| PLAN-B07 | Propia | H01–H05, C01 | PASS |
| PLAN-C01 | Propia | C02, S01, A01–A09 | PASS |
| PT-05 | Propia | C03–C07 (consumo D020, sin ampliar H4) | PASS |
| PT-08 | Propia | C01, C08–C10 (consulta, sin ampliar otros bloques) | PASS |
| G1 | Propia | A01–A09 | PASS |
| D020 | Propia | C03–C09 | PASS |

28 verificaciones propias y seis límites locales. Ningún límite acredita el cierre global de otra tarea. D020 y las diez fuentes normativas conservan sus hashes. C03/C05/C06 se acreditan con registros sintéticos reales en PostgreSQL y lecturas autorizadas; sus referencias no se limitan a un helper.

[Resultados estructurados](../../tests/fixtures/h5-012/f03-20261015/case-results.json), [integridad del oráculo](../../tests/fixtures/h5-012/f03-20261015/oracle-integrity.json), [fuentes normativas](../../tests/fixtures/h5-012/f03-20261015/normative-check.json), [informe consolidado](review-TSK-H5-012-candidate61.md).
