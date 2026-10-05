# Expected independiente — TSK-H4-007/008

Base normativa/producto anterior: `3306f68b30987bca86968b341301bdab63e93c13`. Derivado antes del producto y migración. Solo local/aislado, fuentes aprobadas prevalecen. Expected congelado; no acomodar producto. H4-021 integración futura NO ACREDITADA; H4-009+ y H5/H6 fuera.

Autoridad: Constitution → Product → BR → DM → SM → Architecture → SPEC → Plan → Tasks. Fichas completas Tasks §4.5, protocolos §§2.2–2.3, filas §6 y bloqueo §7 leídos. Fuentes exactas de tabla; G1–G6 y Plan §§4/5.1/7.3/8, contratos C02/C03/C04/C05/C06 y T04/T08 aplicables a todos.

Cada fixture es sintético identificado; prueba PostgreSQL real usa actor runtime con F1/F2 y recorrido H2 vigente; observador privilegiado solo inspección/fixtures técnicos/inyección claramente identificada. Las guardas listadas se retiran una por una. Evidencia necesaria por caso: comando/fixture, SQL observado, estado/historia antes/después, esperado, resultado/log completo y SHA probado. El estado posterior es el expected indicado; rechazo conserva exactamente el previo y ausencia de efectos prohibidos.

## R01

- Fuente: SPEC-FR-SVC-007; SM-HO-01; DM §5.1.
- Fixture/precondición: Proveedor concede Hold en Proposal Version real antes de Booking.
- Acción/guardas: Registrar evidencia revisada y compromiso identificado de 12 unidades.
- Expected/estado posterior: Creado con identidad, procedencia, alcance, condiciones y momentos; Booking/Acceptance no requeridas.
- Efectos prohibidos: Sin reserva firme ni envío ficticio.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R02

- Fuente: SM-HO-01; G1/G2.
- Fixture/precondición: Mismo fixture de concesión.
- Acción/guardas: Retirar individualmente proveedor/fuente autorizada, prueba, servicio, fechas/noches, cantidad/unidad, creación, condiciones, concesión inequívoca.
- Expected/estado posterior: Rechazo E3/denegación y cero raíz/historia parcial.
- Efectos prohibidos: Solicitud, negativa, silencio/ambigüedad no crean Hold.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R03

- Fuente: SM-HO-02; BR-AVAIL-003.
- Fixture/precondición: Hold Creado o No verificado.
- Acción/guardas: Comprobar fuente actual, condiciones y cobertura para acción/intervalo exactos.
- Expected/estado posterior: Vigente para acción/porción comprobadas; sin vencimiento mantiene revalidación posterior.
- Efectos prohibidos: No vigencia indefinida.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R04

- Fuente: SM-HO-02; G2.
- Fixture/precondición: Hold de 12; límite con offset explícito.
- Acción/guardas: Retirar cada guarda fuente actual, evidencia suficiente, condiciones, acción, alcance; antes/frontera/después del límite acreditado.
- Expected/estado posterior: Antes utilizable según límite; frontera/después sin cobertura; retiro rechaza sin modificar hecho.
- Efectos prohibidos: No cobertura para16/otra unidad/noche/variante/proveedor.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R05

- Fuente: SM-HO-03.
- Fixture/precondición: Hold Vigente con vencimiento y adelanto configurado explícitos.
- Acción/guardas: Evaluar antes y dentro del adelanto; retirar vencimiento/adelanto/versionado.
- Expected/estado posterior: Solo evaluación pertinente Próximo a vencer + Task conceptual; ausencia mantiene programación pendiente.
- Efectos prohibidos: Sin scheduler, extensión, envío ni liberación.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R06

- Fuente: SM-HO-04; SM §2.3.
- Fixture/precondición: Hold Creado/Vigente.
- Acción/guardas: Vencimiento explícito o incertidumbre con causa/evidencia; retirar causa/límite/alcance.
- Expected/estado posterior: Vencido o No verificado en parte afectada; Review conserva antes/después y dependencias; guardas ausentes rechazan.
- Efectos prohibidos: Tiempo no reduce capacidad; partes independientes continúan.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R07

- Fuente: SM-HO-05; G3; C05/T08.
- Fixture/precondición: Hold Creado/Vigente/Vencido/No verificado.
- Acción/guardas: Decisión humana, alcance y registro B07 manual de petición realmente enviada; retirar cada guarda.
- Expected/estado posterior: Liberación solicitada con última vigencia y12 conservadas; preparada/aprobada sin envío rechaza.
- Efectos prohibidos: Sin comunicación real, ejecutor nuevo, IA sin exacta aprobación ni fondos.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R08

