# CRM HUESCAVENTURA OS — Decisions

Este archivo registra decisiones importantes aprobadas del proyecto.

## D001 — Nombre oficial del proyecto

Date: 2026-09-05
Status: APPROVED
Decision: CRM HUESCAVENTURA OS
Reason: Establecer el nombre oficial y uniforme del proyecto.
Impact: Toda la documentación y comunicación del proyecto utilizará este nombre.

## D002 — Arquitectura de desarrollo

Date: 2026-09-05
Status: APPROVED
Decision: Work Local en Mac como entorno principal de desarrollo, con acceso remoto desde iPhone/iPad.
Reason: Mantener un entorno local principal con acceso remoto para supervisión y coordinación.
Impact: El desarrollo y la ejecución principal de Work se realizarán en el Mac local.

## D003 — Repositorio

Date: 2026-09-05
Status: APPROVED
Decision: GitHub es la fuente de verdad del código y documentación.
Reason: Disponer de una referencia versionada y compartida para el proyecto.
Impact: El código y la documentación aprobados deberán reflejarse en el repositorio GitHub.

## D004 — Datos

Date: 2026-09-05
Status: APPROVED
Decision: Supabase será la fuente de verdad de los datos del CRM.
Reason: Centralizar los datos canónicos del CRM en una plataforma definida.
Impact: Las interfaces e integraciones utilizarán Supabase como registro canónico.

## D005 — Despliegue

Date: 2026-09-05
Status: APPROVED
Decision: Vercel será la plataforma principal de despliegue de la aplicación.
Reason: Definir la plataforma principal para publicar la aplicación.
Impact: La arquitectura y los procesos de despliegue priorizarán la compatibilidad con Vercel.

## D006 — Metodología

Date: 2026-09-05
Status: APPROVED
Decision: El proyecto seguirá SDD para funcionalidades importantes.
Reason: Asegurar que las funcionalidades importantes se especifiquen antes de implementarse.
Impact: Las funcionalidades importantes deberán contar con Spec, plan y tareas trazables.

## D007 — Aplicaciones separadas

Date: 2026-09-05
Status: APPROVED
Decision: La futura web pública huescaventura.com y el CRM serán aplicaciones/repositorios separados, compartiendo backend/API cuando corresponda.
Reason: Mantener separados los objetivos y ciclos de evolución de la web pública y el CRM.
Impact: Cada aplicación tendrá su propio ámbito de código y documentación, con contratos compartidos cuando proceda.

## D008 — Facturación

Date: 2026-09-05
Status: APPROVED
Decision: El CRM no emitirá facturas legales hasta completar la validación específica de normativa y arquitectura fiscal.
Reason: Condicionar la facturación legal a una validación fiscal y arquitectónica completa.
Impact: El CRM no podrá emitir facturas legales mientras esa validación no esté aprobada y documentada.

## D009 — Supervisión humana inicial

Date: 2026-09-05
Status: APPROVED
Decision: Las reservas, modificaciones y comunicaciones sensibles preparadas por IA requerirán revisión humana en la primera fase.
Reason: Mantener supervisión humana sobre acciones sensibles durante la primera fase.
Impact: La IA podrá preparar propuestas, pero las acciones sensibles requerirán revisión humana antes de ejecutarse.

## D010 — Catálogo, cantidades y packs configurables

Date: 2026-09-06
Status: APPROVED
Decision: El catálogo, categorías/atributos, públicos recomendados, unidades, formas de precio, tarifas y packs serán configurables y versionados. Se admiten modalidades distintas dentro de una propuesta y precios comerciales manuales trazables, preservando composición, cantidades por servicio/noche y economía interna. Se adopta EUR, indicación explícita del tratamiento IVA y 2 decimales para importes visibles/cobrados, sin redondeo comercial automático del pack.
Reason: Representar el negocio real sin imponer precio por persona ni un catálogo rígido.
Impact: [business-rules.md](business-rules.md), §§8–10, 15 y 25–26, recoge el detalle aprobado, las cifras conocidas y los límites de datos aún no aportados. Los cambios no alteran versiones históricas ni sustituyen validación fiscal.

