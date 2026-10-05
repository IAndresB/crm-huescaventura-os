# H4-011/012 — evidencia local/aislada

Base `060c74c453c03f417bbb9aea889b6650332dc1a0`; expected `67b23439729813def29a09111092b417bf4313e8` inalterado; SHA exacto probado `8cee967867af41df2cd818669c322b7de18670c0`. Cadena en evidencias por tarea. `final3/` es la regresión acreditada; `final/` FAIL histórico y`final2/` SUPERSEDED se conservan completos sin atribuirlos al SHA final.

- `run-regression.mjs`: runner reproducible frozen gates. `final3/results.json` conserva comandos, argumentos, instantes, exit/status/signal/error.
- `*.log.gz`: gzip sin pérdida de streams completos (no extractos), recuperables con `gzip -dc`. `.exit` y `.status.json` conservan campos capturados. La limitación original dev01–03/typecheck01/02 está declarada en defects.md.
- `matrix.md`/`matrix.json`:39 grupos normativos y70 nodos PostgreSQL observados, incluidos en1558 sin doble cómputo.
- `regression.json`, `preservation.json`, `manifest.json`, `defects.md`: resultados exactos,42previas/fuentes/health, hashes yF01–F15 CLOSED conFAIL conservados.
- `historical-harness-retest.log.gz`:1/1 conserva dosdefectos históricos esperados. `*-regenerated-h2-011-*.log.gz`: salidas históricas generadas recuperables; archivos antiguos restaurados a sus bytes, no reescritos por este cierre.

Solo fixtures sintéticos yPostgreSQL17.11/Storageprivado loopback. Inyecciones privilegiadas identificadas como fallo/seguridad. No mocks de Refund/ClosureAssessment ni estados futuros para acreditar capacidades ausentes.

H4-013+ y H5–H6 NOT STARTED. H4-014/H4-023/H5-016/H6-003/H6-004 NO ACREDITADAS. No motor económico D019, Refund/fianza, confirmación conjunta/inicio/ejecución completos, Closure Assessment/cierres, conectores ni coordinación H5. DM-PENDING-005 abierto; sin audio/datos reales/retención inventada/consentimiento supuesto/borrado automático importante. Hosted H2/H3 no acreditados; Production no autorizada. STOP tras H4-012; continuidad al hilo de dirección H4 con nueva autorización humana.
