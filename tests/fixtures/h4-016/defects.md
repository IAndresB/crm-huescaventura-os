# Cronología H4-016 — cierre local/aislado

- F01 técnico/verificador: dev1/dev2 ejecutados ISOLATED_TEST_NAME_INVALID por nombres heredados en runner nuevo. Se corrigió lista de selección; no test/expected histórico modificado. Retest dev3 alcanza SQL.
- F02 material: dev3 dos FAIL PAYMENT_DENIED en recepción H3; dev4 diagnóstico42702 variable x ambigua en proyección fund_summary integrada. Fuente SPEC-FR-ECON006/R32/preservación. Se conserva original. Fix alias local fx/rr en subconsulta nueva, sin cambiar función histórica publicada. Retest pendiente.

- F03 material: dev5 request FAIL42501 por final F2 resource evidence vs human_evidence normativo existente. Finalcheck se mantiene y se corrige el resource exacto; retest pendiente.
- F04 material: dev5 determine FAIL REFUND_DENIED: leyó bookingId inexistente en snapshot de determinación. Relación canónica reside en raíz H4-013. Fix join real raíz/determinación/Booking/scope, no snapshot fabricado; retest pendiente.

- F05 técnico SQL: dev6 alias r ambiguo por variable resultado r en core. Fix receipt y aliases de agregados av/mv; originales intactos, retest pendiente.

- F06 material: dev7/dev8 TTE reserve rechazó mismo medio. Diagnóstico REFUND_METHOD_EXCEPTION_REQUIRED: method existe en detección H3, no receipt. Se usa source path real detection.method. Retest pendiente.
- F07 técnico/verificador (observación estática previa a dev7): focal llamado AC035 usaba cancelación voluntaria a3d con base200 y derecho100. Se corrigió fixture causa provider para derecho200 y expected120 constante normativo; PM06 conserva voluntaria. Expected congelado no cambió.

- F08 técnicoSQL: dev9 movimiento FAIL22P02, precedence jsonb extraction/minus array. Fix paréntesis explícitos `(m->identity)-array`; no cambio normativo. Retest pendiente.

- F09 técnico/verificador: dev11 R10/R14 regex esperaba guard ALLOCATION_REFUND_PORTION_USED; guard anterior legítima fund_usable produce ALLOCATION_PORTION_UNVERIFIED. Ambas deniegan mismo efecto. Aserción admite ambos códigos de rechazo, conservación exacta sigue exigida; no expected debilitado.
- F10 técnico/verificador: dev11 R11 esperaba rechazo de segunda resolución con mismo movimiento; oráculo R09/G5 exige recuperación idempotente sin segunda salida. Retest verifica replay true y ejecutado80 inalterado. Expected congelado intacto.
- F11 técnico/verificador: dev11 negativas RF03 amount/recipient/conditions no capturaban rechazo previo de HA material. Todo propose/execute queda dentro de assert.rejects; Refund anterior intacto exigido.
- F12 material: dev11 revoke falla42883 jsonb_set boolean en lugar de jsonb. Fix literal true::jsonb en revocar/re-determinar, conserva autorización histórica; retest pendiente.

- F13 material: dev12 R11 FAIL ejecutado: resolución de intento80 admitió salida20 ajena y liberó reserva80. Fuente AC057/SM-RF05/06/R11. Fix exige misma porción e importe del intento para resolver como salida; no libera porción ajena. Original dev12 íntegro. Retest pendiente.
- Observación estática de orden de locks: Refund adquiría Booking52 antes de payment-root, Allocation lo hace después. Se armoniza Refund payment-root antes de Booking52, manteniendo padre operativo31 y cancelación primero. No se afirma FAIL ejecutado de deadlock.

- F14 técnico/verificador: dev13 dos FAIL AC027 por summary.allocated inexistente → NaN. Se usa campo canónico assigned existente. Overlap y rechazo de uno fueron observados; retest mantiene suma80, no160.

- F15 técnico/verificador: dev15 typecheck TS18047: posible null de lectores en aserción C01. Añadidas assert.ok(before/after), sin variar expected. Retest pendiente.
- dev14 focal/matriz/V-MIG 76/76 PASS, cero fail/skipped/cancelled. F01–F14 reproducidos/retesteados en cobertura pertinente; cierre final pendiente regresión definitiva.

- F16 material: dev17 R09 FAIL, mismo movimiento fiable con fundRevision posterior se rechazaba E2. Identidad material de salida no incorpora revisiones técnicas de observación; se excluyen solo paymentRevision/fundRevision en comparación idempotente, no en nuevas guardas de consumo. Retest pendiente.
- F17 material: dev17 AC063 FAIL: derecho revisado impedía registrar salida real sobrevenida aun con Incident. Autorización anterior no pasa a vigente: solo conserva hecho excepcional como no autorizado, Incident existente exigido. Sin Incident se conserva rechazo E2. Retest pendiente.

- F18 técnico/verificador: dev18 nueva Refund con proof ligado al ID del fixture original fue denegada antes de guarda de derecho duplicado. Proof se liga al nuevo ID por contrato B07 real. Expected no cambia; retest pendiente.

- F19 técnico/verificador: dev19 TTE waiting fixture esperó revocación síncrona mientras transacción TTE conserva lock de autoridad, causando espera circular del harness. Intervención técnica pg_terminate_backend del blocker sintético; log conserva FAIL. Corrección inicia revocación concurrente y libera blocker; verifica orden serial de autoridad y rechazo de replay después de revocación. No se afirma revocación consumada antes del COMMIT autorizado.

- F20 técnico/verificador: final1 SHA391ae8c typecheck TS2345 tras sustituir suma Number por núcleo monetario exacto; proyección fundsummary es unknown. Conversión textual String en entrada exacta conserva expectativa80.00, nunca floats. Nuevo SHA y regresión completa requeridos.

- F21 técnico/verificador: dev21 independencia exigía commit concurrente del mismo actor mientras F2 conserva lock de actividad/autoridad. Espera circular de harness, no conflicto material de alcance. Intervención técnica sobre blockers sintéticos; originales conservados. Retest: ambas operaciones solapadas esperan autoridad compartida, luego confirman sin invalidación por revisión de otro Booking. No se acredita commit paralelo del mismo actor bajo F2.

## Cierre cronológico

F05/F08 se reclasifican de técnico SQL a material por estar sus errores en producto; se conserva clasificación inicial y FAIL. F02/F03/F04/F05/F06/F08/F12/F13/F16/F17: materiales. F01/F07/F09/F10/F11/F14/F15/F18/F19/F20/F21: técnicos de verificador. Todos F01–F21 CLOSED tras dev22 93/93 y regresión final3 sobre c1eb4ae796b01ab7dd955365a22e392e4b4bf1be: 1788/1788 PostgreSQL, 138/138 unitarias, health1/1, gates/V-MIG/advisors PASS. No expected debilitado ni FAIL reemplazado. La limitación documental de streams iniciales CLI/intervenciones queda declarada; no se afirma recuperación de campos ausentes.

- F22 exclusivamente documental: diff-check staged de cierre FAIL2 por CRLF del CSV (Python csv.writer predeterminado). Captura completa original closure-diff-f22. Se normaliza LF sin cambiar campos/expected/observado. CLOSED tras diff-check PASS. Producto y lógica de pruebas permanecen en SHA c1eb4ae; no nueva ejecución atribuida a cierre documental.
