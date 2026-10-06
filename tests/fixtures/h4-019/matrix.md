# Matriz independiente H4-019 — acreditación parcial

Expected publicado `eb2dab9dcc7b7c0d09a8cec7677de5d745776f19`, SHA256 `425b22adcb61027960e01eb5272e1fce044de080e0160dc0a43906ae41037222`. Verificador publicado `6dbd550647b4d5479914d5a8dae0d57d590ff56e`. Expected original intacto. Los resultados focales de desarrollo proceden de un árbol con verificador todavía sin commit, identificado explícitamente; no se atribuyen al expected SHA como producto probado. La ejecución final se registra separadamente.

| Expected | Observado focal8 | Resultado de alcance |
|---|---|---|
| J01/J02 | Primeros hijos inexistentes; Allocation80/Refund80 y dos Allocation80, ambos órdenes, un ganador; bruto100 intacto | PASS funcional; solapamiento económico no sustituido por espera F2, PENDING F06 |
| J03/J04/J05 | Refund/garantía/Provider Payment/consumo, ambos órdenes; efecto incompatible rechazado, no doble consumo | PASS contratos públicos; prueba fuerte de raíz PENDING F06 |
| J06 | Porciones disjuntas requieren reevaluación vigente y ambas continúan | PASS funcional; overlap económico PENDING F06 |
| J07 | Material exacto modificado rechazado; autoridad F2/TTE preservada | PASS local; cambios materiales durante espera económica PENDING F06 |
| J08/J09 | Deposit y Refund apuntan a un movimiento20; replay técnico/revisión fondos no suma; material conflictivo E2 | PASS funcional; referencia concurrente serializada por F2 declarada, PENDING fuerte |
| J10/J12 | Derecho200, parcial20, pendiente180, reserva60; resto no ocurrió→20/180/0; ocurrió60→80/120/0 | PASS; ningún cálculo contractual nuevo |
| J11 | F13 porción ajena, F24 record attemptId, Incident resuelto no liberan restante ni prueban salida | PASS |
| J13 | Parciales iguales, solapadas/disjuntas, parcial/resto/Allocation en dos sesiones reales, ambos órdenes | PASS público; root overlap PENDING F06 |
| J14 | Operación cancelada conserva importe pendiente; cuatro causas económicas sin D019 denegadas; guardas source/destination/portion/evidence/reconciliation retiradas | PASS sin efecto indebido ni base ficticia |
| J15 | PM08 originales +500,01 y consumo−20,00, ajustes−500,01 y +20,00 enlazados | PASS registral; no inversión bancaria real |
| J16/J17/J18 | PM11 33,34/33,33/33,33; PM12 0,01/0,01/0,03 y mismos negativos; input/restos/orden/versión persistidos | PASS, oráculos constantes independientes |
| J19 | Actor/sesión revocados, contexto inválido, F1/F2 incorrectos, cruces, evidencia candidata y campos materiales; runtime/anon/authenticated CRUD denegado; mínimo autorizado | PASS focal; catálogo seguro, sin permisos nuevos |
| J20/J21 | Seis fallos de escritura y fallo deferred COMMIT con snapshots completos idénticos; pérdida de respuesta tras COMMIT real devuelve hecho20 una vez por ambos contratos | PASS atomicidad interna, no exactly-once externo |
| J22 | Fresh48, cadena/hashes byte exactos; datos/catálogo poblados preservados ante DDL técnico fallido y retry; advisors loopback sin error | PASS aplicable. Upgrade desde48 no aplicable: no migración ni cambio SQL de producto |
| J23 | Regresión SHA exacto1995/1995 PostgreSQL,138/138 unitarias,health1/1 separado; gates PASS | PASS de ejecución; acreditación integral H4-019 PENDING F06 |

64 casos ejecutados focal8 (61 funcionales y3 preservación/advisors). Incluidos en la suite completa, no se suman otra vez. 19 filas normativas literales están en expected; no se declaran universalmente satisfechas por casos parciales o por pruebas futuras aún ausentes.
