# TSK-H2-002 — Verificación independiente de captación y progreso comercial

Fecha: 2026-10-01. Base comprobada tras `git fetch origin`: main limpio, HEAD = origin/main = `056d77bee91fdf87ffd510559e36de115106dcc7`. H1-019 COMPLETED local/aislado; H2-001/002 NOT STARTED al inicio.

## Expected normativo congelado antes de código y observed

Autoridad: Tasks fichas H2-001/002, §§2.2/2.3, todas sus filas §6 y pendientes aplicables §7; Plan §4 B03, §7.1 C02, §7.2 T02 solo límite futuro, §7.3 y PT-01; SPEC COM-001–005, AC-001/004/005/006; BR-LEAD-001–005, BR-DIM-001/003, BR-CONV-001–004; DM-INV-005–007 y conceptos §§4/6–9/12; SM G1–G6, §§2.2/4/18 y SM-FORB-30; Constitución P08. E2E-01 solo contribución futura, integración H6 pendiente. H1-019 entrega identidades/contexto/historia, códigos OP H1-003/004 y B07 H1-013–018 reutilizables.

Los únicos mínimos comerciales son contacto válido, necesidad/evento identificable y posibilidad comercial real. Cada ausencia bloquea Opportunity; scoring, fecha definitiva, personas finales, servicios exactos y presupuesto cerrado no son requisitos. Desconocidos permanecen visibles. Lead incompleto conserva señal, contexto, origen y responsable; convertir conserva vínculo e historia. Opportunity directa del Administrador usa mismos mínimos, conserva actor/procedencia y reutiliza identidades; sin Lead, etapas, Communication ni Acceptance ficticios.

Estados aprobados: Nueva, En contacto, Necesidad definida, Propuesta en preparación, Propuesta enviada, Negociación / cambios, Aceptada / Ganada, Perdida, En pausa. Solo SM-OP-01–06/08–11 pertenecen a este bloque. Contacto intentado no implica respuesta. Negociación conserva intercambio/alcance y no cambia propuesta ni proveedor. SM-OP-04/05 y destino preparación SM-OP-10 requieren las capacidades reales de Proposal/Version de H2-003/005; hasta entonces su parte dependiente queda bloqueada explícitamente, sin mocks acreditativos ni creación futura. Las guardas comerciales se evalúan y su parte restante se conserva pendiente conforme Tasks §2.3. SM-OP-07 y Acceptance positiva pertenecen a H2-007/008. Ganada se deniega por escritura ordinaria, aprobación interna, comunicación enviada/leída, supuesto pago/proveedor o aceptación histórica.

Perdida requiere motivo y contexto; motivos mínimos representables: precio, fechas, falta de disponibilidad, cliente no responde, eligió otra empresa, canceló/cambió viaje, no encaja, otro, desconocido. No inferir causas desde silencio. Rechazo de una alternativa no pierde toda venta. Pausa exige decisión, motivo, contexto de seguimiento y estado previo. Reactivación requiere nuevo interés/decisión documentada, revisión comercial actual y destino actualmente sustentado; conserva pérdidas/pausas/motivos. Retroceso requiere cambio documentado y evaluación humana; conserva hechos/historia/versiones/envíos referenciados. Reactivar no revalida tarifas ni disponibilidad ni aceptación histórica.

P08/DM-INV-006: ninguna acción comercial crea Booking, Acceptance, fondos, conciliación, disponibilidad, proveedor confirmado, ejecución o Refund. Task pendiente nunca acredita un hecho. C02 devuelve permiso/bloqueo e IDs; dominio sin I/O. Persistencia, historia, resultado y OP H1 en una unidad atómica; rechazos sin parciales. Replay equivalente recupera resultado reautorizado, contenido distinto misma clave conflicto; concurrencia protege ausencia y revisión. V-DAT usa runtime no propietario/no BYPASSRLS, F1/F2 existentes; DML ordinario y contextos falsificados denegados. V-MIG cadena vacía y upgrade H1 con fixtures conserva todo H1 y permisos.