- Fuente: SM-HO-06; BR-SUP-003/004.
- Fixture/precondición: Hold12 con o sin solicitud.
- Acción/guardas: Proveedor acredita liberar4 en porción/noche exacta.
- Expected/estado posterior: Restan8 misma unidad; solicitud preservada; espontánea no fabrica petición.
- Efectos prohibidos: No liberar otra noche ni más capacidad acreditada.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R09

- Fuente: SM-HO-06; G2/G6.
- Fixture/precondición: Hold12 y respuesta parcial.
- Acción/guardas: Retirar prueba inequívoca/proveedor/alcance/momentos; cantidad excesiva, unidad incompatible, negativa, silencio, ambigüedad.
- Expected/estado posterior: Rechazo/pending sin reducción ni falsos hechos; replay fiable de4 no resta de nuevo.
- Efectos prohibidos: Texto similar no fusiona hechos distintos.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R10

- Fuente: SM-HO-07.
- Fixture/precondición: Hold Vigente/No verificado/Vencido con porciones.
- Acción/guardas: Prórroga/cambio acreditado parcial con términos nuevos expresos; retirar fuente, revisión, condiciones o fecha nueva.
- Expected/estado posterior: Solo parte cubierta reevaluada; original y anteriores recuperables; demás partes intactas.
- Efectos prohibidos: No extensión silenciosa ni reactivación de parte liberada.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R11

- Fuente: SM-HO-07; G4.
- Fixture/precondición: Proveedor identifica compromiso distinto.
- Acción/guardas: Registrar nueva identidad con sustitución acreditada.
- Expected/estado posterior: Original y nuevo enlazados; no overwrite ni liberación implícita del anterior.
- Efectos prohibidos: No fusionar dos Holds parecidos.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R12

- Fuente: SM-BS-03; DM §5.1; SPEC-FR-SVC-007.
- Fixture/precondición: Hold anterior a Booking en línea seleccionada.
- Acción/guardas: Convertir por contratos H2 reales; vincular al servicio/contribución pertinente; retirar identidad/cadena/alcance/condiciones/vigencia.
- Expected/estado posterior: Mismo Hold/original/condiciones; proyección Opcionado/bloqueado cuando guardas; sin vencimiento Task revalidación; link insuficiente rechazado.
- Efectos prohibidos: No Acceptance/Booking sembradas, cambios términos, confirmación o liberación automática.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R13

- Fuente: AC-021.
- Fixture/precondición: Concesión sin vencimiento12; dos noches.
- Acción/guardas: Revalidar; petición enviada; liberación4; prórroga expresa de parte.
- Expected/estado posterior: Secuencia mantiene12 tras petición y8 tras liberación; revalidación sin fecha; partes/condiciones históricas visibles.
- Efectos prohibidos: Sin TTL ni prórroga de resto.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R14

- Fuente: SM-FORB-07.
- Fixture/precondición: Hold aparentemente favorable.
- Acción/guardas: Intentar opción→reserva firme/servicio confirmado; fecha prevista→ejecutado.
- Expected/estado posterior: Rechazo e independencia comprobada con hechos actuales.
- Efectos prohibidos: Sin mocks o estados privilegiados de capacidades futuras.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R15

- Fuente: SM-FORB-12; DM-INV-021.
- Fixture/precondición: Hold sin límite o pendiente de liberación.
- Acción/guardas: Intentar TTL inventado; aviso/Task completada/aprobación/petición/tiempo→liberación.
- Expected/estado posterior: Rechazo/sin inferencia; historial y restante conservados.
- Efectos prohibidos: No declaración de capacidad externa liberada.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R16

- Fuente: BR-SUP-004; G2/G4/G6; E8.
- Fixture/precondición: Términos posteriores verificados.
- Acción/guardas: Respuesta antigua registrada tarde; contradicción sin precedencia demostrable; noticia reciente ambigua.
- Expected/estado posterior: No overwrite por llegada; incertidumbre/revisión solo alcance afectado con E8; último hecho conservado.
- Efectos prohibidos: No elección arbitraria ni alterar acuerdo aceptado.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R17

- Fuente: P09; AC-019/051/020; G5.
- Fixture/precondición: Noches12/10 y4 nominales; Required Document Recibido; disponibilidad12.
- Acción/guardas: Operar Hold de noche1 y liberar/prorrogar parte.
- Expected/estado posterior: Noche2 intacta; siguen12/10;4 no suman; documento no revisado no satisfecho; disponibilidad no cubre16.
- Efectos prohibidos: No contactos ficticios ni cumplimiento/confirmación por Hold.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R18

