# H6-001 — Readback exterior independiente v3

**PASS de identidad, integridad y custodia del candidato local congelado.** No queda discrepancia de archivos ni de inventario detectada en este readback. El dictamen funcional conserva su calificación PASS técnico local con regresión explícitamente reconciliada. La aceptación corresponde al director: H6-001 y H6 global siguen IN PROGRESS; H6-015 permanece COMPLETED exclusivamente local/aislado y en cuarentena.

| Identidad verificada | Resultado exacto |
|---|---|
| Manifiesto exterior H6-001 | `d97ab86cd4d78c001f5a5e29f3ce501c0c6b44cf592a7b22e78589c26569c435` |
| Payload propio | **305/305 archivos; 52.932.020 bytes**, todos los tamaños y SHA-256 coinciden. Segunda lectura al terminar sin cambios. |
| Sello exterior | `17bda49a2b9a9d174024fe7d413b39f02b57c1e930be22c91a6cc09eb3d9bd99` |
| Manifiesto funcional independiente | `dff39c22bde4a56e42af7d811df69a8438f8ed24b02f790e43360d13dc5d29e6` |
| Paquete funcional | **173/173 payloads; 14.044.516 bytes**, más tres envolturas, íntegros e incluidos en el paquete exterior. |
| Antecedentes | **14/14 exactos**, comparados contra su origen; excluidos del payload propio. |
| Inventario Git del candidato | **321 rutas distintas = 305 propias + 14 antecedentes + 2 envolturas**. Sin faltantes ni paths adicionales antes de añadir este recibo exterior. |
| Inventario de publicación | `d4964979f7a52a95aa0e56847b284844aede566137f2d25e7ef88612483cf87a`; 304 entradas propias más autorreferencia de inventario, 14 antecedentes y lotes A–E separados. PREPARADO, publicación no autorizada ni ejecutada. |

El instrumento propio realizó 34 controles agregados y el cotejo separado del delta Git. Es una lectura de archivos y hashes; no son nuevas ejecuciones funcionales. El recibo JSON contiene controles, referencias exactas y límites.

La regresión original conserva **FAIL: 2.899 PASS / 2.945 posiciones; 46 FAIL**. Se verificaron las 46 filas AF001–AF046 y sus líneas originales FAIL/sucesoras PASS en los logs sellados. Las 46 tienen sucesor identificado, cero hallazgos materiales pendientes según el dictamen funcional. **No existe una segunda ejecución completa limpia.** No se suman las repeticiones a la cobertura original. Los focales ejecutor e independiente conservan sus 22/22, y sus hashes de stdout/stderr corresponden a los registros entregados.

Los 16 manifiestos protegidos de H6-015 y sus 4.568 entradas se revalidaron otra vez, incluidos los objetos de los dos snapshots archivados. El recibo de cuarentena conserva cuatro trabajos pausados, intento ausente/efecto incierto suspendidos y S11 false. Esta constatación es documental; no se arrancó recurso, restauró copia ni ejecutó SQL.

El principal conserva HEAD `971c55d5ce5770c71284d106d3c0deecca9514b5`, índice vacío y cero cambios versionados. Las 14.954 rutas históricas y tamaños coinciden con v1; no se inventa un hash previo de su contenido. El candidato sigue en la misma base y sin staging. Los 178 archivos de producto/migración coinciden con base más antecedentes exactos, incluidas las 68 migraciones. Las cabeceras vigentes y cuerpos históricos mantienen las distinciones autorizadas. V1, v2 y sus copias incorporadas conservan bytes y sellos.

No se ejecutaron pruebas, nuevas regresiones, runtime, SQL, restauraciones, S11, staging, commit, push, acceso remoto ni Drive durante este readback. Solo se escribieron los instrumentos y recibos propios en `/tmp/h6-001-custody-audit/`.

El informe consolidado del ejecutor remite a este recibo sin anticipar su resultado dentro de los 305 archivos sellados. Estos archivos permanecen intactos. El paquete v3 puede copiarse selectivamente a `tests/fixtures/h6-001-delivery-readback/`, fuera de ese payload, usando exclusivamente los cuatro miembros de su manifiesto y las dos envolturas. Un README de enlace en ese directorio es una envoltura adicional del ejecutor; no forma parte de este sello ni del payload H6-001 verificado.

**Recomendación de custodia:** no hay objeción de identidad o integridad para que el director valore la aceptación exclusivamente local/aislada del candidato técnico. Este recibo no declara COMPLETED ni autoriza publicar H6-001, sus antecedentes o H6-015. La independencia es de contexto e instrumentos sobre máquina compartida; no constituye auditoría organizativa externa.
