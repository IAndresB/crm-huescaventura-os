# CRM HUESCAVENTURA OS — Project Status

Status: ACTIVE
Last updated: 2026-09-14

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

- D023 APPROVED el 2026-09-14: precisión y materialización monetaria en los casos acordados, con PM-01–PM-09 en el plan.
- D024 APPROVED el 2026-09-14: AC-084 corregido editorialmente; SPEC conserva APPROVED v0.1, D022 e historial.
- D025 APPROVED el 2026-09-14: política de acceso/recuperación del único Administrador; capacidades y ensayos aún pendientes.

## In Progress

- Fase 07 — Plan: specs/001-core-crm/plan.md DRAFT v0.2 / IN PROGRESS, completo para revisión humana y NOT APPROVED.
- Preparación y publicación de v0.2 autorizadas expresamente el 2026-09-14 sobre la revisión 5531f69284ae38eea22d54f0b506ddc3a37ee83d, sin trabajo posterior encontrado.
- Las nueve PLAN-DEC siguen PROPOSED; D023/D025 aprueban únicamente las políticas concretas indicadas y D024 la corrección editorial.
- tasks.md e implementación — no iniciados; tasks.md conserva su placeholder sin cambios.

## Pending

- Revisión y aprobación humana del plan v0.2; autorización posterior antes de abrir tasks.md.
- PLAN-PENDING-001 RESOLVED por D024; PLAN-PENDING-002 RESOLVED en alcance D023.
- PLAN-PENDING-003 PARTIALLY RESOLVED: política D025 acordada; falta verificar capacidad/coste, revocación efectiva, uso del CRM, acceso desde otro dispositivo y recuperación. Quedan por concretar alcance de inactividad entre dispositivos y recuperación de contraseña cuando no esté disponible en el gestor.
- PLAN-PENDING-004 PENDING: casos materiales fuera de D023, incluidos negativos nuevos no inversos y otros puntos/repartos de céntimos sin regla aprobada.
- PLAN-AUTH-001–PLAN-AUTH-006 PENDING / NO EJECUTADAS, con bloqueo antes de acceso real.
- ARCH-PENDING-001/002 y demás pendientes heredados conservan sus ámbitos.

## Current Blockers

- El plan permanece NOT APPROVED. Los antiguos bloqueos de PLAN-PENDING-001/002 se levantan solo en lo resuelto. PLAN-PENDING-003 bloquea cualquier acceso real y preparación de Production H6; PLAN-PENDING-004 bloquea únicamente los cálculos materiales no cubiertos. No bloquean esta entrega DRAFT.
- ARCH-PENDING-001 activo y PENDING: Proveedor(es) definitivos de Telefonía IA y WhatsApp; bloquea únicamente la selección o implementación dependiente. Pueden ser comunes o diferentes; comparar ElevenLabs y al menos una alternativa real para Telefonía IA y analizar capacidades/proveedor de WhatsApp por separado; origen BR-PENDING-001/035 y D014.
- ARCH-PENDING-002 activo y PENDING: bloquea únicamente la aceptación o configuración definitiva de recuperación y continuidad de Production; origen ARCH-PENDING-002.
- No queda ningún SM-PENDING activo.
- Los demás pendientes heredados siguen vigentes en sus ámbitos. El alcance V1 de BR-PENDING-027 / DM-PENDING-001 queda concretado por D018, el de BR-PENDING-023 / DM-PENDING-003 por D019 y el de BR-PENDING-036 / DM-PENDING-004 por D020, sin habilitar operaciones extraordinarias ni alterar políticas aprobadas.

## Last Approved Commit

- 91fc7527af9fd529e475116d1d212fd2328994d9 — docs: approve spec 001 core crm v0.1

## Notes

docs/product.md y docs/business-rules.md v0.2 continúan APPROVED. docs/domain-model.md v0.1 continúa APPROVED; no se modifica su contenido ni su aprobación.

docs/state-machines.md v0.1 está APPROVED por revisión humana de 2026-09-09. La aprobación incluye expresamente D018, D019 y D020 y las resoluciones históricas de SM-PENDING-001/002/003. D018 permite aceptación parcial seleccionable y reserva directa trazable, manteniendo una Booking por Opportunity aceptada en V1. D019 fija las bases económicas reproducibles para promociones y cancelaciones. D020 calcula los umbrales por fechas/días naturales, concede completo el último día, fija las referencias por alcance y excluye cortes basados en la hora del servicio.

La fase Architecture v0.1 está completada y APPROVED por revisión humana de 2026-09-10, con sus 18 ARCH-DEC. SPEC 001 v0.1 permanece APPROVED / COMPLETED por D022 y el commit 91fc7527af9fd529e475116d1d212fd2328994d9. La autorización posterior de 2026-09-11 inició el plan documental, publicado como v0.1 en 5531f69284ae38eea22d54f0b506ddc3a37ee83d. La instrucción de 2026-09-14 autoriza esta revisión v0.2 y las decisiones parciales D023–D025; no aprueba el plan ni las nueve PLAN-DEC.

La única corrección en SPEC es AC-084 y su referencia editorial/fecha de actualización; su versión y aprobación histórica se conservan. Los otros 91 AC, los 116 FR y los 15 NFR siguen intactos. D001–D022, Constitution, Product, Business Rules, Domain Model, State Machines y Architecture permanecen sin cambios. Los antecedentes BR-PENDING-023/027/036 y DM-PENDING-001/003/004 conservan la interpretación D018–D020 y sus resoluciones históricas; no queda ningún SM-PENDING activo.

El plan conserva H0–H6 NOT STARTED y cobertura de 116 FR, 15 NFR, 92 AC, 52 DM-INV, 148 transiciones, 33 SM-FORB, 18 ARCH-DEC y P01–P20. D023–D025 añaden trazabilidad y oráculos de cálculo/verificación de acceso. Los ejemplos y la cobertura se han revisado documentalmente, sin ejecutar pruebas de aplicación, Auth o recuperación. La inactividad nativa por refresh no acredita uso humano del CRM; los controles propuestos no están configurados.

Last Approved Commit conserva por ahora el último SHA registrado; el commit que incorpora D023–D025 se registrará en un segundo commit de coordinación. Ese registro acredita decisiones parciales, nunca aprobación global del plan. No se crean SPEC-PENDING nuevos, no se inicia tasks.md, implementación, código, configuración, migraciones, infraestructura ni despliegues.

Este archivo debe actualizarse al finalizar cada fase relevante del proyecto.
