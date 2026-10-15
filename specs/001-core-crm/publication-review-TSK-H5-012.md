# TSK-H5-012 — Revisión final de publicación

2026-10-15. **Revisión técnica PASS; publicación BLOCKED.** H5-012 conserva READY FOR REVIEW local/aislado; no se declara COMPLETED ni se publica mientras falle el control completo previo al commit.

## Preflight y revisión

Fetch confirma HEAD=main=origin/main en `f063879d203330adb57d7e8fef3607ae796f52d5`, divergencia0/0 e índice inicialmente vacío. El inventario de257 archivos coincide íntegramente: rutas y hashes, incluidas migraciones59/60/61. Los428 inputs de código/pruebas coinciden con el candidato ejecutado. La preservación de36.408 archivos previos y el expected de67.346 bytes/SHA256 `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b` pasa.

Se contrastaron F01 (fecha vigente), F02 (revisiones canónicas de bloqueos/requisitos) y F03 (estado vigente de noche y ámbitos superiores) con diffs, fuentes y evidencias posteriores. Las aserciones y recibos acreditan41 casos,28 filas propias y seis límites locales. C03/C05/C06 tienen suplementos persistidos. Los recibos y logs de57 focales,2600 PostgreSQL,197 unitarias y1 health tienen hashes válidos y código idéntico. Typecheck/lint/build/auditoría de producción/V-MIG/advisors PASS. No se repiten las baterías ni se atribuyen resultados a un código distinto. No hay nuevo defecto material de producto demostrado.

El examen de contenido de257 archivos no encuentra indicadores de claves privadas, tokens de proveedores/GitHub/AWS, URI con contraseña o direcciones de correo; las pruebas y sus datos corresponden al entorno sintético/loopback documentado. Es un control de contenido y procedencia, no una garantía universal de detección de secretos.

## Control completo previo a commit

Se prepararon exactamente257 rutas en el índice y se comprobó igualdad byte a byte con el inventario. `git diff --cached --check` devuelve **exit2**, con24 avisos de espacios finales y3 de línea vacía al final, repartidos en17 logs/parches crudos históricos. Los240 archivos restantes pasan el diagnóstico de formato. Este diagnóstico parcial **no sustituye ni convierte en PASS** el control completo fallido.

La salida íntegra se conserva en gzip reversible sin pérdida; el detalle estructurado incorpora cada línea. No se normaliza ningún original, no se cambian atributos y no se omiten evidencias del candidato. No se ha aplicado una excepción de publicación por analogía con otros hitos.

## Excepción concreta pendiente de decisión humana

Autorizar exclusivamente la publicación byte a byte de las siguientes17 evidencias, con los hashes indicados, aceptando sus27 avisos de formato y manteniendo estricto el control para los demás archivos. Se conservaría el FAIL original del control completo y se documentaría la aceptación humana. No se modificarían `.gitattributes`, producto, auditores, guardas, expected ni originales.

