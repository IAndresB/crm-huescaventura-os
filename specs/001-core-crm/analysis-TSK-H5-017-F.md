# Correctivo F — análisis transversal previo

2026-10-17. Fuentes: Tasks §2.2/H5-017/H5-018/§6; Plan §§7.1/8/11.2 y C01/C04; SPEC HIST001/003/006, ERR001, AC070/072/081, DM-INV047, BR-HIST001–005. La autorización permite corregir producto y derivados, conservando los 37.874 archivos recibidos. Se añade la migración siguiente; no se modifica ningún archivo recibido.

## Mapa de identidad y procedencia

| Relación | Identidad y fuente canónica | Procedencia, versión y contexto | Consulta/escritura/replay |
|---|---|---|---|
| Petición → observación | requestRef es referencia técnica; observationId identifica la fila B10 | Fila conserva actor, ámbito y raíz tipada original; no acredita negocio | C01 filtra la raíz; C04 exige identidad y campos exactos para replay |
| Operación → ejecución | b07_operations.operation_id + result_ref; b08_command_results acredita propietario B08 | b07_history.after_state conserva definición/version/context y ejecución originales | No basta UUID igual ni pertenecer a la ejecución vigente: comprobar versión y contexto del hecho |
| Ejecución → definición | execution_id → definition_id + version en b08_executions | La versión actual cambia mediante revise; las definiciones anteriores permanecen | Estado actual solo por contexto/evidencia actuales autorizados; no hereda autoridad sobre versiones ajenas |
| Definición → evidencia | definition_id + version; b08_definitions.context | recordId y contextKind/contextId originales, validados por b08_context y B07 | Cada versión vuelve a comprobar su enlace autorizado; conservar historia en su recorrido propio |
| Definición → aprobación | proposal_id/decision_id y material exacto de B08/HA | Cada revisión tiene aprobación propia; retirar aprobación impide efecto, no borra historia | Solo proyección mínima de aprobaciones de definiciones dentro del alcance consultado |
| Intento → trabajo | attempt_id + execution_id + definition_version, generación | La versión del intento se conserva al revisar; no usar la actual para reatribuirlo | Filtrar por su definición histórica autorizada y evitar referencias a intentos ajenos al contexto |
| Parte → ejecución | execution_id + part_id en b08_parts | Estado actual; las partes antiguas pueden permanecer tras una revisión | Proyectar material vigente y referencias solo con intento de procedencia autorizada |
| Contexto padre → derivado | diagnostic_contexts sobre relaciones canónicas booking/service/opportunity | Identidad completa tipo + UUID; vínculo real y scope | El padre permite recorrido acreditado; igualdad UUID o una observación no conceden permiso |
| Historia → operación | history_id/operation_id/subject_id y snapshot canónico | Versión/contexto de after_state, contrastados con definición persistida | Recuperación autorizada original; no copiar cuerpos completos ni sobrescribir el hecho |
| Sesión → acceso | B01/F1/F2, actor/scope/finalidad/capacidad | Revocación individual/global por flujo real, restauración con nueva sesión | Autorización inicial y final; ninguna vía especial de replay elude F1/F2 |

## Causas y corrección delimitada

F01 es una extensión indebida del permiso de la ejecución actual a todas sus versiones/hechos. El filtro vigente se aplica antes de joins por definitionId/executionId que pierden contexto y versión. La misma clase de relación afecta a intentos/partes retenidos; se contraprueba dentro del alcance, sin cambiar su ciclo de vida.

F02 es una secuencia incorrecta del escritor: valida referencias como inserción nueva antes de reconocer la identidad persistida. La solución separa replay exacto reautorizado de nueva inserción y conserva bloqueo de identidad y comprobaciones finales. La proyección autorizada existente de observaciones puede reutilizarse para reautorizar el resultado previo; así no se introduce otra política de acceso.

Comparten una distinción entre contexto actual y procedencia histórica, pero son causas de código separadas: joins de consulta frente al orden del escritor. No se elimina historia ni se cambia el contrato de idempotencia.

El expected propio está congelado antes de la implementación. Las pruebas originales se ejecutan intactas mediante sustitución documentada exclusivamente del fixture de base; las pruebas históricas de migración siguen ancladas a su versión. Se añade V-MIG 68 propio. Los resultados se registran por ejecución y sin sumar solapamientos.
