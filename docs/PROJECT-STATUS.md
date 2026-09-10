# CRM HUESCAVENTURA OS — Project Status

Status: ACTIVE
Last updated: 2026-09-10

## Completed

- Repositorio Git inicializado.
- Repositorio GitHub conectado.
- Estructura SDD inicial creada.
- Constitution v1.0 aprobada.
- docs/product.md creado y aprobado.
- docs/business-rules.md v0.2 aprobado.
- docs/domain-model.md v0.1 aprobado tras revisión humana.
- docs/state-machines.md v0.1 aprobado tras revisión humana completa.
- D018 aprobada e incorporada: aceptación parcial seleccionable, reserva directa trazable y unidad del expediente V1; SM-PENDING-001 resuelto.
- D019 aprobada e incorporada: bases económicas reproducibles para promociones y cancelaciones; SM-PENDING-002 resuelto.
- D020 aprobada e incorporada: cómputo por días naturales, días límite completos y fechas de referencia por alcance; SM-PENDING-003 resuelto.
- Architecture v0.1 APPROVED tras revisión humana de 2026-09-10.
- ARCH-DEC-001 a ARCH-DEC-018 aprobadas como decisiones arquitectónicas de Architecture v0.1.

## In Progress

- SPEC 001 Core CRM — IN PROGRESS / DRAFT v0.1. Borrador completo en specs/001-core-crm/spec.md, pendiente de revisión y aprobación humana.
- plan.md, tasks.md e implementación — no iniciados; sus placeholders permanecen sin cambios.

## Pending

- Revisión humana de SPEC 001 Core CRM DRAFT v0.1; no aprobada y todavía no Ready for plan.md.
- ARCH-PENDING-001 abierto y no bloqueante para iniciar SPEC 001; bloquea únicamente la selección o implementación dependiente de Telefonía IA y WhatsApp.
- ARCH-PENDING-002 abierto y no bloqueante para iniciar SPEC 001; bloquea únicamente la aceptación o configuración definitiva de recuperación y continuidad de Production.

## Current Blockers

- ARCH-PENDING-001 activo y PENDING: Proveedor(es) definitivos de Telefonía IA y WhatsApp; no bloquea iniciar SPEC 001, pero bloquea únicamente la selección o implementación dependiente. Pueden ser comunes o diferentes; comparar ElevenLabs y al menos una alternativa real para Telefonía IA y analizar capacidades/proveedor de WhatsApp por separado; origen BR-PENDING-001/035 y D014.
- ARCH-PENDING-002 activo y PENDING: no bloquea iniciar SPEC 001, pero bloquea únicamente la aceptación o configuración definitiva de recuperación y continuidad de Production; origen ARCH-PENDING-002.
- No queda ningún SM-PENDING activo.
- Los demás pendientes heredados siguen vigentes en sus ámbitos. El alcance V1 de BR-PENDING-027 / DM-PENDING-001 queda concretado por D018, el de BR-PENDING-023 / DM-PENDING-003 por D019 y el de BR-PENDING-036 / DM-PENDING-004 por D020, sin habilitar operaciones extraordinarias ni alterar políticas aprobadas.

## Last Approved Commit

- 7d3a63ff47f841fc288cce63f1d5263d6a9975ac — docs: approve architecture v0.1

## Notes

docs/product.md y docs/business-rules.md v0.2 continúan APPROVED. docs/domain-model.md v0.1 continúa APPROVED; no se modifica su contenido ni su aprobación.

docs/state-machines.md v0.1 está APPROVED por revisión humana de 2026-09-09. La aprobación incluye expresamente D018, D019 y D020 y las resoluciones históricas de SM-PENDING-001/002/003. D018 permite aceptación parcial seleccionable y reserva directa trazable, manteniendo una Booking por Opportunity aceptada en V1. D019 fija las bases económicas reproducibles para promociones y cancelaciones. D020 calcula los umbrales por fechas/días naturales, concede completo el último día, fija las referencias por alcance y excluye cortes basados en la hora del servicio.

La fase Architecture v0.1 está completada y APPROVED por revisión humana de 2026-09-10. Sus 18 ARCH-DEC están aprobadas como decisiones arquitectónicas de esta versión y ARCH-PENDING-001/002 permanecen abiertos y PENDING. Ambos son no bloqueantes para iniciar posteriormente SPEC 001; ARCH-PENDING-001 bloquea únicamente la selección o implementación dependiente de Telefonía IA y WhatsApp, y ARCH-PENDING-002 bloquea únicamente la aceptación o configuración definitiva de recuperación y continuidad de Production. SPEC 001 Core CRM está IN PROGRESS / DRAFT v0.1 tras la redacción autorizada de su borrador; no se ha aprobado. plan.md, tasks.md e implementación continúan no iniciados. ARCH-PENDING-001/002 conservan sus ámbitos de bloqueo y no se han creado SPEC-PENDING nuevos. No se han redactado planes/tareas de implementación ni realizado código, SQL, migraciones, RLS, endpoints definitivos, configuración de proveedores o despliegues. D001–D020 se mantienen sin cambios. SM-PENDING-001/002/003 conservan sus resoluciones históricas y no queda ninguno activo. Business Rules y Domain Model conservan los textos previos de BR-PENDING-027/DM-PENDING-001, BR-PENDING-023/DM-PENDING-003 y BR-PENDING-036/DM-PENDING-004 como antecedentes; se interpretan junto con D018–D020 para sus alcances resueltos.

Este archivo debe actualizarse al finalizar cada fase relevante del proyecto.
