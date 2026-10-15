# H5-014 — Defectos independientes

## F01 — Ausencia de datos interpretada como suficiencia (CLOSED local/aislado; 2678 casos consolidados y 13 reproducciones PASS)

Fuente: P05/P18; SPEC-FR-CLOSE-001/002; SM-CL-02; Plan C02/C06/T10. Candidato original: manifiesto `7e5ae6a7df16d71ac7e9a8702bec8e51c04d7d9f5cb6225a076fb1c283005f06`.

**Resultado original observado:** 12 FAIL de kernel y un FAIL adicional con estado persistido inconsistente consumido a través del adapter público. El evaluador devuelve `satisfied` donde el oráculo independiente exige `pending`. No se ha demostrado que un comando ordinario autorizado produzca el estado incoherente: la prueba persistida lo introduce con autoridad de ensayo en PostgreSQL efímero, y lo declara explícitamente. No se presenta como un bypass de autenticación.

Causa: comparaciones SQL sobre campos JSON ausentes o null producen UNKNOWN; un `WHERE` dentro de `NOT EXISTS` descarta esas filas y permite acreditar suficiencia. Afecta a seis comprobaciones: estado documental, resolución de prestación, saldo de obligación, estado de factura, estado de suplido y aplicación de modificación.

| Reproducción | Original | Correctivo |
|---|---|---|
| K01/K02: estado de documento ausente/null | satisfied | Pendiente si el estado no acredita Revisado o No aplica. |
| K03/K04: resolved ausente/null | satisfied | Solo true acredita prestación resuelta. |
| K05/K06: remaining ausente/null | satisfied | Solo cero acredita saldo resuelto. |
| K07/K08: estado de factura ausente/null | satisfied | Solo Vinculada supera esta guarda documental. |
| K09/K10: estado de suplido ausente/null | satisfied | Solo Documentalmente resuelto supera esa guarda. |
| K11/K12: applied ausente/progress null | satisfied | Ausencia de aplicación sigue pendiente salvo rechazo/retirada acreditados. |
| K persistido: requirement sin estado | satisfied por API pública | pending por API pública, sin resolución inferida. |

Cambio mínimo: seis predicados de `closure_assess` en la migración 62 todavía no publicada. No se tocan las 61 migraciones anteriores, interfaces, adapter, precios, reglas de aplicación, estados ni H5-015. [Diff exacto](../../tests/fixtures/h5-014/corrective.diff). [SQL original conservado](../../tests/fixtures/h5-014/original-migration62.sql.gz). [FAIL kernel original](../../tests/fixtures/h5-014/original-valid-fail.log.gz). [FAIL persistido](../../tests/fixtures/h5-014/original-safety.log.gz).

El expected de auditoría precede a las contrapruebas. El primer test independiente válido queda congelado en `independent-tests-seal.json`; posteriormente solo se añade un estrechamiento de tipo a la proyección Booking para satisfacer TypeScript, sin cambiar ningún assert ni esperado. Transición antes/después y error original en `test-type-transition.json` y original comprimido. Nuevos casos de seguridad añadidos, nunca sustituyendo negativos.

## Incidencias del instrumental, separadas del defecto del producto

- H01: primer kernel enviaba JSON doblemente codificado mediante el tagged template. 18 errores de preparación y seis pruebas públicas PASS. Corrección del enlace a `text::jsonb`; oráculo intacto. Fuentes y log originales preservados. La repetición válida reproduce los 12 FAIL materiales.
- H02: primera carrera intentaba consultar otra Booking por una conexión ocupada por la propia compuerta de ensayo. Se interrumpió exclusivamente ese proceso y su PostgreSQL sintético. La consulta independiente pasa a la conexión libre; se repiten los 15 casos, todos PASS. Los bytes/log de la primera tentativa siguen conservados. No se atribuye el bloqueo artificial a T10.
- H03: TypeScript requiere estrechar el `unknown` de la lectura Booking. Solo anotación de tipo, sin modificar esperado. Typecheck posterior PASS.
- H04: Turbopack rechaza `node_modules` enlazado fuera de la raíz de la copia aislada. Se prepara una segunda copia con dependencias físicas y los mismos 434 hashes; no cambia `package.json`, lockfile ni build script. Log inicial conservado.

La evidencia definitiva y el estado de cierre de F01 se registran en [informe H5-014](evidence-TSK-H5-014.md). Las evidencias H5-013 permanecen como informe del implementador sobre su candidato original; no se reescriben con los resultados de auditoría.

## F02 — Inventario original con hash autorreferente desactualizado

El inventario de H5-013 contiene 79 entradas, incluida una entrada para `inventory.json` cuyo hash corresponde a otros bytes. Se verifican los 78 elementos restantes y todos los modos sin discrepancias; el manifiesto estricto de 431 inputs coincide íntegramente con el SHA declarado. No se atribuye corrupción de producto a esta inconsistencia documental.

La evidencia original se conserva intacta. La corrección consiste en un inventario sucesor de entrega que excluye su propia ruta; su SHA256 se publica fuera del archivo, en la respuesta. El sucesor registra el hash real del inventario original y distingue el original del producto corregido. Detalle verificable: [inventory-crosscheck.json](../../tests/fixtures/h5-014/inventory-crosscheck.json).

## H05 — Preparación del historial e índice del entorno aislado

Primera regresión completa: 2637 PASS y 41 FAIL de verificadores históricos por ausencia inicial de metadatos Git. Segunda completa, con historial: 2675 PASS y tres FAIL; el clone sin checkout mantenía un índice vacío, que `git diff` interpretaba como eliminaciones. Se ejecutó `git read-tree HEAD` exclusivamente en esa copia y se repitieron íntegramente `postgres-h2-006-defects.test.ts` y `postgres-h2-006.test.ts`: **46/46 PASS**. No se cambió producto, oráculo ni assertions. El índice de trabajo real nunca se alteró.

Resultado consolidado: 2678 casos únicos comprobados; no se afirma una ejecución completa limpia. Ambos logs completos fallidos, restauración de tres archivos generados dentro de la copia, corrección de entorno y retest están preservados. La documentación distingue el defecto F01 de estas incidencias de preparación.