## D011 — Política comercial, aceptación, cobros y cancelaciones

Date: 2026-09-06
Status: APPROVED
Decision: Se aprueban los requisitos mínimos lead → oportunidad sin scoring obligatorio, interlocutor principal habilitado para aceptar, evidencias multicanal y términos inmutables. Política general de cobro 50 % al confirmar y 50 % a 7 días; reservas a menos de 7 días requieren 100 % antes de confirmar salvo excepción autorizada. Se aprueban validez configurable de 7 días, seguimiento supervisado, promoción novio/a gratis bajo sus condiciones y cancelaciones diferenciadas por causante y por intervalos.
Reason: Formalizar el funcionamiento comercial indicado por el propietario durante la revisión humana.
Impact: [business-rules.md](business-rules.md), §§3–6, 14, 16 y 25, conserva condiciones, umbrales, excepciones y evidencias. Aceptación comercial no implica pago ni confirmación operativa. No se introducen cargos o repartos económicos no definidos.

## D012 — Operación por servicio y cierres independientes

Date: 2026-09-06
Status: APPROVED
Decision: Reservas y servicios mantienen estados base separados del comercial, confirmaciones verificables y bloqueos temporales. Se permiten horarios alternativos, ubicaciones variables, distribución de alojamiento opcional, fianzas configurables e incidencias. Se separan cierres comercial, operativo y económico; solo su resolución permite Cerrada / Histórico.
Reason: Coordinar participantes y proveedores sin confundir venta aceptada, prestación realizada y obligaciones económicas resueltas.
Impact: [business-rules.md](business-rules.md), §§7–13, 17, 28 y 30, registra reglas/estados base y alertas. No se redactan todavía máquinas de estados detalladas. Finalización operativa no oculta facturas, pagos o incidencias pendientes.

## D013 — Fondos de clientes, honorarios y Tararí con validación fiscal pendiente

Date: 2026-09-06
Status: APPROVED
Decision: Se documenta el modelo operativo indicado por el propietario y su gestor: proveedores externos facturan al cliente; Huescaventura administra y paga con fondos de este, separando suplidos/fondos ajenos y honorarios propios. La rentabilidad operativa se basa principalmente en honorarios propios menos costes propios atribuibles. Tararí, bajo el mismo titular/NIF, es servicio interno y no proveedor externo/suplido ni factura interna por defecto.
Reason: Evitar tratar automáticamente todo el dinero gestionado como ingreso propio y conservar conciliación y documentación por servicio.
Impact: [business-rules.md](business-rules.md), §§15, 23, 26–28, mantiene la validación profesional pendiente del sistema de suplidos, arquitectura fiscal y tratamiento exacto de Tararí. Las condiciones futuras de la web deberán incorporar mandato expreso de gestión/administración/pago por cuenta del cliente y conservar la versión aceptada; no se modifica esa web ahora. D008 y P16 siguen íntegros.

## D014 — Prioridad y límites de integraciones

Date: 2026-09-06
Status: APPROVED
Decision: Orden previsto: Telefonía IA + WhatsApp; Email; Calendario; Pagos; Web pública; Avaibook. Telefonía/WhatsApp comparten contexto y timeline pero permanecen desacoplados y sustituibles. Antes de elegir proveedor definitivo se probarán ElevenLabs y al menos una alternativa real. Calendario propio/Supabase es referencia operacional y Google Calendar auxiliar; Avaibook V1 es solo lectura/consulta. Transferencia bancaria es el medio actual y el proveedor de tarjeta queda pendiente.
Reason: Priorizar la atención comercial manteniendo control de cambios externos y capacidad de sustitución.
Impact: [business-rules.md](business-rules.md), §§14, 17–18 y 24, define comparativa, formularios futuros directos al CRM y validación previa de capacidades reales. PLAUD se trata como fuente de comunicaciones, no necesariamente conector prioritario separado. No se configura ninguna integración en esta fase.

