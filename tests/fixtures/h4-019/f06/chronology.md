# Continuación F06

Base f8318fad8bf8a7b6d8224330dc1b8840288dba60; expected correctivo 6c1f060a560e28e513e87f186e16a54911a1a444.

F06, material de acreditación. Antecedente estático y logs anteriores OPEN conservados. `original-F06` ejecutado antes de producto: dos sesiones/PID/xid reales, primera espera advisory payment-root, segunda transactionid actor. Un solo efecto80 sobre100; no sobreconsumo demostrado. FAIL ejecutado de acreditación `F06_EXPECTED_BUSINESS_OVERLAP_NOT_REACHED_ON_ORIGINAL48`, stdout/stderr/status íntegros. Reproducer archivado después de ejecución para no mezclar un FAIL histórico deliberado con regresión actual. Producto anterior intacto. F06 continúa OPEN hasta verificar cadena corregida, autoridad, matriz y gates.

CLI2.119.0 y migration new --help capturados; documentación oficial CLI y PostgreSQL17 locks consultadas. Changelog Supabase descargado íntegro: breaking changes de PostgreSQL17.11 revisados; entorno ya17.11, sin upgrade de herramientas. No cambio de API/Storage/hosted.

## F07 — material, regression in first unpublished draft

`focal-current` and `authority1`: CATALOG_DENIED before economic fixtures. Diagnosis: copying the M03 admit definition lost later H1/H2/H3/H4 operation/purpose expansions. This was an implementation regression in the unpublished forward draft, not a defect of the base. Correction: derive current pg_get_functiondef and replace exactly one actor lock; fail closed if source differs. Preserve every other byte and function attribute. Original FAIL streams retained. Retest pending.

## F08 — technical, new verifier

`authority1` V-MIG SQL observation failed42702 ambiguous oid in joined catalog query, before comparison. Qualify c.oid, unchanged normative assertions. Original FAIL retained. Retest pending.

## F09 — technical fixture lifetime

`authority2`: first disable test PASS; later fixtures CATALOG_DENIED. Disable legitimately increments actor generation, making the original fixture session obsolete. Corrective verifier uses fresh current49 cluster/session fixture per authority case; no product authority reset or weakening. Original FAIL retained.

## F10 — technical catalog comparison

`authority2` V-MIG strict comparison saw driver Result prototype versus mapped Array despite equal rows. Compare JSON-normalized catalogs on both sides, preserving every field and all function/body assertions. Original FAIL retained.

## F11 — technical inventory buffer

`authority4` A11: git ls-tree returned null status because the full repository file inventory exceeds spawnSync default buffer. Separate diagnostic preserves actual ENOBUFS/signal/bytes; missing original error fields are not reconstructed. Increase only inventory capture maxBuffer32MiB; all byte comparisons unchanged. A12 advisors current49 PASS, original streams/status preserved. Retest pending.

## F12 — technical new J07 fixture

`focal-current4`: Allocation competitor rejected ALLOCATION_OBLIGATION_EXCESS in both orders. Full cancellation of the entire100 obligation made Allocation to that obligation illegitimate, independently of authorization. Original guard rejection retained. Replace only new J07 fixture with real shared payment against900 fixed Booking and explicit legitimate100 component determination (ordinary Administrator/B07 contract, as original J03/J04). Remaining800 obligation admits the competing Allocation80. No fake cancellation base for guarantee and no product/expected change. Retest pending.

Retests previos al freeze: focal-current5 63/63 (61 anteriores+2 J07/T08); authority5 13/13; security-new49 149/149. F07–F12 RETEST PASS, preservación de todos los FAIL ejecutados, pendientes de regresión definitiva para cierre completo. F06 sigue OPEN hasta nueva regresión exacta y cierre. Los SHA de captura anteriores identifican HEAD del momento; producto/verificador tenían cambios locales en desarrollo, y no se les atribuye ejecución de un árbol limpio congelado.

## F13 — documentary log packaging / diff gate

