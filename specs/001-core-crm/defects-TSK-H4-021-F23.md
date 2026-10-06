# Defectos del correctivo H4-020/021-F23

F01–F22 anteriores conservados, numeración nueva desde F24.

|ID|Clasificación|Estado|Original|Causa/corrección|Retest|
|---|---|---|---|---|---|
|F23|material; inicialmente observación estática de dirección|OPEN, fix implementado / gates exactSHA PENDING|repro-original|Booking cancelada por contratos ordinarios; read usa fase de preparación y core permite nueva evaluación; fix aún no aplicado|PENDING|
|F24|técnico de fixture|corregido / retest desarrollo PASS|repro-original D/C08|snapshot anterior a generar pruebas del propio comando incluía creación legítima de evidencias como efecto de la operación; generar comando antes del snapshot|repro-fixture-corrected D/F/C08 PASS|
|F25|técnico de fixture|corregido / retest desarrollo PASS|repro-original F|obligationFixture contiene un servicio, no S2; fixture parcial usa conversión ordinaria invoiceFixture de dos servicios|repro-fixture-corrected D/F/C08 PASS|

Streams y snapshots originales íntegros en capturas /tmp/h4-f23; se incorporan gzip+manifest antes de publicar verificador. Dirección no ejecutó PostgreSQL. Ninguna acomodación del expected correctivo/original. Rechazos upstream D/C08 no refutan A/B/C/E/G. Campos de captura SHA/árbol/tiempos/status/signal presentes, sin reconstrucción.

|F26|técnico de inyector|corregido / retest desarrollo PASS|races-atomic-1|faltaban separadores SQL antes de THEN/FOR; no fallo de producto ni de COMMIT ejecutado en esos cinco casos|races-atomic-2 PASS17/17|
|F27|técnico de fixture concurrente|corregido / retest desarrollo PASS|races-atomic-1|comando capturaba material antes de preparar Modification; request/approval cambia material antes de la carrera; construir comando tras precondiciones|races-atomic-2 PASS17/17|
|F28|técnico de fixture seguridad|corregido / retest desarrollo PASS|races-atomic-1 C15|read después de reenable intentaba reutilizar sesión revocada por disable; conservar actual observado antes del mutador, no reactivar sesión|races-atomic-2 PASS17/17|

Focal-fix-1:8/8 PASS. VMIG-1:3/3 PASS sobre árbol propio sucio; no acredita gates SHA definitivo. Nuevo core/read y runtime50→51 conservados según catálogo. Capturas originales permanecen íntegras.

F24–F28 técnicos: retest desarrollo PASS; cierre definitivo PENDING gates exactSHA. F23 material:9/9focales y17/17concurrencia/atomicidad y3/3V-MIG PASS, estado formal todavía OPEN hasta cierre. Ningún F29+ registrado.