## D015 — Un único usuario operativo en V1 y roles futuros

Date: 2026-09-06
Status: APPROVED
Decision: En V1 solo operará el Administrador / Propietario, con acceso y gestión de todo el CRM. Se mantienen preparados los roles Comercial, Operaciones, Administración y Colaborador interno limitado, sin activar permisos granulares innecesarios antes de necesitarlos.
Reason: Ajustar la primera versión al uso real sin impedir la evolución posterior del equipo.
Impact: [business-rules.md](business-rules.md), §22, concreta este alcance sobre los perfiles de producto. Economía interna sigue reservada a administradores; los terceros no ganan acceso por relación con un expediente. El detalle de permisos futuros queda pendiente y se mantienen mínimo privilegio y obligaciones constitucionales.

## D016 — Comunicaciones, IA supervisada y automatizaciones auditables

Date: 2026-09-06
Status: APPROVED
Decision: Conservar originales de comunicaciones cuando sea viable y autorizado; en V1 no almacenar audio por defecto, siendo suficientes transcripción y resumen. PLAUD Pro es fuente válida para llamadas atendidas personalmente y se conserva su transcripción original. La IA puede extraer datos claros y preparar acciones, pero no sobrescribir confirmaciones manuales ni ejecutar acciones sensibles sin aprobación. Avisos internos V1: todos en CRM, Críticos/Importantes en WhatsApp, ninguno por email, dirigidos al Administrador/Propietario.
Reason: Aprovechar asistencia y seguimiento sin perder contexto, privacidad ni control sobre compromisos.
Impact: [business-rules.md](business-rules.md), §§17–19, define tareas automáticas, seguimiento de propuestas supervisado, email comercial futuro info@huescaventura.com y fallos/reintentos seguros. La selección tecnológica y requisitos legales de conservación/consentimiento siguen pendientes. P14, P15 y D009 no se rebajan.

## D017 — Identidades, documentación e historial recuperable

Date: 2026-09-06
Status: APPROVED
Decision: Separar contactos y organizaciones, conservar ambos historiales y fusionar duplicados solo mediante acción humana. Documentación exigible configurable por servicio, identificadores humanos anuales únicos/no reutilizables y versiones inmutables de propuestas/condiciones. Priorizar archivado recuperable; no eliminar físicamente registros con historia relevante mediante el flujo normal.
Reason: Mantener trazabilidad de relaciones, compromisos, cambios y evidencias sin imponer datos personales innecesarios.
Impact: [business-rules.md](business-rules.md), §§3, 20–22 y 29–30, conserva auditoría y límites de eliminación/anonimización. Plazos RGPD y política detallada siguen pendientes de revisión legal; no se realizan borrados automáticos importantes sin regla aprobada.

## D018 — Aceptación parcial, reserva directa y unidad del expediente V1

Date: 2026-09-08
Status: APPROVED
Decision: Se permite aceptación parcial únicamente cuando la Proposal Version contiene partes, modalidades o alcances expresamente seleccionables; Acceptance identifica exactamente lo aceptado. Si la parte solicitada no estaba definida como independiente o seleccionable, debe generarse una nueva Proposal Version antes de registrar Acceptance. Nunca se modifican retrospectivamente una versión fijada ni una Acceptance histórica. El Administrador/Propietario puede utilizar en V1 una futura acción «Crear reserva directa» que genere o registre la cadena mínima Opportunity → Proposal Version / condiciones → Acceptance → Booking, conservando la relación de Proposal Version con Proposal y la evidencia comercial real. La regla normal es 1 Opportunity aceptada → 1 Booking → N Booking Services / modalidades / noches / cantidades; distintas modalidades del mismo grupo permanecen en una única Booking. No se realiza división ni agrupación automática de Opportunities o Bookings en V1. Una futura división de Booking solo podrá realizarse mediante acción explícita y trazable del Administrador y deberá especificarse posteriormente; no se diseña esa operación extraordinaria aquí.
Reason: Resolver la revisión humana de SM-PENDING-001, permitir selección comercial explícita y evitar trabajo manual innecesario al Administrador sin saltarse hechos, evidencias ni invariantes del dominio.
Impact: [state-machines.md](state-machines.md), §§4–6, 12, 14 y 16–20, incorpora esta decisión, actualiza las guardas de aceptación/conversión y retira SM-PENDING-001 de pendientes activos, conservando su resolución. D018 concreta el alcance V1 antes diferido por BR-PENDING-027 y DM-PENDING-001; sus textos anteriores permanecen como antecedentes en Business Rules v0.2 y Domain Model v0.1, ambos APPROVED y sin cambios en esta corrección. No impone una restricción global para toda evolución futura ni autoriza división/agrupación extraordinarias por analogía. La acción interna del Administrador no sustituye Acceptance del cliente ni acredita pago o confirmación operativa. Permanecen abiertos SM-PENDING-002 y SM-PENDING-003 y los demás límites no resueltos. D001–D017 permanecen intactos. State Machines sigue DRAFT v0.1, pendiente de aprobación global; no se diseña UI, tablas, API, arquitectura ni implementación.

