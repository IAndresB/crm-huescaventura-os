# CRM HUESCAVENTURA OS — Product Definition

Status: DRAFT
Version: 0.1
Last updated: 2026-09-06

## 1. Identidad, visión y problema

CRM HUESCAVENTURA OS es el sistema interno para gestionar la relación comercial y la operación de los servicios de Huescaventura. Su visión es ofrecer una visión única, fiable y trazable de cada cliente, oportunidad, reserva y servicio.

Resuelve la dispersión de información entre conversaciones, hojas de cálculo, calendarios, proveedores, pagos y herramientas externas. Permite saber qué se ofreció, qué se aceptó, qué falta por preparar, quién debe actuar y qué se comunicó, sin mezclar hechos comerciales con tareas operativas ni perder el historial.

Este documento define qué producto se construye y para qué; no es una arquitectura, esquema de base de datos ni especificación técnica.

## 2. Objetivos del producto

- Centralizar clientes, leads y oportunidades desde el primer contacto hasta el seguimiento posterior.
- Convertir propuestas aceptadas en reservas con servicios y participantes correctamente definidos.
- Separar el ciclo comercial de la preparación y ejecución operativa.
- Dar visibilidad de tareas, fechas, confirmaciones, pagos, costes y riesgos según permisos.
- Conservar un historial reconstruible de decisiones, cambios, comunicaciones y hechos.
- Reducir trabajo repetitivo mediante automatizaciones auditables e IA supervisada.
- Integrar proveedores y canales externos modularmente, manteniendo Supabase como fuente de verdad.

## 3. Usuarios y roles

Los usuarios actuales son el propietario o responsable del proyecto, equipo comercial, equipo de operaciones, administración autorizada y colaboradores internos con acceso limitado. El propietario define prioridades y aprueba; comercial gestiona oportunidades y propuestas; operaciones coordina servicios y proveedores; administración controla pagos, costes y rentabilidad.

En el futuro podrán existir accesos para clientes, responsables de grupo, proveedores y colaboradores externos, siempre mediante una Spec que defina propósito, permisos y datos visibles. Un rol previsto no autoriza todavía su acceso.

## 4. Experiencia de usuario

El usuario debe distinguir hechos confirmados, propuestas, estimaciones y datos pendientes; entender qué requiere acción; ver contexto antes de actuar; conocer la procedencia de datos integrados; y encontrar cambios importantes en el historial. Las acciones sensibles deben mostrar sus consecuencias y pedir confirmación. La experiencia debe funcionar en Work Local y el acceso remoto previsto.

## 5. Alcance funcional general

El CRM cubrirá contactos, leads, oportunidades, propuestas, reservas, servicios, participantes, proveedores, disponibilidad, confirmaciones, pagos, costes, tareas, calendario, comunicaciones, documentos, historial, automatizaciones e integraciones. Supabase será la fuente de verdad de los datos; GitHub, del código, documentación, Specs, migraciones e historial de desarrollo.

## 6. Leads, oportunidades y ciclo comercial

Se registrarán origen, necesidades, fechas, tamaño previsto, servicios de interés y responsable. Una oportunidad podrá avanzar, quedar en seguimiento, perderse o reactivarse conservando comunicaciones y motivos.

El ciclo previsto es captación, cualificación, descubrimiento, propuesta, seguimiento, aceptación o pérdida y conversión. Los estados y transiciones detallados se definirán en business-rules.md y state-machines.md. Datos desconocidos solo bloquearán las decisiones o acciones que dependan materialmente de ellos; las partes independientes podrán continuar.

## 7. Propuestas, alternativas y conversión

Se podrán preparar varias propuestas con servicios, fechas, participantes previstos, condiciones y precios de fuentes verificables. Las alternativas se conservarán sin destruir propuestas anteriores. Una aceptación conservará contenido y momento; cambios posteriores serán revisiones, ajustes o nuevas alternativas.

La aceptación podrá convertirse en reserva manteniendo el vínculo con la oportunidad y la propuesta. La conversión trasladará lo acordado y señalará lo pendiente de confirmación. Una venta puede estar comercialmente ganada mientras sus servicios siguen operativamente pendientes.

