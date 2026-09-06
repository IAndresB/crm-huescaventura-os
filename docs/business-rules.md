# CRM HUESCAVENTURA OS — Business Rules

Status: DRAFT
Version: 0.1
Last updated: 2026-09-06

## 1. Propósito y alcance

Este documento desarrolla las reglas lógicas, comerciales y operativas de CRM HUESCAVENTURA OS. Describe condiciones, información necesaria, efectos y límites para que los documentos posteriores puedan definir el dominio y los estados sin inventar políticas de negocio.

Fuentes revisadas íntegramente: [Constitution v1.0](constitution.md), [Product Definition v0.1](product.md), [D001–D009](DECISIONS.md), [Project Status](PROJECT-STATUS.md) y [Next Steps](NEXT-STEPS.md), sobre la base del repositorio en f30ab4e. Los demás documentos de docs/ y el README son borradores iniciales sin decisiones adicionales aprobadas. La Constitución y el producto están aprobados; este documento no lo está.

Las referencias «C Pxx», «Producto §n» y «Dxxx» identifican esas fuentes. Cada regla BR hereda las fuentes indicadas en su sección. Los identificadores son estables: una revisión conserva el identificador si mantiene el propósito de la regla; no se reutilizan identificadores retirados para reglas distintas.

- **BR-GOV-001 — Autoridad y aprobación.** Rige la jerarquía Constitución → decisiones aprobadas / definición de producto → reglas de negocio → documentos posteriores. Un conflicto se resuelve a favor de la Constitución; una contradicción no resuelta entre otras fuentes aprobadas exige decisión humana sobre la parte afectada. La redacción de una regla derivada no constituye su aprobación: todo este documento queda DRAFT para revisión.
- **BR-GOV-002 — Límite documental.** No se definen tablas, campos físicos, SQL, contratos de API, componentes, arquitectura, listas definitivas de estados ni implementación. Las secuencias descritas son relaciones de negocio, no una máquina de estados. Los detalles no establecidos por las fuentes se registran como BR-PENDING; una nueva política requiere aprobación antes de convertirse en regla definitiva.

Fuentes: autoridad de la Constitución, C P03–P04 y P18–P19; Producto §19–20; D006.

## 2. Principios generales de las reglas

Fuentes: C P01–P02, P05–P11, P14–P15 y P20; Producto §4–5, §9–16; D003–D004 y D009.

- **BR-GEN-001 — Veracidad y procedencia.** No se inventan identidades, precios, disponibilidades, cantidades, costes ni condiciones. Un dato usado para decidir debe tener fuente identificable y vigencia cuando corresponda. Una estimación solo puede utilizarse como tal con regla aprobada; se distingue del dato confirmado.
- **BR-GEN-002 — Bloqueo material.** Si falta información que determina la validez, alcance, autorización o importe de una acción, se detiene esa acción y se identifica qué dato falta y por qué importa. Pueden continuar el registro, la investigación y las tareas independientes. Desconocido no equivale a cero, gratuito, disponible, aceptado ni confirmado.
- **BR-GEN-003 — Naturaleza de la evidencia.** Solicitado significa que se pidió algo; comunicado, que una fuente lo manifestó; confirmado, que existe evidencia verificable referida al alcance concreto; ejecutado, que consta la realización del hecho. Una propuesta expresa una oferta o alternativa y una estimación expresa incertidumbre. No se deduce una categoría de otra por silencio, mero paso del tiempo o presencia de un registro sin evidencia o regla aprobada que sustente el efecto.
- **BR-GEN-004 — Historial y dimensiones.** Los hechos materiales conservan su historia; corregir exige dejar rastro de la situación anterior. La aceptación comercial, la preparación operativa y los movimientos económicos se distinguen y no se sustituyen mutuamente.
- **BR-GEN-005 — Granularidad.** Participantes, cantidades, confirmaciones y componentes económicos se conservan al nivel de servicio y, en alojamiento, de cada noche. Los resúmenes no sustituyen ese detalle ni propagan una cantidad global sobre él.
- **BR-GEN-006 — Economía reproducible y acceso.** Cada importe debe poder reconstruirse desde sus componentes y reglas aplicadas. Costes, márgenes, beneficios, comisiones y desgloses internos están reservados a administradores autorizados, también cuando aparezcan en documentos, historial o resultados de IA.
- **BR-GEN-007 — Actores y efectos sensibles.** Toda acción requiere permiso para su alcance. Durante la primera fase, las acciones sensibles de IA requieren aprobación humana explícita vinculada a la propuesta concreta; una automatización debe dejar rastro de su identidad, versión y resultado.
- **BR-GEN-008 — Fuente canónica y fuente externa.** Supabase conserva los datos canónicos del CRM; GitHub conserva código, documentación y decisiones versionadas. Una información externa incorporada al CRM conserva su procedencia y no cambia por ello quién tiene autoridad para confirmarla.

## 3. Contactos y clientes

Fuentes: C P05–P07 y P10; Producto §3, §5–6 y §16. Límites pendientes: BR-PENDING-012, 014–015 y 025–026.

- **BR-CON-001 — Contacto inicial incompleto.** Se puede registrar un contacto inicial con la información conocida y su contexto de origen. No se completan identidades, datos de contacto ni necesidades mediante suposiciones. La ausencia de datos solo bloquea acciones que los necesitan; no se exige aquí un listado exhaustivo de datos para abrir un expediente.
- **BR-CON-002 — Identificación de personas.** La atribución de una comunicación, aceptación o petición a una persona debe apoyarse en información verificable. Una coincidencia parcial de nombre o canal no acredita por sí sola que se trate de la misma persona ni que tenga autoridad sobre una reserva.
- **BR-CON-003 — Organizaciones y representación.** Si el contacto actúa por una organización o grupo, solo se registra como hecho esa relación cuando se conoce su procedencia. El producto no define todavía una política de organizaciones ni de representación; no se presupone que contacto, pagador, cliente y participante sean la misma persona.
- **BR-CON-004 — Responsable principal del grupo.** Cuando se haya identificado un interlocutor principal, se conserva su relación con el grupo y la fuente de esa designación. Ser interlocutor no concede automáticamente capacidad para aceptar, cancelar o autorizar divulgaciones por todo el grupo. El modo de designación y sus facultades quedan pendientes.
- **BR-CON-005 — Posibles duplicados.** Detectar información coincidente no permite eliminar ni fusionar silenciosamente contactos y sus historiales. Una corrección de identidad debe poder reconstruirse y preservar la procedencia de los hechos afectados. Los criterios de coincidencia, validación y fusión quedan pendientes de decisión.
- **BR-CON-006 — Actualización y minimización.** Se actualizan datos con fuente conocida y se conserva la trazabilidad de cambios materiales. Se recopila únicamente información necesaria para la finalidad autorizada; ni completar una ficha ni resolver un duplicado justifica pedir datos personales innecesarios.

## 4. Leads y oportunidades

Fuentes: C P05–P07; Producto §6–7. Límites pendientes: BR-PENDING-005, 025 y 027.

