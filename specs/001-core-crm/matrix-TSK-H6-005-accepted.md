# Matriz aceptada — TSK-H6-005 local/aislado

**1/1 asignación E2E-05 y13/13 AC acreditados.** El [JSON completo](../../tests/fixtures/h6-005/matrix-accepted-v3.json) conserva literal normativo, precondiciones, actor/ámbito, dato sintético, acción/instrumento, positivo/negativo, expected/observed y prueba independiente por criterio. El original observado v2 y expected-v1 quedan íntegros en el candidato403.

Actor ordinario: único Administrador ficticio autorizado con sesión/F1/F2 de ensayo;los accesos sin facultad se deniegan. Los recursos PG/Storage, identidades, puertos, fixtures y logs de implementador y auditor son distintos. Solo datos sintéticos y contratos de aplicación+68migraciones. No se usan resultados H6-002 o H6-017 para sustituir estas pruebas.

| AC | Positivo esperado y observado | Negativo esperado y observado | Prueba independiente propia PASS |
|---|---|---|---|
| AC-023 | 10days+critical+assigned500 confirms;6days+1000 confirms | missing critical,proposed only,6days500 never confirm | A10-7-true-500.00, A10-6-true-500.00, A10-6-true-1000.00, A10-6-false-1000.00;runs/attempt-06 |
| AC-025 | detected500 retained as observation;received500 separately verified | Expected Payment and detection create no real funds | A01;runs/attempt-06 |
| AC-026 | receive500 then reviewed verified200;300 remain unreconciled | proposed/doubt unverified cannot fund obligation | A01;runs/attempt-06 |
| AC-027 | one80 assignment of100 persists | second80 rejected;allocation/Refund/provider shared root races | A09-0,1, A09-1,0;runs/attempt-06 |
| AC-028 | distinct transfer identity same500 remains;partial obligation balances persist | duplicate/replay cannot sum nor force excess allocation | A01, regression39-independent.json;runs/attempt-06 |
| AC-035 | right200 authorized then actual80 keeps120 pending | withdrawal/replay/closure cannot manufacture200 executed | A06;runs/attempt-06 |
| AC-036 | provider custody100 retained20 return80 only fact;canonicalRefund80 | return pending economic closure;shared representation no duplicate;unknown notzero | A07, regression39-independent.json;runs/attempt-06 |
| AC-044 | managed500 and fee100 separate;own100cost20 profit80 | fee allocation not managed;no mandate inferred nor own500 | A02, A05;runs/attempt-06 |
| AC-045 | original received,reviewed,linked correct client500 separate from payment | client/amount differences Incidencia,link rejected;programmed never paid | A02, A03-recipientId, A03-amount;runs/attempt-06 |
| AC-046 | actual500paid beforeinvoice stayspending;laterreviewedlinked resolves suplido | newdiscrepancy reopensreview;suplidoresolution neverclosesBooking | A02, A04;runs/attempt-06 |
| AC-047 | own fee100-cost20=80 reproducible with versions | unknown actual cost remainsnull;history cannot silentlychange | A05;runs/attempt-06 |
| AC-048 | internal2drinks15/3.80expected;extras25=175/50=325commercial | extra costsunknown;internalProvider/Suplido/invoice denied | A05, A03-recipientId;runs/attempt-06 |
| AC-049 | EUR2decimals preserved,component/version/history trace | unknown VAT/tax not invented;no automatic pack rounding/fiscalvalidity | A05;runs/attempt-06 |

Focal10/10PASS;regresión551casos únicos acreditados mediante512PASS/39FAIL iniciales y63/63sucesoresH4-019 (488otras+63=551,sin sumar24repeticiones). Los39FAIL y sus mapas exactos permanecen conservados;no se afirma una nueva corrida551/551 limpia. Las aserciones originales son idénticas:solo puertos ydos imports a la cronologíaG aprobada. Auditor propio11/11PASS: [dictamen](../../tests/fixtures/h6-005/independent/package/audit/h6-005/verdict.json), [comparación39](../../tests/fixtures/h6-005/independent/package/audit/h6-005/regression39-independent.json).

Independencia técnica entre agentes del mismo modelo,no humana externa. DM-PENDING-002/005 conservan sus límites;sin mandato/tipo/emisión fiscal inferidos,nuevos permisos,datos o efectos reales,Hosted/Production o publicación. H6global IN PROGRESS.
