# Evidencia independiente — TSK-H4-012

**COMPLETED local/aislado**, únicamente el alcance de H4-011/012. Expected derivado de fuentes antes del producto, congelado en commit separado y publicado; no modificado para PASS. [Expected](expected-TSK-H4-011-012.md) incluye unión literal Tasks§6 y39 grupos (19 transiciones+R01–R20). [Matriz independiente](../../tests/fixtures/h4-012/matrix.md), [matriz JSON](../../tests/fixtures/h4-012/matrix.json), [unión de filas asignadas](../../tests/fixtures/h4-012/traceability.json), [manifest](../../tests/fixtures/h4-012/manifest.json) y [preservación](../../tests/fixtures/h4-012/preservation.json).

V-DOM/V-DAT/V-SM/V-NEG: SQL independiente ycontratos reales; MO01–10, RV01–04, BS05/06/09/10, BK09, FORB08/09/10/11/13/18. Las retiradas individuales conservan estado anterior yguardas/pedidos. Se cubren aprobación/aplicación parcial, antes/después vigente e histórico, respuesta enviada/acreditada/ambigua/tardía, incertidumbre e Incident real, alternativas/agenda, participantes/noches, D019 yD020, privacidad yprohibiciones sin preparar capacidades futuras.

Fixtures: conversión H2 real con ProposalVersion/Acceptance, cantidades12/10/nominales, registros B07 privados yReview reales, Requirement recibido/revisado, IncidentINC, Availability, Hold preBooking yProviderConfirmation. No se escriben estados de negocio privilegiados para eludir contratos; autoridad migration/admin solo instala yobserva oinyecta fallos/seguridad identificados.

V-AT: sesiones PostgreSQL distintas, ambos órdenes yoverlap observado vía pg_stat_activity esperando lock real. Alta/replay/conflicto, dosaplicaciones, aprobación/cambio, aplicación/retirada/parcial/nuevaevaluación, cancelacionescontribución, Needrevalidación ymodificación frente aConfirmation/Availability/Hold. Compara versión/material vigente, historia yresultado, sin lostupdate ni propagación aindependientes. Inyecciones beforeinsert por escritura/transición yconstraint trigger deferred alCOMMIT; estado completo ylectores canónicos rollback exacto, retry válido. Respuesta perdida después de COMMIT PostgreSQL durable recupera mismoresultado sinsegundaaplicación.

V-MIG: fresh43; upgrade desde42 poblada con NeedRevisado/originalprivado, Incident/código/historia, AV/Hold/PC; comparación de datos ycatálogo anterior; falloDDL rollback yretry. Funciones8 deliberadamente integradas conservan firmas/OIDs/ACL/owner/config; no seafirma cuerpoidéntico.42 migraciones, fuentes aprobadas, expected yhealth-check bytes/hash intactos.

Verificadores: `postgres-h4-011.test.ts` focal; `postgres-h4-012.test.ts` y`postgres-h4-012-supplement.test.ts` independientes; soporte fixtures/isolation no esoráculo deexpected. Ajuste histórico mínimo H2-008 F15 separa3ms cronología posterior real; preserva SQL/texto original, aserciones, frontera y55PASS/2FAIL esperados. Su hijo stdout/stderr/status/signal/error se captura completo enregresión. Salidas FAIL originales nunca sustituidas. El resultado positivo del reproducer significa que losdosdefectos históricos originales siguen reproducibles, no unFAIL material del productoactual.

Base exacta `060c74c453c03f417bbb9aea889b6650332dc1a0`; expected congelado/publicado `67b23439729813def29a09111092b417bf4313e8` (SHA256 `47367fc895f67d3dc9d4c2e728bdba14caa4d5f17aa88a1e118cedc5985f1d1b`), bytes inalterados. SHA exacto producto/migración/verificador probado `8cee967867af41df2cd818669c322b7de18670c0`. El commit posterior solo añade logs/evidencia/coordinación; su SHA se obtiene en Git y en el informe final, separado de la ejecución acreditada.

Cadena lineal hasta el SHA probado:

```text
67b23439729813def29a09111092b417bf4313e8 test: freeze normative expected for H4-011/012 operational modification
a8f8aa6f44ca110980b2b59720341ff5af9baf6c feat: apply scoped operational modifications with retained coverage history
77aa516d54915b226b6141ab1135a459fff1a396 test: independently verify H4-011/012 transitions scopes races and rollback
2b02978b2a83f62b7d3fbfc30cda66b563dc76f6 fix: accept source-backed provider modification requests without fictitious assignment
28b0fe9ff113ee85cd5472f267c3463b07c841ea fix: reuse civil kernel and retain precise historical verifier chronology
8cee967867af41df2cd818669c322b7de18670c0 test: prove confirmed rafting remains covered after independent group change
```

Entorno: Node24.21.0, pnpm11.19.0, PostgreSQL17.11 (Postgres.app), CLI Supabase2.119.0 documentada. PostgreSQL y Storage privado aislados en loopback; fixtures exclusivamente sintéticos. CLI migration new documentada, sin timestamp inventado. Oficial: [migration new](https://supabase.com/docs/reference/cli/supabase-migration-new), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). Sin proyecto hosted, Cloud ni Production.

Regresión exacta `final3`:1558/1558 PostgreSQL =1488 anteriores+70 del bloque (1 focal y69 independientes),118/118 unitarias; health-check independiente1/1 separado. Cero FAIL/skipped/cancelled materiales. Instalación frozen, typecheck, lint/boundaries, build, auditoría producción (0 vulnerabilidades,57 dependencias), V-MIG, advisors loopback y diff-check PASS. Nombres, streams y status/signal/error/instantes por comando en [results.json](../../tests/fixtures/h4-012/final3/results.json). Advisors completos dentro de stdout PostgreSQL, exit0, results[]; la frase de CLI “remote database” corresponde a URL loopback sintética comprobada por el test, no hosted.

F01–F15 CLOSED local/aislado; [cronología](../../tests/fixtures/h4-012/defects.md) conserva FAIL originales y observaciones estáticas diferenciadas. Limitación explícita: dev01–03 y typecheck01/02 no capturaron fichero separado status; streams combinados conservados, no se inventa ese campo. Logs restantes incluyen exit; final3 streams separados completos. `final` FAIL histórico1555/1556 y `final2` SUPERSEDED no se atribuyen al SHA definitivo. Compresión gzip sin pérdida, no extractos.

H4-013+ y H5–H6 NOT STARTED. H4-014/H4-023/H5-016/H6-003/H6-004 NO ACREDITADAS. No motor económico D019, Refund/fianza, confirmación conjunta/inicio/ejecución completos, Closure Assessment/cierres, conectores ni coordinación H5. DM-PENDING-005 abierto; sin audio/datos reales/retención inventada/consentimiento supuesto/borrado automático importante. Hosted H2/H3 no acreditados; Production no autorizada. STOP tras H4-012; continuidad al hilo de dirección H4 con nueva autorización humana.