| Ruta | SHA256 | Avisos |
|---|---|---:|
| `tests/fixtures/h5-012/audit-20261015/58-to59.diff` | `419fcbc68691b8deb0eae23dfd7af8c95c0df72e0eb396f3703afdf77af9f15c` | 1 |
| `tests/fixtures/h5-012/audit-20261015/59-to60.diff` | `4077c8510388911216aecfb91afdac6773798fc91dd07bb3e5b6aa6a4347746c` | 1 |
| `tests/fixtures/h5-012/f01-corrective-20261015/build.final.log` | `956055f09d7e7ccbce8db045314e164d695867efa815843dcedf9219ccdc4f81` | 1 |
| `tests/fixtures/h5-012/f01-corrective-20261015/function-forward.diff` | `2246509b5db3780851b00db041eb37c2af6c20096764cabf154cc303dda0b930` | 1 |
| `tests/fixtures/h5-012/f01-corrective-20261015/generated-regression/tests/fixtures/h2-011/reproducer-F01-corrected.log` | `f67087734295602d9d996ed495c202ccdb7dc913bf2dc7962f2ac528f83e3b8b` | 2 |
| `tests/fixtures/h5-012/f01-corrective-20261015/postgres-regression.final.log` | `2ff8cc3bd4c150c5d28b83e4dd021789d5d0c57dce73f2edb38907f2f50c8ab4` | 1 |
| `tests/fixtures/h5-012/f03-20261015/final-build.log` | `872377c5b02054a8775d9dd17276b2ea2a8ea969096d18cf57cbc89015f50489` | 1 |
| `tests/fixtures/h5-012/f03-20261015/final-full.log` | `1ea46db4ea85b4d2df264411a2e7f2863c85a9b27e2c8fb1af5546b01effc971` | 1 |
| `tests/fixtures/h5-012/f03-20261015/isolated-generated/tests/fixtures/h2-011/reproducer-F01-corrected.log` | `8aae7df0846d8dbf1359a801f13e59ad7cc06a5ee729a2a7e5a53c9d327abdaf` | 2 |
| `tests/fixtures/h5-012/f03-20261015/migration60-to61.diff` | `182a94e421b8ebf22d7519cf0ae2e57031d433602426b3f50e634c08e0184b53` | 1 |
| `tests/fixtures/h5-012/independent-20261015/independent-postgres.log` | `f032b580f67134ab7e9660cb70387fbb9d520984f6049c30a3c6d188b840ecc6` | 2 |
| `tests/fixtures/h5-012/resumed-20261015/final-build.log` | `27c07b0d683f4f32900b2bc61f0b5562ff651420889527d7a00398877da28d05` | 1 |
| `tests/fixtures/h5-012/resumed-20261015/final-full.log` | `b485b038323928608a2485404ff14b54e448c8fcf70c7710df90b1178327cfdb` | 1 |
| `tests/fixtures/h5-012/resumed-20261015/forward60.diff` | `a6b91679da0250bc8f57c79444336e513b771ff9f354c75d4651b5378fc0e11e` | 1 |
| `tests/fixtures/h5-012/resumed-20261015/generated-copy/tests/fixtures/h2-011/reproducer-F01-corrected.log` | `19a4cb6744fc55ab74c7fd5f02aa0dd2555115f9efb3380d1ebd940d97223f92` | 2 |
| `tests/fixtures/h5-012/resumed-20261015/run1-focal.log` | `e1f7fcb82c7392fb7e2747ebcddfb717f3fcb70b19d59c1fb00ed18db3aa86bc` | 4 |
| `tests/fixtures/h5-012/resumed-20261015/run3-focal.log` | `03e21349cd4e6b75727728ebbb386cba7bc56b49d466eefd71214f34686954d0` | 4 |

## Estado y punto de parada

La condición humana exige que todos los controles obligatorios pasen; publicar pese a exit2 requiere aceptar explícitamente esta excepción de conservación de evidencia. Se mantiene STOP de publicación. No se actualiza a COMPLETED ni se cambian PROJECT-STATUS/NEXT-STEPS/Tasks antes de resolverla. Se deshace únicamente el staging realizado por esta revisión; todos los archivos siguen presentes. No hay commit ni push.

Git conserva la base y divergencia0/0, con el candidato local intacto más este informe y los nuevos recibos de revisión. Hosted/Production no acreditados, DM-PENDING-005 permanece abierto; sin despliegue, datos reales ni tareas posteriores. H5-013 no se ha iniciado.

[Revisión estructurada y hashes](../../tests/fixtures/h5-012/closure-20261015/review-final.json), [preflight y recibos](../../tests/fixtures/h5-012/closure-20261015/preflight.json), [preservación](../../tests/fixtures/h5-012/closure-20261015/preservation-before.json), [control completo](../../tests/fixtures/h5-012/closure-20261015/staged-check.json), [salida original comprimida sin pérdida](../../tests/fixtures/h5-012/closure-20261015/staged-check.log.gz), [informe técnico anterior intacto](review-TSK-H5-012-candidate61.md).
