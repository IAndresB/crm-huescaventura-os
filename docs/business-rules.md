# CRM HUESCAVENTURA OS — Business Rules

Status: DRAFT
Version: 0.2
Last updated: 2026-09-06

## 1. Propósito y alcance

Este documento desarrolla las reglas lógicas, comerciales y operativas de CRM HUESCAVENTURA OS. Describe condiciones, información necesaria, efectos y límites para que los documentos posteriores puedan definir el dominio y los estados sin inventar políticas de negocio.

Fuentes revisadas íntegramente: [Constitution v1.0](constitution.md), [Product Definition v0.1](product.md), [decisiones registradas](DECISIONS.md), [Project Status](PROJECT-STATUS.md), [Next Steps](NEXT-STEPS.md) y el borrador de reglas publicado en 6fe23d7. La revisión del propietario de 2026-09-06 aporta las decisiones operativas expresamente aprobadas que se incorporan aquí y se agrupan en D010–D017. La Constitución se conserva con su nombre real en Git: docs/constitution.md.

Las referencias «C Pxx», «Producto §n» y «Dxxx» identifican las fuentes aprobadas. «O §n» remite al apartado numerado de la revisión operativa del propietario incorporada en esta versión; los valores comerciales indicados proceden de esa revisión, no de estimaciones del redactor. Cada regla hereda las fuentes de su sección. Se conservan los identificadores BR existentes y se añaden nuevos sin reutilizar identificadores. El documento integrado sigue DRAFT, pendiente de revisión humana final mediante ChatGPT; esto no deshace la aprobación expresa de las decisiones de negocio incorporadas.

- **BR-GOV-001 — Autoridad y aprobación.** Rige la jerarquía Constitución → decisiones aprobadas / definición de producto → reglas de negocio → documentos posteriores. Un conflicto se resuelve a favor de la Constitución; una contradicción no resuelta entre otras fuentes aprobadas exige decisión humana sobre la parte afectada. La redacción de una regla derivada no constituye su aprobación: todo este documento queda DRAFT para revisión.
- **BR-GOV-002 — Límite documental.** Se recogen reglas lógicas y estados base aprobados, sin diseñar tablas, campos físicos, SQL, contratos técnicos, componentes o transiciones detalladas. Las máquinas de estados, arquitectura, Specs e implementación corresponden a fases posteriores. Solo permanecen BR-PENDING sobre aspectos aún abiertos; los resueltos se trasladan a reglas y se registran en el cuadro de resolución.

Fuentes: autoridad de la Constitución, C P03–P04 y P18–P19; Producto §19–20; D006.

## 2. Principios generales de las reglas

Fuentes: C P01–P02, P05–P11, P14–P15 y P20; Producto §4–5, §9–16; D003–D004 y D009; O §2 y §63–65; D013 y D016.

- **BR-GEN-001 — Veracidad y procedencia.** No se inventan identidades, precios, disponibilidades, cantidades, costes ni condiciones. Un dato usado para decidir debe tener fuente identificable y vigencia cuando corresponda. Una estimación solo puede utilizarse como tal con regla aprobada; se distingue del dato confirmado.
- **BR-GEN-002 — Bloqueo material.** Si falta información que determina la validez, alcance, autorización o importe de una acción, se detiene esa acción y se identifica qué dato falta y por qué importa. Pueden continuar el registro, la investigación y las tareas independientes. Desconocido no equivale a cero, gratuito, disponible, aceptado ni confirmado.
- **BR-GEN-003 — Naturaleza de la evidencia.** Se distinguen información solicitada, comunicada, confirmada y ejecutada; estimaciones y datos definitivos; propuesta y aceptación comercial; confirmación operativa, movimientos económicos y evidencia documental. Solicitar, comunicar, detectar automáticamente o estimar no confirma un hecho. Lo definitivo requiere validación del alcance y fuente; incluso una evidencia inequívoca no elimina la aprobación humana de una acción sensible de IA exigida por P15.
- **BR-GEN-004 — Historial y dimensiones.** Los hechos materiales conservan su historia; corregir exige dejar rastro de la situación anterior. La aceptación comercial, la preparación operativa y los movimientos económicos se distinguen y no se sustituyen mutuamente.
- **BR-GEN-005 — Granularidad.** Participantes, cantidades, confirmaciones y componentes económicos se conservan al nivel de servicio y, en alojamiento, de cada noche. Los resúmenes no sustituyen ese detalle ni propagan una cantidad global sobre él.
- **BR-GEN-006 — Economía reproducible y acceso.** Cada importe debe poder reconstruirse desde sus componentes y reglas aplicadas. Costes, márgenes, beneficios, comisiones y desgloses internos están reservados a administradores autorizados, también cuando aparezcan en documentos, historial o resultados de IA.
- **BR-GEN-007 — Actores y efectos sensibles.** Toda acción requiere permiso para su alcance. Durante la primera fase, las acciones sensibles de IA requieren aprobación humana explícita vinculada a la propuesta concreta; una automatización debe dejar rastro de su identidad, versión y resultado.
- **BR-GEN-008 — Fuente canónica y fuente externa.** Supabase conserva los datos canónicos del CRM; GitHub conserva código, documentación y decisiones versionadas. Una información externa incorporada al CRM conserva su procedencia y no cambia por ello quién tiene autoridad para confirmarla.

## 3. Contactos y clientes

Fuentes: C P05–P07 y P10; Producto §3, §5–6 y §16; O §7–9 y §68; D011 y D017.

- **BR-CON-001 — Contacto inicial y datos por momento.** El contacto puede abrirse con datos incompletos y procedencia conocida. Para preparar/enviar una propuesta se solicitan normalmente nombre, apellidos, email, método válido de contacto, participantes aproximados y adultos/niños cuando sea relevante. Es una solicitud habitual, no una barrera global: solo se bloquea la acción que dependa materialmente del dato ausente. Tras aceptar se solicitan los datos necesarios de cliente/facturación, normalmente DNI/NIF, dirección completa y los demás realmente necesarios; no habilita facturación legal.
- **BR-CON-002 — Identificación de personas.** La atribución de una comunicación, aceptación o petición a una persona debe apoyarse en información verificable. Una coincidencia parcial de nombre o canal no acredita por sí sola que se trate de la misma persona ni que tenga autoridad sobre una reserva.
- **BR-CON-003 — Personas y organizaciones.** Contacto es la persona física con quien se comunica Huescaventura. Organización es la empresa, colegio, agencia, asociación, club o entidad a la que se vincula cuando corresponda; puede tener varios contactos. El historial es consultable por persona y organización, y se conserva el de la organización aunque otro año cambie el interlocutor. Contacto, pagador y participante no se presuponen la misma persona.
- **BR-CON-004 — Responsable principal.** Cada oportunidad/reserva identifica normalmente un interlocutor principal que puede recibir/aceptar propuestas, comunicar cambios, solicitar modificaciones, proporcionar datos y recibir recordatorios y documentación. Su designación y las evidencias de actuación quedan vinculadas al expediente. No obtiene acceso a costes, márgenes, honorarios o información interna ni a datos personales innecesarios. Su aceptación válida por WhatsApp puede ser aceptación comercial, sin acreditar pago, confirmación económica o del proveedor.
- **BR-CON-005 — Duplicados y fusión humana.** Se detectan posibles duplicados por teléfono, email, nombre/apellidos y combinación de señales; teléfono/email exactos tienen fuerte peso, pero no demuestran por sí solos identidad. No se fusiona automáticamente en V1. La fusión requiere acción humana y conserva el historial completo de ambos registros, relaciones y procedencia, sin destrucción silenciosa.
- **BR-CON-006 — Actualización y minimización.** Se actualizan datos con fuente conocida y se conserva la trazabilidad de cambios materiales. Se recopila únicamente información necesaria para la finalidad autorizada; ni completar una ficha ni resolver un duplicado justifica pedir datos personales innecesarios.

## 4. Leads y oportunidades

Fuentes: C P05–P07; Producto §6–7; O §6 y §45; D011.

- **BR-LEAD-001 — Señal de interés.** Un lead representa un contacto o señal de interés comercial con contexto y procedencia conocidos. Se admiten datos por concretar; no equivale por sí solo a cliente comprador, oportunidad cualificada, reserva o aceptación. La entrada futura desde formularios se regula en BR-INT-008.
- **BR-LEAD-002 — Conversión a oportunidad.** Se puede convertir un lead cuando concurran un método válido de contacto, una necesidad/evento identificable y una posibilidad comercial real de trabajar la venta. No se exige scoring obligatorio en V1. La oportunidad relaciona cliente/contacto, necesidades, fechas, participantes previstos y servicios de interés según se conocen.
- **BR-LEAD-003 — Avance condicionado.** No se exige fecha definitiva, número final de personas, servicios exactos ni presupuesto cerrado si pueden concretarse durante la venta. Se puede investigar y seguir la oportunidad con pendientes visibles. Antes de asumir un compromiso se verifican los datos materiales de ese compromiso, sin cerrar todas las incógnitas del expediente.
- **BR-LEAD-004 — Contexto comercial.** Cada oportunidad debe conservar origen, necesidades, fechas, tamaño previsto, servicios de interés y responsable según sean conocidos. Las estimaciones y los cambios de necesidad no sustituyen a hechos ya confirmados; se conserva su evolución.
- **BR-LEAD-005 — Pérdida y reactivación.** El motivo es obligatorio al marcar Perdida. Los motivos normalizados mínimos son precio, fechas, falta de disponibilidad, cliente no responde, eligió otra empresa, canceló/cambió viaje, no encaja, otro y desconocido. Se conserva motivo y comunicaciones; si no se conoce la causa real se selecciona desconocido, no se inventa. Reactivar mantiene la pérdida anterior y no renueva por sí solo tarifas/disponibilidad. Los estados base constan en BR-DIM-001.

## 5. Propuestas comerciales

Fuentes: C P05–P07 y P20; Producto §7 y §11; O §12–15, §22–26 y §73; D010–D011.