## D019 — Bases económicas reproducibles para promociones y cancelaciones

Date: 2026-09-09
Status: APPROVED
Decision: En una promoción de novi@ gratis con varias modalidades, la gratuidad equivale al precio final por persona de la modalidad concreta asignada al/a la novi@, que debe identificarse antes del efecto económico definitivo; no se usan medias, modalidades elegidas automáticamente ni repartos proporcionales. En la cancelación total de una persona con precio por persona, la base es el precio real de su modalidad y sobre ella se aplican sin cambios los intervalos aprobados: ≥7 días, devolución correspondiente; ≥3 y <7 días, retención/cobro del 50 %; <3 días, retención/cobro del 100 %. Un precio fijo/grupal no se reparte automáticamente entre participantes y permanece según el compromiso salvo regla contractual aprobada, reducción real/verificada o ajuste comercial explícito y trazable aprobado por el Administrador. La cancelación parcial de un componente usa su valor comercial atribuible y verificable; si no existe distribución aprobada/verificable, el importe requiere determinación económica explícita del Administrador antes de aplicar devolución, retención, nueva obligación o ajuste, mientras los efectos operativos independientes pueden avanzar. El derecho contractual se determina antes de ajustar fondos, conciliación, asignaciones, Refund u obligaciones, con reparto reproducible y trazable y sin prorrateos implícitos.
Reason: Resolver SM-PENDING-002 con bases económicas verificables para los casos multimodales, individuales, grupales y parciales, sin inventar distribuciones ni confundir la ubicación física de los fondos con el derecho del cliente.
Impact: [state-machines.md](state-machines.md), §§5, 9, 11–12 y 16–20, incorpora las nuevas guardas y efectos en SM-RF-02, SM-RC-02 y SM-MO-05/06, retira SM-PENDING-002 de pendientes activos y conserva su resolución histórica. BR-PENDING-023 y DM-PENDING-003 permanecen sin cambios en sus documentos APPROVED y se interpretan junto con D019 para este alcance resuelto. SM-PENDING-003 continúa íntegramente abierto. D001–D018 permanecen intactos. State Machines sigue DRAFT v0.1 y pendiente de aprobación global; no se diseña arquitectura ni implementación.

## D020 — Cómputo temporal por días naturales y alcance

