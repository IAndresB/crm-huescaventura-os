# CRM HUESCAVENTURA OS — Project Status

Status: ACTIVE
Last updated: 2026-09-08

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

## In Progress

- Revisión humana pendiente de docs/state-machines.md DRAFT v0.1.

## Pending

- Revisar y aprobar docs/state-machines.md.
- architecture.md — bloqueado/no iniciado.
- SPEC 001 Core CRM — no iniciado.

## Current Blockers

- State Machines v0.1 requiere revisión y aprobación humana explícita. Publicar el borrador no lo aprueba ni habilita iniciar arquitectura.
- architecture.md permanece bloqueado/no iniciado hasta aprobar State Machines y recibir una instrucción humana específica para la siguiente fase.
- Quedan dos SM-PENDING abiertos: SM-PENDING-002 (repartos económicos no aprobados) y SM-PENDING-003 (cómputo temporal ambiguo).
- Los demás pendientes heredados siguen vigentes en sus ámbitos. El alcance V1 de BR-PENDING-027 / DM-PENDING-001 queda concretado por D018 y la resolución de SM-PENDING-001, sin habilitar operaciones extraordinarias no especificadas.

## Last Approved Commit

- a3ff9406aa12046732bc1da0b5eae804cfba7136 — docs: approve domain model v0.1

## Notes

docs/product.md y docs/business-rules.md v0.2 continúan APPROVED. docs/domain-model.md v0.1 continúa APPROVED; no se modifica su contenido ni su aprobación.

docs/state-machines.md continúa DRAFT v0.1, actualizado el 2026-09-08 y pendiente de revisión humana global. D018 permite aceptar partes/modalidades/alcances expresamente seleccionables, exige nueva Proposal Version previa a Acceptance cuando la parte no era independiente/seleccionable y conserva la inmutabilidad histórica. La reserva directa del Administrador mantiene Opportunity → Proposal Version / condiciones → Acceptance → Booking. La regla normal es una Booking por Opportunity aceptada, con todas las modalidades del grupo y sin división/agrupación automática V1; una futura división explícita y trazable del Administrador requiere especificación posterior.

El siguiente paso es revisar y aprobar docs/state-machines.md. architecture.md permanece bloqueado/no iniciado. No se ha avanzado a arquitectura, Specs, planes, tareas de implementación, código ni despliegues. D001–D017 se mantienen sin cambios. La aprobación concreta de D018 no constituye aprobación global de State Machines. SM-PENDING-001 conserva su resolución histórica; solo SM-PENDING-002 y SM-PENDING-003 siguen abiertos. Business Rules y Domain Model conservan sus textos previos de BR-PENDING-027/DM-PENDING-001 como antecedentes; se interpretan junto con D018 para el alcance V1 resuelto. Last Approved Commit conserva el commit de aprobación del documento Domain Model; no declara aprobado State Machines.

Este archivo debe actualizarse al finalizar cada fase relevante del proyecto.
