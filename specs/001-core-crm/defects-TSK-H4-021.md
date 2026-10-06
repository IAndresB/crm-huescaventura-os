# Registro de defectos H4-021

Originales completos conservados en `tests/fixtures/h4-021/development/`, gzip sin pérdida y manifest. Las ejecuciones de desarrollo llevan árbol propio sucio y captura SHA al finalizar; no acreditan SHA exacto final. Campos ausentes en logs iniciales CLI/bootstrap/typecheck (status/signal/tiempos/Git inicial) permanecen AUSENTES, sin reconstrucción. F19/F20 son observaciones estáticas identificadas, no ejecuciones FAIL. Expected normativo nunca modificado. Registro final se valida contra gates del SHA definitivo.

|ID|Clasificación|Original/reproducción|Causa|Corrección|Retest desarrollo|
|---|---|---|---|---|---|
|H4-021-F01|técnico|bootstrap-1|Storage no configurado al lanzar node directamente|runner oficial con Storage real loopback|bootstrap-3|
|H4-021-F02|técnico|bootstrap-2|OWNER executor requiere CREATE temporal al transferir trigger-function|CREATE temporal revocado al terminar migración|bootstrap-3|
|H4-021-F03|técnico|flow-1/flow-2|alias/conflicto variable SQL en lectura de insumos|alias inequívoco|flow-3|
|H4-021-F04|técnico|flow-3|fixture propose incluía campo sourceEvidenceId no aceptado|payload exacto del contrato H3|flow-4|
|H4-021-F05|técnico|flow-4|fixture presuponía revision0 tras refresh|revisión actual observada como precondición|flow-5|
|H4-021-F06|técnico|flow-5|contador global Task mezclaba Task del Provider Confirmation|verificar causa/Booking exactos y unicidad|guards-3|
|H4-021-F07|técnico|guards-1|alias cl ambiguo en consulta de necesidad|alias SQL inequívoco|guards-3|
|H4-021-F08|técnico|guards-2|partId extra en material padre HA|material padre separado de part con esquema exacto|guards-3|
|H4-021-F09|técnico|guards-2|fixture modificaba request pero aún no aplicaba el cambio|secuencia request/evaluate/approve/apply real|guards-3|
|H4-021-F10|técnico|guards-3|asserter esperaba error de Booking directo en TTE|preservar máscara H0_011_RESERVE_DENIED y diagnóstico SQL aislado|races-2|
|H4-021-F11|técnico|races-1|fixture sin coordinación exigía En confirmación en vez de fase inicial|registrar start antes de carrera; expected intacto|races-2|
|H4-021-F12|técnico|races-2|snapshot SQL pegaba nombre de tabla y alias|separador de alias|vmig-atomic-1|
|H4-021-F13|técnico|typecheck-4|wrapper estructural de fallo requiere cast explícito unknown|tipado del doble técnico, ejecución COMMIT real intacta|typecheck-5|
|H4-021-F14|técnico|concrete-1|commercialBasis de noche mezclaba otra noche|subset de contribuciones de la noche desde filas aceptadas|concrete-2|
|H4-021-F15|técnico|concrete-1/typecheck-4|cat helper no recibe parent de variante|rutas create_item/publish_version con parent item/revision|concrete-3|
|H4-021-F16|técnico|concrete-2|rectify sin review previo prohibido por contrato existente|review auténtico previo, luego nueva prueba/corrección|concrete-3|
|H4-021-F17|técnico|concrete-4|attest fixture reemplazaba evidencia extranjera antes de enviar|alterar ID de prueba después de attestation en ensayo negativo|concrete-5|
|H4-021-F18|material|concrete-4|resolución Availability revision asumía opportunity_id inexistente|resolver Booking por raíz Availability.booking_id|concrete-5|
|H4-021-F19|material - observación estática|checkpoint/revisión|faltaban IDs indirectos y raíz de revisión B06 en coordinación; no FAIL ejecutado atribuido|mapeo roots y triggers de padres/revisiones; actualidades y carreras reales posteriores|concrete-5|
|H4-021-F20|material - observación estática|checkpoint/revisión|referencia global heredada no reflejaba fecha de servicio aplicada; sin FAIL ejecutado atribuido|usar fechas de scopes vigentes y exigir review de reference H3; no nuevo calculador|focal-final-dev-2|
|H4-021-F21|técnico|focal-final-dev|snapshot de epochs asumía columna actor_id|tabla verificada, snapshot íntegro epochs; autoridad por API existente|focal-final-dev-2|
|H4-021-F22|técnico|focal-final-dev-3|Asserter abreviaba Ganada; enum aprobado SM dice Aceptada / Ganada|usar texto exacto aprobado, expected Ganada semántico intacto|regresión definitiva pendiente|
