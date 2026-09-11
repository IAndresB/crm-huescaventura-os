# CRM HUESCAVENTURA OS — Project Status

Status: ACTIVE
Last updated: 2026-09-11

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
- SPEC 001 Core CRM v0.1 APPROVED tras revisión humana de 2026-09-10.
- D022 aprobada: SPEC 001 Core CRM v0.1 queda completada y habilita derivar posteriormente plan.md.

## In Progress

- Fase 07 — Plan: specs/001-core-crm/plan.md DRAFT v0.1 / IN PROGRESS, borrador completo y contrastado, pendiente de revisión humana.
- Redacción y publicación documental autorizadas expresamente el 2026-09-11; el plan no está aprobado.
- tasks.md e implementación — no iniciados; tasks.md conserva su placeholder sin cambios.

## Pending

- Revisión humana de plan.md v0.1: PLAN-DEC-001 a PLAN-DEC-009 son propuestas, no decisiones aprobadas.
- PLAN-PENDING-001: tratamiento documental de AC-084, cuyo literal DRAFT/NOT APPROVED no coincide con D022; no invalida la aprobación de SPEC 001 ni impide redactar/publicar el plan.
- PLAN-PENDING-002: desempate y punto de redondeo a 2 decimales, solo para cálculos dependientes; D019/D020 no se reabren.
- PLAN-PENDING-003: perfil de sesión y recuperación de acceso del único Administrador antes del uso real.
- Aprobación del plan y autorización posterior antes de abrir tasks.md.
- ARCH-PENDING-001 permanece PENDING y bloquea únicamente la selección o implementación dependiente de Telefonía IA y WhatsApp.
- ARCH-PENDING-002 permanece PENDING y bloquea únicamente la aceptación o configuración definitiva de recuperación y continuidad de Production.

## Current Blockers

- El plan permanece NOT APPROVED. PLAN-PENDING-001 bloquea cerrar sin salvedades su revisión documental; PLAN-PENDING-002 bloquea cálculos definitivos dependientes en H1–H4; PLAN-PENDING-003 bloquea acceso real y preparación de Production H6. No bloquean esta entrega DRAFT.
- ARCH-PENDING-001 activo y PENDING: Proveedor(es) definitivos de Telefonía IA y WhatsApp; bloquea únicamente la selección o implementación dependiente. Pueden ser comunes o diferentes; comparar ElevenLabs y al menos una alternativa real para Telefonía IA y analizar capacidades/proveedor de WhatsApp por separado; origen BR-PENDING-001/035 y D014.
- ARCH-PENDING-002 activo y PENDING: bloquea únicamente la aceptación o configuración definitiva de recuperación y continuidad de Production; origen ARCH-PENDING-002.
- No queda ningún SM-PENDING activo.
- Los demás pendientes heredados siguen vigentes en sus ámbitos. El alcance V1 de BR-PENDING-027 / DM-PENDING-001 queda concretado por D018, el de BR-PENDING-023 / DM-PENDING-003 por D019 y el de BR-PENDING-036 / DM-PENDING-004 por D020, sin habilitar operaciones extraordinarias ni alterar políticas aprobadas.

## Last Approved Commit

- 91fc7527af9fd529e475116d1d212fd2328994d9 — docs: approve spec 001 core crm v0.1

## Notes

docs/product.md y docs/business-rules.md v0.2 continúan APPROVED. docs/domain-model.md v0.1 continúa APPROVED; no se modifica su contenido ni su aprobación.

docs/state-machines.md v0.1 está APPROVED por revisión humana de 2026-09-09. La aprobación incluye expresamente D018, D019 y D020 y las resoluciones históricas de SM-PENDING-001/002/003. D018 permite aceptación parcial seleccionable y reserva directa trazable, manteniendo una Booking por Opportunity aceptada en V1. D019 fija las bases económicas reproducibles para promociones y cancelaciones. D020 calcula los umbrales por fechas/días naturales, concede completo el último día, fija las referencias por alcance y excluye cortes basados en la hora del servicio.

La fase Architecture v0.1 está completada y APPROVED por revisión humana de 2026-09-10. Sus 18 ARCH-DEC están aprobadas como decisiones arquitectónicas de esta versión. SPEC 001 Core CRM v0.1 está APPROVED y COMPLETED tras revisión humana de 2026-09-10, registrada por D022, y queda Ready for plan.md. La aprobación no inició automáticamente plan.md. La instrucción humana de 2026-09-11 autoriza exclusivamente redactar, revisar y publicar el plan documental; plan.md está ahora DRAFT v0.1 / IN PROGRESS, sin aprobación. tasks.md e implementación continúan no iniciados. ARCH-PENDING-001/002 permanecen PENDING y conservan sus ámbitos exclusivos de bloqueo; los demás pendientes heredados mantienen sus ámbitos y no se han creado SPEC-PENDING nuevos. No se ha aprobado ninguna selección adicional de proveedor de Telefonía IA/WhatsApp ni diseño físico de SQL, RLS, endpoints, UI o infraestructura, y no se han realizado código, configuración de proveedores o despliegues. D001–D021 permanecen intactas y D022 registra únicamente esta aprobación. SM-PENDING-001/002/003 conservan sus resoluciones históricas y no queda ninguno activo. Business Rules y Domain Model conservan los textos previos de BR-PENDING-027/DM-PENDING-001, BR-PENDING-023/DM-PENDING-003 y BR-PENDING-036/DM-PENDING-004 como antecedentes; se interpretan junto con D018–D020 para sus alcances resueltos.

El plan propone siete hitos H0–H6, todos NOT STARTED, y documenta trazabilidad de 116 FR, 15 NFR, 92 AC, 52 DM-INV, 148 transiciones, 33 SM-FORB y 18 ARCH-DEC. Es cobertura documental, no pruebas de software ejecutadas; AC-084 conserva PLAN-OBS-001 y revisión pendiente. PLAN-PENDING-001/002/003 son pendientes del plan, no SPEC-PENDING nuevos. Last Approved Commit sigue siendo la aprobación de SPEC 001. DECISIONS.md conserva D001–D022 sin cambios; las fuentes APPROVED y tasks.md no se modifican.

Este archivo debe actualizarse al finalizar cada fase relevante del proyecto.
