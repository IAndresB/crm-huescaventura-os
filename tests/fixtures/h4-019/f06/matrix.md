# Matriz independiente — cierre H4-019/F06

Expected original eb2dab9 y suplemento 6c1f060a560e28e513e87f186e16a54911a1a444 intactos. SHA probado 9799de20fcd4f2100f6918d28ffcbec46df203b0. Resultados de la regresión definitiva, distintos de los antecedentes publicados y del intento interrumpido. Todas las filas siguientes PASS local/aislado, salvo A00 cuyo FAIL de acreditación original se conserva como reproducción histórica.

| IDs | Fuente | Fixture/porciones | Observado exacto y conservación |
|---|---|---|---|
| J01/J02 | AC-027; ECON-005; CONC-002; T05/T07 | 100; sin hijos previos; Allocation 80/Refund 80 y dos primeras Allocation 80 | Ambos órdenes; un efecto 80, perdedor obsoleto/conflicto; nunca160. J02 espera directa en payment-root antes de hijos. |
| J03/J04/J05 | ECON-005/007/008; T05/T07 | Fondos internos 100 legítimos; Refund, garantía, Provider Payment o consumo 80 | Un efecto 80 sobre porción compartida, bruto/derecho conservados; sin derecho de cancelación ficticio para garantía ni ingresos automáticos por retención. |
| J06 | CONC-002; G5 | Porciones [0,20)/[20,40) | Una revisión inicial ganadora; reevaluación válida permite ambos hechos 20 y total 40; sin bloqueo permanente de alcance independiente. |
| J07/T08 | HA-004; D039; T08 | Obligación 900, determinación legítima de componente 100; autorización 80/Allocation 80 | Autorización primero: autorizado 80 y asignado 80, ejecutado 0/reserva 0. Allocation primero: asignado 80, autorización obsoleta rechazada, autorizado 0. Aprobar no consume ni reserva fondos. |
| J08/J09 | IDEMP-002; ECON-008; G6 | Restitución 20 vinculada Deposit–Refund | Ambas rutas recuperan un movimiento canónico, importe 20 una vez; replay nueva operación/revisión técnica; material diferente E2; identidad fiable distinta de semejanza. |
| J10/J11/J12/J13 | RF04–06; FORB-27; F13/F23/F24 | Derecho 200; intento 80; parcial 20; reserva 60 | 20/pendiente 180/reserva 60. Resto no ocurrió:20/180/0. Resto ocurrió60:80/120/0. Fuera [100,120), record attemptId e Incident resuelta no resuelven [0,80). Parciales iguales, solapadas, disjuntas, resto y Allocation en ambos órdenes; resultados por caso en log e interleavings. |
| J14 | AC-040; CHG-008; SM-RC-02; FORB-26; D019 | Cancelación operativa sin base atribuible | Operación acreditada conservada, economía pendiente. Cuatro causas dependientes rechazadas sin efecto. Fuente/destino/porción/evidencia/conciliación retirados individualmente. Determinación legítima se conserva en recorridos H4-013/014 de la regresión; fondos no deciden derecho. |
| J15 | PM-08; D028 | Original +500,01; consumo−20,00 | Ajustes −500,01 y +20,00 enlazados exactos; originales recuperables; ninguna inversión bancaria acreditada. |
| J16/J17/J18 | PM-11/12/13; D029 | 100 y pesos 1/1/1;0,05 y pesos 1/1/2; orden A/B/C | 33,34/33,33/33,33;0,01/0,01/0,03 y mismos negativos. Totales/restos/orden/versión reconstruibles, sin floats ni nuevo derecho. |
| J19 | G1/G3; HA-004; D039 | Autoridad y scopes reales de ensayo | Contexto/F1/F2/actor/sesión/evidencia/Booking/cobro/destinatario/método/importe inválidos rechazan; replay reautorizado. CRUD runtime/anon/authenticated denegado, RLS/FORCE/ACL/search_path/proyección mínima. |
| J20/J21 | NFR-006/007; T05/T07/T08; IDEMP-002; FORB-15/27 | Restitución canónica20 | Seis fallos de escritura y fallo deferred COMMIT: snapshots completos idénticos; retry válido. Respuesta perdida tras COMMIT real: un hecho 20 recuperado por Deposit y Refund, sin repetir consumo. |
| J22/A10/A11/A12 | V-MIG; G4 | 48 publicadas; fresh 49 y upgrade poblado | DDL fallo/rollback/reintento reales; datos/catalog intactos salvo único cuerpo admit. Firma/OID/owner/ACL/config/atributos iguales. 48 migraciones, expected/fuentes/deps/health byte exactos; advisors 49 loopback status 0, results[]. |
| J23 | PT-04; V-EVI | SHA exacto limpio publicado 9799de20fcd4f2100f6918d28ffcbec46df203b0 | 2010/2010 PostgreSQL; 138/138 unitarias; health 1/1 separado; gates PASS. 79 casos del bloque incluidos, no se suman de nuevo. |

