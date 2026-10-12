# F09 — recuperación documental verificada; STOP de publicación

Ámbito: H5-009/010 exclusivamente local/aislado. F09 OPEN; F06/F07/F08 sin cierre global. H5-009/010 no cerrados. R67/R030 continúa registrada como anomalía independiente, sin causa atribuida. Sin commit, push, nuevas tareas ni conectores reales.

## Candidato y preflight

Rama main, HEAD `8c1109426a8e85effeda6c2bb59c08ac0693c032`, origin/main `fdbd08bafdc6651d1ad6867242cd71791a25deb6`, divergencia 7/0; índice real vacío. Auditor SHA256 `556a8e148fa0eaadfe12581fad7d9acdfb842cb844b29ae776a481276e4a7773`. Identidad del candidato: commit base más inventario de entradas ejecutables/configuración/dependencias `candidate.json`, fingerprint `1d5878198749db712fc91af54191cfaea432e37225fa3226871054e8d49ed98f`. No existe un nuevo commit probado; no se atribuyen resultados históricos a este candidato.

Las 223 rutas originales conservan tipos/permisos; 222 conservan bytes exactos y el auditor es la única modificación autorizada. Los 15 documentos previos de recuperación siguen íntegros. Las restantes 35.848 rutas del inventario de preflight permanecen intactas. Expected independiente 24.417 bytes/SHA256 b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639, F01/F02/F16 y 50 manifiestos/snapshots versionados verificados contra Git.

## Cambio del auditor

Se incorporan 14 rutas documentales posteriores al inventario223, individualmente identificadas y verificadas. Las 94 rutas suplementarias anteriores continúan verificadas por el snapshot223, incluido audit-production.json; cli-latest sigue siendo una entrada previa, sin excepción por nombre/directorio.

El código enumera únicamente rutas literales del paquete de recuperación. Cada ruta presente debe registrarse en un inventario sellado, con procedencia, propósito, tamaño, tipo regular, permisos0644 y SHA256. Los hashes históricos originales/manifiestos no cambian. El hash del inventario se suministra desde la invocación revisada mediante F09_INVENTORY_SHA256; nunca se obtiene confiando en un campo del mismo inventario. F09_INVENTORY_PATH solo admite las dos rutas literales inicial/final. El sello definitivo se entrega en la respuesta humana; debe conservarse como referencia independiente. Modificar ambos archivo y sello requiere una nueva revisión explícita, no es una reparación automática del auditor.

El auditor exige autorización, registro de pérdida, exactamente dos referencias históricas, dos sustitutos, sus comandos/tiempos/códigos/streams y coincidencia del candidato con el código actual. Distingue integridad original perdida, preservación, suplementos, sustitución y nuevas ejecuciones. El resultado no equivale a PASS global.

## Pérdida histórica y nueva evidencia

- build.log: ORIGINAL NO RECUPERADO; 545 bytes históricos, SHA256 063f7ffad5445d9b2a45a17aceb16a01a6dfbbe70032787c0fdd02ea690fd0fa.
- health-independent.log: ORIGINAL NO RECUPERADO; 202 bytes históricos, SHA256 2794076bee6b763f2a15c62a692735addf3e6b08e4fa296266b92953489f6f30.

Se conservan las salidas sobrescritas como ejecuciones posteriores; no se aceptan como originales. Autorización/causa/búsqueda/límites están vinculados en authorization.json y substitution.json, sin reescribir los documentos anteriores. Los nuevos streams están comprimidos sin pérdida y se crearon exclusivamente, sin sobrescritura.

- build: PASS, exit 0, raw 545 bytes, SHA256 `5c856cf990f9a9e0e245446066f98ae3d8008ebe27f464b3d790c9b086f41996`; output `tests/fixtures/h5-009/f09/recovery-validated-20261012/build.log.gz`.
- health-independent: PASS, exit 0, raw 202 bytes, SHA256 `826a90da41dc80d732d69dc6b5c91454bc837dc434c11ecc921561e19dc13255`; output `tests/fixtures/h5-009/f09/recovery-validated-20261012/health-independent.log.gz`.

Comandos originales recuperados de original-command-trace.jsonl y la investigación previa; la nueva captura está en executions.json, con inicio/fin, entorno Node/pnpm/PostgreSQL y hashes. Build y health pasaron sobre el fingerprint indicado. Un PASS nuevo no recupera el original perdido.

## Verificaciones ejecutadas

