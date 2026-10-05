# Evidencia correctiva — TSK-H4-011 / H4-012-F16

Alcance exclusivamente local/aislado de H4-011/012. Base publicada `7ca140ac4e3b3793d4aa49e7dbd9743d79191102`, main limpio y coincidente con origin/main tras fetch antes de escribir. El cierre anterior y sus resultados final3 son antecedentes conservados; no acreditaban este recorrido.

Expected independiente suplementario congelado en `1a5141d3caf773aa3fb948e38c4701852ba1ad08`: [expected correctivo](expected-TSK-H4-011-012-F16.md). Expected original congelado en67b2343 permanece byte a byte intacto. Fuentes: fichas y unión de65 filas Tasks§6, protocolos§2.2, SPEC-FR-CHG-001/002/003/004, MO01/02/04/05/06/09, BS05/06/10 y RV aplicables, DM-INV-017/038, Provider/Offering versionados, BR-SUP y BR-CHANGE, contratos C01–C06 y T06/T04/T08.

## Reproducción y diagnóstico

Dirección aportó una observación estática. Se convirtió en reproducción ejecutada sobre `73c7ab9b9baf4a6f12e4e62c884a87bde6d87a73`, cargando solo las43 migraciones publicadas. Cuatro casos,0PASS/4FAIL: petición B rechazada tras A→B aplicado; respuesta B rechazada; A histórico admitido como solicitante actual; OfferingV2 rechazado tras V1→V2 aplicado. [Cronología y defectos](../../tests/fixtures/h4-012-f16/defects.md), streams originales íntegros en `repro-01/*.log.gz`, status/signal/error en JSON. Los estados se alcanzan mediante catálogo, B07, aceptación/conversión H2 y modificación reales, sin sembrar versiones operativas.

Causa: `modification_source` y guarda requester Provider en `modification_apply` leían `b04_services.applied` aceptado, mientras los lectores canónicos devolvían `b04_current_services` y sus versiones operativas. Guardar historia era correcto; usarla como autoridad actual de una nueva actuación era incorrecto.

## Integración y corrección

Migración44 forward `20261005215404_h4_modification_counterparty.sql`, creada mediante CLI2.119.0 `migration new h4_modification_counterparty`; versión/help/creación y sus streams/status se conservan en `cli-new`. No se editan las43 anteriores.

Cuerpos reemplazados deliberadamente, con firmas/OID/owner/ACL/configuración preservados: `crm_private.modification_source(jsonb,uuid,uuid,text)` y `crm_api.modification_apply(bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea,bytea)`. No se afirma conservación de sus bytes. Helpers privados añadidos: `modification_source_material(jsonb,uuid,uuid,text,jsonb)` y `modification_counterparty(jsonb,uuid,uuid,text)`, search_path pg_catalog,pg_temp, sin EXECUTE a PUBLIC/runtime/anon/authenticated; solo autoridades existentes. El CREATE temporal para los owners se revoca dentro de la misma migración.

La petición usa el servicio vigente, su proveedor material cuando está fijado y la relación Offering vigente pertinente al servicio/variante. Sin proveedor fijado, una relación real por Offering sigue siendo suficiente para facultad contextual; no fabrica una asignación.

La respuesta distingue `sourceBasis=before` del compromiso anterior y `sourceBasis=desired` del compromiso nuevo. Accepted usa desired por defecto; otras respuestas usan before salvo selector explícito. El selector no concede autoridad: la contraparte, Offering, canal y cobertura se validan contra el material reconstruido. En una transición A→B, prueba A/before no acredita aceptación B/desired, ni B/desired acredita resolver A/before. Una respuesta accepted/before exige cobertura exacta del before; no se presenta como aceptación del desired. Una respuesta no aplica, libera Hold, confirma ni produce efecto económico.

Cada nueva parte captura `counterpartyBefore` mínimo: ID, versión de servicio, naturaleza, proveedor y variante. Evaluación/respuesta/aprobación/aplicación comprueban el before y esa relación material bajo locks existentes. No usan una revisión global para invalidar fechas/noches independientes. Para partes anteriores al fix, la contraparte se reconstruye en el instante de su request/change a partir de historia y versiones operativas, con baseline aceptado cuando corresponde. No se reescribe ninguna revisión histórica.

Booking y snapshots H2, B07 original/derivado, Requirement, Incident, Availability, Holds, Confirmation, Review/Task y economía siguen canónicos e independientes. No se añade Booking, catálogo, documentos, cantidades ni autorización paralelos.

## Verificación y cierre

Producto/migración/verificador congelados: `992c336cb16d39fffc1044a1b0737541614bd773`. Focal definitiva `dev-11`:96/96 (70 anteriores +26 correctivos), typecheck PASS. Regresión definitiva sobre ese SHA:1584/1584 PostgreSQL,118/118 unitarias yhealth1/1 separado; frozen/typecheck/lint-boundaries/build/auditoría producción/diff-check/V-MIG/advisors loopback PASS,0 FAIL/skipped/cancelled materiales. F16 yF17–F21 CLOSED.

[Verificación independiente correctiva](evidence-TSK-H4-012-F16.md). Los commits posteriores al SHA probado se limitarán a evidencia, logs y coordinación; no se les atribuye una ejecución nueva de producto.

## Límites conservados

H4 IN PROGRESS; H4-013+ y H5–H6 NOT STARTED. H4-014/H4-023/H5-016/H6-003/H6-004 NO ACREDITADAS. Sin motor económico D019, Refund/fianza, cierres, confirmación conjunta/inicio/ejecución completos, conectores o coordinación H5. DM-PENDING-005 abierto; sin datos reales, audio, consentimiento supuesto, retención inventada o borrado importante. Hosted H2/H3 no acreditados; Production no autorizada. STOP obligatorio tras el cierre correctivo y publicación.

## Evidencia recuperable definitiva

[Directorio correctivo](../../tests/fixtures/h4-012-f16/): matrix.json (C01–C17), final/results.json ycada status JSON, streams íntegros final/*.log.gz, byte-preservation.json (43 migraciones, fuentes yhealth-check), final-preservation.json (datos/catalogo antes/después), manifest.json (hashes comprimidos ysin comprimir), defects.md y direction-observation.md. Versiones ycomandos reales en final. Auditoría:0 vulnerabilidades de producción. Advisors fresh44:status0,signal null,error null,results=[]; el advisor histórico43 mantiene su frontera. Las96 focales y26 correctivas son subconjuntos de1584; no se suman otra vez.

El commit posterior a `992c336cb16d39fffc1044a1b0737541614bd773` solo añade evidencia/logs/coordinación. El SHA final publicado es el commit que contiene este cierre, recuperable con `git log -- specs/001-core-crm/evidence-TSK-H4-011-F16.md`; se informa exactamente tras push/fetch, sin referencia circular dentro de su propio contenido.
