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
