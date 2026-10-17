# Correctivo G — esperado previo e inmutable

Alcance: solo instrumentación temporal de cancelación. Producto F, migraciones1–68, pruebas/aserciones recibidas, todos los expected y auditorías anteriores protegidos. Fuente principal: encargoG; Constitución P03/P04/P05/P07/P12, Tasks§2.2 V-DOM/V-DAT/V-AT/V-NEG/V-EVI y§2.3, Plan§§7.1/8/11.2, SPEC-FR-CHG-006/008/009, HIST001/002, AC032/033/034/040/041/042, BR-CHANGE005–009 y D020.

Contrato temporal existente: el acto y facts.at conservan el momento fijado por el escenario. La evidencia que acredita ese acto debe existir a ese instante: occurred_at<=at. La hora de registro es distinta del momento del hecho y sigue siendo real. No se altera el reloj del proceso/OS, Auth, F1/F2, locks, deadlines ni permisos. La evidencia posterior sigue siendo E3.

| ID | Precondición / secuencia | Esperado |
|---|---|---|
| G01 | Fixture recibido intacto, acto17/10/2026 10:00Z y evidencia de construcción real posterior; repetir original. | Rechazo CANCELLATION_EVIDENCE_REQUIRED:E3, sin derecho/historia de determinación. Conservar FAIL. |
| G02 | F68 sintético, acto fijo protegido; evidencia anterior1ms, igual y posterior1ms; repetir. | Anterior/igual aceptadas con cálculo contractual original; posterior rechazada sin nueva determinación/operación/historia. |
| G03 | Evidencia histórica y evidencia emitida para otra determinación/raíz, mismo acto. | Historia legítima y replay preservados; evidencia ajena denegada y ausencia de efectos indebidos. |
| G04 | Pruebas auxiliares cancellation:base, approve, nonrefundable y re-attest. | Cronología explícita coherente, importes/aserciones/identidades/permisos intactos; referencias incorrectas siguen denegadas. |
| G05 | Ejecuciones en momentos reales distintos y fechas sintéticas antes/después del reloj real. | Instante de evidencia predeterminado depende solo del acto/fixture; evidencia explícita conserva su instante; no se intercepta Date/Date.now ni reloj del servidor. |
| G06 | Ocho fallos enumerados por quinta auditoría. Reejecutar originales observados y adaptación, sin editar aserciones. | Cada clasificación requiere rechazo/resultado y dependencia propios; no se atribuyen por asociación. Los casos de concurrencia mantienen sesiones, locks, ambos órdenes y contadores originales. |
| G07 | Selección completa F192+quinta3+Gtemporal; fases disjuntas y réplica byte-verificada. | Ningún caso recibido eliminado/omitido. V09 de quinta conserva fixture original porque su expected es diagnosticarlo; demás casos de cancelación usan adaptaciónG. Conteos exactos nuevos, sin sumar repeticiones/solapados ni57 casos históricos incrustados. |
| G08 | V-MIG independiente68 recibido, regresiones de las cuatro auditorías y F, controles de seguridad. | Misma semántica; fuentes y cuerpos producto idénticos. Sin ampliación de ACL/RLS/propietarios. |

Solo PASS interno G con completa sin FAIL/cancelados/omitidos, puertas técnicas aplicables y preservación/sello verificados. Aun con PASS, F rechazado y quinta auditoría FAIL permanecen históricos; recomendar únicamente nueva auditoría independiente, sin aceptación/publicación. H5-017/H5-018 IN PROGRESS, DM-PENDING-005 OPEN, STOP.