- **BR-PROP-001 — Procedencia y alcance.** Toda propuesta se relaciona con la oportunidad que la origina. Debe poder identificarse qué servicios, fechas, participantes, condiciones e importes se están proponiendo y qué sigue pendiente, sin exigir todavía campos físicos o un formato concreto.
- **BR-PROP-002 — Alternativas y versiones.** Pueden coexistir alternativas para una oportunidad. Una propuesta puede contener varias modalidades para miembros diferentes del grupo conforme a BR-PACK-002. Preparar, aceptar o rechazar una alternativa no elimina las demás; los cambios materiales de composición, precio o condiciones generan una nueva versión y las propuestas conservan exactamente la versión utilizada.
- **BR-PROP-003 — Precios y estimaciones.** Antes de presentar un importe como verificable se debe conservar su fuente y las cantidades y reglas utilizadas. Un precio estimado se etiqueta y exige una regla aprobada de estimación; no se transforma en precio comprometido sin la validación correspondiente. La disponibilidad se acredita por separado.
- **BR-PROP-004 — Vigencia y revalidación.** La validez por defecto es de 7 días y es configurable. Si un precio, disponibilidad o bloqueo del proveedor vence antes, prevalece la fecha más restrictiva. Una propuesta caducada queda pendiente de revalidación y no puede aceptarse automáticamente: primero se revalidan precios y disponibilidad materiales. Se conserva la versión, fecha de emisión y vencimiento efectivo aplicados.
- **BR-PROP-005 — Evidencias de aceptación y rechazo.** Son válidos WhatsApp del responsable, email, formulario/web, anticipo inequívocamente ligado a la propuesta y aceptación telefónica registrada manualmente por usuario autorizado. En todos los casos se vinculan propuesta exacta, versión, aceptante, momento, canal y evidencia; en la telefónica también quién la registró. Leído/visto, silencio, mensaje ambiguo, solicitud de información o envío de propuesta NO acreditan aceptación. Un rechazo conserva alternativa afectada y motivo conocido.
- **BR-PROP-006 — Inmutabilidad de lo aceptado.** No se sobrescribe la propuesta aceptada ni la versión exacta de las condiciones aceptadas. Una modificación/revisión conserva antes/después, personas y servicios afectados, diferencia económica, política, solicitante, aprobador, fecha y evidencia. Los cambios posteriores de tarifas o términos no alteran documentos históricos. Los términos y el futuro mandato de suplidos se detallan en BR-DOC-005 y BR-BILL-004.

- **BR-PROP-007 — Seguimiento.** Se genera recordatorio interno al administrador/comercial a los 2–3 días y un aviso previo a caducidad. El CRM puede preparar el mensaje de seguimiento, pero en V1 no lo envía al cliente sin supervisión. La fecha concreta dentro del intervalo y el adelanto del aviso se configuran sin inventar una hora universal; la caducidad exige revalidación.
- **BR-PROP-008 — Canal web preferente futuro.** Cuando exista, se prefiere un enlace de propuesta con «Aceptar propuesta» y aceptación explícita de condiciones. Se conservan propuesta/versión, términos/versión, fecha/hora, identidad del contacto, evidencia técnica razonable e IP cuando sea apropiado. Debe incluir aceptación del mandato/autorización de suplidos cuando corresponda; su actualización legal efectiva sigue pendiente (BR-PENDING-033).

## 6. Conversión de oportunidad a reserva

Fuentes: C P05–P08 y P15; Producto §7–8; D009; O §20 y §24–28; D011–D012.

- **BR-CONV-001 — Base comercial verificable.** Convertir una venta aceptada en reserva requiere poder identificar la oportunidad, la propuesta y el alcance aceptado. Una intención, borrador o respuesta ambigua no autoriza presentar una venta como aceptada.
- **BR-CONV-002 — Continuidad de la información.** La conversión conserva los vínculos y la versión aceptada, traslada los hechos confirmados sin cambiar su significado e identifica expresamente datos y servicios aún pendientes. No constituye un nuevo acuerdo comercial por sí sola.
- **BR-CONV-003 — Independencia operativa.** Una venta ganada puede originar una reserva cuyos servicios siguen pendientes de disponibilidad, proveedor o preparación. No se deduce la confirmación de un servicio a partir del éxito comercial de la oportunidad.
- **BR-CONV-004 — Aceptación, economía y confirmación.** La aceptación comercial permite trabajar la reserva en confirmación sin dar por recibidos fondos ni confirmados los servicios. La confirmación operativa requiere los servicios críticos necesarios confirmados y las condiciones económicas aplicables satisfechas, incluidas BR-PAY-002 y sus excepciones autorizadas. La IA requiere aprobación humana para crear/confirmar/modificar/cancelar reservas. Altas directas y división/agrupación de oportunidades se difieren a su futura especificación (BR-PENDING-027).

## 7. Reservas

Fuentes: C P06–P09 y P15; Producto §7–10 y §15; O §8, §26–27 y §43–44; D012.

- **BR-BOOK-001 — Expediente único de referencia.** La reserva concentra el contexto de la experiencia o conjunto de servicios: procedencia comercial, grupo, fechas, responsables, participantes, pagos, documentos y comunicaciones. Los canales o documentos externos no crean versiones competidoras de ese expediente; su información se vincula y concilia.
- **BR-BOOK-002 — Datos confirmados y pendientes.** Las fechas, integrantes, proveedores y demás datos conservan su naturaleza conocida, prevista o confirmada. Para comunicar un compromiso sobre la reserva debe conocerse su alcance material; que quede información pendiente no impide trabajar sobre sus partes independientes.
- **BR-BOOK-003 — Responsabilidad y seguimiento.** Debe poder identificarse el responsable del seguimiento comercial u operativo de las acciones realizadas y las tareas asociadas. Un responsable de tarea, un contacto cliente y un proveedor no adquieren por esa relación permisos generales sobre toda la reserva.
- **BR-BOOK-004 — Cambios e incidencias.** Modificaciones, cancelaciones e incidencias permanecen ligadas al expediente con sus efectos y antecedentes. Solicitar una cancelación o registrar una incidencia no acredita que todos los servicios se hayan cancelado, que se hayan devuelto pagos ni que se hayan ejecutado compensaciones.

## 8. Servicios dentro de una reserva

Fuentes: C P08–P09 y P20; Producto §8–10; O §3–5, §27 y §30–32; D010 y D012.

- **BR-SVC-001 — Catálogo configurable.** Las categorías principales configurables son Actividad, Alojamiento, Restauración, Ocio nocturno/copas, Transporte, Extra/complemento y Otro. Cada una admite múltiples servicios, variantes y tarifas; entradas, guías y materiales siguen siendo servicios posibles cuya clasificación se configura. Agua, tierra, aire, nieve e indoor son atributos de actividad, no categorías principales rígidas. El catálogo se mantiene como datos editables desde CRM; no se hardcodea.
- **BR-SVC-002 — Alcance propio.** Cada servicio gestiona independientemente fecha y hora cuando correspondan, proveedor, participantes, cantidad, disponibilidad, confirmación, coste, precio, dependencias, preparación, ejecución e incidencias. Un dato global no sustituye los datos particulares ni convierte lo desconocido en confirmado.
- **BR-SVC-003 — Confirmación acotada.** Una confirmación solo cubre el servicio y el alcance que la evidencia identifica. Queda prohibido confirmar todos los servicios porque la reserva esté confirmada comercialmente o porque otro servicio sí lo esté.
- **BR-SVC-004 — Dependencias y realización.** Se conservan las dependencias conocidas para explicar qué puede prepararse y qué está afectado. Disponible, confirmado y preparado no prueban ejecución; esta requiere su hecho y evidencia. Los estados base se registran en BR-DIM-004 y los cierres en §28, sin diseñar ahora transiciones.

- **BR-SVC-005 — Recomendación y elegibilidad.** Cada servicio configura si se recomienda para Despedidas, Grupos de amigos, Empresas / Team Building, Familias, Niños, Colegios / grupos juveniles y Parejas, con prioridad Alta, Media o Baja. Recomendación comercial y elegibilidad objetiva son independientes: edad, peso u otra restricción pueden impedir una actividad aunque sea muy recomendable para ese público.
- **BR-SVC-006 — Unidades y tarifas.** Se admiten personas, plazas, vehículos, habitaciones, alojamientos completos, unidades, horas, noches, días/jornadas y otras unidades configurables. Los precios pueden ser por persona, adulto/niño u otras categorías, vehículo, habitación, alojamiento completo, grupo fijo, servicio fijo, unidad, hora, noche, día o combinaciones. Se conservan mínimos, máximos, tramos, variantes y condiciones específicas aplicables. Nunca se presupone «personas × precio/persona»; charanga, autobús, taxi, otros transportes o extras pueden tener precio fijo por grupo/servicio.
- **BR-SVC-007 — Horarios alternativos.** Se distinguen fecha, hora solicitada, franja, alternativas, preferencia del cliente, opciones ofrecidas, hora final, llegada recomendada y duración. Si el cliente solicita 11:00 y el proveedor ofrece 10:00, 12:30 y 16:00, confirmar 12:30 conserva todas esas fases; una alternativa no se convierte en definitiva por detectarse en un mensaje.
- **BR-SVC-008 — Localizaciones.** Cada servicio puede mantener ubicación, punto de encuentro, dirección, enlace/mapa, acceso y llegada recomendada. Un mismo servicio puede tener localizaciones variables; se conserva la pertinente al alcance de la reserva.
- **BR-SVC-009 — Incompatibilidades de agenda.** El CRM detecta incompatibilidades obvias considerando horario, duración, localización y desplazamiento. En V1 genera aviso, no bloqueo automático; el administrador revisa y puede justificar una excepción. El aviso no anula restricciones objetivas de seguridad/capacidad ni convierte estimaciones de desplazamiento en hechos confirmados.

## 9. Participantes y cantidades

Fuentes: C P05, P07, P09–P10 y P20; Producto §8–10; O §5, §10–11, §13 y §21; D010–D012.

- **BR-PAX-001 — Tamaño del grupo.** Se distingue tamaño estimado y tamaño confirmado, con su procedencia. El tamaño estimado no se convierte en confirmado por utilizarlo en una propuesta; un tamaño desconocido no se interpreta como cero.
- **BR-PAX-002 — Autonomía por servicio.** Cada servicio conserva su cantidad y, cuando sea necesaria, su selección de participantes. El total general del grupo NO puede sobrescribir ni sustituir cantidades definidas en servicios, aunque cambie posteriormente.
- **BR-PAX-003 — Diferencias válidas de alcance.** Pueden existir cantidades distintas entre actividades, restaurante, transporte y alojamiento. No se fuerza igualdad con el grupo ni entre servicios. Las diferencias se explican desde el alcance conocido; no se aprueban con ello participantes adicionales, límites o excepciones no definidos por el negocio.
- **BR-PAX-004 — Listas y datos necesarios.** No se piden por defecto los nombres de todos. La lista nominal solo se solicita por necesidad operacional, legal, del proveedor, alojamiento o actividad concreta; se vincula al servicio/noche y se limita a destinatarios autorizados. Las categorías y datos especiales se configuran según BR-PAX-007, sin imponer una lista universal.
- **BR-PAX-005 — Cambios y capacidad.** Un cambio de cantidad conserva antes, después y motivo; se revisa su efecto material sobre precio, coste, capacidad y confirmación afectados. Una disponibilidad para una cantidad no prueba disponibilidad para otra. Si la capacidad necesaria no está verificada o es insuficiente, o se desconoce una restricción material del proveedor, se bloquea el compromiso afectado, no todos los servicios.
- **BR-PAX-006 — Totales con significado.** Un total debe poder explicarse por su detalle y alcance: grupo, servicio o noches. Sumar asistencias a varios servicios no demuestra un número de personas distintas. Las unidades, categorías y reglas de agregación deben estar definidas antes de usar un total para precio o capacidad; el resumen nunca reemplaza el detalle.

