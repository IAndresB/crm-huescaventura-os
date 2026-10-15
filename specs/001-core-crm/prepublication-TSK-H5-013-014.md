# H5-013/H5-014 — Verificación de prepublicación

2026-10-16. **Dictamen: READY TO PUBLISH**, exclusivamente para el conjunto local identificado aquí. El usuario comunica aceptación técnica humana del candidato corregido condicionada a la verificación final. Esta fase acredita integridad y preparación; no ejecuta commit, push ni despliegue. No acredita Hosted/Production ni inicia H5-015.

## Base e identidad

Tras `git fetch origin`: rama `main`, `HEAD = main = origin/main = b8f4fc9db033de54bcdc01c5f7554647d02f11aa`, divergencia 0/0 e índice real sin cambios preparados. Inicialmente hay 136 rutas del candidato: cuatro archivos anteriores modificados y 132 nuevos, sin eliminaciones ni rutas ajenas al inventario auditado.

| Objeto y definición del hash | SHA256 verificado |
|---|---|
| Bytes del archivo `tests/fixtures/h5-014/corrected-candidate-inputs.json` | `1e96b60542c517660c9d0deb6394e1947e1bc6f450588848003425d31915c652` |
| Bytes del archivo `tests/fixtures/h5-014/delivery-inventory.json` | `2c67f5160ca22b84b6ac648a8797bce2411205beed763d8749a882cc1c51bde6` |
| Bytes del manifiesto original H5-013 `strict-candidate-inputs.json` | `7e5ae6a7df16d71ac7e9a8702bec8e51c04d7d9f5cb6225a076fb1c283005f06` |
| Bytes de la migración62 corregida | `b514b8c99409e2d71e9abe493df9bcf0c630541fb0899ec54d3d9ae6bc0d253e` |
| Expected H5-013 | `d4437ce800a9abd9a9ac41586baece3996ff4d8831b996b6ad1b720d45b8da64` |
| Expected H5-014 | `1d56996f01277e8f4df57eb6714ae43f5351affd4d5be6d093cf71e7626d2c5c` |

Los 434 valores de `inputs` son hashes individuales de los archivos enumerados: se recalculan todos y coinciden. El manifiesto corregido no declara un hash propio interno. El inventario sucesor contiene 135 entradas y excluye explícitamente su propia ruta: 135 más el propio inventario forman los 136 archivos entregados. Sus campos `originalCandidateManifestSha256` y `correctedCandidateManifestSha256` designan los bytes de esos archivos manifiesto, comprobados separadamente; no son hashes agregados de producto.

El campo `tree` del manifiesto original H5-013 es una ruta de la copia aislada, no un identificador Git ni un hash. El identificador histórico `bf47eaa914f1093a2403a29db4c28496dd9b1023ce8713b904f2d05b8565a32a` se reproduce con SHA256 del JSON compacto, claves ordenadas, del mapa de 173 inputs originales no pertenecientes a `tests/`. Es un agregado diferente y pertenece al producto anterior a F01. Los hashes de logs declarados en los recibos corresponden al contenido descomprimido; el inventario de publicación registra, por separado, el hash de los bytes gzip que se publicarían.

[Preflight y conjunto original completo](../../tests/fixtures/h5-014/prepublication-20261016/preflight.json).

## Controles y resultados

| Control | Resultado observado |
|---|---|
| Producto exacto | PASS: 434/434 inputs idénticos al candidato corregido, incluida configuración, dominio, adapter, migración y pruebas/verificadores. |
| Entrega auditada al inicio | PASS: 135/135 entradas y modos más inventario propio; 136 rutas exactas, cero extras. |
| F01 | CLOSED local: las seis guardas SQL corregidas siguen presentes por igualdad de bytes. Sus 12 contrapruebas de kernel y reproducción persistida constan PASS en la evidencia del mismo candidato. |
| F02 | Resuelto para publicación mediante inventario sucesor sin autorreferencia; original conservado. Véase precisión documental abajo. |
| Preservación publicada | PASS: 36.514 archivos de base contrastados con sus objetos Git. Solo difieren los cuatro archivos anteriores ya declarados. 35.922 archivos de fixtures/expected comprobados contra base, sin discrepancias. |
| Migraciones previas | PASS: las 61 anteriores coinciden con los objetos publicados; la única nueva es62. |
| Referencias originales | PASS: 36.514 entradas de preservación H5-013 y 36.589 del preflight H5-014 contrastadas. Solo las transiciones autorizadas previas y las documentales de esta fase. |
| Expected congelados | PASS: ambos sellos, bytes y hashes íntegros. Los anteriores publicados también permanecen iguales. |
| Excepción H5-012 | 17 archivos y sus modos conservados; 27 ubicaciones históricas intactas. No se aplica ni amplía a ninguna ruta nueva. |
| Evidencias | 65 gzip originales descomprimidos y CRC comprobado; 50 documentos JSON originales válidos. Fallos originales conservados. Recibos, logs y candidatos distinguidos. |
| Contenido y permisos | Archivos regulares, modo Git100644 / disco0644; sin enlaces ni ejecutables añadidos. Examen de payload plano y descomprimido sin hallazgos de secretos o datos reales; casos y registros de ensayo sintéticos. |
| Ignorados | Únicamente `.next/`, `node_modules/` y `tsconfig.tsbuildinfo`; generados/dependencias excluidos del conjunto propuesto. No aparecen `.env` locales ni inputs requeridos ocultos en el inventario de ignorados. |
| Formato | `git diff --cached --check` sobre todas las rutas propuestas en índice temporal: exit0, sin diagnósticos ni excepción. También exit0 sobre los 136 archivos originales antes de documentación de publicación. |
| Índice y objetos | Índice real preservado byte a byte. Preparación de ensayo con índice y directorio de objetos temporales separados; objetos publicados usados solo como alternates de lectura. |

