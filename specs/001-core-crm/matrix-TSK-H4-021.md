# Matriz esperado / observado H4-021

Expected69 casos congelado en33c8666;23 filas normativas literales en normative-23.json. Esta matriz NO modifica expected. Observado proviene de ejecuciones ordinarias y regresión de contratos heredados explicitados. Los69 casos lógicos se agrupan en66 nuevos testsNode; contenedores/subtests se cuentan por Node. Los66 están incluidos una sola vez en la regresión2076=2010+66. Health1 yunit138 separados. TiempoB18–20 observación SQL parametrizada;B47 inyección técnica de reloj aislada/restaurada; no espera real4días. Casos heredados no suman tests nuevos. Resultado final PASS sobre SHA publicado `bf4d707509e07f9caa30cfece26e5c418c5d42f7`. Las referencias heredadas B34/B46 y la limitación de Task B44 están identificadas expresamente; no se presentan como nuevos ensayos de capacidades futuras.

|Caso|Norma|Expected congelado|Observado|Ejecución/ref|
|---|---|---|---|---|
|B01|AC-016;DM-INV-006;SM-FORB-04;P08|Ganada; Booking Pendiente de preparación; faltan críticos/economía|Aceptada / Ganada (enum aprobado SM); nueva Booking Pendiente,0 confirmaciones/allocations|postgres-h4-021.test.ts|
|B02|SM-BK-02;PLAN-B04|En confirmación con proveedores; incluye internos|start registra coordinación/Task; En confirmación|postgres-h4-021.test.ts|
|B03|SM-BK-02;G2|E3 o pendiente; no transición acreditada|manifest vacío E3,revision0|postgres-h4-021.test.ts|
|B04|SM-BK-02;G2|E3 o pendiente; no transición acreditada|actuación vacía E3,revision0|postgres-h4-021.test.ts|
|B05|AC-022;SM-BK-03|Parcialmente confirmada; únicamente S1 cubierto|S1 llamada usable; S2 pendiente; S3 interno sin prueba; parcial|postgres-h4-021-concrete.test.ts; postgres-h4-021.test.ts|
|B06|AC-022;G2|S3 cubierto solo tras prueba propia|S3 solo usable tras registro/revisión/evaluación propios;0 facturas/Suplidos/pagos externos|postgres-h4-021-concrete.test.ts|
|B07|SM-BK-03|En confirmación si coordinación iniciada; no parcial ficticia|sin alcance usable→En confirmación, nunca parcial ficticia|postgres-h4-021.test.ts|
|B08|AC-023;SM-BK-04;DM-INV-023|Confirmada operativamente|10días+500/1000 pertinente→Confirmada|postgres-h4-021.test.ts|
|B09|AC-023;SM-FORB-06|no Confirmada; parcial si otro alcance válido|crítico ausente con dinero válido→En; S1 perdido/S2 válido→Parcial|postgres-h4-021.test.ts|
|B10|AC-023;G2|no Confirmada; dependencia específica pendiente|eligibilityProofId retirado→E3 upstream; crítico no usable|postgres-h4-021-concrete.test.ts|
|B11|AC-023;SPEC-FR-ECON-002|economía pendiente; no Confirmada|recibido sin verificación→coverage0; discrepancy legítima retira100|postgres-h4-021-concrete.test.ts; postgres-h4-021.test.ts|
|B12|AC-023;SPEC-FR-ECON-002|economía pendiente; no Confirmada|propuesta sin verify→coverage0; corrección pertinente conserva historia|postgres-h4-021-concrete.test.ts; postgres-h4-021.test.ts|
|B13|AC-023;SPEC-FR-ECON-002|economía pendiente; no Confirmada|verificado sin allocation→coverage0; H3R24/R29 retirada/asignación corregida|postgres-h3-006.test.ts R24/R29; postgres-h4-021-concrete.test.ts; postgres-h4-021.test.ts|
|B14|AC-023|no Confirmada; sin recepción/conciliación implícita|Expected/recepción/propuesta sin conjunto acreditado no confirma|postgres-h4-021-concrete.test.ts; postgres-h4-021.test.ts|
|B15|AC-023;DM-INV-031|no Confirmada;100% exigido|6días+500/1000→Parcial|postgres-h4-021.test.ts|
|B16|AC-023;DM-INV-031|Confirmada si resto de guardas satisfechas|6días+1000/1000→Confirmada|postgres-h4-021.test.ts|
|B17|SPEC-FR-ECON-001;D020|inicial50%; saldo no vencido en ese día completo|7días+50%→Confirmada; balance requerido false|postgres-h4-021.test.ts|
|B18|SPEC-FR-ECON-002;D020|no vencido hasta concluir ese día|23:59:59.999999 día límite→no vencido,initial50%|postgres-h4-021-concrete.test.ts|
|B19|SPEC-FR-ECON-002;D020|saldo vencido y guarda actual insatisfecha|00:00 día siguiente→saldo requerido,missing economy|postgres-h4-021-concrete.test.ts|
|B20|D020;PLAN-T04|mismo intervalo civil|00:00/23:59:59 mismo día: daysBefore7; cambio hora no intervalo nuevo|postgres-h4-021-concrete.test.ts; postgres-h4-021.test.ts|
|B21|D020;PLAN-T04|plazos afectados actuales; historia intacta|cambio fecha aplicado→reference-review en economía y pérdida crítica; historia intacta|postgres-h4-021.test.ts|
|B22|SPEC-FR-ECON-001;DM-INV-031|partes/fechas/versiones correspondientes|caso contractual H3 inicial500 ysaldo500 diferido→Confirmada al cumplir inicial|postgres-h4-021-concrete.test.ts|
|B23|SPEC-FR-ECON-001;G2|economía dependiente pendiente|H3 rechaza reference ausente; Booking economy-definition pendiente|postgres-h4-021-concrete.test.ts|
|B24|SPEC-FR-ECON-001;G2|economía dependiente pendiente|H3 rechaza zone ausente; Booking economy-definition pendiente|postgres-h4-021-concrete.test.ts|
|B25|SM-FORB-06;AC-023|salva solo guarda económica|HA/TTE exacta con scope económico documentado permite excepción|postgres-h4-021.test.ts|
|B26|SM-FORB-06;G3|denegada o pendiente; no Confirmada|ordinary exception yAI denegados; no booleano autorizador|postgres-h4-021.test.ts|
|B27|SM-FORB-06|no Confirmada|excepción sin crítico→En, no Confirmada; necesidad documental igual no dispensada|postgres-h4-021.test.ts|
|B28|G3;PLAN-C02|denegado sin efecto|AI ordinaria rechazada sin efecto|postgres-h4-021.test.ts|
|B29|G3;PLAN-C02|efecto+consumo+historia+resultado atómicos|HA/TTE exacta→estado/reserva/history/result en unidad, replay único|postgres-h4-021.test.ts|
|B30|G3;PLAN-T04|no aplicable al compromiso nuevo|Provider B aplicado; viejo HA denegado, history recuperable|postgres-h4-021-concrete.test.ts; postgres-h4-021.test.ts|
|B31|G3;PLAN-T04|no aplicable al compromiso nuevo|V2 aplicada; viejo HA denegado; invariantes H4-012-F16 regresadas|postgres-h4-021-concrete.test.ts; postgres-h4-021.test.ts|
|B32|SM-BK-05|Parcialmente confirmada actual; historia Confirmada recuperable|Confirmada histórica; S1 review, S2 usable→Parcial actual|postgres-h4-021-concrete.test.ts|
|B33|SM-BK-05|En confirmación actual; historia intacta|último crítico pierde→En actual; history Confirmada intacta|postgres-h4-021.test.ts|
|B34|SM-BK-05;G4|no atribuir invalidación ficticia; faltas actuales visibles|guardas review y evidencia upstream negativas; ningún hecho de invalidación fabricado|postgres-h4-010.test.ts negativos review/evidence|
|B35|AC-019;PLAN-T04|12 y10; no16/8 contactos inventados|N1=12/N2=10;4 nominales;0 contactos nominales inventados|postgres-h4-021-concrete.test.ts|
|B36|AC-051;SM-BK-04|no Confirmada; requisito pendiente revisión|need/Recibido sin review bloquea; guardas no dispensadas|postgres-h4-021.test.ts|
|B37|AC-051;SM-BK-04|guarda documental satisfecha|review exacta→guardas documentales satisfechas,confirmación posible|postgres-h4-021.test.ts|
|B38|AC-051;G2|no dispensa indebida|No aplica mismo contexto obligatorio y sinsource rechazados|postgres-h4-021-concrete.test.ts|
|B39|AC-051;PLAN-T04|reabre solo necesidad afectada|contextversion2 reabre requirement; original conservado|postgres-h4-021.test.ts|
|B40|G2;DM-INV-023|no Confirmada; ausencia no prueba cero críticos|manifest/fundamento/evidencia no sustituibles por ausencia; E3/pendiente|postgres-h4-021.test.ts|
|B41|G2;PLAN-C06|no bloqueo global por ese hecho solamente|necessaryfalse con evidencia→no bloqueo global por servicio pendiente|postgres-h4-021-concrete.test.ts|
|B42|G2;PLAN-C06|parcial pertinente; no completa ficticia|noche11<12 no completa;12 sí; fechas distintas scopes contribution separados|postgres-h4-021-concrete.test.ts|
|B43|G5;SM-FORB-04|no confirmación por arrastre|Availability verificada/Hold real/Incident resuelta/dinero no creanConfirmation|postgres-h4-021-concrete.test.ts; postgres-h4-021.test.ts|
|B44|G5;PLAN-C06|no satisface la guarda|Task durable propia no prueba crítico; flag taskCompleted rechazado. Completar Task no es API futura implementada|postgres-h4-021.test.ts|
|B45|SPEC-FR-ECON-002|no impago por ubicación/consumo físico legítimo|consume legítimo conserva fund_coverage yConfirmation|postgres-h4-021.test.ts|
|B46|SPEC-FR-ECON-002|no cobertura ordinaria reutilizable|H3R11 fondos destino sin obligation→coverage0; H4-018/019 reservas inciertas/garantías aisladas, funciónH3 idéntica V-MIG|postgres-h3-006.test.ts R11; postgres-h4-018.test.ts; postgres-h4-019.test.ts|
|B47|SM-BK-05;D020|historia recuperable; guarda actual100%|APIread10→6 con reloj técnico aislado: historyConfirmada,currentParcial,applicablefalse|postgres-h4-021-concrete.test.ts|
|B48|G1;PLAN-C02|denegado|client-shaped Auth yacceso sinF1/F2 denegados|postgres-h4-021.test.ts|
|B49|G1;PLAN-C02|denegado|actor disable ysesiónrevocada:read/replaydenied, sinactividadreactivada; F2 expiry heredada regresada|postgres-h4-021-concrete.test.ts|
|B50|G1;PLAN-C06|denegado sin revelar material privado|scope/evidence/schedule ajenos denegados;Booking desconocida null|postgres-h4-021-concrete.test.ts; postgres-h4-021.test.ts|
|B51|G1;PLAN-C02|42501 o denegación real|runtime tabla/helper42501; ACL/RLS/FORCE/search_path catálogo|postgres-h4-021.test.ts|
|B52|G6;PLAN-C02|mismo resultado durable;no duplicados|replay mismo JSON retorna resultado anterior,1history/Taskcausa|postgres-h4-021-concurrency.test.ts; postgres-h4-021.test.ts|
|B53|G6;PLAN-C02|E2|misma clave distinto reason E2,1history|postgres-h4-021.test.ts|
|B54|PLAN-C02;PLAN-T04|una vigente;otra replay/E2 conforme clave|4 pares dosconfirm/replay,2PID/xid/sesiones ambasadmitidas,un solo nuevo resultado|postgres-h4-021-concurrency.test.ts|
|B55|PLAN-T04;SM-BK-05|writer primero impide;confirmación primero conserva historia y actual pendiente|2órdenescriticalreview,writerprimero E2,posterior historia yactualEn|postgres-h4-021-concurrency.test.ts|
|B56|PLAN-T04;AC-051|sin confirmar sobre insumo anterior cuando writer gana|2órdenes primera necesidad documental,readeractualnoGuardavieja|postgres-h4-021-concurrency.test.ts|
|B57|PLAN-T04;D020|no proyección vieja como autoridad;actual reevaluado|2órdenes aplicación fecha,huella tras espera; current pendiente|postgres-h4-021-concurrency.test.ts|
|B58|PLAN-T04;SPEC-FR-ECON-002|versiones actuales;historia si cambio posterior|2órdenes discrepancy legítima100, cobertura actual reevaluada|postgres-h4-021-concurrency.test.ts|
|B59|G3;PLAN-T04|binding viejo no aplicable al material nuevo|2órdenes TTEvscritical, materialviejo denegado sinreserve;historiamantenida|postgres-h4-021-concurrency.test.ts; postgres-h4-021.test.ts|
|B60|PLAN-C02|rollback completo|6 puntos beforeinsert Task/history/result/evaluation/operation/approval→rollbacktotal|postgres-h4-021-atomicity.test.ts|
|B61|PLAN-C02;G3|rollback completo y aprobación no parcialmente consumida|COMMIT deferred ordinario/TTE falla23514→rollbacktotal yreserva0,retetspositive|postgres-h4-021-atomicity.test.ts|
|B62|G6;PLAN-C02|mismo resultado durable sin repetir transición|COMMIT real seguido de respuesta descartada;authorizedreplaydurableúnico;revocada deniega|postgres-h4-021-atomicity.test.ts|
|B63|PLAN-B04;PLAN-C02|cadena íntegra y APIs reales disponibles|vacío50 instala/exponeAPI;49 anteriores íntegras|postgres-h4-021-migration.test.ts|
|B64|PLAN-B04;PLAN-T04|datos/relaciones/originales/historia preservados|upgrade49poblado→50 datos/historia/originalbytesidénticos;atributos/OID preservados|postgres-h4-021-migration.test.ts|
|B65|PLAN-B04|sin cambio residual;reintento íntegro|DDLfallo22012→rollbackcatálogoidéntico,retrycompleto|postgres-h4-021-migration.test.ts|
|B66|PT-03;E2E-01|tramo Booking guardas probado;E2E integral futuro|cadenaordinariaAcceptance→H3→H4; E2E-01 tramosololocal|postgres-h4-021.test.ts|
|B67|G4;G5|todos gates aplicablesPASS sobre SHA exacto|gates exactSHA,PG2010+66,unit138,health1 separado,advisors127.0.0.1|gates exactos fixtures/h4-021/final; postgres-h4-021-migration.test.ts|
|B68|G4|intactos salvo integración mínima declarada|manifest hashes fuentes49migrations/expected/deps/health intactos;J22acotadohistórico|postgres-h4-021-migration.test.ts|
|B69|G1;G4|estado/cobertura/faltas pertinentes|resultprojection sinprivate_ref/content_ref/cost_amount/storage_path;DM-PENDING005 abierto|postgres-h4-021.test.ts|