- **BR-PAX-007 — Información especial por servicio.** Cada servicio configura los datos adicionales realmente necesarios: edad, peso, talla, alergias, celiaquía, discapacidad, condición física, permiso de conducir u otras restricciones. Se solicita únicamente lo necesario para prestar el servicio, con minimización y permisos de privacidad; una clasificación comercial no autoriza recopilar esos datos indiscriminadamente.
- **BR-PAX-008 — Cifra final.** El límite estándar para concretar participantes es 7 días antes, configurable por servicio, proveedor o reserva. Al llegar genera alerta, revisión de cantidades, recálculo cuando corresponda y comunicación de cifras a proveedores bajo las autorizaciones aplicables. No convierte automáticamente una estimación en cifra confirmada. Los cambios posteriores siguen las reglas aceptadas de modificación/cancelación.

## 10. Alojamiento por noche

Fuentes: C P05, P09 y P20; Producto §9–10; O §10, §13 y §33–34; D010 y D012.

- **BR-NIGHT-001 — Ocupación nocturna.** Se conserva una ocupación propia para cada noche, incluyendo su carácter estimado o confirmado. No se aplica una cifra única a toda la estancia cuando existen diferencias entre noches.
- **BR-NIGHT-002 — Entradas y salidas distintas.** El detalle debe permitir reflejar personas que entran o salen en fechas diferentes y ocupación variable. Una modificación de una noche no sobrescribe las demás ni confirma automáticamente ampliaciones de estancia.
- **BR-NIGHT-003 — Cálculo y capacidad.** Los importes y resúmenes de alojamiento deben reconstruirse desde el detalle nocturno y las reglas de precio aplicables. Una capacidad o disponibilidad comunicada para determinadas noches no se extiende a otras. No se calcula automáticamente personas por noches como importe sin conocer la unidad real de cobro.
- **BR-NIGHT-004 — Servicios vinculados y distribución opcional.** Restauración, transporte y otros servicios vinculados mantienen participantes, alcance y confirmación propios, sin heredar cantidades ni inclusión. Pueden registrarse opcionalmente habitaciones, tipo, camas, capacidad, distribución, cuna, cama supletoria, régimen y restricciones. La distribución de habitaciones/personas NUNCA es requisito global para avanzar o confirmar: en una casa completa puede bastar «18 personas — casa completa», respetando la capacidad y condiciones reales.

- **BR-NIGHT-005 — Fianzas.** Cada alojamiento/servicio configura sin fianza, fianza fija o configurable, importe y condiciones, sin hardcodear un rango actual. Se registran exigencia, entrega cuando proceda, devolución o retención parcial/total y motivo, con trazabilidad. Una fianza no equivale al anticipo comercial; su resolución pendiente impide el cierre económico cuando aplica.

## 11. Proveedores

Fuentes: C P01, P05–P08 y P20; Producto §8–11 y §13; O §28–29, §36–37 y §48; D012–D013.

- **BR-SUP-001 — Contexto de proveedor.** Se relacionan proveedor, servicio ofrecido, contacto, condiciones, solicitudes, respuestas, costes y documentos con su procedencia y fecha pertinente. Trabajar con un proveedor no hace universales sus condiciones ni confirma automáticamente todos los servicios que ofrece.
- **BR-SUP-002 — Significado de respuestas y opciones.** Solicitado acredita petición; comunicado, respuesta recibida; disponible, capacidad ofrecida en su alcance; confirmado, aceptación operativa inequívoca. Opcionado/bloqueado es un compromiso temporal separado conforme a BR-AVAIL-006, nunca confirmación final. Cancelado exige evidencia del alcance cancelado, no solo la petición.
- **BR-SUP-003 — Confirmación válida.** Son válidos WhatsApp claro, email, plataforma/sistema del proveedor y llamada inequívoca registrada manualmente por usuario autorizado; no se exige confirmación escrita posterior a esa llamada. Se conserva, cuando aplique, servicio, fecha, hora, cantidad, condiciones, persona/proveedor y evidencia, además del usuario y momento del registro. «Reservado para 12 personas el sábado a las 17:00» acredita ese alcance si la fecha concreta es identificable; «probablemente sí» no confirma nada.
- **BR-SUP-004 — Cambios y cancelaciones.** Las nuevas condiciones, cambios, cancelaciones y costes se registran sin borrar la información anterior. Una petición enviada al proveedor no acredita su aceptación; la situación comercial del cliente y la respuesta operativa del proveedor se siguen por separado.

## 12. Disponibilidad

Fuentes: C P01, P05–P06 y P08–P09; Producto §10, §16 y §19; O §22, §27–29, §35 y §48; D011–D012.

- **BR-AVAIL-001 — Fuente y momento.** Toda disponibilidad utilizada para comprometer un servicio identifica fuente, fecha/hora de consulta o comunicación y alcance material: servicio, fechas y cantidad pertinente. Sin procedencia verificable no se declara disponibilidad confirmada.
- **BR-AVAIL-002 — Grado de certeza.** Una disponibilidad estimada requiere regla aprobada y etiqueta de estimación. La comunicada conserva lo manifestado por la fuente; la confirmada requiere evidencia referida al alcance requerido. Ninguna implica ejecución ni reserva firme si la evidencia solo trata de capacidad disponible.
- **BR-AVAIL-003 — Vigencia y caducidad.** Se respeta el vencimiento explícito de la fuente y la fecha más restrictiva para la propuesta (BR-PROP-004). Una evidencia vencida o incierta exige revalidación antes de otro compromiso material. Los bloqueos sin vencimiento explícito generan tarea de revalidación; no se les inventa caducidad ni se presume duración indefinida.
- **BR-AVAIL-004 — Autoridad externa.** Una copia en Supabase mantiene trazabilidad, pero no convierte al CRM en autoridad sobre la disponibilidad que controla un proveedor. La reserva ganada, un mensaje enviado o una consulta anterior no garantizan capacidad actual.
- **BR-AVAIL-005 — Precedencia y discrepancias.** Para disponibilidad, precio y condiciones externas prevalece la información más reciente verificada del proveedor. Supabase conserva el expediente y todo el historial: se registra dato anterior/nuevo, fuente, fecha, discrepancia y resolución, sin sobrescribir silenciosamente. Si afecta a venta/reserva se alerta y marca el servicio pendiente de revalidación cuando corresponda. Una nueva tarifa o condición externa no modifica automáticamente lo ya aceptado por el cliente.

- **BR-AVAIL-006 — Bloqueos temporales.** Una opción/bloqueo conserva proveedor, servicio, fechas, unidades/capacidad, creación, vencimiento explícito, condiciones, evidencia y situación. Se avisa antes de caducar; sin vencimiento explícito se crea tarea de revalidación. Si no sigue adelante se registra liberación/cancelación del bloqueo. El aviso y el mero transcurso del tiempo no acreditan que el proveedor haya ejecutado una liberación.

## 13. Estado comercial vs estado operativo

Fuentes: C P08; Producto §6–10; O §27 y §43–47; D012.

- **BR-DIM-001 — Estados comerciales base V1.** Los estados de oportunidad aprobados son Nueva; En contacto; Necesidad definida; Propuesta en preparación; Propuesta enviada; Negociación / cambios; Aceptada / Ganada; Perdida; En pausa. Se conserva motivo obligatorio al perder (BR-LEAD-005). Son estados base sin desarrollar aquí sus transiciones: ganar acredita aceptación comercial, no pago o preparación.
- **BR-DIM-002 — Estados operativos base de reserva.** Pendiente de preparación; En confirmación con proveedores; Parcialmente confirmada; Confirmada operativamente; En curso; Finalizada; Incidencia; Cancelada. Confirmada operativamente requiere todos los servicios críticos necesarios confirmados y las condiciones económicas aplicables cumplidas. Finalizada expresa realización operativa; no acredita por sí sola cierre económico o histórico.
- **BR-DIM-003 — Efectos cruzados explícitos.** Ningún cambio comercial altera automáticamente lo operativo, ni viceversa, salvo regla explícita, aprobada, probada y auditable. Pueden coexistir venta ganada y servicios pendientes. La futura documentación de estados debe mantener esa independencia y las evidencias de cada dimensión.

- **BR-DIM-004 — Estados base de servicio.** Pendiente; Disponibilidad consultada; Opcionado / bloqueado; Confirmado; Modificado; Ejecutado; Incidencia; Cancelado. Además admite la señal Pendiente de revalidación ante cambios relevantes de fecha, personas, precio, disponibilidad o condiciones. La señal conserva el último hecho confirmado y abre revisión, no confirma el cambio ni sustituye las dimensiones comercial/económica.
- **BR-DIM-005 — Conceptos de compromiso.** Venta ganada/propuesta aceptada significa aceptación del cliente; reserva en confirmación significa que se están cerrando proveedores/servicios; confirmación operativa exige las condiciones de BR-DIM-002. Nunca se promete al cliente como confirmado algo aún pendiente. Los tres cierres independientes y Cerrada / Histórico se regulan en §28.

## 14. Pagos y cobros

Fuentes: C P05–P07, P15 y P20; Producto §11; D009; O §20, §37, §40–42 y §51; D011 y D013–D014.

- **BR-PAY-001 — Previsión y movimiento real.** Un importe previsto, solicitud de cobro o promesa de pago no constituye dinero recibido. Cada hecho económico se vincula con su reserva y conserva importe, fecha, método, referencia y procedencia en la medida necesaria para identificarlo; lo que falta se declara pendiente antes de utilizarlo como cobro verificado.
- **BR-PAY-002 — Política actual de cobro.** Por defecto: 50 % al confirmar y 50 % restante 7 días antes. Si se reserva a menos de 7 días, se exige 100 % antes de confirmar, salvo excepción autorizada. Se distingue aceptar comercialmente y confirmar según BR-CONV-004/BR-DIM-002. La política es configurable por servicio, proveedor, tipo y caso; cada excepción conserva quién, cuándo y motivo. Se identifica la fecha de referencia y política aplicada sin inventar excepciones para reservas con varias fechas. Un pago parcial no hace toda la reserva pagada ni confirma proveedores.
- **BR-PAY-003 — Detección y conciliación.** El método actual es transferencia bancaria. El CRM puede relacionar referencia, importe, cliente y fecha y proponer conciliación si la correspondencia es evidente; si hay duda requiere validación humana. Un aviso, justificante o respuesta del medio de pago se contrasta con la fuente autorizada antes de resolver una discrepancia. Detectar o recibir no equivale a conciliar. Se detectan parciales, duplicados, importes incorrectos y coincidencias dudosas; no se cuenta dos veces un mismo movimiento. Correcciones conservan original y ajuste.
- **BR-PAY-004 — Devoluciones.** Se distinguen solicitada, autorizada y efectivamente realizada, relacionadas con cobro y parte afectada. Se determina el derecho/importe mediante BR-CHANGE-005–007 y las condiciones aceptadas; se devuelve normalmente por el mismo medio de pago. Registrar una cancelación no acredita devolución ejecutada. La IA requiere aprobación humana para cobros y reembolsos definitivos.
- **BR-PAY-005 — Pagos a proveedores y fondos ajenos.** Previsión, importe confirmado, factura y pago real al proveedor son hechos distintos. Para servicios externos se sigue el modelo operativo de fondos del cliente/suplidos de §27, separando pago con esos fondos de coste propio de Huescaventura. Se conservan importe, fecha, método, evidencia, asignación y relación con servicio/reserva; un documento no demuestra pago ni cierre documental.

