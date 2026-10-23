# Recibo definitivo del cierre local TSK-H6-001

**TSK-H6-001 COMPLETED — exclusivamente local/aislado. H6 global IN PROGRESS.** La aceptación expresa del director queda formalizada en el [acta](../../../specs/001-core-crm/acceptance-TSK-H6-001-local.md) y el [informe de cierre](../../../specs/001-core-crm/closure-TSK-H6-001-local.md). El [dictamen independiente definitivo](audit-local-closure-final-v1.md) es **PASS**, con **31/31 controles agregados**. No hay discrepancia material pendiente dentro de la cobertura acreditada.

## Candidato y custodia

El candidato documental verificado es [delivery-manifest-v1.json](../h6-001-local-closure/delivery-manifest-v1.json), SHA-256 `8db429b6cc7e81cb2b6f9391711c2795a478ad3f536245c48294edc1b145a369`, **28 archivos / 8.616.571 bytes**, más su manifiesto y sello. Este recibo exterior no modifica ni pertenece a esos 28 archivos.

El [manifiesto independiente](closure-readback-manifest-v1.json), SHA-256 `17523cc36439cd1ac14df07c35405a93435079c3ff8a4658e10a5e6bd6698c25`, enumera seis archivos / 88.929 bytes. Se copiaron únicamente esos seis y sus dos envolturas desde el directorio del auditor, verificando tamaños y hashes antes y después. El [manifiesto de este recibo](receipt-manifest-v1.json) añade esta explicación y las comprobaciones finales del ejecutor; su [sello](receipt-seal-v1.json) conserva la identidad del conjunto, sin autorreferencia.

Quedan intactos los **331 paths originales**, incluido el candidato técnico de 305 archivos, sus 14 antecedentes separados y el paquete funcional independiente de 173 archivos. Los 68 archivos de migración se preservan; el universo actual de producto y migraciones es de 178 archivos, con cuatro altas heredadas ya aceptadas. H5-019 está ratificado mediante su evidencia original, sus 180 miembros históricos y 177 actuales aplicables. Los tres documentos canónicos compartidos permanecen intactos; su estado actual se entrega en [variantes aisladas](../h6-001-local-closure/documentary-variant-manifest.json) con un patch exacto no aplicado. La combinación documental requiere autorización posterior de integración/publicación.

## Comprobaciones y límites

Se reutilizan como evidencia histórica sellada los focales **22/22** del ejecutor y **22/22** del auditor, **212/212** unitarias, **7/7** contrapruebas, **3/3** comprobaciones H5-019 y typecheck/lint/build/diff-check PASS. La matriz conserva **34 AC y 105 referencias ejecutadas**. Este cierre revalida hashes, logs, fuentes, estados, inventarios y diff; no reejecuta pruebas funcionales ni accede a bases o runtimes. El verificador original acredita **557 controles PASS** y el verificador del cierre sellado **5.604 controles PASS**; son comprobaciones instrumentales, sin sumar cobertura funcional.

La regresión original permanece **2.899 PASS y 46 FAIL de 2.945 pruebas**, con los 46 sucesores PASS identificados individualmente en [AF001–AF046](../h6-001/independent/reconciliation.json). Se mantienen todos los intentos fallidos y sus identidades, incluidos los fallos intermedios. **No existe una nueva ejecución completa limpia y no se declara 2.945/2.945 PASS.**

El primer pase del auditor de cierre produjo **30 PASS y un FAIL instrumental**, conservado en [v1](final-closure-readback-v1.json). Enumeró únicamente 174 rutas presentes en la base Git y omitió cuatro altas heredadas del candidato. El [recibo de corrección](audit-instrument-correction-v1.json) preserva la causa, instrumentos y hashes. El sucesor [v2](final-closure-readback-v2.json) verifica la unión exacta de base y altas heredadas, **178 archivos**, y concluye **31/31 PASS**. No se alteraron expected, originales ni candidato para obtener ese resultado. Este incidente de instrumentación es distinto de los 46 FAIL funcionales históricos.

Las [comprobaciones posteriores al sello](executor-postseal-verification.json) y el [estado Git previo al recibo](executor-postseal-git.json) se conservan junto con la [repetición final del verificador](executor-final-verification.json) y la [custodia final](executor-final-custody.json). La custodia enumera el delta exacto esperado al añadir este recibo y sus envolturas; no atribuye al contenido histórico del principal hashes previos que no fueron registrados.

## Fronteras y publicación pendiente

H6-015 conserva cuarentena y sus **16 manifiestos / 4.568 entradas** sin discrepancias. Sus cuatro trabajos suspendidos están acreditados por recibos documentales preservados; no se consulta su runtime, no se reactiva ningún trabajo ni se entra en S11. La aceptación de H6-001 no constituye una nueva decisión de cierre H6-015.

HEAD sigue en `971c55d5ce5770c71284d106d3c0deecca9514b5`, separado en el worktree aislado; índices vacíos y principal sin cambios versionados. No se ejecutaron staging, commit, push, merge, publicación remota, Drive, despliegue, conectores ni operaciones de negocio reales.

La [propuesta de publicación](../../../specs/001-core-crm/publication-TSK-H6-001-local-closure.md) identifica 4.899 rutas históricas/candidatas, separa A/B/C/D1/D2/E, conserva procedencia R1/R2, excluye antecedentes no aprobados y fija dependencias, preimágenes/postimágenes, validación y recuperación. El cierre documental y este recibo constituyen D2 mediante sus manifiestos exactos. Nada se publica. La siguiente autorización imprescindible, únicamente si se decide publicar, corresponde a los lotes y rutas concretos y a la resolución de los documentos compartidos.

Para repetir la verificación de cierre sin iniciar servicios, desde este worktree: `python3 scripts/verify-h6-001-local-closure.py --delivery`. Para la custodia de este recibo, comprobar cada ruta, tamaño y SHA-256 del manifiesto y contrastar su hash con el sello. Los instrumentos independientes conservan las rutas y expectativas del instante auditado; no deben reinterpretarse como autorización de operaciones ni adaptarse silenciosamente a una integración futura.