- **BR-LEAD-001 — Señal de interés.** A efectos conceptuales, un lead representa un contacto o señal de interés comercial registrada con el contexto conocido. No equivale a cliente comprador, oportunidad cualificada, reserva ni aceptación. Los requisitos administrativos exactos de alta quedan pendientes.
- **BR-LEAD-002 — Oportunidad y cualificación.** Una oportunidad representa una posibilidad de venta que se trabaja en relación con un cliente o contacto, necesidades, fechas, participantes previstos y servicios de interés. Cualificar consiste en verificar y precisar esa información; no existe aún un umbral aprobado de puntuación, cantidad de datos o conversión automática desde un lead.
- **BR-LEAD-003 — Avance condicionado.** Se puede investigar, completar información y hacer seguimiento con datos pendientes identificados. Antes de formular un compromiso deben estar verificados los datos que determinan ese compromiso. No se exige cerrar todas las incógnitas del expediente para avanzar en una parte independiente ni se inventan requisitos globales de paso.
- **BR-LEAD-004 — Contexto comercial.** Cada oportunidad debe conservar origen, necesidades, fechas, tamaño previsto, servicios de interés y responsable según sean conocidos. Las estimaciones y los cambios de necesidad no sustituyen a hechos ya confirmados; se conserva su evolución.
- **BR-LEAD-005 — Pérdida y reactivación.** Registrar una pérdida conserva su motivo conocido, contexto y comunicaciones; si no se conoce el motivo, se identifica como desconocido. Reactivar no borra la pérdida anterior ni renueva por sí mismo precios o disponibilidad. Los permisos y criterios exactos de pérdida y reactivación se decidirán antes de definir sus transiciones.

## 5. Propuestas comerciales

Fuentes: C P05–P07 y P20; Producto §7 y §11. Límites pendientes: BR-PENDING-016, 021–023 y 027.

- **BR-PROP-001 — Procedencia y alcance.** Toda propuesta se relaciona con la oportunidad que la origina. Debe poder identificarse qué servicios, fechas, participantes, condiciones e importes se están proponiendo y qué sigue pendiente, sin exigir todavía campos físicos o un formato concreto.
- **BR-PROP-002 — Alternativas y versiones.** Pueden coexistir alternativas para una oportunidad. Una versión permite reconstruir la propuesta en ese momento; una alternativa expresa una opción distinta. Preparar, aceptar o rechazar una no elimina las demás ni su historial.
- **BR-PROP-003 — Precios y estimaciones.** Antes de presentar un importe como verificable se debe conservar su fuente y las cantidades y reglas utilizadas. Un precio estimado se etiqueta y exige una regla aprobada de estimación; no se transforma en precio comprometido sin la validación correspondiente. La disponibilidad se acredita por separado.
- **BR-PROP-004 — Vigencia.** Si una fuente o condición aprobada establece vigencia, esta se conserva y se respeta para la parte afectada. No se inventan plazos de validez, renovaciones ni una caducidad automática general. Una vigencia desconocida exige verificación antes de volver a comprometer el dato material.
- **BR-PROP-005 — Aceptación y rechazo.** La aceptación identifica contenido/versionado aceptado, momento y evidencia atribuible al cliente o representante habilitado. Registrar un rechazo conserva a qué propuesta se refiere y lo conocido sobre su motivo. Enviar una propuesta, recibir una lectura o no recibir respuesta no acredita aceptación; la evidencia y representación admitidas están pendientes de concreción.
- **BR-PROP-006 — Conservación de lo aceptado.** No se sobrescribe una propuesta histórica aceptada. Un cambio posterior queda como revisión, ajuste o alternativa con sus diferencias y decisiones. Ni una tarifa nueva ni un recálculo posterior altera silenciosamente el contenido previamente aceptado.

## 6. Conversión de oportunidad a reserva

Fuentes: C P05–P08 y P15; Producto §7–8; D009. Límites pendientes: BR-PENDING-027.

- **BR-CONV-001 — Base comercial verificable.** Convertir una venta aceptada en reserva requiere poder identificar la oportunidad, la propuesta y el alcance aceptado. Una intención, borrador o respuesta ambigua no autoriza presentar una venta como aceptada.
- **BR-CONV-002 — Continuidad de la información.** La conversión conserva los vínculos y la versión aceptada, traslada los hechos confirmados sin cambiar su significado e identifica expresamente datos y servicios aún pendientes. No constituye un nuevo acuerdo comercial por sí sola.
- **BR-CONV-003 — Independencia operativa.** Una venta ganada puede originar una reserva cuyos servicios siguen pendientes de disponibilidad, proveedor o preparación. No se deduce la confirmación de un servicio a partir del éxito comercial de la oportunidad.
- **BR-CONV-004 — Condiciones no definidas.** No se inventa un anticipo obligatorio, un porcentaje cobrado ni una confirmación de todos los proveedores como requisito universal de conversión. La creación de reservas preparada por IA requiere revisión humana inicial. Las vías de alta sin propuesta, divisiones o agrupaciones de ventas quedan pendientes, sin fijar cardinalidades.

## 7. Reservas

Fuentes: C P06–P09 y P15; Producto §7–10 y §15. Límites pendientes: BR-PENDING-006, 012 y 027.

- **BR-BOOK-001 — Expediente único de referencia.** La reserva concentra el contexto de la experiencia o conjunto de servicios: procedencia comercial, grupo, fechas, responsables, participantes, pagos, documentos y comunicaciones. Los canales o documentos externos no crean versiones competidoras de ese expediente; su información se vincula y concilia.
- **BR-BOOK-002 — Datos confirmados y pendientes.** Las fechas, integrantes, proveedores y demás datos conservan su naturaleza conocida, prevista o confirmada. Para comunicar un compromiso sobre la reserva debe conocerse su alcance material; que quede información pendiente no impide trabajar sobre sus partes independientes.
- **BR-BOOK-003 — Responsabilidad y seguimiento.** Debe poder identificarse el responsable del seguimiento comercial u operativo de las acciones realizadas y las tareas asociadas. Un responsable de tarea, un contacto cliente y un proveedor no adquieren por esa relación permisos generales sobre toda la reserva.
- **BR-BOOK-004 — Cambios e incidencias.** Modificaciones, cancelaciones e incidencias permanecen ligadas al expediente con sus efectos y antecedentes. Solicitar una cancelación o registrar una incidencia no acredita que todos los servicios se hayan cancelado, que se hayan devuelto pagos ni que se hayan ejecutado compensaciones.

## 8. Servicios dentro de una reserva

Fuentes: C P08–P09 y P20; Producto §8–10. Límites pendientes: BR-PENDING-002–004 y 006.