## Unión exacta de las 23 filas asignadas

Los textos exactos permanecen en `normative-23.json` congelado; esta tabla enlaza cada fila con el observado anterior. Las comprobaciones de guardas comunes G1–G6 y D020/D038/D039 se registran además por caso.

|Fila normativa|Casos observados|Resultado local|
|---|---|---|
|SPEC-FR-BOOK-004|B01–B49|PASS; conservación y límites por caso|
|SPEC-FR-ECON-001|B08,B15–B27,B47|PASS; conservación y límites por caso|
|SPEC-FR-ECON-002|B08,B15–B27,B45–B47|PASS; conservación y límites por caso|
|AC-016|B01|PASS; conservación y límites por caso|
|AC-022|B05–B06|PASS; conservación y límites por caso|
|AC-023|B08–B17,B25–B27|PASS; conservación y límites por caso|
|DM-INV-006|B01,B69|PASS; conservación y límites por caso|
|DM-INV-023|B08–B09,B40,B43|PASS; conservación y límites por caso|
|DM-INV-031|B15–B27|PASS; conservación y límites por caso|
|SM-BK-02|B02–B04|PASS; conservación y límites por caso|
|SM-BK-03|B05–B07,B42|PASS; conservación y límites por caso|
|SM-BK-04|B08–B31,B36–B39|PASS; conservación y límites por caso|
|SM-BK-05|B32–B34,B47|PASS; conservación y límites por caso|
|SM-FORB-04|B01,B43|PASS; conservación y límites por caso|
|SM-FORB-06|B25–B27|PASS; conservación y límites por caso|
|P08|B01|PASS; conservación y límites por caso|
|PLAN-B04|B02,B63–B65|PASS; conservación y límites por caso|
|PLAN-C02|B48–B53,B60–B62|PASS; conservación y límites por caso|
|PLAN-C06|B40–B44,B50,B69|PASS; conservación y límites por caso|
|PLAN-T04|B20–B21,B30–B34,B54–B59|PASS; conservación y límites por caso|
|PT-03|B35,B66|PASS; conservación y límites por caso|
|E2E-01|B66 (solo tramo local; integral H6 futura)|PASS; conservación y límites por caso|
|G5|B43–B44|PASS; conservación y límites por caso|