`diff-before-freeze` FAIL: original initdb stdout has a final blank line, preserved verbatim as originally captured. Raw stream creates git diff whitespace warning. Lossless gzip of the captured streams fixes packaging without modifying any byte recovered; manifest original/stored hashes and decompression verified. Not a product/authority failure. Original diff stdout/status preserved. Retest diff PASS required before definitive freeze.

## F14 — técnico de entorno tras interrupción

La primera regresión exacta fue interrumpida por el usuario; no existe status final capturado y no se reconstruye. Se conserva íntegra como interrupted-final-1. El reintento failed-final-1 terminó status1:1953 pruebas,1938 PASS/15 FAIL, sin skipped/cancelled. Los15 FAIL comparten el before de H0-012: pg_ctl no inicia, antes de las guardas funcionales; los descendientes normativos del contenedor formal no se alcanzan. Observación independiente posterior: PID74703, PPID1, creado al inicio del primer intento, PostgreSQL temporal crm-h012-independent-Z2ejTY vivo en127.0.0.1:55422. Se conserva ps/cmd/status; pg_ctl detiene exclusivamente ese cluster y el PostgreSQL Storage temporal propio del intento interrumpido, ambos status0. No reset, cambios SQL, producto, expectativas ni aserciones. Nuevo retry completo del mismo SHA7d8bfc en curso. El postgres.log del cluster nuevo fallido fue eliminado por el after histórico; no se reconstruye. Los dos FAIL de Acceptance impresos dentro del subprocess histórico son reproducciones históricas deliberadas, cuyo test contenedor PASS se conserva, y no son el diagnóstico de F14. OPEN hasta retest completo.

## F15 — técnico del nuevo verificador: unidad de rechazo de migración no fijada

failed-final-2 sobre7d8bfc:2009/2010 PASS, un FAIL A10 al leer Refund después de upgrade (REFUND_DENIED público). Todos los anteriores, incluido H0-012, pasan; no cierre completo. Reproducer técnico F15-pool-four obtiene UNSAFE_TRANSACTION en el primer BEGIN enviado por unsafe al poolmax4; rollback posterior usa otroPID y queda backend idle in transaction(aborted). Una lectura técnica posterior selecciona ese backend y devuelve25P02. Single-connection no reproduce el residual, documentado separadamente. No es pérdida de derecho/datos por migración; comparación previa de datos y catálogo pasó antes de leer. Corrección mínima de A10: ejecutar intento de migración con rol runtime dentro de runtime.begin, conexión fijada y rollback del driver en la misma unidad; exigir SQL42501/MIGRATION_AUTHORITY_REQUIRED exacto, y cero backends idle in transaction. Se refuerza el rechazo de autoridad, no se elimina ni debilita aserción de preservación. Producto/SQL/expected intactos. Reproducer original y streams/status completos conservados. RETEST pendiente; nuevo SHA requerido por cambio de lógica del verificador.

F15 retest diagnóstico: unidad fijada obtiene rechazoSQL42501/MIGRATION_AUTHORITY_REQUIRED real, cuatro backends idle sin residual,8 siguientes transacciones ordinarias PASS. Las ejecuciones diagnósticas no sustituyen A10 ni la regresión; SHA capturado7d8bfc identifica HEAD previo, con código diagnóstico local explícito. Originales, variante single/four y corrección archivados .txt fuera de discovery. Próxima regresión en nuevo SHA congelado.

## Cierre definitivo separado — 2026-10-06

SHA exacto 9799de20fcd4f2100f6918d28ffcbec46df203b0: PostgreSQL 2010/2010, 138/138 unitarias, health 1/1 separado y todos los gates/V-MIG/advisors PASS. F06 CLOSED material de acreditación; original FAIL no se reinterpreta. F07 CLOSED material del borrador; F08/F09/F10/F11/F12/F14/F15 CLOSED técnicos; F13 CLOSED exclusivamente documental. Retests detallados en matrix.md y final/regression-summary.json, originales en development, interrupted-final-1 y failed-final-1, failed-final-2 y F15-diagnostic. El cierre posterior no modifica producto, SQL, dependencias ni lógica de pruebas. H4-020+ y H5/H6 NOT STARTED. STOP.
