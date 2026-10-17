# Sexta auditoría H5-018 — análisis independiente del candidato G

## Identidad y método

Se recibió el conjunto completo de 38.388 archivos y se recalcularon sus metadatos antes de crear instrumentos. El inventario descomprimido y sello coinciden con los hashes suministrados por el director. El producto auditado se mantiene congelado. Las fuentes primarias, expected propio previo a ejecutar, capturas y pruebas de esta auditoría están separados bajo `h5-018-sixth` / `TSK-H5-018-sixth`.

Independencia de procedimiento: consulta directa de normas, expected propio anterior a ejecución, nuevas contrapruebas y nuevas ejecuciones; no se presenta el PASS del implementador como acreditación. Los runners de captura/réplica derivan de los recibidos para conservar el aislamiento; se revisaron y su derivación está declarada. La sexta auditoría no constituye una firma de otro profesional ni una validación Hosted/Production.

## Fixture y consumidores

El fixture original coincide byte a byte con Git base. La adaptación tiene un hunk: 11 líneas añadidas y 3 retiradas; conserva sus cuatro exports y todo el resto del código. Se compararon directamente ambas fuentes (`fixture-independent.diff`).

1. `attest` toma por defecto `q.at`; si se suministra evidenceAt, lo conserva exactamente. No normaliza el futuro a pasado.
2. La prueba auxiliar de esta instancia de `conf` cambia exclusivamente claims que empiezan por `cancellation:` al acto sintético fijo 17 de octubre, 10: 00Z. Las otras familias delegan al proof heredado, manteniendo su reloj.
3. El hook cambia la resolución del módulo original de cancelación al bridge; conserva tres padres exactos: bridge, V09 quinta y temporalG. El hook F precedente conserva sus pares exactos de imports y fixtures históricos. No reescribe aserciones, no modifica SQL y no intercepta Date/Auth/F1/F2.
4. El bridge puede seleccionar original o G; el modo de traza solo consulta occurred_at, conserva resultado/error y se utiliza para el contraste causal. La completa usa G sin traza.
5. Se inventariaron todos los imports directos, incluidos consumidores indirectos como refund y closures. Las otras funciones exportadas por el módulo derivado conservan bytes/lógica.

## Cronología y límite acreditado

La guarda de `payment_evidence` de migración H3-010 exige `occurred_at <= at_time`; `modification_proof` la conserva. `cancellation_apply` verifica evidencia antes de escribir la determinación. El fixture original generaba pruebas con `conf.at` real para un acto fijo, por lo que después de 17 de octubre, 10: 00Z los positivos llegaban con evidencia posterior y eran rechazados correctamente.

Las contrapruebas propias prueban -1 día/-1 ms/igual/+1 ms/+1 día; fijan términos y fecha civil contractual; el derecho se obtiene de la tabla normativa SM §12.2, no del código. Se verifican fechas de 2025/2026/2027, evidencia histórica, tiempo registrado real, contexto/cobertura ajenos, certeza no revisada, contradicción facts.at/command.at, replay, conflicto E2 y conservación de historia y pagos.

La adaptación auxiliar conserva un límite explícito: su defecto de fecha es el acto fijo, no cualquier acto arbitrario. Una base económica auxiliar con fecha 17 de octubre debe ser rechazada para acto13 de octubre; el control independiente lo reproduce dos veces y luego acepta evidencia auxiliar explícita 13 de octubre sin alterar la anterior. No hay relajación del producto ni falso positivo. Esto impide atribuir a G una normalización universal de todos los relojes; V09 original conserva además su precondición de ejecución posterior al acto fijo.

## Selección y exclusiones heredadas

Se auditó el catálogo recibido: 223 archivos de integración,196 seleccionados y 27 fuera de esa selección. G no añadió exclusiones.24 son predecesores con derivada seleccionada: las llamadas `test()` se conservan y se revisó cada diff. Los cambios recibidos son import de fixture/migración o comprobación de la transición exacta autorizada de composition; no un permiso genérico para ignorar hashes.

Dos instrumentos de segunda auditoría tienen prohibiciones históricas demasiado amplias, identificadas por aclaración normativa conservada; no se declaran PASS actuales ni se borran. La trazabilidad legítima sigue R01/R02 y pruebasD/T/Q, contrastada con BR-HIST y C01 propietario. El tercer archivo no incluido era V-MIG66 de tercera auditoría; esta sexta lo reejecuta adicionalmente, separado de los 2945 casos del candidato. Se conserva su versión de producto histórica, sin acreditarla como68.

`selection-replacement-review.json` contiene los 27 registros y los diffs correspondientes. La selección principal debe finalizar con15 fases disjuntas196 archivos. Las propias contrapruebas, repeticiones y V-MIG66 adicional se informan aparte.

## Integridad y límites de entorno

El runner de la completa copia todo el conjunto incluido en su snapshot a una réplica de bytes verificados con índice Git independiente. Tres outputs históricos conocidos pueden regenerarse únicamente allí y se guardan aparte. La réplica solo se retira después del postcheck íntegro, nunca a partir de un mero contadorPASS. El workspace conserva los 38.388 recibidos, cinco auditorías FAIL, expected,68 SQL y 456 inputs H5-016 con única transición autorizada anterior.

Solo PostgreSQL y Storage locales efímeros con datos sintéticos; sin servicios de negocio. Descarga/auditoría de dependencias es una comprobación técnica. No commit, push, deploy, H5-019, H6 ni cierre COMPLETED; DM-PENDING-005 OPEN.

## Incidencias de instrumentos propios

`01-temporal` conserva 12 PASS/1 FAIL: el auditor utilizó `estimated`, no admitido por B07, antes de alcanzar el negativo de cancelación. Se conserva ese rechazo como contraprueba B07 y se usa el valor permitido `candidate` para alcanzar la guarda de evidencia no revisada; repetición13 PASS.

`04-typecheck` conserva un fallo de estrechamiento de unión TypeScript en el test propio; se añadió una aserción que exige administratorDecision antes de usarla. La nueva ejecución de tipos y la repetición temporal pasan. Las dos versiones previas del test se conservan con hashes en `instrument-originals`; ningún archivo del candidato cambió y el expected propio permanece congelado.
