# Expected independiente F30 — previo al parche

Base publicada: `60ac2eb9d382931f4ef1e17555b29b1986cb170b`. Alcance exclusivo: parche source-map-js y reverificación/cierre correctivo H4-015/016. No modificación del producto Refund, SQL, verificadores históricos ni fuentes aprobadas.

Fuentes: autorización humana de este bloque; [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), versiones afectadas >=1.0.0 y <1.2.2; [release v1.2.2](https://github.com/7rulnik/source-map-js/releases/tag/v1.2.2); ayuda pnpm 11.19.0 update (selección por paquete, profundidad y rango vigente); expected original H4-015/016 y suplemento F23 congelados.

|ID|Precondición / acción|Expected / prohibiciones / evidencia|
|---|---|---|
|P01|Capturar árbol actual, consumidor y auditoría antes del cambio|Instancia 1.2.1 identificada en Next→PostCSS; FAIL conservado con streams/status reales; no reinterpretar como PASS|
|P02|Actualizar selectivamente source-map-js dentro del rango comprobado|Resolución exacta 1.2.2 e integridad suministrada por pnpm; ninguna instancia vulnerable en árbol de producción; sin dependencia directa ficticia ni exención|
|P03|Comparar manifiesto y lockfile completos|Next16.3.6, React/DOM, Postgres, TypeScript/tipos, Node/pnpm y versiones ajenas preservados; solo registros de resolución/integridad necesarios|
|P04|Instalación limpia congelada en directorio local desechable, árbol real y auditoría|Lockfile reproducible, source-map-js1.2.2 efectivo; audit producción PASS sin ignore/supresión; sin secretos ni modificación del árbol usuario por instalación desechable|
|P05|Congelar y publicar SHA; gates frozen/typecheck/lint/build/unit/PG/health/V-MIG/advisors/diff|Todos PASS sobre SHA exacto; PG1831 y unit138 como referencia, recuentos observados sin doble cómputo, health separado; advisors solo loopback|
|P06|Comparar bytes contra base y reejecutar matrices históricas/correctivas|47 migraciones, producto, expected previos, fuentes, health/documentación y aserciones intactos; F13/F24 mantienen rechazo; salida20/pendientes180/reserva60; resto no ocurrido reserva0 y salida20; salida60 adicional ejecutado80/pendientes120/reserva0|
|P07|Cierre solo después de P01–P06 PASS|F30 CLOSED y cierre F23/F24 COMPLETED local/aislado; conservar FAIL y F26/F28 materiales, cronología y limitaciones; ningún efecto externo; H4 IN PROGRESS, H4-017+ y H5–H6 NOT STARTED, STOP|

Resultados derivados de fuentes y autorización antes del producto; no usar helpers nuevos como oráculo ni adaptar estos bytes para PASS. Cada log debe conservar comando, SHA, streams, status/signal/error disponibles y hashes. Integraciones futuras permanecen NO ACREDITADAS. Hosted H2/H3 no acreditados; Production no autorizada.
