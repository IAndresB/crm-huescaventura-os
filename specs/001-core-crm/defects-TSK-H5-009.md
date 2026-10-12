# Defectos — TSK-H5-009/010

## H5-009-F01 — CLOSED local/aislado

Detectado durante el gate histórico, después de congelar el expected independiente y comenzar implementación local. La migración nueva `20261008192000_h5_external_event_receipts.sql` eleva el inventario a 57; la guarda histórica H5-008 conserva un límite exacto de 56 migraciones. El bloqueador es documental/verificador y de preservación, no un fallo funcional de H5-009 ni evidencia de corrupción de migraciones.

### Reproducción y observado

Comando aislado: `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node scripts/test-postgres.mjs postgres-h5-008-migration.test.ts`.
Log íntegro de la reproducción (2.235 bytes; SHA-256 `e0fc40862757cdb6cc821cc8efd6c0f4449e7aa8882d8d33eefe4f4d850d8ac4`): [h5-008-preservation-gate-f01.log.gz](../../tests/fixtures/h5-009/h5-008-preservation-gate-f01.log.gz).

| Caso | Observado | Resultado |
|---|---|---|
| W48/W49 — fresh56, upgrade poblado55, rollback y retry | PASS | El gate local/aislado de upgrade anterior se completa. |
| W50 — advisors PostgreSQL loopback | PASS | `results=[]`. |
| W53/W54/W56 — preservación histórica F10/F12 y verificadores | FAIL | `tests/integration/postgres-h5-008-migration.test.ts:33`: esperado `56`, observado `57`. Exit 1. |

La guarda exacta era el conteo global `assert.equal((await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')).length,56)`. Contaba migraciones futuras y no protegía los bytes de la migración 56. La comparación previa de 55 archivos se refería a `187bb1bb1de81c2bd4884f56de930d35acb93d26`, objeto no disponible en este checkout. El cierre publicado H5-008 `5e3add4b2c82fc5b0e459b43ea0685393c495840` contiene las 56 migraciones históricas completas. El auditor independiente `scripts/verify-h5-008-evidence.mjs` conserva el registro de su hito histórico 55→56 y no se modificó.

El ensayo focal H5-009 PostgreSQL anterior alcanzó 8/9 PASS; una aserción de la prueba de rechazo comparó con cero registros aunque el aislamiento conservaba eventos de casos anteriores. Se corrigió únicamente el baseline de esa aserción, pero no se retesteó antes del STOP. El primer intento focal sin `STORAGE_H1_ENDPOINT` local falló por precondición de entorno (`ISOLATED_STORAGE_REQUIRED`) y se repitió por el runner aislado oficial. Los resultados conservan sus estados y no se atribuyen a un SHA de producto.

### Correctivo autorizado y retests

Se cambió únicamente la guarda W53 y su prueba directa: deriva los 56 nombres del cierre publicado H5-008, exige el prefijo exacto de nombres/orden, compara cada archivo por bytes y SHA-256 y permite migraciones posteriores ordenadas. No se modificaron migraciones, manifests ni snapshots congelados; el auditor H5-008 y el verificador H5-006/F10 permanecen intactos.

Contrapruebas en copias temporales: 56 intactas PASS; 57 con migración H5-009 válida PASS; alteración de #1, intermedia, #55 y #56 FAIL esperado; eliminación histórica FAIL; reemplazo por comentario FAIL; cambio de whitespace #56 FAIL; inserción histórica no autorizada FAIL; cadena F10/F12 PASS y verificador previo PASS. Logs comprimidos, hashes y estados: [matriz F01](../../tests/fixtures/h5-009/f01/result.json).

Retests locales: `postgres-h5-008-migration.test.ts` 3/3 PASS y retest focal final 14/14; guardas de bytes y counterproofs PASS/FAIL esperado. F01 queda CLOSED local/aislado.

### Estado y condición de continuidad

F01 CLOSED local/aislado. El producto quedó probado en `1c86e695144509fff0254c4d7a076dbb3921f777`; los gates integrales constan en [evidencia](evidence-TSK-H5-009-010.md).

## H5-009-F02 — CLOSED local/aislado

Inventario del expected independiente congelado en `e8b38fa45b0170689784dd3af6ef6cba93e46ae1`: 26 casos únicos, exactamente `P01, P02, P03, P04, P05, P06, P07, P08, N01, N02, N03, N04, N05, N06, N07, N08, N09, N10, N11, N12, N13, N14, N15, N16, N17, N18`. Los prefijos P/N agrupan positivos y negativos. La tabla incluye una fila de encabezado y un separador Markdown, no casos; 26 casos + encabezado explican el reporte previo de “27 filas”. La referencia a “24 casos” en la evidencia inicial fue un conteo incompleto. Las 51 filas normativas literales Tasks §6 están en una sección independiente; no son parte del recuento de casos. No hay un identificador extra, duplicado ni contradicción material en el expected.