- **BR-SVC-001 — Composición independiente.** Una reserva puede incluir actividades, restaurantes/restauración, transporte, alojamiento, entradas, guías, materiales y otros servicios. Esta relación expresa las capacidades del producto; no constituye el catálogo comercial aprobado, ni implica que todos los tipos deban estar presentes.
- **BR-SVC-002 — Alcance propio.** Cada servicio gestiona independientemente fecha y hora cuando correspondan, proveedor, participantes, cantidad, disponibilidad, confirmación, coste, precio, dependencias, preparación, ejecución e incidencias. Un dato global no sustituye los datos particulares ni convierte lo desconocido en confirmado.
- **BR-SVC-003 — Confirmación acotada.** Una confirmación solo cubre el servicio y el alcance que la evidencia identifica. Queda prohibido confirmar todos los servicios porque la reserva esté confirmada comercialmente o porque otro servicio sí lo esté.
- **BR-SVC-004 — Dependencias y realización.** Se conservan las dependencias conocidas para explicar qué parte puede prepararse y qué parte está afectada por un pendiente o cambio. Estar disponible, confirmado o preparado no prueba ejecución. Las condiciones específicas de preparación, ejecución y cierre de cada tipo quedan pendientes.

## 9. Participantes y cantidades

Fuentes: C P05, P07, P09–P10 y P20; Producto §8–10. Límites pendientes: BR-PENDING-003–004 y 028.

- **BR-PAX-001 — Tamaño del grupo.** Se distingue tamaño estimado y tamaño confirmado, con su procedencia. El tamaño estimado no se convierte en confirmado por utilizarlo en una propuesta; un tamaño desconocido no se interpreta como cero.
- **BR-PAX-002 — Autonomía por servicio.** Cada servicio conserva su cantidad y, cuando sea necesaria, su selección de participantes. El total general del grupo NO puede sobrescribir ni sustituir cantidades definidas en servicios, aunque cambie posteriormente.
- **BR-PAX-003 — Diferencias válidas de alcance.** Pueden existir cantidades distintas entre actividades, restaurante, transporte y alojamiento. No se fuerza igualdad con el grupo ni entre servicios. Las diferencias se explican desde el alcance conocido; no se aprueban con ello participantes adicionales, límites o excepciones no definidos por el negocio.
- **BR-PAX-004 — Listas necesarias.** Las listas específicas se vinculan al servicio y, cuando corresponda, a la noche. Solo se incluye y comunica la información personal necesaria a destinatarios autorizados. La obligatoriedad de listas nominales y sus categorías o restricciones quedan pendientes; no se exige identidad completa de todos para cualquier tarea.
- **BR-PAX-005 — Cambios y capacidad.** Un cambio de cantidad conserva antes, después y motivo; se revisa su efecto material sobre precio, coste, capacidad y confirmación afectados. Una disponibilidad para una cantidad no prueba disponibilidad para otra. Si la capacidad necesaria no está verificada o es insuficiente, o se desconoce una restricción material del proveedor, se bloquea el compromiso afectado, no todos los servicios.
- **BR-PAX-006 — Totales con significado.** Un total debe poder explicarse por su detalle y alcance: grupo, servicio o noches. Sumar asistencias a varios servicios no demuestra un número de personas distintas. Las unidades, categorías y reglas de agregación deben estar definidas antes de usar un total para precio o capacidad; el resumen nunca reemplaza el detalle.

## 10. Alojamiento por noche

Fuentes: C P05, P09 y P20; Producto §9–10. Límites pendientes: BR-PENDING-003–004 y 028.

- **BR-NIGHT-001 — Ocupación nocturna.** Se conserva una ocupación propia para cada noche, incluyendo su carácter estimado o confirmado. No se aplica una cifra única a toda la estancia cuando existen diferencias entre noches.
- **BR-NIGHT-002 — Entradas y salidas distintas.** El detalle debe permitir reflejar personas que entran o salen en fechas diferentes y ocupación variable. Una modificación de una noche no sobrescribe las demás ni confirma automáticamente ampliaciones de estancia.
- **BR-NIGHT-003 — Cálculo y capacidad.** Los importes y resúmenes de alojamiento deben reconstruirse desde el detalle nocturno y las reglas de precio aplicables. Una capacidad o disponibilidad comunicada para determinadas noches no se extiende a otras. No se calcula automáticamente personas por noches como importe sin conocer la unidad real de cobro.
- **BR-NIGHT-004 — Servicios vinculados.** Restauración, transporte u otros servicios relacionados con alojamiento mantienen su propio alcance, participantes y confirmación. No se hereda su cantidad de la ocupación ni se presume su inclusión. Reglas de habitaciones, camas, entradas/salidas y excepciones nocturnas requieren definición posterior.

## 11. Proveedores

Fuentes: C P01, P05–P08 y P20; Producto §8–11 y §13. Límites pendientes: BR-PENDING-017–018, 024 y 029.

- **BR-SUP-001 — Contexto de proveedor.** Se relacionan proveedor, servicio ofrecido, contacto, condiciones, solicitudes, respuestas, costes y documentos con su procedencia y fecha pertinente. Trabajar con un proveedor no hace universales sus condiciones ni confirma automáticamente todos los servicios que ofrece.
- **BR-SUP-002 — Significado de sus respuestas.** Solicitado acredita una petición; comunicado acredita una respuesta o dato recibido; disponible expresa oferta de capacidad en el alcance comunicado; confirmado acredita aceptación operativa explícita del alcance. Bloqueado/opcionado solo se utiliza si existe ese concepto y se conocen sus condiciones; no equivale a confirmado. Cancelado exige evidencia del alcance cancelado, no solo de la petición.
- **BR-SUP-003 — Confirmación y ambigüedad.** Una confirmación debe poder atribuirse a una fuente autorizada y relacionarse con servicio, fechas, cantidades y condiciones materiales. Una respuesta ambigua o contradictoria queda por verificar, conservando el mensaje original y afectando únicamente a los compromisos dependientes.
- **BR-SUP-004 — Cambios y cancelaciones.** Las nuevas condiciones, cambios, cancelaciones y costes se registran sin borrar la información anterior. Una petición enviada al proveedor no acredita su aceptación; la situación comercial del cliente y la respuesta operativa del proveedor se siguen por separado.

## 12. Disponibilidad

Fuentes: C P01, P05–P06 y P08–P09; Producto §10, §16 y §19. Límites pendientes: BR-PENDING-017–018 y 024.

- **BR-AVAIL-001 — Fuente y momento.** Toda disponibilidad utilizada para comprometer un servicio identifica fuente, fecha/hora de consulta o comunicación y alcance material: servicio, fechas y cantidad pertinente. Sin procedencia verificable no se declara disponibilidad confirmada.
- **BR-AVAIL-002 — Grado de certeza.** Una disponibilidad estimada requiere regla aprobada y etiqueta de estimación. La comunicada conserva lo manifestado por la fuente; la confirmada requiere evidencia referida al alcance requerido. Ninguna implica ejecución ni reserva firme si la evidencia solo trata de capacidad disponible.
- **BR-AVAIL-003 — Vigencia y caducidad.** Se respeta la vigencia explícita comunicada por la fuente o fijada por una regla aprobada. No se inventan plazos de actualización, duración de opciones ni caducidades. Una evidencia vencida o de vigencia incierta no autoriza un nuevo compromiso que dependa de que siga vigente; se verifica la parte necesaria.
- **BR-AVAIL-004 — Autoridad externa.** Una copia en Supabase mantiene trazabilidad, pero no convierte al CRM en autoridad sobre la disponibilidad que controla un proveedor. La reserva ganada, un mensaje enviado o una consulta anterior no garantizan capacidad actual.
- **BR-AVAIL-005 — Cambios y conciliación.** Si aparece una discrepancia externa, se conserva qué se sabía, qué comunica la nueva fuente y qué servicios quedan afectados. Se verifica antes de adoptar como confirmado el dato en conflicto; no se elige silenciosamente el más reciente ni se anula automáticamente la venta. La política concreta de conciliación y precedencia queda pendiente.