## Matriz formal previa

Cada R se ejecutará con fixtures sintéticos nuevos y PostgreSQL 17 efímero separado de focales; persisted-state desde conexión independiente. Expected de esta tabla precede implementación. Estado inicial de todas las filas: NO EJECUTADA.

| R | Expected / protocolos / fuente |
|---|---|
| R01 | Tres mínimos → Nueva; cada mínimo ausente → rechazo/cero Opportunity. V-DOM/DAT/SM OP-01, AC-004 |
| R02 | Omitir separadamente scoring/fecha/personas/servicios/presupuesto → permitido, desconocidos conservados. COM-001, AC-001/004 |
| R03 | Lead incompleto y conversión conserva origen/vínculo/responsable/identidades; directa sin Lead/comunicación/Acceptance ficticios. OP-01 |
| R04 | Replay y equivalente coherentes, OP único H1; distinta misma clave conflicto; permisos reautorizados. V-AT, G6 |
| R05 | Nueva → En contacto con actuación/canal/destinatario/resultado; cada guarda ausente deniega; intento no respuesta. OP-02 |
| R06 | Nueva o En contacto → Necesidad definida con necesidad/alcance/fuente/pendientes; cada guarda ausente deniega. OP-03 |
| R07 | Orígenes OP-04, alcance suficiente/alternativa/pendientes evaluados; Proposal no disponible → bloqueo limitado H2-003; cada guarda retirada bloquea. OP-04 |
| R08 | Activa, versión fijada/envío exacto real/guardas §5; capacidad no disponible → bloqueo H2-005; datos supuestos no acreditan envío. OP-05 |
| R09 | Necesidad definida → Negociación con intercambio y alcance; otros orígenes dependientes quedan pendientes; cada guarda ausente deniega, sin modificar oferta/proveedor. OP-06 |
| R10 | Activa o En pausa → Perdida con motivo/contexto; sin cada guarda deniega; todos los motivos, desconocido explícito/silencio; alternativa rechazada no inferencia. OP-08, AC-005 |
| R11 | Activa → En pausa con decisión/motivo/seguimiento; cada ausencia deniega; estado anterior conservado. OP-09 |
| R12 | Perdida/En pausa → contacto/necesidad sustentados actuales; preparación pendiente H2-003; cada guarda ausente deniega, pérdida/pausa/motivo intactos. OP-10, AC-006 |
| R13 | Activa → contacto/necesidad con cambio/evaluación humana/destino sustentado; cada ausencia deniega; historia/hechos anteriores intactos. OP-11 |
| R14 | Ganada por siete sustitutos (estado, aprobación, envío, lectura, pago, proveedor, aceptación histórica) denegada; cero Acceptance/Booking/pago/confirmación. COM-003 |
| R15 | Ejecutar pérdida sin motivo, borrar pérdida al reactivar, renovar tarifa y disponibilidad: rechazo/independencia, historia intacta. V-NEG SM-FORB-30 |
| R16 | Admin autorizado, sin contexto, falsificado, inhabilitado, ordinario/directo, RLS/ACL mínimos y escritura directa contra inmutabilidad. V-DAT, G1 |
| R17 | Historia visible en conexión independiente, identidad/código/contexto H1 conservados; ningún efecto operativo/económico ni hecho inventado. V-DAT, G4/G5, P08 |
| R18 | Fallo antes/durante escrituras → cero parciales, respuesta perdida/replay, misma clave distinta, dos actores/raíces sin hijos en ambos órdenes/solapamiento, revisión concurrente. V-AT |
| R19 | Migración desde vacía, upgrade inmediato H1 completo y fixtures identidades/códigos/historia/B07/Tasks/permisos idénticos. V-MIG |
| R20 | Independencia dominio/aplicación, IDs normativos y unknown/bloqueo dependiente; regresión completa H0/H1/H2 sin debilitar. V-DOM/EVI |

## Observed

Pendiente. No se acredita todavía ninguna fila ni se cierra H2-001/002.