- **BR-PAY-006 — Estados base de pago.** Esperado; Detectado; Pendiente de conciliar; Conciliado; Incidencia; Devuelto. Pago solicitado, esperado, recibido y conciliado siguen siendo hechos distinguibles; una detección automática no alcanza por sí sola Conciliado. No se define aquí la máquina de transiciones.
- **BR-PAY-007 — Métodos futuros.** Se prevén enlaces de tarjeta, otros métodos y Bizum si se incorpora. El proveedor definitivo de tarjeta permanece pendiente (BR-PENDING-034); prepararlos conceptualmente no configura cobros ni aprueba la ejecución autónoma de pagos.

## 15. Costes y rentabilidad

Fuentes: C P05–P07, P11 y P20; Producto §11 y §19; O §5, §14–18 y §35–39; D010 y D013.

- **BR-ECON-001 — Componentes y mecanismos.** Se conservan cantidades, precios unitarios, reglas, descuentos, comisiones, estimación inicial, importe/coste confirmado y coste real final, diferenciando fondos ajenos de costes propios. Se admiten comisión fija, por persona, por reserva o variable y costes estimados/confirmados; la condición aplicada se configura por servicio. En hoteles puede estimarse inicialmente, pero antes de enviar una propuesta definitiva se confirma el coste final relevante si afecta al precio ofrecido. Ausencia no equivale a cero.
- **BR-ECON-002 — Reconstrucción.** Todo importe, margen o beneficio presentado debe poder reconstruirse con componentes y reglas aplicadas. Se conserva la versión de reglas y precios cuando corresponda; un total agregado no puede ser la única evidencia ni reemplazar el detalle por servicio/noche requerido.
- **BR-ECON-003 — Recálculos materiales.** Un recálculo que altere importes o rentabilidad conserva valores anteriores y nuevos, actor, fecha, motivo, datos y reglas utilizados. Una tarifa actualizada o descuento posterior no reescribe lo aceptado comercialmente; si cambia el compromiso se aplica el proceso de modificación.
- **BR-ECON-004 — Rentabilidad y límites.** La base operativa principal es honorarios propios menos costes propios atribuibles, conforme al modelo indicado por el propietario y su gestor; el total cobrado que incluya fondos de clientes no se trata automáticamente como ingreso propio ni los suplidos como coste propio. Se conserva la comparación previsto/confirmado/real. No se presenta rentabilidad definitiva basada en costes desconocidos, precios no verificados o fórmulas no aprobadas; un resultado previsto identifica sus límites, datos y regla de estimación autorizada. Validación fiscal y asignaciones no determinadas siguen pendientes en BR-PENDING-021 y BR-PENDING-023.
- **BR-ECON-005 — Acceso exclusivo.** Costes, márgenes, beneficios, comisiones y desgloses internos solo son accesibles a administradores autorizados. Esa restricción comprende cálculos, componentes, historial, documentos, exportaciones, comunicaciones y contexto de IA. Trabajar una reserva o ser proveedor no concede acceso a su expediente económico interno; cualquier dato comunicado debe respetar ese límite y los permisos aprobados.

- **BR-ECON-006 — Tarifa maestra y vigencia.** La tabla actual de Huescaventura es la fuente maestra inicial; no está aportada completa en el repositorio y no se rellena inventando importes. Servicio/proveedor admite tarifas con versión, inicio, fin, fuente, variantes, tramos e histórico. Cambiar una tarifa no altera propuestas aceptadas ni reservas anteriores; un precio incierto u obsoleto queda pendiente de verificación. Los valores concretos aprobados aquí se identifican en §26.
- **BR-ECON-007 — EUR, impuestos y precisión.** Moneda base EUR; los precios comerciales al cliente son normalmente IVA incluido. Cada tarifa/coste debe indicar expresamente IVA incluido o excluido, sin deducir el tratamiento del proveedor; cuando sea necesario se distingue base, impuestos y total. Importes visibles/cobrados se redondean a 2 decimales y puede conservarse mayor precisión interna. Esto no autoriza redondear comercialmente el pack de forma automática: ese precio se decide según BR-PACK-004. No se inventan tipos fiscales y cambios posteriores no alteran lo aceptado históricamente.

## 16. Cambios, modificaciones y cancelaciones

Fuentes: C P05–P08 y P15; Producto §7–11 y §15; D009; O §26, §40–41, §67 y §73; D011–D012.

- **BR-CHANGE-001 — Petición y facultad.** El responsable principal puede solicitar modificaciones y comunicar cambios; también se registran peticiones de proveedor y usuarios autorizados. Toda petición conserva origen, actor y parte afectada, pero solicitar no ejecuta ni confirma el cambio. En V1 el Administrador/Propietario aprueba la aplicación con evidencia y permisos; ni un mensaje ni un rol futuro confieren acceso económico interno.
- **BR-CHANGE-002 — Alcance e impactos.** Antes de aplicar un cambio se distingue qué afecta al acuerdo comercial, a servicios/participantes/noches, a confirmaciones y a importes. Se conserva la situación anterior y se identifican las dependencias aún por confirmar. No se interpreta una solicitud del cliente como aceptación del proveedor ni al contrario.
- **BR-CHANGE-003 — Aprobación y comunicación.** La aprobación se refiere a un alcance concreto y sus consecuencias conocidas. Las modificaciones sensibles preparadas por IA requieren aprobación humana explícita inicial; un cambio material de la propuesta invalida esa aprobación para el nuevo alcance. Las comunicaciones y respuestas necesarias se conservan sin equiparar envío, recepción y aceptación.
- **BR-CHANGE-004 — Cancelación parcial o total.** Se identifica reserva, servicios, participantes, fechas o sustituciones afectadas, conservando las partes no canceladas. Una solicitud total no demuestra cancelación confirmada por cada proveedor. Se aplica la política/versiones aceptadas y se mantienen cobros, costes, antecedentes e impactos separados; los criterios concretos vigentes son BR-CHANGE-005–007.

- **BR-CHANGE-005 — Causa atribuible a Huescaventura/proveedor.** Meteorología, falta de disponibilidad, problemas operativos u otra causa atribuible a Huescaventura/proveedor exige devolver al cliente el importe correspondiente a la parte cancelada: 100 % del servicio afectado, parcial o total respecto a la reserva. Una condición no reembolsable no permite negar esta devolución.
- **BR-CHANGE-006 — Cancelación voluntaria del cliente.** Se aplica la política aceptada: con antelación ≥ 7 días, devolución del importe correspondiente; con ≥ 3 días y < 7 días, retención del 50 % de las personas/servicios cancelados; con < 3 días, retención/cobro del 100 % de la parte cancelada. Exactamente 7 días pertenece al primer intervalo y exactamente 3 al segundo. Una tarifa no reembolsable comunicada y aceptada expresamente puede prevalecer solo en cancelación voluntaria del cliente. No se aplica el porcentaje a servicios no cancelados ni se inventa cómo repartir un precio fijo o promoción (BR-PENDING-023).
- **BR-CHANGE-007 — Supuestos específicos y evidencia.** No-show, retraso del cliente que impida realizar el servicio, imposibilidad por alcohol/drogas o exclusión por incumplir normas de seguridad no generan devolución de la parte afectada. Las modificaciones están sujetas a disponibilidad y posibles ajustes de precio, no a un recargo inventado. Se conserva cancelante, motivo, alcance, importe pagado/devuelto/retenido y pendiente de cobro cuando proceda, política/versionado, solicitante/aprobador, evidencia, comunicaciones y antes/después. La base temporal exacta para ejecutar límites sin ambigüedad se concreta en BR-PENDING-036.

## 17. Tareas, vencimientos y alertas

Fuentes: C P05–P06 y P14; Producto §12 y §14; O §21, §23, §29, §50 y §60–62; D014 y D016.

- **BR-TASK-001 — Contexto y responsabilidad.** Toda tarea, manual o automática, se vincula a su contexto de cliente, oportunidad, reserva, servicio o proveedor y conserva motivo, deadline, prioridad, responsable, expediente vinculado y estado; el cierre añade resultado o razón. Una fecha se deriva de la política o vencimiento conocido/configurado; si se desconoce, se identifica la necesidad de revalidar y concretar el deadline, sin presentarlo como confirmado. En V1 todas se asignan al Administrador/Propietario.
- **BR-TASK-002 — Alerta explicable.** Cada alerta permite conocer por qué existe, qué expediente afecta y qué requiere acción. Fechas y vencimientos se derivan de hechos o reglas conocidos; no se inventan plazos de pago o confirmación. Un recordatorio sobre información pendiente indica esa condición.
- **BR-TASK-003 — Cierre y efectos.** Cerrar una tarea deja constancia de su resultado; si se cancela o deja sin efecto, se registra el motivo. Cerrar una tarea de seguimiento no prueba aceptación, pago, confirmación o ejecución del servicio. Estos hechos necesitan su propia evidencia.
- **BR-TASK-004 — Automatización y cambios.** Las tareas/alertas identifican origen y versión y evitan duplicados del mismo efecto. Un cambio material hace visibles las tareas afectadas y su revisión sin borrar contexto. Se crean por los disparadores aprobados de BR-TASK-005, con las fechas conocidas y políticas aplicables, sin inventar obligaciones adicionales.

- **BR-TASK-005 — Disparadores iniciales.** Crear tareas cuando corresponda por vencimiento de bloqueo de alojamiento, anticipo pendiente, saldo pendiente a 7 días, proveedor pendiente de confirmar, factura de proveedor pendiente, suplido pendiente de pago, documentación pendiente, lista de participantes necesaria pendiente, revalidación de disponibilidad, modificación pendiente, cancelación pendiente, seguimiento de propuesta y confirmación final de participantes. Cada una justifica su causa y alcance, y se actualiza sin duplicarse.
- **BR-TASK-006 — Notificaciones V1.** Niveles Crítica, Importante e Informativa. El CRM recibe todas; WhatsApp solo Críticas e Importantes; email no recibe notificaciones. Todas se dirigen al Administrador/Propietario. Esta regla se refiere a avisos internos y no habilita enviar mensajes comerciales a clientes sin la aprobación requerida.
- **BR-TASK-007 — Calendario operacional.** El calendario propio derivado de datos/Supabase es la fuente de verdad operacional del CRM. Puede incluir servicios, reservas, bloqueos, pagos, tareas, documentación y vencimientos. Google Calendar es auxiliar y puede sincronizarse bidireccionalmente; los cambios críticos externos requieren validación o regla explícita, nunca modifican silenciosamente la reserva.