El expected se mantuvo byte por byte intacto. F02 queda CLOSED tras fijar esta distinción y verificar la cobertura separada de los 26 casos y las 51 filas normativas en la matriz de evidencia.

## H5-009-F03 — CLOSED local/aislado

La primera ejecución de `postgres-h5-009.test.ts` dio 9/10: los eventos Avaibook de crear/modificar/cancelar reserva llegaban como `applied` en vez de `review`. El log original conserva 3 resultados fuera del límite y fallo de aserción; SHA-256 `c61fff4777eeebd01f87e700855847f8b14beeecaeebe76f457c56fa2f5cf690`, 3182 bytes, probado sobre el árbol de base `e8b38fa45b0170689784dd3af6ef6cba93e46ae1`.

La migración H5-009 ahora clasifica Avaibook, calendario y web como Review; pruebas focales confirman que los payloads sintéticos de acción no cambian B08, Booking ni facturas. Retest focal final 10/10 y regresión final 2473/2473 PASS en SHA `1c86e695144509fff0254c4d7a076dbb3921f777`. Log original: [channel-boundary-original-fail.log.gz](../../tests/fixtures/h5-009/channel-boundary-original-fail.log.gz); retest: [focal-final.log](../../tests/fixtures/h5-009/focal-final.log).

## H5-009-F04 — CLOSED local/aislado

El doble manual necesitaba tratar la referencia externa como dato de procedencia mutable, no como parte de la identidad material del evento. La corrección preserva íntegra cada recepción raw, compara identidad/contenido del evento sin colapsar referencias, y enlaza la repetición a `resultRef` canónico. La referencia reemplazada y su autoridad/historia permanecen separadas.

El test unitario `H5-009 repeated event with a replacement reference retains the raw reference and links to the canonical event` pasa dentro de 171/171; la integración `H5-009 corrected external reference preserves the prior reference and history` pasa dentro de 10/10 y 2473/2473 PostgreSQL. F04 CLOSED local/aislado en SHA `1c86e695144509fff0254c4d7a076dbb3921f777`.

## H5-009-F05 — CLOSED local/aislado; FAIL original conservado

Tras los gates de producto, se ejecutó `node --experimental-strip-types scripts/verify-h5-008-evidence.mjs`. Falló con exit 1 en la guarda `scripts/verify-h5-008-evidence.mjs:27`: compara el delta desde el SHA histórico probado H5-008 con una lista cerrada de rutas exclusivamente documentales/H5-008 y rechaza los cambios normales de código, migración y tests de H5-009. La aserción de la línea 36 también mantiene inmutables las fichas posteriores a H5-008, por lo que el cierre de Tasks requerido por H5-009/010 tampoco cabe en el protocolo actual.

En el STOP original no se modificó ese auditor ni se amplió su lista de excepciones. El resultado se conserva en [verify-h5-008-evidence.log](../../tests/fixtures/h5-009/verify-h5-008-evidence.log): 10.865 bytes; SHA-256 `0da057cef8311426a7c18e4192003d1570288f0103c06fbfc7ef4c447ce953be`. H5-009/010 mantienen IN PROGRESS; producto local en `1c86e695144509fff0254c4d7a076dbb3921f777`, sin push. Se requiere autorización humana expresa sobre cómo conservar la inmutabilidad H5-008 y permitir el delta H5-009 antes de reanudar, corregir ese auditor o publicar.

### Correctivo F05 autorizado y cierre

Autorización humana expresa2026-10-09. Se modifican exclusivamente `scripts/verify-h5-008-evidence.mjs` y `tests/fixtures/h5-009/f05-counterexamples.mjs`. Preservación: todos los archivos del cierre publicado `fdbd08bafdc6651d1ad6867242cd71791a25deb6`, presencia/tipo/mode y contenido contra sus blobs Git. Progreso: lista exacta de rutas/versiones de producto `1c86e69`, expected `e8b38fa`, cuatro líneas status/evidencia009/010, párrafo009/010 insertado en cada documento de estado y evidencias nominales. No excepción global ni glob; contratos, fichas011+/H6 y manifiestos/snapshots históricos intactos. COMPLETED exige pruebas y hashes locales del SHA definitivo, incluido el propio auditor y su prueba.