## 8. Bookings, reservas y servicios

Una reserva será el expediente de una experiencia o conjunto de servicios, con fechas, responsables, servicios contratados, estados comercial y operativo, pagos, documentos, comunicaciones y proveedores. Se conservarán cambios, cancelaciones, ajustes e incidencias; no se confundirá solicitud, opción, confirmación y cancelación.

Podrá componerse de actividades, transporte, restauración, alojamiento, guías, entradas, materiales u otros servicios. Cada servicio tendrá sus propias fechas, estado, proveedor, participantes, disponibilidad, costes y confirmaciones.

## 9. Participantes

El grupo tendrá un número de referencia, pero cada servicio podrá tener selección y cantidad diferentes. Actividades, restaurantes, transporte y proveedores podrán recibir listas distintas. En alojamiento la ocupación se configurará por noche y podrá variar durante la estancia. Nunca se asumirá que el total del grupo coincide con todos los servicios; los totales se derivarán del detalle.

## 10. Proveedores, disponibilidad y operación

Se registrarán proveedores, contactos, servicios, condiciones conocidas, disponibilidad comunicada, solicitudes, respuestas, confirmaciones, costes previstos y reales. La procedencia y fecha serán visibles cuando corresponda. Una respuesta ambigua no será confirmación.

El seguimiento operativo mostrará preparación, dependencias, confirmaciones, estado listo, ejecución e incidencias. Fechas y disponibilidad externas se distinguirán de datos confirmados. El estado comercial y el operativo son independientes: uno no cambiará el otro sin regla explícita, probada y auditable.

## 11. Pagos, costes y rentabilidad

Se registrarán importes previstos, pagos recibidos, fechas, métodos, referencias, devoluciones y situación de cobro. También costes previstos y reales de servicios y proveedores, con documentos y diferencias visibles.

Costes, márgenes, beneficios, comisiones y desgloses serán visibles solo para administradores autorizados, también en API, informes, exportaciones, automatizaciones y contexto de IA. Todo importe deberá poder reconstruirse desde cantidades, precios unitarios, descuentos, reglas y costes; los totales derivados no sustituyen componentes y los recálculos materiales son trazables.

El CRM no emitirá facturas legales hasta validar la arquitectura fiscal conforme a normativa española. Los borradores se identificarán como no fiscales.

## 12. Tareas, calendario y alertas

Se crearán tareas vinculadas a oportunidades, reservas, servicios, proveedores o clientes, con responsable, fecha, prioridad, contexto y resultado. Recordatorios y alertas indicarán causa, urgencia y destinatario. Las automatizaciones deberán señalar su origen y evitar duplicados.

El calendario reunirá seguimientos, vencimientos, pagos, llegadas, actividades, confirmaciones y tareas. Una fecha no confirmada se mostrará como tal.

## 13. Comunicaciones y canales

Se registrarán correos, llamadas, WhatsApp y otros canales aprobados, vinculados a contacto, oportunidad, reserva o servicio. Se podrán preparar mensajes, plantillas, solicitudes y respuestas para clientes y proveedores.

Las comunicaciones informativas basadas en plantillas previamente aprobadas podrán automatizarse si una Spec lo autoriza. Las comunicaciones sensibles o vinculantes requerirán aprobación humana durante la primera fase. WhatsApp será una integración modular y no la fuente de verdad de la reserva.

## 14. Telefonía, IA y automatizaciones

ElevenLabs y telefonía son integraciones previstas para asistir llamadas, transcribir, resumir y preparar acciones. No se asume grabación o conservación sin resolver consentimiento, privacidad y retención.

La IA podrá resumir, clasificar, buscar, proponer, redactar y detectar incoherencias. Durante la primera fase una persona deberá aprobar cambios de precios o disponibilidad, reservas, cancelaciones, cobros, reembolsos, revelación de datos personales, permisos y comunicaciones vinculantes. La propuesta, aprobación y resultado serán trazables.