## 18. Comunicaciones

Fuentes: C P05–P07, P10 y P15; Producto §13–15; D009; O §23–25 y §53–57; D011 y D014–D016.

- **BR-COMM-001 — Registro completo y contextual.** Cuando sea técnicamente posible y dentro de la finalidad/privacidad autorizadas, se conservan conversaciones WhatsApp completas, emails, llamadas mediante su registro, transcripciones, resúmenes, adjuntos y notas manuales. Se relacionan con contacto, organización, oportunidad, reserva, servicio, proveedor y timeline, con fuente, canal, fecha, actor y destinatarios. Un resumen no sustituye el original conservado.
- **BR-COMM-002 — Preparación y entrega.** Borrador identifica contenido en elaboración; preparada indica una propuesta lista para revisar; aprobada significa autorización sobre su contenido concreto. Enviada y recibida requieren evidencia de esos hechos. Aprobar no acredita envío; envío no acredita recepción, lectura ni aceptación. Son distinciones conceptuales, no una lista final de estados.
- **BR-COMM-003 — Naturaleza y aprobación.** Informativa y sensible/vinculante califican el contenido, al margen del canal. Durante la primera fase la IA requiere aprobación humana para comunicaciones sensibles/vinculantes; las plantillas no la eliminan. Las informativas con plantilla solo se automatizan si una Spec lo autoriza. En particular, el seguimiento de propuestas V1 prepara mensajes pero no los envía al cliente sin supervisión; los avisos internos siguen BR-TASK-006.
- **BR-COMM-004 — Respuestas y límites.** Se conserva el alcance exacto de cada respuesta; una expresión ambigua no confirma venta, disponibilidad ni operación. Mensajes y resúmenes no sustituyen al expediente. Los originales se conservan conforme a privacidad: la política V1 de no audio por defecto no elimina la necesidad de revisar consentimiento, retención y tratamiento de transcripciones.

- **BR-COMM-005 — Llamadas y PLAUD.** En V1 no se almacena audio por defecto: bastan transcripción y resumen. PLAUD Pro es una fuente válida para llamadas atendidas personalmente; se permite importar/adjuntar transcripción original, resumen y metadata con procedencia PLAUD, fecha y vínculos a contacto, oportunidad/reserva. El resumen nunca reemplaza la transcripción. Se prevé automatizar la importación si es viable; si no, debe ser manual y sencilla, sin configurar esa integración ahora.
- **BR-COMM-006 — Email comercial.** La dirección principal futura es info@huescaventura.com. Otras pueden mantenerse como históricas, secundarias o de transición. No se decide ni ejecuta ahora toda la migración. Que email no reciba notificaciones internas V1 no impide su uso como canal comercial.

## 19. IA y automatizaciones

Fuentes: C P05, P10–P12 y P14–P15; Producto §13–14; D009; O §19 y §62–65; D016.

- **BR-AI-001 — Asistencia automática identificable.** En V1 la IA puede transcribir, resumir, clasificar, buscar en información autorizada, extraer datos, proponer, redactar, crear tareas/alertas, preparar borradores, recomendar respuestas, packs y upsells, detectar incoherencias y datos faltantes. Esto no confirma acuerdos ni ejecuta actos sensibles. Los resultados son revisables y conservan fuente y procedencia automática.
- **BR-AI-002 — Aprobación sensible inicial.** La IA necesita aprobación humana explícita antes de enviar propuesta definitiva o mensajes que comprometan condiciones; crear/confirmar/cancelar/modificar reservas; aceptar condiciones del proveedor; efectuar pagos/reembolsos definitivos; cambiar precios finales; revelar datos personales, modificar permisos o realizar acciones fiscales/jurídicas sensibles. Una evidencia ambigua queda pendiente y no se marca como confirmación. Incluso si es inequívoca, P15 sigue exigiendo aprobación para ejecutar la acción sensible; no es autorización fiscal para emitir facturas.
- **BR-AI-003 — Alcance de la autorización.** Una aprobación no autoriza otras acciones ni una propuesta materialmente cambiada; esta requiere nueva aprobación. La excepción de mensajes informativos con plantillas aprobadas solo opera en los límites de una Spec aprobada. Ampliar autonomía requiere la Spec y los controles exigidos por P15; no se decide en este borrador.
- **BR-AUTO-001 — Fallos visibles.** Cada automatización identifica responsable, disparador, versión, permisos, entradas, efectos, registros afectados y fechas. Cada ejecución registra identificador, acción intentada, fechas, resultado, error y número de intentos, sin exponer secretos ni datos a destinatarios no autorizados. No falla silenciosamente ni presenta un resultado incierto como éxito; si persiste el fallo genera alerta Importante o Crítica dirigida al administrador.
- **BR-AUTO-002 — Reintentos y recuperación.** Se permiten reintentos automáticos limitados cuando sean seguros, conservando trazabilidad y prevención de duplicados. Las acciones sensibles no se repiten automáticamente si hay riesgo de duplicidad; se verifica y concilia el efecto previo antes de reintentar. Se exige prevención de duplicados/idempotencia cuando corresponda, también al recibir otra vez el mismo hecho. Debe ser posible detener, revisar y recuperar o compensar efectos de forma controlada y autorizada. Siempre existe reintento manual autorizado, sin eludir verificación ni aprobación. Límites y pausas concretos se configuran y se especificarán después; no se fija un número universal ni se implementa ahora.

- **BR-AI-004 — Extracción objetiva.** La IA puede rellenar automáticamente datos objetivos cuando la información sea clara, conservando fuente, fecha, origen automático y confianza cuando sea útil. Ese registro no equivale a confirmación comercial/operativa ni a dato definitivo; la ambigüedad se marca pendiente de revisión, sin inventar.
- **BR-AI-005 — Dato confirmado protegido.** La IA no sobrescribe un dato confirmado manualmente. Si constan 18 personas confirmadas y llega «Creo que al final seremos 16», conserva 18, registra el posible cambio/discrepancia y crea tarea; el administrador valida y se conserva el historial.
- **BR-AI-006 — Recomendaciones comerciales.** El CRM puede recomendar servicios/packs/upsells según tipo de cliente, servicios contratados, ubicación, fecha, participantes, compatibilidad, margen, prioridad comercial y reglas configurables. En V1 recomienda y el administrador decide incorporarlos. Elegibilidad objetiva se verifica separadamente; ni la recomendación ni sus mensajes revelan margen o costes a quien no tenga permiso.

## 20. Documentos y evidencias

Fuentes: C P05–P07 y P10; Producto §15; O §24–25, §38, §42, §66 y §73; D011, D013 y D017.

- **BR-DOC-001 — Contexto del archivo.** Cada documento o evidencia conserva procedencia, fecha, tipo/finalidad, expediente relacionado y permisos. Propuestas, confirmaciones, contratos, justificantes y documentos de proveedores solo se usan para la finalidad y alcance que acreditan.
- **BR-DOC-002 — Versiones e integridad histórica.** Sustituir o corregir un documento importante deja referencia a su versión anterior y motivo, sujeto a conservación autorizada. No se reemplaza silenciosamente el documento que sustentó una aceptación, confirmación, cobro o decisión.
- **BR-DOC-003 — Evidencia y validez.** Adjuntar un archivo no convierte sus datos en confirmados ni resuelve por sí solo un pago discrepante. La evidencia de aceptación/confirmación sigue BR-PROP-005 y BR-SUP-003; la factura del proveedor y su conciliación siguen §27. Las verificaciones y el documento original se conservan sin conferir aquí validez fiscal definitiva.

- **BR-DOC-004 — Necesidades por servicio.** Cada servicio/proveedor configura documentación necesaria: DNI, lista nominal, permiso, declaración, bono, factura, condiciones u otra. Estados base: Pendiente, Recibido, Revisado, No aplica e Incidencia. No hay lista global obligatoria; solo documentación realmente imprescindible justifica bloqueo o alerta operacional fuerte.
- **BR-DOC-005 — Términos aceptados inmutables.** Se conserva la versión exacta e inmutable aceptada, vinculada a propuesta/versión, términos/versión, fecha/hora, canal y evidencia. Cubre cuando aplique servicios, precios, pagos, cancelaciones, no reembolsable, mandato/autorización de suplidos, proveedor y condiciones específicas. Modificar términos futuros no altera reservas anteriores; no se registra como aceptado un mandato que todavía no se haya incorporado ni aceptado.

## 21. Timeline e historial

Fuentes: C P06–P07, P10, P14 y P20; Producto §11 y §15; O §26, §48, §65 y §67–73; D012 y D016–D017.

- **BR-HIST-001 — Reconstrucción de hechos.** Todo hecho comercial, operativo, económico o de comunicación material debe permitir reconstruir qué ocurrió, cuándo, quién actuó, qué cambió, valor anterior y nuevo cuando exista cambio, motivo y origen humano o automático. En una creación se identifica que no existía valor previo; una ausencia de evidencia se declara, no se inventa.
- **BR-HIST-002 — Vínculos y momento.** El historial mantiene relaciones entre oportunidad, propuesta/versiones, aceptación, reserva, servicios, comunicaciones, tareas, documentos y movimientos pertinentes. Si un hecho se registra después de ocurrir, se distinguen el momento conocido del hecho y su registro para no aparentar una secuencia falsa.
- **BR-HIST-003 — Correcciones sin destrucción.** Las correcciones, recálculos, cancelaciones y compensaciones añaden trazabilidad que permite reconstruir el hecho original y la rectificación. Editar la vista actual no autoriza borrar antecedentes que influyeron en una decisión, servicio, pago o comunicación.
- **BR-HIST-004 — Historial protegido.** Un timeline unificado no es un permiso universal de lectura: respeta las restricciones económicas y personales de cada hecho. La anonimización o eliminación necesaria sigue una política autorizada y auditada; la conservación histórica no permite retención personal indefinida.

- **BR-HIST-005 — Cambios manuales.** Todo cambio relevante registra campo o concepto, valor anterior/nuevo, usuario y fecha/hora, además del motivo/procedencia necesario para reconstruir por qué ocurrió conforme a P06–P07. En cancelación, devolución, retención de fianza o excepción económica el motivo debe quedar explícito. Permitir un comentario opcional en otras ediciones no elimina la trazabilidad del motivo de un cambio material exigida por la Constitución.

## 22. Seguridad, permisos y privacidad

