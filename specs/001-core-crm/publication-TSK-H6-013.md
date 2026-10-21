# TSK-H6-013 — propuesta controlada de publicación

**Propuesta para revisión. Publicación NO AUTORIZADA.** El cierre COMPLETED local/aislado está aceptado; este documento no autoriza preparar el índice, crear un commit, publicar archivos ni desplegar. El candidato técnico V2 aceptado permanece íntegro.

## Conjunto propuesto y criterio de selección

El [inventario exacto](../../tests/fixtures/h6-013-closure/publication-inventory.json) describe cada ruta por tipo, modo, tamaño y SHA-256, además de su motivo y disposición. Se propone un conjunto mínimo práctico que conserva los instrumentos actuales, el delta V2 completo, las identidades/expected, los resultados finales y los registros principales de los FAIL. El detalle histórico restante se conserva recuperable en archivos externos existentes. No se afirma un mínimo matemático ni se reescriben evidencias para reducir su tamaño.

De las **16.104 rutas técnicas aceptadas, 239.090.845 bytes**, se seleccionan **1.150 rutas, 67.087.311 bytes**, y se excluyen de Git propuesto **14.954 rutas, 172.003.534 bytes**. La exclusión de publicación no es una eliminación local ni una pérdida de custodia.

| Categoría | Rutas técnicas propuestas para Git | Bytes | Tratamiento |
|---|---:|---:|---|
| A. Código e instrumentos H6-013 | 20 | 136.820 | Todos los instrumentos actuales necesarios para reproducir o verificar H6-013; sin modificar. |
| B. Matrices, expected y documentación | 43 | 14.906.165 | Identidades, sellos, fuentes normativas extraídas, matrices, expected y suplementos preservados. |
| C. Evidencia de resultados | 548 | 37.934.479 | Delta V2 completo, cadena, regresiones seleccionadas, controles temporales y atribución del intento 16. |
| D. Logs históricos seleccionados | 539 | 14.109.847 | FAIL y recibos principales, procedencia e instrumentos históricos relevantes. |
| E. Custodias externas | Véase inventario externo | No se incorporan automáticamente | Recuperación integral y auditorías; entrega accesible pendiente. |
| F. Auxiliares/duplicados | 0 | 0 | Se conservan fuera del conjunto Git propuesto. |

A esos 1.150 archivos se añaden **84 archivos nuevos de cierre** y **3 documentos de seguimiento modificados**: **1.237 rutas propuestas en total**. Las 84 incorporaciones contienen los tres documentos de aceptación/cierre/publicación, autorización literal, comprobaciones de integridad/recuperación, inventario externo, 73 copias fieles de evidencia de auditoría con recibo de procedencia y las tres envolturas de cierre. El inventario separa el payload de 1.234 rutas de esas tres envolturas para evitar autorreferencias. Sus bytes finales y hashes quedan en el recibo externo de entrega del cierre y en el readback; no se inventa un hash propio dentro del documento que lo contiene.

Las tres modificaciones de base son `specs/001-core-crm/tasks.md`, `docs/PROJECT-STATUS.md` y `docs/NEXT-STEPS.md`. No hay cambios de código, SQL, tests, helpers, expected o evidencias aceptadas. Los manifiestos históricos que conservan los descriptores anteriores de estos documentos no se actualizan: prueban la base anterior al cierre. El nuevo inventario registra expresamente las tres excepciones autorizadas.

## Exclusiones justificadas y preservación

Las 14.954 exclusiones tienen una fila individual en el inventario:

- **D: 14.182 rutas, 163.194.601 bytes.** Detalle histórico de sentencias, salidas y ensayos anteriores. Los registros principales se incluyen en Git propuesto; el expediente completo permanece en el TAR V1.
- **F: 772 rutas, 8.808.933 bytes.** Copias de contenido idéntico, capturas repetidas y salidas auxiliares regenerables. Cuando existe una copia seleccionada idéntica, se indica `sameContentAs`; los descriptores históricos de ambas rutas siguen separados.

Todas las exclusiones se recuperan desde `candidate-v1-tar`, miembro con la misma ruta relativa. La [lectura completa del TAR](../../tests/fixtures/h6-013-closure/publication-recovery-check.json) ha contrastado sus 15.537 miembros con el inventario V1, sin diferencias de contenido, modo, tipo o tamaño. El delta V2 seleccionado y sus tres envolturas permiten reconstruir las 16.104 rutas aceptadas. No se ha eliminado, compactado ni reparado evidencia histórica.

Los directorios ignorados del entorno, dependencias instaladas, cachés y clústeres temporales no son parte del candidato técnico ni se proponen para Git. La reproducción funcional exige preparar las versiones y dependencias fijadas por sus instrumentos —incluido Node 24— en una copia aislada. Este cierre no los reinstala ni inicia recursos PostgreSQL.

## Dependencias externas indispensables

El [inventario externo](../../tests/fixtures/h6-013-closure/external-evidence-inventory.json) enumera **698 referencias**: las 17 dependencias externas del manifiesto V2 y los 681 archivos del expediente final independiente (679 payload y dos envolturas). Sus rutas locales son procedencia comprobada, no enlaces de distribución públicos. **72 referencias disponen ya de una copia fiel propuesta en Git; 626 requieren una entrega externa accesible**. No se suman estas referencias a los archivos de Git como si fueran nuevos casos de prueba.