## Autoridad en cadena 49

| IDs | Guardas/fuente | Resultado observado |
|---|---|---|
| A00 | D038§15; cadena 48 | FAIL original F06: primera sesión en payment-root, segunda en actor transactionid. No sobreconsumo afirmado. |
| A01/A02 | Actor SHARE; sesión/epoch UPDATE | Dos sesiones/PID/xid distintos llegan a negocio; misma sesión sigue exclusiva y segunda espera transactionid. |
| A03/A04 | Autoridad exclusiva antes/después | Disable/revokeOne/revokeAll antes niegan sin reactivar actividad. Disable/revokeOne/revokeAll/reidentify/establish después esperan las dos unidades admitidas; uno de los consumos sobre revisión común pasa y otro stale. Autoridad vieja no revive. |
| A05 | Mapping/generación/recovery | Mapping existente no reemplazable; mutadores relevantes conservan exclusividad; generación/recovery se reejecutan por H0-014/016/017 sobre 49. |
| A06/A07/A08/A09 | D038/D039;7/30 días;expiry/binding/M2/TTE |149 casos funcionales de F2/M03, HA/TTE/M04, revocación global y recovery, incluidos en PostgreSQL, en cadena 49; aserciones originales intactas. Final check tras esperas, rechazo caducado, límites exactos, binding, aprobación, rollback/replay y partición M2. |

## Intercalaciones observadas

28 carreras, ambos órdenes, 56 snapshots de observación. En cada par ambas sesiones completaron F2 y esperaron locks advisory de negocio. 44 esperas identificadas en payment-root y 12 en Opportunity padre; estas últimas no se presentan como espera directa de payment-root. Barrera solo observacional, sin escritura de negocio. Grafos capturados acíclicos; no promesa universal sobre SQL arbitrario.

