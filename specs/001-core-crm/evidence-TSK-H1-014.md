# TSK-H1-014 — matriz formal independiente (V-DOM, V-DAT, V-MIG, V-EVI)

Base normativa fijada 2026-09-30 antes de inspeccionar las assertions focales de H1-013: Tasks TSK-H1-014 y §6–7; Plan §§5.1/5.3/7.1/8; SPEC-FR-PROP-006, HIST-001/003, COORD-007, INT-001/004, AC-087; Constitution P05–P07/P10–P15; BR-DOC-001–005, BR-COMM-001–006; DM §§7/12–14, DM-INV-043/045/047; SM-CO-04–06 y SM-FORB-21; Architecture B07/B09, C01/C03/C04. Datos sintéticos y clúster PostgreSQL efímero; ninguna prueba con PII real, Storage, conector, hosted o Production.

Estado inicial: H1-013 aún en implementación, H1-014 NOT STARTED. Cada fila parte de una sesión F1/F2 válida y registro vacío salvo el antecedente sintético declarado. PASS exige observar también estado persistido desde una conexión diferente; un error del adaptador por sí solo no basta. Las filas de rechazo exigen ausencia de registro, enlace, operación e historia nuevos.

| ID | Fuente | Estado inicial y estímulo sintético | Expected / criterio PASS |
|---|---|---|---|
| R01 | SPEC-HIST-003; DM-INV-045 | Original sintético y derivado enlazado | Dos identidades; el original inmutable; derivado con vínculo, fuente, finalidad y revisión. |
| R02 | SPEC-HIST-003; AC-087 | Un original, dos contextos, tercero no enlazado | Un solo original, dos enlaces auditados; lectura solo bajo contexto enlazado, sin acceso global. |
| R03 | BR-COMM-005; SPEC-HIST-003 | Llamada manual sin archivo/audio, hecho anterior al registro | Alta válida; actor, fuente, canal/cobertura, ocurrido y registrado conservados; ninguna Acceptance implícita. |
| R04 | SPEC-COORD-007; AC-087 | Entrada sintética acreditada sin borrador | Hecho recibido inicial, sin borrador, envío ni aprobación fabricados. |
| R05 | SM-CO-04; SPEC-PROP-006 | Salida creada sin prueba y envío con prueba concreta | Crear salida no crea envío; prueba separada produce solo hecho Enviada con destinatario/contenido. |
| R06 | SM-CO-05; SM-FORB-21 | Salida ya Enviada sin prueba de recepción; luego prueba específica | No Recibida inferida; prueba propia crea solo recepción, no aceptación. |
| R07 | SM-CO-06; AC-087 | Respuesta concreta con autor/cobertura/tiempo y prueba | Respuesta ligada al original; ambigüedad no crea aceptación/confirmación. |
| R08 | SPEC-PROP-006 | Proposal sin versión o autorización aplicable | Envío rechazado, sin efectos; con versión, destinatario y autorización acreditados se admite el hecho local, no envío real por conector. |
| R09 | DM-INV-043; AC-087 | Documento adjunto/evidencia candidata | No pago, aceptación, revisión ni recepción inferidos. |
| R10 | SPEC-INT-001/004; DM-INV-047 | Source, external ref/event pendiente | Quedan separados de identidad canónica y de confirmación; procedencia y cobertura conservadas. |
| R11 | DM-INV-047; SPEC-HIST-001 | Corrección de hecho previo | Registro original preservado; corrección enlazada, actor/tiempo/motivo e historia nueva. |
| R12 | C03; T09/T11 | Misma operación y payload, luego mismo ID/material distinto | Replay exacto sin duplicación; conflicto material sin cambios. |
| R13 | C03; T11 | Carreras de alta/enlace | Un solo efecto/operación e historia coherente; no éxito parcial. |
| R14 | C03; DM-INV-047 | Fallo inducido en historia | Rollback de registro/enlace/operación e historia. |
| R15 | C01/C03; Constitution P10–P15 | Runtime directo, rol PUBLIC/anon/authenticated, sesión inválida | Ningún acceso directo a tablas ni RPC sin credencial firmada; denegación no escribe. |
| R16 | V-MIG; Architecture B07/B09 | Cadena previa H0/H1 y migración nueva | Aplicación forward-only; owner separado, RLS/FORCE y grants mínimos; sin tocar migraciones previas. |
| R17 | DM-PENDING-005; Tasks §7 | Fixtures sintéticos | Ninguna PII real; límites local/hosted/Production explícitos. |

## Defecto y reverificación

**H1-014-F01 — CLOSED localmente.** Fuente: SM-CO-04–06, SM-FORB-21, SPEC-FR-PROP-006 y AC-087. Expected R05–R07: envío, recepción y respuesta requieren prueba propia y no se infieren entre sí. Observado al preparar la matriz adversarial: la primera versión del registro permitía reutilizar el mismo `evidence_id` del envío para acreditar recepción/respuesta dentro de una comunicación. Reproductor: crear Communication saliente, Evidence de envío y dos Communication Fact con distinto `fact_kind` pero igual `evidence_id`. Materialidad: un envío podría aparentar recepción. Corrección: comprobación explícita y índice único transaccional `(original_id, evidence_id)` para hechos de comunicación; los hechos posteriores aportan otra Evidence. Se conservó el expected anterior. Reverificación completa R01–R17: PASS.

## Observado

V-DOM/V-DAT/V-MIG/V-EVI: **R01–R17 PASS**, 5/5 pruebas formales en clúster PostgreSQL efímero independiente de las focales, con estado persistido contrastado desde otra conexión. R13 intentó dos enlaces simultáneos al mismo contexto: un solo vínculo, operación e historia sobrevivieron. R14 provocó fallo de escritura de historia: no quedó registro, vínculo ni operación. R15 comprobó denegación de lectura directa del runtime, ausencia de grants PUBLIC/anon/authenticated/runtime y owner/RLS/FORCE de cuatro tablas. R16 aplicó la migración después de la cadena previa H0/H1. No hay Fxx material abierto.

Fixtures solo sintéticos. DM-PENDING-005 sigue abierto; no se acreditaron datos reales, audio, objetos Storage, conectores, Auth real, hosted, Production ni las integraciones H2/H3/H4/H5/H6. PLAN-AUTH-001–006 mantienen sus pendientes globales.