[Preservación y hashes de las 61 migraciones](../../tests/fixtures/h5-014/prepublication-20261016/preservation.json), [examen del contenido original](../../tests/fixtures/h5-014/prepublication-20261016/content-screen.json), [control final de formato e integridad](../../tests/fixtures/h5-014/prepublication-20261016/format.json).

## Correspondencia con pruebas

Se verifican nuevamente los seis recibos finales de auditoría, sus hashes de logs descomprimidos y su vínculo al manifiesto corregido. No cambia ningún input funcional ni prueba; por ello no se repiten baterías completas en esta fase. Se comprueban también nueve recibos de implementación como antecedentes, sin atribuirlos al producto corregido.

| Evidencia existente del candidato corregido | Comprobación de prepublicación |
|---|---|
| PostgreSQL | 2678 casos únicos consolidados: ejecución completa2675 PASS/3 FAIL de entorno; retest completo de dos archivos46/46 PASS. Se identifican los tres nombres fallidos y se comprueba cada PASS en el retest. No es una ejecución completa limpia. |
| H5-014 independiente | 50 líneas de casos PASS en el log final. |
| H5-013 focal | 28 líneas de casos PASS en el mismo log final. |
| Unitarias y health | Resúmenes197/197 y1/1 PASS, separados de PostgreSQL. |
| Typecheck, lint de límites, build | Recibos exit0 y logs coherentes del mismo manifiesto. |
| V-MIG62, seguridad y concurrencia | Evidencia auditada conservada: instalación fresh62, upgrade61 poblado, rollback/retry, RLS/FORCE RLS, permisos, aislamiento, T10 y carreras. Esta fase verifica identidad y recibos; no simula una nueva ejecución. |
| tsconfig | Sigue idéntico al auditado: exclusión de copias archivadas `tests/fixtures`, 324 archivos activos comprobados y tres fixtures importados incluidos según evidencia. |

[Reconciliación de recibos y casos](../../tests/fixtures/h5-014/prepublication-20261016/receipts.json). [Informe independiente conservado](evidence-TSK-H5-014.md), [matriz](matrix-TSK-H5-014.md), [defectos y FAIL originales](defects-TSK-H5-014.md). Los resultados de implementación y auditoría mantienen su autoría, versión y alcance propios.

## Precisión documental y cambios de esta fase

**P01 — precisión sobre F02.** El campo autorreferente de `tests/fixtures/h5-013/inventory.json` contiene literalmente `SELF: hash supplied in delivery`. Es un marcador, no un SHA256 válido ni un hash criptográfico desactualizado. El archivo original tiene SHA256 `917c979b07a4101129d006e8d95f0e44151631d3199c65292a78f92b48f8c094`. Esta observación precisa la formulación histórica de F02 sin reescribir sus evidencias. El inventario sucesor registra ese hash real, excluye su propia ruta y satisface la verificación exigida; no se ha detectado corrupción de producto.

Solo se actualiza estado documental en PROJECT-STATUS, NEXT-STEPS y una frase de ejecución H5-013 en Tasks: aceptación técnica humana condicionada, prepublicación verificada y publicación todavía pendiente. Los antecedentes permanecen, y las tres versiones anteriores completas se archivan gzip con hashes. Invertir exactamente esas ediciones reconstruye los bytes del candidato auditado. No se alteran objetivos, criterios, filas normativas, expected, informes históricos, manifiestos recibidos ni pruebas.

[Transiciones exactas y originales archivados](../../tests/fixtures/h5-014/prepublication-20261016/document-transition.json).

## Inventario propuesto y parada

**147 archivos frente a la base: cuatro modificados, 143 nuevos y cero eliminados.** Son los 136 de la entrega auditada —con solo tres actualizaciones documentales declaradas— más 11 archivos nuevos de prepublicación: este informe, siete JSON y tres archivos gzip que conservan los documentos anteriores. Todos los tipos, modos, tamaños, hashes y estados A/M figuran en el [inventario completo de publicación](../../tests/fixtures/h5-014/prepublication-20261016/inventory.json).

El inventario final enumera 146 entradas y excluye su propia ruta, declarada en `selfExcluded`; total147. Su SHA256 se entrega fuera del archivo, junto con el identificador del árbol propuesto obtenido en el índice temporal. No se confunde el árbol Git con un commit, ni se crea un hash autorreferente. El recibo de formato se incluye en el conjunto, y el conjunto definitivo se vuelve a comprobar después de cerrar inventario y recibo.

Propuesta: un único commit atómico, **`feat(crm): evaluar cierres Booking con auditoría H5-014`**. Reuniría implementación corregida, migración62, pruebas, evidencias originales/sucesoras, aceptación condicionada y control de publicación. Propuesta sin ejecutar; conserva separados los informes del implementador y del auditor.

Estado final: `main`, HEAD y origin/main en la base indicada, divergencia0/0, índice real vacío. Los cambios permanecen en el directorio de trabajo. La verificación no autoriza despliegue ni operaciones reales. Riesgos residuales: alcance exclusivamente local/aislado, regresión consolidada en dos ejecuciones acreditadas, pendientes globales como DM-PENDING-005 y los tramos H5-015/016/H6 conservados. Cualquier cambio posterior al conjunto sellado exige nueva comparación antes de publicar.

**STOP tras entregar dictamen y evidencias.** No se crea commit, no se ejecuta push y no se prepara tarea posterior.
