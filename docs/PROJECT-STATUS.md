# CRM HUESCAVENTURA OS — Project Status

Status: ACTIVE
Last updated: 2026-09-09

## Completed

- Repositorio Git inicializado.
- Repositorio GitHub conectado.
- Estructura SDD inicial creada.
- Constitution v1.0 aprobada.
- docs/product.md creado y aprobado.
- docs/business-rules.md v0.2 aprobado.
- docs/domain-model.md v0.1 aprobado tras revisión humana.
- docs/state-machines.md v0.1 creado como DRAFT; redacción documental completada, sin aprobación global.
- D018 aprobada e incorporada: aceptación parcial seleccionable, reserva directa trazable y unidad del expediente V1; SM-PENDING-001 resuelto.
- D019 aprobada e incorporada: bases económicas reproducibles para promociones y cancelaciones; SM-PENDING-002 resuelto.

## In Progress

- Revisión humana pendiente de docs/state-machines.md DRAFT v0.1.

## Pending

- Revisar y aprobar docs/state-machines.md.
- architecture.md — bloqueado/no iniciado.
- SPEC 001 Core CRM — no iniciado.

## Current Blockers

- State Machines v0.1 requiere revisión y aprobación humana explícita. Publicar el borrador no lo aprueba ni habilita iniciar arquitectura.
- architecture.md permanece bloqueado/no iniciado hasta aprobar State Machines y recibir una instrucción humana específica para la siguiente fase.
- Queda un SM-PENDING abierto: SM-PENDING-003 (cómputo temporal ambiguo).
- Los demás pendientes heredados siguen vigentes en sus ámbitos. El alcance V1 de BR-PENDING-027 / DM-PENDING-001 queda concretado por D018 y el de BR-PENDING-023 / DM-PENDING-003 por D019, sin habilitar operaciones extraordinarias ni repartos no especificados.

## Last Approved Commit

- a3ff9406aa12046732bc1da0b5eae804cfba7136 — docs: approve domain model v0.1

## Notes

docs/product.md y docs/business-rules.md v0.2 continúan APPROVED. docs/domain-model.md v0.1 continúa APPROVED; no se modifica su contenido ni su aprobación.

docs/state-machines.md continúa DRAFT v0.1, actualizado el 2026-09-09 y pendiente de revisión humana global. D018 permite aceptar partes/modalidades/alcances expresamente seleccionables, exige nueva Proposal Version previa a Acceptance cuando la parte no era independiente/seleccionable y conserva la inmutabilidad histórica. La reserva directa del Administrador mantiene Opportunity → Proposal Version / condiciones → Acceptance → Booking. La regla normal es una Booking por Opportunity aceptada, con todas las modalidades del grupo y sin división/agrupación automática V1; una futura división explícita y trazable del Administrador requiere especificación posterior. D019 fija el precio real de la modalidad como base de promociones y cancelaciones individuales, prohíbe medias/prorrateos implícitos en precios grupales o packs y exige determinar primero el derecho contractual antes de ajustar fondos u obligaciones.

El siguiente paso es revisar y aprobar docs/state-machines.md. architecture.md permanece bloqueado/no iniciado. No se ha avanzado a arquitectura, Specs, planes, tareas de implementación, código ni despliegues. D001–D018 se mantienen sin cambios. Las aprobaciones concretas D018 y D019 no constituyen aprobación global de State Machines. SM-PENDING-001/002 conservan sus resoluciones históricas; solo SM-PENDING-003 sigue abierto. Business Rules y Domain Model conservan los textos previos de BR-PENDING-027/DM-PENDING-001 y BR-PENDING-023/DM-PENDING-003 como antecedentes; se interpretan junto con D018/D019 para sus alcances resueltos. Last Approved Commit conserva el commit de aprobación del documento Domain Model; no declara aprobado State Machines.

Este archivo debe actualizarse al finalizar cada fase relevante del proyecto.
