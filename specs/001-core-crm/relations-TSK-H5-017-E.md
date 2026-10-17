# Correctivo E — mapa transversal previo a implementar

Fuentes: Plan B01/B07/B08/B10 y C01/C04; SPEC HIST001/006, AC081; contratos y tablas efectivamente existentes en migraciones 64–66, B08 y B09. No se crean entidades ni reglas de negocio. La revisión del 2026-10-17 distingue relación de propiedad canónica de mera correlación técnica.

| Relación | Fuente e identidad completa | Contexto, acceso, transición y coherencia |
|---|---|---|
| Petición→observación | `b10_diagnostic_observations`, observation UUID y request ref técnico | Ámbito, actor y raíz tipo+UUID originales; fila inmutable. La petición agrupa diagnóstico, no acredita éxito de negocio. |
| Observación→operación | Catálogo existente de propietarios en `diagnostic_operation_reference`; source+operation UUID | Conocida: debe aparecer bajo todos sus propietarios reales en proyección autorizada. Desconocida: intento no verificado; releer tras confirmación. No basta coincidencia con cualquier UUID proyectado. |
| Operación de trabajo→ejecución | `b07_operations.result_ref` + `b08_command_results.operation_id`; historia `work_*` | UUID de ejecución es sujeto del comando B08. La propiedad no cambia por revise/claim/start/result; se conserva con ámbito. Para combinar ambos IDs conocidos, acreditar esta relación, nunca dos pertenencias independientes al mismo contexto. |
| Ejecución→definición/trabajo | `b08_executions` y `b08_definitions`, definition UUID+version | Definición vigente gobierna trabajo actual; revisión autorizada crea versión con HA/material nuevos. Escritura diagnóstica exige ejecución vigente visible, evidencia enlazada y finalidad correcta. |
| Operación→historia original | `b07_history` + operaciones + resultados B08 + definición inmutable reflejada en after_state | Comprobar tipo work, subject, definition ID/version/context exactos, ámbito y `b08_context`. La observación no establece el contexto histórico. Proyectar solo referencias mínimas de esa historia. |
| Ejecución→intento/parte | `b08_attempts`, `b08_parts`, execution UUID, attempt UUID, generación | Estados/reserva/resultado derivan del propietario B08; reclamación, contacto, incertidumbre, conciliación y resultado no se deducen de un log. No retry ni duplicación añadidos. |
| Operación/evento→recepción | `b09_event_receipts`, operation UUID; `b07_records` external_event y links | Evento propio y recibido conservan procedencia/estado; evento opcional en observación debe estar autorizado. Correlación con trabajo no crea una propiedad operación→ejecución inexistente. Sin copias de cuerpo ni ampliación del contrato. |
| Raíz→padre/hijo/derivado | `diagnostic_contexts`: b04_bookings/opportunity, b04_services/booking, b03_proposals/opportunity | Pares tipo+UUID en el mismo ámbito. Booking incluye sus servicios y oportunidad; Opportunity sus bookings/servicios/propuestas. No unión por UUID sin tipo ni barrido universal. |
| Contexto histórico→vigente | Definiciones versionadas y revisión B08 | Recuperación histórica debe usar los mismos recorridos canónicos autorizados del padre, más evidencia original vigente. No mostrar estado actual de destino ajeno ni mover observaciones. |
| Evidencia→permiso | B07 records+links, scope/purpose/context, `b08_context`, F1/F2 y raíz diagnóstica | Revalidar historia y acceso en lectura. Raíz o historia no conceden permisos sobre otras fuentes. Los helpers no otorgan acceso SQL directo. |
| Referencias opcionales | Contrato DiagnosticObservation | Sin operationId o executionId no inventar pertenencia. Operación desconocida conserva incertidumbre; conocida con ejecución no acreditada se rechaza/suprime, sin borrar el original. |

## Causas acreditadas y solución mínima propuesta

Captura E01 anterior a la corrección: 12 casos originales, 7 PASS y 5 FAIL. T03/T04 reproducen F01; ambas T07 reproducen F02. Entradas y resultados crudos se guardan en `tests/fixtures/h5-017-e/01-reproduce-d.*`.

F01: escritor65 y rama actual66 validan la existencia/contexto de IDs por separado; el vínculo propietario solo se comprobaba en el fallback histórico. F02: filtro de historia66 exige igualdad con la raíz, mientras la proyección canónica65 expande `diagnostic_contexts`. Son dos predicados defectuosos distintos. Comparten una frontera incompleta de procedencia al combinar proyecciones; no se atribuyen a un único error SQL.

Migración67 propuesta: sustituir exclusivamente cuerpos de `diagnostic_nodes` y `h5_diagnostic_record`. Usar el propietario B08 para la pareja conocida en escritura y lectura; aplicar `diagnostic_contexts` tipado a historia y a referencias de ejecución visibles desde el padre, con `b08_context`. No crear tabla, helper, rol, grant o segunda fuente; conservar signatures/OID/ACL/RLS. No modificar consultas ni estados de negocio.

## Variantes previstas

Originales intactos, confirmación tardía correcta/incorrecta, tipo/UUID iguales o diferentes, operación de otro propietario, referencias nulas/desconocidas/inexistentes, estados de trabajo, antiguo par falso registrado antes del upgrade, padres con/sin executionId, servicio→reserva→oportunidad, contextos derivados, revisiones sucesivas, petición posterior y vuelta al origen, raíz/ámbito/tipo ajenos y evidencia original restringida. Mantener regresiones F01/F02/F03 y temporal, migración poblada/vacía/rollback y ejecución completa en réplica que preserve evidencias históricas.

Los vínculos de la consulta son referencias de correlación dentro de una proyección ya autorizada; cada nodo mantiene source y key. No se cambia la API ni se interpreta la presencia de un nodo como prueba de una relación de negocio. Las parejas declaradas por la observación requieren la acreditación concreta indicada arriba.