Contrapruebas18/18: cierre intacto, delta legítimo, F10/F12 y preservaciones006/008 PASS; alteración de código/migración/expected/evidencia histórica, ruta ajena,011/012/H6 prematuros, acreditación externa sin evidencia, eliminación W53 en copia intacta, symlink idéntico y modo alterado FAIL esperados. Tabla con hashes/logs: `tests/fixtures/h5-009/f05/result.json`. Diagnóstico/inventario previo: `f05-diagnosis.md`, `f05-preflight.json`.

El candidato `3158161` superó los15 casos iniciales y una tanda integral, pero una contraprueba adicional encontró un PASS indebido al eliminar W53 en copia intacta. F05 seguía OPEN; la tanda y los hashes se preservan en `f05-initial-revalidation.tar.gz`, y el resultado indebido en `f05-development-deletion.log.gz`. El correctivo exige presencia/tipo antes de excepciones; no amplía ninguna excepción histórica. Se conservan además los fallos de buffer y del arnés de copias en `f05-development-fails.json`.

Revalidación íntegra nueva en `0dae8a4a0b5ce92845b13fd82c60c1ed931184dc`: PostgreSQL 2473/2473, unitarias 171/171, focal 14/14, health 1/1; todos los gates, preservación y auditor final PASS. No se atribuyen los PASS anteriores a este SHA. F05 CLOSED exclusivamente local/aislado; sin defecto material abierto y STOP definitivo tras H5-009/010.

## H5-009-F06 — OPEN / STOP: diff-check de evidencias originales staged

Preparación de cierre documental tras revalidación0dae8a4. `git diff --cached --check` exit2, 508 bytes, SHA256 `aa7fe79734d1b0547bc65afbc7857797d8b2324db552ba4c16883ef8c8b7f0e1`. La tanda previa `git diff --check` exit0 miraba diferencias unstaged de archivos ya tracked; los logs nuevos untracked no entraban. No es evidencia suficiente de PASS del gate de publicación completo. El fallo aparece antes del commit y aborta el comando; no hay cierre documental committeado ni push.

Diagnóstico literal conservado íntegro, con sus espacios originales: [original-diff.log.gz](../../tests/fixtures/h5-009/f06/original-diff.log.gz),508 bytes descomprimidos,SHA256 `aa7fe79734d1b0547bc65afbc7857797d8b2324db552ba4c16883ef8c8b7f0e1`. La cita literal se sustituye exclusivamente por esta referencia; su versión Markdown previa queda comprimida en `compression.json#/affectedReferenceUpdates`.

Los cinco archivos son evidencia original, con hashes de preflight y/o FAIL previos conservados. No se normaliza whitespace ni se cambia configuración/atributos/exclusiones: eso alteraría bytes o ampliaría el control sin autorización. Producto y auditor permanecen en `0dae8a4a0b5ce92845b13fd82c60c1ed931184dc`; expected e8b38fa y todas las migraciones/manifests/snapshots intactos. F01–F05 CLOSED local/aislado; F06 bloquea PASS global y COMPLETED de009/010.

Salida original comprimida/Base64 y metadata en `tests/fixtures/h5-009/f05-development-fails.json`, registro `F06-staged-diff-check`; prueba estructurada `verification.json` ahora BLOCKED conservando el PASS previo al staging y todos sus gates.

Se requiere decisión humana expresa para empaquetar esas evidencias de forma byte-preserving, adaptar únicamente sus referencias/rutas exactas y reejecutar el diff completo sin excepciones de whitespace. No se implementó ese correctivo ni se cambió el auditor para admitir rutas nuevas. STOP definitivo sin H5-011/012, H6 ni conectores reales.

### Correctivo F06 autorizado2026-10-12 — compresión PASS, cierre global pendiente

El informe previo decía cinco archivos, pero la salida original y su reproducción contienen cuatro rutas únicas y seis diagnósticos. No existe quinto archivo afectado. No se modifica la salida508 bytes/hash aa7fe797; se corrige exclusivamente el recuento documental. Inventario/manifiesto en `tests/fixtures/h5-009/f06/compression.json`: cuatro nombres originales, tamaños/hashes originales, tamaños/hashes gzip, tamaños/hashes descomprimidos, motivo y ejecución. Compresión gzip sin pérdida, mtime0, nombres estables `.log.gz`; representación original sustituida únicamente después de comprobar igualdad binaria, sin trim ni normalización.

Manifiesto y auditor actualizado en `d15b5ba93e4c0b0a2d97339a02280738297db26d`; referencias necesarias actualizadas a gzip. SHA256 originales reconstruidos coinciden con f05-preflight y con constantes independientes del manifiesto en el auditor. El original verification0dae8a4 y sus resultados quedan conservados en el manifiesto; logs/status anteriores no se sobrescriben.

