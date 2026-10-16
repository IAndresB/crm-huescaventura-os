# H5-016 — Derivación de dependencias e invalidación

La cobertura no se deduce de «36 triggers». La contraprueba A02 obtiene las definiciones SQL del catálogo instalado, recorre desde `closure_inputs`, `closure_basis` y `closure_assess` las funciones/vistas referenciadas, conserva todas las sobrecargas y registra permisos y triggers de cada relación. Se contrastó además la forma de escritura en sus APIs. El recorrido es un **superset técnico de lecturas**, no una afirmación de que cada campo leído sea un fundamento material de las tres dimensiones.

Evidencia recuperable: `tests/fixtures/h5-016/dependency-graph-final.json` y `migration-security-final.json`. Se identifican **46 tablas leídas directa o indirectamente**:31 con invalidación y15 de soporte/origen. Hay otros cinco puntos de invalidación complementarios en la misma unidad de escritura. La matriz de negocio sigue siendo la de H5-013; no se ha sustituido por este análisis de dependencias.

| Familia y relaciones | Escritura y raíz | Resultado de la auditoría |
|---|---|---|
| Servicios, versiones operativas, modificaciones y sus revisiones | Booking directa; la modificación añade versión con su unidad de historia | Locks e invalidación cubren INSERT/UPDATE de las versiones. Modificación aplicada intercalada después de leer cierre; intento de reasignar/borrar servicios denegado. |
| Schedules, revisiones, ajustes de obligación | Booking/schedule; raíz derivada del padre | Ajuste material y cobertura actual serializados; ambos órdenes heredados y nueva pausa después de leer fundamentos. |
| Pagos, asignaciones, revisiones, actos y reconciliación | Payment root previo; Booking derivada de detección/asignación/correspondencia, IDs ordenados | Se observan locks reales; dos cambios con revisión idéntica producen un éxito y un conflicto. Reasignación a Booking distinta rechazada por contrato existente. |
| Facturas, suplidos, economía propia y revisiones | Booking directa o resuelta desde invoice/economy/suplido | Invalidación junto a la revisión; no sustituye pagos/documentos. Carrera de corrección de factura sobre Booking externa pendiente, límite declarado. |
| Provider Payment, Refund y Deposit | Identidades padre inmutables; revisiones con raíz del padre y protocolo económico previo | Cambios causantes e invalidación comparten transacción. Sus contratos no se modifican. |
| Incident y Requirement | Booking del expediente/requisito; revisión inmutable | Crítica global se protege incluso con impacto localizado no material; incidente Leve no material no invalida. Nueva exigencia documental sí invalida. |
| Availability, Hold, Confirmation, aplicación de catálogo y realidad | Resolutores de servicio/Booking/Opportunity ya aprobados | Se mantiene el orden de raíces; invalidación diferida observa la unidad completa. La evidencia de prestación y los snapshots anteriores no se reescriben. |
| Determinaciones, revisiones y aplicaciones de cancelación | Booking común con modificación y economía | Nueva intercalación de determinación frente a lectura del cierre; la operación pendiente no permite cierre. No se interpreta como recorrido H6 completo. |

## Las15 tablas sin trigger específico de invalidación

| Tablas | Motivo y comprobación |
|---|---|
| `catalog_revisions`, `b03_proposal_lines` | Versiones fijadas referenciadas por identidad, sin UPDATE/DELETE para executor. Una versión nueva no reescribe la aceptada. La aplicación nueva usa `catalog_applications`, que sí participa en la raíz. |
| `b04_bookings`, `b04_modalities`, `b04_contributions`, `b04_nights`, `b04_night_occupancies` | Origen fijado por conversión H2 dentro de la creación única de Booking; sin UPDATE/DELETE para executor/runtime. Cambios posteriores se expresan mediante versiones operativas. Los intentos directos de reasignación/eliminación se rechazan. No se concede al usuario el rol de migración. |
| `b05_customer_payments`, `b05_provider_payments`, `b07_incidents`, `b04_holds`, `b04_confirmations`, `b05_deposits` | Identidades padre inmutables; los cambios observables están en sus revisiones/factos, que adquieren la raíz. INSERT inicial y revisión inicial pertenecen a la misma operación, no una API que deje un padre mutable sin historia. |
| `b05_refund_movements` | Movimiento inmutable registrado por la unidad Refund con revisión y porciones; el writer de revisión participa en Booking. No hay DELETE ordinario ni reasignación de movimiento. |
| `catalog_items` | Identidad de catálogo. Conserva un grant UPDATE histórico al executor, pero el límite ordinario revisado publica nuevas `catalog_revisions` y exige la misma relación padre/relacionada; no expone reasignación de identidad. Runtime no tiene DML directo. Ese grant histórico no se amplía en63. |

Los cinco puntos complementarios son `b04_confirmation_evaluations`, `b05_fund_revisions`, `b05_obligation_adjustments`, `b05_reconciliations` y `b06_cancellation_applications`. Se conservan: no se elimina una protección por no figurar en el recorrido de lecturas.

## DELETE, referencias y privilegios

Las relaciones fuente examinadas no conceden DELETE al executor ni al runtime. Las filas de historia relevantes añaden además triggers de inmutabilidad. Por ello no procede añadir triggers DELETE para una operación de negocio que no existe. Las reasignaciones de Booking/alcance no se modelan como UPDATE silencioso de esas identidades: los comandos mantienen alcance y referencias y las APIs verifican el contexto. Las cuatro familias de reasignación/borrado ensayadas mantienen bytes e historia, y la Booking independiente no cambia.

Las funciones de cierre e invalidación elevan solo al executor ya definido, NOLOGIN/NOSUPERUSER/NOBYPASSRLS, con search_path fijo y ACL comprobadas. RLS/FORCE RLS y ausencia de DML runtime se prueban sobre instalación y upgrade. El rol de migración/ensayo puede fabricar estados dañados para contrapruebas: no se presenta esa capacidad como acceso ordinario ni se pretende resistir a un administrador de base que desactive controles.

## Materialidad, historial y orden

El disparador BEFORE existente toma la raíz; el constraint trigger diferido calcula el fundamento completo y persiste la invalidación dentro del mismo commit. Se mantienen resolutores y orden existentes, sin bloqueo global. Un cierre en curso no puede validar antes de un cambio y escribir después de ese cambio sin serialización: la sonda A03 detiene la llamada tras `closure_inputs` y muestra al escritor esperando en la raíz. Otra Booking puede cerrar durante esa pausa.

La invalidación es persistida y no se elimina por restaurar datos posteriores. Un cambio no material puede cambiar `inputs/material` para una nueva decisión optimista sin invalidar una evaluación cuyo fundamento no cambió. A08 prueba esa diferencia. Reabrir solo añade evaluación y resultado; una comparación independiente de ocho familias de datos verifica ausencia de cambios económicos/operativos/documentales colaterales.

No se encontró una ruta ordinaria que evitara la invalidación ni una invalidación de Booking ajena en el alcance probado. No es una demostración exhaustiva de todas las secuencias de mantenimiento privilegiado ni una prueba de carga.
