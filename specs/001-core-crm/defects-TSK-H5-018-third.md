# H5-018 — tercera auditoría independiente: defectos

**FAIL. Dos defectos materiales P2 OPEN en el candidato D exacto. No corregidos por esta auditoría.** Solo datos sintéticos y PostgreSQL local/aislado. H5-017/H5-018 IN PROGRESS; DM-PENDING-005 abierto. No aceptación, publicación, commit, push, despliegue ni tareas posteriores.

Candidato: base `9649a2773530ea8a43237b4e1f2034f80e34136f`, inventario de contenido `8fc37c4b13f114d3a689cac57d68a338df75b5602cb94cfc6b5211d9359b4912`, migración 66 `dff04069aac713b87cd07b82e69d7ca5811a9ef1290dd6599605dd1eced1600c`. Se conservan las anteriores auditorías FAIL y la declaración interna D sin reinterpretarlas como aceptación.

## H5-018-3-F01 — asociación operación/ejecución incompatible en la ruta canónica actual

**P2 OPEN; familia F02, identidad completa.** Tres contrapruebas independientes fallan dos veces sobre bases nuevas: T03 y T04 (UUID distintos / UUID iguales entre tipos), capturas 03 y14, cada una 7 PASS/3 FAIL de 10. Código del reproductor: `tests/integration/postgres-h5-018-third-temporal.test.ts`. Observaciones completas y UUID sintéticos en `tests/fixtures/h5-018-third/material-findings-observations.json`.

Reproducción mediante contratos reales autorizados:

1. Definir trabajo A y trabajo B distintos, inicialmente en el mismo contexto autorizado.
2. Acreditar en B07 que la operación OA tiene `result_ref = ejecución A`.
3. Registrar una observación que combina OA con ejecución B. El registro se acepta.
4. Consultar por su petición. Se devuelve la observación con las referencias incompatibles y `operationReferenceState: canonical`.
5. Repetir con UUID de ejecución B igual al UUID de OA: mismo resultado. Los objetos pertenecen a tipos diferentes y tienen propietarios canónicos distintos.
6. Variante T03: registrar el intento antes de que exista su operación; confirmar después esa operación para B. La observación que decía ejecución A pasa de `unverified_attempt` a `canonical` sin resolver la contradicción.

Ejemplo segunda ejecución T04 sin colisión: OA `7bde168e-dce3-4053-b5b7-6a472f31ce71`, propietario canónico `5a9954dd-7fe3-4084-bac7-5ace81e54d60`, ejecución declarada `96f696b9-ad53-4a05-b23d-c0b797c46424`; registro no rechazado y observación devuelta como canónica. Con colisión, OA/ejecución declarada `401d9d3e-cd7b-4b32-a43e-c5c3bffdcf60`, propietario real `dd43200d-0457-444d-9d80-f3615795612c`.

**Causa raíz:** la migración 65, `crm_api.h5_diagnostic_record`, comprueba por separado que la ejecución pertenece al contexto actual y que la operación está en la proyección canónica. No comprueba la relación operación→ejecución que B07/B08 ya acredita. La migración 66, `crm_private.diagnostic_nodes`, acepta directamente la rama `diagnostic_operation_reference(...,canonical) <> 'incompatible'`. La comprobación del subject exacto añadida por D solo se aplica a la recuperación histórica. El nombre `operationReferenceState` verifica la operación, pero el recorrido sigue incorporando una referencia de ejecución que contradice su propietario.

**Norma:** encargo §5 (no aceptar asociaciones incorrectas), SPEC-FR-HIST-001/006, AC-081, DM-INV-047, Plan §7.1/C01/C04 y §8. El carácter `technicalOnly` impide acreditar un hecho de negocio, pero no convierte una asociación contradictoria en una referencia diagnóstica coherente.

**Correctivo necesario, no implementado:** validar la relación completa de las referencias opcionales frente a sus fuentes canónicas en escritura y lectura, incluidas la rama actual y la confirmación tardía. Conservar los originales; no inferir coincidencia por compartir contexto o UUID. Mantener la representación de intentos realmente desconocidos sin presentar contradicciones como referencias canónicas. Repetir T03/T04, D10, reproductores originales y regresiones afectadas.

El D10 original y T05 nuevo **pasan** después de trasladar el trabajo: la igualdad del subject corrige ese subcaso histórico. Este hallazgo demuestra el hueco de la rama actual, sin invalidar ese resultado específico.

## H5-018-3-F02 — pérdida temporal en consultas autorizadas desde un contexto padre

**P2 OPEN; extensión de H5-018-2-F01.** T07 reproduce dos variantes mediante relaciones canónicas reales: servicio consultado desde su reserva y reserva consultada desde su oportunidad. Capturas17 y18: **0 PASS/2 FAIL**, repetidas en bases nuevas. Reproductor: `tests/integration/postgres-h5-018-third-parent-context.test.ts`.

