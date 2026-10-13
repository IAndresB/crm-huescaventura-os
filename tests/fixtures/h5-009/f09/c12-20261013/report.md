# C12 — correctivo focal validado; STOP de preservación F16

**Estado: STOP. No hay PASS global ni cierre de C12, F09 o H5-009/010.** F06–F08 mantienen el cierre global pendiente. No se ha creado ningún commit ni efectuado push en esta actuación.

## Candidato y alcance

Rama main; base HEAD `eda8b0becb3daa2dff1baa02be53cec914750f13`; origin/main `fdbd08bafdc6651d1ad6867242cd71791a25deb6`; divergencia8/0. El candidato probado es esa base **más las tres modificaciones autorizadas**, identificadas por la huella de433 entradas `e55e6b06fefcf3591eee71b02f96e5d2cafebbae8579fcbac93fce75908ed2c9`. Estos resultados no se atribuyen al commit base sin cambios. Índice vacío.

Se aplicó el patch preparado: `evidenceAt` explícito, valor por defecto `change.at`, misma ruta previa de evidencia cuando no se proporciona un instante. C12 conserva su archivo y aserciones originales. El producto, reglas de cancelación, F2, migraciones, dependencias y contratos no se modificaron.

| Archivo modificado | SHA256 anterior | SHA256 corregido |
|---|---|---|
| `tests/support/h4-cancellation-fixtures.ts` | `1c3e91375632a520893f4a92d2ffd969ff17a2012776a9e7a1abdc3e51c6ec03` | `dd2b851e5d2888f60f249af0bc3f9000edc160d88da58ffcd200bc2deb6ee15a` |
| `tests/support/h5-006-dependency-preservation.ts` | `d8f1fdacb3508dfe40a924e14ecda98cc01345de5bb3540fc9a24277704a292c` | `8a422285bd817982eeb9c8785616aed07a209121ea7290b9075a1348f3ba49f5` |
| `scripts/verify-h5-008-evidence.mjs` | `7a39b57837db8cbfecafc0cac825ac887548e36d6d26deeb0af4aedf3b628d3b` | `6a744a03d5aa8598c4a3c5f7fdd90e5fa6c634012513f225341ca86f350b3afa` |

Todos son archivos regulares0644. Sus originales Git están en [before.tar.gz](before.tar.gz). La transición literal del fixture está en [c12-transition.json](c12-transition.json). La guarda compartida no aprueba sus propios bytes: [trust.json](trust.json) se verifica contra Git y el sello externo `eff6a0afc814707138913bdd3a2270e7458f5029d9569ce42d2b46bbe45f80f0`, mediante [verify-trust.mjs](verify-trust.mjs) sin importar las guardas modificadas y mediante el auditor antes de importar la guarda compartida. La autorización se limita a las tres rutas y al contexto H5-009/010 local/aislado. Las transiciones F07/F09 se conservan.

## Resultados de esta ejecución

| Control | Resultado |
|---|---|
| H4-014 completo y contrapruebas temporales C12 | 110/110 PASS:102 históricas y8 nuevas |
| Consumidores del fixture y H3-006/R52 | 338/338 PASS; H3-006 contiene75 casos |
| Focales H4/H5, incluidas migraciones fresh/upgrade/rollback/retry | 70/70 PASS |
| PostgreSQL completa, wrapper protegido | **2473/2473 PASS**,0 cancelados,0 omitidos |
| Comparación posterior F16 | **FAIL / STOP**, dos OID adicionales distintos |
| Unitarias completas | 171/171 PASS |
| Build y health independiente | PASS; health1/1; salidas nuevas exclusivas |
| Frozen install, typecheck, lint/import boundaries | PASS |
| Auditoría de dependencias de producción | PASS, sin vulnerabilidades informadas |
| Preservación directa C12 y confianza independiente | 15 controles esperados PASS |
| Clasificación del auditor | 29 controles esperados PASS |
| F01 / F05 | 12 /18 controles esperados PASS |
| Transiciones F07/F09 | 40 controles esperados PASS |
| Recuperación documental / gzip | 13 /26 controles esperados PASS |
| Wrapper | 14 controles esperados PASS |
| F10/F12 y preservación H5-008 | PASS antes de la regresión |
| Advisors, cierre, diff staged completo y publicación | No ejecutados tras STOP |

Los FAIL inducidos son rechazos esperados y se conservan íntegros. No se ajustaron aserciones originales. Las contrapruebas C12 comprueban evidencia anterior/simultánea aceptada, posterior rechazada por `CANCELLATION_EVIDENCE_REQUIRED:E3`, efecto transaccional nulo del rechazo, medianoche Madrid, equivalencia UTC y construcción con fechas2020/2030 sin utilizar el reloj de la prueba. El camino por defecto sigue llamando a `conf.proof`.

## Nuevo bloqueo F16, localizado