Son indispensables para la recuperación completa:

- V1: `candidate-v1.tar`, 239.175.680 bytes, SHA-256 `3467890fc314517659eace66909d4147bff8d3573f9cc499fa0d611886a931bb`, inventario, recibo y sello originales.
- Auditoría primera y candidato original: `auditor-original.tar`, 931.594.240 bytes, SHA-256 `0ce0d6f83f1affdd9002b23676bc7daf0fb7c160257d696cac8f287676449f0f`, inventarios y recibos. Conserva la recuperación comprobada de 53.211 archivos, incluidos los 9.658 del candidato original.
- Auditoría segunda: TAR existente de 100.802.560 bytes, SHA-256 `4cce36061f9ade039aac5dc10ecff7d610ac4e59c757926c7855b7302a4e5bec`, recibo y evidencias referenciadas. Conserva los hallazgos y la fase 15 reproducida independientemente.
- Auditoría final completa: archivos enumerados por su manifiesto SHA-256 `976e6358193b9a7f4f5b0bf7940d7105e87b3dc8028c00ac8c719546e6fcf947` y sello `480e7b8b689ebb44c1072695285065f71cbac33292935711fbd19b54a7f0a5d5`. Los extractos copiados al cierre permiten revisar el PASS; no sustituyen las 681 rutas de su expediente recuperable.

**Tratamiento propuesto, todavía no ejecutado:** entregar los archivos existentes en un repositorio de evidencias aprobado por el director, con acceso para los revisores, conservación de bytes y una tabla de destino real ↔ destino lógico ↔ SHA-256. El inventario asigna destinos lógicos `external/sha256/...` y `external/final-audit/...`; no inventa URLs. Los contenidos idénticos pueden entregarse una vez siempre que se conserve la correspondencia de todos sus nombres y descriptores. No se crea un nuevo archivo comprimido ni se sustituye una custodia histórica.

Antes de autorizar la publicación debe hacerse readback desde el destino de entrega y probar que un revisor puede recuperar las dependencias. Mientras esa entrega esté pendiente, **el conjunto Git propuesto no es autónomo para reconstruir todo el expediente**. Esto es una condición de publicación, no un defecto pendiente del producto ni una revocación de la aceptación local. No se acredita WORM, copia externa ya realizada ni disponibilidad futura garantizada.

## Reconstrucción y revisión documental

1. Recuperar el commit base exacto `8a5f1408777b81b760a02646fa414a34dc17983e`, árbol `758e871c7ad621dcbdb69516cccd175e529dbd6e`, en un destino propio. No inferir que el checkout vigente del futuro revisor será esa base.
2. Leer el inventario, el sello y el readback nuevos. Contrastar los hashes de las tres envolturas con el recibo externo de entrega y el informe del cierre. El manifiesto enumera el payload, excluye explícitamente sus tres envolturas y el sello fija su hash; el readback fija ambos hashes. El recibo exterior identifica las tres, sin autorreferencia.
3. Para recuperar el candidato aceptado, leer/verificar el inventario V1 y su TAR, componer los tres reemplazos y las 567 incorporaciones V2 —incluidas sus envolturas— y contrastar los 16.104 descriptores con el inventario final de auditoría. No extraer sobre el repositorio o las custodias originales.
4. Añadir las rutas documentales de cierre y los tres documentos de seguimiento propuestos. Comparar cada descriptor del payload y verificar que solo esas tres rutas cambian respecto a la base; el resto de las 38.702 rutas y los 16.104 archivos técnicos deben conservar su identidad.
5. Comprobar las 13 asignaciones de Tasks §6, la anotación COMPLETED local, las otras 17 tareas H6 sin cambios, DM-PENDING-005 OPEN y los límites de Hosted/Production. Distinguir pruebas nuevas del cierre, evidencia heredada y contadores reconstruidos.
6. Releer los expedientes externos entregados contra sus inventarios. Los verificadores técnicos históricos pueden exigir un checkout previo al cierre y rutas antiguas: usar una copia propia que reconstruya ese estado, sin cambiar sus fuentes ni atribuir un FAIL del entorno a un defecto del producto. El cierre registra las tres diferencias documentales expresamente.

La validación de este cierre es documental: JSON, enlaces nuevos, descriptores, recuperación por lectura, preservación, estado Git y diferencia autorizada. No se repite la batería funcional porque sus instrumentos y evidencia técnica permanecen idénticos. El [readback](../../tests/fixtures/h6-013-closure/closure-readback.json) conserva el resultado exacto y las comprobaciones realmente ejecutadas.

## Decisión pendiente

El director puede revisar este inventario y decidir el conjunto definitivo y el destino de las evidencias externas. Solo una autorización posterior permitirá preparar/publicar el conjunto aprobado. Hasta entonces no hay staging, commit, push, rama, tag o despliegue nuevos. H6 global permanece NO COMPLETADO, H6-014 sin iniciar y DM-PENDING-005 OPEN.

**STOP.**
