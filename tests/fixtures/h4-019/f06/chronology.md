# Continuación F06

Base f8318fad8bf8a7b6d8224330dc1b8840288dba60; expected correctivo 6c1f060a560e28e513e87f186e16a54911a1a444.

F06, material de acreditación. Antecedente estático y logs anteriores OPEN conservados. `original-F06` ejecutado antes de producto: dos sesiones/PID/xid reales, primera espera advisory payment-root, segunda transactionid actor. Un solo efecto80 sobre100; no sobreconsumo demostrado. FAIL ejecutado de acreditación `F06_EXPECTED_BUSINESS_OVERLAP_NOT_REACHED_ON_ORIGINAL48`, stdout/stderr/status íntegros. Reproducer archivado después de ejecución para no mezclar un FAIL histórico deliberado con regresión actual. Producto anterior intacto. F06 continúa OPEN hasta verificar cadena corregida, autoridad, matriz y gates.

CLI2.119.0 y migration new --help capturados; documentación oficial CLI y PostgreSQL17 locks consultadas. Changelog Supabase descargado íntegro: breaking changes de PostgreSQL17.11 revisados; entorno ya17.11, sin upgrade de herramientas. No cambio de API/Storage/hosted.