- Auditor real del checkout completo, con todos los documentos y suplementos: preservación y sustitución verificadas. Los recuentos históricos H5-008 que conserva su salida no son regresiones nuevas.
- Clasificación/preservación:29/29 resultados esperados, incluida alteración de bytes/tipos/permisos, eliminación, rutas ajenas, manifest/expected, acreditaciones prematuras y versiones R52.
- F05 original:18/18 esperadas en copia desechable completa. Solo root/output del arnés se redirigen para conservar sus evidencias originales; no se cambian sus aserciones.
- F08/F09 directas:40/40 esperadas (30 para las tres transiciones F07 y10 R52).
- Excepción documental:13/13 esperadas, incluidas autorización ausente/denegada, hash falso, sustituto ausente, bytes/permisos/symlink, resultado FAIL rotulado PASS, falsa recuperación, candidato falso y ruta extra aun con inventario resellado en copia de contraprueba.
- Wrapper:14/14 esperadas. Preflight/hash/ausencia/symlink/permisos; generación F01/F02/preservation.log/F16; exit7 conservado; error inducido; archivo ajeno; SIGTERM; fallo de restauración detectado. Mecanismo original intacto, sin segundo restaurador. Las mutaciones se hicieron en copia y las capturas/status quedan íntegros.
- F10/F12 y preservación H5-008:PASS dentro de las ejecuciones indicadas.
- Build nuevo:PASS. Health independiente nuevo:PASS.
- Staging completo anticipado:FAIL exit2, siete diagnósticos en cinco rutas preexistentes, sobre un índice alternativo con todos los archivos. Índice real intacto. Original FAIL en staged-preflight.log y metadatos en staged-preflight.status.json.

## Bloqueo de publicación y propuesta concreta

Las siguientes rutas contienen whitespace que git diff --cached --check rechaza al incorporarlas por primera vez. Todas conservan exactamente sus bytes de preflight:

- `tests/fixtures/h5-009/f09/build.log` — 545 bytes; SHA256 `171ec560c336b2fb502bfe7b5481cbdef116da875eed2929026714fa4157d0a6`.
- `tests/fixtures/h5-009/f09/f02-diagnosis/byte-preserving-unified-diff.txt` — 746 bytes; SHA256 `f95ad637650cf4059684a34c520bc2db6ecec82e7e2473a4eb06bd1de6cf5fbf`.
- `tests/fixtures/h5-009/f09/h2-011-regenerated/reproducer-F01-corrected.observed-61702280.log` — 906 bytes; SHA256 `61702280d96f95388e432ef0e3f60259778593ed06a661a59e8bd7d672640464`.
- `tests/fixtures/h5-009/f09/postgres-preservation/2026-10-12T194821-119Z-2e27d7aa-36a4-432d-a124-62340df3144b/postgres.stdout.log` — 6920640 bytes; SHA256 `b9af667e69ffaaa4fd89154ba49f07c4d252df973636a4efbebe7b9a44a6f19e`.
- `tests/fixtures/h5-009/f09/recovery-20261012T202326Z/build-overwritten.log` — 545 bytes; SHA256 `171ec560c336b2fb502bfe7b5481cbdef116da875eed2929026714fa4157d0a6`.

Cuatro pertenecen a las223 rutas congeladas y la quinta es la copia build-overwritten de recuperación. La exigencia simultánea de conservar esas rutas sin alteración y publicar el conjunto con diff-check limpio requiere una autorización exacta de representación. No se normalizó, eliminó, excluyó ni añadió un bypass de whitespace.

Se prepararon cinco copias gzip fuera de las rutas protegidas. La descompresión reproduce exactamente bytes/SHA256 de cada salida observada; metadata y archivos propuestos están en proposed-lossless-representation.json y proposed-lossless-representation/ dentro del paquete. NO APLICADO. Para build.log ese hash corresponde a la salida sobrescrita conservada, nunca al original perdido. La propuesta mínima consiste en autorizar únicamente estas cinco sustituciones de representación, con mapa literal raw→gzip y verificación del hash descomprimido; mantener los manifiestos/snapshots y referencias históricas originales. El auditor necesitaría reconocer ese mapa exacto sin permisos generales.

Tras este FAIL no se inició regresión global. Se permitió terminar el arnés de restauración ya en curso. R52 funcional/H3 completo, PostgreSQL completa, unitarias completas, focales H4/H5, frozen/typecheck/lint, auditoría dependencias, V-MIG y advisors quedan pendientes para este candidato. No se reutilizan los resultados de ejecuciones previas. El cierre F09/H5-009/010 queda bloqueado.

## Paquete y uso

verification-evidence.tar.gz conserva las evidencias y scripts de este turno y del correctivo limitado anterior que estaban en .git. Su inventario interno enumera rutas/hashes. Los originales permanecen también en .git; el paquete versionable evita depender de esos metadatos locales. final-inventory.json sella todas las rutas incorporadas; el informe no incluye su propio hash para evitar autorreferencia. La invocación final usa F09_INVENTORY_PATH=tests/fixtures/h5-009/f09/recovery-validated-20261012/final-inventory.json y F09_INVENTORY_SHA256 con el valor entregado al usuario.

Clasificación final: STOP por gate de publicación. Recuperación documental verificada en su ámbito; integridad de los dos originales no recuperable con las fuentes disponibles. Ningún cierre global acreditado.