## 13. Estado comercial vs estado operativo

Fuentes: C P08; Producto §6–10. Límites pendientes: BR-PENDING-005–006.

- **BR-DIM-001 — Dimensión comercial.** Describe la relación de venta y el alcance del acuerdo: captación, negociación, aceptación o pérdida son conceptos orientativos, no estados definitivos. Una aceptación conserva sus evidencias; no significa que el servicio se haya preparado o prestado.
- **BR-DIM-002 — Dimensión operativa.** Describe preparación, confirmaciones, disponibilidad para prestar, ejecución, incidencias y cierre en el alcance correspondiente. Estos conceptos no fijan aún una máquina de estados ni permiten declarar «listo» por ausencia de incidencias registradas; sus condiciones deben definirse.
- **BR-DIM-003 — Efectos cruzados explícitos.** Ningún cambio comercial altera automáticamente lo operativo, ni viceversa, salvo regla explícita, aprobada, probada y auditable. Pueden coexistir venta ganada y servicios pendientes. La futura documentación de estados debe mantener esa independencia y las evidencias de cada dimensión.

## 14. Pagos y cobros

Fuentes: C P05–P07, P15 y P20; Producto §11; D009. Límites pendientes: BR-PENDING-008–010, 021–022 y 030.

- **BR-PAY-001 — Previsión y movimiento real.** Un importe previsto, solicitud de cobro o promesa de pago no constituye dinero recibido. Cada hecho económico se vincula con su reserva y conserva importe, fecha, método, referencia y procedencia en la medida necesaria para identificarlo; lo que falta se declara pendiente antes de utilizarlo como cobro verificado.
- **BR-PAY-002 — Anticipos y pagos parciales.** Un anticipo o pago parcial, cuando sus condiciones estén acordadas, se registra con su alcance y no convierte por sí solo toda la reserva en pagada o sus servicios en confirmados. No se fijan porcentajes, mínimos, vencimientos ni obligatoriedad universal de depósito. El saldo depende de lo acordado y de movimientos verificados, no de lo meramente solicitado.
- **BR-PAY-003 — Conciliación y errores.** Un aviso, justificante o respuesta del medio de pago se contrasta con la fuente autorizada antes de tratar una discrepancia como resuelta. No se contabiliza dos veces el mismo hecho porque llegue por varios canales. Una corrección conserva el movimiento original y su ajuste; evidencia admisible, asignaciones y casos excepcionales quedan pendientes.
- **BR-PAY-004 — Devoluciones.** Se distinguen devolución solicitada, autorizada y efectivamente realizada, con referencia al cobro y alcance afectados. Cancelar una reserva no acredita devolución ni determina su importe. La IA requiere aprobación humana para ejecutar cobros o reembolsos; no se presuponen derechos, plazos o penalizaciones no aprobados.
- **BR-PAY-005 — Pagos a proveedores.** El coste previsto, el coste real y el pago realizado al proveedor son hechos distintos. Se conservan situación de pago, referencia, evidencia y relación con el servicio o reserva cuando se conocen; un coste documentado no prueba que se haya pagado. Sus condiciones y conciliación siguen pendientes y la información económica interna conserva la restricción de administradores.

## 15. Costes y rentabilidad

Fuentes: C P05–P07, P11 y P20; Producto §11 y §19. Límites pendientes: BR-PENDING-016 y 021–023.

- **BR-ECON-001 — Componentes diferenciados.** Se conservan precio de venta, cantidades, precios unitarios, descuentos, comisiones y costes previstos y reales utilizados. Una previsión no se sustituye por el coste real: se mantiene la comparación y la explicación de diferencias. Ausencia de un coste no significa coste cero.
- **BR-ECON-002 — Reconstrucción.** Todo importe, margen o beneficio presentado debe poder reconstruirse con componentes y reglas aplicadas. Se conserva la versión de reglas y precios cuando corresponda; un total agregado no puede ser la única evidencia ni reemplazar el detalle por servicio/noche requerido.
- **BR-ECON-003 — Recálculos materiales.** Un recálculo que altere importes o rentabilidad conserva valores anteriores y nuevos, actor, fecha, motivo, datos y reglas utilizados. Una tarifa actualizada o descuento posterior no reescribe lo aceptado comercialmente; si cambia el compromiso se aplica el proceso de modificación.
- **BR-ECON-004 — Resultado con límites conocidos.** No se presenta rentabilidad definitiva basada en costes desconocidos, precios no verificados o fórmulas no aprobadas. Un resultado previsto exige datos y regla de estimación autorizados e identificación de sus límites. Fórmulas de margen/beneficio, tratamiento de impuestos, comisiones, descuentos, moneda y redondeo están pendientes; aquí no se elige ninguna.
- **BR-ECON-005 — Acceso exclusivo.** Costes, márgenes, beneficios, comisiones y desgloses internos solo son accesibles a administradores autorizados. Esa restricción comprende cálculos, componentes, historial, documentos, exportaciones, comunicaciones y contexto de IA. Trabajar una reserva o ser proveedor no concede acceso a su expediente económico interno; cualquier dato comunicado debe respetar ese límite y los permisos aprobados.

## 16. Cambios, modificaciones y cancelaciones

Fuentes: C P05–P08 y P15; Producto §7–11 y §15; D009. Límites pendientes: BR-PENDING-007, 010–012, 026–027 y 029.

- **BR-CHANGE-001 — Petición y facultad.** Una petición recibida de cliente, interlocutor, proveedor o usuario interno conserva actor, origen y parte afectada. Poder registrar una solicitud no acredita facultad para aprobarla o ejecutarla. Ante autoridad desconocida se verifica la parte dependiente; no se asignan facultades nuevas por ser responsable del grupo o proveedor.
- **BR-CHANGE-002 — Alcance e impactos.** Antes de aplicar un cambio se distingue qué afecta al acuerdo comercial, a servicios/participantes/noches, a confirmaciones y a importes. Se conserva la situación anterior y se identifican las dependencias aún por confirmar. No se interpreta una solicitud del cliente como aceptación del proveedor ni al contrario.
- **BR-CHANGE-003 — Aprobación y comunicación.** La aprobación se refiere a un alcance concreto y sus consecuencias conocidas. Las modificaciones sensibles preparadas por IA requieren aprobación humana explícita inicial; un cambio material de la propuesta invalida esa aprobación para el nuevo alcance. Las comunicaciones y respuestas necesarias se conservan sin equiparar envío, recepción y aceptación.
- **BR-CHANGE-004 — Cancelación parcial o total.** Una cancelación parcial identifica servicios, fechas, noches o cantidades afectadas y conserva las partes no canceladas. Una solicitud total no prueba que cada proveedor la haya confirmado. Penalizaciones, costes de modificación, compensaciones y devoluciones solo se aplican con condiciones aprobadas/verificadas; no se deducen automáticamente ni se borran cobros, costes o antecedentes.

