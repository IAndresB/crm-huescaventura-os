# H5-009/010 — STOP en revalidación del candidato

**No hay PASS global ni cierre. F09 OPEN; F06–F08 con controles locales aprobados y cierre global pendiente.**

Candidato realmente probado: `eda8b0becb3daa2dff1baa02be53cec914750f13`. Huella ejecutable: `5f1a0810c79b19fccdb5b8da6e7448378ce5f41119474245b817abcded80004b`. Se creó este commit local candidato antes de la revalidación definitiva. No se ha creado commit documental final ni publicado. Rama main; origin/main permanece en `fdbd08bafdc6651d1ad6867242cd71791a25deb6`, divergencia 8/0 antes de añadir este informe. El PASS previo a ese commit se conserva por separado y no se atribuye al nuevo SHA.

## Bloqueo nuevo

PostgreSQL completa: **2472/2473 PASS, 1 FAIL, 0 cancelados, 0 omitidos**, exit 1. Caso `H4-014 C12 AC042 full civil day 2026-10-13T00:01:00+02:00`; error `CANCELLATION_EVIDENCE_REQUIRED:E3`, `tests/integration/postgres-h4-014.test.ts:17`. Ejecución 2026-10-12T22:20:24.275587+00:00 → 2026-10-12T22:27:19.257224+00:00.

La cadena de fuentes muestra una incoherencia temporal del fixture: C12 fija el acto en `2026-10-12T22:01:00Z`, mientras `confirmationFixture` crea la evidencia con la hora real al ejecutarse. La regresión comenzó a las22:20Z. `cancellationFixture.attest` utiliza esa evidencia; `modification_proof` delega en `payment_evidence`, que exige `occurred_at <= at_time`. La nueva evidencia resulta posterior al acto fijo y se rechaza. El error, el intervalo y las fuentes están conservados. No se ha ejecutado una reproducción adicional ni aplicado un correctivo; no se dispone de la fila generada después del cierre del entorno aislado.

**STOP aplicado sin retest, cambios de producto o ampliaciones de transiciones.** Este fallo es independiente de R52 y de R67/R030. R67/R030 continúa abierta como anomalía histórica de causa no demostrada.

## Controles del candidato ya terminados

| Control | Resultado |
|---|---|
| R52: A primero, B primero, simultáneo, inverso y fallo inducido | PASS |
| H3-006 completo | 75/75 PASS |
| Focales H4/H5, incluido V-MIG fresh/upgrade poblado/rollback/retry | 70/70 PASS |
| Unitarias | 171/171 PASS |
| Health independiente | 1/1 PASS |
| Frozen install, typecheck, lint/import boundaries, build | PASS |
| Auditoría de dependencias de producción | PASS, cero vulnerabilidades informadas |
| F01 | 12 controles esperados PASS, copia con R52 regular |
| F05 | 18 controles esperados PASS tras aislar el índice Git del arnés |
| F08/F09, recuperación, gzip, wrapper | 40 / 13 / 26 / 14 controles esperados PASS |
| Clasificación del auditor | 29 controles cubiertos; FAIL de arnés y retest separados |
| F10/F12 y preservación H5-008 | PASS antes de la regresión |
| Diff de todo el candidato preparado respecto al baseline | PASS |
| PostgreSQL completa | **FAIL: 2472/2473** |
| Advisors57 final, certificado/cierre y publicación | No ejecutados tras STOP |

El primer F05 compartía el índice Git actual con un archivo histórico temporal y por eso veía rutas posteriores ausentes. La corrección se limita al arnés desechable con GIT_INDEX_FILE propio, sin modificar las aserciones ni el auditor. Se conservan el FAIL original y las18 contrapruebas posteriores. El protocolo F01 usa una copia regular de R52 para respetar la guarda contra symlinks, sin cambiar expectativas.

## Preservación

