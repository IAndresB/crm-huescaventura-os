# TSK-H6-005 — matriz normativa local/aislada

Una asignación literal en Tasks §6: **E2E-05**, expandida a **13 AC** de SPEC §9. La ficha incorpora T05/T07, guardas, permisos, historia, repetición y salidas de Tasks §2.2. Los nombres no reducen el alcance. Expected literal y hashes congelados antes de ejecución en `tests/fixtures/h6-005/expected-v1.json`.

| AC | Escenarios e instrumento | Positivo esperado | Negativo esperado |
|---|---|---|---|
|AC-023|C03|10days+critical+assigned500 confirms;6days+1000 confirms|missing critical,proposed only,6days500 never confirm|
|AC-025|C01|detected500 retained as observation;received500 separately verified|Expected Payment and detection create no real funds|
|AC-026|C01|receive500 then reviewed verified200;300 remain unreconciled|proposed/doubt unverified cannot fund obligation|
|AC-027|C04;h6005-regression-postgres-h4-019.test.ts|one80 assignment of100 persists|second80 rejected;allocation/Refund/provider shared root races|
|AC-028|C01;h6005-regression-postgres-h3-004.test.ts;h6005-regression-postgres-h3-006.test.ts|distinct transfer identity same500 remains;partial obligation balances persist|duplicate/replay cannot sum nor force excess allocation|
|AC-035|C05|right200 authorized then actual80 keeps120 pending|withdrawal/replay/closure cannot manufacture200 executed|
|AC-036|C06;h6005-regression-postgres-h4-019.test.ts|provider custody100 retained20 return80 only fact;canonicalRefund80|return pending economic closure;shared representation no duplicate;unknown notzero|
|AC-044|C02;h6005-regression-postgres-h3-010.test.ts|managed500 and fee100 separate;own100cost20 profit80|fee allocation not managed;no mandate inferred nor own500|
|AC-045|C02;C10|original received,reviewed,linked correct client500 separate from payment|client/amount differences Incidencia,link rejected;programmed never paid|
|AC-046|C02|actual500paid beforeinvoice stayspending;laterreviewedlinked resolves suplido|newdiscrepancy reopensreview;suplidoresolution neverclosesBooking|
|AC-047|C02;C07;h6005-regression-postgres-h3-014.test.ts|own fee100-cost20=80 reproducible with versions|unknown actual cost remainsnull;history cannot silentlychange|
|AC-048|C07;C10|internal2drinks15/3.80expected;extras25=175/50=325commercial|extra costsunknown;internalProvider/Suplido/invoice denied|
|AC-049|C07;h6005-regression-postgres-h3-014.test.ts|EUR2decimals preserved,component/version/history trace|unknown VAT/tax not invented;no automatic pack rounding/fiscalvalidity|

El JSON adjunto desarrolla precondiciones, actor/ámbito, datos, acción, esperado, observado, instrumento y prueba independiente por fila. El ensayo integrado usa la aplicación y las68migraciones en PostgreSQL17local y Storage oficialfile privado local. Cada regresión tiene base migratoria histórica explícita; no se presenta como aplicación de68. Los resultados de H6-002/H6-017 no sustituyen prueba alguna.

La auditoría independiente está PENDING y el cierre NO se formaliza en esta matriz técnica. DM-PENDING-002/005, P16 y H6global INPROGRESS conservados;sin emisión fiscal, conectores, datosreales o Hosted/Production.