Fuentes: C P10–P12; Producto §3, §11 y §16; D007; O §8–11, §59 y §68–70; D015 y D017.

- **BR-SEC-001 — Roles y V1.** Se preparan Administrador / Propietario, Comercial, Operaciones, Administración y Colaborador interno limitado. En V1 solo hay un usuario operativo real: Administrador / Propietario, con acceso y gestión de todo el CRM. No se activa una matriz granular innecesaria, pero se conserva mínimo privilegio, denegación por defecto y separación de funciones para terceros/roles futuros. Administración no se equipara automáticamente a Administrador. Los permisos finos futuros siguen pendientes; el administrador tampoco puede eludir P16.
- **BR-SEC-002 — Economía reservada en todo soporte.** La condición de administrador autorizado es necesaria para acceder a costes, márgenes, beneficios, comisiones y desgloses internos. Un informe, adjunto, búsqueda, resumen, exportación o automatización no puede eludirla. El detalle de permisos pendiente no puede rebajar esta prohibición constitucional.
- **BR-SEC-003 — Datos personales y terceros.** Se recopilan y comparten datos necesarios para el servicio y finalidad autorizados, según BR-CON-001 y BR-PAX-004/007. Clientes, proveedores, interlocutores o colaboradores no reciben por su relación acceso al expediente completo. Se preparan políticas configurables de conservación por tipo de información, sin inventar plazos legales ni activar borrados importantes sin regla aprobada.
- **BR-SEC-004 — IA, exportaciones y secretos.** La IA y las integraciones reciben únicamente información permitida para su función y destinatarios. Exportar o copiar no amplía derechos de acceso. Credenciales y secretos no forman parte de expedientes compartidos, documentos, historial visible ni Git; su tratamiento sigue P12. Estas reglas no diseñan mecanismos técnicos ni políticas de base de datos.

- **BR-SEC-005 — Archivado y eliminación.** Se prioriza archivar: el registro sale de las vistas normales, permanece recuperable y conserva historial. Registros con pagos, aceptación, actividad económica, documentación, incidencias o trazabilidad no se eliminan físicamente mediante el flujo normal. Eliminación/anonimización real se reserva a privacidad, cumplimiento legal o administración avanzada, con autorización y auditoría; tampoco una fusión destruye historia. Plazos y política detallada permanecen pendientes de revisión RGPD/legal.

## 23. Facturación

Fuentes: C P16; Producto §11 y §18; D008; O §17 y §37–39; D013.

- **BR-BILL-001 — Prohibición fiscal vigente.** El CRM no emite facturas legales ni asigna numeración fiscal hasta que la arquitectura de facturación haya sido validada conforme a la normativa española aplicable por profesionales competentes y aprobada por el responsable del proyecto, con evidencia y alcance documentados según P16.
- **BR-BILL-002 — Borradores no fiscales.** Un borrador permitido se identifica inequívocamente como no fiscal y sin validez como factura. Un presupuesto, justificante de cobro o archivo adjunto no se transforma en factura legal por su presencia en el CRM.
- **BR-BILL-003 — Separación de capacidades.** El registro de cobros y datos económicos no autoriza construir un motor fiscal propio en V1. Integrar un proveedor de facturación tampoco levanta por sí solo la prohibición; alcance, responsabilidad y validación fiscal siguen pendientes.

- **BR-BILL-004 — Mandato futuro imprescindible.** Las condiciones de huescaventura.com deberán incorporar autorización/mandato expreso para que Huescaventura gestione, administre y pague en nombre del cliente los servicios de terceros facturados directamente al cliente. Se conserva la versión efectivamente aceptada y se vincula al expediente. Es requisito futuro de las condiciones legales, no texto jurídico validado ni mandato ya existente: la actualización efectiva de la web no se realiza aquí y queda en BR-PENDING-033.
- **BR-BILL-005 — Validación pendiente.** El modelo de suplidos/fondos ajenos y honorarios de §27 recoge el funcionamiento indicado por el propietario y su gestor, no una conclusión fiscal adicional. La validación definitiva de suplidos, arquitectura fiscal y tratamiento Tararí/Huescaventura bajo el mismo titular/NIF permanecen PENDIENTES DE VALIDACIÓN PROFESIONAL. Ninguno de esos hechos habilita facturación legal del CRM.

## 24. Integraciones externas

Fuentes: C P01, P05–P06, P10–P11 y P14–P17; Producto §13–19; D004 y D007–D009; O §49–58; D014.

- **BR-INT-001 — Orden de integración.** Orden previsto aprobado: 1) Telefonía IA + WhatsApp, 2) Email, 3) Calendario, 4) Pagos, 5) Web pública, 6) Avaibook. PLAUD es fuente de comunicaciones/transcripciones, no necesariamente conector prioritario separado. La prioridad no acredita capacidad real de una API ni configura nada.
- **BR-INT-002 — Responsabilidad y conciliación.** Todo dato recibido conserva fuente, alcance y momento. Supabase es la referencia del expediente e historial; en disponibilidad, precio y condiciones externas prevalece el dato más reciente verificado del proveedor según BR-AVAIL-005. No sobrescribe lo aceptado ni altera automáticamente reservas; discrepancias de pagos se gestionan según BR-PAY-003.
- **BR-INT-003 — Sustitución sin pérdida.** Todas las integraciones, incluida la facturación condicionada a validación, se delimitan como módulos sustituibles con responsabilidades y contratos explícitos; las reglas centrales no dependen de formatos exclusivos de un proveedor. Las reglas de negocio centrales conservan su significado al cambiar o desactivar una integración. Se preservan historial, relaciones y hechos; los fallos o resultados inciertos no se presentan como confirmaciones. Las operaciones independientes pueden continuar cuando no dependan materialmente del proveedor caído.
- **BR-INT-004 — Web pública y acceso.** La web huescaventura.com y el CRM permanecen como aplicaciones/repositorios separados y solo comparten backend/API cuando corresponda con límites aprobados. Ni la web ni un canal externo reciben costes, márgenes, beneficios o información interna no autorizada. El entorno de desarrollo y despliegue se remite a la futura arquitectura, sin redefinir D002 o D005.

- **BR-INT-005 — Telefonía IA y WhatsApp.** Son la prioridad funcional número 1 y trabajan coordinados sobre cliente, contexto y timeline comunes. Permanecen desacoplados, modulares y sustituibles, sin acoplar el dominio a proveedor alguno. La elección definitiva exige antes de implementar probar ElevenLabs y al menos una alternativa real, comparando facilidad, coste, automatización, WhatsApp, llamadas, transcripción, contexto, integración CRM y fiabilidad. La comparativa y selección quedan pendientes, no se ejecutan en esta fase.
- **BR-INT-006 — Avaibook V1.** Solo lectura/consulta si la integración lo permite: disponibilidad, reservas y referencias externas. No crear, modificar ni cancelar reservas en Avaibook. Una discrepancia genera alerta y no cambia silenciosamente el expediente canónico.
- **BR-INT-007 — Capacidades pendientes.** La viabilidad real de lectura/importación/sincronización de cada proveedor debe validarse antes de su integración. No se prometen permisos, automatismos o cobros que la API no permita. Calendario se rige por BR-TASK-007; email/PLAUD por BR-COMM-005–006 y pagos por BR-PAY-007.
- **BR-INT-008 — Formularios web futuros.** Las peticiones de presupuesto/formularios de huescaventura.com entrarán directamente en CRM, sin hojas de cálculo ni reenvío manual como flujo normal. Se conserva fuente, campaña, página, contacto, tipo de grupo, fecha, participantes aproximados, intereses y mensaje según sean conocidos. Se crea lead y se aplica BR-LEAD-002 para oportunidad; no se completa información ausente por suposición ni se modifica la web ahora.

## 25. Packs, modalidades y promociones

Fuentes: C P05, P07, P09, P11 y P20; Producto §7–9 y §11; O §4, §12–16 y §19; D010–D011.

- **BR-PACK-001 — Maestros y personalizaciones.** Los packs maestros son reutilizables y versionados. Una variante personalizada para un grupo no exige crear maestro; posteriormente puede convertirse manualmente en maestro. Cambios materiales de composición, precio o condiciones generan versión y las propuestas históricas mantienen exactamente la utilizada.
- **BR-PACK-002 — Modalidades en una propuesta.** Una propuesta admite packs/modalidades diferentes para miembros del mismo grupo: por ejemplo 10 personas con pack completo y 2 sin rafting, o unas con 2 noches y otras con 1. Cada modalidad permite nombre, servicios, actividades incluidas/excluidas, noches, participantes, precio final por persona y condiciones específicas. El CRM calcula cantidades exactas por servicio y noche desde esa composición, sin asignar rafting ni noches adicionales a quien no los contrata.
- **BR-PACK-003 — Presentación comercial.** En packs se muestra normalmente precio final por persona y qué incluye. No se muestran por defecto suplidos internos, comisiones u honorarios; costes, márgenes, beneficios y desgloses internos permanecen exclusivamente para administradores autorizados conforme a P11. El expediente conserva toda la descomposición aunque el cliente vea un precio final. Los servicios de precio fijo conservan esa unidad; presentar un pack por persona no convierte todos sus componentes en tarifas por persona.
- **BR-PACK-004 — Precio manual auditable.** El CRM calcula precio base desde composición y reglas/tarifas verificadas. Comercial/administrador puede establecer un precio final comercial manual; en V1 actúa el único Administrador/Propietario, y un rol Comercial futuro no recibe por ello acceso a costes. Se conservan calculado, final utilizado, quién, cuándo y razón del cambio material. No existe redondeo comercial automático ni ajuste silencioso de suplidos/costes. La precisión monetaria de BR-ECON-007 es una cuestión distinta.
- **BR-PROMO-001 — Novio/a gratis.** Única promoción automática aprobada actualmente: para despedidas con mínimo 15 personas totales y pack completo que incluya, como mínimo, 1 alojamiento, 1 actividad, 1 restaurante y 2 copas en Tararí. En el supuesto aprobado, 15 asistentes pagan 14, 16 pagan 15 y 17 pagan 16. La gratuidad no reduce asistentes reales, cantidades por servicio ni pagos debidos a proveedores; su efecto económico queda desglosado y trazable.
- **BR-PROMO-002 — Límites de promoción.** No se aplica automáticamente a familias, niños, empresas, parejas, grupos genéricos o servicios independientes. No hay otras promociones automáticas aprobadas. Se permiten promociones futuras configurables/versionadas cuando se aprueben. En propuestas de varias modalidades no se inventa qué modalidad recibe la gratuidad ni cómo se reparte sobre precios fijos; esos casos quedan delimitados en BR-PENDING-023, sin bloquear los supuestos homogéneos expresamente aprobados.

## 26. Tararí y extras

Fuentes: C P05, P11, P16 y P20; O §17–18 y §37; D010 y D013.