Cada automatización tendrá responsable, disparador, permisos, versión, entradas, efectos, reintentos, idempotencia, auditoría, errores y recuperación. Las acciones sensibles seguirán la aprobación exigida por la Constitución.

## 15. Timeline, documentos y archivos

Cada expediente tendrá una línea temporal de eventos comerciales, operativos, comunicaciones, tareas, pagos, documentos, confirmaciones y cambios. Los hechos históricos no se sobrescribirán; las correcciones serán versiones, eventos, ajustes o compensaciones.

Se asociarán propuestas, confirmaciones, contratos, justificantes, listados y documentos de proveedores con procedencia, fecha y permisos. Un archivo externo no sustituye al registro estructurado ni se considera válido sin confirmación.

## 16. Privacidad, permisos e integraciones

Se aplicarán mínimo privilegio, denegación por defecto, minimización y controles en servidor y base de datos. La interfaz no es una barrera de seguridad. Clientes, participantes, comunicaciones y documentos solo serán visibles a quienes los necesiten.

Se prevén módulos para WhatsApp, ElevenLabs, telefonía, web pública, pagos, Avaibook y facturación. Cada módulo tendrá contrato, autenticación, mapeo, errores, conciliación y sustitución definidos en su Spec. Las reglas centrales no dependerán de un proveedor.

La futura web pública huescaventura.com y el CRM serán aplicaciones y repositorios separados. Podrán compartir backend/API con permisos explícitos; la web no accederá a costes, márgenes, beneficios ni operaciones internas.

## 17. Alcance previsto de V1

La V1 priorizará contactos, leads, oportunidades, ciclo comercial, propuestas, conversión, reservas compuestas por servicios, participantes por servicio y por noche, proveedores, confirmaciones, tareas, calendario básico, comunicaciones, documentos, pagos, costes, rentabilidad restringida, timeline, automatizaciones auditables, IA supervisada y una base modular para integraciones prioritarias.

## 18. Fuera del alcance inicial

Quedan fuera, salvo nueva Spec: web pública completa; ERP o contabilidad general; motor propio de facturación fiscal; autonomía total de IA; sustitución de la gestión oficial de disponibilidad externa; aplicación móvil nativa independiente; nóminas o RR. HH.; analítica avanzada no sustentada en datos; e integraciones sin responsable, contrato y criterios de seguridad.

## 19. Decisiones pendientes y limitaciones

- Prioridad de canales e integraciones V1, especialmente WhatsApp, pagos, Avaibook, ElevenLabs y calendario.
- Catálogo de servicios, unidades de capacidad y excepciones de alojamiento por noche.
- Estados y transiciones detallados comerciales y operativos.
- Cancelaciones, depósitos, plazos, reembolsos y costes de cambio.
- Roles, permisos por campo, retención y anonimización.
- Fuentes y frecuencia de precios, disponibilidad y costes.
- Consentimiento y conservación de telefonía, transcripciones e IA.
- Arquitectura fiscal y validación española previa a facturación legal.
- Frontera entre datos maestros de Supabase y confirmaciones de proveedores.
- Redondeo, impuestos, moneda y criterios cuantitativos de rentabilidad.

Estas cuestiones no bloquean la definición general, pero deberán resolverse en la Spec o documento correspondiente antes de implementar su comportamiento. Se distinguen de las decisiones aprobadas en docs/DECISIONS.md.

## 20. Criterios de éxito

El producto tendrá éxito cuando el equipo pueda encontrar el contexto completo; distinguir ofrecido, aceptado y pendiente; separar estados comerciales y operativos; representar participantes por servicio y noche; confirmar servicios sin inventar disponibilidad; reproducir y proteger pagos y rentabilidad; reconstruir historial; detectar tareas y riesgos; usar IA y automatizaciones con supervisión y auditoría; sustituir integraciones sin perder datos; completar flujos V1 con pruebas y criterios de aceptación; y mantener documentación coherente con el comportamiento real.

La aprobación de este documento no aprueba reglas detalladas, arquitectura ni implementación. Esos artefactos seguirán el orden SDD y respetarán esta definición.
