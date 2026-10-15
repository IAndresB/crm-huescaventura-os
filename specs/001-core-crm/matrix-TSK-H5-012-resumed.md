# TSK-H5-012 — Matriz de reanudación independiente

**41/41 casos PASS y gates finales PASS — READY FOR REVIEW local/aislado.** Esta matriz añade una revisión sobre el correctivo; la matriz FAILED original se conserva. No cierre formal ni aceptación de tareas posteriores.

| Caso | Resultado local | Comprobación observada |
|---|---|---|
| H01 Reconstrucción canónica | PASS | canonical chain, exact version/acceptance and references |
| H02 Registro tardío y momento desconocido | PASS | late and unknown moments remain distinct |
| H03 Rectificación de llamada atribuida | PASS | attributed phone acceptance and rectification remain retrievable |
| H04 Actores y procedencia distintos | PASS | provenance distinguishes human recorder and automatic derivative |
| H05 Original, derivado y conservación incompleta | PASS | original bytes, derivative and incomplete conservation reauthorize |
| H06 Archivado recuperable | PASS | archive hides normal view and preserves recovery without closure |
| H07 Fusión humana de identidades | PASS | human identity merge preserves two histories and distinct Bookings |
| H08 Anulación e IDs no reutilizables | PASS | stable distinct codes survive cancelled operation and future service dates |
| C01 Calendario canónico completo en su alcance | PASS | calendar exposes canonical services, payments, Tasks and pending schedules |
| C02 Proyección reconstruible y filtros | PASS | reconstruction pagination and filters bind purpose and root |
| C03 Día completo a siete días | PASS | full seventh day balance and final-count civil reference |
| C04 Límites civiles de cancelación a siete y tres días | PASS | retained canonical cancellation results respect complete 7/3 days |
| C05 Referencias por Booking/modalidad/servicio/noche | PASS | civil scopes retain independent anchors and accepted quantities |
| C06 Referencia contractual expresa | PASS | expressly valid contract reference prevails without inventing validity |
| C07 Hora, fecha y vencimiento externo | PASS | hourly external limit keeps own instant while D020 remains civil |
| C08 Datos temporales o parámetros desconocidos | PASS | unknown schedule/deadline stays pending and independent Booking remains readable |
| C09 Cambio Calendar crítico y vista atrasada | PASS | critical Calendar event remains review and stale projection has no write authority |
| C10 Eco y evento fuera de orden | PASS | echo and earlier event never duplicate effect or overwrite current dates |
| C11 Frontera indisponible o sustituida | PASS | unavailable/replaced auxiliary source does not make Core unavailable |
| C12 Avaibook sin escritura V1 | PASS | Avaibook discrepancy never grants create/update/cancel capability |
| S01 Consulta interna del Administrador | PASS | legitimate internal economics remains available only to internal purpose |
| S02 Consulta para tercero | PASS | external query excludes marked economics personal data originals derivatives |
| S03 Búsqueda para tercero | PASS | external search excludes marked economics personal data originals derivatives |
| S04 Exportación para tercero | PASS | external export excludes marked economics personal data originals derivatives |
| S05 Documento para tercero | PASS | external document excludes marked economics personal data originals derivatives |
| S06 Timeline para tercero | PASS | external timeline excludes marked economics personal data originals derivatives |
| S07 Contexto IA permitido | PASS | external ai_context excludes marked economics personal data originals derivatives |
| S08 Pack comercial multimodal | PASS | PACK preserves literal 120/10 and 180/8 with fixed900 internal |
| S09 Finalidad y conservación no presumidas | PASS | purpose does not presume all personal data audio retention or consent |
| S10 Naturaleza fiscal de las salidas | PASS | external invoice keeps issuer and projection cannot emit fiscal documents |
| S11 Referencias de diagnóstico autorizadas | PASS | authorized diagnostic references remain facts not evidence of delivery |
| S12 Diagnóstico o rechazo no autorizados | PASS | known diagnostic IDs and injected markers cannot leak on rejection |
| A01 Sin contexto válido | PASS | invalid or absent identity/session/MFA refuses every surface |
| A02 Contexto falsificado o ampliado | PASS | genuine bound envelopes reject forged MAC root purpose scope and transaction replay |
| A03 Actor/sesión ya inhabilitados o revocados | PASS | disabled actor revoked session and stale epochs cannot read |
| A04 Relación o rol futuro sin acceso | PASS | customer/provider identity and future role are not active permissions |
| A05 Vínculo compartido y scope concreto | PASS | shared original and Contact never expand bound root or object purpose |
| A06 Sesiones y respuestas personales aisladas | PASS | two sessions and reused pool do not share internal/external responses |
| A07 Frontera pública y origen externo | PASS | public/external event ID never authenticates Core |
| A08 Acceso directo y privilegios mínimos | PASS | direct SQL cannot read or mutate original histories or operational view |
| A09 Lectura no autoriza mutación ni actividad ficticia | PASS | projection cannot mutate or renew human authority through polling |