- **BR-TAR-001 — Servicio interno.** Según la decisión del propietario, Tararí y Huescaventura comparten titular/NIF. Tararí se trata operativamente como servicio propio/interno, no por defecto como proveedor externo ni suplido. No se crea por defecto factura Tararí → Huescaventura. Su tratamiento fiscal exacto requiere validación profesional.
- **BR-TAR-002 — Dos copas incluidas.** Todo pack completo de despedida incluye 2 copas en Tararí. Para ese conjunto, valor comercial actual 15 € total y coste interno estándar actual 3,80 €, configurables y versionados. Se conserva la cantidad aplicada a la composición; no se interpreta 15 € como precio de cada copa ni 3,80 € como coste unitario de una bebida.
- **BR-TAR-003 — Upsells iniciales.** Extra Pack 25 copas: 25 bebidas × 7 €/bebida = 175 €. Extra Pack 50 copas: 50 bebidas × 6,50 €/bebida = 325 €. Son extras separados de las dos copas incluidas y conservan cantidad, precio/versionado, coste interno y rentabilidad. Sus costes internos no se han facilitado: no se inventan ni se extrapolan automáticamente del estándar de dos copas. El catálogo puede incorporar otros upsells configurables.

## 27. Fondos del cliente, suplidos y honorarios

Fuentes: C P05–P07, P11, P16 y P20; Producto §11; O §37–38 y §42; D008 y D013.

- **BR-SUPL-001 — Flujo operativo declarado.** El cliente entrega fondos a Huescaventura; se facilitan al proveedor los datos necesarios de facturación del cliente; el proveedor externo emite factura a nombre del cliente y la remite a Huescaventura para gestión administrativa; Huescaventura paga con fondos del cliente y registra separadamente sus honorarios de organización. Se especifica como funcionamiento comunicado por propietario/gestor, pendiente de validación fiscal definitiva, sin afirmar consecuencias fiscales adicionales.
- **BR-SUPL-002 — Separación y conciliación.** El servicio externo se registra operativamente como suplido/fondos gestionados por cuenta del cliente, no automáticamente como ingreso/coste propio. Por suplido se conservan cliente, proveedor, servicio, importe exacto, factura dirigida al cliente, estado de pago, fecha, método, fondos del cliente asignados y conciliación. Honorarios y costes propios se separan; una asignación no acredita pago. El libro interno completo permanece restringido, sin confundir la factura dirigida al cliente con un coste propio de Huescaventura.
- **BR-SUPL-003 — Situaciones documentales y de pago.** Para factura de proveedor: pendiente, recibida, revisada y vinculada. Para pago del suplido: pendiente, programado, pagado e incidencia. Se comprueba correspondencia entre importe de factura e importe del suplido/pago correspondiente; una diferencia genera revisión, nunca ajuste silencioso para cuadrar cifras.
- **BR-SUPL-004 — Cierre documental.** Un suplido solo cierra documentalmente con factura del proveedor dirigida al cliente, importe identificado, pago realizado, conciliación y vínculo con servicio/reserva. Pagado sin factura sigue documentalmente abierto y genera alerta. El expediente conserva incidencias y ajustes, aunque se haya completado la prestación del servicio.

## 28. Cierres de la reserva

Fuentes: C P06–P08 y P20; O §43–44 y §72; D012–D013.

- **BR-CLOSE-001 — Tres cierres independientes.** Comercial: relación comercial y condiciones finales resueltas. Operativo: servicios ejecutados/cancelados correctamente y sin pendientes críticos. Económico: cliente ha pagado lo debido, suplidos conciliados, facturas de proveedores recibidas, honorarios registrados, devoluciones resueltas, fianzas devueltas o retenidas con motivo y sin incidencias económicas abiertas. Se evalúa cada requisito cuando aplica al expediente, sin crear una factura de proveedor externo para Tararí.
- **BR-CLOSE-002 — Cerrada / Histórico.** La reserva solo pasa a Cerrada / Histórico al resolver los tres cierres. Puede estar finalizada operativamente y abierta económicamente por una factura pendiente. Una incidencia crítica abierta impide cierre completo salvo justificación explícita según BR-INC-002; esa justificación no acredita pagos, documentos o devoluciones pendientes. Cerrar no pierde comunicaciones, documentos, versiones, propuestas, cambios, timeline ni auditoría.

## 29. Identificadores y trazabilidad del expediente

Fuentes: C P06–P07; O §71; D017.

- **BR-ID-001 — Identificadores humanos.** Se generan identificadores automáticos, únicos, correlativos anuales, no reutilizables, buscables y visibles en documentos/comunicaciones. Formatos de referencia: OP-2026-0001, PR-2026-0001, RES-2026-0001 e INC-2026-0001; una versión de propuesta puede verse como PR-2026-0042 · v3. El identificador humano se conserva junto con los IDs técnicos de Supabase, sin definir aquí su almacenamiento físico.
- **BR-ID-002 — Continuidad.** Archivar, fusionar o anular no reutiliza identificadores ni pierde vínculos históricos. Cambiar la versión de una propuesta mantiene rastreable su identidad y la versión exacta aceptada.

## 30. Incidencias

Fuentes: C P06–P08 y P20; O §72; D012 y D017.

- **BR-INC-001 — Expediente de incidencia.** Puede vincularse a reserva, servicio, proveedor o cliente. Conserva fecha/hora, descripción, gravedad, detector, proveedor/cliente cuando aplique, acciones, compensación/reembolso, documentos, fotos, mensajes y causa final. Se distingue lo detectado o supuesto de la causa final verificada y se respetan permisos/privacidad.
- **BR-INC-002 — Gravedad y estados base.** Gravedad Leve, Importante o Crítica; estados Abierta, En gestión, Resuelta y Cerrada. Una crítica abierta impide cierre completo salvo justificación explícita del administrador, auditada con alcance, motivo y responsable. Resolver una incidencia no confirma por sí solo una devolución ni otro efecto económico.

## Decisiones pendientes

Las políticas de esta revisión han sido aprobadas expresamente por el propietario; los aspectos siguientes son únicamente su parte no resuelta. Ninguno bloquea la revisión ni la futura aprobación del documento si queda delimitado: sí impide ejecutar la acción concreta que requiera la validación o dato ausente. El estado integrado de business-rules.md sigue siendo DRAFT hasta la revisión humana final.

### Pendientes activos

| Identificador | Alcance aún abierto y parte ya aprobada | Motivo y dependencia futura |
|---|---|---|
| BR-PENDING-001 | Proveedor definitivo Telefonía IA + WhatsApp, tras comparativa final. El orden y su prioridad número 1 ya están aprobados. | Antes de implementar hay que probar ElevenLabs y al menos una alternativa real con los criterios de BR-INT-005; no elegir proveedor por suposición. |
| BR-PENDING-012 | Alcance fino de acciones de los roles futuros. V1 ya tiene un único Administrador/Propietario que lo gestiona todo. | Diferido hasta activar otros usuarios; no complica V1 ni concede facultades a roles aún inactivos. |
| BR-PENDING-013 | Detalle futuro de visibilidad/edición por campo, documento, exportación y rol. | Diferido a los permisos futuros. La restricción de costes/márgenes/beneficios a administradores ya es firme y no queda abierta. |
| BR-PENDING-014 | Plazos concretos de conservación/eliminación por tipo de dato de negocio. Políticas configurables y ausencia de borrados automáticos importantes V1 ya están aprobadas. | Revisión RGPD/legal antes de programar esos plazos. No inventar retención indefinida ni fechas. |
| BR-PENDING-015 | Política detallada y procedimiento de anonimización/privacidad con preservación de evidencias necesarias. Archivado recuperable y prohibición de borrado normal con historia ya están aprobados. | Validación RGPD/legal antes de ejecutar eliminación/anonimización real. |
| BR-PENDING-019 | Condiciones legales concretas de consentimiento y tratamiento para telefonía, transcripción y voces. | La ausencia de audio por defecto no resuelve por sí sola el tratamiento de transcripciones. Validar antes de activar el tratamiento correspondiente. |
| BR-PENDING-020 | Plazos y tratamiento de conservación/retirada de transcripciones, metadatos y eventual audio excepcional. V1 sin audio por defecto, originales y fuente PLAUD ya están definidos. | Particularización de privacidad para comunicaciones; no asumir almacenamiento ilimitado ni autorización para grabar. |
| BR-PENDING-021 | Arquitectura fiscal/legal definitiva, validación del sistema de suplidos y tratamiento exacto Tararí/Huescaventura bajo mismo titular/NIF. | PENDIENTE DE VALIDACIÓN PROFESIONAL. El modelo operativo declarado no habilita facturas legales, numeración fiscal ni una factura interna por defecto. |
| BR-PENDING-022 | Tipos/tratamientos fiscales concretos aplicables a cada tarifa/coste cuando no estén verificados. EUR, indicación IVA incluido/excluido, base/impuestos/total y 2 decimales ya están aprobados. | La parametrización fiscal y validación profesional deben preceder a cálculos dependientes; no inventar tipos ni tratamiento del proveedor. |
| BR-PENDING-023 | Reparto económico en casos no concretados: gratuidad de novio/a con modalidades/precios distintos y reparto de cancelación parcial sobre precio fijo/grupal, promociones o fondos asignados. | La promoción homogénea, la base honorarios menos costes propios y los intervalos de cancelación ya están aprobados. Falta decidir el reparto de esos casos particulares para no alterar costes ni inventar importes. |
| BR-PENDING-027 | Modalidades extraordinarias de alta directa, división o agrupación de oportunidades/reservas y aceptación parcial no descritas. | Diferido a su futura especificación. Ya se resolvieron aceptación, vigencia, packs/modalidades y conversión normal; no se diseñan cardinalidades ni transiciones ahora. |
| BR-PENDING-033 | Actualización efectiva y revisión legal de las condiciones de huescaventura.com con mandato/autorización expresa de gestión, administración y pago por cuenta del cliente. | Requisito futuro obligatorio. No se modifica la web aquí ni se declara aceptado un mandato inexistente; deberá conservarse su versión efectiva. |
| BR-PENDING-034 | Plataforma definitiva de pagos con tarjeta. | Transferencia y conciliación V1 ya definidas; tarjeta/Bizum/otros son futuros y requieren selección/validación antes de activar cobros. |
| BR-PENDING-035 | Viabilidad real de APIs y capacidades de conectores: telefonía/WhatsApp, email, Google Calendar, pagos, web, lectura Avaibook e importación automatizada PLAUD. | Validación técnica posterior; no confundir prioridad o intención con capacidad ya probada. No incluye configurar ni comparar proveedores en esta tarea. |
| BR-PENDING-036 | Convención exacta del cómputo de días y fecha/hora de referencia en reservas multifecha para pagos, participantes y cancelaciones. | Los 7 días y los intervalos ≥7, ≥3 y <3 ya están aprobados; falta precisar calendario/duración y ancla cuando haya ambigüedad, sin cambiar los umbrales. Se concreta antes de automatizar el caso dependiente. |