Histórico:1.858.702bytes, SHA256 `8b6c0298b17b7ede0fabb58a264953f0ccfa5e880e89a8d472b3644e870003d7`.

Regenerado:1.858.702bytes, SHA256 `846b32a5783eab39313c7e82dfff04ba25865ddba0213fd0f9e8becadabb04be`. Se conserva comprimido dentro del paquete, separado del histórico restaurado.

Se observan71 diferencias escalares: las mismas69 diferencias de hashes de tablas ya documentadas y dos diferencias nuevas:

| Función | Campo | Histórico | Regenerado |
|---|---|---:|---:|
| modification_source_material | after.functions[153].oid | 20452 | 20453 |
| modification_counterparty | after.functions[154].oid | 20453 | 20454 |

Ambas funciones están ausentes del catálogo `before` y presentes en `after`. Todos sus restantes atributos coinciden, incluidos cuerpo, firma, propietario, ACL, search_path, seguridad y tipo de retorno. `before` y `changedBodies` son idénticos; los nombres y el número de tablas131 también. La prueba C16 existente compara los datos antes/después dentro de la ejecución y conserva por OID todas las funciones preexistentes; esa prueba pasó.

**No se ha demostrado un cambio funcional ni corrupción de datos.** Tampoco se ha demostrado qué asignación interna consumió el OID adicional: el entorno efímero ya había terminado. No se atribuye la diferencia al correctivo C12. La comparación suplementaria vigente exige que no existan diferencias fuera de las69 tablas y por ello devolvió error después del PASS de PostgreSQL. Se conserva ese FAIL sin relajar el comparador ni autorizar el hash nuevo.

Intervención mínima propuesta, pendiente de decisión específica: revisar la semántica de comparación de estos dos identificadores de funciones nuevas entre entornos efímeros, manteniendo identidad por nombre/firma, cuerpo y permisos exactos, el catálogo previo intacto y todas las pruebas de datos dentro de cada ejecución. No se propone cambiar el producto, snapshots, manifiestos o hashes históricos, ni reconstruir evidencia. Antes de reanudar, exigir contrapruebas que rechacen alteraciones de cuerpo, firma, ACL, propietario, funciones preexistentes, datos y rutas no autorizadas. No se aplica esa propuesta en esta actuación.

## Preservación

El wrapper finalizó con `restorationComplete=true`, cero cambios históricos inesperados y código real0 de PostgreSQL. Restauró F01, F02, preservation.log y F16 a sus bytes, permisos y tipos originales. Expected independiente24417bytes conserva SHA256 `b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639`. Manifiestos y snapshots originales intactos.

Las223 entradas del inventario mantienen el estado autorizado:217 directamente iguales, cuatro representaciones gzip autorizadas, el auditor autorizado y la guarda compartida con su transición independiente. Las221 entradas distintas de esas dos guardas conservan sus bytes lógicos. Las tres evidencias pendientes previas se mantienen exactas. El fixture C12 es una ruta histórica adicional protegida y dispone de su transición literal autorizada; no forma parte de esas223 entradas.

Las rutas suplementarias actuales se justifican e inventarían individualmente. Solo las rutas literales admitidas se aceptan con sus tipos, permisos, tamaños y hashes sellados. El paquete incluye el diff exacto `authorized-changes.patch`, preflight, recibos, comandos, tiempos, stdout/stderr, FAIL originales y resultados. Los programas de continuación no ejecutados quedan como código de trazabilidad, sin que su presencia acredite ejecución o cierre.

## Pérdidas y anomalía separadas

- build.log: **ORIGINAL NO RECUPERADO**,545bytes, SHA256 `063f7ffad5445d9b2a45a17aceb16a01a6dfbbe70032787c0fdd02ea690fd0fa`.
- health-independent.log: **ORIGINAL NO RECUPERADO**,202bytes, SHA256 `2794076bee6b763f2a15c62a692735addf3e6b08e4fa296266b92953489f6f30`.

Las salidas nuevas no recuperan esos originales ni sustituyen sus hashes históricos. R67/R030 permanece como anomalía histórica independiente de causa no demostrada; no reapareció en esta suite. Hosted/Production no acreditados.

## Evidencias y STOP

[Paquete de verificaciones](verification-evidence.tar.gz): 1344727bytes, SHA256 `5c4c792a9580e78be0e4077598ddfe5196bc9974fce614db42653fe3eb8630db`, 341 entradas comprobadas mediante inventario interno. `stop-diagnosis.json` y `f16-new-difference-diagnosis.json` contienen la discrepancia precisa; `gates/postgres-full/preservation/` contiene stdout/stderr, restauración y F16 regenerado. [Inventario final](final-inventory.json) conserva también los inventarios anteriores y el FAIL C12 original de la ejecución previa.

Se detiene la actuación sin nuevas regresiones, ampliación de excepciones, cierre, commit o push. H5-011/012, H6 y conectores reales no se inician. La siguiente decisión corresponde a la revisión humana del bloqueo F16.
