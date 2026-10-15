# H5-014 — Matriz independiente y resultados observados

Resultado definitivo: **PASS exclusivamente local/aislado**, candidato corregido `1e96b60542c517660c9d0deb6394e1947e1bc6f450588848003425d31915c652`. La matriz literal y el esperado previo están en [expected H5-014](expected-TSK-H5-014.md). Las filas compartidas se acreditan solo en el alcance de H5-014; H5-015/016 y H6 siguen fuera.

| Fila normativa asignada | Casos/evidencia | Resultado observado |
|---|---|---|
| SPEC-FR-CLOSE-001 | A01/A04; A02/A16; A17; A19; K01–K04/K11/K12 | PASS: Apertura explícita; dimensiones independientes; estado final y fundamentos actuales; No aplica rechazado si injustificado. |
| SPEC-FR-CLOSE-002 | A05/A06/A11/A12/A15; K05–K10; regresión H5-013 N02/N04/N13 | PASS: Saldos, documentos, costes, Refund, fianza e incidencia bloquean economía; Tararí sin factura externa. |
| AC-058 | A02/A16; A05/A12; H5-013 N02/N04 | PASS: Finalizada conservada; factura/fianza/devolución pendientes no resuelven economía. |
| AC-059 | A01/A04; H5-013 P03/P04/P05 | PASS: Comercial/economía resueltas y operación Pendiente; prestación positiva resuelve solo operación. Cierre conjunto queda para H5-015/016. |
| DM-INV-041 | A01/A04; A02/A16; H5-013 N16 | PASS: Sin cierre conjunto por inferencia; tres estados independientes. Condición conjunta no implementada ni acreditada aquí. |
| SM-CL-01 | A01/A04; S02/S03; C01 | PASS: Abrir crea Pendiente en dimensión pedida, una revisión y actor/evidencia. Rechazos no crean historia. |
| SM-CL-02 | A01/A04; A02/A16; A17/A19; K01–K12 y K persistido | PASS: Guardas suficientes permiten Resuelto; falta o null queda Pendiente tras F01, nunca suficiencia inferida. |
| SM-FORB-23 | A01/A04; A02/A16; H5-013 N16 | PASS: Finalización/archivo no resuelven evaluaciones; comando close-jointly rechazado. |
| P08 | A01/A04; A06/A20 | PASS: Separación comercial/operativa/económica; incidencia económica no invalida comercial. |
| PLAN-B06 | A17; A12; A15 | PASS: Evaluación consume modificación/cancelación y economía canónicas, sin movimientos externos ni entidades comerciales paralelas. |
| PLAN-C06 | A02/A16; A06/A20; C03; H5-013 N07/N14 | PASS: Nueva fuente invalida vigencia dependiente; historial permanece idéntico. No reapertura persistida. |
| PLAN-T10 | C01; C03×14; T01/T02×3; S03 | PASS: Raíz Booking compartida; stale conflict, rollback y replay comprobados con PostgreSQL real. |
| PT-10 | A01–A20 y K/S/C/T/M ejecutados | PASS: Positivos, negativos, insuficiencia, concurrencia y conservación integrados en las 50 pruebas nuevas. |
| G5 | A05/A06/A12/A19; H5-013 N15 | PASS: Justificación crítica no suple prestación, devolución, documentos ni incidencia económica. |
| D012 | A01/A04; A02/A16; A06/A20 | PASS: Tres evaluaciones independientes; ninguna por Ganada/Finalizada ni por cerrar Task/Incident. |

Complementos expresos: AC-060/DM-INV-042 (A05/A06 y regresión N15); Plan C02/C03, §7.3/§9, P05/P07/P10/P11/P13/P18 (K/S/C/T/M). La integración posterior del cierre conjunto sigue pendiente; no se declara AC-059 globalmente satisfecho por este informe.

## Resultado por contraprueba nueva

Los nombres de caso identifican el contraste con el esperado congelado. Resultado observado extraído del log de la regresión final, sin copiar PASS del implementador. Las aserciones concretas están en los tres verificadores H5-014.

