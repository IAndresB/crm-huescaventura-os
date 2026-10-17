# H5-018 — segunda auditoría del candidato C: hallazgos

Resultado: **FAIL**. Un defecto material abierto, local/aislado. No se modifica el producto ni se autoriza aceptación/publicación. Primera auditoría FAIL e informe C PASS interno intactos.

## H5-018-2-F01 — P2 — Pérdida de correlación de una petición legítima tras revisión autorizada

**Estado: OPEN, reproducido dos veces.** Familia afectada: F02, integridad de referencias y trazabilidad temporal. No es la referencia canónica ajena del reproductor original, que ahora se rechaza correctamente.

Fuentes: AC-081 (SPEC §24.4), SPEC-FR-HIST-001, Constitución P06/P07, BR-HIST-002/004, DM-INV-047 y Plan §§7.1/8/11.2. El revisor autorizado debe poder investigar intento/historia mediante su petición; un cambio posterior no convierte una relación histórica legítima en una referencia originariamente ajena. Conservar una fila inaccesible para la consulta requerida no satisface por sí solo esa trazabilidad.

Reproductor: `tests/integration/postgres-h5-018-second-correlation.test.ts`, R01. Ejecutar con PostgreSQL17.11 y el runner aislado del repositorio:

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node scripts/test-postgres.mjs postgres-h5-018-second-correlation.test.ts
```

1. Crear trabajo en Booking A mediante el contrato autorizado y su aprobación humana sintética.
2. Registrar observación pendiente que enlaza la operación canónica de definición y la ejecución. Antes de revisar, la consulta por requestRef devuelve la observación con `operationReferenceState:canonical`.
3. Crear evidencia de Booking B y una nueva aprobación. Ejecutar `revise`, versión2, con contexto B mediante la API existente. Sin SQL administrativo para la transición.
4. El lector B08 autorizado de B devuelve el historial de la operación original; la consulta diagnóstica por operationId también localiza esa operación en B.
5. Buscar la petición original en A devuelve `[]`; buscarla en B devuelve `[]`. La fila original sigue byte a byte igual en base de datos.

Observación exacta de la repetición `11-correlation-repeat`:

- requestRef: `ref-98de78990ce5c90f`.
- operación: `416adfbd-15b6-4c4f-8236-0fdcb5af84ff`.
- ejecución: `57d41b4a-0295-49d7-ba6a-ad79a99b4d78`.
- A: `b7f8cddf-8608-43ae-99aa-3c60027f14b1`.
- B: `f9eb18c1-adf1-4607-9a5a-7a03f3443aba`.
- consulta por petición en A/B: vacía/vacía; historia autorizada por operación: presente; observación original inmutable.

Todos los IDs son sintéticos y cada ejecución genera otros. R01 falla por su aserción normativa, con cero cancelados/skipped. R02 pasa en ambas ejecuciones y controla que un intento histórico desconocido no expone estado, evidencia ni aprobación actuales de B desde A.

**Causa aislada en migración65:** línea29 deriva ejecuciones del contexto de la definición vigente. Líneas116–117 derivan operaciones/historia de esos IDs actuales. Tras revisar, la operación histórica desaparece de la proyección A aunque no se haya reescrito su hecho original. `diagnostic_operation_reference`, línea148, confunde esa ausencia en la proyección actual con incompatibilidad de procedencia. `diagnostic_nodes`, líneas166–167, oculta la observación A. En B no se incluye porque su contexto almacenado sigue siendo A. El recorrido por referencias no puede recuperar un nodo que se eliminó antes de recorrer el grafo.

**Impacto probado:** pérdida funcional de localización por petición de un intento previamente válido después de una revisión legal. No se ha demostrado pérdida física de datos, revelación de contenido ni un efecto de negocio duplicado. P2, material para AC-081 y la aceptación de H5-017.

**Corrección necesaria, no implementada:** distinguir procedencia histórica autorizada y pertenencia actual; mantener localizable la relación petición/operación/historia legítima después de revisiones, conservando su contexto y fecha originales. No resolverlo aceptando operaciones ajenas, exponiendo el estado actual de B en A, borrando/reasignando observaciones o alterando las evidencias anteriores. La solución debe conservar los rechazos del F02 original y los casos de intento desconocido que después se canoniza en contexto realmente ajeno. Requiere nuevo correctivo autorizado y auditoría de esa identidad.

## Casos que no se elevan a defecto material

Los FAIL S01/S02 de `01-temporal` y T02/T03 de `03-controls` se conservan íntegros, pero su prohibición de cualquier referencia histórica era excesiva. O01 demostró que el C01 propietario B08 permite consultar el historial anterior, incluyendo evidencia, aprobación y responsable, tras la revisión autorizada. La denegación de B07 al pedir un original con otro contexto no invalida por sí sola esa autoridad histórica. Tampoco una observación fechada anteriormente afirma que su ejecución siga siendo actual en A. No se declara filtración F01 ni referencia falsa F02 basándose en esas aserciones. Expected inicial intacto; precisión normativa en documento separado antes de R01/R02.

`09-correlation` falló en el arranque, antes de escenarios, por longitud del socket Unix (máximo103 bytes). Solo se acortó la etiqueta de la base del instrumento; código anterior, log nativo y FAIL conservados. `10` y `11` ejecutan realmente ambos casos y reproducen el defecto material anterior. No se cuentan esos dos fallos de arranque como defectos del producto.