| Caso observado | Orden | Raíz de espera de cada consumidor | PID/xid |
|---|---|---|---|
| ✔ J07 T08 exact authorization vs competing Allocation 80 on100 0,1 (4344.808583ms) | [0, 1] | payment-root, payment-root | 35652/1005, 35583/1009 |
| ✔ J07 T08 exact authorization vs competing Allocation 80 on100 1,0 (826.843791ms) | [1, 0] | payment-root, payment-root | 35583/1228, 35652/1230 |
| ✔ J01 Allocation 80 vs Refund 80 on100 0,1 (814.861166ms) | [0, 1] | payment-root, payment-root | 35583/1459, 35688/1461 |
| ✔ J02 two first assignments80 on100 0,1 (338.827083ms) | [0, 1] | payment-root, payment-root | 35688/1566, 35583/1568 |
| ✔ J03 Refund vs guarantee restitution shared internal100 0,1 (805.7355ms) | [0, 1] | payment-root, Opportunity parent | 35583/1885, 35688/1887 |
| ✔ J04 Refund vs Provider Payment shared managed funds 0,1 (731.598083ms) | [0, 1] | payment-root, payment-root | 35583/2198, 35688/2200 |
| ✔ J05 guarantee retain vs Allocation consume 0,1 (411.120375ms) | [0, 1] | payment-root, payment-root | 35583/2379, 35688/2381 |
| ✔ J05 guarantee return vs Allocation consume 0,1 (419.446417ms) | [0, 1] | payment-root, payment-root | 35688/2558, 35583/2560 |
| ✔ J06 disjoint Allocation 20 and Refund 20 plus safe revaluation 0,1 (499.247958ms) | [0, 1] | payment-root, payment-root | 35688/2783, 35583/2785 |
| ✔ J01 Allocation 80 vs Refund 80 on100 1,0 (457.385833ms) | [1, 0] | payment-root, payment-root | 35583/3018, 35688/3020 |
| ✔ J02 two first assignments80 on100 1,0 (288.990625ms) | [1, 0] | payment-root, payment-root | 35688/3125, 35583/3127 |
| ✔ J03 Refund vs guarantee restitution shared internal100 1,0 (612.367125ms) | [1, 0] | payment-root, Opportunity parent | 35583/3444, 35688/3446 |
| ✔ J04 Refund vs Provider Payment shared managed funds 1,0 (589.925042ms) | [1, 0] | payment-root, payment-root | 35583/3757, 35688/3759 |
| ✔ J05 guarantee retain vs Allocation consume 1,0 (322.553792ms) | [1, 0] | payment-root, payment-root | 35583/3938, 35688/3940 |
| ✔ J05 guarantee return vs Allocation consume 1,0 (369.79775ms) | [1, 0] | payment-root, payment-root | 35688/4117, 35583/4119 |
| ✔ J06 disjoint Allocation 20 and Refund 20 plus safe revaluation 1,0 (510.291625ms) | [1, 0] | payment-root, payment-root | 35688/4342, 35583/4344 |
| ✔ J10-13 public concurrent uncertainty sameFact 0,1 (594.868167ms) | [0, 1] | payment-root, Opportunity parent | 35583/4658, 35688/4660 |
| ✔ J10-13 public concurrent uncertainty overlap 0,1 (453.589958ms) | [0, 1] | payment-root, Opportunity parent | 35688/4966, 35583/4968 |
| ✔ J10-13 public concurrent uncertainty disjoint 0,1 (626.366291ms) | [0, 1] | payment-root, Opportunity parent | 35583/5274, 35688/5276 |
| ✔ J10-13 public concurrent uncertainty rest 0,1 (511.358333ms) | [0, 1] | payment-root, Opportunity parent | 35583/5600, 35688/5602 |
| ✔ J10-13 public concurrent uncertainty allocation 0,1 (520.231ms) | [0, 1] | payment-root, payment-root | 35688/5924, 35583/5926 |
| ✔ J10-13 public concurrent uncertainty sameFact 1,0 (439.136917ms) | [1, 0] | payment-root, Opportunity parent | 35688/6234, 35583/6236 |
| ✔ J10-13 public concurrent uncertainty overlap 1,0 (452.922333ms) | [1, 0] | payment-root, Opportunity parent | 35583/6542, 35688/6544 |
| ✔ J10-13 public concurrent uncertainty disjoint 1,0 (418.883834ms) | [1, 0] | payment-root, Opportunity parent | 35688/6850, 35583/6852 |
| ✔ J10-13 public concurrent uncertainty rest 1,0 (403.381917ms) | [1, 0] | payment-root, Opportunity parent | 35688/7176, 35583/7178 |
| ✔ J10-13 public concurrent uncertainty allocation 1,0 (524.965833ms) | [1, 0] | payment-root, payment-root | 35583/7500, 35688/7502 |
| ✔ J08 canonical Deposit/Refund shared concurrent reference 0,1 (481.484792ms) | [0, 1] | payment-root, Opportunity parent | 35688/9220, 35583/9222 |
| ✔ J08 canonical Deposit/Refund shared concurrent reference 1,0 (441.320583ms) | [1, 0] | payment-root, Opportunity parent | 35583/9411, 35688/9413 |

Sesión, locks granted/wait, cadenas pg_blocking_pids, IDs de raíz, queries de entrada y snapshots completos están en final/interleavings.json y stdout completo. La tabla es un extracto identificado, no sustituye los logs.

## Unión de las 19 filas asignadas

El expected original conserva literalmente las 19 filas. Correspondencia: CHG-008→J14; ECON-005→J01/02/04/06/15–18; ECON-007→J01/03/04/10–14; ECON-008→J03/05/08; HA-004→J07/19/A03–09; IDEMP-002→J08/09/13/21; CONC-002→J01–08/13/A01/02; AC-027→J01/02; AC-040→J14; NFR-006→J20/21; NFR-007→J19–23/A08/10; SM-RC-02→J14; FORB-15→J01/08/10; FORB-26→J14; FORB-27→J10–13/20/21; PLAN-B05→J01–18; PLAN-T05→J01–06/13/20; PLAN-T07→J03–05/08/10–13/20/21; PT-04→J23. T08 se acredita por J07/A09 y la suite D039. Esta integración es local y no acredita globalmente las demás tareas asignadas a esas fuentes.