## 17. Tareas, vencimientos y alertas

Fuentes: C P05–P06 y P14; Producto §12 y §14. Límites pendientes: BR-PENDING-006, 009 y 032.

- **BR-TASK-001 — Contexto y responsabilidad.** Una tarea se vincula a cliente, oportunidad, reserva, servicio o proveedor y conserva causa, responsable, fecha, prioridad, contexto y resultado según se definan. Un dato aún desconocido no se rellena con un valor inventado ni se muestra como plazo confirmado.
- **BR-TASK-002 — Alerta explicable.** Cada alerta permite conocer por qué existe, qué expediente afecta y qué requiere acción. Fechas y vencimientos se derivan de hechos o reglas conocidos; no se inventan plazos de pago o confirmación. Un recordatorio sobre información pendiente indica esa condición.
- **BR-TASK-003 — Cierre y efectos.** Cerrar una tarea deja constancia de su resultado; si se cancela o deja sin efecto, se registra el motivo. Cerrar una tarea de seguimiento no prueba aceptación, pago, confirmación o ejecución del servicio. Estos hechos necesitan su propia evidencia.
- **BR-TASK-004 — Automatización y cambios.** Las tareas o alertas automáticas identifican su origen y evitan duplicados del mismo efecto. Un cambio material debe dejar visibles las tareas afectadas y su revisión, sin borrar el contexto previo ni generar nuevas obligaciones comerciales. Las reglas de generación, escalado, prioridad y recordatorios quedan por aprobar.

## 18. Comunicaciones

Fuentes: C P05–P07, P10 y P15; Producto §13–15; D009. Límites pendientes: BR-PENDING-001, 019–020 y 031–032.

- **BR-COMM-001 — Registro contextual.** Una comunicación relevante por email, WhatsApp, llamada, mensaje u otro canal autorizado se vincula a su contacto, oportunidad, reserva, servicio o proveedor. Debe poder identificarse origen/destino autorizado, canal, fecha, actor y contenido o referencia suficiente, limitada por privacidad.
- **BR-COMM-002 — Preparación y entrega.** Borrador identifica contenido en elaboración; preparada indica una propuesta lista para revisar; aprobada significa autorización sobre su contenido concreto. Enviada y recibida requieren evidencia de esos hechos. Aprobar no acredita envío; envío no acredita recepción, lectura ni aceptación. Son distinciones conceptuales, no una lista final de estados.
- **BR-COMM-003 — Naturaleza y aprobación.** Informativa y sensible/vinculante califican el efecto del contenido, independientemente del canal o de si es borrador o mensaje enviado. Durante la primera fase las comunicaciones sensibles o vinculantes de IA requieren aprobación humana; una plantilla no elimina esa exigencia. Las informativas con plantilla previamente aprobada solo pueden automatizarse dentro de lo autorizado por una Spec.
- **BR-COMM-004 — Respuestas y límites.** Una respuesta se conserva con su alcance; no se interpreta una expresión ambigua como aceptación comercial, disponibilidad o confirmación operativa. El mensaje no es la fuente canónica de la reserva ni concede permiso para divulgar datos internos. Consentimiento y conservación de llamadas, grabaciones y transcripciones permanecen pendientes.

## 19. IA y automatizaciones

Fuentes: C P05, P10–P12 y P14–P15; Producto §13–14; D009. Límites pendientes: BR-PENDING-001, 012–015, 019–020 y 032.

- **BR-AI-001 — Asistencia identificable.** La IA puede resumir, clasificar, buscar, proponer, redactar, detectar incoherencias y preparar acciones. Una inferencia o borrador no es un hecho confirmado ni crea un acuerdo. Sus resultados deben poder revisarse y rastrearse hasta la información autorizada que los sustenta.
- **BR-AI-002 — Aprobación sensible inicial.** Durante la primera fase, antes de que IA ejecute acciones sensibles debe existir aprobación humana explícita: comprometer precios o disponibilidad, crear/confirmar/modificar/cancelar reservas, enviar comunicaciones sensibles o vinculantes, cobrar, reembolsar, revelar datos personales o modificar permisos. Se respetan los permisos del aprobador y se registra propuesta concreta, persona que aprueba, momento y resultado.
- **BR-AI-003 — Alcance de la autorización.** Una aprobación no autoriza otras acciones ni una propuesta materialmente cambiada; esta requiere nueva aprobación. La excepción de mensajes informativos con plantillas aprobadas solo opera en los límites de una Spec aprobada. Ampliar autonomía requiere la Spec y los controles exigidos por P15; no se decide en este borrador.
- **BR-AUTO-001 — Ejecución reconstruible.** Cada automatización identifica responsable, disparador, versión, permisos, entradas, efectos y registros afectados, fechas y resultado. Los errores se registran y son detectables, sin exponer secretos ni datos a quienes no pueden verlos. Un fallo no se declara éxito ni confirma un efecto externo incierto.
- **BR-AUTO-002 — Duplicados y recuperación.** Reintentar o recibir otra vez el mismo hecho no debe duplicar cobros, comunicaciones vinculantes, reservas u otros efectos. Se define prevención de duplicados/idempotencia cuando corresponda, así como capacidad de detener, revisar y recuperar o compensar. Antes de repetir un efecto externo de resultado incierto se concilia su resultado; parámetros concretos de reintento y compensación quedan pendientes.

## 20. Documentos y evidencias

Fuentes: C P05–P07 y P10; Producto §15. Límites pendientes: BR-PENDING-014–015, 021, 027, 029 y 031.

- **BR-DOC-001 — Contexto del archivo.** Cada documento o evidencia conserva procedencia, fecha, tipo/finalidad, expediente relacionado y permisos. Propuestas, confirmaciones, contratos, justificantes y documentos de proveedores solo se usan para la finalidad y alcance que acreditan.
- **BR-DOC-002 — Versiones e integridad histórica.** Sustituir o corregir un documento importante deja referencia a su versión anterior y motivo, sujeto a conservación autorizada. No se reemplaza silenciosamente el documento que sustentó una aceptación, confirmación, cobro o decisión.
- **BR-DOC-003 — Valor probatorio acotado.** Adjuntar un archivo no convierte sus datos en confirmados ni suple la verificación de fuente, alcance y validez. Un justificante no resuelve por sí mismo un pago en conflicto. Criterios de evidencia admisible y comprobación se concretarán sin otorgar aquí validez legal a un formato.

## 21. Timeline e historial

Fuentes: C P06–P07, P10, P14 y P20; Producto §11 y §15. Límites pendientes: BR-PENDING-014–015.

