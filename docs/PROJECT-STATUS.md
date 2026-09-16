# CRM HUESCAVENTURA OS — Project Status

Status: ACTIVE
Last updated: 2026-09-17

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

- D026 APPROVED: Inactividad independiente por sesión/dispositivo.
- D027 APPROVED: Recuperación de contraseña por email verificado.
- D028 APPROVED: Redondeo simétrico de nuevos importes negativos.
- D029 APPROVED: Repartos deterministas de céntimos.
- D030 APPROVED: Semántica visual para futura Spec de interfaz.
- D031 APPROVED: Recuperación extrema desde la cuenta propietaria de Supabase.
- D032 APPROVED: Aprobación técnica de PLAN-DEC-001 a PLAN-DEC-009.
- D033 APPROVED: Dirección web prevista del CRM.
- D034 APPROVED: Plan SPEC 001 Core CRM v0.3 aprobado formalmente tras la revisión final de e902220b96a7df36454a984531c27c2f14d14529.
- Fase 07 — Plan completada: specs/001-core-crm/plan.md v0.3 APPROVED / COMPLETED, Ready for tasks.md: YES.
- D036 APPROVED: Tasks SPEC 001 Core CRM v0.1 aprobada formalmente sobre 04a98a81720dd02892b12c67fbcede69e5ae7787 y f267e2c02d3c920dc385a73a6a0cc0f0e8c6dc5f.
- D037 APPROVED el 2026-09-16: aprobación del diseño F1; PR-F-01 CLOSED técnicamente. Autorizaciones separadas permitieron implementación y posterior reverificación formal local, sin modificar la decisión.
- H0-008-F01: CLOSED el 2026-09-17. F1 IMPLEMENTED AND FORMALLY VERIFIED LOCALLY sobre c208b9fb45bf337a62c5b518d86d9b42db267949; [evidencia formal](../specs/001-core-crm/evidence-TSK-H0-008.md#8-formal-reverification--2026-09-16), 84 resultados PASS (83 casos + 1 contenedor), sin cambios productivos durante reverificación.
- Fase 08 — Tasks completada documentalmente: specs/001-core-crm/tasks.md v0.1 APPROVED / COMPLETED. Al cierre de esa fase las 125 tareas permanecían NOT STARTED.
- TSK-H0-001 — Comprobar compatibilidad, recursos y coste de acceso: COMPLETED en su alcance de preparación el 2026-09-15, con evidencia documental/local, versiones propuestas, recursos separados y coste base calculado. No acredita configuración ni acceso real.
- TSK-H0-002 — Delimitar contratos, cambios y evidencia de H0: COMPLETED exclusivamente en preparación el 2026-09-15. Módulos, rutas futuras, C01–C06, T01–T11, migraciones, identidades, datos sintéticos, fallos y V-EVI quedan delimitados sin implementar código ni infraestructura.
- TSK-H0-003 — Componer servidor modular y resultados C01–C06: COMPLETED en su alcance de implementación el 2026-09-15. Base Node/Next.js/TypeScript fijada, C01–C06, G1–G6, E1–E8, frontera servidor, configuración, diagnóstico e imports implementados; comprobaciones de ingeniería PASS.
- TSK-H0-004 — Verificar: Componer servidor modular y resultados C01–C06: COMPLETED en su alcance de comprobación normativa formal el 2026-09-15. C01–C06, G1–G6, E1–E8, entrada/origen/replay/contexto, configuración, transporte, canarios y fronteras positivas/negativas PASS; 27/27 tests, typecheck, audit y build PASS. Se corrigieron seis defectos menores del alcance. No acredita Auth, persistencia/atomicidad real ni proveedor.
- TSK-H0-007 — Separar rol ordinario, migración y contexto transaccional: COMPLETED histórico de implementación el 2026-09-15. La verificación posterior detectó H0-008-F01; la corrección F1 y reverificación H0-008 cerraron ese defecto el 2026-09-17 en alcance local. PLAN-AUTH-006 sigue PENDING globalmente.
- TSK-H0-008 — Verificar separación de roles/contexto: COMPLETED en reverificación formal local el 2026-09-17. Se conserva el antecedente FAILED del 2026-09-16 por GUC autodeclarado; el ataque original ahora se deniega, con roles/grants/RLS, capability, C01/C03, migraciones, canarios y regresiones verificados. No acredita hosted/Auth ni resuelve PLAN-AUTH-006 globalmente.

## In Progress

- Implementación y H0: IN PROGRESS, sin nueva tarea autorizada. TSK-H0-001/002/003/004/007/008 COMPLETED en sus alcances; TSK-H0-005/006/009/010 y posteriores permanecen NOT STARTED. H0 no está completado por cerrar H0-008.
- H1–H6: NOT STARTED. Pruebas funcionales, Auth, datos y recuperación: NO EJECUTADAS.
- PLAN-AUTH-001 queda acreditado solo documentalmente en compatibilidad, recursos y coste calculado; configuración, capacidad/entrega real, ensayos y aceptación de coste siguen PENDING.

## Pending

- Nueva instrucción humana delimitada necesaria para TSK-H0-009, siguiente bloque por dependencia de H0-008 ya satisfecha; no se inicia. TSK-H0-005/006/010 y posteriores tampoco están autorizadas. Hosted/PLAN-AUTH-006 requiere autorización específica antes de depender de esas capacidades.
- PLAN-PENDING-001 RESOLVED por D024; PLAN-PENDING-002 RESOLVED en alcance D023.
- PLAN-PENDING-003 PARTIALLY RESOLVED: política completa D025/D026/D027/D031; solo verificaciones técnicas de capacidad/coste, uso humano por sesión, revocación efectiva, entrega de recuperación y ensayos de dispositivos/papel/break-glass antes de acceso real y H6.
- PLAN-PENDING-004 RESOLVED por D028/D029 para negativos y repartos; pruebas de implementación pendientes.
- PLAN-AUTH-001–PLAN-AUTH-006 PENDING / NO EJECUTADAS, con bloqueo antes de acceso real.
- ARCH-PENDING-001/002 y demás pendientes heredados conservan sus ámbitos.

- D030: principio visual APPROVED pendiente de incorporar a futura Spec de interfaz, fuera del Core y sin iniciar UI.
- D033: crm.huescaventura.com previsto, separado de la web pública; sin DNS, proyectos o despliegues configurados.

## Current Blockers

- H0-008-F01 CLOSED localmente: deja de bloquear la dependencia H0-008 → H0-009. El cierre no autoriza avanzar ni levanta pendientes de acceso real/hosted.
- PLAN-PENDING-003 bloquea únicamente el acceso real y la preparación de Production H6 por verificaciones técnicas no ejecutadas; PLAN-PENDING-001/002/004 permanecen resueltos en su alcance. No bloquea las fases documentales 07/08 completadas.
- ARCH-PENDING-001 activo y PENDING: Proveedor(es) definitivos de Telefonía IA y WhatsApp; bloquea únicamente la selección o implementación dependiente. Pueden ser comunes o diferentes; comparar ElevenLabs y al menos una alternativa real para Telefonía IA y analizar capacidades/proveedor de WhatsApp por separado; origen BR-PENDING-001/035 y D014.
- ARCH-PENDING-002 activo y PENDING: bloquea únicamente la aceptación o configuración definitiva de recuperación y continuidad de Production; origen ARCH-PENDING-002.
- No queda ningún SM-PENDING activo.
- Los demás pendientes heredados siguen vigentes en sus ámbitos. El alcance V1 de BR-PENDING-027 / DM-PENDING-001 queda concretado por D018, el de BR-PENDING-023 / DM-PENDING-003 por D019 y el de BR-PENDING-036 / DM-PENDING-004 por D020, sin habilitar operaciones extraordinarias ni alterar políticas aprobadas.

## Last Approved Commit

- `da7b71a3f2962093b7422899ab2193f29ae3c4e0` — `docs(h0): approve D037 transaction capability design`. Se explicita la referencia anterior al mismo commit de aprobación D037; el commit correctivo de implementación no sustituye este Last Approved Commit.

## Notes

docs/product.md y docs/business-rules.md v0.2 continúan APPROVED. docs/domain-model.md v0.1 continúa APPROVED; no se modifica su contenido ni su aprobación.

docs/state-machines.md v0.1 está APPROVED por revisión humana de 2026-09-09. La aprobación incluye expresamente D018, D019 y D020 y las resoluciones históricas de SM-PENDING-001/002/003. D018 permite aceptación parcial seleccionable y reserva directa trazable, manteniendo una Booking por Opportunity aceptada en V1. D019 fija las bases económicas reproducibles para promociones y cancelaciones. D020 calcula los umbrales por fechas/días naturales, concede completo el último día, fija las referencias por alcance y excluye cortes basados en la hora del servicio.

La fase Architecture v0.1 está completada y APPROVED por revisión humana de 2026-09-10, con sus 18 ARCH-DEC. SPEC 001 v0.1 permanece APPROVED / COMPLETED por D022 y el commit 91fc7527af9fd529e475116d1d212fd2328994d9. La autorización posterior de 2026-09-11 inició el plan documental, publicado como v0.1 en 5531f69284ae38eea22d54f0b506ddc3a37ee83d. D023–D033 y las nueve PLAN-DEC permanecen APPROVED. D034 aprueba formalmente el Plan SPEC 001 Core CRM v0.3 y cierra la fase 07 tras revisar e902220b96a7df36454a984531c27c2f14d14529.

En v0.2, la única corrección en SPEC fue AC-084 y su referencia editorial/fecha de actualización; su versión y aprobación histórica se conservan. Los otros 91 AC, los 116 FR y los 15 NFR siguen intactos. En v0.3, D001–D025, SPEC, Constitution, Product, Business Rules, Domain Model, State Machines y Architecture permanecen sin cambios. Los antecedentes BR-PENDING-023/027/036 y DM-PENDING-001/003/004 conservan la interpretación D018–D020 y sus resoluciones históricas; no queda ningún SM-PENDING activo.

El plan conserva H0–H6 NOT STARTED y cobertura de 116 FR, 15 NFR, 92 AC, 52 DM-INV, 148 transiciones, 33 SM-FORB, 18 ARCH-DEC y P01–P20. D023–D034 añaden trazabilidad, decisiones y oráculos de cálculo/verificación de acceso. Los ejemplos y la cobertura se han revisado documentalmente, sin ejecutar pruebas de aplicación, Auth o recuperación. La inactividad nativa por refresh no acredita uso humano del CRM; los controles propuestos no están configurados.

El cierre de fase 07 registró mediante su segundo commit de coordinación el SHA de aprobación D034. La aprobación histórica de SPEC 001 sigue identificada por 91fc7527af9fd529e475116d1d212fd2328994d9. D035 conserva la autorización histórica de preparación/publicación de Tasks y D036 aprueba su contenido y cierra la fase 08 documental. No se crean SPEC-PENDING nuevos ni se inicia implementación, código, configuración, migraciones, infraestructura o despliegues.

## Registro de Tasks

- Autorización documental: D035, 2026-09-15; no aprobación de Tasks.
- Base: 6d00821ddfab50b241c4dea086af1eb79bfdad90.
- Commit del borrador: 04a98a81720dd02892b12c67fbcede69e5ae7787 — docs: draft tasks spec 001 v0.1. DRAFT / NOT APPROVED; no es un commit de aprobación.
- Coordinación revisada del borrador: f267e2c02d3c920dc385a73a6a0cc0f0e8c6dc5f.
- Aprobación formal: D036, 2026-09-15; fase documental COMPLETED.
- Documento: [Tasks SPEC 001](../specs/001-core-crm/tasks.md), v0.1 APPROVED / COMPLETED.
- Inventario: 125 tareas — H0 18, H1 19, H2 12, H3 15, H4 24, H5 19, H6 18.
- Revisión documental: 618 correspondencias individuales de origen a desarrollo/verificación; IDs y dependencias contrastados, sin ciclos ni dependencias de hito posterior. Incluye 148 transiciones con guardas y 33 prohibiciones con casos negativos. No acredita pruebas del CRM.
- Alcance: solo Tasks y coordinación; D001–D035 y fuentes aprobadas intactas. Last Approved Commit se actualiza al commit de aprobación de Tasks mediante el segundo commit de coordinación.
- Estado actual: TSK-H0-001/002 COMPLETED en preparación, TSK-H0-003/007 COMPLETED en implementación y TSK-H0-004/008 COMPLETED en verificación formal local. H0 continúa incompleto; TSK-H0-005/006/009/010 y posteriores permanecen NOT STARTED. H0-007 conserva su ejecución histórica. No se acreditan Auth/recuperación, pooler hosted, historia/idempotencia/intención durable ni proveedor.

Este archivo debe actualizarse al finalizar cada fase relevante del proyecto.