El wrapper devuelve el código real1, conserva stdout/stderr y restaura F01, F02, preservation.log y F16 con bytes, permisos0644 y tipo regular exactos. `restorationComplete=true`; `unexpectedTrackedChanges=[]`. Expected de24.417bytes SHA-256 `b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639` intacto; manifiestos históricos intactos.

Las223 rutas del snapshot se conservan:218 directamente iguales, cuatro mediante las representaciones gzip byte a byte autorizadas y una correspondiente al auditor corregido. No se han aplicado las siete transiciones documentales de cierre. La quinta conversión gzip es la copia de recuperación adicional. Los documentos de estado conservan F09 OPEN.

La comparación F16 después del FAIL vuelve a mostrar diferencias de digest en las mismas69 de131 tablas, sin otras diferencias del documento. Los UUID sintéticos varían entre ejecuciones; C16 mantiene su contraste dentro de la misma ejecución. El JSON histórico permanece restaurado. El wrapper no acredita por sí solo la corrección de datos.

## Dos originales no recuperados

- build.log: **ORIGINAL NO RECUPERADO**,545bytes, SHA-256 `063f7ffad5445d9b2a45a17aceb16a01a6dfbbe70032787c0fdd02ea690fd0fa`.
- health-independent.log: **ORIGINAL NO RECUPERADO**,202bytes, SHA-256 `2794076bee6b763f2a15c62a692735addf3e6b08e4fa296266b92953489f6f30`.

La autorización excepcional y las nuevas comprobaciones sustitutorias siguen registradas; no equivalen a recuperar los originales ni a PASS global. Las evidencias anteriores y sus hashes permanecen intactos.

## Evidencias y trazabilidad

[Paquete de la ejecución](verification-evidence.tar.gz): 1060695bytes, SHA-256 `8dbd5f9d21102f1a03d6e7ceb7fbb52005bcca76128bf6a600593f01bae9bb4f`; 327 entradas verificadas por inventario interno. Incluye `stop-diagnosis.json`, `stop-source-trace.txt`, `f16-stop-comparison.json`, stdout/stderr completos, códigos reales, contrapruebas y FAIL/retests. Los tres borradores de automatización de cierre no se ejecutaron; solo se registra su identidad y estado, sin aplicar ni publicar sus afirmaciones previstas.

PostgreSQL stdout: 6923889bytes, SHA-256 `f9f8a2183791cc4742d4ded36c2bde4353b2f9053ab4d4e8182c86a0ffd8cac8`. PostgreSQL stderr: 33bytes, SHA-256 `a16eac04911ccdc33cc87a46df4bb5d9d9f1d72d3da4e0c00b582bf1cbc6477e`. [Inventario suplementario sellado](final-inventory.json): rutas literales, tipos, permisos, tamaños y hashes. El sello externo de su invocación queda en el recibo local de auditoría posterior; no se incorpora un hash autorreferente.

## Correctivo propuesto, pendiente de autorización

Revisar exclusivamente la preparación temporal sintética del caso de cancelación: evidencia válida no posterior al instante de su comando, manteniendo las expectativas de día civil, autoridad, reglas monetarias y producto. La ruta candidata de helper es `tests/support/h4-cancellation-fixtures.ts`, hash actual `1c3e91375632a520893f4a92d2ffd969ff17a2012776a9e7a1abdc3e51c6ec03`. Es histórica; cualquier modificación necesita inventario y autorización de transición exacta antes de aplicarse. No se propone desplazar fechas sin más ni debilitar la guarda.

Contrapruebas exigibles: C12 completo en ambos lados del límite temporal, rechazo de evidencia posterior al acto, todos los permisos/aserciones originales, focal H4-014 y preservación de la transición exacta; después nueva regresión completa sobre otro candidato identificado. No se inicia ese correctivo en este STOP.

No se cierran H5-009/010 ni F09. No se inician H5-011/012, H6 ni conectores reales. Hosted/Production no acreditados.