1. Crear una reserva y servicio sintéticos mediante los contratos existentes; conservar la relación con su oportunidad.
2. Definir trabajo con contexto del hijo y evidencia autorizada. Registrar en el contexto padre una petición con la operación real, sin `executionId` opcional.
3. El registro es aceptado y la consulta devuelve 13 nodos, incluida observación `canonical`, ejecución e historia. No se fabrica una asociación con escritura privilegiada.
4. Revisar legalmente el trabajo hacia otro contexto mediante nueva versión y aprobación.
5. La petición deja de localizar la observación desde el padre y el destino. En el caso Booking→Opportunity tampoco aparece desde la reserva original. La fila de observación permanece idéntica, la evidencia original sigue autorizada y el lector B08 conserva la historia de la operación.

Ejemplo captura 17 Booking→Opportunity: petición `ref-7cd01f353d86a11c`, operación `84336be0-031e-469a-9f6a-e647183376d2`, oportunidad `d8c10df0-a58a-48f3-8594-ae5fe425033b`, reserva `5da420af-170c-45be-8a0d-e3ee9e39efaf`. Después: consultas por petición vacías; consulta por operación en la reserva original sí devuelve historia autorizada. Variante servicio→reserva: petición `ref-795d06a6b653623c`, operación `e12f5b95-5e7b-4412-9c86-fdc7f6417c51`; mismo recorrido perdido desde su reserva.

**Causa raíz:** `diagnostic_canonical_nodes` utiliza `diagnostic_contexts` para incluir relaciones padre/hijo autorizadas (reserva, oportunidad, servicios, propuestas). La recuperación histórica 66 exige en cambio igualdad directa `d.context.contextKind = k` y `d.context.contextId = root`. Tras la revisión, desaparece la ejecución de la proyección actual del padre, y la proyección histórica no recupera la operación del hijo. La observación sigue en su padre original y se filtra como incompatible. No existe pérdida física de datos.

**Norma:** AC-081; SPEC-FR-HIST-001/006 y §21; BR-HIST-001/002/003/004; DM-INV-047; Plan C01/§8/§11.2. El caso no exige visibilidad universal ni proyecciones idénticas entre contextos: exige conservar algún recorrido autorizado para una petición inicialmente válida. Las relaciones originales y permisos pertinentes siguen acreditados.

**Correctivo necesario, no implementado:** hacer coherente el alcance histórico con los recorridos canónicos padre/hijo ya autorizados, conservando tipos, procedencia, pertenencia y revalidación de evidencia. No copiar la observación al nuevo contexto, ampliar permisos o reescribir historia. Repetir ambas variantes T07, el original R01/R02, A→B→C→A y aislamiento de contexto.

El reproductor original H5-018-2-F01 **pasa 2/2** en D; también pasa la revisión directa A→B→C→A. El cierre global de la superficie temporal sigue bloqueado por estas variantes adicionales.

## Incidencias de instrumentos conservadas

- Verificador inicial de preservación: el original de composition.ts está en la base Git, no en el overlay de pendientes. Se recupera el hash exacto desde esa base; siete inventarios/estados anteriores contrastados. No discrepancia de producto.
- Captura01: `--import` solo alcanzó al proceso padre; el hijo ejecutó65 y conservó 1 PASS/1 FAIL. No se atribuye a D. Captura02 propaga el hook limitado mediante NODE_OPTIONS y ejecuta el original intacto sobre 66: 2/2 PASS.
- Captura05 M01: comparación de datos extendida a lecturas C01 que actualizan legítimamente `identification_epochs.last_human_activity_at`. Captura15 acredita todas las filas idénticas inmediatamente alrededor de cada DDL; después de las lecturas solo cambia esa columna. M01/M02: 2/2 PASS. Fuente inicial y FAIL conservados.
- Captura16: la variante servicio intentó además una raíz diagnóstica `booking_service`, no expuesta por ese contrato. La consulta padre ya era válida; se elimina únicamente la consulta auxiliar inválida y se comprueba la historia con el lector propietario. La variante Booking→Opportunity ya mostró el defecto material en 16; 17/18 confirman ambas. Sin cambio de oráculo.
- El análisis de importaciones encontró fixtures incluidos en el manifiesto completo de copia, aunque no en el mapa estrecho status.inputs. Se contrastan contra esa captura íntegra; no se asume ausencia de dependencia.

Todos los cambios anteriores son de instrumentos nuevos de esta auditoría, con fuentes precedentes guardadas. **Producto D y pruebas protegidas intactos.** Los FAIL materiales permanecen OPEN; ningún ajuste del auditor los oculta.