Las aserciones literales y sus entradas se conservan en [verificador independiente](../../tests/integration/postgres-h5-012-complete.test.ts). La reproducción original F01, F02, V-MIG y seguridad complementan los casos; 52 pruebas físicas no equivalen a 52 casos. El consumo D020 utiliza las referencias civiles de las fuentes existentes, sin volver a definir reglas económicas. C04 recorre principio/final de los días 13/14/17/18; C07 incluye modificaciones reales de hora y fecha; F01 acredita noche23/historia20/hermana21.

## 34 filas y asignaciones conservadas

| Fila | Asignación H5-012 | Casos del expected | Resultado local |
|---|---|---|---|
| SPEC-FR-HIST-006 | Sí | H01–H08, S06, A05 | PASS |
| SPEC-FR-COORD-008 | Sí | C01–C10, A09 | PASS |
| SPEC-FR-SEC-003 | Sí | S01–S08 | PASS |
| SPEC-FR-SEC-006 | Sí | H05, S02–S09, A05 | PASS |
| SPEC-FR-SEC-007 | Solo límite local; cierre asignado a otras tareas | S10 (límite local) | PASS del límite local |
| SPEC-FR-INT-005 | Sí | C09–C11, A07 | PASS |
| AC-062 | Sí | H06–H08 | PASS |
| AC-065 | Sí | S02–S08 | PASS |
| AC-075 | Sí | H03 | PASS |
| AC-076 | Sí | C03–C10 | PASS |
| AC-081 | Solo límite local; cierre asignado a otras tareas | S11–S12 (límite local) | PASS del límite local |
| SPEC-NFR-001 | Sí | H01–H04 | PASS |
| SPEC-NFR-003 | Solo límite local; cierre asignado a otras tareas | H05, S02–S09 (límite local) | PASS del límite local |
| SPEC-NFR-011 | Sí | C11 | PASS |
| DM-INV-025 | Solo límite local; cierre asignado a otras tareas | S08 (límite local) | PASS del límite local |
| DM-INV-047 | Sí | H02–H04, S11 | PASS |
| DM-INV-049 | Sí | C09–C12 | PASS |
| DM-INV-050 | Solo límite local; cierre asignado a otras tareas | S01, A04 (límite local) | PASS del límite local |
| DM-INV-051 | Sí | H06–H08 | PASS |
| SM-FORB-28 | Sí | C09–C12 | PASS |
| SM-FORB-29 | Solo límite local; cierre asignado a otras tareas | S06, A04–A07 (límite local) | PASS del límite local |
| SM-FORB-32 | Sí | H06–H08 | PASS |
| ARCH-DEC-007 | Sí | C01, C09–C10 | PASS |
| ARCH-DEC-008 | Sí | C11, A07 | PASS |
| ARCH-DEC-016 | Sí | H01–H04 | PASS |
| P10 | Sí | S02–S09, S12, A01–A09 | PASS |
| P11 | Sí | S01–S08 | PASS |
| PLAN-DEC-009 | Sí | C02, A06 | PASS |
| PLAN-B07 | Sí | H01–H05, C01 | PASS |
| PLAN-C01 | Sí | C02, S01, A01–A09 | PASS |
| PT-05 | Sí | C03–C07 (consumo D020, sin ampliar H4) | PASS |
| PT-08 | Sí | C01, C08–C10 (consulta, sin ampliar otros bloques) | PASS |
| G1 | Sí | A01–A09 | PASS |
| D020 | Sí | C03–C09 | PASS |

28 filas tienen comprobación asignada a H5-012; seis conservan únicamente su límite local. Ningún resultado acredita sus tareas globales. Las 34 filas literales de Tasks y los diez hashes normativos están intactos, comprobados en [preservación normativa](../../tests/fixtures/h5-012/resumed-20261015/normative-preservation.json).

Las consultas usan el Administrador V1 y contextos concretos. No se inventa un modelo multiusuario: otra relación o un vínculo compartido no amplían el contexto firmado. Los originales se leen por su contrato autorizado; la proyección no sustituye esa reautorización.

[Informe final](review-TSK-H5-012.md): regresión PostgreSQL 2545/2545; suplemento H04/S11 1/1 separado; unitarias 197/197; health 1/1; typecheck/lint/build/audit/V-MIG/seguridad/preservación PASS. Los 41 resultados se corroboran individualmente en el log de regresión final mediante [case-results.json](../../tests/fixtures/h5-012/resumed-20261015/case-results.json).
