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
- docs/state-machines.md v0.1 aprobado tras revisión humana completa.
- D018 aprobada e incorporada: aceptación parcial seleccionable, reserva directa trazable y unidad del expediente V1; SM-PENDING-001 resuelto.
- D019 aprobada e incorporada: bases económicas reproducibles para promociones y cancelaciones; SM-PENDING-002 resuelto.
- D020 aprobada e incorporada: cómputo por días naturales, días límite completos y fechas de referencia por alcance; SM-PENDING-003 resuelto.

## In Progress

- docs/architecture.md v0.1 — DRAFT / In Progress: primera iteración publicada, pendiente de revisión humana.

## Pending

- Revisión humana de docs/architecture.md v0.1 DRAFT; Architecture no está aprobada.
- SPEC 001 Core CRM — no iniciado.

## Current Blockers

- Architecture v0.1 sigue DRAFT; requiere aprobación explícita antes de iniciar SPEC 001.
- ARCH-PENDING-001 activo: proveedor definitivo Telefonía IA + WhatsApp, tras comparar ElevenLabs y al menos una alternativa real; origen BR-PENDING-001/035 y D014.
- ARCH-PENDING-002 activo: decisión humana sobre RPO/RTO de producción y coste/complejidad de recuperación.
- No queda ningún SM-PENDING activo.
- Los demás pendientes heredados siguen vigentes en sus ámbitos. El alcance V1 de BR-PENDING-027 / DM-PENDING-001 queda concretado por D018, el de BR-PENDING-023 / DM-PENDING-003 por D019 y el de BR-PENDING-036 / DM-PENDING-004 por D020, sin habilitar operaciones extraordinarias ni alterar políticas aprobadas.

## Last Approved Commit

- 393a105bafd1f541098706048ac571a130c50e5e — docs: approve state machines v0.1

## Notes

docs/product.md y docs/business-rules.md v0.2 continúan APPROVED. docs/domain-model.md v0.1 continúa APPROVED; no se modifica su contenido ni su aprobación.

docs/state-machines.md v0.1 está APPROVED por revisión humana de 2026-09-09. La aprobación incluye expresamente D018, D019 y D020 y las resoluciones históricas de SM-PENDING-001/002/003. D018 permite aceptación parcial seleccionable y reserva directa trazable, manteniendo una Booking por Opportunity aceptada en V1. D019 fija las bases económicas reproducibles para promociones y cancelaciones. D020 calcula los umbrales por fechas/días naturales, concede completo el último día, fija las referencias por alcance y excluye cortes basados en la hora del servicio.

La fase State Machines está completada. La primera iteración de Architecture v0.1 está publicada en docs/architecture.md en estado DRAFT / In Progress, pendiente de revisión humana. Sus 17 ARCH-DEC son propuestas del borrador, no decisiones humanas APPROVED. ARCH-PENDING-001/002 permanecen activos. Architecture no está Completed ni APPROVED; SPEC 001 sigue no iniciado. No se han redactado planes/tareas de implementación ni realizado código, SQL, migraciones, RLS, endpoints definitivos, configuración de proveedores o despliegues. D001–D020 se mantienen sin cambios. SM-PENDING-001/002/003 conservan sus resoluciones históricas y no queda ninguno activo. Business Rules y Domain Model conservan los textos previos de BR-PENDING-027/DM-PENDING-001, BR-PENDING-023/DM-PENDING-003 y BR-PENDING-036/DM-PENDING-004 como antecedentes; se interpretan junto con D018–D020 para sus alcances resueltos.

Este archivo debe actualizarse al finalizar cada fase relevante del proyecto.