- Fuente: PLAN-B04/B07/B08; C02–06; T04/T08.
- Fixture/precondición: Contratos/versiones vigentes.
- Acción/guardas: Examinar persistencia, proyección mínima y Task existente.
- Expected/estado posterior: Efecto/historia/resultado/Task juntos; reuse B07/Review/Task; versiones exactas.
- Efectos prohibidos: Sin sistema paralelo ni integración H4-021 acreditada.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R19

- Fuente: G1; F1/F2; D037/038/039.
- Fixture/precondición: Runtime ordinario no privilegiado.
- Acción/guardas: Sin/falso contexto, sesión revocada, actor inhabilitado, replay tras revocar.
- Expected/estado posterior: Denegación antes de leer/escribir/replay; sin resultado previo filtrado.
- Efectos prohibidos: Owner/service_role/BYPASSRLS no actor.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R20

- Fuente: P10/P11; Architecture §§5/9/14.
- Fixture/precondición: Dos scopes y dos cadenas comerciales sintéticas.
- Acción/guardas: UUID/evidencia/Hold/pre-Booking ajenos, CRUD directo; errores/proyecciones.
- Expected/estado posterior: RLS/FORCE/ACL/owners/helpers privados/search_path; no enumeración; mínima finalidad; originales privados.
- Efectos prohibidos: Sin economía interna/datos terceros en salidas para destinatario.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R21

- Fuente: DM-PENDING-005; D016/017.
- Fixture/precondición: Fixtures sintéticos.
- Acción/guardas: Inspección de tratamiento y originales/correcciones.
- Expected/estado posterior: Linaje B07 preservado; sin audio/consentimiento/retención/borrado importante inventados.
- Efectos prohibidos: No datos reales ni conectores.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R22

- Fuente: G6; Architecture §12.1.
- Fixture/precondición: Operación/facto fiables.
- Acción/guardas: Misma clave/material; distinta clave mismo hecho; misma clave distinto material; dos hechos similares.
- Expected/estado posterior: Replay durable sin doble raíz/porción/historia/Task; E2 diferente; dos distintos conservados.
- Efectos prohibidos: No dedup por descripción/filename/importe.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R23

- Fuente: T04/T08; V-AT.
- Fixture/precondición: Dos sesiones PostgreSQL runtime independientes.
- Acción/guardas: Altas equivalentes/distintas, liberaciones competidoras, liberación vs prórroga/verificación, prórrogas distintas; ambos órdenes y overlap observado.
- Expected/estado posterior: Serialización raíz/recurso compartido, una base consumida; stale E2; no sobreliberación/historia parcial.
- Efectos prohibidos: No bloquear solo hijos sin proteger raíz.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R24

- Fuente: T04; V-AT; H2 continuidad.
- Fixture/precondición: Hold en propuesta y conversión H2.
- Acción/guardas: Link/conversión vs cambio; alcances independientes concurrentes.
- Expected/estado posterior: Versión cadena/porciones validada; link obsoleto no aplica; independientes continúan.
- Efectos prohibidos: No modificar conversión futura ni otras noches.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R25

- Fuente: C03; V-AT.
- Fixture/precondición: Antes/durante root/porciones/historia/resultado/Task.
- Acción/guardas: Inyectar fallo escritura y deferred COMMIT; pérdida respuesta tras COMMIT real.
- Expected/estado posterior: Rollback exacto todo o nada; durable replay posterior sin repetir efecto.
- Efectos prohibidos: Sin raíz huérfana ni reserva fondos.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R26

- Fuente: V-MIG; P13.
- Fixture/precondición: Base vacía y40 poblada con Requirement revisado/original privado, Incident INC/historia, Availability.
- Acción/guardas: CLI oficial forward; instalar41; comparar datos/catálogos; DDL fallo+rollback+retry.
- Expected/estado posterior: 40 previas/fuentes/health intactos; IDs/referencias/objetos/cantidades/economía/historia/owners/ACL/functions/policies/triggers/roles preservados.
- Efectos prohibidos: No editar/renumerar migraciones previas.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

## R27

- Fuente: V-EVI; Tasks §2.2/2.3.
- Fixture/precondición: SHA congelado.
- Acción/guardas: Regresión completa PG/unit/health, install/typecheck/lint/build/audit/diff-check.
- Expected/estado posterior: Cero material FAIL/skipped/cancelled; recuentos sin doble cómputo; Fxx conservados/retest; SHA exacto y logs recuperables.
- Efectos prohibidos: Sin atribuir capacidades futuras ni ensayo no hecho.
- Evidencia necesaria: fixture y prueba por ID; observación SQL/historia/proyección; log completo, esperado/observado, SHA.