Date: 2026-09-09
Status: APPROVED
Decision: Los umbrales temporales comerciales y operativos de este ámbito se calculan exclusivamente por fechas y días naturales, usando la fecha local del servicio/alcance y concediendo completo el último día de cada intervalo. La zona horaria solo determina la fecha local; la hora del servicio no crea un corte dentro del día y no se usan equivalentes de 168/72 horas ni horas ficticias. Para el saldo general 50 % restante a 7 días y para la cifra final global, la referencia por defecto es la fecha del primer servicio contratado de Booking; una cifra final específica usa la fecha de su alcance y no se propaga. En cancelación total de Booking se usa su primer servicio contratado; en cancelación de la modalidad/participación completa de una persona, el primer servicio de esa modalidad; en cancelación de Booking Service, la fecha del servicio; y en alojamiento/noche u otro alcance específico, la fecha de inicio del alcance. Prevalece una referencia contractual expresa y válida diferente. Los intervalos permanecen: ≥7 días, devolución correspondiente; ≥3 y <7 días, retención/cobro del 50 %; <3 días, retención/cobro del 100 %. Los días situados exactamente 7 y 3 días antes pertenecen completos al primer y segundo intervalo respectivamente. Un cambio de fecha reevalúa los plazos afectados con historial; un cambio de hora dentro de la misma fecha no los modifica.
Reason: Resolver SM-PENDING-003 con una convención simple, flexible y reproducible para reservas multifecha, sin alterar las políticas económicas ni introducir cortes horarios ficticios.
Impact: [state-machines.md](state-machines.md), §§2, 5–6, 9, 11–13 y 16–20, incorpora D020 en SM-EP-01/03, SM-BK-04, SM-RF-02, Task/avisos y cifra final; retira SM-PENDING-003 de pendientes activos y conserva su resolución histórica. BR-PENDING-036 y DM-PENDING-004 permanecen sin cambios en sus documentos APPROVED y se interpretan junto con D020 para este alcance resuelto. No queda ningún SM-PENDING activo. D001–D019 permanecen intactos. State Machines sigue DRAFT v0.1 y pendiente de aprobación global; no se diseña arquitectura ni implementación.

## D021 — Architecture v0.1 aprobada

Date: 2026-09-10
Status: APPROVED
Decision: Architecture v0.1 queda APPROVED tras revisión humana. ARCH-DEC-001 a ARCH-DEC-018 quedan aprobadas como decisiones arquitectónicas de esta versión, referenciadas en [architecture.md](architecture.md). ARCH-PENDING-001 y ARCH-PENDING-002 permanecen abiertos y PENDING.
Reason: Registrar formalmente la aprobación humana de la fase Architecture sin duplicar sus decisiones técnicas ni iniciar la fase siguiente.
Impact: Ambos pendientes son no bloqueantes para cerrar Architecture y para poder iniciar SPEC 001 posteriormente. ARCH-PENDING-001 bloquea únicamente la selección o implementación dependiente de Telefonía IA y WhatsApp. ARCH-PENDING-002 bloquea únicamente la aceptación o configuración definitiva de recuperación y continuidad de Production. Esta decisión no inicia SPEC 001 ni autoriza implementación.

## D022 — SPEC 001 Core CRM v0.1 aprobada

Date: 2026-09-10
Status: APPROVED
Decision: SPEC 001 Core CRM v0.1 queda APPROVED tras revisión humana completa. Sus requisitos funcionales, criterios de aceptación, requisitos no funcionales, guardas, invariantes, fronteras, criterios de concurrencia/idempotencia, Human Approval, seguridad, economía, historial y trazabilidad constituyen la especificación autorizada del Core CRM V1 para derivar posteriormente plan.md. La aprobación de SPEC 001 NO inicia automáticamente plan.md, que necesita una instrucción humana posterior. ARCH-PENDING-001 y ARCH-PENDING-002 permanecen PENDING y los pendientes heredados conservan su alcance. No se ha aprobado ninguna selección de proveedor ni diseño físico de SQL, RLS, endpoints, UI o infraestructura. No se ha iniciado implementación.
Reason: Cerrar formalmente la fase de especificación funcional/técnica verificable antes de planificación, conforme a la Constitución y al orden SDD aprobado.
Impact: [specs/001-core-crm/spec.md](../specs/001-core-crm/spec.md) pasa de DRAFT a APPROVED v0.1 y SPEC 001 queda completada. La siguiente fase autorizable pasa a ser plan.md; plan.md, tasks.md e implementación continúan no iniciados hasta nueva instrucción humana. D001–D021 permanecen intactas.
