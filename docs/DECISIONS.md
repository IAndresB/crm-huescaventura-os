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