- **BR-HIST-001 — Reconstrucción de hechos.** Todo hecho comercial, operativo, económico o de comunicación material debe permitir reconstruir qué ocurrió, cuándo, quién actuó, qué cambió, valor anterior y nuevo cuando exista cambio, motivo y origen humano o automático. En una creación se identifica que no existía valor previo; una ausencia de evidencia se declara, no se inventa.
- **BR-HIST-002 — Vínculos y momento.** El historial mantiene relaciones entre oportunidad, propuesta/versiones, aceptación, reserva, servicios, comunicaciones, tareas, documentos y movimientos pertinentes. Si un hecho se registra después de ocurrir, se distinguen el momento conocido del hecho y su registro para no aparentar una secuencia falsa.
- **BR-HIST-003 — Correcciones sin destrucción.** Las correcciones, recálculos, cancelaciones y compensaciones añaden trazabilidad que permite reconstruir el hecho original y la rectificación. Editar la vista actual no autoriza borrar antecedentes que influyeron en una decisión, servicio, pago o comunicación.
- **BR-HIST-004 — Historial protegido.** Un timeline unificado no es un permiso universal de lectura: respeta las restricciones económicas y personales de cada hecho. La anonimización o eliminación necesaria sigue una política autorizada y auditada; la conservación histórica no permite retención personal indefinida.

## 22. Seguridad, permisos y privacidad

Fuentes: C P10–P12; Producto §3, §11 y §16; D007. Límites pendientes: BR-PENDING-012–015, 019–020 y 026.

- **BR-SEC-001 — Acceso por finalidad.** Rigen mínimo privilegio, denegación por defecto y separación de funciones. Registrar, consultar, aprobar, ejecutar y exportar no se presuponen permisos equivalentes. No se otorgan accesos por la mera existencia de un rol previsto; las facultades concretas deben estar aprobadas.
- **BR-SEC-002 — Economía reservada en todo soporte.** La condición de administrador autorizado es necesaria para acceder a costes, márgenes, beneficios, comisiones y desgloses internos. Un informe, adjunto, búsqueda, resumen, exportación o automatización no puede eludirla. El detalle de permisos pendiente no puede rebajar esta prohibición constitucional.
- **BR-SEC-003 — Datos personales y terceros.** Se recopilan, comparten y conservan solo los datos necesarios para una finalidad autorizada. Clientes, proveedores y colaboradores no obtienen acceso al expediente completo por estar relacionados con él. Las listas de participantes y comunicaciones se limitan a destinatarios y contenido necesarios; conservación, anonimización y facultades de representación requieren política aprobada.
- **BR-SEC-004 — IA, exportaciones y secretos.** La IA y las integraciones reciben únicamente información permitida para su función y destinatarios. Exportar o copiar no amplía derechos de acceso. Credenciales y secretos no forman parte de expedientes compartidos, documentos, historial visible ni Git; su tratamiento sigue P12. Estas reglas no diseñan mecanismos técnicos ni políticas de base de datos.

## 23. Facturación

Fuentes: C P16; Producto §11 y §18; D008. Límite pendiente: BR-PENDING-021.

- **BR-BILL-001 — Prohibición fiscal vigente.** El CRM no emite facturas legales ni asigna numeración fiscal hasta que la arquitectura de facturación haya sido validada conforme a la normativa española aplicable por profesionales competentes y aprobada por el responsable del proyecto, con evidencia y alcance documentados según P16.
- **BR-BILL-002 — Borradores no fiscales.** Un borrador permitido se identifica inequívocamente como no fiscal y sin validez como factura. Un presupuesto, justificante de cobro o archivo adjunto no se transforma en factura legal por su presencia en el CRM.
- **BR-BILL-003 — Separación de capacidades.** El registro de cobros y datos económicos no autoriza construir un motor fiscal propio en V1. Integrar un proveedor de facturación tampoco levanta por sí solo la prohibición; alcance, responsabilidad y validación fiscal siguen pendientes.

## 24. Integraciones externas

Fuentes: C P01, P05–P06, P10–P11 y P14–P17; Producto §13–19; D004 y D007–D009. Límites pendientes: BR-PENDING-001, 017–024, 030 y 032.

- **BR-INT-001 — Capacidades previstas.** WhatsApp, telefonía, ElevenLabs, pagos, Avaibook y la futura web pública se contemplan según el producto; la facturación mantiene su condición previa de validación. La prioridad V1 y el alcance de conectores, incluido calendario, siguen pendientes. Ninguna mención configura una integración ni aprueba proveedores adicionales.
- **BR-INT-002 — Responsabilidad del dato.** Todo dato recibido debe conservar origen, alcance y momento pertinente. Supabase es la referencia del CRM, pero disponibilidad, pagos y documentos externos mantienen la autoridad de la fuente responsable. Una conciliación debe explicar discrepancias y evitar sobrescrituras o duplicados; sus reglas concretas requieren aprobación.
- **BR-INT-003 — Sustitución sin pérdida.** Las reglas de negocio centrales conservan su significado al cambiar o desactivar una integración. Se preservan historial, relaciones y hechos; los fallos o resultados inciertos no se presentan como confirmaciones. Las operaciones independientes pueden continuar cuando no dependan materialmente del proveedor caído.
- **BR-INT-004 — Web pública y acceso.** La web huescaventura.com y el CRM permanecen como aplicaciones/repositorios separados y solo comparten backend/API cuando corresponda con límites aprobados. Ni la web ni un canal externo reciben costes, márgenes, beneficios o información interna no autorizada. El entorno de desarrollo y despliegue se remite a la futura arquitectura, sin redefinir D002 o D005.

## Decisiones pendientes

Todas las entradas tienen estado **PENDIENTE DE DECISIÓN**. No son reglas aprobadas ni habilitan valores por defecto. Proceden de Producto §19 o de detalles que las fuentes aprobadas no resuelven y que deben concretarse para los ámbitos solicitados.

Ninguna impide entregar y revisar este borrador. La columna «Límite» identifica la acción o definición futura afectada: se puede aplazar esa parte hasta su decisión, manteniendo las reglas ya sustentadas. La aprobación del documento tampoco aprobará por silencio estas opciones; cada resolución debe quedar trazable y ser incorporada a las reglas afectadas. El responsable del proyecto debe validar las políticas de negocio y los especialistas competentes las materias que requieran su validación.

