# TSK-H5-012 — Incidencias de la reanudación

2026-10-15. Registro adicional: conserva intactos el defecto, matriz, evidencia y FAIL originales. Los correctivos descritos aquí se limitan a producto local/aislado; su aceptación formal queda reservada al responsable.

## H5-012-F01 — Fecha operacional de noche

Correctivo previo conservado: migración 59 y admisión de `b04_current_nights` en calendario. Reproducción independiente repetida con migración 60 y todas sus aserciones intactas: noche vigente 23/10/2026, versión 2, aceptada 20/10, hermana 21/10 y otro Booking independientes. La única adaptación de su fuente original es cargar la migración posterior en el setup; la versión anterior y el diff están archivados. No se reutiliza como prueba el resultado anterior de F01.

Estado: **correctivo verificado de nuevo localmente; pendiente de revisión humana**. Se conserva [informe anterior](corrective-H5-012-F01.md) y [defecto original](defects-TSK-H5-012.md).

## H5-012-F02 — Proyección sin revisiones de bloqueo y requisito documental

**Causa confirmada:** el catálogo SQL de `h5_projection_read` selecciona `b04_holds` y `b07_requirements`, que contienen identidad/basis inicial, pero no las revisiones existentes con vencimiento, condiciones, estado y revisión actuales. El dominio solo admite esas identidades en calendario. C01 omitía un vencimiento explícito; el requisito pendiente tampoco era visible como tal.

Reproducción independiente anterior al correctivo: **0/2 PASS, 2 FAIL**, con canon y proyección registrados en [log original](../../tests/fixtures/h5-012/resumed-20261015/f02-red-f02.log). El primer síntoma también está en `run3-focal.log`. Fuentes: C01/C02/C07/C08, SPEC-FR-COORD-008 y arquitectura de proyecciones reconstruibles. No es un cambio de regla de bloqueo ni de requisito.

Correctivo mínimo:

- Migración 60 `20261015180420_h5_projection_canonical_revisions.sql`: añade dos lecturas de revisiones canónicas existentes, con joins limitados por raíz y `admin_scope`. Calendario toma la última revisión de cada identidad; timeline conserva todas. Se mantiene el resto literal de la función, incluida la selección mínima externa, F1/F2 inicial/final, owner, ACL y search_path.
- `coordinated-projection.ts`: admite ambos tipos de revisión y representa su certeza. Un requisito recibido sin revisión permanece pendiente; un bloqueo sin verificación o con discrepancia tampoco hereda certeza verificada. Conserva el estado original completo y su procedencia. No crea tablas, agenda, fuentes ni permisos.
- Dos pruebas nativas conservan literalmente las aserciones que fallaron, y comprueban actualización/historia/ausencia de mutación y minimización. Dos unitarias comprueban variantes de certeza. V-MIG y seguridad se repiten sobre la nueva función.

Resultado focal: **2/2 PASS** en `run4-focal.log`; integrado con 41 casos, F01, V-MIG y seguridad en **52/52 PASS**. La regresión y gates finales se documentan en el informe consolidado, sin trasladar resultados de versiones anteriores.

Estado: **correctivo aplicado y verificado localmente; pendiente de revisión humana**. No cambio de D020, economía, contratos de cancelación/modificación o expected.

## Incidencias técnicas del verificador

Todos los intentos y fuentes anteriores se conservan; ninguna aserción legítima se retiró para producir PASS.

| Intento | Incidencia técnica | Corrección del ensayo |
|---|---|---|
| run1 H02 | Documento de prueba sin `content_kind` obligatorio; rechazado antes de consultar | Completar el material sintético mínimo autorizado. |
| run1 H07 | El caso anterior archivó el destino de fusión | Restaurarlo por el contrato legítimo antes de fusionar. |
| run1 H08 | Se pidió cancelar Booking sin cancelar sus servicios | Registrar/aprobar/aplicar las cancelaciones de servicios antes de la de Booking. |
| run1 C04 | La base por participación de modalidad no es base acreditada de servicio | Aportar componente explícito de 100,00 con decisión/evidencia, conservando los ocho límites civiles esperados. |
| run1 C06 | Selector buscaba referencia en identidad del schedule | Comprobarla en su revisión canónica proyectada. |
| run1 C10 | Selector por operation_id encontró una operación B07 antes del receipt | Exigir la fuente B09 del receipt; misma fecha esperada. |
| run2 H08 | La conversión ya asigna código; la preparación intentó asignarlo otra vez | Leer el código ya asignado, comprobar conservación/diferencia con el nuevo y rechazo explícito de reasignación. |
| run3 C07 | `schedule.time` no pertenece al contrato vigente | Usar `schedule.final` y su sourceRef; misma hora y fechas esperadas. |
| run3 C11 | Finalidad del doble no era `external-boundary` | Aportar esa finalidad para alcanzar el rechazo por indisponibilidad previsto. |

C01 de run3 **no** se clasificó como error de ensayo: produjo F02 y sus dos FAIL independientes. Logs run1 (41/47), run2 (46/47), run3 (44/47) y red F02 (0/2) conservados. El primer intento de lanzar el typecheck suplementario se adelantó a la creación de su manifiesto y terminó antes de ejecutar herramientas del proyecto; se lanzó de nuevo cuando la copia estuvo lista. No cambió código ni aserciones.

No se detectó una necesidad de alterar contratos normativos ni de ampliar el alcance funcional autorizado. Las limitaciones históricas de originales no recuperados y verificaciones fuera del entorno local permanecen.
