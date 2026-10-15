# TSK-H5-013 — Matriz local del candidato

Oráculo previo sellado, 22 casos conceptuales y18 correspondencias literales. 28 pruebas focales ejecutables cubren varias correspondencias; no se suman filas/casos conceptuales a los contadores de tests. Solo alcance local/aislado de H5-013. H5-014 independiente y cierre conjunto H5-015 NOT RUN.

## Casos

| Caso | Observación contrastada | Resultado |
|---|---|---|
| P01 | Apertura comercial y ausencia de evaluaciones ajenas | PASS local |
| P02 | Revisión explícita comercial, actor/evidencia/historia | PASS local |
| P03 | Prestación y cancelación total aplicadas; operación independiente | PASS local |
| P04 | Cobertura real 2100,00 e interiores con honorarios/costes conocidos | PASS local |
| P05 | Manifiesto completo y razones No aplica; ninguna omisión | PASS local |
| N01 | Booking Ganada y Finalizada sin evaluación automática | PASS local |
| N02 | Pago previo aprobado sin factura; factura vinculada y posterior corrección | PASS local |
| N03 | Refund autorizado no ejecutado | PASS local |
| N04 | Fianza retenida20/resto80 y restitución canónica | PASS local |
| N05 | Incidencia económica justificada aún bloquea; No aplica/null no dispensan | PASS local |
| N06 | Task Completada e Incident Cerrada no resuelven hechos ni evaluaciones | PASS local |
| N07 | Requirement revisado, modificación posterior y factura corregida; historia intacta | PASS local |
| N08 | Actor inhabilitado, sesión revocada, scope ajeno y SQL directo | PASS local |
| N09 | Replay equivalente, E2 por payload distinto y dos sesiones una evaluación | PASS local |
| N10 | Cinco carreras reales; raíz común y Booking independiente | PASS local |
| N11 | Fallo en cada escritura y COMMIT; rollback íntegro y retry | PASS local |
| N12 | Fresh62/upgrade61, catálogo/datos/RLS/ACL/advisors | PASS local |
| N13 | Tararí interno sin factura externa; coste desconocido pendiente | PASS local |
| N14 | Requirement clasificado solo operacional no invalida comercial | PASS local |
| N15 | Justificación crítica salva solo su guarda, no prestación ni economía | PASS local |
| N16 | Acción conjunta rechazada y reapertura reservada | PASS local |
| N17 | Preservación de originales y regresión histórica completa | PASS local |

## Filas asignadas por Tasks §6

| ID | Alcance acreditado |
|---|---|
| SPEC-FR-CLOSE-001 | Tramo H5-013 local cubierto por casos anteriores y focal28 |
| SPEC-FR-CLOSE-002 | Tramo H5-013 local cubierto por casos anteriores y focal28 |
| AC-058 | Tramo H5-013 local cubierto por casos anteriores y focal28 |
| AC-059 | Tramo H5-013 local; cierre conjunto/recorrido integral futuro no acreditado |
| AC-060 | Tramo H5-013 local; cierre conjunto/recorrido integral futuro no acreditado |
| DM-INV-041 | Tramo H5-013 local; cierre conjunto/recorrido integral futuro no acreditado |
| SM-CL-01 | Tramo H5-013 local cubierto por casos anteriores y focal28 |
| SM-CL-02 | Tramo H5-013 local cubierto por casos anteriores y focal28 |
| SM-FORB-23 | Tramo H5-013 local; cierre conjunto/recorrido integral futuro no acreditado |
| P08 | Tramo H5-013 local cubierto por casos anteriores y focal28 |
| PLAN-B06 | Tramo H5-013 local cubierto por casos anteriores y focal28 |
| PLAN-C06 | Tramo H5-013 local cubierto por casos anteriores y focal28 |
| PLAN-T10 | Tramo H5-013 local cubierto por casos anteriores y focal28 |
| PT-10 | Tramo H5-013 local; cierre conjunto/recorrido integral futuro no acreditado |
| E2E-01 | Tramo H5-013 local; cierre conjunto/recorrido integral futuro no acreditado |
| E2E-07 | Tramo H5-013 local; cierre conjunto/recorrido integral futuro no acreditado |
| G5 | Tramo H5-013 local cubierto por casos anteriores y focal28 |
| D012 | Tramo H5-013 local cubierto por casos anteriores y focal28 |

Los requisitos amplios no se declaran íntegramente cerrados por esta matriz. C02 aplica criterios y hechos actuales; C03 asegura evaluación/historia/resultado atómicos con F1/F2; C06 diferencia fundamentos históricos/vigentes y dependencias, sin propagación por arrastre. Los contadores y hashes definitivos están en [evidence-TSK-H5-013.md](evidence-TSK-H5-013.md).