| Identificador | Cuestión que requiere decisión | Por qué importa | Partes futuras dependientes | Límite hasta decidir |
|---|---|---|---|---|
| BR-PENDING-001 | Prioridad y alcance V1 de WhatsApp, telefonía/ElevenLabs, pagos, Avaibook y calendario; qué canales requieren integración. | Mencionar una capacidad no determina qué se entrega primero. | Alcance de Specs e integraciones. | Aplazable para revisar reglas; no comprometer ni configurar conectores sin alcance aprobado. |
| BR-PENDING-002 | Catálogo real de servicios, variantes y servicios adicionales permitidos. | La lista de capacidades del producto no define la oferta comercial. | Dominio de servicios, reglas específicas y Specs. | No crear catálogo, paquetes o condiciones comerciales ficticios. |
| BR-PENDING-003 | Unidades de cantidad/capacidad, categorías, límites y restricciones verificables por servicio/proveedor. | Personas, plazas, habitaciones y otras unidades no son intercambiables. | Participantes, disponibilidad, capacidad y cálculos. | No validar cupo ni precio dependiente de una unidad o restricción desconocida. |
| BR-PENDING-004 | Excepciones de alojamiento: habitaciones/camas, entradas/salidas, ocupaciones variables y servicios vinculados. | Deben concretarse sin eliminar la configuración por noche obligatoria. | Dominio de alojamiento, reglas de capacidad y costes. | Mantener P09; aplazar reglas concretas de ocupación o inclusión no acordadas. |
| BR-PENDING-005 | Criterios de alta/cualificación y avance de leads/oportunidades; estados comerciales, pérdida y reactivación. | El ciclo orientativo no define requisitos ni transiciones. | Reglas comerciales y state-machines.md. | No fijar umbrales, obligatoriedad global o automatismos de avance. |
| BR-PENDING-006 | Estados operativos y evidencias para preparación, listo, ejecución, incidencia y cierre por servicio/reserva. | Confirmación no equivale a ejecución y los requisitos varían por alcance. | Operación y state-machines.md. | No diseñar transiciones ni declarar efectos sin evidencia y criterio aplicable. |
| BR-PENDING-007 | Política de cancelaciones parciales/totales, plazos, penalizaciones y coordinación cliente/proveedor. | Una petición no determina obligaciones ni liberación de servicios. | Cambios, operación y cálculos de cancelación. | Registrar y verificar la petición; no imponer penalizaciones o efectos no aprobados. |
| BR-PENDING-008 | Depósitos, anticipos, garantías, importes/porcentajes y si condicionan alguna acción comercial. | No existe obligación universal aprobada ni umbral de conversión. | Cobros, conversión y condiciones de propuesta. | No exigir un anticipo concreto ni bloquear universalmente por su ausencia. |
| BR-PENDING-009 | Plazos y calendario de pago, vencimientos y tratamiento de impagos. | Determina cuándo puede exigirse un cobro y alertarse sobre retraso. | Cobros, tareas y alertas. | No inventar fechas, escalados ni consecuencias automáticas. |
| BR-PENDING-010 | Reembolsos: supuestos, autorización, importe, plazos y conciliación. | Cancelación y devolución son hechos diferentes. | Cobros, cancelaciones y operaciones sensibles. | No deducir derecho/importe/plazo de devolución ni ejecutarla sin autorización y datos materiales. |
| BR-PENDING-011 | Costes de modificación y compensaciones, repercusión al cliente y aceptación. | Un cambio operativo puede tener consecuencias comerciales y económicas. | Cambios, propuestas y costes. | No aplicar cargos, porcentajes o compensaciones supuestos. |
| BR-PENDING-012 | Facultades por rol para consultar, solicitar, aprobar, ejecutar, corregir y exportar; designación de responsables. | Los roles del producto no son una matriz completa de autorizaciones. | Permisos, tareas y aprobaciones humanas. | No conceder facultades sin base aprobada; conservar mínimo privilegio. |
| BR-PENDING-013 | Permisos por dato/documento/contexto y separación de funciones, respetando economía interna solo para administradores. | El acceso al expediente no equivale al acceso a todo su contenido. | Dominio, informes, historial, IA y exportaciones. | No ampliar visibilidad por falta de detalle; P11 no se reabre como opción. |
| BR-PENDING-014 | Periodos y finalidades de conservación para contactos, participantes, documentos, comunicaciones e historial. | Necesidad operativa y privacidad deben conciliarse por tipo de dato. | Ciclo de datos y procedimientos futuros. | No asumir retención indefinida ni establecer borrados periódicos inventados. |
| BR-PENDING-015 | Política de anonimización/eliminación, autorizaciones y evidencia compatible con historial. | Corregir o eliminar datos personales no debe ejecutarse sin política autorizada. | Privacidad, documentos e historial. | Aplazar procedimientos automáticos; no destruir historia ni retener datos sin justificación. |
| BR-PENDING-016 | Fuentes autorizadas de precios/costes, frecuencia de revisión, vigencia y reglas de estimación. | Una cifra antigua o estimada no acredita un precio aplicable hoy. | Propuestas, costes y versionado de cálculos. | Verificar la fuente/condición material; no inventar tarifas, vigencias ni renovaciones. |
| BR-PENDING-017 | Fuentes de disponibilidad, momento/frecuencia de consulta, vigencia y revalidación. | La capacidad externa puede cambiar y una copia no la garantiza. | Proveedores, disponibilidad e integraciones. | No confirmar disponibilidad con información no verificable o fuera de su alcance/vigencia. |
| BR-PENDING-018 | Existencia y condiciones de bloqueo/opción de capacidad, caducidad, liberación y efectos. | Una opción puede tener efectos distintos de consulta o confirmación. | Proveedores y operación futura. | No crear reservas de cupo ni plazos de opción que el proveedor no reconozca. |
| BR-PENDING-019 | Consentimiento y condiciones para telefonía con IA, grabaciones, transcripciones y uso de voces. | La capacidad prevista no autoriza tratar cualquier conversación. | Telefonía, ElevenLabs, comunicaciones y privacidad. | No activar esos tratamientos sin condiciones autorizadas. |
| BR-PENDING-020 | Retención, acceso, destino y eliminación de audios, transcripciones y contexto de IA. | Son datos con finalidades y destinatarios específicos. | IA, comunicaciones y privacidad. | No asumir grabación o conservación permanente; aplazar configuración de esos tratamientos. |
| BR-PENDING-021 | Arquitectura fiscal, validación normativa española, responsabilidad y evidencia de aprobación. | La facturación legal está expresamente condicionada por P16 y D008. | Facturación e integraciones fiscales posteriores. | Emisión legal y numeración fiscal bloqueadas; solo borradores permitidos claramente no fiscales. |
| BR-PENDING-022 | Moneda, impuestos aplicables, inclusión/exclusión en importes, redondeo y agregación. | Cambian totales y compromisos económicos. | Cálculos, propuestas y facturación futura. | No fijar moneda, tipos, precisión o fórmulas tributarias por suposición. |
| BR-PENDING-023 | Fórmulas y criterios de margen/beneficio, descuentos, comisiones y distribución de costes. | No hay una definición cuantitativa de rentabilidad aprobada. | Economía, informes y aceptación de cálculos. | No publicar resultados definitivos con fórmulas supuestas ni sustituir componentes por un total. |
| BR-PENDING-024 | Autoridad por dato entre Supabase y proveedores, precedencia y resolución de discrepancias. | La fuente canónica del CRM no gobierna todos los hechos externos. | Disponibilidad, pagos e integraciones. | Mantener fuentes e historia; no resolver conflictos automáticamente mediante una prioridad inventada. |
| BR-PENDING-025 | Información mínima por acción de contacto, verificación de identidad y criterios de duplicado/fusión. | Un nombre o canal compartido no demuestra identidad ni permite borrar antecedentes. | Contactos y dominio posterior. | No imponer campos exhaustivos ni fusionar/eliminar automáticamente sin reglas. |
| BR-PENDING-026 | Tratamiento de organizaciones y designación/facultades del responsable de grupo o representante. | Contacto, cliente, pagador y participantes pueden tener funciones distintas. | Contactos, aceptación, cambios y privacidad. | Registrar lo conocido; verificar autoridad material antes de comprometer al grupo. |
| BR-PENDING-027 | Evidencia de aceptación/rechazo, aceptación parcial, vigencia de propuestas y modalidades de conversión a reserva. | No están definidos canales probatorios ni altas directas, división o agrupación de ventas. | Propuestas, conversión y dominio conceptual. | Mantener lo aceptado y su origen; no inventar modalidades, cardinalidades o caducidades automáticas. |
| BR-PENDING-028 | Cuándo se requieren listas nominales, categorías, restricciones y validación de cambios de participantes. | La necesidad real varía por servicio/noche y afecta a privacidad y capacidad. | Participantes y alojamiento. | No exigir listas generales ni resolver discrepancias ajustando cantidades automáticamente. |
| BR-PENDING-029 | Contactos autorizados y evidencia/canales válidos para confirmaciones, cambios y cancelaciones de proveedores. | Una respuesta puede ser informativa, ambigua o de alcance limitado. | Proveedores, operación y documentos. | No tratar mensajes ambiguos como confirmaciones o cancelaciones efectivas. |
| BR-PENDING-030 | Evidencia y reglas de conciliación/asignación de cobros y pagos, parciales, duplicados y errores. | Recibido, asignado y pagado no se acreditan solo con una solicitud o adjunto. | Pagos, proveedores y economía. | Conservar el hecho y la discrepancia; no crear importes reales, asignaciones o ajustes supuestos. |
| BR-PENDING-031 | Evidencia de validez de documentos y de envío/recepción/aceptación de comunicaciones. | Un archivo o marca del canal no prueba todos esos hechos. | Documentos, comunicaciones y aceptación. | No otorgar validez o efecto vinculante por mera presencia de un adjunto o mensaje. |
| BR-PENDING-032 | Automatismos concretos, plantillas informativas autorizadas, responsables, reintentos, alertas y recuperación. | Los principios de auditoría no determinan disparadores, plazos ni efectos concretos. | Tareas, comunicaciones, IA y futuras Specs. | No activar automatismos no especificados; mantener aprobación humana para acciones sensibles. |