Contrapruebas: igualdad4/4 PASS; gzip corrupto, hash original falsificado, gzip válido con contenido alterado, gzip ausente y entrada de evidencia perdida FAIL esperados. F05 18/18 y F10/F12 PASS en copias temporales. Source/stdout/hashes completos: `f06/counterproofs.json`; F05 retest independiente: `f06/f05-retest.tar.gz`. F01 se reejecuta en copia temporal; source/logs originales intactos. Referencias Markdown de los tres documentos resuelven.

F06 no se declara CLOSED todavía: el cierre condicionado queda bloqueado por F07; el diff staged completo se verifica por separado. No se relajaron controles de whitespace, atributos, configuración ni excepciones históricas.

## H5-009-F07 — OPEN / STOP: regresión histórica no reproducible en revalidación F06

Revalidación completa en `d15b5ba93e4c0b0a2d97339a02280738297db26d`:2473 tests,2470 PASS,3 FAIL,0 skip/cancel. Dos escenarios fallidos y el grupo padre H4-021:

- `postgres-h4-006.test.ts:21`: H4-006 R11 esperaba `/EXPIRED/`, recibió `AVAILABILITY_CHRONOLOGY_REQUIRED:E3`.
- `postgres-h4-021.test.ts:33`: B20/B21/B30/B31 esperaba que economics.missing incluyera `reference-review`; aserción falsa. El grupo padre añade el tercer FAIL.

Log comprimido íntegro `tests/fixtures/h5-009/f06/gates/postgres.log.gz`,6.923.817 bytes descomprimidos,SHA256 `96582185eae44756169650bd7257d0940dd5b0d04bbf48347cac244f0ce31e43`,exit1. Status con SHA/comando/fechas en el mismo directorio. No se atribuye una causa: ni carga, fecha, entorno, regresión funcional ni compresión han sido demostrados como causa. Producto funcional, migraciones, permisos, dependencias y tests históricos permanecen byte a byte sin cambios. No se modifica ninguna guarda ni se repite hasta obtener un PASS.

La incidencia previa0dae8a4 2469/2473 (H3 R67/R030) sigue íntegra y con causa no confirmada; no son los fallos de esta tanda. Los resultados originales0dae8a4 2473/2473,171/171,14/14 yhealth1/1 conservan su SHA y artefactos.

STOP por autorización F06 §§6–7: reproducibilidad global afectada por otra falla material; sin cierre COMPLETED, commit documental o push. Health y auditor final global pendientes tras abortar la batería. Se requiere autorización específica para diagnosticar/corregir F07 en aislamiento, sin debilitar expectativas históricas. No se prepara H5-011/012 ni H6.

Conjunto completo preparado: `git diff --cached --check` exit0, sin exclusiones. Cuatro logs originales en gzip y registro Markdown con cita sustituida por enlace al diagnóstico original gzip; snapshot byte a byte anterior de esa referencia conservado en el manifiesto. El staging propio se revierte después del control, sin descartar archivos. No se crea commit documental ni push porque F07 bloquea la regresión global.


## H5-009-F08 — correctivo y contrapruebas PASS; cierre global pendiente

Tres transiciones F07 exactas, guardas y arnésF01 en17673f9; aceptación indebida de permisos0600 con helper histórico conservada y corregida en8c11094.30 directas,19 baseline,18 F05 y12 F01 esperadas PASS. Manifests originales y56 migraciones intactos. F06 retest PASS. Cierre condicionado sigue pendiente porF09.

## H5-009-F09 — OPEN / STOP: H3-R52 solapamiento no acreditado

Regresión en8c1109426a8e85effeda6c2bb59c08ac0693c032:2472/2473,1FAIL. `tests/integration/postgres-h3-006.test.ts:95`, AssertionError `independent sessions overlap under existing F2 and shared payment-root locks`; waiting=false en concurrent():86. No se atribuye causa ni sobrecobertura: la comprobación posterior de cantidad no se ejecutó. Separado de la anomalía2469/2473 R67/R030 y del PASS2473/2473 en17673f9. Log nuevo6921870 bytes/SHA25697270556dce812153051ba3396512c69417edaeedc6bf37f4c3b9d8c1c888042 en el paquete externo F08-revalidacion-2026-10-12-STOP-F09. Sin retest adicional, cambios de sondeo/guardas, cierre global, commit documental ni push. Se requiere autorización humana específica de diagnóstico.