| Caso ejecutado | Observado | Duración |
|---|---|---|
| H5-014 K01 missing document status must fail closed | PASS | 1855.447791ms |
| H5-014 K02 null document status must fail closed | PASS | 2.563583ms |
| H5-014 K03 missing resolved must fail closed | PASS | 2.3215ms |
| H5-014 K04 null resolved must fail closed | PASS | 3.051541ms |
| H5-014 K05 missing remaining must fail closed | PASS | 5.245125ms |
| H5-014 K06 null remaining must fail closed | PASS | 1.873375ms |
| H5-014 K07 missing invoice status must fail closed | PASS | 3.527292ms |
| H5-014 K08 null invoice status must fail closed | PASS | 5.982458ms |
| H5-014 K09 missing suplido status must fail closed | PASS | 2.576458ms |
| H5-014 K10 null suplido status must fail closed | PASS | 1.507792ms |
| H5-014 K11 missing applied must fail closed | PASS | 0.67375ms |
| H5-014 K12 null modification progress must fail closed | PASS | 0.488583ms |
| H5-014 A05 kernel simultaneous independent economic blockers | PASS | 1.227584ms |
| H5-014 A11 refund partial | PASS | 0.9225ms |
| H5-014 A11 refund pending | PASS | 0.734875ms |
| H5-014 A11 refund uncertain | PASS | 0.688541ms |
| H5-014 A11 refund failed | PASS | 1.193167ms |
| H5-014 A11 refund stale | PASS | 0.84975ms |
| H5-014 A01/A04 explicit three independent dimensions and no implicit close | PASS | 1717.101375ms |
| H5-014 A02/A16 Finalizada then new documentary basis leaves historical resolution immutable | PASS | 1521.620375ms |
| H5-014 A17 requested modification cannot satisfy commercial review | PASS | 391.092209ms |
| H5-014 A19 whitespace No aplica reason rejected atomically | PASS | 224.742375ms |
| H5-014 A06/A20 economic incident affects only economy and closure of incident does not resolve it | PASS | 784.715125ms |
| H5-014 A15 existing linked invoice without outgoing funds does not settle economy | PASS | 376.030042ms |
| H5-014 C03 invoice writer first; real root wait and stale check | PASS | 2645.865625ms |
| H5-014 C03 invoice assessment first; real root wait and stale check | PASS | 577.604625ms |
| H5-014 C03 own writer first; real root wait and stale check | PASS | 567.303167ms |
| H5-014 C03 own assessment first; real root wait and stale check | PASS | 508.374667ms |
| H5-014 C03 document writer first; real root wait and stale check | PASS | 511.833375ms |
| H5-014 C03 document assessment first; real root wait and stale check | PASS | 565.82875ms |
| H5-014 C03 incident writer first; real root wait and stale check | PASS | 527.751958ms |
| H5-014 C03 incident assessment first; real root wait and stale check | PASS | 614.028708ms |
| H5-014 C03 modification writer first; real root wait and stale check | PASS | 618.861042ms |
| H5-014 C03 modification assessment first; real root wait and stale check | PASS | 549.466292ms |
| H5-014 C03 refund writer first; real root wait and stale check | PASS | 774.070834ms |
| H5-014 C03 refund assessment first; real root wait and stale check | PASS | 728.57775ms |
| H5-014 C03 deposit writer first; real root wait and stale check | PASS | 605.941541ms |
| H5-014 C03 deposit assessment first; real root wait and stale check | PASS | 622.539333ms |
| H5-014 C01 two distinct simultaneous assessments same revision: one winner | PASS | 646.645709ms |
| H5-014 S01 all new privileges and elevated functions deny direct use | PASS | 2043.427458ms |
| H5-014 S02 unauthenticated and wrong interaction reject without history | PASS | 389.778666ms |
| H5-014 S03 evidence from a different Booking and replay collision rejected | PASS | 463.079459ms |
| H5-014 S04 immutable persisted history and receipt | PASS | 294.034125ms |
| H5-014 T01/T02 atomic failure b06_closure_assessments, then lost-response replay | PASS | 416.840458ms |
| H5-014 T01/T02 atomic failure b06_closure_operations, then lost-response replay | PASS | 486.227833ms |
| H5-014 T01/T02 atomic failure commit, then lost-response replay | PASS | 450.357375ms |
| H5-014 K persisted inconsistent document status cannot become satisfied through public evaluator | PASS | 266.291958ms |
| H5-014 A12 real partial Refund and failure without execution stay economically pending | PASS | 933.97175ms |
| H5-014 M02 independent populated61 upgrade preserves documentary records and expected | PASS | 1764.6135ms |
| H5-014 S05 signed F1/F2 tampering actor/scope/MAC/root/purpose and cross-transaction replay | PASS | 273.504875ms |

El histórico de fallos originales incluye 12 casos de kernel más uno persistido. El correctivo no modifica sus valores esperados. Focal inicial corregido: 77/77 (49 nuevos +28 del implementador). Candidato definitivo: 50/50 nuevos incluidos una vez en los 2678 casos de regresión. Resultado consolidado 2678/2678 tras repetir los dos verificadores históricos afectados por el índice de la copia; el completo dio 2675/2678 antes de corregir ese entorno. La diferencia es un caso adicional de envelopes F1/F2 y un estrechamiento de tipo, documentados; el producto SQL es idéntico entre ambas ejecuciones.