## Control de calidad y trazabilidad constitucional

Esta revisión comprueba el borrador contra las fuentes aprobadas; no constituye una aprobación humana, prueba de software ni autorización para avanzar a dominio, estados o implementación.

| Principio | Cobertura o límite conservado | Comprobación documental |
|---|---|---|
| P01 — Datos | BR-GEN-008, BR-AVAIL-004, BR-INT-002 | Supabase es canónico para el CRM sin sustituir autoridad externa. |
| P02 — GitHub | BR-GEN-008, BR-GOV-001 | Las reglas y decisiones deben quedar versionadas; no se usa conocimiento externo como política aprobada. |
| P03 — SDD | BR-GOV-002 | El borrador no inicia Specs ni implementación. |
| P04 — Especificar primero | BR-GOV-001–002 y decisiones pendientes | No se aprueban reglas abiertas ni se avanza de fase por silencio. |
| P05 — Datos verificables | BR-GEN-001–003, BR-LEAD-003, BR-PROP-003, BR-AVAIL-001–005 | Incertidumbre explícita y bloqueo solo de la acción materialmente dependiente. |
| P06 — Trazabilidad | BR-HIST-001–002, BR-AUTO-001 | Actor, motivo, momento, origen y vínculos conservados. |
| P07 — Historial | BR-PROP-006, BR-CHANGE-002, BR-HIST-003–004 | Corrección sin sobrescritura destructiva y privacidad compatible. |
| P08 — Dimensiones | BR-CONV-003, BR-SVC-003, BR-DIM-001–003 | Venta ganada puede coexistir con servicios pendientes; no se fijan estados finales. |
| P09 — Participantes | BR-PAX-001–006, BR-NIGHT-001–004 | Grupo, servicio y cada noche conservan su granularidad; no se fuerza igualdad. |
| P10 — Seguridad | BR-CON-006, BR-PAX-004, BR-SEC-001–004 | Mínimo privilegio, denegación por defecto y minimización, sin diseñar controles físicos. |
| P11 — Economía interna | BR-ECON-005, BR-HIST-004, BR-SEC-002 | Costes, márgenes, beneficios, comisiones y desgloses solo para administradores autorizados. |
| P12 — Secretos | BR-SEC-004, BR-AUTO-001 | Ninguna regla habilita guardar secretos en Git, documentos o registros compartidos. |
| P13 — Migraciones | BR-GOV-002; remisión íntegra a C P13 | No se modifica base de datos ni se redefine su excepción break-glass; sigue siendo obligación de la futura implementación. |
| P14 — Automatizaciones | BR-TASK-004, BR-AUTO-001–002 | Auditoría, errores, prevención de duplicados y recuperación explícitos. |
| P15 — IA | BR-COMM-003, BR-AI-001–003 | Aprobación humana concreta para lo sensible; plantillas informativas solo con Spec autorizante. |
| P16 — Facturación | BR-BILL-001–003 | Emisión y numeración fiscal bloqueadas hasta validación y aprobación documentadas. |
| P17 — Modularidad | BR-INT-001–004 | Sustitución, conciliación y límites de datos conservados sin diseñar integración técnica. |
| P18 — Verificación | Identificadores BR y condiciones de cada regla | Reglas referenciables por criterios de aceptación futuros; ninguna prueba de software se declara realizada. |
| P19 — Documentación | BR-GOV-001–002 y coordinación de fase | Se mantiene la distinción entre documento redactado, aprobado y funcionalidad implementada. |
| P20 — Reproducibilidad | BR-ECON-001–004, BR-PAX-006, BR-NIGHT-003 | Componentes, reglas/versiones, previsión/realidad y recálculos conservados; fórmulas abiertas no inventadas. |

Compatibilidad con producto: se mantienen los flujos y capacidades de Producto §1–18 y los criterios de §20, sin dar por resueltas las decisiones de §19. Las definiciones conceptuales de lead, representación, evidencias o cancelación no establecen umbrales ni políticas ausentes de esas fuentes.

Compatibilidad con decisiones: D001 conserva la identidad; D003–D004 las fuentes de verdad; D006 la secuencia SDD; D007 la separación de aplicaciones; D008 la prohibición fiscal; D009 la supervisión inicial. D002 y D005 permanecen vigentes y se reservan a la futura arquitectura, sin convertir el entorno de desarrollo en una regla funcional.

No se ha identificado una contradicción material que impida redactar este borrador. Las dudas de detalle se encuentran en BR-PENDING-001–032. Se señalan especialmente para revisión humana las interpretaciones sobre identidad/representación, evidencias de compromiso y permisos; no se consideran nuevas políticas aprobadas ni impiden revisar las partes ya sustentadas.

El siguiente paso es revisar y aprobar este documento. domain-model.md permanece pendiente y no se inicia en esta fase.