Las fechas concretas de tarifas, capacidades, fianzas, costes de los upsells Tararí, adelantos de avisos o límites de reintento son datos/configuración a verificar para cada servicio/automatismo. La tabla maestra completa no está incluida aún en las fuentes leídas. Esto no reabre la política aprobada ni permite rellenar sus valores por defecto inventados.

### Resolución de los BR-PENDING anteriores

Este cuadro conserva trazabilidad de la revisión de los 32 pendientes originales; los marcados Resuelto han salido de la lista activa y sus reglas ya recogen la decisión del propietario. No se elimina su historia de Git. «Parcial» mantiene exclusivamente la cuestión residual indicada arriba, no la política ya resuelta.

| Identificador anterior | Resultado | Decisión incorporada / referencia |
|---|---|---|
| BR-PENDING-001 | Parcial | Orden aprobado en BR-INT-001; elección final en BR-INT-005 y pendiente activo 001; capacidad técnica en 035. |
| BR-PENDING-002 | Resuelto | Catálogo configurable, categorías/atributos y packs: BR-SVC-001/005, BR-PACK-001–002. Los servicios concretos se cargan como datos. |
| BR-PENDING-003 | Resuelto | Unidades, formas de precio, mínimos/máximos/tramos y restricciones configurables: BR-SVC-006, BR-PAX-005–007. |
| BR-PENDING-004 | Resuelto | Ocupación por noche y distribución opcional, casa completa y fianzas configurables: BR-NIGHT-001–005. |
| BR-PENDING-005 | Resuelto | Tres requisitos de oportunidad, sin scoring, estados base y motivo de pérdida: BR-LEAD-002/003/005, BR-DIM-001. Las transiciones se diseñarán en su fase. |
| BR-PENDING-006 | Resuelto | Estados base, evidencia, confirmación crítica/económica y cierres: BR-DIM-002/004/005, BR-CLOSE-001–002. |
| BR-PENDING-007 | Resuelto | Políticas por causante y por intervalos, no reembolsable y excepciones: BR-CHANGE-004–007. Cómputo preciso diferido a 036. |
| BR-PENDING-008 | Resuelto | 50/50, reserva con menos de 7 días, excepciones auditadas y fianzas: BR-PAY-002, BR-NIGHT-005. |
| BR-PENDING-009 | Resuelto | Saldo y cifras finales a 7 días, alertas/tareas: BR-PAY-002, BR-PAX-008, BR-TASK-005. Convención temporal en 036. |
| BR-PENDING-010 | Resuelto | Devolución según causa/parte afectada y normalmente por mismo medio: BR-PAY-004, BR-CHANGE-005–007. El reparto de casos especiales queda en 023. |
| BR-PENDING-011 | Resuelto | Cambios sujetos a disponibilidad y ajustes aplicables, sin recargo inventado; política aceptada y auditoría: BR-CHANGE-002–007. |
| BR-PENDING-012 | Parcial | Roles y único usuario V1 definidos por BR-SEC-001; solo acciones finas futuras quedan abiertas. |
| BR-PENDING-013 | Parcial | Economía restringida y V1 resueltas; resta matriz fina futura según BR-SEC-001–004. |
| BR-PENDING-014 | Parcial | Conservación configurable y no borrados automáticos importantes definidos; plazos RGPD abiertos. |
| BR-PENDING-015 | Parcial | Archivado y supuestos excepcionales de eliminación definidos; anonimización detallada pendiente. |
| BR-PENDING-016 | Resuelto | Tabla maestra inicial, versión, vigencia, fuente y estimación/confirmación: BR-ECON-001/006. Importes no aportados siguen siendo datos por verificar. |
| BR-PENDING-017 | Resuelto | Fuente verificada del proveedor, vigencias y revalidación: BR-AVAIL-001–006. Frecuencias técnicas de conectores se tratarán después. |
| BR-PENDING-018 | Resuelto | Opción/bloqueo separado, evidencia, vencimiento, aviso, revalidación y liberación: BR-AVAIL-006. |
| BR-PENDING-019 | Parcial | No audio V1 y transcripciones/PLAUD definidos; consentimiento y tratamiento legal concretos siguen abiertos. |
| BR-PENDING-020 | Parcial | Conservación del original y procedencia definidas; plazos de comunicación aún requieren revisión legal. |
| BR-PENDING-021 | Parcial | Flujo de fondos, suplidos, honorarios y Tararí documentado; validación profesional expresamente pendiente. |
| BR-PENDING-022 | Parcial | EUR, precios normalmente IVA incluido y precisión resueltos; tratamiento/tipos concretos sin verificar siguen abiertos. |
| BR-PENDING-023 | Parcial | Rentabilidad propia, precios manuales, promoción actual y componentes definidos; resta reparto de casos económicos no concretados. |
| BR-PENDING-024 | Resuelto | Prevalece información externa más reciente verificada, sin borrar lo anterior y con revalidación: BR-AVAIL-005, BR-INT-002. |
| BR-PENDING-025 | Resuelto | Datos por etapa y duplicados con señales/fusión humana: BR-CON-001/002/005. |
| BR-PENDING-026 | Resuelto | Organización/contactos e interlocutor principal con facultades/límites: BR-CON-003–004. |
| BR-PENDING-027 | Parcial | Aceptación y vigencia aprobadas en BR-PROP-004–008; solo vías extraordinarias se difieren. |
| BR-PENDING-028 | Resuelto | Listas solo necesarias, datos configurables, cantidades independientes y fecha final: BR-PAX-001–008. |
| BR-PENDING-029 | Resuelto | WhatsApp/email/plataforma/llamada inequívoca registrada, sin escrito posterior obligatorio: BR-SUP-003. |
| BR-PENDING-030 | Resuelto | Transferencia, propuesta de conciliación, dudas humanas, estados y control de fondos: BR-PAY-001–007 y BR-SUPL-001–004. Tarjeta definitiva pasa a 034. |
| BR-PENDING-031 | Resuelto | Evidencias admitidas, documentación por servicio y términos inmutables: BR-PROP-005/008, BR-SUP-003, BR-DOC-001–005. |
| BR-PENDING-032 | Resuelto | Disparadores, responsable V1, notificaciones, seguimiento supervisado y fallos/reintentos: BR-TASK-001–007, BR-COMM-003, BR-AUTO-001–002. Parámetros concretos se configuran en las futuras Specs. |

## Control de calidad y trazabilidad constitucional

Esta revisión documental incorpora las decisiones operativas aprobadas y verifica compatibilidad; no aprueba el documento completo ni ejecuta pruebas de aplicación.

| Principio | Reglas / resultado de la revisión |
|---|---|
| P01 — Datos | BR-GEN-008, BR-AVAIL-004–005, BR-INT-002: expediente canónico separado de autoridad externa verificada. |
| P02 — GitHub | BR-GEN-008, BR-GOV-001: revisión y decisiones agrupadas quedan versionadas en el repositorio. |
| P03 — SDD | BR-GOV-002: solo reglas y coordinación; no se inicia dominio ni implementación. |
| P04 — Especificar primero | DRAFT y pendientes delimitados: aprobación del documento y futuras Specs siguen siendo necesarias. |
| P05 — Veracidad | BR-GEN-001–003, BR-AI-004–005: origen explícito, sin inferir confirmación ni inventar valores faltantes. |
| P06 — Trazabilidad | BR-HIST-001–005, BR-ID-001–002: quién, cuándo, motivo, antes/después, fuentes y vínculos conservados. |
| P07 — Historial | BR-PROP-006, BR-DOC-005, BR-SEC-005: inmutabilidad de aceptaciones, archivado recuperable y borrado excepcional controlado. |
| P08 — Dimensiones | BR-DIM-001–005, BR-CLOSE-001–002: estados base y tres cierres separados, sin diseñar transiciones. |
| P09 — Participantes | BR-PAX-001–008, BR-NIGHT-001–005, BR-PACK-002: cantidades por servicio/noche, sin distribución global obligatoria. |
| P10 — Seguridad | BR-SEC-001–005: un solo administrador V1 no abre datos a terceros ni elimina minimización o privacidad. |
| P11 — Economía | BR-ECON-005, BR-PACK-003–004: precio final comercial no revela costes/márgenes; fondos del cliente diferenciados de costes propios. |
| P12 — Secretos | BR-SEC-004, BR-AUTO-001: secretos fuera de documentos, historial compartido y Git. |
| P13 — Migraciones | No se cambia base de datos ni se redefine break-glass; la futura implementación conserva la obligación íntegra. |
| P14 — Automatizaciones | BR-TASK-004–007, BR-AUTO-001–002: efectos identificables, sin fallos silenciosos ni reintentos sensibles duplicados. |
| P15 — IA | BR-AI-002–005, BR-COMM-003: extracción clara no es confirmación ni aprobación para ejecutar acciones sensibles. |
| P16 — Facturación | BR-BILL-001–005, BR-SUPL-001: registro operativo no habilita emisión legal ni sustituye validación profesional. |
| P17 — Modularidad | BR-INT-001–008: prioridad coordinada de telefonía/WhatsApp, módulos sustituibles y capacidades por validar. |
| P18 — Verificación | Identificadores estables, umbrales explícitos y evidencias permiten futuros criterios de aceptación; ninguna funcionalidad se declara implementada. |
| P19 — Documentación | D010–D017 registran refinamientos aprobados; el borrador completo continúa pendiente de revisión y la coordinación mantiene el paso actual. |
| P20 — Economía reproducible | BR-ECON-001–007, BR-PACK-004, BR-TAR-001–003, BR-SUPL-001–004: componentes, versión, precisión y recálculos conservados. |

Producto v0.1 conserva el qué y para qué. Esta revisión concreta sus puntos abiertos mediante decisiones del propietario: los perfiles de su §3 se mantienen como capacidades previstas y D015 delimita que en V1 solo opera el Administrador/Propietario; los pagos/costes de su §11 distinguen ahora fondos de terceros y economía propia. No se reescribe el producto ni se concede autonomía sensible por esa concreción.

D001–D009 se mantienen sin alterar. D010–D017 agrupan las decisiones nuevas sin sustituir la Constitución. La fecha de los registros identifica esta revisión, no una validación legal ni una implementación. El motivo de cambios materiales sigue siendo trazable conforme a P06–P07 aunque un comentario manual adicional sea opcional.

La política temporal aprobada es expresa en sus umbrales; el ancla exacta multifecha y los repartos de promociones/cancelación sobre precios fijos siguen delimitados en 036 y 023. El modelo de suplidos/Tararí no se presenta como conclusión fiscal definitiva. Estas dudas parciales no impiden revisar y aprobar posteriormente las reglas sustentadas.

El paso actual continúa siendo revisar y aprobar docs/business-rules.md mediante revisión humana final. domain-model.md permanece bloqueado/no iniciado.
