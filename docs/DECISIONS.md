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
